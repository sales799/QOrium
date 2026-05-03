# Billing Service Specification v0

**Status:** Draft for CTO Review | **Phase:** Design Phase | **SO Reference:** SO-9 (Revenue Engine), SO-14 (Integration Points)

## 1. Purpose

Enable end-to-end subscription and usage-based billing for QOrium's three SKU model. Support recurring charges (ReadyBank annual, JD-Forge per-order, Stack-Vault annual), accept payments via Razorpay (India) and Stripe (international), calculate GST automatically, and provide customer self-service billing portal with invoice history and spend tracking.

## 2. SKU Billing Models

| SKU | Pricing Model | Tiers | Billing Cycle | Example |
|-----|---------------|-------|---|---|
| **ReadyBank** | Annual subscription | Tier 1: ₹50L (250 q/yr) | 12 months | ₹50L upfront, annual renewal |
| | | Tier 2: ₹100L (1K q/yr) | | |
| | | Tier 3: ₹200L (5K q/yr) | | |
| | | Tier 4: ₹500L (20K q/yr) | | |
| **JD-Forge** | Per-JD with tier pricing | Standard: ₹49 (basic), ₹149 (reviewed), ₹499 (enterprise) | Pay-as-you-go | ₹149 per JD × 50 JDs = ₹7,450 |
| **Stack-Vault** | Annual subscription with usage overages | Tier 1: ₹10L (50 q/yr) | 12 months + usage | ₹10L + ₹5K per excess question |

## 3. Architecture

### Service Topology
- **Service:** `billing-service` (PM2 cluster mode, 2 workers on Hostinger VPS)
- **Primary Queue:** Redis (`BILLING_EVENTS_QUEUE`)
- **State Store:** PostgreSQL `billing.*` tables
- **Payment Processor:** Razorpay SDK (India), Stripe SDK (international)
- **Ledger:** Double-entry accounting in `billing.ledger` table
- **Webhooks:** Inbound webhooks from Razorpay/Stripe to `/webhooks/payment`

### Lifting from Maitro's Razorpay Integration

Reuse existing Talpro payment logic (Maitro project):
- Razorpay order creation workflow
- Webhook signature verification (HMAC-SHA256)
- Invoice generation (PDF via wkhtmltopdf)
- Refund handling
- Reconciliation logic

**Changes from Maitro:**
1. Multi-currency support (INR + USD)
2. GST calculation (India-specific)
3. Usage-based billing (JD-Forge per-order)
4. Dunning policy (retry failed payments)
5. Customer self-service portal (my.qorium.io)

## 4. PostgreSQL Schema

