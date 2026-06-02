import type { EvidenceFlag } from '@/content/marketing-ia';

export type Cta = {
  label: string;
  href: string;
  flag?: EvidenceFlag;
};

export type PricingTable = {
  title: string;
  columns: readonly string[];
  rows: readonly (readonly string[])[];
};

export type ProductAccent = 'readybank' | 'jd-forge' | 'stack-vault';

export type PlatformProduct = {
  slug: ProductAccent;
  name: string;
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryCta: Cta;
  secondaryCta?: Cta;
  problem: {
    title: string;
    body: string;
    bullets: readonly string[];
  };
  workflow: readonly {
    title: string;
    body: string;
  }[];
  proof: readonly string[];
  pricingIntro: string;
  pricingTitle: string;
  pricingTables: readonly PricingTable[];
  included: readonly string[];
  faq: readonly {
    question: string;
    answer: string;
  }[];
};

export type BuyerSolution = {
  slug: 'assessment-platforms' | 'enterprises-gcc' | 'staffing-firms';
  route: string;
  eyebrow: string;
  title: string;
  description: string;
  pain: {
    title: string;
    body: string;
    bullets: readonly string[];
  };
  matchedSkus: readonly {
    name: string;
    href: string;
    fit: string;
  }[];
  workflow: readonly {
    title: string;
    body: string;
  }[];
  indiaProof: readonly string[];
  primaryCta: Cta;
  secondaryCta: Cta;
};

