export type Faq = { question: string; answer: string };
export type Skill = {
  name: string;
  category: string;
  roles: string[];
  difficulty: 'Foundation' | 'Intermediate' | 'Advanced';
  duration: string;
  calibration: string;
  questions: string[];
};
export type JobDescription = {
  title: string;
  family: string;
  seniority: string;
  skills: string[];
};
export type ComparePage = {
  slug: string;
  competitor: string;
  summary: string;
  strengths: string[];
  qoriumEdge: string[];
};
export type SolutionPage = {
  axis: 'by-company-type' | 'by-use-case' | 'by-industry';
  slug: string;
  title: string;
  audience: string;
  wedges: string[];
};

export const phase4Faqs: Faq[] = [
  {
    question: 'Can QOrium grade candidates automatically today?',
    answer:
      'Public pages only claim automation where the product surface has evidence. Advanced AI grading and IRT reporting are described as pilot, roadmap, or evidence-pending until backend proof is live.',
  },
  {
    question: 'Is QOrium built for India DPDP Act readiness?',
    answer:
      'Yes. QOrium presents DPDP-aligned handling, India-first compliance language, and audit-forward workflows without claiming certifications that are not yet complete.',
  },
  {
    question: 'Can teams start without a paid plan?',
    answer:
      'The Customer-Zero tier is free for small internal trials. Paid plan numbers are founder locks, so public paid tiers use Talk to sales until pricing is confirmed.',
  },
];

const skillRows = [
  [
    'JavaScript',
    'Programming',
    'Frontend Developer|Full Stack Developer',
    'Intermediate',
    '35 min',
  ],
  ['Python', 'Programming', 'Backend Developer|Data Analyst', 'Intermediate', '40 min'],
  ['Java', 'Programming', 'Java Developer|Backend Developer', 'Advanced', '45 min'],
  ['ReactJS', 'Frontend', 'React Developer|Frontend Developer', 'Intermediate', '35 min'],
  ['SQL', 'Data', 'Data Analyst|Backend Developer', 'Intermediate', '35 min'],
  ['AWS', 'Cloud', 'Cloud Engineer|DevOps Engineer', 'Advanced', '45 min'],
  ['Node.js', 'Backend', 'Node.js Developer|Full Stack Developer', 'Intermediate', '40 min'],
  ['Data Analyst', 'Data', 'Data Analyst|MIS Analyst', 'Foundation', '30 min'],
  ['Data Scientist', 'Data', 'Data Scientist|ML Engineer', 'Advanced', '50 min'],
  ['DevOps', 'Cloud', 'DevOps Engineer|SRE', 'Advanced', '45 min'],
  ['Selenium Testing', 'QA', 'Automation Tester|QA Engineer', 'Intermediate', '35 min'],
  ['Manual QA', 'QA', 'Manual QA Tester|QA Analyst', 'Foundation', '30 min'],
  ['B2B Sales', 'Sales', 'Sales Executive|Account Executive', 'Intermediate', '30 min'],
  ['Inside Sales', 'Sales', 'Inside Sales Representative|SDR', 'Foundation', '25 min'],
  ['Digital Marketing', 'Marketing', 'Digital Marketer|Growth Marketer', 'Intermediate', '35 min'],
  ['Content Writing', 'Marketing', 'Content Writer|SEO Writer', 'Foundation', '30 min'],
  [
    'English Proficiency',
    'Communication',
    'Customer Support Executive|Recruiter',
    'Foundation',
    '25 min',
  ],
  ['Analytical Ability', 'Cognitive', 'Analyst|Management Trainee', 'Intermediate', '30 min'],
  ['Personality', 'Behavioural', 'Team Lead|Customer Success Manager', 'Foundation', '20 min'],
  [
    'Product Management',
    'Business',
    'Product Manager|Associate Product Manager',
    'Advanced',
    '45 min',
  ],
  ['Project Management', 'Business', 'Project Manager|Program Manager', 'Intermediate', '35 min'],
  ['MS Excel', 'Data', 'Operations Executive|Finance Analyst', 'Foundation', '30 min'],
  ['Tableau', 'Data', 'BI Analyst|Data Analyst', 'Intermediate', '35 min'],
  ['Power BI', 'Data', 'Power BI Developer|BI Analyst', 'Intermediate', '35 min'],
  ['Cyber Security', 'Security', 'Security Analyst|SOC Analyst', 'Advanced', '45 min'],
] as const;

