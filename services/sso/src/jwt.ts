/**
 * Minimal HS256 JWT issuer + verifier per spec §4 (Session Token).
 *
 * This is a deliberately small implementation that covers the v0 surface:
 *  - HS256 only (RS256 deferred to live KMS-key wire-up).
 *  - iss, aud, exp, iat, sub, plus tenant_id + roles + name + email.
 *
 * Why not use `jsonwebtoken`? We want zero dependencies in the auth path
 * to keep the supply chain small; HS256 is ~30 lines and the upgrade to
 * RS256 only swaps the signer.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

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
  signingSecret: string;
  ttlSeconds: number;
  /** Override `now` for tests. */
  now?: () => Date;
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
  const header = { alg: 'HS256', typ: 'JWT' };
  const headerSeg = base64url(JSON.stringify(header));
  const payloadSeg = base64url(JSON.stringify(payload));
  const signingInput = `${headerSeg}.${payloadSeg}`;
  const sig = createHmac('sha256', opts.signingSecret).update(signingInput).digest();
  const sigSeg = base64urlBuf(sig);
  return `${signingInput}.${sigSeg}`;
}

export interface VerifyOptions {
  token: string;
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
  if (!header || (header as { alg?: string }).alg !== 'HS256') {
    return { ok: false, reason: 'unsupported algorithm' };
  }

  const expected = createHmac('sha256', opts.signingSecret)
    .update(`${headerSeg}.${payloadSeg}`)
    .digest();
  const actual = Buffer.from(
    sigSeg.replace(/-/g, '+').replace(/_/g, '/') + padBase64(sigSeg),
    'base64',
  );
  if (expected.length !== actual.length) return { ok: false, reason: 'signature length mismatch' };
  if (!timingSafeEqual(expected, actual)) return { ok: false, reason: 'signature mismatch' };

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
