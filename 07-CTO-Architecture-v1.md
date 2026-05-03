# QOrium — CTO Architecture v1.0

**Author:** CTO, Talpro Universe
**Audience:** Engineering team, infrastructure operations, security review, future Senior Engineer hire #1
**Date:** May 1, 2026
**Status:** v1.0 — for technical review prior to Month 1 execution
**Companion docs:** Master Mega Doc · Blueprint v1.1 · SKU Architecture · IdeaForge Gate · Bali Sales Playbook

---

## Reading Guide

This document is the **technical operating system** for QOrium. It defines the architecture, tech stack, data model, API surface, deployment topology, security posture, and per-SKU pipeline variations. Sections:

1. System Architecture Overview (the 30,000-ft view)
2. Tech Stack (every component, with reasoning)
3. The Content Engine (deep-dive on the 7-stage pipeline)
4. Per-SKU Pipeline Variations (how ReadyBank / JD-Forge / Stack-Vault diverge)
5. Data Model (PostgreSQL schema for the role-graph + question lifecycle)
6. API Design (REST endpoints, SDKs, authentication, rate limiting)
7. Anti-Leak Engine (the differentiating moat)
8. Security & Compliance (DPDPA, GDPR, IP protection)
9. Deployment Topology (VPS, Mac Mini, services, environments)
10. Scalability Roadmap (Year 1 → Year 5)
11. Observability, Monitoring, and SRE Posture
12. Engineering Standards and CI/CD
13. Risk Register and Mitigations

---

## 1. System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              EXTERNAL CONSUMERS                                  │
│                                                                                  │
│  Platforms    Enterprise   Staffing    QOrium     Internal                      │
│   (API)        Console      Console     Web        Tools                         │
│      │           │            │           │          │                           │
└──────┼───────────┼────────────┼───────────┼──────────┼───────────────────────────┘
       │           │            │           │          │
       ▼           ▼            ▼           ▼          ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                        API GATEWAY + AUTH (Nginx + Express)                      │
│              Rate limiting · API key auth · OAuth2 (admin) · CORS · TLS         │
└─────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              SERVICE LAYER                                       │
│                                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
│  │ ReadyBank    │  │ JD-Forge     │  │ Stack-Vault  │  │ Anti-Leak        │    │
│  │ Service      │  │ Service      │  │ Service      │  │ Engine           │    │
│  │ (lookup,     │  │ (real-time   │  │ (per-client  │  │ (crawl + match   │    │
│  │  search,     │  │  AI pipeline)│  │  isolation)  │  │  + auto-rotate)  │    │
│  │  export)     │  │              │  │              │  │                  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────────┘    │
│         │                 │                 │                 │                 │
│  ┌──────┴─────────────────┴─────────────────┴─────────────────┴───────────┐    │
│  │                      CONTENT ENGINE (7-stage)                          │    │
│  │   Spec → AI Draft → Self-Critique → SME Review → Calibrate → Release   │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
│         │                                                                        │
│  ┌──────┴────────────────────────────────────────────────────────────────┐    │
│  │  AI Layer        │  SME Workflow      │  Calibration Panel             │    │
│  │  Claude Opus 4.6 │  Admin web app for │  Reference candidates          │    │
│  │  GPT-5 fallback  │  contractor SMEs    │  IRT difficulty estimation     │    │
│  └────────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                          │
│                                                                                  │
│  PostgreSQL 16        │  Redis 7         │  S3-compatible       │  Judge0       │
│  (questions, role-    │  (cache, rate    │  (object storage,    │  (code        │
│   graph, customers,   │   limit, queue,  │   exports, attach-   │   execution   │
│   audit log)          │   sessions)      │   ments)             │   sandbox)    │
└─────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                         INFRASTRUCTURE                                           │
│                                                                                  │
│  VPS (Hostinger KVM)   │  Mac Mini M4 Pro    │  External APIs                  │
│  Nginx + PM2 apps      │  Heavy inference    │  Anthropic, OpenAI, Serper      │
│  Static API services   │  (Ollama allowed)   │  for crawl & generation         │
│  PostgreSQL primary    │  Docker dev/test    │                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

The architecture is **service-oriented**, not microservice-fragmented. Three primary services (ReadyBank, JD-Forge, Stack-Vault) share one Content Engine and one data layer. Anti-Leak Engine runs as an asynchronous background service. This keeps the engineering team small and the operational complexity low until scale demands further decomposition.

---

## 2. Tech Stack

### 2.1 Why these choices

QOrium adopts the **Talpro Universe technology standard** — Next.js + Express + PostgreSQL + Redis — for three reasons: (a) the CTO office and CVPRO codebase already have battle-tested patterns for these tools, (b) hiring is easier (large pool of developers familiar with this stack), (c) cross-product reuse with LeadHunter, ProveIQ, and HireIQ is straightforward.

### 2.2 Stack Inventory

