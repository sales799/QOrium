import { siteConfig } from './site.config';

export type CalibrationStatus = 'IRT-calibrated' | 'Beta' | 'Authored';

export type LibrarySkillPage = {
  slug: string;
  path: string;
  name: string;
  category: string;
  family: string;
  stackFamily: string;
  seoMeta: {
    title: string;
    description: string;
    h1: string;
  };
  calibration: {
    status: CalibrationStatus;
    label: string;
    itemCountTotal: number;
    itemCountCalibrated: number;
    lastCalibratedAt: string | null;
  };
  roles: string[];
  stacks: string[];
  relatedSkills: string[];
  synonyms: string[];
  sampleQuestions: string[];
  measures: string[];
};

export type RolePage = {
  slug: string;
  path: string;
  title: string;
  name: string;
  family: 'eng' | 'data' | 'devops' | 'non-tech' | 'india-enterprise';
  seniorityLevels: string[];
  description: string;
  coreSkills: string[];
  recommendedSkills: string[];
  stacks: string[];
};

export type StackPage = {
  slug: string;
  path: string;
  title: string;
  name: string;
  family: string;
  vendor: string;
  regionRelevance: string[];
  description: string;
  indiaCallout: string;
  roles: string[];
  skills: string[];
};

export type CompetitorPage = {
  slug: string;
  path: string;
  title: string;
  competitor: string;
  summary: string;
  whereCompetitorIsBetter: string[];
  qoriumEdges: string[];
  matrix: Array<{
    dimension: string;
    competitor: string;
    qorium: string;
    competitorPosition: string;
    qoriumPosition: string;
    evidenceStatus: 'internal-source' | 'live-review-required';
  }>;
  sourceNote: string;
};

// Honest item-statistics label shown on every library page and surface.
// Guardrail (CTO 2026-06-03): never "empirically calibrated" / "certified".
export const IRT_LABEL = 'Model-estimated · calibrating with live use';

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// The 21 canonical QOrium library skills.
// Source of truth: content.skills in the qorium DB, filtered to
// NOT (metadata ? 'merged_into') — 21 canonical of 511 total (consolidated 2026-06-03).
// `canonical` carries the DB slug for traceability; public copy uses buyer-facing names.
type CanonicalSkillSeed = {
  slug: string;
  name: string;
  category: string;
  family: string;
  canonical: string;
  roles: string[];
  stacks: string[];
  related: string[];
  synonyms?: string[];
  measures: string[];
  samples: string[];
};

