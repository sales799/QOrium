import { describe, expect, it } from 'vitest';
import { generateKeyPairSync } from 'node:crypto';
import { detectAlg, issueSessionJwt, verifySessionJwt } from '../src/jwt';

function generateRsaKeys(): { privatePem: string; publicPem: string } {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
  return {
    privatePem: privateKey.export({ format: 'pem', type: 'pkcs8' }).toString(),
    publicPem: publicKey.export({ format: 'pem', type: 'spki' }).toString(),
  };
}

const ISSUER = 'https://api.qorium.io';
const AUDIENCE = 'https://app.qorium.io';
const NOW = (): Date => new Date('2026-05-03T20:00:00Z');

describe('detectAlg', () => {
  it('returns RS256 for PEM', () => {
    expect(detectAlg('-----BEGIN PRIVATE KEY-----\nABC\n-----END PRIVATE KEY-----')).toBe('RS256');
  });
  it('returns HS256 for shared secret', () => {
    expect(detectAlg('shared-hex-secret-32-or-more')).toBe('HS256');
  });
});

describe('RS256 issue + verify round-trip', () => {
  it('signs and verifies with private key + public key', () => {
    const { privatePem, publicPem } = generateRsaKeys();
    const token = issueSessionJwt({
      claims: { sub: 'usr', tenant_id: 't', roles: ['admin'], email: 'a@b.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: privatePem,
      ttlSeconds: 3600,
      now: NOW,
    });
    const result = verifySessionJwt({
      token,
      signingSecret: publicPem,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: NOW,
    });
    expect(result.ok).toBe(true);
  });

  it('verifies with the private key (derived public)', () => {
    const { privatePem } = generateRsaKeys();
    const token = issueSessionJwt({
      claims: { sub: 'u', tenant_id: 't', roles: [], email: 'x@y.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: privatePem,
      ttlSeconds: 60,
      now: NOW,
    });
    const result = verifySessionJwt({
      token,
      signingSecret: privatePem,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: NOW,
    });
    expect(result.ok).toBe(true);
  });

  it('rejects an HS256 token when given an RS256 key', () => {
    const { publicPem } = generateRsaKeys();
    const hsToken = issueSessionJwt({
      claims: { sub: 'u', tenant_id: 't', roles: [], email: 'x@y.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: 'shared-secret-32-chars-or-longer',
      ttlSeconds: 60,
      now: NOW,
    });
    const result = verifySessionJwt({
      token: hsToken,
      signingSecret: publicPem,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: NOW,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/algorithm mismatch/);
  });

  it('rejects a token signed by a different RSA key', () => {
    const a = generateRsaKeys();
    const b = generateRsaKeys();
    const token = issueSessionJwt({
      claims: { sub: 'u', tenant_id: 't', roles: [], email: 'x@y.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: a.privatePem,
      ttlSeconds: 60,
      now: NOW,
    });
    const result = verifySessionJwt({
      token,
      signingSecret: b.publicPem,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: NOW,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.reason).toMatch(/RS256 signature mismatch/);
  });
});

describe('HS256 still works after the RS256 refactor', () => {
  it('issues + verifies with a shared secret', () => {
    const SECRET = 'shared-test-secret-32-chars-or-longer';
    const token = issueSessionJwt({
      claims: { sub: 'u', tenant_id: 't', roles: ['admin'], email: 'x@y.io' },
      issuer: ISSUER,
      audience: AUDIENCE,
      signingSecret: SECRET,
      ttlSeconds: 60,
      now: NOW,
    });
    const result = verifySessionJwt({
      token,
      signingSecret: SECRET,
      issuer: ISSUER,
      audience: AUDIENCE,
      now: NOW,
    });
    expect(result.ok).toBe(true);
  });
});
