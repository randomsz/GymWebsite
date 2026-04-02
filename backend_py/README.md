# GymWebsite backend (Python, zero deps)

This is a tiny backend using only the Python standard library (no `pip install`).

## Run

From the repo root:

- `python backend_py/server.py`

It listens on `http://localhost:8787` by default.

## Environment variables

- `PORT` (default `8787`)
- `ALLOWED_ORIGINS` (comma-separated; default empty = allow all)

## Endpoints

- `GET /health`
- `GET /api/classes`
- `GET /api/memberships`
- `POST /api/contact` JSON body:
  - `{ "name": "Jane", "email": "jane@example.com", "message": "Hi!" }`

Contact messages are appended to `backend_py/data/contacts.jsonl` (JSON Lines).

