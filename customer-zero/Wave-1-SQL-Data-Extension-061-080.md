# Wave 1 Extension: Senior SQL/Data (QOR-SQLDATA-061..080)

**STATUS:** AI-drafted v0.6 EXTENSION. SME Lead validation pending.

## 20 NEW Questions (QOR-SQLDATA-061..080)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 61: Read Replicas — Replication Lag (Easy)

**question_id:** QOR-SQLDATA-061
**skill_id:** senior-sqldata-061
**sub_skill_id:** replication-lag
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Postgres docs §Streaming Replication

**body:** A user creates a record then immediately reads via a read replica and gets "not found." Why?

**options:**
- A) Cache stale
- B) **Replication lag** — write hits primary; replica receives WAL stream asynchronously; read may land before replication catches up. Fixes: read-your-writes via primary for the same session, OR synchronous replication (cost: write latency), OR session-affinity for N seconds after a write
- C) Index missing
- D) Network partition

**answer_key:** B — Eventual-consistency on read replicas is a fundamental property. Pattern: route reads-after-write to the primary for the affected session for a configurable window (~5 seconds). Reference: Postgres §Streaming Replication.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-061-seed-2c8a4e9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-061
**bias_check_notes:** No bias.

---

### QUESTION 62: COUNT(*) on Big Tables (Easy)

**question_id:** QOR-SQLDATA-062
**skill_id:** senior-sqldata-062
**sub_skill_id:** count-star-perf
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Postgres docs §FAQ

**body:** `SELECT COUNT(*) FROM events` (1B rows) takes 5 minutes. Why and what to do?

**options:**
- A) Postgres bug
- B) MVCC requires scanning to count visible rows. Approximate: `SELECT reltuples FROM pg_class WHERE relname='events'` (planner stats; updated by ANALYZE; fast). For exact, use a triggered counter table or accept the cost
- C) Add btree on PK
- D) Switch to MyISAM

**answer_key:** B — Exact COUNT(*) is O(N) in MVCC. Approximations from `pg_class.reltuples` or `pg_stat_user_tables.n_live_tup` are sub-millisecond and usually accurate within ~5%. References: Postgres FAQ.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-062-seed-9b3e8c4a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-062
**bias_check_notes:** No bias.

---

### QUESTION 63: Foreign Keys — When to Skip (Easy)

**question_id:** QOR-SQLDATA-063
**skill_id:** senior-sqldata-063
**sub_skill_id:** fk-trade-offs
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Postgres docs §Foreign Keys

**body:** Trade-offs of foreign keys:

**options:**
- A) Always use them
- B) Use them in OLTP (referential integrity matters; cost is small INSERT/DELETE check). Skip in extreme-throughput pipelines (event-streams, denormalized analytics tables) where validity is enforced upstream and FK overhead measurable. NEVER skip for "performance" without measuring
- C) Never use them
- D) FKs are deprecated

**answer_key:** B — FKs guarantee invariants no application code can. Default: use them. Skip only with measured evidence and clear ownership of integrity elsewhere. Reference: Postgres docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-063-seed-3a7c8e2b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-063
**bias_check_notes:** No bias.

---

### QUESTION 64: GraphQL N+1 at the DB Layer (Medium)

**question_id:** QOR-SQLDATA-064
**skill_id:** senior-sqldata-064
**sub_skill_id:** graphql-dataloader
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** dataloader npm; GraphQL docs

**body:** A GraphQL query for `users { name posts { title } }` issues 1 + N queries. Solution:

**options:**
- A) Add btree
- B) **DataLoader** batches+caches calls per request. Resolvers don't query DB directly; they call `loaders.posts.load(userId)`. DataLoader collects all loads in the same tick, issues one `WHERE userId IN (...)` query
- C) Disable GraphQL
- D) Use Postgres LISTEN

**answer_key:** B — DataLoader is the canonical fix for the GraphQL N+1. Per-request cache also dedupes repeated lookups. References: dataloader npm docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-064-seed-7e2c5a8b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

### QUESTION 65: Eventual Consistency vs Strong (Medium)

**question_id:** QOR-SQLDATA-065
**skill_id:** senior-sqldata-065
**sub_skill_id:** consistency-models
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Jepsen Analyses; "Designing Data-Intensive Applications"

**body:** When is eventual consistency ACCEPTABLE?

