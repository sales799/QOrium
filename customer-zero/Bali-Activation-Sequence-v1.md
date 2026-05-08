# Bali Activation Sequence — First Logo Push (Post-SES)

**For:** CEO Bhaskar + Manthan (intro broker)
**Filed:** 2026-05-08
**Refs:** `customer-zero/Sales-Outreach-Playbook-v1.md`, Constitution Article II (Bali Office), `governance/CEO-Decision-Packet-2026-05-08.md` §6
**Trigger:** AWS approves SES production access (Branch A), candidate emails can leave sandbox

---

## Why this sequence exists

The sales playbook has the templates. This document has the **24-hour activation sequence** — what happens minute-by-minute the day SES sandbox lifts, so we don't lose momentum waiting for "the right time".

CEO directive earlier this session: *"Lets finish our Platform first End to End. We can outreach and talk to client later once its live."*

"Live" = SES prod-access approved + first real Talpro candidate run + result page polished. When SES flips, Bali activates within 24 hours.

---

## Pre-flight checklist (before activating)

The agent will not send the kickoff WhatsApp/email to Manthan until ALL of these are green:

- [ ] AWS SES production access approved (case 177825922400683 → Status `Resolved` with positive reply text)
- [ ] One non-sandbox test email sent successfully from `noreply@qorium.online` to `bhaskar@talpro.in` with DKIM+SPF+DMARC pass headers
- [ ] Talpro CTO Saturday sandbox run completed (Customer-Zero validation; bucket-A fixes applied)
- [ ] Marketing apex deployed on `qorium.online/` (Lane B4 deliverable; Cloudflare Pages or Hostinger nginx)
- [ ] Privacy + DPDPA pages reachable at `qorium.online/privacy` + `qorium.online/dpdpa`
- [ ] Calendly link active at `https://calendly.com/bhaskar-qorium/15-min-demo` (or equivalent; agent can configure via Calendly MCP once chosen)

If any item is red, the activation pauses and the agent flags to CEO. No partial activation.

---

## T-0 — Activation hour

**When:** First weekday morning IST after all pre-flight green
**Decision-maker:** CEO Bhaskar (final go/no-go)

### T-0:00 — CEO confirms green

```
CEO message to agent: "BALI GO"
```

Agent confirms: pre-flight checklist all green; today's logo target is Razorpay (per playbook Wave-1 priority).

### T-0:05 — WhatsApp to Manthan

CEO sends to Manthan (template from sales playbook D, customised):

```
M, when you have 5 min — can you ping [Razorpay VP Eng / Eng Director name]
and ask if they'd be open to a 15-min call with me about QOrium?

Context:
- They likely pay Mettl ₹15-25L/yr for tech assessments
- Our angle: India-built, owned content (no vendor licensing squeeze),
  anti-leak engine catches Glassdoor/Reddit leaks within 24h
- Time-window: any 15 min over next 3 weeks
- If they bite: I'll do the rest; you don't have to be on the call

Thanks,
B
```

CEO sends + tells agent: "M ping sent."

### T-0:30 — Agent loads HubSpot

Agent uses HubSpot MCP to:
- Create a Deal in stage `Prospect Identified` for Razorpay
- Add Contacts: target VP Eng + Manthan (broker)
- Set close-date estimate: T+45 days (per playbook close-cycle)
- Add note: "Manthan ping sent T-0:05; awaiting response"

CRM is private — does NOT commit to git.

### T+1 day — Follow-up if no Manthan reply

If Manthan hasn't responded in 24h:
- Agent drafts WhatsApp to CEO: "Day 1 since M ping; consider a friendly nudge?"
- CEO sends: "Hey M, any luck on the Razorpay ping?"

### T+3 days — If Manthan got "yes from target"

Manthan to CEO: "[Target name] is open. I'm CC'ing you — go from here."

CEO replies to Manthan + target:
```
Subject: QOrium for Razorpay — 15 min on Tuesday?

Hi [first name],

Manthan suggested I reach out. He thought you might be one of the few
people in Razorpay engineering who'd care about this honestly.

Quick context:
We launched QOrium last month — India-built tech-hiring assessment
platform, role-graph-native. Three things differentiate vs Mettl/SHL:

1. Question library is owned + IRT-calibrated (1,300+ questions across
   Java/Python/React/SQL/DevOps/SF/AWS/AIPE - not licensed from a
   vendor that can squeeze your pricing).

2. Anti-leak engine catches questions that escape to Glassdoor/Reddit
   within 24h (with attribution to the leak source).

3. Stack-Vault tier - exclusive customer library with double watermark
   for IP-sensitive use cases.

15-min live demo on Tuesday? I'll show you the platform actually
working with real candidate data (anonymized), not a slide deck.

If interesting: reply with 2-3 time slots.
If not: tell me, I won't waste your inbox.

Thanks,
Bhaskar Anand
CEO, QOrium
+91-XXXXX-XXXXX
bhaskar@qorium.online
```

