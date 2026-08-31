import fs from 'node:fs';
import dotenv from 'dotenv';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

if (fs.existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}
dotenv.config();

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not defined in environment or .env.local');
}

const adapter = new PrismaPg(new Pool({ connectionString }));
const prisma = new PrismaClient({ adapter });

const SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'WMT'];
const SIDES = ['buy', 'sell'];
const TRADERS = [
  'James Howell',
  'Sarah Khan',
  'Alex Chen',
  'Elena Rostova',
  'Marcus Vance',
  'Priya Patel',
];

const BASE_PRICES = {
  AAPL: 185.5,
  MSFT: 420.3,
  GOOGL: 175.8,
  AMZN: 180.2,
  NVDA: 880.0,
  META: 490.4,
  TSLA: 175.0,
  JPM: 195.6,
  V: 275.4,
  WMT: 60.2,
};

const CANONICAL_TRADES = [
  {
    id: 'TRD-001',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 120,
    price: 184.52,
    status: 'filled',
    trader: 'James Howell',
    executedAt: new Date('2026-04-24T10:15:00Z'),
    createdAt: new Date('2026-04-24T10:14:00Z'),
  },
  {
    id: 'TRD-002',
    symbol: 'TSLA',
    side: 'sell',
    quantity: 50,
    price: 171.25,
    status: 'pending',
    trader: 'Sarah Khan',
    executedAt: null,
    createdAt: new Date('2026-04-24T10:16:00Z'),
  },
];

/**
 * Extra blotter rows. All filled, with executedAt older than TRD-001, so the
 * canonical AAPL/TSLA trades stay on the first grid page for e2e.
 */
function generateExtraTrades(count) {
  const newestExtra = new Date('2026-04-24T10:13:00Z').getTime();

  return Array.from({ length: count }, (_, index) => {
    const symbol = SYMBOLS[index % SYMBOLS.length];
    const side = SIDES[index % SIDES.length];
    const trader = TRADERS[index % TRADERS.length];

    const basePrice = BASE_PRICES[symbol] ?? 100;
    const variation = ((index * 17) % 20) - 10;
    const price = Math.max(1, +(basePrice + variation * 0.5).toFixed(2));
    const quantity = ((index * 23) % 490) + 10;

    const timeOffsetMs = (index + 1) * 60_000;
    const executedAt = new Date(newestExtra - timeOffsetMs);
    const createdAt = new Date(newestExtra - timeOffsetMs - 60_000);

    return {
      id: `TRD-${String(index + 3).padStart(5, '0')}`,
      symbol,
      side,
      quantity,
      price,
      status: 'filled',
      trader,
      executedAt,
      createdAt,
    };
  });
}

async function main() {
  const TOTAL_COUNT = 25000;
  const EXTRA_COUNT = TOTAL_COUNT - CANONICAL_TRADES.length;
  const BATCH_SIZE = 1000;

  console.log(`Generating ${TOTAL_COUNT} seed trades...`);
  const seedTrades = [...CANONICAL_TRADES, ...generateExtraTrades(EXTRA_COUNT)];

  console.log('Clearing existing trades...');
  await prisma.trade.deleteMany();

  console.log(`Inserting ${TOTAL_COUNT} trades in batches of ${BATCH_SIZE}...`);
  for (let i = 0; i < seedTrades.length; i += BATCH_SIZE) {
    const batch = seedTrades.slice(i, i + BATCH_SIZE);
    await prisma.trade.createMany({ data: batch });
    console.log(`Inserted ${Math.min(i + BATCH_SIZE, TOTAL_COUNT)} / ${TOTAL_COUNT} trades...`);
  }

  console.log(`Successfully seeded ${seedTrades.length} trades into the database.`);
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
