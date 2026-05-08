import { describe, it, expect } from 'vitest';
import { resolveJit } from '../src/jit.js';
import type { ParsedSamlAssertion, TenantSsoConfig } from '../src/types.js';

const baseTenant: TenantSsoConfig = {
  tenantId: '00000000-0000-0000-0000-000000000001',
  protocol: 'saml',
  idpEntityId: 'https://idp.acme.example.com',
  idpSsoUrl: 'https://idp.acme.example.com/sso',
  defaultRedirectPath: '/recruiter/dashboard.html',
  allowJitProvisioning: true,
  allowIdpInitiated: false,
  deleteUsersAllowed: false,
  encryptionRequired: false,
};

function makeAssertion(overrides: Partial<ParsedSamlAssertion> = {}): ParsedSamlAssertion {
  return {
    id: '_assertion_id',
    issuer: 'https://idp.acme.example.com',
    nameId: 'alice@acme.example.com',
    nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
    audience: 'https://api.qorium.io/saml/acme',
    notBefore: new Date(),
    notOnOrAfter: new Date(),
    recipient: 'https://api.qorium.io/v1/auth/saml/acs',
    attributes: { email: ['alice@acme.example.com'], name: ['Alice'], qorium_roles: ['recruiter'] },
    ...overrides,
  };
}

describe('resolveJit — create flow', () => {
  it('creates a new recruiter when email is unknown and JIT enabled', () => {
    const out = resolveJit(makeAssertion(), baseTenant, undefined);
    expect(out.kind).toBe('create');
    if (out.kind === 'create') {
      expect(out.email).toBe('alice@acme.example.com');
      expect(out.name).toBe('Alice');
      expect(out.roles).toEqual(['recruiter']);
      expect(out.pinnedNameId).toBe('alice@acme.example.com');
      expect(out.authSource).toBe('saml-jit');
    }
  });

  it('rejects create when JIT is disabled', () => {
    const out = resolveJit(
      makeAssertion(),
      { ...baseTenant, allowJitProvisioning: false },
      undefined,
    );
    expect(out.kind).toBe('reject');
    if (out.kind === 'reject') expect(out.code).toBe('saml/jit-disabled');
  });
});

describe('resolveJit — claim flow', () => {
  it('claims an existing un-pinned recruiter row', () => {
    const out = resolveJit(makeAssertion(), baseTenant, {
      email: 'alice@acme.example.com',
      pinnedNameId: null,
    });
    expect(out.kind).toBe('claim');
    if (out.kind === 'claim') {
      expect(out.pinnedNameId).toBe('alice@acme.example.com');
      expect(out.authSource).toBe('saml-claim');
    }
  });
});

describe('resolveJit — login flow', () => {
  it('logs in a previously-pinned recruiter when NameID matches', () => {
    const out = resolveJit(makeAssertion(), baseTenant, {
      email: 'alice@acme.example.com',
      pinnedNameId: 'alice@acme.example.com',
    });
    expect(out.kind).toBe('login');
    if (out.kind === 'login') expect(out.email).toBe('alice@acme.example.com');
  });
});

describe('resolveJit — id mismatch', () => {
  it('rejects when pinned NameID differs from assertion NameID', () => {
    const out = resolveJit(makeAssertion({ nameId: 'alice@acme.example.com' }), baseTenant, {
      email: 'alice@acme.example.com',
      pinnedNameId: 'old-persistent-id-xyz',
    });
    expect(out.kind).toBe('reject');
    if (out.kind === 'reject') expect(out.code).toBe('saml/jit-id-mismatch');
  });
});

describe('resolveJit — missing email', () => {
  it('rejects when assertion has no usable email', () => {
    const out = resolveJit(
      makeAssertion({
        nameId: 'opaque-id',
        nameIdFormat: 'urn:oasis:names:tc:SAML:2.0:nameid-format:persistent',
        attributes: {},
      }),
      baseTenant,
      undefined,
    );
    expect(out.kind).toBe('reject');
    if (out.kind === 'reject') expect(out.code).toBe('saml/missing-attribute');
  });
});

describe('resolveJit — roles fallback', () => {
  it('falls back to "roles" attribute (Azure AD claim namespace)', () => {
    const out = resolveJit(
      makeAssertion({
        attributes: {
          email: ['alice@acme.example.com'],
          roles: ['admin', 'recruiter'],
        },
      }),
      baseTenant,
      undefined,
    );
    expect(out.kind).toBe('create');
    if (out.kind === 'create') expect(out.roles).toEqual(['admin', 'recruiter']);
  });
});