**options:**
- A) Never — always strong
- B) When the business can tolerate a brief staleness window (likes count, view count, search index, recommendation feed). Strong consistency required for: balances, inventory, locks, anything where read-write-read could see lost updates damaging an invariant
- C) Always — performance only
- D) Only in distributed systems

**answer_key:** B — Match consistency to business semantics, not theoretical preference. Jepsen-style testing reveals real anomalies under partition; design accordingly. Reference: Kleppmann §Replication.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-065-seed-4d8c2e9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

### QUESTION 66: Sharding Strategies (Medium)

**question_id:** QOR-SQLDATA-066
**skill_id:** senior-sqldata-066
**sub_skill_id:** sharding-strategies
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** "Designing Data-Intensive Applications"

**body:** Typical sharding keys + trade-offs:

**options:**
- A) Hash of user_id
- B) **Tenant-id (multi-tenant SaaS): all tenant data co-located; cross-tenant queries are rare. Hash of user_id: even distribution but cross-user joins (e.g., friends graph) cross shards. Geographic: data-residency compliance but skewed traffic. Time-based: hot shards for "today" — only good for archival**
- C) Random
- D) Always hash on PK

**answer_key:** B — Sharding key is the single biggest architectural decision; pick based on access patterns. Resharding later is painful. Reference: Kleppmann §Partitioning.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-066-seed-1f8b3a7e
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-066
**bias_check_notes:** No bias.

---

### QUESTION 67: CAP Theorem Practical Reading (Medium)

**question_id:** QOR-SQLDATA-067
**skill_id:** senior-sqldata-067
**sub_skill_id:** cap-theorem
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Brewer, Gilbert-Lynch CAP proof

**body:** "We need CA — can we?" — what's the right reply?

**options:**
- A) Yes, modern systems are CA
- B) **CAP says: under network partition, you choose Consistency OR Availability. "CA without P" is meaningless because partitions WILL happen. Real choice: under a partition, do you sacrifice strict consistency to keep responding (AP — Cassandra, DynamoDB), or refuse writes to keep consistency (CP — Spanner, etcd)?** For most OLTP workloads, modern stacks aim for "fewer partitions, fast recovery" rather than absolute CAP corners
- C) Pick CP always
- D) CAP is wrong

**answer_key:** B — CAP framing matters; "CA" is a marketing term. Real systems (Spanner) achieve very high availability via low partition rate + fast failover, not by violating physics. References: Brewer 2012 retrospective; Kleppmann.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-067-seed-9c4e2a8b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-067
**bias_check_notes:** No bias.

---

### QUESTION 68: Materialized Views — Refresh Strategy (Medium)

**question_id:** QOR-SQLDATA-068
**skill_id:** senior-sqldata-068
**sub_skill_id:** materialized-view-refresh
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Postgres docs §Materialized Views

**body:** A reporting MV takes 4 minutes to refresh. `REFRESH MATERIALIZED VIEW mv` blocks queries during refresh. Fix:

**options:**
- A) Run refresh nightly only
- B) `REFRESH MATERIALIZED VIEW CONCURRENTLY mv` — requires unique index on the MV; uses MERGE-style refresh; queries continue. Slower than non-concurrent, but no blocking
- C) Drop the MV
- D) Convert to view

**answer_key:** B — `CONCURRENTLY` is the production answer. Trade-off: requires a unique index and is slower. Suitable for any MV that's queried during refresh. Reference: Postgres docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-068-seed-3a8c5e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

### QUESTION 69: Postgres Connection Pooling (Medium)

**question_id:** QOR-SQLDATA-069
**skill_id:** senior-sqldata-069
**sub_skill_id:** pgbouncer
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** PgBouncer docs

**body:** Postgres handles ~100-300 concurrent connections well; an app with 1000 K8s pods needs a connection per pod. Solution:

**options:**
- A) Increase max_connections to 5000
- B) **PgBouncer (or pgcat) in transaction-pooling mode** — apps connect to bouncer; bouncer multiplexes to a small (~50-200) pool of real Postgres connections. Caveat: SET, prepared statements with names, advisory locks, LISTEN/NOTIFY don't survive transaction boundaries (use session-pool for those, or design around)
- C) Direct connections always
- D) Drop Postgres

**answer_key:** B — PgBouncer is canonical. Each Postgres connection costs ~10MB RAM + per-process overhead; max_connections=5000 means the OS not the queries kills you. Transaction-pool is the most common mode; session-pool retains feature parity at the cost of pool turnover. Reference: PgBouncer docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-069-seed-7e3c8a5b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

