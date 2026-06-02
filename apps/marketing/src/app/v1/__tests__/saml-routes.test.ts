import { inflateRawSync } from 'node:zlib';

import { beforeEach, describe, expect, it } from 'vitest';

import { POST as postSamlAcs } from '../auth/saml/acs/route';
import { GET as getSamlLogin } from '../auth/saml/login/route';
import { GET as getSamlMetadata } from '../auth/saml/metadata/route';
import { resetSamlProofStateForTests } from '../auth/saml/_state';

describe('SAML public proof routes', () => {
  beforeEach(() => resetSamlProofStateForTests());

  it('redirects an allowlisted tenant to SAMLTest with a compressed AuthnRequest', async () => {
    const response = await getSamlLogin(
      new Request('https://qorium.test/v1/auth/saml/login?tenant=acme&return_to=/admin'),
    );
    const location = response.headers.get('location');
    expect(location).toBeTruthy();

    const redirect = new URL(location ?? '');
    const xml = inflateRawSync(
      Buffer.from(redirect.searchParams.get('SAMLRequest') ?? '', 'base64'),
    ).toString('utf8');

    expect(response.status).toBe(302);
    expect(redirect.origin).toBe('https://www.samltest.dev');
    expect(redirect.searchParams.get('RelayState')).toBe('/admin');
    expect(xml).toContain(
      'AssertionConsumerServiceURL="https://api.qorium.online/v1/auth/saml/acs"',
    );
    expect(xml).toContain('<saml:Issuer>https://api.qorium.online/saml/acme</saml:Issuer>');
  });

  it('publishes SAML service-provider metadata', async () => {
    const response = getSamlMetadata(
      new Request('https://qorium.test/v1/auth/saml/metadata?tenant=acme'),
    );
    const metadata = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/samlmetadata+xml');
    expect(metadata).toContain('entityID="https://api.qorium.online/saml/acme"');
    expect(metadata).toContain('Location="https://api.qorium.online/v1/auth/saml/acs"');
    expect(metadata).not.toContain('SingleLogoutService');
  });

  it('rejects ACS posts without SAMLResponse', async () => {
    const response = await postSamlAcs(
      new Request('https://qorium.test/v1/auth/saml/acs', {
        method: 'POST',
        body: new URLSearchParams({ RelayState: '/admin' }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.detail).toContain('SAMLResponse');
  });
});
