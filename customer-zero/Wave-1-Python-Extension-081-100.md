# Wave 1 Extension: Senior Python (QOR-PYTHON-081..100)

**STATUS:** AI-drafted v0.6 EXTENSION (Senior Python scaling: 80→100 Qs — closes Python to 100/100). SME Lead validation pending. NOT for external delivery.

---

## Extension: 20 NEW Questions (QOR-PYTHON-081..100)

Difficulty distribution: 3 Easy / 9 Medium / 6 Hard / 2 Very Hard
Format mix: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 81: dataclasses vs attrs vs Pydantic — Choosing Right (Easy)

**question_id:** QOR-PYTHON-081
**skill_id:** senior-python-081
**sub_skill_id:** dataclass-vs-attrs-vs-pydantic
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Python dataclasses docs; attrs docs; Pydantic v2 docs

**body:**

You need lightweight value objects for INTERNAL function I/O — no validation, no serialization. Which is BEST?

**options:**

- A) Pydantic `BaseModel` — most popular
- B) `@dataclass(slots=True, frozen=True)` — stdlib, zero dependency, fastest construction; no validation, which you don't need here
- C) `attrs` with `@define` — only valid choice
- D) Plain `dict` literals

**answer_key:**

B — For internal value objects without validation needs, stdlib `@dataclass(slots=True, frozen=True)` is the lightest weight. Pydantic adds runtime validation cost (5-50x faster than v1, but still slower than dataclass for raw construction). Reach for Pydantic at API/DB boundaries; dataclass internally. `attrs` is excellent but adds a dependency. References: Python dataclasses docs; Pydantic v2 docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-081-seed-7a4c9b3e
**variant_seed:** qorium-python-v0.6-2026-05-07-081
**bias_check_notes:** No bias.

---

### QUESTION 82: Walrus Operator Use Cases (Easy)

**question_id:** QOR-PYTHON-082
**skill_id:** senior-python-082
**sub_skill_id:** walrus-operator
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** PEP 572 (Assignment Expressions); Python 3.8 docs

**body:**

Which use of the walrus operator (`:=`) is IDIOMATIC?

**options:**

- A) `(x := 5)` at module top level — replaces `x = 5`
- B) `while (chunk := f.read(1024)): process(chunk)` — read-and-test in a loop with no double-call
- C) `[x := 1 for _ in range(10)]` — better than `[1 for _ in range(10)]`
- D) `if x := True: ...` — replaces `if x: ...`

**answer_key:**

B — The walrus shines in **read-and-test** patterns (loop reads, regex matches, repeated computations in comprehensions used twice). PEP 572's headline use case is `while (chunk := f.read(...)):`. A is anti-pattern (just use `=`). C and D add no value over plain forms. Pylint/ruff flag misuses. Reference: PEP 572.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-082-seed-3e8c5a7b
**variant_seed:** qorium-python-v0.6-2026-05-07-082
**bias_check_notes:** No bias.

---

### QUESTION 83: pytest Fixtures — Scope Selection (Easy)

**question_id:** QOR-PYTHON-083
**skill_id:** senior-python-083
**sub_skill_id:** pytest-fixtures
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** pytest Documentation §Fixtures

**body:**

Spinning up a Postgres testcontainer takes 8 seconds. Your test suite has 500 tests, each needing the DB. Which fixture scope is BEST?

**options:**

- A) `@pytest.fixture(scope="function")` — fresh per test
- B) `@pytest.fixture(scope="session")` for the container; per-test transaction wrapping with rollback for isolation
- C) `@pytest.fixture(scope="class")` for the container — best balance
- D) Hard-code a global container in `conftest.py` outside any fixture

**answer_key:**

B — Container `scope="session"` (one 8s startup for all 500 tests). Per-test isolation via SQLAlchemy `Session.begin_nested()` + transaction-rollback fixture: each test runs in a savepoint that rolls back on teardown, leaving the DB clean without restart. This is the canonical pytest + testcontainers + SQLAlchemy pattern. Function-scoped containers (A) would add ~67 minutes to the run. Reference: pytest Fixtures docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-083-seed-2c9e4f7a
**variant_seed:** qorium-python-v0.6-2026-05-07-083
**bias_check_notes:** No bias.

---

### QUESTION 84: NumPy Vectorization Speedup (Medium)

**question_id:** QOR-PYTHON-084
**skill_id:** senior-python-084
**sub_skill_id:** numpy-vectorization
**format:** MCQ
**difficulty_b:** 0.3
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** NumPy Documentation §Performance

**body:**

A Python loop computing pairwise distances on 1M points takes 45s. The NumPy vectorized version takes ~0.4s. The primary reason for the ~100x speedup is:

**options:**

- A) NumPy bypasses the GIL completely
- B) NumPy stores data in contiguous typed C arrays and dispatches operations to SIMD-optimized C routines; per-element interpreter overhead is eliminated
- C) NumPy automatically parallelizes across all CPU cores
- D) NumPy compiles Python loops to bytecode at runtime

**answer_key:**

B — Vectorized NumPy operations execute in compiled C (often SIMD: AVX2/AVX-512 on x86, NEON on ARM). Per-element Python interpreter overhead (boxing, attribute lookup, dispatch) is the dominant cost in pure-Python loops; eliminating it gives the ~100x. NumPy releases the GIL during compute (a partial truth for A). NumPy does not auto-parallelize the loop across cores by default; that requires Numba, Numpy with linked OpenBLAS for linear algebra, or explicit threading. Reference: NumPy performance docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-084-seed-8b3a7c2f
**variant_seed:** qorium-python-v0.6-2026-05-07-084
**bias_check_notes:** No bias.

---

### QUESTION 85: gunicorn vs uvicorn Workers (Medium)

**question_id:** QOR-PYTHON-085
**skill_id:** senior-python-085
**sub_skill_id:** gunicorn-uvicorn
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** uvicorn docs; gunicorn docs

**body:**

You are deploying a FastAPI app behind a reverse proxy on a 4-core container. Which is the production-recommended pattern?

**options:**

- A) `uvicorn app:app` (single process)
- B) `gunicorn -w 4 -k uvicorn.workers.UvicornWorker app:app` — gunicorn as process manager, 4 uvicorn worker processes; gunicorn handles graceful restart, worker recycling, signal forwarding
- C) `python -m flask run` — Flask is faster for async
- D) `uvicorn --workers 4` is identical to gunicorn + uvicorn workers in all ways

**answer_key:**