```sql
billing.customers (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES app.tenants(id),
  name VARCHAR(255),
  email VARCHAR(255),
  country VARCHAR(2),  -- 'IN' or 'US'
  currency VARCHAR(3),  -- 'INR' or 'USD'
  tax_id VARCHAR(50),  -- GSTIN or US Tax ID
  billing_address JSONB,
  payment_method_id VARCHAR(255),  -- Razorpay or Stripe customer ID
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  UNIQUE (tenant_id)
);

billing.subscriptions (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES billing.customers(id),
  sku VARCHAR(32),  -- 'readybank', 'jd_forge', 'stack_vault'
  tier VARCHAR(32),  -- 'tier_1', 'tier_2', etc.
  status VARCHAR(32),  -- active, paused, canceled
  current_period_start DATE,
  current_period_end DATE,
  next_billing_date DATE,
  auto_renew BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

billing.line_items (
  id UUID PRIMARY KEY,
  subscription_id UUID REFERENCES billing.subscriptions(id),
  type VARCHAR(32),  -- 'recurring', 'usage', 'overage'
  description VARCHAR(255),  -- e.g., 'ReadyBank Tier 2 (12 months)'
  amount_cents INT,  -- in lowest currency unit (paise for INR, cents for USD)
  currency VARCHAR(3),
  quantity INT,
  unit_price_cents INT,
  tax_rate NUMERIC(5,2),  -- e.g., 18.00 for GST 18%
  tax_amount_cents INT,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP
);

billing.invoices (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES billing.customers(id),
  invoice_number VARCHAR(32),  -- e.g., INV-2026-00001
  amount_cents INT,
  tax_cents INT,
  total_cents INT,
  currency VARCHAR(3),
  status VARCHAR(32),  -- draft, sent, viewed, paid, failed, refunded
  issued_at TIMESTAMP,
  due_date DATE,
  paid_at TIMESTAMP,
  payment_id UUID REFERENCES billing.payments(id),
  pdf_url TEXT,
  notes TEXT,
  created_at TIMESTAMP
);

billing.payments (
  id UUID PRIMARY KEY,
  invoice_id UUID NOT NULL REFERENCES billing.invoices(id),
  payment_provider VARCHAR(32),  -- 'razorpay' or 'stripe'
  provider_payment_id VARCHAR(255),  -- Razorpay payment_id or Stripe payment_intent
  provider_order_id VARCHAR(255),  -- Razorpay order_id
  amount_cents INT,
  currency VARCHAR(3),
  status VARCHAR(32),  -- pending, authorized, captured, failed, refunded
  error_message TEXT,
  attempt_count INT,
  next_retry_at TIMESTAMP,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

billing.refunds (
  id UUID PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES billing.payments(id),
  amount_cents INT,
  currency VARCHAR(3),
  reason VARCHAR(255),
  status VARCHAR(32),  -- pending, completed, failed
  provider_refund_id VARCHAR(255),
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

billing.ledger (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES billing.customers(id),
  account VARCHAR(64),  -- 'accounts_receivable', 'revenue', 'tax_payable'
  debit_cents INT,
  credit_cents INT,
  reference_id UUID,  -- invoice_id or payment_id
  description TEXT,
  posted_at TIMESTAMP,
  created_at TIMESTAMP
);

billing.usage_events (
  id UUID PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES billing.customers(id),
  metric_name VARCHAR(64),  -- 'jd_forge_orders', 'stack_vault_questions'
  quantity INT,
  event_date DATE,
  created_at TIMESTAMP,
  UNIQUE (customer_id, metric_name, event_date)  -- aggregate per day
);
```

## 5. GST Handling (India)

**GST Calculation:**
- ReadyBank/Stack-Vault: 18% GST on service charges
- JD-Forge: 18% GST per JD
- GST exemption: If customer GSTIN on file, add GST; otherwise, B2C (no GST needed outside India)

**GSTIN Validation:**
- Accept format: 2-digit state + 10-digit GSTIN code
- Query Public GSTIN API (optional, Month 9) to verify active status
- Store in `billing.customers.tax_id`

**Invoice Breakdown:**
```
ReadyBank Tier 2 (₹100,000)
Tax (SGST 9%):      ₹4,500
Tax (CGST 9%):      ₹4,500
───────────────────────
Total:              ₹109,000
GSTIN: 29XXXX####
```

**Tax Remittance:**
- Talpro liable for GST remittance
- Generated in monthly reconciliation report
- Exported to accounting system (Zoho Books integration, Month 9)

## 6. Webhook Handling: Razorpay/Stripe

### Razorpay Webhooks

**Endpoint:** POST `/webhooks/payments/razorpay`

**Events:**
- `payment.authorized` — Authorization successful
- `payment.failed` — Payment declined
- `invoice.paid` — Invoice marked paid
- `invoice.expired` — Invoice validity expired
- `refund.created` — Refund initiated
- `refund.failed` — Refund declined

**Webhook Verification:**
```python
import hmac
signature = request.headers.get('X-Razorpay-Signature')
body_data = request.body  # exact bytes received
expected = hmac.new(
  RAZORPAY_WEBHOOK_SECRET.encode(),
  body_data,
  hashlib.sha256
).hexdigest()
assert signature == expected  # constant-time comparison
```

### Stripe Webhooks

**Endpoint:** POST `/webhooks/payments/stripe`

**Events:**
- `payment_intent.succeeded` — Payment captured
- `payment_intent.payment_failed` — Payment declined
- `invoice.payment_succeeded` — Invoice paid
- `invoice.payment_failed` — Invoice payment failed
- `charge.refunded` — Refund completed
- `customer.subscription.updated` — Subscription changed

