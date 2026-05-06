import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server.js';

const silent = pino({ level: 'silent' });
const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const EVENT_ID = '22222222-3333-4444-5555-666666666666';

const config = {
  nodeEnv: 'test' as const,
  port: 0,
  databaseUrl: undefined,
  maxLimit: 200,
  defaultLimit: 50,
};

interface FakePool extends Pool {
  calls: { sql: string; params: unknown[] }[];
}

function fixturePool(rows: Record<string, unknown[]>): FakePool {
  const calls: { sql: string; params: unknown[] }[] = [];
  const pool = {
    query: async (sql: string, params: unknown[] = []) => {
      calls.push({ sql, params });
      if (sql.includes('FROM audit.events')) {
        if (sql.includes('GROUP BY')) return { rows: rows.summary ?? [] };
        if (sql.includes('COUNT(*)')) return { rows: rows.count ?? [{ total: '0' }] };
        if (sql.includes('AND id =')) return { rows: rows.byId ?? [] };
        if (sql.includes('LIMIT')) return { rows: rows.list ?? [] };
      }
      if (sql.includes('INSERT INTO audit.events')) {
        return { rows: rows.insert ?? [] };
      }
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => {
      throw new Error('connect not stubbed');
    },
    calls,
  } as unknown as FakePool;
  return pool;
}

const tenantHeader = { 'x-tenant-id': TENANT_ID };

describe('audit-log express server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: 'ok', service: 'qorium-audit-log' });
  });

  it('returns 503 with no DB pool', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/v1/audit/events').set(tenantHeader);
    expect(r.status).toBe(503);
  });

  it('returns 401 without a tenant', async () => {
    const pool = fixturePool({});
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app).get('/v1/audit/events');
    expect(r.status).toBe(401);
  });

  it('lists events with default pagination', async () => {
    const pool = fixturePool({
      list: [
        {
          id: EVENT_ID,
          tenant_id: TENANT_ID,
          actor_id: null,
          actor_type: 'user',
          event_type: 'question.viewed',
          entity_type: 'question',
          entity_id: 'q_1',
          changes: null,
          payload: { sku: 'readybank' },
          ip_address: '203.0.113.1',
          user_agent: 'Mozilla/5.0',
          occurred_at: new Date('2026-05-02T14:30:00Z'),
        },
      ],
      count: [{ total: '1' }],
    });
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app).get('/v1/audit/events').set(tenantHeader);
    expect(r.status).toBe(200);
    expect(r.body.total).toBe(1);
    expect(r.body.limit).toBe(50);
    expect(r.body.events[0].action).toBe('question.viewed');
    expect(r.body.events[0].resourceType).toBe('question');
  });

  it('rejects invalid date formats with 400', async () => {
    const pool = fixturePool({});
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app)
      .get('/v1/audit/events')
      .query({ start_date: 'yesterday' })
      .set(tenantHeader);
    expect(r.status).toBe(400);
  });

  it('returns 404 for an unknown event id', async () => {
    const pool = fixturePool({ byId: [] });
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app).get(`/v1/audit/events/${EVENT_ID}`).set(tenantHeader);
    expect(r.status).toBe(404);
  });

  it('returns 400 for a malformed event id', async () => {
    const pool = fixturePool({});
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app).get('/v1/audit/events/not-a-uuid').set(tenantHeader);
    expect(r.status).toBe(400);
  });

  it('GET /v1/audit/summary returns top-N', async () => {
    const pool = fixturePool({
      summary: [
        { action: 'question.viewed', count: 42 },
        { action: 'auth.login_success', count: 17 },
      ],
    });
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app)
      .get('/v1/audit/summary')
      .query({ start_date: '2026-05-01T00:00:00Z', end_date: '2026-06-01T00:00:00Z', top: 5 })
      .set(tenantHeader);
    expect(r.status).toBe(200);
    expect(r.body.top).toEqual([
      { action: 'question.viewed', count: 42 },
      { action: 'auth.login_success', count: 17 },
    ]);
  });

  it('POST /v1/audit/events rejected without admin scope', async () => {
    const pool = fixturePool({});
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app)
      .post('/v1/audit/events')
      .set(tenantHeader)
      .send({ action: 'audit.export_requested' });
    expect(r.status).toBe(403);
  });

  it('POST /v1/audit/events accepted with admin scope', async () => {
    const pool = fixturePool({
      insert: [
        {
          id: EVENT_ID,
          tenant_id: TENANT_ID,
          actor_id: null,
          actor_type: 'system',
          event_type: 'audit.export_requested',
          entity_type: null,
          entity_id: null,
          changes: null,
          payload: {},
          ip_address: null,
          user_agent: null,
          occurred_at: new Date('2026-05-03T00:00:00Z'),
        },
      ],
    });
    const app = createServer({
      config,
      logger: silent,
      pool,
      authoriseSystemWrite: () => true,
    });
    const r = await request(app)
      .post('/v1/audit/events')
      .set(tenantHeader)
      .send({ action: 'audit.export_requested', tenant_id: TENANT_ID });
    expect(r.status).toBe(201);
    expect(r.body.action).toBe('audit.export_requested');
  });
});
