import { describe, expect, it } from 'vitest';
import { newJti, signA4Token, verifyA4Token } from '../src/lib/a4-token.js';

const SECRET = 'x'.repeat(40);
const base = {
  jti: '11111111-1111-4111-8111-111111111111',
  question_id: '22222222-2222-4222-8222-222222222222',
  candidate_id: 'cand@talpro.in',
  tenant_id: '33333333-3333-4333-8333-333333333333',
  country: 'IN' as const,
};

describe('newJti', () => {
  it('returns distinct UUID-shaped ids', () => {
    const a = newJti();
    const b = newJti();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/i);
  });
});

describe('signA4Token', () => {
  it('throws when the secret is shorter than 32 chars', () => {
    expect(() => signA4Token(base, { secret: 'short' })).toThrow(/>= 32/);
  });
  it('produces a two-part body.mac token', () => {
    const tok = signA4Token(base, { secret: SECRET });
    expect(tok.split('.')).toHaveLength(2);
  });
});

describe('verifyA4Token', () => {
  it('round-trips a freshly signed token', () => {
    const tok = signA4Token(base, { secret: SECRET });
    const res = verifyA4Token(tok, SECRET);
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.payload.question_id).toBe(base.question_id);
      expect(res.payload.country).toBe('IN');
      expect(res.payload.exp).toBeGreaterThan(res.payload.iat);
    }
  });

  it('rejects malformed tokens', () => {
    expect(verifyA4Token('', SECRET)).toMatchObject({ ok: false, reason: 'malformed' });
    expect(verifyA4Token('nodot', SECRET)).toMatchObject({ ok: false, reason: 'malformed' });
  });

  it('rejects a token signed with a different secret', () => {
    const tok = signA4Token(base, { secret: SECRET });
    expect(verifyA4Token(tok, 'y'.repeat(40))).toMatchObject({
      ok: false,
      reason: 'bad_signature',
    });
  });

  it('rejects a tampered body', () => {
    const tok = signA4Token(base, { secret: SECRET });
    const [body, mac] = tok.split('.');
    const flipped = (body[0] === 'a' ? 'b' : 'a') + body.slice(1);
    expect(verifyA4Token(`${flipped}.${mac}`, SECRET).ok).toBe(false);
  });

  it('rejects an expired token', () => {
    const tok = signA4Token(base, { secret: SECRET, ttlSeconds: -10 });
    expect(verifyA4Token(tok, SECRET)).toMatchObject({ ok: false, reason: 'expired' });
  });

  it('flags a country other than IN', () => {
    const tok = signA4Token({ ...base, country: 'US' } as never, { secret: SECRET });
    expect(verifyA4Token(tok, SECRET)).toMatchObject({ ok: false, reason: 'country_mismatch' });
  });

  it('flags a missing required claim', () => {
    const { question_id: _omit, ...rest } = base;
    const tok = signA4Token(rest as never, { secret: SECRET });
    expect(verifyA4Token(tok, SECRET)).toMatchObject({ ok: false, reason: 'missing_claim' });
  });
});
