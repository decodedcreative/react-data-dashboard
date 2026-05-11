import type { TradeStatus } from '@prisma/client';
import type { MappedTrade } from '../../types';
import type { AlpacaOrder, AlpacaOrderStatus } from './schemas';

/**
 * Status mapping is exhaustive — every value in AlpacaOrderStatusSchema must
 * have a branch here. Adding a new status to the enum without updating this
 * function fails typecheck (the `never` default arm).
 *
 * | Alpaca status         | Domain status | Reasoning |
 * | --------------------- | ------------- | --- |
 * | filled                | filled        | terminal: order completed |
 * | calculated            | filled        | post-fill calc complete |
 * | stopped               | filled        | stop trigger fill (Alpaca docs: guaranteed) |
 * | partially_filled      | pending       | order still live, partial fill in flight |
 * | new                   | pending       | accepted at venue, awaiting fill |
 * | pending_new           | pending       | en route to venue |
 * | accepted              | pending       | accepted, awaiting handling |
 * | accepted_for_bidding  | pending       | auction-style pending |
 * | pending_cancel        | pending       | cancel in flight, order still alive |
 * | pending_replace       | pending       | replace in flight |
 * | done_for_day          | pending       | unfilled, still alive next session |
 * | suspended             | pending       | venue halt, order still live |
 * | held                  | pending       | held by compliance |
 * | canceled              | cancelled     | terminal |
 * | expired               | cancelled     | terminal |
 * | rejected              | cancelled     | terminal |
 * | replaced              | cancelled     | this id retired, new one took over |
 */
export function mapAlpacaStatus(status: AlpacaOrderStatus): TradeStatus {
  switch (status) {
    case 'filled':
    case 'calculated':
    case 'stopped':
      return 'filled';
    case 'partially_filled':
    case 'new':
    case 'pending_new':
    case 'accepted':
    case 'accepted_for_bidding':
    case 'pending_cancel':
    case 'pending_replace':
    case 'done_for_day':
    case 'suspended':
    case 'held':
      return 'pending';
    case 'canceled':
    case 'expired':
    case 'rejected':
    case 'replaced':
      return 'cancelled';
    default: {
      // Exhaustiveness check — compile error if AlpacaOrderStatus gains a
      // value that this switch does not handle.
      const _exhaustive: never = status;
      throw new Error(`Unhandled Alpaca status: ${_exhaustive}`);
    }
  }
}

/**
 * Choose the quantity that best represents this order as a "trade".
 *
 * For filled / partially-filled orders we use `filled_qty` because that is
 * what actually moved on the venue. For all other states we use the
 * requested `qty` (the order's intended size); if Alpaca omits `qty` for
 * notional orders we fall back to `filled_qty` which is at minimum "0".
 */
function pickQuantity(order: AlpacaOrder): string {
  const domainStatus = mapAlpacaStatus(order.status);
  if (domainStatus === 'filled') return order.filled_qty;
  return order.qty ?? order.filled_qty;
}

/**
 * Choose the price that best represents this order.
 *
 * Preference order:
 *   1. `filled_avg_price` — actual fill price
 *   2. `limit_price`      — for resting limit orders
 *   3. `stop_price`       — for resting stop orders
 *
 * Returns `null` when no price source is available — the caller (the mapper)
 * uses this signal to skip the order rather than emit a meaningless `0`.
 */
function pickPrice(order: AlpacaOrder): string | null {
  return (
    order.filled_avg_price ?? order.limit_price ?? order.stop_price ?? null
  );
}

/**
 * Choose the timestamp that best represents when the trade happened.
 *
 * For filled orders this is `filled_at`. Otherwise we fall back through
 * the lifecycle timestamps in priority order. Cancelled orders use
 * `canceled_at`; pending orders use `submitted_at` (or `created_at`).
 *
 * Returns `null` if no usable timestamp exists — Prisma's executedAt is
 * nullable and the trades grid renders "Pending" for that case.
 */
function pickExecutedAt(order: AlpacaOrder): Date | null {
  const candidate =
    order.filled_at ??
    order.canceled_at ??
    order.expired_at ??
    order.submitted_at ??
    order.created_at ??
    null;
  if (!candidate) return null;
  const date = new Date(candidate);
  return Number.isNaN(date.getTime()) ? null : date;
}

export interface MapAlpacaOrderOptions {
  /** Trader name attributed to synced orders (Alpaca doesn't expose one). */
  trader: string;
}

/**
 * Map a single Alpaca order to our domain MappedTrade. Pure — no IO.
 *
 * Returns `null` when the order has no usable price source (typically an
 * unfilled market order pre-execution). The caller treats this as "skip
 * and increment the skipped counter".
 */
export function mapAlpacaOrderToTrade(
  order: AlpacaOrder,
  { trader }: MapAlpacaOrderOptions
): MappedTrade | null {
  const price = pickPrice(order);
  if (price === null) return null;

  return {
    externalId: order.id,
    source: 'alpaca',
    symbol: order.symbol,
    side: order.side,
    quantity: pickQuantity(order),
    price,
    status: mapAlpacaStatus(order.status),
    trader,
    executedAt: pickExecutedAt(order),
  };
}
