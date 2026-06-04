import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync('src/app/globals.css', 'utf8');
const headerSource = readFileSync('src/components/site/Header.tsx', 'utf8');

describe('Phase 1 design system shell', () => {
  it('defines Tailwind v4 tokens for the A+B+C surface zones', () => {
    for (const token of [
      '--color-zone-shell-bg',
      '--color-zone-shell-panel',
      '--color-zone-product-bg',
      '--color-zone-product-panel',
      '--color-zone-india-bg',
      '--color-zone-india-panel',
      '--zone-shell-bg',
      '--zone-product-bg',
      '--zone-india-bg',
    ]) {
      expect(globalsCss).toContain(token);
    }
  });

  it('exposes shell, product, India, and evidence-ledger utilities', () => {
    for (const utility of [
      '.surface-shell',
      '.surface-product',
      '.surface-india',
      '.zone-shell',
      '.zone-product',
      '.zone-india',
      '.evidence-ledger',
    ]) {
      expect(globalsCss).toContain(utility);
    }
  });

  it('keeps the mega-menu keyboard/mobile contract visible in source', () => {
    expect(headerSource).toContain('delayDuration={150}');
    expect(headerSource).toContain('<Accordion type="multiple"');
    expect(headerSource).toContain(
      '<SheetTitle className="sr-only">Qorium navigation</SheetTitle>',
    );
    expect(headerSource).toContain('aria-label="Primary"');
  });
});
