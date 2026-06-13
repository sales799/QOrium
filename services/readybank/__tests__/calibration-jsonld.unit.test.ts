import { describe, expect, it } from 'vitest';
import { buildCalibrationJsonLd } from '../src/lib/calibration-jsonld.js';
import type { CalibrationProgress } from '../src/lib/calibration-progress.js';

/**
 * N14 AEO / N19 — pure shaping of the public calibration-progress aggregate into
 * schema.org JSON-LD. No DB: these prove the document is always well-formed
 * (correct @context/@type, all six measurements present, integer-sanitized
 * counts, percent-clamped pcts, stable timestamp) so AI answer engines and
 * crawlers get clean structured data about how actively the bank is calibrating.
 */

const FIXED = new Date('2026-06-13T00:00:00.000Z');

const base: CalibrationProgress = {
  released: 1417,
  calibratable: 1417,
  seeded: 10,
  cold_backlog: 1407,
  seeded_pct: 1,
  cold_pct: 99,
  generated_at: '2026-06-13T08:15:00.000Z',
};

describe('buildCalibrationJsonLd', () => {
  it('emits a schema.org Dataset with a QOrium Organization creator', () => {
    const doc = buildCalibrationJsonLd(base, FIXED);
    expect(doc['@context']).toBe('https://schema.org');
    expect(doc['@type']).toBe('Dataset');
    expect(doc.creator['@type']).toBe('Organization');
    expect(doc.creator.name).toBe('QOrium');
    expect(doc.creator.url).toBe('https://qorium.online');
    expect(doc.url).toBe('https://qorium.online/proof');
    expect(doc.isAccessibleForFree).toBe(true);
  });

  it('exposes all six progress measurements as PropertyValue', () => {
    const doc = buildCalibrationJsonLd(base, FIXED);
    const names = doc.variableMeasured.map((m) => m.name).sort();
    expect(names).toEqual(
      ['calibratable', 'cold_backlog', 'cold_pct', 'released', 'seeded', 'seeded_pct'].sort(),
    );
    for (const m of doc.variableMeasured) {
      expect(m['@type']).toBe('PropertyValue');
      expect(typeof m.description).toBe('string');
      expect(m.description.length).toBeGreaterThan(0);
    }
    const byName = Object.fromEntries(doc.variableMeasured.map((m) => [m.name, m.value]));
    expect(byName.released).toBe(1417);
    expect(byName.calibratable).toBe(1417);
    expect(byName.seeded).toBe(10);
    expect(byName.cold_backlog).toBe(1407);
    expect(byName.seeded_pct).toBe(1);
  });

  it('tags the two percentage measurements with unitText=percent only', () => {
    const doc = buildCalibrationJsonLd(base, FIXED);
    const withUnit = doc.variableMeasured
      .filter((m) => m.unitText === 'percent')
      .map((m) => m.name);
    expect(withUnit.sort()).toEqual(['cold_pct', 'seeded_pct'].sort());
    const counts = doc.variableMeasured.filter((m) => m.unitText === undefined).map((m) => m.name);
    expect(counts.sort()).toEqual(['calibratable', 'cold_backlog', 'released', 'seeded'].sort());
  });

  it('carries the progress timestamp through to dateModified', () => {
    const doc = buildCalibrationJsonLd(base, FIXED);
    expect(doc.dateModified).toBe('2026-06-13T08:15:00.000Z');
  });

  it('falls back to the supplied clock when generated_at is empty', () => {
    const doc = buildCalibrationJsonLd({ ...base, generated_at: '' }, FIXED);
    expect(doc.dateModified).toBe(FIXED.toISOString());
  });

  it('sanitizes junk counts and clamps percentages (never NaN/negative/float/>100)', () => {
    const dirty: CalibrationProgress = {
      released: 1417.9,
      calibratable: -3,
      seeded: Number.NaN,
      cold_backlog: Number.POSITIVE_INFINITY,
      seeded_pct: 150,
      cold_pct: -10,
      generated_at: FIXED.toISOString(),
    };
    const byName = Object.fromEntries(
      buildCalibrationJsonLd(dirty, FIXED).variableMeasured.map((m) => [m.name, m.value]),
    );
    expect(byName.released).toBe(1417);
    expect(byName.calibratable).toBe(0);
    expect(byName.seeded).toBe(0);
    expect(byName.cold_backlog).toBe(0);
    expect(byName.seeded_pct).toBe(100);
    expect(byName.cold_pct).toBe(0);
    for (const v of Object.values(byName)) {
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1417);
    }
  });

  it('serializes to valid JSON', () => {
    const doc = buildCalibrationJsonLd(base, FIXED);
    const round = JSON.parse(JSON.stringify(doc));
    expect(round['@type']).toBe('Dataset');
    expect(round.variableMeasured).toHaveLength(6);
  });
});
