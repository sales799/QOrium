# Wave 1 Extension: Senior AI Prompt Engineering (QOR-AIPE-081..100)

**STATUS:** AI-drafted v0.6 EXTENSION — closes AIPE 100/100 ✅. SME Lead validation pending.

## 20 NEW Questions (QOR-AIPE-081..100)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 81: System Prompt vs Few-Shot Trade-Off (Easy)

**question_id:** QOR-AIPE-081
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** sysprompt-vs-fewshot
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Prompt engineering literature

**body:** Behavior shaping — system prompt rules vs few-shot examples:

**options:**
- A) Same
- B) **System prompt** = explicit rules ("respond in JSON / be concise / refuse X"). **Few-shot** = examples teach pattern by demonstration. Combine for best result. System prompt good for hard rules + persona; few-shot good for nuanced format / style. Few-shot eats more tokens
- C) Use only one
- D) Random

**answer_key:** B — Combine; choose by task type. References: prompt eng literature.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-081-seed-2c8a4e9b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-081
**bias_check_notes:** No bias.

---

### QUESTION 82: Chain-of-Verification (Easy)

**question_id:** QOR-AIPE-082
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** chain-of-verification
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Dhuliawala et al. CoVE

**body:** Chain-of-Verification (CoVe):

**options:**
- A) Random verification
- B) **(1) Generate initial answer; (2) Generate verification questions probing claims; (3) Answer each question independently; (4) Generate final answer using verified facts**. Reduces hallucination 20-50% on factual tasks. Cost: 2-4x tokens. Use selectively (high-stakes facts)
- C) Single pass
- D) Disabled

**answer_key:** B — CoVe is a structured anti-hallucination pattern. Reference: Dhuliawala et al.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-082-seed-7e3c8a2b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-082
**bias_check_notes:** No bias.

---

### QUESTION 83: Output Length Control (Easy)

**question_id:** QOR-AIPE-083
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** output-length
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Prompt engineering practice

**body:** Control LLM output length:

**options:**
- A) Hope
- B) **Multiple levers**: (1) `max_tokens` parameter (hard cap; cuts mid-sentence if exceeded); (2) prompt-side instruction ("respond in 100 words or less"); (3) format constraint ("3 bullets"); (4) word count + "stop early if covered"; (5) iterate with feedback if too long. Hard cap protects cost; prompt instruction protects quality
- C) Always max
- D) Token disable

**answer_key:** B — Multi-lever length control. References: prompt eng practice.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-083-seed-3a8c5e7b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-083
**bias_check_notes:** No bias.

---

### QUESTION 84: Negative Prompting (Medium)

**question_id:** QOR-AIPE-084
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** negative-prompt
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Prompt engineering literature

**body:** "Don't do X" instructions:

**options:**
- A) Always work
- B) **LLMs handle "do X" better than "don't do X"** — negative instructions can paradoxically anchor on the prohibited behavior. Convert to positive: instead of "don't include code," say "respond in plain English." Reserve "don't" for clear-cut cases (don't reveal API keys); pair with positive alternative
- C) Same
- D) Useless

**answer_key:** B — Positive framing more reliable. References: prompt eng literature.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-084-seed-9c4e8a3b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-084
**bias_check_notes:** No bias.

---

### QUESTION 85: Adaptive Prompting (Medium)

**question_id:** QOR-AIPE-085
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** adaptive-prompt
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Prompt engineering literature

**body:** Different user types need different responses. Approach:

**options:**
- A) One-size-fits-all
- B) **User profile / context detection → adapt prompt accordingly**. Beginner: explanations, more context, fewer assumptions. Expert: terse, technical, no padding. Detect via: explicit user role (signed in), inferred via earlier responses, set via UI toggle. System prompt switches via template; few-shot examples per persona
- C) Always terse
- D) Random

**answer_key:** B — Persona-adaptive prompting improves UX. Reference: literature.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-085-seed-4d8c2a9b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-085
**bias_check_notes:** No bias.

---

### QUESTION 86: Tool-Use Confirmation Pattern (Medium)

**question_id:** QOR-AIPE-086
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** tool-confirmation
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Agent design patterns

**body:** Tool-use safety for high-impact actions (delete, send email, charge card):

**options:**
- A) Auto-execute
- B) **Confirmation gate**: agent proposes the action with summary; human/system explicitly approves; only then execute. For automated agents: dry-run mode showing what would happen; require staging-env validation before prod. NEVER auto-execute irreversible actions without explicit pre-authorization
- C) Skip
- D) Random

**answer_key:** B — Confirmation gates for irreversible. References: agent docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-086-seed-2c8a5e7b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-086
**bias_check_notes:** No bias.

---

### QUESTION 87: Vendor Lock-In Mitigation (Medium)

