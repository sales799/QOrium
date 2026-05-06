# SME Contractor Onboarding Protocol

**Owner:** COM (CTO Office Y1) · **Authority:** Constitution SO-1 (Customer Zero), SO-3 (Quality Gate), SO-21 (IRT mandate)
**Source-of-truth onboarding doc:** [`customer-zero/SME-Lead-Onboarding-Day-1.md`](../SME-Lead-Onboarding-Day-1.md)
**Cadence:** Per new SME contractor; quarterly pool review

---

## What an SME contractor does

Subject Matter Experts validate AI-drafted questions in Stage 4 of the 7-stage Content Engine (per `04-QOrium-Blueprint-v1.md` §3.1). Specifically:

1. Receive a batch of AI drafts (typically 10-30 questions per session)
2. For each draft: read carefully; verify technical accuracy; verify difficulty band claim; flag bias / ambiguity / leakage / triviality
3. Either: (a) approve as-is, (b) suggest specific edits, or (c) reject with reason
4. Sign off in the validation tracker (initials + timestamp + verdict per question)

SMEs are PAID per validation pass. They are NOT QOrium employees; they're contracted subject-matter authorities. Y1 pool: ~18 onboarded across general tech, India Stack, and AI-era formats (per Blueprint §3.1).

---

## Onboarding sequence (5 business days)

### Day 0 — Sourcing

COM (or Bali + CTO referral) identifies a candidate SME via:

- Talpro Network alumni (most common — Bhaskar's existing 500-firm network)
- NIT/IIT alumni groups
- Freelance platforms (Toptal, Upwork — last resort; quality variance)
- Direct referral from existing SME

Criteria per Blueprint §3.1:
- 10+ years' deep experience in their domain (Java, Salesforce, AWS, etc.)
- Has hired and/or been on hiring panels (so they understand the assessment context)
- Communication-clear in writing (we work async; not synchronous video)
- Reference-checkable (1-2 prior employers / clients confirm)

### Day 1 — Reach-out + scope alignment

Email or LinkedIn message (template at `customer-zero/SME-Lead-Onboarding-Day-1.md`):

- What QOrium is doing (1 paragraph)
- What we'd ask of the SME (15-20 hours/month flexible; per-validation pay rate ₹500-2000 depending on skill complexity)
- Confidentiality (NDA at engagement start)
- Time commitment expectations (no minimum guaranteed; per-batch availability)

If they're interested → schedule a 30-min intro call (Day 2-3).

### Day 2-3 — Intro call + NDA

Intro call covers:

- Their domain expertise (verify the claim — ask about specific technical concepts)
- Their availability pattern (how many hours/week realistically)
- The validation work itself (walk through 1 sample question; show how validation looks)
- Compensation (rate per validation pass; quarterly review)
- NDA — sent via DocuSign or equivalent; signed before any work starts

### Day 4 — Trial batch

Send a 5-question trial batch:
- Pre-validated by COM (so we know the right answers)
- Mix of "obviously good" + "subtly wrong" + "borderline"
- Asks SME to validate each + write rationale

This is the **calibration check** — does the SME's judgement match what good validation looks like?

### Day 5 — Decision

Based on trial:

- **High alignment** (4-5 of 5 SME judgements match expected) → onboard at full rate
- **Medium alignment** (3 of 5) → second trial batch with targeted feedback; if alignment improves, onboard at probation rate (lower per-validation pay for first 3 batches; full rate after)
- **Low alignment** (<3 of 5) → polite decline; document the gap; reference the Talpro Network for someone else

---

## Active-pool management

After onboarding, ongoing SME relationship:

- **Per-batch assignment:** COM matches batches to SMEs by domain. SME accepts or declines within 24h.
- **Payment:** within 5 business days of validation completion (per `customer-zero/SME-Lead-Onboarding-Day-1.md` commitment)
- **Quality monitoring:** COM samples 10% of each SME's validations; if pattern of bad calls emerges, retrain or off-board
- **Quarterly pool review:** per `cdo/wave-cadence.md` cadence + this protocol's quarterly cycle
- **Off-boarding:** if SME goes inactive >90 days, COM reaches out; if no response or decline, mark inactive in roster; pay any outstanding invoices

---

## Anti-patterns

- ❌ **Onboarding without trial batch.** Calibration check IS the gate. Skipping it = quality regression risk.
- ❌ **Paying late.** SMEs are contractors with options. Late payment = they prioritize other clients. Strict 5-business-day SLA.
- ❌ **Single-domain dependency.** Don't onboard 5 Java SMEs and zero Salesforce — wave roadmap drives pool composition.
- ❌ **Skipping NDA.** Trial batches contain pre-release questions; SME has access to internal calibration data. NDA is non-negotiable.
- ❌ **Over-engineering the onboarding.** A 5-business-day cycle is the right shape. Two weeks of paperwork = SMEs walk away.

---

## Quarterly pool review (every 90 days)

COM compiles for the monthly business review:

- **Active pool count** by domain (target: 2-3 active per active-wave domain)
- **Validations per active SME per month** (target: 20-50, depending on wave intensity)
- **Validation accuracy** (calibration sample ≥85% alignment)
- **Payment SLA hit rate** (target: 100% within 5 business days)
- **Pool churn** (active → inactive in last quarter; new onboarded)
- **Domain coverage gaps** (waves that needed expertise we didn't have in pool)

Findings feed into the next quarter's sourcing plan.

---

## Y1 reality

Per Blueprint §3.1: 18 SMEs onboarded across Wave 1 + Wave 2 (general tech, India-stack, AI-era formats). Wave 3 prep (per `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`) drives the next sourcing cycle.

Active pool composition (M0-M2 actuals):
- Java backend: ~3 SMEs
- Salesforce (Apex + LWC + CPQ): ~3 SMEs
- SAP ABAP: ~2 SMEs
- Embedded / Automotive: ~2 SMEs
- AWS / DevOps / SRE: ~2 SMEs
- React + frontend: ~2 SMEs
- SQL + data: ~2 SMEs
- AIPE (AI/ML platform engineering): ~2 SMEs

Future hiring per Wave 3 plan + Bali Y1 customer signals.

---

*Cross-references: Constitution SO-1 (Customer Zero), SO-3 (Quality Gate). Companion: `customer-zero/SME-Lead-Onboarding-Day-1.md` (canonical doc — this protocol operationalizes), `cdo/wave-cadence.md` (where SMEs slot into the 7-stage pipeline), `cdo/reference-panel-governance.md` (parallel — paid candidates calibrate; SMEs validate; different roles).*
