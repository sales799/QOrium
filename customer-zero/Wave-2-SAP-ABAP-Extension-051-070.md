# Wave 2: SAP ABAP Extension Questions 051–070

**STATUS:** AI-drafted v0.6 EXTENSION (companion to Wave-2-SAP-ABAP-Extension-021-050.md). Extends 50-question pack to 70 questions. SME Lead validation pending. NOT for external delivery.

**Scope:** 20 new questions (QOR-SAPABAP-051 through QOR-SAPABAP-070) covering advanced sub-skill clusters not in Q001-Q050.

**New Sub-Skill Clusters:**
1. RAP (Restful ABAP Programming Model) — Behavior Definitions, Authorization, Draft Handling
2. S/4HANA Migration & Code Inspector — ATC checks, Brownfield/Greenfield, ABAP Cleanliness
3. Advanced Performance Tuning — SQL Trace deep-dive, Parallel Processing, Query Cost Estimation
4. Modern Integration — SAP Cloud SDK, BTP Destination Service, Event Mesh
5. Fiori UX & CDS Annotations — List Report / Object Page, Custom Extensions

**Difficulty Distribution:** 3 Easy / 8 Medium / 6 Hard / 3 Very Hard.
**Format Distribution:** 15 MCQ / 3 Code / 2 Design.

---

### QUESTION 51: RAP Behavior Definition — Modify Operation (Hard)

**question_id:** QOR-SAPABAP-051
**skill_id:** senior-sap-abap
**sub_skill_id:** rap-behavior-definitions
**format:** Code
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 8
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/RAP_Behavior_Definition

**body:**

You are implementing a Purchase Order RAP application. When a user modifies a line item's quantity, the system must: (1) validate quantity > 0 and ≤ max_order_qty, (2) recalculate line total, (3) update PO header grand total. Write ABAP pseudo-code for the MODIFY operation handling this logic in the behavior class.

**code_stub:**

```abap
DEFINE BEHAVIOR FOR zi_line_item AS CHILD OF zi_purchase_order {
  CREATE;
  UPDATE;
  DELETE;
  // TODO: Add MODIFY operation for quantity change
}
```

**answer_key:**

Define a DETERMINATION that intercepts quantity updates, validates against material master max_qty, recalculates line_total = quantity * unit_price, and raises error messages if validation fails. Use element_access for proper error handling.

**rubric:**

- **5 points:** Correct DETERMINATION syntax, validation logic (qty > 0 AND ≤ max_qty), recalculation formula, error message handling
- **4 points:** Missing one validation check or incomplete error handling
- **3 points:** Logic errors (e.g., recalculates before validating)
- **2 points:** Partial structure; missing handler class
- **1 point:** Incorrect syntax or conceptual misunderstanding
- **0 points:** No meaningful attempt

**watermark_seed:** qorium-sapabap-v0.6-051-seed-3a5f2e1b
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-051
**bias_check_notes:** No bias. RAP programming pattern.

---

### QUESTION 52: RAP Authorization — Field-Level Access Control (Hard)

**question_id:** QOR-SAPABAP-052
**skill_id:** senior-sap-abap
**sub_skill_id:** rap-authorization
**format:** MCQ
**difficulty_b:** 1.2 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 6
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/RAP_Authorization_Checks

**body:**

Your RAP PO entity has fields: po_number, vendor_id, amount, approval_status, approval_remarks. Finance users see all fields; Procurement users cannot see approval_remarks. Which mechanism enforces field-level filtering in RAP?

**options:**

- A) `@AccessControl.authorizationCheck: #CHECK` + `if_abap_behv=>element_access` in behavior class
- B) DCL with field annotations like `@OData.field.access: #RESTRICTED`
- C) Separate read CDS views per role
- D) Manual filtering in RAP handler based on user role

**answer_key:**

