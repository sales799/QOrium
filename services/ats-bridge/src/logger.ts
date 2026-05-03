import pino, { type Logger } from 'pino';

export function buildLogger(opts: { level?: string; gitSha?: string | undefined } = {}): Logger {
  return pino({
    level: opts.level ?? process.env.LOG_LEVEL ?? 'info',
    base: {
      service: 'qorium-ats-bridge',
      git_sha: opts.gitSha ?? process.env.GIT_SHA,
    },
    redact: {
      paths: [
        'DATABASE_URL',
        'REDIS_URL',
        '*.access_token_cipher',
        '*.refresh_token_cipher',
        '*.api_key_cipher',
        '*.webhook_secret_cipher',
        '*.accessToken',
        '*.refreshToken',
        '*.apiKey',
        '*.webhookSecret',
      ],
      remove: true,
    },
  });
}
