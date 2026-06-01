import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const migrationPath = resolve(
  import.meta.dirname,
  '../../../infra/B7-postgres-migrations/0016_programmatic_seo_role_graph.sql',
);

describe('programmatic SEO role-graph migration', () => {
  const sql = readFileSync(migrationPath, 'utf8');

  it('extends canonical content tables without dropping existing data', () => {
    expect(sql).toMatch(/ALTER TABLE content\.skills ADD COLUMN IF NOT EXISTS calibration_status/i);
    expect(sql).toMatch(/ALTER TABLE content\.roles ADD COLUMN IF NOT EXISTS seniority_levels/i);
    expect(sql).toMatch(/ALTER TABLE content\.role_skills ADD COLUMN IF NOT EXISTS skill_id/i);
    expect(sql).not.toMatch(/DROP TABLE content\.skills/i);
    expect(sql).not.toMatch(/DROP TABLE content\.roles/i);
  });

  it('adds stack, synonym, and competitor-matrix sources for SEO generation', () => {
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS content\.stacks/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS content\.stack_skills/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS content\.skill_synonyms/i);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS content\.competitor_matrix/i);
  });

  it('keeps public claims evidence-gated in the database model', () => {
    expect(sql).toMatch(/source_url/i);
    expect(sql).toMatch(/source_checked_at/i);
    expect(sql).toMatch(/where_competitor_is_better/i);
  });
});
