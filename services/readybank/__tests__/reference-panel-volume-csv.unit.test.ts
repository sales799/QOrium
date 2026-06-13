import { describe, expect, it } from 'vitest';
import {
  referencePanelVolumeToCsv,
  REFERENCE_PANEL_VOLUME_CSV_HEADERS,
} from '../src/lib/reference-panel-volume-csv.js';
import {
  computeReferencePanelVolume,
  type SkillReleasedRow,
  type SkillPanelRow,
} from '../src/lib/reference-panel-volume.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

/**
 * N8/N19 reference-panel-volume CSV — pure RFC 4180 serialisation of the panel
 * ingestion report produced by computeReferencePanelVolume(). No DB needed: the
 * tests prove the CSV is well-formed (header + one row per family + a TOTAL
 * row), CRLF-framed, trailing-CRLF-terminated, that the panel_responses-descending
 * family order is preserved, that the platform-wide distinct_panelists count is
 * carried on the TOTAL row, and that every cell is RFC-4180-safe even when a
 * family_name contains a comma.
 */

const FIXED = new Date('2026-06-13T00:00:00.000Z');

function released(skill: string, n: number): SkillReleasedRow {
  return { skill, released: n };
}

function panel(skill: string, partial: Partial<SkillPanelRow> = {}): SkillPanelRow {
  return {
    skill,
    panel_responses: 0,
    questions_with_panel: 0,
    ...partial,
  };
}

function parseLines(csv: string): string[] {
  // Drop the single trailing CRLF, then split on CRLF.
  expect(csv.endsWith('\r\n')).toBe(true);
  return csv.slice(0, -2).split('\r\n');
}

/** Count RFC 4180 fields in one CSV record, honouring double-quoted fields. */
function countCsvFields(line: string): number {
  let fields = 1;
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        i++; // escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      fields++;
    }
  }
  return fields;
}

describe('referencePanelVolumeToCsv', () => {
  it('emits a header row, one row per family, and a TOTAL row', () => {
    const report = computeReferencePanelVolume([], [], 0, FIXED);
    const lines = parseLines(referencePanelVolumeToCsv(report));
    // header + every family + TOTAL
    expect(lines).toHaveLength(1 + SKILL_FAMILIES.length + 1);
    expect(lines[0]).toBe(REFERENCE_PANEL_VOLUME_CSV_HEADERS.join(','));
    const last = lines[lines.length - 1];
    expect(last.startsWith('TOTAL,')).toBe(true);
  });

  it('every line has exactly six columns', () => {
    const report = computeReferencePanelVolume(
      [released('AWS Lambda', 10), released('React', 4)],
      [
        panel('AWS Lambda', { panel_responses: 30, questions_with_panel: 6 }),
        panel('React', { panel_responses: 4, questions_with_panel: 2 }),
      ],
      5,
      FIXED,
    );
    for (const line of parseLines(referencePanelVolumeToCsv(report))) {
      // Quote-aware: 'Data Science, ML & AI' has an embedded comma that must be quoted.
      expect(countCsvFields(line)).toBe(REFERENCE_PANEL_VOLUME_CSV_HEADERS.length);
    }
  });

  it('carries the raw counts and coverage pct through faithfully', () => {
    // released=4, questions_with_panel=2 -> questions_coverage_pct=round(2/4*100)=50
    const report = computeReferencePanelVolume(
      [released('AWS Lambda', 4)],
      [panel('AWS Lambda', { panel_responses: 12, questions_with_panel: 2 })],
      3,
      FIXED,
    );
    const csv = referencePanelVolumeToCsv(report);
    const lines = parseLines(csv);
    // Find the family row that has non-zero panel data (it sorts first after header).
    const dataRow = lines[1];
    const cells = dataRow.split(',');
    // family_name 'Cloud & DevOps' has no comma -> simple split is safe here.
    expect(cells).toContain('4'); // released
    expect(cells).toContain('12'); // panel_responses
    expect(cells).toContain('2'); // questions_with_panel
    expect(cells).toContain('50'); // questions_coverage_pct
  });

  it('preserves the panel_responses-descending family order from the report', () => {
    const report = computeReferencePanelVolume(
      [released('AWS Lambda', 10), released('React', 10), released('PostgreSQL', 10)],
      [
        panel('React', { panel_responses: 50, questions_with_panel: 8 }),
        panel('AWS Lambda', { panel_responses: 20, questions_with_panel: 5 }),
        panel('PostgreSQL', { panel_responses: 5, questions_with_panel: 1 }),
      ],
      9,
      FIXED,
    );
    const csv = referencePanelVolumeToCsv(report);
    const lines = parseLines(csv);
    // Re-derive the expected family ids in report order (skip header + TOTAL).
    const familyOrder = report.families.map((f) => f.family);
    const bodyFamilyCells = lines.slice(1, lines.length - 1).map((l) => l.split(',')[0]);
    expect(bodyFamilyCells).toEqual(familyOrder);
    // The report itself must be panel_responses-descending.
    const responses = report.families.map((f) => f.panel_responses);
    const sortedDesc = [...responses].sort((a, b) => b - a);
    expect(responses).toEqual(sortedDesc);
  });

  it('carries distinct_panelists and generated_at on the TOTAL row only', () => {
    const report = computeReferencePanelVolume([], [], 7, FIXED);
    const csv = referencePanelVolumeToCsv(report);
    const lines = parseLines(csv);
    const total = lines[lines.length - 1];
    expect(total).toContain('distinct_panelists=7');
    expect(total).toContain(`generated_at=${FIXED.toISOString()}`);
    // No body family row should carry the panelist marker.
    for (const line of lines.slice(1, lines.length - 1)) {
      expect(line).not.toContain('distinct_panelists=');
    }
  });

  it('RFC-4180-quotes a family_name containing a comma', () => {
    // 'Data Science, ML & AI' is a canonical family with an embedded comma.
    const report = computeReferencePanelVolume([], [], 0, FIXED);
    const csv = referencePanelVolumeToCsv(report);
    expect(csv).toContain('"Data Science, ML & AI"');
  });

  it('totals reconcile with the JSON report counts', () => {
    const report = computeReferencePanelVolume(
      [released('AWS Lambda', 10), released('React', 4)],
      [
        panel('AWS Lambda', { panel_responses: 30, questions_with_panel: 6 }),
        panel('React', { panel_responses: 4, questions_with_panel: 2 }),
      ],
      5,
      FIXED,
    );
    const csv = referencePanelVolumeToCsv(report);
    const lines = parseLines(csv);
    const total = lines[lines.length - 1];
    const cells = total.split(',');
    const t = report.totals;
    // released, panel_responses, questions_with_panel, questions_coverage_pct
    // occupy the last four columns of the TOTAL row (family_name has no comma here).
    expect(cells).toContain(String(t.released));
    expect(cells).toContain(String(t.panel_responses));
    expect(cells).toContain(String(t.questions_with_panel));
    expect(cells).toContain(String(t.questions_coverage_pct));
  });
});
