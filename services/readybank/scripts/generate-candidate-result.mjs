// Candidate Result Renderer v0 — generates a self-contained HTML result page.
// Deferred from Sprint 1.0 §7.5 (originally targeted for Sprint 1.1).
//
// What it does:
//   1. Pulls all responses for a (tenant, candidate_id) pair
//   2. Joins to content.questions for body/options/answer_key
//   3. Renders a single-file HTML report (inline CSS, no external assets)
//   4. Writes to /opt/apps/qorium/results/<candidate_id>-<ts>.html
//
// Usage: node --env-file=.env generate-candidate-result.mjs <candidate_id> [tenant_slug]

import { createPool } from "@qorium/db";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const candidateId = process.argv[2];
const tenantSlug = process.argv[3] || "talpro-india-customer-zero";
if (!candidateId) { console.error("usage: generate-candidate-result.mjs <candidate_id> [tenant_slug]"); process.exit(2); }

const c = createPool({ applicationName: "generate-candidate-result" });

const tenantRes = await c.query("SELECT id, name FROM app.tenants WHERE slug=$1", [tenantSlug]);
if (tenantRes.rowCount === 0) { console.error("tenant not found"); process.exit(2); }
const tenant = tenantRes.rows[0];

const responses = await c.query(`
  SELECT
    r.id, r.score, r.time_taken_ms, r.submitted_at,
    r.response_body,
    q.body_md, q.body_json, q.answer_key, q.format,
    ss.name AS sub_skill, sk.name AS skill
  FROM content.responses r
  JOIN content.questions q ON q.id = r.question_id
  LEFT JOIN content.sub_skills ss ON ss.id = q.sub_skill_id
  LEFT JOIN content.skills sk ON sk.id = q.skill_id
  WHERE r.tenant_id = $1 AND r.candidate_id = $2
  ORDER BY r.submitted_at ASC
`, [tenant.id, candidateId]);

if (responses.rowCount === 0) { console.error("no responses for", candidateId); await c.end(); process.exit(0); }

const totalScore = responses.rows.reduce((s, r) => s + Number(r.score), 0);
const maxScore = responses.rows.length * 5;
const pct = Math.round((totalScore / maxScore) * 100);
const passmark = Math.ceil(maxScore * 0.7);
const passed = totalScore >= passmark;
const totalTimeSec = Math.round(responses.rows.reduce((s, r) => s + r.time_taken_ms, 0) / 1000);
const skill = responses.rows[0].skill || "Skill Assessment";

const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>QOrium Result — ${esc(candidateId)}</title>
<style>
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; background: #F5F7FB; color: #0B1F3A; margin: 0; padding: 32px; }
  .card { max-width: 760px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 6px 24px rgba(11,31,58,0.10); overflow: hidden; }
  .header { background: #0B1F3A; color: #fff; padding: 28px 32px; }
  .header h1 { margin: 0 0 4px; font-size: 22px; font-weight: 700; letter-spacing: 0.4px; }
  .header .sub { color: #C7D7EC; font-size: 13px; }
  .accent { display: inline-block; background: #F4B860; color: #0B1F3A; padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 12px; }
  .summary { display: flex; padding: 24px 32px; gap: 32px; border-bottom: 1px solid #E5E7EB; }
  .summary .box { flex: 1; }
  .summary .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #8898B0; font-weight: 700; margin-bottom: 6px; }
  .summary .value { font-size: 28px; font-weight: 700; color: #0B1F3A; }
  .summary .value.pass { color: #16A34A; }
  .summary .value.fail { color: #DC2626; }
  .questions { padding: 16px 32px 32px; }
  .q { padding: 16px 0; border-bottom: 1px solid #F1F5F9; }
  .q:last-child { border-bottom: none; }
  .q .meta { font-size: 11px; color: #8898B0; margin-bottom: 6px; letter-spacing: 0.5px; }
  .q .body { font-size: 14px; color: #0B1F3A; margin-bottom: 8px; }
  .q .row { display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: #475569; }
  .q .verdict.correct { color: #16A34A; font-weight: 700; }
  .q .verdict.wrong { color: #DC2626; font-weight: 700; }
  .footer { padding: 16px 32px; background: #F8FAFC; border-top: 1px solid #E5E7EB; font-size: 11px; color: #8898B0; text-align: center; }
  .footer a { color: #475569; text-decoration: none; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="accent">QORIUM · CUSTOMER ZERO</div>
    <h1>Skill Assessment Result — ${esc(skill)}</h1>
    <div class="sub">${esc(tenant.name)} · ${esc(candidateId)} · ${new Date(responses.rows[0].submitted_at).toISOString().slice(0,10)}</div>
  </div>
  <div class="summary">
    <div class="box">
      <div class="label">Score</div>
      <div class="value ${passed?"pass":"fail"}">${totalScore} / ${maxScore}</div>
      <div class="label" style="margin-top:6px">${pct}% — ${passed?"PASS":"BELOW PASSMARK"}</div>
    </div>
    <div class="box">
      <div class="label">Questions</div>
      <div class="value">${responses.rowCount}</div>
      <div class="label" style="margin-top:6px">${responses.rows.filter(r=>Number(r.score)>0).length} correct</div>
    </div>
    <div class="box">
      <div class="label">Time</div>
      <div class="value">${Math.floor(totalTimeSec/60)}m ${totalTimeSec%60}s</div>
      <div class="label" style="margin-top:6px">~${Math.round(totalTimeSec/responses.rowCount)}s avg/Q</div>
    </div>
  </div>
  <div class="questions">
    ${responses.rows.map((r,i) => {
      const ext = r.body_json?.external_id || ("Q" + (i+1));
      const correct = r.answer_key?.correct;
      const selected = r.response_body?.selected_option;
      const isCorrect = Number(r.score) > 0;
      return `<div class="q">
        <div class="meta">${esc(ext)} · ${esc(r.sub_skill || "—")} · ${esc(r.format)}</div>
        <div class="body">${esc((r.body_md || "").slice(0, 220))}${(r.body_md||"").length>220?"…":""}</div>
        <div class="row">
          <span>Selected: <strong>${esc(selected||"—")}</strong> · Correct: <strong>${esc(correct||"—")}</strong> · ${Math.round(r.time_taken_ms/1000)}s</span>
          <span class="verdict ${isCorrect?"correct":"wrong"}">${isCorrect?"+5":"+0"}</span>
        </div>
      </div>`;
    }).join("\n")}
  </div>
  <div class="footer">
    Powered by <a href="https://api.qorium.online">QOrium</a> · Question-Bank-as-a-Service · Talpro India Pvt Ltd
  </div>
</div>
</body>
</html>`;

mkdirSync("/opt/apps/qorium/results", { recursive: true });
const out = "/opt/apps/qorium/results/" + candidateId + "-" + Date.now() + ".html";
writeFileSync(out, html, "utf8");
console.log("Wrote " + out + " (" + html.length + " bytes)");
console.log("  candidate: " + candidateId);
console.log("  total:     " + totalScore + "/" + maxScore + " (" + pct + "%) " + (passed ? "PASS" : "FAIL"));
console.log("  questions: " + responses.rowCount + " (" + responses.rows.filter(r=>Number(r.score)>0).length + " correct)");

await c.end();
