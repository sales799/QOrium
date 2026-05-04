import { describe, expect, it } from 'vitest';
import { issueSessionJwt, verifySessionJwt } from '../src/jwt.js';

const SECRET = 'session-test-secret-for-hs256';
const ISSUER = 'https://api.qorium.online';
const AUDIENCE = 'https://app.qorium.online';

function fixedNow(): Date {
  return new Date('2026-05-01T12:00:00Z');
}

describe('SSO JWT issuer + verifier', () => {
  it('issues a parseable JWT with required claims', () => {
    const token = issueSessionJwt({
      claims: {
        sub: 'usr_alice',
        tenant_id: 'ten_acme001',
        roles: ['admin'],
        email: 'alice@acme.com',
        name: 'Alice',
      },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: SECRET,
      ttlSeconds: 3600,
      now: fixedNow,
    });
    const parts = token.split('.');
    expect(parts).toHaveLength(3);
  });

  it('round-trips claims via verifySessionJwt', () => {
    const token = issueSessionJwt({
      claims: {
        sub: 'usr_alice',
        tenant_id: 'ten_acme001',
        roles: ['admin', 'reviewer'],
        email: 'alice@acme.com',
        name: 'Alice',
      },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: SECRET,
      ttlSeconds: 3600,
      now: fixedNow,
    });
    const result = verifySessionJwt({
      token,
      signingSecret: SECRET,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: fixedNow,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.claims.sub).toBe('usr_alice');
      expect(result.claims.email).toBe('alice@acme.com');
      expect(result.claims.roles).toEqual(['admin', 'reviewer']);
      expect(result.claims.name).toBe('Alice');
    }
  });

  it('rejects a token signed with the wrong secret', () => {
    const token = issueSessionJwt({
      claims: { sub: 'a', tenant_id: 't', roles: [], email: 'a@b.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: 'real-secret',
      ttlSeconds: 60,
      now: fixedNow,
    });
    const result = verifySessionJwt({
      token,
      signingSecret: 'attacker-secret',
      issuer: ISSUER,
      audience: AUDIENCE,
      now: fixedNow,
    });
    expect(result.ok).toBe(false);
  });

  it('rejects a token with the wrong audience', () => {
    const token = issueSessionJwt({
      claims: { sub: 'a', tenant_id: 't', roles: [], email: 'a@b.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: SECRET,
      ttlSeconds: 60,
      now: fixedNow,
    });
    const result = verifySessionJwt({
      token,
      signingSecret: SECRET,
      issuer: ISSUER,
      audience: 'https://other.example.com',
      now: fixedNow,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('aud mismatch');
  });

  it('rejects an expired token', () => {
    const token = issueSessionJwt({
      claims: { sub: 'a', tenant_id: 't', roles: [], email: 'a@b.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: SECRET,
      ttlSeconds: 60,
      now: fixedNow,
    });
    const later = new Date(fixedNow().getTime() + 120_000);
    const result = verifySessionJwt({
      token,
      signingSecret: SECRET,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: () => later,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toBe('expired');
  });

  it('rejects a malformed token', () => {
    const result = verifySessionJwt({
      token: 'not.a.jwt',
      signingSecret: SECRET,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: fixedNow,
    });
    expect(result.ok).toBe(false);
  });
});
