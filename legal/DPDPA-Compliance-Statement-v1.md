# DPDPA Compliance Statement — QOrium / Talpro India Pvt Ltd

**Effective:** 2026-05-08
**Version:** v1.0
**Operator:** Talpro India Pvt Ltd (QOrium product brand)
**Statute:** Digital Personal Data Protection Act 2023 ("DPDPA")
**For:** Recruiter Customers performing pre-contract due-diligence; Auditors; Data Protection Board of India

This document is the public-facing summary of how QOrium meets DPDPA obligations. The full Privacy Notice for Candidates lives at `legal/Privacy-Notice-v1.md`.

---

## 1. Role classification

| Actor                           | Role under DPDPA                                                              |
| ------------------------------- | ----------------------------------------------------------------------------- |
| Recruiter Customer (paying org) | Data Fiduciary — they decided to assess this Candidate                        |
| QOrium / Talpro India           | Data Processor — we operate the assessment platform on the Recruiter's behalf |
| Candidate                       | Data Principal — the data subject                                             |

For Reference Panel paid panelists (separate workflow, ₹2-3K honorarium), QOrium acts as Data Fiduciary (we decide to use their data for IRT calibration).

---

## 2. DPDPA obligation map

| §     | Obligation                             | How QOrium meets it                                                                                                                                  |
| ----- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| §6    | Notice to Data Principal               | `legal/Privacy-Notice-v1.md` shown on take-flow consent screen + linked from every email                                                             |
| §7    | Lawful purpose                         | Hiring-assessment service = legitimate processor purpose; consent + contractual necessity                                                            |
| §8(1) | Accuracy                               | Candidates can correct their own data via privacy@qorium.online; 7-day SLA                                                                           |
| §8(2) | Security safeguards                    | TLS 1.2+ in transit · AWS-KMS at rest · per-vault pepper for Stack-Vault · argon2id passwords · audit log retention 30d/1y/7y per Constitution §10.3 |
| §8(3) | Cooperation with Data Fiduciaries      | Recruiter Customers can pull/delete via /v1/admin endpoints; SCIM provisioning supports lifecycle                                                    |
| §8(5) | Erasure on request                     | 30-day SLA · automated suppression list · audit-only retention for fraud forensics where law requires                                                |
| §8(6) | Breach notification                    | 72-hour to Data Protection Board + affected Data Principals; runbook in `governance/observability-runbook.md`                                        |
| §10   | Significant Data Fiduciary obligations | Below the volume threshold today; we will register voluntarily before crossing it                                                                    |
| §11   | Right of access                        | privacy@qorium.online "DPDPA Request: Access" → 30-day delivery                                                                                      |
| §12   | Right of correction + erasure          | privacy@qorium.online "DPDPA Request: Correct/Erase" → 7-day correct, 30-day erase                                                                   |
| §13   | Grievance redressal                    | DPO contact in privacy notice; 7-day first response; 30-day resolution                                                                               |
| §14   | Right to nominate                      | Honoured on request; documented in privacy notice                                                                                                    |
| §17   | Cross-border transfer                  | Primary processing in AWS ap-south-1 (Mumbai); cross-region backup to ap-southeast-1 only — permitted; no transfer to MEITY-restricted countries     |
| §32   | Data Protection Board complaint        | Statutory route preserved; we don't contest jurisdiction                                                                                             |

---

## 3. Technical & organisational measures

### Technical

- Cloudflare WAF + DDoS at edge (free tier; sufficient for current scale)
- TLS 1.2+ enforced (HSTS preload pending; Cloudflare-managed)
- Per-tenant database row scoping (Stack-Vault); HMAC-SHA256-keyed access tokens
- Watermark engine catches IP exfiltration with leak attribution
- IRT calibration runs DIF detection across demographics (Mantel-Haenszel) per SO-21
- Backups: AWS Backup vault primary+destination; daily PITR; cross-region encrypted; 7-year retention
- Email auth: SPF, DKIM (Easy DKIM RSA_2048), DMARC (p=none ramping to quarantine)

### Organisational

- Constitution Article XI governance (CEO ratification + CTO authoring + Board oversight)
- Audit trail: every recruiter+candidate+admin action persisted with actor + timestamp + IP
- Subject Access Request workflow: privacy@qorium.online inbox → triage → fulfilment
- DPDPA-compliant consent forms used for both Candidates and Reference Panel members
- All processing within India for primary; cross-border only for backup

---

## 4. Sub-processor list (transparency)

| Provider                  | Purpose                                                                                 | Region                                                         | DPA in place                           |
| ------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------- | -------------------------------------- |
| Amazon Web Services (AWS) | Compute, storage, email send (SES), KMS, Backup                                         | ap-south-1 Mumbai (primary), ap-southeast-1 Singapore (backup) | Yes — AWS Customer Agreement + DPA     |
| Cloudflare                | DNS, WAF, CDN                                                                           | Global edge with Indian POPs                                   | Yes — Cloudflare DPA                   |
| Hostinger                 | Origin VPS                                                                              | India region                                                   | Yes — Hostinger DPA                    |
| Anthropic                 | Claude API for JD-Forge generation (anonymised question content only; no Candidate PII) | US (US-East)                                                   | Yes — Anthropic Commercial Terms + DPA |
| Grafana Labs / Sentry     | Observability + error tracking (planned; cred-bound)                                    | EU + IN                                                        | DPA pending cred-drop                  |

We post sub-processor changes to legal/sub-processors.md (forthcoming) with 30-day notice to Recruiter Customers per their commercial contracts.

---

## 5. Children's data

QOrium does not target users under 18. Workflow voids any assessment where the Candidate self-identifies as a minor, and data is deleted within 72 hours. No verifiable parental consent process exists because the platform is not for children.

---

## 6. Significant Data Fiduciary status

Section 10 of DPDPA imposes additional obligations (DPO appointment, Data Protection Impact Assessment, independent audit) on entities classified as Significant Data Fiduciaries by the Government, based on volume + sensitivity + risk.

QOrium is well below current notification thresholds. We will:

- Voluntarily appoint a DPO before crossing 100,000 active Candidates per quarter (currently target Year-1 ~5,000)
- Conduct an independent DPDPA audit before Series A close
- Publish DPIA for any new Wave-3 psychometric processing (sensitive personal data category)

---

## 7. International equivalents

While DPDPA governs operations, QOrium's design also lines up with:

- **GDPR (EU)** — most controls map directly; we don't currently sell into EU but won't face material rebuild if we do
- **CCPA/CPRA (California)** — similar consumer-rights framework; data subject request flow is jurisdiction-agnostic
- **Mainly we run on India law and rely on adequacy + Standard Contractual Clauses for any cross-border**

---

## 8. Updates to this statement

Posted at qorium.online/dpdpa with effective date + changelog. Recruiter Customers receive 30 days advance notice of material changes via their commercial inbox.

---

## 9. Contact

- **DPO / Privacy:** privacy@qorium.online
- **Security disclosures:** security@qorium.online
- **Legal / contracts:** legal@qorium.online
- **CEO escalation:** bhaskar@qorium.online
- **Data Protection Board of India:** https://www.meity.gov.in/dpdp (statutory route)

---

**End of DPDPA Compliance Statement v1.0.** Reviewer: K&S Partners IP-counsel (engagement closed CC-02-A, 2026-05-03; review pending). Author: CTO Office (autonomous agent), 2026-05-08.
