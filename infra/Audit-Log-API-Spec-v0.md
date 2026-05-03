# Audit Log API Specification v0

**Status:** Draft for CTO Review | **Phase:** Design Phase | **SO Reference:** SO-6 (Compliance), SO-7 (API Layer)

## 1. Purpose

Provide read-only REST API for customers to retrieve audit logs of all actions taken on their QOrium account: questions accessed, assessments submitted, exports performed, users authenticated, and security events (leak detections, configuration changes). Enables compliance reporting (DPDPA, GDPR), forensics, and internal audits.

## 2. Source: Existing `audit.events` Table

Leverage existing PostgreSQL `audit.events` table (from 0001_initial_schema.sql):
```sql
audit.events (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,
  actor_id UUID,  -- user who triggered action
  action VARCHAR(128),  -- e.g., 'question.view', 'assessment.submit'
  resource_type VARCHAR(64),  -- e.g., 'question', 'assessment', 'user'
  resource_id UUID,
  old_values JSONB,  -- for updates
  new_values JSONB,  -- for updates
  http_method VARCHAR(16),
  http_status INT,
  ip_address INET,
  user_agent TEXT,
  error_message TEXT,
  created_at TIMESTAMP,
  PARTITION BY RANGE (created_at)  -- monthly
);
```

## 3. Customer-Facing GET Endpoints

| Endpoint | Purpose | Query Params | Auth |
|----------|---------|--------------|------|
| `GET /v1/audit/events` | List events with pagination | `limit`, `offset`, `start_date`, `end_date`, `action`, `actor_id`, `resource_type` | JWT + scope `audit:read` |
| `GET /v1/audit/events/{id}` | Single event details | — | JWT + scope `audit:read` |
| `GET /v1/audit/events/export` | Bulk export (async) | `format`, `start_date`, `end_date` | JWT + scope `audit:export` |
| `GET /v1/audit/exports/{job_id}` | Poll async export status | — | JWT + scope `audit:read` |
| `GET /v1/audit/summary` | Quick stats (event counts, top actions) | `start_date`, `end_date` | JWT + scope `audit:read` |

## 4. Event Taxonomy (30+ Types)

**Authentication Events:**
- `auth.login_success` — User logged in
- `auth.login_failure` — Login failed (wrong password, account locked)
- `auth.logout` — User logged out
- `auth.sso_login` — Logged in via SSO/SAML
- `auth.mfa_enabled` — MFA turned on
- `auth.session_revoked` — Admin revoked user session

**User Management:**
- `user.created` — New user added to tenant
- `user.updated` — User details changed
- `user.deleted` — User removed
- `user.role_changed` — User's role updated

**Question Access:**
- `question.viewed` — User accessed question (ReadyBank)
- `question.exported` — Question included in export
- `question.filter_applied` — User filtered questions (no question access)

**JD-Forge Events:**
- `jd_forge.order.created` — New order placed
- `jd_forge.order.questions_exported` — Questions delivered
- `jd_forge.order.feedback_submitted` — Customer feedback received
- `jd_forge.candidate.invited` — Candidate assessment link sent
- `jd_forge.candidate.response_submitted` — Assessment completed

**Stack-Vault Events:**
- `stack_vault.question.uploaded` — Question submitted for review
- `stack_vault.question.reviewed_started` — SME assigned
- `stack_vault.question.reviewed_completed` — SME finished review
- `stack_vault.question.approved` — Question approved for use
- `stack_vault.question.rejected` — Question failed review
- `stack_vault.question.released` — Question available in library

**Security & Compliance Events:**
- `security.leak_detected` — Watermark detected in external source
- `security.leak_confirmed` — Leak verified as genuine
- `security.api_key_created` — New API key generated
- `security.api_key_rotated` — API key rotated
- `security.api_key_revoked` — API key deleted
- `security.sso_configured` — SSO setup or updated
- `security.ip_whitelist_updated` — IP access control changed
- `compliance.export_requested` — Customer requested data export (GDPR/DPDPA)
- `compliance.data_deletion_requested` — Customer requested data deletion

## 5. Standard Event Envelope

```json
{
  "id": "evt_1a2b3c4d5e6f7g8h9i0j",
  "tenant_id": "ten_acme001",
  "timestamp": "2026-05-02T14:30:45.123Z",
  "action": "question.viewed",
  "resource_type": "question",
  "resource_id": "q_xyz789",
  "actor_id": "usr_alice123",
  "actor_email": "alice@acme.com",
  "actor_role": "reviewer",
  "old_values": null,
  "new_values": null,
  "http_method": "GET",
  "http_status": 200,
  "ip_address": "203.0.113.42",
  "user_agent": "Mozilla/5.0...",
  "error_message": null,
  "details": {
    "question_title": "Advanced SQL Optimization",
    "sku": "readybank",
    "difficulty": "hard"
  }
}
```

## 6. Retention & Deletion

**Retention Policy:**
- Default: 7 years (DPDPA requirement for employment records)
- Configurable per tenant: 1–10 years
- Automatic monthly partitioning by created_at

**Deletion:**
- Customer can request deletion of events older than 3 years via `/v1/compliance/deletion-request`
- Deletion queued asynchronously, takes 24 hours
- Deletion logged as `compliance.data_deletion_requested` event (immutable, cannot be deleted)

**Immutable Archive:**
- Deletion events retained in separate `audit.deletions` table (never purged)
- Enables auditors to confirm retention policy compliance

## 7. Export (Bulk)

