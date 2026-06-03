import type { ReactNode } from "react";
import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  Boxes,
  CheckCircle2,
  FileText,
  KeyRound,
  Layers3,
  LockKeyhole,
  Menu,
  Network,
  ShieldCheck,
  Sparkles,
  Workflow,
  type LucideIcon
} from "lucide-react";
import {
  additionalStaticPages,
  baseUrl,
  competitors,
  corePages,
  getPageData,
  titleize,
  type MarketingPageData
} from "./data";

const evidenceFlags = {
  caseStudies: false,
  customerStories: false,
  benchmarks: false
};

type MegaItem = {
  label: string;
  href: string;
  body: string;
  icon: LucideIcon;
  gatedFlag?: keyof typeof evidenceFlags;
};

type MegaGroup = {
  label: string;
  href: string;
  columns: Array<{
    title: string;
    items: MegaItem[];
  }>;
  promo: {
    title: string;
    body: string;
    href: string;
    cta: string;
    icon: LucideIcon;
  };
};

const navGroups: MegaGroup[] = [
  {
    label: "Platform",
    href: "/platform",
    columns: [
      {
        title: "Products",
        items: [
          { label: "ReadyBank", href: "/platform/readybank", body: "Calibrated skill-wise library", icon: BookOpenCheck },
          { label: "JD-Forge", href: "/platform/jd-forge", body: "Paste a JD, get a structured assessment", icon: Workflow },
          { label: "Stack-Vault", href: "/platform/stack-vault", body: "Private, watermarked enterprise banks", icon: LockKeyhole }
        ]
      },
      {
        title: "The Engine",
        items: [
          { label: "Anti-Leak Rotation", href: "/anti-leak", body: "Scan, retire, regenerate, revalidate", icon: ShieldCheck },
          { label: "IRT Calibration", href: "/science", body: "Difficulty buyers can defend", icon: BarChart3 },
          { label: "Role-Graph", href: "/method", body: "Role x skill x difficulty taxonomy", icon: Network }
        ]
      },
      {
        title: "Delivery",
        items: [
          { label: "REST API", href: "/product/api", body: "Programmatic content access", icon: Layers3 },
          { label: "Bulk Export", href: "/resources/docs", body: "CSV and JSON delivery paths", icon: FileText },
          { label: "Embedded Widget", href: "/try/jd-forge", body: "Drop-in assessment workflow", icon: Boxes }
        ]
      }
    ],
    promo: {
      title: "The Assessment Library",
      body: "Browse seeded skill pages with calibration posture and guarded previews.",
      href: "/product/assessment-library",
      cta: "See it live",
      icon: BookOpenCheck
    }
  },
  {
    label: "Solutions",
    href: "/solutions/enterprises-gcc",
    columns: [
      {
        title: "By buyer",
        items: [
          { label: "Assessment Platforms", href: "/solutions/assessment-platforms", body: "License content via API", icon: Layers3 },
          { label: "Enterprises and GCCs", href: "/solutions/enterprises-gcc", body: "Exclusive Stack-Vault depth", icon: ShieldCheck },
          { label: "IT Staffing Firms", href: "/solutions/staffing-firms", body: "ReadyBank plus JD-Forge subscriptions", icon: Workflow }
        ]
      },
      {
        title: "By role hired",
        items: [
          { label: "Software Engineering", href: "/solutions/role/react-developer", body: "Coding, debugging, architecture", icon: Boxes },
          { label: "Data, ML, Analytics", href: "/solutions/role/data-engineer", body: "Practical data work evidence", icon: BarChart3 },
          { label: "DevOps and Cloud", href: "/solutions/role/devops-engineer", body: "SRE, infra, cloud judgement", icon: Network }
        ]
      },
      {
        title: "India stack edge",
        items: [
          { label: "SAP ABAP", href: "/solutions/stack/sap-abap", body: "Enterprise implementation depth", icon: Sparkles },
          { label: "Oracle HCM", href: "/solutions/stack/oracle", body: "Cloud and EBS role coverage", icon: Sparkles },
          { label: "BFSI Systems", href: "/solutions/stack/bfsi", body: "Core banking and regulated workflows", icon: LockKeyhole }
        ]
      }
    ],
    promo: {
      title: "Talpro is Customer Zero",
      body: "Internal dogfooding keeps the product grounded before external claims scale.",
      href: "/customer/talpro-india",
      cta: "Read the story",
      icon: ShieldCheck
    }
  },
  {
    label: "Why QOrium",
    href: "/method",
    columns: [
      {
        title: "The Method",
        items: [
          { label: "The QOrium Method", href: "/method", body: "Author, validate, rotate", icon: Workflow },
          { label: "Assessment Science", href: "/science", body: "IRT, validity, bias posture", icon: BarChart3 },
          { label: "Anti-Leak Explained", href: "/anti-leak", body: "Why banks decay and how we respond", icon: ShieldCheck }
        ]
      },
      {
        title: "Trust and compliance",
        items: [
          { label: "Trust Center", href: "/trust", body: "Security posture and proof boundaries", icon: LockKeyhole },
          { label: "DPDP Handling", href: "/compliance-dpdp", body: "India-first data handling", icon: FileText },
          { label: "Responsible AI", href: "/responsible-ai", body: "Shipped, beta, roadmap states", icon: Sparkles }
        ]
      },
      {
        title: "Compare",
        items: [
          { label: "vs Vervoe", href: "/vs/vervoe", body: "Real-work assessment framing", icon: Network },
          { label: "vs HackerRank", href: "/vs/hackerrank", body: "Technical screening authority", icon: Network },
          { label: "vs Mercer Mettl", href: "/vs/mercer-mettl", body: "India enterprise comparison", icon: Network }
        ]
      }
    ],
    promo: {
      title: "We show our work.",
      body: "The evidence-gating manifesto: no logo, stat, or badge renders without proof.",
      href: "/trust",
      cta: "Open the proof model",
      icon: CheckCircle2
    }
  },
  {
    label: "Resources",
    href: "/resources",
    columns: [
      {
        title: "Learn",
        items: [
          { label: "Guides and Playbooks", href: "/resources/guides", body: "Buyer education", icon: BookOpenCheck },
          { label: "Blog and Research", href: "/blog", body: "Market POV", icon: FileText },
          { label: "Skills Glossary", href: "/library/javascript", body: "Taxonomy-backed library entry", icon: Layers3 }
        ]
      },
      {
        title: "Proof",
        items: [
          { label: "Sample Packs", href: "/resources/sample-packs", body: "Controlled previews", icon: Sparkles },
          { label: "Case Studies", href: "/customers", body: "Hidden until evidence lands", icon: ShieldCheck, gatedFlag: "caseStudies" },
          { label: "Benchmarks", href: "/research/plagiarism-benchmark", body: "Hidden until verified", icon: BarChart3, gatedFlag: "benchmarks" }
        ]
      },
      {
        title: "Build",
        items: [
          { label: "API Documentation", href: "/resources/docs", body: "Implementation notes", icon: FileText },
          { label: "Changelog", href: "/changelog", body: "What shipped", icon: CheckCircle2 },
          { label: "Job Descriptions", href: "/resources/job-descriptions", body: "Role to test routes", icon: Workflow }
        ]
      }
    ],
    promo: {
      title: "Sample Pack",
      body: "Download a controlled question-pack preview without exposing the full bank.",
      href: "/resources/sample-packs",
      cta: "Request a pack",
      icon: Sparkles
    }
  }
];

