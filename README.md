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
