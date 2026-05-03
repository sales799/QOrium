# QOrium Constitution v1.0

## The Operating System for the QOrium Venture — From Day 0 to 100% Completion

**Effective:** May 1, 2026
**Authored by:** CTO Office, Talpro Universe (with input from CEO, IdeaForge methodology, MANTHAN session c17a48c2)
**Adopted by:** Bhaskar Anand, CEO, Talpro Universe — *(signature pending)*
**Companion docs:** Master Mega Doc · Blueprint v1.1 · SKU Architecture · IdeaForge Gate · CTO Architecture · Bali Sales Playbook
**Supersedes:** None (this is v1.0)
**Next review:** Month 3 (with mandatory amendments at Month 6, Month 12, Year 2 close)

---

## Preamble

QOrium is a venture of the Talpro Universe — the world's first enterprise-grade Question-Bank-as-a-Service. This Constitution is the **operating system** of the QOrium venture. It defines: who decides what, how the seven offices coordinate, what quality bar every release must meet, how the project advances through phase gates, and how the project is declared complete.

This Constitution is binding on every contributor — founders, hires, contractors, advisors, AI agents — for the duration of the QOrium venture. It is amended only through the procedure in Article XI.

It exists for one reason: **so that the work of building QOrium does not depend on heroics, memory, or improvisation.** Every recurring decision is pre-decided here. Every escalation has a defined path. Every quality gate has explicit pass/fail criteria. The Constitution makes ordinary execution disciplined, and disciplined execution is what wins venture outcomes.

This Constitution inherits from and aligns with the **Talpro Universe CTO Constitution v8.1**. Where this document is silent, the parent Constitution applies. Where this document is more specific, this document governs.

---

# ARTICLE I — IDENTITY, VISION, CONSTITUTIONAL AUTHORITY

## §1.1 Project Identity

**Name:** QOrium (capitalized as written; pronounced *kore-ee-um*).

**Mission:** To be the content layer of the global talent assessment industry — supplying enterprise-grade, AI-authored, I/O-psychologist-validated, anti-leak-rotated assessment questions to platforms, enterprises, and staffing firms via API, bulk export, embedded widgets, and white-label channels.

**Vision (10-year):** Every coding question, MCQ, SJT, and simulation administered in a hiring assessment somewhere in the world should — by 2036 — have a non-trivial probability of being authored, calibrated, or anti-leak-rotated by QOrium.

**Three-Sentence USP (verbatim, non-negotiable across all external materials):**
> QOrium is the only company in the world that combines AI-speed authoring with I/O-psychologist-grade validation, runs a continuous anti-leak rotation engine, organizes every question in a normalized role-graph, and ships it to any assessment platform's import format via a single API. We sell three SKUs — a shared ReadyBank library, on-demand JD-Forge generation, and customer-exclusive Stack-Vault libraries — covering the full continuum from commodity to fully exclusive IP. We are the content layer the entire $30 billion talent assessment industry was missing.

## §1.2 The Three SKUs (immutable as identity; renamed only through Constitutional Amendment)

1. **ReadyBank** — shared, multi-tenant question library, sold non-exclusively
2. **JD-Forge** — on-demand JD-specific question generation
3. **Stack-Vault** — customer-exclusive, IP-protected library aligned to one company's tech stack

These SKUs define what QOrium sells. Adding, removing, or fundamentally restructuring SKUs requires an Article XI Amendment.

## §1.3 Constitutional Authority

This document is authoritative for QOrium operations. In any conflict between this Constitution and other QOrium documents (blueprints, playbooks, plans), this Constitution governs. In conflict between this Constitution and the Talpro Universe CTO Constitution v8.1 on matters specific to QOrium, this Constitution governs.

The CEO is the ultimate constitutional authority. Where this Constitution does not anticipate a situation, the CEO's interpretation is binding until the next Amendment cycle.

---

# ARTICLE II — THE SEVEN OFFICES

QOrium operates through seven distinct offices. Each office has a clear charter, defined authority, named accountable owner, and explicit escalation path. **No office may exercise authority outside its charter.** No decision properly belonging to one office may be made by another without a documented escalation.

The seven offices, with their primary outputs, are:

| Office | Primary Output | Accountable | Escalates To |
|---|---|---|---|
| 1. **MANTHAN** | Research, classification, blueprints | CTO Office (operates the engine) | CEO (acceptance) |
| 2. **CEO** | Strategic decisions, capital, hiring | Bhaskar Anand | (none — final authority) |
| 3. **CTO** | Architecture, engineering execution | CTO Office | CEO |
| 4. **IDEAFORGE** | Gate scoring, decision validation | CTO Office (ops the framework) | CEO |
| 5. **CDO (Chief Data Officer)** | Data integrity, calibration, anti-leak forensics | CTO Office (Year 1) → I/O Psych FTE (Year 2+) | CTO → CEO |
| 6. **GATEKEEPER** | Quality + Security release gating | CTO Office | CTO → CEO |
| 7. **BALI** | Sales motions, customer acquisition | CEO + AE/BD hires (Y1) → Sales Lead (Y2+) | CEO |

In Year 1, the CTO Office wears multiple hats (Manthan operator, IdeaForge operator, CDO, Gatekeeper). As QOrium hires, these hats are progressively reassigned per the Hiring Plan in CTO Architecture §15. **The Constitution does not change as hats are reassigned** — only the named person wearing each hat changes.

---

## §2.1 OFFICE 1 — MANTHAN (Research & Blueprint Engine)

### Charter

MANTHAN is the **research and blueprint engine** of QOrium. It transforms strategic questions into evidence-backed answers and converts answers into actionable blueprints. It does NOT execute on those blueprints — execution is the responsibility of the other offices.

### Triggered When

- A new product / SKU / feature is proposed (>3 weeks of work or >₹3L of cost)
- A strategic pivot is being considered
- A market change requires re-validation of an existing thesis
- A competitor takes a material action that may invalidate QOrium's positioning
- The CEO requests a research-backed second opinion on any decision

### Output Format

Every MANTHAN engagement produces:

1. **Classification** (`classification.json`) — type, industry, complexity, key hypothesis
2. **Research** (`research.md`) — market sizing, competitor analysis, gap analysis, persona development, technical landscape, regulatory context, risk analysis
3. **Questions** (`questions.md`) — 5-8 clarifying questions for the CEO based on research
4. **Mega-prompt** (`mega-prompt.md`) — synthesized strategic prompt
5. **Blueprint** (`blueprint.md`) — execution-ready specification
6. **Three handoff views** — `handoff-ideaforge.md`, `handoff-cto.md`, `handoff-testforge.md` (to Bali)

