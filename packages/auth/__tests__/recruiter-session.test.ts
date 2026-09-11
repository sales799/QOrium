import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { describe, it, expect } from 'vitest';
import {
  signRecruiterToken,
  verifyRecruiterToken,
  hashRecruiterSessionId,
  InvalidRecruiterSession,
  PASSWORD_ISSUER,
} from '../src/recruiter-session.js';
const password = 'synthetic-password-secret-'.repeat(2),
  saml = 'synthetic-saml-secret-'.repeat(2);
const base = () => ({
  recruiterId: randomUUID(),
  tenantId: randomUUID(),
  sessionId: randomUUID(),
  email: 'synthetic@example.test',
  name: 'Test',
  expiresAt: new Date(Date.now() + 60000),
});
describe('shared recruiter JWT trust contract', () => {
  it.each(['password', 'saml'] as const)(
    'round trips %s with its pinned key and method',
    (method) => {
      const input = base(),
        token = signRecruiterToken({
          ...input,
          method,
          secret: method === 'password' ? password : saml,
        });
      const claims = verifyRecruiterToken(token, { password, saml });
      expect(claims.auth_method).toBe(method);
      expect(claims.sub).toBe(input.recruiterId);
      expect(claims.role).toBe('recruiter');
      expect(claims.exp * 1000).toBeLessThanOrEqual(input.expiresAt.getTime());
    },
  );
  it('rejects SAML when no trusted SAML key is configured', () => {
    const token = signRecruiterToken({ ...base(), method: 'saml', secret: saml });
    expect(() => verifyRecruiterToken(token, { password })).toThrow(InvalidRecruiterSession);
  });
  it('rejects SAML signed using the password key', () => {
    const token = signRecruiterToken({ ...base(), method: 'saml', secret: password });
    expect(() => verifyRecruiterToken(token, { password, saml })).toThrow(InvalidRecruiterSession);
  });
  it('rejects password tokens signed using the SAML key', () => {
    const token = signRecruiterToken({ ...base(), method: 'password', secret: saml });
    expect(() => verifyRecruiterToken(token, { password, saml })).toThrow(InvalidRecruiterSession);
  });
  it.each(['iss', 'aud', 'auth_method', 'role', 'tenant_id', 'sid'] as const)(
    'rejects altered %s even with the SAML key',
    (field) => {
      const token = signRecruiterToken({ ...base(), method: 'saml', secret: saml });
      const claims = jwt.decode(token) as jwt.JwtPayload;
      claims[field] =
        field === 'iss' ? PASSWORD_ISSUER : field === 'auth_method' ? 'password' : 'invalid';
      expect(() => verifyRecruiterToken(jwt.sign(claims, saml), { password, saml })).toThrow(
        InvalidRecruiterSession,
      );
    },
  );
  it('rejects legacy two-segment tokens and appended segments', () => {
    const token = signRecruiterToken({ ...base(), method: 'saml', secret: saml });
    for (const invalid of [token.split('.').slice(1).join('.'), token + '.extra'])
      expect(() => verifyRecruiterToken(invalid, { password, saml })).toThrow(
        InvalidRecruiterSession,
      );
  });
  it('separates identifier hashes by method and tenant', () => {
    const a = base();
    const hash = hashRecruiterSessionId('password', a.tenantId, a.sessionId, password);
    expect(hash.equals(hashRecruiterSessionId('saml', a.tenantId, a.sessionId, password))).toBe(
      false,
    );
    expect(
      hash.equals(hashRecruiterSessionId('password', randomUUID(), a.sessionId, password)),
    ).toBe(false);
  });
});
