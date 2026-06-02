# Wave-1-SQL-Data-Extension-041-060.md

**STATUS:** AI-drafted v0.6 EXTENSION (SQL/Data third-pass scaling: 40→60 Qs). SME Lead validation pending. NOT for external delivery. Reference baseline: PostgreSQL 16+; Snowflake/BigQuery/Databricks unified analytics; modern data stack 2026.

---

## Extension: 20 NEW SQL/Data Questions (QOR-SQL-041 through QOR-SQL-060)

Extends Sample Pack v0.5 + Wave-1 Q011-040 with real-time streaming, data lakehouse architecture, data quality/observability, MLOps feature stores, advanced DBA patterns (multi-tenancy, RLS, scaling), and advanced analytics (time-series, cohorts, funnels, A/B testing). Difficulty distribution: 4 Easy, 9 Medium, 5 Hard, 2 Very Hard.

**Skill coverage (new sub-skills, avoiding Q001-040 duplication):**
1. Real-time + streaming SQL (Apache Flink, Materialize, ksqlDB, CDC, exactly-once vs at-least-once)
2. Data lakehouse architecture (Iceberg vs Delta Lake vs Hudi; time-travel; schema evolution; partition pruning)
3. Data quality + observability (Great Expectations, Soda, data contracts, lineage, data SLA)
4. MLOps + feature stores (Feast, Vertex AI, point-in-time correct training data)
5. Database administration advanced (multi-tenancy, Postgres RLS, scaling decisions, read replicas)
6. SQL for advanced analytics (time-series functions, cohorts, funnels, A/B testing, LTV)

---

### QUESTION 41: Apache Flink SQL Streaming Joins with Watermarks (Medium MCQ)

**question_id:** QOR-SQL-041
**skill_id:** senior-sql-041
**sub_skill_id:** sql-streaming-flink-joins
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Apache Flink SQL Documentation §8.3 (Streaming Joins); Watermark Semantics

**body:**

In Apache Flink SQL, you stream two events:
- `candidate_events` (candidate_id, event_type, event_time)
- `assessment_events` (assessment_id, candidate_id, score, event_time)

You want a 10-second tumbling window join: for each candidate, emit (candidate_id, event_count, avg_score) every 10 seconds. Which approach is correct?

```sql
SELECT
  ce.candidate_id,
  COUNT(ce.candidate_id) as event_count,
  AVG(ae.score) as avg_score
FROM candidate_events ce
JOIN assessment_events ae
  ON ce.candidate_id = ae.candidate_id
  AND ce.event_time BETWEEN ae.event_time - INTERVAL '5' SECOND AND ae.event_time + INTERVAL '5' SECOND
GROUP BY TUMBLE_TIME(ce.event_time, INTERVAL '10' SECOND), ce.candidate_id;
```

**options:**

- A) Correct; the interval join with BETWEEN and TUMBLE_TIME combines windowing and join semantics
- B) Incorrect; Flink SQL does not support BETWEEN in join ON clauses
- C) Incorrect; watermark alignment requires explicit WATERMARK clause on both streams first
- D) Incorrect; you must use `JOIN ... ON ce.candidate_id = ae.candidate_id WITHIN (INTERVAL '5' SECOND)` syntax

**answer_key:**

C (with clarification: A is partially correct but incomplete; best practice requires explicit watermark declaration). The syntax shown is valid (interval join + tumble), but in production Flink, you must define watermarks on both input streams via `WATERMARK FOR event_time AS event_time - INTERVAL '3' SECOND` to avoid completeness issues. Without watermarks, the join window semantics are undefined. Option D's "WITHIN" syntax is legacy/non-standard. References: Flink Interval Joins; Watermark Strategy.

**rubric:**

MCQ; correct = 5 points (identifies need for watermarks), partial = 2 points (syntax is valid but watermark omission noted), incorrect = 0.

**watermark_seed:** qorium-sql-v0.6-041-seed-3f1e7a2b
**variant_seed:** qorium-sql-v0.6-2026-05-03-041
**bias_check_notes:** No bias. Streaming SQL advanced pattern.

---

### QUESTION 42: Materialize Streaming Materialized Views (Medium MCQ)

**question_id:** QOR-SQL-042
**skill_id:** senior-sql-042
**sub_skill_id:** sql-materialize-streaming-views
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Materialize Documentation §Materialized Views; Streaming SQL

**body:**

Materialize is a streaming SQL database that maintains live materialized views from Kafka/Postgres CDC streams. You create:

```sql
CREATE MATERIALIZED VIEW candidate_score_summary AS
SELECT candidate_id, COUNT(*) as attempts, AVG(score) as avg_score
FROM assessment_responses
GROUP BY candidate_id;
```

When a new assessment_response arrives, what happens to candidate_score_summary?

**options:**

- A) The view is NOT updated; you must manually REFRESH the view
- B) The view is instantly updated in-memory; downstream queries always see current state (incremental streaming)
- C) The view is updated after a 5-second micro-batch delay
- D) The view triggers a full recomputation, blocking reads for 100-500ms

**answer_key:**

B — Materialize continuously ingests changes (via CDC from Postgres or direct Kafka topics) and incrementally updates materialized views. Unlike traditional databases, Materialize views are "living" — they update nanosecond-to-millisecond latency as source data changes. No REFRESH needed. A is false (auto-update happens). C/D are false (no batching or blocking). This enables sub-second dashboards. References: Materialize Architecture; Incremental Computation.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sql-v0.6-042-seed-7c2e5d1f
**variant_seed:** qorium-sql-v0.6-2026-05-03-042
**bias_check_notes:** No bias. Streaming view semantics.

---

### QUESTION 43: Apache Iceberg Time-Travel Queries & Schema Evolution (Hard Code)

**question_id:** QOR-SQL-043
**skill_id:** senior-sql-043
**sub_skill_id:** sql-lakehouse-iceberg-time-travel
**format:** CODE
**difficulty_b:** 1.2
**discrimination_a:** 1.7
**expected_duration_minutes:** 8
**citation:** Apache Iceberg Documentation §Querying Tables; Time Travel; Schema Evolution

**body:**

Iceberg table `fact_responses` has schema:
```
candidate_id INT, assessment_id INT, score INT, response_time TIMESTAMP
```

On 2026-04-29 at 14:00:00 UTC, you add a column: `domain STRING`. On 2026-04-30 at 09:30:00 UTC, you add: `feedback TEXT`.

Write a time-travel query that:
1. Reads `fact_responses` **as of 2026-04-30 23:59:59 UTC** (after both schema changes)
2. Only includes rows inserted **before** the first schema change (2026-04-29 14:00:00)
3. Explains why the query still works even though the old rows lack the new columns

**expected_answer:**

```sql
SELECT
  candidate_id,
  assessment_id,
  score,
  response_time,
  domain,
  feedback
FROM fact_responses
  FOR SYSTEM_TIME AS OF '2026-04-30 23:59:59 UTC'
WHERE response_time < '2026-04-29 14:00:00 UTC';
```

