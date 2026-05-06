/**
 * DB I/O for the testforge orchestrator. Reads questions in any non-terminal
 * pipeline state, applies pre-calibration priors, mirrors testforge_status
 * onto the customer-facing `status` column, and refreshes the audit JSONB.
 */

import type { Pool } from '@qorium/db';
import type { GateAudit, TestForgeStatus } from '../gates.js';
import type { NeighbourCandidate, NewlyAcceptedQuestion, PriorEstimate } from '../prior.js';

export interface OrchestratorRow {
  id: string;
  uuid: string;
  status: TestForgeStatus;
  customerFacingStatus: string;
  format: string;
  skillId: string | null;
  subSkillId: string | null;
  calibrationN: number;
  releasedAt: Date | null;
  audit: GateAudit;
}

interface OrchestratorRawRow {
  id: string;
  uuid: string;
  testforge_status: TestForgeStatus | null;
  status: string;
  format: string;
  skill_id: string | null;
  sub_skill_id: string | null;
  calibration_n: number | null;
  released_at: Date | null;
  testforge_audit: GateAudit | null;
}

const NON_TERMINAL = ['draft', 'sme_review', 'accepted', 'calibrating', 'bias_review', 'released'];

export async function listOrchestrationCandidates(
  pool: Pool,
  opts: { limit: number },
): Promise<OrchestratorRow[]> {
  const result = await pool.query<OrchestratorRawRow>(
    `SELECT id, uuid, testforge_status, status, format, skill_id, sub_skill_id,
            calibration_n, released_at, testforge_audit
       FROM content.questions
      WHERE COALESCE(testforge_status, 'draft') = ANY($1::varchar[])
      ORDER BY COALESCE(testforge_last_check, created_at) ASC
      LIMIT $2`,
    [NON_TERMINAL, opts.limit],
  );
  return result.rows.map(toOrchestratorRow);
}

function toOrchestratorRow(r: OrchestratorRawRow): OrchestratorRow {
  return {
    id: r.id,
    uuid: r.uuid,
    status: (r.testforge_status ?? 'draft') as TestForgeStatus,
    customerFacingStatus: r.status,
    format: r.format,
    skillId: r.skill_id,
    subSkillId: r.sub_skill_id,
    calibrationN: r.calibration_n ?? 0,
    releasedAt: r.released_at,
    audit: r.testforge_audit ?? {},
  };
}

export async function fetchPriorNeighbours(
  pool: Pool,
  question: NewlyAcceptedQuestion,
): Promise<NeighbourCandidate[]> {
  const result = await pool.query<{
    id: string;
    skill_id: string | null;
    sub_skill_id: string | null;
    format: string;
    difficulty_b: string | null;
    discrimination_a: string | null;
    guessing_c: string | null;
    calibration_n: number | null;
  }>(
    `SELECT id, skill_id, sub_skill_id, format, difficulty_b,
            discrimination_a, guessing_c, calibration_n
       FROM content.questions
      WHERE format = $1
        AND skill_id IS NOT DISTINCT FROM $2
        AND sub_skill_id IS NOT DISTINCT FROM $3
        AND status = 'released'
        AND COALESCE(calibration_n, 0) >= 30
      LIMIT 200`,
    [question.format, question.skillId, question.subSkillId],
  );
  return result.rows.map((r) => ({
    id: r.id,
    skillId: r.skill_id,
    subSkillId: r.sub_skill_id,
    format: r.format,
    difficultyB: r.difficulty_b !== null ? Number(r.difficulty_b) : null,
    discriminationA: r.discrimination_a !== null ? Number(r.discrimination_a) : null,
    guessingC: r.guessing_c !== null ? Number(r.guessing_c) : null,
    calibrationN: r.calibration_n ?? 0,
  }));
}

export interface ApplyPriorInput {
  questionId: string;
  prior: PriorEstimate;
  audit: GateAudit;
}

export async function applyPriorAndTransition(pool: Pool, input: ApplyPriorInput): Promise<void> {
  await pool.query(
    `UPDATE content.questions
        SET difficulty_b = $1,
            discrimination_a = $2,
            guessing_c = $3,
            testforge_status = 'calibrating',
            testforge_last_check = NOW(),
            testforge_audit = $4::jsonb,
            status = 'calibrating',
            updated_at = NOW()
      WHERE id = $5`,
    [
      input.prior.difficultyB,
      input.prior.discriminationA,
      input.prior.guessingC,
      JSON.stringify(input.audit),
      input.questionId,
    ],
  );
}

export interface SyncStatusInput {
  questionId: string;
  testforgeStatus: TestForgeStatus;
  customerFacingStatus: string;
  audit: GateAudit;
}

export async function syncStatus(pool: Pool, input: SyncStatusInput): Promise<void> {
  await pool.query(
    `UPDATE content.questions
        SET testforge_status = $1,
            status = $2,
            testforge_last_check = NOW(),
            testforge_audit = $3::jsonb,
            released_at = CASE WHEN $2 = 'released' THEN COALESCE(released_at, NOW()) ELSE released_at END,
            updated_at = NOW()
      WHERE id = $4`,
    [
      input.testforgeStatus,
      input.customerFacingStatus,
      JSON.stringify(input.audit),
      input.questionId,
    ],
  );
}
