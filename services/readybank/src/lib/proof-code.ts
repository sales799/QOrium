// QOrium Proof-of-Skill code (HMAC-SHA256) — the N13 "proof engine" primitive.
//
// Format:  <base64url(attemptId)>.<base64url(hmac)>
//
// A proof code is a deterministic, tamper-evident handle to a *graded* attempt.
// It carries no PII and reveals nothing on its own — verification (and the
// resulting public proof record) only happens server-side at GET /v1/proof/:code
// after the HMAC is re-derived and the attempt is confirmed graded. Forged or
// mutated codes fail the constant-time signature check and 404.
//
// Deterministic by design: the same attempt always mints the same code, so the
// recruiter/admin review surface can display a stable, shareable verification
// handle without persisting anything (no schema change for slice 1).

import { createHmac, timingSafeEqual } from 'node:crypto';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const MIN_PROOF_SECRET_LENGTH = 32;

function b64u(buf: Buffer): string {
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function fromB64u(s: string): Buffer {
  const pad = s.length % 4 === 0 ? '' : '='.repeat(4 - (s.length % 4));
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/') + pad, 'base64');
}

/**
 * Mint a deterministic proof code for a graded attempt UUID.
 * Throws on a weak secret so a misconfigured deploy fails loud rather than
 * issuing forgeable codes.
 */
export function issueProofCode(attemptId: string, secret: string): string {
  if (!UUID.test(attemptId)) {
    throw new Error('issueProofCode: attemptId must be a UUID');
  }
  if (!secret || secret.length < MIN_PROOF_SECRET_LENGTH) {
    throw new Error(`PROOF secret must be >= ${MIN_PROOF_SECRET_LENGTH} characters`);
  }
  const body = b64u(Buffer.from(attemptId, 'utf8'));
  const mac = createHmac('sha256', secret).update(body).digest();
  return `${body}.${b64u(mac)}`;
}

export interface ProofVerifyOk {
  ok: true;
  attemptId: string;
}

export interface ProofVerifyError {
  ok: false;
  reason: 'malformed' | 'bad_signature';
}

/**
 * Verify a proof code and recover the attempt UUID it points at.
 * Returns a discriminated result — never throws on attacker-controlled input.
 */
export function verifyProofCode(code: string, secret: string): ProofVerifyOk | ProofVerifyError {
  if (!code || typeof code !== 'string' || code.length > 512 || !secret) {
    return { ok: false, reason: 'malformed' };
  }
  const dot = code.indexOf('.');
  if (dot < 1 || dot === code.length - 1) {
    return { ok: false, reason: 'malformed' };
  }
  const body = code.slice(0, dot);
  const mac = code.slice(dot + 1);

  const expectedMac = createHmac('sha256', secret).update(body).digest();
  let actualMac: Buffer;
  try {
    actualMac = fromB64u(mac);
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (actualMac.length !== expectedMac.length || !timingSafeEqual(actualMac, expectedMac)) {
    return { ok: false, reason: 'bad_signature' };
  }

  let attemptId: string;
  try {
    attemptId = fromB64u(body).toString('utf8');
  } catch {
    return { ok: false, reason: 'malformed' };
  }
  if (!UUID.test(attemptId)) {
    return { ok: false, reason: 'malformed' };
  }
  return { ok: true, attemptId };
}
