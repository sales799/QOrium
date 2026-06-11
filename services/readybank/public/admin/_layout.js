// Shared admin layout helpers — Sprint 1.8d. CSP-compliant; no inline JS.
// Each admin page imports this for the side-nav, error rendering, and
// fetch wrapper that handles 401 by redirecting to login.

export function renderLayout(activeId) {
  const layout = document.createElement('div');
  layout.className = 'layout';
  layout.innerHTML = `
    <aside class="nav">
      <h1>QOrium Admin</h1>
      <nav id="admin-nav"></nav>
    </aside>
    <main id="admin-main"></main>
  `;
  document.body.append(layout);

  const items = [
    ['dashboard', 'Dashboard', '/admin/dashboard.html'],
    ['overview', 'Platform Overview', '/admin/overview.html'],
    ['tenants', 'Tenants', '/admin/tenants.html'],
    ['assessments', 'Assessments', '/admin/assessments.html'],
    ['attempts', 'Attempts', '/admin/attempts.html'],
    ['audit-events', 'Audit Events', '/admin/audit-events.html'],
    ['leak-inbox', 'Anti-Leak Inbox', '/admin/leak-inbox.html'],
    ['sme-queue', 'SME Review Queue', '/admin/sme-queue.html'],
    ['calibration', 'IRT Calibration', '/admin/calibration.html'],
    ['panel-tokens', 'Reference-Panel Tokens', '/admin/panel-tokens.html'],
  ];
  const nav = layout.querySelector('#admin-nav');
  for (const [id, label, href] of items) {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (id === activeId) a.classList.add('active');
    nav.append(a);
  }
  return layout.querySelector('#admin-main');
}

export function renderError(main, message) {
  const div = document.createElement('div');
  div.className = 'error';
  div.textContent = message;
  main.prepend(div);
}

export async function adminFetch(url, options = {}) {
  const res = await fetch(url, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });
  if (res.status === 401) {
    window.location.href = '/login.html?next=' + encodeURIComponent(window.location.pathname);
    throw new Error('redirecting to login');
  }
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || body.title || detail;
    } catch {
      /* no body */
    }
    throw new Error(detail);
  }
  return res.json();
}

export function pill(text, kind) {
  const span = document.createElement('span');
  span.className = `pill ${kind}-${text}`;
  span.textContent = text;
  return span;
}

export function fmtDate(s) {
  if (!s) return '—';
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return s;
  return d.toLocaleString('en-IN', { hour12: false });
}
