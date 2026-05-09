# Deliverable Schedule — I/O Psychologist Contractor

**Term:** 6 months from Effective Date
**Cadence:** asynchronous, output-based
**Total deliverables:** 6 headline + ongoing batch reviews
**Payment structure:** 5 milestone tranches per `SOW.md` §5

This document maps the SOW deliverables to a week-by-week schedule and
defines acceptance criteria for each.

---

## Month-by-month overview

| Month | Focus | Deliverables due | Payment milestone |
|---|---|---|---|
| 1 | Methodology onboarding + signoffs | D1 | M1 (25%) |
| 2 | Reference Panel charter + first batch | D2 + D3 | M2 (20%) |
| 3 | Panel recruitment monitoring (Panel building, advisory only) | none | – |
| 4 | First IRT calibration cycle (assumes Panel ≥200) | D4 | M3 (25%) |
| 5 | Bias-Detection report + ongoing batch reviews | D5 | M4 (15%) |
| 6 | White paper + closeout | D6 | M5 (15%) |

Plus: ongoing Wave-3 batch reviews throughout months 2–6 at ~10
items per fortnight (200 items / 4 months ≈ 50 items/month
distributed across 4 batch reviews, ~12-13 items per batch).

---

## D1 — Methodology Review Signoff (Month 1)

### Scope

- Review `governance/wave3/Authoring-Template-v0.1.md` (the spec
  defining how Wave-3 items are structured: stem, options,
  scoring key, construct tag, difficulty target, anti-leak salt)
- Review `governance/Bias-Detection-Methodology-v1.md` (DIF
  procedure, severity thresholds, intersectional checks)
- Review `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`
  (how QOrium tests for LLM-generated lookalike items)
- Provide written signoff or revision requests for each

### Acceptance criteria

- [ ] Three signoff memos (one per document), 1–2 pages each
- [ ] Each memo identifies any concerns + recommended revisions
- [ ] If revisions are recommended, contractor proposes the revised
      language; QOrium implements; contractor confirms in writing
- [ ] CTO Office accepts within 5 business days

### Timing

- Week 1: kickoff call (90 min), document handoff, contractor reads
- Week 2-3: contractor reviews, drafts memos
- Week 4: revision round, signoff

### Payment trigger

M1 (25%) paid within 7 business days of CTO Office acceptance.

---

## D2 — Reference Panel Governance Charter (Month 2)

### Scope

Co-author with CDO Office (CTO Office Y1 wear) the formal charter
for the QOrium Reference Panel:

- Cohort balance targets (gender · age · region · skill level)
- Recruitment ethics (no candidate-data overlap, IRB-equivalent)
- Compensation (per-respondent honorarium; ₹2K / $25 per session
  recommended)
- Response validity checks (attention checks, timing flags,
  random-response detection)
- Retention policy (delete identifiers, retain anonymised responses)
- Renewal cadence (when does the Panel rotate)
- Audit log requirements (who can access what)

### Acceptance criteria

- [ ] 12-15 page charter document at `governance/reference-panel-charter-v1.md`
- [ ] Co-signed by Contractor + CTO Office
- [ ] Includes appendix: example panel-call invitation language
- [ ] Includes appendix: response validity check rubric
- [ ] CTO Office accepts within 5 business days

### Timing

- Week 5-6: outline + section drafts
- Week 7: full draft review by CTO Office
- Week 8: revisions + co-signing

### Payment trigger

M2 partial, paid jointly with D3.

---

## D3 — First Wave-3 Batch Signoff (20 items, Month 2)

### Scope

Review the first 20 authored Wave-3 items from
`/v1/admin/sme-queue` (the existing admin console queue):

- Construct validity: does the item measure what it claims to
  measure?
- Face validity: would a candidate find this fair?
- Bias check: any group-specific cues that would inflate/deflate
  performance for protected categories?
- Difficulty target: matches the IRT b-band?
- Distractor quality: distractors plausible but distinguishable from
  the key?
- Anti-leak salt: structurally unique vs. publicly searchable items?

### Acceptance criteria

- [ ] All 20 items reviewed; each marked Approved · Revise · Reject
- [ ] For Revise/Reject items, contractor provides specific revision
      language or rejection rationale
- [ ] Revisions implemented by content team within 5 business days;
      contractor re-reviews
- [ ] CTO Office accepts when ≥ 18 of 20 are at Approved status

### Timing

- Week 7-8: parallel to D2; contractor reviews via the admin queue
- Week 9: revision cycle if needed

### Payment trigger

M2 (20%) paid within 7 business days of joint D2 + D3 acceptance.

---

## D4 — IRT Calibration First-Cycle Signoff (Month 4 OR +1 month after Panel ≥200)

### Scope

Once the Reference Panel has ≥200 responses across the Wave-3 items,
the `@qorium/irt` calibration runs. Contractor reviews:

- Calibration outputs: 2PL/3PL Birnbaum parameters per item
  (discrimination a, difficulty b, guessing c)
- JMLE convergence: did all items converge? Any flagged?
- Mean-0/sd-1 anchor application: does the location/scale anchor
  hold across cohorts?
