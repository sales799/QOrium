# Wave 2 Extension: Oracle HCM Cloud (Questions 041–060)

**STATUS:** AI-drafted v0.6 EXTENSION (Oracle HCM Cloud closure: 40→60 Qs). SME Lead validation pending. NOT for external delivery. Reference baseline: Oracle Cloud HCM 24A/24B/24C release cycle (2025-26); Oracle Recruiting Cloud (ORC) Phase-1 → Phase-3 implementation gates; OTBI 12.1+; Oracle Digital Assistant (ODA) HCM skills v23.x.

**Scope:** 20 NEW questions (QOR-OHCM-041..060) closing the Oracle HCM 60-question v0.6 set. Difficulty distribution: 4 Easy / 9 Medium / 5 Hard / 2 Very Hard. Format mix: 12 MCQ + 4 code-write (Fast Formula / HDL / REST / OTBI) + 2 design-essay + 2 case-study.

**Sub-skill focus (no duplication of Q001–Q040):** Performance Management · Goal Management · Talent Review (9-Box) · Succession Planning · Workforce Modeling · Workforce Compensation Plan-on-Plan · Pay-for-Performance Calibration · Total Compensation Statement · Benefits Eligibility Profile · Open Enrollment · Career Development · OTBI Advanced · HR Helpdesk + ServiceNow · ODA AI/ML in HCM · Oracle Recruiting Cloud Phase Gates · Background Check Integration · Onboarding Journeys · Offboarding Workflows.

---

## QUESTION 41: Performance Management — Document Type Configuration (Easy)

**question_id:** QOR-OHCM-041  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** performance-management  
**format:** MCQ  
**difficulty_b:** -1.1 (Easy)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 3  
**citation:** Oracle Cloud HCM Performance Management Implementation Guide §4.2 (24A); docs.oracle.com/en/cloud/saas/human-capital-mgmt/24a/faipm

**body:**

In Oracle HCM Cloud Performance Management, an HR admin needs to support three review cycles with different participant rules: an annual review that loops in the manager + peer + self; a mid-year check-in with manager + self only; and a project-end review with manager + skip-level. Which configuration object encodes these participant differences?

**options:**

- A) Performance Template — define a template per cycle and attach it to the Document Period
- B) Performance Document Type — define a document type per cycle with its participant + section structure
- C) Process Flow — clone the default flow and toggle participants per stage
- D) Eligibility Profile — bind each cycle to a different eligibility profile

**answer_key:**

B — Document Type is the configuration object that owns participants, sections, and ratings model. Templates instantiate documents from a Document Type for a specific period; Process Flows govern transitions but not who participates. Eligibility Profiles control who *receives* a document, not the document's structure. References: Performance Management Implementation Guide §4.2; Oracle Patterns: Document Types vs Templates.

**rubric:**

MCQ; correct = 5 points, incorrect = 0. B vs A is the high-discrimination distinction.

**watermark_seed:** qorium-ohcm-v0.6-041-seed-9c3a1b7d  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-041  
**bias_check_notes:** No bias. Performance review structure is universal HR concept.

---

## QUESTION 42: Goal Management — Goal Library vs. Worker Goals (Easy)

**question_id:** QOR-OHCM-042  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** goal-management  
**format:** MCQ  
**difficulty_b:** -0.9 (Easy)  
**discrimination_a:** 1.2  
**expected_duration_minutes:** 3  
**citation:** Oracle Cloud HCM Goal Management Implementation Guide §3.1 (24B)

**body:**

A workforce of 8,000 employees needs a curated catalogue of company-wide goals (e.g., "Improve customer NPS", "Reduce cycle time") that managers can assign as starting points. Where in Oracle HCM Cloud is this catalogue maintained?

**options:**

- A) Goal Plan — one master plan with all goals, then cascade
- B) Goal Library — global catalogue separate from worker goals; managers add from library to a worker's plan
- C) Goal Set — group of goals attached to a specific job role
- D) Performance Document — goals are added directly to each performance document

**answer_key:**

B — The Goal Library is the global catalogue. Managers and workers can add goals from the library into a personal Goal Plan. The library carries metadata (category, success criteria template, weight default). Goal Plans are personal containers; Goal Sets are deprecated terminology. References: Goal Management Implementation Guide §3.1.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-042-seed-2e5c8f4a  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-042  
**bias_check_notes:** No bias. Goal cascading is universal management concept.

---

## QUESTION 43: Talent Review — 9-Box Configuration (Easy)

**question_id:** QOR-OHCM-043  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** talent-review-9-box  
**format:** MCQ  
**difficulty_b:** -0.7 (Easy)  
**discrimination_a:** 1.2  
**expected_duration_minutes:** 3  
**citation:** Oracle Cloud HCM Talent Review Implementation Guide §5.4 (24A)

**body:**

In a Talent Review meeting, the executive team wants the 9-Box matrix to plot employees by Performance (X-axis) and Potential (Y-axis), with Potential rated by a calibration discussion (not a self-rating). Which fact is correct?

**options:**

