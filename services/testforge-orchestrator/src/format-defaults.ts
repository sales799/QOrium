/**
 * Format-derived 3PL guessing parameter `c` (mirrors `services/irt-calibration`'s
 * `defaultGuessingForFormat`). Duplicated here so this workspace doesn't
 * depend on the IRT calibration package; kept in sync intentionally.
 *
 * See `infra/CTO-deltas/CTO-DELTA-irt-2pl-with-format-c.md`.
 */

export function defaultGuessingForFormat(format: string): number {
  switch (format) {
    case 'mcq':
      return 0.25;
    case 'msq':
      return 0.0625;
    case 'truefalse':
      return 0.5;
    case 'coding':
    case 'design':
    case 'sjt':
    case 'casestudy':
      return 0.0;
    default:
      return 0.0;
  }
}
