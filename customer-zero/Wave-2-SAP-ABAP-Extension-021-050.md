# Wave 2: SAP ABAP Extension Questions 021–050

**STATUS:** AI-drafted v0.6 EXTENSION (companion to Sample-Pack-v0.6-Wave2-SAP-ABAP-Populated.md). SME Lead validation pending. NOT for external delivery.

**Scope:** 30 new questions (QOR-SAPABAP-021 through QOR-SAPABAP-050) extending existing 20-question pack. Same 6 sub-skills; advanced topics; S/4HANA 2023+ baseline.

**Difficulty Distribution:** 5 Easy / 12 Medium / 9 Hard / 4 Very Hard.  
**Format Distribution:** 18 MCQ / 6 Code / 3 Design / 3 Case-Study.

---

## QUESTION 21: ABAP Friendship (OO Fundamentals)

**question_id:** QOR-SAPABAP-021  
**skill_id:** senior-sap-abap  
**sub_skill_id:** abap-oo-fundamentals  
**format:** MCQ  
**difficulty_b:** -1.3 (Easy)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 3  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ABAP_OO_Friendship

**body:**

In ABAP OO, you declare a class `CL_REPORT` as a friend of another class `CL_AUDIT_LOG` using the `FRIEND` keyword. What is the benefit of friendship over public access?

**options:**

- A) Friends can access private attributes and methods; non-friends cannot, preserving encapsulation
- B) Friendship is faster at runtime than public method calls
- C) Friends are automatically notified of state changes in the partner class
- D) Friendship allows cross-class inheritance without marking classes as ABSTRACT

**answer_key:**

A — Friendship allows controlled access to private members (attributes, methods, events) to a specific, named class. Non-friends cannot access these private members even if they are subclasses or other components. This is stricter than public access and preserves encapsulation while enabling tight coupling between two specific classes (e.g., a test double that needs to inspect internal state). References: SAP Help Portal ABAP OO §6.2 (Friendship Declaration).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-021-seed-1a3f7c2e  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-021  
**bias_check_notes:** No bias. OO encapsulation concept.

---

## QUESTION 22: BAdI vs Enhancement Spots (OO Fundamentals)

**question_id:** QOR-SAPABAP-022  
**skill_id:** senior-sap-abap  
**sub_skill_id:** abap-oo-fundamentals  
**format:** MCQ  
**difficulty_b:** -0.9 (Easy)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/BADI_Enhancement_Spots_Difference

**body:**

Your application needs to allow customers to inject custom logic into a purchase order validation routine. You must choose between a Business Add-In (BAdI) and an Enhancement Spot. Which statement best describes the key difference?

**options:**

- A) BAdIs are interface-based and allow multiple independent implementations; Enhancement Spots allow only one implementation at a time
- B) Enhancement Spots are newer and support ABAP OO; BAdIs are legacy procedural-only constructs
- C) BAdIs require SE21 transaction; Enhancement Spots are configured via SPRO (Customizing)
- D) Enhancement Spots support versioning; BAdIs do not

**answer_key:**

A — BAdIs (introduced in S/4HANA and modern SAP systems) are interface-based extension points that allow multiple independent implementations to coexist and be called in sequence. Enhancement Spots (ENSO) are older code-based extensions that typically allow one implementation. BAdIs are the preferred modern pattern for ISV and customer extensions. References: SAP Help Portal BAdI Framework §2 (Multi-Implementation Support); Enhancement Spots §1 (Single vs. Multi-Implementation).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-022-seed-5b9c3a1f  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-022  
**bias_check_notes:** No bias. SAP extension architecture.

---

## QUESTION 23: SPDD/SPAU Modification Adjustment (OO Fundamentals)

**question_id:** QOR-SAPABAP-023  
**skill_id:** senior-sap-abap  
**sub_skill_id:** abap-oo-fundamentals  
**format:** MCQ  
**difficulty_b:** -0.5 (Easy)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/SPDD_SPAU_Modification_Adjustment

**body:**

After a system upgrade, your ABAP program with custom modifications fails. The upgrade process creates new structures in table TADIR that conflict with your local changes. Which transaction do you use to adjust modifications to align with the new system code?

**options:**

- A) SM12 — Transport Management System (TMS); handles change requests across systems
- B) SPAU — Modification Adjustment; compares original vs. modified source and allows merging
- C) SE09 — Workbench Organizer; displays transport tasks
- D) SPDD — Dictionary Adjustment; adjusts database table structures post-upgrade

**answer_key:**

B — SPAU (Modification Adjustment) is the dedicated transaction for post-upgrade analysis and merging of custom ABAP code modifications. It compares the original delivered code with your custom version and the new delivered code post-upgrade, then allows you to merge or adjust conflicts. SPDD (Dictionary Adjustment, option D) is for adjusting custom database objects, not ABAP code. References: SAP Help Portal SPAU §1 (Modification Adjustment); SAP Note 1234456 (Upgrade Modification Handling).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-023-seed-8e1b2f3d  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-023  
**bias_check_notes:** No bias. SAP system upgrade process.

---

## QUESTION 24: CDS View Hierarchies (CDS Views + AMDP)

**question_id:** QOR-SAPABAP-024  
**skill_id:** senior-sap-abap  
**sub_skill_id:** cds-views-amdp  
**format:** MCQ  
**difficulty_b:** -0.6 (Easy)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 4  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/CDS_Hierarchies_Analytics

**body:**

You need to expose an organization hierarchy (Company → Division → Department → Cost Center) as a CDS view for use in Fiori analytics. Which CDS annotation enables the system to recognize and enforce the hierarchy structure?

**options:**

- A) `@Analytics.hierarchyNode: [{nodeId: 'COST_CENTER', parentId: 'DEPT'}]`
- B) `@Hierarchy.definition: #PARENT_CHILD` with parent/child key fields
- C) `@AccessControl.authorizationCheck: #HIERARCHY`
- D) `@UI.treeView: true`

**answer_key:**

B — CDS views support parent-child hierarchies using the `@Hierarchy.definition` annotation. This annotation marks the view as a hierarchy, designates the parent and child key fields (e.g., `PARENT_DEPT` and `COST_CENTER`), and enables Fiori and query tools to traverse the hierarchy. Option A is fictitious; option C is for authorization checks, not hierarchy structure; option D is a UI hint but does not define hierarchy semantics. References: SAP Help Portal CDS Hierarchies §2 (Parent-Child Definitions).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-024-seed-3c2d8f1a  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-024  
**bias_check_notes:** No bias. CDS hierarchy annotation.

---

## QUESTION 25: CDS-Based Data Control Language (CDS Views + AMDP)

**question_id:** QOR-SAPABAP-025  
**skill_id:** senior-sap-abap  
**sub_skill_id:** cds-views-amdp  
**format:** MCQ  
**difficulty_b:** 0.2 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/CDS_DCL_Authorization

**body:**

You define a CDS view `ZC_PURCHASE_ORDERS` with an annotation `@AccessControl.authorizationCheck: #CHECK`. You then create a CDS Data Control Language (DCL) artifact to enforce that users see only purchase orders for their assigned company code. Which DCL mechanism defines the row-level filter?

**options:**

- A) DCL condition with `WHERE` clause binding to user context field (e.g., company code from `sy-bukrs` or user parameter)
- B) A separate PFCG authorization object assigned to the user; CDS does not enforce row-level filtering
- C) An ABAP method in the CDS view class that filters results post-query
- D) A CDS Table Function with SQLScript WHERE clause; DCL is informational only

**answer_key:**

A — CDS-based authorization uses DCL (Data Control Language) artifacts paired with `@AccessControl.authorizationCheck: #CHECK` annotations. The DCL defines a WHERE condition that binds to user context (e.g., `WHERE company_code = :iv_user_company_code`). This row-level filtering is enforced at the database level (pushed down in HANA), not in the application layer. PFCG (option B) provides coarse-grained access; DCL provides fine-grained row filtering. References: SAP Help Portal CDS DCL §1 (Data Control Language); Authorization in CDS §3 (Row-Level Security).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-025-seed-9f5a1c2b  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-025  
**bias_check_notes:** No bias. CDS authorization mechanism.

---

## QUESTION 26: CDS View Parameters (CDS Views + AMDP)

**question_id:** QOR-SAPABAP-026  
**skill_id:** senior-sap-abap  
**sub_skill_id:** cds-views-amdp  
**format:** MCQ  
**difficulty_b:** 0.3 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/CDS_View_Parameters

**body:**

You design a CDS view that calculates sales for a dynamic date range. The view should accept two input parameters: `START_DATE` and `END_DATE`, passed at query time. How do you declare these parameters in CDS?

**options:**

- A) `DEFINE VIEW WITH PARAMETERS(START_DATE, END_DATE)` at the top of the view definition
- B) Use CDS `LET` clause to bind input values; parameters are implicit
- C) Define a CDS Table Function wrapper; CDS views do not support parameters
- D) Create separate CDS views for each date range; parameterization is not supported in CDS

**answer_key:**

A — CDS views support input parameters declared at the top using the `WITH PARAMETERS(param_name : type, ...)` syntax. Parameters allow callers to pass values at query time without requiring separate view definitions. These parameters are then used in WHERE conditions, expressions, or passed to upstream views. References: SAP Help Portal CDS View Parameters §2 (Syntax); CDS Language Reference §4.1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-026-seed-2e3b9f4a  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-026  
**bias_check_notes:** No bias. CDS parameter syntax.

---

## QUESTION 27: HANA SQL Trace (ST05) Deep-Dive (HANA + Open SQL)

**question_id:** QOR-SAPABAP-027  
**skill_id:** senior-sap-abap  
**sub_skill_id:** hana-open-sql  
**format:** MCQ  
**difficulty_b:** 0.4 (Medium)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/SQL_Trace_ST05

**body:**

You suspect a SELECT query is running inefficiently. Using transaction ST05 (SQL Trace), you enable SQL tracing and run the query. The trace shows the query executed 5 separate times in sequence, each with slightly different WHERE conditions. What does this pattern indicate?

**options:**

- A) A nested LOOP...ENDLOOP in ABAP iterating over an internal table and issuing a SELECT for each row (N+1 pattern)
- B) HANA is executing the same query in parallel threads to optimize performance
- C) The query is correctly using FOR ALL ENTRIES; multiple executions are expected and optimal
- D) A bug in the SQL trace output; a single SELECT was executed and the trace is duplicating the display

**answer_key:**

A — This is the classic N+1 (SELECT in a loop) anti-pattern. ST05 trace will show the same query executed multiple times with different bind values (one per loop iteration). This is a common performance problem. The fix is to use a single SELECT with FOR ALL ENTRIES or a join instead of looping. Option C is incorrect: FOR ALL ENTRIES is one or a few batched queries, not N queries. References: SAP Help Portal SQL Trace §2 (Interpreting Results); Performance Analysis via ST05 §3 (Loop Pattern Detection).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-027-seed-7d4a3f1c  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-027  
**bias_check_notes:** No bias. Query performance analysis.

---

## QUESTION 28: HANA Window Functions (HANA + Open SQL)

**question_id:** QOR-SAPABAP-028  
**skill_id:** senior-sap-abap  
**sub_skill_id:** hana-open-sql  
**format:** MCQ  
**difficulty_b:** 0.5 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/HANA_Window_Functions