- A) Both axes draw from Performance Document final ratings; Potential is a section in the doc
- B) Performance axis pulls from Performance Document; Potential axis pulls from a Talent Review-specific Potential rating that the calibration meeting captures
- C) Both axes are computed by Oracle ML (Adaptive Intelligence); admins cannot override
- D) Talent Review uses a 4-box matrix by default; 9-box is a third-party extension

**answer_key:**

B — Talent Review carries its own Potential rating distinct from the Performance Document. The Talent Review Meeting Template lets the calibration committee set/adjust each worker's Potential rating; the Performance Document is read-only context. Performance ratings come from the Performance Document final score. References: Talent Review Implementation Guide §5.4; Patterns §Calibration Meetings.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-043-seed-a17b3c52  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-043  
**bias_check_notes:** No bias. 9-Box methodology is HR-industry standard.

---

## QUESTION 44: Total Compensation Statement — Element Inclusion (Easy)

**question_id:** QOR-OHCM-044  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** total-compensation-statement  
**format:** MCQ  
**difficulty_b:** -0.8 (Easy)  
**discrimination_a:** 1.2  
**expected_duration_minutes:** 3  
**citation:** Oracle Cloud HCM Compensation Implementation Guide §9.3 (24A); Total Comp Statement Best Practices

**body:**

The CHRO wants the Total Compensation Statement to display: base salary, bonus, employer EPF contribution (India), gratuity accrual, and group medical insurance employer contribution. Which configuration drives what appears on the statement?

**options:**

- A) Total Compensation Item — each line on the statement is a Total Compensation Item linked to a calculation source (element classification or BI data)
- B) Payroll Element Type — the statement renders all elements of classification "Earnings"
- C) Eligibility Profile — eligibility decides what's shown; structure is hard-coded
- D) HDL upload of statement contents per worker

**answer_key:**

A — Total Compensation Items are the line items. Each item is configured with a source (a payroll element classification, a calculated value, or a BI Publisher data link), an Effective Date range, and display labels in multiple languages. The statement renders the Items configured at the Statement Definition. References: Compensation Implementation Guide §9.3.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-044-seed-c08b1d9e  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-044  
**bias_check_notes:** Items India-flavoured (EPF, gratuity) but generally applicable; rubric grades on Item-as-line concept, not local statutory specifics.

---

## QUESTION 45: Workforce Compensation — Plan-on-Plan Strategy (Medium)

**question_id:** QOR-OHCM-045  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** workforce-comp-plan-on-plan  
**format:** MCQ  
**difficulty_b:** -0.2 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** Oracle Cloud HCM Workforce Compensation Implementation Guide §7.6 (24B); Workforce Comp Plan-on-Plan whitepaper

**body:**

A 12,000-employee org runs two Workforce Compensation Plans simultaneously: a Merit plan (annual increase) and a Bonus plan (annual variable pay). Manager budgets in the Bonus plan should consume from the same total budget pool as Merit (e.g., a manager has $200K total; using $150K for Merit leaves $50K for Bonus). What configuration achieves this?

**options:**

- A) Plan-on-Plan: configure Bonus plan with a Budget Source = "Remaining Budget from Merit Plan"
- B) Manually copy the residual budget after Merit closes, before Bonus opens
- C) Use a single plan with two components (Merit + Bonus) instead of two plans
- D) Configure both plans with the same Budget Pool but different Targets

**answer_key:**

A — Plan-on-Plan is the canonical pattern. The downstream plan (Bonus) declares a dependency on the upstream (Merit) and reads the residual pool. This avoids the manual copy of B (error-prone, doesn't real-time update if Merit reopens) and the inflexibility of C (single plan can't have differing approval flows or eligibility per component). D wires both to the same pool but doesn't subtract Merit usage. References: Workforce Comp Implementation Guide §7.6; Patterns §Plan-on-Plan.

**rubric:**

MCQ; correct = 5, incorrect = 0. A vs D is the high-discrimination distinction.

**watermark_seed:** qorium-ohcm-v0.6-045-seed-4f7e2a8c  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-045  
**bias_check_notes:** No bias. Multi-plan budgeting is universal compensation practice.

---

## QUESTION 46: Pay-for-Performance Calibration (Medium)

**question_id:** QOR-OHCM-046  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** pay-for-performance-calibration  
**format:** MCQ  
**difficulty_b:** -0.1 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 4  
**citation:** Oracle Cloud HCM Workforce Compensation §8.2 — Calibration; Patterns §Forced Distribution

**body:**

The CFO mandates a forced distribution on Merit ratings: at most 15% Exceeds, at most 60% Meets, at least 25% Below — calculated per cost centre, not per manager. Within Workforce Compensation, where do you enforce this?

**options:**

- A) Performance Document rating scale — restrict the rating values
- B) Eligibility Profile — gate who's eligible based on rating
- C) Calibration Page configured at Cost Centre level with target distribution; manager budgets adjust during calibration
- D) HDL post-process to nullify ratings outside the distribution

**answer_key:**

