import { describe, it, expect } from 'vitest';
import { buildProofView, bandLabel, formatGraded } from '../src/lib/proof-view';

describe('formatGraded', () => {
  it('returns ISO date (YYYY-MM-DD) for a valid timestamp', () => {
    expect(formatGraded('2026-06-05T13:39:00.000Z')).toBe('2026-06-05');
  });
  it('returns null for null/empty/invalid input', () => {
    expect(formatGraded(null)).toBeNull();
    expect(formatGraded(undefined)).toBeNull();
    expect(formatGraded('not-a-date')).toBeNull();
  });
});

describe('bandLabel', () => {
  it('maps known bands to title-case labels', () => {
    expect(bandLabel('developing')).toBe('Developing');
    expect(bandLabel('STRONG')).toBe('Strong');
  });
  it('capitalizes unknown non-empty bands', () => {
    expect(bandLabel('mythic')).toBe('Mythic');
  });
  it('falls back to "Assessed" when band is missing', () => {
    expect(bandLabel(null)).toBe('Assessed');
    expect(bandLabel('')).toBe('Assessed');
  });
});

describe('buildProofView', () => {
  it('maps a passed proof and never exposes the numeric score', () => {
    const v = buildProofView({
      verified: true,
      issuer: 'Talpro India',
      assessment: 'BR3 E2E',
      score_pct: 40,
      score_band: 'developing',
      passed: true,
      graded_at: '2026-06-05T13:39:00.000Z',
      attestation: 'Issued by QOrium.',
    });
    expect(v.issuer).toBe('Talpro India');
    expect(v.assessment).toBe('BR3 E2E');
    expect(v.bandLabel).toBe('Developing');
    expect(v.outcome).toBe('pass');
    expect(v.outcomeLabel).toBe('Passed');
    expect(v.gradedLabel).toBe('2026-06-05');
    expect(v.attestation).toBe('Issued by QOrium.');
    // privacy: the view model carries no numeric score field
    expect(JSON.stringify(v)).not.toContain('40');
  });

  it('maps a failed proof', () => {
    const v = buildProofView({ passed: false, score_band: 'emerging' });
    expect(v.outcome).toBe('fail');
    expect(v.outcomeLabel).toBe('Did not pass');
  });

  it('degrades gracefully on a sparse payload', () => {
    const v = buildProofView({});
    expect(v.issuer).toBe('QOrium');
    expect(v.assessment).toBe('Skills assessment');
    expect(v.bandLabel).toBe('Assessed');
    expect(v.outcome).toBe('unknown');
    expect(v.outcomeLabel).toBe('Assessed');
    expect(v.gradedLabel).toBeNull();
    expect(v.attestation).toBeNull();
  });
});
