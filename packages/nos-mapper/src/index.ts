/**
 * @qorium/nos-mapper — NSDC / NOS / NSQF competency mapper.
 *
 * Translates QOrium skill slugs ↔ India's National Skills Qualifications
 * Framework (NSQF levels 1–10) and Sector-Skills-Council National
 * Occupational Standards (NOS codes). Built as Sprint 1.7b per
 * `governance/Auto-Mode-Remote-Plan-v1.md` for India-Stack regulatory +
 * tender alignment.
 *
 * Contract: every public function returns `undefined` for unmapped input
 * rather than throwing. Mappings carry a `verification` field; treat
 * `pending` as illustrative until NSDC NQR cross-check lands (CC-02-A).
 */
export type { NsqfLevel, NsqfLevelDescriptor, NosMapping, SectorSlug } from './types.js';

export { NSQF_LEVELS, getNsqfLevel } from './nsqf-levels.js';
export { NOS_MAPPINGS } from './mappings.js';

import type { NosMapping, NsqfLevel, SectorSlug } from './types.js';
import { NOS_MAPPINGS } from './mappings.js';

/**
 * Find the NOS mapping for a QOrium skill slug. Optionally narrow by
 * sub-skill if the mapping is sub-skill-specific (most are not).
 */
export function findBySkill(
  qoriumSkillId: string,
  qoriumSubSkillId?: string,
): NosMapping | undefined {
  if (qoriumSubSkillId) {
    const subMatch = NOS_MAPPINGS.find(
      (m) => m.qoriumSkillId === qoriumSkillId && m.qoriumSubSkillId === qoriumSubSkillId,
    );
    if (subMatch) return subMatch;
  }
  return NOS_MAPPINGS.find((m) => m.qoriumSkillId === qoriumSkillId && !m.qoriumSubSkillId);
}

/**
 * Reverse lookup — every QOrium skill mapped to a given NOS code.
 * Returns an array because multiple skills can share a NOS (e.g. all
 * three of `senior-java`, `senior-react`, `senior-python` map to
 * `SSC/N0508`).
 */
export function findByNosCode(nosCode: string): readonly NosMapping[] {
  return NOS_MAPPINGS.filter((m) => m.nosCode === nosCode);
}

/**
 * Every QOrium skill at a given NSQF level.
 */
export function findByNsqfLevel(level: NsqfLevel): readonly NosMapping[] {
  return NOS_MAPPINGS.filter((m) => m.nsqfLevel === level);
}

/**
 * Every QOrium skill in a given sector (SSC, BFSI, ASC, ESSCI).
 */
export function findBySector(sector: SectorSlug): readonly NosMapping[] {
  return NOS_MAPPINGS.filter((m) => m.sector === sector);
}

/**
 * Coverage diagnostics — tells the caller how complete the mapping table
 * is. Used by the admin console (Sprint 1.8d) to surface "skills missing
 * NOS mapping" as a quality gate.
 */
export interface CoverageReport {
  totalMappings: number;
  verified: number;
  pending: number;
  bySector: Record<SectorSlug, number>;
  byNsqfLevel: Record<number, number>;
}

export function coverage(): CoverageReport {
  const bySector = { SSC: 0, BFSI: 0, ASC: 0, ESSCI: 0 } as Record<SectorSlug, number>;
  const byNsqfLevel: Record<number, number> = {};
  let verified = 0;
  for (const m of NOS_MAPPINGS) {
    bySector[m.sector] = (bySector[m.sector] ?? 0) + 1;
    byNsqfLevel[m.nsqfLevel] = (byNsqfLevel[m.nsqfLevel] ?? 0) + 1;
    if (m.verification === 'verified') verified += 1;
  }
  return {
    totalMappings: NOS_MAPPINGS.length,
    verified,
    pending: NOS_MAPPINGS.length - verified,
    bySector,
    byNsqfLevel,
  };
}