C — Calibration Pages are the surface for forced-distribution enforcement. Configure the calibration unit (Cost Centre, Department, custom) and target distribution; the system flags out-of-distribution managers and computes recommended adjustments. Performance Document scale (A) controls available ratings, not aggregate distribution. Eligibility (B) is wrong tool. HDL (D) is destructive and post-hoc. References: Workforce Comp §8.2; Patterns §Forced Distribution.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-046-seed-7d4b9f1a  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-046  
**bias_check_notes:** Forced distribution is methodology-debatable but operationally common; question tests config knowledge, not policy stance.

---

## QUESTION 47: Succession Planning — Talent Pool Eligibility (Medium)

**question_id:** QOR-OHCM-047  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** succession-planning  
**format:** MCQ  
**difficulty_b:** 0.0 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** Oracle Cloud HCM Succession Planning Implementation Guide §4.5 (24A)

**body:**

A Succession Plan is created for the role "Director, Engineering". The HR admin wants only employees who (i) currently hold a job at the IC4 level or above, (ii) have been with the company ≥2 years, and (iii) have a Potential rating of "High" or "Top" to appear in the candidate pool. Which Oracle object enforces all three filters?

**options:**

- A) Eligibility Profile — combine Job Level, Seniority, and Potential criteria; attach to the Succession Plan
- B) Talent Pool — a manual list maintained by HR ops
- C) Job Profile — only candidates whose Job Profile matches the target are eligible
- D) Performance Document — only candidates whose latest doc shows Potential High/Top are eligible

**answer_key:**

A — Eligibility Profiles unify all three filter dimensions in one declarative object that the Succession Plan consumes. Talent Pools (B) are manual curation. Job Profile (C) addresses competency match, not the org filters. Performance Document (D) only carries Performance ratings; Potential is in the Talent Profile / Talent Review record. References: Succession Planning §4.5; Eligibility Profile patterns.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-047-seed-8b3a2e6c  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-047  
**bias_check_notes:** No bias.

---

## QUESTION 48: Workforce Modeling — Reorg Simulation (Medium)

**question_id:** QOR-OHCM-048  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** workforce-modeling  
**format:** MCQ  
**difficulty_b:** 0.1 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** Oracle Cloud HCM Workforce Modeling §3 (24B)

**body:**

A regional VP wants to simulate moving 40 engineers from "Bengaluru Office" to a new "Hyderabad Office" with a target start date 90 days out, then compare headcount and budget impact against the current state — without actually changing anything in production. The reorg should also be reviewable by the CHRO before implementation. Which Oracle HCM capability supports this?

**options:**

- A) Workforce Modeling — sandboxed reorg model, side-by-side compare, multi-step approval, then "Implement" pushes to live data
- B) HCM Sandbox + manual edits — clone production into a sandbox and edit
- C) HDL with "Validate-only" mode — generate a what-if HDL run
- D) Spreadsheet export + manual spreadsheet planning

**answer_key:**

A — Workforce Modeling is the purpose-built object: create a model, edit assignments/locations/managers in the model, run impact analysis (headcount, salary cost, span of control), route for approval, then "Implement" to apply to live data. B (sandbox) is for config testing, not data planning. C (HDL validate-only) doesn't support the reorg-then-approve flow. D is what teams do without HCM. References: Workforce Modeling §3.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-048-seed-d29f8c5a  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-048  
**bias_check_notes:** No bias.

---

## QUESTION 49: Benefits Eligibility Profile — Cross-Plan Reuse (Medium)

**question_id:** QOR-OHCM-049  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** benefits-eligibility-profile  
**format:** MCQ  
**difficulty_b:** 0.2 (Medium)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 4  
**citation:** Oracle Cloud HCM Benefits Implementation Guide §6.2 (24A)

**body:**

A benefits admin needs the same eligibility logic ("Full-time, India location, ≥6 months tenure") applied to 14 different benefits programs (medical, dental, vision, term life, accident, etc.). Each program has its own Plan + Option configuration. What's the right Oracle pattern?

**options:**

- A) Define an Eligibility Profile once; reference it from each Plan + Program; updates propagate
- B) Copy-paste the eligibility criteria into each Plan's eligibility tab
- C) Use a Fast Formula on each Plan that hard-codes the rules
- D) Run an HDL job nightly to update plan eligibility per worker

**answer_key:**

A — Eligibility Profiles are reusable; one profile referenced from 14 plans means one place to update. Option B is the anti-pattern (drift). C (Fast Formula) is the right tool when criteria depend on derived values, but for static criteria a Profile is simpler and visible to admins. D is operationally wrong — eligibility evaluation should be live, not batch. References: Benefits Implementation Guide §6.2; Patterns §Reusable Profiles.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-049-seed-1a4f7b3e  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-049  
**bias_check_notes:** No bias.

---

## QUESTION 50: Open Enrollment — Life Event Handling (Medium)

**question_id:** QOR-OHCM-050  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** open-enrollment  
**format:** MCQ  
**difficulty_b:** 0.3 (Medium)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 4  
**citation:** Oracle Cloud HCM Benefits Implementation Guide §7.4 (24A)

**body:**

During Open Enrollment (Nov 15 – Dec 1), an employee gets married on Nov 22. The marriage is a Life Event that allows them to add their spouse to medical coverage outside the normal enrollment window. The employee both submits Open Enrollment elections AND raises a Life Event for the marriage. Which is true about how Oracle HCM processes this?

