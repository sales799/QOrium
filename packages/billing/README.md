# @qorium/billing

Pure-TS pricing + GST + HSN/SAC library. Sprint 2.2 per
`governance/Auto-Mode-Remote-Plan-v1.md` §4 Phase D.

## Status

- **Pricing tables, GST math, GSTIN validation, SAC codes:** v0 ready.
- **Razorpay / Stripe integration, payment webhooks, invoice PDFs:** future
  sprint, gated on cred-drop.

## What it does

| Module           | Purpose                                                                                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `currency.ts`    | `Money` in minor units (paise / cents) using `bigint`; sum / multiply / format / `applyRate` with banker rounding                                     |
| `sku-pricing.ts` | Canonical INR + USD pricing table per Constitution §1.2 (LOCKED) — all 6 ReadyBank tiers, 6 JD-Forge tiers, 3 Stack-Vault tiers                       |
| `gst.ts`         | `computeGst()` (intra-state CGST+SGST · inter-state IGST · export zero-rated · non-India IGST), GSTIN structural validation, Indian state-code lookup |
| `hsn-sac.ts`     | SAC codes per SKU (998314 / 998313 / 998319) — `verification: pending` until GST counsel sign-off                                                     |
| `invoice.ts`     | `buildInvoice()` — one pure call from `(buyer, seller, lines)` to a structured invoice with totals + warnings                                         |

## API

```ts
import {
  buildInvoice,
  money,
  validateGstin,
  type BuyerProfile,
  type SellerProfile,
} from '@qorium/billing';

const seller: SellerProfile = {
  country: 'IN',
  stateCode: '29',
  gstin: '29AABCT1234A1Z5',
  legalName: 'Talpro Universe Pvt Ltd',
};

const buyer: BuyerProfile = {
  country: 'IN',
  stateCode: '29',
  gstin: '29AABCB5678D1Z3',
};

const result = buildInvoice({
  buyer,
  seller,
  lines: [{ sku: 'readybank', tier: 'recruiter-team', quantity: 12 }],
});

// result.totals.scheme === 'intra-state'
// result.totals.lines[0].tax.cgst > 0n
// result.totals.lines[0].tax.sgst > 0n
```

## GST schemes

| Buyer state                     | Currency | Outcome           |
| ------------------------------- | -------- | ----------------- |
| Same Indian state as seller     | INR      | CGST 9% + SGST 9% |
| Different Indian state          | INR      | IGST 18%          |
| Outside India, foreign currency | USD      | Zero-rated export |
| Outside India, INR (no LUT)     | INR      | IGST 18%          |

Override via `computeGst(..., { rate, zeroRateExports })`.

## SAC verification

Codes are **structurally correct** but `verification: 'pending'` until
GST counsel cross-checks the latest CBIC notification. Same pattern as
`@qorium/nos-mapper` — flipping to `verified` is a small data-only PR.

## When to update

- New SKU tier → add to `src/sku-pricing.ts`
- CBIC issues a SAC update → revise `src/hsn-sac.ts`
- New state code → extend `INDIAN_STATE_CODES` in `src/gst.ts`
- GST rate changes → override the default via `computeGst({ rate })`

## Out of scope (next sprints)

- Razorpay / Stripe SDK calls (cred-bound)
- Invoice PDF rendering (wkhtmltopdf or Chromium)
- Webhook handlers
- Subscription lifecycle management (proration, cancelation)
- Dunning policy + retry queue
- Customer self-service portal
- Zoho Books export
