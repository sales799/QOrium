// SOURCE: 05-SKU-Architecture pricing tables
// IMPORTANT: All prices are RANGES, never single SKUs. The pricing page MUST
// preserve "Talk to us" CTAs and never publish absolute SKU prices without
// legal/finance review.

export const pricingCopy = {
  hero: {
    eyebrow: 'Pricing',
    title: 'Three SKUs. Three engagement models.',
    sub: 'Pricing depends on volume, exclusivity, and refresh cadence. The ranges below are public anchors. Final terms are negotiated against your hiring volume and stack scope.',
  },

  tiers: [
    {
      name: 'ReadyBank',
      tagline: 'Shared, IRT-calibrated, anti-leak-rotated.',
      // SOURCE: 05-SKU §2.4
      pricing: {
        platforms: '$50K–$500K / year',
        recruiters: '₹4,999–₹49,999 / month',
        oneTime: '₹1L–₹6L / pack (mid-market)',
      },
      includes: [
        '10K–unlimited questions/month per tier',
        'Anti-leak SLA: monthly → real-time by tier',
        'API rate limit: 100 → 5,000 req/min by tier',
        'CSV / JSON / HackerRank YAML / Mettl XLSX bulk exports',
      ],
      cta: { label: 'Talk to sales', href: '/contact' as const },
      featured: false,
    },
    {
      name: 'JD-Forge',
      tagline: 'On-demand custom packs in 30 seconds.',
      // SOURCE: 05-SKU §3.4
      pricing: {
        standard: '$49 / ₹3,999 per JD',
        reviewed: '$199 / ₹15,999 per JD',
        enterprise: '$499 / ₹39,999 per JD',
      },
      includes: [
        'Standard: AI-only, 30-second SLA',
        'Reviewed: AI + human SME, 4-hour SLA',
        'Enterprise: Reviewed + IP-protection guarantee',
        'Subscription bundles: $499–$9,999 / month',
      ],
      cta: { label: 'Try a JD live', href: '/demo' as const },
      featured: true,
    },
    {
      name: 'Stack-Vault',
      tagline: 'Customer-exclusive, watermarked, contractually unique.',
      // SOURCE: 05-SKU §4.4
      pricing: {
        department: '₹10L / yr (~$12K)',
        enterprise: '₹40L / yr (~$48K)',
        group: '₹1Cr+ / yr (~$120K+)',
      },
      includes: [
        'Department: 500 questions, 1 dept, 5–10 roles',
        'Enterprise: 2,000 questions, multi-dept, 20–30 roles',
        'Group: 5,000+ questions, whole org, 50+ roles',
        'Quarterly refresh: 50–500 new + retire by tier',
        'Per-client watermarking + forensic attribution',
      ],
      cta: { label: 'Book a discovery call', href: '/contact' as const },
      featured: false,
    },
  ],

  // SOURCE: 05-SKU §3.5 — JD-Forge unit economics
  roi: {
    eyebrow: 'JD-Forge ROI',
    title: 'Stop spending TA hours configuring assessments.',
    body: 'A typical TA team spends ~30 minutes per JD configuring its assessment. JD-Forge does it in 30 seconds. Math:',
    inputs: [
      { label: 'JDs you upload per month', placeholder: '200' },
      { label: 'Avg minutes saved per JD', placeholder: '30' },
      { label: 'Loaded TA cost per hour ($)', placeholder: '40' },
    ],
  },

  faq: {
    title: 'Pricing FAQ',
    items: [
      {
        q: 'Why are prices ranges, not single SKUs?',
        a: 'Each tier is calibrated to your hiring volume, anti-leak SLA, and refresh cadence. We publish anchors so you can size internally. Final pricing comes after a 30-minute scoping call.',
      },
      {
        q: 'Do you offer pilot pricing?',
        a: 'Yes. Three-month pilots at 30% off the smallest tier of any SKU, capped at one renewal cycle.',
      },
      {
        q: 'India pricing vs USD pricing?',
        a: "Both lists are valid. INR for India-billed customers, USD for international. We don't arbitrage — the headline rate is comparable at the prevailing FX.",
      },
      {
        q: 'What happens if a question I bought leaks?',
        a: 'For ReadyBank: covered by anti-leak SLA — affected questions are auto-rotated and replaced. For Stack-Vault: forensic attribution identifies origin; contractual remedies apply.',
      },
      {
        q: 'Annual vs monthly?',
        a: 'Annual billing has a 15% discount for ReadyBank Recruiter and JD-Forge subscriptions. Stack-Vault is annual-only by design.',
      },
    ],
  },
} as const;
