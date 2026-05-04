import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import { createServer } from '../src/server.js';
import { issueSessionJwt } from '../src/jwt.js';

const silent = pino({ level: 'silent' });
const TENANT_ID = '11111111-2222-3333-4444-555555555555';

const config = {
  nodeEnv: 'test' as const,
  port: 0,
  databaseUrl: undefined,
  jwtIssuer: 'https://api.qorium.io',
  jwtAudience: 'https://app.qorium.io',
  jwtSigningSecret: 'test-secret-do-not-ship',
  jwtTtlSeconds: 3600,
  spEntityId: 'https://api.qorium.io',
  acsUrl: 'https://api.qorium.io/v1/auth/saml/acs',
  sloUrl: 'https://api.qorium.io/v1/auth/saml/slo',
};

function fixtureXml(opts: { audience?: string; recipient?: string; email?: string } = {}) {
  const audience = opts.audience ?? config.spEntityId;
  const recipient = opts.recipient ?? config.acsUrl;
  const email = opts.email ?? 'alice@acme.com';
  return `<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">
  <saml:Assertion>
    <saml:Issuer>https://idp.acme.com/saml</saml:Issuer>
    <saml:Subject>
      <saml:NameID>${email}</saml:NameID>
      <saml:SubjectConfirmation>
        <saml:SubjectConfirmationData Recipient="${recipient}"/>
      </saml:SubjectConfirmation>
    </saml:Subject>
    <saml:Conditions NotBefore="2020-01-01T00:00:00Z" NotOnOrAfter="2099-01-01T00:00:00Z">
      <saml:AudienceRestriction>
        <saml:Audience>${audience}</saml:Audience>
      </saml:AudienceRestriction>
    </saml:Conditions>
    <saml:AttributeStatement>
      <saml:Attribute Name="email"><saml:AttributeValue>${email}</saml:AttributeValue></saml:Attribute>
      <saml:Attribute Name="name"><saml:AttributeValue>Alice Acme</saml:AttributeValue></saml:Attribute>
    </saml:AttributeStatement>
  </saml:Assertion>
</samlp:Response>`;
}

describe('SSO express server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ status: 'ok', service: 'qorium-sso' });
  });

  it('GET /v1/auth/saml/metadata returns SP metadata XML', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).get('/v1/auth/saml/metadata');
    expect(r.status).toBe(200);
    expect(r.headers['content-type']).toMatch(/samlmetadata/);
    expect(r.text).toContain('<EntityDescriptor');
    expect(r.text).toContain('https://api.qorium.io/v1/auth/saml/acs');
  });

  it('POST /v1/auth/saml/acs issues a JWT for a valid assertion', async () => {
    const app = createServer({ config, logger: silent });
    const samlResponse = Buffer.from(fixtureXml()).toString('base64');
    const r = await request(app)
      .post('/v1/auth/saml/acs')
      .send({ SAMLResponse: samlResponse, tenant_id: TENANT_ID });
    expect(r.status).toBe(200);
    expect(r.body.access_token).toMatch(/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
    expect(r.body.user.email).toBe('alice@acme.com');
    expect(r.body.token_type).toBe('Bearer');
    expect(r.body.expires_in).toBe(3600);
  });

  it('POST /v1/auth/saml/acs rejects unsigned assertion when verifier present', async () => {
    const app = createServer({
      config,
      logger: silent,
      verifySamlSignature: () => false,
    });
    const samlResponse = Buffer.from(fixtureXml()).toString('base64');
    const r = await request(app)
      .post('/v1/auth/saml/acs')
      .send({ SAMLResponse: samlResponse, tenant_id: TENANT_ID });
    expect(r.status).toBe(401);
  });

  it('POST /v1/auth/saml/acs rejects mismatched audience', async () => {
    const app = createServer({ config, logger: silent });
    const samlResponse = Buffer.from(fixtureXml({ audience: 'https://attacker.example' })).toString(
      'base64',
    );
    const r = await request(app)
      .post('/v1/auth/saml/acs')
      .send({ SAMLResponse: samlResponse, tenant_id: TENANT_ID });
    expect(r.status).toBe(401);
  });

  it('POST /v1/auth/saml/acs rejects missing tenant_id', async () => {
    const app = createServer({ config, logger: silent });
    const samlResponse = Buffer.from(fixtureXml()).toString('base64');
    const r = await request(app).post('/v1/auth/saml/acs').send({ SAMLResponse: samlResponse });
    expect(r.status).toBe(400);
  });

  it('POST /v1/auth/oidc/login returns 503 without DB', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).post('/v1/auth/oidc/login').send({ tenant_id: TENANT_ID });
    expect(r.status).toBe(503);
  });

  it('GET /v1/auth/oidc/callback rejects when state is unknown', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app)
      .get('/v1/auth/oidc/callback')
      .query({ code: 'auth-code', state: 'never-stored' });
    expect(r.status).toBe(401);
  });

  it('POST /v1/auth/logout requires bearer token', async () => {
    const app = createServer({ config, logger: silent });
    const r = await request(app).post('/v1/auth/logout');
    expect(r.status).toBe(401);
  });

  it('POST /v1/auth/logout accepts a valid bearer token', async () => {
    const app = createServer({ config, logger: silent });
    const token = issueSessionJwt({
      claims: { sub: 'usr_alice', tenant_id: TENANT_ID, roles: ['admin'], email: 'alice@acme.com' },
      issuer: config.jwtIssuer,
      audience: config.jwtAudience,
      signingSecret: config.jwtSigningSecret,
      ttlSeconds: 3600,
    });
    const r = await request(app).post('/v1/auth/logout').set('authorization', `Bearer ${token}`);
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('logged_out');
  });
});
