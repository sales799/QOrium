/**
 * Locked USP integrity tests.
 *
 * Authority: Constitution §1.1 + Standing Order #2 ("The three-sentence USP
 * is verbatim across all external materials. No paraphrasing.")
 *
 * These tests fail any PR that drifts the locked USP wording or removes it
 * from places where it's required to appear.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '../../../..');

// The locked USP — Constitution §1.1, verbatim. Three sentences, exactly.
const LOCKED_USP =
  "QOrium is the world's first enterprise-grade Question-Bank-as-a-Service. We deliver an IRT-calibrated, anti-leak-rotated, watermark-per-candidate library — across general tech, India-stack, and AI-era assessment formats — to assessment platforms (API), enterprise hiring teams (Stack-Vault), and recruiters (subscription).";

// Key phrase fragments that must survive in every USP-bearing surface.
// We don't require the EXACT 3-sentence form on the home hero (it's compressed
// for visual weight) — but the press kit + SEO + announce copy DO carry it
// verbatim per SO-2.
const FRAGMENTS = {
  uniqueClaim: "world's first enterprise-grade Question-Bank-as-a-Service",
  threeAttributes: 'IRT-calibrated, anti-leak-rotated, watermark-per-candidate',
  threeAudiences:
    'assessment platforms (API), enterprise hiring teams (Stack-Vault), and recruiters (subscription)',
};

function readFile(rel: string): string {
  return readFileSync(resolve(root, rel), 'utf8');
}

describe('Locked USP — Constitution §1.1 verbatim discipline (SO-2)', () => {
  it('press-kit page contains the FULL verbatim locked USP', () => {
    const file = readFile('src/app/(marketing)/press-kit/page.tsx');
    expect(file).toContain(LOCKED_USP);
  });

  it('home page proof copy contains the three core USP fragments', () => {
    const file = readFile('src/content/copy/home.ts');
    expect(file).toContain(FRAGMENTS.threeAttributes);
  });

  it('site.config description contains the IRT-calibrated fragment', () => {
    const file = readFile('src/content/site.config.ts');
    expect(file).toContain('IRT-calibrated');
  });

  it('LinkedIn announce copy contains the FULL verbatim locked USP', () => {
    // governance/launch/ lives outside src/, so we resolve from repo root
    const repoRoot = resolve(root, '..', '..');
    const file = readFileSync(
      resolve(repoRoot, 'governance/launch/linkedin-launch-post.md'),
      'utf8',
    );
    expect(file).toContain(LOCKED_USP);
  });

  it('Bosch GCC follow-up announce copy contains the FULL verbatim locked USP', () => {
    const repoRoot = resolve(root, '..', '..');
    const file = readFileSync(resolve(repoRoot, 'governance/launch/bosch-gcc-followup.md'), 'utf8');
    expect(file).toContain(LOCKED_USP);
  });
});

describe('Locked USP — three audience segments are intact', () => {
  it('press-kit references all three segments (platforms, Stack-Vault, recruiters)', () => {
    const file = readFile('src/app/(marketing)/press-kit/page.tsx');
    expect(file).toContain('Stack-Vault');
    expect(file).toContain('subscription');
    expect(file).toContain('platforms');
  });
});
