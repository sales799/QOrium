# Follow-up Templates — Post-Discovery

3 templates: post-call email, internal meeting notes for CRM, and
next-step booking email. All gated on CEO approval before send.

---

## Template 1 — Post-call email (within 24 hrs of discovery call)

> **Subject:** QOrium x Bosch GCC — recap + materials + next steps
>
> Hi [Name],
>
> Thanks for the 30 minutes today. Quick recap so we're aligned:
>
> **What I heard:**
> - [Specific pain 1 from discovery, in their words]
> - [Specific pain 2 from discovery, in their words]
> - [Specific pain 3 from discovery, in their words]
> - Timeline: ~[X weeks/months for pilot consideration]
> - Decision flow: [whatever they described — single-step / committee
>   / global parent]
>
> **What I shared:**
> - QOrium ReadyBank (IRT-calibrated, anti-leak-rotated, watermark-
>   per-candidate)
> - 1,300 items released today including Wave-2 Embedded Automotive
>   100/100 (AUTOSAR + ISO 26262 + V2X + ECU bootloader + 30+ more)
> - Stack-Vault tenant isolation + Audit Log API + SOC 2 control
>   mapping
> - Talpro Customer-Zero anchor (first 100 candidates live)
>
> **Materials attached:**
>
> 1. **Bosch-specific ROI projection** — conservative scenario
>    ~₹1.9Cr Y1 net at 10K-engineer scale; mid-range ~₹4.6Cr; we
>    refine in pilot
> 2. **SOC 2 control mapping** — TSC CC1.1 → CC9.2 + A1, C1, PI1,
>    P1; ready for Bosch's audit cycle
> 3. **Customer-Zero one-pager** — Talpro's incident-response
>    time trimmed from 4h → 8min
> 4. **5-min product walkthrough loom** — Stack-Vault watermark +
>    audit-export flow
>
> **Next step (proposed):**
>
> A 60-minute technical follow-up with my CTO + your technical
> decision-maker. Suggested topics:
>
> - SAML/SCIM IdP integration deep-dive
> - Embedded Automotive item depth review
> - Audit hash-chaining + verify endpoint demo
> - Bosch-specific data-residency / EU region
> - Pilot kickoff plan
>
> Three slots that work my side:
>
> - Tuesday next week, 11am IST
> - Thursday, 3:30pm IST
> - Following Monday, 2pm IST
>
> Or send me your calendar and I'll book around.
>
> Direct line for anything urgent: bhaskar@qorium.online / +[mobile]
>
> Thanks again,
> Bhaskar
> CEO, QOrium Technologies
> https://qorium.online

**Length:** ~280 words. Long enough to summarise + ground;
short enough to read on a phone.

---

## Template 2 — Internal CRM notes (for opportunity tracking)

```
Opportunity: Bosch GCC India — Discovery Call
Date: [date]
Attendees:
  - Bhaskar Anand (CEO QOrium)
  - [Bosch Name 1, Title 1]
  - [Bosch Name 2, Title 2 — if applicable]

Discovery scorecard:
  Pain Awareness:        ___ / 5
  Champion Quality:      ___ / 5
  Technical Fit:         ___ / 5
  Budget Signal:         ___ / 5
  Decision Speed:        ___ / 5
  TOTAL:                 ___ / 25

Discovery answers (from worksheet):
  Q1 (volume):
  Q2 (sub-skill mix):
  Q3 (current tooling):
  Q4 (pain a/b/c):       ___/___/___ / 10
  Q5 (recent incidents):
  Q6 (compliance posture):
  Q7 (roadmap signal):
  Q8 (decision flow):
  Q9 (timeline):
  Q10 (budget signal):
  Q11 (existing relationships):
  Q12 (anything missed):

Stop conditions hit?
  - On-prem demand: YES / NO
  - Per-candidate raw answer storage > 90 days: YES / NO
  - Algorithm transparency / open-sourcing demand: YES / NO
  - Co-engineering / co-development model demand: YES / NO

Decision: ADVANCE / NURTURE / DECLINE

Action items:
  1. Send post-call email + materials within 24 hrs
  2. Schedule technical follow-up — owner: CEO
  3. Brief CTO Office on technical depth needed — owner: CEO
  4. CRM stage: [Discovery → Technical-Eval / Discovery → Nurture /
     Discovery → Closed-Lost]
  5. Owner: CEO (transitions to AE post-AE-hire)

Notes:
  [Free-form context — what surprised, what concerned, key
  unknowns]

Customer-Zero permission to reference Talpro:
  - Confirmed:
  - Source:

Bosch-specific custom items needed:
  - List if discussed:

Competitive landscape (per discovery):
  - Current vendor:
  - Switching willingness:

Internal champion:
  - Name + title:
  - Strength:

Internal blockers:
  - Names + titles:

Next milestone:
  - Date:
  - Trigger:

Risk:
  [Top 1-3 risks to deal]
```

---

## Template 3 — Technical follow-up booking email (between discovery
and follow-up)