function visibleMegaItems(items: MegaItem[]) {
  return items.filter((item) => !item.gatedFlag || evidenceFlags[item.gatedFlag]);
}

const stats = [
  ["1,000+", "skills covered", "technical, cloud, data, BFSI, and enterprise"],
  ["3", "ways to buy", "ReadyBank, JD-Forge, Stack-Vault"],
  ["Daily", "used by Talpro India", "our Customer Zero, every working day"],
  ["0", "unproven claims", "we publish only what we can measure"]
];

const competitorSignals = [
  ["Fresh on demand", "AI-authored, human-validated items — never a stale bank"],
  ["Validated, not just written", "Every item carries a measured difficulty"],
  ["Retires before it leaks", "Anti-leak rotation pre-empts the prep market"],
  ["Tests your real stack", "SAP, Oracle, ABAP, Finacle, and BFSI depth"],
  ["Every leak traces back", "Per-candidate watermarking on every item served"],
  ["Built to plug in", "License calibrated content through one API"]
];

export function MarketingPage({ path = "/" }: { path?: string }) {
  const page = getPageData(path) ?? corePages[0]!;

  return (
    <div className="site-shell">
      <Header />
      <main id="main">
        {page.kind === "home" ? <HomePage page={page} /> : <DetailPage page={page} />}
      </main>
      <Footer />
    </div>
  );
}

