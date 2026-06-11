import { adminFetch, fmtDate, renderError, renderLayout } from '/admin/_layout.js';
import { renderTable } from '/admin/_tables.js';

const main = renderLayout('tenants');
main.innerHTML =
  '<h2>Tenants</h2><p class="subtitle">Control-plane view of every tenant with per-tenant loop rollups. Read-only.</p><div class="card" id="wrap">Loading…</div>';
const wrap = main.querySelector('#wrap');
const cols = [
  { label: 'Name', key: 'name' },
  { label: 'Slug', key: 'slug' },
  { label: 'Type', key: 'type' },
  { label: 'Plan', key: 'plan' },
  { label: 'Status', key: 'status' },
  { label: 'Assessments', key: 'assessments', mono: true },
  { label: 'Attempts', key: 'attempts', mono: true },
  { label: 'Created', render: (r) => fmtDate(r.created_at) },
];
async function load() {
  try {
    const o = await adminFetch('/v1/admin/tenants?limit=200');
    const rows = o.tenants || [];
    wrap.innerHTML = '';
    if (rows.length === 0) {
      wrap.innerHTML = '<div class="empty">No tenants yet.</div>';
      return;
    }
    wrap.append(renderTable(cols, rows));
  } catch (err) {
    wrap.innerHTML = '';
    renderError(main, 'Failed to load tenants: ' + err.message);
  }
}
load();
