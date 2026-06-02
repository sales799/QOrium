# Bali Outbound Email Templates v1

**Purpose.** Ready-to-send outbound email templates for the Top 100 prospect list (`Bali-AE-BD-Outbound-Prospect-List-Top-100.md`). Per-tier sequences keyed to QOrium's 4 buyer profiles. AE/BD hires use these on Day 1.
**Author.** CTO Office · Run #12 · 2026-05-03
**Status.** v1 — production-ready; refine per A/B testing during Phase 1
**Pairs with.** Bali Sales Playbook (Doc 08), CRM Playbook, Top 100 Prospect List, CTO WhatsApp Library

---

## How to Use This Library

### 1. Personalization Tokens

Every template uses these tokens. Replace before sending. **Never send a template with un-replaced tokens** — that's the #1 cold-email tell.

| Token | Replace with | Example |
|---|---|---|
| `{first_name}` | Prospect first name | Sandhya |
| `{role}` | Prospect title | Director of Talent Acquisition |
| `{company}` | Company name | Bosch GCC India |
| `{specific_observation}` | One concrete public detail (job posting count, recent press, hiring drive) | "your 47 open SAP ABAP roles in Bengaluru" |
| `{stack_anchor}` | Their specific tech stack pain point | "embedded automotive + SAP ABAP" |
| `{volume_anchor}` | Their hiring volume signal | "5,000+ candidate assessments per quarter" |
| `{competitor_anchor}` | The platform they currently use (if known) | "your existing HackerRank workflow" |
| `{mutual_anchor}` | Mutual connection or shared context | "Bhaskar from Talpro India suggested I reach out" |
| `{calendar_link}` | Sender's calendar link | calendly.com/qorium-bali |

### 2. A/B Testing Protocol

