import { describe, expect, it } from 'vitest';
import { LeverAdapter, createMockLeverFetcher } from '../src/adapters/lever.js';
import type { ConnectorCredentials } from '../src/types.js';

const CRED: ConnectorCredentials = { kind: 'api_token', token: 'lever_test_token_x' };

describe('LeverAdapter', () => {
  it('throws when token is missing', () => {
    expect(
      () =>
        new LeverAdapter({
          credentials: { kind: 'api_token', token: '' },
          fetcher: createMockLeverFetcher({ candidates: [], jobs: [] }),
        }),
    ).toThrow();
  });

  it('reports platform = "lever"', () => {
    const a = new LeverAdapter({
      credentials: CRED,
      fetcher: createMockLeverFetcher({ candidates: [], jobs: [] }),
    });
    expect(a.platform).toBe('lever');
  });

  it('translates Lever candidate shape to canonical Candidate', async () => {
    const fetcher = createMockLeverFetcher({
      candidates: [
        {
          id: 'lev_cand_1',
          firstName: 'Anu',
          lastName: 'Iyer',
          emails: ['anu@example.com'],
          stage: { text: 'Phone screen' },
        },
      ],
      jobs: [],
    });
    const adapter = new LeverAdapter({ credentials: CRED, fetcher });
    const page = await adapter.syncCandidates();
    expect(page.rows).toHaveLength(1);
    const c = page.rows[0]!;
    expect(c.external_id).toBe('lev_cand_1');
    expect(c.email).toBe('anu@example.com');
    expect(c.first_name).toBe('Anu');
    expect(c.last_name).toBe('Iyer');
    expect(c.assessment_status).toBe('in_progress'); // mapped from "Phone screen"
  });

  it('falls back to "pending" for unknown stage labels', async () => {
    const fetcher = createMockLeverFetcher({
      candidates: [
        {
          id: 'lev_cand_2',
          firstName: 'Riya',
          lastName: 'Patel',
          emails: ['riya@example.com'],
          stage: { text: 'Some Custom Stage' },
        },
      ],
      jobs: [],
    });
    const adapter = new LeverAdapter({ credentials: CRED, fetcher });
    const page = await adapter.syncCandidates();
    expect(page.rows[0]!.assessment_status).toBe('pending');
  });

  it('translates Lever job shape with status mapping', async () => {
    const fetcher = createMockLeverFetcher({
      candidates: [],
      jobs: [
        {
          id: 'lev_job_1',
          text: 'Senior Backend Engineer',
          state: 'published',
          categories: { department: 'Engineering', location: 'Bengaluru' },
        },
        { id: 'lev_job_2', text: 'Closed Role', state: 'closed' },
      ],
    });
    const adapter = new LeverAdapter({ credentials: CRED, fetcher });
    const page = await adapter.syncJobs();
    expect(page.rows).toHaveLength(2);
    expect(page.rows[0]!.title).toBe('Senior Backend Engineer');
    expect(page.rows[0]!.status).toBe('open');
    expect(page.rows[0]!.department).toBe('Engineering');
    expect(page.rows[1]!.status).toBe('closed');
  });

  it('authRefresh is a no-op success for static-token Lever', async () => {
    const adapter = new LeverAdapter({
      credentials: CRED,
      fetcher: createMockLeverFetcher({ candidates: [], jobs: [] }),
    });
    const r = await adapter.authRefresh();
    expect(r).toEqual({ ok: true, expires_at: null });
  });

  it('postAssessmentResult delegates to the fetcher', async () => {
    let captured: unknown = null;
    const fetcher = {
      ...createMockLeverFetcher({ candidates: [], jobs: [] }),
      async postResult(result: unknown) {
        captured = result;
        return { ok: true as const };
      },
    };
    const adapter = new LeverAdapter({ credentials: CRED, fetcher });
    await adapter.postAssessmentResult({
      candidate_id: 'q-cand-1',
      assessment_id: 'q-asmt-1',
      score: 87,
      time_spent_ms: 1234,
      answers: { '1': 'A' },
      metadata: {
        ats_platform: 'lever',
        job_id: 'q-job-1',
        external_candidate_id: 'lev_cand_1',
      },
    });
    expect(captured).not.toBeNull();
  });
});
