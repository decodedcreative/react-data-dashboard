/**
 * Side-effect-only module that loads `.env.local` and `.env` into process.env.
 *
 * Import this **first** in any Node entrypoint that needs env vars before
 * other modules read them — e.g. scripts that import `@lib/db/prisma`, which
 * reads `DATABASE_URL` at import time and would otherwise throw before our
 * loader gets to run.
 *
 * Next.js loads .env files automatically for the app runtime; this module
 * is only for plain Node scripts (sync, migrations, one-off tooling). It
 * mirrors Next.js precedence: `.env.local` overrides `.env`.
 *
 * Test runners that load env themselves (Vitest via loadEnv in
 * vitest.config.ts, Playwright via dotenv in playwright.config.ts) do not
 * need this module.
 */
import { config as loadEnv } from 'dotenv';

loadEnv({ path: '.env.local' });
loadEnv();