const canonicalSkillSeeds: CanonicalSkillSeed[] = [
  {
    slug: 'python',
    name: 'Python',
    category: 'Programming',
    family: 'tech',
    canonical: 'senior-python',
    roles: ['Backend Developer', 'Data Engineer', 'Platform Engineer'],
    stacks: ['python', 'aws'],
    related: ['sql', 'data-engineering', 'aws'],
    measures: [
      'Production Python judgment: error handling, typing, and dependency hygiene.',
      'Data-structure and algorithmic tradeoffs under realistic constraints.',
      'Reasoning about correctness and risk, communicated without overclaiming.',
    ],
    samples: [
      'Diagnose a memory leak in a long-running Python service and name the root cause.',
      'Refactor a synchronous batch job for safe concurrency; justify the approach.',
      'Choose the next best action when a dependency upgrade breaks a production path.',
    ],
  },
  {
    slug: 'java',
    name: 'Java',
    category: 'Programming',
    family: 'tech',
    canonical: 'senior-java',
    roles: ['Backend Developer', 'Core Banking Engineer', 'Platform Engineer'],
    stacks: ['java', 'cloud-native'],
    related: ['sql', 'aws', 'devops-sre'],
    measures: [
      'JVM behaviour, concurrency, and memory model under load.',
      'API and service-design tradeoffs in enterprise codebases.',
      'Defensible reasoning about reliability and failure modes.',
    ],
    samples: [
      'Explain a thread-safety risk a senior interviewer should test for.',
      'Debug a realistic Spring service work sample and locate the fault.',
      'Decide between two persistence strategies for a high-write workload.',
    ],
  },
  {
    slug: 'react',
    name: 'React',
    category: 'Frontend',
    family: 'tech',
    canonical: 'senior-react',
    roles: ['Frontend Developer', 'Full Stack Developer'],
    stacks: ['react'],
    related: ['technical-communication', 'design-review-participation', 'python'],
    synonyms: ['React.js', 'Frontend Engineering'],
    measures: [
      'Component architecture, state management, and rendering tradeoffs.',
      'Accessibility and performance judgment in real UI work.',
      'Clear communication of frontend risk and assumptions.',
    ],
    samples: [
      'Identify the cause of an avoidable re-render in a realistic component tree.',
      'Choose a data-fetching strategy for a latency-sensitive screen; justify it.',
      'Review a pull request and name the highest-risk change.',
    ],
  },
  {
    slug: 'sql',
    name: 'SQL',
    category: 'Data',
    family: 'tech',
    canonical: 'senior-sql',
    roles: ['Data Analyst', 'Backend Developer', 'Data Engineer'],
    stacks: ['sql'],
    related: ['data-engineering', 'python', 'java'],
    measures: [
      'Query correctness, set logic, and index-aware performance.',
      'Schema and normalization tradeoffs for real workloads.',
      'Reasoning about data integrity and edge cases.',
    ],
    samples: [
      'Rewrite a slow report query and explain the performance win.',
      'Spot the bug in a join that silently drops rows.',
      'Decide when denormalization is justified for a read-heavy path.',
    ],
  },
  {
    slug: 'data-engineering',
    name: 'Data Engineering',
    category: 'Data',
    family: 'tech',
    canonical: 'senior-sqldata',
    roles: ['Data Engineer', 'Analytics Engineer', 'Platform Engineer'],
    stacks: ['sql', 'python', 'aws'],
    related: ['sql', 'python', 'aws'],
    measures: [
      'Pipeline design, idempotency, and data-quality controls.',
      'Batch vs streaming tradeoffs under cost and freshness constraints.',
      'Reasoning about lineage, backfills, and failure recovery.',
    ],
    samples: [
      'Design an idempotent backfill for a late-arriving data source.',
      'Diagnose why a daily pipeline produces duplicate rows.',
      'Choose between batch and streaming for a near-real-time dashboard.',
    ],
  },
  {
    slug: 'aws',
    name: 'AWS Cloud',
    category: 'Cloud',
    family: 'tech',
    canonical: 'senior-aws',
    roles: ['Cloud Engineer', 'DevOps Engineer', 'Platform Engineer'],
    stacks: ['aws', 'cloud-native'],
    related: ['devops-sre', 'java', 'python'],
    measures: [
      'Cloud architecture, IAM, and cost-aware service selection.',
      'Reliability and scaling tradeoffs across managed services.',
      'Security and least-privilege reasoning in real deployments.',
    ],
    samples: [
      'Right-size a workload that is over-provisioned; justify the change.',
      'Diagnose an IAM misconfiguration blocking a deployment.',
      'Choose a data store for a spiky, write-heavy workload.',
    ],
  },
  {
    slug: 'devops-sre',
    name: 'DevOps & SRE',
    category: 'Cloud',
    family: 'tech',
    canonical: 'senior-devops',
    roles: ['DevOps Engineer', 'Site Reliability Engineer', 'Cloud Engineer'],
    stacks: ['cloud-native', 'kubernetes', 'aws'],
    related: ['aws', 'java', 'python'],
    synonyms: ['SRE', 'Platform Reliability'],
    measures: [
      'CI/CD, observability, and incident-response judgment.',
      'Reliability tradeoffs: SLOs, error budgets, and rollout safety.',
      'Reasoning about blast radius and recovery under pressure.',
    ],
    samples: [
      'Triage a production incident from a realistic alert and metric set.',
      'Design a safe rollout for a high-risk schema migration.',
      'Decide what to automate first to cut on-call toil.',
    ],
  },
  {
    slug: 'embedded-c',
    name: 'Embedded C (Automotive)',
    category: 'Automotive',
    family: 'tech',
    canonical: 'senior-embedded-automotive',
    roles: ['Embedded Software Engineer', 'Automotive Firmware Engineer'],
    stacks: ['embedded-automotive'],
    related: ['java', 'devops-sre', 'technical-communication'],
    measures: [
      'Memory-constrained C, interrupts, and real-time behaviour.',
      'Safety and reliability judgment for automotive contexts.',
      'Reasoning about hardware/software boundaries and failure modes.',
    ],
    samples: [
      'Find the defect in an ISR that intermittently corrupts shared state.',
      'Choose a buffering strategy for a real-time sensor stream.',
      'Explain a watchdog-timer risk a senior reviewer should test.',
    ],
  },
  {
    slug: 'salesforce',
    name: 'Salesforce Development',
    category: 'Enterprise apps',
    family: 'tech',
    canonical: 'salesforce-developer-senior',
    roles: ['Salesforce Developer', 'Enterprise Application Consultant'],
    stacks: ['salesforce'],
    related: ['salesforce-admin', 'salesforce-cpq', 'sql'],
    measures: [
      'Apex, triggers, and governor-limit-aware design.',
      'Integration and data-model tradeoffs on the platform.',
      'Reasoning about maintainability in customised orgs.',
    ],
    samples: [
      'Refactor an Apex trigger that hits governor limits at scale.',
      'Diagnose a sharing-rule gap exposing records to the wrong users.',
      'Choose between declarative and code approaches for a requirement.',
    ],
  },
  {
    slug: 'salesforce-admin',
    name: 'Salesforce Administration',
    category: 'Enterprise apps',
    family: 'tech',
    canonical: 'senior-sf',
    roles: ['Salesforce Administrator', 'Enterprise Application Consultant'],
    stacks: ['salesforce'],
    related: ['salesforce', 'salesforce-cpq', 'technical-communication'],
    measures: [
      'Security model, profiles, permission sets, and sharing.',
      'Declarative automation (Flow) design and tradeoffs.',
      'Reasoning about data governance and change safety.',
    ],
    samples: [
      'Design a permission model for a new business unit; justify least privilege.',
      'Diagnose a Flow that updates records inconsistently.',
      'Decide how to roll out a field change without breaking reports.',
    ],
  },
  {
    slug: 'salesforce-cpq',
    name: 'Salesforce CPQ',
    category: 'Enterprise apps',
    family: 'tech',
    canonical: 'senior-salesforce-cpq',
    roles: ['Salesforce CPQ Consultant', 'Revenue Operations Engineer'],
    stacks: ['salesforce'],
    related: ['salesforce', 'salesforce-admin', 'sql'],
    measures: [
      'Product/price rules, bundles, and quote-line logic.',
      'Approval and discounting design for real deal flows.',
      'Reasoning about CPQ maintainability and edge cases.',
    ],
    samples: [
      'Debug a price rule that mis-calculates a bundled discount.',
      'Design an approval path for non-standard discounting.',
      'Choose a configuration approach for a multi-tier product.',
    ],
  },
  {
    slug: 'sap-abap',
    name: 'SAP ABAP',
    category: 'India-stack',
    family: 'india-stack',
    canonical: 'senior-sap-abap',
    roles: ['SAP ABAP Consultant', 'GCC Platform Engineer'],
    stacks: ['sap', 'sap-abap'],
    related: ['oracle-hcm-cloud', 'sql', 'java'],
    measures: [
      'ABAP performance, modularisation, and clean-core judgment.',
      'Integration with SAP modules and external systems.',
      'Reasoning about upgrade-safe customisation.',
    ],
    samples: [
      'Optimise a report that times out on large datasets.',
      'Find the defect in a BAPI call that commits partial data.',
      'Decide between an enhancement and a modification; justify it.',
    ],
  },
  {
    slug: 'oracle-hcm-cloud',
    name: 'Oracle HCM Cloud',
    category: 'India-stack',
    family: 'india-stack',
    canonical: 'senior-oracle-hcm-cloud',
    roles: ['Oracle HCM Consultant', 'Enterprise Application Consultant'],
    stacks: ['oracle'],
    related: ['sap-abap', 'finacle-flexcube', 'sql'],
    measures: [
      'HCM data model, fast formulas, and security configuration.',
      'Integration and reporting (HCM Extracts / OTBI) tradeoffs.',
      'Reasoning about quarterly-update-safe configuration.',
    ],
    samples: [
      'Diagnose a fast formula returning the wrong eligibility result.',
      'Design a secure role for a regional HR team.',
      'Choose an integration pattern for downstream payroll.',
    ],
  },
  {
    slug: 'finacle-flexcube',
    name: 'Finacle / Flexcube (Core Banking)',
    category: 'BFSI',
    family: 'india-stack',
    canonical: 'senior-finacle-flexcube',
    roles: ['Core Banking Engineer', 'BFSI Implementation Consultant'],
    stacks: ['bfsi'],
    related: ['oracle-hcm-cloud', 'sql', 'java'],
    measures: [
      'Core-banking data model, batch (EOD/BOD), and transaction integrity.',
      'Customisation and interface judgment in regulated contexts.',
      'Reasoning about reconciliation and audit requirements.',
    ],
    samples: [
      'Diagnose an EOD batch that leaves accounts in an inconsistent state.',
      'Design an interface for a regulator-mandated report.',
      'Decide how to handle a failed posting without breaking integrity.',
    ],
  },
  {
    slug: 'ai-prompt-engineering',
    name: 'AI Prompt Engineering',
    category: 'AI-era',
    family: 'ai-era',
    canonical: 'ai-prompt-engineer-senior',
    roles: ['AI Engineer', 'Product Engineer'],
    stacks: ['ai-era', 'python'],
    related: ['ai-pair-coding', 'ai-tool-use-judgment', 'python'],
    measures: [
      'Prompt design, evaluation, and failure-mode awareness.',
      'Grounding, guardrails, and hallucination-risk judgment.',
      'Reasoning about when not to use an LLM.',
    ],
    samples: [
      'Improve a prompt that produces inconsistent structured output.',
      'Design an evaluation for a summarisation task.',
      'Decide when a deterministic rule beats an LLM call.',
    ],
  },
  {
    slug: 'ai-pair-coding',
    name: 'AI Pair Coding',
    category: 'Applied judgment',
    family: 'aptitude',
    canonical: 'wave3-ai-pair-coding',
    roles: ['Software Engineer', 'AI Engineer'],
    stacks: ['ai-era'],
    related: ['ai-tool-use-judgment', 'ai-prompt-engineering', 'design-review-participation'],
    measures: [
      'Effective, critical use of AI coding assistants.',
      'Verifying and correcting AI-generated code under review.',
      'Reasoning about when to accept, edit, or reject a suggestion.',
    ],
    samples: [
      'Review an AI-generated patch and identify what it got wrong.',
      'Decide how to verify an AI suggestion before merging.',
      'Spot a subtle security issue an assistant introduced.',
    ],
  },
  {
    slug: 'ai-tool-use-judgment',
    name: 'AI Tool-Use Judgment',
    category: 'Applied judgment',
    family: 'aptitude',
    canonical: 'wave3-ai-tool-use-judgement',
    roles: ['Engineer', 'Analyst', 'Operations'],
    stacks: ['ai-era'],
    related: ['ai-pair-coding', 'ai-prompt-engineering', 'cognitive-ability'],
    measures: [
      'Choosing the right tool and verifying its output.',
      'Recognising tool limits and failure modes.',
      'Reasoning about responsibility for AI-assisted decisions.',
    ],
    samples: [
      'Decide whether a task is appropriate for an AI tool at all.',
      'Catch an over-confident tool output that is subtly wrong.',
      'Choose between two tools for a constrained task; justify it.',
    ],
  },
  {
    slug: 'cognitive-ability',
    name: 'Cognitive Ability',
    category: 'Aptitude',
    family: 'aptitude',
    canonical: 'wave3-cognitive-ability',
    roles: ['All roles', 'Graduate hiring'],
    stacks: [],
    related: ['personality-sjt', 'ai-tool-use-judgment', 'technical-communication'],
    measures: [
      'Numerical, logical, and abstract reasoning.',
      'Pattern recognition and problem decomposition.',
      'Reasoning under time and ambiguity.',
    ],
    samples: [
      'Complete a logical sequence and explain the rule.',
      'Solve a constrained numerical problem from a real scenario.',
      'Identify the assumption that makes an argument hold.',
    ],
  },
  {
    slug: 'design-review-participation',
    name: 'Design Review Participation',
    category: 'Applied judgment',
    family: 'aptitude',
    canonical: 'wave3-design-review-participation',
    roles: ['Senior Engineer', 'Tech Lead'],
    stacks: [],
    related: ['technical-communication', 'ai-pair-coding', 'cognitive-ability'],
    measures: [
      'Spotting risk and gaps in a proposed design.',
      'Giving specific, actionable, respectful feedback.',
      'Reasoning about tradeoffs rather than asserting preference.',
    ],
    samples: [
      'Review a design doc and name the highest-risk decision.',
      'Ask the question that exposes a hidden assumption.',
      'Propose a smaller first step for a risky design.',
    ],
  },
  {
    slug: 'personality-sjt',
    name: 'Personality & Situational Judgment',
    category: 'Behavioural',
    family: 'aptitude',
    canonical: 'wave3-personality-sjt',
    roles: ['All roles', 'Team fit'],
    stacks: [],
    related: ['cognitive-ability', 'technical-communication', 'design-review-participation'],
    measures: [
      'Workplace judgment in realistic situations.',
      'Collaboration, accountability, and conflict handling.',
      'Consistency of self-report with situational choices.',
    ],
    samples: [
      'Choose the best response to a missed-deadline scenario.',
      'Decide how to escalate a disagreement with a peer.',
      'Pick the action that best balances speed and quality.',
    ],
  },
  {
    slug: 'technical-communication',
    name: 'Technical Communication',
    category: 'Communication',
    family: 'aptitude',
    canonical: 'wave3-technical-communication',
    roles: ['All roles', 'Client-facing engineering'],
    stacks: [],
    related: ['design-review-participation', 'personality-sjt', 'cognitive-ability'],
    measures: [
      'Explaining a technical decision to a non-expert.',
      'Writing that is precise, scoped, and free of overclaiming.',
      'Reasoning made visible: assumptions, risk, and evidence.',
    ],
    samples: [
      'Summarise an incident for a business stakeholder.',
      'Rewrite an ambiguous ticket into a testable spec.',
      'Explain a tradeoff to a customer without jargon.',
    ],
  },
];