export const skillLibrary: Skill[] = skillRows.map(
  ([name, category, roles, difficulty, duration]) => ({
    name,
    category,
    roles: roles.split('|'),
    difficulty,
    duration,
    calibration:
      category === 'Behavioural' || category === 'Cognitive'
        ? 'Seeded; psychometric calibration pending pilot traffic'
        : 'Seeded; SME review and IRT evidence pending pilot traffic',
    questions: [
      `Explain the most important ${name} signal for a hiring manager.`,
      `Debug a realistic ${name} work sample and name the risk.`,
      `Choose the next best action in a role-specific ${name} scenario.`,
    ],
  }),
);

export const taxonomyBacklog = [
  'C++',
  'C#',
  'R',
  'HTML',
  'CSS',
  'PHP',
  'Go',
  'Swift',
  'Kotlin',
  'Scala',
  'Flutter',
  'Docker',
  'Kubernetes',
  'Linux',
  '.NET',
  'REST API',
  'Spring',
  'SAP ABAP',
  'Flask',
  'Hadoop',
  'Azure',
  'MongoDB',
  'Git',
  'Agile',
  'Data Engineer',
  'DBA',
  'RPA',
  'Salesforce',
  'Leadership Skills',
  'Retail Sales',
  'Field Sales',
  'Branding/PR',
  'Operations',
  'Accounting & Finance',
  'Business Analysis',
  'Law',
  'Design Thinking',
];

const jobRows = [
  ['React Developer', 'Engineering', 'Mid-level', 'ReactJS|JavaScript|TypeScript'],
  ['Python Developer', 'Engineering', 'Mid-level', 'Python|SQL|REST API'],
  ['Java Developer', 'Engineering', 'Senior', 'Java|SQL|System Design'],
  ['Node.js Developer', 'Engineering', 'Mid-level', 'Node.js|JavaScript|API Design'],
  ['Full Stack Developer', 'Engineering', 'Mid-level', 'JavaScript|ReactJS|Node.js'],
  ['DevOps Engineer', 'Cloud', 'Senior', 'DevOps|AWS|Docker'],
  ['Cloud Engineer', 'Cloud', 'Mid-level', 'AWS|Linux|Kubernetes'],
  ['Data Analyst', 'Data', 'Entry to mid-level', 'SQL|MS Excel|Tableau'],
  ['Data Scientist', 'Data', 'Senior', 'Python|Machine Learning|Statistics'],
  ['Power BI Developer', 'Data', 'Mid-level', 'Power BI|SQL|Data Modeling'],
  ['QA Automation Engineer', 'Quality', 'Mid-level', 'Selenium Testing|JavaScript|Manual QA'],
  ['Manual QA Tester', 'Quality', 'Entry-level', 'Manual QA|Analytical Ability|Communication'],
  ['Cyber Security Analyst', 'Security', 'Mid-level', 'Cyber Security|Linux|Incident Response'],
  ['Product Manager', 'Product', 'Senior', 'Product Management|Analytical Ability|Communication'],
  ['Project Manager', 'Delivery', 'Senior', 'Project Management|Leadership Skills|MS Excel'],
  ['B2B Sales Executive', 'Sales', 'Mid-level', 'B2B Sales|Inside Sales|English Proficiency'],
  [
    'Inside Sales Representative',
    'Sales',
    'Entry-level',
    'Inside Sales|English Proficiency|CRM Hygiene',
  ],
  [
    'Digital Marketing Executive',
    'Marketing',
    'Mid-level',
    'Digital Marketing|Content Writing|Analytics',
  ],
  ['Content Writer', 'Marketing', 'Entry to mid-level', 'Content Writing|English Proficiency|SEO'],
  ['Recruiter', 'Talent', 'Mid-level', 'English Proficiency|B2B Sales|Analytical Ability'],
] as const;

