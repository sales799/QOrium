# Wave 3 Kickoff Batch-001 — 20 Items per Amendment v2.1

**STATUS:** AI-drafted v0.1 SAMPLE. NOT for live calibration; awaits I/O Psychologist contractor sign-off (Constitution SO-21 / C5 SOW). Items here exercise the schema defined in `customer-zero/Wave-3-Authoring-Template-v0.1.md` end-to-end so the Wave-1 ingest script can consume Wave-3 content identically.

**Authored:** 2026-05-06  
**Distribution:** 5 Cognitive Ability (numerical/verbal/abstract) · 5 Personality SJT (Big Five facets) · 4 AI Pair-Coding · 3 AI Tool-Use Judgement · 2 Technical Communication · 1 Design Review = 20 items.  
**Companion plan:** `customer-zero/Wave-3-Plan-M9-Plus-Kickoff.md`

---

## QUESTION 1: Number Series — Quadratic Pattern (Easy)

**question_id:** QOR-W3-COG-001  
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
**citation:** Original-authored. Pattern-inspired by GATB-style numerical aptitude. Not a derivative of any published item.

**body:**

What number completes the series: 3, 8, 15, 24, 35, ?

**options:**

- A) 46
- B) 48
- C) 50
- D) 52

**answer_key:**

B — Differences are 5, 7, 9, 11, 13. 35 + 13 = 48. Pattern: n(n+2) starting at n=1.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-w3-cog-001-seed-1a3b8c5d  
**bias_check_notes:** Series-completion correlates with formal-education exposure. Pair this with a different-format numerical item during calibration to control for response style.

---

## QUESTION 2: Verbal Analogy — Function vs Property (Medium)

**question_id:** QOR-W3-COG-002  
**skill_id:** wave3-cognitive-ability  
**sub_skill_id:** cognitive-verbal  
**format:** mcq  
**difficulty_b:** 0.0 (Medium)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 2  
**psychometric_construct:** verbal  
**bias_dif_target_groups:** ["primary_language", "education_tier"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored.

**body:**

Choose the pair that best matches the relationship: ENGINE : VEHICLE :: ?

**options:**

- A) PEDAL : BICYCLE
- B) HEART : BODY
- C) ROOF : HOUSE
- D) PAGE : BOOK

**answer_key:**

B — ENGINE is the power source for a VEHICLE; HEART is the power source for a BODY. A is a control input, not a power source. C is a structural part. D is a constituent.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-w3-cog-002-seed-7e2f9a4c  
**bias_check_notes:** Item assumes English fluency; primary_language DIF check required.

---

## QUESTION 3: Abstract — Matrix Pattern (Medium)

**question_id:** QOR-W3-COG-003  
**skill_id:** wave3-cognitive-ability  
**sub_skill_id:** cognitive-abstract  
**format:** mcq  
**difficulty_b:** 0.2 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 3  
**psychometric_construct:** abstract  
**bias_dif_target_groups:** ["gender", "age_band"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored. Pattern-inspired by Raven's APM style; not a reproduction.

**body:**

In a 3×3 matrix, row 1 contains shapes with 1 dot, row 2 with 2 dots, row 3 with 3 dots. Column 1 has triangles, column 2 has squares, column 3 has circles. The 9th cell (row 3, col 3) is missing. What goes there?

**options:**

- A) Triangle with 3 dots
- B) Square with 3 dots
- C) Circle with 2 dots
- D) Circle with 3 dots

**answer_key:**

D — Pattern: row controls dot count (3 in row 3), column controls shape (circle in col 3). 3 dots + circle.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-w3-cog-003-seed-3c8d1b6e  
**bias_check_notes:** Visual-matrix items show small DIF on age_band in older norm tables; calibration should stratify.

---

## QUESTION 4: Numerical Reasoning — Percentage Compound (Medium)

**question_id:** QOR-W3-COG-004  
**skill_id:** wave3-cognitive-ability  
**sub_skill_id:** cognitive-numerical  
**format:** mcq  
**difficulty_b:** 0.4 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 3  
**psychometric_construct:** numerical  
**bias_dif_target_groups:** ["gender", "education_tier"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored.

**body:**

A product is sold for ₹1,200 after a 20% discount on the marked price. A trader marked it 50% above its cost. What is the trader's profit percentage?

**options:**

- A) 10%
- B) 20%
- C) 25%
- D) 30%

**answer_key:**

