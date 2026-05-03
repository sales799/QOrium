import { describe, expect, it } from 'vitest';
import { findSection, SECTIONS, sectionsByCategory } from '../src/lib/sections';
import { renderSection } from '../src/lib/content';

describe('docs sections catalogue', () => {
  it('contains every spec category from infra/API-Documentation-v0.md', () => {
    const slugs = SECTIONS.map((s) => s.slug);
    expect(slugs).toContain('overview');
    expect(slugs).toContain('authentication');
    expect(slugs).toContain('rate-limits');
    expect(slugs).toContain('errors');
    expect(slugs).toContain('idempotency');
    expect(slugs).toContain('pagination');
    expect(slugs).toContain('readybank');
    expect(slugs).toContain('jd-forge');
    expect(slugs).toContain('stack-vault');
    expect(slugs).toContain('webhooks');
    expect(slugs).toContain('sso');
    expect(slugs).toContain('audit-log');
    expect(slugs).toContain('sdk-typescript');
  });

  it('every section has non-empty title + summary', () => {
    for (const s of SECTIONS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.summary.length).toBeGreaterThan(0);
    }
  });

  it('findSection returns by slug', () => {
    expect(findSection('webhooks')?.title).toBe('Webhooks');
    expect(findSection('does-not-exist')).toBe(null);
  });

  it('sectionsByCategory groups all sections', () => {
    const groups = sectionsByCategory();
    const total = groups['getting-started'].length + groups.reference.length + groups.guides.length;
    expect(total).toBe(SECTIONS.length);
  });

  it('renderSection produces non-empty HTML for every section', () => {
    for (const s of SECTIONS) {
      const html = renderSection(s);
      expect(html.length).toBeGreaterThan(40);
    }
  });
});