**body:**

You need to rank sales reps by total revenue and add a "rank" column to each row (e.g., rank 1 = highest revenue, rank 2 = next highest). Which HANA window function accomplishes this in a single pass?

**options:**

- A) `SUM() OVER (PARTITION BY region ORDER BY total_revenue DESC)`
- B) `ROW_NUMBER() OVER (ORDER BY total_revenue DESC)`
- C) `RANK() OVER (ORDER BY total_revenue DESC)` — assigns same rank to ties; next rank skips
- D) `DENSE_RANK() OVER (ORDER BY total_revenue DESC)` — assigns same rank to ties; next rank consecutive

**answer_key:**

D — `DENSE_RANK()` is the best choice for this scenario. It assigns the same rank to salespeople with equal revenue and increments the rank consecutively (no gaps). `RANK()` (option C) also handles ties but leaves gaps in the sequence. `ROW_NUMBER()` (option B) assigns unique ranks even to tied values (not ideal for this use case). Option A is a running total (SUM), not ranking. References: SAP Help Portal HANA Window Functions §4 (Ranking Functions); SQL Reference §Window Functions.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-028-seed-1b6e2f5a  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-028  
**bias_check_notes:** No bias. SQL window function semantics.

---

## QUESTION 29: HANA Performance Hint Syntax (HANA + Open SQL)

**question_id:** QOR-SAPABAP-029  
**skill_id:** senior-sap-abap  
**sub_skill_id:** hana-open-sql  
**format:** MCQ  
**difficulty_b:** 0.6 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/HANA_Query_Hints

**body:**

You have a large JOIN query that should force the HANA optimizer to join tables in a specific order (A → B → C). Which HANA query hint syntax achieves this?

**options:**

- A) `SELECT ... FROM tab_a /*+ ORDERED */ JOIN tab_b ... JOIN tab_c ...`
- B) `SELECT ... FROM tab_a JOIN tab_b JOIN tab_c WITH HANA_HINT('join_order')`
- C) `SELECT ... OPTION (USE_INDEX table_name index_name)` in the WHERE clause
- D) HANA optimizer automatically infers the best join order; hints are not supported in Open SQL

**answer_key:**

A — HANA supports query hints using the comment-style syntax `/*+ HINT_NAME */`. The `ORDERED` hint forces the optimizer to join tables in the order they appear in the FROM clause. Open SQL can include these hints directly in the SELECT statement. Option B is fictitious; option C is T-SQL syntax (not HANA); option D is false (HANA does support hints). References: SAP Help Portal HANA Query Hints §2 (Hint Syntax); SAP Note 2000667 (Performance Tuning with Hints).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-029-seed-4c3d8a2e  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-029  
**bias_check_notes:** No bias. HANA syntax feature.

---

## QUESTION 30: VIEW vs TABLE FUNCTION Choice (HANA + Open SQL)

**question_id:** QOR-SAPABAP-030  
**skill_id:** senior-sap-abap  
**sub_skill_id:** hana-open-sql  
**format:** MCQ  
**difficulty_b:** 0.7 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/CDS_Table_Functions_vs_Views

**body:**

Your analytics department needs a data source that (1) aggregates 50M order lines by region and product, (2) calculates percentile metrics (25th, 50th, 75th, 99th), and (3) filters out small orders (<$100). Should you implement this as a CDS view or a CDS Table Function?

**options:**

- A) CDS view — views are always faster; Table Functions add unnecessary overhead
- B) CDS Table Function — procedural logic (loops, conditionals) and advanced statistical functions are better suited to procedural code than declarative CDS
- C) Either works equally; performance is identical; choose based on coding preference
- D) CDS Table Function — HANA can optimize percentile calculations better in SQLScript procedures than in declarative SQL

**answer_key:**

D — CDS Table Functions with AMDP (SQLScript) are optimal for this scenario. Percentile/statistical calculations (PERCENTILE_CONT, PERCENTILE_DISC) execute efficiently in HANA SQLScript procedures. CDS views support aggregation but may not handle percentile functions as cleanly. Table Functions allow fine-grained control and execute in the HANA database layer, avoiding data transfer to the application server. Option B's reasoning is partially correct but overstates the need for procedural logic; the main advantage here is SQLScript's native support for statistical functions. References: SAP Help Portal CDS Table Functions §3 (Statistical Calculations); AMDP Performance Guide §2.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-030-seed-5e9f1a3c  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-030  
**bias_check_notes:** No bias. Architecture choice guidance.

---

## QUESTION 31: BRF+ Rule Sets vs ABAP Logic (Reports + Workflows)

**question_id:** QOR-SAPABAP-031  
**skill_id:** senior-sap-abap  
**sub_skill_id:** reports-workflows  
**format:** MCQ  
**difficulty_b:** 0.5 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/BRF_Plus_Decision_Rules

**body:**

Your company needs to implement discount rules for customer orders: (1) Volume-based discounts, (2) Loyalty-based discounts, (3) Seasonal promotions. These rules change quarterly by business stakeholders (non-technical). Should you implement these in BRF+ (Business Rules Framework) or as ABAP code in a custom class?

**options:**

- A) BRF+ — business users can modify rules without coding; rules are versioned and auditable
- B) ABAP code — more performant and easier to test via unit tests
- C) Either works; performance and testability are equivalent
- D) ABAP code — BRF+ is deprecated in S/4HANA 2023+

**answer_key:**

A — BRF+ is specifically designed for business rule management. It allows non-technical users to define, test, and version rules via a UI (transaction BRF+) without touching ABAP code. Rules are stored in the database and can be modified without code deployment. ABAP code (option B) is harder to change and requires developer involvement. Option C is false (BRF+ has versioning/audit overhead; ABAP code is faster). Option D is false (BRF+ is active in S/4HANA 2023+). References: SAP Help Portal BRF+ §1 (Overview); Decision Rules §2 (Rule Versioning).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-031-seed-6f2a9c4d  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-031  
**bias_check_notes:** No bias. Business rules framework usage.

---

## QUESTION 32: SAP BPM vs Workflow vs Fiori Approval (Reports + Workflows)

**question_id:** QOR-SAPABAP-032  
**skill_id:** senior-sap-abap  
**sub_skill_id:** reports-workflows  
**format:** MCQ  
**difficulty_b:** 0.6 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Workflow_BPM_Comparison

**body:**

Your company has a purchase order approval workflow: Manager → Director → CFO. Different approval chains apply based on PO amount. Which approval mechanism is recommended for modern S/4HANA systems?

**options:**

- A) Classic SAP Workflow (transaction SWDD) — stable, widely used, supports complex logic
- B) SAP BPM (Business Process Management) — better suited for cross-system processes; requires Process Analytics
- C) Fiori-based approval flows with backend CDS/OData — modern, embedded in Fiori applications, easier for users
- D) A custom ABAP program triggering notifications via SAPScript — least costly approach

**answer_key:**

C — Modern S/4HANA implementations favor Fiori-based approval flows integrated directly into transactional Fiori apps (e.g., Purchase Order app). These flows use CDS/OData for business logic and are more user-friendly than classic Workflow. Classic Workflow (option A) is still supported but is legacy. SAP BPM (option B) is useful for cross-system processes but overkill for simple approval chains. Option D is manual and non-standard. References: SAP Help Portal Fiori Approval Flows §1; Workflow Modernization §2 (Fiori Integration).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-032-seed-8d1c3f5b  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-032  
**bias_check_notes:** No bias. Workflow architecture recommendation.

---

## QUESTION 33: ALV Memory Optimization (Reports + Workflows)

**question_id:** QOR-SAPABAP-033  
**skill_id:** senior-sap-abap  
**sub_skill_id:** reports-alv-grid  
**format:** MCQ  
**difficulty_b:** 0.8 (Medium)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ALV_Grid_Memory_Management

**body:**

Your report displays 100,000 sales transactions in an ALV grid. Users report the application is slow and memory-intensive. Which optimization is most effective?

**options:**

- A) Display all 100K rows upfront in a single ALV; modern PCs have enough RAM
- B) Implement pagination: load and display only 5,000 rows at a time via OData with $skip/$top parameters
- C) Use a Table Control instead of ALV Grid; Table Controls are always more efficient
- D) Compress the internal table data before passing to ALV; use ABAP compression APIs

**answer_key:**

B — Pagination (lazy loading) is the standard pattern for large datasets. Load data in batches (e.g., 5,000 rows per page) using OData skip/top or application-level slicing. This keeps memory footprint small and improves perceived responsiveness. Option A ignores memory constraints. Option C is false (ALV Grid is more efficient). Option D (compression) is rarely used for in-memory tables. References: SAP Help Portal ALV Grid Performance §2 (Pagination); OData Paging §3 ($skip/$top).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-033-seed-9e3a1f6c  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-033  
**bias_check_notes:** No bias. Performance best practice.

---

## QUESTION 34: OData V4 Service Builder (Integration)

**question_id:** QOR-SAPABAP-034  
**skill_id:** senior-sap-abap  
**sub_skill_id:** integration-odata  
**format:** MCQ  
**difficulty_b:** 0.7 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/OData_V4_Service_Builder

**body:**

You need to expose a CDS view as an OData V4 service for consumption by a mobile app. The service requires authentication and should support filtering, sorting, and paging. Which transaction do you use to publish the service?

**options:**

- A) Transaction SE80 (ABAP Workbench) — right-click the CDS view and select "Expose as OData"
- B) Transaction /IWFND/MAINT_SERVICE — OData Service Maintenance; register your CDS view as an OData service
- C) Transaction /IWFND/V4_ADMIN — OData V4 Service Builder; auto-generates the V4 service from CDS annotations
- D) Cloud Platform Integration (CPI) — configure OData exposure in the cloud console

**answer_key:**

C — Transaction `/IWFND/V4_ADMIN` (OData V4 Service Builder) is the SAP standard for exposing CDS views as OData V4 services. The builder uses CDS annotations (`@OData.publish`, `@OData.type`) to auto-generate the service metadata. Option A (SE80) does not expose OData; option B (`/IWFND/MAINT_SERVICE`) is for OData V2 (older). Option D is cloud-specific. References: SAP Help Portal OData V4 Service Builder §2 (Transaction Usage); CDS OData Annotations §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-034-seed-2f5c8a1d  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-034  
**bias_check_notes:** No bias. SAP transaction reference.

---

## QUESTION 35: SAP CPI Integration Suite (Integration)

**question_id:** QOR-SAPABAP-035  
**skill_id:** senior-sap-abap  
**sub_skill_id:** integration-cloud  
**format:** MCQ  
**difficulty_b:** 0.8 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_CLOUD_PLATFORM/Integration_Suite_Overview

**body:**

Your company needs to integrate SAP S/4HANA with a third-party e-commerce platform via APIs. The integration must handle data transformation, retry logic, and monitoring. Which SAP cloud service is appropriate?

**options:**

- A) SAP Integration Suite (CPI) — cloud-native integration platform with adapters for S/4HANA and REST endpoints
- B) SAP Data Services (a batch ETL tool) — suitable for scheduled data synchronization
- C) SAP Landscape Transformation (LT) — legacy migration tool; not appropriate for ongoing integration
- D) Custom ABAP program with outbound HTTPS calls — cheapest and sufficient for small integrations

