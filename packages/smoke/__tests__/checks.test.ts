import { describe, expect, it } from 'vitest';
import { httpHealth, postgresPing, postgresSchema, runChecks, tcpReachable } from '../src/checks';
import type { Pool } from '@qorium/db';

function pool(rows: Record<string, unknown[]>): Pool {
  const lookup = (sql: string): unknown[] => {
    for (const [pattern, fixture] of Object.entries(rows)) {
      if (sql.includes(pattern)) return fixture;
    }
    return [];
  };
  return {
    query: async (sql: string) => ({ rows: lookup(sql) }),
    end: async () => {},
    connect: async () => {
      throw new Error('connect not stubbed');
    },
  } as unknown as Pool;
}

describe('postgresPing', () => {
  it('skips when DATABASE_URL is unset', async () => {
    const r = await postgresPing({ databaseUrl: undefined })();
    expect(r.status).toBe('skip');
  });

  it('passes when SELECT 1 returns ok=1', async () => {
    const r = await postgresPing({
      databaseUrl: 'override',
      pool: pool({ 'SELECT 1': [{ ok: 1 }] }),
    })();
    expect(r.status).toBe('pass');
  });

  it('fails on unexpected response shape', async () => {
    const r = await postgresPing({
      databaseUrl: 'override',
      pool: pool({ 'SELECT 1': [{ ok: 99 }] }),
    })();
    expect(r.status).toBe('fail');
  });
});

describe('postgresSchema', () => {
  it('skips when DATABASE_URL is unset', async () => {
    const r = await postgresSchema({ databaseUrl: undefined })();
    expect(r.status).toBe('skip');
  });

  it('passes when every required table is present', async () => {
    const required = [
      { schema_name: 'app', table_name: 'tenants' },
      { schema_name: 'app', table_name: 'api_keys' },
      { schema_name: 'content', table_name: 'questions' },
      { schema_name: 'content', table_name: 'responses' },
      { schema_name: 'content', table_name: 'leak_alerts' },
      { schema_name: 'content', table_name: 'review_decisions' },
      { schema_name: 'content', table_name: 'calibration_history' },
      { schema_name: 'content', table_name: 'testforge_runs' },
      { schema_name: 'audit', table_name: 'events' },
    ];
    const r = await postgresSchema({
      databaseUrl: 'override',
      pool: pool({ 'information_schema.tables': required }),
    })();
    expect(r.status).toBe('pass');
  });

  it('fails when a required table is missing', async () => {
    const r = await postgresSchema({
      databaseUrl: 'override',
      pool: pool({ 'information_schema.tables': [] }),
    })();
    expect(r.status).toBe('fail');
    expect(r.details).toMatch(/missing tables/);
  });
});

describe('httpHealth', () => {
  it('passes on 200', async () => {
    const fetchImpl = (async () => new Response('ok', { status: 200 })) as unknown as typeof fetch;
    const r = await httpHealth('judge0', { url: 'http://x/about', fetchImpl })();
    expect(r.status).toBe('pass');
  });

  it('honours custom acceptStatuses', async () => {
    // 204 No Content requires a null body per the Response constructor.
    const fetchImpl = (async () => new Response(null, { status: 204 })) as unknown as typeof fetch;
    const r = await httpHealth('judge0', {
      url: 'http://x/about',
      acceptStatuses: [204],
      fetchImpl,
    })();
    expect(r.status).toBe('pass');
  });

  it('fails on unexpected status', async () => {
    const fetchImpl = (async () =>
      new Response('boom', { status: 503 })) as unknown as typeof fetch;
    const r = await httpHealth('judge0', { url: 'http://x/about', fetchImpl })();
    expect(r.status).toBe('fail');
  });
});

describe('tcpReachable', () => {
  it('fails when host:port is unreachable', async () => {
    // 0.0.0.0 :1 should refuse connect
    const r = await tcpReachable('redis', {
      host: '127.0.0.1',
      port: 1,
      timeoutMs: 200,
    })();
    expect(r.status).toBe('fail');
  });
});

describe('runChecks', () => {
  it('aggregates pass / fail / skip counts', async () => {
    const summary = await runChecks([
      async () => ({ name: 'a', status: 'pass', durationMs: 1 }),
      async () => ({ name: 'b', status: 'fail', durationMs: 2, details: 'bad' }),
      async () => ({ name: 'c', status: 'skip', durationMs: 0, skipReason: 'unset' }),
    ]);
    expect(summary.passed).toBe(1);
    expect(summary.failed).toBe(1);
    expect(summary.skipped).toBe(1);
    expect(summary.results).toHaveLength(3);
  });
});