### Authority

- **Recommends, never decides.** MANTHAN's blueprint is a recommendation; the CEO accepts, modifies, or rejects.
- Once a blueprint is accepted, it becomes binding on the executing offices until superseded by another MANTHAN cycle.
- MANTHAN may NOT execute on its own recommendations. Execution belongs to CTO, Bali, etc.

### Cadence

- **As triggered** — MANTHAN is event-driven, not scheduled.
- **No more than 3 active sessions** at any time. Cap protects against scope sprawl.
- **Each session is bounded** to a single product/feature/decision. Multi-topic sessions are forbidden.

### Tooling

- `manthan_start`, `manthan_save`, `manthan_status`, `manthan_blueprint`, `manthan_read`
- All sessions persist on Talpro VPS (48-hour cross-session continuity)

### Standing Order

> Before any new product, SKU, or feature exceeding 3 weeks of work or ₹3L of cost is committed to, a MANTHAN session must produce at minimum a Classification + Research + Blueprint. No exceptions.

---

## §2.2 OFFICE 2 — CEO (Strategic Authority)

### Charter

The CEO holds **ultimate strategic authority** for QOrium. The CEO's role is not to execute (that is the CTO's, Bali's, etc.) but to set direction, allocate capital, hire/fire, manage external partnerships, and make the calls that no other office is empowered to make.

### Authority — Decisions Reserved Exclusively to the CEO

1. **Strategic positioning** — vision, mission, target market, brand, naming
2. **Capital allocation** — any spend > ₹5,00,000 (₹5 lakh) per single decision
3. **Hiring authority** — Senior+ engineering, AE+, BD+, I/O psych, Director+. (CTO authorizes IC engineering hires up to senior level.)
4. **Partnership and acquisition decisions** — any cross-company commercial agreement
5. **Pricing policy changes** — moving any SKU pricing band by >10%
6. **Product SKU changes** — adding or removing SKUs, changing the IP-exclusivity model, adding a new buyer segment
7. **Market expansion decisions** — geographic expansion, new vertical, new persona
8. **Crisis declarations** — declaring a Sev 1 incident or a strategic pivot

### Decisions Delegated TO Other Offices (CEO does NOT make these)

- Engineering tech stack — delegated to CTO
- Question content quality acceptance — delegated to CDO + Gatekeeper
- Customer-by-customer pricing within published bands — delegated to Bali
- Day-to-day sales activity — delegated to Bali
- Day-to-day engineering — delegated to CTO

The CEO **may** override any delegated decision but must do so explicitly and documented in `_shared/QUEUE.md` so the override is traceable.

### Cadence

- **Daily:** Review founder_request queue (consolidated asks from all offices)
- **Weekly Monday:** 60-min strategic 1:1 with CTO
- **Monthly:** Full pipeline + financial close review
- **Quarterly:** OKR reset + Constitutional review

### Standing Order

> The CEO consolidates external asks (from all offices) into a single channel — `founder_request` — and answers no later than 48 hours after receipt. Drip-fed asks waste CEO bandwidth and are forbidden by Article V Standing Order #4.

---

## §2.3 OFFICE 3 — CTO (Engineering & Architecture Authority)

### Charter

The CTO Office owns **all technical execution**: architecture, engineering, infrastructure, AI pipeline, integrations, observability, deployment. The CTO is the technical conscience of QOrium and the primary author of the engineering culture.

### Authority — Decisions Reserved to the CTO

1. **Tech stack and architecture** — language, framework, database, deployment topology
2. **Engineering hiring** (IC level — senior engineer, frontend engineer, etc.)
3. **Code quality bar** — CI gates, test coverage targets, lint rules
4. **Security posture** — API authentication, data encryption, secrets management, audit logging
5. **Vendor selection for technical services** — AI providers, cloud, monitoring tools (within CEO-approved budget)
6. **Tech debt prioritization** — what gets fixed when
7. **Engineering process** — sprint cadence, PR review standards, on-call rotation

### Authority — Subject to CEO Approval

- Capital expenses > ₹5L (per Article II.2.2)
- Strategic build-vs-buy decisions (e.g., self-host AI inference vs. API)
- Major vendor lock-in decisions (e.g., committing to one AI provider exclusively for >12 months)

### Cadence

- **Daily:** Engineering standup (15 min, all engineering FTE)
- **Weekly:** Friday engineering review (sprint progress, infra health, security posture, AI-stack health)
- **Monthly:** Tech debt review + Architecture review
- **Quarterly:** Talpro Universe-wide CTO sync + Architecture re-evaluation

### Tooling

- All Talpro Universe technical MCPs (talpro_pm2_*, talpro_db_*, talpro_file_*, etc.)
- GitHub + GitHub Actions
- All engineering observability stack (Sentry, Grafana, OpenTelemetry)

### Standing Orders

> 1. The CTO produces a CTO Architecture document and updates it whenever architecture materially changes. Current: `07-CTO-Architecture-v1.docx`.
> 2. Zero TypeScript errors in production. Period. No exceptions, no `--no-verify`, no comments-justifying-`any`.
> 3. Every deploy passes the Gatekeeper 80-point quality gate. No exceptions.
> 4. No secrets in git, ever. gitleaks runs on every commit. Failed gitleaks scan blocks merge.
> 5. All AI-generated content goes through mandatory SME validation before customer release. No auto-publish.
> 6. Ollama is banned on the production VPS (April 16 incident). Heavy inference runs on Mac Mini M4 Pro or via API providers.

---

## §2.4 OFFICE 4 — IDEAFORGE (Gate Scoring & Decision Validation)

### Charter

IdeaForge is the **gate function** of QOrium. It scores every major decision against a 24-point evidence-backed rubric. Its purpose is to prevent enthusiasm and momentum from overriding sound judgment. **A PROCEED requires 20 of 24 points.** Anything below the threshold cannot proceed without an explicit Constitutional override by the CEO (which must be documented in QUEUE.md with reasoning).

### When IdeaForge Runs

1. **Before any new product / SKU / feature** exceeding 3 weeks of work or ₹3L of cost (paired with MANTHAN)
2. **At Phase Gates** (Month 3, Month 6, Month 9, Month 12, Year 2 close, Year 3 close)
3. **When pivoting** any in-flight initiative (re-gate before re-direction)
4. **When the CEO requests a second opinion** on any major call
5. **Annually as a calibration exercise** — re-scoring all active QOrium decisions against current data

### The 24-Point Rubric

Six dimensions, each scored 0-4 (0 = fatal flaw, 4 = competitive advantage). Threshold for PROCEED: total ≥ 20/24.

