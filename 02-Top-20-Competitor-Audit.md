# QOrium — Document 2 of 4
# The Top 20 Global Assessment Platforms — Profiles, Question-Creation Models & Strategic Posture

**Prepared for:** Bhaskar Anand, CEO, Talpro Universe
**Date:** May 1, 2026
**Status:** Draft v1.0

---

## Reading Guide

For each of the 20 platforms below, this document covers:

1. **Snapshot** — HQ, founding year, primary buyer, library size
2. **What they sell** — Core product offering
3. **How they create questions** — Authoring model (in-house team, AI, crowdsource, hybrid)
4. **Question-bank size & coverage** — What's in the library
5. **Strengths & weaknesses** — What they're good at, where the gap is
6. **QOrium relationship** — Customer, competitor, or partner

The profiles are grouped into four tiers:

- **Tier 1** — Global category leaders (5 platforms)
- **Tier 2** — Specialist coding/technical platforms (5 platforms)
- **Tier 3** — India-strong platforms (5 platforms)
- **Tier 4** — Emerging AI / niche / next-gen (5 platforms)

---

# TIER 1 — Global Category Leaders

These are the platforms that dominate global mind-share, set the pricing benchmarks, and have the largest enterprise install bases. They are QOrium's most strategic API customers (highest LTV) but also the highest sales-cycle friction.

---

## 1. HackerRank

| | |
|---|---|
| **HQ** | Mountain View, California, USA |
| **Founded** | 2009 (Vivek Ravisankar, Hari Karunanidhi) |
| **Primary buyer** | Engineering hiring teams at mid-to-large tech companies |
| **Library size** | ~1,000 curated coding challenges + 26M-developer community-contributed practice problems |
| **G2 rating** | 4.5 / 5 |
| **Market share (Pre-employment Assessment)** | ~3.5% |

**What they sell.** Coding-skills assessments, technical screens, AI-augmented interviewing (HackerRank for Work + HackerRank Interviews). Their flagship is the role-specific coding test bundled with a developer-friendly IDE.

**How they create questions.** A hybrid in-house + community model:

