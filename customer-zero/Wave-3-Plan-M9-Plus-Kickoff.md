# Wave 3 Plan — M9+ Content Kickoff

**Status:** v0 strategic plan; opens Wave 3 trajectory per Constitution Article IX M9 Phase Gate. Authored before Wave 2 closeout for forward-planning leverage. Refined when SME Lead in seat (post-CC-11) and quarterly per India-Stack-Roadmap update cadence.
**Authored:** 2026-05-03 (autonomous mode)
**Scope:** Wave 3 = M9-M12 trajectory; AI-era assessment formats + psychometric/aptitude depth + cross-functional collaboration assessment; sets up Phase 3 SKU Maturity (M6-M9) → Phase 4 Year-1 Close (M9-M12).

---

## §1 — Wave 3 thesis

Wave 1 (Tech Core, 8 sub-skills, 320 Qs target by M3) covers what platforms already address — code, data, DevOps, Salesforce, Python, AWS, AIPE.

Wave 2 (India Stack, 5 sub-skills, 600+ Qs target by M6) covers what platforms refuse to invest in — SAP ABAP, Oracle HCM, Salesforce CPQ, Finacle/Flexcube, Embedded Automotive.

**Wave 3** covers what no platform has built: **the assessment formats that hiring leaders actually need but current platforms don't provide.** Three categories:

1. **Psychometric + aptitude (M9 critical per Phase Gate)** — cognitive ability, personality assessment, situational judgement, abstract reasoning. Today licensed from Mettl/SHL/Talogy at $5-15/candidate; QOrium delivers as integrated content.

2. **AI-era assessment formats (Phase 3 differentiator)** — pair-coding with LLM (testing collaboration with AI assistant; emerging hiring need); LLM-prompt-engineering depth (already live as Wave 1 AIPE pack but expand); AI-augmented creative work assessment (write-with-AI; review-with-AI); AI-tool-use judgment (when to use AI vs not).

3. **Cross-functional collaboration (Y2 differentiator)** — group-task simulations; role-play debug sessions; pair-programming with another candidate (or AI); design-review participation; technical-stakeholder communication.

---

## §2 — Wave 3 sub-skills (8 total; 100-200 Qs each by Y2)

