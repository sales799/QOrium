import { Resend } from 'resend';
import nodemailer from 'nodemailer';
import { env, isMailerConfigured } from '@/lib/env';

export interface MailPayload {
  subject: string;
  text: string;
  html?: string;
  replyTo?: string;
}

export type MailResult =
  | { ok: true; via: 'resend' | 'gmail' | 'console' }
  | { ok: false; error: string };

export async function sendMail(payload: MailPayload): Promise<MailResult> {
  // Strategy 1: Resend
  if (env.RESEND_API_KEY) {
    try {
      const resend = new Resend(env.RESEND_API_KEY);
      await resend.emails.send({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
        subject: payload.subject,
        text: payload.text,
        ...(payload.html ? { html: payload.html } : {}),
        ...(payload.replyTo ? { replyTo: payload.replyTo } : {}),
      });
      return { ok: true, via: 'resend' };
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Resend send failed';
      return { ok: false, error: msg };
    }
  }

  // Strategy 2: Gmail SMTP
  if (env.GMAIL_USER && env.GMAIL_APP_PASSWORD) {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: env.GMAIL_USER, pass: env.GMAIL_APP_PASSWORD },
      });
      await transporter.sendMail({
        from: env.CONTACT_FROM_EMAIL,
        to: env.CONTACT_TO_EMAIL,
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

  // Strategy 3: Console fallback (dev / unconfigured)
  console.warn('[mailer] No mailer configured. Form payload:', payload);
  return { ok: true, via: 'console' };
}

export const mailerStatus = isMailerConfigured ? 'configured' : 'console-fallback';
