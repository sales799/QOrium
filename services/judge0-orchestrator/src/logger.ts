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
      service: opts.serviceName ?? 'qorium-judge0-orchestrator',
      git_sha: opts.gitSha ?? process.env.GIT_SHA,
    },
    redact: {
      paths: ['DATABASE_URL', 'REDIS_URL', 'JUDGE0_AUTH_TOKEN', 'ANTHROPIC_API_KEY'],
      remove: true,
    },
  });
}
