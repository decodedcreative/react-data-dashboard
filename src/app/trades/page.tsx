import { getTrades } from '@api';
import { GridTrades } from '@features/trades/components/trades-grid';
import { getClassNames } from '@lib/get-class-names';
import classNames from './page.styles';

const TradesPage = async () => {
  const initialTrades = await getTrades();
  const tradesPageClassNames = getClassNames(classNames);

  return (
    <main className={tradesPageClassNames.component}>
      <header className={tradesPageClassNames.header}>
        <h1 className={tradesPageClassNames.title}>Trades</h1>
      </header>
      <GridTrades initialTrades={initialTrades} />
    </main>
  );
};

export default TradesPage;