export const librarySkills: LibrarySkillPage[] = canonicalSkillSeeds.map((seed) => ({
  slug: seed.slug,
  path: `/library/${seed.slug}`,
  name: seed.name,
  category: seed.category,
  family: seed.family,
  stackFamily: seed.family.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  seoMeta: {
    title: `${seed.name} Assessment | QOrium Library`,
    description: `QOrium ${seed.name} assessment: what it measures, calibration status (${IRT_LABEL}), role mapping, and sample questions.`,
    h1: `${seed.name} Assessment`,
  },
  calibration: {
    status: 'Beta',
    itemCountTotal: 40,
    itemCountCalibrated: 0,
    lastCalibratedAt: null,
    label: IRT_LABEL,
  },
  roles: seed.roles,
  stacks: seed.stacks,
  relatedSkills: seed.related,
  synonyms: seed.synonyms ?? [],
  sampleQuestions: seed.samples,
  measures: seed.measures,
}));

const roleSeeds = [
  'software',
  'data',
  'devops',
  'non-tech',
  'react-developer',
  'java-developer',
  'python-developer',
  'devops-engineer',
  'data-engineer',
  'salesforce-developer',
  'sap-abap-consultant',
  'oracle-hcm-consultant',
  'embedded-engineer',
  'core-banking-consultant',
  'cloud-engineer',
  'ai-engineer',
  'salesforce-cpq-consultant',
] as const;

