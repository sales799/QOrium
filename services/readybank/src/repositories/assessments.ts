import { randomBytes } from 'node:crypto';
import type { Pool } from '@qorium/db';

export interface AssessmentRow {
  id: string;
  tenant_id: string;
  title: string;
  slug: string;
  selection_mode: 'fixed' | 'blueprint' | 'adaptive';
  blueprint_json: unknown | null;
  time_limit_sec: number;
  pass_score: string;
  total_questions: number;
  status: 'draft' | 'active' | 'archived';
  created_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface BlueprintItem {
  skill_id: string;
  count: number;
  difficulty_band?: number | undefined;
}

export interface CreateAssessmentInput {
  tenantId: string;
  title: string;
  slug?: string | null;
  timeLimitSec?: number;
  passScore?: number;
  status?: 'draft' | 'active';
  createdBy?: string | null;
  questionIds?: string[];
  blueprint?: BlueprintItem[];
}

function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
  return base.length > 0 ? base : 'assessment';
}

/** Return the subset of `ids` that exist AND are released questions. */
export async function filterReleasedQuestionIds(pool: Pool, ids: string[]): Promise<string[]> {
  if (ids.length === 0) return [];
  const result = await pool.query<{ id: string }>(
    `SELECT id FROM content.questions WHERE id = ANY($1::uuid[]) AND status = 'released'`,
    [ids],
  );
  return result.rows.map((r) => r.id);
}

export async function createAssessment(
  pool: Pool,
  input: CreateAssessmentInput,
): Promise<AssessmentRow> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const mode: 'fixed' | 'blueprint' = input.blueprint ? 'blueprint' : 'fixed';
    const orderedIds = mode === 'fixed' ? (input.questionIds ?? []) : [];
    const total =
      mode === 'fixed'
        ? orderedIds.length
        : (input.blueprint ?? []).reduce((acc, item) => acc + item.count, 0);

    const slug = input.slug
      ? slugify(input.slug)
      : `${slugify(input.title)}-${randomBytes(3).toString('hex')}`;

    const inserted = await client.query<AssessmentRow>(
      `INSERT INTO content.assessments
         (tenant_id, title, slug, selection_mode, blueprint_json, time_limit_sec,
          pass_score, total_questions, status, created_by)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8, $9, $10)
       RETURNING id, tenant_id, title, slug, selection_mode, blueprint_json, time_limit_sec,
                 pass_score, total_questions, status, created_by, created_at, updated_at`,
      [
        input.tenantId,
        input.title,
        slug,
        mode,
        input.blueprint ? JSON.stringify(input.blueprint) : null,
        input.timeLimitSec ?? 3600,
        input.passScore ?? 0.6,
        total,
        input.status ?? 'draft',
        input.createdBy ?? null,
      ],
    );
    const assessment = inserted.rows[0]!;

    if (mode === 'fixed' && orderedIds.length > 0) {
      const values: string[] = [];
      const params: unknown[] = [assessment.id];
      orderedIds.forEach((qid, index) => {
        params.push(qid);
        values.push(`($1, $${params.length}::uuid, ${index})`);
      });
      await client.query(
        `INSERT INTO content.assessment_questions (assessment_id, question_id, position)
         VALUES ${values.join(', ')}`,
        params,
      );
    }

    await client.query('COMMIT');
    return assessment;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

export type AssessmentWithQuestions = AssessmentRow & { question_ids: string[] };

export async function getAssessmentForTenant(
  pool: Pool,
  id: string,
  tenantId: string,
): Promise<AssessmentWithQuestions | null> {
  const result = await pool.query<AssessmentRow>(
    `SELECT id, tenant_id, title, slug, selection_mode, blueprint_json, time_limit_sec,
            pass_score, total_questions, status, created_by, created_at, updated_at
     FROM content.assessments
     WHERE id = $1 AND tenant_id = $2`,
    [id, tenantId],
  );
  const assessment = result.rows[0];
  if (!assessment) return null;

  const questions = await pool.query<{ question_id: string }>(
    `SELECT question_id FROM content.assessment_questions
     WHERE assessment_id = $1 ORDER BY position`,
    [id],
  );
  return { ...assessment, question_ids: questions.rows.map((r) => r.question_id) };
}

export interface CreateInvitationInput {
  assessmentId: string;
  tenantId: string;
  candidateEmail: string;
  candidateName?: string | null;
  expiresInDays?: number;
  createdBy?: string | null;
}

export interface InvitationRow {
  id: string;
  assessment_id: string;
  tenant_id: string;
  candidate_email: string;
  candidate_name: string | null;
  token: string;
  status: string;
  expires_at: Date;
  sent_at: Date | null;
  created_at: Date;
}

export async function createInvitation(
  pool: Pool,
  input: CreateInvitationInput,
): Promise<InvitationRow> {
  const token = randomBytes(24).toString('base64url');
  const days = input.expiresInDays ?? 14;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  const result = await pool.query<InvitationRow>(
    `INSERT INTO content.invitations
       (assessment_id, tenant_id, candidate_email, candidate_name, token, expires_at, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, assessment_id, tenant_id, candidate_email, candidate_name, token,
               status, expires_at, sent_at, created_at`,
    [
      input.assessmentId,
      input.tenantId,
      input.candidateEmail,
      input.candidateName ?? null,
      token,
      expiresAt,
      input.createdBy ?? null,
    ],
  );
  return result.rows[0]!;
}

export async function markInvitationSent(pool: Pool, id: string): Promise<void> {
  await pool.query(`UPDATE content.invitations SET sent_at = NOW() WHERE id = $1`, [id]);
}
