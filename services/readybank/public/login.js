// Recruiter login form. Posts JSON to /v1/auth/login; HttpOnly session cookie
// is set by the server. On success we redirect to the recruiter dashboard
// (placeholder — Stream B owns the real route).

(function () {
  var form = document.getElementById('login-form');
  var emailEl = document.getElementById('email');
  var passwordEl = document.getElementById('password');
  var submitEl = document.getElementById('submit');
  var errorEl = document.getElementById('error');

  function showError(message) {
    errorEl.textContent = message;
    errorEl.hidden = false;
  }

  function clearError() {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    clearError();
    submitEl.disabled = true;

    try {
      var response = await fetch('/v1/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailEl.value.trim(),
          password: passwordEl.value,
        }),
      });

      if (response.ok) {
        window.location.assign('/recruiter/');
        return;
      }

      var detail = 'Sign in failed. Please try again.';
      try {
        var body = await response.json();
        if (body && typeof body.detail === 'string') detail = body.detail;
      } catch {
        /* fall through with default detail */
      }
      showError(detail);
    } catch {
      showError('Network error. Check your connection and try again.');
    } finally {
      submitEl.disabled = false;
    }
  });
})();
