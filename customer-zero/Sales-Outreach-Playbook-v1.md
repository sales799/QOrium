# Sales Outreach Playbook — First 3 Recruiter Subscription Logos

**For:** CEO Bhaskar + Manthan (intro broker) + (later) AE hire
**Filed:** 2026-05-09
**Refs:** `governance/CEO-Decision-Packet-2026-05-08.md` §6, Constitution §1.2 (SKU pricing LOCKED), `governance/dashboard.json`

---

## Why this playbook exists

Per the CEO Decision Packet §6, **first 3 logos** is the gating milestone for Phase 2 → Phase 3 transition (≥3 paying customers per Constitution Article IX). CEO sales-direct (Option A in packet) is the recommendation for the first 3, then AE hire from M4. CEO + Manthan together have warm-intro paths to 12 ICP-fit candidates (captured in chat 2026-05-09; **not committed to git** per security hygiene — competitor visibility risk).

This playbook is the templates + scripts so CEO outreach takes 10 minutes per logo, not 60.

**Use:** AFTER platform end-to-end live (SES verified + first Talpro CTO sandbox done + at least one screenshot-able assessment + result page polish). Per CEO call 2026-05-08: "Lets finish our Platform first End to End. We can outreach and talk to client later once its live."

---

## ICP recap (from packet §6)

Indian-based recruiting orgs that:
- Currently pay for Mettl / HackerEarth / SHL / iMocha (have budget + understand category)
- 50-500 hires/year (close fast; pay ₹15L/yr+)
- CEO or Manthan can WhatsApp/email a senior contact directly

12 candidates already identified (held in chat). Top 3 wave starts: Razorpay (fastest decision), Persistent Systems (largest deal value), HDFC Bank Tech (banking-vertical anchor).

---

## Pricing one-pager (for use in pitch decks + emails)

Pricing per Constitution §1.2 LOCKED. Anchor prices below; CEO can tier-up per customer; cannot tier-down.

### ReadyBank (SKU 1) — shared question library, API-first

| Plan | Annual price | Calls/year | Best for |
|---|---|---|---|
| Starter | **$5K (~₹4L)** | 50K | Boutique recruiters; replaces 1 Mettl seat |
| Growth | **$10K (~₹8L)** | 200K | Mid-market; 50-200 hires/yr |
| Scale | **$15K (~₹12L)** | 500K | High-volume IT services bench teams |
| Enterprise | **$25K (~₹20L)** | Unlimited | Top 5 candidates per role; Talpro-tier |
| Reserved+ | **$25K + overage** | 1M+ | Custom |
| White-label | **By quote** | — | Reseller deals (separate negotiation) |

### JD-Forge (SKU 2) — on-demand JD-specific question generation

| Tier | Per-JD price | What's included | Status |
|---|---|---|---|
| Standard | **$49** | AI-generated 20Q, JSON/CSV/HackerRank export | Library shipped (`packages/jd-forge`); live service cred-bound |
| Reviewed | **$199** | Standard + 24h SME review pass | Pending SME Lead hire |
| Enterprise | **$499** | Reviewed + custom format + dedicated turnaround | Pending |

### Stack-Vault (SKU 3) — exclusive customer-isolated library + double watermark

| Tier | Annual floor | Annual ceiling | Best for |
|---|---|---|---|
| Bronze | **₹10L** | ₹25L | Mid-tier IP-protective |
| Silver | **₹40L** | ₹80L | Enterprise; Talpro-tier customer-zero |
| Gold | **₹1Cr+** | uncapped | GCC-class (Bosch, Mercedes R&D India, Continental) |

