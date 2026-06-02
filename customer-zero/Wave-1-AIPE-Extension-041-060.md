# Wave 1 Extension: Senior AI Prompt Engineering (Questions 041–060)

**STATUS:** AI-drafted v0.6 EXTENSION (Senior AI Prompt Engineering scaling: 40→60 Qs, closing Wave 1 AIPE). SME Lead validation pending. NOT for external delivery. Reference baseline: 2026 LLM landscape — Claude (Anthropic), GPT (OpenAI), Gemini (Google), open models (Llama 3.3+, Mistral Large, Qwen 2.5). NOVEL ASSESSMENT DOMAIN — QOrium establishes the bar.

---

## Extension Pack: 20 Advanced Questions (Q041–Q060)

Difficulty distribution: 3 Easy (tool-use + observability intro), 7 Medium (long-context ops, cost-routing, fine-tune decision logic), 4 Hard Code (tool-chaining, agentic HITL, eval pipeline), 3 Hard Design (observability architecture, fine-tune vs RAG strategy), 3 Very Hard / Case Study (production agent workflows, cost-latency trade-off at scale, observability incident response).

All questions follow QOrium metadata schema. Sub-skills NEW: tool-use/function-calling depth, long-context advanced (needle + position bias), cost/latency routing, production observability, fine-tuning decision-making, agentic workflows + durability.

---

### QUESTION 41: Tool Use vs. Inline Code — When to Delegate (Easy)

**question_id:** QOR-AIPE-041
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** tool-use-function-calling-depth
**format:** MCQ
**difficulty_b:** -0.8 (Easy)
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Anthropic Tool Use Documentation (docs.claude.com/models/tool-use); Langchain ToolCalling (2026)

**body:**

An LLM-based code-review system needs to (1) fetch a GitHub repository, (2) parse the code, (3) invoke a linter, and (4) generate a review. Should all four tasks be delegated to tools, or should some be done inline by the LLM?

**options:**

- A) All tasks must be tools; the LLM cannot do anything itself
- B) Delegate deterministic, slow, or side-effect-heavy operations (fetch repo, invoke linter) to tools; let the LLM inline-generate the review using tool results
- C) Never use tools; the LLM should handle everything inline
- D) Tools are only for API calls; code parsing should be inline

**answer_key:**

B — Tool use is ideal for operations that are: (1) deterministic (exact output every time), (2) slow (external I/O: API calls, file reads), or (3) have side effects (write to disk, call external services). LLM-generated review is creative, context-dependent, and fast to generate — keep it inline. This minimizes latency (fetch + lint run in parallel if possible), cost (one LLM call instead of many), and error surface. References: Anthropic Tool Use Best Practices (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-041-seed-4f2c1b7a
**variant_seed:** qorium-aipe-v0.6-2026-05-03-041
**bias_check_notes:** No bias. Technical best practice.

---

### QUESTION 42: Parallel vs. Serial Tool Execution Trade-offs (Easy)

**question_id:** QOR-AIPE-042
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** tool-use-function-calling-depth
**format:** MCQ
**difficulty_b:** -0.6 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Anthropic Tool Use Orchestration (2026); async tool execution patterns

**body:**

An agent must call three independent tools: fetch_user_profile(), fetch_order_history(), fetch_support_tickets(). Each takes ~1 second. Should the agent call them serially (one-by-one: 3 seconds total) or in parallel (all at once: ~1 second total)?

**options:**

- A) Parallel is always faster but uses more CPU; serial is safer
- B) Parallel if tools are independent (no data dependency); serial if the output of one tool feeds the next
- C) Serial is required by LLM APIs; parallel is not supported
- D) The choice has no impact on latency

**answer_key:**

B — Parallelization only works when tools are independent (Tool A's result doesn't depend on Tool B's output). If fetch_user_profile() and fetch_order_history() have no dependency, run both in parallel. If fetch_risk_score() depends on fetch_order_history(), then serial is required. Modern LLM APIs (Anthropic, OpenAI) support parallel tool calls; the framework (Langchain, Anthropic SDK) handles orchestration. Parallel saves latency without increasing LLM cost (still one token-counted call). References: Anthropic Tool Use Orchestration (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-042-seed-9d3a1c2e
**variant_seed:** qorium-aipe-v0.6-2026-05-03-042
**bias_check_notes:** No bias. Technical best practice.

---

### QUESTION 43: Tool-Result Error Handling in Agentic Loops (Medium)

**question_id:** QOR-AIPE-043
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** tool-use-function-calling-depth
**format:** MCQ
**difficulty_b:** 0.4 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Error handling patterns in agentic systems; Langchain + Anthropic SDK docs (2026)

**body:**

An agent calls a tool fetch_weather(city="London"). The API returns: `{"error": "API rate limit exceeded"}`. How should the agent's prompt be structured to handle this gracefully?

**options:**

- A) Ignore the error and assume London has clear skies
- B) Instruct the agent: "If a tool returns an error, interpret it as a string (not structured data) and ask the user for clarification or retry with exponential backoff"
- C) Never use tools; they always fail
- D) Errors cannot be handled by the prompt; they require code changes

**answer_key:**

B — The agent's system prompt must include explicit error-handling guidance: "When a tool returns `{\"error\": ...}`, recognize it as a failure signal. Explain to the user that the service is unavailable, suggest a retry, or use a fallback (cached data, default answer). Do NOT fabricate data." This prevents silent failures and hallucinations. In code, implement retry logic (exponential backoff, circuit breaker) at the tool-wrapper level. Combining prompt guidance + code-level retry provides defense-in-depth. References: Error handling best practices in agent frameworks (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-043-seed-5c2f3d1a
**variant_seed:** qorium-aipe-v0.6-2026-05-03-043
**bias_check_notes:** No bias. Production best practice.

---

### QUESTION 44: Long-Context Needle-in-Haystack Optimization (Medium)

**question_id:** QOR-AIPE-044
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** long-context-advanced
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** Liu et al., "Lost in the Middle" (arXiv:2307.03172, 2023); Anthropic Context Window Guide (2026)

**body:**

A system inserts a "needle" (key fact: "CEO approval code: DELTA-7") somewhere in a 200K-token context window, then asks: "What is the approval code?" Research (Liu et al., 2023) shows:

- **Position effect:** LLMs answer correctly ~90% of time if needle is at the start or end; only ~40% if buried in the middle.
- **Retrieval method:** Using a reranker to surface the needle to the top (or marked with clear XML tags) restores ~90% accuracy.

For a production system with critical facts, how should you structure long contexts?

