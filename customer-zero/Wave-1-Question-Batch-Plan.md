# Wave 1 Question Batch Plan

**For:** QOrium CTO Office, Content Operations, SME Contractor Network  
**Effective:** Month 1 (May 2026) → Month 3 (July 2026)  
**Authority:** Constitution Article IX Phase Gate (M3 IdeaForge re-gate)  
**Owner:** CTO Office — Content Lead + Content Operations Manager  

---

## Overview

By end of Month 3 (July 31, 2026), QOrium must release **5,000 validated, IRT-calibrated questions** across 8 tech-stack domains to ReadyBank. This is the **M3 Phase Gate prerequisite** for continued funding and customer rollout. These 5,000 questions form the Wave 1 library.

---

## Coverage Targets (8 Domains, 600 Questions Each)

| Domain | Core Skills | Q Target | Wave 1 Focus |
|---|---|---|---|
| 1. **Senior Java** | Spring Boot, microservices, JVM, concurrency, transactions | 600 | Core hiring stack |
| 2. **Senior React/JS** | React 18, hooks, Next.js, TypeScript, performance | 600 | Core hiring stack |
| 3. **Senior SQL/Data** | PostgreSQL, analytics, query optimization, warehousing | 600 | Core hiring stack |
| 4. **DevOps/SRE** | Kubernetes, observability, IaC (Terraform), incident response | 600 | Core hiring stack |
| 5. **Senior Salesforce** | Apex, LWC, Service Cloud, integration patterns | 600 | Core hiring stack (Talpro priority) |
| 6. **Senior Python** | Django, FastAPI, data science, asyncio | 600 | Growth stack |
| 7. **Senior AWS** | Core services, IAM, networking, cost optimization | 600 | Growth stack |
| 8. **AI Prompt Engineering** | LLM evaluation, prompt design, RAG, rigor | 600 | Emerging stack |

**Total:** 8 domains × 600 = 4,800 base + 200 reserve = **5,000 questions**.

---

## Question Type Breakdown (Per Domain)

Each 600-question domain is distributed as:

| Type | Count | % | Rationale |
|---|---|---|---|
| **MCQ (Multiple Choice)** | 360 | 60% | Fast filtering; high throughput for candidate pre-screening |
| **Code (function/project)** | 150 | 25% | Depth signal; separates surface knowledge from real ability |
| **Design / System** | 60 | 10% | Architecture thinking; senior-level only |
| **Case-study / Debugging** | 30 | 5% | Real-world problem-solving; highest signal but slowest to author |
| **TOTAL** | 600 | 100% | |

---

## Difficulty Distribution (IRT Rasch Scale)

Each domain targets a **normal difficulty distribution** anchored to IRT b-parameter (difficulty):

| Difficulty Band | IRT Range (b) | % of 600 | Count | Purpose |
|---|---|---|---|---|
| **Easy** | -1.5 to -0.5 | 30% | 180 | Warm-up; confidence-building |
| **Medium** | -0.5 to +0.5 | 40% | 240 | Main signal; majority of hiring |
| **Hard** | +0.5 to +1.5 | 25% | 150 | Differentiation at high end |
| **Very Hard** | +1.5 to +2.0 | 5% | 30 | Principal-level; rare use |

This distribution mimics the GMAT and SAT: most candidates cluster in the medium range, with tails for outliers. Ensures QOrium assessments are **fair and discriminating**.

---

## Authoring Pipeline (3 Phases)

### Phase A: Bootstrap Library (Month 1, Weeks 1–2)

**Goal:** Generate 100 high-quality questions as calibration anchors.

**Process:**
- 1 **SME Lead** (Tech Writer + Senior Engineer) + 5 **Subject Matter Experts** (1 per domain starter; hire 6 SMEs by Week 2)
- Each SME authors **100 skeleton questions** (MCQ format, basic rubric)
- Manual rubric definition for each format (code: test cases + reference solution; design: evaluation criteria)
- **Output:** 500 questions (SME Lead + 5 SMEs × 100 each) in standardized JSON format with metadata
- **Quality gate:** CTO reviews 10% (50 random samples); must pass 8/10 (80% acceptance)
- **Duration:** 10 business days (May 6–17)
- **Cost:** ₹25K/SME × 6 = ₹1.5L (base pay for Week 1–2)

### Phase B: AI-Augmented Authoring (Month 1 Week 3 → Month 2 Week 4)

**Goal:** Generate 3,000+ high-quality questions via human-AI collaboration.

**Process:**
- Each SME (now 6 → 32 across 8 domains, with ramp) defines a **pattern template**:
  - Example: "Spring Boot @Transactional propagation — give scenario, ask isolation level prediction"
  - Includes 10 worked examples (right answer + wrong-answer patterns)
