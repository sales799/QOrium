# DATA PROCESSING ADDENDUM (DPA)
## QOrium — CTO-Office Working Draft v0.1

**STATUS: CTO-Office working draft v0.1.** This document is NOT a legal opinion. Final language must be set and signed by qualified Indian-bar IP/commercial counsel. CTO Office authored it so counsel begins from a populated outline rather than a blank page. Bracketed `[…]` markers indicate counsel-decisions or company-specific values. Ratification by CEO + Counsel required before any third-party use.

---

## PREAMBLE

This Data Processing Addendum ("**DPA**") is executed as **Exhibit B** to the Master Services Agreement dated `[DD MMM YYYY]` between QOrium Technology Private Limited ("**QOrium**") and `[CUSTOMER LEGAL NAME]` ("**Customer**"), and supplements the MSA in all matters relating to the processing of Personal Data.

This DPA is mandatory for any engagement in which Customer Data (as defined in the MSA) flows to QOrium, including but not limited to:

- Stack-Vault white-label engagements (where QOrium SMEs review anonymized candidate data during question authoring or calibration)
- JD-Forge Reviewed/Enterprise tiers (where SME reviewers see job descriptions that may contain data subject identifiers)
- Reference Panel operations (where candidates attempt calibration questions for IRT sampling)

**This DPA is NOT required** for ReadyBank API access or pure bulk-export engagements where no Customer Data is transmitted.

---

## 1. SCOPE & ROLES

### 1.1 Applicability

This DPA applies to the processing of **Personal Data** (as defined below) under applicable data protection laws, specifically:

- **India:** Digital Personal Data Protection Act, 2023 (DPDPA)
- **EU/UK:** General Data Protection Regulation (GDPR Regulation (EU) 2016/679)
- **Other jurisdictions:** As Customer is domiciled or operates

### 1.2 Roles & Responsibilities

**Customer** is the **Data Fiduciary** (DPDPA) or **Data Controller** (GDPR) — the party that determines the purposes and means of Personal Data processing.

**QOrium** is the **Data Processor** (GDPR) or **Data Processor/Significant Data Fiduciary** (DPDPA) — the party that processes Personal Data on behalf of Customer, subject to Customer's documented instructions.

**Determination of "Significant Data Fiduciary" (DPDPA §3(40)):** QOrium qualifies as a Significant Data Fiduciary if it:

- Processes large quantities of Personal Data (threshold: [TBD by counsel based on scale projections], estimated >100,000 data subjects per year by Year 2); OR
- Engages in systematic profiling that significantly affects rights; OR
- Processes sensitive Personal Data at scale.

**Action Item for Counsel:** Confirm QOrium's DPDPA Significant Data Fiduciary status based on actual projected data flows. If SDF, comply with §4(7)–(12) additional obligations (security audits, data retention policies, breach notification protocols). If Processor only, simplified regime applies.

### 1.3 Out-of-Scope

This DPA does **not** govern:

- QOrium's processing of its own anonymized/aggregated analytics data (performance metrics, question pass-rate trends).
- QOrium's use of data for AI model improvement **without** Customer consent (see Section 4.3).
- Customer's internal use of questions or assessment results (outside QOrium's processing).

---

## 2. CATEGORIES OF PERSONAL DATA

### 2.1 Scope of Data Flows

Customer may provide or enable access to the following categories of Personal Data:

| Category | Examples | Processing Purpose | Data Subject | Retention |
|---|---|---|---|---|
| **Candidate Identifiers** | Name, email, phone, employee ID | Assessment delivery, scoring | Candidate | Question archive (anonymized within 30 days) |
| **Resume/CV Data** | Education, prior employment, skills, certifications | JD-Forge spec generation, question authoring | Candidate | Deleted after engagement (max 90 days) |
| **Assessment Responses** | Answers, code submissions, time-on-task, behavioral telemetry | Scoring, validation, anti-cheat detection | Candidate | 90 days (anonymized thereafter) |
| **Behavioral Telemetry** | Session logs, IP address, device fingerprint, keystroke timing, geographic location | Anti-cheat, anti-leak forensics, usage analytics | Candidate | 90 days (purged or anonymized) |
| **SME Reviewer Data** | Internal: names, roles, email of QOrium SME contractors reviewing questions | Audit logging, quality management | Contractor | Retention per employment/contract law |

