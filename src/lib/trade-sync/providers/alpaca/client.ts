import type { AlpacaConfig } from './config';
import { AlpacaOrdersResponseSchema, type AlpacaOrder } from './schemas';

/**
 * Thin HTTP client over Alpaca's Trading API. Handles auth header injection
 * and surfaces non-2xx responses as typed errors. Schema validation happens
 * here too so callers always receive parsed, well-typed data — anything
 * else would already have thrown.
 *
 * The `fetchImpl` constructor parameter is the test seam: unit tests pass
 * a vi.fn() so no real network calls are made.
 */
export class AlpacaApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: string,
    message: string
  ) {
    super(message);
    this.name = 'AlpacaApiError';
  }
}

export interface ListOrdersParams {
  /** Alpaca's status filter — `all` returns open + closed; `open` returns live only. */
  status?: 'open' | 'closed' | 'all';
  /** Page size. Alpaca caps at 500. */
  limit?: number;
  /** ISO timestamp — exclusive lower bound on `submitted_at`. */
  after?: string;
  /** ISO timestamp — exclusive upper bound on `submitted_at`. */
  until?: string;
  direction?: 'asc' | 'desc';
}

export interface AlpacaClient {
  listOrders(params?: ListOrdersParams): Promise<AlpacaOrder[]>;
}

type FetchImpl = typeof fetch;

export function createAlpacaClient(
  config: AlpacaConfig,
  fetchImpl: FetchImpl = fetch
): AlpacaClient {
  return {
    async listOrders(params: ListOrdersParams = {}): Promise<AlpacaOrder[]> {
      const url = new URL('/v2/orders', config.baseUrl);
      if (params.status) url.searchParams.set('status', params.status);
      if (params.limit !== undefined)
        url.searchParams.set('limit', String(params.limit));
      if (params.after) url.searchParams.set('after', params.after);
      if (params.until) url.searchParams.set('until', params.until);
      if (params.direction) url.searchParams.set('direction', params.direction);

      const response = await fetchImpl(url.toString(), {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': config.keyId,
          'APCA-API-SECRET-KEY': config.secretKey,
          Accept: 'application/json',
        },
      });

      if (!response.ok) {
        const body = await response.text().catch(() => '');
        throw new AlpacaApiError(
          response.status,
          body,
          `Alpaca API returned ${response.status} for ${url.pathname}`
        );
      }

      const json: unknown = await response.json();
      // Parse — throws ZodError on schema drift, which the orchestrator
      // catches and counts as an error rather than aborting the whole run.
      return AlpacaOrdersResponseSchema.parse(json);
    },
  };
}
