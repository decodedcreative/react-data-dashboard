/**
 * Configuration for the Alpaca data provider. Loaded from env vars at
 * the provider construction site so the rest of the module stays
 * IO-free and unit-testable.
 */
export interface AlpacaConfig {
  baseUrl: string;
  keyId: string;
  secretKey: string;
  /** Trader name attributed to synced orders (Alpaca exposes no per-order trader). */
  trader: string;
}

const DEFAULT_BASE_URL = 'https://paper-api.alpaca.markets';
const DEFAULT_TRADER = 'Alpaca Paper';

export class AlpacaConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlpacaConfigError';
  }
}

/**
 * Read Alpaca configuration from a process env object. Throws with a clear
 * message if required keys are missing — the sync script surfaces this to
 * the user, but downstream code can assume the config is valid.
 */
export function loadAlpacaConfig(
  env: NodeJS.ProcessEnv = process.env
): AlpacaConfig {
  const keyId = env.ALPACA_API_KEY_ID;
  const secretKey = env.ALPACA_API_SECRET_KEY;

  if (!keyId) {
    throw new AlpacaConfigError(
      'ALPACA_API_KEY_ID is not set. Add it to .env.local or your shell.'
    );
  }
  if (!secretKey) {
    throw new AlpacaConfigError(
      'ALPACA_API_SECRET_KEY is not set. Add it to .env.local or your shell.'
    );
  }

  return {
    baseUrl: env.ALPACA_BASE_URL ?? DEFAULT_BASE_URL,
    keyId,
    secretKey,
    trader: env.ALPACA_TRADER_NAME ?? DEFAULT_TRADER,
  };
}