| Layer | Technology | Version | Reasoning |
|---|---|---|---|
| **Frontend (admin + customer consoles)** | Next.js 15 + TypeScript | 15.x | Talpro Universe standard; SSR for SEO on public pages; React Server Components for fast admin |
| **Frontend UI** | shadcn/ui + Tailwind CSS v4 + Aceternity UI + Magic UI + Motion v12 | latest | Frontend governance per CTO Constitution v8.1 |
| **Backend API** | Node.js 22 LTS + Express 5 + Pino structured logging | latest | Fast iteration; async I/O native; aligned with rest of Talpro Universe |
| **Backend service language** | TypeScript end-to-end | 5.5+ | Type safety from API to DB; zero TypeScript errors enforced via CI gate |
| **Primary database** | PostgreSQL 16 + JSONB columns for flexible metadata | 16.x | Full ACID; JSONB lets us evolve question metadata without migrations |
| **Cache + queue + rate limit** | Redis 7 | 7.x | Used for session, rate limit (RateLimit-* headers), background job queues, idempotency tokens |
| **Object storage** | Cloudflare R2 (S3-compatible) | n/a | Cheaper egress than S3; QOrium customer exports + uploads + watermark fingerprints |
| **Code execution sandbox** | Judge0 (self-hosted) | latest | Open-source Docker-isolated code runners; Year 1 for SQL + Python + JS; expand to Go/Java/Rust by Year 2 |
| **AI generation** | Claude Opus 4.6 (primary) + GPT-5 (fallback) + Gemini Pro (specific tasks) | latest API | Multi-model strategy avoids vendor lock-in; Anthropic primary because of CTO Office trust signal |
| **AI orchestration** | Native fetch + retry logic; consider LangChain only if multi-step chains exceed 5 steps | n/a | Avoid framework overhead until proven necessary |
| **Web search / crawl (anti-leak)** | Serper.dev API + N8N orchestration | latest | Cheap programmatic Google search; N8N for scheduled scan workflows |
| **PDF / DOCX export** | pandoc + python-docx | latest | Already proven across Talpro Universe |
| **CSV / XLSX export** | papaparse + SheetJS | latest | Customer-facing export library |
| **Authentication** | OAuth2 (admin via NextAuth.js) + API keys (machine) + JWT (sessions) | latest | Standard split: humans use OAuth, machines use signed API keys |
| **Email / notifications** | Resend (transactional) + WhatsApp Business API (customer alerts) | latest | India enterprise customers prefer WhatsApp for support |
| **Payments** | Razorpay (India) + Stripe (international) — reuse CVPRO module | extracted | Standing Order #8 — reuse from CVPRO |
| **Observability** | OpenTelemetry → Grafana Cloud + Sentry for error tracking | latest | Talpro Universe Sentinel + standard OTel ingestion |
| **CI/CD** | GitHub Actions + gitleaks + npm audit + tsc --noEmit + ESLint + Prettier | latest | Talpro Universe CI standard |
| **Deployment** | PM2 (cluster mode for stateless services) + Nginx reverse proxy + Let's Encrypt SSL | latest | Consistent with Talpro Universe VPS standard |
| **Container runtime (Mac Mini only)** | Docker + Docker Compose for inference workloads | latest | Heavy inference on Mac Mini M4 Pro per CTO Constitution Ollama-on-VPS ban |

### 2.3 Explicitly Excluded

- **Python for backend services** — Use Python only for ML / data scripts; main API stays Node.js.
- **Microservices framework (Istio, Kubernetes)** — Premature for Year 1; PM2 cluster mode handles 5K req/min easily.
- **Vector database (Pinecone, Weaviate)** — Not needed for v1. PostgreSQL with pgvector extension if needed Year 2.
- **GraphQL** — REST is fine; GraphQL adds complexity without justifying value at this scale.
- **Custom AI inference** — Always use API providers (Anthropic, OpenAI, Google) until token costs justify self-hosting (probably Year 3+).

---

## 3. The Content Engine (7-Stage Pipeline Deep-Dive)

The Content Engine is QOrium's central intellectual asset. Every question — regardless of SKU — passes through it, with stage-specific variations per SKU.

### Stage 1 — SPEC IN

**Input:** A specification describing what to author. Format depends on caller:

```typescript
interface QuestionSpec {
  format: "MCQ" | "MSQ" | "Coding-fn" | "Coding-project" | "SQL" | "SJT" | ...; // 40+ formats
  role: string;            // e.g., "Senior Backend Engineer"
  skill: string;           // e.g., "Java Spring Boot transaction handling"
  difficulty: 1 | 2 | 3 | 4 | 5;  // Easy → Expert
  topic_constraint?: string;       // Optional sub-topic, e.g., "@Transactional propagation"
  exclude_concepts?: string[];     // Optional, for diversity
  client_id?: string;              // Set if Stack-Vault (per-client variant)
  language?: string;               // Default "en", supports "hi", "ta", "te" etc.
  jd_text?: string;                // Set if JD-Forge (full JD body)
}
```

Specs are batched (for ReadyBank wave authoring) or real-time single (for JD-Forge / Stack-Vault).

### Stage 2 — AI DRAFT

**Implementation:** Claude Opus 4.6 (primary) with structured JSON output. System prompt includes:

