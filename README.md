# React Data Dashboard

React + TypeScript + Vite app for a data-heavy trading-style dashboard (TanStack Query, TanStack Table, etc.).

## Testing

- Install dependencies: `npm install`
- Watch mode: `npm test`
- Single run (CI / verification): `npm run test:run`

Tests use [Vitest](https://vitest.dev) with a `jsdom` environment, [Testing Library](https://testing-library.com) for components, and a small [jest-dom](https://github.com/testing-library/jest-dom) setup in `vitest.setup.ts` at the repo root (next to `vite.config.ts`).

## Formatting

[Prettier](https://prettier.io) is configured in `.prettierrc` with [eslint-config-prettier](https://github.com/prettier/eslint-config-prettier) so ESLint does not re-enforce style rules that Prettier owns.

- Write formatting: `npm run format`
- Check only (e.g. CI): `npm run format:check`

In VS Code or Cursor, set **Prettier** as the default formatter for TypeScript/JSON if you want format-on-save; the repo ignores `package-lock.json` and build output in `.prettierignore`.

## Quality checks

- **All in one (serial):** `npm run verify` — runs **ESLint**, then **TypeScript** (`tsc -b --noEmit`), then **Vitest** (`test:run`).
- **TypeScript only:** `npm run typecheck` (no Vite bundle; use `npm run build` for a full production build).

## Git hooks ([Husky](https://github.com/typicode/husky))

After `npm install`, the **`prepare`** script installs hooks from `.husky/`.

| Hook           | What runs                                                                                                                                             |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| **pre-commit** | [lint-staged](https://github.com/lint-staged/lint-staged): **Prettier** then **ESLint** on staged `*.{ts,tsx}`; **Prettier** on staged `*.{json,md}`. |
| **pre-push**   | `npm run verify` (lint + typecheck + tests).                                                                                                          |

To skip hooks in an emergency only: `git commit --no-verify` or `git push --no-verify`. Prefer fixing the underlying issue instead of bypassing checks.

---

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x';
import reactDom from 'eslint-plugin-react-dom';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```
