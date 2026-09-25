import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { TEST_TRADES } from './fixtures/test-trades';

/**
 * Playwright global setup — runs once before any e2e test.
 *
 * Resets the Trade table to a known state: deletes every row, then inserts
 * the canonical test fixtures (TRD-001 / TRD-002). Specs can then rely on
 * `/trades/TRD-001` rendering AAPL, the grid containing exactly two rows,
 * locators like `getByRole('link', { name: 'AAPL' })` resolving uniquely,
 * etc.
 *
 * **Local trade-off**: running e2e tests locally wipes any trades synced
 * from Alpaca via `npm run sync:trades`. Re-run that command after if you
 * want real data back. This is the standard e2e pattern — tests own the
 * DB state for the duration of the run.
 *
 * **CI**: only ever sees the fixtures (no Alpaca credentials), so this
 * is a no-op cleanup before insert.
 */
export default async function globalSetup(): Promise<void> {
  // Prefer TEST_DATABASE_URL so e2e never touches the dev DB. CI typically
  // points both at the same Postgres — there's no dev data to preserve.
  const connectionString =
    process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      'TEST_DATABASE_URL or DATABASE_URL is required for e2e global setup. Set one in .env.local or the workflow env.'
    );
  }

  const adapter = new PrismaPg(new Pool({ connectionString }));
  const prisma = new PrismaClient({ adapter });

  try {
    await prisma.trade.deleteMany({});
    await prisma.trade.createMany({ data: [...TEST_TRADES] });
    console.info(
      `[e2e global-setup] reset Trade table and inserted ${TEST_TRADES.length} fixture trade(s)`
    );
  } finally {
    await prisma.$disconnect();
  }
}
