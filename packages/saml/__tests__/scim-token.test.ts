import { describe, it, expect } from 'vitest';
import { hashScimToken, tokenHashesEqual, validateScimAuth } from '../src/scim-token.js';

const PEPPER = 'test-pepper-32-chars-min-aaaaaaaa';
const TOKEN = 'qor_scim_test_token_with_enough_entropy_xyz123';
const TENANT_A = '00000000-0000-0000-0000-00000000000a';
const NOW = new Date('2026-05-08T12:00:00Z');
const FUTURE = new Date('2027-05-08T12:00:00Z');
const PAST = new Date('2026-05-01T12:00:00Z');

describe('hashScimToken', () => {
  it('produces deterministic hash for same input', () => {
    const a = hashScimToken(TOKEN, PEPPER);
    const b = hashScimToken(TOKEN, PEPPER);
    expect(a.equals(b)).toBe(true);
    expect(a.length).toBe(32);
  });

  it('produces different hash for different pepper', () => {
    const a = hashScimToken(TOKEN, PEPPER);
    const b = hashScimToken(TOKEN, PEPPER + 'aaaa');
    expect(a.equals(b)).toBe(false);
  });

  it('rejects short pepper', () => {
    expect(() => hashScimToken(TOKEN, 'short')).toThrow(/pepper/);
  });

  it('rejects short token', () => {
    expect(() => hashScimToken('abc', PEPPER)).toThrow(/token must be/);
  });
});

describe('tokenHashesEqual', () => {
  it('handles equal length buffers', () => {
    const a = hashScimToken(TOKEN, PEPPER);
    const b = hashScimToken(TOKEN, PEPPER);
    expect(tokenHashesEqual(a, b)).toBe(true);
  });

  it('returns false for different-length buffers without throwing', () => {
    expect(tokenHashesEqual(Buffer.from([1, 2, 3]), Buffer.from([1, 2]))).toBe(false);
  });
});

describe('validateScimAuth', () => {
  const validHash = hashScimToken(TOKEN, PEPPER);

  it('returns ok for valid token', () => {
    const r = validateScimAuth({
      rawToken: TOKEN,
      pepper: PEPPER,
      storedHashes: [{ tenantId: TENANT_A, hash: validHash, expiresAt: FUTURE }],
      now: NOW,
    });
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.tenantId).toBe(TENANT_A);
  });

  it('rejects expired token', () => {
    const r = validateScimAuth({
      rawToken: TOKEN,
      pepper: PEPPER,
      storedHashes: [{ tenantId: TENANT_A, hash: validHash, expiresAt: PAST }],
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.status).toBe(401);
      expect(r.detail).toMatch(/expired/i);
    }
  });

  it('rejects unknown token', () => {
    const r = validateScimAuth({
      rawToken: 'qor_scim_unknown_token_with_padding_to_min',
      pepper: PEPPER,
      storedHashes: [{ tenantId: TENANT_A, hash: validHash, expiresAt: FUTURE }],
      now: NOW,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.status).toBe(401);
  });

  it('honors rotation overlap (new + old hash both valid)', () => {
    const NEW_TOKEN = 'qor_scim_new_token_after_rotation_aaaaaa';
    const newHash = hashScimToken(NEW_TOKEN, PEPPER);
    const oldHash = hashScimToken(TOKEN, PEPPER);

    // Old token still works
    const rOld = validateScimAuth({
      rawToken: TOKEN,
      pepper: PEPPER,
      storedHashes: [
        { tenantId: TENANT_A, hash: newHash, expiresAt: FUTURE },
        { tenantId: TENANT_A, hash: oldHash, expiresAt: FUTURE },
      ],
      now: NOW,
    });
    expect(rOld.ok).toBe(true);

    // New token works
    const rNew = validateScimAuth({
      rawToken: NEW_TOKEN,
      pepper: PEPPER,
      storedHashes: [
        { tenantId: TENANT_A, hash: newHash, expiresAt: FUTURE },
        { tenantId: TENANT_A, hash: oldHash, expiresAt: FUTURE },
      ],
      now: NOW,
    });
    expect(rNew.ok).toBe(true);
  });

  it('rejects bad pepper', () => {
    const r = validateScimAuth({
      rawToken: TOKEN,
      pepper: 'short',
      storedHashes: [{ tenantId: TENANT_A, hash: validHash, expiresAt: FUTURE }],
      now: NOW,
    });
    expect(r.ok).toBe(false);
  });
});
