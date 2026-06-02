# MASTER SERVICES AGREEMENT (MSA)
## QOrium — CTO-Office Working Draft v0.1

**STATUS: CTO-Office working draft v0.1.** This document is NOT a legal opinion. Final language must be set and signed by qualified Indian-bar IP/commercial counsel. CTO Office authored it so counsel begins from a populated outline rather than a blank page. Bracketed `[…]` markers indicate counsel-decisions or company-specific values. Ratification by CEO + Counsel required before any third-party use.

---

## 1. PARTIES & EFFECTIVE DATE

This Master Services Agreement ("**MSA**") is entered into as of `[DD MMM YYYY]` ("**Effective Date**") between:

**QOrium Technology Private Limited**, a private company incorporated under the Companies Act, 2013, registered at `[REGISTERED ADDRESS]`, Bengaluru, India ("**QOrium**" or "**Provider**"), and

**`[CUSTOMER LEGAL NAME]`**, a `[JURISDICTION]` entity registered at `[CUSTOMER ADDRESS]` ("**Customer**" or "**Licensee**").

---

## 2. DEFINITIONS

### 2.1 Service
The "**Service**" means the delivery of Question Bank content, Job-Description-derived questions, and Stack-Vault libraries, plus ancillary services (API access, bulk export, widget delivery, white-label authoring) as described in Section 3 and further detailed in individual Order Forms.

### 2.2 Subscription
A "**Subscription**" is a recurring monthly or annual subscription to one or more SKUs, priced and metered as specified in the applicable Order Form and subject to renewal per Section 5.2.

### 2.3 Question Bank Item
A "**Question Bank Item**" or "**Question**" is any individual assessment question in any format (MCQ, MSQ, coding challenge, SQL, SJT, simulation, etc.) authored and/or validated by QOrium and made available to Customer under this MSA.

### 2.4 Stack-Vault Pack
A "**Stack-Vault Pack**" is a customer-exclusive, confidential library of assessment questions, watermarked and contractually exclusive to one Customer, organized by role-graph nodes and technology stack. Stack-Vault Packs are not shared with any other customer. [Ref: Constitution SO-10]

### 2.5 ReadyBank API
The "**ReadyBank API**" is the REST API service providing programmatic access to QOrium's shared question library, including endpoints for search, fetch, pack generation, and export. Latency SLO: <200ms p95 for question retrieval; <2s for pack generation.

### 2.6 JD-Forge Output
"**JD-Forge Output**" means assessment questions auto-generated in real-time in response to a Job Description submitted by Customer. Each JD-Forge request returns an ephemeral pack of questions scoped to the JD's specified skills and difficulty. Output is not stored long-term in QOrium's shared library.

### 2.7 Confidential Information
"**Confidential Information**" means any non-public information disclosed by one party to the other (including but not limited to: question content, internal metadata, customer lists, pricing, performance data, technical specifications) that is marked confidential or would reasonably be understood to be confidential. Excludes publicly available information or information independently developed without reference to the disclosing party's Confidential Information.

### 2.8 Customer Data
"**Customer Data**" means any personal data or candidate-attributable information uploaded by Customer (resumes, candidate names, assessment responses, behavioral telemetry) as part of a Stack-Vault white-label or SME-review engagement. QOrium processes Customer Data only as a data processor per the DPA (Section 14).

### 2.9 Anonymized Data
"**Anonymized Data**" means Customer Data from which all directly identifying information (names, email addresses, IP addresses, device fingerprints) has been removed and which has undergone irreversible de-identification. Anonymized Data may be used by QOrium for analytics, performance monitoring, and anti-leak forensics without requiring Customer consent.

### 2.10 Intellectual Property (IP)
- **QOrium IP** includes: the Content Engine pipeline, question authoring prompts, validation rubrics, watermarking algorithms, anti-leak forensics methodology, role-graph taxonomy, and all Question Bank Items authored by QOrium.
- **Customer IP** includes: Customer-supplied Job Descriptions, performance data, candidate-attributable metadata, and any custom specifications for Stack-Vault.
- **Derivative Works** (AI-generated questions or variants) are owned by QOrium but subject to per-SKU license grants in Section 7.

### 2.11 Affiliate
An "**Affiliate**" means any entity that, directly or indirectly, controls, is controlled by, or is under common control with a party (control = ownership of >50% voting equity or power to direct management).

---

## 3. SERVICE DESCRIPTION BY SKU

### 3.1 SKU 1: ReadyBank (Shared Question Library)

**ReadyBank** is QOrium's shared, multi-tenant question library organized by role-graph taxonomy (role, seniority, technology stack, domain, geography). Questions are authored once and sold non-exclusively to multiple Customers.

