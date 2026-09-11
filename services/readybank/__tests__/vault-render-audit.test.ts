import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { stackVaultRouter } from '../src/routes/stack-vault.js';
import { problemHandler } from '../src/middleware/problem.js';
const tenant = '11111111-1111-4111-8111-111111111111';
const question = '22222222-2222-4222-8222-222222222222';
const key = '33333333-3333-4333-8333-333333333333';
const pepper = 'synthetic-private-pepper-'.repeat(2);
function setup(fail = false) {
  const audit: unknown[][] = [];
  const pool = {
    query: async (sql: string, params: unknown[]) => {
      if (sql.includes('INSERT INTO audit.events')) {
        if (fail) throw new Error('secret-provider-detail');
        audit.push(params);
        return { rows: [] };
      }
      if (sql.includes('FROM app.tenant_stack_vaults'))
        return {
          rows: [
            {
              tenant_id: tenant,
              tier: 'gold',
              annual_floor_paise: '100',
              contract_expires_at: new Date('2999-01-01'),
              status: 'active',
              watermark_pepper_enc: pepper,
            },
          ],
        };
      return {
        rows: [
          {
            uuid: question,
            qor_id: 'synthetic-q',
            format: 'mcq',
            language: 'en',
            body_md: 'Confidential example content',
            body_json: { prompt: 'private structured prompt' },
            watermark_seed: 'synthetic-seed',
            created_at: new Date('2026-01-01'),
            difficulty_b: null,
          },
        ],
      };
    },
  } as unknown as Pool;
  const app = express();
  app.use((req, _res, next) => {
    (req as AuthenticatedRequest).auth = {
      tenantId: tenant,
      apiKeyId: key,
      prefix: 'qor_test',
      scopes: ['stack-vault:read'],
      name: null,
    };
    next();
  });
  app.use('/v1', stackVaultRouter({ pool }));
  app.use(problemHandler());
  return { app, audit };
}
describe('watermark render audit', () => {
  it('persists scoped render evidence without private content or pepper', async () => {
    const { app, audit } = setup();
    const res = await request(app).get(`/v1/stack-vault/questions/${question}`);
    expect(res.status).toBe(200);
    expect(audit).toHaveLength(1);
    const values = audit[0]!;
    expect(values.slice(0, 6)).toEqual([
      'api_key',
      null,
      tenant,
      'stack_vault.question.render_prepared',
      'question',
      question,
    ]);
    const payload = JSON.parse(values[7] as string);
    expect(payload).toMatchObject({
      api_key_id: key,
      render_id: res.body.watermark.render_id,
      footer: res.body.watermark.footer,
    });
    expect(payload.content_sha256).toBe(
      createHash('sha256')
        .update(JSON.stringify({ body_md: res.body.body_md, body_json: res.body.body_json }))
        .digest('hex'),
    );
    expect(JSON.stringify(values)).not.toContain(pepper);
    expect(JSON.stringify(values)).not.toContain('private structured prompt');
    expect(JSON.stringify(values)).not.toContain('Confidential example content');
  });
  it('withholds rendered content if audit persistence fails', async () => {
    const res = await request(setup(true).app).get(`/v1/stack-vault/questions/${question}`);
    expect(res.status).toBe(503);
    expect(res.body).not.toHaveProperty('body_md');
    expect(res.body).not.toHaveProperty('watermark');
    expect(JSON.stringify(res.body)).not.toContain('secret-provider-detail');
  });
  it('retains distinct evidence for separate render requests', async () => {
    const { app, audit } = setup();
    await request(app).get(`/v1/stack-vault/questions/${question}`);
    await request(app).get(`/v1/stack-vault/questions/${question}`);
    expect(audit).toHaveLength(2);
    expect(JSON.parse(audit[0]![7] as string).render_id).not.toBe(
      JSON.parse(audit[1]![7] as string).render_id,
    );
  });
});