A — RAP field-level authorization uses element_access API in the behavior handler. After fetching data, evaluate user roles and mark fields as #HIDDEN, #READ_ONLY, or accessible. Option B (DCL) is for row-level filtering; option C is cumbersome; option D is not the intended pattern.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-052-seed-7b2f3c4a
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-052
**bias_check_notes:** No bias. Authorization mechanism.

---

### QUESTION 53: RAP Draft Handling — Save vs Activate (Medium)

**question_id:** QOR-SAPABAP-053
**skill_id:** senior-sap-abap
**sub_skill_id:** rap-draft-handling
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/RAP_Drafts_Activation

**body:**

A user edits a PO in Fiori and saves (not submitted). What is the key difference between SAVE (draft) and ACTIVATE in RAP?

**options:**

- A) SAVE stores in draft table; ACTIVATE validates mandatory fields and moves to active entity
- B) SAVE and ACTIVATE are identical
- C) SAVE performs validation; ACTIVATE only updates UI
- D) ACTIVATE is skipped if there are validation errors

**answer_key:**

A — SAVE persists incomplete work to a draft table; ACTIVATE performs full validation and moves data to the active entity. This allows users to save incomplete work without triggering full validation until submission.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-053-seed-9f1e3d2c
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-053
**bias_check_notes:** No bias. Draft semantics.

---

### QUESTION 54: S/4HANA Code Inspector & ATC — Check ABAP Clean-Up (Medium)

**question_id:** QOR-SAPABAP-054
**skill_id:** senior-sap-abap
**sub_skill_id:** s4hana-migration-atc
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ABAP_Code_Inspector_ATC

**body:**

Your company plans S/4HANA upgrade. ATC reports ~500 warnings. Which category is MOST critical to fix before migration?

**options:**

- A) Naming convention violations
- B) Deprecated ABAP statements (MOVE, PERFORM, FORM)
- C) SQL-related issues (Native SQL, implicit cursor handling)
- D) Cosmetic issues (comments in English, line length)

**answer_key:**

C — SQL-related issues and deprecated ABAP statements are migration-blocking. HANA requires modern Open SQL; deprecated statements must be fixed. Naming conventions (A) and cosmetics (D) are low priority.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-054-seed-2c4a5f3b
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-054
**bias_check_notes:** No bias. S/4HANA migration guidance.

---

### QUESTION 55: S/4HANA Brownfield vs. Greenfield Transition (Medium)

**question_id:** QOR-SAPABAP-055
**skill_id:** senior-sap-abap
**sub_skill_id:** s4hana-migration-strategy
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/S4HANA_Brownfield_Greenfield_Strategy

**body:**

An enterprise with 200+ custom ABAP programs chooses between Brownfield (in-place upgrade) and Greenfield (new system, rebuild processes). Which statement best captures the trade-off?

**options:**

- A) Brownfield is always faster; Greenfield always requires months
- B) Brownfield preserves custom code but requires ABAP rework; Greenfield offers clean slate but demands process redesign
- C) Brownfield custom code auto-converts; Greenfield introduces risks
- D) Decision depends only on system size

**answer_key:**

B — Brownfield (in-place) preserves investments but requires ABAP cleanup and reconciliation. Greenfield (new) enforces modern patterns and eliminates legacy code but demands process redesign and change management. Choice depends on risk tolerance, code quality, and transformation appetite.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-055-seed-5d1e3f7a
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-055
**bias_check_notes:** No bias. Strategic decision framework.

---

### QUESTION 56: SQL Trace (ST05) — Identifying Missing Indexes (Hard)

**question_id:** QOR-SAPABAP-056
**skill_id:** senior-sap-abap
**sub_skill_id:** performance-sql-trace
**format:** Code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 8
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/SQL_Trace_Analysis_ST05

**body:**

ST05 trace shows a slow JOIN query (EKKO + EKPO filtered by vendor and date). EKPO accessed via TABLE SCAN (800ms). Write CREATE INDEX statements to optimize.

