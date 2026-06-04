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
  proof: string[];
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

const routePageFactory = (
  path: string,
  kind: MarketingRouteKind,
  title: string,
  summary: string,
  kicker = "QOrium route"
): MarketingPageData => ({
  path,
  kind,
  kicker,
  title,
  summary,
  primaryCta: "Book a demo",
  secondaryCta: "Browse the library",
  proof: ["Calibrated, leak-resistant questions", "Mapped to the role you hire", "Explainable, audit-ready scores"],
  sections: [
    {
      title: "Hire on proof, not guesswork",
      body:
        "Test candidates on the skills the job actually needs, with questions that stay fresh and a score a hiring manager can trust — instead of a résumé and a hunch.",
      points: ["The skills the job needs", "Questions that don't leak", "A score you can act on"]
    },
    {
      title: "A score you can stand behind",
      body:
        "Every result is calibrated for difficulty, watermarked to the candidate, and backed by an audit trail — so the decision holds up in a hiring review or a tribunal.",
      points: ["Measured difficulty", "Watermarked items", "Audit-ready evidence"]
    }
  ]
});

export const additionalStaticPages: MarketingPageData[] = [
  routePageFactory("/blog", "blog", "QOrium blog.", "Opinionated writing on skills evidence, assessment science, anti-leak operations, and enterprise hiring trust.", "Blog"),
  routePageFactory("/features/readybank", "feature", "ReadyBank features for fast assessment launch.", "Coverage, preview control, calibration posture, and reusable pack logic for teams that need immediate assessment signal.", "ReadyBank features"),
  routePageFactory("/features/jd-forge", "feature", "JD-Forge features for role-mapped assessment design.", "Convert role requirements into skill coverage, item mix, rubrics, and recruiter-ready test blueprints.", "JD-Forge features"),
  routePageFactory("/features/stack-vault", "feature", "Stack-Vault features for private enterprise banks.", "Customer-exclusive item banks, watermark-ready governance, and stack-specific depth for regulated hiring teams.", "Stack-Vault features"),
  routePageFactory("/solutions/assessment-platforms", "solution", "Expand your assessment platform without rebuilding the content team.", "License governed skill content, taxonomy metadata, and stack-specific item families through QOrium delivery routes.", "For assessment platforms"),
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
  "salesforce-cpq-consultant",
  "react-developer-2",
  "java-developer-2",
  "python-developer-2",
  "devops-engineer-2",
  "data-engineer-2",
  "salesforce-developer-2",
  "sap-abap-consultant-2",
  "oracle-hcm-consultant-2",
  "embedded-engineer-2",
  "core-banking-consultant-2",
  "cloud-engineer-2",
  "ai-engineer-2",
  "salesforce-cpq-consultant-2",
  "react-developer-3",
  "java-developer-3",
  "python-developer-3",
  "devops-engineer-3"
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

export const compareRoutes = [
  "qorium-vs-vervoe",
  "qorium-vs-coderbyte",
  "qorium-vs-hackerrank",
  "qorium-vs-mercer-mettl",
  "qorium-vs-imocha"
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
    ...competitors.map(([slug]) => `/vs/${slug}`),
    ...compareRoutes.map((slug) => `/compare/${slug}`)
  ];
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
    const competitor = titleize(compare.replace("qorium-vs-", ""));
    return routePageFactory(normalizedPath, "compare", `QOrium vs ${competitor}`, `A migration-aware comparison page for buyers evaluating QOrium and ${competitor}.`, "Comparison");
  }

  return null;
}