**explanation:**
- `FOR SYSTEM_TIME AS OF 'timestamp'` reads the table state at a specific snapshot
- Even though new rows after 2026-04-29 14:00:00 have `domain` and `feedback` values, rows inserted before that have NULL for those columns (Iceberg auto-fills with NULL for missing columns in older rows)
- Iceberg's columnar Parquet format stores schema metadata per snapshot; old rows can be read through new schema safely
- This pattern enables audit trails, point-in-time analysis, and schema-evolution resilience

**rubric:**

Code; 5 points if both query syntax (FOR SYSTEM_TIME) and NULL-filling explanation are correct. Deduct 1pt if syntax is slightly off (e.g., wrong timestamp format). Deduct 2pts if explanation misses NULL semantics or assumes schema mismatch fails.

**watermark_seed:** qorium-sql-v0.6-043-seed-9a4f1c2e
**variant_seed:** qorium-sql-v0.6-2026-05-03-043
**bias_check_notes:** No bias. Lakehouse time-travel pattern.

---

### QUESTION 44: Delta Lake Partition Pruning vs Parquet Column Pruning (Medium MCQ)

**question_id:** QOR-SQL-044
**skill_id:** senior-sql-044
**sub_skill_id:** sql-lakehouse-delta-pruning
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Delta Lake Documentation §Partitioning; Databricks Parquet Pruning

**body:**

Your Delta Lake table is partitioned by `date_created` (YYYY-MM-DD). Parquet files store columns: candidate_id, score, assessment_type, date_created.

Query: `SELECT score FROM table WHERE date_created = '2026-05-01' AND assessment_type = 'coding'`

Which pruning happens first?

**options:**

- A) Partition pruning (date_created) → only reads partitions for 2026-05-01; then column pruning (score only, drop other columns)
- B) Column pruning (score) → then partition pruning (date_created); order doesn't matter
- C) Both happen simultaneously; optimizer chooses the order
- D) Partition pruning only; column pruning requires explicit column selection in the scan operator

**answer_key:**

A — Query planner applies **partition pruning first** (filter out entire partition directories that don't match 2026-05-01), then **column pruning** (within those partitions, read only the `score` column from Parquet). This order minimizes I/O: skip 99% of data by partition, then skip unused columns. B is false (order matters for I/O optimization). C/D are false (planner is not simultaneous; column pruning is automatic). References: Delta Lake Partitioning; Parquet Pruning Optimizer.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sql-v0.6-044-seed-2b5e3a7f
**variant_seed:** qorium-sql-v0.6-2026-05-03-044
**bias_check_notes:** No bias. Lakehouse optimization pattern.

---

### QUESTION 45: Great Expectations Data Contracts (Easy MCQ)

**question_id:** QOR-SQL-045
**skill_id:** senior-sql-045
**sub_skill_id:** sql-data-quality-contracts
**format:** MCQ
**difficulty_b:** -0.5
**discrimination_a:** 1.2
**expected_duration_minutes:** 3
**citation:** Great Expectations Documentation §Data Contracts; Implicit & Explicit Contracts

**body:**

A "data contract" in Great Expectations defines:

**options:**

- A) A written legal agreement between data producer and consumer about SLAs and uptime
- B) A set of automated expectations (column types, value ranges, uniqueness, freshness) that datasets must satisfy; violations trigger alerts
- C) A database schema constraint (PRIMARY KEY, FOREIGN KEY, CHECK) enforced at ingestion
- D) A custom Python class that validates row-level business logic only

**answer_key:**

B — A data contract in the data engineering sense (Great Expectations, Soda, etc.) is a machine-readable specification of data quality rules: "candidate_id must be NOT NULL and > 0", "score must be in [0, 100]", "assessment_date must be within 7 days of today". Violations trigger alerts/pipeline failures. A is legal/organizational (different scope). C is schema constraints (subset of contracts, but not the full scope). D is overly narrow (contracts include schema, not just row logic). References: Great Expectations Contracts; Data Quality Posture.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sql-v0.6-045-seed-5f3c2d1a
**variant_seed:** qorium-sql-v0.6-2026-05-03-045
**bias_check_notes:** No bias. Data quality fundamentals.

---

### QUESTION 46: Data Lineage & OpenLineage (Medium MCQ)

**question_id:** QOR-SQL-046
**skill_id:** senior-sql-046
**sub_skill_id:** sql-data-observability-lineage
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** OpenLineage Specification; Data Lineage Standards

**body:**

You run: `INSERT INTO candidate_scores SELECT candidate_id, AVG(score) FROM assessments GROUP BY candidate_id;`

A data lineage tool (e.g., Marquez using OpenLineage) tracks this. What does it capture?

**options:**

- A) Only the INSERT operation; source table (assessments) is not tracked
- B) Lineage edge: assessments → candidate_scores; captures that candidate_scores depends on assessments
- C) Lineage edges: assessments → (aggregation job) → candidate_scores; includes the transformation step
- D) No lineage captured; you must manually annotate the SQL with /* LINEAGE: ... */ comments

**answer_key:**

C — Modern lineage tools (OpenLineage protocol) capture the **full DAG**: source → transformation → destination. Here, "assessments" flows through a GROUP BY aggregation job to produce "candidate_scores". This enables root-cause analysis ("if candidate_scores is stale, which step failed?") and impact analysis ("if assessments schema changes, which downstream tables break?"). Option B captures only the edge (partial). A/D are false (automated tracking is standard). References: OpenLineage Standard; Marquez.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sql-v0.6-046-seed-8c1f7a3d
**variant_seed:** qorium-sql-v0.6-2026-05-03-046
**bias_check_notes:** No bias. Data observability pattern.

---

### QUESTION 47: Feast Feature Store & Point-in-Time Correctness (Hard Code)

**question_id:** QOR-SQL-047
**skill_id:** senior-sql-047
**sub_skill_id:** sql-mlops-feature-store-pit
**format:** CODE
**difficulty_b:** 1.3
**discrimination_a:** 1.8
**expected_duration_minutes:** 8
**citation:** Feast Feature Store Documentation §Point-in-Time Correctness; Training Data Construction

**body:**

You're building a "predict-hire" model. Training data spans Jan 2026–Apr 2026. For each candidate, you need:
- `avg_score` (average assessment score up to the training label date, NOT including future scores)
- `total_attempts` (count of assessments up to the label date)
- `domain_coverage` (number of unique domains assessed up to the label date)

Naive approach: `SELECT candidate_id, AVG(score), COUNT(*), COUNT(DISTINCT domain) FROM assessments WHERE assessment_date <= label_date GROUP BY candidate_id;`

Why is this **wrong**, and how does Feast fix it?

**expected_answer:**

The naive approach creates **data leakage**: if you compute features for a label_date in March, you use the *current* historical state of assessments, which includes new assessments added in April (after the label_date). At training time, the model sees future data.

**Feast's point-in-time correct approach:**

1. Register assessment data as a feature view with event_timestamp column:
```sql
CREATE FEATURE VIEW candidate_assessment_features AS
SELECT
  candidate_id,
  event_timestamp,
  assessment_date,
  AVG(score) OVER (PARTITION BY candidate_id ORDER BY assessment_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as avg_score,
  COUNT(*) OVER (PARTITION BY candidate_id ORDER BY assessment_date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as total_attempts
FROM assessments;
```

