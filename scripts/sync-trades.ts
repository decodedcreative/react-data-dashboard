/**
 * Pulls the full order history from the configured external trade provider
 * and persists it into Postgres via Prisma. See docs/data-sync.md for
 * setup, env vars, and how to read the output.
 *
 * Run with:
 *   npm run sync:trades
 *
 * Exits non-zero if any individual row failed to upsert.
 */
import 'dotenv/config';
import { prisma } from '@lib/db/prisma';
import { syncTrades } from '@lib/trade-sync';
import { createAlpacaProvider } from '@lib/trade-sync/providers/alpaca';

async function main(): Promise<void> {
  const provider = createAlpacaProvider();
  const result = await syncTrades({ provider, prisma });
  console.info('[sync:trades] done', result);
  if (result.errors > 0) {
    process.exitCode = 1;
  }
}

main()
  .catch((err: unknown) => {
    console.error('[sync:trades] fatal', err);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