B — Marked price = 1200 / 0.80 = 1500. Cost = 1500 / 1.50 = 1000. Profit = 200, on cost 1000 → 20%.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-w3-cog-004-seed-5b9e2c7a  
**bias_check_notes:** Currency in INR; educationally non-controversial.

---

## QUESTION 5: Verbal Critical Reasoning — Argument Validity (Hard)

**question_id:** QOR-W3-COG-005  
**skill_id:** wave3-cognitive-ability  
**sub_skill_id:** cognitive-verbal  
**format:** mcq  
**difficulty_b:** 0.7 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 3  
**psychometric_construct:** verbal  
**bias_dif_target_groups:** ["primary_language", "education_tier"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored.

**body:**

"Every successful engineer at TechCo has graduated from a Tier-1 institution. Therefore, hiring only from Tier-1 institutions will improve our success rate." Which fact, if true, MOST WEAKENS this argument?

**options:**

- A) TechCo's hiring process already filters heavily for Tier-1 institutions
- B) Some Tier-2 graduates have outperformed Tier-1 hires at competitor firms
- C) Tier-1 institutions have stricter admissions
- D) "Successful" was defined retrospectively by promotion

**answer_key:**

A — The argument commits selection-bias fallacy. If TechCo already filters for Tier-1, the correlation between "successful" and "Tier-1" is forced by the filter, not causal. D is a strong distractor (defines outcome retrospectively); A is more decisive because it identifies the selection mechanism. B is anecdote. C is irrelevant.

**rubric:**

MCQ; correct = 5, incorrect = 0. A vs D is the high-discrimination distinction.

**watermark_seed:** qorium-w3-cog-005-seed-8f4a1d3c  
**bias_check_notes:** Critical-reasoning items show DIF by formal-education exposure; calibration should stratify.

---

## QUESTION 6: Conscientiousness — Deadline Conflict (Medium · SJT)

**question_id:** QOR-W3-SJT-001  
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
**citation:** Original-authored. Big Five anchored; not OPQ/Hogan-derivative.

**body:**

You committed to ship feature X by Friday EOD. Wednesday morning you realise you'll likely miss by 2 days. Which action do you take?

**options:**

- A) Inform stakeholders Wednesday, propose Sunday delivery, keep working
- B) Wait until Friday afternoon to assess
- C) Drop scope unilaterally to hit Friday EOD
- D) Escalate to manager and ask them to renegotiate

**answer_key:**

A — keyed conscientiousness + transparent communication. D is acceptable (keys 2 pts). B is avoidance. C is unilateral scope-cutting.

**rubric:**

SJT; A = +5, D = +2, B = 0, C = −2.

**watermark_seed:** qorium-w3-sjt-001-seed-2e7c9b4a  
**bias_check_notes:** Region-neutral phrasing; "stakeholders" works across India/US/UK.

---

## QUESTION 7: Agreeableness — Code Review Pushback (Medium · SJT)

**question_id:** QOR-W3-SJT-002  
**skill_id:** wave3-personality-sjt  
**sub_skill_id:** personality-agreeableness  
**format:** sjt-mcq  
**difficulty_b:** 0.1 (Medium)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 2  
**psychometric_construct:** agreeableness  
**bias_dif_target_groups:** ["gender", "region"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored.

**body:**

A senior peer leaves a code-review comment that you believe is technically wrong. What do you do?

**options:**

- A) Reply with a clear technical justification + a small reproducible example
- B) Defer to the senior; their experience outweighs your view
- C) Ignore the comment and merge anyway
- D) Escalate to your manager immediately

**answer_key:**

A — keyed agreeableness moderate + conscientiousness high (collaborative pushback with evidence). B is over-deference. C is uncollaborative. D is escalation-without-trying.

**rubric:**

SJT; A = +5, B = +1, D = 0, C = −2.

**watermark_seed:** qorium-w3-sjt-002-seed-6d2a8f1b  
**bias_check_notes:** Region-neutral.

---

## QUESTION 8: Openness — Adopting a New Tool (Easy · SJT)

**question_id:** QOR-W3-SJT-003  
**skill_id:** wave3-personality-sjt  
**sub_skill_id:** personality-openness  
**format:** sjt-mcq  
**difficulty_b:** -0.4 (Easy)  
**discrimination_a:** 1.2  
**expected_duration_minutes:** 2  
**psychometric_construct:** openness  
**bias_dif_target_groups:** ["age_band", "years_experience"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored.

**body:**

Your team is evaluating switching from `make` to a newer build tool. You have no prior experience with the new tool. What's your first action?

**options:**

- A) Spend 2 hours on the new tool's tutorial; build a small representative example
- B) Argue against the change because the team already knows `make`
- C) Defer entirely to whoever advocates for the change
- D) Ask the advocate for a written justification before considering