**options:**

- A) Spread facts evenly throughout the context; position doesn't matter
- B) Place all critical facts at the beginning or end; use XML tags `<CRITICAL>` for key information; optionally rerank long-context inputs to surface critical sections
- C) LLMs can always find needles; optimize for other metrics
- D) Long contexts are impossible; split into shorter calls instead

**answer_key:**

B — Position bias is real and measurable. Defenses: (1) place critical facts at the start or end of the context, (2) wrap them in visually distinct markers (`<CRITICAL>CEO approval: DELTA-7</CRITICAL>`), (3) use a reranker pre-processor to move high-relevance sections to the top of the context window. This is especially critical for compliance, security, or approval workflows where missing a fact is a failure. References: Liu et al., "Lost in the Middle" (2023); Anthropic Context Optimization Guide (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-044-seed-7f1d4c2b
**variant_seed:** qorium-aipe-v0.6-2026-05-03-044
**bias_check_notes:** No bias. Technical best practice for long contexts.

---

### QUESTION 45: Document Chunking Strategy for Long-Context RAG (Medium)

**question_id:** QOR-AIPE-045
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** long-context-advanced
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** LangChain Documentation (Recursive Chunking); semantic chunking patterns (2026)

**body:**

A 500-page compliance manual (500K tokens) is being prepared for RAG. Three chunking strategies are proposed:

**A)** Fixed-size chunks: 2K tokens each, no overlap → 250 chunks.
**B)** Semantic chunks: Split at logical boundaries (section headers, paragraph breaks) → ~150 chunks of variable size (500-3K tokens).
**C)** Sliding-window chunks: 2K tokens, 500-token overlap → 450 chunks.

Which minimizes retrieval errors while keeping embedding costs reasonable?

**options:**

- A) A is cheapest (fewest chunks) but may split sentences mid-way; leading to retrieval of incomplete information
- B) B (semantic chunking) respects document structure, reducing orphaned context; costs more to embed (~150×) but retrieval quality is higher; sweet spot for compliance docs
- C) C is unnecessary overhead; sliding windows increase cost without improving quality
- D) All strategies are equivalent; choice is arbitrary

**answer_key:**

B — Semantic chunking respects document boundaries (sections, paragraphs, definitions). A random fixed-chunk split of 2K tokens might break a compliance definition mid-sentence, creating "orphaned context" — a chunk without enough context to be useful. B ensures each chunk is a self-contained logical unit. Cost: 150 embeddings × ~$0.02 per 1K ≈ $3 one-time; reuses on every retrieval. Fixed-size chunking saves $1 upfront but introduces retrieval errors (incomplete facts, confusing context). For compliance (high cost of error), B is the right choice. References: LangChain Recursive Chunking Best Practices (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-045-seed-2a3f1d8c
**variant_seed:** qorium-aipe-v0.6-2026-05-03-045
**bias_check_notes:** No bias. Document processing best practice.

---

### QUESTION 46: Model Routing for Cost-Latency Optimization (Medium)

**question_id:** QOR-AIPE-046
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** cost-latency-engineering
**format:** MCQ
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** Model tiering best practices; cost optimization at scale (2026)

**body:**

An enterprise runs 100K LLM calls per month. Most are simple classification tasks (20 tokens input, 5 tokens output). A few (1%) are complex reasoning (500 tokens input, 200 tokens output). The team has access to:

- **Haiku** (Anthropic): $0.80/$2.40 per 1M tokens (input/output)
- **Sonnet** (Anthropic): $3/$15 per 1M tokens
- **Opus** (Anthropic): $15/$45 per 1M tokens

Which model routing strategy minimizes cost while maintaining accuracy?

**options:**

- A) Use Opus for everything; it's the most capable
- B) Route simple tasks (short input, simple output type) to Haiku; use Sonnet/Opus only when task complexity is high (reasoning, code generation) or accuracy is critical
- C) Use Haiku for everything; it's cheapest
- D) Model choice has negligible cost impact

**answer_key:**

B — Model routing (cost-aware dispatch) is standard MLOps practice. Simple classification (input: "Is this email spam?") succeeds >95% of the time on Haiku (~$0.0001 per call). Complex reasoning ("Generate a question-generation rubric for AIPE") needs Opus or Sonnet (~$0.002-0.004 per call). Routing strategy: (1) classify incoming task as simple/medium/hard, (2) dispatch to Haiku/Sonnet/Opus accordingly. Monthly cost: 99K simple tasks on Haiku + 1K complex on Sonnet ≈ $5-10. Opus-only: ~$100. Haiku-only: lower cost but 20% accuracy loss on hard tasks. References: Cost optimization at scale (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-046-seed-8c1f2a3d
**variant_seed:** qorium-aipe-v0.6-2026-05-03-046
**bias_check_notes:** No bias. Cost-routing best practice.

---

### QUESTION 47: Prompt Compression Techniques for Cost Reduction (Medium)

**question_id:** QOR-AIPE-047
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** cost-latency-engineering
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** LLM Compression patterns; token efficiency techniques (2026)

**body:**

A prompt is structured as:
```
You are a code reviewer. Here are the best practices:
1. Security: Check for SQL injection, XSS, CSRF, auth bypass...
2. Performance: Check for N+1 queries, memory leaks, CPU bottlenecks...
3. Testing: Check for missing unit tests, edge cases...
[... 50 more detailed lines ...]
Here is the code:
[CODE_BLOCK: 3K tokens]
```

Before sending to the LLM, the system uses **prompt compression** to rewrite the rules as:
```
Review this code for: Security (injection, XSS, CSRF, auth), Performance (N+1, leaks, CPU), Testing (coverage, edges). [CODE_BLOCK: 3K tokens]
```

What is the impact of this compression?

**options:**

- A) Compression loses information and hurts quality
- B) Compression reduces input tokens by ~40-60% while preserving meaning; at scale (1K reviews/month), saves ~$10-15 and reduces latency by 5-10%
- C) Compression is impossible; all words are necessary
- D) Compression only helps if the model is Haiku; Opus doesn't benefit

**answer_key:**

B — LLMs are robust to dense, concise instructions. Removing redundant phrases ("Here are the best practices:", "...") and condensing lists preserves meaning while cutting tokens. A 500-token instruction compressed to 200 tokens (60% reduction) saves $0.15 per call. At 1K calls/month: ~$150 saved. Modern LLMs (Opus, Sonnet, Haiku) all benefit equally. Trade-off: slightly harder to read for humans, but LLMs parse dense instructions well. Tools like LangChain's "compression chain" automate this. References: Token efficiency patterns (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-047-seed-3d5c1f2a
**variant_seed:** qorium-aipe-v0.6-2026-05-03-047
**bias_check_notes:** No bias. Cost optimization technique.

