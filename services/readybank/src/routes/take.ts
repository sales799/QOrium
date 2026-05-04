// /take/:session_token — public unauthenticated take-assessment surface.
// Sprint 1.3 (Run #29).
//
// GET  /take/:token                 -> HTML page (single-page, vanilla JS, inline CSS)
// GET  /take/:token/api/state       -> JSON {candidate_id, current_index, total, status, question?}
// POST /take/:token/api/answer      -> body {selected_key, time_taken_ms}; returns {is_correct, score, current_index, total, status}
// GET  /take/:token/api/result      -> JSON full result (mirrors /v1/results format)
//
// Auth: the bearer secret is the session_token in the URL itself. Long random
// hex (64 chars). Sessions expire in 48h; revocable via app.sessions.status.

import { Router } from 'express';
import type { Pool } from '@qorium/db';
import { applyWatermark, unwatermarkAnswer } from '../lib/watermark.js';
import { getQuestionByUuid } from '../repositories/questions.js';

const TOKEN_PATTERN = /^[a-f0-9]{64}$/;

export interface TakeRouterDeps {
  pool: Pool;
}

interface SessionRow {
  id: string;
  tenant_id: string;
  candidate_id: string;
  question_ids: string[];
  current_index: number;
  status: string;
  pack_name: string | null;
  expires_at: Date;
  started_at: Date | null;
}

function esc(s: unknown): string {
  return String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
}

async function loadSession(pool: Pool, token: string): Promise<SessionRow | null> {
  if (!TOKEN_PATTERN.test(token)) return null;
  const r = await pool.query<SessionRow>(
    `SELECT id, tenant_id, candidate_id, question_ids, current_index, status, pack_name, expires_at, started_at
     FROM app.sessions WHERE session_token = $1 LIMIT 1`,
    [token]
  );
  return r.rows[0] ?? null;
}

function sessionStatusOK(s: SessionRow): boolean {
  if (s.status !== 'pending' && s.status !== 'in_progress') return false;
  if (new Date(s.expires_at) < new Date()) return false;
  return true;
}

