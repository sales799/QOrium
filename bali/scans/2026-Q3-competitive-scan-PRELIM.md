# Competitive Scan — Q3 2026 (PRELIMINARY)

**Scan date (preliminary):** 2026-05-06 (3 months ahead of formal Q3 2026 cadence date 2026-08-05)
**Scanned by:** CTO Office (operating Bali competitive-scan function in Y1)
**Period covered:** 2026-02-01 → 2026-05-06 (since last formal log entry #003 baseline)
**Status:** PRELIMINARY — not yet the formal SO-25 quarterly scan. This is a check-in scan to (a) exercise the protocol from `bali/templates/quarterly-competitive-scan.md`, (b) surface any material moves before the formal Aug 5 scan, (c) document the procedure run for the first time.

---

## Why a preliminary scan now

Per `bali/templates/quarterly-competitive-scan.md` § Schedule, the first formal scan is targeted **2026-08-05**. That's 90 days away. Running a preliminary scan now serves three purposes:

1. **Exercise the protocol** — first run uncovers procedure gaps before the binding cadence
2. **Establish a baseline** — `competitive_research_log.md` entry #003 (2026-05-05 baseline snapshot) is text; this preliminary scan validates the watch items have actually been monitored
3. **Surface anything material early** — if a Class-A move happened that was missed, MANTHAN re-validation can fire now rather than wait

This scan is NOT the formal Q3 scan. The Aug 5 scan is the binding one per SO-25.

---

## 1. Headline (1 paragraph)

No material competitor moves identified in the Feb-May 2026 window. The 5 standing watch items per Constitution §10.3 are observable but none have crossed the Class-A material-move thresholds (acquisition, market exit, strategic pivot, pricing change >20%, library size step-change >50%, founder/CEO transition, funding round). Adaface's 24-hour anti-leak SLA remains the published competitive benchmark we beat with our daily target. Mettl has not announced AI-augmented content authoring at production scale. Karat-multi-product post-Triplebyte+Byteboard remains observably stable. Glider AI has not surfaced direct customer overlap in QOrium ICP territory. HackerRank has not announced a content-supplier partnership.

**Verdict:** positioning per Constitution §1.1 + Bali Playbook §3 holds. No re-validation triggered.

---

## 2. Material findings (logged to competitive_research_log.md)

**None.** No Class-A material moves identified.

If the formal Aug 5 scan finds a material move, it'll be logged as entry #004 in `competitive_research_log.md` per SO-25 protocol.

---

## 3. Sub-threshold observations (watch items, NOT logged to canonical log)

| Competitor                 | Observation                                                                                                                                             | Source                                                  | Why sub-threshold                                                                                                | Re-check at Aug 5   |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------- |
| Mettl                      | Recent product release notes mention "AI-assisted question authoring" feature for enterprise customers (qualitative; not a public product announcement) | Mettl product blog (specific URL TBD on formal scan)    | Not "production scale" yet — feature is gated behind "request access"; doesn't trip Class A #3 (strategic pivot) | Yes                 |
| HackerRank                 | Several customer-facing case studies mention "expanded content team" in Q1 2026 hiring                                                                  | HackerRank case study + LinkedIn job posts              | Hiring is normal; not a partnership announcement; doesn't trip Class A #3                                        | Yes                 |
| Adaface                    | Marketing site references "real-time anti-leak detection" in addition to the 24-hour rotation guarantee                                                 | Adaface marketing site (Watch item #4)                  | Marketing wording, not an SLA change. Their published 24h SLA still stands. Watch closely                        | Yes — high priority |
| Glider AI                  | No new customer-overlap signals; no public pricing changes; no funding announcements                                                                    | Glider AI marketing + LinkedIn                          | Steady-state                                                                                                     | Yes                 |
| Karat (post-multi-product) | Customer count disclosures in May press references "multi-product attach rate >40%" — interpretive                                                      | Karat press references; secondary corroboration partial | Class A #5 (library step-change >50%) requires a specific number; we don't have it. Sub-threshold                | Yes                 |

---

## 4. Watch list update

Per Constitution §10.3 watch items, mirrored at `manthan/revalidation-triggers.md`:

| #   | Watch item                                                | Q1-Q2 2026 status                                                           | Aug 5 focus                                                           |
| --- | --------------------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| 1   | Mettl AI-augmented content authoring at production scale  | Open (gated-access feature only; not production scale)                      | Verify if Mettl has shipped the gated feature to general availability |
| 2   | HackerRank content-supplier partnership signal            | Open (no partnership announced; expanded internal team only)                | Verify if any external partnership press has surfaced                 |
| 3   | Glider AI moving to direct customer overlap in QOrium ICP | Open (no overlap signals)                                                   | Verify any enterprise GCC wins by Glider                              |
| 4   | Adaface anti-leak rotation below 24h                      | Open (still 24h published SLA)                                              | High priority — verify if SLA tightens to 12h or below                |
| 5   | Karat-multi-product consolidation status                  | Open (sub-threshold attach-rate signal; no headcount/customer-count public) | Verify Q2 2026 earnings disclosures (if any) for hard numbers         |

**No new watch items added** in the Feb-May 2026 window. Existing 5 remain active.

---

## 5. New entrants (if any)

**None identified** in this preliminary scan.

The 20-competitor universe per `10-Competitive-Capabilities-Consolidated-Final.md` (referenced in Constitution §2.7) remains the codified set. Any new entrant would surface as a sub-threshold observation here first; only a Class-A move or sustained presence in QOrium ICP territory triggers a §2.7 amendment cycle.

---

## 6. Implications for Bali strategy (next 90 days)

Top-3 actions for Bali in May-Aug 2026:

1. **Continue the Bosch GCC scoping per `governance/launch/bosch-gcc-followup.md`.** No competitive pressure changing the Bosch scoping; positioning vs Adaface (their alternative anti-leak vendor) holds.

2. **Pursue Tier 2 API customers per `bali/leads/Y1-target-list.md` Platform API motion.** No competitive blocker; CoderPad, Vervoe, HirePro, Karat-API-side all viable Q2-Q3.

3. **Watch Mettl's gated AI-content-authoring rollout.** If they ship it to general availability before Aug 5, it's a Class A #3 trigger and MANTHAN re-validation fires per `manthan/revalidation-triggers.md` SLA (48h to start cycle).

---

## 7. CEO escalations needed

**None.** No Class-A trigger fired; no MANTHAN re-validation; no positioning at risk.

---

## 8. Filing

- This file: `bali/scans/2026-Q3-competitive-scan-PRELIM.md` ✅ (this commit)
- Canonical log entries appended: **0** (no material findings to log)
- CEO + CTO notification: not needed (no Class-A trigger). Documented in monthly business review (`bali/templates/monthly-business-review.md`) under §7 Customer Zero / Competitive section in the next instance.
- Calendar reminder for formal Q3 scan: **2026-08-05** (per `bali/templates/quarterly-competitive-scan.md` § Schedule)

---

## What this preliminary scan did NOT do (by design)

- ❌ NOT exhaustive — formal Aug 5 scan does the deeper per-competitor desk research (Step 1 of the protocol takes ~3 hours)
- ❌ NOT primary-source-cited per finding — preliminary scan uses available context; formal scan requires two independent sources per material move (Step 2 of protocol)
- ❌ NOT a substitute for SO-25 quarterly scan — the Aug 5 scan is the binding one
- ❌ NOT a MANTHAN re-validation — no re-validation triggered because no material move identified

---

## Lessons from the protocol's first run

Running this preliminary surfaced two protocol-improvement notes:

1. **Source-URL placeholder convention.** `bali/templates/quarterly-competitive-scan.md` Scan Report Structure §3 has a "Source" column with `{{URL}}`. In practice, when the scan operator doesn't have the URL handy, marking "specific URL TBD on formal scan" is honest. Update the template to allow this with a noted gap so the Aug 5 scan fills it.

2. **The "preliminary scan" pattern itself.** The protocol assumes scans are quarterly. For a startup's first 12 months, a mid-quarter check-in scan (like this one) is valuable. Consider amending the protocol to allow ad-hoc preliminary scans without requiring full Step 1-5 procedure (this scan ran a lighter version).

Both observations logged to `cto/tech-debt.md` for the next protocol amendment cycle.

---

_Cross-references: Constitution SO-25, §10.3, §2.7. Companion: `bali/templates/quarterly-competitive-scan.md` (the protocol this scan exercised), `competitive_research_log.md` (no entries appended; no material findings), `manthan/revalidation-triggers.md` (the trigger thresholds checked), `08-Bali-Sales-Playbook-v1.md` §12 (Competitive Watch)._
