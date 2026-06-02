# QOrium — Interview Rubrics Per Role
**Status:** Operating guide for hiring rounds 1–4 (FT) and R1–R2 (contractors)
**Date:** May 2, 2026
**Author:** CTO + Hiring leads
**Audience:** Interviewers, hiring managers, decision panel

---

## Overview

All QOrium full-time roles undergo a 4-round structured interview process (4 hours total time commitment):
- **R1 (30 min):** CEO/CTO screen — IQ + mission fit + why-this-role clarity
- **R2 (60 min):** Skills deep-dive — role-specific technical or content assessment
- **R3 (60 min):** Cross-functional + values — collaboration, learning mindset, no-fiction culture
- **R4 (30 min):** CEO close — compensation, equity, start date, logistics

**I/O Psychologist contractor** (2-round pilot):
- **R1 (60 min):** CTO/CDO screen — background, methodological choices, reference-panel mindset
- **R2 (90 min):** Portfolio walk + design exercise — review prior work, propose IRT calibration pipeline for 1,000 questions

Each round evaluates **competencies** on a **1–5 scale** with behavioral anchors. Disqualifiers halt progression immediately. Reference check triggered after R4 passes (before offer).

---

## ROLE 1: Senior Engineer — Content Engine

### Competency Model (8 competencies, weighted)

1. **System Design at Scale** (25% weight) — Can articulate end-to-end architecture for high-throughput pipelines (Content Engine, anti-leak crawl, ReadyBank API). Understands distributed systems tradeoffs (consistency vs availability), caching strategies, eventual consistency.

2. **API Design Discipline** (15%) — REST design, OpenAPI specs, versioning, rate limiting, error codes (RFC 7807), pagination. Can write an SDK-friendly API contract that's stable over 12 months.

3. **Data Modeling Rigor** (15%) — PostgreSQL schema design, JSONB modeling, index strategies, migration safety, transaction boundaries. Avoids N+1 queries and premature denormalization.

4. **Code Quality + Testing** (15%) — Writes testable code. 70%+ coverage mindset. Debugs failures methodically. Knows when to use mocks vs integration tests. Avoids false-positive tests.

5. **Debugging Mindset** (10%) — Reproduces issues from error logs. Uses observability (logs, traces, metrics) systematically. Avoids guessing; collects data first.

6. **Communication Clarity** (10%) — Can explain technical decisions to non-engineers. Writes runbooks and ADRs. Pair-programming is smooth (explains reasoning, asks questions).

7. **Ownership** (5%) — Takes end-to-end responsibility. Doesn't hand off to "ops team." Willing to write Terraform, Nginx config, bash scripts when needed.

8. **AI-Assisted Dev Comfort** (5%) — Uses Claude/ChatGPT for code generation, debugging, test scaffolding. Evaluates LLM-generated code critically (per Constitution SO-24). Doesn't ask "is LLM code allowed?" — assumes it is.

---

### Interview Loop & Rubric

#### R1: Technical Screen (30 min) — CEO or CTO

**Goal:** Verify IC4 capability + mission clarity. Disqualify low-signal candidates early.

**Questions:**
1. "Walk me through the architecture of a large system you've built. What were the scaling bottlenecks? How did you resolve them?"
   - **Anchor 1:** Mentions only throughput; vague on concurrency or consistency models.
   - **Anchor 3:** Mentions both throughput and latency; articulates one tradeoff (e.g., caching trade-off). Knows what PostgreSQL EXPLAIN does.
   - **Anchor 5:** Deep understanding of bottlenecks (CPU-bound vs I/O-bound). Discusses query planning, connection pooling, horizontal scaling strategy. Mentions monitoring.

2. "You're designing a REST API for 40,000 questions. What do your core endpoints look like? How do you handle pagination and filtering?"
   - **Anchor 1:** Vague; suggests `/get-questions` without filtering.
   - **Anchor 3:** Proposes `/questions?skill=X&difficulty=Y&page=1&limit=100`. Discusses cursor-based pagination but doesn't fully commit.
   - **Anchor 5:** Clear OpenAPI spec in head. Discusses stateless cursor pagination, ISO 8601 timestamps, link headers, 429 rate-limit headers. Mentions versioning strategy (v1/v2 path or header).

3. "Why this role? Why QOrium?"
   - **Anchor 1:** "I like the salary" or "it's interesting" with no depth.
   - **Anchor 3:** "I'm excited about building a content engine and the anti-leak problem seems cool."
   - **Anchor 5:** "I've debugged plagiarism detection at [prior company] and spent 18 months scaling question libraries. QOrium's multi-stage orchestration + watermarking forensics is the hardest problem I've seen in this space. I want to own it."

**R1 Rubric (1–5 per competency):**

| Competency | 1 | 3 | 5 |
|---|---|---|---|
| System Design | Talks about single database; no scalability concept | Mentions caching, basic replication; some tradeoff awareness | Discusses distributed consensus, eventual consistency, or specific bottleneck (DB latency vs CPU); clear remediation |
| API Design | Suggests simple POST/GET without versioning | Standard REST endpoints; basic error handling | OpenAPI 3.1 spec mentality; discusses SDKs + backwards compatibility |
| Data Modeling | No mention of indexes or queries | Mentions indexes; aware of JSONB | Deep discussion of query planning, migration strategy, ACID boundaries |
| Communication | Hard to follow; jumps between topics | Clear but somewhat generic | Tells a story; explains reasoning; open to correction |

**Disqualifiers (R1):**
- Fabricates prior experience ("I led a 100-engineer team" but LinkedIn shows IC2 role).
- Cannot articulate "why QOrium" beyond "remote role + good salary."
- Dismisses testing as "optional" or over-engineering.
- Says "I've never debugged a slow query" when that's core to the role.

---

#### R2: Skills Deep-Dive (60 min) — CTO + Senior Engineer

**Goal:** Verify coding rigor, API design judgment, data modeling skill, testing mindset.

**Format:** Split into two 30-min sessions (back-to-back).

**Session 2A: System Design + Data Model (30 min)**

Scenario: "You're architecting the ContentEngine service. It needs to:
- Accept a question spec (skill, sub-skill, difficulty, body, format)
- Generate 3 drafts via Claude Opus (parallel, different random seeds)
- Orchestrate a reviewer approval loop (SME can accept, reject, or ask for edits)
- Retry failed drafts with exponential backoff
- Emit events for downstream stages (IRT calibration, leak detection)

Walk me through:
1. The service interface (what does the API look like?)
2. Your database schema (questions table, versions, audit log)
3. How you handle concurrency (two SMEs editing the same question simultaneously)
4. How you monitor this end-to-end"

**Rubric (1–5):**

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Service Interface** | Single monolithic POST /questions; no state machine | Clear GET /questions/:id; separate GET /questions/:id/drafts; understands versioning | Proposes event-driven service boundary; mentions idempotency keys for retries |
| **Data Model** | Single questions table; no audit log | questions + question_versions; reasonable indexes | questions + versions + events table; locks on review state; thought through JSONB for format-specific metadata |
| **Concurrency** | "Use a lock" but no detail | Mentions row-level lock or optimistic locking | Proposes MVCC (PostgreSQL conflict handling) or event sourcing to avoid lock contention |
| **Monitoring** | "Add logging" | Mentions metrics (latency, draft failures) | Proposes structured logging + OpenTelemetry spans per stage; SLO for review loop latency |

