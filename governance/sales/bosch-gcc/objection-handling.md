# Objection Handling — Bosch GCC

8 likely objections + crisp responses. Pre-rehearse to avoid
fumbling on the call. Each response is ≤ 60 seconds spoken.

---

## Objection 1 — "You're a startup; what if you fail?"

**Customer subtext:** "We need a vendor who'll be around in 5
years."

**Response:**

> "Fair concern. Three protections we've engineered for exactly
> this question:
>
> 1. **Per Constitution Article IX, no destructive migration on
>    release-tagged schema.** This is a public commitment — your
>    audit log + assessment data + watermark traces remain
>    accessible even in a fork or acquisition scenario.
>
> 2. **Customer-data export-on-demand is contractual.** Your
>    Stack-Vault tenant data is isolated at schema level + per-
>    tenant pepper; you can pull a complete CSV export at any
>    point during contract.
>
> 3. **Customer-Zero anchor.** Talpro is our first customer; we're
>    co-investing in their success because the founder has 15
>    years in this industry. We're not a 6-month-old experiment.
>
> What's an acceptable risk-mitigation for Bosch in your standard
> MSA template?"

(End with a question that returns the conversation to mutual problem-
solving.)

---

## Objection 2 — "We already use HackerRank / Mettl. Why switch?"

**Customer subtext:** "Switching costs are high; show me 5x value."

**Response:**

> "We're not asking Bosch to switch. We're asking for a 30-day
> pilot in one specific surface — Embedded Automotive senior
> engineering tech-screen — where the value-add is most concrete
> for Bosch's scale + compliance posture.
>
> If the pilot confirms what the conservative ROI projection shows
> (~₹2Cr Y1 net, 7-month payback), the next conversation is
> 'expand QOrium to N more sub-skills.' If not, no charge, friendly
> close.
>
> The decision isn't switch-or-don't — it's pilot-or-don't."

(Re-anchor on pilot. Reduce switching anxiety.)

---

## Objection 3 — "Your ROI projection looks high"

**Customer subtext:** "I don't believe these numbers."

**Response:**

> "Conservative scenario for your scale (~10K engineers) is ₹1.9Cr
> Y1 net. The aggressive scenario is ₹11Cr — and yes, that's
> stretchy. We'd never commit to the aggressive number in a
> contract.
>
> The headline contributor is false-pass reduction. That's the
> hardest line to attribute, and Bosch's CFO will rightly discount
> it. Even at 30% reduction (vs. our cited 40-50%), savings are
> still ₹4Cr+ on a 10K-candidate flow at ₹30L average bad-hire
> cost.
>
> The pilot tightens these numbers. We commit only to the
> conservative scenario in subscription discussion."

---

## Objection 4 — "What about IP / proprietary content concerns?"

**Customer subtext:** "Will you license our internal Bosch
content / will Bosch IP leak?"

**Response:**

> "Three sides to that.
>
> First, QOrium ships our own library — we don't ingest customer
> content into the shared library. If Bosch ships proprietary
> content into Stack-Vault, it stays in your tenant + your pepper
> + your audit trail.
>
> Second, anti-leak runs on QOrium's library + your tenant
> separately. We never cross-reference Bosch's content against
> public-source.
>
> Third, the SOW protects Bosch's content as Confidential
> Information for 5 years post-term, similar to standard
> enterprise contracts. We can extend if needed.
>
> Want me to send the standard MSA template for legal review
> alongside the pilot kickoff?"

---

## Objection 5 — "We need on-prem. SaaS is hard for our German
parent."

**Customer subtext:** "Data sovereignty is non-negotiable."

**Response:**

> "Honest answer: SaaS-only Y1. Multi-region terraform (Sprint 5.0)
> is ready; we can deploy a Bosch-dedicated cell in EU region
> after cred-drop.
>
> If German parent's audit says 'on-prem only,' the right answer
> is co-engineering — Bosch deploys on their own AWS account,
> QOrium maintains the application layer. We've drafted that
> conversation; haven't shipped it yet.
>
> What does the German parent's actual audit constraint say —
> region-locked SaaS, dedicated tenancy, or full on-prem?"

