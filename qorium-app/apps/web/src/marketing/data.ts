export type MarketingRouteKind =
  | "home"
  | "platform"
  | "product"
  | "feature"
  | "solution"
  | "trust"
  | "resource"
  | "pricing"
  | "company"
  | "try"
  | "legal"
  | "blog"
  | "guide"
  | "samplePack"
  | "skill"
  | "library"
  | "job"
  | "role"
  | "stack"
  | "compare";

export type MarketingPageData = {
  path: string;
  kind: MarketingRouteKind;
  kicker: string;
  title: string;
  summary: string;
  primaryCta?: string;
  secondaryCta?: string;
  primaryHref?: string;
  secondaryHref?: string;
  canonicalPath?: string;
  auditStatus?: "complete" | "thin-template" | "canonicalize" | "redirect" | "evidence-blocked" | "needs-visual-QA";
  schemaType?: "WebPage" | "Article" | "Product" | "FAQPage";
  proof: string[];
  workflow?: {
    kicker: string;
    title: string;
    body: string;
    steps: Array<{
      label: string;
      title: string;
      body: string;
    }>;
  };
  battery?: Array<{
    name: string;
    category: string;
    href: string;
    note: string;
  }>;
  comparisonRows?: Array<[string, string]>;
  relatedLinks?: Array<{
    label: string;
    href: string;
    body: string;
  }>;
  evidenceRules?: string[];
  sections: Array<{
    title: string;
    body: string;
    points: string[];
  }>;
};

export const baseUrl = "https://qorium.online";