---

### QUESTION 48: Production Observability — Token-Level Tracing (Medium)

**question_id:** QOR-AIPE-048
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** production-observability-lm-apps
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** LangSmith Observability; Weights & Biases Model Monitoring (2026)

**body:**

A production question-generation system logs the following for every call:
- prompt_version, model, input_tokens, output_tokens, latency_ms, quality_score
- user_id, timestamp, cost

For identifying performance regressions, what additional "token-level" tracing is critical?

**options:**

- A) Token-level logging is overkill; aggregate metrics are sufficient
- B) Log completion_tokens_by_phrase (how many tokens were in the system prompt vs. user input vs. retrieved context) and model_version; this reveals if quality drops due to prompt changes, context shifts, or silent model updates
- C) Token tracing is only for debugging; don't log in production
- D) All tokens are equivalent; granularity doesn't matter

**answer_key:**

B — Token-level breakdown reveals hidden patterns: (1) If quality dropped after a prompt change, token_breakdown shows whether the system prompt grew (possibly introducing noise) or user-input distribution shifted. (2) If quality dropped but prompt and input are stable, check model_version — the API may have silently updated. (3) Cost per token can reveal data-corruption (unexpectedly long inputs). Example: "Quality dropped from 85% to 74%. Investigation: user_input_tokens increased 20% (more complex questions now being asked). System prompt stable. Model stable. Conclusion: quality drop is due to harder questions, not a regression." Without granular logging, you'd waste time chasing ghosts. References: LangSmith Observability Patterns (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-048-seed-1f4a3d2b
**variant_seed:** qorium-aipe-v0.6-2026-05-03-048
**bias_check_notes:** No bias. Production observability pattern.

---

### QUESTION 49: Alerting on LLM Output Degradation (Medium)

**question_id:** QOR-AIPE-049
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** production-observability-lm-apps
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** MLOps Monitoring; alerting best practices (2026)

**body:**

A chatbot system measures question-quality every 1 hour (sampling 50 requests, scoring with an LLM-as-Judge). The rolling 7-day average quality is 82%. Today, the 1-hour sample drops to 71%. Should an alert fire?

**options:**

- A) Yes, always alert on any drop
- B) No, ignore single outliers; wait for a confirmed trend (e.g., quality below 75% for 3+ consecutive hours)
- C) Unclear; depends on statistical significance test (e.g., drop is 2+ standard deviations from baseline)
- D) Never alert; manual review only

**answer_key:**

C — Naive alerting (any drop → alert) causes alert fatigue. Robust alerting uses statistical controls: (1) compute rolling mean and stddev of quality over the past 7-14 days (baseline). (2) if the latest 1-hour sample is >2 sigma below baseline, fire alert. A one-hour 71% might be noise (stddev ~5%, so 71% is only 2.2 sigma below 82%). Wait for 2-3 consecutive hours below threshold OR a >3 sigma drop. Tools like Datadog, New Relic, Prometheus alert manager support this. Example threshold: "Alert if quality < (mean - 2×stddev) for 2 consecutive hours." References: MLOps Monitoring Best Practices (2026).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-049-seed-6c2d3a1f
**variant_seed:** qorium-aipe-v0.6-2026-05-03-049
**bias_check_notes:** No bias. Monitoring best practice.

---

### QUESTION 50: Fine-Tuning vs. RAG vs. Few-Shot Decision Framework (Medium)

**question_id:** QOR-AIPE-050
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** fine-tuning-vs-rag-vs-few-shot
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 6
**citation:** Stanford Fine-Tuning Guide; Anthropic Few-Shot vs. Fine-Tune (2026)

**body:**

QOrium needs to customize question generation for a specialized customer (a medical school). The system must adapt to:
- Domain terminology (histology vs. pathology distinctions)
- Question format preferences (Qs about rare diseases should mention prevalence rates)
- Curriculum alignment (students are in Year 2, so questions should avoid Year 4 topics)

The team has 500 labeled examples. Should they: **A) Fine-tune Claude**, **B) Use RAG** (vector DB of domain examples), or **C) Prompt engineering** (few-shot in the main prompt)?

**options:**

- A) Fine-tuning is always superior; it adapts the model weights to domain
- B) Fine-tuning (500 examples) is expensive, slow, and doesn't persist across model updates. RAG + few-shot is faster: (1) store 500 examples in a vector DB, (2) retrieve the top 5 most similar examples to the input question, (3) include them in the prompt as few-shot context. Cost: 1-2 extra API calls + ~500 extra tokens per request (< $0.01/call). Fine-tuning: 1-2 hours, $100-500, and breaks when Claude updates
- C) Few-shot alone scales to ~10-20 examples before context bloat
- D) All approaches are equivalent

**answer_key:**

B — Decision framework: (1) **Few-shot** (0-20 examples): cheap, works for simple domain customization. (2) **RAG** (20-5000 examples): retrieval-augmented generation; store examples in vector DB, dynamically fetch relevant ones per request. Sweet spot for domain adaptation without full model retraining. (3) **Fine-tuning** (1000+ examples, if the customer owns the model weights): expensive, slow to train, powerful if you have massive labeled datasets and can afford compute. For QOrium + 500 medical school examples, RAG is ideal: cost ~$0.01 per call, deploy in 1 hour, updates instantly. If examples grow to 50K+, consider fine-tuning. References: Anthropic Few-Shot vs Fine-Tune Trade-offs (2026); Stanford Fine-Tuning Guidelines.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-aipe-v0.6-050-seed-4b1c2d3e
**variant_seed:** qorium-aipe-v0.6-2026-05-03-050
**bias_check_notes:** Medical example is globally relevant; no bias.

---

### QUESTION 51: Tool Chaining with State Management (Code)

**question_id:** QOR-AIPE-051
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** tool-use-function-calling-depth
**format:** Code
**difficulty_b:** 1.1 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 8
**citation:** Langchain Tool Calling; agentic patterns (2026)

**body:**

You are designing a research agent that (1) searches for a topic, (2) fetches full articles from the top results, (3) extracts summaries, and (4) synthesizes a final report. The agent must pass state (e.g., search results) between tools.

Here is a naive implementation (broken):

