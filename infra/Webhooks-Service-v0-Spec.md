# Webhooks Service Specification v0

**Status:** Draft for CTO Review | **Phase:** Design Phase | **SO Reference:** SO-7 (API Layer), SO-14 (Integration Points)

## 1. Purpose

Enable real-time event notifications to customer systems when QOrium events occur (question released, assessment completed, batch export finished, leak detected). Webhooks replace polling, reducing customer infrastructure load and enabling immediate downstream actions.

## 2. Architecture

### Service Topology
- **Service:** `webhooks-service` (PM2 cluster mode, 4 workers on Hostinger VPS)
- **Primary Queue:** Redis (`WEBHOOKS_QUEUE` key, sorted set by retry_at)
- **State Store:** PostgreSQL `webhooks.events` (append-only), `webhooks.subscriptions`, `webhooks.deliveries`
- **Signing:** HMAC-SHA256 using per-endpoint secret
- **Retry Engine:** Exponential backoff with 6 retries over ~35 hours

### Database Tables

```sql
webhooks.subscriptions (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  event_type VARCHAR(64),  -- NULL = all events
  endpoint_url TEXT NOT NULL,
  signing_secret TEXT NOT NULL,  -- stored hashed
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

webhooks.events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  event_type VARCHAR(64),  -- e.g., 'question.released'
  aggregate_id UUID,  -- resource ID (question ID, order ID, etc.)
  payload JSONB,  -- full event envelope
  created_at TIMESTAMP,
  PARTITION BY RANGE (created_at)  -- monthly
);

webhooks.deliveries (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  subscription_id UUID NOT NULL,
  status VARCHAR(32),  -- pending, delivered, failed
  http_status INT,
  attempt_count INT,
  next_retry_at TIMESTAMP,
  last_error TEXT,
  delivered_at TIMESTAMP,
  CONSTRAINT fk_event FOREIGN KEY (event_id) REFERENCES webhooks.events(id),
  CONSTRAINT fk_subscription FOREIGN KEY (subscription_id) REFERENCES webhooks.subscriptions(id)
);
```

## 3. Event Taxonomy

**ReadyBank Events:**
- `question.released` — Question added to ReadyBank library
- `question.updated` — Metadata/answer changed
- `question.deprecated` — Marked obsolete

**JD-Forge Events:**
- `jd_forge.order.created` — New order placed
- `jd_forge.order.questions_generated` — Questions ready for delivery
- `jd_forge.order.exported` — Final delivery package sent
- `jd_forge.order.feedback_received` — Customer feedback submitted

**Stack-Vault Events:**
- `stack_vault.question.submitted` — Question uploaded
- `stack_vault.question.review_started` — SME assigned
- `stack_vault.question.approved` — Passed review
- `stack_vault.question.released` — Available for use
- `stack_vault.question.rejected` — Did not pass review

**Security Events:**
- `leak.detected` — Watermark detected, forensics initiated
- `leak.confirmed` — Leak verified as genuine
- `audit.export_requested` — Customer exported audit log

## 4. Payload Format

```json
{
  "id": "evt_1a2b3c4d5e6f7g8h9i0j",
  "event_type": "question.released",
  "timestamp": "2026-05-02T14:30:00Z",
  "tenant_id": "ten_abc123",
  "aggregate_id": "q_xyz789",
  "data": {
    "question_id": "q_xyz789",
    "sku": "readybank",
    "title": "Advanced Database Indexing",
    "difficulty": "hard",
    "format": "coding"
  },
  "idempotency_key": "example-idempotency-key"
}
```

## 5. Request Signing (HMAC-SHA256)

Customer receives signed POST with header:
```
X-QOrium-Signature: sha256=<base64(HMAC-SHA256(body, secret))>
X-QOrium-Timestamp: 1714753800
X-QOrium-Delivery: del_abc123def456
```

Customer must:
1. Verify timestamp is within 5 minutes (prevent replay)
2. Reconstruct body + timestamp
3. Compute HMAC-SHA256 with stored secret
4. Compare to received signature (constant-time comparison)

