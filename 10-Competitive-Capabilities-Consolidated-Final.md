# QOrium — Competitive Capabilities & Research — Consolidated Final

**Document.** 10 of QOrium core deliverables · **Date.** 2026-05-01 · **Status.** v1.0 — Final Consolidation **Filename note.** Originally drafted as `08-…`; renumbered to `10-…` to avoid collision with `08-Bali-Sales-Playbook-v1.md` (already 08\) and `09-QOrium-Constitution-v1.0.md` (already 09). **Supersedes.** Audit-doc claims at the time of `02-Top-20-Competitor-Audit.md` (May 1, 2026 draft v1.0) **Companion.** Workbook `HackerRank-Capabilities.xlsx` (44 tabs covering all 20 competitors) and rolling `competitive_research_log.md` (10 numbered findings)

---

## 0\. Why this document exists

CEO ran a multi-turn research engagement that audited all 20 competitors in `02-Top-20-Competitor-Audit.md` against live web sources in May 2026\. This document is the single comprehensive deliverable that turns the research findings into concrete edits to the existing QOrium document set (`01-Market-Landscape.md`, `02-Top-20-Competitor-Audit.md`, `03-Gap-Analysis.md`, `04-QOrium-Blueprint-v1.md`, `07-CTO-Architecture-v1.md`) and into refined QOrium positioning.

The research log captured every individual finding. The workbook captures every per-competitor data point. This document is the synthesis.

---

## 1\. Executive summary

**Five headline findings.**

1. **Two competitors have been acquired since the audit doc was drafted.** WeCP → Invisible Technologies (March 10, 2026). Byteboard → Karat (January 16, 2025). The audit doc treats both as standalone competitors. Both relationships need full rewrites.
2. **One factual error in the audit doc.** Talogy is the rebrand of PSI Talent Management \+ 16 acquired organizations — it does NOT include IBM Kenexa, which remains part of IBM (acquired by IBM in 2012). Audit doc lists IBM Kenexa as part of Talogy.
3. **HackerEarth was never sold to Talview.** Audit doc says "sold to Talview-backed group" — this claim is false per PitchBook, Crunchbase, Tracxn. HackerEarth is independent.
4. **\~40 specific stat corrections across the 20 competitors.** Library sizes, founder lists, funding amounts, customer logos, founding dates, current CEO names. Most consequential: HackerRank library is \~7,500 (not \~1,000); WeCP's "7,000 skill-sets, 5,000 job functions" is actually 2,000+ skills \+ 1,000+ tests; HackerEarth's 40K library claim is closer to 17K-25K on current pages.
5. **The three QOrium positioning conclusions in the audit doc are validated and stronger.** No competitor is content-rich AND fresh AND defensible. The anti-leak wedge is operationalized only by Adaface (web-crawlers \+ 24-hour rotation). India-specific stack content is materially under-served.

**Strategic shifts implied for QOrium.**

- The pricing wedge is now fully clear across all 20 competitors. QOrium API tier at $5K-25K/yr fits cleanly between mid-market entry tiers and enterprise contracts. Defensible.
- The "question-factory" wedge is empty. WeCP validated the model, abandoned it (2019), and exited the category (2026). Permission slip is strongest of any wedge analysis.
- Three competitors are partnership-ideal for QOrium content supply (DevSkiller, Codility, SHL/Talogy). Two are direct positioning rivals (Glider AI, Vervoe). Five are easy-API targets (Testlify cluster, Talview cluster, Xobin, Adaface, smaller mid-market).
- The 6 authoring models in the audit doc are validated. QOrium's 7th model — combine \#2 (I/O psych validation) \+ \#5 (AI authoring) — has no incumbent.

---

## 2\. Major findings that change the audit doc

### 2.1 Acquisitions / status changes (audit doc is pre-event)

**WeCP → Invisible Technologies (announced March 10, 2026).** WeCP becomes part of Invisible's Meridial AI-training platform. Founders Abhishek Kaushik (ex-Google) and Mohit Goyal (ex-Meta) join Invisible. Strategic focus shifts from technical-assessment hiring to expert validation for high-precision AI workflows (RL gyms, simulated environments). WeCP's identity as an independent technical-assessment competitor is ENDING. The audit-doc QOrium-relationship section ("simultaneously a competitive threat, a potential acquirer, and a benchmark of feasibility") is fully obsolete: competitive threat is foreclosed, acquirer-route is taken by someone else, and the question-factory wedge is now permanently abandoned.

**Byteboard → Karat (announced January 16, 2025).** Byteboard is now part of Karat — Karat's third acquisition in two years (Triplebyte March 2023, AspectAI, Byteboard January 2025). Audit-doc partnership thesis for Byteboard is moot; the conversation is now Karat-level.

### 2.2 Factual corrections to the audit doc

Most consequential errors below; full per-competitor reconciliation is in each competitor's tab in `HackerRank-Capabilities.xlsx`.

**Numerical errors.**

- HackerRank library: **\~1,000 curated** in audit doc → actual \~7,500 (Starter \~2,000+ / Pro \~4,000+ / total \~7,500+).
- Mercer Mettl: "**100,000+ questions across 800+ tests**" → actual 100,000+ questions; **200-400+ pre-built tests**; **800+ skills** (the "800+" refers to skills, not tests); 300+ roles; 25+ industries.
- HackerEarth: "**40,000+ problems, 1,000+ skills, 40+ programming languages**" → current pages cite **17,000-25,000+** questions; 1,000+ skills verified; 40+ languages verified. The 40K figure may be older or inflated.
- WeCP: "**7,000+ skill-sets, 5,000+ job functions**" → actual **2,000+ skills, 1,000+ pre-built tests, 200,000+ questions**; March 2026 press release introduces a new "18,000+ assessment frameworks" figure (likely sub-frameworks).
- DevSkiller: audit doc says "mid-size" → actual **5,000+ tasks, 500+ ready-to-use tests, 200+ tech skills, 60+ programming languages**.

