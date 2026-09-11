import { createHmac, randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import { createPool, type Pool } from '@qorium/db';
import {
  createSessionStore,
  SessionStoreUnavailable,
  type SessionKey,
} from '../src/auth/session-store.js';
const url = process.env.QORIUM_SESSION_TEST_DATABASE_URL;
describe.skipIf(!url)('durable sessions on isolated PostgreSQL', () => {
  let admin: Pool, pool: Pool, readonlyPool: Pool;
  let created = false;
  const database = `qorium_sessions_${randomUUID().replaceAll('-', '')}`;
  const tenant = randomUUID(),
    other = randomUUID(),
    recruiter = randomUUID();
  const hash = (t: string, s: string) =>
    createHmac('sha256', 'synthetic-test-pepper').update(`session:${t}:${s}`).digest();
  const key = (): SessionKey => ({
    tenantId: tenant,
    recruiterId: recruiter,
    sessionId: randomUUID(),
    method: 'password',
  });
  beforeAll(async () => {
    admin = createPool({ connectionString: url!, max: 1 });
    await admin.query(`CREATE DATABASE ${database}`);
    created = true;
    const target = new URL(url!);
    target.pathname = `/${database}`;
    pool = createPool({ connectionString: target.toString(), max: 4 });
    target.searchParams.set('options', '-c default_transaction_read_only=on');
    readonlyPool = createPool({ connectionString: target.toString(), max: 1 });
    // Minimal schema reproducing migration0017 session constraints, not a migration certification.
    await pool.query(`CREATE SCHEMA app;
      CREATE TABLE app.tenants(id uuid PRIMARY KEY);
      CREATE TABLE app.recruiters(id uuid PRIMARY KEY,tenant_id uuid REFERENCES app.tenants(id),email text,name text,status text);
      CREATE TABLE app.recruiter_sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        recruiter_id uuid NOT NULL REFERENCES app.recruiters(id) ON DELETE CASCADE,
        session_id_hash bytea NOT NULL UNIQUE,auth_method varchar(32) NOT NULL CHECK(auth_method IN ('password','saml','oidc','admin')),
        expires_at timestamptz NOT NULL,revoked_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),last_seen_at timestamptz NOT NULL DEFAULT now());`);
    await pool.query('INSERT INTO app.tenants VALUES($1),($2)', [tenant, other]);
    await pool.query(
      "INSERT INTO app.recruiters VALUES($1,$2,'synthetic@example.test','Synthetic','active')",
      [recruiter, tenant],
    );
  });
  afterAll(async () => {
    if (readonlyPool) await readonlyPool.end();
    if (pool) await pool.end();
    if (admin) {
      if (created) await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);
      await admin.end();
    }
  });
  it('stores a digest and renews the same identifier with fresh database identity', async () => {
    const s = createSessionStore(pool, hash),
      k = key();
    expect((await s.create(k))?.id).toBe(recruiter);
    await pool.query("UPDATE app.recruiters SET name='Updated' WHERE id=$1", [recruiter]);
    expect((await s.renew(k))?.name).toBe('Updated');
    const { rows } = await pool.query(
      'SELECT * FROM app.recruiter_sessions WHERE session_id_hash=$1',
      [hash(tenant, k.sessionId)],
    );
    expect(rows).toHaveLength(1);
    expect(rows[0].session_id_hash).toEqual(hash(tenant, k.sessionId));
    expect(rows[0].expires_at.getTime()).toBeGreaterThan(Date.now() + 7 * 3600000);
  });
  it('rejects wrong tenant, recruiter, method and unknown session', async () => {
    const s = createSessionStore(pool, hash),
      k = key();
    await s.create(k);
    for (const altered of [
      { tenantId: other },
      { recruiterId: randomUUID() },
      { method: 'saml' as const },
      { sessionId: randomUUID() },
    ]) {
      expect(await s.renew({ ...k, ...altered })).toBeNull();
      await s.revoke({ ...k, ...altered });
    }
    expect(await s.renew(k)).not.toBeNull();
    expect(await s.create({ ...key(), tenantId: other })).toBeNull();
  });
  it('rejects expired sessions', async () => {
    const s = createSessionStore(pool, hash),
      k = key();
    await s.create(k);
    await pool.query(
      "UPDATE app.recruiter_sessions SET expires_at=now()-interval '1 second' WHERE session_id_hash=$1",
      [hash(tenant, k.sessionId)],
    );
    expect(await s.renew(k)).toBeNull();
  });
  it('rejects disabled accounts for create and renewal but permits revocation', async () => {
    const s = createSessionStore(pool, hash),
      k = key();
    await s.create(k);
    await pool.query("UPDATE app.recruiters SET status='disabled' WHERE id=$1", [recruiter]);
    try {
      expect(await s.renew(k)).toBeNull();
      expect(await s.create(key())).toBeNull();
      await s.revoke(k);
    } finally {
      await pool.query("UPDATE app.recruiters SET status='active' WHERE id=$1", [recruiter]);
    }
    expect(await s.renew(k)).toBeNull();
  });
  it('revokes idempotently and cannot recreate a revoked identifier', async () => {
    const s = createSessionStore(pool, hash),
      k = key();
    await s.create(k);
    await s.revoke(k);
    await s.revoke(k);
    expect(await s.renew(k)).toBeNull();
    await expect(s.create(k)).rejects.toBeInstanceOf(SessionStoreUnavailable);
    expect(await s.renew(k)).toBeNull();
  });
  it('cannot revive a session when renewal races with revocation', async () => {
    const s = createSessionStore(pool, hash),
      k = key();
    await s.create(k);
    await Promise.all([s.renew(k), s.revoke(k)]);
    expect(await s.renew(k)).toBeNull();
  });
  it('fails closed on database write errors without leaking provider details', async () => {
    const s = createSessionStore(readonlyPool, hash);
    for (const call of [() => s.create(key()), () => s.renew(key()), () => s.revoke(key())])
      await expect(call()).rejects.toThrow('Session storage unavailable');
  });
  it('rejects invalid identifiers and digest contracts before using the database', async () => {
    const s = createSessionStore(pool, hash);
    await expect(s.renew({ ...key(), sessionId: 'bad' })).rejects.toThrow(
      'Invalid session identity',
    );
    await expect(createSessionStore(pool, () => Buffer.alloc(0)).create(key())).rejects.toThrow(
      'Invalid session digest',
    );
  });
  it('rejects a deleted recruiter and cascades their sessions', async () => {
    const id = randomUUID(),
      s = createSessionStore(pool, hash),
      k = { ...key(), recruiterId: id };
    await pool.query(
      "INSERT INTO app.recruiters VALUES($1,$2,'deleted@example.test','Deleted','active')",
      [id, tenant],
    );
    await s.create(k);
    await pool.query('DELETE FROM app.recruiters WHERE id=$1', [id]);
    expect(await s.renew(k)).toBeNull();
    expect(await s.create(k)).toBeNull();
  });
});
