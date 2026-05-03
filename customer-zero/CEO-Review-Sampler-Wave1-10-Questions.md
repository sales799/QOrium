# CEO Review Sampler — Wave 1 Seed Batch (10 questions)

**Purpose:** 30-minute CEO sniff-test of QOrium's Wave 1 v0.5 question quality before scaling beyond 100 questions or before SME Lead onboards.
**Coverage:** 2 questions × 5 roles (1 Easy + 1 Design from each role)
**Source:** Sampled from `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.md` and constituent files.
**How to use:** Read each question. Tick one of the three boxes at the bottom of each. Add a 1-line comment if a question fails. ~3 minutes per question = ~30 minutes total.
**What we're testing:** technical accuracy · fairness/bias · difficulty calibration sanity · whether the schema (rubric, citation, distractor quality) is fit for SME Lead inheritance.

---

## QUESTION 1 — Senior Java | Easy MCQ | b = -1.1

**Sub-skill:** JVM memory internals
**Citation:** JLS Ch.17 (Threads and Locks); JVM Specification §2.5
**Time:** 2 min

**Question:** In Java's memory model, what is the primary purpose of the happens-before relationship defined in the JMM?

**Options:**
- A) To ensure that memory writes are physically ordered by CPU cache coherence
- B) To provide a guarantee that one operation's effects are visible to a subsequent operation, even across threads
- C) To prevent the JVM from applying any optimizations to multithreaded code
- D) To enforce that all threads use the same CPU core for execution

**Answer:** B — happens-before guarantees if A happens-before B, then A's memory effects are visible to B. Stronger than physical ordering, weaker than serialization. Allows JVM optimizations while preserving correctness for properly synchronized code.

**CEO check:**
- [ ] Looks good — ship it
- [ ] Minor edit needed (specify): _______
- [ ] Reject — not technically accurate / poor distractors / etc. (specify): _______

---

## QUESTION 2 — Senior Java | Hard Design | b = +1.5

**Sub-skill:** Microservices distributed transactions
**Citation:** Microservices Patterns (Chris Richardson) Ch.4; Saga pattern
**Time:** 15 min

**Question (abbreviated):** Design event-driven choreography for a 4-service assessment delivery flow (Assessment, Question, Scoring, Notification). Address: saga pattern, compensating transactions, idempotency, exactly-once semantics, choreography vs orchestration trade-offs.

**5-point rubric expects:** Choreography over orchestration · per-service event flow + compensation events · idempotency keys (event_id UUIDs) · inbox pattern for exactly-once · failure → emit Rollback event · trade-off acknowledgment (choreography harder to debug, more resilient).

**CEO check:**
- [ ] Looks good — ship it
- [ ] Rubric needs adjustment (specify): _______
- [ ] Reject — design too narrow / too broad / wrong framing (specify): _______

---

## QUESTION 3 — Senior React/JS | Easy MCQ | b = -1.2

**Sub-skill:** React core / reconciliation
**Citation:** react.dev §2 (Describing UI); Reconciliation Algorithm
**Time:** 2 min

**Question:** In React, the `key` prop serves which primary purpose?

**Options:**
- A) To uniquely identify a component instance across renders so React can preserve its internal state during list re-renders
- B) To bind a component to a specific CSS class name for styling purposes
- C) To declare which properties should trigger a component update via shouldComponentUpdate
- D) To optimize bundle size by tree-shaking unused component variants

**Answer:** A — keys tell React which list items have changed/added/removed. Without stable keys, React may reuse component instances incorrectly causing state to leak between list items (classic checkbox bug). Keys enable reconciliation to preserve component identity.

**CEO check:**
- [ ] Looks good
- [ ] Minor edit: _______
- [ ] Reject: _______

---

## QUESTION 4 — Senior React/JS | Hard Design | b = +1.6

**Sub-skill:** Concurrent features + collaborative UI
**Citation:** react.dev (Concurrent Rendering); Suspense for Data Fetching
**Time:** 15 min

