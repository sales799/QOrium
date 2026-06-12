// Read-only per-skill-family calibration coverage for the admin console (N8).
// Single grouped round-trip over released readybank items, folded into the 13
// buyer-facing families by the pure computeCalibrationCoverage() shaper.
//
// Scoped to the SAME released + readybank universe as the public psychometrics
// surface (repositories/psychometrics-stats.ts) so the admin breakdown
// reconciles with the public platform-wide totals. No tenant data, no PII, no
// question content — only aggregate per-skill counts.

import type { Pool } from '@qorium/db';
import {
  computeCalibrationCoverage,
  type CalibrationCoverageReport,
  type SkillCalibrationRow,
} from '../lib/calibration-coverage.js';

export async function getCalibrationCoverage(pool: Pool): Promise<CalibrationCoverageReport> {
  const result = await pool.query<{
    skill: string | null;
    released: string | null;
    with_irt_params: string | null;
    with_empirical_data: string | null;
    refit_ready: string | null;
  }>(
    `SELECT
       s.name                                                     AS skill,
       count(*)                                                   AS released,
       count(*) FILTER (WHERE q.difficulty_b IS NOT NULL)         AS with_irt_params,
       count(*) FILTER (WHERE COALESCE(q.calibration_n, 0) > 0)   AS with_empirical_data,
       count(*) FILTER (WHERE COALESCE(q.calibration_n, 0) >= 30) AS refit_ready
     FROM content.questions q
     JOIN content.skills s ON s.id = q.skill_id
     WHERE q.status = 'released' AND q.sku = 'readybank'
     GROUP BY s.name`,
  );
  const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);
  const rows: SkillCalibrationRow[] = result.rows.map((r) => ({
    skill: r.skill ?? '',
    released: num(r.released),
    with_irt_params: num(r.with_irt_params),
    with_empirical_data: num(r.with_empirical_data),
    refit_ready: num(r.refit_ready),
  }));
  return computeCalibrationCoverage(rows);
}
