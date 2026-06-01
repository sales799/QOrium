import {
  responsibleAiCapabilities,
  type ResponsibleAiCapability,
  type TrustRow,
  type TrustStatus,
} from '@/content/trust';

type FlagState = {
  enabled: boolean;
  source: string;
};

const releaseFlagDefaults = {
  'm4-grader': true,
  'm13-jd-forge': true,
  'm14-irt': true,
  'anti-leak-beta': true,
  'roadmap-ai-interviewer': false,
  'roadmap-phone-screens': false,
  'roadmap-bias-audit': false,
} as const satisfies Record<ResponsibleAiCapability['flag'], boolean>;

function envKey(flag: string) {
  return `QORIUM_TRUST_FLAG_${flag.toUpperCase().replaceAll('-', '_')}`;
}

function parseEnvFlag(value: string | undefined): boolean | null {
  if (value === undefined) return null;
  if (['1', 'true', 'yes', 'on'].includes(value.toLowerCase())) return true;
  if (['0', 'false', 'no', 'off'].includes(value.toLowerCase())) return false;
  return null;
}

export function resolveTrustFlag(flag: ResponsibleAiCapability['flag']): FlagState {
  const key = envKey(flag);
  const envValue = parseEnvFlag(process.env[key]);
  if (envValue !== null) {
    return { enabled: envValue, source: `env:${key}` };
  }

  return { enabled: releaseFlagDefaults[flag], source: 'release-manifest:2026-06-01' };
}

function statusFromFlag(
  declaredStatus: ResponsibleAiCapability['status'],
  enabled: boolean,
): TrustStatus {
  if (declaredStatus === 'roadmap') return 'roadmap';
  if (declaredStatus === 'shipped') return enabled ? 'shipped' : 'beta';
  if (declaredStatus === 'beta') return enabled ? 'beta' : 'roadmap';
  return declaredStatus;
}

export function resolveResponsibleAiRows(): TrustRow[] {
  return responsibleAiCapabilities.map((capability) => {
    const flag = resolveTrustFlag(capability.flag);

    return {
      ...capability,
      status: statusFromFlag(capability.status, flag.enabled),
      flagState: flag.enabled ? ('enabled' as const) : ('disabled' as const),
      flagSource: flag.source,
    };
  });
}
