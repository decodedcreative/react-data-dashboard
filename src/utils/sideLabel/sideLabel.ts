/**
 * UI-facing label for a trade side. Kept as a small pure function for reuse and easy testing.
 */
export function sideLabel(side: 'buy' | 'sell'): string {
  return side === 'buy' ? 'Buy' : 'Sell';
}
