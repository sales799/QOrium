# MANTHAN — Blueprint Template

**Authority:** Constitution §2.1 (MANTHAN), Article VI (Decision Framework), SO-16 (Documentation as Code)
**Owner:** CTO Office (Y1 MANTHAN operator)

---

## When to write a blueprint

After a research classification (`manthan/classifications/`) reaches `Accepted` status. The classification scored alternatives and recommended a frame; the blueprint operationalizes the recommendation into an executable plan.

A classification without a blueprint is incomplete. A blueprint without a classification skips the audit trail and is forbidden under SO-16.

---

## Template

Save to `manthan/blueprints/YYYY-MM-DD-<short-title>.md` (matching the classification's title).

```markdown
# Blueprint — <one-line title matching classification>

**Date:** YYYY-MM-DD (typically days after the classification it builds on)
**Classification:** [link to manthan/classifications/YYYY-MM-DD-<title>.md]
**Operator:** CTO Office (Y1)
**Status:** Draft | Reviewed by CEO | Accepted | Executed | Superseded by <new blueprint>

---

## 1. Recommendation (one paragraph, ≤120 words)

<The recommended path. Active voice. "We will…" not "We should consider…"
The classification's frame, expanded with the next 5-10 actions in priority order.>

## 2. Decision criteria (when does this blueprint stop being correct)

<List 3-5 conditions that, if met, would invalidate this blueprint and trigger
a new MANTHAN cycle. Examples:

- Competitor X drops their published price below our Y → re-run pricing classification
- Customer Zero (Talpro) hiring volume drops below 30 screens/week sustained 90 days
  → re-run distribution-moat classification
- Series Pre-A close shifts beyond M21 by >3 months → re-run capital-efficiency classification

These triggers feed into manthan/revalidation-triggers.md.>

## 3. Execution plan

### Phase 1 — <name> (Week 1-N)

- Action: <specific>
- Owner: <Office name — CTO / Bali / IdeaForge / etc.>
- Output: <measurable artifact>
- Constitutional anchor: <which SO or Article binds this action>

### Phase 2 — <name> (Week N+1-M)

(Repeat structure.)

### Phase 3 — <name> (Week M+1-end)

(Repeat structure.)

## 4. Resource requirements

| Resource        | Quantity             | Owner      | Source                                        |
| --------------- | -------------------- | ---------- | --------------------------------------------- |
| CTO time        | <hours/week × weeks> | CTO        | Existing capacity                             |
| Bali time       | <if applicable>      | Bali       | Existing capacity                             |
| Capital         | ₹X                   | CEO        | <budget line — Investor Brief §3 if material> |
| External vendor | <if any>             | <function> | <line item>                                   |

## 5. Risks + mitigations (top 3-5 only)

| Risk | Probability  | Impact       | Mitigation | Owner |
| ---- | ------------ | ------------ | ---------- | ----- |
|      | Low/Med/High | Low/Med/High |            |       |

## 6. Success metrics (how we know it worked)

<3-5 metrics with numerical targets. Each metric:

- Has a measurement source (which SLI from cto/sli-slo.md, or new one)
- Has a window (30 days / 90 days / quarterly)
- Has a target (specific number, not "improved")
- Has a fail threshold (when do we declare blueprint failure)>

Example:

- Metric: Stack-Vault Y1 logo count ≥5 (per Bali Playbook §14)
  - Source: Bali pipeline tracker
  - Window: by M12
  - Target: 5 closed-won
  - Fail threshold: <3 → re-run classification under "blueprint failed" status

## 7. Handoffs (downstream Offices)

| Handoff                        | Document                                           | Triggered date |
| ------------------------------ | -------------------------------------------------- | -------------- |
| To IdeaForge (Office 4)        | `manthan/handoffs/YYYY-MM-DD-ideaforge-<title>.md` | <date>         |
| To CTO (Office 3)              | `manthan/handoffs/YYYY-MM-DD-cto-<title>.md`       | <date>         |
| To Bali / TestForge (Office 7) | `manthan/handoffs/YYYY-MM-DD-testforge-<title>.md` | <date>         |

## 8. CEO acceptance

<MANTHAN does not execute. CEO acceptance is required before any handoff
document fires. Acceptance is logged here:>

| Date       | Form                                          | Signed by           | Notes                                                    |
| ---------- | --------------------------------------------- | ------------------- | -------------------------------------------------------- |
| YYYY-MM-DD | <verbal in standup / written / Slack message> | Bhaskar Anand (CEO) | <any conditions or modifications attached to acceptance> |

If acceptance is conditional, list the conditions explicitly. Conditions
that are met before execution proceeds = accepted with stipulations.

## 9. Status log

| Date            | Status                        | Notes                                      |
| --------------- | ----------------------------- | ------------------------------------------ |
| YYYY-MM-DD      | Draft                         | Initial blueprint by CTO Office            |
| YYYY-MM-DD      | Reviewed by CEO               | <comments incorporated, link to revisions> |
| YYYY-MM-DD      | Accepted                      | CEO acceptance logged §8 above             |
| YYYY-MM-DD      | Executed                      | All Phase actions complete; metrics logged |
| (or) YYYY-MM-DD | Superseded by <new blueprint> | <link to new doc>                          |

## 10. Re-validation triggers (mirrored from §2)

<Same triggers as §2 — repeated here for the operating-cadence search.
Bali quarterly competitive scan checks this section automatically.>
```

---

## Anti-patterns (don't do these)

- ❌ **Blueprint without a classification.** SO-16 requires the audit trail. Even if the question is "obvious," the classification stage runs.
- ❌ **Skipping CEO acceptance §8.** MANTHAN doesn't execute. CEO acceptance is the constitutional gate.
- ❌ **Vague success metrics.** "Improved engagement" is not a metric. "Stack-Vault closed-won ≥5 logos by M12" is.
- ❌ **Phases without owners.** Every phase has a single named Office (CTO / Bali / etc.). Plural ownership = no ownership.
- ❌ **Mixing strategy and tactics in one phase.** Phase 1 should be coherent in scope; if it has 12 sub-bullets, it's actually 3 phases.

---

## Worked example (skeleton)

Title: "Y1 Stack-Vault sequencing — Bosch GCC first, BFSI second"

Classification: hypothetical `manthan/classifications/2026-05-06-stack-vault-sequencing.md` (would have scored 3 frames: BFSI-first, GCC-first, parallel).

Recommendation: "We will sequence Stack-Vault Y1 closes as Bosch GCC (Q1) → BFSI major (Q2-Q3) → second GCC (Q3-Q4) → IT services (Q4-Y2). The GCC-first sequence leverages the existing Bosch discovery thread + Talpro Network warm-intro path, both validated in the prior 90 days."

Decision criteria for re-validation:

- Bosch GCC procurement extends past Q2 2026 → re-evaluate sequencing
- A BFSI major surfaces an inbound (warm) request → reorder
- New competitor enters BFSI segment with <₹30L pricing → re-classify pricing-band question first

(The full blueprint would expand each phase. This example is for orientation.)

---

_Cross-references: Constitution §2.1 (MANTHAN), Article VI (Decision Framework), SO-3 (Quality Gate Discipline), SO-16 (Documentation as Code), SO-24 (no-fiction rule), SO-25 (re-validation triggers). Companion: `manthan/research-classification-protocol.md`, `manthan/revalidation-triggers.md`._