**[Counsel Note]** Customer should define which data categories are actually necessary for their use case. The table above covers the widest scope; most customers will provide only candidate identifiers + assessment responses.

### 2.2 Sensitive Personal Data (DPDPA § 2(e) / GDPR Article 9)

Under DPDPA, **Sensitive Personal Data** includes data concerning:

- Health, sex life, or medical condition
- Genetic or biometric data for identification
- Caste, religion, political belief, trade union membership

**QOrium shall NOT process Sensitive Personal Data** without explicit documented consent from Customer and the data subject. If Customer intends to provide any Sensitive Personal Data (e.g., health accommodations, medical conditions for fairness in assessment):

1. Customer obtains explicit written consent from each data subject before data flows.
2. Customer provides consent documentation to QOrium prior to data transmission.
3. QOrium implements additional safeguards (encrypted storage, segregated access logs, 30-day automatic deletion).

---

## 3. PURPOSES OF PROCESSING

### 3.1 Permitted Processing Purposes

QOrium processes Personal Data **solely for the following purposes**, at Customer's documented instructions:

1. **Assessment Delivery** — Administering, scoring, and reporting on assessment questions to candidates.
2. **Scoring & Calibration** — Computing candidate scores, difficulty indices, and discrimination parameters (IRT).
3. **Anti-Cheat Detection** — Flagging suspicious behavior (identical responses, IP spoofing, rapid answer sequences) to prevent assessment integrity violations.
4. **Anti-Leak Forensics** — Watermark analysis, attribute comparison, and forensic matching to determine if leaked questions originated from this Customer's private Stack-Vault.
5. **Audit Trail & Compliance** — Maintaining logs of who accessed what data when, for security audits and regulatory evidence.
6. **Customer Support** — Responding to Customer's technical support inquiries (e.g., "why did this candidate's score drop?").

### 3.2 Prohibited Purposes

QOrium shall **not** use Personal Data for:

- **Model Training (without consent):** QOrium shall not fine-tune AI models or train LLMs on customer-identifiable data without separate written consent from Customer and (where practical) each data subject. [Ref: Constitution SO-19]
- **Secondary Marketing:** Profiling, lead generation, or commercial targeting of candidates.
- **Discrimination Analysis:** Using assessment data to profile or infer protected characteristics (caste, religion, gender, disability status) for non-fairness purposes.
- **Sale or Sharing:** Selling, licensing, or sharing Personal Data with third parties outside Section 4.1 (Sub-processors).

### 3.3 Consent for Model Training

If Customer wishes QOrium to use assessment data (anonymized or identifiable) for improving AI question generation, Customer must:

1. Provide explicit written consent specifying the data types and intended use.
2. Obtain consent from data subjects, or ensure Customer is authorized to consent on their behalf (e.g., employer providing anonymized employee assessment data).
3. Sign a supplemental **Model Training Addendum** (not included in this template; coordinate with counsel).

Without separate consent, QOrium processes data only for the purposes in Section 3.1.

---

## 4. SUB-PROCESSORS & THIRD-PARTY SERVICES

### 4.1 Current Sub-Processor List

QOrium engages the following Sub-Processors (also termed "Data Processors" or "Sub-contractors") to process Customer Personal Data:

| Sub-Processor | Location | Role | Data Categories | Notes |
|---|---|---|---|---|
| **Anthropic (Claude API)** | US (primary) | AI generation, content authoring | Assessment specs, SME notes | API calls anonymized by prompt injection |
| **OpenAI (GPT-5 API)** | US | Fallback generation, validation | Question specs (no PII) | Used only if Anthropic unavailable |
| **Google Gemini** | US | Specific NLP tasks | Assessment responses (anonymized) | Used for language-specific analysis |
| **Judge0** | EU (self-hosted) | Code execution sandbox | Code submissions, test case outputs | Runs candidate code for skill assessment |
| **Hostinger (VPS)** | Lithuania (EU) | Infrastructure, database hosting | All data (encrypted at rest) | PostgreSQL primary database |
| **Cloudflare R2 (S3)** | Global (multiple regions) | Object storage, backups | Exports, encrypted archives | Lifecycle policy: purge after 90 days |
| **Sentry (error tracking)** | US | Application error logging | Error context, partial request traces | Configured to scrub PII |
| **Grafana Cloud (observability)** | US | Metrics, alerts | Request counts, latency, error rates | No PII in metrics |
| **Talpro Sentinel (internal)** | India | Security monitoring, incident response | Audit logs, security events | Internal Talpro Universe service |

### 4.2 Sub-Processor Notification & Objection

QOrium shall notify Customer (email to the contact listed in the Order Form) **at least 30 days in advance** of:

- Adding a new Sub-Processor
- Removing or replacing an existing Sub-Processor
- Changing a Sub-Processor's role or scope

**Customer's Right to Object:**

- Within 15 days of notification, Customer may raise objections on grounds of data protection or conflict of interest.
- QOrium shall consider objections in good faith and, if Customer objects, shall either:
  - Address Customer's concern (e.g., negotiate additional safeguards with the Sub-Processor), OR
  - Offer to terminate the affected Order Form without penalty.

Failure to object within 15 days constitutes acceptance.

### 4.3 Sub-Processor Obligations

QOrium ensures that each Sub-Processor:

1. Is bound by a written data processing contract (DPA or equivalent) imposing equivalent data protection obligations.
2. Complies with DPDPA (if India-based) and GDPR (if processing EU-subject data).
3. Implements security measures equivalent to Section 6 below.
4. Does not sub-subcontract without approval.
5. Cooperates with audit and inspection requests.

QOrium remains liable to Customer for any Sub-Processor's failure to meet these obligations.

---

## 5. DATA RESIDENCY & INTERNATIONAL TRANSFERS

### 5.1 Data Residency — India Primary

**Default:** All Personal Data is stored and processed in **India** (Hostinger VPS, Bengaluru, with encrypted backups to Cloudflare R2 with regional replication).

Customer Data remains in India unless Customer explicitly requests or consents to alternative residency.

### 5.2 EU/UK Data Residency

**For EU/UK data subjects (GDPR compliance):**

Beginning **Phase 2 (Month 6, 2026)**, QOrium shall offer:

- **EU-primary residency option:** Personal Data is stored in EU regions (Frankfurt, Germany, or Amsterdam, Netherlands) with redundancy within EU.
- **UK-primary residency option:** Personal Data is stored in UK regions (London or Dublin proxy) with redundancy within UK.

By **end of Year 1 (Month 12)**, EU-primary residency shall be the default for any Customer with data subjects in the EU/UK.

**Cost Impact:** EU residency may incur a 15% infrastructure premium; Customer may accept or decline this option.

### 5.3 International Data Transfers (Intra-Talpro Universe)

QOrium may share anonymized or aggregated data with other Talpro Universe entities (LeadHunter, ProveIQ, HireIQ) for:

- Cross-product analytics
- Infrastructure optimization
- Security threat intelligence

**Condition:** This sharing must be anonymized (no direct identifiers) and Customer may opt out on a per-engagement basis.

### 5.4 Standard Contractual Clauses (SCCs)

For any transfer of Personal Data **outside India/EU** (e.g., to Anthropic API in US, Judge0 in EU, Cloudflare global regions), QOrium relies on:

- **GDPR:** EU Standard Contractual Clauses (SCCs Module 2: Controller-Processor, or Module 3: Processor-Sub-Processor) as approved by the European Commission.
- **UK:** UK Standard Contractual Clauses under the UK International Data Transfer Agreement.
- **India (DPDPA):** No specific SCC requirement; DPDPA §4(11) requires "reasonable safeguards," met by encryption, access controls, and contractual obligations per Section 4.2.

A copy of executed SCCs is available upon request.

---

## 6. SECURITY MEASURES

### 6.1 Technical Safeguards

