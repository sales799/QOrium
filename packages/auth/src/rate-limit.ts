import { RateLimiterMemory, RateLimiterRedis } from 'rate-limiter-flexible';
import type { RateLimiterAbstract, RateLimiterRes } from 'rate-limiter-flexible';
import type { Redis } from 'ioredis';

/**
 * Per CTO Architecture §6.2: 10 req/sec sustained, 20 req/sec burst per API key.
 * D3 §4.1 raises this for the Talpro internal key (60/sec burst, 1000/min sustained)
 * — those are configured per-key, not via this default.
 *
 * Implementation: rate-limiter-flexible with a sliding window. `points` is the
 * burst capacity; `duration` is the window in seconds.
 */

export interface RateLimitConfig {
  /** Burst capacity (max requests in the window). Default 20 (architecture §6.2). */
  points?: number;
  /** Window duration in seconds. Default 1 (per-second sustained 10 + burst 20). */
  duration?: number;
  /** Block duration on exhaustion (seconds). Default = duration. */
  blockDuration?: number;
  /** Key prefix in Redis. Default `qorium:rl`. */
  keyPrefix?: string;
}

const DEFAULTS = {
  points: 20,
  duration: 1,
  keyPrefix: 'qorium:rl',
} as const;

export function createRedisRateLimiter(
  redis: Redis,
  config: RateLimitConfig = {},
): RateLimiterAbstract {
  return new RateLimiterRedis({
    storeClient: redis,
    points: config.points ?? DEFAULTS.points,
    duration: config.duration ?? DEFAULTS.duration,
    blockDuration: config.blockDuration ?? config.duration ?? DEFAULTS.duration,
    keyPrefix: config.keyPrefix ?? DEFAULTS.keyPrefix,
  });
}

/** In-memory variant for tests / dev when Redis is unavailable. */
export function createMemoryRateLimiter(config: RateLimitConfig = {}): RateLimiterAbstract {
  return new RateLimiterMemory({
    points: config.points ?? DEFAULTS.points,
    duration: config.duration ?? DEFAULTS.duration,
    blockDuration: config.blockDuration ?? config.duration ?? DEFAULTS.duration,
    keyPrefix: config.keyPrefix ?? DEFAULTS.keyPrefix,
  });
}

export type { RateLimiterAbstract, RateLimiterRes };