const roleTitles: Partial<Record<(typeof roleSeeds)[number], string>> = {
  software: 'Software Engineering',
  data: 'Data / ML / Analytics',
  devops: 'DevOps / SRE / Cloud',
  'non-tech': 'Non-Tech Functions',
};

const roleFamilies: Partial<Record<(typeof roleSeeds)[number], RolePage['family']>> = {
  software: 'eng',
  data: 'data',
  devops: 'devops',
  'non-tech': 'non-tech',
  'sap-abap-consultant': 'india-enterprise',
  'oracle-hcm-consultant': 'india-enterprise',
  'core-banking-consultant': 'india-enterprise',
};

const stackSeeds = [
  'sap',
  'sap-abap',
  'salesforce',
  'oracle',
  'aws',
  'kubernetes',
  'react',
  'java',
  'python',
  'sql',
  'embedded-automotive',
  'bfsi',
  'ai-era',
  'cloud-native',
] as const;

const roleSkillMap: Partial<Record<(typeof roleSeeds)[number], string[]>> = {
  software: ['python', 'java', 'react'],
  data: ['sql', 'python', 'ai-prompt-engineering'],
  devops: ['devops-sre', 'aws', 'python'],
  'non-tech': ['ai-prompt-engineering', 'sql', 'technical-communication'],
  'react-developer': ['react', 'technical-communication', 'ai-prompt-engineering'],
  'java-developer': ['java', 'sql', 'aws'],
  'python-developer': ['python', 'sql', 'aws'],
  'devops-engineer': ['devops-sre', 'aws', 'python'],
  'data-engineer': ['sql', 'python', 'aws'],
  'salesforce-developer': ['salesforce', 'salesforce-cpq', 'sql'],
  'sap-abap-consultant': ['sap-abap', 'sql', 'oracle-hcm-cloud'],
  'oracle-hcm-consultant': ['oracle-hcm-cloud', 'sql', 'finacle-flexcube'],
  'embedded-engineer': ['embedded-c', 'devops-sre', 'sql'],
  'core-banking-consultant': ['finacle-flexcube', 'sql', 'java'],
  'cloud-engineer': ['aws', 'devops-sre', 'python'],
  'ai-engineer': ['ai-prompt-engineering', 'python', 'sql'],
  'salesforce-cpq-consultant': ['salesforce-cpq', 'salesforce', 'sap-abap'],
};

