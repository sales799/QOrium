# QOrium — SME Contractor Sourcing Plan v1.0

**Author:** CTO + CEO, Talpro Universe
**Audience:** SME Content Lead, Content Operations Manager (hire #2, #7), contractor managers, procurement
**Date:** May 2, 2026
**Status:** Operating-grade sourcing roadmap; channels ranked by expected CPA
**Related docs:** Blueprint v1.1 · CTO Architecture v1.0 · C7 Compensation Philosophy

---

## 1. Goal + Volume Targets

QOrium's content engine depends on a scaled, distributed network of Subject Matter Expert (SME) contractors to validate AI-authored questions. The network scales in three waves:

- **Wave 1 (M0–M3):** 30 SME contractors across 8–10 core domains
- **Wave 2 (M3–M6):** 100 SME contractors; add India-stack domain depth (SAP, Oracle, Salesforce, BFSI)
- **Wave 3 (M6–M12):** 250 SME contractors; add aptitude + psychometric authoring

By end of M12, the SME network is **self-sustaining** — high-quality contractors refer new contractors, quality bar is codified in rubrics, and the SME Content Lead can manage the network without CEO/CTO hands-on oversight.

---

## 2. Domain Coverage Targets (mapped to Blueprint Phase Gates)

### Wave 1 (M0–M3): Core Tech Stack

Target: 30 contractors, 8–10 contractors per major domain.

| Domain | Target # | Why | Key Roles/Skills |
|---|---|---|---|
| **Senior Java** | 10 | Backend volume; Java Spring is #1 tech stack in BFSI + enterprise | Spring, Transactions, Microservices, JVM tuning |
| **React/JavaScript** | 8 | Frontend core; JS/TS across full stack | React hooks, state mgmt, async patterns, performance |
| **SQL/Data** | 8 | Highest-demand skill across assessment platforms | Complex queries, optimization, data modeling |
| **DevOps/SRE** | 6 | Growing demand from GCCs; infrastructure as code | Kubernetes, Terraform, CI/CD, observability |
| **Salesforce** | 6 | GCC + enterprise focus; high-value assessments | Apex, SOQL, data model, Sales Cloud, Service Cloud |
| **Python** | 6 | Data + AI/ML roles; growing in startups | Pandas, Flask, async, testing patterns |

**Total Wave 1:** 44 contractors (we'll aim for 30 committed + 14 overflow / spill).

### Wave 2 (M3–M6): India-Stack + Backend Depth

Add domains tied to Blueprint §3.5 Wave 2 content goals.

| Domain | Target # | Why | Key Roles/Skills |
|---|---|---|---|
| **SAP ABAP** | 12 | Largest demand from GCCs (Bosch, Siemens, JPMC India); wave-specific priority | ABAP OO, webdynpro, BAPIs, data dictionary |
| **Oracle HCM** | 10 | HR + IT services hiring; enterprise focus | HCM Data Model, Fusion API, custom extensions |
| **Finacle/Flexcube** | 8 | BFSI core systems; niche expertise | Lending/deposits workflows, batch processing |
| **Embedded Automotive** | 6 | Bosch + automotive GCCs; specialized | AUTOSAR, MISRA-C, CAN protocols, ASPICE |
| **Salesforce (CPQ/Service)** | 6 | Expand beyond admin/dev basics | Salesforce CPQ, Service Cloud depth, flow builder |
| **Node.js/Express** | 6 | Backend JavaScript stack growing; gaps in Wave 1 coverage | Async, middleware, scaling patterns |
| **Aptitude/Psych authors** (contractor → FTE path) | 4 | Early hire #8 (I/O Psych FTE) trains these on numerical/verbal/abstract reasoning question authoring | Numerical reasoning, verbal, abstract, SJT design |

**Wave 2 total:** 52 new contractors (~82 cumulative by M6).

### Wave 3 (M6–M12): Psychometric + Advanced Formats

Tie to Blueprint §3.5 Wave 3 & 4 content goals.

| Domain | Target # | Why | Key Roles/Skills |
|---|---|---|---|
| **Aptitude/Numerical/Verbal** | 20 | Scale SJT + cognitive ability authoring; hire #8 (I/O Psych) leads training | Numerical reasoning, verbal logic, abstract reasoning, SJT scenarios |
| **AI Prompt Evaluation** | 15 | Wave 4 formats; authors expert at evaluating LLM output quality for AI-era assessment questions | ChatGPT/Claude prompt design, evaluation rubrics |
| **Case Study / Scenario** | 10 | Higher-complexity format; business context authoring | Case study design, business simulation scenarios |
| **AI-Collaboration Assessment** | 8 | Specialized format; authors who've worked on collaborative AI evaluation | AI pair-programming, co-pilot evaluation |

**Wave 3 total:** 53 new contractors (~135 cumulative by M12).

**Final network by M12:** 250+ contractors covering 20+ tech stacks + aptitude + psychometric domains.

---

## 3. Sourcing Channels (ranked by expected CPA)

All channels are **ranked by Customer Acquisition Cost (CPA)** — the effective cost to vet, onboard, and activate a contractor. CPA includes: time (in ₹/hour equivalent), success rate (% who complete vetting), and downstream utilization (% who complete ≥ 5 questions before churn).

### Channel 1: Talpro India Alumni Network (Lowest CPA ~₹2,000–5,000)

**Activation:** CEO + SME Content Lead directly reach out to ex-Talpro India staff (recruiters, trainers, engineers, QA specialists) who've moved to staffing firms, coaching institutes, or freelance.

**Volume target:** 40% of final network (100 contractors by M12) sourced this way.

**Why:** Warm relationship, brand trust, cultural fit, low friction. Talpro India network is ~500 people across India (Bengaluru, Hyderabad, Pune, NCR, Chennai); estimated 200–250 are senior enough for SME work.

**Outreach:** Personal WhatsApp → 15-min Zoom conversation (pitch is: "QOrium pays ₹500–₹2,000 per question; you review AI-drafted questions, we pay on approval; 5–10 hours/month to start, can grow"). No formal application.

**Vetting:** CV + 1 sample question authored in sandbox + 30-min call + first pilot batch (5 questions) at ₹2,500/batch.

**Timeline:** M1 onward; should land 10 by M2, 30 by M4.

### Channel 2: NIT/IIT Alumni Network (CPA ~₹3,000–8,000)

**Activation:** Bhaskar's personal network (IIT Bombay batch of 2001–2003) + LinkedIn alumni group + WhatsApp groups.

**Volume target:** 25% of network (62 contractors by M12).

**Why:** Tier-1 engineers; high quality bar; India-dense alumni network.

**Outreach:** LinkedIn message to "NIT/IIT alums" with keyword search: senior engineers who've gone independent or are coaching/content creators. Offer referral bonus: ₹15,000 per successful contractor (see Channel 6 referral bonus).

**Vetting:** Same as Talpro alumni.

**Timeline:** M2 onward; 5 by M3, 20 by M6.

### Channel 3: Topmate / Mentor.com / GrowthSchool (CPA ~₹4,000–12,000)

**Activation:** Scout platforms where ex-engineers monetize as mentors/coaches.

**Volume target:** 15% of network (38 contractors by M12).

**Why:** Mentors are already thinking of themselves as educators; transition to SME authoring is natural. Platform has vetting, reviews, payment infra built-in.

**Outreach:** Direct message on Topmate to mentors offering "Java Spring" / "React" / "SQL" mentorships in India. Pitch: higher-per-hour rate (₹3,000–5,000 per question vs ₹100–200/hour mentoring).

**Vetting:** Topmate review history = pre-vetting; still do sample question + 30-min call.

**Timeline:** M3 onward; steady stream.

### Channel 4: Hashnode / Dev.to / Medium Tech-Blogger Outreach (CPA ~₹3,000–8,000)

**Activation:** Scout technical bloggers on Hashnode, Dev.to, Medium who write tutorials, deep-dives on niche topics (ABAP, Finacle, SAP HCM, embedded systems).

**Volume target:** 10% of network (25 contractors by M12); Wave 2 dominant (India-stack experts).

**Why:** These bloggers have already written 10–20 technical articles; proof of expertise + writing clarity.

**Outreach:** Email or Twitter DM: "Your article on [SAP ABAP transaction handling] was excellent. QOrium is building a question bank; we pay ₹1,500–₹3,000 per validated question. Interested?" Include: sample question, timeframe (5–10 hrs/month to start), and link to apply.

**Vetting:** Portfolio (blog posts) = pre-vetting; sample question + call.

**Timeline:** M3 onward; expect 1–2/week inbound.

### Channel 5: LinkedIn Boolean Search + CTO-Office Cold Templates (CPA ~₹6,000–15,000)

**Activation:** SME Content Lead (or future Content Ops Manager) runs LinkedIn searches with Boolean strings. Templates are crafted by CTO Office.

**Example search strings:**

```
"Senior Engineer" AND (Java OR Spring) AND India AND (independent OR freelance OR "looking for")
"Staff Engineer" AND "Data Engineer" AND ("Bengaluru" OR "Hyderabad") AND -"hiring managers"
(ABAP OR "SAP ABAP") AND (Bangalore OR Pune OR Hyderabad) AND (5+ OR 6+ OR 7+ OR 8+) years
```

**Volume target:** 7–10% of network (20 contractors by M12).

**Why:** Long tail; low volume but high quality (passive candidates + strong passive.

**Outreach:** Templated InMail or LinkedIn message (CTO writes 3 variants; Content Lead personalizes the first line and sends):

> Hi [Name], saw your background in [Domain]. QOrium is building the world's question bank for hiring — we pair AI drafting with SME validation. If you're open to 5–10 hours/month earning ₹500–₹2K per question, let's chat. [Link to apply].

**Vetting:** Same as above.

**Timeline:** M4 onward; ongoing sourcing.

### Channel 6: Referrals from First 5–10 SME Hires (CPA ~₹1,500; includes bonus)

**Activation:** Once 5–10 SMEs are active and completing questions, offer referral bonus: **₹15,000 per successful referral** (contractor completes vetting + 5 pilot questions).

**Volume target:** 20–25% of network (50–62 contractors by M12); increasing percentage as network grows.

**Why:** Best predictor of quality (SME referral = implicit quality endorsement). Self-sustaining virality.

**Outreach:** Email: "Refer a senior [Java/React/ABAP] engineer. When they complete vetting + 5 questions, you both get ₹15K." Include referral link, FAQ, and timeline.

**Timeline:** M3 onward; network effect should accelerate by M6.

---

## 4. Vetting Protocol (standardized, repeatable)

Every contractor — regardless of channel — passes the same gate:

### Gate 1: CV Review (async; 24 hours)

**Action:** SME Content Lead or freelance reviewer checks CV for:
- 5+ years experience in the target domain
- Evidence of technical depth (job titles, certifications, portfolio links)
- India-based or remote-ready (timezone compatible with IST)

**Pass/fail:** Reject if not meeting 5+ years or unclear domain depth. Otherwise, advance.

### Gate 2: Sample Question Authored in Sandbox (async; 5–7 days)

**Action:** Contractor given sandbox access (Google Doc or Notion template) + 2 reference questions from QOrium's library. Task: author ONE question in the target domain, same format + rigor.

**Evaluation rubric (100 points):**
- Technical correctness (30 pts): Answer is accurate; test cases cover edge cases
- Clarity + ambiguity (25 pts): No reasonable misinterpretation of the question; distractors are plausible
- Bias + edge cases (20 pts): No gendered/regional/cultural assumptions; covers boundary conditions
- Formatting (15 pts): Follows template; proper syntax/structure
- Leak risk (10 pts): Doesn't directly copy public resources (GeeksforGeeks, LeetCode, etc.)

**Pass/fail threshold:** 75+ pts → advance to call. <75 → send feedback ("resubmit in 1 week if interested") or reject.

### Gate 3: 30-min Video Call (sync; schedule within 2 weeks)

**Action:** SME Content Lead or I/O Psych contractor does structured interview:
- Confirm domain expertise (ask 2–3 hard technical questions specific to their claimed stack)
- Assess communication + teaching ability (ask: "Walk me through your answer to the sample question")
- Confirm availability (5–10 hours/month to start; willing to grow?)
- Set expectations (payment model, turnaround, quality bar, NDA)

**Pass/fail:** Advance if confident they can handle 5–10 questions/month without hand-holding. Veto if unclear on quality or communication.

### Gate 4: First Paid Pilot Batch (5–10 questions; ₹2,500–₹5,000 depending on complexity)

**Action:** Contractor author + SME review 5–10 questions. Pay for the batch if 4/5+ pass internal quality gate (AI self-critique + spot-check by I/O Psych or SME Lead).

**Turnaround:** Contractor has 2 weeks to submit; 1 week for review + feedback + payment.

**Pass/fail:** If 4/5+ pass → contractor is "certified" and can take ongoing batches. If <4/5 pass → offer one resubmit, then sunset if second attempt fails.

**Timeline:** M1 start → should have 30 "certified" contractors by M3.

---

## 5. SME Commercials (per-question + reviewer pool bonus)

### Per-Question Rate (by complexity + domain)

| Format | Complexity | Typical Rate (₹) | Examples |
|---|---|---|---|
| MCQ | Easy | 500 | Beginner-level Java, SQL, general concepts |
| MCQ | Medium | 750 | Mid-level design questions, edge cases |
| MCQ | Hard | 1,000 | Expert-level system design, rare patterns |
| Coding (function) | Easy | 1,200 | Simple DSA, basic SQL queries |
| Coding (function) | Medium | 1,500 | LeetCode-style medium, real-world scenarios |
| Coding (function) | Hard | 2,000 | Hard DSA, complex system design, real-codebase context |
| SJT / Scenario | Medium | 1,200 | Behavioral, scenario-based (not auto-graded) |
| Case Study | Hard | 2,000 | Business case, multi-step analysis |
| Real-codebase task | Hard | 3,000+ | DevSkiller-style; author provides real repo context |

**Payment timing:** Upon SME Content Lead approval (typically 3–5 days after submission). Contractor invoices via Google Form → Razorpay invoice link (auto-generated).

### Reviewer Pool Inverted-Bonus Model (unique to QOrium)

**Hypothesis:** More SMEs reviewing the same question = higher quality feedback + faster validation cycle. Standard model is "one SME reviews"; we invert to "pool of 3–5 SMEs review, highest-quality feedback wins."

**Mechanic:**
- When a question goes to "SME Review" stage (Stage 4 of Content Engine), it's sent to a pool of 3 related-domain SMEs
- Each SME submits feedback independently (don't see each other's reviews)
- I/O Psych contractor synthesizes feedback + merges decisions
- **Bonus pool:** Of the per-question budget, allocate 10% as "reviewer pool bonus." Divide equally among SMEs whose feedback materially changed the question (cited >2 times in final revision)

**Example:** Coding question budgeted at ₹1,500. Primary author gets ₹1,500. If 3 reviewers provide feedback, 10% bonus pool (₹150) is split: Reviewer A gets ₹75 (feedback used 3x), Reviewer B gets ₹50 (used 2x), Reviewer C gets ₹25 (used 1x). Authors + reviewers all earn more.

**Benefit:** Contractors want to review (earn bonus). Better-quality reviews accelerate validation. Scales the SME network without exploding headcount.

**Cost envelope:** Reviewer pool bonus adds ~5–8% to content production cost (₹500–₹750 per question) but accelerates M2–M4 ramp significantly.

---

## 6. Outreach Email Templates (3 variants)

### Template 1: Talpro Alumni Warm

Subject: QOrium — Talpro's new venture. You'd be perfect.

> Hi [Name],
>
> Quick note — Bhaskar's started QOrium at Talpro Universe, a question bank for hiring assessments. You remember how staffing is all about signal quality? QOrium fixes the leaked-test problem.
>
> We're building a network of senior [domain] engineers to review AI-drafted questions — ₹500–₹2,000 per question, 5–10 hours/month to start, pure remote.
>
> You'd be reviewing questions in [specific domain you're expert in]. Your call would land with customers like Bosch, JPMC India, large staffing firms within weeks.
>
> Interested in a 15-min Zoom this week?
>
> [Link to apply]
>
> Cheers,
> [Your name]
> QOrium · A Talpro Universe venture

### Template 2: Cold LinkedIn / Hashnode

Subject: Opportunity — Technical question authoring ($2,000+ per article)

> Hi [Name],
>
> Saw your [blog post / LinkedIn post / GitHub repo] on [specific technical topic]. Excellent depth.
>
> We're QOrium, building the world's question bank for hiring assessments. We pay senior engineers ₹1,500–₹2,500 per validated question to author + review assessment content in their specialty. 5–10 hours/month, fully remote.
>
> Your expertise in [domain] is exactly what we need. If interested, 15-min call?
>
> [Link to vetting signup]
>
> Cheers

### Template 3: Referral Intro

Subject: Referral bonus opportunity — bring a senior engineer

> Hi [Existing SME Name],
>
> You've done great work on questions [dates/topic]. We want to scale our SME network.
>
> Know a senior [domain] engineer who'd review questions like you do? **We pay ₹15,000 referral bonus** when they complete vetting + 5 pilot questions. You both earn.
>
> [Referral link]
>
> Spread the word!
>
> Cheers

---

## 7. Tracking Spreadsheet Seed

Central tracker (Google Sheets) to monitor all 250+ contractors. Replicate this schema:

| Column | Type | Purpose |
|---|---|---|
| Name | Text | Contractor name |
| Domain | Dropdown | Primary expertise (Java, React, SAP ABAP, etc.) |
| Email | Email | Primary contact |
| WhatsApp | Phone | For quick coordination |
| Source | Dropdown | How we found them (Talpro alumni, NIT network, Topmate, LinkedIn, Referral, etc.) |
| Status | Dropdown | Sourced / Vetting gate 1 / Gate 2 / Gate 3 / Gate 4 (pilot) / Certified / Inactive / Churned |
| Vetted Date | Date | When they passed gate 4 |
| Batches Completed | Number | # of paid batches they've authored |
| Quality Score (avg) | Number | 0–100; aggregated from gate 4 + subsequent batches |
| Total ₹ Paid to Date | Currency | Cumulative earnings |
| Last Active | Date | Last batch submitted or reviewed |
| Notes | Text | Feedback, strengths, specialties, known issues |
| Churn Risk | Dropdown | Green / Yellow / Red (based on: inactivity >30 days = yellow, >60 days = red) |

**Monthly metrics rolled up from tracker:**

- Total contractors (filtered by Status = "Certified")
- Monthly batch throughput (sum of "Batches Completed" last 30 days)
- Average cost per validated question (Total ₹ Paid / Questions delivered)
- Churn rate (Churned / Total in month)
- Quality (% of batches passing gate with 4/5+ questions)

---

## 8. Risks (3 major risks + mitigation)

### Risk 1: Contractor Flake Rate

**Description:** Contractors pass vetting, get certified, then submit low-quality first batch or ghost after gate 4.

**Probability:** Medium (likely 30–50% of certified contractors become inactive in M1–M2).

**Mitigation:**
- Gate 4 pilot batch is the real test; pay only on approval (no upfront cost)
- Monthly check-in email from SME Content Lead to inactive contractors (>7 days without submission) asking for status
- Implement "cold start" logic: if a contractor is inactive >30 days, remove them from auto-invite queue; require re-engagement conversation to reactivate
- Offer "batch credits" (prepay ₹5,000 for 5 questions to ensure commitment)

### Risk 2: Quality Variance Bottleneck at SME Lead

**Description:** 100+ contractors creating questions, but SME Content Lead is the bottleneck for gate 4 review. Turnaround > 2 weeks → contractor frustration → churn.

**Probability:** High (single-person bottleneck is classic scaling failure).

**Mitigation:**
- Hire Content Ops Manager (hire #7, M7) whose ONLY job is contractor QA + batch review
- Implement async batch review: instead of SME Lead reviewing every question, use I/O Psych contractor (hire #5, M4) for statistical sampling + rubric-based gate 4 scoring
- Reviewer pool inverted-bonus model (section 5) → delegate review load to certified contractors themselves
- Establish SLA: gate 4 feedback within 5 days of submission (enforced by calendar blocks)

### Risk 3: IP + Confidentiality Breach via Contractor

**Description:** Contractor leaks customer-specific questions (e.g., Bosch Stack-Vault questions) or publishes QOrium proprietary content on GitHub.

**Probability:** Low, but high impact.

**Mitigation:**
- **All contractors sign MSA** (A6 standard, drafted by legal counsel by M1) covering:
  - IP assignment (all questions are QOrium IP)
  - Confidentiality + non-disclosure (1-year post-engagement)
  - Non-compete (cannot author assessment content for competitors for 1 year)
  - Clawback clause (if leaked, contractor is liable for damages)
- GitHub scan: weekly check of public repos for leaked questions (via Serper.dev + text search)
- Watermark all Stack-Vault questions shared with contractors (so leaks are attributable)
- Contractor onboarding includes 1-page "IP Policy" summary — acknowledge in email before first batch

---

## 9. Tracking Spreadsheet Link + Data Governance

**Primary source of truth:** `QOrium-SME-Contractor-Network.xlsx` (stored in Talpro Universe shared drive).

**Access:** SME Content Lead (hire #2) + Content Ops Manager (hire #7) + CEO (read-only). Read-only for CTO (quarterly snapshot).

**Monthly sync:** Content Ops Manager updates tracker by 5th of each month. CEO + CTO review in weekly Monday pipeline meeting.

**Archival:** Historical data (completed contractors) migrated to `SME-Network-Archive.xlsx` annually.

---

## 10. Onboarding Sequence (once contractor is certified, before first paid batch)

1. **Email: NDA + MSA** — Contractor reviews, e-signs via DocuSign
2. **Email: Zoom link to kick-off call** (30 min with SME Content Lead)
   - Walk through actual sample questions + quality rubric
   - Assign first batch (5–10 questions)
   - Set deadline (2 weeks)
   - Confirm payment method (Razorpay invoice)
3. **Sandbox access:** Google Doc + Notion template + Reference questions
4. **Slack channel add:** Private QOrium-SMEs workspace (async questions, issue escalation)
5. **First batch submission → review → approval → payment**

---

*End of C6 — SME Contractor Sourcing Plan v1.0. Next: B1 VPS Capacity and Topology Plan.*