**Founder list errors.**

- Codility: audit doc names "Greg Jakacki" → actual co-founders **Greg Jakacki \+ Tomasz Walen**. Greg ran company through Oct 2019; **current CEO is Natalia Panowicz**.
- CodeSignal: audit doc names "Tigran Sloyan, Aram Shatakhtsyan" → actual **4 co-founders**: Tigran Sloyan (CEO), Aram Shatakhtsyan (CTO), Felix Desroches (former), Sophia Baik (current VP).
- DevSkiller: audit doc names no founders → actual **3 co-founders**: Jakub Kubrynski (CEO, ex-Allegro Group), Marek Kaluzny, Mariusz Smykula.
- HackerEarth: audit doc names "Sachin Gupta & Vivek Prakash" → both verified, but both are now **former**. Current CEO is **Vikas Aditya**.
- WeCP: audit doc names Kaushik \+ Goyal → verified, but missing important context: Kaushik is ex-Google, Goyal is ex-Meta.

**Other factual errors.**

- HackerEarth HQ: audit doc says "Bengaluru, India (US offices)" → actual **HQ San Francisco**; engineering ops in Bengaluru.
- HackerEarth Talview claim: audit doc says "sold to Talview-backed group" → **FALSE**. HackerEarth is independent per PitchBook, Crunchbase, Tracxn.
- CodeSignal founding history: audit doc says "Founded 2014" → actual founding **2014 as CodeFights**; rebranded to CodeSignal **July 10, 2018** with launch of Coding Score.
- DevSkiller founding history: audit doc says "Founded 2014" → actual **2013 as software house**; first product (TalentScore) launched **2016**.
- Codility "premium pricing limits SMB reach": → Codility Starter is $1,200/yr — actually **cheaper** than HackerRank Starter ($1,990/yr). Premium positioning is brand+science, not entry-tier price.
- CoderPad/CodinGame merger: audit doc says "merged 2022" → actual **acquired October 13, 2021**.
- Talogy roll-up: audit doc says "Cubiks \+ PSI Services \+ IBM Kenexa" → actual is **PSI Talent Management \+ Cubiks \+ 15 other organizations** (Caliper, JCA Global, Performance Assessment Network, Select International, EB Jacobs, IPAT, Ottmann, Human Scope, PBS, a\&dc, Innovative HR Solutions, OPRA, HST, Propel, Solvably). **IBM Kenexa is NOT part of Talogy.**

**Funding amounts (audit doc has no figures for any of these; verified this session).**

| Competitor | Cumulative funding |
| :---- | :---- |
| HackerEarth | $21.6M |
| Codility | $63.9M |
| CodeSignal | $90.1M (highest in cohort) |
| Karat | $248M (unicorn at $1.1B) |
| WeCP | 1 round (specifics redacted) |
| DevSkiller | $2.4M (most capital-efficient operator) |
| Byteboard | Seed $5M (pre-acquisition) |
| Talview | $22.5M |
| iMocha | Multiple rounds (Mudhal VC, Eight Roads, RevUp, Ringbolt, Seeders \+ 6 more) |

---

## 3\. Per-competitor edit sheet for `02-Top-20-Competitor-Audit.md`

Below is the recommended replacement text for each competitor entry. For brevity, only the audit-doc Snapshot blocks are shown here; the full prose corrections are in each competitor's Summary tab in the workbook.

### Tier 1 — Global Category Leaders

**1\. HackerRank.** Replace library size: "\~1,000 curated coding challenges" → "**\~7,500+ curated questions across the platform; \~2,000+ in Starter tier, \~4,000+ in Pro tier**, plus 26M-developer community-contributed practice problems used for engagement (not hiring assessments)." Pricing band $25K-$200K/yr (verified — Vendr 160-customer dataset shows Enterprise avg $70,608/yr).

**2\. Mercer | Mettl.** Replace library size: "100,000+ questions across 800+ tests" → "**100,000+ questions across 200-400+ pre-built tests, covering 800+ skills, 300+ job roles, 25+ industries, in 30+ languages across 90+ countries**. Examination platform tested 30M+ students across 4,000+ customer organizations." Add: "Scoring methodology: Item Response Theory (IRT) — same family used by GRE/GMAT/SAT."

**3\. HackerEarth.** Replace HQ \+ ownership: "Bengaluru, India (US offices, sold to Talview-backed group, originally founded 2012 by Sachin Gupta & Vivek Prakash)" → "**HQ San Francisco; engineering ops in Bengaluru. Independent (privately held); $21.6M cumulative funding across 16 investors. Founded November 2012 by Sachin Gupta \+ Vivek Prakash (IIT Roorkee alumni; both now former). Current CEO Vikas Aditya. \~$36M revenue (2024); 750+ customers including Amazon, PayPal, SocGen, Barclays, Wipro, HCL, L\&T Infotech.**" Replace library size: "**17,000-25,000+ questions across 1,000+ skills, 40+ programming languages, 100+ roles, 15+ question types**." Differentiator emphasis: hackathon platform reaches 10M+ devs across 133 countries and 450+ universities. Add product surfaces: FaceCode (live interview, 41 languages), AI Interview Agent, AI Screening Agent.