**Question (abbreviated):** Design a real-time collaborative form-builder UI (React 18 + Next.js + WebSockets/SSE). 500+ fields. Optimistic updates, conflict resolution (CRDT or OT), undo/redo with history stack, useTransition for non-blocking renders. Address state ownership, sync strategy, conflict detection, accessibility (other-user-cursor indicators).

**5-point rubric expects:** Zustand or custom-hook state separation (local optimistic + server) · WebSocket queue + acks · CRDT/OT for merging · timestamp/vector-clock tiebreaks · Suspense boundaries · undo/redo stack with pre-ack edits · "User Jane editing field 3" cursor indicators · sync-status indicators.

**CEO check:**
- [ ] Looks good
- [ ] Rubric adjustment: _______
- [ ] Reject: _______

---

## QUESTION 5 — Senior SQL/Data | Easy MCQ | b = -1.1

**Sub-skill:** SQL fundamentals — aggregation
**Citation:** PostgreSQL 16 Docs §34.1 (SELECT); SQL:2016 standard
**Time:** 2 min

**Question:** Given a table `candidates(id, name, skill_id, proficiency_level)` with rows for Alice (skill 1), Bob (skill 1), Charlie (skill 2), Dave (skill 1), what does `SELECT skill_id, COUNT(*) FROM candidates GROUP BY skill_id;` return?

**Options:**
- A) skill_id=1, count=3; skill_id=2, count=1
- B) Three rows (one per repeated skill_id)
- C) Error because `name` not in GROUP BY
- D) All rows with count=1 each

**Answer:** A — GROUP BY aggregates rows by the column. skill_id=1 has 3 rows (Alice, Bob, Dave) → count=3. skill_id=2 has 1 row → count=1.

**CEO check:**
- [ ] Looks good
- [ ] Minor edit: _______
- [ ] Reject: _______

---

## QUESTION 6 — Senior SQL/Data | Hard Design | b = +1.5

**Sub-skill:** Data warehouse design
**Citation:** The Data Warehouse Toolkit (Kimball); Postgres partitioning
**Time:** 15 min

**Question (abbreviated):** Design a star-schema warehouse for QOrium's response analytics. 100M responses/year. Queries slice by candidate skill level, question difficulty, assessment date, tenant, skill domain. Provide: fact table grain + measures, ≥4 dimensions with sample columns, partitioning strategy (range by month/quarter on response_timestamp), composite indexing, refresh cadence (real-time vs daily batch trade-off), hot/cold storage strategy.

**5-point rubric expects:** `fact_responses` grain = one response · surrogate keys + FKs · dimensions (`dim_question`, `dim_candidate`, `dim_tenant`, `dim_time`, optionally `dim_assessment_type` + `dim_channel`) · range partitioning by month/quarter · composite index `(tenant_sk, response_timestamp, question_sk)` · refresh strategy reasoning · cold-storage archival.

**CEO check:**
- [ ] Looks good
- [ ] Rubric adjustment: _______
- [ ] Reject: _______

---

## QUESTION 7 — DevOps/SRE | Easy MCQ | b = -1.2

**Sub-skill:** Kubernetes workload types
**Citation:** kubernetes.io Workloads docs
**Time:** 2 min

**Question:** A Deployment manages stateless application replicas. When would you use a StatefulSet instead?

**Options:**
- A) When you need horizontal scaling
- B) When your application requires stable network identities, persistent storage, or ordered pod startup (e.g., databases, caches)
- C) When you want automatic rolling updates with zero downtime
- D) When you need multiple copies for load balancing

**Answer:** B — StatefulSet provides stable DNS names (pod-0.svc, pod-1.svc), each pod binds to specific PVC, ordered deployment/termination/scaling. Databases (MySQL, Postgres, MongoDB) and caches (Redis) are classic uses. Deployments are for interchangeable stateless replicas.

**CEO check:**
- [ ] Looks good
- [ ] Minor edit: _______
- [ ] Reject: _______

---

## QUESTION 8 — DevOps/SRE | Hard Design | b = +1.6

**Sub-skill:** Observability architecture
**Citation:** OpenTelemetry; Google SRE Workbook §4
**Time:** 15 min