export const corePages: MarketingPageData[] = [
  {
    path: "/",
    kind: "home",
    kicker: "Enterprise skills assessment infrastructure",
    title: "Skills assessments you can defend in an audit.",
    summary:
      "QOrium gives hiring teams an India-built assessment content system: calibrated skill libraries, JD-specific test generation, private stack vaults, and trust evidence that makes every score explainable.",
    primaryCta: "Book a 20-min walkthrough",
    secondaryCta: "Explore the assessment library",
    proof: [
      "Calibrated tests across technical, cloud, data, BFSI, and enterprise skills",
      "Anti-leak rotation retires questions before they spread",
      "Dogfooded every day by Talpro India, our Customer Zero"
    ],
    sections: [
      {
        title: "Your question bank is rotting. You just can't see it yet.",
        body:
          "Tests leak. Within months, the prep market has your questions and scores drift up while real skill stays flat. QOrium retires questions before they spread, measures the difficulty of every item, and ties each score back to the role you are hiring for.",
        points: ["Questions retire before they leak", "Every score carries measured difficulty", "Every item is watermarked to the candidate"]
      },
      {
        title: "Three teams. Three paths. One defensible engine.",
        body:
          "Assessment platforms license calibrated content through one API. Enterprises and GCCs build a private, watermarked library for their exact stack. Staffing firms turn a client JD into a shortlist the client actually trusts. Same engine, the proof each buyer needs.",
        points: ["Platforms: license content via API", "Enterprises and GCCs: a private Stack-Vault", "Staffing: ReadyBank plus JD-Forge"]
      },
      {
        title: "We only publish what we can prove.",
        body:
          "You will never see a logo we don't have or a number we didn't measure. When the evidence lands, it shows up here — so the score you act on is one you can stand behind in a hiring review or a tribunal.",
        points: ["No unproven claims", "Every score is explainable", "Defensible in an audit"]
      }
    ]
  },
  {
    path: "/platform",
    kind: "platform",
    kicker: "Platform overview",
    title: "One calibrated engine. Three ways to buy.",
    summary:
      "From the first item to an explainable score, every step is built so the hiring decision you make holds up later: fresh questions, measured difficulty, anti-leak rotation, and delivery that fits how you work.",
    primaryCta: "Book a demo",
    secondaryCta: "See pricing",
    proof: ["ReadyBank for breadth", "JD-Forge for speed", "Stack-Vault for your private stack"],
    sections: [
      {
        title: "Questions you can trust, kept fresh.",
        body:
          "Your tests stay calibrated and leak-resistant instead of going stale. Each item is authored, measured for difficulty, mapped to the role, and rotated out before it can spread.",
        points: ["Mapped to the role you hire", "Measured difficulty per item", "Rotated before it leaks"]
      },
      {
        title: "Use the score the way you work.",
        body:
          "Browse the library, export packs, turn a JD into a test, or license content through one API — whatever fits your team's volume and maturity.",
        points: ["Browse and run in-app", "Export to CSV or JSON", "License through the API"]
      }
    ]
  },
  {
    path: "/platform/readybank",
    kind: "platform",
    kicker: "ReadyBank",
    title: "A calibrated assessment library for teams that need signal now.",
    summary:
      "ReadyBank packages skill-wise question packs with explicit difficulty, format, and calibration posture so hiring teams can launch faster without starting from a blank test.",
    primaryCta: "Browse library",
    secondaryCta: "Request sample pack",
    proof: ["Calibrated coverage across 1,000+ skills", "India-heavy stacks: SAP, Oracle, BFSI", "Sample packs for priority roles"],
    sections: [
      {
        title: "Coverage you can launch with today.",
        body:
          "ReadyBank spans mainstream and India-heavy stacks, so you can start screening for the role in front of you without building a test from scratch.",
        points: ["Programming", "Cloud and data", "BFSI and enterprise stacks"]
      },
      {
        title: "Preview the quality before you commit.",
        body:
          "See sample questions and calibration on every skill so you know what you are getting — without exposing enough for candidates to harvest the bank.",
        points: ["Public sample questions", "Calibration shown", "Request a full sample pack"]
      }
    ]
  },
  {
    path: "/platform/jd-forge",
    kind: "platform",
    kicker: "JD-Forge",
    title: "Paste a job description. Get a hiring assessment that matches the work.",
    summary:
      "JD-Forge turns role requirements into a structured assessment blueprint, mapped to skills, difficulty bands, evidence formats, and evaluation rubrics.",
    primaryCta: "Try JD-Forge",
    secondaryCta: "See product method",
    proof: ["JD-to-skill mapping", "Rubric-first generation", "Role pages wired to JD routes"],
    sections: [
      {
        title: "From job text to test architecture.",
        body:
          "The workflow makes the hidden assessment design process visible: skills extracted, seniority calibrated, item mix proposed, and rubric language prepared for hiring managers.",
        points: ["Role extraction", "Skill coverage map", "Rubric blocks"]
      },
      {
        title: "Staffing and mid-market friendly.",
        body:
          "A recruiter can turn a client JD into a cleaner screening artifact before a shortlist is sent, which makes QOrium more than a library subscription.",
        points: ["Client-ready signal", "Reusable templates", "Fast demo hook"]
      }
    ]
  },
  {
    path: "/platform/stack-vault",
    kind: "platform",
    kicker: "Stack-Vault",
    title: "Private assessment libraries for confidential enterprise stacks.",
    summary:
      "Stack-Vault gives GCCs and regulated teams customer-exclusive item banks for roles where public tests are too shallow, too leaked, or too generic.",
    primaryCta: "Scope a Stack-Vault",
    secondaryCta: "View enterprise solutions",
    proof: ["Private customer library positioning", "Watermark-ready architecture", "India-heavy stack routes"],
    sections: [
      {
        title: "When the stack is the moat, the bank must be private.",
        body:
          "SAP ABAP, Oracle HCM, Finacle, Flexcube, embedded automotive, mainframe, and BFSI roles need depth that commodity coding tests rarely support.",
        points: ["Exclusive item lineage", "Domain SME review", "Stack-specific scoring"]
      },
      {
        title: "Built for regulated hiring.",
        body:
          "Score candidates on your real stack with data that stays in India, items watermarked to each person, and an audit trail your security and compliance teams can sign off on.",
        points: ["India data residency (DPDP)", "Watermarked to every candidate", "Audit-ready evidence"]
      }
    ]
  },
  {
    path: "/platform/api",
    kind: "platform",
    kicker: "API delivery",
    title: "License calibrated assessment content through one API.",
    summary:
      "Give assessment platforms and enterprise workflow owners governed content access without forcing a full front-end migration.",
    primaryCta: "Discuss API access",
    secondaryCta: "Read docs",
    primaryHref: "/demo",
    secondaryHref: "/resources/docs",
    canonicalPath: "/platform/api",
    auditStatus: "complete",
    schemaType: "Product",
    proof: ["REST delivery path", "Governed content metadata", "Platform buyer workflow"],
    workflow: {
      kicker: "API workflow",
      title: "Keep your experience. Add defensible content.",
      body:
        "The API path is built for teams that already own the candidate experience and need fresher, governed assessment content behind it.",
      steps: [
        { label: "AUTH", title: "Control access", body: "API access starts with scoped buyer review and governed delivery." },
        { label: "SYNC", title: "Read content metadata", body: "Skills, role tags, difficulty posture, and version notes travel with the item family." },
        { label: "DELIVER", title: "Serve through your workflow", body: "Use REST, export, embedded widget, or white-label delivery depending on buyer maturity." }
      ]
    },
    sections: [
      {
        title: "Content access without a front-end rewrite.",
        body:
          "You license the assessment engine where you need it: platform UX, internal workflow, export process, or embedded candidate experience.",
        points: ["REST API", "CSV and JSON exports", "Embedded and white-label options"]
      }
    ],
    relatedLinks: [
      { label: "Docs", href: "/resources/docs", body: "Implementation notes and delivery posture." },
      { label: "Assessment platforms", href: "/solutions/assessment-platforms", body: "Buyer workflow for platform teams." },
      { label: "Trust center", href: "/trust", body: "Evidence boundaries and data handling." }
    ]
  },
  {
    path: "/library",
    kind: "library",
    kicker: "Assessment library",
    title: "Browse calibrated assessment coverage without exposing the bank.",
    summary:
      "Start with priority skills, roles, and stack routes, then request controlled samples when you need to inspect the depth.",
    primaryCta: "Request sample pack",
    secondaryCta: "Open skill routes",
    primaryHref: "/resources/sample-packs",
    secondaryHref: "/skill/python",
    canonicalPath: "/library",
    auditStatus: "complete",
    schemaType: "Product",
    proof: ["Controlled previews", "Role and stack cross-links", "No full-bank harvesting"],
    workflow: {
      kicker: "Library hub",
      title: "Browse by skill, then move to evidence.",
      body:
        "The hub gives buyers a clean way to find coverage while keeping the complete assessment bank private.",
      steps: [
        { label: "SKILL", title: "Find the domain", body: "Programming, data, cloud, BFSI, and enterprise stacks stay visible." },
        { label: "ROLE", title: "Connect the job", body: "Each skill points toward role batteries and JD-Forge when the buyer is ready." },
        { label: "SAMPLE", title: "Inspect safely", body: "Controlled packs prove quality without publishing the live bank." }
      ]
    },
    sections: [
      {
        title: "Search visibility with bank protection.",
        body:
          "A buyer can understand coverage, quality, and related routes without turning public SEO pages into answer keys.",
        points: ["Skill coverage", "Scenario coverage", "Controlled sample flow"]
      }
    ],
    relatedLinks: [
      { label: "Python assessment", href: "/skill/python", body: "A flagship skill lander." },
      { label: "Software role", href: "/solutions/role/software", body: "A role battery example." },
      { label: "Sample packs", href: "/resources/sample-packs", body: "Controlled previews." }
    ]
  },
  {
    path: "/product",
    kind: "product",
    kicker: "Product suite",
    title: "Every hiring workflow starts from evidence, not resumes.",
    summary:
      "QOrium's product pages turn the assessment library, API, grading proof, and buyer workflows into a connected product story.",
    primaryCta: "Tour the platform",
    secondaryCta: "Open API page",
    proof: ["Assessment library", "API delivery", "Interactive try routes"],
    sections: [
      {
        title: "Show the work behind the score.",
        body:
          "Product surfaces explain where questions come from, how rubrics are attached, and what evidence a hiring manager receives.",
        points: ["Question preview", "Rubric view", "Audit trail"]
      }
    ]
  },
  {
    path: "/product/assessment-library",
    kind: "product",
    kicker: "Assessment library",
    title: "A searchable library of defensible skill assessments.",
    summary:
      "Browse skill routes, role routes, and stack routes built for hiring teams that need fast coverage without giving up quality control.",
    primaryCta: "Preview priority skills",
    secondaryCta: "Download a sample pack",
    proof: ["25 seed skill pages", "1,000 library long-tail pages", "Role and stack cross-links"],
    sections: [
      {
        title: "Find the right test fast.",
        body:
          "Browse by skill, role, or stack and see calibration up front — covering mainstream technologies and the India-specific stacks most catalogs miss.",
        points: ["Browse by skill", "Calibration shown", "Jump to related roles"]
      }
    ]
  },
  {
    path: "/product/api",
    kind: "product",
    kicker: "API delivery",
    title: "Assessment content that can plug into your platform.",
    summary:
      "QOrium API positioning is built for assessment platforms and enterprise workflow owners who need content access without a complete front-end migration.",
    primaryCta: "Discuss API access",
    secondaryCta: "Read docs",
    proof: ["REST API route", "Export positioning", "Platform buyer page"],
    sections: [
      {
        title: "License content, keep your user experience.",
        body:
          "The API story focuses on the buyer outcome: faster library expansion, governance metadata, skill taxonomy, and controlled content delivery.",
        points: ["Item metadata", "Skill taxonomy", "Versioned exports"]
      }
    ]
  },
  {
    path: "/features",
    kind: "feature",
    kicker: "Feature map",
    title: "Everything works together to give you a score you can defend.",
    summary:
      "ReadyBank, JD-Forge, Stack-Vault, anti-leak rotation, the role-graph, and trust pages work as one system — so you get a fresh, calibrated, explainable assessment, not a pile of features.",
    primaryCta: "Book a demo",
    secondaryCta: "See pricing",
    proof: ["Fresh, calibrated questions", "Mapped to the role", "Explainable, audit-ready scores"],
    sections: [
      {
        title: "Each capability solves a real hiring pain.",
        body:
          "Speed when you need a test today, depth for the stack you actually run, protection against leaked questions, and an audit trail when a decision is challenged.",
        points: ["Speed", "Depth", "Auditability"]
      }
    ]
  },
  {
    path: "/pricing",
    kind: "pricing",
    kicker: "Pricing",
    title: "Start free. Pay for the trust layer when you're ready.",
    summary:
      "Begin on a free Customer-Zero plan, grow into ReadyBank and JD-Forge as your volume grows, and scope a private Stack-Vault or API license when you need it.",
    primaryCta: "Start free",
    secondaryCta: "Book a demo",
    proof: ["Free Customer-Zero plan", "Transparent, INR-native tiers", "Custom enterprise scoping"],
    sections: [
      {
        title: "A plan for every stage of hiring.",
        body:
          "Start free to try it on a real role, move to Growth and Scale as your hiring volume grows, and talk to us for a private Stack-Vault, SSO, and India data residency on Enterprise.",
        points: ["Customer-Zero", "Growth", "Scale", "Enterprise"]
      }
    ]
  }
];

