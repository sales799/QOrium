/**
 * Worker tick: scan due rotations, send reminders, attempt rotations
 * for resource types whose rotators are wired live.
 *
 * Pure-logic seam: the runner is parameterised on the registry +
 * repository helpers so tests can drive it without a real DB.
 */

import type { Pool } from '@qorium/db';
import { evaluatePolicy } from './policy.js';
import type { RotatorRegistry } from './rotators.js';
import {
  emitLog,
  listDueOrSoon,
  markRotated,
  markStatus,
  type SecretRotationRow,
} from './repository.js';

export interface TickInputs {
  pool: Pool;
  registry: RotatorRegistry;
  /** How far ahead to scan (days). Default 14. */
  lookAheadDays?: number;
  /** When `false`, the runner emits reminders + marks overdue but does NOT
   *  call the rotators. v0 default until upstream providers are wired. */
  performRotation?: boolean;
  /** Override clock for tests. */
  now?: () => Date;
}

export interface TickReport {
  scanned: number;
  remindersSent: number;
  markedOverdue: number;
  rotated: number;
  failed: number;
  skipped: number;
  decisions: { resourceKey: string; action: string }[];
}

export async function runTick(inputs: TickInputs): Promise<TickReport> {
  const lookAhead = inputs.lookAheadDays ?? 14;
  const now = (inputs.now ?? (() => new Date()))();
  const cutoff = new Date(now.getTime() + lookAhead * 86_400_000);
  const due = await listDueOrSoon(inputs.pool, cutoff);
  const report: TickReport = {
    scanned: due.length,
    remindersSent: 0,
    markedOverdue: 0,
    rotated: 0,
    failed: 0,
    skipped: 0,
    decisions: [],
  };
  for (const row of due) {
    const decision = evaluatePolicy({
      status: row.status as never,
      nextRotationDue: new Date(row.nextRotationDue),
      now: () => now,
    });
    report.decisions.push({ resourceKey: row.resourceKey, action: decision.action });
    if (decision.action === 'no_op') {
      report.skipped += 1;
      continue;
    }
    if (decision.action === 'send_reminder') {
      await markStatus(inputs.pool, row.id, { status: 'reminder_sent' });
      await emitLog(inputs.pool, row.id, 'reminder_sent', { daysUntilDue: decision.daysUntilDue });
      report.remindersSent += 1;
      continue;
    }
    if (decision.action === 'mark_overdue') {
      await markStatus(inputs.pool, row.id, { status: 'overdue' });
      await emitLog(inputs.pool, row.id, 'reminder_sent', {
        overdue: true,
        daysOverdue: decision.daysOverdue,
      });
      report.markedOverdue += 1;
      if (!inputs.performRotation) continue;
      // Try the rotator
      try {
        const rotator = inputs.registry.has(row.resourceType)
          ? inputs.registry.get(row.resourceType)
          : null;
        if (!rotator) {
          report.skipped += 1;
          continue;
        }
        const outcome = await rotator({
          resourceKey: row.resourceKey,
          resourceType: row.resourceType,
          metadata: row.metadata,
          pool: inputs.pool,
        });
        if (outcome.ok) {
          await markRotated(inputs.pool, row.id, {
            newDueDate: outcome.newDueDate,
            rotatedBy: 'secret-rotation-worker',
          });
          await emitLog(inputs.pool, row.id, 'rotation_succeeded', { message: outcome.message });
          report.rotated += 1;
        } else {
          await markStatus(inputs.pool, row.id, {
            status: 'overdue',
            lastError: outcome.message,
          });
          await emitLog(inputs.pool, row.id, 'rotation_failed', { message: outcome.message });
          report.failed += 1;
        }
      } catch (err) {
        report.failed += 1;
        await markStatus(inputs.pool, row.id, {
          status: 'overdue',
          lastError: err instanceof Error ? err.message : String(err),
        });
        await emitLog(inputs.pool, row.id, 'rotation_failed', {
          message: err instanceof Error ? err.message : String(err),
        });
      }
    }
  }
  return report;
}

export type { SecretRotationRow };
