# Senior Engineer — Content Engine

**Role Level:** Senior (5–8 years production experience)
**Location Preference:** Bengaluru preferred; Remote-India (IST) acceptable
**Employment Type:** Full-time
**Reports to:** CTO (Talpro Universe, shared with QOrium)
**Start Date:** Month 2, 2026

---

## About QOrium

QOrium is the world's first enterprise-grade Question-Bank-as-a-Service for the hiring assessment industry. We don't run assessments — we supply the fresh, validated, anti-leak-rotated questions that power them. Every question passes through a rigorous 7-stage Content Engine (AI authoring → self-critique → SME review → IRT calibration → release → post-deploy monitoring). Our customers are assessment platforms (HackerRank, Mettl, HackerEarth, Adaface), large enterprises and GCCs that need confidential white-label question packs, and IT staffing firms that need fresh content per hiring drive. We're headquartered in India because the world's largest assessment market is here, our validation costs are half the global average, and our network is our distribution from Day 1.

---

## The Opportunity

In the next 12 months, QOrium must ship **5,000+ validated questions** across **20+ programming languages**, operate a **continuous anti-leak rotation engine** that detects and auto-rotates leaked questions within 24 hours, and integrate with **40+ assessment platforms** via REST API and bulk-export formats. The Senior Engineer owns all of this: architecting the Content Engine, building the anti-leak detection pipeline, designing the API surface, and shipping the code that makes it real.

This is not an incremental role. This is architecting the central nervous system of a new product category. The Content Engine is QOrium's moat; how well it's built determines whether we capture market or leave it to competitors.

---

## What You'll Own

- **Content Engine architecture & implementation** — Design and build the 7-stage pipeline (Spec → AI Draft → Self-Critique → SME Review → Calibration → Release → Post-Deploy). Own the orchestration, state machines, error recovery, and idempotency across all stages.

- **ReadyBank Service** — REST API and bulk-export endpoints for the shared question library. <200ms p95 latency for single-question fetch, <2s for pack generation. Multi-format exporters (HackerRank, Mettl, Codility, CSV, JSON, XLSX).

- **Anti-Leak Engine** — Daily web crawl via Serper.dev API. Semantic similarity matching against question library embeddings. Severity classification (low/med/high/critical). Auto-trigger regeneration for critical leaks within 24h SLA. Forensic leak attribution for watermarked Stack-Vault questions.

- **ATS Connector framework** — Design and build the abstraction layer for integrating with Greenhouse, Workday, Ashby, Darwinbox. Not one-off integrations; a reusable pattern so the next integrations are fast.

