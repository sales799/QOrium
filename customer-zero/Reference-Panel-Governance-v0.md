# Reference Panel Governance v0

**For:** QOrium CTO Office, CDO, I/O Psych Contractor, Content Operations  
**Effective:** Month 2 (June 2026) — Phase C Calibration Start  
**Authority:** Constitution SO-21 (IRT mandate), Article V (data compliance)  
**Owner:** CTO Office — Panel Manager (hired M3 part-time or FTE M6)  

---

## Purpose

The Reference Panel is a cohort of 50–250 paid candidates who participate in QOrium assessments throughout the year. Their responses are used to **calibrate question difficulty (IRT b-parameter) and discrimination (a-parameter)** per Standing Order 21. This governance document ensures:

- Candidates are ethically recruited with informed consent
- Quality of responses remains high (no gaming, no fatigue)
- Privacy and data protection are airtight (DPDPA, GDPR, consent auditable)
- The panel is demographically diverse and representative
- Bias analysis (DIF) is rigorous and documented

---

## Panel Size & Ramp

| Phase | Target Size | Timeline | Rationale |
|---|---|---|---|
| **Phase C start (M2W5)** | 20–30 candidates | Jun 1 | Bootstrap calibration; minimal vetting needed |
| **Phase C mid (M2W8)** | 50 candidates | Jun 30 | Full coverage of Wave 1 domains |
| **Phase 1 end (M3W4)** | 100 candidates | Jul 31 | Secondary calibration; cover outliers |
| **Year 1 end (M12)** | 250 candidates | Dec 31 | Continuous calibration; tier-based sampling |

---

## Recruitment Criteria

**All candidates must meet:**

1. **Tech-stack alignment:** Must be comfortable with at least 1 of Wave 1 domains (Java, React, SQL, DevOps, Salesforce, Python, AWS)
2. **Seniority:** Mid-level or senior engineer (3+ years professional experience); no juniors
3. **Geographic diversity target:**
   - 60% India (Delhi, Bangalore, Hyderabad, Pune, Mumbai focus)
   - 30% APAC outside India (Singapore, Australia, Philippines, Vietnam)
   - 10% Global remote (US, Canada, EU if needed for calibration outliers)
4. **Diversity targets (explicit):**
   - Gender: ≥40% underrepresented gender
   - Background: ≥20% non-CS degree (bootcamp, self-taught, career-switcher)

**Exclusion criteria:**
- Former Talpro India employee (within 2 years)
- Current employment at competitor (Adaface, Hired, HackerRank, etc.)
- Active use of social media for sharing interview prep (Reddit, Discord, etc.) — spot-check via LinkedIn
- Prior participation in another assessment calibration panel (within 12 months)

---

## Compensation

**Two models:**

| Model | Rate | Per Year | When Used |
|---|---|---|---|
| **Hourly** | ₹500/assessment-hour | ~₹2,000–₹3,000/candidate | Phase C early (Jun–Jul) |
| **Session-based** | ₹2,500/session (2–3 hours) | ₹10,000–₹12,500/candidate/year | Ongoing (Aug+) |

**Clarification:** A "session" = 1 complete multi-domain assessment (e.g., "2 hours of Java + SQL + design questions"). Hourly is fine-grained; session-based is batch.

**Payment method:** UPI or PayPal (processed within 5 business days of session completion). Invoicing optional; 1099 equivalent for international candidates.

---

## Consent & IP

### Explicit Consent Form (DPDPA-Compliant)

Every candidate signs **before Day 1** of participation:

```
QOrium Reference Panel Consent

I understand that:
1. I will take assessments designed by QOrium
2. My responses will be used for statistical calibration (Item Response Theory)
3. My data will NOT be shared publicly; only aggregate IRT statistics will be published
4. I can request deletion of my data anytime; it will be anonymized within 30 days
5. QOrium owns the questions I respond to; I own my response data
6. This is a paid research engagement (₹500–₹2,500 per session)

I consent to participate. [ ] Yes [ ] No
```

**Form stored:** `/governance/reference-panel/consents/[candidate_id]_consent_signed.pdf` (immutable)

### IP & Data

- **Questions:** QOrium IP; no candidate redistribution
- **Candidate responses:** Anonymized ID only (candidate_uuid, not name/email). Linked to response data + scores + latency
- **Aggregate statistics:** IRT b/a parameters, pass rates by role, DIF analysis — all published in governance reports (no PII)
- **Individual PII:** Never published; stored separately in a hashed vault; audit-log only

