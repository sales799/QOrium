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
  Workflow
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

const navGroups = [
  {
    label: "Platform",
    href: "/platform",
    items: [
      ["ReadyBank", "/platform/readybank", "Calibrated skill libraries"],
      ["JD-Forge", "/platform/jd-forge", "JD to assessment workflow"],
      ["Stack-Vault", "/platform/stack-vault", "Private enterprise banks"],
      ["API", "/product/api", "Delivery and licensing"]
    ]
  },
  {
    label: "Solutions",
    href: "/solutions/enterprises-gcc",
    items: [
      ["Assessment platforms", "/solutions/assessment-platforms", "License content faster"],
      ["Enterprises and GCCs", "/solutions/enterprises-gcc", "Private stack depth"],
      ["Staffing firms", "/solutions/staffing-firms", "Client-ready shortlist proof"],
      ["Stacks", "/solutions/stack/sap-abap", "India-heavy role coverage"]
    ]
  },
  {
    label: "Why QOrium",
    href: "/method",
    items: [
      ["Method", "/method", "Author, validate, rotate"],
      ["Science", "/science", "IRT and validity"],
      ["Anti-leak", "/anti-leak", "Question-bank lifecycle"],
      ["Trust", "/trust", "Security and compliance"]
    ]
  },
  {
    label: "Resources",
    href: "/resources",
    items: [
      ["Guides", "/resources/guides", "Buyer education"],
      ["Sample packs", "/resources/sample-packs", "Controlled previews"],
      ["Job descriptions", "/resources/job-descriptions", "Role to test routes"],
      ["Blog", "/blog", "Market POV"]
    ]
  }
];

const stats = [
  ["1,193", "generated public routes", "from the current route inventory"],
  ["1,000", "library pages", "skill plus scenario SEO coverage"],
  ["3", "product SKUs", "ReadyBank, JD-Forge, Stack-Vault"],
  ["0", "unsupported claims", "proof slots stay gated"]
];

const competitorSignals = [
  ["Vervoe", "Strong explainable AI and real-work assessment storytelling"],
  ["TestGorilla", "Broad library, pricing clarity, and high-scale skills-test SEO"],
  ["HackerRank", "Enterprise technical-screening authority and AI feature depth"],
  ["CodeSignal", "Certified assessments, validated scoring, and research-led trust"],
  ["iMocha", "Skills intelligence framing beyond point-in-time tests"],
  ["Mercer Mettl", "India enterprise reach, proctoring, and large assessment operations"]
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
            <a href={group.href}>{group.label}</a>
            <div className="mega-panel">
              {group.items.map(([label, href, body]) => (
                <a className="mega-link" href={href} key={href}>
                  <span>{label}</span>
                  <small>{body}</small>
                </a>
              ))}
            </div>
          </div>
        ))}
        <a href="/pricing">Pricing</a>
      </nav>
      <div className="header-actions">
        <a className="ghost-button" href="/signin">
          <KeyRound size={16} />
          Sign in
        </a>
        <a className="primary-button" href="/demo">
          Book demo
          <ArrowRight size={16} />
        </a>
        <details className="mobile-menu">
          <summary aria-label="Open menu">
            <Menu size={20} />
          </summary>
          <div>
            {navGroups.flatMap((group) => group.items).map(([label, href]) => (
              <a href={href} key={href}>
                {label}
              </a>
            ))}
            <a href="/pricing">Pricing</a>
            <a href="/demo">Book demo</a>
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
          kicker="Sitemap created from the live site"
          title="The rebuild covers the complete public website surface."
          body="The live sitemap is now represented as a route system: core enterprise pages, product and solution pages, trust pages, resources, comparison pages, skills, roles, stacks, and the 1,000-page assessment library."
        />
        <div className="sitemap-grid">
          {[
            ["Platform", "4 pages", "/platform", "Products and engine"],
            ["Solutions", "63 pages", "/solutions/enterprises-gcc", "Buyer, role, and stack routing"],
            ["Library", "1,000 pages", "/library/javascript", "Skill plus scenario routes"],
            ["Resources", "44 pages", "/resources", "Guides, jobs, sample packs, docs"],
            ["Trust", "8 pages", "/trust", "Security, DPDP, AI, science"],
            ["Compare", "15 pages", "/vs/vervoe", "Competitor and migration pages"]
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
            kicker="Product marketing spine"
            title="A buyer can now understand QOrium in one pass."
            body="The page journey moves from leak risk to product proof to enterprise trust, then routes each buyer to the right product, resource, or demo path."
          />
          <ProductConsole />
        </div>
      </section>
      <section className="section light-section">
        <SectionIntro
          kicker="Competitor and global benchmark audit"
          title="The gap is no longer information. The gap is proof architecture."
          body="Vervoe shows capability, TestGorilla shows breadth, HackerRank and CodeSignal show enterprise credibility, iMocha reframes the market as skills intelligence, and Mettl owns India enterprise familiarity. QOrium's strongest lane is defensible content infrastructure."
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
          kicker="Gap analysis"
          title="From MVP website to enterprise product marketing system."
          body="The redesign closes six buyer-facing gaps: navigation depth, moat clarity, product demonstration, buyer segmentation, trust center readiness, and programmatic SEO."
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
          <strong>Claim status: gated until proof exists</strong>
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
          kicker="Comparison framework"
          title="Fair competitor pages sell QOrium without smearing the market."
          body="Each comparison route names the competitor strength, then shows where QOrium differs: India-stack depth, private vaults, anti-leak lifecycle, and evidence-gated trust."
        />
        <div className="comparison-table" role="table" aria-label="QOrium comparison framework">
          {["Library breadth", "Private stack depth", "Anti-leak lifecycle", "Evidence-gated trust"].map((row) => (
            <div role="row" key={row}>
              <span role="cell">{row}</span>
              <strong role="cell">QOrium position: explicit and buyer-facing</strong>
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
          kicker="Connected buyer journey"
          title="Every page now has a next step and a proof path."
          body="The route links the buyer to product proof, trust documentation, sample material, or a walkthrough instead of ending in generic brochure copy."
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
    ["IA", "Mega-menu plus sitemap families"],
    ["Moat", "Anti-leak, IRT, role graph, Stack-Vault"],
    ["Proof", "Product console and sample-pack routing"],
    ["Trust", "Security, DPDP, science, responsible AI"],
    ["SEO", "Skills, library, jobs, roles, stacks"],
    ["Conversion", "Demo, sample, API, pricing paths"]
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
