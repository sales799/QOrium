import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { pino } from 'pino';
import jwt from 'jsonwebtoken';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server.js';
import type { Config } from '../src/config.js';
import {
  decodeAuditCursor,
  encodeAuditCursor,
  rowToEnvelope,
  type AuditEventRow,
} from '../src/types/audit-event.js';

/**
 * Sprint 4.4 v0 — Audit Log API tests. Stub Pool, signed recruiter JWT
 * cookie, supertest. No Postgres required.
 */

const silent = pino({ level: 'silent' });
const PEPPER = 'test_audit_pepper_at_least_thirty_two_chars_long_xxxxxxxx';
const JWT_SECRET = 'test_jwt_secret_at_least_thirty_two_characters_long_xx';
const RECRUITER_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_RECRUITER_ID = '22222222-2222-2222-2222-222222222222';
const EVENT_ID_1 = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const EVENT_ID_2 = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const EVENT_ID_3 = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

function testConfig(overrides: Partial<Config> = {}): Config {
  return {
    serviceName: 'qorium-readybank',
    nodeEnv: 'test',
    port: 0,
    logLevel: 'silent',
    version: '0.0.0-test',
    gitSha: 'testsha',
    sentryDsn: undefined,
    apiKeyPepper: PEPPER,
    redisUrl: undefined,
    jwtSecret: JWT_SECRET,
    cookieSecure: false,
    recruiterLockoutMinutes: 15,
    mailerDriver: 'mock',
    mailerFromAddress: 'no-reply@qorium.test',
    mailerReplyToAddress: undefined,
    recruiterPortalUrl: 'http://localhost:5101',
    sesRegion: undefined,
    sesAccessKeyId: undefined,
    sesSecretAccessKey: undefined,
    sendgridApiKey: undefined,
    ...overrides,
  };
}

interface StubPool {
  pool: Pool;
  queries: Array<{ sql: string; params: unknown[] }>;
  events: AuditEventRow[];
}

function buildEvent(
  over: Partial<AuditEventRow> & Pick<AuditEventRow, 'id' | 'occurred_at'>,
): AuditEventRow {
  return {
    actor_id: RECRUITER_ID,
    actor_type: 'user',
    event_type: 'leak.dismissed',
    entity_type: 'leak_alerts',
    entity_id: 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    changes: null,
    payload: { question_id: 'q-1' },
    ip_address: '203.0.113.10',
    user_agent: 'vitest/1.0',
    ...over,
  };
}