2. At training time, join on both `candidate_id` AND `event_timestamp <= label_date`:
```sql
SELECT fv.avg_score, fv.total_attempts
FROM candidate_assessment_features fv
INNER JOIN labels ON fv.candidate_id = labels.candidate_id
WHERE fv.event_timestamp <= labels.label_date;
```

This ensures features are computed *as they were* at the label_date, not the current state.

**rubric:**

Code; full 5 points if both the data leakage problem and Feast's event_timestamp-based solution are explained. Deduct 1–2 pts if the explanation conflates "future data" with incorrect reasoning. Deduct if SQL syntax is significantly wrong.

**watermark_seed:** qorium-sql-v0.6-047-seed-1d3e4c2f
**variant_seed:** qorium-sql-v0.6-2026-05-03-047
**bias_check_notes:** No bias. MLOps pattern.

---

### QUESTION 48: Multi-Tenancy in Postgres (Easy MCQ)

**question_id:** QOR-SQL-048
**skill_id:** senior-sql-048
**sub_skill_id:** sql-dba-multi-tenancy-patterns
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.3
**expected_duration_minutes:** 4
**citation:** Postgres Documentation §20.10 (Row Security); Multi-Tenancy Patterns

**body:**

Three common multi-tenancy architecture patterns in Postgres:

1. Shared database, shared schema → rows include `tenant_id` column
2. Shared database, dedicated schemas per tenant → each schema is isolated
3. Dedicated database per tenant → completely separate Postgres instance

For QOrium (3 customers, moderate data), which is the best balance of cost and operational complexity?

**options:**

- A) Pattern 1 (shared DB, shared schema); simplest, lowest cost, but requires RLS or app-layer filtering
- B) Pattern 2 (shared DB, dedicated schemas); good isolation, cleaner RBAC, moderate overhead
- C) Pattern 3 (dedicated DB per tenant); maximum isolation and compliance, but 3x operational overhead
- D) Hybrid: Pattern 1 for "read-heavy" tenants (Q1, Q2) + Pattern 2 for "write-heavy" tenants (Q3)

**answer_key:**

B — For 3 customers with moderate data, Pattern 2 (shared DB, dedicated schemas) strikes the right balance. Each schema is logically isolated (CREATE SCHEMA customer_a, customer_b, customer_c), so RBAC is clean (customer_a role only sees customer_a schema). Overhead is minimal (small per-schema memory footprint). Pattern 1 requires app-layer or RLS discipline (data leak risk if filtering is missed). Pattern 3 is overkill for 3 customers (3x Postgres licenses, 3x replication, 3x backup complexity). References: Postgres Multi-Tenancy; Schema-Based Isolation.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sql-v0.6-048-seed-4a2d1e7f
**variant_seed:** qorium-sql-v0.6-2026-05-03-048
**bias_check_notes:** No bias. Multi-tenancy fundamentals.

---

### QUESTION 49: Postgres Row-Level Security (RLS) Policies (Hard Code)

**question_id:** QOR-SQL-049
**skill_id:** senior-sql-049
**sub_skill_id:** sql-dba-postgres-rls
**format:** CODE
**difficulty_b:** 1.1
**discrimination_a:** 1.7
**expected_duration_minutes:** 8
**citation:** Postgres Documentation §5.8 (Row Security Policies); RLS Enforcement

**body:**

You have table `assessments` (assessment_id, candidate_id, tenant_id, score). You want to enforce RLS so:
- Role `tenant_a_user` can only see rows where `tenant_id = 'tenant_a'`
- Role `admin` can see all rows (bypass RLS)

Write SQL to:
1. Enable RLS on the `assessments` table
2. Create a policy that allows `tenant_a_user` to SELECT only tenant_a rows
3. Ensure `admin` role bypasses RLS

**expected_answer:**

```sql
-- 1. Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- 2. Create a permissive policy for tenant_a_user
CREATE POLICY tenant_a_isolation ON assessments
  FOR SELECT
  USING (tenant_id = 'tenant_a' OR current_user = 'admin');

-- 3. Grant permissions
GRANT SELECT ON assessments TO tenant_a_user;
GRANT SELECT ON assessments TO admin;

-- 4. (Optional) For admin to bypass, set role to bypass RLS
ALTER ROLE admin SET row_security = OFF;  -- OR use SECURITY DEFINER functions
```

**explanation:**
- `ENABLE ROW LEVEL SECURITY` activates RLS for the table
- `CREATE POLICY ... FOR SELECT USING (...)` defines which rows are visible
- The USING clause `(tenant_id = 'tenant_a' OR current_user = 'admin')` allows tenant_a rows for everyone, OR all rows for admin
- Admin can also bypass via `ALTER ROLE ... row_security = OFF`, but this is coarse-grained; fine-grained approach is to include the admin check in the policy itself
- If the policy is not met, rows are filtered out silently (no error)

**rubric:**

Code; 5 points for complete solution (RLS enable + policy + admin bypass). Deduct 1–2 pts if admin bypass is missing or inconsistent. Deduct if USING clause logic is inverted or incomplete.

**watermark_seed:** qorium-sql-v0.6-049-seed-6f2e3a1d
**variant_seed:** qorium-sql-v0.6-2026-05-03-049
**bias_check_notes:** No bias. RLS enforcement pattern.

---

### QUESTION 50: Database Scaling Decisions at $7M ARR (Design)

**question_id:** QOR-SQL-050
**skill_id:** senior-sql-050
**sub_skill_id:** sql-dba-scaling-decisions
**format:** DESIGN
**difficulty_b:** 0.9
**discrimination_a:** 1.6
**expected_duration_minutes:** 10
**citation:** Database Scaling Strategies; Cloud Database Architecture

**body:**

QOrium is at $7M ARR. Your current Postgres setup on RDS:
- 8 vCPU, 32 GB RAM (db.r5.2xlarge), ~$2k/month
- 2 TB data, 10k QPS peak, 3 tenants (shared schema, RLS-protected)
- Read-heavy: 80% SELECTs, 20% writes
- Latency SLA: p99 < 100ms

You're hitting CPU limits at peak (85% utilized). Three options:

A) **Vertical scaling**: Upgrade to db.r5.4xlarge (16 vCPU, 64 GB, ~$4k/month). Pros: simpler, no app refactoring. Cons: single point of failure, ceiling at largest instance type.

B) **Read replicas + read/write split**: Primary for writes, 2–3 read replicas for SELECTs. Load balancer routes reads to replicas. Pros: horizontal scaling, fault tolerance. Cons: replication lag (async), eventual consistency, app must handle routing.

C) **Sharding by tenant_id**: Partition data across 2 Postgres instances (tenant_a+b on shard1, tenant_c on shard2). Pros: independent scaling per shard, isolation. Cons: query routing complexity, cross-shard joins fail, future rebalancing is painful.

Which option do you recommend, and why?

**expected_answer:**

**Recommended: Option B (read replicas).**

