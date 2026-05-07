# Wave 1 Extension: Senior SQL/Data (QOR-SQLDATA-081..100)

**STATUS:** AI-drafted v0.6 EXTENSION — closes SQL/Data 100/100. SME Lead validation pending.

## 20 NEW Questions (QOR-SQLDATA-081..100)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 81: GROUPING SETS / ROLLUP / CUBE (Easy)

**question_id:** QOR-SQLDATA-081
**skill_id:** senior-sqldata-081
**sub_skill_id:** grouping-sets
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** ANSI SQL §GROUP BY extensions

**body:** A dashboard needs subtotals by region, by product, by region+product, AND a grand total in one query. Use:

**options:**
- A) UNION ALL of 4 GROUP BY queries
- B) `GROUP BY ROLLUP(region, product)` produces subtotals along the hierarchy + grand total in one pass. Or `CUBE` for all combinations. Or explicit `GROUPING SETS((region), (product), (region, product), ())` for arbitrary sets
- C) Pivot
- D) Window functions

**answer_key:** B — Single-pass; supported in Postgres, BigQuery, Snowflake. `GROUPING(col)` indicates whether a row is a subtotal. Reference: ANSI SQL.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-081-seed-2c8a4e9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-081
**bias_check_notes:** No bias.

---

### QUESTION 82: COALESCE vs ISNULL Idioms (Easy)

**question_id:** QOR-SQLDATA-082
**skill_id:** senior-sqldata-082
**sub_skill_id:** coalesce-isnull
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** ANSI SQL

**body:** Most portable null-defaulting in SQL:

**options:**
- A) `ISNULL(x, 0)` — universal
- B) `COALESCE(x, 0)` — ANSI standard, takes N args, returns first non-null. Works across Postgres, MySQL, SQL Server, Oracle, BigQuery, Snowflake. `ISNULL` is SQL-Server-specific (and means different thing in MySQL!)
- C) `IFNULL(x, 0)` — universal
- D) `NULLIF(x, 0)` — same as COALESCE

**answer_key:** B — `COALESCE` is the standard, portable form. NULLIF returns NULL when args equal (different semantic). Reference: ANSI SQL.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-082-seed-7e3c8a2b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-082
**bias_check_notes:** No bias.

---

### QUESTION 83: Postgres Roles vs Users (Easy)

**question_id:** QOR-SQLDATA-083
**skill_id:** senior-sqldata-083
**sub_skill_id:** postgres-roles
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Postgres docs §Database Roles

**body:** In Postgres, "role" vs "user":

**options:**
- A) Different concepts
- B) **Same thing**. A role with LOGIN attribute is a "user." Roles can be granted to other roles (group membership). Best practice: a `app_readwrite` role granted to per-environment users; roles encode permissions, users encode identity
- C) Users were removed in Postgres 12
- D) Roles are for replication only

**answer_key:** B — Postgres unified them; "user" is just a role with LOGIN. Group via role inheritance: `GRANT app_readwrite TO alice;`. Reference: Postgres docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-083-seed-3a8c5e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-083
**bias_check_notes:** No bias.

---

### QUESTION 84: Advisory Locks Use Cases (Medium)

**question_id:** QOR-SQLDATA-084
**skill_id:** senior-sqldata-084
**sub_skill_id:** advisory-locks
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Postgres docs §Advisory Locks

**body:** When are Postgres advisory locks appropriate?

**options:**
- A) Replace row-level locking
- B) For application-level coordination NOT tied to a row: e.g., "only one worker runs the daily report." `pg_try_advisory_lock(key)` returns true if acquired; auto-released on session end (transaction-scope variant: `pg_try_advisory_xact_lock`). Useful for distributed cron coordination
- C) Replicate state
- D) Cache results

**answer_key:** B — Advisory locks are application-defined coordination primitives. Cheap and durable for cross-process serialization. Reference: Postgres docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-084-seed-8e2c4a7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-084
**bias_check_notes:** No bias.

---

### QUESTION 85: Statement-level Triggers (Medium)

**question_id:** QOR-SQLDATA-085
**skill_id:** senior-sqldata-085
**sub_skill_id:** statement-trigger
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Postgres docs §Triggers

**body:** A trigger logs every insert. With 1M rows in one INSERT, row-level trigger fires 1M times. Better:

**options:**
- A) Disable trigger
- B) **Statement-level trigger** with TRANSITION TABLES (Postgres 10+): `REFERENCING NEW TABLE AS new_rows`. Inside the trigger, single INSERT-from-new_rows summary. Fires once per statement regardless of row count. Major perf win for batch ingest paths
- C) Smaller batches
- D) Drop the trigger