**Request:**
```bash
POST /v1/audit/events/export
{
  "format": "csv",  # or "json"
  "start_date": "2026-01-01",
  "end_date": "2026-05-02",
  "actions": ["question.viewed", "jd_forge.order.created"],  # optional filter
  "resource_type": "question"  # optional
}
```

**Response:**
```json
{
  "job_id": "exp_abc123def456",
  "status": "queued",
  "created_at": "2026-05-02T14:30:45Z",
  "estimated_rows": 15000,
  "download_url": null
}
```

**Polling:**
```bash
GET /v1/audit/exports/exp_abc123def456
→ { "status": "completed", "download_url": "https://..." }
```

**CSV Format:**
```
id,timestamp,action,resource_type,resource_id,actor_email,actor_role,http_status,ip_address,details
evt_...,2026-05-02T14:30:45Z,question.viewed,question,q_xyz789,alice@acme.com,reviewer,200,203.0.113.42,"{""title"": ""SQL Optimization""}"
```

**Limits:**
- Max 1 year date range per export
- Max 100K rows per export (use pagination for larger)
- Exports expire after 7 days
- Max 5 concurrent exports per tenant

## 8. Streaming / SIEM Integration

**Webhook Events:** Audit events can trigger webhooks (same as webhooks-service)
```bash
POST /v1/webhooks/subscriptions
{
  "event_type": "audit.event",
  "endpoint_url": "https://siem.acme.com/api/events",
  "filters": {
    "actions": ["security.leak_detected", "security.api_key_created"]
  }
}
```

**Syslog Export (Month 9 roadmap):**
- Stream events to customer syslog endpoint (RFC 3164 / RFC 5424)
- TLS 1.3+ encryption
- Batching: max 1K events per second

## 9. Performance & Indexing

**Indexes:**
```sql
CREATE INDEX idx_audit_tenant_created ON audit.events(tenant_id, created_at DESC);
CREATE INDEX idx_audit_tenant_action ON audit.events(tenant_id, action);
CREATE INDEX idx_audit_tenant_actor ON audit.events(tenant_id, actor_id);
CREATE INDEX idx_audit_tenant_resource ON audit.events(tenant_id, resource_type, resource_id);
CREATE INDEX idx_audit_created ON audit.events(created_at DESC) WHERE tenant_id IS NOT NULL;
```

**Query Performance Target:**
- `GET /v1/audit/events` with 30-day range: <500ms (p95)
- `GET /v1/audit/events/export` (100K rows): <5 seconds to queue, async delivery

**Partitioning:**
- Monthly partitions by created_at
- Partition pruning enabled in query planner
- Old partitions (>10 years) can be detached and archived

**Caching:**
- Event count summaries cached in Redis (1-hour TTL)
- Actor name/email cached from `app.users` (5-minute TTL)

## 10. Security & Hash-Chaining

**Immutability Guarantee:**
Events cannot be modified after creation. Postgres constraint:
```sql
ALTER TABLE audit.events ADD CONSTRAINT ck_immutable
  CHECK (created_at IS NOT NULL);  -- Cannot insert NULL created_at
```

**Hash-Chaining (Optional, Month 9):**
Each event includes hash of previous event for tamper detection:
```sql
ALTER TABLE audit.events ADD COLUMN
  hash_current VARCHAR(64),  -- SHA-256 of this event
  hash_previous VARCHAR(64);  -- SHA-256 of previous event in timeline
```

**Verification Procedure:**
```python
def verify_event_chain(events):
  for i, event in enumerate(events):
    if i > 0:
      assert event.hash_previous == hash(events[i-1])
    assert event.hash_current == hash(event)
```

**Audit Trail for Compliance:**
- All audit.events reads logged to separate `audit.audit_reads` table
- Cannot be queried by customers (only by Talpro)
- Enables detection of unauthorized access attempts

## 11. Compliance Hooks

**GDPR/DPDPA Readiness:**
- `/v1/compliance/data-subject-access-request` — Return all events mentioning a user
- `/v1/compliance/data-deletion-request` — Queue deletion of user-related events (except immutable deletions log)
- `/v1/compliance/consent-audit` — Show which events required consent (Stack-Vault submissions)

**SOC 2 Type II:**
- All event access logged with who, when, why (actor_id, timestamp, scopes required)
- Audit logs retained for full 3-year SOC 2 audit period
- Quarterly report of access patterns exported for auditor

## 12. Migration (Month 6→7)

**Current State (Month 5):**
- Events written to `audit.events` for internal use only
- No customer-facing API

**Phase 1 (Month 6):** Enable read-only API
- Release GET endpoints for list, detail, summary
- No export yet (only pagination)

**Phase 2 (Month 7):** Export & Webhooks
- Release async export endpoint
- Hook audit events to webhooks service

**Phase 3 (Month 8):** Advanced Features
- Hash-chaining implementation
- SIEM streaming (syslog)
- Compliance request workflows

**No Data Loss:**
- Backfill existing events (written before API launch) with timestamps from log files
- Existing audit.events table structure unchanged

## Open Questions

1. Should customers see raw IP addresses in audit logs, or should we anonymize to CIDR blocks (/24)?
2. Do we hash-chain ALL events, or only security-critical ones (leak detections, key rotations)?
3. Should actor_id be returned as UUID or sanitized email address for privacy?
4. Max retention: 7 years is DPDPA minimum; should we allow customers to opt in to 10+ years?
5. Should exports require approval from second admin (segregation of duties)?
6. Should we support event signatures (digital signature of each event) in addition to hash-chaining?
7. What's the audit trail for audit trail access (i.e., who accessed audit logs)?
