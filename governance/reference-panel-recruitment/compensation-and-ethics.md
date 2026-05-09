# Compensation + Ethics — Reference Panel

The Reference Panel data is the calibration backbone of QOrium's
psychometric claims. Recruitment ethics + compensation policy are
non-negotiable governance, not nice-to-have.

---

## Compensation policy

### Honorarium structure

| Outcome | Payment | Notes |
|---|---|---|
| Completed session, attention-checks passed | **₹2,000** | within 7 business days |
| Completed session, attention-checks failed | **₹500** | participation fee; data excluded from calibration |
| Started session but didn't finish | ₹0 | applicant can resume within 7 days |
| Auto-declined at intake (conflict-of-interest) | ₹0 | no compensation due |
| Manual-declined post-review | ₹0 | applicant told why |
| Withdrew after starting | ₹0 (if they choose to delete responses) OR ₹500 (if they keep responses) | applicant chooses |

### Payment method

- Bank transfer (NEFT/RTGS) OR UPI
- KYC: minimum-necessary at completion only — bank account number +
  IFSC OR UPI ID; PAN if respondent earns enough to require TDS
- Standard professional services TDS (10% u/s 194J) deducted at source
  if respondent's total honorarium > ₹30,000/year (most respondents
  fall well below this; we issue Form 16A only when applicable)
- For India-diaspora respondents: USD via Wise; ~$30 equivalent;
  W-9 / Form 1099-NEC where applicable

### Why ₹2,000

- Covers ~90 minutes at ₹1,300/hour rate (above India median
  hourly for senior IC; well below market for senior-IC top-tier
  consulting)
- Below the threshold where survey-fraud farms are profitable
- Above the threshold where respondents feel underpaid (which
  shows in attention-check failure rate — we have benchmarks)
- Symmetrical across cohorts (no junior-discount, no senior-premium)

### Why NOT to offer above ₹2,000

We considered ₹3,000-₹5,000 to attract more senior respondents.
Decision: keep at ₹2,000.

Reasons:
- Selection effect: respondents who join for financial reason ≥
  ₹3,000 may not be representative; calibration data inflates SES
- Budget: 200 × ₹2,000 = ₹4L is what budget supports; ₹3,000 ramps
  to ₹6L
- Industry norm: ₹2,000 matches NSDC + AICTE-cert pilot honorarium
- Dignity: ₹2,000 is "respect-the-time" not "buy-the-time"

---

## Ethics policy

### Anchored to

- IRB-equivalent process per `governance/Bias-Detection-Methodology-v1.md`
- DPDPA (India Digital Personal Data Protection Act 2023)
- GDPR (for India-diaspora respondents)
- ISIOP code of conduct for psychometric research
- APA Ethical Principles of Psychologists (relevant sections)

### Specifically:

1. **Voluntariness:** all participation voluntary; consent revocable
   at any time without penalty
2. **Informed consent:** respondents see the Charter + Privacy
   Notice before submitting intake form; cannot submit without
   checking 4 specific consents (see `intake-form.md` field 7)
3. **Minimum-necessary collection:** no PII beyond what's needed for
   payment + cohort tagging; payment-PII deleted 90 days after
   payment
4. **Anonymity timeline:** raw email + bank handle deleted at 90
   days; cohort-tagged response data retained 7 years for IRT
   historical comparison; PII fully de-linked at 90 days
5. **Right to withdraw:** respondents can email panel@qorium.online
   to delete data; honored within 30 days; past completed sessions
   retained as anonymised aggregate per Charter §[anonymisation-
   timeline]
6. **No covert manipulation:** no items designed to deceive about
   purpose; respondents always know they're participating in a
   calibration panel
7. **No publication without consent:** respondents may opt-in to
   be named in the white paper acknowledgments; default is
   anonymous
8. **No re-identification:** we do NOT cross-reference panel
   responses to live candidate runs; technical isolation enforced
   by `services/readybank` schema (panel responses live in
   `app.reference_panel_responses`; candidate responses in
   `app.candidate_session_responses` — no shared keys)

### Conflicts of interest

The intake form auto-declines anyone who is:
- Employed by a QOrium competitor (HackerRank, Mettl, Codility,
  AspiringMinds/SHL, Wheebox)
- A current QOrium customer or candidate
- A minor

These are tested at intake (form Q6).

Additional manual review for:
- Anyone with self-disclosed conflict at intake (e.g., "I work at
  ETS in a non-competing capacity")
- Anyone whose email domain matches a competitor's known domain

### Demographic data handling

- Demographic data (gender, age band, region, education tier)
  collected with explicit opt-in
- Used only for cohort-balance + DIF analysis
- Never linked to individual response data in publication
- Never disclosed to third parties (customer, investor, regulator
  request: aggregate-only; never row-level)

### Caste / religion / marital status / political affiliation

We do NOT collect these. India hiring law + DPDPA + ISIOP code
prohibit using these for assessment validation, and they are
ethically outside the scope of QOrium's mission.

---

## Anti-fraud + integrity

| Defense | Where it lives |
|---|---|
| Attention-check items (3 per session) | embedded in assessment via `services/readybank/v1/admin/calibration` flow |
| Time-on-question filters | `app.reference_panel_responses` schema captures `started_at`/`completed_at` per item |
| Duplicate-pattern detection | post-completion batch job (engineering follow-up) |
| Rate-limiting per IP | existing Express middleware (Sprint 1.8.panel-api) |
| Email-domain throwaway blacklist | enforced at intake form |
| Fingerprint + IP anomaly detection | engineering follow-on (≤ 1 sprint) |
| Manual-review queue for flagged sessions | CDO Office + I/O Psych contractor weekly review |

If a session is flagged after completion:
- ₹500 participation fee paid (we honour the time)
- Response data excluded from calibration
- Respondent told privately why; no public list of flagged
  respondents

---

## Charter governance

The full Reference Panel Charter (Tier-A2 D2 deliverable) co-signed
by:
- CDO Office (CTO Office Y1 wear)
- I/O Psychologist contractor (when signed)

Charter sections:
- Recruitment scope + cohort balance targets
- Honorarium structure + payment methodology
- Privacy notice + data retention
- Consent + withdrawal mechanics
- Conflict-of-interest rules
- Demographic data handling
- Anonymisation timeline
- Anti-fraud defenses
- Audit + governance cadence
- Charter renewal cadence (annual)

The Charter is published openly at
`governance/reference-panel-charter-v1.md` (created in Tier-A2 D2)
and referenced from the public landing page.

---

## Audit + transparency

Quarterly "Panel Composition" report (post-MVP):
- Cohort fill status (per cell)
- Demographic distribution
- Honorarium total disbursed
- Withdrawal + flagged-session count
- DIF report references

Report is:
- Internal first (CEO + CTO + I/O Psych review)
- Then aggregated for public Trust page (no PII, no per-cell numbers
  below threshold for re-identification)
- Available to respondents on request via `panel@qorium.online`

---

## What ethics-failure looks like

- **Buying respondents** at price points that distort the cohort →
  selection bias compromises calibration
- **Manipulating intake** to over-recruit easy-to-find demographics
  → WEIRD-skewed panel
- **Cross-referencing respondent data** with live candidate runs →
  re-identification + privacy breach
- **Selling or sharing panel data** with third parties → trust
  collapse + DPDPA violation + ISIOP code violation
- **Hiding flagged sessions** without paying participation fee →
  exploitative; also generates negative public signal

QOrium commits to none of the above. The Charter binds us to it.

---

_Compensation + ethics policy is a draft. Final policy ratified in
the Reference Panel Charter (Tier-A2 D2)._