**options:**

- A) Open Enrollment elections are queued and only applied after the Life Event closes
- B) Both windows process independently; Life Event has its own elections page covering only the impacted plans, while Open Enrollment is a comprehensive page
- C) The Life Event automatically cancels the Open Enrollment window for that worker
- D) The system errors and requires admin intervention

**answer_key:**

B — Life Events and scheduled enrollment windows are independent processes. The employee sees two enrollment events; each has its own selection page. The Life Event is scoped to plans impacted by that event (e.g., medical to add dependant); Open Enrollment is comprehensive. Effective dates resolve correctly per plan-rate logic. A and C are wrong; D is wrong unless config has explicit conflict rules. References: Benefits §7.4; Life Event vs Scheduled Enrollment patterns.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-050-seed-6e9c2a8b  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-050  
**bias_check_notes:** Marriage example used; non-marriage life events (childbirth, dependant change) follow same pattern.

---

## QUESTION 51: HCM Fast Formula — Allowance Calculation (Medium · Code-Write)

**question_id:** QOR-OHCM-051  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** fast-formula-payroll  
**format:** code-write  
**difficulty_b:** 0.4 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 8  
**citation:** Oracle Cloud HCM Fast Formula User Guide §4 (24A); Fast Formula Patterns

**body:**

Write a Fast Formula (HCM type: "Element Calculation") for "House Rent Allowance (HRA)" that follows India tax-friendly logic: HRA = MIN(actual HRA paid, 50% of basic salary if metro / 40% if non-metro, rent paid minus 10% of basic). Inputs available as Database Items: BASIC_SALARY (monthly), HRA_PAID (monthly), RENT_PAID (monthly), CITY_TIER (metro / non-metro). Output: TAX_EXEMPT_HRA. Assume monthly evaluation.

**answer_key:**

```
/* HRA Tax Exemption — India statutory */
DEFAULT FOR BASIC_SALARY IS 0
DEFAULT FOR HRA_PAID IS 0
DEFAULT FOR RENT_PAID IS 0
DEFAULT FOR CITY_TIER IS 'NON-METRO'

INPUTS ARE BASIC_SALARY, HRA_PAID, RENT_PAID, CITY_TIER

l_pct_basic = 0.40
IF CITY_TIER = 'METRO' THEN
  l_pct_basic = 0.50

l_basic_cap = BASIC_SALARY * l_pct_basic
l_rent_excess = GREATEST(RENT_PAID - (BASIC_SALARY * 0.10), 0)
TAX_EXEMPT_HRA = LEAST(HRA_PAID, l_basic_cap, l_rent_excess)

RETURN TAX_EXEMPT_HRA
```

Reference solution uses Fast Formula syntax: DEFAULT FOR / INPUTS ARE / IF…THEN / GREATEST / LEAST. The three-arm MIN is the canonical India HRA exemption formula.

**rubric:**

5 points: correct logic (all three caps + GREATEST clamp on rent excess) + valid Fast Formula syntax. 3 points: logic correct but minor syntax issue (e.g., missing DEFAULT FOR). 1 point: only one or two arms of the MIN. 0: no recognisable Fast Formula structure.

**watermark_seed:** qorium-ohcm-v0.6-051-seed-3f1a8d7c  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-051  
**bias_check_notes:** India-specific statutory; rubric scores formula structure not local-policy choice.

---

## QUESTION 52: HDL Mass Update — Career Development Plan Promotion (Medium · Code-Write)

**question_id:** QOR-OHCM-052  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** career-development-hdl  
**format:** code-write  
**difficulty_b:** 0.5 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 8  
**citation:** Oracle Cloud HCM HDL User Guide §6.7 — Career Development; HDL Patterns

**body:**

Write the HDL header + a single METADATA + MERGE row for a Career Development Plan record that updates worker `12345` to add a new development goal "Pursue AWS Solutions Architect Professional" with target date 2026-12-31 and status "In Progress". Assume the entity is `CareerDevelopmentPlanGoal`.

**answer_key:**

```
METADATA|CareerDevelopmentPlanGoal|GoalId(SourceSystemId)|GoalName|TargetCompletionDate|Status|PersonNumber|SourceSystemOwner

MERGE|CareerDevelopmentPlanGoal|GOAL_AWS_SAP_12345|Pursue AWS Solutions Architect Professional|2026/12/31|IN_PROGRESS|12345|HRC_SQLLOADER
```

Notes: column order matches METADATA exactly; SourceSystemId for idempotent re-runs; date format `YYYY/MM/DD` per HDL convention; Status uses the lookup value `IN_PROGRESS` (not display label "In Progress"); SourceSystemOwner = `HRC_SQLLOADER` for HDL-driven loads. Re-run with same SourceSystemId is an UPDATE.

**rubric:**

5: METADATA + MERGE both correct (entity, columns, lookup codes, source system). 3: METADATA correct but MERGE has minor issue (e.g., date format slip). 1: structure recognisable but multiple errors. 0: not HDL.

**watermark_seed:** qorium-ohcm-v0.6-052-seed-5b9d3e4a  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-052  
**bias_check_notes:** No bias.