(Force the customer to name their actual constraint, not a vague
"on-prem" demand.)

---

## Objection 6 — "Procurement wants RFP / detailed specs"

**Customer subtext:** "This needs to go through formal process."

**Response:**

> "Understood. Two paths.
>
> Path A: pilot first, RFP second. Bosch runs the 30-day free
> pilot; pilot data feeds the RFP. RFP cycles take 12+ weeks; the
> pilot data can be in the RFP itself.
>
> Path B: RFP first. We can fill an RFP today. Heads-up: we'll
> ask for the standard 6-week response window; we don't do 2-day
> RFPs.
>
> Most large customers go A. The pilot data is the strongest RFP
> response. Which path fits Bosch's procurement?"

---

## Objection 7 — "Your library doesn't have [niche skill]"

**Customer subtext:** "We hire for [X] which you don't cover."

**Response:**

> "Right — we have 13 sub-skills at 100/100 today. If Bosch's
> hiring includes [their niche skill] and it's not in our library,
> two paths.
>
> First: SME Content Lead hire is in flight Q3. Bosch's needed
> sub-skill could be a Y1 priority for their first 200 items.
>
> Second: custom item authorship is a paid SKU. ₹5L-₹15L per
> quarter for a focused content track. Bosch funds the authoring;
> we own the calibration + maintenance.
>
> Which approach fits — wait for our roadmap or fund the
> authorship?"

---

## Objection 8 — "We don't have budget this quarter"

**Customer subtext:** "Timing isn't right" OR "I'm being polite
about saying no."

**Response:**

> "Two paths.
>
> First, the 30-day pilot is free. Pilot doesn't need budget; runs
> on QOrium's commercial discretion. Pilot data lives forever;
> Bosch can choose to commit to subscription next FY.
>
> Second, if the timing concern is real, when's the next budget
> cycle? We can pre-position for that — the pilot now, subscription
> proposal then.
>
> Which fits — pilot now + budget later, or step away entirely
> until next FY?"

(The "step away entirely" option calls the customer's bluff if
they were being polite. Most will choose the pilot.)

---

## Universal closing for any objection

> "Two ways forward. Pilot kickoff next month, or we close the
> loop today and reach back in 6 weeks. Which works for Bosch?"

(Force a binary decision. Don't leave open-ended.)

---

## What to NEVER say

- ❌ "Don't worry about that, we'll figure it out"
- ❌ "Trust me"
- ❌ "Other customers have asked the same thing"
- ❌ "We can do anything if the price is right"
- ❌ "[Competitor] does it that way and it's wrong"
- ❌ Emoji in objection responses
- ❌ Anything that promises features beyond shipped capability

## What to ALWAYS do

- ✅ Acknowledge the concern explicitly
- ✅ Surface 2-3 paths forward
- ✅ End with a question that returns conversation to mutual
     problem-solving
- ✅ Offer the pilot as risk-mitigation
- ✅ Reference Constitution / shipped capability for credibility
- ✅ Reference USP fragments per Standing Order #2

---

## Stop conditions

If customer pushes on:

- **Skip IRT calibration** → halt; this touches Constitution
  Article I; CTO Office consultation
- **Disable watermark** → halt; this touches anti-leak architecture
  + Standing Order #2; CTO Office consultation
- **Free unlimited subscription** → halt; per Constitution §1.2 LOCKED
  pricing, this is non-negotiable; CEO consultation
- **Co-engineering deep partnership** → escalate; CEO + CTO joint
  decision; not a discovery-call commitment

---

_Objection handling is a draft. CEO rehearses + refines pre-call.
First-call experience becomes calibration baseline._