const titleOverrides: Record<string, string> = {
  ai: "AI",
  api: "API",
  aws: "AWS",
  bfsi: "BFSI",
  cpq: "CPQ",
  css: "CSS",
  dpdp: "DPDP",
  hcm: "HCM",
  html: "HTML",
  javascript: "JavaScript",
  js: "JS",
  reactjs: "React.js",
  sap: "SAP",
  sql: "SQL",
  typescript: "TypeScript",
  ux: "UX"
};

const routePageFactory = (
  path: string,
  kind: MarketingRouteKind,
  title: string,
  summary: string,
  kicker = "QOrium route"
): MarketingPageData => createMarketingPage({ path, kind, title, summary, kicker });

function createMarketingPage(input: Pick<MarketingPageData, "path" | "kind" | "title" | "summary" | "kicker">): MarketingPageData {
  const label = titleize(input.path.split("/").pop() ?? "qorium");
  const base: MarketingPageData = {
    ...input,
    canonicalPath: input.path,
    auditStatus: "complete",
    schemaType: input.kind === "blog" || input.kind === "guide" ? "Article" : input.kind === "product" || input.kind === "platform" ? "Product" : "WebPage",
    primaryCta: "Book a demo",
    secondaryCta: "Browse library",
    primaryHref: "/demo",
    secondaryHref: "/library",
    proof: ["Calibrated, leak-resistant questions", "Mapped to the role you hire", "Explainable, audit-ready scores"],
    evidenceRules: ["No unearned logos", "No unsupported metrics", "No certification badge without source evidence"],
    sections: [
      {
        title: "Hire on proof, not guesswork",
        body:
          "You test the work the role actually needs, with questions that stay fresh and a score a hiring manager can read without a psychometric translator.",
        points: ["Role-fit evidence", "Fresh item lifecycle", "Readable score rationale"]
      },
      {
        title: "A score you can stand behind",
        body:
          "Every result carries difficulty posture, candidate-level traceability, and source notes, so a hiring review starts from evidence instead of opinion.",
        points: ["Measured difficulty", "Candidate traceability", "Review-ready notes"]
      }
    ],
    workflow: {
      kicker: "Evidence workflow",
      title: "From requirement to defensible score.",
      body: "Every page follows the same operating model: define the work, build the evidence, protect the bank, and give the buyer one clear next step.",
      steps: [
        { label: "01", title: "Map the work", body: "Role, stack, seniority, and outcome are translated into the skills that matter." },
        { label: "02", title: "Build the evidence", body: "Items, rubrics, and sample outputs show what the candidate can actually do." },
        { label: "03", title: "Keep it defensible", body: "Calibration, anti-leak rotation, and trust notes keep the decision explainable." }
      ]
    },
    relatedLinks: [
      { label: "Trust center", href: "/trust", body: "Security, DPDP, responsible AI, and evidence boundaries." },
      { label: "Assessment library", href: "/library", body: "Browse calibrated skills and controlled previews." },
      { label: "Book demo", href: "/demo", body: "Map your hiring workflow to QOrium." }
    ]
  };

  if (input.kind === "role") return rolePage(input.path, label);
  if (input.kind === "stack") return stackPage(input.path, label);
  if (input.kind === "library" || input.kind === "skill") return libraryPage(input, label);
  if (input.kind === "job") return jobPage(input.path, label);
  if (input.kind === "samplePack") return samplePackPage(input.path, label);
  if (input.kind === "compare") return comparePage(input, label);
  if (input.kind === "blog" || input.kind === "guide" || input.kind === "resource") return resourcePage(base, label);
  if (input.kind === "trust" || input.kind === "legal") return trustPage(base);
  return base;
}

function rolePage(path: string, role: string): MarketingPageData {
  const coreRole = role.replace(/\s[23]$/, "");
  return {
    path,
    kind: "role",
    kicker: "Role solution",
    title: `${coreRole} hiring, with evidence your client can trust.`,
    summary: `Build a ${coreRole} assessment path that covers hands-on skill, seniority judgement, stack context, and score evidence without relying on a stale question bank.`,
    canonicalPath: path.replace(/-\d+$/, ""),
    auditStatus: path.match(/-\d+$/) ? "canonicalize" : "complete",
    schemaType: "WebPage",
    primaryCta: "Build this battery",
    secondaryCta: "See JD-Forge",
    primaryHref: "/try/jd-forge",
    secondaryHref: "/platform/jd-forge",
    proof: ["Role-to-skill map", "Controlled skill previews", "Calibration and leak posture visible"],
    evidenceRules: ["Show seniority bands", "Show related skills", "Do not expose the full bank"],
    battery: roleBattery(coreRole),
    workflow: {
      kicker: "Role workflow",
      title: `Turn a ${coreRole} requirement into a defensible shortlist.`,
      body: "A recruiter or hiring manager can move from job text to evidence-backed candidate review without inventing a test from scratch.",
      steps: [
        { label: "JD", title: "Parse the work", body: "Extract stack, seniority, must-have skills, and client-specific evidence expectations." },
        { label: "PACK", title: "Build the battery", body: "Combine practical tasks, scenario judgement, debugging, and communication evidence." },
        { label: "SCORE", title: "Explain the shortlist", body: "Send a score with rubric notes, difficulty posture, and trust boundaries attached." }
      ]
    },
    sections: [
      {
        title: "The role is more than a keyword.",
        body: `${coreRole} hiring needs a battery that separates syntax memory from practical judgement, debugging, architecture, communication, and stack-specific work.`,
        points: ["Scenario-led tasks", "Seniority-aware difficulty", "Rubric language hiring managers can use"]
      },
      {
        title: "The bank stays useful after the first hiring wave.",
        body:
          "QOrium keeps the route connected to anti-leak rotation, watermarking, and controlled previews so public SEO pages do not become a harvesting path for candidates.",
        points: ["Controlled public samples", "Leak-aware rotation", "Candidate traceability"]
      }
    ],
    relatedLinks: [
      { label: "JD-Forge", href: "/platform/jd-forge", body: "Paste the role and shape a hiring assessment." },
      { label: "Assessment library", href: "/library", body: "Browse adjacent skills and scenarios." },
      { label: "Staffing workflow", href: "/solutions/staffing-firms", body: "Use role batteries for client shortlists." }
    ]
  };
}

