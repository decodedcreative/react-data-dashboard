import Link from 'next/link';

export default function AboutPage() {
  return (
    <main style={{ padding: '1rem', maxWidth: 640 }}>
      <h1 style={{ marginTop: 0 }}>About</h1>
      <p>
        Product context and docs can live here. Main data views are under{' '}
        <Link href="/trades">Trades</Link>.
      </p>
      <p>
        <Link href="/">← Home</Link>
      </p>
    </main>
  );
}
