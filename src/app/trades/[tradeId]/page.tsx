import Link from 'next/link';
import { notFound } from 'next/navigation';
import { toTradeDetailRows } from '@features/trades/lib';
import { getTradeByIdFromDb } from '@features/trades/server/trades.db';
import { getClassNames } from '@lib/get-class-names';
import classNames from './page.styles';

export const dynamic = 'force-dynamic';

type PageProps = {
  params: Promise<{ tradeId: string }>;
};

const TradeDetailPage = async ({ params }: PageProps) => {
  const { tradeId } = await params;
  const trade = await getTradeByIdFromDb(tradeId);

  if (!trade) {
    notFound();
  }

  const rows = toTradeDetailRows(trade);

  const tradeDetailClassNames = getClassNames(classNames);

  return (
    <main className={tradeDetailClassNames.component}>
      <h1 className={tradeDetailClassNames.title}>{trade.symbol}</h1>
      <p className={tradeDetailClassNames.tradeIdText}>
        Trade ID <code className={tradeDetailClassNames.tradeIdCode}>{trade.id}</code>
      </p>
      <section aria-label="Trade details" className={tradeDetailClassNames.details}>
        {rows.map(({ label, value }) => (
          <div key={label} className={tradeDetailClassNames.row}>
            <div className={tradeDetailClassNames.label}>{label}</div>
            <div className={tradeDetailClassNames.value}>{value}</div>
          </div>
        ))}
      </section>
      <p className={tradeDetailClassNames.backLinkWrap}>
        <Link href="/trades" className={tradeDetailClassNames.backLink}>
          ← Back to trades
        </Link>
      </p>
    </main>
  );
}

export default TradeDetailPage;
