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

const primarySkillSeeds = [
  [
    'javascript',
    'JavaScript',
    'Programming',
    'Backend Developer',
    'Full Stack Developer',
    'node-js',
  ],
  [
    'typescript',
    'TypeScript',
    'Programming',
    'Frontend Developer',
    'Full Stack Developer',
    'react',
  ],
  ['python', 'Python', 'Programming', 'Data Engineer', 'Backend Developer', 'python'],
  ['java', 'Java', 'Programming', 'Java Developer', 'Backend Developer', 'java'],
  ['go', 'Go', 'Programming', 'Platform Engineer', 'Backend Developer', 'cloud-native'],
  ['csharp', 'C#', 'Programming', '.NET Developer', 'Enterprise Application Developer', 'dotnet'],
  ['react', 'React', 'Frontend', 'React Developer', 'Frontend Developer', 'react'],
  ['nextjs', 'Next.js', 'Frontend', 'Frontend Developer', 'Product Engineer', 'react'],
  ['angular', 'Angular', 'Frontend', 'Frontend Developer', 'Enterprise UI Developer', 'angular'],
  ['vue', 'Vue', 'Frontend', 'Frontend Developer', 'Product Engineer', 'vue'],
  ['sql', 'SQL', 'Data', 'Data Analyst', 'Data Engineer', 'sql'],
  ['postgresql', 'PostgreSQL', 'Data', 'Data Engineer', 'Backend Developer', 'postgresql'],
  ['spark', 'Apache Spark', 'Data', 'Data Engineer', 'Analytics Engineer', 'spark'],
  ['power-bi', 'Power BI', 'Data', 'BI Analyst', 'Analytics Consultant', 'power-bi'],
  ['machine-learning', 'Machine Learning', 'AI-era', 'ML Engineer', 'Data Scientist', 'mlops'],
  ['llm-evaluation', 'LLM Evaluation', 'AI-era', 'AI Engineer', 'Prompt Engineer', 'ai-era'],
  [
    'ai-prompt-engineering',
    'AI Prompt Engineering',
    'AI-era',
    'AI Prompt Engineer',
    'Product Engineer',
    'ai-era',
  ],
  ['aws', 'AWS', 'Cloud', 'Cloud Engineer', 'DevOps Engineer', 'aws'],
  ['azure', 'Azure', 'Cloud', 'Cloud Engineer', 'Enterprise Platform Engineer', 'azure'],
  ['gcp', 'Google Cloud', 'Cloud', 'Cloud Engineer', 'Data Platform Engineer', 'gcp'],
  ['kubernetes', 'Kubernetes', 'Cloud', 'DevOps Engineer', 'SRE', 'kubernetes'],
  ['terraform', 'Terraform', 'Cloud', 'DevOps Engineer', 'Platform Engineer', 'terraform'],
  ['linux', 'Linux', 'Cloud', 'SRE', 'Infrastructure Engineer', 'linux'],
  ['devops-sre', 'DevOps/SRE', 'Cloud', 'SRE', 'Platform Engineer', 'sre'],
  ['cybersecurity', 'Cybersecurity', 'Security', 'Security Engineer', 'SOC Analyst', 'security'],
  [
    'application-security',
    'Application Security',
    'Security',
    'Security Engineer',
    'Backend Developer',
    'security',
  ],
  [
    'salesforce',
    'Salesforce',
    'Enterprise apps',
    'Salesforce Developer',
    'CRM Consultant',
    'salesforce',
  ],
  [
    'salesforce-cpq',
    'Salesforce CPQ',
    'Enterprise apps',
    'Salesforce CPQ Consultant',
    'Revenue Ops Engineer',
    'salesforce',
  ],
  [
    'servicenow',
    'ServiceNow',
    'Enterprise apps',
    'ServiceNow Developer',
    'ITSM Consultant',
    'servicenow',
  ],
  [
    'sap-abap',
    'SAP ABAP',
    'India-stack',
    'SAP ABAP Consultant',
    'GCC Platform Engineer',
    'sap-abap',
  ],
  ['sap-fico', 'SAP FICO', 'India-stack', 'SAP FICO Consultant', 'Finance Systems Analyst', 'sap'],
  ['sap-hcm', 'SAP HCM', 'India-stack', 'SAP HCM Consultant', 'HRIS Consultant', 'sap'],
  [
    'oracle-ebs',
    'Oracle E-Business Suite',
    'India-stack',
    'Oracle EBS Consultant',
    'ERP Developer',
    'oracle',
  ],
  [
    'oracle-hcm-cloud',
    'Oracle HCM Cloud',
    'India-stack',
    'Oracle HCM Consultant',
    'HRIS Consultant',
    'oracle',
  ],
  [
    'oracle-fusion',
    'Oracle Fusion',
    'India-stack',
    'Oracle Fusion Consultant',
    'ERP Cloud Consultant',
    'oracle',
  ],
  [
    'finacle-flexcube',
    'Finacle/Flexcube',
    'BFSI',
    'Core Banking Engineer',
    'BFSI Implementation Consultant',
    'bfsi',
  ],
  ['tcs-bancs', 'TCS BaNCS', 'BFSI', 'Core Banking Engineer', 'Capital Markets Consultant', 'bfsi'],
  ['murex', 'Murex', 'BFSI', 'Treasury Systems Consultant', 'Capital Markets Engineer', 'murex'],
  [
    'fix-protocol',
    'FIX Protocol',
    'BFSI',
    'Trading Systems Engineer',
    'Capital Markets Engineer',
    'fix-protocol',
  ],
  ['cobol', 'COBOL', 'Mainframe', 'Mainframe Developer', 'Core Banking Engineer', 'mainframe'],
  [
    'as400',
    'AS/400',
    'Mainframe',
    'AS/400 Developer',
    'Legacy Modernization Engineer',
    'mainframe',
  ],
  [
    'embedded-c',
    'Embedded C',
    'Automotive',
    'Embedded Software Engineer',
    'Automotive Firmware Engineer',
    'embedded-automotive',
  ],
  [
    'rtos',
    'RTOS',
    'Automotive',
    'Embedded Software Engineer',
    'Firmware Engineer',
    'embedded-automotive',
  ],
  [
    'autosar',
    'AUTOSAR',
    'Automotive',
    'Automotive Software Engineer',
    'Embedded Systems Architect',
    'embedded-automotive',
  ],
  ['qa-automation', 'QA Automation', 'Quality', 'QA Automation Engineer', 'SDET', 'qa'],
  ['playwright', 'Playwright', 'Quality', 'SDET', 'Frontend Test Engineer', 'qa'],
  [
    'product-analytics',
    'Product Analytics',
    'Product',
    'Product Analyst',
    'Growth Analyst',
    'analytics',
  ],
  [
    'business-analysis',
    'Business Analysis',
    'Non-tech',
    'Business Analyst',
    'Product Manager',
    'business-analysis',
  ],
  [
    'customer-success',
    'Customer Success',
    'Non-tech',
    'Customer Success Manager',
    'Implementation Consultant',
    'customer-success',
  ],
  [
    'technical-writing',
    'Technical Writing',
    'Non-tech',
    'Technical Writer',
    'Developer Advocate',
    'technical-writing',
  ],
] as const;

