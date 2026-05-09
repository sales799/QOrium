# Screening Rubric — SME Content Lead

The hire decision rests on four dimensions, each with a 1-5 score
and a worked example. Final hire requires ≥ 4 on every dimension
and ≥ 18 total (out of 20).

---

## Dimension 1 — Methodological depth (weight 25%)

**What it tests:** can the candidate articulate construct validity,
face validity, item discrimination, and bias considerations using
the right vocabulary, and apply that vocabulary to specific items?

**Test instrument:** 4-item review exercise (45 min, take-home OR
in-interview). Candidate is given 4 sample items + scoring keys, and
asked to:
- Score each item: Approve · Revise · Reject
- Justify the decision in ≤ 100 words per item
- For Revise items, propose specific revision language

The 4 items are calibrated to surface specific issues:
1. Item with technically-correct content but ambiguous stem language
2. Item with construct mismatch (claims to test X, actually tests Y)
3. Item with cultural / domain bias (e.g., references that disadvantage
   non-urban candidates)
4. Item that's perfectly fine — distractor / control

**Scoring:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | Catches all 4 issues correctly; revision language is clean; uses precise vocabulary (construct, discrimination, b-parameter, DIF) | Approves all 4; can't articulate why |
| 4 | Catches 3 of 4; vocab good; revisions reasonable | Catches 1-2; vocab present but loosely applied |
| 3 | Catches 2 of 4; vocab partial | Generic "this is bad" feedback without specifics |
| 2 | Catches 1; vocabulary unclear | Mostly approves; flags wrong things |
| 1 | Misses everything | Insists item 4 (control) is broken; flags ghost issues |

**Calibration:** CTO Office score on this exercise = 4/5. We expect
hire candidates to ≥ tie that.

---

## Dimension 2 — Volume judgement (weight 25%)

**What it tests:** can the candidate make 50+ release/revise/retire
decisions per day without quality drift? Can they prioritise?

**Test instrument:** 30-item batch review exercise (60 min, in-
interview or take-home). Candidate makes 30 decisions in 60 minutes
(2 min per item) with brief written justification.

**Scoring:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | All 30 reviewed in 60 min; decisions match CTO Office's blind review on ≥ 26/30; justifications terse + specific | Slows to <15 in 60 min; decisions diverge from baseline on > 15 items |
| 4 | All 30 in 60 min; ≥ 23/30 match baseline; some over-thinking | Finishes 25/30 in 60 min; ≥ 18/30 match |
| 3 | 25-30 in 60 min; ≥ 20/30 match | 18-25 in 60 min; ≥ 14/30 match |
| 2 | 18-25 in 60 min; ≥ 14/30 match | < 18 in 60 min; many wrong calls |
| 1 | <18 in 60 min; many wrong calls | Cannot complete the exercise |

**Calibration:** CTO Office baseline on this exercise (blind, single
sitting): 28/30 in 55 min. Hire candidates ideally land at ≥ 26.

**Failure mode to watch for:** candidate who's fast but sloppy.
Volume without quality is worse than slow + careful at this role.

---

## Dimension 3 — Author leadership (weight 25%)

**What it tests:** can the candidate give an author actionable
feedback that improves the work without crushing morale?

**Test instrument:** 2 written role-plays (30 min). Candidate is
given a fictional draft email from a SME author proposing 5 items;
3 items have specific issues; candidate writes the feedback email.

**Scoring:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | Email opens with specific praise; surfaces issues with rationale; suggests concrete revisions; closes with next step; tone is collegial-direct | Opens with critique; vague issues ("this isn't quite right"); no revision; tone is curt |
| 4 | Strong tone; some issues with prioritisation (raises 5 issues when 3 are critical) | Tone OK but feedback generic |
| 3 | Adequate; covers the issues but missed nuance | Tone-deaf in places; unclear next steps |
| 2 | Mostly correct on the issues but harsh / patronising | Misses 2 of 3 critical issues OR dismissive |
| 1 | Misses the issues OR is genuinely rude | "Reject and explain why" without specifics |

