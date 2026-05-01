import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTradeById } from '@api';
import { sideLabel } from '@/utils';

type PageProps = {
  params: Promise<{ tradeId: string }>;
};

export default async function TradeDetailPage({ params }: PageProps) {
  const { tradeId } = await params;
  const trade = await getTradeById(tradeId);

  if (!trade) {
    notFound();
  }

  const executed = new Date(trade.executedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const rows: { label: string; value: string | number }[] = [
    { label: 'Side', value: sideLabel(trade.side) },
    { label: 'Quantity', value: trade.quantity },
    { label: 'Price', value: trade.price.toFixed(2) },
    { label: 'Status', value: trade.status },
    { label: 'Trader', value: trade.trader },
    { label: 'Executed', value: executed },
  ];

  return (
    <main style={{ padding: '1rem', maxWidth: 720 }}>
      <h1>{trade.symbol}</h1>
      <p style={{ margin: '0 0 0.5rem' }}>
        Trade ID <code>{trade.id}</code>
      </p>
      <section
        aria-label="Trade details"
        style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}
      >
        {rows.map(({ label, value }) => (
          <div key={label}>
            <div style={{ fontSize: '0.8rem', color: '#555' }}>{label}</div>
            <div>{value}</div>
          </div>
        ))}
      </section>
      <p style={{ marginTop: '1.5rem' }}>
        <Link href="/trades">← Back to trades</Link>
      </p>
    </main>
  );
}