---

**Session 2B: Code Review Exercise (30 min)**

**Task:** You'll be shown a 30-line PR (pseudo-code below) that has 4 intentional issues. The candidate's job: find them in 15 min, then discuss remediation.

**Pseudo-code (Node.js/TypeScript):**

```typescript
// QuestionService.ts — draft generation + approval flow
async function generateAndReviewQuestion(spec: QuestionSpec): Promise<Question> {
  // Issue #1: SQL injection
  const existing = await db.query(
    `SELECT * FROM questions WHERE skill = '${spec.skill}'`
  );

  // Issue #2: N+1 query (implicit)
  const drafts = await Promise.all(
    existing.map(q => db.query(`SELECT * FROM question_versions WHERE question_id = ${q.id}`))
  );

  // Generate 3 Claude drafts
  const responses = [];
  for (let i = 0; i < 3; i++) {
    const draft = await claudeAPI.generateQuestion(spec);
    responses.push(draft);
  }

  // Issue #3: No transaction boundary — if insert succeeds but event emit fails, data is orphaned
  const questionRow = {
    skill: spec.skill,
    difficulty: spec.difficulty,
    body: responses[0].body,
    created_at: new Date()
  };
  await db.insert('questions', questionRow);

  // Simulate event bus (async, not awaited)
  eventBus.emit('question.created', { question_id: questionRow.id });

  // Issue #4: Race condition — if two requests come in simultaneously for same spec.skill,
  // both pass the "existing" check and create duplicates
  return questionRow;
}
```

**Scoring:**

| Issue Found | Points |
|---|---|
| SQL injection (parameterized queries) | 1 |
| N+1 query problem + solution (batch SELECT or JOIN) | 1 |
| Transaction boundary (BEGIN ... COMMIT or try-catch) | 1 |
| Race condition (UNIQUE constraint or optimistic lock) | 1 |

**Rubric:**
- **5:** Finds 3–4 issues. Explains parameterization, suggests batch query, proposes transaction, identifies race condition.
- **3:** Finds 2 issues clearly (likely SQL injection + N+1). Understands the problem but misses transaction or concurrency angle.
- **1:** Finds 1 issue or misses the intent (e.g., says "just add comments").

**Disqualifiers (R2):**
- Cannot explain SQL injection or dismisses it as "not a real problem."
- Proposes adding `await` to event emission without discussing idempotency (event could emit twice if request retried).
- Writes new code without asking clarifying questions first (misses communication aspect).
- Takes >20 min to find any issues (pacing concern for production work).

---

#### R3: Cross-Functional + Values (60 min) — CTO + SME Content Lead + Frontend Engineer

**Goal:** Assess learning mindset, collaboration, internalization of no-fiction culture, diversity of thought.

**Questions:**

1. (CTO) "You've just shipped the anti-leak engine and it's catching 5–10 questions per week as leaked. Our SME Content Lead says 'we need to rebuild the entire library — these leaks prove our questions are generic.' You think the leaked questions are just unlucky surface-level matches. How do you handle this disagreement?"
   - **Anchor 1:** "I'm right; they're overreacting."
   - **Anchor 3:** "Let's collect more data. I'd propose we sample 20 of the flagged leaks and have an SME manually classify each as 'true positive' or 'false positive.' That gives us signal."
   - **Anchor 5:** (Same as 3, plus) "And I'd ask: how are we tracking precision/recall on this detector? If we're at 70% precision, we shouldn't be alarming the whole team. If we're at 95%, the Content Lead might be onto something."

2. (SME Content Lead) "You're mentoring a junior engineer who proposes a solution you think is over-complicated. They're passionate about it. How do you handle it?"
   - **Anchor 1:** "I'd shut it down and tell them the simple way."
   - **Anchor 3:** "I'd pair with them, understand their reasoning, and gently steer toward simplicity."
   - **Anchor 5:** "I'd ask 'what problem are we solving?' and 'what's the cost of the complex approach vs the simple one?' Maybe their complexity is justified (e.g., performance). If not, I'd show them the Pareto principle — ship 80% of value in 20% of effort first."

3. (Frontend Engineer) "You're shipping feature X. It's 95% done, but there's a 5% edge case that would require 3 more days of work to handle perfectly. What do you do?"
   - **Anchor 1:** "Definitely ship it. Edge cases don't matter."
   - **Anchor 3:** "Depends on the edge case. If it affects 1% of users and the cost is high, maybe we monitor and fix later."
   - **Anchor 5:** (Same as 3, plus) "I'd propose: ship with a feature flag, monitor error rates, document the known issue, and commit to fixing by [sprint X]. We communicate this proactively to customers, not hide it."

4. "Tell me about a time you realized you were wrong about something technical. How did you find out? How did you handle it?"
   - **Anchor 1:** "I don't remember making a mistake."
   - **Anchor 3:** "I optimized a query and thought it would help, but load tests showed no improvement. I reverted it and tried a different approach."
   - **Anchor 5:** (Same as 3, plus) "I wrote an ADR documenting why I was wrong (the optimization was cache-level, not query-level). I shared it with the team so we all learned. I now ask 'what would disprove my assumption' before implementing."

5. (CTO, final check) "What does 'no-fiction culture' mean to you? How would you embody it?"
   - **Anchor 1:** "Telling the truth? I guess I'd be honest if code breaks."
   - **Anchor 3:** "Every external claim we make needs to be backed by a live tool call or artifact. So if we say '20+ languages supported,' I'd verify that in CI before shipping."
   - **Anchor 5:** "And I'd push back on marketing claims that outpace engineering. If we haven't shipped IRT calibration yet, I won't let sales promise it to customers. I'd also propose we open-source our calibration benchmarks so customers can audit our claims independently."

**R3 Rubric (1–5 per competency):**

| Competency | 1 | 3 | 5 |
|---|---|---|---|
| **Collaboration** | Dismissive of other viewpoints | Open to discussion; seeks data to decide | Actively seeks out dissent; frames disagreements as learning opportunities |
| **Learning Mindset** | Blames external factors for mistakes | Reflects on mistakes; adjusts approach | Writes it down, shares with team, changes systems to prevent recurrence |
| **No-Fiction Culture** | "We shipped it, so it works" | Proposes testing/monitoring before claims | Audits marketing claims against actual feature flags; comfortable being the blocker |
| **Communication** | Struggles to explain reasoning | Explains reasoning; asks clarifying questions | Anticipates follow-up questions; offers multiple options + tradeoffs |

**Disqualifiers (R3):**
- Dismisses any disagreement as "they don't understand engineering."
- Cannot recall a time they were wrong (suggests overconfidence or lack of reflection).
- Shows contempt for other functions (content, sales, design).
- Unwilling to slow down shipping to verify a claim.

---

#### R4: CEO Close (30 min) — CEO

**Goal:** Final fit check, communicate compensation, finalize logistics, build excitement.

