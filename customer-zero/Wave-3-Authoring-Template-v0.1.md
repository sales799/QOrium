# Wave 3 Authoring Template v0.1 (Amendment v2.1)

**STATUS:** AI-drafted v0.1 baseline. Refined by I/O Psychologist contractor when in seat (Constitution SO-21 / C5 SOW). NOT a directly-authored question bank; this document defines the schema + worked stubs that SMEs use to draft Wave 3 questions.

**Authored:** 2026-05-06  
**Companion plan:** `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`  
**Companion kickoff batch:** `customer-zero/Wave-3-Kickoff-Batch-001.md`  
**Ingest contract:** the same parser ingests Wave-3 content as Wave-1/Wave-2 (`services/readybank/src/scripts/ingest-wave1.ts`); Amendment v2.1 fields are stored in `body_json.amendment_v2_1` per content-questions schema.

---

## §1 — Why a separate template

Wave 3 (per `Wave-3-Plan-M9-Plus-Kickoff.md` §2) introduces 8 sub-skills with assessment formats not covered by Wave 1/2 (psychometric, AI-era pair-coding, group/pair simulations). The standard Wave-1 schema (`question_id`, `format`, `body`, `options`, `answer_key`, `rubric`) is necessary but insufficient for these formats — they need additional metadata so calibration, bias DIF analysis, and AI-assist orchestration can run correctly. **Amendment v2.1** adds five new fields, all optional for Wave-1/2 backward compatibility.

## §2 — Amendment v2.1 fields

| Field                       | Type     | Default   | Purpose                                                                                                |
| --------------------------- | -------- | --------- | ------------------------------------------------------------------------------------------------------ |
| `psychometric_construct`    | string   | none      | Big Five facet, cognitive-ability dimension, or "n/a" for tech items. Drives DIF analysis grouping.   |
| `bias_dif_target_groups`    | string[] | `[]`      | Demographic groups (e.g., gender, age-band, region) we explicitly DIF-test for differential function. |
| `ai_assist_allowed`         | boolean  | `false`   | Whether the candidate has access to an LLM during the item.                                            |
| `pair_role`                 | string   | "1 of 1"  | "1 of 1" (solo), "1 of 2" / "2 of 2" (pair), "observer" (silent assessment of someone else).          |
| `calibration_min_n`         | int      | 30        | Min responses before item graduates from `calibrating` to `released`. 200 for psychometric.            |

## §3 — Per sub-skill schema + worked stubs

The 8 Wave 3 sub-skills (per Plan §2). For each, the template lists required + recommended fields and gives a single worked QUESTION stub that the ingest script parses identically to Wave-1.

### 3.1 Cognitive Ability (numerical, verbal, abstract reasoning)

**Required fields beyond Wave-1 baseline:**

- `psychometric_construct`: one of `numerical`, `verbal`, `abstract`
- `bias_dif_target_groups`: at minimum `["gender", "education_tier"]`
- `calibration_min_n`: 200 (psychometric standard)

**Worked stub:**

```
## QUESTION 1: Numerical Series Completion (Easy)

**question_id:** QOR-W3-COG-TEMPLATE-001
**skill_id:** wave3-cognitive-ability
**sub_skill_id:** cognitive-numerical
**format:** mcq
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 2
**psychometric_construct:** numerical
**bias_dif_target_groups:** ["gender", "education_tier"]
**ai_assist_allowed:** false
**pair_role:** 1 of 1
**calibration_min_n:** 200
**citation:** Original-authored. Pattern-inspired by GATB §Numerical Aptitude. NOT reproducing any published item.

**body:**
What number completes the series? 2, 6, 12, 20, 30, ?

**options:**
- A) 36
- B) 40
- C) 42
- D) 44

**answer_key:**
C — Differences are 4, 6, 8, 10, 12; 30+12=42. The pattern is n(n+1).

**rubric:**
MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-w3-cog-template-001
**bias_check_notes:** Series puzzles correlate with formal-education exposure (DIF risk). Author non-puzzle alternates that test the same construct.
```

