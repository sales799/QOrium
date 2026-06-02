# Bali Inbound Response Templates v1

**Purpose.** Ready-to-send response templates for replies to QOrium outbound emails (per `Bali-Outbound-Email-Templates-v1.md`). Covers the full reply landscape: positive interest, sample-pack requests, objections-in-thread, scoping conversations, late-stage commercial replies, and the "not now" flow.
**Author.** CTO Office · Run #12-Bali · 2026-05-03
**Status.** v1 — production-ready
**Pairs with.** Bali Outbound Email Templates v1, Bali Sales Playbook (Doc 08), CRM Playbook

---

## How to Use This Library

Inbound replies fall into 8 categories. For each, this library provides the response template + the CRM stage transition + the next action.

| Reply category | Template ID | CRM transition | Next action |
|---|---|---|---|
| Positive — wants demo | IR-01 | "Outbound Sent" → "Discovery Scheduled" | Book demo via Calendly |
| Positive — wants sample pack first | IR-02 | "Outbound Sent" → "Sample Pack In Production" | CTO Office produces; AE delivers |
| Positive — wants info / collateral | IR-03 | "Outbound Sent" → "Engaged" | Send 1-pager + schedule follow-up |
| Soft no — "send me more later" | IR-04 | → "Cooling — Re-touch Q+1" | Set 90-day reminder |
| Hard no — explicit "not interested" | IR-05 | → "Closed-Lost — Reason" | Capture reason; revisit Q+2 |
| Wrong person — referral to colleague | IR-06 | Original deal closed; new deal opened | Re-route + thank original |
| Out of office — defer | IR-07 | → "OOO — Re-touch on Return" | Set return-date reminder |
| Objection-in-thread | IR-08 (multi) | Stay at current stage | Use specific objection-handler from outbound library |

---

# IR-01 — Positive Reply: Wants Demo

**Trigger:** Prospect replies with intent to schedule a discovery call (any phrasing — "happy to chat", "let's set up time", "this week works", etc.)

**Reply template:**

