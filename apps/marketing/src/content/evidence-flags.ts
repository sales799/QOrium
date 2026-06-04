export type EvidenceFlag =
  | 'caseStudies'
  | 'customerStories'
  | 'externalLogoRail'
  | 'outcomeStats'
  | 'samplePack'
  | 'workspaceSignIn';

export type EvidenceFlagState = {
  enabled: boolean;
  source: string;
};

type EvidenceFlagEnv = Partial<Record<string, string | undefined>>;

export const evidenceFlagDefaults = {
  caseStudies: false,
  customerStories: false,
  externalLogoRail: false,
  outcomeStats: false,
  samplePack: true,
  workspaceSignIn: true,
} as const satisfies Record<EvidenceFlag, boolean>;

export const publicEvidenceFlagEnvKeys = {
  caseStudies: 'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_CASE_STUDIES',
  customerStories: 'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_CUSTOMER_STORIES',
  externalLogoRail: 'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_EXTERNAL_LOGO_RAIL',
  outcomeStats: 'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_OUTCOME_STATS',
  samplePack: 'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_SAMPLE_PACK',
  workspaceSignIn: 'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_WORKSPACE_SIGN_IN',
} as const satisfies Record<EvidenceFlag, string>;

export function parseEvidenceFlagValue(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  if (['1', 'true', 'yes', 'on'].includes(value.toLowerCase())) return true;
  if (['0', 'false', 'no', 'off'].includes(value.toLowerCase())) return false;
  return null;
}

export function resolvePublicEvidenceFlag(
  flag: EvidenceFlag,
  env: EvidenceFlagEnv = process.env,
): EvidenceFlagState {
  const key = publicEvidenceFlagEnvKeys[flag];
  const value = parseEvidenceFlagValue(env[key]);

  if (value !== null) {
    return { enabled: value, source: `env:${key}` };
  }

  return { enabled: evidenceFlagDefaults[flag], source: 'release-manifest:2026-06-01' };
}

export function resolvePublicEvidenceFlags(
  env: EvidenceFlagEnv = process.env,
): Record<EvidenceFlag, EvidenceFlagState> {
  return {
    caseStudies: resolvePublicEvidenceFlag('caseStudies', env),
    customerStories: resolvePublicEvidenceFlag('customerStories', env),
    externalLogoRail: resolvePublicEvidenceFlag('externalLogoRail', env),
    outcomeStats: resolvePublicEvidenceFlag('outcomeStats', env),
    samplePack: resolvePublicEvidenceFlag('samplePack', env),
    workspaceSignIn: resolvePublicEvidenceFlag('workspaceSignIn', env),
  };
}

export const evidenceFlags: Record<EvidenceFlag, boolean> = {
  caseStudies: resolvePublicEvidenceFlag('caseStudies').enabled,
  customerStories: resolvePublicEvidenceFlag('customerStories').enabled,
  externalLogoRail: resolvePublicEvidenceFlag('externalLogoRail').enabled,
  outcomeStats: resolvePublicEvidenceFlag('outcomeStats').enabled,
  samplePack: resolvePublicEvidenceFlag('samplePack').enabled,
  workspaceSignIn: resolvePublicEvidenceFlag('workspaceSignIn').enabled,
};