Per-vault pepper rotation, double watermark (visible footer + invisible homoglyph stego), tenant isolation enforced at DB layer. Live in production (Sprint 3.4 PR #26 merged 2026-05-08).

---

## Wave-1 outreach: top 3 logos

### 🥇 Razorpay

**Why first:** Fast decision-making (engineering-led culture); premium price tolerance; if engineering CTO champions, every other Indian product startup follows.
**Likely deal:** ReadyBank Growth or Scale (₹8-12L/yr).
**Warm-intro target:** Engineering Director / VP Eng (NOT TA/HR — they buy what eng asks for).

### 🥈 Persistent Systems

**Why second:** Largest volume = largest deal value; already pays Mettl, so this is vendor-swap not budget-create.
**Likely deal:** ReadyBank Enterprise + Stack-Vault Bronze (₹20L + ₹10L = ₹30L+/yr).
**Warm-intro target:** TA Head OR L&D Head (who owns Mettl spend).

### 🥉 HDFC Bank Tech

**Why third:** Enterprise pricing power + banking-vertical anchor logo; if HDFC Tech buys, ICICI Tech + Axis Tech follow within 6 months.
**Likely deal:** Stack-Vault Silver (₹40L) + ReadyBank Enterprise (₹20L) = ₹60L+/yr.
**Warm-intro target:** Chief Digital Officer / Tech Hiring Head; longer cycle (3 months); biggest brand impact.

---

## Email + WhatsApp templates

Use ONLY after platform end-to-end live.

### Template A — WhatsApp warm-intro (for direct contacts)

```
Hey [first name],

Quick one — built a tech-hiring platform that I think solves a real Mettl pain you've mentioned: [INSERT SPECIFIC ANGLE — e.g., "Apex talent who clear Mettl don't always survive Day 1" / "your cost-per-hire on senior eng is ridiculous" / etc.]

15-min look on Saturday or Monday? Live demo, real platform, no slides. If you tell me it's not interesting in min 5, I owe you coffee.

— Bhaskar
```

### Template B — Cold email (for warm intros via Manthan)

Subject: `QOrium for [Company] — 15 min on Tuesday?`

```
Hi [first name],

Manthan suggested I reach out. He thought you might be one of the few people in [Company] who'd care about this honestly.

Quick context:
We launched QOrium last month — India-built tech-hiring assessment platform, role-graph-native. Three things differentiate vs Mettl/SHL:

1. Question library is owned + IRT-calibrated (1,300+ questions across Java/Python/React/SQL/DevOps/SF/AWS/AIPE — not licensed from a vendor that can squeeze your pricing).
2. Anti-leak engine catches questions that escape to Glassdoor/Reddit within 24h (with attribution to the leak source).
3. Stack-Vault tier — exclusive customer library with double watermark for IP-sensitive use cases.

15-min live demo on Tuesday? I'll show you the platform actually working with real candidate data (anonymized), not a slide deck.

If interesting: reply with 2-3 time slots.
If not: tell me, I won't waste your inbox.

Thanks,
Bhaskar Anand
CEO, QOrium
+91-XXXXX-XXXXX
bhaskar@qorium.online
```

### Template C — Follow-up (5 days no reply)

Subject: `Re: QOrium for [Company] — ping`

```
Hi [first name],

Following up on the note from last week. Three quick options:

(a) Calendar's tight — happy to wait 3 weeks
(b) Not the right time / not interesting — totally fine, just tell me
(c) Forward to whoever should look at this

— Bhaskar
```

### Template D — Manthan-as-broker intro request

Send to Manthan internally:

```
M, when you have 5 min — can you ping [target name at Company] and ask if they'd be open to a 15-min call with me about QOrium?

Context:
- They [pay for Mettl / are vendor-shopping / had an anti-leak incident]
- Our angle: [specific to them]
- Time-window: any time over next 3 weeks
- If they bite: I'll do the rest; you don't have to be on the call

Thanks,
B
```

---

## Demo flow (15 minutes; CEO-driven)

| Min | What to show | Why |
|---|---|---|
| 0-2 | Recruiter login → dashboard tour | "It's real, not a deck" |
| 2-5 | Create a sample assessment for "Senior Python" | Show the role-graph + IRT in action |
| 5-9 | Switch to candidate view → take 2-3 questions | Show watermark engine + take-flow polish |
| 9-12 | Result page → IRT band explanation + anti-leak status | The differentiation |
| 12-15 | Pricing one-pager + "what would you need to feel confident in 30 days?" | Discovery question; closes 70% |

If they ask for Stack-Vault: live-tour the Sprint 3.4 routes (now merged on main); explain double watermark + tenant isolation. ~5 min add-on.

---

## Discovery questions (steal whichever fit the call)

1. **"What does your team currently use for tech hiring assessment?"** — drives compete framing
2. **"Has any of your assessment content ever leaked to LinkedIn/Glassdoor/Reddit?"** — anti-leak hook
3. **"What's your annual Mettl/SHL/iMocha bill?"** — anchors price
4. **"How many hires per year? Senior vs junior split?"** — sizes the deal
5. **"If you found the perfect platform tomorrow, who else would need to say yes?"** — maps decision
6. **"What would you need to see in 30 days to feel confident about a switch?"** — closes the loop

---

## "What I won't promise" anti-overpromise list

The CEO is allowed to say:
- "We're brand new, in early production"
- "Our content is AI-drafted right now; SME-validated by quarter-end"
- "We're sandbox-mode on email today; production access lands in 2 weeks"
- "We don't have an SLA yet; we'll define one before contract"
- "Our ATS integrations are still on the roadmap" (Greenhouse, Workday, Ashby, Darwinbox)

The CEO should NOT say:
- "We have 100 customers" (we have zero)
- "Our content is expert-validated" (until SME Lead onboards + flips ≥600 questions)
- "We integrate with everything" (we integrate with nothing yet — JSON/CSV export + HackerRank import)
- "Compare us to Mettl on enterprise features" (we don't have those features yet)

Honesty is the bigger moat than puffery. Underpromise; overdeliver.

---

## Pipeline tracking (kept OUT of git per security)

Bhaskar maintains in a Google Doc / Notion / private spreadsheet:

| Logo | Stage | Owner | Last contact | Next action | $ value | Days in stage |
|---|---|---|---|---|---|---|
| Razorpay | discovery | Bhaskar | YYYY-MM-DD | demo Tue | $10K-25K | 0 |
| Persistent | warm-intro pending | Manthan | — | M to ping VP Eng | $30L | 0 |
| HDFC Tech | warm-intro pending | Bhaskar | — | LinkedIn DM CDO | $60L | 0 |
| ... | ... | ... | ... | ... | ... | ... |

The agent should NEVER ask the CEO to commit this list to git. If the CEO wants the agent to help tracking, the agent uses Google Drive / HubSpot MCP tools (which the agent has) or the CEO updates the doc directly.

---

## Wave-2 outreach (after first response)

Only start Wave-2 (the other 9 logos) AFTER Wave-1 has had 2-3 weeks to respond. Trying to engage all 12 in week 1 fragments CEO attention; logos don't close in parallel — they close serially.

Wave-2 priority order (best-fit per ICP):
- CRED, Bajaj Finserv Tech, Scaler (tier-2 close cycles)
- LTIMindtree, Coforge (longer multi-stakeholder cycles; defer)
- Zerodha, Masai, Mercedes-Benz R&D India, Cummins (longer / higher-friction)

---

## Stop / pivot triggers

Pivot to AE-hire-first if:
- 3 weeks of CEO outreach with 0 demos booked → CEO outreach not the bottleneck; need volume only AE provides
- 3 demos with 0 second-meeting requests → product gap not sales gap; pause, fix product

Continue CEO direct if:
- ≥1 demo booked per week
- ≥1 of 3 first demos asks for a second meeting / pricing discussion

---

**End of playbook v1.** Reviewer: CEO + Manthan + (later) AE. Author: CTO Office (autonomous agent), 2026-05-09. Pricing locked per Constitution §1.2; templates editable per CEO discretion.
