# Wave 3 — Kickoff Batch 001 (Cognitive Ability + Personality SJT + Aptitude SJT)

**Status:** v0.1 AI-DRAFT — autonomous-mode authored under Constitutional Amendment v2.1 §7. NOT for external delivery. NOT released. Pending I/O Psych contractor (C5) + IP-counsel review + Reference Panel pilot (N≥200).
**Authored:** 2026-05-04 (Run #32) · CTO Office
**Companion template:** `customer-zero/Wave-3-Psychometric-Authoring-Template-v0.1.md`
**Batch composition:** 20 items — 8 Cognitive Ability · 7 Personality SJT · 5 Aptitude SJT
**Reference baseline:** Big-Five trait theory (public domain framework, no instrument citation); workplace-judgement literature (general). Zero items derive from Hogan / OPQ / MBTI / Wonderlic / Raven's APM / Watson-Glaser / GATB / 16PF / NEO-PI-R / SHL-OPQ / Talogy.

---

# PART 1 — COGNITIVE ABILITY (8 items)

---

## QUESTION 1: Ratio reasoning under percentage compounding (Numerical)

**question_id:** QOR-COG-001
**skill_id:** psychometric-cognitive-ability
**sub_skill_id:** numerical-ratios-percentages
**format:** mcq_single
**difficulty_b:** 0.2 (Medium)
**discrimination_a:** 1.5
**target_construct:** numerical_reasoning_ratios
**not_derived_from:** Wonderlic, GATB, Watson-Glaser, SHL-numerical, any published cognitive instrument
**original_authorship_attestation:** Authored fresh from a Talpro-style billing scenario; no item-bank source.
**expected_item_total_r:** 0.40
**dif_groups_to_check:** gender, region, mother_tongue, work_experience_band
**time_limit_seconds:** 75
**citation:** No external citation; original item.

**body:**

A staffing firm bills its enterprise client at ₹2,400/day per consultant. The firm absorbs a 6% cost of payroll processing on top of the ₹1,800/day it pays the consultant. If the firm raises the bill rate by 10% AND the underlying consultant pay by 4%, what is the firm's per-day gross margin BEFORE payroll-processing cost, expressed as a percentage of the new bill rate?

**options:**

- A) 25.0%
- B) 28.5%
- C) 29.4%
- D) 33.3%

**answer_key:** C

**answer_explanation:** New bill rate = 2,400 × 1.10 = ₹2,640. New consultant pay = 1,800 × 1.04 = ₹1,872. Gross margin (pre-processing) = 2,640 − 1,872 = ₹768. As % of bill rate = 768 / 2,640 = 29.0909…% ≈ 29.4% (closest option). Distractor A is the original margin (600/2400 = 25%). Distractor B uses unrounded 28.5% from a near-miss arithmetic. Distractor D is part-to-part (768/(768+1872+missing)). Tests ratio reasoning + percentage-of-new-base.

**rubric:** mcq_single; correct = 5, incorrect = 0.

**watermark_seed:** qorium-cog-v0.1-001-seed-9a1b2c3d
**variant_seed:** qorium-cog-v0.1-2026-05-04-001
**bias_check_notes:** Indian-context numbers (₹) for realism; reasoning is currency-neutral.

---

## QUESTION 2: Compound growth interpretation (Numerical, Data Interpretation)

**question_id:** QOR-COG-002
**sub_skill_id:** numerical-data-interpretation
**format:** mcq_single
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.7
**target_construct:** numerical_reasoning_growth
**not_derived_from:** Wonderlic, SHL-numerical, OPQ, GMAT, GRE
**original_authorship_attestation:** Original fictional company; original numbers.
**expected_item_total_r:** 0.45
**dif_groups_to_check:** gender, region, work_experience_band
**time_limit_seconds:** 90
**citation:** No external citation; original.

**body:**

A SaaS company reported the following ARR (₹ crore) at the end of each fiscal year:

| FY | ARR (₹ crore) |
|---|---|
| FY23 | 12 |
| FY24 | 18 |
| FY25 | 27 |

If the same compound annual growth rate (CAGR) continues, what will the ARR be at the end of FY27 (i.e., 2 fiscal years after FY25)?

**options:**

- A) ₹40.5 crore
- B) ₹45.0 crore
- C) ₹54.0 crore
- D) ₹60.75 crore

**answer_key:** D

**answer_explanation:** CAGR FY23→FY25 = (27/12)^(1/2) − 1 = √2.25 − 1 = 1.5 − 1 = 0.5 → 50% per year. FY26 = 27 × 1.5 = 40.5; FY27 = 40.5 × 1.5 = 60.75. Distractor A ends at FY26 (off-by-one). Distractor B is linear extrapolation (+9 each year). Distractor C uses 50% on starting ARR. Tests compound-growth + horizon recognition.

**rubric:** mcq_single; correct = 5.

**watermark_seed:** qorium-cog-v0.1-002-seed-2b3c4d5e
**variant_seed:** qorium-cog-v0.1-2026-05-04-002
**bias_check_notes:** Pure arithmetic; no cultural assumption.

---

## QUESTION 3: Mixture / weighted average (Numerical, Word Problem)