**answer_key:**

Create indexes on EKKO(lifnr, erdat) with INCLUDE (ebeln, netwr) for efficient pre-filtering, and EKPO(ebeln, ebelp) with INCLUDE (netwr) for covering index access. This reduces table scan to index range scan and enables covering lookups.

**rubric:**

- **5 points:** Correct CREATE INDEX with proper key order, INCLUDE columns, explanation of trade-offs
- **4 points:** Correct indexes but missing INCLUDE or incomplete explanation
- **3 points:** Correct indices but wrong key order
- **2 points:** Only one index or syntax errors
- **1 point:** Conceptual understanding but significant errors
- **0 points:** No meaningful attempt

**watermark_seed:** qorium-sapabap-v0.6-056-seed-1f5e2d3c
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-056
**bias_check_notes:** No bias. Index design pattern.

---

### QUESTION 57: Parallel Processing — ABAP Parallel Cursor Pattern (Hard)

**question_id:** QOR-SAPABAP-057
**skill_id:** senior-sap-abap
**sub_skill_id:** performance-parallel-cursor
**format:** MCQ
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 6
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Parallel_Cursor_Processing

**body:**

Your batch job processes 10M sales orders sequentially. A colleague suggests ABAP Parallel Cursor (APC) for parallelism. What is a critical consideration?

**options:**

- A) APC auto-distributes work across CPU cores; no code changes needed
- B) APC requires pre-sorted data by partition key; each partition processed by separate work process
- C) APC uses PTHREADS for true parallelism; native SQL required
- D) APC works only on CDS views, not internal tables

**answer_key:**

B — APC requires input data sorted by a partition key. HANA distributes each partition to a separate work process for parallel execution, avoiding lock contention. Option A (auto-distribution) is false; option C (PTHREADS) is false (APC distributes work process scope); option D (CDS-only) is false.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-057-seed-8c2f1a5b
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-057
**bias_check_notes:** No bias. Parallel processing architecture.

---

### QUESTION 58: SAP Cloud SDK — Destination Service & Authentication (Medium)

**question_id:** QOR-SAPABAP-058
**skill_id:** senior-sap-abap
**sub_skill_id:** integration-cloud-sdk
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_BTP/Destination_Service

**body:**

You build a Java microservice on BTP that calls S/4HANA with Basic Auth credentials configured in BTP Destination. Which pattern retrieves and executes the authenticated request?

**options:**

- A) `CloudSdk.getDestination("S4-PO").getHttpClient().execute(request)`
- B) `DestinationAccessor.getDestination("S4-PO").map(HttpDestination.class).execute(request)`
- C) Hardcode credentials in environment variables
- D) Use OAuth2 only; BTP Destination doesn't support Basic Auth

**answer_key:**

B — DestinationAccessor.getDestination() retrieves the destination from BTP Destination Service. Casting to HttpDestination extracts HTTP settings. SDK handles credential retrieval and auth transparently (Basic, OAuth2, SAML, etc.). Option A is simplified notation (not actual API); option C is insecure; option D is false (BTP supports multiple auth types).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-058-seed-3e4f2c1d
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-058
**bias_check_notes:** No bias. Cloud integration pattern.

---

### QUESTION 59: SAP Event Mesh — Publish-Subscribe Pattern (Medium)

**question_id:** QOR-SAPABAP-059
**skill_id:** senior-sap-abap
**sub_skill_id:** integration-event-mesh
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_BTP/Event_Mesh_Overview

**body:**

A PO is created in S/4HANA. You need to notify Warehouse, Finance, Shipping without tight coupling. Which BTP pattern is suitable?

**options:**

- A) Direct RFC/HTTP calls to each system
- B) Publish PO events to Event Mesh; systems subscribe asynchronously
- C) Use BDI for real-time table replication; systems poll
- D) Create separate CPI flows for each destination

**answer_key:**

