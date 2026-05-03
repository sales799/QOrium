# Talpro Recruiter Onboarding: QOrium Q&A

**For:** Talpro India recruiters using QOrium for the first time  
**Distribute via:** Slack pinned message + email  
**Maintained by:** CTO Office  
**Last updated:** May 2, 2026 — Updated monthly with recruiter feedback  

---

## What Is QOrium?

QOrium is a question library built specifically for technical hiring — think of it as a fresh, constantly-rotating bank of coding assessments, SQL questions, system design puzzles, and MCQs. Every question is written by AI, reviewed by expert engineers, and statistically validated so you know exactly how hard it is and how well it predicts whether a candidate can actually do the job. Talpro's using QOrium to replace outdated, leaked question banks (like HackerRank and Mettl) that candidates have already prepped for. The big difference: QOrium questions are new every quarter and watermarked so we can detect when they leak.

---

## What Changes For Me?

- You'll send candidates a QOrium assessment link instead of (or alongside) your usual HackerRank/Mettl link
- You get a dashboard to view candidate scores, response times, and anti-cheat flags
- Questions feel fresh and unfamiliar to candidates (that's intentional — it's the signal you want)
- You get monthly question refreshes for your top 5 roles, with explicit difficulty metrics
- No new tools to learn; assessments are hosted on QOrium's platform and candidates access them via browser

---

## What Stays The Same?

- Your ATS (Applicant Tracking System) — no changes required
- Your candidate pipeline and hiring workflow — QOrium plugs into the "assessment" step
- Your relationship with hiring managers — you still make the hire/no-hire call; QOrium just gives you better signal
- Your existing bulk-export workflows via n8n or API integrations (if in use)

---

## Top 10 Anticipated Questions

### Q1: How do I send a candidate a QOrium assessment?

**A:** Two ways:

1. **Auto-trigger by job description:** Link your Talpro job posting to a role-graph entry (e.g., "Senior Java Engineer"). When a candidate matches that role, QOrium auto-sends an assessment link.
2. **Manual link generation:** Log into the QOrium dashboard, select a role (Senior Java, Senior React, etc.), and generate a one-time assessment link. Share via email or Slack.

**Link format:**  
```
https://app.qorium.io/assessments/[assessment_uuid]/[candidate_token]
```

**SLA on link expiry:** 30 days. After 30 days, the candidate receives a reminder email. The link expires permanently after 60 days and you'll need to generate a fresh one.

---

### Q2: What if a candidate's score doesn't match my impression?

**A:** QOrium uses **Item Response Theory (IRT)** — a statistical method used in standardized testing (SAT, GRE, etc.) to rank questions by difficulty and calibrate scores. Here's what that means for you:

- **Raw score:** The number of questions the candidate got right (e.g., 18/25). This varies widely depending on the difficulty mix.
- **Scaled score:** Adjusted for difficulty. A candidate scoring 16/25 on hard questions gets a higher scaled score than someone scoring 18/25 on easy questions. **Use the scaled score for hiring decisions.**
- **IRT difficulty (b parameter):** Each question has an explicit difficulty level (anchored to a 5-point scale: very easy to very hard). Use this to understand whether a candidate struggled because the questions were hard or because they lacked the skill.

**Escalation path:** If a candidate's score seems off (e.g., excellent on the technical interview but low QOrium score), post in the `#qorium-customer-zero` Slack channel with details. CTO Office will review the specific questions and flag any quality issues within 24 hours.

---

### Q3: How is QOrium different from HackerRank/Mettl/Codility?

**A:** Three honest differences:

1. **Library-as-a-service, not a platform:** QOrium is the content layer. You keep your existing assessment platform (HackerRank) if you want; QOrium supplies fresher questions. We don't replace your infrastructure — we improve your signal.
2. **Continuous anti-leak rotation:** QOrium crawls the internet daily (GeeksforGeeks, LeetCode, GitHub, Reddit, etc.) to detect leaked questions. When detected, we auto-rotate them out and regenerate new variants. HackerRank/Mettl's libraries leak static. Ours rotate.
3. **I/O-psychologist validation:** Every question is statistically calibrated (IRT) so you know the difficulty and discrimination (how well it separates strong from weak candidates). HackerRank treats all hard questions equally; QOrium gives you granular signal.

**Bottom line:** QOrium = fresh content layer + anti-leak + better signal. HackerRank = platform you know. Use both if you want; QOrium improves the signal of whichever platform you choose.

---

### Q4: What if a candidate cheats?

**A:** QOrium captures **anti-cheat signals** — things like multiple rapid wrong attempts, copy-paste patterns detected, unusual keyboard latency, tab-switching, etc. These signals are logged in the candidate's response record under a `suspicious_signals` field (JSONB).

**QOrium does NOT auto-fail candidates.** You see the signals + the score + the response data. **You decide what to do.** If a candidate's suspicious_signals list is long (e.g., 10+ flags), they probably cheated. If it's empty, they probably didn't. Use your judgment.

**Escalation:** If you're unsure about a specific candidate's cheating risk, post in Slack with the candidate ID. CTO Office forensics team will review within 24 hours.

---

### Q5: Can I customize questions for a specific job description?

**A:** Yes, via **JD-Forge** — our on-demand question generation service.

- **Reviewed tier ($199/JD):** AI generates questions + a senior engineer reviews them for quality within 4 hours.
- **Enterprise tier ($499/JD):** AI generates + senior engineer reviews + 3-week IRT calibration on the Reference Panel.

**Current availability for Talpro Customer Zero:** Wave 1 (first 3 months) = ReadyBank only. JD-Forge Standard tier ships in Wave 2 (Month 4+). Enterprise tier ships in Wave 2 with full calibration by Month 6.