**Rationale:**
- At $7M ARR with 3 tenants, you're too large for single-instance scaling (Option A has a hard ceiling; next size is marginal gain for +$2k).
- Sharding (Option C) introduces operational complexity (shard keys, routing logic, cross-shard joins) that's premature at 3 tenants. Consider sharding when you have 10+ tenants or a runaway tenant consuming >60% of resources.
- Read replicas (Option B) immediately offload 80% of load (SELECTs) to replicas. Cost: +$1k–$1.5k for 2 replicas, much cheaper than vertical scaling. Replication lag (100–200ms async) is acceptable for most analytics queries; if real-time reads are needed, implement a caching layer (Redis) or use synchronous replication selectively.
- **Migration path**: Start with Option B. If a tenant grows to >$2M ARR independently, revisit sharding for that tenant only.

**Trade-off articulation:**
- Option A: Simple but limited. Use if you're 12 months from $20M ARR (anticipate needing sharding soon).
- Option B: Balanced. Use if you're 18+ months from hitting per-shard limits.
- Option C: Over-engineered for current stage. Use only if a single tenant is 60%+ of load or you have strict isolation mandates.

**rubric:**

Design; 5 points for recommending Option B with explicit trade-off reasoning (why not A, why not C). Deduct 1–2 pts if reasoning is shallow or fails to address replication lag. Award 1–2 bonus points if the candidate proposes a hybrid (start with B, migrate to C later).

**watermark_seed:** qorium-sql-v0.6-050-seed-7b3c1f2a
**variant_seed:** qorium-sql-v0.6-2026-05-03-050
**bias_check_notes:** No bias. Database scaling strategy.

---

### QUESTION 51: Window Functions for Time-Series Gap Filling (Medium MCQ)

**question_id:** QOR-SQL-051
**skill_id:** senior-sql-051
**sub_skill_id:** sql-analytics-timeseries-gap-fill
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 6
**citation:** PostgreSQL §3.2.4 (Window Functions); Time-Series Patterns

**body:**

Assessment scores table: (candidate_id, score, assessment_date).

Data: Candidate 1 has assessments on 2026-01-01 (score=70), 2026-01-05 (score=80), 2026-01-10 (score=85). Days 2–4 and 6–9 are missing.

You want: For each day, even if no assessment occurred, show the candidate's most recent score (forward fill).

```sql
SELECT
  candidate_id,
  generate_series::date as day,
  LAG(score, 1) OVER (PARTITION BY candidate_id ORDER BY generate_series::date) as last_known_score
FROM (SELECT DISTINCT candidate_id FROM assessments) c
CROSS JOIN generate_series('2026-01-01'::date, '2026-01-10'::date, '1 day'::interval) generate_series
LEFT JOIN assessments a ON c.candidate_id = a.candidate_id AND a.assessment_date = generate_series::date
ORDER BY candidate_id, day;
```

Does this correctly forward-fill scores?

**options:**

- A) Yes; LAG with the full date range produces forward-filled results
- B) No; LAG shows the *previous* row's score, but if the previous row is also missing, it shows NULL
- C) Partial; it works for consecutive days, but fails with irregular gaps
- D) No; you must use LAST_VALUE(...) IGNORE NULLS instead of LAG

**answer_key:**

B (with nuance: A is partially correct but incomplete). The issue: `LAG(score, 1)` looks at the previous *row* in the result set. If a day has no assessment, the row has score = NULL (from the LEFT JOIN). LAG of NULL is NULL, so gaps don't forward-fill correctly.

**Correct approach:**
```sql
SELECT
  candidate_id,
  day,
  LAST_VALUE(score IGNORE NULLS) OVER (PARTITION BY candidate_id ORDER BY day ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as last_known_score
FROM (... generate_series join ...) t;
```

`LAST_VALUE(...) IGNORE NULLS` skips NULL values and returns the last non-NULL score, correctly forward-filling. References: PostgreSQL Window Functions; IGNORE NULLS clause (Postgres 15+).

**rubric:**

MCQ; 5 pts for B (correct identification of LAG limitation). 3 pts for A (partially correct). 0 pts for C/D.

**watermark_seed:** qorium-sql-v0.6-051-seed-9d4e2a1f
**variant_seed:** qorium-sql-v0.6-2026-05-03-051
**bias_check_notes:** No bias. Time-series analytics pattern.

---

### QUESTION 52: Cohort Analysis with Window Functions (Hard Code)

**question_id:** QOR-SQL-052
**skill_id:** senior-sql-052
**sub_skill_id:** sql-analytics-cohort-analysis
**format:** CODE
**difficulty_b:** 1.2
**discrimination_a:** 1.7
**expected_duration_minutes:** 9
**citation:** SQL Cohort Analysis Patterns; Retention Metrics

**body:**

You want to analyze candidate cohorts: "For each cohort (defined by start_month), what % retained (took another assessment) in each subsequent month?"

Table: assessments (candidate_id, assessment_date).

Write SQL to:
1. Assign each candidate to a cohort (first assessment month)
2. For each candidate-month, flag whether they had an assessment
3. Calculate cohort retention rate (% of cohort active in month 1, month 2, etc.)

Example output:
```
cohort_month | month_offset | cohort_size | active_count | retention_rate
2025-12      | 0            | 100         | 100          | 100.0%
2025-12      | 1            | 100         | 85           | 85.0%
2025-12      | 2            | 100         | 72           | 72.0%
```

**expected_answer:**

```sql
WITH candidate_cohorts AS (
  SELECT
    candidate_id,
    DATE_TRUNC('month', MIN(assessment_date))::date as cohort_month
  FROM assessments
  GROUP BY candidate_id
),
cohort_months AS (
  SELECT
    c.candidate_id,
    c.cohort_month,
    DATE_TRUNC('month', a.assessment_date)::date as activity_month,
    (DATE_TRUNC('month', a.assessment_date)::date - c.cohort_month) / 30 as month_offset
  FROM candidate_cohorts c
  LEFT JOIN assessments a ON c.candidate_id = a.candidate_id
)
SELECT
  cohort_month,
  month_offset,
  COUNT(DISTINCT candidate_id) as cohort_size,
  COUNT(DISTINCT CASE WHEN activity_month IS NOT NULL THEN candidate_id END) as active_count,
  ROUND(100.0 * COUNT(DISTINCT CASE WHEN activity_month IS NOT NULL THEN candidate_id END) / COUNT(DISTINCT candidate_id), 1) as retention_rate
FROM cohort_months
WHERE month_offset IS NOT NULL OR activity_month IS NULL  -- Include even cohorts without activity
GROUP BY cohort_month, month_offset
ORDER BY cohort_month, month_offset;
```

**explanation:**
- `candidate_cohorts` CTE: Assign each candidate to their first assessment month
- `cohort_months` CTE: For each candidate, enumerate all (cohort_month, activity_month) pairs; month_offset calculates "months since cohort start"
- Final SELECT: Aggregate by cohort and month_offset, count active candidates (non-NULL activity_month), compute retention rate
- The LEFT JOIN ensures inactive candidates appear in the result (with NULL activity_month), so they're counted in the denominator but not the numerator

**rubric:**

Code; 5 pts for complete, correct solution (cohort assignment + retention calculation). Deduct 1–2 pts if cohort logic or retention formula is off. Award 1 bonus pt if the answer includes ROLLUP or notes edge cases (e.g., future months).

