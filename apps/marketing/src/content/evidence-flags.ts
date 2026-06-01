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

export const evidenceFlagDefaults = {
  caseStudies: false,
  customerStories: false,
  externalLogoRail: false,
  outcomeStats: false,
  samplePack: true,
  workspaceSignIn: true,
} as const satisfies Record<EvidenceFlag, boolean>;

export const evidenceFlags: Record<EvidenceFlag, boolean> = evidenceFlagDefaults;

export function parseEvidenceFlagValue(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  if (['1', 'true', 'yes', 'on'].includes(value.toLowerCase())) return true;
  if (['0', 'false', 'no', 'off'].includes(value.toLowerCase())) return false;
  return null;
}