function stackPage(path: string, stack: string): MarketingPageData {
  return {
    path,
    kind: "stack",
    kicker: "Stack coverage",
    title: `${stack} assessments for teams that need real stack depth.`,
    summary: `Assess ${stack} work with scenario tasks, private-bank options, watermarking, and proof notes that generic coding tests usually miss.`,
    canonicalPath: path,
    auditStatus: "complete",
    schemaType: "WebPage",
    primaryCta: "Scope stack coverage",
    secondaryCta: "See Stack-Vault",
    primaryHref: "/contact?intent=stack-vault",
    secondaryHref: "/platform/stack-vault",
    proof: ["Private-bank ready", "Stack-specific scenarios", "Watermark and audit posture"],
    battery: stackBattery(stack),
    workflow: {
      kicker: "Stack workflow",
      title: "Protect the knowledge that makes your team different.",
      body: "Commodity tests flatten hard enterprise stacks. QOrium lets you test workflow judgement, platform constraints, and implementation risk.",
      steps: [
        { label: "SCOPE", title: "Name the stack surface", body: "Roles, modules, integrations, and regulated workflows are mapped before authoring." },
        { label: "VAULT", title: "Create private depth", body: "Reusable packs stay exclusive when the stack cannot be tested from a public bank." },
        { label: "TRACE", title: "Watermark delivery", body: "Each served item can be traced to the candidate to reduce leak risk." }
      ]
    },
    sections: [
      {
        title: "Generic tests stop where your stack begins.",
        body: `${stack} hiring depends on workflows, implementation context, migration judgement, and production tradeoffs that public coding screens rarely capture.`,
        points: ["Workflow scenarios", "Implementation judgement", "Private SME review"]
      },
      {
        title: "Built for enterprise security review.",
        body:
          "The stack route connects directly to DPDP handling, responsible AI notes, and trust posture so technical depth does not outrun governance.",
        points: ["DPDP-aligned handling", "Visible trust notes", "No unsupported claims"]
      }
    ],
    relatedLinks: [
      { label: "Stack-Vault", href: "/platform/stack-vault", body: "Private, watermarked banks for enterprise stacks." },
      { label: "Security", href: "/security", body: "Controls, sub-processors, and posture." },
      { label: "Book demo", href: "/demo", body: "Scope your first stack pack." }
    ]
  };
}

function libraryPage(input: Pick<MarketingPageData, "path" | "kind" | "title" | "summary" | "kicker">, skill: string): MarketingPageData {
  return {
    path: input.path,
    kind: input.kind,
    kicker: input.kind === "skill" ? "Skill assessment" : "Assessment library",
    title: input.kind === "skill" ? `${skill} assessment, built for hiring signal.` : `${skill} assessment coverage.`,
    summary: input.kind === "skill" ? `Evaluate ${skill} with controlled samples, calibrated difficulty, scenario coverage, and related role paths.` : `A controlled QOrium library route for ${skill}, connecting scenario practice, calibration posture, and buyer next steps without exposing the full bank.`,
    canonicalPath: input.path,
    auditStatus: "complete",
    schemaType: "Product",
    primaryCta: "Request sample pack",
    secondaryCta: "Browse role paths",
    primaryHref: "/resources/sample-packs",
    secondaryHref: "/solutions/role/software",
    proof: ["Controlled public preview", "Difficulty posture shown", "Related role and stack paths"],
    battery: skillBattery(skill),
    workflow: {
      kicker: "Library template",
      title: "Show enough to earn trust. Hide enough to protect the bank.",
      body: "Each library page turns SEO demand into a buyer journey while keeping the complete item bank private.",
      steps: [
        { label: "PREVIEW", title: "Show the skill surface", body: "Name the scenarios, evidence types, and adjacent roles the buyer should expect." },
        { label: "CALIBRATE", title: "Expose posture, not answers", body: "Difficulty, format, and rubric notes are visible without publishing the full item set." },
        { label: "CONVERT", title: "Route to action", body: "Buyers can request a pack, open JD-Forge, or browse related routes." }
      ]
    },
    sections: [
      {
        title: "A public page should not become a leaked test.",
        body:
          "You see the assessment shape, evidence quality, and use cases, while the full bank remains controlled behind sample-pack and demo flows.",
        points: ["Scenario map", "Guarded samples", "Private full bank"]
      },
      {
        title: "The page connects skill demand to buyer action.",
        body:
          "Every skill route links back to role batteries, stack coverage, sample packs, and the trust center so SEO traffic enters the same enterprise journey.",
        points: ["Role cross-links", "Stack cross-links", "Trust cross-links"]
      }
    ],
    relatedLinks: [
      { label: "Sample packs", href: "/resources/sample-packs", body: "Controlled previews by role and stack." },
      { label: "JD-Forge", href: "/platform/jd-forge", body: "Turn a job description into a test." },
      { label: "Science", href: "/science", body: "IRT, validity, reliability, and bias posture." }
    ]
  };
}

function jobPage(path: string, role: string): MarketingPageData {
  return {
    path,
    kind: "job",
    kicker: "Job description",
    title: `${role} job description, connected to assessment design.`,
    summary: `Use the ${role} role outline as the start of a defensible hiring battery, not as another resume-screening document.`,
    canonicalPath: path,
    auditStatus: "complete",
    schemaType: "Article",
    primaryCta: "Build from this JD",
    secondaryCta: "Browse related skills",
    primaryHref: "/try/jd-forge",
    secondaryHref: "/library",
    proof: ["Responsibilities mapped to skills", "Assessment route attached", "Sample-pack CTA"],
    workflow: {
      kicker: "JD to test",
      title: "A job description should lead to measurable evidence.",
      body: "The template connects responsibilities, skills, interview risk, and assessment design so the hiring team does not stop at a polished JD.",
      steps: [
        { label: "ROLE", title: "Define the work", body: "Responsibilities and must-have skills are made explicit." },
        { label: "TEST", title: "Choose the evidence", body: "Scenarios, rubrics, and difficulty bands become the assessment plan." },
        { label: "SHORTLIST", title: "Review with proof", body: "Candidates are compared on demonstrated capability." }
      ]
    },
    sections: [
      {
        title: "Start with the role. Finish with the score.",
        body: `${role} hiring improves when responsibilities connect directly to assessed skills, scenario tasks, and reviewer notes.`,
        points: ["Responsibility map", "Skill checklist", "Assessment plan"]
      },
      {
        title: "Reusable without becoming generic.",
        body:
          "The route gives recruiters a useful starting point while JD-Forge adapts the final battery to the actual employer, seniority, and stack.",
        points: ["Reusable baseline", "Employer-specific adaptation", "Seniority-aware testing"]
      }
    ],
    relatedLinks: [
      { label: "JD-Forge", href: "/platform/jd-forge", body: "Convert role text to an assessment pack." },
      { label: "Role solutions", href: "/solutions/role/software", body: "Browse role-specific batteries." },
      { label: "Sample packs", href: "/resources/sample-packs", body: "Preview controlled assessment depth." }
    ]
  };
}

function samplePackPage(path: string, pack: string): MarketingPageData {
  return {
    path,
    kind: "samplePack",
    kicker: "Sample pack",
    title: `${pack} sample pack, with the full bank protected.`,
    summary: `Preview the shape and quality of a ${pack} assessment without exposing enough content for candidates to harvest.`,
    canonicalPath: path,
    auditStatus: "complete",
    schemaType: "Product",
    primaryCta: "Request this pack",
    secondaryCta: "See trust center",
    primaryHref: "/demo",
    secondaryHref: "/trust",
    proof: ["Controlled preview", "Rubric notes included", "Full bank remains private"],
    workflow: {
      kicker: "Controlled preview",
      title: "A sample should prove quality without weakening the bank.",
      body: "The buyer sees evidence depth and scoring language while QOrium protects live assessment content.",
      steps: [
        { label: "SHOW", title: "Reveal the format", body: "Question types, rubric style, and scenario range are visible." },
        { label: "HIDE", title: "Protect the bank", body: "Enough detail is withheld to prevent candidate harvesting." },
        { label: "DISCUSS", title: "Map to the buyer", body: "The walkthrough adapts the pack to the buyer's stack and role mix." }
      ]
    },
    sections: [
      {
        title: "Proof without leakage.",
        body:
          "You can review assessment quality, scoring logic, and workflow fit while the production item bank remains governed.",
        points: ["Visible quality", "Private full bank", "Governed delivery"]
      }
    ],
    relatedLinks: [
      { label: "Assessment library", href: "/library", body: "Browse skill coverage." },
      { label: "Anti-leak", href: "/anti-leak", body: "Understand bank protection." },
      { label: "Book demo", href: "/demo", body: "Request the pack." }
    ]
  };
}

