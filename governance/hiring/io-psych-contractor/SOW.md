# Statement of Work — I/O Psychologist Contractor

**Effective Date:** [TO BE FILLED ON SIGNING]
**Term:** 6 months from Effective Date, renewable in 6-month increments
**Engagement Type:** Independent contractor (not employee)
**Estimated Effort:** 10–15 hours per week, asynchronous, output-based
**Governing Law:** [Maharashtra, India] / [or contractor's jurisdiction by mutual agreement]

This Statement of Work ("SOW") is between **QOrium Technologies Pvt
Ltd** ("QOrium," "Client") and **[Contractor Full Legal Name]**
("Contractor"). The SOW defines scope, deliverables, payment, IP,
confidentiality, and termination for an industrial-organizational
psychology consulting engagement.

---

## 1. Background

QOrium operates ReadyBank, an IRT-calibrated, anti-leak-rotated
question library for technical hiring. Wave-3 (Psychometric)
introduces aptitude, personality, and situational-judgement items
into the library. Per QOrium Constitution Article IX M9 phase-gate
and CTO Constitution SO-21, no Wave-3 question reaches a live
candidate without credentialed I/O psychology signoff.

This SOW engages Contractor to provide that signoff and the
methodological scaffolding around it.

## 2. Contractor Qualifications

Contractor warrants and represents that they hold:

- A doctoral-level degree (Ph.D. or PsyD) in Industrial-Organizational
  Psychology, or a master's degree (M.A./M.S./M.Phil.) plus ≥7 years
  applied practice
- Demonstrated experience with item-response theory (IRT) calibration,
  classical test theory, or modern psychometrics
- Demonstrated experience with high-stakes assessment validation
  (employment testing, certification, or licensure)
- Ability to commit 10–15 hours per week consistently across the term
- No conflict of interest with QOrium competitors (TalentPrep, Mettl,
  HireVue, Codility — see §6 Conflicts)

## 3. Scope of Work

Contractor will provide the following professional services:

### 3.1 Methodology review

- Review and approve QOrium's Wave-3 Authoring Template (currently
  v0.1, Run #36)
- Review and approve the Bias-Detection Methodology
  (`governance/Bias-Detection-Methodology-v1.md`)
- Review and approve the AI-Plagiarism Benchmark Protocol
  (`governance/AI-Plagiarism-Benchmark-Protocol-v1.md`) for
  psychometric content
- Co-author the Reference Panel Governance Charter — cohort balance,
  recruitment ethics, compensation, response validity checks

### 3.2 Calibration signoff

- Review IRT calibration outputs from `@qorium/irt` (2PL/3PL
  Birnbaum + JMLE) once Reference Panel ≥200 responses arrive
- Validate location/scale anchor (mean-0/sd-1) against industry norms
- Sign off on Mantel-Haenszel DIF (Differential Item Functioning)
  reports; recommend item revisions/retirements where DIF flags fire
- Approve the SO-21 quality gate threshold for production release

### 3.3 Wave-3 question batch signoff

- Per-batch review of authored Wave-3 items (200 target; first batch
  20 items in v0.1)
- Approve, request revision, or reject items based on construct
  validity, face validity, and bias considerations
- Provide written feedback in QOrium's existing SME queue
  (`/v1/admin/sme-queue`)

### 3.4 Customer-facing artefacts

- Co-author a public-facing methodology white paper (≤4000 words) for
  inclusion in QOrium's investor + customer materials
- Provide a co-signed validation summary suitable for Trust pages
  (no PII, no per-candidate data)

### 3.5 Out of scope

- Software engineering, code review, or DevOps work
- Direct customer support or pre-sales calls
- Recruitment of the Reference Panel itself (CDO Office runs that;
  contractor advises on charter)
- Marketing copy authorship beyond the white paper

## 4. Deliverables

See `deliverable-schedule.md` for the 6-month milestone-by-milestone
schedule. Headline deliverables:

| # | Deliverable | Due | Payment trigger |
|---|---|---|---|
| D1 | Methodology review signoff (templates + bias + plagiarism docs) | Month 1 | Milestone 1 |
| D2 | Reference Panel Governance Charter (co-authored) | Month 2 | Milestone 2 |
| D3 | First Wave-3 batch signoff (20 items) | Month 2 | Milestone 2 |
| D4 | IRT calibration first-cycle signoff | Month 4 (or +1 month after Panel ≥200) | Milestone 3 |
| D5 | Bias-Detection report co-sign | Month 5 | Milestone 4 |
| D6 | Public methodology white paper | Month 6 | Milestone 5 |

Each deliverable is reviewed by CTO Office within 5 business days of
submission. Acceptance is recorded in writing (email + commit message
referencing this SOW). Payment is released within 7 business days of
acceptance.

## 5. Compensation

Total compensation: **₹[18,00,000] / $[28,000]** for the 6-month term,
paid in 5 milestone-tied tranches:

| Milestone | Amount | Trigger |
|---|---|---|
| M1 | 25% | D1 accepted |
| M2 | 20% | D2 + D3 accepted |
| M3 | 25% | D4 accepted |
| M4 | 15% | D5 accepted |
| M5 | 15% | D6 accepted |

A signing bonus of [10%] is paid within 5 business days of SOW
execution; this is **deductible** from M5 if the engagement is
terminated for cause before D6.

Out-of-pocket expenses (travel, software licences) are **not**
included; pre-approved expenses are reimbursed at cost within 14 days
of receipt submission. Cap: ₹50,000 / $700 per month without explicit
CEO approval.

Currency follows the contractor's tax residence; cross-border GST/VAT
is handled per the relevant tax authority. QOrium will issue Form 16A
(India) or 1099-NEC (US) at term close.

## 6. Conflicts of Interest

Contractor warrants that during the term they will not:

- Provide consulting services to direct QOrium competitors (defined
  as: TalentPrep, Mettl/Mercer, HireVue, Codility, HackerRank,
  Manageteach, Wheebox, AspiringMinds/SHL — and any successor
  entities)
- Take a role on the academic editorial board reviewing QOrium's
  white paper
- Endorse a competitor's psychometric methodology in writing during
  the term

Adjacent consulting (general HR-tech advisory, university teaching,
non-competitive psychometric work) is permitted and encouraged.

## 7. Intellectual Property

- All work product authored under this SOW is **work-for-hire** owned
  by QOrium. This includes signoff memos, charter drafts, batch
  reviews, white-paper prose.
- The published white paper carries Contractor's name as co-author
  with QOrium's CTO Office; Contractor retains personal academic
  citation rights but cannot republish in conflict with §6.
- Contractor's pre-existing methodology, frameworks, and tools remain
  Contractor's property; usage during the term grants QOrium a
  perpetual non-exclusive licence for internal use.
- Open-source academic citations and standard-of-the-field
  methodology (Birnbaum 1968, Mantel-Haenszel 1959, etc.) are not
  proprietary to either party.

## 8. Confidentiality

Contractor agrees to:

- Treat all QOrium content (Wave-1 / Wave-2 / Wave-3 questions, IRT
  calibration outputs, panel data, customer identities) as
  Confidential Information
- Not disclose Confidential Information to any third party for 5
  years following SOW termination
- Not retain copies of Wave-1/2/3 questions or panel responses beyond
  the engagement (delete within 30 days of term end; certify in
  writing)
- Use a QOrium-issued laptop or VPN-tunnelled environment for all
  question access (CTO Office provides; cred-bound on cred-drop)

QOrium agrees to:

- Treat Contractor's pre-existing methodology + draft notes as
  reciprocally Confidential
- Not use Contractor's name or likeness in marketing without explicit
  per-instance written approval (the white paper is the one
  pre-approved exception)

Both parties: a separate NDA may be appended; this §8 governs by
default.

## 9. Anti-leak Discipline (specific to QOrium)

Per Constitution SO-9, Contractor:

- Will not screenshot, paste, copy, or redistribute Wave-1/2/3
  questions to any LLM, search tool, or third party
- Understands that QOrium runs continuous anti-leak scanning
  (`services/anti-leak`) and that confirmed leaks attributed to
  Contractor are grounds for immediate termination + return of all
  prior payment
- Will report suspected leaks (e.g., a question appearing on a public
  prep site) within 24 hours of becoming aware

## 10. Termination

- **For convenience (either party):** 30 days written notice. Pro-rata
  payment for delivered work; signing bonus retention per §5.
- **For cause (QOrium):** Immediate, on documented breach of §6
  (Conflicts), §8 (Confidentiality), §9 (Anti-leak), or material
  failure to deliver on schedule beyond 14-day cure period. No
  further payment; signing bonus refundable.
- **For cause (Contractor):** 14 days written notice + opportunity to
  cure if QOrium materially breaches payment obligations beyond 14
  days past the §4 schedule.

On termination, both parties trigger §8 (5-year confidentiality tail)
and §11 (Convert-to-FTE rights) ceases.

## 11. Convert-to-FTE Option

At any point during the term, with mutual written agreement, the
parties may convert this engagement to a full-time employment
relationship under separate agreement. Standard terms:

- Base salary band aligned to senior-IC + offer letter via standard
  HR process
- ESOP grant per QOrium's Year-1 senior-IC ladder
- Pro-rata payment under this SOW closes; new agreement governs
  forward

This clause does not obligate either party to convert; it merely
preserves the option without renegotiation friction.

## 12. Indemnity & Liability

- Each party indemnifies the other against third-party claims arising
  from its own negligence or breach.
- Liability under this SOW is capped at the total fees paid or
  payable, except for breaches of §6, §8, or §9 (Conflicts /
  Confidentiality / Anti-leak), which are uncapped.

## 13. Dispute Resolution

- First step: good-faith negotiation between CEO and Contractor (14
  days)
- Second step: single-arbitrator binding arbitration under [Indian
  Arbitration & Conciliation Act 1996, seated in Mumbai] /
  [contractor's local equivalent if outside India]
- Costs: split equally unless arbitrator awards otherwise

## 14. Miscellaneous

- This SOW is the entire agreement; supersedes any prior
  understandings.
- Amendments must be in writing and signed by both parties.
- If any provision is found unenforceable, the remainder survives.
- Notices: email to **[ceo@qorium.online]** (QOrium) / Contractor's
  primary email of record.

---

**Signed:**

**For QOrium Technologies Pvt Ltd**

Name: ___________________________
Title: CEO
Date: ___________________________

Co-sponsor: ___________________________
Title: CTO
Date: ___________________________

**Contractor**

Name: ___________________________
Date: ___________________________

---

_Pack location: `governance/hiring/io-psych-contractor/`_
_This SOW is a draft template. CEO + counsel review required before sending to a live candidate._
