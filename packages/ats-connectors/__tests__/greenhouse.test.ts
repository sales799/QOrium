import { describe, expect, it } from 'vitest';
import { GreenhouseAdapter, createMockGreenhouseFetcher } from '../src/adapters/greenhouse.js';
import type { ConnectorCredentials } from '../src/types.js';

const CRED: ConnectorCredentials = { kind: 'api_token', token: 'greenhouse_test_token_x' };

describe('GreenhouseAdapter', () => {
  it('throws when token is missing', () => {
    expect(
      () =>
        new GreenhouseAdapter({
          credentials: { kind: 'api_token', token: '' },
          fetcher: createMockGreenhouseFetcher({ candidates: [], jobs: [] }),
        }),
    ).toThrow();
  });

  it('reports platform = "greenhouse"', () => {
    const adapter = new GreenhouseAdapter({
      credentials: CRED,
      fetcher: createMockGreenhouseFetcher({ candidates: [], jobs: [] }),
    });

    expect(adapter.platform).toBe('greenhouse');
  });

  it('translates Greenhouse candidate shape to canonical Candidate', async () => {
    const adapter = new GreenhouseAdapter({
      credentials: CRED,
      fetcher: createMockGreenhouseFetcher({
        candidates: [
          {
            id: 'gh_cand_1',
            first_name: 'Anu',
            last_name: 'Iyer',
            email_addresses: [{ value: 'anu@example.com' }],
            application: { status: 'active' },
          },
        ],
        jobs: [],
      }),
    });

    const page = await adapter.syncCandidates();
    const candidate = page.rows[0]!;

    expect(candidate.external_id).toBe('gh_cand_1');
    expect(candidate.email).toBe('anu@example.com');
    expect(candidate.assessment_status).toBe('pending');
  });

  it('translates Greenhouse job shape with status mapping', async () => {
    const adapter = new GreenhouseAdapter({
      credentials: CRED,
      fetcher: createMockGreenhouseFetcher({
        candidates: [],
        jobs: [
          {
            id: 'gh_job_1',
            name: 'Senior Backend Engineer',
            status: 'open',
            departments: [{ name: 'Engineering' }],
            offices: [{ name: 'Bengaluru' }],
          },
        ],
      }),
    });

    const page = await adapter.syncJobs();
    const job = page.rows[0]!;

    expect(job.external_id).toBe('gh_job_1');
    expect(job.title).toBe('Senior Backend Engineer');
    expect(job.status).toBe('open');
  });
});
