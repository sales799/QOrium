# Audit Export Wiring — Sprint 4.4.2 → Outbound Compliance Proof

**Purpose:** wire the Audit Log API + Audit Export (Sprints 4.4.1
through 4.4.3) into outbound demos as a compliance proof point —
specifically for ICP-2 (mid-market enterprise) but useful in ICP-1
discovery.

The wiring is documentation + demo flow, not code. The code already
shipped.

---

## What customers ask for (and what we already have)

| Customer ask | QOrium response | Where it lives |
|---|---|---|
| "Show me a sample audit log of a candidate's full session" | Demo Audit Log API GET /v1/audit/events scoped to a tenant | services/readybank src/routes/audit.ts (Sprint 4.4) |
| "Can we export 6 months of audit data for our SOC 2 auditor?" | POST /v1/audit/events/export with date range; CSV or JSON download | services/readybank src/routes/audit.ts + audit-export-worker.ts (Sprint 4.4.2) |
| "Prove that the audit log can't be tampered with after the fact" | GET /v1/audit/verify returns chain_status: "intact" with hash chain reference | packages/auth audit-hash.ts + services/readybank routes/audit.ts (Sprint 4.4.3) |
| "Show me how I'd answer 'who saw question X on date Y'" | Audit log filter by event_type + scoped tenant_id | repositories/audit-events.ts SCOPE_CLAUSE pattern |

All of the above is already shipped + tested (per merge-order doc
Tier-A1). Customer-facing demo is the next step.

---

## Demo flow — 10-minute audit-export-as-compliance pitch

Use this **inside** the primary ReadyBank/Stack-Vault demo (segment
6 of that 30-min demo, after pricing).

### Step 1 — Frame the SOC 2 / SOX problem (1 min)

> "Auditors ask three questions about your candidate-assessment
> surface:
>
> 1. Who accessed what assessment, when, and from where?
> 2. Can the answer to (1) be tampered with?
> 3. Can you produce 6 months of (1) in a defensible format in
>    < 24 hours?
>
> Most assessment platforms struggle on (2) and (3). QOrium answers
> all three by design."

### Step 2 — Live POST audit export (3 min)

Demo cue: pre-scripted curl (or Insomnia/Postman call) ready to
fire.

```bash
curl -X POST https://api.qorium.online/v1/audit/events/export \
  -H "Cookie: <session>" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "from": "2026-01-01",
    "to": "2026-04-30",
    "event_types": ["session.started", "question.viewed", "session.submitted"]
  }'
```

Response (within ~3 seconds):
```json
{ "id": "<job-id>", "status": "queued" }
```

> "We just kicked off a 4-month audit export. The job runs async;
> we poll the job ID."

```bash
curl https://api.qorium.online/v1/audit/events/export/<job-id> \
  -H "Cookie: <session>"
```

(After ~10 seconds, status flips to `completed`.)

```bash
curl https://api.qorium.online/v1/audit/events/export/<job-id>/download \
  -H "Cookie: <session>" \
  -o audit_export.csv
```

> "Download. Open in Excel. Each row is one tenant-scoped event:
> who, what, when, payload hash, hash_current. RFC-4180 CSV; the
> auditor can sample-verify in their own tooling."

(Open the CSV in Excel; show 5-10 rows.)

### Step 3 — Live GET audit verify (2 min)

```bash
curl https://api.qorium.online/v1/audit/verify \
  -H "Cookie: <session>"
```

Response:
```json
{
  "chain_status": "intact",
  "hashed_count": 47891,
  "unhashed_count": 1247,
  "broken_links": []
}
```

> "Chain-status 'intact' means every event since the hash-chain
> feature shipped (Sprint 4.4.3) cryptographically links to the
> previous one. Tampering with any event in the past invalidates
> the chain from that point forward — and the verify endpoint
> shows you exactly where.
>
> Unhashed-count are legacy events from before the hash-chain
> feature; auditors get a transparency note explaining the cutover
> date."

