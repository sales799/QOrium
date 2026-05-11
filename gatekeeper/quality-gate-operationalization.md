# Quality Gate Operationalization (92-Point Scorecard in Practice)

**Authority:** Constitution §2.6 (GATEKEEPER) + Article VII (Quality Gate auto-fail criteria) + SO-3 (Quality Gate Discipline)
**Source-of-truth scorecard:** `governance/Quality-Gate-92pt-Scorecard.md`
**Owner:** GATEKEEPER (CTO Office Y1)
**Cadence:** Per content wave + per Phase Gate milestone

---

## Why this doc exists separate from the IdeaForge rubric

Two related-but-distinct uses of the 92-point Quality Gate scorecard:

| Use                                       | Office                | Stage                                                                     | Output                                                    |
| ----------------------------------------- | --------------------- | ------------------------------------------------------------------------- | --------------------------------------------------------- |
| **Strategic gate** (planned work)         | IdeaForge (Office 4)  | After MANTHAN blueprint, before execution starts                          | PASS/FAIL → MANTHAN cycle continues or restarts           |
| **Operational gate** (work about to ship) | GATEKEEPER (Office 6) | Before content wave releases OR before Phase Gate milestone certification | PASS/FAIL → wave ships or returns to Stage 4 (SME Review) |

`manthan/ideaforge-rubric.md` covers the strategic use (upstream).
THIS file covers the operational use (downstream — applied to content waves and Phase Gate milestones).

Both apply the SAME 92-point scorecard. Different lifecycle stage = different effect of pass/fail.

---

## When this protocol fires

GATEKEEPER runs the operational Quality Gate scoring in two scenarios:

### Scenario A — Per content wave (CDO + GATEKEEPER joint)

After CDO + COM complete a wave (per `cdo/wave-cadence.md`), the wave hits the GATEKEEPER quality-gate scoring before release.

- **Input:** the wave's question batch + IRT calibration data + anti-leak fingerprint baseline + bias-detection results
- **Output:** PASS → wave releases to live library | FAIL → wave returns to SME Stage 4 OR Calibrate Stage 5 depending on which auto-fail criteria triggered

### Scenario B — Per Phase Gate milestone (CTO + GATEKEEPER joint)

At each Constitution Article IX milestone (M0, M3, M9, M12, M21), GATEKEEPER runs a comprehensive quality-gate scoring against ALL work shipped between milestones.

- **Input:** milestone-specific criteria (per Article IX v2.0 updates) + the standard 92-point scorecard
- **Output:** PASS → Phase advances (e.g., Phase 1 → Phase 2) | FAIL → milestone is missed; CEO escalation per `manthan/revalidation-triggers.md`

---

## The auto-fail criteria (Constitution Article VII v2.0)

Before scoring on the 92-point scale, ALL auto-fail conditions must clear. Any fail = gate fails immediately regardless of point score.

| #   | Criterion                                    | What triggers auto-fail                                         | Operational check                                                                                            |
| --- | -------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| 1   | **IRT calibration absent**                   | A shipped question without IRT metadata                         | Database query: `SELECT COUNT(*) FROM questions WHERE irt IS NULL` ≠ 0 → fail                                |
| 2   | **Anti-leak rotation >24h**                  | Fingerprint freshness drifts past 24h                           | `cdo/anti-leak-forensics.md` SLA check; cron job timestamp ≤ 24h ago                                         |
| 3   | **AI plagiarism benchmark bypassed**         | Quarterly benchmark not run for the period                      | `gatekeeper/ai-plagiarism-benchmark-procedure.md` log shows no entry for the quarter                         |
| 4   | **ATS coverage missing**                     | India-stack hiring scenarios uncovered for the relevant Phase   | Phase-gate criterion review (varies per milestone)                                                           |
| 5   | **IO-psych validation pathway undocumented** | A wave shipped without SME Stage 4 sign-off captured            | `customer-zero/SME-Validation-Tracker-Wave1.xlsx` (and successors) — every shipped UUID has an SME signature |
| 6   | **Recursive No-Fiction violation**           | Any data point in shipped material invented rather than sourced | Sample audit: 10 random claims from the wave; verify each sources to a doc/commit/external reference         |

