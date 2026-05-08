# Wave 1 Extension: Senior SQL/Data (QOR-SQLDATA-041..060)

**STATUS:** AI-drafted v0.6 EXTENSION (Senior SQL/Data scaling: 40→60 Qs). SME Lead validation pending. Reference baseline: PostgreSQL 16, BigQuery, Snowflake, dbt 1.8+, Apache Airflow 2.x, ClickHouse, Apache Iceberg.

---

## Extension: 20 NEW Questions (QOR-SQLDATA-041..060)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 41: Postgres EXPLAIN ANALYZE — Reading the Output (Easy)

**question_id:** QOR-SQLDATA-041
**skill_id:** senior-sqldata-041
**sub_skill_id:** explain-analyze
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** PostgreSQL Documentation §EXPLAIN

**body:**

`EXPLAIN ANALYZE` shows `Seq Scan on orders ... rows=1000000 (actual time=...rows=987654)`. Which is the FIRST thing to check?

**options:**

- A) Add a covering index immediately
- B) Compare the **planner estimated rows vs actual rows**. Large divergence (orders of magnitude) means stats are stale; run `ANALYZE`. Without good stats, the planner picks bad plans regardless of indexes
- C) Increase work_mem
- D) Switch to a different DB

**answer_key:**

B — Plan correctness depends on accurate row estimates. Stale or missing stats → wrong join order, wrong scan choice. `ANALYZE table_name` (or autovacuum) refreshes statistics. THEN reconsider indexes and plan shape. Reference: Postgres docs §EXPLAIN, §autovacuum.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-041-seed-3a8b7c2e
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-041
**bias_check_notes:** No bias.

---

### QUESTION 42: Index Selectivity — When NOT to Index (Easy)

**question_id:** QOR-SQLDATA-042
**skill_id:** senior-sqldata-042
**sub_skill_id:** index-selectivity
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Postgres docs §Indexes

**body:**

A `users.is_active` boolean column — when does indexing it HELP?

**options:**

- A) Always — every WHERE column should be indexed
- B) When the queried value is the SELECTIVE one (rare). E.g., 99% active, 1% inactive → index on `is_active=false` is useful (especially as a partial index `WHERE is_active=false`). Indexing the common value (`is_active=true`) is worse than seq scan
- C) Only with btree
- D) Never index booleans

**answer_key:**

B — Selectivity is the rule. Low-selectivity (returns >5-10% of rows) often beat by seq scan because random I/O > sequential. Partial indexes shine here: index only the rare value. Reference: Postgres docs §Indexes §Partial.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-042-seed-9c2e5a8b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-042
**bias_check_notes:** No bias.

---

### QUESTION 43: Window Functions vs GROUP BY (Easy)

**question_id:** QOR-SQLDATA-043
**skill_id:** senior-sqldata-043
**sub_skill_id:** window-vs-groupby
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** ANSI SQL §Window Functions

**body:**

You need each row's value AND each row's department average together. Best:

**options:**

- A) `GROUP BY` and `JOIN` back
- B) Window function: `SELECT *, AVG(salary) OVER (PARTITION BY dept) FROM emp` — keeps row grain, adds partition aggregate, single pass
- C) Subquery per row
- D) Materialize avg into temp table

**answer_key:**

B — Window functions compute per-row aggregates without collapsing rows. Single pass; planner can reuse hash partition. `GROUP BY + JOIN` works but is more verbose and slower. References: ANSI SQL standard §Window Functions; Postgres docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-043-seed-2b8c4e9a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-043
**bias_check_notes:** No bias.

---

### QUESTION 44: Postgres MVCC and VACUUM (Medium)

**question_id:** QOR-SQLDATA-044
**skill_id:** senior-sqldata-044
**sub_skill_id:** mvcc-vacuum
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Postgres docs §MVCC §Routine Vacuuming

**body:**

A heavily-updated Postgres table has 2 GB on disk but `pg_relation_size` shows only 200 MB of live data. Why and fix?

**options:**

- A) Bug
- B) MVCC creates new tuple versions on UPDATE; old "dead" tuples reside until VACUUM marks space reusable. Heavy churn + insufficient autovacuum = bloat. Fix: tune autovacuum thresholds for hot tables, or `VACUUM FULL` (locks!) / `pg_repack` (online) for one-time cleanup
- C) Indexes are doubled
- D) Need to switch to BRIN

