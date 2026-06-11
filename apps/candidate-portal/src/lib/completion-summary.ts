// N11 candidate UX slice 2: turn the raw result fields into a small, honest
// completion summary for the candidate result page (time taken, how many
// questions were answered, and the average time per answered question). Pure +
// deterministic so it is unit-testable without a DOM. No answer keys or scores
// are involved here — this is purely about effort/completion, which is safe to
// show the candidate regardless of grading state.

export interface CompletionSummary {
  /** Questions the candidate submitted an answer for. */
  answered: number;
  /** Total questions in the assessment. */
  total: number;
  /** 0-100 completion percentage, rounded. 0 when total is unknown. */
  completionPct: number;
  /** Human label for total time spent, e.g. "12:05" or "1:03:20". null if unknown. */
  durationLabel: string | null;
  /** Human label for average time per answered question. null if not derivable. */
  avgPerQuestionLabel: string | null;
}

function toCount(value: unknown): number {
  return Number.isFinite(value) && (value as number) > 0 ? Math.floor(value as number) : 0;
}

/**
 * Format a whole number of seconds as m:ss, or h:mm:ss when an hour or more.
 * Negative or non-finite inputs clamp to 0.
 */
export function formatDuration(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const ss = String(s).padStart(2, '0');
  if (h > 0) {
    return `${h}:${String(m).padStart(2, '0')}:${ss}`;
  }
  return `${m}:${ss}`;
}

/**
 * Build the completion summary from the candidate result fields. `durationSec`
 * is the elapsed time between starting and submitting the attempt (may be
 * undefined when timestamps are missing). The average is only shown when the
 * candidate answered at least one question and a duration is known.
 */
export function buildCompletionSummary(input: {
  answered: number;
  total: number;
  durationSec?: number | null;
}): CompletionSummary {
  const answered = toCount(input.answered);
  const total = toCount(input.total);
  const completionPct = total > 0 ? Math.round((Math.min(answered, total) / total) * 100) : 0;

  const hasDuration =
    input.durationSec != null && Number.isFinite(input.durationSec) && input.durationSec >= 0;
  const durationLabel = hasDuration ? formatDuration(input.durationSec as number) : null;

  const avgPerQuestionLabel =
    hasDuration && answered > 0
      ? formatDuration(Math.round((input.durationSec as number) / answered))
      : null;

  return { answered, total, completionPct, durationLabel, avgPerQuestionLabel };
}
