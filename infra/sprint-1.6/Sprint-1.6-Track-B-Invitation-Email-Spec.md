# Sprint 1.6 · Track B — Invitation-Email Stub (SES + SendGrid + mock fallback)

**Authored:** 2026-05-04 (Run #32) · CTO Office
**Branch target:** same as Track A (recruiter feature branch)
**Replaces:** the manual "copy `take_url` to clipboard, paste into your own email" path the dashboard uses today.

---

## 1. Goal

When a recruiter creates a session via `/recruiter/dashboard.html`, the candidate's invitation should be **sent automatically** with the take URL embedded — not copy-pasted by the recruiter. This closes the Sprint 1.0 Day-1 7-of-7 DoD ("first REAL Talpro candidate") gap from "30-sec CEO action" to "0-sec CEO action; recruiter just clicks Create".

Driver-agnostic so we can flip from SES → SendGrid → SMTP without touching call sites.

---

## 2. Provider trade-off (informational; CTO decision below)

| Dimension | AWS SES | SendGrid | SMTP relay |
|---|---|---|---|
| Setup time | ~2h (sandbox → prod approval) | ~30 min | ~10 min on existing infra |
| Cost (10K/mo) | ≈ $1 | ≈ $20 (Essentials) | $0 marginal |
| Deliverability (cold domain) | needs DKIM + SPF + DMARC | hosted reputation | poor on cold IP |
| Suppression list | Account-level | Account-level | Manual |
| India SMS-equivalent risk | Low (transactional) | Low (transactional) | Low |
| **CTO decision** | **Default** for prod | Fallback if SES regional outage | **NOT used** in prod |

**CTO ratification (Decision Framework, weighted):**
- P1 Security 5/5 (SES IAM-bound, no API key in env if using IRSA on EKS later)
- P2 Cost 5/5 (~$0.10 per 1K)
- P3 Revenue impact 4/5 (unblocks Customer Zero Day-1 fully)
- P4 Performance 4/5 (SES regional latency ≤ 200ms from ap-south-1)
- P5 Simplicity 4/5 (provider abstraction adds one file, not a framework)
- Weighted score: 4.55 / 5 → APPROVE.

Mock driver always present (no env keys → mock auto-selected; emails go to `app.email_log` only; useful for dev/CI).

---

## 3. Schema migration `0005_email.sql`

```sql
-- File: services/readybank/db/migrations/0005_email.sql

BEGIN;

CREATE TABLE IF NOT EXISTS app.email_log (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid NOT NULL REFERENCES app.tenants(id) ON DELETE CASCADE,
  session_id      uuid REFERENCES app.sessions(id) ON DELETE SET NULL,
  recruiter_id    uuid REFERENCES app.recruiters(id) ON DELETE SET NULL,
  to_email        citext NOT NULL,
  from_email      citext NOT NULL,
  subject         text NOT NULL,
  template_key    text NOT NULL,
  body_html_sha256 text NOT NULL,        -- audit; never store full body in DB
  provider        text NOT NULL,          -- 'ses' | 'sendgrid' | 'mock'
  provider_msg_id text,
  status          text NOT NULL DEFAULT 'queued', -- queued|sent|failed|bounced|complained
  error_code      text,
  attempts        int NOT NULL DEFAULT 0,
  queued_at       timestamptz NOT NULL DEFAULT now(),
  sent_at         timestamptz,
  bounced_at      timestamptz,
  complained_at   timestamptz
);

CREATE INDEX IF NOT EXISTS email_log_tenant_session_idx
  ON app.email_log(tenant_id, session_id);
CREATE INDEX IF NOT EXISTS email_log_status_idx
  ON app.email_log(status) WHERE status IN ('queued','failed');

CREATE TABLE IF NOT EXISTS app.email_suppressions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id       uuid REFERENCES app.tenants(id) ON DELETE CASCADE,
  email           citext NOT NULL,
  reason          text NOT NULL,          -- 'bounce-hard' | 'complaint' | 'manual' | 'invalid'
  added_at        timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT email_suppressions_unique UNIQUE (tenant_id, email)
);

COMMIT;
```

---

## 4. Mailer abstraction (`services/readybank/src/lib/mailer.ts`)

```ts
// File: services/readybank/src/lib/mailer.ts
// Sprint 1.6 Track B — provider-agnostic transactional mailer

import { createHash } from 'node:crypto';
import type { PoolClient } from 'pg';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;             // plain-text fallback for accessibility / spam scoring
  templateKey: string;      // e.g. 'candidate-invitation-v1'
  tenantId: string;
  sessionId?: string | null;
  recruiterId?: string | null;
  replyTo?: string;
}

export interface SendResult {
  status: 'sent' | 'failed' | 'suppressed';
  provider: 'ses' | 'sendgrid' | 'mock';
  providerMessageId?: string | null;
  error?: string;
}

export interface MailDriver {
  name: 'ses' | 'sendgrid' | 'mock';
  send(msg: MailMessage, fromEmail: string): Promise<SendResult>;
}

// ---------------------- SES driver ----------------------
class SesDriver implements MailDriver {
  name = 'ses' as const;
  private client: any; // dynamic import; AWS SDK only loaded when SES is selected
  private from: string;

  constructor(opts: { region: string; from: string }) {
    this.from = opts.from;
    // Lazy-load AWS SDK; keep cold start tight when MOCK is the active driver.
    const { SESv2Client } = require('@aws-sdk/client-sesv2');
    this.client = new SESv2Client({ region: opts.region });
  }

  async send(msg: MailMessage): Promise<SendResult> {
    const { SendEmailCommand } = require('@aws-sdk/client-sesv2');
    const cmd = new SendEmailCommand({
      FromEmailAddress: this.from,
      Destination: { ToAddresses: [msg.to] },
      Content: {
        Simple: {
          Subject: { Data: msg.subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: msg.html, Charset: 'UTF-8' },
            Text: { Data: msg.text, Charset: 'UTF-8' },
          },
        },
      },
      ReplyToAddresses: msg.replyTo ? [msg.replyTo] : undefined,
      ConfigurationSetName: process.env.SES_CONFIG_SET || undefined,  // bounce/complaint webhooks
    });
    try {
      const r = await this.client.send(cmd);
      return { status: 'sent', provider: 'ses', providerMessageId: r.MessageId };
    } catch (e: any) {
      return { status: 'failed', provider: 'ses', error: e?.name || 'SesError' };
    }
  }
}

// ---------------------- SendGrid driver ----------------------
class SendGridDriver implements MailDriver {
  name = 'sendgrid' as const;
  private apiKey: string;
  private from: string;
  constructor(opts: { apiKey: string; from: string }) {
    this.apiKey = opts.apiKey;
    this.from = opts.from;
  }
  async send(msg: MailMessage): Promise<SendResult> {
    try {
      const r = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: msg.to }] }],
          from: { email: this.from },
          reply_to: msg.replyTo ? { email: msg.replyTo } : undefined,
          subject: msg.subject,
          content: [
            { type: 'text/plain', value: msg.text },
            { type: 'text/html',  value: msg.html },
          ],
        }),
      });
      if (r.status === 202) {
        return {
          status: 'sent', provider: 'sendgrid',
          providerMessageId: r.headers.get('x-message-id'),
        };
      }
      return { status: 'failed', provider: 'sendgrid', error: `sendgrid-${r.status}` };
    } catch (e: any) {
      return { status: 'failed', provider: 'sendgrid', error: e?.message || 'SendGridError' };
    }
  }
}

// ---------------------- Mock driver (default in dev/CI) ----------------------
class MockDriver implements MailDriver {
  name = 'mock' as const;
  async send(msg: MailMessage): Promise<SendResult> {
    // Log only; emails are persisted to app.email_log by the wrapper below.
    return { status: 'sent', provider: 'mock', providerMessageId: `mock-${Date.now()}` };
  }
}

// ---------------------- Factory ----------------------
let _driver: MailDriver | null = null;
let _from = 'noreply@qorium.online';

export function getMailer(): { driver: MailDriver; from: string } {
  if (_driver) return { driver: _driver, from: _from };
  const which = (process.env.MAIL_DRIVER || '').toLowerCase();
  _from = process.env.MAIL_FROM || 'QOrium <noreply@qorium.online>';
  if (which === 'ses' && process.env.AWS_REGION) {
    _driver = new SesDriver({ region: process.env.AWS_REGION!, from: _from });
  } else if (which === 'sendgrid' && process.env.SENDGRID_API_KEY) {
    _driver = new SendGridDriver({
      apiKey: process.env.SENDGRID_API_KEY!, from: _from,
    });
  } else {
    _driver = new MockDriver();
  }
  return { driver: _driver, from: _from };
}

// ---------------------- Public send API ----------------------
export async function sendMail(
  pg: { query: (sql: string, params?: any[]) => Promise<any> },
  msg: MailMessage,
): Promise<SendResult> {
  // Suppression check first (skip even if MOCK)
  const sup = await pg.query(
    `SELECT 1 FROM app.email_suppressions
      WHERE tenant_id = $1 AND email = $2 LIMIT 1`,
    [msg.tenantId, msg.to],
  );
  if (sup.rowCount > 0) {
    return { status: 'suppressed', provider: 'mock', error: 'suppressed-list' };
  }

  const { driver, from } = getMailer();
  const bodyHash = createHash('sha256').update(msg.html).digest('hex');

  // Insert pre-send row
  const ins = await pg.query(
    `INSERT INTO app.email_log
       (tenant_id, session_id, recruiter_id, to_email, from_email,
        subject, template_key, body_html_sha256, provider, status, attempts)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'queued', 1)
     RETURNING id`,
    [
      msg.tenantId, msg.sessionId || null, msg.recruiterId || null,
      msg.to, from, msg.subject, msg.templateKey, bodyHash, driver.name,
    ],
  );
  const logId = ins.rows[0].id;

  const r = await driver.send(msg, from);

  if (r.status === 'sent') {
    await pg.query(
      `UPDATE app.email_log
          SET status = 'sent', sent_at = now(), provider_msg_id = $2
        WHERE id = $1`,
      [logId, r.providerMessageId || null],
    );
  } else if (r.status === 'failed') {
    await pg.query(
      `UPDATE app.email_log
          SET status = 'failed', error_code = $2
        WHERE id = $1`,
      [logId, (r.error || 'unknown').slice(0, 64)],
    );
  } else {
    await pg.query(
      `UPDATE app.email_log
          SET status = 'failed', error_code = 'suppressed'
        WHERE id = $1`,
      [logId],
    );
  }

  return r;
}
```

