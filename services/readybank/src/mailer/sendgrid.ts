import sgMail from '@sendgrid/mail';
import type { Mailer, MailerMessage, MailerSendResult } from './types.js';
import { MailerError } from './types.js';

export interface SendGridMailerOptions {
  apiKey: string;
}

/**
 * SendGrid driver. The SDK is a global singleton (setApiKey mutates module
 * state) — we set it once per instance. If both SES and SendGrid are
 * configured at the same time, the *last* SendGridMailer constructed wins
 * for the SDK's API key. In practice MAILER_DRIVER picks exactly one driver
 * at boot, so this is fine.
 */
export class SendGridMailer implements Mailer {
  readonly driver = 'sendgrid' as const;

  constructor(opts: SendGridMailerOptions) {
    sgMail.setApiKey(opts.apiKey);
  }

  async send(msg: MailerMessage): Promise<MailerSendResult> {
    try {
      const [response] = await sgMail.send({
        to: msg.to,
        from: msg.from,
        subject: msg.subject,
        text: msg.text,
        html: msg.html,
        ...(msg.replyTo ? { replyTo: msg.replyTo } : {}),
      });
      const headerId = response.headers['x-message-id'];
      const messageId = typeof headerId === 'string' ? headerId : `sg-${Date.now()}`;
      return { messageId, driver: 'sendgrid' };
    } catch (err) {
      throw new MailerError('sendgrid', 'SendGrid send failed', err);
    }
  }
}
