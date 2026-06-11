import { adminFetch, fmtDate, renderError, renderLayout } from '/admin/_layout.js';
import { renderTable } from '/admin/_tables.js';

const main = renderLayout('assessments');
main.innerHTML =
  '<h2>Assessments</h2><p class="subtitle">Cross-tenant assessment catalogue with invitation and attempt counts. Read-only.</p><div class="card" id="wrap">Loading…</div>';
const wrap = main.querySelector('#wrap');
const cols = [
  { label: 'Title', key: 'title' },
  { label: 'Tenant', key: 'tenant_name' },
  { label: 'Status', key: 'status' },
  { label: 'Questions', key: 'total_questions', mono: true },
  { label: 'Invitations', key: 'invitations', mono: true },
  { label: 'Attempts', key: 'attempts', mono: true },
  { label: 'Created', render: (r) => fmtDate(r.created_at) },
];
async function load() {
  try {
    const o = await adminFetch('/v1/admin/assessments?limit=200');
    const rows = o.assessments || [];
    wrap.innerHTML = '';
    if (rows.length === 0) {
      wrap.innerHTML = '<div class="empty">No assessments yet.</div>';
      return;
    }
    wrap.append(renderTable(cols, rows));
  } catch (err) {
    wrap.innerHTML = '';
    renderError(main, 'Failed to load assessments: ' + err.message);
  }
}
load();
