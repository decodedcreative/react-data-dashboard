import Link from 'next/link';

export default function HomePage() {
  return (
    <main style={{ padding: '1rem', maxWidth: 720 }}>
      <h1 style={{ marginTop: 0 }}>React Data Dashboard</h1>
      <p>Browse executions, statuses, and related metrics.</p>
      <p>
        <Link href="/trades">View trades →</Link>
      </p>
    </main>
  );
}
