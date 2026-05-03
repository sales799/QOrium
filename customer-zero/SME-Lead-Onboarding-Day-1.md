# SME Content Lead — Day 1 Onboarding

**Welcome.** You are inheriting a v0.6 Wave 1 question corpus (120 questions across 6 sub-skills: Senior Java, React/JS, SQL/Data, DevOps/SRE, Senior Salesforce, Senior Python) and the authority to extend it through Wave 2 (India Stack, M3–M6) and beyond.

This document is your Day-1 read. Three sections: (1) what you inherit, (2) inherited quality bar notes, (3) Day-1..Day-30 working agenda.

---

## 1 — WHAT YOU INHERIT

| Asset | Location | Status | Your action |
|-------|----------|--------|-------------|
| Wave 1 v0.6 master corpus | `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.md` | Ship-grade | Treat as baseline. Refine in flight. |
| Wave 1 sub-skill extension files | `customer-zero/Wave-1-Seed-Batch-{Java,React,SQL-Data,DevOps-SRE}-Extension.md` | Ship-grade | Same — refine, don't rewrite. |
| Wave 1 Salesforce extension | (not yet authored) | TODO | Author following V-3 rule (see §2). |
| CEO Sniff-Test Verdict | `customer-zero/CEO-Sniff-Test-Verdict-Wave1-2026-05-02.md` | Locked | Read once. The 5 systemic findings are your standing orders. |
| v0.5 → v0.6 Edits Patch | `customer-zero/Wave-1-v0.6-Edits-Patch-2026-05-02.md` | Locked | Read once. The 5 V-edits are your authoring rules. |
| SME Validation Tracker | `customer-zero/SME-Validation-Tracker-Wave1.xlsx` | Empty (100 rows seeded) | Begin populating Week 1. |
| Customer Zero Feedback Charter | `customer-zero/D4-Customer-Zero-Feedback-Charter.md` | Locked | Operate within this charter. |
| Wave 1 Question Batch Plan | `customer-zero/Wave-1-Question-Batch-Plan.md` | Locked | Your Wave-2 author cadence is in this file's §3. |
| India Stack Roadmap M3–M6 | `customer-zero/India-Stack-Content-Roadmap-M3-M6.md` | Locked | Your Wave-2 scope: 600+ items by M6. |
| QOrium Constitution v2.0 | `09-QOrium-Constitution-v2.0.docx` | Ratified | Read before authoring. §92-Pt Gate is your acceptance test. |

---

## 2 — INHERITED QUALITY BAR NOTES (from CEO Sniff-Test 2026-05-02)

You inherit a v0.6 corpus that passed the CEO sniff-test on a 10-question representative sample. Five findings carry forward as your Day-1..Day-30 working agenda.

### 2.1 Distractor quality variance — V-2 archetype

~30% of MCQ distractors in v0.5 were surface-keyword traps (acceptable for v0.5 but lifts the bar for v1.0). Re-grade so each MCQ has at least:

- **2 near-miss distractors** — plausibly correct, requires understanding to rule out
- **1 surface-keyword trap** — sounds related but conceptually wrong
- **1 outright-wrong** — keeps the question accessible for borderline candidates

**Template (V-2 from the patch):** for a Kubernetes StatefulSet question, replace a weak distractor like "When you need multiple copies for load balancing" with a real misconception like "When you need a single pod with cluster-wide singleton semantics (e.g., a leader-elected job)" — this catches candidates who conflate StatefulSet with Job/CronJob.

### 2.2 Citation freshness

Add to your monthly cadence: **every cited URL/spec/version is re-validated yearly.** Flag any citation older than 12 months for refresh. Salesforce `USER_MODE` (V-3 below) is a freshness-driven edit; expect more such edits as you maintain the corpus.

### 2.3 Hard-design rubrics — V-1 archetype

Normalize all hard-design rubric language from "answer must include X" to "answer demonstrates X by *some* mechanism — example mechanisms include …". Tests reasoning over recall.

**Template (V-1 from the patch):** for a saga-pattern question, do NOT require choreography over orchestration. Instead: "Candidate selects choreography OR orchestration with explicit trade-off articulation. Penalize *only* the absence of trade-off reasoning, not the choice itself."

### 2.4 Difficulty parameter `b` calibration

v0.6 `b` values are theoretical estimates. After Customer Zero Month 1, validate against actual candidate response distributions in the SME Validation Tracker. **Expect 10–20% of `b` values to shift by ±0.3.** This is normal IRT calibration — not a failure of the v0.6 corpus.

### 2.5 Cultural/locale fairness

Continue the v0.6 discipline: ASCII-neutral names, no locale-specific currencies/geographies in question stems unless the question is *about* localization. Use Q5's "Alice/Bob/Charlie/Dave" as the template. Reject any contributed question whose stem assumes a single locale's tax law, salary band, or cultural reference.

### 2.6 V-3 archetype — Platform-current FLS for Salesforce extension (when you author it)

When you author the Salesforce extension file, any rubric for an FLS-related question must accept **either** `WITH SECURITY_ENFORCED` (legacy, Spring '20+) **or** `USER_MODE` SOQL (Spring '23+, current best practice on the May 2026 platform). Penalize candidates who do *neither*. Award full credit for either; bonus annotation if candidate names `USER_MODE` as the modern preferred path.

---

## 3 — DAY-1..DAY-30 WORKING AGENDA

| Week | Focus | Output |
|------|-------|--------|
| **Week 1** | Read all locked assets. Validate first 30 v0.6 questions against the SME Validation Tracker. Identify 10 questions that need v0.7 minor refinement. Author the Salesforce extension file (20 Qs) honoring V-3. | 30 validations + 10 refinement candidates + Salesforce extension v0.7 |
| **Week 2** | Validate next 40 v0.6 questions. Apply distractor V-2 template across all v0.6 MCQs (audit + edit pass). Begin Wave 2 sub-skill scoping (SAP ABAP first per India Stack Roadmap §2.1). | 70 cumulative validations + distractor audit + SAP ABAP scope doc |
| **Week 3** | Validate remaining 50 v0.6 questions. Run first IRT calibration pass against Customer Zero Month-1 response data. Adjust `b` values per §2.4. | 120 validations complete + first `b` recalibration |
| **Week 4** | Begin Wave 2 authoring: 50 SAP ABAP questions. First weekly QA digest to CTO Office (template in Feedback Charter §5). | 50 SAP questions v0.5 + QA digest |

After Week 4: monthly cadence per Wave 1 Question Batch Plan §3 and India Stack Roadmap §3.

---

## 4 — WHO TO TALK TO

| Need | Channel |
|------|---------|
| Question quality dispute | CTO Office via QOrium-Customer-Zero-Bridge channel (see `customer-zero/D4-Customer-Zero-Feedback-Channel-Plan.md` for current live channel) |
| Constitution interpretation | CTO Office (cite §92-Pt Gate row) |
| New sub-skill greenlight | IdeaForge Stage-2 mini-gate via CTO Office |
| Tooling / pipeline issues | Senior Engineer (when onboarded ~Month 3) |
| Customer Zero feedback access | Talpro India Delivery Head via CTO Office (see Feedback Charter §2) |

---

*End of SME Lead Day-1 Onboarding. Welcome to QOrium.*
