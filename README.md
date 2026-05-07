# React Data Dashboard

React + TypeScript + **Next.js** (App Router) for a data-heavy trading-style dashboard ([TanStack Query](https://tanstack.com/query), TanStack Table planned, etc.).

## Development

- Install dependencies: `npm install`
- Local dev: `npm run dev`
- Production build: `npm run build` then `npm start`

### Local Postgres (Docker Compose)

- Start Postgres: `docker compose up -d postgres`
- Stop Postgres: `docker compose stop postgres`
- Reset database volume: `docker compose down -v` (warning: removes all project volumes, not just Postgres data)
- Inspect service status: `docker compose ps`
- Inspect logs: `docker compose logs -f postgres`

Local connection string:

`postgresql://postgres:postgres@127.0.0.1:5433/react_data_dashboard?schema=public`

### Prisma basics

- Generate client from schema: `npm run db:generate`
- Apply local migrations: `npm run db:migrate`
- Seed starter data: `npm run db:seed`
- Open Prisma Studio: `npm run db:studio`

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
