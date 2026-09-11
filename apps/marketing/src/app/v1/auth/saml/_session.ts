import { randomUUID } from 'node:crypto';
import { signRecruiterToken, verifyRecruiterToken } from '@qorium/auth';

import type { ParsedSamlAssertion } from '@qorium/saml';

import type { SamlProofTenant } from './_config';

const SESSION_TTL_SECONDS = 8 * 60 * 60;
const SESSION_SECRET_MIN_BYTES = 32;
export const SAML_SESSION_COOKIE = 'qor_session';

export interface SamlSessionPayload {
  v: 1;
  typ: 'saml';
  sid: string;
  tenant: string;
  tenantId: string;
  recruiterId: string;
  email: string;
  roles: string[];
  authSource: 'saml-jit' | 'saml-claim';
  iat: number;
  exp: number;
}

export interface CreateSamlSessionInput {
  tenant: SamlProofTenant;
  assertion: ParsedSamlAssertion;
  email: string;
  recruiterId?: string;
  authSource?: SamlSessionPayload['authSource'];
  now?: Date;
  secret?: string;
}

export function createSamlSession(input: CreateSamlSessionInput): {
  payload: SamlSessionPayload;
  token: string;
  maxAgeSeconds: number;
} {
  const nowMs = (input.now ?? new Date()).getTime();
  const payload: SamlSessionPayload = {
    v: 1,
    typ: 'saml',
    sid: randomUUID(),
    tenant: input.tenant.slug,
    tenantId: input.tenant.config.tenantId,
    recruiterId: input.recruiterId ?? `saml:${input.tenant.slug}:${input.email}`,
    email: input.email,
    roles: ['recruiter'],
    authSource: input.authSource ?? 'saml-jit',
    iat: nowMs,
    exp: nowMs + SESSION_TTL_SECONDS * 1000,
  };
  return {
    payload,
    token: signSessionPayload(payload, input.secret),
    maxAgeSeconds: SESSION_TTL_SECONDS,
  };
}

export function signSessionPayload(payload: SamlSessionPayload, secret = sessionSecret()): string {
  return signRecruiterToken({
    recruiterId: payload.recruiterId,
    tenantId: payload.tenantId,
    sessionId: payload.sid,
    email: payload.email,
    name: payload.email,
    method: 'saml',
    expiresAt: new Date(payload.exp),
    secret,
  });
}

export function verifySessionToken(token: string, secret = sessionSecret()) {
  return verifyRecruiterToken(token, { password: '', saml: secret });
}

export function samlSessionCookie(token: string, expiresAt: Date, secure: boolean): string {
  return [
    `${SAML_SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    secure ? 'Secure' : '',
    `Expires=${new Date(Math.floor(expiresAt.getTime() / 1000) * 1000).toUTCString()}`,
  ]
    .filter(Boolean)
    .join('; ');
}

export function sessionSecret(): string {
  const secret = process.env.QORIUM_SESSION_SIGNING_SECRET;
  if (secret) {
    if (
      process.env.NODE_ENV === 'production' &&
      Buffer.byteLength(secret, 'utf8') < SESSION_SECRET_MIN_BYTES
    ) {
      throw new Error('QORIUM_SESSION_SIGNING_SECRET must be at least 32 bytes in production');
    }
    return secret;
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('QORIUM_SESSION_SIGNING_SECRET is required in production');
  }
  return 'dev-only-saml-session-secret-change-me';
}