function comparePage(input: Pick<MarketingPageData, "path" | "title" | "summary" | "kicker" | "kind">, label: string): MarketingPageData {
  const competitor = label.replace(/^Qorium Vs\s/i, "");
  return {
    path: input.path,
    kind: "compare",
    kicker: "Fair comparison",
    title: `QOrium vs ${competitor}`,
    summary: input.summary,
    canonicalPath: input.path.startsWith("/vs/") ? `/compare/qorium-vs-${input.path.replace("/vs/", "")}` : input.path,
    auditStatus: input.path.startsWith("/vs/") ? "canonicalize" : "complete",
    schemaType: "WebPage",
    primaryCta: "Compare on your workflow",
    secondaryCta: "Open trust center",
    primaryHref: "/demo",
    secondaryHref: "/trust",
    proof: ["Fair competitor summary", "QOrium edge stated plainly", "No market smearing"],
    comparisonRows: [
      ["Private stack depth", "Use QOrium when SAP, Oracle, BFSI, GCC, or internal-stack evidence matters."],
      ["Anti-leak lifecycle", "Use QOrium when a static bank would become prep-market inventory."],
      ["Defensible scoring", "Use QOrium when reviewers need difficulty posture and audit notes."],
      ["India-built trust", "Use QOrium when DPDP handling and India-first buyer diligence matter."]
    ],
    workflow: {
      kicker: "Decision flow",
      title: "Compare the hiring decision, not just the feature list.",
      body: "The useful comparison is whether the score stays fresh, explainable, and safe to defend after the assessment is over.",
      steps: [
        { label: "FIT", title: "Name the buyer workflow", body: "Platform licensing, staffing shortlist, or enterprise stack-vault." },
        { label: "RISK", title: "Check bank decay risk", body: "Static banks lose signal when public prep catches up." },
        { label: "PROOF", title: "Review the evidence layer", body: "Difficulty, watermarking, and trust posture become the deciding layer." }
      ]
    },
    sections: [
      {
        title: `${competitor} can be a strong fit for many teams.`,
        body:
          "QOrium does not win by pretending every competitor is weak. QOrium wins when the buyer needs private stack depth, leak-resistant content, and a score that can survive review.",
        points: ["Fair market framing", "Clear QOrium wedge", "Buyer-specific choice"]
      }
    ],
    relatedLinks: [
      { label: "Trust center", href: "/trust", body: "See the proof boundaries behind public claims." },
      { label: "Stack-Vault", href: "/platform/stack-vault", body: "Private banks for enterprise stacks." },
      { label: "Book demo", href: "/demo", body: "Compare against your real workflow." }
    ]
  };
}

function resourcePage(base: MarketingPageData, label: string): MarketingPageData {
  return {
    ...base,
    primaryCta: base.kind === "resource" ? "Request sample pack" : "Read with a buyer lens",
    secondaryCta: "Open trust center",
    primaryHref: base.kind === "resource" ? "/resources/sample-packs" : "/demo",
    secondaryHref: "/trust",
    proof: ["Buyer education", "Evidence-first framing", "Routes to assessment action"],
    workflow: {
      kicker: "Resource path",
      title: "Education should move the buyer toward evidence.",
      body: `${label} content connects the hiring problem to a concrete assessment, trust, or sample-pack action.`,
      steps: [
        { label: "LEARN", title: "Understand the risk", body: "The resource names the hiring risk in plain language." },
        { label: "CHECK", title: "Review the evidence", body: "The buyer sees what QOrium can prove and what it does not claim." },
        { label: "ACT", title: "Move to a workflow", body: "The route points to sample packs, JD-Forge, trust, or demo." }
      ]
    }
  };
}

function trustPage(base: MarketingPageData): MarketingPageData {
  return {
    ...base,
    secondaryHref: "/method",
    proof: ["Evidence boundaries visible", "DPDP-aware language", "No badge without certificate evidence"],
    workflow: {
      kicker: "Trust shell",
      title: "Start with the reviewer question, then open evidence.",
      body: "Trust pages keep security, privacy, science, and responsible AI claims tied to their source posture.",
      steps: [
        { label: "CLAIM", title: "State the buyer concern", body: "Security, DPDP, AI state, assessment science, or anti-leak posture." },
        { label: "SOURCE", title: "Name the evidence state", body: "Live controls, published reports, or withheld claims are separated clearly." },
        { label: "NEXT", title: "Route diligence", body: "The buyer can open the adjacent trust destination without losing context." }
      ]
    }
  };
}

function roleBattery(role: string) {
  const lower = role.toLowerCase();
  if (lower.includes("software") || lower.includes("react") || lower.includes("developer") || lower.includes("engineer")) {
    return [
      { name: "Python", category: "Programming", href: "/library/python", note: "Debugging, data handling, and production judgement." },
      { name: "Java", category: "Backend", href: "/library/java", note: "Object design, services, and enterprise code review." },
      { name: "React", category: "Frontend", href: "/library/react", note: "Component thinking, state, testing, and accessibility." }
    ];
  }
  if (lower.includes("data")) {
    return [
      { name: "SQL", category: "Data", href: "/library/sql", note: "Query design, debugging, and data modelling." },
      { name: "Python", category: "Analytics", href: "/library/python-data-modeling", note: "Analysis workflows and automation." },
      { name: "Power BI", category: "Reporting", href: "/library/power-bi", note: "Dashboard judgement and stakeholder communication." }
    ];
  }
  return [
    { name: "Role scenarios", category: "Practical work", href: "/library/scenario-practice", note: "Work samples mapped to the role." },
    { name: "Communication evidence", category: "Reviewer clarity", href: "/library/stakeholder-communication", note: "Explain tradeoffs like the job requires." },
    { name: "Quality review", category: "Decision support", href: "/library/quality-review", note: "Review judgement and rubric fit." }
  ];
}

function stackBattery(stack: string) {
  return [
    { name: `${stack} scenario`, category: "Stack depth", href: "/resources/sample-packs", note: "Private workflows and implementation judgement." },
    { name: "Migration risk", category: "Architecture", href: "/library/migration", note: "Tradeoffs, dependencies, and rollout judgement." },
    { name: "Governance", category: "Trust", href: "/compliance-dpdp", note: "Controls and evidence for regulated teams." }
  ];
}

function skillBattery(skill: string) {
  return [
    { name: "Scenario practice", category: skill, href: "/resources/sample-packs", note: "Work-shaped tasks instead of trivia." },
    { name: "Debugging signal", category: "Practical evidence", href: "/library/debugging", note: "Find and explain failures." },
    { name: "Communication evidence", category: "Reviewer clarity", href: "/library/stakeholder-communication", note: "Explain choices to a hiring manager." }
  ];
}

