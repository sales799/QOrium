import pino, { type Logger } from 'pino';

export function buildLogger(opts: { level?: string; gitSha?: string | undefined } = {}): Logger {
  return pino({
    level: opts.level ?? process.env.LOG_LEVEL ?? 'info',
    base: {
      service: 'qorium-jd-forge',
      git_sha: opts.gitSha ?? process.env.GIT_SHA,
    },
    redact: {
      paths: ['ANTHROPIC_API_KEY', 'DATABASE_URL', 'REDIS_URL', 'API_KEY_PEPPER'],
      remove: true,
    },
  });
}
