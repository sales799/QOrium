# QOrium Competitive Gap Analysis — 2026-05-31

**Companion to:** QORIUM_MEGA_BUILD_v1.0.md §2
**Sources crawled this session:**
- https://vervoe.com (homepage + product nav)
- https://vervoe.com/pricing (enterprise-only positioning, API surface)
- https://coderbyte.com (full HTML saved; "unlimited candidates + AI credits" positioning)
- https://techcurators.in (home — services posture, "Amazon of Assessments")
- https://techcurators.in/skill-library (full catalog, ~150+ skill domains)
- https://brainstack.net (triaged out — IT services consultancy, not assessment platform)

---

## A. Vervoe — full feature inventory (from live crawl)

**Products as separate nav items:** Skills Assessments (overview, features, AI Scoring, Job Simulations, Integrations, Assessment Builder, Assessment Library, Anti Cheating) · Cognitive Assessments · AI Chatbot (AI Screening Agent) · Interview Scheduling · Reference Checking · AI Readiness.

**Solutions axes:** By Company Type (Enterprise / Startup / SMB) · By Use Case · By Industry.

**Resources surface:** Blog, Recruitment Guides, Job Descriptions library, "Guide to Skills Testing", "How to Evaluate AI Hiring Vendors", Recruitment Plan template, Skills Gap Analysis template, Shortlisting Matrix template, Webinars, Employer Support, Candidate Support, API docs.

**Trust footprint:**
- ISO/IEC 27001 certified
- GDPR + global privacy frameworks
- Holistic AI independent bias audit (NYC Bias Audit Verified)
- "Assessment Validity" page — developed & validated by experts
- G2 badges: Enterprise High Performer, Best Support Enterprise, Users Love Us, Pre-Employment Testing High Performer, Technical Skills Screening Best ROI, Pre-Employment Small Business Requirements, Video Interviewing High Performer
- SourceForge listing
- 4.5★ G2, 4.5★ Capterra

**Customer logos:** Tennis Australia, Dentsu, Australia Post, Lumen Technologies, Findex, BOQ Group, iSelect.

**Outcome stats:** 4.6/5 candidate satisfaction (Findex), 3× fewer interviews per hire (iSelect), 2,340 hours saved annually (BOQ Group), 75% reduction in attrition (Dentsu), 67% fewer interviews per hire, 80% better performance, 44% promoted faster, 90% less likely to leave.

**Pricing posture:** Enterprise-only, "Let's Talk" → demo flow. Public surface lists features only (Customizable Assessments, Custom Question Types, Custom Integrations, Advanced AI Grading, Advanced Generative AI Detection, Enterprise Security, Regional Data Storage, Priority Support SLAs, Guaranteed Uptime SLA, Onboarding Team Training, Custom Reporting, SSO).

**API:** white-label, "100,000s of candidates," dedicated API docs surface.

**SEO / AI hygiene:** `/sitemap.xml`, `/llm-info/` page (LLM-explicit content — almost no Indian competitor has this).

## B. CoderByte — extracted positioning

**Tagline:** "Screen, interview, and upskill your AI-powered workforce."

**Promise:** "Evaluate any skill quickly, accurately, and affordably with **unlimited candidates and AI credits**."

**Pricing posture:** "Free trial" + unlimited-usage anchor — opposite end of the spectrum from Vervoe.

**Product surface:** screening + interviewing + upskilling (the upskilling pillar is distinct from Vervoe).

**Audience cuts:** Engineer (coding-first) clearly the dominant lane, talent-evaluation framed broadly.

**Devnote:** site is Framer-built; uses framerusercontent CDN.

## C. TechCurators — extracted posture

**Positioning:** "Amazon of Assessments" — they own the language, but the product is a Google Form. Intake links go to Google Forms (`docs.google.com/forms/...`), not an in-app builder.

**Differentiator they own:** SME pool ("dedicated members in the SME pool"), claim of presence in "4+ continents," 100+ skills, organizations the SMEs come from (Amazon, IBM, SAP, Goldman Sachs, Microsoft, Tower Research, Salesforce, Google).

**What this proves to QOrium:** there is real Indian B2B demand for assessments, served today by an agency model. The gap is a real software product priced below TC's bespoke SME work, and above DIY MCQ tools.

**Skill Library — full extracted taxonomy** (use this as the QOrium Assessment Library coverage shopping list):

