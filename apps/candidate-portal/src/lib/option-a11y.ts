// N11 candidate-UX (WCAG AA): pure presenters that give the multiple-choice
// option list real positional structure for assistive technology. The runner
// renders each answer choice as a bare radio + visible text. A screen-reader
// user hears the option text but gets no stable handle to refer back to a
// choice ("the third option", "option C"), and the radio group itself has no
// accessible name, so it is announced only as an unlabelled group of radios.
//
// These helpers add:
//   - optionLetter(i): a spreadsheet-style letter (A..Z, AA, AB, ...) used as a
//     visible + spoken prefix so every candidate can say "option C".
//   - buildRadiogroupLabel(total): an accessible name for the role="radiogroup"
//     wrapper, e.g. "Answer options: 4 choices, select one."
//
// Pure -- no React, no DOM, no fetch -- so they are unit-testable in CI. They
// are leak-safe by construction: they only ever express the option's POSITION
// (its letter / the count of choices). They never carry the option text, the
// question prompt, a score, or a correctness flag.

function intOrNull(value: unknown): number | null {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.trunc(value);
}

/**
 * Map a zero-based option index to a spreadsheet-style uppercase letter:
 *   0 -> "A", 1 -> "B", ... 25 -> "Z", 26 -> "AA", 27 -> "AB", ...
 *
 * Defensive: a non-finite or negative index yields '' so a malformed option
 * list can never produce a broken prefix like "@." or "-1.".
 */
export function optionLetter(index: unknown): string {
  let n = intOrNull(index);
  if (n === null || n < 0) return '';
  let out = '';
  // Bijective base-26 (no zero digit), least-significant letter first.
  do {
    out = String.fromCharCode(65 + (n % 26)) + out;
    n = Math.floor(n / 26) - 1;
  } while (n >= 0);
  return out;
}

/**
 * Build the accessible name for the radio group wrapping the options, e.g.
 *   "Answer options: 4 choices, select one."
 *
 * Defensive: a non-finite or non-positive count degrades to the generic
 * "Answer options, select one." so the group always has a grammatical name.
 */
export function buildRadiogroupLabel(total: unknown): string {
  const n = intOrNull(total);
  if (n === null || n <= 0) return 'Answer options, select one.';
  const noun = n === 1 ? 'choice' : 'choices';
  return `Answer options: ${n} ${noun}, select one.`;
}

/**
 * Compose the visible + spoken prefix for a single option, e.g. "A.".
 * Returns '' for an invalid index so the caller can omit the prefix entirely
 * rather than render a dangling separator.
 */
export function optionPrefix(index: unknown): string {
  const letter = optionLetter(index);
  return letter ? `${letter}.` : '';
}
