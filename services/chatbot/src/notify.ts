import type { Config } from './config.js';
import type { LeadCaptureInput } from './types.js';

export interface LeadNotifier {
  sendLead(input: LeadCaptureInput): Promise<void>;
}

export class NoopLeadNotifier implements LeadNotifier {
  async sendLead(_input: LeadCaptureInput): Promise<void> {
    return;
  }
}

export class WebhookLeadNotifier implements LeadNotifier {
  constructor(
    private readonly slackWebhookUrl: string | undefined,
    private readonly emailWebhookUrl: string | undefined,
    private readonly salesEmailTo: string,
  ) {}

  async sendLead(input: LeadCaptureInput): Promise<void> {
    const jobs: Array<Promise<void>> = [];
    if (this.slackWebhookUrl) jobs.push(this.sendSlack(input));
    if (this.emailWebhookUrl) jobs.push(this.sendEmailWebhook(input));
    await Promise.all(jobs);
  }

  private async sendSlack(input: LeadCaptureInput): Promise<void> {
    await postJson(this.slackWebhookUrl, {
      text: `QOrium chatbot lead: ${input.company} (${input.role})`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*QOrium chatbot lead*\n*Email:* ${input.email}\n*Company:* ${input.company}\n*Role:* ${input.role}\n*Need:* ${input.need}`,
          },
        },
      ],
    });
  }

  private async sendEmailWebhook(input: LeadCaptureInput): Promise<void> {
    await postJson(this.emailWebhookUrl, {
      to: this.salesEmailTo,
      subject: `QOrium chatbot lead: ${input.company}`,
      lead: input,
    });
  }
}

export function createLeadNotifier(config: Config): LeadNotifier {
  if (!config.slackWebhookUrl && !config.emailWebhookUrl) {
    return new NoopLeadNotifier();
  }
  return new WebhookLeadNotifier(
    config.slackWebhookUrl,
    config.emailWebhookUrl,
    config.salesEmailTo,
  );
}

async function postJson(url: string | undefined, body: unknown): Promise<void> {
  if (!url) return;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Lead notification failed with HTTP ${res.status}`);
  }
}
