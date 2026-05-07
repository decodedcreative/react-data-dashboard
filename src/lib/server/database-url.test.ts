import { afterEach, describe, expect, it } from 'vitest';
import {
  assertDatabaseUrlConfigured,
  getDatabaseUrl,
} from './database-url';

const ORIGINAL_ENV = process.env;

describe('database-url', () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it('returns the configured postgres url', () => {
    process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/app_db';

    expect(getDatabaseUrl()).toBe(
      'postgresql://user:pass@localhost:5432/app_db',
    );
  });

  it('throws when DATABASE_URL is missing', () => {
    delete process.env.DATABASE_URL;

    expect(() => getDatabaseUrl()).toThrow(
      'Missing DATABASE_URL. Add DATABASE_URL to your .env.local file.',
    );
  });

  it('throws when DATABASE_URL has non-postgres protocol', () => {
    process.env.DATABASE_URL = 'mysql://user:pass@localhost:3306/app_db';

    expect(() => getDatabaseUrl()).toThrow(
      'DATABASE_URL must use the postgres:// or postgresql:// protocol.',
    );
  });

  it('skips startup assertion in test environment', () => {
    const priorNodeEnv = process.env.NODE_ENV;
    delete process.env.DATABASE_URL;
    process.env.NODE_ENV = 'test';

    expect(() => assertDatabaseUrlConfigured()).not.toThrow();

    process.env.NODE_ENV = priorNodeEnv;
  });
});
