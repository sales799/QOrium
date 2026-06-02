import net from 'node:net';
import { ping, type Pool } from '@qorium/db';
import type { Logger } from 'pino';

const DEFAULT_MAX_ATTEMPTS = 10;
const DEFAULT_TIMEOUT_MS = 30_000;
const REDIS_CONNECT_TIMEOUT_MS = 1_000;

interface WaitOptions {
  logger: Logger;
  pool: Pool;
  redisUrl?: string | undefined;
  serviceName: string;
  maxAttempts?: number;
  timeoutMs?: number;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function nextDelayMs(attempt: number): number {
  return Math.min(5_000, 250 * 2 ** Math.max(0, attempt - 1));
}

async function pingRedis(redisUrl: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false;
    const url = new URL(redisUrl);
    const socket = net.createConnection({
      host: url.hostname,
      port: Number(url.port || 6379),
    });

    const settle = (ok: boolean) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(ok);
    };

    socket.setTimeout(REDIS_CONNECT_TIMEOUT_MS);
    socket.once('connect', () => socket.write('*1\r\n$4\r\nPING\r\n'));
    socket.once('data', (chunk) => settle(chunk.toString('utf8').includes('PONG')));
    socket.once('timeout', () => settle(false));
    socket.once('error', () => settle(false));
  });
}

export async function waitForStartupDependencies(options: WaitOptions): Promise<void> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const deadline = Date.now() + timeoutMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const [postgresOk, redisOk] = await Promise.all([
      ping(options.pool),
      options.redisUrl ? pingRedis(options.redisUrl) : Promise.resolve(true),
    ]);

    if (postgresOk && redisOk) return;

    const finalAttempt = attempt >= maxAttempts || Date.now() >= deadline;
    options.logger.warn(
      {
        ev: 'boot.deps.wait',
        svc: options.serviceName,
        attempt,
        maxAttempts,
        postgres: postgresOk ? 'ok' : 'wait',
        redis: redisOk ? 'ok' : 'wait',
      },
      'startup dependencies not ready',
    );

    if (finalAttempt) {
      throw new Error(
        `Startup dependencies not ready after ${attempt} attempt(s): ` +
          `postgres=${postgresOk ? 'ok' : 'wait'} redis=${redisOk ? 'ok' : 'wait'}`,
      );
    }

    await delay(Math.min(nextDelayMs(attempt), Math.max(0, deadline - Date.now())));
  }
}
