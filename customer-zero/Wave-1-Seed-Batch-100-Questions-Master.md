# Wave 1 Seed Batch — 160 Questions Master Bundle (v0.6)

> **NOTE 2026-05-02 evening:** This master bundle was originally authored at 100 questions (5 sub-skills × 20). Updated to 160 questions (8 sub-skills × 20) after Wave 1 Run #3 added Python, AWS, and AI Prompt Engineering sample packs. Subsequent question scaling (20 → 40 per sub-skill = 320 total) is queued for Phase 1 M2 once SME Lead is in seat.

> **v0.5 → v0.6 changelog (2026-05-02):** CEO sniff-test verdict YES-with-edits filed at `customer-zero/CEO-Sniff-Test-Verdict-Wave1-2026-05-02.md`. Five edits captured in `customer-zero/Wave-1-v0.6-Edits-Patch-2026-05-02.md` (V-1 Saga rubric flexibility, V-2 StatefulSet distractor archetype, V-3 Salesforce FLS rubric, V-4 SME Lead onboarding inheritance, V-5 this version bump). Edits carry forward as authoring rules in `customer-zero/SME-Lead-Onboarding-Day-1.md` §2. No structural changes to existing v0.5 question text — quality bar lifted via inheritance, not retroactive rewrite.

**Status:** AI-drafted v0.6 (= v0.5 + quality bar patch). SME Lead validation pending. NOT for external delivery without SME-Lead sign-off and IRT calibration.
**Authored by:** CTO Office (autonomous AI pipeline, multi-agent draft)
**Date:** 2026-05-02
**Customer Zero:** Talpro India — first 100 candidates to run through this batch starting Month 1
**Coverage:** 5 roles × 20 questions = 100 total
**Companion files:** the 9 source files referenced below; this doc is the consolidated index + summary

---

## Distribution

| Role | sub-skills | Count | Source files |
|---|---|---|---|
| Senior Java | 5+ (incl JVM, Spring Boot 3, concurrency, JPA, Spring Cloud, Kafka, security, testing, reactive) | 20 | `sales/Sample-Pack-v0.5-Senior-Java-Populated.md` (Q001–010) + `customer-zero/Wave-1-Seed-Batch-Java-Extension.md` (Q011–020) |
| Senior React/JS | 5+ (incl React 18, Next.js App Router, TS, perf, state mgmt, testing, forms+zod, i18n, auth patterns) | 20 | `sales/Sample-Pack-v0.5-Senior-React-Populated.md` (Q001–010) + `customer-zero/Wave-1-Seed-Batch-React-Extension.md` (Q011–020) |
| Senior SQL/Data | 5+ (incl window funcs, indexing, transactions, Postgres-specific, warehousing, concurrency, performance, backup+DR) | 20 | `sales/Sample-Pack-v0.5-Senior-SQL-Data-Populated.md` (Q001–010) + `customer-zero/Wave-1-Seed-Batch-SQL-Data-Extension.md` (Q011–020) |
| DevOps/SRE | 5+ (incl K8s, observability, IaC, CI/CD, incident response, service mesh, container security, GitOps, cost optimization, DR/chaos) | 20 | `sales/Sample-Pack-v0.5-DevOps-SRE-Populated.md` (Q001–010) + `customer-zero/Wave-1-Seed-Batch-DevOps-SRE-Extension.md` (Q011–020) |
| Senior Salesforce | 6 (Apex async, SOQL/SOSL, LWC, Platform sharing, Integration/Platform Events, Service Cloud) | 20 | `sales/Sample-Pack-v0.5-Senior-Salesforce-Populated.md` (Q001–020) |
| Senior Python | 6 (core, async, type system, web frameworks, data science, production) | 20 | `sales/Sample-Pack-v0.5-Senior-Python-Populated.md` (Q001–020) |
| Senior AWS | 6 (compute, storage, networking, IAM/security, databases, ops/cost) | 20 | `sales/Sample-Pack-v0.5-Senior-AWS-Populated.md` (Q001–020) |
| Senior AI Prompt Engineering | 6 (prompt construction, reasoning/decomposition, tool use/agents, LLM eval, safety/alignment, production patterns) | 20 | `sales/Sample-Pack-v0.5-Senior-AI-Prompt-Engineering-Populated.md` (Q001–020) |
| **TOTAL** |  | **160** | 12 source files |

## Format mix per role (target distribution; actual may vary slightly per role)

| Format | Per role | Total |
|---|---|---|
| MCQ | 10–14 | ~60 |
| Code (Judge0 sandbox) | 4–6 | ~25 |
| Design / system | 2–3 | ~10 |
| Case-study / debugging | 2–3 | ~10 |

## Difficulty distribution (IRT b-parameter target)

| Band | Range | Per-role target | Total |
|---|---|---|---|
| Easy | b ∈ [-1.5, -0.5] | 6 | ~30 |
| Medium | b ∈ [-0.5, +0.5] | 8 | ~40 |
| Hard | b ∈ [+0.5, +1.5] | 5 | ~25 |
| Very Hard | b ∈ [+1.5, +2.0] | 1 | ~5 |

## Pre-deployment status — per question