- **AI generation loop:**
  1. Claude Opus 4.6 receives pattern + 10 examples
  2. Generates 50 candidate questions (MCQ variants, code variants, mixed)
  3. Each candidate is self-critiqued by Claude (ambiguity, distractor quality, bias, leak risk)
  4. SME reviews top 30 candidates, accepts ~15 (50% acceptance rate is target)
  5. Accepted questions → database with full lineage (pattern, generated_by="claude-opus-4.6", reviewed_by="SME-xyz")
- **Output:** 50 SMEs × 60 accepted questions/SME = ~3,000 questions
- **Parallel SME scaling:** Weeks 3–4 (Month 1), hire remaining SMEs (now 32 total: 4 per domain)
- **Duration:** 6 weeks (May 19 — Jun 30)
- **Cost:** AI calls: ~$3,000 (~₹2.5L); SME pay: ₹15L total (₹3L base + variable per-accepted-question bonuses; see Cost Envelope)

**Parallel track:** While Phase B authoring runs, Phase A questions begin **calibration** (next section).

### Phase C: Calibration Loop (Month 2 Week 5 → Month 3 End)

**Goal:** IRT-calibrate all questions to ensure N ≥ 30 responses per item (statistical significance).

**Process:**
- **Reference Panel** (see separate governance doc) includes 50 paid candidates by Month 2 end, 100 by Month 3
- Each candidate sits for 3–4 assessments per month, each containing 30–50 questions from Phase B pool
- QOrium collects responses, computes IRT difficulty (b) and discrimination (a) after N ≥ 30 responses per item
- **Auto-promote to 'released':** Questions meeting criteria (discrimination ≥ 0.3, no extreme b-parameter outliers) are automatically tagged released
- **Flag for review:** Questions with discrimination < 0.3 (poor signal) or b outside expected range → manual SME review + possible regeneration
- **Duration:** 8 weeks (Jun 1 — Jul 31); overlaps with Phase B end
- **Cost:** Reference Panel hourly pay (~₹500–₹2,500 per assessment-hour); see Reference Panel governance for full budget

---

## SME Contractor Allocation

| Domain | Lead SME | Pool (Hires by M2) | Total per Domain |
|---|---|---|---|
| Senior Java | (Hire M2 Week 1) | 3 junior/mid SMEs | 4 |
| Senior React | (Hire M2 Week 1) | 3 | 4 |
| Senior SQL/Data | (Hire M2 Week 1) | 3 | 4 |
| DevOps/SRE | (Hire M2 Week 1) | 3 | 4 |
| Salesforce | (Hire M2 Week 1) | 3 | 4 |
| Python | (Hire M2 Week 2) | 3 | 4 |
| AWS | (Hire M2 Week 2) | 3 | 4 |
| AI Prompt Eng | (Hire M2 Week 3) | 3 | 4 |
| **TOTAL** | 8 Leads | 24 Juniors/Mids | **32 SMEs** |

**Sourcing channels (per C6 sourcing plan):**
- 60% Talpro alumni network (warm, vetted)
- 20% LinkedIn outreach (tech leaders, bootcamp grads)
- 15% Freelance platforms (Upwork, Toptal, Workana)
- 5% university partnerships (IIT/NIT alums)

**Onboarding:** Each SME gets a 2-hour orientation (rubric, format standards, QOrium platform walkthrough), a template library, and access to Phase A exemplars. Onboarding is staggered across Month 2.

---

## Quality Gates (8-Item Checklist Per Question)

Every released question must pass **8 mandatory checks** (automated + manual):

1. **Format validity:** JSON structure matches schema (MCQ has options array, code has test cases, etc.)
2. **Clarity:** No ambiguous wording; any reasonable test-taker understands what's being asked
3. **Correctness:** Correct answer is objectively correct; wrong answers are plausible but wrong
4. **Bias:** No gender/cultural/regional assumptions; inclusive language
5. **Uniqueness:** Not a near-duplicate of another QOrium question (semantic similarity < 0.75 vs. library)
6. **No leak:** Semantic similarity < 0.85 vs. known leaked-question corpus (GeeksforGeeks, LeetCode, etc.)
7. **Calibration readiness:** If calibrated, has N ≥ 30 responses; IRT discrimination ≥ 0.3
8. **Metadata completeness:** role_graph_id, difficulty, format, language, authored_by, reviewed_by all populated

**Enforcement:** Automated CI gate (gitleaks-style but for QOrium metadata); fails release if any check incomplete.

---

## Cost Envelope (Total Wave 1 Budget: ₹50L)

