import { inflateRawSync } from 'node:zlib';

import { describe, expect, it } from 'vitest';

import { buildSamlServiceProviderMetadata, createSamlAuthnRequest } from '../src/authn-request.js';
import type { TenantSsoConfig } from '../src/types.js';

const tenant: TenantSsoConfig = {
  tenantId: '00000000-0000-0000-0000-000000000001',
  protocol: 'saml',
  idpEntityId: 'https://idp.example.test/app',
  idpSsoUrl: 'https://idp.example.test/login',
  idpSigningCert: 'cert',
  defaultRedirectPath: '/recruiter/dashboard.html',
  allowJitProvisioning: true,
  allowIdpInitiated: false,
  deleteUsersAllowed: false,
  encryptionRequired: false,
};

describe('createSamlAuthnRequest', () => {
  it('builds a compressed redirect AuthnRequest', () => {
    const request = createSamlAuthnRequest({
      tenant,
      spEntityId: 'https://api.qorium.online/saml/acme',
      spAcsUrl: 'https://api.qorium.online/v1/auth/saml/acs',
      relayState: '/admin',
      id: '_test_request',
      now: new Date('2026-06-02T04:00:00.000Z'),
    });

    const redirect = new URL(request.redirectUrl);
    const inflated = inflateRawSync(
      Buffer.from(redirect.searchParams.get('SAMLRequest') ?? '', 'base64'),
    ).toString('utf8');

    expect(redirect.origin).toBe('https://idp.example.test');
    expect(redirect.searchParams.get('RelayState')).toBe('/admin');
    expect(inflated).toContain('ID="_test_request"');
    expect(inflated).toContain(
      'AssertionConsumerServiceURL="https://api.qorium.online/v1/auth/saml/acs"',
    );
    expect(inflated).toContain('<saml:Issuer>https://api.qorium.online/saml/acme</saml:Issuer>');
  });

  it('publishes SP metadata with ACS and signed assertion requirement', () => {
    const metadata = buildSamlServiceProviderMetadata({
      spEntityId: 'https://api.qorium.online/saml/acme',
      spAcsUrl: 'https://api.qorium.online/v1/auth/saml/acs',
    });

    expect(metadata).toContain('entityID="https://api.qorium.online/saml/acme"');
    expect(metadata).toContain('WantAssertionsSigned="true"');
    expect(metadata).toContain('Location="https://api.qorium.online/v1/auth/saml/acs"');
  });
});
