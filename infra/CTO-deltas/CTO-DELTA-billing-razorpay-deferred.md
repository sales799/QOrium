# CTO-DELTA: Billing v0 ships pure-logic + stub Razorpay; live KYB + ledger deferred

**Date:** 2026-05-03
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/Billing-Service-v0-Spec.md` §3, §4, §6, §8

## Background

The full billing spec describes:

- **Two payment processors** — Razorpay (India) + Stripe (international)
- **Double-entry ledger** in `billing.ledger` for accounting integrity
- **Refunds workflow** with provider-side refund APIs
- **Customer self-service portal** at `my.qorium.io`
- **Zoho Books integration** for tax remittance
- **PDF invoice generation** via wkhtmltopdf
- **Live Razorpay KYB-completed business account** to issue real orders

None of those external dependencies can be wired without CEO action; v0
ships the pieces that don't depend on them.

## Adaptation in v0

The billing service ships:

- Migration `0011_billing.sql` — six tables: `customers`, `subscriptions`,
  `invoices`, `line_items`, `payments`, `usage_records`. CHECK
  constraints enforce status / SKU / currency / metric vocabularies.
- **Pure-logic invoice math** (`computeInvoice`, `computeLineItem`,
  `prorate`, `formatInvoiceNumber`) — runs in any environment without
  network or DB.
- **Pure-logic dunning state machine** (`evaluateDunning`) — open →
  past_due (after 3 days) → canceled (after 14 days) with three retry
  slots [3, 7, 14] days.
- **Razorpay client (Stub default; Real impl gated on credentials)** —
  Stub returns deterministic order ids; Real impl uses Basic auth
  against `https://api.razorpay.com/v1/orders` and throws on missing
  `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`.
- **Razorpay webhook verifier** (`verifyWebhookSignature`) — pure-logic
  HMAC-SHA256 hex compare per
  https://razorpay.com/docs/webhooks/validate-test/
- **Express endpoints**: customer upsert + read, invoice preview
  (no DB write), invoice create/list/get, Razorpay webhook ingestion
  with signature verification + payment recording + invoice marking
  paid on capture.

**What is deferred:**

- Live Razorpay test sandbox credentials (CEO action — needs
  business KYB completion).
- Stripe integration (international customers; CEO + customer-success
  decision).
- Double-entry ledger (`billing.ledger`) — needed for SOC 2 audit
  reconciliation; deferred to a follow-up sprint.
- Refunds workflow — `billing.refunds` table + provider refund API;
  deferred until first real customer charge.
- Customer self-service portal at `my.qorium.io` — deferred to Sprint
  2.7 alongside the rest of the customer onboarding infra.
- Zoho Books integration for monthly tax remittance — Month 9
  roadmap per spec §5.
- PDF invoice generation via wkhtmltopdf or Puppeteer — deferred;
  v0 returns the structured invoice JSON and lets the customer-side
  portal render the PDF.
- GST calculation enhancements (state-wise SGST/CGST split, GSTIN
  active-status verification) — v0 applies a single aggregate rate.

## Reconciliation request to CTO Office

Two options:

1. **Ratify v0 control plane + Stub Razorpay**, switch to live
   on the activation date when the KYB account + DNS for
   `my.qorium.io` are ready (recommended).
2. **Block v0 on Razorpay live wire-up** — open the business account,
   provision the test credentials, run the Razorpay-enrolled load
   test today.

Default: option 1. The stub-vs-real split is established across the
codebase (see ATS / SSO deltas); the swap to live is one env var.

## Verification

- `services/billing/__tests__/invoice-math.test.ts` — 12 cases
  (line item math, GST 18%, zero tax, rounding, multi-line invoice,
  discount lines, prorate corner cases, invoice number format)
- `services/billing/__tests__/dunning.test.ts` — 7 cases (open →
  past_due → canceled, retry-schedule indexing, paid/refunded
  no-op, attempt cap)
- `services/billing/__tests__/razorpay.test.ts` — 9 cases (signature
  verify happy path + tampered + missing + malformed; isRazorpayEvent
  guard; stub createOrder; real client throw-on-missing-creds; real
  client Basic auth)
- `services/billing/__tests__/server.test.ts` — 10 cases (healthz,
  preview no-DB, customer upsert, invoice create, no-customer 404,
  no-tenant 401, bad-id 400, missing 404, webhook bad-signature 401,
  webhook captured 202)
- `migration.smoke.test.ts` — adds verification that migration 0011
  created the `billing` schema with 6 tables + status / sku CHECKs