const roleStackMap: Partial<Record<(typeof roleSeeds)[number], string[]>> = {
  software: ['java', 'react', 'cloud-native'],
  data: ['sql', 'python', 'ai-era'],
  devops: ['cloud-native', 'kubernetes', 'aws'],
  'non-tech': ['ai-era', 'salesforce'],
  'react-developer': ['react'],
  'java-developer': ['java', 'cloud-native'],
  'python-developer': ['python', 'aws'],
  'devops-engineer': ['cloud-native', 'kubernetes', 'aws'],
  'data-engineer': ['sql', 'python', 'aws'],
  'salesforce-developer': ['salesforce'],
  'sap-abap-consultant': ['sap', 'sap-abap'],
  'oracle-hcm-consultant': ['oracle'],
  'embedded-engineer': ['embedded-automotive'],
  'core-banking-consultant': ['bfsi'],
  'cloud-engineer': ['aws', 'kubernetes', 'cloud-native'],
  'ai-engineer': ['ai-era', 'python'],
  'salesforce-cpq-consultant': ['salesforce'],
};

const stackRoleMap: Record<(typeof stackSeeds)[number], string[]> = {
  sap: ['sap-abap-consultant'],
  'sap-abap': ['sap-abap-consultant'],
  salesforce: ['salesforce-developer', 'salesforce-cpq-consultant'],
  oracle: ['oracle-hcm-consultant'],
  aws: ['cloud-engineer', 'devops-engineer'],
  kubernetes: ['devops-engineer', 'cloud-engineer'],
  react: ['react-developer'],
  java: ['java-developer'],
  python: ['python-developer', 'data-engineer'],
  sql: ['data-engineer', 'core-banking-consultant'],
  'embedded-automotive': ['embedded-engineer'],
  bfsi: ['core-banking-consultant'],
  'ai-era': ['ai-engineer'],
  'cloud-native': ['devops-engineer', 'cloud-engineer'],
};

const stackSkillMap: Record<(typeof stackSeeds)[number], string[]> = {
  sap: ['sap-abap'],
  'sap-abap': ['sap-abap', 'sql'],
  salesforce: ['salesforce', 'salesforce-cpq'],
  oracle: ['oracle-hcm-cloud'],
  aws: ['aws', 'devops-sre'],
  kubernetes: ['devops-sre', 'aws'],
  react: ['react', 'technical-communication'],
  java: ['java', 'sql'],
  python: ['python', 'sql'],
  sql: ['sql', 'python'],
  'embedded-automotive': ['embedded-c'],
  bfsi: ['finacle-flexcube', 'sql'],
  'ai-era': ['ai-prompt-engineering', 'python'],
  'cloud-native': ['devops-sre', 'kubernetes', 'aws'],
};

function titleizeSlug(slug: string): string {
  const acronyms: Record<string, string> = {
    ai: 'AI',
    abap: 'ABAP',
    aws: 'AWS',
    bfsi: 'BFSI',
    cpq: 'CPQ',
    hcm: 'HCM',
    sap: 'SAP',
    sre: 'SRE',
    sql: 'SQL',
  };

  return slug
    .split('-')
    .map((part) => acronyms[part] ?? part[0]!.toUpperCase() + part.slice(1))
    .join(' ');
}

