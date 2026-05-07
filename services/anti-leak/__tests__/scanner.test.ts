import { describe, expect, it } from 'vitest';
import { pino } from 'pino';
import type { AntiLeakConfig } from '../src/config.js';
import { MockSearchProvider } from '../src/providers/mock.js';
import { runScan } from '../src/scanner.js';
import type { DetectionEvidence, QuestionForScan } from '../src/types.js';

const silent = pino({ level: 'silent' });

function testConfig(overrides: Partial<AntiLeakConfig> = {}): AntiLeakConfig {
  return {
    serviceName: 'qorium-anti-leak',
    nodeEnv: 'test',
    logLevel: 'silent',
    provider: 'mock',
    serperApiKey: undefined,
    queriesPerQuestion: 3,
    resultsPerQuery: 3,
    maxQuestions: 10,
    thresholdAutoRotate: 0.92,
    thresholdHighReview: 0.85,
    thresholdMediumReview: 0.7,
    ...overrides,
  };
}

describe('runScan', () => {
  it('produces no alerts when the provider has no fixtures', async () => {
    const provider = new MockSearchProvider();
    const questions: QuestionForScan[] = [
      {
        id: 'q-1',
        body_md: 'Implement a red black tree with insert delete and rebalance operations',
        status: 'released',
      },
    ];

    const captured: DetectionEvidence[] = [];
    const report = await runScan({
      pool: null,
      provider,
      config: testConfig(),
      logger: silent,
      questionsOverride: questions,
      alertSink: async (e) => {
        captured.push(e);
      },
    });

    expect(report.scannedQuestions).toBe(1);
    expect(report.totalQueries).toBeGreaterThan(0);
    expect(report.alerts).toEqual([]);
    expect(captured).toEqual([]);
  });

  it('detects a critical leak when a verbatim copy appears in a fixture', async () => {
    const body =
      'Implement a red black tree with insert delete and rebalance operations preserving black height invariant';
    const fixture = {
      // The MockSearchProvider matches by query text exactly; the
      // scanner derives the longest-N n-gram from `body`, which we
      // know will be the whole body after stop-word removal.
      [body.toLowerCase()]: [
        {
          url: 'https://example.com/leetcode-discuss/123',
          snippet: body,
          source: 'mock' as const,
        },
      ],
    };

    // The scanner uses extractDistinctiveNgrams which builds n-grams of
    // up to 15 tokens — so the exact `body` text won't be queried, only
    // a 9-15-token window of it. To make the test deterministic we
    // register the fixture under that window instead.
    // Easier: fall back to a much shorter body so the n-gram == body.
    const shortBody = 'implement red black tree insert delete rebalance preserve black height';
    const fixture2 = {
      [shortBody]: [
        {
          url: 'https://example.com/leetcode-discuss/123',
          snippet: shortBody,
          source: 'mock' as const,
        },
      ],
    };

    const provider = new MockSearchProvider({ ...fixture, ...fixture2 });
    const questions: QuestionForScan[] = [{ id: 'q-leak', body_md: shortBody, status: 'released' }];

    const captured: DetectionEvidence[] = [];
    const report = await runScan({
      pool: null,
      provider,
      config: testConfig({ queriesPerQuestion: 5 }),
      logger: silent,
      questionsOverride: questions,
      alertSink: async (e) => {
        captured.push(e);
      },
    });

    expect(report.alerts.length).toBeGreaterThan(0);
    const alert = report.alerts[0]!;
    expect(alert.question_id).toBe('q-leak');
    expect(alert.classification.severity).toBe('critical');
    expect(alert.classification.autoRotate).toBe(true);
    expect(alert.match.url).toContain('example.com');
    expect(captured).toHaveLength(report.alerts.length);
  });

  it('dedupes alerts on (question_id, source_url) within one run', async () => {
    const body = 'implement red black tree insert delete rebalance preserve black height';
    const dupe = [
      {
        url: 'https://example.com/dupe',
        snippet: body,
        source: 'mock' as const,
      },
    ];
    // Register the same hits under multiple queries so the scanner
    // would see the same hit more than once if dedupe were absent.
    const fixtures: Record<string, typeof dupe> = {};
    for (const gram of [
      body,
      'implement red black tree insert delete rebalance',
      'red black tree insert delete rebalance preserve',
    ]) {
      fixtures[gram] = dupe;
    }

    const provider = new MockSearchProvider(fixtures);
    const questions: QuestionForScan[] = [{ id: 'q-dupe', body_md: body, status: 'released' }];

    const report = await runScan({
      pool: null,
      provider,
      config: testConfig({ queriesPerQuestion: 5 }),
      logger: silent,
      questionsOverride: questions,
      alertSink: async () => {},
    });

    const fromDupeUrl = report.alerts.filter((a) => a.match.url === 'https://example.com/dupe');
    expect(fromDupeUrl.length).toBe(1);
  });

  it('drops low-similarity hits before persisting', async () => {
    const body = 'implement red black tree insert delete rebalance preserve black height invariant';
    const provider = new MockSearchProvider({
      // Snippet shares no meaningful tokens with the body.
      [body]: [
        {
          url: 'https://example.com/recipe',
          snippet: 'unrelated kitchen recipe vanilla buttercream chocolate cake frosting',
          source: 'mock',
        },
      ],
    });
    const questions: QuestionForScan[] = [{ id: 'q-noise', body_md: body, status: 'released' }];

    const report = await runScan({
      pool: null,
      provider,
      config: testConfig(),
      logger: silent,
      questionsOverride: questions,
      alertSink: async () => {},
    });

    expect(report.alerts).toEqual([]);
  });

  it('survives a provider error on one query and still reports the rest', async () => {
    // Body long enough that extractDistinctiveNgrams produces multiple
    // 9-15-token windows; we throw on one specific window and serve a
    // hit on the others.
    const body =
      'implement red black tree insert delete rebalance preserve black height invariant root colour preserved';
    let calls = 0;
    const provider: import('../src/types.js').SearchProvider = {
      name: 'flaky',
      async query(_text) {
        calls += 1;
        if (calls === 1) {
          // First call blows up; orchestrator must continue.
          throw new Error('provider blew up');
        }
        return [
          {
            url: 'https://example.com/ok',
            snippet: body,
            source: 'mock',
          },
        ];
      },
    };

    const questions: QuestionForScan[] = [{ id: 'q-flaky', body_md: body, status: 'released' }];

    const report = await runScan({
      pool: null,
      provider,
      config: testConfig({ queriesPerQuestion: 5 }),
      logger: silent,
      questionsOverride: questions,
      alertSink: async () => {},
    });

    expect(report.scannedQuestions).toBe(1);
    expect(report.alerts.length).toBeGreaterThanOrEqual(1);
  });
});