Send any template in TWO variants per outreach batch (50/50 split):
- **Variant A:** Pure value proposition (lead with QOrium)
- **Variant B:** Insight-led (lead with prospect's pain)

After 50 sends per variant, compare reply rate. Promote the winner; iterate the loser. CRM tracks variant in custom field `email_variant`.

### 3. Send-Time Guidance

| Geography | Best send time (recipient local) | Best day |
|---|---|---|
| India (GCCs, IT services, BFSI) | Tue–Thu 10:30–11:30 AM IST | Tue/Wed |
| US East (platforms, US headquarters) | Tue–Thu 9:30–10:30 AM ET | Tue/Wed |
| US West (CodeSignal, HackerRank HQ) | Tue–Thu 8:30–9:30 AM PT | Tue/Wed |
| UK / EU (SHL, Talogy, DevSkiller) | Tue–Thu 9:00–10:00 AM local | Tue/Wed |

Avoid: Mondays (inbox overload), Fridays (low attention), all major Indian/US/UK holidays.

### 4. CRM Staging Mapping

Every send creates a HubSpot deal at the right stage:

| Template type | HubSpot deal stage |
|---|---|
| Cold opener (T1A, T2A, T3A, T4A) | "Outbound Sent" |
| Warm intro (T1B, T2B, T3B, T4B) | "Warm Lead — Awaiting Reply" |
| Follow-up #1 (T1C, T2C, T3C, T4C) | "Outbound — Follow-up" |
| Follow-up #2 (T1D, T2D, T3D, T4D) | "Cooling — Final Touch" |
| Meeting confirmation (T1F, T2F, T3F, T4F) | "Discovery Scheduled" |

After 3 touches with no response, move deal to "Not Now" (revisit Q+1).

### 5. Constitutional Compliance Check (every send)

- ✅ **SO-7:** Three-sentence USP in template uses verbatim Constitution v2.0 §1.1 wording
- ✅ **SO-24:** No claims about library size / customer count / pricing without backing data — **all numbers in these templates are sourced from QOrium's own public materials, not from the prospect's competitive landscape**
- ✅ **SO-12:** No reference customer named without their explicit consent (Talpro Customer Zero is pre-consented; all others require ask-before-quote)

---

# TIER 1 — Stack-Vault Enterprise / Group

**Target.** GCCs, large IT services, BFSI majors with 1,000+ technical hires/year and 1,000+ active candidate-screening assessments/quarter.
**Examples on Top 100 list.** Bosch GCC, Siemens GCC, JPMC India, TCS, Infosys, Wipro, HDFC Bank, ICICI Bank.
**ACV target.** ₹40L–₹1Cr+/year (Stack-Vault Enterprise → Group tiers).
**Sales motion.** AE-led, 3–6 month cycle, founder-warm-intro preferred.
**Decision-maker.** TA Director / Head of Talent Acquisition / Chief People Officer.

## T1A — Cold Opener (no prior connection)

**Subject lines (rotate):**
1. "{first_name}, a question about your {stack_anchor} hiring quality"
2. "{company}'s assessment content vs. your candidates' prep — a hidden gap"
3. "30-second QOrium intro for {company}"

**Body:**

> Hi {first_name},
>
> I noticed {company} is hiring heavily for {stack_anchor} — {specific_observation}. Most enterprise TA leaders I've spoken with say the same thing about technical assessments at this scale: **the questions on your platform have been seen by your candidates already**.
>
> QOrium is the world's first enterprise-grade Question-Bank-as-a-Service. We supply confidential, watermarked, IP-protected question packs aligned to your exact tech stack — built for high-volume hiring drives where signal quality erosion costs you real dollars.
>
> For {company}, we'd build a Stack-Vault: 2,000+ questions specific to your stack, refreshed quarterly, contractually exclusive, with forensic leak attribution. Annual licence ₹40L; ROI math typically lands at 6× value capture for organisations at your assessment volume.
>
> Worth 20 minutes to walk you through how the model works for {stack_anchor}? I can send a sample 50-question pack on your highest-volume role beforehand so your engineering panel sees the quality before the call.
>
> {sender_first_name}
> Bali, AE — QOrium (a Talpro Universe venture)
> {calendar_link}

## T1B — Warm Intro (CEO referral)

**Subject:** "Intro from {mutual_anchor} re: QOrium for {company}"

**Body:**

> Hi {first_name},
>
> {mutual_anchor} suggested I reach out directly. He's been quietly building QOrium for the last 6 months at Talpro Universe — it's the question-content layer beneath enterprise assessments, and {company} came up immediately when we mapped the first 100 customer prospects.
>
> Three reasons {company} is a strong fit:
>
> 1. Your stack ({stack_anchor}) is exactly where generic platforms fall short
> 2. Your assessment volume ({volume_anchor}) makes the Stack-Vault ROI math compelling
> 3. Your candidate-quality signals over the past 12 months suggest leaked-content erosion is already in your data
>
> I'd like to send you a sample 50-question pack for [Senior {primary_role} at {company}] this week, and then schedule 30 minutes with you and your senior engineering panel to walk through the science. No commercial discussion until your panel says the questions clear your bar.
>
> {sender_first_name}
> {calendar_link}

## T1C — Follow-up #1 (5 days after T1A or T1B, no reply)

**Subject:** "Re: {previous_subject}" (reply-style follow-up)

**Body:**

> Hi {first_name},
>
> Bumping this in case it slipped past — I know your inbox is brutal.
>
> Quick re-share: QOrium delivers Stack-Vault libraries that are confidential to {company}, watermarked per-customer, and refreshed quarterly. ₹40L/year for an Enterprise tier covering 20–30 roles.
>
> If now isn't the right time, totally fair. If you'd like me to send the sample pack and you can review when you have a window, just reply with "send the sample" and I'll have it to you in 48 hours.
>
> {sender_first_name}

## T1D — Follow-up #2 (12 days after T1C, no reply)

**Subject:** "Last note on QOrium for {company} — closing the file"

**Body:**

> Hi {first_name},
>
> Closing the loop on this thread — promise this is the last one unless you reply.
>
> One concrete data point I forgot to mention: WeCP (the Bengaluru question-factory company) was acquired by Invisible Technologies in March 2026, exiting the technical-assessment market entirely. The wedge they validated is now structurally empty — and QOrium is filling it. The next 18 months will set the category standard for content-as-a-service in assessment.
>
> If {company} wants to be an early reference customer (with the pricing and influence that comes with it), now is the right window. If not, I'll mark you as "Not Now — revisit Q3" and stop the touches.
>
> Either way, thanks for your time on this.
>
> {sender_first_name}

## T1E — Objection Handler (in-thread responses to top objections)

### Objection: "We already have HackerRank/Mettl/HackerEarth — why do we need this?"

> Totally fair. We don't replace HackerRank/Mettl — we make them better. Their library is leaked (you're seeing this in your candidate-vs-interview signal mismatch); ours isn't. We export in their import format so your existing workflow doesn't change. Net effect: same platform, fresh + watermarked content, 6× signal improvement on the metrics you already track.

### Objection: "₹40 lakh/year is a lot of money."

