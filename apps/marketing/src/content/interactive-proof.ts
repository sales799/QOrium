export type ProofSkill = {
  name: string;
  weight: number;
  roleFamily: string;
  stackFamily: string;
  sourcePhrases: string[];
  libraryHref: string;
};

export type SampleJd = {
  id: string;
  title: string;
  roleFamily: string;
  body: string;
};

export type JdForgeDemoResult = {
  ok: true;
  planId: string;
  inputHash: string;
  roleTitle: string;
  source: {
    mode: 'sample-jd' | 'pasted-jd' | 'job-title';
    label: string;
    jobTitle?: string;
    generatedJd: string;
    researchProvider: string;
    researchSignals: string[];
  };
  skills: ProofSkill[];
  assessment: {
    itemCount: number;
    durationMinutes: number;
    coverageBadge: string;
    formats: Array<{ label: string; count: number }>;
    battery: Array<{ skill: string; itemTypes: string; coverage: string }>;
  };
  audit: {
    jdLength: number;
    skillCount: number;
    confidence: number;
    generatedAt: string;
  };
  lowConfidenceReason?: string;
};

export type JdForgeTitleResearch = {
  jobTitle: string;
  generatedJd: string;
  roleFamily: string;
  domain: string;
  seniority: string;
  researchProvider: string;
  researchSignals: string[];
};

export type GraderAuditMeta = {
  rubricVersion: string;
  modelVersion: string;
  promptHash: string;
  inputHash: string;
  gradedAt: string;
};

export type GraderExemplar = {
  id: string;
  title: string;
  skill: string;
  family: 'code' | 'sql' | 'document' | 'scenario';
  question: string;
  answer: string;
  rubric: Array<{ criterion: string; weight: number; signal: string }>;
  score: number;
  breakdown: Array<{ criterion: string; score: number; note: string }>;
  reasoning: string[];
  auditMeta: GraderAuditMeta;
};

export type SamplePackItem = {
  id: string;
  title: string;
  format: string;
  difficulty: string;
  durationMinutes: number;
  skillSignal: string;
};

export type SamplePack = {
  slug: string;
  title: string;
  skill: string;
  role: string;
  stack: string;
  family: string;
  level: string;
  itemCount: number;
  calibrationBadge: string;
  summary: string;
  libraryHref: string;
  roleHref: string;
  stackHref: string;
  previewItems: SamplePackItem[];
  gatedItems: SamplePackItem[];
};

type SkillRule = {
  name: string;
  roleFamily: string;
  stackFamily: string;
  libraryHref: string;
  patterns: RegExp[];
};

const GENERATED_AT = '2026-06-01T00:00:00.000Z';
const MAX_EXTRACTED_SKILLS = 16;

const skillRules: SkillRule[] = [
  {
    name: 'Java 21 concurrency',
    roleFamily: 'Software engineering',
    stackFamily: 'Java',
    libraryHref: '/library/java',
    patterns: [/\bjava\b/i, /\bvirtual threads?\b/i, /\bjvm\b/i],
  },
  {
    name: 'Spring Boot services',
    roleFamily: 'Software engineering',
    stackFamily: 'Java',
    libraryHref: '/library/java',
    patterns: [/\bspring\s*boot\b/i, /\bspring framework\b/i],
  },
  {
    name: 'JPA and Hibernate',
    roleFamily: 'Software engineering',
    stackFamily: 'Java',
    libraryHref: '/library/java',
    patterns: [/\bjpa\b/i, /\bhibernate\b/i, /\borg mapping\b/i],
  },
  {
    name: 'Python production engineering',
    roleFamily: 'Software engineering',
    stackFamily: 'Python',
    libraryHref: '/library/python',
    patterns: [/\bpython\b/i, /\bpytest\b/i, /\bpandas\b/i],
  },
  {
    name: 'Data pipeline orchestration',
    roleFamily: 'Data',
    stackFamily: 'Data Engineering',
    libraryHref: '/library/data-engineering',
    patterns: [/\bairflow\b/i, /\bdag\b/i, /\bdata pipelines?\b/i, /\betl\b/i, /\bglue\b/i],
  },
  {
    name: 'Analytics engineering with dbt',
    roleFamily: 'Data',
    stackFamily: 'Data Engineering',
    libraryHref: '/library/data-engineering',
    patterns: [/\bdbt\b/i, /\banalytics engineering\b/i, /\bdata models?\b/i, /\bdata modeling\b/i],
  },
  {
    name: 'Cloud data warehousing',
    roleFamily: 'Data',
    stackFamily: 'Data Engineering',
    libraryHref: '/library/data-engineering',
    patterns: [/\bsnowflake\b/i, /\bredshift\b/i, /\bbigquery\b/i, /\bdata warehouse\b/i],
  },
  {
    name: 'SQL data modeling',
    roleFamily: 'Data',
    stackFamily: 'SQL',
    libraryHref: '/library/sql',
    patterns: [/\bsql\b/i, /\bpostgres(ql)?\b/i, /\bquery plans?\b/i],
  },
  {
    name: 'Microservices resilience',
    roleFamily: 'Software engineering',
    stackFamily: 'Architecture',
    libraryHref: '/library/java',
    patterns: [/\bmicroservices?\b/i, /\bcircuit breaker\b/i, /\bdistributed systems?\b/i],
  },
  {
    name: 'React component architecture',
    roleFamily: 'Frontend engineering',
    stackFamily: 'React',
    libraryHref: '/library/react',
    patterns: [/\breact\b/i, /\bcomponent architecture\b/i],
  },
  {
    name: 'TypeScript application design',
    roleFamily: 'Frontend engineering',
    stackFamily: 'TypeScript',
    libraryHref: '/library/javascript',
    patterns: [/\btypescript\b/i, /\btype-safe\b/i, /\bdiscriminated union\b/i],
  },
  {
    name: 'Next.js App Router',
    roleFamily: 'Frontend engineering',
    stackFamily: 'Next.js',
    libraryHref: '/library/react',
    patterns: [/\bnext\.?js\b/i, /\bapp router\b/i, /\bserver actions?\b/i],
  },
  {
    name: 'Client performance debugging',
    roleFamily: 'Frontend engineering',
    stackFamily: 'React',
    libraryHref: '/library/react',
    patterns: [
      /\bclient performance\b/i,
      /\bfrontend performance\b/i,
      /\bperformance profiling\b/i,
      /\bprofiler\b/i,
      /\bmemo(?:ization)?\b/i,
    ],
  },
  {
    name: 'Kubernetes operations',
    roleFamily: 'DevOps / SRE',
    stackFamily: 'Cloud native',
    libraryHref: '/library/devops-sre',
    patterns: [/\bkubernetes\b/i, /\bk8s\b/i, /\bstatefulset\b/i, /\bhpa\b/i],
  },
  {
    name: 'Terraform infrastructure',
    roleFamily: 'DevOps / SRE',
    stackFamily: 'Infrastructure as code',
    libraryHref: '/library/aws',
    patterns: [/\bterraform\b/i, /\binfrastructure as code\b/i],
  },
  {
    name: 'Observability and incident response',
    roleFamily: 'DevOps / SRE',
    stackFamily: 'Reliability',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bobservability\b/i,
      /\bslo\b/i,
      /\bincident response\b/i,
      /\bincident management\b/i,
      /\bprometheus\b/i,
    ],
  },
  {
    name: 'AWS production systems',
    roleFamily: 'Cloud engineering',
    stackFamily: 'AWS',
    libraryHref: '/library/aws',
    patterns: [
      /\baws\b/i,
      /\blambda\b/i,
      /\bs3\b/i,
      /\bec2\b/i,
      /\biam\b/i,
      /\bvpc\b/i,
      /\bworkspaces?\b/i,
      /\becs\b/i,
      /\beks\b/i,
      /\bsecurity groups?\b/i,
    ],
  },
  {
    name: 'Remote desktop and endpoint support',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Endpoint support',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bremote desktop\b/i,
      /\bend-user support\b/i,
      /\banydesk\b/i,
      /\brdp\b/i,
      /\bworkstations?\b/i,
      /\blaptops?\b/i,
      /\b(?:workstation|endpoint|device) onboarding\b/i,
      /\bisp[-\s]?related\b/i,
    ],
  },
  {
    name: 'Identity and access administration',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Identity and access',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bidentity (?:and|&) access\b/i,
      /\bazure entra id\b/i,
      /\bazure ad\b/i,
      /\bactive directory\b/i,
      /\bad ds\b/i,
      /\brbac\b/i,
      /\bconditional access\b/i,
      /\bgroup polic(?:y|ies)\b/i,
      /\bleast-privilege\b/i,
    ],
  },
  {
    name: 'Microsoft 365 administration',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Microsoft 365',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bmicrosoft 365\b/i,
      /\bm365\b/i,
      /\bexchange online\b/i,
      /\bmicrosoft teams\b/i,
      /\bteams admin(?:istration)?\b/i,
      /\bsharepoint\b/i,
      /\bonedrive\b/i,
    ],
  },
  {
    name: 'Network infrastructure troubleshooting',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Networking',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bnetwork infrastructure\b/i,
      /\bnetwork support\b/i,
      /\bconnectivity\b/i,
      /\bcisco\b/i,
      /\bswitches\b/i,
      /\brouters\b/i,
      /\bfirewalls?\b/i,
      /\bdns\b/i,
      /\bdhcp\b/i,
      /\bvpn\b/i,
      /\bvlan\b/i,
      /\bqos\b/i,
      /\bbandwidth\b/i,
      /\bccna\b/i,
    ],
  },
  {
    name: 'Windows Server administration',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Windows Server',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bwindows server\b/i,
      /\bfile servers?\b/i,
      /\bapplication hosting servers?\b/i,
      /\binternal email servers?\b/i,
      /\bpatch management\b/i,
      /\bcapacity planning\b/i,
      /\bhealth checks?\b/i,
      /\bmcse\b/i,
    ],
  },
  {
    name: 'Backup and disaster recovery',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Resilience',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bbackup\b/i,
      /\bdisaster recovery\b/i,
      /\bdr procedures?\b/i,
      /\bbusiness continuity\b/i,
      /\brecovery tools?\b/i,
    ],
  },
  {
    name: 'Security compliance operations',
    roleFamily: 'Security',
    stackFamily: 'Compliance operations',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\biso 27001\b/i,
      /\bsoc 2\b/i,
      /\bhipaa\b/i,
      /\bgdpr\b/i,
      /\bendpoint security\b/i,
      /\bencryption\b/i,
      /\bssl certificates?\b/i,
      /\bsecurity audits?\b/i,
      /\bsecurity incidents?\b/i,
    ],
  },
  {
    name: 'ITIL service operations',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Service operations',
    libraryHref: '/library/devops-sre',
    patterns: [
      /\bitil\b/i,
      /\bslas?\b/i,
      /\bincident logs?\b/i,
      /\brunbooks?\b/i,
      /\bsops?\b/i,
      /\bknowledge base\b/i,
      /\bchange management\b/i,
      /\bservice disruption\b/i,
    ],
  },
  {
    name: 'IT operations automation',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Automation',
    libraryHref: '/library/python',
    patterns: [/\bpowershell\b/i, /\bautomation scripting\b/i, /\bit operations tasks?\b/i],
  },
  {
    name: 'OpenText xPression development',
    roleFamily: 'Enterprise apps',
    stackFamily: 'OpenText xPression',
    libraryHref: '/library/technical-communication',
    patterns: [
      /\bopentext\s+xpression\b/i,
      /\bxpression\s+development\b/i,
      /\bxpression\s+versions?\s+\d/i,
    ],
  },
  {
    name: 'xPression platform upgrade and migration',
    roleFamily: 'Enterprise apps',
    stackFamily: 'OpenText xPression',
    libraryHref: '/library/technical-communication',
    patterns: [
      /\bxpression\s+platform\s+upgrades?\b/i,
      /\bxpression[^.\n]{0,80}\bmigrations?\b/i,
      /\bmigration projects?\b/i,
      /\bpost-migration stabilization\b/i,
    ],
  },
  {
    name: 'Template migration and remediation',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Document generation',
    libraryHref: '/library/technical-communication',
    patterns: [
      /\btemplate migration\b/i,
      /\btemplate remediation\b/i,
      /\btemplate validation\b/i,
      /\btemplate migration\/remediation\b/i,
    ],
  },
  {
    name: 'Document platform performance tuning',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Document generation',
    libraryHref: '/library/technical-communication',
    patterns: [
      /\bperformance tuning\b/i,
      /\bperformance issues?\b/i,
      /\boptimi[sz]e system efficiency\b/i,
      /\btroubleshoot(?:ing)?\b/i,
    ],
  },
  {
    name: 'SQL Server platform operations',
    roleFamily: 'Data',
    stackFamily: 'SQL Server',
    libraryHref: '/library/sql',
    patterns: [/\bsql server\b/i, /\bt-sql\b/i],
  },
  {
    name: 'Windows platform operations',
    roleFamily: 'IT infrastructure',
    stackFamily: 'Windows',
    libraryHref: '/library/devops-sre',
    patterns: [/\bwindows platforms?\b/i, /\bwindows environments?\b/i],
  },
  {
    name: 'Deployment testing and stabilization',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Release support',
    libraryHref: '/library/technical-communication',
    patterns: [
      /\bdeployment,?\s+testing,?\s+and\s+post-migration stabilization\b/i,
      /\bpost-migration stabilization\b/i,
      /\bimplementation and support phases\b/i,
    ],
  },
  {
    name: 'Salesforce Apex',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Salesforce',
    libraryHref: '/library/salesforce',
    patterns: [/\bsalesforce\b/i, /\bapex\b/i, /\btriggers?\b/i, /\bgovernor limits?\b/i],
  },
  {
    name: 'Salesforce LWC',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Salesforce',
    libraryHref: '/library/salesforce',
    patterns: [
      /\blwc\b/i,
      /\blightning web components?\b/i,
      /\bsalesforce flow\b/i,
      /\bflow builder\b/i,
      /\bservice cloud\b/i,
    ],
  },
  {
    name: 'SOQL data access',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Salesforce',
    libraryHref: '/library/salesforce',
    patterns: [/\bsoql\b/i, /\bselectivity\b/i],
  },
  {
    name: 'Embedded C and RTOS',
    roleFamily: 'Embedded engineering',
    stackFamily: 'Automotive',
    libraryHref: '/library/embedded-c',
    patterns: [/\bembedded c\b/i, /\brtos\b/i, /\bisr\b/i, /\bwatchdog\b/i],
  },
  {
    name: 'AUTOSAR architecture',
    roleFamily: 'Embedded engineering',
    stackFamily: 'Automotive',
    libraryHref: '/library/embedded-c',
    patterns: [/\bautosar\b/i, /\bswc\b/i, /\bsome\/ip\b/i],
  },
  {
    name: 'MISRA C compliance',
    roleFamily: 'Embedded engineering',
    stackFamily: 'Automotive',
    libraryHref: '/library/embedded-c',
    patterns: [/\bmisra\b/i, /\bfunctional safety\b/i],
  },
  {
    name: 'SAP ABAP',
    roleFamily: 'Enterprise apps',
    stackFamily: 'SAP',
    libraryHref: '/library/sap-abap',
    patterns: [/\babap\b/i, /\bopen sql\b/i, /\balv\b/i],
  },
  {
    name: 'SAP CDS and RAP',
    roleFamily: 'Enterprise apps',
    stackFamily: 'SAP',
    libraryHref: '/library/sap-abap',
    patterns: [/\bcds\b/i, /\brap\b/i, /\bamdp\b/i],
  },
  {
    name: 'SAP integration diagnostics',
    roleFamily: 'Enterprise apps',
    stackFamily: 'SAP',
    libraryHref: '/library/sap-abap',
    patterns: [/\bidoc\b/i, /\bbapi\b/i, /\brfc\b/i, /\bfiori\b/i],
  },
  {
    name: 'Oracle HCM Cloud',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Oracle',
    libraryHref: '/library/oracle-hcm-cloud',
    patterns: [/\boracle hcm\b/i, /\bfast formulas?\b/i, /\botbi\b/i, /\bhcm extracts?\b/i],
  },
  {
    name: 'Finacle / Flexcube core banking',
    roleFamily: 'BFSI',
    stackFamily: 'Core banking',
    libraryHref: '/library/finacle-flexcube',
    patterns: [/\bfinacle\b/i, /\bflexcube\b/i, /\bcore banking\b/i, /\beod\b/i, /\bbod\b/i],
  },
  {
    name: 'AI Prompt Engineering',
    roleFamily: 'AI-era',
    stackFamily: 'AI',
    libraryHref: '/library/ai-prompt-engineering',
    patterns: [/\bprompt engineering\b/i, /\bprompt design\b/i, /\bllm\b/i, /\bgenai\b/i],
  },
  {
    name: 'Technical Communication',
    roleFamily: 'Applied judgment',
    stackFamily: 'Communication',
    libraryHref: '/library/technical-communication',
    patterns: [
      /\btechnical communication\b/i,
      /\bstakeholder communication\b/i,
      /\bdocumentation\b/i,
      /\bnetwork diagrams?\b/i,
      /\bknowledge base\b/i,
      /\bnon-technical stakeholders?\b/i,
      /\bwritten and verbal communication\b/i,
    ],
  },
];