**answer_key:** B — Transition tables (NEW TABLE / OLD TABLE) make statement-level triggers practical for audit/aggregate. Reference: Postgres docs §Triggers.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-085-seed-4f8b3c2a
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-085
**bias_check_notes:** No bias.

---

### QUESTION 86: Generated Columns (Medium)

**question_id:** QOR-SQLDATA-086
**skill_id:** senior-sqldata-086
**sub_skill_id:** generated-columns
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Postgres 12 Release Notes §Generated Columns

**body:** Storing `full_name` as `first || ' ' || last` everywhere is messy. Postgres 12+ feature:

**options:**
- A) Custom triggers
- B) `full_name TEXT GENERATED ALWAYS AS (first || ' ' || last) STORED` — column maintained automatically; can be indexed. STORED variant materializes (default & only option in Postgres for now)
- C) View
- D) Trigger function

**answer_key:** B — Generated columns are first-class. Index for search; DRYs up application code. Reference: Postgres 12 Release Notes.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-086-seed-9c4a8e3b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-086
**bias_check_notes:** No bias.

---

### QUESTION 87: Logical Replication Use Cases (Medium)

**question_id:** QOR-SQLDATA-087
**skill_id:** senior-sqldata-087
**sub_skill_id:** logical-replication
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Postgres docs §Logical Replication

**body:** Logical replication (vs physical):

**options:**
- A) Always slower
- B) Logical replicates change events row-level via publish/subscribe; can replicate only certain tables, transform schemas, replicate across major versions, replicate to non-Postgres targets via plugins (Debezium → Kafka). Use cases: zero-downtime upgrade, ETL CDC, sharding migration
- C) Only for read replicas
- D) Replaces physical replication

**answer_key:** B — Logical is the modern flexible replication mechanism. Physical (streaming) is identical-byte-for-byte; faster & simpler but rigid. Use both for different jobs. References: Postgres docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-087-seed-2d8e4c9b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-087
**bias_check_notes:** No bias.

---

### QUESTION 88: PII / GDPR Right-to-Be-Forgotten (Medium)

**question_id:** QOR-SQLDATA-088
**skill_id:** senior-sqldata-088
**sub_skill_id:** gdpr-right-to-erase
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** GDPR Article 17

**body:** A GDPR erasure request requires data deletion. Architectural pattern:

**options:**
- A) Delete user row only
- B) Map all PII to a `user_pii` table; production code joins via FK. Erasure deletes from `user_pii`; downstream backups/warehouses scrub via tombstone propagation (CDC event "ERASE userId X" replicated to all sinks); analytics anonymizes (aggregate-only) so no individual-level data persists. Schema design upfront makes erasure tractable; ad-hoc reverse engineering does not
- C) Soft-delete only
- D) Encrypt and forget

**answer_key:** B — GDPR-friendly architecture starts at schema. PII centralization + tombstone CDC + warehouse anonymization is the canonical answer. Reference: GDPR Art 17; ICO guidance.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-088-seed-5e9c2a8b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-088
**bias_check_notes:** No bias.

---

### QUESTION 89: Sql Injection — Parameterized Queries (Medium)

**question_id:** QOR-SQLDATA-089
**skill_id:** senior-sqldata-089
**sub_skill_id:** sql-injection
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** OWASP Top 10

**body:** Why is `cur.execute("SELECT * FROM u WHERE name=%s", (name,))` safe but `cur.execute(f"SELECT * FROM u WHERE name='{name}'")` not?

**options:**
- A) f-strings are slower
- B) Parameterized form sends query + params separately; DB engine treats params strictly as values, NEVER as SQL. f-string concatenation lets attacker inject SQL syntax (e.g., `'; DROP TABLE u; --`). Always parameterize; never concatenate user input
- C) f-strings only work in Python
- D) %s is shorter

**answer_key:** B — Parameterization is the OWASP A03 defense. Modern ORMs default to parameterized queries; raw SQL in modern apps must always parameterize. References: OWASP Top 10.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-089-seed-1b8c4a7e
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-089
**bias_check_notes:** No bias.

---

### QUESTION 90: Postgres Sequences & Identity (Medium)

**question_id:** QOR-SQLDATA-090
**skill_id:** senior-sqldata-090
**sub_skill_id:** sequences-identity
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Postgres docs §Sequences

**body:** `SERIAL` vs `IDENTITY`:

**options:**
- A) SERIAL is best
- B) `GENERATED [ALWAYS|BY DEFAULT] AS IDENTITY` (SQL standard, Postgres 10+) supersedes `SERIAL`. ALWAYS prevents accidental override; BY DEFAULT lets explicit values pass through. Better for migrations (sequence ownership is correct), backups, and ALTER. Use IDENTITY in new schemas; SERIAL legacy
- C) Identical
- D) IDENTITY is MySQL only

