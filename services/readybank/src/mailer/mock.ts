import { randomUUID } from 'node:crypto';
import type { Mailer, MailerMessage, MailerSendResult } from './types.js';

/**
 * In-memory mailer used by dev (no real provider configured) and by tests.
 * Records every send so test assertions can read what would have been mailed.
 *
 * Records are bounded; after MAX_RECORDS the oldest entries are dropped to
 * keep long-running dev processes from leaking memory.
 */
const MAX_RECORDS = 1000;

export interface RecordedMail extends MailerMessage {
  messageId: string;
  sentAt: Date;
}

export class MockMailer implements Mailer {
  readonly driver = 'mock' as const;
  private readonly records: RecordedMail[] = [];

  async send(msg: MailerMessage): Promise<MailerSendResult> {
    const messageId = `mock-${randomUUID()}`;
    this.records.push({ ...msg, messageId, sentAt: new Date() });
    if (this.records.length > MAX_RECORDS) this.records.shift();
    return { messageId, driver: 'mock' };
  }

  /** Test helper: snapshot of all sends. */
  inbox(): readonly RecordedMail[] {
    return this.records.slice();
  }

  /** Test helper: most recent send to a given recipient, or undefined. */
  lastSentTo(email: string): RecordedMail | undefined {
    for (let i = this.records.length - 1; i >= 0; i--) {
      const r = this.records[i];
      if (r && r.to.toLowerCase() === email.toLowerCase()) return r;
    }
    return undefined;
  }

  /** Test helper: clear recorded sends between cases. */
  clear(): void {
    this.records.length = 0;
  }
}
