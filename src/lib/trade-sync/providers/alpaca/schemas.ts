import { z } from 'zod';

/**
 * Zod schemas describing Alpaca's external Trading API response shapes.
 *
 * Design goals:
 * - Strict mode: unknown keys throw at runtime so Alpaca schema drift surfaces
 *   loudly rather than silently dropping data.
 * - All numeric fields are typed as `string` because Alpaca returns numerics
 *   as decimal strings (e.g. "184.52"). The mapper converts them.
 * - Timestamps are typed as `string` (not z.string().datetime()) because
 *   Alpaca emits microsecond precision which is outside RFC 3339's grammar.
 *   We validate via `new Date(...)` and assert parse-ability.
 *
 * Reference fixture: ./__fixtures__/orders-real.json (sampled from the
 * paper-trading endpoint and committed for reproducibility).
 */

// All known Alpaca order statuses. The mapper has explicit handling for each;
// adding a new one to this enum without updating the mapper will fail typecheck.
export const AlpacaOrderStatusSchema = z.enum([
  'new',
  'partially_filled',
  'filled',
  'done_for_day',
  'canceled',
  'expired',
  'replaced',
  'pending_cancel',
  'pending_replace',
  'accepted',
  'pending_new',
  'accepted_for_bidding',
  'stopped',
  'rejected',
  'suspended',
  'calculated',
  'held',
]);
export type AlpacaOrderStatus = z.infer<typeof AlpacaOrderStatusSchema>;

export const AlpacaSideSchema = z.enum(['buy', 'sell']);
export type AlpacaSide = z.infer<typeof AlpacaSideSchema>;

// Numeric string — e.g. "184.52", "120", "0". Strict pattern so non-numeric
// strings fail loudly. Negative numbers are not expected from Alpaca but
// permitted to avoid spurious failures on edge-case fields.
const numericString = z.string().regex(/^-?\d+(\.\d+)?$/);

// ISO-8601 with optional fractional seconds and Z/offset suffix. Alpaca uses
// up to microsecond precision (6 fractional digits) which RFC 3339's grammar
// strictly forbids — we accept it pragmatically and rely on Date parsing.
const isoTimestamp = z
  .string()
  .refine((s) => !Number.isNaN(new Date(s).getTime()), {
    message: 'invalid ISO-8601 timestamp',
  });

/**
 * Strict schema for a single Alpaca order. Fields enumerated from a real
 * paper-trading response (see __fixtures__/orders-real.json). If Alpaca
 * adds new fields in production this will throw — that's intentional.
 */
export const AlpacaOrderSchema = z
  .object({
    id: z.string().uuid(),
    client_order_id: z.string(),
    created_at: isoTimestamp,
    updated_at: isoTimestamp,
    submitted_at: isoTimestamp.nullable(),
    filled_at: isoTimestamp.nullable(),
    expired_at: isoTimestamp.nullable(),
    canceled_at: isoTimestamp.nullable(),
    failed_at: isoTimestamp.nullable(),
    replaced_at: isoTimestamp.nullable(),
    replaced_by: z.string().uuid().nullable(),
    replaces: z.string().uuid().nullable(),
    asset_id: z.string().uuid(),
    symbol: z.string(),
    asset_class: z.string(),
    notional: numericString.nullable(),
    qty: numericString.nullable(),
    filled_qty: numericString,
    filled_avg_price: numericString.nullable(),
    order_class: z.string(),
    order_type: z.string(),
    type: z.string(),
    side: AlpacaSideSchema,
    position_intent: z.string(),
    time_in_force: z.string(),
    limit_price: numericString.nullable(),
    stop_price: numericString.nullable(),
    status: AlpacaOrderStatusSchema,
    extended_hours: z.boolean(),
    legs: z.array(z.unknown()).nullable(),
    trail_percent: numericString.nullable(),
    trail_price: numericString.nullable(),
    hwm: numericString.nullable(),
    subtag: z.string().nullable(),
    source: z.string().nullable(),
    expires_at: isoTimestamp.nullable(),
  })
  .strict();
export type AlpacaOrder = z.infer<typeof AlpacaOrderSchema>;

export const AlpacaOrdersResponseSchema = z.array(AlpacaOrderSchema);
export type AlpacaOrdersResponse = z.infer<typeof AlpacaOrdersResponseSchema>;