| Category | Estimate | Notes |
|---|---|---|
| **AI Generation API Calls** | ₹2.5L (~$3K) | Claude Opus 4.6 batching; 3,000 questions × avg $1/question |
| **SME Base Pay (Phase A + B)** | ₹8L | 32 SMEs × ₹2.5L avg (₹3L per domain lead + ₹1.5L per junior) |
| **SME Per-Question Bonuses** | ₹7L | ₹500–₹2,000 per accepted/released question; ~2,500 released in Phase B |
| **Reference Panel (Calibration)** | ₹5L | 50–100 candidates × ₹500–₹2,500/session × 4 sessions/month × 2 months |
| **QA / Manual Review** | ₹2L | CTO Office + Content Lead time for spot-checks, DIF analysis, bias audits |
| **Tools & Infrastructure** | ₹1.5L | N8N workflows, QOrium platform infrastructure time, PostgreSQL calibration queries |
| **Buffer (10%)** | ₹3.5L | Contingency for SME delays, unexpected regenerations, reference panel attrition |
| **TOTAL** | **₹50L** | |

**Tracking:** CTO Office issues weekly spend reports (Monday 9am IST) to CEO with cumulative cost vs. plan. If actual exceeds plan by >10%, escalate to CEO immediately.

---

## Risk Register (4 Major Risks)

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **SME Pool Flake-Rate** | Medium | High | Redundancy: hire 1.5× target pool (32 SMEs for 8 domains, scalable to 4 per domain). Backup sourcing from Talpro alumni pool (warm). Milestone 1 contracts lock commitment. |
| **AI Generation Drift** | Low | High | SME review gate mandatory (50% accept rate enforced). Self-critique step catches obvious failures pre-SME. Phase A calibration establishes quality floor. |
| **SME Lead Bandwidth** | Medium | Medium | Stagger hiring: leads on M2W1, then pool SMEs M2W2–W4. SME Lead role is 50% content definition, 50% quality gate. |
| **Calibration Cold-Start** | Low | High | Bootstrap Phase A with 500 questions + hire Reference Panel in parallel (Week 1). First calibration loop completes by Jun 15 (early enough to adjust for Phase B). |

---

## M3 IdeaForge Re-Gate Criteria (Phase Gate Prerequisites)

For Wave 1 to "pass" the Month 3 (IdeaForge) gate and unlock Customer Zero go-live:

1. **5,000 released items** in ReadyBank (≥4,800 base + reserve)
2. **IRT calibration complete** on ≥80% of released items (N ≥ 30 per item, discrimination ≥ 0.3)
3. **Leak signals < 3** (fewer than 3 detected leaks across whole Wave 1 pool)
4. **Bias audit pass** (DIF analysis shows no significant differential item functioning by role seniority)
5. **Quality QA checklist 8/8** on every released batch (automated + spot-check)
6. **SME satisfaction ≥3.5/5** (post-Wave 1 survey to all 32 SMEs)
7. **Reference Panel diversity check pass** (60/30/10 geographic split; gender parity target ≥40%)
8. **No auto-fail criteria breached** (per Constitution Article VII — IRT active on all released items, no watermark failures, etc.)

**Gate Owner:** IdeaForge framework (run by CTO Office). **Go/No-Go Decision:** CEO, with CTO + CDO recommendation.

---

## Wave 2 Preview (Month 4–6)

If M3 gate passes, Wave 2 immediately begins (rolling start in Month 4):

**New domains:**
- SAP ABAP (Finance + HR modules)
- Oracle HCM (Human Capital Management)
- Salesforce CPQ (Configure-Price-Quote)
- Finacle/Flexcube (Banking tech stacks)
- Embedded Automotive (C++, RTOS, CAN-bus)

**Recruitment:** Talpro may request Wave 2 priorities in Month 3 feedback. CTO Office proposes Wave 2 sequence in M3 Phase Gate readout.

---

## Governance & Escalation

- **Weekly Monday 9am:** CTO Office posts Wave 1 authoring progress (questions completed, cost-to-date, SME status, calibration N per domain)
- **Monthly M2/M3:** Content Lead reviews Phase B drift (if accept-rate < 40%, investigate AI generation quality)
- **M3 Week 1:** IdeaForge re-gate readiness check; flag any domain failing to reach 500 released items
- **M3 Week 3:** Final push for lagging domains (reference panel extended with bonus incentives if needed)
- **M3 Week 4:** Gate decision by CEO + recommendation from CTO + CDO

---

## Drafting Notes (For CTO Office)

1. **AI generation cost per question:** Monitor actual Claude API usage weekly. Set hard cap at $5K total (₹4L); if approaching, reduce Phase B scope to 2,000 instead of 3,000 questions (Phase C will be shorter, still hits 5K goal via quality over quantity).

2. **SME onboarding:** Create a 5-slide deck (Figma or PDF) showing JSON schema, rubric format, quality checklist. Distribute Week 1 of Phase B.

3. **Reference Panel calendar:** Book 50 candidates by Jun 1, assign to assessment batches across Jun/Jul (2–3 assessments per candidate per month). Stagger to avoid panel fatigue.

4. **Bias audit tooling:** Use Mantel-Haenszel DIF or IRT logistic regression (consult I/O Psych contractor on method). Run pre-M3 gate.

---

*End of Wave 1 Question Batch Plan. Approved by CTO Office May 2, 2026. Phase A commences May 6.*
