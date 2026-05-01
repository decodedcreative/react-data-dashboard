import { getTrades } from '@api';
import { TradesList } from '@/features/trades/components/TradesList';

export default async function TradesPage() {
  const initialTrades = await getTrades();

  return (
    <div style={{ padding: '0 1rem' }}>
      <TradesList initialTrades={initialTrades} />
    </div>
  );
}
