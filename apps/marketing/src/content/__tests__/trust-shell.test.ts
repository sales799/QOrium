import { describe, expect, it } from 'vitest';

import { trustHub, trustNavigation, trustPages } from '@/content/trust';
import { resolveResponsibleAiRows } from '@/content/trust-flags';

describe('trust shell content', () => {
  it('ships every Phase 3 trust destination with citations', () => {
    expect(trustNavigation.map((item) => item.href)).toEqual([
      '/trust',
      '/security',
      '/compliance-dpdp',
      '/responsible-ai',
      '/science',
      '/method',
      '/anti-leak',
      '/authoring',
    ]);
    expect(trustHub.citations.length).toBeGreaterThanOrEqual(2);

    for (const page of Object.values(trustPages)) {
      expect(page.citations.length).toBeGreaterThanOrEqual(2);
      expect(page.rows.length).toBeGreaterThan(0);
      expect(page.sections.length).toBeGreaterThan(0);
    }
  });

  it('keeps responsible AI status rows wired to explicit flags', () => {
    const rows = resolveResponsibleAiRows();

    expect(rows.map((row) => row.label)).toEqual([
      'AI item-generation grading',
      'JD-Forge skill extraction',
      'IRT calibration',
      'Anti-leak crawler',
      'AI Interviewer',
      'AI Phone Screens',
      'Independent bias-audit report',
    ]);

    for (const row of rows) {
      expect(row.flag).toBeTruthy();
      expect(row.flagState).toMatch(/enabled|disabled/);
      expect(row.flagSource).toMatch(/^(env:|release-manifest:)/);
      expect(row.owner).toBeTruthy();
      expect(row.lastVerified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    expect(
      rows.filter((row) => row.status === 'shipped').every((row) => row.flagState === 'enabled'),
    ).toBe(true);
  });

  it('does not publish certification states without evidence', () => {
    const securityRows = trustPages.security.rows;

    expect(securityRows.find((row) => row.label === 'SOC 2 Type II')?.status).toBe('not-claimed');
    expect(securityRows.find((row) => row.label === 'ISO 27001')?.status).toBe('not-claimed');
  });
});