**4\. Codility.** Replace founder line: "(Greg Jakacki)" → "**Co-founded by Greg (Grzegorz) Jakacki \+ Tomasz Walen. Greg ran company through Oct 2019; current CEO Natalia Panowicz (since Oct 2019, original core team member). $63.9M cumulative funding (Seedcamp, Kennet Partners, Oxx, Cliffbrake, YLD, PFR Ventures); 1,600+ clients including Microsoft, AWS, Volkswagen, Netflix, Ericsson.**" Add product surfaces: CodeCheck (assessments) \+ CodeLive (live interview) \+ CodeEvent (campus/hackathon). Reword pricing weakness: "**Premium positioning limits SMB BRAND-reach; entry pricing is competitive at $1,200/yr Starter — cheaper than HackerRank Starter ($1,990/yr).**"

**5\. CodeSignal.** Replace founding line: "Founded 2014 (Tigran Sloyan, Aram Shatakhtsyan)" → "**Founded 2014 as CodeFights; rebranded to CodeSignal July 10, 2018 with launch of Coding Score (200-600). Co-founded by Tigran Sloyan (CEO, MIT), Aram Shatakhtsyan (CTO), Felix Desroches (former), Sophia Baik (VP). \~30% of headcount in Armenia. $90.1M cumulative funding across 6 rounds (Menlo Ventures, Index Ventures, Felicis Ventures) — highest-funded of the 20 covered competitors. 800,000+ evaluations administered last year. 45 programming languages.**" Add: "**William Lansing (CEO of FICO) joined advisory board at 2018 rebrand — explicit 'FICO for engineers' positioning play.**" Pricing add: "Hire Build $79/mo, Hire Grow $479/mo, Pre-Screen starter kit **$19,000/yr** (most expensive entry tier of all 20 covered competitors), Enterprise custom."

### Tier 2 — Specialist Coding & Technical Platforms

**6\. WeCP.** **Insert acquisition banner at top of entry:** "🔴 ACQUIRED — On March 10, 2026, Invisible Technologies announced agreement to acquire WeCP. WeCP becomes part of Invisible's Meridial AI-training platform; founders Kaushik \+ Goyal join Invisible. Standalone hiring-assessment offering ENDS." Replace library: "**100,000+ questions: 200,000+ questions across 2,000+ skills, 1,000+ pre-built tests; 18,000+ assessment frameworks per March 2026 press release. 8M+ tests delivered, 2M+ technical interviews. Concurrent capacity 80,000+ tests. 1,000+ customers including Microsoft, Infosys (HackWithInfy \+ 90% assessment automation), Robert Bosch, Mindtree, Larsen & Toubro.**" Add founder context: "Kaushik (ex-Google), Goyal (ex-Meta) — both NIT Trichy alumni." Replace QOrium-relationship: "WeCP's exit is QOrium's strongest permission slip. The question-factory wedge that WeCP validated, then abandoned (2019), then exited (2026), is now empty. Adjacent opportunity: Invisible Meridial application of QOrium content for AI-training expert validation (Phase 3)."

**7\. DevSkiller.** Replace founders: audit doc "Founded 2014" with no founders → "**Founded 2013 as software house; first product (TalentScore) launched 2016\. Co-founded by Jakub Kubrynski (CEO, ex-Allegro Group), Marek Kaluzny, Mariusz Smykula. $2.4M cumulative funding (Angel 2017 \+ Seed Apr 2020 \+ Series A Aug 2023, Movens Capital) — most capital-efficient operator in cohort. Customers from 85+ countries including PayPal, Deloitte. Library: 5,000+ tasks, 500+ ready-to-use tests, 200+ tech skills, 60+ programming languages/frameworks/libraries (most-tested: Java, JavaScript, SQL).**" Add product surfaces: TalentScore (assessments) \+ **TalentBoost (talent management — 4,000+ predefined skills \+ career pathing — UNIQUE in cohort)** \+ CodePair (live coding interviews; flag: distinct from CoderPad). Pricing: TalentScore $499/mo or $3,600/yr; TalentBoost $12/user; Enterprise $5,000/mo.

**8\. CoderPad / CodinGame for Work.** Replace merger date: "merged 2022" → "**CoderPad acquired CodinGame October 13, 2021; entire CodinGame team joined CoderPad.**" Customer logos: Nasdaq, Electronic Arts, Samsung, Meta. 2M-dev community.

**9\. Karat.** Replace audit-doc Snapshot block addition: "**$248M cumulative funding across 4 rounds (Tiger Global led $110M Series C in October 2021 at $1.1B unicorn valuation). Customers: Walmart, Roblox, Indeed, MuleSoft, Intuit, Pinterest. 8 enterprise clients spending $1M+/year. Top Interview Engineers earn \~$250K/yr.**" Insert acquisition history: "**Karat is the technical-interviewing space's consolidator: Triplebyte (March 2023, AI-based adaptive quizzes); AspectAI; Byteboard (January 16, 2025).** All three are now Karat product surfaces."

**10\. Byteboard.** **Insert acquisition banner at top of entry:** "🔴 ACQUIRED by Karat on January 16, 2025\. No longer a standalone competitor. Audit-doc partnership-candidate thesis is moot; the conversation is now Karat-level." Replace QOrium-relationship: "Byteboard is one of three Karat product surfaces (Karat Interviews \+ Triplebyte adaptive quizzes \+ Byteboard project scenarios). QOrium-Karat partnership pitch should reference all three."

### Tier 3 — India-Strong Platforms

**11\. iMocha.** Add: "**Customer count: 300+ clients globally, 15 Fortune 500 companies (Fujitsu, Ericsson, Capgemini, Deloitte, PayPal, UNICEF, Tata Advanced, Vanguard, BRAC). Investors: Mudhal VC, Eight Roads, RevUp Capital, Ringbolt Capital, Seeders \+ 6 more. Microsoft Azure partnership for AI-EnglishPro is a material credibility signal.**"

