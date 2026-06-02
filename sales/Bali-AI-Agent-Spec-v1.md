# Bali AI Agent Spec v1

**Purpose.** Operating specification for the AI side of the hybrid Bali sales motion (SO-18: AI agent + human AE). Defines architecture, capability boundaries, per-tier auto-send rules, email-response classifier, personalization pipeline, Constitutional compliance gates, kill switches, rollout plan.
**Author.** CTO Office · Run #12-Bali completion · 2026-05-03
**Status.** v1 — design-locked; awaiting Senior Engineer hire (M2) for first build sprint
**Pairs with.** Bali Outbound Email Templates v1, Bali Inbound Response Templates v1, Bali Sales Playbook (Doc 08), Bali AE+BD Outbound Prospect List Top 100

---

## §1. Why This Agent Exists (per SO-18)

Constitution v2.0 Standing Order #18 mandates a **hybrid sales motion**:

> "Sales-motion architecture is hybrid: AI assistant for Recruiter outreach scale; human AE for Enterprise/Platform high-touch. Pure-AI sales is forbidden for deals >₹10L ACV."

The Top 100 prospect list contains:
- **60 Tier 1 prospects** (Stack-Vault Enterprise/Group; ACV ₹40L–₹1Cr+) — **always human AE**
- **15 Tier 2 prospects** (Stack-Vault Department; ACV ₹10L) — **always human AE**
- **15 Tier 3 prospects** (ReadyBank API platform; ACV $5K–$25K) — **AE-led, AI-supervised**
- **10 Tier 4 prospects** (JD-Forge Enterprise; ACV $10K–$30K) — **AI-led, AE-supervised**

Bali AI Agent owns Tier 4 outreach + Tier 3 supervision automation + cross-tier personalization research + CRM hygiene + A/B test management. AEs/BD owns Tier 1+2 entirely and final-approves Tier 3 sends.

Without this agent, the human AE/BD pair (when hired by M3) cannot scale to 100 prospects in Phase 1 + 200 prospects in Phase 2 + 500+ prospects by Y2. With this agent, the same headcount handles 5–10× the prospect volume.

---

## §2. Architecture

### §2.1 Service Topology

```
                        ┌─────────────────────────┐
                        │   Bali AI Agent Core    │
                        │   (Node.js + TypeScript)│
                        │   PM2 service: qorium-  │
                        │   bali-agent (port 5120)│
                        └───────────┬─────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
┌──────────────┐          ┌──────────────────┐         ┌──────────────────┐
│ Personaliz-  │          │ Email Generator  │         │ Inbound Classi-  │
│ ation Pipe-  │          │ + Sender         │         │ fier + Router    │
│ line         │          │                  │         │                  │
│ (Serper +    │          │ Claude Opus 4.6  │         │ Claude Opus 4.6  │
│ LinkedIn +   │          │ + template lib   │         │ + IR-01..IR-12   │
│ press +      │          │ + send via       │         │ + intent classi- │
│ public data) │          │ Resend / SES     │         │ fier             │
└──────┬───────┘          └────────┬─────────┘         └────────┬─────────┘
       │                           │                            │
       └───────────────┬───────────┴────────────────────────────┘
                       ▼
            ┌──────────────────────┐
            │ HubSpot CRM (canon)  │
            │ + audit_log          │
            │ + Constitutional     │
            │   compliance gates   │
            └──────────────────────┘
                       │
                       ▼
            ┌──────────────────────┐
            │ Human AE/BD          │
            │ (review queue;       │
            │ approve/reject       │
            │ Tier 3 sends;        │
            │ owns Tier 1+2)       │
            └──────────────────────┘
```

### §2.2 Tech Stack (per CTO Architecture v1)

- **Language:** TypeScript end-to-end
- **Runtime:** Node.js 22 LTS
- **Service framework:** Express 5; PM2 cluster mode
- **AI provider:** Claude Opus 4.6 (primary) + GPT-5 (fallback); Gemini Pro for personalization research
- **CRM:** HubSpot (Talpro Universe instance)
- **Email send:** Resend (transactional) + Gmail OAuth (for from-CEO sends)
- **Web research:** Serper.dev (search) + Playwright headless (deep public-page scraping)
- **Data store:** PostgreSQL 16 (`bali_*` tables); Redis 7 (rate limiting, queue, idempotency)
- **Observability:** OpenTelemetry → Grafana Cloud; per-send latency + cost metrics; Sentry for errors

