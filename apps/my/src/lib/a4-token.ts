// A4 stateless invitation token (HMAC-SHA256).
//
// Format:  <base64url(payloadJson)>.<base64url(hmac)>
//
// The token itself IS the invite — no DB row required at v0. When migration
// 0015 (content.invitations + content.attempts) lands, persistence is added
// without changing the wire format; the `jti` claim becomes the invitation
// row id.

import { createHmac, timingSafeEqual, randomUUID } from 'node:crypto';

export interface A4TokenPayload {
  jti: string; // unique token id (also = invitation row id when 0015 lands)
  question_id: string; // UUID of content.questions
  candidate_id: string; // external candidate id (e.g. email or applicant ref)
  tenant_id: string; // UUID of app.tenants
  skill_id?: string; // optional; convenience claim, denormalised from question
  country: 'IN'; // India-resident-only invariant
  iat: number; // issued-at (unix seconds)
  exp: number; // expiry (unix seconds)
}

export interface SignOptions {
  secret: string;
  ttlSeconds?: number; // default 7 days
}

export function newJti(): string {
  return randomUUID();
}

function b64u(buf: Buffer): string {
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromB64u(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

export function signA4Token(
  payload: Omit<A4TokenPayload, 'iat' | 'exp'>,
  opts: SignOptions,
): string {
  if (!opts.secret || opts.secret.length < 32) {
    throw new Error('A4_TOKEN_SECRET must be >= 32 characters');
  }
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (opts.ttlSeconds ?? 7 * 24 * 3600);
  const full: A4TokenPayload = { ...payload, iat: now, exp };
  const body = b64u(Buffer.from(JSON.stringify(full), 'utf8'));
  const mac = createHmac('sha256', opts.secret).update(body).digest();
  return `${body}.${b64u(mac)}`;
}

export interface VerifyResult {
  ok: true;
  payload: A4TokenPayload;
}

export interface VerifyError {
  ok: false;
  reason: 'malformed' | 'bad_signature' | 'expired' | 'country_mismatch' | 'missing_claim';
}

export function verifyA4Token(token: string, secret: string): VerifyResult | VerifyError {
  if (!token || typeof token !== 'string' || token.length > 4096) {
    return { ok: false, reason: 'malformed' };
  }
  const dot = token.indexOf('.');
  if (dot < 1 || dot === token.length - 1) {
    return { ok: false, reason: 'malformed' };
  }
  const body = token.slice(0, dot);
  const mac = token.slice(dot + 1);

  const expectedMac = createHmac('sha256', secret).update(body).digest();
  let actualMac: Buffer;
  try {
    actualMac = fromB64u(mac);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (actualMac.length !== expectedMac.length) {
    return { ok: false, reason: 'bad_signature' };
  }
  if (!timingSafeEqual(actualMac, expectedMac)) {
    return { ok: false, reason: 'bad_signature' };
  }

  let payload: A4TokenPayload;
  try {
    payload = JSON.parse(fromB64u(body).toString('utf8')) as A4TokenPayload;
  } catch {
    return { ok: false, reason: 'malformed' };
  }

  if (
    !payload.jti ||
    !payload.question_id ||
    !payload.candidate_id ||
    !payload.tenant_id ||
    !payload.exp
  ) {
    return { ok: false, reason: 'missing_claim' };
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload.exp < now) {
    return { ok: false, reason: 'expired' };
  }

  if (payload.country !== 'IN') {
    return { ok: false, reason: 'country_mismatch' };
  }

  return { ok: true, payload };
}
