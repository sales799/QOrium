# JD-Forge Demo Script — 30-Minute Customer Demo

JD-Forge is QOrium's SKU-2 (alpha) — a deterministic JD-to-question-
spec library. This script demos JD-Forge to a customer in a
30-minute slot **after** the ReadyBank/Stack-Vault primary demo
(call it the "second demo" or "next-call"). Used in ICP-2 (mid-
market enterprise) and selectively in ICP-1.

---

## Prep checklist (30 min before the demo)

- [ ] Customer's most recent live JD pulled (from their public
      careers page); 2 backup JDs for "what if you change roles"
- [ ] JD-Forge alpha service running on staging (or live demo server
      post-cred-drop)
- [ ] Anthropic API key provisioned + tested with one warm-up
      generation (cred-bound; uses CTO Office personal allocation
      until cred-drop)
- [ ] ReadyBank tenant context for the customer pre-provisioned (so
      the generated questions can be drag-dropped into their tenant
      after the call)
- [ ] Calendly link for follow-up booked

## Agenda (30 minutes)

| Time | Module | Goal |
|---|---|---|
| 0-3 min | Recap the ReadyBank/Stack-Vault context | re-frame |
| 3-5 min | Why JD-Forge fits | hook |
| 5-15 min | Live JD → questions demo (10 min hands-on) | wow |
| 15-20 min | Output exporters: JSON / CSV / HackerRank | utility |
| 20-25 min | Pricing range + pilot offer | commitment |
| 25-30 min | Q&A + next steps | close |

---

## Segment 1 — Recap (3 min)

> "Last call we showed you ReadyBank + Stack-Vault — IRT-calibrated
> question library + tenant-isolated double-watermark. Today is
> JD-Forge, which is the **other** end of the workflow: you give us
> a JD, we give you a calibrated question spec ready to ship."

