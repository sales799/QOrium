import { randomUUID } from 'node:crypto';
import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import express from 'express';
import request from 'supertest';
import { createPool, type Pool } from '@qorium/db';
import { getAttemptForToken } from '../src/repositories/attempts.js';
import { candidateAttemptRouter } from '../src/routes/attempts.js';
import { problemHandler } from '../src/middleware/problem.js';

// Separate opt-in URL: never activates the existing production-shaped test suites.
const url = process.env.QORIUM_EXPIRY_TEST_DATABASE_URL;
describe.skipIf(!url)('candidate invitation expiry (isolated PostgreSQL)', () => {
  let admin: Pool;
  let pool: Pool;
  const database = `qorium_expiry_${randomUUID().replaceAll('-', '')}`;
  let created = false;
  const attemptId = randomUUID();
  const invitationId = randomUUID();
  const token = `synthetic_${randomUUID()}`;
  beforeAll(async () => {
    admin = createPool({ connectionString: url!, max: 1 });
    await admin.query(`CREATE DATABASE ${database}`);
    created = true;
    const target = new URL(url!);
    target.pathname = `/${database}`;
    pool = createPool({ connectionString: target.toString(), max: 2 });
    // Minimal real SQL fixture for the repository authorization boundary.
    await pool.query(`CREATE SCHEMA content;
      CREATE TABLE content.invitations(id uuid PRIMARY KEY, token text, expires_at timestamptz);
      CREATE TABLE content.attempts(id uuid PRIMARY KEY, invitation_id uuid, assessment_id uuid, tenant_id uuid,
        candidate_id text, status text, question_order uuid[], current_idx int, total_score numeric, max_score numeric,
        started_at timestamptz, submitted_at timestamptz, graded_at timestamptz)`);
    await pool.query(`INSERT INTO content.invitations VALUES ($1,$2,now() + interval '1 hour')`, [
      invitationId,
      token,
    ]);
    await pool.query(
      `INSERT INTO content.attempts(id,invitation_id,assessment_id,tenant_id,candidate_id,status,question_order,current_idx,started_at)
      VALUES ($1,$2,$3,$4,'synthetic','started','{}',0,now())`,
      [attemptId, invitationId, randomUUID(), randomUUID()],
    );
  });
  afterAll(async () => {
    if (pool) await pool.end();
    if (admin) {
      if (created) await admin.query(`DROP DATABASE ${database} WITH (FORCE)`);
      await admin.end();
    }
  });
  it('allows a current matching invitation and rejects a different token or attempt', async () => {
    expect((await getAttemptForToken(pool, attemptId, token))?.id).toBe(attemptId);
    expect(await getAttemptForToken(pool, attemptId, 'wrong-token')).toBeNull();
    expect(await getAttemptForToken(pool, randomUUID(), token)).toBeNull();
  });
  it('rejects an expired invitation at the shared repository boundary', async () => {
    await pool.query(
      `UPDATE content.invitations SET expires_at = now() - interval '1 day' WHERE id=$1`,
      [invitationId],
    );
    expect(await getAttemptForToken(pool, attemptId, token)).toBeNull();
  });
  it('blocks all five attempt routes before question reads, grading or writes', async () => {
    await pool.query(
      `UPDATE content.invitations SET expires_at = now() - interval '1 day' WHERE id=$1`,
      [invitationId],
    );
    const app = express();
    app.use(express.json());
    app.use(candidateAttemptRouter({ pool }));
    app.use(problemHandler());
    for (const suffix of ['question/0', 'state', 'result']) {
      const res = await request(app).get(`/v1/attempts/${attemptId}/${suffix}`).query({ token });
      expect(res.status).toBe(404);
      expect(res.body.detail).toBe('Attempt not found for token');
    }
    for (const suffix of ['answer', 'submit']) {
      const res = await request(app)
        .post(`/v1/attempts/${attemptId}/${suffix}`)
        .send({ token, question_id: randomUUID(), response_body: { answer: 0 } });
      expect(res.status).toBe(404);
      expect(res.body.detail).toBe('Attempt not found for token');
    }
  });
});