**question_id:** QOR-AIPE-087
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** vendor-lock-in
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** LLM vendor strategy literature

**body:** Reduce vendor lock-in:

**options:**
- A) Single vendor always
- B) **Abstraction layer (LLM proxy / router)** — common interface; switch providers without app code change (LiteLLM, Portkey). Plus: prompt formats vary (Anthropic vs OpenAI); test on multiple. Open models (Llama, Mistral) as fallback. Note: capability differences are real; switching has accuracy implications. Trade-off: vendor abstraction has small perf overhead
- C) Always switch
- D) Lock-in OK

**answer_key:** B — Abstraction layer + multi-vendor testing reduces risk. References: LLM router docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-087-seed-9b3a8e4c
**variant_seed:** qorium-aipe-v0.6-2026-05-08-087
**bias_check_notes:** No bias.

---

### QUESTION 88: Caching Strategies (Medium)

**question_id:** QOR-AIPE-088
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** llm-caching
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** LLM caching literature

**body:** LLM response caching:

**options:**
- A) Cache always
- B) **Multi-tier**: (1) provider prompt cache (prefix reuse, ~10% cost on hit); (2) client-side exact-match cache (Redis; identical query/temperature; TTL); (3) semantic cache (embed query, hit if similar above threshold; like GPTCache); (4) deterministic vs creative — only cache deterministic. Trade-offs: stale, false-similarity (semantic), cache key hygiene (user-specific data)
- C) Disable
- D) Single tier

**answer_key:** B — Multi-tier cache strategy. References: LLM caching docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-088-seed-3a7c5b9e
**variant_seed:** qorium-aipe-v0.6-2026-05-08-088
**bias_check_notes:** No bias.

---

### QUESTION 89: Test-Time Compute (Medium)

**question_id:** QOR-AIPE-089
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** test-time-compute
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Reasoning literature

**body:** Test-time compute scaling:

**options:**
- A) Train more
- B) **Spend more inference compute → better answers** (CoT, self-consistency, search-based reasoning, MCTS-style; o1/o3/Claude thinking implement this). Smaller model + more compute can beat larger model + less compute on reasoning. Trade-off: latency. Use selectively (high-stakes problems); chat use base model
- C) Disabled
- D) Useless

**answer_key:** B — Test-time compute is a real lever. References: reasoning literature.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-089-seed-7c4a8e3b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-089
**bias_check_notes:** No bias.

---

### QUESTION 90: Multi-Lingual Prompts (Medium)

**question_id:** QOR-AIPE-090
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** multilingual
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Multilingual LLM research

**body:** Multilingual app design:

**options:**
- A) Always English
- B) **Match input language**: user prompts in Hindi → respond Hindi (model handles many languages well; major models support 50+). Quality varies (English best, then European, then low-resource). For low-resource: translate-to-English → process → translate-back can outperform direct, but loses nuance. Test per language. India: Hindi/Tamil/Telugu generally well-supported in modern models
- C) Hindi only
- D) Random

**answer_key:** B — Multilingual via language matching with quality awareness. References: multilingual LLM research.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-090-seed-3a8c5e2b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-090
**bias_check_notes:** No bias.

---

### QUESTION 91: Agent Memory (Medium)

**question_id:** QOR-AIPE-091
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** agent-memory
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Agent memory literature

**body:** Long-term memory for AI assistant:

**options:**
- A) Always context
- B) **Tiered memory**: (1) Short-term = current conversation context; (2) Working memory = recent N turns + summary; (3) Long-term = vector store of important facts (extracted via LLM summary); (4) Episodic = snapshots of past sessions retrievable. Modern: Anthropic Memory tool, custom vector stores. Plus user-level "remember X" stored explicitly
- C) Single big context
- D) Stateless

**answer_key:** B — Tiered memory architecture. References: agent literature.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-aipe-v0.6-091-seed-2c8a4e9b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-091
**bias_check_notes:** No bias.

---

### QUESTION 92: Code — Semantic Cache (Hard - Code)

**question_id:** QOR-AIPE-092
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** semantic-cache
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** GPTCache + semantic caching docs

**body:** Implement Python semantic cache for LLM responses: embed query, check vector DB for similar query (threshold > 0.95 cosine), return cached if hit; else call LLM and store.

**options:** []

**answer_key:**

