import { adminFetch, fmtDate, renderError, renderLayout } from '/admin/_layout.js';
import { renderTable } from '/admin/_tables.js';

const main = renderLayout('attempts');
main.innerHTML =
  '<h2>Attempts</h2><p class="subtitle">Cross-tenant candidate attempts with scores and lifecycle timestamps. Read-only.</p><div class="card" id="wrap">Loading…</div>';
const wrap = main.querySelector('#wrap');
function score(r) {
  if (r.total_score === null || r.total_score === undefined) return '—';
  const max = r.max_score === null || r.max_score === undefined ? '?' : r.max_score;
  return r.total_score + ' / ' + max;
}
const cols = [
  { label: 'Assessment', key: 'assessment_title' },
  { label: 'Tenant', key: 'tenant_name' },
  { label: 'Candidate', key: 'candidate_id', mono: true },
  { label: 'Status', key: 'status' },
  { label: 'Score', render: score, mono: true },
  { label: 'Started', render: (r) => fmtDate(r.started_at) },
  { label: 'Submitted', render: (r) => fmtDate(r.submitted_at) },
  { label: 'Graded', render: (r) => fmtDate(r.graded_at) },
];
async function load() {
  try {
    const o = await adminFetch('/v1/admin/attempts?limit=200');
    const rows = o.attempts || [];
    wrap.innerHTML = '';
    if (rows.length === 0) {
      wrap.innerHTML = '<div class="empty">No attempts yet.</div>';
      return;
    }
    wrap.append(renderTable(cols, rows));
  } catch (err) {
    wrap.innerHTML = '';
    renderError(main, 'Failed to load attempts: ' + err.message);
  }
}
load();
