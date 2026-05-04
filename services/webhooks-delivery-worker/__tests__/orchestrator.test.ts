import { describe, expect, it } from 'vitest';
import { deliverOne, type PendingDelivery } from '../src/orchestrator';
import { stubHttpPoster, type StubPosterState } from '../src/poster';

const NOW = 1_700_000_000_000; // unix ms

const baseDelivery: PendingDelivery = {
  id: 'dl-1',
  eventId: 'evt-1',
  subscriptionId: 'sub-1',
  attemptCount: 0,
  firstAttemptAt: NOW,
  endpointUrl: 'https://acme.example/hook',
  signingSecret: 'whsec_test_secret',
  envelopeBody: JSON.stringify({ id: 'evt-1', event_type: 'question.released', data: {} }),
  eventType: 'question.released',
};

describe('deliverOne', () => {
  it('marks delivered on 2xx success', async () => {
    const state: StubPosterState = { attempts: [], nextStatus: 200 };
    const result = await deliverOne({
      delivery: baseDelivery,
      poster: stubHttpPoster(state),
      now: () => NOW,
    });
    expect(result.nextState.kind).toBe('delivered');
    if (result.nextState.kind === 'delivered') {
      expect(result.nextState.httpStatus).toBe(200);
    }
    // Verify the signing headers were attached.
    expect(state.attempts[0]?.headers['X-QOrium-Signature']).toMatch(/^sha256=/);
    expect(state.attempts[0]?.headers['X-QOrium-Delivery']).toBe('dl-1');
    expect(state.attempts[0]?.headers['x-qorium-event-id']).toBe('evt-1');
  });

  it('marks delivered on 202 + 204', async () => {
    for (const status of [202, 204]) {
      const result = await deliverOne({
        delivery: baseDelivery,
        poster: stubHttpPoster({ attempts: [], nextStatus: status }),
        now: () => NOW,
      });
      expect(result.nextState.kind).toBe('delivered');
    }
  });

  it('abandons immediately on 4xx (except 429)', async () => {
    for (const status of [400, 401, 403, 404, 422]) {
      const result = await deliverOne({
        delivery: baseDelivery,
        poster: stubHttpPoster({ attempts: [], nextStatus: status }),
        now: () => NOW,
      });
      expect(result.nextState.kind).toBe('abandoned');
    }
  });

  it('schedules retry on 5xx', async () => {
    const result = await deliverOne({
      delivery: baseDelivery,
      poster: stubHttpPoster({ attempts: [], nextStatus: 503 }),
      now: () => NOW,
    });
    expect(result.nextState.kind).toBe('retry');
    if (result.nextState.kind === 'retry') {
      expect(result.nextState.retryAt).toBeGreaterThanOrEqual(NOW);
    }
  });

  it('schedules retry on 429', async () => {
    const result = await deliverOne({
      delivery: baseDelivery,
      poster: stubHttpPoster({ attempts: [], nextStatus: 429 }),
      now: () => NOW,
    });
    expect(result.nextState.kind).toBe('retry');
  });

  it('abandons after the spec retry curve is exhausted', async () => {
    const result = await deliverOne({
      delivery: { ...baseDelivery, attemptCount: 5 },
      poster: stubHttpPoster({ attempts: [], nextStatus: 503 }),
      now: () => NOW,
    });
    expect(result.nextState.kind).toBe('abandoned');
  });

  it('abandons when network error + delivery older than MAX_AGE', async () => {
    const result = await deliverOne({
      delivery: {
        ...baseDelivery,
        firstAttemptAt: NOW - 36 * 60 * 60 * 1_000, // older than 35h
      },
      poster: stubHttpPoster({
        attempts: [],
        nextStatus: 0,
        nextError: 'connection refused',
      }),
      now: () => NOW,
    });
    expect(result.nextState.kind).toBe('abandoned');
  });
});
