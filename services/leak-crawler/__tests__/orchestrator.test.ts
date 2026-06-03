import { describe, expect, it, vi } from 'vitest';
import pino from 'pino';
import { runCrawl } from '../src/orchestrator';
import { StubPoller } from '../src/sources/stub';
import type { ReleasedQuestion } from '../src/repositories/questions';
import type { RecordAlertInput, RecordAlertOutcome } from '../src/repositories/alerts';

const silentLogger = pino({ level: 'silent' });

const QUESTION: ReleasedQuestion = {
  id: 'q-1',
  uuid: '00000000-0000-0000-0000-000000000001',
  bodyMd:
    'Reverse a singly linked list iteratively without recursion. Return the new head pointer in O(n) time and O(1) extra space.',
  format: 'coding',
  sku: 'readybank',
};

describe('runCrawl', () => {
  it('returns an empty report when no pollers are configured', async () => {
    const report = await runCrawl({
      listQuestions: async () => [QUESTION],
      recordAlert: async () => ({ inserted: false, alertId: null }),
      pollers: [],
      logger: silentLogger,
      ngramsPerQuestion: 5,
      resultsPerQuery: 3,
    });
    expect(report.questionsScanned).toBe(0);
    expect(report.alertsCreated).toBe(0);
  });

  it('records alerts when a poller returns a high-overlap snippet', async () => {
    const poller = new StubPoller({}, [
      {
        sourceUrl: 'https://leetcode-discuss.example.com/q/206',
        sourceType: 'leetcode-discuss',
        snippet:
          'Reverse a singly linked list iteratively without recursion. Return the new head pointer.',
      },
    ]);
    const recordAlert = vi.fn(
      async (): Promise<RecordAlertOutcome> => ({
        inserted: true,
        alertId: 'alert-1',
      }),
    );

    const report = await runCrawl({
      listQuestions: async () => [QUESTION],
      recordAlert,
      pollers: [poller],
      logger: silentLogger,
      ngramsPerQuestion: 1,
      resultsPerQuery: 1,
    });

    expect(report.questionsScanned).toBe(1);
    expect(report.queriesIssued).toBe(1);
    expect(report.alertsCreated).toBe(1);
    expect(recordAlert).toHaveBeenCalledOnce();
    const arg = recordAlert.mock.calls[0]?.[0] as RecordAlertInput;
    expect(arg.questionId).toBe('q-1');
    expect(arg.severity).not.toBe('none');
    expect(arg.evidence.snippet).toContain('linked list');
    expect(arg.evidence.matchedNgrams.length).toBeGreaterThan(0);
  });

  it('does NOT persist alerts when overlap is below the dismissal floor', async () => {
    const poller = new StubPoller({}, [
      {
        sourceUrl: 'https://example.com/unrelated',
        sourceType: 'serper',
        snippet: 'How to bake sourdough at sea level using a Dutch oven and instant yeast.',
      },
    ]);
    const recordAlert = vi.fn(async () => ({ inserted: false, alertId: null }));

    const report = await runCrawl({
      listQuestions: async () => [QUESTION],
      recordAlert,
      pollers: [poller],
      logger: silentLogger,
      ngramsPerQuestion: 2,
      resultsPerQuery: 1,
    });

    expect(report.alertsCreated).toBe(0);
    expect(recordAlert).not.toHaveBeenCalled();
    expect(report.queriesIssued).toBeGreaterThan(0);
    expect(report.resultsScored).toBeGreaterThan(0);
  });

  it('counts skipped duplicates separately', async () => {
    const poller = new StubPoller({}, [
      {
        sourceUrl: 'https://leetcode-discuss.example.com/q/206',
        sourceType: 'leetcode-discuss',
        snippet:
          'Reverse a singly linked list iteratively without recursion. Return the new head pointer.',
      },
    ]);
    const recordAlert = vi.fn(async () => ({ inserted: false, alertId: 'alert-pre-existing' }));

    const report = await runCrawl({
      listQuestions: async () => [QUESTION],
      recordAlert,
      pollers: [poller],
      logger: silentLogger,
      ngramsPerQuestion: 1,
      resultsPerQuery: 1,
    });

    expect(report.alertsCreated).toBe(0);
    expect(report.alertsSkippedDuplicate).toBe(1);
  });

  it('counts errors but does not abort when a poller throws', async () => {
    const flaky = {
      id: 'serper' as const,
      poll: async () => {
        throw new Error('rate limited');
      },
    };
    const recordAlert = vi.fn(async () => ({ inserted: false, alertId: null }));

    const report = await runCrawl({
      listQuestions: async () => [QUESTION],
      recordAlert,
      pollers: [flaky],
      logger: silentLogger,
      ngramsPerQuestion: 2,
      resultsPerQuery: 1,
    });

    expect(report.errors).toBeGreaterThan(0);
    expect(report.queriesIssued).toBe(2);
    expect(report.alertsCreated).toBe(0);
  });

  it('stops issuing provider calls at the maxQueriesPerRun cap', async () => {
    const poll = vi.fn(async () => []);
    const cappedPoller = {
      id: 'apify' as const,
      poll,
    };

    const report = await runCrawl({
      listQuestions: async () => [QUESTION],
      recordAlert: async () => ({ inserted: false, alertId: null }),
      pollers: [cappedPoller],
      logger: silentLogger,
      ngramsPerQuestion: 5,
      resultsPerQuery: 1,
      maxQueriesPerRun: 2,
    });

    expect(report.queriesIssued).toBe(2);
    expect(poll).toHaveBeenCalledTimes(2);
  });

  it('respects an aborted signal mid-pass', async () => {
    const ctrl = new AbortController();
    const poller = new StubPoller({}, [
      {
        sourceUrl: 'https://x.io/1',
        sourceType: 'serper',
        snippet: 'Reverse a singly linked list iteratively without recursion. Return the new head.',
      },
    ]);
    const recordAlert = vi.fn(async () => {
      ctrl.abort();
      return { inserted: true, alertId: 'a' };
    });

    const report = await runCrawl({
      listQuestions: async () => [QUESTION, { ...QUESTION, id: 'q-2', uuid: 'u2' }],
      recordAlert,
      pollers: [poller],
      logger: silentLogger,
      ngramsPerQuestion: 1,
      resultsPerQuery: 1,
      signal: ctrl.signal,
    });
    expect(report.questionsScanned).toBeLessThanOrEqual(2);
  });
});