export const rolePages: RolePage[] = roleSeeds.map((seed, index) => {
  const slug = seed;
  const title = roleTitles[seed] ?? titleizeSlug(seed);
  const mappedSkills = roleSkillMap[seed];
  const family: RolePage['family'] =
    roleFamilies[seed] ??
    (index % 5 === 0
      ? 'india-enterprise'
      : index % 5 === 1
        ? 'eng'
        : index % 5 === 2
          ? 'devops'
          : index % 5 === 3
            ? 'data'
            : 'non-tech');
  return {
    slug,
    path: `/solutions/role/${slug}`,
    title,
    name: title,
    family,
    seniorityLevels: index % 3 === 0 ? ['mid', 'senior', 'lead'] : ['junior', 'mid', 'senior'],
    description: `${title} hiring battery with core skills, stack context, and calibration badges.`,
    coreSkills: mappedSkills?.slice(0, 2) ?? [
      librarySkills[index % librarySkills.length]!.slug,
      librarySkills[(index + 1) % librarySkills.length]!.slug,
    ],
    recommendedSkills: mappedSkills?.slice(2, 3) ?? [
      librarySkills[(index + 2) % librarySkills.length]!.slug,
    ],
    stacks: roleStackMap[seed] ?? [stackSeeds[index % stackSeeds.length]!],
  };
});

export const stackPages: StackPage[] = stackSeeds.map((slug) => {
  const title = titleizeSlug(slug);
  const isIndiaStack = ['sap', 'sap-abap', 'oracle', 'bfsi', 'embedded-automotive'].includes(slug);

  return {
    slug,
    path: `/solutions/stack/${slug}`,
    title,
    name: title,
    family: isIndiaStack ? 'India-stack' : 'Global stack',
    vendor: ['sap', 'sap-abap'].includes(slug)
      ? 'SAP'
      : ['oracle'].includes(slug)
        ? 'Oracle'
        : 'QOrium',
    regionRelevance: isIndiaStack ? ['IN', 'GCC'] : ['Global'],
    description: `${title} assessment modules mapped to roles and related skills.`,
    indiaCallout: isIndiaStack
      ? 'India enterprise hiring needs applied stack evidence that generic libraries often miss.'
      : 'Stack context links the stack surface to role-specific assessment batteries.',
    roles: stackRoleMap[slug],
    skills: stackSkillMap[slug],
  };
});

const competitors = [
  { slug: 'vervoe', competitor: 'Vervoe' },
  { slug: 'hackerrank', competitor: 'HackerRank' },
  { slug: 'mettl', competitor: 'Mercer Mettl' },
  { slug: 'imocha', competitor: 'iMocha' },
  { slug: 'coderbyte', competitor: 'Coderbyte' },
  { slug: 'testgorilla', competitor: 'TestGorilla' },
  { slug: 'wecp', competitor: 'WeCP' },
  { slug: 'adaface', competitor: 'Adaface' },
  { slug: 'karat', competitor: 'Karat' },
  { slug: 'devskiller', competitor: 'DevSkiller' },
  { slug: 'techcurators', competitor: 'TechCurators' },
] as const;

const comparisonDimensions = [
  'Public customer proof',
  'India enterprise stack depth',
  'Calibration visibility',
  'Anti-leak operations',
  'API and export delivery',
  'Custom vaulting',
  'Responsible AI posture',
  'Evidence-gated claims',
] as const;

// Hand-authored, buyer-POV comparison content for the 5 priority compare pages
// (PHASE_B_CONTENT_PACK 2026-06-03). Fair to the competitor; cites public posture;
// QOrium claims stay within shipped capability. Other competitors use the generic
// evidence-gated template below.
type CompetitorOverride = Pick<
  CompetitorPage,
  'summary' | 'whereCompetitorIsBetter' | 'qoriumEdges' | 'matrix' | 'sourceNote'
>;

