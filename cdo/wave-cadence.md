# Content Engine Wave Cadence

**Authority:** Constitution §2.5 (CDO) + Blueprint §3.1 (7-stage pipeline) + Article IX (Phase Gate milestones)
**Owner:** COM (Content Ops Manager — operates) + CDO (validates calibration + anti-leak)
**Source-of-truth:** `customer-zero/Wave-1-Question-Batch-Plan.md`, `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`

---

## What "waves" are

Content shipping happens in batches called **waves**. Each wave is a coordinated release of N questions across M role families that all pass through the 7-stage pipeline together.

Why waves and not continuous shipping:

- SME contractor capacity batches efficiently (a contractor onboarded for "Java backend" works through 50 questions, not 1)
- Reference Panel sessions batch efficiently (a session calibrates 10-30 questions; lining waves up means fewer sessions for higher throughput)
- Quality Gate review (`gatekeeper/`) runs per-wave, not per-question; one Gate pass + 50 questions ship is leaner than 50 Gate passes
- Anti-leak fingerprint baseline establishes per-wave (similar generation timestamps mean similar surface-leakage timing)

---

## Wave milestones (per Constitution Article IX trajectory)

| Wave                  | Target milestone | Question count                           | Coverage                                                                                                                                   |
| --------------------- | ---------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Wave 0 / seed**     | Pre-M0           | ~100                                     | Customer Zero kickoff (April 2026); first 100 questions for Talpro India internal hiring drives                                            |
| **Wave 1**            | M0-M1            | +400 (cumulative ~500)                   | General tech (Java, Python, SQL, React, AWS, DevOps/SRE) — `customer-zero/Wave-1-*` files                                                  |
| **Wave 1 extensions** | M0-M1            | +N (~30 per skill × 10 skills = ~300)    | AIPE, Java extensions, React extensions, etc. — `customer-zero/Wave-1-*-Extension-021-040.md` family                                       |
| **Wave 2**            | M1-M2            | +N                                       | India-stack additions (Salesforce CPQ, SAP ABAP, Oracle HCM Cloud, Finacle/Flexcube, Embedded Automotive) — `customer-zero/Wave-2-*` files |
| **Wave 3**            | M2-M3            | +N                                       | Per `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md` — TBD coverage                                                                          |
| **Wave 4-N**          | M3-M9            | scaling toward 5,000 (M3) → 40,000 (M12) | Expanding role families per content-engine cadence                                                                                         |

**M0 actual (2026-04-30):** 530 validated questions. 10.6% of M3 5,000-question target. Per `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.md` + Wave-1 + Wave-2 extensions.

---

## Per-wave checklist (CDO + COM joint)

For every wave, both COM (operates) and CDO (validates) work through:

### Pre-wave (planning, ~1 week before)

- [ ] **Scope locked** — list of role families + question counts + target difficulty distribution
- [ ] **SME contractors confirmed** — capacity for the wave; payment terms in `customer-zero/SME-Lead-Onboarding-Day-1.md`
- [ ] **Reference Panel sessions scheduled** — Stage 5 calibration capacity for the expected volume
- [ ] **Anti-leak fingerprint baselining** — initial scan of public surfaces for the role-graph leaves the wave covers (so we can compare post-release)
- [ ] **Quality Gate criteria reviewed** — any phase-specific criteria from Constitution Article IX milestone updated

### During-wave (active shipping)

For each question in the wave, the 7-stage pipeline runs:

| Stage            | Owner                             | Output                                           | Constitutional check                                       |
| ---------------- | --------------------------------- | ------------------------------------------------ | ---------------------------------------------------------- |
| 1. Spec          | COM                               | role-graph leaf + format + band                  | SO-3 (Quality Gate input quality)                          |
| 2. AI Draft      | COM (uses Anthropic API)          | N draft variants                                 | SO-24 (no-fiction — drafts are AI; validation IS the rule) |
| 3. Self-Critique | COM (AI)                          | Drafts → narrowed candidate                      | SO-24                                                      |
| 4. SME Review    | SME contractor (paid)             | Validated question                               | Article VII: I/O psych pathway documented                  |
| 5. Calibrate     | CDO + Reference Panel             | IRT metadata (`cdo/irt-calibration-protocol.md`) | SO-21 — auto-fail if missing                               |
| 6. Release       | CTO Office (push to live library) | Question live in ReadyBank/JD-Forge/Stack-Vault  | Quality Gate sign-off (`gatekeeper/`)                      |
| 7. Post-Deploy   | CDO (monitoring)                  | Refined IRT + anti-leak baseline                 | SO-22 — auto-fail if anti-leak SLA breached                |

