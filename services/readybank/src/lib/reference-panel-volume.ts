// Pure per-skill-family reference-panel response VOLUME shaping for the admin
// console (N8) and the calibration-volume program (N19).
//
// The calibration-coverage surface (lib/calibration-coverage.ts) reports, per
// family, how many released items have ANY empirical data. It answers "how many
// items are calibrated?" but not "how much panel data have we actually
// collected, and from how many panelists?". That second question is the direct
// progress meter for N19: the reference panel (POST /v1/reference-panel/
// responses) is the mechanism that lifts items out of the cold-loop, so the
// operator needs to see ingestion VOLUME per family — total panel responses and
// how many released items each family's panel data now touches.
//
// DB-free so it can be unit-tested exhaustively without a pool; the route stays
// a thin adapter over the repository's grouped counts. Released counts and panel
// counts arrive as separate additive per-skill inputs (each content.question has
// exactly one skill_id, so both sum cleanly across families); distinct-panelist
// identity spans skills and cannot be additively folded, so it is reported once
// at the platform level from a dedicated scalar count.

import {
  SKILL_FAMILIES,
  familyForSkill,
  familyName,
  type SkillFamilyId,
} from './skill-families.js';
import { coveragePct } from './psychometrics-coverage.js';

/** Released, readybank-SKU question count for a single skill. */
export interface SkillReleasedRow {
  skill: string;
  released: number;
}

/** Reference-panel ingestion counts for a single skill. */
export interface SkillPanelRow {
  skill: string;
  /** content.responses rows with is_reference_panel = TRUE for this skill. */
  panel_responses: number;
  /** Distinct released items in this skill that have any panel response. */
  questions_with_panel: number;
}

export interface FamilyPanelVolume {
  family: SkillFamilyId;
  family_name: string;
  released: number;
  panel_responses: number;
  questions_with_panel: number;
  /** questions_with_panel / released, integer percent clamped to [0,100]. */
  questions_coverage_pct: number;
}

export interface ReferencePanelVolumeReport {
  families: FamilyPanelVolume[];
  totals: {
    released: number;
    panel_responses: number;
    questions_with_panel: number;
    questions_coverage_pct: number;
    /** Platform-wide distinct panelists (candidate_id), not family-additive. */
    distinct_panelists: number;
  };
  generated_at: string;
}

/** Clamp to a non-negative integer; treats NaN / negatives / junk as 0. */
function clampCount(v: number): number {
  return Number.isFinite(v) && v > 0 ? Math.floor(v) : 0;
}

interface Acc {
  released: number;
  panel_responses: number;
  questions_with_panel: number;
}

function emptyAcc(): Acc {
  return { released: 0, panel_responses: 0, questions_with_panel: 0 };
}

/**
 * Fold raw per-skill released + panel counts into the 13 canonical families.
 * Every family is present even with zero panel data, so the operator sees the
 * cold-loop gaps (a family at 0 panel_responses) rather than a silently-absent
 * row. questions_with_panel is clamped to the family's released total so the
 * coverage percentage never exceeds 100. Sorted by panel_responses descending
 * (where real calibration data is concentrated first), tie-broken by released
 * volume then family id for deterministic output.
 */
export function computeReferencePanelVolume(
  releasedRows: SkillReleasedRow[],
  panelRows: SkillPanelRow[],
  distinctPanelists: number,
  now: Date = new Date(),
): ReferencePanelVolumeReport {
  const byFamily = new Map<SkillFamilyId, Acc>();
  for (const fam of SKILL_FAMILIES) byFamily.set(fam.id, emptyAcc());

  for (const row of releasedRows) {
    const acc = byFamily.get(familyForSkill(row.skill));
    if (!acc) continue;
    acc.released += clampCount(row.released);
  }
  for (const row of panelRows) {
    const acc = byFamily.get(familyForSkill(row.skill));
    if (!acc) continue;
    acc.panel_responses += clampCount(row.panel_responses);
    acc.questions_with_panel += clampCount(row.questions_with_panel);
  }

  const totals = emptyAcc();
  const families: FamilyPanelVolume[] = [];
  for (const fam of SKILL_FAMILIES) {
    const acc = byFamily.get(fam.id);
    if (!acc) continue;
    const released = acc.released;
    const questionsWithPanel = Math.min(acc.questions_with_panel, released);
    const panelResponses = acc.panel_responses;
    totals.released += released;
    totals.panel_responses += panelResponses;
    totals.questions_with_panel += questionsWithPanel;
    families.push({
      family: fam.id,
      family_name: familyName(fam.id),
      released,
      panel_responses: panelResponses,
      questions_with_panel: questionsWithPanel,
      questions_coverage_pct: coveragePct(questionsWithPanel, released),
    });
  }

  families.sort(
    (a, b) =>
      b.panel_responses - a.panel_responses ||
      b.released - a.released ||
      a.family.localeCompare(b.family),
  );

  return {
    families,
    totals: {
      released: totals.released,
      panel_responses: totals.panel_responses,
      questions_with_panel: totals.questions_with_panel,
      questions_coverage_pct: coveragePct(totals.questions_with_panel, totals.released),
      distinct_panelists: clampCount(distinctPanelists),
    },
    generated_at: now.toISOString(),
  };
}
