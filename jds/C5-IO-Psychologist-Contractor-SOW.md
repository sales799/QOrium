# I/O Psychologist — Validation Lead (Contractor SOW)

**Role Level:** Specialist / Senior (M.A. or PhD in I/O Psychology, assessment design, or educational psychology)
**Location Preference:** Bengaluru preferred; Remote-India (IST) acceptable
**Engagement Basis:** Project-based + retainer (Month 4–12, renewable)
**Reports to:** Chief Data Officer (CDO, Talpro Universe)
**Start Date:** Month 4, 2026

---

## About QOrium

QOrium is the world's first enterprise-grade Question-Bank-as-a-Service for the hiring assessment industry. We supply fresh, validated, anti-leak-rotated questions to assessment platforms, enterprises, and staffing firms. Every question is authored by AI (Claude Opus 4.6), reviewed by a human SME, and then **psychometrically calibrated via Item Response Theory (IRT)** on a paid candidate reference panel. This IRT calibration is what allows us to defend our content to HR buyers: "This question has been administered to 50+ candidates, and we can show you empirically whether it's easy or hard, whether it separates strong from weak candidates."

You are the keeper of that rigor. You own QOrium's psychometric defensibility.

---

## The Opportunity

By Month 12, QOrium will have released 40,000+ questions across 4 waves (Tech Core, India Stack, Domain/Aptitude, AI-Era formats). Each released question needs IRT calibration. You'll:

1. **Design the Reference Panel methodology** — Who are our calibration candidates? (college coding club members, TopCoder competitors, recent graduates). How many per question? (target: 50–100 for statistical significance). Compensation structure? (₹50–200 per attempted question).

2. **Implement 3PL IRT model** — Three-parameter logistic model (difficulty b, discrimination a, guessing c). Document the model, set acceptance thresholds (e.g., discrimination < 0.3 = poor item, flag for review). Hand this off to the data team for monthly reporting.

3. **Govern Reference Panel** — Onboard and manage 200–1,000 paid candidates by Year 1. Keep them engaged. Monitor for cheating (same answers, suspicious patterns). Protect question confidentiality (NDA, secure platform, limited question copies).

4. **Anti-leak forensics support** — When a question leaks externally, help forensically determine: Is the leaked version actually the same question? Did it leak from our Reference Panel, or from a customer? How severe is the leak (verbatim copy vs semantic rephrasing)? Help execute remediation (question rotation, replacement, customer communication).

5. **AI plagiarism benchmark validation** — Per Standing Order #22 of the QOrium Constitution, QOrium must publish a public figure for "AI plagiarism detection accuracy" before shipping to enterprise customers. You'll validate that we can detect with ≥93% accuracy when a question (or distractor) was AI-generated vs human-written. Benchmark against HackerRank's published 93% standard.

6. **Quarterly psychometric reviews** — Monthly IRT calibration reports (which questions are poor signal, which are validly hard/easy). Quarterly strategic review: Are we seeing drift in candidate pools? Are our item parameters stable over time? Any hidden biases emerging?

---

## Scope of Work (Months 4–12)

### Phase 1 — Design & Setup (Month 4, 2 weeks)

- **Reference Panel Charter:** Document candidate sourcing criteria, compensation, NDA, security controls, cheating detection.
- **3PL IRT Model:** Choose software (Winsteps, RUMM, ConQuest, or R-package like ltm). Define acceptance criteria per question type (e.g., MCQ discrimination > 0.4, coding discrimination > 0.5).
- **Bias audit framework:** Develop rubrics for detecting gender/nationality/socioeconomic bias in questions post-calibration.

**Deliverable:** 10-page Panel Charter + 5-page IRT Methodology Document + Bias Audit Template.

### Phase 2 — Reference Panel Launch & Initial Calibration (Months 5–6, 6 weeks)

- **Candidate sourcing:** Recruit 50–100 reference candidates via TopCoder, college clubs, alumni networks, Talpro candidate pool. Vet experience levels. Establish a tiered payment schedule.
- **Pilot calibration:** Run first 500 questions through the Reference Panel (50–100 candidates per question). Collect response data. Compute IRT parameters.
- **Validation report:** Summarize findings. Identify poor-signal items. Compare to SME quality expectations. Refine thresholds based on early data.

**Deliverable:** Pilot Calibration Report (500 questions, IRT parameters, quality flagged items).

### Phase 3 — Scaled Operations (Months 7–9, 12 weeks)