Signature computation:
```
message = "{event_type}.{timestamp}.{body}"
signature = HMAC-SHA256(message, secret)
```

## 6. Retry Policy

Failed deliveries retry with exponential backoff:
- **Attempt 1:** immediate
- **Attempt 2:** 1 minute delay
- **Attempt 3:** 5 minutes delay
- **Attempt 4:** 30 minutes delay
- **Attempt 5:** 4 hours delay
- **Attempt 6:** 24 hours delay
- **Max age:** 35 hours total

Success codes: 200–299
Fail codes: 4xx (except 429), 5xx, timeout (10s), DNS failure

After final failure, move to dead letter (`webhooks.deliveries.status = 'failed'`). Customer can retry via API.

## 7. Idempotency

Every event includes `idempotency_key` matching event UUID. Customer must use this to deduplicate on their end (e.g., store in Redis with 30-day TTL). QOrium will redeliver the same event with the same key if timeout occurs.

## 8. Customer Endpoint Configuration

Admin UI (`/admin/webhooks`):
- Create subscription: POST `/webhooks/subscriptions`
- List subscriptions: GET `/webhooks/subscriptions`
- Update: PATCH `/webhooks/subscriptions/{id}`
- Delete: DELETE `/webhooks/subscriptions/{id}`
- Test delivery: POST `/webhooks/subscriptions/{id}/test`
- Delivery history: GET `/webhooks/subscriptions/{id}/deliveries?limit=50`
- Retry failed: POST `/webhooks/deliveries/{id}/retry`

Response codes:
- 201 Created (new subscription)
- 200 OK (update, list, test)
- 204 No Content (delete)
- 400 Bad Request (invalid URL, missing event type)
- 409 Conflict (duplicate subscription)

## 9. Security

1. **Signing Secret Rotation:** 180-day window; old secret valid during overlap
2. **Endpoint Verification:** HTTPS only; certificate validation required
3. **Rate Limiting:** Customer's endpoint receives at most 100 req/sec per subscription
4. **Timeout:** 10 seconds per attempt; no retry on timeout alone (circuit breaker)
5. **TLS:** 1.3+ enforced; no SSLv3/TLSv1.0/1.1
6. **Audit Trail:** All deliveries logged to `audit.events` (customer ID, endpoint, status, timestamp)

## 10. Customer Experience

- **Dashboard:** Delivery success rate, failed events count, last delivery timestamp
- **Alerts:** Email notification when 5+ consecutive failures occur
- **Replay:** Customer can replay failed events (max 30 days old)
- **Debugging:** Webhook simulator in admin panel for testing payloads

## 11. Operational

**Monitoring:**
- Redis queue depth (alert > 100K pending)
- P95 delivery latency (target < 5s)
- Failure rate per subscription (alert > 5%)

**Scaling:**
- Add PM2 worker if queue depth > 50K
- Distribute by tenant_id for load balancing

**Maintenance:**
- Monthly archive of `webhooks.events` (move to cold storage after 90 days)
- Prune `webhooks.deliveries` after 180 days

## 12. Cost Envelope

- **Compute:** 4 PM2 workers ~₹800/month (Hostinger)
- **Storage:** 10GB/month Postgres partition + 5GB/month Redis ~₹400/month
- **Egress:** ~$0.12/GB to customer endpoints; assume 100GB/month = $12
- **Total:** ~₹1,300/month

## 13. Migration (Month 6→7)

Phase 1: Dry-run delivery to 10% of customers (no-op, log only)
Phase 2: Full rollout with customer opt-in via admin UI
Phase 3: Deprecate polling endpoints (/readybank/questions?changes_since=X)

## Open Questions

1. Should signing secret be stored in 1Password or Postgres with encryption?
2. Do we need per-event-type throttling (e.g., max X leak.detected events/minute)?
3. Should failed deliveries trigger Slack alerts for Talpro support?
4. Max event payload size? (proposed: 1MB)
5. Should we support webhook filtering by question type or difficulty?
