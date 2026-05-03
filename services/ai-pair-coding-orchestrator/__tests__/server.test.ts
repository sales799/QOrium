import { describe, expect, it } from 'vitest';
import request from 'supertest';
import pino from 'pino';
import type { Pool } from '@qorium/db';
import { createServer } from '../src/server';
import { stubAnthropicClient } from '../src/anthropic';

const silent = pino({ level: 'silent' });
const TENANT_ID = '11111111-2222-3333-4444-555555555555';
const SESSION_ID = '22222222-3333-4444-5555-666666666666';

function fixturePool(): Pool {
  const sessions = new Map<string, Record<string, unknown>>();
  let messages = 0;
  return {
    query: async (sql: string, params?: unknown[]) => {
      if (sql.includes('INSERT INTO content.ai_pair_coding_sessions')) {
        const row = {
          id: SESSION_ID,
          question_id: params?.[0],
          candidate_id: params?.[1],
          tenant_id: params?.[2],
          started_at: new Date(),
          submitted_at: null,
          status: 'in_progress',
          final_code_text: null,
          ai_messages_count: 0,
          candidate_typed_chars: 0,
          candidate_pasted_chars: 0,
          edit_test_cycles: 0,
          signals: {},
          grades: null,
          ai_provider: params?.[3],
          ai_model: params?.[4],
        };
        sessions.set(SESSION_ID, row);
        return { rows: [row], rowCount: 1 };
      }
      if (sql.includes('FROM content.ai_pair_coding_sessions') && sql.includes('id = $1')) {
        const id = String(params?.[0]);
        const row = sessions.get(id);
        return { rows: row ? [row] : [] };
      }
      if (sql.includes('INSERT INTO content.ai_pair_coding_messages')) {
        return { rows: [{ id: `msg-${++messages}` }], rowCount: 1 };
      }
      if (sql.includes('UPDATE content.ai_pair_coding_sessions')) {
        const id = String(params?.[7]);
        const row = sessions.get(id);
        if (row) {
          row.status = 'submitted';
          row.submitted_at = new Date();
          row.final_code_text = params?.[0];
          row.signals = params?.[1];
          row.grades = params?.[2];
          row.ai_messages_count = params?.[3];
          row.candidate_typed_chars = params?.[4];
          row.candidate_pasted_chars = params?.[5];
          row.edit_test_cycles = params?.[6];
        }
        return { rows: row ? [row] : [], rowCount: row ? 1 : 0 };
      }
      return { rows: [] };
    },
    end: async () => {},
    connect: async () => {
      throw new Error('connect not stubbed');
    },
  } as unknown as Pool;
}

describe('ai-pair-coding-orchestrator server', () => {
  it('GET /healthz returns ok', async () => {
    const app = createServer({ logger: silent });
    const r = await request(app).get('/healthz');
    expect(r.status).toBe(200);
  });

  it('POST /v1/ai-pair-coding/sessions creates a session', async () => {
    const pool = fixturePool();
    const app = createServer({ logger: silent, pool });
    const r = await request(app)
      .post('/v1/ai-pair-coding/sessions')
      .set('x-tenant-id', TENANT_ID)
      .send({ candidate_id: 'cand-1' });
    expect(r.status).toBe(201);
    expect(r.body.candidateId).toBe('cand-1');
  });

  it('POST sessions returns 401 without tenant', async () => {
    const pool = fixturePool();
    const app = createServer({ logger: silent, pool });
    const r = await request(app)
      .post('/v1/ai-pair-coding/sessions')
      .send({ candidate_id: 'cand-1' });
    expect(r.status).toBe(401);
  });

  it('GET session 400 on bad id', async () => {
    const app = createServer({ logger: silent, pool: fixturePool() });
    const r = await request(app).get('/v1/ai-pair-coding/sessions/not-a-uuid');
    expect(r.status).toBe(400);
  });

  it('GET session 404 when missing', async () => {
    const app = createServer({ logger: silent, pool: fixturePool() });
    const r = await request(app).get(`/v1/ai-pair-coding/sessions/${SESSION_ID}`);
    expect(r.status).toBe(404);
  });

  it('POST turn appends a message + returns AI completion', async () => {
    const pool = fixturePool();
    const app = createServer({ logger: silent, pool, anthropic: stubAnthropicClient() });
    await request(app)
      .post('/v1/ai-pair-coding/sessions')
      .set('x-tenant-id', TENANT_ID)
      .send({ candidate_id: 'cand-1' });
    const r = await request(app)
      .post(`/v1/ai-pair-coding/sessions/${SESSION_ID}/turn`)
      .send({ candidate_message: 'How do I reverse a linked list?' });
    expect(r.status).toBe(201);
    expect(r.body.ai_message).toMatch(/stub Claude/);
  });

  it('POST submit grades + finalises a session', async () => {
    const pool = fixturePool();
    const app = createServer({ logger: silent, pool });
    await request(app)
      .post('/v1/ai-pair-coding/sessions')
      .set('x-tenant-id', TENANT_ID)
      .send({ candidate_id: 'cand-1' });
    const r = await request(app)
      .post(`/v1/ai-pair-coding/sessions/${SESSION_ID}/submit`)
      .send({
        final_code_text: 'function reverse(head){...}',
        signals: {
          typedChars: 1500,
          pastedChars: 200,
          editTestCycles: 6,
          candidateMessageCount: 5,
          acceptedVerbatimCount: 2,
          acceptedModifiedCount: 3,
          rejectedCount: 1,
          seededErrorsCaught: 1,
          seededErrorsTotal: 2,
          codeQualityScore: 4,
          timeToFirstCodeSec: 30,
          durationSec: 1800,
        },
      });
    expect(r.status).toBe(200);
    expect(r.body.status).toBe('submitted');
    expect(r.body.grades.weightedTotal).toBeGreaterThan(0);
  });
});