### QUESTION 70: Soft Delete Pattern (Medium)

**question_id:** QOR-SQLDATA-070
**skill_id:** senior-sqldata-070
**sub_skill_id:** soft-delete
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** "DDIA" §Data; Stripe blog "How we built API versioning"

**body:** Trade-offs of soft delete (`deleted_at TIMESTAMP NULL`):

**options:**
- A) Always use it
- B) Pros: undo, audit, FK integrity preservation. Cons: every query needs `WHERE deleted_at IS NULL` (forgotten = leak); index size grows; uniqueness constraints awkward. Modern alternatives: row-level history table (CDC into Iceberg) gives audit without polluting the live model
- C) Soft delete is wrong
- D) Cascade always

**answer_key:** B — Soft delete is a tool with cost; when audit is the actual need, often a separate audit/CDC log is cleaner. References: DDIA; Stripe blog.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-070-seed-4f8b2c9a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-070
**bias_check_notes:** No bias.

---

### QUESTION 71: SCD Type 2 in Data Warehouse (Medium)

**question_id:** QOR-SQLDATA-071
**skill_id:** senior-sqldata-071
**sub_skill_id:** scd-type-2
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Kimball "Data Warehouse Toolkit"

**body:** Slowly Changing Dimension Type 2:

**options:**
- A) Latest value only
- B) Each change creates a new row in the dimension with `valid_from`/`valid_to`/`is_current`. Fact tables join on the surrogate key effective at the fact's timestamp. Preserves full history; canonical for dim_customer where address can change but historical orders should reflect address-at-the-time
- C) Drop history
- D) Bitemporal only

**answer_key:** B — Kimball SCD-Type-2. dbt's `snapshot` materialization automates it. Critical for finance/accounting where retroactive correctness matters. Reference: Kimball.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-071-seed-2d8e5c3a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

### QUESTION 72: Code — Gap-Free Sequence Number (Hard - Code)

**question_id:** QOR-SQLDATA-072
**skill_id:** senior-sqldata-072
**sub_skill_id:** gap-free-sequence
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Postgres docs §SEQUENCE behaviour

**body:** Indian GST law requires gap-free invoice numbers (no skipped sequence). Postgres `BIGSERIAL` skips on rollback. Implement gap-free invoice numbering safe under concurrency.

**options:** []

**answer_key:**

```sql
-- Strategy: per-tenant counter table + SELECT FOR UPDATE inside the same transaction.
-- Not gap-free if the transaction rolls back AFTER number assigned but BEFORE invoice persists,
-- so update + invoice insert MUST be in same transaction.

CREATE TABLE invoice_counter (
  tenant_id UUID PRIMARY KEY,
  next_number BIGINT NOT NULL DEFAULT 1
);

CREATE OR REPLACE FUNCTION next_invoice_number(p_tenant UUID) RETURNS BIGINT AS $$
DECLARE
  n BIGINT;
BEGIN
  -- LOCK ensures concurrent calls serialize on this tenant's row.
  -- Other tenants are unaffected (row-level lock).
  UPDATE invoice_counter
  SET next_number = next_number + 1
  WHERE tenant_id = p_tenant
  RETURNING next_number - 1 INTO n;

  IF n IS NULL THEN
    INSERT INTO invoice_counter (tenant_id, next_number) VALUES (p_tenant, 2);
    n := 1;
  END IF;
  RETURN n;
END;
$$ LANGUAGE plpgsql;

-- Usage (must be inside a transaction):
BEGIN;
  num := next_invoice_number(:tenant_id);
  INSERT INTO invoices (tenant_id, invoice_number, ...) VALUES (:tenant, num, ...);
COMMIT;
```

Key points:
- The counter UPDATE inside the SAME transaction as the invoice INSERT means rollback rolls back BOTH. Gap-free.
- Row-level lock on the counter row serializes only same-tenant writes.
- Trade-off: per-tenant insert serialization is a throughput cap. For very high tenant volumes, accept it (invoice writes are slow human action) or shard counters by date+tenant.
- Use this pattern ONLY where gap-free is a regulatory requirement; standard sequences are otherwise correct.

References: Postgres docs §SEQUENCE; GST invoice numbering rules.

