# React Data Dashboard

React + TypeScript + **Next.js** (App Router) for a data-heavy trading-style dashboard ([TanStack Query](https://tanstack.com/query), TanStack Table planned, etc.).

## Development

- Install dependencies: `npm install`
- Local dev: `npm run dev`
- Production build: `npm run build` then `npm start`

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

In CI, browser setup is performed with `npx playwright install --with-deps chromium` before running `npm run test:e2e`.

### Chromatic visual capture (Playwright)

This project does **not** use Storybook; visual regression is **Playwright-only** via Chromatic’s E2E flow.

E2E fixtures use `@chromatic-com/playwright` so Chromatic captures an archive for each Chromium test ([Playwright integration](https://www.chromatic.com/docs/playwright/)). Locally, plain `npm run test:e2e` still verifies behavior.

To publish snapshots for review in Chromatic, add a Chromatic project token and run:

- `npm run chromatic:e2e` (or `CHROMATIC_PROJECT_TOKEN=… npx chromatic --playwright`)

Mirror the existing `e2e` CI job whenever you automate this: checkout, `npm ci`, `npx playwright install --with-deps chromium`, then `npm run chromatic:e2e` with `CHROMATIC_PROJECT_TOKEN` provided as an encrypted repo secret ([Chromatic CI](https://www.chromatic.com/docs/ci)).

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