```python
import anthropic
import numpy as np
from openai import OpenAI
import redis
import json
import hashlib

llm = anthropic.Anthropic()
emb_client = OpenAI()  # for embeddings
r = redis.Redis()

CACHE_NAMESPACE = "llmcache"
SIM_THRESHOLD = 0.95

def get_embedding(text: str) -> np.ndarray:
    e = emb_client.embeddings.create(model="text-embedding-3-small", input=text)
    return np.array(e.data[0].embedding, dtype=np.float32)

def cosine_sim(a: np.ndarray, b: np.ndarray) -> float:
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

def cache_key(prompt: str) -> str:
    return f"{CACHE_NAMESPACE}:{hashlib.sha256(prompt.encode()).hexdigest()}"

def store(prompt: str, response: str, embedding: np.ndarray, ttl_seconds: int = 86400):
    key = cache_key(prompt)
    r.hset(key, mapping={
        "prompt": prompt,
        "response": response,
        "embedding": embedding.tobytes(),
    })
    r.expire(key, ttl_seconds)
    # Also push to sorted set for scan
    r.sadd(f"{CACHE_NAMESPACE}:keys", key)

def lookup_semantic(query: str) -> tuple[str, float] | None:
    """Returns (cached_response, similarity) or None."""
    q_emb = get_embedding(query)
    best = None
    best_sim = 0.0
    # Naive: scan all keys. Production: use a vector DB (pgvector / Pinecone / Qdrant).
    for key in r.smembers(f"{CACHE_NAMESPACE}:keys"):
        data = r.hgetall(key)
        if not data:
            r.srem(f"{CACHE_NAMESPACE}:keys", key)
            continue
        cached_emb = np.frombuffer(data[b"embedding"], dtype=np.float32)
        sim = cosine_sim(q_emb, cached_emb)
        if sim > best_sim:
            best_sim = sim
            best = data[b"response"].decode()
    if best and best_sim >= SIM_THRESHOLD:
        return best, best_sim
    return None

def query_with_cache(prompt: str) -> dict:
    hit = lookup_semantic(prompt)
    if hit:
        return {"response": hit[0], "from_cache": True, "similarity": hit[1]}

    # Cache miss → call LLM
    msg = llm.messages.create(
        model="claude-haiku-4-5",
        max_tokens=500,
        messages=[{"role": "user", "content": prompt}],
    )
    response = msg.content[0].text
    store(prompt, response, get_embedding(prompt))
    return {"response": response, "from_cache": False}
```

Key points: embedding-based similarity, threshold tuning critical (too low = wrong responses; too high = no hits); production swap Redis-scan → vector DB; user-scoped cache namespace if PII (per-user keys); TTL handles staleness; metrics: hit-rate, false-positive rate (sample audit). Reference: GPTCache docs.

**rubric:** 12-pt: embedding via OpenAI / similar (3) + cosine similarity threshold (2) + Redis storage with TTL (2) + cache miss → LLM → store (2) + return type with metadata (1) + caveat: vector DB for scale (2).

**watermark_seed:** qorium-aipe-v0.6-092-seed-7e3c8a4b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-092
**bias_check_notes:** No bias.

---

### QUESTION 93: Code — Eval Suite with Pytest (Hard - Code)

**question_id:** QOR-AIPE-093
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** eval-pytest
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** LLM eval best practices

**body:** Set up pytest suite that exercises a function `classify(text) -> Category` against 100-row CSV; assert exact match, with LLM-judge fallback; output failures with diff for debugging.

**options:** []

**answer_key:**

```python
# tests/eval/test_classify.py
import csv
import pytest
from pathlib import Path
from app.classifier import classify   # the system under test
from tests.helpers.judge import llm_judge_match

GOLDEN_PATH = Path(__file__).parent / "golden.csv"

def load_golden():
    with open(GOLDEN_PATH) as f:
        return [row for row in csv.DictReader(f)]

@pytest.mark.parametrize("row", load_golden(), ids=lambda r: r["id"])
def test_classify_golden(row):
    text = row["input"]
    expected = row["expected"]
    actual = classify(text)
    if actual == expected:
        return
    # Soft: LLM-judge for fuzzy match (catches reasonable rephrasings)
    judge_score = llm_judge_match(text, actual=actual, expected=expected)
    assert judge_score >= 0.7, (
        f"Mismatch on id={row['id']}\n"
        f"  input:    {text}\n"
        f"  expected: {expected}\n"
        f"  actual:   {actual}\n"
        f"  judge:    {judge_score:.2f}"
    )

# Optional: aggregate stats
@pytest.fixture(scope="session", autouse=True)
def report():
    yield
    # collect & write summary post-run
    ...
```

```python
# tests/helpers/judge.py
from anthropic import Anthropic
import json
client = Anthropic()

def llm_judge_match(input_, *, actual, expected) -> float:
    sys = ('Return JSON {"score": <float 0-1>}: how well does \'actual\' '
           'match \'expected\' for the given input? 1.0 = identical meaning, '
           '0.5 = partial, 0.0 = wrong.')
    user = f"Input: {input_}\nExpected: {expected}\nActual: {actual}"
    r = client.messages.create(
        model="claude-haiku-4-5", max_tokens=100, system=sys,
        messages=[{"role": "user", "content": user}],
    )
    try:
        return float(json.loads(r.content[0].text)["score"])
    except Exception:
        return 0.0
```

