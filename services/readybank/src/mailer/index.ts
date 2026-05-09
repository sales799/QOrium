/**
 * Driver-agnostic mailer entry point. Selects an implementation from
 * config and returns the common interface.
 *
 * Lazy SDK loading: 'ses' and 'sendgrid' drivers are imported dynamically
 * so dev / test boots that use 'mock' don't have to resolve the SDK
 * dependencies at module-load time. This keeps `pnpm test` fast and lets
 * the service start cleanly even if optional SDKs aren't installed in a
 * given environment.
 */
import type { Mailer } from './types.js';
import { MockMailer } from './mock.js';

export type MailerDriver = 'ses' | 'sendgrid' | 'mock';

export interface MailerConfig {
  driver: MailerDriver;
  /** SES region (driver=ses). */
  sesRegion?: string;
  sesAccessKeyId?: string;
  sesSecretAccessKey?: string;
  /** SendGrid API key (driver=sendgrid). */
  sendgridApiKey?: string;
}

export async function createMailer(cfg: MailerConfig): Promise<Mailer> {
  switch (cfg.driver) {
    case 'mock':
      return new MockMailer();
    case 'ses': {
      if (!cfg.sesRegion) {
        throw new Error('MAILER_DRIVER=ses requires SES_REGION');
      }
      const { SesMailer } = await import('./ses.js');
      return new SesMailer({
        region: cfg.sesRegion,
        ...(cfg.sesAccessKeyId && cfg.sesSecretAccessKey
          ? {
              accessKeyId: cfg.sesAccessKeyId,
              secretAccessKey: cfg.sesSecretAccessKey,
            }
          : {}),
      });
    }
    case 'sendgrid': {
      if (!cfg.sendgridApiKey) {
        throw new Error('MAILER_DRIVER=sendgrid requires SENDGRID_API_KEY');
      }
      const { SendGridMailer } = await import('./sendgrid.js');
      return new SendGridMailer({ apiKey: cfg.sendgridApiKey });
    }
    default: {
      const _exhaustive: never = cfg.driver;
      throw new Error(`Unknown mailer driver: ${String(_exhaustive)}`);
    }
  }
}

export type { Mailer, MailerMessage, MailerSendResult } from './types.js';
export { MailerError } from './types.js';
export { MockMailer } from './mock.js';
export {
  renderInvitationEmail,
  renderCandidateInviteEmail,
  renderCandidateReminderEmail,
  renderCandidateResultEmail,
  renderRecruiterResultNotifyEmail,
} from './templates.js';
export type {
  InvitationTemplateInput,
  CandidateInviteInput,
  CandidateReminderInput,
  CandidateResultInput,
  RecruiterResultNotifyInput,
} from './templates.js';