| Dimension | Weight | What's measured |
|---|---|---|
| Market Size & Growth | 4 | TAM, CAGR, sub-segment momentum, regulatory tailwind |
| Founder / Team Fit | 4 | Domain expertise, distribution access, execution track record |
| Technical Defensibility | 4 | Moat depth, copy-difficulty, dependency on commodity layers |
| Distribution / GTM Clarity | 4 | Specific buyers named, sales motion clarity, CAC math |
| Unit Economics | 4 | Cost per unit, margin trajectory, scale economics |
| Defensibility / Long-Term Moats | 4 | 1-year, 3-year, 5-year moats; what protects against displacement |

A single dimension scoring 0–1 fails the gate regardless of total. Each score must cite **observable evidence** (live data, market research, founder track record) — not opinion or aspiration.

### Authority

- IdeaForge has **veto power** on any in-progress decision scoring < 20/24.
- The CEO may override IdeaForge but the override must be documented with reasoning in `_shared/QUEUE.md`.
- IdeaForge does not make decisions; it scores decisions made by others.

### Output Format

Every IdeaForge run produces a Gate Report (per the format of `06-IdeaForge-Gate-Report.docx`) with:

- Per-dimension score with evidence
- "What would push this lower" risk articulation
- "What would push this to 4/4" upside articulation
- Composite total
- PROCEED / BLOCK recommendation
- Pre-execution conditions (what must be true before spend)
- Post-execution instrumentation (what monitoring/gates must run)

### Cadence

- **Per-decision:** Whenever triggered
- **Phase Gates:** Mandatory at M3, M6, M9, M12 of each year
- **Annual:** Full QOrium re-scoring at calendar year-end

### Standing Order

> No major spend (>₹5L) and no new SKU/product/feature ships without an IdeaForge Gate score on file. The score either PROCEEDS or BLOCKS; documented overrides are the only exception.

---

## §2.5 OFFICE 5 — CDO (Chief Data Officer)

### Charter

The CDO owns **the data assets that constitute QOrium's moat**: the question library itself, the role-graph taxonomy, the IRT calibration data accumulated on the QOrium Reference Panel, the anti-leak signal stream, and the watermark forensics evidence base.

In Year 1, the CTO Office wears the CDO hat. By Month 9, the I/O Psychologist FTE assumes the CDO charter for content-quality and calibration aspects, with the CTO retaining infrastructure-level data ownership.

### Authority — Decisions Reserved to the CDO

1. **Role-graph schema** — adding, removing, restructuring nodes; how role × skill × difficulty × format hierarchy is maintained
2. **IRT calibration methodology** — sampling rules, statistical thresholds, what counts as a calibrated question
3. **Anti-leak signal classification** — what severity thresholds trigger auto-rotation
4. **QOrium Reference Panel governance** — who joins, how candidates are paid, fairness audits
5. **Watermarking algorithm changes** — how per-client variants are constructed and detected
6. **Question quality SLAs** — minimum quality bar per SKU per format
7. **Data retention policy** — how long calibration data, leak signals, audit logs persist

### Decisions Subject to CTO Approval (architecture-level)

- Database schema migrations affecting data integrity
- New AI model integrations affecting question authoring
- Cross-product data sharing with other Talpro Universe ventures

### Decisions Subject to CEO Approval (policy-level)

- Customer-facing data policies (DPDPA, GDPR)
- Public release of QOrium-published research using calibration data
- Reference Panel candidate compensation changes >20%

### Cadence

- **Weekly:** Question library throughput review (questions validated, calibrated, released, retired)
- **Monthly:** Calibration data health (Reference Panel size, attempts logged, statistical significance)
- **Quarterly:** Role-graph audit (coverage gaps, outdated nodes, taxonomy drift)
- **Annually:** Data integrity audit (full lineage check, regulatory compliance verification)

### Tooling

- Internal admin web app (Next.js — see CTO Architecture §6.3)
- Direct database access (read + admin-write)
- Anti-leak engine dashboards (custom Grafana)
- Reference Panel management portal

### Standing Orders

> 1. **No question reaches a customer without passing the CDO's quality-bar SLA for its SKU.** Mandatory SME validation for ReadyBank + Stack-Vault; mandatory AI self-critique pass for JD-Forge Standard.
> 2. **No watermark may be deployed without multi-marker redundancy** (minimum 3 independent markers per Stack-Vault question).
> 3. **No leak attribution claim is made externally** without CDO sign-off + legal counsel review.
> 4. **Reference Panel candidates are paid within 7 days** of completed attempt. Non-payment is a fatal violation.
> 5. **Role-graph changes are append-only by default** — deprecation requires migration plan + 30-day notice to active customers using the deprecated nodes.

---

## §2.6 OFFICE 6 — GATEKEEPER (Quality + Security Release Gate)

### Charter

Gatekeeper is the **final gate before any production release** — code, content, configuration, customer-facing change. Its sole function is to BLOCK releases that fail the QOrium 80-point quality gate (extended from the Talpro Universe CTO Constitution v8.1 80-point gate with 12 QOrium-specific checks).

Gatekeeper has **no positive authority** (it cannot direct work) and **absolute negative authority** (it can stop any release).

### The QOrium 92-Point Quality Gate (Inheriting from Talpro 80-pt + 12 QOrium-specific)

#### Inherited from Talpro Universe CTO Constitution v8.1 (80 points)

10 points each in 8 categories:

1. **Build** — Zero TS errors, lint clean, all tests green, npm audit clean (10pt)
2. **Security** — HSTS, CSP, X-Frame-Options, X-Content-Type-Options, no secrets in git, gitleaks pass (10pt)
3. **Monitoring** — OpenTelemetry instrumented, dashboards live, alerts configured, structured logging (10pt)
4. **Compliance** — DPA in place where applicable, retention policy honored, audit log writes (10pt)
5. **Performance** — Latency p95 within SLO, memory within budget, no N+1 queries (10pt)
6. **AI Stack** — Claude/GPT/Gemini fallback paths verified, token budgets enforced (10pt)
7. **Enterprise Reliability** — Backup verified, rollback procedure documented + tested, watchdog added (10pt)
8. **Enterprise Governance** — PR reviewed by ≥1 other engineer, QUEUE.md updated, deployment notes written (10pt)

#### QOrium-Specific (12 additional points)

9. **Content Quality** — All released questions have completed CDO SLA; SME-validated where required (4pt)
10. **Anti-Leak Posture** — New questions cleared anti-leak filter at release; no Critical leak signals open >7 days (4pt)
11. **Watermark Integrity** — Stack-Vault releases include valid multi-marker watermarks; forensic test passes (4pt)