**12\. Xobin.** Add: "**1,000+ companies, 5,000+ recruiters, 55+ countries. Library: 800+ assessments \+ 1.2 lakh (120,000) questions, refreshed every 3 months. AI Evaluate uses Generative AI for automated answer evaluation. Pricing $100-$500/month entry.**"

**13\. HirePro.** Add: "**22-year operating history. Customers: TCS, Wipro, Infosys, Cognizant, HCL. Campus drives 50,000-500,000 candidates per drive. AI-powered proctoring. Multi-channel — on-campus offline \+ online \+ virtual hiring \+ video interviews \+ automated hiring.**"

**14\. Talview / Speedexam / SkillRobo cluster.** Add: "**Talview: $22.5M cumulative funding across 5 rounds (32 investors); 120+ countries; 10M+ candidates assessed. Customers: HCLTech, AAAE, La Trobe University, Cambridge.**" Update Talview product line: "**AI products: Alvy ('world's first AI proctor') \+ Ivy (Agentic AI interviewer with structured-interview trust controls). Active Agentic AI positioning.**"

**15\. Adaface.** Add: "**Singapore Government anchor customer; Adaface chatbot (Ada) handles candidate first-touch directly via the apply flow. SAP.iO Foundry Singapore 2019 cohort. Anti-leak operationalized: web-crawlers send alerts when any question leaks; questions recycled within 24 hours.**"

### Tier 4 — Emerging AI / Niche / Next-Gen

**16\. Vervoe.** Add: "**4.94/5 G2 (highest in cohort). 10 unique question types. Three-model AI grading: How (interaction patterns) \+ What (response content) \+ Preference (tuned to customer's style with \~20 calibration grades). AI-Powered Assessment Builder generates custom assessments from job description.**"

**17\. SHL.** Add: "**10,000+ organizations globally; OPQ available in 37 languages, 20-minute completion, 40+ years of UCF (Universal Competency Framework) science. Verify Numerical pricing: £26 per candidate, minimum admin cost £240. Coding/technical content is shallow — SHL partners with HackerRank or Codility for technical content rather than build it themselves.**"

**18\. Talogy.** **Replace audit-doc roll-up scope:** "Cubiks \+ PSI Services \+ IBM Kenexa" → "**Talogy \= rebrand of PSI Talent Management (2022). Roll-up of PSI Talent Management \+ Cubiks \+ Caliper \+ JCA Global \+ Performance Assessment Network \+ Select International \+ EB Jacobs \+ IPAT \+ Ottmann \+ Human Scope \+ Performance Based Selection \+ a\&dc \+ Innovative HR Solutions \+ OPRA \+ Human Systems Technology \+ Propel \+ Solvably (17 organizations total). 600 experts in 20+ countries; serves 10,000+ organizations. IBM Kenexa is NOT part of Talogy — Kenexa remains part of IBM (acquired by IBM in 2012). Talogy works with Kenexa as ATS integration partner only.**"

**19\. Glider AI.** Add: "**Customers: Intuit, PwC, Amazon, Capital One, FINRA. Pricing $299/month entry. G2 Top 50 AI Software 2024\. Outcomes claim: 3x placement rate, 50% reduction in time-to-fill, 98% candidate satisfaction improvement.**"

**20\. Testlify cluster.** Add: "**Testlify: 1,500+ teams, 50,000+ recruiters, 5M+ candidates assessed. Pricing: $99-$699/month credit-based (pay only when qualified candidate starts assessment). Toggl Hire (Tallinn 2017): 15,000+ questions. Canditech (Israel): work-sample focus, anti-cheat with ChatGPT detection \+ copy-paste prevention. eSkill (US): legacy long-running. IKM (US): legacy MCQ-only — illustrates what NOT to be in 2026\.**"

---

## 4\. Cross-cutting patterns (validated and refined)

### 4.1 The 6 authoring models — re-examined

The audit doc's Cross-Cutting table holds up. Confirmations and additions below.

| \# | Model | Used by (refined) | Strength | Weakness |
| :---- | :---- | :---- | :---- | :---- |
| 1 | In-house engineering authors (no I/O psych) | HackerRank, HackerEarth, WeCP (pre-acq), most India platforms (Xobin, HirePro, Testlify, Talview, Speedexam, SkillRobo) | Fast, technically credible | Bias/leakage blind spots |
| 2 | In-house I/O psychologist team | Mettl, Codility, **CodeSignal (full — Skills Evaluation Lab confirmed)**, SHL, Talogy, **Byteboard pre-acquisition** | Defensible, predictive validity | Slow, expensive, doesn't scale |
| 3 | Community-contributed | HackerRank practice (26M devs), CodinGame (2M devs), LeetCode-style | Massive volume, free/cheap | Quality variance, leakage |
| 4 | Customer-authored (BYO) | All of them, increasingly. **DevSkiller's customer-authoring against RealLifeTesting structure is the highest-bar variant.** | Customer locks in own IP | Pushes cost back to customer |
| 5 | AI-generated \+ human validated | Adaface, Vervoe, Glider AI, **WeCP (pre-acq)**, Xobin (AI Evaluate), Testlify, increasingly all | Speed \+ quality combined | Validation pipeline is the moat |
| 6 | Outsourced human-network (interviewers) | Karat (now incl. Byteboard projects \+ Triplebyte adaptive quizzes) | Highest signal for senior screens | People-cost ceiling |

**QOrium's bet (sharpened).** Combine \#2 (I/O psych validation) \+ \#5 (AI authoring speed) into a single content-as-a-service company that supplies all six end-state models above. **No incumbent does this end-to-end today.** The closest direct positioning competitor is **Glider AI** (pure-play AI-only platform, no I/O psych validation). QOrium differentiates as "AI-authored \+ I/O psych validated content for ANY platform."