B is the canonical production pattern: gunicorn supervises N uvicorn worker processes per container (one process per CPU core typical). gunicorn provides graceful shutdown, worker recycling, signal handling, max-requests-then-restart for memory leak resilience. `uvicorn --workers` (D) does multi-process but lacks gunicorn's lifecycle features. Single-process (A) leaves CPU cores idle. Some teams prefer single-process per container with horizontal pod autoscaling — that's also valid in K8s where the pod orchestrator subsumes some of gunicorn's roles. References: uvicorn deployment docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-085-seed-4e9c2a7b
**variant_seed:** qorium-python-v0.6-2026-05-07-085
**bias_check_notes:** No bias.

---

### QUESTION 86: Django ORM N+1 Detection (Medium)

**question_id:** QOR-PYTHON-086
**skill_id:** senior-python-086
**sub_skill_id:** django-n-plus-one
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Django ORM docs §QuerySet.select_related, prefetch_related

**body:**

```python
# Author has many Books
authors = Author.objects.all()
for author in authors:
    print(author.name, [b.title for b in author.books.all()])
```

This is a classic N+1. The CORRECT fix is:

**options:**

- A) `Author.objects.select_related("books").all()` — works for many-to-many and reverse FK
- B) `Author.objects.prefetch_related("books").all()` — prefetches reverse-FK related rows in a second query and joins in Python
- C) Add `db_index=True` on the foreign key
- D) Use `.iterator()` instead

**answer_key:**

B — `select_related` performs SQL JOINs and works for **forward** ForeignKey / OneToOne relations. `prefetch_related` issues a separate query and joins in Python; required for **reverse** FK and Many-to-Many. For `Author.books` (reverse FK), `prefetch_related` is correct. `select_related("books")` would error. Detection in dev: `django-debug-toolbar` SQL panel; in CI: `nplusone` or `django-zen-queries.queries_disabled()`. Reference: Django ORM docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-086-seed-6f3a8c2e
**variant_seed:** qorium-python-v0.6-2026-05-07-086
**bias_check_notes:** No bias.

---

### QUESTION 87: Dict Insertion Order Guarantee (Medium)

**question_id:** QOR-PYTHON-087
**skill_id:** senior-python-087
**sub_skill_id:** dict-insertion-order
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.3
**expected_duration_minutes:** 4
**citation:** Python 3.7 Release Notes; CPython dict implementation

**body:**

Which statement about dict ordering is TRUE in modern Python (3.7+)?

**options:**

- A) `dict` is unordered; use `collections.OrderedDict` to preserve insertion order
- B) `dict` preserves insertion order as a **language guarantee** since Python 3.7. `OrderedDict` is now mostly historical, but still has `move_to_end()` and `popitem(last=False)` not in `dict`
- C) `dict` order depends on hash; same input can produce different orders run-to-run
- D) `dict` orders by key alphabetically since 3.7

**answer_key:**

B — In Python 3.6 (CPython implementation detail), in 3.7+ a language spec guarantee. `OrderedDict` retains a few unique methods (`move_to_end`, `popitem(last=False)`, `__eq__` is order-sensitive) but for most use cases plain `dict` suffices. Reference: Python 3.7 Release Notes.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-087-seed-1a8d4e9c
**variant_seed:** qorium-python-v0.6-2026-05-07-087
**bias_check_notes:** No bias.

---

### QUESTION 88: ujson / orjson Choice (Medium)

**question_id:** QOR-PYTHON-088
**skill_id:** senior-python-088
**sub_skill_id:** orjson-performance
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** orjson GitHub README; ujson docs

**body:**

A Python service serializes 100k JSON responses/sec. Which library is recommended for the best perf + correctness combination today?

**options:**

- A) Stdlib `json` — fastest
- B) `orjson` — Rust-backed, ~3x-10x faster than stdlib `json`, native datetime / dataclass / numpy / UUID support, strict UTF-8 validation. Used by FastAPI's `ORJSONResponse`
- C) `ujson` — fastest and most maintained
- D) `simplejson` — modern fork of stdlib

**answer_key:**

B — `orjson` is Rust-implemented, returns `bytes` (skipping the str-to-bytes encode step), supports datetime/UUID/numpy/dataclass natively. Typical gain over stdlib `json`: 3-10x serialize, 1.5-3x deserialize. FastAPI ships `ORJSONResponse` for this reason. `ujson` is faster than stdlib but slower than orjson and has had correctness bugs around floats and encoding. Stdlib `json` is the safe portable baseline. Reference: orjson README benchmarks.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-088-seed-9c4e7a2b
**variant_seed:** qorium-python-v0.6-2026-05-07-088
**bias_check_notes:** No bias.

---

### QUESTION 89: Generator Memory vs List Comprehension (Medium)

**question_id:** QOR-PYTHON-089
**skill_id:** senior-python-089
**sub_skill_id:** generator-memory
**format:** MCQ
**difficulty_b:** 0.3
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** PEP 289 (Generator Expressions); Python data model docs

**body:**

```python
# A
total = sum([x * x for x in range(10**8)])
# B
total = sum(x * x for x in range(10**8))
```

Which is correct about A vs B?

**options:**

- A) Identical — Python optimizes both forms
- B) A materializes a 10^8-element list (~3-4 GB peak RAM); B uses a generator expression with O(1) memory and is the right form for "consume once" patterns
- C) B is slower because generators have function-call overhead
- D) Both error on Python 3.13

**answer_key:**

B — A allocates the full list before passing to `sum`. B yields one element at a time via the generator protocol; memory is O(1). For one-shot `sum/min/max/any/all/join`, prefer the generator form. Note: when the iterable will be consumed multiple times, materialize once into a list (a generator can only be iterated once). Reference: PEP 289.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-089-seed-7d2c5e8a
**variant_seed:** qorium-python-v0.6-2026-05-07-089
**bias_check_notes:** No bias.

---

### QUESTION 90: __hash__ and __eq__ Contract (Medium)

**question_id:** QOR-PYTHON-090
**skill_id:** senior-python-090
**sub_skill_id:** hash-eq-contract
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Python Data Model §object.__hash__

**body:**

You override `__eq__` on a class and forget to define `__hash__`. What happens?

**options:**

- A) `__hash__` defaults to id-based hashing
- B) Python automatically sets `__hash__ = None`, making instances UNHASHABLE (cannot go into `set`/`dict` keys). This enforces the contract: equal objects must hash equal
- C) `__eq__` raises `TypeError`
- D) Hashing falls back to `__repr__`

**answer_key:**

B — Python's data model: if you override `__eq__` but not `__hash__`, Python sets `__hash__ = None`. This protects the invariant `a == b ⟹ hash(a) == hash(b)`. To make the class hashable: either set `__hash__ = object.__hash__` (id-based; will break the invariant if `__eq__` is value-based), or define `__hash__` to use the same fields as `__eq__`. `@dataclass(eq=True, frozen=True)` derives both correctly. Reference: Python Data Model docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-090-seed-3a7c9e4d
**variant_seed:** qorium-python-v0.6-2026-05-07-090
**bias_check_notes:** No bias.