---

## QUESTION 53: HCM REST API — Open Enrollment Status Check (Medium · Code-Write)

**question_id:** QOR-OHCM-053  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** hcm-rest-api  
**format:** code-write  
**difficulty_b:** 0.4 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 7  
**citation:** Oracle Cloud HCM REST API Reference §benefitsEnrollments (24A); REST Patterns

**body:**

Write a curl command (or equivalent fetch) that retrieves the open-enrollment status (`enrollmentStatus`, `enrollmentEndDate`) for worker with PersonNumber `9876` from Oracle HCM REST. Use Basic auth header. Restrict the response payload using `fields=` to just those two fields. Pretty-print is unnecessary.

**answer_key:**

```bash
curl -X GET \
  'https://your-hcm.oraclecloud.com/hcmRestApi/resources/11.13.18.05/workers/9876/child/benefitsEnrollments?fields=EnrollmentStatus,EnrollmentEndDate' \
  -H 'Authorization: Basic <base64(user:pass)>' \
  -H 'Accept: application/json'
```

Notes: PersonNumber `9876` is the resource id; `child/benefitsEnrollments` is the canonical child collection; `fields=` projects only the two columns (saves payload + respects governor limits). Path version `11.13.18.05` is the canonical REST namespace. Real implementations use OAuth2 — Basic auth shown for brevity.

**rubric:**

5: correct endpoint + child path + fields projection. 3: endpoint correct, missing fields projection. 1: endpoint wrong but auth header present. 0: not Oracle HCM REST.

**watermark_seed:** qorium-ohcm-v0.6-053-seed-7c4e1a8b  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-053  
**bias_check_notes:** No bias.

---

## QUESTION 54: HR Helpdesk + ServiceNow Integration (Hard)

**question_id:** QOR-OHCM-054  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** hr-helpdesk-servicenow  
**format:** MCQ  
**difficulty_b:** 0.7 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Oracle HR Helpdesk Cloud Integration Guide §5; ServiceNow IntegrationHub Spoke Catalogue

**body:**

A 25K-employee org runs HR Helpdesk in Oracle HCM and IT/Facilities Helpdesk in ServiceNow. When an employee submits an HR ticket about facilities (e.g., "broken AC in Bengaluru"), HR ops want it auto-routed to ServiceNow's Facilities queue with full ticket history syncing both ways. Which integration pattern fits best?

**options:**

- A) ServiceNow IntegrationHub spoke + Oracle Integration Cloud (OIC) HCM adapter; webhook-driven create/update in both directions, conflict resolution last-write-wins
- B) Nightly HDL export from HCM → ServiceNow CSV import
- C) ServiceNow agents manually monitor a shared inbox
- D) REST polling every 60s from a custom AWS Lambda

**answer_key:**

A — Production pattern: ServiceNow IntegrationHub spoke for HR Helpdesk paired with OIC's HCM adapter. Bi-directional event flow on create/update, including comments + attachments. Conflict resolution config on update direction (typically Owner_System wins; both sides expose `external_id` for idempotency). B is batch-only (delays); C is operationally untenable; D works but reinvents the wheel and lacks the spoke's pre-built field mapping. References: HR Helpdesk Integration Guide §5; ServiceNow IntegrationHub.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-054-seed-2d8f5c9a  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-054  
**bias_check_notes:** No bias.

---

## QUESTION 55: Oracle Digital Assistant (ODA) for HCM — Skill Routing (Hard)

**question_id:** QOR-OHCM-055  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** oda-ai-ml-hcm  
**format:** MCQ  
**difficulty_b:** 0.8 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Oracle Digital Assistant for HCM Skill Reference (24B); ODA Patterns §Skill Routing

**body:**

The HR team enables three out-of-the-box ODA HCM Skills: Time, Absence, and Pay. An employee asks "How many days of leave do I have left?" through Microsoft Teams. Which fact about ODA's routing is correct?

**options:**

- A) ODA uses an LLM-based intent classifier that routes to the most-confident matching Skill (Absence in this case); fallback is the Default Skill
- B) ODA loads all three Skills into the same intent space and routes by keyword match only; no ML
- C) The user must explicitly invoke "@AbsenceBot" before ODA understands which skill to use
- D) ODA always routes to the Default Skill; HCM Skills are deprecated

**answer_key:**

A — ODA's Digital Assistant orchestrates multiple Skills via a built-in intent classifier (24B uses LLM-grounded classification with a fallback to keyword + intent score). The classifier picks the highest-confidence Skill (Absence here matches "days of leave"). Default Skill catches when confidence < threshold. B (keyword-only) is outdated and incorrect for 24B. C is an old @-mention pattern, not required in current ODA. D is wrong. References: ODA HCM Reference §Routing; Patterns §Skill Routing.

**rubric:**

MCQ; correct = 5, incorrect = 0. A vs B is the discrimination point.

**watermark_seed:** qorium-ohcm-v0.6-055-seed-9a3b6e2c  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-055  
**bias_check_notes:** No bias.

---

## QUESTION 56: Oracle Recruiting Cloud (ORC) Phase Gates (Hard)