**Delivery Modes:**
- **Mode A:** REST API with SDKs (Node.js, Python, Java, Go in Year 1; Ruby, .NET Year 2)
- **Mode B:** Bulk CSV/JSON/XLSX export in platform-native formats (HackerRank, Mettl, Codility, HackerEarth, generic)
- **Mode C:** Embedded JavaScript widget (staffing firms, training institutes)

**Coverage Wave 1 (Months 1–3):** 5,000+ questions; 20+ programming languages; roles: Backend (Java/Python/Node), Frontend (React), Data (SQL/Python), DevOps.

**Cadence:** Quarterly refresh with new questions, replacement of deprecated items, semantic variants.

**IRT Scoring:** All ReadyBank items released to production include Item Response Theory (Rasch/2PL/3PL) difficulty calibration. [Ref: Constitution SO-21]

### 3.2 SKU 2: JD-Forge (On-Demand JD-Specific Generation)

**JD-Forge** generates assessment questions on demand based on a Job Description submitted by Customer. Each request produces an ephemeral pack of 10–30 questions scoped to the JD's skill requirements and specified difficulty distribution.

**Three Tiers:**

| Tier | Process | SLA | Use Case |
|---|---|---|---|
| **Standard** | AI generation only (no SME review); AI self-critique mandatory | 30 seconds end-to-end | High-volume, cost-sensitive drives |
| **Reviewed** | AI generation + async SME review (4-hour SLA) | 4 hours delivery | Quality-sensitive enterprises |
| **Enterprise** | AI generation + senior-SME review + I/O-psych validation + customer feedback integration | 24 hours | High-stakes hiring (exec, GCC leadership) |

**Pricing Model:** Per-JD generation fee (Standard $49; Reviewed $199; Enterprise $499) or monthly subscription tier ($499–$9,999 depending on monthly JD volume).

**IRT Scoring:** Standard tier excludes IRT (AI-only). Reviewed and Enterprise tiers include post-release calibration sampling.

**Non-Storage:** JD-Forge outputs are not permanently stored in QOrium's shared ReadyBank. After 90 days, pack metadata is archived; questions are not reused in other JD-Forge outputs or ReadyBank.

### 3.3 SKU 3: Stack-Vault (Exclusive Customer Library)

**Stack-Vault** is a customer-exclusive, IP-protected library of 50–500+ assessment questions tailored to one Customer's technology stack, hiring roles, and domain. Questions are authored specifically for Customer, watermarked per-customer variant, and contractually exclusive to that Customer. [Ref: Constitution SO-10]

**Three Tiers:**

| Tier | Scope | Refresh | Annual Price (INR) | Exclusive? |
|---|---|---|---|---|
| **Department** | 200 questions; 5 roles; 1 technology stack | Quarterly | ₹10L | Absolute |
| **Enterprise** | 500+ questions; 15–20 roles; 2–3 tech stacks | Quarterly | ₹40L | Absolute |
| **Group** (Year 2+) | 1,000+ questions; 50+ roles; group-wide stack | Quarterly | ₹1Cr+ | Absolute |

**Watermarking & Anti-Leak:** Every Stack-Vault variant is cryptographically watermarked with customer-specific identifiers (variable names, test case values derived from HMAC seeding, scenario character names). [Ref: CTO Architecture §7.3]

**Exclusive Guarantee:** Stack-Vault questions NEVER appear in ReadyBank, JD-Forge outputs to other customers, or any competing customer's Stack-Vault. Breach of exclusivity is grounds for immediate termination + damages.

