-- ============================================================================
-- Migration 0004: IRT calibration history
-- ============================================================================
-- Records every calibration fit attempt against a question. Each nightly run
-- emits one row per question that was eligible (status='calibrating' AND
-- calibration_n >= 30 per IRT-Calibration-Pipeline-v0-Spec §4 stage 3).
--
-- The row carries:
--   * Sample size at fit time (`n_responses`)
--   * Fitted parameters (a_est, b_est, c_est)
--   * Whether MLE converged (`converged`)
--   * Final log-likelihood for diagnostic comparison across runs
--   * Drift flag set during stage 4 (`flag`): one of
--       'none' | 'no_convergence' | 'low_n' | 'drift_b' | 'drift_a'
--       | 'extreme_pass_rate' | 'invalid_params'
--   * Prior + delta for drift attribution audit
--
-- A `run_id` (UUID) groups every row from a single nightly batch. The same
-- question may be re-fit on subsequent nights as more responses accumulate.
-- ============================================================================

BEGIN;

CREATE TABLE content.calibration_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id          UUID NOT NULL,
  question_id     UUID NOT NULL REFERENCES content.questions(id) ON DELETE CASCADE,
  n_responses     INT NOT NULL CHECK (n_responses >= 0),
  b_est           NUMERIC(5, 3),
  a_est           NUMERIC(5, 3),
  c_est           NUMERIC(5, 3),
  log_likelihood  NUMERIC(12, 4),
  converged       BOOLEAN NOT NULL,
  iterations      INT,
  prior_b         NUMERIC(5, 3),
  prior_a         NUMERIC(5, 3),
  delta_b         NUMERIC(5, 3),
  delta_a         NUMERIC(5, 3),
  empirical_pass_rate NUMERIC(4, 3),
  flag            VARCHAR(40) NOT NULL DEFAULT 'none'
    CHECK (flag IN (
      'none',
      'low_n',
      'no_convergence',
      'invalid_params',
      'drift_b',
      'drift_a',
      'extreme_pass_rate'
    )),
  ran_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX calibration_history_question_id_idx ON content.calibration_history (question_id);
CREATE INDEX calibration_history_run_id_idx ON content.calibration_history (run_id);
CREATE INDEX calibration_history_ran_at_idx ON content.calibration_history (ran_at DESC);
CREATE INDEX calibration_history_flag_idx
  ON content.calibration_history (flag) WHERE flag <> 'none';

COMMENT ON TABLE content.calibration_history IS
  'Append-only record of nightly IRT (2-PL/3-PL) parameter estimation runs. Drives drift detection and SME review escalation.';
COMMENT ON COLUMN content.calibration_history.flag IS
  'Outcome flag: none = healthy update applied; *_drift = SME review queued; low_n / no_convergence / invalid_params / extreme_pass_rate = update skipped.';

COMMIT;

-- Rollback ------------------------------------------------------------------
-- DROP TABLE content.calibration_history;