### 4.2 Pricing band — fully mapped across 20 competitors

From cheapest entry tier to most expensive enterprise contract:

Codility Starter           $1,200/yr   (1 user, 120 invites/yr)

HR Starter                 $1,990/yr   (1 user)

Xobin entry                \~$1,200-6,000/yr ($100-500/month range)

HR Pro                     $4,490/yr   (unlimited users)

Codility Scale             $5,000/yr   (3 users, 25 invites/mo)

DevSkiller TalentScore     $5,988/yr   ($499/month)

Glider AI entry            $3,588/yr   ($299/month)

Testlify Starter           $1,188/yr   ($99/month, 10 credits)

Testlify Scale             $8,388/yr   ($699/month, 3,000 credits)

CodeSignal Pre-Screen      $19,000/yr   (starter kit — most expensive entry tier)

DevSkiller Enterprise      $60,000/yr  ($5,000/month — Skills Mgmt \+ Assessment)

HR Enterprise              \~$70,608/yr (Vendr 160-customer dataset average)

CodeSignal Enterprise      Custom (typ. $50K-200K+/yr)

Codility Enterprise        Custom (typ. $25K-100K+/yr)

Mettl Enterprise           Custom (typ. $25K-100K+/yr)

SHL                        Per-test pricing (£26/candidate Verify Numerical; min admin £240)

**QOrium API tier $5,000-25,000/yr** lands cleanly in the gap between mid-market entry tiers (top: DevSkiller TalentScore $5,988) and enterprise contracts (start: CodeSignal Pre-Screen $19,000). Defensible wedge.

### 4.3 ATS integration coverage — a real differentiator dimension

| Competitor | Verified ATS Integrations |
| :---- | :---- |
| HackerRank | 15+ — Greenhouse, Workday, iCIMS, Ashby, Lever, BrassRing, BreezyHR, Avature, Darwinbox, Freshteam, Zoho Recruit, SmartRecruiters, Jobvite, plus REST API \+ SAML SSO |
| Codility | 9+ — Greenhouse, Lever, SmartRecruiters, Workable, Teamtailor, SAP SuccessFactors \+ 3 |
| CodeSignal | 7 — Greenhouse, Workday, Lever, iCIMS, SmartRecruiters, LinkedIn Talent Hub, Ashby |
| DevSkiller | 7 — Greenhouse, Lever, Workable, JazzHR, LinkedIn Talent Hub, Slack, Zapier |
| HackerEarth | 4 — Greenhouse, Lever, Workday, SAP SuccessFactors |
| Mettl | ATS integrations \+ Mercer parent suite |
| iMocha | Multiple (specific list not enumerated this session) |
| WeCP | India ATS coverage strong |
| Talogy | Works with multiple ATS as integration partner (incl. Kenexa) |

**QOrium ATS priority list** (covers 4 of CodeSignal's 7 \+ 5 of HackerRank's 15+): **Greenhouse, Workday, Ashby, Darwinbox** (India), then later iCIMS, Lever, SmartRecruiters.

### 4.4 Anti-cheat maturity — the new table-stakes

| Competitor | Anti-cheat posture |
| :---- | :---- |
| HackerRank | Proctor Mode \+ Secure Mode \+ 93%-accurate AI Plagiarism Detection (publicly benchmarked) \+ AI-resistant question variants \+ DMCA takedown |
| Codility | Proctor Mode \+ plagiarism \+ AI-resistant tasks \+ ID verification \+ test playback |
| CodeSignal | Keystroke tracking \+ plagiarism \+ browser monitoring \+ ID verification \+ Certified Frameworks (multi-pronged validation) |
| Mettl | AI proctoring \+ Human \+ AI-assisted human \+ Recorded review \+ Secure Exam Browser \+ 3-point auth \+ facial recognition |
| HackerEarth | Tab-switch \+ audio monitoring \+ bot detection \+ code-similarity (effectiveness not publicly benchmarked) |
| DevSkiller | Anti-leak BY DESIGN (RealLifeTesting structure defeats memorization) |
| Adaface | Anti-leak BY OPERATION (web-crawlers \+ 24-hour rotation) |
| Talview | Alvy ("world's first AI proctor") |
| Karat | Human-network interview \= structural anti-cheat |
| WeCP | AI impersonation detection \+ advanced proctoring |

