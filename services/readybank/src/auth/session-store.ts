import { isUuid, withTenant, type Pool, type PoolClient } from '@qorium/db';

export type SessionMethod = 'password' | 'saml' | 'oidc' | 'admin';
export interface SessionKey {
  tenantId: string;
  recruiterId: string;
  sessionId: string;
  method: SessionMethod;
}
export interface SessionRecruiter {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
}
export interface StoredSession extends SessionRecruiter {
  expires_at: Date;
}
export class SessionStoreUnavailable extends Error {
  constructor() {
    super('Session storage unavailable');
  }
}

/** Persistence primitive only. Routes must explicitly adopt it before revocation is enforced. */
export function createSessionStore(
  pool: Pool,
  hashIdentifier: (tenantId: string, sessionId: string) => Buffer,
) {
  function hash(key: SessionKey): Buffer {
    if (
      ![key.tenantId, key.recruiterId, key.sessionId].every(isUuid) ||
      !['password', 'saml', 'oidc', 'admin'].includes(key.method)
    ) {
      throw new Error('Invalid session identity');
    }
    let value: Buffer;
    try {
      value = hashIdentifier(key.tenantId, key.sessionId);
    } catch {
      throw new SessionStoreUnavailable();
    }
    if (!Buffer.isBuffer(value) || value.length !== 32) throw new Error('Invalid session digest');
    return value;
  }
  async function transaction<T>(
    key: SessionKey,
    fn: (c: PoolClient, digest: Buffer) => Promise<T>,
  ): Promise<T> {
    const digest = hash(key);
    try {
      return await withTenant(pool, key.tenantId, async (c) => {
        await c.query("SET LOCAL statement_timeout = '3000ms'");
        await c.query("SET LOCAL lock_timeout = '1000ms'");
        return fn(c, digest);
      });
    } catch {
      throw new SessionStoreUnavailable();
    }
  }
  async function active(c: PoolClient, key: SessionKey): Promise<SessionRecruiter | null> {
    const { rows } = await c.query<SessionRecruiter>(
      `SELECT id, tenant_id, email, name FROM app.recruiters
       WHERE id=$1 AND tenant_id=$2 AND status='active' FOR SHARE`,
      [key.recruiterId, key.tenantId],
    );
    return rows[0] ?? null;
  }
  return {
    async create(key: SessionKey): Promise<StoredSession | null> {
      return transaction(key, async (c, digest) => {
        const recruiter = await active(c, key);
        if (!recruiter) return null;
        // No upsert: an existing or revoked identifier must never be resurrected.
        const result = await c.query<{ expires_at: Date }>(
          `INSERT INTO app.recruiter_sessions(tenant_id,recruiter_id,session_id_hash,auth_method,expires_at)
           VALUES($1,$2,$3,$4,clock_timestamp()+interval '8 hours') RETURNING expires_at`,
          [key.tenantId, key.recruiterId, digest, key.method],
        );
        const stored = result.rows[0];
        if (!stored) throw new SessionStoreUnavailable();
        return { ...recruiter, expires_at: stored.expires_at };
      });
    },
    async renew(key: SessionKey): Promise<StoredSession | null> {
      return transaction(key, async (c, digest) => {
        const recruiter = await active(c, key);
        if (!recruiter) return null;
        const result = await c.query<{ expires_at: Date }>(
          `UPDATE app.recruiter_sessions SET last_seen_at=clock_timestamp(),
             expires_at=clock_timestamp()+interval '8 hours'
           WHERE tenant_id=$1 AND recruiter_id=$2 AND session_id_hash=$3 AND auth_method=$4
             AND revoked_at IS NULL AND expires_at>clock_timestamp() RETURNING expires_at`,
          [key.tenantId, key.recruiterId, digest, key.method],
        );
        const stored = result.rows[0];
        return stored ? { ...recruiter, expires_at: stored.expires_at } : null;
      });
    },
    async revoke(key: SessionKey): Promise<void> {
      await transaction(key, async (c, digest) => {
        // Also revoke disabled/expired accounts. Repeated logout is idempotent.
        await c.query(
          `UPDATE app.recruiter_sessions SET revoked_at=clock_timestamp()
           WHERE tenant_id=$1 AND recruiter_id=$2 AND session_id_hash=$3 AND auth_method=$4
             AND revoked_at IS NULL`,
          [key.tenantId, key.recruiterId, digest, key.method],
        );
      });
    },
  };
}