QOrium implements the following technical controls:

| Control | Implementation | Verification |
|---|---|---|
| **Encryption in Transit** | TLS 1.3+ on all API calls and customer connections | Annual SSL/TLS audit; certificate validity checks |
| **Encryption at Rest** | AES-256-GCM for database columns containing PII | Key rotation policy: annually or on key compromise |
| **Database Access** | Role-based access control (RBAC); no direct SQL access from public-facing services | Quarterly access review; automated IAM monitoring |
| **Audit Logging** | Every query touching Personal Data logged with timestamp, actor, action, result | Logs retained 90 days; immutable archival to R2 |
| **Secrets Management** | No plaintext API keys or credentials in code; all secrets in environment variables or vault | gitleaks runs in CI; Sentry scans for credential leaks |
| **Network Isolation** | VPS on private subnet; only API gateway (Nginx) exposed; internal services on private IP | Security group rules reviewed quarterly |
| **Rate Limiting & DDoS** | Cloudflare DDoS mitigation; per-IP rate limits on auth endpoints | Monthly Cloudflare security report |
| **Intrusion Detection** | Sentry alerts on suspicious patterns (N+1 queries, bulk exports, unusual API usage) | On-call escalation to CTO within 30 min of alert |

### 6.2 Organizational Safeguards

| Measure | Implementation |
|---|---|
| **Access Control Policy** | Written policy limiting access to Personal Data to QOrium employees/contractors with documented need-to-know |
| **Contractor Agreements** | All contractors sign confidentiality + data protection NDA |
| **Background Checks** | Standard background verification for any hire with data access |
| **Training** | Annual data protection training for all QOrium staff; privacy-by-design principles |
| **Incident Response Plan** | Documented procedure for breach detection, response, and notification (Section 8) |
| **Regular Audits** | Quarterly internal security audits; annual external SOC 2 Type II audit (target: achieved by Month 18) |
| **Vendor Audits** | Annual audits of Sub-Processors (Hostinger, Cloudflare) for SOC 2 Type II or ISO 27001 compliance |

### 6.3 Compliance with OWASP Top 10

QOrium's infrastructure and API are designed to mitigate OWASP Top 10 risks:

1. **Broken Access Control** — RBAC + MFA for admin access
2. **Cryptographic Failures** — AES-256 + TLS 1.3
3. **Injection** — Parameterized queries; input validation on all endpoints
4. **Insecure Design** — Threat modeling per STRIDE; gatekeeper pre-release audit
5. **Security Misconfiguration** — Infrastructure-as-code; regular configuration audits
6. **Vulnerable Components** — npm audit + dependency checker in CI; SCA tool (Snyk or equivalent) by Year 2
7. **Authentication Failures** — NextAuth.js with MFA for admin; API key HMAC-SHA256
8. **Data Integrity Failures** — Immutable audit logs; transaction-level integrity checks
9. **Logging & Monitoring Failures** — Structured logging (Pino); Sentry + Grafana dashboards
10. **SSRF Mitigation** — Outbound API calls signed; allowlist of trusted endpoints

---

## 7. DATA SUBJECT RIGHTS

### 7.1 Right to Access (DPDPA §11 / GDPR Article 15)

**Upon Data Subject's Request:**

If a candidate (or their designated representative) requests access to their Personal Data processed by QOrium, the request flows as follows:

1. **Customer receives request** and forwards to QOrium with proof of identity.
2. **QOrium responds** within:
   - **14 calendar days (DPDPA §11(5))**, or
   - **30 calendar days (GDPR Article 15)**, whichever applies.
3. **Format:** QOrium provides data in a structured, human-readable format (e.g., CSV or JSON), or as a summary report if data is voluminous.

### 7.2 Right to Correction (DPDPA §12 / GDPR Article 16)

If a data subject claims Personal Data is inaccurate (e.g., "my name is misspelled"), QOrium shall:

1. Verify the claim within 7 days.
2. If valid, correct the data and notify the data subject and Customer within 14 days.
3. If claim is disputed, maintain the original data and note the subject's objection.