### §2.3 Database Schema (additions to existing CTO Architecture §5.1)

```sql
-- Bali AI Agent prospect tracking
CREATE TABLE bali_prospects (
  id              BIGSERIAL PRIMARY KEY,
  uuid            UUID UNIQUE DEFAULT gen_random_uuid(),
  company_name    VARCHAR(200) NOT NULL,
  contact_name    VARCHAR(200),
  contact_email   VARCHAR(200),
  contact_role    VARCHAR(200),
  tier            SMALLINT NOT NULL CHECK (tier BETWEEN 1 AND 4),
  priority_band   CHAR(2) NOT NULL,  -- 'P0' | 'P1' .. 'P8'
  hubspot_deal_id VARCHAR(50),
  source_list     VARCHAR(50) DEFAULT 'top-100-v1',
  status          VARCHAR(40) NOT NULL DEFAULT 'queued',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_touched_at TIMESTAMPTZ,
  do_not_contact  BOOLEAN NOT NULL DEFAULT FALSE,
  do_not_contact_reason TEXT,
  metadata        JSONB
);

CREATE INDEX bali_prospects_tier_status ON bali_prospects(tier, status);
CREATE INDEX bali_prospects_priority ON bali_prospects(priority_band);

-- Personalization research output (cached per prospect)
CREATE TABLE bali_personalization_anchors (
  id              BIGSERIAL PRIMARY KEY,
  prospect_id     BIGINT REFERENCES bali_prospects(id) NOT NULL,
  research_run_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  anchors         JSONB NOT NULL,   -- {specific_observation, stack_anchor, volume_anchor, mutual_anchor, ...}
  sources         JSONB NOT NULL,   -- {URLs from Serper + scraped pages + LinkedIn}
  freshness_days  SMALLINT,         -- how stale before re-research; default 30
  ai_model        VARCHAR(50) NOT NULL,
  ai_cost_cents   INTEGER
);

-- Outbound send log
CREATE TABLE bali_sends (
  id              BIGSERIAL PRIMARY KEY,
  prospect_id     BIGINT REFERENCES bali_prospects(id) NOT NULL,
  template_id     VARCHAR(20) NOT NULL,  -- 'T4A' | 'T4B' | etc.
  variant         CHAR(1) NOT NULL,      -- 'A' | 'B'
  generated_subject VARCHAR(300) NOT NULL,
  generated_body  TEXT NOT NULL,
  approval_status VARCHAR(20) NOT NULL DEFAULT 'pending',  -- 'pending'|'approved'|'rejected'|'auto-approved'
  approval_actor  VARCHAR(100),  -- AE/BD email or 'system' for auto-approve (Tier 4 only)
  approved_at     TIMESTAMPTZ,
  sent_at         TIMESTAMPTZ,
  send_provider   VARCHAR(20),   -- 'resend' | 'gmail-oauth'
  send_message_id VARCHAR(200),
  constitutional_check_pass BOOLEAN NOT NULL DEFAULT FALSE,
  constitutional_check_log JSONB,  -- {SO-7: pass, SO-12: pass, SO-23: pass, SO-24: pass}
  ai_cost_cents   INTEGER
);

CREATE INDEX bali_sends_prospect ON bali_sends(prospect_id);
CREATE INDEX bali_sends_pending_approval ON bali_sends(approval_status) WHERE approval_status = 'pending';

-- Inbound classification log
CREATE TABLE bali_inbound (
  id              BIGSERIAL PRIMARY KEY,
  prospect_id     BIGINT REFERENCES bali_prospects(id),
  send_id         BIGINT REFERENCES bali_sends(id),  -- which outbound this is replying to
  raw_subject     VARCHAR(500),
  raw_body        TEXT,
  classifier_intent VARCHAR(50) NOT NULL,  -- 'IR-01' | 'IR-04' | etc.
  classifier_confidence NUMERIC(3,2),
  classifier_reasoning TEXT,
  routed_to       VARCHAR(20) NOT NULL,  -- 'ai-auto-reply' | 'human-ae' | 'human-bd' | 'human-ceo' | 'human-cto'
  responded_at    TIMESTAMPTZ,
  response_template VARCHAR(20),
  ai_cost_cents   INTEGER,
  received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- A/B test results
CREATE TABLE bali_ab_tests (
  id              BIGSERIAL PRIMARY KEY,
  template_id     VARCHAR(20) NOT NULL,
  variant         CHAR(1) NOT NULL,
  sends_count     INTEGER NOT NULL DEFAULT 0,
  opens_count     INTEGER NOT NULL DEFAULT 0,
  replies_count   INTEGER NOT NULL DEFAULT 0,
  meetings_booked_count INTEGER NOT NULL DEFAULT 0,
  current_winner  BOOLEAN NOT NULL DEFAULT FALSE,
  cohort_start    DATE NOT NULL,
  cohort_end      DATE,
  notes           TEXT
);
```

