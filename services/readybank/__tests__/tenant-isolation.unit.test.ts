import { describe, it, expect, vi } from 'vitest';
import type { Pool } from '@qorium/db';
import type { Response, NextFunction } from 'express';
import { requireActiveVault, type VaultedRequest } from '../src/middleware/tenant-isolation.js';
import { HttpProblem } from '../src/middleware/problem.js';

const TENANT_A = '11111111-1111-1111-1111-111111111111';
const NOW = new Date('2026-05-08T12:00:00Z');
const FUTURE = new Date('2027-05-08T12:00:00Z');
const PAST = new Date('2026-05-01T12:00:00Z');

function makePool(rows: unknown[]): Pool {
  return {
    query: vi.fn().mockResolvedValue({ rows, rowCount: rows.length }),
  } as unknown as Pool;
}

function makeReq(authOverrides: Partial<VaultedRequest['auth']> = {}): VaultedRequest {
  return {
    auth: {
      apiKeyId: 'k_1',
      tenantId: TENANT_A,
      prefix: 'qor_live',
      scopes: [],
      name: null,
      ...authOverrides,
    },
  } as VaultedRequest;
}

function makeRes(): Response {
  return {} as Response;
}

function callMiddleware(
  pool: Pool,
  req: VaultedRequest,
  opts: { now?: Date; decryptVaultPepper?: (s: string) => string } = {},
): Promise<{ err?: unknown; req: VaultedRequest }> {
  return new Promise((resolve) => {
    const next: NextFunction = (err?: unknown) => resolve({ err, req });
    const mw = requireActiveVault({
      pool,
      ...(opts.decryptVaultPepper && { decryptVaultPepper: opts.decryptVaultPepper }),
      now: () => opts.now ?? NOW,
    });
    void mw(req, makeRes(), next);
  });
}

describe('requireActiveVault', () => {
  it('returns 401 when req.auth is missing', async () => {
    const pool = makePool([]);
    const req = { auth: undefined } as VaultedRequest;
    const { err } = await callMiddleware(pool, req);
    expect(err).toBeInstanceOf(HttpProblem);
    expect((err as HttpProblem).status).toBe(401);
  });

  it('returns 403 when scope contains export:stack-vault (SO-10)', async () => {
    const pool = makePool([]);
    const req = makeReq({ scopes: ['questions:read', 'export:stack-vault'] });
    const { err } = await callMiddleware(pool, req);
    expect(err).toBeInstanceOf(HttpProblem);
    expect((err as HttpProblem).status).toBe(403);
  });

  it('returns 404 when no vault row exists (no existence leak)', async () => {
    const pool = makePool([]);
    const req = makeReq();
    const { err } = await callMiddleware(pool, req);
    expect(err).toBeInstanceOf(HttpProblem);
    expect((err as HttpProblem).status).toBe(404);
  });

  it('returns 404 when vault status is lapsed', async () => {
    const pool = makePool([
      {
        tenant_id: TENANT_A,
        tier: 'silver',
        annual_floor_paise: '4000000000',
        contract_expires_at: FUTURE,
        status: 'lapsed',
        watermark_pepper_enc: 'pepper-enc-32-chars-aaaaaaaaaaaa',
      },
    ]);
    const req = makeReq();
    const { err } = await callMiddleware(pool, req);
    expect((err as HttpProblem).status).toBe(404);
  });

  it('returns 404 when contract has expired', async () => {
    const pool = makePool([
      {
        tenant_id: TENANT_A,
        tier: 'gold',
        annual_floor_paise: '10000000000',
        contract_expires_at: PAST, // already expired
        status: 'active',
        watermark_pepper_enc: 'pepper-enc-32-chars-aaaaaaaaaaaa',
      },
    ]);
    const { err } = await callMiddleware(pool, makeReq());
    expect((err as HttpProblem).status).toBe(404);
  });

  it('returns 503 when vault is active but pepper is missing', async () => {
    const pool = makePool([
      {
        tenant_id: TENANT_A,
        tier: 'bronze',
        annual_floor_paise: '1000000000',
        contract_expires_at: FUTURE,
        status: 'active',
        watermark_pepper_enc: null,
      },
    ]);
    const { err } = await callMiddleware(pool, makeReq());
    expect((err as HttpProblem).status).toBe(503);
  });

  it('attaches vault context to req on success', async () => {
    const pool = makePool([
      {
        tenant_id: TENANT_A,
        tier: 'silver',
        annual_floor_paise: '4000000000',
        contract_expires_at: FUTURE,
        status: 'active',
        watermark_pepper_enc: 'enc:pepper-payload',
      },
    ]);
    const decrypt = vi.fn().mockReturnValue('pepper-decrypted-32-chars-aaaaaa');
    const { err, req } = await callMiddleware(pool, makeReq(), { decryptVaultPepper: decrypt });
    expect(err).toBeUndefined();
    expect(req.vault).toBeDefined();
    expect(req.vault?.tenantId).toBe(TENANT_A);
    expect(req.vault?.tier).toBe('silver');
    expect(req.vault?.annualFloorPaise).toBe(4_000_000_000n);
    expect(req.vault?.watermarkPepper).toBe('pepper-decrypted-32-chars-aaaaaa');
    expect(decrypt).toHaveBeenCalledWith('enc:pepper-payload');
  });

  it('uses identity decrypt when none injected', async () => {
    const pool = makePool([
      {
        tenant_id: TENANT_A,
        tier: 'bronze',
        annual_floor_paise: '1000000000',
        contract_expires_at: FUTURE,
        status: 'active',
        watermark_pepper_enc: 'raw-pepper-when-no-decrypt-aaaaaa',
      },
    ]);
    const { err, req } = await callMiddleware(pool, makeReq());
    expect(err).toBeUndefined();
    expect(req.vault?.watermarkPepper).toBe('raw-pepper-when-no-decrypt-aaaaaa');
  });
});
