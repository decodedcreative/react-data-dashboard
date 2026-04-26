import { useQuery } from '@tanstack/react-query';
import { getTrades } from '@api';

function App() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
  });

  if (isLoading) return <div>Loading trades...</div>;
  if (error) return <div>Failed to load trades</div>;

  return (
    <main>
      <h1>React Data Dashboard</h1>

      <ul>
        {data?.map((trade) => (
          <li key={trade.id}>
            {trade.symbol} — {trade.side} — {trade.quantity}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;