### 7.3 Right to Erasure (DPDPA §15 / GDPR Article 17)

**"Right to be Forgotten":**

Upon request, and subject to legal holds, QOrium shall erase Personal Data within **30 days**, except:

- Data required for legal compliance (tax records, contract evidence).
- Data necessary to prevent fraud (anti-cheat logs for 1 year).
- Anonymized data that cannot identify the subject.

QOrium notifies Customer of erasure requests and complies with Customer's final decision (Customer may deny if erasure violates customer's contractual or legal obligation).

### 7.4 Right to Data Portability (GDPR Article 20)

Upon data subject's request, QOrium provides Personal Data in a structured, machine-readable format (JSON, CSV) within **30 days**, enabling transfer to another service provider.

### 7.5 Right to Restrict Processing (GDPR Article 18)

If a data subject contests the accuracy of data, QOrium suspends further processing (scoring, profiling) pending Customer's verification, for up to **14 days**.

### 7.6 Right to Object (GDPR Article 21)

Data subjects may object to:

- **Profiling for automated decision-making** (e.g., QOrium's AI using assessment data to predict future job fit). Upon objection, QOrium suspends automated profiling and flags the record for manual review.
- **Direct marketing** (not applicable; QOrium does not market to candidates).

### 7.7 Grievance Redressal (DPDPA §8 / GDPR Article 77)

Data subjects may lodge grievances with QOrium regarding data protection:

**QOrium's Grievance Officer:**

| Role | Contact |
|---|---|
| Data Protection Officer / Grievance Officer | `privacy@qorium.online` |
| Escalation | `cto@qorium.online` |
| Postal Address | QOrium Technology Pvt Ltd, [Address], Bengaluru |

**SLA:** Acknowledge receipt within 7 days; respond substantively within 14 days.

If unsatisfied, data subjects may lodge complaints with:

- **India:** Digital Personal Data Protection Authority (DPDPA Board) [once established under DPDPA §15]
- **EU:** Data Subject's national data protection authority (DPA)
- **UK:** Information Commissioner's Office (ICO)

---

## 8. DATA BREACH NOTIFICATION

### 8.1 Breach Definition

A **Personal Data Breach** is any unauthorized access, disclosure, alteration, or loss of Personal Data that compromises confidentiality, integrity, or availability. Includes:

- Unauthorized API access (compromised credentials)
- Database injection or exfiltration
- Insider threat (malicious employee access)
- Loss of encrypted backups (even if encrypted, breach assessment required)
- Ransomware or extortion attempts

**Does NOT include:**

- Unsuccessful intrusion attempts blocked by firewalls
- Authorized access per audit or support request
- Anonymized data (by definition, no longer "Personal Data")

### 8.2 Breach Detection & Assessment

Upon **discovery of suspected breach**, QOrium:

1. **Notifies CEO + CTO** within **2 hours** via encrypted channel (Slack, phone).
2. **Assembles Incident Response Team** (CTO, CDO, Legal Counsel) within **4 hours**.
3. **Begins forensic analysis** to determine:
   - Scope: How many data subjects affected?
   - Sensitivity: What data categories (names, SSNs, health data)?
   - Risk level: Can affected individuals be re-identified? Realistic harm?
4. **Completes assessment** within **72 hours** of discovery.

### 8.3 Breach Notification — India (DPDPA)

**Timeline:** Notify within **72 hours** of discovery (or as soon as practical).

**Recipients:**
- **Customer** (Data Fiduciary) — via email + phone
- **Affected individuals** — if risk of harm is material
- **Digital Personal Data Authority** — if required [pending DPDPA §8(1) rules]

**Content:**
- Description of breach (what happened, when discovered)
- Data categories and approximate number of individuals
- Likely consequences (risk of identity theft, financial loss, etc.)
- Measures taken to mitigate
- QOrium contact for further information

### 8.4 Breach Notification — GDPR (EU/UK)

**Timeline:** Notify within **72 hours** of becoming aware of breach.

**Recipients:**
- **Customer** — immediate notification (same day if possible)
- **Affected individuals** — if high risk of harm (within 30 days)
- **Data Protection Authority (DPA)** — if risk to rights/freedoms is high

**Content:** As per GDPR Article 33(3) — same as DPDPA, plus:
- Likely consequences and measures
- Contact of Data Protection Officer (if appointed)

### 8.5 Breach Remediation

**Customer Cost:** If breach is QOrium-caused (negligence, inadequate security), QOrium bears:

- Forensic investigation costs
- Breach notification costs (mailings, credit monitoring offers)
- Regulatory fines (up to liability cap in MSA Section 12.3)

**Customer Contribution:** If breach is Customer-caused (weak password, compromised customer account), costs are shared per the MSA indemnification clause.

---

## 9. ANTI-LEAK ROTATION & FORENSIC ANALYSIS

### 9.1 Watermark-Based Forensics (Stack-Vault)

When a Stack-Vault question is detected leaked (Section 4 of the MSA), QOrium may:

1. **Analyze watermarks** embedded in the leaked question to attribute it to a specific Customer.
2. **Extract Customer metadata** (HMAC-derived test case values, variable names, scenario details) to confirm source.
3. **Cross-reference with access logs** to identify which individuals within Customer's organization accessed the question.

**Personal Data implications:**
- Forensic analysis may incidentally reveal which employees accessed certain questions.
- QOrium may need to share findings with Customer's security/legal team to investigate internal leakage.
- Such sharing is permitted under Section 3.1 (anti-leak forensics purpose).

### 9.2 Data Minimization During Forensics

QOrium shall:

- **Limit data collection** to the minimum necessary to determine the leak source and attribute it.
- **Purge forensic logs** within **30 days** of leak resolution (unless legal hold applies).
- **Notify Customer** immediately if analysis reveals a QOrium security failure (vs. Customer-side leak).

---

## 10. AUDIT & COMPLIANCE

### 10.1 Customer Audit Rights

Customer may, **no more than once per calendar year** (or more frequently for Security Incident investigations):

1. **Request QOrium's audit records** (SOC 2 Type II report, ISO 27001 certificate, penetration test summary) demonstrating compliance with Section 6.
2. **Conduct a security questionnaire** (max 20 questions, 30 days to respond).
3. **Engage a qualified third-party auditor** to review QOrium's data processing practices (Customer bears auditor cost; QOrium cooperates with site visit, staff interviews, system access with appropriate security protocols).

QOrium provides these at no cost to Customer, within **30 days** of request.

### 10.2 QOrium's Compliance Targets

| Certification | Target Completion | Scope |
|---|---|---|
| **SOC 2 Type II** | Month 18 (Year 2) | Security, Availability, Processing Integrity, Confidentiality |
| **ISO 27001** | Month 30 (Year 2.5) | Information Security Management System |
| **GDPR ROPA** (Record of Processing Activities) | Ongoing | Available upon request |
| **Annual Penetration Test** | Month 12, 24, 36 | Third-party black-box security assessment |

### 10.3 DPO / Grievance Officer Appointment

QOrium appoints a **Chief Data Officer** or external **Data Protection Officer (DPO)** to:

- Handle data subject access requests (Section 7)
- Manage breach notification (Section 8)
- Coordinate with Customer on data protection matters

**Contact:** `privacy@qorium.online`

---

## 11. TERM & TERMINATION

### 11.1 Effective Date

This DPA is effective on the **date of last signature** (Customer and QOrium). It applies to any Personal Data processing under the accompanying MSA (Order Form).

### 11.2 Termination & Data Return

Upon termination of the MSA (or specific Order Form involving Personal Data):

**Within 30 days, QOrium shall:**

1. **Return or Delete** all Personal Data, per Customer's written choice:
   - **Return:** Provide data in structured format (CSV, JSON, encrypted file)
   - **Delete:** Irrevocably erase from all systems (including backups) with certification

2. **Destroy Sub-Processor copies:** Instruct all Sub-Processors to return/delete per same timeline.

3. **Retain only where legally required:**
   - Audit logs (for 1 year, for compliance/incident evidence)
   - Anonymized data (which is no longer "Personal Data")

4. **Provide Deletion Certificate:** Within 60 days, QOrium signs a document certifying deletion and listing any retained data (with justification).

### 11.3 Survival

Sections 6 (Security), 8 (Breach Notification), 10 (Audit), and 11 (Term & Termination) survive termination indefinitely.

---

## 12. MODIFICATIONS & AMENDMENTS

This DPA may be amended by written agreement signed by both parties. Routine changes (sub-processor additions, security procedure updates) may be notified per Section 4.2; substantive changes (residency, new processing purposes) require signed amendment.

If Customer does not agree to a material change, Customer may terminate the affected Order Form without penalty within **30 days** of amendment notice.

---

## SIGNATURE BLOCKS

**QOrium Technology Private Limited**

By: ___________________________________
Name: ___________________________________
Title: ___________________________________
Date: ___________________________________

**`[CUSTOMER LEGAL NAME]`**

By: ___________________________________
Name: ___________________________________
Title: ___________________________________
Date: ___________________________________

---

---

## APPENDIX: DRAFTING NOTES TO COUNSEL

Counsel should review and confirm the following items before finalizing:

1. **DPDPA Significant Data Fiduciary Threshold** — Clarify whether QOrium will meet the SDF threshold based on projected Year 1–2 data volumes. If yes, additional compliance obligations apply (§4(7)–(12) mandatory audit, privacy by design, breach handling). If no, simplified regime applies. Recommend proactive SDF compliance (better safe than sorry).

2. **Sub-Processor Sub-Contracting Depth** — Clause 4.2 permits Sub-Processors to engage their own Sub-Processors only with approval. Verify this is practical given Anthropic's and AWS's own sub-contracting chains. Consider allowing Anthropic-defined sub-contractors automatically (major provider exemption).

3. **Sensitive Personal Data Consent** — Section 2.2 prohibits processing Sensitive Data without explicit consent. Verify this is consistent with Customer's expected use cases. If Customers will provide protected-status data (gender, caste, disability accommodations), pre-draft consent language for inclusion in Customer onboarding.

4. **AI Model Training Consent** — Section 3.3 requires separate consent for any model fine-tuning. This is aligned with Constitution SO-19 but may be restrictive if QOrium later wants to offer a "train-on-my-data" option. Consider pre-drafting a Model Training Addendum template.

5. **EU Residency Migration Timeline** — Section 5.2 commits to EU residency by Month 6. Verify this is realistic with infrastructure planning (Hostinger EU options, Cloudflare regional setup). If timeline is uncertain, soften language to "target Month 6; notify Customer if delayed."

6. **SCCs & Adequacy Decisions** — Section 5.4 assumes SCCs are the mechanism for US transfers. Post-Schrems II, verify that SCCs alone are sufficient or whether supplementary measures (data minimization, pseudonymization, encryption controls) are needed. Recommend naming specific supplementary measures in Schedule 1.

7. **GDPR Article 28 Controller-Processor Distinction** — This DPA assumes QOrium is primarily a Processor, but certain functions (auto-deletion, breach notification to authorities) might make QOrium a joint Controller in some scenarios. Counsel should clarify: Is QOrium ever a joint Controller? If yes, amend roles language and add joint-controller obligations.

8. **Data Subject Rights & Operational Burden** — Section 7 imposes 14–30 day SLAs for access/erasure requests. Verify QOrium's operational capability to meet these across 1000+ customers and millions of records. If burden is high, consider requesting Customer to handle some requests directly (Customer is Data Fiduciary).

9. **Breach Notification Regulatory Trigger** — Section 8.3 assumes "material risk of harm" triggers notification. DPDPA §8(1) rules (pending) may refine this. Once rules are published, update threshold language.

10. **Legal Holds & Data Retention Conflicts** — Section 11.2 allows QOrium to retain data if "legally required." Define this: Does it include litigation holds? Tax records? Employment law (staff misconduct investigations)? Add a sub-clause allowing Customer to be notified and approve extended retention.

---

**END OF DATA PROCESSING ADDENDUM TEMPLATE v0.1**
