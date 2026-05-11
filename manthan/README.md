# MANTHAN — Research & Blueprint Engine Operating Folder

**Office:** MANTHAN · Office 1 of 7 (Constitution §2.1)
**Y1 reality:** CTO Office operates the engine; CEO acceptance gate per Constitution §2 introduction
**Source-of-truth doc:** Constitution §2.1 + `governance/Decision-Framework-Reusable-Template-v1.md`
**Constitutional authority:** §2.1 + SO-3 (Quality Gate), SO-25 (Quarterly competitive scan + acquisition trigger), §10.3 (Competitive Watch protocol)

---

## Charter (verbatim from Constitution §2.1)

MANTHAN is QOrium's **research and blueprint engine**. It runs the structured-deliberation framework that converts open questions ("Should we ship Stack-Vault first or ReadyBank first?", "Is the API pricing band $5K-25K still right?") into ratified decisions with an explicit audit trail.

MANTHAN does NOT execute on its own recommendations. Execution belongs to CTO, Bali, etc. MANTHAN's deliverables are:

1. **Research classifications** — structured analyses of an open question against multiple frames
2. **Blueprints** — strategic options + recommended path, with decision criteria
3. **Re-validation triggers** — automatic re-runs of prior MANTHAN work when triggering events occur (per SO-25)

MANTHAN may produce three handoff views (per Constitution §1):

- `handoff-ideaforge.md` — for IdeaForge gate scoring
- `handoff-cto.md` — for CTO architecture work
- `handoff-testforge.md` — for Bali sales readiness

---

## What this folder contains

```
manthan/
├── README.md                                ← you are here
├── research-classification-protocol.md      ← how MANTHAN classifies open questions
├── blueprint-template.md                    ← canonical template for MANTHAN deliverables
├── ideaforge-rubric.md                      ← Office 4 gate-scoring (bundled in CTO Y1)
├── revalidation-triggers.md                 ← SO-25 mechanics: when does MANTHAN re-run
└── handoffs/
    ├── handoff-ideaforge-template.md        ← used after MANTHAN → IdeaForge passage
    ├── handoff-cto-template.md              ← used after MANTHAN → CTO passage
    └── handoff-testforge-template.md        ← used after MANTHAN → Bali (sales testforge)
```

---

## When MANTHAN runs

Three triggers:

1. **Open question of strategic weight** — CEO or CTO surfaces a question that affects pricing, ICP, positioning, SKU sequencing, or a decision >₹3L cost (Constitution Article VI threshold).
2. **SO-25 competitive material move** — any acquisition / market exit / strategic pivot in the §2.7 classification table triggers MANTHAN re-validation of any positioning that depended on the changed competitive state. Live precedents: WeCP → Invisible Technologies (Mar 2026), Byteboard → Karat (Jan 2025).
3. **Quarterly cadence** — at each quarterly competitive scan (next: 2026-08-05), MANTHAN reviews whether any of the standing watch items in `competitive_research_log.md` §10.3 have moved to material status.

---

## When MANTHAN does NOT run

- Tactical questions with cost <₹3L AND no strategic implication → Bali / CTO decide directly
- Bug fixes, naming, code style → not MANTHAN's surface
- Customer-by-customer pricing within the published band → Bali's authority per §2.7
- Anything reserved to CEO per Constitution §2.2 (capital allocation, hiring, external partnerships) → CEO decides; MANTHAN may inform but does not deliberate

---

## MANTHAN cadence (where this folder fits in)

| Cadence                                | Activity                                                                                                              | Owner                                       | Folder reference                                                |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- | --------------------------------------------------------------- |
| **Ad-hoc** (on open question surfaced) | Run a research-classification + blueprint cycle                                                                       | CTO Office (Y1 — operates the engine)       | `research-classification-protocol.md` + `blueprint-template.md` |
| **On SO-25 trigger**                   | Re-validate prior positioning                                                                                         | CTO Office                                  | `revalidation-triggers.md`                                      |
| **Quarterly**                          | Review watch items + decide if material                                                                               | Bali (scan) → CTO (MANTHAN ops if material) | `bali/templates/quarterly-competitive-scan.md` + this folder    |
| **Per-amendment cycle**                | When Constitution v2.0 → v2.1, MANTHAN reviews whether new SOs require re-validation of any prior MANTHAN deliverable | CTO Office                                  | `revalidation-triggers.md`                                      |

