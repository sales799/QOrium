import type { ItemResponse, MantelHaenszelResult } from './types.js';

/**
 * Mantel-Haenszel DIF statistic for a binary item across two demographic
 * groups (focal vs reference). Stratifies by ability quintile so DIF is
 * detected only when same-ability respondents from different groups
 * answer differently.
 *
 * Output:
 *   alphaMH = common odds ratio across strata
 *   D-MH    = -2.35 * ln(alphaMH)  (ETS delta scale)
 *
 * |D-MH| < 1.0   negligible
 * |D-MH| 1.0-1.5 moderate (B classification)
 * |D-MH| > 1.5   large (C classification — flag for SME review)
 *
 * Privacy: this function takes already-grouped responses; no PII enters.
 */
export function mantelHaenszel(
  questionId: string,
  /** Responses from the reference group (e.g. modal demographic). */
  reference: ReadonlyArray<{ panelistId: string; correct: 0 | 1; ability: number }>,
  /** Responses from the focal group. */
  focal: ReadonlyArray<{ panelistId: string; correct: 0 | 1; ability: number }>,
  options: { strata?: number } = {},
): MantelHaenszelResult {
  const numStrata = options.strata ?? 5;

  // Build ability cut-points from the combined sample so strata are
  // balanced across the joint distribution.
  const all = [...reference, ...focal].map((r) => r.ability);
  all.sort((x, y) => x - y);

  const cuts: number[] = [];
  for (let i = 1; i < numStrata; i++) {
    const idx = Math.floor((all.length * i) / numStrata);
    cuts.push(all[idx] ?? 0);
  }

  const stratumOf = (ab: number): number => {
    let i = 0;
    for (; i < cuts.length; i++) {
      if (ab < (cuts[i] ?? 0)) return i;
    }
    return i;
  };

  // Per stratum: count correct/incorrect for ref and focal.
  const buckets: Array<{ rR: number; rW: number; fR: number; fW: number }> = [];
  for (let s = 0; s < numStrata; s++) buckets.push({ rR: 0, rW: 0, fR: 0, fW: 0 });

  for (const r of reference) {
    const s = Math.min(stratumOf(r.ability), numStrata - 1);
    if (r.correct) buckets[s]!.rR += 1;
    else buckets[s]!.rW += 1;
  }
  for (const f of focal) {
    const s = Math.min(stratumOf(f.ability), numStrata - 1);
    if (f.correct) buckets[s]!.fR += 1;
    else buckets[s]!.fW += 1;
  }

  // Mantel-Haenszel common odds ratio:
  //   alpha = sum_s ( rR_s * fW_s / N_s ) / sum_s ( rW_s * fR_s / N_s )
  let num = 0;
  let den = 0;
  for (const b of buckets) {
    const N = b.rR + b.rW + b.fR + b.fW;
    if (N === 0) continue;
    num += (b.rR * b.fW) / N;
    den += (b.rW * b.fR) / N;
  }

  const eps = 1e-9;
  const alphaMH = (num + eps) / (den + eps);
  const dmh = -2.35 * Math.log(alphaMH);
  return {
    questionId,
    dmh,
    alphaMH,
    strata: numStrata,
    n: reference.length + focal.length,
  };
}

/** Convenience: run MH on a long-form response set tagged with a group
 *  label and a precomputed ability per panelist. */
export function mantelHaenszelFromLong(
  questionId: string,
  responses: ReadonlyArray<ItemResponse & { group: 'reference' | 'focal'; ability: number }>,
  options: { strata?: number } = {},
): MantelHaenszelResult {
  const ref = responses
    .filter((r) => r.group === 'reference')
    .map((r) => ({ panelistId: r.panelistId, correct: r.correct, ability: r.ability }));
  const foc = responses
    .filter((r) => r.group === 'focal')
    .map((r) => ({ panelistId: r.panelistId, correct: r.correct, ability: r.ability }));
  return mantelHaenszel(questionId, ref, foc, options);
}
