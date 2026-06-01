// QOrium Changelog — typed content
// Append-only. Every entry grounds in a specific commit, doc ratification, or
// operational milestone. No fabrication; no aspirational entries.
//
// SOURCES:
// - Branch git log on claude/qorium-marketing-site-Z4gdI (commits b24e588 → ef29ebe → dc20c1c → 7c4337f)
// - 04-Blueprint v1 milestones (M0/M1/M3/M12 trajectory)
// - 09-Constitution v2.0 ratification (5 new SOs SO-21..SO-25)
// - 08-Bali Sales Playbook v1 + bali/ ops bundle (commit 7c4337f)
// - customer-zero/ Wave 1 + Wave 2 SME extension files
// - infra/marketing-deploy.sh §1-10 + §9b (qorium.in redirect)

export interface ChangelogEntry {
  date: string; // ISO date (YYYY-MM-DD)
  category: 'site' | 'platform' | 'governance' | 'content' | 'sales';
  title: string;
  body: string;
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    date: '2026-05-06',
    category: 'sales',
    title: 'Bali operating ops bundle',
    body: 'Shipped the Bali Sales Office operating folder: canonical competitive_research_log.md (10+ Constitution refs), 3 outreach scripts (Platform API, Enterprise Stack-Vault, Recruiter), 4 templates (pipeline tracker, weekly forecast, win-loss debrief, monthly business review), and SO-25 quarterly competitive scan template. 1,206 lines across 8 files, all grounded in Constitution v2.0.',
  },
  {
    date: '2026-05-05',
    category: 'governance',
    title: 'Bali Sales Playbook v1.0',
    body: 'Phase 2 deliverable shipped: 16-section playbook covering mission/authority, three motions (Platform API / Enterprise Stack-Vault / Recruiter), pricing discipline (SO-11 + SO-23), commercial templates, Customer Zero pattern (SO-1), 8 objection scripts, AI Agent + human hybrid (SO-18), operating cadence, pipeline & forecasting, competitive watch (SO-25), Y1 targets (66 logos / ₹3.5 Cr ARR).',
  },
  {
    date: '2026-05-05',
    category: 'site',
    title: 'Marketing quality gates automated',
    body: 'Lighthouse CI + axe-core a11y added to GitHub Actions on every PR touching apps/marketing. Customer Zero (Talpro India) detail section grounded in Constitution SO-1 added to /customers. PRE-LAUNCH-CHECKLIST consolidates all open items across 6 blocks.',
  },
  {
    date: '2026-05-04',
    category: 'site',
    title: 'qorium.in 301 redirect live',
    body: "qorium.in 301-redirects to qorium.online with its own Let's Encrypt cert and dedicated nginx vhost (deploy script §9b). HSTS preload header survives the redirect. SEO consolidates on qorium.online as the canonical domain.",
  },
  {
    date: '2026-05-04',
    category: 'site',
    title: 'Marketing site live on VPS 1',
    body: "Site deployed to VPS 1 (KVM4) via PM2 + nginx + Let's Encrypt. 26 routes returning 200. All security headers present (HSTS, CSP, X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy). Idempotent infra/marketing-deploy.sh script with §1-10 sections.",
  },
  {
    date: '2026-05-03',
    category: 'site',
    title: 'MagicUI Agent-style redesign',
    body: 'Light-default theme with electric-blue secondary (oklch 54.65% 0.246 262.87). Four animated bento cells (ReadyBank streaming JSON, JD-Forge timer, Anti-Leak rotation, Stack-Vault watermark mesh). Cobe globe lazy-loaded on home. OrbitingCircles + FlickeringGrid + Marquee + NumberTicker + AnimatedBeam + BorderBeam vocabulary throughout.',
  },
  {
    date: '2026-05-02',
    category: 'governance',
    title: 'Constitution v2.0 ratification',
    body: '5 new Standing Orders ratified: SO-21 IRT mandate, SO-22 AI plagiarism public benchmark, SO-23 $5K-25K API pricing anchor, SO-24 recursive No-Fiction Rule, SO-25 quarterly competitive scan + acquisition trigger. New §10.3 Competitive Watch section. Article VII auto-fail criteria expanded. Phase Gate milestones (Article IX) updated with verified content metrics.',
  },
  {
    date: '2026-05-02',
    category: 'content',
    title: 'Wave 2 SME extensions shipped',
    body: 'Embedded Automotive (021-040), Finacle/Flexcube (021-040), Oracle HCM Cloud (021-040), SAP ABAP (021-050), Salesforce CPQ (021-040 + 041-060). Cumulative content engine output: 530 validated questions across general tech, India-stack, and AI-era assessment formats.',
  },
  {
    date: '2026-04-30',
    category: 'content',
    title: '530 validated questions milestone',
    body: '10.6% of M3 5,000-question target reached. Validated against IRT calibration on the Reference Panel + I/O psychologist sign-off per Constitution Article VII auto-fail criteria. Customer Zero (Talpro India) is the internal dogfood motion; public outcome volumes remain evidence-gated.',
  },
  {
    date: '2026-04-29',
    category: 'platform',
    title: 'ReadyBank /v1/packs + bulk export',
    body: 'Express API service shipped. Endpoints: /v1/questions/{uuid}, /v1/questions/search, /v1/packs/generate, bulk export in CSV / JSON / HackerRank-YAML formats. Rate-limited via @qorium/auth API keys. PR #7 merged.',
  },
  {
    date: '2026-04-15',
    category: 'content',
    title: 'Wave 1 100-question seed batch',
    body: 'Customer Zero kickoff per Constitution SO-1. First 100 questions validated and released to Talpro India internal hiring drives. Wave 1 + Wave 2 onboarded 18 SMEs (per Blueprint §3.1).',
  },
];
