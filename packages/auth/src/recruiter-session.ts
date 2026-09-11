import { createHmac } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { isUuid } from '@qorium/db';
export const RECRUITER_AUDIENCE = 'qorium-recruiter';
export const PASSWORD_ISSUER = 'qorium-readybank';
export const SAML_ISSUER = 'qorium-saml';
export type RecruiterMethod = 'password' | 'saml';
export interface RecruiterTokenClaims extends jwt.JwtPayload {
  sub: string;
  tenant_id: string;
  sid: string;
  auth_method: RecruiterMethod;
  email: string;
  name: string;
  role: 'recruiter';
  exp: number;
}
export interface RecruiterSigningKeys {
  password: string;
  saml?: string | undefined;
}
export class InvalidRecruiterSession extends Error {
  constructor() {
    super('Session is invalid or expired');
  }
}
function secretFor(method: RecruiterMethod, keys: RecruiterSigningKeys): string {
  const secret = keys[method];
  if (!secret || Buffer.byteLength(secret, 'utf8') < 32) throw new InvalidRecruiterSession();
  return secret;
}
function valid(c: string | jwt.JwtPayload | null): c is RecruiterTokenClaims {
  return (
    typeof c === 'object' &&
    c !== null &&
    typeof c.sub === 'string' &&
    isUuid(c.sub) &&
    typeof c.tenant_id === 'string' &&
    isUuid(c.tenant_id) &&
    typeof c.sid === 'string' &&
    isUuid(c.sid) &&
    (c.auth_method === 'password' || c.auth_method === 'saml') &&
    c.role === 'recruiter' &&
    typeof c.email === 'string' &&
    c.email.trim().length > 0 &&
    typeof c.name === 'string' &&
    typeof c.exp === 'number' &&
    Number.isSafeInteger(c.exp)
  );
}
/** Decode only to select a pinned key; verification binds issuer, audience and method. */
export function verifyRecruiterToken(
  token: string,
  keys: RecruiterSigningKeys,
  allowExpired = false,
): RecruiterTokenClaims {
  try {
    if (token.length > 16384 || token.split('.').length !== 3) throw new InvalidRecruiterSession();
    const decoded = jwt.decode(token);
    if (!valid(decoded)) throw new InvalidRecruiterSession();
    const method = decoded.auth_method;
    const verified = jwt.verify(token, secretFor(method, keys), {
      algorithms: ['HS256'],
      issuer: method === 'password' ? PASSWORD_ISSUER : SAML_ISSUER,
      audience: RECRUITER_AUDIENCE,
      ignoreExpiration: allowExpired,
    });
    if (!valid(verified) || verified.auth_method !== method) throw new InvalidRecruiterSession();
    return verified;
  } catch {
    throw new InvalidRecruiterSession();
  }
}
export function signRecruiterToken(input: {
  recruiterId: string;
  tenantId: string;
  sessionId: string;
  email: string;
  name: string;
  method: RecruiterMethod;
  expiresAt: Date;
  secret: string;
}): string {
  const claims = {
    sub: input.recruiterId,
    tenant_id: input.tenantId,
    sid: input.sessionId,
    auth_method: input.method,
    email: input.email,
    name: input.name,
    role: 'recruiter' as const,
    exp: Math.floor(input.expiresAt.getTime() / 1000),
  };
  if (!valid(claims) || claims.exp <= Math.floor(Date.now() / 1000))
    throw new InvalidRecruiterSession();
  const key = secretFor(input.method, { password: input.secret, saml: input.secret });
  return jwt.sign(claims, key, {
    algorithm: 'HS256',
    issuer: input.method === 'password' ? PASSWORD_ISSUER : SAML_ISSUER,
    audience: RECRUITER_AUDIENCE,
  });
}
export function hashRecruiterSessionId(
  method: RecruiterMethod,
  tenantId: string,
  sessionId: string,
  secret: string,
): Buffer {
  if (!isUuid(tenantId) || !isUuid(sessionId)) throw new InvalidRecruiterSession();
  const key = secretFor(method, { password: secret, saml: secret });
  return createHmac('sha256', key).update(`${method}-session:${tenantId}:${sessionId}`).digest();
}