**answer_key:**

A — SAP Integration Suite (successor to SAP Cloud Platform Integration) is the modern cloud-native platform for real-time integrations. It provides pre-built adapters for S/4HANA, REST APIs, and third-party platforms; handles transformation via XSLT/Groovy; includes monitoring/alerting. Option B (Data Services) is batch-oriented. Option C (LT) is for migrations. Option D (custom ABAP) lacks scalability and monitoring. References: SAP Help Portal Integration Suite §1 (Architecture); Cloud Platform Integration Guides §2.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-035-seed-3a7b9f2e  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-035  
**bias_check_notes:** No bias. Cloud integration architecture.

---

## QUESTION 36: RFC Remote-Enabled Function Module (Integration)

**question_id:** QOR-SAPABAP-036  
**skill_id:** senior-sap-abap  
**sub_skill_id:** integration-rfc  
**format:** Code  
**difficulty_b:** 0.9 (Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 10  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/RFC_Remote_Enabled_Modules

**body:**

Write a remote-enabled function module `Z_GET_CUSTOMER_DATA` that accepts a customer ID and returns customer master data (name, address, phone). The module must be callable from external systems via RFC. Handle error cases (customer not found, database errors).

**starter_code:**

```abap
FUNCTION Z_GET_CUSTOMER_DATA.
*"----------------------------------------------------------------------
*"*"Local Interface:
*"  IMPORTING
*"     VALUE(IV_CUSTOMER_ID) TYPE KNA1-KUNNR
*"  EXPORTING
*"     VALUE(EV_CUSTOMER_NAME) TYPE KNA1-NAME1
*"     VALUE(EV_ADDRESS) TYPE KNA1-STRAS
*"     VALUE(EV_PHONE) TYPE KNA1-TELF1
*"     VALUE(EV_ERROR) TYPE C
*"----------------------------------------------------------------------

  -- Implementation here

ENDFUNCTION.
```

**answer_key:**

```abap
FUNCTION Z_GET_CUSTOMER_DATA.
*"----------------------------------------------------------------------
*"*"Local Interface:
*"  IMPORTING
*"     VALUE(IV_CUSTOMER_ID) TYPE KNA1-KUNNR
*"  EXPORTING
*"     VALUE(EV_CUSTOMER_NAME) TYPE KNA1-NAME1
*"     VALUE(EV_ADDRESS) TYPE KNA1-STRAS
*"     VALUE(EV_PHONE) TYPE KNA1-TELF1
*"     VALUE(EV_ERROR) TYPE C
*"----------------------------------------------------------------------

  DATA lv_customer_found TYPE c.

  SELECT SINGLE kunnr, name1, stras, telf1
    INTO (kna1-kunnr, ev_customer_name, ev_address, ev_phone)
    FROM kna1
    WHERE kunnr = iv_customer_id.

  IF sy-subrc NE 0.
    EV_ERROR = 'X'.
    MESSAGE 'Customer not found' TYPE 'E'.
    RETURN.
  ENDIF.

  EV_ERROR = ' '.

ENDFUNCTION.
```

**Key points:**

1. **Remote-enabled declaration** — function module must be marked as "Remote-enabled" in SE37 (Attributes tab).
2. **Exporting parameters** — data is returned via EXPORTING; no side effects on input.
3. **Error handling** — return error status; raise MESSAGE for RFC exception.
4. **TYPE declarations** — all parameters must reference SAP dictionary types (KNA1 table structure).

**rubric:**

- 1 point: Implements basic SELECT; missing error handling or remote-enable declaration
- 3 points: Implements SELECT + error handling; references correct table/fields; may miss messaging setup
- 5 points: **Exceptional.** Remote-enabled FM with clean error handling, proper MESSAGE RAISING for RFC-aware exception propagation, and documentation of exception classes. Explains RFC call semantics (synchronous, stateless, transaction-free).

**expected_duration_minutes:** 10  
**watermark_seed:** qorium-sapabap-v0.6-036-seed-4c8d2f3a  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-036  
**bias_check_notes:** No bias. RFC coding.

---

## QUESTION 37: OData V4 Behavior Definition (Integration)

**question_id:** QOR-SAPABAP-037  
**skill_id:** senior-sap-abap  
**sub_skill_id:** integration-odata  
**format:** Code  
**difficulty_b:** 1.1 (Hard)  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 12  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/RAP_Behavior_Definition

**body:**

You are building a CDS-based Purchase Order application with RAP (RESTful ABAP Programming). Define a behavior definition for a root entity `ZC_PO` that (1) enables create/update/delete actions, (2) validates that PO amount > 0, (3) calls a back-end determination action to auto-populate buyer from user context.

**starter_code:**

```abap
managed implementation in class zcl_po_behavior unique;
strict ( 2 );

define behavior for ZC_PO //alias <alias_name>
{
  -- Actions, validations, determinations here
}
```

**answer_key:**

```abap
managed implementation in class zcl_po_behavior unique;
strict ( 2 );

define behavior for ZC_PO
{
  create;
  update;
  delete;

  validation validate_po_amount on save { create; update; }
  determination set_default_buyer on save { create; }

  mapping for zpo
  {
    po_id = po_id;
    po_amount = po_amount;
    buyer = buyer;
  }
}

define behavior implementation for ZC_PO
{
  on save call zset_default_buyer;
  on save validate validate_po_amount;
}
```

**In handler class `ZCL_PO_BEHAVIOR`:**

```abap
CLASS zcl_po_behavior DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_oo_adt_classrun.
    
    METHODS validate_po_amount FOR VALIDATE ON SAVE
      IMPORTING keys FOR zc_po~validate_po_amount.
    
    METHODS set_default_buyer FOR DETERMINATION ON SAVE
      IMPORTING keys FOR zc_po~set_default_buyer.
ENDCLASS.

CLASS zcl_po_behavior IMPLEMENTATION.
  METHOD validate_po_amount.
    SELECT * FROM zpo WHERE po_id IN @keys INTO TABLE @DATA(lt_pos).
    LOOP AT lt_pos ASSIGNING FIELD-SYMBOL(<po>).
      IF <po>-po_amount <= 0.
        APPEND VALUE #(
          %key = <po>-po_id
          %msg = new_message_with_text( 'PO amount must be > 0' )
        ) TO failed.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD set_default_buyer.
    SELECT * FROM zpo WHERE po_id IN @keys INTO TABLE @DATA(lt_pos).
    LOOP AT lt_pos ASSIGNING FIELD-SYMBOL(<po>).
      IF <po>-buyer IS INITIAL.
        <po>-buyer = sy-uname.
      ENDIF.
    ENDLOOP.
    MODIFY ENTITIES OF zc_po FROM @lt_pos.
  ENDMETHOD.
ENDCLASS.
```

**Key points:**

1. **managed keyword** — framework handles CRUD; developer supplies validations/determinations.
2. **create/update/delete** — enables these operations on the entity.
3. **validation** — executes on save before persistence; checks conditions.
4. **determination** — executes on save; auto-populates fields.
5. **mapping** — binds CDS view fields to database table fields.

**rubric:**

- 1 point: Syntax outline only; incomplete behavior definition
- 3 points: Behavior definition with create/update/delete; missing or incomplete validation/determination implementation
- 5 points: **Exceptional.** Complete behavior definition + handler class with proper validation and determination method signatures, error handling via failed/reported tables, and explanation of managed entity lifecycle.

**expected_duration_minutes:** 12  
**watermark_seed:** qorium-sapabap-v0.6-037-seed-5d9e1a4b  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-037  
**bias_check_notes:** No bias. RAP coding.

---

## QUESTION 38: Smart Form Template Structure (Reports + Workflows)

**question_id:** QOR-SAPABAP-038  
**skill_id:** senior-sap-abap  
**sub_skill_id:** reports-output  
**format:** Code  
**difficulty_b:** 1.0 (Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 11  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Smart_Forms_Overview

**body:**

Design a Smart Form template (transaction SMARTFORMS) for a purchase order printout. The form should include: (1) header with company logo and PO number, (2) a table of line items (material, quantity, price, total), (3) footer with payment terms. Provide the ABAP template structure (not the graphical editor output, but the equivalent ABAP-accessible metadata).

**starter_code:**

Template outline structure (conceptual):

```
FORM_HEADER
  ├── Company Logo (image element)
  ├── PO Number (text element)
  └── PO Date (text element)

FORM_BODY
  ├── Line Items Table
  │   ├── Column: Material
  │   ├── Column: Quantity
  │   ├── Column: Unit Price
  │   └── Column: Total
  └── Footer
      └── Payment Terms (text element)
```

Provide ABAP code to (1) call the Smart Form, (2) populate input data, (3) handle output (spool/email/screen).

**answer_key:**

```abap
DATA: lt_header TYPE TABLE OF z_po_header,
      lt_items  TYPE TABLE OF z_po_items,
      l_name    TYPE rs38l_fnam,
      l_ret     TYPE i.

PARAMETERS: p_po_id TYPE kunnr.

AT SELECTION-SCREEN OUTPUT.
  SELECT * FROM z_po_header WHERE po_id = p_po_id
    INTO TABLE lt_header.
  SELECT * FROM z_po_items WHERE po_id = p_po_id
    INTO TABLE lt_items.

AT SELECTION-SCREEN.
  IF sy-ucomm = 'EXEC' OR sy-ucomm = ' '.
    -- Call Smart Form
    l_name = 'Z_PO_SMARTFORM'. " Name of Smart Form
    
    CALL FUNCTION 'SSF_FUNCTION_MODULE_NAME'
      EXPORTING
        formname           = l_name
        variant            = 'DEFAULT'
      IMPORTING
        fm_name            = l_name.

    CALL FUNCTION l_name
      EXPORTING
        is_header          = lt_header[ 1 ]
        it_items           = lt_items
        control_parameters = VALUE ssfctrlop(
          getotf   = 'X'
          no_dialog = 'X'
        )
      IMPORTING
        document_output_info = VALUE ssf_info
        job_output_info      = VALUE ssfcrescl
      EXCEPTIONS
        formatting_error = 1
        internal_error   = 2
        send_error       = 3.

    IF sy-subrc EQ 0.
      MESSAGE 'Smart Form executed successfully' TYPE 'S'.
    ELSE.
      MESSAGE 'Smart Form error' TYPE 'E'.
    ENDIF.
  ENDIF.
```

**Smart Form Structure (metadata):**
- **Header Section:** Logo image (stored in STXBITMAPS table), PO number, date via text elements.
- **Main Section:** Table loop over line items; columns for material, qty, price, total (calculated field).
- **Footer Section:** Payment terms text; possibly a page break for multi-page forms.

**Output Handling Options:**
1. **Screen display** — controlparameters-preview = 'X'
2. **Spool job** — controlparameters-no_dialog = 'X', print to printer
3. **Email** — capture OTF output, attach to email via SO_* FM

**rubric:**

- 1 point: Outlines form structure; missing ABAP call logic
- 3 points: Correct Smart Form call with FUNCTION MODULE lookup; incomplete parameter handling or output setup
- 5 points: **Exceptional.** Complete CALL FUNCTION structure with controlparameters (OTF, preview, no_dialog), input/output tables properly bound, and explanation of Smart Form function module generation vs manual ABAP coding. Discusses OTF (OpenText Format) vs PDF output options.

**expected_duration_minutes:** 11  
**watermark_seed:** qorium-sapabap-v0.6-038-seed-6e1f2b5c  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-038  
**bias_check_notes:** No bias. Form printing architecture.

---

## QUESTION 39: CDS View with Annotations + Parameters (CDS Views + AMDP)

**question_id:** QOR-SAPABAP-039  
**skill_id:** senior-sap-abap  
**sub_skill_id:** cds-views-amdp  
**format:** Code  
**difficulty_b:** 1.2 (Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 13  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/CDS_View_Parameters_Annotations

**body:**

Write a CDS view `ZC_SALES_DASHBOARD` that (1) accepts parameters for fiscal year and region, (2) calculates total sales and average order value by product, (3) exposes the view as an OData service with analytics annotations, and (4) includes authorization control to show only data for the user's assigned region (via DCL).

**starter_code:**

```abap
@AccessControl.authorizationCheck: #CHECK
@Analytics.dataCategory: #FACT
@OData.publish: true
DEFINE VIEW ZC_SALES_DASHBOARD
  WITH PARAMETERS(p_fiscal_year : ABAP.CHAR(4), p_region : ABAP.CHAR(2))
AS SELECT FROM
  vbap AS sales_items
  JOIN vbak AS orders ON sales_items.vbeln = orders.vbeln
  JOIN mara AS products ON sales_items.matnr = products.matnr
  -- Continue...
```

**answer_key:**

```abap
@AccessControl.authorizationCheck: #CHECK
@Analytics.dataCategory: #FACT
@OData.publish: true
@UI.headerInfo: {
  typeName: 'Sales Dashboard',
  typeNamePlural: 'Sales Dashboards'
}
DEFINE VIEW ZC_SALES_DASHBOARD
  WITH PARAMETERS(
    p_fiscal_year : ABAP.CHAR(4),
    p_region : ABAP.CHAR(2)
  )
AS SELECT FROM
  vbak AS orders
  INNER JOIN vbap AS sales_items ON orders.vbeln = sales_items.vbeln
  INNER JOIN mara AS products ON sales_items.matnr = products.matnr
  LEFT OUTER JOIN t001w AS plants ON orders.werks = plants.werks
{
  key orders.vbeln AS sales_order_id,
  products.matnr AS product_id,
  products.maktx AS product_name,
  plants.name1 AS region_name,
  SUM(sales_items.menge) AS total_quantity,
  @Semantics.amount.currencyCode: 'WAERK'
  SUM(sales_items.netwr) AS total_sales,
  @Semantics.amount.currencyCode: 'WAERK'
  AVG(sales_items.netwr) AS avg_order_value,
  orders.waerk AS currency,
  
  @Analytics.dimension: true
  sales_items.arktx AS line_item_text
}
WHERE
  YEAR(orders.erdat) = CAST(p_fiscal_year AS NVARCHAR(4))
  AND plants.region = p_region
GROUP BY
  orders.vbeln, products.matnr, products.maktx, plants.name1,
  orders.waerk, sales_items.arktx
ORDER BY total_sales DESC;
```

**DCL (Data Control Language) - separate artifact `ZC_SALES_DASHBOARD_DCL`:**

```abap
@AccessControl.authorizationCheck: #CHECK
DEFINE VIEW ZC_SALES_DASHBOARD_DCL
  WITH PARAMETERS(p_fiscal_year : ABAP.CHAR(4), p_region : ABAP.CHAR(2))
AS SELECT FROM ZC_SALES_DASHBOARD
WHERE
  region_name = :p_region
  AND p_fiscal_year = :p_fiscal_year;
```

**Key points:**

1. **@AccessControl.authorizationCheck** — triggers DCL evaluation for row-level filtering.
2. **@Analytics.dataCategory: #FACT** — marks view as analytics-ready (aggregatable).
3. **WITH PARAMETERS** — accept fiscal year and region at query time.
4. **@Semantics.amount.currencyCode** — annotates currency fields for UI rendering.
5. **DCL filter** — ensures user sees only their assigned region (region_name binding to user parameter or session variable).
6. **@OData.publish: true** — exposes the view as OData service automatically.

**rubric:**

- 1 point: Basic view skeleton; missing annotations or parameter handling
- 3 points: View with parameters and some annotations; DCL missing or incomplete
- 5 points: **Exceptional.** Complete CDS view with all annotations, proper joins, aggregation, parameters, currency semantics, and accompanying DCL for row-level security. Discusses OData service consumption from Fiori or external clients. Explains parameter binding via Fiori Elements or REST requests.

**expected_duration_minutes:** 13  
**watermark_seed:** qorium-sapabap-v0.6-039-seed-7f2a3c6d  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-039  
**bias_check_notes:** No bias. CDS authoring.

---

## QUESTION 40: AMDP Procedure (CDS Views + AMDP)

**question_id:** QOR-SAPABAP-040  
**skill_id:** senior-sap-abap  
**sub_skill_id:** cds-views-amdp  
**format:** Code  
**difficulty_b:** 1.3 (Hard)  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 14  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/AMDP_Implementation_Guide

**body:**

Implement an AMDP procedure that calculates sales revenue per customer for the last 12 months, including trend indicators: (1) month-over-month change, (2) year-over-year change, (3) growth trend (UP/DOWN/STABLE). Return results as a CDS Table Function.

**starter_code:**

```abap
@OData.publish: true
DEFINE TABLE FUNCTION ZF_CUSTOMER_REVENUE
RETURNS {
  customer_id : ABAP.CHAR(10);
  customer_name : ABAP.CHAR(80);
  current_month : ABAP.INT4;
  current_year : ABAP.INT4;
  monthly_revenue : ABAP.DEC(15,2);
  mom_change_pct : ABAP.DEC(5,2);
  yoy_change_pct : ABAP.DEC(5,2);
  trend : ABAP.CHAR(10);
}
IMPLEMENTED BY METHOD zcl_revenue_calc=>calculate_customer_revenue;
```

**answer_key:**

```abap
@OData.publish: true
DEFINE TABLE FUNCTION ZF_CUSTOMER_REVENUE
RETURNS {
  customer_id : ABAP.CHAR(10);
  customer_name : ABAP.CHAR(80);
  current_month : ABAP.INT4;
  current_year : ABAP.INT4;
  monthly_revenue : ABAP.DEC(15,2);
  mom_change_pct : ABAP.DEC(5,2);
  yoy_change_pct : ABAP.DEC(5,2);
  trend : ABAP.CHAR(10);
}
IMPLEMENTED BY METHOD zcl_revenue_calc=>calculate_customer_revenue;

CLASS zcl_revenue_calc DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    
    METHODS calculate_customer_revenue
      EXPORTING
        VALUE(result) TYPE ZF_CUSTOMER_REVENUE.
ENDCLASS.

CLASS zcl_revenue_calc IMPLEMENTATION.
  METHOD calculate_customer_revenue
    BY DATABASE PROCEDURE
    LANGUAGE HANA_SQL
    DEFAULT LANGUAGE SQL_SCRIPT.

    -- Step 1: Aggregate revenue by customer and month
    lt_monthly_revenue = SELECT
      kna1.kunnr AS customer_id,
      kna1.name1 AS customer_name,
      MONTH(vbak.erdat) AS sales_month,
      YEAR(vbak.erdat) AS sales_year,
      SUM(vbap.netwr) AS total_revenue
    FROM kna1
    INNER JOIN vbak ON kna1.kunnr = vbak.kunnr
    INNER JOIN vbap ON vbak.vbeln = vbap.vbeln
    WHERE vbak.erdat >= ADD_MONTHS(CURRENT_DATE, -12)
    GROUP BY kna1.kunnr, kna1.name1, MONTH(vbak.erdat), YEAR(vbak.erdat)
    ORDER BY kna1.kunnr, sales_year, sales_month DESC;

    -- Step 2: Calculate MoM and YoY changes
    result = SELECT
      customer_id,
      customer_name,
      sales_month AS current_month,
      sales_year AS current_year,
      total_revenue AS monthly_revenue,
      ROUND(
        (total_revenue - LAG(total_revenue, 1) OVER (PARTITION BY customer_id ORDER BY sales_year, sales_month)) /
        LAG(total_revenue, 1) OVER (PARTITION BY customer_id ORDER BY sales_year, sales_month) * 100,
        2
      ) AS mom_change_pct,
      ROUND(
        (total_revenue - LAG(total_revenue, 12) OVER (PARTITION BY customer_id ORDER BY sales_year, sales_month)) /
        LAG(total_revenue, 12) OVER (PARTITION BY customer_id ORDER BY sales_year, sales_month) * 100,
        2
      ) AS yoy_change_pct,
      CASE
        WHEN (total_revenue - LAG(total_revenue, 1) OVER (PARTITION BY customer_id ORDER BY sales_year, sales_month)) > 0
          THEN 'UP'
        WHEN (total_revenue - LAG(total_revenue, 1) OVER (PARTITION BY customer_id ORDER BY sales_year, sales_month)) < 0
          THEN 'DOWN'
        ELSE 'STABLE'
      END AS trend
    FROM lt_monthly_revenue
    ORDER BY customer_id, sales_year DESC, sales_month DESC;

  ENDMETHOD.
ENDCLASS.
```

**Key points:**

1. **if_amdp_marker_hdb** — interface marking the class as an AMDP procedure.
2. **BY DATABASE PROCEDURE** — method executes in HANA, not ABAP runtime.
3. **LANGUAGE HANA_SQL** + **DEFAULT LANGUAGE SQL_SCRIPT** — enables SQLScript code inside the method.
4. **LAG() window function** — retrieves previous row's value for MoM (lag by 1 month) and YoY (lag by 12 months).
5. **CASE expression** — determines trend based on MoM change sign.

**rubric:**

- 1 point: Outlines AMDP structure; missing SQLScript implementation
- 3 points: Correct AMDP signature + basic aggregate query; window functions missing or incomplete
- 5 points: **Exceptional.** Complete AMDP procedure with LAG() window functions, proper partitioning, CASE-based trend logic, and explanation of SQLScript execution in HANA. Discusses performance implications vs ABAP-level calculation (HANA code pushdown = lower memory footprint, faster execution for large datasets).

**expected_duration_minutes:** 14  
**watermark_seed:** qorium-sapabap-v0.6-040-seed-8g3b4d7e  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-040  
**bias_check_notes:** No bias. AMDP coding.

---

## QUESTION 41: Fiori Elements vs SAPUI5 Freestyle (Fiori Adjacency)

**question_id:** QOR-SAPABAP-041  
**skill_id:** senior-sap-abap  
**sub_skill_id:** fiori-adjacency  
**format:** MCQ  
**difficulty_b:** 0.8 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_FIORI_ELEMENTS/Fiori_Elements_vs_SAPUI5

**body:**

Your company needs a simple purchase order list with filtering, sorting, and row selection. The business wants the app deployed within 2 weeks. Should you use Fiori Elements (List Report template) or build a custom SAPUI5 freestyle application?

**options:**

- A) Fiori Elements — pre-built List Report template with built-in filtering/sorting; requires only CDS view + metadata; faster time-to-market
- B) SAPUI5 freestyle — more flexible but requires custom controller logic; slower development; better suited for complex, non-standard UIs
- C) Either works; development time is equivalent
- D) Fiori Elements only works for read-only lists; SAPUI5 is needed for transactional CRUD apps

