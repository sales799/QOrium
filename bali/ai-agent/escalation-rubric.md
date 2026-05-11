# Bali AI Agent — Escalation Rubric

> **Authority:** Bali Sales Playbook §9 (escalation triggers). **Service contract:** the M2 agent service evaluates this rubric on every prospect interaction; ANY trigger → assign to human within 4 business hours.

---

## Decision tree (deterministic, ordered)

Evaluate top-to-bottom. First match wins → escalate, do not continue.

### 1. Pricing-related triggers

| Condition                                                        | Action                                     | Owner                               |
| ---------------------------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| Prospect requests discount >5% off list                          | Escalate                                   | Bali human                          |
| Prospect requests discount >10% off list                         | Escalate (CEO approval per SO-11)          | CEO                                 |
| Prospect proposes custom-pricing structure not in Lite/Pro/Scale | Escalate                                   | Bali human                          |
| Trial-to-paid LTV prediction >₹50K (annual)                      | Escalate (warm hand-off + onboarding call) | Bali human (AE if >₹100K predicted) |

### 2. Product-fit triggers

| Condition                                                                  | Action                                      | Owner         |
| -------------------------------------------------------------------------- | ------------------------------------------- | ------------- |
| Prospect mentions exclusive library / per-customer scoping                 | Escalate (Stack-Vault signal)               | AE Enterprise |
| Prospect has ≥10 recruiters on team                                        | Escalate (Scale-tier upgrade or Enterprise) | Bali human    |
| Prospect has named client deliverables ("we package this for our clients") | Escalate (Stack-Vault or revenue-share)     | AE Enterprise |
| Prospect requests features not in published SKU spec                       | Escalate (don't promise; SO-24)             | Bali human    |

### 3. Reference / proof triggers (SO-12)

| Condition                                   | Action                                                                   | Owner      |
| ------------------------------------------- | ------------------------------------------------------------------------ | ---------- |
| Prospect requests a customer reference call | Escalate (SO-12 mandates human-handled)                                  | Bali human |
| Prospect requests Talpro India contact      | Escalate (Customer Zero protocol — never directly route)                 | Bali human |
| Prospect requests case-study citation       | Escalate (SO-24 recursive no-fiction; offer published `/customers` link) | Bali human |

### 4. Contract / legal triggers

| Condition                                                                   | Action                                                       | Owner                   |
| --------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------- |
| Prospect requests contract redlines beyond standard ToS                     | Escalate                                                     | AE Enterprise + counsel |
| Prospect requests DPA signature                                             | Escalate (Bali human + counsel; legal-template in /legal)    | Bali human              |
| Prospect requests SOC 2 attestation paperwork                               | Escalate (SOC 2 Type II in progress, M21 — never auto-claim) | CTO                     |
| Prospect requests SLA written commitments beyond published `/security` page | Escalate                                                     | CTO                     |

### 5. Competitive triggers (Constitution §2.7)

| Condition                                                                                                             | Action                                                                | Owner                                     |
| --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------- |
| Prospect's company is in OBSOLETE class (currently: WeCP, Byteboard)                                                  | **DO NOT engage. Mark prospect as out-of-scope. No escalation.**      | n/a                                       |
| Prospect's company is in DIRECT POSITIONING COMPETITOR class (currently: Glider AI)                                   | Escalate (CEO escalation required for any engagement)                 | CEO                                       |
| Prospect mentions a STRONG PARTNERSHIP CANDIDATE (DevSkiller, Codility, Adaface, SHL, Talogy) as their current vendor | Note in CRM; continue with Recruiter pitch (different motion + buyer) | (no escalation)                           |
| Prospect mentions Tier 1/Tier 2 API CUSTOMER as their current vendor                                                  | Note in CRM; this is a competitive win-back signal                    | (no escalation; continue Recruiter pitch) |

### 6. Behavioral triggers (anti-spam + UX)

| Condition                                                   | Action                                                                    | Owner      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------- | ---------- |
| Prospect has been touched 3 times with no response          | **Stop sequence.** Move to "closed-no-response" disposition.              | n/a        |
| Prospect explicitly requests removal                        | **Stop immediately.** Honor opt-out. Log timestamp + opt-out reason.      | n/a        |
| Login-frequency drop >50% in 30d for an active subscription | Escalate (churn flag)                                                     | Bali human |
| Cancellation request received                               | Escalate (saving conversation + win-back offer per Bali human discretion) | Bali human |

### 7. Self-uncertainty trigger

| Condition                                                                                      | Action                             | Owner      |
| ---------------------------------------------------------------------------------------------- | ---------------------------------- | ---------- |
| Agent confidence score on response <0.7                                                        | Escalate regardless of other rules | Bali human |
| Prospect's question requires judgement not covered by any template                             | Escalate                           | Bali human |
| Prospect's response is in a language other than English (or Hindi for staffing-firm prospects) | Escalate                           | Bali human |

---

## Escalation envelope (what the agent passes to the human)

When escalating, the agent writes a CRM note with this structure:

```
ESCALATION TRIGGER: <which rule matched>
PROSPECT: <name + role + company + LinkedIn URL>
TIER PREDICTION: Lite / Pro / Scale (with confidence score)
ENGAGEMENT HISTORY:
  - Touch 1 (timestamp): template <ID>, response <link to thread>
  - Touch 2 (timestamp): ...
LATEST PROSPECT MESSAGE: <full quoted text>
RECOMMENDED HUMAN ACTION: <one-line suggestion based on rule that matched>
DEADLINE: <timestamp = trigger + 4 business hours>
```

This note posts in:

- CRM opportunity record
- Slack channel `#bali-escalations` (Y1 — channel TBD, set up at M2)
- Bali human's inbox (email digest hourly during business hours)

---

## Service-level commitment

- **Trigger detection:** runs on EVERY prospect interaction (not just outbound).
- **Escalation latency:** ≤4 business hours from trigger to human assignment.
- **No silent drops:** if no human acknowledges within 8 business hours, the agent re-pings every 4 hours up to 3 times, then writes "URGENT — UNCLAIMED ESCALATION" to the CRM.
- **Audit:** weekly review of escalation log surfaces (a) any trigger that fires too often (suggests automation gap → may be fixable in a template) and (b) any rule that never fires (suggests it's been written out of practice → re-validate).

---

## What this rubric is NOT

- ❌ A scoring model (no probabilistic blending; first match wins, deterministic)
- ❌ A retention algorithm (churn signals trigger ESCALATE — humans run retention)
- ❌ Negotiation logic (the agent never negotiates pricing or contracts — escalate)
- ❌ A customer-success playbook (escalations land with humans; CS workflows are separate)

---

_Cross-references: Bali Playbook §9 (escalation triggers source), Constitution SO-1, SO-11, SO-12, SO-18, SO-24, §2.7. `bali/ai-agent/system-prompt.md` (the agent loads both files together)._
