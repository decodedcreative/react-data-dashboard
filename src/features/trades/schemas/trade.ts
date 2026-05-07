import { z } from 'zod';

export const TradeSideSchema = z.enum(['buy', 'sell']);
export type TradeSide = z.infer<typeof TradeSideSchema>;

export const TradeStatusSchema = z.enum(['filled', 'pending', 'cancelled']);
export type TradeStatus = z.infer<typeof TradeStatusSchema>;

export const TradeSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  side: TradeSideSchema,
  quantity: z.number(),
  price: z.number(),
  status: TradeStatusSchema,
  trader: z.string(),
  executedAt: z.string().datetime().nullable(),
});

export type Trade = z.infer<typeof TradeSchema>;

