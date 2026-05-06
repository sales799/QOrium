# Email Template — 02 Follow-up (Day 7)

> **Trigger:** Day 7 from Touch 1 (cold) with no reply OR no trial activation.
> **Channel:** email.
> **Validator:** G1, G3, G6, G8 (prior touch count must be exactly 1 or 2).

---

## Variables

| Variable             | Source                                          | Example                                       |
| -------------------- | ----------------------------------------------- | --------------------------------------------- |
| `{{first_name}}`     | LinkedIn profile                                | Priya                                         |
| `{{primary_stack}}`  | LinkedIn job posts (top hiring stack last 90d)  | Java/Spring                                   |
| `{{stack_examples}}` | Lookup: 3 example stacks the prospect hires for | Java/Spring/Salesforce/SAP/data-engineering   |
| `{{trial_link}}`     | Generated per prospect                          | https://qorium.online/trial?p={{prospect_id}} |

---

## Email body

**Subject:** Did the question pack reach your recruiters?

Hi {{first_name}},

Quick check-in — did the trial pack reach your recruiters? If yes and they're using it, the conversion to a paid tier is straightforward. If not, I can pull together a more targeted pack for your typical stacks ({{stack_examples}} — what's the mix?).

Either way, here's the pricing for clarity: Lite ₹4,999/mo · Pro ₹19,999/mo · Scale ₹49,999/mo. No setup fees, monthly billing, cancel anytime.

If a 14-day trial isn't the right call right now, would a 15-minute conversation about how Talpro India runs daily anti-leak rotation in production help? I'm not here to sell — just to make sure you've seen what's possible.

— QOrium · [start_trial_link: {{trial_link}}]

---

## What changed vs Touch 1

- Drops the locked USP (already sent in Touch 1; no need to repeat)
- Adds soft conversation offer ("15-minute conversation" — but generic, not a calendar booking yet — that's Touch 3 territory)
- Anchors on a specific Customer Zero proof point (daily anti-leak rotation — fact-grounded per `qorium.online/customers`)
- Repeats pricing for clarity (G1 verbatim)

## Escalation paths from this template

If prospect replies with:

| Reply pattern                               | Action                                                                                                                  |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| "Yes, we tried it. Pricing question."       | Continue with template 03 (trial conversion) if positive engagement signals; OR escalate per G1 if discount request >5% |
| "Not interested."                           | Honor opt-out (G10), close-no-response disposition                                                                      |
| "Send me more info."                        | Reply with `qorium.online/features` link + offer Talpro reference call → escalate per SO-12                             |
| Asks about SOC 2                            | Reply with `/security` link verbatim per G5, no further claim                                                           |
| Asks about Stack-Vault or Platform API      | Escalate to AE Enterprise per G2                                                                                        |
| Asks technical question about anti-leak SLA | Reply with link to `/blog/leak-problem` (1000+ words now); escalate if technical depth exceeds template scope           |

## What the agent personalizes

- `{{stack_examples}}` — pull 3 specific stacks the prospect hires for. Match to the prospect's recent job posts.
- The "If a 14-day trial isn't the right call right now..." pivot — only include if prior touches showed engagement signal (e.g., email opened multiple times). If no engagement signal, keep the email shorter without this paragraph.

## What the agent does NOT change

- Pricing tier list (G1 verbatim)
- Customer Zero stat (G3)
- "QOrium" name and "qorium.online" link
- The trial link format

---

## Performance metrics

- Reply rate (target: ≥6% — higher than Touch 1 because prospects who didn't bounce are warmer)
- Trial activation rate (target: ≥5%)
- Conversion to template 03: target ≥40% of activated trials

---

_Authority: Bali Sales Playbook §3.3 (Recruiter motion follow-up cadence), §9 (AI Agent capability spec). Constitution SO-1, SO-3, SO-11._
