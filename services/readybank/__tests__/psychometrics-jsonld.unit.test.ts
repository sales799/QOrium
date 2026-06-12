import { describe, expect, it } from 'vitest';
import { buildPsychometricsJsonLd } from '../src/lib/psychometrics-jsonld.js';
import type { PsychometricsCoverage } from '../src/lib/psychometrics-coverage.js';

/**
 * N14 AEO / N19 — pure shaping of the public psychometrics-coverage report into
 * schema.org JSON-LD. No DB: these prove the document is always well-formed
 * (correct @context/@type, all seven measurements present, integer-sanitized
 * counts, percent-clamped pcts, stable timestamp) so AI answer engines and
 * crawlers get clean structured data about how calibrated the bank is.
 */

const FIXED = new Date('2026-06-12T00:00:00.000Z');

const base: PsychometricsCoverage = {
  questions_released: 1417,
  with_irt_params: 1417,
  with_empirical_data: 10,
  refit_ready: 0,
  irt_params_pct: 100,
  empirical_pct: 1,
  refit_ready_pct: 0,
  generated_at: '2026-06-12T08:15:00.000Z',
};

describe('buildPsychometricsJsonLd', () => {
  it('emits a schema.org Dataset with a QOrium Organization creator', () => {
    const doc = buildPsychometricsJsonLd(base, FIXED);
    expect(doc['@context']).toBe('https://schema.org');
    expect(doc['@type']).toBe('Dataset');
    expect(doc.creator['@type']).toBe('Organization');
    expect(doc.creator.name).toBe('QOrium');
    expect(doc.creator.url).toBe('https://qorium.online');
    expect(doc.url).toBe('https://qorium.online/proof');
    expect(doc.isAccessibleForFree).toBe(true);
  });

  it('exposes all seven coverage measurements as PropertyValue', () => {
    const doc = buildPsychometricsJsonLd(base, FIXED);
    const names = doc.variableMeasured.map((m) => m.name).sort();
    expect(names).toEqual(
      [
        'empirical_pct',
        'irt_params_pct',
        'questions_released',
        'refit_ready',
        'refit_ready_pct',
        'with_empirical_data',
        'with_irt_params',
      ].sort(),
    );
    for (const m of doc.variableMeasured) {
      expect(m['@type']).toBe('PropertyValue');
      expect(typeof m.description).toBe('string');
      expect(m.description.length).toBeGreaterThan(0);
    }
    const byName = Object.fromEntries(doc.variableMeasured.map((m) => [m.name, m.value]));
    expect(byName.questions_released).toBe(1417);
    expect(byName.with_empirical_data).toBe(10);
    expect(byName.irt_params_pct).toBe(100);
  });

  it('tags the three percentage measurements with unitText=percent only', () => {
    const doc = buildPsychometricsJsonLd(base, FIXED);
    const withUnit = doc.variableMeasured
      .filter((m) => m.unitText === 'percent')
      .map((m) => m.name);
    expect(withUnit.sort()).toEqual(['empirical_pct', 'irt_params_pct', 'refit_ready_pct'].sort());
    const counts = doc.variableMeasured.filter((m) => m.unitText === undefined).map((m) => m.name);
    expect(counts.sort()).toEqual(
      ['questions_released', 'refit_ready', 'with_empirical_data', 'with_irt_params'].sort(),
    );
  });

  it('carries the coverage timestamp through to dateModified', () => {
    const doc = buildPsychometricsJsonLd(base, FIXED);
    expect(doc.dateModified).toBe('2026-06-12T08:15:00.000Z');
  });

  it('falls back to the supplied clock when generated_at is empty', () => {
    const doc = buildPsychometricsJsonLd({ ...base, generated_at: '' }, FIXED);
    expect(doc.dateModified).toBe(FIXED.toISOString());
  });

  it('sanitizes junk counts and clamps percentages (never NaN/negative/float/>100)', () => {
    const dirty: PsychometricsCoverage = {
      questions_released: 1417.9,
      with_irt_params: -3,
      with_empirical_data: Number.NaN,
      refit_ready: Number.POSITIVE_INFINITY,
      irt_params_pct: 150,
      empirical_pct: -10,
      refit_ready_pct: Number.NaN,
      generated_at: FIXED.toISOString(),
    };
    const byName = Object.fromEntries(
      buildPsychometricsJsonLd(dirty, FIXED).variableMeasured.map((m) => [m.name, m.value]),
    );
    expect(byName.questions_released).toBe(1417);
    expect(byName.with_irt_params).toBe(0);
    expect(byName.with_empirical_data).toBe(0);
    expect(byName.refit_ready).toBe(0);
    expect(byName.irt_params_pct).toBe(100);
    expect(byName.empirical_pct).toBe(0);
    expect(byName.refit_ready_pct).toBe(0);
    for (const v of Object.values(byName)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1417);
    }
  });

  it('serializes to valid JSON', () => {
    const doc = buildPsychometricsJsonLd(base, FIXED);
    const round = JSON.parse(JSON.stringify(doc));
    expect(round['@type']).toBe('Dataset');
    expect(round.variableMeasured).toHaveLength(7);
  });
});
