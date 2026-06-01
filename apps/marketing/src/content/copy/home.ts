// All copy here is grounded in source docs. Each block carries a
// SOURCE comment pointing to the doc + section it derives from.
// Do not invent claims. If a number isn't in a doc, omit it.

export const homeCopy = {
  hero: {
    eyebrow: 'India-built skills assessments',
    headline: 'Skills assessments built in India. Trusted because we show our work.',
    sub: 'AI-assisted, audit-forward, and DPDP-aligned. QOrium helps hiring teams move from resume-first shortlists to structured skills evidence without publishing claims before proof exists.',
    proofLine:
      'Roadmap spine: IRT-calibrated, anti-leak-rotated, watermark-per-candidate assessment evidence.',
    primaryCta: {
      label: 'See the Assessment Library',
      href: '/library' as const,
    },
    secondaryCta: { label: 'Book a 20-min demo', href: '/demo' as const },
  },

  // SOURCE: governance/Investor-Brief-Pre-A-v1 §2 (TAM), §3.4 (530 questions),
  // 07-CTO-Architecture §6 (latency target), 04-Blueprint §3.2 (20+ formats)
  proof: [
    { label: 'seed skill pages live', value: 25 },
    { label: 'compare pages live', value: 5 },
    { label: 'guide previews live', value: 6 },
    { label: 'outcome stat slots pending evidence', value: 3 },
  ] as const,

  // SOURCE: 05-SKU-Architecture §1 — three-SKU summary
  pillars: {
    eyebrow: 'Three wedges',
    title: 'Defensible hiring evidence, not resume theatre.',
    description:
      'QOrium is being built around three public wedges: JD-to-test generation, item-level calibration, and India-first trust language.',
    cards: [
      {
        title: 'ReadyBank',
        href: '/library' as const,
        description:
          'A public assessment library surface with skill pages, role links, sample questions, and explicit calibration status.',
        accent: 'For hiring teams starting now',
      },
      {
        title: 'JD-Forge',
        href: '/features/jd-forge' as const,
        description:
          'The wedge: paste a JD, draft a structured assessment, then review before publishing. Public copy stays beta until backend proof lands.',
        accent: 'For role-specific assessment drafts',
      },
      {
        title: 'Stack-Vault',
        href: '/features/stack-vault' as const,
        description:
          'Private-library positioning for regulated teams. Certification and audit badges remain evidence-gated.',
        accent: 'For enterprise governance',
      },
    ],
  },

  // SOURCE: 04-Blueprint §3.3 (three buyer packages)
  icps: {
    eyebrow: 'Built for',
    title: "Whichever side of hiring you're on, QOrium fits.",
    cards: [
      {
        label: 'Platforms',
        href: '/solutions/platforms' as const,
        copy: 'HackerRank, Mettl, HackerEarth, Adaface tier. Stop spending $1.2M/yr on a content team — license the API.',
      },
      {
        label: 'Enterprises & GCCs',
        href: '/solutions/enterprises' as const,
        copy: 'Bosch, TCS, Infosys, JPMC India. Build your stack-aligned library, watermarked, exclusive.',
      },
      {
        label: 'Staffing firms',
        href: '/solutions/staffing' as const,
        copy: 'Talpro India is Customer Zero. ₹4,999–₹49,999/mo subscription. Per-JD packs on demand.',
      },
    ],
  },

  // SOURCE: 04-Blueprint §3.1 (the 7-stage content engine)
  pipeline: {
    eyebrow: 'The Content Engine',
    title: 'Every question runs the same seven stages.',
    description:
      'AI authors fast; humans validate; the panel calibrates; the engine watches for leaks and rotates. Same pipeline, three SKUs.',
    stages: [
      { label: 'Spec in', detail: 'Role · skill · difficulty · format · constraints' },
      { label: 'AI draft', detail: 'Claude Opus, structured JSON, format-specific guardrails' },
      {
        label: 'Self-critique',
        detail: 'Same model · ambiguity, distractor quality, edge cases, bias, leak risk',
      },
      { label: 'SME review', detail: 'Paid contractor + in-house · accept · edit · reject' },
      { label: 'Calibrate', detail: 'Reference Panel sample · IRT difficulty estimate' },
      { label: 'Release', detail: 'Tagged in role-graph · indexed · watermarked' },
      { label: 'Post-deploy', detail: 'Performance + leak monitor · auto-retire · regenerate' },
    ],
  },

  // SOURCE: governance/Investor-Brief §3.4 (Customer Zero, Bosch in talks, Wave 1+2)
  trustRail: [
    'Talpro India · Customer Zero',
    'DPDP-aligned language',
    'Outcome stats · pending instrumentation',
    'Trust badges · evidence-gated',
  ],

  faq: {
    eyebrow: 'Common questions',
    title: 'What people ask before they buy.',
    items: [
      {
        q: 'How is QOrium different from global assessment tools?',
        a: 'QOrium is positioning around India-first compliance language, job-description-to-assessment workflows, and defensible scoring evidence. We avoid unsupported claims until backend proof exists.',
      },
      {
        q: 'Are the public outcome numbers live?',
        a: 'No. The homepage keeps outcome slots visible as pending evidence until Phase 5 instrumentation can support them.',
      },
      {
        q: 'Can I browse the assessment library?',
        a: 'Yes. The public assessment library shows seeded skill pages, sample questions, roles, duration, difficulty, and calibration status.',
      },
      {
        q: 'How fast is JD-Forge?',
        a: 'JD-Forge is treated as a beta wedge on public pages until the backend milestone proves the timing and quality bar.',
      },
      {
        q: 'Where do you stand on bias and validation?',
        a: 'The public trust story is audit-forward: QOrium names validation and bias-audit goals, but does not claim independent audit completion until evidence lands.',
      },
    ],
  },

  finalCta: {
    title: 'Ready to replace resume-first screening?',
    description:
      'Book a 20-minute walkthrough of the assessment library and evidence-gated roadmap.',
    primary: { label: 'Book a demo', href: '/demo' as const },
    secondary: { label: 'See pricing', href: '/pricing' as const },
  },
} as const;