**Technical — Programming Languages (24):** Python, C++, Java, C#, R, HTML, CSS, JavaScript, PHP, ADA, GO, Swift, Assembly, Pascal, TEXT, Haskell, Kotlin, Scala, Julia, Node.js, Perl, MySQL, SQL.

**Technical — Development Technologies (17):** Web Development, Android, iOS, ML & Data Science, Cyber Security, IoT, Blockchain, DevOps, UI/UX, Big Data, Cloud Computing, Robotics, Data Visualization, ReactJS, Flutter, Jenkins, Docker, Kubernetes.

**Technical — Tools & other Technologies (20):** Linux, Struts, .Net, REST API, Rails, XML, Spring, Zend, SAP ABAP, Flask, Hadoop, Tableau, AWS, Azure, Apache Beam, SAS, MongoDB, Git, Agile, AS400, BI/DWH.

**Technical — Engineering (24 disciplines):** Aeronautical/Aerospace, Agriculture & Food, Applied, Automobile, Biotechnology, Ceramic, Chemical, Civil, Computer, Computer Science, Electronic/Electrical, Engineering Management, Environmental, Engineering Physics, Industrial & Production, IT, Instrumentation, Marine, MCA, Mechanical, Metallurgical, Petroleum, Naval Architecture & Ocean, Textile, Mineral, Mining.

**Technical — More (16):** Data Analyst, Data Engineer, Data Scientist, DBA, Delivery Management, Enterprise Asset Mgmt, Heroku, Full Stack, Infrastructure Services, Mobility, Progress 4 GL, Project Management, RPA, Salesforce, Testing Automation, Testing Manual, Weblogic Admin.

**Non-Technical — Behavioural (4):** Personality Attributes, Analytical Ability, Interpersonal Skills, Leadership Skills.

**Non-Technical — Sales (5):** B2B Sales, Retail Sales, B2C Sales, Field Sales, Inside Sales.

**Non-Technical — Marketing (4):** Content, Design, Branding/PR, Digital.

**Non-Technical — Others (12+):** English Proficiency, Maths, Operations, Accounting & Finance, Leadership/Management, Engineering entrance prep, Business Analysis, Journalism, Law, Design Thinking, Product Management… and more truncated.

**Total surface area:** ~150 distinct skill domains. This is the **floor** for QOrium Assessment Library v1 coverage.

## D. Brainstack — why excluded

IT services + AI consulting (Tunisia). Their service menu is Web Dev, BI, AI projects. They sell consulting, not assessments. Not a competitor; including them would muddy the matrix. Logged here only so the CEO sees the triage was deliberate.

---

## E. Synthesis — three white-space wedges (full reasoning behind §3 of master spec)

### E1. IRT-calibrated scoring
Vervoe says "Assessment Validity… developed and validated by experts." None publish per-item reliability or a difficulty/discrimination curve. Indian HR-tech is even thinner here — Mercer Mettl, iMocha, and HirePro do not surface psychometric reports. QOrium with IRT calibration becomes the only player whose grades survive an HR-tribunal audit. Module **M14**.

### E2. JD-Forge
Every player makes you assemble an assessment. CoderByte makes it fast but still manual. QOrium's `qorium-jd-forge` PM2 service name (from prior memory snippets) signals the founder already intuited this wedge. Productize it: paste JD → choose role family → get a v1 assessment in 60s with per-skill weights, calibrated against M14. Module **M13**.

### E3. Bias-audited + DPDP-native + India residency
Vervoe holds the NYC bias audit. None of the Indian assessment vendors hold an Indian-jurisdictional bias audit. The Indian DPDP Act (in force) plus pending HR-AI regulation (in motion) make this a 12–24 month moat. Combine three modules: **M15** (ISO 27001), **M16** (independent bias audit, Indian auditor), **M17** (India data residency). The first Indian assessment vendor to claim all three has a defensible enterprise story.

---

## F. Pricing-model implications

Two extreme models exist in market:
- **Vervoe:** Enterprise-only, opaque, value-priced, contract-led.
- **CoderByte:** Unlimited-everything, transparent, self-serve.

QOrium can choose a third lane (recommended): **published tiers with a free-forever Customer-Zero plan for SMBs (≤10 assessments/month), a Growth tier (₹X for ≤500/month), and Enterprise (custom).** This lets the SEO/library/assessment-builder flywheel run while preserving an enterprise wedge.

Exact pricing is a CEO/Lakshmi-Kosh call, not a CTO call. Flagged as `founder_request` in master spec §7.
