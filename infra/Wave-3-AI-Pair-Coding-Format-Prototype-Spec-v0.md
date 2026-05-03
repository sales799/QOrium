# Wave 3 — AI Pair-Coding Assessment Format Prototype Spec v0

**Status:** v0 prototype spec — extends Judge0 Sandbox Integration v0 spec to support a NOVEL assessment format (AI pair-coding) per Wave 3 Plan sub-skill 4.
**Authored:** 2026-05-03 (autonomous mode)
**Authority:** CTO Office; pending Senior Engineer #1 hire for engineering review + Wave 3 budget envelope ratification
**Effective:** Phase 2-3 (M6-M9) — first prototype on Talpro Customer Zero in M6; Wave 3 sub-skill 4 first 50 Qs by M9 per Wave 3 Plan

---

## §1 — What is AI Pair-Coding Assessment?

A NOVEL assessment format that tests how a candidate **collaborates with an AI assistant** to solve a coding task. Not "can you code with an AI" (basic). Rather: "do you know when to accept AI suggestions, when to question them, when to override, and how to iterate effectively."

This is QOrium's edge: no incumbent platform tests this. As of 2026, every senior engineering hire involves AI-assisted development. The hiring signal that matters is no longer "can you code" — it's "can you direct an AI to code well."

Wave 3 Plan §3.2 calls for 50 AI Pair-Coding Qs by M9; this spec is the format-design step before authoring begins.

---

## §2 — Format design

### 2.1 Candidate experience (UX flow)

```
[Splash screen with task brief — 30 sec read]
        ↓
[Editor pane (left) + AI assistant pane (right) ]
        ↓
[Task: "Implement X function/component/system"]
        ↓
[Candidate types into editor; AI assistant responds]
        ↓
[Candidate iterates: accept / modify / reject AI suggestions]
        ↓
[Submit button (when candidate signals done OR 30-min timeout)]
        ↓
[Auto-grade + signals captured for SME review]
```

### 2.2 Editor + AI integration

- **Editor:** CodeMirror 6 (open-source, embedded; supports 12 languages from Judge0 + Apex)
- **AI assistant:** Anthropic Claude Sonnet (via Bedrock OR direct Anthropic API; QOrium account; rate-limited per assessment)
- **Communication:** chat-style sidebar; OR inline suggestions (CodeMirror autocomplete extension)
- **Capability:** AI assistant can answer questions, suggest code, debug, explain — anything a real LLM-pair-coder would do

### 2.3 Sandbox execution (when candidate hits "Run")

Reuses Judge0 Sandbox Integration v0 Spec architecture:
- `qorium-judge0-orchestrator` (port 5108) handles the candidate's code
- Resource limits: 512MB / 5sec / read-only rootfs (per Judge0 spec §6 Security)
- Apex sandbox path for Salesforce questions (separate routing)

### 2.4 Grading rubric (the innovation)

Per-assessment, the candidate's session is graded on **6 dimensions**:

| Dim | Weight | What we measure |
|---|---|---|
| **A. Final code quality** | 30% | Does the submitted code work? Idiomatic? Tested? (Standard code-grading) |
| **B. AI suggestion acceptance discipline** | 20% | When candidate accepts suggestions: did they review them? Modified them? Or paste-and-submit? Captured via paste-event vs typed-event ratio + diff between AI suggestion and submitted code |
| **C. AI suggestion rejection discipline** | 15% | When candidate rejects: do their reasons (in chat) demonstrate they understood the suggestion? Or random rejection? |
| **D. Question-asking discipline** | 15% | Did candidate ask the AI clarifying questions when the task was ambiguous? Or just pattern-match suggestion to task? |
| **E. Iteration rhythm** | 10% | How many edit-test cycles? Did the candidate iterate? Or one-shot it? |
| **F. AI self-correction discipline** | 10% | When AI made an error (we inject deliberate errors in seed prompts), did the candidate catch it? Override it? |

Each dimension scored on 1-5 scale by SME Lead post-assessment (with AI-assisted pre-scoring); behavioural anchors per dim documented in rubric.

---

## §3 — Architecture extensions to Judge0 Sandbox v0

### 3.1 New service: `qorium-ai-pair-coding-orchestrator`

PM2 fork; port 5111 (next available after Judge0 5108-5110 range; verify against PORT_REGISTRY at deploy)

Purpose: coordinate the AI pair-coding session (manages WebSocket between editor + AI client + Judge0 sandbox)

### 3.2 New Postgres tables (migration 0008)

