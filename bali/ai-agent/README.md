# Bali AI Agent — Executable Layer

**Authority:** Constitution SO-18 ("Bali = AI Agent + Human AE Hybrid") · Bali Sales Playbook §9 (capability spec)
**Status:** Specifications — service to be engineered M2 (per Blueprint §M2 trajectory). This folder ships the **prompts, templates, and rubrics** the agent will execute against. When the service lands, it reads these artifacts and operates.
**Owner:** Bali (capability spec) · CTO (engineering execution) · CEO (final authority on prompts referencing pricing or competitive engagement)

---

## What this folder is

The Bali Sales Playbook §9 says **what** the AI Agent does (Recruiter motion outreach, qualification, trial conversion, renewal management). This folder defines **how** — the actual content the agent uses:

```
bali/ai-agent/
├── README.md                   ← you are here
├── system-prompt.md            ← canonical instructions injected into every agent context
├── escalation-rubric.md        ← deterministic decision tree for AI → Human handoff
├── guardrails.md               ← content moderation rules (no discount >5%, no Talpro without approval, etc.)
└── email-templates/
    ├── 01-cold-touch.md        ← Day-1 cold email
    ├── 02-followup-day-7.md    ← Day-7 check-in
    ├── 03-trial-conversion.md  ← Day-12-of-14-day-trial conversion email
    └── 04-churn-flag.md        ← when login-frequency drops >50% in 30d
```

When the M2 service lands, it loads these markdown files at startup and uses them as ground truth. Updates flow through PR review (per SO-1 "CRM is the source of truth" + this doc as the prompt-truth analog).

---

## Why this layer exists separately from the service code

Three reasons:

1. **Audit trail.** Every prompt change is a commit. CEO can review, counsel can review, MANTHAN can re-validate against the locked USP.
2. **Constitutional discipline.** SO-2 says the locked USP is verbatim; SO-11 says no discount >10% without CEO approval; SO-23 says Platform API band is $5K-25K. The agent never invents these — it reads them from these files.
3. **Engineering decoupling.** When the agent is engineered (M2), the engineers wire the LLM, the rate limiter, the LinkedIn API, the CRM webhook. They DON'T write the prompts — Bali does, here.

---

## How the service uses these files (M2+ service contract)

Pseudocode for the M2 service:

```typescript
// On agent boot:
const SYSTEM_PROMPT = readFileSync('bali/ai-agent/system-prompt.md');
const ESCALATION_RUBRIC = readFileSync('bali/ai-agent/escalation-rubric.md');
const GUARDRAILS = readFileSync('bali/ai-agent/guardrails.md');
const EMAIL_TEMPLATES = {
  cold_touch: readFileSync('bali/ai-agent/email-templates/01-cold-touch.md'),
  followup_d7: readFileSync('bali/ai-agent/email-templates/02-followup-day-7.md'),
  trial_conv: readFileSync('bali/ai-agent/email-templates/03-trial-conversion.md'),
  churn_flag: readFileSync('bali/ai-agent/email-templates/04-churn-flag.md'),
};

// On each prospect interaction:
const llmContext = [
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'system', content: GUARDRAILS },
  { role: 'system', content: `Escalation rubric: ${ESCALATION_RUBRIC}` },
  { role: 'user', content: `Prospect: ${prospect.json()}; Stage: ${stage}; Template: ${tmpl}` },
];

const response = await anthropic.messages.create({
  model: 'claude-sonnet-4-6',
  max_tokens: 1024,
  messages: llmContext,
});

// Validate: did the agent breach a guardrail? If yes, escalate to human.
if (escalationRubric.shouldEscalate(prospect, response)) {
  await crm.assignToHuman(prospect, escalationReason);
  return;
}

await mailer.send({ to: prospect.email, subject: response.subject, body: response.body });
await crm.logTouch(prospect, response);
```

**Critical:** the agent does NOT write its own emails from scratch. It **personalizes** the templates in `email-templates/` against the prospect's actual data. Personalization variables are explicit (`{{first_name}}`, `{{company_name}}`, `{{stack}}`) — see each template.

