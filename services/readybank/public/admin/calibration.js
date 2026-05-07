import { adminFetch, renderError, renderLayout } from '/admin/_layout.js';

const main = renderLayout('calibration');
main.innerHTML = `
  <h2>IRT Calibration</h2>
  <p class="subtitle">SO-21 enforcement view. Items in 'calibrating' need ≥30 reference-panel responses before they may transition to 'released'.</p>
  <div class="toolbar">
    <label>Status
      <select id="filter-status">
        <option value="calibrating" selected>Calibrating</option>
        <option value="released">Released</option>
      </select>
    </label>
    <button id="refresh" class="secondary">Refresh</button>
  </div>
  <div id="items">Loading…</div>
`;

const itemsEl = main.querySelector('#items');
main.querySelector('#refresh').addEventListener('click', load);
main.querySelector('#filter-status').addEventListener('change', load);

async function load() {
  itemsEl.textContent = 'Loading…';
  const status = main.querySelector('#filter-status').value;
  try {
    const data = await adminFetch(`/v1/admin/calibration?status=${status}&limit=100`);
    if (data.items.length === 0) {
      itemsEl.innerHTML = '<div class="empty">No items in this calibration bucket.</div>';
      return;
    }
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Question</th>
          <th>Format</th>
          <th>n (panel)</th>
          <th>b</th>
          <th>a</th>
          <th>c</th>
          <th>Empirical pass-rate</th>
          <th>SO-21 ready?</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    for (const it of data.items) {
      const tr = document.createElement('tr');

      const tdId = document.createElement('td');
      tdId.className = 'mono';
      tdId.textContent = it.id.slice(0, 8) + '…';
      tdId.title = it.body_excerpt;

      const tdFmt = document.createElement('td');
      tdFmt.textContent = it.format;

      const tdN = document.createElement('td');
      tdN.className = 'mono';
      tdN.textContent = String(it.n);

      const tdB = document.createElement('td');
      tdB.className = 'mono';
      tdB.textContent = it.difficulty_b ? Number(it.difficulty_b).toFixed(2) : '—';

      const tdA = document.createElement('td');
      tdA.className = 'mono';
      tdA.textContent = it.discrimination_a ? Number(it.discrimination_a).toFixed(2) : '—';

      const tdC = document.createElement('td');
      tdC.className = 'mono';
      tdC.textContent = it.guessing_c ? Number(it.guessing_c).toFixed(2) : '—';

      const tdRate = document.createElement('td');
      tdRate.className = 'mono';
      tdRate.textContent = it.empirical_pass_rate
        ? `${(Number(it.empirical_pass_rate) * 100).toFixed(0)}%`
        : '—';

      const tdReady = document.createElement('td');
      const n = Number(it.n);
      const ready = n >= 30 && it.difficulty_b && it.discrimination_a;
      tdReady.textContent = ready ? '✅ ready' : '⏳ pending';
      tdReady.className = ready ? '' : 'muted';

      tr.append(tdId, tdFmt, tdN, tdB, tdA, tdC, tdRate, tdReady);
      tbody.append(tr);
    }
    itemsEl.innerHTML = '';
    itemsEl.append(table);
  } catch (err) {
    itemsEl.innerHTML = '';
    renderError(main, `Failed to load calibration: ${err.message}`);
  }
}

load();
