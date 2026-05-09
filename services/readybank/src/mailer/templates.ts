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

/* ------------------------------------------------------------------ *
 * Candidate-facing templates (Sprint 4.5)                            *
 *                                                                    *
 * These run AFTER SES sandbox lifts (case 177825922400683). All four *
 * templates share the same minimal style: plaintext is the source of *
 * truth (every mail client renders text); HTML mirrors with a single *
 * coloured CTA button; no inline images, no remote assets, no        *
 * tracking pixels (DPDPA-compliant per legal/Privacy-Notice-v1.md).  *
 * ------------------------------------------------------------------ */

export interface CandidateInviteInput {
  to: string;
  /** Plaintext take-flow token; embedded in the take URL. */
  token: string;
  /** Base URL of the candidate take flow, e.g. https://api.qorium.online */
  takeUrl: string;
  /** From address (must match SES verified identity). */
  from: string;
  /** Recruiter's company / org name shown in subject + body. */
  recruiterCompany: string;
  /** Optional human display name shown in the email body. */
  candidateName?: string;
  /** Role title the assessment maps to, e.g. "Senior Python Engineer". */
  roleTitle: string;
  /** Estimated minutes to complete (informational; affects subject line). */
  estimatedMinutes: number;
  /** ISO date string for take-flow expiry, e.g. "2026-05-15". */
  expiresOn: string;
  /** Optional reply-to (recruiter ops contact). */
  replyTo?: string;
}

