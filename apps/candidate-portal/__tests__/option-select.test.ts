import { describe, it, expect } from 'vitest';
import { isExplicitSelectKey, resolveSelectIndex, focusRing } from '../src/lib/option-select';

const RING = '0 0 0 3px rgba(13, 148, 136, 0.45)';

describe('isExplicitSelectKey', () => {
  it('selects on the modern space key', () => {
    expect(isExplicitSelectKey(' ')).toBe(true);
  });

  it('selects on the legacy Spacebar value', () => {
    expect(isExplicitSelectKey('Spacebar')).toBe(true);
  });

  it('selects on Enter (native radios do not)', () => {
    expect(isExplicitSelectKey('Enter')).toBe(true);
  });

  it('ignores navigation and other keys', () => {
    for (const k of ['ArrowDown', 'ArrowUp', 'Home', 'End', 'Tab', 'a', 'Escape']) {
      expect(isExplicitSelectKey(k)).toBe(false);
    }
  });

  it('ignores non-string keys', () => {
    for (const k of [undefined, null, 32, {}, []]) {
      expect(isExplicitSelectKey(k)).toBe(false);
    }
  });
});

describe('resolveSelectIndex', () => {
  it('returns the focused index when in range', () => {
    expect(resolveSelectIndex(0, 4)).toBe(0);
    expect(resolveSelectIndex(3, 4)).toBe(3);
  });

  it('returns null when nothing is focused (-1)', () => {
    expect(resolveSelectIndex(-1, 4)).toBeNull();
  });

  it('returns null when the index is out of range', () => {
    expect(resolveSelectIndex(4, 4)).toBeNull();
    expect(resolveSelectIndex(99, 4)).toBeNull();
  });

  it('returns null for an empty or invalid group', () => {
    expect(resolveSelectIndex(0, 0)).toBeNull();
    expect(resolveSelectIndex(0, -2)).toBeNull();
    expect(resolveSelectIndex(0, null)).toBeNull();
  });

  it('returns null for a non-finite/non-number focused index', () => {
    expect(resolveSelectIndex(NaN, 4)).toBeNull();
    expect(resolveSelectIndex(Infinity, 4)).toBeNull();
    expect(resolveSelectIndex(undefined, 4)).toBeNull();
    expect(resolveSelectIndex('2', 4)).toBeNull();
  });

  it('truncates a fractional focused index into range', () => {
    expect(resolveSelectIndex(2.9, 4)).toBe(2);
  });
});

describe('focusRing', () => {
  it('puts a ring on the focused option only', () => {
    expect(focusRing(1, 1)).toBe(RING);
    expect(focusRing(1, 0)).toBe('none');
    expect(focusRing(1, 2)).toBe('none');
  });

  it('returns none for every option when nothing is focused', () => {
    for (const i of [0, 1, 2]) {
      expect(focusRing(null, i)).toBe('none');
      expect(focusRing(-1, i)).toBe('none');
    }
  });

  it('returns none for non-finite focus/option indices', () => {
    expect(focusRing(NaN, 0)).toBe('none');
    expect(focusRing(0, NaN)).toBe('none');
    expect(focusRing(undefined, 0)).toBe('none');
  });

  it('matches a truncated fractional focus index', () => {
    expect(focusRing(2.4, 2)).toBe(RING);
  });
});
