/**
 * @qorium/irt — Item Response Theory calibration toolkit.
 *
 * Constitution SO-21 (IRT scoring Day-1 mandatory) is enforced via
 * `passesIrtAutoFail`. The Gatekeeper office cannot override this gate;
 * any release pipeline that bypasses it is a Constitutional violation.
 *
 * Reference: `infra/IRT-Calibration-Pipeline-v0-Spec.md`.
 *
 * Public API:
 *   prob3pl / prob2pl / sigmoid          — likelihood functions
 *   estimateAbilityMle                   — Newton-Raphson θ MLE
 *   abilityProxyFromSumScore             — sum-score warm start
 *   probabilityProfile                   — vector P(θ) across an item bank
 *   calibrateItems                       — JMLE-style 2PL fit
 *   mantelHaenszel / *FromLong           — Mantel-Haenszel DIF
 *   passesIrtAutoFail                    — SO-21 quality gate
 *   detectParameterDrift                 — Δb / Δa drift flagging
 *
 * No external numerical dependencies; pure TypeScript so the package is
 * portable across the Node toolchain and into a worker without a Python
 * runtime. The spec recommends `girth` (Python) — we keep that as a
 * future-compatible fallback if WAve-3 SJT calibration needs richer
 * polytomous IRT models.
 */
export type {
  IrtParams,
  ItemResponse,
  CalibrationResult,
  MantelHaenszelResult,
  QualityGateResult,
} from './types.js';
export { sigmoid, prob3pl, prob2pl, logLikGradTheta, fisherInfoTheta } from './probability.js';
export { estimateAbilityMle, abilityProxyFromSumScore, probabilityProfile } from './ability.js';
export { calibrateItems } from './calibrate.js';
export { mantelHaenszel, mantelHaenszelFromLong } from './dif.js';
export {
  SO21_DEFAULTS,
  passesIrtAutoFail,
  detectParameterDrift,
  type QualityGateThresholds,
} from './quality-gate.js';
