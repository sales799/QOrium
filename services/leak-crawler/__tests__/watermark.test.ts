import { describe, expect, it } from 'vitest';
import {
  attributeLeak,
  deriveMarkers,
  deriveWatermarkMarkers,
  deriveWatermarkSeed,
  seedsEqual,
} from '../src/watermark';

const SECRET = 'stack-vault-watermark-secret-32-chars-min';

describe('deriveWatermarkSeed', () => {
  it('is deterministic', () => {
    const a = deriveWatermarkSeed({ watermarkSecret: SECRET, tenantId: 'bosch', questionId: 'q1' });
    const b = deriveWatermarkSeed({ watermarkSecret: SECRET, tenantId: 'bosch', questionId: 'q1' });
    expect(a).toBe(b);
  });

  it('changes when any input changes', () => {
    const base = { watermarkSecret: SECRET, tenantId: 'bosch', questionId: 'q1' };
    const a = deriveWatermarkSeed(base);
    expect(deriveWatermarkSeed({ ...base, tenantId: 'tcs' })).not.toBe(a);
    expect(deriveWatermarkSeed({ ...base, questionId: 'q2' })).not.toBe(a);
    expect(deriveWatermarkSeed({ ...base, watermarkSecret: SECRET + 'x' })).not.toBe(a);
  });

  it('emits 64 lowercase hex chars', () => {
    const seed = deriveWatermarkSeed({
      watermarkSecret: SECRET,
      tenantId: 'bosch',
      questionId: 'q1',
    });
    expect(seed).toMatch(/^[0-9a-f]{64}$/);
  });

  it('throws on missing inputs', () => {
    expect(() =>
      deriveWatermarkSeed({ watermarkSecret: '', tenantId: 'bosch', questionId: 'q1' }),
    ).toThrow();
    expect(() =>
      deriveWatermarkSeed({ watermarkSecret: SECRET, tenantId: '', questionId: 'q1' }),
    ).toThrow();
    expect(() =>
      deriveWatermarkSeed({ watermarkSecret: SECRET, tenantId: 'bosch', questionId: '' }),
    ).toThrow();
  });
});

describe('deriveMarkers', () => {
  it('extracts the five markers in expected ranges', () => {
    const seed = deriveWatermarkSeed({
      watermarkSecret: SECRET,
      tenantId: 'bosch',
      questionId: 'q1',
    });
    const m = deriveMarkers(seed);
    expect(m.variableSuffix).toMatch(/^[0-9a-f]{2}$/);
    expect(m.variableSuffix).toBe(seed.slice(0, 2));
    expect(m.testValuePercent).toBeGreaterThanOrEqual(0);
    expect(m.testValuePercent).toBeLessThanOrEqual(9);
    expect(m.synonymIndex).toBeGreaterThanOrEqual(0);
    expect(m.synonymIndex).toBeLessThanOrEqual(9);
    expect(['cpp', 'c']).toContain(m.commentStyle);
    expect([0, 1]).toContain(m.helperReorderParity);
  });

  it('rejects invalid hex', () => {
    expect(() => deriveMarkers('not-hex')).toThrow();
    expect(() => deriveMarkers('a'.repeat(63))).toThrow();
    expect(() => deriveMarkers('A'.repeat(64))).toThrow();
  });

  it('different tenants yield different markers (high probability)', () => {
    const a = deriveWatermarkMarkers({
      watermarkSecret: SECRET,
      tenantId: 'bosch',
      questionId: 'q1',
    });
    const b = deriveWatermarkMarkers({
      watermarkSecret: SECRET,
      tenantId: 'tcs',
      questionId: 'q1',
    });
    expect(a).not.toEqual(b);
  });
});

describe('attributeLeak', () => {
  it('returns full match for the correct candidate seed', () => {
    const seed = deriveWatermarkSeed({
      watermarkSecret: SECRET,
      tenantId: 'bosch',
      questionId: 'q1',
    });
    const observed = deriveMarkers(seed);
    const result = attributeLeak(observed, seed);
    expect(result.matchedCount).toBe(result.totalCount);
    expect(result.confidence).toBe(1);
  });

  it('returns partial confidence for a different candidate', () => {
    const observed = deriveWatermarkMarkers({
      watermarkSecret: SECRET,
      tenantId: 'bosch',
      questionId: 'q1',
    });
    const wrongSeed = deriveWatermarkSeed({
      watermarkSecret: SECRET,
      tenantId: 'tcs',
      questionId: 'q1',
    });
    const result = attributeLeak(observed, wrongSeed);
    expect(result.confidence).toBeLessThan(1);
    expect(result.markerMatches).toHaveLength(5);
  });
});

describe('seedsEqual', () => {
  it('returns true for identical seeds, false otherwise', () => {
    const seed = deriveWatermarkSeed({
      watermarkSecret: SECRET,
      tenantId: 'bosch',
      questionId: 'q1',
    });
    expect(seedsEqual(seed, seed)).toBe(true);
    expect(seedsEqual(seed, 'a'.repeat(64))).toBe(false);
  });

  it('returns false when lengths differ', () => {
    expect(seedsEqual('a'.repeat(64), 'a'.repeat(63))).toBe(false);
  });
});
