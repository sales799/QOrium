/**
 * Server-only env access. Validation is lazy — `next build` collects page
 * data with NODE_ENV=production but no real secrets, so we cannot fail loud
 * at module load. Instead `loadAdminEnv` returns whatever's present, and
 * NextAuth's own runtime checks reject an empty `AUTH_SECRET` when actually
 * issuing or verifying a JWT.
 *
 * `assertProdEnv` is exposed for callers (e.g., a startup smoke test or
 * healthcheck) that want to verify configuration before accepting traffic.
 */

function readOptional(key: string): string | undefined {
  const v = process.env[key];
  return v && v.length > 0 ? v : undefined;
}

export type NodeEnv = 'development' | 'test' | 'production';

export interface AdminEnv {
  authSecret: string;
  emailAllowlistRaw: string | undefined;
  nodeEnv: NodeEnv;
}

const DEV_AUTH_SECRET_FALLBACK = 'qorium_dev_auth_secret_replace_in_prod';

export function loadAdminEnv(): AdminEnv {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as NodeEnv;
  const authSecret = readOptional('AUTH_SECRET') ?? DEV_AUTH_SECRET_FALLBACK;
  return {
    authSecret,
    emailAllowlistRaw: readOptional('ADMIN_EMAIL_ALLOWLIST'),
    nodeEnv,
  };
}

/** Throws when running in production without a real AUTH_SECRET. Call from a
 * startup hook before binding the listener; never call at module import time. */
export function assertProdEnv(env: AdminEnv): void {
  if (env.nodeEnv === 'production' && env.authSecret === DEV_AUTH_SECRET_FALLBACK) {
    throw new Error(
      'AUTH_SECRET is required in production. Generate one with `openssl rand -hex 32`.',
    );
  }
}
