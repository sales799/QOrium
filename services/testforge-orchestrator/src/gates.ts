/**
 * Six-gate state machine per `governance/TestForge-QA-Pipeline-v1.md` §2.1.
 *
 *   draft
 *     ↓ (SME validation)
 *   sme_review
 *     ↓ (accept)             ↓ (revise)        ↓ (reject)
 *   accepted               draft             rejected (terminal)
 *     ↓ (pre-calibration AI prior)
 *   calibrating
 *     ↓ (IRT N≥30, |Δb|≤0.5, etc.)
 *   released                                 ↑ (drift) → sme_review
 *     ↓ (anti-leak detected)                  ↑ (bias DIF flagged) → bias_review → SME → accepted
 *   leaked (terminal — variant takes over)
 *
 * This file is pure logic: given a question's current state, return the
 * next gate the orchestrator should drive. No DB access, no I/O.
 */

export type TestForgeStatus =
  | 'draft'
  | 'sme_review'
  | 'accepted'
  | 'calibrating'
  | 'bias_review'
  | 'released'
  | 'leaked'
  | 'rejected';

export type GateName =
  | 'sme_validation'
  | 'pre_calibration_prior'
  | 'irt_calibration'
  | 'bias_dif'
  | 'anti_leak'
  | 'plagiarism_benchmark'
  | 'gate_scorecard';

export interface GateAuditEntry {
  gate: GateName;
  passed: boolean;
  ranAt: string; // ISO timestamp
  notes?: string;
}

export interface GateAudit {
  sme?: GateAuditEntry;
  pre_calibration_prior?: GateAuditEntry;
  irt?: GateAuditEntry;
  bias?: GateAuditEntry;
  anti_leak?: GateAuditEntry;
  plagiarism?: GateAuditEntry;
  scorecard?: GateAuditEntry;
}

export interface QuestionState {
  status: TestForgeStatus;
  /** Customer-facing column from `content.questions.status`. The orchestrator
   * mirrors transitions onto this column when graduating items. */
  customerFacingStatus?: string;
  calibrationN: number;
  hasReleasedAt: boolean;
  audit: GateAudit;
}

export type NextAction =
  | { kind: 'await_sme_decision' }
  | { kind: 'compute_pre_calibration_prior' }
  | { kind: 'await_calibration_responses'; needed: number }
  | { kind: 'await_irt_calibration_run' }
  | { kind: 'await_bias_dif_check'; reason: 'sample_too_small' | 'pending_monthly_run' }
  | { kind: 'graduate_to_released' }
  | { kind: 'request_sme_re_review'; reason: 'irt_drift' | 'bias_flag' }
  | { kind: 'terminal'; reason: 'rejected' | 'leaked' };

const MIN_CALIBRATION_N = 30;
const MIN_BIAS_DIF_N = 200;

export function nextActionFor(state: QuestionState): NextAction {
  switch (state.status) {
    case 'rejected':
      return { kind: 'terminal', reason: 'rejected' };
    case 'leaked':
      return { kind: 'terminal', reason: 'leaked' };

    case 'draft':
    case 'sme_review':
      return { kind: 'await_sme_decision' };

    case 'accepted': {
      // Once SME accepts, we need the AI prior before exposure to the
      // Reference Panel begins (§3.2 pre-calibration).
      if (!state.audit.pre_calibration_prior?.passed) {
        return { kind: 'compute_pre_calibration_prior' };
      }
      // Prior set; waiting for the next nightly run to flip status to
      // calibrating. The orchestrator handles that transition.
      return { kind: 'await_calibration_responses', needed: MIN_CALIBRATION_N };
    }

    case 'calibrating': {
      if (state.calibrationN < MIN_CALIBRATION_N) {
        return {
          kind: 'await_calibration_responses',
          needed: MIN_CALIBRATION_N - state.calibrationN,
        };
      }
      // Waiting for the IRT batch service to do the fit. The audit row
      // will be written by `qorium-irt-calibration` (Sprint 1.5).
      if (!state.audit.irt?.passed) {
        return { kind: 'await_irt_calibration_run' };
      }
      // IRT has run; check bias gate.
      if (state.calibrationN < MIN_BIAS_DIF_N) {
        // §2.1: bias DIF needs N≥200; small-N items skip the bias gate
        // for v0 release and re-enter at the next monthly run.
        return { kind: 'graduate_to_released' };
      }
      if (!state.audit.bias?.passed) {
        return { kind: 'await_bias_dif_check', reason: 'pending_monthly_run' };
      }
      return { kind: 'graduate_to_released' };
    }

    case 'bias_review':
      return { kind: 'request_sme_re_review', reason: 'bias_flag' };

    case 'released': {
      // Released items still pass through anti-leak / plagiarism /
      // scorecard re-runs; the orchestrator surfaces drift back to
      // sme_review when the IRT pipeline reports |Δb| > 0.5.
      const irt = state.audit.irt;
      if (irt && irt.notes?.startsWith('drift_')) {
        return { kind: 'request_sme_re_review', reason: 'irt_drift' };
      }
      const bias = state.audit.bias;
      if (bias && bias.passed === false) {
        return { kind: 'request_sme_re_review', reason: 'bias_flag' };
      }
      // Steady state. Periodic re-checks happen via the per-gate cron
      // services (leak crawler, plagiarism detector); no per-item
      // action from the orchestrator.
      return { kind: 'graduate_to_released' };
    }

    default:
      // exhaustive switch guard
      return { kind: 'await_sme_decision' };
  }
}

export interface SmeDecisionInput {
  decision: 'accept' | 'revise' | 'reject';
}

export function applySmeDecision(state: QuestionState, input: SmeDecisionInput): TestForgeStatus {
  if (state.status !== 'sme_review' && state.status !== 'draft') {
    throw new Error(`SME decision requires status=draft|sme_review, got ${state.status}`);
  }
  switch (input.decision) {
    case 'accept':
      return 'accepted';
    case 'revise':
      return 'draft';
    case 'reject':
      return 'rejected';
    default:
      throw new Error(`unknown SME decision: ${String(input.decision)}`);
  }
}

/**
 * Map a TestForge status to the customer-facing `content.questions.status`
 * column. The orchestrator writes both columns transactionally.
 */
export function customerFacingStatusFor(status: TestForgeStatus): string {
  switch (status) {
    case 'draft':
    case 'sme_review':
      return status;
    case 'accepted':
      return 'sme_review'; // accepted but awaiting pre-calibration; not customer-visible
    case 'calibrating':
      return 'calibrating';
    case 'bias_review':
      return 'sme_review'; // pulled out of release queue; back in human review
    case 'released':
      return 'released';
    case 'leaked':
      return 'leaked';
    case 'rejected':
      return 'deprecated';
  }
}
