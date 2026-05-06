# Email Template — 04 Churn Flag (Active Subscriber, Drop in Engagement)

> **Trigger:** Active paid subscriber with login-frequency drop >50% in last 30 days. The agent does NOT save the customer — it flags the customer for human win-back. This template is the FIRST contact only.
> **Channel:** email.
> **Validator:** G1, G3, G6, G10. Plus: this template ALWAYS escalates regardless — see "Always-escalate" below.

---

## Why this template exists

Churn signals require human-led save conversations. The agent's job is:

1. Detect the signal (login-frequency drop >50% in 30d).
2. Send a single warm check-in email (this template).
3. Escalate to Bali human within 4 business hours.

The agent does NOT:
- Offer discounts to retain (G1)
- Promise feature additions (G6)
- Negotiate downgrade pricing (escalate)
- Cancel subscription on prospect's behalf (humans process cancellations)

---

## Variables

| Variable | Source | Example |
|---|---|---|
| `{{first_name}}` | CRM contact record | Priya |
| `{{tier}}` | Active subscription tier | Pro |
| `{{last_drive_date}}` | Most recent drive that used QOrium questions | 2026-04-12 |
| `{{usage_drop_pct}}` | Last-30d usage / prior-30d usage | 67 |

---

## Email body

**Subject:** Quick check-in on QOrium — anything we should adjust?

Hi {{first_name}},

I noticed your team's QOrium usage has been lighter the past few weeks ({{usage_drop_pct}}% below your typical pattern). The last drive that used QOrium questions was {{last_drive_date}}.

A few possibilities I wanted to surface:

1. **Drives shifted stacks?** If your hiring has moved to stacks we don't cover deeply enough, let me know — we can prioritize coverage in our next content wave.
2. **Recruiter team change?** If you have new recruiters who haven't onboarded yet, happy to set up a 15-minute walkthrough.
3. **Different test format need?** If your clients are asking for a format we don't ship, that's important feedback.

Or — if QOrium just isn't fitting the workflow right now, that's also useful to know. We'd rather hear it.

Reply when you have 30 seconds. I'll have someone from our team reach out within 4 business hours to make sure we understand.

— QOrium

---

## Always-escalate

This template ALWAYS triggers a human escalation in addition to sending the email. The escalation envelope (per `bali/ai-agent/escalation-rubric.md`) includes:

- Account name, tier, contract value
- Login-frequency timeline (last 90 days, weekly bucketed)
- Last 5 drives the prospect ran QOrium against
- Any prior support tickets / CRM notes
- Recommended human action: "Schedule 30-min save call within 7 days"

---

## What the agent does NOT do

- Negotiate pricing to save the customer (G1)
- Offer features not in the SKU spec (G6)
- Promise quarterly content waves on specific stacks (escalate to CEO if customer requests roadmap commitment)
- Cancel the subscription
- Process a downgrade (Lite → Pro etc.)

All of these are human territory.

---

## Performance metrics

Track per template instance:

- Reply rate (target: ≥30% — engagement signal even if low value)
- Reactivation rate (logins return to baseline within 30 days post-email): target ≥40%
- Win-back close rate (account stays subscribed at next renewal): target ≥60%

If reactivation rate <30% sustained, propose template variant in monthly business review.

---

## Cadence

This template fires AT MOST once per 90 days per account. If churn signal persists after the email + human save call, the next escalation goes to AE Enterprise (potential downgrade conversation) — NOT to this template again.

---

*Authority: Bali Sales Playbook §9 (escalation triggers — churn signals flagged), §13 (Customer Success & Renewal). Constitution SO-1, SO-12, SO-18, SO-24.*
