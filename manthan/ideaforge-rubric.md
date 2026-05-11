# IdeaForge — Gate Scoring Rubric

**Office:** IDEAFORGE · Office 4 of 7 (Constitution §2.4)
**Y1 reality:** CTO Office operates IdeaForge per §2 introduction; bundled with MANTHAN here because Y1 they're operationally one workflow
**Authority:** Constitution §2.4 + Article VII (Phase Gate / Quality Gate)
**Source-of-truth scoring authority:** `governance/Quality-Gate-92pt-Scorecard.md`

---

## What IdeaForge does

IdeaForge is QOrium's **gate scoring framework**. After MANTHAN produces a blueprint and the CEO accepts it, IdeaForge runs the formal scoring against the 92-point Quality Gate before any execution begins.

The Quality Gate is constitutional (Constitution Article VII). It enumerates auto-fail criteria + weighted scoring across 8 categories (Customer Zero · Strategic Moat · Capital Efficiency · Founder Fit · Distribution Leverage · Quality / Calibration · Anti-Leak Discipline · Operational Maturity).

A blueprint that fails the IdeaForge gate goes back to MANTHAN for re-classification. A blueprint that passes proceeds to the executing Office (CTO / Bali / etc.).

---

## When IdeaForge runs

Same triggers as MANTHAN, downstream:

1. **MANTHAN blueprint ratified by CEO** — IdeaForge runs before any handoff fires.
2. **Quarterly Phase Gate review** — Constitution Article IX milestones (M0 → M3 → M9 → M12 → M21) all run an IdeaForge gate review.
3. **Constitutional Amendment cycle** — when the Quality Gate definition itself updates (e.g., Constitution v2.0 added auto-fail criteria for IRT / anti-leak / ATS / IO-psych), prior IdeaForge passes are re-validated against the new criteria.

---

## IdeaForge cycle (procedure)

### Step 1 — Receive a MANTHAN blueprint

Input: `manthan/blueprints/YYYY-MM-DD-<title>.md` in `Accepted` status (CEO-accepted per §8 of the blueprint).

### Step 2 — Score against the 92-point gate

Apply `governance/Quality-Gate-92pt-Scorecard.md`. Each of the 8 categories has explicit point allocations + auto-fail conditions.

Auto-fail conditions per Constitution Article VII (v2.0):

- **IRT calibration absent** — every shipped question has IRT metadata (SO-21). Blueprint that ships content without this fails automatically.
- **Anti-leak rotation >24 hours** — automated rotation must complete daily (SO-22). Blueprint that allows >24h SLA fails automatically.
- **AI plagiarism benchmark bypassed** — public benchmark protocol (SO-22) must be honored. Blueprint that ships without is auto-fail.
- **ATS coverage missing** for India-stack hiring scenarios — Phase Gate criterion. Blueprint that doesn't address fails automatically for the relevant phase.
- **IO-psych validation pathway undocumented** — every content question passes through I/O psychologist sign-off per Constitution Article VII. Blueprint missing this fails automatically.
- **Recursive No-Fiction violation** — any data point invented rather than sourced fails per SO-24.

### Step 3 — Compute the score

92-point breakdown (per `governance/Quality-Gate-92pt-Scorecard.md`):

| Category                 | Points | What it measures                                               |
| ------------------------ | ------ | -------------------------------------------------------------- |
| Customer Zero discipline | 12     | SO-1 mandate adherence; Talpro India dogfood evidence          |
| Strategic moat           | 12     | Differentiation vs Constitution §2.7 competitor classification |
| Capital efficiency       | 11     | Cost discipline relative to Investor Brief §3 trajectory       |
| Founder fit              | 11     | Bhaskar's distribution + execution leverage                    |
| Distribution leverage    | 11     | Talpro Network + Bali sales motions                            |
| Quality / Calibration    | 12     | IRT calibration + IO-psych validation discipline               |
| Anti-leak Discipline     | 12     | SO-22 + 24-hour SLA + rotation cadence                         |
| Operational Maturity     | 11     | SO-3 / SO-15 / SO-16 / SO-25 adherence                         |
| **Total**                | **92** |                                                                |

Pass threshold: **70/92 = 76%**. Below = fail; the blueprint goes back to MANTHAN.

### Step 4 — Document the score

Save to `manthan/ideaforge-gates/YYYY-MM-DD-<title>.md` with this structure:

```markdown
# IdeaForge Gate — <blueprint title>

**Date:** YYYY-MM-DD
**Blueprint reviewed:** [link to manthan/blueprints/...]
**Operator:** CTO Office (Y1)
**Result:** PASS | FAIL | CONDITIONAL PASS

## Auto-fail check

- [ ] IRT calibration discipline (SO-21)
- [ ] Anti-leak rotation <24h (SO-22)
- [ ] AI plagiarism benchmark protocol honored (SO-22)
- [ ] ATS coverage for relevant phase
- [ ] IO-psych validation pathway documented
- [ ] No SO-24 violations (no fabricated data)

If ANY checkbox fails → result is FAIL regardless of point score. Send back to MANTHAN.

## Point scoring

| Category                 | Max    | Score     | Notes       |
| ------------------------ | ------ | --------- | ----------- |
| Customer Zero discipline | 12     | <X>       | <evidence>  |
| Strategic moat           | 12     | <X>       |             |
| Capital efficiency       | 11     | <X>       |             |
| Founder fit              | 11     | <X>       |             |
| Distribution leverage    | 11     | <X>       |             |
| Quality / Calibration    | 12     | <X>       |             |
| Anti-leak Discipline     | 12     | <X>       |             |
| Operational Maturity     | 11     | <X>       |             |
| **Total**                | **92** | **<sum>** | <X/92 = X%> |

## Result rationale

<One paragraph. Why this score?>

## Conditions (if CONDITIONAL PASS)

<List specific conditions. Each must be met before execution proceeds.>

## Re-gate trigger

<When does this gate get re-run? Typically: at next Phase Gate milestone OR
on SO-25 material competitor move OR on Constitutional Amendment to the
Quality Gate.>

## CEO ratification

<IdeaForge result + score → CEO logs acceptance OR sends back. Logged here.>
```

---

## What IdeaForge does NOT do

- ❌ **Make decisions.** Same as MANTHAN. CEO ratifies; CTO/Bali execute.
- ❌ **Score MANTHAN classifications.** Classifications use the 5-priority Decision Framework (Article VI), not the 92-point Quality Gate.
- ❌ **Create blueprints.** Blueprints come from MANTHAN. IdeaForge scores them.
- ❌ **Re-write Quality Gate criteria.** That's a Constitutional Amendment per Article XI.

---

## Phase Gate milestones (Constitution Article IX, v2.0 updates)

Per Constitution Article IX, IdeaForge runs at each Phase Gate milestone with phase-specific criteria layered on the standard 92-point gate:

| Milestone | Phase                              | Phase-specific Quality Gate criteria (v2.0)                                                                                                          |
| --------- | ---------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M0**    | Setup complete                     | Constitution ratified; first SO set adopted; Customer Zero (Talpro) integration spec'd                                                               |
| **M3**    | First content wave + first revenue | 5,000 validated questions across N programming languages + India-stack priority + ATS priority list (per v2.0 updates); first 5 logos closed-won     |
| **M9**    | Psychometric validation            | Reference Panel calibration data live; IRT correlation ≥0.85; first AI plagiarism benchmark passed (Constitutional Amendment v2.1 — Article IX-M9)   |
| **M12**   | Y1 closing                         | 40,000+ questions; QOrium Reference Panel paid-candidate calibration network live; 50 logos total; first marquee case study; Series Pre-A close prep |
| **M21**   | Pre-A target                       | $1M+ ARR; team of 11; pipeline of 100+                                                                                                               |

Each Phase Gate IdeaForge run applies BOTH the standard 92-point gate AND the milestone-specific criteria. Failing the milestone criteria is auto-fail regardless of base score.

---

## Y1 reality

The CTO Office operates IdeaForge in Y1 (per Constitution §2 introduction). When a dedicated IdeaForge operator is hired (per CTO Architecture §15 hiring plan, Y2+), this folder remains the same; only the named operator changes.

For Y1, the practical workflow:

1. CTO drafts MANTHAN classification → CEO reviews
2. CTO drafts MANTHAN blueprint → CEO accepts
3. CTO operates IdeaForge gate against the blueprint → score logged
4. If pass, blueprint hands off to executing Office; if fail, back to MANTHAN

The CTO wears all three hats; the audit trail keeps them separated.

---

## What's NOT here yet

- ❌ Library of past IdeaForge gates — first runs land at M3 milestone (per Phase Gate trajectory). Pre-M3 work has been informal CTO + CEO acceptance.
- ❌ Phase-Gate-specific scoring extensions — would be added as separate files in `manthan/ideaforge-gates/phase-gate-criteria/M0.md`, `M3.md`, etc., when each phase becomes active.
- ❌ Automated gate-scoring tool — Y1 Reality is a CTO running the rubric manually; tooling deferred until volume justifies.

---

_Cross-references: Constitution §2.4 (IDEAFORGE charter), Article VII (Phase Gate / Quality Gate), Article IX (Phase milestones), SO-3 (Quality Gate Discipline), SO-21 (IRT), SO-22 (AI plagiarism + anti-leak), SO-24 (no-fiction). Authority: `governance/Quality-Gate-92pt-Scorecard.md` (the canonical scorecard). Companion: `manthan/research-classification-protocol.md` (upstream), `manthan/blueprint-template.md` (upstream input)._