Key points: parametrize gives one test per golden row (named); exact match fast-path before LLM call (cost); fuzzy threshold 0.7; rich failure message for debugging; optional session-aggregate fixture for summary; CSV is git-tracked (golden set evolves with PRs). CI: deploy gated on this suite. Reference: LLM eval best practices.

**rubric:** 10-pt: pytest parametrize from CSV (3) + exact-match fast path (2) + LLM-judge fallback (3) + rich failure message (2).

**watermark_seed:** qorium-aipe-v0.6-093-seed-3a8c5e2b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-093
**bias_check_notes:** No bias.

---

### QUESTION 94: Open Models vs API (Hard)

**question_id:** QOR-AIPE-094
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** open-vs-api
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** OSS LLM landscape

**body:** Open model (Llama, Mistral, Qwen) self-hosted vs API:

**options:**
- A) Always API
- B) **Open self-hosted** when: high volume (cost crossover ~50K req/day on smaller models); regulatory data residency; latency-sensitive (sub-100ms inference); custom fine-tune. **API** when: low volume, capability frontier needed (GPT-5/Claude-Opus-4.7), no infra team. Quality gap closes year-over-year; current 2026 gap: 5-15% behind frontier on hardest tasks
- C) Self-hosted only
- D) Open is worse always

**answer_key:** B — Choice depends on volume + privacy + capability needs. References: OSS LLM landscape.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aipe-v0.6-094-seed-9b3a8c4e
**variant_seed:** qorium-aipe-v0.6-2026-05-08-094
**bias_check_notes:** No bias.

---

### QUESTION 95: A/B Testing LLM Versions (Hard)

**question_id:** QOR-AIPE-095
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** ab-test-llm
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Experimentation literature

**body:** A/B test new LLM version / new prompt / new model:

**options:**
- A) Switch all traffic
- B) **Canary rollout 5/25/50/100% over days; compare metrics: user-feedback (👍/👎), eval suite pass-rate, revenue, retention. NEVER ship purely on offline eval — production behavior differs**. Pause if regression. Statistical significance per metric. Multi-armed bandit for fast iteration. Confidence interval reporting
- C) Random pick
- D) Skip testing

**answer_key:** B — Canary + production metrics is canonical. References: experimentation lit.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aipe-v0.6-095-seed-2c8a4e7b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-095
**bias_check_notes:** No bias.

---

### QUESTION 96: Inference Optimization (Hard)

**question_id:** QOR-AIPE-096
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** inference-optimization
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** vLLM, TGI docs

**body:** Self-hosted open LLM serving — optimize:

**options:**
- A) Default vanilla
- B) **vLLM (continuous batching, paged attention)** or TGI (HuggingFace) — 5-20x throughput vs naive. Quantization (FP8 / INT8 / GGUF Q4) — 2-4x throughput at small accuracy cost. Speculative decoding — 1.5-2x speed. Multi-GPU tensor parallel for larger models. KV-cache compression for long context. Choose by hardware + workload
- C) Bigger box
- D) Random

**answer_key:** B — Inference engine + quantization is leverage. References: vLLM docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-aipe-v0.6-096-seed-7e3c8a4b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-096
**bias_check_notes:** No bias.

---

### QUESTION 97: Design — Multi-Tenant LLM Platform (Hard - Design)

**question_id:** QOR-AIPE-097
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** multi-tenant-llm
**format:** design
**difficulty_b:** 1.4
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Design internal LLM platform for 50 product teams: model routing, per-team budgets, rate limits, observability, prompt sharing. (Limit: 800 words.)

**answer_key:**

**Stack: LLM gateway service + Postgres for config + Prometheus + Grafana + LiteLLM-style abstraction layer.**

**Core gateway responsibilities.**
- Single API entry: `/v1/chat/completions` accepting OpenAI-style requests.
- Auth: per-team API key + JWT with claims (team_id, environment, model_tier_allowed).
- Routing: based on `model` request → underlying provider (Anthropic, OpenAI, Bedrock, vLLM internal).
- Per-request: log + meter (input tokens, output tokens, latency, cost).

**Per-team controls.**
- Budget cap per month; 80% threshold alarm; 100% throttle.
- Rate limit per team (RPM, TPM).
- Allowed-models whitelist (some teams blocked from Opus to control cost).
- Per-team prompt-cache namespace.
- Per-team metrics dashboard.

**Prompt registry.**
- Git-backed; teams contribute prompts via PR.
- Versioned + tested; eval suite per prompt.
- Variant tracking (A/B production).
- Best practices catalog: shareable patterns.

