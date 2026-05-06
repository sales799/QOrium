import { describe, expect, it } from 'vitest';
import type { Pool } from '@qorium/db';
import { runTick } from '../src/runner';
import { defaultRotatorRegistry } from '../src/rotators';

const NOW = new Date('2026-05-03T00:00:00Z');

interface FakeRow {
  id: string;
  resource_key: string;
  resource_type: string;
  owner: string;
  rotation_policy_days: number;
  last_rotated_at: Date | null;
  last_rotated_by: string | null;
  next_rotation_due: Date;
  status: string;
  attempt_count: number;
  last_attempt_at: Date | null;
  last_error: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

function fixturePool(rows: FakeRow[]): {
  pool: Pool;
  state: { logged: { rotationId: string; event: string }[]; rows: FakeRow[] };
} {
  const state = { logged: [] as { rotationId: string; event: string }[], rows };
  const pool = {
    query: async (sql: string, params?: unknown[]) => {
      if (sql.includes('FROM app.secret_rotations') && sql.includes('next_rotation_due <=')) {
        const cutoff = params?.[0] as Date;
        return {
          rows: state.rows.filter(
            (r) => r.status !== 'paused' && r.next_rotation_due.getTime() <= cutoff.getTime(),
          ),
        };
      }
      if (sql.includes('UPDATE app.secret_rotations')) {
        const id = String(params?.[3]);
        const row = state.rows.find((r) => r.id === id);
        if (row) {
          row.status = String(params?.[0]);
          if (params?.[1]) row.next_rotation_due = params[1] as Date;
          row.last_error = (params?.[2] as string | null) ?? null;
        }
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }
      if (sql.includes('UPDATE app.secret_rotations') && sql.includes("'scheduled'")) {
        return { rows: [], rowCount: 0 };
      }
      if (sql.includes('INSERT INTO app.secret_rotation_log')) {
        state.logged.push({
          rotationId: String(params?.[0]),
          event: String(params?.[1]),
        });
        return { rows: [], rowCount: 1 };
      }
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => ({
      query: async () => ({ rows: [] }),
      release: () => {},
    }),
  } as unknown as Pool;
  return { pool, state };
}

const baseRow: FakeRow = {
  id: 'rot-1',
  resource_key: 'DATABASE_URL_PROD',
  resource_type: 'database_url',
  owner: 'CTO Office',
  rotation_policy_days: 90,
  last_rotated_at: null,
  last_rotated_by: null,
  next_rotation_due: new Date('2026-05-10T00:00:00Z'),
  status: 'scheduled',
  attempt_count: 0,
  last_attempt_at: null,
  last_error: null,
  metadata: {},
  created_at: NOW,
  updated_at: NOW,
};

describe('runTick', () => {
  const registry = defaultRotatorRegistry({ policyDays: { database_url: 90 } });

  it('sends a reminder for an upcoming rotation', async () => {
    const fp = fixturePool([{ ...baseRow }]);
    const report = await runTick({ pool: fp.pool, registry, now: () => NOW });
    expect(report.scanned).toBe(1);
    expect(report.remindersSent).toBe(1);
    expect(fp.state.rows[0]?.status).toBe('reminder_sent');
  });

  it('marks overdue when past due', async () => {
    const fp = fixturePool([{ ...baseRow, next_rotation_due: new Date('2026-04-01T00:00:00Z') }]);
    const report = await runTick({ pool: fp.pool, registry, now: () => NOW });
    expect(report.markedOverdue).toBe(1);
    expect(fp.state.rows[0]?.status).toBe('overdue');
  });

  it('skips rows that are paused', async () => {
    const fp = fixturePool([{ ...baseRow, status: 'paused' }]);
    const report = await runTick({ pool: fp.pool, registry, now: () => NOW });
    expect(report.scanned).toBe(0);
  });

  it('does not call rotators when performRotation=false', async () => {
    const fp = fixturePool([{ ...baseRow, next_rotation_due: new Date('2026-04-01T00:00:00Z') }]);
    const report = await runTick({
      pool: fp.pool,
      registry,
      performRotation: false,
      now: () => NOW,
    });
    expect(report.rotated).toBe(0);
    expect(report.markedOverdue).toBe(1);
  });

  it('emits a reminder_sent log entry', async () => {
    const fp = fixturePool([{ ...baseRow }]);
    await runTick({ pool: fp.pool, registry, now: () => NOW });
    expect(fp.state.logged.some((l) => l.event === 'reminder_sent')).toBe(true);
  });
});
