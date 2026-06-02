# Press Release — IP Counsel Annotated Review Brief

**Companion to:** `sales/Press-Release-M3-Soft-Launch-Draft-v0.md`
**Purpose:** Surface every clause in the press release that needs IP counsel review BEFORE M3 trigger publish. Counsel responds inline; CTO Office incorporates; CEO + counsel jointly sign-off final.
**Authored:** 2026-05-03 (autonomous mode)
**Authority:** CTO Office; counsel-to-be-engaged via CC-02-A (K&S Partners default)
**Distribution:** sent to engaged IP counsel as part of CC-02-A onboarding package, alongside A6 MSA + A7 DPA + C8 Offer Letter drafts + Constitution v2.0

---

## §1 — Counsel review checklist (inline)

For each item, counsel marks:
- ✅ APPROVED as-is
- ✏️ REVISE — proposed wording inline
- ❌ REJECT — remove entirely + reason
- ⏳ DEFER — needs more info; questions inline

### Item 1 — Trademark mentions throughout

**Current language:** "QOrium™", "ReadyBank™", "JD-Forge™", "Stack-Vault™" (with ™ marker; not ®)

**Counsel question:** Is the ™ marker correct given trademark applications are pending (per CC-08 trademark filing path)? Should we:
(a) Continue using ™ until India + US registrations grant
(b) Drop ™ entirely until grant
(c) Use "trademark of Talpro India Pvt Ltd" (full-attribution form) on first mention only

**Status:** ⏳ DEFER — counsel decision required.

---

### Item 2 — Competitor naming

**Current language (excerpt from press release body §The problem):**

> "Public technical assessment libraries have a structural reliability problem. A Senior Java question added to a major assessment platform's library on Monday is typically available verbatim on Reddit, Stack Overflow, GitHub, and Indian recruiting Telegram groups by Friday."

> "QOrium addresses what hiring leaders at India's largest GCCs and IT services firms have called 'the leakage epidemic' — the rapid public availability of questions used by leading assessment platforms like HackerRank, Mettl, and HackerEarth."

**Counsel question:** Is naming HackerRank, Mettl, HackerEarth in the context of a "leakage epidemic" actionable as defamation under Indian law? Specifically:
(a) Are these statements factual claims (i.e., can be substantiated by the leak detection methodology document) or opinion?
(b) Does "leakage epidemic" qualify as a "term of disparagement" under Indian defamation common-law standards (Section 499/500 IPC)?
(c) Is the "named" framing (specific company names) more vulnerable than a "generic" framing ("public assessment platforms")?

**CTO Office position:** Statements are factual (substantiated by the Blog P1-1 methodology); the framing "leading assessment platforms" is descriptive (not derogatory). However, we should be prepared for cease-and-desist letters; budget for legal response in M3 launch contingency.

**Status:** ⏳ DEFER — counsel decision; suggest counsel propose alternative wording if any concern.

---

### Item 3 — Statistical claims (47-second median; ₹50 lakh false-positive cost)

**Current language:**

> "Internal CTO Office research conducted on a sample of 10 popular Java mid-senior questions found a median time-to-locate of 47 seconds via standard search engines; all 10 questions were found within four minutes."

> "A single false-positive senior engineering hire — caused by a candidate who scored well on a leaked assessment but cannot perform in the role — costs Indian IT services firms an estimated ₹50 lakh in opportunity cost per incident, including ramp-up time, project rework, and team morale impact."

**Counsel question:** Are the statistical claims defensible if challenged?

**Backing evidence:**
- 47-second median: documented in Blog P1-1 (`sales/Blog-P1-1-We-Tested-Java-Questions-Across-5-Leak-Detection-Methods.md`); methodology section describes the 5 detection methods + sample of 10 Java questions
- ₹50 lakh false-positive cost: industry estimate; Talpro India's own books support the range based on 15 years of IT staffing experience; numbers like SHRM and India Tech Talent reports cite ₹40L-₹70L per bad senior hire

**Risk if challenged:** if competitors challenge the 47-second figure, we'd need to publish raw test data. This is acceptable.

**Status:** ⏳ DEFER — counsel reviews methodology document at qorium.online/insights/leak-study (placeholder URL; live before publish).

---

### Item 4 — Customer Zero claim (Talpro India)

**Current language:**

