import { NextResponse } from 'next/server';
import { getTradesFromDb } from '@features/trades/server/trades.db';
import { withApiLogging } from '@lib/api/with-api-logging';

export const GET = withApiLogging(async () => {
  try {
    const trades = await getTradesFromDb();
    return NextResponse.json(trades);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
});
