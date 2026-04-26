import { useQuery } from '@tanstack/react-query';
import { getTrades } from '@api';
import { sideLabel } from './utils';

function App() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['trades'],
    queryFn: getTrades,
  });

  if (isLoading) return <div>Loading trades...</div>;
  if (error) return <div>Failed to load trades</div>;

  return (
    <main>
      <header>
        <h1>React Data Dashboard</h1>
        <button type="button" onClick={() => void refetch()}>
          Refresh trades
        </button>
      </header>

      <ul>
        {data?.map((trade) => (
          <li key={trade.id}>
            {trade.symbol} — {sideLabel(trade.side)} — {trade.quantity}
          </li>
        ))}
      </ul>
    </main>
  );
}

export default App;