> **Subject:** Re: Bosch x QOrium — technical follow-up
> confirmed [date]
>
> Hi [Name],
>
> Confirming our technical follow-up for [date] at [time IST].
> [Calendar invite attached / Zoom link below.]
>
> **Attendees from QOrium side:**
> - Bhaskar Anand (CEO)
> - [CTO Office representative; CTO solo OR CTO + Senior Eng #1
>    when hired]
>
> **Suggested attendees from Bosch side (please add):**
> - Technical decision-maker (engineering lead / CTO of GCC)
> - Compliance / audit lead (SOC 2 / DPDPA)
> - Optional: hiring-manager representative
>
> **Agenda (60 min):**
>
> | Time | Topic |
> |---|---|
> | 0-5 min | Introductions + agenda alignment |
> | 5-15 min | Recap discovery + ROI projection walkthrough |
> | 15-30 min | SAML/SCIM IdP + tenant isolation deep-dive |
> | 30-40 min | Audit hash-chaining + verify endpoint live demo |
> | 40-50 min | Embedded Automotive item depth (we'll show 10 sample items) |
> | 50-60 min | Pilot proposal + Q&A + next steps |
>
> If your team has specific technical questions in advance, please
> reply with them — we'll prep specific answers.
>
> Direct line: bhaskar@qorium.online / +[mobile]
>
> Looking forward,
> Bhaskar

---

## Template 4 — Pilot proposal email (post-technical-follow-up)

> **Subject:** QOrium x Bosch — 30-day pilot proposal
>
> Hi [Name],
>
> Strong technical follow-up. Per our agreement, attached is the
> formal pilot proposal:
>
> **Scope:**
> - 100 Bosch India engineering candidates run through ReadyBank
>   Embedded Automotive sub-skill
> - Bosch-tenant Stack-Vault provisioning (cred-bound on cred-drop;
>   staging tenant works for pilot data)
> - Audit Log API + Audit Export integration with Bosch's GRC
>   tool of choice
>
> **Co-set success criteria:**
> 1. Zero confirmed leakage incidents during pilot (anti-leak
>    runs continuously)
> 2. Audit-export response time < 60s for 30-day window
> 3. DIF report on candidates by region cohort
> 4. Pre/post false-pass rate comparison vs. Bosch's existing
>    tool (Bosch shares baseline data)
>
> **Output:** post-pilot report co-signed by Bosch GCC's
> compliance + technical leadership; QOrium provides proposal for
> subscription based on pilot data.
>
> **No charge.** If criteria met → subscription proposal; if not →
> graceful close, no charge.
>
> **Timeline:**
> - Day 0: Pilot kickoff (logistics + tenant provisioning)
> - Day 1-7: First 25 candidates through; daily check-in
> - Day 8-21: Cohort 2 + 3 (75 more candidates); weekly check-in
> - Day 22-30: Pilot close report drafting + co-signing
> - Day 30: Pilot close + subscription proposal
>
> **What we need from Bosch to start:**
> - Single Bosch contact for pilot logistics
> - Embedded Automotive hiring volume sample (anonymised)
> - GRC tool integration preference (SAP GRC / ServiceNow / other)
> - Compliance lead introduction for SOC 2 mapping review
>
> Please confirm + share the contact + we kick off within 7 days
> of confirmation.
>
> Direct line: bhaskar@qorium.online
>
> Bhaskar Anand
> CEO, QOrium Technologies

---

## Template 5 — Subscription proposal email (post-pilot)

(Skeleton; refined after pilot results known.)

> **Subject:** QOrium x Bosch — subscription proposal
>
> Hi [Name],
>
> Pilot results [paragraph summarising what hit / didn't].
>
> Subscription proposal:
> - Stack-Vault Enterprise tier: ₹[specific number from band]
> - ReadyBank API enterprise: ₹[number]
> - Custom item authorship (Bosch-specific): [if applicable]
> - SOC 2 evidence-pull integration: [if applicable]
>
> Total Y1: ₹[number]
> Y2 + Y3 (committed): same per-tenant pricing locked
> Multi-year discount: 15% on 3-year commitment
>
> First-3-logos cohort pricing locked for 24 months.
>
> Standard MSA template attached. Counsel review timeline?
>
> Direct line: bhaskar@qorium.online
>
> Bhaskar

---

## Template 6 — Graceful close email (when not advancing)

> **Subject:** QOrium x Bosch — closing the loop
>
> Hi [Name],
>
> Thanks for the time across our recent conversations. Based on
> our last exchange, sounds like timing isn't right for QOrium at
> Bosch GCC this cycle.
>
> Three paths forward:
>
> 1. We add Bosch to a 6-week nurture cadence; we share 1-2 pieces
>    of relevant content (white paper, customer milestone) and
>    revisit in 6 months
> 2. If a colleague at Bosch (different team / different GCC)
>    might fit — would you be open to introducing?
> 3. We close the loop entirely; if anything changes, please
>    reach back
>
> Thanks again. Genuinely appreciated the candor in our
> conversations.
>
> Bhaskar Anand
> CEO, QOrium

---

## Discipline

- **24-hour SLA on post-call email** — never longer
- **3-business-day SLA on follow-up prep** — materials sent in
  advance
- **Always end with binary next-step** — pilot or step-away;
  not "let's keep talking"
- **Materials are personalised** — every send references the
  customer's specific discovery answers
- **CTO Office reviewed before send** — no surprise CTO during
  pilot

---

_Templates are drafts. CEO sends per-call; CTO Office co-signs
when materials touch technical claims._