- **In-house content team** — Engineers turned content engineers, supported by a documented question-creation workflow. Each question is required to include a problem name, structured problem description, sample I/O, hidden test cases, scoring rubric, and a documented reference solution. Public support docs walk customers through the same workflow when authoring custom company-specific questions.
- **Community contribution** — The 26M-developer practice-problem corpus is largely community-contributed and used for developer engagement, not directly for hiring assessments.
- **Customer authoring** — Enterprises increasingly author their own questions (using HackerRank's tools) to defeat leakage.

**Strengths.** Brand recognition, dev community network effects, polished IDE, deep integrations (ATS, Greenhouse, Workday).

**Weaknesses.** Library is finite and famously leaked. Customer-authored questions are common precisely because the public library is burned. Pricing is premium ($25K–$200K/year) which leaves the mid-market under-served.

**QOrium relationship.** **API customer (Tier 1 target).** Their content team is overstretched and customer-author tools are an admission of library decay. A QOrium API offering "5,000 fresh, calibrated, never-leaked questions" is a credible cost-saving + signal-quality pitch.

---

## 2. Mercer Mettl (now Mercer | Mettl)

| | |
|---|---|
| **HQ** | Gurgaon, India (acquired by Mercer 2018) |
| **Founded** | 2010 (Ketan Kapoor, Tonmoy Shingal) |
| **Primary buyer** | Enterprise HR (psychometric + technical), university certification, government exams |
| **Library size** | "One of the most advanced and extensive" — estimated 100,000+ questions across 800+ tests |
| **Coverage** | Psychometric, aptitude, coding, domain (BFSI, IT, sales), language |

**What they sell.** Full-spectrum assessment platform — psychometric tests, aptitude, technical coding, domain-skills, certification exams. Also runs proctored online certification (Mettl is a major provider for many Indian university and government certification exams).

**How they create questions.** **The Mettl model is the gold standard for hybrid in-house authoring + I/O psychology validation:**

- **In-house team of industrial-organizational (I/O) psychologists, psychometricians, and data scientists** — Their content team is explicitly structured around scientific test development (a rare investment in the assessment space).
- **Item Response Theory (IRT) calibration** — Mettl explicitly applies IRT, which weights candidate scores by both correctness and the statistical difficulty of each item, derived from the empirical distribution of pass rates across thousands of test-takers.
- **Customer-authored content** — Bulk-upload and authoring tools for coding, MCQ, whiteboard questions are exposed to the customer.

**Strengths.** Largest library in India, scientific test development, government-grade proctoring, multi-language. Strong moat in psychometric science.

**Weaknesses.** Quality is inconsistent at scale (the size is also the weakness — not every question gets the same I/O psych treatment). Coding-track depth is weaker than HackerRank/Codility. UX dated relative to newer entrants.

**QOrium relationship.** **API + white-label content partner (Tier 1 target).** Mettl needs continuous library refresh; their I/O psych team is bandwidth-constrained. QOrium's calibrated content API + India-stack-specialization (SAP, Oracle, BFSI) directly maps to their gap.

---

## 3. HackerEarth

| | |
|---|---|
| **HQ** | Bengaluru, India (US offices, sold to Talview-backed group, originally founded 2012 by Sachin Gupta & Vivek Prakash) |
| **Founded** | 2012 |
| **Primary buyer** | GCC enterprises, mid-large tech, hackathon organizers |
| **Library size** | **40,000+ problems**, 1,000+ skills, 40+ programming languages |
| **Differentiator** | Hackathons-as-recruiting + intelligence-backed question engine |

**What they sell.** Coding assessments, technical screening, hackathon platform (a major source of pipeline for many GCCs). Recently leaning into AI-powered interviewing.

**How they create questions.** A combination of in-house authoring, hackathon-derived content (problems written by HE engineers and used in public competitions), and a documented customer-authoring workflow that supports custom libraries with manual or auto-evaluated test cases.

**Strengths.** Largest publicly-stated library (40K+), hackathon-derived problem freshness, strong India + GCC enterprise penetration, depth in algorithmic problems.

**Weaknesses.** Library leak rate is high (hackathon problems are public, then leak into hiring). Less depth in non-coding domains. Refresh cadence depends on hackathon flow.

**QOrium relationship.** **API customer (Tier 1 target).** HackerEarth's value prop is "library size" — but the library is increasingly tainted by leakage. A "premium, never-public, anti-leak-rotated" QOrium API would be a logical premium tier.

---

## 4. Codility

| | |
|---|---|
| **HQ** | Warsaw, Poland + London, UK (offices in San Francisco) |
| **Founded** | 2009 (Greg Jakacki) |
| **Primary buyer** | Enterprise engineering hiring, Fortune 500 |
| **Library size** | Smaller (curated), high quality |
| **Differentiator** | Industrial-Organizational psychology baked into every aspect |

**What they sell.** Premium technical assessment with a heavy emphasis on **work-sample fidelity** — the candidate solves problems that mirror real engineering tasks rather than abstract algorithm puzzles. Codility is positioned as the "scientifically rigorous" alternative to HackerRank.

**How they create questions.** **Codility's I/O Psychology Team is the centerpiece.** They have an explicit "Industrial-Organizational psychologist" function (`iopsych@codility.com`) that:

- Designs structured technical interview programs based on job-requirement analysis
- Develops custom structured-interview questions and scoring protocols
- Validates assessments for predictive accuracy
- Publishes research on hiring-interview structure (more structure = higher reliability + lower bias)

The I/O psychology team is the marketing centerpiece — Codility sells the science as much as the platform.

**Strengths.** Scientific rigor, predictive validity, defensibility under EEOC / bias scrutiny, premium brand. Trusted by Microsoft (and used in several Microsoft Codility-style practice tests publicly available).

**Weaknesses.** Slower content cycle (every question takes weeks of I/O psych validation). Smaller library. Premium pricing limits SMB reach.

**QOrium relationship.** **Less likely as direct API customer** (their I/O psych team is the moat — they would resist outsourcing). **More likely as a partnership** — QOrium provides high-velocity AI-authored draft content, Codility's I/O psych team validates it.

---

## 5. CodeSignal

| | |
|---|---|
| **HQ** | San Francisco, California, USA |
| **Founded** | 2014 (Tigran Sloyan, Aram Shatakhtsyan) |
| **Primary buyer** | Enterprise tech (Netflix, Robinhood, Asana cited customers) |
| **Library size** | Smaller, research-backed |
| **Differentiator** | "General Coding Framework" (GCF) — a published, peer-style research methodology |

**What they sell.** Realistic technical assessments + interviews using a coding environment that mirrors real developer tooling. Their differentiator is the **Coding Score** — a calibrated, framework-based skills score that customers trust as an industry benchmark.

**How they create questions.** CodeSignal's content development is **research-led**:

- The General Coding Framework (GCF) is a published, validated framework. They have technical research papers on the methodology.
- Internal claim of **2,800+ hours of research per assessment framework** (cited in marketing).
- Question authoring is done in-house by content engineers, with each question mapped to the GCF skill taxonomy and IRT-style difficulty calibration.
- Heavy investment in **assessment science** — they explicitly market their "Skills Evaluation Lab" as a research arm.

**Strengths.** Premium positioning, research-defensible Coding Score, very strong with senior-engineer hiring, polished UX.

**Weaknesses.** Smaller library, premium pricing, limited non-coding coverage (no psychometric, no domain MCQ).

**QOrium relationship.** **API content partner (Tier 1 target, but slower sale).** CodeSignal's research moat is its strength — but they need volume content to expand role coverage (they're thin outside core CS roles). QOrium's role-graph + India-stack content fills the white space.

