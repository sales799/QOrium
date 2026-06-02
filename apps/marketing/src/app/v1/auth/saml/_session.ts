import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';

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
    roles: sessionRoles(input.assertion),
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
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifySessionToken(token: string, secret = sessionSecret()): SamlSessionPayload {
  const [body, signature] = token.split('.');
  if (!body || !signature) throw new Error('Malformed session token');
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  const suppliedSignature = Buffer.from(signature);
  const expectedSignature = Buffer.from(expected);
  if (
    suppliedSignature.length !== expectedSignature.length ||
    !timingSafeEqual(suppliedSignature, expectedSignature)
  ) {
    throw new Error('Invalid session token signature');
  }
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SamlSessionPayload;
  if (payload.typ !== 'saml' || payload.v !== 1 || payload.exp < Date.now()) {
    throw new Error('Invalid or expired session token');
  }
  return payload;
}

export function samlSessionCookie(token: string, maxAgeSeconds: number, secure: boolean): string {
  return [
    `${SAML_SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    secure ? 'Secure' : '',
    `Max-Age=${maxAgeSeconds}`,
  ]
    .filter(Boolean)
    .join('; ');
}

function sessionRoles(assertion: ParsedSamlAssertion): string[] {
  const roles = assertion.attributes['qorium_roles'] ?? assertion.attributes['roles'] ?? [];
  const cleaned = roles.map((role) => role.trim()).filter(Boolean);
  return cleaned.length > 0 ? cleaned : ['recruiter'];
}

function sessionSecret(): string {
  const secret =
    process.env.QORIUM_SESSION_SIGNING_SECRET ??
    process.env.QORIUM_RECRUITER_JWT_SECRET ??
    process.env.QORIUM_SIGNING_SECRET;
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
  return 'dev-only-change-me';
}
