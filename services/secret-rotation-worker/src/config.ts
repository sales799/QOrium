export interface SecretRotationConfig {
  nodeEnv: 'development' | 'test' | 'staging' | 'production';
  databaseUrl: string | undefined;
  /** How far ahead to scan (days). */
  lookAheadDays: number;
  /** Whether to attempt rotation (otherwise just reminders + overdue). */
  performRotation: boolean;
  /** Tick interval (ms). Used by the daemon entry point only. */
  tickIntervalMs: number;
  webhooksAdminToken: string | undefined;
}

function parsePositiveInt(raw: string | undefined, fallback: number): number {
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return n;
}

function parseBool(raw: string | undefined, fallback: boolean): boolean {
  if (!raw) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(raw.toLowerCase());
}

export function loadConfig(): SecretRotationConfig {
  const nodeEnv = (process.env.NODE_ENV ?? 'development') as SecretRotationConfig['nodeEnv'];
  return {
    nodeEnv,
    databaseUrl: process.env.DATABASE_URL || undefined,
    lookAheadDays: parsePositiveInt(process.env.SECRET_ROTATION_LOOK_AHEAD_DAYS, 14),
    performRotation: parseBool(process.env.SECRET_ROTATION_PERFORM, false),
    tickIntervalMs: parsePositiveInt(process.env.SECRET_ROTATION_TICK_INTERVAL_MS, 6 * 3_600_000),
    webhooksAdminToken: process.env.WEBHOOKS_ADMIN_TOKEN || undefined,
  };
}