---

# TIER 2 — Specialist Coding & Technical Platforms

These platforms compete in the technical-screening lane but have made specific architectural bets (live human interviews, take-home projects, real-codebase challenges) that differentiate them from the volume-screening Tier 1 players.

---

## 6. WeCP (We Create Problems)

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2016 (Abhishek Kaushik, Mohit Goyal — both NIT Trichy alumni) |
| **Primary buyer** | Enterprise engineering hiring, Indian IT services & GCCs |
| **Library size** | **7,000+ skill-sets, 5,000+ job functions** |
| **Origin story** | **Started as a question-selling business**, pivoted to platform 2019 |

**What they sell.** Technical assessment platform with a strong India focus. Their original product was literally a **"problems" (questions) catalog** sold to companies — the founders' insight was that public practice problems and real hiring questions came from the same source pool, defeating the screen.

**How they create questions.** **They built AI-driven, company-specific problem generation from Day 1.** Their early customers — Microsoft, Infosys, Mindtree, Robert Bosch, L&T — bought custom unique problem packs, not platform access. The pivot to platform was a 2019 decision; the original content business validated the exact wedge QOrium is targeting.

**Strengths.** Engineering credibility (founders are NIT engineers), India enterprise relationships, deep customer-authoring tools, AI question generation roots.

**Weaknesses.** As a platform, competes head-on with HackerRank and Mettl — diluted from its original content-only DNA. Their customer-authoring focus is itself an admission that platform-supplied content is insufficient.

**QOrium relationship.** **Most strategically interesting competitor.** WeCP validated the exact "question-factory" model QOrium is building, then walked away from it to chase platform economics. Their pivot is QOrium's permission slip. They are **simultaneously a competitive threat (could pivot back), a potential acquirer, and a benchmark of feasibility**.

---

## 7. DevSkiller

| | |
|---|---|
| **HQ** | Warsaw, Poland |
| **Founded** | 2014 |
| **Primary buyer** | Engineering teams hiring for backend, frontend, DevOps roles |
| **Library size** | Mid-size, focus on real-codebase tasks |
| **Differentiator** | "RealLifeTesting" methodology — candidates work on a pre-configured codebase |

**What they sell.** Technical screening using **real codebase challenges** — candidates build features in a pre-existing repo, not write isolated functions. This eliminates much of the LeetCode-style leakage problem.

