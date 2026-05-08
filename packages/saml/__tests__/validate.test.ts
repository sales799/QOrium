import { describe, it, expect } from 'vitest';
import { validateAssertion, extractStableEmail } from '../src/validate.js';
import type { ParsedSamlAssertion, TenantSsoConfig, ValidationContext } from '../src/types.js';

const TENANT_ID = '00000000-0000-0000-0000-000000000001';
const SP_ENTITY_ID = 'https://api.qorium.io/saml/acme';
const SP_ACS_URL = 'https://api.qorium.io/v1/auth/saml/acs';
const IDP_ENTITY = 'https://idp.acme.example.com';

const NOW = new Date('2026-05-08T12:00:00Z');

const baseTenant: TenantSsoConfig = {
  tenantId: TENANT_ID,
  protocol: 'saml',
  idpEntityId: IDP_ENTITY,
  idpSsoUrl: 'https://idp.acme.example.com/sso',
  defaultRedirectPath: '/recruiter/dashboard.html',
  allowJitProvisioning: true,
  allowIdpInitiated: false,
  deleteUsersAllowed: false,
  encryptionRequired: false,
};

function makeAssertion(overrides: Partial<ParsedSamlAssertion> = {}): ParsedSamlAssertion {
  return {
    id: '_assertion_id_001',
    issuer: IDP_ENTITY,
    nameId: 'alice@acme.example.com',
    nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    audience: SP_ENTITY_ID,
    notBefore: new Date(NOW.getTime() - 60_000),
    notOnOrAfter: new Date(NOW.getTime() + 5 * 60_000),
    inResponseTo: '_authn_req_001',
    recipient: SP_ACS_URL,
    attributes: { email: ['alice@acme.example.com'], name: ['Alice Anderson'] },
    ...overrides,
  };
}

function makeCtx(overrides: Partial<ValidationContext> = {}): ValidationContext {
  return {
    spEntityId: SP_ENTITY_ID,
    spAcsUrl: SP_ACS_URL,
    maxClockSkewSeconds: 300,
    now: NOW,
    tenant: baseTenant,
    knownAuthnRequestIds: new Set(['_authn_req_001']),
    seenAssertionIds: new Set(),
    ...overrides,
  };
}

describe('validateAssertion — SP-init happy path', () => {
  it('returns ok for a valid SP-initiated assertion', () => {
    const result = validateAssertion(makeAssertion(), makeCtx());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.idpInitiated).toBe(false);
      expect(result.assertion.nameId).toBe('alice@acme.example.com');
    }
  });
});

describe('validateAssertion — IdP-init flow', () => {
  it('rejects IdP-init when allow_idp_initiated=false', () => {
    const result = validateAssertion(makeAssertion({ inResponseTo: undefined }), makeCtx());
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/idp-init-disabled');
  });

  it('accepts IdP-init when allow_idp_initiated=true', () => {
    const result = validateAssertion(
      makeAssertion({ inResponseTo: undefined }),
      makeCtx({ tenant: { ...baseTenant, allowIdpInitiated: true } }),
    );
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.idpInitiated).toBe(true);
  });
});

describe('validateAssertion — replay guard', () => {
  it('rejects an assertion ID we have already seen', () => {
    const result = validateAssertion(
      makeAssertion({ id: '_seen_id' }),
      makeCtx({ seenAssertionIds: new Set(['_seen_id']) }),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/replay-or-stale');
  });
});

describe('validateAssertion — InResponseTo (CSRF)', () => {
  it('rejects SP-init with unknown InResponseTo', () => {
    const result = validateAssertion(
      makeAssertion({ inResponseTo: '_not_issued_by_us' }),
      makeCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/in-response-to-unknown');
  });
});

describe('validateAssertion — clock skew', () => {
  it('rejects assertion expired beyond skew', () => {
    const result = validateAssertion(
      makeAssertion({
        notBefore: new Date(NOW.getTime() - 20 * 60_000),
        notOnOrAfter: new Date(NOW.getTime() - 10 * 60_000),
      }),
      makeCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/clock-skew');
  });

  it('accepts assertion within skew window', () => {
    const result = validateAssertion(
      makeAssertion({
        // Expired 4 min ago — still within 5 min skew
        notOnOrAfter: new Date(NOW.getTime() - 4 * 60_000),
        notBefore: new Date(NOW.getTime() - 10 * 60_000),
      }),
      makeCtx(),
    );
    expect(result.ok).toBe(true);
  });

  it('rejects assertion with future NotBefore beyond skew', () => {
    const result = validateAssertion(
      makeAssertion({
        notBefore: new Date(NOW.getTime() + 10 * 60_000),
        notOnOrAfter: new Date(NOW.getTime() + 20 * 60_000),
      }),
      makeCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/clock-skew');
  });
});

describe('validateAssertion — issuer / audience / recipient', () => {
  it('rejects on issuer mismatch', () => {
    const result = validateAssertion(
      makeAssertion({ issuer: 'https://hostile.example.com' }),
      makeCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/issuer-mismatch');
  });

  it('rejects on audience mismatch', () => {
    const result = validateAssertion(
      makeAssertion({ audience: 'https://api.qorium.io/saml/different-tenant' }),
      makeCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/audience-mismatch');
  });

  it('rejects on recipient mismatch', () => {
    const result = validateAssertion(
      makeAssertion({ recipient: 'https://attacker.example.com/acs' }),
      makeCtx(),
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('saml/recipient-mismatch');
  });
});

describe('extractStableEmail', () => {
  it('extracts from emailAddress NameID format', () => {
    const a = makeAssertion({ nameId: 'BOB@acme.example.com' });
    expect(extractStableEmail(a)).toBe('bob@acme.example.com');
  });

  it('falls back to email attribute when NameID is persistent', () => {
    const a = makeAssertion({
      nameId: 'opaque-persistent-id-12345',
      nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      attributes: { email: ['carol@acme.example.com'] },
    });
    expect(extractStableEmail(a)).toBe('carol@acme.example.com');
  });

  it('returns undefined when no email is available', () => {
    const a = makeAssertion({
      nameId: 'opaque-id',
      nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
      attributes: {},
    });
    expect(extractStableEmail(a)).toBeUndefined();
  });
});