```sql
CREATE TABLE content.ai_pair_coding_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES content.questions(id),
  candidate_id text NOT NULL,
  tenant_id uuid NOT NULL,
  started_at timestamp NOT NULL DEFAULT now(),
  submitted_at timestamp,
  status enum('in_progress', 'submitted', 'timeout', 'abandoned'),
  final_code_text text,
  ai_messages_count int DEFAULT 0,
  candidate_typed_chars int DEFAULT 0,
  candidate_pasted_chars int DEFAULT 0,
  edit_test_cycles int DEFAULT 0,
  signals_jsonb jsonb,
  ai_provider enum('anthropic', 'openai', 'gemini') DEFAULT 'anthropic',
  ai_model text DEFAULT 'claude-sonnet-4-6'
);

CREATE TABLE content.ai_pair_coding_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES content.ai_pair_coding_sessions(id) ON DELETE CASCADE,
  occurred_at timestamp NOT NULL DEFAULT now(),
  role enum('candidate', 'ai_assistant'),
  message_text text,
  contained_code boolean DEFAULT false,
  candidate_action_on_message enum('accepted', 'modified', 'rejected', 'ignored', null) DEFAULT null
);

CREATE INDEX ai_pair_coding_sessions_question ON content.ai_pair_coding_sessions (question_id, started_at DESC);
CREATE INDEX ai_pair_coding_messages_session ON content.ai_pair_coding_messages (session_id, occurred_at);
```

### 3.3 Signal capture (the novelty)

The orchestrator captures these signals:

1. **Paste vs Typed ratio** — chars pasted / chars typed; very high = AI-suggestion-paste; very low = ignoring AI
2. **Edit-test cycles** — number of compile/run events
3. **Question-asking** — count of candidate messages to AI; tone analysis (is candidate asking for help vs telling AI what to do?)
4. **Acceptance rate** — % of AI suggestions taken verbatim vs modified vs rejected
5. **Time-to-first-code** — how quickly candidate started coding (high = read carefully; low = jumped in)
6. **AI-injected error detection** — did candidate catch deliberate AI mistakes (we seed every Q with 1-2 known AI failure modes)

Signals → `signals_jsonb` field; SME Lead reviews these alongside the final code.

### 3.4 Anti-cheat considerations

- **External AI prohibited?** Yes. Customer-side enforcement: full-screen mode + clipboard monitoring + secondary-monitor detection. We CAN'T fully prevent it (candidate can use phone) but we can flag suspiciously perfect-paste sessions.
- **Different AI than QOrium-provided?** If candidate uses ChatGPT externally and pastes in, paste-event ratio will spike; flagged as suspicious.
- **AI-generated final code?** AI Plagiarism Benchmark Protocol applies; final submission scored against ≥93% detection threshold.

### 3.5 Cost model

Per AI pair-coding assessment session:
- ~30 min duration
- ~50 candidate messages + ~50 AI responses
- ~500 tokens per exchange = 50,000 tokens per session
- At Claude Sonnet pricing (~$3/MTok input + $15/MTok output), ~$0.50 per session
- Plus Judge0 sandbox: ~$0.05 per session
- **Cost per AI pair-coding assessment: ~$0.55**

Pricing: position as part of Stack-Vault Enterprise tier (no per-session premium); JD-Forge Enterprise tier ($499/JD) includes up to 50 AI pair-coding sessions.

---

## §4 — Question authoring framework

### 4.1 Question types (6 archetypes)

