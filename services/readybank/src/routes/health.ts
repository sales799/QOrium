import { Router } from 'express';
import type { Pool } from '@qorium/db';
import { ping } from '@qorium/db';
import type { Config } from '../config.js';

export interface HealthDeps {
  config: Config;
  pool: Pool | undefined;
}

interface HealthResponse {
  status: 'ok' | 'degraded';
  service: string;
  version: string;
  git_sha: string;
  env: string;
  uptime_seconds: number;
  checks: {
    db: 'ok' | 'unreachable' | 'not-configured';
  };
}

const startTime = Date.now();

export function healthRouter(deps: HealthDeps): Router {
  const router = Router();

  const livenessBody = (): HealthResponse => ({
    status: 'ok',
    service: deps.config.serviceName,
    version: deps.config.version,
    git_sha: deps.config.gitSha,
    env: deps.config.nodeEnv,
    uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
    checks: { db: deps.pool ? 'ok' : 'not-configured' },
  });

  // Liveness: process is up. Cheap. Used by PM2 / load balancer.
  router.get(['/health', '/healthz', '/v1/health', '/v1/healthz'], (_req, res) => {
    res.status(200).json(livenessBody());
  });

  // Readiness: dependencies are reachable. Used for traffic-shifting.
  router.get('/readyz', async (_req, res) => {
    const dbStatus: HealthResponse['checks']['db'] = deps.pool
      ? (await ping(deps.pool))
        ? 'ok'
        : 'unreachable'
      : 'not-configured';

    const body: HealthResponse = {
      status: dbStatus === 'unreachable' ? 'degraded' : 'ok',
      service: deps.config.serviceName,
      version: deps.config.version,
      git_sha: deps.config.gitSha,
      env: deps.config.nodeEnv,
      uptime_seconds: Math.floor((Date.now() - startTime) / 1000),
      checks: { db: dbStatus },
    };
    res.status(dbStatus === 'unreachable' ? 503 : 200).json(body);
  });

  return router;
}