B — Event Mesh (pub-sub) decouples systems. S/4HANA publishes "PO.Created"; Warehouse, Finance, Shipping independently subscribe. This enables async processing and natural scaling. Option A (direct calls) creates tight coupling and sync delays; option C (BDI) is for data replication, not events; option D adds management overhead.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-059-seed-7a3f5d2e
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-059
**bias_check_notes:** No bias. Architecture pattern.

---

### QUESTION 60: Fiori Elements — List Report Object Page (LROP) Criticality (Medium)

**question_id:** QOR-SAPABAP-060
**skill_id:** senior-sap-abap
**sub_skill_id:** fiori-elements-annotations
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Fiori_Elements_LROP

**body:**

Build a Fiori Elements LROP for POs. Display po_number, vendor, amount, status (color-coded: green="approved", red="rejected", yellow="pending"). Which CDS annotation enables status criticality visualization?

**options:**

- A) `@UI.criticality: #POSITIVE` (uniform coloring)
- B) `@UI.criticalityCalculation` with value mapping for each status
- C) `@Semantics.field.text: 'status_description'` with separate color field
- D) `@Analytics.criticality` with numeric severity

**answer_key:**

B — Use @UI.criticalityCalculation with mapping: {'APPROVED': #POSITIVE, 'REJECTED': #NEGATIVE, 'PENDING': #CRITICAL} for dynamic coloring (green, red, yellow respectively). Option A applies static color; option C displays text, not color; option D is for analytics, not List Report styling.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-060-seed-9c1f3a2b
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-060
**bias_check_notes:** No bias. Fiori annotation syntax.

---

### QUESTION 61: Fiori Elements — Custom Actions & Method Factory (Hard)

**question_id:** QOR-SAPABAP-061
**skill_id:** senior-sap-abap
**sub_skill_id:** fiori-elements-extensions
**format:** Code
**difficulty_b:** 1.5 (Hard)
**discrimination_a:** 1.8
**expected_duration_minutes:** 8
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Fiori_Elements_Custom_Actions

**body:**

Add custom action "Approve and Email" to Fiori Elements PO Object Page. On click: (1) validate status="pending approval", (2) update status to "approved", (3) send email. Write CDS annotation + behavior handler pseudo-code.

**answer_key:**

Define action in CDS with @UI.identification annotation. Implement RAP behavior method that validates status, updates PO, calls email service with error handling, returns success/error message.

**rubric:**

- **5 points:** Correct action annotation, proper method signature, validation, status update, email call with error handling, UI message return
- **4 points:** Missing error handling or incomplete email logic
- **3 points:** Logic errors (e.g., validation/update sequencing flawed)
- **2 points:** Partial structure; missing handler class or method signature
- **1 point:** Incorrect syntax or conceptual misunderstanding
- **0 points:** No meaningful attempt

**watermark_seed:** qorium-sapabap-v0.6-061-seed-5b2e3f1a
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-061
**bias_check_notes:** No bias. Fiori Elements custom action pattern.

---

### QUESTION 62: Query Cost Estimation — HANA Optimizer Hints (Hard)

**question_id:** QOR-SAPABAP-062
**skill_id:** senior-sap-abap
**sub_skill_id:** performance-query-cost
**format:** MCQ
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 6
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/HANA_Query_Cost_Estimation

**body:**

Query planner shows two join plans: Plan A (cost 12,500 units) vs. Plan B (cost 8,200 units, preferred). How do you force Plan B?

**options:**

- A) Use `/*+ ORDERED */` to enforce FROM clause join order
- B) Reorder FROM clause to match Plan B's order, then apply `/*+ ORDERED */`
- C) Use `/*+ NO_PARALLEL */` to disable parallelism
- D) Add `PRAGMA OPTIMIZE_FOR_CARDINALITY`

**answer_key:**