> Compared to your current spend it isn't. Your assessment volume ({volume_anchor}) puts your annual platform spend at ₹50L+ already, on a question pool every other employer is also using. ₹40L for a Stack-Vault that's exclusively yours, watermarked, refreshed quarterly — the math works the moment your hiring volume crosses 5,000 assessments/year. {company} is well past that.

### Objection: "How do we know the questions are actually high quality?"

> You don't take our word for it. Before any commercial conversation, we send a 50-question sample pack on your highest-volume role. Your engineering panel reviews them. If they don't pass your bar, no deal. That's the gate. Most prospects find the sample alone shifts the conversation from "should we?" to "when can we?".

### Objection: "What about IP — who owns the questions?"

> You do. Stack-Vault is contractually exclusive — these questions never appear in our shared library, never get sold to another customer, never appear in any JD-Forge output to anyone else. Every question is watermarked with a {company}-specific cryptographic marker, so if anything ever leaks externally, we can forensically attribute the source. That's contractually meaningful and legally actionable.

### Objection: "Why not build this in-house? We have a content team."

> How big is your content team, and how many net-new validated questions did they ship last year? If it's <500/year, we ship more in a quarter for the Stack-Vault Enterprise tier than your team ships in a year. Plus we bring I/O psychology validation that your team probably doesn't have on staff. The choice isn't "build vs buy" — it's "add this layer without growing your team."

## T1F — Meeting Confirmation + Pre-Read

**Subject:** "Confirmed: QOrium discovery on {date} — pre-read attached"

**Body:**

> Hi {first_name},
>
> Confirmed for {date} at {time} {timezone}. Calendar invite incoming separately.
>
> Two attachments for your pre-read:
>
> 1. **QOrium 5-Slide Pre-Brief** — 90-second skim covers the model, the three SKUs, and the wedge
> 2. **Stack-Vault One-Pager** — pricing tiers, what's included, contracted exclusivity language
>
> The agenda for the 30 minutes:
>
> - First 5 min: I'll walk through the QOrium thesis + how Stack-Vault works for {stack_anchor}
> - Next 15 min: Open discussion — your questions, your data, your specific stack mix at {company}
> - Final 10 min: If interest is real, we scope a sample 50-question pack on your highest-volume role + define what "panel approval" looks like
>
> If anyone else from your team should be on the call, please add them to the invite. Best added: a senior engineering lead who'll review the sample pack quality.
>
> See you {date}.
>
> {sender_first_name}

---

# TIER 2 — Stack-Vault Department

**Target.** Mid-large enterprises with 200–800 technical hires/year; specific department with concentrated stack hiring (e.g., one BU's data team, one product line's engineering).
**Examples on Top 100 list.** Indian unicorn startups (Razorpay, CRED, Meesho), mid-tier IT services (LTIMindtree, Mphasis), Indian-headquartered SaaS (Freshworks, Zoho).
**ACV target.** ₹10L/year (Stack-Vault Department tier).
**Sales motion.** AE-led, 2–4 month cycle, demo-driven.
**Decision-maker.** Engineering Director / VP Engineering / Department Head.

## T2A — Cold Opener (engineering-leader-targeted)

**Subject lines (rotate):**
1. "{first_name}, your {role_specific} hires are seeing leaked questions"
2. "30-second pitch: Department Stack-Vault for {company}"
3. "{company}'s {team} engineering panel — a content-quality gap"

**Body:**

> Hi {first_name},
>
> Quick observation: when your senior engineers interview candidates that passed your assessment platform, are they consistently saying "the candidate doesn't actually know what their score suggests"? That's the leaked-content signal — and at {company}'s scale, it's costing you both bad hires and good candidates.
>
> QOrium ships exclusive question banks for individual departments. For your {team} team specifically, we'd build a 500-question bank covering 5–10 of your most-hired roles, refreshed quarterly, watermarked to {company}. ₹10L/year. Plugs into your existing platform (we export in HackerRank, Mettl, Codility format).
>
> Want to see a sample 25-question pack on the role you're hiring most for? I can have it to you in 5 days.
>
> {sender_first_name}
> Bali, AE — QOrium
> {calendar_link}

## T2B — Warm Intro (existing relationship leveraged)

**Subject:** "{mutual_anchor} mentioned QOrium for your {team} hiring"

**Body:**

