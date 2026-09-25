import { describe, expect, it } from 'vitest';
import sampleFixture from '../__fixtures__/orders-sample.json';
import { AlpacaOrderSchema, AlpacaOrdersResponseSchema } from './schemas';

describe('AlpacaOrdersResponseSchema', () => {
  it('parses the paper-trading sample fixture', () => {
    const result = AlpacaOrdersResponseSchema.safeParse(sampleFixture);
    if (!result.success) {
      // Surface the first issue for easier debugging when this fails.
      console.error(result.error.issues.slice(0, 3));
    }
    expect(result.success).toBe(true);
  });
});

describe('AlpacaOrderSchema', () => {
  const sample = (sampleFixture as Array<Record<string, unknown>>)[0];

  it('rejects unknown keys (strict mode)', () => {
    const polluted = { ...sample, unexpected_field: 'oops' };
    expect(AlpacaOrderSchema.safeParse(polluted).success).toBe(false);
  });

  it('rejects unknown status enum values', () => {
    const polluted = { ...sample, status: 'banana' };
    expect(AlpacaOrderSchema.safeParse(polluted).success).toBe(false);
  });

  it('rejects non-numeric strings in numeric fields', () => {
    const polluted = { ...sample, qty: 'a hundred' };
    expect(AlpacaOrderSchema.safeParse(polluted).success).toBe(false);
  });

  it('accepts microsecond-precision timestamps', () => {
    const fine = { ...sample, created_at: '2026-05-11T15:48:52.223323Z' };
    expect(AlpacaOrderSchema.safeParse(fine).success).toBe(true);
  });

  it('rejects unparseable timestamps', () => {
    const polluted = { ...sample, created_at: 'not a date' };
    expect(AlpacaOrderSchema.safeParse(polluted).success).toBe(false);
  });
});
