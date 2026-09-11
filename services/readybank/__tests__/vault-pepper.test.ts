import { describe, expect, it, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import { pino } from 'pino';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { requireActiveVault, type VaultedRequest } from '../src/middleware/tenant-isolation.js';
import { problemHandler } from '../src/middleware/problem.js';
import { createServer } from '../src/server.js';
import { loadConfig } from '../src/config.js';

const auth = (req: express.Request, _res: express.Response, next: express.NextFunction) => {
  (req as AuthenticatedRequest).auth = {
    apiKeyId: 'synthetic',
    tenantId: 'synthetic',
    prefix: 'qor_test',
    scopes: ['stack-vault:read'],
    name: null,
  };
  next();
};
function fixture() {
  const query = vi.fn(async () => ({
    rows: [
      {
        tenant_id: 'synthetic',
        tier: 'bronze',
        annual_floor_paise: '100',
        contract_expires_at: new Date('2999-01-01'),
        status: 'active',
        watermark_pepper_enc: 'synthetic-ciphertext',
      },
    ],
  }));
  return { query, pool: { query } as unknown as Pool };
}
function appFor(nodeEnv: string, decryptVaultPepper?: (value: string) => string) {
  const { pool, query } = fixture();
  const app = express();
  app.use(auth);
  const deps = { pool, nodeEnv, ...(decryptVaultPepper ? { decryptVaultPepper } : {}) };
  app.use(requireActiveVault(deps));
  app.get('/', (req, res) => res.json({ hasVault: Boolean((req as VaultedRequest).vault) }));
  app.use(problemHandler());
  return { app, query };
}
describe('vault pepper configuration', () => {
  it.each(['production', 'staging', 'unknown'])(
    'refuses identity fallback in %s',
    async (nodeEnv) => {
      const { app, query } = appFor(nodeEnv);
      const res = await request(app).get('/');
      expect(res.status).toBe(503);
      expect(query).not.toHaveBeenCalled();
    },
  );
  it.each(['development', 'test'])('retains explicit %s fixture fallback', async (nodeEnv) => {
    expect((await request(appFor(nodeEnv).app).get('/')).status).toBe(200);
  });
  it('accepts a configured decryptor', async () => {
    const decrypt = vi.fn(() => 'synthetic-decrypted-pepper');
    expect((await request(appFor('production', decrypt).app).get('/')).status).toBe(200);
    expect(decrypt).toHaveBeenCalledWith('synthetic-ciphertext');
  });
  it.each(['throws', 'empty'])('returns safe503 when decryptor %s', async (mode) => {
    const decrypt = () => {
      if (mode === 'throws') throw new Error('synthetic-secret-in-error');
      return '';
    };
    const res = await request(appFor('production', decrypt).app).get('/');
    expect(res.status).toBe(503);
    expect(JSON.stringify(res.body)).not.toContain('synthetic-secret-in-error');
  });
  it('propagates server production config even under the test process environment', async () => {
    const { pool, query } = fixture();
    const config = { ...loadConfig(), nodeEnv: 'production' as const, sentryDsn: undefined };
    const { app } = createServer({
      pool,
      config,
      authMiddleware: auth,
      logger: pino({ level: 'silent' }),
    });
    expect((await request(app).get('/v1/stack-vault/questions')).status).toBe(503);
    expect(query).not.toHaveBeenCalled();
  });
  it('exposes server decryptor injection to vault middleware', async () => {
    const { pool } = fixture();
    const config = { ...loadConfig(), nodeEnv: 'production' as const, sentryDsn: undefined };
    const decryptVaultPepper = vi.fn(() => 'synthetic-decrypted-pepper');
    const deps = {
      pool,
      config,
      authMiddleware: auth,
      logger: pino({ level: 'silent' }),
      decryptVaultPepper,
    };
    const { app } = createServer(deps);
    expect((await request(app).get('/v1/stack-vault/questions')).status).toBe(200);
    expect(decryptVaultPepper).toHaveBeenCalledWith('synthetic-ciphertext');
  });
});