- Mantel-Haenszel DIF: which items show DIF? Severity classification?
- SO-21 quality gate threshold: does the threshold need adjustment
  for Wave-3 (vs. Wave-1/2 norms)?

### Acceptance criteria

- [ ] 8-12 page signoff memo
- [ ] Per-item recommendation: Released · Quarantine · Retire
- [ ] Anchor validation statement
- [ ] DIF flagged items list with severity + recommended action
- [ ] Recommended SO-21 threshold (or confirmation existing threshold
      stands)
- [ ] CTO Office accepts within 5 business days

### Timing

- Triggered when Panel ≥200 responses arrive (calibration runs
  automatically per Sprint 1.8 IRT pipeline)
- Contractor has 3 weeks from calibration complete to deliver

### Payment trigger

M3 (25%) paid within 7 business days of acceptance.

### Risk

If Panel recruitment slips past Month 4, D4 slips with it. SOW Term
extension is automatic up to +2 months without renegotiation; beyond
that the parties revisit.

---

## D5 — Bias-Detection Report Co-Sign (Month 5)

### Scope

Comprehensive bias-detection writeup covering all of Wave-1/2/3
items that have ≥30 responses across at least 2 cohorts:

- DIF results aggregated by cohort cut
- Recommended item revisions or retirements
- Comparison to industry-standard bias rates (anchor: SHL/Pearson
  published bias-rate ranges)
- Co-signature with QOrium CDO/CTO Office
- Suitable for inclusion in investor data room and customer Trust
  pages

### Acceptance criteria

- [ ] 15-25 page report at `governance/wave3/bias-detection-report-Y1.md`
- [ ] Co-signed by Contractor + CTO Office
- [ ] No revealing of candidate-identifiable data
- [ ] CTO Office accepts within 7 business days

### Timing

- Week 17-18: outline + data extracts
- Week 19-20: drafting
- Week 21: review + revisions

### Payment trigger

M4 (15%) paid within 7 business days of acceptance.

---

## D6 — Public Methodology White Paper (Month 6)

### Scope

Customer-facing + investor-facing white paper (≤4,000 words):

- High-level methodology: IRT calibration · DIF · anti-leak · Reference Panel
- Why IRT-calibrated > flat scoring
- How QOrium prevents item drift across rotations
- How bias detection works in practice (no PII)
- Trust signals: third-party calibration sign-off (Contractor's
  credentials), transparency on retired items

### Acceptance criteria

- [ ] ≤4,000 words; co-authored by Contractor + QOrium CTO Office
- [ ] Cleared by CEO for public release
- [ ] One round of CEO+CTO review; one round of Contractor revision
- [ ] CTO Office accepts within 10 business days

### Timing

- Week 21-22: outline + section drafts
- Week 23: review + revisions
- Week 24: final cleared version

### Payment trigger

M5 (15%) paid within 7 business days of acceptance.

---

## Ongoing batch reviews (Months 2-6)

In parallel with the headline deliverables, Contractor reviews
authored Wave-3 items as they arrive in the SME queue:

- ~12-13 items per batch
- ~4 batches per month
- ~50 items reviewed per month
- 200 items total over months 2-6

These are **not** separately invoiced; they're rolled into the
milestone payments. CTO Office tracks batch review velocity in the
admin console.

If batch review backlog exceeds 30 items for > 14 days, contact
contractor for a status check.

---

## Schedule visualisation

```
M1   M2   M3   M4   M5   M6
|----|----|----|----|----|----|
[D1 ]                              ← methodology signoffs
     [D2  ]                        ← Reference Panel charter
     [D3  ]                        ← first batch signoff
[ongoing batch reviews — — — — — — →]
                    [D4 ]          ← IRT calibration signoff
                         [D5  ]    ← bias-detection report
                              [D6] ← white paper

M1   M2   M3   M4   M5   M6
|----|----|----|----|----|----|
 ↑    ↑         ↑    ↑    ↑
 M1   M2 (D2+D3) M3   M4   M5     ← payment milestones
```

---

## What slips look like

| Slip type | Mitigation |
|---|---|
| Panel recruitment slips → D4 slips | SOW extends ±2 months automatically |
| Contractor unavailable mid-term (illness, conflicting deadline) | 14-day cure period in SOW §10; if unresolved, mutual termination at pro-rata |
| QOrium revisions multiplying the review burden | Each deliverable allows 2 revision cycles; beyond that, parties negotiate scope-creep delta |
| Material disagreement on methodology | Escalate to CEO; if unresolved, contractor's professional judgement governs methodology, QOrium's commercial judgement governs ship/no-ship |

---

## Closeout (Month 6 + 1 week)

- Final invoice settled within 7 business days of D6 acceptance
- Confidentiality tail per SOW §8 begins (5 years post-term)
- Convert-to-FTE conversation if both parties want it (SOW §11)
- Optional renewal: 6-month extension if scope warrants (Wave-4
  items, second calibration cycle, etc.)
- Contractor returns all QOrium materials; certifies in writing

---

_Schedule is illustrative; actual dates filled on SOW signing._
_All timing assumes a US/Indian working calendar; major holiday weeks
buffer ±3 days._
