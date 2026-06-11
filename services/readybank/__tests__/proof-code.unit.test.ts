import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import { issueProofCode, verifyProofCode } from '../src/lib/proof-code.js';

const SECRET = 'x'.repeat(32);
const SECRET2 = 'y'.repeat(40);
const ATTEMPT = 'f5fee843-0000-4000-8000-000000000001';

describe('proof-code', () => {
  it('round-trips a valid attempt id', () => {
    const code = issueProofCode(ATTEMPT, SECRET);
    const v = verifyProofCode(code, SECRET);
    expect(v.ok).toBe(true);
    if (v.ok) expect(v.attemptId).toBe(ATTEMPT);
  });

  it('is deterministic for the same attempt + secret', () => {
    expect(issueProofCode(ATTEMPT, SECRET)).toBe(issueProofCode(ATTEMPT, SECRET));
  });

  it('rejects a code minted under a different secret', () => {
    const code = issueProofCode(ATTEMPT, SECRET);
    const v = verifyProofCode(code, SECRET2);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe('bad_signature');
  });

  it('rejects a tampered body (mutated attempt id, original mac)', () => {
    const code = issueProofCode(ATTEMPT, SECRET);
    const [, mac] = code.split('.');
    const forgedBody = Buffer.from('00000000-0000-4000-8000-000000000002', 'utf8')
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const v = verifyProofCode(`${forgedBody}.${mac}`, SECRET);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe('bad_signature');
  });

  it('rejects malformed input', () => {
    for (const bad of ['', 'no-dot', '.', 'abc.', '.def']) {
      const v = verifyProofCode(bad, SECRET);
      expect(v.ok).toBe(false);
      if (!v.ok) expect(v.reason).toBe('malformed');
    }
  });

  it('rejects a well-signed code that does not decode to a UUID', () => {
    // body is valid base64url of a non-UUID string, signed correctly
    const body = Buffer.from('not-a-uuid', 'utf8')
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const mac = createHmac('sha256', SECRET)
      .update(body)
      .digest('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
    const v = verifyProofCode(`${body}.${mac}`, SECRET);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toBe('malformed');
  });

  it('throws when minting with a weak secret', () => {
    expect(() => issueProofCode(ATTEMPT, 'short')).toThrow();
  });

  it('throws when minting for a non-UUID attempt', () => {
    expect(() => issueProofCode('nope', SECRET)).toThrow();
  });
});