**answer_key:** B — `IDENTITY` is the modern standard. `SERIAL` is a Postgres-specific shortcut with subtle ownership/transfer issues. Reference: Postgres §Identity.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-090-seed-3a7c8e2b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-090
**bias_check_notes:** No bias.

---

### QUESTION 91: ULID vs UUID (Medium)

**question_id:** QOR-SQLDATA-091
**skill_id:** senior-sqldata-091
**sub_skill_id:** ulid-uuid
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** ULID spec; UUIDv7 RFC draft

**body:** For new systems needing global IDs that index well in btree, choose:

**options:**
- A) UUIDv4 (random) — distributes evenly
- B) **ULID or UUIDv7** — time-sortable monotonic IDs. Btree-friendly (mostly insert-at-end), preserve "newer = larger" sort order, encode timestamp without leaking sensitive ordering. UUIDv4 random IDs cause btree write amplification on hot indexes
- C) Auto-increment INT
- D) Hash of email

**answer_key:** B — Time-sortable IDs are the modern best practice. Btree-friendly indexing means ~10x write throughput vs random UUIDv4 on hot tables. References: ULID spec; UUIDv7 draft RFC.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sqldata-v0.6-091-seed-9c3a8e4b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-091
**bias_check_notes:** No bias.

---

### QUESTION 92: Code — Calculate Customer Cohort Retention (Hard - Code)

**question_id:** QOR-SQLDATA-092
**skill_id:** senior-sqldata-092
**sub_skill_id:** cohort-retention
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Mode Analytics cohort tutorials

**body:** Write SQL: % of users active in week N+M, grouped by signup-week-N (cohort retention matrix). `users(id, signup_at)`, `events(user_id, occurred_at)`.

**options:** []

**answer_key:**

```sql
WITH cohort AS (
  SELECT id AS user_id,
         DATE_TRUNC('week', signup_at) AS cohort_week
  FROM users
),
activity AS (
  SELECT DISTINCT user_id,
         DATE_TRUNC('week', occurred_at) AS active_week
  FROM events
),
retention AS (
  SELECT c.cohort_week,
         (EXTRACT(EPOCH FROM a.active_week - c.cohort_week) / 604800)::INT AS weeks_since_signup,
         COUNT(DISTINCT c.user_id) AS active_users
  FROM cohort c
  JOIN activity a ON c.user_id = a.user_id AND a.active_week >= c.cohort_week
  GROUP BY c.cohort_week, weeks_since_signup
),
sizes AS (
  SELECT cohort_week, COUNT(*) AS cohort_size
  FROM cohort
  GROUP BY cohort_week
)
SELECT r.cohort_week,
       r.weeks_since_signup,
       r.active_users,
       s.cohort_size,
       ROUND(r.active_users::numeric / s.cohort_size * 100, 1) AS retention_pct
FROM retention r
JOIN sizes s USING (cohort_week)
ORDER BY r.cohort_week, r.weeks_since_signup;
```

Then pivot the result client-side (or use `crosstab` extension in Postgres) for the 2D matrix view. Notes: `DATE_TRUNC('week', ...)` makes ISO weeks (Mon-Sun); set timezone explicitly if local needed. Use generate_series to fill gap-weeks (cohort exists but had 0 active in some week) for clean dashboard. Reference: Mode Analytics cohort tutorial.

**rubric:** 12-pt: cohort-week derivation (2) + activity-week extract (2) + weeks-since-signup math (3) + cohort size + retention % (3) + clean grouping (2).

**watermark_seed:** qorium-sqldata-v0.6-092-seed-4d8c2a7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-092
**bias_check_notes:** No bias.

---

### QUESTION 93: Code — De-duplicate Streaming Events (Hard - Code)

**question_id:** QOR-SQLDATA-093
**skill_id:** senior-sqldata-093
**sub_skill_id:** stream-dedupe
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Kafka exactly-once semantics; Flink docs

**body:** Kafka events have at-least-once delivery; downstream Postgres must dedupe by `(event_id, source)`. Write the SQL pattern + the index that makes it correct + fast.

**options:** []

**answer_key:**

```sql
CREATE TABLE events (
  event_id TEXT NOT NULL,
  source TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  payload JSONB NOT NULL,
  PRIMARY KEY (source, event_id)   -- composite PK enforces dedup
);

-- Insert with conflict-on-duplicate; cheap, no SELECT-then-INSERT race.
INSERT INTO events (event_id, source, occurred_at, payload)
VALUES ($1, $2, $3, $4)
ON CONFLICT (source, event_id) DO NOTHING
RETURNING event_id;

-- Or, when payload may legitimately update (idempotent update):
INSERT INTO events (event_id, source, occurred_at, payload)
VALUES ($1, $2, $3, $4)
ON CONFLICT (source, event_id) DO UPDATE
  SET payload = EXCLUDED.payload, occurred_at = EXCLUDED.occurred_at
WHERE events.occurred_at < EXCLUDED.occurred_at;   -- only update if newer
```