`package.json` additions:

```json
"@aws-sdk/client-sesv2": "^3.633.0"
```

(Optional dep — only loaded when `MAIL_DRIVER=ses`. SendGrid path uses native fetch, no extra dep.)

---

## 5. Email template (`services/readybank/src/templates/candidate-invitation-v1.ts`)

```ts
// File: services/readybank/src/templates/candidate-invitation-v1.ts

export interface InvitationVars {
  candidateName: string;            // "Priya Sharma" — falls back to "Candidate"
  packTitle: string;                // "Senior Java — 6 Q smoke test"
  takeUrl: string;                  // https://api.qorium.online/take/<token>
  expiresAtIso: string;             // ISO timestamp
  recruiterEmail: string;           // for reply-to
  companyName: string;              // tenant display name, e.g. "Talpro India"
  durationMinutes: number;          // e.g. 30
}

export function renderInvitationHtml(v: InvitationVars): string {
  const expiry = new Date(v.expiresAtIso).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
  });
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(v.packTitle)} · QOrium</title>
</head>
<body style="margin:0;padding:0;background:#f4f6fb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1a2746;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6fb;padding:32px 0;">
  <tr><td align="center">
    <table role="presentation" width="560" cellpadding="0" cellspacing="0"
      style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px rgba(11,18,32,0.08);">
      <tr><td style="background:#0b1220;padding:24px 32px;">
        <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:0.2px;">
          Q<span style="color:#f59e0b;">Orium</span>
        </div>
      </td></tr>
      <tr><td style="padding:32px;">
        <h1 style="margin:0 0 12px;font-size:20px;color:#0b1220;">
          Hello ${escapeHtml(v.candidateName)},
        </h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.55;color:#334155;">
          ${escapeHtml(v.companyName)} has invited you to take a short technical assessment:
          <strong>${escapeHtml(v.packTitle)}</strong>.
        </p>
        <p style="margin:0 0 24px;font-size:14px;color:#475569;">
          The assessment runs in your browser. Please set aside about ${v.durationMinutes} minutes
          and use a quiet space. Your responses are submitted automatically.
        </p>
        <div style="text-align:center;margin:28px 0;">
          <a href="${escapeAttr(v.takeUrl)}"
             style="display:inline-block;background:#f59e0b;color:#0b1220;text-decoration:none;padding:13px 28px;border-radius:8px;font-weight:600;font-size:15px;">
            Start your assessment
          </a>
        </div>
        <p style="margin:0 0 6px;font-size:13px;color:#64748b;">
          Or copy this link into your browser:
        </p>
        <p style="margin:0 0 24px;font-size:13px;word-break:break-all;color:#0b1220;">
          <a href="${escapeAttr(v.takeUrl)}" style="color:#0b1220;">${escapeHtml(v.takeUrl)}</a>
        </p>
        <p style="margin:0 0 12px;font-size:13px;color:#64748b;">
          This link expires on <strong>${escapeHtml(expiry)} IST</strong>.
        </p>
        <p style="margin:0;font-size:13px;color:#64748b;">
          Questions? Reply to this email — it goes to ${escapeHtml(v.recruiterEmail)}.
        </p>
      </td></tr>
      <tr><td style="background:#f8fafc;padding:18px 32px;font-size:11px;color:#94a3b8;border-top:1px solid #e2e8f0;">
        QOrium is a question-bank service operated by Talpro India Pvt Ltd.
        We never share your responses outside ${escapeHtml(v.companyName)}'s hiring team.
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`;
}

