// N11 candidate-UX (WCAG AA, SC 2.1.1 Keyboard / SC 4.1.2 Name-Role-Value):
// pure presenters that give the multiple-choice option list the standard ARIA
// radiogroup KEYBOARD behaviour. Run-43 made the option list a labelled
// role="radiogroup" with per-option letter handles; a radiogroup is only
// correct if exactly ONE option is in the tab sequence and the arrow keys move
// (and select) between options. These helpers compute both, without any React,
// DOM, or fetch, so the navigation maths is unit-testable in CI.
//
//   - nextRovingIndex(current, total, key): given the active option, the option
//     count, and a pressed key, return the option index focus should move to
//     (ArrowDown/Right -> next with wrap, ArrowUp/Left -> previous with wrap,
//     Home -> first, End -> last), or null for any key that should not move
//     focus (so the caller leaves the default browser behaviour untouched).
//   - rovingTabIndex(optionIndex, selectedIndex, total): the tabIndex for one
//     option so the group exposes a single tab stop (0 on the tabbable option,
//     -1 on the rest) -- the selected option if one is chosen, else the first.
//
// Leak-safe by construction: they only ever express the option's POSITION (an
// index, the choice count, the key name). They never carry the option text, the
// question prompt, a score, or a correctness flag.

function intOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

/** Keys that move focus within an ARIA radiogroup. */
const FORWARD_KEYS = new Set(['ArrowDown', 'ArrowRight']);
const BACKWARD_KEYS = new Set(['ArrowUp', 'ArrowLeft']);

/**
 * Compute the option index focus should move to for a given key press.
 *
 * Returns the next index (with wraparound for the arrow keys), or `null` when
 * the key is not a navigation key OR the option list is empty/invalid -- in
 * which case the caller must NOT preventDefault and must leave focus where it
 * is. The current index is clamped into range first, so a stale/out-of-range
 * caller index still yields a sane move (e.g. arrowing from a cleared list).
 */
export function nextRovingIndex(current: unknown, total: unknown, key: unknown): number | null {
  const n = intOrNull(total);
  if (n === null || n <= 0) return null;
  if (typeof key !== 'string') return null;

  // Clamp the starting position into [0, n-1].
  const raw = intOrNull(current);
  const cur = raw === null ? 0 : Math.min(Math.max(raw, 0), n - 1);

  if (FORWARD_KEYS.has(key)) return (cur + 1) % n;
  if (BACKWARD_KEYS.has(key)) return (cur - 1 + n) % n;
  if (key === 'Home') return 0;
  if (key === 'End') return n - 1;
  return null;
}

/**
 * The roving tabIndex for a single option: `0` for the one option that should
 * carry the group's single tab stop, `-1` for every other option.
 *
 * The tabbable option is the selected one when a valid in-range selection
 * exists; otherwise it falls back to the first option, so a fresh (unanswered)
 * group is still reachable with one Tab press. A non-finite/out-of-range
 * `optionIndex` (or an empty/invalid group) yields `-1`.
 */
export function rovingTabIndex(
  optionIndex: unknown,
  selectedIndex: unknown,
  total: unknown,
): number {
  const n = intOrNull(total);
  const idx = intOrNull(optionIndex);
  if (n === null || n <= 0 || idx === null || idx < 0 || idx >= n) return -1;

  const sel = intOrNull(selectedIndex);
  const tabbable = sel !== null && sel >= 0 && sel < n ? sel : 0;
  return idx === tabbable ? 0 : -1;
}