---

## When NOT to use the agent (force-route to human)

Per Bali Playbook §9 + escalation rubric:

- ❌ Trial-to-paid conversion AND LTV prediction >₹50K
- ❌ Pricing pushback above 5% off list (5%-10% requires Bali human; >10% requires CEO)
- ❌ Stack-Vault interest signal from a Recruiter prospect (hand to AE Enterprise)
- ❌ Contract redlines beyond standard ToS
- ❌ Reference call request (SO-12 — Customer Zero references handled by humans only)
- ❌ Engagement with OBSOLETE or DIRECT POSITIONING COMPETITOR per Constitution §2.7
- ❌ Anything the agent itself flags as "uncertain" via its uncertainty score >0.7

---

## Content moderation guardrails (high-level — full list in `guardrails.md`)

The agent NEVER:

1. Discounts below 5% off published list (escalates to human)
2. Quotes Talpro India as a reference without explicit human approval (SO-12)
3. Engages with OBSOLETE or DIRECT POSITIONING COMPETITOR companies (Constitution §2.7)
4. Sends more than 3 unsolicited touches to a single prospect (anti-spam)
5. Promises features not in the published SKU spec (SO-24 recursive no-fiction rule)
6. Makes any claim about SOC 2 attestation status (auto-routes to /security page link instead)
7. Negotiates contract terms beyond what's in the Recruiter Self-Serve commercial template (Bali Playbook §6.3)
8. Sends emails outside business hours in the prospect's timezone (anti-spam + UX)

---

## Daily operations + reporting

The agent reports daily into the Bali pipeline tracker (`bali/templates/pipeline-tracker.md` Required CRM fields):

- Outbound touches sent per ICP class
- Inbound conversion rate (form → trial)
- Trial-to-paid conversion rate
- Tier mix at conversion (Lite / Pro / Scale)
- Escalations to human (count + reason — must be one of the above triggers)
- Churn signals flagged (login-frequency drop >50%, cancellation requests)

Weekly summary lands in Mon weekly forecast (`bali/templates/weekly-forecast.md` §2 Recruiter Subscription motion).

---

## When this folder updates

- **Anytime the locked USP changes** — Constitutional Amendment per Article XI; `system-prompt.md` updates verbatim.
- **Anytime pricing bands change** — SO-11 + SO-23 amendment; `system-prompt.md` + email templates update.
- **Anytime a new objection pattern emerges** — Fri weekly debrief surfaces it; `email-templates/` add a variant; `system-prompt.md` references it.
- **Anytime SO-18 is amended** — escalation rubric updates.
- **Anytime the §2.7 classification changes** — guardrails update with new outreach-forbidden / outreach-permitted lists.

Updates flow through PR review. Two reviewers required: Bali (CEO in Y1) + CTO. No direct edits to `main`.

---

## What's not here yet (deferred to M2 engineering session)

- ❌ The actual TypeScript service (`services/bali-agent/`) — engineering work, not prompt work
- ❌ LinkedIn API integration (Sales Navigator pull, DM send, anti-spam pacing)
- ❌ Email queue (Resend or SES integration)
- ❌ CRM webhook integration (Pipedrive / HubSpot)
- ❌ Daily metrics dashboard

Those land in the M2 engineering sprint per Blueprint trajectory. This folder unblocks them — when engineering starts, the prompts + templates + rubrics are already locked, reviewed, and constitutional.

---

_Cross-references: Constitution SO-1 (Customer Zero), SO-2 (locked USP verbatim), SO-11 (pricing anchors), SO-12 (reference protocol), SO-18 (AI + Human hybrid mandate), SO-23 (API pricing band), SO-24 (no-fiction rule), §2.7 (competitor outreach discipline). Bali Playbook §9 (capability spec), §10 (operating cadence). Pipeline + cadence: `bali/templates/pipeline-tracker.md`, `bali/templates/weekly-forecast.md`._