### 3.2 Personality (Big Five SJT)

**Required:**

- `psychometric_construct`: one of `openness`, `conscientiousness`, `extraversion`, `agreeableness`, `neuroticism` (or facet within)
- `format`: `sjt-mcq` (multiple-choice scenario) or `sjt-likert`
- `calibration_min_n`: 200

**Worked stub:**

```
## QUESTION 1: Conscientiousness — Deadline Conflict (Medium)

**question_id:** QOR-W3-SJT-TEMPLATE-001
**skill_id:** wave3-personality-sjt
**sub_skill_id:** personality-conscientiousness
**format:** sjt-mcq
**difficulty_b:** 0.0 (Medium)
**discrimination_a:** 1.3
**expected_duration_minutes:** 2
**psychometric_construct:** conscientiousness
**bias_dif_target_groups:** ["gender", "region"]
**ai_assist_allowed:** false
**pair_role:** 1 of 1
**calibration_min_n:** 200
**citation:** Original-authored. Big Five anchored. NOT a derivative of OPQ or Hogan.

**body:**
You committed to ship feature X by Friday EOD. On Wednesday you realise you'll likely miss the deadline by 2 days due to an unexpected dependency. Which action do you take?

**options:**
- A) Inform stakeholders Wednesday, propose a Sunday delivery, and keep working
- B) Wait until Friday afternoon to assess; surprise stakeholders only if you can't recover
- C) Drop scope unilaterally to hit Friday EOD
- D) Escalate to your manager and ask them to renegotiate

**answer_key:**
A — keyed to high conscientiousness + transparent communication. B is procrastination/avoidance. C is unilateral scope-cutting (low agreeableness + unsanctioned). D outsources accountability.

**rubric:**
SJT; A=+5 (conscientious), D=+2 (acceptable), B=0, C=−2 (unsanctioned scope reduction). Net score is the construct estimate.

**watermark_seed:** qorium-w3-sjt-template-001
**bias_check_notes:** Phrase scenario region-neutral; "stakeholders" works in India + US + UK. Avoid culture-specific business etiquette cues.
```

### 3.3 Situational Judgement (domain-specific)

**Required:**

- `format`: `sjt-mcq`
- `psychometric_construct`: `n/a` (situational, not a Big Five facet)
- Domain-tagged via `sub_skill_id` (e.g., `sjt-engineering-leadership`, `sjt-recruiting-ops`)
- `calibration_min_n`: 100 (between psychometric and tech because domain-specific is narrower N)

**Worked stub:** (omitted — same structure as 3.2 with domain scenarios)

### 3.4 AI Pair-Coding

**Required:**

- `ai_assist_allowed`: `true`
- `format`: `coding-pair-ai` (new format; ingest script accepts arbitrary format strings)
- `pair_role`: `1 of 1` (the candidate works with an LLM, not another human)
- `expected_duration_minutes`: 25–30
- `calibration_min_n`: 30 (tech-skill bar)

**Worked stub:**

```
## QUESTION 1: Pair-Code with AI — RAG Retrieval Bug (Hard)

**question_id:** QOR-W3-AIPC-TEMPLATE-001
**skill_id:** wave3-ai-pair-coding
**sub_skill_id:** ai-pair-coding-debug
**format:** coding-pair-ai
**difficulty_b:** 0.6 (Hard)
**discrimination_a:** 1.5
**expected_duration_minutes:** 25
**psychometric_construct:** n/a
**bias_dif_target_groups:** ["years_experience"]
**ai_assist_allowed:** true
**pair_role:** 1 of 1
**calibration_min_n:** 30
**citation:** Original; assesses AI-collaboration-quality, not raw coding throughput.

**body:**
You have access to Cursor / Claude Code in this assessment. The provided codebase has a RAG retrieval pipeline that intermittently returns empty results for valid queries. Diagnose and fix in 25 minutes. Your screen + chat with the AI are recorded.

**answer_key:**
Reference solution: bug is a vector-store similarity threshold default that's too strict (0.85) for the embedding model used. Acceptable fixes lower threshold to 0.7 with rationale.

**rubric:**
Scoring is on AI-collaboration-quality (10 pts) + correctness (5 pts):
- AI prompt quality (3): did the candidate share enough context? Did they iterate?
- AI output review (4): did the candidate verify suggestions before accepting?
- Decision boundaries (3): did the candidate accept good suggestions / reject bad?
- Correctness (5): does the fix work?

**watermark_seed:** qorium-w3-aipc-template-001
**bias_check_notes:** AI pair-coding correlates with prior-AI-tool exposure → DIF risk by years_experience. Calibrate against experience-stratified sample.
```