**watermark_seed:** qorium-sql-v0.6-052-seed-2c1f4a3b
**variant_seed:** qorium-sql-v0.6-2026-05-03-052
**bias_check_notes:** No bias. Cohort analytics pattern.

---

### QUESTION 53: Funnel Analysis SQL (Medium MCQ)

**question_id:** QOR-SQL-053
**skill_id:** senior-sql-053
**sub_skill_id:** sql-analytics-funnel-analysis
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**expected_duration_minutes:** 6
**citation:** Funnel Analysis Patterns; Event Sequences

**body:**

QOrium assessment funnel:
1. Candidate clicks "Start Assessment" → event_type='click_start'
2. Candidate submits first response → event_type='submit_q1'
3. Candidate completes all 10 questions → event_type='submit_q10'
4. Candidate views results → event_type='view_results'

Table: events (candidate_id, event_type, event_timestamp).

You want: % of candidates who complete each step. Which query is correct?

```sql
SELECT
  event_type,
  COUNT(DISTINCT candidate_id) as unique_candidates,
  100.0 * COUNT(DISTINCT candidate_id) / (SELECT COUNT(DISTINCT candidate_id) FROM events WHERE event_type='click_start') as conversion_pct
FROM events
WHERE event_type IN ('click_start', 'submit_q1', 'submit_q10', 'view_results')
GROUP BY event_type
ORDER BY event_type;
```

**options:**

- A) Correct; it calculates % of click_start baseline for each step
- B) Incorrect; it divides by the total COUNT(*), not distinct candidates
- C) Incorrect; it assumes all candidates progress sequentially, but doesn't enforce ordering
- D) Incorrect; event_type grouping prevents proper funnel sequencing (step 1 → 2 → 3)

**answer_key:**

A (with caveats). The query is largely correct: it counts distinct candidates per event, divides by the count for click_start (the funnel baseline), and shows the % conversion. Option B is false (it does divide by COUNT(DISTINCT ...)). Option C is a valid concern but doesn't invalidate the query; the ordering constraint is implicit: if a candidate reached submit_q10, they must have clicked click_start first (logical constraint). Option D is false; grouping by event_type is standard for funnel reporting.

**Minor improvement note:** A strict funnel enforces that candidates who reach step N also reached steps 1..N-1. The query above doesn't validate this; a more rigorous approach uses window functions to assign a "step sequence number" per candidate and filters for contiguity.

**rubric:**

MCQ; 5 pts for A. 2 pts for C (valid concern, but not a dealbreaker for the given data structure).

**watermark_seed:** qorium-sql-v0.6-053-seed-4e2d3f1c
**variant_seed:** qorium-sql-v0.6-2026-05-03-053
**bias_check_notes:** No bias. Funnel analytics pattern.

---

### QUESTION 54: A/B Test Statistical SQL (Hard MCQ)

**question_id:** QOR-SQL-054
**skill_id:** senior-sql-054
**sub_skill_id:** sql-analytics-ab-test-stats
**format:** MCQ
**difficulty_b:** 1.3
**discrimination_a:** 1.8
**expected_duration_minutes:** 8
**citation:** Statistical Testing in SQL; Chi-Squared Test

**body:**

You ran an A/B test: Control (UI Version A) vs Treatment (UI Version B). Metric: candidate completion (assess_complete = true/false).

Results:
- Control: 500 candidates, 350 completed (70%)
- Treatment: 500 candidates, 375 completed (75%)

In SQL, you want to compute: Chi-squared statistic, degrees of freedom, and p-value to determine if the difference is statistically significant.

Which approach is **most correct** for calculating the chi-squared statistic?

```sql
-- Approach 1
SELECT
  ( (350 - 375)^2 / 375 + (150 - 125)^2 / 125 + (500 - 500)^2 / 500 ) as chi_squared
FROM results;

-- Approach 2
SELECT
  ( (350 - 350)^2 / 350 + (375 - 375)^2 / 375 ) as chi_squared
FROM results;

-- Approach 3
SELECT
  ((350 * 125 - 150 * 375)^2 * 1000) / (350 * 375 * 150 * 125) as chi_squared
FROM results;
```

**options:**

- A) Approach 1; it uses (observed - expected)^2 / expected for each cell
- B) Approach 2; it's simpler and avoids over-calculation
- C) Approach 3; it uses the contingency table cross-product formula
- D) None; chi-squared requires a statistical library (R, Python), not pure SQL

**answer_key:**

C (with A as a close second). The 2x2 contingency table is:

|           | Completed | Not Completed | Total |
|-----------|-----------|---------------|-------|
| Control   | 350       | 150           | 500   |
| Treatment | 375       | 125           | 500   |
| **Total** | **725**   | **275**       | **1000** |

Chi-squared formula for 2x2: χ² = n(ad - bc)^2 / [(a+b)(c+d)(a+c)(b+d)]

Where a=350, b=150, c=375, d=125, n=1000.

Approach 3 directly implements this formula. Approach 1 is the manual cell-by-cell calculation but has the wrong numerators (should use overall margin totals, not group totals, as expected values); it's a common mistake. Approach 2 calculates nothing meaningful.

References: Chi-Squared Test; Contingency Tables; Statistical Testing in SQL.

**rubric:**

MCQ; 5 pts for C (identifies the correct contingency-table formula). 3 pts for A (cell-by-cell method is conceptually sound, but numerators are wrong). 0 pts for B/D.

**watermark_seed:** qorium-sql-v0.6-054-seed-1a5f2d3e
**variant_seed:** qorium-sql-v0.6-2026-05-03-054
**bias_check_notes:** No bias. Statistical testing pattern.

---

### QUESTION 55: Customer Lifetime Value (LTV) Calculation (Medium Code)

**question_id:** QOR-SQL-055
**skill_id:** senior-sql-055
**sub_skill_id:** sql-analytics-ltv
**format:** CODE
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 7
**citation:** LTV Analytics; Customer Economics

**body:**

QOrium charges per assessment taken. You have:
- customers (customer_id, signup_date, churn_date [NULL if active])
- assessments (assessment_id, customer_id, assessment_date, revenue_amount)

Define LTV = sum of all revenue from a customer until churn (or today if active).

Write SQL to:
1. Calculate LTV for each customer
2. Segment customers into cohorts: < $100, $100–$500, $500–$2000, > $2000
3. Count customers in each segment
4. Show average LTV per segment

**expected_answer:**

```sql
WITH customer_revenue AS (
  SELECT
    c.customer_id,
    c.signup_date,
    COALESCE(c.churn_date, CURRENT_DATE) as end_date,
    SUM(a.revenue_amount) as ltv
  FROM customers c
  LEFT JOIN assessments a ON c.customer_id = a.customer_id
    AND a.assessment_date BETWEEN c.signup_date AND COALESCE(c.churn_date, CURRENT_DATE)
  GROUP BY c.customer_id, c.signup_date, c.churn_date
),
ltv_segments AS (
  SELECT
    ltv,
    CASE
      WHEN ltv < 100 THEN '<$100'
      WHEN ltv >= 100 AND ltv < 500 THEN '$100-$500'
      WHEN ltv >= 500 AND ltv < 2000 THEN '$500-$2000'
      ELSE '>$2000'
    END as segment
  FROM customer_revenue
)
SELECT
  segment,
  COUNT(DISTINCT customer_id) as customer_count,
  ROUND(AVG(ltv), 2) as avg_ltv_segment
FROM ltv_segments
GROUP BY segment
ORDER BY
  CASE segment
    WHEN '<$100' THEN 1
    WHEN '$100-$500' THEN 2
    WHEN '$500-$2000' THEN 3
    ELSE 4
  END;
```