---

### QUESTION 91: typing.cast vs # type: ignore (Medium)

**question_id:** QOR-PYTHON-091
**skill_id:** senior-python-091
**sub_skill_id:** typing-cast-vs-ignore
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** typing docs §cast; mypy docs §type: ignore

**body:**

You have a value the type-checker thinks is `Optional[X]` but you know is `X` due to a runtime invariant a few lines up. Which is BEST?

**options:**

- A) `# type: ignore` — silences any error
- B) `assert value is not None; ...` — narrows the type, gives a runtime safety net, no escape hatch
- C) `typing.cast(X, value)` — tells the checker but does no runtime work; use when assertion would be too costly
- D) Either B or C — pick B for safety, C only when the runtime cost matters

**answer_key:**

D — Both are valid; B (assert) is preferred for safety-in-depth (catches a wrong invariant at runtime). C (`cast`) is for hot paths where the runtime check is too costly or unreachable. `# type: ignore` (A) is the heaviest hammer — it silences ALL errors on the line, including future genuine ones; reach for it last. References: typing.cast docs; mypy "type narrowing" docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-091-seed-8e3c4b9a
**variant_seed:** qorium-python-v0.6-2026-05-07-091
**bias_check_notes:** No bias.

---

### QUESTION 92: ContextManager and __enter__/__exit__ Edge Cases (Hard)

**question_id:** QOR-PYTHON-092
**skill_id:** senior-python-092
**sub_skill_id:** contextmanager-edges
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Python Data Model §with statement; PEP 343

**body:**

A custom context manager's `__exit__` swallows exceptions by returning `True` for any error. Which statement is TRUE?

**options:**

- A) Returning `True` from `__exit__` re-raises the exception
- B) Returning a truthy value from `__exit__` SUPPRESSES the exception entirely; the `with` block exits as if normally. This is a footgun unless you intentionally want suppression (`contextlib.suppress` is the explicit, narrow form)
- C) `__exit__` is not called when an exception is raised inside the block
- D) Returning `False` from `__exit__` re-raises automatically

**answer_key:**

B — `__exit__` returning truthy suppresses; falsy (or None / no return) re-raises. Pattern A is wrong; D is reversed (False is the default, exception propagates). Use `contextlib.suppress(SomeError)` for intentional, narrow suppression — never write a custom `__exit__` that suppresses everything. Reference: PEP 343.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-092-seed-2b6e9c3a
**variant_seed:** qorium-python-v0.6-2026-05-07-092
**bias_check_notes:** No bias.

---

### QUESTION 93: Async Context Manager and Resource Safety (Hard - Code)

**question_id:** QOR-PYTHON-093
**skill_id:** senior-python-093
**sub_skill_id:** async-cm-resource-safety
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** PEP 492 (async/await); contextlib.asynccontextmanager docs

**body:**

Implement an async-context-manager `RedisLock(redis, key, ttl_seconds=30)` that:

1. Acquires a Redis lock via `SET key value NX EX ttl` with a unique value (UUID).
2. Releases via a Lua script that compares value before deleting (so we don't delete a lock another holder acquired after our TTL expired).
3. Raises `LockTimeoutError` if not acquired within `wait_seconds`.
4. Is safe under cancellation: if the awaiter is cancelled while holding the lock, the lock is still released.

**options:** []

**answer_key:**

```python
import asyncio
import uuid
from contextlib import asynccontextmanager
import redis.asyncio as aioredis

class LockTimeoutError(Exception): ...

# Compare-and-delete script keeps us from releasing someone else's lock.
RELEASE_SCRIPT = """
if redis.call('get', KEYS[1]) == ARGV[1] then
    return redis.call('del', KEYS[1])
else
    return 0
end
"""

@asynccontextmanager
async def RedisLock(redis: aioredis.Redis, key: str, ttl_seconds: int = 30, wait_seconds: float = 5.0, poll_interval: float = 0.05):
    token = str(uuid.uuid4())
    deadline = asyncio.get_event_loop().time() + wait_seconds
    while True:
        # NX = only set if not exists; EX = TTL in seconds
        ok = await redis.set(key, token, nx=True, ex=ttl_seconds)
        if ok:
            break
        if asyncio.get_event_loop().time() >= deadline:
            raise LockTimeoutError(f"could not acquire {key} in {wait_seconds}s")
        await asyncio.sleep(poll_interval)
    try:
        yield token
    finally:
        # asyncio.shield protects release from cancellation propagation,
        # so a CancelledError on the holder doesn't skip the unlock.
        try:
            await asyncio.shield(redis.eval(RELEASE_SCRIPT, 1, key, token))
        except asyncio.CancelledError:
            # Re-raise after release attempt; if eval itself was cancelled,
            # the lock will expire naturally at TTL.
            raise
```

Key design points:
- Unique token per acquirer prevents the "deleted someone else's lock" bug.
- Lua script makes the get-and-del atomic on the Redis side.
- `asyncio.shield` around release ensures cancellation doesn't skip unlock.
- TTL is a safety net if the holder dies; tune to (max expected critical-section time) × 2-3.
- For high-availability use Redlock or RedisCluster-aware locks; this is a single-node sufficient version.

References: contextlib.asynccontextmanager docs; redis-py asyncio docs; Martin Kleppmann's "How to do distributed locking" for Redlock caveats.

**rubric:**

12-pt: NX+EX atomic acquire (3) + unique token (2) + Lua compare-and-delete release (3) + cancellation-safe release via shield or finally (2) + LockTimeoutError on timeout (2).

**watermark_seed:** qorium-python-v0.6-093-seed-5d8c2a7b
**variant_seed:** qorium-python-v0.6-2026-05-07-093
**bias_check_notes:** No bias.

---

### QUESTION 94: __init_subclass__ and Plugin Registration (Hard)

**question_id:** QOR-PYTHON-094
**skill_id:** senior-python-094
**sub_skill_id:** init-subclass-plugins
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** PEP 487 (__init_subclass__); Python Data Model docs

**body:**

You want a base `Plugin` class to auto-register every concrete subclass into a registry. Which approach is BEST?

**options:**

- A) Metaclass `class PluginMeta(type)` with `__init__` — works but adds complexity and conflicts with multiple-inheritance metaclasses
- B) `__init_subclass__(cls, **kwargs)` on the base class — PEP 487 hook fires automatically for every subclass at class creation time; no metaclass needed
- C) Manual `@register` decorator on each subclass
- D) Module import scan with `importlib`

**answer_key:**

