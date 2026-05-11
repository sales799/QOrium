// All copy here is grounded in source docs. Each block carries a
// SOURCE comment pointing to the doc + section it derives from.
// Do not invent claims. If a number isn't in a doc, omit it.

export const homeCopy = {
  hero: {
    eyebrow: 'Question-Bank-as-a-Service',
    // SOURCE: 09-Constitution v2 §1.1 (locked USP — do not paraphrase)
    headline: "The world's question bank for hiring.",
    sub: 'QOrium delivers an IRT-calibrated, anti-leak-rotated, watermark-per-candidate library — across general tech, India-stack, and AI-era assessment formats — to platforms, enterprises, and recruiters.',
    primaryCta: { label: 'Book a demo', href: '/demo' as const },
    secondaryCta: { label: 'See the platform', href: '/product' as const },
  },

  // SOURCE: governance/Investor-Brief-Pre-A-v1 §2 (TAM), §3.4 (530 questions),
  // 07-CTO-Architecture §6 (latency target), 04-Blueprint §3.2 (20+ formats)
  proof: [
    { label: 'assessment-content TAM', value: 30, prefix: '$', suffix: 'B+' },
    { label: 'questions validated · M0', value: 530 },
    { label: 'p95 question retrieval', value: 200, prefix: '<', suffix: 'ms' },
    { label: 'platform import formats', value: 20, suffix: '+' },
  ] as const,

  // SOURCE: 05-SKU-Architecture §1 — three-SKU summary
  pillars: {
    eyebrow: 'Three SKUs, one library',
    title: 'Buy the shape that fits how you hire.',
    description:
      'Same engine. Different exclusivity. Pick the SKU that matches your hiring volume and IP posture.',
    cards: [
      {
        title: 'ReadyBank',
        href: '/features/readybank' as const,
        // SOURCE: 05-SKU §2.1
        description:
          'Shared, multi-tenant question library. IRT-calibrated, anti-leak-rotated quarterly. Indexed in the role-graph. API + bulk export.',
        accent: 'For platforms and recruiters',
      },
      {
        title: 'JD-Forge',
        href: '/features/jd-forge' as const,
        // SOURCE: 05-SKU §3
        description:
          'Upload a JD. Get a 20-question pack in 30 seconds. Real-time AI generation, optional SME review, fresh per drive.',
        accent: 'For enterprises with high JD volume',
      },
      {
        title: 'Stack-Vault',
        href: '/features/stack-vault' as const,
        // SOURCE: 05-SKU §4
        description:
          'Customer-exclusive private library aligned to your tech stack. Watermarked per candidate. Quarterly refresh, contractually exclusive.',
        accent: 'For GCCs and BFSI majors',
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
    'Bosch GCC · in discovery',
    'Wave 1 · Tech Core SMEs',
    'Wave 2 · India Stack SMEs',
  ],

  faq: {
    eyebrow: 'Common questions',
    title: 'What people ask before they buy.',
    items: [
      {
        q: 'How is QOrium different from HackerRank or Mettl?',
        // SOURCE: governance/Investor-Brief §2 (positioning)
        a: "They run assessments. We supply the questions that power them. We don't compete with HackerRank or Mettl — we make their content libraries fresher and harder to leak. We're a content layer, not a platform.",
      },
      {
        q: 'What does "anti-leak rotation" actually mean?',
        // SOURCE: 05-SKU §2.3, 07-CTO §7
        a: 'Continuous monitoring of public sources (Glassdoor, LeetCode, Reddit, GeeksforGeeks). When a question surfaces, an AI generates a semantic variant, an SME validates, the variant releases as v2, and the original retires. ReadyBank rotates 15% of the library quarterly.',
      },
      {
        q: 'Can I get a Stack-Vault contractually exclusive to my company?',
        // SOURCE: 05-SKU §4.1
        a: 'Yes. Stack-Vault is the SKU for that. No question in your Stack-Vault appears in ReadyBank, in any other Stack-Vault, or in any JD-Forge output to another customer. Watermarking enables forensic attribution if anything leaks.',
      },
      {
        q: 'How fast is JD-Forge?',
        // SOURCE: 05-SKU §3.3
        a: "Standard tier: 30 seconds, AI-only. Reviewed tier: 4 hours, AI plus human SME. Enterprise tier adds an IP-protection guarantee — your generated pack never enters ReadyBank or any other customer's output.",
      },
      {
        q: 'Where do you stand on bias and validation?',
        // SOURCE: governance/Bias-Detection-Methodology v1
        a: 'Every question gets a self-critique pass against ambiguity, distractor quality, edge cases, bias, and leak risk. SME review is mandatory for ReadyBank and Stack-Vault. The reference panel calibrates difficulty empirically.',
      },
    ],
  },

  finalCta: {
    title: 'Ready to see the engine?',
    description:
      'Book a 30-minute walk-through. Bring a JD if you want to see JD-Forge generate live.',
    primary: { label: 'Book a demo', href: '/demo' as const },
    secondary: { label: 'See pricing', href: '/pricing' as const },
  },
} as const;
