# Recruiter Subscription Motion — Self-Serve Funnel + AI Agent Outreach

**Motion:** Modes A + B + C (subscription + per-drive + ad-hoc)
**ICP:** IT staffing firms, boutique recruiters, NASSCOM staffing affiliates
**ACV target:** ₹2.4L–18L/year (₹4,999–49,999/month tiers)
**Cycle:** 1–3 months
**Y1 logos:** 30
**Owner:** **AI Agent (engineered M2)** + human escalation per SO-18

---

## Why AI Agent owns this motion (SO-18)

The Recruiter motion has unit economics incompatible with founder-led sales:

- ACV: ₹2.4L–18L/year (low) → max human-touch budget per logo: ~3 hours.
- Volume: 30 Y1 logos requires ~300 qualified outreach conversations.
- Channel: LinkedIn + email + WhatsApp — formats AI Agent handles natively.

The AI Agent engineers funnel, qualification, and trial conversion. Humans escalate at trial-to-paid conversion >₹50K LTV prediction or any objection requiring SO-overriding judgement.

---

## AI Agent capability spec (Bali Playbook §9 — reproduced)

The Recruiter outreach AI Agent (engineered M2):

1. **Inbound qualification:**
   - Triggers on `qorium.online/contact` + `/demo` form submissions tagged "Recruiter."
   - Auto-classifies tier (₹4,999/mo Lite · ₹19,999/mo Pro · ₹49,999/mo Scale).
   - Sends auto-personalized email with trial pack offer (50 questions, 14 days).

2. **Outbound prospecting:**
   - Pulls qualified Indian IT staffing prospects from LinkedIn Sales Navigator (≥10 active reqs/month, ≥3 technical recruiters on team).
   - Sends 3-touch sequence: LinkedIn connect → LinkedIn DM → email follow-up.
   - Capped at 50 outbound prospects/day to stay under LinkedIn rate limits.

3. **Trial conversion:**
   - Tracks trial-pack engagement (questions viewed, downloaded).
   - Triggers conversion email at day 7 + day 12 of 14-day trial.
   - Auto-applies subscription discount (5%) for trial-to-paid within 7 days of trial end.

4. **Renewal management:**
   - 30 days pre-renewal: usage report + renewal email.
   - Auto-renew on file unless cancellation requested.
   - Escalates to human for any churn signal (login frequency drop >50% in 30d).

---

## AI Agent → Human escalation triggers (Bali Playbook §9)

Escalate to human BD/AE within 4 business hours when:

- ❗ **Trial-to-paid conversion AND LTV prediction >₹50K** — human closes (warm hand-off + onboarding call).
- ❗ **Objection on pricing** — AI Agent never discounts below 5% off list. Above 5%, human decides.
- ❗ **Stack-Vault interest signal** — recruiter mentions exclusive library or per-customer scoping. Hand off to AE Enterprise immediately.
- ❗ **Contract redline beyond standard ToS** — human reviews; AE Enterprise covers.
- ❗ **Public reference offer** — Talpro India reference call requests handled by human only (SO-12).

---

## Cold outreach — Email (AI Agent template, day 1)

**Subject:** {{first_name}}, fresh question packs for your recruiters — 14-day free trial

Hi {{first_name}},

I'm reaching out from QOrium — we ship calibrated, anti-leak-rotated question packs to IT staffing firms. Your recruiters get fresh content per drive, watermarked per candidate, in 20+ platform formats.

The pricing tiers are simple:

- **Lite** (₹4,999/mo): 1 recruiter, 200 questions/month, 5 stacks
- **Pro** (₹19,999/mo): 5 recruiters, 1,000 questions/month, all stacks
- **Scale** (₹49,999/mo): 20 recruiters, unlimited, priority support

We have a 14-day free trial — 50 questions you can hand to recruiters today, no credit card required. The Day-0 cohort runs at the same anti-leak SLA as our enterprise customers.

Want to start the trial? [start_trial_link]

— QOrium · qorium.online · trial expires in 14 days, no auto-charge.

---

## LinkedIn DM (AI Agent template, day 2)

> Hi {{first_name}} — just sent an email about fresh question packs for IT staffing. 14-day free trial, ₹4,999/mo when ready. Worth a look for your team's drives this quarter? [trial_link]

---

## Follow-up email (AI Agent template, day 7)

**Subject:** Did the question pack reach your recruiters?

Hi {{first_name}},

Quick check-in — did the trial pack reach your recruiters? If yes and they're using it, the conversion to a paid tier is straightforward. If not, I can pull together a more targeted pack for your typical stacks (Java/Salesforce/SAP/data-engineering — what's the mix?).

Either way, here's the pricing for clarity: Lite ₹4,999/mo · Pro ₹19,999/mo · Scale ₹49,999/mo. No setup fees, monthly billing, cancel anytime.

— QOrium

---

## Trial conversion email (AI Agent template, day 12 of 14-day trial)

**Subject:** Trial expires Tuesday — keep your recruiters on QOrium?

Hi {{first_name}},

Your QOrium trial expires Tuesday {{date}}. From the trial dashboard, your team has used {{N}} questions across {{M}} drives this fortnight. That's a healthy use case for the Pro tier (₹19,999/mo, 1,000 questions/month, all stacks).

If you convert to a paid plan within 7 days of trial end, I can apply a 5% loyalty discount on the first 3 months. Just reply with the tier you want and we'll send the link.

— QOrium · trial dashboard: [link]

---

## Human escalation script — AE pickup (when LTV >₹50K predicted)

When the AI Agent escalates a high-LTV trial-to-paid conversion, the human AE follows up with this script (call or video):

> Hi {{first_name}} — saw your team is converting from the trial. Wanted to spend 15 minutes to make sure you're scoped right. Are you at Pro or Scale? I want to walk you through onboarding — the role-graph integration, the watermark forensics for your client deliverables, and how we handle stack expansions when your drives shift. Got 15 minutes Wednesday or Thursday?

Outcomes:

- **Pro tier closer:** confirm tier, walk through onboarding, schedule kickoff call.
- **Scale tier upgrade:** if recruiter team count, drive volume, or stack breadth justifies, propose Scale with a 5% loyalty discount.
- **Enterprise upgrade signal:** if recruiter mentions exclusive library, ≥10 recruiters, or named client deliverables — hand off to AE Enterprise for Stack-Vault scoping.

---

## Content moderation (AI Agent guardrails)

The AI Agent NEVER:

- Discounts below 5% off list (escalates to human).
- Quotes Talpro India as a reference without human approval (SO-12).
- Engages with prospects in OBSOLETE or DIRECT POSITIONING COMPETITOR companies (Constitution §2.7).
- Sends more than 3 unsolicited touches to a single prospect (anti-spam).
- Promises features not in the published SKU spec (per SO-24 recursive no-fiction rule).

---

## Metrics + reporting

The AI Agent reports daily into the Bali pipeline tracker:

- Outbound touches sent
- Inbound conversion rate (form submission → trial)
- Trial-to-paid conversion rate
- Tier mix (Lite / Pro / Scale)
- Escalations to human (count + reason)
- Churn signals flagged

Weekly summary lands in Mon weekly forecast (`templates/weekly-forecast.md`).

---

_Cross-references: Bali Playbook §3.3 (Recruiter motion), §6.3 (Self-serve commercial), §9 (AI Agent + Human Hybrid). Constitution SO-12, SO-18, SO-24._
