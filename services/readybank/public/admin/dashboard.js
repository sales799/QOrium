import { adminFetch, fmtDate, pill, renderError, renderLayout } from '/admin/_layout.js';

const main = renderLayout('dashboard');
main.innerHTML = `
  <h2>Admin Dashboard</h2>
  <p class="subtitle">Live engineering view — Sprint 1.8d. Counts pulled from the live API.</p>
  <div id="metrics" class="metric-row"></div>
  <div class="card">
    <h3 class="tight">Recent leak alerts</h3>
    <div id="recent-leaks">Loading…</div>
  </div>
`;

const metricsEl = main.querySelector('#metrics');
const recentEl = main.querySelector('#recent-leaks');

async function load() {
  try {
    const [leaks, queue, calib] = await Promise.all([
      adminFetch('/v1/admin/leak-alerts?limit=200'),
      adminFetch('/v1/admin/sme-queue?status=sme_review&limit=200'),
      adminFetch('/v1/admin/calibration?status=calibrating&limit=200'),
    ]);

    const counts = leaks.alerts.reduce(
      (acc, a) => ({ ...acc, [a.severity]: (acc[a.severity] || 0) + 1 }),
      {},
    );
    const open = leaks.alerts.filter((a) => ['detected', 'under_review'].includes(a.status)).length;

    metricsEl.innerHTML = '';
    for (const [label, value] of [
      ['Open leak alerts', String(open)],
      ['Critical leaks', String(counts.critical || 0)],
      ['SME-review queue', String(queue.questions.length)],
      ['Items calibrating', String(calib.items.length)],
    ]) {
      const m = document.createElement('div');
      m.className = 'metric';
      m.innerHTML = `<div class="label"></div><div class="value"></div>`;
      m.querySelector('.label').textContent = label;
      m.querySelector('.value').textContent = value;
      metricsEl.append(m);
    }

    if (leaks.alerts.length === 0) {
      recentEl.innerHTML = '<div class="empty">No leak alerts. ✅</div>';
      return;
    }
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Detected</th>
          <th>Severity</th>
          <th>Status</th>
          <th>Source</th>
          <th>Question</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    for (const a of leaks.alerts.slice(0, 10)) {
      const tr = document.createElement('tr');
      const tdDate = document.createElement('td');
      tdDate.className = 'mono';
      tdDate.textContent = fmtDate(a.detected_at);
      const tdSev = document.createElement('td');
      tdSev.append(pill(a.severity, 'severity'));
      const tdStat = document.createElement('td');
      tdStat.append(pill(a.status, 'status'));
      const tdSrc = document.createElement('td');
      const link = document.createElement('a');
      link.href = a.source_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = a.source_type || a.source_url;
      tdSrc.append(link);
      const tdQ = document.createElement('td');
      tdQ.className = 'mono muted';
      tdQ.textContent = a.question_id.slice(0, 8) + '…';
      tr.append(tdDate, tdSev, tdStat, tdSrc, tdQ);
      tbody.append(tr);
    }
    recentEl.innerHTML = '';
    recentEl.append(table);
  } catch (err) {
    renderError(main, `Failed to load: ${err.message}`);
  }
}

load();
