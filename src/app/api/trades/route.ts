import { NextResponse } from 'next/server';
import { getTradesFromDb } from '@features/trades/server/trades.db';

export async function GET() {
  try {
    const trades = await getTradesFromDb();
    return NextResponse.json(trades);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 });
  }
}

