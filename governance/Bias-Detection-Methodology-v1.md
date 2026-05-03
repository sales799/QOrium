# Bias Detection Methodology v1

**For:** QOrium Gatekeeper, CDO Office  
**Authority:** Constitution Article VII (Quality Gate), SO-21 (IRT mandate), CDO Charter (§2.5.1)  
**Owner:** CDO / I/O Psychologist FTE (M4+); CTO Office in Y1  
**Status:** v1 Methodology (pending I/O Psych contractor hire M4; field testing M3–M6)  
**Effective:** May 2026  

---

## Purpose

Operationalize bias controls per Constitution SO-21 and Article VII Quality Gate Pillar D + QOrium-Specific +12 points. Ensure question quality and assessment fairness across demographic groups. Detect three categories of bias (content, statistical, procedural) via three distinct workflows. All flagged items undergo mandatory SME Lead review within 24 hours before any release or continued use.

---

## §1 Three Categories of Bias

### Category 1: Content Bias
**Definition:** Gendered language, cultural assumptions, regional biases, or implicit social biases embedded in question text or scenarios.

**Examples:**
- "A manager and his assistant..." (gendered pronoun; should be "their")
- Scenario set in elite school context; assumes candidates attended Tier-1 boarding school
- Sport reference specific to cricket/hockey (pervasive in India questions; reasonable); but basketball reference without context in global assessment (assumes US-centric knowledge)
- Household composition assuming 2-parent + children structure; excludes single-parent, multigenerational households
- "Access your IDE on your MacBook" — assumes proprietary hardware access

**Detection point:** SME Lead review at authoring + formal checklist review before release.

### Category 2: Statistical Bias / Differential Item Functioning (DIF)
**Definition:** Item performs significantly differently across demographic groups when accounting for overall ability. A high-ability candidate from Group A and high-ability candidate from Group B should have equal probability of passing; if they don't, the item exhibits DIF.

**Examples:**
- Question about cloud deployment in AWS (US-market assumption) may favor US-trained engineers over India-trained engineers of equal ability.
- Java multi-threading question written in Oracle-centric dialect; IBM JDK users (India) face subtle API differences.
- Coding style assumptions (e.g., "idiomatic Python") may favor candidates trained in certain schools/boot camps.

**Detection point:** Mantel-Haenszel DIF analysis monthly on items with N≥30 responses.

### Category 3: Procedural Bias
**Definition:** Question structure, time allowance, language complexity, or assumptions about resource access create unfair barriers for certain groups.

**Examples:**
- 5-minute time limit for a design question may disadvantage non-native English speakers (requires more reading time).
- "Use an online IDE; IntelliJ is preferred" — assumes internet bandwidth and software availability.
- Flesch-Kincaid grade-level 16+ (technical jargon + complex sentence structure) may disadvantage candidates from non-English-medium education.
- References to expensive commercial tools (e.g., "in your Salesforce org") — assumes access.

**Detection point:** Structural review + accessibility audit at authoring.

---

## §2 Demographic Groups for Bias Analysis

All demographic data collection is **opt-in, explicit consent only**. Privacy-preserving aggregation: never store name + demographic pair. Use aggregate statistics only (e.g., "Female: 55% pass rate on this question; Male: 72% pass rate").

### Demographic Dimensions

| Dimension | Categories | Collection | Privacy Model |
|---|---|---|---|
| **Gender** | M / F / Other / Prefer Not to Answer | Explicit opt-in at Reference Panel signup | Aggregated only; never linked to name |
| **Age Band** | <25 / 25–34 / 35–44 / 45+ | Explicit opt-in; collect year of birth, compute band | Aggregated only; minimum 10 respondents per group per item |
| **Education Path** | Tier-1 (IIT, BITS, NIT, top global) / Tier-2 (top private, strong state) / Tier-3 (state colleges, alternative) / Non-traditional (boot camps, self-taught) | Self-reported during panel signup; verified via education credential (diploma link) | Aggregated only; categorize by college rank database |
| **Geography** | Metro (Delhi, Mumbai, Bangalore, Hyderabad) / Tier-2 City (Pune, Jaipur, etc.) / Tier-3 (small cities) / Rural | Self-reported; optional | Aggregated by region cohort; minimum 8 respondents per group per item |
| **Primary Education Medium** | English-medium / Non-English-medium | Self-reported | Aggregated; minimum 6 respondents per group per item |

### Ethical Constraints

- **No sensitive characteristics:** Race, caste, religion, sexual orientation NOT collected. These attributes are not relevant to assessment fairness.
- **Minimum cohort size:** DIF analysis requires N≥10 per demographic × item combination. If insufficient, do not report per-group stats; only analyze aggregate.
- **No individual-level bias reporting:** Never report "Candidate X is biased"; only report "Item Y shows DIF with p<0.05 favoring Group A."
- **Data retention:** Demographics deleted post-quarterly DIF cycle; no long-term storage of demographic + response pairs.

