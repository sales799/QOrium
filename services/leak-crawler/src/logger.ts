import pino, { type Logger } from 'pino';

export interface BuildLoggerOptions {
  level?: string;
  serviceName?: string;
  gitSha?: string | undefined;
}

export function buildLogger(opts: BuildLoggerOptions = {}): Logger {
  return pino({
    level: opts.level ?? process.env.LOG_LEVEL ?? 'info',
    base: {
      service: opts.serviceName ?? 'qorium-leak-crawler',
      git_sha: opts.gitSha ?? process.env.GIT_SHA,
    },
    redact: {
      paths: ['SERPER_API_KEY', 'ANTHROPIC_API_KEY', 'DATABASE_URL', 'REDIS_URL'],
      remove: true,
    },
  });
}
