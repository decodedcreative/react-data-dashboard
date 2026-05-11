import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const adapter = new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL }));
const prisma = new PrismaClient({ adapter });

// Fixture trades used by integration/e2e tests. These rows are scoped to
// `source = 'seed'` so the sync script (which writes `source = 'alpaca'`)
// can run alongside them without either side stomping the other.
const seedTrades = [
  {
    id: 'TRD-001',
    source: 'seed',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 120,
    price: 184.52,
    status: 'filled',
    trader: 'James Howell',
    executedAt: new Date('2026-04-24T10:15:00Z'),
  },
  {
    id: 'TRD-002',
    source: 'seed',
    symbol: 'TSLA',
    side: 'sell',
    quantity: 50,
    price: 171.25,
    status: 'pending',
    trader: 'Sarah Khan',
    executedAt: null,
  },
];

async function main() {
  // Only reset seed-sourced rows — never touch rows synced from Alpaca.
  await prisma.trade.deleteMany({ where: { source: 'seed' } });
  await prisma.trade.createMany({ data: seedTrades });
  console.log(`Seeded ${seedTrades.length} fixture trades (source=seed).`);
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
