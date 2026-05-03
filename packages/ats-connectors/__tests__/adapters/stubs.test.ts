import { describe, expect, it } from 'vitest';
import { createHmac } from 'node:crypto';
import { AshbyAdapter, DarwinboxAdapter, WorkdayAdapter } from '../../src';
import type { InboundWebhook } from '../../src';

const SECRET = 'webhook-secret-32-chars-or-longer-please';

function webhook(body: Record<string, unknown>, signatureHeaderName: string): InboundWebhook {
  const rawBody = Buffer.from(JSON.stringify(body));
  const sig = createHmac('sha256', SECRET).update(rawBody).digest('hex');
  return {
    rawBody,
    parsedBody: body,
    headers: { [signatureHeaderName]: `sha256=${sig}`, 'content-type': 'application/json' },
  };
}

describe('AshbyAdapter', () => {
  const adapter = new AshbyAdapter();

  it('verifies sha256= prefixed signature on Ashby-Signature header', () => {
    const r = adapter.verifySignature(webhook({ ok: true }, 'ashby-signature'), SECRET);
    expect(r.valid).toBe(true);
  });

  it('maps candidate.created to assessment-trigger', () => {
    const ev = adapter.receiveWebhook(
      webhook(
        {
          eventType: 'candidate.created',
          data: {
            candidateId: 'a-1',
            email: 'x@y.io',
            firstName: 'X',
            lastName: 'Y',
            jobId: 'j-1',
          },
        },
        'ashby-signature',
      ),
    );
    expect(ev.kind).toBe('assessment-trigger');
    if (ev.kind === 'assessment-trigger') expect(ev.candidate.externalId).toBe('a-1');
  });

  it('postScore returns 501 not implemented in v0', async () => {
    const r = await adapter.postScore(
      { apiKey: 'k' },
      { externalCandidateId: 'a-1', score: 50, status: 'completed' },
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(501);
  });

  it('returns noop for unknown eventType', () => {
    const ev = adapter.receiveWebhook(
      webhook({ eventType: 'something.unknown' }, 'ashby-signature'),
    );
    expect(ev.kind).toBe('noop');
  });
});

describe('DarwinboxAdapter', () => {
  const adapter = new DarwinboxAdapter();

  it('verifies HMAC on x-darwinbox-signature header', () => {
    const rawBody = Buffer.from(JSON.stringify({ ok: true }));
    const sig = createHmac('sha256', SECRET).update(rawBody).digest('hex');
    const wh: InboundWebhook = {
      rawBody,
      parsedBody: { ok: true },
      headers: { 'x-darwinbox-signature': sig },
    };
    const r = adapter.verifySignature(wh, SECRET);
    expect(r.valid).toBe(true);
  });

  it('maps candidate.added to assessment-trigger', () => {
    const wh: InboundWebhook = {
      rawBody: Buffer.from(''),
      parsedBody: {
        event: 'candidate.added',
        candidate: {
          candidateId: 'd-1',
          emailId: 'a@b.io',
          firstName: 'A',
          lastName: 'B',
          jobId: 'job-1',
        },
      },
      headers: {},
    };
    const ev = adapter.receiveWebhook(wh);
    expect(ev.kind).toBe('assessment-trigger');
  });

  it('postScore returns 501 not implemented in v0', async () => {
    const r = await adapter.postScore(
      { apiKey: 'k' },
      { externalCandidateId: 'd-1', score: 50, status: 'completed' },
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(501);
  });
});

describe('WorkdayAdapter', () => {
  const adapter = new WorkdayAdapter();

  it('rejects all signatures until M9 certification', () => {
    const wh: InboundWebhook = {
      rawBody: Buffer.from(''),
      parsedBody: {},
      headers: {},
    };
    const r = adapter.verifySignature(wh, SECRET);
    expect(r.valid).toBe(false);
    expect(r.reason).toMatch(/M9/);
  });

  it('maps Recruiting.Candidate.Created when payload is well-formed', () => {
    const wh: InboundWebhook = {
      rawBody: Buffer.from(''),
      parsedBody: {
        eventClass: 'Recruiting.Candidate.Created',
        candidate: {
          candidateId: 'w-1',
          email: 'w@y.io',
          firstName: 'W',
          lastName: 'Y',
        },
      },
      headers: {},
    };
    const ev = adapter.receiveWebhook(wh);
    expect(ev.kind).toBe('assessment-trigger');
  });

  it('postScore returns 501 not implemented in v0', async () => {
    const r = await adapter.postScore(
      {},
      { externalCandidateId: 'w-1', score: 50, status: 'completed' },
    );
    expect(r.ok).toBe(false);
    expect(r.status).toBe(501);
  });
});
