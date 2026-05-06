import pino, { type Logger } from 'pino';

export function buildLogger(opts: { level?: string; gitSha?: string | undefined } = {}): Logger {
  return pino({
    level: opts.level ?? process.env.LOG_LEVEL ?? 'info',
    base: {
      service: 'qorium-audit-log',
      git_sha: opts.gitSha ?? process.env.GIT_SHA,
    },
    redact: {
      paths: ['DATABASE_URL', '*.payload', '*.changes'],
      remove: false,
      censor: '[REDACTED]',
    },
  });
}
