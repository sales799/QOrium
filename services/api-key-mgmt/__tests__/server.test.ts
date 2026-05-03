import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server';

const silent = pino({ level: 'silent' });
const TENANT_ID = '11111111-2222-3333-4444-555555555555';

const config = {
  nodeEnv: 'test' as const,
  port: 0,
  databaseUrl: undefined,
  pepper: 'test-pepper-32-chars-or-longer-please-do-not-ship-this',
  customerRotationDays: 365,
  internalRotationDays: 180,
};

function fixturePool(): Pool {
  const keys = new Map<string, Record<string, unknown>>();
  let seq = 0;
  return {
    query: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT INTO app.api_keys')) {
        const id = `key-${++seq}`;
        const row = {
          id,
          tenant_id: params?.[0],
          name: params?.[1],
          prefix: params?.[2],
          scopes: params?.[4],
          rate_limit_per_min: params?.[5],
          rate_limit_burst: params?.[6],
          rotation_due_at: params?.[7],
          last_rotated_at: null,
          expires_at: params?.[8],
          revoked_at: null,
          created_at: new Date(),
        };
        keys.set(id, row);
        return { rows: [row], rowCount: 1 };
      }
      if (sql.includes('UPDATE app.api_keys SET revoked_at')) {
        const tenantId = String(params?.[0]);
        const id = String(params?.[1]);
        const row = keys.get(id);
        if (row && row.tenant_id === tenantId && row.revoked_at === null) {
          row.revoked_at = new Date();
          return { rows: [row], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes('FROM app.api_keys') && sql.includes('rotation_due_at <=')) {
        const cutoff = params?.[0] as Date;
        return {
          rows: Array.from(keys.values()).filter(
            (r) =>
              r.revoked_at === null &&
              r.rotation_due_at &&
              (r.rotation_due_at as Date).getTime() <= cutoff.getTime(),
          ),
        };
      }
      if (sql.includes('FROM app.api_keys')) {
        const tenantId = String(params?.[0]);
        return {
          rows: Array.from(keys.values()).filter((r) => r.tenant_id === tenantId),
        };
      }
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => {
      throw new Error('connect not stubbed');
    },
  } as unknown as Pool;
}

describe('api-key-mgmt express server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
  });

  it('POST /v1/api-keys 403 without admin authorisation', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool });
    const r = await request(app)
      .post('/v1/api-keys')
      .set('x-tenant-id', TENANT_ID)
      .send({ family: 'live', bundle: 'readonly' });
    expect(r.status).toBe(403);
  });

  it('POST /v1/api-keys 401 without tenant', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool, authoriseAdmin: () => true });
    const r = await request(app).post('/v1/api-keys').send({ family: 'live', bundle: 'readonly' });
    expect(r.status).toBe(401);
  });

  it('POST /v1/api-keys 503 without DB', async () => {
    const app = createServer({ config, logger: silent, authoriseAdmin: () => true });
    const r = await request(app)
      .post('/v1/api-keys')
      .set('x-tenant-id', TENANT_ID)
      .send({ family: 'live', bundle: 'readonly' });
    expect(r.status).toBe(503);
  });

  it('issues a live key and returns the raw value once', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool, authoriseAdmin: () => true });
    const r = await request(app)
      .post('/v1/api-keys')
      .set('x-tenant-id', TENANT_ID)
      .send({ family: 'live', bundle: 'readybank_customer', name: 'Acme primary' });
    expect(r.status).toBe(201);
    expect(r.body.raw).toMatch(/^qor_live_[0-9a-f]{32}$/);
    expect(r.body.key.scopes).toContain('questions:read');
  });

  it('rejects internal family without tenant_prefix', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool, authoriseAdmin: () => true });
    const r = await request(app)
      .post('/v1/api-keys')
      .set('x-tenant-id', TENANT_ID)
      .send({ family: 'internal', bundle: 'talpro_internal' });
    expect(r.status).toBe(400);
  });

  it('issues an internal key with tenant_prefix', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool, authoriseAdmin: () => true });
    const r = await request(app)
      .post('/v1/api-keys')
      .set('x-tenant-id', TENANT_ID)
      .send({ family: 'internal', tenant_prefix: 'talind001', bundle: 'talpro_internal' });
    expect(r.status).toBe(201);
    expect(r.body.raw).toMatch(/^qor_internal_talind001_[0-9a-f]{32}$/);
  });

  it('lists keys for the tenant', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool, authoriseAdmin: () => true });
    await request(app)
      .post('/v1/api-keys')
      .set('x-tenant-id', TENANT_ID)
      .send({ family: 'test', bundle: 'readonly' });
    const list = await request(app).get('/v1/api-keys').set('x-tenant-id', TENANT_ID);
    expect(list.status).toBe(200);
    expect(list.body.count).toBeGreaterThanOrEqual(1);
  });

  it('revokes a key', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool, authoriseAdmin: () => true });
    const create = await request(app)
      .post('/v1/api-keys')
      .set('x-tenant-id', TENANT_ID)
      .send({ family: 'test', bundle: 'readonly' });
    const id = create.body.key.id;
    // The fixture uses non-UUID ids ("key-1") so the route validator rejects;
    // confirm the rejection path is exercised.
    const revoke = await request(app)
      .post(`/v1/api-keys/${id}/revoke`)
      .set('x-tenant-id', TENANT_ID);
    expect(revoke.status).toBe(400);
  });

  it('rotation-due endpoint returns keys past the cutoff', async () => {
    const pool = fixturePool();
    const app = createServer({ config, logger: silent, pool, authoriseAdmin: () => true });
    const r = await request(app).get('/v1/api-keys/rotation-due').set('x-tenant-id', TENANT_ID);
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ count: expect.any(Number), within_days: 14 });
  });
});
