import 'server-only';
import { Pool } from 'pg';
import { getDatabaseUrl } from './database-url';

let pool: Pool | null = null;

export const getDbPool = (): Pool => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    connectionString: getDatabaseUrl(),
  });

  return pool;
};
