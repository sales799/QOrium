import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { SKILL_FAMILY_SEED, SKILL_FAMILIES } from '../src/lib/skill-families.js';

const here = dirname(fileURLToPath(import.meta.url));
const migrationPath = resolve(
  here,
  '../../../infra/B7-postgres-migrations/0022_skill_families.sql',
);

describe('skill_families persistence seed (migration 0022)', () => {
  it('seed mirrors the in-app taxonomy 1:1', () => {
    expect(SKILL_FAMILY_SEED).toHaveLength(SKILL_FAMILIES.length);
    SKILL_FAMILY_SEED.forEach((row, i) => {
      expect(row.id).toBe(SKILL_FAMILIES[i].id);
      expect(row.name).toBe(SKILL_FAMILIES[i].name);
      expect(row.sortOrder).toBe(i);
    });
  });

  it('migration 0022 seeds exactly the SKILL_FAMILY_SEED rows', () => {
    const sql = readFileSync(migrationPath, 'utf8');
    for (const row of SKILL_FAMILY_SEED) {
      expect(sql, row.id + ' id seeded').toContain("('" + row.id + "',");
      expect(sql, row.name + ' name seeded').toContain("'" + row.name + "',");
    }
    const seededRowCount = (sql.match(/^ *\('/gm) || []).length;
    expect(seededRowCount).toBe(SKILL_FAMILY_SEED.length);
  });
});