export function takeRouter(deps: TakeRouterDeps): Router {
  const router = Router();

  // Static HTML page (single self-contained client; vanilla JS + inline CSS)
  router.get('/take/:token', async (req, res, next) => {
    try {
      const session = await loadSession(deps.pool, req.params.token);
      if (!session) { res.status(404).type('text/plain').send('Session not found'); return; }
      if (new Date(session.expires_at) < new Date()) { res.status(410).type('text/plain').send('Session expired'); return; }
      if (session.status === 'revoked' || session.status === 'completed') {
        res.redirect(`/take/${req.params.token}/result`);
        return;
      }
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(takePageHtml(req.params.token, session));
    } catch (err) { next(err); }
  });

  // Result page (HTML; also accessible after completion)
  router.get('/take/:token/result', async (req, res, next) => {
    try {
      const session = await loadSession(deps.pool, req.params.token);
      if (!session) { res.status(404).type('text/plain').send('Session not found'); return; }
      // Reuse the result-rendering logic via a tenant-scoped query.
      const result = await deps.pool.query(
        `SELECT r.id, r.score, r.time_taken_ms, r.submitted_at, r.response_body,
                q.body_md, q.body_json, q.answer_key, q.format,
                ss.name AS sub_skill, sk.name AS skill
         FROM content.responses r
         JOIN content.questions q ON q.id = r.question_id
         LEFT JOIN content.sub_skills ss ON ss.id = q.sub_skill_id
         LEFT JOIN content.skills sk ON sk.id = q.skill_id
         WHERE r.tenant_id = $1 AND r.candidate_id = $2
         ORDER BY r.submitted_at ASC`,
        [session.tenant_id, session.candidate_id]
      );
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(resultPageHtml(session, result.rows));
    } catch (err) { next(err); }
  });

  // API: get current state + next question (watermarked)
  router.get('/take/:token/api/state', async (req, res, next) => {
    try {
      const session = await loadSession(deps.pool, req.params.token);
      if (!session) { res.status(404).json({ error: 'session_not_found' }); return; }
      if (!sessionStatusOK(session)) { res.status(410).json({ error: 'session_unavailable', status: session.status }); return; }
      const total = session.question_ids.length;
      if (session.current_index >= total) {
        await deps.pool.query("UPDATE app.sessions SET status='completed', completed_at=NOW() WHERE id=$1 AND status<>'completed'", [session.id]);
        res.json({ candidate_id: session.candidate_id, current_index: total, total, status: 'completed' });
        return;
      }
      const qid = session.question_ids[session.current_index]!;
      const q = await getQuestionByUuid(deps.pool, qid);
      if (!q) { res.status(500).json({ error: 'question_missing', qid }); return; }
      const original = (q.body_json as { options?: Array<{ key: string; text: string }> }).options || [];
      const wm = applyWatermark(q.uuid, session.candidate_id, original);

      // Mark started_at on first question fetch
      if (session.current_index === 0 && session.status === 'pending') {
        await deps.pool.query("UPDATE app.sessions SET status='in_progress', started_at=NOW() WHERE id=$1", [session.id]);
      }

      res.json({
        candidate_id: session.candidate_id,
        current_index: session.current_index,
        total,
        status: session.current_index === 0 ? 'in_progress' : session.status,
        question: {
          uuid: q.uuid,
          body_md: q.body_md,
          format: q.format,
          options: wm.options,
          watermark_seed: wm.watermarkSeed,
          title: (q.body_json as { title?: string }).title,
        },
      });
    } catch (err) { next(err); }
  });

  // API: submit an answer; grade + persist + advance
  router.post('/take/:token/api/answer', async (req, res, next) => {
    try {
      const session = await loadSession(deps.pool, req.params.token);
      if (!session) { res.status(404).json({ error: 'session_not_found' }); return; }
      if (!sessionStatusOK(session)) { res.status(410).json({ error: 'session_unavailable', status: session.status }); return; }
      const total = session.question_ids.length;
      if (session.current_index >= total) { res.status(400).json({ error: 'already_completed' }); return; }

      const body = req.body as { selected_key?: unknown; time_taken_ms?: unknown };
      const selectedKey = typeof body.selected_key === 'string' ? body.selected_key.toUpperCase() : null;
      const timeMs = typeof body.time_taken_ms === 'number' && body.time_taken_ms >= 0 ? Math.floor(body.time_taken_ms) : 0;
      if (!selectedKey || !/^[A-Z]$/.test(selectedKey)) { res.status(400).json({ error: 'invalid_selected_key' }); return; }

      const qid = session.question_ids[session.current_index]!;
      const q = await getQuestionByUuid(deps.pool, qid);
      if (!q) { res.status(500).json({ error: 'question_missing', qid }); return; }
      // Fetch answer_key separately — QuestionPublic intentionally omits it for security.
      const akRes = await deps.pool.query<{ answer_key: { correct?: string } | null }>(
        `SELECT answer_key FROM content.questions WHERE id = $1 LIMIT 1`,
        [qid]
      );
      const correctKey = akRes.rows[0]?.answer_key?.correct ?? null;

      // Re-derive watermark to get inverse map (deterministic)
      const original = (q.body_json as { options?: Array<{ key: string; text: string }> }).options || [];
      const wm = applyWatermark(q.uuid, session.candidate_id, original);
      const canonicalSelected = unwatermarkAnswer(selectedKey, wm.inverseMap);
      const isCorrect = correctKey != null && canonicalSelected === correctKey;
      const score = isCorrect ? 5 : 0;

      const responseBody = {
        external_question_id: (q.body_json as { external_id?: string }).external_id || null,
        selected_option: selectedKey,
        canonical_selected: canonicalSelected,
        correct_option: correctKey,
        is_correct: isCorrect,
        watermark_seed: wm.watermarkSeed,
        submitted_via: 'qorium-take-public',
      };

      const startedAt = session.started_at ?? new Date();
      await deps.pool.query(
        `INSERT INTO content.responses (question_id, tenant_id, candidate_id, response_body, score, time_taken_ms, started_at, submitted_at)
         VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7, NOW())`,
        [q.uuid, session.tenant_id, session.candidate_id, JSON.stringify(responseBody), score, timeMs, startedAt]
      );

      const newIndex = session.current_index + 1;
      const newStatus = newIndex >= total ? 'completed' : 'in_progress';
      await deps.pool.query(
        `UPDATE app.sessions SET current_index=$1, status=$2::varchar, completed_at = CASE WHEN $2::text='completed' THEN NOW() ELSE completed_at END WHERE id=$3`,
        [newIndex, newStatus, session.id]
      );

      res.json({
        is_correct: isCorrect,
        score,
        max_points: 5,
        current_index: newIndex,
        total,
        status: newStatus,
      });
    } catch (err) { next(err); }
  });

  return router;
}