export const sampleJds: SampleJd[] = [
  {
    id: 'senior-java',
    title: 'Senior Java Engineer',
    roleFamily: 'Software engineering',
    body: 'Senior Java Engineer needed for Java 21, Spring Boot 3, JVM performance, JPA/Hibernate, SQL, microservices resilience, circuit breaker patterns, and AWS production systems.',
  },
  {
    id: 'senior-react',
    title: 'Senior React Engineer',
    roleFamily: 'Frontend engineering',
    body: 'Senior React Engineer for React component architecture, TypeScript, Next.js App Router, Server Actions, performance profiling, memoization, and design-system workflows.',
  },
  {
    id: 'devops-sre',
    title: 'DevOps / SRE Lead',
    roleFamily: 'DevOps / SRE',
    body: 'DevOps SRE Lead with Kubernetes, HPA, StatefulSet operations, Terraform infrastructure as code, AWS EKS, observability, Prometheus, incident response, and SLO ownership.',
  },
  {
    id: 'salesforce',
    title: 'Senior Salesforce Developer',
    roleFamily: 'Enterprise apps',
    body: 'Senior Salesforce Developer with Apex, governor limits, SOQL selectivity, Lightning Web Components LWC, Platform Events, Service Cloud, and bulk-safe integration patterns.',
  },
  {
    id: 'embedded-c',
    title: 'Embedded C Automotive Engineer',
    roleFamily: 'Embedded engineering',
    body: 'Embedded C Automotive Engineer with AUTOSAR Classic and Adaptive, MISRA C, RTOS fundamentals, ISR-safe ring buffers, watchdog services, SOME/IP, and functional safety.',
  },
  {
    id: 'sap-abap',
    title: 'SAP ABAP Senior Consultant',
    roleFamily: 'Enterprise apps',
    body: 'SAP ABAP consultant for Open SQL, ALV event handling, CDS views, RAP, AMDP, IDoc inbound diagnostics, RFC and BAPI integration, transports, and Fiori authorization.',
  },
];

type RoleResearchTemplate = {
  id: string;
  match: RegExp;
  roleFamily: string;
  domain: string;
  researchSignals: string[];
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  assessmentFocus: string[];
};

const defaultRoleTemplate: RoleResearchTemplate = {
  id: 'professional-role',
  match: /.*/,
  roleFamily: 'Role-specific operations',
  domain: 'Professional services',
  researchSignals: ['role-title decomposition', 'transferable skill benchmark'],
  responsibilities: [
    'Own the core outcomes attached to the role and translate ambiguous requests into executable work.',
    'Coordinate with stakeholders, document decisions, and keep delivery risks visible.',
    'Use role-specific tools, reporting, and operating cadence to improve quality and speed.',
    'Review edge cases, escalate blockers, and continuously improve repeatable workflows.',
  ],
  requiredSkills: [
    'Domain knowledge',
    'Workflow analysis',
    'Stakeholder communication',
    'Documentation',
    'Reporting and dashboards',
    'Quality control',
    'Problem solving',
    'Process improvement',
  ],
  preferredSkills: ['Automation awareness', 'Data interpretation', 'Compliance awareness'],
  assessmentFocus: [
    'Practical scenario judgment',
    'Role-specific problem diagnosis',
    'Communication clarity',
    'Quality and risk tradeoffs',
  ],
};