export function renderInvitationText(v: InvitationVars): string {
  const expiry = new Date(v.expiresAtIso).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short', timeZone: 'Asia/Kolkata',
  });
  return [
    `Hello ${v.candidateName},`,
    ``,
    `${v.companyName} has invited you to take a short technical assessment: ${v.packTitle}.`,
    ``,
    `Set aside about ${v.durationMinutes} minutes in a quiet space. Your responses submit automatically.`,
    ``,
    `Start your assessment:`,
    v.takeUrl,
    ``,
    `This link expires on ${expiry} IST.`,
    ``,
    `Questions? Reply to this email — it goes to ${v.recruiterEmail}.`,
    ``,
    `--`,
    `QOrium · Question-bank service operated by Talpro India Pvt Ltd.`,
    `We never share your responses outside ${v.companyName}'s hiring team.`,
  ].join('\n');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
  ));
}
function escapeAttr(s: string): string { return escapeHtml(s); }
```

---

## 6. Route — `POST /v1/sessions/:id/send-invite`

```ts
// File: services/readybank/src/routes/sessions-send-invite.ts
// Sprint 1.6 Track B — invite-send endpoint

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { sendMail } from '../lib/mailer';
import {
  renderInvitationHtml, renderInvitationText, type InvitationVars,
} from '../templates/candidate-invitation-v1';
import { recruiterAuth } from './recruiter-auth';
import { HttpProblem } from '../lib/problem';

