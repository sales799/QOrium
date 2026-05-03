/**
 * Service configuration resolved at boot.
 * Throws on missing required vars so the process fails fast rather than at first request.
 */

const SERVICE_NAME = 'qorium-readybank';

export interface Config {
  serviceName: string;
  nodeEnv: 'development' | 'staging' | 'production' | 'test';
  port: number;
  logLevel: string;
  version: string;
  gitSha: string;
  sentryDsn: string | undefined;
}

function getEnv(name: string, fallback?: string): string {
  const value = process.env[name];
  if (value !== undefined && value.length > 0) return value;
  if (fallback !== undefined) return fallback;
  throw new Error(`Required environment variable ${name} is missing.`);
}

function parsePort(raw: string): number {
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 65535) {
    throw new Error(`Invalid port: ${raw}`);
  }
  return n;
}

function parseNodeEnv(raw: string): Config['nodeEnv'] {
  switch (raw) {
    case 'development':
    case 'staging':
    case 'production':
    case 'test':
      return raw;
    default:
      return 'development';
  }
}

export function loadConfig(): Config {
  return {
    serviceName: SERVICE_NAME,
    nodeEnv: parseNodeEnv(getEnv('NODE_ENV', 'development')),
    port: parsePort(getEnv('READYBANK_PORT', getEnv('PORT', '5101'))),
    logLevel: getEnv('LOG_LEVEL', 'info'),
    version: getEnv('npm_package_version', '0.0.0'),
    gitSha: getEnv('GIT_SHA', 'unknown'),
    sentryDsn: process.env.SENTRY_DSN,
  };
}