```python
# Broken: Each tool call is independent; state is lost
def research_agent(topic):
    search_results = search(topic)
    # ❌ Problem: fetch_articles() has no way to know search_results
    articles = fetch_articles()
    summaries = extract_summaries(articles)
    return synthesize_report(summaries)
```

Write a corrected version that demonstrates proper state passing between tools.

**options:**

This is a code-output question. Expected structure: Agent maintains state in context (either as chat history or explicit state dict). Each tool call receives necessary input from prior results.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Agent correctly chains tools with explicit state passing. Example:
```python
def research_agent(topic):
    state = {"topic": topic, "search_results": None, "articles": None, "summaries": None}

    # Step 1: Search
    state["search_results"] = search(state["topic"])

    # Step 2: Fetch articles (uses search_results from state)
    article_urls = [r["url"] for r in state["search_results"]]
    state["articles"] = fetch_articles(urls=article_urls)

    # Step 3: Extract summaries (uses articles from state)
    state["summaries"] = extract_summaries(state["articles"])

    # Step 4: Synthesize (uses summaries from state)
    report = synthesize_report(state["summaries"])
    return report
```

**4 pts (Good):** Uses chat history to pass state (LLM remembers prior tool results) instead of explicit dict; loses some clarity but works.

**3 pts (Acceptable):** Attempts chaining but missing error handling (what if search returns empty results?).

**2 pts (Weak):** Recognizes the problem but solution is incomplete (only 2 of 4 steps correctly chained).

**1 pt (Poor):** Attempts code but fundamentally misunderstands state passing.

**0 pts:** No attempt or completely broken.

**watermark_seed:** qorium-aipe-v0.6-051-seed-7a2f3c1b
**variant_seed:** qorium-aipe-v0.6-2026-05-03-051
**bias_check_notes:** No bias. Technical coding challenge.

---

### QUESTION 52: RAG Quality Evaluation — Retrieval + Generation (Code)

**question_id:** QOR-AIPE-052
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** production-observability-lm-apps
**format:** Code
**difficulty_b:** 1.2 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 10
**citation:** RAGAS framework; RAG evaluation best practices (2026)

**body:**

You are implementing an evaluation pipeline for a RAG system. The system retrieves documents and generates an answer. You must measure:
1. **Retrieval quality:** Did the retriever fetch documents relevant to the question?
2. **Generation quality:** Did the LLM-generated answer match the ground truth?

Write a Python function `evaluate_rag_response(question, retrieved_docs, generated_answer, ground_truth)` that returns:
- `retrieval_score` (0-1): How many retrieved docs are relevant to the question?
- `generation_score` (0-1): How similar is the generated answer to ground truth?
- `ragas_score` (0-1): Combined score accounting for both retrieval and generation.

Pseudo-code guidance:
```python
def evaluate_rag_response(question, retrieved_docs, generated_answer, ground_truth):
    # Step 1: Compute retrieval_score using document relevance
    # (you may use an LLM-as-Judge or a reranker to score relevance)

    # Step 2: Compute generation_score using answer similarity
    # (e.g., BERTScore, semantic similarity, or LLM-as-Judge)

    # Step 3: Combine into ragas_score
    # (e.g., harmonic mean or weighted average)

    return {
        "retrieval_score": retrieval_score,
        "generation_score": generation_score,
        "ragas_score": ragas_score
    }
```

**options:**

This is a code-design question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Full pipeline with 3 components:
- **Retrieval score:** Uses an LLM-as-Judge or reranker to score 1-5 for relevance of each doc; average across all docs.
- **Generation score:** Uses BERTScore or semantic similarity (embeddings cosine) to compare generated_answer vs. ground_truth.
- **RAGAS score:** Harmonic mean of both (F1-style): `2 * (retrieval * generation) / (retrieval + generation)`. This ensures both are high; low retrieval pulls down overall even if generation is perfect.

**4 pts (Good):** Implements retrieval + generation scoring but uses simple average instead of harmonic mean, or uses a less-accurate similarity metric (e.g., BLEU instead of BERTScore).

**3 pts (Acceptable):** Implements retrieval scoring but generation is missing or uses a naive approach (exact string match).

**2 pts (Weak):** Only retrieval OR generation is implemented; missing the combined RAGAS metric.

**1 pt (Poor):** Incomplete or confused structure; doesn't meaningfully evaluate both.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-052-seed-9c1d2a3f
**variant_seed:** qorium-aipe-v0.6-2026-05-03-052
**bias_check_notes:** No bias. RAG evaluation best practice.

---

### QUESTION 53: Agentic Loop with HITL (Human-in-the-Loop) Gates (Code)

**question_id:** QOR-AIPE-053
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** agentic-workflows-production
**format:** Code
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 10
**citation:** Human-in-the-Loop AI; agentic pattern (2026)

**body:**

An agentic question-generation system has a safety concern: some generated questions may be biased or off-topic. You must implement a loop with a **human review gate**:

1. Agent generates a candidate question
2. System evaluates it automatically (passes: topic relevance > 0.8 AND no-bias score > 0.7)
3. **HITL gate:** If uncertain (scores near boundary: 0.75-0.85), escalate to human reviewer
4. If human approves (or auto-passed), finalize; if rejected, loop back to agent with feedback

Write the control flow in pseudocode:

```python
def generate_with_hitl(topic, max_retries=3):
    for attempt in range(max_retries):
        question = agent.generate_question(topic, feedback=None)

        # Evaluate
        relevance, bias_score = auto_evaluate(question)

        if relevance > 0.85 and bias_score > 0.75:
            # ✅ Confident pass
            return question
        elif relevance < 0.75 or bias_score < 0.65:
            # ❌ Confident fail; loop with feedback
            feedback = "Question is off-topic or contains bias. Regenerate."
            continue  # Retry
        else:
            # ⚠️ Uncertain: escalate to human
            human_decision = wait_for_human_review(question, relevance, bias_score)
            if human_decision == "APPROVE":
                return question
            elif human_decision == "REJECT":
                feedback = human_decision.feedback
                continue  # Retry

    return None  # Max retries exceeded
```

Identify issues in the above pseudocode.

**options:**

This is a code-analysis question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Identifies ALL issues:
1. **Blocking HITL:** `wait_for_human_review()` is blocking; while waiting, the system is idle. Better: queue to a task system (Celery, Temporal) and let other requests proceed.
2. **No timeout:** Human might never respond. Add a timeout; auto-escalate if no response within 24h.
3. **Feedback integration:** On rejection, the feedback is passed but not validated — what if feedback is vague? Add feedback clarification before next attempt.
4. **No logging:** For compliance/debugging, log all HITL decisions and outcomes.
5. **Edge case:** If max_retries exceeded, return None is a silent failure. Better: return a "ESCALATE_TO_ADMIN" status so the system doesn't silently drop a request.

