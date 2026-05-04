// SOURCE comments throughout. Do not invent claims.

export const productCopy = {
  hero: {
    eyebrow: 'Platform overview',
    title: 'One engine. Three SKUs. The content layer the assessment industry was missing.',
    sub: "Below the platform UI you click. Below the test runner. Below the candidate dashboard. The questions themselves — that's where every assessment platform's quality bar gets set, and where every leak originates. QOrium owns that layer.",
  },

  // SOURCE: governance/Investor-Brief §1 (Bhaskar's voice)
  problem: {
    eyebrow: 'The problem',
    title: 'Every Senior Java question on HackerRank is on Reddit by Friday.',
    body: [
      'After 15 years running Talpro India staffing, the same thing happened every year: hiring teams paid HackerRank or Mettl ₹15-25K/year for assessment libraries that leaked in days.',
      'By Friday, every Senior Java question was on Reddit. The 95%-on-screen candidate flunked the technical interview. The hiring manager called us, frustrated.',
      "The assessment platforms know this. They just don't solve it — their moat is the platform. Content was always somebody else's problem.",
    ],
  },

  // SOURCE: 04-Blueprint §3.1
  engine: {
    eyebrow: 'The Content Engine',
    title: 'Seven stages, every question.',
    body: 'Same pipeline regardless of SKU. The stages flex per SKU (JD-Forge skips human review on the Standard tier; Stack-Vault doubles SME validation). The architecture is the moat.',
  },

  // SOURCE: 05-SKU-Architecture §1
  skus: {
    eyebrow: 'Three SKUs',
    title: 'Pick the shape that fits your IP posture.',
    body: 'Same underlying library. Different exclusivity. Different price. Different velocity.',
    rows: [
      {
        name: 'ReadyBank',
        what: 'Shared, multi-tenant question library indexed by skill / role / difficulty.',
        forWho: 'Platforms · staffing firms · mid-market enterprises',
        price: '$50K–$500K/yr (platforms); ₹4,999–₹49,999/mo (recruiters)',
        href: '/features/readybank' as const,
      },
      {
        name: 'JD-Forge',
        what: 'On-demand custom pack generated per uploaded JD in 30 seconds.',
        forWho: 'Enterprises with high JD volume · staffing firms running active drives',
        price: '$49 / $199 / $499 per JD',
        href: '/features/jd-forge' as const,
      },
      {
        name: 'Stack-Vault',
        what: "Customer-exclusive private library aligned to one company's tech stack.",
        forWho: 'GCCs · large IT services · BFSI majors',
        price: '₹10L–₹1Cr+/yr',
        href: '/features/stack-vault' as const,
      },
    ],
  },

  // SOURCE: 07-CTO-Architecture §7
  antileak: {
    eyebrow: 'The moat',
    title: 'Anti-leak rotation, not anti-leak claims.',
    bullets: [
      'Continuous crawl of Glassdoor, LeetCode, Reddit, GeeksforGeeks, public github gists, and indexed PDFs.',
      'Semantic similarity match — not string match. Variants count.',
      'When a hit fires: AI regenerates a semantic variant; SME validates; new question releases as v2; original retires.',
      'ReadyBank target: 15% of library rotated quarterly. Continuous-rotation tier available for high-stakes platforms.',
      'Stack-Vault: per-customer watermarking enables forensic attribution if a leak crosses the contractual boundary.',
    ],
  },

  // SOURCE: 07-CTO-Architecture §5
  rolegraph: {
    eyebrow: 'The role-graph',
    title: 'Roles map to skills map to questions, in a normalized graph.',
    body: 'A "Senior Backend Engineer (Java Spring Boot, 5+ yrs)" decomposes into a tree of skills, each tagged with format-mix preferences and difficulty bands. The graph compounds with every JD parsed. Coverage gaps surface automatically.',
  },

  // SOURCE: 09-Constitution v2 §VII (quality bars)
  quality: {
    eyebrow: 'Quality bars',
    title: "We've codified the rules so you don't have to ask.",
    bars: [
      { label: 'Test coverage', value: '≥80%', detail: 'on every changed file' },
      { label: 'TypeScript errors', value: '0', detail: 'tsc --noEmit must pass' },
      { label: 'API errors', value: 'RFC 7807', detail: 'Problem Details on every public failure' },
      {
        label: 'Security headers',
        value: 'Always',
        detail: 'CSP, HSTS, X-Frame-Options on every response',
      },
      { label: 'Logging', value: 'Pino', detail: 'structured logs on every significant code path' },
      { label: 'Secrets', value: 'gitleaks', detail: 'pre-commit + CI; .env-only' },
    ],
  },

  cta: {
    title: 'Want to see this run live?',
    description: 'A 30-minute demo covers the engine, both pricing toggles, and one of your JDs.',
    primary: { label: 'Book a demo', href: '/demo' as const },
    secondary: { label: 'See pricing', href: '/pricing' as const },
  },
} as const;