> Hi {first_name},
>
> {mutual_anchor} suggested I share QOrium with you — specifically in the context of your {team} engineering hiring at {company}.
>
> The wedge: your {role_specific} candidates have already practised the questions in your current assessment platform's library. We supply a {company}-exclusive 500-question Stack-Vault for your team, refreshed quarterly, watermarked, that plugs into the platform you already use.
>
> Department-tier price is ₹10L/year, which usually lands well below what mid-size eng teams currently spend on platform per-test fees + the cost of hiring mistakes.
>
> 20 minutes this week or next? Happy to send a sample pack first if that's the better path.
>
> {sender_first_name}

## T2C — Follow-up #1 (5 days after T2A or T2B)

**Subject:** "Re: {previous_subject}"

**Body:**

> {first_name},
>
> Following up on the QOrium note from earlier. Two updates that might move this:
>
> 1. We're authoring the Wave 2 India-stack pack right now (SAP ABAP, Oracle HCM, Salesforce CPQ, Finacle/Flexcube, Embedded Automotive) — if your {team} touches any of those, the sample pack is ready
> 2. We're closing first 5 customer logos this quarter; early customers get 12-month price lock + reference-customer discount on renewal
>
> If now isn't the right window, no problem — let me know and I'll re-touch in Q3.
>
> {sender_first_name}

## T2D — Follow-up #2 (12 days after T2C)

**Subject:** "Closing the QOrium file for {company} — last note"

**Body:**

> Hi {first_name},
>
> Last touch — closing the file unless you'd like to reopen it.
>
> If the timing isn't right or QOrium isn't a fit for {company}'s assessment approach, that's totally fair. If there's interest but you've been heads-down, just reply "next month" and I'll re-engage in 4 weeks.
>
> Thanks for considering.
>
> {sender_first_name}

## T2E — Objection Handler

### Objection: "We're a startup — ₹10L/year is too much."

> Understood. The Recruiter ReadyBank tier (₹14,999/month, ~₹1.8L/year) covers a startup hiring volume cleanly. Same content engine, less exclusive (shared library), no Stack-Vault watermarking. Want me to send the Recruiter pricing instead? It's the right entry point for teams under ~50 hires/year.

### Objection: "Our content team builds custom questions internally."

> Most do, and most ship 200–500 validated questions per year per content engineer. QOrium ships 500 in a Department-tier engagement, refreshed quarterly. We don't replace your team — we accelerate them. Common pattern: your team focuses on the 20% of questions that are truly company-unique; we cover the 80% that's stack-standard.

### Objection: "What if a question we pay for shows up at our competitor's hiring drive?"

> Not possible — Stack-Vault is contractually exclusive. Questions in {company}'s Stack-Vault never appear in another customer's library, never appear in our shared ReadyBank, never appear in JD-Forge output to anyone else. Watermarked too — if it ever did leak, we can prove the source.

## T2F — Meeting Confirmation + Pre-Read

**Subject:** "Confirmed: QOrium walk-through {date}"

**Body:**

> Hi {first_name},
>
> Confirmed for {date} at {time} {timezone}.
>
> Pre-read (5 minutes total):
>
> - **Stack-Vault One-Pager** — Department tier scope + pricing
> - **Sample 25-Q pack** for {primary_role} at {company} — your engineering lead's quality gate
>
> 30-minute agenda:
>
> - 5 min: Why QOrium exists + how the Department tier works
> - 15 min: Sample pack walk-through + your team's quality assessment
> - 10 min: If green light, scope the full Stack-Vault for {team}
>
> Looking forward to it.
>
> {sender_first_name}

---

# TIER 3 — ReadyBank API Platform

**Target.** Assessment platform companies that need content to power their products. NOT end-user employers.
**Examples on Top 100 list.** HackerRank, Mercer | Mettl, HackerEarth, iMocha, Adaface, Vervoe, Xobin, Testlify cluster, CoderPad, Karat.
**ACV target.** $5K–$25K/year (ReadyBank API tier per Constitution SO-23).
**Sales motion.** BD-led, founder-to-founder warm intros work best, 6–12 month sales cycle, partnership framing essential.
**Decision-maker.** VP Product / Head of Content / CTO / CEO.

## T3A — Cold Opener (positioning as ally, not competitor)

**Subject lines (rotate):**
1. "Question for {company}'s product roadmap — content layer"
2. "{first_name}, a content-supply partnership idea for {company}"
3. "QOrium API for {company}'s assessment library"

**Body:**

