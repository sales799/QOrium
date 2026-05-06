import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import type { Mailer, MailerMessage, MailerSendResult } from './types.js';
import { MailerError } from './types.js';

export interface SesMailerOptions {
  region: string;
  /** Optional explicit credentials. When omitted, the AWS SDK default chain is used. */
  accessKeyId?: string;
  secretAccessKey?: string;
}

/**
 * AWS SES driver. Uses the v3 SDK's default credential chain — IAM role on
 * EC2/ECS, env vars locally, or explicit creds if passed in.
 *
 * No retries here: SES throttling shows up as ThrottlingException; the
 * caller (invite endpoint) returns 503 with a problem so the recruiter ops
 * person can retry. Adding our own retry loop just hides the signal.
 */
export class SesMailer implements Mailer {
  readonly driver = 'ses' as const;
  private readonly client: SESClient;

  constructor(opts: SesMailerOptions) {
    this.client = new SESClient({
      region: opts.region,
      ...(opts.accessKeyId && opts.secretAccessKey
        ? {
            credentials: {
              accessKeyId: opts.accessKeyId,
              secretAccessKey: opts.secretAccessKey,
            },
          }
        : {}),
    });
  }

  async send(msg: MailerMessage): Promise<MailerSendResult> {
    try {
      const out = await this.client.send(
        new SendEmailCommand({
          Source: msg.from,
          Destination: { ToAddresses: [msg.to] },
          Message: {
            Subject: { Data: msg.subject, Charset: 'UTF-8' },
            Body: {
              Text: { Data: msg.text, Charset: 'UTF-8' },
              Html: { Data: msg.html, Charset: 'UTF-8' },
            },
          },
          ...(msg.replyTo ? { ReplyToAddresses: [msg.replyTo] } : {}),
        }),
      );
      const messageId = out.MessageId;
      if (!messageId) {
        throw new MailerError('ses', 'SES SendEmail returned no MessageId');
      }
      return { messageId, driver: 'ses' };
    } catch (err) {
      if (err instanceof MailerError) throw err;
      throw new MailerError('ses', 'SES SendEmail failed', err);
    }
  }
}
