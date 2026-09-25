import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Trade } from '@types';
import { TradesMetrics } from './trades-metrics';

const mockTrades: Trade[] = [
  {
    id: 'TRD-001',
    symbol: 'AAPL',
    side: 'buy',
    quantity: 100,
    price: 150,
    status: 'filled',
    trader: 'James Howell',
    executedAt: '2026-08-28T14:00:00Z',
  },
  {
    id: 'TRD-002',
    symbol: 'MSFT',
    side: 'sell',
    quantity: 200,
    price: 300,
    status: 'pending',
    trader: 'Sarah Khan',
    executedAt: null,
  },
];

describe('TradesMetrics', () => {
  it('renders aggregated trade calculations correctly', () => {
    render(<TradesMetrics trades={mockTrades} />);

    expect(screen.getByTestId('metric-total-trades')).toHaveTextContent('2');
    expect(screen.getByTestId('metric-total-volume')).toHaveTextContent(
      '300 shares'
    );
    expect(screen.getByTestId('metric-total-value')).toHaveTextContent(
      '$75,000.00'
    );
    expect(screen.getByTestId('metric-fill-rate')).toHaveTextContent('50.0%');
    expect(screen.getByTestId('metric-buy-bias')).toHaveTextContent('33% Buy');
    expect(screen.getByTestId('metric-top-symbol')).toHaveTextContent('MSFT');
  });

  it('handles empty trades list safely', () => {
    render(<TradesMetrics trades={[]} />);

    expect(screen.getByTestId('metric-total-trades')).toHaveTextContent('0');
    expect(screen.getByTestId('metric-total-volume')).toHaveTextContent(
      '0 shares'
    );
    expect(screen.getByTestId('metric-total-value')).toHaveTextContent('$0.00');
    expect(screen.getByTestId('metric-fill-rate')).toHaveTextContent('0%');
    expect(screen.getByTestId('metric-buy-bias')).toHaveTextContent('0% Buy');
  });
});
