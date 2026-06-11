// Shared read-only table renderer for admin control-plane pages (N8).
// CSP-compliant; no inline JS. Columns: {label, key?, render?(row), mono?}.
export function renderTable(columns, rows) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const htr = document.createElement('tr');
  for (const c of columns) {
    const th = document.createElement('th');
    th.textContent = c.label;
    htr.append(th);
  }
  thead.append(htr);
  const tbody = document.createElement('tbody');
  for (const row of rows) {
    const tr = document.createElement('tr');
    for (const c of columns) {
      const td = document.createElement('td');
      const v = c.render ? c.render(row) : row[c.key];
      td.textContent = v === null || v === undefined || v === '' ? '—' : String(v);
      if (c.mono) td.className = 'mono';
      tr.append(td);
    }
    tbody.append(tr);
  }
  table.append(thead, tbody);
  return table;
}
