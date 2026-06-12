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

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** True if `value` is a syntactically valid UUID. Pure, injection-safe guard. */
export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

/**
 * Run `fn` inside a transaction that has the tenant GUC set via
 * `SET LOCAL app.current_tenant_id`. This is the app-layer half of the RLS
 * tenant-isolation contract (migration drafts/0020_rls_tenant_isolation.sql).
 *
 * It is a NO-OP for data visibility until RLS policies are enabled on the
 * target DB — the GUC is simply set and ignored by Postgres. Wiring it now
 * lets handlers become RLS-ready ahead of the staging-first 0020 promotion,
 * so flipping RLS on never starts an outage (sessions already self-scope).
 *
 * `SET LOCAL` cannot be parameterised, so `tenantId` is UUID-validated before
 * interpolation — fail-closed: a non-UUID throws before any connection is
 * acquired.
 */
export async function withTenant<T>(
  pool: Pool,
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  if (!isUuid(tenantId)) {
    throw new Error(`withTenant: tenantId must be a UUID, got ${JSON.stringify(tenantId)}`);
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(`SET LOCAL app.current_tenant_id = '${tenantId}'`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK').catch(() => undefined);
    throw err;
  } finally {
    client.release();
  }
}
