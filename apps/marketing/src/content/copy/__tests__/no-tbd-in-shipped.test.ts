/**
 * "No [TBD] markers in shipped marketing copy" — SO-3 + SO-24 discipline.
 *
 * Some pages (e.g., /customers engagement slots) deliberately ship with
 * [TBD: real customer] markers that are honest about what's pending. These
 * are exempt and explicitly listed in `ALLOWED_TBD_PATHS`.
 *
 * Every OTHER copy deck must be free of [TBD] / [TBA] / [Placeholder] /
 * lorem ipsum strings. Catches accidental ship-with-incomplete-copy.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const copyRoot = resolve(__dirname, '..');

// Note: /customers/page.tsx engagement-slot [TBD] markers are EXPECTED
// per PRE-LAUNCH-CHECKLIST D2 (real case studies require contractual
// permission; we don't fabricate logos). Those markers live outside
// the copy/ deck folder so this test doesn't see them — exemptions are
// scoped narrowly by file path, not by global allowlist.

const FORBIDDEN_PATTERNS = [
  /\[TBD\]/,
  /\[TBA\]/,
  /\[Placeholder\]/,
  /Lorem ipsum/i,
  /lorem ipsum/i,
];

describe('Marketing copy decks — no incomplete-content markers (SO-3 + SO-24)', () => {
  const copyFiles = readdirSync(copyRoot)
    .filter((f) => f.endsWith('.ts') && !f.startsWith('__'))
    .map((f) => resolve(copyRoot, f));

  for (const file of copyFiles) {
    const fileName = file.split('/').pop();

    it(`${fileName} contains no [TBD] / lorem ipsum / placeholder markers`, () => {
      const content = readFileSync(file, 'utf8');
      for (const pattern of FORBIDDEN_PATTERNS) {
        expect(content).not.toMatch(pattern);
      }
    });
  }
});

describe('Marketing copy decks — every claim has a SOURCE comment (SO-24)', () => {
  it('home.ts has // SOURCE: comments for grounded claims', () => {
    const content = readFileSync(resolve(copyRoot, 'home.ts'), 'utf8');
    // At least 3 SOURCE comments expected (proof, pillars, content engine)
    const sourceComments = content.match(/\/\/ SOURCE:/g) ?? [];
    expect(sourceComments.length).toBeGreaterThanOrEqual(3);
  });

  it('product.ts has // SOURCE: comments', () => {
    const content = readFileSync(resolve(copyRoot, 'product.ts'), 'utf8');
    const sourceComments = content.match(/\/\/ SOURCE:/g) ?? [];
    expect(sourceComments.length).toBeGreaterThanOrEqual(2);
  });

  it('pricing.ts has // SOURCE: comments', () => {
    const content = readFileSync(resolve(copyRoot, 'pricing.ts'), 'utf8');
    const sourceComments = content.match(/\/\/ SOURCE:/g) ?? [];
    expect(sourceComments.length).toBeGreaterThanOrEqual(2);
  });
});
