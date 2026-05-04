// Watermark Engine v0 — per-candidate question variant.
// Sprint 1.2 (Run #26). Implements Constitution SO-9 watermark requirement.
//
// Strategy v0 (option-order permutation):
//   For an MCQ with N options labelled A, B, C, D, ..., the option ordering is
//   shuffled per (question_id, candidate_id) via a deterministic SHA-256 seed.
//   Each candidate sees the same set of option texts but in a different order;
//   the display labels remain A, B, C, D in display-position sequence, so
//   the candidate UI looks "normal".
//
//   The crucial leak-detection property: a leaked screenshot of the question
//   carries the candidate's specific permutation. Compared against the
//   canonical bank, the screenshot identifies the leaking candidate (modulo
//   1/N! collisions: 1/24 for N=4, 1/120 for N=5).
//
// Strategy v1 (Sprint 1.3+): also substitute named entities (Priya/Arjun) and
// numeric constants via a curated catalogue, with semantic validation that
// doesn't change the correct answer.

import { createHash } from 'node:crypto';

export interface WatermarkOption {
  key: string;
  text: string;
}

export interface WatermarkResult {
  /** Options as the candidate will see them: keys A, B, C, ... in order; texts shuffled. */
  options: WatermarkOption[];
  /** Map from canonical key -> display key the candidate sees. e.g. {A:'A', B:'C', C:'B', D:'D'} */
  keyMap: Record<string, string>;
  /** Inverse: candidate's selected display key -> canonical key (for grading). */
  inverseMap: Record<string, string>;
  /** Truncated SHA-256 seed used (hex), for audit/replay. */
  watermarkSeed: string;
}

/**
 * Apply per-candidate watermark to a set of MCQ options.
 *
 * @param questionId  Canonical question UUID (or external id).
 * @param candidateId Candidate identifier (string).
 * @param options     Original options as authored.
 * @param salt        Optional salt (e.g. tenant-specific) for additional uniqueness.
 */
export function applyWatermark(
  questionId: string,
  candidateId: string,
  options: WatermarkOption[],
  salt = ''
): WatermarkResult {
  if (options.length < 2) {
    return {
      options: [...options],
      keyMap: Object.fromEntries(options.map((o) => [o.key, o.key])),
      inverseMap: Object.fromEntries(options.map((o) => [o.key, o.key])),
      watermarkSeed: '',
    };
  }

  const seed = createHash('sha256')
    .update(`${questionId}::${candidateId}::${salt}`)
    .digest('hex');

  // permutation[i] = where original option index i appears in display order.
  const permutation = deterministicPermutation(options.length, seed);
  const displayLabels = options.map((o) => o.key); // typically A, B, C, D

  // Build display-order array: at display position j, place the original
  // option whose new position is j.
  const watermarkedOptions: WatermarkOption[] = new Array(options.length);
  const keyMap: Record<string, string> = {};
  const inverseMap: Record<string, string> = {};

  for (let i = 0; i < options.length; i++) {
    const newPosition = permutation[i]!;
    const displayLabel = displayLabels[newPosition]!;
    const canonicalLabel = options[i]!.key;
    watermarkedOptions[newPosition] = { key: displayLabel, text: options[i]!.text };
    keyMap[canonicalLabel] = displayLabel;
    inverseMap[displayLabel] = canonicalLabel;
  }

  return {
    options: watermarkedOptions,
    keyMap,
    inverseMap,
    watermarkSeed: seed.slice(0, 16),
  };
}

/**
 * Translate a candidate's selected (display) answer back to the canonical
 * answer key for grading. Pure inverse of applyWatermark.
 */
export function unwatermarkAnswer(
  selectedKey: string,
  inverseMap: Record<string, string>
): string {
  return inverseMap[selectedKey] ?? selectedKey;
}

/**
 * Fisher-Yates shuffle driven by a hex seed. Returns the new position for
 * each original index: result[i] is the display index for original index i.
 *
 * Important: a true random Fisher-Yates over [0..n-1] returns the SAME
 * starting array; our return value `result[i] = where i ends up` is what we
 * want, so we apply the shuffle to a tracking array.
 */
function deterministicPermutation(n: number, hexSeed: string): number[] {
  // Track where each original index ends up.
  const position = Array.from({ length: n }, (_, i) => i);
  // Standard Fisher-Yates shuffles the array in place; we need to track
  // each original index's destination, so we operate on `dest`.
  const dest = [...position];
  for (let i = n - 1; i > 0; i--) {
    const offset = ((n - 1 - i) * 2) % hexSeed.length;
    const byte = parseInt(hexSeed.slice(offset, offset + 2) || '00', 16);
    const j = byte % (i + 1);
    [dest[i], dest[j]] = [dest[j]!, dest[i]!];
  }
  // dest now holds an indirection; build the inverse so result[i] = display position of original i.
  const result = new Array<number>(n);
  for (let displayPos = 0; displayPos < n; displayPos++) {
    result[dest[displayPos]!] = displayPos;
  }
  return result;
}