**How they create questions.** Tasks are built by a content team that constructs realistic project codebases (React apps, Spring Boot services, etc.) with built-in bugs to fix or features to extend. Each task includes documented expected behavior, automated tests, and a scoring rubric. Customer-authoring is supported.

**Strengths.** Anti-leak by design (realistic tasks are harder to memorize), high signal for senior engineering roles, very strong for hiring on specific tech stacks.

**Weaknesses.** Each task is expensive to author (full codebase + tests + rubric). Slow library refresh. Less suitable for high-volume entry-level screening.

**QOrium relationship.** **Partnership candidate.** DevSkiller's expensive task-authoring model could benefit hugely from QOrium's AI-assisted task generation pipeline.

---

## 8. CoderPad / CodinGame for Work

| | |
|---|---|
| **HQ** | San Francisco (CoderPad) + Paris (CodinGame, parent CodinGame Group) |
| **Founded** | CoderPad 2013, CodinGame 2014 (merged 2022) |
| **Primary buyer** | Engineering teams running live coding interviews + technical screens |
| **Library size** | 90+ technical roles + community-contributed challenges |
| **Differentiator** | Best-in-class live collaborative coding IDE + gamified screening |

**What they sell.** Two complementary products: CoderPad (live coding interview environment, the Zoom-of-coding-IDEs) and CodinGame for Work (game-based technical screening). Together they cover both screen and interview.

**How they create questions.** CodinGame leverages a community of millions of developers who contribute "puzzles." For Work, content is curated from this corpus with additional in-house authoring + a customer-authoring framework.

**Strengths.** Best-in-class live interview UX, community-driven content engine, strong in Europe. Gamification differentiates for graduate hiring.

**Weaknesses.** Community-contributed content has the same leakage problem; gamification works for grad hiring but not for senior screens.

**QOrium relationship.** **API customer (Tier 2 target).** Their content backbone is community — quality varies. A QOrium-supplied "premium curated" tier is a logical upsell.

---

## 9. Karat

| | |
|---|---|
| **HQ** | Seattle, Washington, USA |
| **Founded** | 2014 (Mohit Bhende, Jeffrey Spector) |
| **Primary buyer** | Mid-large tech companies running outsourced first-round technical interviews |
| **Library size** | Internal — used by Karat's own Interview Engineers |
| **Differentiator** | **Live, structured technical interviews delivered by a network of trained "Interview Engineers"** |

**What they sell.** Outsourced first-round technical interviewing-as-a-service. Karat's network of trained Interview Engineers (typically senior software engineers moonlighting) conducts structured, recorded technical interviews on behalf of the hiring company. The hiring company gets a transcript, score, and recommendation.

**How they create questions.** Internal library of structured interview questions, designed and validated for inter-rater consistency across the Interview Engineer network. Heavy emphasis on rubric design, scoring calibration, and interviewer training.

**Strengths.** Solves the "we have no senior engineers free to interview" pain. Highly structured = lower bias = better signal. Defensible moat in the human-network.

**Weaknesses.** Service business with people-cost ceiling. Limited scalability vs pure-software platforms. Premium pricing.

**QOrium relationship.** **Content partner.** Karat's library is internal but constantly needs refresh — QOrium-authored questions could feed the Karat network. Lower direct API revenue, but a credibility-stamping partnership.

---

## 10. Byteboard

