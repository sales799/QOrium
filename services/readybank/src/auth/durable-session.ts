import { randomUUID } from 'node:crypto';
import {
  verifyRecruiterToken,
  signRecruiterToken,
  InvalidRecruiterSession,
  type RecruiterMethod,
} from '@qorium/auth';
import type { SessionKey, StoredSession, createSessionStore } from './session-store.js';
export { InvalidRecruiterSession } from '@qorium/auth';
type Store = ReturnType<typeof createSessionStore>;
/** Each method has a pinned signing key and method-specific durable store. */
export function durableSessions(
  store: Store,
  secret: string,
  saml?: { store: Store; secret: string },
) {
  if (Buffer.byteLength(secret, 'utf8') < 32)
    throw new Error('Session signing secret must be at least 32 bytes');
  const keys = { password: secret, saml: saml?.secret };
  function read(token: string, allowExpired = false): SessionKey {
    const c = verifyRecruiterToken(token, keys, allowExpired);
    return { tenantId: c.tenant_id, recruiterId: c.sub, sessionId: c.sid, method: c.auth_method };
  }
  function backend(method: SessionKey['method']) {
    if (method === 'password') return { store, secret };
    if (method === 'saml' && saml) return saml;
    throw new InvalidRecruiterSession();
  }
  function issue(key: SessionKey, row: StoredSession | null) {
    if (!row || row.id !== key.recruiterId || row.tenant_id !== key.tenantId)
      throw new InvalidRecruiterSession();
    const provider = backend(key.method);
    const token = signRecruiterToken({
      recruiterId: row.id,
      tenantId: row.tenant_id,
      sessionId: key.sessionId,
      email: row.email,
      name: row.name,
      method: key.method as RecruiterMethod,
      expiresAt: row.expires_at,
      secret: provider.secret,
    });
    return {
      token,
      expiresAt: new Date(Math.floor(row.expires_at.getTime() / 1000) * 1000),
      recruiter: row,
      sessionId: key.sessionId,
    };
  }
  return {
    async start(tenantId: string, recruiterId: string) {
      const key: SessionKey = {
        tenantId,
        recruiterId,
        sessionId: randomUUID(),
        method: 'password',
      };
      return issue(key, await store.create(key));
    },
    async renew(token: string) {
      const key = read(token);
      return issue(key, await backend(key.method).store.renew(key));
    },
    async revoke(token: string) {
      const key = read(token, true);
      await backend(key.method).store.revoke(key);
      return { tenantId: key.tenantId, recruiterId: key.recruiterId, method: key.method };
    },
  };
}
