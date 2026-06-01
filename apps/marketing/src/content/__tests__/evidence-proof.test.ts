import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { EvidenceProofBand } from '@/components/marketing/EvidenceProof';
import { resolveEvidenceFlag } from '@/content/evidence-flags.server';
import { proofPopulation, type ProofLogo, type ProofOutcomeStat } from '@/content/proof';
import { getRenderableProofPopulation } from '@/content/proof.server';

const approvedLogo: ProofLogo = {
  flag: 'externalLogoRail',
  evidenceId: 'logo-approved-001',
  evidenceStatus: 'approved',
  evidenceSource: 'contracts/logo-permission.pdf',
  lastVerified: '2026-06-01',
  name: 'Approved Customer',
  label: 'Written permission held',
};

const pendingStat: ProofOutcomeStat = {
  flag: 'outcomeStats',
  evidenceId: 'outcome-pending-001',
  evidenceStatus: 'instrumentation-pending',
  evidenceSource: 'analytics/outcome-view.sql',
  lastVerified: '2026-06-01',
  label: 'Time-to-fill reduction',
  value: '8 days',
  context: 'Fixture only; must not render until approved.',
};

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('evidence-gated proof population', () => {
  it('keeps external proof flags off by default', () => {
    expect(resolveEvidenceFlag('externalLogoRail').enabled).toBe(false);
    expect(resolveEvidenceFlag('caseStudies').enabled).toBe(false);
    expect(resolveEvidenceFlag('outcomeStats').enabled).toBe(false);
    expect(resolveEvidenceFlag('samplePack').enabled).toBe(true);
  });

  it('allows env flags to flip only the requested proof surface', () => {
    vi.stubEnv('QORIUM_EVIDENCE_FLAG_EXTERNAL_LOGO_RAIL', 'true');

    expect(resolveEvidenceFlag('externalLogoRail').enabled).toBe(true);
    expect(resolveEvidenceFlag('externalLogoRail').source).toBe(
      'env:QORIUM_EVIDENCE_FLAG_EXTERNAL_LOGO_RAIL',
    );
    expect(resolveEvidenceFlag('caseStudies').enabled).toBe(false);
  });

  it('requires both a live flag and approved evidence metadata', () => {
    vi.stubEnv('QORIUM_EVIDENCE_FLAG_EXTERNAL_LOGO_RAIL', 'true');
    vi.stubEnv('QORIUM_EVIDENCE_FLAG_OUTCOME_STATS', 'true');

    const renderable = getRenderableProofPopulation({
      logoRail: [approvedLogo],
      caseStudies: [],
      outcomeStats: [pendingStat],
    });

    expect(renderable.logoRail).toEqual([approvedLogo]);
    expect(renderable.outcomeStats).toEqual([]);
  });

  it('renders nothing when the shipped production proof population is still ungated', () => {
    expect(getRenderableProofPopulation(proofPopulation)).toEqual({
      logoRail: [],
      caseStudies: [],
      outcomeStats: [],
    });

    expect(renderToStaticMarkup(createElement(EvidenceProofBand, { surface: 'home' }))).toBe('');
  });
});