**Why this matters:** the SME Lead's biggest leverage is enabling
authors to ship better work, not personally writing 50 questions a
week. A candidate who can't lead authors gracefully will burn out
the team.

---

## Dimension 4 — Communication (weight 25%)

**What it tests:** can the candidate defend a decision in writing
to a sceptical customer or auditor?

**Test instrument:** 1 written essay (30 min, take-home). Prompt:

> A customer (recruiter at a Fortune-500 hiring 100 engineers/year)
> has reported that QOrium's "AWS Senior" track item Q73 keeps
> letting through candidates who can't deploy a basic VPC. They want
> us to retire the item. The IRT calibration says Q73 is functioning
> normally (b = 0.4, a = 1.2, no DIF). Write a 300-word email to the
> customer explaining your decision.

**Scoring:**

| Score | What looks like a 5 | What looks like a 1 |
|---|---|---|
| 5 | Acknowledges the concern; explains IRT vs construct interpretation cleanly; lays out the diagnostic ("could be construct drift, could be cohort change"); offers a specific next step (e.g., "let's pull last 30 days of responses + qualitative review"); 280-320 words; no jargon-dump | Defensively asserts "the data says it's fine"; no next step; dismissive |
| 4 | Strong but overlong (> 400 words) OR slightly defensive | OK explanation but no diagnostic next step |
| 3 | Reasonable structure, decent content, 350-450 words | Structure OK but content thin |
| 2 | Confused structure; mixes IRT and construct; ≤ 250 or > 500 words | Mostly correct points but customer would not accept this |
| 1 | Refuses to engage with customer's evidence | Pure jargon-dump or pure capitulation |

**Why this matters:** this person's signature appears on customer
artefacts and the public Trust page. If they can't write a defensible
300-word email under pressure, the role doesn't fit.

---

## Total scoring + decision rule

Total = (D1 + D2 + D3 + D4) out of 20.

| Total | Decision |
|---|---|
| 18-20 | Strong hire — extend offer |
| 16-17 | Hire with one caveat — discuss caveat with CEO |
| 14-15 | Borderline — schedule second-round panel; decide post-panel |
| ≤ 13 | Decline |

**Mandatory floor:** any single dimension ≤ 3 means decline regardless
of total. We cannot tolerate a 5/3/5/5 (one weak dimension hidden in
strong total).

---

## Anti-patterns to filter for

- **Confidently wrong** — candidate scores high on volume (D2) but
  consistently in the wrong direction. Volume × confidence × wrong =
  fast erosion of library quality. Decline.
- **Process-perfect, judgment-thin** — candidate articulates the
  framework eloquently but in the exercises makes weak calls.
  Theory > practice = wrong fit at this level.
- **One-domain expert posing as generalist** — candidate has Java
  authoring experience and tries to extrapolate to all 13 sub-skills
  + Wave-3 psychometrics without acknowledging the gap. Push for
  specifics.
- **Resume-rich but artifact-thin** — long tenure at AspiringMinds
  but can't talk about a specific item they authored. Probe in
  interview; if they can't surface examples, decline.

---

## How to administer

| Stage | When | Who runs it |
|---|---|---|
| D1 + D2 take-home | post-phone-screen | CTO Office sends; candidate has 5 days |
| D3 + D4 in-interview | round 2 | CEO + CTO Office |
| Reference check | round 3 | CEO calls 2-3 references |
| Final | round 4 | CEO + CTO Office decision call |

Total candidate time investment: ~6-8 hours, paid ₹5K for the take-
home portion.

Total CEO + CTO Office time per candidate: ~4-5 hours.

For a target close in 8-12 weeks, run 4-6 candidates through the
full process. Phone-screen filter ratio: ~25%.

---

_Rubric is calibrated against CTO Office's own internal benchmark.
Scores are recorded in `governance/hiring/sme-content-lead/scorecards/`
(folder created on first interview)._
