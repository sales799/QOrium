# Quarterly Competitive Scan Template — SO-25 Protocol

**Cadence:** Once per quarter (target: first Monday of Q2/Q3/Q4 each year) · **Authority:** Constitution SO-25 + §10.3 · **Owner:** Bali · **Output:** Appended findings in `competitive_research_log.md` + MANTHAN trigger if material

---

## Why this exists

Constitution SO-25 mandates a quarterly scan of the competitor relationship classification (§2.7). The classification table itself is constitutional — it changes only via Constitutional Amendment (Article XI). The **live state** between amendments is maintained in `competitive_research_log.md`.

This template is the operating procedure for running the scan. **Skipping the quarterly scan is a Constitutional violation.**

---

## Scope

The scan covers every competitor in the §2.7 classification table:

| Class                         | Members                                                    |
| ----------------------------- | ---------------------------------------------------------- |
| OBSOLETE                      | WeCP, Byteboard                                            |
| DIRECT POSITIONING COMPETITOR | Glider AI                                                  |
| STRONG PARTNERSHIP CANDIDATES | DevSkiller, Codility, Adaface, SHL, Talogy                 |
| TIER 1 API CUSTOMERS          | HackerRank, Mercer, Mettl, HackerEarth, CodeSignal, iMocha |
| TIER 2 API CUSTOMERS          | CoderPad/CodinGame, Karat, Vervoe, HirePro                 |

Plus any new entrant flagged by inbound signals (mentions in customer conversations, press, conference circuit, funding announcements).

---

## Material move thresholds (Constitution §10.3 §4)

A finding is "material" — meaning it lands as an entry in `competitive_research_log.md` AND may trigger MANTHAN re-validation — when ANY of:

1. Acquisition or merger involving any classified competitor.
2. Market exit (shutdown, public statement of withdrawal).
3. Strategic pivot (positioning shift, ICP shift, pricing-tier introduction or removal).
4. Pricing change >20% on any published tier.
5. Library size step-change >50% (announced or measurable via API access).
6. Founder or CEO transition.
7. Funding round (Series and amount, even if private).

Below-threshold observations are still logged in the scan **report** but do NOT add findings to the canonical log.

---

## Procedure (one quarter, ~6 hours)

### Step 1 — Per-competitor desk research (~3 hours total)

For each competitor in §2.7, gather:

- [ ] Press releases since last scan (their newsroom, PR Newswire, BusinessWire)
- [ ] Funding news (Crunchbase, Tracxn, PitchBook free tiers)
- [ ] Hiring patterns (LinkedIn job listings, Glassdoor headcount changes)
- [ ] Product release notes (their blog, changelog, public roadmap)
- [ ] Pricing pages (capture current tier names + amounts)
- [ ] Customer reference shifts (their public customer logos page)
- [ ] Founder/CEO LinkedIn activity (any "I'm leaving"/"I'm joining" signals)
- [ ] G2 / Capterra / Gartner mention shifts (review velocity, score changes)

Time-box: **8–12 minutes per competitor.** If a signal looks material, deep-dive (no time cap on materiality verification).

### Step 2 — Cross-source verification (~1 hour)

For every potential material move, **two independent sources** required before logging:

- Press release + LinkedIn announcement
- Filing + news article
- Customer reference + their case study
- API change + documentation update

Single-source rumors are tracked in the scan report as "watch items" but do NOT enter the canonical log.

### Step 3 — Scan report drafting (~1 hour)

Write the scan report using the structure below (next section). Save to `bali/scans/YYYY-Qn-competitive-scan.md`.

### Step 4 — Canonical log append (~30 min)

For each material move, append a numbered finding to `competitive_research_log.md` using the entry template at the bottom of that file.

### Step 5 — MANTHAN trigger evaluation (~30 min)

For each material move, evaluate whether the change invalidates any QOrium positioning:

- Does the move alter pricing assumptions (SO-23 anchor band)?
- Does it alter ICP segmentation (did a TIER 1 buyer shift category)?
- Does it alter the wedge claim (did a competitor announce IRT calibration, anti-leak rotation, or watermarking)?
- Does it alter the partnership-vs-customer thesis for any STRONG PARTNERSHIP CANDIDATE?

If ANY answer is yes → trigger MANTHAN re-validation per SO-25 within 48 hours. Otherwise document the change in the log and move on.

---

## Scan report structure

Save to `bali/scans/YYYY-Qn-competitive-scan.md`. This file accompanies (does not replace) the canonical log entries.

