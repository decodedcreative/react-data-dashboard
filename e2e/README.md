# E2E Test Conventions

This project uses Playwright for user-facing end-to-end coverage.

`fixtures.ts` extends [`@chromatic-com/playwright`](https://www.chromatic.com/docs/playwright/), so Chromium tests record Chromatic-compatible archives automatically (each test snapshots at completion). Add `takeNamedChromaticSnapshot()` from `chromatic-helpers.ts` inline in the same spec as your behavior assertions when you want a named mid-flow capture (see Chromatic [`takeSnapshot`](https://www.chromatic.com/docs/playwright/targeted-snapshots)). There is no separate “visual only” suite—snapshots ride on the real tests.

## Structure

- `*.spec.ts` files define user behavior and assertions.
- `pages/*.page.ts` files define page/component objects with locators and user actions.
- `fixtures.ts` wires shared page objects into custom Playwright fixtures.

## Authoring Rules

- Keep assertions in test specs so expected behavior remains explicit.
- Keep page objects focused on:
  - stable locators
  - navigation helpers (`goto`)
  - user actions (`click`, `fill`, etc.)
- Avoid hiding assertions inside page object methods.
- Prefer resilient selectors (`getByRole`, visible text) over brittle CSS selectors.

## Examples

```ts
await homePage.goto();
await expect(homePage.heading).toBeVisible();
await homePage.viewTradesLink.click();
await expect(homePage.page).toHaveURL(/\/trades$/);
```

## Visual Snapshot Stability

Chromatic captures snapshot archives for every Playwright test, so non-determinism in the page (clock-driven content, animations, network jitter, font rendering) shows up as false-positive visual diffs on unrelated PRs. To keep snapshots stable, `e2e/visual-stability.ts` applies a suite of controls automatically to every test via the `stablePageSetup` auto fixture in `fixtures.ts`. Tests do not need to call any of this directly.

### What's controlled

- **Clock** — frozen to `FROZEN_NOW` (`2026-05-11T09:00:00Z`) via `page.clock.install({ time })` before navigation. Anything that calls `Date.now()` / `new Date()` in the browser sees this fixed time.
- **Data** — `/api/trades` and `/api/trades/*` are intercepted with `page.route()` and return values sourced from `e2e/fixtures/test-trades.ts`. The same fixture module is used by `global-setup.ts` to insert the rows into Postgres before tests run, so the DB-backed SSR render and the client-side mock can never drift apart. The trades pages are SSR — the server-side DB fetch is not intercepted, so the fixtures in `test-trades.ts` are the source of truth for the initial HTML.
- **Animations** — disabled globally (incl. AG Grid's `animateRows`) via CSS injected with `addInitScript` before the first paint.
- **Viewport / locale / timezone / colour scheme** — pinned in `playwright.config.ts` (`1280×720`, `en-GB`, `UTC`, `light`) to match the app's display locale and timezone.
- **Font rendering** — Chromium launched with `--font-render-hinting=none`, `--disable-font-subpixel-positioning`, `--disable-lcd-text` to reduce cross-platform variation. This mitigates but does not fully solve OS font differences between Linux CI and macOS dev; a bundled web font would be the complete fix.
- **Settled-page wait** — `waitForPageSettled()` is called inside every page-object `goto()`/navigation helper. It waits for `networkidle`, then the AG Grid root + first row when `{ hasGrid: true }`, then a 100ms buffer for paint settle.

### When adding a new page object

- Call `waitForPageSettled(this.page)` inside `goto()` and any navigation helper that lands on a new URL.
- Pass `{ hasGrid: true }` only for pages that render the trades grid.

### When adding a named snapshot

- Use `takeNamedChromaticSnapshot()` from `chromatic-helpers.ts`.
- Take it only after a navigation helper that includes `waitForPageSettled` (or call `waitForPageSettled` yourself first).

### When changing fixture data

- Edit `e2e/fixtures/test-trades.ts` — that one module feeds both the DB rows inserted by `global-setup.ts` and the route mocks in `visual-stability.ts`, so the two stay coupled by construction rather than convention.

### Validating stability

Re-run the e2e suite multiple times on the same commit and confirm Chromatic reports no diffs between runs. Persistent diffs on unchanged code usually mean a new animation, a non-frozen date, or new request the route mocks don't cover.

## Running E2E

- `npm run test:e2e` for headless runs
- `npm run test:e2e:headed` for local debugging
- `npm run test:e2e:ui` for Playwright UI mode
- `npm run chromatic:e2e` to run Playwright through Chromatic and upload builds (needs `CHROMATIC_PROJECT_TOKEN` or `-t`; see Chromatic docs)
- CI uses **`npm run chromatic:e2e:ci`** (`--exit-zero-on-changes`) so Chromatic’s GitHub check—not the Actions step—gates merge on snapshot approval ([Chromatic CI](https://www.chromatic.com/docs/ci)).