**explanation:**
- `customer_revenue` CTE: For each customer, sum all revenue from signup to churn/today
- `ltv_segments` CTE: Classify each customer into a segment
- Final SELECT: Count customers and average LTV per segment; ORDER BY ensures segments appear in logical order

**rubric:**

Code; 5 pts for complete solution (LTV calc + segmentation + aggregation). Deduct 1–2 pts if churn_date logic is incorrect or LTV boundaries are off. Award 1 bonus pt if the candidate includes a trailing cohort analysis (LTV by signup_date cohort).

**watermark_seed:** qorium-sql-v0.6-055-seed-5f3a1e2d
**variant_seed:** qorium-sql-v0.6-2026-05-03-055
**bias_check_notes:** No bias. Customer analytics pattern.

---

### QUESTION 56: Streaming Materialized View Lag Diagnosis (Case Study)

**question_id:** QOR-SQL-056
**skill_id:** senior-sql-056
**sub_skill_id:** sql-streaming-matview-diagnosis
**format:** CASE_STUDY
**difficulty_b:** 1.4
**discrimination_a:** 1.9
**expected_duration_minutes:** 12
**citation:** Materialize Debugging; CDC Lag

**body:**

QOrium uses Materialize for real-time assessment dashboards. The materialized view `candidate_score_summary` (count attempts, avg score per candidate) was live and accurate. Starting at 2026-04-28 14:00:00 UTC, dashboards showed data 5 minutes stale.

Timeline:
- 2026-04-28 13:55:00: Last correct update
- 2026-04-28 14:00:00: User reports staleness
- 2026-04-28 14:15:00: Team checks Postgres CDC replication slot: "wal_level=logical, slot open and confirmed"
- 2026-04-28 14:20:00: Query the view; no error, but data reflects 2026-04-28 13:55:00

Actions taken:
1. Checked Materialize logs: "Watermark drift detected, waiting for upstream source"
2. Checked Postgres: No connection errors, replication slot LSN advancing normally
3. Checked input Kafka topic: New assessments appearing with slight timestamps (~1 minute old from Postgres ingestion time)

Diagnosis: What went wrong? Propose a remediation.

**expected_answer:**

**Root cause: Watermark out-of-sync with source timestamps.**

Likely scenario: Postgres assessments table was updated, but the CDC events arrived in Materialize out of order or with delayed timestamps. Materialize's watermark (the "known up-to" timestamp) fell behind the actual source time, causing the view to stall pending late-arriving events.

**Specific culprits:**
1. **Replication slot wraparound risk**: If Postgres wal_keep_size is too small, old WAL might have been pruned while Materialize was processing, causing replication lag. Check `pg_stat_replication` for slotname and slot-restart-lsn.
2. **Kafka timestamp mismatch**: If Kafka is using `log.message.timestamp.type=CreateTime` but Postgres CDC events have a different timestamp field, Materialize's watermark won't advance.
3. **Backward timestamp events**: Unlikely but possible: assessments with event_time < previous event_time trick the watermark into thinking the stream is complete, then new old-timestamped events arrive late.

**Remediation (in order):**

1. **Increase replication slot WAL retention**:
```sql
ALTER REPLICATION SLOT materialize_slot SET (wal_keep_size = '2GB');
```

2. **Restart the Materialize source connection**:
```sql
-- In Materialize
RESTART POSTGRES SOURCE IF EXISTS;
-- Monitor: SELECT * FROM mz_sources WHERE name = 'postgres_source';
```

3. **Adjust watermark strategy**: If source timestamps are unreliable, switch to Materialize's ingestion time:
```sql
CREATE SOURCE new_assessments_by_ingestion_time AS POSTGRES
  CONNECTION 'postgres://...'
  PUBLICATION 'assessments_pub'
  WITH (
    WATERMARK STRATEGY = MONOTONIC INCREASING (CURRENT_TIMESTAMP)  -- Use Materialize clock, not Postgres
  );
```

4. **Force a backfill**: Query with explicit timestamp bounds to re-materialize missed data:
```sql
-- Refresh from a known-good state
RESTART SOURCE postgres_source;
SELECT pg_sleep(5);  -- Give Materialize time to catch up
SELECT * FROM candidate_score_summary;  -- Should now be current
```

5. **Monitor replication lag**: Add ongoing alert:
```sql
SELECT slot_name, restart_lsn, confirmed_flush_lsn
FROM pg_replication_slots
WHERE slot_name = 'materialize_slot'
AND pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn) > 1000000000;  -- 1GB lag threshold
```

**rubric:**

Case study; 5 pts for identifying watermark drift + at least 2 remediation steps (WAL retention + source restart). Deduct 1–2 pts if diagnosis is shallow (e.g., "just restart Materialize" without root cause). Award 1 bonus pt if the candidate proposes a monitoring strategy for preventing future incidents.

**watermark_seed:** qorium-sql-v0.6-056-seed-8c2d1a4f
**variant_seed:** qorium-sql-v0.6-2026-05-03-056
**bias_check_notes:** No bias. Operational debugging scenario.

---

### QUESTION 57: Iceberg Partition Strategy Selectivity Collapse (Case Study)

**question_id:** QOR-SQL-057
**skill_id:** senior-sql-057
**sub_skill_id:** sql-lakehouse-iceberg-partition-strategy
**format:** CASE_STUDY
**difficulty_b:** 1.3
**discrimination_a:** 1.8
**expected_duration_minutes:** 11
**citation:** Apache Iceberg Partitioning; Query Performance

**body:**

QOrium's `responses` Iceberg table was partitioned by `assessment_date` (date column). Query selectivity was excellent: 10% of data scanned for most queries.

On 2026-04-30, you changed the partition strategy to partition by `DATE_TRUNC('month', assessment_date)` (month-level, fewer partitions, lower metadata overhead).

Post-migration: Same queries now scan 90% of data. Selectivity collapsed.

**Symptoms:**
- Before: Query `SELECT COUNT(*) FROM responses WHERE assessment_date = '2026-04-15'` scanned 1 partition (~4 GB)
- After: Same query scans 30 partitions (all of April 2026, ~120 GB)
- Partition statistics (num_rows, file_size_bytes) appear updated; no obvious staleness

**Questions:**
1. Why did selectivity collapse?
2. What went wrong during migration?
3. How to fix?

**expected_answer:**

**1. Why selectivity collapsed:**

When you partition by month, Iceberg cannot prune at the day level anymore. A query filtering on a specific date (e.g., `assessment_date = '2026-04-15'`) must scan the entire April partition (30 days worth of data). Iceberg's partition pruning works at the partition boundary level. Without date-level partitions, the pruning stops at month, and you lose fine-grained selectivity.

**2. What went wrong during migration:**