- Format-specific authoring guidelines (e.g., MCQ rules: 1 correct + 3 plausible distractors; Coding rules: include sample I/O + 5 hidden test cases + reference solution + complexity analysis).
- Anti-leak filter: explicit instruction to NOT generate questions matching any in our known leaked-question corpus (semantic similarity check post-generation).
- Difficulty calibration prompt (anchored to QOrium's 5-point scale with reference exemplars).

Output is parsed against a strict JSON schema; malformed output triggers re-prompt with self-correction.

### Stage 3 — AI SELF-CRITIQUE

**Implementation:** Same model, second pass. Prompt asks the AI to critique its own draft against:

- Ambiguity (any reasonable test-taker reading would understand?)
- Distractor quality (are wrong answers genuinely plausible?)
- Edge cases (does the test case suite cover boundaries?)
- Bias (any gendered/regional/cultural assumptions?)
- Leak risk (does this look like a textbook public problem?)

Critique scores 0–10 per dimension. If any dimension < 7, the question is auto-regenerated (max 2 retries) before SME stage.

### Stage 4 — SME REVIEW

**Implementation:** Internal admin web app (Next.js) where contracted SMEs see:

- The question content
- The AI self-critique scores
- Suggested edits (yellow highlights)
- Accept / Edit / Reject buttons
- Time-to-review tracking

SMEs are paid per validated question (₹500–₹2,000 by complexity). The CMO + Content Ops Manager onboards 100+ SMEs across tech stacks + India domains (sourced via Talpro network, NIT/IIT alumni, freelance platforms).

For **JD-Forge Standard tier**: this stage is SKIPPED (AI-only).
For **JD-Forge Reviewed and Enterprise tiers**: this stage is async with a 4-hour SLA.
For **ReadyBank**: this stage is mandatory.
For **Stack-Vault**: this stage is mandatory + senior-SME review (₹2,000+/question).

### Stage 5 — CALIBRATE

**Implementation:** Sample release to QOrium Reference Panel — paid candidates (₹50–₹200 per question attempted). Targets 50–100 attempts per question for statistical significance.

After sampling, IRT (Item Response Theory) calibration computes:

- **Item difficulty (b parameter)** — Anchored to QOrium 5-point scale
- **Item discrimination (a parameter)** — How well the item separates strong from weak candidates
- **Pass rate** — Empirical % of candidates getting it right

Items with discrimination < 0.3 are flagged for review (poor signal quality). Items with extreme b parameters (too easy or too hard for stated difficulty level) are reclassified.

For **JD-Forge Standard tier**: this stage is SKIPPED (no calibration).
For **ReadyBank** and **Stack-Vault**: mandatory.

### Stage 6 — RELEASE

**Implementation:** Question is added to its target library (ReadyBank shared, or per-client Stack-Vault namespace, or per-JD ephemeral pack), tagged with role-graph metadata, watermarked (for Stack-Vault), indexed for retrieval.

PostgreSQL transaction ensures atomicity: question + tags + watermark + release record all commit together.

### Stage 7 — POST-DEPLOY

**Implementation:** Continuous background processing:

- **Performance analytics**: Every customer use of the question triggers an event; aggregated daily; flags drift in pass rate (which indicates leakage).
- **Anti-leak monitor**: See §7 for detail.
- **Auto-retire trigger**: If leak detected OR pass-rate drift > threshold, question is marked deprecated; AI-regenerates a semantic variant; new variant goes back to Stage 4 (SME review).
- **Versioning**: Original is retained as v1; replacement is v2; Stack-Vault customers get v2 quietly; ReadyBank customers see v2 in next quarterly refresh.

---

## 4. Per-SKU Pipeline Variations

| Stage | ReadyBank | JD-Forge Standard | JD-Forge Reviewed | Stack-Vault |
|---|---|---|---|---|
| 1. SPEC IN | Batched, wave-based | Real-time single (from JD parse) | Real-time single | Curated to client stack |
| 2. AI DRAFT | Claude Opus | Claude Opus | Claude Opus | Claude Opus + senior-SME spec |
| 3. AI SELF-CRITIQUE | Yes | Yes (stricter threshold) | Yes | Yes |
| 4. SME REVIEW | Yes (junior + mid) | **SKIPPED** | Yes (4hr SLA) | Yes (senior-SME mandatory) |
| 5. CALIBRATE | Yes (Reference Panel) | **SKIPPED** | Optional | Yes (Reference Panel + customer pool) |
| 6. RELEASE | To shared library | Ephemeral pack (not stored long-term in shared) | Ephemeral pack | To customer's private namespace; watermarked |
| 7. POST-DEPLOY | Performance + anti-leak monitor | None (per-JD, single-use) | None (single-use) | Performance + per-client anti-leak + leak attribution |

### JD-Forge Real-Time Pipeline Latency Budget

JD-Forge Standard tier promises 30-second SLA. Latency budget:

| Step | Budget | Notes |
|---|---|---|
| JD parse (LLM extracts skills) | 3 sec | Cached for repeat JDs by hash |
| Spec generation (decompose into N questions) | 1 sec | Deterministic |
| AI draft (parallel generation, 20 questions) | 20 sec | Parallelized via Promise.all; Claude Opus typical 1s/question with batching |
| AI self-critique (parallel) | 5 sec | Parallel with draft |
| Pack assembly + return | 1 sec | Post-process + JSON serialize |
| **Total** | **30 sec** | Within SLA |

JD-Forge Reviewed tier inserts an async SME step (4-hour SLA) — handled via background job queue (BullMQ on Redis).

---

## 5. Data Model

### 5.1 Core Tables (PostgreSQL 16, JSONB-flexible)

```sql
-- Questions table — the central asset
CREATE TABLE questions (
  id              BIGSERIAL PRIMARY KEY,
  uuid            UUID UNIQUE DEFAULT gen_random_uuid(),
  format          VARCHAR(50) NOT NULL,
  role_graph_id   BIGINT REFERENCES role_graph_nodes(id),
  difficulty      SMALLINT NOT NULL CHECK (difficulty BETWEEN 1 AND 5),
  body            JSONB NOT NULL,            -- format-specific question content
  reference_solution JSONB,                  -- coding only
  test_cases      JSONB,                     -- coding only
  rubric          JSONB,                     -- non-MCQ scoring
  language        CHAR(2) NOT NULL DEFAULT 'en',
  status          VARCHAR(20) NOT NULL,      -- draft, sme_review, calibrating, released, deprecated
  parent_question_id BIGINT REFERENCES questions(id), -- for variants & versions
  client_id       BIGINT REFERENCES customers(id),    -- NULL for ReadyBank; set for Stack-Vault
  watermark_token VARCHAR(64),               -- cryptographic per-customer marker
  ai_critique_scores JSONB,                  -- ambiguity, distractor, edge, bias, leak
  irt_difficulty  NUMERIC(4,2),              -- post-calibration b parameter
  irt_discrimination NUMERIC(4,2),           -- post-calibration a parameter
  empirical_pass_rate NUMERIC(4,3),
  authored_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  released_at     TIMESTAMPTZ,
  deprecated_at   TIMESTAMPTZ,
  authored_by     VARCHAR(50) NOT NULL,      -- 'claude-opus-4.6', 'gpt-5', etc.
  reviewed_by     VARCHAR(100),              -- SME contractor ID
  source_corpus   VARCHAR(50),               -- if RAG-grounded, source ref
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX questions_role_graph ON questions(role_graph_id);
CREATE INDEX questions_status_format ON questions(status, format);
CREATE INDEX questions_client ON questions(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX questions_watermark ON questions(watermark_token) WHERE watermark_token IS NOT NULL;

-- Role graph — the canonical taxonomy
CREATE TABLE role_graph_nodes (
  id              BIGSERIAL PRIMARY KEY,
  name            VARCHAR(200) NOT NULL,     -- e.g., "Senior Backend Engineer"
  job_family      VARCHAR(100),              -- e.g., "Engineering"
  seniority       VARCHAR(20),               -- "junior", "mid", "senior", "principal"
  tech_stack      VARCHAR(100),              -- e.g., "Java/Spring", "React", "SAP-ABAP"
  domain          VARCHAR(100),              -- e.g., "BFSI", "GCC", "Generic"
  geography       VARCHAR(50) DEFAULT 'global',
  parent_id       BIGINT REFERENCES role_graph_nodes(id), -- hierarchical
  metadata        JSONB,                     -- additional structured tags
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX role_graph_search ON role_graph_nodes USING GIN ((name || ' ' || tech_stack || ' ' || domain) gin_trgm_ops);

-- Customers (Platform / Enterprise / Staffing)
CREATE TABLE customers (
  id              BIGSERIAL PRIMARY KEY,
  uuid            UUID UNIQUE DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  segment         VARCHAR(20) NOT NULL,      -- 'platform', 'enterprise', 'staffing'
  primary_skus    VARCHAR[] NOT NULL,        -- {'readybank', 'jd-forge', 'stack-vault'}
  api_keys        JSONB,                     -- hashed; never store plaintext
  contract_terms  JSONB,                     -- pricing tier, SLA, contract dates
  billing_status  VARCHAR(20) NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- JD-Forge requests (per-JD ephemeral)
CREATE TABLE jd_forge_requests (
  id              BIGSERIAL PRIMARY KEY,
  customer_id     BIGINT REFERENCES customers(id) NOT NULL,
  tier            VARCHAR(20) NOT NULL,      -- 'standard', 'reviewed', 'enterprise'
  jd_text         TEXT NOT NULL,
  jd_hash         VARCHAR(64) NOT NULL,      -- for caching repeats
  parsed_spec     JSONB NOT NULL,
  question_uuids  UUID[] NOT NULL,
  generated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at    TIMESTAMPTZ,
  ip_protected    BOOLEAN NOT NULL DEFAULT FALSE,
  status          VARCHAR(20) NOT NULL
);

-- Stack-Vault per-customer namespace
CREATE TABLE stack_vaults (
  id              BIGSERIAL PRIMARY KEY,
  customer_id     BIGINT REFERENCES customers(id) NOT NULL,
  tier            VARCHAR(20) NOT NULL,      -- 'department', 'enterprise', 'group'
  contract_start  DATE NOT NULL,
  contract_end    DATE NOT NULL,
  refresh_cadence_days INTEGER NOT NULL DEFAULT 90,
  watermark_secret VARCHAR(128) NOT NULL,    -- HMAC secret for watermark generation
  scope_role_graph_ids BIGINT[],             -- which role-graph nodes are in scope
  question_count_target INTEGER NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Anti-leak monitoring records
CREATE TABLE leak_signals (
  id              BIGSERIAL PRIMARY KEY,
  question_uuid   UUID REFERENCES questions(uuid) NOT NULL,
  detected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source_url      TEXT NOT NULL,
  source_type     VARCHAR(50),               -- 'glassdoor', 'reddit', 'gfg', 'leetcode-discuss', 'github', 'other'
  similarity_score NUMERIC(4,3) NOT NULL,    -- semantic similarity 0-1
  severity        VARCHAR(20) NOT NULL,      -- 'low', 'medium', 'high', 'critical'
  action_taken    VARCHAR(50),               -- 'monitoring', 'queued_for_rotation', 'rotated', 'dismissed'
  evidence        JSONB                      -- raw scrape snippet
);

CREATE INDEX leak_signals_question ON leak_signals(question_uuid);
CREATE INDEX leak_signals_severity_recent ON leak_signals(severity, detected_at DESC);

-- Audit log (everything important)
CREATE TABLE audit_log (
  id              BIGSERIAL PRIMARY KEY,
  actor_type      VARCHAR(20) NOT NULL,      -- 'user', 'api_key', 'system'
  actor_id        VARCHAR(100),
  action          VARCHAR(100) NOT NULL,
  entity_type     VARCHAR(50) NOT NULL,
  entity_id       VARCHAR(100) NOT NULL,
  metadata        JSONB,
  occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address      INET,
  user_agent      TEXT
);

CREATE INDEX audit_log_actor_recent ON audit_log(actor_id, occurred_at DESC);
```

### 5.2 Key Design Decisions

- **JSONB for `body`, `test_cases`, `rubric`**: Different formats need different schemas (MCQ has `options` + `correct_index`; coding has `function_signature` + `examples`; SJT has `scenario` + `response_options`). JSONB lets each format define its own structure without table-per-format proliferation.
- **`parent_question_id` self-reference**: Supports both versions (v1 deprecated → v2 same parent) and per-client variants (one logical question, N client-specific surface forms).
- **`watermark_token` indexed**: Enables sub-second leak attribution: scan for the watermark hash on a leaked question, find the customer.
- **`role_graph_nodes` is hierarchical** (parent_id self-ref): Allows queries like "all questions for Senior Backend Engineer or any of its sub-specializations."
- **`audit_log` partitioned by month** (production): One row per material action; partitioning by month keeps query latency bounded.

---

## 6. API Design

### 6.1 Authentication

- **Customer API access**: Signed API keys (HMAC-SHA256). Keys are hashed at rest, presented only at creation.
- **Admin console (humans)**: NextAuth.js with email + OTP (MSG91). MFA via TOTP for production admin actions.
- **Internal service-to-service**: mTLS (where on same VPC) or signed JWTs (cross-host).

### 6.2 Rate Limiting

Per Talpro Universe standard: 10 req/sec sustained, 20 req/sec burst per API key. Enterprise tier customers get custom limits documented in contract.

Implemented via Redis with `RateLimit-*` headers (`Limit`, `Remaining`, `Reset`).

### 6.3 Endpoints (REST, JSON-only)

All endpoints under `/v1/`. Errors follow RFC 7807 Problem Details.

#### ReadyBank Service

```
GET    /v1/questions/search       — Search by role/skill/format/difficulty
GET    /v1/questions/{uuid}       — Fetch single question (full body)
POST   /v1/packs/generate         — Generate question pack from criteria (returns IDs)
GET    /v1/packs/{id}/export      — Export pack (CSV/JSON/HackerRank/Mettl format)
GET    /v1/role-graph/search      — Search role graph nodes
```

#### JD-Forge Service

```
POST   /v1/jd-forge/generate      — Submit JD; returns generation request ID
GET    /v1/jd-forge/requests/{id} — Poll status; returns pack when ready
POST   /v1/jd-forge/requests/{id}/feedback — Customer feedback for AI training
```

#### Stack-Vault Service (per-customer namespace)

```
GET    /v1/vaults/me              — Get customer's vault metadata
GET    /v1/vaults/me/questions/search — Search within private namespace
GET    /v1/vaults/me/questions/{uuid} — Fetch single (watermarked-for-this-customer)
POST   /v1/vaults/me/refresh-request — Request out-of-cycle refresh
POST   /v1/vaults/me/leak-report  — Customer reports suspected leak; triggers attribution scan
```

#### Anti-Leak Service (admin-only)

```
GET    /admin/v1/leaks/recent     — Recent leak signals
POST   /admin/v1/leaks/{id}/action — Mark for rotation / dismiss
GET    /admin/v1/leaks/attribution/{question_uuid} — Forensic attribution
```

#### Admin / Content Ops

```
POST   /admin/v1/specs/batch      — Submit Wave authoring spec batch
GET    /admin/v1/sme/review-queue — SME review queue
POST   /admin/v1/sme/{id}/decision — Accept / Edit / Reject
GET    /admin/v1/calibration/queue — Items awaiting calibration sampling
GET    /admin/v1/customers        — Customer list with billing status
```

### 6.4 SDK Strategy

Year 1: Node.js SDK + Python SDK only (cover 90% of platform integrations).
Year 2: Java + Go + Ruby + .NET SDKs as customer demand justifies.
SDKs are auto-generated from OpenAPI 3.1 spec to ensure parity with the REST API.

---

## 7. Anti-Leak Engine (The Differentiating Moat)

### 7.1 Architecture

```
                    ┌─────────────────────────┐
                    │  Scheduled crawl job    │
                    │  (N8N workflow, daily)  │
                    └───────────┬─────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────┐
            │  Serper.dev API: search known leak  │
            │  domains for question-shaped strings │
            └─────────────┬───────────────────────┘
                          │
                          ▼
            ┌─────────────────────────────────────┐
            │  Embedding similarity scan:         │
            │  Compare crawled snippets to        │
            │  question library embeddings        │
            │  (pgvector or external embedding    │
            │  service)                           │
            └─────────────┬───────────────────────┘
                          │
                          ▼ (if similarity > 0.85)
            ┌─────────────────────────────────────┐
            │  Insert leak_signals row + classify │
            │  severity (low/med/high/critical)   │
            └─────────────┬───────────────────────┘
                          │
                          ▼ (if severity = critical OR
                             pass-rate drift > threshold)
            ┌─────────────────────────────────────┐
            │  Auto-trigger Content Engine        │
            │  Stage 2 (regenerate) for affected  │
            │  question; mark old as deprecated    │
            └─────────────────────────────────────┘
```

### 7.2 Crawl Targets (by Tier)

- **Critical (continuous, hourly)**: GeeksforGeeks company-tagged archive, LeetCode discuss, Glassdoor Indian companies' interview-experience pages.
- **High (daily)**: Reddit r/leetcode, r/cscareerquestions, r/india_recruitment, r/aitah_interviewers; GitHub repos with "interview-questions" / "company-name-interview" patterns.
- **Medium (weekly)**: Lesser-known interview-prep blogs; Quora; Telegram public-channel scrapes (where legally accessible).

### 7.3 Watermarking & Forensic Attribution (Stack-Vault)

For Stack-Vault questions, each customer's variant is watermarked via:

- **Identifier injection**: variable names, dataset names, scenario character names contain a deterministic encoding of the customer ID (e.g., variable suffixes or numeric ranges in test cases).
- **Test-case fingerprinting**: A subset of test cases use values mathematically derived from `HMAC(stack_vault.watermark_secret, question_uuid)`.
- **Multi-marker redundancy**: Each question has at least 3 independent watermark markers; even partial leakage allows attribution.

When a leak signal arrives for a Stack-Vault question, the leak_signals.evidence JSON is parsed for any of the watermark patterns; matches identify the source customer with high confidence.

---

## 8. Security & Compliance

### 8.1 DPDPA 2023 (India)

- QOrium does **not** store candidate PII by default. We sell content (questions, test cases, rubrics), not assessment results.
- For Stack-Vault white-label engagements where SME human reviewers see anonymized candidate data: **Data Processing Agreement** (DPA) signed with each enterprise customer; QOrium acts as data processor; customer is data fiduciary.
- All SME contractors sign confidentiality + non-compete + IP assignment.
- Right-to-erasure requests: handled by anonymizing customer-attributable data within 30 days of valid request.

### 8.2 GDPR (EU customers)

- Same posture: QOrium is content vendor, not data processor for end-candidate data. Where API-integrated platform clients pull from EU customers, the platform remains the data fiduciary.
- Data residency: Year 1 data stored in India (per Indian customer expectation). EU-tenant data stored in Frankfurt-region S3 if required by Year 2 EU customer.

### 8.3 IP Protection

- **Original-authorship documentation per question**: every question's `audit_log` includes who/when/source-corpus. This protects against "you copied LeetCode" disputes.
- **Copyright registration**: Bundled question packs registered annually in India + US (filings handled by external IP counsel).
- **Trade secret protection**: The Content Engine prompts, validation rubrics, watermarking algorithms, and Reference Panel methodology are documented as trade secrets in employee + contractor agreements.
- **No secrets in code**: All API keys, model credentials, watermark secrets stored in environment variables; gitleaks runs in CI to prevent leakage.

### 8.4 Application Security (per Talpro Universe Standing Orders)

- HSTS, X-Content-Type-Options, X-Frame-Options, CSP headers on every response.
- Rate limiting 10r/s burst 20 on all Nginx public blocks.
- Auth on every protected route (401 for unauthorized, 403 for unauthorized resource).
- All AI-generated content goes through the mandatory SME validation (no auto-publish exceptions).
- gitleaks + npm audit + dependency-checker run in CI; failed CI blocks merge.

---

## 9. Deployment Topology

### 9.1 VPS (Hostinger KVM, primary production)

- **Nginx** as reverse proxy with TLS termination (Let's Encrypt auto-renewal).
- **PM2 cluster mode** for stateless services: ReadyBank Service, JD-Forge Service, Stack-Vault Service, Admin Console (Next.js), Customer Web Console (Next.js).
- **PM2 fork mode** for stateful single-instance services: Anti-Leak Crawl Worker, BullMQ Job Worker.
- **PostgreSQL 16 primary** on VPS with PITR-enabled backups to Cloudflare R2 (15-min RPO target).
- **Redis 7** on VPS for sessions, cache, queue.
- **Nginx hardened config** per Talpro Universe `talpro-nginx-hardened.conf` template.

### 9.2 Mac Mini M4 Pro (heavy inference, dev)

- **Ollama** for local large-model experimentation (allowed per CTO Constitution since on Mac Mini, not VPS).
- **Docker Compose** dev/test stacks.
- **Judge0** containers for code-execution sandboxing (could move to VPS Year 2 if scaling demands).

### 9.3 External APIs

- **Anthropic API** (primary AI generation)
- **OpenAI API** (fallback)
- **Google Gemini Pro** (specific tasks)
- **Serper.dev** (web search for anti-leak)
- **Resend** (transactional email)
- **MSG91** (SMS OTP for admin auth)
- **WhatsApp Business API** (customer alerts)
- **Razorpay** (Indian customer billing)
- **Stripe** (international customer billing)

### 9.4 Environments

- **Production (`qorium.io` + `api.qorium.io` + `app.qorium.io`)** — VPS only; PM2 cluster; full monitoring.
- **Staging (`staging.qorium.io`)** — VPS, separate database; mirrors production config.
- **Dev (local + Mac Mini Docker Compose)** — Each engineer runs full stack locally with Docker.

### 9.5 Domains & DNS

- `qorium.io` — Marketing site (Next.js, SSR, public)
- `app.qorium.io` — Customer console (Next.js, auth-gated)
- `api.qorium.io` — REST API (Express)
- `admin.qorium.io` — Internal admin (Next.js, MFA-gated)
- `partners.qorium.io` — Reserved for SDK docs + developer portal

---

## 10. Scalability Roadmap

### Year 1 (M0–M12) — Single-VPS architecture

- All services on single Hostinger KVM4 (16GB RAM).
- PostgreSQL primary on same VPS (with R2 backups).
- Expected load: 5K req/min peak across all services. Well within capacity.

### Year 2 — Service decomposition + read replica

- Move Anti-Leak Crawl Worker to dedicated low-cost VPS (or AWS Fargate spot instances).
- PostgreSQL read replica on separate VPS for read-heavy ReadyBank queries.
- Cloudflare CDN in front of static assets and API responses (where cacheable).

### Year 3 — Multi-region for international expansion

- US-East VPS (or Hetzner equivalent) for US platform customers.
- EU-Central VPS for EU customers (data residency).
- PostgreSQL logical replication for multi-region read access.
- API Gateway (Cloudflare Workers or Kong) for routing.

### Year 5 — Kubernetes if justified

- Only if multi-region service count exceeds 8–10 distinct services. Otherwise PM2 + Nginx scales fine to $50M+ ARR.

---

## 11. Observability, Monitoring, SRE

### 11.1 Logging

- **Structured JSON logging** via Pino. Levels: TRACE, DEBUG, INFO, WARN, ERROR, FATAL.
- **Required fields per log entry**: `timestamp`, `service`, `request_id`, `customer_id`, `actor`, `action`, `latency_ms`, `outcome`.
- **Log aggregation**: Logs ship to Grafana Cloud Loki via Vector.

### 11.2 Metrics

- **OpenTelemetry instrumentation** on every service.
- **Key metrics**: request count, request latency p50/p95/p99, error rate, AI generation latency per stage, SME review queue depth, leak detection rate, customer-active-API-keys, ARR run-rate.
- **Dashboards**: Grafana — one per service + one customer-360 + one financial.

### 11.3 Alerting

- **Sentry** for application errors → Slack #qorium-alerts.
- **Grafana alerting** for SLA breaches → PagerDuty (after Month 6 when SLAs are formal).
- **Talpro Sentinel** integration for cross-product alerts.

### 11.4 SLOs (Service Level Objectives)

| Service / Tier | SLO |
|---|---|
| ReadyBank API availability | 99.9% (Enterprise tier); 99.5% (Growth + Starter) |
| ReadyBank API latency p95 | < 200ms (single question fetch); < 2s (pack generation) |
| JD-Forge Standard tier latency | < 30s end-to-end |
| JD-Forge Reviewed tier turnaround | < 4 hours |
| Stack-Vault API availability | 99.95% (per contract; no Starter tier) |
| Anti-Leak detection-to-rotation cycle | < 7 days for High severity; < 24h for Critical |

### 11.5 Incident Response

- **Severity 1** (production down): Page on-call within 5 min; Talpro Universe incident protocol.
- **Severity 2** (degraded): Slack alert; respond within 30 min business hours.
- **Severity 3** (cosmetic / single customer): Slack thread; respond within 4 business hours.
- Postmortems within 5 business days for all Sev 1; Talpro postmortem template.

---

## 12. Engineering Standards & CI/CD

### 12.1 CI/CD Pipeline (per commit)

```
git push → GitHub Actions:
  1. npm install (cached)
  2. tsc --noEmit (zero TypeScript errors required)
  3. ESLint (zero lint errors)
  4. Prettier check
  5. npm test (Jest unit + Vitest integration)
  6. npm run build (Next.js + Express build)
  7. gitleaks scan (zero secret leaks)
  8. npm audit (zero high/critical CVEs)
  9. Security headers scan (on built artifacts)
 10. Deploy to staging (auto on `main` merge)
```

### 12.2 Code Standards

- **Zero TypeScript errors** — no `any` without comment justifying it.
- **Zero unused imports / variables**.
- **Test coverage gate**: 70% line coverage minimum for new code.
- **Conventional Commits** for git messages.
- **Branch protection on `main`**: PR review required; CI green required; admin override logged.

### 12.3 Deployment

- Per Talpro Universe standard: `pm2 reload` (cluster) or `pm2 restart` (fork) → `pm2 save` → `curl -I health` → `talpro_smoke_tests` → `talpro_watchdog_add`.
- Zero-downtime deploys via PM2 cluster reload (rolling restart).
- Database migrations: `db-migrate` tool; reviewed via PR; applied during deploy.
- Rollback procedure: previous PM2 process snapshot retained for 7 days; `pm2 reload <app> --previous` reverts.

---

## 13. Risk Register & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Single-VPS failure brings down production | Med | High | Year 2 read replica + standby; daily R2 backup with 15-min RPO |
| AI provider rate-limit / outage | Med | Med | Multi-model fallback (Claude → GPT-5 → Gemini); cached responses for repeat JDs |
| AI generation quality degrades | Low | High | SME validation step is mandatory; AI self-critique gates; per-tier quality SLAs |
| Anti-leak crawl breaks (Serper.dev API change) | Med | Med | N8N workflow modular; secondary scraping fallback (BeautifulSoup + Playwright) |
| Watermark forensics false-positive | Low | High | Multi-marker redundancy; legal counsel review before any attribution claim |
| Database migration breaks production | Low | High | Migrations reviewed in PR; staging tested; rollback scripts mandatory; off-peak deploy |
| SME contractor network can't scale past 100 | Med | Med | Talpro alumni network; freelance platforms; eventual Bali AI agent for SME triage |
| Cost overrun on AI generation | Med | Med | Token budgets enforced per request; daily cost monitoring; cap at 110% of plan |
| Customer reports false leak (gaming us) | Low | Low | Manual review of all leak reports; no auto-action without SME confirmation |
| Stack-Vault customer pirates own library | Low | High | Contractual liability; access logging; watermark forensics; legal recourse |

---

## 14. Cross-Product Reuse from Talpro Universe

QOrium reuses substantial code + patterns from existing Talpro Universe products (per CTO Constitution Standing Order #2 — reuse first, build only if nothing exists):

- **Razorpay subscription module** — extracted from CVPRO; reused for Recruiter subscriptions
- **Stripe billing** — extracted from CVPRO; reused for international customers
- **Email sequences** — reuses CVPRO email service patterns
- **Auth (NextAuth.js OAuth + MSG91 OTP)** — pattern from LeadHunter Platform
- **Admin console UI** — shadcn + Aceternity patterns from HireIQ Pro admin
- **PM2 + Nginx hardened config** — Talpro Universe standard
- **Sentinel monitoring integration** — Talpro Universe standard
- **N8N workflow patterns** — reused for anti-leak crawl + JD-Forge async jobs
- **Bash + deployment scripts** — Talpro Universe standard

Estimated reuse: ~40% of Year 1 engineering work avoided through reuse. ~₹12L–₹18L of equivalent engineering cost saved.

---

## 15. Hiring Plan (Engineering)

Per Blueprint Section 7, the first 10 hires include:

1. **Senior Engineer — Content Engine** (Month 2): Full-stack TS, AI pipeline experience, owns Content Engine + Anti-Leak.
2. **SME Content Lead** (Month 2): Senior engineer turned content engineer; defines question quality standard; owns contractor SME onboarding.
3. **AE — Enterprise** (Month 3): Sales hire, not engineering.
4. **BD — Platforms** (Month 3): Sales/BD hire.
5. **I/O Psychologist** (Month 4 contractor → Month 9 FTE): Validation lead.
6. **Frontend Engineer — Console + Widget** (Month 5): React/Next.js focused.
7. **Content Operations Manager** (Month 7): Manages SME network, throughput, QA.

Engineering team at end of Year 1: **CTO + Senior Engineer + SME Content Lead + Frontend Engineer = 4 engineering FTE** + I/O Psych contractor → FTE.

---

## 16. The Day-1 Build Checklist

Before Month 1 spend, the CTO + Senior Engineer must have:

- [ ] GitHub repo created with branch protection + CI configured
- [ ] Hostinger VPS provisioned with PostgreSQL + Redis + Node 22 + Nginx
- [ ] Domain DNS pointing (qorium.io + subdomains)
- [ ] SSL certificates issued via Let's Encrypt
- [ ] PM2 ecosystem.config.js set up for all services
- [ ] Database schema migration applied (initial tables from §5.1)
- [ ] Anthropic API key + OpenAI fallback key + Serper.dev key in `.env`
- [ ] gitleaks pre-commit hook installed
- [ ] Talpro Universe Sentinel integration configured
- [ ] Talpro Customer Zero engagement scoped (which Talpro India hiring drives feed Wave 1 specs)

This is the engineering Day-0 punchlist. Once green, Wave 1 authoring begins.

---

*End of CTO Architecture v1.0. Companion docs: Bali Sales Playbook v1, IdeaForge Gate Report, Master Mega Doc.*