**answer_key:**

A — keyed openness (active learning before opining). B is closed/conservative. C is passive. D is reasonable but lower openness signal.

**rubric:**

SJT; A = +5, D = +2, C = +1, B = −1.

**watermark_seed:** qorium-w3-sjt-003-seed-9b3e5c7a  
**bias_check_notes:** Age + years_experience DIF — younger/less-experienced may score higher on adopt-new-tool by default; control via stratified calibration.

---

## QUESTION 9: Neuroticism (Reverse) — Production Incident (Hard · SJT)

**question_id:** QOR-W3-SJT-004  
**skill_id:** wave3-personality-sjt  
**sub_skill_id:** personality-neuroticism-reverse  
**format:** sjt-mcq  
**difficulty_b:** 0.5 (Hard)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 2  
**psychometric_construct:** emotional_stability  
**bias_dif_target_groups:** ["gender", "years_experience"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored.

**body:**

It's 2am. A production system you own is down. The pager woke you. You don't yet know root cause. What do you do FIRST?

**options:**

- A) Acknowledge the page; spin up a war-room channel; assess scope before debugging
- B) Start debugging immediately to fix it as fast as possible
- C) Wake your manager
- D) Wait 15 minutes to see if it auto-recovers

**answer_key:**

A — keyed emotional stability + structured response. B is anxiety-driven action without scope. C is escalation-first (acceptable in some orgs, lower stability signal). D is avoidance.

**rubric:**

SJT; A = +5, B = +2, C = +1, D = −1.

**watermark_seed:** qorium-w3-sjt-004-seed-4a8f1d2c  
**bias_check_notes:** Gender DIF possible on stress-response items; calibration must control.

---

## QUESTION 10: Extraversion — All-Hands Presentation (Easy · SJT)

**question_id:** QOR-W3-SJT-005  
**skill_id:** wave3-personality-sjt  
**sub_skill_id:** personality-extraversion  
**format:** sjt-mcq  
**difficulty_b:** -0.5 (Easy)  
**discrimination_a:** 1.2  
**expected_duration_minutes:** 2  
**psychometric_construct:** extraversion  
**bias_dif_target_groups:** ["gender", "region"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 200  
**citation:** Original-authored.

**body:**

You're invited to present your team's quarterly results at an all-hands of 200 people. Public speaking isn't your favourite. What's your move?

**options:**

- A) Accept; prepare slides + dry-run with a peer; deliver
- B) Decline and ask a colleague to present instead
- C) Accept but read straight from notes
- D) Negotiate a written report instead of a live presentation

**answer_key:**

A — keyed positively across extraversion + conscientiousness. B is avoidance. C is partial. D is negotiation; reasonable but not the highest signal here.

**rubric:**

SJT; A = +5, D = +2, C = +1, B = −1.

**watermark_seed:** qorium-w3-sjt-005-seed-7c1e9b3a  
**bias_check_notes:** Public-speaking comfort shows DIF by region (cultural norms); calibration should stratify.

---

## QUESTION 11: AI Pair-Coding — RAG Retrieval Bug (Hard · AI-Assisted)

**question_id:** QOR-W3-AIPC-001  
**skill_id:** wave3-ai-pair-coding  
**sub_skill_id:** ai-pair-coding-debug  
**format:** coding-pair-ai  
**difficulty_b:** 0.6 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 25  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience", "ai_tool_exposure"]  
**ai_assist_allowed:** true  
**pair_role:** 1 of 1  
**calibration_min_n:** 30  
**citation:** Original-authored. Assesses AI-collaboration quality, not raw coding throughput.

**body:**

You have access to Cursor / Claude Code in this assessment. The provided codebase has a RAG retrieval pipeline that intermittently returns empty results for valid queries. Diagnose and fix in 25 minutes. Your screen + AI chat are recorded for review.

**answer_key:**

Reference solution: bug is a vector-store similarity threshold default that's too strict (0.85) for the embedding model used. Acceptable fixes lower the threshold to ~0.7 with rationale, OR switch to MMR retrieval, OR re-embed corpus with a larger model. The grader looks for: (1) the candidate localising the bug to retrieval-not-generation, (2) explicit hypothesis-test cycle with the AI, (3) a justified fix.