Key points:
- Composite PK on `(source, event_id)` is the dedup primitive — the database enforces uniqueness, no app-side check needed.
- `ON CONFLICT DO NOTHING` is the right idiom for "drop duplicates."
- For "last-write-wins-by-timestamp," conditional UPDATE with `WHERE existing < new` prevents out-of-order overwrites.
- For very high event volume, partitioned by `(source, day)` helps; archive old partitions.
- Don't use bigint serial as PK + dedup separately — that requires a SELECT-then-INSERT which races.

References: Kafka exactly-once; Postgres §INSERT ON CONFLICT.

**rubric:** 12-pt: composite PK on natural dedup key (3) + ON CONFLICT DO NOTHING idiom (3) + last-write-wins variant w/ conditional update (3) + race-free pattern (no SELECT then INSERT) (2) + scaling note (1).

**watermark_seed:** qorium-sqldata-v0.6-093-seed-7e3c8a4b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-093
**bias_check_notes:** No bias.

---

### QUESTION 94: Postgres Partitioning (Hard)

**question_id:** QOR-SQLDATA-094
**skill_id:** senior-sqldata-094
**sub_skill_id:** declarative-partitioning
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Postgres docs §Table Partitioning

**body:** A 2TB events table is hard to maintain (vacuum, drop-old). Modern Postgres approach:

**options:**
- A) Drop old rows in batches
- B) **Declarative partitioning by month**: `PARTITION BY RANGE (occurred_at)`; child partitions per month. Drop old data via `DROP TABLE events_2024_01` (instant; no vacuum churn). Indexes per partition. `pg_partman` automates partition creation/dropping
- C) Sharding
- D) Move to NoSQL

**answer_key:** B — Declarative partitioning is the canonical pattern for time-series at scale. `pg_partman` handles operational lifecycle. Reference: Postgres docs §Partitioning.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sqldata-v0.6-094-seed-3a8c5e2b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-094
**bias_check_notes:** No bias.

---

### QUESTION 95: Cross-DB Joins / Federation (Hard)

**question_id:** QOR-SQLDATA-095
**skill_id:** senior-sqldata-095
**sub_skill_id:** federation-trino
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Trino docs; Postgres FDW docs

**body:** A query needs to JOIN data across Postgres + S3 (Iceberg) + ClickHouse. Approach:

**options:**
- A) ETL everything into one DB
- B) **Trino (formerly PrestoSQL)**: federated SQL engine; one connector per source; pushes predicates and columns down where possible; one SQL dialect on top. Postgres FDW (foreign data wrapper) is simpler if only Postgres-to-Postgres or to a few targets but doesn't scale to many sources
- C) Custom Python ETL
- D) Replicate everything

**answer_key:** B — Trino is the canonical federation engine. FDW is good for narrow Postgres-to-X. References: Trino docs; Postgres FDW.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sqldata-v0.6-095-seed-9b2c4a8e
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-095
**bias_check_notes:** No bias.

---

### QUESTION 96: SQL Optimizer Hints — Use Sparingly (Hard)

**question_id:** QOR-SQLDATA-096
**skill_id:** senior-sqldata-096
**sub_skill_id:** optimizer-hints
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Postgres docs §Planner

**body:** A query is plan-flipping; some runs use index, others seq scan. Should you force the plan?

**options:**
- A) Yes always — hints are good
- B) Postgres has no SQL hints (by design). First investigate root cause: bad stats? `ANALYZE`. Wrong index? Add or restructure. Plan instability under data skew? Use partial indexes or rewrite. As escape hatch: `pg_hint_plan` extension, or `SET LOCAL enable_seqscan = off` for a single query. NEVER as default — hints break when data shape changes. Use only when fixing the planner is impossible
- C) Always force index
- D) Drop indexes

**answer_key:** B — Postgres deliberately omits hints to encourage fixing root causes. Hints become technical debt — they hold the plan even after a better plan would emerge. Reference: Postgres planner docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sqldata-v0.6-096-seed-2c8a4e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-096
**bias_check_notes:** No bias.

---

### QUESTION 97: Design — Multi-Region Active-Active Database (Hard - Design)

**question_id:** QOR-SQLDATA-097
**skill_id:** senior-sqldata-097
**sub_skill_id:** multi-region-active-active
**format:** design
**difficulty_b:** 1.4
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Spanner whitepaper; CockroachDB docs; YugabyteDB docs

