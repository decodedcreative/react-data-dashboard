import 'server-only';

const DATABASE_PROTOCOLS = new Set(['postgres:', 'postgresql:']);

const parseDatabaseUrl = (rawValue: string | undefined): string => {
  if (!rawValue) {
    throw new Error(
      'Missing DATABASE_URL. Add DATABASE_URL to your .env.local file.',
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(rawValue);
  } catch {
    throw new Error('DATABASE_URL is not a valid URL.');
  }

  if (!DATABASE_PROTOCOLS.has(parsedUrl.protocol)) {
    throw new Error(
      'DATABASE_URL must use the postgres:// or postgresql:// protocol.',
    );
  }

  return rawValue;
};

export const getDatabaseUrl = (): string => {
  return parseDatabaseUrl(process.env.DATABASE_URL);
};

export const assertDatabaseUrlConfigured = (): void => {
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  void getDatabaseUrl();
};