**Webhook Verification:**
```python
signature = request.headers.get('Stripe-Signature')
stripe.Webhook.construct_event(
  request.body,
  signature,
  STRIPE_WEBHOOK_SECRET
)
```

### Webhook Processing

All webhooks queued to Redis for async processing:
1. Validate signature
2. Enrich with customer context
3. Queue to `BILLING_EVENTS_QUEUE`
4. Worker processes: update `billing.payments`, create/update `billing.invoices`
5. Trigger cascading events (e.g., if paid → activate subscription)
6. Log to `audit.events`

**Idempotency:** Each webhook identified by `provider_payment_id`. Process only once, deduplicate by ID.

## 7. Dunning Policy (Retry Failed Payments)

When payment fails:
1. **Retry 1:** +2 days → automatic retry via Razorpay/Stripe
2. **Retry 2:** +5 days → email customer ("payment failed, update your card")
3. **Retry 3:** +10 days → second email + SMS (if phone on file)
4. **Retry 4:** +15 days → mark subscription as "paused", email "service suspended"
5. **Give Up:** +30 days → cancel subscription, email "subscription canceled"

Customer can manually retry anytime via `/v1/billing/invoices/{id}/retry` endpoint.

**Suspend/Cancel Logic:**
- Suspended: Customer loses access to QOrium console (403 Forbidden)
- Canceled: Subscription ends, cannot restore (must create new)
- Grace Period: Audits still available (read-only) for 30 days post-cancel

## 8. Customer Billing Portal

**Location:** https://my.qorium.io/billing (JWT required)

**Pages:**
1. **Dashboard:** Current plan, next billing date, YTD spend
2. **Invoices:** List with filters (date, status, amount), download PDF
3. **Payment Methods:** Add/remove card, set default
4. **Usage:** Current-month usage (JD-Forge orders, Stack-Vault questions), forecast next month's charge
5. **Billing Settings:** Update address, GSTIN, billing email
6. **Subscriptions:** Upgrade/downgrade, auto-renew toggle, cancel option

**API Endpoints:**
```
GET  /v1/billing/customer → Current plan + invoice preview
GET  /v1/billing/invoices → List invoices (paginated)
GET  /v1/billing/invoices/{id} → Single invoice details + download PDF
POST /v1/billing/invoices/{id}/retry → Manually retry payment
GET  /v1/billing/usage → Current-month usage + forecast
POST /v1/billing/payment-methods → Add payment method (Razorpay/Stripe hosted form)
POST /v1/billing/subscriptions/{id}/upgrade → Upgrade to higher tier
POST /v1/billing/subscriptions/{id}/cancel → Cancel subscription (with survey)
```

## 9. Admin Dashboard (Talpro Internal)

**Location:** https://admin.qorium.io/billing (admin JWT required)

**Pages:**
1. **Revenue Dashboard:** MRR, ARR, churn rate, ARPU by SKU/country
2. **Customer List:** All customers with status, plan, YTD revenue, dunning stage
3. **Invoices:** All invoices, status distribution, overdue count
4. **Payments:** Payment success rate, failure reasons, refund rate
5. **Reconciliation:** GST remittance due, payment processor payouts
6. **Reporting:** Export invoices/customers to CSV

**Metrics to Track:**
- New subscriptions (daily, weekly, monthly)
- Subscription churn (by SKU, by country)
- Customer LTV (lifetime value)
- Payment success rate (target > 95%)
- DSO (Days Sales Outstanding, target < 15)
- Refund rate (target < 1%)

## 10. Pricing Changes & Grandfathering

When ReadyBank/Stack-Vault tier pricing changes:

**Announcement Phase:** 60 days notice in customer portal

**Grandfather Option:**
- Existing subscriptions continue at old price through current period
- At renewal, upgrade to new price or downgrade to lower tier
- No mid-contract forced upgrades

**Implementation:**
```sql
ALTER TABLE billing.subscriptions ADD COLUMN
  grandfather_price_cents INT,  -- If non-NULL, use this instead of tier price
  grandfather_expires_at TIMESTAMP;

-- Query: SELECT COALESCE(grandfather_price, tier_price) FROM subscriptions
```

