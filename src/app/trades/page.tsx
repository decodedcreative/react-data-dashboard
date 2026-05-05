import { getTrades } from '@api';
import { TradesList } from '@features/trades/components/trades-list';
import { getClassNames } from '@lib/getClassNames';
import classNames from './page.styles';

const TradesPage = async () => {
  const initialTrades = await getTrades();
  const tradesPageClassNames = getClassNames(classNames);

  return (
    <main className={tradesPageClassNames.component}>
      <header className={tradesPageClassNames.header}>
        <h1 className={tradesPageClassNames.title}>Trades</h1>
      </header>
      <TradesList initialTrades={initialTrades} />
    </main>
  );
};

export default TradesPage;
