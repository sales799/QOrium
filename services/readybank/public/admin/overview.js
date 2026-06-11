import { adminFetch, fmtDate, renderError, renderLayout } from '/admin/_layout.js';

const main = renderLayout('overview');
main.innerHTML =
  '<h2>Platform Overview</h2><p class="subtitle">Assessment-loop keystone metrics — the full funnel in one view. Read-only.</p><p class="subtitle tight" id="generated">Loading…</p>' +
  '<div class="card"><h3 class="tight">Funnel</h3><p class="subtitle tight">Assessments to invitations to attempts to graded answers.</p><div id="funnel" class="metric-row"></div></div>' +
  '<div class="card"><h3 class="tight">Bank &amp; billing</h3><div id="bankbilling" class="metric-row"></div></div>' +
  '<div class="card"><h3 class="tight">Attempts by status</h3><div id="attempts-status">Loading…</div></div>' +
  '<div class="card"><h3 class="tight">Invitations by status</h3><div id="invitations-status">Loading…</div></div>';

const generatedEl = main.querySelector('#generated');
const funnelEl = main.querySelector('#funnel');
const bankBillingEl = main.querySelector('#bankbilling');
const attemptsStatusEl = main.querySelector('#attempts-status');
const invitationsStatusEl = main.querySelector('#invitations-status');

function renderMetrics(target, pairs) {
  target.innerHTML = '';
  for (const [label, value] of pairs) {
    const m = document.createElement('div');
    m.className = 'metric';
    m.innerHTML = '<div class="label"></div><div class="value"></div>';
    m.querySelector('.label').textContent = label;
    m.querySelector('.value').textContent = value;
    target.append(m);
  }
}

function renderStatusMap(target, map) {
  const entries = Object.entries(map || {});
  if (entries.length === 0) {
    target.innerHTML = '<div class="empty">No rows yet.</div>';
    return;
  }
  entries.sort((a, b) => b[1] - a[1]);
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Status</th><th>Count</th></tr>';
  const tbody = document.createElement('tbody');
  for (const [status, n] of entries) {
    const tr = document.createElement('tr');
    const tdS = document.createElement('td');
    tdS.textContent = status;
    const tdN = document.createElement('td');
    tdN.className = 'mono';
    tdN.textContent = String(n);
    tr.append(tdS, tdN);
    tbody.append(tr);
  }
  table.append(thead, tbody);
  target.innerHTML = '';
  target.append(table);
}

async function load() {
  try {
    const o = await adminFetch('/v1/admin/overview');
    generatedEl.textContent = 'Generated ' + fmtDate(o.generated_at);
    renderMetrics(funnelEl, [
      ['Assessments', String(o.loop.assessments)],
      ['Invitations', String(o.loop.invitations)],
      ['Attempts', String(o.loop.attempts)],
      ['Responses', String(o.loop.responses)],
      ['Responses w/ attempt', String(o.loop.responses_with_attempt)],
      ['Graded answers', String(o.loop.grade_decisions)],
    ]);
    renderMetrics(bankBillingEl, [
      ['Released bank', String(o.bank.questions_released)],
      ['Calibrated', String(o.bank.questions_calibrated)],
      ['Active subs', String(o.billing.subscriptions_active)],
    ]);
    renderStatusMap(attemptsStatusEl, o.attempts_by_status);
    renderStatusMap(invitationsStatusEl, o.invitations_by_status);
  } catch (err) {
    generatedEl.textContent = '';
    renderError(main, 'Failed to load overview: ' + err.message);
  }
}

load();