const roleResearchTemplates: RoleResearchTemplate[] = [
  {
    id: 'frontend-engineering',
    match: /\b(frontend|front-end|react|ui engineer|next\.?js|web engineer)\b/i,
    roleFamily: 'Frontend engineering',
    domain: 'Web product engineering',
    researchSignals: [
      'frontend role benchmark',
      'web accessibility baseline',
      'performance review',
    ],
    responsibilities: [
      'Build production React and TypeScript interfaces from product requirements and design-system patterns.',
      'Debug rendering, state, accessibility, and client performance issues across desktop and mobile.',
      'Collaborate with product, design, backend, and QA teams to ship reliable user-facing workflows.',
      'Review UI changes for semantic HTML, keyboard behavior, visual polish, and regression risk.',
    ],
    requiredSkills: [
      'React component architecture',
      'TypeScript application design',
      'Next.js App Router',
      'Frontend performance debugging',
      'Accessibility testing',
      'Design-system workflows',
      'API integration',
      'Git pull-request review',
    ],
    preferredSkills: [
      'Playwright testing',
      'Analytics instrumentation',
      'Motion and micro-interactions',
    ],
    assessmentFocus: [
      'Component debugging',
      'State and rendering tradeoffs',
      'Accessible interaction design',
      'Production UI review',
    ],
  },
  {
    id: 'backend-engineering',
    match:
      /\b(backend|back-end|java|python|node|api engineer|full stack|software engineer|developer)\b/i,
    roleFamily: 'Software engineering',
    domain: 'Application engineering',
    researchSignals: [
      'backend role benchmark',
      'production reliability baseline',
      'code-review signals',
    ],
    responsibilities: [
      'Design and maintain APIs, services, data models, and integrations for production systems.',
      'Debug correctness, latency, security, and reliability issues using logs, tests, and code review.',
      'Write maintainable code with clear error handling, observability, and deployment discipline.',
      'Collaborate with frontend, product, QA, and platform teams to ship customer-facing features.',
    ],
    requiredSkills: [
      'Python production engineering',
      'Java 21 concurrency',
      'Spring Boot services',
      'SQL data modeling',
      'Microservices resilience',
      'AWS production systems',
      'API design',
      'Automated testing',
    ],
    preferredSkills: ['Kubernetes operations', 'Terraform infrastructure', 'Security review'],
    assessmentFocus: [
      'Code reasoning',
      'API and data-model design',
      'Failure-mode diagnosis',
      'Production tradeoff explanation',
    ],
  },
  {
    id: 'data',
    match:
      /\b(data analyst|data engineer|analytics engineer|bi analyst|data scientist|machine learning|ml engineer)\b/i,
    roleFamily: 'Data',
    domain: 'Data and analytics',
    researchSignals: ['data role benchmark', 'analytics workflow baseline', 'data-quality review'],
    responsibilities: [
      'Build reliable datasets, reports, pipelines, and decision-support artifacts for business teams.',
      'Diagnose data-quality, lineage, metric-definition, and performance issues across the analytics flow.',
      'Translate stakeholder questions into clear analysis, dashboards, and documented assumptions.',
      'Partner with engineering and operations teams on data contracts, automation, and governance.',
    ],
    requiredSkills: [
      'SQL data modeling',
      'Python production engineering',
      'Data pipeline orchestration',
      'Analytics engineering with dbt',
      'Cloud data warehousing',
      'Data quality checks',
      'Dashboard storytelling',
      'Experiment analysis',
    ],
    preferredSkills: [
      'AWS production systems',
      'Machine learning evaluation',
      'Cost-aware query tuning',
    ],
    assessmentFocus: [
      'SQL and data-model correctness',
      'Pipeline failure diagnosis',
      'Metric interpretation',
      'Analytical communication',
    ],
  },
  {
    id: 'devops-cloud-sre',
    match:
      /\b(devops|sre|site reliability|platform engineer|cloud engineer|kubernetes|aws|azure|gcp)\b/i,
    roleFamily: 'DevOps / SRE',
    domain: 'Cloud infrastructure',
    researchSignals: [
      'cloud operations benchmark',
      'incident response review',
      'infra-as-code baseline',
    ],
    responsibilities: [
      'Operate cloud infrastructure, deployment workflows, observability, and incident response practices.',
      'Automate infrastructure changes while controlling reliability, security, cost, and rollback risk.',
      'Partner with engineering teams on service readiness, SLOs, capacity, and production diagnostics.',
      'Maintain operational documentation, runbooks, and post-incident improvement loops.',
    ],
    requiredSkills: [
      'Kubernetes operations',
      'Terraform infrastructure',
      'AWS production systems',
      'Observability and incident response',
      'SLO ownership',
      'CI/CD operations',
      'Security groups and IAM',
      'Runbook documentation',
    ],
    preferredSkills: [
      'Cost optimization',
      'Disaster recovery planning',
      'Platform developer experience',
    ],
    assessmentFocus: [
      'Incident triage',
      'Infrastructure design',
      'Reliability tradeoffs',
      'Operational communication',
    ],
  },
  {
    id: 'it-infrastructure',
    match:
      /\b(network|it infrastructure|system administrator|systems administrator|desktop support|it support|helpdesk|windows server|microsoft 365|active directory)\b/i,
    roleFamily: 'IT infrastructure',
    domain: 'Infrastructure and support operations',
    researchSignals: [
      'IT infrastructure benchmark',
      'service operations baseline',
      'security controls review',
    ],
    responsibilities: [
      'Support users, endpoints, access, networking, cloud workspaces, and on-premise infrastructure.',
      'Troubleshoot service issues across identity, network, endpoint, server, and cloud layers.',
      'Maintain documentation, runbooks, change records, backup routines, and incident logs.',
      'Coordinate with vendors, security teams, and business stakeholders to protect uptime and data access.',
    ],
    requiredSkills: [
      'Remote desktop and endpoint support',
      'Identity and access administration',
      'Microsoft 365 administration',
      'Network infrastructure troubleshooting',
      'Windows Server administration',
      'AWS production systems',
      'Backup and disaster recovery',
      'Security compliance operations',
      'ITIL service operations',
      'IT operations automation',
    ],
    preferredSkills: ['Cisco networking', 'PowerShell scripting', 'Network monitoring tools'],
    assessmentFocus: [
      'Troubleshooting sequence',
      'Access-control judgment',
      'Incident documentation',
      'Infrastructure risk handling',
    ],
  },
  {
    id: 'security',
    match: /\b(security|soc analyst|cyber|grc|compliance|information security|appsec)\b/i,
    roleFamily: 'Security',
    domain: 'Security operations',
    researchSignals: [
      'security operations benchmark',
      'control-evidence review',
      'incident response baseline',
    ],
    responsibilities: [
      'Monitor, investigate, and document security events, vulnerabilities, access risks, and control gaps.',
      'Support policy, audit, compliance, incident response, and remediation workflows.',
      'Collaborate with IT, engineering, legal, and business teams on security-by-design decisions.',
      'Maintain evidence, runbooks, metrics, and executive-ready risk summaries.',
    ],
    requiredSkills: [
      'Security compliance operations',
      'Identity and access administration',
      'Incident response',
      'Threat modeling',
      'Endpoint security',
      'Vulnerability triage',
      'Audit evidence management',
      'Technical Communication',
    ],
    preferredSkills: ['SOC 2', 'ISO 27001', 'Cloud security posture management'],
    assessmentFocus: [
      'Security scenario judgment',
      'Control mapping',
      'Incident triage',
      'Risk communication',
    ],
  },
  {
    id: 'product',
    match: /\b(product manager|product owner|program manager|project manager|scrum master)\b/i,
    roleFamily: 'Product',
    domain: 'Product and delivery',
    researchSignals: ['product role benchmark', 'roadmap review', 'customer-discovery baseline'],
    responsibilities: [
      'Turn customer, market, and operational signals into clear product requirements and delivery priorities.',
      'Write PRDs, define success metrics, manage roadmaps, and coordinate cross-functional execution.',
      'Run discovery, experiments, launch reviews, and feedback loops with design, engineering, sales, and support.',
      'Communicate tradeoffs, risks, and decisions with enough clarity for teams to act.',
    ],
    requiredSkills: [
      'Product discovery',
      'Roadmap prioritization',
      'PRD writing',
      'User research',
      'Product analytics',
      'Experiment design',
      'Stakeholder communication',
      'API collaboration',
    ],
    preferredSkills: ['AI Prompt Engineering', 'SQL analysis', 'Go-to-market planning'],
    assessmentFocus: [
      'Prioritization judgment',
      'Requirement clarity',
      'Metric reasoning',
      'Cross-functional tradeoffs',
    ],
  },
  {
    id: 'design',
    match: /\b(product designer|ux|ui designer|visual designer|design lead|researcher)\b/i,
    roleFamily: 'Design',
    domain: 'Product design',
    researchSignals: ['design role benchmark', 'usability review', 'accessibility baseline'],
    responsibilities: [
      'Design flows, interfaces, prototypes, and research plans that solve user problems clearly.',
      'Translate product requirements and user evidence into accessible, testable design decisions.',
      'Partner with engineering on implementation details, design-system components, and QA review.',
      'Communicate design rationale, tradeoffs, and usability risks to stakeholders.',
    ],
    requiredSkills: [
      'User research',
      'Interaction design',
      'Information architecture',
      'Figma prototyping',
      'Accessibility testing',
      'Design-system workflows',
      'Usability analysis',
      'Stakeholder communication',
    ],
    preferredSkills: ['Frontend collaboration', 'Product analytics', 'Content design'],
    assessmentFocus: [
      'UX critique',
      'Accessibility judgment',
      'Design-system reasoning',
      'Research synthesis',
    ],
  },
  {
    id: 'sales',
    match:
      /\b(sales|account executive|business development|bdm|customer success|solutions consultant)\b/i,
    roleFamily: 'Sales',
    domain: 'Revenue operations',
    researchSignals: ['sales role benchmark', 'pipeline review', 'buyer-discovery baseline'],
    responsibilities: [
      'Prospect, qualify, discover, negotiate, and close opportunities with clear buyer-value articulation.',
      'Manage CRM hygiene, forecast accuracy, deal risks, and handoffs across marketing, product, and delivery.',
      'Run discovery calls, demos, proposals, objection handling, and renewal or expansion workflows.',
      'Document customer context and communicate next steps with urgency and accuracy.',
    ],
    requiredSkills: [
      'Discovery calls',
      'CRM pipeline management',
      'Consultative selling',
      'Proposal writing',
      'Forecasting',
      'Objection handling',
      'Stakeholder communication',
      'Commercial negotiation',
    ],
    preferredSkills: ['SaaS metrics', 'Account planning', 'Sales automation'],
    assessmentFocus: [
      'Discovery quality',
      'Deal-risk judgment',
      'Commercial communication',
      'Pipeline discipline',
    ],
  },
  {
    id: 'marketing',
    match:
      /\b(marketing|growth|seo|performance marketer|content marketer|brand manager|demand generation)\b/i,
    roleFamily: 'Marketing',
    domain: 'Growth and marketing',
    researchSignals: ['marketing role benchmark', 'campaign analytics review', 'funnel baseline'],
    responsibilities: [
      'Plan, launch, measure, and improve acquisition, lifecycle, content, brand, or demand-generation programs.',
      'Translate audience, channel, funnel, and campaign data into prioritized growth actions.',
      'Coordinate creative, sales, product, analytics, and agency workflows with clear briefs and reporting.',
      'Own experiment quality, budget discipline, and post-campaign learning loops.',
    ],
    requiredSkills: [
      'Google Analytics',
      'SEO content',
      'Paid acquisition',
      'Lifecycle email',
      'A/B testing',
      'HubSpot CRM',
      'Campaign reporting',
      'Funnel optimization',
    ],
    preferredSkills: ['Marketing automation', 'Conversion copywriting', 'Attribution modeling'],
    assessmentFocus: [
      'Campaign diagnosis',
      'Funnel math',
      'Audience-message fit',
      'Experiment design',
    ],
  },
  {
    id: 'recruiting-hr',
    match: /\b(recruiter|talent acquisition|hr|human resources|people ops|sourcer|staffing)\b/i,
    roleFamily: 'People operations',
    domain: 'Hiring and HR operations',
    researchSignals: [
      'recruiting role benchmark',
      'candidate funnel review',
      'compliance baseline',
    ],
    responsibilities: [
      'Source, screen, coordinate, and close candidates against role requirements and hiring-manager priorities.',
      'Maintain ATS hygiene, interview scheduling, candidate communication, and recruitment reporting.',
      'Partner with business teams on scorecards, offers, onboarding, and process improvement.',
      'Protect candidate experience, data privacy, fairness, and compliance in hiring workflows.',
    ],
    requiredSkills: [
      'Candidate sourcing',
      'Screening interviews',
      'ATS workflow management',
      'Job description calibration',
      'Stakeholder communication',
      'Offer coordination',
      'Recruitment analytics',
      'Candidate experience',
    ],
    preferredSkills: ['LinkedIn Recruiter', 'Boolean search', 'HR compliance'],
    assessmentFocus: [
      'Screening judgment',
      'Funnel prioritization',
      'Candidate communication',
      'Hiring process quality',
    ],
  },
  {
    id: 'enterprise-document-platform',
    match:
      /\b(opentext|xpression|document generation|document composition|customer communications|ccm)\b/i,
    roleFamily: 'Enterprise apps',
    domain: 'Enterprise document generation',
    researchSignals: [
      'enterprise document-platform benchmark',
      'migration readiness review',
      'template remediation baseline',
    ],
    responsibilities: [
      'Develop, upgrade, migrate, and support enterprise document-generation platforms across production environments.',
      'Remediate templates, validate migrated output, and coordinate release testing with business and technical teams.',
      'Diagnose performance, integration, deployment, and environment issues across database and Windows platform layers.',
      'Document migration risks, rollback paths, stabilization steps, and post-go-live support evidence.',
    ],
    requiredSkills: [
      'OpenText xPression development',
      'xPression platform upgrade and migration',
      'Template migration and remediation',
      'Document platform performance tuning',
      'SQL Server platform operations',
      'Windows platform operations',
      'Deployment testing and stabilization',
      'Technical Communication',
    ],
    preferredSkills: [
      'Output validation',
      'Release coordination',
      'Enterprise implementation support',
    ],
    assessmentFocus: [
      'Migration scenario diagnosis',
      'Template remediation judgment',
      'Performance troubleshooting',
      'Deployment stabilization planning',
    ],
  },
  {
    id: 'enterprise-apps',
    match: /\b(sap|abap|salesforce|oracle|hcm|finacle|flexcube|erp|crm consultant)\b/i,
    roleFamily: 'Enterprise apps',
    domain: 'Enterprise systems',
    researchSignals: [
      'enterprise-app role benchmark',
      'configuration review',
      'integration baseline',
    ],
    responsibilities: [
      'Configure, extend, test, and support enterprise workflows across business processes and integrations.',
      'Translate user requirements into configuration, data, reports, controls, and change-management plans.',
      'Debug defects across permissions, master data, workflow, integration, and reporting layers.',
      'Document functional decisions and coordinate UAT, release, and support handoffs.',
    ],
    requiredSkills: [
      'Business process mapping',
      'UAT coordination',
      'Configuration reasoning',
      'Role and permission design',
      'Data migration',
      'Release management',
      'User-support communication',
    ],
    preferredSkills: ['Regression testing', 'Master data governance', 'Change-management planning'],
    assessmentFocus: [
      'Configuration reasoning',
      'Integration diagnosis',
      'Business-process judgment',
      'User-support communication',
    ],
  },
  {
    id: 'finance',
    match:
      /\b(accountant|finance|financial analyst|accounts payable|accounts receivable|controller)\b/i,
    roleFamily: 'Finance',
    domain: 'Finance operations',
    researchSignals: ['finance role benchmark', 'controls review', 'reporting baseline'],
    responsibilities: [
      'Prepare, reconcile, analyze, and report financial data with accuracy, controls, and clear audit trails.',
      'Support month-end close, variance analysis, billing, collections, payables, and compliance routines.',
      'Partner with operations and leadership on forecasts, budgets, cash-flow visibility, and process improvement.',
      'Maintain documentation and escalate exceptions before they become reporting or control failures.',
    ],
    requiredSkills: [
      'Financial analysis',
      'Excel modeling',
      'Reconciliation',
      'ERP workflows',
      'Variance analysis',
      'Compliance documentation',
      'Reporting and dashboards',
      'Process controls',
    ],
    preferredSkills: ['SQL data modeling', 'Automation awareness', 'Audit support'],
    assessmentFocus: [
      'Numerical accuracy',
      'Control judgment',
      'Exception handling',
      'Financial communication',
    ],
  },
  {
    id: 'healthcare',
    match: /\b(nurse|doctor|medical|clinical|clinic|healthcare|pharmacist|physiotherapist)\b/i,
    roleFamily: 'Healthcare operations',
    domain: 'Clinical and healthcare support',
    researchSignals: [
      'healthcare role benchmark',
      'patient-safety baseline',
      'documentation review',
    ],
    responsibilities: [
      'Deliver role-appropriate clinical or healthcare support while protecting patient safety and privacy.',
      'Assess needs, follow protocols, document care or service activity, and escalate risk promptly.',
      'Coordinate with clinicians, operations, patients, families, and administrative teams.',
      'Maintain compliance with healthcare documentation, hygiene, quality, and communication standards.',
    ],
    requiredSkills: [
      'Clinical protocol adherence',
      'Patient communication',
      'Triage judgment',
      'EMR documentation',
      'Care coordination',
      'Compliance awareness',
      'Incident escalation',
      'Quality control',
    ],
    preferredSkills: ['Healthcare analytics', 'Telehealth workflow', 'Training and mentoring'],
    assessmentFocus: [
      'Patient-safety judgment',
      'Protocol reasoning',
      'Documentation accuracy',
      'Escalation decisions',
    ],
  },
];

