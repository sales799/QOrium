import { describe, it, expect } from 'vitest';
import { resolveProctoringPolicy, proctoringFeatureFlag } from '../src/lib/proctoring-policy.js';

describe('resolveProctoringPolicy', () => {
  it('returns inert policy when the global flag is off (regardless of plan)', () => {
    const p = resolveProctoringPolicy({ globalEnabled: false, plan: 'enterprise' });
    expect(p.enabled).toBe(false);
    expect(p.features).toEqual([]);
    expect(p.consent_required).toBe(false);
    expect(p.reason).toBe('feature_flag_off');
  });

  it('grants nothing to the free plan even when the flag is on', () => {
    const p = resolveProctoringPolicy({ globalEnabled: true, plan: 'free' });
    expect(p.enabled).toBe(false);
    expect(p.features).toEqual([]);
    expect(p.reason).toBe('plan_not_entitled');
  });

  it('grants integrity scoring only to growth (no biometric capture, no consent)', () => {
    const p = resolveProctoringPolicy({ globalEnabled: true, plan: 'growth' });
    expect(p.enabled).toBe(true);
    expect(p.features).toEqual(['integrity_scoring']);
    expect(p.consent_required).toBe(false);
    expect(p.reason).toBe('ok');
  });

  it('grants webcam + id capture to scale and flags consent_required', () => {
    const p = resolveProctoringPolicy({ globalEnabled: true, plan: 'scale' });
    expect(p.enabled).toBe(true);
    expect(p.features).toContain('webcam_snapshots');
    expect(p.features).toContain('id_capture');
    expect(p.features).not.toContain('lockdown_browser');
    expect(p.consent_required).toBe(true);
  });

  it('grants the full ladder to enterprise', () => {
    const p = resolveProctoringPolicy({ globalEnabled: true, plan: 'enterprise' });
    expect(p.features).toEqual([
      'integrity_scoring',
      'webcam_snapshots',
      'id_capture',
      'lockdown_browser',
    ]);
    expect(p.consent_required).toBe(true);
  });

  it('an override can only NARROW entitlement, never escalate', () => {
    // free plan tries to opt INTO webcam — ignored, stays empty.
    const escalate = resolveProctoringPolicy({
      globalEnabled: true,
      plan: 'free',
      disabledFeatures: [],
    });
    expect(escalate.features).toEqual([]);

    // scale opts OUT of biometric capture → only integrity scoring remains, no consent.
    const narrowed = resolveProctoringPolicy({
      globalEnabled: true,
      plan: 'scale',
      disabledFeatures: ['webcam_snapshots', 'id_capture'],
    });
    expect(narrowed.enabled).toBe(true);
    expect(narrowed.features).toEqual(['integrity_scoring']);
    expect(narrowed.consent_required).toBe(false);
  });

  it('opting out of every entitled feature returns all_features_opted_out', () => {
    const p = resolveProctoringPolicy({
      globalEnabled: true,
      plan: 'growth',
      disabledFeatures: ['integrity_scoring'],
    });
    expect(p.enabled).toBe(false);
    expect(p.features).toEqual([]);
    expect(p.reason).toBe('all_features_opted_out');
  });
});

describe('proctoringFeatureFlag', () => {
  it('is OFF by default / for falsy values', () => {
    expect(proctoringFeatureFlag({})).toBe(false);
    expect(proctoringFeatureFlag({ PROCTORING_ENABLED: '' })).toBe(false);
    expect(proctoringFeatureFlag({ PROCTORING_ENABLED: '0' })).toBe(false);
    expect(proctoringFeatureFlag({ PROCTORING_ENABLED: 'false' })).toBe(false);
  });

  it('is ON for truthy values (case-insensitive)', () => {
    expect(proctoringFeatureFlag({ PROCTORING_ENABLED: '1' })).toBe(true);
    expect(proctoringFeatureFlag({ PROCTORING_ENABLED: 'TRUE' })).toBe(true);
    expect(proctoringFeatureFlag({ PROCTORING_ENABLED: 'yes' })).toBe(true);
    expect(proctoringFeatureFlag({ PROCTORING_ENABLED: 'On' })).toBe(true);
  });
});