**rubric:** 12-pt: counter table per tenant (3) + UPDATE w/ RETURNING for atomic increment (3) + same-transaction with insert for gap-free (3) + serialization caveat called out (2) + INSERT-on-missing handled (1).

**watermark_seed:** qorium-sqldata-v0.6-072-seed-9b3a8c4e
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-072
**bias_check_notes:** No bias. India GST context.

---

### QUESTION 73: Code — Detect & Resolve Duplicates (Hard - Code)

**question_id:** QOR-SQLDATA-073
**skill_id:** senior-sqldata-073
**sub_skill_id:** dedupe-window
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 10
**citation:** ANSI SQL §Window Functions

**body:** A user dataset has accidental duplicates (same email, different IDs). Write SQL to keep the OLDEST row per email + delete the rest, atomically.

**options:** []

**answer_key:**

```sql
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY lower(email) ORDER BY created_at ASC, id ASC) AS rn
  FROM users
)
DELETE FROM users
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
```

Or with a CTE-based approach using `ctid` (Postgres-specific) as a tiebreaker:

```sql
DELETE FROM users a
USING users b
WHERE a.email = b.email
  AND a.created_at > b.created_at;   -- a is newer -> delete
```

Notes: `lower(email)` prevents case-sensitivity slip ("Foo@x" vs "foo@x"). Add `created_at, id` deterministic ordering — if two rows share created_at, lowest id wins. Run inside a transaction, with `BEGIN;` + `SELECT count(*) FROM ranked WHERE rn>1;` check before commit, OR `EXPLAIN` to verify expected delete size. After dedupe, add `UNIQUE INDEX ON users (lower(email))` to prevent recurrence.

**rubric:** 10-pt: ROW_NUMBER PARTITION BY canonicalized key (3) + deterministic tiebreaker (2) + delete subset of rn>1 (2) + post-cleanup unique index (2) + lowercase normalization (1).

**watermark_seed:** qorium-sqldata-v0.6-073-seed-5e8c4a2b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-073
**bias_check_notes:** No bias.

---

### QUESTION 74: Snowflake Storage Costs (Hard)

**question_id:** QOR-SQLDATA-074
**skill_id:** senior-sqldata-074
**sub_skill_id:** snowflake-cost
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Snowflake Documentation

**body:** Snowflake costs are spiking. Most leveraged FIRST step?

**options:**
- A) Buy more credits
- B) **Right-size warehouses** (a small warehouse most queries use; larger only for the few that need it). Use auto-suspend ≤60s. Cluster keys on big tables to enable pruning. Materialize hot aggregates. Then check failsafe + time-travel retention defaults
- C) Always XL warehouse
- D) Switch to BigQuery

**answer_key:** B — Snowflake compute = 80% of typical bills. Warehouse right-sizing + auto-suspend yields the biggest savings. Then storage (failsafe = 7 days; time-travel default = 1 day; tune for non-critical tables). Reference: Snowflake cost-optimization docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sqldata-v0.6-074-seed-2c8a4e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-074
**bias_check_notes:** No bias.

---

### QUESTION 75: Vector Search — pgvector vs Pinecone (Hard)

**question_id:** QOR-SQLDATA-075
**skill_id:** senior-sqldata-075
**sub_skill_id:** pgvector-pinecone
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** pgvector GitHub; Pinecone docs

**body:** A RAG application stores 5M document embeddings; needs sub-100ms top-K. Choice:

**options:**
- A) Pinecone always
- B) pgvector at 5M scale: HNSW index gives sub-100ms; sits in your existing Postgres (one DB, transactional consistency with metadata). Pinecone shines >100M vectors or when serverless ops matters. At 5M, pgvector is cheaper + simpler
- C) Linear scan
- D) Store as JSON text

**answer_key:** B — Decision criterion: scale + ops. <50M vectors and team has Postgres? pgvector is the right answer. References: pgvector GitHub HNSW benchmarks.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sqldata-v0.6-075-seed-3a8c5e9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-075
**bias_check_notes:** No bias.

---

### QUESTION 76: Backup & PITR (Hard)

**question_id:** QOR-SQLDATA-076
**skill_id:** senior-sqldata-076
**sub_skill_id:** pitr-strategy
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Postgres docs §Continuous Archiving

**body:** Production Postgres backup strategy for RPO ≤ 5 min and RTO ≤ 1 hour:

**options:**
- A) `pg_dump` daily
- B) Base backup weekly + WAL archive shipped continuously to S3 (e.g., via `pgbackrest` or `wal-g`); for PITR replay WAL up to target time. Verified by automated nightly restore-to-staging test. RPO = WAL ship interval (~1 min); RTO = base + WAL replay time (load-test < 1h)
- C) Streaming replica only
- D) Storage snapshot only

**answer_key:** B — Base backup + WAL archive + verified restore is the canonical pattern. Untested backups don't exist; restore drills are the single most important resilience practice. Reference: Postgres §PITR.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sqldata-v0.6-076-seed-7c2a8e4b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-076
**bias_check_notes:** No bias.

---

### QUESTION 77: Design — 50TB Data Warehouse Architecture (Hard - Design)

**question_id:** QOR-SQLDATA-077
**skill_id:** senior-sqldata-077
**sub_skill_id:** dw-architecture
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Design a 50TB data warehouse for a mid-large enterprise (5K analysts, 200 dashboards, daily ETL of 500GB). Cover: storage engine, modeling layer, transformation, BI access, governance, and cost. (Limit: 800 words.)

**answer_key:**

**Stack: Snowflake or BigQuery (managed) for warehouse; dbt for transformation; Looker or Metabase for BI; Airflow for orchestration; data catalog (Atlan or DataHub).**

**Architecture (medallion).**

- **Bronze (raw):** Iceberg tables on S3, written by Fivetran / Airbyte / custom CDC. Immutable, schema-on-read. ~5TB/month accrual.
- **Silver (cleaned):** dbt-built models in Snowflake/BigQuery. Type-cast, deduped, joined at entity grain. Materialized as TABLEs.
- **Gold (analytics):** dbt-built marts (`fact_orders`, `dim_customer`, etc.) optimized for BI consumption. Star or snowflake schema.

**Why managed warehouse over self-managed.** At 50TB and 5K analysts, the operational cost of self-managing (Postgres, ClickHouse, Hadoop) far exceeds the managed premium. Optimize for analyst time + reliability; warehouse cost is 5-10% of total cost-of-data-team.

**Modeling.** Kimball star schema in gold layer. Surrogate keys for dimensions. SCD-Type-2 on dimensions where history matters (customer address). Conformed dimensions across marts.

**Transformation: dbt.** All transformation as code; PR-reviewed; tests baked in. dbt features used:
- `sources` for raw tables
- `models` (staging + intermediate + marts)
- `tests` (uniqueness, not_null, accepted_values, custom assertions)
- `snapshots` for SCD-Type-2
- `incremental` for big facts
- `exposures` linking dashboards to underlying models (downstream impact analysis)

**Orchestration.** Airflow daily DAG: extract → load (handled by Fivetran) → dbt run → dbt test → publish freshness metric. Failed test pages on-call data team. Critical-path SLA: gold layer fresh by 8 AM IST.

**BI / access.**

- Looker for executive dashboards (semantic layer; consistent metrics).
- Metabase for self-serve analyst exploration.
- Direct Snowflake/BQ access for power users via Hex or notebooks.
- Row-level security via warehouse-native (BQ "authorized views"; Snowflake row policies) keyed to tenant_id.

**Governance.**

- **Data catalog:** Atlan or DataHub. Integrated with dbt (auto-imports docs and lineage).
- **PII / classification:** column-level tagging; deny-by-default for sensitive cols, granted to specific roles.
- **Access:** role-based (analyst, exec, contractor) mapped to warehouse roles.
- **Quality SLAs:** per-mart uptime + freshness commitment; visible to consumers.
- **Cost monitoring:** weekly per-team query-cost report; nudges to optimize expensive dashboards.

**Cost.** ~$30-60K/month for 50TB on Snowflake at this analyst load (compute = 80%; storage = 20%). Optimization levers: warehouse right-sizing, materialization strategy (frequent dashboards → tables; one-off → views), result caching, query auto-suspend.

**One game-day failure mode.** "Upstream OLTP schema breaks bronze ingestion silently." Verify: daily freshness alarm fires; bronze tests catch unexpected nulls; ETL halts cleanly; on-call mobilizes within SLA. Many DW failures are silent decay — schema drift is the most common.

**Migration path** (if greenfield) — start with Snowflake + dbt + Fivetran for fastest time-to-value. Maturity: add Iceberg bronze for vendor independence.

