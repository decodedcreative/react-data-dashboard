import { z } from 'zod';

/**
 * Reusable Zod primitives for validating external API responses that use
 * non-standard encodings for numbers and timestamps.
 *
 * Both validators are intentionally lenient on format while being strict on
 * semantic validity — the goal is to surface real schema drift, not to
 * re-implement RFC compliance that the Date constructor already handles.
 */

/**
 * Accepts a decimal-string like "184.52", "120", "0", or "-3.5".
 * Rejects anything that isn't a bare number (no currency symbols, commas,
 * exponent notation, or whitespace). Negative values are permitted to avoid
 * spurious failures on edge-case API fields even though most trade numerics
 * are non-negative.
 */
export const numericString = z.string().regex(/^-?\d+(\.\d+)?$/, {
  message: 'expected a numeric string such as "184.52"',
});

/**
 * Accepts any string that `new Date(…)` can parse to a valid timestamp.
 * This is deliberately broader than z.string().datetime() because some APIs
 * (e.g. Alpaca) emit microsecond-precision fractional seconds
 * ("2026-05-11T15:48:52.223323Z") which are outside RFC 3339's grammar but
 * are handled correctly by the platform Date constructor.
 */
export const isoTimestamp = z
  .string()
  .refine((s) => !Number.isNaN(new Date(s).getTime()), {
    message: 'expected a parseable ISO-8601 timestamp',
  });