const titleAddOns: Array<{
  match: RegExp;
  researchSignals: string[];
  responsibilities: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  assessmentFocus: string[];
}> = [
  {
    match: /\bsap\b/i,
    researchSignals: ['SAP delivery overlay'],
    responsibilities: [
      'Map SAP business processes, master data, integration touchpoints, and UAT scenarios to operational outcomes.',
    ],
    requiredSkills: [
      'SAP functional configuration',
      'SAP integration diagnostics',
      'Business process mapping',
      'UAT coordination',
      'Master data governance',
    ],
    preferredSkills: ['Role and permission design', 'Regression testing'],
    assessmentFocus: ['SAP process diagnosis'],
  },
  {
    match: /\babap\b/i,
    researchSignals: ['SAP ABAP technical overlay'],
    responsibilities: ['Debug ABAP, Open SQL, integration, and transport issues safely.'],
    requiredSkills: ['SAP ABAP', 'SAP CDS and RAP', 'SAP integration diagnostics'],
    preferredSkills: ['Performance tuning', 'Fiori authorization'],
    assessmentFocus: ['ABAP code and integration reasoning'],
  },
  {
    match: /\bsalesforce\b/i,
    researchSignals: ['Salesforce delivery overlay'],
    responsibilities: [
      'Extend Salesforce safely across automation, UI, data access, and service workflows.',
    ],
    requiredSkills: ['Salesforce Apex', 'Salesforce LWC', 'SOQL data access'],
    preferredSkills: ['Service Cloud', 'Governor-limit design'],
    assessmentFocus: ['Salesforce platform reasoning'],
  },
  {
    match: /\boracle hcm\b/i,
    researchSignals: ['Oracle HCM delivery overlay'],
    responsibilities: [
      'Configure and diagnose Oracle HCM workflows, extracts, reports, and formula behavior.',
    ],
    requiredSkills: ['Oracle HCM Cloud', 'Business process mapping', 'UAT coordination'],
    preferredSkills: ['OTBI reporting', 'Fast Formula debugging'],
    assessmentFocus: ['HCM process and reporting diagnosis'],
  },
  {
    match: /\b(finacle|flexcube)\b/i,
    researchSignals: ['core-banking delivery overlay'],
    responsibilities: [
      'Operate and diagnose core-banking process, batch, product, and integration issues.',
    ],
    requiredSkills: [
      'Finacle / Flexcube core banking',
      'Business process mapping',
      'UAT coordination',
    ],
    preferredSkills: ['Batch operations', 'Core banking reconciliation'],
    assessmentFocus: ['Core-banking scenario diagnosis'],
  },
  {
    match: /\b(ai|llm|genai|generative ai|machine learning|ml)\b/i,
    researchSignals: ['AI-era skill overlay', 'model-evaluation baseline'],
    responsibilities: [
      'Evaluate AI-assisted workflows for quality, safety, cost, and failure modes before release.',
    ],
    requiredSkills: [
      'AI Prompt Engineering',
      'LLM evaluation',
      'Responsible AI review',
      'AI Tool-Use Judgment',
    ],
    preferredSkills: ['RAG workflow awareness', 'Model-cost analysis'],
    assessmentFocus: ['AI output critique', 'Human-in-the-loop judgment'],
  },
  {
    match: /\b(aws|azure|gcp|cloud)\b/i,
    researchSignals: ['cloud-platform overlay'],
    responsibilities: [
      'Account for cloud security, cost, deployment, and operational readiness in delivery.',
    ],
    requiredSkills: ['AWS production systems', 'Cloud cost awareness', 'IAM and access control'],
    preferredSkills: ['Terraform infrastructure', 'Observability and incident response'],
    assessmentFocus: ['Cloud tradeoff reasoning'],
  },
  {
    match: /\b(lead|manager|head|principal|staff|senior)\b/i,
    researchSignals: ['seniority and leadership overlay'],
    responsibilities: [
      'Mentor team members, raise operating standards, and make tradeoffs visible.',
    ],
    requiredSkills: ['Leadership communication', 'Review and coaching', 'Decision documentation'],
    preferredSkills: ['Hiring support', 'Operating cadence design'],
    assessmentFocus: ['Leadership judgment'],
  },
];

function uniqueMerge(...groups: string[][]): string[] {
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const group of groups) {
    for (const item of group) {
      const normalized = item.trim();
      const key = normalized.toLowerCase();
      if (!normalized || seen.has(key)) continue;
      seen.add(key);
      merged.push(normalized);
    }
  }
  return merged;
}

function normalizeJobTitle(jobTitle: string): string {
  return jobTitle
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s/&.+#()-]/g, '')
    .trim()
    .slice(0, 160);
}

function titleCaseJobTitle(jobTitle: string): string {
  const keepUpper = new Set([
    'ai',
    'api',
    'aws',
    'azure',
    'bi',
    'crm',
    'erp',
    'gcp',
    'hr',
    'it',
    'llm',
    'ml',
    'mm',
    'qa',
    'sap',
    'seo',
    'sre',
    'ui',
    'ux',
  ]);
  return normalizeJobTitle(jobTitle)
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase();
      if (keepUpper.has(lower.replace(/[^a-z0-9]/g, ''))) return word.toUpperCase();
      return lower.replace(/(^|[(/&+-])([a-z])/g, (_, prefix: string, char: string) => {
        return `${prefix}${char.toUpperCase()}`;
      });
    })
    .join(' ');
}

function inferSeniorityFromTitle(jobTitle: string): string {
  if (/\b(principal|head|director|vp|chief)\b/i.test(jobTitle)) return 'Principal / leadership';
  if (/\b(staff|architect)\b/i.test(jobTitle)) return 'Staff / architect';
  if (/\b(senior|lead|manager)\b/i.test(jobTitle)) return 'Senior';
  if (/\b(junior|associate|trainee|intern)\b/i.test(jobTitle)) return 'Junior';
  return 'Mid-level';
}

export function researchJobTitleForJdForge(jobTitle: string): JdForgeTitleResearch {
  const normalizedTitle = titleCaseJobTitle(jobTitle);
  if (normalizedTitle.length < 3) {
    throw new Error('Job title must be at least 3 characters.');
  }

  const primary =
    roleResearchTemplates.find((template) => template.match.test(normalizedTitle)) ??
    defaultRoleTemplate;
  const matchingAddOns = titleAddOns.filter((addOn) => addOn.match.test(normalizedTitle));
  const responsibilities = uniqueMerge(
    primary.responsibilities,
    ...matchingAddOns.map((addOn) => addOn.responsibilities),
  ).slice(0, 7);
  const requiredSkills = uniqueMerge(
    primary.requiredSkills,
    ...matchingAddOns.map((addOn) => addOn.requiredSkills),
  ).slice(0, 16);
  const preferredSkills = uniqueMerge(
    primary.preferredSkills,
    ...matchingAddOns.map((addOn) => addOn.preferredSkills),
  ).slice(0, 8);
  const assessmentFocus = uniqueMerge(
    primary.assessmentFocus,
    ...matchingAddOns.map((addOn) => addOn.assessmentFocus),
  ).slice(0, 8);
  const researchSignals = uniqueMerge(
    primary.researchSignals,
    ...matchingAddOns.map((addOn) => addOn.researchSignals),
  );
  const seniority = inferSeniorityFromTitle(normalizedTitle);

  const numberedResponsibilities = responsibilities
    .map((item, index) => `${index + 1}. ${item}`)
    .join('\n');

  const generatedJd = [
    'Job description',
    normalizedTitle,
    '',
    `Seniority: ${seniority}`,
    `Domain: ${primary.domain}`,
    `Role family: ${primary.roleFamily}`,
    '',
    'Research basis',
    `QOrium role-title research synthesized this JD from: ${researchSignals.join(', ')}.`,
    '',
    'Key Responsibilities',
    numberedResponsibilities,
    '',
    `Technical Skills Required: ${requiredSkills.join(', ')}.`,
    `Technical Skills Preferred: ${preferredSkills.join(', ')}.`,
    '',
    `Assessment Focus: ${assessmentFocus.join(', ')}.`,
  ].join('\n');

  return {
    jobTitle: normalizedTitle,
    generatedJd,
    roleFamily: primary.roleFamily,
    domain: primary.domain,
    seniority,
    researchProvider: 'qorium-title-research-v1',
    researchSignals,
  };
}