**rubric:** 18-pt: medallion architecture w/ rationale (3) + managed-warehouse choice (2) + Kimball + SCD2 (3) + dbt as canonical transform (3) + orchestration + freshness SLA (2) + governance: catalog, PII, RBAC, cost (3) + game-day for silent failure mode (2).

**watermark_seed:** qorium-sqldata-v0.6-077-seed-2c4a8e9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-077
**bias_check_notes:** No bias.

---

### QUESTION 78: Code — Audit Trail with Triggers (Hard - Code)

**question_id:** QOR-SQLDATA-078
**skill_id:** senior-sqldata-078
**sub_skill_id:** audit-trigger
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Postgres docs §Triggers

**body:** Implement a generic audit trigger in Postgres that captures INSERT/UPDATE/DELETE on any table into an `audit_log` (JSONB before/after). Performant; doesn't double-write business logic.

**options:** []

**answer_key:**

```sql
CREATE TABLE audit_log (
  id BIGSERIAL PRIMARY KEY,
  table_name TEXT NOT NULL,
  operation CHAR(1) NOT NULL,   -- I/U/D
  user_id TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  before JSONB,
  after JSONB
);

CREATE INDEX ON audit_log (table_name, changed_at);

CREATE OR REPLACE FUNCTION audit_trigger() RETURNS TRIGGER AS $$
DECLARE
  v_user TEXT := current_setting('app.user_id', true);  -- set by app
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_log(table_name, operation, user_id, after)
    VALUES (TG_TABLE_NAME, 'I', v_user, to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Skip writing if no real change.
    IF to_jsonb(OLD) = to_jsonb(NEW) THEN RETURN NEW; END IF;
    INSERT INTO audit_log(table_name, operation, user_id, before, after)
    VALUES (TG_TABLE_NAME, 'U', v_user, to_jsonb(OLD), to_jsonb(NEW));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_log(table_name, operation, user_id, before)
    VALUES (TG_TABLE_NAME, 'D', v_user, to_jsonb(OLD));
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply to a table
CREATE TRIGGER audit_orders
AFTER INSERT OR UPDATE OR DELETE ON orders
FOR EACH ROW EXECUTE FUNCTION audit_trigger();
```

Key points: `to_jsonb(NEW)` automatically reflects schema; works for any table. `current_setting('app.user_id', true)` reads a session variable set by app via `SET LOCAL app.user_id = 'u_42'` per request — propagates user context into audit. AFTER triggers don't slow the original transaction's visibility. Skip-on-no-change reduces noise. For very high write volume, consider partitioning audit_log by month + automated archival to S3. Reference: Postgres docs §Triggers.

**rubric:** 12-pt: generic trigger function (3) + JSONB before/after (2) + user-context via session var (2) + skip-no-op-update optimization (2) + AFTER trigger semantics (1) + scaling note (partition / archive) (2).

**watermark_seed:** qorium-sqldata-v0.6-078-seed-4d8c2a9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-078
**bias_check_notes:** No bias.

---

### QUESTION 79: Casestudy — A/B Test Stats Pipeline Drift (Very Hard - Casestudy)

**question_id:** QOR-SQLDATA-079
**skill_id:** senior-sqldata-079
**sub_skill_id:** ab-test-drift-casestudy
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Product team reports A/B experiment results suddenly look implausible (effect size doubled overnight; significance from p=0.04 to p<0.001 in 24h). PMs about to ship the variant company-wide. As data lead, you have 4 hours to confirm or refute. Walk through. (Limit: 800 words.)

**answer_key:**

**Step 1 — buy time.** Tell PMs to hold the rollout pending validation; takes 30 seconds, saves the company from shipping an artifact.

**Step 2 — most-common drift causes (in order of frequency):**

1. **Bot/fraud traffic landed on one variant.** Diff bot-filter pass rate per variant. If bots disproportionately in control, control's metrics deflate, treatment looks better.
2. **Bucket assignment leaks.** Variant exposure in the data warehouse is computed from a join that broke (e.g., feature flag service log was incomplete; user fell into both arms). SRM (sample ratio mismatch) is the canonical detection: if randomized 50/50 but observed 53/47 with p<0.001 on chi-square, the assignment broke.
3. **Selection effect on outcome.** A bug routed users with successful checkouts to variant; control sees fewer successes. Look for behavioural pre-treatment differences between arms (should be 0).
4. **Outlier event.** A single big-spender or a botnet-scale event skewed the mean. Look at p99 or trimmed-mean instead of mean. Distribution histogram per arm.
5. **Pipeline change.** Ingest schema or sessionization logic shipped recently changed how events attribute. `git log -- experiments/` for recent changes.
6. **Time-of-day / segment imbalance.** Variant got more traffic during a high-converting hour. Segment breakdown: by hour, device, geography, new-vs-returning user.