- **Reference Panel scaling:** Grow to 300–500 active candidates. Manage attrition, engagement, payment.
- **Batch calibration:** Run Wave 2 + Wave 3 questions through the panel (4,000–6,000 new questions). Monthly IRT reports. Identify systematic issues (e.g., all SAP questions too hard, all SJT questions too easy).
- **Bias auditing:** Sample-audit 10% of released questions for gender/regional/SES bias. Flag questions for revision if needed.
- **Anti-leak collaboration:** Support 1–2 leak incidents (forensic analysis, recommendation for rotation vs dismissal).

**Deliverables:** Monthly IRT reports (Wave 2, Wave 3), Bias Audit Report, Leak Forensics Documentation.

### Phase 4 — AI Plagiarism Benchmark & Enterprise Defensibility (Months 8–10, 4 weeks)

- **Benchmark design:** Design an experiment: generate 100 AI questions (Claude Opus) + 100 human-authored questions (from our SME pool). Train a classifier (logistic regression, SVM, or LLM-as-judge) to distinguish. Report accuracy on a held-out test set.
- **Public figure validation:** Compare our accuracy to HackerRank's published 93% standard. Develop marketing language: "QOrium detects AI-generated content with 93%+ accuracy."
- **Enterprise-ready report:** Produce a 1-page summary suitable for enterprise sales (TA heads, CHROs). Include methodology, benchmark results, caveats.

**Deliverable:** AI Plagiarism Benchmark Report + 1-page Enterprise Summary.

### Phase 5 — Quarterly Strategic Review & Transition Planning (Months 9–12, 4 weeks)

- **Q3 psychometric review:** Full report on calibration data to date (10,000+ questions). Item parameter stability. Candidate pool drift. Bias findings.
- **Transition planning:** Document the end-state Reference Panel process and IRT workflow so it can be handed to a full-time I/O Psych hire (Month 9 target). Write runbooks.
- **Year 2 roadmap:** Recommend next steps (advanced psychometric models like DIF analysis, cognitive bias detection, adaptive testing calibration).

**Deliverable:** Q3 Strategic Review (20 pages), Runbook for Reference Panel Operations, Year 2 Roadmap.

---

## Expected Deliverables (Monthly)

1. **IRT Calibration Report** (monthly, starting Month 5): Item parameters (b, a, c) for all newly released questions. Quality flags. Bias audit updates.
2. **Reference Panel Status Report** (monthly): Candidate pool size, attrition, compensation paid, engagement metrics, cheating flags.
3. **Leak Forensics Documentation** (as-needed): Analysis of any leaked questions. Attribution confidence. Remediation recommendation.
4. **Quarterly Strategic Review** (Q3, Q4): Aggregate findings. Recommendations for content team. Bias/validity concerns.

---

## Commercial Terms

### Engagement Structure

- **Months 4–6 (Phase 1–2):** Retainer + project deliverables. ₹1.5L–₹2L/month retainer + ₹50K per major deliverable (Panel Charter, IRT Methodology, Pilot Calibration Report).
- **Months 7–9 (Phase 3–4):** ₹1.5L–₹2.5L/month retainer + performance bonus for Reference Panel scale targets (₹25K per 100 candidates onboarded, capped at ₹75K/month).
- **Months 10–12 (Phase 5 + transition):** ₹2L–₹3L/month retainer as transition to potential full-time offer.

### Calibration-Per-Batch Pricing

In addition to monthly retainer, QOrium pays per question calibrated:
- **MCQ / MSQ:** ₹50–₹100 per question calibrated (if outsourced to reference panel)
- **Coding questions:** ₹200–₹500 per question calibrated (more complex, longer execution time)

This scales with question volume. **Blended expectation:** ₹10K–₹15K/month in per-batch fees by Months 7–9 (500–1,000 questions/month × mixed rates).

### Total Compensation (Months 4–12)

- **Monthly retainer:** ₹1.5L–₹3L/month (scaling with responsibility)
- **Per-batch calibration:** ₹10K–₹20K/month (average)
- **Year 1 total estimate:** ₹20L–₹30L (retainer + batch fees + bonus)

**Currency note:** All INR. Payments monthly via Razorpay or bank transfer. Invoice-based.

### Transition to Full-Time (Month 9+)