### 3.5 AI Tool-Use Judgement

**Required:**

- `ai_assist_allowed`: `false` (the question IS about when to use AI; the candidate isn't using AI here)
- `format`: typically `mcq` or `case-study`
- `psychometric_construct`: `n/a`

**Worked stub:** (similar shape; scenario describes a task and asks "would you use AI for this? why/why not?")

### 3.6 Technical Communication

**Required:**

- `format`: `text-essay` or `video-essay`
- For video: `expected_duration_minutes`: 1 (45-second elevator pitch standard)
- `bias_dif_target_groups`: at minimum `["primary_language", "region"]`
- `calibration_min_n`: 50

### 3.7 Group / Pair-Programming

**Required:**

- `pair_role`: `1 of 2` or `2 of 2` (multi-candidate)
- `format`: `coding-pair-human`
- `expected_duration_minutes`: 30–45
- `calibration_min_n`: 50 (paired sessions are slower to accumulate)

### 3.8 Design Review Participation

**Required:**

- `pair_role`: `observer` (the candidate critiques someone else's design)
- `format`: `design-review-essay`
- `expected_duration_minutes`: 15
- `calibration_min_n`: 30

---

## §4 — Authoring rules (carry-forward from Wave 1/2 §2 of `SME-Lead-Onboarding-Day-1.md`)

1. **No reproduction of published psychometric items.** Use Wonderlic / GATB / Raven / OPQ / Hogan only as construct *inspiration*, never reproduction or paraphrase. IP-counsel review required for any psychometric item before live calibration (Constitution Article VII Pillar D).
2. **DIF-test every item before release.** Bias DIF check on `bias_dif_target_groups` runs at N≥30 for tech / N≥200 for psychometric.
3. **Anti-leak compliance.** Citation must point to original-authored source unless explicitly inheriting from public spec (e.g., AWS docs for AI-tool-use scenarios). Anti-Leak Engine v0 verifies no public-leak match before release.
4. **Format consistency.** Even when introducing new formats (`coding-pair-ai`, `design-review-essay`), every item carries the standard fields the ingest script expects (`question_id`, `format`, `body`, `answer_key`, `rubric`, `watermark_seed`). New format strings are accepted by the ingest as opaque tokens.
5. **AI-draft → SME-validate → I/O-Psych-validate (psychometric only) → calibrate → release.** No item ships to live candidates without this 4-stage gate.

## §5 — Open questions for I/O Psychologist contractor

When the I/O Psych contractor is in seat (per C5 SOW):

1. Confirm Big Five facet mapping for SJT items (the v0.1 stubs use top-level traits; finer facet granularity is preferable).
2. Confirm `calibration_min_n` thresholds (200 is OWASP-standard for psychometric; some constructs need higher).
3. Confirm DIF-test methodology (Mantel-Haenszel? Logistic regression? Both?).
4. Confirm what `psychometric_construct` enumeration we standardise on (Big Five vs HEXACO vs custom QOrium taxonomy).

---

**Set status:** v0.1 template baseline. SME Lead + I/O Psychologist contractor sign-off pending. Companion 20-question kickoff batch lives at `customer-zero/Wave-3-Kickoff-Batch-001.md`.
