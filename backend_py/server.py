import json
import os
import re
import secrets
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer


EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _split_csv(value: str) -> list[str]:
    return [part.strip() for part in value.split(",") if part.strip()]


def _json_response(handler: BaseHTTPRequestHandler, status: int, payload: dict, origin: str | None) -> None:
    body = json.dumps(payload).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.send_header("Cache-Control", "no-store")
    if origin:
        handler.send_header("Access-Control-Allow-Origin", origin)
        handler.send_header("Vary", "Origin")
    handler.end_headers()
    handler.wfile.write(body)


class Handler(BaseHTTPRequestHandler):
    server_version = "GymWebsiteBackend/0.1"

    def _get_allowed_origin(self) -> str | None:
        request_origin = self.headers.get("Origin")
        allowed = getattr(self.server, "allowed_origins", [])
        if not request_origin:
            return None
        if not allowed:
            return request_origin
        return request_origin if request_origin in allowed else None

    def _cors_preflight(self) -> None:
        origin = self._get_allowed_origin()
        if self.headers.get("Origin") and not origin:
            return _json_response(self, 403, {"ok": False, "error": "Origin not allowed"}, None)

        self.send_response(204)
        if origin:
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")
        self.send_header("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Max-Age", "600")
        self.end_headers()

    def do_OPTIONS(self) -> None:  # noqa: N802
        self._cors_preflight()

    def do_GET(self) -> None:  # noqa: N802
        origin = self._get_allowed_origin()
        if self.headers.get("Origin") and not origin:
            return _json_response(self, 403, {"ok": False, "error": "Origin not allowed"}, None)

        if self.path == "/health":
            return _json_response(self, 200, {"ok": True, "service": "gymwebsite-backend-py"}, origin)

        if self.path == "/api/classes":
            return _json_response(
                self,
                200,
                {
                    "classes": [
                        {"id": "strength", "name": "Strength Training", "durationMinutes": 60, "level": "All"},
                        {"id": "hiit", "name": "HIIT", "durationMinutes": 45, "level": "Intermediate"},
                        {"id": "yoga", "name": "Yoga", "durationMinutes": 60, "level": "All"},
                    ]
                },
                origin,
            )

        if self.path == "/api/memberships":
            return _json_response(
                self,
                200,
                {
                    "memberships": [
                        {"id": "basic", "name": "Basic", "priceMonthlyUsd": 29, "features": ["Gym access"]},
                        {"id": "plus", "name": "Plus", "priceMonthlyUsd": 49, "features": ["Gym access", "Classes"]},
                        {
                            "id": "pro",
                            "name": "Pro",
                            "priceMonthlyUsd": 79,
                            "features": ["Gym access", "Classes", "Personal training (1x/week)"],
                        },
                    ]
                },
                origin,
            )

        return _json_response(self, 404, {"ok": False, "error": "Not found"}, origin)

    def do_POST(self) -> None:  # noqa: N802
        origin = self._get_allowed_origin()
        if self.headers.get("Origin") and not origin:
            return _json_response(self, 403, {"ok": False, "error": "Origin not allowed"}, None)

        if self.path != "/api/contact":
            return _json_response(self, 404, {"ok": False, "error": "Not found"}, origin)

        try:
            length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            length = 0

        if length <= 0 or length > 100_000:
            return _json_response(self, 400, {"ok": False, "error": "Invalid body"}, origin)

        raw = self.rfile.read(length)
        try:
            body = json.loads(raw.decode("utf-8"))
        except Exception:
            return _json_response(self, 400, {"ok": False, "error": "Invalid JSON"}, origin)

        name = (body.get("name") or "").strip() if isinstance(body, dict) else ""
        email = (body.get("email") or "").strip() if isinstance(body, dict) else ""
        message = (body.get("message") or "").strip() if isinstance(body, dict) else ""

        if len(name) < 2 or len(name) > 80:
            return _json_response(self, 400, {"ok": False, "error": "Invalid name"}, origin)
        if not isinstance(email, str) or len(email) > 254 or not EMAIL_RE.match(email):
            return _json_response(self, 400, {"ok": False, "error": "Invalid email"}, origin)
        if len(message) < 5 or len(message) > 2000:
            return _json_response(self, 400, {"ok": False, "error": "Invalid message"}, origin)

        now = datetime.now(timezone.utc)
        entry = {
            "id": f"{int(now.timestamp() * 1000)}-{secrets.token_hex(4)}",
            "createdAt": now.isoformat().replace("+00:00", "Z"),
            "name": name,
            "email": email,
            "message": message,
            "userAgent": self.headers.get("User-Agent"),
        }

        data_dir = os.path.join(os.path.dirname(__file__), "data")
        os.makedirs(data_dir, exist_ok=True)
        out_file = os.path.join(data_dir, "contacts.jsonl")
        try:
            with open(out_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(entry) + "\n")
        except OSError:
            return _json_response(self, 500, {"ok": False, "error": "Failed to save message"}, origin)

        return _json_response(self, 201, {"ok": True, "id": entry["id"]}, origin)

    def log_message(self, format: str, *args) -> None:  # noqa: A003
        # Keep stdout clean by default; change if you want request logs.
        return


def main() -> None:
    port = int(os.getenv("PORT", "8787"))
    allowed_origins = _split_csv(os.getenv("ALLOWED_ORIGINS", ""))
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    server.allowed_origins = allowed_origins
    print(f"[backend_py] listening on http://localhost:{port}")
    if allowed_origins:
        print(f"[backend_py] allowed origins: {', '.join(allowed_origins)}")
    server.serve_forever()


if __name__ == "__main__":
    main()