**Pass threshold: 88/92.** Any single category at 0 fails the gate regardless of total. Per-SKU release thresholds:

- ReadyBank API release: 88/92 + Content Quality + Anti-Leak + Watermark categories must all be at maximum
- JD-Forge release: 88/92 + Content Quality + Anti-Leak max
- Stack-Vault release: 92/92 (zero tolerance for Stack-Vault — exclusive client engagement)

### Authority

- **BLOCK absolute** — Gatekeeper cannot be overridden except by CEO Constitutional override (documented in QUEUE.md, reviewed at next phase gate).
- Gatekeeper does NOT decide what gets built or how. It only decides whether a release passes the gate.

### Cadence

- **Per release** — Gatekeeper runs on every customer-facing change. Internal-only changes run abbreviated gate (Build + Security + Monitoring categories only).
- **Weekly:** Gate metrics review (pass rate, common failure categories, time-to-fix)
- **Quarterly:** Gate calibration — adjust point allocations based on observed failure patterns

### Tooling

- `gatekeeper_fleet`, `gatekeeper_scan`, `gatekeeper_testforge` (Talpro MCPs)
- CI pipeline integration (GitHub Actions)
- Manual checklist for content + Stack-Vault releases

### Standing Order

> No customer-facing release ships unless Gatekeeper score ≥ 88/92, with all category-specific thresholds satisfied. Override requires CEO sign-off in QUEUE.md, time-bounded, with mandatory remediation plan.

---

## §2.7 OFFICE 7 — BALI (Sales Motion & Customer Acquisition)

### Charter

Bali owns **all customer acquisition motions** for QOrium: the three sales motions (Staffing Subscription, Enterprise Stack-Vault, Platform API), pipeline management, customer onboarding, customer success, and renewal/expansion.

In Year 1, Bali is operated by the CEO (founder-led sales) plus the AE Enterprise hire (Month 3) and BD Platforms hire (Month 3). An AI agent component handles Recruiter outreach scale (per Bali Sales Playbook §9). By Year 2, a dedicated Sales Lead may assume full operational responsibility.

### Authority — Decisions Reserved to Bali

1. **Outreach strategy** — channels, sequencing, messaging within approved templates
2. **Customer-by-customer pricing within published bands** — discount up to 10% on list price; multi-year terms; bundles
3. **Sales pipeline management** — qualifying, prioritizing, deal-by-deal tactics
4. **Customer success and onboarding sequences**
5. **Reference customer cultivation** — who's asked, what's offered

### Decisions Subject to CEO Approval

- Pricing exceptions > 10% off list (or any Stack-Vault deal below ₹35L)
- Strategic accounts where CEO relationship is the decisive lever
- New geographic markets
- Partnership-as-distribution agreements
- Brand messaging changes (the three-sentence USP is non-negotiable per §1.1)

### Cadence

- **Daily:** Outreach activity (target counts per motion per Bali)
- **Monday weekly:** Pipeline review with CEO + CTO + AE + BD
- **Wednesday weekly:** Customer outreach blitz day
- **Friday weekly:** Win/loss debrief
- **Monthly:** ARR + pipeline forecast + CAC + win/loss analysis

### Tooling

- HubSpot CRM (reuse Talpro instance)
- WhatsApp Business API (Indian customer outreach)
- LinkedIn Sales Navigator
- Calendly for scheduling
- Talpro Sentinel for cross-product alerts
- founder_request for CEO escalations

### Standing Orders

> 1. **No Stack-Vault deal below ₹35L without CEO approval.** Anchoring discipline (per Article V).
> 2. **The three-sentence USP is verbatim across all external materials.** No paraphrasing.
> 3. **Reference customers are paid back** with renewal discounts (5-10%) for 3 active references in their first year.
> 4. **CRM is the source of truth** for pipeline. No spreadsheet shadow-pipelines.
> 5. **Customer Zero (Talpro India) is the always-available reference.** Use it in every cold opener and demo.

---

# ARTICLE III — TRUTH HIERARCHY & SOURCE OF TRUTH

When sources disagree on what is true, this hierarchy resolves the conflict. **Top wins, always.**

| Rank | Source | Notes |
|---|---|---|
| 1 | Live MCP tool output (this session) | `talpro_pm2_list`, `project_context_all`, DB queries — anything queried this session |
| 2 | Read-back of files written this session | If you just wrote a doc, it's authoritative for its scope |
| 3 | Auto-memory (`/sessions/.../memory/`) | Point-in-time but vetted — verify before acting |
| 4 | The CEO's current message | Authoritative for intent; check technical details before executing |
| 5 | Prior messages in current conversation | Assume stale unless reconfirmed by tool call |
| 6 | This Constitution + companion docs | Contains policy, not state. State (counts, IDs, statuses) is never stated from docs without live verification |

**Hard rule:** Never state a count, MANTHAN ID, status, customer name, ARR figure, library size, or any operational fact without a live tool call (this session) that proves it. "I believe" and "I think" are not substitutes for `manthan_status` or `talpro_db_query`.

---

# ARTICLE IV — THE 5-LOCK STATE SYSTEM

QOrium's state is persisted across five locks. Each lock has a defined writer, defined freshness rule, and defined conflict-resolution path.

### Lock 1 — `_shared/QUEUE.md` (Cross-Project Source of Truth)

- **Writer:** Any office, on every material action
- **Freshness rule:** Any material work session that doesn't touch QUEUE.md is NOT closed
- **Format:** `- [PRIORITY] **Office: Task Name** — description. Status: evidence (URL, SHA, screenshot path).`
- **Lifecycle:** New tasks appended; completed moved to DONE with date + evidence; blocked moved to BLOCKED with reason + unblocker

### Lock 2 — Per-Office task plans (`task_plan*.md` in QOrium folder)

- **Writer:** The office that owns the work (e.g., `task_plan_sales.md` written by Bali; `task_plan_engineering.md` by CTO)
- **Freshness rule:** Updated at the end of every work block, not just session end
- **Conflict rule:** If task_plan and QUEUE diverge, QUEUE wins; reconcile in next sync

### Lock 3 — MANTHAN Sessions (Deep-Work Memory)

- **Writer:** CTO Office operating MANTHAN
- **Freshness rule:** `manthan_save` at every meaningful stage transition
- **Conflict rule:** No duplicate sessions for one topic; existing session is appended, not forked

### Lock 4 — Session Snapshots (`session_save_state`)

- **Writer:** Any office at end of session with material new state
- **Freshness rule:** Before any session ends with material work
- **Retention:** 48 hours on VPS