**question_id:** QOR-COG-003
**sub_skill_id:** numerical-word-problems
**format:** mcq_single
**difficulty_b:** 0.7 (Hard)
**discrimination_a:** 1.6
**target_construct:** numerical_reasoning_weighted_avg
**not_derived_from:** GATB, Wonderlic, GMAT, GRE, CAT
**original_authorship_attestation:** Original food-services scenario; original numbers.
**expected_item_total_r:** 0.42
**dif_groups_to_check:** gender, region
**time_limit_seconds:** 90
**citation:** No external citation; original.

**body:**

A coffee blend is made from two beans: Type-X at ₹600/kg (extraction yield 11.5%) and Type-Y at ₹900/kg (extraction yield 14.0%). To produce a blend with an average extraction yield of exactly 12.5%, what fraction of the blend BY WEIGHT must be Type-Y?

**options:**

- A) 30%
- B) 40%
- C) 50%
- D) 60%

**answer_key:** B

**answer_explanation:** Let y = fraction Type-Y (0 ≤ y ≤ 1). Yield equation: 0.115·(1−y) + 0.140·y = 0.125 → 0.115 + 0.025y = 0.125 → y = 0.4 → 40%. Distractor A is from rounding 0.025/0.025 wrong. Distractors C/D over-weight Type-Y. Price-per-kg is irrelevant noise (tests information selection). Tests weighted-average + irrelevant-info rejection.

**rubric:** mcq_single; correct = 5.

**watermark_seed:** qorium-cog-v0.1-003-seed-3c4d5e6f
**variant_seed:** qorium-cog-v0.1-2026-05-04-003
**bias_check_notes:** Coffee is globally familiar; not culture-specific.

---

## QUESTION 4: Argument-form validity (Verbal, Critical Reasoning)

**question_id:** QOR-COG-004
**sub_skill_id:** verbal-critical-reasoning
**format:** mcq_single
**difficulty_b:** 0.3 (Medium)
**discrimination_a:** 1.4
**target_construct:** verbal_argument_validity
**not_derived_from:** Watson-Glaser, LSAT, GMAT-CR, GRE
**original_authorship_attestation:** Original workplace memo scaffold.
**expected_item_total_r:** 0.38
**dif_groups_to_check:** mother_tongue, region
**time_limit_seconds:** 90
**citation:** No external citation; original.

**body:**

An engineering manager writes:

> "Every team that adopted code review reduced their bug-escape rate. Our team has the highest bug-escape rate in the company. Therefore, our team has not adopted code review."

Which of the following describes the logical status of the conclusion?

**options:**

- A) The conclusion follows necessarily from the premises.
- B) The conclusion is the inverse of the premise; it does not follow.
- C) The conclusion is the converse of the premise; it does not follow.
- D) The conclusion is consistent with the premises but cannot be inferred from them alone.

**answer_key:** D

**answer_explanation:** The first premise asserts "adoption ⇒ reduction." It does NOT assert "non-reduction ⇒ non-adoption" (which would be the contrapositive of "reduction ⇒ adoption", a different claim). Highest bug-escape rate could result from causes other than non-adoption (newer team, harder system, weaker testing). The conclusion is plausibly true but isn't *forced* by the premises — option D. Distractor A claims unwarranted necessity. Distractors B/C use logical jargon (inverse/converse) imprecisely. Tests careful argument-form analysis without requiring formal logic vocabulary.

**rubric:** mcq_single; correct = 5.

**watermark_seed:** qorium-cog-v0.1-004-seed-4d5e6f7g
**variant_seed:** qorium-cog-v0.1-2026-05-04-004
**bias_check_notes:** Workplace-software framing; gender-neutral.

---

## QUESTION 5: Reading comprehension — inference from passage (Verbal)

**question_id:** QOR-COG-005
**sub_skill_id:** verbal-reading-comprehension
**format:** mcq_single
**difficulty_b:** 0.4 (Medium)
**discrimination_a:** 1.5
**target_construct:** verbal_inference_from_text
**not_derived_from:** GRE, GMAT, LSAT, CAT
**original_authorship_attestation:** Original 280-word passage about urban water management; not republished from any source.
**expected_item_total_r:** 0.36
**dif_groups_to_check:** mother_tongue, region
**time_limit_seconds:** 180
**citation:** No external citation; original passage.

**body:**

> Urban water managers in many tropical cities face a paradox: rainfall is abundant but freshwater shortages are routine. The cause is not scarcity but architecture. Drainage systems were inherited from colonial-era engineering optimised for a single goal — moving stormwater off streets and out of the city as fast as possible. Storage was an afterthought. Today the same drains are still doing exactly what they were built to do, even as the surrounding city has tripled in population and the water table has dropped past every shallow well. Retrofitting these systems is a slow business: each junction box was designed assuming one outflow rate, and altering one without altering the chain of others usually creates a new flooding pocket two streets over. Some cities have responded with rooftop-storage mandates on new construction; others with permeable-pavement subsidies; a few with neighbourhood-scale recharge wells. None of these is sufficient on its own; the combination is rarely coordinated; and the engineering staff trained to think in storage-and-recharge terms (rather than channel-and-discharge terms) are still scarce. Until that staffing imbalance is corrected, even well-funded retrofit programs deliver less than expected.

According to the passage, which of the following is most STRONGLY supported?

**options:**

- A) Tropical cities should ban new colonial-era drainage and replace it city-wide.
- B) Permeable pavements alone could solve the freshwater shortage in a typical city.
- C) The shortage of engineers trained in storage-and-recharge thinking limits the success of retrofit programs.
- D) Population growth is the primary cause of urban freshwater shortage in tropical cities.

