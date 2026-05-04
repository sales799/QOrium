// /recruiter/dashboard.html — public-route recruiter session-management dashboard.
// Sprint 1.5 (Run #31).
//
// The dashboard is a static client-side single-page-app. The recruiter pastes
// their API key on first visit; the key is held in sessionStorage (cleared when
// the tab closes) and forwarded as the Authorization header on all /v1/sessions
// fetches. No server-side cookie/session surface required.
//
// Routes:
//   GET /recruiter/dashboard.html   -> SPA shell (HTML + inline JS + inline CSS)
//
// Future hardening (Sprint 1.6+): recruiter login that issues a short-lived
// JWT/cookie so the API key never touches the browser.

import { Router } from 'express';

export function recruiterRouter(): Router {
  const router = Router();

  router.get('/recruiter/dashboard.html', (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(dashboardHtml());
  });

  // Convenience redirect for /recruiter
  router.get('/recruiter', (_req, res) => res.redirect('/recruiter/dashboard.html'));
  router.get('/recruiter/', (_req, res) => res.redirect('/recruiter/dashboard.html'));

  return router;
}

function dashboardHtml(): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>QOrium Recruiter Dashboard</title>
<style>
  :root { --navy:#0B1F3A; --ice:#C7D7EC; --amber:#F4B860; --green:#16A34A; --red:#DC2626; --bg:#F5F7FB; --card:#fff; --muted:#8898B0; --border:#E5E7EB; }
  *{box-sizing:border-box}
  body{font-family:-apple-system,"Helvetica Neue",Arial,sans-serif;background:var(--bg);color:var(--navy);margin:0;padding:24px;min-height:100vh}
  .wrap{max-width:1100px;margin:0 auto}
  .header{background:var(--navy);color:#fff;padding:20px 24px;border-radius:12px 12px 0 0}
  .accent{display:inline-block;background:var(--amber);color:var(--navy);padding:4px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:1.5px}
  h1{margin:8px 0 4px;font-size:22px;font-weight:700}
  .sub{color:var(--ice);font-size:13px}
  .panel{background:var(--card);padding:20px 24px;border-bottom:1px solid var(--border)}
  .panel:last-of-type{border-radius:0 0 12px 12px;border-bottom:none}
  .panel h2{margin:0 0 14px;font-size:16px;font-weight:700}
  label{display:block;font-size:11px;color:var(--muted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px}
  input,textarea,select{width:100%;padding:10px 12px;border:1px solid var(--border);border-radius:6px;font-size:14px;font-family:inherit;color:var(--navy)}
  input:focus,textarea:focus{outline:none;border-color:var(--navy)}
  textarea{font-family:ui-monospace,Menlo,Monaco,Consolas,monospace;font-size:12px;min-height:90px}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px}
  .row.three{grid-template-columns:1fr 1fr 1fr}
  button{background:var(--navy);color:#fff;border:none;padding:10px 18px;border-radius:6px;font-weight:600;font-size:13px;cursor:pointer;transition:120ms}
  button:hover{background:#152B4D}
  button.ghost{background:#fff;color:var(--navy);border:1px solid var(--border)}
  button.danger{background:var(--red)}
  button.amber{background:var(--amber);color:var(--navy)}
  button:disabled{opacity:.4;cursor:not-allowed}
  .muted{font-size:12px;color:var(--muted)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th{text-align:left;padding:10px 8px;border-bottom:2px solid var(--border);font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--muted)}
  td{padding:10px 8px;border-bottom:1px solid var(--border);vertical-align:top}
  tr:hover td{background:#FAFBFD}
  .pill{display:inline-block;padding:2px 8px;border-radius:10px;font-size:11px;font-weight:700;letter-spacing:.5px}
  .pill.pending{background:#FEF3DC;color:#7C5800}
  .pill.in_progress{background:#DBEAFE;color:#0B5394}
  .pill.completed{background:#DCFCE7;color:#0E5C3A}
  .pill.expired{background:#FEE2E2;color:#7C0E0E}
  .pill.revoked{background:#FEE2E2;color:#7C0E0E}
  .copy{font-family:ui-monospace,monospace;font-size:11px;color:var(--muted);word-break:break-all}
  #toast{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:var(--navy);color:#fff;padding:10px 16px;border-radius:8px;font-size:13px;opacity:0;transition:200ms;pointer-events:none;z-index:99}
  #toast.show{opacity:1}
  #toast.err{background:var(--red)}
  .footer{text-align:center;font-size:11px;color:var(--muted);padding:20px}
  .actions{display:flex;gap:8px}
  .key-row{display:flex;gap:8px;align-items:end}
  .key-row .grow{flex:1}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <span class="accent">QORIUM · RECRUITER DASHBOARD</span>
    <h1>Take-Session Management</h1>
    <div class="sub">List · Create · Revoke. API key lives in sessionStorage only — cleared when you close the tab.</div>
  </div>

  <div class="panel" id="login-panel">
    <h2>Step 1 — paste your API key</h2>
    <div class="key-row">
      <div class="grow">
        <label>API key (qor_internal_… or qor_live_…)</label>
        <input id="apikey-input" type="password" autocomplete="off" placeholder="qor_internal_talind001_…">
      </div>
      <button id="login-btn">Use key</button>
    </div>
    <div class="muted" style="margin-top:6px">Validated by calling <code>GET /v1/sessions</code>. If it works, the page reveals the rest.</div>
  </div>

  <div class="panel" id="create-panel" style="display:none">
    <h2>Create take session</h2>
    <div class="row">
      <div>
        <label>Candidate ID</label>
        <input id="cand-id" placeholder="PRIYA-001">
      </div>
      <div>
        <label>Pack name (optional)</label>
        <input id="pack-name" placeholder="Senior Java Skills Check">
      </div>
    </div>
    <div class="row">
      <div>
        <label>Recruiter email (optional)</label>
        <input id="rec-email" placeholder="hiring@talpro.in">
      </div>
      <div>
        <label>Expires in (minutes)</label>
        <input id="expires" type="number" value="2880" min="5">
      </div>
    </div>
    <div>
      <label>Question UUIDs (one per line; min 1, max 100)</label>
      <textarea id="qids" placeholder="paste UUIDs here, one per line"></textarea>
      <div class="muted" style="margin-top:4px"><a href="#" id="fetch-qids">Auto-fetch first 6 released questions</a></div>
    </div>
    <div style="margin-top:14px;display:flex;gap:8px">
      <button id="create-btn" class="amber">Create session</button>
      <button id="reload-btn" class="ghost">Reload list</button>
    </div>
  </div>

  <div class="panel" id="list-panel" style="display:none">
    <h2>Sessions</h2>
    <div class="row three" style="margin-bottom:14px">
      <div>
        <label>Filter status</label>
        <select id="filter-status">
          <option value="">— any —</option>
          <option value="pending">pending</option>
          <option value="in_progress">in_progress</option>
          <option value="completed">completed</option>
          <option value="expired">expired</option>
          <option value="revoked">revoked</option>
        </select>
      </div>
      <div>
        <label>Filter candidate_id</label>
        <input id="filter-cand">
      </div>
      <div>
        <label>Limit</label>
        <input id="filter-limit" type="number" value="25" min="1" max="100">
      </div>
    </div>
    <table>
      <thead>
        <tr>
          <th>Candidate</th><th>Pack</th><th>Status</th><th>Progress</th><th>Created</th><th>Expires</th><th>Token</th><th>Actions</th>
        </tr>
      </thead>
      <tbody id="rows"><tr><td colspan="8" class="muted">Loading…</td></tr></tbody>
    </table>
  </div>

  <div class="footer">
    Powered by QOrium · Talpro India Pvt Ltd · <code>https://api.qorium.online</code>
  </div>
</div>
<div id="toast"></div>
<script>
const SESS = sessionStorage;
const ORIGIN = window.location.origin;
const $ = (id) => document.getElementById(id);
function toast(msg, err) { const t = $('toast'); t.textContent = msg; t.className = err ? 'show err' : 'show'; setTimeout(() => t.className = '', 2200); }
function fmt(d) { return d ? new Date(d).toISOString().slice(0, 16).replace('T', ' ') : '—'; }
function esc(s) { return String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
async function api(path, opts) {
  const key = SESS.getItem('qor_apikey');
  if (!key) { toast('No API key', true); return null; }
  const init = opts || {};
  init.headers = Object.assign({}, init.headers || {}, { Authorization: 'Bearer ' + key });
  if (init.body && typeof init.body === 'object') { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(init.body); }
  const r = await fetch(ORIGIN + path, init);
  if (r.status === 401) { toast('Auth failed; key invalid?', true); return null; }
  if (!r.ok) { const txt = await r.text().catch(() => ''); toast('HTTP ' + r.status + ' ' + txt.slice(0,100), true); return null; }
  return r.json();
}

$('login-btn').addEventListener('click', async () => {
  const k = $('apikey-input').value.trim();
  if (!k) return;
  SESS.setItem('qor_apikey', k);
  // Validate via list call
  const r = await api('/v1/sessions?limit=1');
  if (!r) { SESS.removeItem('qor_apikey'); return; }
  $('login-panel').style.display = 'none';
  $('create-panel').style.display = '';
  $('list-panel').style.display = '';
  $('apikey-input').value = ''; // wipe field after using
  loadList();
});

document.querySelectorAll('#filter-status, #filter-cand, #filter-limit').forEach(el => el.addEventListener('change', loadList));
$('reload-btn').addEventListener('click', loadList);

async function loadList() {
  const params = new URLSearchParams();
  const s = $('filter-status').value; if (s) params.set('status', s);
  const c = $('filter-cand').value.trim(); if (c) params.set('candidate_id', c);
  const lim = $('filter-limit').value; if (lim) params.set('limit', lim);
  const data = await api('/v1/sessions?' + params.toString());
  const tbody = $('rows');
  if (!data) { tbody.innerHTML = '<tr><td colspan="8" class="muted">Failed to load.</td></tr>'; return; }
  if (!data.sessions.length) { tbody.innerHTML = '<tr><td colspan="8" class="muted">No sessions yet. Create one above.</td></tr>'; return; }
  tbody.innerHTML = data.sessions.map(s => \`<tr>
    <td><strong>\${esc(s.candidate_id)}</strong></td>
    <td>\${esc(s.pack_name || '—')}</td>
    <td><span class="pill \${esc(s.status)}">\${esc(s.status)}</span></td>
    <td>\${s.current_index}/\${s.question_count}</td>
    <td>\${fmt(s.created_at)}</td>
    <td>\${fmt(s.expires_at)}</td>
    <td class="copy">\${esc(s.token_prefix)}…</td>
    <td class="actions">
      \${s.status === 'pending' || s.status === 'in_progress' ? \`<button class="danger" data-revoke="\${esc(s.id)}">Revoke</button>\` : ''}
      \${s.status === 'completed' ? \`<button class="ghost" data-result="\${esc(s.id)}">View result</button>\` : ''}
    </td>
  </tr>\`).join('');
  tbody.querySelectorAll('button[data-revoke]').forEach(b => b.addEventListener('click', () => revoke(b.getAttribute('data-revoke'))));
  tbody.querySelectorAll('button[data-result]').forEach(b => b.addEventListener('click', () => viewResult(b.getAttribute('data-result'))));
}

async function revoke(id) {
  if (!confirm('Revoke this session? The /take/<token> URL will redirect to result.')) return;
  const r = await api('/v1/sessions/' + id + '/revoke', { method: 'POST' });
  if (r) { toast('Revoked'); loadList(); }
}

async function viewResult(id) {
  // Lookup candidate_id from session detail to render result page
  const d = await api('/v1/sessions/' + id);
  if (!d) return;
  window.open('/v1/results/' + encodeURIComponent(d.candidate_id), '_blank');
}

$('fetch-qids').addEventListener('click', async (e) => {
  e.preventDefault();
  const r = await api('/v1/questions/search?limit=6');
  if (!r) return;
  $('qids').value = (r.questions || []).map(q => q.uuid).join('\\n');
  toast('Pasted ' + (r.questions?.length || 0) + ' question UUIDs');
});

$('create-btn').addEventListener('click', async () => {
  const candidate_id = $('cand-id').value.trim();
  const pack_name = $('pack-name').value.trim();
  const recruiter_email = $('rec-email').value.trim();
  const expires_minutes = parseInt($('expires').value, 10);
  const question_ids = $('qids').value.split(/\\s+/).map(s => s.trim()).filter(Boolean);
  if (!candidate_id || !question_ids.length) { toast('candidate_id + at least 1 question_id required', true); return; }
  const body = { candidate_id, question_ids };
  if (pack_name) body.pack_name = pack_name;
  if (recruiter_email) body.recruiter_email = recruiter_email;
  if (expires_minutes) body.expires_minutes = expires_minutes;
  const r = await api('/v1/sessions', { method: 'POST', body });
  if (!r) return;
  toast('Created · take_url copied to clipboard');
  try { await navigator.clipboard.writeText(r.take_url); } catch (_) {}
  // Show take_url + result_url on the page
  const div = document.createElement('div');
  div.style.cssText = 'margin-top:12px;padding:12px;background:#FEF3DC;border-radius:6px;font-size:12px';
  div.innerHTML = '<strong>Take URL:</strong> <a href="' + r.take_url + '" target="_blank">' + r.take_url + '</a><br><strong>Expires:</strong> ' + fmt(r.expires_at);
  $('create-panel').appendChild(div);
  loadList();
});

// Auto-login if key already in sessionStorage
if (SESS.getItem('qor_apikey')) {
  $('login-btn').click();
}
</script>
</body>
</html>`;
}