---

### Q6: Where does the candidate's data go?

**A:** Per the **Data Processing Agreement (A7 DPA):**
- Talpro India is the **Data Fiduciary** (you own the hiring decisions and candidate relationships).
- QOrium is the **Data Processor** (we store and analyze the data on your behalf).
- Candidate response data is stored in India (Hostinger Bengaluru) with AES-256 encryption in transit and at rest.
- **Default retention:** 30 days post-decision. If you mark a candidate "rejected," their data is deleted automatically after 30 days. If "hired," it stays for 2 years (in case of re-verification).
- **Right to erasure:** At any time, request deletion of a candidate's data. We comply within 30 days.

---

### Q7: What's the SLA if something breaks?

**A:** Per the **Customer Zero Feedback Charter (D4):**

| Severity | Definition | SLA |
|---|---|---|
| **P0 (Critical)** | Assessment delivery broken; candidates can't attempt | 4 hours to fix |
| **P1 (High)** | Wrong answer, score discrepancy | 24 hours to fix |
| **P2 (Medium)** | UX lag, export slowness | 7 days |
| **P3 (Low)** | Typo, cosmetic issue | Next sprint (14 days) |

**How to report:** Post in the `#qorium-customer-zero` Slack channel with the **Defect Report template** (pinned in that channel). CTO Office acknowledges within 1 hour; posts status updates every 6 hours.

---

### Q8: Can I pre-screen 100 candidates at once?

**A:** Yes. Use the **bulk export endpoint** or the QOrium dashboard:

1. **Export endpoint:** `POST /api/v1/bulk-exports` — submit a query (e.g., "Senior Java, difficulty 3–5") and get a CSV or JSON file with up to 100K question IDs + metadata.
2. **Daily quota:** 100 bulk exports/day, max 10K questions/day per API key.
3. **n8n template:** CTO Office provides a pre-built n8n workflow for bulk assessment generation + Slack notifications when ready.

**Example workflow:**
```
n8n (daily trigger) → Query QOrium for 50 "Senior Java" questions
  → Batch-send QOrium links to 50 candidates via your ATS API
  → Collect responses → Slack notification when ready
```

CTO Office has a template. Request it in Slack.

---

### Q9: What languages and tech stacks are covered today?

**A:** **Wave 1 (Month 2–3):**
- Java (Spring Boot, microservices, concurrency)
- React/JavaScript (React 18, hooks, Next.js, TypeScript, performance)
- SQL/Data (PostgreSQL, analytics, query optimization, warehousing)
- DevOps/SRE (Kubernetes, observability, IaC, incident response)
- Salesforce Developer (Apex, LWC, Service Cloud, integration)
- Python (Django, FastAPI, data science, asyncio)

**Wave 2 (Month 4–6, if requested by Talpro):**
- SAP ABAP
- Oracle HCM
- AWS
- Finacle/Flexcube

**Check the wave plan:** Post a question about stack coverage in Slack. CTO Office confirms Wave 1 vs. Wave 2 for any role.

---

### Q10: Who do I contact for help?

**A:** **Slack channel:** `#qorium-customer-zero` (private, members: CTO Office + Talpro Delivery Head + recruiters)

**SLA:** Non-urgent questions answered within 1 business day. Blockers (affecting hiring) answered within 4 hours.

**Monday–Friday, IST business hours.** If urgent outside hours, call the Delivery Head directly.

---

## Anti-Cheat Playbook (In Plain English)

QOrium detects signals that suggest cheating — rapid wrong attempts, copy-paste, unusual keyboard timing, tab-switching. We log these signals; **you decide if the candidate's cheating.** We don't auto-fail anyone. Why? Because detecting cheating is not ML's job — it's your hiring manager's job. QOrium gives you the *evidence*. You make the *call*.

If a candidate has 0 suspicious signals and aces the assessment, they probably know the material. If they have 15 signals and barely pass, they probably cheated. Use common sense.

---

## Feedback Loop (How You Help Us Improve)

Every week, observe patterns in candidate performance and hiring outcomes:
- Which questions were too easy or too hard?
- Did candidates who passed QOrium do well in the technical interview?
- Any questions that felt unfair or leaked?

**Post daily observations in Slack.** CTO Office reads every message. Every month, fill out a quick feedback form (2 minutes). Your input directly shapes next month's question pool.

---

## Glossary

| Term | Definition |
|---|---|
| **IRT** | Item Response Theory — statistical method to calibrate question difficulty and candidate ability on a common scale (like SAT scoring). |
| **Anti-leak** | Daily crawl of the internet for leaked QOrium questions; auto-rotate leaked questions out of the library. |
| **JD-Forge** | On-demand question generation from a job description. Reviewed (4-hour SLA) or Enterprise (3-week calibration). |
| **ReadyBank** | Shared question library covering 6 core roles; refreshed quarterly. Talpro's free Wave 1 access is ReadyBank only. |
| **Stack-Vault** | Exclusive question library for one customer's specific tech stack (paywall product; not for Talpro Customer Zero). |

---

## Drafting Notes (For CTO Office)

1. **Q&A list refined after first 2 weeks:** After Talpro's first 10 assessments, review Slack #qorium-customer-zero for recurring questions. Update this doc weekly.
2. **Tone calibration:** Run this through Talpro Delivery Head before Week 1 launch. Adjust jargon density based on feedback.
3. **Localization:** If Talpro's recruiters include non-English speakers, translate to Hindi or other Indian languages; post translated version alongside English.

---

*End of Talpro Recruiter Onboarding Q&A. Distribute Friday, May 3, 2026.*