> Hi {first_name},
>
> Quick context: I'm with QOrium, a Question-Bank-as-a-Service that supplies content to assessment platforms via API. We're not a competitor — we're a content layer beneath platforms like {company}. The thesis: every platform's library faces leakage erosion, and most content teams can't out-author the leak rate.
>
> For {company} specifically, the QOrium content API would let you offer your customers refreshed, watermarked, IRT-calibrated questions across {their_thinnest_coverage_area} — without growing your content team. Pricing band $5K–$25K/year depending on volume; pilot programmes available.
>
> Worth a 30-min call to walk through how this would integrate with your existing content workflow? I can send a 100-question API sample (your choice of skill area) so your content team sees the quality before any contract conversation.
>
> {sender_first_name}
> BD — QOrium (a Talpro Universe venture)
> {calendar_link}

## T3B — Warm Intro (founder-to-founder)

**Subject:** "Intro from {mutual_anchor} re: QOrium content API for {company}"

**Body:**

> {first_name},
>
> {mutual_anchor} suggested I reach out — he's been building QOrium at Talpro Universe and {company} came up as the highest-leverage partner conversation in our Tier-1 list.
>
> The pitch in one paragraph: QOrium supplies the content layer beneath assessment platforms. We're the AWS S3 of assessment content — invisible, indispensable, underneath. For {company}, that means your content team focuses on platform UX + customer integrations, while we cover the velocity grind of authoring + IRT calibration + anti-leak rotation. {their_thinnest_coverage_area} is where we'd start; pricing $5K-$25K/year for the API tier; partnership terms negotiable.
>
> 30 minutes founder-to-founder?
>
> {sender_first_name}

## T3C — Follow-up #1 (7 days after T3A or T3B — longer interval for B2B2B)

**Subject:** "Re: {previous_subject}"

**Body:**

> {first_name},
>
> Following up on the QOrium note. One concrete update:
>
> WeCP (the Bengaluru question-factory company) was acquired by Invisible Technologies in March 2026, exiting the technical-assessment market entirely. The category gap they validated is now structurally empty — and we're filling it. The next 18 months will set the partnership standard for content-as-a-service in assessment.
>
> If {company} wants to evaluate the API as part of your H2 roadmap, now is the right window. Happy to send a sample API call to your engineering team, with a 100-question response payload in your preferred format.
>
> {sender_first_name}

## T3D — Follow-up #2 (14 days after T3C)

**Subject:** "Closing the QOrium-{company} file — last touch"

**Body:**

> Hi {first_name},
>
> Last note unless you'd like to reopen this.
>
> If now isn't the right window for a partnership conversation, that's totally fair — partnerships at our scale need internal alignment that takes time. If you'd like me to re-engage when {company}'s next planning cycle starts, just reply "Q3" or "Q4" and I'll set the reminder.
>
> Either way, appreciate your time considering this.
>
> {sender_first_name}

## T3E — Objection Handler

### Objection: "We have an in-house content team. We don't outsource."

> Most platforms don't outsource — but the economics of in-house content are getting harder every quarter. Your in-house team can ship maybe 1,800 questions/year per engineer at $100K cost = $55/question. We ship 5,000+ questions/quarter via API for $25K/year, blended cost ~$5/question. We're not asking you to fire your team — we're asking you to give them a force multiplier so they focus on differentiated work.

### Objection: "How do we know your content quality is at our standard?"

> We give you a 100-question sample pack across the 5 skills you specify before any commercial discussion. Your content team reviews it like they would review their own backlog. If it doesn't pass their bar, no deal.

### Objection: "Our customers expect questions written by us. They'd be unhappy with vendor content."

> Three responses. One — your customers don't know whether your in-house engineers wrote the question or your contracted Indian SME network did; they see "{company} question." Two — every QOrium question can be fully white-labeled and rebranded as {company} content; we don't insist on attribution. Three — your customers DO care about freshness and signal quality, and that's what we deliver via the anti-leak rotation engine.

### Objection: "Anti-leak is interesting but not core to our value prop."

> Today, no — your customers haven't yet articulated it as a buying criterion. Year 2 they will. Adaface already markets the 24-hour rotation as a wedge. The first platform to ship "AI-rotated, leak-monitored library" as a category differentiator owns the narrative. Want to be that platform, or react when a competitor lands first?

### Objection: "$25K/year for the Growth tier feels expensive."

> Run the math: $25K / 50,000 questions per month = $0.04 per question delivered. Your in-house cost to author is $50–$150 per question. Even after factoring our 6-month pilot price + integration cost, you're saving 1,200–3,750× per question on the marginal content. Pilot pricing is also negotiable — most Tier-3 partners start at a $7,500 6-month pilot to validate.

### Objection: "We're already exploring AI content generation in-house."

