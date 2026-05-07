import { adminFetch, fmtDate, pill, renderError, renderLayout } from '/admin/_layout.js';

const main = renderLayout('sme-queue');
main.innerHTML = `
  <h2>SME Review Queue</h2>
  <p class="subtitle">Read-only browse view per Sprint 1.8d. Editing surfaces (approve / reject / annotate) ship in the next round once the I/O Psych contractor onboards (CC-02-A).</p>
  <div class="toolbar">
    <label>Status
      <select id="filter-status">
        <option value="sme_review" selected>SME Review</option>
        <option value="draft">Draft</option>
        <option value="calibrating">Calibrating</option>
      </select>
    </label>
    <button id="refresh" class="secondary">Refresh</button>
  </div>
  <div id="questions">Loading…</div>
`;

const questionsEl = main.querySelector('#questions');
main.querySelector('#refresh').addEventListener('click', load);
main.querySelector('#filter-status').addEventListener('change', load);

async function load() {
  questionsEl.textContent = 'Loading…';
  const status = main.querySelector('#filter-status').value;
  try {
    const data = await adminFetch(`/v1/admin/sme-queue?status=${status}&limit=100`);
    if (data.questions.length === 0) {
      questionsEl.innerHTML = '<div class="empty">Queue empty for this status.</div>';
      return;
    }
    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Created</th>
          <th>SKU</th>
          <th>Format</th>
          <th>Difficulty</th>
          <th>Bloom</th>
          <th>Authored by</th>
          <th>Body excerpt</th>
        </tr>
      </thead>
      <tbody></tbody>
    `;
    const tbody = table.querySelector('tbody');
    for (const q of data.questions) {
      const tr = document.createElement('tr');

      const tdCreated = document.createElement('td');
      tdCreated.className = 'mono';
      tdCreated.textContent = fmtDate(q.created_at);

      const tdSku = document.createElement('td');
      tdSku.textContent = q.sku;

      const tdFmt = document.createElement('td');
      tdFmt.textContent = q.format;

      const tdDiff = document.createElement('td');
      tdDiff.className = 'mono';
      tdDiff.textContent = q.difficulty_b ? Number(q.difficulty_b).toFixed(2) : '—';

      const tdBloom = document.createElement('td');
      tdBloom.textContent = q.bloom_level ? `${q.bloom_level} / ${q.bloom_dimension ?? '—'}` : '—';

      const tdBy = document.createElement('td');
      tdBy.className = 'muted';
      tdBy.textContent = q.authored_by;

      const tdBody = document.createElement('td');
      tdBody.textContent = q.body_md.slice(0, 200) + (q.body_md.length > 200 ? '…' : '');

      tr.append(tdCreated, tdSku, tdFmt, tdDiff, tdBloom, tdBy, tdBody);
      tbody.append(tr);
    }
    questionsEl.innerHTML = '';
    questionsEl.append(table);
  } catch (err) {
    questionsEl.innerHTML = '';
    renderError(main, `Failed to load queue: ${err.message}`);
  }
  // pill is exported but unused on this page; reference to satisfy bundlers
  void pill;
}

load();