const Body = z.object({
  candidate_email: z.string().email().max(254),
  candidate_name: z.string().min(1).max(120).default('Candidate'),
});

export async function sessionsSendInviteRoutes(app: FastifyInstance) {
  app.post('/v1/sessions/:id/send-invite', { preHandler: [recruiterAuth] }, async (req: any, reply) => {
    const parsed = Body.safeParse(req.body);
    if (!parsed.success) {
      return new HttpProblem(reply).send(400, 'invalid-body',
        'candidate_email is required and must be a valid email', { type: 'about:blank' });
    }
    const { id } = req.params as { id: string };

    const r = await req.server.pg.query(
      `SELECT s.id, s.candidate_id, s.token, s.expires_at, s.pack_name,
              s.recruiter_email, s.tenant_id, t.display_name AS tenant_name,
              array_length(s.question_ids, 1) AS qcount
         FROM app.sessions s
         JOIN app.tenants t ON t.id = s.tenant_id
        WHERE s.id = $1 AND s.tenant_id = $2 AND s.status IN ('pending','in_progress')`,
      [id, req.auth.tenantId],
    );
    if (r.rowCount === 0) {
      return new HttpProblem(reply).send(404, 'session-not-found',
        'Session not found, not yours, or no longer in a sendable state', { type: 'about:blank' });
    }
    const s = r.rows[0];

    const baseUrl = process.env.PUBLIC_BASE_URL || 'https://api.qorium.online';
    const vars: InvitationVars = {
      candidateName: parsed.data.candidate_name,
      packTitle: s.pack_name,
      takeUrl: `${baseUrl}/take/${s.token}`,
      expiresAtIso: new Date(s.expires_at).toISOString(),
      recruiterEmail: s.recruiter_email,
      companyName: s.tenant_name,
      durationMinutes: Math.max(15, (s.qcount || 6) * 5),
    };

    const html = renderInvitationHtml(vars);
    const text = renderInvitationText(vars);
    const subject = `Your assessment from ${vars.companyName}: ${vars.packTitle}`;

    const result = await sendMail(req.server.pg, {
      to: parsed.data.candidate_email,
      subject, html, text,
      templateKey: 'candidate-invitation-v1',
      tenantId: req.auth.tenantId,
      sessionId: id,
      recruiterId: req.auth.recruiterId,
      replyTo: s.recruiter_email,
    });

    if (result.status === 'failed') {
      return new HttpProblem(reply).send(502, 'mail-send-failed',
        `Mail provider error: ${result.error}`, { provider: result.provider });
    }
    if (result.status === 'suppressed') {
      return new HttpProblem(reply).send(409, 'mail-suppressed',
        'Recipient is on the tenant suppression list', { type: 'about:blank' });
    }
    return reply.code(202).send({
      ok: true, provider: result.provider,
      provider_message_id: result.providerMessageId,
      to: parsed.data.candidate_email,
    });
  });
}
```

Wire-up in `server.ts`:
```ts
await app.register(sessionsSendInviteRoutes);
```

Dashboard SPA (`/recruiter/dashboard.html`) gains a tiny patch on the create-session form: after a successful `POST /v1/sessions`, if the recruiter checked the "send invitation now" toggle, call `POST /v1/sessions/:id/send-invite` with `candidate_email`, then show a success toast "Invitation sent to <email>".

---

## 7. Webhooks (deferred to Sprint 1.7 but designed here)

- **SES:** create an SNS topic `qorium-ses-events`; subscribe an HTTPS endpoint at `/v1/internal/ses-event` (signature-verified). Translate Bounce / Complaint / Delivery events to `app.email_log.status` updates and add Bounce-hard / Complaint addresses to `app.email_suppressions`.
- **SendGrid:** Event Webhook to `/v1/internal/sendgrid-event` (HMAC-verified); same translation table.

This Track B ships without webhooks; status moves only between `queued|sent|failed`. Bounce/complaint enrichment lands in Sprint 1.7 alongside the webhooks bundle.

---

## 8. Env / dotenv additions (`/opt/apps/qorium/dotenv.production`)

```bash
# --- Track B mail driver ---
MAIL_DRIVER=ses                                # mock | ses | sendgrid
MAIL_FROM=QOrium <noreply@qorium.online>
PUBLIC_BASE_URL=https://api.qorium.online

