// Candidate take-flow client. State lives on the server; this UI just
// fetches /api/state, renders, posts /api/answer, and re-renders.
(function () {
  var progressEl = document.getElementById('progress');
  var questionEl = document.getElementById('question');
  var bodyEl = document.getElementById('body');
  var optionsEl = document.getElementById('options');
  var freeformEl = document.getElementById('freeform');
  var submitEl = document.getElementById('submit');
  var errorEl = document.getElementById('error');
  var doneEl = document.getElementById('done');
  var scoreEl = document.getElementById('score');

  var currentQuestion = null;
  var startedAt = 0;

  function showError(msg) {
    errorEl.textContent = msg;
    errorEl.hidden = false;
  }
  function clearError() {
    errorEl.textContent = '';
    errorEl.hidden = true;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function render(state) {
    clearError();
    if (state.state === 'completed') {
      questionEl.hidden = true;
      doneEl.hidden = false;
      if (state.score_max > 0) {
        var pct = Math.round((state.score_total / state.score_max) * 100);
        scoreEl.textContent =
          'Score: ' + state.score_total + ' / ' + state.score_max + ' (' + pct + '%)';
      } else {
        scoreEl.textContent =
          'Answers submitted: ' + (state.answered || state.total_questions || 0);
      }
      progressEl.textContent = 'Completed';
      return;
    }

    questionEl.hidden = false;
    doneEl.hidden = true;
    progressEl.textContent = 'Question ' + (state.index + 1) + ' of ' + state.total_questions;

    currentQuestion = state.question;
    bodyEl.textContent = currentQuestion.body || '';

    optionsEl.innerHTML = '';
    freeformEl.hidden = true;
    freeformEl.value = '';

    var opts = currentQuestion.options;
    var isMcq = Array.isArray(opts) && opts.length > 0;
    if (isMcq) {
      optionsEl.hidden = false;
      var letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      opts.forEach(function (opt, i) {
        var letter = letters[i] || String(i + 1);
        var li = document.createElement('li');
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option';
        btn.dataset.value = letter;
        btn.innerHTML =
          '<span class="letter">' +
          escapeHtml(letter) +
          '</span><span class="option-text">' +
          escapeHtml(String(opt)) +
          '</span>';
        btn.addEventListener('click', function () {
          var prev = optionsEl.querySelector('.option.selected');
          if (prev) prev.classList.remove('selected');
          btn.classList.add('selected');
        });
        li.appendChild(btn);
        optionsEl.appendChild(li);
      });
    } else {
      optionsEl.hidden = true;
      freeformEl.hidden = false;
    }
    startedAt = Date.now();
  }

  async function loadState() {
    try {
      var res = await fetch('/api/state', { credentials: 'include' });
      if (!res.ok) {
        var detail = 'Could not load assessment.';
        try {
          var b = await res.json();
          if (b && b.detail) detail = b.detail;
        } catch {
          /* fall through to default detail */
        }
        showError(detail);
        return;
      }
      var state = await res.json();
      render(state);
    } catch {
      showError('Network error loading assessment.');
    }
  }

  async function submitAnswer() {
    if (!currentQuestion) return;
    var selected = optionsEl.querySelector('.option.selected');
    var value = '';
    if (Array.isArray(currentQuestion.options) && currentQuestion.options.length > 0) {
      if (!selected) {
        showError('Pick an option first.');
        return;
      }
      value = selected.dataset.value;
    } else {
      value = freeformEl.value.trim();
      if (!value) {
        showError('Type an answer first.');
        return;
      }
    }

    submitEl.disabled = true;
    clearError();
    try {
      var res = await fetch('/api/answer', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question_id: currentQuestion.id,
          value: value,
          time_taken_ms: Date.now() - startedAt,
        }),
      });
      if (!res.ok) {
        var detail = 'Could not submit answer.';
        try {
          var b = await res.json();
          if (b && b.detail) detail = b.detail;
        } catch {
          /* fall through */
        }
        showError(detail);
        return;
      }
      var state = await res.json();
      if (state.state === 'completed') {
        render(state);
      } else {
        await loadState();
      }
    } catch {
      showError('Network error submitting answer.');
    } finally {
      submitEl.disabled = false;
    }
  }

  submitEl.addEventListener('click', submitAnswer);
  loadState();
})();
