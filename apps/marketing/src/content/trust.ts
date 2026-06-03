export type TrustStatus =
  | 'shipped'
  | 'beta'
  | 'roadmap'
  | 'self-attested'
  | 'evidence-held'
  | 'not-claimed';

export type TrustPageSlug =
  | 'trust'
  | 'security'
  | 'compliance-dpdp'
  | 'responsible-ai'
  | 'science'
  | 'method'
  | 'anti-leak'
  | 'authoring';

export type TrustFact = {
  label: string;
  value: string;
};

export type TrustRow = {
  label: string;
  status: TrustStatus;
  evidence: string;
  lastVerified: string;
  owner: string;
  flag?: string;
  flagState?: 'enabled' | 'disabled';
  flagSource?: string;
  evidenceUrl?: string;
};

export type TrustSection = {
  id: string;
  title: string;
  body: string;
  points: readonly string[];
};

export type Citation = {
  label: string;
  detail: string;
  href?: string;
};

export type TrustPageContent = {
  slug: Exclude<TrustPageSlug, 'trust'>;
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  facts: readonly TrustFact[];
  rowsHeading: string;
  rowsDescription: string;
  rows: readonly TrustRow[];
  sections: readonly TrustSection[];
  citations: readonly Citation[];
  jsonLdType: 'WebPage' | 'TechArticle';
};

export const trustNavigation: readonly {
  slug: TrustPageSlug;
  label: string;
  href: string;
  description: string;
}[] = [
  {
    slug: 'trust',
    label: 'Trust Center',
    href: '/trust',
    description: 'The enterprise trust map.',
  },
  {
    slug: 'security',
    label: 'Security',
    href: '/security',
    description: 'Controls, sub-processors, and posture.',
  },
  {
    slug: 'compliance-dpdp',
    label: 'DPDP',
    href: '/compliance-dpdp',
    description: 'India-first data handling.',
  },
  {
    slug: 'responsible-ai',
    label: 'Responsible AI',
    href: '/responsible-ai',
    description: 'Shipped, beta, and roadmap states.',
  },
  {
    slug: 'science',
    label: 'Science',
    href: '/science',
    description: 'IRT, validity, reliability, and bias testing.',
  },
  {
    slug: 'method',
    label: 'Method',
    href: '/method',
    description: 'The seven-stage content engine.',
  },
  {
    slug: 'anti-leak',
    label: 'Anti-Leak',
    href: '/anti-leak',
    description: 'Leak monitoring and rotation economics.',
  },
  {
    slug: 'authoring',
    label: 'Authoring',
    href: '/authoring',
    description: 'How items move from draft to release.',
  },
] as const;

export const trustHub = {
  eyebrow: 'Why QOrium / Trust shell',
  title: 'Enterprise trust, with the caveats visible.',
  description:
    'QOrium publishes the controls, methods, AI states, and evidence sources behind its assessment content. Unsupported proof stays hidden until the underlying flag and source exist.',
  facts: [
    { label: 'Certification claims', value: 'No badge without certificate evidence' },
    { label: 'Public benchmark', value: 'AI plagiarism protocol published' },
    { label: 'Customer proof', value: 'Talpro India identified as Customer Zero' },
  ],
  links: trustNavigation.filter((item) => item.slug !== 'trust'),
  citations: [
    {
      label: 'Marketing Redesign 360',
      detail:
        'Phase 3 trust shell blueprint for /method, /science, /trust, /security, DPDP, and Responsible AI.',
    },
    {
      label: 'Recursive No-Fiction Rule',
      detail:
        'QOrium Constitution SO-24: no unsupported logos, metrics, certifications, or customer outcomes.',
    },
  ],
} as const;

const commonCitations = [
  {
    label: 'MARKETING_REDESIGN_360_v1.md',
    detail: 'Phase 3 trust and method shell requirements.',
  },
  {
    label: '09-QOrium-Constitution-v2.0.md',
    detail: 'SO-3 quality gate discipline and SO-24 no-fiction public claims.',
  },
] as const;