**SME Validation:** Mandatory senior-SME review before release (different from ReadyBank's junior/mid-tier SMEs); ₹2,000–5,000 per question.

**Calibration:** Sample release to QOrium Reference Panel (paid candidates, 50–100 attempts per question) for IRT difficulty + discrimination estimation.

**Delivery:** API access, bulk export, or white-label hosted interface.

---

## 4. ORDER FORM MECHANISM

Each SKU purchased by Customer is documented in a separate **Order Form** ("**OF**"), executed as an exhibit to this MSA. An Order Form specifies:

- SKU name and tier (e.g., "ReadyBank Growth tier" or "Stack-Vault Enterprise")
- Pricing, payment terms, and currency (INR, USD, or other as agreed)
- Term (start date, duration, renewal terms)
- Volume commitments (if applicable: monthly API request limit, max questions per month, roles in scope)
- SLA targets and exclusions
- Support tier
- Data processing terms (if Customer Data is involved)

**Non-Binding Effect of Attachment:** If an Order Form conflicts with this MSA, the MSA prevails. Order Forms are binding only when executed by authorized representatives of both parties (email signature acceptable if prior course of dealing supports it).

**SKU Independence:** A Customer may subscribe to any combination of SKUs independently. E.g., Customer may use ReadyBank API (SKU 1) and JD-Forge Standard (SKU 2) in parallel, without requiring Stack-Vault (SKU 3).

---

## 5. TERM, RENEWAL & TERMINATION

### 5.1 Initial Term

The initial term ("**Initial Term**") of each Order Form begins on the date stated therein and continues for the period specified (typically 12 months for Subscriptions, or per-engagement for Stack-Vault).

### 5.2 Renewal

**ReadyBank & JD-Forge Subscriptions:**
- Auto-renew for successive 12-month terms unless either party provides 60 days' written notice of non-renewal prior to expiration.
- Pricing may increase by up to 10% per annum; notice of price change required 30 days in advance. Customer may terminate rather than accept >10% increase.

**Stack-Vault Packs:**
- Quarterly refresh cycles are bundled; 12-month term includes 4 refreshes.
- Renewal for additional 12-month term requires written agreement on scope, pricing, and technology stack evolution.

### 5.3 Termination for Cause

Either party may terminate an Order Form immediately upon written notice if:

1. The other party materially breaches this MSA or the Order Form and fails to cure within 30 days of written notice;
2. The other party becomes insolvent, bankrupt, or subject to receivership;
3. [For Stack-Vault only] Customer publicly discloses, leaks, or enables unauthorized access to Stack-Vault questions without QOrium's authorization. Immediate termination; no refund; indemnification clause triggered.

### 5.4 Termination for Convenience

Customer may terminate an Order Form for convenience with 90 days' written notice (ReadyBank/JD-Forge) or 180 days' notice (Stack-Vault). Fees paid for the notice period are non-refundable; prepaid fees for the terminated period (if any) are credited dollar-for-dollar against future services if Customer re-engages within 12 months.

### 5.5 Sunset Rights (ReadyBank)

Upon termination of a ReadyBank Subscription, Customer retains a **perpetual, royalty-free license** to use Question Bank Items already retrieved/exported during the active Subscription, for internal hiring purposes only. Questions are not redistributable; Customer may not sell, publish, or provide to third parties.

Upon termination of a Stack-Vault Pack, Customer's access to the Stack-Vault library terminates immediately. Customer may retain previously downloaded/exported questions for internal use under the same perpetual license, provided watermarking is preserved.

### 5.6 Effect of Termination

Upon termination:
- Customer's access to APIs and customer consoles ceases within 24 hours.
- Cached data on Customer's servers expires per the perpetual license terms above.
- Confidential Information is returned or destroyed per Section 10.2.
- Surviving obligations (Confidentiality, IP, Indemnification) continue as specified.

---

## 6. FEES, PAYMENT & TAXES

### 6.1 Fees

Fees for each Order Form are as specified in the Order Form and this MSA. QOrium's standard pricing tiers are:

**ReadyBank (annual):**
- Starter (10K questions/month, basic anti-leak): $50,000 USD
- Growth (50K questions/month, premium anti-leak): $150,000 USD
- Enterprise (unlimited, continuous anti-leak, custom rate limits): $500,000 USD+

**ReadyBank Recruiter Subscription (monthly, INR):**
- Solo (200 Q/month, 5 roles): ₹4,999
- Team (1,000 Q/month, 20 roles, widget): ₹14,999
- Agency (5,000 Q/month, unlimited roles): ₹49,999

**JD-Forge (per generation):**
- Standard: $49 per JD
- Reviewed: $199 per JD
- Enterprise: $499 per JD

**Stack-Vault (annual, INR, per the tier table in Section 3.3):**
- Department: ₹10L
- Enterprise: ₹40L
- Group: ₹1Cr+ (custom)

*[Counsel to confirm: these prices are illustrative and consistent with the Blueprint. Counsel should validate against the Constitution SO-11 pricing discipline and review for any anti-competitive concerns.]*

### 6.2 Payment Terms & Currency

**Default Payment Terms:** Net-30 from invoice date (invoice issued on Subscription commencement or Order Form execution).

**Currency:** Invoices are issued in INR for India-based Customers, USD for international Customers, or as otherwise agreed in writing.

**Late Fees:** Invoices not paid by due date accrue interest at 1.5% per month (18% per annum) or the maximum rate permitted by law, whichever is lower. Repeated late payment (>2 invoices >30 days late in a 12-month period) may trigger suspension of service per Section 5.3.

**GST & Taxes:** Prices exclude Goods and Services Tax (GST) and any other applicable taxes. Customer is responsible for withholding, sales tax, VAT, and other tax obligations in its jurisdiction. If Customer claims exemption from tax, it must provide valid tax identification documentation (e.g., 80G certificate, GST registration exemption letter) prior to invoice.

### 6.3 Annual True-Up

For volume-metered SKUs (ReadyBank API with overage charges), QOrium issues an annual true-up invoice reconciling actual usage against committed volume. True-up invoices are due within 30 days.

---

## 7. LICENSE GRANT BY SKU

### 7.1 ReadyBank (Non-Exclusive, Non-Transferable)

QOrium grants Customer a **non-exclusive, non-transferable, revocable, limited license** to:

- Access the ReadyBank API or bulk-export interface;
- Retrieve, download, and cache Question Bank Items for use in Customer's internal hiring assessments;
- Make integration copies necessary to deploy questions in Customer's assessment platform (if Customer is a platform provider like Mettl, HackerRank, etc.).

**Restrictions:**
- No sublicense, resale, or redistribution to third parties without prior written consent.
- No publication or public disclosure of questions.
- No reverse-engineering, decompilation, or attempts to extract underlying AI prompts or validation methodologies.
- No modification of questions except as necessary for platform integration (e.g., reformatting for HackerRank import) without consent.

### 7.2 JD-Forge (Limited, Per-Output License)

QOrium grants Customer a **limited, non-exclusive license** to use JD-Forge Output questions in Customer's hiring process for the specific Job Description submitted. The license is:

- **Scoped to the JD:** Questions may be used only for assessment of candidates against the specified JD and role.
- **Time-limited (per tier):** Standard tier: 90 days post-generation; Reviewed tier: 180 days; Enterprise tier: 365 days. After expiration, Customer must license-refresh (pay again) to continue using the pack.
- **Non-transferable:** Output is not sublicensable or assignable to other business units, entities, or third parties.

### 7.3 Stack-Vault (Exclusive, Perpetual Within Scope)

QOrium grants Customer an **exclusive, perpetual, transferable (within Customer's entity only) license** to the Stack-Vault Pack, conditioned on:

- **Exclusivity:** Customer is the sole party licensed to use the Stack-Vault for its defined technology stack and role scope. QOrium will not license identical or substantially similar questions to any competitor or customer for [duration specified in the Order Form, typically 2–3 years or indefinitely].
- **Watermarking:** Questions retain QOrium's watermarks and copyright notices.
- **Scope:** Questions may be used internally for Customer's hiring, training, and talent assessment. Resale, syndication, or publication without QOrium's consent is prohibited.
- **Transfer:** Upon acquisition, merger, or reorganization, Customer may transfer the Stack-Vault license to the acquiring/merged entity, provided written notice is given within 30 days.

---

## 8. ANTI-LEAK OBLIGATIONS & AUDIT RIGHTS

### 8.1 Customer's Anti-Leak Obligation

Customer agrees to:

1. **Confidentiality:** Treat all Question Bank Items as QOrium's confidential information. Customer shall not publish, disclose, or make available questions to candidates, competitors, or the public.
2. **Access Control:** Restrict access to questions to authorized hiring managers and assessment administrators. Customer shall implement reasonable technical and organizational access controls.
3. **Notification:** Immediately notify QOrium (within 24 hours) of any suspected leak, unauthorized disclosure, or public appearance of Customer's questions online.
4. **Cooperation:** Assist QOrium in leak forensics, including providing audit logs, network traces, and candidate feedback.

### 8.2 QOrium's Anti-Leak Monitoring & Rotation

QOrium operates an **Anti-Leak Engine** that:

1. **Continuous Crawling:** Monitors public sources (GeeksforGeeks, LeetCode, GitHub, Reddit, Glassdoor, company-specific interview-experience sites) for leaked QOrium questions.
2. **Similarity Matching:** Uses semantic embedding similarity (threshold: 0.85+) to identify potential leaks.
3. **24-Hour Rotation (Critical Severity):** Upon detection of a Critical-severity leak (exact or near-exact match), QOrium regenerates a semantically-equivalent variant and auto-rotates affected customers within 24 hours. [Ref: Constitution SO-9]
4. **Leak Severity Classification:**
   - **Critical:** Exact or 95%+ semantic match; published with candidate answers or solution code
   - **High:** 90%–95% match; published but unlinked to answers
   - **Medium:** 85%–90% match; published in lesser-known forum
   - **Low:** 80%–85% match; similarity ambiguous due to common problem formulations

### 8.3 Watermarking (Stack-Vault)

For Stack-Vault Packs, QOrium embeds **multi-marker watermarks** to enable forensic attribution:

- **Marker 1:** Deterministic customer ID encoding in variable names, dataset constants, and scenario character names.
- **Marker 2:** HMAC-derived test case values (seeded from `HMAC(watermark_secret, question_uuid)`).
- **Marker 3:** Scenario-specific metadata embedded in problem descriptions or constraints.

Customer acknowledges that watermarks are present and may not be removed, obscured, or modified. Watermark removal is a material breach.

### 8.4 Audit Rights

QOrium reserves the right to:

1. **Log Review:** Request (no more than quarterly, with 10 business days' notice) access to Customer's API logs and export records to verify usage patterns and detect anomalies.
2. **Leak Analysis:** If a leak is detected in a Stack-Vault question, QOrium may analyze the watermark to identify the originating customer and may request Customer's cooperation in tracing the source within Customer's organization.
3. **Forensic Access:** For suspected breaches, QOrium may request (with legal process, if required) temporary audit access to Customer's assessment platform to identify the scope of disclosure.

Customer agrees that QOrium may engage third-party forensic specialists for leak investigation and that costs of investigation (if leak is confirmed Customer-attributable) may be passed to Customer.

### 8.5 Indemnification for Leaks

**If Customer causes or knowingly permits a leak:**
- Customer shall indemnify QOrium against all costs of rotation, customer notifications, and reputational damage (estimated at 20% of annual fees for the affected SKU, per leak).
- QOrium may terminate the Order Form immediately without refund.

**If the leak is QOrium-caused (e.g., QOrium's own security breach):**
- QOrium shall absorb rotation costs and shall offer affected Customers a 30% discount on next-term renewal.
- Liability capped at fees paid in the preceding 12 months (see Section 12.3).

---

## 9. INTELLECTUAL PROPERTY OWNERSHIP

### 9.1 QOrium IP

QOrium retains all ownership and rights in:

- All Question Bank Items authored by QOrium (including semantic variants, regenerations, and replacements).
- The Content Engine (7-stage pipeline, AI prompts, validation rubrics, anti-leak algorithms, role-graph taxonomy).
- All derivative data generated from question usage (difficulty estimates, discrimination indices, pass-rate analytics).
- All documentation, logos, and marketing materials of QOrium.

Customer acquires only the limited licenses specified in Section 7.

### 9.2 Customer IP

Customer retains all ownership in:

- Customer-supplied Job Descriptions, candidate data, and performance datasets.
- Customer's own assessment methodologies, hiring criteria, and candidate profiles.
- Any feedback or suggestions Customer provides regarding QOrium's content (see Section 9.3).

### 9.3 Feedback & Derivative Works

If Customer provides feedback on questions (e.g., "this question is ambiguous," "this distractor is unplausible"), QOrium may use that feedback to improve future questions without compensation to Customer. QOrium may also offer Customer the opportunity to co-author variants or specialized question packs for Stack-Vault, in which case the resulting questions are Stack-Vault IP (owned by QOrium, licensed exclusively to Customer).

### 9.4 Copyright & Attribution

All Question Bank Items include a copyright notice: "© QOrium Technology Private Limited. All rights reserved." Customer shall not remove, alter, or obscure copyright notices.

---

## 10. CONFIDENTIALITY

### 10.1 Mutual Obligation

Each party shall maintain the Confidential Information of the other party in strict confidence, using the same degree of care it uses for its own confidential information (but no less than reasonable care). Neither party shall disclose Confidential Information to third parties without prior written consent, except as necessary to:

- Perform its obligations under this MSA (with employees, contractors, and sub-processors bound by confidentiality obligations);
- Comply with legal process, court orders, or regulatory authority orders (with prior notice to the disclosing party to permit challenge, where legally permissible).

### 10.2 Exceptions

Confidential Information excludes:

- Information that is or becomes publicly available through no breach of this MSA.
- Information independently developed by the receiving party without reference to the disclosing party's Confidential Information (documented by contemporaneous records).
- Information rightfully received from a third party without confidentiality restrictions.

### 10.3 Termination & Return

Upon termination of this MSA, each party shall, at the other party's option:

- Return all Confidential Information to the disclosing party; or
- Destroy all Confidential Information and certify destruction in writing.

Professional advisors (lawyers, accountants) may retain one archival copy for legal compliance, subject to ongoing confidentiality obligations.

### 10.4 Duration

Confidentiality obligations survive termination of this MSA for **5 years post-termination**, except for information constituting trade secrets, which remains confidential indefinitely.

---

## 11. WARRANTIES & DISCLAIMERS

### 11.1 Mutual Representations

**QOrium represents & warrants:**

1. It is a validly incorporated company with authority to enter into this MSA.
2. This MSA is a valid, binding obligation.
3. QOrium has not knowingly incorporated leaked, copied, or infringing questions from public sources into the Question Bank. [Ref: CTO Architecture §8.3]
4. QOrium owns or has valid licenses for all IP necessary to provide the Services.

**Customer represents & warrants:**

1. It is a validly formed entity with authority to enter into this MSA.
2. Customer's use of the Service complies with all applicable laws (data protection, employment law, IP law) in its jurisdiction.
3. Customer shall not use the Service for any unlawful purpose.

### 11.2 NO WARRANTY — QUESTION CORRECTNESS

**QOrium does NOT warrant the correctness, accuracy, or suitability of Question Bank Items for any particular assessment, hiring decision, or purpose.** Specifically:

- Questions are authored by AI with human SME validation, but errors, ambiguities, or biases may exist.
- Questions are NOT designed as a substitute for professional assessment, psychometric evaluation, or professional judgment by qualified IO-psychologists.
- Customers hiring decisions based solely on QOrium questions, without human review or professional guidance, are at Customer's sole risk.
- QOrium is not liable for hiring errors, discrimination claims, adverse employment actions, or any harm resulting from use of questions.

**This is an essential term.** If Customer requires guarantees of question quality or assessment validity, Stack-Vault includes optional I/O-psychologist validation for an additional fee; or Customer should engage QOrium's professional services division for custom assessment design.

### 11.3 SLA for API Uptime

**ReadyBank API Availability SLA (by tier):**

| Tier | SLA Target | Acceptable Downtime per Month |
|---|---|---|
| Starter | 99.5% | ~3.6 hours |
| Growth | 99.9% | ~43 minutes |
| Enterprise | 99.95% | ~22 minutes |

**Measurement:** Uptime is measured by QOrium's automated health-check pings; scheduled maintenance (announced >48 hours in advance) excludes downtime calculations.

**Remedies for SLA Breach:**
- 30–59 min unplanned downtime in a month: 5% service credit.
- 60–119 min: 10% service credit.
- 120+ min: Customer may terminate the Order Form and receive pro-rata refund of fees for the affected month.

Service credits are issued as account credits against future invoices; they do not reduce the monthly invoice.

### 11.4 AI Plagiarism Detection Benchmark

QOrium publishes an AI plagiarism detection accuracy benchmark before launching any "Pro" tier or advanced content. The published figure is matched against industry benchmarks (e.g., HackerRank's stated 93% accuracy) and is available on QOrium's website and in customer-facing materials. [Ref: Constitution SO-22]

### 11.5 DISCLAIMER OF OTHER WARRANTIES

**EXCEPT AS EXPRESSLY STATED IN THIS MSA, QORIUM DISCLAIMS ALL OTHER WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, AND TITLE.** The Service is provided "as-is" and "as-available."

---

## 12. INDEMNIFICATION & LIMITATION OF LIABILITY

### 12.1 QOrium Indemnifies Customer

QOrium shall defend, indemnify, and hold harmless Customer from any third-party claims that:

1. The Question Bank Items, as provided by QOrium, infringe any copyright, patent, or trade secret of a third party; or
2. QOrium's Service violates any applicable law.

**Conditions:**
- Customer provides prompt written notice of the claim.
- QOrium has sole control of the defense and settlement (Customer may participate with counsel at QOrium's expense).
- Customer does not settle or admit liability without QOrium's consent.

**QOrium's remedies (at its option):**
- Obtain the right for Customer to continue using the affected content.
- Replace or modify the content to make it non-infringing.
- Terminate the affected Order Form and refund prepaid fees.

### 12.2 Customer Indemnifies QOrium

Customer shall defend, indemnify, and hold harmless QOrium from any third-party claims arising from:

1. Customer's use of the Service in violation of this MSA or applicable law.
2. Customer Data provided by Customer (if any) infringing a third party's rights.
3. Customer's breach of anti-leak obligations (Section 8.1).
4. Hiring or employment decisions made using QOrium's content.

### 12.3 Limitation of Liability

**CAP:** Neither party's total liability for any claim, loss, or damage under this MSA shall exceed the **total fees paid by Customer in the 12 months preceding the claim**, or $100,000 USD, whichever is greater.

**EXCLUSION:** Neither party shall be liable for:

- Indirect, incidental, consequential, special, or punitive damages (including lost profits, lost revenue, lost opportunity, reputational harm, even if advised of the possibility).
- Damages arising from Customer's hiring decisions, discrimination claims, employment-law violations, or candidate disputes.

**Exception:** The cap does not apply to:

- Breaches of confidentiality (Section 10) — full actual damages.
- Indemnification obligations (Section 12.1–12.2) — full third-party claim amounts.
- IP infringement indemnification — full cost of defense and settlement.

---

## 13. DATA PROTECTION

### 13.1 Data Processing Agreement

This MSA is supplemented by a separate **Data Processing Addendum (DPA)** executed as Exhibit B. The DPA governs the processing of Customer Data (if any) and sets forth:

- Roles (Customer as Data Fiduciary; QOrium as Data Processor or Significant Data Fiduciary).
- Processing purposes (assessment delivery, scoring, anti-cheat, anti-leak forensics, audit logging).
- Sub-processors and their treatment.
- Data residency and transfer mechanisms.
- Security measures (encryption, access control, breach notification).
- Data subject rights (access, correction, erasure).
- Termination and data return/deletion protocols.

The DPA is incorporated by reference; in case of conflict between the DPA and this MSA, the DPA prevails on data-protection matters.

### 13.2 DPDPA 2023 Compliance (India)

To the extent Customer Data is processed, QOrium complies with the **Digital Personal Data Protection Act, 2023** (DPDPA):

- **Data Fiduciary role:** Customer remains the Data Fiduciary; QOrium is a Data Processor or Significant Data Fiduciary (if processing at scale).
- **Data Subject Rights:** QOrium facilitates data subject rights (access, correction, erasure) within 14 days per DPDPA §11–15. Requests are channeled through Customer (as Data Fiduciary) or directly to QOrium's DPO.
- **DPO appointment:** QOrium appoints a Chief Data Officer (CDO) or external DPO to manage DPDPA compliance. Contact: `privacy@qorium.online`.

### 13.3 GDPR Compliance (EU/UK Customers)

For Customers or data subjects in the EU or UK:

- QOrium complies with **GDPR Articles 6 (lawfulness), 13–14 (transparency), 15–22 (data subject rights), 33–34 (breach notification)**.
- Data Processor Addendum (DPA §3) incorporates **Standard Contractual Clauses (SCCs)** for any international data transfers.
- Data subject rights (access, correction, erasure, etc.) have a **30-day SLA**.
- EU-customer data is stored in EU regions (Frankfurt or Netherlands by Year 2) unless Customer consents to India-based storage.

---

## 14. GOVERNANCE

### 14.1 Jurisdiction & Dispute Resolution

This MSA is governed by the **laws of India**, without regard to conflict-of-law principles.

**Dispute Resolution (exclusive remedy):**

1. **Good Faith Negotiation (30 days):** If a dispute arises, the parties' authorized representatives shall meet (in person or virtually) within 10 days and negotiate in good faith for 30 days.

2. **Arbitration (if negotiation fails):** If unresolved after 30 days, the dispute shall be resolved by **binding arbitration** under the **Indian Arbitration & Conciliation Act, 1996** (or equivalent law in Customer's jurisdiction):
   - **Seat of Arbitration:** Bengaluru, India
   - **Arbitrator(s):** One arbitrator (if claim value <₹50L) or three arbitrators (if >₹50L), selected per the Indian Arbitration Act.
   - **Language:** English
   - **Rules:** Indian Arbitration & Conciliation Act, 1996 (standard rules) or **Singapore International Arbitration Centre (SIAC)** Rules, at Customer's election (SIAC for foreign customers preferring international neutrality).

3. **Injunctive Relief:** Notwithstanding the above, either party may seek injunctive or equitable relief in the **Bengaluru High Court** (India) or competent courts of Customer's jurisdiction for breaches of confidentiality, IP infringement, or anti-leak obligations.

**Costs:** Each party bears its own legal costs unless arbitration award directs otherwise.

### 14.2 Severability

If any provision of this MSA is held invalid or unenforceable, the remaining provisions shall remain in effect, and the invalid provision shall be reformed to the minimum extent necessary to make it valid, preserving the parties' original intent.

### 14.3 Entire Agreement

This MSA, together with all Order Forms and the DPA (Exhibit B), constitutes the entire agreement between the parties regarding the subject matter and supersedes all prior discussions, proposals, and agreements, whether written or oral. No modification is valid unless in writing and signed by authorized representatives of both parties.

### 14.4 Assignment

Neither party may assign this MSA or any Order Form to a third party without the prior written consent of the other party (not to be unreasonably withheld). However:

- QOrium may assign to an Affiliate or successor (with 30 days' notice).
- Customer may assign to an Affiliate (with 30 days' notice) or to an acquiring company in a merger/acquisition (with 60 days' notice, unless emergency circumstances).

Unauthorized assignment is void.

### 14.5 Force Majeure

Neither party shall be liable for failure to perform due to **force majeure events** (acts of God, war, government action, pandemics, natural disasters, infrastructure failure beyond reasonable control) provided:

- The party provides prompt notice (within 10 days) of the event and impact.
- The party uses reasonable efforts to mitigate the impact and resume performance.
- The force majeure event is not caused by the party's negligence or breach.

Force majeure excuses performance for up to 90 days; if performance cannot resume by day 90, either party may terminate the affected Order Form without penalty.

### 14.6 Notices

All notices shall be in writing and delivered by:

- Email (with read-receipt requested)
- Courier or hand delivery
- Registered post (airmail, with return receipt requested)

**QOrium Notice Address:**
```
QOrium Technology Private Limited
[REGISTERED ADDRESS]
Bengaluru, India
Attn: CEO
Email: legal@qorium.online
```

**Customer Notice Address:** As specified in the applicable Order Form.

Notices are effective upon receipt or, if sent by email, when read-receipt is received.

---

## 15. SIGNATURE BLOCKS

**QOrium Technology Private Limited**

By: ___________________________________
Name: ___________________________________
Title: ___________________________________
Date: ___________________________________
Email: ___________________________________

**[CUSTOMER LEGAL NAME]**

By: ___________________________________
Name: ___________________________________
Title: ___________________________________
Date: ___________________________________
Email: ___________________________________

---

---

## APPENDIX: DRAFTING NOTES TO COUNSEL

Counsel should review and confirm the following items before finalizing:

1. **Registered Address & Legal Entity Name** — Confirm QOrium's registered address, GST ID, and exact legal name with the CTO Office / Company Secretary.

2. **Pricing Consistency with Constitution SO-11** — Validate that the pricing tiers in Section 6.1 comply with Constitution SO-11 (Stack-Vault Enterprise ≥₹35L, ReadyBank API band $5K–$25K).

3. **Stack-Vault Exclusivity Definition** — Counsel should clarify what "substantially similar" means in the context of Stack-Vault exclusivity. Does "identical or substantially similar" exclude different difficulty levels of the same topic? Or does it require full exclusivity on the topic? Consider precedent from SaaS contracts where customers license exclusive content.

4. **Anti-Leak Indemnification Scope** — Section 8.5 allocates leak costs to the party responsible. Counsel should review whether the 20% fee estimate for reputational damage is reasonable and defensible in Indian contract law, and whether "indemnification" might trigger strict-liability readings in other jurisdictions (consider adding "sole and exclusive remedy" language).

5. **Warranty Disclaimer for Question Correctness (§11.2)** — This is a strong disclaimer (no warranty of correctness). Counsel should confirm it is enforceable under Indian law (Consumer Protection Act 2019, goods/services definitions) and under international law (if Customer is outside India). Consider adding language that Customer must conduct its own IO-psych validation if desired.

6. **SLA Remedies Cap (§11.3)** — The SLA caps remedies at service credits only; Customer cannot claim direct damages. Counsel should confirm this "exclusive remedy" language is enforceable and consistent with Consumer Protection Act consumer-protection thresholds.

7. **Indemnification Caps (§12.3)** — The liability cap for indemnification excludes indemnification obligations themselves (full cost), but the carve-out language may conflict with the general cap. Counsel should clarify: does IP indemnification get a global cap, or is it uncapped? Typically uncapped for IP, but worth explicit confirmation.

8. **Data Processing Addendum (DPA) Exhibit B** — This MSA references the DPA but it is drafted separately (Document A7). Counsel should ensure that the DPA is executed *before* any Customer Data flows and that the roles (Data Fiduciary vs Processor vs Significant Data Fiduciary) are properly determined based on the actual engagement.

9. **GDPR Representation for Non-EU Customers** — Section 13.3 commits to GDPR for EU customers, but does not include an opt-out for non-EU customers who nonetheless have GDPR-subject data (e.g., a US company hiring EU candidates). Counsel should consider adding: "For any data subject within the EU/UK, GDPR applies regardless of Customer's location."

10. **Signature Authority & Entity Validation** — Counsel should establish a pre-signature verification process: confirm that signatories are authorized (Board resolution or officer certification from Customer's Company Secretary) and that the signatory's title matches their actual authority to bind the customer. Consider requiring notarization or corporate stamp for Stack-Vault (high-value) engagements.

---

**END OF MASTER SERVICES AGREEMENT TEMPLATE v0.1**
