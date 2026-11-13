# CLIP AI EDIT — Phase 1

Premium AI video repurposing platform foundation.

## Stack
- Frontend: React, TypeScript, Vite, CSS
- Backend: Node.js, Express, TypeScript
- Hosting: Cloudflare Pages (frontend), Render (backend)
- Phase 1: dashboard, local browser video preview, upload API, project/job foundation, health endpoint

## Requirements
Node.js 20+ and npm.

## Install
```bash
npm install
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
npm run dev
```
Frontend: http://localhost:5173  
Backend: http://localhost:4000/api/health

## Notes on uploads
Phase 1 stores uploaded files on the backend filesystem. Render's default filesystem is ephemeral: uploaded files may be lost when the service restarts or redeploys. Configure a Render persistent disk or integrate Cloudflare R2 before relying on permanent video storage. Do not upload private or copyrighted videos without authorization.

## Cloudflare Pages deployment
1. Push this repository to GitHub.
2. In Cloudflare Dashboard, create a Pages project and connect the repository.
3. Root directory: `frontend`
4. Build command: `npm run build`
5. Build output directory: `dist`
6. Environment variable: `VITE_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com/api`

## Render backend deployment
1. Create a Render Web Service connected to the same GitHub repository.
2. Root directory: leave blank (repository root).
3. Build command: `npm install && npm run build --workspace backend`
4. Start command: `npm run start --workspace backend`
5. Add environment variables:
   - `NODE_ENV=production`
   - `PORT=10000`
   - `FRONTEND_ORIGIN=https://YOUR-CLOUDFLARE-PAGES-DOMAIN.pages.dev`
   - `MAX_UPLOAD_MB=500`
6. Add a persistent disk mounted at `/var/data` if you need uploads to survive deploys, and set `UPLOAD_DIR=/var/data/uploads`.

## Phase 1 limitations
AI highlight detection, speech transcription, subtitle generation, timeline editing, cloud video storage and export rendering are not yet implemented. They are planned phases, not simulated features.