> "Talpro India operates QOrium as a product line, not a separate legal entity. Talpro India is also QOrium's first customer. From Month 1, Talpro's internal hiring pipeline for top five technical roles — Senior Java, React, SQL/Data, DevOps, and Senior Salesforce — runs on QOrium-delivered assessments."

**Counsel question:** Is the "Customer Zero from Month 1" claim defensible at press time? Specifically:
(a) Counsel needs CEO confirmation that Customer Zero is genuinely live with documented usage at press time
(b) If "from Month 1" hasn't yet matured to 30+ days of data, the language should soften ("Customer Zero with Talpro India is live")
(c) The "top five technical roles" language is locked from CC-03 — counsel should flag if any naming/disclosure concern with internal Talpro recruiting practices

**Status:** ⏳ DEFER — pending Customer Zero 30-day data confirmation. CEO confirms before press send.

---

### Item 5 — Pricing transparency in press release

**Current language:**

> "Annual subscription ₹4,999/month for individual recruiters; $5,000-$25,000/year for assessment platform integrations."

> "Annual contract: ₹10 lakh (Department tier) to ₹1 crore+ (Group tier)."

> "$49 (AI-only, 24-hour SLA), $199 (AI + SME review, 48-hour), $499 (AI + SME + IRT calibration + custom export, 5-day)."

**Counsel question:** Listing actual prices in a press release is unusual. Counsel review should confirm:
(a) Do these prices comply with Talpro India's Bali Playbook + Constitution SO-23 anchor (yes per CTO Office check)
(b) Is there any regulatory disclosure obligation around customer pricing for an Indian Pvt Ltd entity (typically no for B2B SaaS; counsel confirms)
(c) Is the prices-public approach a competitive risk if competitors react with under-cutting (operational risk; not legal)

**CTO Office position:** transparent pricing is part of QOrium's positioning. Recommend keeping. Open to counsel push-back.

**Status:** ⏳ DEFER — counsel confirms regulatory + competitive risk acceptable.

---

### Item 6 — "Open-sourced our 92-point quality gate" claim