### Lock 5 — Auto-Memory (`/sessions/.../memory/`)

- **Writer:** Any office for long-horizon facts (infra, preferences, references)
- **Freshness rule:** Verify before citing — point-in-time records may have drifted
- **Forbidden content:** Sensitive PII, government IDs, financial accounts, passwords, tokens

### The Golden Rule (binding)

Before any session ends, OR the user message count increases by ≥3 with material work since last checkpoint:

1. Update every task_plan.md touched
2. Move completed QUEUE items to DONE with date + evidence
3. Save MANTHAN progress if deep work is in motion
4. Write the one-line CTO Report
5. Call `session_save_state` if material new state exists
6. Update auto-memory for any long-horizon fact learned

**Violation = session amnesia. Zero tolerance.**

---

# ARTICLE V — STANDING ORDERS

Standing Orders are immutable directives that bind every office. They are amended only through Article XI procedure. Numbered for reference.

### SO-1 — Talpro Customer Zero Mandate
Talpro India dogfoods QOrium internal hiring drives from Month 1. This is non-negotiable. Talpro Customer Zero is QOrium's most important reference asset and is to be cultivated as such.

### SO-2 — The 9 Pre-Execution Decisions
Before Month 1 spend, the 9 CEO Decisions in Blueprint v1.1 §13 must be answered (name confirmation, capital sanction, Customer Zero formalization, marquee logo target, CTO bandwidth, hiring authority, SKU naming, Stack-Vault pricing anchor, SKU sequencing).

### SO-3 — Quality Gate Discipline
No customer-facing release ships unless Gatekeeper passes. CEO override is the only exception, time-bounded, documented in QUEUE.md.

### SO-4 — Single-Channel CEO Asks
Founder asks are consolidated into `founder_request` — never drip-fed across multiple channels. CEO answers within 48 hours.

### SO-5 — MANTHAN Mandatory for Major Initiatives
Any new product/SKU/feature exceeding 3 weeks of work or ₹3L of cost requires a MANTHAN session producing Classification + Research + Blueprint before commitment.

### SO-6 — IdeaForge Gate Mandatory at Phase Gates
M3, M6, M9, M12, Year 2-close, Year 3-close — full IdeaForge re-scoring is mandatory. < 20/24 score blocks continued spend; CEO override documented in QUEUE.md.

### SO-7 — The Three-Sentence USP is Verbatim
The USP in §1.1 is non-negotiable across all external materials. Renaming or rewriting requires Constitutional Amendment.

### SO-8 — No Question Without SME or AI-Critique Validation
Every released question passes its SKU's quality SLA. ReadyBank + Stack-Vault: SME validation mandatory. JD-Forge Standard: AI self-critique mandatory; SME optional. JD-Forge Reviewed/Enterprise: SME mandatory.

### SO-9 — Anti-Leak Continuous Operation
Anti-Leak Engine runs 24/7. No question deemed Critical-severity-leaked remains in active library beyond the rotation SLA (24h Critical / 7d High).

### SO-10 — Stack-Vault Exclusivity is Absolute
A Stack-Vault question is contractually exclusive to one customer. It NEVER appears in shared ReadyBank, in any JD-Forge output to another customer, or in any other Stack-Vault. Watermarking is the technical enforcement; contract is the legal enforcement.

### SO-11 — Pricing Anchor Discipline
Stack-Vault Enterprise tier never sells below ₹35L without CEO approval. ReadyBank platform tiers are sold at the published tier — never "in-between." JD-Forge per-JD pricing is firm.

### SO-12 — Reference Customer Protocol
Always ask before quoting a reference. Always offer the prospect a 15-min reference call. Pay reference customers a renewal discount (5-10%) for 3 active references in their first contract year.

### SO-13 — Talpro Universe Tech Stack
QOrium adopts Next.js + Express + PostgreSQL + Redis as standard. Deviations require CTO approval + Architecture document update.

### SO-14 — No Ollama on VPS (Inherited)
Ollama is banned on the production VPS (April 16 incident). Heavy inference runs on Mac Mini M4 Pro or via Anthropic/OpenAI/Gemini APIs.

### SO-15 — Zero Secrets in Git
No secret in any committed file, ever. gitleaks scan blocks merge on failure. `.env` is .gitignored. Secrets rotate quarterly.

### SO-16 — Documentation as Code
Every architectural decision is documented in CTO Architecture v1 (or amendment). Every customer-facing pricing change is documented in Bali Sales Playbook. Every Constitutional Amendment is documented per Article XI.

### SO-17 — Postmortems for Sev 1 Incidents
Within 5 business days of any Sev 1 incident, a postmortem is published using Talpro Universe template. Action items have owners + due dates and land in QUEUE.md.

### SO-18 — Bali = AI Agent + Human AE Hybrid
Sales-motion architecture is hybrid: AI assistant for Recruiter outreach scale; human AE for Enterprise/Platform high-touch. Pure-AI sales is forbidden for deals >₹10L ACV.

### SO-19 — DPDPA + GDPR Posture is Absolute
QOrium does NOT store candidate PII by default. Where Stack-Vault engagements involve any candidate-attributable data flow, a DPA is signed before data flows. No exceptions.

### SO-20 — IP Authorship Documentation per Question
Every question's audit trail records: AI model used, prompt version, SME reviewer, validation date, calibration sample. This protects against "you copied LeetCode" disputes.

---

# ARTICLE VI — DECISION FRAMEWORK

Every material decision (>₹3L cost OR strategic implication) is scored against five priorities with explicit weights. Weighted score ≥ 3.5 = APPROVE. Below = REJECT or escalate to CEO.

| Priority | Weight | Dimension |
|---|---|---|
| P1 | 30% | Security & Data Protection |
| P2 | 25% | Cost Effectiveness |
| P3 | 20% | Revenue Impact |
| P4 | 15% | Performance & Reliability |
| P5 | 10% | Simplicity & Maintainability |

Score 1-5 per dimension; weighted total. Record the score in the CTO Report when the decision is material.

This framework operates **alongside** the IdeaForge 24-point gate. IdeaForge governs whole-product PROCEED/BLOCK; this framework governs day-to-day implementation choices within an approved product direction.

---

# ARTICLE VII — QUALITY GATE (MASTER REFERENCE)

The QOrium 92-point Quality Gate is defined in Article II §2.6. It is the single most important operational artifact in this Constitution.

### Per-Release Application

