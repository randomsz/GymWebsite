# GymWebsite server

Simple Node.js + Express API used by the React frontend (`client/`).

## Setup

From the repository root:

1. Install dependencies: `npm install`
2. Create env file: copy `.env.example` to `.env`

## Run

- Dev: `npm run dev:server`
- Health check: `curl http://localhost:8787/health`

## Endpoints

- `GET /health`
- `GET /api/classes`
- `GET /api/memberships`
- `POST /api/contact` JSON body:
  - `{ "name": "Jane", "email": "jane@example.com", "message": "Hi!" }`

Contact messages are appended to `server/data/contacts.jsonl` (JSON Lines).

