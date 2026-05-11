# Runbook — ReadyBank Customer Onboarding

**Owner:** Bali (sales-side) + CTO (engineering-side) joint · **Authority:** Bali Sales Playbook §3.1 (Platform API motion) + SO-23 (pricing band)
**Cadence:** Per new customer signing (Y1 target: 3 logos per `bali/leads/Y1-target-list.md`)

---

## When this runbook fires

When a new Platform API customer signs the commercial agreement (per `bali/outreach/platform-api.md` Stage 7 — Conversion to commercial) AND is ready to start integration.

NOT used for:

- Trial / pilot customers (lighter-weight; skip steps 4-7)
- Stack-Vault customers (different motion — separate runbook when Stack-Vault deploys ship M2+)
- Recruiter Subscription customers (AI Agent + self-serve per `bali/ai-agent/`; no onboarding runbook needed)

---

## Responsible parties

| Step | Owner                                      |
| ---- | ------------------------------------------ |
| 1-3  | Bali (commercial close + customer profile) |
| 4-6  | CTO (technical provisioning)               |
| 7    | Bali + CTO joint (handoff call)            |
| 8-9  | CTO (first-week monitoring)                |
| 10   | Bali (success milestone)                   |

---

## Step-by-step procedure (5-7 business days from contract signature to first API call)

### Step 1 — Customer profile created (Bali, Day 0)

After contract signature, Bali creates the customer profile in CRM:

- Customer name + ICP class (per Constitution §2.7 classification)
- Tier per SO-23 pricing band ($5K-25K/yr — Lite / Pro / Scale tier names TBD when band is sub-segmented)
- Annual contract value (within band per SO-11; >10% deviation requires CEO approval)
- Renewal date
- Primary technical contact (engineering integration owner)
- Primary commercial contact (decision-maker per `bali/leads/Y1-target-list.md`)
- Contractual SLAs (uptime, p95 latency commitments — see `services/readybank/ops/sli-slo.md`)

### Step 2 — Customer Zero reference call offered (Bali, Day 0-2)

Per Constitution SO-12: customer gets 15-minute reference call with Talpro India TA lead. Bali coordinates; Talpro TA lead does the call.