**rubric:**

15-pt scale (10 collaboration + 5 correctness):
- AI prompt quality (3): shared enough context; iterated on prompts
- AI output review (4): verified suggestions before accepting; rejected wrong suggestions visibly
- Decision boundaries (3): didn't accept everything blindly
- Correctness (5): fix actually works in test harness

**watermark_seed:** qorium-w3-aipc-001-seed-2d7a4f8c  
**bias_check_notes:** AI-tool exposure DIF likely; calibrate against exposure-stratified sample so the score reflects collaboration quality, not tool familiarity.

---

## QUESTION 12: AI Pair-Coding — Test Generation (Medium · AI-Assisted)

**question_id:** QOR-W3-AIPC-002  
**skill_id:** wave3-ai-pair-coding  
**sub_skill_id:** ai-pair-coding-tests  
**format:** coding-pair-ai  
**difficulty_b:** 0.3 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 20  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience", "ai_tool_exposure"]  
**ai_assist_allowed:** true  
**pair_role:** 1 of 1  
**calibration_min_n:** 30  
**citation:** Original-authored.

**body:**

Given a 200-line `currency-converter.ts` module, use the AI assistant to generate vitest test cases. Goal: ≥85% line coverage in 20 minutes. The grader reviews the test quality (not just coverage).

**answer_key:**

Reference solution: candidate prompts AI for boundary cases (zero, negative, max-int, currency precision rounding), reviews each generated test, edits assertions where the AI's expected value is wrong, runs coverage. Acceptable: 85%+ line coverage, ≥2 boundary cases, ≥1 test the candidate visibly edited from AI output.

**rubric:**

15-pt scale: prompt quality (4) + test quality (6) + coverage achieved (5).

**watermark_seed:** qorium-w3-aipc-002-seed-9c4e1b6a  
**bias_check_notes:** Same as Q11.

---

## QUESTION 13: AI Pair-Coding — Architecture Sketch (Hard · AI-Assisted)

**question_id:** QOR-W3-AIPC-003  
**skill_id:** wave3-ai-pair-coding  
**sub_skill_id:** ai-pair-coding-architecture  
**format:** coding-pair-ai  
**difficulty_b:** 0.8 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 30  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience"]  
**ai_assist_allowed:** true  
**pair_role:** 1 of 1  
**calibration_min_n:** 30  
**citation:** Original-authored.

**body:**

Design (and sketch in code) a job-scheduling service handling 1M jobs/day with priority + retries + dead-letter queue. Use the AI assistant. Submit: (1) a 1-page text design; (2) the core scheduler interface in TypeScript; (3) a justification of one design choice where you DISAGREED with the AI's first suggestion.

**answer_key:**

Reference: any reasonable design — pgmq + worker pool, Redis-streams, AWS SQS+EventBridge — all acceptable. Grader specifically checks the disagreement justification: did the candidate articulate WHY their pick beat the AI's suggestion?

**rubric:**

15-pt: design coherence (5) + code quality (5) + AI-disagreement evidence (5).

**watermark_seed:** qorium-w3-aipc-003-seed-3a7d8f2c  
**bias_check_notes:** Years-of-experience DIF likely on architecture decisions; calibrate via experience-stratified panel.

---

## QUESTION 14: AI Pair-Coding — Refactor Legacy Code (Medium · AI-Assisted)

**question_id:** QOR-W3-AIPC-004  
**skill_id:** wave3-ai-pair-coding  
**sub_skill_id:** ai-pair-coding-refactor  
**format:** coding-pair-ai  
**difficulty_b:** 0.4 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 25  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience"]  
**ai_assist_allowed:** true  
**pair_role:** 1 of 1  
**calibration_min_n:** 30  
**citation:** Original-authored.

**body:**

Given a 400-line legacy class with mixed responsibilities, refactor with AI assistance into 3+ smaller cohesive units. Constraint: existing tests must pass after refactor. Target: 25 minutes.

**answer_key:**

Reference: SRP-based decomposition. Grader looks at: (1) tests still pass, (2) decomposition is meaningful (not arbitrary), (3) the candidate VISIBLY rejected at least one of the AI's split suggestions in favour of their own.

**rubric:**

15-pt: tests pass (5) + decomposition quality (5) + AI-rejection evidence (5).

**watermark_seed:** qorium-w3-aipc-004-seed-1f9c5e3a  
**bias_check_notes:** Same as Q11.

