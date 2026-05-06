import { describe, expect, it } from 'vitest';
import { classifyEvidence, compositeSimilarity } from '../src/severity';

describe('classifyEvidence', () => {
  it('cosine > 0.92 AND lexical > 0.70 → critical, persist, status=detected', () => {
    const c = classifyEvidence({ cosineSimilarity: 0.95, lexicalOverlap: 0.85 });
    expect(c.severity).toBe('critical');
    expect(c.shouldPersist).toBe(true);
    expect(c.status).toBe('detected');
  });

  it('cosine 0.85–0.92 AND lexical > 0.70 → high, under_review', () => {
    const c = classifyEvidence({ cosineSimilarity: 0.88, lexicalOverlap: 0.75 });
    expect(c.severity).toBe('high');
    expect(c.shouldPersist).toBe(true);
    expect(c.status).toBe('under_review');
  });

  it('cosine 0.85–0.92 AND lexical 0.60–0.70 → medium, under_review', () => {
    const c = classifyEvidence({ cosineSimilarity: 0.87, lexicalOverlap: 0.65 });
    expect(c.severity).toBe('medium');
    expect(c.shouldPersist).toBe(true);
    expect(c.status).toBe('under_review');
  });

  it('lexical > 0.70 standalone (cosine < 0.85) → medium, under_review', () => {
    const c = classifyEvidence({ cosineSimilarity: 0, lexicalOverlap: 0.78 });
    expect(c.severity).toBe('medium');
    expect(c.shouldPersist).toBe(true);
  });

  it('below dismissal floor → none, do not persist', () => {
    const c = classifyEvidence({ cosineSimilarity: 0, lexicalOverlap: 0.4 });
    expect(c.severity).toBe('none');
    expect(c.shouldPersist).toBe(false);
  });

  it('exact threshold boundaries are deterministic', () => {
    expect(classifyEvidence({ cosineSimilarity: 0.85, lexicalOverlap: 0.7 }).severity).toBe(
      'medium',
    );
    expect(classifyEvidence({ cosineSimilarity: 0.92, lexicalOverlap: 0.7 }).severity).toBe(
      'medium',
    );
    expect(classifyEvidence({ cosineSimilarity: 0.93, lexicalOverlap: 0.71 }).severity).toBe(
      'critical',
    );
  });
});

describe('compositeSimilarity', () => {
  it('falls back to lexical when cosine channel is unwired', () => {
    expect(compositeSimilarity({ cosineSimilarity: 0, lexicalOverlap: 0.62 })).toBeCloseTo(0.62);
  });

  it('weights cosine more than lexical when both are present', () => {
    const blend = compositeSimilarity({ cosineSimilarity: 0.9, lexicalOverlap: 0.5 });
    expect(blend).toBeCloseTo(0.9 * 0.6 + 0.5 * 0.4, 5);
    expect(blend).toBeGreaterThan(0.5);
    expect(blend).toBeLessThan(0.9);
  });
});
