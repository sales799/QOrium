// Invitation acceptance form. POSTs { token, password } to /v1/auth/accept;
// the server validates the token, hashes the password, and activates the
// recruiter row. On success the form swaps to a "go to sign in" success
// state. The token comes from the ?token=... query string in the mailed
// invitation link.

(function () {
  var form = document.getElementById('accept-form');
  var passwordEl = document.getElementById('password');
  var confirmEl = document.getElementById('confirm');
  var submitEl = document.getElementById('submit');
  var errorEl = document.getElementById('error');
  var successEl = document.getElementById('success');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function getToken() {
    var params = new URLSearchParams(window.location.search);
    var token = params.get('token');
    return token && token.length >= 16 ? token : null;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearError();

    var token = getToken();
    if (!token) {
      showError('Missing invitation token. Open the link from your email.');
      return;
    }
    if (passwordEl.value !== confirmEl.value) {
      showError('Passwords do not match.');
      return;
    }
    if (passwordEl.value.length < 12) {
      showError('Password must be at least 12 characters.');
      return;
    }

    submitEl.disabled = true;

    try {
      var response = await fetch('/v1/auth/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: token, password: passwordEl.value }),
      });

      if (response.status === 204) {
        form.querySelectorAll('label, input, button').forEach(function (el) {
          el.hidden = true;
        });
        successEl.hidden = false;
        return;
      }

      var detail = 'Could not activate account.';
      try {
        var body = await response.json();
        if (body && typeof body.detail === 'string') detail = body.detail;
      } catch {
        /* fall through */
      }
      showError(detail);
    } catch {
      showError('Network error. Check your connection and try again.');
    } finally {
      submitEl.disabled = false;
    }
  });
})();
