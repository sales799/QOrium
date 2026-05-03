import pg from 'pg';
import { resolveDatabaseUrl } from './env.js';

const { Pool } = pg;

export type Pool = pg.Pool;
export type PoolClient = pg.PoolClient;
export type QueryResult<T extends pg.QueryResultRow = pg.QueryResultRow> = pg.QueryResult<T>;

export interface CreatePoolOptions {
  connectionString?: string;
  max?: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
  applicationName?: string;
}

const DEFAULT_POOL_OPTIONS = {
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
} as const;

export function createPool(options: CreatePoolOptions = {}): Pool {
  const connectionString = options.connectionString ?? resolveDatabaseUrl();

  return new Pool({
    connectionString,
    max: options.max ?? DEFAULT_POOL_OPTIONS.max,
    idleTimeoutMillis: options.idleTimeoutMillis ?? DEFAULT_POOL_OPTIONS.idleTimeoutMillis,
    connectionTimeoutMillis:
      options.connectionTimeoutMillis ?? DEFAULT_POOL_OPTIONS.connectionTimeoutMillis,
    application_name: options.applicationName ?? 'qorium',
  });
}

/**
 * Run a single SELECT 1 round-trip to verify the pool can reach Postgres.
 * Returns true on success; false on any error (caller can log + alert).
 */
export async function ping(pool: Pool): Promise<boolean> {
  try {
    const result = await pool.query<{ ok: number }>('SELECT 1 AS ok');
    return result.rows[0]?.ok === 1;
  } catch {
    return false;
  }
}
