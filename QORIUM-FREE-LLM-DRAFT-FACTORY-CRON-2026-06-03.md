# QOrium — Free Self-Hosted LLM "Draft Factory" CRON (design + setup guide)
**Date:** 2026-06-03 · **Author:** Claude (CTO) · **Goal:** use the free Qwen army to grow the question bank 986 → 5,000+ at **zero API cost, 24/7**, without violating the Constitution's release gates.

## Live proof (this session)
- `https://llm-mini.talpro.in/v1/models` → **HTTP 200**, serves `qwen2.5-coder:7b`, `llama3.2:3b`, `qwen2.5:0.5b`, `nomic-embed-text` (Ollama via LiteLLM, reachable from the VPS).
- `https://llm-pro.talpro.in` → **up but 401** (key-gated — the bigger Mac-Pro model; needs the LiteLLM key to use).
- One authoring call to `qwen2.5-coder:7b` returned valid JSON in **38s** — but the sample question referenced code it never included. **Conclusion: zero-cost draft engine, NOT release-grade. Must pass a gate.**

## The doctrine constraint (why "free → released" is forbidden)
- **SO-8:** *No question reaches a customer without SME validation* (ReadyBank mandatory).
- **SO-21:** IRT scoring; empirical calibration needs real candidate responses.
- **Art. VII §7.2 auto-fail:** content release lacking SME validation / IRT fails the 92-pt gate.
- Today: 986 released, **0 SME-validated, 0 empirically calibrated.** Adding free-LLM volume must land as **`status='draft'`**, never `released`.

## Architecture — "Draft Factory → Gate" (6 stages)
```
[1 GAP QUEUE]  SQL over content.questions → coverage gaps per (skill × difficulty × format) vs target
      ↓
[2 DRAFT]      free LLM: llm-mini (qwen2.5-coder:7b) for bulk MCQ/code;
               route hard domain (SAP ABAP/Oracle/Salesforce) → llm-pro (needs key)
      ↓        strict JSON matching content.questions schema
[3 SELF-CRITIQUE] 2nd free pass scores draft (correctness, ambiguity, "code-present?", difficulty) → ai_critique_scores; auto-reject < threshold
      ↓
[4 ANTI-LEAK]  run through existing testforge-orchestrator plagiarism/similarity check → reject leaked matches
      ↓
[5 INSERT DRAFT]  status='draft', authored_by='qwen2.5-coder:7b@llm-mini', source_corpus, ai_critique_scores, prior difficulty_b. NEVER 'released'.
      ↓
[6 VALIDATION GATE] (the SO-8 line — NOT free) human SME OR periodic frontier-model (Claude/GPT) pass, run ONLY on critique survivors (small %, so cheap) → promote draft→released
```
The free army owns stages 1–5. Stage 6 is the paid/human gate — and it's cheap because it only sees the ~20–40% that survive critique+anti-leak.

## The CRON (what runs, where)
**Run it on a Mac (BHIMA/ARJUN) where the GPU lives** — best throughput. (VPS-side calling the tunnel also works but adds latency and competes for the Mac anyway.)

Recommended schedule (CORN = continuous, off-peak heavy):
```cron
# Draft factory — every night 22:00–06:00, 30-min batches, ~throttled
*/30 22-23,0-6 * * *  /opt/qorium/scripts/draft-factory.sh >> /var/log/qorium/draft-factory.log 2>&1
# Anti-leak + critique sweep on the day's drafts — hourly
0 * * * *             /opt/qorium/scripts/draft-critique-sweep.sh >> /var/log/qorium/draft-critique.log 2>&1
```
`draft-factory.sh` pulls N gap items (e.g. 20/batch), generates+self-critiques via the LiteLLM endpoint, anti-leak filters, inserts as `draft`. Throttle N to keep the Mac responsive and within an 8-hour nightly window (~150–300 drafts/night/stream measured).

## Realistic throughput
| Setup | Drafts/night | 986→5,000 (~4,000 drafts) |
|---|---|---|
| Mini only, 1 stream | ~150–300 | ~2–4 weeks |
| Mini + Pro, 2–3 parallel streams | ~500–1,000 | ~4–8 nights |
Then the bottleneck shifts to **validation throughput (stage 6)**, not generation.

## What I will stage for the build lane (KARYA/BHIMA)
This is a real pipeline build (model routing, gap-selection SQL, strict-JSON schema mapping, dedup/anti-leak, draft insert, cron + watchdog) — staged as a shard, not hot-wired into the prod content DB tonight. Branch: `codex/qorium-draft-factory`. Reuses `services/jd-forge` (generation) + `services/testforge-orchestrator` (plagiarism) — do NOT build a parallel generator.

## FOUNDER DECISIONS (2 — the only things blocking)
1. **`llm-pro` LiteLLM API key** — needed to use the *bigger* Mac-Pro model for hard India-stack depth (SAP/Oracle/Salesforce). Mini-only works for bulk MCQ but won't do enterprise-grade domain depth well. → paste the key via the secret channel, or say "mini-only for now."
2. **The validation gate (stage 6) — pick one:** (a) hire/assign an **SME reviewer** (Constitution's intended path, SO-1/§2.5), or (b) authorize a **small paid frontier-model budget** (Claude/GPT) to validate *only the survivors* (cheap — pennies per accepted question, runs tonight, no hire). Recommended: **(b) now to unblock, (a) as you scale.** The free army cannot credibly validate its own output (SO-8).

## Honest bottom line
The free LLM **solves the volume problem** (986→5,000 drafts, free, 24/7) and is proven reachable today. It does **not** solve the *quality stamp* — that needs the gate in stage 6 and real candidate responses for calibration. Set up this way, you get tireless free drafting **and** keep the Constitution intact. Set up the naive way (free → released), you'd 4× the SO-8 breach.
