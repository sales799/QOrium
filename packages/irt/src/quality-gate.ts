import type { CalibrationResult, IrtParams, QualityGateResult } from './types.js';

/**
 * SO-21 enforcement: a question may only transition status='calibrating'
 * → status='released' if every check below passes. The Constitution makes
 * this Day-1 mandatory; the Gatekeeper office cannot override it.
 *
 * Thresholds align with `infra/IRT-Calibration-Pipeline-v0-Spec.md` §11.
 */
export interface QualityGateThresholds {
  /** Minimum responses needed before parameters are trusted. */
  minN: number;
  /** Min discrimination (a) — below this, the item doesn't separate
   *  ability levels and is functionally noise. */
  minDiscrimination: number;
  /** Max discrimination (a) — pathologically steep slopes usually mean
   *  the data is degenerate, not that the item is good. */
  maxDiscrimination: number;
  /** Difficulty (b) bounds. Outside this band, the item is effectively
   *  unscoreable for the Reference Panel ability range. */
  bBounds: [number, number];
  /** Pseudo-guessing (c) max — protects against runaway floor estimates. */
  maxGuessing: number;
  /** Empirical pass rate must lie in [min, max] — symmetric around 0.5
   *  by default. Items everyone gets right or no one gets right are
   *  uninformative regardless of fit. */
  passRateBounds: [number, number];
}

export const SO21_DEFAULTS: QualityGateThresholds = {
  minN: 30,
  minDiscrimination: 0.5,
  maxDiscrimination: 3.0,
  bBounds: [-4, 4],
  maxGuessing: 0.3,
  passRateBounds: [0.05, 0.95],
};

export function passesIrtAutoFail(
  result: CalibrationResult,
  thresholds: Partial<QualityGateThresholds> = {},
): QualityGateResult {
  const t = { ...SO21_DEFAULTS, ...thresholds };
  const reasons: string[] = [];
  const { params } = result;

  if (result.n < t.minN) reasons.push(`n=${result.n} < minN=${t.minN}`);
  if (!result.converged) reasons.push('optimiser did not converge');
  if (params.a < t.minDiscrimination)
    reasons.push(`a=${params.a.toFixed(3)} < minDiscrimination=${t.minDiscrimination}`);
  if (params.a > t.maxDiscrimination)
    reasons.push(`a=${params.a.toFixed(3)} > maxDiscrimination=${t.maxDiscrimination}`);
  if (params.b < t.bBounds[0] || params.b > t.bBounds[1])
    reasons.push(`b=${params.b.toFixed(3)} outside bBounds=[${t.bBounds[0]}, ${t.bBounds[1]}]`);
  if (params.c < 0 || params.c > t.maxGuessing)
    reasons.push(`c=${params.c.toFixed(3)} outside [0, ${t.maxGuessing}]`);
  if (
    result.empiricalPassRate < t.passRateBounds[0] ||
    result.empiricalPassRate > t.passRateBounds[1]
  )
    reasons.push(
      `passRate=${result.empiricalPassRate.toFixed(3)} outside [${t.passRateBounds[0]}, ${t.passRateBounds[1]}]`,
    );

  return { passed: reasons.length === 0, reasons };
}

/** Drift check: compare new parameters against prior parameters; flag if
 *  |Δb| > 0.5 OR |Δa| > 0.3 per spec §4. */
export function detectParameterDrift(
  prior: IrtParams,
  next: IrtParams,
  thresholds: { dB?: number; dA?: number; dC?: number } = {},
): { drift: boolean; deltas: { dA: number; dB: number; dC: number }; reasons: string[] } {
  const dB = thresholds.dB ?? 0.5;
  const dA = thresholds.dA ?? 0.3;
  const dC = thresholds.dC ?? 0.1;
  const reasons: string[] = [];
  const deltas = {
    dA: next.a - prior.a,
    dB: next.b - prior.b,
    dC: next.c - prior.c,
  };
  if (Math.abs(deltas.dA) > dA) reasons.push(`|Δa|=${Math.abs(deltas.dA).toFixed(3)} > ${dA}`);
  if (Math.abs(deltas.dB) > dB) reasons.push(`|Δb|=${Math.abs(deltas.dB).toFixed(3)} > ${dB}`);
  if (Math.abs(deltas.dC) > dC) reasons.push(`|Δc|=${Math.abs(deltas.dC).toFixed(3)} > ${dC}`);
  return { drift: reasons.length > 0, deltas, reasons };
}