If the customer accepts, schedule within 5 business days.
If the customer declines (some don't need it post-signature), document and continue.

### Step 3 — Internal kickoff call (Bali + CTO + customer, Day 1-3)

30-min kickoff covering:

- Integration timeline (typically 5-15 business days from this call)
- Technical ownership (their integration owner + our CTO)
- Communication channels (shared Slack channel + email + 24h-response SLA on technical questions during onboarding)
- Webhook expectations (anti-leak rotation `question_retired` events)
- API key provisioning timeline (Step 4)

### Step 4 — API key provisioned (CTO, Day 2-4)

CTO uses the `@qorium/auth` package admin tooling (`packages/auth/src/admin/`) to issue:

- Production API key (rate-limited per tier — Lite/Pro/Scale)
- Staging API key (for the customer's QA environment)

API keys are delivered to the customer via:

1. **Secure channel only** — no email body, no Slack message
2. Acceptable: 1Password Secure Note shared link · GitHub repo secret access · in-person handoff
3. **Never:** Slack DM, email body, plaintext file attachment

Per Constitution SO-15 (Zero Secrets in Git, extended interpretation: zero secrets in plaintext channels).

### Step 5 — Webhook endpoint configured (CTO + customer, Day 3-5)

Customer provides a webhook URL where we POST anti-leak rotation events. We register it in the customer profile; outbound webhooks fire when:

- A question they consumed gets retired (`question_retired` event)
- A replacement variant is released (`question_replaced` event)
- Their API key approaches its rate-limit ceiling (`rate_limit_warning` event)

Webhook signing: HMAC-SHA256 with a customer-specific secret (provisioned alongside API key in Step 4).

### Step 6 — Customer hits `/health` + first sample call (Customer, Day 4-6)

Customer's integration team:

1. Hits `GET /health` with their staging API key — should return 200 + `status: ok`
2. Hits `GET /v1/questions/{some_uuid}` — fetches a single question
3. Hits `POST /v1/packs/generate` — generates a sample pack

If any fails, CTO investigates within the 24h-response SLA.

### Step 7 — Production cutover + handoff call (Bali + CTO + customer, Day 6-8)

30-min call covering:

- Customer confirms staging integration works
- Production API key activated (was provisioned in Step 4 but disabled until cutover)
- First production call from customer-side; CTO verifies it appears in our logs
- Handoff to ongoing-relationship cadence:
  - Bali = primary commercial contact going forward
  - CTO = primary technical contact for issues
  - Quarterly business review schedule confirmed (per Bali Playbook §10)

### Step 8 — First-week monitoring (CTO, Day 7-14)

Daily checks for the first 7 days post-cutover:

- API call volume from this customer's API key
- Error rate per endpoint
- Webhook delivery success rate (no failed POSTs to their webhook URL)
- p95 latency on their request patterns
- Customer-channel monitoring: any reports?

Findings go in the daily standup (per Constitution §671 daily cadence).

If anything trends bad → escalate per `cto/runbooks/incident-response.md` (severity classification depends on customer impact).

### Step 9 — Two-week health check (CTO, Day 14)

Full system health review:

- All metrics in Step 8 within SLO
- Customer-side feedback solicited (technical contact email)
- Any tech-debt items surfaced added to `cto/tech-debt.md`
- Anti-leak rotation events successfully delivered to customer webhook

If healthy → onboarding officially complete; transition to standard ongoing cadence.

If issues → extend monitoring; document in `gatekeeper/wave-gates/` (or equivalent customer-onboarding gate doc when this folder pattern matures).

### Step 10 — Success milestone (Bali, Day 14-30)

Per Constitution SO-12: ask the customer to be a reference for future prospects in similar ICP. Pay-discount per SO-12 (5-10% renewal discount for 3 active references in their first year).

If customer declines: respect; document; move on.
If customer accepts: add to the reference roster; never quote without re-asking each time per SO-12.

---

## Communication SLAs during onboarding

- **Technical questions from customer:** 24h response (CTO)
- **Commercial questions from customer:** 24h response (Bali)
- **Outage / production incident:** 30 min acknowledgment (per `cto/sli-slo.md` operational SLO + `cto/runbooks/incident-response.md` P0/P1 thresholds)
- **API key provisioning:** within 2 business days of contract signature
- **Webhook URL registration:** within 1 business day of customer providing it

---

## Anti-patterns

- ❌ **Sending API keys via email body or Slack message.** SO-15 violation. Secure channel only.
- ❌ **Skipping the 24h-response SLA "because it's a small question."** During onboarding, the customer is forming their first impression; small questions answered quickly = trust.
- ❌ **Cutover-to-prod without staging-success verification.** Step 7 depends on Step 6; never skip.
- ❌ **Letting onboarding stretch past 15 business days without escalation.** If onboarding stalls, root-cause: is it customer-side (their integration team is slow) or our-side (we're slow on a technical question)? Escalate to CEO if ours.
- ❌ **Using the customer's name in marketing before SO-12 reference protocol completed.** First we ask permission per SO-12; then we use the name. Never the reverse.

---

## Customer-onboarding checklist (single-page version)

```
□ Step 1: Customer profile in CRM (Bali, Day 0)
□ Step 2: Customer Zero reference call offered (Bali, Day 0-2)
□ Step 3: Internal kickoff call (Bali + CTO + customer, Day 1-3)
□ Step 4: API key provisioned via secure channel (CTO, Day 2-4)
□ Step 5: Webhook endpoint configured (CTO + customer, Day 3-5)
□ Step 6: Customer hits /health + sample calls (Customer, Day 4-6)
□ Step 7: Production cutover + handoff call (Bali + CTO + customer, Day 6-8)
□ Step 8: First-week monitoring (CTO, Day 7-14)
□ Step 9: Two-week health check (CTO, Day 14)
□ Step 10: Success milestone + SO-12 reference ask (Bali, Day 14-30)
```

---

## What's NOT in this runbook (yet)

- ❌ Customer-facing self-service onboarding portal — TBD M2+; for Y1, manual onboarding scales fine for 3 logos
- ❌ OpenAPI spec / Stoplight Studio docs — TODO in `cto/tech-debt.md`
- ❌ Customer-specific rate-limit configuration — current API uses tier-default rate limits; per-customer tuning available on request manually
- ❌ Slack / Discord shared channel template — when customer count grows beyond manual management

---

_Cross-references: Bali Sales Playbook §3.1 (Platform API motion) + §6.2 (Platform API license template) + §10 (Operating Cadence). Constitution SO-12 (reference protocol), SO-15 (secure-channel), SO-23 (pricing band). `cto/runbooks/incident-response.md` (parent for P0/P1 escalations during onboarding). `services/readybank/ops/sli-slo.md` (SLO targets). `packages/auth/README.md` (API key admin tooling)._