**Flow:**
1. (5 min) CEO tells story: "Here's why I believe QOrium will be $300M+ company by Year 5..."
2. (10 min) CEO walks compensation band (base, equity, time-to-liquidation scenario at exit).
3. (10 min) Candidate asks questions.
4. (5 min) CEO confirms: "Here's what the first 30 days looks like. Are you ready?"

**Disqualifiers (R4):**
- Candidate pushes back on equity or asks to negotiate outside the published band (shows misalignment on transparency principle).
- Asked "what's the CEO's vision?" and candidate hasn't retained any from prior rounds (suggests low engagement).
- Hesitates on start date or logistics (may signal cold feet).

---

### Disqualifiers Summary (Senior Engineer)

1. **Fabricates experience** — Exaggerates past scale, team size, or outcomes. Verify on LinkedIn / GitHub.
2. **Cannot articulate "why this role"** — Responds only with "good opportunity" or "remote work." Must show mission understanding.
3. **Dismisses testing** — "Tests are nice-to-have" or "we don't have time for tests." Incompatible with 70%+ coverage gate.
4. **Shows contempt for non-technical functions** — "Sales doesn't understand engineering" or "Product always gets it wrong." No-fiction culture requires humility.
5. **Cannot debug from first principles** — Asked "walk me through debugging a slow query," answers "I'd ask a DBA." Shows low technical depth.

---

### Calibration Notes (Senior Engineer)

**Interviewer Training (before first round):**
- R1 interviewer (CEO/CTO): Decide go/no-go on mission fit + technical ceiling. If IQ is borderline but mission fit is 5/5, allow forward. If IQ is 5/5 but mission fit is 1/5, no-go.
- R2 interviewer (CTO): Grade the code review and system design; don't grade communication (that's R3's job). If candidate is below 3/5 on Data Modeling, that's a no-go (core to role).
- R3 interviewer (cross-functional panel): Grade collaboration + learning. One "1" score is a blocker.
- R4 interviewer (CEO): Final gut check. If CEO feels misalignment, trust it.

**Decision Matrix (post all 4 rounds):**

| Signal | Decision |
|---|---|
| Avg score 4.5+ across all rubrics | **STRONG HIRE** — Offer immediately. Expect high retention. |
| Avg score 3.5–4.4 | **HIRE** — Standard path. Solid fit. Offer if top 3 finalists. |
| Avg score 2.5–3.4 | **NO-HIRE** — Gaps in one or more competencies. Consider feedback to candidate. |
| Avg score <2.5 OR any score = 1 (except communication in R3) | **STRONG NO-HIRE** — Do not proceed. |
| Any disqualifier triggered | **STRONG NO-HIRE** — Immediately. |

**Confidence threshold:** 75% panel agreement on final decision. If split (e.g., CTO says HIRE, Frontend says NO-HIRE), debrief for 30 min. If still split, default to NO-HIRE (hiring is risky enough).

---

### Reference Check Protocol (Senior Engineer)

**Triggered after:** R4 passes (before offer).

**Who calls:** CTO (engineering references), CEO (leadership references).

**Standard questions:**
1. "What was [Candidate's] biggest technical contribution during their time there?"
2. "Describe a situation where [Candidate] had to refactor or debug a complex system. How did they approach it?"
3. "How would you describe [Candidate]'s communication style with non-technical stakeholders?"
4. "Did [Candidate] take ownership of problems, or did they tend to escalate?"
5. "Is there anything you wish [Candidate] had done differently in the role?"

**Red flags:**
- Reference says "they were a good engineer but we had interpersonal issues."
- Reference describes work that doesn't match candidate's claim.
- Reference hesitates on "would you rehire them?"

**Green flags:**
- Reference mentions specific technical problem candidate solved.
- Reference says "they were a joy to work with."
- Reference offers to reconnect after hire.

---

---

## ROLE 2: SME Content Lead

### Competency Model (8 competencies)

1. **Question-Design Judgment** (20%) — Understands what separates a "good" hiring question from a generic one. Can critique a question's difficulty, distractor quality, edge-case handling. Knows psychometric properties (discrimination, difficulty, ambiguity).

2. **Rubric Design & Quality-Bar Discipline** (20%) — Can write acceptance criteria that are repeatable across 100+ SME reviewers. Knows how to operationalize "good" into checkboxes and scoring.

3. **SME Network Management** (20%) — Has sourced and managed contractor pools (10+). Knows how to onboard, give feedback, track quality per contributor, manage attrition.

4. **AI-Assisted Authoring Fluency** (15%) — Comfortable with Claude/GPT drafting questions. Can prompt-engineer effectively. Understands what AI gets right (speed, ideation) vs wrong (edge cases, bias, specificity).

5. **Editorial Workflow & Process** (10%) — Owns end-to-end review loop: AI draft → SME critique → edits → hand-off to I/O Psych. Can identify bottlenecks and propose solutions.

6. **Bias Awareness** (10%) — Spots gendered language, regional assumptions, hidden prerequisites that advantage certain demographics. Can propose fixes without over-sanitizing.

7. **Partnership with I/O Psych** (3%) — Understands calibration feedback. Adjusts rubrics based on IRT findings (e.g., "all SAP questions are too hard; let's ease the next batch").

8. **Communication** (2%) — Clear rubric docs, good feedback to SMEs, can distill psychometric findings into actionable insights.

---

### Interview Loop

#### R1: Rubric Design + Assessment Philosophy (45 min) — CDO or CTO

**Goal:** Understand candidate's question-design taste and rubric-building approach.

**Questions:**

1. "Design a rubric for a multiple-choice question on 'Senior React Engineer' role. What criteria would you use to decide if it's a good question?"
   - **Anchor 3:** "Distractor plausibility, language clarity, single correct answer, avoids trick questions."
   - **Anchor 5:** "Difficulty b parameter (e.g., should be ~60% difficulty for Senior level), discrimination a (should be >0.4 to distinguish strong from weak), distractor quality (each wrong answer should be plausible — common misconception, not random), and no ambiguity in question or answer."

2. "You're reviewing a batch of 50 AI-drafted questions. You notice a pattern: 5 of them have gendered language ('he' as default pronoun). How would you handle this?"
   - **Anchor 3:** "Flag them and ask the AI team to regenerate."
   - **Anchor 5:** "I'd propose a pre-submission filter (check for gendered language before SME review, catch it early). Then I'd audit the remaining 45 to spot other biases. And I'd add a line to the rubric: 'Must use neutral pronouns (they/the candidate/the developer).' So it's not retroactive — it's preventive."

3. "Tell me about a time you managed a contractor pool. What was hardest? How did you handle quality variation?"
   - **Anchor 3:** "We had 20 contractors. Some were fast, some were slow. I tracked time-to-review and gave feedback."
   - **Anchor 5:** "I had 15 contractors with 3x variance in quality. I implemented tiered feedback: top performers got first shot at complex roles (higher pay), middle got standard roles, low performers got retrained or replaced. I also paired high with low for 2 weeks (knowledge transfer). Attrition dropped 30%."

4. "What does 'no-fiction culture' mean in the context of content quality? How would you embody it?"
   - **Anchor 3:** "We don't claim content is IRT-calibrated until it's actually calibrated. We don't say 'SME-reviewed' unless an SME actually reviewed it and signed off."
   - **Anchor 5:** "And I'd audit our claims monthly. If we say '5,000 questions live,' I'd verify that in the database with a query. If it's 4,800, I'd flag it. I'd also publish an audit trail: question → SME reviewer → I/O Psych approval. Customers can see the chain of custody."