export const jobDescriptions: JobDescription[] = jobRows.map(
  ([title, family, seniority, skills]) => ({
    title,
    family,
    seniority,
    skills: skills.split('|'),
  }),
);

export const comparePages: ComparePage[] = [
  {
    slug: 'qorium-vs-vervoe',
    competitor: 'Vervoe',
    summary: 'Vervoe is a mature global skills assessment platform with strong enterprise proof.',
    strengths: [
      'Enterprise brand trust',
      'Job simulation surface',
      'Public trust and customer proof',
    ],
    qoriumEdge: [
      'India-first DPDP language',
      'IRT-calibrated scoring wedge',
      'JD-Forge assessment generation',
    ],
  },
  {
    slug: 'qorium-vs-coderbyte',
    competitor: 'CoderByte',
    summary:
      'CoderByte is strongest for coding-first assessment, interviewing, and developer workflows.',
    strengths: ['Developer assessment depth', 'Interview workflow', 'Self-serve pricing posture'],
    qoriumEdge: [
      'Broader non-technical library',
      'India compliance story',
      'Role graph plus JD-to-test workflow',
    ],
  },
  {
    slug: 'qorium-vs-hackerrank',
    competitor: 'HackerRank',
    summary:
      'HackerRank is a category leader for technical screening and live developer interviews.',
    strengths: ['Coding assessment brand', 'Enterprise footprint', 'Developer interview workflows'],
    qoriumEdge: [
      'Hiring beyond code',
      'Defensible psychometric reporting',
      'Indian staffing and GCC use cases',
    ],
  },
  {
    slug: 'qorium-vs-mercer-mettl',
    competitor: 'Mercer Mettl',
    summary: 'Mercer Mettl has deep India enterprise reach and a broad assessment catalog.',
    strengths: ['India enterprise familiarity', 'Broad catalog', 'Proctoring-led operations'],
    qoriumEdge: [
      'Faster JD-to-assessment creation',
      'Transparent item-level calibration story',
      'Modern API-first packaging',
    ],
  },
  {
    slug: 'qorium-vs-imocha',
    competitor: 'iMocha',
    summary: 'iMocha has a large skill intelligence surface and enterprise sales motion.',
    strengths: ['Skill intelligence positioning', 'Enterprise analytics', 'Large library posture'],
    qoriumEdge: [
      'India-native audit language',
      'Question freshness and anti-leak rotation',
      'Customer-exclusive Stack-Vault option',
    ],
  },
];

export const guides = [
  {
    slug: 'skills-testing',
    title: 'The Talpro Guide to Skills Testing in India',
    summary: 'Replace resume-first hiring with evidence-first assessments.',
  },
  {
    slug: 'how-to-evaluate-ai-hiring-vendors',
    title: 'How to evaluate AI hiring vendors under India DPDP Act',
    summary: 'A buyer checklist for consent, minimization, audit logs, and accountability.',
  },
  {
    slug: 'hiring-rubric-hr-tribunal',
    title: 'Building a hiring rubric that survives an HR tribunal',
    summary: 'Connect job requirements, question design, scoring, and candidate communication.',
  },
  {
    slug: 'skills-gap-analysis-template',
    title: 'Skills-gap analysis template',
    summary: 'Open preview plus spreadsheet template request path.',
  },
  {
    slug: 'shortlisting-matrix-template',
    title: 'Shortlisting matrix template',
    summary: 'Combine assessment evidence, recruiter notes, and hiring-manager review.',
  },
  {
    slug: 'recruitment-plan-template',
    title: '30-60-90 hiring plan template',
    summary: 'Roll out skills-first selection in structured phases.',
  },
] as const;