(CEO uses qorium.online address now since SES prod-access is live.)

### T+3 days — If target says "yes, when?"

CEO + target schedule via Calendly link (https://calendly.com/bhaskar-qorium/15-min-demo).

CEO tells agent: "Razorpay demo booked Tue 11 AM IST."

Agent:
- Updates HubSpot deal stage: `Demo Scheduled`
- Calendar event auto-created via Calendly Calendar MCP
- Sends CEO a pre-demo brief PDF (via email draft Gmail MCP):
  - Recap of who's in the meeting
  - 5 questions to ask in discovery (from playbook discovery questions)
  - The demo flow (15-min agenda from playbook)
  - The "what I won't promise" list (anti-overpromise reminder)

### T+demo day, 1h before — Pre-demo polish

Agent verifies live:
- `https://api.qorium.online/healthz` returns 200
- Recruiter login works (manual smoke test recommended)
- Candidate take flow loads
- Result page renders

If anything is red, CEO notified immediately; demo can pivot to "remote screen-share + Q&A" instead of live click-through.

### T+demo, post-meeting — Debrief

CEO sends agent: "Demo done. They asked X, Y, Z. Felt warm."

Agent:
- Updates HubSpot deal: stage moves to `Discovery Done` or `Proposal Stage`
- Drafts the follow-up email per playbook (24h SLA):
  - Recap of what was discussed
  - The exact pricing band recommended (per playbook ICP→tier mapping)
  - Proposed next step (3 options: another technical demo, pilot SOW, contract)
- CEO reviews + sends

### T+7 days — If silent

CEO sends template C from playbook:
```
Hi [first name],

Following up on the note from last week. Three quick options:
(a) Calendar's tight - happy to wait 3 weeks
(b) Not the right time / not interesting - totally fine, just tell me
(c) Forward to whoever should look at this

- Bhaskar
```

### T+14 days — If still silent

Move to Razorpay-deferred bucket. Activate Logo #2 (Persistent Systems).

---

## Logo #2 + #3 (parallel after Razorpay demo, NOT Day 1)

**Constraint:** the playbook's stop-condition rule — *"don't engage all 12 in week 1; logos close serially, not in parallel."*

**Operationalised:** activate Logo #2 (Persistent) only AFTER:
- Razorpay demo done OR
- Razorpay 14-day silent + deferred

Same flow for Persistent Systems (Wave-1 #2) and HDFC Tech (Wave-1 #3) when their windows open.

Then Wave-2 (CRED, Bajaj Finserv Tech, Scaler) — only after Wave-1 is in-flight or shelved.

---

## What the agent CANNOT do (Charter §3 stop conditions)

- Send the WhatsApp / email itself (outbound communication = CEO action)
- Choose the target name within Razorpay (CEO + Manthan know best who'll bite)
- Negotiate pricing below Constitution §1.2 floor (LOCKED)
- Sign a contract / SOW (CEO action; legal review by K&S Partners)
- Promise features that aren't shipped (anti-overpromise list)

What the agent DOES own:
- Pipeline tracking in HubSpot (CRM, NOT git)
- Pre-demo brief authoring
- Post-demo follow-up email drafting
- Stop-condition triggering (warning CEO when 14-day silent)
- Master metric dashboard refresh on every stage advance

---

## Stop / pivot triggers

Pause Bali sequence and re-plan if any of:

| Trigger | Action |
|---|---|
| 3 consecutive logos: 0 demos booked from warm intro | Bali doing wrong message; revise positioning before logo #4 |
| 3 demos: 0 second-meeting requests | Product gap, not sales gap; pause Bali, run UX research with Talpro Delivery Head |
| AWS SES sandbox limit hit (200/day) | Email outbound throttled; CEO works around (personal email for high-priority threads) until limit lifted |
| Cloudflare outage (api.qorium.online down >2h) | Pause active demos; reschedule with apology |
| Question content leaked to Glassdoor with QOrium watermark intact | Anti-leak moat proof of value; convert into a press release |

---

## Success metrics (60-day target post-activation)

- ≥1 demo booked per week
- ≥1 of first 3 demos asks for a second meeting
- ≥1 first-3-logo signed a Letter of Intent or pilot SOW within 60 days
- HubSpot pipeline shows ≥6 active deals across stages

If 60-day target missed: trigger AE-hire-first per playbook stop-condition (CEO direct outreach not the bottleneck; need volume only an AE provides).

---

**End of sequence v1.** Reviewer: CEO + Manthan. Author: CTO Office (autonomous agent), 2026-05-08. Activation gated on AWS SES Branch A approval + remaining pre-flight items.
