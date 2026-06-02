# Wave 3 — Psychometric Authoring Template v0.1

**Status:** v0.1 template — autonomous-mode authored under Constitutional Amendment v2.1 §7 implicit-ratification provision (CTO Office begins kickoff authoring; founder ratification finalises scope; §7 fallback to Durga Council if no founder reply by M3)
**Authored:** 2026-05-04 (Run #32) · CTO Office
**Effective:** Wave 3 sub-skills 1–3 (Cognitive Ability · Personality SJT · Aptitude SJT)
**Replaces:** none (greenfield)
**Companion content batch:** `customer-zero/Wave-3-Kickoff-Batch-001-CogAbility-Personality-SJT.md` (first 20 Qs)

---

## §1 — Why this template exists

Wave 1 (tech) and Wave 2 (India-stack) authoring use **factual** correctness (a Java memory-model question has a right answer). Wave 3 psychometric items use **construct-validity** correctness (a personality item is "right" only insofar as it discriminates the trait it claims to measure with low cross-loading).

That difference forces a different authoring discipline:

- Every item must declare its **target construct** explicitly (the trait or ability it claims to measure).
- Every item must declare which **published instruments it is NOT derived from** — Hogan / OPQ / MBTI / Wonderlic / Raven's APM / Watson-Glaser / GATB / 16PF / NEO-PI-R / etc. — to make the original-authorship audit explicit per Quality Gate Pillar D.
- Every item must carry **scoring keys** that are testable on the Reference Panel before release; an item that doesn't discriminate (item-total correlation < 0.20) is retired or rewritten.
- Every item must carry **DIF-check tags** so the Bias Detection Methodology v1 pipeline can verify no group differential function on protected characteristics.

This template encodes those obligations as a fillable form so authors can't ship a psychometric item without addressing each.

---

## §2 — Item schema (additions over the v0.6 Wave-1/Wave-2 schema)

| Field | Purpose | Required for |
|---|---|---|
| `target_construct` | Trait/ability the item claims to measure (e.g. `numerical_reasoning_ratios`, `big5_conscientiousness_orderliness`) | All Wave-3 |
| `not_derived_from` | Explicit list of published instruments the author affirmatively did NOT reference (free-text but must include the canonical "big-7" list at minimum) | All Wave-3 |
| `original_authorship_attestation` | One-line attestation: "Authored fresh from a Talpro/Bosch-style scenario; no item-bank source." | All Wave-3 |
| `expected_item_total_r` | Author's hypothesis for item-total correlation (e.g. `0.35`); invalidated if Reference-Panel data falls below 0.20 | All Wave-3 |
| `dif_groups_to_check` | Demographic axes for DIF check (e.g. `gender, region, mother_tongue, age_band, work_experience_band`) | All Wave-3 |
| `social_desirability_risk` | Self/raters: how susceptible is this item to faking-good responding? `low|medium|high` | Personality + SJT |
| `forced_choice_pair` | If using forced-choice pair format, the construct-balanced pair partner | Personality forced-choice items |
| `scenario_provenance` | Where the scenario came from (e.g. "Talpro India delivery floor 2024", "Bosch GCC composite 2026") — never copied from a published case | SJT only |
| `time_limit_seconds` | Hard ceiling for this item; cognitive items run under timed conditions | Cognitive Ability only |

All v0.6 fields (question_id, sub_skill_id, format, body, options, answer_key, rubric, watermark_seed, variant_seed) remain.

---

## §3 — Sub-skill 1: Cognitive Ability

### 3.1 Construct map (covered by 100 Qs at M9)

| Cluster | Construct | M9 share | Notes |
|---|---|---|---|
| Numerical | Ratios, percentages, growth rates | 15 Qs | Distractors share common pitfalls (off-by-row in tables, percentage-of-percentage error) |
| Numerical | Data interpretation (charts/tables) | 15 Qs | Original tables; never lifted from published instrument |
| Numerical | Word problems (rate, work, mixture) | 10 Qs | Original story scaffolds |
| Verbal | Critical reasoning (premise → conclusion validity) | 15 Qs | Modeled on workplace memos; not LSAT-style |
| Verbal | Reading comprehension | 10 Qs | Original passages 250–350 words; cited author = QOrium content team |
| Abstract | Sequence/series completion | 15 Qs | Original visual rules; never reproducing Raven's APM matrices |
| Abstract | Analogies + classification | 10 Qs | Original analogies; cultural neutrality reviewed |
| Logical | Conditional/syllogistic reasoning | 10 Qs | Original syllogisms |

### 3.2 Authoring rules

1. **Time limits ARE the difficulty signal** — cognitive items are scored under a hard ceiling (typically 60–90 sec/item). Author specifies `time_limit_seconds`. Discriminating items run within budget for ~50% of population.
2. **One correct answer.** Distractors must be defensible: each represents a known reasoning error (e.g., subtracting when one should divide; reversing a ratio; mistaking part-to-whole for part-to-part). Document the error each distractor models.
3. **Visual abstract items** must declare a generation algorithm (e.g., "rotate 90° clockwise + add one feature element"); the rule is unique to QOrium, not a known APM/Cattell pattern.
4. **No cultural traps.** Word problems use Indian-context numbers (₹ amounts, KM distances, IST timezone) but the *reasoning* must not require cultural knowledge to solve.
5. **Bilingual readiness from day 1.** All cognitive items authored with translation-friendly syntax (avoid English-specific idioms) and tagged for Hindi + Tamil recalibration in Sprint 2.4.

---

## §4 — Sub-skill 2: Personality SJT (Big-Five-anchored)

### 4.1 Construct map (60 Qs at M9; situational format)

QOrium personality assessment uses **situational items** (not self-report Likert) to reduce social-desirability bias. Big-Five facets are the framework, but items are workplace-scenario-driven.

| Big-Five trait | Facets covered at M9 | M9 share |
|---|---|---|
| Conscientiousness | Order/Organization, Achievement-Striving, Self-Discipline | 15 Qs |
| Openness | Intellect/Curiosity, Aesthetic Sensitivity (work-relevant) | 8 Qs |
| Extraversion | Assertiveness, Activity, Positive Emotion | 12 Qs |
| Agreeableness | Trust, Cooperation, Modesty (work-relevant) | 12 Qs |
| Neuroticism (rev: Emotional Stability) | Anxiety, Self-consciousness, Vulnerability under pressure | 13 Qs |

### 4.2 Format choices

1. **Most-Like-Me / Least-Like-Me forced-choice pairs** — primary format. Each pair has two options balanced for social desirability across two Big-Five facets; the candidate's choice surfaces the trait without giving them an obvious "right" answer.
2. **Behavioral SJT** — secondary format. Workplace scenario; 4 actions to rank from most-likely-to-do to least-likely. Each action loads on a specific facet.
3. **Self-rating Likert items are explicitly banned for QOrium personality measurement** — too vulnerable to faking-good; doesn't survive Bosch GCC scrutiny.

### 4.3 Authoring rules

1. **Original scenarios only.** Every scenario sourced from Talpro India delivery floor or composite Bosch-GCC-style work contexts. Document provenance per item.
2. **Construct-balanced pairs.** Forced-choice partners must measure DIFFERENT facets so candidates can't game by always picking the "professional" answer.
3. **No leading language.** Avoid words that signal what's being measured (don't use "carefully" in a Conscientiousness item; don't use "lead" in an Extraversion item). Keep diction neutral.
4. **Cultural neutrality with Indian-context realism.** Names like "Priya" / "Arjun" / "Rahul" / "Meera" mixed with "Sarah" / "Marcus" / "Yuki" to avoid mono-cultural framing. Never use last names that signal caste/region/religion.
5. **No content drawing on therapy / counselling tropes.** This is a workplace-personality measure; not a clinical instrument.

---

## §5 — Sub-skill 3: Aptitude SJT (domain-specific situational judgement)

### 5.1 Construct map (80 Qs at M9)

| Domain | M9 share |
|---|---|
| Software engineering judgement (when to refactor; ship vs. polish; test depth) | 25 Qs |
| Stakeholder communication judgement (escalation, status, bad-news delivery) | 20 Qs |
| Conflict / disagreement resolution (with peer, with manager, with another team) | 15 Qs |
| Resource & priority judgement (under pressure, ambiguity, partial info) | 10 Qs |
| Ethical & integrity judgement (data privacy, vendor disclosure, conflicts of interest) | 10 Qs |

### 5.2 Format

Same as Personality §4.2 — most-like / least-like pairs and rank-the-actions SJTs. Difference: the "right answer" exists more clearly because organisational norms and software engineering practice define defensible answers.

### 5.3 Authoring rules

1. **Scenarios should feel like the candidate has lived them**, not like generic case studies. Specifics matter (a deployment that failed at 23:00 IST during a Diwali week beats "a deployment failed").
2. **Defensible scoring keys.** Every option carries a 0–5 score from the I/O Psych contractor + senior software engineer panel; consensus required.
3. **No trolley problems or contrived dilemmas.** This is workplace judgement, not philosophical exercise.

---

## §6 — Reference Panel + calibration discipline (Wave-3-specific)

| Discipline | Wave 1/2 | Wave 3 |
|---|---|---|
| N for `released` status | ≥30 | ≥200 (per Amendment v2.1 §4 + Reference Panel Governance v0) |
| Item-total correlation gate | not enforced | r ≥ 0.20 (else retire/rewrite) |
| DIF check | gender + region | gender + region + age band + mother tongue + work-experience band |
| Cronbach's α (within-trait) | n/a | ≥ 0.70 per facet at facet-level reliability check |
| IP review | optional | mandatory per item; IP counsel sign-off pre-release |
| Construct-validity check | n/a | factor-analysis loadings on intended trait ≥ 0.40; cross-loadings ≤ 0.30 |

If any of those gates fails on the Reference Panel data, the item goes back to authoring. The 100-Q M9 target assumes ~30% retire/rewrite churn across Wave-3 sub-skills 1-3 (i.e., authors must produce ~600 candidate items to land 350 released items; per Amendment v2.1 §4 that envelope is what the ₹65L budget is sized for).

---

## §7 — Operational pipeline

```
Author drafts item (template above)
      ↓
SME Content Lead screens for clarity + format
      ↓
I/O Psych contractor reviews construct alignment + defends scoring key
      ↓
IP counsel reviews against published-instrument originality guarantee
      ↓
Item enters Reference Panel pilot batch (N≥30 first)
      ↓
Item-total r computed; if r < 0.20 → retire/rewrite
      ↓
Item enters expanded calibration (N≥200)
      ↓
DIF + factor-analysis checks
      ↓
Item RELEASED to ReadyBank with status='released' + IRT params + bias_check='passed'
      ↓
Stack-Vault Enterprise tier earns access; Recruiter Subscription tier at lower SKU
```

---

## §8 — Companion outputs in this run

This template ships alongside the **first 20 Wave-3 items** in `customer-zero/Wave-3-Kickoff-Batch-001-CogAbility-Personality-SJT.md`:

- 8 Cognitive Ability items (3 Numerical, 2 Verbal, 2 Abstract, 1 Logical)
- 7 Personality SJT items (2 Conscientiousness, 1 Openness, 2 Extraversion, 1 Agreeableness, 1 Emotional Stability)
- 5 Aptitude SJT items (2 SE-judgement, 1 Stakeholder comms, 1 Conflict, 1 Ethics)

Status of the batch: **v0.1-AI-DRAFT** (autonomous mode authoring; pending I/O Psych contractor + IP counsel review). NOT for external delivery. Will land in Reference Panel pilot once C5 contractor onboards (post-CC-02 IP-counsel + Pre-Seed funding close).

---

## §9 — Constitutional alignment

- **Amendment v2.1 §1** — psychometric NATIVELY AUTHORED becomes operative the moment first batch ships (this run).
- **Amendment v2.1 §4 #3** — Quality Gate Pillar D adds the original-authorship check; first batch declares `not_derived_from` per item.
- **Amendment v2.1 §5** — IP risk mitigated by per-item attestation + counsel review; capital risk acknowledged but not gating (autonomous-mode authoring uses CTO Office time, not budget).
- **SO-21** — IRT calibration mandatory; Wave 3 items enter at status `authored`; no premature `released` flag.
- **SO-22** — AI plagiarism benchmark applies; Wave-3 items will be sent through the same pipeline once content engine is operational.
- **SO-24** — every claim above maps to a specific schema field, file path, or process gate; nothing fictional.

---

*End of Wave-3 Authoring Template v0.1. Author batches conform to this; deviations require Amendment v2.x of this template.*