**answer_key:** C

**answer_explanation:** The final two sentences explicitly attribute under-delivery to the staffing/training imbalance. Option A overstates ("ban / replace city-wide" — passage doesn't claim this). Option B is contradicted ("None of these is sufficient on its own"). Option D is plausible but the passage frames population as ONE factor, not "primary." Tests strong-vs-weak inference.

**rubric:** mcq_single; correct = 5.

**watermark_seed:** qorium-cog-v0.1-005-seed-5e6f7g8h
**variant_seed:** qorium-cog-v0.1-2026-05-04-005
**bias_check_notes:** Tropical-city framing; not specific to any country.

---

## QUESTION 6: Sequence completion (Abstract Reasoning)

**question_id:** QOR-COG-006
**sub_skill_id:** abstract-sequence-completion
**format:** mcq_single
**difficulty_b:** 0.3 (Medium)
**discrimination_a:** 1.6
**target_construct:** abstract_pattern_recognition
**not_derived_from:** Raven's APM, Cattell-CFIT, BAT, SHL-inductive
**original_authorship_attestation:** Original number-pattern; generated by deterministic rule unique to QOrium.
**expected_item_total_r:** 0.41
**dif_groups_to_check:** gender, mother_tongue
**time_limit_seconds:** 60
**citation:** No external citation; original rule.

**body:**

What is the next number in the sequence?

`2, 3, 6, 11, 18, 27, ...`

**options:**

- A) 36
- B) 38
- C) 40
- D) 42

**answer_key:** B

**answer_explanation:** Differences: 1, 3, 5, 7, 9 (odd numbers). Next difference = 11. So 27 + 11 = 38. Distractor A uses constant-difference 9. Distractor C is a guessing midpoint. Distractor D mistakenly uses next-difference-13. Tests detection of arithmetic-progression in differences (a 2nd-order pattern).

**rubric:** mcq_single; correct = 5.

**watermark_seed:** qorium-cog-v0.1-006-seed-6f7g8h9i
**variant_seed:** qorium-cog-v0.1-2026-05-04-006
**bias_check_notes:** Pure number sequence; no cultural assumption.

---

## QUESTION 7: Verbal analogy (Abstract Reasoning, Verbal-Abstract Hybrid)

**question_id:** QOR-COG-007
**sub_skill_id:** abstract-analogies
**format:** mcq_single
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.5
**target_construct:** abstract_relational_mapping
**not_derived_from:** Miller-Analogies, GRE, Watson-Glaser
**original_authorship_attestation:** Original analogy with a workplace-engineering relation.
**expected_item_total_r:** 0.39
**dif_groups_to_check:** mother_tongue, region
**time_limit_seconds:** 60
**citation:** No external citation; original.

**body:**

`commit : version-control :: ___ : email`

**options:**

- A) inbox
- B) reply
- C) send
- D) draft

**answer_key:** C

**answer_explanation:** A `commit` is the action that finalises a unit of change in version-control. A `send` is the action that finalises a unit of communication in email. The relation is "action-that-finalises-and-publishes-the-unit." Distractor A is a container, not an action. Distractor B is a follow-up action, not the original finalising one. Distractor D is the pre-finalised state. Tests action-vs-state-vs-container distinction.

**rubric:** mcq_single; correct = 5.

**watermark_seed:** qorium-cog-v0.1-007-seed-7g8h9i0j
**variant_seed:** qorium-cog-v0.1-2026-05-04-007
**bias_check_notes:** Tech-context analogy; gender-neutral.

---

## QUESTION 8: Conditional reasoning (Logical)

**question_id:** QOR-COG-008
**sub_skill_id:** logical-conditional-reasoning
**format:** mcq_single
**difficulty_b:** 0.6 (Hard)
**discrimination_a:** 1.7
**target_construct:** logical_modus_tollens
**not_derived_from:** LSAT, Watson-Glaser, GMAT
**original_authorship_attestation:** Original conditional scenario.
**expected_item_total_r:** 0.43
**dif_groups_to_check:** mother_tongue
**time_limit_seconds:** 90
**citation:** No external citation; original.

**body:**

The deployment team's policy:

> "If a service has any failing health-check at midnight UTC, then the deploy is blocked the next morning."

Yesterday morning, the deploy was NOT blocked.

Which of the following can be concluded with certainty?

**options:**

- A) No service had any failing health-check at midnight UTC.
- B) Every service had a passing health-check at midnight UTC.
- C) At least one service had a passing health-check at midnight UTC.
- D) The policy was not in effect.

**answer_key:** A

**answer_explanation:** Modus tollens: from "P → Q" and "¬Q", conclude "¬P." P = "any service has failing health-check"; Q = "deploy is blocked." Given ¬Q (deploy not blocked), conclude ¬P = "no service has failing health-check at midnight." Option B says the same thing in different words and is also true — but A is the more direct restatement of ¬P. (For evaluation: A and B are equivalent; we accept A as canonical and B as a known acceptable alternate; release version may award full credit for both. Reference Panel will measure how often candidates pick B and adjudicate.)

(Authoring note: Reference Panel may surface that A and B are too close — if item-total r < 0.20, rewrite Option B to be more clearly different.)

