// Solutions copy — ICP-specific landings.
// SOURCE: 04-Blueprint §3.3, governance/Investor-Brief §3.

export type SolutionCopy = {
  slug: 'platforms' | 'enterprises' | 'staffing';
  hero: { eyebrow: string; title: string; sub: string };
  pains: { title: string; body: string }[];
  why: { title: string; body: string }[];
  proof: string;
  primarySku: { name: string; href: string };
  primaryCta: { label: string; href: string };
};

export const platformsCopy: SolutionCopy = {
  slug: 'platforms',
  hero: {
    eyebrow: 'For assessment platforms',
    title: 'Stop spending $1.2M/yr on a content team that ships 1,800 questions.',
    sub: 'License the QOrium ReadyBank API. Get instant access to a calibrated, anti-leak-rotated library across 1,000+ skills. Pay per call. Scale infinitely.',
  },
  pains: [
    {
      title: 'Your content team is a cost center, not a moat.',
      body: "Authoring at $9–$25 per validated question doesn't scale. Your customers churn over content freshness, not product features.",
    },
    {
      title: 'Every question you ship gets indexed in 90 days.',
      body: 'Glassdoor, LeetCode, GeeksforGeeks. By the time a candidate cohort hits the test, half the bank is on Reddit.',
    },
    {
      title: 'India-stack and AI-era formats are uncovered.',
      body: 'SAP ABAP, Oracle Banking, Embedded automotive, Salesforce Lightning. None of the global incumbents fluently cover these.',
    },
  ],
  why: [
    {
      title: 'Drop-in API + 20 import formats',
      body: '/v1/questions/search · /v1/packs/generate · CSV / JSON / HackerRank YAML / Mettl XLSX exporters. SDK in Node/Python/Java/Go.',
    },
    {
      title: 'Anti-leak SLA tiered to your spend',
      body: 'Starter: monthly scan + quarterly rotation. Enterprise: continuous + real-time rotation. Webhooks fire when a question retires.',
    },
    {
      title: '90%+ gross margin at scale',
      body: 'Cost to author + validate one question: ~$9. Effective cost per question delivered after the first 100 deliveries: <$0.10. Your content P&L flips from loss to margin.',
    },
  ],
  proof:
    "Our 530-question seed library is calibrated against IRT, scanned weekly, and indexed in our role-graph. We're integrating with our first three platform partners now.",
  primarySku: { name: 'ReadyBank', href: '/features/readybank' },
  primaryCta: { label: 'See ReadyBank', href: '/features/readybank' },
};

export const enterprisesCopy: SolutionCopy = {
  slug: 'enterprises',
  hero: {
    eyebrow: 'For enterprises & GCCs',
    title: 'Your candidates have already seen the Mettl + HackerEarth banks.',
    sub: 'Buy a Stack-Vault aligned to YOUR tech stack. 2,000+ questions, watermarked per candidate, contractually exclusive, refreshed quarterly. Reuse infinitely across all your assessments.',
  },
  pains: [
    {
      title: 'Public banks are public.',
      body: "Every Senior Salesforce question on Mettl is on the prep blogs by Friday. Your screen rate is high; your interview-pass rate isn't — because candidates memorized the test.",
    },
    {
      title: "Your in-house TA team can't author 2,000 questions across your stack.",
      body: "They're hiring 100 people a week. Even if they had time, they don't have the IRT calibration data, the role-graph, or the anti-leak operations.",
    },
    {
      title: 'Generic banks miss your domain entirely.',
      body: 'Your stack is Salesforce + Oracle Banking + custom risk engines. Or SAP ABAP + Hybris + S/4HANA. No off-the-shelf platform covers it depth-wise.',
    },
  ],
  why: [
    {
      title: 'Your library, contractually yours',
      body: "No question in your Stack-Vault appears in ReadyBank, in any JD-Forge output, or in any other customer's vault. Watermarking enables forensic attribution if anything leaks.",
    },
    {
      title: 'Authored to your role-graph',
      body: '90-day discovery: your role list, tech stack, domain quirks. Custom role-graph mapping. 2,000+ questions across 20-30 roles in 8-12 weeks.',
    },
    {
      title: 'Quarterly refresh by tier',
      body: 'Department: 50 new + 25 retired. Enterprise: 200 new + 100 retired. Group: 500 new + 200 retired. Continuous anti-leak monitoring add-on available.',
    },
  ],
  proof:
    'Our first GCC discovery call (Bosch Bengaluru) is queued. We expect 5 Stack-Vault logos in Y1 at an average ₹70L per logo.',
  primarySku: { name: 'Stack-Vault', href: '/features/stack-vault' },
  primaryCta: { label: 'See Stack-Vault', href: '/features/stack-vault' },
};

export const staffingCopy: SolutionCopy = {
  slug: 'staffing',
  hero: {
    eyebrow: 'For staffing firms',
    title: 'Same Mettl questions every recruiter uses are leaked.',
    sub: 'Subscribe to ReadyBank. Get fresh-rotated questions across the roles you source — across the formats your end-clients accept. ₹4,999–₹49,999/month. Or generate per-JD packs on demand with JD-Forge.',
  },
  pains: [
    {
      title: 'Your end-client uses a leaked bank.',
      body: 'You source candidates who score 95% on screen. They flunk the technical interview. The hiring manager calls you. The relationship erodes.',
    },
    {
      title: 'Every drive needs a different assessment.',
      body: 'You pivot between BFSI, e-commerce, GCC, IT services. Configuring 50 assessments a week is unsustainable.',
    },
    {
      title: "You don't have an engineering team.",
      body: "You can't integrate APIs. You need exports that paste into HackerRank / Mettl in under a minute.",
    },
  ],
  why: [
    {
      title: 'Talpro India is Customer Zero.',
      body: "We dogfood every SKU on our own staffing business. If a feature isn't good enough for us, it isn't shipped to you.",
    },
    {
      title: 'Subscriptions priced for staffing economics',
      body: 'Solo: ₹4,999/mo · 200 questions · 5 roles. Team: ₹14,999/mo · 1,000 questions · 20 roles. Agency: ₹49,999/mo · 5,000 questions · unlimited roles.',
    },
    {
      title: 'JD-Forge for ad-hoc drives',
      body: "Per-JD pricing: $49–$499. Or $499/mo for 25 JDs. Drop a JD, get a 20-question pack in 30 seconds, paste into your client's preferred platform.",
    },
  ],
  proof:
    'Talpro India runs 50+ candidate screens per week. Customer Zero validates the SKU before any external customer touches it.',
  primarySku: { name: 'ReadyBank', href: '/features/readybank' },
  primaryCta: { label: 'See ReadyBank', href: '/features/readybank' },
};

export const solutionsIndex = {
  platforms: platformsCopy,
  enterprises: enterprisesCopy,
  staffing: staffingCopy,
} as const;
