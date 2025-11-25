# Frontend (AR Art Gallery)

Scaffolding React + TypeScript + Vite for the AR Art Gallery.

Quick start:

```powershell
cd frontend
npm install
npm run dev
```

Environment:
- VITE_API_URL: base URL to gateway (default `http://localhost:3000`)

Pages:
- `/` search
- `/artworks/:id` detail (supports `<model-viewer>` for .glb)
- `/favorites` user's favorites

Notes:
- The app expects endpoints on the gateway: `/composition/*` and `/users/*` as used in the API wrapper.