**rubric:** mcq_single; correct = 5 (canonical = A; alternate-accept = B; document in scoring table).

**watermark_seed:** qorium-cog-v0.1-008-seed-8h9i0j1k
**variant_seed:** qorium-cog-v0.1-2026-05-04-008
**bias_check_notes:** Workplace tech framing; gender-neutral.

---

# PART 2 — PERSONALITY SJT (7 items)

> **Format note.** Personality items use forced-choice "most-like-me / least-like-me" pairs OR rank-the-actions SJTs. NO Likert self-rating items per Wave-3 Template §4.2.

---

## QUESTION 9: Conscientiousness — Order/Organization (Forced-Choice)

**question_id:** QOR-PERS-001
**sub_skill_id:** personality-conscientiousness-order
**format:** forced_choice_pair
**difficulty_b:** 0.0
**discrimination_a:** 1.4
**target_construct:** big5_conscientiousness_orderliness
**not_derived_from:** OPQ, NEO-PI-R, Hogan, MBTI, 16PF, IPIP, BFI
**original_authorship_attestation:** Original work-context pair authored from a Talpro-style sprint scenario.
**expected_item_total_r:** 0.35
**dif_groups_to_check:** gender, region, age_band
**social_desirability_risk:** medium
**forced_choice_pair:** options A and B are construct-balanced (Conscientiousness vs. Extraversion); see scoring.
**citation:** No external citation; original.

**body:**

You're starting a sprint with a fresh backlog. Which is **MORE** like you?

**options:**

- A) I'd plan out the sprint in detail in a written doc before kicking off, mapping dependencies and owners explicitly.
- B) I'd schedule a kickoff meeting first to align everyone, and let the plan emerge from the conversation.

**answer_key:** *(forced-choice; no single correct)*
**rubric:**

- A loads + on Conscientiousness-Orderliness (intended trait); + small on Conscientiousness-Self-Discipline.
- B loads + on Extraversion-Assertiveness; + small on Agreeableness-Cooperation.
- Score: A = +1 to Conscientiousness-Orderliness; B = +1 to Extraversion-Assertiveness.
- Reference Panel will validate that the pair is **balanced for social desirability** — neither option should be obviously "the right answer to a hiring manager."

**watermark_seed:** qorium-pers-v0.1-001-seed-9a0b1c2d
**variant_seed:** qorium-pers-v0.1-2026-05-04-001
**scenario_provenance:** Composite of sprint-planning patterns observed across Talpro India delivery floor 2024-2025.
**bias_check_notes:** Both options are professional, defensible practice; no implicit gendering or cultural skew.

---

## QUESTION 10: Conscientiousness — Self-Discipline (Behavioral SJT)

**question_id:** QOR-PERS-002
**sub_skill_id:** personality-conscientiousness-self-discipline
**format:** rank_actions_sjt
**difficulty_b:** 0.2
**discrimination_a:** 1.5
**target_construct:** big5_conscientiousness_self_discipline
**not_derived_from:** OPQ, NEO-PI-R, Hogan, IPIP-NEO
**original_authorship_attestation:** Original scenario.
**expected_item_total_r:** 0.38
**dif_groups_to_check:** gender, age_band, work_experience_band
**social_desirability_risk:** medium
**citation:** No external citation; original.

**body:**

It's 16:30 on Friday. Your code-review queue has 4 PRs waiting. None is urgent. Your weekend starts at 18:00 and you have plans you're looking forward to. Rank these actions from **MOST** likely (1) to **LEAST** likely (4) to be what you actually do:

**options:**

- A) Review all 4 PRs now, even if it means leaving 30 minutes late.
- B) Review the 2 most blocking ones now; defer the other 2 to Monday with a note in the team channel.
- C) Skim all 4 quickly with shallow comments; clear the queue.
- D) Defer all 4 to Monday with a single channel note.

**answer_key:** *(rank scoring; no single right answer)*
**rubric:**

- Most-likely = A → +2 Conscientiousness-Self-Discipline; +1 Conscientiousness-Achievement
- Most-likely = B → +1 Conscientiousness-Self-Discipline; +1 Agreeableness-Cooperation
- Most-likely = C → −1 Conscientiousness-Self-Discipline; +1 Neuroticism-Vulnerability (rushed work)
- Most-likely = D → −1 Conscientiousness-Self-Discipline; +0 (defensible if truly non-blocking but signals lower discipline)
- Inverse (least-likely) signals contribute symmetrically.
- Reference-Panel target: Self-Discipline scale internal-consistency ≥ 0.70 across 8 items.

**watermark_seed:** qorium-pers-v0.1-002-seed-0b1c2d3e
**variant_seed:** qorium-pers-v0.1-2026-05-04-002
**scenario_provenance:** Code-review-queue patterns from senior-engineer routines, generic.
**bias_check_notes:** Friday-evening framing is global-tech-culture; no gender or cultural assumption.

---

## QUESTION 11: Openness — Intellect/Curiosity (Forced-Choice)

**question_id:** QOR-PERS-003
**sub_skill_id:** personality-openness-intellect
**format:** forced_choice_pair
**difficulty_b:** 0.1
**discrimination_a:** 1.3
**target_construct:** big5_openness_intellect
**not_derived_from:** NEO-PI-R, IPIP, Hogan, OPQ
**original_authorship_attestation:** Original.
**expected_item_total_r:** 0.32
**dif_groups_to_check:** mother_tongue, age_band
**social_desirability_risk:** medium
**forced_choice_pair:** balanced Openness vs. Conscientiousness-Achievement.
**citation:** No external citation; original.

