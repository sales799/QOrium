// Read-only per-skill-family calibration READINESS for the calibration-volume
// program (N19). Single grouped round-trip over released readybank items,
// folded into the 13 buyer-facing families and tiered (calibrated / thin /
// cold) against the BR-4 refit threshold by the pure
// computeCalibrationReadiness() shaper.
//
// Scoped to the SAME released + readybank universe as the public psychometrics
// surface (repositories/psychometrics-stats.ts), the per-family coverage repo
// (repositories/calibration-coverage.ts), and the cold-backlog repo
// (repositories/calibration-backlog.ts) so every calibration surface
// reconciles. No tenant data, no PII, no question content — only aggregate
// per-skill counts.

import type { Pool } from '@qorium/db';
import {
  computeCalibrationReadiness,
  REFIT_THRESHOLD,
  type CalibrationReadinessReport,
  type SkillReadinessRow,
} from '../lib/calibration-readiness.js';

export async function getCalibrationReadiness(pool: Pool): Promise<CalibrationReadinessReport> {
  const result = await pool.query<{
    skill: string | null;
    released: string | null;
    with_irt_params: string | null;
    refit_ready: string | null;
    thin: string | null;
  }>(
    `SELECT
       s.name AS skill,
       count(*) AS released,
       count(*) FILTER (WHERE q.difficulty_b IS NOT NULL) AS with_irt_params,
       count(*) FILTER (
         WHERE q.difficulty_b IS NOT NULL
           AND COALESCE(q.calibration_n, 0) >= $1
       ) AS refit_ready,
       count(*) FILTER (
         WHERE q.difficulty_b IS NOT NULL
           AND COALESCE(q.calibration_n, 0) > 0
           AND COALESCE(q.calibration_n, 0) < $1
       ) AS thin
     FROM content.questions q
     JOIN content.skills s ON s.id = q.skill_id
     WHERE q.status = 'released' AND q.sku = 'readybank'
     GROUP BY s.name`,
    [REFIT_THRESHOLD],
  );
  const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);
  const rows: SkillReadinessRow[] = result.rows.map((r) => ({
    skill: r.skill ?? '',
    released: num(r.released),
    with_irt_params: num(r.with_irt_params),
    refit_ready: num(r.refit_ready),
    thin: num(r.thin),
  }));
  return computeCalibrationReadiness(rows);
}