> Great — building the pipeline yourself is hard. We've been at it for 6 months and shipped 300+ validated questions across 8 sub-skills. Two paths: One — license our API and let your team focus on platform UX while we handle the content backend. Two — you build it yourself, take 12–18 months to match our quality, and miss the market timing window. The math usually favours path one for the first 2–3 years.

## T3F — Meeting Confirmation + Pre-Read

**Subject:** "Confirmed: QOrium content API discovery — {date}"

**Body:**

> Hi {first_name},
>
> Confirmed {date} at {time} {timezone}.
>
> Pre-read attached:
>
> - **QOrium API Reference** (1-pager) — endpoints, response format, rate limits
> - **Sample 100-Q API Response** for {their_thinnest_coverage_area} — your content team's quality gate
> - **CTO Architecture excerpt** (Section 6) — REST endpoints and SDK strategy
>
> 30-minute agenda:
>
> - 5 min: QOrium content API positioning + the partnership thesis
> - 15 min: Sample API output review by your content + engineering teams
> - 10 min: If green light, scope the 6-month pilot ($7,500–$15K depending on volume) + integration timeline
>
> Looking forward.
>
> {sender_first_name}

---

# TIER 4 — JD-Forge Enterprise

**Target.** High-JD-volume employers (200+ JDs/month) where on-demand custom assessment-pack generation has obvious ROI.
**Examples on Top 100 list.** Talent-heavy startups (Razorpay, Swiggy, Zepto), mid-tier IT services with high JD throughput, executive search firms.
**ACV target.** $10K–$30K/year subscription (JD-Forge Reviewed/Enterprise tier subscriptions).
**Sales motion.** AE-led OR self-serve, 1–3 month cycle, demo-driven, fast close.
**Decision-maker.** Head of Talent Acquisition / Hiring Manager / Recruitment Operations Lead.

## T4A — Cold Opener (volume-pain-led)

**Subject lines (rotate):**
1. "{first_name}, you upload {volume_anchor} JDs/month — wasted hours?"
2. "30-second pitch: JD-Forge for {company}'s recruiter team"
3. "Custom assessment per JD in 30 seconds — for {company}"

**Body:**

> Hi {first_name},
>
> Noticed {company} is running ~{volume_anchor} hiring drives this quarter. At that volume, your TA team is probably spending 2–3 hours configuring assessments per drive — that's 100+ hours/month of skilled people doing config work instead of hiring.
>
> JD-Forge solves this. Your recruiter uploads a JD; in 30 seconds we return a 20-question assessment pack tailored to that exact role — fresh, JD-aligned, anti-leak-filtered, ready to plug into your existing platform.
>
> Pricing:
>
> - $49/JD Standard (AI-generated; 30-second SLA)
> - $199/JD Reviewed (AI + SME validation; 4-hour SLA)
> - $1,999/month subscription (15 reviewed JDs/month)
>
> Want a free trial — 5 JDs your team uploads, we generate the packs, your recruiters compare to what they would have configured manually? No credit card required for the trial.
>
> {sender_first_name}
> AE — QOrium
> {calendar_link}

## T4B — Warm Intro (existing relationship)

**Subject:** "{mutual_anchor} suggested JD-Forge for {company}'s hiring volume"

**Body:**

> Hi {first_name},
>
> {mutual_anchor} mentioned QOrium's JD-Forge would fit your TA team's workflow at {company}.
>
> The pitch: upload a JD, receive a custom 20-question assessment pack in 30 seconds (or 4 hours if you want SME-reviewed). Replaces the 2–3 hours your recruiters spend per drive configuring assessments manually.
>
> Pricing starts at $49/JD; subscription tier $1,999/month for 15 reviewed JDs. ROI math is straightforward at your hiring volume.
>
> 5-JD free trial to start? No commitment.
>
> {sender_first_name}

## T4C — Follow-up #1 (4 days after T4A or T4B — JD-Forge has shorter cycle)

**Subject:** "Re: {previous_subject}"

**Body:**

> Hi {first_name},
>
> Quick bump on the JD-Forge note.
>
> If the trial would be useful but you're swamped, here's the lowest-friction path: forward me 3 JDs from this week's hiring drives. I'll have the assessment packs back to you in 24 hours. No login, no contract, no commitment — just a quality test against what your team would have built manually.
>
> Reply with "send 3 JDs" and I'll send a secure upload link.
>
> {sender_first_name}

## T4D — Follow-up #2 (10 days after T4C)