---

## §3 Content Bias Review Checklist

**Used by:** SME Lead, before any question enters 'released' status.  
**Cadence:** 100% of new questions; 5% random sample of existing questions weekly.  
**SLA:** Checklist review ≤24 hours from SME Lead assignment.

### 20-Item Checklist

| # | Criterion | Pass | Guidance |
|---|---|---|---|
| 1 | Pronouns gender-neutral or reflexive | ✓ Use "their," "they," or explicitly specify (e.g., "Alice...she") | Avoid "his/her" awkwardness; ban generic "he" |
| 2 | Proper names diverse (not all Western or gendered) | ✓ At least 25% non-Western names; mix M/F/ambiguous | Use: Arjun, Priya, Chen, Amara, Jordan, Casey |
| 3 | No cultural/sport/cuisine assumptions | ✓ If example uses sport, explain context or make culture-agnostic | Cricket = fine for India; basketball needs setup or use neutral example |
| 4 | Household/family assumptions examined | ✓ Avoid "your parents," "your home country"; use "a household," "a region" | Question about salary deductions → avoid "your spouse" |
| 5 | No elite-school knowledge assumed | ✓ Technical content OK; social/cultural content requires setup | OK: "algorithms"; avoid: "like your school debate club" |
| 6 | No assumed access to specific tools/hardware | ✓ If tool required, explicitly state "access to X is provided" | Avoid: "debug in your IDE"; use "in a provided IDE" |
| 7 | No internet/network access assumed | ✓ State "assume offline" or "assume online"; don't assume both | OK: "use provided docs"; avoid: "Google the API" |
| 8 | Language complexity at Flesch-Kincaid ≤12 | ✓ Measure stem + scenario text; ≤grade 12 readability | Use tools: Flesch-Kincaid calculator; prefer <11 for global |
| 9 | Time limit proportionate to reading + task | ✓ For 5-min question: design → 40% reading, 60% solving | Avoid: tight limit for scenario-heavy questions without setup time |
| 10 | No assumed geographic/climate context | ✓ "In a region with X weather" not "In Canada, it snows" | OK: scenario setup; avoid implicit cultural knowledge |
| 11 | Disability accessibility considered | ✓ (A) Code questions readable by screen readers; (B) images have alt-text; (C) no time-pressure discrimination | Avoid: pure-visual puzzles; require text alternative |
| 12 | No gendered job/role assignment | ✓ Avoid "nurse (female), engineer (male)" stereotypes | Use gender-neutral role titles or randomize |
| 13 | Question stem ≤3 sentences | ✓ Longer stems = more reading time burden | If >3 sentences: refactor; break into parts |
| 14 | No "obvious trick" that relies on cultural knowledge | ✓ Technical problems have one correct answer | Avoid: "trick" questions where answer hinges on unstated assumption |
| 15 | Test cases represent diverse scenarios | ✓ If code question: test cases include edge cases, not just happy path | Edge cases: empty input, boundary values, negative cases |
| 16 | No ableist language | ✓ Avoid "blind spot," "crazy algorithm," "lame solution" | Use: "overlook," "unusual," "suboptimal" |
| 17 | Scenario setting is inclusive or neutral | ✓ If set in office: modern office (diverse team); if fictional: generic | Avoid: "startup with young bro culture"; use "organized team" |
| 18 | Currency/units localized or explained | ✓ US$, ₹, €, etc. stated; metric vs imperial specified | Avoid: "cost $50" in global assessment; specify currency |
| 19 | No assumed political/current-event knowledge | ✓ Technical questions are apolitical | Avoid: "in the year of [election]"; avoid current events |
| 20 | No disparaging language toward groups | ✓ Question treats all candidate backgrounds as valid | Avoid: "legacy candidates," "Indian codebase quality," stereotypes |

**Checksum:** If ANY item is ✗, item enters 'bias_review' status (new status; add to migration 0002). SME Lead has 24h to remediate or retire.

---

## §4 Differential Item Functioning (DIF) Analysis Methodology

### 4.1 Statistical Method: Mantel-Haenszel for v1

**Why Mantel-Haenszel?**
- Well-understood, widely used in educational assessment.
- Non-parametric; doesn't assume normal distribution.
- Easily implemented in Python (`psyrasch` package) or R (`mirt`, `difR`).
- Industry-standard for DIF detection; accepted by ACE, NCERT, CBSE.

**3PL IRT upgrade timeline:** Implement 3PL-based DIF (Item Response Theory Likelihood Ratio test) in v2 (M9+) when IRT parameters are stable across 2K+ questions.

### 4.2 Implementation

**Tools:** Python `psyrasch` or R `difR` / `mirt` packages.