const skillFocusAreas = [
  ['fundamentals', 'Fundamentals', 'core concepts, syntax, and vocabulary'],
  ['debugging', 'Debugging', 'root-cause analysis and production triage'],
  ['architecture', 'Architecture', 'design tradeoffs and boundary choices'],
  ['security', 'Security', 'risk, access, and defensive controls'],
  ['performance', 'Performance', 'latency, scale, and efficiency'],
  ['testing', 'Testing', 'quality strategy and failure coverage'],
  ['integration', 'Integration', 'API, platform, and workflow fit'],
  ['data-modeling', 'Data Modeling', 'schema, entities, and relationships'],
  ['automation', 'Automation', 'repeatable workflows and operational scripts'],
  ['migration', 'Migration', 'legacy-to-modern transition planning'],
  ['observability', 'Observability', 'logs, metrics, traces, and alerting'],
  ['governance', 'Governance', 'controls, auditability, and review cadence'],
  ['troubleshooting', 'Troubleshooting', 'incident response and diagnostic judgment'],
  ['configuration', 'Configuration', 'environment, tenant, and policy setup'],
  ['reporting', 'Reporting', 'dashboards, insights, and stakeholder summaries'],
  ['compliance', 'Compliance', 'regional, privacy, and audit obligations'],
  ['workflow-design', 'Workflow Design', 'role-relevant process design'],
  ['quality-review', 'Quality Review', 'defect detection and rubric judgment'],
  [
    'stakeholder-communication',
    'Stakeholder Communication',
    'explanation, handoff, and escalation',
  ],
  ['scenario-practice', 'Scenario Practice', 'applied work samples and role simulations'],
] as const;

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/\+/g, 'plus')
    .replace(/#/g, 'sharp')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export const librarySkills: LibrarySkillPage[] = primarySkillSeeds.flatMap((seed, seedIndex) => {
  return skillFocusAreas.map((focus, focusIndex) => {
    const isSeededCanonical = focusIndex === 0 && seedIndex < 25;
    const slug = focusIndex === 0 ? seed[0] : `${seed[0]}-${focus[0]}`;
    const itemCountTotal = isSeededCanonical ? 40 : 0;
    const itemCountCalibrated = 0;
    const status: CalibrationStatus = itemCountTotal > 0 ? 'Beta' : 'Authored';
    const name = focusIndex === 0 ? seed[1] : `${seed[1]} ${focus[1]}`;
    const category = seed[2];
    const family = focusIndex === 0 ? seed[2] : `${seed[2]} · ${focus[1]}`;
    const relatedSameCategory = primarySkillSeeds
      .filter((related) => related[0] !== seed[0] && related[2] === seed[2])
      .slice(0, 4)
      .map((related) => related[0]);
    const relatedSameSkill = skillFocusAreas
      .filter((related) => related[0] !== focus[0])
      .slice(0, 2)
      .map((related) => (related[0] === 'fundamentals' ? seed[0] : `${seed[0]}-${related[0]}`));

    return {
      slug,
      path: `/library/${slug}`,
      name,
      category,
      family,
      stackFamily: seed[5],
      seoMeta: {
        title: `${name} Assessment | QOrium Library`,
        description: `Preview the QOrium ${name} assessment: skills measured, calibration status, role mapping, stack mapping, and sample questions for ${focus[2]}.`,
        h1: `${name} Assessment`,
      },
      calibration: {
        status,
        itemCountTotal,
        itemCountCalibrated,
        lastCalibratedAt: null,
        label:
          itemCountTotal > 0
            ? `${itemCountTotal} authored items seeded; calibration in progress.`
            : 'Authored stub; calibration in progress.',
      },
      roles: [seed[3], seed[4]],
      stacks: [seed[5]],
      relatedSkills: [...relatedSameCategory, ...relatedSameSkill].slice(0, 6),
      synonyms:
        focusIndex === 0
          ? seed[0] === 'javascript'
            ? ['ECMAScript', 'JS']
            : [seed[1]]
          : [`${seed[1]} ${focus[1]}`, `${focus[1]} in ${seed[1]}`],
      sampleQuestions: [
        `Explain a production ${name} risk a senior interviewer should test.`,
        `Debug a realistic ${name} work sample and name the root cause.`,
        `Choose the next best action in a ${name} hiring scenario.`,
      ],
      measures: [
        `Applied ${name} judgment in realistic hiring tasks.`,
        `${category} ${focus[2]} with production-readiness signals.`,
        'Communication of assumptions, risk, and evidence without unsupported claims.',
      ],
    };
  });
});

