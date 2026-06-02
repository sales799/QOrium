import { readFileSync } from 'node:fs';

import { describe, expect, it } from 'vitest';

const globalsCss = readFileSync('src/app/globals.css', 'utf8');
const rootLayout = readFileSync('src/app/layout.tsx', 'utf8');
const chatbotWidget = readFileSync('src/components/chatbot/ChatbotWidget.tsx', 'utf8');
const productPage = readFileSync('src/app/(marketing)/product/page.tsx', 'utf8');

describe('phase 1 design-system contract', () => {
  it('loads non-system primary fonts through Next font variables', () => {
    expect(rootLayout).toContain('IBM_Plex_Sans');
    expect(rootLayout).toContain('IBM_Plex_Mono');
    expect(rootLayout).toContain('qoriumSans.variable');
    expect(rootLayout).toContain('qoriumMono.variable');
    expect(globalsCss).not.toContain('Arial');
    expect(globalsCss).not.toContain('Roboto');
  });

  it('exposes tokenized A+B+C surface zones', () => {
    for (const token of [
      '--zone-shell-bg',
      '--zone-shell-panel',
      '--zone-shell-accent',
      '--zone-product-bg',
      '--zone-product-panel',
      '--zone-product-accent',
      '--zone-india-bg',
      '--zone-india-panel',
      '--zone-india-accent',
    ]) {
      expect(globalsCss).toContain(token);
    }
  });

  it('keeps the phase 1 chrome accessible', () => {
    expect(chatbotWidget).toContain('aria-label="Ask QOrium chatbot"');
    expect(productPage).toContain('scope="col"');
    expect(productPage).toContain('scope="row"');
  });
});