| | |
|---|---|
| **HQ** | San Francisco, California (Google spin-out) |
| **Founded** | 2019 (originally inside Google's Area 120) |
| **Primary buyer** | Companies wanting to reduce bias in technical screening |
| **Library size** | Curated, project-based scenarios |
| **Differentiator** | **Project-based take-home interviews designed by ex-Google engineers** to predict on-the-job performance |

**What they sell.** Take-home project interviews — candidates spend 2 hours reviewing a design doc, fixing a bug, or extending a real-world feature. Designed explicitly to reduce unconscious bias and to test judgment, not LeetCode recall.

**How they create questions.** In-house team of ex-Google engineers + I/O psychologists. Each scenario is a multi-document project (PRD, design doc, partial code, partial tests) — each takes weeks to author and validate.

**Strengths.** Very high signal for product engineering roles. Strong bias-reduction story. Polished UX.

**Weaknesses.** Each scenario is enormously expensive to build → small library, slow refresh. Over-engineered for high-volume entry-level hiring.

**QOrium relationship.** **Partnership candidate.** Byteboard's authoring cost is a known constraint. QOrium-assisted authoring could 3–5× their library refresh cadence.

---

# TIER 3 — India-Strong Platforms

These platforms have particular relevance for QOrium's GCC + Indian-staffing wedge. They tend to under-invest in I/O psychology depth but over-index on India-specific features (regional language support, BFSI/IT-services domain content, integration with Indian ATS like Naukri, Talent500).

---

## 11. iMocha

| | |
|---|---|
| **HQ** | Pune, India + Edison, USA |
| **Founded** | 2015 (Sujit Karpe, Amit Mishra) |
| **Primary buyer** | Enterprise + GCC for both pre-employment and **internal skills-intelligence** |
| **Library size** | **2,500+ skills, 35+ coding languages, 10,000+ pre-built tests** |
| **Differentiator** | Pivoting hard into **"Skills Intelligence Platform"** — internal mobility + workforce skills mapping |

**What they sell.** Full-spectrum skills assessment, pivoting from pre-employment into a broader skills-intelligence and internal-mobility play. Their **AI-EnglishPro** product (NLP-based business English assessment, CEFR-aligned) is a notable differentiator.

**How they create questions.** Hybrid in-house + customer-authoring + AI-assisted authoring. Bulk-upload and combine-with-library tools are mature. EnglishPro uses computational linguistics for spoken-and-written English scoring — a sophisticated AI pipeline.

**Strengths.** India + US dual presence, enterprise relationships, English-proficiency niche, internal-mobility positioning is correct ahead of the market.

**Weaknesses.** Coding-depth is shallower than HackerRank/Codility. Library size masks variable quality. Spreading thin between hiring + internal mobility + L&D.

**QOrium relationship.** **API + content-partner (Tier 1 priority for India play).** iMocha's library breadth is partly a marketing position; backend coding/domain content is thin. QOrium-supplied India-stack (SAP, Oracle, BFSI) content + EnglishPro-feeder content is a clean fit.

---

## 12. Xobin

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2013 |
| **Primary buyer** | Mid-market Indian enterprises, IT services, recruitment firms |
| **Library size** | Tests for **9,000+ roles**, 1,800+ skills |
| **Differentiator** | Adaptive testing, mid-market price point |

**What they sell.** Mid-market assessment platform with strong adaptive-testing engine. Positioned as a more affordable Mettl/HackerEarth alternative for Indian SMBs and mid-tier IT services firms.

**How they create questions.** In-house content team, customer-authoring tools, some AI-assisted authoring. Less I/O psychology rigor than Mettl but adequate for mid-market trust.

**Strengths.** Mid-market price point ($-friendly), adaptive engine differentiator, India focus.

**Weaknesses.** Smaller content team = slower library refresh; competes on price more than science.

**QOrium relationship.** **API customer (Tier 3 — easier sell, smaller ACV).** Mid-market platforms with thin content teams are QOrium's quickest API wins. Self-serve API at the right price could lock in 50+ such platforms.

---

## 13. HirePro

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2004 |
| **Primary buyer** | Indian IT services giants — TCS, Wipro, Infosys, Cognizant, HCL |
| **Library size** | Massive — IT services hiring is HirePro's core; large internal library |
| **Differentiator** | Deep relationships with Indian IT services + campus hiring at scale |

**What they sell.** End-to-end campus-hiring + lateral-hiring assessment platform. Unmatched for Indian IT services campus hiring drives (volumes of 50,000–500,000 candidates per drive).

**How they create questions.** In-house content team specialized in IT services + BFSI domain content. Long history (since 2004) gives them a deep institutional library.

**Strengths.** Unbeatable for high-volume Indian IT services hiring. Deep proctoring + venue-based testing capabilities (often does on-campus offline + online assessments).

**Weaknesses.** Less modern UX, limited expansion outside India IT services, library refresh is bandwidth-limited.

**QOrium relationship.** **Content partner / white-label (Tier 2 target for India play).** HirePro's customers (TCS, Infy, Wipro) are also QOrium's direct enterprise targets. Could be either competitor (if they expand content licensing) or partner (if they license QOrium content for refresh velocity).

---

## 14. Speedexam / SkillRobo / Talview (cluster of mid-market India platforms)

| | |
|---|---|
| **HQ** | Various (Bengaluru, Chennai, Hyderabad) |
| **Founded** | 2010s |
| **Primary buyer** | Mid-market Indian enterprises, training institutes |
| **Library size** | Smaller; many serve as resellers/integrators |
| **Differentiator** | Affordable, India-language support, training-center focus |

**What they sell.** Mid-market assessment + proctoring tools, often bundled with corporate training platforms. Talview specifically has invested in AI-proctoring and conversational interviewing.

**How they create questions.** Mostly customer-authored, with thin in-house libraries used as defaults. Heavy reliance on customers bringing their own content.

**Strengths.** Low price, regional-language support, training-institute distribution.

**Weaknesses.** Content quality is the explicit weakness. They are content-starved — exactly QOrium's pitch.

**QOrium relationship.** **Quickest API wins.** Self-serve API tier targeted at this cluster could land 30+ logos in Year 1.

---

## 15. Adaface

| | |
|---|---|
| **HQ** | Singapore (founded by Indian engineers, India operations strong) |
| **Founded** | 2018 (Deepti Chopra, Siddhartha Gunti — Adani / IIT alumni) |
| **Primary buyer** | Mid-market enterprises globally; strong India presence |
| **Library size** | **10,273 "non-googleable" questions, 500+ ready-made tests for 500+ roles** |
| **Differentiator** | **Conversational chatbot ("Ada") + non-googleable questions** |

**What they sell.** Conversational assessment via a chatbot interface. Their explicit positioning is "non-googleable" — every question in their library is hand-authored to defeat Google/Stack Overflow / LeetCode lookup.

**How they create questions.** In-house authoring + heavy investment in **anti-leak, anti-Google curation**. The non-googleable promise is backed by an internal QA process that searches each question against major leak sites before release.

**Strengths.** Anti-leak positioning is correct (and rare). Conversational UX is candidate-friendly. Strong mid-market traction.

**Weaknesses.** Library size (10K) is a fraction of HackerEarth's 40K — they trade volume for quality, but enterprises with high-volume needs may need more. Conversational UI doesn't fit all roles (live coding pads do better for senior engineering screens).

**QOrium relationship.** **Partnership + API customer.** Adaface validates the anti-leak positioning. QOrium's anti-leak rotation engine is upstream of their human-curation effort — could be a wholesale content source for them.

---

# TIER 4 — Emerging AI / Niche / Next-Gen

These are the platforms making bets on AI, novel formats, or specific niches. They are smaller today but represent where the puck is moving — and they are the most natural QOrium API customers because they don't have legacy content teams to defend.

---

## 16. Vervoe

| | |
|---|---|
| **HQ** | Melbourne, Australia + New York, USA |
| **Founded** | 2016 (Omer Molad, David Weinberg) |
| **Primary buyer** | Mid-large enterprises focused on work-sample testing |
| **Library size** | **300,000+ question bank, 300+ assessment templates** |
| **Differentiator** | **AI-graded job simulations** — three-model architecture (How / What / Preference) |

**What they sell.** AI-powered job simulations. Candidates complete realistic job tasks; Vervoe's AI grades them using three models: the **How Model** (interaction patterns), the **What Model** (response content), and the **Preference Model** (tuned to each customer's grading style with ~20 calibration grades).

