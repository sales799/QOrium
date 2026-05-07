# Wave 1 Extension: Senior Python (QOR-PYTHON-061..080)

**STATUS:** AI-drafted v0.6 EXTENSION (Senior Python scaling: 60→80 Qs). SME Lead validation pending. NOT for external delivery. Reference baseline: Python 3.13 (CPython + PEP 703 free-threaded as opt-in), FastAPI 0.115+, Pydantic v2, SQLAlchemy 2.x, uv, modern data stack (Polars 1.x, DuckDB 1.x).

---

## Extension: 20 NEW Questions (QOR-PYTHON-061..080)

Difficulty distribution: 3 Easy / 9 Medium / 6 Hard / 2 Very Hard
Format mix: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 61: asyncio.TaskGroup and Structured Concurrency (Easy)

**question_id:** QOR-PYTHON-061
**skill_id:** senior-python-061
**sub_skill_id:** asyncio-taskgroup
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Python 3.11 Release Notes; PEP 654 (Exception Groups); asyncio docs

**body:**

Python 3.11 introduced `asyncio.TaskGroup`. Which statement is TRUE?

**options:**

- A) `TaskGroup` is a drop-in replacement for `asyncio.gather` with no behavioral differences
- B) When one task in a `TaskGroup` raises, all other tasks are cancelled and exceptions are aggregated into an `ExceptionGroup` (PEP 654)
- C) `TaskGroup` only supports up to 10 concurrent tasks
- D) `TaskGroup` returns task results in the order tasks complete

**answer_key:**

B — `TaskGroup` provides structured concurrency: tasks created with `tg.create_task()` are bound to the group's `async with` scope. If any task raises, the group cancels remaining tasks and re-raises an `ExceptionGroup` aggregating all errors. This is safer than `gather(return_exceptions=False)` which only surfaces the first exception while siblings continue. References: PEP 654; Python 3.11 Release Notes §asyncio.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-061-seed-3c8a2f1b
**variant_seed:** qorium-python-v0.6-2026-05-07-061
**bias_check_notes:** No bias. Standard library feature.

---

### QUESTION 62: ExceptionGroup and except* Syntax (Easy)

**question_id:** QOR-PYTHON-062
**skill_id:** senior-python-062
**sub_skill_id:** exception-groups
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** PEP 654 (Exception Groups and except*); Python 3.11 docs

**body:**

What does the `except*` syntax (PEP 654) do?

**options:**

- A) It catches all exceptions including `BaseException` and `KeyboardInterrupt`
- B) It selectively handles matching exception types within an `ExceptionGroup`, splitting the group; unmatched exceptions are re-raised in a residual group
- C) It is shorthand for `except Exception as e: pass`
- D) It catches multiple exception types with the same handler block

**answer_key:**

B — `except*` works only on `ExceptionGroup`. It splits the group: matching exceptions go into the handler, non-matching exceptions are re-raised as a residual `ExceptionGroup`. Multiple `except*` blocks can fire for the same group (unlike regular `except`, which fires at most once). Use case: handling concurrent task failures from a `TaskGroup`. Reference: PEP 654.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-062-seed-9e4d7b2a
**variant_seed:** qorium-python-v0.6-2026-05-07-062
**bias_check_notes:** No bias.

---

### QUESTION 63: Pydantic v2 Performance vs v1 (Easy)

**question_id:** QOR-PYTHON-063
**skill_id:** senior-python-063
**sub_skill_id:** pydantic-v2
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Pydantic v2 Migration Guide; pydantic-core (Rust) repo

**body:**

Pydantic v2 is significantly faster than v1. The primary reason is:

**options:**

- A) v2 dropped support for `__init__` validation
- B) v2's validation core (`pydantic-core`) is rewritten in Rust; typical workloads see 5-50x speedup
- C) v2 uses C extensions written in CPython
- D) v2 is faster only on PyPy

**answer_key:**

B — Pydantic v2 moved its validation core to Rust (`pydantic-core`), accessed via PyO3 bindings. Typical speedups: 5-50x for `model_validate`, similar for `model_dump`. The Python layer is now thin metadata over the Rust core. Migration breaking changes: `.dict()` → `.model_dump()`, `.parse_obj()` → `.model_validate()`, `Config` class → `model_config: ConfigDict`. Reference: Pydantic v2 Migration Guide.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-063-seed-5b1f9e3c
**variant_seed:** qorium-python-v0.6-2026-05-07-063
**bias_check_notes:** No bias. Library performance.

---

### QUESTION 64: SQLAlchemy 2.x Async Session Pattern (Medium)

**question_id:** QOR-PYTHON-064
**skill_id:** senior-python-064
**sub_skill_id:** sqlalchemy-2-async
**format:** MCQ
**difficulty_b:** 0.3
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** SQLAlchemy 2.0 Documentation; AsyncSession reference

**body:**

In SQLAlchemy 2.x with `async_sessionmaker` and `AsyncSession`, which pattern is CORRECT for handling a transaction inside FastAPI?

**options:**

- A) Open one global `AsyncSession` at app startup and reuse it for all requests
- B) Use a per-request `async with async_session() as session:` context; commit/rollback explicitly; the session is single-threaded and not safe to share across requests
- C) Use `Session` (sync) inside `async def` endpoints — SQLAlchemy auto-detects the loop
- D) Always set `expire_on_commit=True` to avoid stale reads

**answer_key:**

B — Per-request session is the canonical pattern. `AsyncSession` instances are not concurrency-safe (single greenlet/task at a time). FastAPI dependency: `async def get_session(): async with async_session() as session: yield session`. For commit-then-read flows, set `expire_on_commit=False` so attributes don't trigger lazy-loaded queries after the transaction is closed. Reference: SQLAlchemy 2.0 Async docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-064-seed-2d6c4a8f
**variant_seed:** qorium-python-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

### QUESTION 65: Type Generics PEP 695 (Medium)

**question_id:** QOR-PYTHON-065
**skill_id:** senior-python-065
**sub_skill_id:** type-generics-pep695
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** PEP 695 (Type Parameter Syntax); Python 3.12 docs