**Step 3 — concrete checks (run in parallel):**

- SRM check: `SELECT variant, count(distinct user_id) FROM exposures GROUP BY variant`. Chi-square test. Flag if p < 0.001.
- Pre-treatment behavior diff: pick a metric independent of the treatment (page views the day BEFORE assignment). Compare across arms. Should be ~0 effect.
- Bot rate per arm: `SELECT variant, AVG(is_bot::int) FROM ...`. If different, fix bot filter and re-aggregate.
- Trimmed mean / median vs mean per arm.
- Time-window analysis: split last 24h vs prior 7 days. The "doubled effect" probably came from a specific window.
- Code audit: `git log` on the experiment + ingest stack, last 7 days.

**Step 4 — most likely finding (per the symptom set):** the experiment was running fine for 7 days; in the last 24h something changed in ingest or assignment. Three quick eliminators:
- Pre-treatment metrics differ across arms? → assignment broke.
- SRM violated? → assignment or exposure logging broke.
- Bot filter changed yesterday? → check that change.

**Step 5 — communicate findings.**

- If a real bug found: "DO NOT SHIP. Real effect unmeasurable until X is fixed; we'll re-aggregate after Y days of clean data."
- If artifact (selection bias, outlier): "The doubled effect is an artifact; corrected estimate is ~original (p=0.04, marginal). Recommend continued run, not ship."
- If confirmed effect (rare in this scenario): "Effect is real; the recent jump is likely a sampling bump. We've validated SRM, pre-treatment, bot rates. Conservative rec: ship to 25% and watch one more cycle."

**Process improvement (postmortem).**

- Add SRM check as automated daily test on every running experiment.
- Add "experiment metric tampering" alarm: if any metric moves >50% in <24h, page the data team.
- Pre-flight checklist for new experiments: pre-treatment baseline check, bot filter, exposure logging audit.
- Decision policy: experiments shipping to >10% require data-team sign-off. Above 50%, written write-up + executive review.

**Why this case matters.**

The boring answer (artifact) is right ~70% of the time when an experiment moves dramatically overnight. The reflexive "ship!" reaction loses real money on bad rollouts. The discipline is "validate before action," not "trust the dashboard."

**rubric:** 25-pt: hold the rollout first (3) + enumerates the 5-6 common drift causes (5) + SRM check (3) + pre-treatment baseline check (3) + bot rate / outliers (2) + time-window analysis (2) + code audit (2) + clear comms decision tree (3) + postmortem process improvements: automated SRM, alarms, decision policy (2).

**watermark_seed:** qorium-sqldata-v0.6-079-seed-3a8c5e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-079
**bias_check_notes:** No bias.

---

### QUESTION 80: Casestudy — Postgres → Citus → Spanner Migration Path (Very Hard - Casestudy)

**question_id:** QOR-SQLDATA-080
**skill_id:** senior-sqldata-080
**sub_skill_id:** postgres-citus-spanner
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored; CitusData/Microsoft + Cloud Spanner docs

**body:** A multi-tenant SaaS at 5TB Postgres is growing to 50TB and 100K writes/sec in 18 months. Current architecture: single primary + 2 read replicas. Roadmap options: (a) vertical scale + caching, (b) Citus (Postgres-native sharding), (c) Cloud Spanner. Recommend a path. (Limit: 800 words.)

**answer_key:**

**Recommendation: Citus (option b) for the next 2-3 years; revisit Spanner only if global multi-region strong consistency becomes a hard requirement.**

**Why not vertical scale (a).**

A single Postgres primary tops out around ~100TB and ~50K writes/sec on the largest cloud instances; you're approaching that ceiling with no headroom. Caching helps reads but not writes. A vertical-only path is a 6-12 month buy at most before re-architecting under pressure.

**Why Citus.**

