import { describe, expect, it } from 'vitest';

import { nextRovingIndex, rovingTabIndex } from '../src/lib/option-roving';

describe('nextRovingIndex', () => {
  it('ArrowDown / ArrowRight move to the next option', () => {
    expect(nextRovingIndex(0, 4, 'ArrowDown')).toBe(1);
    expect(nextRovingIndex(1, 4, 'ArrowRight')).toBe(2);
  });

  it('ArrowUp / ArrowLeft move to the previous option', () => {
    expect(nextRovingIndex(2, 4, 'ArrowUp')).toBe(1);
    expect(nextRovingIndex(2, 4, 'ArrowLeft')).toBe(1);
  });

  it('wraps forward from the last option to the first', () => {
    expect(nextRovingIndex(3, 4, 'ArrowDown')).toBe(0);
  });

  it('wraps backward from the first option to the last', () => {
    expect(nextRovingIndex(0, 4, 'ArrowUp')).toBe(3);
  });

  it('Home jumps to the first, End jumps to the last', () => {
    expect(nextRovingIndex(2, 5, 'Home')).toBe(0);
    expect(nextRovingIndex(2, 5, 'End')).toBe(4);
  });

  it('returns null for non-navigation keys (caller leaves default behaviour)', () => {
    for (const key of ['Tab', 'Enter', ' ', 'a', 'Escape', 'PageDown']) {
      expect(nextRovingIndex(0, 4, key)).toBeNull();
    }
  });

  it('returns null for an empty / invalid option count', () => {
    expect(nextRovingIndex(0, 0, 'ArrowDown')).toBeNull();
    expect(nextRovingIndex(0, -3, 'ArrowDown')).toBeNull();
    expect(nextRovingIndex(0, Number.NaN, 'ArrowDown')).toBeNull();
    expect(nextRovingIndex(0, Infinity, 'ArrowDown')).toBeNull();
  });

  it('returns null for a non-string key', () => {
    expect(nextRovingIndex(0, 4, undefined)).toBeNull();
    expect(nextRovingIndex(0, 4, 40)).toBeNull();
    expect(nextRovingIndex(0, 4, null)).toBeNull();
  });

  it('clamps an out-of-range / non-finite current index before moving', () => {
    // current past the end -> clamped to last (3), ArrowDown wraps to 0
    expect(nextRovingIndex(99, 4, 'ArrowDown')).toBe(0);
    // negative current -> clamped to 0, ArrowUp wraps to last (3)
    expect(nextRovingIndex(-5, 4, 'ArrowUp')).toBe(3);
    // NaN current -> treated as 0, ArrowDown -> 1
    expect(nextRovingIndex(Number.NaN, 4, 'ArrowDown')).toBe(1);
  });

  it('truncates a fractional current index', () => {
    expect(nextRovingIndex(1.9, 4, 'ArrowDown')).toBe(2);
  });

  it('single-option group: every arrow stays on index 0', () => {
    expect(nextRovingIndex(0, 1, 'ArrowDown')).toBe(0);
    expect(nextRovingIndex(0, 1, 'ArrowUp')).toBe(0);
    expect(nextRovingIndex(0, 1, 'End')).toBe(0);
  });
});

describe('rovingTabIndex', () => {
  it('puts the single tab stop on the selected option', () => {
    expect(rovingTabIndex(2, 2, 4)).toBe(0);
    expect(rovingTabIndex(0, 2, 4)).toBe(-1);
    expect(rovingTabIndex(3, 2, 4)).toBe(-1);
  });

  it('falls back to the first option when nothing is selected', () => {
    expect(rovingTabIndex(0, null, 4)).toBe(0);
    expect(rovingTabIndex(0, undefined, 4)).toBe(0);
    expect(rovingTabIndex(1, null, 4)).toBe(-1);
  });

  it('falls back to the first option when the selection is out of range', () => {
    expect(rovingTabIndex(0, 99, 4)).toBe(0);
    expect(rovingTabIndex(0, -1, 4)).toBe(0);
    expect(rovingTabIndex(2, 99, 4)).toBe(-1);
  });

  it('returns -1 for an out-of-range or invalid option index', () => {
    expect(rovingTabIndex(9, 0, 4)).toBe(-1);
    expect(rovingTabIndex(-1, 0, 4)).toBe(-1);
    expect(rovingTabIndex(Number.NaN, 0, 4)).toBe(-1);
  });

  it('returns -1 for an empty / invalid group', () => {
    expect(rovingTabIndex(0, 0, 0)).toBe(-1);
    expect(rovingTabIndex(0, 0, -2)).toBe(-1);
    expect(rovingTabIndex(0, 0, Number.NaN)).toBe(-1);
  });

  it('exposes exactly one tab stop across a whole group', () => {
    const total = 5;
    const selected = 3;
    const stops = Array.from({ length: total }, (_, i) =>
      rovingTabIndex(i, selected, total),
    ).filter((t) => t === 0);
    expect(stops).toHaveLength(1);
  });

  it('exposes exactly one tab stop when nothing is selected', () => {
    const total = 4;
    const stops = Array.from({ length: total }, (_, i) => rovingTabIndex(i, null, total)).filter(
      (t) => t === 0,
    );
    expect(stops).toHaveLength(1);
  });
});