**Edge Case:** Customer downgrades at renewal (e.g., Tier 4 → Tier 2)
- Allowed freely
- No refunds for overpayment (eat the delta for goodwill)

## 11. Compliance

**Invoice Requirements (GSTIN, GDPR, SOC 2):**
- Invoice number: sequential (INV-2026-00001, INV-2026-00002, ...)
- GSTIN prominently displayed (India)
- Itemization: line items, taxes, total
- Payment due date (14 days default)
- Company name, address, tax ID in footer

**Data Protection:**
- Stripe/Razorpay PCI-DSS compliant (no card data stored in Postgres)
- Invoices (PDF) encrypted with customer email as password (optional, Month 7)
- Payment URLs expire after 14 days

**Audit Trail:**
- All billing changes logged to `audit.events` (invoice created, payment received, subscription changed)
- User who triggered change recorded (admin or system)

## 12. Phase Split (Phase 1 vs Phase 3)

### Phase 1 (Month 6–7): MVP
- ReadyBank annual subscriptions (Razorpay only, India)
- Manual invoice creation → send to customer
- Dunning v0 (email retry, no auto-retry)
- Customer portal: invoices only
- No GST automation

### Phase 3 (Month 12–15): Full Billing
- All three SKUs (ReadyBank, JD-Forge, Stack-Vault)
- Stripe support (international USD)
- JD-Forge usage-based billing with metered events
- Stack-Vault overage charges
- Dunning v2 (auto-retry via provider)
- Full customer portal (usage, payment methods, upgrades)
- GST automation + GSTIN validation
- Admin dashboard (revenue metrics, reconciliation)
- Subscription management (upgrade/downgrade)

**Backward Compatibility:** Phase 1 invoices queryable via Phase 3 APIs; no data migration needed.

## 13. Cost Envelope

**Development:**
- Billing service implementation: 160 engineer-hours (~₹4.8L)
- Customer portal UI: 80 hours (~₹2.4L)
- Admin dashboard: 60 hours (~₹1.8L)
- Razorpay integration: 40 hours (~₹1.2L) [lifted from Maitro]
- Stripe integration: 60 hours (~₹1.8L)
- Testing + QA: 80 hours (~₹2.4L)
- **Total Dev Cost:** ~₹14.4L

**Infrastructure:**
- Billing service: 2 PM2 workers = ~₹400/month
- Postgres storage: +500MB/month @ ₹8/GB = ~₹4/month (negligible)
- Redis: included (queue only, low volume)
- **Annual Infra Cost:** ~₹5K

**Third-Party:**
- Razorpay: 1.5% per transaction (deducted from revenue, not a cost to Talpro)
- Stripe: 2.9% + $0.30 per transaction (idem)
- PDF generation (wkhtmltopdf): free, self-hosted

## 14. Migration (Month 6→7)

**Data Import:**
- Export existing Talpro customer contracts → import to `billing.customers` + `billing.subscriptions`
- Manual invoice export from legacy system → store links in `billing.invoices.pdf_url`

**Testing:**
- 2 weeks: Razorpay sandbox testing
- 1 week: Customer portal UAT
- 3 days: Production cutover with parallel run

**Rollback Plan:**
- If billing fails in Month 6, revert to manual invoicing (no auto-renewal)
- Keep both systems running for 30 days (gradual cutover)

## Open Questions

1. Should we support multi-currency billing for a single customer (e.g., customer pays some invoices in INR, some in USD)?
2. Do we need account credits / prepaid balance accounts, or always invoice-to-payment flow?
3. Should Stack-Vault overage charges be auto-billed immediately or rolled into next monthly invoice?
4. Should discounts be supported (e.g., 10% off for annual prepay, volume discounts)?
5. Should we integrate with Zoho Books or other accounting software, or keep it separate?
6. What's the policy for customers who dispute an invoice (chargeback handling)?
7. Should customers be able to change billing email without updating tenant email?
8. Should we support custom invoicing (e.g., customer's own invoice number, custom line items)?