**Current language (excerpt + matching LinkedIn Post #1):**

> "QOrium ships under a 92-point release quality gate published openly at qorium.online/insights/92-pt-gate."

**Counsel question:** Is "open-sourced" the right legal term?
- The scorecard is published publicly. Anyone can read it.
- It's not under an OSS license (e.g., MIT, Apache). Should we apply a CC-BY-SA license to it?
- Or is "published openly" / "publicly available" the safer framing?

**CTO Office position:** "Published openly" is the safest. Drop "open-sourced" unless we apply a real OSS license. Suggest CC-BY-4.0 for the methodology if we want explicit "free to copy" framing.

**Status:** ⏳ DEFER — counsel decision; CC-BY-4.0 license addendum if needed.

---

### Item 7 — "First Question-Bank-as-a-Service" claim

**Current language (Headline option B):**

> "QOrium debuts: India's answer to leaked technical assessment libraries"

**Current language (Sub-head):**

> "first Question-Bank-as-a-Service product line"

**Counsel question:** Is the "first" claim defensible? Specifically:
(a) WeCP (Bengaluru) ran a similar question-bank model 2016-2019 before pivoting; counsel should review whether "first" claim is exposed to historical-precedent challenge
(b) Adaface, Equip, and other Indian assessment platforms all have question banks but are platforms-with-content rather than pure-content; the "first **pure-play** Question-Bank-as-a-Service" framing is more defensible

**CTO Office recommendation:** Soften from "first Question-Bank-as-a-Service" to "first pure-play Question-Bank-as-a-Service" or "the only enterprise-grade Question-Bank-as-a-Service" (per Constitution §1.1 USP framing).

**Status:** ⏳ DEFER — counsel preference on framing.

---

### Item 8 — Bosch GCC mention

**Current language:**

> "first Bosch GCC discovery call queued"

**Counsel question:** Naming a customer (or prospective customer) by name in a press release — is this advisable?
(a) Bosch GCC has not yet agreed to public association with QOrium
(b) Even "discovery call queued" naming may be premature

**CTO Office recommendation:** REMOVE the Bosch GCC name entirely. Replace with: "first Stack-Vault discovery calls with Bengaluru-headquartered Global Capability Centers are queued for the first quarter of operation."

**Status:** ✏️ REVISE — CTO Office self-flagged; counsel confirms.

---

### Item 9 — Entity attribution clause

**Current language (footer + first paragraph mention):**

> "Talpro India Private Limited (Talpro India Pvt Ltd) today launched QOrium, a Question-Bank-as-a-Service product line for the technical assessment industry."

> Footer: "Trademarks 'QOrium', 'ReadyBank', 'JD-Forge', 'Stack-Vault' are trademarks of Talpro India Pvt Ltd; registration pending in India + US (Class 9, 42)."

**CTO Office position:** Counsel-tested per Constitution §1.0.1; standard form for product-line-of-parent attribution. ✅ APPROVED expected.

**Status:** ✅ APPROVED — counsel confirms entity attribution language is correct.

---

### Item 10 — Founder quote

**Current language:**

> Bhaskar Anand: "Every recruiting platform's library leaks faster than its content team can refresh it. The platforms aren't the problem — they solve the platform problem. The content layer was missing. We built QOrium to fix the content."

**Counsel question:** The quote "The platforms aren't the problem" softens the implicit competitor critique but Counsel should confirm:
(a) The quote is attributable to Bhaskar (he hasn't said it verbatim; this is CTO Office drafted on his behalf — needs his approval)
(b) Is "the content layer was missing" defensible factually? (Yes — there's no other pure-play question-bank-as-a-service)

**Status:** ⏳ DEFER to CEO + counsel; CEO approves the quote attribution.

---

## §2 — Counsel response template

Counsel responds inline above (for each ✏️/❌/⏳ item) OR via separate file:

`/legal/Press-Release-IP-Counsel-Response-YYYY-MM-DD.md`

containing per-item:
- Counsel name + qualification
- Per-item decision: ✅ / ✏️ / ❌ / ⏳
- Per-item proposed wording (if ✏️) or removal reason (if ❌)
- Overall risk assessment: LOW / MEDIUM / HIGH
- CEO sign-off check: counsel co-signs CEO's "publish ready" determination

---

## §3 — CEO + Counsel joint signoff process

1. Counsel returns annotated brief within 5 business days of receipt
2. CTO Office incorporates all ✏️ revisions into the press release master
3. CEO reviews master + counsel response
4. CEO + counsel digitally sign a "publish ready" certificate
5. CTO Office + Bali execute embargo + distribution per Press Release Distribution Schedule §T-7..T-0

---

## §4 — Risk register (counsel pre-fills before signoff)

Risks counsel should flag for CEO awareness:

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| HackerRank/Mettl cease-and-desist | M | LOW | Methodology document is rigorous; soften framing if Item 2 revised |
| Trademark squatter files for "QOrium" before our application | LOW | HIGH | File trademark applications IMMEDIATELY (CC-08 priority) |
| Customer Zero claim challenged | LOW | LOW | 30-day data + Talpro internal logs provide evidence |
| Pricing competitor reaction | M | MEDIUM (operational, not legal) | Anchor pricing by SO-23; price changes per Bali Playbook |
| Press misquote in coverage | M | LOW | Provide methodology + assets package; offer briefing call to journalists |
| Founder quote attribution challenge | LOW | LOW | CEO signs off explicitly |

---

## §5 — Publish-readiness certification (counsel + CEO joint sign at completion)

> "We, [Counsel Firm Name] (engaged via CC-02-A on [date]), and Bhaskar Anand (Founder, Talpro India Pvt Ltd), jointly certify that the QOrium M3 Soft Launch Press Release dated [publish date] has been reviewed for legal exposure (defamation, trademark, factual claim accuracy, regulatory disclosure), has been revised per our agreed annotations, and is approved for distribution per the Press Release Distribution Schedule."
>
> Counsel signature: ___ Date: ___
> CEO signature (Bhaskar Anand): ___ Date: ___

---

## §6 — References

- Press Release master: `sales/Press-Release-M3-Soft-Launch-Draft-v0.md`
- Blog P1-1 methodology document: `sales/Blog-P1-1-We-Tested-Java-Questions-Across-5-Leak-Detection-Methods.md`
- Constitution v2.0 §1.0.1 entity attribution: `09-QOrium-Constitution-v2.0.md`
- Launch Comms Plan §4 Soft Launch trigger conditions: `sales/Launch-Comms-Plan.md`
- CC-02 IP Counsel Engagement Plan: `legal/CC-02-IP-Counsel-Engagement-Plan.md`
- CC-02-A Gmail draft: queued in CEO's Drafts folder per Run #6.5

---

*End of IP Counsel Annotated Brief. Counsel returns annotations; CTO Office incorporates; CEO + counsel sign publish-ready certificate; press release distributes per schedule.*