```markdown
# Competitive Scan — Q{{n}} {{YYYY}}

**Scan date:** {{YYYY-MM-DD}}
**Scanned by:** {{name}}
**Period covered:** {{previous_scan_date}} → {{this_scan_date}}
**Findings count:** {{N}} material · {{M}} sub-threshold (watch items)

---

## 1. Headline

{{One-paragraph summary: did anything material happen this quarter? What was the
one most important shift? Are we still on positioning?}}

---

## 2. Material findings (logged to competitive_research_log.md)

### Finding #{{NNN}} — {{Competitor}} — {{Move type}}

- **Class change:** {{from → to, or no change}}
- **Source:** {{primary URL + secondary corroboration}}
- **Rationale for materiality:** {{which §10.3 threshold was tripped}}
- **MANTHAN trigger:** Yes / No · {{reason}}
- **Action items:**
  - [ ] {{Specific actions — outreach pause, pricing review, positioning update, etc.}}
- **Logged in `competitive_research_log.md` as entry #{{NNN}}:** ✅

(Repeat per finding.)

---

## 3. Sub-threshold observations (watch items, NOT logged)

| Competitor | Observation       | Source  | Why sub-threshold                    | Re-check next quarter? |
| ---------- | ----------------- | ------- | ------------------------------------ | ---------------------- |
| {{name}}   | {{what was seen}} | {{URL}} | {{why doesn't meet §10.3 threshold}} | Yes/No                 |
|            |                   |         |                                      |                        |

---

## 4. Watch list update

(Mirror Constitution §10.3 watch items; mark resolution where applicable.)

| #   | Watch item                                               | Status this quarter                 | Next-quarter focus |
| --- | -------------------------------------------------------- | ----------------------------------- | ------------------ |
| 1   | Mettl AI-augmented content authoring at production scale | {{open / resolved / further-watch}} | {{}}               |
| 2   | HackerRank content-supplier partnership signal           | {{}}                                | {{}}               |
| 3   | Glider AI moving to direct customer overlap              | {{}}                                | {{}}               |
| 4   | Adaface anti-leak rotation below 24h                     | {{}}                                | {{}}               |
| 5   | Karat-multi-product consolidation status                 | {{}}                                | {{}}               |

(Append new watch items as discovered.)

---

## 5. New entrants (if any)

{{Any company not in §2.7 classification that surfaced this quarter as a
potential competitor, partner, or customer. Recommend amendment cycle if
material — Article XI process.}}

---

## 6. Implications for Bali strategy

(Top-3 actions out of this scan that affect Bali outreach for the next quarter.)

1. {{Action 1: e.g., "Pause outreach to {{competitor}} pending material move re-evaluation"}}
2. {{Action 2: e.g., "Accelerate {{competitor}} as TIER 1 → TIER 2 reclassification proposal"}}
3. {{Action 3: e.g., "Stress-test pricing band SO-23 against {{competitor}}'s new pricing"}}

---

## 7. CEO escalations needed

(Any decisions reserved to CEO surfaced by this scan.)

- [ ] {{e.g., "Material move requires Constitutional Amendment cycle for §2.7 update"}}
- [ ] {{e.g., "MANTHAN re-validation triggered — schedule 90-min slot within 48 hours"}}

---

## 8. Filing

- Canonical log entries appended: ✅ / count
- Scan report saved: `bali/scans/YYYY-Qn-competitive-scan.md`
- CEO + CTO notification sent: ✅ / date
- Calendar item set for next quarterly scan: ✅ / date
```

---

## Anti-patterns (don't do these)

- ❌ **Skipping the scan because "nothing has changed."** The scan establishes that nothing has changed — log entry #003 (initial baseline) is exactly this kind of "no-change" finding and is still valuable.
- ❌ **Editing the §2.7 classification table directly.** That's a Constitutional Amendment (Article XI), not a quarterly scan operation. The log captures the live state; the table captures the codified state.
- ❌ **Logging a finding from a single source.** Two independent sources required for any material move (Step 2).
- ❌ **Skipping MANTHAN trigger evaluation.** Even if the answer is "no trigger," the evaluation is the constitutional safeguard.
- ❌ **Dropping the report into Slack/email instead of `bali/scans/`.** Scan reports are part of the audit trail; they live in the repo or the equivalent governance store.

---

## Schedule

| Quarter | Scan date target                    | Next scan  |
| ------- | ----------------------------------- | ---------- |
| Q3 2026 | 2026-08-05 (first Monday of August) | 2026-11-04 |
| Q4 2026 | 2026-11-04                          | 2027-02-03 |
| Q1 2027 | 2027-02-03                          | 2027-05-05 |
| Q2 2027 | 2027-05-05                          | 2027-08-04 |

(Set calendar reminders. The cadence is non-negotiable per SO-25.)

---

_Cross-references: Constitution §10.3 (Competitive Watch protocol), SO-25 (Quarterly scan + acquisition trigger), §2.7 (relationship classification — codified). Bali Playbook §12 (Competitive Watch). Canonical log: `competitive_research_log.md`._