**Procedure:**
1. **Data prep:** For a given question_id, fetch all responses from Reference Panel members grouped by demographic (e.g., Female, Male).
2. **Ability estimation:** Estimate each Reference Panel member's overall ability θ using sum-of-correct-answers (crude proxy for Y1; refine to IRT-based ability in Y2).
3. **Contingency table:** For each demographic pair (e.g., Female vs Male), build 2×2 contingency table:
   - Correct (Female, θ ≈ mean) | Incorrect (Female)
   - Correct (Male, θ ≈ mean) | Incorrect (Male)
4. **Mantel-Haenszel statistic:** Compute MH χ² and delta_MH (effect size).
5. **Thresholds (v1):**
   - **MH χ²: p < 0.05** = statistically significant DIF.
   - **|MH delta| > 1.5** = meaningful practical effect size.
   - Both conditions → **FLAG for SME review**.

### 4.3 Cadence & Sample Size

**Frequency:** Monthly DIF audit.

**Trigger condition:** Item has N ≥ 30 total responses (min sample size for stable 3PL parameters per Kline 1995).

**Sample size per demographic group:** Minimum N ≥ 10 per group per item (acceptable per ETS DIF standards; preference is N ≥ 20).

**If N < 10 in a group:** Skip DIF analysis for that item-group pair; re-run next month when more data arrives.

### 4.4 Example DIF Workflow

**Scenario:** Question QOR-AWS-104 (AWS Lambda with Python decorators). Data:
- Female: 12 correct, 8 incorrect (20 total)
- Male: 18 correct, 7 incorrect (25 total)
- Ability estimates: Female mean θ = 0.2, Male mean θ = 0.1 (nearly identical)

**Contingency:** 
```
           Correct  Incorrect
Female      12        8
Male        18        7
```

**MH statistic:** χ² = 0.42, p = 0.52 (not significant).
**Delta_MH:** -0.23 (small effect, favors males slightly).

**Decision:** No DIF detected. Question is fair across gender. Release as-is.

---

## §5 Procedural Bias Controls

### 5.1 Time Limits

**Rule:** Time limits set conservatively; per-question time documented in question metadata.

**Guideline:**
- Simple MCQ (recall): 1 min per question.
- Medium code problem (30–50 lines): 5–8 min.
- Complex design question (diagram + explanation): 10–15 min.
- Non-native English speakers typically need +30% time buffer.

**Accessibility:** Offer extended time (1.5x) to candidates who request it (per WCAG 2.1 AA and standard assessment accommodation).

**Data collection:** Track time_taken_ms per response; flag outliers (time > 3σ above mean) for potential technical issues.

### 5.2 Language Complexity

**Standard:** Flesch-Kincaid grade-level ≤ 12 for stem text.

**Rationale:** Grade 12 ≈ senior year of high school; accessible to non-native English speakers with strong technical background.

**Global assessments:** Prefer ≤ grade 11 if international candidacy expected.

**Tools:** Python `textstat` library or online Flesch-Kincaid calculator.

**Audit:** Before 'released' status, SME Lead confirms Flesch-Kincaid score.

### 5.3 Resource Assumptions

**Explicit disclosure:** Every question states assumed resources in metadata.

**Examples:**
- "You have access to a Python 3.9 interpreter with numpy, pandas, sklearn installed."
- "No internet access; reference docs provided."
- "You may use an IDE with auto-complete and linting."

**Avoid:**
- "Use your favorite IDE" (assumes IDE access).
- "Look up the docs online" (assumes internet).
- "You know this framework" (assumes prior experience).

### 5.4 Accessibility (WCAG 2.1 AA)

**Standard:** All assessment delivery surfaces (API responses, web UI, embedded widgets) meet WCAG 2.1 Level AA.

**Checklist:**
- Color contrast ≥ 4.5:1 for text.
- Code blocks readable by screen readers (use `<pre><code>` with semantic HTML).
- Images with alt-text; math with alt descriptions.
- No time-pressure assessment for timed reading; equivalent untimed alternative.
- Keyboard navigation for all interactive elements.

**Audit:** CTO Office + external accessibility consultant (M6+ scope and budget permitting).

---

## §6 Bias Audit Cadence

| Touchpoint | Cadence | Owner | SLA |
|---|---|---|---|
| **Pre-release content checklist** | 100% of new items | SME Lead | 24h |
| **Post-release random sample** | Weekly 5% of released items | CTO Office / QA | N/A (no fail path) |
| **Monthly DIF analysis** | All items N≥30 | CDO / I/O Psych (M4+) | Monthly cutoff: 25th |
| **Quarterly bias deep-dive** | All items + external review | CDO + I/O Psych advisor | Quarterly (M3, M6, M9, M12 close) |
| **Annual refresh** | Full reference panel audit | I/O Psych FTE | Post-M12 |

---

## §7 Remediation Flow

