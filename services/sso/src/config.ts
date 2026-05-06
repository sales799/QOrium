export interface SsoConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  port: number;
  databaseUrl: string | undefined;
  /** Issuer + audience used in JWTs we hand back to the browser. */
  jwtIssuer: string;
  jwtAudience: string;
  /** Server-side HS256 secret. Real impl can swap to RS256 + KMS-managed key. */
  jwtSigningSecret: string;
  /** Default JWT lifetime (seconds). Spec §7.2 → 1 hour. */
  jwtTtlSeconds: number;
  /** Public-facing entity id, e.g. https://api.qorium.online */
  spEntityId: string;
  /** ACS endpoint URL. */
  acsUrl: string;
  /** SLO endpoint URL. */
  sloUrl: string;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

export function loadConfig(): SsoConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as SsoConfig['nodeEnv'];
  const baseUrl = process.env.SSO_BASE_URL ?? 'https://api.qorium.online';
  return {
    nodeEnv,
    port: parsePositiveInt(process.env.SSO_PORT ?? process.env.PORT, 5107),
    databaseUrl: process.env.DATABASE_URL || undefined,
    jwtIssuer: process.env.SSO_JWT_ISSUER ?? baseUrl,
    jwtAudience: process.env.SSO_JWT_AUDIENCE ?? 'https://app.qorium.online',
    jwtSigningSecret: process.env.SSO_JWT_SIGNING_SECRET ?? 'dev-only-do-not-ship-this',
    jwtTtlSeconds: parsePositiveInt(process.env.SSO_JWT_TTL_SECONDS, 3600),
    spEntityId: process.env.SSO_SP_ENTITY_ID ?? baseUrl,
    acsUrl: process.env.SSO_ACS_URL ?? `${baseUrl}/v1/auth/saml/acs`,
    sloUrl: process.env.SSO_SLO_URL ?? `${baseUrl}/v1/auth/saml/slo`,
  };
}