**answer_key:**

B — Bloat from MVCC is the most common Postgres ops issue. `pg_repack` is the go-to for online compaction; `VACUUM FULL` requires AccessExclusiveLock (downtime). Per-table autovacuum tuning: lower `autovacuum_vacuum_scale_factor` for hot tables. Reference: Postgres docs §VACUUM.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-044-seed-7a3c8e2b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-044
**bias_check_notes:** No bias.

---

### QUESTION 45: CTE Materialization in Postgres 12+ (Medium)

**question_id:** QOR-SQLDATA-045
**skill_id:** senior-sqldata-045
**sub_skill_id:** cte-materialization
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Postgres 12 Release Notes

**body:**

In Postgres 12+, `WITH cte AS (SELECT ...) SELECT ...` planner behavior changed:

**options:**

- A) Identical to <12: always materializes
- B) Default is now `NOT MATERIALIZED` — planner inlines the CTE for optimization (push-down filters across boundary). Force materialization with `WITH cte AS MATERIALIZED (...)` (e.g., to break a non-deterministic function call's repetition)
- C) CTEs always materialize
- D) CTEs are deprecated

**answer_key:**

B — Pre-12 CTEs were fences (always materialized), often hurting performance. 12+ inlines unless you say `MATERIALIZED`. Use `MATERIALIZED` when the CTE has volatile functions (random, now()) or is used many times in the outer query and benefits from one-time eval. Reference: Postgres 12 Release Notes.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-045-seed-4e8b2c7a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-045
**bias_check_notes:** No bias.

---

### QUESTION 46: Locking — SELECT FOR UPDATE Behavior (Medium)

**question_id:** QOR-SQLDATA-046
**skill_id:** senior-sqldata-046
**sub_skill_id:** select-for-update
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Postgres docs §Explicit Locking

**body:**

```sql
BEGIN;
SELECT * FROM accounts WHERE id = 1 FOR UPDATE;
-- ... compute ...
UPDATE accounts SET balance = ... WHERE id = 1;
COMMIT;
```

This protects against:

**options:**

- A) Network failure
- B) **Lost update under concurrency.** `FOR UPDATE` row-locks until commit; concurrent transactions wait. Without it, two reads + two writes can lose one update (read-update race). Alternative: optimistic concurrency via `version` column with `WHERE version = ...`
- C) Disk failure
- D) Index bloat

**answer_key:**

B — Pessimistic locking primitive. Use sparingly (locks block other txn) and always with a clear timeout / SKIP LOCKED for queue patterns. Optimistic (version column) often better for high-concurrency UI flows. Reference: Postgres docs §Explicit Locking.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-046-seed-9b3e8c4a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-046
**bias_check_notes:** No bias.

---

### QUESTION 47: Skip Locked Pattern for Job Queues (Medium)

**question_id:** QOR-SQLDATA-047
**skill_id:** senior-sqldata-047
**sub_skill_id:** skip-locked-queue
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Postgres docs §FOR UPDATE SKIP LOCKED

**body:**

A poor-man's job queue in Postgres: workers poll for next job. Use:

**options:**

- A) `SELECT * FROM jobs WHERE status='queued' LIMIT 1 FOR UPDATE` — workers serialize on the lock
- B) `SELECT * FROM jobs WHERE status='queued' LIMIT 1 FOR UPDATE SKIP LOCKED` — workers grab different jobs without blocking each other; mark as in-progress in same transaction
- C) `SELECT * FROM jobs WHERE status='queued' LIMIT 1` (no lock) — workers race on update
- D) Use NOTIFY only

**answer_key:**

B — `SKIP LOCKED` lets each worker skip rows another worker has locked, enabling parallel job grabbing. The canonical Postgres job-queue idiom (used by `pg_queueit`, Oban (Elixir), QGIS, etc.). Combine with index on `(status, id)`. Reference: Postgres docs §SELECT.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-047-seed-3c8a5e9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-047
**bias_check_notes:** No bias.

---

### QUESTION 48: Postgres JSONB Indexing (Medium)

**question_id:** QOR-SQLDATA-048
**skill_id:** senior-sqldata-048
**sub_skill_id:** jsonb-gin
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Postgres docs §JSON Functions, §GIN Indexes

