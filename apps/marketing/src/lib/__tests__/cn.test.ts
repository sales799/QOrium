import { describe, it, expect } from 'vitest';
import { cn } from '../cn';

describe('cn utility — Tailwind class merging', () => {
  it('joins simple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('drops falsy values', () => {
    expect(cn('foo', false, null, undefined, 'bar')).toBe('foo bar');
  });

  it('handles conditional via clsx semantics', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
  });

  it('merges Tailwind conflicts (last wins)', () => {
    // tailwind-merge collapses px-4 + px-6 → px-6
    expect(cn('px-4', 'px-6')).toBe('px-6');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('passes arrays through', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar');
  });
});