1. **Spec-then-implement** — task brief is detailed; AI helps with implementation; signal is whether candidate questions edge cases
2. **Bug-fix-with-AI** — broken code provided; AI suggests fixes; signal is whether candidate validates suggested fix
3. **Refactor-with-AI** — working code; refactor for X (perf, readability, maintainability); signal is taste + AI-collaboration discipline
4. **Build-from-scratch** — minimal scaffold; candidate + AI build feature; signal is direction-setting + iteration
5. **Adversarial-AI-injects-error** — AI is prompted to occasionally suggest subtly wrong code; signal is whether candidate catches it (the V-1 trade-off-rubric pattern: candidate doesn't have to reject; just reason about it)
6. **Underspecified-task** — ambiguous brief; signal is whether candidate clarifies via AI or just pattern-matches

### 4.2 Question schema (extends standard QOrium schema)

```yaml
question_id: QOR-AIPC-001
skill_id: senior-ai-pair-coding
sub_skill_id: spec-then-implement
format: ai_pair_coding
difficulty_b: 0.5
discrimination_a: 1.5
expected_duration_minutes: 30
language: typescript
ai_provider: anthropic
ai_model: claude-sonnet-4-6
ai_seed_prompt: >
  You are a pair-coding partner for a senior TypeScript engineer.
  The user is implementing X. Help when asked. If asked to build
  something, ask 1-2 clarifying questions before writing code.
  In this session: deliberately introduce a subtle bug in your
  3rd code suggestion (off-by-one in iteration) to test the
  candidate's adversarial review.
ai_seed_signals:
  - injected_error_at_message: 3
  - injected_error_type: off_by_one_iteration
expected_acceptance_rate: 0.4-0.7  # exceptional candidates have measured acceptance
expected_question_count: 2-5  # they should ask the AI clarifying questions
expected_iteration_count: 3-5  # not one-shot; not endless
rubric:
  dim_a_final_code_quality: { 1: ..., 3: ..., 5: ... }
  dim_b_acceptance_discipline: { 1: ..., 3: ..., 5: ... }
  # ...etc for 6 dimensions
watermark_seed: ...
bias_check_notes: ...
```

### 4.3 Authoring discipline

- **SME Lead authors the task** + edge cases + expected approaches
- **CTO Office authors the AI seed prompt** (consistency across questions; injected-error patterns)
- **I/O Psych contractor reviews the rubric** (validity of measuring the 6 dimensions)
- **Calibration:** 30+ candidates of each seniority level (junior/mid/senior) take the question; rubric scores compared with hire/no-hire outcomes

---

## §5 — Phase 2-3 rollout plan

| Phase | Activity | Owner |
|---|---|---|
| M6 W1 | Spec engineering review by Senior Engineer #1 | Senior Eng |
| M6 W2-3 | qorium-ai-pair-coding-orchestrator service deployed on Mac Mini | Senior Eng + CTO |
| M6 W4 | Migration 0008 applied; first AI pair-coding session live (Talpro Customer Zero pilot) | Senior Eng + SME Lead |
| M7 | First 10 AI Pair-Coding questions authored + calibrated | SME Lead + I/O Psych contractor + CTO |
| M7 | Editor + AI client integration (CodeMirror + Anthropic SDK) tested | Frontend Eng (when hired) |
| M8 | Talpro Customer Zero runs first 30 candidates through AI pair-coding format; feedback loop | All offices |
| M9 | First 50 Qs ready (Wave 3 sub-skill 4 milestone per Wave 3 Plan); Phase 3 IdeaForge re-gate | Wave 3 Plan trigger |
| M9-M12 | Scale to 100 Qs across senior + staff levels; integrate with ATS connector framework (Greenhouse first) | All offices |

---

## §6 — Risks (5)

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Candidate uses external AI (phone, second monitor) | M | MEDIUM | Anti-cheat signals + clear policy + post-hoc plagiarism detection |
| Anthropic API outage during assessment | LOW | HIGH | Fallback chain: Claude → GPT → Gemini → graceful degradation (assessment still scorable on signals captured) |
| Cost per session creeps above $1.00 | LOW | MEDIUM | Per-session token budget cap; rate-limit AI responses; cache common AI responses |
| Rubric reliability lower than vendor-licensed | M | MEDIUM | Calibrate with 30+ candidate panel; SME + I/O Psych dual-review |
| Bosch GCC procurement objects to AI-in-assessment for ASIL-D embedded code Qs | LOW | LOW | Make AI pair-coding format opt-in per Stack-Vault tier; default off for safety-critical roles |

---

## §7 — Success criteria (Phase 2-3 acceptance)

- [ ] qorium-ai-pair-coding-orchestrator service ≥99.5% uptime over 30-day window
- [ ] First 50 Qs authored + calibrated (N≥30 per item) by M9
- [ ] Talpro Customer Zero feedback: >70% of candidate-experience surveys report "useful assessment of my real-world skills"
- [ ] Cost per session ≤$0.60 sustained
- [ ] AI-injected-error detection rate distinguishes top-quartile candidates from median (per IRT discrimination >1.5)
- [ ] First Stack-Vault Enterprise customer (Bosch likely) accepts AI Pair-Coding as a category — meaningful procurement signal

---

## §8 — Constitutional integration

- **SO-21 IRT mandatory:** AI Pair-Coding rubric must support IRT calibration (per the 6-dim weighted scoring)
- **SO-22 ≥93% AI plagiarism detection:** applies to final-submission code, not the AI-collaboration aspect
- **SO-23 pricing anchor:** AI Pair-Coding part of Stack-Vault Enterprise / JD-Forge Enterprise tiers; not separately priced
- **SO-24 No-Fiction Rule:** every claim about candidate signals backed by raw audit log
- **Article VII Quality Gate:** new pillar item: "AI Pair-Coding format integrated and signal-quality validated"

---

## §9 — Open questions for Senior Engineer #1 review

1. Mac Mini Docker capacity: does adding qorium-ai-pair-coding-orchestrator + 50 concurrent AI pair-coding sessions blow past current 50-concurrent-Docker-sandbox budget? Need new Mac Mini OR use M2 Pro Mini cluster?
2. CodeMirror 6 extension for inline AI suggestions vs sidebar chat — which is the better default UX? A/B test in M6?
3. Anti-cheat: should we pursue full-screen + clipboard-monitor (intrusive but effective) or rely on signal post-hoc?
4. Calibration N for AI Pair-Coding: ≥30 (standard) or ≥100 (more for novel format)? Reference Panel ramp implications.
5. Adversarial AI-injected-error: how do we ensure the injected error is consistently detected by top-quartile candidates without becoming a guessing game?

---

## §10 — References

- Judge0 Sandbox Integration v0 — `infra/Judge0-Sandbox-Integration-Spec-v0.md`
- Wave 3 Plan M9+ Kickoff — `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`
- AI Plagiarism Benchmark Protocol v1 — `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`
- Constitutional Amendment v2.1 — `governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.md`
- Reference Panel Governance v0 — `customer-zero/Reference-Panel-Governance-v0.md`

---

*End of Wave 3 AI Pair-Coding Format Prototype Spec v0. Senior Engineer #1 review at hire; first prototype live M6; first 50 Qs by M9.*