**body:**

Queries like `WHERE meta @> '{"region":"APAC"}'` on a JSONB column of 10M rows. Best index?

**options:**

- A) btree on `meta`
- B) **GIN index on `meta`** (or `meta jsonb_path_ops` opclass for smaller index, fewer ops). Supports containment `@>`, key-existence `?`, path queries
- C) BRIN
- D) Hash index

**answer_key:**

B — GIN inverted-index supports JSONB containment efficiently. `jsonb_path_ops` opclass is smaller & faster for `@>` only (most common). For specific-key queries, expression index on the extracted column may be even faster. Reference: Postgres docs §GIN.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-048-seed-1e8c4a7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-048
**bias_check_notes:** No bias.

---

### QUESTION 49: Date/Time — Timezone Storage Best Practice (Medium)

**question_id:** QOR-SQLDATA-049
**skill_id:** senior-sqldata-049
**sub_skill_id:** timestamptz-best-practice
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Postgres docs §Date/Time Types

**body:**

Storage type for "the moment something happened" in a global app:

**options:**

- A) `TIMESTAMP` (without time zone) — simplest
- B) `TIMESTAMPTZ` (with time zone). Stored as UTC internally; converts to session timezone on read. Single source of truth across regions; eliminates DST/timezone bugs
- C) Two columns: `timestamp` + `tz_name TEXT`
- D) Unix epoch in BIGINT

**answer_key:**

B — `TIMESTAMPTZ` is the canonical type for "moment in time." Use `TIMESTAMP` only for "wall-clock-on-this-day" semantics (rare; e.g., a recurring meeting at "9am local"). Storing tz separately is a footgun (loses DST awareness). Reference: Postgres docs §Date/Time.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-049-seed-6b3a8e2c
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-049
**bias_check_notes:** No bias.

---

### QUESTION 50: Range Queries — BRIN vs btree (Medium)

**question_id:** QOR-SQLDATA-050
**skill_id:** senior-sqldata-050
**sub_skill_id:** brin-vs-btree
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Postgres docs §BRIN

**body:**

A 100 GB time-series table is queried `WHERE created_at BETWEEN '...' AND '...'`. Which index minimizes storage AND speeds range scans?

**options:**

- A) btree on `created_at` (1-2 GB index)
- B) BRIN (Block Range INdex) on `created_at` — typically 100x smaller than btree (~10-20 MB); ideal when data is naturally clustered (insert-time order = query-time order)
- C) Hash index
- D) GIN

**answer_key:**

B — BRIN stores summary (min/max) per block range. For naturally-ordered columns (timestamps, sequence) it's a fraction the size of btree with comparable scan performance for large ranges. Bad for random / clustered-non-monotonic data. Reference: Postgres docs §BRIN.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-050-seed-8a3c2e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-050
**bias_check_notes:** No bias.

---

### QUESTION 51: Query — Top-N per group (Medium)

**question_id:** QOR-SQLDATA-051
**skill_id:** senior-sqldata-051
**sub_skill_id:** topn-per-group
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** ANSI SQL §Window Functions

**body:**

Top 3 highest-paid employees per department:

**options:**

- A) `GROUP BY dept LIMIT 3`
- B) `WITH ranked AS (SELECT *, ROW_NUMBER() OVER (PARTITION BY dept ORDER BY salary DESC) AS rn FROM emp) SELECT * FROM ranked WHERE rn <= 3`
- C) Self-join 3 times
- D) `LIMIT` per dept in subquery

**answer_key:**

B — `ROW_NUMBER` (or `RANK` for ties-included, `DENSE_RANK`) over partition is the canonical pattern. Postgres 13+ also has `LATERAL` join + `LIMIT` which can be faster on indexed `(dept, salary DESC)`. Reference: ANSI SQL §Window Functions.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-051-seed-4d8b2c9a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-051
**bias_check_notes:** No bias.

---

### QUESTION 52: Code — Idempotent UPSERT (Hard - Code)

**question_id:** QOR-SQLDATA-052
**skill_id:** senior-sqldata-052
**sub_skill_id:** upsert-on-conflict
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 10
**citation:** Postgres docs §INSERT ON CONFLICT

