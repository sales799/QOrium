# QOrium API Documentation v0

**Author:** CTO, Talpro Universe  
**Audience:** Platform partners, enterprise customers, SDK developers  
**Date:** May 1, 2026  
**Status:** v0 — Public API specification for ReadyBank & JD-Forge  
**Latest Stable Version:** https://api.qorium.online/v1

---

## Table of Contents

1. [Base URL & Endpoints](#base-url--endpoints)
2. [Authentication](#authentication)
3. [Rate Limiting](#rate-limiting)
4. [Error Handling](#error-handling)
5. [API Versioning](#api-versioning)
6. [ReadyBank Endpoints](#readybank-endpoints)
7. [JD-Forge Endpoints](#jd-forge-endpoints)
8. [Stack-Vault Endpoints](#stack-vault-endpoints)
9. [Anti-Leak Monitoring](#anti-leak-monitoring)
10. [Webhooks](#webhooks)
11. [Idempotency](#idempotency)
12. [Pagination & Sorting](#pagination--sorting)

---

## Base URL & Endpoints

All API requests must be made to:

```
https://api.qorium.online/v1
```

Regional endpoints (latency optimization):

- **India (primary):** `https://api.qorium.online/v1`
- **US (fallback):** `https://us-api.qorium.online/v1`
- **APAC (future M8):** `https://apac-api.qorium.online/v1`

All communication must be over HTTPS with TLS 1.3 or higher. Plain HTTP requests are rejected with HTTP 426 Upgrade Required.

---

## Authentication

QOrium supports three authentication methods:

### 1. API Keys (Machine-to-Machine)

For server-to-server integrations. API keys use HMAC-SHA256 signing.

**Key Format:**
```
qor_[SKU]_[TENANT]_[32_HEX_CHARS]

Example: REDACTED_EXAMPLE_API_KEY
```

**Hashing at Rest:** Argon2id (memory 64MB, iterations 3, parallelism 4, PHC format)

**Header-based Authentication:**

```bash
# Include your QOrium bearer token in the Authorization header.
curl -X GET https://api.qorium.online/v1/questions \
  -H "Content-Type: application/json"
```

**HMAC Request Signing (for audit trail):**

```
Signature: HMAC-SHA256(method + path + body + timestamp, secret_key)
Authorization: QOR-HMAC-SHA256 Credential=qor_readybank_bosch_..., SignedHeaders=host;x-qor-date, Signature=...
X-QOR-Date: 2026-05-02T10:30:00Z
```

API keys are scoped to specific resources and actions. See [Key Scopes](#key-scopes) below.

### 2. OAuth2 (Admin Console & Customer Portals)

For human users accessing the QOrium admin console or customer dashboard.

**Grant Type:** Authorization Code  
**Redirect URI:** Must be pre-registered; wildcard subdomains allowed for development  
**Token Lifetime:** 1 hour access token, 30-day refresh token

```bash
# Step 1: Redirect user to OAuth consent screen
GET https://api.qorium.online/oauth/authorize?
  client_id=YOUR_CLIENT_ID&
  redirect_uri=https://your-app.com/callback&
  response_type=code&
  scope=openid+profile+email+read:questions

# Step 2: Exchange code for access token
POST https://api.qorium.online/oauth/token \
  -d client_id=YOUR_CLIENT_ID \
  -d client_secret=YOUR_CLIENT_SECRET \
  -d code=AUTHORIZATION_CODE \
  -d redirect_uri=https://your-app.com/callback \
  -d grant_type=authorization_code

# Response:
{
  "access_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "eyJhbGc..."
}
```

### 3. JWT Sessions (Web Client)

For QOrium's own web application. JWTs issued by the OAuth token endpoint and validated server-side.

**Key Scopes**

All API keys are scoped. Requesting a resource outside your key's scope returns HTTP 403 Forbidden with error code `insufficient_scope`.

| Scope | Resource | Limit | Notes |
|---|---|---|---|
| `questions:read` | GET /questions, /questions/{id} | 5,000 req/day | Includes search & export |
| `questions:write` | POST /questions, PATCH /questions/{id} | 1,000 req/day | Stack-Vault only |
| `export:bulk:csv` | POST /export?format=csv | 100 exports/day | Max 100K rows per export |
| `export:bulk:json` | POST /export?format=json | 100 exports/day | Max 100K rows per export |
| `responses:write` | POST /responses, /responses/{id}/score | 100,000 req/day | Batch candidate answers |
| `webhooks:manage` | POST /webhooks, DELETE /webhooks/{id} | 100 req/day | Register/unregister hooks |
| `analytics:read` | GET /analytics | 1,000 req/day | Usage, performance metrics |
| `admin:full` | All endpoints | Unlimited | Internal/Talpro only |

---

## Rate Limiting

QOrium enforces **token bucket rate limiting** on all API keys.

**Burst Limit:** 60 requests/second  
**Sustained Limit:** 1,000 requests/minute  
**Daily Hard Quota:** Per scope (see table above)

**Rate Limit Headers:**

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1714649400
X-RateLimit-Reset-After: 87
```

When you exceed the sustained limit, subsequent requests are delayed using exponential backoff. After 3 consecutive delays, the key is temporarily rate-limited for 5 minutes, and all requests return HTTP 429 Too Many Requests:

```json
{
  "error": "rate_limit_exceeded",
  "message": "1,000 requests/min limit exceeded",
  "retry_after": 45
}
```

**Best Practice:** Listen to `Retry-After` and back off. Use jitter in retry logic to avoid thundering herd.

Daily quota limits are hard: once exhausted, requests fail with HTTP 429 and error code `daily_quota_exceeded` until midnight UTC.

---

## Error Handling

All errors return JSON with consistent schema:

```json
{
  "error": "error_code",
  "message": "Human-readable description",
  "request_id": "req_abc123xyz",
  "timestamp": "2026-05-02T10:30:45Z",
  "details": {}
}
```

**Common HTTP Status Codes:**

| Code | Meaning | Typical Error Codes |
|---|---|---|
| 400 | Bad Request | `invalid_request`, `missing_required_field`, `invalid_format` |
| 401 | Unauthorized | `unauthorized`, `invalid_api_key`, `expired_token` |
| 403 | Forbidden | `insufficient_scope`, `resource_not_accessible` |
| 404 | Not Found | `resource_not_found`, `question_not_found` |
| 409 | Conflict | `idempotency_key_mismatch`, `resource_already_exists` |
| 422 | Unprocessable Entity | `validation_error` |
| 429 | Too Many Requests | `rate_limit_exceeded`, `daily_quota_exceeded` |
| 500 | Internal Server Error | `internal_error` |
| 503 | Service Unavailable | `service_degraded`, `maintenance_window` |

**Example Error Response:**

```json
{
  "error": "validation_error",
  "message": "Invalid question format",
  "request_id": "req_1714649445_a1b2c3",
  "details": {
    "field": "format",
    "value": "invalid_type",
    "allowed": ["MCQ", "MSQ", "Coding-fn", "SQL", "SJT"]
  }
}
```

---

## API Versioning

QOrium uses URL-based versioning. Current stable version is **v1**.

Breaking changes (removed fields, renamed endpoints, response schema changes) trigger a new major version. Minor versions add optional fields or new endpoints.

**Version Deprecation Policy:**

- Current: v1 (stable)
- Deprecated: None yet
- End of Life: N/A

We will announce any breaking changes 6 months in advance and provide a migration guide.

**Version Header (Optional):**

```
X-API-Version: 1.2
```

If omitted, defaults to the latest stable version.

---

## ReadyBank Endpoints

ReadyBank is a shared, commodity question library. All questions are public and versioned.

### List Questions

**GET** `/readybank/questions`

Returns paginated list of released questions, optionally filtered.

**Query Parameters:**

| Param | Type | Default | Description |
|---|---|---|---|
| `role` | string | — | Filter by job role (e.g., "Senior Backend Engineer") |
| `skill` | string | — | Filter by skill tag (e.g., "Java Spring Boot") |
| `format` | string | — | Filter by question format (MCQ, Coding-fn, SQL, etc.) |
| `difficulty` | integer (1-5) | — | Filter by difficulty level |
| `language` | string | en | Language code (en, hi, ta, te) |
| `limit` | integer (1-100) | 20 | Rows per page |
| `offset` | integer | 0 | Pagination offset |
| `sort` | string | -created_at | Sort by field; prefix with `-` for descending |

**Response:**

```json
{
  "data": [
    {
      "id": "qst_readybank_001a2b3c",
      "role": "Senior Backend Engineer",
      "skill": "Java Spring Boot transaction handling",
      "format": "MCQ",
      "difficulty": 3,
      "title": "Transactional Propagation in Spring",
      "body_md": "Which @Transactional propagation...",
      "options": [
        { "label": "A", "text": "REQUIRED" },
        { "label": "B", "text": "REQUIRES_NEW" },
        { "label": "C", "text": "SUPPORTS" },
        { "label": "D", "text": "NOT_SUPPORTED" }
      ],
      "language": "en",
      "version": 2,
      "released_at": "2026-03-15T08:00:00Z",
      "empirical_pass_rate": 0.72,
      "irt_difficulty_b": 0.5,
      "irt_discrimination_a": 1.2,
      "tag_ids": ["java", "spring-boot", "transactions"]
    }
  ],
  "metadata": {
    "total": 847,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### Get Single Question

**GET** `/readybank/questions/{question_id}`

Returns full question with answer key and reference solution (if authenticated).

**Response:**

```json
{
  "id": "qst_readybank_001a2b3c",
  "role": "Senior Backend Engineer",
  "skill": "Java Spring Boot transaction handling",
  "format": "MCQ",
  "difficulty": 3,
  "title": "Transactional Propagation in Spring",
  "body_md": "Which @Transactional propagation...",
  "options": [
    { "label": "A", "text": "REQUIRED" },
    { "label": "B", "text": "REQUIRES_NEW" },
    { "label": "C", "text": "SUPPORTS" },
    { "label": "D", "text": "NOT_SUPPORTED" }
  ],
  "answer_key": "B",
  "explanation_md": "REQUIRES_NEW creates a new transaction...",
  "reference_solution": "When using REQUIRES_NEW propagation...",
  "test_cases": [
    { "input": "...", "output": "...", "explanation": "..." }
  ],
  "empirical_pass_rate": 0.72,
  "irt_difficulty_b": 0.5,
  "irt_discrimination_a": 1.2,
  "ai_critique_scores": {
    "ambiguity": 9,
    "distractor_quality": 8,
    "edge_cases": 8,
    "bias_check": 10,
    "leak_risk": 9
  },
  "version": 2,
  "released_at": "2026-03-15T08:00:00Z"
}
```

### Search Questions

**POST** `/readybank/questions/search`

Full-text search across question bodies, explanations, and tags. Powered by PostgreSQL's full-text search with trgm extension.

**Request Body:**

```json
{
  "query": "transaction isolation levels",
  "filters": {
    "role": "Senior Backend Engineer",
    "skill": "Database fundamentals",
    "format": ["MCQ", "Coding-fn"],
    "difficulty": [2, 3, 4],
    "language": "en"
  },
  "limit": 20,
  "offset": 0
}
```

**Response:** Same structure as List Questions.

### Export Questions

**POST** `/readybank/export`

Bulk export questions in CSV or JSON format.

**Request Body:**

```json
{
  "format": "csv",
  "filters": {
    "role": "Senior Backend Engineer",
    "skill": "Java Spring Boot",
    "difficulty": [3, 4, 5]
  },
  "fields": ["id", "role", "skill", "format", "difficulty", "title", "answer_key"],
  "limit": 10000
}
```

**Response:** Redirects to S3-presigned URL (valid 24 hours). File format:

- **CSV:** Header row + one question per row
- **JSON:** Array of question objects (same schema as Get Single Question)

---

## JD-Forge Endpoints

JD-Forge generates custom question sets aligned to a job description in real-time.

### Submit Job Description

**POST** `/jd-forge/orders`

Submit a JD for custom question generation. Returns an order ID for polling.

**Request Body:**

```json
{
  "jd_text": "Senior Backend Engineer at TechCo. Responsibilities: design scalable microservices using Java Spring Boot, PostgreSQL, Redis. Must have 5+ yrs exp...",
  "num_questions": 15,
  "tiers": {
    "standard": 10,
    "reviewed": 5,
    "enterprise": 0
  },
  "language": "en",
  "client_reference_id": "bosch_order_may_2026_001"
}
```

**Response:**

```json
{
  "order_id": "ord_jdforge_1714649445a1b2c3",
  "status": "received",
  "created_at": "2026-05-02T10:30:45Z",
  "client_reference_id": "bosch_order_may_2026_001",
  "num_questions": 15,
  "tiers": {
    "standard": 10,
    "reviewed": 5,
    "enterprise": 0
  },
  "estimated_delivery": "2026-05-02T11:00:00Z"
}
```

### Get Order Status

**GET** `/jd-forge/orders/{order_id}`

Poll for generation progress.

**Response:**

```json
{
  "order_id": "ord_jdforge_1714649445a1b2c3",
  "status": "in_progress",
  "progress": {
    "stage": "ai_draft",
    "completed": 7,
    "total": 15,
    "percent": 47
  },
  "created_at": "2026-05-02T10:30:45Z",
  "estimated_completion": "2026-05-02T10:55:00Z"
}
```

**Status Values:** `received` → `parsing_jd` → `generating_specs` → `ai_draft` → `self_critique` → `sme_review` (Reviewed/Enterprise tiers only) → `calibrating` → `completed`

### Get Generated Questions

**GET** `/jd-forge/orders/{order_id}/questions`

Retrieve the full question set once `status == completed`.

**Response:**

```json
{
  "order_id": "ord_jdforge_1714649445a1b2c3",
  "status": "completed",
  "num_questions": 15,
  "tiers": {
    "standard": { "count": 10, "questions": [...] },
    "reviewed": { "count": 5, "questions": [...] }
  },
  "completed_at": "2026-05-02T10:58:30Z"
}
```

### Provide Feedback

**POST** `/jd-forge/orders/{order_id}/feedback`

Submit feedback on generated questions to improve future JD-Forge output.

**Request Body:**

```json
{
  "question_ids": ["qst_jdforge_abc123", "qst_jdforge_def456"],
  "feedback": "excellent_quality",
  "notes": "Questions were highly relevant to the JD. Only minor grammar fixes needed.",
  "rating": 4.5
}
```

**Response:**

```json
{
  "feedback_id": "fbk_1714649445a1b2c3",
  "recorded_at": "2026-05-02T10:59:00Z"
}
```

---

## Stack-Vault Endpoints

Stack-Vault is a customer-exclusive, IP-protected library. All operations are customer-isolated.

### Create Custom Question

**POST** `/stack-vault/questions`

Add a bespoke question to your exclusive library.

**Request Body:**

```json
{
  "role": "Senior Backend Engineer",
  "skill": "Distributed systems consensus",
  "format": "MCQ",
  "difficulty": 4,
  "title": "Raft Consensus: Log Replication",
  "body_md": "In the Raft consensus algorithm, when does a leader send AppendEntries RPCs?",
  "options": [
    { "label": "A", "text": "Every heartbeat interval" },
    { "label": "B", "text": "Only when there are new log entries" }
  ],
  "answer_key": "A",
  "explanation_md": "Leaders periodically send AppendEntries...",
  "language": "en"
}
```

**Response:**

```json
{
  "id": "qst_stackvault_cust_001a2b3c",
  "status": "draft",
  "created_at": "2026-05-02T10:30:45Z",
  "watermark_token": "example-watermark-token"
}
```

### List Stack-Vault Questions

**GET** `/stack-vault/questions`

Retrieve your exclusive question library with full metadata.

**Query Parameters:** Same as ReadyBank (role, skill, format, difficulty, language, pagination).

**Response:** Same schema as ReadyBank, plus `watermark_token` field (used for leak attribution).

### Submit for SME Review

**POST** `/stack-vault/questions/{question_id}/submit-for-review`

Send a draft question for senior SME validation before release.

**Response:**

```json
{
  "id": "qst_stackvault_cust_001a2b3c",
  "status": "sme_review",
  "submitted_at": "2026-05-02T10:30:45Z",
  "estimated_review_completion": "2026-05-04T10:30:45Z"
}
```

### Release Question

**POST** `/stack-vault/questions/{question_id}/release`

Mark a question as released and ready for use in assessments.

**Response:**

```json
{
  "id": "qst_stackvault_cust_001a2b3c",
  "status": "released",
  "released_at": "2026-05-02T10:30:45Z"
}
```

---

## Anti-Leak Monitoring

### Get Leak Alert

**GET** `/anti-leak/alerts`

View detected question leaks on public platforms (Reddit, GitHub, etc.).

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `severity` | string | Filter: high, medium, low |
| `status` | string | Filter: open, rotated, false_positive |
| `since` | ISO 8601 | Alerts detected after this date |
| `limit` | integer | Rows per page (default 20) |

**Response:**

```json
{
  "data": [
    {
      "alert_id": "lka_1714649445a1b2c3",
      "question_id": "qst_readybank_001a2b3c",
      "severity": "high",
      "detected_at": "2026-04-30T14:22:10Z",
      "source": "reddit.com/r/leetcode",
      "source_url": "https://reddit.com/r/leetcode/comments/...",
      "semantic_similarity": 0.92,
      "status": "open",
      "rotation_initiated_at": null,
      "replacement_question_id": null
    }
  ],
  "metadata": {
    "total": 3,
    "critical_count": 1
  }
}
```

### Mark False Positive

**POST** `/anti-leak/alerts/{alert_id}/mark-false-positive`

If a leak alert is incorrectly flagged, mark it as a false positive to improve model accuracy.

**Response:**

```json
{
  "alert_id": "lka_1714649445a1b2c3",
  "status": "false_positive",
  "updated_at": "2026-05-02T10:30:45Z"
}
```

---

## Webhooks

QOrium can send event notifications to your application in real-time.

### Register Webhook

**POST** `/webhooks`

Subscribe to events. All payloads are signed with HMAC-SHA256.

**Request Body:**

```json
{
  "url": "https://your-domain.com/qorium-webhooks",
  "events": ["jd_forge.order.completed", "leak_alert.created", "stack_vault.sme_review.completed"],
  "active": true
}
```

**Response:**

```json
{
  "webhook_id": "wbk_1714649445a1b2c3",
  "url": "https://your-domain.com/qorium-webhooks",
  "events": ["jd_forge.order.completed", "leak_alert.created"],
  "active": true,
  "secret": "REDACTED_EXAMPLE_WEBHOOK_SECRET",
  "created_at": "2026-05-02T10:30:45Z"
}
```

### Verify Webhook Signature

All webhook payloads include an `X-QOR-Signature` header. Verify it using:

```typescript
const crypto = require('crypto');
const signature = req.headers['x-qor-signature'];
const body = req.rawBody; // Raw request body (not parsed)
const secret = process.env.QORIUM_WEBHOOK_SIGNING_SECRET;

const expected = crypto
  .createHmac('sha256', secret)
  .update(body)
  .digest('hex');

if (signature !== expected) {
  return res.status(401).send('Invalid signature');
}
```

### Example Webhook Event

**Event:** `jd_forge.order.completed`

```json
{
  "event": "jd_forge.order.completed",
  "timestamp": "2026-05-02T10:58:30Z",
  "data": {
    "order_id": "ord_jdforge_1714649445a1b2c3",
    "client_reference_id": "bosch_order_may_2026_001",
    "num_questions": 15,
    "questions_url": "https://api.qorium.online/v1/jd-forge/orders/{order_id}/questions"
  }
}
```

### List Webhooks

**GET** `/webhooks`

Retrieve all registered webhooks for your key.

**Response:**

```json
{
  "data": [
    {
      "webhook_id": "wbk_1714649445a1b2c3",
      "url": "https://your-domain.com/qorium-webhooks",
      "events": ["jd_forge.order.completed"],
      "active": true,
      "created_at": "2026-05-02T10:30:45Z",
      "last_triggered_at": "2026-05-02T10:58:30Z"
    }
  ]
}
```

---

## Idempotency

All POST requests support idempotency keys to prevent duplicate processing.

**Header:**

```
Idempotency-Key: your-unique-request-id
```

QOrium stores idempotency results for 24 hours. If you retry with the same key within 24 hours, you'll get the original response (same status code and body).

**Example:**

```bash
# First request
curl -X POST https://api.qorium.online/v1/jd-forge/orders \
  -H "Idempotency-Key: bosch_order_001" \
  -H "Authorization: Bearer ..." \
  -d '{ "jd_text": "...", "num_questions": 15 }'

# Response:
{
  "order_id": "ord_jdforge_abc123",
  "status": "received",
  "created_at": "2026-05-02T10:30:45Z"
}

# Retry with same key (network error, etc.)
# Same response is returned immediately without re-processing
```

---

## Pagination & Sorting

### Limit & Offset

All list endpoints support `limit` (default 20, max 100) and `offset` (default 0) for cursor-free pagination.

```bash
GET /readybank/questions?limit=50&offset=100
```

### Sorting

Specify a field with optional `-` prefix for descending order:

```bash
GET /readybank/questions?sort=-created_at,difficulty
```

Sortable fields vary by endpoint. Check endpoint documentation.

### Cursor-Based Pagination (Recommended)

For large result sets, use `cursor` instead of offset to avoid performance degradation:

```bash
GET /readybank/questions?limit=20&cursor=abc123

# Response includes:
{
  "data": [...],
  "metadata": {
    "next_cursor": "xyz789",
    "has_more": true
  }
}
```

---

## SDKs

QOrium provides official SDKs in popular languages (released Month 2):

- **JavaScript/TypeScript** — npm: `@qorium/sdk`
- **Python** — pip: `qorium-sdk`
- **Java** — Maven: `com.qorium:sdk`
- **Go** — Go Modules: `github.com/qorium/sdk-go`

**TypeScript Example:**

```typescript
import { QOrium } from '@qorium/sdk';

const client = new QOrium({
  apiKey: 'qor_readybank_bosch_...',
  region: 'in',
});

// Fetch questions
const questions = await client.readybank.questions.list({
  role: 'Senior Backend Engineer',
  skill: 'Java Spring Boot',
  limit: 20,
});

// Submit JD for generation
const order = await client.jdForge.orders.create({
  jdText: '...',
  numQuestions: 15,
});

// Poll for completion
const status = await client.jdForge.orders.getStatus(order.orderId);
```

---

## OpenAPI Specification

QOrium provides a complete OpenAPI 3.1 specification for code generation and API testing tools:

```
https://api.qorium.online/v1/openapi.json
```

Use with Swagger UI, Insomnia, Postman, or code generators (openapi-generator, Speakeasy, etc.).

---

## Monitoring & Observability

All API requests include:

- **X-Request-ID:** Unique request identifier (useful for debugging)
- **X-Response-Time:** Server-side latency in milliseconds
- **X-RateLimit-*** headers:** Current rate limit status

**Example:**

```
X-Request-ID: req_1714649445_a1b2c3
X-Response-Time: 45
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1714649400
```

For production monitoring, integrate with your APM tool (Datadog, New Relic, Sentry) using the OpenTelemetry SDK bundled in our language SDKs.

---

## Support & SLA

**Support Channels:**
- Email: api-support@qorium.online (48-hour response SLA)
- Slack: #qorium-api-support (Slack workspace for enterprise customers)

**SLA Targets:**
- ReadyBank API: 99.9% availability, <200ms p95 latency
- JD-Forge: 99.5% availability, <30s standard tier SLA
- Stack-Vault: 99.95% availability, <200ms p95 latency

---

**API Endpoint Summary Table**

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/readybank/questions` | List commodity questions |
| GET | `/readybank/questions/{id}` | Get single question |
| POST | `/readybank/questions/search` | Full-text search |
| POST | `/readybank/export` | Bulk export CSV/JSON |
| POST | `/jd-forge/orders` | Create generation order |
| GET | `/jd-forge/orders/{id}` | Check order status |
| GET | `/jd-forge/orders/{id}/questions` | Retrieve generated questions |
| POST | `/jd-forge/orders/{id}/feedback` | Submit feedback |
| POST | `/stack-vault/questions` | Create exclusive question |
| GET | `/stack-vault/questions` | List exclusive library |
| POST | `/stack-vault/questions/{id}/submit-for-review` | SME review submission |
| POST | `/stack-vault/questions/{id}/release` | Release for use |
| GET | `/anti-leak/alerts` | View leak detections |
| POST | `/anti-leak/alerts/{id}/mark-false-positive` | Feedback on false positives |
| POST | `/webhooks` | Register webhook |
| GET | `/webhooks` | List webhooks |
