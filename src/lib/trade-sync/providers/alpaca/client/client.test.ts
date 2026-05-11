import { describe, expect, it, vi } from 'vitest';
import sampleFixture from '../__fixtures__/orders-sample.json';
import { AlpacaApiError, createAlpacaClient } from './client';
import type { AlpacaConfig } from '../config';

const config: AlpacaConfig = {
  baseUrl: 'https://paper-api.alpaca.markets',
  keyId: 'test-key',
  secretKey: 'test-secret',
  trader: 'Test Trader',
};

function jsonResponse(body: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
}

describe('createAlpacaClient', () => {
  it('sends auth headers and parses a successful response', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse(sampleFixture));
    const client = createAlpacaClient(config, fetchImpl);
    const orders = await client.listOrders({ status: 'all', limit: 100 });

    expect(orders).toHaveLength((sampleFixture as Array<unknown>).length);

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ];
    expect(url).toContain('/v2/orders');
    expect(url).toContain('status=all');
    expect(url).toContain('limit=100');
    const headers = init.headers as Record<string, string>;
    expect(headers['APCA-API-KEY-ID']).toBe('test-key');
    expect(headers['APCA-API-SECRET-KEY']).toBe('test-secret');
  });

  it('throws AlpacaApiError on non-2xx responses', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('forbidden', { status: 403 })
    );
    const client = createAlpacaClient(config, fetchImpl);
    await expect(client.listOrders()).rejects.toBeInstanceOf(AlpacaApiError);
  });

  it('throws on schema drift (unknown field in response)', async () => {
    const polluted = [
      {
        ...(sampleFixture as Array<Record<string, unknown>>)[0],
        unexpected_field: 'oops',
      },
    ];
    const fetchImpl = vi.fn(async () => jsonResponse(polluted));
    const client = createAlpacaClient(config, fetchImpl);
    await expect(client.listOrders()).rejects.toBeDefined();
  });

  it('propagates pagination query params', async () => {
    const fetchImpl = vi.fn(async () => jsonResponse([]));
    const client = createAlpacaClient(config, fetchImpl);
    await client.listOrders({
      status: 'all',
      direction: 'asc',
      limit: 500,
      after: '2026-05-11T15:00:00Z',
    });
    const [url] = fetchImpl.mock.calls[0] as unknown as [string];
    expect(url).toContain('direction=asc');
    expect(url).toContain('limit=500');
    expect(url).toContain('after=');
  });
});