> Hi {first_name},
>
> Excellent — looking forward to it.
>
> Booking link: {calendar_link} — pick any 30-minute slot that works.
>
> Two things I'll bring:
>
> 1. **5-slide QOrium pre-brief** — covers the model, the 3 SKUs, and the wedge in 90 seconds (so we spend the call on YOUR questions, not on QOrium's pitch)
> 2. **{tier-specific asset}** — {Stack-Vault One-Pager (Tier 1) / Department Stack-Vault One-Pager (Tier 2) / API reference + sample 100-Q output (Tier 3) / JD-Forge One-Pager + sample JD-to-pack (Tier 4)}
>
> {Tier 1+2 only:} If you want a sample 50-question pack on your highest-volume role to evaluate ahead of the call, just reply with the role + tech stack and I'll have it to you 48 hours before we meet.
>
> See you {next_week / specific_day}.
>
> {sender_first_name}

**CRM transition:** "Outbound Sent" → "Discovery Scheduled"
**Auto-tasks created:** (1) Pre-brief PDF auto-attached to Calendly invite; (2) Sample-pack production task to CTO Office if requested; (3) Discovery call agenda template loaded.

---

# IR-02 — Positive Reply: Wants Sample Pack First

**Trigger:** Prospect replies "send the sample pack" or "let me see the questions before we talk"

**Reply template:**

> Hi {first_name},
>
> Sample pack incoming. To make sure it lands at the right quality bar:
>
> 1. **Role:** {confirm_role} — confirming this is the role you want the sample for
> 2. **Stack:** {confirm_stack} — confirming the specific tech (e.g., Java + Spring Boot + Postgres, or Salesforce Apex + LWC + Lightning Flow)
> 3. **Difficulty mix:** Default is 30% medium / 50% medium-hard / 20% hard. Reply with "default" or specify your own.
> 4. **Format mix:** Default is 60% MCQ / 30% coding / 10% scenario-based. Reply with "default" or specify.
>
> I'll have the 50-question pack to you in 48 hours. Two pieces of context for your panel review:
>
> - Every question is AI-authored + SME-validated + IRT-calibrated (not random AI output)
> - Every question is anti-leak filtered against Glassdoor, GitHub, LeetCode discussion
>
> What I'd like back from your panel: pass/fail per question on technical accuracy + signal strength. Even harsh feedback is useful — we'd rather catch a weak question now than ship one to {company}.
>
> Reply with the 4 details above and I'll start production.
>
> {sender_first_name}

**CRM transition:** "Outbound Sent" → "Sample Pack In Production"
**Auto-tasks created:** (1) Sample-pack request ticket to CTO Office with prospect's spec; (2) 48-hour SLA timer; (3) AE follow-up task scheduled for "5 days after delivery to ask for feedback"

---

# IR-03 — Positive Reply: Wants Info / Collateral (No Specific Ask)

**Trigger:** Prospect replies with curiosity but no specific commitment ("interesting — tell me more", "what does this look like?", "send me your deck")

**Reply template:**

> Hi {first_name},
>
> Glad it caught your attention. Three quick things:
>
> 1. **Attached: QOrium One-Pager** — 90-second skim of what we do and why
> 2. **{Tier-specific}: {Stack-Vault One-Pager (T1+2) / API Reference (T3) / JD-Forge One-Pager (T4)}** — pricing + scope + integration
> 3. **Public link:** qorium.online (live in 2 weeks; in the meantime the One-Pagers above cover the essentials)
>
> Two paths from here:
>
> - **Fast path:** 30-min discovery call (here's my Calendly: {calendar_link}) where I walk through specifically how this works for {company}'s {stack_anchor} hiring
> - **Patient path:** I send you a sample 50-question pack on your highest-volume role; you and your engineering panel evaluate at your own pace; we talk if and when the quality clears your bar
>
> Which works better for {company}? Either is fine; both lead to the same place if QOrium is a fit.
>
> {sender_first_name}

**CRM transition:** "Outbound Sent" → "Engaged"
**Auto-tasks:** (1) One-Pager + tier-specific PDF auto-attached; (2) Follow-up scheduled for 4 days if no reply

---

# IR-04 — Soft No: "Send Me More Later"

**Trigger:** Prospect replies "not now", "interesting but timing isn't right", "circle back in a few months"

**Reply template:**

> Hi {first_name},
>
> Totally understand — timing matters more than fit on these calls.
>
> I'll set a reminder for {Q+1_date} (~90 days out) and re-engage then. In the meantime, two things if useful:
>
> 1. **No-action update:** When QOrium has material news (first marquee customer signed, public launch, new feature), I'll send a single short update. Reply "unsubscribe" if you'd prefer no touches at all.
> 2. **Self-serve resource:** qorium.online will have public sample packs and API docs once we're live (2 weeks). You can evaluate at your own pace without any sales conversation.
>
> Talk in {Q+1_month}.
>
> {sender_first_name}

**CRM transition:** "Outbound Sent" → "Cooling — Re-touch Q+1"
**Auto-tasks:** (1) Calendar reminder set 90 days out; (2) Prospect added to "Material News Update" list (single newsletter monthly max); (3) Re-engagement sequence pre-loaded for Q+1

---

# IR-05 — Hard No: "Not Interested"

**Trigger:** Prospect replies "not a fit", "we don't have a need", "please remove me", or any explicit decline

**Reply template:**

> Hi {first_name},
>
> Understood, and thanks for the direct reply — that's actually rarer than it should be in B2B.
>
> Two quick asks before I close the file:
>
> 1. **One-line reason:** Was it timing, fit, pricing, current vendor, or something else? Even a one-word answer helps us not pitch QOrium to the wrong type of customer in the future.
> 2. **Referral:** If you know anyone in your network who IS struggling with leaked-content erosion in technical hiring, an intro would be appreciated. No pressure if not.
>
> Either way, I'll mark you as not-fit and stop the touches. Best of luck with {company}'s hiring this year.
>
> {sender_first_name}

**CRM transition:** "Outbound Sent" → "Closed-Lost — Reason TBD"
**Auto-tasks:** (1) Lost-reason field captured from reply; (2) Referral request logged; (3) Quarterly anonymized reason analysis (top-5 lost reasons reviewed at quarterly Bali office sync)

---

# IR-06 — Wrong Person: Referral to Colleague

**Trigger:** Prospect replies "this isn't me — talk to {colleague}", "I'm not the right person, please reach out to {colleague}", or forwards to colleague

**Reply template (to original prospect):**

> Hi {first_name},
>
> Thanks for the redirect — much appreciated. I'll reach out to {colleague_name} directly today.
>
> If they confirm interest, I'll loop you back in for visibility. Cheers.
>
> {sender_first_name}

**Reply template (new email to colleague):**

> Hi {colleague_first_name},
>
> {first_name} suggested I reach out directly re: QOrium — we supply enterprise-grade question-bank content for technical hiring at {company}'s scale.
>
> Quick context, no pressure: {first_name} indicated you're the right point of contact for assessment-content decisions. The relevant fit for {company}: {tier-specific 1-line pitch — Stack-Vault for T1+2, API for T3, JD-Forge for T4}.
>
> Two paths:
>
> 1. 30-min discovery call (Calendly: {calendar_link})
> 2. Sample 50-question pack on your highest-volume role for your engineering panel to evaluate
>
> Which works better for {company}?
>
> {sender_first_name}
> (CC: {first_name} for visibility)

**CRM transition:** Original deal moved to "Re-routed"; new deal opened on colleague at "Outbound Sent"
**Auto-tasks:** (1) Original deal closed with reason "Re-routed"; (2) New deal opens; (3) Both kept linked in CRM for visibility

---

# IR-07 — Out of Office

**Trigger:** Auto-reply or explicit OOO message

**Reply template (auto-defer; no human send):**

> {No reply needed — CRM auto-defers based on OOO date}

**CRM behavior:** OOO date parsed from auto-reply. CRM auto-schedules re-touch on return date. No human action.

**CRM transition:** Stay at current stage; "OOO — Return Date" custom field updated
**Auto-tasks:** (1) Re-touch task scheduled for return date + 2 days; (2) Original outbound preserved in CRM; (3) Single-touch reminder when re-engaging

---

# IR-08 — Objection-in-Thread (Multiple Variants)

**Trigger:** Prospect replies with one of the common objections (price, in-house team, IP, fit, etc.)

**Use the corresponding objection-handler from the outbound templates library.** Do NOT improvise — the outbound library's objection handlers are calibrated.

| Objection raised | Use template |
|---|---|
| "We already have HackerRank/Mettl" | T1E.1 / T2E.2 / T3E.3 |
| "Pricing is too high" | T1E.2 / T2E.1 |
| "How do we know quality?" | T1E.3 / T3E.2 |
| "IP / who owns the questions?" | T1E.4 / T2E.3 |
| "Why not build in-house?" | T1E.5 / T3E.1 |
| "Procurement will take 6 months" | T1E (custom; bridge with JD-Forge subscription as Phase 0 pilot) |
| "Anti-leak isn't a buying criterion" | T3E.4 |
| "Subscription locks us in" | T4E.4 |
| "We're exploring AI in-house" | T3E.6 |
| "Trial sounds too good — what's the catch?" | T4E.3 |

**CRM transition:** Stay at current stage; objection logged to deal record
**Auto-tasks:** (1) Objection captured to deal `objection_logged` field; (2) Quarterly objection-frequency analysis (top-5 objections reviewed at quarterly Bali office sync; templates iterated)

---

# IR-09 — Late-Stage: Procurement Questionnaire

**Trigger:** Prospect (typically Tier 1 or Tier 2 enterprise) sends a procurement / vendor security questionnaire

**Reply template:**

> Hi {first_name},
>
> Thanks for sending — vendor security review is the right next step.
>
> Two paths to make this efficient:
>
> 1. **Standard responses:** I'll route the questionnaire to our CTO Office today. Most enterprise questionnaires (SIG, CAIQ, custom) take 5–7 business days for our team to complete with full evidence. We'll send the response + supporting docs (DPA, MSA, security policies, BCP) as one package.
> 2. **Pre-filled responses:** If your questionnaire is the standard SIG-Lite or CAIQ format, we have pre-filled answers and can send same-day. Reply with the format and I'll route accordingly.
>
> Two things I should flag upfront:
>
> - **DPDPA + GDPR compliance:** QOrium is structurally low-risk because we don't store candidate PII by default (we sell content, not assessment results). DPA covers Stack-Vault SME workflow scenarios where SME reviewers see candidate-anonymized data.
> - **Trademark + IP:** Our trademark filings (India + US Class 9 + 42) are with K&S Partners; engagement letter and filing receipts available on request.
>
> What's the questionnaire format and your target turnaround?
>
> {sender_first_name}

**CRM transition:** Move to "Procurement Review"
**Auto-tasks:** (1) Questionnaire routed to CTO Office; (2) 5–7 business day SLA timer; (3) Stack-Vault commercial template pre-loaded for post-procurement signing

---

# IR-10 — Late-Stage: Pricing / Commercial Negotiation

**Trigger:** Prospect (typically post-discovery) asks for pricing details or wants to negotiate commercial terms

**Reply template:**

> Hi {first_name},
>
> Happy to walk through the commercial terms. Three things to share upfront:
>
> 1. **Pricing transparency:** {Tier-specific — Stack-Vault Department ₹10L/year, Enterprise ₹40L/year, Group ₹1Cr+/year for T1; ReadyBank API $5K-$25K/year for T3; JD-Forge $49 Standard / $199 Reviewed / $499 Enterprise per JD or subscription tiers for T4}. These are list prices; first 5 customer logos get a 12-month price lock + reference-customer discount on renewal.
>
> 2. **Negotiation levers (in order of preference):**
>    - Multi-year commitment for 5–10% discount (2yr = 5%; 3yr = 10%)
>    - Annual prepay for 5% discount (improves our cash flow)
>    - Reference-customer commitment for 5–10% renewal discount (you agree to be a public reference; we discount your renewal)
>    - Bundle (Stack-Vault + JD-Forge subscription credits) for combined value
>
> 3. **What we can't discount below:** {Stack-Vault Enterprise minimum ₹35L/year for T1+2; ReadyBank API minimum $5K/year for T3 — these are our anchored floors per Constitution SO-11}.
>
> If you have a specific commercial structure in mind, share it and I'll route to our CEO for sign-off (any deal below the anchored floor requires CEO approval per our pricing discipline).
>
> What's your target structure?
>
> {sender_first_name}

**CRM transition:** Move to "Proposal — Commercial Negotiation"
**Auto-tasks:** (1) Commercial template loaded with prospect's tier; (2) CEO escalation pre-tasked if discount request hits floor; (3) MSA template attached for legal review

---

# IR-11 — Reference Request

**Trigger:** Prospect asks "who else uses QOrium?" or "can we talk to a customer?"

**Reply template:**

> Hi {first_name},
>
> Fair ask. Three references currently active for QOrium:
>
> 1. **Talpro India** — our Customer Zero. Talpro India runs QOrium internally for their IT staffing screening (top 5 roles, 100+ candidates/month). They're the always-available reference and pre-consented to public reference status.
>
> {Plus 2-3 others as they sign — typically Bosch GCC by Month 4 if Stack-Vault Logo #1 closes per Phase 2 plan, plus first 2 platform pilots}
>
> Two paths:
>
> 1. **15-minute reference call:** Pick a reference; I'll connect you directly with the right person on their team. Reference customer + you talk; I'm not on the call. Most direct way to get unfiltered feedback.
>
> 2. **Written case study:** I'll send the 1-page case study for {Talpro India / specific reference}. Less detailed than a call but takes 5 minutes to read.
>
> Which works better for {company}?
>
> {sender_first_name}

**CRM transition:** Move to "Reference Requested"
**Auto-tasks:** (1) Reference customer alerted (15-min call confirmation); (2) Written case study auto-attached if requested; (3) Reference outcome captured (positive/neutral/concerned) post-call

---

# IR-12 — Closed-Won: Contract Signed

**Trigger:** Prospect signs the commercial agreement

**Reply template:**

> Hi {first_name},
>
> Welcome to QOrium. {company} is officially our {Nth} signed customer.
>
> Next 14 days — your onboarding sequence:
>
> - **Day 1 (today):** Onboarding Slack channel opens (#qorium-{company}-onboarding); CTO Office added; you + your engineering lead added
> - **Day 3:** Kickoff call (45 min) — we walk through the integration plan + success metrics + first content delivery date
> - **Day 7:** First content batch delivered ({Stack-Vault initial 200 questions / API integration starter / JD-Forge subscription activated})
> - **Day 14:** First-week retrospective (15 min) — calibration on what's working, what to tune
>
> Your dedicated Customer Success contact: {sender_first_name} (this is me; first 10 customers stay direct with the AE through onboarding; CS hire transitions in Month 11)
>
> {tier_specific addons:
> - T1+2: "Sample 50-question pack from your Stack-Vault is being prepared per the spec we agreed; ETA Day 5."
> - T3: "API integration kit including OpenAPI 3.1 spec, Postman collection, and Node.js SDK scaffold incoming."
> - T4: "JD-Forge dashboard access + first 5 JD generation credits already in your account."}
>
> Welcome aboard.
>
> {sender_first_name}

**CRM transition:** "Procurement" → "Closed-Won"; Customer Onboarding workflow triggered
**Auto-tasks:** (1) Slack onboarding channel auto-created; (2) Kickoff call calendar invite sent for Day 3; (3) Content delivery task for Day 7; (4) Retro task for Day 14; (5) Reference-customer ask pre-scheduled for Day 90

---

# APPENDIX A — Response-Time SLAs

Inbound replies must be answered within these targets. CRM tracks; misses are flagged at Friday Bali office sync.

| Reply category | SLA |
|---|---|
| Positive reply (IR-01, IR-02, IR-03) | 4 business hours |
| Hard no (IR-05) | 24 business hours (avoid look of "we only respond to positives") |
| Soft no (IR-04) | 12 business hours |
| Wrong person (IR-06) | 4 business hours (relationship-preservation matters) |
| Procurement (IR-09) | 8 business hours (acknowledge); 5–7 business days (response package) |
| Reference request (IR-11) | 4 business hours |
| Closed-won (IR-12) | Immediate (within 1 hour of contract signature) |

---

# APPENDIX B — When to Escalate to CEO

These reply categories trigger CEO escalation (loop CEO into the email thread):

1. **Bosch GCC reply** (any kind) — CEO is the named relationship owner
2. **Tier 1 prospect requests reference call** — CEO does the connection personally
3. **Pricing negotiation below anchored floor** (Stack-Vault < ₹35L; API < $5K) — CEO sign-off required per SO-11
4. **Tier 1 prospect signed contract** — CEO sends the welcome message personally
5. **Strategic partnership offer** (acquirer, integration partner, exclusive distribution) — CEO handles directly

---

# APPENDIX C — When to Hand Off to CTO Office

These reply categories require CTO Office involvement (Slack ping or task assignment):

1. **Sample pack request (IR-02)** — CTO Office produces; AE delivers
2. **Procurement questionnaire (IR-09)** — CTO Office completes security/compliance sections
3. **Technical discovery deep-dive request** — CTO joins the AE on call
4. **API integration questions** — CTO routes to engineering
5. **Anti-leak / IRT / IO-psych methodology question** — CDO answers via AE relay

---

# APPENDIX D — Templates AVOID Patterns

These patterns underperform in our prospect cohort. Don't use:

- "Just checking in" — generic; weak signal
- "I wanted to follow up" — passive voice; low energy
- "Per my last email" — accusatory tone
- "As discussed" without the actual point being discussed restated
- "Bumping this to the top of your inbox" — explicit inbox-bullying
- Long paragraphs without structure (>3 lines without a break)
- "Hope you're doing well" as opener (skip; get to the point)
- All-positive emoji clusters — read as performative

---

# OPERATING NOTES (Bali Office)

1. **Templates are the floor, not the ceiling.** Every reply gets a 30-second personalization pass before send.
2. **Speed matters more than perfection** in inbound — a fast 80%-good response beats a slow 100%-perfect one.
3. **Closed-Lost replies (IR-05) are intelligence gold.** Capture the reason. Aggregate quarterly. Iterate templates.
4. **Reference customer touch (IR-11)** must always check with the reference first — never volunteer a customer's name without explicit pre-consent.
5. **CRM hygiene is non-negotiable.** Every inbound update CRM stage + custom fields before next outbound or task creation.

---

**End of Bali Inbound Response Templates v1.** Pairs with `Bali-Outbound-Email-Templates-v1.md`. Together they constitute the complete Phase 1 outbound + inbound email playbook for the Top 100 prospect motion.

Next iteration v1.1: A/B test results from first 100 inbound replies; new templates for renewal motion + price-increase notice + churn-risk customer save.