**Trigger:** Item flagged by any of the above processes (content checklist ✗, DIF p<0.05, accessibility fail, etc.).

**Status transition:** Item status='bias_review' (new enum value; add to database migration 0002).

**24-hour SLA:** SME Lead or I/O Psychologist FTE must review and decide within 24 hours of flag.

**Outcomes:**
1. **Revise:** Item is rewritten to remove bias. New version inherits IRT parameters from old; treat as variant via parent_question_id linkage.
2. **Retire:** Item is marked status='retired', removed from all active packs, audit logged with reason.

**Audit log:** Every bias_review decision logged in audit.events with:
- flag_reason (checklist item X, DIF statistic, accessibility issue, etc.)
- remediation_decision (revise / retire)
- reviewed_by (SME Lead / I/O Psych FTE user_id)
- evidence (screenshot, DIF stats, accessibility report)

---

## §8 Reference Panel Diversity Targets

Per Reference Panel governance, target demographic representation:

| Dimension | Target Range | Review Cadence |
|---|---|---|
| **Gender** | 40–60% M, 40–60% F, 5–10% Other | Quarterly |
| **Geography** | 50–70% India, 20–40% APAC (ex-India), 5–15% global (EU/US) | Quarterly |
| **Education** | 40–60% Tier-1, 30–50% Tier-2, 10–30% Tier-3 + non-traditional | Quarterly |
| **Age** | 20–30% <25, 35–50% 25–34, 15–30% 35–44, 5–15% 45+ | Quarterly |
| **Primary education** | 60–80% English-medium, 20–40% non-English-medium | Quarterly |

**Action if drift detected:** Pause new panel recruits; adjust incoming cohorts to rebalance.

---

## §9 External Validation

**M9+ scope:** Engage 1 academic I/O Psychologist advisor (external) for v2 DIF methodology review.

**Advisor scope:**
- Audit Mantel-Haenszel thresholds (p<0.05, |delta|>1.5) against published literature.
- Recommend 3PL-LR upgrade parameters.
- Validate demographic binning decisions (age bands, education tiers).
- Review bias audit sample for false positives/negatives.
- Publish case studies (anonymized) for credibility.

**Cadence:** Quarterly review calls post-M9.

---

## §10 Reporting & Transparency

**Audience:** J5 monthly close (per Operating Rituals).

**Metrics reported (aggregate only, never per-candidate):**
- Content bias checklist pass rate (% of items passing 20-item checklist).
- DIF detected (count of items flagged, % of total released).
- DIF remediation rate (% revised vs retired).
- Reference Panel demographic composition.
- Accessibility audit pass rate.

**Public transparency:** QOrium publishes quarterly "Bias Audit Report" highlighting:
- Methodology used.
- Items flagged and remediation outcomes (aggregated).
- Reference Panel diversity trends.
- Future improvements planned.

**No per-candidate reporting:** Individual candidate bias claims are never published or surfaced; only aggregate quality metrics.

---

## §11 Implementation Timeline

| Phase | Milestone | Owner | Date |
|---|---|---|---|
| **M1–M2** | Content bias checklist deployed; SME Lead trained | CTO Office + SME Lead | May 15, 2026 |
| **M3** | 5% post-release random audit sampling active | CTO Office / QA | June 15, 2026 |
| **M3–M4** | Reference Panel reaches N=100–150; DIF analysis pilot (Mantel-Haenszel) | CDO / Contractor | June 30, 2026 |
| **M4** | I/O Psychologist contractor onboarded; takes CDO hat | I/O Psych FTE | July 15, 2026 |
| **M5–M6** | First quarterly bias audit published; external advisor engaged | I/O Psych + CTO | September 2026 |
| **M9** | 3PL DIF upgrade evaluation; v2 methodology designed | I/O Psych advisor + CTO | December 2026 |

---

## Drafting Notes & Risk Flags

1. **Demographic data legal review:** Opt-in consent + privacy-preserving aggregation requires explicit legal review for DPDPA (India) and GDPR (if EU customers). Flag for A7 DPA addendum.

2. **Statistical thresholds:** Mantel-Haenszel p<0.05 + |delta|>1.5 may need tuning after first 1K items are released and calibrated. Plan sensitivity analysis at M6 close.

3. **Reference Panel composition:** Achieving 40–60% gender split in India tech requires intentional recruitment; plan contractor channels (TechWomen India, Code2040 equivalent, alumni networks of IITs with higher female rates).

4. **Cultural context trade-off:** India-stack content (SAP ABAP, Oracle HCM Payroll India) will inherently have India-specific assumptions (e.g., Indian tax/payroll law). Document these as "context-appropriate" rather than "biased"; ensure DIF analysis segregates by geography.

---

**Version:** v1  
**Ratified:** May 2026  
**Next review:** M3 (September 2026) Phase Gate