**4 pts (Good):** Identifies 3-4 of the above issues.

**3 pts (Acceptable):** Identifies 2 issues (e.g., blocking and timeout).

**2 pts (Weak):** Identifies 1 issue.

**1 pt (Poor):** Identifies an issue but explanation is confused.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-053-seed-5d3c1f2a
**variant_seed:** qorium-aipe-v0.6-2026-05-03-053
**bias_check_notes:** No bias. Agentic workflow pattern.

---

### QUESTION 54: Production Agent Durability — Replay Safety (Code)

**question_id:** QOR-AIPE-054
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** agentic-workflows-production
**format:** Code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.8
**expected_duration_minutes:** 10
**citation:** Temporal.io Durability Patterns; Restate agentic SDK (2026)

**body:**

An agent makes multiple tool calls in sequence:
1. Call Tool A (deterministic: always returns same result for same input)
2. Call Tool B (side-effect: sends an email)
3. Call Tool C (deterministic: generates report)

If the agent crashes after Tool B completes but before Tool C starts, and you restart the agent with the same input, you have a **replay safety issue**: Tool B might be called again, sending a duplicate email.

Design a durability pattern to prevent duplicate side-effects on replay.

**pseudocode:**

```python
def durable_agent(topic):
    request_id = generate_unique_id(topic, timestamp)  # Unique per request

    # Store checkpoint before each tool call
    result_a = call_tool_a(topic)
    checkpoint(request_id, "tool_a_complete", result_a)

    result_b = call_tool_b(result_a)  # Side-effect: sends email
    checkpoint(request_id, "tool_b_complete", result_b)

    result_c = call_tool_c(result_b)
    checkpoint(request_id, "tool_c_complete", result_c)

    return result_c

def restart_agent(topic, request_id):
    # Check saved checkpoint; resume from last saved point
    checkpoint = load_checkpoint(request_id)
    if checkpoint == "tool_a_complete":
        # Tool A already done; jump to Tool B
        result_a = load_result(request_id, "tool_a")
        result_b = call_tool_b(result_a)
        checkpoint(request_id, "tool_b_complete", result_b)
        # ... continue
    elif checkpoint == "tool_b_complete":
        # Tool B already done; jump to Tool C
        result_b = load_result(request_id, "tool_b")
        result_c = call_tool_c(result_b)
        # ... continue
```

What key principle ensures `call_tool_b()` doesn't send duplicate emails on replay?

**options:**

This is a concept question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Identifies the key principle: **Idempotency**. Side-effect tools (email, charge card, write to DB) must be **idempotent**: calling them twice with the same inputs produces the same outcome (one email sent, not two). Implementation: (1) the tool generates a unique `idempotency_key` from the request_id + tool name, (2) the email service stores this key and rejects duplicate calls, or (3) the durable executor stores the fact that "Tool B was called" and skips re-execution on replay.

