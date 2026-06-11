// N10 candidate consent gate: pure presenter that turns the sanitized
// CandidateConsentView returned by readybank's GET /v1/invitations/:token/proctoring
// into a display model for the candidate landing page.
//
// The endpoint already strips the tenant plan id and the internal resolution
// reason; this presenter only maps the surviving feature ids into human-readable
// monitoring lines and decides whether the candidate must give EXPLICIT consent
// (a checked acknowledgement) before Start. Pure — no React, no fetch — so it is
// unit-testable in CI without a DOM or a network. When proctoring is inert
// (the default) it returns an empty, disabled notice and the landing page renders
// exactly as before.

export interface ProctoringConsentResponse {
  proctoring_enabled?: boolean;
  features?: unknown;
  consent_required?: boolean;
}

export interface ProctoringNotice {
  enabled: boolean;
  requiresExplicitConsent: boolean;
  items: string[];
}

// Plain-language description of each entitled feature, shown to the candidate.
const FEATURE_LABELS: Record<string, string> = {
  integrity_scoring:
    'Tab switches, pasting and focus changes are recorded and scored for integrity.',
  webcam_snapshots: 'Your webcam captures periodic snapshots during the assessment.',
  id_capture: 'A photo of your ID is captured to confirm your identity.',
  lockdown_browser: 'A locked-down browser environment restricts other apps and tabs.',
};

const EMPTY: ProctoringNotice = {
  enabled: false,
  requiresExplicitConsent: false,
  items: [],
};

/**
 * Build the candidate-facing proctoring notice.
 *
 * Returns an empty/disabled notice unless the API explicitly reports
 * proctoring_enabled === true AND at least one recognised feature. Unknown
 * feature ids are ignored (forward-compatible — a feature the portal does not
 * yet describe is never silently presented as a blank line). requiresExplicitConsent
 * mirrors the API's consent_required flag, but only ever true when the notice is
 * itself enabled with described features.
 */
export function buildProctoringNotice(
  view: ProctoringConsentResponse | null | undefined,
): ProctoringNotice {
  if (!view || view.proctoring_enabled !== true) return EMPTY;

  const features = Array.isArray(view.features) ? view.features : [];
  const items = features
    .map((f) => (typeof f === 'string' ? FEATURE_LABELS[f] : undefined))
    .filter((label): label is string => typeof label === 'string');

  if (items.length === 0) return EMPTY;

  return {
    enabled: true,
    requiresExplicitConsent: view.consent_required === true,
    items,
  };
}