export const additionalStaticPages: MarketingPageData[] = [
  routePageFactory("/blog", "blog", "QOrium blog.", "Opinionated writing on skills evidence, assessment science, anti-leak operations, and enterprise hiring trust.", "Blog"),
  routePageFactory("/features/readybank", "feature", "ReadyBank features for fast assessment launch.", "Coverage, preview control, calibration posture, and reusable pack logic for teams that need immediate assessment signal.", "ReadyBank features"),
  routePageFactory("/features/jd-forge", "feature", "JD-Forge features for role-mapped assessment design.", "Convert role requirements into skill coverage, item mix, rubrics, and recruiter-ready test blueprints.", "JD-Forge features"),
  routePageFactory("/features/stack-vault", "feature", "Stack-Vault features for private enterprise banks.", "Customer-exclusive item banks, watermark-ready governance, and stack-specific depth for regulated hiring teams.", "Stack-Vault features"),
  routePageFactory("/solutions/assessment-platforms", "solution", "Expand your assessment platform without hiring a larger content team.", "License governed skill content, taxonomy metadata, and stack-specific item families through QOrium delivery routes.", "For assessment platforms"),
  routePageFactory("/solutions/enterprises-gcc", "solution", "Private assessment depth for enterprises and GCCs.", "Build defensible Stack-Vaults for India-heavy stacks, confidential roles, and regulated talent programs.", "For enterprises and GCCs"),
  routePageFactory("/solutions/staffing-firms", "solution", "Turn every client JD into a stronger shortlist signal.", "Use ReadyBank and JD-Forge to move staffing conversations from resume forwarding to evidence-backed candidate proof.", "For staffing firms"),
  routePageFactory("/solutions/platforms", "solution", "Assessment platform content licensing.", "A buyer page for platforms that need faster skill coverage, content governance, and API-friendly delivery.", "Solution"),
  routePageFactory("/solutions/enterprises", "solution", "Enterprise assessment governance.", "A buyer page for CHRO, TA, compliance, and GCC stakeholders who need audit-facing skills evidence.", "Solution"),
  routePageFactory("/solutions/staffing", "solution", "Staffing assessment workflows.", "A buyer page for staffing leaders who need client-specific screening packs and cleaner shortlist evidence.", "Solution"),
  routePageFactory("/solutions/by-company-type/enterprise", "solution", "Enterprise skills assessment platform.", "Enterprise buyers get governance, private stack depth, compliance-ready language, and implementation confidence.", "By company type"),
  routePageFactory("/solutions/by-company-type/startup", "solution", "Startup skills assessment workflows.", "Startups need fast signal, low setup cost, and credible evidence before scaling a full talent stack.", "By company type"),
  routePageFactory("/solutions/by-company-type/smb", "solution", "SMB skills assessment workflows.", "SMB teams need practical assessment coverage, simple pricing logic, and a clear path from JD to shortlist.", "By company type"),
  routePageFactory("/solutions/by-use-case/high-volume-hiring", "solution", "High-volume hiring assessment workflows.", "Screen large candidate pools with reusable banks, controlled previews, and evidence that hiring managers can trust.", "By use case"),
  routePageFactory("/solutions/by-use-case/technical-screening", "solution", "Technical screening assessment workflows.", "Evaluate hands-on technical judgement across coding, debugging, architecture, data, cloud, and enterprise stack roles.", "By use case"),
  routePageFactory("/solutions/by-use-case/campus-hiring", "solution", "Campus hiring assessment workflows.", "Create fairer early-career screens with calibrated difficulty, skill breadth, and candidate-friendly evidence.", "By use case"),
  routePageFactory("/solutions/by-use-case/lateral-hiring", "solution", "Lateral hiring assessment workflows.", "Match experienced candidates to role-specific work evidence instead of relying on resume claims or generic tests.", "By use case"),
  routePageFactory("/solutions/by-use-case/internal-mobility", "solution", "Internal mobility skills assessment workflows.", "Use skills evidence to support redeployment, capability mapping, and workforce planning decisions.", "By use case"),
  routePageFactory("/solutions/by-industry/it-services-staffing", "solution", "IT services and staffing assessment workflows.", "Help staffing teams prove candidate capability to clients with stack-specific assessments and shortlist evidence.", "By industry"),
  routePageFactory("/solutions/by-industry/bfsi", "solution", "BFSI assessment workflows.", "Assess regulated BFSI roles with domain depth, audit-facing evidence, and private stack coverage.", "By industry"),
  routePageFactory("/solutions/by-industry/healthcare", "solution", "Healthcare assessment workflows.", "Support healthcare technology and operations hiring with role-specific evidence and responsible data handling.", "By industry"),
  routePageFactory("/solutions/by-industry/retail-and-ecommerce", "solution", "Retail and ecommerce assessment workflows.", "Evaluate engineering, data, marketing, operations, and customer roles for fast-moving retail teams.", "By industry"),
  routePageFactory("/solutions/by-industry/it-product", "solution", "IT product company assessment workflows.", "Assess product engineering, cloud, data, QA, and customer-facing roles with practical work evidence.", "By industry"),
  routePageFactory("/solutions/by-industry/gcc-global-capability-centers", "solution", "GCC assessment workflows.", "Build private assessment depth for India GCCs hiring across enterprise systems, product engineering, cloud, and BFSI stacks.", "By industry"),
  routePageFactory("/resources", "resource", "Resources for evidence-first hiring teams.", "Guides, sample packs, API docs, research, blogs, job descriptions, and buyer education in one organized hub.", "Resources"),
  routePageFactory("/resources/docs", "resource", "QOrium documentation hub.", "API, exports, metadata, security posture, and implementation notes for technical and platform buyers.", "Docs"),
  routePageFactory("/resources/sample-packs", "resource", "Download assessment sample packs by role and stack.", "Controlled samples show depth without exposing the full bank, turning product quality into a lead magnet.", "Sample packs"),
  routePageFactory("/research", "resource", "Research for assessment leaders who need proof before rollout.", "Read the public evidence behind QOrium's anti-leak, plagiarism, calibration, and responsible-AI positions before you commit to a workflow.", "Research"),
  routePageFactory("/research/plagiarism-benchmark", "resource", "Plagiarism benchmark and leak-resilience research.", "A research route for explaining leak detection, item rotation, and why question banks need lifecycle governance.", "Research"),
  routePageFactory("/resources/guides", "resource", "Guides for evaluating skills assessment vendors.", "Buyer-friendly frameworks for skills testing, AI hiring vendors, rubrics, shortlist matrices, and recruitment planning.", "Guides"),
  routePageFactory("/resources/job-descriptions", "resource", "Job description templates connected to assessment design.", "Role pages route readers from responsibilities and skills to JD-Forge and the assessment library.", "Job descriptions"),
  routePageFactory("/try", "try", "Try QOrium on a real hiring workflow.", "Explore the JD-Forge assessment design flow and the graded-answer evidence view without exposing the full question bank.", "Interactive proof"),
  routePageFactory("/try/jd-forge", "try", "Try the JD-Forge assessment design flow.", "A product-proof route that lets buyers understand the journey from JD to structured assessment blueprint.", "Interactive proof"),
  routePageFactory("/try/graded-answer", "try", "See how a graded answer becomes explainable evidence.", "A product-proof route for answer evidence, rubric language, scoring rationale, and audit-ready hiring manager notes.", "Interactive proof"),
  routePageFactory("/llm-info", "resource", "LLM-readable QOrium product brief.", "A plain-language route that helps AI answer engines understand QOrium's platform, products, buyers, and trust boundaries.", "LLM info"),
  routePageFactory("/customers", "company", "Customer proof, rendered only when evidence exists.", "A customer hub that starts honestly with Talpro India as Customer Zero and reserves logo rails for verified proof.", "Customers"),
  routePageFactory("/customer/talpro-india", "company", "Talpro India Customer Zero story.", "How QOrium is used internally before broader proof modules, outcome numbers, and case studies are publicly promoted.", "Customer Zero"),
  routePageFactory("/trust", "trust", "The QOrium trust center.", "Security posture, data handling, responsible AI, DPDP alignment, and evidence-gated public claims in one buyer-ready trust shell.", "Trust center"),
  routePageFactory("/security", "trust", "Security posture for assessment content and candidate evidence.", "Explain platform controls, secure delivery, vulnerability disclosure, and enterprise expectations without overclaiming certifications.", "Security"),
  routePageFactory("/compliance-dpdp", "trust", "DPDP-aligned assessment data handling.", "India-first privacy language for recruiters, platforms, and enterprise legal teams evaluating candidate evidence workflows.", "Compliance"),
  routePageFactory("/responsible-ai", "trust", "Responsible AI with shipped, beta, and roadmap states named clearly.", "Separate live capabilities from experiments so sales, legal, and buyers share the same expectation of the product.", "Responsible AI"),
  routePageFactory("/science", "trust", "Assessment science buyers can understand.", "IRT, item difficulty, validity, bias review, and rubric design explained in enterprise-safe language.", "Assessment science"),
  routePageFactory("/method", "trust", "The QOrium Method.", "The operating model for authoring, validating, rotating, and delivering assessment content.", "Method"),
  routePageFactory("/anti-leak", "trust", "Anti-leak architecture for modern assessment banks.", "Explain why static banks decay and how QOrium positions rotation, watermarking, and lifecycle control.", "Anti-leak"),
  routePageFactory("/authoring", "trust", "Authoring and validation pipeline.", "How AI-assisted creation, SME review, rubric design, and calibration gates become defensible assessment content.", "Authoring"),
  routePageFactory("/about", "company", "About QOrium.", "An India-built assessment content platform from Talpro, focused on defensible skills evidence for global hiring teams.", "Company"),
  routePageFactory("/contact", "company", "Contact QOrium.", "Route platform, enterprise, staffing, compliance, and media inquiries to the right conversation.", "Contact"),
  routePageFactory("/demo", "company", "Book a QOrium walkthrough.", "Qualify the buyer by workflow, volume, stack, and trust requirements before a founder-led demo.", "Demo"),
  routePageFactory("/signin", "company", "Sign in to QOrium.", "A clean route back to the operating product for assessment builders, candidates, and internal users.", "Sign in"),
  routePageFactory("/changelog", "resource", "Product changelog.", "Track shipped marketing, product, trust, and evidence modules as QOrium matures.", "Changelog"),
  routePageFactory("/press-kit", "company", "Press kit.", "Brand positioning, company description, product categories, and approved claims for public communication.", "Press"),
  routePageFactory("/privacy", "legal", "Privacy notice.", "Plain-English privacy positioning for candidate and recruiter data handling.", "Legal"),
  routePageFactory("/terms", "legal", "Terms of service.", "Commercial and product-use terms surfaced as part of enterprise buyer diligence.", "Legal"),
  routePageFactory("/dpa", "legal", "Data processing addendum.", "A diligence route for enterprise and platform buyers evaluating candidate-data workflows.", "Legal")
];