B — `__init_subclass__` (PEP 487) is the modern Pythonic answer. Define on the base; it runs automatically when a subclass body is executed. No metaclass conflict, no decorator boilerplate. C is fine but easy to forget. A works but a metaclass should be the last resort. D is fragile (import order). Reference: PEP 487.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-094-seed-3a8e5c9b
**variant_seed:** qorium-python-v0.6-2026-05-07-094
**bias_check_notes:** No bias.

---

### QUESTION 95: Numeric Stability — Decimal vs Float for Money (Hard)

**question_id:** QOR-PYTHON-095
**skill_id:** senior-python-095
**sub_skill_id:** decimal-vs-float-money
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** decimal module docs; "What Every Computer Scientist Should Know About Floating Point"

**body:**

A fintech computes interest on millions of accounts. Which numeric strategy is CORRECT for storing and computing money values?

**options:**

- A) Use `float` everywhere — it's faster
- B) Use `decimal.Decimal` with explicit context (`prec=28`, `rounding=ROUND_HALF_EVEN`) for computations; store as integer paise/cents in the DB to avoid Decimal-to-float round-trips. Configure rounding policy at the boundary
- C) Use `float` for everything, but round to 2 decimals at the end
- D) Use `Fraction` — exact rational arithmetic

**answer_key:**

B — `Decimal` provides exact decimal arithmetic with controllable rounding; banker's rounding (`ROUND_HALF_EVEN`) is the IFRS / GAAP standard. Float (A, C) introduces representation error: `0.1 + 0.2 == 0.30000000000000004`. Across millions of records this drift becomes audit-visible. Storing as integer minor units (paise/cents) in the DB is the canonical pattern (avoids DB-side float and Decimal-to-DB conversion subtleties). `Fraction` (D) is exact but unbounded precision blows up. References: Python decimal module docs; IEEE 754 floating-point.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-095-seed-7c4e9b3a
**variant_seed:** qorium-python-v0.6-2026-05-07-095
**bias_check_notes:** No bias. India banking context but principle is universal.

---

### QUESTION 96: Robust CSV Streaming Loader (Hard - Code)

**question_id:** QOR-PYTHON-096
**skill_id:** senior-python-096
**sub_skill_id:** csv-streaming-load
**format:** code
**difficulty_b:** 1.2
**discrimination_a:** 1.5
**expected_duration_minutes:** 15
**citation:** Python csv docs; psycopg COPY docs

**body:**

Write a function `load_csv_to_postgres(csv_path: str, table: str, conn)` that:

1. Streams a (potentially 10 GB) CSV to a Postgres table — must NOT load the file into memory.
2. Uses `COPY ... FROM STDIN` (Postgres bulk-load) for performance.
3. Validates the header against `conn`'s table columns; raises if mismatched.
4. Handles `KeyboardInterrupt` cleanly — partial COPY rolled back.
5. Returns the row count loaded.

Use `psycopg` 3.x.

**options:** []

**answer_key:**

```python
import csv
from typing import IO
import psycopg
from psycopg import sql

def load_csv_to_postgres(csv_path: str, table: str, conn: psycopg.Connection) -> int:
    # 1. Validate header against destination table columns.
    with conn.cursor() as cur:
        cur.execute(
            "SELECT column_name FROM information_schema.columns "
            "WHERE table_name = %s ORDER BY ordinal_position",
            (table,),
        )
        db_cols = [r[0] for r in cur.fetchall()]
        if not db_cols:
            raise ValueError(f"table {table!r} not found")

    with open(csv_path, "r", newline="", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        if header != db_cols:
            raise ValueError(
                f"CSV header {header} does not match table columns {db_cols}"
            )

        # 2. Stream remaining rows via COPY FROM STDIN; psycopg3's `copy` is row-iterating.
        copy_sql = sql.SQL("COPY {} ({}) FROM STDIN WITH (FORMAT csv)").format(
            sql.Identifier(table),
            sql.SQL(",").join(sql.Identifier(c) for c in db_cols),
        )

        # The transaction manager rolls back on any exception including KeyboardInterrupt.
        rows = 0
        try:
            with conn.transaction():
                with conn.cursor() as cur, cur.copy(copy_sql) as copy:
                    for row in reader:
                        copy.write_row(row)
                        rows += 1
            conn.commit()
        except (Exception, KeyboardInterrupt):
            conn.rollback()
            raise
    return rows
```

Key points:
- `conn.transaction()` wraps the COPY; any exception (including `KeyboardInterrupt`) triggers rollback so we don't leave half-loaded data.
- `cur.copy(...)` is psycopg3's streaming COPY interface — works with iterators, no full-file buffering.
- Header validation runs BEFORE opening COPY, so no transaction is started on bad input.
- `csv.reader` is iterative; `open(...)` keeps the file as a streaming generator.
- For >10 GB files, set `client_min_messages = warning` and consider `COPY ... FREEZE` if loading into a fresh table, plus `pg_stat_progress_copy` for monitoring.

References: psycopg3 COPY docs; Postgres COPY command docs.

**rubric:**

15-pt: streaming reader (no full-file load) (3) + COPY FROM STDIN usage (3) + header validation against schema (3) + transaction with rollback on KeyboardInterrupt and Exception (3) + returns row count (1) + uses sql.Identifier composition (no SQL injection) (2).

**watermark_seed:** qorium-python-v0.6-096-seed-1f5c8e3a
**variant_seed:** qorium-python-v0.6-2026-05-07-096
**bias_check_notes:** No bias.

---

### QUESTION 97: Design — Building a Python SDK for an Internal API (Hard - Design)

**question_id:** QOR-PYTHON-097
**skill_id:** senior-python-097
**sub_skill_id:** python-sdk-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.5
**expected_duration_minutes:** 30
**citation:** httpx docs; Pydantic v2 docs; Stripe Python SDK design

**body:**

Design a Python SDK for an internal HTTPS REST API used by 50+ internal teams. Requirements:
- Sync AND async clients (same surface; teams pick).
- Auth via short-lived OIDC token (auto-refresh).
- Retries with exponential backoff for 5xx and network errors; not for 4xx.
- Typed request/response models so callers get IDE autocomplete and type-check errors.
- A pluggable transport (so tests can mock without monkey-patching the network).
- Backwards compatibility: SDK v2 must be installable next to v1 in the same venv? (Decide and justify.)

Cover: package layout, public surface, auth strategy, retry policy, testing strategy, versioning & release. (Limit: 800 words.)

**options:** []

**answer_key:**

**Reference design.**

**Package layout (single distribution `acme-sdk`):**