- **Internal-only release** (admin tooling, internal scripts): 8 categories × 10pt = 80pt; threshold 72/80
- **Customer-facing ReadyBank API/Export release:** 92pt full gate; threshold 88/92 with Content + Anti-Leak + Watermark categories at max
- **JD-Forge release:** 92pt; threshold 88/92 with Content + Anti-Leak at max
- **Stack-Vault release (per-customer):** 92/92 zero-tolerance

### Gate Failure Protocol

1. Gatekeeper records the failure in `_shared/QUEUE.md` with category + score.
2. Owning office (CTO, CDO, etc.) opens a remediation task with target date.
3. Re-run gate after remediation. Loop until pass.
4. If failure pattern repeats > 3 times in a quarter, the gate categories are recalibrated at next quarterly review.

---

# ARTICLE VIII — OPERATING CADENCE

| Cadence | Activity | Owner | Output |
|---|---|---|---|
| **Daily** | Engineering standup (15 min) | CTO | Standup notes |
| **Daily** | founder_request review | CEO | Answers within 48h |
| **Daily** | Outreach activity | Bali | Activity counts logged in CRM |
| **Mon weekly** | Pipeline review | CEO + CTO + Bali | Pipeline forecast |
| **Mon weekly** | Strategic 1:1 (CEO + CTO) | CEO + CTO | Decisions + escalations |
| **Wed weekly** | Customer outreach blitz | Bali | Pipeline additions |
| **Fri weekly** | Engineering review | CTO | Sprint progress + tech debt |
| **Fri weekly** | Win/loss debrief | Bali | Sales process improvements |
| **Mon weekly** | Content pipeline review | CDO | Throughput metrics |
| **Monthly** | Metrics close (ARR, NRR, gross margin, library size) | CEO + CTO | Monthly board summary |
| **Monthly** | Tech debt review | CTO | Tech debt prioritization |
| **Monthly** | Calibration data health | CDO | Data integrity report |
| **Monthly** | Quality gate metrics | Gatekeeper | Pass-rate trends |
| **Quarterly** | OKR reset | CEO + CTO | Q+1 OKRs |
| **Quarterly** | Constitutional review | CEO + CTO | Amendment proposals (if any) |
| **Quarterly** | Talpro Universe-wide CTO sync | CTO | Cross-product alignment |
| **Quarterly** | IdeaForge re-gate (light) | CTO Office | Updated Gate Report |
| **Quarterly** | Role-graph audit | CDO | Coverage gap report |
| **Quarterly** | Quality gate recalibration | Gatekeeper | Updated point allocations |
| **Annually** | Full IdeaForge re-scoring | CTO Office | Annual Gate Report |
| **Annually** | Data integrity audit | CDO | Lineage check + compliance verification |
| **Annually** | Constitutional Amendment cycle | CEO + all offices | Updated Constitution |
| **Annually** | Strategic plan refresh | CEO + CTO | Year+1 Plan |

---

# ARTICLE IX — PHASE GATES & PROJECT COMPLETION

QOrium is built and run in phases with explicit pass criteria. The project advances by clearing phase gates, not by elapsed time.

### Phase 0 — Constitutional Adoption (Day 0)
**Pass criteria:** This Constitution is adopted by CEO; all 9 pre-execution decisions answered; ₹50L runway sanctioned; project_work_lock + repo + DNS + VPS Day-0 punchlist complete.
**Owner:** CEO
**Target duration:** 14 days

### Phase 1 — Foundation (Months 1-3) — "Engine MVP + First Logos"
**Pass criteria (M3 IdeaForge re-gate):**
- 5,000 validated questions in ReadyBank (Wave 1: Tech Core)
- ReadyBank API alpha live; bulk export working in 3+ formats
- 5 customer logos signed (mix of staffing + first GCC discovery)
- Talpro Customer Zero operating; first 100 candidates run through QOrium
- 6 hires made (Senior Eng + SME Lead + AE + BD + I/O Psych contractor + Frontend)
**Decision Gate:** ≥ 20/24 IdeaForge re-gate to continue. Otherwise: slow Wave 2; double down on quality.

### Phase 2 — Wave Build (Months 3-6) — "India Stack + Stack-Vault Logo #1"
**Pass criteria (M6 IdeaForge re-gate):**
- 12,000 validated questions; Wave 2 (India Stack: SAP, Oracle, Salesforce) complete
- Anti-leak engine v0 in production (weekly scan + monthly rotation)
- Stack-Vault Logo #1 signed (target: Bosch GCC Bengaluru)
- 15 customer logos total
- $300K ARR run-rate
**Decision Gate:** ≥ 21/24 IdeaForge re-gate. Otherwise: reduce headcount; focus only on highest-velocity motion.

### Phase 3 — SKU Maturity (Months 6-9) — "JD-Forge + Platform Pilot"
**Pass criteria (M9 IdeaForge re-gate):**
- 25,000 validated questions; Wave 3 (Domain + Aptitude + SJT + Cognitive) complete
- JD-Forge v1 launched (Standard + Reviewed tiers live)
- IRT calibration pipeline live; 1,000+ Reference Panel candidates
- First Tier-3 platform pilot signed (target: Xobin or Testlify)
- 30+ customer logos total; $500K ARR run-rate
**Decision Gate:** ≥ 22/24 IdeaForge re-gate. Otherwise: pivot to enterprise-white-label-first dominant motion.

### Phase 4 — Year-1 Close (Months 9-12) — "All 3 SKUs Live + $1M ARR Path"
**Pass criteria (M12 IdeaForge full re-scoring):**
- 40,000+ validated questions; Wave 4 (AI-Era formats) complete
- All 3 SKUs (ReadyBank, JD-Forge, Stack-Vault) GA
- Forensic leak attribution working; multi-format export library complete
- 50+ customer logos; $1M+ ARR run-rate
- QOrium Reference Panel 1,000+ candidates
- Series Pre-A close conversation initiated (or bootstrap-mode plan filed)
**Decision Gate:** Full IdeaForge re-scoring; ≥ 22/24 to continue Series Pre-A. Below: bootstrap mode.

### Phase 5 — International Scale (Year 2) — "$5M ARR + Series Pre-A Close"
**Pass criteria (Year-2 close):**
- $2M+ ARR (10× growth on Phase 4)
- All 3 SKUs maturing; first international logos (US + UK)
- Series Pre-A closed (or bootstrap-profitable confirmed)
- 100+ customer logos
- Team scaled to ~25 people

### Phase 6 — Multi-Region Expansion (Year 3) — "$7M ARR + EU Region"
**Pass criteria (Year-3 close):**
- $7M+ ARR
- US-East + EU-Central regions live (data residency)
- 200+ customer logos
- 3+ Tier-1 platform contracts (Mettl, iMocha, HackerEarth)

