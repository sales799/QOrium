import { describe, expect, it } from 'vitest';
import { buildProofStatsJsonLd } from '../src/lib/proof-jsonld.js';
import type { ProofStats } from '../src/repositories/proof-stats.js';

/**
 * N14 AEO — pure shaping of the public proof funnel into schema.org JSON-LD.
 * These tests need no DB: they prove the document is always well-formed
 * (correct @context/@type, all six counts present, integer-sanitized values,
 * stable timestamp) so AI answer engines and crawlers get clean structured data.
 */

const FIXED = new Date('2026-06-12T00:00:00.000Z');

const baseStats: ProofStats = {
  assessments_created: 12,
  candidates_invited: 30,
  assessments_taken: 18,
  attempts_graded: 9,
  questions_released: 1417,
  questions_calibrated: 0,
  generated_at: '2026-06-12T08:15:00.000Z',
};

describe('buildProofStatsJsonLd', () => {
  it('emits a schema.org Dataset with a QOrium Organization creator', () => {
    const doc = buildProofStatsJsonLd(baseStats, FIXED);
    expect(doc['@context']).toBe('https://schema.org');
    expect(doc['@type']).toBe('Dataset');
    expect(doc.creator['@type']).toBe('Organization');
    expect(doc.creator.name).toBe('QOrium');
    expect(doc.creator.url).toBe('https://qorium.online');
    expect(doc.url).toBe('https://qorium.online/proof');
    expect(doc.isAccessibleForFree).toBe(true);
  });

  it('exposes all six funnel counts as PropertyValue measurements', () => {
    const doc = buildProofStatsJsonLd(baseStats, FIXED);
    const names = doc.variableMeasured.map((m) => m.name).sort();
    expect(names).toEqual(
      [
        'assessments_created',
        'assessments_taken',
        'attempts_graded',
        'candidates_invited',
        'questions_calibrated',
        'questions_released',
      ].sort(),
    );
    for (const m of doc.variableMeasured) {
      expect(m['@type']).toBe('PropertyValue');
      expect(typeof m.description).toBe('string');
      expect(m.description.length).toBeGreaterThan(0);
    }
    const byName = Object.fromEntries(doc.variableMeasured.map((m) => [m.name, m.value]));
    expect(byName.assessments_created).toBe(12);
    expect(byName.questions_released).toBe(1417);
    expect(byName.questions_calibrated).toBe(0);
  });

  it('carries the ProofStats timestamp through to dateModified', () => {
    const doc = buildProofStatsJsonLd(baseStats, FIXED);
    expect(doc.dateModified).toBe('2026-06-12T08:15:00.000Z');
  });

  it('falls back to the supplied clock when generated_at is empty', () => {
    const doc = buildProofStatsJsonLd({ ...baseStats, generated_at: '' }, FIXED);
    expect(doc.dateModified).toBe(FIXED.toISOString());
  });

  it('sanitizes junk counts to non-negative integers (never NaN/negative/float)', () => {
    const dirty: ProofStats = {
      assessments_created: -5,
      candidates_invited: Number.NaN,
      assessments_taken: 4.9,
      attempts_graded: Number.POSITIVE_INFINITY,
      questions_released: 1417,
      questions_calibrated: -1,
      generated_at: FIXED.toISOString(),
    };
    const byName = Object.fromEntries(
      buildProofStatsJsonLd(dirty, FIXED).variableMeasured.map((m) => [m.name, m.value]),
    );
    expect(byName.assessments_created).toBe(0);
    expect(byName.candidates_invited).toBe(0);
    expect(byName.assessments_taken).toBe(4);
    expect(byName.attempts_graded).toBe(0);
    expect(byName.questions_calibrated).toBe(0);
    for (const v of Object.values(byName)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
    }
  });

  it('serializes to valid JSON', () => {
    const doc = buildProofStatsJsonLd(baseStats, FIXED);
    const round = JSON.parse(JSON.stringify(doc));
    expect(round['@type']).toBe('Dataset');
    expect(round.variableMeasured).toHaveLength(6);
  });
});