function Header() {
  return (
    <header className="site-header">
      <a className="brand-lockup" href="/" aria-label="QOrium home">
        <span className="brand-mark" aria-hidden="true">
          <Network size={18} />
        </span>
        <span>QOrium</span>
      </a>
      <nav className="desktop-nav" aria-label="Primary navigation">
        {navGroups.map((group) => (
          <div className="nav-cluster" key={group.label}>
            <a href={group.href} aria-haspopup="true">
              {group.label}
            </a>
            <div className="mega-panel" role="group" aria-label={`${group.label} menu`}>
              <div className="mega-inner">
                <div className="mega-columns">
                  {group.columns.map((column) => (
                    <div className="mega-column" key={column.title}>
                      <p>{column.title}</p>
                      {visibleMegaItems(column.items).map((item) => (
                        <a className="mega-link" href={item.href} key={item.href}>
                          <item.icon size={18} />
                          <span>
                            <strong>{item.label}</strong>
                            <small>{item.body}</small>
                          </span>
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
                <a className="mega-promo" href={group.promo.href}>
                  <group.promo.icon size={22} />
                  <span>Featured</span>
                  <strong>{group.promo.title}</strong>
                  <small>{group.promo.body}</small>
                  <em>
                    {group.promo.cta}
                    <ArrowRight size={15} />
                  </em>
                </a>
              </div>
            </div>
          </div>
        ))}
        <a href="/pricing">Pricing</a>
      </nav>
      <div className="header-actions">
        <a className="primary-button" href="/demo">
          Book demo
          <ArrowRight size={16} />
        </a>
        <a className="ghost-button" href="/signin">
          <KeyRound size={16} />
          Sign in
        </a>
        <details className="mobile-menu">
          <summary aria-label="Open menu">
            <Menu size={20} />
          </summary>
          <div className="mobile-menu-panel">
            {navGroups.map((group) => (
              <details className="mobile-nav-group" key={group.label}>
                <summary>{group.label}</summary>
                {group.columns.map((column) => (
                  <div className="mobile-nav-column" key={column.title}>
                    <p>{column.title}</p>
                    {visibleMegaItems(column.items).map((item) => (
                      <a href={item.href} key={item.href}>
                        {item.label}
                      </a>
                    ))}
                  </div>
                ))}
                <a className="mobile-promo-link" href={group.promo.href}>
                  {group.promo.title}
                </a>
              </details>
            ))}
            <a href="/pricing">Pricing</a>
            <a href="/demo">Book demo</a>
            <a href="/signin">Sign in</a>
          </div>
        </details>
      </div>
    </header>
  );
}

function HomePage({ page }: { page: MarketingPageData }) {
  return (
    <>
      <Hero page={page} />
      <StatsBand />
      <section className="section light-section">
        <SectionIntro
          kicker="Explore QOrium"
          title="Everything you need to hire on proof, in one place."
          body="Browse the products and engine, find your path by team and stack, dig into the calibrated library, or check the trust and science behind every score."
        />
        <div className="sitemap-grid">
          {[
            ["Platform", "Products", "/platform", "ReadyBank, JD-Forge, Stack-Vault and the engine"],
            ["Solutions", "By team", "/solutions/enterprises-gcc", "Staffing, enterprises and GCCs, platforms"],
            ["Library", "Browse", "/library/javascript", "Calibrated tests by skill and role"],
            ["Resources", "Guides", "/resources", "Guides, job descriptions, sample packs, docs"],
            ["Trust", "Proof", "/trust", "Security, DPDP, responsible AI, science"],
            ["Compare", "Decide", "/vs/vervoe", "How QOrium compares, fairly"]
          ].map(([title, count, href, body]) => (
            <a className="sitemap-card" href={href} key={title}>
              <span>{count}</span>
              <strong>{title}</strong>
              <p>{body}</p>
            </a>
          ))}
        </div>
      </section>
      <section className="section product-section">
        <div className="split">
          <SectionIntro
            kicker="See it work"
            title="Paste a job description. Watch the test build itself."
            body="JD-Forge turns role text into a calibrated assessment — skills, difficulty bands, and a rubric — in minutes, so you can screen on the work instead of the résumé."
          />
          <ProductConsole />
        </div>
      </section>
      <section className="section light-section">
        <SectionIntro
          kicker="Why QOrium"
          title="What you get that no one else gives you."
          body="Most tools give you a test. QOrium gives you a score you can defend: fresh, calibrated questions that retire before they leak, built for the stack you actually run."
        />
        <div className="competitor-grid">
          {competitorSignals.map(([name, signal]) => (
            <article className="competitor-card" key={name}>
              <strong>{name}</strong>
              <p>{signal}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="section dark-section">
        <SectionIntro
          kicker="How it holds up"
          title="A score you can stand behind in any hiring review."
          body="Every result is calibrated for difficulty, watermarked to the candidate, explainable to a hiring manager, and backed by an audit trail — defensible in a review or a tribunal."
          inverted
        />
        <GapGrid />
      </section>
      <CTA />
    </>
  );
}

function Hero({ page }: { page: MarketingPageData }) {
  return (
    <section className="hero">
      <div className="hero-copy">
        <p className="eyebrow">{page.kicker}</p>
        <h1>{page.title}</h1>
        <p className="hero-summary">{page.summary}</p>
        <div className="cta-row">
          <a className="primary-button large" href="/demo">
            {page.primaryCta}
            <ArrowRight size={18} />
          </a>
          <a className="secondary-button large" href="/product/assessment-library">
            {page.secondaryCta}
            <BookOpenCheck size={18} />
          </a>
        </div>
        <div className="proof-row">
          {page.proof.map((item) => (
            <span key={item}>
              <CheckCircle2 size={16} />
              {item}
            </span>
          ))}
        </div>
      </div>
      <div className="hero-visual" aria-label="QOrium product evidence visual">
        <img src="/assets/qorium-home-current.png" alt="QOrium product marketing website preview" />
        <div className="ledger-panel">
          <span>Evidence ledger</span>
          <strong>Every score traces back to a measured item</strong>
          <div className="ledger-bars">
            <i />
            <i />
            <i />
          </div>
        </div>
      </div>
    </section>
  );
}

function DetailPage({ page }: { page: MarketingPageData }) {
  return (
    <>
      <section className={`detail-hero ${page.kind}`}>
        <div>
          <p className="eyebrow">{page.kicker}</p>
          <h1>{page.title}</h1>
          <p>{page.summary}</p>
          <div className="cta-row">
            <a className="primary-button large" href="/demo">
              {page.primaryCta}
              <ArrowRight size={18} />
            </a>
            <a className="secondary-button large" href={secondaryHref(page.kind)}>
              {page.secondaryCta}
              <Sparkles size={18} />
            </a>
          </div>
        </div>
        <EvidencePanel page={page} />
      </section>
      <section className="section light-section">
        <div className="page-grid">
          {page.sections.map((section) => (
            <article className="narrative-panel" key={section.title}>
              <p className="eyebrow">{page.kind}</p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>
                    <CheckCircle2 size={17} />
                    {point}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>
      <RouteSpecificSection page={page} />
      <CTA />
    </>
  );
}

function RouteSpecificSection({ page }: { page: MarketingPageData }) {
  if (page.kind === "library" || page.kind === "skill") {
    return (
      <section className="section product-section">
        <SectionIntro
          kicker="Assessment preview"
          title={`${titleize(page.path.split("/").pop() ?? "skill")} coverage map`}
          body="Each library route is structured to sell with enough specificity to earn trust while protecting the full question bank from public harvesting."
        />
        <div className="matrix">
          {["Scenario practice", "Debugging signal", "Architecture judgement", "Communication evidence"].map((item) => (
            <div key={item}>
              <BarChart3 size={22} />
              <strong>{item}</strong>
              <p>Mapped to item type, seniority, rubric language, and evidence quality.</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (page.kind === "compare") {
    return (
      <section className="section product-section">
        <SectionIntro
          kicker="A fair comparison"
          title="Where QOrium is genuinely different."
          body="We won't smear the market. Here's where QOrium gives you something the alternatives don't: private depth for your stack, questions that retire before they leak, and scores you can defend."
        />
        <div className="comparison-table" role="table" aria-label="QOrium comparison framework">
          {[
            ["Private stack depth", "A library for SAP, Oracle, BFSI — not just generic coding"],
            ["Anti-leak lifecycle", "Questions rotate out before the prep market catches up"],
            ["Defensible scoring", "Every score has measured difficulty and an audit trail"],
            ["India-built trust", "DPDP compliance and data that stays in India"]
          ].map(([row, edge]) => (
            <div role="row" key={row}>
              <span role="cell">{row}</span>
              <strong role="cell">{edge}</strong>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="section product-section">
      <div className="split reverse">
        <ProductConsole compact />
        <SectionIntro
          kicker="Your next step"
          title="See how this works on your roles."
          body="Book a 20-minute walkthrough, browse the calibrated library, or request a sample pack — whichever helps you decide faster."
        />
      </div>
    </section>
  );
}

function EvidencePanel({ page }: { page: MarketingPageData }) {
  return (
    <aside className="evidence-panel">
      <div className="panel-topline">
        <ShieldCheck size={22} />
        <span>Evidence posture</span>
      </div>
      <ul>
        {page.proof.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <a href="/trust">
        Open trust center
        <ArrowRight size={16} />
      </a>
    </aside>
  );
}

function ProductConsole({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`product-console ${compact ? "compact" : ""}`}>
      <div className="console-header">
        <span>JD-Forge / ReadyBank / Stack-Vault</span>
        <small>Live proof model</small>
      </div>
      <div className="console-body">
        <div className="console-column">
          <strong>Role input</strong>
          <p>Senior SAP ABAP consultant for BFSI migration program.</p>
          <span>Skills extracted: 12</span>
        </div>
        <div className="console-column highlighted">
          <strong>Assessment blueprint</strong>
          <p>Debugging, architecture, compliance, workflow design.</p>
          <span>Leak risk: controlled by rotation</span>
        </div>
        <div className="console-column">
          <strong>Evidence output</strong>
          <p>Rubric notes, item lineage, candidate proof, buyer-ready report.</p>
          <span>Status: explainable</span>
        </div>
      </div>
    </div>
  );
}

function StatsBand() {
  return (
    <section className="stats-band" aria-label="QOrium sitemap and proof metrics">
      {stats.map(([value, label, note]) => (
        <div key={label}>
          <strong>{value}</strong>
          <span>{label}</span>
          <small>{note}</small>
        </div>
      ))}
    </section>
  );
}

function GapGrid() {
  const gaps = [
    ["Fresh", "Questions authored and validated, never stale"],
    ["Calibrated", "Measured difficulty on every item"],
    ["Leak-resistant", "Rotation retires questions before they spread"],
    ["Watermarked", "Every item traces back to the candidate"],
    ["Explainable", "A score a hiring manager can read"],
    ["Audit-ready", "Evidence that holds up in a review"]
  ];

  return (
    <div className="gap-grid">
      {gaps.map(([label, body]) => (
        <article key={label}>
          <span>{label}</span>
          <p>{body}</p>
        </article>
      ))}
    </div>
  );
}

function SectionIntro({
  kicker,
  title,
  body,
  inverted = false
}: {
  kicker: string;
  title: string;
  body: string;
  inverted?: boolean;
}) {
  return (
    <div className={`section-intro ${inverted ? "inverted" : ""}`}>
      <p className="eyebrow">{kicker}</p>
      <h2>{title}</h2>
      <p>{body}</p>
    </div>
  );
}

function CTA() {
  return (
    <section className="final-cta">
      <div>
        <p className="eyebrow">Founder-led walkthrough</p>
        <h2>See how QOrium maps your hiring volume to a defensible assessment system.</h2>
      </div>
      <div className="cta-row">
        <a className="primary-button large" href="/demo">
          Book demo
          <ArrowRight size={18} />
        </a>
        <a className="secondary-button large" href="/pricing">
          See pricing logic
          <FileText size={18} />
        </a>
      </div>
    </section>
  );
}

function Footer() {
  const footerGroups: Array<[string, Array<[string, string]>]> = [
    ["Platform", [["ReadyBank", "/platform/readybank"], ["JD-Forge", "/platform/jd-forge"], ["Stack-Vault", "/platform/stack-vault"], ["API", "/product/api"]]],
    ["Solutions", [["Platforms", "/solutions/assessment-platforms"], ["Enterprises", "/solutions/enterprises-gcc"], ["Staffing", "/solutions/staffing-firms"], ["Pricing", "/pricing"]]],
    ["Trust", [["Trust center", "/trust"], ["Security", "/security"], ["DPDP", "/compliance-dpdp"], ["Responsible AI", "/responsible-ai"]]],
    ["Resources", [["Guides", "/resources/guides"], ["Sample packs", "/resources/sample-packs"], ["Job descriptions", "/resources/job-descriptions"], ["LLM info", "/llm-info"]]]
  ];

  return (
    <footer className="site-footer">
      <div>
        <a className="brand-lockup" href="/">
          <span className="brand-mark" aria-hidden="true">
            <Network size={18} />
          </span>
          <span>QOrium</span>
        </a>
        <p>India-built assessment content infrastructure for hiring teams that need defensible skill evidence.</p>
      </div>
      {footerGroups.map(([title, links]) => (
        <div key={title}>
          <strong>{title}</strong>
          {links.map(([label, href]) => (
            <a href={href} key={href}>
              {label}
            </a>
          ))}
        </div>
      ))}
    </footer>
  );
}

function secondaryHref(kind: MarketingPageData["kind"]) {
  if (kind === "trust") return "/method";
  if (kind === "resource" || kind === "guide" || kind === "blog") return "/resources/sample-packs";
  if (kind === "compare") return "/vs/vervoe";
  if (kind === "pricing") return "/product/assessment-library";
  return "/product/assessment-library";
}

export function generateMarketingMetadata(path: string) {
  const page = getPageData(path);
  const title = page ? `${page.title} | QOrium` : "QOrium";
  const description = page?.summary ?? "QOrium is an enterprise skills assessment content platform.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}${path === "/" ? "" : path}`,
      siteName: "QOrium",
      type: "website"
    },
    twitter: {
      card: "summary_large_image",
      title,
      description
    }
  };
}

export function StructuredData({ path }: { path: string }) {
  const page = getPageData(path);
  const data = {
    "@context": "https://schema.org",
    "@type": page?.kind === "blog" ? "Article" : "WebPage",
    name: page?.title ?? "QOrium",
    description: page?.summary ?? "QOrium enterprise skills assessment platform",
    url: `${baseUrl}${path === "/" ? "" : path}`
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}

export function IconRail() {
  const icons: Array<[ReactNode, string]> = [
    [<Layers3 key="layers" />, "Library"],
    [<Workflow key="workflow" />, "Workflow"],
    [<LockKeyhole key="lock" />, "Trust"],
    [<Boxes key="boxes" />, "Vault"]
  ];

  return (
    <div className="icon-rail" aria-hidden="true">
      {icons.map(([icon, label]) => (
        <span key={label}>
          {icon}
          {label}
        </span>
      ))}
    </div>
  );
}

export const knownMarketingPages = [...corePages, ...additionalStaticPages, ...competitors];
