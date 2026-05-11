import type { PrismaClient } from '@prisma/client';
import type { MappedTrade, SyncResult, TradeProvider } from './types';

/**
 * Logger interface kept minimal so callers can pass console, pino, etc.
 * without adapter boilerplate. Defaults to console.
 */
export interface SyncLogger {
  info: (message: string, meta?: Record<string, unknown>) => void;
  warn: (message: string, meta?: Record<string, unknown>) => void;
  error: (message: string, meta?: Record<string, unknown>) => void;
}

export interface SyncDeps {
  provider: TradeProvider;
  prisma: Pick<PrismaClient, 'trade'>;
  logger?: SyncLogger;
}

const defaultLogger: SyncLogger = {
  info: (m, meta) => console.info(`[trade-sync] ${m}`, meta ?? ''),
  warn: (m, meta) => console.warn(`[trade-sync] ${m}`, meta ?? ''),
  error: (m, meta) => console.error(`[trade-sync] ${m}`, meta ?? ''),
};

/**
 * Pull every trade from the given provider and upsert it into the DB.
 *
 * Upserts are keyed on `externalId` (which Prisma's schema has marked
 * UNIQUE), so re-running this against the same provider state is
 * idempotent — second-run output reports `upserted` equal to the row
 * count with zero errors.
 *
 * Individual upsert failures are caught and counted — one bad row does
 * not abort the whole run. This is important when syncing thousands of
 * rows: a single Decimal overflow shouldn't lose every later upsert.
 */
export async function syncTrades({
  provider,
  prisma,
  logger = defaultLogger,
}: SyncDeps): Promise<SyncResult> {
  const result: SyncResult = { fetched: 0, upserted: 0, errors: 0 };

  logger.info(`starting sync from provider=${provider.name}`);

  for await (const trade of provider.fetchAll()) {
    result.fetched += 1;
    try {
      await upsertTrade(prisma, trade);
      result.upserted += 1;
    } catch (err) {
      result.errors += 1;
      logger.error('upsert failed', {
        externalId: trade.externalId,
        source: trade.source,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  logger.info('sync complete', { ...result });
  return result;
}

async function upsertTrade(
  prisma: Pick<PrismaClient, 'trade'>,
  trade: MappedTrade
): Promise<void> {
  const data = {
    externalId: trade.externalId,
    source: trade.source,
    symbol: trade.symbol,
    side: trade.side,
    quantity: trade.quantity,
    price: trade.price,
    status: trade.status,
    trader: trade.trader,
    executedAt: trade.executedAt,
  };

  await prisma.trade.upsert({
    where: { externalId: trade.externalId },
    create: data,
    // Don't overwrite the persistent fields (id, createdAt) — only refresh
    // the mutable shape from the provider.
    update: {
      source: data.source,
      symbol: data.symbol,
      side: data.side,
      quantity: data.quantity,
      price: data.price,
      status: data.status,
      trader: data.trader,
      executedAt: data.executedAt,
    },
  });
}