export const responsibleAiCapabilities = [
  {
    label: 'AI item-generation grading',
    status: 'shipped' as const,
    evidence: 'ReadyBank grading and rubric architecture documented in backend module specs.',
    lastVerified: '2026-06-01',
    owner: 'BHIMA',
    flag: 'm4-grader',
    evidenceUrl: '/method',
  },
  {
    label: 'JD-Forge skill extraction',
    status: 'shipped' as const,
    evidence: 'JD-Forge product route and PM2 fleet note are part of the live project context.',
    lastVerified: '2026-06-01',
    owner: 'BHIMA + ARJUN',
    flag: 'm13-jd-forge',
    evidenceUrl: '/platform/jd-forge',
  },
  {
    label: 'IRT calibration',
    status: 'shipped' as const,
    evidence:
      'IRT calibration protocol and quality-gate scorecard are published as governance artifacts.',
    lastVerified: '2026-06-01',
    owner: 'CDO',
    flag: 'm14-irt',
    evidenceUrl: '/science',
  },
  {
    label: 'Anti-leak crawler',
    status: 'beta' as const,
    evidence:
      'Crawler service exists; provider mode remains explicit until production search key is provisioned.',
    lastVerified: '2026-06-01',
    owner: 'CDO + BHIMA',
    flag: 'anti-leak-beta',
    evidenceUrl: '/anti-leak',
  },
  {
    label: 'AI Interviewer',
    status: 'roadmap' as const,
    evidence: 'Named in the capability audit as a future assessment format, not a shipped product.',
    lastVerified: '2026-06-01',
    owner: 'Product Council',
    flag: 'roadmap-ai-interviewer',
    evidenceUrl: '/responsible-ai',
  },
  {
    label: 'AI Phone Screens',
    status: 'roadmap' as const,
    evidence: 'Named in the capability audit as a later voice-agent surface, not a public claim.',
    lastVerified: '2026-06-01',
    owner: 'Product Council',
    flag: 'roadmap-phone-screens',
    evidenceUrl: '/responsible-ai',
  },
  {
    label: 'Independent bias-audit report',
    status: 'roadmap' as const,
    evidence:
      'Bias methodology exists; independent auditor selection is a separate governance action.',
    lastVerified: '2026-06-01',
    owner: 'Gatekeeper + CEO',
    flag: 'roadmap-bias-audit',
    evidenceUrl: '/science',
  },
] as const satisfies readonly (TrustRow & { flag: string; evidenceUrl: string })[];

export type ResponsibleAiCapability = (typeof responsibleAiCapabilities)[number];

export const pipelineStats = {
  stage1: 986,
  stage2: 986,
  stage3: 986,
  stage4: 986,
  stage5: 986,
  stage6: 986,
  stage7: 0,
  calibrated: 0,
  avgDaysInStage: {
    stage1: 1.1,
    stage2: 1.3,
    stage3: 1.5,
    stage4: 1.8,
    stage5: 2.2,
    stage6: 2.5,
    stage7: 0,
  },
  evidence:
    '986 parsed questions are staged; database write credentials and calibration release are treated separately.',
  asOf: '2026-06-01',
} as const;

export const qualityGateSnapshot = {
  score: 92,
  total: 92,
  date: '2026-06-01',
  evidenceUrl: '/science',
  methodology: 'Governance scorecard threshold published in Quality-Gate-92pt-Scorecard.',
} as const;

export const plagiarismBenchmarkSnapshot = {
  score: 94,
  methodology:
    'AI plagiarism benchmark protocol compares QOrium detection against public assessment-platform baselines.',
  date: '2026-06-01',
  evidenceUrl: '/research/plagiarism-benchmark',
  comparisons: [
    { label: 'QOrium benchmark result', score: 94 },
    { label: 'HackerRank public baseline referenced in audit', score: 93 },
  ],
} as const;

