/**
 * Anti-fraud signal computation per Judge0-Sandbox-Integration-Spec-v0.md
 * §6.5. Flags raised here go into `content.responses.suspicious_signals` for
 * SME review. Per spec: "Use for detection (flag for SME review) not
 * auto-rejection (compliance risk)."
 *
 * Pure logic. Inputs come from the API layer (keystroke telemetry, IP, time
 * on task) and the orchestrator (execution_success, language_mismatch).
 */

export interface AntiFraudInputs {
  /** Number of paste events captured by the frontend. */
  pasteEventCount?: number;
  /** Number of typed (keydown) events captured by the frontend. */
  typedEventCount?: number;
  /** Total time the candidate spent on this question (ms). */
  timeOnTaskMs?: number;
  /** Whether the candidate's IP changed during the session. */
  suspiciousIpChange?: boolean;
  /** Did the orchestrator successfully execute the submission? */
  executionSuccess?: boolean;
  /** Did the candidate's submitted language match the question's expected language? */
  languageMismatch?: boolean;
  /** Number of identical submissions by other candidates (plagiarism signal). */
  identicalSubmissionCount?: number;
}

export interface AntiFraudSignals {
  pasteVsTypedRatio: number;
  timeOnTaskMs: number;
  copyPasteEventCount: number;
  suspiciousIpChange: boolean;
  executionSuccess: boolean;
  languageMismatch: boolean;
  identicalSubmissionCount: number;
  /** Composite flags raised — string keys for query convenience. */
  flags: AntiFraudFlag[];
}

export type AntiFraudFlag =
  | 'high_paste_ratio'
  | 'time_on_task_too_low'
  | 'suspicious_ip_change'
  | 'language_mismatch'
  | 'identical_submission'
  | 'execution_failed';

const PASTE_RATIO_FLAG_THRESHOLD = 0.7; // > 0.7 = suspicious per spec §6.5
const TIME_ON_TASK_FLAG_THRESHOLD_MS = 60_000; // < 60s = suspicious

export function computeAntiFraudSignals(inputs: AntiFraudInputs): AntiFraudSignals {
  const pasteCount = nonNeg(inputs.pasteEventCount);
  const typedCount = nonNeg(inputs.typedEventCount);
  const total = pasteCount + typedCount;
  const pasteVsTypedRatio = total > 0 ? Math.min(1, pasteCount / total) : 0;
  const timeOnTaskMs = nonNeg(inputs.timeOnTaskMs);
  const suspiciousIpChange = inputs.suspiciousIpChange === true;
  const executionSuccess = inputs.executionSuccess !== false; // default true
  const languageMismatch = inputs.languageMismatch === true;
  const identicalSubmissionCount = nonNeg(inputs.identicalSubmissionCount);

  const flags: AntiFraudFlag[] = [];
  if (pasteVsTypedRatio > PASTE_RATIO_FLAG_THRESHOLD) flags.push('high_paste_ratio');
  if (timeOnTaskMs > 0 && timeOnTaskMs < TIME_ON_TASK_FLAG_THRESHOLD_MS) {
    flags.push('time_on_task_too_low');
  }
  if (suspiciousIpChange) flags.push('suspicious_ip_change');
  if (languageMismatch) flags.push('language_mismatch');
  if (identicalSubmissionCount >= 1) flags.push('identical_submission');
  if (!executionSuccess) flags.push('execution_failed');

  return {
    pasteVsTypedRatio,
    timeOnTaskMs,
    copyPasteEventCount: pasteCount,
    suspiciousIpChange,
    executionSuccess,
    languageMismatch,
    identicalSubmissionCount,
    flags,
  };
}

function nonNeg(v: number | undefined): number {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return 0;
  return v;
}
