# CloudPi — Backend API

Node + Express service that serves the static `frontend/` and exposes a small,
hardened API for lead capture (the **Request a Demo** form).

## Run

```bash
cd backend
cp .env.example .env        # then edit values (Windows: copy .env.example .env)
npm install
npm run dev                 # or: npm start
```

Open **http://localhost:5000** — the backend serves the site **and** the API on the
same origin (so the form posts same-origin, no CORS needed).

## Endpoints

| Method | Path           | Purpose                                  |
|--------|----------------|------------------------------------------|
| GET    | `/api/health`  | Liveness/uptime check                    |
| POST   | `/api/leads`   | Submit a demo request (JSON)             |

`POST /api/leads` body:

```json
{ "fullName": "Jane Doe", "email": "jane@acme.com", "company": "Acme",
  "role": "FinOps", "annualSpend": "$1M – $5M", "interest": "Cost optimization",
  "source": "Referral", "message": "..." }
```

Leads are appended to `backend/data/leads.jsonl` and (if SMTP is configured)
emailed to `LEADS_NOTIFY_TO`.

## Security

- **Helmet** security headers + tuned **CSP** (allows Google Fonts, GSAP cdnjs,
  Simple Icons / jsDelivr logos, Google Maps iframe).
- **CORS** allow-list (`CORS_ORIGINS`); same-origin only by default.
- **Rate limiting** — global (300 / 15 min) + strict on submissions (5 / 10 min).
- **Validation + sanitization** of every field (`express-validator`), tight 16 kB body limit.
- **Spam honeypot** (`website` field) silently drops bots.
- **HPP** (param pollution), `x-powered-by` disabled, HSTS in production.
- Secrets only via `.env` (never committed); stack traces never leaked to clients.
- Graceful shutdown on SIGINT/SIGTERM.

## Production notes

- Put behind HTTPS (nginx/Render/Fly) and set `NODE_ENV=production`, `TRUST_PROXY=1`,
  and a real `CORS_ORIGINS`.
- For stricter CSP, replace `'unsafe-inline'` with nonces/hashes.
- Swap the JSONL store (`src/services/store.js`) for Postgres/Mongo when needed.
