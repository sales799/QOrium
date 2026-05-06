import { describe, expect, it } from 'vitest';
import pino from 'pino';
import type { Pool } from '@qorium/db';
import { createAuditEmitter } from '@qorium/audit-emitter';
import { runTick } from '../src/runner';
import type { LeakAlert } from '../src/policy';

const silent = pino({ level: 'silent' });
const NOW = Date.parse('2026-05-04T12:00:00Z');
const HOUR = 3_600_000;
const DUMMY_POOL = {} as Pool;

const baseAlert = (overrides: Partial<LeakAlert> = {}): LeakAlert => ({
  id: 'a1',
  questionId: 'q1',
  severity: 'critical',
  similarityScore: 0.92,
  status: 'detected',
  detectedAt: new Date(NOW - 30 * HOUR).toISOString(),
  sourceUrl: 'https://glassdoor.com/x',
  sourceType: 'glassdoor',
  ...overrides,
});

describe('runTick', () => {
  it('rotates alerts breaching SLA + audits each rotation', async () => {
    const audit = createAuditEmitter({ mode: 'stub' });
    const rotated: string[] = [];
    const result = await runTick({
      pool: DUMMY_POOL,
      audit,
      logger: silent,
      now: NOW,
      fetchAlerts: () => Promise.resolve([baseAlert()]),
      rotate: (_pool, alert) => {
        rotated.push(alert.id);
        return Promise.resolve({
          alertId: alert.id,
          questionId: alert.questionId,
          rotatedAt: new Date(NOW).toISOString(),
        });
      },
    });
    expect(result.scanned).toBe(1);
    expect(result.rotated).toHaveLength(1);
    expect(rotated).toEqual(['a1']);
    const recent = audit.recent?.() ?? [];
    expect(recent).toHaveLength(1);
    expect(recent[0]?.action).toBe('question.rotated');
    expect(recent[0]?.resourceId).toBe('q1');
  });

  it('skips alerts within SLA without rotating or auditing', async () => {
    const audit = createAuditEmitter({ mode: 'stub' });
    let rotateCalls = 0;
    const result = await runTick({
      pool: DUMMY_POOL,
      audit,
      logger: silent,
      now: NOW,
      fetchAlerts: () =>
        Promise.resolve([baseAlert({ detectedAt: new Date(NOW - 12 * HOUR).toISOString() })]),
      rotate: () => {
        rotateCalls++;
        return Promise.resolve({ alertId: 'x', questionId: 'x', rotatedAt: '' });
      },
    });
    expect(result.scanned).toBe(1);
    expect(result.rotated).toHaveLength(0);
    expect(result.withinSla).toBe(1);
    expect(rotateCalls).toBe(0);
    expect(audit.recent?.()).toHaveLength(0);
  });

  it('counts severity / confidence / already-handled rejections separately', async () => {
    const audit = createAuditEmitter({ mode: 'stub' });
    const alerts = [
      baseAlert({ id: 'a1', severity: 'low' }),
      baseAlert({ id: 'a2', similarityScore: 0.5 }),
      baseAlert({ id: 'a3', status: 'rotated' }),
    ];
    const result = await runTick({
      pool: DUMMY_POOL,
      audit,
      logger: silent,
      now: NOW,
      fetchAlerts: () => Promise.resolve(alerts),
      rotate: () => Promise.reject(new Error('should not be called')),
    });
    expect(result.scanned).toBe(3);
    expect(result.rotated).toHaveLength(0);
    expect(result.ignoredBelowSeverity).toBe(1);
    expect(result.ignoredBelowConfidence).toBe(1);
    expect(result.alreadyHandled).toBe(1);
  });

  it('continues processing remaining alerts when one rotation fails', async () => {
    const audit = createAuditEmitter({ mode: 'stub' });
    const alerts = [
      baseAlert({ id: 'a1', questionId: 'q1' }),
      baseAlert({ id: 'a2', questionId: 'q2' }),
    ];
    const result = await runTick({
      pool: DUMMY_POOL,
      audit,
      logger: silent,
      now: NOW,
      fetchAlerts: () => Promise.resolve(alerts),
      rotate: (_pool, alert) =>
        alert.id === 'a1'
          ? Promise.reject(new Error('db down'))
          : Promise.resolve({
              alertId: alert.id,
              questionId: alert.questionId,
              rotatedAt: new Date(NOW).toISOString(),
            }),
    });
    expect(result.scanned).toBe(2);
    expect(result.rotated).toHaveLength(1);
    expect(result.rotated[0]?.alertId).toBe('a2');
    const recent = audit.recent?.() ?? [];
    expect(recent).toHaveLength(1);
    expect(recent[0]?.resourceId).toBe('q2');
  });

  it('respects custom confidence floor', async () => {
    const audit = createAuditEmitter({ mode: 'stub' });
    const result = await runTick({
      pool: DUMMY_POOL,
      audit,
      logger: silent,
      now: NOW,
      confidenceFloor: 0.95, // strict
      fetchAlerts: () => Promise.resolve([baseAlert({ similarityScore: 0.9 })]),
      rotate: () => Promise.reject(new Error('should not be called')),
    });
    expect(result.rotated).toHaveLength(0);
    expect(result.ignoredBelowConfidence).toBe(1);
  });

  it('audit payload contains severity + similarity + source for forensics', async () => {
    const audit = createAuditEmitter({ mode: 'stub' });
    await runTick({
      pool: DUMMY_POOL,
      audit,
      logger: silent,
      now: NOW,
      fetchAlerts: () =>
        Promise.resolve([
          baseAlert({
            severity: 'high',
            detectedAt: new Date(NOW - 8 * 24 * HOUR).toISOString(),
            similarityScore: 0.97,
            sourceUrl: 'https://reddit.com/r/cscareerquestions/comments/abc',
            sourceType: 'reddit',
          }),
        ]),
      rotate: (_pool, alert) =>
        Promise.resolve({
          alertId: alert.id,
          questionId: alert.questionId,
          rotatedAt: new Date(NOW).toISOString(),
        }),
    });
    const event = (audit.recent?.() ?? [])[0]!;
    expect(event.action).toBe('question.rotated');
    expect(event.payload).toMatchObject({
      severity: 'high',
      similarity: 0.97,
      source_type: 'reddit',
    });
  });
});