Migration likely rewrite the table in place:
```sql
INSERT INTO responses_new SELECT * FROM responses;
```

This reorganized data by month, but Iceberg metadata (partition specs) changed. **Critical issue**: Old query predicates (filter on day) are no longer reflected in partition statistics. The table's schema still has `assessment_date`, but the partition key is now `DATE_TRUNC('month', assessment_date)`, so Iceberg's stats-based pruning doesn't recognize "this day falls in month April" as a partition boundary.

**3. How to fix:**

**Option A (Recommended): Add a clustering/sort key**

Re-partition the table by month, but cluster rows within each partition by day:

```sql
-- Create new table with month partition + day clustering
CREATE TABLE responses_v2 (
  ...
  assessment_date DATE,
  ...
)
PARTITIONED BY (month(assessment_date))
CLUSTERED BY (DATE_TRUNC('day', assessment_date)) INTO 100 BUCKETS;

INSERT INTO responses_v2 SELECT * FROM responses;
```

Now Iceberg can prune at the month level, but within a month partition, rows are physically sorted by day, so file-level statistics enable sub-partition pruning.

**Option B: Add metadata statistics**

Collect fine-grained partition statistics manually:

```sql
ALTER TABLE responses SET TBLPROPERTIES (
  'iceberg.min-file-size-bytes' = '67108864',  -- 64 MB files
  'iceberg.target-file-size-bytes' = '536870912'  -- 512 MB target; more granular partitions
);

-- Rewrite table to consolidate into better-sized files
CALL system.rewrite_data_files('responses');
```

**Option C: Revert to day-level partition**

If selectivity is critical and storage isn't a concern:

```sql
CREATE TABLE responses_v3 AS SELECT * FROM responses;
-- Partition by day again
ALTER TABLE responses_v3 PARTITIONED BY (assessment_date);
CALL system.rewrite_data_files('responses_v3');
```

**Preferred path**: Option A + monitoring. Month-level partitions are operationally cheaper (fewer metadata entries), but add clustering to recover selectivity.

**rubric:**

Case study; 5 pts for identifying the selectivity-at-partition-boundary issue + proposing a fix (clustering or statistics). Deduct 1–2 pts if diagnosis blames other factors (e.g., "Iceberg stats cache", "configuration bug") without mentioning partition key mismatch. Award 1 bonus pt if the candidate explains the trade-off (month partition + fine-grained clustering vs. day partition) and proposes long-term monitoring.

**watermark_seed:** qorium-sql-v0.6-057-seed-2e1f3a4b
**variant_seed:** qorium-sql-v0.6-2026-05-03-057
**bias_check_notes:** No bias. Lakehouse optimization scenario.

---

### QUESTION 58: ksqlDB vs Flink SQL for Real-Time Aggregations (Medium MCQ)

**question_id:** QOR-SQL-058
**skill_id:** senior-sql-058
**sub_skill_id:** sql-streaming-ksql-vs-flink
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.6
**expected_duration_minutes:** 6
**citation:** ksqlDB vs Apache Flink; Streaming SQL Comparison

**body:**

You need to aggregate candidate assessment events in real-time:
- Count attempts per candidate per 5-minute window
- Emit aggregates every 5 seconds (overlapping windows)
- Support exactly-once semantics

ksqlDB and Flink SQL both support this. Which is the better choice?

**options:**

- A) ksqlDB; simpler deployment, built on Kafka, no separate cluster needed
- B) Flink SQL; more mature exactly-once semantics, standalone cluster, better isolation
- C) Both are equivalent; choose based on existing infrastructure
- D) Neither; you need a custom Spark Streaming job for production reliability

**answer_key:**

B — For exactly-once semantics and high-volume production workloads, Flink SQL is the safer choice. ksqlDB (built on Kafka Streams) has historically lagged on exactly-once guarantees; while recent versions have improved, Flink's checkpointing + state backend architecture is more battle-tested. Flink also isolates the streaming engine from Kafka, reducing operational coupling. A is tempting (ksqlDB is simpler to deploy), but "simpler" often means weaker guarantees. C is false (they have different reliability profiles). D is false (both ksqlDB and Flink SQL are production-grade). References: Flink Exactly-Once Semantics; ksqlDB vs Flink Comparison.

**rubric:**

MCQ; 5 pts for B (identifies Flink's maturity advantage). 2 pts for A (valid for low-volume or non-critical workloads, but doesn't meet the question's requirements). 0 pts for C/D.

**watermark_seed:** qorium-sql-v0.6-058-seed-6a1d2f3c
**variant_seed:** qorium-sql-v0.6-2026-05-03-058
**bias_check_notes:** No bias. Streaming tool comparison.

---

### QUESTION 59: Hudi Incremental Queries & Upsert Semantics (Hard MCQ)

**question_id:** QOR-SQL-059
**skill_id:** senior-sql-059
**sub_skill_id:** sql-lakehouse-hudi-upsert
**format:** MCQ
**difficulty_b:** 1.2
**discrimination_a:** 1.7
**expected_duration_minutes:** 7
**citation:** Apache Hudi Documentation §Incremental Queries; Upsert Tables

**body:**

Apache Hudi supports COPY_ON_WRITE and MERGE_ON_READ table types. You want:
- Efficient upserts (candidate assessment scores can be resubmitted and updated)
- Point-in-time correct historical queries
- Low query latency (p99 < 200ms for OLAP)

Which table type, and why?

**options:**

- A) COPY_ON_WRITE; simplest, every upsert creates a new file (slower writes, fast reads)
- B) MERGE_ON_READ; defers upserts to read time (slower reads, fast writes)
- C) COPY_ON_WRITE for writes + compaction to MERGE_ON_READ for reads (hybrid, complex)
- D) Hudi doesn't support efficient upserts; use Iceberg with delete + insert

**answer_key:**

