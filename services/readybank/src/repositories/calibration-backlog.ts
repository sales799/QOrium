// Read-only per-skill-family calibration BACKLOG for the admin console (N8) and
// the calibration-volume program (N19). Single grouped round-trip over released
// readybank items, folded into the 13 buyer-facing families by the pure
// computeCalibrationBacklog() shaper.
//
// Scoped to the SAME released + readybank universe as the public psychometrics
// surface (repositories/psychometrics-stats.ts) and the per-family coverage
// repo (repositories/calibration-coverage.ts) so every calibration surface
// reconciles. No tenant data, no PII, no question content — only aggregate
// per-skill counts.

import type { Pool } from '@qorium/db';
import {
  computeCalibrationBacklog,
  type CalibrationBacklogReport,
  type SkillBacklogRow,
} from '../lib/calibration-backlog.js';

export async function getCalibrationBacklog(pool: Pool): Promise<CalibrationBacklogReport> {
  const result = await pool.query<{
    skill: string | null;
    released: string | null;
    with_irt_params: string | null;
    with_empirical_data: string | null;
  }>(
    `SELECT
       s.name                                                   AS skill,
       count(*)                                                 AS released,
       count(*) FILTER (WHERE q.difficulty_b IS NOT NULL)       AS with_irt_params,
       count(*) FILTER (WHERE COALESCE(q.calibration_n, 0) > 0) AS with_empirical_data
     FROM content.questions q
     JOIN content.skills s ON s.id = q.skill_id
     WHERE q.status = 'released' AND q.sku = 'readybank'
     GROUP BY s.name`,
  );
  const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);
  const rows: SkillBacklogRow[] = result.rows.map((r) => ({
    skill: r.skill ?? '',
    released: num(r.released),
    with_irt_params: num(r.with_irt_params),
    with_empirical_data: num(r.with_empirical_data),
  }));
  return computeCalibrationBacklog(rows);
}