// SOURCE: MARKETING_REDESIGN_360_v1.md §7.1; 01-Market-Landscape.md §2.1;
// 03-Gap-Analysis.md §6; 05-QOrium-Three-Use-Cases-SKU-Architecture.md §1.
export const homeV2 = {
  hero: {
    eyebrow: 'Trust infrastructure for skills hiring',
    title: 'Skills assessments you can defend in an audit.',
    description:
      'QOrium is the product marketing and operating system for defensible hiring evidence: calibrated libraries, JD-shaped assessment generation, private Stack-Vaults, anti-leak lifecycle controls, and trust pages that never overclaim.',
    primaryCta: { label: 'Book a 20-min walkthrough', href: '/demo' },
    secondaryCta: { label: 'Explore the library', href: '/product/assessment-library' },
  },
  sitemap: [
    {
      label: 'Platform',
      count: '4 pages',
      href: '/platform',
      body: 'ReadyBank, JD-Forge, Stack-Vault, and the delivery engine.',
    },
    {
      label: 'Solutions',
      count: '63 pages',
      href: '/solutions/enterprises-gcc',
      body: 'Buyer, company type, use case, industry, role, and stack routing.',
    },
    {
      label: 'Library',
      count: '1,000 pages',
      href: '/library/javascript',
      body: 'Skill plus scenario pages for programmatic SEO and buyer proof.',
    },
    {
      label: 'Resources',
      count: '44 pages',
      href: '/resources',
      body: 'Docs, sample packs, guides, job descriptions, and research.',
    },
    {
      label: 'Trust',
      count: '8 pages',
      href: '/trust',
      body: 'Security, DPDP, responsible AI, science, method, and anti-leak proof.',
    },
    {
      label: 'Compare',
      count: '15 pages',
      href: '/vs/vervoe',
      body: 'Fair competitor and migration pages for high-intent evaluators.',
    },
  ],
  benchmark: [
    {
      name: 'Vervoe',
      signal: 'Strong real-work assessment story and explainable AI proof.',
      qoriumMove: 'Keep product proof concrete while adding a deeper enterprise trust shell.',
    },
    {
      name: 'TestGorilla',
      signal: 'Broad library navigation, pricing clarity, and skills-test SEO scale.',
      qoriumMove:
        'Match discoverability while differentiating on defensible content infrastructure.',
    },
    {
      name: 'HackerRank',
      signal: 'Technical-screening authority, enterprise familiarity, and AI feature depth.',
      qoriumMove: 'Win beyond coding-only use cases through India/GCC stack depth.',
    },
    {
      name: 'CodeSignal',
      signal: 'Certified assessment language and validation-led market posture.',
      qoriumMove: 'Make assessment science readable for HR, legal, and platform buyers.',
    },
    {
      name: 'iMocha',
      signal: 'Skills intelligence framing beyond point-in-time assessments.',
      qoriumMove:
        'Position role graph, stack coverage, and lifecycle evidence as workforce intelligence.',
    },
    {
      name: 'Mercer Mettl',
      signal: 'India enterprise familiarity, proctoring, and large assessment operations.',
      qoriumMove: 'Look newer, cleaner, and more transparent while owning India-built credibility.',
    },
  ],
  gapClosure: [
    ['IA', 'Mega-menu plus complete sitemap families'],
    ['Moat', 'Anti-leak, IRT, role graph, Stack-Vault, and watermark posture'],
    ['Proof', 'Interactive JD-Forge and graded-answer surfaces'],
    ['Trust', 'Security, DPDP, science, method, responsible AI'],
    ['SEO', 'Skills, library, jobs, roles, stacks, guides, competitors'],
    ['Conversion', 'Demo, sample-pack, API, pricing, and buyer-specific CTAs'],
  ],
  ledgerRows: [
    ['Claim', 'Evidence status', 'Public behavior'],
    ['Customer logos', 'Flag off', 'Module hidden'],
    ['Outcome stats', 'Flag off', 'Module hidden'],
    ['Talpro Customer Zero', 'Evidence held', 'Shown plainly'],
  ],
  villain: {
    eyebrow: 'The leak timeline',
    title: 'Question banks rot faster than hiring teams can refresh them.',
    description:
      'A fresh question can be reconstructed, indexed by prep communities, and lose signal inside the same hiring year. The site now turns that risk into the lead story instead of hiding it in a feature list.',
    timeline: [
      {
        label: 'Week 1-4',
        title: 'First exposure',
        body: 'Early candidates sit the question. A small share post screenshots or memory-reconstructed versions.',
      },
      {
        label: 'Month 2-6',
        title: 'Prep-market indexing',
        body: 'Aggregator sites and tutoring services begin teaching the optimal solution.',
      },
      {
        label: 'Month 6-9',
        title: 'Signal collapse',
        body: 'Pass rates spike, the item is burned, and hiring teams stop trusting the result.',
      },
    ],
  },
  products: [
    {
      name: 'ReadyBank',
      href: '/platform/readybank',
      accent: 'readybank' as const,
      line: 'Shared skill-wise library for platforms, recruiters, and hiring teams.',
    },
    {
      name: 'JD-Forge',
      href: '/platform/jd-forge',
      accent: 'jd-forge' as const,
      line: 'Turn a real job description into a role-shaped assessment pack.',
    },
    {
      name: 'Stack-Vault',
      href: '/platform/stack-vault',
      accent: 'stack-vault' as const,
      line: 'Private, customer-exclusive libraries mapped to enterprise stacks.',
    },
  ],
  moat: [
    'AI-authored pipeline',
    'I/O-psych validation path',
    'Anti-leak rotation',
    'Multi-format export',
    'India-stack depth',
    'Role-graph organization',
    'Per-client watermarking',
    'Content API first',
  ],
  proofZone: {
    eyebrow: 'Proof of work',
    title: 'A question is only useful when its source, fit, and lifecycle are visible.',
    description:
      'The sample viewer keeps the proof concrete without rendering unavailable capture or widget flows.',
    sampleQuestion:
      'A senior backend API intermittently double-charges users during retry storms. Which idempotency design would you test first, and why?',
    rubric: [
      'Names the idempotency key boundary',
      'Separates client retry from payment-provider retry',
      'Describes persistence, replay, and duplicate suppression',
    ],
  },
  buyers: [
    {
      label: 'Assessment Platforms',
      href: '/solutions/assessment-platforms',
      body: 'License content through API and export workflows without rebuilding a large authoring team.',
    },
    {
      label: 'Enterprises & GCCs',
      href: '/solutions/enterprises-gcc',
      body: 'Scope private Stack-Vaults for India-heavy stacks, GCC hiring, and confidential role depth.',
    },
    {
      label: 'Staffing Firms',
      href: '/solutions/staffing-firms',
      body: 'Use ReadyBank and JD-Forge to send clients a cleaner shortlist signal.',
    },
  ],
  trust: [
    'No customer logo rail without a live evidence flag',
    'No unsupported outcome statistics',
    'Talpro India identified as Customer Zero',
    'Trust pages name shipped, beta, and roadmap states',
  ],
  finalCta: {
    title: 'Walk through the library, the leak model, and the buyer route.',
    description:
      'A founder-led demo maps your hiring volume to ReadyBank, JD-Forge, or Stack-Vault.',
    primaryCta: { label: 'Book a demo', href: '/demo' },
    secondaryCta: { label: 'See pricing', href: '/pricing' },
  },
} as const;