**body:** Design a multi-region active-active database for a global SaaS (5 regions, 10ms intra-region, 80-200ms inter-region). Cover: technology choice, data placement, consistency model, conflict resolution, failover, monitoring. (Limit: 800 words.)

**answer_key:**

**Recommendation: CockroachDB OR Spanner. Postgres-with-cross-region-replication is the wrong answer for active-active.**

**Why not vanilla Postgres.** Multi-master in Postgres requires either expensive Postgres-XC variants or manual conflict resolution (BDR, pglogical bidirectional). Operationally fragile.

**Why CockroachDB or Spanner.** Both are Postgres-SQL-compatible (CockroachDB more so), distributed, support active-active multi-region writes with serializable isolation:
- **CockroachDB:** open source / self-hosted / managed cloud. Range-based sharding; automatic rebalancing.
- **Spanner:** Google-managed only. TrueTime atomic-clock based. Often lower latency for global strong consistency.

**Data placement.**

- Use "regional by row" for tenant data: each tenant pinned to a primary region (low latency for that tenant).
- "Regional by table" for global config tables (replicate to all regions).
- "Global" for tiny lookup tables.
- Cross-region writes only when explicitly needed (cross-tenant rollups).

**Consistency model.** Serializable by default. Most queries are intra-region (single replica round-trip ~10ms). Cross-region writes pay the WAN latency (multi-region commit, 50-150ms) — accepted for the rare case.