- **Code execution sandbox** — Self-host and scale Judge0 for safe execution of programming-challenge submissions. Support 20+ languages by Month 3 (Python, JavaScript, Java, Go, Rust, C++, C#, PHP, Ruby, etc.); expand to 40+ by Month 6.

- **Data model & PostgreSQL schema** — Design and evolve the questions table, role-graph taxonomy, customer namespacing, audit logging, and leak-signal tracking. JSONB flexibility for format-specific metadata. Indexes that keep query latency under 200ms.

- **Observability & monitoring** — OpenTelemetry instrumentation on every stage of the pipeline. Grafana dashboards for throughput, latency, quality flags, leak detection rate. Sentry for error tracking and alerting.

---

## Day 30 / Day 90 / Day 180 Success Picture

**Day 30:** GitHub repo live with branch protection and CI gates. PostgreSQL schema migrated and tested on staging. First 100 questions authored via Claude Opus API with structured JSON output. Admin console scaffolding running locally. You've paired with the CTO on the Content Engine architecture and can articulate the 7 stages to any engineer.

**Day 90:** 1,000 Wave 1 questions live and bulk-exported to CSV. ReadyBank API alpha (3 endpoints: /search, /fetch, /pack-generate). SME review workflow in the admin web app. First 5 customers using the system (Talpro India, 2 staffing firms, 1 platform pilot, 1 GCC early engagement). Anti-leak crawl running daily and catching test patterns. Judge0 running 10 programming languages. You've onboarded the first frontend engineer and defined the API contract.

**Day 180:** 5,000+ questions live and IRT-calibrated. API v1 GA with SDKs (Node.js, Python). Watermarking live for Stack-Vault questions (multi-marker forensics working). Anti-leak engine in continuous operation (24-hour rotation cycle on critical leaks). ATS integrations with Greenhouse and Workday (first two of the required four). Code execution sandbox supporting 20+ languages. 20+ customer logos live. $300K+ ARR run-rate. You're mentoring the Frontend Engineer and have handed off the Content Operations Manager to manage the SME contractor network.

---

## Must-Have Qualifications

- **5–8 years building production systems** in Node.js/Express or equivalent (Go, Python async, Rust). Comfortable shipping code that scales to thousands of requests/minute.

- **SQL + relational database design.** PostgreSQL specifically preferred. You've designed schemas that avoid N+1 queries, used JSONB for semi-structured data, and optimized indexes for sub-100ms queries. You understand ACID, transactions, and how to migrate schemas safely.

- **TypeScript end-to-end.** You write zero-error TypeScript (no `any` without justification). Type-safe database queries. Type-safe API contracts. You embrace strictness as a force multiplier, not a burden.

- **API design (REST)** — You've designed rate limiting, pagination, error handling (RFC 7807), authentication (API keys, OAuth2 concepts). You understand SDKs and can write an OpenAPI 3.1 spec that auto-generates client libraries.

- **AI API integration (Claude / GPT)** — You've shipped features that call large language models, handled token budgeting, structured output parsing (JSON schemas), retries, and fallback models. You understand cost tracking and know when to cache vs regenerate.

- **Background job queues** (BullMQ, Celery, or equivalent). Async pipeline stages need reliable job processing, retries, and deadletter handling. You've debugged jobs that failed silently.

- **Third-party service integration** (Serper.dev, Judge0, Anthropic API, AWS S3). You've handled rate limits, API versioning, and service degradation gracefully.

---

## Nice-to-Have Qualifications

- **React / Next.js for admin dashboards.** You don't need to be a frontend specialist, but familiarity with shadcn/ui and Tailwind helps you unblock the frontend team quickly.

- **Psychometric assessment domain knowledge** (Item Response Theory, question design, test validity). You don't need a PhD, but curiosity about what makes a "good question" is valuable.

- **Docker & containerization.** Especially if you've run services in production with PM2, container orchestration, or local Docker Compose.

- **Web scraping & NLP** (Beautiful Soup, Playwright, semantic similarity). The anti-leak engine needs to detect similar-but-not-identical questions; hands-on familiarity with embedding models or LLM-based similarity is a bonus.

- **Security hardening** (TLS, key rotation, rate limiting, HSTS headers). QOrium will handle sensitive question banks; you've thought about the threat model.

---

## Compensation

Compensation is market-competitive across base salary, meaningful equity (ESOP or option grants reflective of your seniority), and performance variable. Specific bands are shared in interview Round 2. We're aligned with Talpro Universe's total-comp philosophy: competitive base + founder-aligned equity + quarterly performance bonus based on product milestones.

---

## How We Work

**7 Offices:** QOrium operates under the Talpro Universe Constitution v2.0 — seven offices with distinct charters (MANTHAN, IdeaForge, Bali, CDO, CTO, Gatekeeper, Delivery). The CTO office owns engineering; the Gatekeeper office (Chief Data Officer) owns content quality and anti-leak enforcement. You'll work primarily with CTO and Gatekeeper, but the structure ensures alignment across all functions.

**Weekly cadence:** Monday strategic 1:1 with CTO (30 min). Wednesday engineering standup. Friday sprint review + next-week planning. No meetings on Tuesday/Thursday so you can focus.

**No-fiction culture:** Every external claim we make — "20+ languages supported," "24-hour leak rotation," "≥93% AI plagiarism detection accuracy" — must be backed by a live tool call or reproducible artifact from this sprint. This is recursive (from Talpro CTO Constitution). It keeps us honest and prevents over-promising.

**IdeaForge gates:** Major decisions (new SKU, architecture shifts, new integrations) go through formal gate review at Month 3, 6, 9, 12. You'll contribute architecture recommendations to these gates. Gates are not blockers; they're alignment checks.

**Code standards:** Zero TypeScript errors enforced in CI. 70%+ test coverage gate. Conventional commits. PR review by CTO before merge on `main`. gitleaks scan blocks any commit with secrets.

---

## How to Apply

Send the following to **cto@qorium.online** + share on **LinkedIn** (mention QOrium + "C1 Senior Engineer"):

1. **1-paragraph cover note:** Why this role, why now, why QOrium. Keep it personal—tell us what excites you about shipping 5K+ validated questions and defending against AI/leak attacks.

2. **GitHub profile or work sample:** Link us to public repositories, open-source contributions, or a production system you've shipped. We want to see your code style and problem-solving approach.

3. **Resume/CV** (optional but helpful if different from LinkedIn): Focus on systems you've built, scale you've handled (QPS, DB throughput, team size), and any experience with assessment platforms, NLP, or education tech.

**Response time:** We'll review your application within 3 business days. If shortlisted, Round 1 is a 45-min technical conversation (system design of the Content Engine). Round 2 is a 60-min code pairing session + compensation discussion.

---

**About Talpro Universe:** QOrium is the 13th venture under Talpro Universe (founded 2013, 12 profitable ventures, ₹50Cr+ annual revenue). We're bootstrapped and capital-efficient. Bhaskar Anand is the founder/CEO; the CTO is Talpro's founding CTO. This is a tight, execution-focused team.

---

*Last updated: May 1, 2026. QOrium is an equal-opportunity employer. We welcome applications from women, underrepresented minorities, and engineers from non-traditional backgrounds.*