export function slugifyProof(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stableHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function matchedPhrases(text: string, rule: SkillRule): string[] {
  const phrases = new Set<string>();
  for (const pattern of rule.patterns) {
    const match = text.match(pattern);
    if (match?.[0]) {
      phrases.add(match[0]);
    }
  }
  return [...phrases];
}

function skillWeight(matchCount: number, index: number, derived = false): number {
  const matchBoost = Math.min(0.28, matchCount * 0.065);
  const orderPenalty = Math.min(0.1, index * 0.002);
  const base = derived ? 0.58 : 0.64;
  return Math.min(0.96, Math.max(0.56, base + matchBoost - orderPenalty));
}

const genericHeadingLabels = [
  /^job description$/i,
  /^title$/i,
  /^job title$/i,
  /^seniority$/i,
  /^domain$/i,
  /^role family$/i,
  /^research basis$/i,
  /^key responsibilities$/i,
  /^assessment focus$/i,
  /^qorium role-title research synthesized this jd from$/i,
  /^qualifications?(&| and)? requirements?$/i,
  /^education$/i,
  /^experience$/i,
  /^employment type$/i,
  /^department$/i,
  /^location$/i,
  /^technical skills? required$/i,
  /^technical skills? preferred$/i,
  /^certifications? ?(?:\(preferred\))?$/i,
  /^soft skills$/i,
  /^mandatory work-from-home equipment requirements$/i,
  /^device type$/i,
  /^operating system$/i,
  /^screen size$/i,
  /^screen resolution$/i,
  /^processor$/i,
  /^ram$/i,
  /^internet speed$/i,
  /^remote tool$/i,
  /^power backup$/i,
];

const genericSkillSection =
  /\b(?:technical skills?|required skills?|preferred skills?|must[-\s]?have skills?|mandatory skills?|tools?|technologies|stack)\b/i;
const jobSignal =
  /\b(?:engineer|developer|administrator|admin|support|analyst|consultant|architect|specialist|manager|lead|scientist|designer|technician|operator|recruiter|sourcer|marketer|accountant|nurse|doctor|coordinator|executive|officer|owner|associate)\b/i;
const responsibilitySignal =
  /\b(?:responsibilities|requirements|skills?|experience|support|manage|administer|configure|monitor|troubleshoot|design|develop|maintain)\b/i;
const skillHeadingSignal =
  /\b(?:desktop|support|management|administration|engineering|operations|security|backup|recovery|network|server|identity|access|documentation|knowledge|analytics|automation|configuration|integration|diagnostics|mapping|coordination|communication|testing|acquisition|marketing|crm|sourcing|interviews|workflow|compliance|protocol|patient|triage|emr|care|financial|reconciliation|modeling|reporting|controls|platform|upgrade|migration|remediation|validation|template|performance|tuning|troubleshooting|deployment|stabilization|implementation)\b/i;

function normalizeCandidateLabel(value: string): string {
  return value
    .replace(/^\d+\.\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*[|–—-]\s*$/g, '')
    .replace(/\s*[.;:]+\s*$/g, '')
    .replace(/\s*\([^)]*\)\s*$/g, '')
    .replace(/&/g, 'and')
    .trim();
}

function isUsefulCandidateLabel(value: string): boolean {
  const normalized = normalizeCandidateLabel(value);
  if (normalized.length < 3 || normalized.length > 70) return false;
  if (genericHeadingLabels.some((pattern) => pattern.test(normalized))) return false;
  if (/^\d+[-\d./\s]*(?:years?|yrs?)?$/i.test(normalized)) return false;
  if (/^(full-time|remote|work from home|remote india)$/i.test(normalized)) return false;
  return /[a-z]/i.test(normalized);
}

function isLikelyNumberedSkillHeading(value: string): boolean {
  const normalized = normalizeCandidateLabel(value);
  if (/[.!?]$/.test(normalized)) return false;
  return normalized.split(/\s+/).length <= 8;
}

function classifyDerivedSkill(
  name: string,
): Pick<ProofSkill, 'roleFamily' | 'stackFamily' | 'libraryHref'> {
  if (/\b(?:opentext|xpression|template migration|template remediation)\b/i.test(name)) {
    return {
      roleFamily: 'Enterprise apps',
      stackFamily: 'Enterprise document generation',
      libraryHref: '/library/technical-communication',
    };
  }
  if (
    /\b(?:platform upgrade|migration|remediation|stabilization|implementation support)\b/i.test(
      name,
    )
  ) {
    return {
      roleFamily: 'Enterprise apps',
      stackFamily: 'Migration and release support',
      libraryHref: '/library/technical-communication',
    };
  }
  if (/\b(?:performance tuning|troubleshooting|system efficiency)\b/i.test(name)) {
    return {
      roleFamily: 'Enterprise apps',
      stackFamily: 'Performance diagnostics',
      libraryHref: '/library/technical-communication',
    };
  }
  if (/\b(?:sql server|t-sql)\b/i.test(name)) {
    return {
      roleFamily: 'Data',
      stackFamily: 'SQL Server',
      libraryHref: '/library/sql',
    };
  }
  if (/\b(?:windows platform|windows environment)\b/i.test(name)) {
    return {
      roleFamily: 'IT infrastructure',
      stackFamily: 'Windows',
      libraryHref: '/library/devops-sre',
    };
  }
  if (/\b(?:aws|ec2|s3|iam|vpc|cloud|workspaces?)\b/i.test(name)) {
    return {
      roleFamily: 'Cloud engineering',
      stackFamily: 'Cloud operations',
      libraryHref: '/library/aws',
    };
  }
  if (/\b(?:sql|database|data|etl|warehouse|analytics|reporting|tableau|power bi)\b/i.test(name)) {
    return {
      roleFamily: 'Data',
      stackFamily: 'Data and analytics',
      libraryHref: '/library/data-engineering',
    };
  }
  if (
    /\b(?:python|powershell|java|typescript|javascript|react|api|automation|scripting)\b/i.test(
      name,
    )
  ) {
    return {
      roleFamily: 'Software engineering',
      stackFamily: 'Programming and automation',
      libraryHref: '/library/python',
    };
  }
  if (
    /\b(?:product|roadmap|prd|user research|experiment|go-to-market|prioritization)\b/i.test(name)
  ) {
    return {
      roleFamily: 'Product',
      stackFamily: 'Product management',
      libraryHref: '/library/technical-communication',
    };
  }
  if (
    /\b(?:marketing|seo|paid acquisition|campaign|funnel|hubspot|lifecycle email|a\/b)\b/i.test(
      name,
    )
  ) {
    return {
      roleFamily: 'Marketing',
      stackFamily: 'Growth operations',
      libraryHref: '/library/technical-communication',
    };
  }
  if (/\b(?:recruit|candidate|ats|sourcing|screening|offer|hiring|boolean search)\b/i.test(name)) {
    return {
      roleFamily: 'People operations',
      stackFamily: 'Recruiting operations',
      libraryHref: '/library/technical-communication',
    };
  }
  if (
    /\b(?:finance|financial|accounting|reconciliation|erp|variance|audit support|controls)\b/i.test(
      name,
    )
  ) {
    return {
      roleFamily: 'Finance',
      stackFamily: 'Finance operations',
      libraryHref: '/library/sql',
    };
  }
  if (/\b(?:clinical|patient|triage|emr|care coordination|healthcare|protocol)\b/i.test(name)) {
    return {
      roleFamily: 'Healthcare operations',
      stackFamily: 'Clinical operations',
      libraryHref: '/library/technical-communication',
    };
  }
  if (/\b(?:network|cisco|router|switch|firewall|vpn|vlan|dns|dhcp|bandwidth|qos)\b/i.test(name)) {
    return {
      roleFamily: 'IT infrastructure',
      stackFamily: 'Networking',
      libraryHref: '/library/devops-sre',
    };
  }
  if (/\b(?:identity|access|active directory|entra|microsoft 365|m365|rbac|policy)\b/i.test(name)) {
    return {
      roleFamily: 'IT infrastructure',
      stackFamily: 'Identity and access',
      libraryHref: '/library/devops-sre',
    };
  }
  if (/\b(?:security|compliance|iso|soc|hipaa|gdpr|audit|encryption|ssl)\b/i.test(name)) {
    return {
      roleFamily: 'Security',
      stackFamily: 'Security operations',
      libraryHref: '/library/devops-sre',
    };
  }
  if (
    /\b(?:documentation|communication|stakeholder|knowledge|runbook|sop|change management)\b/i.test(
      name,
    )
  ) {
    return {
      roleFamily: 'Applied judgment',
      stackFamily: 'Communication',
      libraryHref: '/library/technical-communication',
    };
  }
  return {
    roleFamily: 'Applied judgment',
    stackFamily: 'Role-specific skill',
    libraryHref: '/library/technical-communication',
  };
}

function appendCandidate(
  candidates: Map<string, { label: string; phrases: Set<string> }>,
  label: string,
  sourcePhrase = label,
) {
  const normalized = normalizeCandidateLabel(label);
  if (!isUsefulCandidateLabel(normalized)) return;
  const key = slugifyProof(normalized);
  if (!key) return;
  const existing = candidates.get(key);
  if (existing) {
    existing.phrases.add(sourcePhrase.trim());
    return;
  }
  candidates.set(key, { label: normalized, phrases: new Set([sourcePhrase.trim()]) });
}

function candidateFromSkillSentence(line: string): string {
  return normalizeCandidateLabel(line)
    .replace(/^\d+\+?\s*years?\s+of\s+experience\s+(?:in|with)\s+/i, '')
    .replace(/^mandatory\s+experience\s+(?:in|with)\s+/i, '')
    .replace(/^hands-on\s+experience\s+(?:in|with)\s+/i, '')
    .replace(/^strong\s+knowledge\s+of\s+/i, '')
    .replace(/^expertise\s+in\s+/i, '')
    .replace(/^experience\s+working\s+with\s+/i, '')
    .replace(/^experience\s+(?:in|with)\s+/i, '')
    .replace(/^knowledge\s+of\s+/i, '')
    .replace(/\s+techniques$/i, '')
    .replace(/\s+activities$/i, '')
    .trim();
}

function isDuplicateDerivedSkill(candidate: string, mappedSkill: ProofSkill): boolean {
  const candidateSlug = slugifyProof(candidate);
  if (candidateSlug === slugifyProof(mappedSkill.name)) return true;

  const candidateWords = new Set(candidateSlug.split('-').filter((word) => word.length > 3));
  const mappedWords = new Set(
    slugifyProof(mappedSkill.name)
      .split('-')
      .filter((word) => word.length > 3),
  );
  const sharedWordCount = [...candidateWords].filter((word) => mappedWords.has(word)).length;
  if (sharedWordCount >= 2) return true;

  const candidateLower = candidate.toLowerCase();
  return mappedSkill.sourcePhrases.some(
    (phrase) => phrase.length > 4 && candidateLower.includes(phrase.toLowerCase()),
  );
}

function extractDerivedSkills(text: string, mappedSkills: ProofSkill[]): ProofSkill[] {
  if (!jobSignal.test(text) || !responsibilitySignal.test(text)) return [];

  const mappedKeys = new Set(mappedSkills.map((skill) => slugifyProof(skill.name)));
  const candidates = new Map<string, { label: string; phrases: Set<string> }>();
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
  let activeSkillSection = false;

  for (const line of lines) {
    const bareHeading = normalizeCandidateLabel(line.replace(/:$/, ''));
    if (genericSkillSection.test(bareHeading) && line.endsWith(':')) {
      activeSkillSection = true;
      continue;
    }
    if (
      activeSkillSection &&
      /^(responsibilities|key responsibilities|job description|education|location)$/i.test(
        bareHeading,
      )
    ) {
      activeSkillSection = false;
    }

    const numberedHeading = line.match(/^\d+\.\s+(.{4,80})$/);
    if (numberedHeading?.[1]) {
      if (isLikelyNumberedSkillHeading(numberedHeading[1])) {
        appendCandidate(candidates, numberedHeading[1], numberedHeading[1]);
      }
      continue;
    }

    const inlineSkillList = line.match(
      /\b(?:technical skills?|required skills?|preferred skills?|must[-\s]?have skills?|mandatory skills?|tools?|technologies|stack)[^:]{0,40}:\s*(.+)$/i,
    );
    if (inlineSkillList?.[1]) {
      inlineSkillList[1]
        .split(/[,;•]/)
        .map((item) => normalizeCandidateLabel(item))
        .filter((item) => item.length >= 3 && item.length <= 45)
        .slice(0, MAX_EXTRACTED_SKILLS)
        .forEach((item) => appendCandidate(candidates, item, item));
      continue;
    }

    if (activeSkillSection) {
      const skillSentence = candidateFromSkillSentence(line);
      if (skillSentence.length >= 3 && skillSentence.length <= 70) {
        appendCandidate(candidates, skillSentence, line);
      }
      continue;
    }

    const colonHeading = line.match(/^([A-Za-z][A-Za-z0-9/().+&\s-]{3,70}):\s*(.+)$/);
    if (!colonHeading?.[1] || !colonHeading[2]) continue;

    const heading = normalizeCandidateLabel(colonHeading[1]);
    const value = colonHeading[2].trim();
    if (genericSkillSection.test(heading)) {
      value
        .split(/[,;•]/)
        .map((item) => normalizeCandidateLabel(item))
        .filter((item) => item.length >= 3 && item.length <= 45)
        .slice(0, MAX_EXTRACTED_SKILLS)
        .forEach((item) => appendCandidate(candidates, item, item));
    } else if (skillHeadingSignal.test(heading)) {
      appendCandidate(candidates, heading, heading);
    }
  }

  return [...candidates.values()]
    .filter(
      (candidate) =>
        !mappedKeys.has(slugifyProof(candidate.label)) &&
        !mappedSkills.some((skill) => isDuplicateDerivedSkill(candidate.label, skill)),
    )
    .slice(0, MAX_EXTRACTED_SKILLS)
    .map((candidate, index) => {
      const classified = classifyDerivedSkill(candidate.label);
      const phrases = [...candidate.phrases];
      return {
        name: candidate.label,
        weight: skillWeight(phrases.length, index, true),
        roleFamily: classified.roleFamily,
        stackFamily: classified.stackFamily,
        sourcePhrases: phrases,
        libraryHref: classified.libraryHref,
      } satisfies ProofSkill;
    });
}

