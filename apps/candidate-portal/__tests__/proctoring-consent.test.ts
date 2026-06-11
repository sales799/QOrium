import { describe, expect, it } from 'vitest';
import { buildProctoringNotice } from '../src/lib/proctoring-consent';

describe('buildProctoringNotice', () => {
  it('returns an empty, disabled notice when the view is null/undefined', () => {
    expect(buildProctoringNotice(null)).toEqual({
      enabled: false,
      requiresExplicitConsent: false,
      items: [],
    });
    expect(buildProctoringNotice(undefined)).toEqual({
      enabled: false,
      requiresExplicitConsent: false,
      items: [],
    });
  });

  it('stays inert when proctoring_enabled is false (the default)', () => {
    const notice = buildProctoringNotice({
      proctoring_enabled: false,
      features: ['integrity_scoring'],
      consent_required: false,
    });
    expect(notice.enabled).toBe(false);
    expect(notice.requiresExplicitConsent).toBe(false);
    expect(notice.items).toEqual([]);
  });

  it('is inert when enabled but no recognised features are present', () => {
    expect(buildProctoringNotice({ proctoring_enabled: true, features: [] })).toEqual(EMPTY);
    expect(
      buildProctoringNotice({ proctoring_enabled: true, features: ['something_new'] }),
    ).toEqual(EMPTY);
  });

  it('describes a growth-tier integrity-scoring policy without requiring explicit consent', () => {
    const notice = buildProctoringNotice({
      proctoring_enabled: true,
      features: ['integrity_scoring'],
      consent_required: false,
    });
    expect(notice.enabled).toBe(true);
    expect(notice.requiresExplicitConsent).toBe(false);
    expect(notice.items).toHaveLength(1);
    expect(notice.items[0]).toMatch(/integrity/i);
  });

  it('requires explicit consent and lists biometric features for a scale-tier policy', () => {
    const notice = buildProctoringNotice({
      proctoring_enabled: true,
      features: ['integrity_scoring', 'webcam_snapshots', 'id_capture'],
      consent_required: true,
    });
    expect(notice.enabled).toBe(true);
    expect(notice.requiresExplicitConsent).toBe(true);
    expect(notice.items).toHaveLength(3);
    expect(notice.items.some((i) => /webcam/i.test(i))).toBe(true);
    expect(notice.items.some((i) => /ID/.test(i))).toBe(true);
  });

  it('ignores unknown feature ids but keeps the recognised ones', () => {
    const notice = buildProctoringNotice({
      proctoring_enabled: true,
      features: ['integrity_scoring', 'future_feature', 'lockdown_browser'],
      consent_required: false,
    });
    expect(notice.items).toHaveLength(2);
    expect(notice.items.some((i) => /locked-down/i.test(i))).toBe(true);
  });

  it('treats a non-array features field as no features', () => {
    expect(
      buildProctoringNotice({
        proctoring_enabled: true,
        features: 'integrity_scoring' as unknown,
        consent_required: true,
      }),
    ).toEqual(EMPTY);
  });

  it('does not require explicit consent unless the notice is itself enabled', () => {
    // consent_required true but no enabled proctoring must never gate Start.
    const notice = buildProctoringNotice({
      proctoring_enabled: false,
      features: ['webcam_snapshots'],
      consent_required: true,
    });
    expect(notice.requiresExplicitConsent).toBe(false);
  });
});

const EMPTY = { enabled: false, requiresExplicitConsent: false, items: [] };
