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
  /** API key HMAC pepper. Required to enable auth middleware. */
  apiKeyPepper: string | undefined;
  /** Redis connection URL. Required to enable rate limiting. */
  redisUrl: string | undefined;
  /** HS256 secret for recruiter session JWTs (Surface 6). Required when pool is configured. */
  jwtSecret: string | undefined;
  /** Set Secure flag on the session cookie. Defaults to true outside dev/test. */
  cookieSecure: boolean;
  /** Minutes a recruiter is locked out after 5 consecutive failed logins. */
  recruiterLockoutMinutes: number;
  /** Mailer driver selection. 'mock' is the default for dev/test. */
  mailerDriver: 'ses' | 'sendgrid' | 'mock';
  /** From address used by the recruiter invitation email. */
  mailerFromAddress: string;
  /** Optional Reply-To header. */
  mailerReplyToAddress: string | undefined;
  /** Base URL of the recruiter portal (used to build invitation accept links). */
  recruiterPortalUrl: string;
  /** SES region (mailerDriver=ses). */
  sesRegion: string | undefined;
  sesAccessKeyId: string | undefined;
  sesSecretAccessKey: string | undefined;
  /** SendGrid API key (mailerDriver=sendgrid). */
  sendgridApiKey: string | undefined;
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

function parseLockoutMinutes(raw: string | undefined): number {
  if (raw === undefined || raw.length === 0) return 15;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0 || n > 1440) {
    throw new Error(`Invalid RECRUITER_LOCKOUT_MINUTES: ${raw}`);
  }
  return n;
}

function parseMailerDriver(raw: string | undefined): Config['mailerDriver'] {
  if (raw === undefined || raw.length === 0) return 'mock';
  if (raw === 'ses' || raw === 'sendgrid' || raw === 'mock') return raw;
  throw new Error(`Invalid MAILER_DRIVER: ${raw} (expected ses | sendgrid | mock)`);
}

export function loadConfig(): Config {
  const nodeEnv = parseNodeEnv(getEnv('NODE_ENV', 'development'));
  return {
    serviceName: SERVICE_NAME,
    nodeEnv,
    port: parsePort(getEnv('READYBANK_PORT', getEnv('PORT', '5101'))),
    logLevel: getEnv('LOG_LEVEL', 'info'),
    version: getEnv('npm_package_version', '0.0.0'),
    gitSha: getEnv('GIT_SHA', 'unknown'),
    sentryDsn: process.env.SENTRY_DSN,
    apiKeyPepper: process.env.API_KEY_PEPPER,
    redisUrl: process.env.REDIS_URL,
    jwtSecret: process.env.JWT_SECRET,
    cookieSecure: nodeEnv !== 'development' && nodeEnv !== 'test',
    recruiterLockoutMinutes: parseLockoutMinutes(process.env.RECRUITER_LOCKOUT_MINUTES),
    mailerDriver: parseMailerDriver(process.env.MAILER_DRIVER),
    mailerFromAddress: getEnv('MAILER_FROM_ADDRESS', 'no-reply@qorium.io'),
    mailerReplyToAddress: process.env.MAILER_REPLY_TO_ADDRESS,
    recruiterPortalUrl: getEnv('RECRUITER_PORTAL_URL', 'http://localhost:5101'),
    sesRegion: process.env.SES_REGION,
    sesAccessKeyId: process.env.SES_ACCESS_KEY_ID,
    sesSecretAccessKey: process.env.SES_SECRET_ACCESS_KEY,
    sendgridApiKey: process.env.SENDGRID_API_KEY,
  };
}