**body:**

PEP 695 (Python 3.12) introduces new syntax for generics. Which is the CORRECT 3.12+ form?

**options:**

- A) `class Stack[T]: ...` and `def first[T](xs: list[T]) -> T: ...`
- B) `class Stack(Generic[TypeVar('T')]): ...`
- C) `T = TypeVar('T'); class Stack(Generic[T]): ...` — this is the only valid form
- D) Generics cannot be defined on free functions in 3.12+

**answer_key:**

B and C describe the legacy form. A is the new PEP 695 syntax: `class Stack[T]:` and `def first[T](xs: list[T]) -> T:` declare type parameters inline, no `TypeVar` import needed. PEP 695 also adds `type X = ...` for type aliases (replacing `TypeAlias`). The legacy `Generic[T]`/`TypeVar` forms still work for back-compat. Reference: PEP 695.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-065-seed-7a3e1d9c
**variant_seed:** qorium-python-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

### QUESTION 66: Polars vs Pandas Lazy Evaluation (Medium)

**question_id:** QOR-PYTHON-066
**skill_id:** senior-python-066
**sub_skill_id:** polars-lazy
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Polars Documentation §Lazy API; "Modern Polars" book

**body:**

A 50GB CSV needs aggregation but does not fit in RAM. Which Polars approach is BEST?

**options:**

- A) `pl.read_csv("...").group_by("region").sum()` — eager API
- B) `pl.scan_csv("...").group_by("region").agg(pl.col("amount").sum()).collect()` — Lazy API with predicate/projection pushdown and streaming
- C) Use Pandas with `chunksize=10_000` and aggregate manually
- D) Convert to Parquet first, then load with Pandas

**answer_key:**

B — `scan_csv` returns a `LazyFrame`. The query optimizer does predicate pushdown (filters applied during scan), projection pushdown (only required columns read), and can stream batches that exceed RAM (`collect(streaming=True)` or `.sink_parquet()`). Pandas chunked aggregation (C) works but is manual and slower; Polars handles it natively. Reference: Polars Lazy API docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-066-seed-4c8b2e5a
**variant_seed:** qorium-python-v0.6-2026-05-07-066
**bias_check_notes:** No bias.

---

### QUESTION 67: contextvars and asyncio (Medium)

**question_id:** QOR-PYTHON-067
**skill_id:** senior-python-067
**sub_skill_id:** contextvars-asyncio
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** PEP 567 (Context Variables); Python contextvars docs

**body:**

Why is `contextvars.ContextVar` preferred over `threading.local` for request-scoped state in async code?

**options:**

- A) `threading.local` is faster but less safe
- B) `threading.local` is per-OS-thread; with asyncio, a single thread runs many coroutines, so all coroutines share the same `threading.local`. `ContextVar` is per-`Context`, and each `Task` runs in a copy of its parent's `Context`, so values are isolated per coroutine
- C) `ContextVar` only works on Python 3.13+
- D) `threading.local` does not exist in modern Python

**answer_key:**

B — Each `asyncio.Task` runs in a copy of the parent's `Context` (since 3.7). `ContextVar.set()` inside one task does not leak to others. `threading.local` would leak across coroutines on the same loop thread. Common use: request ID propagation through middleware, structured logging context, OpenTelemetry trace context. Reference: PEP 567.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-067-seed-9f3a7d4e
**variant_seed:** qorium-python-v0.6-2026-05-07-067
**bias_check_notes:** No bias.

---

### QUESTION 68: Profiling with py-spy vs cProfile (Medium)

**question_id:** QOR-PYTHON-068
**skill_id:** senior-python-068
**sub_skill_id:** profiling-pyspy
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** py-spy GitHub; cProfile docs

**body:**

You suspect a Python web app in production has a CPU hotspot. Restarting is not allowed. Which profiler is BEST?

**options:**

- A) `cProfile` — built-in, deterministic, low overhead
- B) `py-spy record -p $PID` — sampling profiler that attaches to a running process without restarting; produces a flamegraph
- C) `tracemalloc` — for CPU profiling
- D) `memory_profiler` — for line-level CPU stats

**answer_key:**

B — `py-spy` is a sampling profiler written in Rust. It attaches to a running PID via OS-level memory inspection (no code modification, no restart). Output: SVG flamegraph or speedscope JSON. Overhead is typically <2%. `cProfile` requires the program to be started under it. `tracemalloc` and `memory_profiler` are for memory, not CPU. Reference: py-spy GitHub README.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-068-seed-3e7c5b9a
**variant_seed:** qorium-python-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

### QUESTION 69: __slots__ Memory Optimization (Medium)

**question_id:** QOR-PYTHON-069
**skill_id:** senior-python-069
**sub_skill_id:** slots-memory
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Python Data Model docs §__slots__

**body:**

A class is instantiated 10 million times for in-memory caching. Which optimization is MOST effective?

**options:**

- A) Use `@dataclass(frozen=True)` only
- B) Add `__slots__ = ('field1', 'field2', ...)` (or `@dataclass(slots=True)` in 3.10+) — eliminates the per-instance `__dict__`, reducing memory ~30-50% and speeding attribute access
- C) Use `class Point(NamedTuple): ...` — same memory as a dict-backed class
- D) Replace the class with `dict` literals

**answer_key:**

B — `__slots__` declares fixed attribute names and removes the per-instance `__dict__` and `__weakref__` (unless re-added). Memory savings: 30-50% per instance for small classes; attribute access also faster (slot offsets vs dict lookup). Trade-offs: cannot add attributes dynamically; multiple inheritance more constrained. `@dataclass(slots=True)` (3.10+) generates a new class with slots. `NamedTuple` is similar but immutable. Reference: Python Data Model docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-069-seed-8b4f1e6c
**variant_seed:** qorium-python-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

### QUESTION 70: GIL vs Multiprocessing for CPU-Bound (Medium)

