/**
 * Driver-agnostic mailer interface (Sprint 1.6).
 *
 * Three drivers implement this contract:
 *   - ses     → AWS SES (production)
 *   - sendgrid → Twilio SendGrid (fallback / staging)
 *   - mock    → in-memory recorder (dev + tests)
 *
 * Driver is selected at boot from MAILER_DRIVER. The route layer sees only
 * this interface — never an SDK type — so swapping providers stays a
 * one-line config change.
 */

export interface MailerMessage {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  /** Optional reply-to. Used for invitation flows where the host org wants direct replies. */
  replyTo?: string;
}

export interface MailerSendResult {
  /** Provider-side message id (SES MessageId, SendGrid x-message-id, mock UUID). */
  messageId: string;
  /** Driver name for the audit trail row. */
  driver: 'ses' | 'sendgrid' | 'mock';
}

export interface Mailer {
  readonly driver: 'ses' | 'sendgrid' | 'mock';
  send(msg: MailerMessage): Promise<MailerSendResult>;
}

export class MailerError extends Error {
  readonly driver: string;
  readonly cause: unknown;
  constructor(driver: string, message: string, cause?: unknown) {
    super(`[${driver}] ${message}`);
    this.driver = driver;
    this.cause = cause;
  }
}
