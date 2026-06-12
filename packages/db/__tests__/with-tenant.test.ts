import { describe, expect, it, vi } from 'vitest';
import { isUuid, withTenant } from '../src/client.js';
import type { Pool, PoolClient } from '../src/client.js';

const TENANT = '11111111-1111-4111-8111-111111111111';

function fakePool(): {
  pool: Pool;
  client: { query: ReturnType<typeof vi.fn>; release: ReturnType<typeof vi.fn> };
} {
  const client = {
    query: vi.fn().mockResolvedValue({ rows: [] }),
    release: vi.fn(),
  };
  const pool = {
    connect: vi.fn().mockResolvedValue(client as unknown as PoolClient),
  } as unknown as Pool;
  return { pool, client };
}

describe('isUuid', () => {
  it('accepts a canonical UUID', () => {
    expect(isUuid(TENANT)).toBe(true);
  });

  it('rejects non-UUID / injection strings', () => {
    expect(isUuid('')).toBe(false);
    expect(isUuid('not-a-uuid')).toBe(false);
    expect(isUuid("'; DROP TABLE app.packs; --")).toBe(false);
    expect(isUuid(`${TENANT}'; DROP`)).toBe(false);
  });
});

describe('withTenant', () => {
  it('opens a tx, sets the tenant GUC, runs fn, commits, releases', async () => {
    const { pool, client } = fakePool();
    const result = await withTenant(pool, TENANT, async () => 'ok');

    expect(result).toBe('ok');
    const calls = client.query.mock.calls.map((c) => c[0] as string);
    expect(calls[0]).toBe('BEGIN');
    expect(calls[1]).toBe(`SET LOCAL app.current_tenant_id = '${TENANT}'`);
    expect(calls).toContain('COMMIT');
    expect(calls).not.toContain('ROLLBACK');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('rolls back and rethrows when fn throws, still releasing', async () => {
    const { pool, client } = fakePool();
    const boom = new Error('boom');

    await expect(
      withTenant(pool, TENANT, async () => {
        throw boom;
      }),
    ).rejects.toBe(boom);

    const calls = client.query.mock.calls.map((c) => c[0] as string);
    expect(calls).toContain('ROLLBACK');
    expect(calls).not.toContain('COMMIT');
    expect(client.release).toHaveBeenCalledTimes(1);
  });

  it('fails closed on a non-UUID tenantId without acquiring a connection', async () => {
    const { pool } = fakePool();
    await expect(withTenant(pool, 'evil', async () => 'x')).rejects.toThrow(/must be a UUID/);
    expect(pool.connect as ReturnType<typeof vi.fn>).not.toHaveBeenCalled();
  });
});