### Post-wave (within 7 days of shipping)

- [ ] **Wave QA complete** — sample 10% of shipped questions; manually verify IRT metadata + anti-leak fingerprint exist
- [ ] **Wave summary report** — count shipped, count rejected at each stage, time-to-ship per question, calibration correlation distribution
- [ ] **Lessons logged** — what slowed the wave down; what to fix in the next wave's planning
- [ ] **Quality Gate audit** — `gatekeeper/release-gate-protocol.md` runs against the wave; any deviations logged to `cto/tech-debt.md`

---

## Wave 1 retrospective (already shipped)

Per `customer-zero/Wave-1-Seed-Batch-100-Questions-Master.md` + Wave-1 extensions:

- **Shipped:** ~500 questions (100 seed + ~400 extensions across Java, AIPE, React, SQL, Python, AWS, DevOps/SRE, Salesforce)
- **Validated by:** Wave-1 SMEs (18 onboarded per Blueprint §3.1)
- **Calibration:** Y1 internal panel (`cdo/reference-panel-governance.md` Y1 phase)
- **Anti-leak baseline:** captured at release; daily scans run via Talpro India manual rotation discipline (full automation is M2 deliverable per TD-003)
- **Result:** 530 validated questions at M0 (10.6% of M3 5K target)

---

## Wave 2 retrospective (already shipped)

Per `customer-zero/Wave-2-*-Extension-021-040.md` family:

- **Shipped:** Embedded Automotive, Finacle/Flexcube, Oracle HCM Cloud, SAP ABAP, Salesforce CPQ — each ~30-40 questions
- **Significance:** First wave to add **role-graph leaves that didn't exist in Wave 1** — proves the role-graph compounds (per `apps/marketing/src/content/blog/role-graph.mdx` "How we built ours" + "M3 vs M12 trajectory")
- **Calibration:** still Y1 internal panel; M9-M12 trajectory introduces external paid panel
- **Anti-leak baseline:** captured per question

---

## Wave 3 (in flight per `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`)

- **Target:** M3 (~5,000 questions cumulative)
- **Coverage:** TBD per the kickoff plan; expanding to AI-era role families + additional India-stack depth
- **Operating cadence:** weekly batch shipping; CDO + COM joint review every Friday in Bali debrief

---

## What this protocol does NOT cover

- ❌ The actual question-authoring (SME network operating procedure) — that's `customer-zero/SME-Lead-Onboarding-Day-1.md`
- ❌ Anti-leak fingerprint methodology — that's `cdo/anti-leak-forensics.md`
- ❌ IRT calibration mechanics — that's `cdo/irt-calibration-protocol.md`
- ❌ Quality Gate scoring — that's `gatekeeper/quality-gate-operationalization.md` (forthcoming this commit)
- ❌ Bias detection — that's `governance/Bias-Detection-Methodology-v1.md` (Stage 3 + Stage 4 of pipeline)

This wave-cadence file is the **integration layer** that ties them together at the wave level.

---

## Anti-patterns (don't do these)

- ❌ **Shipping a wave without all 7 stages running.** Skipping Stage 5 (calibrate) is an SO-21 auto-fail. Skipping Stage 4 (SME) is an Article VII auto-fail.
- ❌ **Mixing waves at the operational level.** Wave 1 + Wave 2 questions calibrate together = harder to attribute calibration drift to a wave's authoring discipline.
- ❌ **No post-wave retrospective.** Lessons not captured = same mistakes in the next wave.
- ❌ **Over-promising wave timelines to Bali.** CDO + COM commit to dates the SME contractor capacity can support, not dates Bali wishes.

---

_Cross-references: Constitution §2.5, Article VII (auto-fail criteria), Article IX (Phase Gate milestones — wave targets), Blueprint §3.1 (7-stage pipeline). Companion docs: `cdo/irt-calibration-protocol.md`, `cdo/anti-leak-forensics.md`, `cdo/reference-panel-governance.md`, `customer-zero/Wave-_`files (operational data),`gatekeeper/release-gate-protocol.md` (Quality Gate sign-off per wave).\*
