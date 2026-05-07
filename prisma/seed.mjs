import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

const adapter = new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL }));
const prisma = new PrismaClient({ adapter });

const seedTrades = [
  {
    id: 'TRD-001',
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
  await prisma.trade.deleteMany();
  await prisma.trade.createMany({ data: seedTrades });
  console.log(`Seeded ${seedTrades.length} trades.`);
}

main()
  .catch((error) => {
    console.error('Failed to seed database', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