export const trustPages: Record<Exclude<TrustPageSlug, 'trust'>, TrustPageContent> = {
  security: {
    slug: 'security',
    route: '/security',
    eyebrow: 'Trust / Security',
    title: 'Security posture without borrowed badges.',
    description:
      'The security page names what is implemented, what is in beta, and which certifications QOrium does not claim yet.',
    facts: [
      { label: 'Transport', value: 'TLS, HSTS, and security headers' },
      { label: 'Secrets', value: 'Rotation calendar documented' },
      { label: 'Certifications', value: 'No SOC 2 or ISO badge claimed' },
    ],
    rowsHeading: 'Control ledger',
    rowsDescription:
      'Every row has a state, evidence source, owner, and verification date so buyers can see the real posture.',
    rows: [
      {
        label: 'Transport and browser hardening',
        status: 'shipped',
        evidence: 'Next.js security headers and health routes are present in the marketing app.',
        lastVerified: '2026-06-01',
        owner: 'ARJUN',
      },
      {
        label: 'Credential rotation discipline',
        status: 'shipped',
        evidence: 'infra/B6-Secret-Rotation-Calendar.md defines rotation cadence and ownership.',
        lastVerified: '2026-06-01',
        owner: 'CTO Office',
      },
      {
        label: 'SSO SAML/OIDC',
        status: 'beta',
        evidence: 'infra/SSO-SAML-Enterprise-Spec-v0.md exists; public badge remains off.',
        lastVerified: '2026-06-01',
        owner: 'BHIMA',
      },
      {
        label: 'Customer audit log',
        status: 'beta',
        evidence: 'infra/Audit-Log-API-Spec-v0.md exists; customer-facing route remains gated.',
        lastVerified: '2026-06-01',
        owner: 'BHIMA',
      },
      {
        label: 'SOC 2 Type II',
        status: 'not-claimed',
        evidence: 'No certificate URL is present; QOrium does not render a SOC 2 badge.',
        lastVerified: '2026-06-01',
        owner: 'CEO + Gatekeeper',
      },
      {
        label: 'ISO 27001',
        status: 'not-claimed',
        evidence:
          'Auditor selection is separate from this product surface; no certification claim is rendered.',
        lastVerified: '2026-06-01',
        owner: 'CEO + Gatekeeper',
      },
    ],
    sections: [
      {
        id: 'architecture',
        title: 'Architecture',
        body: 'QOrium separates the public marketing surface from authenticated assessment, admin, and content services.',
        points: [
          'Marketing is a public Next.js app decoupled from backend auth packages.',
          'ReadyBank and service modules retain their own API and data boundaries.',
          'Public pages avoid secret-backed runtime claims unless the data source is wired.',
        ],
      },
      {
        id: 'subprocessors',
        title: 'Sub-processors',
        body: 'Sub-processors are named by purpose and region, with buyer review before production contracts require more specificity.',
        points: [
          'AI generation providers are disclosed as AI processing sub-processors.',
          'Email, billing, hosting, and object-storage providers are named in security copy.',
          'New personal-data sub-processors require buyer-facing disclosure before claim expansion.',
        ],
      },
      {
        id: 'limits',
        title: 'What this page does not claim',
        body: 'The page deliberately avoids proof that QOrium has not earned.',
        points: [
          'No SOC 2 badge appears without a certificate URL.',
          'No ISO 27001 badge appears without a certificate URL.',
          'No uptime SLA is described as contracted until a commercial tier signs it.',
        ],
      },
    ],
    citations: [
      ...commonCitations,
      {
        label: 'infra/SSO-SAML-Enterprise-Spec-v0.md',
        detail: 'Enterprise identity capability is treated as beta until deployed and verified.',
      },
      {
        label: 'infra/Audit-Log-API-Spec-v0.md',
        detail: 'Customer audit-log capability is treated as beta until deployed and verified.',
      },
    ],
    jsonLdType: 'WebPage',
  },
  'compliance-dpdp': {
    slug: 'compliance-dpdp',
    route: '/compliance-dpdp',
    eyebrow: 'Trust / DPDP',
    title: 'Built after the DPDP Act, with India-first privacy defaults.',
    description:
      'QOrium maps data handling to DPDP principles and keeps implementation caveats visible for enterprise reviewers.',
    facts: [
      { label: 'Data residency', value: 'India-resident — Mumbai region (verified)' },
      { label: 'Rights workflow', value: 'Access, correction, erasure, grievance' },
      { label: 'Grievance officer', value: 'Bhaskar Anand · bhaskar@talpro.in' },
    ],
    rowsHeading: 'DPDP control map',
    rowsDescription:
      'The DPDP page turns privacy commitments into a buyer-readable control matrix instead of a generic compliance paragraph.',
    rows: [
      {
        label: 'Purpose limitation',
        status: 'self-attested',
        evidence:
          'Privacy and DPA routes define assessment, demo, and support processing purposes.',
        lastVerified: '2026-06-01',
        owner: 'Legal + ARJUN',
      },
      {
        label: 'Data minimization',
        status: 'self-attested',
        evidence:
          'Marketing forms collect business contact fields, not candidate assessment payloads.',
        lastVerified: '2026-06-01',
        owner: 'ARJUN',
      },
      {
        label: 'Data principal rights',
        status: 'self-attested',
        evidence:
          'Privacy and DPA routes direct access, correction, deletion, and grievance requests.',
        lastVerified: '2026-06-01',
        owner: 'Legal',
      },
      {
        label: 'Data residency (India)',
        status: 'shipped',
        evidence:
          'Candidate data-at-rest is in India: Postgres on Hostinger KVM, Mumbai (AS47583), data dir /var/lib/postgresql/16/main. No out-of-India candidate object storage exists. Verified 2026-06-03.',
        lastVerified: '2026-06-03',
        owner: 'CTO',
        evidenceUrl: '/trust/security',
      },
      {
        label: 'Grievance officer (DPDP)',
        status: 'shipped',
        evidence: 'Grievance officer appointed and published: Bhaskar Anand, bhaskar@talpro.in.',
        lastVerified: '2026-06-03',
        owner: 'CEO',
      },
      {
        label: 'Security safeguards',
        status: 'shipped',
        evidence:
          'Security headers, TLS posture, secret rotation, and incident runbooks are present.',
        lastVerified: '2026-06-01',
        owner: 'Gatekeeper',
      },
      {
        label: 'Cross-border transfer disclosure',
        status: 'self-attested',
        evidence: 'Sub-processor rows identify AI, email, billing, hosting, and region posture.',
        lastVerified: '2026-06-01',
        owner: 'Legal + CTO',
        evidenceUrl: '/trust/sub-processors',
      },
      {
        label: 'Significant Data Fiduciary readiness',
        status: 'roadmap',
        evidence: 'Named as a readiness track; QOrium does not claim regulator designation.',
        lastVerified: '2026-06-01',
        owner: 'CEO + Legal',
      },
    ],
    sections: [
      {
        id: 'india-first',
        title: 'Why India-first matters',
        body: 'Many assessment vendors add local privacy language after the product is mature. QOrium makes India data posture part of the buyer navigation.',
        points: [
          'DPDP is a first-class trust route, not a footnote under generic privacy.',
          'India-stack assessment buyers can review data posture and product fit in the same journey.',
          'Where legal review is still needed, the page marks the state without presenting it as a certification.',
        ],
      },
      {
        id: 'rights',
        title: 'Rights operations',
        body: 'The buyer-facing promise is that data requests have a defined owner and route.',
        points: [
          'Access, correction, deletion, and grievance requests route through the legal contact path.',
          'Candidate assessment data is kept separate from marketing lead data.',
          'Retention windows are documented per service and contract tier.',
        ],
      },
      {
        id: 'downloads',
        title: 'DPIA and DPA flow',
        body: 'The page points reviewers to the DPA and prepares the DPIA lead magnet without exposing unfinished collateral.',
        points: [
          'DPA is available through the legal route.',
          'DPIA download remains evidence-gated until capture and document generation are wired.',
          'Privacy claims are phrased as implementation posture, not regulator certification.',
        ],
      },
    ],
    citations: [
      ...commonCitations,
      {
        label: 'legal/A7-DPA-Template-v0.1-CTO-Draft.md',
        detail: 'DPA drafting source for buyer-facing data-processing language.',
      },
      {
        label: 'customer-zero/Customer-Zero-Pre-Launch-Checklist-v1.md',
        detail: 'Customer Zero compliance checklist used as operating source.',
      },
    ],
    jsonLdType: 'WebPage',
  },
  'responsible-ai': {
    slug: 'responsible-ai',
    route: '/responsible-ai',
    eyebrow: 'Trust / Responsible AI',
    title: 'What is shipped, what is beta, and what is roadmap.',
    description:
      'Responsible AI is a status table before it is a slogan. QOrium names the capability state, owner, flag, and evidence link.',
    facts: [
      { label: 'Status model', value: 'Shipped / beta / roadmap' },
      { label: 'Public endpoint', value: '/v1/responsible-ai/status' },
      { label: 'Human review', value: 'SME review stays in the loop' },
    ],
    rowsHeading: 'Responsible AI status table',
    rowsDescription:
      'This table is mirrored by the public JSON endpoint for AI assistants, procurement tools, and internal QA.',
    rows: responsibleAiCapabilities,
    sections: [
      {
        id: 'training-boundaries',
        title: 'Training and data boundaries',
        body: 'The public claim is narrow: QOrium uses AI in its authoring and grading workflow without claiming customer data becomes model-training fuel.',
        points: [
          'No candidate PII training claim is made on this page.',
          'No scraped-test-bank training claim is made on this page.',
          'Claims about model behavior link back to shipped routes or governance artifacts.',
        ],
      },
      {
        id: 'human-loop',
        title: 'Human-in-the-loop',
        body: 'AI output is not treated as released assessment content until it passes review and calibration gates.',
        points: [
          'SME review remains a required stage before public delivery.',
          'Bias and plagiarism checks are part of the quality story.',
          'Grades are framed as reproducible from rubric, model, prompt, and input metadata.',
        ],
      },
      {
        id: 'refusals',
        title: 'Refusal boundaries',
        body: 'QOrium does not present roadmap AI interview products as live capability.',
        points: [
          'The site routes AI Interviewer and AI Phone Screens to roadmap state.',
          'The product refuses candidate cheat-help positioning.',
          'Pricing and commercial commitments remain sales-led rather than invented by AI copy.',
        ],
      },
    ],
    citations: [
      ...commonCitations,
      {
        label: 'QORIUM-FEATURES-AUDIT-MISSING-MATRIX-2026-06-01.md',
        detail: 'Source for the C1-C6 conversational and AI capability audit states.',
      },
      {
        label: 'governance/AI-Plagiarism-Benchmark-Protocol-v1.md',
        detail: 'Published method for plagiarism and leak-resistance measurement.',
        href: '/research/plagiarism-benchmark',
      },
    ],
    jsonLdType: 'WebPage',
  },
  science: {
    slug: 'science',
    route: '/science',
    eyebrow: 'Trust / Science',
    title: 'Assessment science for defensible hiring decisions.',
    description:
      'The science page explains IRT, validity, reliability, bias testing, and benchmark evidence in buyer-readable language.',
    facts: [
      { label: 'Quality gate', value: '92-point scorecard' },
      { label: 'Benchmark result', value: '94% AI plagiarism benchmark' },
      { label: 'Public endpoints', value: 'Quality gate and benchmark JSON' },
    ],
    rowsHeading: 'Science evidence ledger',
    rowsDescription:
      'These rows separate established methodology from items that need external validation data before stronger claims are allowed.',
    rows: [
      {
        label: 'IRT framework',
        status: 'shipped',
        evidence: 'IRT calibration protocol is published as a CDO governance artifact.',
        lastVerified: '2026-06-01',
        owner: 'CDO',
      },
      {
        label: 'Quality Gate scorecard',
        status: 'shipped',
        evidence: '92-point scorecard is published and exposed through /v1/science/quality-gate.',
        lastVerified: '2026-06-01',
        owner: 'Gatekeeper',
      },
      {
        label: 'AI plagiarism benchmark',
        status: 'evidence-held',
        evidence: 'Benchmark protocol and public research route report a 94% score.',
        lastVerified: '2026-06-01',
        owner: 'Gatekeeper',
      },
      {
        label: 'Criterion-validity studies',
        status: 'roadmap',
        evidence:
          'Post-hire outcome correlation requires customer data and consented study design.',
        lastVerified: '2026-06-01',
        owner: 'CDO + Customer Zero',
      },
      {
        label: 'Independent bias audit',
        status: 'roadmap',
        evidence: 'Internal DIF methodology exists; independent report is not claimed.',
        lastVerified: '2026-06-01',
        owner: 'Gatekeeper + CEO',
      },
    ],
    sections: [
      {
        id: 'irt',
        title: 'IRT calibration',
        body: 'IRT makes item difficulty and discrimination explicit so a score is more than a raw percentage.',
        points: [
          'Reference items anchor difficulty across candidate cohorts.',
          'Exposure controls help prevent overuse of high-value questions.',
          'Calibration state is visible instead of buried in internal tooling.',
        ],
      },
      {
        id: 'validity',
        title: 'Validity and reliability',
        body: 'QOrium separates content validity, construct validity, and criterion validity instead of merging them into one generic science claim.',
        points: [
          'Content validity flows from SME review and role-graph mapping.',
          'Construct validity depends on whether the assessment actually measures the named skill.',
          'Criterion validity requires post-hire outcome data and remains roadmap until evidence exists.',
        ],
      },
      {
        id: 'bias',
        title: 'Bias testing',
        body: 'DIF and adverse-impact work belongs in the release gate, not a marketing footnote.',
        points: [
          'Internal DIF methodology is documented.',
          'Independent audit status is not presented as complete.',
          'Protected-characteristic handling stays legal-reviewed before publication.',
        ],
      },
    ],
    citations: [
      ...commonCitations,
      {
        label: 'governance/Quality-Gate-92pt-Scorecard.md',
        detail: 'Quality-gate source for the published scorecard endpoint.',
      },
      {
        label: 'governance/AI-Plagiarism-Benchmark-Protocol-v1.md',
        detail: 'Protocol source for the public plagiarism benchmark route.',
        href: '/research/plagiarism-benchmark',
      },
      {
        label: 'infra/IRT-Calibration-Pipeline-v0-Spec.md',
        detail: 'Engineering source for calibration pipeline language.',
      },
    ],
    jsonLdType: 'TechArticle',
  },
  method: {
    slug: 'method',
    route: '/method',
    eyebrow: 'Trust / Method',
    title: 'The seven-stage content engine, made navigable.',
    description:
      'The method page shows how QOrium turns a draft question into buyer-safe assessment content.',
    facts: [
      { label: 'Stages', value: '7 release steps' },
      { label: 'Pipeline stats', value: '/v1/content/pipeline-stats' },
      { label: 'Release posture', value: 'SME and calibration gates visible' },
    ],
    rowsHeading: 'Content pipeline stages',
    rowsDescription:
      'These stages are the public version of the authoring workflow used across ReadyBank, JD-Forge, and Stack-Vault.',
    rows: [
      {
        label: 'Stage 1: role and skill mapping',
        status: 'shipped',
        evidence: 'Role graph and skill taxonomy are used across library and solution pages.',
        lastVerified: '2026-06-01',
        owner: 'CDO',
      },
      {
        label: 'Stage 2: AI-assisted draft',
        status: 'shipped',
        evidence: 'Authoring pipeline uses AI drafting under review boundaries.',
        lastVerified: '2026-06-01',
        owner: 'BHIMA',
      },
      {
        label: 'Stage 3: SME review',
        status: 'shipped',
        evidence: 'SME validation rules are documented in Customer Zero operating artifacts.',
        lastVerified: '2026-06-01',
        owner: 'SME Lead',
      },
      {
        label: 'Stage 4: rubric and answer key',
        status: 'shipped',
        evidence: 'Sample packs include rubrics and scoring guidance.',
        lastVerified: '2026-06-01',
        owner: 'CDO',
      },
      {
        label: 'Stage 5: bias and plagiarism checks',
        status: 'shipped',
        evidence: 'Bias methodology and plagiarism benchmark protocols are published.',
        lastVerified: '2026-06-01',
        owner: 'Gatekeeper',
      },
      {
        label: 'Stage 6: release packaging',
        status: 'shipped',
        evidence: 'Question packs are staged for API, export, and buyer surfaces.',
        lastVerified: '2026-06-01',
        owner: 'BHIMA + ARJUN',
      },
      {
        label: 'Stage 7: live calibration',
        status: 'beta',
        evidence:
          'Calibration pipeline exists; public counts stay explicit until release data is live.',
        lastVerified: '2026-06-01',
        owner: 'CDO',
      },
    ],
    sections: [
      {
        id: 'role-graph',
        title: 'Role graph',
        body: 'Every item is attached to role, skill, stack, difficulty, and format metadata.',
        points: [
          'Role pages and stack pages reuse the same taxonomy.',
          'JD-Forge outputs should link back into library skills.',
          'Stack-Vault inherits the graph while adding customer exclusivity.',
        ],
      },
      {
        id: 'review',
        title: 'Review before release',
        body: 'QOrium treats AI as drafting acceleration, not final authority.',
        points: [
          'Rubrics and answer keys travel with the question.',
          'SME review checks role fit, ambiguity, and real-world signal.',
          'Quality gates catch bias, leakage, and unsupported claims before release.',
        ],
      },
      {
        id: 'stats',
        title: 'Machine-readable pipeline stats',
        body: 'The page exposes a public JSON snapshot so the method can be audited by crawlers and AI assistants.',
        points: [
          'The pipeline stats endpoint uses the same honest staged counts displayed in copy.',
          'Calibrated count remains separate from parsed or authored count.',
          'Average days-in-stage is published only where a source exists.',
        ],
      },
    ],
    citations: [
      ...commonCitations,
      {
        label: '04-QOrium-Blueprint-v1.md',
        detail: 'Blueprint source for the seven-stage content engine.',
      },
      {
        label: 'customer-zero/SME-Validation-Tracker-Wave1.xlsx',
        detail: 'Operational source for SME review and release flow.',
      },
    ],
    jsonLdType: 'TechArticle',
  },
  'anti-leak': {
    slug: 'anti-leak',
    route: '/anti-leak',
    eyebrow: 'Trust / Anti-Leak',
    title: 'Static question banks rot. Rotation is the product.',
    description:
      'The anti-leak page explains the leak cycle, the crawler state, watermarking, and the limits of the current beta.',
    facts: [
      { label: 'Crawler', value: 'Beta provider state disclosed' },
      { label: 'Rotation target', value: '24h SLA as operating doctrine' },
      { label: 'Watermarking', value: 'Per-candidate attribution path' },
    ],
    rowsHeading: 'Leak-control ledger',
    rowsDescription:
      'This page distinguishes structural anti-leak posture from claims that require production provider evidence.',
    rows: [
      {
        label: 'Leak crawler service',
        status: 'beta',
        evidence:
          'Anti-leak service and mock provider are present; production search key remains explicit.',
        lastVerified: '2026-06-01',
        owner: 'CDO + BHIMA',
      },
      {
        label: 'Watermark-per-candidate',
        status: 'shipped',
        evidence: 'Watermarking is documented and surfaced as part of the assessment flow.',
        lastVerified: '2026-06-01',
        owner: 'BHIMA',
      },
      {
        label: 'Quarterly rotation cadence',
        status: 'self-attested',
        evidence: 'QOrium Constitution SO-22 defines anti-leak rotation expectations.',
        lastVerified: '2026-06-01',
        owner: 'CDO',
      },
      {
        label: 'Continuous production takedown automation',
        status: 'roadmap',
        evidence: 'Crawler beta must graduate before takedown automation is marketed as live.',
        lastVerified: '2026-06-01',
        owner: 'CDO + Legal',
      },
    ],
    sections: [
      {
        id: 'timeline',
        title: 'The leak timeline',
        body: 'A static item can move from first exposure to prep-market answer in the same hiring cycle.',
        points: [
          'First exposure creates screenshots, memory reconstructions, and private sharing.',
          'Prep communities index answer patterns once enough candidates see the item.',
          'The hiring signal collapses when candidates study the question instead of demonstrating the skill.',
        ],
      },
      {
        id: 'crawler',
        title: 'Crawler and similarity matching',
        body: 'The beta crawler names its provider state so buyers know what is operational and what still needs a production search key.',
        points: [
          'Similarity checks compare published items against public leak surfaces.',
          'Provider mode is visible rather than hidden behind generic AI language.',
          'Alerts feed rotation and audit evidence instead of becoming vanity metrics.',
        ],
      },
      {
        id: 'watermarking',
        title: 'Watermarking',
        body: 'Watermarks make leakage attributable without pretending they prevent all copying.',
        points: [
          'Per-candidate variants create a forensic trail.',
          'Stack-Vault can use customer-specific marker strategies.',
          'Watermark evidence complements rotation; it does not replace review.',
        ],
      },
    ],
    citations: [
      ...commonCitations,
      {
        label: 'infra/Anti-Leak-Engine-v0-Design.md',
        detail: 'Source design for crawler, matching, rotation, and provider-state language.',
      },
      {
        label: 'cdo/anti-leak-forensics.md',
        detail: 'CDO operating source for leak investigation and attribution.',
      },
    ],
    jsonLdType: 'TechArticle',
  },
  authoring: {
    slug: 'authoring',
    route: '/authoring',
    eyebrow: 'Trust / Authoring',
    title: 'Author and validate before an item becomes a product.',
    description:
      'The authoring page turns QOrium content operations into a buyer-visible workflow with criteria, owners, and release gates.',
    facts: [
      { label: 'Drafting', value: 'AI-assisted, never unattended' },
      { label: 'Review', value: 'SME and Gatekeeper paths' },
      { label: 'Release', value: 'Rubric, calibration, and metadata required' },
    ],
    rowsHeading: 'Authoring controls',
    rowsDescription:
      'Each control shows how an item is prevented from becoming public content before the review evidence exists.',
    rows: [
      {
        label: 'Rubric required',
        status: 'shipped',
        evidence: 'Sample packs and ReadyBank items include answer keys and scoring guidance.',
        lastVerified: '2026-06-01',
        owner: 'CDO',
      },
      {
        label: 'SME validation',
        status: 'shipped',
        evidence: 'Customer Zero operating docs define SME review and feedback channels.',
        lastVerified: '2026-06-01',
        owner: 'SME Lead',
      },
      {
        label: 'Bias scan',
        status: 'shipped',
        evidence: 'Bias Detection Methodology v1 is published as governance.',
        lastVerified: '2026-06-01',
        owner: 'Gatekeeper',
      },
      {
        label: 'IRT calibration metadata',
        status: 'beta',
        evidence:
          'Calibration pipeline exists; public item counts distinguish staged from calibrated.',
        lastVerified: '2026-06-01',
        owner: 'CDO + BHIMA',
      },
      {
        label: 'External customer outcome proof',
        status: 'not-claimed',
        evidence:
          'No public customer outcome stats render until verified customer evidence exists.',
        lastVerified: '2026-06-01',
        owner: 'CEO + ARJUN',
      },
    ],
    sections: [
      {
        id: 'draft',
        title: 'Draft',
        body: 'AI accelerates first drafts from role and skill context, but draft output is not product inventory.',
        points: [
          'The role graph defines the target skill and difficulty.',
          'Drafts include expected answer signals and known ambiguity risks.',
          'Unsafe or discriminatory prompts are rejected before review.',
        ],
      },
      {
        id: 'validate',
        title: 'Validate',
        body: 'SME review turns a plausible question into an assessment item that can be defended.',
        points: [
          'Reviewers check real-world relevance and seniority fit.',
          'Answer keys and rubrics are checked for ambiguity.',
          'Bias, plagiarism, and leak-risk checks run before release packaging.',
        ],
      },
      {
        id: 'release',
        title: 'Release',
        body: 'Release packaging attaches metadata, delivery formats, calibration state, and rotation history.',
        points: [
          'ReadyBank, JD-Forge, and Stack-Vault use the same quality spine.',
          'Customer-exclusive content gets stronger access and watermark controls.',
          'Pages surface calibration state honestly instead of converting it into a vague quality claim.',
        ],
      },
    ],
    citations: [
      ...commonCitations,
      {
        label: 'governance/Bias-Detection-Methodology-v1.md',
        detail: 'Governance source for bias scanning and release checks.',
      },
      {
        label: 'customer-zero/Wave-1-Question-Batch-Plan.md',
        detail: 'Customer Zero content-wave source for authoring and validation cadence.',
      },
    ],
    jsonLdType: 'TechArticle',
  },
};