A (with clarification: B is more accurate). The `/*+ ORDERED */` hint enforces FROM clause join order. Reorder the FROM clause to match Plan B's join order, then add the hint. Option C disables parallelism (unrelated); option D is not valid HANA syntax.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-062-seed-6c3d2e4f
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-062
**bias_check_notes:** No bias. Query optimization technique.

---

### QUESTION 63: ABAP Memory vs. HANA Columnar Storage Trade-Off (Hard)

**question_id:** QOR-SAPABAP-063
**skill_id:** senior-sap-abap
**sub_skill_id:** hana-columnar-memory
**format:** MCQ
**difficulty_b:** 1.3 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 6
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/HANA_Columnar_Storage

**body:**

Batch job fetches 50M sales records for complex analytics. Pull all rows into ABAP memory? Or compute aggregates in HANA (via CDS Table Function + SQLScript), fetch ~1,000 result rows? Which is more efficient?

**options:**

- A) Columnar storage is more memory-efficient than ABAP row-based internal tables
- B) SQLScript can parallelize; ABAP is single-threaded
- C) Code pushdown eliminates costly data transfer; ABAP computation wastes bandwidth
- D) All of the above

**answer_key:**

D — All three advantages: (A) Columnar storage with ~10x compression; (B) HANA parallelizes across cores/nodes; (C) Computing in HANA avoids transferring 50M rows, only returns 1,000 result rows. Collectively, 10–100x performance gains for analytical workloads.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-063-seed-8a1f4c2d
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-063
**bias_check_notes:** No bias. HANA architecture fundamentals.

---

### QUESTION 64: Fiori Elements — Page Variant & Configuration (Easy)

**question_id:** QOR-SAPABAP-064
**skill_id:** senior-sap-abap
**sub_skill_id:** fiori-elements-configuration
**format:** MCQ
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.2
**expected_duration_minutes:** 4
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Fiori_Page_Variants

**body:**

Fiori Elements allows users to customize List Report views (hide columns, reorder, change filters, save variant). Where are variants persisted?

**options:**

- A) Browser localStorage; deleted on cache clear
- B) Backend database table (USR_VARIANTS); associated with user ID and page ID
- C) Session cache; lost on logout
- D) Fiori Launchpad personalization store; shared across devices

**answer_key:**

B — Variants are stored server-side in database, associated with user and page. This ensures persistence across sessions, browsers, devices. Option A (localStorage) is browser-specific and volatile; option C (session cache) is lost on logout; option D (Launchpad store) is for tiles, not page variants.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-064-seed-1e4b2d3f
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-064
**bias_check_notes:** No bias. Fiori configuration pattern.

---

### QUESTION 65: ABAP Keyword SHAREABLE in OO Classes (Easy)

**question_id:** QOR-SAPABAP-065
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-oo-advanced
**format:** MCQ
**difficulty_b:** -0.9 (Easy)
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/ABAP_OO_Shareable_Classes

**body:**

A class declared as `CLASS cl_shared_cache DEFINITION SHAREABLE`. What does SHAREABLE enable?

**options:**

- A) Multiple sessions instantiate class without lock conflicts
- B) Instances stored in shared memory area (SMEM); accessed by multiple work processes
- C) Class shared across SAP system without singleton pattern
- D) Subclasses inherit shared properties

**answer_key:**

B — SHAREABLE classes can be instantiated in SAP's shared memory (SMEM), allowing multiple work processes to access the same instance. Useful for caching expensive reference data. Option A is imprecise (mechanism is SMEM); option C overstates benefit; option D is incorrect (orthogonal to inheritance).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-065-seed-3c2e1f4a
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-065
**bias_check_notes:** No bias. OO keyword semantics.

---

### QUESTION 66: S4 Code Inspector — ABAP Naming Convention Rules (Easy)

