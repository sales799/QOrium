// Recruiter dashboard SPA. Cookie-backed: relies on the qor_session
// HttpOnly cookie set by /v1/auth/login. Replaces the legacy sessionStorage
// API-key pattern.
(function () {
  var labelEl = document.getElementById('recruiter-label');
  var logoutEl = document.getElementById('logout');
  var newSessionEl = document.getElementById('new-session');
  var emptyEl = document.getElementById('sessions-empty');
  var tableEl = document.getElementById('sessions-table');
  var tbodyEl = document.getElementById('sessions-tbody');
  var errorEl = document.getElementById('error');

  var nsDialog = document.getElementById('new-session-dialog');
  var nsForm = document.getElementById('new-session-form');
  var nsCancel = document.getElementById('ns-cancel');
  var nsError = document.getElementById('ns-error');

  var resultDialog = document.getElementById('result-dialog');
  var resultBody = document.getElementById('result-body');
  var resultClose = document.getElementById('result-close');

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function clearError() {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }
  function showNsError(msg) {
    nsError.textContent = msg;
    nsError.hidden = false;
  }
  function clearNsError() {
    nsError.textContent = '';
    nsError.hidden = true;
  }

  function fmtDate(iso) {
    if (!iso) return '—';
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return iso;
    }
  }

  async function loadWhoami() {
    var res = await fetch('/v1/auth/whoami', { credentials: 'include' });
    if (!res.ok) {
      window.location.assign('/login.html');
      throw new Error('not signed in');
    }
    var body = await res.json();
    labelEl.textContent = body.recruiter && body.recruiter.email ? body.recruiter.email : '';
  }

  async function loadSessions() {
    clearError();
    try {
      var res = await fetch('/v1/sessions?limit=200', { credentials: 'include' });
      if (res.status === 401) {
        window.location.assign('/login.html');
        return;
      }
      if (!res.ok) {
        showError('Could not load sessions.');
        return;
      }
      var body = await res.json();
      var rows = (body && body.data) || [];
      tbodyEl.innerHTML = '';
      if (rows.length === 0) {
        emptyEl.hidden = false;
        tableEl.hidden = true;
        return;
      }
      emptyEl.hidden = true;
      tableEl.hidden = false;
      rows.forEach(function (r) {
        var tr = document.createElement('tr');
        tr.appendChild(
          td(r.candidate_email + (r.candidate_name ? ' (' + r.candidate_name + ')' : '')),
        );
        tr.appendChild(td(r.status));
        tr.appendChild(td(r.current_question_index + ' answered'));
        tr.appendChild(
          td(r.score_max && r.score_max > 0 ? r.score_total + '/' + r.score_max : '—'),
        );
        tr.appendChild(td(fmtDate(r.created_at)));

        var actions = document.createElement('td');
        actions.className = 'row-actions';
        if (r.status === 'completed') {
          var view = document.createElement('button');
          view.type = 'button';
          view.textContent = 'Result';
          view.addEventListener('click', function () {
            viewResult(r.id);
          });
          actions.appendChild(view);
        } else if (r.status === 'pending' || r.status === 'in_progress') {
          var rev = document.createElement('button');
          rev.type = 'button';
          rev.textContent = 'Revoke';
          rev.addEventListener('click', function () {
            revokeSession(r.id);
          });
          actions.appendChild(rev);
        }
        tr.appendChild(actions);
        tbodyEl.appendChild(tr);
      });
    } catch {
      showError('Network error loading sessions.');
    }
  }

  function td(text) {
    var el = document.createElement('td');
    el.textContent = text;
    return el;
  }

  async function revokeSession(id) {
    if (!confirm('Revoke this session?')) return;
    try {
      var res = await fetch('/v1/sessions/' + encodeURIComponent(id) + '/revoke', {
        method: 'POST',
        credentials: 'include',
      });
      if (res.ok || res.status === 204) {
        await loadSessions();
      } else {
        showError('Could not revoke session.');
      }
    } catch {
      showError('Network error revoking session.');
    }
  }

  async function viewResult(id) {
    try {
      var res = await fetch('/v1/results/' + encodeURIComponent(id), {
        credentials: 'include',
        headers: { Accept: 'application/json' },
      });
      if (!res.ok) {
        showError('Could not load result.');
        return;
      }
      var body = await res.json();
      resultBody.textContent = JSON.stringify(body, null, 2);
      resultDialog.showModal();
    } catch {
      showError('Network error loading result.');
    }
  }

  newSessionEl.addEventListener('click', function () {
    clearNsError();
    nsForm.reset();
    nsDialog.showModal();
  });

  nsCancel.addEventListener('click', function () {
    nsDialog.close();
  });

  nsForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    clearNsError();
    var fd = new FormData(nsForm);
    var payload = {
      pack_id: String(fd.get('pack_id') || '').trim(),
      candidate_email: String(fd.get('candidate_email') || '').trim(),
    };
    var name = String(fd.get('candidate_name') || '').trim();
    if (name) payload.candidate_name = name;

    try {
      var res = await fetch('/v1/sessions', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        var detail = 'Could not create session.';
        try {
          var b = await res.json();
          if (b && b.detail) detail = b.detail;
        } catch {
          /* fall through */
        }
        showNsError(detail);
        return;
      }
      var body = await res.json();
      nsDialog.close();
      await loadSessions();
      if (body.take_url) {
        prompt('Take URL (copy + send to candidate):', body.take_url);
      }
    } catch {
      showNsError('Network error creating session.');
    }
  });

  resultClose.addEventListener('click', function () {
    resultDialog.close();
  });

  logoutEl.addEventListener('click', async function () {
    try {
      await fetch('/v1/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      /* ignore — redirect anyway */
    }
    window.location.assign('/login.html');
  });

  (async function init() {
    try {
      await loadWhoami();
      await loadSessions();
    } catch {
      // loadWhoami already redirects on 401
    }
  })();
})();