**Question (abbreviated):** Design observability across PM2 (Hostinger VPS) + Docker (Mac Mini) + Cloudflare R2. OTel collector topology, centralized backend (Prometheus + Loki + Tempo? + Grafana), AlertManager routing (page-on-call vs Slack-warning vs email-info), SLO/SLI/error-budget definition (99.9% per 28-day window), on-call rotation + escalation + incident comms.

**5-point rubric expects:** OTel collector per infra · clear backend choice with cost/scale/ops justification · 3-tier alert routing · SLI = p95 < 200ms · SLO = 99.9% over 28-day window · error budget consumption alerting at 50% · on-call primary + secondary + manager escalation · auto-create `#incident-${id}` Slack channel.

**CEO check:**
- [ ] Looks good
- [ ] Rubric adjustment: _______
- [ ] Reject: _______

---

## QUESTION 9 — Senior Salesforce | Easy MCQ | b = -1.2

**Sub-skill:** Apex governor limits
**Citation:** Salesforce Apex Developer Guide §3.3 (Apex Limits); Spring '26 Governor Limits
**Time:** 2 min

**Question:** Processing 50,000 Account records in a single Apex transaction throws "Heap Size Limit Exceeded" (6MB heap). Primary reason in synchronous context?

**Options:**
- A) Each sObject ≈ 1 KB heap; 50K × 1KB exceeds 6MB; query results not GC'd until txn end
- B) Salesforce DB engine loads entire result set into memory before returning
- C) Heap is per-batch; 50K records require 9 batches minimum
- D) Governor limits apply only to DML, not SOQL; SOQL has separate memory pool

**Answer:** A — sObject instances in Apex heap consume ~1KB each (with loaded fields). In synchronous transactions, query results stay in heap until transaction completes. 6MB is per-transaction. Solutions: Batch Apex (500-record chunks) or Queueable chaining for manual pagination.

**CEO check:**
- [ ] Looks good
- [ ] Minor edit: _______
- [ ] Reject: _______

---

## QUESTION 10 — Senior Salesforce | Hard Code | b = +1.3

**Sub-skill:** LWC reactivity + Apex imperative call
**Citation:** Lightning Web Components v8 Developer Guide §4
**Time:** 12 min

**Question (abbreviated):** Write a parent LWC (Account form: Name, Industry) + child component that validates if an Account with the same Name already exists (via imperative Apex call). Child emits custom event with validation result. Parent listens, shows error conditionally. Implement parent LWC, child LWC, and Apex method `AccountValidator.isAccountNameExists`.

**5-point rubric expects:** Child uses `@api accountName` setter pattern to react to parent property changes · imperative Apex import + `.then()/.catch()` · custom event with `detail` payload · parent listens via `handleValidationResult` + `event.detail.isDuplicate` flag · Apex method uses `WITH SECURITY_ENFORCED` or proper FLS check · debounce/throttle to avoid Apex limit-burn on every keystroke.

**CEO check:**
- [ ] Looks good
- [ ] Code quality issue: _______
- [ ] Reject: _______

---

## OVERALL CEO ASSESSMENT (1-2 sentences)

**Are the 100 v0.5 questions ready to hand to SME Lead Day-1 with confidence?**

- [ ] **YES** — quality is good enough; SME Lead can refine; ship to Customer Zero on schedule
- [ ] **YES with edits** — specify which patterns need rework before SME hand-off: _______
- [ ] **NO** — material rework needed; pause Customer Zero deployment until v0.6 (specify gaps): _______

---

## What CEO sends back to CTO Office

> "✅ Sniff-test done. Verdict: [YES / YES-with-edits / NO]. Notes: [any 1-line per-question issues, e.g., 'Q4 rubric too prescriptive on CRDT — also accept OT'; 'Q7 distractor D too obvious; replace']"

CTO Office reviews and decides: ship-to-SME OR queue v0.6 revision pass.

---

*End of CEO Review Sampler. 10 questions × ~3 min each = ~30 min CEO time. The other 90 questions live in the source files; if these 10 pass the sniff-test, the systemic quality bar is established.*