# SES (only if MAIL_DRIVER=ses)
AWS_REGION=ap-south-1
# IAM credentials via instance profile or SSO; never hard-coded in dotenv
SES_CONFIG_SET=qorium-prod-events

# SendGrid fallback (only if MAIL_DRIVER=sendgrid)
# SENDGRID_API_KEY=...                          # set via SOPS / vault, not in git
```

Pre-flight (Stream B) **before flipping `MAIL_DRIVER=ses`**:
1. SES domain verification for `qorium.online` (SPF, DKIM CNAME ×3, DMARC `p=quarantine`).
2. SES sandbox → production move-out-of-sandbox request (24h-72h AWS approval).
3. SES Configuration Set `qorium-prod-events` with SNS topic for bounces/complaints.
4. Send to a known seed inbox (`bhaskar@talpro.in` + `seed@mailtest.com`) and spot-check Inbox Placement.

Until those land, **`MAIL_DRIVER=mock`** is the safe default — Customer-Zero recruiter still copies the take URL manually; the dashboard's "send invitation" button will still emit a 200 OK and write `app.email_log` rows but the candidate won't receive an actual email. This keeps the codepath honest in dev/CI and avoids accidental sandbox-burning sends.

---

## 9. Test plan (smoke)

1. `pnpm migrate` → `0005_email.sql` applies clean.
2. `pnpm -r run build` → TS clean.
3. `MAIL_DRIVER=mock` → create session → POST /v1/sessions/:id/send-invite → 202 + `provider:'mock'`; row in `app.email_log` with `status=sent`.
4. Suppress recipient (`INSERT INTO app.email_suppressions(tenant_id,email,reason) VALUES (...,'manual')`) → re-send → 409 mail-suppressed.
5. Bad email → 400 invalid-body.
6. Cross-tenant session id → 404 session-not-found (no info leak).
7. Terminal-state session (revoked/completed) → 404 (sendable-state guard).
8. `MAIL_DRIVER=sendgrid` + valid key against SendGrid sandbox → 202 + `provider:'sendgrid'`.

---

## 10. SO compliance

- **SO-13 (Security)** — body never stored; only SHA-256 fingerprint. Suppressions enforced server-side.
- **SO-15 (Audit)** — every send writes to `app.email_log` with recruiter/session/tenant scoping.
- **SO-22 (No-fiction)** — every claim above maps to a concrete file or env var.
- **SO-25 (Operational hygiene)** — mock driver default keeps prod safe until SES cert lands.

---

*End of Track B spec. Companion: code blocks above are paste-ready into Stream B repo.*
