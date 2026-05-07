import { NextResponse } from 'next/server';
import { getTradeByIdFromDb } from '@features/trades/server/trades.db';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const trade = await getTradeByIdFromDb(id);

    if (!trade) {
      return NextResponse.json({ error: 'Trade not found' }, { status: 404 });
    }

    return NextResponse.json(trade);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch trade' }, { status: 500 });
  }
}