const competitorOverrides: Record<string, CompetitorOverride> = {
  vervoe: {
    summary:
      'Vervoe is a strong AI-graded, skills-first platform with job simulations, advanced Gen-AI cheating detection, and an independent bias audit (Holistic AI, US/NYC LL-144). It has moved to enterprise-only, quote-based pricing.',
    whereCompetitorIsBetter: [
      'Mature job simulations and a longer track record at scale.',
      'A completed independent bias audit (US/NYC LL-144 framing).',
    ],
    qoriumEdges: [
      'You see why every score was given — reasoning trace and confidence band, not just a number.',
      'India-resident and DPDP-native, not a US tool bolted onto India.',
      'Transparent INR pricing instead of "book a demo".',
    ],
    matrix: [
      {
        dimension: 'Pricing',
        competitor: 'Enterprise-only, not public',
        qorium: 'Transparent INR, published',
      },
      {
        dimension: 'Data residency',
        competitor: 'Generic "regional"',
        qorium: 'India-resident (Mumbai), DPDP-native',
      },
      {
        dimension: 'Psychometric reliability',
        competitor: 'Not exposed',
        qorium: `Published: ${IRT_LABEL}`,
      },
      {
        dimension: 'Grading',
        competitor: 'AI, black-box',
        qorium: 'AI-graded with reasoning trace + confidence',
      },
      {
        dimension: 'Bias audit',
        competitor: 'Yes (US-framed)',
        qorium: 'Methodology published; independent audit scheduled',
      },
      {
        dimension: 'Content checks',
        competitor: '—',
        qorium: 'AI-verified (independent solve + key-match + leakage)',
      },
    ].map((r) => ({
      ...r,
      competitorPosition: r.competitor,
      qoriumPosition: r.qorium,
      evidenceStatus: 'internal-source' as const,
    })),
    sourceNote:
      'Competitor facts from Vervoe public materials; QOrium rows reflect shipped capability and the honest calibration label.',
  },
  mettl: {
    summary:
      'Mercer | Mettl is an India enterprise leader — a Gartner-recognised proctoring platform with a large question bank, coding simulators, psychometric batteries and IRT-based scoring. It is sales-led, with non-public pricing widely cited as expensive.',
    whereCompetitorIsBetter: [
      'Very broad enterprise footprint and proctoring maturity in India.',
      'Established psychometric batteries and integrations.',
    ],
    qoriumEdges: [
      'You can actually see the item statistics behind a score, with the honest calibration label.',
      'Self-serve and transparent, vs a procurement cycle.',
      'Modern, India-native product without enterprise-only pricing.',
    ],
    matrix: [
      {
        dimension: 'Pricing',
        competitor: 'Sales-led, not public',
        qorium: 'Transparent INR, published',
      },
      {
        dimension: 'IRT / psychometrics',
        competitor: 'Asserted (concept), not buyer-exposed',
        qorium: `Published reliability: ${IRT_LABEL}`,
      },
      {
        dimension: 'Grading',
        competitor: 'Auto-grade, no trace',
        qorium: 'AI-graded with reasoning trace',
      },
      {
        dimension: 'Buying motion',
        competitor: 'Demo + procurement',
        qorium: 'Self-serve, start in minutes',
      },
      { dimension: 'UX', competitor: 'Enterprise / legacy', qorium: 'Modern, India-built' },
    ].map((r) => ({
      ...r,
      competitorPosition: r.competitor,
      qoriumPosition: r.qorium,
      evidenceStatus: 'internal-source' as const,
    })),
    sourceNote:
      'Competitor facts from Mercer | Mettl public materials; QOrium rows reflect shipped capability and the honest calibration label.',
  },
  imocha: {
    summary:
      'iMocha offers a very large library (250k+ questions, 2,500+ skills) and "skills intelligence" for workforce mapping, with coding in 35+ languages and proctoring. Pricing starts around $400/mo with advanced AI insights gated.',
    whereCompetitorIsBetter: [
      'Very large library breadth and skills-intelligence tooling.',
      'Broad language coverage for coding assessments.',
    ],
    qoriumEdges: [
      'Defensibility you can publish to a tribunal, not just a big library.',
      'Reasoning-trace grading on every score.',
      'India-resident and INR-priced, built for Indian hiring law.',
    ],
    matrix: [
      {
        dimension: 'Library',
        competitor: 'Very large (breadth)',
        qorium: `Focused, consolidated, published reliability (${IRT_LABEL})`,
      },
      {
        dimension: 'IRT / defensibility',
        competitor: 'Not surfaced',
        qorium: `Published: ${IRT_LABEL}`,
      },
      {
        dimension: 'Grading',
        competitor: 'AI-assisted, no trace',
        qorium: 'AI-graded with reasoning trace',
      },
      {
        dimension: 'India residency / DPDP',
        competitor: 'Not surfaced',
        qorium: 'India-resident (Mumbai), DPDP-native',
      },
      { dimension: 'Pricing', competitor: 'From ~$400/mo (USD)', qorium: 'Transparent INR' },
    ].map((r) => ({
      ...r,
      competitorPosition: r.competitor,
      qoriumPosition: r.qorium,
      evidenceStatus: 'internal-source' as const,
    })),
    sourceNote:
      'Competitor facts from iMocha public materials; QOrium rows reflect shipped capability and the honest calibration label.',
  },
  coderbyte: {
    summary:
      'Coderbyte is a developer-focused coding-assessment tool with strong cheating/deepfake detection and transparent ~$10/candidate pricing (ATS integrations are a paid add-on). It is coding-only.',
    whereCompetitorIsBetter: [
      'Sharp, developer-first coding experience.',
      'Simple, transparent per-candidate pricing.',
    ],
    qoriumEdges: [
      'One platform for coding and the rest of the role — behavioural, cognitive, communication.',
      'Defensible scoring with the honest calibration label, not coding-only.',
      'India-resident and DPDP-native.',
    ],
    matrix: [
      {
        dimension: 'Scope',
        competitor: 'Coding only',
        qorium: 'Coding + role / behavioural / cognitive',
      },
      {
        dimension: 'Psychometric defensibility',
        competitor: 'None',
        qorium: `Published, ${IRT_LABEL}`,
      },
      {
        dimension: 'Grading',
        competitor: 'Code auto-grade',
        qorium: 'AI-graded with reasoning trace',
      },
      { dimension: 'ATS', competitor: 'Paid add-on', qorium: 'Included path (ats-bridge)' },
      {
        dimension: 'India residency',
        competitor: 'None',
        qorium: 'India-resident (Mumbai), DPDP-native',
      },
    ].map((r) => ({
      ...r,
      competitorPosition: r.competitor,
      qoriumPosition: r.qorium,
      evidenceStatus: 'internal-source' as const,
    })),
    sourceNote:
      'Competitor facts from Coderbyte public materials; QOrium rows reflect shipped capability and the honest calibration label.',
  },
  techcurators: {
    summary:
      'TechCurators offers human-SME-curated custom assessments (100+ skills) — high curation quality via an expert pool, delivered as a service rather than a self-serve product.',
    whereCompetitorIsBetter: [
      'Human-SME curation quality for bespoke assessments.',
      'Hands-on, services-led delivery for one-off needs.',
    ],
    qoriumEdges: [
      'A real product you control, not a services queue.',
      'Instant, repeatable, and integrated — JD to test in seconds with JD-Forge.',
      'Defensible AI grading at scale with the honest calibration label.',
    ],
    matrix: [
      {
        dimension: 'Delivery',
        competitor: 'Services / custom, quote-based',
        qorium: 'Self-serve product, start in minutes',
      },
      {
        dimension: 'Speed',
        competitor: 'Human turnaround',
        qorium: 'Instant assessment; JD → test in seconds (JD-Forge)',
      },
      { dimension: 'AI grading', competitor: '—', qorium: 'AI-graded with reasoning trace' },
      {
        dimension: 'Proctoring / anti-leak',
        competitor: '—',
        qorium: 'Anti-leak + Gen-AI detection',
      },
      { dimension: 'ATS / API', competitor: '—', qorium: 'ats-bridge + public API' },
    ].map((r) => ({
      ...r,
      competitorPosition: r.competitor,
      qoriumPosition: r.qorium,
      evidenceStatus: 'internal-source' as const,
    })),
    sourceNote:
      'Competitor facts from TechCurators public materials; QOrium rows reflect shipped capability and the honest calibration label.',
  },
};