**body:**

Write a Postgres UPSERT for `daily_metrics(date, metric, value)`: increment `value` if `(date, metric)` exists; insert otherwise. Must be safe under concurrent writes.

**options:** []

**answer_key:**

```sql
-- precondition: UNIQUE INDEX on (date, metric)
INSERT INTO daily_metrics (date, metric, value)
VALUES ($1, $2, $3)
ON CONFLICT (date, metric)
DO UPDATE SET value = daily_metrics.value + EXCLUDED.value
RETURNING value;
```

Key points: ON CONFLICT requires a unique index/constraint; `EXCLUDED` row references the would-be-inserted values; the entire operation is atomic — no race window. RETURNING gives the post-update value. For "set-or-keep" semantics use `DO NOTHING` instead. Reference: Postgres docs §INSERT.

**rubric:** 10-pt: ON CONFLICT clause with target (3) + EXCLUDED reference (3) + arithmetic update for increment (2) + RETURNING (1) + mentions unique-index requirement (1).

**watermark_seed:** qorium-sqldata-v0.6-052-seed-2c9a8e4b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-052
**bias_check_notes:** No bias.

---

### QUESTION 53: Code — Recursive CTE: Org Hierarchy (Hard - Code)

**question_id:** QOR-SQLDATA-053
**skill_id:** senior-sqldata-053
**sub_skill_id:** recursive-cte
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** ANSI SQL §Recursive CTEs

**body:**

Given `employees(id, name, manager_id)`, write a recursive CTE returning all subordinates (direct + indirect) under a given manager_id, with depth.

**options:** []

**answer_key:**

```sql
WITH RECURSIVE subordinates AS (
  -- anchor: direct reports of given manager
  SELECT id, name, manager_id, 1 AS depth
  FROM employees
  WHERE manager_id = $1

  UNION ALL

  -- recursive: next level
  SELECT e.id, e.name, e.manager_id, s.depth + 1
  FROM employees e
  JOIN subordinates s ON e.manager_id = s.id
  WHERE s.depth < 50   -- safety limit; tune to org max depth
)
SELECT id, name, manager_id, depth
FROM subordinates
ORDER BY depth, name;
```

Key points: anchor query is the base set (direct reports); recursive query joins back to the CTE. UNION ALL (not UNION — duplicates aren't possible if data is acyclic; `UNION` would scan + dedupe wastefully). Depth bound prevents infinite recursion if data has cycles. References: ANSI SQL §Recursive CTEs; Postgres docs §WITH.

**rubric:** 12-pt: anchor + recursive structure (3) + correct join (3) + UNION ALL (2) + depth tracking (2) + cycle/depth safety (2).

**watermark_seed:** qorium-sqldata-v0.6-053-seed-7e3c8a4b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-053
**bias_check_notes:** No bias.

---

### QUESTION 54: Snowflake / BigQuery — Partition vs Cluster (Hard)

**question_id:** QOR-SQLDATA-054
**skill_id:** senior-sqldata-054
**sub_skill_id:** partition-vs-cluster
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** BigQuery / Snowflake Documentation

**body:**

In BigQuery (or Snowflake), what's the difference between partitioning and clustering?

**options:**

- A) Identical
- B) **Partitioning** physically splits data into separate files by a column (typically date). Queries with WHERE on the partition col read only matching partitions (cost reduction). **Clustering** orders data within each partition by additional columns; speeds filters/joins on those columns. Use both: partition by date, cluster by tenant_id
- C) Clustering replaces partitioning
- D) Partitioning is for indexes only

**answer_key:**

B — Partitioning is coarse-grained (file-level pruning); clustering is fine-grained (block-level ordering). Combined effect: scan only date-relevant files, then within those files, only blocks for relevant tenants. Reference: BigQuery / Snowflake docs.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-054-seed-9c4a7e2b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-054
**bias_check_notes:** No bias.

---

### QUESTION 55: dbt — Incremental Models (Hard)

**question_id:** QOR-SQLDATA-055
**skill_id:** senior-sqldata-055
**sub_skill_id:** dbt-incremental
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** dbt Documentation §Incremental Models

**body:**

A dbt model `fact_orders` aggregates 5 years of orders. Full refresh takes 4 hours. Best dbt strategy:

**options:**