**Observability.**
- Per-team dashboards: cost trend, latency distribution, error rate, model-mix.
- Provider-side anomaly detection.
- Per-team SLO: p99 latency, success rate.

**Routing intelligence.**
- Model cascade default (Haiku → Sonnet on low-confidence).
- Fail-over: provider X 5xx → route to provider Y same model class.
- Multi-region for latency.
- Budget-aware: if team's budget tight, route to cheaper model where eval allows.

**Safety + governance.**
- Centralized PII redaction toggle per team.
- Centralized prompt-injection guard.
- Audit log immutable to centralized log store.
- Compliance toggles (zero-retention, BAA).

**Self-service onboarding.**
- Team signs up → API key issued.
- Basic dashboard, default budgets.
- Documentation portal (Backstage-style).
- Sample integrations per language.

**Cost.**
- Gateway infra: $5-15K/mo (depends on volume).
- Pass-through to providers; teams see their cost.
- Bulk negotiation (Anthropic enterprise discount, AWS Bedrock commit) saves 10-20%.

**Failure modes.**
- Provider outage: auto-failover to alternative.
- Budget exhaustion: graceful degradation (fall to cheaper model) or block.
- Cache poisoning: namespace per team; integrity checks.
- Abuse / DDOS: rate limit + alert.

**Anti-patterns avoided.**
- "Each team negotiates own provider": vendor sprawl, no leverage.
- "No metering": runaway costs.
- "Centralize all prompts in gateway": loses per-team experimentation.

**Outcome target.**
- 50 teams onboarded.
- 30% cost saving via cascade + caching + bulk discount.
- Time-to-onboard new team: < 1 day.
- 99.9% gateway uptime.

**rubric:** 18-pt: gateway architecture (3) + per-team budgets + rate limits (3) + prompt registry git-backed (3) + observability dashboards (3) + multi-provider routing + failover (3) + safety governance: PII / injection / audit (2) + cost framing 30% saving (1).

**watermark_seed:** qorium-aipe-v0.6-097-seed-9c4a8e3b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-097
**bias_check_notes:** No bias.

---

### QUESTION 98: Casestudy — RAG Quality Crisis (Very Hard - Casestudy)

**question_id:** QOR-AIPE-098
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** rag-quality-crisis
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** RAG-based product chatbot quality regressed: from 85% accuracy on golden set to 62% over 4 weeks. Investigate, fix. (Limit: 800 words.)

**answer_key:**

**Step 1 — diagnose: which layer regressed?**

RAG has 4 layers; isolate each:
1. **Retrieval**: was right doc retrieved? Run golden queries; check top-K hits. If retrieval recall dropped, the embedding/index changed or corpus shifted.
2. **Reranker**: order issue? Check pre-vs-post rerank.
3. **Generation**: given right docs, does model produce right answer? Substitute manually-perfect retrieval; rerun; compare.
4. **Eval / golden set**: did golden answers go stale? Sample failures; some "wrong" may be reality-correct.

**Step 2 — common root causes (in order of probability).**

1. **Corpus drift**: docs got updated but old chunks didn't re-index. Out-of-date knowledge in vector store.
2. **Model version change**: provider auto-upgraded model alias (GPT-4 → GPT-4-Turbo behavior change).
3. **Embedding model swap**: someone updated embedding model; re-indexed but new embeddings have different similarity properties.
4. **Prompt drift**: someone tweaked system prompt over 4 weeks; small changes accumulated.
5. **Chunk size change**: re-ingested with different chunking strategy.
6. **Stale cache**: cached old answers; new docs not reflected.
7. **User-input distribution shift**: users asking different questions than golden set covers.

**Step 3 — investigation toolkit.**

- Diff: current corpus vs 4-week-ago corpus. Which docs changed.
- Diff: current prompt vs git history. PRs touching prompt.
- Diff: embedding model versions; library updates.
- Per-query trace: golden query → retrieved → generated; manually inspect failures.

**Step 4 — likely findings + fixes.**

If corpus drift:
- Re-index pipeline must be incremental + alerted; CI gate on staleness > 24h.
- Doc versioning (Iceberg-style) so "current" + "historic" both queryable.
- Stale answer detection: response should cite source; if cite doc < freshness threshold, flag.

If prompt drift:
- Lock prompts in git; PR-reviewed; version tagged.
- Eval suite gates merging.
- Document prompt rationale.

