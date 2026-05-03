// IRT Calibration v0 — empirical pass-rate and discrimination per question.
//
// Per Constitution SO-21 (IRT mandatory). v0 computes the empirical pass-rate
// (P) per question from content.responses; stamps content.questions.empirical_pass_rate.
// Full 3PL (b/a/c) calibration via girth library is Sprint 1.2 — needs N≥30 per
// question. This v0 is the data plumbing that makes that Sprint 1.2 step trivial.
//
// Decision: skips items with calibration_n < 5 (defaults to 0 for new items).
// Updates calibration_n with the count of distinct candidate responses.
//
// Usage: node --env-file=.env irt-calibration-batch.mjs [--min-n N]

import { createPool } from "@qorium/db";

const minN = (() => {
  const idx = process.argv.indexOf("--min-n");
  return idx > 0 ? parseInt(process.argv[idx + 1], 10) : 5;
})();

const c = createPool({ applicationName: "irt-calibration-batch" });

console.log("[irt] running calibration batch (min-n=" + minN + ")");

await c.query("BEGIN");
try {
  // Compute per-question stats from content.responses
  const stats = await c.query(`
    SELECT
      r.question_id,
      COUNT(*) AS n,
      COUNT(DISTINCT r.candidate_id) AS distinct_candidates,
      AVG(CASE WHEN (r.response_body->>'is_correct')::boolean THEN 1 ELSE 0 END) AS pass_rate,
      AVG(r.time_taken_ms)::int AS avg_time_ms
    FROM content.responses r
    GROUP BY r.question_id
  `);

  let updated = 0, skipped = 0;
  for (const row of stats.rows) {
    if (row.n < minN) {
      skipped++;
      continue;
    }
    await c.query(
      "UPDATE content.questions SET empirical_pass_rate=$1, calibration_n=$2, updated_at=NOW() WHERE id=$3",
      [Number(row.pass_rate).toFixed(3), row.n, row.question_id]
    );
    updated++;
  }

  await c.query("COMMIT");

  console.log("[irt] examined: " + stats.rowCount + " items");
  console.log("[irt] updated:  " + updated + " items (n >= " + minN + ")");
  console.log("[irt] skipped:  " + skipped + " items (n < " + minN + ")");

  if (stats.rowCount > 0) {
    console.log();
    console.log("Per-question stats:");
    for (const row of stats.rows.slice(0, 20)) {
      console.log("  " + row.question_id.slice(0, 8) + "...  n=" + row.n
        + "  pass=" + Number(row.pass_rate).toFixed(2)
        + "  avg_ms=" + row.avg_time_ms);
    }
  }
} catch (e) {
  await c.query("ROLLBACK");
  console.error("[irt] FAIL:", e.message);
  process.exit(3);
} finally {
  await c.end();
}