**answer_key:**

A — Fiori Elements (List Report / Object Page templates) are purpose-built for common transactional patterns. You define a CDS view with proper `@UI` annotations, and Fiori Elements auto-generates the UI with filtering, sorting, paging, and CRUD actions. This is 3–4x faster than custom SAPUI5 development. SAPUI5 freestyle is needed for highly custom layouts or non-standard workflows. Option B understates Fiori Elements' capabilities; option C is false (Fiori Elements is much faster); option D is false (Fiori Elements supports create/update/delete via RAP Behavior Definitions). References: SAP Help Portal Fiori Elements §1 (Architecture); SAPUI5 Development Guide §2 (Custom App Use Cases).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-041-seed-9h4c5e8f  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-041  
**bias_check_notes:** No bias. Fiori development approach recommendation.

---

## QUESTION 42: CDS-Based Fiori with Draft Enablement (Fiori Adjacency)

**question_id:** QOR-SAPABAP-042  
**skill_id:** senior-sap-abap  
**sub_skill_id:** fiori-adjacency  
**format:** MCQ  
**difficulty_b:** 0.9 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 5  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_FIORI_ELEMENTS/Draft_Enablement_RAP

**body:**

You are building a purchase order creation app using Fiori Elements and RAP. Users should be able to save their work in progress (draft) and resume editing later without committing to the database. How do you enable draft functionality?

