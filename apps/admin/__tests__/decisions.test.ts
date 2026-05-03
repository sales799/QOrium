import { describe, expect, it } from 'vitest';
import {
  isReviewDecision,
  isReviewableStatus,
  nextStatusFor,
  validateDecisionInput,
} from '../src/server/decisions';

describe('nextStatusFor', () => {
  it.each([
    ['accept', 'calibrating'],
    ['edit', 'draft'],
    ['reject', 'deprecated'],
  ] as const)('maps %s → %s', (decision, next) => {
    expect(nextStatusFor(decision)).toBe(next);
  });
});

describe('isReviewableStatus', () => {
  it('returns true only for sme_review', () => {
    expect(isReviewableStatus('sme_review')).toBe(true);
    expect(isReviewableStatus('draft')).toBe(false);
    expect(isReviewableStatus('calibrating')).toBe(false);
    expect(isReviewableStatus('released')).toBe(false);
  });
});

describe('isReviewDecision', () => {
  it.each([
    ['accept', true],
    ['edit', true],
    ['reject', true],
    ['delete', false],
    ['', false],
    [null, false],
    [undefined, false],
    [42, false],
  ])('classifies %s', (input, expected) => {
    expect(isReviewDecision(input)).toBe(expected);
  });
});

describe('validateDecisionInput', () => {
  it('accepts a minimal valid accept decision', () => {
    const result = validateDecisionInput({
      decision: 'accept',
      reviewerEmail: 'sme@talpro.in',
      notes: undefined,
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({ decision: 'accept', reviewerEmail: 'sme@talpro.in' });
    }
  });

  it('accepts a reject with notes and lower-cases the reviewer email', () => {
    const result = validateDecisionInput({
      decision: 'reject',
      reviewerEmail: '  Bob@Talpro.in ',
      notes: '  duplicates Q123 ',
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value).toEqual({
        decision: 'reject',
        reviewerEmail: 'bob@talpro.in',
        notes: 'duplicates Q123',
      });
    }
  });

  it('requires notes when decision is edit', () => {
    const result = validateDecisionInput({
      decision: 'edit',
      reviewerEmail: 'sme@talpro.in',
      notes: '',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === 'notes')).toBe(true);
    }
  });

  it('accepts edit when notes are provided', () => {
    const result = validateDecisionInput({
      decision: 'edit',
      reviewerEmail: 'sme@talpro.in',
      notes: 'Distractor (b) is too close to the right answer; broaden the language.',
    });
    expect(result.ok).toBe(true);
  });

  it('rejects unknown decision values', () => {
    const result = validateDecisionInput({
      decision: 'maybe',
      reviewerEmail: 'sme@talpro.in',
      notes: undefined,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === 'decision')).toBe(true);
    }
  });

  it('rejects missing reviewer email', () => {
    const result = validateDecisionInput({
      decision: 'accept',
      reviewerEmail: '',
      notes: undefined,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === 'reviewerEmail')).toBe(true);
    }
  });

  it('rejects notes longer than 2000 chars', () => {
    const result = validateDecisionInput({
      decision: 'accept',
      reviewerEmail: 'sme@talpro.in',
      notes: 'x'.repeat(2001),
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === 'notes' && /max 2000/.test(e.message))).toBe(
        true,
      );
    }
  });

  it('treats whitespace-only notes as absent (and so rejects edit)', () => {
    const editResult = validateDecisionInput({
      decision: 'edit',
      reviewerEmail: 'sme@talpro.in',
      notes: '   \n  ',
    });
    expect(editResult.ok).toBe(false);

    const acceptResult = validateDecisionInput({
      decision: 'accept',
      reviewerEmail: 'sme@talpro.in',
      notes: '   ',
    });
    expect(acceptResult.ok).toBe(true);
    if (acceptResult.ok) {
      expect(acceptResult.value.notes).toBeUndefined();
    }
  });

  it('rejects non-string notes', () => {
    const result = validateDecisionInput({
      decision: 'accept',
      reviewerEmail: 'sme@talpro.in',
      notes: 42,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errors.some((e) => e.field === 'notes')).toBe(true);
    }
  });
});
