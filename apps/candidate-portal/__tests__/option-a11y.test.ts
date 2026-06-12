import { describe, expect, it } from 'vitest';

import { buildRadiogroupLabel, optionLetter, optionPrefix } from '../src/lib/option-a11y';

describe('optionLetter', () => {
  it('maps the first 26 indices to A..Z', () => {
    expect(optionLetter(0)).toBe('A');
    expect(optionLetter(1)).toBe('B');
    expect(optionLetter(25)).toBe('Z');
  });

  it('continues with spreadsheet-style double letters past Z', () => {
    expect(optionLetter(26)).toBe('AA');
    expect(optionLetter(27)).toBe('AB');
    expect(optionLetter(51)).toBe('AZ');
    expect(optionLetter(52)).toBe('BA');
  });

  it('truncates a fractional index', () => {
    expect(optionLetter(2.9)).toBe('C');
  });

  it('returns empty string for negative, non-finite, or non-number indices', () => {
    expect(optionLetter(-1)).toBe('');
    expect(optionLetter(Number.NaN)).toBe('');
    expect(optionLetter(Number.POSITIVE_INFINITY)).toBe('');
    expect(optionLetter('2' as unknown)).toBe('');
    expect(optionLetter(null)).toBe('');
    expect(optionLetter(undefined)).toBe('');
  });
});

describe('buildRadiogroupLabel', () => {
  it('names the group with a pluralised choice count', () => {
    expect(buildRadiogroupLabel(4)).toBe('Answer options: 4 choices, select one.');
  });

  it('uses the singular for exactly one choice', () => {
    expect(buildRadiogroupLabel(1)).toBe('Answer options: 1 choice, select one.');
  });

  it('degrades to a generic label for zero, negative, or non-finite totals', () => {
    expect(buildRadiogroupLabel(0)).toBe('Answer options, select one.');
    expect(buildRadiogroupLabel(-3)).toBe('Answer options, select one.');
    expect(buildRadiogroupLabel(Number.NaN)).toBe('Answer options, select one.');
    expect(buildRadiogroupLabel(null)).toBe('Answer options, select one.');
    expect(buildRadiogroupLabel(undefined)).toBe('Answer options, select one.');
  });

  it('truncates a fractional count', () => {
    expect(buildRadiogroupLabel(3.7)).toBe('Answer options: 3 choices, select one.');
  });
});

describe('optionPrefix', () => {
  it('appends a period to the option letter', () => {
    expect(optionPrefix(0)).toBe('A.');
    expect(optionPrefix(26)).toBe('AA.');
  });

  it('returns empty string for an invalid index (no dangling separator)', () => {
    expect(optionPrefix(-1)).toBe('');
    expect(optionPrefix(Number.NaN)).toBe('');
    expect(optionPrefix(null)).toBe('');
  });

  it('never carries content -- only the positional letter', () => {
    // Sanity: the prefix is purely a function of position, so identical indices
    // always produce identical output regardless of any option payload.
    expect(optionPrefix(2)).toBe(optionPrefix(2));
    expect(optionPrefix(2)).toBe('C.');
  });
});