---

## QUESTION 15: AI Tool-Use Judgement — Production Incident Triage (Medium)

**question_id:** QOR-W3-AITUJ-001  
**skill_id:** wave3-ai-tool-use-judgement  
**sub_skill_id:** aituj-production  
**format:** mcq  
**difficulty_b:** 0.2 (Medium)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 3  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience", "ai_tool_exposure"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 30  
**citation:** Original-authored.

**body:**

You're in a P0 production incident. The system is throwing 5xx errors at 8% of requests. Would you use an AI assistant to help diagnose? Choose the BEST stance:

**options:**

- A) Yes — paste error logs into the AI for hypothesis generation while you parallel-investigate
- B) No — incident response should never use AI; too risky
- C) Yes — let the AI drive the entire investigation
- D) Only after the incident is mitigated, for the post-mortem

**answer_key:**

A — keyed sound judgement: AI for hypothesis breadth + speed during triage, but the human stays in the decision-making loop. B is over-conservative. C is irresponsible. D is acceptable but slower.

**rubric:**

MCQ; correct = 5, incorrect = 0. A vs D is the discrimination point.

**watermark_seed:** qorium-w3-aituj-001-seed-5b8a2d7c  
**bias_check_notes:** AI-exposure DIF; control via calibration.

---

## QUESTION 16: AI Tool-Use Judgement — Customer-Facing Email (Medium)

**question_id:** QOR-W3-AITUJ-002  
**skill_id:** wave3-ai-tool-use-judgement  
**sub_skill_id:** aituj-customer-facing  
**format:** mcq  
**difficulty_b:** 0.3 (Medium)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 3  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 30  
**citation:** Original-authored.

**body:**

A customer just sent an angry escalation. You're drafting a response. Would you use an AI assistant?

**options:**

- A) Yes — to draft 3 candidate replies; review each carefully; pick + heavily edit
- B) No — customer-facing words must be 100% human-authored
- C) Yes — paste the customer email + ship the AI's reply with light edits
- D) Yes — but only for the closing pleasantries

**answer_key:**

A — keyed: AI for drafting breadth, human for tone + accountability + final voice. B is overly restrictive. C ships AI tone unchecked. D is too narrow to be useful.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-w3-aituj-002-seed-9d3a7e1f  
**bias_check_notes:** No bias.

---

## QUESTION 17: AI Tool-Use Judgement — Compliance-Sensitive Code (Hard)

**question_id:** QOR-W3-AITUJ-003  
**skill_id:** wave3-ai-tool-use-judgement  
**sub_skill_id:** aituj-compliance  
**format:** mcq  
**difficulty_b:** 0.7 (Hard)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 3  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 30  
**citation:** Original-authored.

**body:**

You're writing a payment-processing function that handles PCI-scope data. Would you use AI for it?

**options:**

- A) Yes — for boilerplate; explicit human review of every line touching card data + a security review before merge
- B) No — PCI-scope code must never see AI
- C) Yes — same as any other code
- D) Yes — but only for tests, not the function itself

**answer_key:**

A — keyed: pragmatic + risk-stratified. PCI doesn't ban AI assistance; it requires human review + audit trail. B is over-restrictive (limits productivity without proportional risk reduction). C ignores risk-tier. D is partial.

**rubric:**

MCQ; correct = 5, incorrect = 0. A vs D is the discrimination point.

**watermark_seed:** qorium-w3-aituj-003-seed-4f8e1c5a  
**bias_check_notes:** Years-of-experience may correlate with risk awareness; calibrate.

---

## QUESTION 18: Technical Communication — One-Page Proposal (Medium · Text-Essay)

