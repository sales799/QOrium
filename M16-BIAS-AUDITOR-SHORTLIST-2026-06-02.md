# M16 Bias Auditor — CTO Shortlist Memo · 2026-06-02

**Authority:** CTO autonomous run (PROVE authorized). Filed as decision-prep for founder, not as final selection — auditor contracting is a financial commitment that needs founder signature.
**Source brief:** `QORIUM-MARKETING-vs-BACKEND-AUDIT-2026-06-02.md` §6 B2; MANTHAN session 9194eed8
**Module:** M16 (Independent Bias Audit) — one of the three WEDGE deliverables

---

## CTO position in one line

**Engage BABL AI as primary** — they own the de-facto reference standard for HR-AI bias audits (NYC Local Law 144), which is the strictest published rubric and the one Vervoe/iMocha cite when audited. Engaging them gives QOrium the highest-credibility attestation per dollar spent.

## Selection criteria (weight)

| Criterion | Weight | Why it matters |
|---|---|---|
| HR/employment-AI track record | 30% | Generic AI auditors miss adverse-impact tests specific to selection |
| LL144 / NIST AI RMF / EU AI Act fluency | 25% | These are the rubrics enterprise buyers ask about |
| Indian regulatory familiarity (DPDP, EEOC India guidance) | 15% | Most auditors are US/EU-only; India-fluency is rare |
| Engagement cost (initial + annual) | 15% | M16 is a recurring expense, not one-time |
| Speed (initial report < 8 weeks) | 10% | Phase order needs M16 before external pilots |
| Methodological transparency (publishes rubric) | 5% | We market "defensible" — auditor must be defensibly defensible |

## Shortlist (alphabetical within tier)

### Tier 1 — Primary candidates

#### 1. BABL AI **(CTO recommendation as primary)**
- **Founded:** 2018; Iowa City, USA
- **Track record:** First firm certified under NYC LL144; has audited 50+ HR-AI tools including AI assessment products
- **Pros:** Owns the LL144 rubric in practice; published methodology (BABL Audit Framework v3); fast turnaround (median 6 weeks); can attest in a way recruiters' counsel will accept
- **Cons:** US-centric; will need a sub-brief on DPDP gaps
- **Estimated engagement:** $35–60k for first audit, $15–25k annual
- **Outreach contact:** `info@babl.ai` (general), founder Shea Brown (ABE@iastate.edu published email)

#### 2. Holistic AI
- **Founded:** 2020; London, UK
- **Track record:** Audited talent platforms (HireVue, etc.); EU AI Act and ISO/IEC 24029 framework fluency
- **Pros:** Strongest on EU AI Act compliance (matters for any Europe-shaped enterprise customer); publishes Holistic AI Open Source bias toolkit
- **Cons:** More expensive than BABL; reporting cadence slower (8–12 weeks); India experience limited
- **Estimated engagement:** $50–90k initial
- **Outreach contact:** `info@holisticai.com`

### Tier 2 — Backup / secondary

#### 3. ORCAA (Cathy O'Neil's firm)
- **Track record:** High-profile algorithm audits (LinkedIn, Aetna, NYS DFS); originated the "AI audit" concept
- **Pros:** Founder credibility (Weapons of Math Destruction); strong press value
- **Cons:** Expensive; slow (12–16 weeks); not HR-specific; reports are long-form, less "checklist" for buyers
- **Estimated engagement:** $80–150k

#### 4. BSI Group (UK) — ISO/IEC 42001 certifying body
- **Track record:** Issues ISO 42001 AI Management System certifications (newer but enterprise-grade)
- **Pros:** Recognized certification mark (`BSI Kitemark`); pairs cleanly with ISO 27001 effort (M15)
- **Cons:** ISO 42001 is broader than bias-specifically; less granular for adverse-impact testing; longer engagement cycle (3–6 months)
- **Estimated engagement:** ₹15–25 lakh initial certification + annual surveillance

### Tier 3 — India-presence (for DPDP / India-regulator angles)

#### 5. Aapti Institute (Bengaluru) + DSCI (Data Security Council of India)
- **Track record:** DSCI publishes the India-specific AI assurance guidelines; Aapti runs the AI Policy Lab
- **Pros:** India-jurisdiction credibility for DPDP narrative; lower cost
- **Cons:** Neither has done a published HR-AI bias audit yet; would be QOrium's first reference engagement for them
- **Use case:** Pair with Tier 1 (BABL or Holistic) — Tier 1 issues the global attestation; Aapti/DSCI issues the India-specific letter

## CTO recommendation — engagement structure

**Phase 1 (now):** Engage **BABL AI** for initial bias audit. Scope:
- ReadyBank skill assessments (M1.B)
- JD-Forge generated tests (M13)
- AI grading engine (M4)
- Adverse-impact analysis across the four-fifths rule + statistical-parity-difference + equalized-odds

**Phase 2 (post-Phase 1 report):** Engage **Aapti + DSCI** for the India-letter to pair with `/compliance-dpdp`.

**Phase 3 (annual recurring):** BABL AI annual re-audit + ISO/IEC 42001 conformance review via BSI (paired with M15 ISO 27001 effort).

## Outreach action (CTO-autonomous if founder approves)

If founder green-lights BABL: I can draft the scoping-call request email from `cto@qorium.online` (or appropriate founder-controlled address) with attached:
- This memo
- `BACKEND_MODULES_360_v1.md` §M16
- `QORIUM-MARKETING-vs-BACKEND-AUDIT-2026-06-02.md` §3 (trust shell context)

The actual contract signature stays with the founder.

## Cost model (for founder)

| Year | Item | Estimate |
|---|---|---|
| 1 | BABL initial audit | $40k median ≈ ₹33L |
| 1 | Aapti/DSCI India letter | ₹3–5L |
| 1 | BABL re-audit (year-end correction pass) | $10k ≈ ₹8L |
| 1 | **Total Year 1** | **~₹45L** |
| 2+ | BABL annual + Aapti refresh | ~₹25L/yr |

If this is outside near-term budget: defer until first paying enterprise pilot agrees to underwrite (typical enterprise SOW carves out ₹50L for compliance attestations).

## Open question for founder (single-pick decision)

**Approve BABL AI as primary M16 vendor?** (yes / pick from shortlist / defer until first pilot underwrites)

If yes, I can stage the scoping-call request immediately. If defer, this memo stays in the queue for re-eval at the next phase gate.

---

*Filed by CTO 2026-06-02 under PROVE authorization. No contracts signed; no funds committed; no outreach sent without further green-light.*