**How they create questions.** Hybrid: customer-authored, AI-generated, and from Vervoe's library of 300K+ questions and 300+ templates. The **AI-Powered Assessment Builder** generates a custom assessment from a job description or job title.

**Strengths.** Largest stated question bank in the industry (300K+). AI grading is mature and customer-tunable. Work-sample fidelity is high.

**Weaknesses.** AI grading requires customer training (~20 calibration grades) which adds friction. Library quality varies (300K is sheer volume, not all curated).

**QOrium relationship.** **API content partner.** Vervoe's library size masks quality variance — a curated, calibrated QOrium content layer would be a premium upgrade. Their AI-grading layer + QOrium content layer is a complementary stack.

---

## 17. SHL

| | |
|---|---|
| **HQ** | London, UK |
| **Founded** | 1977 |
| **Primary buyer** | Fortune 500 enterprises, government, military |
| **Library size** | Decades-deep psychometric library, narrow on coding |
| **Differentiator** | **The most-validated psychometric library in the world** |

**What they sell.** Premium psychometric and cognitive ability testing. SHL's tests (OPQ, Verify, Talent Measurement) are standards in enterprise hiring globally — every Big 4 consultancy and most of the FTSE 100 use SHL as a screening layer.

**How they create questions.** Decades of in-house I/O psychology and psychometric science. New items go through extensive trial, calibration, fairness analysis (adverse-impact testing), and longitudinal validation. Each item is a multi-month investment.