function buildStub(): StubPool {
  const queries: StubPool['queries'] = [];
  const events: AuditEventRow[] = [
    buildEvent({
      id: EVENT_ID_1,
      occurred_at: new Date('2026-05-08T10:00:00Z'),
      event_type: 'leak.dismissed',
      payload: { question_id: 'q-1', notes: 'dupe' },
      changes: { before: { status: 'detected' }, after: { status: 'dismissed' } },
    }),
    buildEvent({
      id: EVENT_ID_2,
      occurred_at: new Date('2026-05-08T08:30:00Z'),
      event_type: 'reference_panel.token.minted',
      entity_type: 'reference_panel_tokens',
      entity_id: '44444444-4444-4444-4444-444444444444',
      payload: { tenant_id: 'ten-1', scopes: ['reference-panel:write'] },
    }),
    buildEvent({
      id: EVENT_ID_3,
      occurred_at: new Date('2026-05-07T22:15:00Z'),
      event_type: 'leak.dismissed',
      payload: { question_id: 'q-2' },
    }),
    // Event by another recruiter — should never surface to RECRUITER_ID
    buildEvent({
      id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
      actor_id: OTHER_RECRUITER_ID,
      occurred_at: new Date('2026-05-08T09:00:00Z'),
      event_type: 'leak.dismissed',
    }),
  ];

  const pool = {
    async query(sql: string, params: unknown[] = []) {
      queries.push({ sql, params });
      const text = sql.replace(/\s+/g, ' ').trim();

      // SELECT-by-id: bound to actor_id $2
      if (
        text.startsWith('SELECT') &&
        text.includes('FROM audit.events') &&
        text.includes('WHERE id = $1 AND actor_id = $2')
      ) {
        const id = params[0] as string;
        const actorId = params[1] as string;
        const row = events.find((e) => e.id === id && e.actor_id === actorId);
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }

      // Total-count summary
      if (
        text.startsWith('SELECT COUNT(*)::text AS count FROM audit.events') &&
        text.includes('WHERE actor_id = $1')
      ) {
        const actorId = params[0] as string;
        const start = params[1] as Date;
        const end = params[2] as Date;
        const count = events.filter(
          (e) => e.actor_id === actorId && e.occurred_at >= start && e.occurred_at <= end,
        ).length;
        return { rows: [{ count: String(count) }], rowCount: 1 };
      }

      // Top-actions summary
      if (
        text.startsWith('SELECT event_type AS action') &&
        text.includes('FROM audit.events') &&
        text.includes('GROUP BY event_type')
      ) {
        const actorId = params[0] as string;
        const start = params[1] as Date;
        const end = params[2] as Date;
        const limit = params[3] as number;
        const counts = new Map<string, number>();
        for (const e of events) {
          if (e.actor_id !== actorId) continue;
          if (e.occurred_at < start || e.occurred_at > end) continue;
          counts.set(e.event_type, (counts.get(e.event_type) ?? 0) + 1);
        }
        const rows = [...counts.entries()]
          .sort(([aAct, aCount], [bAct, bCount]) => bCount - aCount || aAct.localeCompare(bAct))
          .slice(0, limit)
          .map(([action, count]) => ({ action, count: String(count) }));
        return { rows, rowCount: rows.length };
      }

      // List query
      if (
        text.startsWith('SELECT') &&
        text.includes('FROM audit.events') &&
        text.includes('ORDER BY occurred_at DESC')
      ) {
        const actorId = params[0] as string;
        let pIdx = 1;
        let eventTypeFilter: string | undefined;
        let entityTypeFilter: string | undefined;
        let startDate: Date | undefined;
        let endDate: Date | undefined;
        let cursorOccurred: string | undefined;
        let cursorId: string | undefined;
        if (text.includes('event_type = $')) {
          eventTypeFilter = params[pIdx] as string;
          pIdx += 1;
        }
        if (text.includes('entity_type = $')) {
          entityTypeFilter = params[pIdx] as string;
          pIdx += 1;
        }
        if (text.includes('occurred_at >= $')) {
          startDate = params[pIdx] as Date;
          pIdx += 1;
        }
        if (text.includes('occurred_at <= $')) {
          endDate = params[pIdx] as Date;
          pIdx += 1;
        }
        if (text.includes('(occurred_at, id) <')) {
          cursorOccurred = params[pIdx] as string;
          cursorId = params[pIdx + 1] as string;
          pIdx += 2;
        }
        const limitPlus = params[pIdx] as number;
        let filtered = events.filter((e) => e.actor_id === actorId);
        if (eventTypeFilter) filtered = filtered.filter((e) => e.event_type === eventTypeFilter);
        if (entityTypeFilter) filtered = filtered.filter((e) => e.entity_type === entityTypeFilter);
        if (startDate) filtered = filtered.filter((e) => e.occurred_at >= startDate!);
        if (endDate) filtered = filtered.filter((e) => e.occurred_at <= endDate!);
        if (cursorOccurred && cursorId) {
          const cursorMs = Date.parse(cursorOccurred);
          filtered = filtered.filter((e) => {
            const ms = e.occurred_at.getTime();
            return ms < cursorMs || (ms === cursorMs && e.id < cursorId!);
          });
        }
        filtered.sort((a, b) => {
          const cmp = b.occurred_at.getTime() - a.occurred_at.getTime();
          return cmp !== 0 ? cmp : b.id.localeCompare(a.id);
        });
        const rows = filtered.slice(0, limitPlus);
        return { rows, rowCount: rows.length };
      }

      return { rows: [], rowCount: 0 };
    },
  } as unknown as Pool;

  return { pool, queries, events };
}

function recruiterCookie(sub = RECRUITER_ID): string {
  const token = jwt.sign(
    {
      sub,
      tenant_id: '99999999-9999-9999-9999-999999999999',
      email: 'recruiter@qorium.test',
      name: 'Test Recruiter',
    },
    JWT_SECRET,
    {
      algorithm: 'HS256',
      issuer: 'qorium-readybank',
      audience: 'qorium-recruiter',
      expiresIn: '8h',
    },
  );
  return `qor_session=${token}`;
}

describe('GET /v1/audit/events', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app).get('/v1/audit/events');
    expect(res.status).toBe(401);
  });

  it('returns the recruiter’s own events ordered DESC', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app).get('/v1/audit/events').set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.events)).toBe(true);
    // 3 own events; the OTHER_RECRUITER event must be excluded.
    expect(res.body.events.length).toBe(3);
    const ids = res.body.events.map((e: { id: string }) => e.id);
    expect(ids).toEqual([EVENT_ID_1, EVENT_ID_2, EVENT_ID_3]);
    expect(res.body.next_cursor).toBeNull();
    // Envelope mapping spot checks
    const top = res.body.events[0];
    expect(top.action).toBe('leak.dismissed');
    expect(top.timestamp).toBe('2026-05-08T10:00:00.000Z');
    expect(top.resource_type).toBe('leak_alerts');
    expect(top.old_values).toEqual({ status: 'detected' });
    expect(top.new_values).toEqual({ status: 'dismissed' });
    expect(top.details).toEqual({ question_id: 'q-1', notes: 'dupe' });
  });

  it('filters by action (event_type)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/events?action=reference_panel.token.minted')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(res.body.events.length).toBe(1);
    expect(res.body.events[0].id).toBe(EVENT_ID_2);
  });

  it('rejects unknown-shape action filter (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/events?action=NOT-allowed-CASE!!')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('audit/invalid-query');
  });

  it('paginates with cursor', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const first = await request(app)
      .get('/v1/audit/events?limit=2')
      .set('Cookie', recruiterCookie());
    expect(first.status).toBe(200);
    expect(first.body.events.length).toBe(2);
    expect(first.body.next_cursor).not.toBeNull();
    // Validate cursor decodes to the last event's tuple
    const decoded = decodeAuditCursor(first.body.next_cursor as string);
    expect(decoded.id).toBe(EVENT_ID_2);
    const second = await request(app)
      .get(
        `/v1/audit/events?limit=2&cursor=${encodeURIComponent(first.body.next_cursor as string)}`,
      )
      .set('Cookie', recruiterCookie());
    expect(second.status).toBe(200);
    expect(second.body.events.length).toBe(1);
    expect(second.body.events[0].id).toBe(EVENT_ID_3);
    expect(second.body.next_cursor).toBeNull();
  });

  it('rejects malformed cursor (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/events?cursor=not-base64-json')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('audit/invalid-cursor');
  });

  it('rejects start_date > end_date (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/events?start_date=2026-05-08&end_date=2026-05-01')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('audit/invalid-query');
  });

  it('respects start_date and end_date', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/events?start_date=2026-05-08T00:00:00Z&end_date=2026-05-08T23:59:59Z')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(res.body.events.length).toBe(2);
  });

  it('cursor encode/decode roundtrip', () => {
    const c = { occurred_at: '2026-05-08T10:00:00.000Z', id: EVENT_ID_1 };
    expect(decodeAuditCursor(encodeAuditCursor(c))).toEqual(c);
  });
});