**R1 Rubric (1–5):**

| Competency | 1 | 3 | 5 |
|---|---|---|---|
| **Question Design** | "Hard questions are good questions" | Mentions distractor quality and clarity | Discusses IRT parameters (discrimination, difficulty) + bias + ambiguity |
| **Rubric Design** | Vague criteria ("good questions") | Concrete checkboxes (has answer, no trick) | Operationalized rubric with scoring + examples of good/bad |
| **SME Management** | "I've reviewed questions but never managed contractors" | Managed 5–10 contractors; basic feedback | Managed 15+; implemented tiering + training + attrition tracking |
| **No-Fiction** | "We'll claim things once they're roughly done" | "We verify before claiming" | Regular audits; published chain of custody; comfortable being blocker |

---

#### R2: Live Rubric Design + Batch Review (60 min) — CDO + Senior Engineer

**Split into two parts:**

**Part 2A: Live Design (30 min)**

Scenario: "Design a 10-question pack for 'Senior React Engineer' role. Walk me through:
1. What question types you'd include (MCQ, code, SJT, design)?
2. The difficulty mix (% easy / medium / hard)?
3. How you'd prompt Claude to draft them?
4. Your acceptance rubric — what makes a 'go' question?"

**Rubric:**
- **5:** Proposes mix (40% code, 30% MCQ, 20% design, 10% SJT). Justifies difficulty distribution based on what they want to measure. Prompts Claude with examples + edge-case instructions. Acceptance rubric includes discrimination threshold.
- **3:** Proposes mix of 2–3 types. Basic difficulty distribution. Prompts Claude generically. Rubric mentions distractor quality and clarity.
- **1:** "Just ask Claude for 10 React questions." No thought given to type mix or rubric.

---

**Part 2B: Critique Existing Questions (30 min)**

You'll be shown 3 real (anonymized) questions from platforms. Candidate's job: critique each, assign a 1–5 rating, and propose fixes.

**Sample Question #1 (MCQ with weak distractors):**
```
Question: What does React's useCallback hook do?
A) Caches a function reference
B) Runs code once
C) Sorts arrays
D) Makes HTTP requests
```
**Issues:** Distractors B, C, D are implausible. B is close (useEffect runs once). C and D are nonsensical.

**Expected answer:** "Rating 2/5. Distractors are weak. Options C and D teach nothing. B is tempting but wrong — useEffect runs once (with []), useCallback returns a memoized function. I'd fix it: A) Caches function reference, B) Runs side effects once (useEffect confusion), C) Tracks component state (useState confusion), D) Optimizes re-render behavior (re-render prop confusion). Distractors test real misconceptions."

---

**Sample Question #2 (Code question with ambiguous spec):**
```
Write a function that takes an array of numbers and returns the sum.
function sum(arr) { ... }

Test cases:
- sum([1, 2, 3]) should return 6
- sum([]) should return 0
```
**Issues:** Spec doesn't say what happens for null/undefined/non-numeric inputs. Solution could be 1 line or 5 lines depending on assumptions.

**Expected answer:** "Rating 2/5. Spec is under-specified. Edge cases: what if arr is null? What if it contains strings? Should we coerce? A well-written question includes: 'Assume arr is always a valid array of numbers' AND edge cases to handle (e.g., 'sum([1, "two", 3]) should ignore non-numbers'). Also, the reference solution should be clear; if I see 5 different valid solutions that all pass the test, the question is ambiguous."

---

**Sample Question #3 (Design question with no rubric):**
```
Design a React component library for a healthcare app. What structure would you use?
```
**Issues:** No rubric. No clear answer. Hard to score objectively.

**Expected answer:** "Rating 1/5. This is a great discussion prompt but not a good hiring question without a rubric. I'd reframe it: 'Design a Button component that supports loading state. Show: TypeScript interface, JSX, CSS approach.' Then the rubric: 'Does it handle a11y (aria-busy)? Is the TypeScript type-safe? Does the loading state work cross-browser?' Now it's evaluable."

---

**R2 Rubric (1–5):**

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Design Exercise** | "Just ask Claude" | Proposes 2–3 types; basic rubric | Clear type mix + difficulty distribution + prompt examples + acceptance thresholds |
| **Critique Quality** | Misses most issues | Spots 1–2 issues per question; offers vague fixes | Spots all issues; proposes specific fixes; mentions testing or rubric |
| **Taste** | Questions are generic or poorly scoped | Questions are decent but safe | Questions are challenging + fair + clear success criteria |

---

### Disqualifiers (SME Content Lead)

1. **Cannot think beyond SME review** — "My job is to critique questions." Missing the bigger picture: rubric design, contractor management, IRT feedback loops.
2. **No prior assessment experience** — "I've never actually designed a hiring question." Risky for first-time hire.
3. **Dismisses AI authoring** — "Claude will generate garbage. We need hand-written questions only." Misses the moat: AI speed + SME quality.
4. **Shows bias blindness** — Doesn't spot gendered language or regional assumptions in sample questions. Critical failure for this role.
5. **Cannot manage up** — "I just review what's given to me." Missing ownership of quality standards and feedback loops with I/O Psych.

---

### Reference Check Protocol (SME Content Lead)

**Triggered after:** R2 passes.

**Who calls:** CDO + CTO.

**Standard questions:**
1. "What was [Candidate]'s biggest contribution to your assessment program?"
2. "How did [Candidate] handle a situation where they had to give critical feedback to an SME or contractor?"
3. "Describe [Candidate]'s ability to balance speed (ship 5,000 questions) with quality (high discrimination items)."
4. "Did [Candidate] understand the statistical properties of good questions (difficulty, discrimination)? How did this come through?"
5. "Would you work with [Candidate] again? Why or why not?"

---

---

## ROLE 3: Enterprise Account Executive (AE)

### Competency Model (8 competencies)

1. **Discovery Rigor (MEDDPICC)** (20%) — Asks methodical discovery questions to uncover pain (candidate fraud, repetition, generic content), decision-maker authority, timeline, and budget. Doesn't pitch until pain is clear.

2. **Enterprise Procurement Navigation** (15%) — Understands 4–9 month B2B sales cycles. Knows what MSA, DPA, security review look like. Can navigate multiple stakeholders (TA Head, CHRO, CFO, CTO).

3. **Technical Fluency for HR-Tech Buyer** (15%) — Can read a tech JD and understand Senior SAP Developer vs Senior Salesforce. Can explain why IRT calibration matters to a non-statistician. Comfortable with "questions as a service."

4. **Pricing Discipline (SO-23)** (10%) — Stack-Vault Enterprise tier anchored at ₹40L; never below ₹35L without CEO approval. Understands unit economics (cost-per-assessment).

5. **Pipeline Hygiene** (10%) — Tracks deals in HubSpot by stage. Knows when to push (sample pack review), when to pause (security review), when to close. No surprises at quarter-end.

6. **Storytelling** (10%) — Positions Stack-Vault as a defensible advantage (watermarking, anti-leak rotation, IRT calibration). Tells a story that resonates with GCC TA leaders.