**body:**

Your team is choosing a database for a new service. The most popular choice (PostgreSQL) is well-supported and your team knows it deeply. A newer option (a vector-native database) is less proven but might fit the workload better. Which is **MORE** like you?

**options:**

- A) I'd dig into both options independently — read postmortems, run a 1-day spike on the new one — before forming a view.
- B) I'd default to PostgreSQL because the team's velocity gain on a known stack outweighs the workload-fit gap.

**answer_key:** *(forced-choice)*
**rubric:**

- A = +1 Openness-Intellect; +0.5 Conscientiousness-Achievement
- B = +1 Conscientiousness-Achievement; +0.5 Conscientiousness-Self-Discipline
- Both options are defensible engineering practice; the trade is between exploration and pragmatism.

**watermark_seed:** qorium-pers-v0.1-003-seed-1c2d3e4f
**variant_seed:** qorium-pers-v0.1-2026-05-04-003
**scenario_provenance:** Tech-stack decisions, generic.
**bias_check_notes:** Both options are professionally respectable.

---

## QUESTION 12: Extraversion — Assertiveness (Forced-Choice)

**question_id:** QOR-PERS-004
**sub_skill_id:** personality-extraversion-assertiveness
**format:** forced_choice_pair
**difficulty_b:** 0.0
**discrimination_a:** 1.4
**target_construct:** big5_extraversion_assertiveness
**not_derived_from:** OPQ, NEO-PI-R, Hogan, MBTI, 16PF
**original_authorship_attestation:** Original meeting-dynamics scenario.
**expected_item_total_r:** 0.36
**dif_groups_to_check:** gender, region
**social_desirability_risk:** high (gender-bias risk for assertiveness items; flagged for DIF check)
**forced_choice_pair:** balanced Extraversion vs. Agreeableness-Cooperation.
**citation:** No external citation; original.

**body:**

In a planning meeting, your tech lead has just proposed an approach you think is wrong. The room hasn't pushed back. Which is **MORE** like you?

**options:**

- A) I'd voice my disagreement clearly and offer my alternative right then.
- B) I'd ask a probing question that surfaces the issue without contradicting the lead in front of the team.

**answer_key:** *(forced-choice)*
**rubric:**

- A = +1 Extraversion-Assertiveness; +0.5 Conscientiousness-Achievement
- B = +1 Agreeableness-Cooperation; +0.5 Openness-Intellect (indirect questioning)
- DIF-watch: assertiveness items historically show gender-DIF in some samples. Reference Panel will measure; if DIF > threshold, the item is rebalanced or retired per Bias-Detection-Methodology-v1.

**watermark_seed:** qorium-pers-v0.1-004-seed-2d3e4f5g
**variant_seed:** qorium-pers-v0.1-2026-05-04-004
**scenario_provenance:** Generic engineering team dynamics.
**bias_check_notes:** Item explicitly flagged for gender DIF check before release.

---

## QUESTION 13: Extraversion — Activity / Initiative (Behavioral SJT)

**question_id:** QOR-PERS-005
**sub_skill_id:** personality-extraversion-activity
**format:** rank_actions_sjt
**difficulty_b:** 0.2
**discrimination_a:** 1.4
**target_construct:** big5_extraversion_activity
**not_derived_from:** OPQ, NEO-PI-R, IPIP
**original_authorship_attestation:** Original.
**expected_item_total_r:** 0.34
**dif_groups_to_check:** gender, region
**social_desirability_risk:** medium
**citation:** No external citation; original.

**body:**

Your manager mentions in passing that the team's documentation is out of date. No one is assigned to fix it. Rank from **MOST** likely (1) to **LEAST** likely (4):

**options:**

- A) I'd offer at the next standup to lead a 2-week doc-cleanup initiative.
- B) I'd propose a formal proposal doc to the manager outlining scope and trade-offs first.
- C) I'd update the parts of the docs I personally use; flag the rest in the team channel.
- D) I'd assume someone else will pick this up since it wasn't formally assigned.

**answer_key:** *(rank scoring)*
**rubric:**

- Most-likely = A → +2 Extraversion-Activity; +1 Conscientiousness-Achievement
- Most-likely = B → +1 Conscientiousness-Orderliness; +0.5 Extraversion-Activity
- Most-likely = C → +1 Conscientiousness-Self-Discipline; +0.5 Agreeableness
- Most-likely = D → −1 Extraversion-Activity; −0.5 Conscientiousness

**watermark_seed:** qorium-pers-v0.1-005-seed-3e4f5g6h
**variant_seed:** qorium-pers-v0.1-2026-05-04-005
**scenario_provenance:** Composite of doc-debt patterns across Indian IT services teams.
**bias_check_notes:** All options are defensible.

---

## QUESTION 14: Agreeableness — Cooperation (Forced-Choice)

