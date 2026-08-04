import { describe, expect, it, vi } from 'vitest';
import { NextResponse } from 'next/server';
import {
  REQUEST_ID_HEADER,
  withApiLogging,
  type ApiRequestLog,
} from './with-api-logging';

describe('withApiLogging', () => {
  it('logs status + duration and sets x-request-id on success', async () => {
    const logs: ApiRequestLog[] = [];
    const handler = withApiLogging(
      async () => NextResponse.json({ ok: true }),
      {
        logger: (entry) => logs.push(entry),
        now: (() => {
          let t = 1_000;
          return () => {
            const current = t;
            t += 25;
            return current;
          };
        })(),
        createRequestId: () => 'req-fixed-id',
      }
    );

    const response = await handler(new Request('http://localhost/api/trades'), undefined);

    expect(response.status).toBe(200);
    expect(response.headers.get(REQUEST_ID_HEADER)).toBe('req-fixed-id');
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(logs).toEqual([
      {
        requestId: 'req-fixed-id',
        method: 'GET',
        path: '/api/trades',
        status: 200,
        durationMs: 25,
      },
    ]);
  });

  it('reuses an incoming x-request-id', async () => {
    const logs: ApiRequestLog[] = [];
    const handler = withApiLogging(async () => NextResponse.json({ ok: true }), {
      logger: (entry) => logs.push(entry),
      createRequestId: () => 'should-not-be-used',
    });

    const request = new Request('http://localhost/api/trades/TRD-001', {
      headers: { [REQUEST_ID_HEADER]: 'from-client' },
    });
    const response = await handler(request, undefined);

    expect(response.headers.get(REQUEST_ID_HEADER)).toBe('from-client');
    expect(logs[0]?.requestId).toBe('from-client');
  });

  it('logs 500 and rethrows when the handler throws', async () => {
    const logs: ApiRequestLog[] = [];
    const handler = withApiLogging(
      async () => {
        throw new Error('boom');
      },
      {
        logger: (entry) => logs.push(entry),
        createRequestId: () => 'req-error',
      }
    );

    await expect(handler(new Request('http://localhost/api/trades'), undefined)).rejects.toThrow(
      'boom'
    );
    expect(logs).toEqual([
      expect.objectContaining({
        requestId: 'req-error',
        method: 'GET',
        path: '/api/trades',
        status: 500,
      }),
    ]);
  });
});
