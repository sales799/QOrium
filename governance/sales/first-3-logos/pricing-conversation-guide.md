# Pricing Conversation Guide

Per BRAND.md: **always quote pricing as ranges in pre-contract
conversations; firm numbers only at contract signing**. The full
SKU pricing is locked in Constitution §1.2.

This guide is the conversational playbook for handling pricing
questions on discovery + demo + pilot calls.

---

## The 3 SKUs

| SKU | Range | Y1 status |
|---|---|---|
| **ReadyBank API** | $5K-$25K/yr | alpha-shipped |
| **JD-Forge** | $49 / $199 / $499 per JD or pack | alpha-shipped (cred-bound for live LLM) |
| **Stack-Vault** | ₹10L/₹40L/₹1Cr+/yr | watermark-engine-live; tenant isolation shipped Sprint 3.4 |

---

## Range-only discipline

When a customer asks "how much?":

**❌ Wrong:** "₹25 lakhs per year flat for Stack-Vault."
**✅ Right:** "Stack-Vault is in the ₹10L to ₹1Cr+ per year range, depending on your tenant size, customisation, and feature mix. Once we know your scale we'll quote a specific number — typically end of week-2 of pilot."

When a customer pushes:
> "Yeah, but for our size, ballpark?"

**Right response:**
> "For [their size profile] in our pilot conversations, the Stack-Vault subscription has been landing in the ₹25L-₹40L range. The pilot itself is free; the subscription number gets specific once we benchmark the actual usage."

This is honest (it's the band) and respects the locked pricing
Constitution.

---

## Common pricing objections + responses

### "That's higher than HackerRank / Mettl / Codility"

> "Right — and we're not trying to be at their per-seat price point.
> Stack-Vault is a different surface: a fully tenant-isolated
> question library with double-watermark + audit trail + IRT
> calibration. The ROI calc shows where the savings come from —
> mostly false-pass reduction and compliance audit acceleration.
> The right comparable isn't HackerRank's per-seat fee; it's the
> total cost of (tech-screen tool + question authoring + audit
> evidence collection + leakage incident response). On that
> all-in basis, we're typically 30-50% lower over a 2-year window."

### "We can build this in-house"

> "Absolutely — and some of our biggest customers initially
> considered that. Three pieces are usually the surprise: (1) IRT
> calibration with mean-0/sd-1 anchor across cohorts is hard to do
> right (we have a 2PL/3PL Birnbaum + JMLE pipeline that took 4
> months to ship); (2) anti-leak rotation requires a real
> watermarking spec and continuous public-source scanning; (3)
> audit hash-chaining sounds simple but goes wrong in two specific
> places (canonical JSON serialisation + replication lag). We can
> ship those for you in 6 weeks; in-house typically takes 6-9
> months."

### "Can we get a free pilot?"

> "Yes — pilot is free for 30 days. That includes provisioning your
> tenant, seeding 100 calibrated items in your sub-skill of choice,
> and 1 hour of support per week. After 30 days, we either move to
> subscription or part as friends with no charge."

### "Can we get an enterprise discount?"

> "Our pricing already reflects the range. We don't do volume
> discounts at < 1,000 seats. If you're at the very top of the
> Stack-Vault range — > ₹80L commitment — there's a 3-year deal
> structure we offer that nets out to ~15% annual discount in
> exchange for the longer commitment. That's a CEO conversation."

### "What about per-seat pricing?"

> "Per-seat is a Y2 conversation. Today we're at flat-tenant
> pricing because it's simpler and predictable. If you commit
> early (first-3-logos cohort), you get grandfathered into
> flat-tenant pricing for 2 years even after we add per-seat
> tiers."

### "Send me a quote"

> "Happy to. The quote is anchored on three numbers: (1) your
> tenant scale; (2) the SKU mix you want; (3) your pilot timeline.
> Typically I send the quote within 48 hours of pilot kickoff —
> the pilot data refines the number. Want to lock in a pilot
> kickoff call?"

(This avoids quoting a single number before pilot data exists.)

### "We don't have budget for this fiscal year"

> "Understood. Two paths: (1) we lock in a 30-day free pilot now,
> ship results, and you have ammunition for next-FY budget; or
> (2) we add you to our 6-week nurture cadence and revisit when
> your budget cycle reopens. Which fits your style?"

---

## Pilot-to-subscription transition

The pilot is structured to make subscription conversion natural:

| Pilot day | Action | Customer signal |
|---|---|---|
| Day 0 | Pilot kickoff; tenant provisioned; success criteria co-set | engaged |
| Day 7 | First check-in; usage data shared; ROI inputs refined | trust |
| Day 14 | Mid-pilot review; preliminary ROI shared | excitement |
| Day 21 | Pre-conversion conversation; specific subscription quote | budget conversation |
| Day 28 | Final pilot review; subscription proposal sent | decision |
| Day 35 | Subscription signed OR pilot extended OR graceful close | committed |

Convert by day 35. If not converted, move to 6-week nurture; do
not run pilot 2 unless customer brings new champion + budget.

---

## Constitutional pricing locks

Per Constitution §1.2 LOCKED, the canonical SKU pricing is:

| SKU | Tier | Price |
|---|---|---|
| ReadyBank API | Starter / Professional / Enterprise | $5K / $15K / $25K |
| JD-Forge | Single / Pack-10 / Unlimited | $49 / $199 / $499 |
| Stack-Vault | Entry / Pro / Enterprise | ₹10L / ₹40L / ₹1Cr+ |

These cannot change without Constitutional Amendment. Discount
mechanics (3-year grandfather, first-3-logos pricing lock, pilot-
free) are NOT amendments — they're SKU-stable.

---

## Standing Order #2 (USP) compliance in pricing conversation

When pricing comes up, the USP must be present in the same
conversation. Example flow:

> "Stack-Vault Enterprise is in the ₹40L-₹1Cr+ range. What you're
> paying for is **IRT-calibrated** question library + **anti-leak-
> rotated** rotation regime + **watermark-per-candidate** isolation
> at the per-tenant level. The 3-piece moat is the differentiator;
> the price reflects the moat."

Reinforces the USP at exactly the moment the customer is asking
"why this price?"

---

## Banned in pricing conversations

- ❌ Quoting a single SKU number pre-contract
- ❌ "Per-seat pricing" Y1
- ❌ "Buy 1 get 1" / discount-as-default
- ❌ "Limited time offer" / fake urgency
- ❌ Comparison-bashing competitors ("HackerRank can't do this")
- ❌ Emoji
- ❌ "Synergy" / "best-in-class" / "revolutionize"
- ❌ Claims we cannot defend with code or data

Per BRAND.md voice rules + CTO Constitution + bali/ ops discipline.

---

_Guide is a draft. CEO refines per first-3-logo conversations.
Subscription conversion targets and discount mechanics ratified at
contract stage._