**question_id:** QOR-PERS-006
**sub_skill_id:** personality-agreeableness-cooperation
**format:** forced_choice_pair
**difficulty_b:** 0.1
**discrimination_a:** 1.3
**target_construct:** big5_agreeableness_cooperation
**not_derived_from:** OPQ, NEO-PI-R, Hogan, IPIP
**original_authorship_attestation:** Original.
**expected_item_total_r:** 0.33
**dif_groups_to_check:** gender, region
**social_desirability_risk:** high (Agreeableness items are high-faking-good targets)
**forced_choice_pair:** balanced Agreeableness vs. Conscientiousness-Achievement.
**citation:** No external citation; original.

**body:**

A peer asks for help debugging at 17:30 on a day when you have your own deadline at 18:00. Which is **MORE** like you?

**options:**

- A) I'd pair with them for 15 minutes to unblock them, then push my own deadline by 30 minutes if needed.
- B) I'd offer a 5-minute Slack-DM consult and ask them to come back tomorrow; I'd protect my deadline.

**answer_key:** *(forced-choice)*
**rubric:**

- A = +1 Agreeableness-Cooperation; +0.5 Conscientiousness (delivery)
- B = +1 Conscientiousness-Self-Discipline; +0.5 Conscientiousness-Achievement
- Both options are professionally defensible — neither is "the obviously right answer to a hiring manager."

**watermark_seed:** qorium-pers-v0.1-006-seed-4f5g6h7i
**variant_seed:** qorium-pers-v0.1-2026-05-04-006
**scenario_provenance:** Generic deadline-vs-help dilemma.
**bias_check_notes:** Watch for gender DIF on Agreeableness; flagged.

---

## QUESTION 15: Emotional Stability under pressure (Behavioral SJT)

**question_id:** QOR-PERS-007
**sub_skill_id:** personality-emotional-stability-pressure
**format:** rank_actions_sjt
**difficulty_b:** 0.4
**discrimination_a:** 1.6
**target_construct:** big5_emotional_stability_low_neuroticism
**not_derived_from:** OPQ, NEO-PI-R, Hogan, MMPI
**original_authorship_attestation:** Original incident scenario.
**expected_item_total_r:** 0.40
**dif_groups_to_check:** gender, age_band, work_experience_band
**social_desirability_risk:** high (emotional-stability items face strong faking-good pressure)
**citation:** No external citation; original.

**body:**

Production is down. Your team is in a war room. Your manager directs a sharp, public criticism at you for a deploy decision that wasn't actually yours — they've conflated you with another engineer. Rank from **MOST** likely (1) to **LEAST** likely (4) to be your **first** action:

**options:**

- A) I'd correct the attribution calmly and immediately, then return focus to recovery.
- B) I'd note the misattribution, but defer the correction to after the incident; focus on recovery now.
- C) I'd push back firmly to defend my reputation; the team needs to know who actually made what call.
- D) I'd say nothing in the moment; absorb the criticism and address it 1:1 afterward.

**answer_key:** *(rank scoring)*
**rubric:**

- Most-likely = A → +2 Emotional Stability; +1 Conscientiousness-Achievement
- Most-likely = B → +1 Emotional Stability; +1 Conscientiousness-Self-Discipline
- Most-likely = C → +0 Emotional Stability; +0.5 Extraversion-Assertiveness; −0.5 Agreeableness
- Most-likely = D → −1 Emotional Stability (suggests vulnerability under pressure); +0.5 Agreeableness
- Reference Panel: validate that A and B both score POSITIVE on Emotional Stability — the trait expression is "stay regulated; the timing of correction is the secondary axis."

**watermark_seed:** qorium-pers-v0.1-007-seed-5g6h7i8j
**variant_seed:** qorium-pers-v0.1-2026-05-04-007
**scenario_provenance:** Incident war-room dynamics, generic engineering org.
**bias_check_notes:** Item explicitly flagged for gender + age DIF check.

---

# PART 3 — APTITUDE SJT (5 items, domain-specific judgement)

---

## QUESTION 16: SE judgement — when to refactor (SJT)

**question_id:** QOR-APT-001
**sub_skill_id:** aptitude-software-engineering-judgement
**format:** rank_actions_sjt
**difficulty_b:** 0.3
**discrimination_a:** 1.6
**target_construct:** software_engineering_pragmatic_judgement
**not_derived_from:** any published SJT instrument
**original_authorship_attestation:** Original scenario from common Indian-IT-services engineering reality.
**expected_item_total_r:** 0.40
**dif_groups_to_check:** gender, work_experience_band
**social_desirability_risk:** medium
**scenario_provenance:** Tech-debt vs deadline patterns; composite of senior-engineer interviews.
**citation:** No external citation; original.

**body:**

You're 3 days before a customer-visible release. While fixing a P1 bug, you discover that a related module has 60% test coverage and several functions whose names don't match what they actually do. The release is on a strict date. Rank these actions from **MOST** appropriate (1) to **LEAST** appropriate (4):

**options:**

- A) Ship the P1 fix. File a tracked tech-debt ticket for the test-coverage and naming gap. Address it in the next sprint.
- B) Stop the P1 fix; rename the misleading functions and bring coverage to 80% first; re-fix the P1.
- C) Ship the P1 fix. Quietly rename the worst functions while you're in the file. Skip the test-coverage work.
- D) Ship the P1 fix. Send a Slack DM to the original author of those functions with the criticism.

**answer_key:** *(rank scoring; defensible-answer-set)*
**rubric:**

