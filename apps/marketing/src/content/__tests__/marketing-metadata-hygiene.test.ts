import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const appRoot = resolve(__dirname, '../../app');

const criticalStaticPages = [
  ['/', '(marketing)/page.tsx'],
  ['/pricing', '(marketing)/pricing/page.tsx'],
  ['/platform', '(marketing)/platform/page.tsx'],
  ['/platform/api', '(marketing)/platform/api/page.tsx'],
  ['/library', '(marketing)/library/page.tsx'],
  ['/resources', '(marketing)/resources/page.tsx'],
  ['/blog', '(marketing)/blog/page.tsx'],
  ['/try/jd-forge', '(marketing)/try/jd-forge/page.tsx'],
  ['/try/graded-answer', '(marketing)/try/graded-answer/page.tsx'],
  ['/security', '(marketing)/security/page.tsx'],
  ['/trust', '(marketing)/trust/page.tsx'],
  ['/privacy', '(legal)/privacy/page.tsx'],
  ['/terms', '(legal)/terms/page.tsx'],
  ['/dpa', '(legal)/dpa/page.tsx'],
] as const;

function readPage(relativePath: string) {
  return readFileSync(resolve(appRoot, relativePath), 'utf8');
}

describe('critical static page metadata hygiene', () => {
  for (const [route, file] of criticalStaticPages) {
    it(`${route} declares title, description, and canonical metadata`, () => {
      const source = readPage(file);

      if (source.includes('getTrustPageMeta(page)')) {
        expect(source).toMatch(/const page = trustPages\./);
        expect(source).toMatch(/WebPageJsonLd/);
        return;
      }

      expect(source).toMatch(/title:/);
      expect(source).toMatch(/description:/);
      expect(source).toContain(`canonical: '${route}'`);
    });
  }

  it('does not ship the old legal pre-launch notice', () => {
    const legalShell = readFileSync(resolve(appRoot, '../components/site/LegalShell.tsx'), 'utf8');

    expect(legalShell).not.toMatch(/Pre-launch:/i);
    expect(legalShell).not.toMatch(/before public launch/i);
    expect(legalShell).toMatch(/Legal review status:/);
  });
});
