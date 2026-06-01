/**
 * "No [TBD] markers in shipped marketing copy" — SO-3 + SO-24 discipline.
 *
 * All shipped copy must be free of [TBD] / [TBA] / [Placeholder] /
 * "coming soon" / lorem ipsum strings. Evidence-gated proof renders nothing
 * until a flag and backing evidence exist.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const copyRoot = resolve(__dirname, '..');

const FORBIDDEN_PATTERNS = [
  /\[TBD\]/,
  /\[TBA\]/,
  /\[Placeholder\]/,
  /coming soon/i,
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

describe('Shipped proof surfaces — no visible placeholders', () => {
  it('customers page contains no incomplete proof markers', () => {
    const content = readFileSync(
      resolve(copyRoot, '../../app/(marketing)/customers/page.tsx'),
      'utf8',
    );

    for (const pattern of FORBIDDEN_PATTERNS) {
      expect(content).not.toMatch(pattern);
    }
  });
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