---

## Constitutional discipline (the rules MANTHAN follows)

| SO        | Subject                              | How it binds MANTHAN                                                                                                                             |
| --------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **SO-3**  | Quality Gate Discipline              | Every MANTHAN blueprint is scored against the 92-point Quality Gate (`governance/Quality-Gate-92pt-Scorecard.md`); ≥3.5 weighted score = APPROVE |
| **SO-16** | Documentation as Code                | Every MANTHAN deliverable is committed to this folder; ad-hoc memos forbidden                                                                    |
| **SO-24** | Recursive No-Fiction Rule            | MANTHAN never invents data or claims; every input must source to an existing doc / commit / public reference                                     |
| **SO-25** | Quarterly Scan + Acquisition Trigger | MANTHAN re-validation is automatic on material competitor moves                                                                                  |

---

## Output — what a MANTHAN cycle produces

A typical MANTHAN cycle produces 1-3 documents:

1. **Research classification** (always) — scores the open question against the 5 priorities of the Decision Framework (Constitution Article VI): Customer Zero proof · Strategic moat · Capital efficiency · Founder fit · Distribution leverage. Weighted score ≥3.5 = APPROVE.

2. **Blueprint** (often) — recommended path with explicit decision criteria. Filed as `manthan/blueprints/YYYY-MM-DD-<short-title>.md`.

3. **Handoff** (sometimes) — when the blueprint requires execution, MANTHAN produces a handoff document for the executing Office (CTO / Bali / IdeaForge). Filed as `manthan/handoffs/YYYY-MM-DD-<office>-<title>.md`.

---

## Y1 reality

Per Constitution §2 introduction, in Year 1 the CTO Office wears the MANTHAN hat. This folder addresses the operating mechanics; the actual MANTHAN cycles run by the CTO with CEO acceptance gate.

By Year 2, MANTHAN may have a dedicated operator (per CTO Architecture §15 hiring plan). This folder remains constant; only the named person operating it changes.

---

## What's NOT here yet

- ❌ Live MANTHAN cycle outputs — none have run since this folder was created (2026-05-06). First cycle expected at quarterly scan (2026-08-05) IF anything is material; otherwise next material question surfaced.
- ❌ Library of past MANTHAN cycles — when WeCP/Byteboard acquisitions triggered re-validation, that work was absorbed into the Constitution v2.0 ratification (Constitution §10.3 + Changelog). Going forward, all MANTHAN cycles get their own dated file in `manthan/blueprints/`.
- ❌ Decision Framework template files — currently lives at `governance/Decision-Framework-Reusable-Template-v1.md`. May get extracted into this folder if MANTHAN cycles surface enough variants.

---

## Cross-reference map

| Topic                                                 | Lives at                                                                          |
| ----------------------------------------------------- | --------------------------------------------------------------------------------- |
| **MANTHAN charter**                                   | Constitution §2.1                                                                 |
| **Decision Framework**                                | Constitution Article VI + `governance/Decision-Framework-Reusable-Template-v1.md` |
| **Quality Gate scoring**                              | `governance/Quality-Gate-92pt-Scorecard.md`                                       |
| **Competitive watch**                                 | `competitive_research_log.md` (Bali-owned, MANTHAN-consumed)                      |
| **Quarterly competitive scan**                        | `bali/templates/quarterly-competitive-scan.md`                                    |
| **CTO Architecture (downstream consumer of MANTHAN)** | `07-CTO-Architecture-v1.md`                                                       |
| **Bali Sales Playbook (downstream consumer)**         | `08-Bali-Sales-Playbook-v1.md`                                                    |
| **MANTHAN re-validation triggers**                    | `manthan/revalidation-triggers.md` (this folder)                                  |

---

_Maintained by CTO Office (operating the MANTHAN hat in Y1). Authority: Constitution §2.1._