---

## §3. Capability Boundaries (What Bali AI CAN and CANNOT Do)

### §3.1 ALWAYS Auto (Tier 4 — JD-Forge Enterprise prospects)

The AI agent has full auto-send authority for these activities:

| Activity | AI auto? | Constitutional gate |
|---|---|---|
| Personalize T4A cold opener | ✅ | SO-7 USP verbatim check |
| Send T4A to a Tier 4 prospect | ✅ | SO-12 + SO-24 pass |
| Classify Tier 4 inbound replies | ✅ | n/a (read-only) |
| Auto-respond IR-04 (soft no), IR-05 (hard no), IR-07 (OOO) | ✅ | SO-12 check |
| Auto-update HubSpot deal stages | ✅ | n/a |
| Auto-trigger T4C / T4D follow-ups per cadence | ✅ | SO-7 + SO-12 + SO-23 + SO-24 batch check |
| Run A/B test allocation | ✅ | n/a |

### §3.2 SUPERVISED (Tier 3 — ReadyBank API platform prospects)

The AI agent prepares; the human BD final-approves before send.

| Activity | AI auto? | Approval gate |
|---|---|---|
| Personalize T3A cold opener | ✅ prepares | BD reviews + approves before send |
| Send T3A to Tier 3 prospect | ❌ | BD click-to-send |
| Classify Tier 3 inbound replies | ✅ | BD reviews routing if confidence <0.85 |
| Auto-respond IR-04, IR-05, IR-07 | ❌ | BD approves response |
| Auto-respond IR-01, IR-02, IR-03 (positive) | ❌ | BD ALWAYS handles positives in Tier 3 |
| HubSpot stage updates | ✅ | n/a |
| A/B test results compilation | ✅ | BD reviews quarterly |

### §3.3 NEVER (Tier 1 + Tier 2 — Stack-Vault Enterprise/Group/Department)

The AI agent NEVER auto-sends to Tier 1 or Tier 2 prospects. Period. The AI agent CAN:
- Prepare personalization research (anchor extraction)
- Draft outbound emails for AE review
- Classify inbound emails for AE awareness (read-only)
- Compile reporting for AE quarterly review

But the human AE owns every send + every reply for Tier 1 + Tier 2.

**Why:** Per SO-18, "Pure-AI sales is forbidden for deals >₹10L ACV." Tier 1+2 ACVs (₹10L–₹1Cr+) all exceed this threshold. The relationship cost of a bad AI send to a GCC TA Director is too high to risk.

### §3.4 Hard No (Across All Tiers)

The AI agent NEVER:
- Auto-sends to a prospect with `do_not_contact=TRUE`
- Auto-sends without passing the Constitutional Compliance gate (§4)
- Auto-replies to a positive intent reply (IR-01, IR-02, IR-03) regardless of tier
- Auto-replies to an objection-in-thread (IR-08) regardless of tier
- Auto-handles a procurement questionnaire (IR-09)
- Auto-handles a reference request (IR-11)
- Auto-handles closed-won (IR-12) — CEO + AE always personally welcome the customer
- Sends >100 emails/day per tier without explicit human override
- Sends after 8 PM local time of the recipient (calendar-aware)
- Touches a prospect within 4 days of the last touch on the same thread

---

## §4. Constitutional Compliance Gates (every send)

Before any outbound email is sent (whether auto or AE-approved), the AI agent runs four checks. Failure of any check BLOCKS the send.

### §4.1 SO-7 USP-Verbatim Check

