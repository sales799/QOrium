import { pino } from 'pino';
import type { Logger } from 'pino';
import { pinoHttp } from 'pino-http';
import { randomUUID } from 'node:crypto';
import type { Config } from './config.js';

/**
 * Per CTO Architecture §11.1 every log entry must include:
 *   timestamp, service, request_id, customer_id, actor, action, latency_ms, outcome.
 *
 * `service` is added globally via `base`. `request_id` is added per-request by
 * pino-http. `customer_id`, `actor`, `action`, `latency_ms`, `outcome` are
 * added by middleware / route handlers as they enter scope.
 */
export function createLogger(config: Config): Logger {
  return pino({
    level: config.logLevel,
    base: {
      service: config.serviceName,
      version: config.version,
      git_sha: config.gitSha,
      env: config.nodeEnv,
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers["x-talpro-api-key"]',
        'req.headers.cookie',
        '*.password',
        '*.password_hash',
        '*.api_key',
        '*.hashed_key',
      ],
      remove: true,
    },
  });
}

/** Strip query data and bearer path segments from the log copy only. */
function logRequestPath(url: string | undefined): string {
  if (!url) return '[unavailable]';
  let path: string;
  try {
    path = decodeURIComponent(url.split(/[?#]/, 1)[0]!);
  } catch {
    return '[unparseable]';
  }
  const bearerRoute = /^\/v1\/(invitations|proof)\//i.exec(path);
  if (bearerRoute) {
    const resource = bearerRoute[1]!.toLowerCase();
    // Unknown trailing segments may also contain credentials: omit them.
    const suffix =
      resource === 'invitations'
        ? /\/(start|proctoring)\/?$/i.exec(path)?.[1]
        : /\/(view|badge\.svg)\/?$/i.exec(path)?.[1];
    return `/v1/${resource}/[REDACTED]${suffix ? `/${suffix.toLowerCase()}` : ''}`;
  }
  return path;
}

export function createHttpLogger(logger: Logger) {
  return pinoHttp({
    logger,
    // Allowlist the HTTP envelope. Headers can carry tokens in Referer,
    // Location and Set-Cookie as well as Authorization; do not log them.
    // pino-http supplies wrapped standard serializers; never mutate req.raw.
    serializers: {
      req: (req) => ({ id: req.id, method: req.method, url: logRequestPath(req.url) }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
    genReqId: (req, res) => {
      const incoming = req.headers['x-request-id'];
      if (typeof incoming === 'string' && incoming.length > 0 && incoming.length <= 128) {
        res.setHeader('x-request-id', incoming);
        return incoming;
      }
      const generated = randomUUID();
      res.setHeader('x-request-id', generated);
      return generated;
    },
    customLogLevel: (_req, res, err) => {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (_req, res) => `${res.statusCode} ${res.statusMessage ?? 'OK'}`,
    customErrorMessage: (_req, res, err) =>
      `${res.statusCode} ${res.statusMessage ?? 'ERROR'}: ${err.message}`,
  });
}
