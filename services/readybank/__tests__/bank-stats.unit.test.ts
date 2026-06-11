import { describe, expect, it } from 'vitest';
import type { Pool } from '@qorium/db';
import { getBankStats } from '../src/repositories/bank-stats.js';
import { SKILL_FAMILIES } from '../src/lib/skill-families.js';

/**
 * Unit-tests the N8 admin question-bank stats repository. No Postgres — a stub
 * Pool routes by SQL fragment and returns fixed rows. Verifies numeric
 * coercion, the calibration-percentage math, status/SKU maps, and that
 * released skill names are folded into the N7 family taxonomy (distinct count).
 */
function stubPool(): Pool {
  return {
    query: async (sql: string) => {
      if (sql.includes('questions_total')) {
        return {
          rows: [
            {
              questions_total: '1417',
              questions_released: '986',
              questions_calibrated: '2',
              skills_total: '511',
            },
          ],
          rowCount: 1,
        };
      }
      if (sql.includes('GROUP BY status')) {
        return {
          rows: [
            { k: 'released', n: '986' },
            { k: 'draft', n: '431' },
          ],
          rowCount: 2,
        };
      }
      if (sql.includes('GROUP BY sku')) {
        return {
          rows: [
            { k: 'readybank', n: '1400' },
            { k: 'jd-forge', n: '17' },
          ],
          rowCount: 2,
        };
      }
      // DISTINCT released skill names → mapped to families
      return {
        rows: [{ name: 'AWS' }, { name: 'React' }, { name: 'PostgreSQL' }, { name: 'Senior Sql' }],
        rowCount: 4,
      };
    },
  } as unknown as Pool;
}

function emptyPool(): Pool {
  return { query: async () => ({ rows: [], rowCount: 0 }) } as unknown as Pool;
}

describe('getBankStats repository', () => {
  it('coerces counts and computes calibration_pct off released', async () => {
    const s = await getBankStats(stubPool());
    expect(s.questions_total).toBe(1417);
    expect(s.questions_released).toBe(986);
    expect(s.questions_calibrated).toBe(2);
    expect(s.skills_total).toBe(511);
    // 2 / 986 = 0.2028... → rounded to 1 decimal
    expect(s.calibration_pct).toBe(0.2);
  });

  it('builds status and sku breakdown maps', async () => {
    const s = await getBankStats(stubPool());
    expect(s.by_status).toEqual({ released: 986, draft: 431 });
    expect(s.by_sku).toEqual({ readybank: 1400, 'jd-forge': 17 });
  });

  it('folds released skills into distinct families and exposes total families', async () => {
    const s = await getBankStats(stubPool());
    // AWS→cloud-devops, React→frontend, PostgreSQL & Senior Sql→data-databases = 3 distinct
    expect(s.families_with_released).toBe(3);
    expect(s.families_total).toBe(SKILL_FAMILIES.length);
    expect(typeof s.generated_at).toBe('string');
    expect(Number.isNaN(Date.parse(s.generated_at))).toBe(false);
  });

  it('degrades to zeros (no divide-by-zero) when the bank is empty', async () => {
    const s = await getBankStats(emptyPool());
    expect(s.questions_total).toBe(0);
    expect(s.questions_released).toBe(0);
    expect(s.calibration_pct).toBe(0);
    expect(s.families_with_released).toBe(0);
    expect(s.by_status).toEqual({});
  });
});
