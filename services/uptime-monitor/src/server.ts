/**
 * Express service for the uptime monitor.
 *
 * Endpoints:
 *   GET /healthz                    — liveness for the monitor itself
 *   GET /v1/uptime/status           — most recent check matrix snapshot
 *   GET /v1/uptime/slo?window=1h    — availability over a rolling window
 */

import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import { computeSlo, ONE_DAY_MS, ONE_HOUR_MS, type MonitorState } from './state.js';

export interface CreateServerOptions {
  logger: Logger;
  /** Snapshot accessor — the daemon updates this; the server reads it. */
  getState: () => MonitorState;
}

export function createServer(opts: CreateServerOptions): express.Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(pinoHttp({ logger: opts.logger }));

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok', service: 'qorium-uptime-monitor' });
  });

  app.get('/v1/uptime/status', (_req, res) => {
    const state = opts.getState();
    if (!state.snapshot) {
      res.status(503).json({ status: 'no_data', message: 'monitor has not yet run a tick' });
      return;
    }
    res.json(state.snapshot);
  });

  app.get('/v1/uptime/slo', (req, res) => {
    const window = String(req.query.window ?? '1h');
    const windowMs =
      window === '24h' ? ONE_DAY_MS : window === '15m' ? ONE_HOUR_MS / 4 : ONE_HOUR_MS;
    const slo = computeSlo(opts.getState(), windowMs);
    res.json({ window, ...slo });
  });

  app.use((_req, res) => {
    res.status(404).contentType('application/problem+json').json({
      type: 'about:blank',
      title: 'Not Found',
      status: 404,
    });
  });

  return app;
}