### Step 4 — SOC 2 control mapping handout (2 min)

> "We map this to the SOC 2 Trust Services Criteria. Here's the
> mapping for your auditor — it shows where QOrium provides
> evidence vs where you need supplementary controls."

Hand the customer the mapping doc:
`governance/soc2/control-mapping.md` (Sprint 5.1; merged in PR #39).

Highlight specific controls:
- **CC7.2 (System Operations — monitoring):** QOrium provides via
  Audit Log API + verify endpoint
- **CC6.1 (Logical access controls):** Stack-Vault tenant isolation
  + SAML/SCIM (post-cred-drop)
- **PI1.1 (Processing integrity):** hash-chained events + IRT
  calibration audit trail
- **C1.1 (Confidentiality):** anti-leak rotation + watermark per
  candidate

### Step 5 — Cost-of-compliance ROI (2 min)

> "If your SOC 2 auditor currently asks for 40 hours of evidence
> collection on the assessment surface, QOrium reduces that to
> ~4 hours. At ₹4K/hour internal rate, that's ₹14.4L savings per
> audit cycle."

(This rolls into ROI calculator's Savings 4 line.)

---

## Pre-demo readiness checklist

- [ ] Customer's tenant pre-provisioned in our staging environment
- [ ] At least 100 sample audit events seeded for that tenant
  (use a one-time `pnpm exec tsx scripts/seed-demo-audit-events.ts
  <tenant_id>` follow-on engineering script — ships in 1 sprint)
- [ ] Curl/Postman calls saved in a "demo collection"
- [ ] SOC 2 control mapping doc printed or PDF'd for handout
- [ ] Backup screenshots in case of network drop

---

## Customer-facing 1-pager

After the demo, send a 1-page PDF:

```
QOrium Audit Log API + Export — Compliance Proof

For [Their Firm]'s SOC 2 / SOX / DPDPA audit cycle:

1. Per-tenant audit log scoped by SCOPE_CLAUSE pattern
   (proof: services/readybank repositories/audit-events.ts)

2. Hash-chained events; tampering detectable via /v1/audit/verify
   (proof: packages/auth audit-hash.ts; SHA-256 over canonical JSON)

3. Bulk export CSV/JSON within 60 seconds for any date range up
   to 366 days
   (proof: services/readybank src/routes/audit.ts POST /export)

4. Per-tenant active-job cap of 5; per-tenant data isolation
   enforced at SQL level

5. SOC 2 Trust Services Criteria mapping doc included
   (governance/soc2/control-mapping.md)

Estimated audit-cycle time saved: ~36 hours per cycle
Estimated annual savings: ₹14.4L per audit cycle (assuming 1 cycle/yr)

Pilot: 30 days free; we provision your tenant + audit-export
access; you run it against your auditor's mock requests; if it
doesn't save the time we say it will, no charge.

Contact: bhaskar@qorium.online
```

---

## Standing Order #2 (USP) compliance

Audit-export demo references "anti-leak-rotated" + "watermark-per-
candidate" + "IRT-calibrated" via the parent demo flow. ✅

---

## Engineering follow-on (cred-bound)

To make the demo flow + 1-pager production-grade, 1 follow-on
engineering sprint covers:

- `scripts/seed-demo-audit-events.ts` — per-tenant demo data
  seeder with realistic event distribution
- `services/readybank` automated pre-demo provisioning script
  (creates a demo tenant + recruiter + 100 candidates + 1,000
  audit events)
- ROI 1-pager PDF generator (pulls from a customer's discovery
  worksheet inputs)
- Public landing-page section on `qorium.online/security` showing
  the SOC 2 mapping (cred-bound)

These ship in Sprint 4.4.4 (engineering-complete-cred-bound) post-
cred-drop.

---

_Demo flow is documentation; underlying code is shipped. CEO uses
in outbound demos to ICP-2 starting week 3._