---

## Recruitment Channels

**Target allocation:**

| Channel | % | Description | Contact Lead |
|---|---|---|---|
| **Talpro alumni network** | 60% | Former employees, known-trusted | CTO Office / HR Lead |
| **LinkedIn outreach** | 20% | Tech leaders, bootcamp alums, profile-match | Content Ops Manager |
| **Freelance platforms** | 15% | Upwork, Toptal, Workana (quality-filtered) | Content Ops Manager |
| **University partnerships** | 5% | IIT/NIT alums, bootcamp partnerships | CTO Office business dev |

**Vetting funnel:**

1. **Profile review:** Check LinkedIn / Upwork (minimum 100 real reviews for freelancers)
2. **30-min screening call:** Tech stack fit, motivation, availability check
3. **CV verification:** Cross-reference claimed roles with LinkedIn profile
4. **First paid sample (₹500):** Hand them 1 small assessment (10 questions); evaluate quality of responses, no cheating flags
5. **Quality assessment:** If sample responses are thoughtful + no anti-cheat flags, admit to panel. Else, decline politely (offer alternative small-gig, if applicable)

---

## Panel Rotation & Fatigue Management

**Frequency cap:**
- **Maximum 4 sessions per candidate per calendar year** (to avoid overfitting to individual quirks)
- **Cool-down period:** 30 days between sessions (minimum) — no back-to-back assessments

**Rationale:** Candidates who take too many assessments may start pattern-matching the question bank or lose motivation. A 3-year panel member (36 sessions max) is never at the risk of over-saturation.

**Rotation schedule:** Panel Manager maintains a spreadsheet (`panel_rotation.xlsx`) with candidate ID, session dates, cool-down until, max sessions. Auto-alerts when cool-down expires.

---

## Bias Controls & Monitoring

### Quarterly Bias Audit

Every quarter (end of M3, M6, M9, M12):

1. **Panel composition review:**
   - Gender distribution (target ≥40% underrepresented)
   - Geographic split (target 60/30/10)
   - Seniority (expect ~70% senior, ~30% mid)
   - Background diversity

2. **Differential Item Functioning (DIF) analysis:**
   - Per question, check if pass rate differs significantly by role seniority (senior vs. mid) or gender
   - Method: Mantel-Haenszel or IRT logistic regression (I/O Psych contractor chooses)
   - Threshold: If DIF effect size > 0.5, flag for review; if > 1.0, pull from library pending SME review

3. **Pass-rate baseline:**
   - Track expected pass rate per role per difficulty level (e.g., "Easy Java questions: 75% pass rate expected")
   - If observed pass rate deviates >15% from expected, investigate question quality or panel composition

4. **Report:** DIF audit report saved to `/governance/reference-panel/dif-audits/[YYYY-Q].md` with findings + remediation (if needed)

---

## Privacy & Data Retention

### Hashing & Anonymization

- **Candidate IDs:** UUIDv4, hashed with SHA-256 (one-way; cannot reverse-lookup)
- **PII vault:** Separate database table (access restricted to Panel Manager + CDO); contains name, email, phone
- **Response data:** Linked to hashed candidate ID only; IP, user-agent logged for fraud detection

### Logging & Retention

| Data | Retention | Location |
|---|---|---|
| **Response data (answers, latency, scores)** | Until candidate requests deletion (then 30-day anonymization) | PostgreSQL, encrypted |
| **Consent forms** | 3 years (legal hold) | `/governance/reference-panel/consents/` |
| **Anti-fraud logs (IP, UA)** | 90 days | Redis, then purged |
| **PII vault** | Active + 1 year post-panel exit | Separate PostgreSQL schema, backup only to Cloudflare R2 cold storage |
| **DIF audit reports** | 7 years | `/governance/reference-panel/dif-audits/`, immutable |

---

## Operations & Payment

### Panel Manager Responsibilities (Part-time M3, FTE M6)

- Recruit and onboard 50–100 candidates by M4
- Manage calendars, send session links, track completion
- Process UPI/PayPal payments within 5 business days
- Monitor for cheating/low-quality responses
- Run quarterly bias audits (with I/O Psych contractor)
- Respond to candidate questions (1-business-day SLA)

### Technology Stack