All 100 questions are status=`calibrating` (IRT N=0). They graduate to `released` once:
1. SME Lead validates correctness + rubric (per Wave 1 quality gate; 8-item checklist per pack)
2. Reference Panel + Customer Zero produces N≥30 responses per item (per IRT-Calibration-Pipeline-v0-Spec)
3. Bias DIF check passes on demographic comparisons (per Bias-Detection-Methodology-v1)
4. Anti-leak rotation engine confirms no public-leak match (per Anti-Leak-Engine-v0-Design)
5. AI plagiarism benchmark ≥93% on the response corpus (per AI-Plagiarism-Benchmark-Protocol-v1)

## Watermarking + variants

Every question has a `watermark_seed` placeholder ready for per-tenant variant generation. Once the variant generation pipeline ships (per Anti-Leak-Engine-v0-Design §Variant generation pipeline), each Customer Zero candidate receives a deterministically-watermarked variant. For Talpro Customer Zero v1, watermarking is symbolic (placeholders); full rotation activates Phase 1 M2.

## Customer Zero deployment path (Talpro India)

1. **Day 0–7 (this week):** SME Lead validation (when SME Lead in seat post-CC-11). Until then, Bhaskar + CTO Office co-review the 100 questions for any obvious errors.
2. **Day 7–14:** First 100 candidates queued for Wave 1 assessment via Talpro India's existing recruiting workflow. Internal-namespace API key (per D3 spec) issued once B7 Postgres provisioned (CC-01 prerequisite).
3. **Day 14–30:** Response data flows to QOrium content.responses table. Calibration starts. SME Lead sees first IRT distribution.
4. **Day 30–90 (M1–M3):** Iterative — items with b-drift > ±0.5 flagged for revision; bias DIF check runs monthly on items with N≥30; leaked-flag rate monitored.
5. **Day 90 (M3 IdeaForge re-gate):** Wave 1 expanded from 100 → 5,000 across all 8 sub-skill domains per `customer-zero/Wave-1-Question-Batch-Plan.md`.

## Customer Zero feedback channel

WhatsApp group **"QOrium Customer Zero"** (per CC-03 closeout default; CTO-owned; Bhaskar + Talpro India Delivery Head + CTO Office notification proxy). Weekly Friday 5 PM IST metrics summary auto-posted to the group. P0/P1 defect SLA per `customer-zero/D4-Customer-Zero-Feedback-Charter.md`.

## Open questions (3) for SME Lead validation cycle

1. **Distractor quality:** Are MCQ distractors plausible-but-wrong (require knowledge to eliminate), or are some obviously-wrong (gimme distractors)? SME Lead first-pass review will flag.
2. **Citation accuracy:** Every question cites source docs/specs (e.g., specific JEPs, AUTOSAR sections, PostgreSQL doc page numbers). SME Lead verifies citations are accurate and current to the stated baseline (Java 21, React 18, Postgres 16, Spring '26 SF release, K8s 1.30+).
3. **Indian-context bias:** Some questions use Indian-context examples (Talpro hiring, INR amounts, Bengaluru tech stack patterns). SME Lead audits whether these create bias against non-India candidates if/when QOrium expands internationally.

## Reference index — all source files in this batch

```
sales/
├── Sample-Pack-v0.5-Senior-Java-Populated.md          (10 Qs, QOR-JAVA-001..010)
├── Sample-Pack-v0.5-Senior-React-Populated.md         (10 Qs, QOR-REACT-001..010)
├── Sample-Pack-v0.5-Senior-SQL-Data-Populated.md      (10 Qs, QOR-SQL-001..010)
├── Sample-Pack-v0.5-DevOps-SRE-Populated.md           (10 Qs, QOR-DEVOPS-001..010)
└── Sample-Pack-v0.5-Senior-Salesforce-Populated.md    (20 Qs, QOR-SFDC-001..020)
customer-zero/
├── Wave-1-Seed-Batch-Java-Extension.md                (10 Qs, QOR-JAVA-011..020)
├── Wave-1-Seed-Batch-React-Extension.md               (10 Qs, QOR-REACT-011..020)
├── Wave-1-Seed-Batch-SQL-Data-Extension.md            (10 Qs, QOR-SQL-011..020)
├── Wave-1-Seed-Batch-DevOps-SRE-Extension.md          (10 Qs, QOR-DEVOPS-011..020)
└── Wave-1-Seed-Batch-100-Questions-Master.md          (this file — index + summary)
```

## Tooling for SME Lead review

When SME Lead is hired:
- Review tool: each source file is `.md` + `.docx` for in-Word commenting
- Tracking spreadsheet: `customer-zero/SME-Validation-Tracker-Wave1.xlsx` (CTO to author at SME Lead start; per-question status + reviewer + date + accept/revise/reject)
- Calibration prep: I/O Psych contractor receives this batch for IRT calibration pipeline (per `infra/IRT-Calibration-Pipeline-v0-Spec.md`)

---

**This is the first real content asset of QOrium.** 100 candidate-ready questions across the five roles Talpro India hires most. Pending SME validation, this batch represents Day 1 of the Wave 1 trajectory toward 5,000 questions by M3 (per Constitution Article IX Phase Gate M3).

*End of master bundle. Source files contain the actual question content.*
