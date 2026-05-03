/**
 * Hand-written section content compiled to inline HTML at build time.
 * Keeps the docs site dependency-free; no markdown runtime needed.
 */

import type { DocSection } from './sections.js';

const PRE = (code: string): string =>
  `<pre style="background:#1a1a1a;color:#f0f0f0;padding:16px;border-radius:8px;font-size:12px;overflow-x:auto"><code>${escape(
    code,
  )}</code></pre>`;

const H2 = (text: string): string => `<h2 style="font-size:18px;margin-top:24px">${text}</h2>`;
const H3 = (text: string): string => `<h3 style="font-size:15px;margin-top:18px">${text}</h3>`;
const P = (html: string): string => `<p>${html}</p>`;
const TABLE = (rows: string[][]): string => {
  const head = rows[0]
    ?.map(
      (c) => `<th style="text-align:left;padding:8px;border-bottom:1px solid #e5e5e5">${c}</th>`,
    )
    .join('');
  const body = rows
    .slice(1)
    .map(
      (r) =>
        `<tr>${r
          .map(
            (c) =>
              `<td style="padding:8px;border-bottom:1px solid #f0f0f0;font-size:13px">${c}</td>`,
          )
          .join('')}</tr>`,
    )
    .join('');
  return `<table style="border-collapse:collapse;width:100%;margin-top:8px"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
};

export function renderSection(section: DocSection): string {
  switch (section.slug) {
    case 'overview':
      return [
        P(
          'All requests are made to <code>https://api.qorium.io/v1</code>. ' +
            'TLS 1.3 or higher is required; plain HTTP is rejected with HTTP 426.',
        ),
        H2('Regional endpoints'),
        TABLE([
          ['Region', 'URL'],
          ['India (primary)', '<code>https://api.qorium.io/v1</code>'],
          ['US (fallback)', '<code>https://us-api.qorium.io/v1</code>'],
          ['APAC (M8 roadmap)', '<code>https://apac-api.qorium.io/v1</code>'],
        ]),
      ].join('');
    case 'authentication':
      return [
        H2('API keys'),
        P('Bearer tokens follow the format <code>qor_[SKU]_[TENANT]_[32_HEX]</code>.'),
        PRE(
          `curl -X GET https://api.qorium.io/v1/questions \\
  -H "Authorization: Bearer qor_readybank_acme_a1b2c3d4..." \\
  -H "Accept: application/json"`,
        ),
        H3('HMAC request signing (optional, for audit)'),
        P('Use <code>@qorium/sdk</code> <code>signRequest()</code> to sign mutating calls.'),
        PRE(
          `Authorization: QOR-HMAC-SHA256 Credential=qor_..., SignedHeaders=host;x-qor-date, Signature=<hex>
X-QOR-Date: 2026-05-03T10:30:00Z`,
        ),
        H2('JWT (browser sessions)'),
        P(
          'Session JWTs are issued by <code>POST /v1/auth/saml/acs</code> after a valid ' +
            'SAML assertion. See the <a href="/sso">SSO section</a>.',
        ),
      ].join('');
    case 'rate-limits':
      return [
        P(
          'Limits are evaluated per (tenant, API key, route group). Exceeding a limit ' +
            'returns <code>429 Too Many Requests</code> with a <code>Retry-After</code> header.',
        ),
        TABLE([
          ['Plan', 'Per-minute', 'Burst'],
          ['Free / trial', '60', '120'],
          ['Standard', '600', '1200'],
          ['Enterprise', 'custom', 'custom'],
        ]),
      ].join('');
    case 'errors':
      return [
        P('Errors follow RFC 7807 problem JSON.'),
        PRE(
          `{
  "type": "about:blank",
  "title": "Invalid signature",
  "status": 401,
  "detail": "Webhook signature failed HMAC-SHA256 verification"
}`,
        ),
      ].join('');
    case 'idempotency':
      return [
        P(
          'Mutating endpoints (POST/PUT/DELETE on orders, payment intents, ' +
            'webhook subscriptions) accept an <code>Idempotency-Key</code> header. ' +
            'Replays of the same key return the original response without re-execution.',
        ),
        PRE(
          `curl -X POST https://api.qorium.io/v1/jd-forge/orders \\
  -H "Authorization: Bearer qor_jdforge_acme_..." \\
  -H "Idempotency-Key: 9f0a3b1e-..." \\
  -d '{"jd_text":"...","tier":"standard"}'`,
        ),
      ].join('');
    case 'pagination':
      return [
        P(
          'List endpoints accept <code>limit</code> (default 50, max 200) and <code>offset</code>. ' +
            'Responses include the limit, offset, and (where cheap to compute) the total.',
        ),
        PRE(
          `{
  "items": [...],
  "limit": 50,
  "offset": 100,
  "total": 1234
}`,
        ),
      ].join('');
    case 'readybank':
      return [
        H2('Endpoints'),
        TABLE([
          ['Method', 'Path', 'Purpose'],
          ['GET', '/v1/questions', 'List questions (filter by sku, status, skill)'],
          ['GET', '/v1/questions/{id}', 'Single question detail'],
          ['POST', '/v1/packs', 'Generate a question pack'],
          ['GET', '/v1/packs/{id}/export', 'Download pack as JSON / CSV / xlsx'],
        ]),
      ].join('');
    case 'jd-forge':
      return [
        H2('Endpoints'),
        TABLE([
          ['Method', 'Path', 'Purpose'],
          ['POST', '/v1/jd-forge/orders', 'Create generation order (idempotent)'],
          ['GET', '/v1/jd-forge/orders/{id}', 'Order status + generated questions'],
        ]),
        H3('Tiers'),
        TABLE([
          ['Tier', 'SLA', 'Includes'],
          ['standard', '30s', 'AI generation only'],
          ['reviewed', '24h', 'AI + SME review'],
          ['enterprise', 'custom', 'AI + SME + custom seed corpus'],
        ]),
      ].join('');
    case 'stack-vault':
      return [
        P(
          'Stack-Vault gives each enterprise customer a private namespace ' +
            'with watermarked content; questions are derived from the shared ' +
            "ReadyBank corpus and re-signed with the customer's vault secret.",
        ),
        H2('Endpoints'),
        TABLE([
          ['Method', 'Path', 'Purpose'],
          ['GET', '/v1/stack-vault/bundles', 'List active vault bundles'],
          ['POST', '/v1/stack-vault/bundles', 'Create / re-watermark a bundle'],
        ]),
      ].join('');
    case 'webhooks':
      return [
        H2('Subscriptions'),
        TABLE([
          ['Method', 'Path', 'Purpose'],
          ['GET', '/v1/webhooks/subscriptions', 'List subscriptions'],
          ['POST', '/v1/webhooks/subscriptions', 'Create (returns signing secret once)'],
          ['PATCH', '/v1/webhooks/subscriptions/{id}', 'Toggle is_active'],
          ['DELETE', '/v1/webhooks/subscriptions/{id}', 'Delete'],
        ]),
        H2('Delivery signing'),
        P(
          'Each delivery includes <code>X-QOrium-Signature: sha256=&lt;base64&gt;</code> + ' +
            '<code>X-QOrium-Timestamp</code>. Verify with the signing secret returned at ' +
            'subscription creation. The retry curve is 1m, 5m, 30m, 4h, 24h with a 35-hour cap.',
        ),
      ].join('');
    case 'sso':
      return [
        H2('Endpoints'),
        TABLE([
          ['Method', 'Path', 'Purpose'],
          ['GET', '/v1/auth/saml/metadata', 'SP metadata XML for the IdP'],
          ['POST', '/v1/auth/saml/acs', 'SAML assertion consumer'],
          ['POST', '/v1/auth/saml/login', 'Initiate SAML flow'],
          ['POST', '/v1/auth/logout', 'Logout (drops session cookie)'],
          ['GET', '/v1/sso/configurations', 'Read tenant configuration'],
          ['PUT', '/v1/sso/configurations', 'Upsert tenant configuration'],
        ]),
      ].join('');
    case 'audit-log':
      return [
        H2('Endpoints'),
        TABLE([
          ['Method', 'Path', 'Purpose'],
          ['GET', '/v1/audit/events', 'List events (filter by action, resource, actor, date)'],
          ['GET', '/v1/audit/events/{id}', 'Single event detail'],
          ['GET', '/v1/audit/summary', 'Top-N action counts in window'],
        ]),
      ].join('');
    case 'sdk-typescript':
      return [
        P('Install with <code>pnpm add @qorium/sdk</code> (workspace-private until npm publish).'),
        PRE(
          `import { QoriumClient, ReadyBankResource } from '@qorium/sdk';

const client = new QoriumClient({
  baseUrl: 'https://api.qorium.io/v1',
  apiKey: process.env.QORIUM_API_KEY,
  tenantId: '11111111-2222-3333-4444-555555555555',
});

const readyBank = new ReadyBankResource(client);
const page = await readyBank.list({ limit: 50, sku: 'readybank' });
console.log(\`got \${page.items.length} of \${page.total ?? 'unknown'} questions\`);`,
        ),
      ].join('');
    case 'changelog':
      return [
        H3('v0.1.0 — 2026-05-03'),
        P('Initial v0 surface: ReadyBank, JD-Forge, Stack-Vault, Webhooks, SSO, Audit Log.'),
      ].join('');
    default:
      return P('Section under construction.');
  }
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