// SOURCE: sales/Pricing-Pages-3-SKUs-Copy.md, ReadyBank section.
export const readybankProduct: PlatformProduct = {
  slug: 'readybank',
  name: 'ReadyBank',
  route: '/platform/readybank',
  eyebrow: 'Platform / ReadyBank',
  title: "A library that doesn't leak.",
  description:
    "ReadyBank is QOrium's shared question library for technical assessments: skill-wise, role-mapped, and packaged for API, export, and recruiter subscription workflows.",
  primaryCta: { label: 'Book a 30-min library walkthrough', href: '/demo' },
  secondaryCta: { label: 'Download a sample pack', href: '/sample-pack', flag: 'samplePack' },
  problem: {
    title: 'Shared banks fail when every buyer sees the same stale item.',
    body: 'Assessment platforms need a content layer. Staffing firms need fresh questions. Both lose trust when the bank is copied into prep channels.',
    bullets: [
      'Platform buyers want API and bulk export without hiring a large content team.',
      'Recruiters need a practical subscription, not a six-month enterprise implementation.',
      'Every shared item needs rotation, watermarking, and calibration metadata.',
    ],
  },
  workflow: [
    {
      title: 'Select the role and skill mix',
      body: 'Choose role, difficulty, format, and quantity through the portal or API.',
    },
    {
      title: 'Receive a structured pack',
      body: 'Deliver through REST API, JSON bulk export, CSV, or partner-friendly formats.',
    },
    {
      title: 'Rotate and refresh',
      body: 'Anti-leak rotation, watermarking, and quarterly content refresh are part of the commercial promise.',
    },
  ],
  proof: [
    'REST API plus JSON bulk export are the primary platform motions.',
    'Recruiter tiers include web portal, candidate links, and bulk export.',
    'Download capture surfaces render only after the backing evidence flag is enabled.',
  ],
  pricingIntro:
    'ReadyBank splits pricing by buyer: assessment platforms buy annual API access; recruiters and staffing teams buy monthly subscriptions.',
  pricingTitle: 'ReadyBank pricing by buyer',
  pricingTables: [
    {
      title: 'Assessment-platform tiers',
      columns: ['Tier', 'Price / yr', 'Volume', 'Best for'],
      rows: [
        ['Starter', '$5,000', 'up to 100K candidate-views / yr', '<50K MAU platforms'],
        ['Growth', '$15,000', 'up to 500K candidate-views / yr', '50K-250K MAU platforms'],
        ['Scale', '$25,000', 'unlimited', '250K+ MAU platforms'],
      ],
    },
    {
      title: 'Recruiter and staffing tiers',
      columns: ['Tier', 'Price / mo', 'Recruiters', 'Best for'],
      rows: [
        ['Solo', '₹4,999', '1', 'Independent recruiters'],
        ['Team', '₹19,999', 'up to 5', 'Small staffing firms'],
        ['Studio', '₹49,999', 'up to 25', 'Mid-size in-house TA'],
      ],
    },
  ],
  included: [
    'REST API and JSON bulk export',
    'Per-platform watermarking',
    'IRT-calibrated difficulty parameters',
    'Quarterly content refresh',
    'Dedicated Slack or email channel for platform tiers',
    'Recruiter web portal and bulk export formats',
  ],
  faq: [
    {
      question: 'What languages are covered first?',
      answer:
        'Wave 1 names Java, React and JavaScript, SQL and data, DevOps and SRE, Salesforce, Python, AWS, and AI prompt engineering.',
    },
    {
      question: 'What is not included?',
      answer:
        'Per-customer exclusive variants are Stack-Vault. On-demand JD-specific generation is JD-Forge.',
    },
  ],
};

