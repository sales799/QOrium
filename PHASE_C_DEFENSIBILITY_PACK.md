# QOrium Phase C — Defensibility Shell (CTO 2026-06-03)
_M15 ISO 27001+DPDP · M16 Independent bias audit · M17 India residency_
**⚠️ DRAFTS for legal review (NYAYA / counsel). The CTO is not a lawyer. Verified technical facts are marked VERIFIED.**

---

## M17 — India data residency: **VERIFIED ✅**
Candidate data-at-rest is physically in India:
- **Postgres `qorium`** (all candidate PII, responses, assessments) on Hostinger KVM, **Mumbai, Maharashtra, IN** — AS47583 Hostinger International, IP 147.93.103.194, TZ Asia/Kolkata. Data dir `/var/lib/postgresql/16/main`.
- No candidate media/object storage yet (M6 video not built) → no out-of-India blob storage exists.
**Claim we can make honestly:** "Candidate data is stored in India (Mumbai region)." Publish on `/trust/security` + `/compliance-dpdp` with this evidence.
**Lane to verify + harden:** confirm the active-origin app node (187.127.155.150) is also IN-region (so PII isn't processed/cached outside India); document the data-flow; when M6 video ships, use an India object-store (Cloudflare R2 Mumbai / AWS ap-south-1). Backups must also be India-region.

## M16 — Independent bias audit: methodology + self-assessment (the wedge)
**Public `/trust/bias-audit` content (honest, pre-audit):** explain WHAT we test and HOW, label status "methodology published; independent audit scheduled."
Adverse-impact methodology QOrium commits to:
- **Four-Fifths (80%) rule** on selection/pass rates across protected groups (where lawfully collectable).
- **Score-distribution parity** — mean/SD of scores by group; flag standardized mean differences > 0.2.
- **Item-level DIF** (Differential Item Functioning) once per-item response data exists — flag items that behave differently for equally-able candidates across groups.
- **Reasoning-trace review** — because every grade has a trace, bias reviewers can inspect *why*, not just the score.
**Honest constraint:** real bias statistics need real candidate response + (voluntary, lawful) demographic data — same dependency as empirical IRT. Until then: publish methodology + commit to an independent Indian auditor (e.g., NASSCOM-affiliated / academic psychometrician). Status label: "scheduled," never "passed."
**Human action (CEO/legal):** engage the auditor + decide demographic-data collection policy under DPDP.

## M15 — ISO 27001 + DPDP
### DPDP Act mapping (DRAFT — legal review)
| DPDP requirement | QOrium handling |
|---|---|
| Consent + purpose limitation | Candidate consent captured at assessment start; data used only for the stated hiring assessment |
| Data principal rights (access/correction/erasure) | Build candidate data export + erase endpoints (within 30 days) — M21 audit-log records the action |
| Data residency | VERIFIED India (Mumbai) — see M17 |
| Breach notification | Define + document incident-response runbook + notification path |
| Sub-processor transparency | Publish `/trust/sub-processors` list |
| Grievance officer | Appoint + publish contact (NYAYA template exists in `_shared`) |
### ISO 27001 — Statement of Applicability skeleton (starter; populate evidence)
Domains to stand up an evidence repo for: A.5 policies · A.6 org of infosec · A.8 asset mgmt · A.9 access control (RBAC, SSO) · A.10 crypto (TLS1.3, encryption-at-rest) · A.12 ops security (logging/Pino, backups) · A.16 incident mgmt · A.17 continuity (RPO≤24h/RTO≤4h) · A.18 compliance. Many controls already exist (audit-log M21, SSO M18, secret-rotation, rate-limiting) — map evidence, don't rebuild.
**Human action (CEO/business):** choose auditor + book ISO 27001 Stage-1 (post-revenue, but evidence repo can start now).

---

## CTO-AS-IN-HOUSE-AUDITOR GOVERNANCE (solo-founder, ratified 2026-06-03)
The CTO acts as in-house auditor for all legitimately-internal controls. Two honest-labeling lines are permanent (they protect the founder from misrepresentation liability):
- **Internal self-assessment ≠ independent audit.** AI/CTO-run reviews are labelled "internal self-assessment," never "independent" or "third-party." (An "independent" claim requires a genuine third party.)
- **Implemented ≠ certified.** Claim "ISO 27001 controls implemented / aligned," "SOC 2 controls in place" — never "certified" until an accredited body issues the certificate (legal fact; only they can).
What the CTO now OWNS in-house (no third party, running/auto):
- **Automated bias screen** — `/opt/qorium/scripts/bias-screen.py`, cron every 10 min, scans every launch question for bias/exclusion language, writes `ai_critique_scores.bias_screen` (tagged `screen_type: internal-self-assessment`). First batch: 5 clean / 0 flagged. Pairs with the AI-verify gate (content) and the adverse-impact stats engine (runs on candidate data when it exists).
- **DPDP/ISO policy authorship + internal review** — drafted; published with honest disclaimers. Recommend (not require) a one-time external counsel pass before signing enterprise contracts with indemnities or if litigation arises.
- **Grievance Officer (DPDP):** Bhaskar Anand, bhaskar@talpro.in — named now; publish on /compliance-dpdp. (Solo-founder default; a solo company's founder is a valid grievance contact.)
Residency = VERIFIED (publish). Bias/ISO external letters remain a future option, not a launch blocker.

## DISPATCH
- **Lane (active origin/ARJUN):** publish verified-residency content on `/trust/security` + `/compliance-dpdp`; build the `/trust/bias-audit` methodology page (status "scheduled"); publish `/trust/sub-processors`; ship candidate data export+erase endpoints (DPDP rights) with audit-log entries.
- **CEO/legal (founder ask, consolidated):** (1) engage an independent Indian bias auditor + set DPDP-compliant demographic-data policy; (2) appoint a grievance officer; (3) choose ISO 27001 auditor + book Stage-1 (post-revenue OK).
- **Guardrail:** bias-audit + ISO labels stay "scheduled"/"in progress" until real letters exist. Residency may be stated as VERIFIED (evidence above). All legal copy → counsel/NYAYA review before publish.
