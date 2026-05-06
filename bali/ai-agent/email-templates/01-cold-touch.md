# Email Template — 01 Cold Touch (Day 1)

> **Trigger:** outbound prospecting day-1 OR inbound form submission day-1.
> **Channel:** email (LinkedIn DM uses condensed form below).
> **Validator:** G4 (USP verbatim must be present). G1 (pricing-band figures must match).

---

## Variables

| Variable            | Source                                         | Example                                       |
| ------------------- | ---------------------------------------------- | --------------------------------------------- |
| `{{first_name}}`    | LinkedIn profile                               | Priya                                         |
| `{{company_name}}`  | LinkedIn profile                               | Sterling Talent                               |
| `{{primary_stack}}` | LinkedIn job posts (top hiring stack last 90d) | Java/Spring                                   |
| `{{trial_link}}`    | Generated per prospect                         | https://qorium.online/trial?p={{prospect_id}} |

---

## Email body

**Subject:** {{first_name}}, fresh question packs for {{company_name}}'s recruiters — 14-day free trial

Hi {{first_name}},

I'm reaching out from QOrium — we ship calibrated, anti-leak-rotated question packs to IT staffing firms. Your recruiters get fresh content per drive, watermarked per candidate, in 20+ platform formats.

I noticed {{company_name}} has been hiring {{primary_stack}} engineers — that's exactly the stack our Day-0 cohort runs through. The pricing tiers are simple:

- **Lite** (₹4,999/mo): 1 recruiter, 200 questions/month, 5 stacks
- **Pro** (₹19,999/mo): 5 recruiters, 1,000 questions/month, all stacks
- **Scale** (₹49,999/mo): 20 recruiters, unlimited, priority support

We have a 14-day free trial — 50 questions you can hand to your recruiters today, no credit card required. Talpro India runs ~50 candidate screens per week through QOrium with daily anti-leak rotation. Same engine you'd evaluate.

Want to start the trial? [start_trial_link: {{trial_link}}]

— QOrium · qorium.online · trial expires in 14 days, no auto-charge.

---

## LinkedIn DM (compressed form)

> Hi {{first_name}} — QOrium ships calibrated, anti-leak-rotated question packs to IT staffing firms. Per-recruiter tiers from ₹4,999/mo. 14-day free trial — 50 questions, no credit card. Worth a look for {{company_name}}'s {{primary_stack}} drives this quarter? [trial_link]

---

## Tone

- Professional. Founder-grade. No emoji.
- Specific number per email (one — the 50-question trial pack).
- Soft CTA (one link). No "Are you available for a call?" until follow-up.

## What this email does NOT do

- Ask for a meeting (cold-touch, soft)
- Mention SOC 2 attestation status
- Promise features beyond the published Lite/Pro/Scale spec
- Offer a customer-reference call (SO-12 — humans handle)
- Quote any pricing other than the 3 tier amounts above

## What the agent personalizes

- Subject line — keep formula but adjust `{{primary_stack}}` to actual stack
- Opening sentence — already personalized via name
- The "I noticed..." sentence — bind to specific recent job posts (one per prospect)

## What the agent does NOT change

- The pricing tier list (verbatim — G1)
- The locked USP fragment ("calibrated, anti-leak-rotated, watermark-per-candidate" + "20+ platform formats")
- The Customer Zero stat (50 screens/week — G3)

---

## Performance metrics

Track per template instance:

- Open rate (target: ≥35%)
- Click-through to trial link (target: ≥8%)
- Reply rate (target: ≥3%)
- Spam/unsubscribe (target: <1%)

If any metric drifts >25% below target for 30 days → propose template variant in next Bali Fri weekly debrief.

---

_Authority: Bali Sales Playbook §6.3 (Recruiter commercial template), §9 (AI Agent capability spec). Constitution SO-1, SO-2, SO-11, SO-12, SO-18, SO-23._