The three-sentence USP from Constitution §1.1 appears verbatim somewhere in the email body, or the email body explicitly does not include the USP at all (some templates don't). Paraphrasing the USP fails this check.

### §4.2 SO-12 Reference-Customer Authorization Check

If the email body names ANY customer (Talpro India, Bosch GCC, etc.), the agent verifies:
1. The customer is on the pre-consented reference list, OR
2. The send_id has an `approval_actor` who manually authorized this specific reference

Talpro India is permanently on the pre-consented list; all others require explicit approval.

### §4.3 SO-23 Pricing-Anchor Check

If the email body contains pricing references, they MUST match the anchored bands:
- ReadyBank API: $5,000–$25,000/year (no exceptions in cold emails)
- ReadyBank Recruiter: ₹4,999–₹49,999/month
- JD-Forge: $49 / $199 / $499 per JD; $499 / $1,999 / $9,999 / month subscriptions
- Stack-Vault: ₹10L Department / ₹40L Enterprise / ₹1Cr+ Group per year

Sub-floor pricing in cold emails (e.g., "₹30L Stack-Vault") fails this check; CEO approval required per SO-11.

### §4.4 SO-24 No-Fiction Check

If the email body contains specific claims about:
- QOrium library size
- QOrium customer count
- QOrium ATS integration list
- QOrium AI plagiarism accuracy
- Any competitor's specific metrics

...the agent verifies each claim against a tool call or live source captured in the same generation cycle. Claims without backing fail this check.

### §4.5 Compliance Log

Every send record (`bali_sends.constitutional_check_log`) stores the per-check result. Failures are logged with the failing claim + suggested fix; the agent does NOT auto-retry — it routes to AE for manual revision.

---

## §5. Personalization Pipeline

For each prospect on the Top 100 list, the agent runs a personalization research cycle that produces 5 anchor types per the outbound templates:

### §5.1 Anchor Extraction (per prospect, ~30-90 sec, ~$0.05-$0.20 in AI cost)

```
INPUT: prospect record (company, contact name, role)

STEP 1: Public web scan via Serper.dev
  - Query: "{company} {role} hiring 2026"
  - Query: "{company} layoffs OR funding OR acquisition 2026"
  - Query: "{company} tech stack engineering"
  - Query: "{contact_name} LinkedIn {company}"

STEP 2: LinkedIn enrichment via Playwright
  - Fetch contact's recent activity (3 most recent posts)
  - Fetch contact's mutual connections with Bhaskar/Talpro Universe
  - Fetch company's job posting count by stack

STEP 3: Press scan
  - Query: "{company} press release 2026"
  - Filter to last 90 days

STEP 4: AI synthesis
  - Claude Opus extracts the 5 anchor types from raw data
  - Returns structured JSON matching outbound template tokens

STEP 5: Cache to bali_personalization_anchors
  - Freshness: 30 days
  - Re-research if prospect status moves to active outreach >30 days post-cache
```

### §5.2 Anchor Quality Bar

Anchors are graded by the agent's own self-critique:

- **High-quality anchor:** Specific (mentions exact metric, role, date, or competitive event), recent (<90 days), relevant (ties directly to QOrium's wedge)
- **Medium-quality anchor:** Specific OR recent, relevant
- **Low-quality anchor:** Generic, dated, or weakly relevant

Sends with all anchors at "high" quality auto-pass §6 send approval; sends with any "low" anchor route to human review (Tier 4) or rejection (Tier 1+2+3).

### §5.3 Privacy + Compliance

Personalization research is **public-data only**. The agent NEVER:
- Logs into LinkedIn as Bhaskar to scrape gated content
- Buys data from third-party data brokers without DPA review
- Stores PII beyond the contact email + role + LinkedIn handle
- Shares anchor data outside the Bali agent stack

DPDPA + GDPR posture: agent acts as data processor for QOrium (data fiduciary); no candidate-attributable data flows.

---

## §6. Send Approval Workflow

### §6.1 Tier 4 (Auto-Approve)

```
1. Personalization anchors fetched + graded
2. Template selected per cadence (T4A → T4C → T4D)
3. Email body generated with anchors + USP + pricing
4. Constitutional gate runs (§4)
5. IF gate passes AND all anchors are high/medium quality:
   → bali_sends.approval_status = 'auto-approved'
   → Send via Resend with calendar-aware delay
6. IF gate fails OR any anchor is low quality:
   → bali_sends.approval_status = 'pending'
   → Slack ping #qorium-bali-review with the failing send
   → Human BD reviews + approves/rejects within 4 hours (else send drops)
```

### §6.2 Tier 3 (BD Approve)

```
1-4. (Same as Tier 4)
5. ALWAYS bali_sends.approval_status = 'pending'
6. Slack ping #qorium-bali-review with full email preview
7. BD clicks Approve OR Reject (with optional edits)
8. If Approve: send via Resend; send_id auto-updates HubSpot
9. If Reject with edits: BD's edited version is the new body; agent regenerates Constitutional check; if passes, queued to send
10. If Reject without edits: send drops; prospect re-queues to human-handled list
```

### §6.3 Tier 1 + 2 (No Auto)

```
1-3. Personalization anchors fetched (cached for AE use)
4. Email body NOT generated by agent
5. AE manually composes email using outbound templates + anchor data
6. AE sends from their own email client (Gmail / Outlook)
7. Agent observes the send via Gmail OAuth IMAP for tracking; updates HubSpot stages
```

---

## §7. Inbound Classification + Routing

### §7.1 Classifier

For every inbound email reply (across all tiers), the agent runs a Claude Opus classifier:

```
INPUT: raw email subject + body + thread context (last 3 messages)

CLASSIFIER OUTPUT:
{
  "intent": "IR-01" | "IR-02" | "IR-03" | ... | "IR-12",
  "confidence": 0.00-1.00,
  "reasoning": "free text explanation",
  "extracted_signals": {
    "is_positive": bool,
    "is_objection": bool,
    "specific_objection": "price" | "in-house" | "ip" | "fit" | "timing" | null,
    "is_referral": bool,
    "referred_to": "{colleague_name}" | null,
    "is_ooo": bool,
    "ooo_return_date": "YYYY-MM-DD" | null,
    "is_questionnaire": bool,
    "is_reference_request": bool,
    "is_pricing_negotiation": bool,
    "is_contract_signed": bool
  }
}
```

### §7.2 Routing

| Classification | Tier 1+2 routing | Tier 3 routing | Tier 4 routing |
|---|---|---|---|
| IR-01 (positive demo) | AE | BD | BD (always — too high-stakes for AI) |
| IR-02 (sample pack) | AE + CTO | BD + CTO | BD + CTO |
| IR-03 (info ask) | AE | BD | BD |
| IR-04 (soft no) | AE | BD | AI auto (Bali templates) |
| IR-05 (hard no) | AE | BD | AI auto (Bali templates) |
| IR-06 (referral) | AE | BD | BD |
| IR-07 (OOO) | (no action; auto-defer) | (auto-defer) | (auto-defer) |
| IR-08 (objection) | AE | BD | BD (objection threading is too nuanced for AI) |
| IR-09 (procurement) | AE + CTO | BD + CTO | BD + CTO |
| IR-10 (pricing nego) | AE + CEO | BD + CEO | BD + CEO |
| IR-11 (reference) | AE + CEO | BD + CEO | BD + CEO |
| IR-12 (closed-won) | CEO + AE | CEO + BD | CEO + BD |

If classifier confidence <0.85, route to human regardless of tier — let humans interpret ambiguous replies.

---

## §8. A/B Testing Automation

### §8.1 Allocation

For every Tier 3 + Tier 4 send, the agent randomly assigns Variant A or Variant B (50/50):

```
variant = (prospect_id + template_id).hash() % 2 == 0 ? 'A' : 'B'
```

Sticky per (prospect, template) — same prospect always gets the same variant for a given template across the cadence.

### §8.2 Winner Selection

After 50 sends per (template_id, variant), the agent computes:
- Open rate (via tracking pixel)
- Reply rate (via inbound classification)
- Meeting-booked rate (via deal stage in HubSpot)

Variant with higher reply rate (the metric that matters) wins. If statistical confidence ≥0.95 (chi-square test), winner is auto-promoted to 100% allocation; loser is demoted to 0%; new Variant C is generated by the agent with a different framing for the next test.

### §8.3 Quarterly Review

Every quarter, the BD reviews `bali_ab_tests` results and decides which template families need wholesale revision (current variants saturated; new framing needed).

---

## §9. Operational Metrics + Kill Switches

### §9.1 Always-On Metrics

The agent emits these to OpenTelemetry every 60 seconds:

- `bali_sends_total{tier, status}` — counter
- `bali_sends_blocked_total{tier, gate}` — counter (Constitutional gate failures)
- `bali_inbound_total{tier, intent}` — counter
- `bali_inbound_classifier_confidence` — histogram
- `bali_personalization_runs_total` — counter
- `bali_ai_cost_cents_total{provider, purpose}` — counter
- `bali_send_latency_p95_ms` — histogram
- `bali_classifier_latency_p95_ms` — histogram
- `bali_pending_approvals_count` — gauge (alert if >50)

### §9.2 Kill Switches

The agent stops auto-send IMMEDIATELY if any of the following triggers fire:

| Trigger | Action |
|---|---|
| Monthly AI cost exceeds $1,500 USD | Stop all auto-send; alert CTO + CEO |
| Constitutional gate failure rate >5% in last 1,000 sends | Stop Tier 4 auto-send; route all to BD |
| Inbound IR-05 rate exceeds 15% of replies in 7-day rolling window | Stop Tier 4 auto-send; framing review needed |
| Classifier confidence average <0.80 | Stop auto-replies; route all inbound to humans |
| Any Tier 4 send where prospect's `do_not_contact=TRUE` was bypassed | Hard stop all auto-send + Sev 1 incident + postmortem |
| Sentry catches unhandled exception in send pipeline | Auto-page on-call CTO; pause auto-send until ack |

Kill-switch states require manual reset by CTO Office after remediation.

---

## §10. Day 1 → Month 3 Rollout Plan

### §10.1 Day 0–14 (Phase 0; spec-only)

- Spec authored (this doc) ✅
- BD JD includes "experience with AI sales tooling" requirement ✅ (per CTO Architecture C4)
- Database schema migrations 0008 through 0010 written + tested in staging
- HubSpot custom fields configured (`tier`, `priority_band`, `ai_supervised`, `email_variant`, etc.)

### §10.2 Month 1 (engineering build; 0% sends)

- Senior Engineer (M2 hire) implements Phase 1 of agent (personalization pipeline only)
- Personalization research runs nightly for first 25 prospects on Top 100
- BD (M3 hire) reviews anchor quality; agent tunes prompts based on feedback
- Zero outbound sends from agent yet

### §10.3 Month 2 (Tier 4 supervised; 25% volume)

- Outbound generator + Constitutional gates ship
- Tier 4 sends run in `pending` state (no auto-approve); BD reviews + approves
- Target: 50 Tier 4 sends through agent in Month 2; reply rate compared to BD-direct sends
- Inbound classifier ships in shadow mode (logs predictions, doesn't act)

### §10.4 Month 3 (Tier 4 auto; full Tier 3 supervised)

- Tier 4 auto-approve flips ON for sends where Constitutional gate + anchor quality both pass
- Tier 3 sends run in supervised mode (BD final-click)
- Inbound classifier flips to active mode for IR-04 / IR-05 / IR-07 auto-replies (Tier 4 only)
- A/B testing allocation goes live for both T4A and T3A

### §10.5 Month 4–6 (scale)

- Tier 4 prospects expand from 10 to 30 (Top 100 → Top 200 list)
- Tier 3 sends scale with BD bandwidth
- A/B test winners promoted; new variants generated quarterly
- Constitutional gate failure rate <2% target

---

## §11. Risk Register + Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| AI generates a fictional claim and sends it | Med | High | SO-24 No-Fiction Rule check; manual review on any failure; quarterly audit of sample sends |
| AI sends to wrong tier (e.g., auto to Tier 1) | Low | Critical | Tier check happens FIRST in send pipeline; bypass attempt = Sev 1 + kill switch |
| Reference customer name used without consent | Low | High | SO-12 check; permitted-references list maintained in DB; audit per send |
| Mass-spam appearance (too many sends/day) | Med | High | Rate limit 100/day per tier; calendar-aware send-time spread; BD daily review of volume |
| Classifier mis-routes a positive reply to auto-respond | Low | High | Auto-reply is forbidden for IR-01/02/03 regardless of confidence; only IR-04/05/07 auto |
| Personalization scrapes leak into wrong prospect's send | Med | High | Per-prospect anchor cache keyed by prospect_id; no cross-prospect bleed by design |
| AI cost runaway | Med | Med | $1,500/month hard cap; daily cost alerts; auto-stop on cap |
| Email provider blacklists qorium.online domain | Low | Critical | SPF + DKIM + DMARC fully configured; gradual ramp-up (10 → 50 → 100 sends/day); separate IP for cold vs warm |
| BD reviews queue >50 pending sends | Med | Med | Alert at 50; auto-extend approval SLA to 12h; Slack daily digest |
| Classifier hallucinates a non-existent objection | Med | Med | Confidence threshold 0.85 for auto-action; reasoning logged; quarterly review |
| AI write style diverges from Bali Sales Playbook voice | Med | Med | Voice-check sub-prompt in generator; quarterly comparison sample reviewed by AE |

---

## §12. Constitutional Alignment

This spec is consistent with Constitution v2.0:

- **§1.1 USP:** AI uses USP verbatim per SO-7
- **§1.2 SKUs:** AI references all 3 SKUs by name; no rebranding
- **Article II §2.7 (Bali):** AI is the Bali office's automation tool; reports to Sales Lead (Y2+) / BD (Y1)
- **Article V SO-7 (USP verbatim):** §4.1 enforces
- **Article V SO-11 (Pricing anchor):** §4.3 enforces
- **Article V SO-12 (Reference customers):** §4.2 enforces
- **Article V SO-18 (Hybrid mandate):** §3 enforces tier boundaries
- **Article V SO-23 (API pricing $5K-$25K):** §4.3 enforces
- **Article V SO-24 (No-Fiction):** §4.4 enforces
- **Article VII Quality Gate:** §4.5 logs evidence for auditing
- **Article X §10.3 (Competitive Watch):** AI does not name competitors except as classified per Bali §2.7 table

---

## §13. Engineering Build Estimate (per CTO Architecture)

| Component | Effort | Owner | Phase |
|---|---|---|---|
| Database migrations (0008-0010) | 2 days | Senior Eng | Phase 0 |
| Personalization pipeline (Serper + Playwright + Claude synthesis) | 5 days | Senior Eng | Phase 1 M1 |
| Outbound generator (template engine + Claude personalization) | 5 days | Senior Eng | Phase 1 M2 |
| Constitutional gate runtime | 2 days | Senior Eng | Phase 1 M2 |
| Inbound classifier (Claude pipeline + HubSpot integration) | 4 days | Senior Eng | Phase 1 M2 |
| HubSpot CRM integration (REST + webhook) | 3 days | Senior Eng | Phase 1 M2 |
| Resend send integration + tracking pixels + bounce handling | 2 days | Senior Eng | Phase 1 M3 |
| OpenTelemetry instrumentation + Sentry | 1 day | Senior Eng | Phase 1 M3 |
| BD review UI (Next.js admin app extension) | 3 days | Frontend Eng | Phase 1 M3 |
| A/B test scaffolding | 2 days | Senior Eng | Phase 1 M3 |
| Kill switch logic + admin dashboard | 1 day | Senior Eng | Phase 1 M3 |
| **Total** | **~30 dev days** | | **End of M3** |

Within Senior Engineer's M2-M3 capacity (assuming 50% allocation to Bali agent and 50% to other Phase 1 milestones).

---

## §14. Out of Scope (v1)

These are explicitly NOT in v1; deferred to v1.1 or v2:

- Voice channel (cold calls via Twilio + Claude conversational) — v2.0 only after first 50 logos prove email motion
- WhatsApp Business API integration for AI-driven WhatsApp outreach — v1.1 (Tier 4 only; same gates)
- LinkedIn Sales Navigator OAuth integration for in-app outreach — v2.0
- Multi-language support (Hindi, Tamil regional outreach) — v2.0
- Conversation-style agent (multi-turn email threads autonomously) — v2.0; v1 is single-touch only
- Sentiment analysis on inbound (currently the classifier emits intent only) — v1.1
- Renewal motion automation (existing customer expansion) — v1.1 ships after first 5 logos hit Year-2 renewal

---

**End of Bali AI Agent Spec v1.** This is the operational design lock for the AI side of the hybrid Bali sales motion. Engineering build begins post-Senior-Engineer-hire (M2) per CTO Architecture §15. Spec reviewed quarterly; revisions tracked at `sales/Bali-AI-Agent-Spec-v1.x.md`.