export const blogPosts = [
  ["staffing-firm-roi", "How staffing firms turn assessments into client-visible ROI"],
  ["anti-cheat-beyond-proctoring", "Anti-cheat beyond proctoring: protect the bank, not only the session"],
  ["irt-calibration-explained", "IRT calibration explained for hiring leaders"],
  ["leak-problem", "The leak problem: why static question banks decay"],
  ["role-graph", "Why role graphs beat generic test templates"],
  ["seven-stages", "The seven-stage operating model for defensible assessments"]
] as const;

export const guidePages = [
  ["skills-testing", "The enterprise guide to skills testing"],
  ["how-to-evaluate-ai-hiring-vendors", "How to evaluate AI hiring vendors"],
  ["hiring-rubric-hr-tribunal", "Build a hiring rubric that survives scrutiny"],
  ["skills-gap-analysis-template", "Skills gap analysis template"],
  ["shortlisting-matrix-template", "Shortlisting matrix template"],
  ["recruitment-plan-template", "Recruitment plan template"]
] as const;

export const samplePacks = [
  ["senior-java", "Senior Java"],
  ["senior-react", "Senior React"],
  ["devops-sre", "DevOps and SRE"],
  ["senior-salesforce", "Senior Salesforce"],
  ["senior-aws", "Senior AWS"],
  ["senior-python", "Senior Python"],
  ["senior-sql-data", "Senior SQL and Data"],
  ["ai-prompt-engineering", "AI Prompt Engineering"],
  ["embedded-automotive", "Embedded Automotive"],
  ["sap-abap", "SAP ABAP"],
  ["oracle-hcm-cloud", "Oracle HCM Cloud"],
  ["finacle-flexcube", "Finacle and Flexcube"],
  ["salesforce-cpq", "Salesforce CPQ"]
] as const;

export const skillPages = [
  "javascript",
  "python",
  "java",
  "reactjs",
  "sql",
  "aws",
  "node-js",
  "data-analyst",
  "data-scientist",
  "devops",
  "selenium-testing",
  "manual-qa",
  "b2b-sales",
  "inside-sales",
  "digital-marketing",
  "content-writing",
  "english-proficiency",
  "analytical-ability",
  "personality",
  "product-management",
  "project-management",
  "ms-excel",
  "tableau",
  "power-bi",
  "cyber-security"
];

export const jobDescriptions = [
  "react-developer",
  "python-developer",
  "java-developer",
  "node-js-developer",
  "full-stack-developer",
  "devops-engineer",
  "cloud-engineer",
  "data-analyst",
  "data-scientist",
  "power-bi-developer",
  "qa-automation-engineer",
  "manual-qa-tester",
  "cyber-security-analyst",
  "product-manager",
  "project-manager",
  "b2b-sales-executive",
  "inside-sales-representative",
  "digital-marketing-executive",
  "content-writer",
  "recruiter"
];

export const libraryBaseSkills = [
  "javascript",
  "typescript",
  "python",
  "java",
  "go",
  "csharp",
  "react",
  "nextjs",
  "angular",
  "vue",
  "sql",
  "postgresql",
  "spark",
  "power-bi",
  "tableau",
  "aws",
  "azure",
  "gcp",
  "kubernetes",
  "terraform",
  "salesforce",
  "servicenow",
  "sap-abap",
  "oracle-fusion",
  "finacle-flexcube",
  "tcs-bancs",
  "murex",
  "fix-protocol",
  "cobol",
  "as400",
  "embedded-c",
  "rtos",
  "autosar",
  "qa-automation",
  "playwright",
  "product-analytics",
  "business-analysis",
  "customer-success",
  "technical-writing",
  "b2b-sales",
  "inside-sales",
  "digital-marketing",
  "content-writing",
  "english-proficiency",
  "analytical-ability",
  "personality",
  "product-management",
  "project-management",
  "ms-excel",
  "cyber-security"
];

export const libraryThemes = [
  "",
  "debugging",
  "architecture",
  "security",
  "performance",
  "testing",
  "integration",
  "data-modeling",
  "automation",
  "migration",
  "observability",
  "governance",
  "troubleshooting",
  "configuration",
  "reporting",
  "compliance",
  "workflow-design",
  "quality-review",
  "stakeholder-communication",
  "scenario-practice"
];

export const roleRoutes = [
  "software",
  "react-developer",
  "java-developer",
  "python-developer",
  "devops-engineer",
  "data-engineer",
  "salesforce-developer",
  "sap-abap-consultant",
  "oracle-hcm-consultant",
  "embedded-engineer",
  "core-banking-consultant",
  "cloud-engineer",
  "ai-engineer",
  "salesforce-cpq-consultant"
];

export const stackRoutes = [
  "sap-abap",
  "salesforce",
  "oracle",
  "aws",
  "kubernetes",
  "react",
  "java",
  "python",
  "sql",
  "embedded-automotive",
  "bfsi",
  "ai-era",
  "cloud-native"
];

