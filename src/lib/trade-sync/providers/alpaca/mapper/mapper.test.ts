import { describe, expect, it } from 'vitest';
import sampleFixture from '../__fixtures__/orders-sample.json';
import { AlpacaOrdersResponseSchema, type AlpacaOrder } from '../schemas';
import { mapAlpacaOrderToTrade, mapAlpacaStatus } from './mapper';

const TRADER = 'James Howell';

/**
 * Build a synthetic Alpaca order with all timestamps cleared by default.
 * Tests opt into the timestamps they care about so merge bleed-through from
 * the real fixture cannot pollute the result.
 */
function makeOrder(overrides: Partial<AlpacaOrder> = {}): AlpacaOrder {
  const base: AlpacaOrder = {
    id: '00000000-0000-0000-0000-000000000001',
    client_order_id: 'cli-1',
    created_at: '2026-05-11T15:00:00Z',
    updated_at: '2026-05-11T15:00:00Z',
    submitted_at: null,
    filled_at: null,
    expired_at: null,
    canceled_at: null,
    failed_at: null,
    replaced_at: null,
    replaced_by: null,
    replaces: null,
    asset_id: '00000000-0000-0000-0000-000000000099',
    symbol: 'AAPL',
    asset_class: 'us_equity',
    notional: null,
    qty: '1',
    filled_qty: '0',
    filled_avg_price: null,
    order_class: '',
    order_type: 'market',
    type: 'market',
    side: 'buy',
    position_intent: 'buy_to_open',
    time_in_force: 'day',
    limit_price: null,
    stop_price: null,
    status: 'new',
    extended_hours: false,
    legs: null,
    trail_percent: null,
    trail_price: null,
    hwm: null,
    subtag: null,
    source: null,
    expires_at: null,
  };
  return { ...base, ...overrides };
}

describe('mapAlpacaStatus', () => {
  it.each([
    ['filled', 'filled'],
    ['calculated', 'filled'],
    ['stopped', 'filled'],
    ['partially_filled', 'pending'],
    ['new', 'pending'],
    ['pending_new', 'pending'],
    ['accepted', 'pending'],
    ['accepted_for_bidding', 'pending'],
    ['pending_cancel', 'pending'],
    ['pending_replace', 'pending'],
    ['done_for_day', 'pending'],
    ['suspended', 'pending'],
    ['held', 'pending'],
    ['canceled', 'cancelled'],
    ['expired', 'cancelled'],
    ['rejected', 'cancelled'],
    ['replaced', 'cancelled'],
  ] as const)('maps %s → %s', (alpaca, domain) => {
    expect(mapAlpacaStatus(alpaca)).toBe(domain);
  });
});

describe('mapAlpacaOrderToTrade', () => {
  it('maps the sample fixture without errors and respects skip logic', () => {
    const orders = AlpacaOrdersResponseSchema.parse(sampleFixture);
    const mapped = orders.map((o) =>
      mapAlpacaOrderToTrade(o, { trader: TRADER })
    );
    // Every fixture entry has at least one of: filled_avg_price, limit_price,
    // or stop_price — so none should be skipped.
    expect(mapped.every((m) => m !== null)).toBe(true);
  });

  it('uses filled_avg_price + filled_qty + filled_at for a filled market order', () => {
    const order = makeOrder({
      status: 'filled',
      type: 'market',
      qty: '50',
      filled_qty: '50',
      filled_avg_price: '184.52',
      filled_at: '2026-04-24T10:15:00Z',
      limit_price: null,
      stop_price: null,
    });
    const trade = mapAlpacaOrderToTrade(order, { trader: TRADER });
    expect(trade).toMatchObject({
      source: 'alpaca',
      status: 'filled',
      quantity: '50',
      price: '184.52',
      trader: TRADER,
    });
    expect(trade?.executedAt?.toISOString()).toBe('2026-04-24T10:15:00.000Z');
  });

  it('uses qty + limit_price + submitted_at for a pending limit order', () => {
    const order = makeOrder({
      status: 'new',
      type: 'limit',
      qty: '15',
      filled_qty: '0',
      filled_avg_price: null,
      filled_at: null,
      limit_price: '50.00',
      stop_price: null,
      submitted_at: '2026-05-11T15:48:04.409001Z',
    });
    const trade = mapAlpacaOrderToTrade(order, { trader: TRADER });
    expect(trade).toMatchObject({
      status: 'pending',
      quantity: '15',
      price: '50.00',
    });
    expect(trade?.executedAt?.toISOString()).toBe('2026-05-11T15:48:04.409Z');
  });

  it('uses qty + stop_price for a pending stop order', () => {
    const order = makeOrder({
      status: 'new',
      type: 'stop',
      qty: '40',
      filled_qty: '0',
      filled_avg_price: null,
      limit_price: null,
      stop_price: '50.00',
    });
    const trade = mapAlpacaOrderToTrade(order, { trader: TRADER });
    expect(trade?.price).toBe('50.00');
    expect(trade?.quantity).toBe('40');
  });

  it('uses canceled_at when the order was cancelled', () => {
    const order = makeOrder({
      status: 'canceled',
      filled_at: null,
      canceled_at: '2026-05-11T16:00:00Z',
      filled_avg_price: null,
      limit_price: '100.00',
    });
    const trade = mapAlpacaOrderToTrade(order, { trader: TRADER });
    expect(trade?.status).toBe('cancelled');
    expect(trade?.executedAt?.toISOString()).toBe('2026-05-11T16:00:00.000Z');
  });

  it('returns null (skip) when no price source is available', () => {
    const order = makeOrder({
      status: 'new',
      filled_avg_price: null,
      limit_price: null,
      stop_price: null,
    });
    expect(mapAlpacaOrderToTrade(order, { trader: TRADER })).toBeNull();
  });

  it('uses Alpaca id as externalId and source = alpaca', () => {
    const order = makeOrder({
      id: '11111111-1111-1111-1111-111111111111',
      limit_price: '100.00',
    });
    const trade = mapAlpacaOrderToTrade(order, { trader: TRADER });
    expect(trade?.externalId).toBe('11111111-1111-1111-1111-111111111111');
    expect(trade?.source).toBe('alpaca');
  });
});
