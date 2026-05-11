import type { MappedTrade, TradeProvider } from '../../types';
import { createAlpacaClient, type AlpacaClient } from './client';
import { type AlpacaConfig, loadAlpacaConfig } from './config';
import { mapAlpacaOrderToTrade } from './mapper';

/**
 * Page size for `/v2/orders`. Alpaca caps at 500; using the max minimises
 * round-trips. Smaller values are useful for tests.
 */
const PAGE_SIZE = 500;

export interface AlpacaProviderOptions {
  /** Override the loaded config — useful for tests. */
  config?: AlpacaConfig;
  /** Inject a pre-built client (typically a fake in unit tests). */
  client?: AlpacaClient;
}

/**
 * Adapt the Alpaca client to the generic TradeProvider contract.
 *
 * Yields MappedTrade lazily — pages are fetched and mapped one at a time
 * so the orchestrator can begin upserts before the full backlog is loaded.
 *
 * Pagination uses `direction=asc` + `after=<last seen submitted_at>`. We
 * stop when a page returns fewer rows than the page size.
 *
 * Orders the mapper chooses to skip (no usable price) are silently dropped
 * here — the orchestrator's `skipped` counter is derived from the diff
 * between fetched and emitted rows.
 */
export function createAlpacaProvider(
  options: AlpacaProviderOptions = {}
): TradeProvider {
  const config = options.config ?? loadAlpacaConfig();
  const client = options.client ?? createAlpacaClient(config);

  return {
    name: 'alpaca',
    async *fetchAll(): AsyncIterable<MappedTrade> {
      let after: string | undefined;
      while (true) {
        const page = await client.listOrders({
          status: 'all',
          direction: 'asc',
          limit: PAGE_SIZE,
          after,
        });
        if (page.length === 0) return;

        for (const order of page) {
          const trade = mapAlpacaOrderToTrade(order, { trader: config.trader });
          if (trade !== null) yield trade;
        }

        // `after` is exclusive on submitted_at — advance to the latest one
        // we just saw. If submitted_at is null (rare), fall back to created_at.
        const last = page[page.length - 1];
        const nextAfter = last.submitted_at ?? last.created_at;
        if (page.length < PAGE_SIZE) return;
        after = nextAfter;
      }
    },
  };
}
