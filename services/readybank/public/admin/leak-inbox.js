import { adminFetch, fmtDate, pill, renderError, renderLayout } from '/admin/_layout.js';

const main = renderLayout('leak-inbox');
main.innerHTML = `
  <h2>Anti-Leak Inbox</h2>
  <p class="subtitle">SO-9 24-hour leak rotation queue. Critical = auto-rotate triggered; medium/high = SME review needed.</p>
  <div class="toolbar">
    <label>Status
      <select id="filter-status">
        <option value="">All</option>
        <option value="detected" selected>Detected</option>
        <option value="under_review">Under Review</option>
        <option value="rotated">Rotated</option>
        <option value="dismissed">Dismissed</option>
        <option value="false_positive">False Positive</option>
      </select>
    </label>
    <label>Severity
      <select id="filter-severity">
        <option value="">All</option>
        <option value="critical">Critical</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>
    </label>
    <button id="refresh" class="secondary">Refresh</button>
  </div>
  <div id="alerts">Loading…</div>

  <dialog id="review-dialog">
    <h3>Review leak alert</h3>
    <div class="field">
      <label>Decision</label>
      <select id="decision">
        <option value="dismissed">Dismissed (not a leak)</option>
        <option value="false_positive">False positive</option>
        <option value="under_review">Keep under review</option>
      </select>
    </div>
    <div class="field">
      <label>Notes (optional)</label>
      <textarea id="notes" rows="3" maxlength="2000"></textarea>
    </div>
    <div class="actions">
      <button class="secondary" id="cancel-review">Cancel</button>
      <button id="submit-review">Submit</button>
    </div>
  </dialog>
`;

const alertsEl = main.querySelector('#alerts');
const dialog = main.querySelector('#review-dialog');
const decisionEl = main.querySelector('#decision');
const notesEl = main.querySelector('#notes');
const submitBtn = main.querySelector('#submit-review');
let activeAlertId = null;

main.querySelector('#refresh').addEventListener('click', load);
main.querySelector('#filter-status').addEventListener('change', load);
main.querySelector('#filter-severity').addEventListener('change', load);
main.querySelector('#cancel-review').addEventListener('click', () => dialog.close());
submitBtn.addEventListener('click', submitReview);

async function load() {
  alertsEl.textContent = 'Loading…';
  const status = main.querySelector('#filter-status').value;
  const severity = main.querySelector('#filter-severity').value;
  const url = new URL('/v1/admin/leak-alerts', window.location.origin);
  if (status) url.searchParams.set('status', status);
  if (severity) url.searchParams.set('severity', severity);
  url.searchParams.set('limit', '100');

  try {
    const data = await adminFetch(url.pathname + url.search);
    if (data.alerts.length === 0) {
      alertsEl.innerHTML = '<div class="empty">No alerts match the current filter.</div>';
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
          <th>Sim</th>
          <th>Question</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    for (const a of data.alerts) {
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
      link.textContent = a.source_type || 'view';
      tdSrc.append(link);

      const tdSim = document.createElement('td');
      tdSim.className = 'mono';
      tdSim.textContent = Number(a.similarity_score).toFixed(3);

      const tdQ = document.createElement('td');
      tdQ.className = 'mono muted';
      tdQ.textContent = a.question_id.slice(0, 8) + '…';

      const tdAct = document.createElement('td');
      const btn = document.createElement('button');
      btn.textContent = 'Review';
      btn.disabled = ['rotated', 'dismissed', 'false_positive'].includes(a.status);
      btn.addEventListener('click', () => openReview(a.id));
      tdAct.append(btn);

      tr.append(tdDate, tdSev, tdStat, tdSrc, tdSim, tdQ, tdAct);
      tbody.append(tr);
    }
    alertsEl.innerHTML = '';
    alertsEl.append(table);
  } catch (err) {
    alertsEl.innerHTML = '';
    renderError(main, `Failed to load alerts: ${err.message}`);
  }
}

function openReview(id) {
  activeAlertId = id;
  decisionEl.value = 'dismissed';
  notesEl.value = '';
  dialog.showModal();
}

async function submitReview() {
  if (!activeAlertId) return;
  submitBtn.disabled = true;
  try {
    await adminFetch(`/v1/admin/leak-alerts/${activeAlertId}/review`, {
      method: 'POST',
      body: JSON.stringify({ decision: decisionEl.value, notes: notesEl.value || undefined }),
    });
    dialog.close();
    activeAlertId = null;
    load();
  } catch (err) {
    renderError(main, `Review failed: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
  }
}

load();