**question_id:** QOR-PYTHON-070
**skill_id:** senior-python-070
**sub_skill_id:** gil-multiprocessing
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Python multiprocessing docs; concurrent.futures docs

**body:**

A pure-Python CPU-bound task (numerical, no NumPy/C extension) needs to use 16 cores. Which approach is BEST in stock CPython 3.12 (GIL enabled)?

**options:**

- A) `threading.Thread` — Python threads bypass the GIL for compute
- B) `concurrent.futures.ProcessPoolExecutor(max_workers=16)` — separate interpreter processes, each with its own GIL
- C) `asyncio.gather` — CPU work runs concurrently
- D) Subinterpreters (PEP 684) — fully isolated GIL per subinterpreter

**answer_key:**

B — Stock CPython holds the GIL during pure-Python bytecode execution. Threads do not parallelize CPU work. `ProcessPoolExecutor` spawns OS processes; each has its own interpreter and GIL, achieving real parallelism. Trade-off: pickling overhead for arguments/results. PEP 684 per-interpreter GIL (3.12) is promising but the public API is still maturing. PEP 703 free-threaded build is opt-in and experimental. Reference: concurrent.futures docs.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-070-seed-2c9a5e7b
**variant_seed:** qorium-python-v0.6-2026-05-07-070
**bias_check_notes:** No bias.

---

### QUESTION 71: typing.Protocol Structural Typing (Medium)

**question_id:** QOR-PYTHON-071
**skill_id:** senior-python-071
**sub_skill_id:** typing-protocol
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** PEP 544 (Protocols); typing docs

**body:**

What is the difference between `typing.Protocol` and an abstract base class (ABC)?

**options:**

- A) `Protocol` is faster at runtime
- B) `Protocol` enables structural ("duck") typing: any class with the matching attributes/methods satisfies the type, no inheritance needed. ABCs require explicit subclassing or `register()`
- C) `Protocol` cannot have method bodies
- D) ABCs are removed in Python 3.12

**answer_key:**

B — `Protocol` (PEP 544) defines a structural type. Any class with matching attribute names and signatures satisfies it — no `class Foo(MyProtocol)` declaration needed. Use cases: third-party types you cannot modify, decoupling from concrete classes. Add `@runtime_checkable` for `isinstance` support (slower; checks attribute presence). ABCs require explicit `inherit-or-register`. Reference: PEP 544.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-071-seed-6d2f8a3e
**variant_seed:** qorium-python-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

### QUESTION 72: Memory Leak — Mutable Default Argument (Hard)

**question_id:** QOR-PYTHON-072
**skill_id:** senior-python-072
**sub_skill_id:** mutable-default-bug
**format:** MCQ
**difficulty_b:** 0.9
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** Python Common Gotchas; "Effective Python" Item 24

**body:**

```python
def add_item(item, items=[]):
    items.append(item)
    return items
```

What does `add_item(1); add_item(2); add_item(3)` return on the third call?

**options:**

- A) `[3]` — fresh list each call
- B) `[1, 2, 3]` — the default list is created ONCE at function definition and persists across calls; all calls share the same list object
- C) `TypeError` — mutable defaults are forbidden
- D) `None` — the function does not return anything explicit

**answer_key:**

B — The default value `[]` is evaluated once at function definition time, not at call time. Subsequent calls without the argument all receive the SAME list object. This is one of Python's most-cited footguns. Correct pattern: `def add_item(item, items=None): items = items if items is not None else []; ...`. Tools like `ruff` (B006 rule) flag this. References: PEP 8; Effective Python Item 24.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-072-seed-1b5e9c4d
**variant_seed:** qorium-python-v0.6-2026-05-07-072
**bias_check_notes:** No bias. Classic Python pitfall.

---

### QUESTION 73: FastAPI Dependency Override for Testing (Hard - Code)

**question_id:** QOR-PYTHON-073
**skill_id:** senior-python-073
**sub_skill_id:** fastapi-testing
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.6
**expected_duration_minutes:** 12
**citation:** FastAPI Documentation §Testing; pytest-asyncio docs

**body:**

Given a FastAPI app:

```python
# app.py
from fastapi import FastAPI, Depends
from .db import get_session

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int, session=Depends(get_session)):
    return await session.get(User, user_id)
```

Write a `pytest` test (using `httpx.AsyncClient` and `app.dependency_overrides`) that:

1. Replaces `get_session` with an in-memory fake that returns `{"id": 42, "name": "Test"}` for `user_id == 42` and `None` otherwise.
2. Asserts GET `/users/42` returns 200 with the expected JSON.
3. Cleans up the override after the test.

**options:** []

**answer_key:**

```python
# test_users.py
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.db import get_session

class FakeSession:
    async def get(self, model, user_id: int):
        return {"id": 42, "name": "Test"} if user_id == 42 else None

async def fake_get_session():
    yield FakeSession()

@pytest.mark.asyncio
async def test_get_user_42():
    app.dependency_overrides[get_session] = fake_get_session
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
            r = await client.get("/users/42")
            assert r.status_code == 200
            assert r.json() == {"id": 42, "name": "Test"}
    finally:
        app.dependency_overrides.clear()
```

Key points: (1) `dependency_overrides` is a dict on the FastAPI app; key is the original dependency function, value is the replacement. (2) `try/finally` (or fixture teardown) ensures cleanup so other tests are unaffected. (3) `ASGITransport` lets `httpx` call the FastAPI app in-process without a running server. References: FastAPI Testing docs; httpx AsyncClient docs.

**rubric:**

12-pt: correct override pattern (3) + ASGITransport client setup (2) + correct test assertion (3) + cleanup of overrides (2) + pytest-asyncio mark (2).

**watermark_seed:** qorium-python-v0.6-073-seed-7e2c4a9f
**variant_seed:** qorium-python-v0.6-2026-05-07-073
**bias_check_notes:** No bias. Standard testing pattern.

---

### QUESTION 74: Cython vs mypyc Performance (Hard)

**question_id:** QOR-PYTHON-074
**skill_id:** senior-python-074
**sub_skill_id:** cython-mypyc
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Cython Documentation; mypyc Documentation

