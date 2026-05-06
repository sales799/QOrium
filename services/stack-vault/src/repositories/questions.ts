/**
 * Per-vault question reads. A question belongs to a vault when its
 * `watermark_id` column is non-null and matches the vault's tenant — but
 * v0 doesn't fork rows per customer (see CTO-DELTA), so the practical
 * mapping is: a master question is "in" the vault when it shares a parent
 * with the vault's named question pool, OR (for the v0 MVP) when the
 * question's status is 'released' AND it's been explicitly tagged for
 * Stack-Vault customers via a tag column on the row.
 *
 * v0 simplifies further: returns released questions as variants. A future
 * sprint will add explicit `app.stack_vault_questions(vault_id, question_id)`
 * many-to-many membership; for now the customer can search the broader
 * released library and the orchestrator brands every result with their
 * watermark.
 */

import type { Pool } from '@qorium/db';
import type { MasterQuestion } from '../variant.js';

interface QuestionRow {
  id: string;
  uuid: string;
  format: string;
  body_md: string;
  body_json: Record<string, unknown>;
  answer_key: Record<string, unknown> | null;
  test_cases: Array<Record<string, unknown>> | null;
  reference_solution: Record<string, unknown> | string | null;
  difficulty_b: string | null;
  discrimination_a: string | null;
  guessing_c: string | null;
}

const SELECT_COLUMNS = `id, uuid, format, body_md, body_json, answer_key,
  test_cases, reference_solution, difficulty_b, discrimination_a, guessing_c`;

function toMaster(r: QuestionRow): MasterQuestion {
  return {
    id: r.id,
    uuid: r.uuid,
    format: r.format,
    bodyMd: r.body_md,
    bodyJson: r.body_json,
    answerKey: r.answer_key,
    testCases: r.test_cases,
    referenceSolution:
      typeof r.reference_solution === 'string'
        ? r.reference_solution
        : r.reference_solution
          ? JSON.stringify(r.reference_solution)
          : null,
    difficultyB: r.difficulty_b !== null ? Number(r.difficulty_b) : null,
    discriminationA: r.discrimination_a !== null ? Number(r.discrimination_a) : null,
    guessingC: r.guessing_c !== null ? Number(r.guessing_c) : null,
  };
}

export interface SearchOptions {
  format?: string;
  difficultyMin?: number;
  difficultyMax?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

function clampLimit(n: number | undefined): number {
  if (n === undefined || !Number.isFinite(n) || n <= 0) return DEFAULT_LIMIT;
  return Math.min(Math.floor(n), MAX_LIMIT);
}

export async function searchVaultQuestions(
  pool: Pool,
  opts: SearchOptions,
): Promise<MasterQuestion[]> {
  const limit = clampLimit(opts.limit);
  const conditions: string[] = ["status = 'released'"];
  const params: unknown[] = [];
  if (opts.format !== undefined) {
    params.push(opts.format);
    conditions.push(`format = $${params.length}`);
  }
  if (opts.difficultyMin !== undefined) {
    params.push(opts.difficultyMin);
    conditions.push(`difficulty_b >= $${params.length}`);
  }
  if (opts.difficultyMax !== undefined) {
    params.push(opts.difficultyMax);
    conditions.push(`difficulty_b <= $${params.length}`);
  }
  params.push(limit);
  const sql = `SELECT ${SELECT_COLUMNS}
       FROM content.questions
      WHERE ${conditions.join(' AND ')}
      ORDER BY released_at DESC NULLS LAST, id ASC
      LIMIT $${params.length}`;
  const result = await pool.query<QuestionRow>(sql, params);
  return result.rows.map(toMaster);
}

export async function getReleasedQuestion(
  pool: Pool,
  uuid: string,
): Promise<MasterQuestion | null> {
  const result = await pool.query<QuestionRow>(
    `SELECT ${SELECT_COLUMNS}
       FROM content.questions
      WHERE uuid = $1 AND status = 'released'
      LIMIT 1`,
    [uuid],
  );
  return result.rows[0] ? toMaster(result.rows[0]) : null;
}
