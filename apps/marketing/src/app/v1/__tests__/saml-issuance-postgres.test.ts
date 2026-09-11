import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { createPool, type Pool } from '@qorium/db';
import { getSamlProofTenant } from '../auth/saml/_config';
import { recordSamlSession } from '../auth/saml/_recruiter-session';
import { getOptionalSamlPool } from '../auth/saml/_db';
const url = process.env.QORIUM_SAML_ISSUANCE_TEST_DATABASE_URL;
describe.skipIf(!url)('SAML issuance on isolated PostgreSQL', () => {
  let admin: Pool, pool: Pool;
  let created = false;
  const database = `qorium_saml_${randomUUID().replaceAll('-', '')}`;
  const tenantId = randomUUID(),
    recruiterId = randomUUID();
  const configured = getSamlProofTenant('acme')!;
  const tenant = { ...configured, config: { ...configured.config, tenantId } };
  beforeAll(async () => {
    admin = createPool({ connectionString: url!, max: 1 });
    await admin.query(`CREATE DATABASE ${database}`);
    created = true;
    const target = new URL(url!);
    target.pathname = `/${database}`;
    pool = createPool({ connectionString: target.toString(), max: 2 });
    vi.stubEnv('DATABASE_URL', target.toString());
    vi.stubEnv('QORIUM_SAML_TEST_DATABASE', '1');
    vi.stubEnv('QORIUM_SAML_REPLAY_PEPPER', 'synthetic-saml-replay-pepper-'.repeat(2));
    await pool.query(`CREATE SCHEMA app;
   CREATE TABLE app.tenants(id uuid PRIMARY KEY);
   CREATE TABLE app.recruiters(id uuid PRIMARY KEY,tenant_id uuid REFERENCES app.tenants(id),status text,external_sso_id text);
   CREATE TABLE app.recruiter_sessions(id uuid PRIMARY KEY DEFAULT gen_random_uuid(),tenant_id uuid NOT NULL REFERENCES app.tenants(id),
    recruiter_id uuid NOT NULL REFERENCES app.recruiters(id),session_id_hash bytea NOT NULL UNIQUE,auth_method text NOT NULL,
    assertion_hash bytea,expires_at timestamptz NOT NULL);
  `);
    await pool.query('INSERT INTO app.tenants VALUES($1)', [tenantId]);
    await pool.query("INSERT INTO app.recruiters VALUES($1,$2,'active','synthetic-subject')", [
      recruiterId,
      tenantId,
    ]);
  });
  afterAll(async () => {
    if (created) {
      const cached = getOptionalSamlPool();
      if (cached) await cached.end();
    }
    if (pool) await pool.end();
    if (admin) {
      if (created) await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);
      await admin.end();
    }
    vi.unstubAllEnvs();
  });
  function input(): Parameters<typeof recordSamlSession>[0] {
    return {
      tenant,
      assertion: {
        id: randomUUID(),
        issuer: 'synthetic-idp',
        nameId: 'synthetic-subject',
        nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        audience: tenant.spEntityId,
        notBefore: new Date(),
        notOnOrAfter: new Date(Date.now() + 60000),
        recipient: tenant.spAcsUrl,
        attributes: {},
      },
      session: {
        v: 1,
        typ: 'saml',
        sid: randomUUID(),
        tenant: 'acme',
        tenantId,
        recruiterId,
        email: 'synthetic@example.test',
        roles: ['recruiter'],
        authSource: 'saml-jit',
        iat: Date.now(),
        exp: Date.now() + 60000,
      },
    };
  }
  async function count() {
    return Number((await pool.query('SELECT count(*) FROM app.recruiter_sessions')).rows[0].count);
  }
  it('persists a live account bound to the same tenant and IdP subject', async () => {
    const before = await count();
    await recordSamlSession(input());
    expect(await count()).toBe(before + 1);
  });
  it('withholds a session when an account is disabled after identity resolution', async () => {
    const before = await count();
    await pool.query("UPDATE app.recruiters SET status='disabled' WHERE id=$1", [recruiterId]);
    try {
      await expect(recordSamlSession(input())).rejects.toThrow('SAML session issuance rejected');
      expect(await count()).toBe(before);
    } finally {
      await pool.query("UPDATE app.recruiters SET status='active' WHERE id=$1", [recruiterId]);
    }
  });
  it('withholds a session when the pinned IdP subject changes', async () => {
    const before = await count(),
      candidate = input();
    candidate.assertion.nameId = 'different-subject';
    await expect(recordSamlSession(candidate)).rejects.toThrow('SAML session issuance rejected');
    expect(await count()).toBe(before);
  });
  it('withholds expired session issuance', async () => {
    const before = await count(),
      candidate = input();
    candidate.session.exp = Date.now() - 1000;
    await expect(recordSamlSession(candidate)).rejects.toThrow('SAML session issuance rejected');
    expect(await count()).toBe(before);
  });
  it('withholds a session bound to a different tenant', async () => {
    const other = randomUUID();
    await pool.query('INSERT INTO app.tenants VALUES($1)', [other]);
    const candidate = input();
    candidate.tenant = { ...tenant, config: { ...tenant.config, tenantId: other } };
    candidate.session.tenantId = other;
    const before = await count();
    await expect(recordSamlSession(candidate)).rejects.toThrow('SAML session issuance rejected');
    expect(await count()).toBe(before);
  });
});
