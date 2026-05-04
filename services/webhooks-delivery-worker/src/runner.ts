/**
 * Worker tick: pull pending deliveries, post each, persist next state.
 *
 * Pure-logic seam: the runner is parameterised on the poster + clock
 * + repository helpers so tests can drive it without a real DB.
 */

import type { Pool } from '@qorium/db';
import { deliverOne } from './orchestrator.js';
import type { HttpPoster } from './poster.js';
import { listPendingDeliveries, markAbandoned, markDelivered, markRetry } from './repository.js';

export interface TickInputs {
  pool: Pool;
  poster: HttpPoster;
  /** Max deliveries per tick. Default 50. */
  batchSize?: number;
  /** Override clock for tests. */
  now?: () => number;
}

export interface TickReport {
  attempted: number;
  delivered: number;
  retried: number;
  abandoned: number;
  errors: number;
}

export async function runTick(inputs: TickInputs): Promise<TickReport> {
  const batchSize = inputs.batchSize ?? 50;
  const now = inputs.now ?? (() => Date.now());
  const pending = await listPendingDeliveries(inputs.pool, { limit: batchSize });
  const report: TickReport = {
    attempted: pending.length,
    delivered: 0,
    retried: 0,
    abandoned: 0,
    errors: 0,
  };
  for (const delivery of pending) {
    try {
      const result = await deliverOne({ delivery, poster: inputs.poster, now });
      if (result.nextState.kind === 'delivered') {
        await markDelivered(inputs.pool, delivery.id, result.nextState.httpStatus);
        report.delivered += 1;
      } else if (result.nextState.kind === 'retry') {
        await markRetry(inputs.pool, delivery.id, {
          httpStatus: result.nextState.httpStatus,
          retryAt: new Date(result.nextState.retryAt),
          reason: result.nextState.reason,
        });
        report.retried += 1;
      } else {
        await markAbandoned(inputs.pool, delivery.id, {
          httpStatus: result.nextState.httpStatus,
          reason: result.nextState.reason,
        });
        report.abandoned += 1;
      }
    } catch {
      report.errors += 1;
    }
  }
  return report;
}
