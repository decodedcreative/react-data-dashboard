import type { Trade } from '@types';
import { prisma } from '@lib/db/prisma';

type DbTrade = NonNullable<Awaited<ReturnType<typeof prisma.trade.findFirst>>>;

function toTrade(t: DbTrade): Trade {
  return {
    id: t.id,
    symbol: t.symbol,
    side: t.side,
    quantity: t.quantity.toNumber(),
    price: t.price.toNumber(),
    status: t.status,
    trader: t.trader,
    executedAt: t.executedAt.toISOString(),
  };
}

export async function getTradesFromDb(): Promise<Trade[]> {
  const trades = await prisma.trade.findMany({
    orderBy: { executedAt: 'desc' },
  });

  return trades.map(toTrade);
}

export async function getTradeByIdFromDb(id: string): Promise<Trade | undefined> {
  const trade = await prisma.trade.findUnique({ where: { id } });
  return trade ? toTrade(trade) : undefined;
}

