import type { Pool } from '@qorium/db';
import {
  familyForSkill,
  familyName,
  type SkillFamilyId,
  SKILL_FAMILIES,
} from '../lib/skill-families.js';

// Recruiter-portal read helpers (tenant-scoped via the recruiter session).

export interface SkillOption {
  id: string;
  name: string;
  released: number;
}

export async function listTopSkills(pool: Pool, limit = 20): Promise<SkillOption[]> {
  const r = await pool.query<SkillOption>(
    `SELECT s.id::text, s.name, count(q.id)::int AS released
       FROM content.skills s
       JOIN content.questions q ON q.skill_id = s.id AND q.status = 'released'
      GROUP BY s.id, s.name
     HAVING count(q.id) > 0
      ORDER BY released DESC, s.name ASC
      LIMIT $1`,
    [limit],
  );
  return r.rows;
}

export async function pickReleasedQuestionIds(
  pool: Pool,
  skillId: string,
  count: number,
): Promise<string[]> {
  const r = await pool.query<{ id: string }>(
    `SELECT id::text FROM content.questions
      WHERE skill_id = $1 AND status = 'released'
      ORDER BY random() LIMIT $2`,
    [skillId, count],
  );
  return r.rows.map((x) => x.id);
}

export interface AssessmentSummary {
  id: string;
  title: string;
  total_questions: number;
  status: string;
  created_at: Date;
  invites: number;
  attempts: number;
}

export async function listAssessmentsForTenant(
  pool: Pool,
  tenantId: string,
): Promise<AssessmentSummary[]> {
  const r = await pool.query<AssessmentSummary>(
    `SELECT a.id::text, a.title, a.total_questions, a.status, a.created_at,
            (SELECT count(*)::int FROM content.invitations i WHERE i.assessment_id = a.id) AS invites,
            (SELECT count(*)::int FROM content.attempts t WHERE t.assessment_id = a.id) AS attempts
       FROM content.assessments a
      WHERE a.tenant_id = $1
      ORDER BY a.created_at DESC
      LIMIT 100`,
    [tenantId],
  );
  return r.rows;
}

export interface AttemptSummary {
  id: string;
  status: string;
  total_score: string | null;
  graded_at: Date | null;
  candidate_email: string;
  candidate_name: string | null;
}

export async function listAttemptsForAssessment(
  pool: Pool,
  assessmentId: string,
  tenantId: string,
): Promise<AttemptSummary[]> {
  const r = await pool.query<AttemptSummary>(
    `SELECT t.id::text, t.status, t.total_score, t.graded_at,
            i.candidate_email, i.candidate_name
       FROM content.attempts t
       JOIN content.invitations i ON i.id = t.invitation_id
      WHERE t.assessment_id = $1 AND t.tenant_id = $2
      ORDER BY t.started_at DESC`,
    [assessmentId, tenantId],
  );
  return r.rows;
}

// ── N7 skill consolidation — read-only family rollup ──────────────────────────
// Groups the fragmented micro-skill catalogue into the canonical buyer-facing
// families (see lib/skill-families.ts). Pure read against the existing schema —
// no migration required. The recruiter "families" view consumes this.

export interface SkillFamilyRollup {
  id: SkillFamilyId;
  name: string;
  released: number;
  skillCount: number;
  topSkills: { name: string; released: number }[];
}

export async function listSkillFamilies(pool: Pool): Promise<SkillFamilyRollup[]> {
  const r = await pool.query<{ name: string; released: number }>(
    `SELECT s.name, count(q.id)::int AS released
       FROM content.skills s
       JOIN content.questions q ON q.skill_id = s.id AND q.status = 'released'
      GROUP BY s.name
     HAVING count(q.id) > 0`,
  );

  const acc = new Map<
    SkillFamilyId,
    { released: number; skills: { name: string; released: number }[] }
  >();
  for (const fam of SKILL_FAMILIES) acc.set(fam.id, { released: 0, skills: [] });

  for (const row of r.rows) {
    const fid = familyForSkill(row.name);
    const bucket = acc.get(fid)!;
    bucket.released += row.released;
    bucket.skills.push({ name: row.name, released: row.released });
  }

  return SKILL_FAMILIES.map((fam) => {
    const bucket = acc.get(fam.id)!;
    return {
      id: fam.id,
      name: familyName(fam.id),
      released: bucket.released,
      skillCount: bucket.skills.length,
      topSkills: bucket.skills.sort((a, b) => b.released - a.released).slice(0, 5),
    };
  })
    .filter((fam) => fam.skillCount > 0)
    .sort((a, b) => b.released - a.released);
}
