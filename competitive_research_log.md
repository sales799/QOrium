# QOrium — Competitive Research Log

**Purpose.** Running log of all research / analysis questions asked during the post–Phase 1 deep-dive. Every entry captures the question, the verified finding, sources, and the implication for QOrium's competitive doc and product blueprint.

**Workflow.**

1. CEO asks a research / analysis question.
2. CTO researches via tools (web search, file reads, etc. — never from prompt-baked facts).
3. CTO appends a finding entry below.
4. When CEO signals "done", CTO consolidates the entire log into a single comprehensive update doc — structured as concrete edits to `01-Market-Landscape.md`, `02-Top-20-Competitor-Audit.md`, `03-Gap-Analysis.md`, `04-QOrium-Blueprint-v1.md`, `05-QOrium-Three-Use-Cases-SKU-Architecture.md`, and `07-CTO-Architecture-v1.md`.

**Source-of-truth rule.** Every numeric claim, library size, pricing point, and capability statement in this log must be backed by a tool call from the session in which it was logged. No "I think" or "approximately" without a citation. This rule applies to the consolidation doc as well — if a finding can't be re-verified at consolidation time, it gets flagged not silently dropped.

**Log started.** 2026-05-01

---

## Finding \#001 — HackerRank library size and composition

**Question (CEO).** "You said HackerRank have Library size \~1,000 curated coding challenges \+ 26M-developer community-contributed practice problems. What are these 1,000 curated coding challenges?"

**What was wrong.** The "\~1,000 curated coding challenges" stat in our prior analysis was an unverified estimate. v5.1 no-fiction rule violation — number cited without a session tool call to back it up.

**Verified finding (web search, 2026-05-01).**

- **Total library size:** \~7,500+ questions across the full HackerRank platform.
- **Hiring-product tier breakdown:**
  - *Starter* tier: \~2,000+ challenges available.
  - *Pro* tier: \~4,000+ challenges available.
- **Community side:** 26M+ developers contributing practice-only problems that do **not** appear inside hiring assessments. The curated/community split is real — curated questions are authored by HackerRank's content team and validated by industrial psychologists for fairness and predictive validity.

**Composition of the curated library — three axes:**

1. **By skill domain.** Algorithms, Data Structures, Mathematics, AI/ML, Functional Programming, SQL, Databases, Linux Shell, Regex, Security, Distributed Systems, plus language-specific tracks for Java, Python, C++, Ruby, JavaScript, React, Angular, Node.js. Each has its own sub-tracks and difficulty calibration.
2. **By role.** Front-end, Back-end, Full-stack, DevOps, Data Engineer, Data Scientist, ML Engineer, Mobile (iOS / Android), QA / SDET, Security Engineer, plus newer AI-engineering roles. Each role bundles a curated set of questions calibrated to seniority bands (intern → senior).
3. **By question type.** Algorithmic coding ("solve this"), project-based / real-world (build a small feature end-to-end), front-end (React / Angular file-system \+ DOM tasks), database (SQL queries against seeded schemas), diagram / system-design (newer addition), DevOps (YAML, shell, infra-as-code), and multiple-choice (concept checks). HackerRank also surfaces AI-resistant variants — questions framed so a candidate can't paste into ChatGPT and win.

**Sources.**

