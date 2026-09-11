import { createSamlSession } from '../../../apps/marketing/src/app/v1/auth/saml/_session';
import { recordSamlSession } from '../../../apps/marketing/src/app/v1/auth/saml/_recruiter-session';
import { getOptionalSamlPool } from '../../../apps/marketing/src/app/v1/auth/saml/_db';
import { getSamlProofTenant } from '../../../apps/marketing/src/app/v1/auth/saml/_config';
import { recruiterPortalRouter } from '../src/routes/recruiter.js';
import { adminRouter } from '../src/routes/admin.js';
import { auditRouter } from '../src/routes/audit.js';
import { billingRecruiterRouter } from '../src/routes/billing.js';
import express from 'express';
import request from 'supertest';
import argon2 from 'argon2';
import { authRouter } from '../src/routes/auth.js';
import { problemHandler } from '../src/middleware/problem.js';
import { loadConfig } from '../src/config.js';
import { durableSessions, InvalidRecruiterSession } from '../src/auth/durable-session.js';
import jwt from 'jsonwebtoken';
import { createHmac, randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, it, expect, vi } from 'vitest';
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
    vi.stubEnv('DATABASE_URL', target.toString());
    vi.stubEnv('QORIUM_SAML_TEST_DATABASE', '1');
    vi.stubEnv('QORIUM_SESSION_SIGNING_SECRET', httpSamlSecret);
    vi.stubEnv('QORIUM_SAML_REPLAY_PEPPER', 'synthetic-cross-app-replay-pepper-'.repeat(2));
    target.searchParams.set('options', '-c default_transaction_read_only=on');
    readonlyPool = createPool({ connectionString: target.toString(), max: 1 });
    // Minimal schema reproducing migration0017 session constraints, not a migration certification.
    await pool.query(`CREATE SCHEMA app;
      CREATE TABLE app.tenants(id uuid PRIMARY KEY);
      CREATE TABLE app.recruiters(id uuid PRIMARY KEY,tenant_id uuid REFERENCES app.tenants(id),email text,name text,status text,password_hash text,failed_login_count integer DEFAULT 0,locked_until timestamptz,last_login_at timestamptz,external_sso_id text DEFAULT 'synthetic-subject');
      CREATE TABLE app.recruiter_sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        recruiter_id uuid NOT NULL REFERENCES app.recruiters(id) ON DELETE CASCADE,
        session_id_hash bytea NOT NULL UNIQUE,assertion_hash bytea,auth_method varchar(32) NOT NULL CHECK(auth_method IN ('password','saml','oidc','admin')),
        expires_at timestamptz NOT NULL,revoked_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),last_seen_at timestamptz NOT NULL DEFAULT now());`);
    await pool.query('INSERT INTO app.tenants VALUES($1),($2)', [tenant, other]);
    await pool.query(
      "INSERT INTO app.recruiters(id,tenant_id,email,name,status) VALUES($1,$2,'synthetic@example.test','Synthetic','active')",
      [recruiter, tenant],
    );
  });
  afterAll(async () => {
    if (created) {
      const samlPool = getOptionalSamlPool();
      if (samlPool) await samlPool.end();
    }
    vi.unstubAllEnvs();
    if (readonlyPool) await readonlyPool.end();
    if (pool) await pool.end();
    if (admin) {
      if (created) await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);
      await admin.end();
    }
  });
  const httpSamlSecret = 'synthetic-cross-app-saml-secret-'.repeat(2);
  const httpSecret = 'synthetic-http-session-secret-'.repeat(2);
  function httpApp(db = pool, surface = 'auth', samlEnabled = true) {
    const app = express();
    app.use(express.json());
    app.use((req, _res, next) => {
      const cookies: Record<string, string> = {};
      for (const part of (req.headers.cookie ?? '').split(';')) {
        const separator = part.indexOf('=');
        if (separator >= 0)
          cookies[part.slice(0, separator).trim()] = part.slice(separator + 1).trim();
      }
      Object.assign(req, { cookies });
      next();
    });
    app.use(
      '/v1',
      authRouter({
        pool: db,
        config: {
          ...loadConfig(),
          jwtSecret: httpSecret,
          cookieSecure: false,
          samlSessionSecret: samlEnabled ? httpSamlSecret : undefined,
        },
        audit: false,
      }),
    );
    const deps = {
      pool: db,
      config: {
        ...loadConfig(),
        jwtSecret: httpSecret,
        cookieSecure: false,
        samlSessionSecret: samlEnabled ? httpSamlSecret : undefined,
      },
    };
    if (surface === 'recruiter') app.use('/v1', recruiterPortalRouter(deps));
    if (surface === 'billing') app.use('/v1', billingRecruiterRouter(deps));
    if (surface === 'audit') app.use(auditRouter(deps));
    if (surface === 'admin') app.use(adminRouter(deps));
    app.use(problemHandler());
    return app;
  }
  async function login() {
    await pool.query(
      "UPDATE app.recruiters SET password_hash=$1,status='active',email='synthetic@example.test' WHERE id=$2",
      [await argon2.hash('synthetic-password'), recruiter],
    );
    const res = await request(httpApp())
      .post('/v1/auth/login')
      .send({ email: 'synthetic@example.test', password: 'synthetic-password' });
    expect(res.status).toBe(200);
    return res.headers['set-cookie'][0].split(';')[0] as string;
  }
  async function samlCookie() {
    const configured = getSamlProofTenant('acme')!;
    const samlTenant = { ...configured, config: { ...configured.config, tenantId: tenant } };
    // Parsed assertion fixture: XML/signature validation is separately covered by @qorium/saml.
    const assertion = {
      id: randomUUID(),
      issuer: 'synthetic-idp',
      nameId: 'synthetic-subject',
      nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
      audience: samlTenant.spEntityId,
      recipient: samlTenant.spAcsUrl,
      notBefore: new Date(),
      notOnOrAfter: new Date(Date.now() + 60000),
      attributes: { roles: ['admin'] },
    };
    const issued = createSamlSession({
      tenant: samlTenant,
      assertion,
      email: 'synthetic@example.test',
      recruiterId: recruiter,
    });
    await recordSamlSession({ tenant: samlTenant, assertion, session: issued.payload });
    return `qor_session=${issued.token}`;
  }
  it('marketing SAML issuance persists a session the API renews and revokes', async () => {
    const cookie = await samlCookie();
    const response = await request(httpApp()).get('/v1/auth/whoami').set('Cookie', cookie);
    expect(response.status).toBe(200);
    expect(response.body.recruiter.role).toBe('recruiter');
    const renewed = response.headers['set-cookie'][0].split(';')[0];
    const claims = jwt.decode(renewed.slice('qor_session='.length)) as jwt.JwtPayload;
    expect(claims.auth_method).toBe('saml');
    expect(claims.iss).toBe('qorium-saml');
    expect(
      (await request(httpApp()).post('/v1/auth/logout').set('Cookie', cookie).send({})).status,
    ).toBe(204);
    expect((await request(httpApp()).get('/v1/auth/whoami').set('Cookie', renewed)).status).toBe(
      401,
    );
  });
  it('API rejects a stored SAML session without an explicitly trusted SAML key', async () => {
    const cookie = await samlCookie();
    expect(
      (
        await request(httpApp(pool, 'auth', false))
          .get('/v1/auth/whoami')
          .set('Cookie', cookie)
      ).status,
    ).toBe(401);
  });
  it('API rejects a SAML token when its stored authentication method differs', async () => {
    const cookie = await samlCookie();
    await pool.query(
      "UPDATE app.recruiter_sessions SET auth_method='password' WHERE auth_method='saml'",
    );
    expect((await request(httpApp()).get('/v1/auth/whoami').set('Cookie', cookie)).status).toBe(
      401,
    );
  });
  it('HTTP login/whoami/logout rejects both original and renewed copied cookies', async () => {
    const cookie = await login();
    const res = await request(httpApp()).get('/v1/auth/whoami').set('Cookie', cookie);
    expect(res.status).toBe(200);
    expect(res.body.recruiter.id).toBe(recruiter);
    const renewed = res.headers['set-cookie'][0].split(';')[0];
    const token = renewed.slice('qor_session='.length);
    const c = jwt.decode(token) as jwt.JwtPayload;
    expect(Date.parse(res.headers['set-cookie'][0].match(/Expires=([^;]+)/)![1])).toBe(
      c.exp! * 1000,
    );
    expect(
      (await request(httpApp()).post('/v1/auth/logout').set('Cookie', cookie).send({})).status,
    ).toBe(204);
    for (const copied of [cookie, renewed])
      expect((await request(httpApp()).get('/v1/auth/whoami').set('Cookie', copied)).status).toBe(
        401,
      );
    expect(
      (await request(httpApp()).post('/v1/auth/logout').set('Cookie', cookie).send({})).status,
    ).toBe(204);
  });
  it.each([
    ['auth', '/v1/auth/whoami'],
    ['recruiter', '/v1/recruiter/assessments/00000000-0000-4000-8000-000000000001/attempts'],
    ['billing', '/v1/recruiter/billing/status'],
    ['audit', '/v1/audit/events'],
    ['admin', '/v1/admin/leak-alerts'],
  ])('HTTP %s gate rejects revoked sessions using real storage', async (surface, path) => {
    const cookie = await login();
    expect(
      (await request(httpApp()).post('/v1/auth/logout').set('Cookie', cookie).send({})).status,
    ).toBe(204);
    expect((await request(httpApp(pool, surface)).get(path).set('Cookie', cookie)).status).toBe(
      401,
    );
  });
  it('HTTP disabled recruiter cannot renew a previously issued session', async () => {
    const cookie = await login();
    await pool.query("UPDATE app.recruiters SET status='disabled' WHERE id=$1", [recruiter]);
    try {
      expect((await request(httpApp()).get('/v1/auth/whoami').set('Cookie', cookie)).status).toBe(
        401,
      );
    } finally {
      await pool.query("UPDATE app.recruiters SET status='active' WHERE id=$1", [recruiter]);
    }
  });
  it('HTTP renewal/logout fail closed on unavailable writes without issuing or clearing a cookie', async () => {
    const cookie = await login();
    const res = await request(httpApp(readonlyPool)).get('/v1/auth/whoami').set('Cookie', cookie);
    expect(res.status).toBe(503);
    expect(res.headers['set-cookie']).toBeUndefined();
    const logout = await request(httpApp(readonlyPool))
      .post('/v1/auth/logout')
      .set('Cookie', cookie)
      .send({});
    expect(logout.status).toBe(503);
    expect(logout.headers['set-cookie']).toBeUndefined();
    expect(JSON.stringify(logout.body)).not.toMatch(/read.only|postgres|UPDATE/);
  });
  it('HTTP login with unavailable session storage issues no cookie', async () => {
    await login();
    const unavailable = new Proxy(pool, {
      get(target, property) {
        if (property === 'connect')
          return async () => {
            throw new Error('private-provider-details');
          };
        const value = Reflect.get(target, property);
        return typeof value === 'function' ? value.bind(target) : value;
      },
    });
    const res = await request(httpApp(unavailable))
      .post('/v1/auth/login')
      .send({ email: 'synthetic@example.test', password: 'synthetic-password' });
    expect(res.status).toBe(503);
    expect(res.headers['set-cookie']).toBeUndefined();
    expect(JSON.stringify(res.body)).not.toContain('private-provider-details');
  });
  it('issues, renews and rejects a copied token after durable revocation', async () => {
    const service = durableSessions(
      createSessionStore(pool, hash),
      'synthetic-integration-secret-'.repeat(2),
    );
    const issued = await service.start(tenant, recruiter);
    const renewed = await service.renew(issued.token);
    expect(renewed.sessionId).toBe(issued.sessionId);
    const row = (
      await pool.query('SELECT expires_at FROM app.recruiter_sessions WHERE session_id_hash=$1', [
        hash(tenant, issued.sessionId),
      ])
    ).rows[0];
    expect((jwt.decode(renewed.token) as jwt.JwtPayload).exp! * 1000).toBeLessThanOrEqual(
      row.expires_at.getTime(),
    );
    await service.revoke(issued.token);
    await expect(service.renew(renewed.token)).rejects.toBeInstanceOf(InvalidRecruiterSession);
  });
  it('stores a digest and renews the same identifier with fresh database identity', async () => {
    const s = createSessionStore(pool, hash),
      k = key();
    const issued = await s.create(k);
    expect(issued?.id).toBe(recruiter);
    expect(issued?.expires_at).toBeInstanceOf(Date);
    await pool.query("UPDATE app.recruiters SET name='Updated' WHERE id=$1", [recruiter]);
    const renewed = await s.renew(k);
    expect(renewed?.name).toBe('Updated');
    const { rows } = await pool.query(
      'SELECT * FROM app.recruiter_sessions WHERE session_id_hash=$1',
      [hash(tenant, k.sessionId)],
    );
    expect(rows).toHaveLength(1);
    expect(renewed?.expires_at).toEqual(rows[0].expires_at);
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
      "INSERT INTO app.recruiters(id,tenant_id,email,name,status) VALUES($1,$2,'deleted@example.test','Deleted','active')",
      [id, tenant],
    );
    await s.create(k);
    await pool.query('DELETE FROM app.recruiters WHERE id=$1', [id]);
    expect(await s.renew(k)).toBeNull();
    expect(await s.create(k)).toBeNull();
  });
});