### Phase 7 — Strategic Outcome (Year 5) — "$50M+ ARR + Strategic Options Open"
**Pass criteria:**
- $50M+ ARR
- 50+ platform partners
- 500+ enterprise customers
- 2,000+ staffing firms
- Three strategic options simultaneously open: (a) acquisition by Mercer/Workday/HireVue at $300M-$1B, (b) Indian IPO path, (c) anchor company in Talpro Universe stack play

### Project Completion — The Definition of "100%"

**QOrium is declared 100% complete when ANY of the following three conditions is met (CEO-elected):**

1. **Strategic Acquisition Closed.** A Tier-1 acquisition (Mercer, Workday, HireVue, or equivalent) transacts at ≥ $300M valuation with QOrium technology + customer base + content engine integrated into the acquirer.

2. **IPO Listing Achieved.** QOrium lists on Indian capital markets at ≥ ₹3,000 Cr valuation (or US listing at ≥ $500M).

3. **Talpro Universe Anchor Established.** QOrium becomes the formal assessment-content layer of the integrated Talpro Universe talent stack (LeadHunter → QOrium → ProveIQ → HireIQ), with ≥ $50M independent ARR + cross-product integration revenue, AND with the CEO formally electing to operate QOrium as a permanent Talpro Universe property rather than pursuing exit.

**The CEO declares Project Completion at any phase gate with appropriate documentation; once declared, the Constitution remains in force for ongoing operations but the venture's "completion" milestone is logged.**

---

# ARTICLE X — RISK REGISTER & CRISIS PROTOCOL

### §10.1 Risk Register (Living — owned by CTO Office; reviewed monthly)

| Risk | Likelihood | Impact | Owner | Mitigation |
|---|---|---|---|---|
| Mettl/HackerRank build internal AI authoring + skip QOrium | Med-High | High | CEO | Speed; reference logos M3-M6; price advantage |
| WeCP pivots back to content business | Low-Med | High | CEO | India-stack depth; Talpro distribution they don't have |
| Foundation-model providers ship vertical assessment-content | Low | High | CEO + CTO | Partnership posture if it happens |
| AI generation quality regresses | Low | High | CTO + CDO | Multi-model fallback; mandatory SME validation |
| SME contractor network can't scale past 100 | Med | Med | CDO | Talpro alumni; freelance platforms; agentic SME triage |
| Stack-Vault Year-1 cash flow tight | Med | Med-High | CEO + Bali | Diversified motions; bootstrap-able to $1M ARR via Recruiter alone |
| Watermark forensic false-positive | Low | High | CDO | Multi-marker redundancy; legal counsel review pre-claim |
| Talpro network conversion lower than expected | Med | Med | Bali | First 10 calls reveal it; pivot ICP if needed |
| GCC India volume slows materially (recession) | Low-Med | Med-High | CEO | Diversification + global expansion Year 2 |
| Founding team burnout (Bhaskar wears 3 hats) | High | High | CEO | Hiring discipline (AE + BD by M3); 1 day/week strategy time |
| Database failure / data loss | Low | Critical | CTO | 15-min RPO backup; PITR; quarterly restore drill |
| Customer-attributable leak from QOrium itself | Low | Critical | CDO + CTO | Watermark audit; access logging; per-quarter pen test |

### §10.2 Crisis Protocol

**Sev 1 (production down OR data breach OR critical customer-affecting incident):**
- Page CTO + CEO within 5 minutes
- Stand up incident channel; 30-min status updates
- Customer communication within 60 minutes if customer-facing
- Postmortem within 5 business days (mandatory)
- QUEUE.md updated with incident + remediation tasks within 24 hours

**Sev 2 (degraded service OR strategic challenge):**
- Slack alert; respond within 30 min business hours
- Action plan within 24 hours

**Sev 3 (cosmetic OR single customer issue):**
- Slack thread; respond within 4 business hours

---

# ARTICLE XI — AMENDMENT PROCEDURE

This Constitution is amended through the following procedure. **No other path is valid.**

### §11.1 Who Can Propose

Any office may propose an Amendment. Proposals must include:
- The specific text being changed (current → proposed)
- The reason (evidence-backed, citing observable problems with the current version)
- The expected outcome (what changes operationally if adopted)
- Risk + dissenting view (what could go wrong; what the opposing argument is)

### §11.2 Review Process

1. **Filing.** Amendment Proposal filed in `_shared/CONSTITUTION-AMENDMENTS-PENDING.md`.
2. **Office Comment Period (7 days).** All other offices comment.
3. **CEO + CTO Review (3 days).** Joint decision: Adopt / Reject / Modify.
4. **Adoption.** If adopted, Constitution is updated with revision history; new version-number incremented; QUEUE.md notes the change.

### §11.3 Constitutional Override (Emergency)

The CEO may issue an Emergency Override that supersedes any Constitutional clause for up to 30 days. The override is:
- Documented in QUEUE.md with reason
- Reviewed at the next CEO + CTO Monday strategic 1:1
- Either codified as an Amendment or rolled back at the 30-day mark

Emergency Overrides are used sparingly. Repeated use of override on the same clause is an indicator that the clause needs amendment.

### §11.4 Locked Clauses (Cannot Be Amended Without Founder + Board Approval)

These clauses are foundational and cannot be amended through normal procedure:

- §1.1 Mission, Vision, Three-Sentence USP
- §1.2 The Three SKUs identity (rename/restructure requires founder approval)
- Article III Truth Hierarchy
- Article IX Project Completion Definition
- This Article XI itself

Locked clauses change only through written CEO + Board (when Board exists) sign-off.

### §11.5 Versioning Convention

- **Major version (1.0 → 2.0):** Article-level restructure; office charter changes; SKU restructure
- **Minor version (1.0 → 1.1):** Standing Order added/removed; Quality Gate point allocation changed; Cadence change
- **Patch version (1.0 → 1.0.1):** Typos, clarifications, glossary updates

---

# ARTICLE XII — GLOSSARY

