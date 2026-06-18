import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { siteConfig } from '@/content/site.config';

function toPath(url: string) {
  return url.replace(siteConfig.url, '') || '/';
}

describe('marketing sitemap and robots', () => {
  it('indexes only canonical solution landing pages', () => {
    const paths = sitemap().map((entry) => toPath(entry.url));

    expect(paths).toContain('/solutions/assessment-platforms');
    expect(paths).toContain('/solutions/enterprises-gcc');
    expect(paths).toContain('/solutions/staffing-firms');
    expect(paths).not.toContain('/solutions/platforms');
    expect(paths).not.toContain('/solutions/enterprises');
    expect(paths).not.toContain('/solutions/staffing');
  });

  it('does not emit duplicate sitemap URLs', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('advertises all public sitemap partitions in robots', () => {
    const rules = robots();

    expect(rules.sitemap).toEqual([
      `${siteConfig.url}/sitemap.xml`,
      `${siteConfig.url}/sitemap-library.xml`,
      `${siteConfig.url}/sitemap-roles.xml`,
      `${siteConfig.url}/sitemap-stacks.xml`,
      `${siteConfig.url}/sitemap-compare.xml`,
    ]);
  });
});
