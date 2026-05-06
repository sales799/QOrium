import type { MailerMessage } from './types.js';

export interface InvitationTemplateInput {
  /** Recipient email — also the one shown in the salutation. */
  to: string;
  /** Plaintext invitation token; embedded in the accept URL. */
  token: string;
  /** Base URL of the recruiter portal, e.g. https://app.qorium.io. */
  portalUrl: string;
  /** From address (must match SES verified identity / SendGrid sender). */
  from: string;
  /** Optional reply-to (e.g. the inviting recruiter ops contact). */
  replyTo?: string;
  /** Optional human display name shown in the email body. */
  recipientName?: string;
}

const escape = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

/**
 * Recruiter-invitation email template. Plaintext body is the source of
 * truth (every mail client renders text); HTML mirrors it. We keep both
 * intentionally minimal — no inline images, no remote assets — so spam
 * scoring stays clean and there's nothing to redact in logs beyond the
 * accept URL itself.
 */
export function renderInvitationEmail(input: InvitationTemplateInput): MailerMessage {
  const acceptUrl = `${input.portalUrl.replace(/\/$/, '')}/accept-invite.html?token=${encodeURIComponent(input.token)}`;
  const greeting = input.recipientName ? `Hi ${input.recipientName},` : 'Hi,';

  const text = [
    greeting,
    '',
    "You've been invited to join QOrium as a recruiter.",
    '',
    'Set your password and sign in here:',
    acceptUrl,
    '',
    'This link is single-use and expires in 7 days.',
    '',
    'If you did not expect this email, ignore it — no account will be created until the link is used.',
    '',
    '— QOrium',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>QOrium recruiter invitation</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:24px auto;padding:0 16px">
  <p>${escape(greeting)}</p>
  <p>You&rsquo;ve been invited to join <strong>QOrium</strong> as a recruiter.</p>
  <p>
    <a href="${escape(acceptUrl)}" style="display:inline-block;background:#0b66f1;color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;font-weight:600">Set your password</a>
  </p>
  <p style="color:#555;font-size:14px">This link is single-use and expires in 7&nbsp;days. If you did not expect this email, ignore it &mdash; no account will be created until the link is used.</p>
  <p style="color:#555;font-size:13px;word-break:break-all">If the button doesn&rsquo;t work, paste this URL into your browser:<br>${escape(acceptUrl)}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px">&mdash; QOrium</p>
</body></html>`;

  return {
    to: input.to,
    from: input.from,
    subject: "You've been invited to QOrium",
    text,
    html,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  };
}