- **Scheduling:** Google Calendar + Calendly (shared link for candidates)
- **Payments:** Razorpay (India) + PayPal (international)
- **Feedback:** Post-session survey via Typeform (2-min, optional, incentivized with ₹200 bonus if completed)
- **Tracking:** Panel Manager spreadsheet (master roster; shared with CDO for oversight)

---

## Budget

**Annual cost (ramping):**

| Year | Panel Size | Sessions/Candidate | Total Sessions | Cost/Session | Annual Cost |
|---|---|---|---|---|---|
| **Year 1 (M3–M12)** | 50→100 | 2 | ~150 | ₹2,500 | **₹5L** |
| **Year 2** | 100→250 | 4 | 1,000 | ₹2,500 | **₹25L** |
| **Year 3+** | 250 | 4 | 1,000 | ₹2,500 | **₹25L** |

**Plus panel manager salary:**
- M3–M5: ₹30K/month (part-time contractor, 15 hrs/week)
- M6–M12: ₹80K/month (FTE, 40 hrs/week)
- **Y1 total:** ₹30K × 3 + ₹80K × 6 = ₹570K (~₹6L with overhead)

**Total Y1 Reference Panel cost:** ₹5L (candidates) + ₹6L (ops) = **₹11L**.

---

## Compliance & Consent

### DPDPA 2023 (India)

- QOrium = Data Processor; candidates = data subjects
- Talpro India (if involved) = Data Fiduciary for candidate hiring context (separate from Reference Panel data)
- **Consent:** Signed before participation (see form above)
- **Right to erasure:** Candidate can request deletion anytime; data anonymized within 30 days

### GDPR (EU candidates)

- Same posture: QOrium processes response data under explicit consent
- **Data residency:** India for Year 1; EU candidates' data transferred to Frankfurt region if >10 EU candidates by Year 2
- **Data subject rights:** Right to access (provide anonymized transcript within 15 days), right to erasure (within 30 days)

### Separate Reference Panel Charter

A 1-page **Reference Panel Charter** (distinct from Customer Zero Feedback Charter) is signed by every candidate. Stored in `/governance/reference-panel/charter.md`.

---

## Failure Modes & Remediation

| Failure | Symptom | Mitigation |
|---|---|---|
| **Panel Attrition** | <40 active candidates by M4 | Accelerate recruitment; offer referral bonus (₹500 per new recruit). Fallback to freelance platforms. |
| **Gaming/Collusion** | Responses suspiciously similar; unusual IP patterns | Anti-fraud logging (IP, UA). Manual review if DIF flags a question as "easy for everyone." Revoke candidate if confirmed cheating. |
| **Quality Drift** | Pass rates decline >20% over time | Resample with fresh candidates. Monitor first-response quality (lower quality = fatigue sign). Increase cool-down period. |
| **Bias Blind Spots** | DIF audit reveals systematic bias post-release | Retire question; regenerate with SME review. Add representation to panel if bias maps to underrepresented demographic. |

---

## Open Questions (For I/O Psych Contractor)

These 3 questions are deferred to the I/O Psychologist hired in Month 4:

1. **DIF methodology:** Should we use Mantel-Haenszel, IRT logistic regression, or another method? What threshold (effect size) flags a question as biased?
2. **Pass-rate baseline calibration:** How do we establish expected pass rates per role per difficulty without a reference population? Bootstrap from hiring industry benchmarks (Adaface, etc.)?
3. **Fatigue detection:** Are there psychometric signals (increasing error rate, decreasing time-on-task, response variance) that indicate candidate fatigue? Should we auto-rotate out fatigued candidates?

---

## Drafting Notes (For CTO Office)

1. **Candidate recruitment timeline:**
   - Week 1 (M2W5): Start recruiting; target 10 warm leads from Talpro alumni
   - Week 2–3 (M2W6-W7): Screening calls; first sample assessments
   - Week 4 (M2W8): Admit first 20–30 candidates
   - Jun 15 (M2W6+1): Reach 50 candidates

2. **DIF library:** After M3 gate, extract DIF analysis methodology from published I/O Psych literature (Kline, Helms, etc.). Store template in `/governance/reference-panel/dif-template.md`.

3. **Consent form:** Have legal review the DPDPA form before Week 1 recruitment.

---

*End of Reference Panel Governance v0. Ratified by CTO Office May 2, 2026. Panel Manager hired by Jun 1 (M2W5).*
