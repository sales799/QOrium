# Interview Process — Senior Engineer #1

5 stage gates · ~10-12 hours of candidate time (paid for take-homes)
· ~6-7 hours of QOrium time per candidate. Aim for 8-10 weeks from
application to offer.

---

## Stage 0 — Application screen (CEO + CTO, 15 min/applicant)

**Goal:** filter to phone-screen.

Inputs: CV, 1-page note (strongest piece of code), LinkedIn URL,
optional public repo, references.

Filter for:
- ≥ 6 years backend engineering at a product company
- TS/Node + Postgres in current or recent role
- Specific artifact mentioned in 1-pager (a feature, a refactor,
  an incident)
- Coherent writing in the 1-pager

Reject (within 7 business days):
- < 4 years experience (we're hiring senior, not new-grad)
- Pure frontend / fullstack-but-frontend-leaning
- Pure manager track with no recent IC time
- 1-pager that's a CV-restate

**Pass-through rate target:** 25-30%.

---

## Stage 1 — Phone screen (CTO Office, 30 min)

**Goal:** confirm fit + interest; technical sniff test.

Format: 30-min Google Meet.

Sample questions:

| # | Question | What we listen for |
|---|---|---|
| 1 | Walk me through the strongest piece of code you've shipped — design + tradeoffs + outcome | depth + ownership |
| 2 | Describe a Postgres performance problem you debugged | pg depth |
| 3 | Tell me about a time prod broke and you owned the fix | production judgment |
| 4 | What's your testing philosophy? | test discipline |
| 5 | Why this role — what about it works for you? | motivation alignment |
| 6 | Timeline for decision? | urgency calibration |

End-of-call:
- If yes: send Stage 2 take-home
- If no: written feedback within 3 business days

**Pass-through rate target:** 40-50%.

---

## Stage 2 — Take-home (D1 from `screening-rubric.md`)

**Goal:** test code quality.

What candidate receives:
- The audit-chain verifier brief (or rotation per cycle)
- ₹10K honorarium for completion regardless of outcome
- 7 days · 4 hours suggested
- Submit via private GitHub repo or zip to careers@

Scoring per `screening-rubric.md` D1.

Pass criterion: D1 ≥ 4.

**Alternative path:** if candidate declines take-home (some senior
ICs do on principle), offer 90-min live coding session via Tuple/
Pop. Same problem; CTO Office observes. Honorarium not paid for
live coding.

**Pass-through rate target:** 50-60% of who attempt.

---

## Stage 3 — Deep panel (CEO + CTO Office, 2 hrs total)

**Goal:** test design + production + leadership.

Format: 2 sessions, can be same day OR split.

### Session 3a — Design + production (CTO Office, 90 min)

| Time | Module |
|---|---|
| 0-10 min | Welcome + warm-up |
| 10-70 min | D2 system design exercise (60 min) |
| 70-100 min | D3 incident-replay (30 min) |
| 100-120 min | Candidate Q&A on tech / roadmap |

Scoring: D2 + D3 per rubric.

### Session 3b — CEO conversation (CEO, 30 min)

Format: 30-min conversation; no rubric. CEO assesses:
- Why QOrium specifically (vs. other India series-pre-A startups)
- Cultural fit with founder + CTO Office working norms
- Candidate's questions surface their priorities
- Candidate's expectations for autonomy + scope

**Pass criterion:** D2 ≥ 4 AND D3 ≥ 3 AND CEO + CTO Office both
say "would work with this person daily." Total D1-D4 ≥ 16.

---

## Stage 4 — D4 essay + reference checks (in parallel)

**Goal:** confirm communication + references.

### D4 essay

Sent post-Stage-3 success. 2-3 day deadline. Scored per rubric D4.

### Reference checks

CEO calls 2-3 references. 30-min structured calls using the rubric
pattern from `governance/hiring/io-psych-contractor/reference-check-
rubric.md` adapted for engineering:

- Q1-Q2: relationship + duration
- Q3-Q5: code quality + design judgement + production discipline
- Q6-Q8: reliability + collaboration + scope changes
- Q9-Q10: independence + disagreement style
- Q11-Q12: confidentiality + would-hire-again

Pass: no concerning answer on ethics, delivery, or "would not hire
again."

---

## Stage 5 — Final + offer (CEO + CTO, 30 min decision + 30 min offer)

**Goal:** decide + extend + close.

### Decision call (CEO + CTO Office, 30 min, no candidate)

Review:
- All scores (D1-D4 + reference)
- CEO conversation impressions
- CTO Office's "would I work daily" call
- Open concerns

Decision:
- Hire (extend offer)
- Hold (additional reference call OR second design conversation)
- Decline

### Offer call (CEO + CTO Office + candidate, 30 min)

Format: warm, direct. CEO extends offer; walks through:
- Compensation (base + ESOP + benefits)
- Role expectations (first 90 days)
- Working norms
- Onboarding plan
- Question-and-answer

Written offer letter follows within 24 hours via email. 7-day
acceptance window (extendable to 14 if candidate has competing
offer).

If accepted:
- Background check (standard India)
- Notice period: 1-3 months typical; we plan around it
- Day-1 onboarding doc prepped during notice

If declined:
- 30-min retro within 7 days (what would have changed mind?)
- Post in alumni network for re-engagement at 12 months

---

## Calendar discipline

| Stage | Target SLA |
|---|---|
| 0 → 1 | 5 business days |
| 1 → 2 | 3 business days |
| 2 → 3 | 7 business days (5 to submit + 2 to score) |
| 3 → 4 | 5 business days |
| 4 → 5 | 7 business days (essay + 2-3 references) |
| 5 → offer | 1 business day |
| **Total** | **~28 business days = 6 calendar weeks** |

Senior engineer hires typically take 8-10 weeks because of notice
periods + multiple-offer juggling.

---

## Hiring panel

| Role | Stages | Decision weight |
|---|---|---|
| CEO | 0, 1, 3b, 4, 5 | tie-breaker; final yes |
| CTO Office | 0, 1, 2, 3a, 5 | technical lead; can veto on D1/D2/D3 |
| Talpro Delivery Head | optional 5 | consultative for India-stack fit |
| Future SME Content Lead | optional Stage 3+ | consultative if hired before this |

CEO and CTO Office must both say yes. Single veto from either kills
the offer.

---

## Rejection discipline

Stage 1+ rejections receive written feedback within 3 business
days:
- 1 paragraph appreciation
- 1 paragraph what tipped the decision
- 1 paragraph door-open language

Stage 0 rejects get a 2-line acknowledgement.

The Indian senior-engineer market is small; word travels.

---

## Equity / fairness controls

- Same questions, same rubric, same time budget per candidate
- Score independently before debriefing
- No "culture fit" override of rubric; if exception, document with
  written rationale
- Counter-rotating note-taking across candidates
- Annual review: have we hired diversely? Where do we lose
  candidates? Adjust accordingly

---

## What kills good candidates

| Killer | Mitigation |
|---|---|
| Slow response | <7 business days at every stage; no exceptions |
| Unpaid take-home | Always paid; ₹10K is non-negotiable |
| Live coding > 60 min unpaid | Cap at 90 min; offer the take-home alternative |
| Surprise additional rounds | All stages disclosed at Stage 1 |
| Comp bait-and-switch | Offer matches band; no "discovered budget constraints" |
| Disrespectful interviewers | Calibration sessions before each cycle; rubric discipline |

---

_Process is a draft. CEO + CTO Office implement post-JD-post.
Refinements logged in `interview-retro-notes.md` (created post-first-
hire-cycle)._
