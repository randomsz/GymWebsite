# GymWebsite backend

Simple Node.js + Express backend API for the static GymWebsite frontend.

## Setup

1. Install dependencies:
   - `cd backend`
   - `npm install`
2. Create env file:
   - copy `.env.example` to `.env`

## Run

- Dev: `npm run dev`
- Health check: `curl http://localhost:8787/health`

## Endpoints

- `GET /health`
- `GET /api/classes`
- `GET /api/memberships`
- `POST /api/contact` JSON body:
  - `{ "name": "Jane", "email": "jane@example.com", "message": "Hi!" }`

Contact messages are appended to `backend/data/contacts.jsonl` (JSON Lines).