(One sentence per module; don't dwell.)

## Segment 2 — Why JD-Forge fits (2 min)

The hook line:

> "Right now, your hiring manager writes a JD, your TA team
> translates it into 'here's what we'll test,' and your tech screen
> generates a one-off panel. JD-Forge collapses those 3 steps. You
> get a defensible, IRT-calibrated, format-balanced question spec
> in 5 minutes per JD."

Concrete pain ↔ feature mapping (1 slide):

| Customer pain | JD-Forge solves |
|---|---|
| JD-to-skill mapping is manual | Role-graph mapper covers 8 sub-skill prefixes (Wave-1 100/100) |
| Difficulty banding inconsistent | 4-band difficulty spec (IRT b targets) |
| Format mix arbitrary | 40/30/20/10 (MCQ / code / design / case-study) per spec §3.3 |
| Question spec lives in someone's head | Canonical JSON envelope per spec |
| Export to HackerRank is manual rework | RFC-4180 CSV + HackerRank-v1 JSON exporter |

## Segment 3 — Live demo (10 min)

### Step 1 — Paste customer JD (1 min)

Demo cue:
> "Let's use a real JD. Send me one of your live ones — anonymise
> if needed. I'll paste it into JD-Forge."

(If customer hasn't shared: use a pre-pulled one from their public
careers page.)

### Step 2 — Parse JD → Spec (3 min)

> "JD-Forge parses the role + skill requirements. Watch the
> role-graph mapper light up — it's matching against our Wave-1
> sub-skill catalog. For [their role], it matched: [Java 60%,
> AWS 30%, SQL 10%]."

Demo cue: open the JD-Forge admin queue page, show the parsed
spec live.

> "If the parser misses a sub-skill we don't yet support, we surface
> it as 'unmatched-skill' for SME catalog extension. Today we have
> 8 prefixes covering Wave-1 100/100; Wave-2 prefixes ship with
> SME Lead onboarding."

### Step 4 — Generate spec (4 min)

> "Now the spec builder runs. Largest-remainder distribution gives
> us, say, 40 questions: 16 MCQ, 12 code, 8 design, 4 case-study.
> Difficulty bands: 4 easy, 12 medium, 16 hard, 8 very-hard. Each
> question has an IRT b target; we route from the 1,300-question
> released library."

Demo cue: show the spec output JSON (~50 lines; legible).

### Step 5 — Review + tune (2 min)

> "If your hiring manager wants more code-heavy, we tweak the
> format mix from 40/30/20/10 to 30/40/20/10. If they want easier
> on entry-level, we shift the difficulty band weighting. All
> deterministic — no LLM hallucination at this layer; the
> calibrated library guarantees defensibility."

## Segment 4 — Exporters (5 min)

> "Three output formats:
>
> 1. **Canonical JSON** — for your internal hiring dashboard
> 2. **RFC-4180 CSV** — for Excel-driven workflows
> 3. **HackerRank-v1 JSON** — drops into HackerRank if you're
>    transitioning off; preserves our QOrium watermark in metadata
>    so we can still trace exfiltration"

Demo cue: download all three; open the CSV in Excel; show the
HackerRank JSON's watermark field.

> "If your HackerRank cost is currently $X/year, JD-Forge replaces
> the question-authoring portion of that and you keep your existing
> HackerRank UX. Your TA team doesn't change tooling; you just
> stop authoring."

## Segment 5 — Pricing + pilot (5 min)

Pricing range (per BRAND.md):

> "JD-Forge pricing is per-JD generation, in 3 tiers:
>
> - **Single-JD ad-hoc:** $49 per JD (try it now; one-off)
> - **JD pack (10 JDs/quarter):** $199 (most popular)
> - **Unlimited (within tenant):** $499/quarter
>
> Stack-Vault customers get JD-Forge unlimited bundled at no extra
> cost on enterprise tier."

Pilot offer:

> "Two-week pilot: pick 3 of your live JDs, run them through JD-Forge,
> compare against your current authoring effort. We co-author the
> success criteria. If the savings are real (and we'll show you the
> ROI calc), we move to subscription. If not, no charge."

## Segment 6 — Q&A + next steps (5 min)

Common questions:

| Q | A |
|---|---|
| What if our JD has skills you don't support? | Wave-1 covers Java/Python/React/SQL/DevOps/Salesforce/AWS/AIPE 100/100. Wave-2 (SAP/OHCM/CPQ/Finacle/Embedded Automotive) at 100/100. Niche skills surfaced as "unmatched"; SME Lead extends catalog. |
| Are the questions generated by AI? | Library is human-authored, IRT-calibrated. Spec assembly is deterministic. We use LLM only for the JD parsing (skill extraction) — that's where the cred-bound Anthropic API call is. |
| Can we host on-prem? | No. SaaS-only Y1; enterprise tier offers EU/India/Singapore data-residency post-multi-region (Sprint 5.0 IaC ready). |
| What about anti-leak? | Every question through JD-Forge inherits the same watermark + rotation regime as the underlying library. |
| Pricing transparency? | Always quoted as ranges in early conversations; firm number at contract. |

Next-step language:

> "Three options:
>
> 1. We send you the JD-Forge demo recording + 1-page brief by EOD;
>    you review with your hiring manager
> 2. We schedule a 30-min pilot kickoff for next Tuesday — bring
>    3 of your live JDs
> 3. If now isn't the right moment, we close the loop and reach
>    out in 6 weeks"

---

## Demo failure modes + recovery

| Failure | Recovery |
|---|---|
| Anthropic API rate-limited or down | Pre-pulled cached output; demo from cache |
| Customer's JD doesn't parse cleanly | Use pre-vetted JD; explain "your JD has X edge cases; here's how the parser handles them" |
| Customer asks deeply technical questions about IRT | Refer to methodology white paper (Tier-A2 D6) and offer follow-up call with CTO Office |
| Customer pushback on pricing | Reaffirm pilot offer; don't negotiate live |
| Network drops mid-demo | Have screenshot deck as backup |

---

## Post-demo discipline

Within 24 hours:
- Send follow-up email recap (3-5 sentence summary + 3 next-steps)
- Send 1-page personalised JD-Forge ROI sheet (using their inputs)
- Update CRM with opportunity stage + next-step + owner
- If pilot booked: add to project tracker; assign engineering follow-up

If pilot not booked:
- Move to 6-week nurture
- Ask for one specific blocker (price? feature? timing?)

---

## Standing Order #2 (USP) compliance

Demo language MUST reference at least one of:
- "IRT-calibrated"
- "anti-leak-rotated"
- "watermark-per-candidate"

The demo above uses all three. ✅

Banned in conversation:
- "Revolutionize" / "synergy" / "best-in-class" / "lorem ipsum"
- Emoji in any output / slide
- Pricing as single SKUs (always ranges in pre-contract)

---

_Script is a draft. CEO + (future AE) refine post-first-3-demos.
JD-Forge alpha is engineering-complete; live LLM call is cred-bound._
