// Feature deep-dive copy for ReadyBank, JD-Forge, Stack-Vault.
// All grounded in 05-QOrium-Three-Use-Cases-SKU-Architecture.md.

export type FeaturePageCopy = {
  slug: 'readybank' | 'jd-forge' | 'stack-vault';
  hero: { eyebrow: string; title: string; sub: string };
  steps: { title: string; body: string }[];
  includes: { tab: string; lines: string[] }[];
  useCase: { who: string; quote: string };
  comparison: { competitor: string; them: string; us: string }[];
  pricing: { tier: string; range: string; detail: string }[];
};

// SOURCE: 05-SKU §2
export const readybankCopy: FeaturePageCopy = {
  slug: 'readybank',
  hero: {
    eyebrow: 'ReadyBank',
    title: 'A shared library that stays fresh.',
    sub: 'Every question we have ever authored that has cleared SME validation, indexed in the role-graph, available to every paying customer. IRT-calibrated. Anti-leak-rotated quarterly.',
  },
  steps: [
    {
      title: 'You spec a role',
      body: 'Skill, difficulty band, format mix, count. Or just hit the API with a JD.',
    },
    {
      title: 'We return a pack',
      body: 'JSON via /v1/packs/generate, or CSV / HackerRank YAML / Mettl XLSX bulk export.',
    },
    {
      title: 'We rotate it',
      body: 'Continuous monitoring of public sources. Leaks trigger AI variant + SME validate + release as v2.',
    },
  ],
  includes: [
    {
      tab: 'API',
      lines: [
        'GET /v1/questions/{uuid}',
        'POST /v1/questions/search { skill, difficulty, format, count }',
        'POST /v1/packs/generate { role, format_mix, anti_leak_min }',
        'GET /v1/packs/{id}/export.{csv|json|hackerrank-yaml|mettl-xlsx}',
        'Latency target: <200ms p95 for retrieval, <2s for pack generation',
      ],
    },
    {
      tab: 'Bulk export',
      lines: [
        'Console: define role + difficulty + count + format → download',
        'Native exporters: HackerRank import, Mettl bulk-upload XLSX, Codility import JSON',
        'Generic: CSV, JSON, XLSX',
        'Watermarked footer with QOrium attribution + rotation date',
      ],
    },
    {
      tab: 'Embedded widget',
      lines: [
        'Drop-in JS, 10 lines of customer code',
        'QOrium handles rendering, code execution (Judge0 backend), grading',
        'Per-assessment delivery + monthly platform fee',
        'Best fit: staffing firms with no engineering team, training institutes',
      ],
    },
  ],
  useCase: {
    who: 'Mid-tier IT staffing firm',
    quote:
      '"Same Mettl questions every recruiter uses are leaked. We subscribed to ReadyBank for ₹14,999/month, get 1,000 fresh-rotated questions across 20 roles, ship signal our enterprise client trusts."',
  },
  comparison: [
    {
      competitor: 'HackerRank',
      them: 'Platform-first; content is incidental',
      us: 'Content-first; content layer + 20 platform exports',
    },
    {
      competitor: 'Mettl',
      them: 'Rotates rarely; static library',
      us: '15% of library rotated quarterly; continuous-rotation tier available',
    },
    {
      competitor: 'Codility',
      them: 'Coding-only',
      us: 'MCQ, coding, SQL, SJT, system-design, simulation — 40+ formats',
    },
    {
      competitor: 'Adaface',
      them: 'Skill-test platform',
      us: 'Library you can pipe into ANY platform via import format',
    },
  ],
  pricing: [
    {
      tier: 'Platform Starter',
      range: '$50K / yr',
      detail: '10K questions/mo · monthly scan + quarterly rotation',
    },
    {
      tier: 'Platform Growth',
      range: '$150K / yr',
      detail: '50K questions/mo · weekly scan + monthly rotation',
    },
    {
      tier: 'Platform Enterprise',
      range: '$500K+ / yr',
      detail: 'Unlimited · continuous + real-time rotation',
    },
    {
      tier: 'Recruiter Solo',
      range: '₹4,999 / mo',
      detail: '200 questions/mo · 5 roles · bulk export',
    },
    {
      tier: 'Recruiter Team',
      range: '₹14,999 / mo',
      detail: '1,000 questions/mo · 20 roles · widget + export',
    },
    {
      tier: 'Recruiter Agency',
      range: '₹49,999 / mo',
      detail: '5,000 questions/mo · unlimited roles · light API',
    },
  ],
};

