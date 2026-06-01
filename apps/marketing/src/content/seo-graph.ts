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

const seedSkills = [
  ['javascript', 'JavaScript', 'Programming'],
  ['python', 'Python', 'Programming'],
  ['java', 'Java', 'Programming'],
  ['react', 'React', 'Frontend'],
  ['sql', 'SQL', 'Data'],
  ['aws', 'AWS', 'Cloud'],
  ['kubernetes', 'Kubernetes', 'Cloud'],
  ['salesforce', 'Salesforce', 'Enterprise apps'],
  ['sap-abap', 'SAP ABAP', 'India-stack'],
  ['oracle-hcm-cloud', 'Oracle HCM Cloud', 'India-stack'],
  ['embedded-c', 'Embedded C', 'Automotive'],
  ['finacle-flexcube', 'Finacle/Flexcube', 'BFSI'],
  ['devops-sre', 'DevOps/SRE', 'Cloud'],
  ['ai-prompt-engineering', 'AI Prompt Engineering', 'AI-era'],
  ['salesforce-cpq', 'Salesforce CPQ', 'Enterprise apps'],
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

export const librarySkills: LibrarySkillPage[] = Array.from({ length: 1_000 }, (_, index) => {
  const seed = seedSkills[index % seedSkills.length]!;
  const batch = Math.floor(index / seedSkills.length);
  const slug = batch === 0 ? seed[0] : `${seed[0]}-${batch + 1}`;
  const itemCountTotal = batch === 0 ? 40 : 0;
  const itemCountCalibrated = 0;
  const status: CalibrationStatus = itemCountTotal > 0 ? 'Beta' : 'Authored';
  const name = batch === 0 ? seed[1] : `${seed[1]} Skill Track ${batch + 1}`;
  const roleMap: Record<string, string[]> = {
    Programming: ['Backend Developer', 'Full Stack Developer'],
    Frontend: ['Frontend Developer', 'React Developer'],
    Data: ['Data Analyst', 'Data Engineer'],
    Cloud: ['Cloud Engineer', 'DevOps Engineer'],
    'Enterprise apps': ['Enterprise Application Consultant', 'GCC Platform Engineer'],
    'India-stack': ['Enterprise Application Consultant', 'GCC Platform Engineer'],
    Automotive: ['Embedded Software Engineer', 'Automotive Firmware Engineer'],
    BFSI: ['Core Banking Engineer', 'BFSI Implementation Consultant'],
    'AI-era': ['AI Prompt Engineer', 'Product Engineer'],
  };

  return {
    slug,
    path: `/library/${slug}`,
    name,
    category: seed[2],
    family: seed[2],
    stackFamily: seed[2].toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    seoMeta: {
      title: `${name} Assessment | QOrium Library`,
      description: `Preview the QOrium ${name} assessment: skills measured, calibration status, role mapping, stack mapping, and sample questions.`,
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
    roles: roleMap[seed[2]] ?? ['Hiring Manager', 'Team Lead'],
    stacks: [seed[0]],
    relatedSkills: seedSkills
      .filter((related) => related[0] !== seed[0] && related[2] === seed[2])
      .slice(0, 4)
      .map((related) => related[0]),
    synonyms: seed[0] === 'javascript' ? ['ECMAScript', 'JS'] : [],
    sampleQuestions: [
      `Explain a production ${seed[1]} risk a senior interviewer should test.`,
      `Debug a realistic ${seed[1]} work sample and name the root cause.`,
      `Choose the next best action in a ${seed[1]} hiring scenario.`,
    ],
    measures: [
      `Applied ${name} judgment in realistic hiring tasks.`,
      `${seed[2]} fundamentals, tradeoffs, and production-readiness signals.`,
      'Communication of assumptions, risk, and evidence without unsupported claims.',
    ],
  };
});

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
  software: ['javascript', 'java', 'react'],
  data: ['sql', 'python', 'ai-prompt-engineering'],
  devops: ['devops-sre', 'kubernetes', 'aws'],
  'non-tech': ['ai-prompt-engineering', 'sql', 'javascript'],
  'react-developer': ['react', 'javascript', 'ai-prompt-engineering'],
  'java-developer': ['java', 'sql', 'aws'],
  'python-developer': ['python', 'sql', 'aws'],
  'devops-engineer': ['devops-sre', 'kubernetes', 'aws'],
  'data-engineer': ['sql', 'python', 'aws'],
  'salesforce-developer': ['salesforce', 'salesforce-cpq', 'sql'],
  'sap-abap-consultant': ['sap-abap', 'sql', 'oracle-hcm-cloud'],
  'oracle-hcm-consultant': ['oracle-hcm-cloud', 'sql', 'finacle-flexcube'],
  'embedded-engineer': ['embedded-c', 'devops-sre', 'sql'],
  'core-banking-consultant': ['finacle-flexcube', 'sql', 'java'],
  'cloud-engineer': ['aws', 'kubernetes', 'devops-sre'],
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
  kubernetes: ['kubernetes', 'devops-sre'],
  react: ['react', 'javascript'],
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

export const rolePages: RolePage[] = Array.from({ length: 30 }, (_, index) => {
  const seed = roleSeeds[index % roleSeeds.length]!;
  const suffix = index < roleSeeds.length ? '' : `-${Math.floor(index / roleSeeds.length) + 1}`;
  const slug = `${seed}${suffix}`;
  const title = suffix
    ? `${roleTitles[seed] ?? titleizeSlug(seed)} ${suffix.slice(1)}`
    : (roleTitles[seed] ?? titleizeSlug(seed));
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
      : 'Stack context links this page to role-specific assessment batteries.',
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

export const competitorPages: CompetitorPage[] = competitors.map(({ slug, competitor }) => ({
  slug,
  path: `/vs/${slug}`,
  title: `QOrium vs ${competitor}`,
  competitor,
  summary: `${competitor} is an established assessment category reference; QOrium compares honestly on structure rather than unsupported numeric claims.`,
  whereCompetitorIsBetter: [
    'More mature public customer proof where applicable.',
    'Broader self-serve footprint in existing global markets.',
  ],
  qoriumEdges: [
    'India-stack depth is first-class in the role graph.',
    'Calibration status is visible instead of implied.',
    'Unsupported claims stay gated until live review is complete.',
  ],
  matrix: comparisonDimensions.map((dimension, index) => ({
    dimension,
    competitor: index % 2 === 0 ? 'Strong established surface' : 'Category-recognized workflow',
    qorium: index % 2 === 0 ? 'India-first audit posture' : 'Role-graph and evidence-gated claims',
    competitorPosition:
      index % 2 === 0 ? 'Strong established surface' : 'Category-recognized workflow',
    qoriumPosition:
      index % 2 === 0 ? 'India-first audit posture' : 'Role-graph and evidence-gated claims',
    evidenceStatus: 'live-review-required',
  })),
  sourceNote:
    'Seeded from internal competitor audit notes; rows marked live review required must be verified before use as sales proof.',
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
  const clean = slugify(slug.replace(/^qorium-vs-/, '').replace(/^vs-/, ''));
  return clean === 'mercer-mettl' ? 'mettl' : clean;
}
