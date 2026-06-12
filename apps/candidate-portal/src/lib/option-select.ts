// N11 candidate-UX (WCAG AA, SC 2.1.1 Keyboard / SC 2.4.7 Focus Visible /
// SC 4.1.2 Name-Role-Value): pure presenters that finish the multiple-choice
// option list's keyboard contract. Run-43/44 made the option list a labelled
// role="radiogroup" with per-option letter handles and roving-tabindex +
// arrow-key navigation (which also selects). Two gaps remained for a complete
// radiogroup contract: (1) a NATIVE radio selects on Space but NOT on Enter, so
// a keyboard user who Tabs onto an option and presses Enter expects it to be
// chosen; (2) there was no VISIBLE focus affordance distinct from the selected
// state, so an arrow/Tab user could not see which option currently holds focus.
//
// These helpers compute both, without any React, DOM, or fetch, so the keyboard
// + focus maths is unit-testable in CI:
//
//   - isExplicitSelectKey(key): true for the keys that should explicitly select
//     the option that currently holds focus (Enter, Space). The caller pairs
//     this with the focused option index to select it and preventDefault.
//   - resolveSelectIndex(focusedIndex, total): validate the focused option
//     index against the option count, returning the index to select or null
//     (nothing focused / out of range / empty group) so the caller is a no-op.
//   - focusRing(focusedIndex, optionIndex): the box-shadow string for one
//     option's focus affordance -- a ring on the focused option, 'none' on the
//     rest. Inline styles cannot express :focus-visible, so the runner tracks
//     focus in state and asks this presenter for the ring per option.
//
// Leak-safe by construction: they only ever express the option's POSITION (an
// index, the choice count) or a key NAME. They never carry the option text, the
// question prompt, a score, or a correctness flag.

function intOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

/** Keys that explicitly select the focused option in an ARIA radiogroup. */
const SELECT_KEYS = new Set([' ', 'Spacebar', 'Enter']);

/**
 * Whether a pressed key should explicitly select the option that currently
 * holds focus. `' '` is the modern `KeyboardEvent.key` for the spacebar;
 * `'Spacebar'` is the legacy value still emitted by some browsers. Enter is
 * included because a native radio input does NOT select on Enter, yet keyboard
 * users reasonably expect it to. Any other key (or a non-string) returns false
 * so the caller leaves default browser behaviour untouched.
 */
export function isExplicitSelectKey(key: unknown): boolean {
  if (typeof key !== 'string') return false;
  return SELECT_KEYS.has(key);
}

/**
 * Resolve the option index an explicit-select key should choose.
 *
 * Returns the focused option index when it is a valid, in-range position within
 * a non-empty group; otherwise `null` (nothing focused, out of range, or an
 * empty/invalid group) so the caller performs no selection and does not
 * preventDefault.
 */
export function resolveSelectIndex(focusedIndex: unknown, total: unknown): number | null {
  const n = intOrNull(total);
  if (n === null || n <= 0) return null;
  const idx = intOrNull(focusedIndex);
  if (idx === null || idx < 0 || idx >= n) return null;
  return idx;
}

/** Box-shadow ring used as the keyboard focus affordance. */
const FOCUS_RING = '0 0 0 3px rgba(13, 148, 136, 0.45)';

/**
 * The focus affordance (a box-shadow string) for a single option: the ring on
 * the option that currently holds focus, `'none'` on every other option. The
 * focused index is validated, so a null/out-of-range focus state (nothing
 * focused) yields `'none'` for all options.
 */
export function focusRing(focusedIndex: unknown, optionIndex: unknown): string {
  const focused = intOrNull(focusedIndex);
  const idx = intOrNull(optionIndex);
  if (focused === null || idx === null || idx < 0) return 'none';
  return focused === idx ? FOCUS_RING : 'none';
}
