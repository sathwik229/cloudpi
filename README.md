# CloudPi

Marketing site + lead-capture API, split into two independent apps.

```
.
├── frontend/   # static site (HTML/CSS/JS) — premium CloudPi landing pages
└── backend/    # Node + Express API (Request a Demo) with production security
```

## Quick start

### Option A — one origin (recommended)
The backend serves the site and the API together, so the demo form works end-to-end.

```bash
cd backend
cp .env.example .env      # Windows: copy .env.example .env
npm install
npm run dev
# → http://localhost:5000
```

### Option B — frontend only (static preview, no form backend)
```bash
cd frontend
python -m http.server 8000
# → http://localhost:8000   (the demo form will report the API is unreachable)
```

If you run them separately, add the frontend origin to `backend/.env`
`CORS_ORIGINS` and set `window.CLOUDPI_API_BASE` on the page to the backend URL.

See **backend/README.md** for endpoints and the security model.
