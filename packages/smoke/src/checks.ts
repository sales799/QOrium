/**
 * Pure-logic healthcheck primitives. Each `Check` is `() => Promise<CheckResult>`
 * and returns a structured outcome the runner can render in any format
 * (CLI table, CI JSON, dashboard).
 */

import { createPool, type Pool } from '@qorium/db';
import { Socket } from 'node:net';

export type Status = 'pass' | 'fail' | 'skip';

export interface CheckResult {
  name: string;
  status: Status;
  durationMs: number;
  details?: string;
  /** Optional reason when status === 'skip'; surfaces in the output. */
  skipReason?: string;
}

export type Check = () => Promise<CheckResult>;

const now = (): number => performance.now();

interface PartialResult {
  status: Status;
  details?: string | undefined;
  skipReason?: string | undefined;
}

function timed(name: string, fn: () => Promise<PartialResult>): Check {
  return async () => {
    const start = now();
    try {
      const partial = await fn();
      const result: CheckResult = {
        name,
        status: partial.status,
        durationMs: Math.round(now() - start),
      };
      if (partial.details !== undefined) result.details = partial.details;
      if (partial.skipReason !== undefined) result.skipReason = partial.skipReason;
      return result;
    } catch (err) {
      return {
        name,
        status: 'fail',
        durationMs: Math.round(now() - start),
        details: err instanceof Error ? err.message : String(err),
      };
    }
  };
}

export interface PostgresCheckOptions {
  databaseUrl: string | undefined;
  /** Optional pre-built pool for tests. */
  pool?: Pool;
}

export function postgresPing(opts: PostgresCheckOptions): Check {
  return timed('postgres.ping', async () => {
    if (!opts.databaseUrl && !opts.pool) {
      return { status: 'skip', skipReason: 'DATABASE_URL not set' };
    }
    const pool = opts.pool ?? createPool({ connectionString: opts.databaseUrl as string, max: 1 });
    try {
      const r = await pool.query<{ ok: number }>('SELECT 1 AS ok');
      const ok = r.rows[0]?.ok === 1;
      return {
        status: ok ? 'pass' : 'fail',
        details: ok ? undefined : 'unexpected response shape',
      };
    } finally {
      if (!opts.pool) await pool.end();
    }
  });
}

const REQUIRED_TABLES: Array<{ schema: string; name: string }> = [
  { schema: 'app', name: 'tenants' },
  { schema: 'app', name: 'api_keys' },
  { schema: 'content', name: 'questions' },
  { schema: 'content', name: 'responses' },
  { schema: 'content', name: 'leak_alerts' },
  { schema: 'content', name: 'review_decisions' },
  { schema: 'content', name: 'calibration_history' },
  { schema: 'content', name: 'testforge_runs' },
  { schema: 'audit', name: 'events' },
];

export function postgresSchema(opts: PostgresCheckOptions): Check {
  return timed('postgres.schema', async () => {
    if (!opts.databaseUrl && !opts.pool) {
      return { status: 'skip', skipReason: 'DATABASE_URL not set' };
    }
    const pool = opts.pool ?? createPool({ connectionString: opts.databaseUrl as string, max: 1 });
    try {
      const r = await pool.query<{ schema_name: string; table_name: string }>(
        `SELECT table_schema AS schema_name, table_name
           FROM information_schema.tables
          WHERE (table_schema, table_name) = ANY ($1::record[])`,
        [REQUIRED_TABLES.map((t) => `(${t.schema},${t.name})`)],
      );
      const seen = new Set(r.rows.map((row) => `${row.schema_name}.${row.table_name}`));
      const missing = REQUIRED_TABLES.filter((t) => !seen.has(`${t.schema}.${t.name}`));
      if (missing.length === 0) {
        return {
          status: 'pass',
          details: `${REQUIRED_TABLES.length}/${REQUIRED_TABLES.length} tables present`,
        };
      }
      return {
        status: 'fail',
        details: `missing tables: ${missing.map((t) => `${t.schema}.${t.name}`).join(', ')}`,
      };
    } finally {
      if (!opts.pool) await pool.end();
    }
  });
}

export interface TcpCheckOptions {
  host: string;
  port: number;
  /** Connect timeout in ms. Default 2_000. */
  timeoutMs?: number;
}

/** Pure TCP open-connection check (Redis, Judge0 host-down detection, etc.). */
export function tcpReachable(label: string, opts: TcpCheckOptions): Check {
  return timed(`tcp.${label}`, async () => {
    const timeout = opts.timeoutMs ?? 2_000;
    const sock = new Socket();
    try {
      await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => {
          sock.destroy();
          reject(new Error(`tcp connect timed out after ${timeout} ms`));
        }, timeout);
        sock.once('connect', () => {
          clearTimeout(timer);
          sock.end();
          resolve();
        });
        sock.once('error', (err) => {
          clearTimeout(timer);
          reject(err);
        });
        sock.connect(opts.port, opts.host);
      });
      return { status: 'pass', details: `${opts.host}:${opts.port} reachable` };
    } finally {
      sock.destroy();
    }
  });
}

export interface HttpCheckOptions {
  url: string;
  /** Acceptable status codes; default `[200]`. */
  acceptStatuses?: number[];
  /** Per-request timeout (ms). Default 5_000. */
  timeoutMs?: number;
  /** Optional fetch override (tests). */
  fetchImpl?: typeof fetch;
}

export function httpHealth(label: string, opts: HttpCheckOptions): Check {
  return timed(`http.${label}`, async () => {
    const timeout = opts.timeoutMs ?? 5_000;
    const fetchImpl = opts.fetchImpl ?? fetch;
    const accept = new Set(opts.acceptStatuses ?? [200]);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(new Error('timed out')), timeout);
    try {
      const res = await fetchImpl(opts.url, { signal: ctrl.signal });
      if (accept.has(res.status)) {
        return { status: 'pass', details: `${opts.url} → ${res.status}` };
      }
      return {
        status: 'fail',
        details: `${opts.url} → ${res.status} (expected one of ${[...accept].join(', ')})`,
      };
    } finally {
      clearTimeout(timer);
    }
  });
}

export interface RunSummary {
  results: CheckResult[];
  passed: number;
  failed: number;
  skipped: number;
  durationMs: number;
}

export async function runChecks(checks: readonly Check[]): Promise<RunSummary> {
  const start = now();
  const results: CheckResult[] = [];
  for (const c of checks) results.push(await c());
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  for (const r of results) {
    if (r.status === 'pass') passed++;
    else if (r.status === 'fail') failed++;
    else skipped++;
  }
  return { results, passed, failed, skipped, durationMs: Math.round(now() - start) };
}
