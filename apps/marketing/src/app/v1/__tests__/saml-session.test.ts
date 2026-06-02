import { describe, expect, it } from 'vitest';

import { getSamlProofTenant } from '../auth/saml/_config';
import {
  SAML_SESSION_COOKIE,
  createSamlSession,
  samlSessionCookie,
  verifySessionToken,
} from '../auth/saml/_session';

describe('SAML session cookie', () => {
  it('signs a recruiter session and serializes an httpOnly cookie', () => {
    const tenant = getSamlProofTenant('acme');
    if (!tenant) throw new Error('missing acme tenant');

    const session = createSamlSession({
      tenant,
      email: 'qorium-saml-sandbox@example.com',
      secret: 'test-secret',
      now: new Date(),
      assertion: {
        id: 'assertion-1',
        issuer: tenant.config.idpEntityId ?? '',
        nameId: 'qorium-saml-sandbox@example.com',
        nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        audience: tenant.spEntityId,
        notBefore: new Date('2026-06-02T04:00:00.000Z'),
        notOnOrAfter: new Date('2026-06-02T05:00:00.000Z'),
        recipient: tenant.spAcsUrl,
        attributes: { qorium_roles: ['admin', 'recruiter'] },
      },
    });
    const cookie = samlSessionCookie(session.token, session.maxAgeSeconds, true);
    const verified = verifySessionToken(session.token, 'test-secret');

    expect(verified.email).toBe('qorium-saml-sandbox@example.com');
    expect(verified.roles).toEqual(['admin', 'recruiter']);
    expect(cookie).toContain(`${SAML_SESSION_COOKIE}=`);
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('SameSite=Strict');
    expect(cookie).toContain('Secure');
  });

  it('rejects a session token with a malformed signature', () => {
    const tenant = getSamlProofTenant('acme');
    if (!tenant) throw new Error('missing acme tenant');

    const session = createSamlSession({
      tenant,
      email: 'qorium-saml-sandbox@example.com',
      secret: 'test-secret',
      now: new Date(),
      assertion: {
        id: 'assertion-1',
        issuer: tenant.config.idpEntityId ?? '',
        nameId: 'qorium-saml-sandbox@example.com',
        nameIdFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress',
        audience: tenant.spEntityId,
        notBefore: new Date('2026-06-02T04:00:00.000Z'),
        notOnOrAfter: new Date('2026-06-02T05:00:00.000Z'),
        recipient: tenant.spAcsUrl,
        attributes: {},
      },
    });
    const [body] = session.token.split('.');

    expect(() => verifySessionToken(`${body}.x`, 'test-secret')).toThrow(
      'Invalid session token signature',
    );
  });
});