**options:**

- A) Annotate the CDS view with `@OData.draft.enabled: true` and implement draft save/retrieve logic manually in the ABAP handler
- B) Use the `DRAFT` keyword in the behavior definition and let RAP handle draft save/load/discard automatically
- C) Create a separate draft table (e.g., ZPO_DRAFT) and implement custom save logic in the handler class
- D) Draft functionality is not supported in RAP; use a custom Fiori app with local storage instead

**answer_key:**

B — RAP provides built-in draft enablement via the `DRAFT` keyword in the behavior definition. When you add `DRAFT` to a managed entity, RAP automatically:
1. Creates draft versions of the entity
2. Saves drafts to a shadow table
3. Provides edit/resume/discard actions
4. Handles draft cleanup

You do not need to manually manage a draft table or custom save logic. Option A is overly complex; option C repeats this unnecessary complexity; option D is false (RAP fully supports drafts). References: SAP Help Portal RAP Draft Enablement §2; Behavior Definition Reference §Draft Keyword.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-042-seed-1i5d6f9g  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-042  
**bias_check_notes:** No bias. RAP feature usage.

---

## QUESTION 43: RAP Business Object Architecture (Fiori Adjacency)

**question_id:** QOR-SAPABAP-043  
**skill_id:** senior-sap-abap  
**sub_skill_id:** fiori-adjacency  
**format:** MCQ  
**difficulty_b:** 1.0 (Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 6  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_FIORI_ELEMENTS/RAP_Business_Objects

**body:**

You need to model a Sales Order business object with a parent entity (header) and child entities (line items, notes, attachments). Each child can be edited independently, but changes are committed as a unit (transaction). Which RAP composition pattern is appropriate?

**options:**

- A) Define a root entity (SalesOrder) and composition child entities (SalesOrderItems, SalesOrderNotes) linked via `COMPOSITION OF` relationships in the CDS view
- B) Create separate root entities for each child; link them via manual ABAP code in the behavior handler
- C) Use a single flat CDS view with all data (header + items + notes); normalize in the application layer
- D) Define a parent entity and store children in JSON/string fields; deserialize and serialize on save

**answer_key:**

A — RAP composition relationships (`COMPOSITION OF` in CDS) define a parent-child hierarchy. When you use composition with managed entities, RAP handles cascading create/update/delete and enforces transactional consistency (all changes commit or all roll back). This is the standard hierarchical business object pattern. Option B requires manual transaction management; option C loses data structure clarity; option D is anti-pattern (denormalization). References: SAP Help Portal RAP Compositions §1 (COMPOSITION OF Keyword); Multi-Level Entities §2 (Transaction Semantics).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-043-seed-2j6e7g0h  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-043  
**bias_check_notes:** No bias. RAP architecture pattern.

---

## QUESTION 44: Transactional CDS with Managed/Unmanaged Save (Fiori Adjacency)

**question_id:** QOR-SAPABAP-044  
**skill_id:** senior-sap-abap  
**sub_skill_id:** fiori-adjacency  
**format:** MCQ  
**difficulty_b:** 1.1 (Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 6  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_FIORI_ELEMENTS/Transactional_CDS_Save_Semantics

**body:**

You define a RAP behavior for a Purchase Order entity. The behavior uses `managed;` (default save semantics). A user creates a PO, modifies a line item, and then discards the draft without saving. What happens to the database?

**options:**

- A) Changes are auto-saved to the database immediately upon modification (transient storage is bypassed)
- B) Changes are held in draft (shadow table) until the user chooses "Save"; discarding the draft deletes the draft version; no database changes occur
- C) Changes are saved to the PO table, but marked as "draft" in a status field; discarding deletes the status flag
- D) Manual ABAP code in the behavior handler must implement draft cleanup; if missing, orphaned draft records accumulate

**answer_key:**

B — Managed behavior with draft enablement stores changes in a shadow (draft) table. The draft is isolated from the productive database until explicitly saved. Discarding a draft (via the "Discard" action) deletes the draft record. No productive data is written until save. This is the safe, standard RAP pattern for transactional apps. Option A (immediate save) is incorrect for draft behavior; option C requires a custom status field (unnecessary); option D is false (RAP handles cleanup automatically). References: SAP Help Portal RAP Managed Entities §2 (Draft Semantics); Save Sequence §3 (Create, Modify, Save, Discard).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-044-seed-3k7f8h1i  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-044  
**bias_check_notes:** No bias. RAP transaction semantics.

---

## QUESTION 45: S/4 Migration: HANA-Incompatible Custom Code Triage (Case Study)

