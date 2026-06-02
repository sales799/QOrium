import { siteConfig } from './site.config';

export type CalibrationStatus = 'IRT-calibrated' | 'Pilot' | 'Authored';

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
    const status: CalibrationStatus = itemCountTotal > 0 ? 'Pilot' : 'Authored';
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
    : 'Stack context links the skill to role-specific assessment batteries.',
  roles: [rolePages[stackSeeds.indexOf(slug) % rolePages.length]!.slug],
  skills: [librarySkills[stackSeeds.indexOf(slug) % librarySkills.length]!.slug],
}));

const competitors = [
  'vervoe',
  'hackerrank',
  'mercer-mettl',
  'imocha',
  'coderbyte',
  'testgorilla',
  'wecp',
  'adaface',
  'karat',
  'devskiller',
] as const;

export const competitorPages: CompetitorPage[] = competitors.map((slug) => ({
  slug,
  path: `/vs/${slug}`,
  title: `QOrium vs ${slug
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' ')}`,
  competitor: slug
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(' '),
  summary: `${slug
    .split('-')
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(
      ' ',
    )} is an established assessment category reference; QOrium compares honestly on structure rather than unsupported numeric claims.`,
  whereCompetitorIsBetter: [
    'More mature public customer proof where applicable.',
    'Broader self-serve footprint in existing global markets.',
  ],
  qoriumEdges: [
    'India-stack depth is first-class in the role graph.',
    'Calibration status is visible instead of implied.',
    'Unsupported claims stay gated until live review is complete.',
  ],
  matrix: Array.from({ length: 8 }, (_, index) => ({
    dimension: `Dimension ${index + 1}`,
    competitor: index % 2 === 0 ? 'Strong established surface' : 'Category-recognized workflow',
    qorium: index % 2 === 0 ? 'India-first audit posture' : 'Role-graph and evidence-gated claims',
    competitorPosition:
      index % 2 === 0 ? 'Strong established surface' : 'Category-recognized workflow',
    qoriumPosition:
      index % 2 === 0 ? 'India-first audit posture' : 'Role-graph and evidence-gated claims',
    evidenceStatus: 'live-review-required',
  })),
  sourceNote:
    'Requires live review before publication; seeded from internal competitor audit notes.',
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
