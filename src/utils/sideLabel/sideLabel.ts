/**
 * UI-facing label for a trade side. Kept as a small pure function for reuse and easy testing.
 */
export function sideLabel(side: 'buy' | 'sell'): string {
  const labels = {
    buy: 'Buy',
    sell: 'Sell',
  } as const;

  return labels[side];
}