**Strengths.** Unmatched scientific rigor in psychometrics. Defensible under any regulatory regime. Premium pricing reflected.

**Weaknesses.** Coding/technical content is shallow — they partner with HackerRank or Codility rather than build it themselves. Slow innovation cycle. UX dated.

**QOrium relationship.** **Partnership / content partner for technical content.** SHL needs technical-stack content to round out their offering; QOrium's coding + domain content + India-stack specialization fills their gap. Partnership > API customer.

---

## 18. Talogy (Cubiks + PSI Services + IBM Kenexa)

| | |
|---|---|
| **HQ** | London, UK |
| **Founded** | Roll-up of Cubiks (2018), PSI Services, ETS People → "Talogy" brand |
| **Primary buyer** | Fortune 500, government, military |
| **Library size** | Deep psychometric, narrow on coding |
| **Differentiator** | Talent science consulting + assessment |

**What they sell.** Similar to SHL — premium psychometric + leadership assessment, increasingly AI-augmented.

**How they create questions.** In-house I/O psych team, similar to SHL.

**Strengths.** Scientific rigor, leadership-assessment depth.

**Weaknesses.** Same as SHL — thin on technical content.

**QOrium relationship.** **Partnership / content partner.**

---

## 19. Glider AI

| | |
|---|---|
| **HQ** | Foster City, California, USA |
| **Founded** | 2014 |
| **Primary buyer** | Mid-large enterprises, GCCs |
| **Library size** | 500+ skills |
| **Differentiator** | **Generative-AI-first assessment platform** — explicitly positions on AI-generated content |

**What they sell.** AI-augmented skills validation + interview platform. Heavy on AI-generated questions and AI-graded responses.

**How they create questions.** Generative AI + in-house validation. Their explicit pitch is that AI generates better, more current content than slow in-house teams — this is **the closest direct positioning competitor to QOrium for the AI-generation pitch**.

**Strengths.** AI-first positioning is differentiated. Cost structure is favorable.

**Weaknesses.** Quality control is the open question — pure-AI content without rigorous validation has had public failures. Less I/O psychology depth.

**QOrium relationship.** **Direct competitor on positioning** — but their model is "AI-only platform" while QOrium's is "AI-authored + I/O psych validated content for ANY platform." Partnership unlikely; QOrium needs to position against them as "the validated, defensible alternative."

---

## 20. Testlify (+ honorable mention to Toggl Hire, Canditech, eSkill)

| | |
|---|---|
| **HQ** | Bengaluru, India |
| **Founded** | 2022 |
| **Primary buyer** | Startups, mid-market |
| **Library size** | 1,800+ tests across roles |
| **Differentiator** | Affordable, modern, fast-growing Adaface-style alternative |

**What they sell.** Modern, low-friction skills assessment for SMBs and mid-market. Multiple question types (MCQ, coding, audio, video, case study), AI-augmented authoring.

**How they create questions.** In-house + customer-authored + AI-assisted. Volume-over-rigor model.

**Strengths.** Modern UX, fast growth, affordable, multi-format.

**Weaknesses.** Newer = thinner content team; quality variance is the trade-off for affordability.

