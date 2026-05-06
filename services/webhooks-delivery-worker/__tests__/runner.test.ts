import { describe, expect, it } from 'vitest';
import type { Pool } from '@qorium/db';
import { runTick } from '../src/runner';
import { stubHttpPoster, type StubPosterState } from '../src/poster';

const NOW = 1_700_000_000_000;

interface FakeDelivery {
  id: string;
  event_id: string;
  subscription_id: string;
  attempt_count: number;
  created_at: Date;
  endpoint_url: string;
  signing_secret_cipher: string;
  payload: unknown;
  event_type: string;
  tenant_id: string;
  aggregate_id: string | null;
  status: string;
  http_status: number | null;
}

function fixturePool(rows: FakeDelivery[]): {
  pool: Pool;
  state: { rows: FakeDelivery[]; updates: { id: string; status: string }[] };
} {
  const state = { rows, updates: [] as { id: string; status: string }[] };
  const pool = {
    query: async (sql: string, params?: unknown[]) => {
      if (
        sql.includes('FROM webhooks.deliveries d') &&
        sql.includes('JOIN webhooks.subscriptions')
      ) {
        return { rows: state.rows.filter((r) => r.status === 'pending') };
      }
      if (sql.includes("status = 'delivered'")) {
        const id = String(params?.[1]);
        const row = state.rows.find((r) => r.id === id);
        if (row) row.status = 'delivered';
        state.updates.push({ id, status: 'delivered' });
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes("status = 'pending'") && sql.includes('next_retry_at')) {
        const id = String(params?.[3]);
        const row = state.rows.find((r) => r.id === id);
        if (row) {
          row.attempt_count += 1;
        }
        state.updates.push({ id, status: 'retry' });
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes("status = 'abandoned'")) {
        const id = String(params?.[2]);
        const row = state.rows.find((r) => r.id === id);
        if (row) row.status = 'abandoned';
        state.updates.push({ id, status: 'abandoned' });
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('UPDATE webhooks.subscriptions')) {
        return { rows: [], rowCount: 1 };
      }
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => {
      throw new Error('connect not stubbed');
    },
  } as unknown as Pool;
  return { pool, state };
}

const makeDelivery = (overrides: Partial<FakeDelivery> = {}): FakeDelivery => ({
  id: 'dl-1',
  event_id: 'evt-1',
  subscription_id: 'sub-1',
  attempt_count: 0,
  created_at: new Date(NOW),
  endpoint_url: 'https://acme.example/hook',
  signing_secret_cipher: 'whsec_test',
  payload: { foo: 'bar' },
  event_type: 'question.released',
  tenant_id: '11111111-2222-3333-4444-555555555555',
  aggregate_id: null,
  status: 'pending',
  http_status: null,
  ...overrides,
});

describe('runTick', () => {
  it('reports zero when nothing is pending', async () => {
    const { pool } = fixturePool([]);
    const report = await runTick({
      pool,
      poster: stubHttpPoster({ attempts: [], nextStatus: 200 }),
      now: () => NOW,
    });
    expect(report.attempted).toBe(0);
  });

  it('marks delivered when poster returns 2xx', async () => {
    const { pool, state } = fixturePool([makeDelivery()]);
    const posterState: StubPosterState = { attempts: [], nextStatus: 202 };
    const report = await runTick({ pool, poster: stubHttpPoster(posterState), now: () => NOW });
    expect(report.delivered).toBe(1);
    expect(state.updates.find((u) => u.status === 'delivered')).toBeDefined();
    expect(posterState.attempts).toHaveLength(1);
  });

  it('schedules retry on 5xx', async () => {
    const { pool, state } = fixturePool([makeDelivery()]);
    const report = await runTick({
      pool,
      poster: stubHttpPoster({ attempts: [], nextStatus: 503 }),
      now: () => NOW,
    });
    expect(report.retried).toBe(1);
    expect(state.updates.find((u) => u.status === 'retry')).toBeDefined();
  });

  it('abandons on 4xx (permanent)', async () => {
    const { pool, state } = fixturePool([makeDelivery()]);
    const report = await runTick({
      pool,
      poster: stubHttpPoster({ attempts: [], nextStatus: 404 }),
      now: () => NOW,
    });
    expect(report.abandoned).toBe(1);
    expect(state.updates.find((u) => u.status === 'abandoned')).toBeDefined();
  });

  it('processes a batch in submitted order', async () => {
    const { pool } = fixturePool([
      makeDelivery({ id: 'dl-1', event_id: 'evt-1' }),
      makeDelivery({ id: 'dl-2', event_id: 'evt-2' }),
      makeDelivery({ id: 'dl-3', event_id: 'evt-3' }),
    ]);
    const posterState: StubPosterState = { attempts: [], nextStatus: 200 };
    const report = await runTick({ pool, poster: stubHttpPoster(posterState), now: () => NOW });
    expect(report.delivered).toBe(3);
    expect(posterState.attempts).toHaveLength(3);
  });
});