**body:**

You have a hot Python module with rich type hints. You want a 5-10x speedup with minimal code changes. Which is BEST?

**options:**

- A) Rewrite in Rust + PyO3
- B) `mypyc` — compile type-annotated Python to a C extension; existing type hints drive the optimization, minimal source changes needed
- C) `Cython` (`.pyx` files) — best raw speed but requires `.pyx` syntax and `cdef` annotations
- D) Run on PyPy — JIT speedup with zero changes (best ROI)

**answer_key:**

B is best for "minimal code changes with type hints already present". `mypyc` (used by mypy itself, black, and others) compiles annotated Python to C; existing PEP 484 hints drive type-specialization. Typical speedup 2-10x. Cython (C) has higher ceiling but requires `.pyx` rewrite and `cdef` annotations to reach top speed. PyPy (D) needs no changes but doesn't always integrate with C-extension-heavy stacks (NumPy, Pandas) cleanly. Rust + PyO3 (A) is highest effort, highest ceiling. Reference: mypyc docs.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-074-seed-3a8c7e2b
**variant_seed:** qorium-python-v0.6-2026-05-07-074
**bias_check_notes:** No bias.

---

### QUESTION 75: Async Generator with Backpressure (Hard - Code)

**question_id:** QOR-PYTHON-075
**skill_id:** senior-python-075
**sub_skill_id:** async-generator-backpressure
**format:** code
**difficulty_b:** 1.2
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** PEP 525 (Asynchronous Generators); asyncio.Queue docs

**body:**

A producer fetches pages from a paginated REST API (~100ms per page, up to 1000 pages). A consumer processes each item (~50ms per item, ~10 items per page). Single-stream, you must NOT prefetch more than 5 pages ahead (memory bound).

Write an `async def producer(queue: asyncio.Queue, fetch_page)` and `async def consumer(queue: asyncio.Queue, handle_item)` that uses `asyncio.Queue(maxsize=5)` for natural backpressure, and a `main()` that runs them concurrently and stops cleanly.

**options:** []

**answer_key:**

```python
import asyncio
from typing import Callable, Awaitable, Any

SENTINEL = object()

async def producer(queue: asyncio.Queue, fetch_page: Callable[[int], Awaitable[list[Any] | None]]) -> None:
    page_num = 0
    while True:
        page = await fetch_page(page_num)
        if page is None:
            await queue.put(SENTINEL)
            return
        for item in page:
            await queue.put(item)   # blocks if queue is full -> backpressure
        page_num += 1

async def consumer(queue: asyncio.Queue, handle_item: Callable[[Any], Awaitable[None]]) -> None:
    while True:
        item = await queue.get()
        try:
            if item is SENTINEL:
                return
            await handle_item(item)
        finally:
            queue.task_done()

async def main(fetch_page, handle_item) -> None:
    queue: asyncio.Queue = asyncio.Queue(maxsize=5)  # bounded by pages, not items
    async with asyncio.TaskGroup() as tg:
        tg.create_task(producer(queue, fetch_page))
        tg.create_task(consumer(queue, handle_item))
```

Key design points:
- `asyncio.Queue(maxsize=5)` provides natural backpressure: producer's `put` blocks when full, slowing the producer to consumer rate.
- Sentinel pattern signals stream end (alternative: explicit cancellation via TaskGroup).
- `TaskGroup` (3.11+) ensures both tasks live in a structured scope; if either raises, the other is cancelled and exceptions aggregate.
- `task_done()` lets the producer-side `await queue.join()` if needed for fan-out scenarios.

References: PEP 525; asyncio.Queue docs; PEP 654 (TaskGroup).

**rubric:**

15-pt: bounded queue with maxsize (3) + sentinel or cancellation pattern (3) + TaskGroup or gather (3) + correct task_done semantics (2) + clean shutdown (2) + type hints (2).

**watermark_seed:** qorium-python-v0.6-075-seed-9b4e7c2a
**variant_seed:** qorium-python-v0.6-2026-05-07-075
**bias_check_notes:** No bias.

---

### QUESTION 76: OpenTelemetry Python Auto-Instrumentation (Hard)

**question_id:** QOR-PYTHON-076
**skill_id:** senior-python-076
**sub_skill_id:** opentelemetry-python
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** OpenTelemetry Python SDK Documentation; opentelemetry-instrumentation packages

**body:**

You want to add distributed tracing to a FastAPI + httpx + SQLAlchemy app with minimum code. Which approach is CORRECT?

**options:**

- A) Manually instrument every endpoint with `tracer.start_as_current_span(...)`
- B) Install `opentelemetry-distro` + `opentelemetry-instrumentation-fastapi/httpx/sqlalchemy`, then run the app via `opentelemetry-instrument python -m uvicorn app:app`. Auto-instrumentation patches libraries at import time; spans propagate context via W3C Trace-Context headers
- C) Use `print()` statements with timestamps and parse the output later
- D) OpenTelemetry only supports Java; use Datadog APM agent instead

**answer_key:**

B — `opentelemetry-distro` ships sane defaults (OTLP exporter, batch span processor). Library-specific instrumentation packages monkey-patch at import time: FastAPI middleware adds request spans; httpx wraps requests with client spans; SQLAlchemy hooks `before_cursor_execute` for query spans. The CLI wrapper `opentelemetry-instrument` activates auto-instrumentation without touching application code. W3C Trace-Context headers propagate trace IDs across services. Manual instrumentation (A) is for custom business spans. Reference: OpenTelemetry Python docs.

**rubric:** MCQ; correct = 8 points, incorrect = 0.

**watermark_seed:** qorium-python-v0.6-076-seed-5c9a3f7e
**variant_seed:** qorium-python-v0.6-2026-05-07-076
**bias_check_notes:** No bias. Vendor-neutral observability framework.

---

### QUESTION 77: Robust Retry with Exponential Backoff + Jitter (Hard - Code)

**question_id:** QOR-PYTHON-077
**skill_id:** senior-python-077
**sub_skill_id:** retry-tenacity
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** tenacity library docs; AWS Architecture blog "Exponential Backoff and Jitter"

