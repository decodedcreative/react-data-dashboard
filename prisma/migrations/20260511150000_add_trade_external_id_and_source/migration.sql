-- CreateEnum
CREATE TYPE "TradeSource" AS ENUM ('seed', 'alpaca');

-- AlterTable
ALTER TABLE "Trade"
  ADD COLUMN "externalId" TEXT,
  ADD COLUMN "source" "TradeSource" NOT NULL DEFAULT 'seed';

-- CreateIndex
CREATE UNIQUE INDEX "Trade_externalId_key" ON "Trade"("externalId");

-- CreateIndex
CREATE INDEX "Trade_source_idx" ON "Trade"("source");
