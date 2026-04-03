const DEFAULT_API_BASE_URL = "http://localhost:8787";

export function getApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL;
}

async function request(path, options) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    headers: { "content-type": "application/json", ...(options?.headers || {}) },
    ...options
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const message = json?.error || `Request failed (${res.status})`;
    throw new Error(message);
  }
  return json;
}

export function fetchClasses() {
  return request("/api/classes");
}

export function fetchMemberships() {
  return request("/api/memberships");
}

export function submitContact(payload) {
  return request("/api/contact", { method: "POST", body: JSON.stringify(payload) });
}

