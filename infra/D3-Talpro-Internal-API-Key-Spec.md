# D3 — Talpro Internal API Key Specification

**For:** QOrium CTO Office + Infrastructure  
**Effective:** Month 1 (May 2026), upon B7 activation  
**Authority:** Constitution SO-1 (Talpro Customer Zero), A7 DPA v0.1  
**Owner:** CTO Office — Infrastructure Lead  

---

## §1 Purpose

Issue a dedicated **internal-namespace API key** to Talpro India for QOrium Customer Zero access. This key enables Talpro's internal recruiting team to query the ReadyBank question library, execute bulk exports, and record candidate responses without exposing Talpro's hiring data to external networks. The key is exclusively for Talpro's internal-namespace hiring (not resellable, not delegable).

---

## §2 Key Format & Storage

### 2.1 Key Structure

```
qor_internal_[TENANT_PREFIX]_[32_HEX_CHARS]

Examples:
  qor_internal_talind001_a7f3b2c1e8d4f9a6b2c5e1d8a9f3b2c1
  qor_internal_talind001_9e2d7c4b1f8a3e5d6c9a2b1e4f7c8d3a
```

- **Prefix:** `qor_internal_` (immutable, identifies QOrium internal-namespace keys)
- **Tenant identifier:** `talpro-india-customer-zero` (8-char min, kebab-case)
- **Cryptographic suffix:** 32 hexadecimal characters (128 bits entropy)

### 2.2 Storage & Hashing

- **At Rest:** Hashed using **Argon2id** (OWASP-compliant, memory-hard; PHC string format)
  - Memory cost: 64 MB
  - Iterations: 3
  - Parallelism: 4
- **In Transit:** TLS 1.3+, all connections
- **In Memory:** Plaintext only during issuance and initial validation; immediately after issuance, store only hashed form
- **Audit Log:** Every successful/failed validation logged with key_prefix (first 20 chars), IP, user agent, endpoint, latency_ms, status

### 2.3 Rotation & Expiry

- **Rotation Window:** 180 days (per B6 calendar in Implementation Strategy)
- **Pre-rotation Notice:** CTO Office sends 14-day notice to Talpro Delivery Head before expiry
- **Revocation:** Instant, on-demand, by joint written request (CEO + CTO)
- **Revocation Protocol:** Delivery Head calls CTO directly; CTO issues manual revocation; changes take effect within 30 minutes (Redis cache invalidation + new deployment)
- **Re-issuance:** Only after both CEO + CTO verbal approval (recorded in audit log)

---

## §3 Scopes & Permissions

Talpro Customer Zero key is granted the following **read-only + write-bounded** scopes:

| Scope | Description | Quota | Notes |
|---|---|---|---|
| `questions:read` | List, search, fetch individual questions by ID or role-graph path | 5,000 req/day | For pre-screening question banks |
| `search:read` | Full-text + filter search (role, difficulty, domain, leak-status) | Included in above | Search queries count against questions:read quota |
| `export:bulk:csv` | Bulk export questions + metadata to CSV (max 1,000 rows/export) | 100 exports/day | Each export = 1 quota unit; max 10K questions/day |
| `export:bulk:json` | Same as above, JSON format | 100 exports/day | Preferred for n8n/Zapier integrations |
| `responses:write` | Log candidate responses (answers, time-on-task, score) back to QOrium | 100,000 writes/day | For IRT calibration + feedback loop |

**Explicitly NOT granted:**

- `admin:*` — no access to keys, users, billing, or infrastructure
- `questions:write` — cannot create/edit/delete questions
- `export:stack-vault` — Stack-Vault (exclusive questions) is strictly forbidden per SO-10
- `audit:read` — cannot inspect own audit logs (CTO Office controls audit)
- `config:write` — cannot modify account settings

---

## §4 Rate Limits & Quotas

### 4.1 Per-Key Rate Limits

- **Per-second burst:** 60 requests / second (sliding window)
- **Sustained throughput:** 1,000 requests / minute (token bucket)
- **Violation response:** HTTP 429 (Too Many Requests); client backs off exponentially

### 4.2 Daily Hard Quotas

| Resource | Quota | Window | Enforcement |
|---|---|---|---|
| Questions read | 5,000 | Midnight–midnight IST | Hard stop; return 403 |
| Bulk exports | 100 | Midnight–midnight IST | Hard stop |
| Response writes | 100,000 | Midnight–midnight IST | Hard stop; queue overflows |

