import { adminFetch, fmtDate, renderError, renderLayout } from '/admin/_layout.js';

const main = renderLayout('panel-tokens');
main.innerHTML = `
  <h2>Reference-Panel Token Issuance</h2>
  <p class="subtitle">Mint single-use bearer tokens for the Reference Panel ingestion API. Token value is shown ONCE at creation time — capture it then; it is never recoverable. PII (name / email) NEVER enters this form per Reference Panel Governance v0.</p>

  <div class="card">
    <h3 class="tight">Mint a new token</h3>
    <div class="field">
      <label>Panelist ID hash (hex, 32–128 chars)
        <input id="panelist-id" type="text" pattern="[0-9a-fA-F]{32,128}" placeholder="64-char SHA-256 hex" />
      </label>
    </div>
    <div class="field">
      <label>TTL (days, 1–365)
        <input id="ttl" type="number" min="1" max="365" value="90" />
      </label>
    </div>
    <div class="field">
      <label>Cohort label (free text, never PII)
        <input id="cohort" type="text" placeholder="e.g. wave-1-paid-batch" />
      </label>
    </div>
    <button id="mint">Mint token</button>
    <div id="mint-result" class="spaced"></div>
  </div>
`;

const resultEl = main.querySelector('#mint-result');
main.querySelector('#mint').addEventListener('click', mint);

async function mint() {
  resultEl.innerHTML = '';
  const idHex = main.querySelector('#panelist-id').value.trim();
  const ttlDays = Number.parseInt(main.querySelector('#ttl').value || '90', 10);
  const cohort = main.querySelector('#cohort').value.trim();

  if (!/^[0-9a-fA-F]{32,128}$/.test(idHex)) {
    renderError(main, 'Panelist ID hash must be 32–128 hex chars.');
    return;
  }

  try {
    const body = {
      panelist_id_hash_hex: idHex,
      ttl_days: ttlDays,
      metadata: cohort ? { cohort } : {},
    };
    const data = await adminFetch('/v1/admin/panel-tokens', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    resultEl.innerHTML = `
      <div class="card token-card">
        <p class="tight"><strong>Token minted.</strong> Capture this value NOW — it cannot be recovered:</p>
        <code class="token" id="token-value"></code>
        <p class="fineprint">
          ID <span class="mono"></span> · expires <span class="mono"></span>
        </p>
      </div>
    `;
    resultEl.querySelector('#token-value').textContent = data.token;
    const spans = resultEl.querySelectorAll('span.mono');
    spans[0].textContent = data.id.slice(0, 8) + '…';
    spans[1].textContent = fmtDate(data.expires_at);
  } catch (err) {
    renderError(main, `Mint failed: ${err.message}`);
  }
}