function inferRoleTitle(text: string): string {
  const sample = sampleJds.find((jd) => jd.body === text);
  if (sample) return sample.title;
  if (/opentext|xpression/i.test(text)) return 'OpenText xPression assessment';
  if (/salesforce/i.test(text)) return 'Salesforce assessment';
  if (
    /network engineer|it infrastructure|end-user support|remote desktop|active directory|azure entra|microsoft 365|windows server|cisco|vpn|vlan|\bdns\b|\bdhcp\b/i.test(
      text,
    )
  ) {
    return 'IT infrastructure assessment';
  }
  if (/data engineer|analytics engineer|airflow|dbt|snowflake|data pipelines?/i.test(text)) {
    return 'Data engineering assessment';
  }
  if (/python/i.test(text)) return 'Python assessment';
  if (/react|frontend|next/i.test(text)) return 'Frontend assessment';
  if (/kubernetes|sre|devops/i.test(text)) return 'DevOps assessment';
  if (/sap|abap/i.test(text)) return 'SAP ABAP assessment';
  if (/embedded|autosar|misra/i.test(text)) return 'Embedded systems assessment';
  if (/java|spring/i.test(text)) return 'Java backend assessment';
  return 'Custom role assessment';
}

function sourceForJd(normalized: string): JdForgeDemoResult['source'] {
  const sample = sampleJds.find((jd) => jd.body === normalized);
  return {
    mode: sample ? 'sample-jd' : 'pasted-jd',
    label: sample ? sample.title : 'Pasted job description',
    generatedJd: normalized,
    researchProvider: 'qorium-jd-extractor-v1',
    researchSignals: sample
      ? ['seeded demo role graph', sample.roleFamily]
      : ['pasted JD skill extraction', 'structured heading parser'],
  };
}

function formatPlan(skills: ProofSkill[]): JdForgeDemoResult['assessment'] {
  const itemCount = skills.length >= 3 ? 20 : 10;
  const durationMinutes = skills.length >= 3 ? Math.min(60, 24 + skills.length * 4) : 18;
  const coverageBadge =
    skills.length >= 5
      ? 'High coverage from seeded QOrium role graph'
      : skills.length >= 3
        ? 'Partial coverage; SME review recommended'
        : 'Low confidence; needs JD rewrite or SME review';

  return {
    itemCount,
    durationMinutes,
    coverageBadge,
    formats: [
      { label: 'MCQ', count: Math.round(itemCount * 0.4) },
      { label: 'Code / work sample', count: Math.round(itemCount * 0.3) },
      { label: 'Design or SJT', count: Math.round(itemCount * 0.2) },
      { label: 'Case study', count: itemCount - Math.round(itemCount * 0.9) },
    ],
    battery: skills.slice(0, 6).map((skill, index) => ({
      skill: skill.name,
      itemTypes:
        index % 3 === 0 ? 'MCQ + work sample' : index % 3 === 1 ? 'MCQ + design' : 'MCQ + case',
      coverage: `${Math.round(skill.weight * 100)}% JD weight`,
    })),
  };
}

export function runJdForgeDemo(
  jdText: string,
  options: { roleTitle?: string; source?: JdForgeDemoResult['source'] } = {},
): JdForgeDemoResult {
  const normalized = jdText.trim();
  const mappedSkills = skillRules
    .map((rule, index) => {
      const phrases = matchedPhrases(normalized, rule);
      if (phrases.length === 0) return null;
      return {
        name: rule.name,
        weight: skillWeight(phrases.length, index),
        roleFamily: rule.roleFamily,
        stackFamily: rule.stackFamily,
        sourcePhrases: phrases,
        libraryHref: rule.libraryHref,
      } satisfies ProofSkill;
    })
    .filter((skill): skill is ProofSkill => skill !== null);
  const derivedSkills = extractDerivedSkills(normalized, mappedSkills);
  const skills = [...mappedSkills, ...derivedSkills]
    .sort((left, right) => right.weight - left.weight || left.name.localeCompare(right.name))
    .slice(0, MAX_EXTRACTED_SKILLS);

  const confidence = Math.min(0.97, skills.length === 0 ? 0.18 : 0.48 + skills.length * 0.07);
  const lowConfidenceReason =
    skills.length === 0
      ? 'JD-Forge could not extract mapped QOrium skills from this text. The public demo is showing the honest low-confidence state instead of padding the result.'
      : undefined;

  const result: JdForgeDemoResult = {
    ok: true,
    planId: `jdplan_${stableHash(normalized).slice(0, 7)}`,
    inputHash: `sha256:${stableHash(normalized).repeat(8).slice(0, 64)}`,
    roleTitle: options.roleTitle ?? inferRoleTitle(normalized),
    source: options.source ?? sourceForJd(normalized),
    skills,
    assessment: formatPlan(skills),
    audit: {
      jdLength: normalized.length,
      skillCount: skills.length,
      confidence,
      generatedAt: GENERATED_AT,
    },
  };

  if (lowConfidenceReason) {
    return { ...result, lowConfidenceReason };
  }
  return result;
}

export function runJdForgeFromJobTitle(jobTitle: string): JdForgeDemoResult {
  const research = researchJobTitleForJdForge(jobTitle);
  const result = runJdForgeDemo(research.generatedJd, {
    roleTitle: `${research.jobTitle} assessment`,
    source: {
      mode: 'job-title',
      label: `Job title: ${research.jobTitle}`,
      jobTitle: research.jobTitle,
      generatedJd: research.generatedJd,
      researchProvider: research.researchProvider,
      researchSignals: research.researchSignals,
    },
  });

  return {
    ...result,
    audit: {
      ...result.audit,
      confidence: Math.max(result.audit.confidence, 0.82),
    },
  };
}

function audit(id: string): GraderAuditMeta {
  const base = stableHash(id).repeat(8).slice(0, 64);
  return {
    rubricVersion: `rubric-${id.split('-')[0]}-2026-06`,
    modelVersion: 'qorium-grader-v1-audit-fixture',
    promptHash: `sha256:${base}`,
    inputHash: `sha256:${stableHash(`${id}:input`).repeat(8).slice(0, 64)}`,
    gradedAt: GENERATED_AT,
  };
}

