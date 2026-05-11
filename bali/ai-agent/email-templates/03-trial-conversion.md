# Email Template — 03 Trial-to-Paid Conversion (Day 12 of 14-day trial)

> **Trigger:** Day 12 of 14-day trial AND trial activated AND ≥5 questions used.
> **Channel:** email.
> **Validator:** G1 (the 5% loyalty discount is the ONLY discount the agent applies — anything else escalates).

---

## Variables

| Variable                   | Source                                                  | Example                                                                                   |
| -------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `{{first_name}}`           | LinkedIn profile                                        | Priya                                                                                     |
| `{{trial_questions_used}}` | Trial dashboard                                         | 23                                                                                        |
| `{{trial_drives}}`         | Trial dashboard (drives the trial pack was attached to) | 4                                                                                         |
| `{{tier_recommendation}}`  | LTV prediction → Lite/Pro/Scale                         | Pro                                                                                       |
| `{{trial_end_date}}`       | Trial start + 14 days                                   | 2026-05-22                                                                                |
| `{{conversion_link}}`      | Generated per prospect                                  | https://qorium.online/subscribe?p={{prospect_id}}&tier={{tier_recommendation}}&discount=5 |

---

## Email body

**Subject:** Trial expires {{trial_end_day}} — keep your recruiters on QOrium?

Hi {{first_name}},

Your QOrium trial expires {{trial_end_day}} {{trial_end_date}}. From the trial dashboard, your team has used **{{trial_questions_used}} questions across {{trial_drives}} drives** this fortnight. That's a healthy use case for the **{{tier_recommendation}} tier**.

Quick reference on the tiers:

- **Lite** — ₹4,999/mo · 1 recruiter · 200 questions/month · 5 stacks
- **Pro** — ₹19,999/mo · 5 recruiters · 1,000 questions/month · all stacks
- **Scale** — ₹49,999/mo · 20 recruiters · unlimited · priority support

If you convert to a paid plan **within 7 days of trial end**, I can apply a **5% loyalty discount on the first 3 months** of your subscription. That brings:

- Lite to ₹4,749/mo
- Pro to ₹18,999/mo
- Scale to ₹47,499/mo

Subscribe in 60 seconds: [conversion_link: {{conversion_link}}]

Or reply with the tier you want and I'll send a tailored link.

— QOrium · trial dashboard: [link to dashboard]

---

## Escalation triggers from this template

| Reply pattern                                     | Action                                                                         |
| ------------------------------------------------- | ------------------------------------------------------------------------------ |
| "Discount request >5%"                            | Escalate per G1 (Bali human handles 5-10%; CEO handles >10% per SO-11)         |
| "We need Scale + custom features"                 | Escalate (out-of-template)                                                     |
| "We need 50 recruiters not 20"                    | Escalate (Scale-tier upper bound; AE Enterprise picks up — Stack-Vault signal) |
| "We package this for our clients (revenue share)" | Escalate (out-of-motion; AE Enterprise)                                        |
| LTV prediction >₹50K based on trial usage         | Auto-escalate per Bali Playbook §9                                             |
| "Annual contract instead of monthly"              | Escalate (Bali human; outside the Recruiter Self-Serve commercial template)    |

## What the agent personalizes

- `{{trial_questions_used}}` — pull from trial dashboard (real number)
- `{{trial_drives}}` — pull from trial dashboard (real number)
- `{{tier_recommendation}}` — based on usage:
  - <100 questions in 14 days → Lite
  - 100-500 questions OR ≥3 recruiter accounts in trial → Pro
  - > 500 questions OR ≥10 recruiter accounts in trial → Scale (or Enterprise escalation if signals warrant)

## What the agent does NOT change

- Pricing tier list (G1 verbatim — including the 5% discounted figures: ₹4,749, ₹18,999, ₹47,499)
- The 7-day conversion window (per Bali Playbook §6.3 — anything else escalates)
- The 3-month discount duration (anything else escalates)

## Tier recommendation logic (deterministic — no LLM judgment)

```
function recommendTier(trialUsage):
  if trialUsage.questions_used < 100 AND trialUsage.recruiter_accounts == 1:
    return "Lite"
  elif trialUsage.questions_used >= 100 AND trialUsage.questions_used <= 500:
    return "Pro"
  elif trialUsage.recruiter_accounts >= 3:
    return "Pro"
  elif trialUsage.questions_used > 500:
    return "Scale"
  elif trialUsage.recruiter_accounts >= 10:
    return "Scale"
  elif trialUsage.recruiter_accounts >= 20 OR trialUsage.questions_used > 2000:
    return "ESCALATE"  # AE Enterprise — Stack-Vault signal
  else:
    return "Pro"  # default fallback
```

This logic is hard-coded in the M2 service, NOT improvised by the LLM. The LLM only renders the email — the recommendation is deterministic.

---

## Performance metrics

- Trial-to-paid conversion rate (target: ≥25% per Bali Playbook §11 conversion benchmarks)
- Tier mix at conversion: target 60% Lite / 30% Pro / 10% Scale
- Time from email to subscribe (target: 60% within 24h)
- Discount-applied % (target: ~80% — most converters claim the loyalty discount)

---

_Authority: Bali Sales Playbook §6.3 (commercial template), §9 (AI Agent capability spec), §11 (conversion benchmarks). Constitution SO-1, SO-11, SO-18, SO-23._