const roleSeeds = [
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

const stackSeeds = [
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

export const rolePages: RolePage[] = Array.from({ length: 30 }, (_, index) => {
  const seed = roleSeeds[index % roleSeeds.length]!;
  const suffix = index < roleSeeds.length ? '' : `-${Math.floor(index / roleSeeds.length) + 1}`;
  const slug = `${seed}${suffix}`;
  const title = seed
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ');
  const family: RolePage['family'] =
    index % 5 === 0
      ? 'india-enterprise'
      : index % 5 === 1
        ? 'eng'
        : index % 5 === 2
          ? 'devops'
          : index % 5 === 3
            ? 'data'
            : 'non-tech';
  return {
    slug,
    path: `/solutions/role/${slug}`,
    title,
    name: title,
    family,
    seniorityLevels: index % 3 === 0 ? ['mid', 'senior', 'lead'] : ['junior', 'mid', 'senior'],
    description: `${title} hiring battery with core skills, stack context, and calibration badges.`,
    coreSkills: [
      librarySkills[index % librarySkills.length]!.slug,
      librarySkills[(index + 1) % librarySkills.length]!.slug,
    ],
    recommendedSkills: [librarySkills[(index + 2) % librarySkills.length]!.slug],
    stacks: [stackSeeds[index % stackSeeds.length]!],
  };
});

export const stackPages: StackPage[] = stackSeeds.map((slug) => ({
  slug,
  path: `/solutions/stack/${slug}`,
  title: slug
    .split('-')
    .map((part) =>
      part.toUpperCase() === 'ABAP' ? 'ABAP' : part[0]!.toUpperCase() + part.slice(1),
    )
    .join(' '),
  name: slug
    .split('-')
    .map((part) =>
      part.toUpperCase() === 'ABAP' ? 'ABAP' : part[0]!.toUpperCase() + part.slice(1),
    )
    .join(' '),
  family: ['sap-abap', 'oracle', 'bfsi'].includes(slug) ? 'India-stack' : 'Global stack',
  vendor: ['sap-abap'].includes(slug) ? 'SAP' : ['oracle'].includes(slug) ? 'Oracle' : 'QOrium',
  regionRelevance: ['sap-abap', 'oracle', 'bfsi', 'embedded-automotive'].includes(slug)
    ? ['IN', 'GCC']
    : ['Global'],
  description: `${slug
    .split('-')
    .join(' ')} assessment modules mapped to roles and related skills.`,
  indiaCallout: ['sap-abap', 'oracle', 'bfsi', 'embedded-automotive'].includes(slug)
    ? 'India enterprise hiring needs applied stack evidence that generic libraries often miss.'
    : 'Stack context links this page to role-specific assessment batteries.',
  roles: [rolePages[stackSeeds.indexOf(slug) % rolePages.length]!.slug],
  skills: [librarySkills[stackSeeds.indexOf(slug) % librarySkills.length]!.slug],
}));

function comparisonRows(
  rows: Array<readonly [dimension: string, competitorPosition: string, qoriumPosition: string]>,
): CompetitorPage['matrix'] {
  const completeRows = [
    ...rows,
    [
      'Implementation fit',
      'Depends on buyer workflow, integrations, and hiring volume',
      'Proof run should test one real role, one stack, and one shortlist flow',
    ],
    [
      'Decision evidence',
      'Vendor proof should be reviewed in the buyer environment',
      'QOrium pages route to trust, library, and demo proof rather than numeric superiority claims',
    ],
  ] satisfies Array<readonly [string, string, string]>;

  return completeRows.map(([dimension, competitorPosition, qoriumPosition]) => ({
    dimension,
    competitor: competitorPosition,
    qorium: qoriumPosition,
    competitorPosition,
    qoriumPosition,
    evidenceStatus: 'live-review-required',
  }));
}

const competitorBlueprints: Array<{
  slug: string;
  competitor: string;
  summary: string;
  whereCompetitorIsBetter: string[];
  qoriumEdges: string[];
  matrix: CompetitorPage['matrix'];
  sourceNote: string;
}> = [
  {
    slug: 'vervoe',
    competitor: 'Vervoe',
    summary:
      'Vervoe is strong when buyers want real-work assessments, AI-assisted grading language, and mature public customer proof; QOrium should be evaluated when the buying question is defensible content infrastructure and India/GCC stack depth.',
    whereCompetitorIsBetter: [
      'More mature public customer proof and global brand familiarity.',
      'Clear real-work assessment story for broad hiring teams.',
      'Established AI-assisted assessment workflow language.',
    ],
    qoriumEdges: [
      'India-stack depth is first-class in the role graph.',
      'Calibration and evidence status are visible instead of implied.',
      'Anti-leak and protected-bank posture are central to the page narrative.',
    ],
    matrix: comparisonRows([
      [
        'Real-work assessment story',
        'Mature public positioning',
        'Mapped through role, stack, and skill pages',
      ],
      ['AI grading posture', 'Established category language', 'Evidence-gated automation claims'],
      ['Customer proof', 'Stronger public proof', 'Proof slots stay unclaimed until sourced'],
      [
        'India/GCC depth',
        'General global coverage',
        'India-stack and GCC context built into the graph',
      ],
      [
        'Question bank protection',
        'Assessment workflow focus',
        'Anti-leak lifecycle and gated samples are central',
      ],
      [
        'Buyer next step',
        'Demo-led vendor evaluation',
        'Proof run tied to role, stack, and trust review',
      ],
    ]),
    sourceNote:
      'Official-site live review benchmark completed on 2026-06-02; page avoids unsupported numeric superiority claims.',
  },
  {
    slug: 'hackerrank',
    competitor: 'HackerRank',
    summary:
      'HackerRank is a category reference for developer screening, coding assessments, and technical interviews; QOrium compares as an evidence layer for broader skills, India-stack coverage, and protected content operations.',
    whereCompetitorIsBetter: [
      'Developer assessment brand recognition and technical-screening depth.',
      'Mature interview and coding workflow surface.',
      'Enterprise familiarity for engineering hiring teams.',
    ],
    qoriumEdges: [
      'Hiring pages extend beyond code into role, stack, and non-technical evidence.',
      'India/GCC stack pages are built as first-class routes.',
      'Public pages separate shipped proof from roadmap claims.',
    ],
    matrix: comparisonRows([
      [
        'Coding assessment authority',
        'Strong category ownership',
        'Code-adjacent plus broader role evidence',
      ],
      [
        'Interview workflows',
        'Mature interview surface',
        'Assessment-library and pack-first workflow',
      ],
      ['Enterprise awareness', 'High global familiarity', 'India/GCC trust and stack specificity'],
      [
        'Non-code roles',
        'Less central to the brand story',
        'Role graph includes non-tech and enterprise apps',
      ],
      [
        'Leak posture',
        'Assessment integrity features',
        'Protected-bank lifecycle is central positioning',
      ],
      ['Claim discipline', 'Broad product claims', 'Evidence-gated public page behavior'],
    ]),
    sourceNote:
      'Official-site live review benchmark completed on 2026-06-02; use this page for structural fit, not absolute vendor scoring.',
  },
  {
    slug: 'mercer-mettl',
    competitor: 'Mercer Mettl',
    summary:
      'Mercer Mettl has deep India enterprise familiarity, broad assessment operations, and proctoring-led credibility; QOrium should look cleaner, more transparent, and more content-infrastructure-led.',
    whereCompetitorIsBetter: [
      'India enterprise familiarity and assessment operations maturity.',
      'Broad catalog and proctoring-led service posture.',
      'Procurement familiarity for larger organizations.',
    ],
    qoriumEdges: [
      'Modern buyer journey with explicit trust, method, and anti-leak links.',
      'Visible calibration status prevents overclaiming.',
      'Stack-Vault makes private bank positioning explicit.',
    ],
    matrix: comparisonRows([
      [
        'India enterprise trust',
        'Very strong familiarity',
        'India-built positioning with sharper product narrative',
      ],
      [
        'Proctoring operations',
        'Established proctoring posture',
        'Anti-leak content lifecycle complements integrity',
      ],
      [
        'Catalog breadth',
        'Broad assessment catalog',
        'Connected role, skill, and stack sitemap graph',
      ],
      [
        'Private bank',
        'Service-led enterprise model',
        'Stack-Vault gives explicit customer-exclusive story',
      ],
      [
        'Transparency',
        'Large-platform complexity',
        'Evidence labels and source discipline are visible',
      ],
      [
        'Buyer journey',
        'Procurement-led evaluation',
        'Demo, trust, library, and proof-run route links',
      ],
    ]),
    sourceNote:
      'Official-site live review benchmark completed on 2026-06-02; public claims remain qualitative unless sourced.',
  },
  {
    slug: 'imocha',
    competitor: 'iMocha',
    summary:
      'iMocha has a strong skills-intelligence and enterprise assessment posture; QOrium should compete by making bank freshness, role graph, India-stack depth, and audit discipline easier to understand.',
    whereCompetitorIsBetter: [
      'Skills intelligence positioning is mature and enterprise-friendly.',
      'Large-library posture and analytics language are familiar to buyers.',
      'Established global enterprise sales motion.',
    ],
    qoriumEdges: [
      'Content freshness and anti-leak rotation are surfaced as core infrastructure.',
      'India enterprise and GCC use cases are named directly.',
      'Every generated page links back into evidence and trust routes.',
    ],
    matrix: comparisonRows([
      [
        'Skills intelligence',
        'Strong category framing',
        'Role graph plus protected content operations',
      ],
      [
        'Analytics posture',
        'Enterprise analytics language',
        'Calibration and evidence status before analytics claims',
      ],
      [
        'Library scale',
        'Large public posture',
        '1,000-page library with honest authored/beta labels',
      ],
      [
        'India/GCC specificity',
        'Global enterprise framing',
        'India-stack and GCC route families are explicit',
      ],
      [
        'Anti-leak story',
        'Integrity and assessment operations',
        'Freshness lifecycle and gated samples are central',
      ],
      ['Conversion path', 'Enterprise sales motion', 'Buyer journey routes from every page family'],
    ]),
    sourceNote:
      'Official-site live review benchmark completed on 2026-06-02; no unsupported outcome metrics are published.',
  },
  {
    slug: 'testgorilla',
    competitor: 'TestGorilla',
    summary:
      'TestGorilla is strong on self-serve discovery, skills-test library navigation, and accessible buyer education; QOrium compares by turning discoverability into defensible evidence and trust routing.',
    whereCompetitorIsBetter: [
      'Highly discoverable skills-test library and broad buyer education.',
      'Self-serve packaging and pricing clarity are stronger public signals.',
      'Mature SMB and mid-market conversion surface.',
    ],
    qoriumEdges: [
      'Trust and evidence posture is woven into every route family.',
      'India/GCC and stack-specific pages are stronger differentiation angles.',
      'Protected-bank logic explains why not every item should be public.',
    ],
    matrix: comparisonRows([
      [
        'Self-serve discovery',
        'Very strong public navigation',
        'Connected sitemap families with enterprise proof layers',
      ],
      [
        'Pricing clarity',
        'Public pricing posture',
        'Talk-to-sales until founder-locked pricing is approved',
      ],
      [
        'Library breadth',
        'Broad skills-test library',
        'Skill graph includes role, stack, and calibration context',
      ],
      [
        'Enterprise trust',
        'Accessible trust language',
        'DPDP, method, science, and anti-leak routes connected',
      ],
      ['India/GCC depth', 'General global coverage', 'India-stack and GCC pages are first-class'],
      [
        'Content protection',
        'Public library emphasis',
        'Gated samples plus protected production bank posture',
      ],
    ]),
    sourceNote:
      'Official-site live review benchmark completed on 2026-06-02; page focuses on buyer-fit tradeoffs.',
  },
  {
    slug: 'codesignal',
    competitor: 'CodeSignal',
    summary:
      'CodeSignal is strong on certified assessment language, technical skills evaluation, and validation-led market posture; QOrium should make assessment science readable for HR, legal, and platform buyers.',
    whereCompetitorIsBetter: [
      'Certified assessment and validation language is mature.',
      'Technical skills evaluation brand is globally familiar.',
      'Enterprise buyers can understand the science posture quickly.',
    ],
    qoriumEdges: [
      'QOrium separates calibration status by page instead of implying universal maturity.',
      'India-stack and Stack-Vault content depth widen the buyer context.',
      'Trust routes connect science, method, responsible AI, and security.',
    ],
    matrix: comparisonRows([
      [
        'Validation language',
        'Strong certified-assessment posture',
        'Transparent calibration labels by page',
      ],
      [
        'Technical evaluation',
        'Mature technical evaluation brand',
        'Technical plus enterprise-app and India-stack routes',
      ],
      [
        'Science readability',
        'Public science framing',
        'Method, science, and evidence routes linked across pages',
      ],
      [
        'Private content',
        'Assessment delivery posture',
        'Stack-Vault frames customer-exclusive libraries',
      ],
      [
        'Buyer audience',
        'Engineering and talent leaders',
        'HR, legal, talent, platform, and GCC buyers',
      ],
      [
        'Proof path',
        'Enterprise evaluation motion',
        'Role, library, trust, and demo path on every page',
      ],
    ]),
    sourceNote:
      'Official-site live review benchmark completed on 2026-06-02; QOrium claims stay evidence-gated.',
  },
  ...['coderbyte', 'wecp', 'adaface', 'karat', 'devskiller'].map((slug) => {
    const competitor = slug
      .split('-')
      .map((part) => part[0]!.toUpperCase() + part.slice(1))
      .join(' ');
    return {
      slug,
      competitor,
      summary: `${competitor} is an established assessment category reference; QOrium compares honestly on structure, buyer journey, India-stack depth, and evidence-gated claims.`,
      whereCompetitorIsBetter: [
        'More mature public customer proof where applicable.',
        'Broader self-serve footprint in existing markets.',
        'Existing category recognition for the buyer segment it serves.',
      ],
      qoriumEdges: [
        'India-stack depth is first-class in the role graph.',
        'Calibration status is visible instead of implied.',
        'Unsupported claims stay gated until live review is complete.',
      ],
      matrix: comparisonRows([
        [
          'Category familiarity',
          'Established vendor surface',
          'Newer but more evidence-gated story',
        ],
        [
          'Library navigation',
          'Public assessment catalog posture',
          'Role, skill, stack, and trust graph',
        ],
        [
          'Enterprise trust',
          'Varies by vendor',
          'DPDP, method, science, and anti-leak routes connected',
        ],
        [
          'India/GCC specificity',
          'Generalized coverage',
          'India-stack and GCC route families are explicit',
        ],
        [
          'Private bank story',
          'Varies by vendor',
          'Stack-Vault frames protected customer-exclusive content',
        ],
        ['Next step', 'Vendor demo', 'Proof run tied to buyer context and page intent'],
      ]),
      sourceNote:
        'Requires live review before stronger claims; seeded from category audit criteria and kept qualitative.',
    };
  }),
];

export const competitorPages: CompetitorPage[] = competitorBlueprints.map((page) => ({
  ...page,
  path: `/vs/${page.slug}`,
  title: `QOrium vs ${page.competitor}`,
}));

export const seoSitemapFamilies = {
  library: librarySkills.map((page) => ({ url: `${siteConfig.url}${page.path}`, slug: page.slug })),
  roles: rolePages.map((page) => ({ url: `${siteConfig.url}${page.path}`, slug: page.slug })),
  stacks: stackPages.map((page) => ({ url: `${siteConfig.url}${page.path}`, slug: page.slug })),
  vs: competitorPages.map((page) => ({ url: `${siteConfig.url}${page.path}`, slug: page.slug })),
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
  return slugify(slug.replace(/^qorium-vs-/, '').replace(/^vs-/, ''));
}