export const graderExemplars: GraderExemplar[] = [
  {
    id: 'java-jmm-happens-before',
    title: 'Java memory-model explanation',
    skill: 'Java 21 concurrency',
    family: 'scenario',
    question: 'Explain what the happens-before relationship guarantees in the Java Memory Model.',
    answer:
      'It guarantees visibility of writes from one action to a later action when the relation exists. It does not mean the CPU physically ran those instructions in that exact order.',
    rubric: [
      { criterion: 'Visibility guarantee', weight: 40, signal: 'Names cross-thread visibility' },
      {
        criterion: 'Ordering nuance',
        weight: 35,
        signal: 'Separates logical ordering from CPU order',
      },
      {
        criterion: 'Practical implication',
        weight: 25,
        signal: 'Mentions synchronization correctness',
      },
    ],
    score: 87,
    breakdown: [
      { criterion: 'Visibility guarantee', score: 38, note: 'Core guarantee is present.' },
      { criterion: 'Ordering nuance', score: 31, note: 'Good distinction, slightly brief.' },
      {
        criterion: 'Practical implication',
        score: 18,
        note: 'Implication is implied but not developed.',
      },
    ],
    reasoning: [
      'The answer identifies the central visibility property.',
      'It avoids the common false claim that happens-before is physical CPU ordering.',
      'It loses points for not naming concrete synchronization mechanisms.',
    ],
    auditMeta: audit('java-jmm-happens-before'),
  },
  {
    id: 'react-stale-effect',
    title: 'React stale dependency diagnosis',
    skill: 'React component architecture',
    family: 'code',
    question: 'Diagnose a useEffect that fetches by userId but has an empty dependency array.',
    answer:
      'The effect captures the first userId and will not re-run when userId changes. Add userId to the dependency array and cancel stale requests during cleanup.',
    rubric: [
      { criterion: 'Root cause', weight: 40, signal: 'Identifies stale closure' },
      { criterion: 'Fix', weight: 35, signal: 'Adds dependency correctly' },
      { criterion: 'Production guard', weight: 25, signal: 'Handles request cleanup' },
    ],
    score: 92,
    breakdown: [
      { criterion: 'Root cause', score: 40, note: 'Precisely names stale closure.' },
      { criterion: 'Fix', score: 34, note: 'Correct dependency repair.' },
      { criterion: 'Production guard', score: 18, note: 'Cleanup mentioned but not shown.' },
    ],
    reasoning: [
      'The answer covers both the React semantics and the operational risk.',
      'The missing code sample keeps it below a perfect score.',
    ],
    auditMeta: audit('react-stale-effect'),
  },
  {
    id: 'sql-window-frame',
    title: 'SQL window-frame reasoning',
    skill: 'SQL data modeling',
    family: 'sql',
    question: 'Explain why ROWS BETWEEN and RANGE BETWEEN can return different running totals.',
    answer:
      'ROWS counts physical rows in the ordered result. RANGE groups peers with the same order value, so duplicate timestamps or prices can be included together.',
    rubric: [
      { criterion: 'ROWS semantics', weight: 30, signal: 'Physical row frame' },
      { criterion: 'RANGE semantics', weight: 40, signal: 'Peer grouping by order value' },
      { criterion: 'Example readiness', weight: 30, signal: 'Names duplicate-order risk' },
    ],
    score: 89,
    breakdown: [
      { criterion: 'ROWS semantics', score: 28, note: 'Correct.' },
      { criterion: 'RANGE semantics', score: 37, note: 'Correct peer grouping.' },
      { criterion: 'Example readiness', score: 24, note: 'Example is concise.' },
    ],
    reasoning: [
      'The answer distinguishes frame units cleanly.',
      'It gives a practical duplicate-value failure mode.',
    ],
    auditMeta: audit('sql-window-frame'),
  },
  {
    id: 'devops-hpa-requests',
    title: 'Kubernetes HPA diagnosis',
    skill: 'Kubernetes operations',
    family: 'scenario',
    question: 'Why can HPA behave badly when CPU requests are missing?',
    answer:
      'CPU utilization is computed against requested CPU. Without requests, HPA has no stable denominator and scaling signals become unavailable or misleading.',
    rubric: [
      { criterion: 'Metric denominator', weight: 45, signal: 'CPU request denominator' },
      { criterion: 'Operational impact', weight: 35, signal: 'Unavailable or bad scaling' },
      { criterion: 'Remediation', weight: 20, signal: 'Set requests and limits deliberately' },
    ],
    score: 84,
    breakdown: [
      { criterion: 'Metric denominator', score: 43, note: 'Clear denominator model.' },
      { criterion: 'Operational impact', score: 31, note: 'Impact is accurate.' },
      { criterion: 'Remediation', score: 10, note: 'Fix is implied, not explicit.' },
    ],
    reasoning: ['Strong conceptual answer.', 'Would improve with a concrete deployment patch.'],
    auditMeta: audit('devops-hpa-requests'),
  },
  {
    id: 'salesforce-governor-limit',
    title: 'Apex governor-limit repair',
    skill: 'Salesforce Apex',
    family: 'code',
    question: 'A trigger queries inside a loop. Explain the failure and the repair.',
    answer:
      'The trigger can exceed SOQL governor limits. Bulkify by collecting IDs, running one selective query outside the loop, and mapping results back by ID.',
    rubric: [
      { criterion: 'Failure mode', weight: 35, signal: 'SOQL governor limit' },
      { criterion: 'Bulk-safe pattern', weight: 45, signal: 'Collect IDs and query once' },
      { criterion: 'Selectivity', weight: 20, signal: 'Mentions selective query' },
    ],
    score: 90,
    breakdown: [
      { criterion: 'Failure mode', score: 35, note: 'Exact platform limit.' },
      { criterion: 'Bulk-safe pattern', score: 40, note: 'Correct repair pattern.' },
      { criterion: 'Selectivity', score: 15, note: 'Selectivity named briefly.' },
    ],
    reasoning: [
      'Answer is Salesforce-specific and operationally sound.',
      'No false promise that async fixes the trigger by itself.',
    ],
    auditMeta: audit('salesforce-governor-limit'),
  },
  {
    id: 'embedded-ring-buffer',
    title: 'ISR-safe ring-buffer review',
    skill: 'Embedded C and RTOS',
    family: 'code',
    question: 'Review an ISR ring buffer for race conditions between producer and consumer.',
    answer:
      'Keep head updates atomic, mark shared indices volatile or use atomics as appropriate, reserve one empty slot to distinguish full from empty, and avoid blocking inside the ISR.',
    rubric: [
      { criterion: 'Concurrency safety', weight: 40, signal: 'Atomic or volatile index handling' },
      { criterion: 'Buffer invariant', weight: 30, signal: 'Full vs empty distinction' },
      { criterion: 'ISR discipline', weight: 30, signal: 'No blocking in ISR' },
    ],
    score: 86,
    breakdown: [
      {
        criterion: 'Concurrency safety',
        score: 32,
        note: 'Good, but target-specific memory model omitted.',
      },
      { criterion: 'Buffer invariant', score: 27, note: 'Correct invariant.' },
      { criterion: 'ISR discipline', score: 27, note: 'Correct ISR constraint.' },
    ],
    reasoning: [
      'The answer catches the main embedded failure modes.',
      'It is conservative about atomics versus volatile.',
    ],
    auditMeta: audit('embedded-ring-buffer'),
  },
  {
    id: 'sap-idoc-status',
    title: 'SAP IDoc stuck-status diagnosis',
    skill: 'SAP integration diagnostics',
    family: 'scenario',
    question:
      'An inbound IDoc is stuck in status 53 but downstream data is missing. What do you check?',
    answer:
      'Status 53 means application document posted, so I would verify the posting object, update tasks, partner profile, application logs, and any enhancement that swallowed an error.',
    rubric: [
      { criterion: 'Status interpretation', weight: 35, signal: '53 means posted' },
      { criterion: 'Diagnostic path', weight: 45, signal: 'Logs, partner profile, posting object' },
      { criterion: 'Risk handling', weight: 20, signal: 'Enhancement or update-task caveat' },
    ],
    score: 83,
    breakdown: [
      { criterion: 'Status interpretation', score: 33, note: 'Correct.' },
      { criterion: 'Diagnostic path', score: 35, note: 'Good but could name tcodes.' },
      { criterion: 'Risk handling', score: 15, note: 'Useful caveat.' },
    ],
    reasoning: [
      'The answer does not confuse transport success with business correctness.',
      'It would be stronger with WE02/SLG1 specifics.',
    ],
    auditMeta: audit('sap-idoc-status'),
  },
  {
    id: 'prompt-rubric-eval',
    title: 'LLM-as-judge rubric critique',
    skill: 'AI prompt evaluation',
    family: 'document',
    question: 'Critique an LLM-as-judge rubric for grading free-text answers.',
    answer:
      'The rubric should anchor observable criteria, separate factual correctness from style, include counterexamples, and log prompt/model/input hashes for replay.',
    rubric: [
      { criterion: 'Observable criteria', weight: 40, signal: 'No vague quality-only grading' },
      { criterion: 'Bias and style separation', weight: 25, signal: 'Style is not correctness' },
      { criterion: 'Auditability', weight: 35, signal: 'Hashes and replay metadata' },
    ],
    score: 91,
    breakdown: [
      { criterion: 'Observable criteria', score: 38, note: 'Strong rubric discipline.' },
      { criterion: 'Bias and style separation', score: 22, note: 'Correct fairness guard.' },
      { criterion: 'Auditability', score: 31, note: 'Metadata named clearly.' },
    ],
    reasoning: [
      'The answer aligns with QOrium auditability claims.',
      'It keeps reproducibility separate from subjective confidence.',
    ],
    auditMeta: audit('prompt-rubric-eval'),
  },
];

export function listGraderExemplars(skill?: string) {
  const normalized = skill ? slugifyProof(skill) : null;
  return graderExemplars
    .filter((item) => !normalized || slugifyProof(item.skill).includes(normalized))
    .map(({ id, title, skill: itemSkill, family, score }) => ({
      id,
      title,
      skill: itemSkill,
      family,
      score,
    }));
}

export function getGraderExemplar(id: string): GraderExemplar | undefined {
  return graderExemplars.find((item) => item.id === id);
}

function item(
  id: string,
  title: string,
  format: string,
  difficulty: string,
  skillSignal: string,
): SamplePackItem {
  return {
    id,
    title,
    format,
    difficulty,
    durationMinutes: difficulty === 'Easy' ? 2 : difficulty === 'Medium' ? 5 : 9,
    skillSignal,
  };
}

