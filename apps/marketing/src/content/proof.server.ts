import { resolveEvidenceFlags } from '@/content/evidence-flags.server';
import {
  filterApprovedEvidence,
  proofPopulation,
  type ProofCaseStudy,
  type ProofLogo,
  type ProofOutcomeStat,
  type ProofPopulation,
} from '@/content/proof';

export type RenderableProofPopulation = {
  logoRail: ProofLogo[];
  caseStudies: ProofCaseStudy[];
  outcomeStats: ProofOutcomeStat[];
};

export function getRenderableProofPopulation(
  population: ProofPopulation = proofPopulation,
): RenderableProofPopulation {
  const flags = resolveEvidenceFlags();

  return {
    logoRail: flags.externalLogoRail.enabled ? filterApprovedEvidence(population.logoRail) : [],
    caseStudies: flags.caseStudies.enabled ? filterApprovedEvidence(population.caseStudies) : [],
    outcomeStats: flags.outcomeStats.enabled ? filterApprovedEvidence(population.outcomeStats) : [],
  };
}
