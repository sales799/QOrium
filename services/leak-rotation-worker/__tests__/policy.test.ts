import { describe, expect, it } from 'vitest';
import {
  decideRotation,
  hoursUntilSlaBreach,
  selectAlertsForRotation,
  SLA_HOURS,
  type LeakAlert,
} from '../src/policy';

const NOW = Date.parse('2026-05-04T12:00:00Z');
const HOUR = 3_600_000;

const baseAlert = (overrides: Partial<LeakAlert> = {}): LeakAlert => ({
  id: 'alert-1',
  questionId: 'q-1',
  severity: 'critical',
  similarityScore: 0.92,
  status: 'detected',
  detectedAt: new Date(NOW - 25 * HOUR).toISOString(),
  sourceUrl: 'https://glassdoor.com/foo',
  sourceType: 'glassdoor',
  ...overrides,
});

describe('SLA_HOURS table', () => {
  it('matches Constitution v2.0 SO-9 spec', () => {
    expect(SLA_HOURS.critical).toBe(24);
    expect(SLA_HOURS.high).toBe(7 * 24);
    expect(SLA_HOURS.medium).toBe(null);
    expect(SLA_HOURS.low).toBe(null);
  });
});

describe('decideRotation', () => {
  it('rotates Critical-severity alert past 24h SLA', () => {
    const decision = decideRotation({ alert: baseAlert(), now: NOW });
    expect(decision.rotate).toBe(true);
    expect(decision.reason).toBe('sla_breached');
  });

  it('does NOT rotate Critical-severity alert within 24h SLA', () => {
    const alert = baseAlert({ detectedAt: new Date(NOW - 12 * HOUR).toISOString() });
    const decision = decideRotation({ alert, now: NOW });
    expect(decision.rotate).toBe(false);
    expect(decision.reason).toBe('within_sla');
  });

  it('rotates High-severity alert past 7-day SLA', () => {
    const alert = baseAlert({
      severity: 'high',
      detectedAt: new Date(NOW - 8 * 24 * HOUR).toISOString(),
    });
    const decision = decideRotation({ alert, now: NOW });
    expect(decision.rotate).toBe(true);
    expect(decision.reason).toBe('sla_breached');
  });

  it('does NOT rotate High-severity within 7-day SLA', () => {
    const alert = baseAlert({
      severity: 'high',
      detectedAt: new Date(NOW - 3 * 24 * HOUR).toISOString(),
    });
    const decision = decideRotation({ alert, now: NOW });
    expect(decision.rotate).toBe(false);
    expect(decision.reason).toBe('within_sla');
  });

  it('does NOT rotate Medium-severity (queued for SME review only)', () => {
    const alert = baseAlert({ severity: 'medium' });
    const decision = decideRotation({ alert, now: NOW });
    expect(decision.rotate).toBe(false);
    expect(decision.reason).toBe('severity_below_threshold');
  });

  it('does NOT rotate Low-severity', () => {
    const alert = baseAlert({ severity: 'low' });
    const decision = decideRotation({ alert, now: NOW });
    expect(decision.rotate).toBe(false);
    expect(decision.reason).toBe('severity_below_threshold');
  });

  it('does NOT rotate when similarity is below the confidence floor', () => {
    const alert = baseAlert({ similarityScore: 0.7 });
    const decision = decideRotation({ alert, now: NOW });
    expect(decision.rotate).toBe(false);
    expect(decision.reason).toBe('similarity_below_confidence_floor');
  });

  it('respects a custom confidence floor', () => {
    const alert = baseAlert({ similarityScore: 0.88 });
    const lenient = decideRotation({ alert, now: NOW, confidenceFloor: 0.5 });
    expect(lenient.rotate).toBe(true);
    const strict = decideRotation({ alert, now: NOW, confidenceFloor: 0.95 });
    expect(strict.rotate).toBe(false);
    expect(strict.reason).toBe('similarity_below_confidence_floor');
  });

  it('does NOT re-rotate alerts already in terminal state', () => {
    for (const status of ['rotated', 'dismissed', 'false_positive'] as const) {
      const decision = decideRotation({ alert: baseAlert({ status }), now: NOW });
      expect(decision.rotate).toBe(false);
      expect(decision.reason).toBe('already_handled');
    }
  });

  it('treats `under_review` like `detected` for SLA purposes', () => {
    const decision = decideRotation({ alert: baseAlert({ status: 'under_review' }), now: NOW });
    expect(decision.rotate).toBe(true);
  });

  it('returns slaCutoff as ISO timestamp matching detectedAt + sla', () => {
    const detected = new Date(NOW - 30 * HOUR);
    const alert = baseAlert({ detectedAt: detected.toISOString() });
    const decision = decideRotation({ alert, now: NOW });
    expect(decision.slaCutoff).toBe(new Date(detected.getTime() + 24 * HOUR).toISOString());
  });

  it('returns slaCutoff "n/a" for non-auto-rotated severities', () => {
    const decision = decideRotation({ alert: baseAlert({ severity: 'low' }), now: NOW });
    expect(decision.slaCutoff).toBe('n/a');
  });
});

describe('selectAlertsForRotation', () => {
  it('returns only alerts whose decideRotation says rotate', () => {
    const alerts = [
      baseAlert({ id: 'a1' }), // critical, 25h old → rotate
      baseAlert({ id: 'a2', detectedAt: new Date(NOW - 12 * HOUR).toISOString() }), // within SLA
      baseAlert({ id: 'a3', severity: 'low' }), // below severity
      baseAlert({ id: 'a4', similarityScore: 0.5 }), // below confidence floor
      baseAlert({ id: 'a5', status: 'rotated' }), // already handled
    ];
    const selected = selectAlertsForRotation(alerts, NOW);
    expect(selected.map((a) => a.id)).toEqual(['a1']);
  });
});

describe('hoursUntilSlaBreach', () => {
  it('returns positive hours when within SLA', () => {
    const alert = baseAlert({ detectedAt: new Date(NOW - 12 * HOUR).toISOString() });
    expect(hoursUntilSlaBreach(alert, NOW)).toBe(12);
  });

  it('returns negative hours when SLA already breached', () => {
    const alert = baseAlert({ detectedAt: new Date(NOW - 30 * HOUR).toISOString() });
    expect(hoursUntilSlaBreach(alert, NOW)).toBe(-6);
  });

  it('returns null for non-auto-rotated severities', () => {
    expect(hoursUntilSlaBreach(baseAlert({ severity: 'medium' }), NOW)).toBe(null);
  });
});
