import {
  evidenceFlagDefaults,
  parseEvidenceFlagValue,
  type EvidenceFlag,
  type EvidenceFlagState,
} from '@/content/evidence-flags';

type EvidenceFlagEnv = Partial<Record<string, string | undefined>>;

const evidenceFlagEnvKeys = {
  caseStudies: [
    'QORIUM_EVIDENCE_FLAG_CASE_STUDIES',
    'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_CASE_STUDIES',
  ],
  customerStories: [
    'QORIUM_EVIDENCE_FLAG_CUSTOMER_STORIES',
    'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_CUSTOMER_STORIES',
  ],
  externalLogoRail: [
    'QORIUM_EVIDENCE_FLAG_EXTERNAL_LOGO_RAIL',
    'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_EXTERNAL_LOGO_RAIL',
  ],
  outcomeStats: [
    'QORIUM_EVIDENCE_FLAG_OUTCOME_STATS',
    'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_OUTCOME_STATS',
  ],
  samplePack: ['QORIUM_EVIDENCE_FLAG_SAMPLE_PACK', 'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_SAMPLE_PACK'],
  workspaceSignIn: [
    'QORIUM_EVIDENCE_FLAG_WORKSPACE_SIGN_IN',
    'NEXT_PUBLIC_QORIUM_EVIDENCE_FLAG_WORKSPACE_SIGN_IN',
  ],
} as const satisfies Record<EvidenceFlag, readonly string[]>;

export function resolveEvidenceFlag(
  flag: EvidenceFlag,
  env: EvidenceFlagEnv = process.env,
): EvidenceFlagState {
  for (const key of evidenceFlagEnvKeys[flag]) {
    const value = parseEvidenceFlagValue(env[key]);
    if (value !== null) {
      return { enabled: value, source: `env:${key}` };
    }
  }

  return { enabled: evidenceFlagDefaults[flag], source: 'release-manifest:2026-06-01' };
}

export function resolveEvidenceFlags(
  env: EvidenceFlagEnv = process.env,
): Record<EvidenceFlag, EvidenceFlagState> {
  return {
    caseStudies: resolveEvidenceFlag('caseStudies', env),
    customerStories: resolveEvidenceFlag('customerStories', env),
    externalLogoRail: resolveEvidenceFlag('externalLogoRail', env),
    outcomeStats: resolveEvidenceFlag('outcomeStats', env),
    samplePack: resolveEvidenceFlag('samplePack', env),
    workspaceSignIn: resolveEvidenceFlag('workspaceSignIn', env),
  };
}
