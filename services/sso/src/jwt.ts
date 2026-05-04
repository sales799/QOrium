/**
 * JWT issuer + verifier per spec §4 (Session Token).
 *
 * Supports two algorithms:
 *  - HS256 (default; symmetric secret)
 *  - RS256 (asymmetric; PEM-encoded RSA private/public key pair)
 *
 * Selection is automatic from the `signingSecret` shape:
 *  - PEM string starting with `-----BEGIN ...-----` → RS256
 *  - everything else → HS256
 *
 * Spec §7.3 calls for 2048-bit RSA + KMS once the live key is
 * provisioned. The interface stays the same; callers swap the env
 * var content from a hex secret to a PEM private key.
 */

import {
  createHmac,
  createPrivateKey,
  createPublicKey,
  sign as cryptoSign,
  verify as cryptoVerify,
  timingSafeEqual,
  type KeyObject,
} from 'node:crypto';

export type JwtAlg = 'HS256' | 'RS256';

export interface SessionClaims {
  sub: string;
  tenant_id: string;
  roles: string[];
  email: string;
  name?: string;
}

export interface IssueOptions {
  claims: SessionClaims;
  issuer: string;
  audience: string;
  /** HS256 = shared secret. RS256 = PEM-encoded RSA private key. */
  signingSecret: string;
  ttlSeconds: number;
  /** Override `now` for tests. */
  now?: () => Date;
}

export function detectAlg(secret: string): JwtAlg {
  return secret.includes('-----BEGIN') ? 'RS256' : 'HS256';
}

function loadPrivateKey(pem: string): KeyObject {
  return createPrivateKey({ key: pem, format: 'pem' });
}

function loadPublicKey(pemOrPrivate: string): KeyObject {
  if (pemOrPrivate.includes('PRIVATE KEY')) {
    return createPublicKey(loadPrivateKey(pemOrPrivate));
  }
  return createPublicKey({ key: pemOrPrivate, format: 'pem' });
}

export function issueSessionJwt(opts: IssueOptions): string {
  const now = (opts.now ?? (() => new Date()))();
  const iat = Math.floor(now.getTime() / 1000);
  const exp = iat + opts.ttlSeconds;
  const payload = {
    ...opts.claims,
    iss: opts.issuer,
    aud: opts.audience,
    iat,
    exp,
  };
  const alg = detectAlg(opts.signingSecret);
  const header = { alg, typ: 'JWT' };
  const headerSeg = base64url(JSON.stringify(header));
  const payloadSeg = base64url(JSON.stringify(payload));
  const signingInput = `${headerSeg}.${payloadSeg}`;
  const sig =
    alg === 'HS256'
      ? createHmac('sha256', opts.signingSecret).update(signingInput).digest()
      : cryptoSign(
          'RSA-SHA256',
          Buffer.from(signingInput, 'utf8'),
          loadPrivateKey(opts.signingSecret),
        );
  const sigSeg = base64urlBuf(sig);
  return `${signingInput}.${sigSeg}`;
}

export interface VerifyOptions {
  token: string;
  /** HS256 = shared secret. RS256 = PEM-encoded RSA public key (or the private key — public will be derived). */
  signingSecret: string;
  issuer: string;
  audience: string;
  /** Override `now` for tests. */
  now?: () => Date;
}

export interface VerifyOk {
  ok: true;
  claims: SessionClaims & { iat: number; exp: number };
}
export interface VerifyErr {
  ok: false;
  reason: string;
}
export type VerifyResult = VerifyOk | VerifyErr;

export function verifySessionJwt(opts: VerifyOptions): VerifyResult {
  const parts = opts.token.split('.');
  if (parts.length !== 3) return { ok: false, reason: 'invalid jwt format' };
  const [headerSeg, payloadSeg, sigSeg] = parts as [string, string, string];

  const header = decodeJson(headerSeg);
  const headerAlg = header && (header as { alg?: string }).alg;
  if (headerAlg !== 'HS256' && headerAlg !== 'RS256') {
    return { ok: false, reason: 'unsupported algorithm' };
  }
  const expectedAlg = detectAlg(opts.signingSecret);
  if (headerAlg !== expectedAlg) {
    return {
      ok: false,
      reason: `algorithm mismatch: expected ${expectedAlg}, token says ${headerAlg}`,
    };
  }

  const signingInput = `${headerSeg}.${payloadSeg}`;
  const sigBuf = Buffer.from(
    sigSeg.replace(/-/g, '+').replace(/_/g, '/') + padBase64(sigSeg),
    'base64',
  );

  if (headerAlg === 'HS256') {
    const expected = createHmac('sha256', opts.signingSecret).update(signingInput).digest();
    if (expected.length !== sigBuf.length)
      return { ok: false, reason: 'signature length mismatch' };
    if (!timingSafeEqual(expected, sigBuf)) return { ok: false, reason: 'signature mismatch' };
  } else {
    let publicKey: KeyObject;
    try {
      publicKey = loadPublicKey(opts.signingSecret);
    } catch (err) {
      return {
        ok: false,
        reason: `invalid RS256 key: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
    const ok = cryptoVerify('RSA-SHA256', Buffer.from(signingInput, 'utf8'), publicKey, sigBuf);
    if (!ok) return { ok: false, reason: 'RS256 signature mismatch' };
  }

  const payload = decodeJson(payloadSeg);
  if (!payload || typeof payload !== 'object') return { ok: false, reason: 'invalid payload' };
  const p = payload as Record<string, unknown>;
  if (p.iss !== opts.issuer) return { ok: false, reason: 'iss mismatch' };
  if (p.aud !== opts.audience) return { ok: false, reason: 'aud mismatch' };

  const now = Math.floor((opts.now ?? (() => new Date()))().getTime() / 1000);
  const exp = typeof p.exp === 'number' ? p.exp : 0;
  if (now >= exp) return { ok: false, reason: 'expired' };

  if (
    typeof p.sub !== 'string' ||
    typeof p.tenant_id !== 'string' ||
    !Array.isArray(p.roles) ||
    typeof p.email !== 'string'
  ) {
    return { ok: false, reason: 'missing required claims' };
  }
  const claims: SessionClaims & { iat: number; exp: number } = {
    sub: p.sub,
    tenant_id: p.tenant_id,
    roles: p.roles.filter((r): r is string => typeof r === 'string'),
    email: p.email,
    iat: typeof p.iat === 'number' ? p.iat : 0,
    exp,
  };
  if (typeof p.name === 'string') claims.name = p.name;
  return { ok: true, claims };
}

function base64url(value: string): string {
  return base64urlBuf(Buffer.from(value, 'utf8'));
}

function base64urlBuf(buf: Buffer): string {
  return buf.toString('base64').replace(/=+$/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function padBase64(seg: string): string {
  const m = seg.length % 4;
  return m === 0 ? '' : '='.repeat(4 - m);
}

function decodeJson(seg: string): unknown {
  try {
    const txt = Buffer.from(
      seg.replace(/-/g, '+').replace(/_/g, '/') + padBase64(seg),
      'base64',
    ).toString('utf8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}