**Conflict resolution.** With strict serializability, conflicts manifest as transaction aborts the application retries. No custom merge logic needed. (Last-write-wins is NOT used in CockroachDB / Spanner; that's an AP-style design.)

**Failover.** Automatic. If a region drops, ranges with primary in that region fail over to a replica in another region. RTO < 30s typical, RPO = 0 (synchronous replication within range).

**Schema migrations.** Online via the database's coordinated migration framework. ALTER TABLE is rolled across regions safely.

**Monitoring.**
- Per-region request rate, latency p99.
- Replication lag (should be ~0 for synchronous).
- Cross-region write fraction (alarm if rising — model drift).
- Range-leader distribution (rebalance health).
- Cost: cross-region traffic is the dominant variable cost.

**Failure-mode game-day:** "Full region outage." Verify: ranges fail over within 30s; clients reconnect; SLAs maintained outside the failed region. Run quarterly.

**Cost.** CockroachDB self-hosted at this scale: $30-80K/month for multi-region cluster. Spanner: $50-150K/month. Vanilla Postgres + manual replication: cheaper sticker price but ops complexity dwarfs the difference.

**When NOT to use this architecture.** If 95%+ of users are in one region, single-region Postgres with a DR replica in another region is dramatically simpler and cheaper. Active-active is justified ONLY by genuine global active users + low-latency requirements + RPO=0 + multi-region writes.

**Migration from single-region Postgres.** Logical replication continuously into CockroachDB; dual-write phase; cutover. Plan 6-12 months for production-grade migration.

**Edge case: latency-sensitive transactions.** Cross-region transactions inherently have ~100ms+ latency. Application UX must accommodate (loading state, optimistic UI). If user-facing latency target is <50ms for ALL writes globally, multi-region is structurally infeasible — pick one region.

**rubric:** 18-pt: rejects vanilla Postgres for active-active (3) + CockroachDB/Spanner choice (3) + regional-by-row data placement (3) + serializable consistency (2) + automatic failover w/ RTO/RPO (2) + cross-region cost awareness (2) + game-day region outage (2) + when-NOT-to-use criteria (1).

**watermark_seed:** qorium-sqldata-v0.6-097-seed-7e2c8a4b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-097
**bias_check_notes:** No bias.

---

### QUESTION 98: Casestudy — Slow Quarter-End Reports (Very Hard - Casestudy)

**question_id:** QOR-SQLDATA-098
**skill_id:** senior-sqldata-098
**sub_skill_id:** quarter-end-slow
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** A Postgres-based finance reporting tool runs fine all month, but on the LAST DAY of the quarter (when accounting reconciles), key reports take 15-90 minutes (vs 2-3 minutes normal). Finance team burns 4 hours every quarter waiting. Investigate and fix sustainably. (Limit: 800 words.)

**answer_key:**

**Pattern recognition:** "fine all month, slow on quarter-end" almost always means write contention OR plan instability when concurrent activity spikes. Five candidates:

1. **Concurrent locks.** Quarter-end = many users running concurrent reports + accounting tools writing simultaneously. Locks on the same tables cause queries to wait. Detection: `pg_stat_activity` during the slow window — count of `waiting for lock` rows; blocking-locks query.
2. **Bloat from reconciliation writes.** Last-day-of-quarter accounting writes a large adjusting batch; bloat spikes; vacuum lags; queries slow due to dead-tuple traversal. Detection: `pg_stat_user_tables.n_dead_tup` on the affected tables before/after.
3. **Stats stale due to bulk insert.** Big quarter-end batch insert without `ANALYZE` — planner picks bad plan. Detection: EXPLAIN ANALYZE shows huge estimated-vs-actual divergence on the slow plan.
4. **Index contention / connection saturation.** Many users open same report; connection pool fills; queries queue. Detection: pool checkedout count.
5. **Resource saturation.** I/O or CPU pegged. Detection: `iostat`, `top`, `vmstat`.

**Investigation in the next 30 minutes (during the slow window if possible; if not, replicate via traffic replay):**

- Replay typical quarter-end concurrency to a staging snapshot (5x normal user load + a synthetic accounting batch).
- Capture `pg_stat_activity`, `pg_stat_user_tables`, `pg_stat_io` over the run.
- EXPLAIN ANALYZE the slow report on baseline vs quarter-end conditions.

**Most likely root cause (per the symptom set):**

Combination of (a) accounting writes flooding the FX-conversion or journal table, causing bloat AND stats drift; and (b) concurrent reporting locking on the same partitions. EXPLAIN comparison usually shows a different plan choice on quarter-end (planner picks seq scan when it should use the index, because stale stats overestimate row count).

**Mitigation order:**

1. **Statistics:** add an explicit `ANALYZE` step at the end of the accounting batch. 30 seconds of work; biggest leverage. Many quarter-end pipelines forget this.
2. **Vacuum:** tighten autovacuum on hot tables: `ALTER TABLE journal SET (autovacuum_vacuum_scale_factor = 0.05, autovacuum_analyze_scale_factor = 0.02);` so it kicks in earlier.
3. **Lock contention:** identify which queries block. Reports should use READ ONLY, REPEATABLE READ (snapshot isolation) if possible — they take a snapshot and don't block writers, and writers don't block them. The default READ COMMITTED is fine but contention on row updates may be the problem.
4. **Materialized views for hot reports:** the top 5 reports refreshed at 5 PM, 7 PM, 9 PM, 11 PM on the last day. Reads hit MVs; writes happen on the underlying tables. `REFRESH CONCURRENTLY` to avoid blocking.
5. **Connection pool capacity:** increase pool for the predictable quarter-end window (HPA on app pods, or temporary pool config).
6. **Partitioning:** if the journal table has crossed 100M rows, partition by month. Keeps quarter-end touched data small per query.

**Permanent runbook for quarter-end:**

- Pre-quarter-end: run `VACUUM ANALYZE` on all reporting tables 24h before.
- Stage 1 of quarter-end batch: load + ANALYZE.
- Spin up extra pool capacity 2 hours before peak.
- Monitor specifically for slow-query alerts during the window; on-call is staffed.

**Validation.**

- Replay full quarter-end traffic in staging quarterly. Catch regressions before finance team sees them.
- Track quarter-over-quarter: how long did the SAME report take last quarter vs this quarter? Trend up = creeping issue.

**Lessons (postmortem material).**

- Reactive monitoring (alerted only when finance complained) → proactive (alarm on >2 min response on top reports).
- Stats refresh missing from data-load workflow.
- No staging traffic replay for quarter-end-shaped workloads.

**Stakeholder comms.**

- Each quarter, finance is told: "We've cut quarter-end peak from 90 min to under 5 min with [these fixes]." Trend graph visible to CFO.

**rubric:** 25-pt: identifies the 5 candidate causes (5) + replay-in-staging methodology (3) + ANALYZE-after-bulk-load fix (3) + autovacuum tuning (2) + lock isolation level discussion (3) + materialized views for hot reports (3) + connection pool capacity (2) + permanent runbook (2) + quarter-over-quarter trend tracking (2).

**watermark_seed:** qorium-sqldata-v0.6-098-seed-3c2a8e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-098
**bias_check_notes:** No bias.

---

### QUESTION 99: Casestudy — Disaster Recovery Failure (Very Hard - Casestudy)

**question_id:** QOR-SQLDATA-099
**skill_id:** senior-sqldata-099
**sub_skill_id:** dr-failure-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Production Postgres DB (3TB) becomes unrecoverable at 2 AM (storage controller corrupts data). The team executes failover. Streaming replica IS available but PITR restore fails (WAL gap discovered). Walk through recovery decisions, what likely went wrong, what to commit to permanently. Indian fintech context — regulatory clock ticking. (Limit: 800 words.)

**answer_key:**

**First 30 minutes — orient and decide.**

The decision tree:
- Replica intact? Promote to primary. RPO = replication lag at the moment of corruption (typically <1 second). This is the right answer when a replica exists.
- WAL gap during PITR means: WAL archive shipping was broken. Either the gap is small (replay across the gap = data loss bounded by gap), or the gap is large (replica is the only viable source).

**Mitigation — promote the replica.**

- Promote streaming replica (`pg_promote()` or your HA tool's failover command). Application reconnects to new primary.
- Production resumes. RPO = (time of last replication into replica) before primary corruption.
- Note: if replication lag was, say, 200ms at corruption, you've lost 200ms of writes (acceptable for most workloads; UNACCEPTABLE for finance-grade ledger writes).

**Investigate the WAL gap.**

- Why was the WAL archive incomplete? Common causes:
  - WAL archive shipping (e.g., to S3) was broken silently for the past N days; cron failure; permission expiry; bucket-region mismatch.
  - `archive_command` returning success without actually shipping.
  - Storage filling up, archive script failing.
- This is a CRITICAL post-incident finding. The team's DR posture was implicitly broken.

**Reconstruct the lost writes.**

- If replica RPO (e.g., 200ms) is acceptable: declare incident over with that boundary.
- If lost writes are critical (financial transactions): identify them via application logs, message-bus DLQ, and external systems (audit trail with the bank's settlement records). Replay manually with operator review.
- Regulatory: file an incident report with RBI / financial regulator within the SLA (typically 24h).

**Day 1-7 follow-up.**

1. **Restore-drill.** Within 7 days, demonstrate a full PITR + WAL replay to a fresh cluster from the (now-fixed) backup. Audit-able evidence that DR works.
2. **Root cause the WAL gap.** Why did the team not know? — almost always: monitoring of archive freshness was absent or the alarm was ignored. Add `last_archived_wal` Prometheus alert (page if > 5 minutes old).
3. **Multi-replica.** Add a second async replica in a different AZ — single-replica + corrupted-primary is a brittle topology; two replicas reduces this risk.
4. **Synchronous replication for ledger.** For finance-grade tables, set `synchronous_commit = on` and sync replication to the in-region replica. RPO becomes ~0 at the cost of write latency. Trade-off worth taking for ledger; not for everything.
5. **External off-site backup.** Beyond WAL archive, take periodic logical dumps to a different cloud / region for a "last-resort" backup. Tests the rebuild path.

**Postmortem (full week 1):**

- Five-Whys: WAL gap → archive_command silently broken → no monitoring → freshness alarm not implemented → DR drills weren't done.
- Concrete commitments with owners + dates: (a) DR drill quarterly (DBA, +30d); (b) `last_archived_wal` alarm + paging (SRE, +14d); (c) second replica (DBA, +21d); (d) sync replication for ledger tables (eng-finance, +30d); (e) annual third-party DR audit (CISO, +90d).

**Regulatory comms.**

- File incident report within 24h per RBI cyber-security framework (or relevant jurisdiction).
- Customer-facing comms: factual incident summary, mitigation steps, no minimization. Compliance-team approved language.
- Internal: blameless postmortem; the people who broke the archive script aren't the failure — the system that didn't surface the breakage is.

**Lessons.**

- "Untested backups don't exist." If your team hasn't restored from backup in a quarter, your RPO is unknown.
- Synchronous replication is the only way to get true RPO=0 for write commits; pay for it where data loss is unacceptable.
- Multi-tier DR: replica + WAL + logical dump + cross-region backup. Single-point-of-failure is anti-pattern.
- Quarterly DR drills are the discipline that converts theory to verified posture.

**rubric:** 25-pt: promote-replica decision with RPO trade-off (4) + WAL-gap diagnosis (silent archive failure) (4) + lost-writes reconstruction via app + external systems (3) + last_archived_wal alarm (3) + sync replication for ledger (3) + DR drill cadence (3) + regulatory reporting timing (2) + blameless postmortem framing (3).

**watermark_seed:** qorium-sqldata-v0.6-099-seed-8c2a4e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-099
**bias_check_notes:** No bias. India fintech regulatory context.

---

### QUESTION 100: Casestudy — Data Mesh vs Data Warehouse (Very Hard - Casestudy)

**question_id:** QOR-SQLDATA-100
**skill_id:** senior-sqldata-100
**sub_skill_id:** data-mesh-vs-warehouse
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Zhamak Dehghani "Data Mesh"; Snowflake, BigQuery docs

**body:** A 600-engineer org has a central data team bottleneck: 6-week lead time for any new pipeline; analytics for 12 product domains. CTO is debating "should we adopt data mesh" or "double the central team." Recommend with reasoning. (Limit: 800 words.)

**answer_key:**

**Recommendation: Apply data-mesh PRINCIPLES selectively, but do NOT do "full data mesh" at this size. The right answer is hybrid.**

**Why not "full data mesh."**

Data mesh as Dehghani originally articulated requires:
- Domain ownership of data products (each domain owns its data + APIs)
- Self-serve infrastructure platform
- Federated computational governance
- Data-as-a-product mindset

At 600 engineers across 12 domains, you have the scale to benefit BUT:
- Most domains lack a data engineer; mesh assumes federated capability.
- Self-serve platform takes 12-24 months to build well.
- "Federated governance" without strong central guidance becomes "no governance."
- Pure mesh works at much larger orgs (Zalando, Intuit, Netflix) where the platform investment is justified.

**Why not "double the central team."**

- Doesn't fix the bottleneck — adds capacity but the central-team-as-router pattern still scales poorly. 6-week lead time becomes 4-week. Symptomatic, not structural.
- Engineers in domains know their domain; central team translates. Translation overhead is the real bottleneck.

**Hybrid approach (12-month plan).**

**Phase 1: Tier the data assets.**

- **Platform tier (central team, ~25-30 engineers):** the warehouse platform itself (Snowflake/BigQuery), dbt CI/CD, data catalog, ingestion infra (Fivetran, Airbyte), governance tooling. NOT pipelines themselves.
- **Domain tier (domain-embedded, ~1-2 data engineers per high-traffic domain, ~10-15 total):** owns their own pipelines (dbt models in shared repo + their own subdir + their own CI). Reports to domain product team; dotted line to central data team.
- **Long-tail domains (no data engineer):** central team builds + maintains their pipelines, charged back to domain. Forces a conversation about whether the work justifies a domain hire.

**Phase 2: Self-serve platform.**

- Templates for new pipelines (`dbt project init my-domain`).
- Centralized data catalog (Atlan/DataHub) — every domain's data products discoverable.
- Service-level commitments (SLOs) per data product: freshness, completeness, schema stability.
- A "data product" has an owner, a contract (schema), an SLO, and observability.

**Phase 3: Federated governance.**

- Central team defines: PII tagging conventions, GDPR/erasure pipeline, naming standards, schema review process for "platinum" assets used cross-domain.
- Domain teams own: their data product quality, their domain semantics.
- Cross-domain conflicts: a federated governance committee with rotating domain reps.

**Phase 4: Adoption.**

- Migrate 3 high-traffic domains in months 0-6 (proof-of-concept). Prove the lead-time improves.
- Migrate the rest in months 6-12.
- Continuously measure: lead time per pipeline, pipeline reliability, data product adoption.

**Why this works at 600 engineers / 12 domains.**

- Big enough to justify the platform investment.
- Small enough that federated-not-distributed governance still works.
- Avoids the central-team scaling cliff (which doubling doesn't fix).
- Doesn't bet on the most-mature data-mesh ideal that few orgs achieve.

**Risks.**

- Domain hiring: 12-15 data engineers is a real talent investment. Plan for senior-level (T-shaped engineers who can do both domain + data).
- Central-team morale: framing matters. They become "platform team" (high-leverage), not "demoted from data ownership."
- Drift between domain implementations: governance committee + linting in dbt CI catches the worst.

**Cost.**

- 25 platform + 15 domain (vs 12 today doubled to 24): roughly the same headcount, redistributed. Migration cost ~12 months of overhead. ROI: lead time 6 weeks → 1-2 weeks. Trans-org velocity gain that compounds.

**Anti-pattern to avoid.**

"Data mesh in name only" — central team renames itself "platform" but still owns all pipelines. That's pretending. Domain ownership requires domain-team capability; build it or don't claim mesh.

**Trigger to evaluate full mesh.**

If org grows to 2000+ engineers with 30+ domains, full mesh becomes more justified. At 600/12, hybrid is the right scale.

**rubric:** 25-pt: rejects pure-mesh + central-doubling with reasoning (4) + tiered approach (platform + domain + long-tail) (5) + 12-month phased plan (3) + federated governance with central guardrails (3) + measurable lead-time goal (2) + risks: hiring, morale, drift (3) + when-NOT-to-mesh / when-to-evaluate-full-mesh trigger (3) + anti-pattern (mesh-in-name-only) called out (2).

**watermark_seed:** qorium-sqldata-v0.6-100-seed-2c8a4e7b
**variant_seed:** qorium-sqldata-v0.6-2026-05-07-100
**bias_check_notes:** No bias.

---

## End SQL/Data 081-100. Cumulative: SQL/Data now at 100/100 ✅. 4 of 8 Wave-1 sub-skills closed.
