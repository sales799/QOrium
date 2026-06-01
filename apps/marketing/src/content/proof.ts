import type { EvidenceFlag } from '@/content/evidence-flags';

export type EvidenceApprovalStatus =
  | 'approved'
  | 'evidence-held'
  | 'needs-permission'
  | 'instrumentation-pending';

export type EvidenceProofBase = {
  flag: EvidenceFlag;
  evidenceId: string;
  evidenceStatus: EvidenceApprovalStatus;
  evidenceSource: string;
  lastVerified: string;
};

export type ProofLogo = EvidenceProofBase & {
  name: string;
  label: string;
  href?: string;
};

export type ProofCaseStudy = EvidenceProofBase & {
  title: string;
  summary: string;
  href: string;
  buyer: string;
};

export type ProofOutcomeStat = EvidenceProofBase & {
  label: string;
  value: string;
  context: string;
};

export type ProofPopulation = {
  logoRail: readonly ProofLogo[];
  caseStudies: readonly ProofCaseStudy[];
  outcomeStats: readonly ProofOutcomeStat[];
};

export const proofPopulationPolicy = [
  'External logos require permission evidence before the logo rail can render.',
  'Case studies require a source artifact and approval before the case-study module can render.',
  'Outcome statistics require instrumented measurement before the stat module can render.',
] as const;

export const proofPopulation: ProofPopulation = {
  logoRail: [],
  caseStudies: [],
  outcomeStats: [],
} as const;

export function hasApprovedEvidence(item: EvidenceProofBase): boolean {
  return (
    item.evidenceStatus === 'approved' &&
    item.evidenceId.length > 0 &&
    item.evidenceSource.length > 0 &&
    /^\d{4}-\d{2}-\d{2}$/.test(item.lastVerified)
  );
}

export function filterApprovedEvidence<T extends EvidenceProofBase>(items: readonly T[]): T[] {
  return items.filter(hasApprovedEvidence);
}
