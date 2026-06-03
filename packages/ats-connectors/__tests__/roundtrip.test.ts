import { describe, expect, it } from 'vitest';
import {
  GreenhouseAdapter,
  LeverAdapter,
  createMockGreenhouseFetcher,
  createMockLeverFetcher,
  runAtsRoundTrip,
} from '../src/index.js';
import type { AssessmentResult, ConnectorCredentials } from '../src/types.js';

const CRED: ConnectorCredentials = { kind: 'api_token', token: 'sandbox_token_x' };

describe('ATS round-trip harness', () => {
  it('proves Lever and Greenhouse sandbox paths end-to-end', async () => {
    const posted: AssessmentResult[] = [];
    const lever = new LeverAdapter({
      credentials: CRED,
      fetcher: {
        ...createMockLeverFetcher({
          candidates: [
            {
              id: 'lev_cand_1',
              firstName: 'Riya',
              lastName: 'Patel',
              emails: ['riya@example.com'],
              stage: { text: 'Phone screen' },
            },
          ],
          jobs: [
            {
              id: 'lev_job_1',
              text: 'Senior React Engineer',
              state: 'published',
              categories: { department: 'Engineering', location: 'Remote' },
            },
          ],
        }),
        async postResult(result) {
          posted.push(result);
          return { ok: true };
        },
      },
    });
    const greenhouse = new GreenhouseAdapter({
      credentials: CRED,
      fetcher: {
        ...createMockGreenhouseFetcher({
          candidates: [
            {
              id: 'gh_cand_1',
              first_name: 'Anu',
              last_name: 'Iyer',
              email_addresses: [{ value: 'anu@example.com' }],
              application: { status: 'active' },
            },
          ],
          jobs: [
            {
              id: 'gh_job_1',
              name: 'Senior Java Engineer',
              status: 'open',
              departments: [{ name: 'Engineering' }],
              offices: [{ name: 'Bengaluru' }],
            },
          ],
        }),
        async postResult(result) {
          posted.push(result);
          return { ok: true };
        },
      },
    });

    const results = await Promise.all(
      [lever, greenhouse].map((adapter) =>
        runAtsRoundTrip(adapter, {
          assessmentId: 'q-asmt-phase-d',
          assessmentBaseUrl: 'https://qorium.online/candidate',
          score: 0.82,
          timeSpentMs: 420_000,
        }),
      ),
    );

    expect(results).toHaveLength(2);
    expect(results.every((result) => result.ok && result.resultPosted)).toBe(true);
    expect(results.map((result) => result.platform).sort()).toEqual(['greenhouse', 'lever']);
    expect(posted.map((result) => result.metadata.ats_platform).sort()).toEqual([
      'greenhouse',
      'lever',
    ]);
    expect(results.every((result) => result.candidate.assessment_score === 0.82)).toBe(true);
  });
});
