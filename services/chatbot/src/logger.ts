import pino from 'pino';
import type { Config } from './config.js';

export function createLogger(config: Config): pino.Logger {
  return pino({
    name: config.serviceName,
    level: config.logLevel,
    base: {
      service: config.serviceName,
      version: config.version,
      git_sha: config.gitSha,
    },
  });
}
