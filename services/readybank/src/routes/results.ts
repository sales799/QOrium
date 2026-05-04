// /v1/results — candidate result pages (HTML + JSON)
// Sprint 1.2 (Run #26). Closes Sprint 1.0 §7.5 deferred item.
//
// GET /v1/results/:candidateId           — HTML render (default; suitable for emailing)
// GET /v1/results/:candidateId?format=json  — JSON payload (programmatic)
//
// Tenant scope: queried against req.auth.tenantId from auth middleware.

import { Router } from 'express';
import type { Pool } from '@qorium/db';
import type { AuthenticatedRequest } from '@qorium/auth';
import { HttpProblem } from '../middleware/problem.js';

const ESCAPE_MAP: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };
function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ESCAPE_MAP[c]!);
}

const CANDIDATE_ID_PATTERN = /^[A-Za-z0-9_-]{1,100}$/;

export interface ResultsRouterDeps {
  pool: Pool;
}

interface ResultRow {
  id: string;
  score: string | number;
  time_taken_ms: number;
  submitted_at: Date;
  response_body: { selected_option?: string; is_correct?: boolean; [k: string]: unknown };
  body_md: string;
  body_json: { external_id?: string; options?: Array<{ key: string; text: string }>; [k: string]: unknown };
  answer_key: { correct?: string } | null;
  format: string;
  sub_skill: string | null;
  skill: string | null;
}

export function resultsRouter(deps: ResultsRouterDeps): Router {
  const router = Router();

  router.get('/results/:candidateId', async (req, res, next) => {
    try {
      const auth = (req as AuthenticatedRequest).auth;
      if (!auth) {
        return next(new HttpProblem({ status: 401, title: 'Unauthorized', detail: 'API key required' }));
      }

      const candidateId = req.params.candidateId;
      const wantsJson = req.query.format === 'json' || (typeof req.headers.accept === 'string' && req.headers.accept.includes('application/json'));

      if (!CANDIDATE_ID_PATTERN.test(candidateId)) {
        return next(new HttpProblem({ status: 400, title: 'Invalid candidate ID', detail: 'candidate_id must match [A-Za-z0-9_-]{1,100}' }));
      }

      const result = await deps.pool.query<ResultRow>(
        `SELECT
           r.id, r.score, r.time_taken_ms, r.submitted_at, r.response_body,
           q.body_md, q.body_json, q.answer_key, q.format,
           ss.name AS sub_skill, sk.name AS skill
         FROM content.responses r
         JOIN content.questions q ON q.id = r.question_id
         LEFT JOIN content.sub_skills ss ON ss.id = q.sub_skill_id
         LEFT JOIN content.skills sk ON sk.id = q.skill_id
         WHERE r.tenant_id = $1 AND r.candidate_id = $2
         ORDER BY r.submitted_at ASC`,
        [auth.tenantId, candidateId]
      );

      if (result.rowCount === 0) {
        return next(new HttpProblem({ status: 404, title: 'No responses for this candidate', detail: candidateId }));
      }

      const rows = result.rows;
      const totalScore = rows.reduce((s, r) => s + Number(r.score), 0);
      const maxScore = rows.length * 5;
      const pct = Math.round((totalScore / maxScore) * 100);
      const passmark = Math.ceil(maxScore * 0.7);
      const passed = totalScore >= passmark;
      const totalTimeSec = Math.round(rows.reduce((s, r) => s + r.time_taken_ms, 0) / 1000);
      const skillName = rows[0]!.skill || 'Skill Assessment';
      const correctCount = rows.filter((r) => Number(r.score) > 0).length;

      if (wantsJson) {
        res.setHeader('Cache-Control', 'no-store');
        res.json({
          candidate_id: candidateId,
          tenant_id: auth.tenantId,
          skill: skillName,
          score: { total: totalScore, max: maxScore, percent: pct, pass: passed, passmark },
          time_seconds: totalTimeSec,
          questions: rows.map((r) => ({
            external_id: r.body_json?.external_id,
            sub_skill: r.sub_skill,
            format: r.format,
            selected: r.response_body?.selected_option,
            correct: r.answer_key?.correct,
            is_correct: Number(r.score) > 0,
            score: Number(r.score),
            time_seconds: Math.round(r.time_taken_ms / 1000),
            submitted_at: r.submitted_at,
          })),
        });
        return;
      }

      const html = renderHtml({
        candidateId,
        skillName,
        rows,
        totalScore,
        maxScore,
        pct,
        passed,
        totalTimeSec,
        correctCount,
      });

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(html);
    } catch (err) {
      next(err);
    }
  });

  return router;
}

interface RenderArgs {
  candidateId: string;
  skillName: string;
  rows: ResultRow[];
  totalScore: number;
  maxScore: number;
  pct: number;
  passed: boolean;
  totalTimeSec: number;
  correctCount: number;
}

function renderHtml(a: RenderArgs): string {
  const dateStr = new Date(a.rows[0]!.submitted_at).toISOString().slice(0, 10);
  const qs = a.rows
    .map((r, i) => {
      const ext = r.body_json?.external_id || `Q${i + 1}`;
      const correct = r.answer_key?.correct;
      const selected = r.response_body?.selected_option;
      const isCorrect = Number(r.score) > 0;
      const body = (r.body_md || '').slice(0, 220);
      const ellipsis = (r.body_md || '').length > 220 ? '…' : '';
      return `<div class="q">
        <div class="meta">${esc(ext)} · ${esc(r.sub_skill || '—')} · ${esc(r.format)}</div>
        <div class="body">${esc(body)}${ellipsis}</div>
        <div class="row">
          <span>Selected: <strong>${esc(selected || '—')}</strong> · Correct: <strong>${esc(correct || '—')}</strong> · ${Math.round(r.time_taken_ms / 1000)}s</span>
          <span class="verdict ${isCorrect ? 'correct' : 'wrong'}">${isCorrect ? '+5' : '+0'}</span>
        </div>
      </div>`;
    })
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>QOrium Result — ${esc(a.candidateId)}</title>
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
    <h1>Skill Assessment Result — ${esc(a.skillName)}</h1>
    <div class="sub">${esc(a.candidateId)} · ${dateStr}</div>
  </div>
  <div class="summary">
    <div class="box">
      <div class="label">Score</div>
      <div class="value ${a.passed ? 'pass' : 'fail'}">${a.totalScore} / ${a.maxScore}</div>
      <div class="label" style="margin-top:6px">${a.pct}% — ${a.passed ? 'PASS' : 'BELOW PASSMARK'}</div>
    </div>
    <div class="box">
      <div class="label">Questions</div>
      <div class="value">${a.rows.length}</div>
      <div class="label" style="margin-top:6px">${a.correctCount} correct</div>
    </div>
    <div class="box">
      <div class="label">Time</div>
      <div class="value">${Math.floor(a.totalTimeSec / 60)}m ${a.totalTimeSec % 60}s</div>
      <div class="label" style="margin-top:6px">~${Math.round(a.totalTimeSec / a.rows.length)}s avg/Q</div>
    </div>
  </div>
  <div class="questions">
    ${qs}
  </div>
  <div class="footer">
    Powered by <a href="https://api.qorium.online">QOrium</a> · Question-Bank-as-a-Service · Talpro India Pvt Ltd
  </div>
</div>
</body>
</html>`;
}
