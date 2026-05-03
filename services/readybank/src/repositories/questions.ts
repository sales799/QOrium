import type { Pool } from '@qorium/db';
import { bandToBRange, difficultyBToBand } from '../types/question.js';
import type { DifficultyBand, QuestionPublic } from '../types/question.js';
import type { QuestionCursor } from '../types/cursor.js';

/**
 * Read-only repository over `content.questions`.
 *
 * Queries restrict to `status = 'released'` and `sku = 'readybank'` so that
 * draft / SME-review / calibrating items and ephemeral JD-Forge questions
 * are never visible via the public API surface.
 */

export interface SearchFilters {
  /** Skill slug (matches `content.skills.slug`). */
  skill?: string;
  /** Sub-skill slug under the same parent skill. */
  subSkill?: string;
  /** Question format (mcq, msq, coding-fn, etc.). */
  format?: string;
  /** Difficulty band 1–5 (translated to IRT b range). */
  difficulty?: DifficultyBand;
  /** Two-letter language code. */
  language?: string;
  /** Maximum rows; clamp 1–100, default 20. */
  limit?: number;
  /** Opaque cursor from a prior page. */
  cursor?: QuestionCursor;
}

export interface SearchResult {
  questions: QuestionPublic[];
  /** Cursor for the next page; null when fewer than `limit` rows returned. */
  next_cursor: string | null;
}

interface QuestionRow {
  id: string;
  sku: 'readybank' | 'jd-forge' | 'stack-vault';
  format: string;
  language: string;
  status: string;
  skill_id: string | null;
  sub_skill_id: string | null;
  body_md: string;
  body_json: Record<string, unknown>;
  rubric_json: Record<string, unknown> | null;
  reference_solution: Record<string, unknown> | null;
  test_cases: Record<string, unknown> | null;
  difficulty_b: string | null;
  discrimination_a: string | null;
  empirical_pass_rate: string | null;
  released_at: Date | null;
  created_at: Date;
}

function rowToPublic(row: QuestionRow): QuestionPublic {
  const b = row.difficulty_b !== null ? Number.parseFloat(row.difficulty_b) : null;
  const a = row.discrimination_a !== null ? Number.parseFloat(row.discrimination_a) : null;
  const pr = row.empirical_pass_rate !== null ? Number.parseFloat(row.empirical_pass_rate) : null;

  return {
    uuid: row.id,
    sku: row.sku,
    format: row.format,
    language: row.language,
    status: row.status,
    skill_id: row.skill_id,
    sub_skill_id: row.sub_skill_id,
    body_md: row.body_md,
    body_json: row.body_json,
    rubric: row.rubric_json,
    reference_solution: row.reference_solution,
    test_cases: row.test_cases,
    difficulty_band: difficultyBToBand(b),
    difficulty_b: b,
    discrimination_a: a,
    empirical_pass_rate: pr,
    released_at: row.released_at !== null ? row.released_at.toISOString() : null,
    created_at: row.created_at.toISOString(),
  };
}

export async function getQuestionByUuid(pool: Pool, uuid: string): Promise<QuestionPublic | null> {
  const result = await pool.query<QuestionRow>(
    `SELECT id, sku, format, language, status, skill_id, sub_skill_id, body_md, body_json,
            rubric_json, reference_solution, test_cases,
            difficulty_b, discrimination_a, empirical_pass_rate,
            released_at, created_at
     FROM content.questions
     WHERE id = $1 AND status = 'released' AND sku = 'readybank'
     LIMIT 1`,
    [uuid],
  );
  const row = result.rows[0];
  return row ? rowToPublic(row) : null;
}

const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 20;

export async function searchQuestions(pool: Pool, filters: SearchFilters): Promise<SearchResult> {
  const limit = Math.min(Math.max(filters.limit ?? DEFAULT_LIMIT, 1), MAX_LIMIT);

  const conditions: string[] = [`q.status = 'released'`, `q.sku = 'readybank'`];
  const params: unknown[] = [];

  if (filters.format) {
    params.push(filters.format);
    conditions.push(`q.format = $${params.length}`);
  }

  if (filters.language) {
    params.push(filters.language);
    conditions.push(`q.language = $${params.length}`);
  }

  if (filters.difficulty !== undefined) {
    const range = bandToBRange(filters.difficulty);
    params.push(range.min, range.maxExclusive);
    conditions.push(
      `q.difficulty_b IS NOT NULL AND q.difficulty_b >= $${params.length - 1} AND q.difficulty_b < $${params.length}`,
    );
  }

  if (filters.skill) {
    params.push(filters.skill);
    conditions.push(`q.skill_id IN (SELECT id FROM content.skills WHERE slug = $${params.length})`);
  }

  if (filters.subSkill) {
    params.push(filters.subSkill);
    conditions.push(
      `q.sub_skill_id IN (SELECT id FROM content.sub_skills WHERE slug = $${params.length})`,
    );
  }

  if (filters.cursor) {
    params.push(filters.cursor.released_at, filters.cursor.id);
    // Sort key = (released_at DESC, id DESC); cursor advances to "older" rows.
    conditions.push(
      `(q.released_at, q.id) < ($${params.length - 1}::timestamptz, $${params.length}::uuid)`,
    );
  }

  params.push(limit + 1); // Fetch one extra to know if there's a next page.

  const sql = `
    SELECT q.id, q.sku, q.format, q.language, q.status, q.skill_id, q.sub_skill_id,
           q.body_md, q.body_json, q.rubric_json, q.reference_solution, q.test_cases,
           q.difficulty_b, q.discrimination_a, q.empirical_pass_rate,
           q.released_at, q.created_at
    FROM content.questions q
    WHERE ${conditions.join(' AND ')}
    ORDER BY q.released_at DESC NULLS LAST, q.id DESC
    LIMIT $${params.length}
  `;

  const result = await pool.query<QuestionRow>(sql, params);
  const rows = result.rows;
  const hasMore = rows.length > limit;
  const trimmed = hasMore ? rows.slice(0, limit) : rows;
  const questions = trimmed.map(rowToPublic);

  let nextCursor: string | null = null;
  if (hasMore) {
    const last = trimmed[trimmed.length - 1];
    if (last && last.released_at !== null) {
      // Encoding handled in the route layer to keep the repo type-clean;
      // we return the raw tuple here for the route to encode.
      nextCursor = JSON.stringify({
        r: last.released_at.toISOString(),
        i: last.id,
      });
    }
  }

  return { questions, next_cursor: nextCursor };
}
