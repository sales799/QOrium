// Read-only aggregate metrics backing the public psychometrics-coverage surface
// (N19 calibration-volume / N13 proof engine). Platform-wide counts only — NO
// tenant breakdown, NO candidate PII, NO question content. They are exactly the
// numbers a public "is this actually psychometrically defensible?" page wants to
// cite, and they degrade honestly (a brand-new bank shows 0% coverage).
//
// "Released" is scoped to the readybank SKU so the figure matches the live
// assessment bank, consistent with proof-stats.questions_released.

import type { Pool } from '@qorium/db';
import { computeCoverage, type PsychometricsCoverage } from '../lib/psychometrics-coverage.js';

/**
 * Pull the four coverage counts in a single round trip via scalar subqueries,
 * then shape them through the pure {@link computeCoverage} helper. The IRT-param
 * and empirical-data sub-counts are scoped to the SAME released/readybank
 * universe as the denominator so the percentages are internally consistent.
 */
export async function getPsychometricsCoverage(pool: Pool): Promise<PsychometricsCoverage> {
  const result = await pool.query<{
    questions_released: string | null;
    with_irt_params: string | null;
    with_empirical_data: string | null;
    refit_ready: string | null;
  }>(
    `SELECT
       count(*)                                               AS questions_released,
       count(*) FILTER (WHERE difficulty_b IS NOT NULL)       AS with_irt_params,
       count(*) FILTER (WHERE COALESCE(calibration_n, 0) > 0) AS with_empirical_data,
       count(*) FILTER (WHERE COALESCE(calibration_n, 0) >= 30) AS refit_ready
     FROM content.questions
     WHERE status = 'released' AND sku = 'readybank'`,
  );
  const row = result.rows[0];
  const num = (v: string | null | undefined): number => (v != null ? Number(v) : 0);
  return computeCoverage({
    questions_released: num(row?.questions_released),
    with_irt_params: num(row?.with_irt_params),
    with_empirical_data: num(row?.with_empirical_data),
    refit_ready: num(row?.refit_ready),
  });
}
