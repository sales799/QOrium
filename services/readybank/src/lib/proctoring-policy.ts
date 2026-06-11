// N10 proctoring tier-2 — slice 2: feature-flag + plan-entitlement policy resolver.
//
// Slice 1 (lib/integrity.ts) turns raw client-side anti-cheat counters into an
// attempt-level integrity risk summary. This slice decides WHICH proctoring
// features a tenant is entitled to before any capture happens, gated behind a
// global PROCTORING_ENABLED feature flag AND per-plan entitlement.
//
// Pure + deterministic — no DB, no I/O. The webcam-snapshot / ID-capture
// storage slices (which require a migration) build on top of this resolver, so
// nothing is captured for a tenant the policy does not entitle. Inert by
// default: the flag is OFF unless PROCTORING_ENABLED is explicitly truthy.
import type { PlanId } from '../billing/plans.js';

export type ProctoringFeature =
  | 'integrity_scoring'
  | 'webcam_snapshots'
  | 'id_capture'
  | 'lockdown_browser';

export interface ProctoringPolicy {
  enabled: boolean;
  plan: PlanId;
  features: ProctoringFeature[];
  consent_required: boolean;
  reason: string;
}

// Per-plan entitlement ladder. A tenant can never receive MORE than its plan
// grants; a per-assessment override may only REMOVE a feature, never escalate.
// free → nothing (Customer Zero gets integrity scoring for internal use only
// when the flag is on, but no biometric capture).
const PLAN_FEATURES: Record<PlanId, ProctoringFeature[]> = {
  free: [],
  growth: ['integrity_scoring'],
  scale: ['integrity_scoring', 'webcam_snapshots', 'id_capture'],
  enterprise: ['integrity_scoring', 'webcam_snapshots', 'id_capture', 'lockdown_browser'],
};

// Features that capture personal/biometric data and therefore require explicit
// candidate consent before the runner may activate them (DPDP-aligned).
const CONSENT_FEATURES: ReadonlyArray<ProctoringFeature> = ['webcam_snapshots', 'id_capture'];

export interface ResolveProctoringArgs {
  globalEnabled: boolean; // PROCTORING_ENABLED env flag
  plan: PlanId;
  // Optional per-assessment opt-outs. Can only NARROW the entitled set — an
  // override listing a feature the plan does not grant is simply ignored, so
  // this can never widen entitlement.
  disabledFeatures?: ReadonlyArray<ProctoringFeature>;
}

export function resolveProctoringPolicy(args: ResolveProctoringArgs): ProctoringPolicy {
  const { globalEnabled, plan } = args;
  if (!globalEnabled) {
    return {
      enabled: false,
      plan,
      features: [],
      consent_required: false,
      reason: 'feature_flag_off',
    };
  }
  const entitled = PLAN_FEATURES[plan] ?? [];
  const disabled = new Set(args.disabledFeatures ?? []);
  const features = entitled.filter((f) => !disabled.has(f));
  if (features.length === 0) {
    return {
      enabled: false,
      plan,
      features: [],
      consent_required: false,
      reason: entitled.length === 0 ? 'plan_not_entitled' : 'all_features_opted_out',
    };
  }
  const consentRequired = features.some((f) => CONSENT_FEATURES.includes(f));
  return {
    enabled: true,
    plan,
    features,
    consent_required: consentRequired,
    reason: 'ok',
  };
}

// Reads the PROCTORING_ENABLED env flag. Default OFF — proctoring stays inert
// until the operator explicitly opts in (1/true/yes/on, case-insensitive).
export function proctoringFeatureFlag(env: NodeJS.ProcessEnv = process.env): boolean {
  const v = (env.PROCTORING_ENABLED ?? '').trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes' || v === 'on';
}