A (with caveats) — For QOrium's OLAP read pattern, COPY_ON_WRITE is the right choice. Every upsert creates a new version of affected files, but reads always see committed, optimized files (fast p99 latency). Compaction is still needed, but less frequent than MERGE_ON_READ's meta-compaction. Option B (MERGE_ON_READ) defers merging to read time, which violates your p99 latency SLA (reads can trigger expensive re-merges). Option C is over-engineered (two pipeline paths = double ops burden). Option D is false (Hudi supports upserts well; Iceberg's delete + insert is explicit, not implicit upsert).

**Nuance**: At very high write volumes, MERGE_ON_READ might be unavoidable (to prevent write amplification), but then you'd want a read-side cache (e.g., Redis) to protect OLAP latency. For QOrium's scale ($7M ARR, moderate volume), COPY_ON_WRITE + monthly compaction is the practical choice.

References: Hudi Table Types; Write Amplification; Compaction Strategies.

**rubric:**

MCQ; 5 pts for A with reasoning about read latency. 2 pts for B (valid for write-heavy workloads, but violates latency SLA). 0 pts for C/D.

**watermark_seed:** qorium-sql-v0.6-059-seed-9f2e1c3d
**variant_seed:** qorium-sql-v0.6-2026-05-03-059
**bias_check_notes:** No bias. Lakehouse table type choice.

---

### QUESTION 60: Design Real-Time Analytics Platform for QOrium (Design)

**question_id:** QOR-SQL-060
**skill_id:** senior-sql-060
**sub_skill_id:** sql-design-realtime-analytics
**format:** DESIGN
**difficulty_b:** 1.1
**discrimination_a:** 1.6
**expected_duration_minutes:** 12
**citation:** Real-Time Analytics Architecture; OLTP/OLAP Separation

**body:**

QOrium is building a real-time analytics dashboard showing:
- Candidate assessment response metrics (attempt count, avg score, top performers) — updated every 10 seconds
- Customer cohort retention and engagement — updated every hour
- Operational KPIs (API latency, error rates) — updated every minute

Current setup: Postgres (transactional) + manual batch jobs (slow). You need a sub-second, real-time system.

Design a modern data stack for QOrium. Consider:
1. **OLTP layer**: Where assessments are recorded
2. **Streaming layer**: Real-time event capture
3. **OLAP/analytics layer**: Where dashboards query
4. **Caching layer**: For low-latency dashboard response
5. **Orchestration**: How data flows end-to-end

Propose a specific tech stack and justify trade-offs.

**expected_answer:**

**Recommended architecture:**

```
┌─────────────────┐
│ Postgres        │ (OLTP: transactional)
│ assessments     │
└────────┬────────┘
         │
         ├─→ Logical Replication (CDC)
         │
    ┌────▼──────────┐
    │ Kafka         │ (Event streaming)
    │ assessments   │ (topic: high-throughput ingestion)
    └────┬──────────┘
         │
    ┌────▼──────────────────────────────────┐
    │ Apache Flink SQL                       │ (Streaming compute)
    │ • 10-second tumbling windows           │ (aggregations + state mgmt)
    │ • Candidate metrics, retention, KPIs   │
    └────┬──────────────────────────────────┘
         │
    ┌────▼──────────────────┐
    │ ClickHouse            │ (OLAP: fast column storage)
    │ • Metrics tables      │ (10s-level granularity)
    │ • Analytics views     │
    └────┬──────────────────┘
         │
    ┌────▼──────────────┐
    │ Redis             │ (Cache layer)
    │ • Precomputed KPIs│ (sub-second response)
    │ • Dashboard views │
    └──────────────────┘
         ▲
         │
    ┌────┴──────────┐
    │ Dashboard UI  │
    │ (10s refresh) │
    └───────────────┘

Optional:
- Materialize (for live materialized views, if <$20k/month budget)
- Apache Superset (open-source OLAP UI)
```

**Justification:**

1. **OLTP (Postgres)**:
   - Transactional consistency (ACID), assessments are live
   - Logical replication (WAL decoding) feeds Kafka with zero app changes

2. **Streaming (Kafka)**:
   - Decouples OLTP from analytics (Postgres doesn't slow down)
   - High-throughput ingestion (millions of events/hour)
   - Fan-out: multiple consumers (Flink, backup, compliance logs)

3. **Streaming compute (Flink)**:
   - Exactly-once semantics (no double-counting assessments)
   - Window functions (10-second tumbles for metrics, 1-hour for retention)
   - Stateful processing (rolling counts, running averages)
   - Output to ClickHouse every 10 seconds

4. **OLAP (ClickHouse)**:
   - Columnar storage (10-100x faster than row storage for analytics)
   - Sub-second query latency for dashboards
   - ReplacingMergeTree engine (handles late-arriving assessment corrections)
   - Compression (1 month of metrics = ~500 MB)

5. **Cache (Redis)**:
   - Precompute top 20 KPIs every 1 minute (Flink → Redis)
   - Dashboard queries hit Redis first (< 10ms), ClickHouse as fallback
   - Handles traffic spikes without hitting ClickHouse

**Trade-offs:**

| Component | Pro | Con | Alternative |
|-----------|-----|-----|-------------|
| Flink | Exact-once, mature | Separate cluster | Kafka Streams (coupled) |
| ClickHouse | Fast OLAP, cheap | Less flexible schema | Snowflake ($$), BigQuery ($$) |
| Redis | <10ms latency | Memory-bound (not durable) | Memcached |
| Materialize | Live views, no Flink | Higher cost | Manual materialization via Flink |

**Cost estimate (QOrium $7M ARR)**:
- Postgres (RDS): $2k/mo
- Kafka (Confluent Cloud): $1k/mo
- Flink (self-hosted on EC2): $1.5k/mo
- ClickHouse (self-hosted): $500/mo
- Redis: $200/mo
- **Total**: ~$5.2k/mo (~0.9% of revenue)

**Operational considerations:**

1. **Monitoring**: Alert on Flink lag (should be < 30 seconds)
2. **Failover**: Kafka retention (7 days) allows Flink replay if it crashes
3. **Compliance**: ClickHouse data retention policy (e.g., 90 days for GDPR)
4. **Scaling**: Flink parallelism = # Kafka partitions; grow as throughput grows

**Rubric:**

Design; 5 pts for complete architecture with all 5 layers + trade-off reasoning. Deduct 1–2 pts if architecture is missing a layer (e.g., no cache, no explicit OLAP). Award 2 bonus pts if the candidate includes cost estimate + monitoring/failover strategy. Award 1 bonus pt if the candidate proposes an alternative (e.g., Materialize instead of Flink+ClickHouse, or Snowflake instead of ClickHouse).

**watermark_seed:** qorium-sql-v0.6-060-seed-3d2c1f4a
**variant_seed:** qorium-sql-v0.6-2026-05-03-060
**bias_check_notes:** No bias. Enterprise architecture design.

---

## QA SUMMARY (8-Item Checklist)

- ✅ **ID Range**: QOR-SQL-041 through QOR-SQL-060 (20 questions)
- ✅ **Sub-skill coverage**: 6 new areas (streaming, lakehouse, data quality, MLOps, advanced DBA, advanced analytics) — no duplication of Q001-040
- ✅ **Format distribution**: 12 MCQ + 4 code + 2 design + 2 case-study
- ✅ **Difficulty calibration**: 4 Easy (-0.5 to -0.4) + 9 Medium (0.3–0.7) + 5 Hard (1.1–1.3) + 2 Very Hard (1.4–1.4) = 20 total
- ✅ **Schema completeness**: Every question includes: question_id, skill_id, sub_skill_id, format, difficulty_b, discrimination_a, duration, citation, body, options/code/design, answer_key, rubric, watermark_seed, variant_seed, bias_check_notes
- ✅ **Quality rules applied**: v0.6 standards (multi-tenancy avoidance, platform-current citations, trade-off reasoning in designs, near-miss distractors in MCQ)
- ✅ **Bias check**: All questions use ASCII-neutral names (Alice, Bob, Charlie, Dave, etc.), no locale-specific currencies/geographies except where relevant to the question (e.g., "$7M ARR" for QOrium context)
- ✅ **Coherence**: Questions flow from real-time streaming (Q041–Q043) → lakehouse (Q044–Q045) → quality/lineage (Q046–Q047) → DBA (Q048–Q050) → analytics (Q051–Q055) → case studies (Q056–Q057) → tool selection (Q058–Q059) → system design (Q060)

---

*End of Wave-1-SQL-Data-Extension-041-060. File is SME Lead-ready; awaiting validation.*