- A) Full refresh nightly
- B) `materialized='incremental'` with `is_incremental()` filter on `updated_at >= (SELECT MAX(updated_at) FROM {{ this }})`. Only new/changed rows processed; full refresh on demand via `--full-refresh`. For late-arriving rows, use a lookback window (e.g., 7 days). For uniqueness, set `unique_key`
- C) Switch to materialized views
- D) Drop indexes during refresh

**answer_key:**

B — Incremental + lookback is the dbt canonical pattern for large fact tables. `unique_key` lets dbt MERGE/upsert. Schedule full-refresh weekly. Reference: dbt §Incremental Models.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-055-seed-3a8b4c7e
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-055
**bias_check_notes:** No bias.

---

### QUESTION 56: Apache Iceberg — Time Travel (Hard)

**question_id:** QOR-SQLDATA-056
**skill_id:** senior-sqldata-056
**sub_skill_id:** iceberg-time-travel
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Apache Iceberg Documentation

**body:**

Apache Iceberg's defining features over plain Parquet on S3 include:

**options:**

- A) Faster scans only
- B) ACID transactions, schema evolution (rename / drop columns safely), partition evolution (change partitioning without rewriting), time travel (query as of snapshot ID or timestamp), via metadata-tree files (manifests + manifest lists). Engines: Spark, Trino, Flink, Snowflake, Athena
- C) Replaces Parquet
- D) Only works on EMR

**answer_key:**

B — Iceberg (and Delta Lake, Hudi) bring data-warehouse semantics to data-lake storage. Time travel uses snapshot IDs; partition evolution avoids the "we partitioned by day, now we want hour" rewrite cost. Schema evolution by ID (not column position) means renames are safe. References: Apache Iceberg docs.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-056-seed-5e2c9a8b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-056
**bias_check_notes:** No bias.

---

### QUESTION 57: ClickHouse — Why It's Fast for Analytics (Hard)

**question_id:** QOR-SQLDATA-057
**skill_id:** senior-sqldata-057
**sub_skill_id:** clickhouse-perf
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** ClickHouse Documentation

**body:**

ClickHouse routinely outperforms Postgres for OLAP queries by 10-1000x. PRIMARY reason:

**options:**

- A) Written in C++
- B) Columnar storage (only scan needed columns, better compression), MergeTree engine with vectorized execution + SIMD, sparse primary key index, async insert batching. Trades transactional flexibility for analytic throughput
- C) Uses GPU acceleration
- D) Always in memory

**answer_key:**

B — Columnar + vectorized + LZ4/ZSTD column compression is the winning combination. ClickHouse is OLAP-optimized; weak at high-frequency single-row updates (use Postgres for that). Reference: ClickHouse architecture docs.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-sqldata-v0.6-057-seed-7c4a8e3b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-057
**bias_check_notes:** No bias.

---

### QUESTION 58: Design — Real-time Analytics Pipeline (Hard - Design)

**question_id:** QOR-SQLDATA-058
**skill_id:** senior-sqldata-058
**sub_skill_id:** realtime-pipeline-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:**

Design a real-time analytics pipeline for an e-commerce platform: 100K events/sec at peak (clicks, add-to-cart, checkout), dashboards refresh ≤30s lag, retain 2 years online. Cover ingest, transform, storage, query, monitoring, and one game-day failure. (Limit: 800 words.)

**answer_key:**

**Stack: Kafka → Flink (or ksqlDB) → ClickHouse for hot, Iceberg on S3 for cold; Grafana / internal BI on top.**

**Ingest.** Kafka cluster (3 brokers, replication=3). Topic per event family (`clicks`, `cart`, `orders`). Producer keyed by `user_id` for ordering within session.

**Transform.** Apache Flink for stateful stream processing — sessionization, dedup, enrichment via async I/O to user-profile service (cached). Outputs cleaned events to a downstream Kafka topic.

**Storage.**
- **Hot (90 days):** ClickHouse cluster with replicated MergeTree. Partitioned by day, ordered by (event_type, timestamp). Real-time inserts via Kafka engine table; periodic OPTIMIZE.
- **Cold (>90 days, up to 2 years):** Iceberg tables on S3, written by a Flink sink. Queried via Trino. 10x cheaper storage; slower queries.
- Hot/cold lifecycle: a daily job moves >90-day data from ClickHouse to Iceberg, then drops the partition.