// SOURCE: 05-SKU §3
export const jdforgeCopy: FeaturePageCopy = {
  slug: 'jd-forge',
  hero: {
    eyebrow: 'JD-Forge',
    title: 'Upload a JD. Get a 20-question pack in 30 seconds.',
    sub: 'Real-time AI generation tuned to your job description. Optional human SME review. Per-JD pricing or subscription with bundled JD allowance.',
  },
  steps: [
    {
      title: 'Drop the JD',
      body: 'Web upload, paste, or POST to /v1/jdforge/generate. Up to 4 clarifying questions if parse confidence is low.',
    },
    {
      title: 'AI extracts → drafts',
      body: 'Role + skills + seniority + domain + tooling. Then 20 questions in ~10 seconds, format-mix tuned to seniority.',
    },
    {
      title: 'Optional SME review',
      body: 'Standard ships AI-only in 30 seconds. Reviewed adds a human SME pass within 4 hours. Enterprise locks the IP.',
    },
  ],
  includes: [
    {
      tab: 'Generation pipeline',
      lines: [
        'JD parse: role, skills, seniority, domain, must-haves, tooling',
        'Spec generation: decompose into N questions with format mix',
        'AI draft: parallel generation, 20 questions in ~10s',
        'AI self-critique: auto-reject ambiguous / leaked-pattern matches',
        'Express SME review (Reviewed/Enterprise tiers): async 4h SLA',
        'Return pack: JSON / CSV / direct platform export',
      ],
    },
    {
      tab: 'Format mix',
      lines: [
        'Junior frontend: more coding fundamentals, fewer SJTs',
        'Senior backend: more system-design SJTs, complexity questions',
        'Salesforce admin: SJT + config tasks, MCQ on platform internals',
        'Embedded automotive: low-level coding + SJT on safety/timing',
        'Format-mix template per role — tunable per drive',
      ],
    },
    {
      tab: 'IP protection',
      lines: [
        'Standard: AI-only, returned in 30 seconds',
        'Reviewed: same pipeline + human SME, 4-hour SLA',
        "Enterprise: Reviewed + contractual IP guarantee — never enters ReadyBank or any other customer's output",
        'Watermarking optional in Enterprise tier',
      ],
    },
  ],
  useCase: {
    who: 'Enterprise with high JD volume',
    quote:
      '"We upload 200 JDs/month. Each one needs a different assessment. Manually configuring 200 assessments takes 100 hours of TA team time. JD-Forge generates a calibrated, JD-aligned 20-question pack in 30 seconds, $99 per JD."',
  },
  comparison: [
    {
      competitor: 'In-house ChatGPT prompt',
      them: 'Generic, no anti-leak filter, no validation',
      us: 'Validated pipeline + anti-leak filter + format-mix tuning',
    },
    {
      competitor: 'HackerRank Library Builder',
      them: 'Hand-curated, slow, expensive',
      us: '30-second SLA, $49–$499 per JD',
    },
    {
      competitor: 'Mettl Custom Assessment',
      them: 'Multi-day turnaround',
      us: 'Standard: 30 sec · Reviewed: 4 hr · Enterprise: 4 hr + IP lock',
    },
  ],
  pricing: [
    {
      tier: 'Standard (AI-only)',
      range: '$49 / ₹3,999 / JD',
      detail: 'or $499/mo for 25 JDs · staffing firms, mid-volume',
    },
    {
      tier: 'Reviewed (AI + SME)',
      range: '$199 / ₹15,999 / JD',
      detail: 'or $1,999/mo for 15 JDs · enterprises, high-stakes hires',
    },
    {
      tier: 'Enterprise (IP-protected)',
      range: '$499 / ₹39,999 / JD',
      detail: 'or $9,999/mo for 30 JDs · GCCs, executive search',
    },
  ],
};