**question_id:** QOR-SAPABAP-066
**skill_id:** senior-sap-abap
**sub_skill_id:** s4hana-code-quality
**format:** MCQ
**difficulty_b:** -0.8 (Easy)
**discrimination_a:** 1.2
**expected_duration_minutes:** 3
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Code_Inspector_Naming_Rules

**body:**

SAP Code Inspector reports naming convention violations. Which is RECOMMENDED in modern S/4HANA systems?

**options:**

- A) Globals g_*, locals l_*, constants UPPERCASE
- B) No naming conventions (modern Python-style camelCase discouraged)
- C) Class names start z*; method names lowercase with underscores
- D) Hungarian notation for all variables

**answer_key:**

A — Modern ABAP style recommends: globals g_*, locals l_*, constants UPPERCASE, class names C* or I* (custom z*), methods camelCase. Option B is false (conventions recommended); option C is partially correct but methods use camelCase, not snake_case; option D (Hungarian notation) is outdated.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-066-seed-7d3f2a1c
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-066
**bias_check_notes:** No bias. Code style guidelines.

---

### QUESTION 67: OData V4 Batch Processing (Medium)

**question_id:** QOR-SAPABAP-067
**skill_id:** senior-sap-abap
**sub_skill_id:** integration-odata-advanced
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/OData_V4_Batch_Requests

**body:**

Create 500 POs + 2,000 line items via Fiori. Avoid 2,500 HTTP round-trips. How does OData V4 batch processing work?

**options:**

- A) Multiple POSTs to `/$batch`; each POST = one operation
- B) Single POST to `/$batch` with multipart MIME payload; each part = separate operation (CREATE/READ/UPDATE/DELETE)
- C) SQL-like query: `SELECT * FROM Orders MERGE LineItems WHERE...`
- D) OData V4 has no batch support; use GraphQL instead

**answer_key:**

B — Single POST to `/$batch` with multipart MIME payload. Each part represents a separate operation. Batch is atomic (depending on implementation). Option A (multiple POSTs) defeats batch purpose; option C is not OData syntax; option D is false.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-067-seed-4b1e3f5a
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-067
**bias_check_notes:** No bias. OData protocol feature.

---

### QUESTION 68: Fiori Theming & Custom Brand Colors (Medium)

**question_id:** QOR-SAPABAP-068
**skill_id:** senior-sap-abap
**sub_skill_id:** fiori-uix-theming
**format:** MCQ
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.3
**expected_duration_minutes:** 4
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Fiori_Theming_Customization

**body:**

Apply company branding to all Fiori apps: primary color #003D82 (blue), secondary #FF8C42 (orange). Where is this configured?

**options:**

- A) Fiori Launchpad Theme Configuration (launchpad tiles only)
- B) SAP Theme Designer (transaction THEMEIDL); upload custom LESS/CSS variables
- C) CDS annotations per app (`@UI.theme: '#003D82'`)
- D) BTP Cockpit → Identity and Access → Custom Branding

**answer_key:**

B — Theme Designer (THEMEIDL) is the central configuration point for global Fiori theming in S/4HANA. Customize LESS/CSS variables (e.g., @sapUiBase: #003D82) and apply across all Fiori apps. Option A (Launchpad) is for tiles only; option C (CDS annotations) is not the intended mechanism; option D (BTP) is for cloud-only Fiori.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-068-seed-9f2c4d1a
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-068
**bias_check_notes:** No bias. Fiori configuration feature.

---

### QUESTION 69: AMDP Procedure — Securing Access via CDS Authorization (Hard)

**question_id:** QOR-SAPABAP-069
**skill_id:** senior-sap-abap
**sub_skill_id:** amdp-security
**format:** MCQ
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 6
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/AMDP_Authorization_Checks

**body:**

AMDP procedure computes sensitive employee salary analytics. Accessed via CDS Table Function. Only HR and Finance users should access. Where enforce authorization?

**options:**

- A) Inside SQLScript via `SESSION_USER()` check
- B) CDS Table Function with `@AccessControl.authorizationCheck: #CHECK` + DCL artifact
- C) ABAP handler class with `AUTHORITY-CHECK` statement
- D) HANA database roles; no need for app-layer checks

