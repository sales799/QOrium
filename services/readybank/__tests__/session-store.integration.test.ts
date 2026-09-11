import { readFileSync } from 'node:fs';
import { syntheticIdp } from '../../../packages/saml/__tests__/helpers/signed-assertion';
import { POST as samlAcs } from '../../../apps/marketing/src/app/v1/auth/saml/acs/route';
import { GET as samlLogin } from '../../../apps/marketing/src/app/v1/auth/saml/login/route';
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
  let migrationApplied = false;
  let idp: ReturnType<typeof syntheticIdp>;
  const proofTenant = getSamlProofTenant('acme')!;
  const originalProofConfig = { ...proofTenant.config };
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
    idp = syntheticIdp();
    Object.assign(proofTenant.config, {
      tenantId: tenant,
      idpEntityId: 'urn:qorium:synthetic:idp',
      idpSigningCert: idp.certificate,
    });
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
      CREATE TABLE app.recruiters(id uuid PRIMARY KEY,tenant_id uuid REFERENCES app.tenants(id),email text,name text,status text,password_hash text,failed_login_count integer DEFAULT 0,locked_until timestamptz,last_login_at timestamptz,external_sso_id text DEFAULT 'synthetic-subject',auth_source text DEFAULT 'saml-jit');
      CREATE TABLE app.recruiter_sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        tenant_id uuid NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
        recruiter_id uuid NOT NULL REFERENCES app.recruiters(id) ON DELETE CASCADE,
        session_id_hash bytea NOT NULL UNIQUE,assertion_hash bytea,auth_method varchar(32) NOT NULL CHECK(auth_method IN ('password','saml','oidc','admin')),
        expires_at timestamptz NOT NULL,revoked_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),last_seen_at timestamptz NOT NULL DEFAULT now());`);
    await pool.query(`CREATE TABLE app.saml_authn_request_state(request_id_hash bytea PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES app.tenants(id),relay_state text NOT NULL,expires_at timestamptz NOT NULL,consumed_at timestamptz);
      CREATE TABLE app.saml_assertions_seen(assertion_id_hash bytea PRIMARY KEY,tenant_id uuid NOT NULL REFERENCES app.tenants(id),kind text NOT NULL,expires_at timestamptz NOT NULL);`);
    await pool.query(`CREATE SCHEMA audit;
      CREATE TABLE app.users(id uuid PRIMARY KEY);
      CREATE TABLE audit.events(actor_type text, actor_id uuid REFERENCES app.users(id),
        tenant_id uuid REFERENCES app.tenants(id), event_type text, entity_type text,
        entity_id uuid, changes jsonb, payload jsonb, ip_address inet, user_agent text, hash_current text);`);
    {
      await pool.query(
        readFileSync(
          new URL(
            '../../../infra/B7-postgres-migrations/0023_recruiter_session_invalidation.sql',
            import.meta.url,
          ),
          'utf8',
        ),
      );
      migrationApplied = true;
    }
    await pool.query('INSERT INTO app.tenants VALUES($1),($2)', [tenant, other]);
    await pool.query(
      "INSERT INTO app.recruiters(id,tenant_id,email,name,status) VALUES($1,$2,'synthetic@example.test','Synthetic','active')",
      [recruiter, tenant],
    );
  });
  afterAll(async () => {
    Object.assign(proofTenant.config, originalProofConfig);
    if (created) {
      const samlPool = getOptionalSamlPool();
      if (samlPool) await samlPool.end();
    }
    vi.unstubAllEnvs();
    if (readonlyPool) await readonlyPool.end();
    if (migrationApplied) {
      const before = Number(
        (
          await pool.query(
            'SELECT count(*) FROM app.recruiter_sessions WHERE revoked_at IS NOT NULL',
          )
        ).rows[0].count,
      );
      const migration = readFileSync(
        new URL(
          '../../../infra/B7-postgres-migrations/0023_recruiter_session_invalidation.sql',
          import.meta.url,
        ),
        'utf8',
      );
      const rollback = [...migration.matchAll(/^-- (BEGIN;|DROP[^\n]*;|COMMIT;)$/gm)]
        .map((match) => match[1])
        .join('\n');
      await pool.query(rollback);
      expect(
        Number(
          (
            await pool.query(
              'SELECT count(*) FROM app.recruiter_sessions WHERE revoked_at IS NOT NULL',
            )
          ).rows[0].count,
        ),
      ).toBe(before);
      expect(
        (
          await pool.query(
            "SELECT 1 FROM pg_trigger WHERE tgname='recruiter_sessions_invalidate_on_change'",
          )
        ).rows,
      ).toHaveLength(0);
    }
    if (pool) await pool.end();
    if (admin) {
      if (created) await admin.query(`DROP DATABASE ${database}`);
      await admin.end();
    }
  });
  const httpSamlSecret = 'synthetic-cross-app-saml-secret-'.repeat(2);
  const httpSecret = 'synthetic-http-session-secret-'.repeat(2);
  function httpApp(db = pool, surface = 'auth', samlEnabled = true, audit = false) {
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
        audit,
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
  async function signedResponse(overrides: Partial<Parameters<typeof idp.sign>[0]> = {}) {
    const loginResponse = await samlLogin(
      new Request('https://qorium.test/v1/auth/saml/login?tenant=acme'),
    );
    expect(loginResponse.status).toBe(302);
    return idp.sign({
      requestId: loginResponse.headers.get('x-qorium-saml-request-id')!,
      issuer: proofTenant.config.idpEntityId!,
      audience: proofTenant.spEntityId,
      recipient: proofTenant.spAcsUrl,
      ...overrides,
    });
  }
  function postXml(xml: string) {
    return samlAcs(
      new Request(proofTenant.spAcsUrl, {
        method: 'POST',
        body: new URLSearchParams({ SAMLResponse: Buffer.from(xml).toString('base64') }),
      }),
    );
  }
  async function sessionCount() {
    return Number((await pool.query('SELECT count(*) FROM app.recruiter_sessions')).rows[0].count);
  }
  it('signed XML ACS creates a durable API session, rejects replay and revokes on logout', async () => {
    const xml = await signedResponse(),
      before = await sessionCount();
    const response = await postXml(xml);
    expect(response.status).toBe(200);
    expect(await sessionCount()).toBe(before + 1);
    const cookie = response.headers.get('set-cookie')!.split(';')[0];
    expect((await request(httpApp()).get('/v1/auth/whoami').set('Cookie', cookie)).status).toBe(
      200,
    );
    const replay = await postXml(xml);
    expect(replay.status).toBe(401);
    expect(replay.headers.get('set-cookie')).toBeNull();
    expect(await sessionCount()).toBe(before + 1);
    expect(
      (await request(httpApp()).post('/v1/auth/logout').set('Cookie', cookie).send({})).status,
    ).toBe(204);
    expect((await request(httpApp()).get('/v1/auth/whoami').set('Cookie', cookie)).status).toBe(
      401,
    );
  });
  it.each(['issuer', 'audience', 'recipient'] as const)(
    'signed XML rejects wrong %s without creating a session',
    async (field) => {
      const xml = await signedResponse({ [field]: 'urn:qorium:wrong-target' }),
        before = await sessionCount();
      const response = await postXml(xml);
      expect(response.status).toBe(403);
      expect(response.headers.get('set-cookie')).toBeNull();
      expect(await sessionCount()).toBe(before);
    },
  );
  it('signed XML rejects post-signature tampering', async () => {
    const xml = (await signedResponse()).replace('synthetic@example.test', 'tampered@example.test'),
      before = await sessionCount();
    const response = await postXml(xml);
    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(await sessionCount()).toBe(before);
  });
  it('signed XML rejects an untrusted signing certificate', async () => {
    const loginResponse = await samlLogin(
      new Request('https://qorium.test/v1/auth/saml/login?tenant=acme'),
    );
    expect(loginResponse.status).toBe(302);
    const xml = syntheticIdp().sign({
      requestId: loginResponse.headers.get('x-qorium-saml-request-id')!,
      issuer: proofTenant.config.idpEntityId!,
      audience: proofTenant.spEntityId,
      recipient: proofTenant.spAcsUrl,
    });
    const before = await sessionCount(),
      response = await postXml(xml);
    expect(response.status).toBe(401);
    expect(response.headers.get('set-cookie')).toBeNull();
    expect(await sessionCount()).toBe(before);
  });
  it('signed XML cannot consume request state from a different tenant', async () => {
    const xml = await signedResponse(),
      before = await sessionCount();
    proofTenant.config.tenantId = other;
    try {
      const response = await postXml(xml);
      expect(response.status).toBe(401);
      expect(response.headers.get('set-cookie')).toBeNull();
      expect(await sessionCount()).toBe(before);
    } finally {
      proofTenant.config.tenantId = tenant;
    }
  });
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
  it.each(['password', 'saml'] as const)(
    'attributes %s logout without an app.users identity or session secret',
    async (method) => {
      const secret = method === 'password' ? httpSecret : httpSamlSecret;
      const sid = randomUUID();
      const token = jwt.sign(
        {
          sub: recruiter,
          tenant_id: tenant,
          sid,
          auth_method: method,
          email: 'synthetic@example.test',
          name: 'Synthetic',
          role: 'recruiter',
        },
        secret,
        {
          algorithm: 'HS256',
          issuer: method === 'password' ? 'qorium-readybank' : 'qorium-saml',
          audience: 'qorium-recruiter',
          expiresIn: -1,
        },
      );
      // Authentic expired cookies still identify the revocation request. No user row is invented.
      const result = await request(httpApp(pool, 'auth', true, true))
        .post('/v1/auth/logout')
        .set('Cookie', `qor_session=${token}`)
        .send({});
      expect(result.status).toBe(204);
      const rows = (
        await pool.query(
          "SELECT * FROM audit.events WHERE entity_id=$1 AND payload->>'auth_method'=$2",
          [recruiter, method],
        )
      ).rows;
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({
        actor_id: null,
        tenant_id: tenant,
        entity_id: recruiter,
        event_type: 'auth.logout',
        payload: { recruiter_id: recruiter, auth_method: method },
      });
      expect(JSON.stringify(rows)).not.toContain(token);
      expect(JSON.stringify(rows)).not.toContain(sid);
      expect((await pool.query('SELECT * FROM app.users')).rows).toHaveLength(0);
    },
  );
  it('does not attribute a forged logout cookie', async () => {
    const result = await request(httpApp(pool, 'auth', true, true))
      .post('/v1/auth/logout')
      .set('Cookie', 'qor_session=forged')
      .send({});
    expect(result.status).toBe(204);
    const rows = (await pool.query('SELECT * FROM audit.events WHERE entity_id IS NULL')).rows;
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      actor_id: null,
      tenant_id: null,
      payload: { identity_verified: false },
    });
  });

  it('preserves durable logout when optional audit storage fails', async () => {
    const cookie = await login();
    const brokenAuditPool = {
      connect: pool.connect.bind(pool),
      query: async () => {
        throw new Error('synthetic audit outage');
      },
    } as unknown as Pool;
    const result = await request(httpApp(brokenAuditPool, 'auth', true, true))
      .post('/v1/auth/logout')
      .set('Cookie', cookie)
      .send({});
    expect(result.status).toBe(204);
    expect(result.headers['set-cookie']).toBeDefined();
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
  it.each([
    ['password_hash', 'replacement-synthetic-hash'],
    ['status', 'disabled'],
    ['external_sso_id', 'replacement-subject'],
    ['email', 'changed@example.test'],
    ['tenant_id', other],
    ['auth_source', 'scim'],
  ])('security change to %s revokes password and SAML rows', async (field, value) => {
    const store = createSessionStore(pool, hash),
      a = key(),
      b = { ...key(), method: 'saml' as const };
    await store.create(a);
    await store.create(b);
    const original = (
      await pool.query(`SELECT ${field} AS value FROM app.recruiters WHERE id=$1`, [recruiter])
    ).rows[0].value;
    try {
      await pool.query(`UPDATE app.recruiters SET ${field}=$1 WHERE id=$2`, [value, recruiter]);
      const rows = (
        await pool.query(
          'SELECT revoked_at FROM app.recruiter_sessions WHERE session_id_hash IN ($1,$2)',
          [hash(tenant, a.sessionId), hash(tenant, b.sessionId)],
        )
      ).rows;
      expect(rows).toHaveLength(2);
      expect(rows.every((row) => row.revoked_at !== null)).toBe(true);
    } finally {
      await pool.query(`UPDATE app.recruiters SET ${field}=$1 WHERE id=$2`, [original, recruiter]);
    }
  });
  it('reenabling an account never restores its old sessions', async () => {
    const store = createSessionStore(pool, hash),
      k = key();
    await store.create(k);
    await pool.query("UPDATE app.recruiters SET status='disabled' WHERE id=$1", [recruiter]);
    await pool.query("UPDATE app.recruiters SET status='active' WHERE id=$1", [recruiter]);
    expect(await store.renew(k)).toBeNull();
  });
  it('cosmetic and no-op security updates preserve sessions', async () => {
    const store = createSessionStore(pool, hash),
      k = key();
    await store.create(k);
    await pool.query(
      "UPDATE app.recruiters SET name='Cosmetic',last_login_at=now(),password_hash=password_hash,status=status,email=email,external_sso_id=external_sso_id,tenant_id=tenant_id,auth_source=auth_source WHERE id=$1",
      [recruiter],
    );
    expect(await store.renew(k)).not.toBeNull();
  });
  it('rejects a security change when RLS would hide sessions from the invoker', async () => {
    const role = `session_rls_${randomUUID().replaceAll('-', '')}`;
    await pool.query(
      `CREATE ROLE ${role}; GRANT USAGE ON SCHEMA app TO ${role}; GRANT SELECT,UPDATE ON app.recruiters,app.recruiter_sessions TO ${role}`,
    );
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query('ALTER TABLE app.recruiter_sessions ENABLE ROW LEVEL SECURITY');
      await c.query(`SET LOCAL ROLE ${role}`);
      await expect(
        c.query("UPDATE app.recruiters SET email='hidden@example.test' WHERE id=$1", [recruiter]),
      ).rejects.toMatchObject({ code: '42501' });
    } finally {
      await c.query('ROLLBACK');
      c.release();
      await pool.query(`DROP OWNED BY ${role}; DROP ROLE ${role}`);
    }
  });
  it('rolls back a security update if the caller cannot revoke sessions', async () => {
    const role = `session_writer_${randomUUID().replaceAll('-', '')}`;
    await pool.query(
      `CREATE ROLE ${role}; GRANT USAGE ON SCHEMA app TO ${role}; GRANT SELECT,UPDATE ON app.recruiters TO ${role}`,
    );
    const before = (await pool.query('SELECT email FROM app.recruiters WHERE id=$1', [recruiter]))
      .rows[0].email;
    const c = await pool.connect();
    try {
      await c.query('BEGIN');
      await c.query(`SET LOCAL ROLE ${role}`);
      await expect(
        c.query("UPDATE app.recruiters SET email='denied@example.test' WHERE id=$1", [recruiter]),
      ).rejects.toMatchObject({ code: '42501' });
    } finally {
      await c.query('ROLLBACK');
      c.release();
    }
    expect(
      (await pool.query('SELECT email FROM app.recruiters WHERE id=$1', [recruiter])).rows[0].email,
    ).toBe(before);
    await pool.query(`DROP OWNED BY ${role}; DROP ROLE ${role}`);
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