**Query/dashboards.** Grafana points at ClickHouse for the last 90 days (hot path, sub-second). Cross-period queries (e.g., "Q4 2024 vs Q4 2025") use Trino over Iceberg + ClickHouse via federation. Or copy long-running aggregates into a materialized rollup table refreshed hourly.

**Latency budget for ≤30s lag.**
- Producer → Kafka: ~200ms
- Flink processing: ~1-5s (windowing + state updates)
- ClickHouse insert + visibility: ~1-3s
- Grafana refresh: 10-30s
Total: under 30s comfortably with headroom.

**Schema strategy.** Event Avro/Protobuf with schema registry (Confluent / AWS Glue). Forward + backward compat enforced. All consumers pin to schemas they understand.

**Monitoring.**
- Kafka: lag per consumer group; under-replicated partitions; broker disk.
- Flink: checkpoint duration; backpressure; throughput per operator.
- ClickHouse: insert rate, merge backlog, query p99.
- Pipeline-level: end-to-end event freshness gauge ("event timestamp to ClickHouse insert"); page if >2 minutes.

**Schema evolution.** New event field added: producers add it with default; consumers ignore unknown fields (Avro/Protobuf). For breaking changes (rename/drop), use the Iceberg-like rule: new column ID, dual-emit during migration, then deprecate.

**Backfill.** Kafka retention 7 days. For older replays: read from Iceberg, write through Flink with a `--bootstrap` flag that bypasses dedup state. Tested before needed.

**Game-day failure I'd test.** "ClickHouse cluster degrades — one of three nodes goes down at peak." Verify: replication keeps queries working; Flink sink degrades gracefully (uses retry + DLQ); end-to-end freshness alarm fires within SLA; recovery on node restart with no data loss. Many teams build this stack and never test the partial-failure case until it happens in prod.

**Cost.** $5-15K/month for 100K events/sec at 90-day hot retention is reasonable. Iceberg cold tier dominates as we approach 2 years; lifecycle policies to S3 Glacier IA for >18 months halve that.

**Why not Druid/Pinot.** Apache Druid and Pinot are valid alternatives; pick by team familiarity. ClickHouse has stronger SQL, Druid has better real-time-rollup ergonomics. At 100K events/sec all three work; engineering cost matters more than benchmark differences.

**rubric:** 18-pt: Kafka -> Flink/ksqlDB -> ClickHouse + Iceberg architecture (4) + hot/cold split with rationale (3) + schema-registry + Avro/Protobuf compat (2) + latency budget breakdown (3) + monitoring with end-to-end freshness (2) + game-day failure with concrete recovery test (2) + cost-aware lifecycle policy (2).

**watermark_seed:** qorium-sqldata-v0.6-058-seed-2c8a4e9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-058
**bias_check_notes:** No bias.

---

### QUESTION 59: Casestudy — Postgres OLTP under Sudden Lock Storm (Very Hard - Casestudy)

**question_id:** QOR-SQLDATA-059
**skill_id:** senior-sqldata-059
**sub_skill_id:** lock-storm-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:**

A Postgres OLTP DB serving an Indian banking app. At 11:30 AM IST, p99 query time jumps from 50ms to 8s. Lots of `idle in transaction` and `waiting for lock` in pg_stat_activity. CPU normal, no replication lag. Walk through your triage and root-cause. (Limit: 800 words.)

**answer_key:**

**Step 1 — orient.** `pg_stat_activity` filtered to `state='active' OR state='idle in transaction'`, ordered by `xact_start` ascending. Long-running transactions at the top are the suspects.

**Step 2 — identify the blocker.** Use the canonical blocking-locks query:
```sql
SELECT blocked.pid AS blocked_pid, blocked.query AS blocked_query,
       blocking.pid AS blocking_pid, blocking.query AS blocking_query,
       blocking.application_name, blocking.usename
FROM pg_stat_activity blocked
JOIN pg_locks bl ON bl.pid = blocked.pid AND NOT bl.granted
JOIN pg_locks bg ON bg.locktype = bl.locktype
                AND bg.relation IS NOT DISTINCT FROM bl.relation
                AND bg.granted
JOIN pg_stat_activity blocking ON blocking.pid = bg.pid;
```

