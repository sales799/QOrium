import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createHmac } from 'node:crypto';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server';

const silent = pino({ level: 'silent' });

const config = {
  nodeEnv: 'test' as const,
  port: 0,
  databaseUrl: undefined,
};

const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const SECRET = 'webhook-secret-32-chars-or-longer-please';

const ACTIVE_INTEGRATION = {
  id: 'integration-1',
  tenant_id: TENANT_ID,
  ats_platform: 'greenhouse',
  status: 'active',
  sandbox_mode: false,
  access_token_cipher: 'gh-token-cipher',
  refresh_token_cipher: null,
  api_key_cipher: null,
  webhook_secret_cipher: SECRET,
  tenant_config: {},
};

interface FixtureRow {
  match: (sql: string) => boolean;
  rows: unknown[];
}

function fixturePool(fixtures: FixtureRow[]): Pool {
  const insertedKeys = new Set<string>();
  const integrationRows = new Map<string, unknown>();
  for (const f of fixtures) {
    if (f.match('SELECT id, tenant_id, ats_platform') && f.rows[0]) {
      integrationRows.set('lookup', f.rows[0]);
    }
  }
  return {
    query: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT INTO app.ats_webhook_log')) {
        const idempotencyKey = String(params?.[2] ?? '');
        if (insertedKeys.has(idempotencyKey)) return { rows: [], rowCount: 0 };
        insertedKeys.add(idempotencyKey);
        return { rows: [{ id: `log-${insertedKeys.size}` }], rowCount: 1 };
      }
      if (sql.includes('UPDATE app.ats_webhook_log')) {
        return { rows: [], rowCount: 1 };
      }
      for (const f of fixtures) if (f.match(sql)) return { rows: f.rows };
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => {
      throw new Error('connect not stubbed');
    },
  } as unknown as Pool;
}

function signedBody(body: Record<string, unknown>): { raw: Buffer; signature: string } {
  const raw = Buffer.from(JSON.stringify(body));
  const signature = createHmac('sha256', SECRET).update(raw).digest('hex');
  return { raw, signature };
}

describe('ats-bridge express server', () => {
  it('GET /healthz returns ok with adapter list', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
    expect(r.body.adapters).toEqual(expect.arrayContaining(['greenhouse', 'ashby']));
  });

  it('returns 404 for unknown ATS platform', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app)
      .post(`/webhooks/myspace/${TENANT_ID}`)
      .set('content-type', 'application/json')
      .send('{}');
    expect(r.status).toBe(404);
  });

  it('returns 400 for invalid tenant uuid', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app)
      .post('/webhooks/greenhouse/not-a-uuid')
      .set('content-type', 'application/json')
      .send('{}');
    expect(r.status).toBe(400);
  });

  it('returns 503 when no DB pool is configured', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app)
      .post(`/webhooks/greenhouse/${TENANT_ID}`)
      .set('content-type', 'application/json')
      .send('{}');
    expect(r.status).toBe(503);
  });

  it('returns 404 when no integration exists', async () => {
    const pool = fixturePool([
      { match: (sql) => sql.includes('SELECT id, tenant_id, ats_platform'), rows: [] },
    ]);
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app)
      .post(`/webhooks/greenhouse/${TENANT_ID}`)
      .set('content-type', 'application/json')
      .send('{}');
    expect(r.status).toBe(404);
  });

  it('returns 401 on invalid signature', async () => {
    const pool = fixturePool([
      {
        match: (sql) => sql.includes('SELECT id, tenant_id, ats_platform'),
        rows: [ACTIVE_INTEGRATION],
      },
    ]);
    const app = createServer({ config, logger: silent, pool });
    const { raw } = signedBody({ action: 'candidate.created', payload: {} });
    const r = await request(app)
      .post(`/webhooks/greenhouse/${TENANT_ID}`)
      .set('content-type', 'application/json')
      .set('signature', 'sha256=' + 'a'.repeat(64))
      .send(raw.toString('utf8'));
    expect(r.status).toBe(401);
  });

  it('accepts a valid candidate.created webhook', async () => {
    const pool = fixturePool([
      {
        match: (sql) => sql.includes('SELECT id, tenant_id, ats_platform'),
        rows: [ACTIVE_INTEGRATION],
      },
    ]);
    const app = createServer({ config, logger: silent, pool });
    const { raw, signature } = signedBody({
      action: 'candidate.created',
      payload: {
        id: 'cand-1',
        email_addresses: [{ value: 'a@b.io' }],
        first_name: 'A',
        last_name: 'B',
      },
    });
    const r = await request(app)
      .post(`/webhooks/greenhouse/${TENANT_ID}`)
      .set('content-type', 'application/json')
      .set('signature', `sha256=${signature}`)
      .set('idempotency-key', 'evt-cand-1')
      .send(raw.toString('utf8'));
    expect(r.status).toBe(202);
    expect(r.body).toMatchObject({ status: 'accepted', event_kind: 'assessment-trigger' });
  });

  it('returns duplicate on a replay of the same idempotency key', async () => {
    const pool = fixturePool([
      {
        match: (sql) => sql.includes('SELECT id, tenant_id, ats_platform'),
        rows: [ACTIVE_INTEGRATION],
      },
    ]);
    const app = createServer({ config, logger: silent, pool });
    const { raw, signature } = signedBody({
      action: 'candidate.created',
      payload: { id: 'cand-2', email_addresses: [{ value: 'a@b.io' }] },
    });
    const url = `/webhooks/greenhouse/${TENANT_ID}`;
    const headers = {
      'content-type': 'application/json',
      signature: `sha256=${signature}`,
      'idempotency-key': 'evt-cand-2',
    };
    const r1 = await request(app).post(url).set(headers).send(raw.toString('utf8'));
    const r2 = await request(app).post(url).set(headers).send(raw.toString('utf8'));
    expect(r1.status).toBe(202);
    expect(r2.status).toBe(200);
    expect(r2.body.status).toBe('duplicate');
  });

  it('returns 422 when adapter cannot map the payload', async () => {
    const pool = fixturePool([
      {
        match: (sql) => sql.includes('SELECT id, tenant_id, ats_platform'),
        rows: [ACTIVE_INTEGRATION],
      },
    ]);
    const app = createServer({ config, logger: silent, pool });
    const { raw, signature } = signedBody({
      action: 'candidate.created',
      payload: { id: 'cand-3' /* missing email */ },
    });
    const r = await request(app)
      .post(`/webhooks/greenhouse/${TENANT_ID}`)
      .set('content-type', 'application/json')
      .set('signature', `sha256=${signature}`)
      .set('idempotency-key', 'evt-cand-3')
      .send(raw.toString('utf8'));
    expect(r.status).toBe(422);
  });

  it('returns 403 when integration is not active', async () => {
    const pool = fixturePool([
      {
        match: (sql) => sql.includes('SELECT id, tenant_id, ats_platform'),
        rows: [{ ...ACTIVE_INTEGRATION, status: 'auth_required' }],
      },
    ]);
    const app = createServer({ config, logger: silent, pool });
    const { raw } = signedBody({ action: 'candidate.created', payload: {} });
    const r = await request(app)
      .post(`/webhooks/greenhouse/${TENANT_ID}`)
      .set('content-type', 'application/json')
      .send(raw.toString('utf8'));
    expect(r.status).toBe(403);
  });
});
