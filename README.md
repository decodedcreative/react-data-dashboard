# React Data Dashboard

React + TypeScript + **Next.js** (App Router) for a data-heavy trading-style dashboard ([TanStack Query](https://tanstack.com/query), TanStack Table planned, etc.).

## Development

- Install dependencies: `npm install`
- Local dev: `npm run dev`
- Production build: `npm run build` then `npm start`
- Copy env template: `cp .env.example .env.local`

## Deployment (Vercel)

- Vercel project configuration: `vercel.json`
- Environment variable template: `.env.example`
- Environment variable strategy: `docs/environment-variables.md`
- Full setup runbook (production/staging/PR previews): `docs/vercel-deployment.md`
- CI guard for deployment contract: `npm run verify:vercel-config`

### Hosting URLs

| Environment | URL                                        |
| ----------- | ------------------------------------------ |
| Production  | https://rddb.decodedcreative.co.uk         |
| Staging     | https://staging-rddb.decodedcreative.co.uk |
| PR previews | Posted as a PR comment by the CI workflow  |

### Branching strategy

| Branch      | Purpose                                                                            |
| ----------- | ---------------------------------------------------------------------------------- |
| `main`      | Production — every merge triggers a production deploy                              |
| `staging`   | Stable staging — every merge triggers a staging deploy                             |
| `feature/*` | Feature work — open a PR to `main` or `staging` to trigger CI and a preview deploy |

PRs to `main` can be opened directly from a feature branch. The `staging` branch exists for pre-production soak testing and is optional for day-to-day work on this project.

### Deployment flow

All deployments are gated through GitHub Actions. Vercel's automatic Git integration is disconnected — nothing reaches Vercel without passing CI first.

```
feature branch → PR → lint + typecheck + unit tests + build + e2e → preview deploy
                       ↓ merge to staging
              validate (same steps) → staging deploy (staging-rddb.decodedcreative.co.uk)
                       ↓ merge to main
              validate (same steps) → production deploy (rddb.decodedcreative.co.uk)
```

### Required secrets

These must be set in **GitHub → repo Settings → Secrets → Actions**:

| Secret                    | Required | Purpose                                                    |
| ------------------------- | -------- | ---------------------------------------------------------- |
| `VERCEL_TOKEN`            | Yes      | Authenticates the Vercel CLI in CI                         |
| `VERCEL_ORG_ID`           | Yes      | Identifies the Vercel team                                 |
| `VERCEL_PROJECT_ID`       | Yes      | Identifies the Vercel project                              |
| `CHROMATIC_PROJECT_TOKEN` | No       | Publishes visual snapshots to Chromatic (skipped if unset) |

### Local Postgres (Docker Compose)

Two separate Postgres containers run side by side so e2e tests can wipe-and-reseed their DB without touching real data you've synced via `npm run sync:trades`. CI uses a single Postgres service and points both URLs at it (no dev data to preserve).

| Container        | Port   | Purpose                                                                                          |
| ---------------- | ------ | ------------------------------------------------------------------------------------------------ |
| `postgres` (dev) | `5433` | Used by `npm run dev` and `npm run sync:trades` — owns your synced Alpaca data                   |
| `postgres-test`  | `5434` | Used by `npm run test:e2e` — Playwright's `global-setup.ts` wipes and re-seeds this on every run |

- Start both: `docker compose up -d`
- Start one: `docker compose up -d postgres` or `docker compose up -d postgres-test`
- Stop: `docker compose stop`
- Reset all volumes: `docker compose down -v` (warning: removes all project volumes)
- Inspect: `docker compose ps`, `docker compose logs -f postgres`

Connection strings:

- Dev: `postgresql://postgres:postgres@127.0.0.1:5433/react_data_dashboard?schema=public`
- Test: `postgresql://postgres:postgres@127.0.0.1:5434/react_data_dashboard?schema=public`

### Prisma basics

- Generate client from schema: `npm run db:generate`
- Apply migrations to dev DB: `npm run db:migrate`
- Apply migrations to test DB: `npm run db:migrate:test`
- Sync real trades from Alpaca paper: `npm run sync:trades` (see [docs/data-sync.md](docs/data-sync.md))
- Open Prisma Studio (dev DB): `npm run db:studio`

> Test fixtures (`TRD-001` / `TRD-002`) live in `e2e/fixtures/test-trades.ts` and are inserted into the test DB automatically by `e2e/global-setup.ts` before every e2e run. There is no longer a `db:seed` script — for real local data, run `sync:trades`.

### Architecture notes

- **Server reads:** server components call feature server modules directly (for example, `src/features/trades/server/trades.db.ts`) instead of making internal HTTP calls.
- **Client reads:** client components use React Query + feature query functions (for example, `src/features/trades/client/trades.queries.ts`) which fetch from `app/api/*` route handlers.
- **Route handlers:** `src/app/api/*/route.ts` files are thin HTTP boundaries that delegate to feature server logic and map domain outcomes to HTTP responses.

## Testing

- Watch mode: `npm test`
- Single run (CI / verification): `npm run test:run`

Tests use [Vitest](https://vitest.dev) with a `jsdom` environment, [Testing Library](https://testing-library.com) for components, and [jest-dom](https://github.com/testing-library/jest-dom) in `vitest.setup.ts`. Vitest is wired via `vitest.config.ts` (Vite is only used as the test runner’s bundler).

### E2E Testing (Playwright)

- Install browsers locally: `npm run test:e2e:install`
- Headless E2E run: `npm run test:e2e`
- Headed debugging run: `npm run test:e2e:headed`
- Playwright UI mode: `npm run test:e2e:ui`

Playwright uses `playwright.config.ts` and runs tests from `e2e/`. By default it starts the Next.js app via `npm run dev`, runs Chromium, and records traces/screenshots/videos on failures or retries.

In CI, browser setup runs `npm run test:e2e:install:ci` (system deps via `--with-deps`) before `npm run test:e2e`. Locally, `npm run test:e2e:install` installs Chromium only (no `--with-deps`).

### Chromatic visual capture (Playwright)

This project does **not** use Storybook; visual regression is **Playwright-only** via Chromatic’s E2E flow.

E2E fixtures use `@chromatic-com/playwright` so Chromatic captures an archive for each Chromium test ([Playwright integration](https://www.chromatic.com/docs/playwright/)). Locally, plain `npm run test:e2e` still verifies behavior.

To publish snapshots for review in Chromatic, add a Chromatic project token and run locally:

- `npm run chromatic:e2e` (or `CHROMATIC_PROJECT_TOKEN=… npx chromatic --playwright`)

GitHub Actions uses **`npm run chromatic:e2e:ci`** (`--exit-zero-on-changes`) after `e2e` uploads `./test-results`, so uploads succeed while Chromatic manages review state separately.

### GitHub merge gate (recommended)

Branch protection intentionally does **not** require **`CI / chromatic-e2e`** (that job uploads archives and exits green when using `chromatic:e2e:ci`). **Blocking merges until visuals are reviewed** relies on Chromatic’s own GitHub App check—you must enable and require it.

1. In Chromatic: turn on **[GitHub integration](https://www.chromatic.com/docs/github-actions)** for this repo so Chromatic publishes the **UI/visual check** on PRs ([Chromatic CI](https://www.chromatic.com/docs/ci)).
2. In GitHub: **Settings → Branches → Branch protection rules** for `main`, under **Require status checks**, add **the Chromatic check** whose exact name appears on a PR after the first Chromatic build (distinct from **`CI / chromatic-e2e`**).
3. After that you can approve or reject snapshots in Chromatic ([UI Tests / UI Review](https://www.chromatic.com/docs/in-pull-request)); the Chromatic check updates **without rerunning Actions**.

## Formatting

[Prettier](https://prettier.io) is configured in `.prettierrc` with [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) so ESLint does not re-enforce style rules that Prettier owns.

- Write formatting: `npm run format`
- Check only (e.g. CI): `npm run format:check`

In VS Code or Cursor, set **Prettier** as the default formatter for TypeScript/JSON if you want format-on-save; the repo ignores `package-lock.json`, `.next`, and build output in `.prettierignore`.

## Quality checks

- **All in one (serial):** `npm run verify` — runs **ESLint**, then **TypeScript** (`tsc --noEmit`), then **Vitest** (`test:run`).
- **TypeScript only:** `npm run typecheck`.

## Git hooks ([Husky](https://github.com/typicode/husky))

After `npm install`, the **`prepare`** script installs hooks from `.husky/`.

| Hook           | What runs                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **pre-commit** | [lint-staged](https://github.com/lint-staged/lint-staged): **Prettier** then **ESLint** on staged `*.{ts,tsx}`; **Prettier** on staged `*.{json,md}`. |
| **pre-push**   | `npm run verify` (lint + typecheck + tests).                                                                                                          |

To skip hooks in an emergency only: `git commit --no-verify` or `git push --no-verify`. Prefer fixing the underlying issue instead of bypassing checks.

## Troubleshooting

**`DATABASE_URL environment variable is not set`**
You haven't created `.env.local` yet, or it's missing `DATABASE_URL`. Run `cp .env.example .env.local` and make sure the file is populated.

**`docker compose up -d` fails / Postgres won't start**
Another process is likely using port 5433. Run `lsof -i :5433` to identify it. Alternatively, change the host port in `docker-compose.yml` and update `DATABASE_URL` in `.env.local` to match.

**`prisma migrate deploy` fails with connection error**
The Postgres container isn't running. Run `docker compose up -d postgres` first.

**`Error: P1001` (Prisma can't reach database)**
Check `DATABASE_URL` in `.env.local` matches the Docker Compose service — host should be `127.0.0.1`, port `5433`.

**Playwright e2e tests fail locally with "browser not found"**
Run `npm run test:e2e:install` to install the Chromium binary.

**Port 3000 already in use**
Set `PORT=3001` (or any free port) in `.env.local` and update `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3001` to match.

**CI deploy step fails with "Missing required secret"**
One of `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID` is not set in GitHub Actions secrets. See the Required secrets section above.

**Vercel deploy succeeds but app can't connect to the database**
`DATABASE_URL` is missing or misconfigured for that Vercel environment. Check Project Settings → Environment Variables in Vercel and confirm the correct target (Production / Preview / branch filter) is set. See `docs/vercel-deployment.md`.
