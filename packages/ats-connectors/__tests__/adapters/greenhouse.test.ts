import { describe, expect, it, vi } from 'vitest';
import { createHmac } from 'node:crypto';
import { GreenhouseAdapter } from '../../src/adapters/greenhouse';
import type { InboundWebhook } from '../../src';

const SECRET = 'webhook-secret-32-chars-or-longer-please';

function webhook(body: Record<string, unknown>): InboundWebhook {
  const rawBody = Buffer.from(JSON.stringify(body));
  const sig = createHmac('sha256', SECRET).update(rawBody).digest('hex');
  return {
    rawBody,
    parsedBody: body,
    headers: {
      signature: `sha256=${sig}`,
      'content-type': 'application/json',
    },
  };
}

describe('GreenhouseAdapter — verifySignature', () => {
  it('accepts a valid signature', () => {
    const adapter = new GreenhouseAdapter();
    const r = adapter.verifySignature(webhook({ ok: true }), SECRET);
    expect(r.valid).toBe(true);
  });

  it('rejects when the body has been tampered with', () => {
    const adapter = new GreenhouseAdapter();
    const original = webhook({ ok: true });
    const tampered: InboundWebhook = {
      ...original,
      rawBody: Buffer.from(JSON.stringify({ ok: false })),
    };
    const r = adapter.verifySignature(tampered, SECRET);
    expect(r.valid).toBe(false);
  });

  it('rejects when the secret is wrong', () => {
    const adapter = new GreenhouseAdapter();
    const r = adapter.verifySignature(webhook({ ok: true }), 'wrong-secret');
    expect(r.valid).toBe(false);
  });
});

describe('GreenhouseAdapter — receiveWebhook', () => {
  const adapter = new GreenhouseAdapter();
  it('maps candidate.created to assessment-trigger', () => {
    const ev = adapter.receiveWebhook(
      webhook({
        action: 'candidate.created',
        payload: {
          id: 'cand-42',
          email_addresses: [{ value: 'jane@example.com' }],
          first_name: 'Jane',
          last_name: 'Doe',
          application: { jobs: [{ id: 'job-7' }] },
        },
      }),
    );
    expect(ev.kind).toBe('assessment-trigger');
    if (ev.kind === 'assessment-trigger') {
      expect(ev.candidate.externalId).toBe('cand-42');
      expect(ev.candidate.email).toBe('jane@example.com');
      expect(ev.candidate.externalJobId).toBe('job-7');
    }
  });

  it('maps candidate.updated to canonical candidate', () => {
    const ev = adapter.receiveWebhook(
      webhook({
        action: 'candidate.updated',
        payload: {
          id: 'cand-1',
          email: 'a@b.io',
          first_name: 'A',
          last_name: 'B',
        },
      }),
    );
    expect(ev.kind).toBe('candidate');
  });

  it('maps job.opened to job', () => {
    const ev = adapter.receiveWebhook(
      webhook({
        action: 'job.opened',
        payload: { id: 'job-9', name: 'Senior Salesforce Developer', status: 'open' },
      }),
    );
    expect(ev.kind).toBe('job');
    if (ev.kind === 'job') expect(ev.job.title).toBe('Senior Salesforce Developer');
  });

  it('returns noop for unknown actions', () => {
    const ev = adapter.receiveWebhook(webhook({ action: 'application.activity_added' }));
    expect(ev.kind).toBe('noop');
  });

  it('returns error for malformed candidate payloads', () => {
    const ev = adapter.receiveWebhook(
      webhook({
        action: 'candidate.created',
        payload: { id: 'cand-1' /* missing email */ },
      }),
    );
    expect(ev.kind).toBe('error');
  });

  it('returns error when body is not an object', () => {
    const wh: InboundWebhook = {
      rawBody: Buffer.from('null'),
      parsedBody: null,
      headers: {},
    };
    const ev = adapter.receiveWebhook(wh);
    expect(ev.kind).toBe('error');
  });
});

describe('GreenhouseAdapter — postScore', () => {
  it('PATCHes candidate with custom fields and Basic auth', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toMatch(/^Basic /);
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        custom_fields: Record<string, unknown>;
      };
      expect(body.custom_fields.qorium_assessment_score).toBe(87);
      expect(body.custom_fields.qorium_assessment_status).toBe('completed');
      return new Response(JSON.stringify({ id: 'cand-42', updated: true }), { status: 200 });
    }) as unknown as typeof fetch;
    const adapter = new GreenhouseAdapter({ fetchImpl });
    const r = await adapter.postScore(
      { accessToken: 'gh-token' },
      {
        externalCandidateId: 'cand-42',
        score: 87,
        status: 'completed',
        assessmentUrl: 'https://qorium.online/results/abc',
      },
    );
    expect(r.ok).toBe(true);
    expect(r.status).toBe(200);
  });

  it('returns reauth recovery on 401', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('unauthorized', { status: 401 }),
    ) as unknown as typeof fetch;
    const adapter = new GreenhouseAdapter({ fetchImpl });
    const r = await adapter.postScore(
      { accessToken: 'gh-token' },
      { externalCandidateId: 'cand-1', score: 50, status: 'completed' },
    );
    expect(r.ok).toBe(false);
    expect(r.recovery).toBe('reauth');
  });

  it('returns retry recovery on 503', async () => {
    const fetchImpl = vi.fn(
      async () => new Response('busy', { status: 503 }),
    ) as unknown as typeof fetch;
    const adapter = new GreenhouseAdapter({ fetchImpl });
    const r = await adapter.postScore(
      { accessToken: 'gh-token' },
      { externalCandidateId: 'cand-1', score: 50, status: 'completed' },
    );
    expect(r.recovery).toBe('retry');
  });

  it('returns reauth when no token is available', async () => {
    const adapter = new GreenhouseAdapter();
    const r = await adapter.postScore(
      {},
      { externalCandidateId: 'cand-1', score: 50, status: 'completed' },
    );
    expect(r.ok).toBe(false);
    expect(r.recovery).toBe('reauth');
  });
});

describe('GreenhouseAdapter — postAssessmentUrl', () => {
  it('PATCHes candidate with the assessment URL custom field', async () => {
    const fetchImpl = vi.fn(async (_url: RequestInfo | URL, init?: RequestInit) => {
      const body = JSON.parse(String(init?.body ?? '{}')) as {
        custom_fields: Record<string, unknown>;
      };
      expect(body.custom_fields.qorium_assessment_url).toBe('https://qorium.online/take/xyz');
      expect(body.custom_fields.qorium_assessment_status).toBe('invited');
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;
    const adapter = new GreenhouseAdapter({ fetchImpl });
    const r = await adapter.postAssessmentUrl(
      { accessToken: 'gh-token' },
      'cand-42',
      'https://qorium.online/take/xyz',
    );
    expect(r.ok).toBe(true);
  });
});