- [HackerRank Pricing 2026 — Lodely](https://www.lodely.com/blog/hackerrank-pricing-2026)
- [HackerRank Review 2026 — MyEngineeringBuddy](https://www.myengineeringbuddy.com/blog/hackerrank-reviews-alternatives-pricing-offerings/)
- [HackerRank — Online Coding Tests and Technical Interviews](https://www.hackerrank.com/)

**QOrium implication (preliminary — to be re-evaluated at consolidation).**

- **Stat fix.** Replace "\~1,000 curated coding challenges" wherever it appears in `01-Market-Landscape.md`, `02-Top-20-Competitor-Audit.md`, and the deck.
- **Competitive bar reset.** Our defensibility argument was implicitly "we'll match \~1,000 curated items \+ add multi-modal." Real bar is \~7,500 curated \+ 26M community. Match on volume alone is not a winnable game in a reasonable timeline.
- **Strategic axis to attack.** HackerRank is wide on coding, narrower on **multi-modal \+ Indian-context \+ role-based for non-engineering roles**. Our 4-delivery-mode × 3-buyer thesis still holds, but the framing should shift from "compete on volume" to "win on dimensions HackerRank doesn't optimize for" — proctored skill assessments for non-CS roles (sales, finance, ops), Indian campus-recruit context, and question-as-a-service licensing where HackerRank only offers SaaS.
- **Three-axis composition is borrowable.** HackerRank's domain × role × type taxonomy is well-validated. QOrium should consider adopting a similar three-axis content schema in the CTO architecture doc rather than a flat tagging system.

---

## Finding \#002 — HackerRank full capability surface (tech, assessments, proctoring, integrations, pricing)

**Question (CEO).** "What all Tech u find and assessment type or other thing u find in Hackerrank. Let's keep adding the data in a table or Google sheet or Excel whichever consume less token. Let's Build a Sheet."

**Deliverable.** [HackerRank-Capabilities.xlsx](computer:///Users/bhaskar_universe/Documents/Claude/Projects/QOrium/HackerRank-Capabilities.xlsx) — 10-tab workbook saved alongside the rest of the QOrium deliverables. Tabs: Summary, Languages, Frameworks, Question Types, Question Domains, Roles, Proctoring & AI, Integrations, Pricing, QOrium Implications.

**Key verified findings (this session, web-search backed).**

- **Languages.** 60+ supported (HackerRank Candidate Support KB). Spans systems (C/C++/Rust/Go), JVM (Java/Kotlin/Scala/Groovy/Clojure), dynamic (Python/Ruby/PHP/Perl/Lua), web (JS/TS), functional (Haskell/OCaml/Erlang/Elixir/F\#/Lisp), Microsoft (C\#/VB), mobile (Swift/Obj-C/Dart), database (MySQL/PG/MSSQL/Oracle/DB2), shell (Bash/awk/sed), plus R, Julia, MATLAB, Prolog, COBOL, Fortran.
- **Frameworks.** React, Angular, Vue (light), Node/Express, Spring Boot, Django, Flask, Rails, ASP.NET, Android (Kotlin/Java), iOS (Swift), React Native, pandas/scikit-learn/TF/PyTorch, Docker/Kubernetes/Terraform.
- **Question types.** 17 distinct types catalogued: Algorithmic, Project-based, Front-end, Back-end, Full-stack, Database/SQL, Diagram/System-design, MCQ, Subjective, Approximate-solution, Linux Shell, Regex, Functional Programming, Mobile, DevOps/IaC, Data-Science/ML, AI-resistant variants. Plus **customer-authored** (a tacit admission of public-library decay — important strategic insight).
- **Proctoring & AI.** Proctor Mode (webcam \+ screen \+ voice \+ tab guard), Secure Mode (lighter), AI Plagiarism Detection (self-reported 93% accuracy, "3x traditional"), Image Analysis (phone/multi-face detection), object-detection on screenshots, multi-monitor detection, suspicious typing patterns, DMCA takedown, AI-resistant question variants, AI-augmented Interviewer (Enterprise). Rolled out July 2025 as the post-ChatGPT defense layer.
- **Integrations.** Greenhouse, Workday, iCIMS, Ashby, Lever, BrassRing, BreezyHR, Avature, **Darwinbox** (India-relevant), Freshteam, Zoho Recruit, SmartRecruiters, Jobvite, Slack, MS Teams, Zoom, plus Webhooks/REST API \+ SAML SSO.
- **Pricing (2026).** Starter $165/mo or $1,990/yr (1 user). Pro $375/mo or $4,490/yr (unlimited users). Enterprise custom — Vendr's 160-customer dataset shows avg **$70,608/yr**, with negotiable 16-29% discounts.
- **Library size correction (re-stated from Finding \#001).** \~7,500+ total questions; tier breakdown \~2,000+ Starter / \~4,000+ Pro / full Enterprise.

**Sources.**

- [HackerRank Candidate Support — Supported Programming Languages](https://candidatesupport.hackerrank.com/articles/2200226909-supported-programming-languages)
- [HackerRank Support — Question Types in HackerRank Tests](https://support.hackerrank.com/hc/en-us/articles/26042427594131-Question-Types-in-HackerRank-Tests)
- [HackerRank — Plagiarism Detection product page](https://www.hackerrank.com/features/plagiarism-detection)
- [HackerRank — Proctor Mode KB](https://support.hackerrank.com/articles/5663779659-proctor-mode)
- [HackerRank Engineering — Plagiarism Detection Accuracy 2025 (93%)](https://www.hackerrank.com/writing/plagiarism-detection-accuracy-2025-hackerrank-93-percent-vs-codesignal)
- [HackerRank — Integrations directory](https://www.hackerrank.com/features/integrations)
- [HackerRank Support — ATS Integration overview](https://support.hackerrank.com/hc/en-us/articles/219993528-ATS-integration-overview)
- [Lodely — HackerRank Pricing 2026](https://www.lodely.com/blog/hackerrank-pricing-2026)
- [Vendr — HackerRank Software Pricing & Plans 2026](https://www.vendr.com/marketplace/hackerrank)
- [HackerRank Blog — New Role-based Developer Skill Assessments](https://blog.hackerrank.com/new-role-based-assessments/)

**Source text targeted for revision in `02-Top-20-Competitor-Audit.md`** (existing entry quoted for reference at consolidation):

HQ Mountain View, California, USA / Founded 2009 (Vivek Ravisankar, Hari Karunanidhi) / Primary buyer Engineering hiring teams at mid-to-large tech companies / **Library size \~1,000 curated coding challenges \+ 26M-developer community-contributed practice problems** / G2 rating 4.5/5 / Market share (Pre-employment Assessment) \~3.5% ...

The "\~1,000 curated" figure must change. The rest of the entry holds up (HQ, founders, founding date, primary buyer, G2, market share, customer-authoring trend, leakage concerns).

**QOrium implications (preliminary — full set in the .xlsx tab "QOrium Implications").**

1. **Stat fix** — replace \~1,000 with \~7,500+ (with Starter/Pro tier breakdown) across `01-Market-Landscape.md`, `02-Top-20-Competitor-Audit.md`, and the deck.
2. **Defensibility reframe** — volume parity unwinnable in \<2 years; pivot thesis from "match library size" to "win on axes HR doesn't optimize for" (multi-modal, non-engineering roles, India context, fresh+never-leaked promise).
3. **Anti-cheat parity is non-negotiable** — QOrium MUST ship Proctor Mode equivalent \+ AI plagiarism \+ project-based question type to be credible enterprise-wise.
4. **Adopt 3-axis taxonomy** — Domain × Role × Type — in `07-CTO-Architecture-v1.md` schema.
5. **Pricing wedge** — QOrium API tier should sit in $5k–25k/yr band: under HR Pro/Enterprise, premium to commodity question banks.
6. **Integration priority order** — Greenhouse → Workday → Ashby → Darwinbox first.
7. **Question Type gap to attack** — Diagram/System-design \+ non-engineering case studies \+ Indian-context scenarios.
8. **AI interviewer reservation** — leave architectural room in the blueprint for an AI-graded subjective question type by Phase 3\.

---

## Finding \#003 — Mercer | Mettl: 800+ tests claim, full catalog, coverage depth

**Question (CEO).** Audit-doc entry for Mercer Mettl claims "Library size — 'One of the most advanced and extensive' — estimated 100,000+ questions across 800+ tests" and "Coverage — Psychometric, aptitude, coding, domain (BFSI, IT, sales), language". CEO asked: (1) list which are these 800+ tests, (2) update workbook \+ log, (3) provide detailed offering and Coverage for cross-competitor comparison and gap analysis.

**Critical correction.** The "800+ tests" figure is wrong. Mettl's own marketing language is **800+ skills, NOT 800+ tests**. Pre-built test count is **200+ to 400+** depending on source. The 100,000+ question figure is verified.

**Verified Mettl numbers (this session, web-search backed).**

- 100,000+ questions in question bank
- 200+ to 400+ pre-built tests (sources differ; Mettl's official marketing uses 400+ in some pages, 200+ in others; the 800+ figure refers to skill coverage not tests)
- 800+ skills covered
- 300+ job roles
- 25+ industries
- 30+ languages, 90+ countries
- 30M+ students cumulative on examination platform
- 4,000+ customer organizations
- IRT (Item Response Theory) scoring — same family used by GRE/GMAT/SAT
- Proctoring offerings: AI, AI-assisted human, Live human, Recorded review
- Examination platform clients: IIM Bangalore, Miami Dade College (USA), Washington Center (USA), PIP UNPAD (Indonesia), Ghent University (Korea campus), upGrad, Tally
- G2 rating: 4.4/5 (Assessments) and 4.4/5 (Examination & Proctoring)
- Pricing: custom/quote-based; mid-market typ. $5k-15k/yr; enterprise typ. $25k-100k+/yr

**The "800+" enumeration — what the catalog actually looks like.**

The pre-built test catalog organizes into 8 families. Full enumeration is in the workbook (`Mettl-Test-Catalog` tab). Summary:

1. *Psychometric — Personality* — Mettl Personality Profiler (MPP, Big Five \+ 26 facets), Mettl Personality Map (MPM), DISC, 16PF, MBTI-style, Sales Personality, Customer Service Personality. \~10 personality tests.
2. *Psychometric — Behavioral* — Behavioral Competency, EI, Integrity, Motivators, Leadership Potential, HEXACO. \~6-8 behavioral tests.
3. *Psychometric — Cognitive* — Cognitive Ability Test (general g-factor).
4. *Aptitude / Cognitive* — 9 sub-types (Numerical, Data Interpretation, Verbal, Logical, Critical, Abstract, Spatial, Visual, Decision Making) \+ Quantitative \+ Technical \+ Combined \+ General. \~13 aptitude tests.
5. *Coding / Technical* — Language tests (C, C++, C\#, Java, Python, Ruby, JS, HTML/CSS, Node.js), framework tests (Angular, Django, full-stack), specialization tests (Automation Testing, Blockchain, Data Structures), DevOps, Database, plus the Coding Projects platform (real-world AI-resistant). \~20-30 coding tests.
6. *Domain — by industry/function* — BFSI (Banking, Insurance, Capital Markets), IT/ITES (ITIL, Cloud AWS/Azure/GCP, Cybersecurity), Sales (general/Inside/Field), HR (Generalist, TA), Marketing (Digital, Brand), Operations (Supply Chain, Quality), Finance (Accounting, Financial Analysis), Pharma, Mechanical/Electrical/Civil Engineering, Legal, Retail, BPO/KPO (Voice & Accent). \~80-100 domain tests across 25+ industries.
7. *Language* — English Proficiency, Spoken English (Versant-style), 30+ multilingual tests.
8. *Functional / Role-based* — Project Management, Data Analyst, Business Analyst, Product Manager, etc.
9. *Examination Platform* — Semester exams, Government recruitment exams, Certification exams, Pre-Placement campus tests.
10. *360 / Development* — 360-degree feedback, Performance Appraisal, TNA, Digital Readiness.

Adding these together gets you to \~200-400+ pre-built tests. The "800+" is the count of distinct **skills** measured across all these tests combined — and that's the figure Mettl markets when they say "800+".

**Coverage depth — Mettl strengths & gaps (per Coverage Detail tab in workbook).**

Strengths: Psychometric/Behavioral (I/O psych team led, IRT calibration, decades of validation); Aptitude (9 sub-types, India-campus dominant); Domain breadth (25+ industries, 300+ roles); Multi-language (30+ langs, 90+ countries); Examination platform (gov-grade trust); Mercer-channel reach.

Gaps: Coding depth (shallower than HackerRank/Codility on hardcore algo and bleeding-edge frameworks); UX (dated relative to modern entrants); ATS-marketplace presence (thinner than HackerRank); Reporting visual design (enterprise-y, not modern dashboards); Niche vertical depth (some industries surface-level despite breadth claim).

**Sources.**

- [Mettl — Skills Assessment Test Library](https://mettl.com/skills-assessment-test/)
- [Mettl — Pre-built Tests](https://mettl.com/en/pre-built-tests/)
- [Mettl — Aptitude Tests](https://mettl.com/en/aptitude-tests/)
- [Mettl — Psychometric Tests for Recruitment](https://mettl.com/psychometric-tests/)
- [Mettl — Personality Profiler](https://mettl.com/en/personality-profiler-test/)
- [Mettl — Coding Tests](https://mettl.com/en/coding-tests/)
- [Mettl — Coding Projects Platform](https://mettl.com/en/coding-projects/)
- [Mettl — Technical / Domain Tests](https://mettl.com/en/technical-tests/)
- [Mettl — Secure Exam Proctor](https://mettl.com/en/secure-proctor/)
- [Mettl — Remote Exam Monitoring](https://mettl.com/en/remote-exam-monitoring-and-invigilation/)
- [Mettl Glossary — Big Five Personality Test](https://mettl.com/glossary/b/big-five-personality-test/)
- [Mettl Blog — BFSI Industry Hiring Guide](https://blog.mettl.com/bfsi-industry-hiring-guide/)
- [Mettl Blog — Types of Aptitude Test](https://blog.mettl.com/types-of-aptitude-test/)
- [JobTestPrep — Mettl Test Practice 2026](https://www.jobtestprep.com/mettl-test)
- [MConsultingPrep — Mettl Aptitude Tests](https://mconsultingprep.com/mercer-mettl-aptitude-tests)
- [TestGorilla vs. Mercer Mettl Comparison](https://www.testgorilla.com/blog/testgorilla-vs-mercer-mettl-assessments/)
- [G2 — Mercer Mettl Assessments Reviews](https://www.g2.com/products/mercer-mettl-assessments/reviews)
- [Capterra — Mercer Mettl Coding Assessments](https://www.capterra.com/p/264762/Mercer-Mettl-Coding-Assessments/)
- [Capterra — Mercer Mettl Examination Platform](https://www.capterra.com/p/264763/Mercer-Mettl-Online-Examination-and-Proctoring-Solutions/)
- [Mercer — Examination & Certification Platform](https://www.mercer.com/solutions/talent-and-rewards/knowledge-assessment/)

**Source text targeted for revision in `02-Top-20-Competitor-Audit.md`** (existing entry quoted for reference at consolidation):

"Library size — 'One of the most advanced and extensive' — estimated **100,000+ questions across 800+ tests** / Coverage — Psychometric, aptitude, coding, domain (BFSI, IT, sales), language"

Replace with:

"Library size — 100,000+ questions across **200-400+ pre-built tests, covering 800+ skills, 300+ job roles, 25+ industries**, in 30+ languages across 90+ countries / Coverage — Psychometric (Big Five MPP/MPM, DISC, 16PF, behavioral, EI, leadership), Aptitude (9 cognitive sub-types \+ quantitative \+ technical), Coding (15+ languages \+ frameworks \+ AI-resistant Coding Projects), Domain (BFSI deepest, IT/ITES, Sales, HR, Marketing, Ops, Finance, Pharma, Engineering, Legal, Retail, BPO), Language (30+ tongues), Examination platform (universities \+ government exams)"

**QOrium implications (preliminary — full set in workbook tabs `QOrium Implications` rows 18-27 and `HR-vs-Mettl-Compare`).**

1. **Stat fix** — replace "800+ tests" with "200-400+ pre-built tests / 800+ skills / 300+ roles / 25+ industries / 100,000+ questions" in `02-Top-20-Competitor-Audit.md` and dependent docs.
2. **Psychometric — buy not build** — Mettl has 15 years of I/O psych investment; QOrium should LICENSE psychometric content (Mettl partnership OR 3rd-party) rather than rebuild. Reflect in `04-QOrium-Blueprint-v1.md` content sourcing strategy.
3. **Aptitude module** — add as Phase 2 to QOrium roadmap. Indian campus \+ entry-level hiring needs aptitude; can't ignore.
4. **Domain breadth \= QOrium's wedge** — Mettl is deep in 25+ industries. HackerRank near-zero. QOrium India-context BFSI \+ BPO \+ gov-exam-prep is a defensible position adjacent to Mettl's strongest customers.
5. **Examination platform** — DO NOT enter in Phase 1-2. Operationally heavy and requires gov-relationship moat. Partnership-only in Phase 3\.
6. **Multi-language requirement** — Mettl's 30+ langs is a real moat. QOrium MVP should be English \+ Hindi \+ 3 more (recommend Spanish, Bahasa, Arabic) at launch.
7. **IRT scoring is non-negotiable** — Mettl uses IRT (same as GRE/GMAT/SAT). QOrium must implement and cite IRT in marketing for HR-buyer credibility. Update `07-CTO-Architecture-v1.md` scoring section.
8. **Mercer channel as partnership opportunity** — Mercer-owned Mettl \+ Mercer's enterprise HR reach \= a content-API supply pitch QOrium could make.
9. **BFSI head-on** — Indian BFSI is Mettl's flagship; QOrium India BFSI module overlaps with Mettl's strongest customers — high-value entry.
10. **Coding-content wedge** — Mettl coding is mid-tier; HackerRank is premium. QOrium can position calibrated mid-tier under HackerRank price, over Mettl's coding depth.

**Workbook updates this turn (no new file — same `HackerRank-Capabilities.xlsx`).**

Added 4 new tabs:

- `Mettl-Summary` — 21-row capability summary with audit-doc reconciliation column.
- `Mettl-Test-Catalog` — full categorized catalog of 70+ pre-built tests across 10 families.
- `Mettl-Coverage-Detail` — depth × differentiator × weakness for each coverage area.
- `HR-vs-Mettl-Compare` — 20-dimension side-by-side; designed to extend with more competitor columns over time.

Also extended the `QOrium Implications` tab with 10 Mettl-specific implication rows.

Workbook is now multi-competitor; filename `HackerRank-Capabilities.xlsx` is misleading and will be reconciled at consolidation (per saved feedback memory: "do not rename mid-research without asking").

---

## Finding \#004 — HackerEarth: 40K problems / 1K skills / 40+ langs claims \+ audit-doc corrections

**Question (CEO).** Audit-doc entry for HackerEarth says: "(US offices, sold to Talview-backed group, originally founded 2012 by Sachin Gupta & Vivek Prakash)" with library "40,000+ problems, 1,000+ skills, 40+ programming languages". CEO asked: (1) generate the complete list of 1,000+ skills, (2) generate the 40+ programming languages list, (3) update workbook \+ log.

**Critical corrections to audit doc.**

1. **Talview acquisition is FALSE.** HackerEarth has NOT been sold to Talview. Per PitchBook, Crunchbase, and Tracxn: HackerEarth is independent, privately held, and has had no acquisitions. Talview is a separate, independent company. The audit-doc claim must be removed.
2. **HQ.** Audit doc says "Bengaluru, India (US offices…)". Per Wikipedia: HackerEarth is **headquartered in San Francisco** with Indian operations in Bengaluru. Both descriptions are partly true, but corporate HQ is San Francisco — the audit doc has it backwards.
3. **Current CEO.** Audit doc names "Sachin Gupta & Vivek Prakash" as if current. Both are now **former**. Current CEO is **Vikas Aditya**.
4. **Library size 40,000+.** Current HackerEarth marketing says **17,000+** (FaceCode page) or **25,000+** (skills assessments page). The 40,000+ figure is inconsistent with current pages — likely an older or inflated count. Recommend reconciling the audit doc to "17,000–25,000+ questions" or stating both figures with the source date.
5. **Founding date and founders themselves are correct** — November 2012, Sachin Gupta \+ Vivek Prakash, both IIT Roorkee alumni.

**Verified HackerEarth numbers (this session).**

- Founded November 2012 by Sachin Gupta \+ Vivek Prakash (IIT Roorkee alumni)
- HQ San Francisco; engineering ops in Bengaluru
- Current CEO: Vikas Aditya
- Cumulative funding: $21.6M (Series A 2017 \= $4.5M led by DHI Group; total 16 investors)
- Annual revenue (2024): \~$36M
- 750+ customers (some sources say 500+)
- 4M+ developer community
- 10M+ developer reach via hackathon platform across 133 countries and 450+ universities
- Major customers: Amazon, PayPal, Walmart Labs, Thoughtworks, Société Générale, HP, VMware, DBS, HCL, GE, Wipro, Barclays, Pitney Bowes, Intel, Hitachi, L\&T Infotech (heavy GCC \+ Indian IT services concentration)
- Question library: 17,000+ (FaceCode) / 25,000+ (skills assessments)
- Skills covered: 900+ to 1,000+
- Programming languages: 40+ (41 explicitly in FaceCode IDE)
- Job roles: 100+
- Question types: 15+ (MCQ, Subjective, Programming, Front-end, Approximate, DevOps, Data Science, SQL, Machine Learning, Java Project, C\# Project, Python Project, Diagram, Selenium)
- Live-interview product: FaceCode (41 langs, HD video, diagram board, AI summary, up to 5 interviewers)
- AI products: AI Interview Agent (autonomous interviews), AI Screening Agent (claims 80% applicant-pool reduction)
- Code quality: SonarQube-based (correctness \+ efficiency \+ quality)
- Plagiarism / proctoring: tab-switch, audio monitoring, bot/tool detection, code-similarity
- ATS integrations: Greenhouse, Lever, Workday, SAP SuccessFactors (4 — thinner than HackerRank's 15+)
- Compliance: GDPR \+ ISO 27001 \+ 99.99% uptime claim
- G2 rating: 4.5 / 5 (Assessments)

**The "40+ languages" list — categorized (full enumeration in workbook tab `HE-Languages`).**

42 languages catalogued across 11 categories: Systems/Compiled (C, C++/14/17, Rust, Go, Pascal, Fortran), JVM (Java/8/17/21, Kotlin, Scala, Groovy, Clojure), Dynamic/Scripting (Python/2/3/3.8, Ruby, PHP, Perl, Lua), Web (JavaScript/Node, TypeScript), Functional (Haskell, OCaml, Erlang, Elixir, F\#, Lisp, Racket), Microsoft (C\#, VB.NET), Mobile (Swift, Objective-C, Dart), Database/Query (SQL, PL/SQL), Shell/Ops (Bash, Awk/Sed), Statistical/Data (R, Julia, MATLAB/Octave), Other (Prolog, Smalltalk, Tcl, VB, Brainfuck/esoteric).

IntelliSense is explicitly enabled for: C, C++, C++14, C++17, Java, Java 8, JavaScript (Node.js), Python, Python 3, Python 3.8, Bash, Swift, TypeScript.

**The "1,000+ skills" list — honesty note \+ canonical breakdown.**

HackerEarth does **not** publish a flat enumerated list of 1,000+ skills. The 1,000+ figure is a count aggregated across all sub-skills, frameworks, language features, and domain knowledge tags inside their question library. There is no public "list of 1,000 skills" to extract. Anyone who claims to enumerate it is either fabricating or mislabeling categories as skills.

What we *can* do — and what's now in the workbook (`HE-Skill-Taxonomy` tab) — is the canonical category breakdown that **rolls up** to 1,000+:

| Skill Family | Approx. Sub-skill Count |
| :---- | :---- |
| Programming Languages (40+) | 200-300 (each language exposes \~5-10 idiom/feature sub-skills) |
| Front-end Frameworks (React, Angular, Vue, Svelte, Web Components, CSS/Tailwind, etc.) | 80-100 |
| Back-end Frameworks (Node/Express, NestJS, Spring Boot, Django, Flask, FastAPI, Rails, Laravel, ASP.NET, etc.) | 80-100 |
| Mobile (Android, iOS, React Native, Flutter) | 40-60 |
| Data Science / ML (pandas, NumPy, scikit-learn, TF, PyTorch, classical ML, DL, NLP, CV, MLOps) | 100-120 |
| AI / Generative AI (LLMs, RAG, fine-tuning, embeddings, agents) | 30-40 |
| DevOps / SRE (Docker, K8s, Terraform, Ansible, CI/CD, observability) | 60-80 |
| Cloud (AWS, Azure, GCP — each service is a sub-skill) | 100-150 |
| Database / Data Engineering (SQL, NoSQL, ETL, Airflow, dbt, Spark, Kafka) | 60-80 |
| Algorithms & Data Structures | 50-70 |
| System Design | 30-40 |
| Security (OWASP, crypto, auth, app sec) | 30-50 |
| Quality / Testing (unit, integration, E2E, Selenium, performance, BDD) | 30-40 |
| Domain Knowledge (FinTech, HealthTech, AdTech, EdTech, eCommerce, IoT, blockchain) | 30-50 |
| Soft / Behavioral (newer, surfaced in AI Interviewer) | 20-30 |
| Hackathon-derived skills (innovation, MVP scoping, presentation) | 10-20 |

Roll-up: \~950–1,250 sub-skills depending on counting granularity → matches HackerEarth's "900-1,000+" marketing range.

**Sources.**

- [HackerEarth — Wikipedia](https://en.wikipedia.org/wiki/HackerEarth)
- [HackerEarth — corporate site](https://www.hackerearth.com/)
- [HackerEarth — Skill-based Assessments page](https://www.hackerearth.com/recruit/features/skill-based-assessments)
- [HackerEarth — Coding Tests & Assessments](https://www.hackerearth.com/recruit/assessments)
- [HackerEarth Help Center — Supported browsers and languages](https://help.hackerearth.com/hc/en-us/articles/360002371373-Supported-browsers-and-languages)
- [HackerEarth Help Center — IntelliSense supported languages](https://help.hackerearth.com/hc/en-us/articles/14721979689625-what-languages-are-supported-in-intellisense-auto-complete-)
- [HackerEarth Help Center — Different types of questions](https://help.hackerearth.com/hc/en-us/articles/360003717174-different-types-of-questions)
- [HackerEarth Blog — FaceCode definitive way of conducting coding interviews](https://www.hackerearth.com/blog/conducting-coding-interviews)
- [HackerEarth Blog — AI Interviewer in 2026](https://www.hackerearth.com/blog/ai-interviewer-in-2026-what-they-are-how-they-work-and-why-they-matter-for-recruiters)
- [HackerEarth Blog — 11 Best Hackathon Platforms 2026](https://www.hackerearth.com/blog/hackathon-platforms)
- [Crunchbase — HackerEarth profile](https://www.crunchbase.com/organization/hackerearth)
- [PitchBook — HackerEarth 2025 profile](https://pitchbook.com/profiles/company/55511-65)
- [PitchBook — Talview 2026 profile](https://pitchbook.com/profiles/company/57495-43) (used to disprove the Talview acquisition claim)
- [Latka — HackerEarth $36M revenue 2024](https://getlatka.com/companies/hackerearth)
- [DHI Group press — HackerEarth Series A 2017](https://dhigroupinc.com/press/press-release-details/2017/HackerEarth-Raises-45-Million-in-Series-A-to-Fund-Rapid-Growth-and-Expansion/default.aspx)
- [G2 — HackerEarth Assessments reviews](https://www.g2.com/products/hackerearth-assessments/reviews)

**Source text targeted for revision in `02-Top-20-Competitor-Audit.md`** (existing entry reference for consolidation):

"HQ Bengaluru, India (**US offices, sold to Talview-backed group**, originally founded 2012 by Sachin Gupta & Vivek Prakash) / Founded 2012 / Library size **40,000+ problems**, 1,000+ skills, 40+ programming languages / Differentiator Hackathons-as-recruiting \+ intelligence-backed question engine"

Replace with:

"HQ San Francisco, USA (engineering ops in Bengaluru, India). Founded November 2012 by Sachin Gupta & Vivek Prakash (IIT Roorkee alumni; both now former). Current CEO Vikas Aditya. Independent (privately held); $21.6M cumulative funding across 16 investors; \~$36M revenue (2024); 750+ customers including Amazon, PayPal, SocGen, Barclays, Wipro, HCL, L\&T Infotech. Library size 17,000–25,000+ questions, 1,000+ skills, 40+ programming languages, 100+ roles, 15+ question types. Differentiator: hackathon platform (10M+ devs, 133 countries, 450+ universities) \+ FaceCode live-interview \+ AI Interview Agent \+ AI Screening Agent."

**QOrium implications (preliminary — full set in workbook tabs `QOrium Implications` and `Cross-Competitor-Compare`).**

1. **Audit-doc Talview claim must be deleted** — factually wrong; carrying it weakens our credibility.
2. **Library leakage thesis is strongest against HackerEarth** — hackathon problems are PUBLIC by design, then leak into hiring. QOrium "never-leaked, anti-leak rotated" positioning lands hardest here.
3. **DON'T build live-interview tooling** — FaceCode (HE), HackerRank Interviews, and CoderPad already own this layer. QOrium is API-only into these platforms.
4. **AI-graded subjective questions confirmed as industry trajectory** — HE's AI Interviewer \+ AI Screener validates that QOrium's Phase 3 AI scoring roadmap is well-positioned.
5. **SonarQube integration is easy parity** — open-source; QOrium adds it cheaply for code-quality scoring.
6. **HackerEarth \+ HackerRank are both psychometric/aptitude/domain-zero** — QOrium's wedge of "dev-rigor \+ Mettl-grade behavioral \+ India-context" is defensible against both.
7. **Indian \+ GCC enterprise concentration is HE's strength** — same DNA as Talpro Customer-Zero; QOrium's India-native go-to-market is competitive with HE's home turf.
8. **Hackathon platform \= unique HE moat** — QOrium can't match. Position as complementary content supplier (hackathon-shortlist evaluation).
9. **HE's ATS integration list is thinner than HR** — Greenhouse/Lever/Workday/SAP only. QOrium's Ashby \+ Darwinbox integration plan would actually exceed HE on enterprise ATS coverage.
10. **HE doesn't cite IRT** — uses test-case \+ percentile \+ SonarQube. QOrium citing IRT becomes a credibility lever vs HE for HR-buyers (alongside Mettl).

**Workbook updates this turn.**

Same `HackerRank-Capabilities.xlsx` (no new file). Now 18 tabs total. Added 4 new tabs:

- `HE-Summary` — 28-row capability summary with audit-doc reconciliation column.
- `HE-Languages` — 42 languages categorized by family \+ IntelliSense flags.
- `HE-Skill-Taxonomy` — canonical category breakdown that rolls up to 1,000+ skills (with explicit honesty note that no flat list exists).
- `HE-Capabilities` — full feature/product-line audit (Assessments, FaceCode, AI Interviewer, AI Screener, Hackathon platform, FlexiTest, etc.).

Renamed `HR-vs-Mettl-Compare` → `Cross-Competitor-Compare` (now 3 competitors). Added HackerEarth column with row-by-row analysis. Updated "Who wins" \+ "QOrium gap to attack" columns to reflect 3-way comparison.

Extended `QOrium Implications` tab with 12 HE-specific implication rows.

Workbook is now multi-competitor (3 competitors covered); filename will be reconciled at consolidation per saved feedback memory.

---

## Finding \#005 — Full sub-skill enumeration (1,229 entries) for HackerEarth's "1,000+" claim

**Question (CEO).** "Programming Languages (200-300 sub-skills), Frameworks (160-200), Mobile (40-60), Data Science / ML (100-120), Cloud (100-150), DevOps (60-80), Database / Data Eng (60-80), Algo & DS (50-70), AI / GenAI (30-40), and 6 more — that rolls up to \~950-1,250 sub-skills, matching their marketing range. Can you list all of them?"

**Honesty note (re-stated up front).** HackerEarth does NOT publish a flat enumerated list of 1,000+ skills. The 1,000+ figure is a count rolled up across language sub-skills, framework features, domain knowledge, and tags inside their question library. There is no public source from which to extract the literal list. What's in the workbook (`HE-Skills-Full-List` tab) is a **reconstruction** at industry-standard granularity that matches HackerEarth's "1,000+" marketing claim. It is the canonical sub-skill set any competent assessment platform (HE, HackerRank, Codility, TestGorilla) covers under each family — useful for QOrium taxonomy planning and gap analysis, NOT defensible as a verbatim claim of HE coverage.

**Reconstruction result.** 1,229 sub-skills across 16 families — falls inside the expected 950-1,250 band that aggregates to "1,000+".

| \# | Family | Sub-skill Count | % of Total |
| :---- | :---- | :---- | :---- |
| 1 | Programming Languages | 271 | 22.0% |
| 2 | Front-end Frameworks | 106 | 8.6% |
| 3 | Back-end Frameworks | 97 | 7.9% |
| 4 | Mobile | 59 | 4.8% |
| 5 | Data Science / ML | 101 | 8.2% |
| 6 | AI / Generative AI | 35 | 2.8% |
| 7 | DevOps / SRE | 75 | 6.1% |
| 8 | Cloud | 120 | 9.8% |
| 9 | Database / Data Engineering | 82 | 6.7% |
| 10 | Algorithms & Data Structures | 78 | 6.3% |
| 11 | System Design | 38 | 3.1% |
| 12 | Security | 45 | 3.7% |
| 13 | Quality / Testing | 38 | 3.1% |
| 14 | Domain Knowledge | 44 | 3.6% |
| 15 | Soft / Behavioral | 25 | 2.0% |
| 16 | Hackathon-Derived | 15 | 1.2% |
| **TOTAL** |  | **1,229** | **100%** |

**How the enumeration was built.**

- *Programming Languages (271).* 42 supported languages × \~6 canonical sub-skills each. Major languages (Python, Java, C/C++, JS/TS, Go, Rust, C\#, Ruby) get 8-15 sub-skills covering syntax, OOP, concurrency, std lib, testing, build tools. Mid-tier and minor languages get 3-7 sub-skills.
- *Front-end Frameworks (106).* React (26 sub-skills — JSX through testing through Next.js), Angular (20), Vue (12), Svelte, Web Components, plus CSS/Styling (12), Animation libraries (4), Browser APIs (10), Build/Tooling (10).
- *Back-end Frameworks (97).* 15 frameworks. Spring Boot (12 sub-skills), Django (10), Node/Express (10), Rails (10), ASP.NET Core (8), Flask (8), Laravel (8), FastAPI (6), NestJS (6), plus Hapi, Koa, Fastify, Phoenix, Gin/Echo/Fiber, Actix/Rocket.
- *Mobile (59).* Android Kotlin (15), iOS Swift (15), React Native (10), Flutter/Dart (10), cross-cutting concerns (9 — push, deep linking, analytics, crash reporting, etc.).
- *Data Science / ML (101).* pandas (10), NumPy (5), scikit-learn (12), TensorFlow/Keras (8), PyTorch (8), classical ML (12), deep learning (10), NLP (8), Computer Vision (6), MLOps (8), Feature Engineering (6), Model Evaluation (8).
- *AI / Generative AI (35).* LLM fundamentals, prompt engineering patterns, RAG, embeddings, 5 vector DBs, fine-tuning variants, 4 agent frameworks, multi-modal, evaluation, safety/guardrails, self-hosting, quantization.
- *DevOps / SRE (75).* Docker (6), Kubernetes (12), Helm, Terraform (8), Ansible (5), CI/CD (8 platforms), Linux admin (8), Observability (8), Logging (5), Incident response (6), Service mesh (4), GitOps (3).
- *Cloud (120).* AWS 50 services \+ Azure 40 \+ GCP 30\. Each cloud service counted as one sub-skill — this is how cloud expands skill counts rapidly in any assessment library.
- *Database / Data Engineering (82).* SQL fundamentals (12), MySQL/PostgreSQL/MSSQL/Oracle/DB2 specifics, MongoDB (5), DynamoDB (5), Cassandra, Redis (5), Neo4j, data modeling (5), ETL/ELT (5), Airflow (4), dbt (3), Spark (6), Kafka (5), Flink (3), Data warehouses (6).
- *Algorithms & DS (78).* Sorting, searching, recursion/backtracking, greedy, DP (10), graphs (12), trees (10), heaps, stacks/queues, hashing, string algorithms (6), geometry, bit manipulation, divide & conquer, number theory.
- *System Design (38).* Caching, load balancing, sharding, replication, CAP, consensus, microservices, event-driven, queues, idempotency, rate limiting, circuit breaker, API design (REST/gRPC/GraphQL), WebSockets, capacity planning, DR.
- *Security (45).* Full OWASP Top 10 \+ crypto \+ auth (OAuth/OIDC/SAML/JWT) \+ app sec \+ dependency scanning \+ SAST/DAST \+ container security \+ zero trust \+ compliance frameworks (SOC2/ISO27001/GDPR/HIPAA/PCI-DSS).
- *Quality / Testing (38).* Unit/integration/E2E/performance, framework-specific (Cypress/Playwright/Selenium/Puppeteer/Appium), advanced techniques (mutation, fuzzing, contract, property-based).
- *Domain Knowledge (44).* FinTech (8), HealthTech (4), AdTech (4), EdTech (3), eCommerce (5), IoT (5), Embedded (4), Blockchain/Web3 (8), Telco (3).
- *Soft / Behavioral (25).* Communication, debugging methodology, root cause analysis, conflict resolution, mentoring, ownership, decision making, presentation, etc. — surfaced in HE's AI Interviewer Agent.
- *Hackathon-Derived (15).* Unique to HE because they run the largest hackathon platform. Innovation framing, MVP scoping, pitching, demo polish, time-boxed delivery, etc.

**Sources.** The enumeration is built from canonical industry knowledge and verified against:

- [HackerEarth Help Center — Different question types](https://help.hackerearth.com/hc/en-us/articles/360003717174-different-types-of-questions)
- [HackerEarth — Skill-based Assessments](https://www.hackerearth.com/recruit/features/skill-based-assessments)
- [HackerEarth — FaceCode (frameworks coverage)](https://www.hackerearth.com/blog/conducting-coding-interviews)
- [HackerEarth — AI Interviewer 2026 (soft-skill surface)](https://www.hackerearth.com/blog/ai-interviewer-in-2026-what-they-are-how-they-work-and-why-they-matter-for-recruiters)
- [HackerEarth — Hackathon platform](https://www.hackerearth.com/blog/hackathon-platforms)
- AWS / Azure / GCP service catalogs (each cloud's product listing)
- OWASP Top 10 reference
- Industry-standard ML / data engineering taxonomies

**QOrium implications.**

1. **Use this list as the QOrium skill-taxonomy seed.** This 1,229-row enumeration is the right granularity for QOrium's own content tags. Each row should map to a QOrium content category in `07-CTO-Architecture-v1.md` schema — adopt the 16-family × N-sub-skill structure.
2. **MVP must cover ≥600 sub-skills** to be credible against HE/HR — that's about half the full set, biased toward the highest-volume hiring families: Programming Languages (200), Front-end (50), Back-end (50), Mobile (30), Data/ML (60), DevOps (40), Cloud (80), Database (60), Algo & DS (50). Other 6 families can be Phase 2-3.
3. **AI/GenAI family is QOrium's fast-mover opportunity.** Only 35 sub-skills today (vs 271 for languages). Newest, least-leaked. QOrium can lead here by Phase 1 launch — competitive bar is low because the category is young.
4. **Cloud (120 sub-skills) is the highest-leverage breadth play.** Each AWS/Azure/GCP service is a discrete sub-skill. QOrium can ship cloud coverage faster than any rebuild of programming-language depth.
5. **Hackathon-Derived (15 skills) is HE-only.** QOrium cannot match without a hackathon platform. Ignore in roadmap.
6. **Soft/Behavioral (25 skills) is the bridge to Mettl's psychometric world.** HE just opened this surface via AI Interviewer; Mettl owns it via I/O psych. QOrium can sit between via licensed psychometric content.

**Workbook updates this turn.**

Same `HackerRank-Capabilities.xlsx`. Now 19 tabs. Added 1 new tab: **`HE-Skills-Full-List`** — 1,229 sub-skills, family-grouped, with autofilter enabled and frozen header rows. Each row has \#, Family, Sub-skill, Note. Family-summary table at top of tab shows count per family.

---

## Finding \#006 — Codility: I/O psych moat verified, six audit-doc corrections

**Question (CEO).** Audit-doc entry for Codility. CEO shared the existing entry; implicit ask: same treatment — verify, surface corrections, update workbook \+ log in place.

**Six corrections to audit doc.**

1. **Co-founder.** Audit doc names only Greg Jakacki. Codility was co-founded by **Greg (Grzegorz) Jakacki AND Tomasz Walen**. Both names should appear.
2. **Current CEO.** Audit doc silent. Greg Jakacki ran Codility until October 2019, when **Natalia Panowicz** (an original core team member) took over as CEO. Add to entry.
3. **Funding.** Audit doc has no figure. Verified: **$63.9M cumulative** across multiple rounds. Series A was $22.1M (Seedcamp, Kennet Partners, Oxx). Later investors include Cliffbrake, YLD (Sweden), PFR Ventures.
4. **Customer scale.** Audit doc silent. Codility serves **1,600+ clients** — *more* than HackerEarth's 750+. The "smaller library, premium" positioning isn't reflected in customer count.
5. **Products.** Audit doc only references the assessment platform. Codility has **three** product lines: **CodeCheck** (assessments), **CodeLive** (live technical interviews with virtual whiteboard), and **CodeEvent** (campus / hackathon-style events). Add CodeLive \+ CodeEvent to "What they sell."
6. **Pricing claim is partially wrong.** Audit doc says "premium pricing limits SMB reach." Codility Starter is **$1,200/yr** — actually *cheaper* than HackerRank Starter ($1,990/yr). The premium positioning is about brand and science, not entry-tier price. Reword to "Premium positioning limits SMB brand-reach; pricing is competitive at entry tier."

**Verified Codility numbers.**

- HQ: Warsaw (Poland) \+ London (UK), with San Francisco offices — audit-doc verified
- Founded 2009 by Greg Jakacki \+ Tomasz Walen
- Greg Jakacki ran company until Oct 2019; current CEO Natalia Panowicz
- Cumulative funding: $63.9M
- 1,600+ clients
- Industries: Tech, Finance/Banking, eCommerce, Gaming, Fortune 500
- Featured customer: Microsoft (heavily — Codility-style practice tests are public); also AWS, Volkswagen, Netflix, Ericsson per Codility customers page
- 20+ programming languages (curated): Python, JavaScript, C\#, Java 17, PostgreSQL, C++, Ruby, TypeScript, PHP, Kotlin, Go, Dart, Scala, Rust, Swift, Elixir, R, Bash, HTML+CSS — 19 explicitly named with "20+" claim
- Library size: smaller-curated (\~3,000-5,000 tasks estimated; not publicly disclosed BY DESIGN)
- Three products: CodeCheck (assessments), CodeLive (live interviews), CodeEvent (campus / hackathon)
- Test types: Style assessments, Multi-stage, Generative AI assessments, AI-resistant tasks
- Anti-cheat: Proctoring, plagiarism detection, suspicious-behavior flags, test playback, ID verification, AI-resistant task library
- Compliance: ISO 27001 certified; EEOC defensible by design; GDPR
- Pricing: Starter $1,200/yr (120 invites/yr, 1 user); Scale $5,000/yr or $500/mo (25 invites/mo, 3 users); Enterprise custom
- ATS integrations: Greenhouse, Lever, SmartRecruiters, Workable, Teamtailor, SAP SuccessFactors (6+ verified; "9+" claimed)
- Other integrations: Slack, GoodTime, Workato
- G2 rating: 4.4 / 5

**The I/O Psychology moat — verified and substantial.**

- Chief I/O Psychologist position (named role)
- Ph.D. I/O scientists \+ assessment engineers on staff
- Public function: `iopsych@codility.com` (audit-doc claim verified)
- Published peer-reviewed research on structured interviews, predictive validity, bias
- Free white paper: "Codility Guide to Validation"
- Test Validation Service: empirical job-performance correlation, EEOC defensibility, psychometric best practices, bias auditing
- Structured Interview Methodology: job-requirement analysis → custom structured-interview questions \+ scoring rubrics → reliability \+ bias reduction

This is the most defensible scientific positioning in the technical-assessment market. Mettl matches it for non-coding (psychometric/aptitude); Codility owns it for coding. HackerRank and HackerEarth do not have equivalent positions.

**Sources.**

- [Codility — corporate site](https://www.codility.com/)
- [Codility — Product Tour](https://www.codility.com/product-tour/)
- [Codility — Customer Success Stories](https://www.codility.com/company/customers)
- [Codility Support — What technologies does Codility support?](https://support.codility.com/hc/en-us/articles/360043823713-What-technologies-does-Codility-support)
- [Codility Support — Test Validation](https://support.codility.com/hc/en-us/articles/360043317654-Test-Validation)
- [Codility Support — Integrations directory](https://support.codility.com/hc/en-us/categories/360003126893-Integrations)
- [Codility Blog — Bringing I/O Psychology to Tech Hiring](https://www.codility.com/blog/bringing-industrial-organizational-psychology-to-tech-hiring/)
- [Codility Blog — Why we raised a $22M Series A](https://www.codility.com/blog/why-we-raised-a-22m-series-a/)
- [Codility Blog — Codility on ChatGPT and the Future of Technical Assessments](https://www.codility.com/blog/codility-on-chatgpt-and-the-future-of-technical-assessments/)
- [Codility — Pricing](https://www.codility.com/pricing/)
- [Codility — Guide to Validation white paper](https://engage.codility.com/rs/024-OPP-333/images/Codility%20Guide%20to%20Validation.pdf)
- [Crunchbase — Codility profile](https://www.crunchbase.com/organization/codility)
- [Crunchbase — Greg Jakacki person profile](https://www.crunchbase.com/person/greg-jakacki)
- [Tracxn — Codility company profile](https://tracxn.com/d/companies/codility/__VL96w-jP0Q4UqxJA5LyGqH6UgQQHp9Op4kI0a4APyM4)
- [PitchBook — Codility 2026 profile](https://pitchbook.com/profiles/company/58272-67)
- [Craft.co — Codility executive team](https://craft.co/codility/executives)
- [Vendr — Codility pricing](https://www.vendr.com/marketplace/codility)
- [G2 — Codility reviews](https://www.g2.com/products/codility/reviews)
- [HackerRank's own Codility/HR/CodeSignal 2025 comparison](https://www.hackerrank.com/writing/codility-vs-hackerrank-vs-codesignal-2025-enterprise-comparison) (competitor's POV — useful triangulation)

**Source text targeted for revision in `02-Top-20-Competitor-Audit.md`** (existing entry quoted for reference at consolidation):

"HQ Warsaw, Poland \+ London, UK (offices in San Francisco) / Founded 2009 (Greg Jakacki) / Primary buyer Enterprise engineering hiring, Fortune 500 / Library size Smaller (curated), high quality / Differentiator Industrial-Organizational psychology baked into every aspect / Strengths: ... / Weaknesses: Slower content cycle (every question takes weeks of I/O psych validation). Smaller library. **Premium pricing limits SMB reach.**"

Replace with:

"HQ Warsaw (Poland) \+ London (UK), San Francisco offices. Founded 2009 by Greg (Grzegorz) Jakacki \+ Tomasz Walen. Greg Jakacki ran the company through Oct 2019; current CEO Natalia Panowicz (since Oct 2019, original core team member). Independent (privately held); $63.9M cumulative funding (Seedcamp, Kennet Partners, Oxx, Cliffbrake, YLD, PFR Ventures); 1,600+ clients incl. Microsoft, AWS, Volkswagen, Netflix, Ericsson. Library size: smaller curated (\~3,000-5,000 tasks estimated; not publicly disclosed by design). 20+ programming languages (curated, half of HR/HE). Three products: CodeCheck (assessments), CodeLive (live technical interviews), CodeEvent (campus/hackathon). I/O Psychology team: Chief I/O Psychologist \+ Ph.D. I/O scientists \+ [iopsych@codility.com](mailto:iopsych@codility.com) \+ published peer-reviewed research \+ Test Validation Service. Differentiator: Industrial-Organizational psychology baked into every aspect; AI-resistant task library; EEOC defensible. Pricing: Starter $1,200/yr (cheaper than HackerRank Starter), Scale $5,000/yr, Enterprise custom. Strengths: scientific rigor, predictive validity, EEOC defensibility, premium brand. Weaknesses: slower content cycle (validation takes weeks per task), smaller library, premium positioning limits SMB brand-reach (entry pricing is competitive)."

**QOrium implications (full set in workbook tabs `QOrium Implications` rows 30-44 and `Cross-Competitor-Compare` Codility column).**

1. **Audit-doc QOrium-relationship section was correct: PARTNER, don't compete on science.** Frame QOrium as content velocity, Codility as validation rigor — symbiotic, not competitive.
2. **AI-resistant question types are now table stakes, not differentiation.** Both Codility and HackerRank explicitly emphasize AI-resistant tasks. QOrium MUST ship AI-resistant variants from Day 1\.
3. **"Generative AI Assessments" is an emerging category — testing AI-COLLABORATION SKILLS as a metric.** QOrium roadmap should reserve room for AI-collaboration question type by Phase 2-3.
4. **EEOC \+ ISO 27001 \+ structured-interview defense — Codility owns the legal-defensibility positioning.** QOrium should NOT compete here. Cite Codility-style I/O validation \+ IRT scoring \+ ISO 27001 \+ GDPR as enterprise-defensibility table-stakes; partner with Codility/Mettl for the science premium.
5. **Test Validation as a Service is a premium upsell QOrium can offer.** Empirical job-performance correlation studies; partner with Codility OR license 3rd-party I/O psych firms.
6. **Style \+ Multi-stage assessments are matchable.** Style is automatable via SonarQube/PMD/ESLint. Multi-stage is question-architecture, not science. QOrium can match both without rebuilding I/O psych.
7. **Codility's 20+ language curation validates QOrium MVP scope.** A deliberately curated 20+ language list (vs HR/HE's 40+) is positioning, not limitation. QOrium MVP at 20+ languages is on the same defensibility curve.
8. **Slow content velocity \= QOrium's wedge against Codility specifically.** Codility task validation takes weeks per task. QOrium AI-velocity authoring → Codility I/O-validation \= a credible symbiotic partnership pitch (audit-doc thesis verified).
9. **Live-interview tooling: do NOT build.** CodeLive \+ HE FaceCode \+ HR Interviews are converging; QOrium API-only into all three.
10. **Pricing wedge clarified.** Codility Starter $1,200/yr is the price floor for "premium" assessment platforms. QOrium API tier $5k-25k/yr fits *between* Codility Scale ($5k) and Enterprise tier across all four players.

**Workbook updates this turn.**

Same `HackerRank-Capabilities.xlsx`. Now 22 tabs. Added 3 new tabs:

- `Codility-Summary` — 28-row capability summary with 6 audit-doc reconciliations explicitly flagged.
- `Codility-Languages` — 19 explicitly named languages catalogued (with "20+ claim" disclosure).
- `Codility-Capabilities` — full feature/product-line audit (CodeCheck, CodeLive, CodeEvent, I/O Psychology Team, Test Validation Service, AI-resistant library, etc.).

`Cross-Competitor-Compare` now extended to **4-way** (HR vs Mettl vs HE vs Codility) with Codility column inserted and "Who wins" \+ "QOrium gap to attack" columns updated where Codility shifts the analysis.

Extended `QOrium Implications` tab with 15 Codility-specific implication rows.

Workbook is now multi-competitor (4 competitors covered); filename will be reconciled at consolidation per saved feedback memory.

---

## Finding \#007 — CodeSignal: name-history correction, GCF \+ Coding Score verified, six audit-doc updates

**Question (CEO).** Audit-doc entry for CodeSignal. CEO shared the existing entry; implicit ask: same treatment as the previous 4 — verify, surface corrections, update workbook \+ log in place.

**Six corrections to audit doc.**

1. **Name and founding history.** Audit doc says "Founded 2014." Actually: the company **launched in 2014 as CodeFights** (head-to-head coding competitions). It **rebranded to CodeSignal in July 2018** when it launched the Coding Score for developers. Tigran Sloyan's own statement is "co-founded in 2015" (which may reflect formal incorporation). The 2014/2015/2018 ambiguity should be resolved in the audit doc as: *"Founded 2014 as CodeFights; rebranded to CodeSignal July 10, 2018 with launch of Coding Score (200-600)."*
2. **Founders incomplete.** Audit doc names Tigran Sloyan \+ Aram Shatakhtsyan. Actually four co-founders: **Tigran Sloyan (CEO), Aram Shatakhtsyan (CTO), Felix Desroches (former), Sophia Baik (current VP)**.
3. **Talent geography.** Audit doc silent. Notable fact: **\~30% of CodeSignal headcount is based in Armenia** — Sloyan and Shatakhtsyan grew up in Armenia and met at international math/science olympiads. Hybrid US-Armenia model.
4. **Funding.** Audit doc has no figure. Verified: **$90.1M cumulative across 6 rounds**. Major investors: Menlo Ventures, Index Ventures, Felicis Ventures. *Highest-funded of the 5 competitors covered* — more than HE ($21.6M) and Codility ($63.9M).
5. **Products incomplete.** Audit doc mentions assessments \+ interviews. Actual product set has **four lines**: **Pre-Screen** (assessments), **Interview** (live coding), **Develop** (skills development — newer), **Hire** (recruiter umbrella platform).
6. **Pricing detail added.** Audit-doc "premium pricing" is correct in direction — and now quantified: Hire **Build $79/mo** (60 credits/yr), Hire **Grow $479/mo** (420 credits/yr), **Pre-Screen starter kit $19,000/yr**. The Pre-Screen starter is the **most expensive entry tier of all 5 competitors covered** — by a wide margin.

**Verified CodeSignal numbers.**

- HQ: San Francisco, USA — verified
- Original name: CodeFights (2014-2018); rebranded July 10, 2018
- Co-founded by Tigran Sloyan (CEO), Aram Shatakhtsyan (CTO), Felix Desroches (former), Sophia Baik (VP)
- Founder origin: Armenia → Sloyan to MIT, Shatakhtsyan stayed at Yerevan State University
- \~30% of headcount in Armenia
- Cumulative funding: $90.1M across 6 rounds
- Investors: Menlo Ventures, Index Ventures, Felicis Ventures (top-tier VCs)
- Customers (verified): Netflix, Capital One, Meta, Dropbox, Zoom (audit-doc-cited Robinhood \+ Asana plausible but not directly re-verified this session)
- 800,000+ evaluations administered last year
- 45 supported programming languages (between HackerRank's 60+ and HackerEarth's 40+)
- Library size: smaller curated; not publicly disclosed (positioning, not limitation)
- **Coding Score range: 200-600** (verified; cited as "FICO for engineers")
- General Coding Framework (GCF) — verified; Technical Research Paper PDF is public
- GCF skill areas: Basic Coding, Data Manipulation, Ease of Implementation, Problem-Solving
- GCF scoring axes: Correctness \+ Speed \+ Implementation \+ Problem-Solving Ability
- Skills Evaluation Lab — verified internal research arm
- "2,800+ hours of research per framework" — plausible but **NOT independently verified** this session; flag for follow-up if material to QOrium positioning
- Products: Pre-Screen, Interview, Develop, Hire
- Question types: Algorithmic coding, Multi-stage, Certified Frameworks, Project-based, AI-resistant
- Anti-cheat: Keystroke tracking, plagiarism detection, browser monitoring, ID verification, certified assessments (multi-pronged validation)
- ATS integrations: Greenhouse, Workday, Lever, iCIMS, SmartRecruiters, LinkedIn Talent Hub, Ashby (7 verified)
- Compliance (Enterprise tier): SOC 2, ISO 27001, GDPR, custom DPA, SSO/SCIM/JIT, custom security review, audit logs
- G2 rating: 4.5/5 (tied with HackerRank for highest in cohort)
- Notable advisor: William Lansing (CEO of FICO) joined advisory board at 2018 rebrand — explicit "FICO for engineers" positioning play

**Sources.**

- [CodeSignal — corporate site](https://codesignal.com/)
- [CodeSignal — Leadership page](https://codesignal.com/leadership/)
- [CodeSignal — General Coding Framework research papers](https://codesignal.com/resource/general-coding-assessment-framework/)
- [CodeSignal Knowledge Base — supported languages in Interview](https://support.codesignal.com/hc/en-us/articles/360061267734-What-languages-are-supported-in-CodeSignal-Interview)
- [CodeSignal Knowledge Base — GCF Rules and Setup](https://support.codesignal.com/hc/en-us/articles/360051960134-General-Coding-Framework-GCF-Rules-and-Setup)
- [CodeSignal Knowledge Base — Understanding Assessment Score](https://support.codesignal.com/hc/en-us/articles/13408542717079-Understanding-Assessment-Score)
- [CodeSignal Knowledge Base — Supported ATS Integrations](https://support.codesignal.com/hc/en-us/articles/22104744575511-CodeSignal-s-Supported-ATS-Integrations)
- [CodeSignal Knowledge Base — Greenhouse Integration Set-Up](https://support.codesignal.com/hc/en-us/articles/360045011714-Greenhouse-Integration-Set-Up)
- [CodeSignal — Pricing](https://codesignal.com/pricing/)
- [CodeSignal — General Coding Skills Evaluation Framework Technical Research Paper PDF](https://discover.codesignal.com/rs/659-AFH-023/images/General-Coding-Framework-Technical-Research-Paper-CodeSignal.pdf)
- [Wikipedia — CodeSignal](https://en.wikipedia.org/wiki/CodeSignal)
- [TechCrunch — CodeFights becomes CodeSignal (2018)](https://techcrunch.com/2018/07/10/codefights-becomes-codesignal-and-launches-a-new-ratings-system-for-developers/)
- [PR Newswire — CodeFights becomes CodeSignal (2018)](https://www.prnewswire.com/news-releases/codefights-becomes-codesignal-launches-the-coding-score-for-developers-300678041.html)
- [SD Times — CodeFights rebrands to CodeSignal](https://sdtimes.com/softwaredev/codefights-rebrands-to-codesignal-with-new-coding-score-for-developers/)
- [Granatus Ventures — Tigran Sloyan founder story](https://www.granatusventures.com/founder-stories/tigran-sloyan-ceo-codesignal)
- [HR Brew — Starting up with Tigran Sloyan](https://www.hr-brew.com/stories/2022/12/20/starting-up-with-tigran-sloyan)
- [Crunchbase — CodeSignal](https://www.crunchbase.com/organization/codesignal)
- [Tracxn — CodeSignal Founders & Board](https://tracxn.com/d/companies/codesignal/__g0uNINh5JcpllW6wRyS6H5AkdpxVDvq3sf5HWrOUfw8/founders-and-board-of-directors)
- [Vendr — CodeSignal pricing](https://www.vendr.com/marketplace/codesignal)
- [G2 — CodeSignal pricing](https://www.g2.com/products/codesignal/pricing)
- [HackerRank's competitive analysis — CodeSignal pricing jump](https://www.hackerrank.com/writing/codesignal-pricing-jump-how-to-test-real-world-development-skills-affordably)

**Source text targeted for revision in `02-Top-20-Competitor-Audit.md`** (existing entry quoted for reference at consolidation):

"HQ San Francisco, California, USA / Founded 2014 (Tigran Sloyan, Aram Shatakhtsyan) / Primary buyer Enterprise tech (Netflix, Robinhood, Asana cited customers) / Library size Smaller, research-backed / Differentiator 'General Coding Framework' (GCF) — a published, peer-style research methodology"

Replace with:

"HQ San Francisco, California, USA. Founded 2014 as CodeFights; rebranded to CodeSignal July 10, 2018 with launch of Coding Score (200-600). Co-founded by Tigran Sloyan (CEO, MIT), Aram Shatakhtsyan (CTO), Felix Desroches (former), Sophia Baik (VP). \~30% of headcount in Armenia. Independent (privately held); $90.1M cumulative funding across 6 rounds (Menlo Ventures, Index Ventures, Felicis Ventures) — highest-funded of the 5 covered competitors. 800,000+ evaluations administered last year. 45 programming languages. Customers: Netflix, Capital One, Meta, Dropbox, Zoom (verified); audit-doc-cited Robinhood \+ Asana plausible. Library size: smaller curated, research-backed. Differentiator: General Coding Framework (GCF) — published, validated framework with public Technical Research Paper; produces 200-600 Coding Score positioned as 'FICO for engineers' (William Lansing, FICO CEO, on advisory board since 2018 rebrand). Skills Evaluation Lab is the research arm. Products: Pre-Screen (assessments), Interview (live coding), Develop (skills development), Hire (recruiter umbrella). Pricing: Hire Build $79/mo, Hire Grow $479/mo, Pre-Screen starter kit $19,000/yr (most expensive entry tier of the 5), Enterprise custom."

**QOrium implications (full set in workbook tabs `QOrium Implications` rows 45-59 and `Cross-Competitor-Compare` CodeSignal column).**

1. **"FICO for engineers" Coding Score is the core moat.** William Lansing (FICO CEO) on advisory board makes the positioning explicit. QOrium cannot match this network effect — the score becomes industry-standard only because Big Tech anchors it. **QOrium does NOT compete on portable-score positioning.**
2. **'2,800+ hours per framework' claim is plausible but uncited.** If material to QOrium positioning, verify with CodeSignal directly OR remove from QOrium docs.
3. **GCF Technical Research Paper IS verifiable.** Public PDF on discover.codesignal.com — QOrium can cite as exemplar of "research-backed coding framework" in its own marketing.
4. **Big Tech anchor customers (Meta, Netflix, Capital One, Dropbox, Zoom) anchor the Coding Score's industry-standard claim.** QOrium cannot win this segment in Phase 1-2; pursue smaller-segment-first wedges (mid-market, India-domain, non-engineering).
5. **Senior-engineer hiring is CodeSignal's stronghold.** GCF is calibrated for early-career/new-grad; senior hiring uses different frameworks. QOrium senior-eng coverage gap remains; not exploitable vs CodeSignal directly.
6. **AI-resistant \+ multi-stage \+ Certified Frameworks \= mature anti-cheat.** CodeSignal's anti-cheat is research-validated and competitive with HackerRank's 93% accuracy. QOrium MUST match this combo from Day 1\.
7. **Skills Evaluation Lab \+ research paper publication is a content-marketing moat.** QOrium should publish 1-2 research papers in Phase 1 — e.g., "IRT scoring for non-engineering coding" or "India-context skill calibration."
8. **Pricing wedge is now fully clear across all 5 competitors.** Codility Starter $1,200 → HR Starter $1,990 → HR Pro $4,490 → Codility Scale $5,000 → CodeSignal Pre-Screen Starter $19,000 → Enterprise $25k-100k+ across all four. **QOrium API tier $5k-25k/yr lands in the gap between mid-market and enterprise. Solid wedge.**
9. **Talent geography lesson.** CodeSignal's \~30% Armenia model is a hybrid US-offshore template. QOrium India-Armenia comparison (or India-only) should anchor cost story for enterprise pitches.
10. **ATS integration set is high-quality but lighter than HR.** 7 vs HR's 15+. QOrium target list of Greenhouse \+ Workday \+ Ashby \+ Darwinbox covers 4 of CodeSignal's 7 — competitive.

**Workbook updates this turn.**

Same `HackerRank-Capabilities.xlsx`. Now 25 tabs. Added 3 new tabs:

- `CS-Summary` — 35-row capability summary with 6 audit-doc reconciliations explicitly flagged.
- `CS-Languages` — 42 languages catalogued (out of 45 stated total; remaining 3-4 not explicitly named in public KB).
- `CS-Capabilities` — full feature/product-line audit (Pre-Screen, Interview, Develop, Hire, GCF, Coding Score, Skills Evaluation Lab, Certified Assessments, etc.).

`Cross-Competitor-Compare` now extended to **5-way** (HR vs Mettl vs HE vs Codility vs CodeSignal) with CodeSignal column inserted and "Who wins" \+ "QOrium gap to attack" columns updated.

Extended `QOrium Implications` tab with 15 CodeSignal-specific implication rows.

Workbook is now multi-competitor (5 competitors covered); filename will be reconciled at consolidation per saved feedback memory.

---

## Finding \#008 — WeCP: 🔴 ACQUIRED MARCH 2026, audit doc is pre-acquisition \+ library inflation

**Question (CEO).** Audit-doc entry for WeCP (We Create Problems). CEO shared the existing entry; implicit ask: same treatment — verify, surface corrections, update workbook \+ log in place.

**🔴 MAJOR EVENT — audit doc is out of date.**

**On March 10, 2026, Invisible Technologies announced agreement to acquire WeCP.** WeCP becomes part of Invisible's AI-training platform "Meridial" — strategic focus shifts to expert validation for high-precision AI workflows (RL gyms, simulated environments). Founders **Abhishek Kaushik** (CEO, ex-Google) and **Mohit Goyal** (CTO, ex-Meta) join Invisible along with key WeCP team members. WeCP's identity as an independent technical-assessment competitor is ENDING.

This is the most material change among the 6 competitors covered so far. The audit doc was written pre-acquisition and treats WeCP as an active platform competitor \+ potential acquirer of QOrium. Both framings are now obsolete.

**Five corrections to audit doc beyond the acquisition.**

1. **Founder bios incomplete.** Audit doc names Kaushik \+ Goyal but misses: **Kaushik \= ex-Google, Goyal \= ex-Meta**. Both NIT Trichy alumni — verified. Pedigree strengthens the AI-question-generation narrative.
2. **Library size inflation.** Audit doc says "7,000+ skill-sets, 5,000+ job functions." WeCP's own marketing says **2,000+ skills** and **1,000+ pre-built tests**. The audit doc figures are inflated 3.5-5x. The latest March 2026 press release introduces a **new "18,000+ assessment frameworks"** figure which appears to be a different counting methodology (likely sub-frameworks per skill); treat with skepticism.
3. **Question count missing.** Audit doc focuses on skills/job-functions; does not cite **200,000+ questions (0.2M+)** in the question bank. This is the credible scale figure.
4. **Concurrent test capacity.** Notable: **80,000 simultaneous tests** without server crashes — runtime scalability is a genuine differentiator for Indian campus-drive use cases.
5. **Customer list complete.** Audit doc cites Microsoft, Infosys, Mindtree, Robert Bosch, L\&T — all five verified. Notable use case: **Infosys HackWithInfy** \+ Infosys 90% internal-assessment automation.

**Verified WeCP numbers (this session).**

- HQ Bengaluru, India — verified
- Founded 2016 — verified
- Co-founders: Abhishek Kaushik (CEO, ex-Google, NIT Trichy) \+ Mohit Goyal (CTO, ex-Meta, NIT Trichy) — verified
- Funding: 1 round disclosed; specific amount redacted in Tracxn ('$\*\*\*\*'). Lower-funded than HE/Codility/CodeSignal.
- 1,000+ global customers
- 8,000,000+ tests taken cumulatively
- 80,000+ concurrent tests supported
- 200,000+ questions in bank
- 2,000+ skills covered
- 1,000+ pre-built tests / 1,000+ customizable assessments
- 18,000+ assessment frameworks (per March 2026 press release; new metric)
- 2,000,000+ technical interviews delivered (per acquisition press release)
- AI Copilot — generates MCQ \+ programming questions \+ puzzles \+ subjective scoring \+ impersonation detection
- Original positioning (2016-2019): Custom problem-pack sales (audit-doc thesis verified)
- Pivot to platform: 2019 (audit-doc claim — supported by founder interviews; not directly date-verified this session)
- Acquisition by Invisible Technologies: announced March 10, 2026

**Customers verified.** Microsoft, Infosys, Robert Bosch, Mindtree, Larsen & Toubro (L\&T). Notable Infosys use case: HackWithInfy program \+ 90% internal-assessment automation.

**The WeCP origin story validates QOrium's thesis.**

WeCP's 2016-2019 model — selling custom problem packs to companies like Microsoft, Infosys, Mindtree, Robert Bosch, and L\&T — is the EXACT model QOrium is building. The founders' insight was that public practice problems and real hiring questions came from the same source pool, defeating the screen. Companies paid for **unique, never-public** problem packs, not platform access.

WeCP walked away from this model in 2019 to chase platform economics. Now in 2026, they walk away from the technical-assessment market entirely (acquisition).

**This is the strongest validation of QOrium's wedge across all 6 competitors covered:**

- The only company that ever operated in the "question-factory" space *built a real business there*, then *abandoned it to chase platform economics*, then *exited the entire market*.
- The wedge is now empty.
- The customer demand is proven (1,000+ customers, 200K questions, 8M tests).
- Execution feasibility is proven (80K concurrent capacity, AI generation pipeline working, customer-authoring depth).
- The strategic walk-away is proven (twice — first away from content-only, second out of the category entirely).

QOrium positioning becomes simpler post-acquisition: *the question-factory wedge that WeCP validated, then abandoned, then exited.*

**Sources.**

- [WeCP — corporate site](https://www.wecreateproblems.com/)
- [WeCP — About Us](https://www.wecreateproblems.com/company/about)
- [WeCP — Customer Stories](https://www.wecreateproblems.com/customers)
- [WeCP — AI Talent Assessment Platform](https://www.wecreateproblems.com/)
- [WeCP — AI Copilot](https://www.wecreateproblems.com/ai)
- [WeCP — Coding Tests](https://www.wecreateproblems.com/coding-tests)
- [WeCP — Test Library](https://www.wecreateproblems.com/tests)
- [WeCP Help Guides — AI Features](https://help.wecreateproblems.com/en/articles/9254742-ai-features-in-wecp)
- [BusinessWire — Invisible Technologies Agrees to Acquire WeCP (March 10, 2026\)](https://www.businesswire.com/news/home/20260310738939/en/Invisible-Technologies-Agrees-to-Acquire-WeCP-to-Strengthen-Expert-Validation-for-High-Precision-AI-Workflows)
- [Invisible Technologies — Newsroom: Invisible acquires WeCP](https://invisibletech.ai/newsroom/invisible-acquires-wecp)
- [Yahoo Finance — Invisible Technologies acquires WeCP](https://finance.yahoo.com/news/invisible-technologies-agrees-acquire-wecp-130300258.html)
- [Pulse2 — Invisible Technologies acquires WeCP](https://pulse2.com/invisible-technologies-acquires-wecp-to-strengthen-expert-validation-for-ai-workflows/)
- [Business Standard — WeCP unique way of evaluating technical skills](https://www.business-standard.com/content/press-releases-ani/we-create-problems-has-this-unique-way-of-evaluating-technical-skills-121020101599_1.html)
- [Crunchbase — WeCP company profile](https://www.crunchbase.com/organization/we-create-problems)
- [Crunchbase — Abhishek Kaushik person profile](https://www.crunchbase.com/person/abhishek-kaushik-a618)
- [Tracxn — WeCP company profile](https://tracxn.com/d/companies/wecp/__OkrpAYL9KLq6jXnR0h7dn_zJisOrewuviLpg18kmg3Y)
- [YourStory — WeCP company profile](https://yourstory.com/companies/wecp-we-create-problems)
- [Granatus Ventures — Tigran Sloyan founder story (compare cohort)](https://www.granatusventures.com/founder-stories/tigran-sloyan-ceo-codesignal)
- [Software Suggest — WeCP review](https://www.softwaresuggest.com/wecp-skill-assessment)

**Source text targeted for revision in `02-Top-20-Competitor-Audit.md`** (existing entry quoted for reference at consolidation):

"HQ Bengaluru, India / Founded 2016 (Abhishek Kaushik, Mohit Goyal — both NIT Trichy alumni) / Primary buyer Enterprise engineering hiring, Indian IT services & GCCs / Library size **7,000+ skill-sets, 5,000+ job functions** / Origin story Started as a question-selling business, pivoted to platform 2019..."

Replace with:

"🔴 ACQUIRED — On March 10, 2026, Invisible Technologies announced agreement to acquire WeCP. WeCP becomes part of Invisible's Meridial AI-training platform; founders Kaushik \+ Goyal join Invisible. Standalone hiring-assessment offering ENDS. **HQ Bengaluru, India. Founded 2016 by Abhishek Kaushik (CEO, ex-Google, NIT Trichy) \+ Mohit Goyal (CTO, ex-Meta, NIT Trichy). Primary buyer (pre-acquisition): Indian IT services \+ GCCs \+ engineering hiring. Library: 200,000+ questions across 2,000+ skills, 1,000+ pre-built tests, 18,000+ assessment frameworks (per March 2026 press release), 8M+ tests delivered, 2M+ technical interviews. Concurrent capacity 80,000+ tests. 1,000+ customers including Microsoft, Infosys (HackWithInfy \+ 90% assessment automation), Robert Bosch, Mindtree, Larsen & Toubro. Origin story: 2016-2019 sold custom problem packs to enterprises (the exact 'question-factory' model QOrium is building); pivoted to platform 2019; acquired and exited market 2026\.**"

**QOrium implications (full set in workbook tabs `QOrium Implications` rows 60-71 and `Cross-Competitor-Compare` WeCP column).**

1. **The audit-doc QOrium-relationship section is OBSOLETE.** WeCP is no longer a competitive threat (exiting market), no longer a potential acquirer (already acquired), and the "could pivot back" risk is permanently foreclosed. **The entire QOrium-relationship section needs rewriting.**
2. **The question-factory wedge is now PROVEN ABANDONED.** WeCP validated the model (1,000+ customers, 200K questions, 8M tests), abandoned it for platform economics in 2019, and exited the entire category in 2026\. QOrium's permission slip is the strongest of any competitor analysis.
3. **AI-native question generation is the cohort's bar.** WeCP set it. QOrium's AI generation must match WeCP's pre-acquisition standard (MCQ \+ programming \+ subjective scoring \+ impersonation detection).
4. **Indian customer logos are potentially up-for-grabs.** Microsoft, Infosys, Robert Bosch, Mindtree, L\&T were WeCP customers. Post-acquisition, vendor-rationalization decisions in 2026 may open the window. Target list for QOrium India go-to-market.
5. **Customer-authoring as enterprise upsell is validated.** WeCP's deep customer-authoring (its DNA) shows enterprise willingness to pay for tools that extend platform content. Design QOrium's authoring tools to that bar.
6. **80,000 concurrent capacity is the Indian campus-drive bar.** QOrium India infrastructure must support similar concurrency from Day 1 if pursuing campus segment.
7. **'18,000+ frameworks' may be acquisition-narrative inflation.** Use conservative WeCP marketing numbers (1K-2K tests range, 200K questions) as benchmark, not the press-release figure.
8. **Founders' career arc validates the category.** Kaushik (Google) → WeCP → Invisible (AI-training). Goyal (Meta) → WeCP → Invisible. The fact that a Google \+ Meta founder pair is now building expert-validation infrastructure for AI training adjacency-confirms QOrium's bet that AI-driven question generation is real, not hype.
9. **Adjacent opportunity surfaced.** Invisible bought WeCP specifically for AI-training expert validation. QOrium content could have similar AI-training applications. Future Phase-3 revenue stream worth tracking — *parallel* to hiring assessment, not instead of.

**Workbook updates this turn.**

Same `HackerRank-Capabilities.xlsx`. Now 28 tabs. Added 3 new tabs:

- `WeCP-Summary` — 30+ row summary with 🔴 ALERT BANNER about the March 2026 acquisition prominently flagged, plus 5 audit-doc reconciliations.
- `WeCP-Capabilities` — full feature/product audit with explicit pre-acquisition vs post-acquisition framing.
- `WeCP-Customers` — focused customer-concentration tab (Microsoft, Infosys, Robert Bosch, Mindtree, L\&T).

`Cross-Competitor-Compare` extended to **6-way** (HR vs Mettl vs HE vs Codility vs CodeSignal vs WeCP) with WeCP column inserted (header marked "WeCP — acquired Mar 2026"). "Who wins" \+ "QOrium gap to attack" columns updated where WeCP exit changes the analysis.

Extended `QOrium Implications` tab with 12 WeCP-specific implication rows.

Workbook is now multi-competitor (6 competitors covered, with WeCP flagged as exiting); filename will be reconciled at consolidation per saved feedback memory.

---

## Finding \#009 — DevSkiller: capital-efficient operator, RealLifeTesting verified, six audit-doc updates

**Question (CEO).** Audit-doc entry for DevSkiller. CEO shared the existing entry; implicit ask: same treatment — verify, surface corrections, update workbook \+ log in place.

**Six corrections to audit doc.**

1. **Founders missing.** Audit doc names no founders. Three co-founders: **Jakub Kubrynski (CEO), Marek Kaluzny, Mariusz Smykula**. Kubrynski conceived DevSkiller while at **Allegro Group** (Polish e-commerce giant) — 80% of his interview time was wasted screening unsuitable candidates.
2. **Founding history.** Audit doc says 2014\. Actually: **founded 2013** as a software-development services house; **first product (TalentScore) launched 2016**. The "2014" figure is approximate; reflect both dates for accuracy.
3. **Funding.** Audit doc has no figure. Verified **$2.4M cumulative**: Angel €462.9K (2017) \+ Seed $1.09M (April 2020, SpeedUp Energy Innovation) \+ Series A $1.31M (August 31, 2023, Movens Capital). **Most capital-efficient operator in the cohort** — significantly less raised than HE ($21.6M), Codility ($63.9M), or CodeSignal ($90.1M).
4. **Products incomplete.** Audit doc references RealLifeTesting only. Actual product set: **TalentScore** (assessments), **TalentBoost** (talent management — *unique* in the cohort), **CodePair** (live coding interviews — note: name overlaps with CoderPad, a separate competitor).
5. **Library specifics missing.** Verified: **5,000+ tasks**, **500+ ready-to-use tests**, **200+ tech skills**, **60+ programming languages, frameworks, libraries**. The 60+ language number is competitive with HackerRank's 60+ — built on roughly 1/40th the funding.
6. **Customer logos & geo.** Verified: **PayPal**, **Deloitte**; clients in **85+ countries**. Audit doc cites no specific customers — add.

**Brand flag.** DevSkiller appears to also operate **skillpanel.com** as either a rebranded marketing site or sub-brand. About-Us pages between devskiller.com and skillpanel.com overlap. If QOrium pursues partnership conversations, confirm naming.

**Verified DevSkiller numbers (this session).**

- HQ Warsaw, Poland — verified
- Founded 2013 as software house; product TalentScore launched 2016
- Co-founders: Jakub Kubrynski (CEO, ex-Allegro Group), Marek Kaluzny, Mariusz Smykula
- Attended Ellis Accelerator NYC, Fall 2019
- Independent (privately held)
- Cumulative funding: **$2.4M** — most capital-efficient of the 7 covered competitors
- Investors: SpeedUp Energy Innovation, Movens Capital, plus angels
- 85+ countries served
- Featured customers: PayPal, Deloitte
- 5,000+ tasks / 500+ ready-to-use tests
- 200+ tech skills tested
- 60+ programming languages, frameworks, libraries
- Most-tested languages on platform: Java, JavaScript, SQL
- Three products: **TalentScore** (assessments), **TalentBoost** (talent management with 4,000+ predefined skills, 500+ skill groups, multi-dimensional career pathing), **CodePair** (live coding interviews)
- Differentiator: **RealLifeTesting** methodology — three pillars (holistic testing \+ real-world conditions \+ assessing entire technology ecosystem). Candidates clone a Git repo and solve realistic feature/bug tasks **locally with their own tools** — closest-to-real-work fidelity in the cohort.
- IDE tier: Simple IDE for junior candidates \+ sophisticated VSCode-based in-browser editor for senior
- Anti-cheat: Anti-leak by design (RealLifeTesting structure) \+ standard plagiarism \+ standard proctoring
- ATS integrations: Greenhouse, Lever, Workable, JazzHR, LinkedIn Talent Hub, Slack, Zapier (7 verified)
- Pricing: TalentScore $499/month billed annually OR $3,600/yr; TalentBoost $12/user billed annually; Enterprise (Skills Mgmt \+ Assessment) $5,000/month billed annually

**Sources.**

- [DevSkiller — TalentScore product page](https://devskiller.com/talentscore/)
- [DevSkiller — TalentBoost product page](https://devskiller.com/talentboost/)
- [DevSkiller — Technical interview](https://devskiller.com/technical-interview/)
- [SkillPanel — Technical Assessments](https://skillpanel.com/technical-assessments/)
- [SkillPanel — RealLifeTesting methodology](https://skillpanel.com/reallifetesting/)
- [SkillPanel — About Us](https://skillpanel.com/about-us/)
- [SkillPanel — Pricing](https://skillpanel.com/pricing/)
- [DevSkiller blog — Forbes feature on origin story](https://devskiller.com/blog/devskiller-discovering-hidden-potential/)
- [DevSkiller blog — Tech recruitment trends data](https://devskiller.com/blog/tech-recruitment-trends/)
- [Q\&A with Jakub Kubrynski — Techni Ventures Medium](https://medium.com/@TechniVentures/q-a-with-jakub-kubrynski-ceo-co-founder-of-devskiller-7ff182afc8b4)
- [EU-Startups — DevSkiller raises €1M (April 2020\)](https://www.eu-startups.com/2020/04/devskiller-snaps-up-e1-million-to-help-companies-hire-top-tech-talent/)
- [Tech.eu — DevSkiller bridge funding (April 2020\)](https://tech.eu/2020/04/03/devskiller-bridge-funding/)
- [AIN — DevSkiller €1.2M from Movens Capital (Aug 2023\)](https://en.ain.ua/2023/08/31/polish-devskiller-raises-1-2m-movens-capital/)
- [Recruitmenttech — DevSkiller €1M raise](https://www.recruitmenttech.com/polish-startup-devskiller-raises-e1-million-in-funding-for-their-saas-platform-the-next-natural-step/)
- [Crunchbase — Jakub Kubrynski](https://www.crunchbase.com/person/jakub-kubrynski)
- [Tracxn — DevSkiller company profile](https://tracxn.com/d/companies/devskiller/__HJVimth99LQTi5ScIH2wWWNHBXNw-iFQxgWMEHUmJ6w)
- [Workable Help — Integrating with DevSkiller](https://help.workable.com/hc/en-us/articles/360023017874-Integrating-with-Devskiller)
- [Capterra — SkillPanel/DevSkiller](https://www.capterra.com/p/147881/Devskiller/)
- [SoftwareSuggest — DevSkiller](https://www.softwaresuggest.com/devskiller)

**Source text targeted for revision in `02-Top-20-Competitor-Audit.md`** (existing entry quoted for reference at consolidation):

"HQ Warsaw, Poland / Founded 2014 / Primary buyer Engineering teams hiring for backend, frontend, DevOps roles / Library size Mid-size, focus on real-codebase tasks / Differentiator 'RealLifeTesting' methodology — candidates work on a pre-configured codebase / What they sell. Technical screening using real codebase challenges..."

Replace with:

"HQ Warsaw, Poland. Founded 2013 as software house; first product (TalentScore) launched 2016\. Co-founders: Jakub Kubrynski (CEO, ex-Allegro Group), Marek Kaluzny, Mariusz Smykula. Independent (privately held); $2.4M cumulative funding (SpeedUp Energy Innovation Seed 2020 \+ Movens Capital Series A 2023\) — most capital-efficient operator in cohort. Customers from 85+ countries including PayPal, Deloitte. Library: 5,000+ tasks, 500+ ready-to-use tests, 200+ tech skills, 60+ programming languages/frameworks/libraries (most-tested: Java, JavaScript, SQL). Three products: **TalentScore** (assessments), **TalentBoost** (talent-management arm with 4,000+ predefined skills \+ career pathing — UNIQUE in cohort), **CodePair** (live coding interviews; name overlaps with separate competitor CoderPad). Differentiator: **RealLifeTesting™** — three pillars (holistic testing \+ real-world conditions \+ assessing entire tech ecosystem); candidates clone a Git repo and solve locally using their own tools. ATS integrations: Greenhouse, Lever, Workable, JazzHR, LinkedIn Talent Hub, Slack, Zapier. Pricing: TalentScore $499/mo or $3,600/yr; TalentBoost $12/user; Enterprise $5,000/mo. Strengths: anti-leak by design, high signal for senior roles, capital-efficient operator. Weaknesses: each task expensive to author (full codebase \+ tests \+ rubric), slow library refresh, less suitable for high-volume entry-level screening."

**QOrium implications (full set in workbook tabs `QOrium Implications` rows 72-84 and `Cross-Competitor-Compare` DevSkiller column).**

1. **Audit-doc partnership thesis is fully verified.** DevSkiller's per-task authoring cost (full codebase \+ tests \+ rubric) is genuinely high; their library refresh is slow. QOrium's AI-assisted task generation pipeline directly addresses their bottleneck. **Pursue this partnership early in QOrium's GTM.**
2. **TalentBoost is a unique upsell pattern — talent management arm.** 4,000+ predefined skills \+ 500+ skill groups \+ career pathing is *not* offered by Codility/CodeSignal/HR/HE/Mettl/WeCP. QOrium roadmap should consider a parallel skills-management product line by Phase 3 — DevSkiller validates the upsell exists.
3. **Capital-efficiency signal — $2.4M total.** Built 60+ language coverage and 5,000+ tasks on bootstrap-adjacent funding. **QOrium should NOT assume VC-fueled rivals will outspend us into oblivion** — operators like DevSkiller compete effectively at modest spend. This is a useful counter-narrative when QOrium fundraises.
4. **RealLifeTesting is the strongest anti-leak moat in the cohort.** Task fidelity defeats memorization structurally — better than HR/HE library rotation, better than Codility/CodeSignal validation cycles. QOrium can incorporate the methodology into product design while differentiating on AI-velocity authoring.
5. **AI-assisted task generation \= direct partnership opportunity.** DevSkiller's slow library refresh is QOrium's wedge: AI-velocity authoring \+ DevSkiller-style RealLifeTesting structure \= symbiotic. Likely the easiest enterprise partnership conversation of the 7 competitors covered.
6. **Pricing wedge clarified.** DevSkiller TalentScore at $499/month sits below HR Pro, above Codility Scale; Enterprise $5,000/month is mid-cohort. **QOrium API tier $5k-25k/yr lands cleanly below DevSkiller TalentScore on entry and well below all Enterprise tiers.**
7. **Indian-market gap \= QOrium opportunity.** DevSkiller customers are international (85 countries) but India presence is less visible than Mettl/WeCP/HE. QOrium India-strategy doesn't conflict with DevSkiller's geo focus — clean partnership space.
8. **SkillPanel.com branding flag.** DevSkiller appears to also operate skillpanel.com. Confirm naming if QOrium pursues partnership conversations; this might affect outreach.
9. **CodePair name flag.** DevSkiller's live-interview product is "CodePair" — easily confused with **CoderPad** (separate, well-known competitor). Use "DevSkiller CodePair" in QOrium docs to avoid confusion. Also: CoderPad is worth queueing as a future audit entry — they're a major live-interview competitor not in the audit doc's first six.
10. **Most-tested languages signal (Java, JS, SQL).** Same top-3 as industry-wide hiring volume. Validates that QOrium MVP coverage of these three is non-negotiable.

**Workbook updates this turn.**

Same `HackerRank-Capabilities.xlsx`. Now 30 tabs. Added 2 new tabs:

- `DS-Summary` — 30-row capability summary with 6 audit-doc reconciliations explicitly flagged.
- `DS-Capabilities` — full feature/product audit including TalentScore, TalentBoost, CodePair, RealLifeTesting three pillars, IDE tiers, anti-leak architecture, etc.

`Cross-Competitor-Compare` extended to **7-way** (HR vs Mettl vs HE vs Codility vs CodeSignal vs WeCP vs DevSkiller) with DevSkiller column inserted. "Who wins" \+ "QOrium gap to attack" columns updated where DevSkiller shifts the analysis.

Extended `QOrium Implications` tab with 13 DevSkiller-specific implication rows.

Workbook is now multi-competitor (7 competitors covered, with WeCP flagged as exiting); filename will be reconciled at consolidation per saved feedback memory.

---

## Finding \#010 — Remaining 13 competitors (CoderPad/CodinGame, Karat, Byteboard, iMocha, Xobin, HirePro, Talview-cluster, Adaface, Vervoe, SHL, Talogy, Glider AI, Testlify-cluster)

**Question (CEO).** "Now continue with the remaining And Create a Final Copy of Capabilities and Competitive Research."

**Approach (per consolidation directive).** Single combined log entry capturing the remaining 13 competitors at moderate depth (vs the deep-dive on the first 7). Per-competitor full data is in dedicated workbook tabs. The Final Consolidation Doc (`08-Competitive-Capabilities-Consolidated-Final.md/.docx`) synthesizes all 20 competitors into concrete edits and strategic conclusions.

**Audit-doc surface — three additional MAJOR findings.**

1. **Byteboard ACQUIRED by Karat — January 16, 2025\.** Audit doc treats Byteboard as standalone Google Area 120 spin-out. As of January 2025, Byteboard is part of Karat (Karat's third acquisition in two years, after Triplebyte March 2023 and AspectAI). Audit-doc partnership thesis for Byteboard is now moot — pursue via Karat.
2. **CoderPad acquired CodinGame — October 13, 2021** (NOT 2022 as audit doc says). Minor date correction.
3. **Talogy ≠ IBM Kenexa.** Audit doc says Talogy \= "Cubiks \+ PSI Services \+ IBM Kenexa." This is factually wrong. Talogy is the rebrand of PSI Talent Management (2022) including Cubiks \+ 16 other acquired organizations: Caliper, JCA Global, Performance Assessment Network, Select International, EB Jacobs, IPAT, Ottmann, Human Scope, Performance Based Selection, a\&dc, Innovative HR Solutions, OPRA, Human Systems Technology, Propel, Solvably. **IBM Kenexa remains part of IBM** (acquired by IBM in 2012); Talogy works with Kenexa as ATS integration partner only.

**Key verified data per competitor (full per-competitor data in dedicated workbook tabs).**

| \# | Competitor | Founded | Cumulative Funding | Library | Key Verification |
| :---- | :---- | :---- | :---- | :---- | :---- |
| 8 | CoderPad / CodinGame | 2013 / 2014 (acquired Oct 13, 2021\) | Backed by Summit Partners | 2M-dev community \+ 90+ roles | Customers: Nasdaq, EA, Samsung, Meta |
| 9 | Karat | 2014 | $248M (unicorn at $1.1B) | Internal multi-product (Karat \+ Triplebyte \+ Byteboard \+ AspectAI) | Customers: Walmart, Roblox, Indeed, MuleSoft, Intuit, Pinterest. 8 enterprise clients $1M+/yr. Top Interview Engineers earn \~$250K/yr. |
| 10 | Byteboard | 2019 (Google Area 120\) | Seed $5M (Jan 2022\) — pre-acquisition | Curated project-based scenarios | 🔴 ACQUIRED by Karat Jan 16, 2025 |
| 11 | iMocha | 2015 | Multiple rounds (Mudhal VC, Eight Roads, RevUp, Ringbolt, Seeders \+ 6 more) | 2,500+ skills / 35+ langs / 10K+ tests | 300+ customers incl. 15 F500: Fujitsu, Ericsson, Capgemini, Deloitte, PayPal, UNICEF, Tata Advanced, Vanguard, BRAC. Microsoft Azure partnership for AI-EnglishPro. |
| 12 | Xobin | 2013 | Not disclosed | 800+ assessments \+ 1.2 lakh (120K) Q | 1,000+ companies, 5,000+ recruiters, 55+ countries. AI Evaluate generative grading. |
| 13 | HirePro | 2004 | Not disclosed | Massive internal IT-services library (22-year history) | Customers: TCS, Wipro, Infosys, Cognizant, HCL. Campus drives 50K-500K candidates. |
| 14 | Talview cluster (Talview / Speedexam / SkillRobo) | 2010s | Talview $22.5M (5 rounds, 32 investors) | Talview: 10M+ candidates assessed across 120+ countries | Talview AI products: Alvy (AI proctor) \+ Ivy (Agentic AI interviewer). Customers: HCLTech, AAAE, La Trobe, Cambridge. |
| 15 | Adaface | 2018 | Not disclosed | 10,273 non-googleable Q \+ 500+ tests for 500+ roles | Singapore Government anchor customer. SAP.iO Foundry Singapore 2019 cohort. Web crawlers \+ 24-hour rotation for anti-leak. |
| 16 | Vervoe | 2016 | Multiple rounds | 300,000+ verified Q \+ 300+ templates \+ 10 question types | LARGEST stated question bank in cohort. 4.94/5 G2 (highest in cohort). Three-model AI grading (How/What/Preference) with \~20 calibration grades. |
| 17 | SHL | 1977 | Roll-up history | Decades-deep psychometric (narrow on coding) | 10,000+ orgs incl. FTSE 100, Big 4, F500, government, military. OPQ in 37 languages. Verify Numerical £26/candidate, min admin £240. Partners with HackerRank/Codility for technical content. |
| 18 | Talogy | 1977 (PSI heritage); 2022 rebrand | Roll-up | Deep psychometric (narrow on coding) | 17-organization roll-up; 600 experts, 20+ countries, 10K+ orgs. **NOT including IBM Kenexa (audit doc error).** |
| 19 | Glider AI | 2014 | Multiple rounds | 500+ skills (AI-first) | DIRECT positioning competitor for QOrium AI-generation pitch. Customers: Intuit, PwC, Amazon, Capital One, FINRA. Pricing $299/mo+. G2 top 50 AI software 2024\. |
| 20 | Testlify cluster (Testlify/Toggl Hire/Canditech/eSkill/IKM) | 2017-2022 | Smaller | Testlify 1,800+ tests; Toggl 15K Q; rest various | Testlify: 1,500+ teams, 50K+ recruiters, 5M+ candidates, $99-$699/mo credit-based. Toggl Hire (Tallinn 2017\) skills-test focused. Canditech (Israel) work-sample \+ ChatGPT detection. eSkill US legacy. IKM US legacy MCQ-only — what NOT to be in 2026\. |

**Sources (representative).**

- [CoderPad press — acquires CodinGame Oct 2021](https://coderpad.io/press-releases/coderpad-acquires-codingame/)
- [GeekWire — Karat acquires Byteboard (January 2025\)](https://www.geekwire.com/2025/technical-recruiting-startup-karat-makes-third-acquisition-swooping-up-byteboard/)
- [TechCrunch — Karat raises $110M Series C 2021](https://techcrunch.com/2021/10/13/karat-raises-110m-on-a-1-1b-valuation-to-grow-its-technical-interviewing-as-a-service-platform/)
- [TechCrunch — Karat acquires Triplebyte 2023](https://techcrunch.com/2023/03/16/technical-recruitment-platform-karat-snaps-up-triplebyte-to-add-ai-based-quizzes-for-engineers/)
- [iMocha — AI-EnglishPro Microsoft partnership](https://www.imocha.io/press-releases/imocha-partners-with-microsoft-to-launch-ai-english-pro-tool)
- [HirePro corporate](https://hirepro.in/)
- [Talview corporate (Alvy \+ Ivy AI products)](https://www.talview.com/en/)
- [Adaface — Singapore Government case study](https://www.adaface.com/case-studies/singapore-government)
- [Vervoe — Job Simulations](https://vervoe.com/job-simulation/)
- [SHL OPQ product page](https://www.shl.com/products/assessments/personality-assessment/shl-occupational-personality-questionnaire-opq/)
- [Talogy press — rebrand from PSI 2022](https://www.prnewswire.com/il/news-releases/talogy-revealed-as-new-identity-for-psi-talent-management-and-all-of-its-acquisitions-803856317.html)
- [Glider AI corporate](https://www.glider.ai/)
- [Testlify corporate](https://testlify.com/)

**QOrium implications (consolidated — full set in `08-Competitive-Capabilities-Consolidated-Final.md`).**

1. **Karat is the new technical-interviewing consolidator.** With Byteboard, Triplebyte, AspectAI all under one roof, Karat is the most consolidated multi-product competitor. QOrium relationship \= content-partner pitch should now address all four product surfaces.
2. **Glider AI is QOrium's closest direct positioning competitor.** "AI-generated content vs slow in-house teams" is their pitch. QOrium differentiates with "AI-authored \+ I/O psych validated content for ANY platform" — they are pure-play AI-only platform.
3. **Vervoe's 300K library \+ AI-grading is the highest-volume content play in the cohort.** Quality varies but library volume sets a benchmark. QOrium positions as "calibrated upgrade" over volume.
4. **Adaface's anti-leak operationalization is the only continuous-engineering implementation in the cohort.** Web-crawlers \+ 24-hour rotation is the bar for anti-leak. QOrium can match or exceed.
5. **SHL \+ Talogy \+ IBM Kenexa pattern: psychometric-deep, technical-shallow.** All three partner externally (HackerRank, Codility) for technical content. Direct partnership opportunity for QOrium India-stack technical content.
6. **HirePro's 22-year India IT-services dominance is hard to displace.** TCS/Wipro/Infosys campus drives are HirePro's home turf. QOrium goes adjacent (mid-market, GCC, non-engineering domains) rather than head-on.
7. **Testlify cluster \+ Talview cluster \+ Xobin \= 'first 50 logos' play.** Self-serve API tier targeted at content-starved mid-market platforms is the easiest QOrium GTM motion.

**Workbook updates this turn.**

Same `HackerRank-Capabilities.xlsx`. Now **44 tabs** total (up from 30). Added 13 new competitor tabs (one per competitor or cluster). Plus a new **`All-20-Quick-View`** tab — single-table compact view of all 20 competitors with founding year, funding, library, status, and QOrium relationship.

Workbook `Cross-Competitor-Compare` tab remains 7-way (HR vs Mettl vs HE vs Codility vs CodeSignal vs WeCP vs DevSkiller) — the 7 deepest profiles. Adding the remaining 13 to that tab would make the matrix unwieldy; the `All-20-Quick-View` tab serves as the single-table view of all 20 instead.

`QOrium Implications` tab kept as growing canonical implication set; no further additions this turn since the consolidation doc supersedes.

---

**Research log status: All 20 audit-doc competitors covered.** Next deliverable: `08-Competitive-Capabilities-Consolidated-Final.md` (and `.docx`) — the comprehensive consolidation document.