### 4.3 Quota Monitoring & Alerts

- CTO Office monitors quota usage via Grafana dashboard
- **Quota remaining < 20%:** Slack alert to Delivery Head + CTO
- **Quota exceeded:** Immediate notification to Delivery Head + CTO (should not happen; hard stop prevents it)

---

## §5 Audit Logging

Every API call involving this key is logged to the `audit.events` table with:

| Field | Type | Example |
|---|---|---|
| `timestamp` | ISO 8601 | 2026-05-15T10:32:45.123Z |
| `key_prefix` | string (first 20 chars) | qor_internal_talind |
| `ip_address` | IPv4/IPv6 | 203.0.113.42 |
| `user_agent` | string | Mozilla/5.0... / curl/8.0 / n8n-http-node |
| `endpoint` | string | GET /api/questions/search |
| `method` | HTTP verb | GET / POST / DELETE |
| `request_id` | UUID | 550e8400-e29b-41d4-a716-446655440000 |
| `latency_ms` | integer | 125 |
| `status_code` | integer | 200 / 401 / 429 |
| `response_size_bytes` | integer | 3492 |
| `error_msg` | string (if applicable) | "quota exceeded" |

**Retention:** 90 days hot; 7 years cold archive (S3).  
**Access:** CTO Office only (via dedicated audit dashboard); no customer access.

---

## §6 Activation Prerequisites

This key cannot be issued until **all three** prerequisites are satisfied:

1. **B7 — PostgreSQL provisioned + schema ready**
   - Evidence: `psql -d qorium_prod -c "\dt"` returns tables: questions, responses, audit_events, keys
   - Verified by: CTO Office deployment checklist

2. **D1 — Talpro Delivery Head briefed + verbal commitment**
   - Evidence: CC-03 action card completed + "verbal commitment confirmed"
   - Verified by: CEO report-back to CTO Office

3. **Talpro Internal IT clearance for outbound API calls**
   - Evidence: Written email from Talpro Security/IT approving QOrium API endpoint access
   - Verified by: Email in governance/customer-zero/ folder
   - Scope: IP allowlist (QOrium API gateway IP) + TLS certificate pinning (optional)

**Activation step:** CTO Office issues key only after all three are confirmed in writing.

---

## §7 Distribution Protocol

### 7.1 Secure Delivery

**NEVER via email or Slack.** Use one of:

1. **1Password Vault (Shared)** — Preferred for corporate accounts
   - 1Password creates a secure share link (48-hour TTL by default)
   - Delivery Head logs in with personal account; accesses key; copies to own vault
   - Link expires after 1 access or 48 hours (whichever comes first)

2. **Bitwarden Send** — Alternative
   - Bitwarden generates send.bitwarden.com link with 24-hour TTL
   - Text/email the link to Delivery Head (no key in message)
   - Self-destructs after first view or TTL expiry

### 7.2 Handoff Verification

After key is retrieved:

- **CEO calls Delivery Head verbally:** "Did you receive the key?"
- **Delivery Head confirms:** "Yes, key is in my vault."
- **CTO Office documents:** Call date + time + "verbal confirmation received" in governance log
- **Only then:** CTO activates the key for API access

---

## §8 Customer-Side Integration Template

Talpro Delivery Head receives this 1-page integration guide alongside the API key.

### 8.1 Curl Example

```bash
#!/bin/bash

API_KEY="REDACTED_EXAMPLE_API_KEY"
BASE_URL="https://api.qorium.online"

# List all questions for "Senior Java" role
curl -X GET \
  "${BASE_URL}/api/v1/questions/search" \
  -H "Authorization: Bearer ${API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "senior-java",
    "difficulty_min": 3,
    "difficulty_max": 5,
    "limit": 50
  }' \
  -w "\nStatus: %{http_code}\nTime: %{time_total}s\n"
```

### 8.2 Node.js Example

```javascript
const axios = require('axios');

const apiKey = process.env.QORIUM_API_KEY;
const client = axios.create({
  baseURL: 'https://api.qorium.online',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  timeout: 5000,
});

// Fetch questions for a role
async function fetchQuestions(role, limit = 50) {
  try {
    const response = await client.get('/api/v1/questions/search', {
      params: { role, limit },
    });
    return response.data;
  } catch (error) {
    if (error.response?.status === 429) {
      console.log('Rate limit exceeded. Backing off...');
    } else if (error.response?.status === 403) {
      console.log('Quota exceeded for today.');
    }
    throw error;
  }
}

module.exports = { client, fetchQuestions };
```

