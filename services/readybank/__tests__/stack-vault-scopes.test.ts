import { describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { stackVaultRouter } from '../src/routes/stack-vault.js';
import { problemHandler } from '../src/middleware/problem.js';

const tenant = '00000000-0000-4000-8000-000000000001';
const id = '00000000-0000-4000-8000-000000000002';
const body = {
  qor_id: 'synthetic',
  format: 'mcq',
  language: 'en',
  body_md: 'synthetic',
  body_json: {},
  watermark_seed: 'synthetic-seed',
};
function setup(scopes: string[]) {
  const query = vi.fn(async (sql: string, _params?: unknown[]) => {
    if (sql.includes('FROM app.tenant_stack_vaults'))
      return {
        rows: [
          {
            tenant_id: tenant,
            tier: 'gold',
            annual_floor_paise: '100000000',
            contract_expires_at: new Date('2999-01-01'),
            status: 'active',
            watermark_pepper_enc: 'synthetic-pepper',
          },
        ],
      };
    if (sql.includes('INSERT INTO')) return { rows: [{ uuid: id }] };
    return { rows: [] };
  });
  const app = express();
  app.use(express.json());
  app.use((req, _res, next) => {
    (req as AuthenticatedRequest).auth = {
      apiKeyId: id,
      tenantId: tenant,
      prefix: 'qor_test',
      scopes,
      name: 'synthetic',
    };
    next();
  });
  app.use('/v1', stackVaultRouter({ pool: { query } as unknown as Pool }));
  app.use(problemHandler());
  return { app, query };
}

describe('Stack-Vault operation scopes', () => {
  it.each([[], ['stack-vault:read'], ['questions:write']].map((scopes) => ({ scopes })))(
    'rejects authoring without vault write scope %j',
    async ({ scopes }) => {
      const { app, query } = setup(scopes);
      expect((await request(app).post('/v1/stack-vault/questions').send(body)).status).toBe(403);
      expect(query).not.toHaveBeenCalled();
    },
  );
  it.each([[], ['stack-vault:write'], ['questions:read']].map((scopes) => ({ scopes })))(
    'rejects reads without vault read scope %j',
    async ({ scopes }) => {
      const { app, query } = setup(scopes);
      expect((await request(app).get('/v1/stack-vault/questions')).status).toBe(403);
      expect((await request(app).get(`/v1/stack-vault/questions/${id}`)).status).toBe(403);
      expect(query).not.toHaveBeenCalled();
    },
  );
  it('permits an explicitly scoped writer and pins the insert to the authenticated tenant', async () => {
    const { app, query } = setup(['stack-vault:write']);
    expect(
      (
        await request(app)
          .post('/v1/stack-vault/questions')
          .send({ ...body, tenant_id: id })
      ).status,
    ).toBe(201);
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1]?.[1]).toContain(tenant);
  });
  it('permits a scoped reader through the vault and tenant-bound repository', async () => {
    const { app, query } = setup(['stack-vault:read']);
    expect((await request(app).get('/v1/stack-vault/questions')).status).toBe(200);
    expect(query).toHaveBeenCalledTimes(2);
  });
  it('continues to reject forbidden export scope even with write permission', async () => {
    const { app, query } = setup(['stack-vault:write', 'export:stack-vault']);
    expect((await request(app).post('/v1/stack-vault/questions').send(body)).status).toBe(403);
    expect(query).not.toHaveBeenCalled();
  });
});
