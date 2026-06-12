// Read-only per-skill-family reference-panel response-volume for the admin
// console (N8) and the calibration-volume program (N19). Three small grouped
// round-trips over the SAME released + readybank universe as the public
// psychometrics surface (repositories/psychometrics-stats.ts) and the
// per-family calibration coverage (repositories/calibration-coverage.ts), so
// the volume breakdown reconciles with the other admin surfaces.
//
// Released and panel counts are pulled in separate grouped queries (rather than
// one LEFT JOIN) to avoid join fan-out inflating the per-skill response counts.
// distinct_panelists is a single scalar — panelist identity spans skills and is
// not family-additive, so it is reported once at the platform level. No tenant
// data, no PII, no question content — only aggregate counts.

import type { Pool } from '@qorium/db';
import {
  computeReferencePanelVolume,
  type ReferencePanelVolumeReport,
  type SkillReleasedRow,
  type SkillPanelRow,
} from '../lib/reference-panel-volume.js';

export async function getReferencePanelVolume(pool: Pool): Promise<ReferencePanelVolumeReport> {
  const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);

  const released = await pool.query<{ skill: string | null; released: string | null }>(
    `SELECT s.name AS skill, count(*) AS released
       FROM content.questions q
       JOIN content.skills s ON s.id = q.skill_id
      WHERE q.status = 'released' AND q.sku = 'readybank'
      GROUP BY s.name`,
  );

  const panel = await pool.query<{
    skill: string | null;
    panel_responses: string | null;
    questions_with_panel: string | null;
  }>(
    `SELECT s.name                          AS skill,
            count(*)                        AS panel_responses,
            count(DISTINCT r.question_id)   AS questions_with_panel
       FROM content.responses r
       JOIN content.questions q ON q.id = r.question_id
       JOIN content.skills s    ON s.id = q.skill_id
      WHERE r.is_reference_panel = TRUE
        AND q.status = 'released' AND q.sku = 'readybank'
      GROUP BY s.name`,
  );

  const scalar = await pool.query<{ distinct_panelists: string | null }>(
    `SELECT count(DISTINCT r.candidate_id) AS distinct_panelists
       FROM content.responses r
       JOIN content.questions q ON q.id = r.question_id
      WHERE r.is_reference_panel = TRUE
        AND q.status = 'released' AND q.sku = 'readybank'`,
  );

  const releasedRows: SkillReleasedRow[] = released.rows.map((r) => ({
    skill: r.skill ?? '',
    released: num(r.released),
  }));
  const panelRows: SkillPanelRow[] = panel.rows.map((r) => ({
    skill: r.skill ?? '',
    panel_responses: num(r.panel_responses),
    questions_with_panel: num(r.questions_with_panel),
  }));
  const distinctPanelists = num(scalar.rows[0]?.distinct_panelists);

  return computeReferencePanelVolume(releasedRows, panelRows, distinctPanelists);
}
