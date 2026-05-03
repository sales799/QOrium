import type { Pool } from '@qorium/db';
import { searchQuestions } from './questions.js';
import type { SearchFilters } from './questions.js';
import type { QuestionPublic } from '../types/question.js';

/**
 * Pack persistence — snapshot of question UUIDs resolved at generate-time
 * so subsequent /export calls return a stable bundle even if the underlying
 * library rotates between calls.
 */

export interface CreatePackInput {
  tenantId: string;
  apiKeyId: string | null;
  name: string | null;
  filters: SearchFilters;
  /** Optional pack-size override; capped by the search MAX_LIMIT (100). */
  limit?: number;
  /** Optional expiry in days from now. */
  expiresInDays?: number;
}

export interface PackRow {
  id: string;
  tenant_id: string;
  api_key_id: string | null;
  name: string | null;
  filters: Record<string, unknown>;
  question_ids: string[];
  question_count: number;
  status: 'ready' | 'generating' | 'failed' | 'expired';
  expires_at: Date | null;
  created_at: Date;
  last_exported_at: Date | null;
  export_count: number;
}

export async function createPack(pool: Pool, input: CreatePackInput): Promise<PackRow> {
  // Resolve the snapshot of question UUIDs by calling the existing search
  // path. We don't paginate — packs are bounded to MAX_LIMIT (100).
  const result = await searchQuestions(pool, {
    ...input.filters,
    ...(input.limit !== undefined ? { limit: input.limit } : {}),
  });

  const questionIds = result.questions.map((q) => q.uuid);

  const expiresAt =
    input.expiresInDays !== undefined && input.expiresInDays > 0
      ? new Date(Date.now() + input.expiresInDays * 24 * 60 * 60 * 1000)
      : null;

  const insert = await pool.query<PackRow>(
    `INSERT INTO app.packs (tenant_id, api_key_id, name, filters, question_ids, question_count, expires_at)
     VALUES ($1, $2, $3, $4::jsonb, $5::uuid[], $6, $7)
     RETURNING id, tenant_id, api_key_id, name, filters, question_ids, question_count,
               status, expires_at, created_at, last_exported_at, export_count`,
    [
      input.tenantId,
      input.apiKeyId,
      input.name,
      JSON.stringify(input.filters),
      questionIds,
      questionIds.length,
      expiresAt,
    ],
  );

  return insert.rows[0]!;
}

export async function getPackByIdForTenant(
  pool: Pool,
  packId: string,
  tenantId: string,
): Promise<PackRow | null> {
  const result = await pool.query<PackRow>(
    `SELECT id, tenant_id, api_key_id, name, filters, question_ids, question_count,
            status, expires_at, created_at, last_exported_at, export_count
     FROM app.packs
     WHERE id = $1 AND tenant_id = $2`,
    [packId, tenantId],
  );
  const row = result.rows[0];
  if (!row) return null;

  // Treat expired packs as not-found rather than serve stale exports.
  if (row.expires_at !== null && row.expires_at <= new Date()) {
    return null;
  }
  return row;
}

/**
 * Stream the questions of a pack in the order they were captured at
 * generation time (preserves the search ordering). Yields one
 * QuestionPublic at a time so the route handler can write incrementally
 * to the response body without buffering the whole pack in memory.
 *
 * Implementation note: We chunk the SELECT by 50 rows to balance round-trip
 * count against memory; full pg-cursor streaming is overkill for the
 * MAX_LIMIT=100 bound on a pack.
 */
export async function* streamPackQuestions(
  pool: Pool,
  pack: PackRow,
): AsyncGenerator<QuestionPublic, void, void> {
  if (pack.question_ids.length === 0) return;

  const CHUNK = 50;
  for (let i = 0; i < pack.question_ids.length; i += CHUNK) {
    const slice = pack.question_ids.slice(i, i + CHUNK);
    const result = await pool.query<{
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
    }>(
      `SELECT id, sku, format, language, status, skill_id, sub_skill_id, body_md, body_json,
              rubric_json, reference_solution, test_cases,
              difficulty_b, discrimination_a, empirical_pass_rate,
              released_at, created_at
       FROM content.questions
       WHERE id = ANY($1::uuid[]) AND status = 'released' AND sku = 'readybank'`,
      [slice],
    );

    // Re-order by the original pack order (SQL doesn't preserve ANY() input order).
    const byId = new Map(result.rows.map((r) => [r.id, r]));
    for (const id of slice) {
      const r = byId.get(id);
      if (!r) continue; // Question was retired between generate and export.

      const b = r.difficulty_b !== null ? Number.parseFloat(r.difficulty_b) : null;
      const a = r.discrimination_a !== null ? Number.parseFloat(r.discrimination_a) : null;
      const pr = r.empirical_pass_rate !== null ? Number.parseFloat(r.empirical_pass_rate) : null;

      const { difficultyBToBand } = await import('../types/question.js');
      yield {
        uuid: r.id,
        sku: r.sku,
        format: r.format,
        language: r.language,
        status: r.status,
        skill_id: r.skill_id,
        sub_skill_id: r.sub_skill_id,
        body_md: r.body_md,
        body_json: r.body_json,
        rubric: r.rubric_json,
        reference_solution: r.reference_solution,
        test_cases: r.test_cases,
        difficulty_band: difficultyBToBand(b),
        difficulty_b: b,
        discrimination_a: a,
        empirical_pass_rate: pr,
        released_at: r.released_at !== null ? r.released_at.toISOString() : null,
        created_at: r.created_at.toISOString(),
      };
    }
  }
}

export async function recordExport(pool: Pool, packId: string): Promise<void> {
  try {
    await pool.query(
      `UPDATE app.packs
       SET last_exported_at = NOW(), export_count = export_count + 1
       WHERE id = $1`,
      [packId],
    );
  } catch {
    // Audit trail update; never block the export itself.
  }
}