If any of 1-6 trigger → wave does NOT proceed. Returns to the contributing Office (CDO, COM, or CTO depending on which criterion failed) with the specific finding.

---

## The 92-point scoring (when auto-fail clears)

Per `governance/Quality-Gate-92pt-Scorecard.md` — 8 categories:

| Category                 | Max | Operational evidence (what GATEKEEPER scores against)                                                                            |
| ------------------------ | --- | -------------------------------------------------------------------------------------------------------------------------------- |
| Customer Zero discipline | 12  | Talpro India dogfood evidence: did this wave's questions run through Talpro hiring drives before external release?               |
| Strategic moat           | 12  | Does this wave reinforce the 3-moat positioning (anti-leak + IRT + role-graph) vs Constitution §2.7 competitor classification?   |
| Capital efficiency       | 11  | Cost per validated question (target: declining over waves; per Investor Brief §3 trajectory)                                     |
| Founder fit              | 11  | Did Bhaskar's distribution / execution leverage show up in wave delivery? (Talpro Network warm-intros for SME contractors, etc.) |
| Distribution leverage    | 11  | Can this wave be sold via Bali's 3 motions without modification? Or does it need motion-specific repackaging?                    |
| Quality / Calibration    | 12  | IRT correlation_to_predicted distribution; SME validation pass rate; question-rejection rate at Stage 4                          |
| Anti-leak Discipline     | 12  | Wave fingerprint baseline established; 30-day post-release leakage rate; rotation cadence honored                                |
| Operational Maturity     | 11  | SO-3 / SO-15 / SO-16 / SO-25 adherence visible in wave artifacts                                                                 |

**Pass threshold:** **70/92 = 76%** (same as IdeaForge). Below = fail; wave returns to contributing Office.

---

## The wave gate run procedure

### Step 1 — Receive the wave for scoring

Inputs from CDO + COM (per `cdo/wave-cadence.md` post-wave checklist):

- Wave summary report (count shipped, count rejected at each stage)
- IRT correlation distribution
- Anti-leak fingerprint baseline data
- Bias-detection report (per `governance/Bias-Detection-Methodology-v1.md`)
- Sample of 10 questions for spot-check

### Step 2 — Auto-fail check (the 6 criteria above)

GATEKEEPER runs the operational check for each criterion. Document the result in the gate report.

### Step 3 — Point scoring (92-point breakdown)

For each of 8 categories, evidence-based scoring. Notes attach to each score so the audit trail is concrete (not "Quality 10/12" but "Quality 10/12 because correlation_to_predicted median 0.89 across 47 questions; 2 outliers re-validated").

### Step 4 — Gate decision

- All auto-fail criteria pass + total ≥70/92 = **PASS**
- Any auto-fail criterion fails = **FAIL** (regardless of point score)
- Auto-fail clears + total <70/92 = **FAIL** (point-based)
- Auto-fail clears + total 70-78/92 + some specific category <50% of max = **CONDITIONAL PASS** (ship with documented gap; tracked in `cto/tech-debt.md`)

### Step 5 — Sign-off log

Every wave gate run logs to `gatekeeper/wave-gates/YYYY-MM-DD-wave-N.md`:

```markdown
# Wave Gate — Wave N

**Date:** YYYY-MM-DD
**Wave content:** <role families covered + question count>
**Gate result:** PASS | FAIL | CONDITIONAL PASS

## Auto-fail check

- [ ] IRT calibration discipline (SO-21): <PASS/FAIL — evidence>
- [ ] Anti-leak rotation <24h (SO-22): <PASS/FAIL — evidence>
- [ ] AI plagiarism benchmark protocol honored (SO-22): <PASS/FAIL — evidence>
- [ ] ATS coverage for relevant phase: <PASS/FAIL — evidence>
- [ ] IO-psych validation pathway documented: <PASS/FAIL — evidence>
- [ ] No SO-24 violations: <PASS/FAIL — evidence from sample audit>

## Point scoring

| Category                 | Max | Score | Evidence   |
| ------------------------ | --- | ----- | ---------- |
| Customer Zero discipline | 12  | <X>   | <evidence> |
| Strategic moat           | 12  | <X>   | <evidence> |

| ...
| **Total** | **92** | **<sum>** | **<X/92 = X%>** |

## Result rationale

<One paragraph.>

## Conditions (if CONDITIONAL PASS)

<List specific conditions; each with owner + ETA. Add to cto/tech-debt.md.>

## CEO ratification

<For Phase Gate milestones; CEO logs acceptance OR sends back.>
```