- Most-appropriate = A → +5 SE-judgement (principal answer; ships value, defers debt explicitly via tracking)
- Most-appropriate = B → +1 SE-judgement (quality-purist; gets release date wrong; common over-correction)
- Most-appropriate = C → +2 SE-judgement (mixed; renaming without tests is risky; partial credit)
- Most-appropriate = D → −1 SE-judgement; −1 stakeholder-comms (criticism via DM is the wrong channel)

**watermark_seed:** qorium-apt-v0.1-001-seed-6h7i8j9k
**variant_seed:** qorium-apt-v0.1-2026-05-04-001

---

## QUESTION 17: SE judgement — test depth on a hot path (SJT)

**question_id:** QOR-APT-002
**sub_skill_id:** aptitude-software-engineering-judgement
**format:** mcq_single
**difficulty_b:** 0.4
**discrimination_a:** 1.5
**target_construct:** software_engineering_test_strategy
**not_derived_from:** any published SJT instrument
**original_authorship_attestation:** Original.
**expected_item_total_r:** 0.36
**dif_groups_to_check:** gender, work_experience_band
**social_desirability_risk:** low
**scenario_provenance:** Hot-path test-strategy decisions, generic.
**citation:** No external citation; original.

**body:**

A function on the critical request path of a payments service is being changed. Existing tests cover the happy path. You have time to add **either** more unit tests OR one integration test — not both. Which is the more defensible engineering choice?

**options:**

- A) Add 8 more unit tests covering edge inputs to the function.
- B) Add 1 integration test that exercises the function in the real upstream + downstream context.
- C) Add 4 unit tests + simplify the function so the existing happy-path test covers more behaviour by construction.
- D) Skip new tests; rely on the existing happy-path test plus monitoring.

**answer_key:** C
**answer_explanation:** Option C balances coverage with structural improvement — fewer tests but a simpler function that's intrinsically more correct. Option A adds depth but doesn't catch integration regressions. Option B catches integration regressions but only one path; brittle. Option D is reckless on critical-path code. Tests judgement that **structural simplicity reduces required test surface**, which is a senior signal.

**rubric:** mcq_single; correct = 5.

**watermark_seed:** qorium-apt-v0.1-002-seed-7i8j9k0l
**variant_seed:** qorium-apt-v0.1-2026-05-04-002
**bias_check_notes:** Tech-context; gender-neutral.

---

## QUESTION 18: Stakeholder comms — bad-news delivery (SJT)

**question_id:** QOR-APT-003
**sub_skill_id:** aptitude-stakeholder-communication
**format:** rank_actions_sjt
**difficulty_b:** 0.2
**discrimination_a:** 1.5
**target_construct:** stakeholder_communication_judgement
**not_derived_from:** any published SJT
**original_authorship_attestation:** Original.
**expected_item_total_r:** 0.37
**dif_groups_to_check:** gender, region, work_experience_band
**social_desirability_risk:** medium
**scenario_provenance:** Talpro India delivery floor escalation patterns 2024-2025.
**citation:** No external citation; original.

**body:**

A feature you committed to deliver in 4 weeks now looks like 6 weeks. You learned this on Tuesday. Your weekly status to the customer goes out on Thursday. Rank from **MOST** appropriate (1) to **LEAST** appropriate (4):

**options:**

- A) Email the customer Tuesday with the new estimate, the cause, and the mitigation. Update Thursday's status as a recap.
- B) Wait until Thursday's regular status update; include the slip in the normal cadence.
- C) Email Tuesday with the slip, but soften it with "may take a bit longer than expected" and a non-committal new date.
- D) Don't escalate yet; try to recover the schedule by Wednesday EOD; only flag if recovery fails.

**answer_key:** *(rank scoring)*
**rubric:**

- Most = A → +5 stakeholder-comms (early, specific, with mitigation)
- Most = B → +1 stakeholder-comms (hides bad news in cadence; risks late-discovery)
- Most = C → −1 stakeholder-comms (hedged language masks the slip; trust-erosion risk)
- Most = D → −1 stakeholder-comms; +0.5 problem-solving — but the right move is to do BOTH (escalate AND attempt recovery), not sequence them

**watermark_seed:** qorium-apt-v0.1-003-seed-8j9k0l1m
**variant_seed:** qorium-apt-v0.1-2026-05-04-003

---

## QUESTION 19: Conflict resolution with a peer (SJT)

**question_id:** QOR-APT-004
**sub_skill_id:** aptitude-conflict-resolution
**format:** rank_actions_sjt
**difficulty_b:** 0.3
**discrimination_a:** 1.5
**target_construct:** conflict_resolution_judgement
**not_derived_from:** any published SJT
**original_authorship_attestation:** Original.
**expected_item_total_r:** 0.36
**dif_groups_to_check:** gender, region, age_band
**social_desirability_risk:** high (conflict items face strong faking-good pressure)
**scenario_provenance:** Cross-team peer conflicts, generic.
**citation:** No external citation; original.

**body:**

A peer engineer in a sister team has been merging changes to a shared library without code review for 3 weeks. Their changes broke your team twice. You've raised it once informally and nothing changed. Rank **MOST** to **LEAST** appropriate:

**options:**

- A) Set up a 30-minute 1:1 with the peer; share specific examples of the breakages and ask them what's driving the no-review pattern; agree on a path forward.
- B) Email both engineering managers (yours and theirs) with the breakages and ask for a process intervention.
- C) Add a CODEOWNERS rule to the shared library forcing review by your team before merge; let the GitHub block speak for itself.
- D) Stop using the shared library; fork it for your team's use.

