import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { isUuid } from '@qorium/db';
import { JWT_AUDIENCE, JWT_ISSUER } from '../middleware/recruiter-auth.js';
import type { SessionKey, StoredSession, createSessionStore } from './session-store.js';

export class InvalidRecruiterSession extends Error {
  constructor() {
    super('Session is invalid or expired');
  }
}
type Store = ReturnType<typeof createSessionStore>;

/** Token lifecycle adapter. HTTP routes must adopt this explicitly; no legacy fallback. */
export function durableSessions(store: Store, secret: string) {
  if (Buffer.byteLength(secret, 'utf8') < 32)
    throw new Error('Session signing secret must be at least 32 bytes');
  function read(token: string, allowExpired = false): SessionKey {
    try {
      const c = jwt.verify(token, secret, {
        algorithms: ['HS256'],
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        ignoreExpiration: allowExpired,
      });
      if (
        typeof c !== 'object' ||
        !isUuid(c.sub ?? '') ||
        typeof c.tenant_id !== 'string' ||
        !isUuid(c.tenant_id) ||
        typeof c.sid !== 'string' ||
        !isUuid(c.sid) ||
        c.auth_method !== 'password' ||
        c.role !== 'recruiter' ||
        typeof c.exp !== 'number' ||
        !Number.isSafeInteger(c.exp) ||
        typeof c.email !== 'string' ||
        !c.email.trim() ||
        typeof c.name !== 'string'
      ) {
        throw new InvalidRecruiterSession();
      }
      return { tenantId: c.tenant_id, recruiterId: c.sub!, sessionId: c.sid, method: 'password' };
    } catch {
      throw new InvalidRecruiterSession();
    }
  }
  function issue(key: SessionKey, row: StoredSession | null) {
    if (!row) throw new InvalidRecruiterSession();
    const exp = Math.floor(row.expires_at.getTime() / 1000);
    if (
      !Number.isSafeInteger(exp) ||
      exp <= Math.floor(Date.now() / 1000) ||
      row.id !== key.recruiterId ||
      row.tenant_id !== key.tenantId
    )
      throw new InvalidRecruiterSession();
    const token = jwt.sign(
      {
        tenant_id: row.tenant_id,
        email: row.email,
        name: row.name,
        role: 'recruiter',
        sid: key.sessionId,
        auth_method: 'password',
        exp,
      },
      secret,
      {
        algorithm: 'HS256',
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
        subject: row.id,
      },
    );
    return { token, expiresAt: new Date(exp * 1000), recruiter: row, sessionId: key.sessionId };
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
      return issue(key, await store.renew(key));
    },
    async revoke(token: string) {
      // Expired but authentic cookies may still revoke a renewed copy of the same session.
      const key = read(token, true);
      await store.revoke(key);
    },
  };
}