**4 pts (Good):** Identifies idempotency but explanation is incomplete (mentions it but doesn't explain how to enforce).

**3 pts (Acceptable):** Mentions checkpointing but doesn't clearly articulate the idempotency principle.

**2 pts (Weak):** Partial understanding; misses either checkpointing or idempotency.

**1 pt (Poor):** Vague or incorrect explanation.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-054-seed-8f2a3c1d
**variant_seed:** qorium-aipe-v0.6-2026-05-03-054
**bias_check_notes:** No bias. Durability pattern.

---

### QUESTION 55: Production Observability Architecture for LLM Apps (Design)

**question_id:** QOR-AIPE-055
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** production-observability-lm-apps
**format:** Design
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 12
**citation:** Observability best practices; monitoring at scale (2026)

**body:**

Design a production observability system for a large-scale LLM application (1M API calls/month). The system must detect degradations in quality, cost, latency, and safety in real time. Outline the architecture with:

1. **Data collection:** What metrics/logs should be captured from every LLM call?
2. **Storage:** Where should metrics be stored for fast querying (real-time + historical)?
3. **Alerting:** What thresholds should trigger alerts?
4. **Debugging:** When an alert fires, what diagnostic info is available?

**Example outline:**

```
Data Collection:
  - Every LLM call logs: [timestamp, model, input_tokens, output_tokens, latency, cost, quality_score, user_segment]
  - Optional detailed logging: [prompt_version, context_source, tool_calls, model_temperature]

Storage:
  - Time-series DB (Prometheus, TimescaleDB): metrics aggregated per 1-minute or 1-hour bucket
  - Full call logs (S3 or BigQuery): immutable record for 30+ days, then archived

Alerting:
  - Quality: If rolling-1-hour quality < (7-day-mean - 2*stddev), fire "QUALITY_DEGRADATION"
  - Cost: If cost per call > 2x baseline, fire "COST_SPIKE"
  - Latency: If p99_latency > 3-second threshold, fire "LATENCY_SLA_BREACH"
  - Safety: If bias-score or refusal-rate deviates, fire alert

Debugging:
  - Alert includes: current metric value, baseline, anomaly start time, affected user segments
  - Link to Datadog/Grafana dashboard; link to relevant call logs (S3/BigQuery) for that time window
```

Are there gaps in this architecture?

**options:**

This is a design-critique question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Identifies gaps and proposes solutions:
1. **Missing context correlation:** If quality drops, was it due to prompt change, model update, or input distribution shift? Should log prompt_version, model_version, input_distribution_hash alongside metrics.
2. **Missing canary/staged rollout:** Before deploying a new prompt, run it on 5% of traffic. If quality drops >2%, auto-rollback. Current design has no rollout framework.
3. **Missing cost attribution:** No breakdown of cost by user_segment, feature, or model. Hard to optimize if you don't know which features are expensive.
4. **Missing alerting on silence:** If alerts are supposed to fire but don't (e.g., monitoring agent crashes), you need a "heartbeat" check.
5. **Missing post-incident playbook:** When alert fires, is there a runbook to diagnose and remediate? Should automate common fixes (model_temperature adjustment, prompt revert, rate limit on low-quality outputs).

**4 pts (Good):** Identifies 3-4 gaps.

**3 pts (Acceptable):** Identifies 2 gaps + proposes solutions for both.

**2 pts (Weak):** Identifies 1 gap.

**1 pt (Poor):** Attempts critique but reasoning is unclear.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-055-seed-2c3f1a5d
**variant_seed:** qorium-aipe-v0.6-2026-05-03-055
**bias_check_notes:** No bias. Observability architecture.

---

### QUESTION 56: Fine-Tuning Strategy — When and How (Design)

**question_id:** QOR-AIPE-056
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** fine-tuning-vs-rag-vs-few-shot
**format:** Design
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 12
**citation:** Fine-tuning best practices; data preparation for LLM tuning (2026)

**body:**

QOrium is considering fine-tuning a small LLM (e.g., Llama 3.1 8B or Mistral Large 2) on domain-specific question-generation tasks. They have:
- 10K labeled examples of (topic, question_quality_rubric) → generated_question
- Access to a single GPU (A100 or H100 via cloud rental: $3-5/hour)
- Requirement: deployed model must support multi-turn conversation + tool use

Design a fine-tuning strategy addressing:
1. **Data prep:** How should the 10K examples be structured?
2. **Training pipeline:** What framework (HuggingFace, Ollama, LiteLLM)? What hyperparameters?
3. **Evaluation:** How to ensure fine-tuned model beats baseline (Claude Haiku)?
4. **Deployment:** How to serve the fine-tuned model in production?
5. **Cost-benefit:** When is fine-tuning ROI-positive vs. staying with Claude + RAG?

Expected rubric guidance: Your design should include trade-offs (e.g., fine-tuning is faster inference but requires GPU ops; Claude APIs are slower but zero infra).

**options:**

This is an open-ended design question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Comprehensive design covering all 5 areas with realistic trade-offs:
1. **Data prep:** Examples structured as chat format: `[{"role": "user", "content": "Generate a question on [TOPIC] using [RUBRIC]"}, {"role": "assistant", "content": "..."}]`. Split 80/10/10 (train/val/test).
2. **Training:** HuggingFace TRL (Transformer Reinforcement Learning) with LoRA (Low-Rank Adaptation). LoRA reduces params by 99% (8B model → ~100M trainable params), trains in 2-4 hours on A100. Config: rank=64, learning_rate=1e-4, warmup_steps=500, batch_size=16, epochs=3.
3. **Evaluation:** Benchmark fine-tuned model vs. Claude Haiku on held-out test set (1K examples). Metrics: BLEU (fluency), BERTScore (semantic similarity vs. gold questions), custom bias-score. If fine-tuned model ≥ Claude but inference 10x faster, fine-tuning wins.
4. **Deployment:** Use vLLM or Ollama for inference serving. Deploy on a smaller GPU (RTX 4090 or cloud V100 = $1-2/hour) or CPU if latency allows. Containerize with Docker.
5. **ROI analysis:** Fine-tuning cost: 4 hours × $4/hr = $16 (one-time) + deployment cost ($30-50/month). Claude API: ~$0.01-0.03 per call. At 10K calls/month, Claude = $100-300. Fine-tuning breaks even at ~2K calls/month. Plus: fine-tuned model doesn't depend on Claude updates.

**4 pts (Good):** Covers 4 of 5 areas; data prep, training, and evaluation are solid; deployment or ROI analysis is missing.

**3 pts (Acceptable):** Covers 3 areas (e.g., training + eval + deployment); data prep or ROI is missing.

**2 pts (Weak):** Covers 2 areas but reasoning is shallow.

**1 pt (Poor):** Attempts design but reasoning is confused.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-056-seed-7b2c1a3f
**variant_seed:** qorium-aipe-v0.6-2026-05-03-056
**bias_check_notes:** No bias. Fine-tuning strategy design.

---

### QUESTION 57: Multi-Agent Coordination — Consensus vs. Divergence (Hard)

**question_id:** QOR-AIPE-057
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** agentic-workflows-production
**format:** Design
**difficulty_b:** 1.5 (Hard)
**discrimination_a:** 1.8
**expected_duration_minutes:** 12
**citation:** Multi-agent consensus patterns; Horowitz et al., Agents for Code Generation (2026)

**body:**

You have 3 LLM agents tasked with generating questions on the same topic:
- **Agent A:** Conservative (temperature=0.2), prioritizes correctness
- **Agent B:** Balanced (temperature=0.7), mixing correctness + creativity
- **Agent C:** Creative (temperature=0.9), high diversity

Running all 3 in parallel and picking the best result via LLM-as-Judge costs 3x the LLM calls but may improve quality. However, sometimes Agent A and Agent B generate identical questions (correlated output), reducing diversity.

Design a multi-agent strategy addressing:
1. **Diversity:** How to encourage 3 agents to generate different questions?
2. **Consensus:** How to detect when agents agree (convergence) vs. diverge?
3. **Efficiency:** When should you run 1 agent vs. 3?
4. **Evaluation:** How to decide which agent's output to use?

Constraints: System must keep cost <10% higher than a single-agent baseline.

**options:**

This is a design-justification question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Comprehensive strategy:
1. **Diversity:** Inject a "variation prompt" to each agent: "Agent A: Prioritize correctness, avoid creative liberties." "Agent B: Mix correctness and pedagogy." "Agent C: Prioritize interesting, off-beat angles; acceptable if less correct." Also vary system prompts (Agent A gets a strict rubric; Agent C gets a loose one). For Agent C specifically, include: "Avoid repeating ideas from previous attempts: [list of prior questions]."
2. **Consensus:** Use an embedding-based similarity check. If 3 generated questions have embedding cosine-similarity > 0.85 with each other, agents have converged (agree). If avg pairwise similarity < 0.6, agents diverge.
3. **Efficiency:** If agents converge on the same question, run just 1 agent next time (cut cost by 66%). If diverge, run 3 agents to maximize exploration.
4. **Evaluation:** Use LLM-as-Judge to score all 3 on {correctness, pedagogical value, originality}. Pick the highest-scoring one. If multiple tie, pick the one with the lowest bias-score.
5. **Cost control:** Convergence detection allows dynamic efficiency. Expected cost: if agents converge 40% of the time, avg cost = 0.4×1 + 0.6×3 = 2.2x baseline. Still within 10% buffer if you add caching or compression.

**4 pts (Good):** Covers 4 of 5 areas; missing detailed eval or cost analysis.

**3 pts (Acceptable):** Covers 3 areas (diversity, consensus, efficiency) but eval is shallow.

**2 pts (Weak):** Covers 2 areas; reasoning is incomplete.

**1 pt (Poor):** Attempts design but misses core concepts.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-057-seed-3d4c2f1a
**variant_seed:** qorium-aipe-v0.6-2026-05-03-057
**bias_check_notes:** No bias. Multi-agent coordination strategy.

---

### QUESTION 58: A/B Prompt Rollout Playbook (Hard)

**question_id:** QOR-AIPE-058
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** production-prompt-operations
**format:** Design
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 12
**citation:** A/B testing best practices; MLOps rollout strategies (2026)

**body:**

You are rolling out a new prompt (v2.0) that claims to improve question quality from 82% to 87%. The system generates 10K questions/day. Design a staged rollout playbook:

1. **Canary (Day 1):** Run v2.0 on 1% of traffic (100 questions). Success metric: v2.0 quality ≥ 81% (not worse than v1.0 baseline).
2. **Ramp (Days 2-3):** If canary passes, increase to 10% traffic.
3. **Full (Day 4+):** If 10% passes, roll out to 100%.
4. **Rollback:** If any stage fails, auto-rollback to v1.0 and alert.

Define:
- **Pass/Fail criteria** for each stage
- **Eval methodology** (how to score quality?)
- **Detection latency** (how long to wait before deciding pass/fail?)
- **Alert triggers** (when to escalate to humans?)

**options:**

This is a rollout-design question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Full playbook:
1. **Canary criteria:** Pass if: quality(v2.0, sample_100) >= 81% AND quality(v2.0) not significantly worse than quality(v1.0) by a statistical test (e.g., 2-sample t-test, p < 0.05). If confidence interval of v2.0 quality overlaps with v1.0 (82%), pass. Fail if v2.0 < 75%.
2. **Ramp criteria:** Pass if: quality(v2.0, sample_1000) >= 82.5% (approaching claimed 87%) AND latency(v2.0) <= latency(v1.0) × 1.1 (not much slower).
3. **Full criteria:** Pass if: quality(v2.0, sample_10000) >= 85% (2-3% gap to claimed 87% is acceptable; full deployment may reveal new data).
4. **Eval methodology:** Run LLM-as-Judge on a random sample of generated questions. Judge scores 1-5 on {correctness, clarity, pedagogical value}. Average score across sample.
5. **Detection latency:** Canary: wait 4 hours for quality metrics. Ramp: wait 12 hours. Full: wait 24 hours (one full day of traffic).
6. **Alert triggers:** If canary fails, alert to Slack #ml-ops. If ramp fails, escalate to on-call engineer + block further rollout. If full deployment shows quality drop below 80%, auto-rollback after alert.
7. **Additional safety:** Keep v1.0 running in parallel for 1 week; if v2.0 quality degrades over time, auto-switch back.

**4 pts (Good):** Covers 5-6 of the above; missing detailed eval methodology or alert triggers.

**3 pts (Acceptable):** Covers 4 areas (canary, ramp, eval, rollback); missing detection latency or additional safety measures.

**2 pts (Weak):** Covers 3 areas; reasoning is shallow.

**1 pt (Poor):** Attempts design but misses key criteria.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-058-seed-5c1f2d3a
**variant_seed:** qorium-aipe-v0.6-2026-05-03-058
**bias_check_notes:** No bias. Rollout playbook.

---

### QUESTION 59: Cost-Latency Trade-Off at Scale (Very Hard / Case Study)

**question_id:** QOR-AIPE-059
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** cost-latency-engineering
**format:** Case Study
**difficulty_b:** 1.8 (Very Hard)
**discrimination_a:** 1.9
**expected_duration_minutes:** 15
**citation:** Production optimization at scale; cost-latency Pareto frontier (2026)

**body:**

QOrium's question-generation system is currently using Claude Opus for all 100K calls/month. Monthly LLM cost: $300. Latency: p50=2.5s, p99=5s. Customer SLA: <3s p95 latency.

You discover that:
- 60% of questions are "simple" (prompt: 500 tokens, response: 100 tokens) — Haiku succeeds 95% of the time, cost $0.03/call, latency 0.8s
- 30% are "medium" (prompt: 1K tokens, response: 300 tokens) — Haiku succeeds 70%, Sonnet succeeds 95%, costs $0.15 (Sonnet), latency 1.5s
- 10% are "complex" (prompt: 2K tokens, response: 1K tokens) — Haiku succeeds 30%, Sonnet 85%, Opus 99%, costs $0.60 (Opus), latency 2s

Current cost: 100K × $0.30 = $30K/month (assuming avg Opus call is $0.30).

**Challenge:** Reduce cost to <$10K/month while meeting <3s p95 latency SLA. Propose a routing strategy.

**analysis framework:**

For each tier (simple/medium/complex), calculate:
- Cost per call (model choice)
- Success rate (may need rerun on failure)
- Effective cost = cost_per_call / success_rate
- Latency impact (tool switching, retry overhead)

**options:**

This is a case-study design question. Expected structure: propose a routing strategy, calculate total cost/latency, justify trade-offs.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Comprehensive analysis with optimal routing:
1. **Proposed strategy:**
   - Simple (60%): Route to Haiku. Cost: 60K × $0.03 = $1,800. Success: 95%, so retries add 5% × 60K × $0.03 = $90. Total: $1,890. Latency: 0.8s + 5% × (retry overhead ~0.2s) ≈ 0.81s.
   - Medium (30%): Route to Sonnet. Cost: 30K × $0.15 = $4,500. Success: 95%, retries: 5% × 30K × $0.15 = $225. Total: $4,725. Latency: 1.5s + 5% × 0.3s ≈ 1.515s.
   - Complex (10%): Route to Opus. Cost: 10K × $0.60 = $6,000. Success: 99%, retries: 1% × 10K × $0.60 = $60. Total: $6,060. Latency: 2s + 1% × 0.5s ≈ 2.005s.
2. **Total monthly cost:** $1,890 + $4,725 + $6,060 = $12,675. Still above $10K target; need further optimization.
3. **Optimization:** For medium tier, try Sonnet first (95% success), but if it fails, retry with Opus (adds cost only on 5% of 30K = 1.5K calls). Cost: (30K × $0.15) + (1.5K × $0.60) = $4,500 + $900 = $5,400. Total: $1,890 + $5,400 + $6,060 = $13,350. Still above $10K.
4. **Further optimization:** Aggressive routing — use Haiku for medium (70% success). Cost: 30K × $0.03 + (30% fail rate) × 30K × $0.15 = $900 + $1,350 = $2,250. But success drops to 70%, quality impact. Trade-off: accept 70% pass-rate on medium, retarget quality assurance.
5. **Revised strategy (aggressive):**
   - Simple: Haiku → $1,890
   - Medium: Haiku (with Sonnet fallback on failure) → $900 + (30% × $0.15 × 30K) = $900 + $1,350 = $2,250
   - Complex: Sonnet → 10K × $0.15 = $1,500 (note: complex questions may fit Sonnet; test first)
   - **Total: $1,890 + $2,250 + $1,500 = $5,640/month.** Meets <$10K. Latency: p95 ≈ 1.5s (within SLA).
6. **Validation:** Run A/B test: 10% traffic on new routing for 1 week. Measure quality, cost, latency. If quality is acceptable (>80%), roll out to 100%.

**4 pts (Good):** Proposes routing strategy with cost calculation. Identifies cost-quality trade-off but analysis is not fully detailed.

**3 pts (Acceptable):** Proposes routing; cost calculation is approximate or missing latency analysis.

**2 pts (Weak):** Identifies some cost savings but reasoning is incomplete; missing fallback strategy.

**1 pt (Poor):** Attempts case study but analysis is confusing.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-059-seed-6a2f3c1d
**variant_seed:** qorium-aipe-v0.6-2026-05-03-059
**bias_check_notes:** No bias. Production optimization case study.

---

### QUESTION 60: Production Incident — Observability Failure Analysis (Very Hard / Case Study)

**question_id:** QOR-AIPE-060
**skill_id:** ai-prompt-engineer-senior
**sub_skill_id:** production-observability-lm-apps
**format:** Case Study
**difficulty_b:** 1.9 (Very Hard)
**discrimination_a:** 1.9
**expected_duration_minutes:** 15
**citation:** Incident post-mortems; observability maturity (2026)

**body:**

QOrium's production system generates questions for a large customer (medical school). The system runs stable for 3 months with 85% quality. On Day 91 at 14:00 UTC, quality drops to 68% and stays there. The incident is detected at 14:45 UTC (45-min detection latency) via a manual QA check. By 15:30 UTC, the team has investigated and found:

**Facts:**
1. No code changes were deployed. Prompt v1.0 is still active.
2. No API quota reached; LLM calls are succeeding.
3. Model version in API logs shows: Claude 3.5 Sonnet → Claude 4 (model auto-upgraded by Anthropic at 13:55 UTC).
4. Word embedding similarity: old questions vs. new questions = 0.6 (not semantic similarity; suggests format shifted).
5. Questions generated after 14:00 are shorter (avg 150 tokens) vs. before (avg 200 tokens).

**Questions to answer:**
1. What caused the quality drop?
2. Why was the detection latency 45 minutes?
3. How should the observability system be redesigned to catch this faster?

**options:**

This is a case-study analysis question.

**answer_key (5-point rubric):**

**5 pts (Excellent):** Comprehensive root-cause + system improvement analysis:
1. **Root cause:** Claude 4 (newer, more concise model) changed output behavior. The prompt was tuned for Claude 3.5 Sonnet (verbose, detailed). When the model switched, the prompt's implicit assumptions broke. Specifically: prompt said "Generate a detailed question", but Claude 4 interprets "detailed" differently (more concise). Result: shorter questions that fail the medical school's rubric (which requires 200+ tokens for pedagogical depth).
2. **Detection latency:** Manual QA check runs once per day at 15:00. System should have auto-detected at 13:56 UTC (1 minute after model upgrade) via: token-level monitoring showing avg output_tokens dropped from 200 to 150. Alert threshold: "output_tokens < baseline - 1×stddev for 5 consecutive calls" → trigger alert.
3. **Redesigned observability:**
   - **Auto-detection:** Log model_version on every call. If model_version changes, auto-flag as "model update detected" and begin comparison: quality(old_model) vs. quality(new_model, last_1_hour). If quality drops >10%, fire alert immediately.
   - **Token-level tracking:** Monitor input_tokens, output_tokens, completion_token_ratio. If output_tokens drop >15%, flag. This would catch the drop at 14:01 UTC (1 minute into the incident).
   - **Prompt-version tracking:** Log prompt_version alongside model_version. If model changes but prompt doesn't, alert: "Model update detected with no prompt change; recommend re-tuning prompt."
   - **Post-incident playbook:** Have a runbook: "When quality drops + model version changed: (1) auto-revert to previous model (if available via API), (2) run A/B test of prompt on new model (simple prompt tweaks like 'Generate a 200+ token detailed question'), (3) validate quality restoration."
4. **Expected improvement:** With auto-detection, incident would be caught at 13:56 UTC. With fallback + prompt retuning, system would be back to 85% by 14:30 UTC. Detection latency: 1 minute instead of 45 minutes. Business impact: <1% of day's questions are bad instead of >30%.

**4 pts (Good):** Identifies root cause + 2 of 3 improvements (detection + redesign); post-incident playbook is missing.

**3 pts (Acceptable):** Identifies root cause and suggests observability improvement; missing specific thresholds or playbook.

**2 pts (Weak):** Identifies root cause; observability suggestion is vague.

**1 pt (Poor):** Partially identifies root cause but analysis is incomplete.

**0 pts:** No attempt.

**watermark_seed:** qorium-aipe-v0.6-060-seed-9d2c1a3f
**variant_seed:** qorium-aipe-v0.6-2026-05-03-060
**bias_check_notes:** No bias. Incident analysis case study.

---

## END OF EXTENSION PACK (Q041–Q060)

**SUMMARY:**
- **20 questions (Q041–Q060) authored covering 6 new sub-skill clusters** not in Q021–Q040.
- **Difficulty distribution:** 3 Easy, 7 Medium, 4 Hard Code, 3 Hard Design, 3 Very Hard/Case Study.
- **Sub-skills covered:**
  1. Tool-use / function-calling depth (Q041, Q042, Q043, Q051)
  2. Long-context advanced (Q044, Q045)
  3. Cost-latency engineering (Q046, Q047, Q059)
  4. Production observability (Q048, Q049, Q055, Q060)
  5. Fine-tuning vs RAG vs few-shot (Q050, Q056)
  6. Agentic workflows in production (Q053, Q054, Q057, Q058)
- **All questions follow QOrium metadata schema:** question_id, skill_id, sub_skill_id, format, difficulty_b, discrimination_a, expected_duration, citation, body, answer/rubric, watermark_seed, variant_seed, bias_check_notes.
- **Citations anchor to 2026 LLM landscape:** Anthropic, OpenAI, Google, Llama, Mistral, Qwen documentation and best practices.
- **Quality bar met:** Distractors are plausible; code questions include edge cases; design rubrics are 5-point with explicit must-haves; bias-aware with mixed names (Priya, Arjun, Wei, Sarah, Rajesh, Mateo).