**question_id:** QOR-OHCM-056  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** orc-phase-gates  
**format:** MCQ  
**difficulty_b:** 0.9 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Oracle Recruiting Cloud Implementation Guide §3.4 — Job Application Phases (24A); Patterns §Phase Gating

**body:**

ORC is implemented with 4 Job Application Phases: Apply → Screen → Interview → Offer. The recruiting director wants to enforce: a candidate cannot move to "Interview" until a recruiter has explicitly checked "Background Check Passed" on the candidate record. What's the canonical configuration?

**options:**

- A) A Phase Action Required Rule on the Interview phase that blocks transition unless `Background_Check_Passed = Y`
- B) A custom approval workflow on the candidate record
- C) ORC doesn't support phase-gating; use ServiceNow ticketing instead
- D) Disable the Interview phase and re-enable manually per candidate

**answer_key:**

A — Phase Action Required Rules are the configuration object. They evaluate when a recruiter attempts a phase transition and block + show an error message if the rule fails. The rule expression can reference candidate flexfields (e.g., Background_Check_Passed), career-related custom objects, or system facts. B (approval workflow) is for offer approval, not phase gating. C is wrong. D is operationally toxic. References: ORC §3.4; Patterns §Phase Gating.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-056-seed-4c7e9d1a  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-056  
**bias_check_notes:** Background-check requirement is policy-dependent; question tests config knowledge of phase gates, not policy stance.

---

## QUESTION 57: Background Check Integration via OIC (Hard · Code-Write)

**question_id:** QOR-OHCM-057  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** background-check-oic  
**format:** code-write  
**difficulty_b:** 1.0 (Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 9  
**citation:** Oracle Integration Cloud HCM Adapter §4 — Recruiting; OIC Patterns §Async Webhook

**body:**

Sketch the OIC integration flow that triggers when a candidate moves to ORC's "Background Check Pending" phase: the integration calls a third-party background check vendor's REST API (POST /background-checks with candidate name, DOB, government ID), receives an async webhook callback within 24 hours, then updates the candidate's `Background_Check_Passed` flexfield + advances or rejects the candidate. Describe in 6–10 lines: trigger, action, webhook endpoint, error handling.

**answer_key:**

```
1. Trigger: ORC HCM Adapter — subscribe to "Job Application Phase Changed" event filtered to "Background Check Pending"
2. Map: read candidate name + DOB + national ID from the event payload (FF: National_ID)
3. Action: REST adapter — POST to https://vendor.example.com/background-checks
   - Body: { "candidate_id": <PersonNumber>, "name": ..., "dob": ..., "national_id": ... }
   - Capture vendor_check_id from response; store in OIC variable + write back to candidate flexfield Vendor_Check_ID
4. Webhook receiver (separate OIC integration on the same project):
   - Endpoint: /vendor/background-check-callback (URL whitelisted in vendor portal)
   - Body: { "vendor_check_id": ..., "result": "PASS" | "FAIL", "report_url": ... }
   - Match candidate by Vendor_Check_ID; update Background_Check_Passed = (result == 'PASS' ? 'Y' : 'N')
   - If PASS: advance to "Interview" phase via HCM Adapter; if FAIL: move to "Rejected" with rejection_reason
5. Error handling: retry POST with exponential backoff (3 attempts; OIC built-in); webhook timeout >24h triggers escalation email to recruiter ops
6. Audit: every step logs to OIC Activity Stream + audit.events on Oracle HCM via REST
```

Key elements: (a) async webhook pattern (not blocking poll); (b) idempotency on vendor_check_id; (c) explicit retry + escalation; (d) two-phase commit pattern for the candidate update + phase transition (so a failed phase-advance doesn't lose the background-check result).

**rubric:**

5: covers trigger, REST POST, webhook callback, status update + phase transition, error handling. 3: missing webhook detail or error handling. 1: only outlines POST. 0: doesn't recognise the async-webhook pattern.

**watermark_seed:** qorium-ohcm-v0.6-057-seed-3f8a2d5c  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-057  
**bias_check_notes:** No bias.

---

## QUESTION 58: Onboarding Journeys — Cross-System Task Orchestration (Hard)

**question_id:** QOR-OHCM-058  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** onboarding-journeys  
**format:** MCQ  
**difficulty_b:** 1.0 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** Oracle Cloud HCM Journeys Implementation Guide §5 (24B); Patterns §Cross-System Tasks

**body:**

A new-hire's Onboarding Journey has 18 tasks spanning HCM (sign offer letter, complete I-9), IT (create laptop ticket in ServiceNow), Facilities (badge in ServiceNow), and Payroll (W-4 form). The CHRO wants a single "% complete" metric on the Journey screen even though 12 of the 18 tasks live in ServiceNow. What's the canonical Oracle pattern?

**options:**

- A) Configure External Tasks in the Journey with status callbacks via the ORC/Helpdesk integration spoke; ServiceNow PUSHes "Task Completed" events that update the Journey item
- B) Disable the Journey and use ServiceNow as the single source of truth
- C) Manually mark tasks complete in HCM after ServiceNow finishes
- D) Use a nightly batch job to compute completion percentage

**answer_key:**