If model change:
- Pin model version (don't use aliases that auto-update); upgrade deliberately.
- Re-eval before adopting new model.

If chunk strategy:
- Test new chunking on golden set BEFORE swap.
- A/B between strategies.

**Step 5 — fix + relaunch.**

- Restore baseline (revert prompt, restore index, downgrade model if applicable).
- Monitor for 1-2 weeks; verify accuracy returns.
- Then re-attempt updates, gated by eval.

**Step 6 — process improvements.**

- **Eval suite as deploy gate**: every change to prompt/index/model passes 90%+ accuracy on golden set. Block merge.
- **Continuous eval**: nightly run + alert on drift.
- **Versioned RAG corpus**: snapshot per release; can roll back.
- **Prompt + model + index pinning**: explicit; not auto-update.
- **Model upgrades**: dedicated process, eval gate, canary.
- **Golden set evolution**: monthly review; add new representative queries; archive obsolete.

**Step 7 — broader observations.**

- 85% → 62% over 4 weeks suggests slow accumulation of small regressions, not a single big change. Continuous eval would catch this in week 1.
- Most teams set up eval at launch then never look at it; eval as live signal is the discipline.
- "We don't have the budget for eval" is wrong; eval prevents the cost of finding out via customers.

**Customer comms.**

- If customers haven't noticed: fix quietly.
- If customers noticed (CSAT drops, support tickets): apologize, restore, communicate fix.

**Lessons.**

- RAG quality regresses naturally if not actively maintained.
- Eval is a discipline; one-time eval catches launch issues, continuous eval catches drift.
- Pin everything (model, prompt, embedding, chunk strategy); upgrade deliberately not implicitly.
- Investigate failures by isolating each RAG layer; don't tune one-by-one randomly.
- Customer trust is hardest to recover from gradual degradation; vigilance wins.

**rubric:** 25-pt: isolate which RAG layer regressed (4) + enumerate common root causes (4) + investigation toolkit (3) + fixes per cause (4) + restore baseline + monitor (2) + eval gate as standard (3) + continuous eval as live signal (3) + lessons: pin everything; eval is discipline (2).

**watermark_seed:** qorium-aipe-v0.6-098-seed-3c2a4e8b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-098
**bias_check_notes:** No bias.

---

### QUESTION 99: Casestudy — AI Product PMF Failure (Very Hard - Casestudy)

**question_id:** QOR-AIPE-099
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** ai-product-pmf
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** AI assistant feature launched 3 months ago; usage stagnant at 5% DAU; CSAT 3.1/5. CEO wants you to fix. Plan diagnosis + turn-around. (Limit: 800 words.)

**answer_key:**

**Step 1 — diagnose: WHY isn't it used?**

Categorize possible causes:
1. **Discoverability**: users don't know feature exists. Product positioning issue.
2. **Onboarding friction**: feature behind too many clicks.
3. **Trust**: users tried, got bad result, bailed (single-touch failure).
4. **Job-not-done**: feature solves something users don't actually need.
5. **Quality**: feature works but accuracy / latency below tolerance.
6. **Workflow disconnect**: doesn't fit naturally in user's existing flow.
7. **Cost / pricing**: gated behind paywall.

**Investigation.**

- **Funnel analysis**: how many see it? click? complete first task? return next day?
- **User interviews**: 10-20 actual users (some who tried, some who never tried) — what pain they have, what they tried, what surprised them.
- **CSAT 3.1 breakdown**: what specifically frustrated them? Top 3 feedback themes.
- **Comparison**: what do users currently do for the same job? AI feature must be 10x better than status quo.
- **Quality metrics on top tasks**: hallucination rate, retry rate, time-to-completion.

**Step 2 — likely findings.**

Most common AI feature PMF failures:
1. **"AI for AI's sake"**: feature exists because "AI is hot," not because it solves a real pain. Users see it as gimmick.
2. **Non-deterministic UX**: same query, different answer. Users distrust.
3. **Over-promising**: marketing said "AI does X"; in reality, AI struggles with X. Users feel deceived.
4. **High-effort first-mile**: user has to type natural language; UI doesn't guide. Comparison: button is faster.
5. **No clear value-add over existing flow**: existing search/UI works; AI marginally better; doesn't justify learning new pattern.
6. **Hallucination at first touch**: user's first query got fabricated answer; trust permanent loss.

**Step 3 — fixes.**

**For discoverability/onboarding:**
- Inline placement (not separate tab); contextual triggers ("ask AI about this row").
- Guided first task ("Try asking: ___"); template prompts; click-to-fill.
- Gentle nudges, not blocking modals.

**For trust:**
- Cite sources (RAG-style).
- Show confidence; refuse low-confidence.
- Explicit "this is AI-generated; verify before acting."
- One-click correction loop (👍/👎 → improve).

**For quality:**
- Eval-driven improvement loop.
- Cascade pattern: more compute on harder queries.
- Pin to user's data (RAG); not generic answers.
- Test on real production queries, not just curated.

**For value-add:**
- Identify specific user job that's painful → AI eliminates pain. Don't try to be general.
- Vertical use cases beat horizontal "ask anything."
- Measure time-saved per task; if not 5x, don't ship.

**For workflow:**
- Embed in existing primary flow (NOT new menu / new screen).
- Pre-fill from current context.
- Output goes back into the workflow (not just chat history).

**Step 4 — relaunch playbook.**

- 4-6 week iteration on top 3 user pains.
- Beta with 20 friendly users; weekly feedback.
- Production canary on opt-in 10% of DAU.
- Measure: not vanity (clicks) but value (job-completion-rate, retention, CSAT).

**Step 5 — strategic question.**

If after 3-6 months of focused work, usage stays low + CSAT below 4: be honest with CEO. Maybe the feature isn't right for the product; better to deprecate and re-invest.

**Lessons (universal AI product).**

- AI features that ship to no demand fail; user-pain-first is the discipline.
- "Build AI feature" is not a product strategy; "solve specific user pain better than alternatives" is.
- Trust is built via consistency + accuracy; lost via single bad experience.
- Vertical depth > horizontal breadth for early AI features.
- Measure value-add, not engagement; engagement can be vanity.

**Comms.**

- CEO: "Here's the diagnosis: <X>. Here's the 6-week plan. Here are the metrics that determine continue / pivot / kill."
- Engineering: align around real user pain, not "what AI can do."
- Product: defined success criteria pre-relaunch.

**Outcome target.**

- 6 weeks: usage 5% → 15% DAU; CSAT 3.1 → 4.0+.
- If not improving, kill or pivot. Sunk-cost-fallacy avoided.

**Cost.**
- 4-6 weeks engineering investment.
- User research: $20-50K (interviews, beta program).
- Decision cost: clear at 12 weeks.

**Anti-patterns to avoid.**

- "Add more AI features" without fixing PMF.
- "Make AI smarter" without fixing UX.
- "Hide low engagement metrics."
- "Continue indefinitely without success criteria."

**rubric:** 25-pt: diagnose categories (5) + investigation funnel + interviews (4) + identify common AI PMF failures (4) + fixes for trust + value-add + workflow integration (5) + relaunch with measurable success criteria (3) + honest kill/pivot framing if not improving (2) + lessons: user-pain-first not AI-feature-first (2).

**watermark_seed:** qorium-aipe-v0.6-099-seed-2c8a4e7b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-099
**bias_check_notes:** No bias.

---

### QUESTION 100: Casestudy — Building an AI Center of Excellence (Very Hard - Casestudy)

**question_id:** QOR-AIPE-100
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** ai-coe
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** AI CoE literature

**body:** Enterprise (10K employees, $5B revenue, 50+ teams) wants an AI CoE. Plan structure, charter, deliverables, success metrics, prevention of common pitfalls. (Limit: 1000 words.)

**answer_key:**

**Charter.**

> AI Center of Excellence enables product teams to build, ship, and operate AI features safely, quickly, and ethically — with shared infrastructure, governance, and guidance — without becoming AI experts.

It's a **federated** team — enabling rather than gatekeeping. Product teams own their AI features; CoE provides shared services, standards, governance, and capability-building.

**Why CoE (vs each team alone vs full centralization).**

At 50 teams, decentralized = redundant infra, inconsistent governance, regulatory risk. Full centralization = bottleneck. Federated CoE = shared platform + per-team domain ownership.

**Org structure (~15-20 in CoE proper, plus per-team liaisons).**

- **Lead** (Director) reports to CTO/CIO.
- **Platform pod (4-6)**: LLM gateway, eval infra, prompt registry, model serving (vLLM cluster for open models), MLOps tooling.
- **Governance pod (3-4)**: AI policy, ethics, compliance (DPDPA / GDPR / EU AI Act / sector-specific), audit trails, incident response.
- **Research pod (3-4)**: model benchmarking, capability tracking, novel patterns (e.g., agents, multi-modal), prototype.
- **Education pod (2-3)**: training, certification, internal community of practice.
- **Per-team AI liaison** (not full-time CoE staff): 1-2 per product team; embedded but reports dotted-line to CoE.

**Charter deliverables (Year 1).**

**Q1.**
- Stand up team; align with executive sponsors.
- LLM gateway v1: single auth, per-team budget, observability.
- AI policy v1: prohibited use, required reviews, data privacy, vendor terms.
- Vendor relationships: Anthropic, OpenAI, AWS Bedrock — enterprise agreements, BAAs.
- Initial standards: prompt safety, eval requirements.

**Q2.**
- LLM gateway adopted by 20+ teams.
- Eval infrastructure: shared golden-set framework; per-team eval suites; CI gates.
- Prompt registry: git-backed shared library.
- AI ethics review board for high-risk use cases (healthcare, hiring, legal, finance).
- Onboarding documentation + portal.

**Q3.**
- All 50 teams onboarded to gateway.
- Multi-region deployment for compliance (Hyperforce IN, EU).
- Open model serving (vLLM cluster) for cost-sensitive workloads.
- Quarterly model benchmark report.
- Compliance audit: SOC 2 / ISO 27001 / sector-specific (e.g., HIPAA if healthcare).

**Q4.**
- Per-team cost showback dashboards.
- Adoption survey: NPS > 40.
- Mature incident-response runbook + tabletop exercises.
- Capability assessment: each team self-rated; capability-building plan.
- Year-2 roadmap planned with stakeholder input.

**Year 2 evolution.**
- Agent platform (shared agent harness).
- Fine-tuning pipeline (LoRA / QLoRA on open models).
- Federated learning for cross-team data without data movement.
- Cost reduction: -10%/yr ongoing via cascade + open model substitution.

**Success metrics.**

- **Velocity**: time to ship new AI feature: months → weeks.
- **Cost**: per-feature LLM cost; total spend trend (target -10%/yr ongoing).
- **Quality**: aggregate eval pass-rate across all features; trend up.
- **Safety**: incident rate; near-miss reports.
- **Adoption**: 90%+ of teams using gateway by year-end.
- **Compliance**: zero major findings in audits.
- **Engineer satisfaction**: NPS > 40 from product teams.
- **Capability**: # of certified AI engineers; self-rated capability rising.

**What CoE IS.**

- Platform team (gateway, eval, MLOps).
- Standards body (privacy, safety, vendor terms).
- Governance body (AI ethics review for high-risk).
- Capability builder (training, mentorship, community).
- Bridge to vendors (negotiation, escalation).
- Crisis response (incident expertise on call).

**What CoE IS NOT.**

- Gatekeeper of every AI decision.
- Owner of every team's AI feature.
- A "do everyone's AI for them" service desk.
- Cost center without measurable value.
- Bureaucracy adding process for its own sake.

**Anti-patterns to avoid (specific to AI CoE).**

- **"Prescribe one model for everyone."** Different use cases need different models. Curate, don't dictate.
- **"Block everything until reviewed."** Risk-tier approach; low-risk flows fast; high-risk careful.
- **"AI is special, ignore engineering hygiene."** No: AI features still need eval, observability, deploy gates, version control.
- **"Move fast and break things on AI."** Higher stakes (safety, regulation, customer trust); slower-but-right beats fast-but-broken.
- **"Centralize all AI work in CoE."** Ownership stays with product teams.
- **"CoE knows what's right; teams must comply."** Engagement-first; mandate only on safety/compliance.

**Common pitfalls + prevention.**

1. **CoE becomes bottleneck**: federate; clear OWNS vs SUPPORTS distinction.
2. **Teams ignore CoE**: provide value; gateway makes lives easier.
3. **Compliance theater**: real audits, not just paperwork.
4. **Hype vs substance**: measure outcomes, not features shipped.
5. **Brain drain**: AI engineers leave for higher pay; market-rate compensation + interesting work.
6. **Vendor capture**: maintain abstraction; multi-vendor capability.
7. **Ethics washing**: real review board; willingness to say no.

**Cost (illustrative).**

- CoE team: 15-20 FTE × $250K = $4-5M/yr.
- Tooling + infra: $1-2M/yr.
- Vendor commitments: $K-Mn depending on scale.
- Total investment: $5-10M/yr.
- ROI: typically 3-10x in year 2 (faster shipping, cost savings, risk avoidance).

**Phased adoption.**

- Q1: 5-10 friendly product teams (pilot).
- Q2: 30+ teams.
- Q3: 50 teams.
- Q4: optimize.

**Communication strategy.**

- Quarterly all-hands AI Review with leadership.
- Internal AI community of practice; monthly meetups.
- Public-facing AI principles (transparency builds trust).
- Annual AI report (impact, roadmap).

**Lessons (universal).**

- AI CoE done right amplifies; done wrong hampers.
- Federation > centralization at scale.
- Standards before adoption forces; let teams adopt voluntarily, then enforce for new only.
- Capability-building is multi-year; long horizon.
- Measure outcomes, not activity.

**rubric:** 30-pt: federated charter not gatekeeper (4) + pod structure (3) + 4-quarter deliverables (5) + measurable success metrics (4) + IS-vs-IS-NOT clarity (3) + AI-specific anti-patterns (5) + risks: bottleneck, ignore, compliance theater, hype, brain drain, vendor capture, ethics washing (4) + lessons: federation > centralization (2).

**watermark_seed:** qorium-aipe-v0.6-100-seed-7c4a8e3b
**variant_seed:** qorium-aipe-v0.6-2026-05-08-100
**bias_check_notes:** No bias.

---

## End AIPE 081-100. AIPE now at 100/100 ✅. ALL 8 of 8 Wave-1 sub-skills closed at 100/100 ✅✅✅.