export function renderCandidateInviteEmail(input: CandidateInviteInput): MailerMessage {
  const url = `${input.takeUrl.replace(/\/$/, '')}/take/${encodeURIComponent(input.token)}`;
  const declineUrl = `${input.takeUrl.replace(/\/$/, '')}/decline/${encodeURIComponent(input.token)}`;
  const greeting = input.candidateName ? `Hi ${input.candidateName},` : 'Hi,';

  const text = [
    greeting,
    '',
    `${input.recruiterCompany} has invited you to take a short technical assessment for the ${input.roleTitle} role.`,
    '',
    `It takes about ${input.estimatedMinutes} minutes. You can complete it any time before ${input.expiresOn}.`,
    '',
    'Take the assessment:',
    url,
    '',
    'If this invitation reached you in error or you no longer wish to participate, you can decline here:',
    declineUrl,
    '',
    'Questions? Reply to this email or contact the recruiter directly.',
    '',
    "Privacy: We follow India's DPDPA 2023. Your responses are used only to compute your score for this hiring workflow. Full notice: https://qorium.online/privacy",
    '',
    `— The QOrium team on behalf of ${input.recruiterCompany}`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Assessment invitation from ${escape(input.recruiterCompany)}</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:24px auto;padding:0 16px">
  <p>${escape(greeting)}</p>
  <p><strong>${escape(input.recruiterCompany)}</strong> has invited you to take a short technical assessment for the <strong>${escape(input.roleTitle)}</strong> role.</p>
  <p>It takes about <strong>${input.estimatedMinutes} minutes</strong>. You can complete it any time before <strong>${escape(input.expiresOn)}</strong>.</p>
  <p>
    <a href="${escape(url)}" style="display:inline-block;background:#0b66f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">Take the assessment</a>
  </p>
  <p style="color:#555;font-size:14px">If this invitation reached you in error or you no longer wish to participate, <a href="${escape(declineUrl)}" style="color:#555">decline here</a>.</p>
  <p style="color:#555;font-size:13px;word-break:break-all">Or paste this link into your browser:<br>${escape(url)}</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px">Privacy: We follow India's DPDPA 2023. Your responses are used only to compute your score for this hiring workflow. <a href="https://qorium.online/privacy" style="color:#888">Full notice</a>.</p>
  <p style="color:#888;font-size:12px">— The QOrium team on behalf of ${escape(input.recruiterCompany)}</p>
</body></html>`;

  return {
    to: input.to,
    from: input.from,
    subject: `Assessment invitation from ${input.recruiterCompany} — ${input.roleTitle}`,
    text,
    html,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  };
}

export interface CandidateReminderInput {
  to: string;
  token: string;
  takeUrl: string;
  from: string;
  recruiterCompany: string;
  candidateName?: string;
  roleTitle: string;
  hoursUntilExpiry: number;
  replyTo?: string;
}

export function renderCandidateReminderEmail(input: CandidateReminderInput): MailerMessage {
  const url = `${input.takeUrl.replace(/\/$/, '')}/take/${encodeURIComponent(input.token)}`;
  const greeting = input.candidateName ? `Hi ${input.candidateName},` : 'Hi,';
  const urgency =
    input.hoursUntilExpiry <= 24
      ? 'expires in less than 24 hours'
      : `expires in ${Math.round(input.hoursUntilExpiry / 24)} days`;

  const text = [
    greeting,
    '',
    `Quick reminder — your ${input.roleTitle} assessment from ${input.recruiterCompany} ${urgency}.`,
    '',
    'If you still want to take it:',
    url,
    '',
    'If circumstances changed and you no longer want to participate, just reply to let the recruiter know.',
    '',
    `— The QOrium team on behalf of ${input.recruiterCompany}`,
  ].join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Reminder: ${escape(input.recruiterCompany)} assessment</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:24px auto;padding:0 16px">
  <p>${escape(greeting)}</p>
  <p>Quick reminder — your <strong>${escape(input.roleTitle)}</strong> assessment from <strong>${escape(input.recruiterCompany)}</strong> ${escape(urgency)}.</p>
  <p>
    <a href="${escape(url)}" style="display:inline-block;background:#0b66f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">Take the assessment</a>
  </p>
  <p style="color:#555;font-size:14px">If circumstances changed and you no longer want to participate, just reply to let the recruiter know.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px">— The QOrium team on behalf of ${escape(input.recruiterCompany)}</p>
</body></html>`;

  return {
    to: input.to,
    from: input.from,
    subject: `Reminder: ${input.recruiterCompany} assessment ${urgency}`,
    text,
    html,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  };
}

export interface CandidateResultInput {
  to: string;
  resultUrl: string;
  from: string;
  recruiterCompany: string;
  candidateName?: string;
  roleTitle: string;
  scoreBand: 'Strong' | 'Above target' | 'On target' | 'Below target' | 'Not yet';
  replyTo?: string;
}

export function renderCandidateResultEmail(input: CandidateResultInput): MailerMessage {
  const greeting = input.candidateName ? `Hi ${input.candidateName},` : 'Hi,';

  const text = [
    greeting,
    '',
    `Thanks for taking the ${input.roleTitle} assessment for ${input.recruiterCompany}.`,
    '',
    `Your IRT-calibrated band: ${input.scoreBand}.`,
    '',
    'Full result page (includes per-section breakdown):',
    input.resultUrl,
    '',
    `${input.recruiterCompany}'s hiring team will be in touch about next steps. We don't pass your contact information to anyone outside this hiring workflow.`,
    '',
    'You can request a copy of your data, or its deletion, any time at privacy@qorium.online.',
    '',
    '— QOrium',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>Your ${escape(input.roleTitle)} assessment result</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:24px auto;padding:0 16px">
  <p>${escape(greeting)}</p>
  <p>Thanks for taking the <strong>${escape(input.roleTitle)}</strong> assessment for <strong>${escape(input.recruiterCompany)}</strong>.</p>
  <p style="font-size:18px;padding:12px 16px;background:#f3f6fb;border-radius:6px">Your IRT-calibrated band: <strong>${escape(input.scoreBand)}</strong></p>
  <p>
    <a href="${escape(input.resultUrl)}" style="display:inline-block;background:#0b66f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">View full result</a>
  </p>
  <p style="color:#555;font-size:14px">${escape(input.recruiterCompany)}'s hiring team will be in touch about next steps. We don't pass your contact information to anyone outside this hiring workflow.</p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px">You can request a copy of your data, or its deletion, any time at <a href="mailto:privacy@qorium.online" style="color:#888">privacy@qorium.online</a>.</p>
  <p style="color:#888;font-size:12px">— QOrium</p>
</body></html>`;

  return {
    to: input.to,
    from: input.from,
    subject: `Your ${input.roleTitle} assessment result — ${input.scoreBand}`,
    text,
    html,
    ...(input.replyTo ? { replyTo: input.replyTo } : {}),
  };
}

export interface RecruiterResultNotifyInput {
  /** Recruiter email (the inviter). */
  to: string;
  /** Recruiter portal URL pointing to the candidate's result page. */
  resultUrl: string;
  from: string;
  candidateName: string;
  roleTitle: string;
  scoreBand: 'Strong' | 'Above target' | 'On target' | 'Below target' | 'Not yet';
  /** ISO timestamp of completion. */
  completedAt: string;
  durationMinutes: number;
}

export function renderRecruiterResultNotifyEmail(input: RecruiterResultNotifyInput): MailerMessage {
  const text = [
    `${input.candidateName} just completed their ${input.roleTitle} assessment.`,
    '',
    `Band: ${input.scoreBand}`,
    `Completed: ${input.completedAt}`,
    `Time taken: ${input.durationMinutes} minutes`,
    '',
    'Full result page:',
    input.resultUrl,
    '',
    '— QOrium',
  ].join('\n');

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>${escape(input.candidateName)} — ${escape(input.roleTitle)} result</title></head>
<body style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;color:#111;max-width:560px;margin:24px auto;padding:0 16px">
  <p><strong>${escape(input.candidateName)}</strong> just completed their <strong>${escape(input.roleTitle)}</strong> assessment.</p>
  <table style="border-collapse:collapse;margin:12px 0">
    <tr><td style="padding:6px 12px 6px 0;color:#555">Band</td><td style="padding:6px 0;font-weight:600">${escape(input.scoreBand)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#555">Completed</td><td style="padding:6px 0">${escape(input.completedAt)}</td></tr>
    <tr><td style="padding:6px 12px 6px 0;color:#555">Time taken</td><td style="padding:6px 0">${input.durationMinutes} minutes</td></tr>
  </table>
  <p>
    <a href="${escape(input.resultUrl)}" style="display:inline-block;background:#0b66f1;color:#fff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:600">View full result</a>
  </p>
  <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
  <p style="color:#888;font-size:12px">— QOrium</p>
</body></html>`;

  return {
    to: input.to,
    from: input.from,
    subject: `${input.candidateName} completed ${input.roleTitle} — ${input.scoreBand}`,
    text,
    html,
  };
}