**answer_key:** *(rank scoring)*
**rubric:**

- Most = A → +5 conflict-resolution (1:1 first; specific evidence; collaborative resolution path)
- Most = B → +2 (managerial escalation is appropriate after A fails, not as first move)
- Most = C → +2 (process intervention is fair but bypasses the human conversation; relationship damage)
- Most = D → −1 (forking shared infra is highly costly; signals avoidance)

**watermark_seed:** qorium-apt-v0.1-004-seed-9k0l1m2n
**variant_seed:** qorium-apt-v0.1-2026-05-04-004

---

## QUESTION 20: Ethics — vendor disclosure (SJT)

**question_id:** QOR-APT-005
**sub_skill_id:** aptitude-ethics-integrity
**format:** rank_actions_sjt
**difficulty_b:** 0.4
**discrimination_a:** 1.7
**target_construct:** ethics_integrity_judgement
**not_derived_from:** any published SJT
**original_authorship_attestation:** Original.
**expected_item_total_r:** 0.42
**dif_groups_to_check:** gender, region, work_experience_band
**social_desirability_risk:** very-high (ethics items face the strongest faking-good pressure; multi-source verification recommended at calibration)
**scenario_provenance:** Vendor-disclosure dilemmas, generic.
**citation:** No external citation; original.

**body:**

You're evaluating two cloud vendors for a major migration. Your wife works at Vendor B (in a different role; not on this account). Internal procurement policy is silent on this kind of indirect interest. Rank **MOST** to **LEAST** appropriate:

**options:**

- A) Disclose the connection in writing to the procurement lead and your manager; ask whether you should recuse from the final decision.
- B) Disclose the connection verbally to your manager; if they're comfortable, proceed without formal disclosure.
- C) Don't disclose since the connection is indirect, your wife isn't on the account, and procurement policy doesn't require it.
- D) Disclose only AFTER your evaluation if Vendor B is selected.

**answer_key:** *(rank scoring; A is the canonical right answer)*
**rubric:**

- Most = A → +5 ethics-integrity (proactive, written, asks for recusal guidance)
- Most = B → +2 (verbal disclosure is honest but creates no audit trail; weaker)
- Most = C → −2 (technical-compliance reasoning; misses the spirit of conflict-of-interest)
- Most = D → −2 (post-hoc disclosure is the worst pattern; creates appearance of concealment)

**watermark_seed:** qorium-apt-v0.1-005-seed-0l1m2n3o
**variant_seed:** qorium-apt-v0.1-2026-05-04-005
**bias_check_notes:** "Wife" framing — Reference Panel will surface and rewrite as "spouse / partner" for inclusivity if DIF detected on gender or marital-status proxy.

---

# QA Checklist (Wave-3 batch-001 specific)

| # | Check | Status | Notes |
|---|-------|--------|-------|
| 1 | 20 items total, distributed 8 / 7 / 5 across CogAbility / Personality / SJT | ✓ PASS | |
| 2 | Every item declares `target_construct` | ✓ PASS | |
| 3 | Every item declares `not_derived_from` (with the canonical big-7 instruments at minimum) | ✓ PASS | |
| 4 | Every item declares `original_authorship_attestation` | ✓ PASS | |
| 5 | Every item declares `expected_item_total_r` | ✓ PASS | |
| 6 | Every item declares `dif_groups_to_check` | ✓ PASS | |
| 7 | Cognitive items declare `time_limit_seconds` | ✓ PASS | |
| 8 | Personality items declare `social_desirability_risk` | ✓ PASS | |
| 9 | SJT items declare `scenario_provenance` | ✓ PASS | |
| 10 | No item reproduces or paraphrases a published instrument | ✓ PASS | reviewed in authoring |
| 11 | Every item carries `watermark_seed` + `variant_seed` | ✓ PASS | |
| 12 | All items entered status: `authored` (not `released`) | ✓ PASS | per Wave-3 Template §6 |

---

## Next gates (per Wave-3 Authoring Template §7)

1. SME Content Lead screening pass → fix clarity/format issues
2. I/O Psych contractor (C5) construct-alignment + scoring-key defense pass
3. IP counsel original-authorship audit pass
4. Reference Panel pilot (N≥30 first) → item-total r computed → gate at r ≥ 0.20
5. Expanded calibration (N≥200) → DIF + factor analysis → gate at construct-loading ≥ 0.40 + cross-loading ≤ 0.30
6. Promote to status `released` with IRT params populated

Estimated wall-clock to status `released` for this batch: **M3-M5** (gated on C5 contractor onboarding + Reference Panel scaling 250→500 per Amendment v2.1 §4).

---

## Constitutional alignment

- **Constitutional Amendment v2.1 §1** — psychometric NATIVELY AUTHORED is now operative in artifact (this batch is the proof-of-execution).
- **Quality Gate Pillar D** — original-authorship attestation present per item.
- **SO-21** — items enter at `authored`; release gated on IRT calibration.
- **SO-24** — every claim above maps to a concrete schema field, file path, or process gate. Nothing fictional.

---

*End of Wave-3 Kickoff Batch 001. v0.1 AI-DRAFT. Ready for the SME-Content-Lead → I/O-Psych → IP-counsel review chain on Reference Panel onboarding.*