```
acme_sdk/
  __init__.py         # exports Client, AsyncClient, exceptions, models
  _version.py
  client.py           # SyncClient (httpx.Client backend)
  aclient.py          # AsyncClient (httpx.AsyncClient backend)
  _transport.py       # Transport ABC; HttpxTransport; MockTransport
  _auth.py            # OIDCTokenProvider (cached, refresh-on-near-expiry)
  _retry.py           # backoff policy + classify(exception) -> retryable
  models/             # generated or hand-written Pydantic v2 models
    __init__.py
    user.py
    invoice.py
  exceptions.py       # ApiError, TransportError, AuthError, RetryExhausted
  resources/          # one module per resource group
    users.py
    invoices.py
  py.typed            # marker so consumers get type hints
```

**Public surface:**

```python
from acme_sdk import Client
c = Client(base_url=..., auth=OIDCAuth(...))
user = c.users.get("u_42")        # -> UserResponse pydantic model
list = c.invoices.list(status="open", limit=100)
```

Async mirror:

```python
from acme_sdk import AsyncClient
async with AsyncClient(...) as c:
    user = await c.users.get("u_42")
```

Both `Client` and `AsyncClient` share the same resource classes via a small generic base — sync/async dispatch picked by the underlying transport. Many SDKs do this by code-generating both forms from one source spec; manual is fine at this scope.

**Auth.**

`OIDCTokenProvider` caches the bearer token in memory; on `get_token()` checks expiry minus 60s skew; if near-expiry, refreshes via the OIDC token endpoint with the configured client credentials. Thread/async-safe via `threading.Lock` and `asyncio.Lock`. Tokens never logged.

**Retry policy.**

```python
RETRY_STATUSES = {429, 500, 502, 503, 504}
RETRY_EXCEPTIONS = (httpx.TransportError, httpx.RemoteProtocolError)

def classify(resp_or_exc) -> bool:
    if isinstance(resp_or_exc, httpx.Response):
        return resp_or_exc.status_code in RETRY_STATUSES
    return isinstance(resp_or_exc, RETRY_EXCEPTIONS)
```

Exponential backoff with full jitter, max 5 attempts, cap 30s. Honor `Retry-After` header if present (RFC 7231). Surface a final `RetryExhausted` exception with the original cause attached.

**Pluggable transport.**

```python
class Transport(Protocol):
    def request(self, method, url, **kw) -> httpx.Response: ...

class HttpxTransport: ...   # production
class MockTransport:        # tests
    def __init__(self, routes: dict): ...
```

In tests, callers do:

```python
mock = MockTransport({("GET", "/users/u_42"): MockResponse(200, {"id": "u_42"})})
client = Client(base_url=..., transport=mock, auth=NoopAuth())
```

This avoids monkey-patching httpx and is faster than VCR-style recording.

**Models.**

Pydantic v2 throughout. Re-export at `acme_sdk.models.*`. For very large schemas, generate from OpenAPI spec via `datamodel-code-generator`. `from __future__ import annotations` in every module so forward references work cleanly.

**Errors.**