### 8.3 N8N HTTP Node Configuration

```json
{
  "nodeType": "n8n-nodes-base.httpRequest",
  "name": "QOrium – Fetch Questions",
  "url": "https://api.qorium.online/api/v1/questions/search",
  "method": "GET",
  "authentication": "bearerToken",
  "authentication.bearerToken": "{{ env('QORIUM_API_KEY') }}",
  "responseFormat": "json",
  "options": {
    "headers": {
      "Content-Type": "application/json",
      "User-Agent": "n8n-qorium-integration/1.0"
    },
    "timeout": 10000
  },
  "qs": {
    "role": "senior-java",
    "limit": 100,
    "include_metadata": true
  }
}
```

---

## §9 Compliance & Data Protection

**DPA Coverage:** A7 DPA v0.1, Section 1.2–1.3 (Customer = Talpro India; QOrium = Data Processor).

- **Data residency:** Responses stored in India (Hostinger Bengaluru)
- **Encryption:** In transit (TLS 1.3+); at rest (AES-256-GCM)
- **Fiduciary relationship:** Talpro India = Data Fiduciary for its candidates; QOrium = Data Processor
- **Right to erasure:** Talpro may request permanent deletion of candidate response data (30-day SLA); QOrium retains anonymized metadata for IRT calibration only
- **Audit access:** Talpro may audit QOrium's security controls annually (SOC 2 Type II target by Month 18)

---

## §10 Failure Modes & Remediation

| Failure Mode | Symptom | Root Cause | Remediation | Owner | SLA |
|---|---|---|---|---|---|
| **Key Compromised** | Unusual request pattern; malicious queries detected | Insider threat / phishing | 1. Revoke key immediately 2. Forensic audit 3. Re-issue new key to Delivery Head | CTO + CEO | 2 hours |
| **Quota Exceeded** | HTTP 403 "Quota exceeded" | Heavy batch export spike | 1. Alert Delivery Head 2. Offer temporary bump (one-time) 3. Plan demand management | CTO | 1 hour |
| **Rate Limit Breached** | HTTP 429 "Too Many Requests" | Rapid-fire polling; integration loop bug | 1. Check client logs 2. Advise exponential backoff 3. Re-test with Delivery Head | CTO + Delivery Head | 30 min |
| **Key Expired Pre-Rotation** | HTTP 401 "Key expired" | Rotation notice missed by Delivery Head | 1. Emergency re-issue 2. Extend old key TTL 24 hours 3. Email + phone reminder for future | CTO | Immediate |

---

## §11 Decommission Protocol

**If Customer Zero terminates or transitions to paid plan:**

1. **Notification:** CEO + CTO issue joint notice to Delivery Head (15 days prior to effective date)
2. **Revocation:** CTO Office revokes key 24 hours before effective date
3. **Data handling:**
   - If transitioning to paid: Talpro data migrated to new account (zero copy cost)
   - If terminating: Response data deleted per A7 DPA Section 11.2 (within 30 days)
4. **Audit certificate:** CTO Office issues deletion certificate within 60 days of termination
5. **Access cleanup:** All IP allowlists, 1Password shares, and backup keys purged

---

## §12 Drafting Notes (For CTO Office)

1. **Rate limit algorithm:** Implement token bucket (refill rate = 1,000 tokens/min; burst capacity = 60 tokens). Sliding window for per-second limits.

2. **Quota reset schedule:** Midnight IST (00:00) every calendar day. Use Redis expiry keys to auto-reset daily quotas.

3. **Key rotation cron:** Week of Day 180, CTO Office receives automated Slack reminder to initiate rotation workflow.

4. **Audit log archival:** After 90 days, move `audit.events` rows to Cloudflare R2 (immutable, lifecycle policy auto-delete after 7 years).

5. **Monitoring dashboard:** Grafana panels show:
   - Quota usage % (requests vs. limit)
   - RPS (requests per second)
   - Error rate (4xx, 5xx)
   - Latency p50/p95/p99
   - Active keys (count)

6. **Incident response:** On 5xx error or HTTP 429, alert CTO on-call within 30 min; escalate to CEO if SLA breach imminent.

---

*End of D3 — Talpro Internal API Key Specification.*
