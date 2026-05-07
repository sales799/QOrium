/**
 * IRT model parameters per the Birnbaum 3PL formulation:
 *
 *     P(theta) = c + (1 - c) * sigmoid(a * (theta - b))
 *
 *   a = discrimination (slope at the inflection point)
 *   b = difficulty (theta at which P(theta) = (1 + c) / 2)
 *   c = pseudo-guessing (lower asymptote; 0 for design / SJT items)
 *
 * Bounds per `infra/IRT-Calibration-Pipeline-v0-Spec.md` §2:
 *   a ∈ [0.0, 3.0]
 *   b ∈ [-4, 4]
 *   c ∈ [0.0, 0.3]
 */
export interface IrtParams {
  a: number;
  b: number;
  c: number;
}

/** Single observed response. Correctness is binary (0/1) at this layer.
 *  Polytomous scoring is reduced to dichotomous via a threshold upstream. */
export interface ItemResponse {
  questionId: string;
  panelistId: string;
  /** 1 if the candidate answered correctly, 0 otherwise. */
  correct: 0 | 1;
}

/** Calibration outcome for one item. Carries the fit parameters plus
 *  diagnostics that decide whether the item passes SO-21. */
export interface CalibrationResult {
  questionId: string;
  params: IrtParams;
  /** Number of responses used to fit. */
  n: number;
  /** Empirical pass rate observed in the sample. */
  empiricalPassRate: number;
  /** Did the optimiser converge within tolerance? */
  converged: boolean;
  /** Negative log-likelihood at the fit. Useful for model comparison. */
  negLogLikelihood: number;
}

/** Mantel-Haenszel DIF outcome for one item across two demographic groups. */
export interface MantelHaenszelResult {
  questionId: string;
  /** D-MH statistic (delta scale). |D-MH| > 1.5 is large DIF; > 1.0 moderate. */
  dmh: number;
  /** Common odds ratio across strata. */
  alphaMH: number;
  /** Number of strata used (binned ability levels). */
  strata: number;
  /** Total respondents across both groups. */
  n: number;
}

/** Outcome of the SO-21 quality gate. */
export interface QualityGateResult {
  passed: boolean;
  reasons: string[];
}