| # | Sub-skill | M9 target | Y2 target | Why now |
|---|---|---|---|---|
| 1 | **Psychometric: Cognitive Ability** (numerical, verbal, abstract reasoning) | 100 Qs | 300 Qs | Phase Gate M9 mandate; required for IT services screening |
| 2 | **Psychometric: Personality (Big Five anchored)** | 60 Qs (situational format) | 200 Qs | Bosch-class GCC + IT services use OPQ/Hogan; QOrium offers integrated alternative |
| 3 | **Aptitude: Situational Judgement (SJT)** | 80 Qs | 250 Qs | Modern hiring uses SJT for early-screen; QOrium domain-specific SJT (vs generic) |
| 4 | **AI Pair-Coding Assessment** | 50 Qs | 150 Qs | Emerging 2026 need: assess collaboration with AI assistant (Cursor/Copilot/Claude Code) |
| 5 | **AI Tool-Use Judgement** | 40 Qs | 120 Qs | When-to-use-AI vs not; ethical considerations; quality of LLM outputs |
| 6 | **Technical Communication** | 60 Qs (mostly text-based; some video) | 200 Qs | Senior-level hiring weighs this; rare in current platforms |
| 7 | **Group/Pair-Programming** | 30 Qs (multi-candidate scenarios) | 100 Qs | Stack-Vault Enterprise tier feature |
| 8 | **Design Review Participation** | 30 Qs (review someone else's design) | 100 Qs | Senior+ hiring; stretches into staff-level signal |

**Wave 3 totals:** 450 Qs by M9; 1,420 Qs by Y2. Combined with Waves 1+2: ~1,000 Qs at M3 → ~3,000 by M9 → ~7,000 by Y2 → on-trajectory toward 10K by Y3.

---

## §3 — Authoring strategy per Wave 3 sub-skill

### 3.1 Psychometric content (sub-skills 1, 2, 3)

**Specialist requirement:** I/O Psychologist contractor (per Constitution SO-21; engaged via C5 SOW). Existing SOW covers IRT calibration; Wave 3 adds psychometric content authoring scope.

**Source material discipline:**
- Cognitive ability content: original-authored items inspired by published psychometric literature (Wonderlic, GATB, Raven's APM patterns) but never reproducing copyrighted items
- Personality items: Big Five-anchored situational scenarios authored fresh; not derivatives of Hogan/OPQ/MBTI items
- SJT: domain-specific scenarios drawn from Talpro recruiting + Bosch GCC contexts; original-authored

**IP risk:** psychometric publishers (Pearson, SHL/Talogy) protect their item banks aggressively. QOrium MUST NOT reproduce or paraphrase any item from a published psychometric instrument. Original authoring with I/O Psych contractor + IP counsel review per Constitution Article VII Pillar D Compliance.

**Calibration:** psychometric items require larger calibration N (≥200 per item vs 30 for Wave 1 tech) due to validity demands. Reference Panel scaling: 250 → 500 candidates by M9; 1,000 by Y2.

### 3.2 AI-era formats (sub-skills 4, 5)

**Authoring lead:** SME Content Lead + CTO Office (since AI Prompt Engineering Wave 1 pack already established the pattern).

**Format innovation:**
- Pair-coding: candidate works with an AI assistant (Cursor / Claude Code embedded in the assessment) on a 30-min coding task. Capture: code quality + AI-collaboration signals (when did candidate accept vs reject AI suggestions; did candidate review AI output; did candidate iterate effectively).
- Tool-use judgement: scenarios like "user asks you to do X; would you use AI for it? Why/why not? What's the quality bar?"

**Tooling implication:** Judge0 Sandbox spec already supports Apex sandbox + 12 languages. Pair-coding requires extending the sandbox to embed an LLM client side-by-side with the editor. New scope: extend `qorium-judge0-orchestrator` for AI-pair-coding mode (P2-Y1 milestone).

### 3.3 Cross-functional content (sub-skills 6, 7, 8)

**Authoring lead:** SME Content Lead + Bali (sales motion brings field intel) + I/O Psych contractor (for valid scoring).

**Format innovation:**
- Technical communication: text-based scenarios ("write a one-page technical proposal for X"; rubric scores clarity, structure, anticipation of questions); some video format (45-sec elevator pitch on a technical topic; AI-graded for clarity)
- Group/pair-programming: 2-candidate scenarios where each gets half a problem and they must integrate
- Design review: candidate sees someone else's system design (provided) and writes a critique + improvement suggestion

---

## §4 — Wave 3 timeline

| Month | Activity | Owner |
|---|---|---|
| M3-M6 | Wave 2 in-flight + I/O Psych contractor onboarded; Wave 3 kickoff prep | I/O Psych contractor + CTO + SME Lead |
| M6 | Wave 3 sub-skill 1 (Cognitive Ability) authoring begins (50 Qs target by M7) | I/O Psych contractor + 2 SMEs |
| M7 | Sub-skill 2 (Personality SJT) authoring begins | I/O Psych contractor + 2 SMEs |
| M7-M8 | Pair-coding format prototype on Judge0 sandbox | CTO Office + Senior Eng |
| M8 | Sub-skill 3 (Aptitude SJT) + sub-skill 4 (AI Pair-Coding) authoring | All offices |
| M9 | Phase 3 IdeaForge re-gate: Wave 3 first 350+ Qs ready; psychometric pipeline operational | IdeaForge |
| M10-M12 | Wave 3 scaling per category; cross-functional formats (sub-skills 6, 7, 8) prototyped | All offices |
| Y2 | Wave 3 reaches 1,000+ Qs; Phase 4 Year-1 Close | Constitutional path |

---

## §5 — Wave 3 budget envelope

Wave 3 is more expensive per question than Waves 1-2 due to:
- Psychometric content requires I/O Psych contractor + dual-SME validation
- Format innovations (pair-coding, video) require new infrastructure
- Calibration N≥200 vs N≥30 = 6.7x more candidate exposures per item

Budget estimate (M3-M9; the 6-month Wave 3 ramp):
- Psychometric authoring (~600 Qs across sub-skills 1-3): ₹40L
  - I/O Psych contractor: ₹3L/mo × 6 = ₹18L
  - 6 specialist SMEs (psychometric): ₹15L
  - Reference panel expansion (500 candidates × 3 sessions × ₹2,500): ₹37L (overshoot; rebudget)
- AI-era format authoring (~200 Qs): ₹15L
  - Format infrastructure (extend Judge0): ₹5L
  - SME pay: ₹10L
- Cross-functional (~120 Qs): ₹10L

**Total Wave 3 M3-M9 envelope: ~₹65L**

This is materially larger than Wave 1's ~₹17.5L envelope. Funding path:
- ₹50L Phase 0 envelope already allocated for Wave 1 (Phase 1)
- Wave 2 funding from M3-M6 Phase 2 (assumed Pre-Seed or revenue runway by M6)
- Wave 3 funding from Phase 3 (M6-M9) — likely requires Pre-A round close by M21 OR significant Phase 1 revenue traction

**Strategic decision required:** if Pre-A or revenue traction does not support Wave 3 budget by M6, scale back Wave 3 sub-skills to: (1) Cognitive Ability + AI Pair-Coding only at M9 (defer 6 sub-skills to Y2). This is a Constitution-level decision (per Article IX).

---

## §6 — Risks (5)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| I/O Psych contractor harder to hire than expected | M | HIGH | Engage 2 part-time contractors instead of 1 FT; offer structured retainer per C5 SOW |
| Psychometric publisher cease-and-desist | LOW | HIGH | Original authoring discipline + IP counsel review per item; clear "inspired by but not derivative" stance |
| Pair-coding format rejected by candidates as gimmicky | M | MEDIUM | Pilot with Talpro Customer Zero before external; iterate based on feedback |
| Reference panel scaling slower than 500 by M9 | M | MEDIUM | Calibration cadence stretched; first releases use Bayesian priors not strict N≥200 |
| Wave 3 cost overrun (₹65L estimate vs realised) | M | HIGH | Quarterly J5 review with explicit Wave 3 burn line; defer sub-skills if budget squeezed |

---

## §7 — Cross-Wave dependencies

- Wave 3 sub-skill 4 (AI Pair-Coding) depends on Judge0 sandbox v1 (Phase 2) + LLM client integration (NEW infrastructure)
- Wave 3 sub-skill 6 (Technical Communication) needs video infrastructure (transcription + AI grading) — Phase 3 stretch
- Wave 3 calibration (N≥200) requires Reference Panel at 500-candidate scale → recruit + retain ramp begins M3
- Wave 3 marketing positioning: "the only assessment platform with AI-collaboration coverage" — soft launch alongside Wave 1+2 at M3 to set the narrative

---

## §8 — Constitutional integration

- **Locked clauses preserved:** §1.2 SKU identity (ReadyBank/JD-Forge/Stack-Vault); Wave 3 content surfaces in all 3 SKUs (Wave 3 questions can be ReadyBank-shared OR JD-Forge-generated OR Stack-Vault-exclusive)
- **Phase Gate M9 alignment:** Wave 3 first 350+ Qs ready by M9 (per Constitution Article IX M9 milestone "psychometric LICENSED — Mettl/3rd-party — don't rebuild" — this Wave 3 plan SUPERSEDES that with native psychometric authoring; constitutional amendment required if approved)
- **Constitutional amendment proposed:** "Article IX M9 — psychometric LICENSED" → "psychometric NATIVELY AUTHORED via Wave 3 sub-skills 1-3, with I/O Psych contractor leading + SME Content Lead support." This amendment requires founder + Board approval per Article XI.

---

## §9 — Open questions for Constitutional review

1. Should Wave 3 psychometric content be authored fresh (this plan) or licensed from Mettl/SHL (current Constitution Article IX M9)? Authoring is more capital-intensive but creates differentiation; licensing is faster but locks dependence on competitor pricing.
2. Is the Y2 1,000-Q target per sub-skill realistic at the calibration N≥200 demand?
3. Should AI Pair-Coding be a Wave 3 first-release sub-skill (M9) or Wave 4 (Y2)?
4. Reference Panel ethics: pair-coding scenarios with AI assistant — what's the candidate-data privacy posture? A7 DPA addendum needed.
5. Wave 3 budget ₹65L — within Pre-Seed envelope or requires Pre-A close first?

---

## §10 — Acceptance + sign-off

- IdeaForge re-gate at M3 should include Wave 3 plan as part of evidence
- Constitutional amendment for Article IX M9 (if approved) requires founder + Board sign per Article XI
- Wave 3 first sub-skill content release requires SME Lead + I/O Psych contractor + Gatekeeper joint sign per Quality Gate scorecard

---

## §11 — References

- Constitution v2.0 Article IX (Phase Gates) — `09-QOrium-Constitution-v2.0.md`
- India-Stack Content Roadmap M3-M6 — `customer-zero/India-Stack-Content-Roadmap-M3-M6.md`
- Wave 1 Question Batch Plan — `customer-zero/Wave-1-Question-Batch-Plan.md`
- I/O Psychologist contractor SOW — `jds/C5-IO-Psychologist-Contractor-SOW.md`
- Reference Panel governance — `customer-zero/Reference-Panel-Governance-v0.md`
- Bias Detection Methodology v1 — `governance/Bias-Detection-Methodology-v1.md`
- Quality Gate scorecard — `governance/Quality-Gate-92pt-Scorecard.md`

---

*End of Wave 3 plan v0. Refined when I/O Psych contractor in seat (M3) + when Pre-A round trajectory is clearer (M6+). Constitutional amendment proposal authored separately if pursued.*
