import { describe, expect, it } from 'vitest';

import { buildA11yStatus, formatLabelFor } from '../src/lib/a11y-status';

describe('formatLabelFor', () => {
  it('maps mcq variants to multiple choice', () => {
    expect(formatLabelFor('mcq')).toBe('multiple choice question');
    expect(formatLabelFor('MCQ')).toBe('multiple choice question');
    expect(formatLabelFor('mcq-single')).toBe('multiple choice question');
    expect(formatLabelFor('sjt-mcq')).toBe('multiple choice question');
  });

  it('maps msq to multiple select', () => {
    expect(formatLabelFor('msq')).toBe('multiple select question');
  });

  it('maps code and sql to coding question', () => {
    expect(formatLabelFor('code')).toBe('coding question');
    expect(formatLabelFor('sql')).toBe('coding question');
    expect(formatLabelFor('python-code')).toBe('coding question');
  });

  it('maps text/essay formats to written response', () => {
    expect(formatLabelFor('text')).toBe('written response question');
    expect(formatLabelFor('essay')).toBe('written response question');
    expect(formatLabelFor('free-text')).toBe('written response question');
  });

  it('degrades unknown, empty, null, and undefined to generic question', () => {
    expect(formatLabelFor('matrix')).toBe('question');
    expect(formatLabelFor('')).toBe('question');
    expect(formatLabelFor('   ')).toBe('question');
    expect(formatLabelFor(null)).toBe('question');
    expect(formatLabelFor(undefined)).toBe('question');
  });
});

describe('buildA11yStatus', () => {
  it('builds a full status line for a fresh question', () => {
    expect(buildA11yStatus({ idx: 0, total: 10, format: 'mcq', answered: false })).toBe(
      'Question 1 of 10, multiple choice question, not yet answered.',
    );
  });

  it('reflects answered state and coding label', () => {
    expect(buildA11yStatus({ idx: 2, total: 10, format: 'sql', answered: true })).toBe(
      'Question 3 of 10, coding question, answered.',
    );
  });

  it('clamps an over-range index to the last position', () => {
    expect(buildA11yStatus({ idx: 99, total: 5, format: 'mcq', answered: false })).toBe(
      'Question 5 of 5, multiple choice question, not yet answered.',
    );
  });

  it('clamps a negative index to the first position', () => {
    expect(buildA11yStatus({ idx: -4, total: 5, format: 'mcq', answered: false })).toBe(
      'Question 1 of 5, multiple choice question, not yet answered.',
    );
  });

  it('returns empty string when total is zero or negative', () => {
    expect(buildA11yStatus({ idx: 0, total: 0, format: 'mcq', answered: false })).toBe('');
    expect(buildA11yStatus({ idx: 0, total: -3, format: 'mcq', answered: false })).toBe('');
  });

  it('returns empty string when total is non-finite', () => {
    expect(buildA11yStatus({ idx: 0, total: NaN, format: 'mcq', answered: false })).toBe('');
    expect(buildA11yStatus({ idx: 0, total: Infinity, format: 'mcq', answered: false })).toBe('');
  });

  it('floors a fractional total and index', () => {
    expect(buildA11yStatus({ idx: 1.9, total: 10.7, format: 'mcq', answered: false })).toBe(
      'Question 2 of 10, multiple choice question, not yet answered.',
    );
  });

  it('uses the generic label when format is missing', () => {
    expect(buildA11yStatus({ idx: 0, total: 3, format: null, answered: false })).toBe(
      'Question 1 of 3, question, not yet answered.',
    );
  });
});