If performance is strong, QOrium will offer full-time conversion at Month 9:
- **Full-time title:** Validation Lead / Chief Psychometrician
- **Anticipated base:** ₹25L–₹35L/year (competitive with Talpro Universe standards)
- **Equity:** Stock options (ESOP) or restricted stock
- **Start date:** Month 9 or Month 1 of Year 2

The retainer + batch fees are credited toward the full-time base (if converted). No clawback.

---

## Confidentiality & IP Assignment

### Confidentiality

All question content, candidate data, IRT models, and Reference Panel information are strictly confidential. You'll sign:
- **NDA:** 3-year confidentiality post-engagement
- **Non-compete:** Cannot work on competing question-bank ventures during engagement + 1 year after
- **Non-solicitation:** Cannot recruit Talpro/QOrium employees during engagement + 6 months after

### IP Assignment

All work product created during this engagement is owned by QOrium Pvt. Ltd.:
- IRT methodology documents
- Reference Panel charter and procedures
- Calibration reports and item-parameter files
- AI plagiarism benchmark models and results

You retain the right to publish peer-reviewed research using anonymized, aggregated data (with QOrium CEO approval). You may list "QOrium Validation Lead" on your CV / LinkedIn after engagement ends.

---

## Timeline & Milestones

| Month | Phase | Key Milestones | Deliverables |
|---|---|---|---|
| **4** | Design & Setup | Panel Charter drafted; IRT model chosen; bias framework defined | Charter doc, IRT Methodology, Audit Template |
| **5** | Panel Launch | First 50–100 candidates onboarded; 500 questions start reference testing | Pilot report (500 questions) |
| **6** | Scaled Ops | 100–150 candidates active; 1,000 questions calibrated | Monthly IRT report, Panel status |
| **7** | Scaled Ops | 200 candidates; Wave 2 questions begin calibration | IRT report, Bias audit (Wave 1) |
| **8** | AI Plagiarism Benchmark | Benchmark design complete; pilot classification model trained | Benchmark report, Enterprise summary |
| **9** | Strategic Review + Transition | 300–500 candidates; 4,000+ questions calibrated; Q3 review ready | Q3 Strategic Review, Runbook |
| **10** | Year 2 Planning | Recommend advanced methods; finalize runbooks; transition plan | Year 2 Roadmap |
| **11–12** | Ongoing Support | Reference Panel maintained; monthly reports; FT offer decision | Monthly reports, Transition docs |

---

## Success Criteria

By end of Month 12:

1. **Reference Panel operational:** 500+ active candidates, <15% monthly attrition, 98%+ data quality (no cheating detected).
2. **IRT calibration live:** 40,000+ questions with stable item parameters. Discrimination > 0.3 for 95%+ of items (<5% flagged for review).
3. **AI plagiarism accuracy published:** ≥93% (matching HackerRank standard). Published in enterprise sales materials.
4. **Bias audit complete:** <5% of released questions with detectable gender/regional/SES bias.
5. **Anti-leak support:** 2–3 leak incidents forensically analyzed and resolved.
6. **Runbook complete:** Another psychometrician could hand off QOrium's IRT process in 2 weeks.

---

## How to Apply

Send the following to **cdo@qorium.online** + share on **LinkedIn** (mention QOrium + "C5 I/O Psychologist"):

1. **1-paragraph cover note:** Your background in I/O psychology / assessment design. Why you're excited about QOrium's mission. One methodological choice you'd make (e.g., 2PL vs 3PL model, candidate sourcing strategy).

2. **CV/Resume:** Education (M.A. / PhD, institution, year). Prior assessment-design work (platforms, publications, companies). Any IRT or psychometric experience.

3. **Research sample or reference:** Link to a published paper, thesis, or previous assessment project you can discuss. (Optional but valued.)

**Response time:** We'll review within 3 business days. If shortlisted, Round 1 is a 60-min conversation about your assessment philosophy and IRT expertise. Round 2 is a 90-min working session: you'll review sample questions + propose a calibration approach for them.

---

## About Talpro Universe

QOrium is the 13th venture under Talpro Universe (founded 2013, 12 profitable ventures, ₹50Cr+ annual revenue). We're bootstrapped. The CTO is Talpro's founding CTO. This is a tight, execution-focused team. The I/O Psychologist role is critical to our defensibility; we want a thoughtful, rigorous partner.

---

**Questions?** Reply to this SOW or reach out to **cdo@qorium.online**.

*Last updated: May 1, 2026. QOrium is an equal-opportunity employer.*