| Term | Definition |
|---|---|
| **ACV** | Annual Contract Value — the annualized revenue from a single customer contract |
| **AE** | Account Executive — sales role responsible for closing enterprise deals |
| **Anti-Leak Engine** | The continuous web-scan + similarity-match + auto-rotate pipeline that protects QOrium content freshness |
| **ARR** | Annual Recurring Revenue — sum of all annualized recurring contracts |
| **Bali** | The Sales Office (Article II §2.7) — operates the three sales motions |
| **BD** | Business Development — sales role responsible for partnerships and platform deals |
| **CAC** | Customer Acquisition Cost |
| **CDO** | Chief Data Officer (Article II §2.5) — owns data assets that constitute QOrium's moat |
| **Content Engine** | The 7-stage pipeline (Spec → AI Draft → Critique → SME → Calibrate → Release → Post-Deploy) — see CTO Architecture §3 |
| **Customer Zero** | Talpro India — the first internal user of any Talpro Universe venture; provides Day-1 reference |
| **DPA** | Data Processing Agreement (DPDPA / GDPR compliance instrument) |
| **DPDPA** | Digital Personal Data Protection Act 2023 (India) |
| **Gatekeeper** | The Quality + Security Office (Article II §2.6) |
| **GCC** | Global Capability Center — captive R&D / engineering / shared-service hub of a multinational, typically in India |
| **IdeaForge** | The Gate Office (Article II §2.4) — 24-pt scoring methodology |
| **IRT** | Item Response Theory — psychometric framework for question difficulty calibration |
| **JD-Forge** | SKU 2 — on-demand JD-specific question generation |
| **LTV** | Lifetime Value — total revenue from a customer over their tenure |
| **MANTHAN** | The Research & Blueprint Office (Article II §2.1) |
| **MSA** | Master Services Agreement (commercial contract template) |
| **NRR** | Net Revenue Retention — measures ARR retention + expansion in existing customers |
| **PRISM Protocol** | The 7-step CEO-message-to-CTO-action translation framework (inherited from CTO Constitution v8.1) |
| **QOrium Reference Panel** | The paid candidate network used for IRT calibration (target: 1,000+ candidates by Year 1 close) |
| **Quality Gate (92-pt)** | The Gatekeeper-operated release gate — see Article II §2.6 + Article VII |
| **ReadyBank** | SKU 1 — shared, non-exclusive question library |
| **Reference Panel** | Same as QOrium Reference Panel |
| **Role-Graph** | The normalized taxonomy organizing every question by role × skill × difficulty × format × geography |
| **SKU** | Stock Keeping Unit — a distinct product offering (ReadyBank, JD-Forge, Stack-Vault are QOrium's three) |
| **SLA** | Service Level Agreement |
| **SLO** | Service Level Objective |
| **SME** | Subject Matter Expert — typically a senior engineer or domain practitioner reviewing AI-authored questions |
| **Stack-Vault** | SKU 3 — customer-exclusive IP-protected library |
| **Standing Order** | A binding rule in Article V — amendable only through Article XI procedure |
| **Talpro Customer Zero** | See Customer Zero |
| **Talpro Universe** | The portfolio of ventures originated by Talpro India (LeadHunter, SourceIQ, ProveIQ, HireIQ Pro, etc., of which QOrium is one) |
| **TCV** | Total Contract Value — full multi-year value of a contract |
| **USP** | Unique Selling Proposition — the three-sentence statement in §1.1 |
| **Watermarking** | Cryptographic per-customer marker injection enabling forensic leak attribution (Stack-Vault feature) |

---

# APPENDICES

## Appendix A — Companion Documents

The Constitution does not duplicate the operational detail in QOrium's other documents. It governs them. Read together:

| Doc | Purpose | Status |
|---|---|---|
| `00-QOrium-Master-Mega-Doc.docx` | Consolidated Phase-1 strategy | v1.1 (May 1, 2026) |
| `01-Market-Landscape.docx` | TAM, growth drivers, GCC tailwind | v1.0 |
| `02-Top-20-Competitor-Audit.docx` | Platform profiles + question-creation models | v1.0 |
| `03-Gap-Analysis.docx` | Format/role/lifecycle matrices, the wedge | v1.0 (matrix-fix May 1) |
| `04-QOrium-Blueprint-v1.docx` | Operating thesis, USP, architecture, GTM, roadmap | v1.1 |
| `05-QOrium-Three-Use-Cases-SKU-Architecture.docx` | Per-SKU architecture, pricing, moats | v1.0 |
| `06-IdeaForge-Gate-Report.docx` | Full 24-pt scoring with evidence | v1.0 |
| `07-CTO-Architecture-v1.docx` | System design, schema, API, anti-leak, security | v1.0 |
| `08-Bali-Sales-Playbook-v1.docx` | 3 motions × 3 SKUs sales playbook | v1.0 |
| `09-QOrium-Constitution-v1.0.docx` | THIS DOCUMENT — operating system | v1.0 |
| `QOrium-CEO-Deck-v1.pptx` | 16-slide CEO/board/partner pitch | v1.0 |

## Appendix B — Inheritance from Talpro Universe CTO Constitution v8.1

QOrium inherits the following from the parent Constitution. Where this Constitution is silent, the parent governs.

- **PRISM Protocol** (CEO message → CTO action 7-step translation)
- **80-Point Quality Gate** (extended to 92-point in QOrium per Article II §2.6)
- **112 Standing Orders** (QOrium adds the 20 specific to this venture in Article V)
- **5-Lock State System** (carried into Article IV)
- **Truth Hierarchy** (carried into Article III)
- **Build Vertical, Not Horizontal** principle (3 working data sources > 51 half-built)

## Appendix C — The Outstanding 9 CEO Decisions

These decisions remain open as of the date of this Constitution and are pre-execution-blocking per Standing Order #2:

1. Confirm name: **QOrium**
2. Sanction **₹50L runway** for Months 0-3
3. Talpro India = Customer Zero from Month 1
4. Bosch GCC Bengaluru as Stack-Vault Logo #1 target
5. CTO bandwidth ~50% allocation to QOrium for Year 1
6. Authority for first 5 hires (CEO + CTO sign-off, no further board approval needed)
7. Confirm SKU naming: **ReadyBank, JD-Forge, Stack-Vault** (or marketing rename pre-launch)
8. Stack-Vault Enterprise pricing anchor: **₹40L** (CTO recommendation)
9. SKU sequencing: **SKU 1 (M1-M3) → SKU 3 (M4-M6) → SKU 1 API (M5-M7) → SKU 2 (M6-M9)**

The Constitution itself is conditional on these decisions being answered. Until they are, this Constitution is provisional v1.0.

## Appendix D — Revision History

| Version | Date | Changed | Author |
|---|---|---|---|
| v1.0 | 2026-05-01 | Initial Constitution | CTO Office, Talpro Universe |

---

# RATIFICATION

This Constitution is adopted by:

**CEO:** Bhaskar Anand, Talpro Universe — *(signature pending)*

**CTO:** *(signature)* — CTO Office, Talpro Universe — May 1, 2026

Constitution effective the date of CEO signature.

---

*End of QOrium Constitution v1.0. The work begins.*
