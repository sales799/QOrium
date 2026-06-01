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

const skillRules: SkillRule[] = [
  {
    name: 'Java 21 concurrency',
    roleFamily: 'Software engineering',
    stackFamily: 'Java',
    libraryHref: '/skill/java',
    patterns: [/\bjava\b/i, /\bvirtual threads?\b/i, /\bjvm\b/i],
  },
  {
    name: 'Spring Boot services',
    roleFamily: 'Software engineering',
    stackFamily: 'Java',
    libraryHref: '/skill/java',
    patterns: [/\bspring\s*boot\b/i, /\bspring framework\b/i],
  },
  {
    name: 'JPA and Hibernate',
    roleFamily: 'Software engineering',
    stackFamily: 'Java',
    libraryHref: '/skill/java',
    patterns: [/\bjpa\b/i, /\bhibernate\b/i, /\borg mapping\b/i],
  },
  {
    name: 'SQL data modeling',
    roleFamily: 'Data',
    stackFamily: 'SQL',
    libraryHref: '/skill/sql',
    patterns: [/\bsql\b/i, /\bpostgres(ql)?\b/i, /\bquery plans?\b/i],
  },
  {
    name: 'Microservices resilience',
    roleFamily: 'Software engineering',
    stackFamily: 'Architecture',
    libraryHref: '/skill/java',
    patterns: [/\bmicroservices?\b/i, /\bcircuit breaker\b/i, /\bdistributed systems?\b/i],
  },
  {
    name: 'React component architecture',
    roleFamily: 'Frontend engineering',
    stackFamily: 'React',
    libraryHref: '/skill/reactjs',
    patterns: [/\breact\b/i, /\bcomponent architecture\b/i],
  },
  {
    name: 'TypeScript application design',
    roleFamily: 'Frontend engineering',
    stackFamily: 'TypeScript',
    libraryHref: '/skill/javascript',
    patterns: [/\btypescript\b/i, /\btype-safe\b/i, /\bdiscriminated union\b/i],
  },
  {
    name: 'Next.js App Router',
    roleFamily: 'Frontend engineering',
    stackFamily: 'Next.js',
    libraryHref: '/skill/reactjs',
    patterns: [/\bnext\.?js\b/i, /\bapp router\b/i, /\bserver actions?\b/i],
  },
  {
    name: 'Client performance debugging',
    roleFamily: 'Frontend engineering',
    stackFamily: 'React',
    libraryHref: '/skill/reactjs',
    patterns: [/\bperformance\b/i, /\bprofiler\b/i, /\bmemo\b/i],
  },
  {
    name: 'Kubernetes operations',
    roleFamily: 'DevOps / SRE',
    stackFamily: 'Cloud native',
    libraryHref: '/skill/devops',
    patterns: [/\bkubernetes\b/i, /\bk8s\b/i, /\bstatefulset\b/i, /\bhpa\b/i],
  },
  {
    name: 'Terraform infrastructure',
    roleFamily: 'DevOps / SRE',
    stackFamily: 'Infrastructure as code',
    libraryHref: '/skill/aws',
    patterns: [/\bterraform\b/i, /\binfrastructure as code\b/i],
  },
  {
    name: 'Observability and incident response',
    roleFamily: 'DevOps / SRE',
    stackFamily: 'Reliability',
    libraryHref: '/skill/devops',
    patterns: [/\bobservability\b/i, /\bslo\b/i, /\bincident\b/i, /\bprometheus\b/i],
  },
  {
    name: 'AWS production systems',
    roleFamily: 'Cloud engineering',
    stackFamily: 'AWS',
    libraryHref: '/skill/aws',
    patterns: [/\baws\b/i, /\blambda\b/i, /\bs3\b/i, /\becs\b/i, /\beks\b/i],
  },
  {
    name: 'Salesforce Apex',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Salesforce',
    libraryHref: '/product/assessment-library',
    patterns: [/\bapex\b/i, /\bgovernor limits?\b/i],
  },
  {
    name: 'Salesforce LWC',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Salesforce',
    libraryHref: '/product/assessment-library',
    patterns: [/\blwc\b/i, /\blightning web components?\b/i],
  },
  {
    name: 'SOQL data access',
    roleFamily: 'Enterprise apps',
    stackFamily: 'Salesforce',
    libraryHref: '/product/assessment-library',
    patterns: [/\bsoql\b/i, /\bselectivity\b/i],
  },
  {
    name: 'Embedded C and RTOS',
    roleFamily: 'Embedded engineering',
    stackFamily: 'Automotive',
    libraryHref: '/product/assessment-library',
    patterns: [/\bembedded c\b/i, /\brtos\b/i, /\bisr\b/i, /\bwatchdog\b/i],
  },
  {
    name: 'AUTOSAR architecture',
    roleFamily: 'Embedded engineering',
    stackFamily: 'Automotive',
    libraryHref: '/product/assessment-library',
    patterns: [/\bautosar\b/i, /\bswc\b/i, /\bsome\/ip\b/i],
  },
  {
    name: 'MISRA C compliance',
    roleFamily: 'Embedded engineering',
    stackFamily: 'Automotive',
    libraryHref: '/product/assessment-library',
    patterns: [/\bmisra\b/i, /\bfunctional safety\b/i],
  },
  {
    name: 'SAP ABAP',
    roleFamily: 'Enterprise apps',
    stackFamily: 'SAP',
    libraryHref: '/product/assessment-library',
    patterns: [/\babap\b/i, /\bopen sql\b/i, /\balv\b/i],
  },
  {
    name: 'SAP CDS and RAP',
    roleFamily: 'Enterprise apps',
    stackFamily: 'SAP',
    libraryHref: '/product/assessment-library',
    patterns: [/\bcds\b/i, /\brap\b/i, /\bamdp\b/i],
  },
  {
    name: 'SAP integration diagnostics',
    roleFamily: 'Enterprise apps',
    stackFamily: 'SAP',
    libraryHref: '/product/assessment-library',
    patterns: [/\bidoc\b/i, /\bbapi\b/i, /\brfc\b/i, /\bfiori\b/i],
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

function inferRoleTitle(text: string): string {
  const sample = sampleJds.find((jd) => jd.body === text);
  if (sample) return sample.title;
  if (/salesforce/i.test(text)) return 'Salesforce assessment';
  if (/react|frontend|next/i.test(text)) return 'Frontend assessment';
  if (/kubernetes|sre|devops/i.test(text)) return 'DevOps assessment';
  if (/sap|abap/i.test(text)) return 'SAP ABAP assessment';
  if (/embedded|autosar|misra/i.test(text)) return 'Embedded systems assessment';
  if (/java|spring/i.test(text)) return 'Java backend assessment';
  return 'Custom role assessment';
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

export function runJdForgeDemo(jdText: string): JdForgeDemoResult {
  const normalized = jdText.trim();
  const skills = skillRules
    .map((rule, index) => {
      const phrases = matchedPhrases(normalized, rule);
      if (phrases.length === 0) return null;
      return {
        name: rule.name,
        weight: Math.max(0.62, 0.98 - index * 0.018),
        roleFamily: rule.roleFamily,
        stackFamily: rule.stackFamily,
        sourcePhrases: phrases,
        libraryHref: rule.libraryHref,
      } satisfies ProofSkill;
    })
    .filter((skill): skill is ProofSkill => skill !== null)
    .slice(0, 9);

  const confidence = Math.min(0.97, skills.length === 0 ? 0.18 : 0.48 + skills.length * 0.07);
  const lowConfidenceReason =
    skills.length < 3
      ? 'JD-Forge could not extract enough mapped QOrium skills from this text. The public demo is showing the honest low-confidence state instead of padding the result.'
      : undefined;

  const result: JdForgeDemoResult = {
    ok: true,
    planId: `jdplan_${stableHash(normalized).slice(0, 7)}`,
    inputHash: `sha256:${stableHash(normalized).repeat(8).slice(0, 64)}`,
    roleTitle: inferRoleTitle(normalized),
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
    libraryHref: '/skill/java',
    roleHref: '/resources/job-descriptions/java-developer',
    stackHref: '/skill/java',
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
    libraryHref: '/skill/reactjs',
    roleHref: '/resources/job-descriptions/react-developer',
    stackHref: '/skill/reactjs',
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
    libraryHref: '/skill/devops',
    roleHref: '/resources/job-descriptions/devops-engineer',
    stackHref: '/skill/devops',
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
    libraryHref: '/product/assessment-library',
    roleHref: '/solutions/enterprises-gcc',
    stackHref: '/product/assessment-library',
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
    libraryHref: '/skill/aws',
    roleHref: '/resources/job-descriptions/cloud-engineer',
    stackHref: '/skill/aws',
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
    libraryHref: '/skill/python',
    roleHref: '/resources/job-descriptions/python-developer',
    stackHref: '/skill/python',
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
    libraryHref: '/skill/sql',
    roleHref: '/resources/job-descriptions/data-analyst',
    stackHref: '/skill/sql',
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
    libraryHref: '/product/assessment-library',
    roleHref: '/solutions/by-use-case/technical-screening',
    stackHref: '/product/assessment-library',
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
    libraryHref: '/product/assessment-library',
    roleHref: '/solutions/enterprises-gcc',
    stackHref: '/solutions/enterprises-gcc',
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
    libraryHref: '/product/assessment-library',
    roleHref: '/solutions/enterprises-gcc',
    stackHref: '/solutions/enterprises-gcc',
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
    libraryHref: '/product/assessment-library',
    roleHref: '/solutions/enterprises-gcc',
    stackHref: '/solutions/enterprises-gcc',
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
    libraryHref: '/product/assessment-library',
    roleHref: '/solutions/enterprises-gcc',
    stackHref: '/solutions/enterprises-gcc',
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
    libraryHref: '/product/assessment-library',
    roleHref: '/solutions/enterprises-gcc',
    stackHref: '/product/assessment-library',
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