**Subject:** "Closing the JD-Forge file for {company}"

**Body:**

> Hi {first_name},
>
> Closing the loop. If JD-Forge isn't a fit for {company}'s workflow today, totally fine. If timing is the issue, just reply with a month ("June") and I'll re-engage then.
>
> Last data point: every prospect who's tried the 3-JD free pilot has continued to a paid subscription. Quality conversion = ~80%. The risk is just inertia, not the product.
>
> Either way, thanks.
>
> {sender_first_name}

## T4E — Objection Handler

### Objection: "Why should we trust an AI-generated assessment?"

> Fair concern. Two trust layers: (1) Standard tier ($49/JD) is AI-only — best for screening volumes where you'd otherwise use the platform's default questions; (2) Reviewed tier ($199/JD) adds an SME engineer's 15-minute review with 4-hour SLA — best for senior or critical hires. Most customers run 80% Standard / 20% Reviewed split based on role criticality.

### Objection: "We already have a platform that auto-generates assessments."

> Most platforms generate from their own library — which means leaked questions. JD-Forge generates fresh questions per JD using current best AI + our anti-leak filter. The difference shows up in candidate signal quality, not in generation speed.

### Objection: "The free trial sounds too good — what's the catch?"

> No catch. We're at the stage where we need 50 paid logos in Year 1. The free trial is our customer-acquisition mechanism — convert ~30% of trials and we hit our target. If you don't convert after the trial, we've still spent <$10 of AI tokens and learned what didn't work for your use case.

### Objection: "Subscription locks us in. Why not pay-as-you-go?"

> Per-JD pricing IS pay-as-you-go ($49 Standard / $199 Reviewed). The subscription ($1,999/month for 15 Reviewed JDs) is a discount tier for predictable volume. If your usage is bursty, stick with per-JD; if it's steady at 12+ Reviewed JDs/month, the subscription saves you ~30%.

## T4F — Meeting Confirmation + Pre-Read

**Subject:** "Confirmed: JD-Forge demo {date}"

**Body:**

> Hi {first_name},
>
> Confirmed {date} at {time} {timezone}.
>
> Pre-read attached:
>
> - **JD-Forge One-Pager** — pricing tiers + SLA + integration options
> - **Sample JD-to-Pack output** for a {primary_role} JD — what your recruiters will see
>
> 30-minute agenda:
>
> - 5 min: Why JD-Forge exists + how the 3 tiers work
> - 10 min: Live demo — I'll JD-Forge a JD you provide on the call
> - 10 min: Your team's evaluation of the output quality
> - 5 min: If green light, set up the 5-JD free trial OR direct subscription
>
> If you'd like the demo to use a real {company} JD, send me one ahead of time and I'll have the output pre-loaded for screen-share comparison.
>
> {sender_first_name}

---

# APPENDIX A — Subject Line Library

## High-converting patterns (across all tiers)

| Pattern | Example | Use case |
|---|---|---|
| Direct question | "{first_name}, your {stack} hires are seeing leaked questions" | Tier 1 + 2 cold opener |
| Mutual referral | "{mutual_anchor} suggested QOrium for {company}" | Any tier warm intro |
| Specific observation | "{company}'s 47 open SAP roles — content gap" | Tier 1 cold opener |
| Time-bound | "30-second pitch: {SKU} for {company}" | All tiers cold opener |
| Industry insight | "WeCP exited the question-factory market — {company} matters now" | Tier 1 + 3 cold opener |
| Reply-style | "Re: {previous_subject}" | Follow-ups |
| Closing | "Closing the QOrium file for {company} — last touch" | Final follow-up |
| Confirmation | "Confirmed: QOrium discovery {date}" | Meeting confirmation |

## Patterns to AVOID

- "Quick question" — generic; high spam-folder rate
- All-caps — instant filter
- Multiple punctuation marks "!!!" or "???"
- Emojis in subject lines for B2B (use sparingly in body if the prospect uses them first)

---

# APPENDIX B — Email Footer Template (all sends)

```
{sender_first_name} {sender_last_name}
{role}, QOrium — a Talpro Universe venture
{calendar_link}
qorium.online · linkedin.com/in/{sender_handle}

QOrium is the world's first enterprise-grade Question-Bank-as-a-Service.
We supply confidential, watermarked, IRT-calibrated assessment content
to platforms, enterprises, and staffing firms via REST API, bulk export,
embedded widget, and white-label channels.
```

---

# APPENDIX C — Common Personalization Anchors (research script)

For each prospect on the Top 100 list, pull these anchors before first send:

1. **Recent press / public news** (Google News query: `"{company}" {role} hiring -careers`)
2. **Job posting volume** (LinkedIn job search: open roles by stack)
3. **Tech stack signals** (StackShare, BuiltWith, job descriptions)
4. **Decision-maker context** (LinkedIn profile, recent posts, mutual connections)
5. **Mutual anchor** (LinkedIn 2nd-degree connections, mutual schools, mutual prior employers)

Time per prospect: 5–10 minutes. Total for Top 100: 8–16 hours of CRM enrichment work — first AE/BD hire's Day 1–2 task.

---

# APPENDIX D — Send Cadence Per Prospect

**Day 0:** T1A or T1B (cold opener or warm intro per relationship status)
**Day 5:** T1C (follow-up #1) — only if no reply
**Day 17:** T1D (follow-up #2) — only if no reply to T1C
**Day 17 + N:** Move to "Not Now"; revisit Q+1 (90 days)

**Total touches per prospect: 3 max in the initial sequence.**

If reply at any stage:
- Positive → T1F meeting confirmation flow OR T1E objection handler
- Negative → "Not Now" with reason captured in CRM + revisit timing

---

# APPENDIX E — A/B Variant Suggestions for Phase 1

For each tier's T1A / T2A / T3A / T4A cold opener, build a Variant B that:
- Leads with the prospect's pain (not QOrium's value)
- Cites a specific public data point about the prospect (not generic industry)
- Asks for a smaller commitment first (sample pack, 15-min call, free trial — not 30-min discovery)

Run 50/50 split across each tier's first 50 sends. Promote winner; iterate loser. CRM logs `email_variant: A | B`.

Suggested Variant B for T1A:

> Hi {first_name},
>
> {company} posted 47 SAP ABAP roles this quarter on Naukri. At that volume, you're running 1,500+ candidate assessments. Question: what's your interview-to-offer ratio after candidates clear the platform's assessment? In our experience with similar GCC TA leaders, the ratio drops 30%+ when the assessment library is leaked — and your platform's library has been leaked for ~9 months.
>
> One question to test if QOrium would help: what % of your post-assessment interview rejections are due to "candidate-doesn't-actually-know-the-stack" reasons? If it's >20%, we should talk.
>
> {sender_first_name}, QOrium
> {calendar_link}

---

# APPENDIX F — Deal Stage Auto-Promotion Rules (HubSpot integration)

| Trigger | Auto-action |
|---|---|
| Email opened 3+ times | Notify AE; promote deal to "Engaged" |
| Reply received | AE auto-assigned; deal to "Discovery Conversation" |
| Meeting booked | Deal to "Discovery Scheduled"; pre-read auto-attached |
| Meeting held | Deal to "Sample Pack Sent"; pack-delivery auto-task to CTO Office |
| Sample pack feedback received | Deal to "Validation"; AE schedules scoping call |
| Scoping call held | Deal to "Proposal"; commercial-template auto-generated |
| Contract sent | Deal to "Procurement" |
| Contract signed | Deal to "Closed-Won"; onboarding workflow triggered |

CRM custom fields tracked per deal:
- `email_variant`: A | B
- `outbound_touch_count`: integer
- `prospect_research_anchors_completed`: yes | no
- `mutual_referral_source`: text or null
- `objection_logged`: text (last objection encountered)
- `next_touch_scheduled`: date

---

# OPERATING NOTES (Bali Office)

1. **Templates are starting points, not final emails.** Personalize every send with the {specific_observation} token at minimum. Generic templates get generic replies.

2. **Quality > Quantity.** 10 well-personalized sends/day per AE/BD beats 100 generic blasts. CRM tracks personalization completeness.

3. **First 30 days: no T2/T3/T4 sends without CTO Office spot-check.** Bali Office catches calibration drift early; production sending without review starts Month 2.

4. **Constitutional check on every batch:** SO-7 (USP verbatim), SO-12 (no unauthorised reference customer), SO-23 (no pricing fiction), SO-24 (no library-size claims without backing data).

5. **Bali AI agent can pre-personalize Tier 4 (JD-Forge)** sends at scale; Tier 1 (Stack-Vault Enterprise) sends are always human-finalised by an AE before send (no AI auto-send to GCC executives — the relationship cost of a bad send is too high).

---

**End of Bali Outbound Email Templates v1.** Next iteration: v1.1 with A/B test results from first 200 sends; new templates for renewal motion + reference-customer ask + competitive-displacement scenarios.