export const solutionPages: SolutionPage[] = [
  {
    axis: 'by-company-type',
    slug: 'enterprise',
    title: 'QOrium for enterprises',
    audience: 'Regulated teams that need repeatable hiring evidence.',
    wedges: ['Audit-ready scoring', 'Private Stack-Vault libraries', 'SSO and API roadmap'],
  },
  {
    axis: 'by-company-type',
    slug: 'startup',
    title: 'QOrium for startups',
    audience: 'Lean teams that need signal before adding interview load.',
    wedges: ['Customer-Zero free tier', 'Fast role-to-test setup', 'Clear candidate evidence'],
  },
  {
    axis: 'by-company-type',
    slug: 'smb',
    title: 'QOrium for SMBs',
    audience: 'Growing companies replacing informal screening with structured shortlists.',
    wedges: ['Simple assessment library', 'Talk-to-sales paid tiers', 'Reusable role templates'],
  },
  {
    axis: 'by-use-case',
    slug: 'high-volume-hiring',
    title: 'High-volume hiring',
    audience: 'Teams processing hundreds or thousands of candidates per month.',
    wedges: ['Bulk-ready library paths', 'Structured shortlist evidence', 'Anti-leak rotation'],
  },
  {
    axis: 'by-use-case',
    slug: 'technical-screening',
    title: 'Technical screening',
    audience: 'Engineering teams that need practical evidence beyond resumes.',
    wedges: ['Code-adjacent skill coverage', 'Skill cards by role', 'IRT-ready item design'],
  },
  {
    axis: 'by-use-case',
    slug: 'campus-hiring',
    title: 'Campus hiring',
    audience: 'Recruiters screening early-career talent at scale.',
    wedges: [
      'Foundation-level assessments',
      'English and aptitude coverage',
      'Fair comparison rubrics',
    ],
  },
  {
    axis: 'by-use-case',
    slug: 'lateral-hiring',
    title: 'Lateral hiring',
    audience: 'Teams validating applied skill depth before panels.',
    wedges: ['Role-specific templates', 'Sample work questions', 'Hiring-manager evidence packets'],
  },
  {
    axis: 'by-use-case',
    slug: 'internal-mobility',
    title: 'Internal mobility',
    audience: 'People teams mapping employee skills to new opportunities.',
    wedges: ['Skill-gap language', 'Reusable assessment paths', 'Auditable movement decisions'],
  },
  {
    axis: 'by-industry',
    slug: 'it-services-staffing',
    title: 'IT services and staffing',
    audience: 'Staffing firms that live on shortlist speed and credibility.',
    wedges: ['Talpro India customer-zero fit', 'Fast JD-to-test motion', 'Client-ready scorecards'],
  },
  {
    axis: 'by-industry',
    slug: 'bfsi',
    title: 'BFSI hiring',
    audience: 'Financial-services teams that need compliance-aware evidence.',
    wedges: ['DPDP-aligned language', 'Audit logs roadmap', 'Secure candidate handling'],
  },
  {
    axis: 'by-industry',
    slug: 'healthcare',
    title: 'Healthcare hiring',
    audience: 'Healthcare operators hiring for process accuracy and communication.',
    wedges: ['Scenario-style assessments', 'Communication checks', 'Structured reviewer notes'],
  },
  {
    axis: 'by-industry',
    slug: 'retail-and-ecommerce',
    title: 'Retail and ecommerce hiring',
    audience: 'Distributed teams hiring frontline and support roles.',
    wedges: ['High-volume screening', 'English and scenario tests', 'Fast shortlist workflows'],
  },
  {
    axis: 'by-industry',
    slug: 'it-product',
    title: 'IT product hiring',
    audience: 'Product companies validating technical and product judgment.',
    wedges: ['Engineering skill cards', 'Product-management path', 'Role graph coverage'],
  },
  {
    axis: 'by-industry',
    slug: 'gcc-global-capability-centers',
    title: 'GCC hiring',
    audience: 'Global capability centers building large India teams.',
    wedges: ['Enterprise governance language', 'Private library option', 'Residency roadmap'],
  },
];

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getSkill(slug: string) {
  return skillLibrary.find((skill) => slugify(skill.name) === slug);
}

export function getJob(slug: string) {
  return jobDescriptions.find((job) => slugify(job.title) === slug);
}
