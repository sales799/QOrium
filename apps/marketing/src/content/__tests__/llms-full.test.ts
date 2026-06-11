import { describe, it, expect } from 'vitest';
import { buildLlmsFull } from '@/content/llms-full';

describe('llms-full AEO corpus', () => {
  const body = buildLlmsFull();

  it('includes the canonical origin and core sections', () => {
    expect(body).toContain('qorium.online');
    expect(body).toContain('## One-line answer');
    expect(body).toContain('## Products');
    expect(body).toContain('## Core pages');
    expect(body).toContain('## AI assistant guidance');
  });

  it('states public pricing', () => {
    expect(body).toContain('4,999');
    expect(body).toContain('19,999');
    expect(body).toContain('Customer-Zero');
  });

  it('never makes banned certification or calibration over-claims', () => {
    const lower = body.toLowerCase();
    expect(lower).not.toContain('soc 2 certified');
    expect(lower).not.toContain('iso 27001 certified');
    expect(lower).not.toContain('empirically calibrated');
    expect(lower).not.toContain('bias audit passed');
    expect(lower).not.toContain('bias-audit passed');
  });
});