- Multi-tenant SaaS shards beautifully on `tenant_id`. Citus distributes tables across worker nodes; co-located tables let JOINs stay local. Most queries unchanged.
- Postgres feature compatibility: triggers, partial indexes, pgvector, dbt ecosystem all work.
- Operational continuity: same SQL, same backup tooling, same monitoring. Engineers don't relearn.
- Microsoft acquired Citus and made the open-source version free + maintained. Or use Azure Database for PostgreSQL with hyperscale (Citus managed).

**Why not Spanner (yet).**

- Spanner is the right answer for **global strong consistency** (e.g., multi-region writes with serializable transactions). At single-region 50TB, that's not a requirement.
- TrueTime + atomic clocks introduce complexity; tooling ecosystem is smaller; learning curve is real (Spanner SQL is not Postgres SQL).
- Cost at this scale: typically 2-3x Postgres-on-RDS for workloads that don't need Spanner-level consistency.
- IF, in 24 months, you NEED active-active multi-region for regulatory or latency reasons, Spanner becomes worth re-evaluating.

**18-month plan.**

**Month 0-2: Foundation.**
- Audit query patterns. Identify cross-tenant queries that don't fit Citus's "co-located" model. Most multi-tenant SaaS has <5% of these (admin reporting, cross-tenant analytics) — those go to a separate read-replica or warehouse.
- Stand up a Citus dev cluster; mirror current schema; load a sample.
- Test the top 100 queries; profile latency.

**Month 2-4: Schema preparation.**
- Add `tenant_id` to every multi-tenant table that lacks it explicitly (it's usually present but sometimes implicit via FK chain).
- Distribute on `tenant_id`. Reference tables (small, joined to all) are replicated to all workers.
- Backfill; re-test query performance.

**Month 4-8: Dual-write to Citus.**
- Application writes to both Postgres primary and Citus dev cluster. Logical replication (`pg_logical`) for catch-up backfill.
- Analytics + a small slice of read traffic go to Citus first (canary).
- Address gaps: cross-shard queries that don't push down well; rewrite as multi-step or denormalize.

**Month 8-12: Production ramp.**
- Increase read traffic to Citus (10% → 50% → 90%). Monitor latency, error rate.
- Cross-shard transactions: rare in well-shaded tenant SaaS; for the few, design eventual-consistency or accept worker coordination cost.
- Failover drills with Citus coordinator.

**Month 12-15: Cutover.**
- Writes switch to Citus primary; old Postgres becomes shadow + backup.
- Run dual-write 30 days; reconcile drift.
- Decommission single Postgres.

**Month 15-18: Decommission + optimize.**
- Tune shard count (start with 32; rebalance later if needed).
- Add monitoring for cross-shard query proportion (alarm if >5%; means model drift).

**Risks.**

- **Cross-tenant queries.** The case where Citus hurts. Identify early; rewrite or push to warehouse.
- **Reference tables.** Must be small (replicated everywhere); growth requires planning.
- **Citus version upgrades** require coordinator + worker coordination. Plan carefully.
- **Backup is bigger.** Per-shard backup; tooling exists but operationally newer than single-DB.

**Cost.**

- Single Postgres at 50TB, 100K writes/sec on RDS: ~$30-50K/month. Often unable to fit in a single instance.
- Citus on Azure / self-hosted: ~$25-40K/month for similar perf — and crucially, scalable horizontally with no ceiling change.
- Spanner equivalent: ~$60-100K/month with multi-region complexity.

**Outcome target.**

50TB, 100K writes/sec, sub-10ms p99 on tenant-local queries. No more vertical-scale ceiling. Engineering still writes Postgres SQL.

**Trigger to reconsider Spanner.**

- Adding active-active multi-region writes (e.g., EU + US write paths).
- Strict global consistency required for regulatory reasons.
- 100TB+ growth where Citus operational complexity exceeds Spanner ops.

Until those triggers fire, Citus is the right answer.

**rubric:** 25-pt: rejects vertical-only with ceiling reasoning (3) + Citus over Spanner with multi-tenant sharding fit (4) + 18-month phased plan (4) + cross-tenant query handling (3) + dual-write + canary read + cutover sequencing (3) + Spanner re-evaluation triggers explicit (3) + risks: cross-tenant, reference tables, version upgrades, backup (3) + cost comparison (2).

**watermark_seed:** qorium-sqldata-v0.6-080-seed-4d2c8e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-080
**bias_check_notes:** No bias.

---

## End of QOR-SQLDATA-061..080.