**body:**

Write an async retry decorator (or use `tenacity`) for an `async def fetch(url)` that:

1. Retries up to 5 times on `httpx.HTTPStatusError` where status is 5xx OR `httpx.TransportError`.
2. Does NOT retry on 4xx (auth/client errors).
3. Uses exponential backoff with full jitter, starting at 0.5s, capped at 30s.
4. Logs each retry attempt.

Show both: the manual implementation AND the equivalent using `tenacity`.

**options:** []

**answer_key:**

Manual implementation:

```python
import asyncio
import logging
import random
from functools import wraps
import httpx

log = logging.getLogger(__name__)

def retry_async(max_attempts=5, base=0.5, cap=30.0):
    def decorator(fn):
        @wraps(fn)
        async def wrapper(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return await fn(*args, **kwargs)
                except httpx.HTTPStatusError as e:
                    if not (500 <= e.response.status_code < 600):
                        raise   # 4xx -> no retry
                    last = e
                except httpx.TransportError as e:
                    last = e
                if attempt == max_attempts:
                    raise last
                # full-jitter backoff: random in [0, min(cap, base * 2^(attempt-1)))
                sleep = random.uniform(0, min(cap, base * (2 ** (attempt - 1))))
                log.warning("retry %d/%d after %.2fs: %s", attempt, max_attempts, sleep, last)
                await asyncio.sleep(sleep)
        return wrapper
    return decorator

@retry_async()
async def fetch(url: str) -> httpx.Response:
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        r.raise_for_status()
        return r
```

Using `tenacity`:

```python
from tenacity import (
    retry, stop_after_attempt, wait_random_exponential,
    retry_if_exception, before_sleep_log,
)
import logging, httpx

def is_retryable(e: BaseException) -> bool:
    if isinstance(e, httpx.HTTPStatusError):
        return 500 <= e.response.status_code < 600
    return isinstance(e, httpx.TransportError)

log = logging.getLogger(__name__)

@retry(
    stop=stop_after_attempt(5),
    wait=wait_random_exponential(multiplier=0.5, max=30),
    retry=retry_if_exception(is_retryable),
    before_sleep=before_sleep_log(log, logging.WARNING),
)
async def fetch(url: str) -> httpx.Response:
    async with httpx.AsyncClient() as client:
        r = await client.get(url)
        r.raise_for_status()
        return r
```

Key points: full jitter (random in [0, cap]) prevents thundering herd; exclude 4xx (programmer error, retrying makes it worse); cap prevents pathological waits; `before_sleep_log` for observability. References: tenacity docs; AWS Architecture blog.

**rubric:**

12-pt: correct exception classification 4xx vs 5xx (3) + exponential backoff with cap (3) + jitter (2) + max attempts (2) + logging (1) + bonus tenacity equivalent (1).

**watermark_seed:** qorium-python-v0.6-077-seed-2f7e9c4a
**variant_seed:** qorium-python-v0.6-2026-05-07-077
**bias_check_notes:** No bias.

---

### QUESTION 78: Design — Multi-Tenant FastAPI SaaS Architecture (Hard - Design)

**question_id:** QOR-PYTHON-078
**skill_id:** senior-python-078
**sub_skill_id:** multitenant-fastapi-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Multi-Tenant SaaS Patterns (AWS Whitepaper); FastAPI docs

**body:**

Design a multi-tenant FastAPI SaaS platform serving B2B customers (10-1000 tenants). Requirements:

1. Tenant isolation at the data layer (no cross-tenant data leakage even on a logic bug).
2. Per-tenant rate limits (e.g., enterprise vs free tier).
3. Per-tenant feature flags.
4. JWT-based auth where the token carries `tenant_id` and `user_id`.
5. Background jobs (Celery or arq) must also enforce tenant isolation.

Cover: data isolation strategy (shared DB / schema-per-tenant / DB-per-tenant trade-offs), middleware design, observability (per-tenant metrics), and a concrete failure mode you would deliberately test in CI.

(Limit: 800 words.)

**options:** []

**answer_key:**

**Reference design:**

**Data isolation — shared DB + schema-per-tenant for the main path; row-level security (RLS) as defense-in-depth.**

For 10-1000 tenants, schema-per-tenant in a shared Postgres cluster strikes the right balance: cheaper than DB-per-tenant, more isolated than shared tables. Strategy:
- Schemas: `tenant_<uuid>` per tenant; baseline schema `app` for shared tables (tenants, users, billing).
- A connection pool sets `SET search_path = tenant_<id>, app` per request via SQLAlchemy `event.listens_for(Engine, 'connect')` + `sessionmaker.before_execute`. Better: a `dependency` resolves the tenant and creates a scoped session bound to the schema.
- Defense-in-depth: enable Postgres RLS on every shared table with `CREATE POLICY tenant_isolation ON foo USING (tenant_id = current_setting('app.tenant_id')::uuid)`. Set `SET LOCAL app.tenant_id = '...'` per transaction. This means even a missing WHERE clause cannot leak rows.
- Trade-off vs shared rows: schema migrations must run per-tenant (use Alembic with a tenant-iterating script). DB-per-tenant offers full isolation but operational cost (1000 backups, 1000 connection pools) is prohibitive at this scale.

**Middleware — tenant resolution + RLS pinning.**

```
FastAPI middleware/dependency chain:
  AuthMiddleware (JWT validate) -> TenantContextDependency (set ContextVar +
  Postgres SET LOCAL) -> RateLimitDependency (per-tenant quota) ->
  FeatureFlagDependency -> route handler
```

Use `contextvars.ContextVar` for tenant ID so it propagates through async tasks naturally. Set `SET LOCAL app.tenant_id` at the start of each transaction.

**Rate limits per tenant.**

Use Redis-backed sliding-window via `slowapi` or `redis-limiter`. Key: `rl:{tenant_id}:{endpoint}`. Per-tier quotas in a `tenants` table; load into the rate-limit dependency. Hot path: avoid per-request DB read by caching tier in JWT claim refreshed every 15 minutes.