A — Journeys support External Tasks with state-change callbacks. ServiceNow's HR Service Delivery / IntegrationHub spoke pushes task-completion events to HCM, which updates the Journey item status. The Journey screen shows real-time aggregate progress across HCM-native and external tasks. B sacrifices HCM as the system of record for HR tasks. C is the operations anti-pattern. D introduces lag. References: Journeys Implementation Guide §5.

**rubric:**

MCQ; correct = 5, incorrect = 0.

**watermark_seed:** qorium-ohcm-v0.6-058-seed-1b6e9c4a  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-058  
**bias_check_notes:** No bias.

---

## QUESTION 59: Offboarding Workflow — Multi-System Compliance Design (Very Hard · Design-Essay)

**question_id:** QOR-OHCM-059  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** offboarding-workflow-design  
**format:** design-essay  
**difficulty_b:** 1.5 (Very Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 12  
**citation:** Oracle Cloud HCM Termination Process §3 (24A); ISO 27001 A.7.3 — Termination of Employment

**body:**

You are the HCM lead at a 35K-employee multinational. Design an end-to-end offboarding workflow covering: (a) HR notification of voluntary or involuntary termination; (b) revocation of system access (Oracle HCM, ServiceNow, AWS, Salesforce, GitHub) within 4 hours of effective time; (c) hand-off of in-flight work to manager; (d) final-pay processing in payroll; (e) exit interview scheduling; (f) ISO 27001 audit trail of every revocation. Specify Oracle objects/configs, integration touchpoints, SLA targets, and how you'd evidence compliance to an external auditor. Constraint: the design must work for both a planned 30-day notice and a same-day involuntary termination.

**answer_key:**

(Sketch — full reference solution scored against rubric below.)

**Phase 1 — Termination event (HCM-driven):** HR enters Termination action on worker record; effective date and reason captured. A Workflow Subscription on `EmployeeTerminationEvent` fires. For involuntary same-day cases, HR triggers via "Immediate Termination" template that auto-publishes the event with effective time = NOW.

**Phase 2 — Access revocation (OIC-driven, parallel):** OIC subscribes to the termination event and dispatches to 5 parallel sub-flows: (i) Oracle Identity Cloud Service (IDCS) — disable user, revoke all roles; (ii) ServiceNow — disable user, close active tickets owned, transfer ticket queue ownership; (iii) AWS — IAM role removal, MFA revocation, access-key rotation; (iv) Salesforce — freeze user, transfer record ownership per Frozen User reassignment policy; (v) GitHub — remove from org via SCIM. Each sub-flow logs to a single OIC Activity Stream + writes one audit.events row per system + result + duration. SLA: 4-hour target measured from event publish to last-system completion.

**Phase 3 — Work hand-off:** Concurrent with Phase 2, a Journey is auto-created for the manager titled "Offboarding: <Worker Name>" with tasks: hand-off doc, final 1:1, knowledge-transfer list. Tasks reference HCM document templates and ServiceNow asset reassignment.

**Phase 4 — Final pay:** Payroll Element configuration includes a "Final Pay" element triggered by termination effective date; Fast Formula calculates accrued leave payout, gratuity (statutory), severance per company policy, and any bonus claw-back. Payroll Quick-Pay can produce off-cycle final-pay if needed.

**Phase 5 — Exit interview:** Survey assigned via Oracle Survey Cloud / ODA; recurrence on day 1, 7 of separation; results aggregated for monthly retention analytics.

**Phase 6 — Compliance evidence:** ISO 27001 A.7.3 requires demonstrable removal of access. The audit.events log + OIC Activity Stream + IDCS audit logs + provider audit logs (AWS CloudTrail, Salesforce Login History) are the evidence pack. A monthly OTBI report shows mean-time-to-revocation per system + outliers. External auditor sample-tests 30 random terminations against the evidence pack.

**Edge cases addressed:** rehire (re-enable user vs. create-new policy); contractor offboarding (different IDCS group); litigation hold (ServiceNow case suppresses some auto-actions); region-specific pay law (e.g., India vs. EU notice-period statutory).

**rubric:**

20-point rubric (distinct from MCQ 5-pt scale):
- Termination event source-of-truth (3 pts): HCM event-driven vs ad-hoc HR email
- 4-hour revocation across 5 systems (5 pts): parallel design, SLA monitoring
- Hand-off journey for manager (2 pts)
- Final pay design (3 pts): element + Fast Formula + accruals
- Exit interview integration (1 pt)
- ISO 27001 audit-trail design (4 pts): mention of audit.events / Activity Stream / external evidence pack
- Edge cases (2 pts): rehire / litigation hold / regional law mentions

Pass threshold: ≥14/20.

**watermark_seed:** qorium-ohcm-v0.6-059-seed-8f3a7e2c  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-059  
**bias_check_notes:** Multi-region (India, EU) considerations called out; design should not privilege any specific jurisdiction.

---

## QUESTION 60: Comprehensive HCM Transformation — 18-Month Multi-Region Rollout (Very Hard · Case-Study)

**question_id:** QOR-OHCM-060  
**skill_id:** senior-oracle-hcm-cloud  
**sub_skill_id:** hcm-transformation-case-study  
**format:** case-study  
**difficulty_b:** 1.7 (Very Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 15  
**citation:** Oracle Cloud HCM Transformation Patterns; Constitution Article VII Pillar D (Compliance); Bosch GCC reference architecture

**body:**

A 60K-employee Indian-headquartered IT services company (~70% India, 15% US, 10% UK, 5% APAC) is on legacy PeopleSoft 9.2 + Workday + multiple HRIS point solutions. The CHRO has signed off on full migration to Oracle Cloud HCM (Core HR + Payroll + Talent + Recruiting + Learning) over 18 months. Stakes: India payroll runs every month for 42K people; US/UK have semi-monthly + bi-weekly; SOX compliance mandatory; 7+ unions across regions.

**(a)** What's the recommended migration sequence (by region and module) and why?  
**(b)** What are the 3 highest-risk integration points and your mitigation for each?  
**(c)** How do you handle the parallel-run period for India payroll (where running 42K people through both legacy and Oracle for 2 months is the validation requirement)?  
**(d)** How do you manage union sensitivities during configuration changes (e.g., changing time-tracking rules)?

**answer_key:**

**(a) Sequence:** US first (smallest, lowest-risk for tuning) — Core HR + Recruiting + Talent in months 1–4; UK next (months 5–8) adding payroll integration patterns; India last (months 9–18) because India payroll volume + statutory complexity (PT, ESI, EPF, gratuity per state) demands the most config testing time. Within each region: Core HR first (master data), Talent + Recruiting in parallel (no payroll dependency), Payroll last (longest config, hardest test). Learning is config-light; ride along with Talent. Rationale: derisk the high-volume, high-statutory phase by perfecting integration + config patterns on US/UK first.

**(b) Top-3 integration risks + mitigation:**
1. **Active Directory + IDCS sync** — wrong group memberships → access leaks during go-live. Mitigation: 3 weeks of pre-cutover sync validation; IDCS group-membership reconciliation report run nightly; manual sample audit pre-cutover.
2. **PeopleSoft → Oracle HCM data conversion** — 60K worker records + history. Mitigation: dedicated HCM Data Loader (HDL) conversion environment; 4 dry-run conversions; parallel data validation queries; CTO+CHRO sign-off gate per region.
3. **Bank file integration for India payroll** — wrong BSR codes / IFSC = failed bank transfers, P0 compliance event. Mitigation: pre-migration rationalisation of bank master in legacy; HDL Bank Account validation rule; first-month go-live runs with 5K employees, then ramp.

**(c) India parallel-run:** 2-month parallel runs are the SOC validation. Both PeopleSoft and Oracle HCM Payroll run for the same 42K population. Daily reconciliation report compares net pay per worker; tolerance ±0.50 INR (currency rounding). Variances >tolerance flagged + assigned to Payroll Lead for root-cause within 24 hours. Cutover gate: 100% of variances explained AND 95% within tolerance for 2 consecutive monthly runs. Bank disbursement remains via PeopleSoft until cutover (Oracle generates files for diff-only, no actual transfer). Communication plan: weekly status to CHRO + CFO + CRO; named escalation contact per region.

**(d) Union sensitivities:** Time-tracking rules in unionised sites (e.g., manufacturing arms) are bargained. Approach: (i) joint review of every Time Profile / Schedule / Overtime Rule with union reps + HR before configuration finalisation; (ii) formal sign-off recorded as artifact in the change control log; (iii) any Oracle-driven rule change post-go-live runs through the same review; (iv) parallel-run period extended to 3 months for unionised entities; (v) an explicit "compatibility window" where the Oracle config produces identical pay outcomes to the bargained rule, validated mathematically. Risk of skipping: union grievance → arbitration → legal cost + reputational damage in years 1–3 post-migration. Recommend an external labor-law counsel review of any Time Profile change.

**rubric:**

25-point rubric:
- (a) Sequence (6 pts): regional ordering rationale (3) + module ordering (3)
- (b) Integration risks (9 pts): 3 risks × 3 pts each (risk + mitigation + measurable success)
- (c) Parallel run (6 pts): tolerance, reconciliation cadence, cutover gate, communications
- (d) Union (4 pts): joint-review process + change-control + extended parallel-run + counsel review

Pass: ≥18/25. Excellence: ≥22/25.

**watermark_seed:** qorium-ohcm-v0.6-060-seed-9e5b3a8c  
**variant_seed:** qorium-ohcm-v0.6-2026-05-06-060  
**bias_check_notes:** India-context-heavy by design (case is India-HQ company); rubric distributes points across regions so non-India-experienced candidates can score on US/UK/integration design.

---

## End of Wave 2 Oracle HCM Extension 041–060

**Set status:** 60/60 v0.6 complete. SME Lead validation pending across Q001–Q060. NOT for external delivery without SME-Lead sign-off and IRT calibration.

**Bridge note:** This file was authored to mirror the structure of `customer-zero/Wave-2-Oracle-HCM-Cloud-Extension-021-040.md` so the Wave-1 ingest script (`services/readybank/src/scripts/ingest-wave1.ts`) consumes both files identically.