// SOURCE: sales/Pricing-Pages-3-SKUs-Copy.md, JD-Forge section.
export const jdForgeProduct: PlatformProduct = {
  slug: 'jd-forge',
  name: 'JD-Forge',
  route: '/platform/jd-forge',
  eyebrow: 'Platform / JD-Forge',
  title: 'From JD to assessment in 2 hours. Or 24. Or 5 days.',
  description:
    'JD-Forge takes a job description and produces a custom-fitted technical assessment shaped by role, seniority, stack, and delivery tier.',
  primaryCta: { label: 'Generate a sample', href: '/demo' },
  problem: {
    title: 'A real role rarely matches a generic Senior Java template.',
    body: 'Hiring managers need assessments that reflect the actual JD, not a generic skill label. JD-Forge turns the job spec into the assessment spec.',
    bullets: [
      'Question count, format mix, and difficulty distribution follow the role.',
      'Reviewed and Enterprise tiers add human review and stronger delivery guarantees.',
      'Webhook and export paths keep the pack usable in existing systems.',
    ],
  },
  workflow: [
    {
      title: 'Upload the JD',
      body: 'Use PDF, DOCX, pasted text, or API submission.',
    },
    {
      title: 'Pick tier and output',
      body: 'Choose Standard, Reviewed, or Enterprise with the desired question count and format.',
    },
    {
      title: 'Receive the bundle',
      body: 'Get JSON, CSV, optional PDF, REST API delivery, webhook callback, or download portal.',
    },
  ],
  proof: [
    'Standard, Reviewed, and Enterprise tiers are explicitly priced per JD.',
    'The output bundle includes MCQ, code, design, and case-study formats.',
    'Enterprise delivery includes role-shaping, acceptance criteria, and named delivery ownership.',
  ],
  pricingIntro:
    'JD-Forge is priced per job description, with tier choice based on turnaround and human review depth.',
  pricingTitle: 'JD-Forge pricing by delivery tier',
  pricingTables: [
    {
      title: 'JD-Forge tiers',
      columns: ['Tier', 'Price per JD', 'SLA', 'Best for'],
      rows: [
        ['Standard', '$49', '24 hours', 'High-volume, fast-turnaround hiring'],
        ['Reviewed', '$199', '48 hours', 'Role-critical hires'],
        ['Enterprise', '$499', '5 days', 'Custom JD packs with deeper review'],
      ],
    },
  ],
  included: [
    'Questions generated for your JD, not a generic template',
    'Configurable difficulty distribution',
    'Bundle output: JSON, CSV, and optional PDF',
    'Webhook callback when ready',
    'Seven-day money-back guarantee for Standard and Reviewed tiers',
  ],
  faq: [
    {
      question: 'Will my JD be used for other customers?',
      answer:
        'No. The JD content stays private. Enterprise tier adds an explicit IP-protected motion for high-stakes packs.',
    },
    {
      question: 'How is JD-Forge different from a prompt in ChatGPT?',
      answer:
        'The packaged service adds rubrics, output formats, anti-leak review, watermarking options, and a quality bar around the raw generation step.',
    },
  ],
};

// SOURCE: sales/Pricing-Pages-3-SKUs-Copy.md, Stack-Vault section.
export const stackVaultProduct: PlatformProduct = {
  slug: 'stack-vault',
  name: 'Stack-Vault',
  route: '/platform/stack-vault',
  eyebrow: 'Platform / Stack-Vault',
  title: 'Your roles. Your rubric. Your private vault.',
  description:
    "Stack-Vault is QOrium's customer-exclusive question library: custom-built for your stack, hiring bar, department, and enterprise scope.",
  primaryCta: { label: 'Book a discovery call', href: '/demo' },
  problem: {
    title: 'GCC and enterprise hiring needs private depth, not public banks.',
    body: 'Large teams hire for proprietary stacks, service-line variants, and domain constraints that generic libraries do not mirror.',
    bullets: [
      'Exclusive scope keeps your question library out of shared ReadyBank inventory.',
      'Per-candidate and per-tenant watermarking supports leak attribution.',
      'MSA, DPA, audit rights, and procurement support are part of the motion.',
    ],
  },
  workflow: [
    {
      title: 'Discovery call',
      body: 'Map role graph, library size, anti-leak SLA, and procurement path with TA and engineering leaders.',
    },
    {
      title: 'Sample pack review',
      body: 'Deliver a 50-question pack for engineer review and signed feedback.',
    },
    {
      title: 'Multi-stack scoping',
      body: 'Finalize stack list, contract term, MSA, DPA, payment terms, and delivery plan.',
    },
  ],
  proof: [
    'Tiering is anchored to Department, Enterprise, and Group scopes.',
    'Private-vault copy is explicit about MSA, DPA, and audit rights.',
    'No external customer logo is shown unless a separate evidence flag exists.',
  ],
  pricingIntro:
    'Stack-Vault is annual, enterprise-led, and scaled by stack coverage, library size, support level, and exclusivity scope.',
  pricingTitle: 'Stack-Vault annual pricing',
  pricingTables: [
    {
      title: 'Stack-Vault annual tiers',
      columns: ['Tier', 'Anchor price', 'Library size', 'Stack coverage'],
      rows: [
        ['Department', 'from ₹10L / yr', '1,000-2,500 questions', '1 stack'],
        ['Enterprise', 'from ₹40L / yr', '2,500-5,000 questions', '3-5 stacks'],
        ['Group', 'from ₹1Cr+ / yr', '5,000-15,000 questions', '5-15 stacks'],
      ],
    },
  ],
  included: [
    'Authored against your role graph',
    'Per-candidate variants and watermarking',
    'IRT-calibrated difficulty parameters',
    'Forensic export on confirmed leak',
    'IP assignment within the defined contract scope',
    'MSA, DPA, and dedicated customer success motion',
  ],
  faq: [
    {
      question: 'What is the procurement timeline?',
      answer:
        'Indian GCCs are planned around a 4-9 month path from discovery to first purchase order, with MSA, DPA, InfoSec, and parent-company reviews supported.',
    },
    {
      question: 'Can customers audit the security posture?',
      answer:
        'Yes. Customer audit rights are handled through contract terms and reasonable-notice review paths.',
    },
  ],
};

