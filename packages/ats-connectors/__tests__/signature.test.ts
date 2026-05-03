import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import { computeHmacSignature, verifyHmacSignature } from '../src/signature';

const SECRET = 'webhook-secret-32-chars-or-longer-please';
const BODY = Buffer.from('{"hello":"world"}');

function expectedSig(): string {
  return createHmac('sha256', SECRET).update(BODY).digest('hex');
}

describe('verifyHmacSignature', () => {
  it('verifies a sha256= prefixed signature', () => {
    const ok = verifyHmacSignature({
      rawBody: BODY,
      signatureHeader: `sha256=${expectedSig()}`,
      secret: SECRET,
      prefix: 'sha256=',
    });
    expect(ok).toBe(true);
  });

  it('verifies an unprefixed hex signature when no prefix is set', () => {
    const ok = verifyHmacSignature({
      rawBody: BODY,
      signatureHeader: expectedSig(),
      secret: SECRET,
    });
    expect(ok).toBe(true);
  });

  it('rejects when the signature is wrong', () => {
    const ok = verifyHmacSignature({
      rawBody: BODY,
      signatureHeader: 'sha256=' + 'a'.repeat(64),
      secret: SECRET,
      prefix: 'sha256=',
    });
    expect(ok).toBe(false);
  });

  it('rejects when the header is missing', () => {
    expect(verifyHmacSignature({ rawBody: BODY, signatureHeader: undefined, secret: SECRET })).toBe(
      false,
    );
    expect(verifyHmacSignature({ rawBody: BODY, signatureHeader: '', secret: SECRET })).toBe(false);
  });

  it('rejects when the body is empty', () => {
    expect(
      verifyHmacSignature({
        rawBody: Buffer.alloc(0),
        signatureHeader: expectedSig(),
        secret: SECRET,
      }),
    ).toBe(false);
  });

  it('rejects when the secret is missing', () => {
    expect(
      verifyHmacSignature({
        rawBody: BODY,
        signatureHeader: expectedSig(),
        secret: '',
      }),
    ).toBe(false);
  });

  it('rejects non-hex header values', () => {
    expect(
      verifyHmacSignature({
        rawBody: BODY,
        signatureHeader: 'sha256=not-hex-zzzz',
        secret: SECRET,
        prefix: 'sha256=',
      }),
    ).toBe(false);
  });

  it('handles array-shaped header (Express normalisation)', () => {
    const ok = verifyHmacSignature({
      rawBody: BODY,
      signatureHeader: [`sha256=${expectedSig()}`],
      secret: SECRET,
      prefix: 'sha256=',
    });
    expect(ok).toBe(true);
  });
});

describe('computeHmacSignature', () => {
  it('returns a sha256= prefixed hex digest', () => {
    const sig = computeHmacSignature(BODY, SECRET);
    expect(sig).toBe(`sha256=${expectedSig()}`);
  });

  it('honours a custom prefix', () => {
    const sig = computeHmacSignature(BODY, SECRET, '');
    expect(sig).toBe(expectedSig());
  });
});