7. **Objection Handling** (10%) — "Our current platform is fine" → probe deeper (what does fine mean?). "We need a trial" → structure a pilot with success metrics.

8. **Deal Qualification** (5%) — Knows a Tier-A GCC target (>1,000 hires/year, multi-stack, >₹50L assessment spend). Can say "no" to weak deals early.

---

### Interview Loop

#### R1: Sales Philosophy + Market Knowledge (60 min) — CEO

**Goal:** Assess discovery rigor, market understanding, deal sense.

**Questions:**

1. "Walk me through your biggest enterprise deal. Take me from first cold email to signature. What was the decision authority? How long? What were objections?"
   - **Anchor 3:** "6-month cycle. Worked with TA Head mostly. Objection was cost; I did ROI calc to show payback in 6 months."
   - **Anchor 5:** "9-month cycle. 3 stakeholders: TA Head (wanted content quality), CFO (wanted ROI), CTO (wanted security review). Biggest objection was 'we have a custom solution in-house.' I dug deeper: 'How many engineers maintain it? What's the cost?' Turns out it was ₹1.5Cr/year. I showed they could pay us ₹40L and save ₹75L annually."

2. "What do you know about the GCC hiring market in India? Specifics: Bosch, Siemens, JPMC. What are their pain points?"
   - **Anchor 3:** "They hire a lot of people. They have existing platforms. They want better content."
   - **Anchor 5:** "Bosch Bengaluru hires 2K+ engineers/year across SAP, Java, cloud. They use Mettl today. Pain: question repetition (candidates leak questions to peers), generic SAP questions (don't map to Bosch's stack). Decision cycle: TA Head + HRBP + CTO alignment. Timeline: 4–6 months from proposal to PO. Budget: they have assessment budgets, but re-allocation is tricky (they'd need CFO approval)."

3. "A prospect says 'your price is too high.' How do you respond?"
   - **Anchor 3:** "I'd offer a discount or propose a smaller scope."
   - **Anchor 5:** "First, I'd ask: 'What's your budget vs what we proposed?' Probe deeper. If their objection is real (CFO won't approve >₹30L), I'd suggest: 'Let's start with a Department-tier pilot (₹10L, one critical role). You'll see ROI in 3 months. Then we expand.' I'd never discount ₹40L down to ₹30L; I'd offer ₹10L instead (different product, not discount)."

4. "You're in discovery with a prospect. You ask 'How many hires do you do annually?' They say '500.' Is this a Tier-A target? Why or why not?"
   - **Anchor 3:** "That's a decent number. Let's call it Tier-B."
   - **Anchor 5:** "500 is below our Tier-A threshold (1,000+ hires = more assessment spend justifies Stack-Vault complexity). BUT I'd dig deeper: 'Of those 500, how many are technical?' If 400 are technical and they assess all, that's a great fit. If 500 are all backend engineers (same role), it's a smaller TAM. I'd qualify: tech hiring volume + multi-stack + current spend."

5. "What's your biggest failure in sales? What did you learn?"
   - **Anchor 3:** "I lost a deal because the prospect picked a cheaper competitor."
   - **Anchor 5:** "I lost a ₹2Cr deal because I pitched features instead of listening to pain. I found out later their real issue was 'we don't trust that candidates we hire will succeed.' I should have dug into that from day 1. Now I always ask 'what would success look like 6 months after hiring?' before pitching."

**R1 Rubric (1–5):**

| Competency | 1 | 3 | 5 |
|---|---|---|---|
| **Discovery** | Jumps to pitch; no probing questions | Asks about pain and budget; somewhat methodical | MEDDPICC approach; digs into decision authority, timeline, competitive landscape |
| **Market Knowledge** | "GCC hiring is growing" | Knows Mettl/HackerRank are competitors; basic pain points | Specific knowledge of Bosch/Siemens stacks, assessment spend, procurement cycles |
| **Objection Handling** | "We'll offer a discount" | "Let me show you the ROI" | "Discount is a signal of deeper misalignment; let me understand your constraints" |
| **Qualification** | "Every prospect is a go" | Qualifies on size (500+ hires) | Qualifies on multiple dimensions (tech hiring, multi-stack, budget, urgency) |

---

#### R2: Mock Discovery Call + Roleplay (90 min) — CEO + CTO role-play prospect

**Scenario:** You are the TA Head at Bosch GCC Bengaluru. You've been asked to evaluate a new assessment content vendor (QOrium). The AE (candidate) gets 60 min for discovery. At 40 min, a CTO joins the call with objections.

**Your (TA Head) opening:** "Hi, thanks for taking the call. We're always looking for ways to improve our assessment process. But we have a lot on our plate, so I'm not sure how much of a priority this is. What did you want to talk about?"

**CTO objection (at 40 min):** "I just joined. TA Head tells me you're a new vendor. I don't see how you're different from Mettl. They have 40,000 questions already."

**Success criteria for AE:**
- **Asks 5–8 discovery questions before any pitch** (pain, timeline, decision-maker, budget, evaluation criteria).
- **Responds to CTO objection with technical fluency** (understands anti-leak rotation, IRT calibration, watermarking benefits).
- **Proposes a sample pack** ("We'll draft 50 questions on your top role in 1 week, and your engineering team can review").
- **Suggests next steps** ("Assuming your team likes the sample, when could we scope the full engagement?").

**Post-call debrief (30 min):** CEO + CTO give feedback. "What went well? What would you do differently? How would you structure the proposal?"