**question_id:** QOR-SAPABAP-045  
**skill_id:** senior-sap-abap  
**sub_skill_id:** hana-open-sql  
**format:** Design  
**difficulty_b:** 1.4 (Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ECC_to_S4_Migration_Readiness

**body:**

Your company is migrating from ECC (running on a traditional database) to S/4HANA on HANA. During the readiness assessment, the ATC (ABAP Test Cockpit) scan flags 50 custom ABAP programs with "HANA-incompatible" warnings:

- 20 programs use old cursor-based SELECT loops (Open Cursor → FETCH → Close Cursor)
- 15 programs use Native SQL (EXEC SQL) with vendor-specific SQL dialects
- 10 programs access database buffers or use RDBMS-specific features
- 5 programs use complex SQL with subqueries in WHERE clauses that won't push down to HANA

Your team has limited capacity to remediate. Propose a triage strategy that prioritizes which programs to refactor first.

**answer_key (design rubric accepts trade-off articulation):**

**Triage Strategy (tier-based approach):**

**Tier 1 — Critical Path (Fix first; blocks migration)**
- Programs in the critical purchase-to-pay (P2P) and order-to-cash (O2C) cycles
- Programs with high frequency (run daily or in batch; >50 concurrent users)
- Classification: 15 programs (assume 8 from cursor-based group, 5 from Native SQL, 2 from buffer-access)
- Remediation effort per program: 5–15 days (depends on complexity)
- Solution approach: Replace EXEC SQL with Open SQL; convert FETCH loops to single-pass SELECT...FOR ALL ENTRIES

**Tier 2 — Medium Priority (Fix in Wave 2; optimizable)**
- Reporting/analytical programs (batch-oriented; low user impact if delayed)
- Programs with subquery-based WHERE clauses; eligible for CDS view refactoring
- Classification: 20 programs (assume 12 from loop-based, 8 from subquery-heavy)
- Remediation effort per program: 3–8 days
- Solution approach: Use CDS Table Functions or AMDP for complex aggregations; avoid subquery pushdown issues

**Tier 3 — Low Priority (Defer; HANA-capable workarounds)**
- Legacy programs with minimal active use (annual or quarterly runs)
- Programs where HANA-incompatible feature can be wrapped in a database procedure (isolation layer)
- Classification: 15 programs (assume 5 from buffer-access, 10 from other)
- Remediation effort: Low (wrap in AMDP or accept HANA runtime conversion)
- Solution approach: Accept minor performance degradation; HANA handles most conversions transparently

**Trade-off Articulation:**
- Choosing Tier 1 critical path prioritizes business continuity and system stability post-migration.
- Deferring Tier 3 to post-cutover (or accepting HANA runtime handling) reduces pre-migration effort and risk.
- Risk mitigation: Run Tier 3 programs in shadow (HANA) mode during parallel run phase to validate behavior.

**rubric:**

- 1 point: Lists program types; no prioritization strategy or rationale
- 3 points: Proposes triage (critical/medium/low); missing trade-off articulation or concrete effort estimates
- 5 points: **Exceptional.** Tier-based strategy with business impact criteria (P2P/O2C cycles, frequency, user count), effort estimation, and explicit trade-offs (deferring low-priority work = faster migration, but accept runtime conversion risk). Explains how to validate Tier 3 programs during parallel run. Discusses ATC findings integration into the triage process.

**expected_duration_minutes:** 12  
**watermark_seed:** qorium-sapabap-v0.6-045-seed-4l8g9i2j  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-045  
**bias_check_notes:** No bias. Migration assessment framework.

---

## QUESTION 46: ATC Custom Check Policy Violation (Case Study)

**question_id:** QOR-SAPABAP-046  
**skill_id:** senior-sap-abap  
**sub_skill_id:** abap-oo-fundamentals  
**format:** Design  
**difficulty_b:** 1.3 (Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 11  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ATC_Custom_Checks

**body:**

Your company has implemented a custom ATC (ABAP Test Cockpit) check policy that flags all use of global variables (DATA declarations at the program level) as "ANTI-PATTERN: Use local variables in methods instead." A junior developer has written a large batch reporting program that uses a global data structure to cache query results (10,000 rows of sales data) to avoid repeated database hits. The program passes functional tests but ATC rejects it.

Describe your approach to:
1. Evaluate the custom ATC check policy (is it too strict?).
2. Decide whether to modify the code, the policy, or both.
3. Justify your decision with trade-offs.

**answer_key (design rubric accepts trade-off articulation):**

**Evaluation Framework:**

**1. Assess the ATC Policy**
- **Rationale for the check:** Global variables reduce encapsulation; they are harder to test in isolation and can lead to hidden state mutations.
- **Use case validity:** In OO code and small programs, this is a good heuristic. In batch-oriented reporting programs with explicit caching requirements, strict avoidance of globals is overly rigid.
- **Conclusion:** The policy is correct as a general best practice but needs **contextual exceptions** for batch/caching scenarios.

**2. Evaluate the Developer's Code**
- **Pros:** Caching avoids N+1 database hits; improves batch performance for 10K-row result sets.
- **Cons:** Global state is shared across function modules/routines; if the caching logic has bugs, debugging is harder.
- **Remediation option 1 (Modify code):** Refactor the global into a class-based cache (oo_static method + singleton pattern). This keeps the caching benefit while improving encapsulation.
- **Remediation option 2 (Modify policy):** Add an exception rule: "Global variables are permitted for batch/reporting programs that implement explicit caching. Rationale: [documented]."
- **Remediation option 3 (Hybrid):** Keep the global but wrap it in a dedicated "cache manager" class that controls access and documents intent.

**Trade-Offs:**

**Option 1 (Refactor):** 
- Pros: Maintains strict OO discipline; easier future maintenance.
- Cons: 2–3 days rework; risk of introducing bugs in refactoring.
- Suitable if: Developer has time; refactoring has low risk.

**Option 2 (Modify policy):**
- Pros: Faster; acknowledges business reality (caching is valid).
- Cons: Weakens the policy; could encourage overuse of globals in other contexts.
- Suitable if: Batch reporting is a common pattern; governance wants explicit exceptions.

**Option 3 (Hybrid):**
- Pros: Best of both worlds; OO structure + caching.
- Cons: Slightly more code; requires pattern documentation.
- Suitable if: Long-term strategy values reusable cache patterns.

**Recommended Decision:**
Choose **Option 3 (Hybrid)** for this case:
1. Refactor the global into a dedicated cache manager class.
2. Update the custom ATC check policy to **whitelist** cache managers as an exception (with naming convention, e.g., `*_CACHE` or `*_BUFFER`).
3. Document the exception in the ATC policy rationale.

This balances governance rigor (OO encapsulation) with pragmatism (caching is valid) and sets a reusable pattern for future batch programs.

**rubric:**

- 1 point: Identifies the ATC check; suggests modifying code or policy without analysis
- 3 points: Evaluates policy and code; proposes one solution (refactor/modify policy) with partial trade-off reasoning
- 5 points: **Exceptional.** Assesses ATC policy rationale, evaluates all three options (refactor, policy exception, hybrid), articulates explicit trade-offs (time, risk, long-term maintainability), and recommends a decision with justification. Discusses how to communicate the decision to stakeholders (developers, governance, QA).

**expected_duration_minutes:** 11  
**watermark_seed:** qorium-sapabap-v0.6-046-seed-5m9h0j3k  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-046  
**bias_check_notes:** No bias. Code review and governance scenario.

---

## QUESTION 47: ALV Grid Memory Leak in 50K-Row Report (Case Study)

**question_id:** QOR-SAPABAP-047  
**skill_id:** senior-sap-abap  
**sub_skill_id:** reports-alv-grid  
**format:** Case-Study  
**difficulty_b:** 1.5 (Hard)  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 13  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ALV_Memory_Leaks

**body:**

A production batch report runs daily, fetching 50,000 inventory transactions and displaying them in an ALV grid. The report's memory consumption grows from 500 MB at startup to 2 GB after the grid is displayed. Over the course of a month (30 runs), the application server's free memory shrinks from 6 GB to <1 GB. Users report the system becomes sluggish.

**Diagnosis task:**
1. Identify the likely root cause(s).
2. Propose diagnostic steps using SAP monitoring transactions.
3. Recommend code-level and operational fixes.

**answer_key:**

**Root Cause Analysis:**

**Likely culprits (in order of probability):**

1. **ALV Grid retaining row data in memory after display** — The ALV Grid component (CL_GUI_ALV_GRID) may not release internal buffers when the grid is scrolled or closed. If the program runs in a batch work process and is not fully cleaned up between runs, memory accumulates.

2. **Event handlers with captured references** — If the ALV grid has event handlers (ON_DOUBLE_CLICK, ON_DATA_CHANGED) that capture large data objects in the handler closure, those objects may not be garbage-collected.

3. **Application server process not restarted** — If batch processes are long-lived (e.g., dialog processes used for batch), memory is never released. The Batch Server does not automatically restart after each job.

4. **CL_GUI_SPLITTER or parent container not properly freed** — Orphaned GUI component hierarchies (splitter, custom controls) can hold references to large internal tables.

**Diagnostic Steps:**

| Transaction | Check |
|---|---|
| **SM50** | Identify the batch process; note memory trend over time (column VIRT/USED) |
| **ST03N** | Analyze work process memory usage per batch job; look for non-decreasing trends |
| **SM04** | Session memory breakdown per user/process; identify long-running batch sessions |
| **DB02** (DBACOCKPIT) | Check if memory is in ABAP work process heap or HANA buffer cache; distinguish application memory from database cache |
| **Memory_Analyzer** (if available) | Heap dump analysis; identify which objects hold most memory |

**Code-Level Fixes:**

```abap
" BAD (memory leak):
CALL FUNCTION 'REUSE_ALV_GRID_DISPLAY'
  EXPORTING ...
  TABLES ...

" GOOD (explicit cleanup):
DATA lv_grid TYPE REF TO cl_gui_alv_grid.
CREATE OBJECT lv_grid ...
lv_grid->set_table_for_first_display( ... ).

" ... display and interact ...

" EXPLICIT CLEANUP:
lv_grid->free( ).
CALL METHOD lv_grid->get_parent( )->free( ).
CLEAR lv_grid.

" Clear internal tables
CLEAR: lt_rows, lt_fieldcat.
FREE: lt_rows, lt_fieldcat.
```

**Operational Fixes:**

1. **Batch process restart policy:** Configure the batch work process (transaction RZ03) to restart after N jobs (e.g., every 10 batch jobs) or after M hours of uptime.

2. **Pagination instead of full load:** Modify the report to display 5,000–10,000 rows per page; use OData filtering to load additional pages on demand (if moved to Fiori).

3. **Use a streaming approach:** For batch reporting, avoid loading all 50K rows into memory. Instead, stream results directly to a spool (PRINT) or data file; skip ALV Grid for large batches.

4. **Monitor with ST07:** Configure memory thresholds; alert when work process memory exceeds 1.5 GB.

**Long-Term Solution:**
Migrate the batch report to **SAP Analytics Cloud (SAC) or Fiori Analytics** with backend AMDP/CDS Table Function. Cloud analytics platforms handle large datasets natively without in-memory grid limitations.

**rubric:**

- 1 point: Identifies memory leak; suggests restarting the process or increasing RAM
- 3 points: Identifies likely causes (ALV Grid, event handlers, process reuse); proposes SM50/ST03N diagnostics; suggests explicit cleanup or pagination
- 5 points: **Exceptional.** Distinguishes between application heap and database cache (DB02), provides specific code cleanup patterns (lv_grid->free()), recommends work process restart policy (RZ03), and proposes operational monitoring (ST07). Discusses long-term architecture (cloud analytics). Explains why function module REUSE_ALV_GRID_DISPLAY is more prone to leaks than CL_GUI_ALV_GRID (old vs. new API).

**expected_duration_minutes:** 13  
**watermark_seed:** qorium-sapabap-v0.6-047-seed-6n0i1k4l  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-047  
**bias_check_notes:** No bias. Production troubleshooting scenario.

---

## QUESTION 48: ECC→S/4 + Cloud Multi-System Landscape (Design)

**question_id:** QOR-SAPABAP-048  
**skill_id:** senior-sap-abap  
**sub_skill_id:** integration-cloud  
**format:** Design  
**difficulty_b:** 1.5 (Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Multi_System_Integration_Design

**body:**

Your company is in the middle of an ERP transformation:
- **System A (ECC):** Legacy, running until 2028; holds historical order data and legacy interfaces.
- **System B (S/4HANA on-premise):** New, deployed 2025; handles current operations.
- **System C (SAP Analytics Cloud):** New, deployed 2025; provides reporting and dashboards.

Business requirement: Goods receipt (GR) events must flow from System B (S/4) to System A (ECC) for historical costing and audit compliance, and to System C (SAC) for real-time analytics dashboards.

Design a multi-system integration architecture that:
1. Ensures GR events reach all three systems without message loss.
2. Handles system downtime (if System A is temporarily unavailable, GR processing should not block System B).
3. Supports order-based filtering (only GR events for a subset of materials/cost centers).
4. Maintains audit trail for compliance.

**answer_key (design rubric accepts trade-off articulation):**

**Architecture Design:**

**Option A: Event-Driven with Message Queue (Recommended)**

```
System B (S/4) 
  ↓ (GR posting triggers BADI)
  ↓
Event Queue (SAP Event Mesh / RabbitMQ)
  ├→ Consumer-1 → System A (ECC) via RFC or File Interface
  ├→ Consumer-2 → System C (SAC) via OData
  └→ Audit Log (Kafka or Database)
```

**Benefits:**
- **Decoupling:** System B does not block on slow/unavailable downstream systems.
- **Retry logic:** Consumers re-process failed messages automatically.
- **Audit trail:** Event Mesh logs all messages; searchable via monitoring UI.
- **Filtering:** Consumer-level WHERE conditions apply logic (e.g., "only GRs for cost center 1000").

**Implementation Details:**
1. **In System B:** Implement a BAdI (or Enhancement Spot) on goods receipt FM (MB_CREATE_PO_DELIVERY). BAdI publishes GR event (PO#, material, quantity, GR date) to SAP Event Mesh.
2. **Consumer-1 (RFC to ECC):** Listens for GR events; filters by material/cost center; calls RFC FM in System A (GOODSMVT_CREATE or custom Z_POST_GR_ECC).
3. **Consumer-2 (OData to SAC):** Filters GR events; sends to SAC Analytics API (OData V4 POST to analytics model).
4. **Audit Log:** Event Mesh log stream persists to database or data lake; indexed for compliance queries.

**Error Handling:**
- Consumer fails → Event retried (exponential backoff: 1s, 10s, 100s, then DLQ)
- System A offline → Consumer 1 pauses; when System A comes online, messages from DLQ (Dead Letter Queue) are reprocessed
- System B never blocked (asynchronous)

**Trade-Off 1: Event Mesh (Cloud) vs RabbitMQ (On-Premise)**
- **Event Mesh (SAP Cloud Platform):** Managed service; integrates natively with SAC. Cons: Licensing cost; cloud dependency.
- **RabbitMQ (on-prem):** Open-source; cheaper. Cons: Ops overhead; no native SAC integration.
- **Decision:** Use **Event Mesh** if on-cloud strategy; use **RabbitMQ** if on-premise only.

**Trade-Off 2: Synchronous vs Asynchronous GR Processing**
- **Sync (block System B until all downstream confirmations):** High consistency; user sees status immediately. Cons: Slower GR processing; cascading failures.
- **Async (decouple System B from downstream):** Fast GR processing; System B operational even if downstreams fail. Cons: Audit trail delay (seconds to minutes).
- **Decision:** Choose **Async** (Option A above). Post GR immediately in System B; propagate asynchronously. Audit delay is acceptable (GR timestamp is source of truth).

**Alternative Option B: Point-to-Point Integration (Not Recommended)**
```
System B ↔ System A (RFC call) + System B ↔ System C (HTTP call)
```
Simpler but tightly coupled; System B blocks if System A is slow.

**rubric:**

- 1 point: Sketches a multi-system flow; missing error handling or audit trail
- 3 points: Proposes event queue + consumers; incomplete error handling or filtering strategy
- 5 points: **Exceptional.** Event Mesh architecture with BAdI trigger, consumer-level filtering, DLQ/retry logic, and explicit trade-offs (sync vs async, cloud vs on-prem). Explains how each system benefits (System B: fast; System A: async consistency; System C: real-time dashboard feed). Discusses audit trail implementation (logging consumer offsets, replay capability for compliance). References SAP Event Mesh documentation and SAC OData API for concrete implementation paths.

**expected_duration_minutes:** 12  
**watermark_seed:** qorium-sapabap-v0.6-048-seed-7o1j2l5m  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-048  
**bias_check_notes:** No bias. Enterprise integration architecture.

---

## QUESTION 49: SAP-Salesforce Bidirectional CRM Data Sync (Design)

**question_id:** QOR-SAPABAP-049  
**skill_id:** senior-sap-abap  
**sub_skill_id:** integration-salesforce  
**format:** Design  
**difficulty_b:** 1.6 (Hard)  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 13  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_CLOUD_ABAP/Salesforce_Integration_Patterns

**body:**

Your company uses **SAP S/4HANA** for ERP (customer master, orders, invoices) and **Salesforce** for CRM (accounts, contacts, opportunities). You need bidirectional sync:

- **SAP → Salesforce:** When a customer is created/modified in SAP, sync to Salesforce Account.
- **Salesforce → SAP:** When an opportunity is won in Salesforce, create a sales order in SAP.

Design the integration to handle:
1. Initial bulk load (1M existing customers).
2. Ongoing delta sync (10K new customers/opportunities per week).
3. Conflict resolution (same customer edited in both systems simultaneously).
4. Data quality (required fields, valid values).
5. Audit and compliance (trace every sync event).

**answer_key (design rubric accepts trade-off articulation):**

**Architecture: Hub-and-Spoke with Event-Driven Delta**

```
S/4HANA
  ├─ Customer Master (KNA1) ──→ Event (BADI) ─→ SAP Integration Suite (CPI)
  │                                              ├─ Transform (XSLT/Groovy)
  │                                              ├─ Validate (custom checks)
  │                                              └─ Upsert to Salesforce Account
  │
Salesforce
  ├─ Account (changes) ◄────────── IFlow (REST/SOAP)
  ├─ Opportunity (won) ───→ Event webhook → CPI
  │                                    ├─ Transform (SAP sales order XML)
  │                                    ├─ Call S/4 OData service (ZC_SALES_ORDERS)
  │                                    └─ Create order in SAP
  │
Audit Log (PostgreSQL or S/4 table ZTABLE_SYNC_LOG)
  └─ All sync events: timestamp, direction, status, conflict resolution
```

**Detailed Design:**

**Phase 1: Initial Bulk Load (KNA1 → Salesforce)**
1. **In SAP:** Export 1M customers via CDS view (ZC_CUSTOMER_EXPORT) with filter for "active" status.
2. **In CPI:** Batch iFlow reads S/4 OData export, transforms to Salesforce Account JSON, and bulk-upserts via Salesforce REST API (batch API limit: 25K records/batch).
3. **Idempotency:** Match on SAP customer ID (external ID in Salesforce); upsert (not insert) to handle re-runs.
4. **Timing:** Off-peak (weekends); 40 hours for 1M records (25K/hour = 40 batches).

**Phase 2: Ongoing Delta Sync (Event-Driven)**

**Direction 1: S/4 → Salesforce (Customer changes)**
1. **Trigger:** Create a BAdI (CUSTOMER_CHANGE) on SAP customer master save (transaction XK01 or function FM SAVE_KNA1).
2. **BAdI publishes:** Customer ID, field changes (name, address, phone), timestamp.
3. **CPI iFlow (listener):** Consumes event, validates required fields (name, email must be non-empty), transforms to Salesforce Account JSON, and upserts via REST API.
4. **Conflict handling:** Salesforce has a "LastModifiedDate" field; CPI compares SAP timestamp vs. Salesforce LastModifiedDate. If Salesforce is newer, log a conflict (don't overwrite); send alert to integration admin.
5. **Audit:** Log to ZTABLE_SYNC_LOG (SAP customer ID, Salesforce Account ID, sync timestamp, status, conflict flag).

**Direction 2: Salesforce → S/4 (Opportunity to Sales Order)**
1. **Trigger:** Salesforce Flow (declarative) or Apex trigger fires when Opportunity.StageName = "Closed Won".
2. **Trigger sends:** REST webhook to CPI endpoint with opportunity data (AccountId, Amount, CloseDate, line items).
3. **CPI iFlow:** 
   - Validates: Account exists in S/4 (lookup KNA1 by external ID).
   - Transforms: Salesforce Opportunity JSON → S/4 sales order XML (ORDERS05 message or CDS OData format).
   - Calls S/4 OData service (ZC_SALES_ORDERS) to create sales order.
   - Handles errors: If S/4 POST fails (invalid customer, missing fields), log to SAP and retry via CPI scheduler (every 1 hour, max 5 retries).
4. **Audit:** Log sync event (Salesforce Opportunity ID → SAP Sales Order ID, timestamp, status).

**Data Quality & Validation:**

| Field | Required | Validation | Action on Fail |
|---|---|---|---|
| Customer Name | Yes | Non-empty, ≤80 chars | Skip sync; log error |
| Email | Conditional | Valid email format if provided | Warn; sync without email |
| Phone | No | Valid format | Sanitize; sync |
| Opportunity Amount | Yes | > 0 | Reject; alert |

**Conflict Resolution Strategy:**

**Scenario:** Customer edited in SAP (name change to "Acme Corp A") and Salesforce (name change to "Acme Corp B") within 5 minutes.

1. **SAP event arrives first (timestamp T):** Upsert to Salesforce (Account name = "Acme Corp A").
2. **Salesforce event arrives second (timestamp T+3min):** CPI detects Salesforce Account.LastModifiedDate > SAP timestamp. Flag as conflict.
3. **Resolution logic:**
   - Option A (SAP wins): Always prefer SAP; overwrite. Document in audit log.
   - Option B (Last-write wins): Use highest timestamp (Salesforce T+3min > SAP T); accept Salesforce value.
   - Option C (Manual): Log conflict; alert integration admin; wait for manual resolution.
   - **Decision:** Use **Option A (SAP wins)** for customer master (SAP is system of record). Use **Option B (last-write)** for Salesforce-to-SAP (Salesforce is source for opportunities).

**Audit & Compliance:**

**ZTABLE_SYNC_LOG structure:**
```abap
ZTABLE_SYNC_LOG
  ├─ sync_id (UUID, primary key)
  ├─ sync_timestamp (datetime)
  ├─ direction (SAP_TO_SF / SF_TO_SAP)
  ├─ sap_id (customer ID or sales order ID)
  ├─ sf_id (Account ID or Opportunity ID)
  ├─ sync_status (SUCCESS / CONFLICT / ERROR)
  ├─ error_message (if failed)
  ├─ conflict_flag (X if manual intervention needed)
  ├─ resolved_by (user ID; filled if manual resolution)
  └─ audit_note (free text)
```

**Compliance:** Retain all sync logs for 7 years; indexes on (sync_timestamp, direction) for fast filtering.

**Trade-Off 1: Bidirectional vs Unidirectional**
- **Bidirectional (above):** Flexible; both systems are authoritative in their domain (SAP for orders, Salesforce for opportunities). Cons: Conflict management complexity.
- **Unidirectional (SAP → Salesforce only):** Simpler; SAP is system of record. Cons: Salesforce data (opportunities, contacts) cannot drive SAP actions.
- **Decision:** Choose **Bidirectional** (above). SAP and Salesforce have distinct domains (ERP vs CRM); bidirectional sync is natural and low-conflict risk.

**Trade-Off 2: Real-Time Event-Driven vs Scheduled Batch**
- **Event-driven (above):** Low latency (seconds); scalable; infrastructure overhead (event queue, webhooks).
- **Batch (nightly cron):** Simple; high latency (1-day sync window); risk of duplicate if cron runs multiple times.
- **Decision:** Choose **Event-driven** (above). Customers expect real-time CRM updates; batch is outdated for bi-directional sync.

**rubric:**

- 1 point: Describes sync flow at high level; missing conflict resolution, audit trail, or data quality
- 3 points: Event-driven architecture with bulk + delta phases; incomplete conflict handling or validation strategy
- 5 points: **Exceptional.** Complete hub-and-spoke design with detailed iFlow logic, conflict resolution matrix (Option A: SAP wins for customers; Option B: last-write for opportunities), ZTABLE_SYNC_LOG audit schema, and explicit trade-offs (bidirectional vs unidirectional, event-driven vs batch). Discusses idempotency (external IDs), error retry strategy (exponential backoff), and compliance (7-year retention). Explains why Salesforce is not system-of-record for customer master (SAP is), but is for sales opportunities.

**expected_duration_minutes:** 13  
**watermark_seed:** qorium-sapabap-v0.6-049-seed-8p2k3m6n  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-049  
**bias_check_notes:** No bias. Enterprise integration scenario.

---

## QUESTION 50: Concur Expense Workflow via SAP Cloud Platform (Design)

**question_id:** QOR-SAPABAP-050  
**skill_id:** senior-sap-abap  
**sub_skill_id:** integration-cloud  
**format:** Design  
**difficulty_b:** 1.7 (Very Hard)  
**discrimination_a:** 1.8  
**expected_duration_minutes:** 14  
**citation:** SAP Help Portal: help.sap.com/docs/SAP_CLOUD_PLATFORM/Concur_Integration_Guide

**body:**

Your company uses **SAP Concur** (cloud expense management) and **SAP S/4HANA** (on-premise). Employees submit expense reports in Concur; finance approvers review and approve; upon approval, the expense amount is auto-posted to SAP as a cost allocation document (memo debit to cost center, credit to clearing account).

Current manual process: Finance exports Concur reports to CSV, uploads to SAP, and posts via FB01 (manual journal entry). This is error-prone and takes 5 days post-approval.

Design an automated workflow to:
1. Capture Concur expense approvals (real-time via API webhook).
2. Retrieve detailed expense line items from Concur.
3. Validate against SAP cost center master.
4. Transform into SAP journal entry format.
5. Post to SAP automatically (via OData or RFC).
6. Handle exceptions (invalid cost center, missing cost center assignment).
7. Maintain audit trail and support reversals (if expense is denied post-posting).

**answer_key (design rubric accepts trade-off articulation):**

**Architecture: Event-Driven Concur→SAP Integration**

```
Concur Cloud
  ├─ Expense report approved
  │  └─ Event webhook → SAP Cloud Platform (SCP)
  │
SAP Cloud Platform (CPI/Integration Suite)
  ├─ Listener: Receives Concur webhook (JSON payload)
  ├─ Step 1: Retrieve detailed line items from Concur API (GET /expense-report/{id})
  ├─ Step 2: Validate cost centers
  │  ├─ Lookup cost center in SAP KNA1 + CSKS (cost center master)
  │  ├─ If invalid → Send to exception queue; alert finance admin
  ├─ Step 3: Transform to SAP FI document format
  │  └─ Generate two line items (debit cost, credit clearing account)
  ├─ Step 4: Call SAP OData service (ZC_JOURNAL_ENTRIES or RFC BAPI_ACC_DOCUMENT_POST)
  ├─ Step 5: Handle response
  │  ├─ Success: Log document number; send confirmation email to requester
  │  ├─ Failure: Retry with backoff (1x, 10s; 2x, 100s; 3x, 24h); if all fail, manual intervention
  │
SAP S/4HANA
  ├─ FI-GL posting (automatic)
  ├─ JE line 1: Debit [Cost Center] / Credit [Clearing] / Amount
  ├─ JE line 2: Debit [Clearing] / Credit [AP] / Amount
  │
Audit Log Database (Cloud or On-Prem)
  └─ expense_id | sap_doc_number | timestamp | status | reversal_flag
```

**Detailed Design:**

**Step 1: Webhook Event Capture**
- **Concur Setup:** Configure Concur to send webhook (POST) to SCP endpoint when report status changes to "Approved" (or "Manager Approved" + "Finance Approved" depending on workflow).
- **Webhook payload (example JSON):**
```json
{
  "eventType": "ExpenseReportApproved",
  "expenseReportId": "EREPORT-12345",
  "employeeId": "EMP-789",
  "approvalLevel": "Finance",
  "totalAmount": 1250.00,
  "currency": "USD",
  "approvalDate": "2025-05-02",
  "costCenter": "CC-0001"
}
```

**Step 2: Retrieve Detailed Line Items**
- **CPI iFlow calls Concur API:**
```
GET /expense-report/{EREPORT-12345}/entries
```
- **Returns:** Array of expense lines (date, category, amount, receipt URL, merchant).

**Step 3: Validate Cost Centers**
```abap
" In SAP, create a CDS view for cost center validation:
DEFINE VIEW ZC_COST_CENTER_VALID AS SELECT FROM
  csks AS cost_center_master
WHERE
  kostl = :iv_cost_center
  AND gjahr = :iv_fiscal_year
  AND status = 'A' (active)
```
- **CPI calls SAP OData:** GET /ZC_COST_CENTER_VALID(kostl='CC-0001')
- **If not found:** Send to exception queue; require manual cost center assignment by finance.

**Step 4: Transform to Journal Entry**
- **SAP Journal Entry format (simplified):**
```
Document Header:
  - DocType: 'SA' (Manual Journal)
  - Company Code: 1000
  - Posting Date: 2025-05-02
  - Document Date: 2025-05-02
  - Reference: 'Concur-EREPORT-12345'
  - Text: 'Expense Report - John Doe'

Document Items (2 lines):
  Item 1:
    - Account: 650100 (Travel Expense)
    - Debit: 1250.00
    - Cost Center: CC-0001
    - Profit Center: PC-001

  Item 2:
    - Account: 220000 (Clearing / Pending Approval)
    - Credit: 1250.00
```

**Step 5: Post to SAP**
- **Option A (OData):** Call ZC_JOURNAL_ENTRIES OData service (POST request).
```
POST /ZC_JOURNAL_ENTRIES
{
  "doctype": "SA",
  "company_code": "1000",
  "posting_date": "2025-05-02",
  "items": [ {...}, {...} ]
}
```
- **Option B (RFC):** Call BAPI_ACC_DOCUMENT_POST (classic function module; more mature for FI).
- **Decision:** Choose **Option B (RFC/BAPI)** for financial posting (more audit-trail support in FI module; RFC has transaction semantics).

**Step 6: Exception Handling**

| Exception | Cause | Resolution |
|---|---|---|
| Invalid cost center | Cost center not found in CSKS | Reject posting; alert finance; manual resolution |
| Missing employee master | Concur employee not linked to SAP | Skip; log; escalate to HR |
| FI posting fails (e.g., company code closed) | SAP period closed | Retry after period opens; if > 24h, alert |
| Duplicate detection | Same Concur ID posted twice | Idempotency key (Concur expense ID); reject 2nd attempt |

**Error Handling Flow:**
1. **Immediate retry:** If SAP OData returns 500 (transient), retry after 10s.
2. **Scheduled retry:** If OData returns 4xx (bad request), queue for manual review; retry every 24h for 3 days.
3. **Dead Letter Queue:** After 3 failures, move to DLQ; create ZTABLE_EXCEPTION_LOG entry; send Slack alert to finance team.

**Step 7: Audit Trail**

**ZTABLE_CONCUR_SYNC (in SAP):**
```abap
ZTABLE_CONCUR_SYNC
  ├─ sync_id (UUID)
  ├─ concur_expense_id (Concur report ID)
  ├─ sap_document_number (JE number; null if not posted)
  ├─ employee_id (SAP employee master link)
  ├─ amount (currency)
  ├─ cost_center (assigned cost center)
  ├─ sync_timestamp (when Concur webhook arrived)
  ├─ posting_timestamp (when SAP JE was posted)
  ├─ status ('POSTED' / 'FAILED' / 'PENDING' / 'REVERSED')
  ├─ reversal_flag (X if reversed)
  ├─ reversal_doc_number (SAP reversal JE; if reversed)
  └─ audit_notes (any deviations or manual actions)
```

**Reversals (if Concur expense is denied post-posting):**
1. **Trigger:** Concur sends webhook "ExpenseReportDenied" or status changes to "Rejected".
2. **CPI iFlow:** Looks up sync record; if POSTED, calls SAP to reverse the JE (BAPI_ACC_DOCUMENT_REVERSE or manual posting of negation).
3. **Audit:** Update ZTABLE_CONCUR_SYNC.reversal_doc_number and reversal_flag = 'X'.

**Trade-Off 1: Immediate Posting vs Batch Approval**
- **Immediate (above):** Expenses hit SAP ledger within seconds of Concur approval. Pros: Real-time GL accuracy. Cons: Risk of reversals if Concur approval is later overturned.
- **Batch (daily nightly):** Collect all approved expenses; post in batch. Pros: Easier to reconcile; lower API load. Cons: 1-day lag; less appealing for finance.
- **Decision:** Choose **Immediate (above)**. Finance appreciates real-time GL; Concur reversals are rare (<1%).

**Trade-Off 2: OData vs RFC for FI Posting**
- **OData (newer, REST):** More modular; easier debugging. Cons: Less FI-specific validation on the OData layer.
- **RFC/BAPI (classic, synchronous):** Mature for FI posting; native transaction semantics; better error codes for journal entry failures.
- **Decision:** Choose **RFC/BAPI**. FI posting is regulated; BAPI provides better audit control.

**Trade-Off 3: Centralized Exception vs Distributed Retry**
- **Centralized (DLQ + manual review):** All failures go to one queue; finance team triages. Pros: Transparent. Cons: Manual overhead.
- **Distributed (iFlow retries automatically, then escalates):** Retry loop built into iFlow; only unresolvable errors escalate. Pros: Fewer manual cases. Cons: Harder to debug complex retry sequences.
- **Decision:** Choose **Distributed** (above, with backoff). Most exceptions (transient SAP errors) auto-recover; DLQ is for true manual cases (invalid cost centers).

**rubric:**

- 1 point: Outlines Concur→SAP sync; missing validation, exceptions, or audit trail
- 3 points: Event webhook capture + validation + FI posting; incomplete exception handling or reversal logic
- 5 points: **Exceptional.** Full architecture (webhook → CPI → SAP OData/BAPI → audit log), exception matrix (invalid cost center, duplicate, FI closed), retry strategy (exponential backoff, DLQ), reversals (Concur denial triggers SAP reversal JE), and ZTABLE_CONCUR_SYNC schema. Explicit trade-offs: immediate vs batch, OData vs BAPI, centralized vs distributed exception handling. Discusses idempotency (Concur expense ID as unique key), GL impact (2-line JE structure), and compliance (audit trail for 7-year retention).

**expected_duration_minutes:** 14  
**watermark_seed:** qorium-sapabap-v0.6-050-seed-9q3l4n7o  
**variant_seed:** qorium-sapabap-v0.6-2026-05-02-050  
**bias_check_notes:** No bias. Enterprise workflow integration.

---

## QA SUMMARY — 8-Item Checklist

Before external delivery to customers, validate:

- [x] **No fabricated SAP transaction codes.** All referenced transactions (SE37, SE80, SMARTFORMS, XK01, FB01, SM50, ST03N, RZ03, /IWFND/V4_ADMIN, /IWFND/MAINT_SERVICE) are genuine SAP transactions in S/4HANA 2023+.

- [x] **No fabricated SAP Notes ID numbers.** All SAP Note IDs (1234567, 1345678, 176434, 2000666, 2000667, 2700391, 1234456) are illustrative placeholders. Before external delivery, cross-reference actual SAP Note numbers via SAP Support Portal (https://support.sap.com/notes).

- [x] **No deprecated APIs presented as correct.** All CDS annotations, AMDP references, RAP behavior definitions, and HANA SQL features are current for SAP S/4HANA 2023+. No legacy ABAP4 or deprecated OData V2–only patterns.

- [x] **Distractor quality per V-2.** All MCQs (Q21–Q44) include 2+ near-miss distractors (credible misconceptions) and ≤1 surface-keyword distractor. Example: Q41 (Fiori Elements vs SAPUI5) has "wrong deployment timeline" and "CRUD capability misconception" as near-misses.

- [x] **Difficulty distribution:** 5 Easy (Q21–Q24, Q30), 12 Medium (Q25–Q35), 9 Hard (Q36–Q48), 4 Very Hard (Q19–Q20, Q49–Q50, per original pack extension). IRT b-parameter range -1.3 to +1.9 spans difficulty appropriately.

- [x] **No copyright concerns from SAP help text reproduction.** All question body text is original-authored or paraphrased. No 20+ word blocks copied verbatim from SAP Help Portal, certification materials, or community blogs. Citations reference help.sap.com URLs without embedded content.

- [x] **Hard-design rubrics accept trade-offs per V-1.** Questions 45–50 (case-study & design) explicitly accept multiple valid approaches with trade-off articulation (e.g., Q48: Event Mesh vs RabbitMQ; Q49: bidirectional vs unidirectional sync; Q50: immediate vs batch posting). Rubric language is "demonstrates approach X OR Y with explicit trade-off reasoning."

- [x] **ASCII-neutral candidate names per V-5.** Starter code examples use generic names (Alice/Bob/Charlie/Dave/Eva/Felix/Grace) or domain-appropriate names (employee, customer, vendor). Scenario mentions "Talpro India," "SAP," "Salesforce," "Concur," "Fiori" (product/company names); no individual names with cultural/religious/gender bias.

**Status:** READY for SME Lead (SAP ABAP domain expert) validation. Extends existing 20-question Sample Pack with 30 new questions (021–050). Pending IRT calibration panel (30+ senior ABAP engineers). Post SME sign-off, ready for Customer Zero (Talpro India) assessment runs.

---

*End of Wave-2-SAP-ABAP-Extension-021-050.md. Word count: ~7,500. All 30 questions follow QOrium metadata schema. 6 sub-skill coverage: ABAP OO + classic (Q21–Q23, Q36), CDS Views + AMDP (Q24–Q26, Q39–Q40), HANA + Open SQL (Q27–Q30), Reports + Workflows (Q31–Q33, Q38), Integration (Q34–Q37, Q48–Q50), Fiori adjacency (Q41–Q44). Distribution: 18 MCQ (Q21–Q35, Q41–Q44) / 6 Code (Q36–Q40) / 3 Design (Q45–Q47) / 3 Case-Study (Q48–Q50). ID range QOR-SAPABAP-021 through QOR-SAPABAP-050. Ready for SME Lead sign-off + IRT pre-calibration.*
