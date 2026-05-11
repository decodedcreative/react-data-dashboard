import type { TradeSide, TradeSource, TradeStatus } from '@prisma/client';

/**
 * Provider-neutral shape that every TradeProvider yields. The sync
 * orchestrator only knows about this type — never provider-specific data.
 *
 * Numeric fields are decimal-safe strings (not `number`) so Prisma's
 * `Decimal` column type receives full precision from the source.
 */
export interface MappedTrade {
  /** Stable identifier from the upstream provider. Used as the upsert key. */
  externalId: string;
  /** Which provider this row originated from. Mirrors the DB enum. */
  source: TradeSource;
  symbol: string;
  side: TradeSide;
  quantity: string;
  price: string;
  status: TradeStatus;
  trader: string;
  executedAt: Date | null;
}

/**
 * Contract every data provider implements. The sync orchestrator iterates
 * `fetchAll()` and upserts each row by `(source, externalId)`.
 *
 * `fetchAll` is an async iterable so providers can stream paginated results
 * lazily — avoids loading thousands of rows into memory before the first
 * upsert runs.
 */
export interface TradeProvider {
  readonly name: TradeSource;
  fetchAll(): AsyncIterable<MappedTrade>;
}

/**
 * Aggregate counters returned by a sync run. `skipped` covers rows the
 * provider chose not to emit (e.g. orders without a usable price). `errors`
 * counts upserts that threw — the orchestrator continues past individual
 * failures so one bad row does not abort the whole run.
 */
export interface SyncResult {
  fetched: number;
  upserted: number;
  skipped: number;
  errors: number;
}
