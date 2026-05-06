import type { Pool } from '@qorium/db';
import type { AuditEmitter } from '@qorium/audit-emitter';
import type { Logger } from 'pino';
import { decideRotation, selectAlertsForRotation, type LeakAlert } from './policy.js';
import {
  fetchPendingAlerts as defaultFetch,
  rotateQuestion as defaultRotate,
  type RotationOutcome,
} from './repository.js';

export interface RunTickInputs {
  pool: Pool;
  audit: AuditEmitter;
  logger: Logger;
  now?: number;
  confidenceFloor?: number;
  /** Test seam — override the alert fetcher. */
  fetchAlerts?: (pool: Pool, limit: number) => Promise<ReadonlyArray<LeakAlert>>;
  /** Test seam — override the rotator. */
  rotate?: (pool: Pool, alert: LeakAlert) => Promise<RotationOutcome>;
  /** Hard cap on how many alerts to scan per tick (default 200). */
  scanLimit?: number;
}

export interface RunTickResult {
  scanned: number;
  rotated: ReadonlyArray<RotationOutcome>;
  withinSla: number;
  ignoredBelowConfidence: number;
  ignoredBelowSeverity: number;
  alreadyHandled: number;
}

/**
 * Run one full anti-leak rotation pass. Pulls pending alerts, applies
 * the SO-9 policy, and rotates the breaching ones. Returns counts so
 * the runner loop can log a single summary line per tick.
 */
export async function runTick(inputs: RunTickInputs): Promise<RunTickResult> {
  const {
    pool,
    audit,
    logger,
    now = Date.now(),
    confidenceFloor,
    fetchAlerts = defaultFetch,
    rotate = defaultRotate,
    scanLimit = 200,
  } = inputs;

  const alerts = await fetchAlerts(pool, scanLimit);
  const counts = {
    withinSla: 0,
    ignoredBelowConfidence: 0,
    ignoredBelowSeverity: 0,
    alreadyHandled: 0,
  };
  const toRotate: LeakAlert[] = [];

  for (const alert of alerts) {
    const decision = decideRotation({
      alert,
      now,
      ...(confidenceFloor !== undefined ? { confidenceFloor } : {}),
    });
    if (decision.rotate) {
      toRotate.push(alert);
      continue;
    }
    switch (decision.reason) {
      case 'within_sla':
        counts.withinSla++;
        break;
      case 'similarity_below_confidence_floor':
        counts.ignoredBelowConfidence++;
        break;
      case 'severity_below_threshold':
        counts.ignoredBelowSeverity++;
        break;
      case 'already_handled':
        counts.alreadyHandled++;
        break;
    }
  }

  const rotated: RotationOutcome[] = [];
  for (const alert of toRotate) {
    try {
      const outcome = await rotate(pool, alert);
      rotated.push(outcome);
      await audit.emit({
        tenantId: null,
        actorId: null,
        actorType: 'system',
        action: 'question.rotated',
        resourceType: 'question',
        resourceId: alert.questionId,
        payload: {
          leak_alert_id: alert.id,
          severity: alert.severity,
          similarity: alert.similarityScore,
          source_url: alert.sourceUrl,
          source_type: alert.sourceType,
        },
      });
    } catch (err) {
      logger.error(
        { err, alertId: alert.id, questionId: alert.questionId },
        'leak-rotation-worker: rotation failed',
      );
    }
  }

  logger.info(
    {
      scanned: alerts.length,
      rotated: rotated.length,
      withinSla: counts.withinSla,
      ignoredBelowConfidence: counts.ignoredBelowConfidence,
      ignoredBelowSeverity: counts.ignoredBelowSeverity,
      alreadyHandled: counts.alreadyHandled,
    },
    'leak-rotation-worker tick complete',
  );

  return {
    scanned: alerts.length,
    rotated,
    ...counts,
  };
}

// Re-exported so consumers (admin dashboard etc.) can preview which
// alerts the next tick would rotate without actually rotating.
export { selectAlertsForRotation };
