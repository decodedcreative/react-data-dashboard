/**
 * UI-facing label for a trade side. Kept as a small pure function for reuse and easy testing.
 */
export const sideLabel = (side: 'buy' | 'sell'): string => {
  // Exhaustive mapping keeps side labels centralized and type-safe.
  const labels = {
    buy: 'Buy',
    sell: 'Sell',
  } as const;

  return labels[side];
}