**QOrium minimum bar:** AI plagiarism \+ AI-resistant question types \+ ID verification \+ Adaface-style 24-hour rotation. Cite accuracy benchmark publicly (match HackerRank's 93% framing).

### 4.5 I/O psychology depth — who actually does the science

**Serious investment (real I/O psych team \+ published research):** Mettl, Codility, CodeSignal (Skills Evaluation Lab \+ GCF Technical Research Paper), SHL, Talogy. **Operational anti-leak (different moat, similar rigor):** Adaface (web-crawlers \+ rotation). **No I/O psych investment cited:** HackerRank, HackerEarth, DevSkiller, WeCP, Vervoe, Glider AI, Testlify, Xobin, HirePro, Talview cluster.

**QOrium positioning lever:** Cite IRT (Item Response Theory) \+ structured interview methodology \+ EEOC defensibility from Day 1\. Without these, QOrium can't sell to HR-driven enterprise buyers (where Mettl, Codility, SHL, Talogy compete). With these, QOrium is in the same defensibility tier.

---

## 5\. Three inescapable conclusions — validated with full evidence

### 5.1 No platform is content-rich AND content-fresh AND content-defensible

Each competitor makes a 2-of-3 trade-off:

| Competitor | Rich? | Fresh? | Defensible? |
| :---- | :---- | :---- | :---- |
| HackerRank | ✅ (\~7,500) | ❌ (famously leaked) | ➖ (mid — partner with SHL for psychometric) |
| Mettl | ✅ (100K Q) | ❌ (older content leaks) | ✅ (I/O psych \+ IRT) |
| HackerEarth | ✅ (17-25K, claim 40K) | ❌ (hackathons leak) | ❌ (no I/O psych cited) |
| Codility | ❌ (smaller) | ➖ (slow validation) | ✅ (I/O psych team, EEOC defensible) |
| CodeSignal | ❌ (smaller) | ➖ (slow per "2,800 hr/framework" claim) | ✅ (GCF research, Coding Score) |
| WeCP | ✅ (200K Q) | ❌ (now exiting market) | ❌ |
| DevSkiller | ➖ (5K tasks) | ❌ (each costs weeks to author) | ✅ (RealLifeTesting structural anti-leak) |
| Vervoe | ✅ (300K Q) | ➖ | ❌ (quality varies — volume not curation) |
| Adaface | ❌ (10,273) | ✅ (24-hour rotation) | ➖ (anti-leak only) |
| Glider AI | ❌ (500 skills) | ✅ (AI-fresh) | ❌ (I/O psych shallow) |
| SHL / Talogy | ✅ (decades-deep psychometric) | ❌ (slow) | ✅ (most-validated in world) |

**QOrium's value prop is the 3-of-3 combination, packaged as a service.** No incumbent does this today.

### 5.2 The "anti-leak" wedge is wide open

Only **Adaface** explicitly markets and operationalizes anti-leak (web-crawlers \+ 24-hour rotation). **DevSkiller** has structural anti-leak (RealLifeTesting), but slow library refresh prevents continuous engineering. **HackerRank** has DMCA takedowns (reactive) and AI-resistant variants (architectural). Nobody operationalizes anti-leak as a continuous engineering process at scale.

**QOrium's anti-leak rotation engine is genuinely novel** at the cross-customer-supply layer. Adaface is single-platform; QOrium can rotate across all 20 platforms.

### 5.3 India-specific stack content is materially under-served

SAP ABAP, Oracle HCM, Salesforce, BFSI core systems (Finacle, Flexcube), embedded automotive, telecom OSS/BSS — every GCC TA leader has these on their wish list. No platform's library covers these adequately:

- **HackerRank, Codility, CodeSignal:** Engineering-focused, not domain-specific.
- **Mettl, iMocha:** Domain coverage exists but India-stack-specific depth is shallow.
- **HirePro:** IT-services hiring deep, but campus-volume model doesn't extend to specialized ABAP/HCM testing.
- **WeCP (now exiting market):** Was strongest on India \+ GCC depth — opportunity opens further.

**QOrium India-stack content** \= the wedge. Phase 1 build target: 200+ SAP ABAP, 150+ Oracle HCM/EBS, 100+ Salesforce, 100+ Finacle/Flexcube, 50+ embedded automotive items.

---

## 6\. QOrium positioning v2 — post-research synthesis

### 6.1 Refined elevator pitch

*"QOrium is the question-factory layer that supplies fresh, calibrated, never-leaked technical and domain assessment content to any hiring platform. We combine AI authoring velocity with I/O psychology validation — the two moats nobody is doing together — and we specialize in the India-context content (SAP ABAP, Oracle HCM, BFSI, embedded automotive) that every Fortune 500 GCC needs and no incumbent platform delivers."*

### 6.2 Wedge defense across all 20 competitors

| Competitor | QOrium relationship (refined) | Rationale |
| :---- | :---- | :---- |
| HackerRank | API customer | Library is leaked; they admit it via customer-authoring tools |
| Mettl | API \+ white-label content partner | I/O psych team is bandwidth-constrained; India-stack content is QOrium's lever |
| HackerEarth | API customer | Hackathon-derived content has structural leakage |
| Codility | Partnership candidate | I/O psych validation as a service is their moat — QOrium feeds AI-velocity drafts |
| CodeSignal | API content partner (slow sale) | Senior-engineer focus leaves role-coverage gap; QOrium fills white space |
| WeCP | OBSOLETE — exited market March 2026 | Adjacent opportunity: AI-training content via Invisible Meridial |
| DevSkiller | **Strongest partnership candidate** | Per-task authoring is expensive; QOrium AI velocity solves the bottleneck |
| CoderPad / CodinGame | API customer | Community content has same leakage; QOrium premium curated tier |
| Karat | Content partner (multi-product after acquisitions) | Covers Karat Interviews \+ Triplebyte \+ Byteboard projects |
| Byteboard | OBSOLETE — Karat acquisition Jan 2025 | Conversation is now Karat-level |
| iMocha | API \+ content partner — Tier 1 priority | India \+ US dual presence; backend coding/domain content is thin; QOrium India-stack fills gap |
| Xobin | API customer | Content-starved mid-market platform |
| HirePro | Content partner / white-label | TCS/Wipro/Infosys customers also QOrium's enterprise targets |
| Talview cluster | API customer (quickest wins) | Content-starved by definition; AI-proctoring focus, weak on content |
| Adaface | **Partnership \+ API customer** | Anti-leak ally; QOrium is upstream of their human curation |
| Vervoe | API content partner | 300K library has quality variance; QOrium curated layer is premium upgrade |
| SHL | Partnership / content partner for technical content | They explicitly partner with HackerRank/Codility — QOrium India-stack adds depth |
| Talogy | Partnership / content partner | Same gap as SHL on technical content |
| Glider AI | **Direct positioning competitor** | Pure-play AI-only platform — QOrium positions as "AI-authored \+ I/O psych validated alternative" |
| Testlify cluster | API customer (first 50 logos play) | Newer mid-market with thin content teams |

### 6.3 Phase 1/2/3 implications

**Phase 1 (MVP, Months 1-12).** Focus: 20+ programming languages, 600+ sub-skills coverage (50% of canonical 1,229). Anti-leak rotation engine. IRT scoring. AI plagiarism \+ AI-resistant \+ ID verification. India-stack content priority (SAP ABAP, Oracle HCM, Salesforce, Finacle/Flexcube). ATS: Greenhouse \+ Workday \+ Ashby \+ Darwinbox.

Wedge customers: Testlify cluster \+ Talview cluster \+ Xobin \+ Adaface (partnership). Pricing $5K-15K/yr API tier.

**Phase 2 (Months 13-24).** Add psychometric LICENSED content (Mettl/3rd-party). Add aptitude module (9 sub-types — Mettl-equivalent). Expand to 40+ programming languages. AI-graded subjective question type. Talent management arm exploration (DevSkiller TalentBoost validates pattern).

Wedge customers: HackerEarth API (Tier 1 target) \+ iMocha partnership \+ DevSkiller content partnership. Pricing $15K-30K/yr.

**Phase 3 (Months 25+).** SHL/Talogy partnership for technical content layer (they already partner externally — clean opening). HackerRank API conversation. Codility partnership. CodeSignal API conversation (slow sale). AI-collaboration assessment question type. Adjacent AI-training content opportunity (Invisible Meridial-style).

### 6.4 Pricing wedge (final)

QOrium API tier **$5,000-25,000/yr** lands cleanly between mid-market entry tiers (top: DevSkiller TalentScore $5,988) and enterprise contracts (start: CodeSignal Pre-Screen $19,000). Above commodity question banks. Below platform Enterprise.

---

## 7\. Concrete edits to the existing QOrium document set

### 7.1 `01-Market-Landscape.md`

- Update HackerRank library figure (\~1,000 → \~7,500+).
- Update Mettl test count (800+ tests → 200-400+ tests / 800+ skills).
- Update HackerEarth library (40K → 17-25K).
- Add WeCP acquisition footnote (March 2026).
- Add Byteboard acquisition footnote (January 2025).
- Add Glider AI as direct positioning competitor in market segmentation map.

### 7.2 `02-Top-20-Competitor-Audit.md`

- Apply all per-competitor edits in section 3 above.
- Insert acquisition banners on WeCP and Byteboard entries.
- Correct Talogy roll-up scope (remove IBM Kenexa).
- Remove HackerEarth Talview claim.
- Update CodeSignal founding history (CodeFights 2014 → CodeSignal 2018 rebrand).
- Add full founder lists for Codility, CodeSignal, DevSkiller.
- Add funding figures and customer logos for all competitors where missing.

### 7.3 `03-Gap-Analysis.md`

- Refine 6 authoring models table with verified user lists per model.
- Add ATS coverage matrix (section 4.3 above).
- Add anti-cheat maturity matrix (section 4.4 above).
- Add I/O psychology depth matrix (section 4.5 above).
- Re-validate three inescapable conclusions with the cross-competitor evidence in section 5\.

### 7.4 `04-QOrium-Blueprint-v1.md`

- Refine elevator pitch (section 6.1).
- Refine wedge-defense table per competitor (section 6.2) — replace audit-doc QOrium-relationship sentences.
- Update Phase 1/2/3 sequencing (section 6.3) — explicit content sourcing strategy: license psychometric, build coding, partner-or-license aptitude.
- Update pricing tier (section 6.4) — defend $5K-25K/yr API band against the full 20-competitor pricing landscape.
- Add the partnership target list and competitive threat ranking.

### 7.5 `07-CTO-Architecture-v1.md`

- Add IRT scoring as non-negotiable architectural requirement (Mettl/SHL/Codility/Talogy precedent).
- Add Adaface-style web-crawler \+ 24-hour rotation engine to anti-leak design.
- Adopt 3-axis schema (Domain × Role × Type) for content tagging — based on HackerRank's Domain/Role/Type taxonomy.
- Add SonarQube-based code quality scoring (DevSkiller/CodeSignal precedent — open-source, easy parity).
- Reserve architectural room for AI-graded subjective question type by Phase 3\.
- Reserve room for AI-collaboration question type (Codility's "Generative AI Assessments" sub-category).
- ATS priority order: Greenhouse \+ Workday \+ Ashby \+ Darwinbox first.

### 7.6 `00-QOrium-Master-Mega-Doc.docx` / `00-QOrium-Master-Mega-Doc.md`

- Once 01-04 and 07 are updated, the Master Mega Doc rebuild will inherit these changes.

---

## 8\. QOrium-relationship classification — final

**OBSOLETE (acquired/exiting):**

- WeCP (acquired Invisible, March 2026\)
- Byteboard (acquired Karat, January 2025\)

**DIRECT POSITIONING COMPETITORS (compete directly):**

- Glider AI (closest direct positioning rival — AI-only platform)

**STRONG PARTNERSHIP CANDIDATES (content-supply ideal):**

- DevSkiller (per-task authoring bottleneck → QOrium AI velocity)
- Codility (I/O psych validates QOrium AI drafts)
- Adaface (anti-leak ally; QOrium upstream of their curation)
- SHL (technical content gap — they already partner externally)
- Talogy (same gap as SHL)

**TIER 1 API CUSTOMERS (highest LTV, slower sale):**

- HackerRank
- Mercer | Mettl
- HackerEarth
- CodeSignal
- iMocha

**TIER 2 API CUSTOMERS (mid-LTV, faster sale):**

- CoderPad / CodinGame
- Karat (now multi-product — Karat \+ Triplebyte \+ Byteboard)
- Vervoe
- HirePro (white-label opportunity)

**TIER 3 EASY API WINS (small ACV, fastest sale, scale via volume):**

- Xobin
- Talview cluster
- Testlify cluster (incl. Toggl Hire, Canditech, eSkill)
- IKM Assessments (legacy; minimal effort)

**ADJACENT OPPORTUNITY (Phase 3+):**

- Invisible Technologies / Meridial (AI-training expert validation — adjacent application of QOrium content)

---

## 9\. Inventory — what exists in the consolidation deliverable set

**Workbook.** `HackerRank-Capabilities.xlsx` — 44 tabs.

- Tier-1 deep-dives: HackerRank (10 tabs), Mettl (3), HackerEarth (5 incl. Skills-Full-List), Codility (3), CodeSignal (3).
- Tier-2 deep-dives: WeCP (3), DevSkiller (2), CoderPad/CodinGame (1), Karat (1), Byteboard (1).
- Tier-3 single-tab summaries: iMocha, Xobin, HirePro, Talview-Cluster, Adaface (5 tabs).
- Tier-4 single-tab summaries: Vervoe, SHL, Talogy, Glider-AI, Testlify-Cluster (5 tabs).
- Cross-cutting: Cross-Competitor-Compare (7-way), All-20-Quick-View, QOrium Implications.

**Research log.** `competitive_research_log.md` — 10 numbered findings \+ this consolidation entry.

**This document.** `08-Competitive-Capabilities-Consolidated-Final.md` (and `.docx`) — comprehensive synthesis. Single source-of-truth for the changes to be applied to existing QOrium docs 01-07 \+ Master Mega Doc.

**Workbook filename note.** `HackerRank-Capabilities.xlsx` is increasingly misleading. Recommend rename to `Competitive-Capabilities-Workbook.xlsx` at consolidation publication. CEO sign-off needed per saved feedback memory ("do not rename mid-research without asking").

---

## 10\. Three lines for the CEO

QOrium's wedge is empty and validated: WeCP literally exited it last month. The 6 authoring models in the audit doc are a real taxonomy — and nobody is doing \#2 (I/O psych validation) \+ \#5 (AI authoring) together, which is QOrium. Of 20 competitors, two have been acquired since the audit doc was drafted, three are strong partnership candidates, five are easy API wins for Year-1 logos, one is the direct positioning rival, and the rest tier into priority API customer queues — concrete partner outreach list and Year-1 logo target list are now actionable.

---

## 11\. Sources index

All sources for this consolidation are catalogued per-competitor in `competitive_research_log.md` (findings \#001-\#010) and in each competitor's tab in `HackerRank-Capabilities.xlsx`. Top-line acquisition / status sources:

- [Invisible Technologies acquires WeCP — BusinessWire March 10, 2026](https://www.businesswire.com/news/home/20260310738939/en/Invisible-Technologies-Agrees-to-Acquire-WeCP-to-Strengthen-Expert-Validation-for-High-Precision-AI-Workflows)
- [Karat acquires Byteboard — GeekWire January 2025](https://www.geekwire.com/2025/technical-recruiting-startup-karat-makes-third-acquisition-swooping-up-byteboard/)
- [Karat acquires Triplebyte — TechCrunch March 2023](https://techcrunch.com/2023/03/16/technical-recruitment-platform-karat-snaps-up-triplebyte-to-add-ai-based-quizzes-for-engineers/)
- [CoderPad acquires CodinGame — October 13, 2021](https://coderpad.io/press-releases/coderpad-acquires-codingame/)
- [Talogy rebrand from PSI Talent Management — PR Newswire 2022](https://www.prnewswire.com/il/news-releases/talogy-revealed-as-new-identity-for-psi-talent-management-and-all-of-its-acquisitions-803856317.html)
- [HackerRank Pricing 2026 — Lodely](https://www.lodely.com/blog/hackerrank-pricing-2026)
- [Codility — Why we raised a $22M Series A](https://www.codility.com/blog/why-we-raised-a-22m-series-a/)
- [CodeSignal — General Coding Framework research papers](https://codesignal.com/resource/general-coding-assessment-framework/)
- [Granatus Ventures — Tigran Sloyan founder story](https://www.granatusventures.com/founder-stories/tigran-sloyan-ceo-codesignal)
- [Mettl — Pre-built tests](https://mettl.com/en/pre-built-tests/)
- [HackerEarth — Wikipedia](https://en.wikipedia.org/wiki/HackerEarth)
- [DevSkiller blog — origin story (Forbes feature)](https://devskiller.com/blog/devskiller-discovering-hidden-potential/)
- [WeCP corporate](https://www.wecreateproblems.com/)
- [Adaface — Singapore Government case study](https://www.adaface.com/case-studies/singapore-government)
- [Karat $110M Series C — TechCrunch 2021](https://techcrunch.com/2021/10/13/karat-raises-110m-on-a-1-1b-valuation-to-grow-its-technical-interviewing-as-a-service-platform/)
- [SHL OPQ product page](https://www.shl.com/products/assessments/personality-assessment/shl-occupational-personality-questionnaire-opq/)
- [Talview corporate (Alvy \+ Ivy)](https://www.talview.com/en/)
- [Vervoe — Job Simulations](https://vervoe.com/job-simulation/)
- [Glider AI corporate](https://www.glider.ai/)

---

*End of `08-Competitive-Capabilities-Consolidated-Final.md` v1.0 — May 1, 2026\.* *Next deliverable suggested: apply the section-3 edits to `02-Top-20-Competitor-Audit.md` and the section-7 edits to `01`, `03`, `04`, `07`. Master Mega Doc rebuild downstream.*
