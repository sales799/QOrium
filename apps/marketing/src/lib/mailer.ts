import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env } from '@/lib/env';

export interface MailPayload {
  to?: string | string[];
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export type MailResult =
  | { ok: true; via: 'graph' | 'resend' | 'gmail' | 'console' }
  | { ok: false; error: string };

/**
 * Acquire an OAuth2 access token using the client credentials flow.
 * Uses native fetch — no extra deps needed (Node 18+).
 */
async function getGraphToken(): Promise<string> {
  const tokenUrl = `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: env.AZURE_CLIENT_ID!,
    client_secret: env.AZURE_CLIENT_SECRET!,
    scope: 'https://graph.microsoft.com/.default',
    grant_type: 'client_credentials',
  });

  const res = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token request failed (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

/**
 * Send email via Microsoft Graph API sendMail endpoint.
 * Uses Application permission Mail.Send (no user sign-in needed).
 */
async function sendViaGraph(payload: MailPayload): Promise<void> {
  const token = await getGraphToken();
  const sender = env.M365_SENDER_EMAIL!;
  const graphUrl = `https://graph.microsoft.com/v1.0/users/${sender}/sendMail`;
  const recipients = Array.isArray(payload.to)
    ? payload.to
    : [payload.to ?? env.CONTACT_TO_EMAIL];

  const message: Record<string, unknown> = {
    subject: payload.subject,
    body: {
      contentType: payload.html ? 'HTML' : 'Text',
      content: payload.html || payload.text,
    },
    toRecipients: recipients.map((address) => ({ emailAddress: { address } })),
  };

  if (payload.replyTo) {
    message.replyTo = [{ emailAddress: { address: payload.replyTo } }];
  }

  const res = await fetch(graphUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, saveToSentItems: false }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Graph sendMail failed (${res.status}): ${text}`);
  }
}

export async function sendMail(payload: MailPayload): Promise<MailResult> {
  // Strategy 1: Microsoft Graph API (primary — zero incremental cost, MFA-compatible)
  if (
    env.AZURE_TENANT_ID &&
    env.AZURE_CLIENT_ID &&
    env.AZURE_CLIENT_SECRET &&
    env.M365_SENDER_EMAIL
  ) {
    try {
      await sendViaGraph(payload);
      return { ok: true, via: 'graph' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Graph API send failed';
      console.error('[mailer] Graph API failed, falling through:', msg);
    }
  }

  // Strategy 2: Resend (fallback)
  if (env.RESEND_API_KEY) {
    try {
      const resend = new Resend(env.RESEND_API_KEY);
      await resend.emails.send({
        from: env.CONTACT_FROM_EMAIL,
        to: payload.to ?? env.CONTACT_TO_EMAIL,
        subject: payload.subject,
        text: payload.text,
        ...(payload.html ? { html: payload.html } : {}),
        ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      });
      return { ok: true, via: 'resend' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Resend send failed';
      console.error('[mailer] Resend failed, falling through:', msg);
    }
  }

  // Strategy 3: Gmail SMTP (legacy fallback)
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
      });
      await transporter.sendMail({
        from: env.CONTACT_FROM_EMAIL,
        to: payload.to ?? env.CONTACT_TO_EMAIL,
        subject: payload.subject,
        text: payload.text,
        ...(payload.html ? { html: payload.html } : {}),
        ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      });
      return { ok: true, via: 'gmail' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Gmail send failed';
      return { ok: false, error: msg };
    }
  }

  // Strategy 4: Console fallback (dev / unconfigured)
  console.warn('[mailer] No mailer configured. Form payload:', payload);
  return { ok: true, via: 'console' };
}