**Feature flags.**

OpenFeature SDK with a Postgres-backed provider, cached for ~30s in-process. Flag evaluation: `tenant_id` is the primary targeting key. For experiments, also expose `user_id`.

**JWT.**

RS256 JWT with claims `{"tid": tenant_id, "sub": user_id, "tier": "enterprise"}`. Validate signature in middleware; on decode failure return 401 fast (before any DB I/O). Short-lived access tokens (15 min) + refresh.

**Background jobs (arq).**

Every job MUST receive `tenant_id` as a typed argument. Worker startup pulls from Redis; before invoking the handler, the worker sets the same `ContextVar` and `SET LOCAL app.tenant_id` on its session. Helper: `@tenant_scoped` decorator that asserts the kwarg and pins the context. CI test: enqueueing a job without `tenant_id` raises at submit time.

**Observability — per-tenant metrics.**

OpenTelemetry: add `tenant_id` as a baggage/resource attribute. Prometheus: avoid unbounded label cardinality — bucket tenants into tiers (`free`, `pro`, `enterprise`) for high-cardinality metrics; emit per-tenant only for billing-relevant counters (API calls, storage GB). Logs: structured JSON with `tenant_id` in every record; CloudWatch / Datadog log subscriptions filter per tenant.

**Concrete failure mode tested in CI:**

"Cross-tenant read regression test." A pytest fixture seeds two tenants with disjoint data. The test authenticates as Tenant A, attempts to read a resource owned by Tenant B (by URL or filter param), and asserts 404 (not 403, to avoid information leak). This test runs against the real RLS-enabled Postgres in CI (testcontainers). A second test deliberately removes `SET LOCAL app.tenant_id` to verify RLS denies the query — proves the second layer of defense works.

**Other bits worth mentioning if word budget allows:**

- Schema migrations: Alembic + tenant-iterator script; run during deploy with circuit-breaker per tenant so one failure doesn't block all.
- Backup: pg_dump per schema for compliance separation.
- Tenant offboarding: `DROP SCHEMA tenant_<id> CASCADE` after compliance hold; soft-delete first.
- Cost: a single $200/mo Postgres can comfortably serve 1000 small tenants; scale up to multi-AZ + read replicas at $1000/mo before sharding.

**rubric:**

20-pt: data isolation strategy with trade-offs (4) + middleware/dependency design (3) + per-tenant rate limit/feature flag mechanism (3) + JWT design (2) + background-job tenant propagation (3) + observability with cardinality awareness (2) + CI cross-tenant regression test (3).

**watermark_seed:** qorium-python-v0.6-078-seed-4d8b3c7a
**variant_seed:** qorium-python-v0.6-2026-05-07-078
**bias_check_notes:** No bias.

---

### QUESTION 79: Casestudy — Production Memory Leak (Very Hard - Casestudy)

**question_id:** QOR-PYTHON-079
**skill_id:** senior-python-079
**sub_skill_id:** memory-leak-casestudy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 35
**citation:** Original-authored case study; tracemalloc, objgraph docs

**body:**

A FastAPI service running on Kubernetes (4 pods, 2 GB memory limit each) is OOM-killed every 6-12 hours under steady traffic (~50 RPS). Restart resolves it temporarily. RSS climbs from 200 MB at boot to 1.9 GB before the OOMKill. CPU and latency are stable. The service uses SQLAlchemy 2.x async, httpx, and an in-process LRU cache for an external pricing API (`functools.lru_cache(maxsize=10000)` on a method).