// ----------------------------------------------------------------------------
// HTML: take-assessment single page (vanilla JS + inline CSS)
// ----------------------------------------------------------------------------
function takePageHtml(token: string, session: SessionRow): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QOrium Assessment — ${esc(session.candidate_id)}</title>
<style>
  :root { --navy:#0B1F3A; --ice:#C7D7EC; --amber:#F4B860; --green:#16A34A; --red:#DC2626; --bg:#F5F7FB; --card:#fff; --muted:#8898B0; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Helvetica Neue", Arial, sans-serif; background: var(--bg); color: var(--navy); margin: 0; padding: 24px; min-height: 100vh; }
  .card { max-width: 760px; margin: 0 auto; background: var(--card); border-radius: 12px; box-shadow: 0 6px 24px rgba(11,31,58,0.10); overflow: hidden; }
  .header { background: var(--navy); color: #fff; padding: 24px 28px; }
  .accent { display: inline-block; background: var(--amber); color: var(--navy); padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; letter-spacing: 1.5px; }
  h1 { margin: 8px 0 4px; font-size: 20px; font-weight: 700; }
  .sub { color: var(--ice); font-size: 13px; }
  .progress { padding: 12px 28px; background: #F8FAFC; font-size: 13px; color: var(--muted); display: flex; justify-content: space-between; align-items: center; }
  .progress .bar { flex: 1; height: 6px; background: #E5E7EB; border-radius: 3px; margin: 0 16px; overflow: hidden; }
  .progress .bar > i { display: block; height: 100%; background: var(--amber); width: 0%; transition: width 220ms ease; }
  .body { padding: 28px; }
  #question-body { font-size: 16px; line-height: 1.55; color: var(--navy); margin-bottom: 24px; white-space: pre-wrap; }
  .opts { display: grid; gap: 12px; }
  .opts button { text-align: left; padding: 14px 16px; border: 2px solid #E5E7EB; background: #fff; border-radius: 8px; font-size: 14px; line-height: 1.4; cursor: pointer; transition: 120ms; }
  .opts button:hover { border-color: var(--navy); }
  .opts button.selected { border-color: var(--amber); background: #FEF3DC; }
  .opts button .k { display: inline-block; min-width: 28px; font-weight: 700; color: var(--navy); }
  .actions { padding: 0 28px 28px; display: flex; justify-content: space-between; align-items: center; }
  .timer { font-variant-numeric: tabular-nums; color: var(--muted); font-size: 12px; }
  button.primary { background: var(--navy); color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; }
  button.primary:disabled { opacity: 0.4; cursor: not-allowed; }
  .footer { padding: 14px 28px; background: #F8FAFC; border-top: 1px solid #E5E7EB; font-size: 11px; color: var(--muted); text-align: center; }
  #toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: var(--navy); color: #fff; padding: 10px 16px; border-radius: 8px; font-size: 13px; opacity: 0; transition: 200ms; pointer-events: none; }
  #toast.show { opacity: 1; }
  .complete { padding: 48px 28px; text-align: center; }
  .complete h2 { font-size: 24px; margin: 0 0 12px; }
</style>
</head>
<body>
<div class="card">
  <div class="header">
    <div class="accent">QORIUM ASSESSMENT</div>
    <h1>${esc(session.pack_name || 'Skill Assessment')}</h1>
    <div class="sub">Candidate ID: <code>${esc(session.candidate_id)}</code></div>
  </div>
  <div class="progress" id="progress">
    <span id="progress-text">Loading…</span>
    <div class="bar"><i id="progress-bar"></i></div>
    <span class="timer" id="timer">0s</span>
  </div>
  <div class="body" id="body">
    <div id="question-body">Preparing your assessment…</div>
    <div class="opts" id="opts"></div>
  </div>
  <div class="actions">
    <span class="sub" style="color:var(--muted);font-size:12px">Your answer is auto-saved on submit. The link is single-use; finish in one sitting if possible.</span>
    <button class="primary" id="submit" disabled>Submit answer</button>
  </div>
  <div class="footer">
    Powered by QOrium · Question-Bank-as-a-Service · session expires ${new Date(session.expires_at).toISOString().slice(0,16).replace('T',' ')} UTC
  </div>
</div>
<div id="toast"></div>
<script>
const TOKEN = ${JSON.stringify(token)};
const API = (path) => "/take/" + TOKEN + path;
let state = null, selected = null, qStartMs = 0, timerInterval = null;

function toast(msg) { const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 1800); }
function tick() { const s = Math.max(0, Math.floor((Date.now() - qStartMs) / 1000)); document.getElementById('timer').textContent = s + 's'; }

async function load() {
  const r = await fetch(API('/api/state'), { credentials: 'omit' });
  if (r.status === 410) { document.getElementById('body').innerHTML = '<div class="complete"><h2>Session expired</h2><p>This link is no longer valid.</p></div>'; return; }
  if (!r.ok) { document.getElementById('body').innerHTML = '<div class="complete"><h2>Error</h2><p>Could not load session.</p></div>'; return; }
  state = await r.json();
  if (state.status === 'completed') {
    document.getElementById('body').innerHTML = '<div class="complete"><h2>All done</h2><p>You have answered all questions. Redirecting to your result…</p></div>';
    setTimeout(() => window.location.href = "/take/" + TOKEN + "/result", 1200);
    return;
  }
  render();
}

function render() {
  const q = state.question;
  document.getElementById('progress-text').textContent = "Question " + (state.current_index + 1) + " of " + state.total;
  document.getElementById('progress-bar').style.width = (state.current_index / state.total * 100) + '%';
  document.getElementById('question-body').textContent = q.body_md;
  const opts = document.getElementById('opts');
  opts.innerHTML = '';
  for (const o of q.options) {
    const b = document.createElement('button');
    b.dataset.key = o.key;
    b.innerHTML = '<span class="k">' + o.key + ')</span> ' + o.text.replace(/[<>&"']/g, c => ({ '<':'&lt;', '>':'&gt;', '&':'&amp;', '"':'&quot;', "'":"&#39;" }[c]));
    b.addEventListener('click', () => {
      selected = o.key;
      opts.querySelectorAll('button').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
      document.getElementById('submit').disabled = false;
    });
    opts.appendChild(b);
  }
  selected = null;
  document.getElementById('submit').disabled = true;
  qStartMs = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(tick, 1000);
  tick();
}

document.getElementById('submit').addEventListener('click', async () => {
  if (!selected) return;
  const btn = document.getElementById('submit');
  btn.disabled = true; btn.textContent = 'Submitting…';
  const r = await fetch(API('/api/answer'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selected_key: selected, time_taken_ms: Date.now() - qStartMs }),
  });
  if (!r.ok) { toast('Submit failed; please retry'); btn.disabled = false; btn.textContent = 'Submit answer'; return; }
  const out = await r.json();
  toast(out.is_correct ? 'Recorded' : 'Recorded');
  btn.textContent = 'Submit answer';
  if (out.status === 'completed') {
    setTimeout(() => window.location.href = "/take/" + TOKEN + "/result", 600);
    return;
  }
  await load();
});

load();
</script>
</body>
</html>`;
}

// ----------------------------------------------------------------------------
// Result page HTML (mirror /v1/results renderer for consistency)
// ----------------------------------------------------------------------------
function resultPageHtml(session: SessionRow, rows: any[]): string {
  if (rows.length === 0) {
    return `<!doctype html><html><body style="font-family:sans-serif;padding:48px;text-align:center"><h2>No responses yet</h2><p>Session token: ${esc(session.candidate_id)}</p></body></html>`;
  }
  const totalScore = rows.reduce((s, r) => s + Number(r.score), 0);
  const maxScore = rows.length * 5;
  const pct = Math.round((totalScore / maxScore) * 100);
  const passmark = Math.ceil(maxScore * 0.7);
  const passed = totalScore >= passmark;
  const totalTimeSec = Math.round(rows.reduce((s, r) => s + r.time_taken_ms, 0) / 1000);
  const skillName = rows[0]!.skill || 'Skill Assessment';
  const correctCount = rows.filter((r) => Number(r.score) > 0).length;

  const qs = rows.map((r, i) => {
    const ext = r.body_json?.external_id || `Q${i + 1}`;
    const correct = r.answer_key?.correct;
    const selected = r.response_body?.canonical_selected || r.response_body?.selected_option;
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
  }).join('\n');

  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>QOrium Result — ${esc(session.candidate_id)}</title>
<style>
body{font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;background:#F5F7FB;color:#0B1F3A;margin:0;padding:32px}
.card{max-width:760px;margin:0 auto;background:#fff;border-radius:12px;box-shadow:0 6px 24px rgba(11,31,58,.10);overflow:hidden}
.header{background:#0B1F3A;color:#fff;padding:28px 32px}.header h1{margin:0 0 4px;font-size:22px;font-weight:700}.header .sub{color:#C7D7EC;font-size:13px}
.accent{display:inline-block;background:#F4B860;color:#0B1F3A;padding:4px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1.5px;margin-bottom:12px}
.summary{display:flex;padding:24px 32px;gap:32px;border-bottom:1px solid #E5E7EB}.summary .box{flex:1}
.summary .label{font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#8898B0;font-weight:700;margin-bottom:6px}
.summary .value{font-size:28px;font-weight:700;color:#0B1F3A}.summary .value.pass{color:#16A34A}.summary .value.fail{color:#DC2626}
.questions{padding:16px 32px 32px}.q{padding:16px 0;border-bottom:1px solid #F1F5F9}.q:last-child{border-bottom:none}
.q .meta{font-size:11px;color:#8898B0;margin-bottom:6px;letter-spacing:.5px}.q .body{font-size:14px;color:#0B1F3A;margin-bottom:8px}
.q .row{display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#475569}
.q .verdict.correct{color:#16A34A;font-weight:700}.q .verdict.wrong{color:#DC2626;font-weight:700}
.footer{padding:16px 32px;background:#F8FAFC;border-top:1px solid #E5E7EB;font-size:11px;color:#8898B0;text-align:center}
</style></head><body>
<div class="card">
  <div class="header"><div class="accent">QORIUM · CUSTOMER ZERO</div><h1>${esc(skillName)} — Result</h1><div class="sub">${esc(session.candidate_id)} · ${new Date(rows[0]!.submitted_at).toISOString().slice(0,10)}</div></div>
  <div class="summary">
    <div class="box"><div class="label">Score</div><div class="value ${passed?'pass':'fail'}">${totalScore}/${maxScore}</div><div class="label">${pct}% — ${passed?'PASS':'BELOW PASSMARK'}</div></div>
    <div class="box"><div class="label">Questions</div><div class="value">${rows.length}</div><div class="label">${correctCount} correct</div></div>
    <div class="box"><div class="label">Time</div><div class="value">${Math.floor(totalTimeSec/60)}m ${totalTimeSec%60}s</div><div class="label">~${Math.round(totalTimeSec/rows.length)}s avg/Q</div></div>
  </div>
  <div class="questions">${qs}</div>
  <div class="footer">Powered by QOrium · Talpro India Pvt Ltd · session ${esc(session.candidate_id)}</div>
</div>
</body></html>`;
}
