import { describe, expect, it } from 'vitest';
import { escapeHtml, formatGradedDate, renderProofPage, scoreBand } from '../src/lib/proof-page.js';

describe('proof-page scoreBand', () => {
  it('maps score percentages to bands', () => {
    expect(scoreBand(null)).toBe('unscored');
    expect(scoreBand(95)).toBe('exceptional');
    expect(scoreBand(80)).toBe('strong');
    expect(scoreBand(65)).toBe('proficient');
    expect(scoreBand(50)).toBe('developing');
    expect(scoreBand(10)).toBe('foundational');
  });
});

describe('proof-page escapeHtml', () => {
  it('escapes all five HTML-significant characters', () => {
    expect(escapeHtml(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;');
  });
});

describe('proof-page formatGradedDate', () => {
  it('extracts a stable YYYY-MM-DD from an ISO timestamp', () => {
    expect(formatGradedDate('2026-06-11T13:39:00.000Z')).toBe('2026-06-11');
  });
  it('returns null for null or unparseable input', () => {
    expect(formatGradedDate(null)).toBeNull();
    expect(formatGradedDate('not-a-date')).toBeNull();
  });
});

describe('proof-page renderProofPage', () => {
  it('renders a verified card with issuer, assessment, band, score and date', () => {
    const html = renderProofPage({
      kind: 'verified',
      code: 'abc123',
      issuer: 'Talpro India',
      assessment: 'Senior React Engineer',
      scorePct: 82,
      scoreBand: 'strong',
      passed: true,
      gradedAt: '2026-06-11T13:39:00.000Z',
    });
    expect(html).toContain('<!doctype html>');
    expect(html).toContain('Verified Proof of Skill');
    expect(html).toContain('Talpro India');
    expect(html).toContain('Senior React Engineer');
    expect(html).toContain('strong');
    expect(html).toContain('82%');
    expect(html).toContain('2026-06-11');
    expect(html).toContain('Met the bar');
    expect(html).toContain('abc123');
  });

  it('escapes injected markup in issuer and assessment (no raw script tag)', () => {
    const html = renderProofPage({
      kind: 'verified',
      code: 'c',
      issuer: '<script>alert(1)</script>',
      assessment: '<img src=x onerror=1>',
      scorePct: 70,
      scoreBand: 'proficient',
      passed: false,
      gradedAt: null,
    });
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).not.toContain('<img src=x onerror=1>');
    expect(html).toContain('&lt;script&gt;');
    expect(html).toContain('Below the bar');
  });

  it('omits the score row when score is unknown', () => {
    const html = renderProofPage({
      kind: 'verified',
      code: 'c',
      issuer: 'X',
      assessment: 'Y',
      scorePct: null,
      scoreBand: 'unscored',
      passed: null,
      gradedAt: null,
    });
    expect(html).not.toMatch(/Score<\/span>/);
    // neutral outcome dash, not pass/fail wording
    expect(html).not.toContain('Met the bar');
    expect(html).not.toContain('Below the bar');
  });

  it('renders a generic invalid card that leaks no record fields', () => {
    const html = renderProofPage({ kind: 'invalid' });
    expect(html).toContain('Could not verify');
    expect(html).toContain('could not be verified');
    expect(html).not.toContain('Verified Proof of Skill');
  });

  it('renders an unconfigured card', () => {
    const html = renderProofPage({ kind: 'unconfigured' });
    expect(html).toContain('not enabled here');
  });
});