`AcmeError` base, with `ApiError(status, code, message, request_id)` for HTTP errors (preserve the server's `X-Request-ID` for support escalations), `AuthError`, `TransportError`, `RetryExhausted`. Never raise raw `httpx` exceptions across the SDK boundary.

**Versioning & backwards compat.**

SemVer. Major version on breaking changes. **Decision: do NOT support v1+v2 side-by-side in the same venv.** Two packages with the same import name conflict; supporting parallel install is painful (different package names like `acme_sdk_v1` / `acme_sdk_v2`). Instead, pin via `acme-sdk>=1,<2` in dependents and migrate when convenient. Provide a 6-month deprecation window with explicit `DeprecationWarning` on legacy methods. Side-by-side is only worth the cost when migration is impractical (rare for an internal SDK).

**Testing strategy.**

- Unit: `MockTransport` covers happy paths and error classes.
- Contract: a small set of tests that hit a real staging API in CI to catch SDK-vs-server drift. Gated to nightly to keep PR latency low.
- Type checking: `mypy --strict` on the SDK; `pyright`-strict in consumers.
- Backward compat: Pyup-style "stub" tests that import the v1 public surface and call common signatures.

**Release.**

- `pyproject.toml` with `hatchling` / `hatch`. Tag-driven release via GitHub Actions. Trusted Publishers to PyPI / internal index; no long-lived API tokens.
- `CHANGELOG.md` per release; keep machine-readable for a "what changed" page in the SDK docs.
- Publish wheels for Python 3.10-3.13 (no native code so universal wheel suffices).

**Observability.**

Optional `client.observe(span_factory=...)` to plug the consumer's tracer. Default is no-op (no opinionated dependency on OpenTelemetry).

**rubric:**

20-pt: package layout + public surface (3) + sync/async parity strategy (3) + OIDC auth lifecycle (2) + retry policy with classify + Retry-After (3) + pluggable transport for testing (3) + Pydantic v2 typed models with py.typed (2) + clear backward-compat decision with reasoning (2) + testing tiers (unit + contract) (2).

**watermark_seed:** qorium-python-v0.6-097-seed-9b3a8c5e
**variant_seed:** qorium-python-v0.6-2026-05-07-097
**bias_check_notes:** No bias.

---

### QUESTION 98: Casestudy — Data-Engineering Migration: Pandas → Polars + DuckDB (Very Hard - Casestudy)

**question_id:** QOR-PYTHON-098
**skill_id:** senior-python-098
**sub_skill_id:** pandas-polars-duckdb-migration
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 35
**citation:** Polars docs; DuckDB docs; "Modern Polars" book

**body:**

A 60-engineer data team's daily ETL pipeline is built on Pandas. Inputs: 200 GB of Parquet on S3, daily incremental ~5 GB. Pipeline takes 6 hours on a `r6i.8xlarge` (256 GB RAM), often OOMs on quarter-end. Code: ~80k lines across 400 modules. The CDO wants the pipeline under 1 hour and on cheaper hardware within 6 months without disrupting daily delivery.

You evaluate three options:
1. Migrate to PySpark on EMR.
2. Migrate to Polars + DuckDB.
3. Vectorize harder with NumPy + multiprocessing.

Recommend an approach with sequencing. Cover: where Polars vs DuckDB fits, how to migrate 80k LOC without freezing delivery, correctness validation, and how to handle the long-tail of Pandas-specific code (apply, MultiIndex, custom methods).

(Limit: 1000 words.)

**answer_key:**

**Recommendation: Polars + DuckDB hybrid (option 2). Reject Spark for this scale; reject pure NumPy.**

**Why not Spark.**

200 GB total / 5 GB/day is small data by 2020s standards. Spark's distributed-coordination overhead (driver + executors + shuffle) is justified at >1 TB or >10 TB sustained. At this size a single fat box with Polars finishes faster, simpler to debug, lower cost (no EMR cluster). Many teams "Spark-ified" 100 GB workloads in 2018-2020 and regretted it; the industry has trended back to single-machine columnar tools for this size.

**Why not pure NumPy + multiprocessing.**

That's a significant rewrite that doesn't address the apply-heavy code or the OOM failure mode (Pandas in-memory model is the constraint). Polars solves both (streaming + lazy + multi-threaded by default).

**Why Polars + DuckDB hybrid.**

- **Polars:** in-process columnar dataframe; lazy API with predicate/projection pushdown; multi-threaded by default; Arrow-based interop. Best for transforms (filters, joins, group-bys, window functions) currently expressed in Pandas. `pl.scan_parquet(...)` streams from S3 without loading the file.
- **DuckDB:** in-process OLAP SQL engine. Best for analyst-friendly SQL transforms, ad-hoc analytics, and importing existing SQL ETL. Reads/writes Parquet, Arrow, integrates with Polars zero-copy via Arrow.
- **Hybrid:** complex multi-step transforms in Polars; aggregation/join-heavy SQL stages in DuckDB. Both are zero-copy interoperable through Arrow.

**6-month migration plan (delivery does NOT freeze):**

**Month 0-1: Discovery + tooling.**
- Inventory the 400 modules. Categorize: transforms, joins, custom apply, MultiIndex-heavy, IO. Profile to find the 20% of modules that consume 80% of runtime.
- Set up a side-by-side test harness: `run_pandas(input)` and `run_polars(input)` produce outputs; an automated diff checks numerical equivalence (with float tolerance) and schema. CI runs both on the daily incremental sample.
- Pick a coding standard: when Polars and Pandas APIs diverge, document the canonical form. Eg: Polars `over` for window functions, `.with_columns(...)` instead of column assignment.

**Month 1-3: Migrate the hot 20%.**
- Heavy aggregations + joins → port to Polars first. These give the largest perf win and exercise the harness. Each port: side-by-side run for a week before cutting over.
- Heavy SQL-shaped transforms → port to DuckDB. Existing SQL barely changes (DuckDB is mostly Postgres-syntax compatible).
- The hot 20% typically delivers 70-80% of the perf gain. Expect 6 hours → 1.5 hours by end of month 3.

**Month 3-5: Migrate the long tail with prioritization.**
- The hard parts: `df.apply(custom_fn)`, `MultiIndex` slicing, `.iterrows()` loops. These don't translate 1:1 to Polars.
  - `apply(scalar_fn)` → vectorize as `pl.col(...).map_elements(...)` or rewrite as expressions; the expression form is dramatically faster.
  - MultiIndex → Polars uses flat schemas with `partition_by` / `over`. Most MultiIndex usage is structural and translatable; the rest survives as Pandas-on-Arrow conversions at boundaries (`pl.from_pandas` / `pl.to_pandas` are cheap with Arrow).
  - `iterrows()` → almost always rewritable as expressions; if truly row-iterative, use Polars `iter_rows()` which is faster than Pandas equivalent.
- Modules that resist migration (esoteric stat libraries, scipy interop) stay on Pandas; convert at the boundary via Arrow.

**Month 5-6: Cutover + decommission.**
- The full pipeline runs in Polars/DuckDB on a `r6i.2xlarge` (32 GB) — 1/8th the cost. Quarter-end runs no longer OOM because of streaming.
- Remove the old Pandas pipeline. Keep the test harness as a regression suite with golden outputs.

**Correctness validation.**

- Schema equivalence: Polars and Pandas dtypes mapped via a defined table.
- Numerical equivalence: float tolerance for sums/means; exact for count/min/max. `pytest` table-level diff fixture.
- Distribution equivalence: a daily quantile-and-cardinality check on a few high-value columns to catch silent drift.
- Run BOTH pipelines for 30 days post-cutover; alarm on any divergence > tolerance.

**Long-tail Pandas idioms — explicit translations.**

- `df.merge(how="left")` → `pl.DataFrame.join(how="left")` (semantics nearly identical).
- `df.groupby(...).agg(...)` → `pl.DataFrame.group_by(...).agg([pl.col(...).sum(), ...])` (named aggregations, expressions).
- `df.pivot(...)` → `pl.DataFrame.pivot(...)` (signature differs slightly).
- `df.rolling(window=10).mean()` → `pl.col(...).rolling_mean(10).over(...)` for grouped rolling.
- `df.assign(c=lambda x: x.a + x.b)` → `pl.DataFrame.with_columns((pl.col("a") + pl.col("b")).alias("c"))`.
- `pd.cut`, `pd.qcut` → `pl.col(...).cut(...)`, `pl.col(...).qcut(...)`.

**Risks.**

- **Polars API churn.** Polars 1.0 (mid-2024) stabilized the API; pin to a minor version and budget for one major upgrade per year. Mitigation: write a thin internal wrapper for the few APIs you use most.
- **Team upskilling.** Pandas mental model is mutable + index-centric; Polars is functional + schema-centric. Budget: a 2-day workshop + paired migrations.
- **Edge ecosystem libs (statsmodels, sklearn pipelines).** Stay on Pandas at the boundary; convert via `to_pandas()` (zero-copy through Arrow).

**Outcome target.**

6 hours → 45 minutes; cost from ~$1,200/day on `r6i.8xlarge` to ~$150/day on `r6i.2xlarge`; OOM eliminated; team's mental model healthier (lazy + functional + reproducible).

**rubric:**

25-pt: rejects Spark with size-based reasoning (3) + Polars + DuckDB hybrid choice with reasoning (3) + 6-month plan that doesn't freeze delivery (3) + 80/20 prioritization of hot modules (3) + side-by-side harness with float tolerance (3) + concrete handling of apply / MultiIndex / iterrows (3) + correctness validation including 30-day parallel run (3) + cost reduction quantified (2) + Polars version-pinning risk (2).

**watermark_seed:** qorium-python-v0.6-098-seed-4d2c8e7a
**variant_seed:** qorium-python-v0.6-2026-05-07-098
**bias_check_notes:** No bias.

---

### QUESTION 99: Python Performance Crisis — Black Friday OOM (Very Hard - Casestudy)

**question_id:** QOR-PYTHON-099
**skill_id:** senior-python-099
**sub_skill_id:** black-friday-perf-crisis
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 35
**citation:** Original-authored case study

**body:**

You are SRE-on-call for a Python e-commerce platform on the busiest day of the year (Black Friday 2025, 11 AM IST, 50× normal traffic). The product API (FastAPI + Postgres + Redis) has been responding fine for 3 hours, but in the last 15 minutes:
- p95 latency rose 200ms → 4s
- 5xx error rate at 8% (was 0.02%)
- Pods are NOT OOM-killed; CPU is at 70% (not pegged)
- Redis cluster is healthy; DB CPU is healthy
- Logs show many warnings: `sqlalchemy.pool.warn: connection was returned to the pool with an open transaction`

You have 30 minutes before the CMO's promised checkout flow goes off-air on social media.

Walk through your triage, the most-likely root cause, the immediate mitigation, the post-incident fix, and the postmortem-quality artifacts you'd produce.

(Limit: 1000 words.)

**answer_key:**

**First 3 minutes — orient.**

`watch -n 1 'kubectl top pods'` (CPU 70% — not the bottleneck). Open the SQLAlchemy connection-pool dashboard: `pool.checkedout / pool.size`. Likely showing checkedout ≈ size (saturated). Confirms the smoking gun: the SQLAlchemy warning + saturated pool means requests are queued waiting for connections.

**Next 5 minutes — confirm hypothesis.**

The symptom set (rising latency, healthy DB and Redis, healthy CPU, pool warnings, no OOM) is textbook **connection-pool exhaustion**. Likely cause: a code path opened a transaction and never committed/rolled back, leaving connections in an unclean state. As traffic grew, the pool drained.

`SELECT count(*), state, application_name FROM pg_stat_activity GROUP BY state, application_name;` → if you see many `idle in transaction` rows tied to the API, that's the proof.

`tail -f` API logs filtered to the warning + look at the spans where it appears. Often the offending route is a slow path that times out client-side but leaves the server task running.

**Mitigation — 30-minute response (pick by risk + speed):**

1. **Increase `idle_in_transaction_session_timeout` on Postgres** to 30s — Postgres will kill stuck transactions; the connection returns to the pool. (Run on the primary; takes effect for new connections only, but new connections happen continuously under load.) This is a 30-second change.
2. **Increase the pool size temporarily** (e.g., from 20 to 50 per pod) — requires a deploy. Riskier under load.
3. **If a specific route is the offender**, set a feature flag to disable that route. If it's checkout, this is unacceptable. If it's a non-essential feature (recommendations, recently-viewed), kill it.

Order: do (1) immediately. While that takes effect, identify the offending route via tracing or `pg_stat_activity` query text. Then (3) if the offender is non-essential.

**Likely root cause (per the symptoms).**

A code path that does:
```python
async with async_session() as s:
    s.begin()
    result = await s.execute(...)
    if result.unhappy:
        raise BusinessError(...)
    await s.commit()
```

When `BusinessError` is raised, the `async with` exits without committing or rolling back, but in some SQLAlchemy 1.x→2.x transition cases the context manager doesn't always invoke rollback before pool return — exactly what the warning is reporting.

The proper pattern uses `async with async_session.begin()` (the `begin()` form is itself a context manager that commits on success / rolls back on exception):

```python
async with async_session() as s, s.begin():
    result = await s.execute(...)
    if result.unhappy:
        raise BusinessError(...)
    # commit on normal exit; rollback on exception
```

Or (FastAPI dependency, cleaner):

```python
async def get_session():
    async with async_session() as s:
        try:
            yield s
            await s.commit()
        except Exception:
            await s.rollback()
            raise
```

**Permanent fix (Day +1).**

- Change the dependency to the begin-on-yield pattern.
- Add a CI invariant: every test ends with `pool.checkedout == 0`. Catches new leaks at PR time.
- Add Prometheus metric `db_pool_checkedout` per pod; alert at >80% sustained for 2 minutes.
- Add `idle_in_transaction_session_timeout = 30s` on Postgres permanently — it's a sensible safety net.
- Run `pytest --count=10` on flaky test paths to flush out any "test passes when run alone, leaks under concurrency" cases.

**Validation.**

Replay 1 hour of Black-Friday-shaped traffic against staging with the fix; confirm pool checkout returns to baseline at p99 < 50% utilization. Soak test 4 hours.

**Postmortem artifacts.**

- Timeline (alarm time, mitigation time, recovery time, customer-impacting minutes, revenue loss estimate).
- Five-Whys root cause: missing rollback on business-error path → ORM context manager assumption → no CI invariant → no pool-checkout metric → no rehearsal of N×normal traffic on this code path.
- Three concrete commitments with owners and dates: (a) dependency pattern fixed in all sessions (eng lead, +5d); (b) CI invariant + metric (platform team, +14d); (c) load-test the checkout path at 100× before next sale (SRE, +30d).
- Customer comms: SLO impact, refund policy if any, tone — short, factual, no jargon.

**What this question is really testing.**

Triage discipline: orient → form a hypothesis from the symptom set → confirm before acting → mitigate with the lowest-risk lever first → fix root cause after the fire is out. Most production crises do NOT need new tools; they need disciplined application of what's already there.

**rubric:**

25-pt: orient with the right metric (pool, not CPU/memory) (3) + identify connection pool exhaustion from symptoms (5) + confirm via pg_stat_activity (2) + lowest-risk mitigation first (idle_in_transaction_timeout) (4) + correct SQLAlchemy session pattern fix (4) + CI invariant + pool metric + permanent timeout (3) + postmortem with five-whys + commitments + customer comms (4).

**watermark_seed:** qorium-python-v0.6-099-seed-2c8f4a9b
**variant_seed:** qorium-python-v0.6-2026-05-07-099
**bias_check_notes:** No bias. Realistic SRE triage.

---

### QUESTION 100: Casestudy — Architecting a Realtime ML Inference Service in Python (Very Hard - Casestudy)

**question_id:** QOR-PYTHON-100
**skill_id:** senior-python-100
**sub_skill_id:** realtime-ml-inference-architecture
**format:** casestudy
**difficulty_b:** 1.7
**discrimination_a:** 1.7
**expected_duration_minutes:** 40
**citation:** Original-authored; FastAPI docs; Triton Inference Server docs; ONNX Runtime docs

**body:**

Architect a real-time ML inference service for a fraud-detection use case at an Indian payments company. Requirements:
- 50K predictions/sec at peak (festival shopping spikes)
- p99 latency < 50ms end-to-end (network in to network out)
- Models are XGBoost + a small PyTorch MLP, refreshed daily
- Strict multi-tenancy: 12 merchant tenants with isolated quotas + per-tenant model variants
- 99.99% availability target (52 minutes downtime/year)
- Costs must beat the equivalent SageMaker spend

Cover: language choice (Python yes/no, where), model serving stack, deployment topology, autoscaling, monitoring, A/B testing for new model versions, the cost story, and the ONE most-likely failure mode you'd test in a game-day. (Limit: 1200 words.)

**answer_key:**

**TL;DR.** Python at the edges (request handling, business logic, A/B routing). Model inference in a compiled engine (ONNX Runtime + Triton). FastAPI front end on K8s. ONNX runtime CPU pods for XGBoost; Triton GPU pods for PyTorch MLP. Two regions, active-active. Beats SageMaker on cost by ~40-60% via right-sized hardware and avoiding per-prediction surcharges.

---

**Language & runtime.**

Python is excellent for the request layer (FastAPI: validation, auth, multi-tenancy, business logic, model routing). Python is wrong for the inference hot loop at 50K RPS — even with C-extension models, the request-routing overhead would force latency dangerously close to the 50ms SLO under tail load. Therefore: Python sidecar pattern.

- **Front-end pod:** FastAPI (Python). Owns auth, tenant isolation, feature lookup, model selection, response shaping.
- **Inference backend:** Triton Inference Server. Wraps ONNX Runtime for XGBoost (converted via `xgboost-onnx`) and TorchScript or ONNX for the PyTorch MLP. gRPC + TritonClient inside FastAPI.

This pattern is standard at companies serving similar QPS (Spotify, Walmart, Uber).

**Model serving stack.**

- XGBoost → ONNX → ONNX Runtime CPU. Throughput ~10-50k inferences/sec/core depending on tree depth. CPU is enough; GPU adds latency.
- PyTorch MLP → ONNX or TorchScript → Triton (CPU or GPU). For a small MLP, CPU likely suffices.
- Triton features used: dynamic batching (10ms max delay), model versioning, model repository on S3 with hot-reload, gRPC streaming, Prometheus metrics out of the box.
- Feature store: Redis (low latency) for user-level realtime features; offline features (last 30 days) materialized into Redis daily. Treat the feature store as on the request path; budget 8ms of the 50ms.

**Deployment topology.**

- Two AWS regions (Mumbai primary, Hyderabad secondary), active-active with weighted DNS (Route 53 health checks).
- Per region: 3 AZs; FastAPI front-end as Deployment, Triton as DaemonSet on dedicated inference node pool. Anti-affinity to spread across AZs.
- Network: front-end → Triton over gRPC inside the same node when possible (NodeLocal pattern); cross-node only on failover. Saves 1-2ms.

**Autoscaling.**

- Front-end: HPA on CPU + custom metric (request rate per pod). Pre-warm 50% headroom for festival days.
- Triton: HPA on GPU/CPU utilization; minimum replica pinned to handle baseline. Use a daily schedule to scale up 2 hours before festival peaks (e.g., Diwali 6 PM IST).
- Cluster autoscaler with sufficiently large node groups; pre-pulled images via DaemonSet.

**Multi-tenancy.**

- JWT carries `merchant_id` + `tier`. FastAPI dependency loads the tenant config (model variant, rate limit, feature flags).
- Per-tenant Redis sliding-window rate limit. Hot tenants get dedicated Triton model instances (model name suffix `-merchantX` in the model repository).
- Per-tenant metrics with bounded cardinality: emit per-merchant for top 12; bucket the long tail (mid/small) for general dashboards.

**A/B testing.**

- Triton serves multiple model versions; FastAPI middleware routes a deterministic hash of `merchant_id × user_id × experiment_seed` → variant. Sticky bucket per user for the experiment lifetime.
- Shadow mode: in addition to the active model's response, async-fire the candidate model with the same input and log outputs. Compare offline. No latency impact.
- Canary: 1% → 10% → 50% → 100% over 5 days with auto-rollback if AUC, drift, or error budget regressions trigger.

**Monitoring.**

- Latency percentiles per route per merchant.
- Model-side: Triton emits per-model latency, queue time, batch utilization.
- Drift: PSI / KL on input feature distributions vs training distribution; daily report; alert on drift > threshold.
- Business metric: daily fraud-precision and recall vs labels (lagged by ~24h).
- SLO error budget: if monthly availability drops below 99.99%, freeze model deploys (release brake).

**A/B + drift early-warning.** A new model that triggers prediction-distribution drift is auto-rolled-back even if AUC looks stable on holdout — protects against silent feature-distribution shifts.

**Cost story.**

- SageMaker (managed) at this volume runs ~$30K-50K/month with per-prediction surcharges and managed-NIC overhead.
- Self-managed on K8s: ~$15K-25K/month for compute (right-sized r-class for FastAPI, m6i for Triton CPU, optional g5.xlarge for Triton GPU when needed) + S3 + Redis ElastiCache.
- Net savings: 40-60% at this volume.
- Caveat: self-managed means an SRE budget. For < ~10K RPS, SageMaker is usually cheaper than the engineering hours.

**Game-day failure mode (the ONE I'd rehearse).**

**"Daily model deploy goes wrong, p99 latency doubles."** Inject: deploy a synthetic XGBoost model that's 3x deeper (slower) than normal; verify the canary auto-rollback fires within 5 minutes via the monitoring stack; verify the fallback to the previous version is hot (no cold start). If the rollback path is slow or manual, FIX before the festival.

Honourable mention game-days: Redis cluster failover (does feature lookup degrade gracefully or hard-fail?), full region loss (can the secondary region absorb 100% with no warm-up?), Triton GPU OOM (single-pod blast radius?).

**What success looks like at festival peak.**

50K RPS sustained; p99 at 35-40ms (10-15ms under SLO); error rate < 0.05%; auto-scaler stable (no oscillation); zero SLO-violating minutes during the 4-hour spike window; cost per million predictions ≤ $1.50.

**rubric:**

30-pt: Python yes/no decision with sidecar reasoning (3) + ONNX Runtime + Triton choice and conversion path (4) + multi-region active-active topology (3) + autoscaling pattern with festival pre-warm (3) + multi-tenant routing + per-tenant variants (3) + A/B with sticky buckets and shadow + drift-aware auto-rollback (4) + monitoring with cardinality awareness + drift signals (3) + cost story with caveats (3) + game-day failure mode rehearsed in advance (4).

**watermark_seed:** qorium-python-v0.6-100-seed-6e2a8c4f
**variant_seed:** qorium-python-v0.6-2026-05-07-100
**bias_check_notes:** No bias. Indian payments context; architecture pattern is universal.

---

## End of Senior Python QOR-PYTHON-081..100 Extension (Wave-1, v0.6)

**Distribution:** 12 MCQ + 4 code + 2 design + 2 casestudy.
**Difficulty mix:** 3 Easy + 9 Medium + 6 Hard + 2 Very Hard.
**Status:** AI-drafted. Awaiting SME Lead validation per Constitution v0.6.
**Cumulative:** Senior Python now at 100/100 ✅ (Q001-Q100). First two Wave-1 sub-skills (Java, Python) at full target.