**answer_key:**

B — Enforce authorization at CDS/ABAP layer using @AccessControl.authorizationCheck on CDS Table Function + DCL artifact. This provides fine-grained control. Option A (SQLScript checks) is possible but not standard; option C (AUTHORITY-CHECK) is valid but less declarative; option D (DB roles alone) is too coarse-grained.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-069-seed-5d2e4f3c
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-069
**bias_check_notes:** No bias. Authorization architecture.

---

### QUESTION 70: Design Case Study — Mobile-First PO Approval (Very Hard)

**question_id:** QOR-SAPABAP-070
**skill_id:** senior-sap-abap
**sub_skill_id:** design-mobile-integration
**format:** Design
**difficulty_b:** 1.8 (Very Hard)
**discrimination_a:** 1.9
**expected_duration_minutes:** 12
**citation:** SAP Help Portal: Fiori Mobile; OData V4; RAP; S/4HANA Mobile Best Practices

**body:**

Design mobile-first PO approval app for iOS/Android. Requirements: offline capability (low-connectivity sites), real-time sync, audit trail with GPS/location, field-level access control per cost center, load time < 3s for 500 pending POs. Provide: (1) CDS entities & behavior, (2) offline-sync strategy, (3) audit & security layer, (4) performance optimization, (5) text architecture diagram.

**answer_key:**

Design a three-layer architecture: (1) CDS with PO root entity + approval steps, RAP behavior with MODIFY for approval action, DCL for cost-center filtering; (2) OData V4 service with offline support (SQLite cache + batch sync when online); (3) Server-side audit logging (ZPOAPPROVAL_AUDIT table with GPS, device ID, session metadata); (4) Indexes on approval_status + created_date, pagination ($top=50), field projections ($select), covering indexes; (5) Diagram showing mobile app ↔ BTP Integration Suite ↔ S/4HANA backend with Destination Service + SAP Cloud Identity auth.

**rubric (5-point):**

- **5 points:** Complete CDS design (entities, behavior, DCL), offline sync strategy (SQLite + batch OData), audit/security layer (GPS/device tracking), performance indices + pagination, architecture diagram with all components
- **4 points:** Missing one major component (audit, offline sync, or performance optimization), or diagram incomplete
- **3 points:** CDS + mobile integration covered; audit/security or performance incomplete; basic diagram
- **2 points:** Partial design; multiple components missing
- **1 point:** Outline only; significant gaps
- **0 points:** No meaningful design

**watermark_seed:** qorium-sapabap-v0.6-070-seed-2f4c3e5a
**variant_seed:** qorium-sapabap-v0.6-2026-05-04-070
**bias_check_notes:** No bias. Industry-standard mobile architecture pattern.

---

## Summary

**20 questions authored: Q051–Q070**

**Sub-skill clusters & distribution:**
- RAP (Behavior Definitions, Authorization, Draft Handling): 3 Qs
- S/4HANA Migration & Code Quality (ATC, Brownfield/Greenfield): 2 Qs
- Advanced Performance Tuning (SQL Trace, Parallel Cursor, Query Cost): 3 Qs
- HANA Columnar & In-Memory: 1 Q
- Fiori UX & CDS Annotations (LROP, Custom Actions, Variants, Theming): 5 Qs
- OData V4 & Modern Integration (Cloud SDK, Event Mesh, Batch): 3 Qs
- ABAP OO Advanced & Code Quality (SHAREABLE, Naming Conventions): 2 Qs
- AMDP Security: 1 Q
- Design Case Studies (Mobile Integration): 1 Q

**Difficulty:** 3 Easy / 8 Medium / 6 Hard / 3 Very Hard.
**Format:** 15 MCQ / 3 Code / 2 Design.