// SOURCE: 05-SKU §4
export const stackvaultCopy: FeaturePageCopy = {
  slug: 'stack-vault',
  hero: {
    eyebrow: 'Stack-Vault',
    title: 'Your tech stack. Your library. Yours alone.',
    sub: "Customer-exclusive private library aligned to one company's tech stack. Watermarked per candidate. Quarterly refresh. Contractually unique — no question in your Stack-Vault appears in ReadyBank, in any JD-Forge output, or in any other customer's vault.",
  },
  steps: [
    {
      title: 'Stack discovery',
      body: '90-day intake: your role list, tech stack, domain quirks, hiring patterns. Custom role-graph mapping.',
    },
    {
      title: 'Library build',
      body: '8–12 weeks. 2,000+ questions authored across your role-graph. Per-client variants. Cryptographic watermark.',
    },
    {
      title: 'Quarterly refresh',
      body: '50–500 new questions per quarter (by tier), 25–200 retired. Continuous leak monitoring + forensic attribution.',
    },
  ],
  includes: [
    {
      tab: 'Build',
      lines: [
        'Stack intake: role list, tech stack, domain quirks, hiring patterns',
        'Role-graph mapping: custom for your hiring patterns',
        'Initial library: 500 / 2,000 / 5,000+ questions by tier',
        'Per-client variants: each question has a YOU-specific version',
        'Watermark injection: cryptographic per-customer marker in test cases + problem statements',
        'Mandatory SME validation — no exceptions',
        'Calibration: Reference Panel + your candidate pool',
      ],
    },
    {
      tab: 'Ongoing',
      lines: [
        'Private namespace under your QOrium account',
        'Quarterly refresh: new + retire, scaled to tier',
        'Continuous leak monitoring',
        'Forensic attribution if a leak crosses the contractual boundary',
        'Stack-Vault API: included in Enterprise + Group; ₹5L/yr add-on for Department',
      ],
    },
    {
      tab: 'Add-ons',
      lines: [
        'Regional language localization (Hindi, Tamil, Telugu, etc.): +30% on tier',
        'Custom format development (e.g., proprietary internal tool simulation): ₹5L–25L per format',
        'Live SME interview design (rubrics + question pool): ₹2L per role family',
        'Real-time anti-leak monitoring (vs quarterly): +20% on tier',
        'Annual re-architecture as your stack evolves',
      ],
    },
  ],
  useCase: {
    who: 'A large engineering GCC — typical engagement',
    quote:
      '"Your candidates have already seen the Mettl + HackerEarth banks. Your in-house TA team can\'t author 2,000 questions across your stack. Buy a stack-exclusive Stack-Vault: ₹40L/year, 2,000 questions covering every role you hire, refreshed quarterly, watermarked, contractually exclusive. Reuse infinitely across all your assessments."',
  },
  comparison: [
    {
      competitor: 'In-house authoring',
      them: '₹1.2 Cr / yr for a content team that ships 1,800 questions',
      us: '₹40L / yr for 2,000+ questions, refreshed quarterly, watermarked',
    },
    {
      competitor: 'White-label HackerRank',
      them: 'Same shared library across customers',
      us: 'Contractually exclusive — not in ReadyBank, not in any other vault',
    },
    {
      competitor: 'Generic question banks',
      them: 'No India-stack coverage (SAP ABAP, Oracle Banking, Embedded automotive)',
      us: 'India-stack-fluent + your specific custom flavor',
    },
  ],
  pricing: [
    {
      tier: 'Stack-Vault Department',
      range: '₹10L / yr (~$12K)',
      detail: '500 questions · 1 dept · 5–10 roles · 50/25 refresh',
    },
    {
      tier: 'Stack-Vault Enterprise',
      range: '₹40L / yr (~$48K)',
      detail: '2,000 questions · multi-dept · 20–30 roles · 200/100 refresh',
    },
    {
      tier: 'Stack-Vault Group',
      range: '₹1Cr+ / yr (~$120K+)',
      detail: '5,000+ questions · whole org · 50+ roles · 500/200 refresh',
    },
  ],
};

export const featureIndex = [
  {
    slug: 'readybank',
    title: 'ReadyBank',
    summary: 'Shared, IRT-calibrated, anti-leak-rotated.',
    accent: 'For platforms and recruiters',
  },
  {
    slug: 'jd-forge',
    title: 'JD-Forge',
    summary: 'On-demand custom packs in 30 seconds.',
    accent: 'For enterprises with high JD volume',
  },
  {
    slug: 'stack-vault',
    title: 'Stack-Vault',
    summary: 'Customer-exclusive, watermarked, contractually unique.',
    accent: 'For GCCs and BFSI majors',
  },
] as const;
