import { describe, expect, it } from 'vitest';
import {
  applySmeDecision,
  customerFacingStatusFor,
  nextActionFor,
  type GateAudit,
  type QuestionState,
} from '../src/gates';

const baseState = (overrides: Partial<QuestionState> = {}): QuestionState => ({
  status: 'draft',
  customerFacingStatus: 'draft',
  calibrationN: 0,
  hasReleasedAt: false,
  audit: {},
  ...overrides,
});

describe('nextActionFor — terminal states', () => {
  it('rejected → terminal', () => {
    expect(nextActionFor(baseState({ status: 'rejected' }))).toEqual({
      kind: 'terminal',
      reason: 'rejected',
    });
  });

  it('leaked → terminal', () => {
    expect(nextActionFor(baseState({ status: 'leaked' }))).toEqual({
      kind: 'terminal',
      reason: 'leaked',
    });
  });
});

describe('nextActionFor — pre-pipeline', () => {
  it('draft → await SME decision', () => {
    expect(nextActionFor(baseState({ status: 'draft' }))).toEqual({ kind: 'await_sme_decision' });
  });

  it('sme_review → await SME decision', () => {
    expect(nextActionFor(baseState({ status: 'sme_review' }))).toEqual({
      kind: 'await_sme_decision',
    });
  });
});

describe('nextActionFor — accepted (pre-calibration prior)', () => {
  it('accepted without prior → compute_pre_calibration_prior', () => {
    expect(nextActionFor(baseState({ status: 'accepted' }))).toEqual({
      kind: 'compute_pre_calibration_prior',
    });
  });

  it('accepted with prior → await calibration responses', () => {
    const audit: GateAudit = {
      pre_calibration_prior: {
        gate: 'pre_calibration_prior',
        passed: true,
        ranAt: '2026-05-03T00:00:00Z',
      },
    };
    expect(nextActionFor(baseState({ status: 'accepted', audit }))).toEqual({
      kind: 'await_calibration_responses',
      needed: 30,
    });
  });
});

describe('nextActionFor — calibrating', () => {
  const priorAudit: GateAudit = {
    pre_calibration_prior: {
      gate: 'pre_calibration_prior',
      passed: true,
      ranAt: '2026-05-03T00:00:00Z',
    },
  };

  it('calibrationN < 30 → await responses', () => {
    expect(
      nextActionFor(baseState({ status: 'calibrating', calibrationN: 10, audit: priorAudit })),
    ).toEqual({ kind: 'await_calibration_responses', needed: 20 });
  });

  it('calibrationN ≥ 30, no IRT yet → await IRT run', () => {
    expect(
      nextActionFor(baseState({ status: 'calibrating', calibrationN: 30, audit: priorAudit })),
    ).toEqual({ kind: 'await_irt_calibration_run' });
  });

  it('IRT passed, N < 200 → graduate (skip bias DIF)', () => {
    const audit: GateAudit = {
      ...priorAudit,
      irt: { gate: 'irt_calibration', passed: true, ranAt: '2026-05-03T03:00:00Z' },
    };
    expect(nextActionFor(baseState({ status: 'calibrating', calibrationN: 50, audit }))).toEqual({
      kind: 'graduate_to_released',
    });
  });

  it('IRT passed, N ≥ 200, bias not yet checked → await bias DIF', () => {
    const audit: GateAudit = {
      ...priorAudit,
      irt: { gate: 'irt_calibration', passed: true, ranAt: '2026-05-03T03:00:00Z' },
    };
    expect(nextActionFor(baseState({ status: 'calibrating', calibrationN: 250, audit }))).toEqual({
      kind: 'await_bias_dif_check',
      reason: 'pending_monthly_run',
    });
  });

  it('IRT passed, N ≥ 200, bias passed → graduate', () => {
    const audit: GateAudit = {
      ...priorAudit,
      irt: { gate: 'irt_calibration', passed: true, ranAt: '2026-05-03T03:00:00Z' },
      bias: { gate: 'bias_dif', passed: true, ranAt: '2026-05-04T04:00:00Z' },
    };
    expect(nextActionFor(baseState({ status: 'calibrating', calibrationN: 300, audit }))).toEqual({
      kind: 'graduate_to_released',
    });
  });
});

describe('nextActionFor — drift escalation', () => {
  it('released with irt drift → request SME re-review', () => {
    const audit: GateAudit = {
      irt: {
        gate: 'irt_calibration',
        passed: true,
        ranAt: '2026-05-03T03:00:00Z',
        notes: 'drift_b',
      },
    };
    expect(nextActionFor(baseState({ status: 'released', audit }))).toEqual({
      kind: 'request_sme_re_review',
      reason: 'irt_drift',
    });
  });

  it('released with bias flag → request SME re-review', () => {
    const audit: GateAudit = {
      bias: { gate: 'bias_dif', passed: false, ranAt: '2026-06-03T04:00:00Z' },
    };
    expect(nextActionFor(baseState({ status: 'released', audit }))).toEqual({
      kind: 'request_sme_re_review',
      reason: 'bias_flag',
    });
  });
});

describe('applySmeDecision', () => {
  it.each([
    ['accept', 'accepted'],
    ['revise', 'draft'],
    ['reject', 'rejected'],
  ] as const)('decision %s → status %s', (decision, expected) => {
    expect(applySmeDecision(baseState({ status: 'sme_review' }), { decision })).toBe(expected);
  });

  it('throws when applied outside draft / sme_review', () => {
    expect(() =>
      applySmeDecision(baseState({ status: 'released' }), { decision: 'accept' }),
    ).toThrow();
  });
});

describe('customerFacingStatusFor', () => {
  it.each([
    ['draft', 'draft'],
    ['sme_review', 'sme_review'],
    ['accepted', 'sme_review'],
    ['calibrating', 'calibrating'],
    ['bias_review', 'sme_review'],
    ['released', 'released'],
    ['leaked', 'leaked'],
    ['rejected', 'deprecated'],
  ] as const)('%s → %s', (input, expected) => {
    expect(customerFacingStatusFor(input)).toBe(expected);
  });
});