**question_id:** QOR-W3-TECHCOMM-001  
**skill_id:** wave3-technical-communication  
**sub_skill_id:** techcomm-proposal  
**format:** text-essay  
**difficulty_b:** 0.3 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 15  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["primary_language", "years_experience"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 50  
**citation:** Original-authored.

**body:**

Write a one-page (≤500 words) technical proposal to your CTO recommending whether your team should migrate from Postgres 14 to Postgres 16 in the next quarter. Address: (1) the case for, (2) the case against, (3) your recommendation + a phased rollout plan, (4) the explicit risk you most worry about.

**answer_key:**

No single right answer. Reference solutions cover: structured argument with both sides, a defensible recommendation, named rollout phases (e.g., dev → staging-with-shadow-traffic → 5% canary → full), explicit naming of the top risk (e.g., extension compatibility, replica-lag during pg_upgrade).

**rubric:**

10-pt rubric:
- Structure (2): clear sections, scannable in 60 seconds
- Argument balance (2): both sides represented honestly
- Recommendation specificity (2): named phases + dates
- Risk identification (2): one risk articulated with mitigation
- Writing quality (2): error-free, professional tone

**watermark_seed:** qorium-w3-techcomm-001-seed-7a3c9b2d  
**bias_check_notes:** Primary_language DIF expected; the rubric weighs structure + argument over native-English fluency.

---

## QUESTION 19: Technical Communication — 45-Second Elevator Pitch (Hard · Video-Essay)

**question_id:** QOR-W3-TECHCOMM-002  
**skill_id:** wave3-technical-communication  
**sub_skill_id:** techcomm-elevator-pitch  
**format:** video-essay  
**difficulty_b:** 0.6 (Hard)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 1  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["primary_language", "region"]  
**ai_assist_allowed:** false  
**pair_role:** 1 of 1  
**calibration_min_n:** 50  
**citation:** Original-authored.

**body:**

Record a 45-second video explaining "what is JWT-based authentication, and when would you NOT use it" to a non-technical colleague. AI grading scores clarity, structure, and accuracy; human reviewer audits AI grading on a 10% sample.

**answer_key:**

Reference: opens with one-sentence definition; uses an analogy; gives 1-2 concrete "when to use"; gives 1-2 concrete "when NOT to use" (e.g., revocation needs, very-short-lived sessions, sensitive PHI in claims). Closes with a takeaway.

**rubric:**

10-pt: clarity (3) + structure (3) + accuracy (3) + within time limit (1).

**watermark_seed:** qorium-w3-techcomm-002-seed-2e5d8a3c  
**bias_check_notes:** Primary_language DIF — AI grader must be calibrated on accent + non-native cadence; the rubric explicitly weights content over delivery polish.

---

## QUESTION 20: Design Review — System Design Critique (Hard · Observer)

**question_id:** QOR-W3-DESIGNREV-001  
**skill_id:** wave3-design-review-participation  
**sub_skill_id:** design-review-critique  
**format:** design-review-essay  
**difficulty_b:** 0.8 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 15  
**psychometric_construct:** n/a  
**bias_dif_target_groups:** ["years_experience"]  
**ai_assist_allowed:** false  
**pair_role:** observer  
**calibration_min_n:** 30  
**citation:** Original-authored.

**body:**

You are reviewing a colleague's system design (provided as a 1-page diagram + 200-word writeup): a URL shortener with ~10K writes/sec and 100K reads/sec, using a single Postgres primary, write-through cache in Redis, no replicas. Write a critique (≤400 words) covering: (1) the strongest design decision they made; (2) the most concerning issue and why; (3) a concrete improvement that addresses (2) without over-engineering; (4) one question you'd ask the author before approving or rejecting.

**answer_key:**

Reference: strongest = write-through cache choice (avoids cache stampede). Most concerning = single Postgres for 10K w/s with no replication (durability + read-scale + DR risk). Improvement = pgbouncer + read replicas + WAL streaming to S3 (or move to a managed multi-AZ setup). Question = what's the SLO on the URL-resolution latency? (drives whether read replicas suffice or we need a CDN tier).

**rubric:**

15-pt: identification of strongest decision (3) + correct + significant concern (4) + proportionate improvement, not over-engineered (4) + question quality (4).

**watermark_seed:** qorium-w3-designrev-001-seed-6c4a9f2e  
**bias_check_notes:** Years-of-experience DIF likely; the rubric weighs "doesn't over-engineer" so very-senior candidates aren't rewarded for unnecessary complexity.

---

## End of Wave 3 Kickoff Batch-001

**Set status:** 20/20 v0.1 sample complete. SME Lead + I/O Psychologist contractor sign-off pending. Distribution: 5 Cognitive · 5 SJT · 4 AIPC · 3 AITUJ · 2 TechComm · 1 DesignRev.

**Bridge note:** This file uses Amendment v2.1 fields (psychometric_construct, bias_dif_target_groups, ai_assist_allowed, pair_role, calibration_min_n) defined in `customer-zero/Wave-3-Authoring-Template-v0.1.md`. The Wave-1 ingest script consumes both files identically — Amendment v2.1 fields are stored in `body_json.amendment_v2_1` per the content-questions schema.
