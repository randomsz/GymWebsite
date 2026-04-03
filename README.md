This project is an experiment generating a gym website using Codex.

## Stack / Structure

- React frontend: `client/` (Vite + React)
- Node.js API: `server/` (Express)
- Legacy Python API: `legacy/backend_py/` (optional, not used by default)

## Quickstart

1) Install dependencies (npm workspaces):

`npm install`

2) Run both client + server:

`npm run dev`

- React app: `http://localhost:5173`
- API health: `http://localhost:8787/health`

### Run individually

- Client only: `npm run dev:client`
- Server only: `npm run dev:server`

### Configure API base URL (client)

Set `VITE_API_BASE_URL` (defaults to `http://localhost:8787`).

