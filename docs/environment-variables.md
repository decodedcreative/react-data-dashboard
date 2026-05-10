# Environment Variable Strategy

This document describes how environment variables are defined, managed, and consumed across all environments in `react-data-dashboard`.

## Local development

Copy `.env.example` to `.env.local` before running the app locally:

```bash
cp .env.example .env.local
```

`.env.local` is gitignored and never committed. It is loaded automatically by Next.js. Do not put real credentials in `.env.example` — it is committed to the repository and serves as documentation only.

Start the local Postgres container before running the dev server:

```bash
docker compose up -d
npm run dev
```

## Variable reference

| Variable | Required | Environments | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | All | Postgres connection string |
| `PORT` | No | Local only | Dev server port (default: `3000`) |
| `PLAYWRIGHT_BASE_URL` | No | Local only | Base URL for Playwright e2e tests |
| `NODE_ENV` | Auto | All | Set automatically by Next.js (`development` / `test` / `production`) |

## Hosted environments

Hosted variables are managed in **Vercel → Project Settings → Environment Variables**. No secrets are stored in the repository.

### DATABASE_URL

| Vercel target | Branch filter | Points to |
|---|---|---|
| Production | — | Production Neon database |
| Preview | `staging` | Staging Neon database |
| Preview | *(default)* | Fallback Neon database for PR previews |

`PORT` and `PLAYWRIGHT_BASE_URL` are not needed in hosted environments — Next.js manages the port on Vercel and Playwright only runs in CI against a local server.

### Adding a new variable

1. Add it to `.env.example` with a comment describing its purpose, whether it is required, and its default value if optional.
2. Add it to `.env.local` locally with a real value.
3. Add it in Vercel for each target environment that needs it (Production, Preview/staging, Preview/default).
4. Update this document.

## Environment promotion path

```text
.env.local (local)
    ↓
Preview DATABASE_URL (PR previews → Vercel)
    ↓
staging DATABASE_URL (staging branch → Vercel)
    ↓
Production DATABASE_URL (main branch → Vercel)
```

Secrets never move between environments — each environment has its own credentials configured independently in Vercel.
