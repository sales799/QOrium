/**
 * Drift detection per IRT-Calibration-Pipeline-v0-Spec §4 stage 4.
 *
 * Flagging criteria:
 *   - |Δb| > 0.5: difficulty estimate moved ≥0.5 units → SME review
 *   - |Δa| > 0.3: discrimination changed significantly → SME review
 *   - empirical_pass_rate diverges >0.20 from model expectation → SME review
 *
 * The classifier is pure: takes priors + the latest fit + observed pass rate
 * and emits one of the canonical flag values that the migration's CHECK
 * constraint accepts.
 */

import { probability3PL, type ItemParameters } from './model.js';

export type CalibrationFlag =
  | 'none'
  | 'low_n'
  | 'no_convergence'
  | 'invalid_params'
  | 'drift_b'
  | 'drift_a'
  | 'extreme_pass_rate';

export interface DriftInputs {
  estimated: ItemParameters;
  prior: { a: number | null; b: number | null };
  empiricalPassRate: number | null;
  /** Flag carried forward from the fitter (e.g., 'no_convergence', 'low_n'). */
  preflag?: CalibrationFlag | undefined;
}

const DRIFT_B = 0.5;
const DRIFT_A = 0.3;
const PASS_RATE_DRIFT = 0.2;

/** Expected pass rate at θ=0 given the fitted item parameters. */
export function expectedPassRateAtMeanAbility(params: ItemParameters): number {
  return probability3PL(0, params);
}

export function classifyDrift(inputs: DriftInputs): CalibrationFlag {
  if (inputs.preflag && inputs.preflag !== 'none') return inputs.preflag;

  const params = inputs.estimated;
  if (
    !Number.isFinite(params.a) ||
    !Number.isFinite(params.b) ||
    !Number.isFinite(params.c) ||
    params.a <= 0
  ) {
    return 'invalid_params';
  }

  if (inputs.prior.b !== null && Math.abs(params.b - inputs.prior.b) > DRIFT_B) {
    return 'drift_b';
  }
  if (inputs.prior.a !== null && Math.abs(params.a - inputs.prior.a) > DRIFT_A) {
    return 'drift_a';
  }
  if (inputs.empiricalPassRate !== null) {
    const expected = expectedPassRateAtMeanAbility(params);
    if (Math.abs(inputs.empiricalPassRate - expected) > PASS_RATE_DRIFT) {
      return 'extreme_pass_rate';
    }
  }
  return 'none';
}

export interface NextStatusInputs {
  flag: CalibrationFlag;
  hasMinResponses: boolean;
}

/**
 * §4 stage 5 transition rules:
 *   - flag === 'none' AND N ≥ 30 → graduate to 'released'
 *   - flag is a drift flag (drift_b / drift_a / extreme_pass_rate) → 'sme_review'
 *   - flag is 'low_n' / 'no_convergence' / 'invalid_params' → stay 'calibrating'
 */
export function nextStatusForFlag(
  inputs: NextStatusInputs,
): 'released' | 'sme_review' | 'calibrating' {
  if (!inputs.hasMinResponses) return 'calibrating';
  switch (inputs.flag) {
    case 'none':
      return 'released';
    case 'drift_b':
    case 'drift_a':
    case 'extreme_pass_rate':
      return 'sme_review';
    case 'invalid_params':
    case 'no_convergence':
    case 'low_n':
      return 'calibrating';
    default:
      return 'calibrating';
  }
}