export const platformProducts = {
  readybank: readybankProduct,
  'jd-forge': jdForgeProduct,
  'stack-vault': stackVaultProduct,
} as const;

// SOURCE: MARKETING_REDESIGN_360_v1.md §7.2; 01-Market-Landscape.md §3;
// 05-QOrium-Three-Use-Cases-SKU-Architecture.md §1.
export const solutionBuyerPages: Record<BuyerSolution['slug'], BuyerSolution> = {
  'assessment-platforms': {
    slug: 'assessment-platforms',
    route: '/solutions/assessment-platforms',
    eyebrow: 'Solutions / Assessment platforms',
    title: 'License a defensible content layer without rebuilding the authoring team.',
    description:
      'For assessment platforms, QOrium is a content-API and export partner: ReadyBank for scale, JD-Forge for custom packs, and Stack-Vault for private enterprise deals.',
    pain: {
      title: 'Content teams are expensive, slow, and always racing leakage.',
      body: 'The market landscape frames platform buyers as content-hungry: they need more roles, more stacks, and fresher banks without letting authoring become the bottleneck.',
      bullets: [
        'In-house authoring does not scale to thousands of skills and continuous refresh.',
        'Leaked questions damage platform trust even when the assessment UI is strong.',
        'API, bulk export, and white-label delivery let platforms integrate without changing their buyer motion.',
      ],
    },
    matchedSkus: [
      {
        name: 'ReadyBank',
        href: '/platform/readybank',
        fit: 'Annual API license and bulk export for shared content scale.',
      },
      {
        name: 'JD-Forge',
        href: '/platform/jd-forge',
        fit: 'On-demand packs for customer-specific job descriptions.',
      },
      {
        name: 'Stack-Vault',
        href: '/platform/stack-vault',
        fit: 'Private vaults your platform can deliver to enterprise accounts.',
      },
    ],
    workflow: [
      {
        title: 'Content audit',
        body: 'Map your existing library, gap clusters, export format, and API constraints.',
      },
      {
        title: 'Pilot pack',
        body: 'Ship a bounded ReadyBank or JD-Forge pack into one customer workflow.',
      },
      {
        title: 'Scale license',
        body: 'Move to annual API access, refresh cadence, and support channel.',
      },
    ],
    indiaProof: [
      'India stack depth for SAP, Oracle, Salesforce, ServiceNow, embedded, mainframe, and BFSI.',
      'DPDP-aligned contract language for India-led platform delivery.',
      'No partner logo rail renders before the evidence flag is live.',
    ],
    primaryCta: { label: 'Talk to API sales', href: '/demo' },
    secondaryCta: { label: 'View ReadyBank', href: '/platform/readybank' },
  },
  'enterprises-gcc': {
    slug: 'enterprises-gcc',
    route: '/solutions/enterprises-gcc',
    eyebrow: 'Solutions / Enterprises and GCCs',
    title: 'Build a private assessment vault for the stack your teams actually use.',
    description:
      'For enterprise and GCC buyers, QOrium routes toward Stack-Vault: exclusive role graphs, India stack depth, DPA support, and leak-accountable libraries.',
    pain: {
      title: 'Generic public banks do not mirror enterprise stack depth.',
      body: 'GCC and enterprise roles often mix proprietary services, legacy systems, regional delivery context, and high-volume hiring pressure.',
      bullets: [
        'Candidates can rehearse public banks faster than teams can refresh them.',
        'Engineering leaders need rubrics that match the role, not only the skill name.',
        'InfoSec and legal teams need DPA, IP scope, and audit language before rollout.',
      ],
    },
    matchedSkus: [
      {
        name: 'Stack-Vault',
        href: '/platform/stack-vault',
        fit: 'Primary motion: customer-exclusive, stack-mapped libraries.',
      },
      {
        name: 'JD-Forge',
        href: '/platform/jd-forge',
        fit: 'One-off custom packs for urgent roles before a full vault exists.',
      },
      {
        name: 'ReadyBank',
        href: '/platform/readybank',
        fit: 'Shared starter coverage where exclusivity is not required.',
      },
    ],
    workflow: [
      {
        title: 'Role graph workshop',
        body: 'TA, engineering, InfoSec, and QOrium map roles, stacks, formats, and evidence needs.',
      },
      {
        title: 'Engineer-reviewed pack',
        body: 'QOrium ships a bounded sample pack for technical accuracy and fit review.',
      },
      {
        title: 'Private vault rollout',
        body: 'The production vault is scoped through MSA, DPA, access model, refresh cadence, and support tier.',
      },
    ],
    indiaProof: [
      'Built for GCC-heavy hiring patterns in India.',
      'Regional stack depth includes enterprise systems that generic coding-only tools under-serve.',
      'Evidence modules stay factual until procurement proof, logos, and outcomes exist.',
    ],
    primaryCta: { label: 'Scope a Stack-Vault', href: '/demo' },
    secondaryCta: { label: 'View Stack-Vault', href: '/platform/stack-vault' },
  },
  'staffing-firms': {
    slug: 'staffing-firms',
    route: '/solutions/staffing-firms',
    eyebrow: 'Solutions / Staffing firms',
    title: 'Send clients a shortlist signal they can trust.',
    description:
      'For staffing firms, QOrium combines ReadyBank subscriptions with JD-Forge packs so recruiters can screen faster without relying on copied public banks.',
    pain: {
      title: 'Staffing firms win on speed, but weak test banks weaken the shortlist.',
      body: 'The fastest shortlist still fails if clients believe candidates saw the same questions on prep blogs.',
      bullets: [
        'Recruiters need practical pricing and export paths, not platform rebuilds.',
        'Client-specific JDs need quick custom packs during active drives.',
        'Talpro India provides the Customer Zero feedback loop for daily staffing workflows.',
      ],
    },
    matchedSkus: [
      {
        name: 'ReadyBank',
        href: '/platform/readybank',
        fit: 'Subscription access for recurring technical screening.',
      },
      {
        name: 'JD-Forge',
        href: '/platform/jd-forge',
        fit: 'Per-JD custom packs for live client requirements.',
      },
      {
        name: 'Stack-Vault',
        href: '/platform/stack-vault',
        fit: 'Enterprise account expansion when a client needs exclusivity.',
      },
    ],
    workflow: [
      {
        title: 'Pick a recruiter tier',
        body: 'Start with Solo, Team, or Studio based on recruiter count and role volume.',
      },
      {
        title: 'Generate client packs',
        body: 'Use ReadyBank for common roles and JD-Forge when the client sends a specific job description.',
      },
      {
        title: 'Package the shortlist',
        body: 'Send scorecards and question-pack evidence into the client review loop.',
      },
    ],
    indiaProof: [
      'Talpro India is the named Customer Zero motion.',
      'Recruiter tiers are priced in INR for India staffing usage.',
      'Client proof beyond Talpro stays hidden until evidence exists.',
    ],
    primaryCta: { label: 'Start staffing walkthrough', href: '/demo' },
    secondaryCta: { label: 'View recruiter tiers', href: '/platform/readybank' },
  },
};
