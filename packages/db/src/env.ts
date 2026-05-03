/**
 * Resolve the database connection URL from the environment.
 * Prefers DATABASE_URL; otherwise composes from POSTGRES_* vars.
 *
 * Throws at module load if no usable configuration is present so that
 * services fail fast at boot rather than at first query.
 */
export function resolveDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  if (env.DATABASE_URL && env.DATABASE_URL.length > 0) {
    return env.DATABASE_URL;
  }

  const host = env.POSTGRES_HOST;
  const port = env.POSTGRES_PORT;
  const user = env.POSTGRES_USER;
  const password = env.POSTGRES_PASSWORD;
  const database = env.POSTGRES_DB;

  if (!host || !port || !user || !password || !database) {
    throw new Error(
      'Database configuration missing. Set DATABASE_URL or all of ' +
        'POSTGRES_HOST, POSTGRES_PORT, POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB.',
    );
  }

  const encodedPassword = encodeURIComponent(password);
  return `postgresql://${user}:${encodedPassword}@${host}:${port}/${database}`;
}