Often a single long-running transaction is blocking dozens.

**Step 3 — most likely root causes.**
1. **A long ad-hoc query/transaction** (analyst running `SELECT *` from a huge table inside a transaction). Mitigation: kill it (`SELECT pg_cancel_backend(pid)`).
2. **A migration / DDL during business hours** — e.g., `ALTER TABLE x ADD COLUMN y NOT NULL DEFAULT ...` requires AccessExclusiveLock and rewrites the table; blocks all writes meanwhile. Common screw-up.
3. **A code path that opens a transaction and does network I/O before commit.** Connection-pool contention plus held locks.
4. **A SELECT FOR UPDATE deadlocking with another flow.** `pg_stat_database.deadlocks` confirms.

**Step 4 — mitigation order (during the incident):**
- Identify the blocker. If safe, `pg_cancel_backend(pid)` (graceful) or `pg_terminate_backend(pid)` (forceful).
- If a migration is the blocker: roll it back if you can, OR set `lock_timeout` on the migration session (`SET LOCAL lock_timeout = '5s'`) and abort if it can't acquire fast.
- For category-3 (network I/O in transaction): hot-fix is to set `idle_in_transaction_session_timeout` in postgresql.conf to 30s; reload config (`pg_reload_conf()`). Stuck transactions auto-killed.

**Step 5 — confirm recovery.** p99 query latency back to <100ms; `idle in transaction` drops; `pg_stat_activity` quiet. Watch for 15 minutes before declaring resolved.

**Permanent fixes (next-day work):**

- **Migrations:** ALL DDL via `pg_squeeze` / `pg_repack` or zero-downtime patterns (`ALTER TABLE ADD COLUMN ... DEFAULT NULL` is fast in 11+; `SET NOT NULL` after backfill). Add `lock_timeout` to migration tooling.
- **Code path:** make application code use `async with session.begin():` style with no I/O inside the transaction; refactor any handler that calls external services mid-transaction.
- **Monitoring:** alarm on `idle in transaction` rows > 5 OR transaction age > 30s. Earlier-warning signal than user-facing latency.
- **PgBouncer in transaction-pooling mode** — limits the blast radius of a single bad query.
- **Statement timeout** — set in role/db (`statement_timeout = '30s'` for app role) to bound runaway queries.

**Five-Whys postmortem.**

1. p99 latency spiked at 11:30. WHY → lock contention on `accounts` table.
2. WHY → a migration was running. WHY → it added a NOT NULL column with a slow DEFAULT. WHY → reviewer didn't catch the rewrite implication. WHY → migration patterns weren't documented as a checklist for engineers.

**Customer comms.** Indian banking — regulatory implications. Send a transparent incident summary to compliance team within SLA (often 4 hours for severity-2). Customer SMS/email if SLA breach.

**Drill commitment.** Game-day a "long DDL during business hours" twice a year; verify the timeout-and-bail pattern works.

**rubric:** 25-pt: blocking-lock query first (3) + correct triage order (4) + identifies likely root causes (5) + mitigation order with idle_in_transaction_timeout (4) + permanent fixes: migrations, app code, monitoring, statement_timeout (5) + five-whys postmortem with process gap (2) + regulatory comms (2).

**watermark_seed:** qorium-sqldata-v0.6-059-seed-7e3c4a8b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-059
**bias_check_notes:** No bias. India banking context but the pattern is universal.

---

### QUESTION 60: Casestudy — Migrating MongoDB to Postgres (Very Hard - Casestudy)

**question_id:** QOR-SQLDATA-060
**skill_id:** senior-sqldata-060
**sub_skill_id:** mongo-to-postgres-migration
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored; well-documented migrations (Bemmu, Stack Overflow)

**body:**

A 5-year-old SaaS app uses MongoDB for the primary OLTP store (~500 GB, 30 collections). Operational pain: ad-hoc transactions across collections are gymnastics; ad-hoc analytical queries are painful; the on-call team is 60% Postgres-fluent, 20% Mongo. CTO decides: migrate to Postgres in 6 months without downtime. Plan it. (Limit: 800 words.)

**answer_key:**

**Strategy: Dual-write with shadow-read validation, then cutover. 6-month plan.**