export const samplePacks: SamplePack[] = [
  {
    slug: 'senior-java',
    title: 'Senior Java Sample Pack',
    skill: 'Java',
    role: 'Senior Java Engineer',
    stack: 'Java',
    family: 'Software engineering',
    level: 'Senior',
    itemCount: 10,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'JVM memory, Spring Boot, Hibernate, microservices, concurrency, and architecture signals.',
    libraryHref: '/library/java',
    roleHref: '/solutions/role/java-developer',
    stackHref: '/solutions/stack/java',
    previewItems: [
      item(
        'QOR-JAVA-001',
        'Java Virtual Machine Memory Model Fundamentals',
        'MCQ',
        'Easy',
        'JMM visibility',
      ),
      item(
        'QOR-JAVA-002',
        'Spring Boot Dependency Injection and Bean Lifecycle',
        'MCQ',
        'Easy',
        'Spring DI',
      ),
      item(
        'QOR-JAVA-003',
        'Virtual Threads and Project Loom',
        'MCQ',
        'Medium',
        'Java 21 concurrency',
      ),
    ],
    gatedItems: [
      item(
        'QOR-JAVA-007',
        'Bulk Insert with Idempotency and Transactional Retry',
        'Code',
        'Hard',
        'Backend correctness',
      ),
      item(
        'QOR-JAVA-010',
        'Distributed Transaction Choreography vs Saga Pattern',
        'Design',
        'Hard',
        'Architecture',
      ),
    ],
  },
  {
    slug: 'senior-react',
    title: 'Senior React/JS Sample Pack',
    skill: 'React',
    role: 'Senior React Engineer',
    stack: 'React',
    family: 'Frontend engineering',
    level: 'Senior',
    itemCount: 10,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'React reconciliation, hooks, TypeScript props, App Router, performance, and UI architecture.',
    libraryHref: '/library/react',
    roleHref: '/solutions/role/react-developer',
    stackHref: '/solutions/stack/react',
    previewItems: [
      item(
        'QOR-REACT-001',
        'React Reconciliation and Key Prop Semantics',
        'MCQ',
        'Easy',
        'React fundamentals',
      ),
      item(
        'QOR-REACT-002',
        'useEffect Dependency Array Pitfalls',
        'MCQ',
        'Easy',
        'Hooks lifecycle',
      ),
      item('QOR-REACT-004', 'TypeScript Discriminated Union Props', 'MCQ', 'Medium', 'Type safety'),
    ],
    gatedItems: [
      item(
        'QOR-REACT-007',
        'Fix Component Re-render Infinite Loop',
        'Code',
        'Hard',
        'React debugging',
      ),
      item(
        'QOR-REACT-010',
        'Collaborative Form-Builder UI Architecture',
        'Design',
        'Hard',
        'Frontend architecture',
      ),
    ],
  },
  {
    slug: 'devops-sre',
    title: 'DevOps/SRE Sample Pack',
    skill: 'DevOps/SRE',
    role: 'DevOps SRE Lead',
    stack: 'Cloud native',
    family: 'Cloud and reliability',
    level: 'Senior',
    itemCount: 10,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'Kubernetes, Terraform, CI/CD, observability, remediation scripts, and reliability judgment.',
    libraryHref: '/library/devops-sre',
    roleHref: '/solutions/role/devops-engineer',
    stackHref: '/solutions/stack/cloud-native',
    previewItems: [
      item(
        'QOR-DEVOPS-001',
        'Kubernetes Deployment vs StatefulSet',
        'MCQ',
        'Easy',
        'Kubernetes workloads',
      ),
      item('QOR-DEVOPS-002', 'Liveness vs Readiness Probes', 'MCQ', 'Easy', 'Runtime health'),
      item('QOR-DEVOPS-003', 'HPA and Resource Requests/Limits', 'MCQ', 'Medium', 'Autoscaling'),
    ],
    gatedItems: [
      item(
        'QOR-DEVOPS-007',
        'Kubernetes Manifest with HPA and Network Policy',
        'Code',
        'Hard',
        'Cluster safety',
      ),
      item(
        'QOR-DEVOPS-009',
        'Bash Script to Parse kubectl JSON and Remediate',
        'Code',
        'Hard',
        'Incident automation',
      ),
    ],
  },
  {
    slug: 'senior-salesforce',
    title: 'Senior Salesforce Sample Pack',
    skill: 'Salesforce',
    role: 'Senior Salesforce Developer',
    stack: 'Salesforce',
    family: 'Enterprise apps',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'Apex, SOQL, LWC, Platform Events, Service Cloud, and bulk-safe enterprise implementation.',
    libraryHref: '/library/salesforce',
    roleHref: '/solutions/role/salesforce-developer',
    stackHref: '/solutions/stack/salesforce',
    previewItems: [
      item(
        'QOR-SF-001',
        'Apex Governor Limits: Heap Size and SOQL Batching',
        'MCQ',
        'Easy',
        'Apex limits',
      ),
      item('QOR-SF-002', 'SOQL Selectivity and Indexed Fields', 'MCQ', 'Easy', 'SOQL performance'),
      item(
        'QOR-SF-003',
        'Lightning Web Components Lifecycle and Wire Adapters',
        'MCQ',
        'Medium',
        'LWC',
      ),
    ],
    gatedItems: [
      item('QOR-SF-007', 'Bulk-Safe Trigger with Handler Pattern', 'Code', 'Hard', 'Apex code'),
      item(
        'QOR-SF-013',
        'Multi-Org Data Sync Architecture',
        'Design',
        'Hard',
        'Integration architecture',
      ),
    ],
  },
  {
    slug: 'senior-aws',
    title: 'Senior AWS Sample Pack',
    skill: 'AWS',
    role: 'Senior Cloud Engineer',
    stack: 'AWS',
    family: 'Cloud engineering',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary: 'EC2, S3, Lambda, VPC, IAM, DynamoDB, CloudWatch, cost, and multi-region design.',
    libraryHref: '/library/aws',
    roleHref: '/solutions/role/cloud-engineer',
    stackHref: '/solutions/stack/aws',
    previewItems: [
      item('QOR-AWS-001', 'EC2 Instance Family Selection', 'MCQ', 'Easy', 'Compute choice'),
      item(
        'QOR-AWS-002',
        'S3 Storage Classes and Lifecycle Policies',
        'MCQ',
        'Easy',
        'Storage economics',
      ),
      item('QOR-AWS-005', 'IAM Policy Least Privilege', 'MCQ', 'Medium', 'Security'),
    ],
    gatedItems: [
      item(
        'QOR-AWS-009',
        'S3 Lifecycle and Intelligent-Tiering JSON',
        'Code',
        'Medium',
        'AWS automation',
      ),
      item(
        'QOR-AWS-017',
        'Multi-Region Active-Passive Architecture Design',
        'Design',
        'Hard',
        'Resilience',
      ),
    ],
  },
  {
    slug: 'senior-python',
    title: 'Senior Python Sample Pack',
    skill: 'Python',
    role: 'Senior Python Engineer',
    stack: 'Python',
    family: 'Software engineering',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'Descriptors, async, Pydantic, FastAPI, Pandas/Polars, typing, Django, and streaming code.',
    libraryHref: '/library/python',
    roleHref: '/solutions/role/python-developer',
    stackHref: '/solutions/stack/python',
    previewItems: [
      item(
        'QOR-PY-001',
        'Python Descriptor Protocol Fundamentals',
        'MCQ',
        'Easy',
        'Python internals',
      ),
      item('QOR-PY-003', 'Asyncio Event Loop and Thread Safety', 'MCQ', 'Medium', 'Async Python'),
      item('QOR-PY-005', 'FastAPI Dependency Injection and Async', 'MCQ', 'Medium', 'FastAPI'),
    ],
    gatedItems: [
      item('QOR-PY-013', 'Async Rate-Limiter with Token Bucket', 'Code', 'Hard', 'Async code'),
      item('QOR-PY-015', 'Generator-Based Streaming Aggregation', 'Code', 'Hard', 'Streaming data'),
    ],
  },
  {
    slug: 'senior-sql-data',
    title: 'Senior SQL/Data Sample Pack',
    skill: 'SQL/Data',
    role: 'Senior Data Engineer',
    stack: 'SQL',
    family: 'Data',
    level: 'Senior',
    itemCount: 10,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'Aggregation, nulls, windows, indexes, isolation, recursive CTEs, and warehouse design.',
    libraryHref: '/library/sql',
    roleHref: '/solutions/role/data-engineer',
    stackHref: '/solutions/stack/sql',
    previewItems: [
      item('QOR-SQL-001', 'SQL Aggregation and GROUP BY Semantics', 'MCQ', 'Easy', 'SQL basics'),
      item('QOR-SQL-003', 'Window Function Frame Clauses', 'MCQ', 'Medium', 'Analytical SQL'),
      item('QOR-SQL-004', 'INDEX Selection and Query Plans', 'MCQ', 'Medium', 'Performance'),
    ],
    gatedItems: [
      item('QOR-SQL-007', 'Gaps-and-Islands Pattern', 'Code', 'Hard', 'SQL problem solving'),
      item(
        'QOR-SQL-010',
        'Warehouse Star Schema Design and Partitioning',
        'Design',
        'Hard',
        'Data architecture',
      ),
    ],
  },
  {
    slug: 'ai-prompt-engineering',
    title: 'Senior AI Prompt Engineering Sample Pack',
    skill: 'AI Prompt Engineering',
    role: 'AI Prompt Engineer',
    stack: 'AI-era',
    family: 'AI-era skills',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'Prompt roles, few-shot trade-offs, ReAct, function calling, LLM-as-judge, safety, and cost.',
    libraryHref: '/library/ai-prompt-engineering',
    roleHref: '/solutions/role/ai-engineer',
    stackHref: '/solutions/stack/ai-era',
    previewItems: [
      item(
        'QOR-AIPE-001',
        'System Prompt vs User Message Roles',
        'MCQ',
        'Easy',
        'Prompt structure',
      ),
      item('QOR-AIPE-007', 'Function Calling Schema Design', 'MCQ', 'Medium', 'Tool schemas'),
      item('QOR-AIPE-008', 'LLM-as-Judge Pitfalls', 'MCQ', 'Medium', 'Evaluation'),
    ],
    gatedItems: [
      item(
        'QOR-AIPE-014',
        'Design a Prompt-Injection Defense Layer',
        'Design',
        'Hard',
        'Safety architecture',
      ),
      item('QOR-AIPE-019', 'Jailbreak Resistance Testing', 'Scenario', 'Hard', 'Red-team testing'),
    ],
  },
  {
    slug: 'embedded-automotive',
    title: 'Embedded Automotive Sample Pack',
    skill: 'Embedded Automotive',
    role: 'Embedded Automotive Engineer',
    stack: 'Embedded',
    family: 'Automotive',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'AUTOSAR, MISRA-C, ASPICE, RTOS, watchdogs, automotive protocols, and functional safety.',
    libraryHref: '/library/embedded-c',
    roleHref: '/solutions/role/embedded-engineer',
    stackHref: '/solutions/stack/embedded-automotive',
    previewItems: [
      item('QOR-EMB-001', 'AUTOSAR Architecture Fundamentals', 'MCQ', 'Easy', 'AUTOSAR'),
      item('QOR-EMB-005', 'MISRA-C Rule 8.1 Variable Scope', 'MCQ', 'Easy', 'MISRA-C'),
      item('QOR-EMB-011', 'Priority Inversion and Semaphore Protocols', 'MCQ', 'Medium', 'RTOS'),
    ],
    gatedItems: [
      item('QOR-EMB-012', 'ISR-Safe Ring Buffer', 'Code', 'Hard', 'Embedded C'),
      item('QOR-EMB-013', 'Watchdog Timer Service', 'Code', 'Hard', 'Safety runtime'),
    ],
  },
  {
    slug: 'sap-abap',
    title: 'SAP ABAP Sample Pack',
    skill: 'SAP ABAP',
    role: 'SAP ABAP Consultant',
    stack: 'SAP',
    family: 'India-stack',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary: 'ABAP OO, CDS, ALV, RFC/BAPI, IDoc, AMDP, RAP, Fiori, and cloud ABAP authorization.',
    libraryHref: '/library/sap-abap',
    roleHref: '/solutions/role/sap-abap-consultant',
    stackHref: '/solutions/stack/sap',
    previewItems: [
      item(
        'QOR-SAP-001',
        'ABAP Object-Oriented Inheritance and Polymorphism',
        'MCQ',
        'Easy',
        'ABAP OO',
      ),
      item('QOR-SAP-002', 'CDS View Annotations for Analytics', 'MCQ', 'Easy', 'CDS'),
      item('QOR-SAP-006', 'IDoc Inbound Processing Status Codes', 'MCQ', 'Medium', 'Integration'),
    ],
    gatedItems: [
      item(
        'QOR-SAP-011',
        'Refactor Nested SELECT Loop to FOR ALL ENTRIES',
        'Code',
        'Hard',
        'ABAP performance',
      ),
      item(
        'QOR-SAP-017',
        'Design SuccessFactors Integration via OData',
        'Design',
        'Hard',
        'Enterprise integration',
      ),
    ],
  },
  {
    slug: 'oracle-hcm-cloud',
    title: 'Oracle HCM Cloud Sample Pack',
    skill: 'Oracle HCM Cloud',
    role: 'Oracle HCM Consultant',
    stack: 'Oracle',
    family: 'India-stack',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'Worker models, India payroll, HDL, Fast Formula, REST APIs, recruiting, and HR integrations.',
    libraryHref: '/library/oracle-hcm-cloud',
    roleHref: '/solutions/role/oracle-hcm-consultant',
    stackHref: '/solutions/stack/oracle',
    previewItems: [
      item('QOR-HCM-001', 'Person vs Worker Object Model', 'MCQ', 'Easy', 'HCM object model'),
      item(
        'QOR-HCM-003',
        'Indian Payroll PF Contribution Calculation',
        'MCQ',
        'Easy',
        'India payroll',
      ),
      item('QOR-HCM-007', 'HDL Bulk Import Hierarchy', 'Code', 'Medium', 'Data loader'),
    ],
    gatedItems: [
      item('QOR-HCM-008', 'Fast Formula Bonus Eligibility Logic', 'Code', 'Hard', 'Payroll logic'),
      item(
        'QOR-HCM-013',
        'Multi-Country Payroll Integration Design',
        'Design',
        'Hard',
        'Enterprise HR',
      ),
    ],
  },
  {
    slug: 'finacle-flexcube',
    title: 'Finacle/Flexcube Sample Pack',
    skill: 'Finacle/Flexcube',
    role: 'Core Banking Consultant',
    stack: 'BFSI',
    family: 'India-stack',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'CIF, interest accrual, Flexcube workflows, RBI reporting, FSL, SQL, SWIFT, and migration design.',
    libraryHref: '/library/finacle-flexcube',
    roleHref: '/solutions/role/core-banking-consultant',
    stackHref: '/solutions/stack/bfsi',
    previewItems: [
      item('QOR-BFSI-001', 'Finacle Account Opening CIF Structure', 'MCQ', 'Easy', 'Core banking'),
      item('QOR-BFSI-003', 'Flexcube STDCIF Customer Flow', 'MCQ', 'Medium', 'Flexcube'),
      item(
        'QOR-BFSI-004',
        'RBI Regulatory Reporting Reconciliation',
        'MCQ',
        'Medium',
        'Compliance',
      ),
    ],
    gatedItems: [
      item(
        'QOR-BFSI-011',
        'Interest Accrual Batch Failure Diagnosis',
        'Case Study',
        'Hard',
        'Production support',
      ),
      item(
        'QOR-BFSI-018',
        'Finacle Migration Plan for 50M Customer Bank',
        'Design',
        'Hard',
        'Migration architecture',
      ),
    ],
  },
  {
    slug: 'salesforce-cpq',
    title: 'Salesforce CPQ Sample Pack',
    skill: 'Salesforce CPQ',
    role: 'Salesforce CPQ Consultant',
    stack: 'Salesforce',
    family: 'Enterprise apps',
    level: 'Senior',
    itemCount: 20,
    calibrationBadge: 'Authored; SME validation and IRT calibration pending pilot traffic',
    summary:
      'Bundles, product rules, price rules, QCP, approvals, renewals, CLM, migration, and ERP integration.',
    libraryHref: '/library/salesforce-cpq',
    roleHref: '/solutions/role/salesforce-cpq-consultant',
    stackHref: '/solutions/stack/salesforce',
    previewItems: [
      item(
        'QOR-CPQ-001',
        'Product Configuration Bundle Requirements',
        'MCQ',
        'Easy',
        'CPQ configuration',
      ),
      item(
        'QOR-CPQ-003',
        'Price Rules and Lookup Queries Selectivity',
        'MCQ',
        'Medium',
        'Pricing rules',
      ),
      item('QOR-CPQ-005', 'Quote Calculator Plugin Tier Discount Logic', 'Code', 'Medium', 'QCP'),
    ],
    gatedItems: [
      item(
        'QOR-CPQ-016',
        'CPQ Implementation for High-Volume Contracts',
        'Design',
        'Hard',
        'Enterprise scale',
      ),
      item(
        'QOR-CPQ-020',
        'SAP ERP Integration with CPQ Contract Sync',
        'Design',
        'Hard',
        'Back-office integration',
      ),
    ],
  },
];

export function listSamplePacks() {
  return samplePacks.map(({ gatedItems: _gatedItems, ...pack }) => pack);
}

export function getSamplePack(slug: string): SamplePack | undefined {
  return samplePacks.find((pack) => pack.slug === slug);
}

export function getSamplePackPreview(slug: string) {
  const pack = getSamplePack(slug);
  if (!pack) return undefined;
  return {
    ...pack,
    gatedItems: [],
  };
}

export function signedSamplePackToken(slug: string, email: string): string {
  return `qsp_${stableHash(`${slug}:${email.toLowerCase()}`).repeat(2).slice(0, 14)}`;
}
