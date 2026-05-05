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

## Running E2E

- `npm run test:e2e` for headless runs
- `npm run test:e2e:headed` for local debugging
- `npm run test:e2e:ui` for Playwright UI mode
- `npm run chromatic:e2e` to run Playwright through Chromatic and upload builds (needs `CHROMATIC_PROJECT_TOKEN` or `-t`; see Chromatic docs)