**Phase 0 (Week 1-2): Schema design.**

- Map each Mongo collection to Postgres tables. For most: 1:1 collection→table; nested arrays → child tables OR JSONB columns based on query patterns.
- For deeply nested rarely-queried metadata: keep as JSONB. For frequently joined sub-objects: normalize into child tables.
- Decide on primary keys: Mongo `_id` ObjectIds are 12-byte; map to BIGSERIAL + keep `mongo_id BYTEA` for cross-system lookup.
- Indexes: replicate the Mongo indexes that have query traffic (check via `db.collection.aggregate({$indexStats:{}})`).

**Phase 1 (Week 3-6): Schema migration tooling.**

- Set up a side-by-side Postgres cluster.
- Initial bulk load: `mongoexport` → JSONL → Postgres `COPY` from JSONL (parse to columns + JSONB residual). Tools: `pgloader`, custom Python with `psycopg`, or `mongo-to-postgres` open-source.
- Validate: row counts match; spot-check 1000 random docs round-trip.

**Phase 2 (Week 7-14): Dual-write.**

- Application code wraps writes: every mutation writes to BOTH Mongo (primary) and Postgres (shadow). On Postgres failure, log + alert; do NOT fail the request initially (production stays on Mongo). Postgres fall-behind is acceptable temporarily.
- Reads continue from Mongo.
- Build a daily reconciler that diffs Mongo vs Postgres, reports drift counts. Drift > 0.1% blocks cutover.
- Address sources of drift: race conditions between dual writes (use a write-id / message-bus pattern instead of "double-write in app code" if drift is high), Mongo TTL expirations not mirrored, etc.

**Phase 3 (Week 15-20): Shadow read.**

- Each read flips a coin (10% then 50% then 90%): hits both Mongo and Postgres, compares, returns Mongo result. Differences logged. Targets the per-query correctness — if a specific query returns different data on Postgres, you have a schema bug to fix.
- This stage is where most migrations find subtle issues: nullability mismatches, datetime precision, ObjectId/BigInt collisions, etc.

**Phase 4 (Week 21-22): Cutover.**

- Reads switch to Postgres-primary, Mongo-shadow.
- Watch for SLA, error rate, latency. Fall-back path: feature flag flips reads back to Mongo in seconds.
- Run dual-read for 2 weeks; if green, switch writes too: Postgres primary, Mongo shadow.

**Phase 5 (Week 23-24): Decommission.**

- Stop writes to Mongo. Keep read-only mongo for 1 month (compliance/audit).
- Then snapshot to S3, drop Mongo cluster.

**Risks.**

- **Mongo's flexible schema → Postgres rigidity.** Some collections have wildly inconsistent docs; need cleanup before migration. Catch with a schema-profiling job before phase 0.
- **Performance under joins that didn't exist before.** Postgres queries hitting tables that were "denormalized in Mongo" may need indexes that didn't exist before. Plan capacity 30% above projection.
- **Multi-document transactions.** Some flows that were "best effort" under Mongo (no cross-doc transactions in older versions) may need explicit transaction wrappers in Postgres.
- **Tooling and skills.** Mongo-fluent engineers retrain on EXPLAIN, indexes, vacuum. 1-month onboarding.

**Validation.**

- 30-day reconciler with zero drift before cutover.
- Shadow-read with <0.01% mismatch.
- 2-week dual-read post-cutover with SLA met.
- All write paths covered by integration tests.

**Outcome.**

Postgres primary; team can write SQL for ad-hoc queries; existing JOINs no longer cross-collection gymnastics; on-call easier (Mongo-specific tooling not required). Cost likely lower (Mongo Atlas ≥ Postgres at this size).

**rubric:** 25-pt: dual-write + shadow-read + cutover phasing (4) + schema mapping decisions (normalize vs JSONB) (3) + bulk-load + reconciler (3) + identifies dual-write drift sources + mitigations (3) + shadow-read percentage ramp (2) + cutover with feature-flag fall-back (3) + decommissioning + retention (1) + risks: schema flex, transactions, perf, skills (4) + validation gates (2).

**watermark_seed:** qorium-sqldata-v0.6-060-seed-3a8c2e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-060
**bias_check_notes:** No bias.

---

## End SQL/Data 041-060.