**QOrium relationship.** **Easy API customer.** Newer mid-market platforms with thin content teams are QOrium's "first 50 logos" play.

**Honorable mentions in this tier:**
- **Toggl Hire** (Estonia) — Skills-test focused, modern UX, mid-market.
- **Canditech** (Israel) — AI skill tests, work-sample focus.
- **eSkill** (US) — Long-running, broad library, traditional UX.
- **IKM Assessments** (US) — Legacy, mostly MCQ, no coding — illustrates what NOT to be in 2026.

---

# Cross-Cutting Pattern: How Question Creation Actually Works

After profiling all 20, six distinct authoring models emerge:

| # | Model | Used by | Strength | Weakness |
|---|---|---|---|---|
| 1 | **In-house engineering authors** (no I/O psych) | HackerRank, HackerEarth, WeCP, most India platforms | Fast, technically credible | Bias/leakage blind spots |
| 2 | **In-house I/O psychologist team** | Mettl, Codility, CodeSignal (partial), SHL, Talogy | Defensible, predictive validity | Slow, expensive, doesn't scale |
| 3 | **Community-contributed** | HackerRank practice, CodinGame, LeetCode-style | Massive volume, free/cheap | Quality variance, leakage |
| 4 | **Customer-authored (BYO content)** | All of them, increasingly | Customer locks in their own IP | Pushes the cost back to the customer |
| 5 | **AI-generated + human validated** | Adaface, Vervoe, Glider, WeCP, increasingly all | Speed + quality combined | Validation pipeline is the moat |
| 6 | **Outsourced human-network (interviewers)** | Karat | Highest signal for senior screens | People-cost ceiling |

**QOrium's bet:** Combine #2 (I/O psychology rigor) + #5 (AI authoring speed) into a single content-as-a-service company that supplies all six end-state models above. Nobody is doing this end-to-end today.

---

# What This Means for QOrium Positioning

Three inescapable conclusions from the audit:

1. **No platform is content-rich AND content-fresh AND content-defensible.** Each makes a 2-of-3 trade-off. QOrium's value prop is the 3-of-3 combination, packaged as a service.
2. **The "anti-leak" wedge is wide open.** Only Adaface explicitly markets it; nobody operationalizes it as a continuous engineering process. QOrium's anti-leak rotation engine is genuinely novel.
3. **India-specific stack content is materially under-served.** SAP ABAP, Oracle HCM, Salesforce, BFSI core systems, embedded automotive — every GCC TA leader has this on their wish list, and no platform's library covers it adequately.

Document 3 quantifies these gaps in matrices. Document 4 turns them into the QOrium go-to-market blueprint.

---

## Appendix B — Source URLs (Document 2 only)

- HackerRank: hackerrank.com · support.hackerrank.com (question creation docs)
- HackerEarth: hackerearth.com · help.hackerearth.com
- Codility: codility.com/blog/bringing-industrial-organizational-psychology-to-tech-hiring/ · engage.codility.com
- CodeSignal: codesignal.com/resource/general-coding-assessment-framework/ · discover.codesignal.com (technical research papers)
- Mercer Mettl: mettl.com · resources.mettl.com (psychometric assessments)
- iMocha: imocha.io · blog.imocha.io
- TestGorilla: testgorilla.com · support.testgorilla.com
- WeCP: wecreateproblems.com · business-standard.com (founding history) · yourstory.com (company profile) · crunchbase.com
- Adaface: adaface.com
- Vervoe: vervoe.com · help.vervoe.com (How / What / Preference Models)
- Karat: karat.com
- Byteboard: byteboard.dev
- DevSkiller: devskiller.com
- Xobin: xobin.com
- HirePro: hirepro.in
- SHL: shl.com
- Talogy: talogy.com
- Glider AI: glider.ai
- Testlify: testlify.com · testlify.com/adaface-alternatives/
- CoderPad / CodinGame: coderpad.io · codingame.com/work

(All URLs validated against May 2026 search results; full hyperlink list in Master Mega Doc.)

---

*End of Document 2. Next: Document 3 — Gap Analysis with format + role coverage matrices.*