The team is split between three theories:
1. SQLAlchemy session leak.
2. The LRU cache is "obviously the leak."
3. A C extension is leaking native memory (which Python GC can't see).

Walk through your investigation methodology, the tools you'd use, the order in which you'd rule out theories, and the final fix. Reach a definitive root cause (not just "investigate further").

(Limit: 1000 words.)

**answer_key:**

**Reference walkthrough:**

**Step 1 — Get a memory snapshot from a leaking pod (don't restart it).**

`kubectl exec` into a pod near OOM. Tools to try in order:
- `pmap -x $PID` and `cat /proc/$PID/status` for VmRSS, VmData, VmSwap, anonymous mappings — gives the OS-level breakdown.
- `tracemalloc` (turn on at startup with `PYTHONTRACEMALLOC=10` env var, or hot-attach via a debug endpoint that calls `tracemalloc.take_snapshot()`).
- `py-spy dump --pid $PID` for a snapshot of all Python stacks (catches stuck consumers).

**Step 2 — Distinguish Python-heap growth from native growth.**

`tracemalloc.get_traced_memory()` returns `(current, peak)` of the Python heap. Compare with RSS:
- If RSS - traced ≈ small → leak is in the Python heap. Continue with tracemalloc/objgraph.
- If RSS - traced is very large (e.g., RSS 1.9 GB, Python heap 300 MB) → native leak (C extension or shared lib).

This single check rules out theory 3 vs theories 1+2 in 5 minutes.

**Step 3 — If Python heap: find the top allocators.**

```python
snap = tracemalloc.take_snapshot()
for stat in snap.statistics('lineno')[:20]:
    print(stat)
```

This shows the file:lineno that holds the most live bytes. The output usually points the team straight at the offender.

**Step 4 — Rule out theory 2 (LRU cache).**

`functools.lru_cache(maxsize=10000)` is bounded; even with large pricing payloads the upper bound is `10000 * payload_size`. If the average payload is 5 KB, that's 50 MB at most — not 1.7 GB of growth. Plus, `lru_cache` does not retain references beyond the specified bound. Rule it out unless tracemalloc explicitly points there. (Common red herring.)

**Step 5 — Rule out theory 1 (SQLAlchemy session leak).**

A genuine session leak means sessions are created but never closed (and held by some object, e.g. a request-scoped global). Symptoms: tracemalloc points at SQLAlchemy internals (`identity_map`, `IdentityMap`, etc.), and connection pool monitor shows `checkedout > 0` at idle. Confirm with `engine.pool.status()`. If the dependency uses `async with async_session() as s: yield s`, the session is closed on request exit; rare to leak unless the framework holds references (FastAPI does not).

**Step 6 — Most likely culprit (per the case description): unbounded growth in some module-level structure.**

Common pattern at 50 RPS for 8h hitting 1.9 GB:
- A list/dict at module scope used as an in-process metric/counter, never bounded (e.g., `recent_requests: list[Request] = []`).
- `__init_subclass__` retaining classes.
- Logger / structlog handler accumulating records.
- An `httpx.AsyncClient` per request that is not closed (each holds connection state).

**Step 7 — Run `objgraph.show_growth()` between two snapshots ~10 min apart.**

```python
import objgraph
objgraph.show_growth(limit=20)
# ... wait 10 min ...
objgraph.show_growth(limit=20)   # shows what grew most since first call
```

The top growing types name the leak (e.g., `dict`, `Response`, `AsyncClient`). Then `objgraph.show_chain(objgraph.find_backref_chain(obj, objgraph.is_proper_module))` shows what holds the reference.

**Step 8 — In our scenario, the discovery is most likely:**

The team is creating a new `httpx.AsyncClient()` per request and not awaiting `aclose()`. Each client holds connection state, an SSL context, and HTTP/2 multiplexing state. Over 50 RPS × 8 hours = 1.4M unclosed clients × ~1 KB each = 1.4 GB. Tracemalloc points at `httpx._client`. `objgraph.count('AsyncClient')` is in the millions.

**Fix:**

Use a single, shared `httpx.AsyncClient` (FastAPI lifespan-scoped):

```python
@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.http = httpx.AsyncClient(http2=True, timeout=10.0)
    try:
        yield
    finally:
        await app.state.http.aclose()
```

Inject via dependency. Connections are pooled, no per-request state churn. Verify the fix by deploying to one canary pod, watching RSS over 24 hours: should plateau at ~300 MB.

**Process improvements:**

- Add a Prometheus gauge for `tracemalloc.get_traced_memory()` and alert on growth rate > 5 MB/hour at idle.
- Add a debug endpoint `/internal/objgraph` (auth-protected) for next time.
- Add `pyright`/`ruff` rule + code review checklist: long-lived `AsyncClient` only.
- Add a synthetic 12h soak in CI before promoting to production.

**Why methodology > guessing:**

Two of the three team theories were probably wrong. Tracemalloc + objgraph reveal the truth in <30 minutes; arguing in Slack for 3 days is the failure mode this discipline avoids.

**rubric:**

25-pt: correct first action — get a snapshot, do not restart (3) + distinguish Python heap vs native via RSS - traced (5) + rule out cache with bounded math (3) + tracemalloc top-allocators step (3) + objgraph diff for delta (3) + identifies plausible root cause (per-request AsyncClient or equivalent, with quantitative reasoning) (4) + concrete fix code or pattern (2) + process improvements / regression prevention (2).

**watermark_seed:** qorium-python-v0.6-079-seed-8e3f5c2b
**variant_seed:** qorium-python-v0.6-2026-05-07-079
**bias_check_notes:** No bias. Investigation methodology over guessing.

---

### QUESTION 80: Casestudy — Migrating a Python 2.7 Monolith to Python 3.13 (Very Hard - Casestudy)

**question_id:** QOR-PYTHON-080
**skill_id:** senior-python-080
**sub_skill_id:** py2-py3-migration
**format:** casestudy
**difficulty_b:** 1.7
**discrimination_a:** 1.7
**expected_duration_minutes:** 40
**citation:** Original-authored case study; PEP 373 (Python 2 EOL); Instagram Python 3 Migration blog

**body:**

A 1.2M-line Python 2.7 / Django 1.11 monolith powers an Indian fintech (250 engineers, ~$50M ARR). Python 2 has been EOL since 2020. Security audit found 47 unpatched CVEs blocking the company's banking-license renewal in 18 months. Major dependencies: Django, Celery, NumPy, an in-house ORM-extension (300K LOC), a legacy SOAP client (uses `suds`, abandoned), a custom Cython extension built with Cython 0.25 (no maintainer).

The CTO proposes three approaches:
- **A:** Big-bang rewrite (2 years, freeze new features).
- **B:** Strangler-fig — extract microservices in Python 3, decommission monolith over 3-4 years.
- **C:** In-place upgrade Py2.7 → Py3.13 with `2to3`, codemods, and dual-version testing.

Recommend an approach with concrete sequencing. Cover: tooling choices, risk surfaces, how to keep delivery flowing during the migration, exit criteria, and how you'd measure progress monthly to the board.

(Limit: 1200 words.)

**answer_key:**

**Recommendation: Hybrid — In-place Python 3 upgrade for the monolith (variant of C), with strategic strangler extraction (B) for the riskiest legacy modules. Reject A.**

**Why not A (big-bang rewrite):**

For a 1.2M-LOC banking system, a 2-year freeze means competitors ship 2 years of features unopposed. Of the canonical 1990s/2000s big-bang rewrites studied (Netscape 6, Borland C++ Builder), most lost the market position they were rewriting to defend. With 47 CVEs and 18 months to license renewal, A also misses the deadline.

**Why not pure C (in-place only):**

The two abandoned dependencies (`suds` SOAP client, Cython 0.25 extension) are non-trivial — each will block the upgrade and probably require replacement. Treating them as line-by-line port targets is wasteful when modern equivalents exist.

**Why not pure B (strangler over 3-4 years):**

3-4 years is well beyond the 18-month license deadline. Strangler-fig done well still leaves a Py2.7 core running, which is what the auditor flagged.

**Recommended sequencing — 18 months to "Py3.13 on all production traffic":**

**Month 0-2: Foundation.**
- Set up dual-version CI: every PR runs against `python2.7` AND `python3.13`. Use `tox -e py27,py313` matrices. Initially most tests fail under py3.13 — that's fine; track the green count as a metric.
- Adopt `pyupgrade --py3-only` and `ruff check --select UP,F` for codemods. They handle 70-80% of mechanical changes (`print` statements, `dict.iteritems`, `unicode` literals, `xrange`, exception syntax, `super()` arguments).
- Replace `from __future__ import` shims after they become no-ops.
- Pin a "porting tracker" board (one row per module, columns: lints clean / unit tests green / integration green / py3.13 in prod).
- Add `mypy --strict` as a gate ratchet (start at 0%, ratchet +5% / month).

**Month 2-4: Strangler the two abandoned dependencies.**
- `suds` SOAP client → replace with `zeep` (actively maintained). 4-6 weeks of work; introduce a thin internal `SoapClient` Protocol so callers don't change.
- Cython 0.25 extension → option 1: rebuild with Cython 3.x (likely needs `cdef` syntax updates); option 2: extract into a new microservice (Strangler pattern) if the boundary is clean. Pick based on complexity and whether the team has the expertise. Either way: behind a clear interface so the rest of the migration doesn't depend on its outcome.

**Month 4-9: Module-by-module port, monolith stays on Py2.7 in prod.**
- Six engineers full-time on porting (separate "porting squad" with rotating membership so domain knowledge spreads). Other 240 engineers continue feature work — but every PR they ship must keep the Py2.7+Py3.13 dual-CI green (if a developer adds a new f-string they must also keep the file Py2-compatible until that file is "ported & locked"). Use feature flags + strict linting to enforce.
- Order modules from leaves → core. Use `import-graph` analysis to find modules with the fewest reverse dependencies; port those first, then walk inward toward Django views and the core ORM.
- Special attention: bytes vs str semantics (the single biggest Py2→3 footgun). Audit every `open()`, every external API call, every database column for `bytes`/`str` mismatch. Most of the 1990s tools that "worked" silently corrupted data here.
- Celery: Celery 4 is the last Py2-compatible series. Plan for Celery 5.x on Py3 — different default broker behaviors; redirect traffic via a transitional second worker fleet.
- Django: 1.11 is the last Py2-compatible. Upgrade path: 1.11 → 2.2 LTS → 3.2 LTS → 4.2 LTS → 5.x. Each LTS hop has a documented release-notes checklist; budget 4-6 weeks per hop for a codebase this size.

**Month 9-12: Switchover.**
- All modules are dual-compatible AND have green dual-version CI for ≥2 weeks.
- Canary Py3.13 deploy: 1 pod, then 10%, then 50%, watching error rate, p99 latency, memory, and a custom invariant test (a daily reconciliation job that checks Py2 and Py3 produce identical outputs on a sample of writes).
- Cut over Celery workers fleet-by-fleet (transactional processors last).
- Once 100% on Py3.13 for 30 days with no rollback, freeze Py2 codepaths and remove the `from __future__` shims, tox `py27` env, and dual-compat lint rules.

**Month 12-15: Modernize.**
- Now on Py3.13: adopt type hints aggressively (mypyc-eligible), replace homegrown ORM extension with SQLAlchemy 2.x patterns where feasible, retire Celery in favor of arq for new async paths, swap the legacy `suds` shim for direct `zeep`.

**Month 15-18: Buffer + audit.**
- Re-engage the security auditor; close the 47 CVEs with version-pinned proof. License renewal docs prepared 3 months ahead of the deadline.

**Risk surfaces (what could blow up):**

1. **Bytes vs str silent corruption.** Mitigation: a content-hash invariant test on every persisted record before and after a parallel run. Catch it before customers do.
2. **Numerical drift in NumPy / Cython.** Mitigation: golden-file regression tests with float tolerances on the top 50 risk-bearing computations (interest calc, FX conversion). Ratchet tolerances tighter over time.
3. **Pickle compatibility.** Py2 pickles cannot always be loaded under Py3. Mitigation: re-serialize all caches/persisted pickles via a one-time job during the cutover window.
4. **Performance regression.** Py3.13 is generally faster but specific paths can regress. Mitigation: load-test rig with traffic replay; flag any p99 regression > 10%.
5. **Engineer morale.** A 12-month migration is a slog. Mitigation: visible monthly dashboard, named "ported by X" credits in commits, and porting time counts as feature delivery for performance reviews.

**Monthly board metric:**

A single chart with three lines: (a) percent of total LOC ported (mechanical metric), (b) percent of CI suite green on Py3.13 (correctness metric), (c) percent of production traffic served by Py3.13 (cutover metric). The third line is the only one that closes the auditor's finding; the first two predict it.

**Exit criteria:**

100% prod traffic on Py3.13 for 30 days, zero rollbacks, all 47 CVEs closed with current versions, license auditor signs off.

**Lessons from peers:**

Instagram's well-documented Py2→3 migration (2017) used dual-compat-first, then cutover; Dropbox's was painful because Cython extensions were the long-tail blocker — same risk this team faces. Plan for the Cython extension to be the slowest item, not the largest.

**rubric:**

30-pt: rejects big-bang with concrete reasoning (3) + chooses dual-compat in-place + targeted strangler hybrid (3) + 18-month plan that meets the audit deadline (4) + addresses the two named legacy deps (suds, Cython) explicitly (3) + bytes/str migration risk called out (3) + Django + Celery upgrade sequencing (3) + parallel-run + invariant testing for correctness (3) + dual-CI ratcheting (2) + monthly board metric tied to audit deliverable (3) + risk surface enumeration with mitigations (3).

**watermark_seed:** qorium-python-v0.6-080-seed-1c7a4e9b
**variant_seed:** qorium-python-v0.6-2026-05-07-080
**bias_check_notes:** No bias. Indian fintech context is incidental; the migration mechanics are universal.

---

## End of Senior Python QOR-PYTHON-061..080 Extension (Wave-1, v0.6)

**Distribution:** 12 MCQ + 4 code + 2 design + 2 casestudy.
**Difficulty mix:** 3 Easy + 9 Medium + 6 Hard + 2 Very Hard.
**Status:** AI-drafted. Awaiting SME Lead validation per Constitution v0.6.