describe('GET /v1/audit/events/:id', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app).get(`/v1/audit/events/${EVENT_ID_1}`);
    expect(res.status).toBe(401);
  });

  it('returns the event for the recruiter’s own id', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get(`/v1/audit/events/${EVENT_ID_1}`)
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(res.body.event.id).toBe(EVENT_ID_1);
    expect(res.body.event.action).toBe('leak.dismissed');
  });

  it('returns 404 for another recruiter’s event id', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/events/dddddddd-dddd-dddd-dddd-dddddddddddd')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(404);
  });

  it('rejects malformed id (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/events/not-a-uuid')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(400);
    expect(res.body.title).toBe('audit/invalid-id');
  });
});

describe('GET /v1/audit/summary', () => {
  it('rejects without a session cookie (401)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app).get('/v1/audit/summary');
    expect(res.status).toBe(401);
  });

  it('returns total + top actions for last 30 days by default', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app).get('/v1/audit/summary').set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBeGreaterThanOrEqual(0);
    expect(Array.isArray(res.body.summary.top_actions)).toBe(true);
    expect(typeof res.body.summary.window_start).toBe('string');
    expect(typeof res.body.summary.window_end).toBe('string');
  });

  it('respects a custom window and top_n', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get(
        '/v1/audit/summary?start_date=2026-05-07T00:00:00Z&end_date=2026-05-08T23:59:59Z&top_n=5',
      )
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(200);
    expect(res.body.summary.total).toBe(3);
    // top action by count is leak.dismissed (2 of 3 own events)
    expect(res.body.summary.top_actions[0]).toEqual({ action: 'leak.dismissed', count: 2 });
  });

  it('rejects start_date > end_date (400)', async () => {
    const stub = buildStub();
    const { app } = createServer({ config: testConfig(), pool: stub.pool, logger: silent });
    const res = await request(app)
      .get('/v1/audit/summary?start_date=2026-05-08&end_date=2026-05-01')
      .set('Cookie', recruiterCookie());
    expect(res.status).toBe(400);
  });
});

describe('rowToEnvelope mapping', () => {
  it('maps DB row fields to API envelope', () => {
    const row: AuditEventRow = {
      id: EVENT_ID_1,
      actor_id: RECRUITER_ID,
      actor_type: 'user',
      event_type: 'reference_panel.token.minted',
      entity_type: 'reference_panel_tokens',
      entity_id: 'tok-1',
      changes: { before: { foo: 1 }, after: { foo: 2 } },
      payload: { scopes: ['x'] },
      ip_address: '203.0.113.1',
      user_agent: 'ua/1',
      occurred_at: new Date('2026-05-08T10:00:00Z'),
    };
    const env = rowToEnvelope(row);
    expect(env.action).toBe('reference_panel.token.minted');
    expect(env.resource_type).toBe('reference_panel_tokens');
    expect(env.resource_id).toBe('tok-1');
    expect(env.old_values).toEqual({ foo: 1 });
    expect(env.new_values).toEqual({ foo: 2 });
    expect(env.details).toEqual({ scopes: ['x'] });
    expect(env.timestamp).toBe('2026-05-08T10:00:00.000Z');
  });

  it('handles null changes gracefully', () => {
    const row: AuditEventRow = {
      id: EVENT_ID_2,
      actor_id: RECRUITER_ID,
      actor_type: 'system',
      event_type: 'cron.run',
      entity_type: null,
      entity_id: null,
      changes: null,
      payload: {},
      ip_address: null,
      user_agent: null,
      occurred_at: new Date('2026-05-08T00:00:00Z'),
    };
    const env = rowToEnvelope(row);
    expect(env.old_values).toBeNull();
    expect(env.new_values).toBeNull();
    expect(env.details).toEqual({});
  });
});
