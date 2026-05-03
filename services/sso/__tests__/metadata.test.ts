import { describe, expect, it } from 'vitest';
import { generateSpMetadataXml } from '../src/metadata.js';

describe('SAML SP metadata', () => {
  it('produces a minimal v0 SP descriptor with required attributes', () => {
    const xml = generateSpMetadataXml({
      entityId: 'https://api.qorium.io',
      acsUrl: 'https://api.qorium.io/v1/auth/saml/acs',
    });
    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('xmlns="urn:oasis:names:tc:SAML:2.0:metadata"');
    expect(xml).toContain('entityID="https://api.qorium.io"');
    expect(xml).toContain('AuthnRequestsSigned="true"');
    expect(xml).toContain('WantAssertionsSigned="true"');
    expect(xml).toContain('Location="https://api.qorium.io/v1/auth/saml/acs"');
    expect(xml).toContain('Binding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"');
  });

  it('includes SLO endpoint when provided', () => {
    const xml = generateSpMetadataXml({
      entityId: 'https://api.qorium.io',
      acsUrl: 'https://api.qorium.io/v1/auth/saml/acs',
      sloUrl: 'https://api.qorium.io/v1/auth/saml/slo',
    });
    expect(xml).toContain('<SingleLogoutService');
    expect(xml).toContain('Location="https://api.qorium.io/v1/auth/saml/slo"');
  });

  it('includes a KeyDescriptor when a signing certificate is provided', () => {
    const cert = '-----BEGIN CERTIFICATE-----\nABC123\n-----END CERTIFICATE-----';
    const xml = generateSpMetadataXml({
      entityId: 'https://api.qorium.io',
      acsUrl: 'https://api.qorium.io/v1/auth/saml/acs',
      signingCertPem: cert,
    });
    expect(xml).toContain('<KeyDescriptor use="signing">');
    expect(xml).toContain('<X509Certificate>ABC123</X509Certificate>');
  });

  it('escapes special characters in the entity id', () => {
    const xml = generateSpMetadataXml({
      entityId: 'https://api.qorium.io/?tenant=acme&v=1',
      acsUrl: 'https://api.qorium.io/v1/auth/saml/acs',
    });
    expect(xml).toContain('&amp;v=1');
  });

  it('respects authnRequestsSigned=false', () => {
    const xml = generateSpMetadataXml({
      entityId: 'https://api.qorium.io',
      acsUrl: 'https://api.qorium.io/v1/auth/saml/acs',
      authnRequestsSigned: false,
    });
    expect(xml).toContain('AuthnRequestsSigned="false"');
  });
});