export const competitorPages: CompetitorPage[] = competitors.map(({ slug, competitor }) => {
  const override = competitorOverrides[slug];
  if (override) {
    return {
      slug,
      path: `/compare/qorium-vs-${slug}`,
      title: `QOrium vs ${competitor}`,
      competitor,
      ...override,
    };
  }
  return {
    slug,
    path: `/compare/qorium-vs-${slug}`,
    title: `QOrium vs ${competitor}`,
    competitor,
    summary: `${competitor} is an established assessment category reference; QOrium compares honestly on structure rather than unsupported numeric claims.`,
    whereCompetitorIsBetter: [
      'More mature public customer proof where applicable.',
      'Broader self-serve footprint in existing global markets.',
    ],
    qoriumEdges: [
      'India-stack depth is first-class in the role graph.',
      `Calibration status is visible instead of implied (${IRT_LABEL}).`,
      'Unsupported claims stay gated until live review is complete.',
    ],
    matrix: comparisonDimensions.map((dimension, index) => ({
      dimension,
      competitor: index % 2 === 0 ? 'Strong established surface' : 'Category-recognized workflow',
      qorium:
        index % 2 === 0 ? 'India-first audit posture' : 'Role-graph and evidence-gated claims',
      competitorPosition:
        index % 2 === 0 ? 'Strong established surface' : 'Category-recognized workflow',
      qoriumPosition:
        index % 2 === 0 ? 'India-first audit posture' : 'Role-graph and evidence-gated claims',
      evidenceStatus: 'live-review-required',
    })),
    sourceNote:
      'Seeded from internal competitor audit notes; rows marked live review required must be verified before use as sales proof.',
  };
});

export const seoSitemapFamilies = {
  library: librarySkills.map((page) => ({ url: `${siteConfig.url}${page.path}`, slug: page.slug })),
  roles: rolePages.map((page) => ({ url: `${siteConfig.url}${page.path}`, slug: page.slug })),
  stacks: stackPages.map((page) => ({ url: `${siteConfig.url}${page.path}`, slug: page.slug })),
  compare: competitorPages.map((page) => ({
    url: `${siteConfig.url}${page.path}`,
    slug: page.slug,
  })),
};

export function getLibrarySkill(slug: string): LibrarySkillPage | undefined {
  return librarySkills.find((page) => page.slug === slugify(slug));
}

export function getRolePage(slug: string): RolePage | undefined {
  return rolePages.find((page) => page.slug === slugify(slug));
}

export function getStackPage(slug: string): StackPage | undefined {
  return stackPages.find((page) => page.slug === slugify(slug));
}

export function getCompetitorPage(slug: string): CompetitorPage | undefined {
  return competitorPages.find((page) => page.slug === slugify(slug));
}

export function legacyCompareSlugToVsSlug(slug: string) {
  const clean = slugify(slug.replace(/^qorium-vs-/, '').replace(/^vs-/, ''));
  return clean === 'mercer-mettl' ? 'mettl' : clean;
}