**R2 Rubric (1–5):**

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Discovery** | Pitches immediately; doesn't ask pain questions | Asks 3–4 pain questions; some listening | 7+ questions; uncovers both obvious pain (repetition) + hidden pain (we don't trust quality) |
| **Handling Objections** | "We're different because of AI" (vague) | "We have anti-leak rotation and IRT calibration" | Asks CTO what his concerns are; positions QOrium as reducing risk (watermarking proves we're not generic) |
| **Next Steps** | "Let's schedule another call" | "We'll send a proposal" | "We'll send 50 draft questions by [date]. Your engineers spend 2 weeks reviewing. We debrief and scope from there." |
| **Listening** | Talks >50% of call; interrupts | Balanced talking; notes pain points | Quiet and attentive; asks follow-up questions; repeats back understanding |

---

### Disqualifiers (AE)

1. **Cannot articulate QOrium differentiation.** Asked "how is QOrium different from Mettl?", answers vaguely ("we have AI," "we're newer").
2. **Pitches before discovering pain.** Opens with product features instead of asking questions.
3. **No deal discipline.** Asked "what's your qualification criteria?", has none. Treats all prospects equally.
4. **Dismisses pricing guardrails.** "I'd offer ₹30L if that's what it takes." Violates SO-23 (anchor at ₹40L for Enterprise).
5. **Shows contempt for technical roles.** "I don't understand IRT stuff; the engineers can handle it." Missing credibility with CTO stakeholder.
6. **Cannot read a room.** In mock call, talks over CTO, doesn't address his concern, moves on.

---

### Reference Check Protocol (AE)

**Who calls:** CEO.

**Standard questions:**
1. "Describe [Candidate]'s biggest enterprise win. What made them successful?"
2. "How did [Candidate] handle a long, complex sales cycle?"
3. "Tell me about a time [Candidate] lost a deal. How did they handle it?"
4. "How does [Candidate] work with technical stakeholders (CTOs, security teams)?"
5. "Any concerns about [Candidate] as an enterprise salesperson?"

---

---

## ROLE 4: Business Development Lead — Platform Partnerships

### Competency Model (8 competencies)

1. **Partnership Architecture** (20%) — Can design a partnership model (rev-share, licensing, pilot + annual contract). Understands long-term vs transactional value.

2. **Commercial Structuring** (15%) — Negotiates SLAs, success metrics, pricing tiers (Starter $50K, Growth $150K). Drafts pilot terms clearly.

3. **Developer-Relations Sensibility** (15%) — Understands platform engineers' concerns (integration effort, latency, SLA reliability). Can speak their language.

4. **Quota Discipline at Platform Deal Cycle** (10%) — Knows 6–12 month platform deals are slow. Tracks pipeline by stage. Hits intermediate milestones (discovery → technical eval → pilot scope).

5. **Cross-Functional with Engineering** (15%) — Works with Senior Engineer to define API contracts, SLAs, test environments. Doesn't over-promise to platforms without engineering alignment.

6. **Executive Relationship Building** (10%) — Comfortable pitching to VP Product / CEO. Can move from cold LinkedIn to boardroom conversation.

7. **Market Intelligence** (10%) — Knows platform landscape (Tier 1 vs Tier 3). Can spot partnerships that are strategic vs opportunistic.

8. **Negotiation** (5%) — Clear terms. Moves deals from "interesting" to "signed" by removing ambiguity.

---

### Interview Loop

#### R1: Partnership Philosophy + Market Knowledge (60 min) — CEO

**Goal:** Assess understanding of platform ecosystem, partnership strategy, market sense.

**Questions:**

1. "Walk me through a major partnership you've done. How long did it take? What was the contract structure? Did it renew?"
   - **Anchor 3:** "12-month deal. Revenue-share model. Both sides happy; it renewed."
   - **Anchor 5:** "16-month deal (8-month pilot + 8-month negotiation). Started with Starter tier ($50K/year). Pilot metrics: platform users rated our content 4.5/5, content team time dropped 20%. At renewal, they upsold to Growth tier ($150K). Margin was 85% (our cost-per-question is ₹500, they use 200 questions/month = ₹1L cost, pay us ₹12.5L/year)."

2. "Which assessment platforms do you know? Tier them: Tier 1 (hard targets) vs Tier 2 (mid-market) vs Tier 3 (emerging)."
   - **Anchor 3:** "HackerRank is big. Mettl is in India. iMocha is smaller."
   - **Anchor 5:** "Tier 1 (VC-backed, own deep content roadmaps, likely to build in-house): HackerRank, CodeSignal, Codility, SHL, Talogy. Tier 2 (profitable, open to partnerships, content gaps): Mettl, iMocha, Mercer, Adaface. Tier 3 (emerging, hungry for content): WeCP, Xobin, Testlify, Glider AI. For QOrium, Tier 2 is the sweet spot; Tier 1 is hard (they have their own IP); Tier 3 has less buying power but faster decision cycles."

3. "A platform VP says 'we're not interested in partnerships — we build content in-house.' How do you respond?"
   - **Anchor 3:** "I'd ask them to reconsider; maybe we can offer a better deal."
   - **Anchor 5:** "I'd say 'I understand. Out of curiosity, how many engineers maintain your content library? What does it cost? How fast can you refresh on leak?' Then I'd listen. If their build is 3 engineers @ ₹60L/year = ₹180L/year, I'd position: 'We could provide fresh, IRT-calibrated questions for 1/3 that cost. You could redeploy those engineers.' If they say 'we have the budget,' I'd ask 'but do you want to?'"

4. "You're negotiating a pilot. The platform wants 6 months; you want to minimize our support cost. What terms do you propose?"
   - **Anchor 3:** "6 months is fine. We'll support them during the pilot."
   - **Anchor 5:** "I'd structure it: Starter tier ($50K/year, piloted at 6 months). Weekly sync calls for first 2 months; then bi-weekly. Success metrics defined upfront (platform user NPS, content refresh rate, integration uptime). If they hit 75%+ of metrics, it converts to annual. If not, we debrief and adjust scope."

5. "What's your biggest partnership failure? What did you learn?"
   - **Anchor 3:** "A deal fell through because we couldn't agree on terms."
   - **Anchor 5:** "I pitched a rev-share model to a platform that wanted fixed pricing. I was stubborn; they walked. I learned: understand the partner's cash flow and budget authority first. If they have VC-backing and need predictable costs, fixed pricing is better. If they have revenue and want to scale cheaply, rev-share works."

**R1 Rubric (1–5):**

| Competency | 1 | 3 | 5 |
|---|---|---|---|
| **Partnership Architecture** | "We'll just license them our questions" | Rev-share vs fixed pricing; some SLA talk | Clear tiers (Starter/Growth), success metrics, pilot-to-annual path, expansion terms |
| **Market Knowledge** | "I know HackerRank is big" | Knows 5–10 platforms; basic tiers | Knows 20+ platforms; tiers by VC/self-funded; estimates team sizes + content budgets |
| **Negotiation** | "I'd agree to whatever they want" | Proposes terms; some back-and-forth | Listens to partner constraints; proposes creative terms (e.g., revenue-share for early risk) |
| **Qualification** | "Every platform is a good target" | Tier 2 platforms are the focus | Clear rationale: Tier 1 is hard; Tier 3 has low revenue; Tier 2 has fastest ROI |

---

#### R2: Partnership Design Exercise (90 min) — CEO + CTO roleplay

**Scenario:** You are the VP Product at HackerRank (or Mettl, or iMocha — pick one). QOrium (candidate) is pitching a partnership. You (VP) have 90 min. First 45 min: pitch + discovery. Second 45 min: technical evaluation (CTO joins).

**Your opening (VP):** "Thanks for coming. We're always evaluating how to expand our question library without building it in-house. What do you have in mind?"

**CTO objection (at 45 min):** "I see the questions are good, but integrating a new API endpoint is engineering overhead. How much work is this? What's the SLA?"

**Success criteria:**
- **45 min (pitch + discovery):**
  - Asks why they're evaluating (pain: question fatigue, content refresh cost?).
  - Proposes a Starter tier pilot with clear terms (200 questions/month, 30-day trial, NPS feedback).
  - Positions anti-leak rotation as reducing their legal exposure.
  - Proposes a success metric (platform user feedback on question quality).

- **45 min (technical + negotiation):**
  - Defers technical details to Senior Engineer / CTO (doesn't over-promise).
  - Explains SLA: "Our API is 99.5% uptime; questions are cached, so latency is <500ms. Integration is 4–8 weeks for your team."
  - Proposes a test environment and integration support (weekly sync for 8 weeks).
  - Moves to contract: "Here's the Starter tier MSA. Take a week to review with your legal. Let's sign by [date]."

**Post-call debrief (30 min):** CEO + CTO feedback. "What went well? Where could you improve?"

**R2 Rubric (1–5):**

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Discovery** | Pitches immediately | Asks 2–3 pain questions | Uncovers 4–5 pain points (refresh cost, legal exposure, NPS pressure) |
| **Structuring Deal** | "Let's do a 1-year contract" | "6-month pilot with option to extend" | Starter pilot ($50K) with defined success metrics; conversion to Growth ($150K) if metrics hit |
| **Technical Fluency** | "Questions integrate easily" | "Our API has REST endpoints, 200ms latency" | Defers to CTO but can discuss integration timeline, SLA, caching strategy |
| **Handling Objections** | "Integration is easy" (defensive) | "It takes 6–8 weeks; here's what's involved" | "It takes 6–8 weeks. We'll dedicate a weekly sync. You can measure integration cost and weigh vs hiring a content engineer." |

---

### Disqualifiers (BD)

1. **Cannot articulate platform differentiation.** Asked "why would a platform choose QOrium?", answers vaguely ("good questions," "fair pricing").
2. **Treats all platforms equally.** No qualification strategy. Sees Tier 3 as equally valuable as Tier 2.
3. **Over-promises without engineering alignment.** "We can integrate with Salesforce in 2 weeks" without asking Senior Engineer.
4. **Shows impatience.** "6–12 month sales cycles are too long. Let's focus on quick wins." Missing the venture strategy (platform deals = high LTV).
5. **Cannot move from pitch to contract.** In mock call, pitches well but doesn't propose concrete terms.
6. **Dismisses technical concerns.** CTO asks "what's your uptime SLA?" and candidate says "engineers will handle it." Signals weak technical fluency.

---

### Reference Check Protocol (BD)

**Who calls:** CEO.

**Standard questions:**
1. "Describe [Candidate]'s most complex partnership. How long did it take? What was tricky?"
2. "How did [Candidate] balance moving fast vs over-promising?"
3. "Tell me about a partnership that didn't work out. Why?"
4. "How does [Candidate] work with technical teams?"
5. "Would you partner with [Candidate] again?"

---

---

## ROLE 5: I/O Psychologist — Validation Lead (Contractor, 2 rounds only)

### Competency Model (6 competencies)

1. **Psychometric Rigor (IRT 3PL, Classical Test Theory)** (30%) — Deep understanding of Item Response Theory (3-parameter logistic model). Can design reference panels, compute item parameters (b=difficulty, a=discrimination, c=guessing), interpret calibration findings.

2. **Applied Calibration Experience** (25%) — Has calibrated 100+ items for assessments, training certifications, or large-scale tests. Knows what makes a "good" item parameter (discrimination >0.3, difficulty within reasonable range).

3. **Reference Panel Governance** (20%) — Designed and managed paid candidate panels (20+). Understands recruitment, NDA enforcement, cheating detection, retention.

4. **AI-Content-Validation Literacy** (15%) — Understands how to benchmark AI-generated questions against human-written ones. Can design a classification experiment (logistic regression, SVM, LLM-as-judge).

5. **Communication with Non-Statisticians** (10%) — Can explain IRT findings to content teams without jargon. Translates "discrimination a=0.5" into "this question separates strong from weak candidates well."

---

### Interview Loop

#### R1: Psychometric Background + Assessment Philosophy (60 min) — CTO or CDO

**Goal:** Verify IRT expertise, calibration experience, and fit with QOrium's validation approach.

**Questions:**

1. "Tell me about your background in I/O psychology or psychometrics. What's your highest degree? What's your most sophisticated psychometric work?"
   - **Anchor 3:** "M.A. in I/O Psychology. I did a thesis on item difficulty prediction for a university admissions test."
   - **Anchor 5:** "PhD in Educational Measurement. I've published 3 papers on IRT model selection and differential item functioning (DIF). I designed reference panels for a Pearson certification program (500+ candidates, 1,000 items, 3PL model, DIF analysis)."

2. "Explain the 3-parameter logistic (3PL) IRT model. When would you use 2PL vs 3PL?"
   - **Anchor 3:** "3PL has difficulty, discrimination, and guessing. Use 3PL when guessing is possible (e.g., MCQ)."
   - **Anchor 5:** "3PL: P(θ) = c + (1-c) * exp(a(θ-b)) / (1 + exp(a(θ-b))). b=difficulty, a=discrimination, c=guessing. Use 3PL for MCQ where random guessing is possible. Use 2PL for constructed-response (coding, design) where guessing isn't an option. Use 1PL (Rasch) if you want a simple, interpretable model with no discrimination parameter. Choose based on test purpose and item format."

3. "You're designing a reference panel to calibrate 5,000 questions. Walk me through: candidate recruitment, panel size, compensation, cheating detection."
   - **Anchor 3:** "Recruit candidates from universities or TopCoder. Pay them ₹50–100 per question. Monitor for duplicate answers."
   - **Anchor 5:** "Source from coding clubs (high signal, free motivation) + TopCoder (self-selected technical talent) + our candidate pool (we've already assessed them). Tiered compensation: ₹50 for easy MCQ, ₹200 for hard coding questions (longer to solve). Panel size: 50–100 candidates per question (more for hard items, fewer for easy). Cheating detection: same-answer-sequence patterns, IP address clustering, response time outliers (too fast = guessing, too slow = cheating). Also, NDA enforcement: limited question copies, secure platform access."

4. "A batch of questions shows discrimination <0.3 (poor signal). What do you recommend to content team?"
   - **Anchor 3:** "Flag them for review or re-write."
   - **Anchor 5:** "First, check if it's a statistical artifact (sample size <30 for that item?). If real, dig deeper: is the item ambiguous (multiple correct answers)? Is the difficulty misaligned (too easy that everyone gets it right)? Or is it a trick question? I'd propose: show the item to the content team + SME feedback + response distribution. Then decide: revise, replace, or retire. I'd also check for DIF (differential item functioning): does this item discriminate differently for different subgroups? That's a bias red flag."

5. "What does 'no-fiction culture' mean in the context of psychometrics?"
   - **Anchor 3:** "We don't claim items are IRT-calibrated unless they're actually calibrated. We publish the data."
   - **Anchor 5:** "And I'd propose we publish our calibration report transparently: item parameters per role + discrimination distribution + DIF analysis + any flag-for-review items. Customers can see the chain of custody. We could even open-source a subset of item parameters (anonymized) so external researchers can audit our methodology."

**R1 Rubric (1–5):**

| Competency | 1 | 3 | 5 |
|---|---|---|---|
| **IRT Knowledge** | Knows IRT exists; vague on 3PL | 2PL vs 3PL decision criteria | Deep knowledge of parameter interpretation (b, a, c); knows DIF analysis |
| **Applied Experience** | Studied IRT but hasn't calibrated many items | Calibrated 100+ items; understands workflow | Managed 500+ items; designed robust reference panels; published |
| **Panel Governance** | "Pay candidates and hope for honesty" | Clear payment tiers; monitors for obvious cheating | Sophisticated cheating detection + NDA enforcement + retention strategy |
| **No-Fiction** | "We'll publish calibration numbers" | We'll publish and explain what they mean | We'll publish + offer external audit rights + DIF transparency |

---

#### R2: Portfolio Walk + Design Exercise (90 min) — CDO + Senior Engineer

**Part 2A: Portfolio Review (30 min)**

Candidate shares prior assessment work (thesis, published paper, or case study). Walk through:
- "Why did you choose this model (1PL/2PL/3PL)?"
- "What were the findings? Any surprising item parameters?"
- "Did you do DIF analysis? What did you find?"
- "How did you communicate findings to non-statisticians?"

**Scoring:**
- **5:** Shows sophisticated work (DIF analysis, model comparison, robustness checks). Clear communication of findings.
- **3:** Shows solid work (calibrated 100+ items, computed parameters). Basic findings.
- **1:** Work is thin or vague.

---

**Part 2B: Design Exercise (60 min)**

**Scenario:** "Design an IRT calibration pipeline for 1,000 questions being released over 3 months. Walk me through:
1. Reference panel strategy (who, how many, payment).
2. 3PL model setup (software choice, parameter thresholds).
3. Bias audit plan (DIF analysis, gender/nationality subgroups).
4. How you'll flag poor-signal items.
5. Handoff to content team (what report do they get?)"

**Expected answer (5/5):**

1. **Panel:** Source 200–300 candidates from TopCoder + college clubs + Talpro's existing pool. Tiered payment: ₹50–100 for MCQ, ₹200–500 for coding. 50–100 candidates per question depending on difficulty. NDA + secure platform.

2. **3PL Model:** Use Winsteps or R's ltm package. Discrimination threshold: a >0.3 (flag if <0.3). Difficulty b within [-2, 2] (outliers suggest miscalibration). Guessing c <0.5 for MCQ (if higher, option-weighting is off).

3. **Bias audit:** Group candidates by gender, nationality (if possible), SES proxy. Compute DIF using logistic regression (Mantel-Haenszel for categorical). Flag items where DIF > 0.5 (large bias).

4. **Poor-signal items:** Discrimination <0.3 OR DIF >0.5 OR sample size <30 → flag for content team review.

5. **Handoff report:** Excel with columns: question_id | difficulty_b | discrimination_a | guessing_c | discrimination_flag | DIF_flag | recommended_action. + summary: 5% of items flagged for review. + commentary: "No gender bias detected; some nationality DIF on SAP questions (review scenario specificity)."

**R2 Rubric (1–5):**

| Dimension | 1 | 3 | 5 |
|---|---|---|---|
| **Panel Design** | "Pay people to take tests" | Tiered payment; NDA; basic cheating detection | Sourcing strategy + retention plan + sophisticated cheating detection |
| **Model Choice** | "Use some IRT model" | 3PL vs 2PL decision; mention thresholds | Detailed parameter bounds; software choice justified; robustness checks |
| **Bias Auditing** | "Look for gender bias informally" | Plan to subset data by gender; compute DIF | Subgroup analysis (gender, nationality); Mantel-Haenszel or logistic DIF; DIF interpretation |
| **Handoff Report** | Generic numbers | Clear flags and thresholds | Actionable report with recommended content actions + caveats |

---

### Disqualifiers (I/O Psych)

1. **Cannot explain 3PL IRT clearly.** Asked "what's the guessing parameter?" and answers vaguely.
2. **No prior reference panel experience.** "I've studied IRT but never managed a calibration study."
3. **Dismisses bias auditing.** "We'll assume the questions are fair." Missing DIF analysis.
4. **Cannot communicate to non-statisticians.** Explains findings only in statistical jargon.
5. **Shows contempt for AI authoring.** "AI questions are always bad. We need 100% hand-written." Misses QOrium's moat.

---

### Reference Check Protocol (I/O Psych)

**Who calls:** CDO + CTO.

**Standard questions:**
1. "Describe [Candidate]'s most complex calibration project. How many items? What model? Key findings?"
2. "How has [Candidate] handled DIF or bias findings in prior assessments?"
3. "Tell me about a time [Candidate] had to explain IRT findings to non-statisticians. How did they do?"
4. "Any concerns about [Candidate]'s technical rigor or communication?"
5. "Would you work with [Candidate] again?"

---

---

## Universal Sections: Decision-Making + Operations

### Decision Matrix Calibration

**After all rounds, compute average score per competency (1–5 scale).**

**Overall Signal:**
- **4.5–5.0:** STRONG HIRE → Offer immediately. Expect exceptional contributor. High retention likelihood.
- **3.5–4.4:** HIRE → Solid fit. Offer if top 3 candidates. Some development needed; mentor closely first 90 days.
- **2.5–3.4:** NO-HIRE → Gaps in key competencies. Do not proceed. Consider for future roles.
- **<2.5 OR any score = 1:** STRONG NO-HIRE → Do not proceed.
- **Any disqualifier triggered:** STRONG NO-HIRE → Immediately, regardless of other scores.

**Decision rule:** 75% panel agreement required. If split (e.g., R3 interviewer says HIRE, CTO says NO-HIRE), debrief for 30 min. If still split, default to NO-HIRE (hiring is risky).

**Debrief protocol (post-final round):**
1. Each interviewer shares scores + gut sense (2 min each).
2. Panel discusses disagreements (5 min). Focus on factual disqualifiers vs subjective "fit."
3. Final decision vote. If consensus, move to offer. If 2–1 split, CTO has tiebreaker; CEO has final say on compensation.

---

### Hiring Loop SLA

- **Application → R1 scheduling:** 3 business days
- **R1 → R2 decision:** 2 business days
- **R2 → R3 decision:** 2 business days
- **R3 → R4 decision:** 1 business day
- **R4 → final decision:** 2 business days
- **Final decision → offer letter:** 1 business day

**Total time:** ~10 business days (2 weeks) from R1 to offer.

**Reject timeline:** If no-go at any round, candidate is contacted within 1 business day with brief, professional feedback.

---

### DEI Considerations

1. **Structured interviews:** All roles use the same rubric + question bank. Reduces bias vs. ad-hoc evaluation.
2. **Blind first-screen:** R1 can be conducted with resume minimized (show just role, years of experience, industry — not name, photo, gender markers). Not always feasible (CTO wants to assess communication), but aim for it.
3. **Diverse interview panel:** R2 + R3 include cross-functional representation (not just CTO; include content lead, frontend engineer). Reduces single-rater bias.
4. **Diverse candidate sourcing:** Active outreach to women, underrepresented minorities, non-traditional backgrounds. Partner with networks (WomenWhoCode, TechLadies, alumni groups).
5. **Transparent feedback:** If no-go, offer specific feedback (e.g., "Your API design was strong, but system design at scale needs more depth" vs. vague "not a fit").

---

### Reference Appendix: Sample Code Review Scenario

(See R2 section above for Senior Engineer — pseudo-code with 4 intentional issues included.)

### Reference Appendix: Sample Questions to Critique

(See R2 section above for SME Content Lead — 3 sample questions included.)

### Reference Appendix: Mock Discovery Call Brief (AE)

(See R2 section above for AE — role-play scenario included.)

### Reference Appendix: Partnership Design Exercise Brief (BD)

(See R2 section above for BD — role-play scenario included.)

### Reference Appendix: IRT Design Exercise Brief (I/O Psych)

(See R2 section above for I/O Psych — design exercise included.)

---

**End of Interview Rubrics. Last updated: May 2, 2026.**
