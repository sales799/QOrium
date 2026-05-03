/**
 * Single shared pg pool for the admin Next.js process.
 *
 * Next.js dev mode hot-reloads server modules; without the `globalThis`
 * cache we'd leak a new pool on every change. The cache is keyed by a
 * Symbol so unrelated globals can't accidentally collide.
 */
import { createPool, resolveDatabaseUrl, type Pool } from '@qorium/db';

const POOL_KEY = Symbol.for('qorium.admin.pgPool');

interface GlobalWithPool {
  [POOL_KEY]?: Pool;
}

const globalWithPool = globalThis as GlobalWithPool;

export function getAdminPool(): Pool {
  if (!globalWithPool[POOL_KEY]) {
    const connectionString = resolveDatabaseUrl();
    globalWithPool[POOL_KEY] = createPool({ connectionString, max: 5 });
  }
  return globalWithPool[POOL_KEY];
}

/** Test helper. Closes and drops the cached pool so suites can re-init. */
export async function resetAdminPool(): Promise<void> {
  const existing = globalWithPool[POOL_KEY];
  if (existing) {
    await existing.end();
    delete globalWithPool[POOL_KEY];
  }
}