export const competitors = [
  ["vervoe", "Vervoe", "Role-specific skills assessments and explainable AI grading"],
  ["hackerrank", "HackerRank", "Technical screening, interviews, certified assessments, and AI features"],
  ["mercer-mettl", "Mercer Mettl", "Large enterprise assessment and proctoring platform"],
  ["imocha", "iMocha", "Skills and work intelligence platform"],
  ["codesignal", "CodeSignal", "Certified assessments, technical interviews, and validation research"],
  ["coderbyte", "Coderbyte", "Developer assessments and interview tooling"],
  ["testgorilla", "TestGorilla", "Broad skills test library and AI video interview workflows"],
  ["wecp", "WeCP", "AI-native technical assessment and interview platform"],
  ["adaface", "Adaface", "Conversational skills assessments"],
  ["karat", "Karat", "Technical interview service and platform"],
  ["devskiller", "DevSkiller", "Technical screening and talent intelligence"]
] as const;

export const compareRoutes = competitors.map(([slug]) => `qorium-vs-${slug}`);

export const canonicalRedirects = [
  ["/features", "/platform"],
  ["/features/readybank", "/platform/readybank"],
  ["/features/jd-forge", "/platform/jd-forge"],
  ["/features/stack-vault", "/platform/stack-vault"],
  ["/product", "/platform"],
  ["/product/api", "/platform/api"],
  ["/product/assessment-library", "/library"],
  ...competitors.map(([slug]) => [`/vs/${slug}`, `/compare/qorium-vs-${slug}`] as const),
  ...[
    "react-developer",
    "java-developer",
    "python-developer",
    "devops-engineer",
    "data-engineer",
    "salesforce-developer",
    "sap-abap-consultant",
    "oracle-hcm-consultant",
    "embedded-engineer",
    "core-banking-consultant",
    "cloud-engineer",
    "ai-engineer",
    "salesforce-cpq-consultant"
  ].flatMap((slug) => [
    [`/solutions/role/${slug}-2`, `/solutions/role/${slug}`] as const,
    [`/solutions/role/${slug}-3`, `/solutions/role/${slug}`] as const
  ])
] as const;

const redirectedPaths = new Set<string>(canonicalRedirects.map(([source]) => source));

export function titleize(slug: string) {
  return slug
    .replace(/-\d+$/, "")
    .split("-")
    .filter(Boolean)
    .map((part) => titleOverrides[part] ?? part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function allMarketingPaths() {
  const libraryPaths = libraryBaseSkills.flatMap((skill) =>
    libraryThemes.map((theme) => `/library/${theme ? `${skill}-${theme}` : skill}`)
  );

  return [
    ...corePages.map((page) => page.path),
    ...additionalStaticPages.map((page) => page.path),
    ...blogPosts.map(([slug]) => `/blog/${slug}`),
    ...guidePages.map(([slug]) => `/resources/guides/${slug}`),
    ...samplePacks.map(([slug]) => `/resources/sample-packs/${slug}`),
    ...skillPages.map((slug) => `/skill/${slug}`),
    ...jobDescriptions.map((slug) => `/resources/job-descriptions/${slug}`),
    ...libraryPaths,
    ...roleRoutes.map((slug) => `/solutions/role/${slug}`),
    ...stackRoutes.map((slug) => `/solutions/stack/${slug}`),
    ...compareRoutes.map((slug) => `/compare/${slug}`)
  ].filter((path) => !redirectedPaths.has(path));
}

export function getPageData(path: string): MarketingPageData | null {
  const normalizedPath = path === "" ? "/" : path;
  const fixed = [...corePages, ...additionalStaticPages].find((page) => page.path === normalizedPath);
  if (fixed) return fixed;

  const blog = blogPosts.find(([slug]) => normalizedPath === `/blog/${slug}`);
  if (blog) {
    return routePageFactory(normalizedPath, "blog", blog[1], "A thought-leadership article that turns QOrium's product strategy into buyer education, objection handling, and SEO demand capture.", "Blog");
  }

  const guide = guidePages.find(([slug]) => normalizedPath === `/resources/guides/${slug}`);
  if (guide) {
    return routePageFactory(normalizedPath, "guide", guide[1], "A practical buyer guide that helps talent, platform, and enterprise stakeholders evaluate assessment quality with less guesswork.", "Guide");
  }

  const samplePack = samplePacks.find(([slug]) => normalizedPath === `/resources/sample-packs/${slug}`);
  if (samplePack) {
    return routePageFactory(normalizedPath, "samplePack", `${samplePack[1]} sample assessment pack`, "A controlled preview of QOrium assessment depth for a priority role or stack, designed to convert interested buyers into a walkthrough.", "Sample pack");
  }

  const skill = skillPages.find((slug) => normalizedPath === `/skill/${slug}`);
  if (skill) {
    return routePageFactory(normalizedPath, "skill", `QOrium ${titleize(skill)} assessment`, `A buyer-facing skill assessment page for ${titleize(skill)}, including what to test, sample evidence, related roles, and launch paths.`, "Skill assessment");
  }

  const job = jobDescriptions.find((slug) => normalizedPath === `/resources/job-descriptions/${slug}`);
  if (job) {
    return routePageFactory(normalizedPath, "job", `${titleize(job)} job description and assessment plan`, `A role page that connects responsibilities, skills, and assessment design for ${titleize(job)} hiring.`, "Job description");
  }

  if (normalizedPath.startsWith("/library/")) {
    const slug = normalizedPath.replace("/library/", "");
    return routePageFactory(normalizedPath, "library", `${titleize(slug)} assessment library route`, `A long-tail QOrium library page for ${titleize(slug)}, connecting skill depth, scenario practice, calibration posture, and buyer next steps.`, "Assessment library");
  }

  if (normalizedPath.startsWith("/solutions/role/")) {
    const slug = normalizedPath.replace("/solutions/role/", "");
    return routePageFactory(normalizedPath, "role", `${titleize(slug)} assessment solution`, `A role-specific solution page for hiring ${titleize(slug)} talent with defensible skill evidence.`, "Role solution");
  }

  if (normalizedPath.startsWith("/solutions/stack/")) {
    const slug = normalizedPath.replace("/solutions/stack/", "");
    return routePageFactory(normalizedPath, "stack", `${titleize(slug)} assessment stack coverage`, `A stack-specific solution page for ${titleize(slug)} hiring programs that need deeper content than generic tests.`, "Stack solution");
  }

  const vsCompetitor = competitors.find(([slug]) => normalizedPath === `/vs/${slug}`);
  if (vsCompetitor) {
    return routePageFactory(normalizedPath, "compare", `QOrium vs ${vsCompetitor[1]}`, `A fair comparison page positioning QOrium against ${vsCompetitor[1]}: ${vsCompetitor[2]}.`, "Comparison");
  }

  const compare = compareRoutes.find((slug) => normalizedPath === `/compare/${slug}`);
  if (compare) {
    const competitorSlug = compare.replace("qorium-vs-", "");
    const competitor = competitors.find(([slug]) => slug === competitorSlug);
    const competitorName = competitor?.[1] ?? titleize(competitorSlug);
    const competitorSummary = competitor?.[2] ?? "assessment platform workflows";
    return routePageFactory(normalizedPath, "compare", `QOrium vs ${competitorName}`, `A migration-aware comparison page for buyers evaluating QOrium and ${competitorName}: ${competitorSummary}.`, "Comparison");
  }

  return null;
}
