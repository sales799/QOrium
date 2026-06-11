import { adminFetch, fmtDate, renderError, renderLayout } from '/admin/_layout.js';
import { renderTable } from '/admin/_tables.js';

const main = renderLayout('audit-events');
main.innerHTML =
  '<h2>Audit Events</h2><p class="subtitle">Sanitized cross-tenant audit trail — metadata only, no payloads or IPs. Read-only.</p><div class="card" id="wrap">Loading…</div>';
const wrap = main.querySelector('#wrap');
const cols = [
  { label: 'Event', key: 'event_type' },
  { label: 'Actor', render: (r) => [r.actor_type, r.actor_id].filter(Boolean).join(': ') },
  { label: 'Entity', render: (r) => [r.entity_type, r.entity_id].filter(Boolean).join(': ') },
  { label: 'Tenant', key: 'tenant_name' },
  { label: 'When', render: (r) => fmtDate(r.occurred_at) },
];
async function load() {
  try {
    const o = await adminFetch('/v1/admin/audit-events?limit=200');
    const rows = o.events || [];
    wrap.innerHTML = '';
    if (rows.length === 0) {
      wrap.innerHTML = '<div class="empty">No audit events yet.</div>';
      return;
    }
    wrap.append(renderTable(cols, rows));
  } catch (err) {
    wrap.innerHTML = '';
    renderError(main, 'Failed to load audit events: ' + err.message);
  }
}
load();