---

## Phase Gate milestone runs (per Article IX)

The same procedure runs at each Phase Gate milestone with phase-specific criteria layered on:

| Milestone | Phase                              | Phase-specific criteria (v2.0)                                                                                                                       |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M0**    | Setup                              | Constitution ratified; first SO set adopted; Customer Zero (Talpro) integration spec'd ✅ as of 2026-05                                              |
| **M3**    | First content wave + first revenue | 5,000 validated questions across N programming languages + India-stack priority + ATS priority list; first 5 logos closed-won                        |
| **M9**    | Psychometric validation            | Reference Panel calibration data live; IRT correlation ≥0.85; first AI plagiarism benchmark passed (per Article IX-M9 amendment)                     |
| **M12**   | Y1 closing                         | 40,000+ questions; QOrium Reference Panel paid-candidate calibration network live; 50 logos total; first marquee case study; Series Pre-A close prep |
| **M21**   | Pre-A target                       | $1M+ ARR; team of 11; pipeline of 100+                                                                                                               |

Failing the milestone-specific criteria is auto-fail regardless of base 92-point score. The milestone doesn't advance until all are met.

---

## What this protocol does NOT do

- ❌ **Score MANTHAN classifications.** Article VI 5-priority Decision Framework, not 92-point Quality Gate. Different stage; different scorecard.
- ❌ **Author / fix the failing material.** GATEKEEPER returns to the contributing Office; doesn't directly re-author.
- ❌ **Override Constitutional auto-fail.** No GATEKEEPER discretion on auto-fail. Article VII is binding.
- ❌ **Tune thresholds at will.** The 70/92 pass threshold + 92-point category breakdown is in `governance/Quality-Gate-92pt-Scorecard.md`; changing them requires Constitutional Amendment per Article XI.

---

## Anti-patterns

- ❌ **Skipping auto-fail check on a "small wave."** Article VII auto-fail criteria apply to every wave, not just big ones. Small wave that ships without IRT calibration is just as bad as big wave.
- ❌ **Soft-failing the AI plagiarism benchmark by deferring to "next quarter."** SO-22 is quarterly-mandated; deferral is a Constitutional violation logged in `cto/tech-debt.md`.
- ❌ **CONDITIONAL PASS without explicit conditions tracked.** "Pass with caveats" that aren't specific = effectively a pass; defeats the audit trail.
- ❌ **Re-scoring after a fail without addressing the root cause.** If a wave failed Quality 9/12, fix what made it 9/12; don't re-score and hope the number changes.

---

## Y1 reality

GATEKEEPER hasn't run a formal wave-gate yet. Wave 1 + Wave 2 shipped in pre-protocol mode (CTO operating informally). Going forward (Wave 3+ per `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`):

- Wave 3 will be the FIRST wave to run formal gate scoring per this protocol
- M3 will be the first Phase Gate milestone to run formal gate scoring
- The first run's scorecard becomes the baseline for tuning

---

_Cross-references: Constitution §2.6 (GATEKEEPER), Article VII (Quality Gate + auto-fail criteria), Article IX (Phase Gate milestones), SO-3, SO-21, SO-22, SO-24. Source-of-truth scorecard: `governance/Quality-Gate-92pt-Scorecard.md`. Companion docs: `manthan/ideaforge-rubric.md` (strategic gate — upstream), `cdo/wave-cadence.md` (provides wave inputs to this gate), `gatekeeper/release-gate-protocol.md` (parallel — code release vs content release), `gatekeeper/ai-plagiarism-benchmark-procedure.md` (auto-fail criterion 3 evidence source)._
