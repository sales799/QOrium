# Wave 2: SAP ABAP Extension Questions 071–090

**STATUS:** AI-drafted v0.6 EXTENSION (continues `Wave-2-SAP-ABAP-Extension-021-050.md`). SME Lead validation pending. NOT for external delivery without SME-Lead sign-off + IRT calibration (per SO-21).

**Scope:** 20 new questions (QOR-SAPABAP-071 through QOR-SAPABAP-090) advancing SAP-ABAP coverage on the Cloud-tier stack: RAP, CDS view entities, AMDP, ATC custom checks, ABAP Unit, enqueue locking, bgRFC, BTP destinations, output management, and end-to-end migration scenarios. S/4HANA 2023 + ABAP Cloud baseline.

**Difficulty Distribution:** 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.
**Format Distribution:** 12 MCQ / 4 Code / 2 Design / 2 Case-Study.

**Sub-skill coverage:**

- abap-rap (RESTful ABAP Programming) — Q071, Q079, Q084, Q089
- cds-views-advanced — Q072, Q080, Q083
- amdp-hana — Q073, Q082
- abap-test-cockpit — Q074, Q085
- abap-unit-testing — Q075
- enqueue-locking — Q076, Q086
- bgrfc-async — Q077
- btp-integration — Q078, Q090
- output-management — Q081
- multi-tenant-design — Q087
- s4-migration-design — Q088

---

## QUESTION 71: RAP Behavior Definition vs Implementation

**question_id:** QOR-SAPABAP-071
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-rap
**format:** MCQ
**difficulty_b:** -1.1 (Easy)
**discrimination_a:** 1.5
**expected_duration_minutes:** 3
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_CLOUD/RAP_Behavior_Definition_vs_Implementation

**body:**

You are writing a RESTful ABAP Programming (RAP) business object for a `Travel` root entity. You declare actions and validations in a Behavior Definition (BDEF) artifact and implement them in an ABAP class. What is the canonical relationship between the BDEF and the implementation class?

**options:**

- A) The BDEF is metadata declaring the supported operations; the implementation class provides the executable handler methods that the RAP runtime dispatches to
- B) The BDEF and the implementation class are alternatives — choose one or the other based on whether you want declarative or imperative behavior
- C) The BDEF generates the implementation class at activation time; the developer never edits the class directly
- D) The BDEF is for the projection layer; the implementation class is for the persistence layer; they should not refer to each other

**answer_key:**

A — The BDEF (`define behavior for ZI_Travel`) declares which standard operations (create / update / delete), actions, validations, and determinations are supported, plus their authorization classes and field control. The implementation class (a class implementing `IF_ABAP_BEHAVIOR_HANDLER` or generated handler interface) provides the imperative method bodies the RAP runtime calls when those operations are invoked. The two are paired by activation; both are required for a working business object. References: SAP Help Portal RAP §3.2 (Behavior Definition); §3.3 (Behavior Pool / Implementation Class).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-071-seed-9d3f4a2b
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-071
**bias_check_notes:** No bias. RAP architectural concept.

---

## QUESTION 72: CDS View Annotation @ObjectModel.semanticKey

**question_id:** QOR-SAPABAP-072
**skill_id:** senior-sap-abap
**sub_skill_id:** cds-views-advanced
**format:** MCQ
**difficulty_b:** -0.7 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/CDS_ObjectModel_Annotations

**body:**

A CDS view exposes a composite business object with a UUID technical key but a human-readable `TravelID` field that uniquely identifies a row from a business perspective. What annotation tells consumers (Fiori Elements, RAP) that `TravelID` is the user-facing identity?

**options:**

- A) `@ObjectModel.semanticKey: ['TravelID']`
- B) `@UI.identification: [{ position: 10 }]`
- C) `@Search.defaultSearchElement: true`
- D) `@AbapCatalog.preserveKey: true`

**answer_key:**

A — `@ObjectModel.semanticKey` declares the business-meaningful key (`TravelID`) distinct from the technical key (UUID). Fiori Elements uses this for object headers + URL segments; RAP service bindings expose it in the OData metadata as the navigation key. `@UI.identification` (B) controls form layout, `@Search.defaultSearchElement` (C) controls full-text search, `@AbapCatalog.preserveKey` (D) controls DDIC key behaviour for SQL views. References: SAP CDS Annotations Reference §ObjectModel.semanticKey; Fiori Elements Object Page Layout §3.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-072-seed-7e2c5d8f
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-072
**bias_check_notes:** No bias. CDS annotation knowledge.

---

## QUESTION 73: When to Use AMDP over Open SQL

**question_id:** QOR-SAPABAP-073
**skill_id:** senior-sap-abap
**sub_skill_id:** amdp-hana
**format:** MCQ
**difficulty_b:** -0.4 (Easy)
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/AMDP_When_To_Use

**body:**

Your team is building a flight-availability calculation that joins 6 tables, computes a window function, and produces aggregated availability per route. Open SQL supports most of this on HANA but window functions require workarounds. When is an ABAP Managed Database Procedure (AMDP) the correct choice over Open SQL?

**options:**

- A) When the calculation requires HANA-native SQL features (window functions, table functions, hierarchies) that Open SQL cannot express, AND the procedure can stay self-contained on HANA without round-trips to ABAP
- B) Always — AMDP is faster than Open SQL for any non-trivial query
- C) Only for write-heavy operations; Open SQL is mandatory for SELECT
- D) When the developer wants to bypass authorization checks that Open SQL enforces

**answer_key:**

A — AMDPs are the right tool when (1) the calculation needs HANA SQLScript features (window functions, hierarchical queries, complex CTEs, table functions) that Open SQL doesn't expose portably, AND (2) the logic can run entirely on the database without round-trips to ABAP. Open SQL is preferred otherwise because it stays portable across databases (an explicit goal of S/4HANA on-premise installations that may eventually move to SAP HANA Cloud) and is statically analysable by ATC. (B) is wrong — for simple queries Open SQL is just as fast and more analysable. (C) is wrong — Open SQL handles writes too. (D) is wrong — AMDPs still respect ABAP authorization layers; bypassing auth is a security violation regardless. References: SAP Help Portal AMDP §1.3 (When to Use); ABAP Cloud Development Best Practices §SQL.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-073-seed-2a8f1b4c
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-073
**bias_check_notes:** No bias. Database programming pattern.

---

## QUESTION 74: ATC Custom Check Class

**question_id:** QOR-SAPABAP-074
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-test-cockpit
**format:** MCQ
**difficulty_b:** 0.2 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/ATC_Custom_Check_Class

**body:**

Your governance team wants to enforce that all new ABAP report programs include a `@@AbapCloudReady: true` annotation. You decide to implement this as an ATC custom check. Which interface must your check class implement, and at what scope is it registered?

**options:**

- A) Implement `IF_CI_ATC_CHECK` (or extend `CL_CI_TEST_ROOT`); register in `SCI_MANAGE` under your governance check variant; assign to relevant ATC check variants used by transports
- B) Implement `IF_CHECK_VARIANT` and register the check in `SE80` under the report's package
- C) Subclass `CL_ABAP_GOVERNANCE_RUNTIME`; the system auto-detects subclasses
- D) Add the check to a `.atcconfig` file in the project; no class code is required

**answer_key:**

A — ATC custom checks subclass `CL_CI_TEST_ROOT` (or implement the lower-level `IF_CI_ATC_CHECK` for SCI). The class is registered in transaction `SCI` (Code Inspector — the back-end of ATC); it is added to a check variant via `SCI_MANAGE`; and that check variant is assigned to a global ATC profile that runs on transport release. Findings are emitted via `add_finding()` with severity (`CO_ERROR`, `CO_WARNING`, `CO_INFO`). (B), (C), (D) are not real ABAP APIs. References: SAP ABAP Test Cockpit Configuration Guide §4 (Custom Checks); Code Inspector Architecture §5.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-074-seed-6c9e3d1a
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-074
**bias_check_notes:** No bias. ATC governance pattern.

---

## QUESTION 75: ABAP Unit Test Doubles via Dependency Injection

**question_id:** QOR-SAPABAP-075
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-unit-testing
**format:** MCQ
**difficulty_b:** 0.4 (Medium)
**discrimination_a:** 1.7
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/ABAP_Unit_Dependency_Injection

**body:**

A class `CL_PRICING_ENGINE` directly calls the static method `CL_CURRENCY_RATE=>FETCH_LIVE_RATE( )` to convert prices. You want to unit-test `CL_PRICING_ENGINE` without making a live FX call. Which refactoring is the canonical ABAP Unit pattern?

**options:**

- A) Extract a `IF_CURRENCY_RATE_PROVIDER` interface; constructor-inject an instance into `CL_PRICING_ENGINE`; in tests pass a test double that returns deterministic rates; `CL_CURRENCY_RATE` provides the production implementation of the interface
- B) Mark `CL_CURRENCY_RATE=>FETCH_LIVE_RATE` as `FOR TESTING` so it short-circuits when the test framework is active
- C) Stop unit-testing `CL_PRICING_ENGINE`; integration tests that hit the live FX service are sufficient
- D) Use `CL_ABAP_TESTDOUBLE=>MOCK_STATIC_METHOD( )` to replace the global static method during the test run

**answer_key:**

A — Constructor injection of an interface (`IF_CURRENCY_RATE_PROVIDER`) is the canonical ABAP Unit pattern. The test passes a test double (created via `CL_ABAP_TESTDOUBLE=>CREATE( )` or a hand-rolled stub class) that returns deterministic rates. The production code injects the real `CL_CURRENCY_RATE` provider. (B) is fictional — `FOR TESTING` is a class/method modifier for test classes, not a runtime branch. (C) abandons coverage; integration-only testing makes the pricing engine effectively untested in isolation. (D) is fictional — `CL_ABAP_TESTDOUBLE` mocks instances, not static method calls; static dependencies are an anti-pattern that the refactor in (A) addresses. References: SAP ABAP Unit Best Practices §4 (Test Doubles); Dependency Injection in ABAP OO §3.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-075-seed-4f7b2a9e
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-075
**bias_check_notes:** No bias. Standard testability pattern.

---

## QUESTION 76: Enqueue Lock Object Scope

**question_id:** QOR-SAPABAP-076
**skill_id:** senior-sap-abap
**sub_skill_id:** enqueue-locking
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/Enqueue_Server_Lock_Modes

**body:**

You enqueue a row from a custom transactional table `ZTRAVEL` using `ENQUEUE_EZTRAVEL` with `_SCOPE = 2` (transaction scope). After the lock is acquired, you call a BAPI that performs `COMMIT WORK`. What happens to your `ZTRAVEL` lock?

**options:**

- A) The lock is released because `_SCOPE = 2` ties lock lifetime to the SAP LUW; `COMMIT WORK` ends the LUW and triggers automatic dequeue
- B) The lock survives because enqueue locks are independent of database transactions; only an explicit `DEQUEUE_EZTRAVEL` releases it
- C) The lock is escalated to `_SCOPE = 3` (process scope) automatically as a safety measure
- D) The lock is converted to a database row lock; the enqueue server forgets it but PostgreSQL keeps it

**answer_key:**

A — `_SCOPE` controls when the lock is released. With `_SCOPE = 2` (transaction scope) the lock is bound to the SAP LUW and is released by the commit handler when `COMMIT WORK` runs. With `_SCOPE = 1` (dialog step) the lock persists across `COMMIT WORK` and is released only by an explicit `DEQUEUE` or by the next dialog step's automatic cleanup. With `_SCOPE = 3` (transaction + dialog) the lock survives both. The default for most enqueue calls is `_SCOPE = 2`, which is why developers often see locks "vanish" after a `COMMIT WORK` they didn't intend to release them with — the fix is `_SCOPE = 1` or 3. References: SAP Help Portal Enqueue Server §2.4 (Lock Scopes); ABAP Programming Guidelines §LUW.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-076-seed-3a5d8c1f
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-076
**bias_check_notes:** No bias. SAP locking semantics.

---

## QUESTION 77: bgRFC vs qRFC vs tRFC

**question_id:** QOR-SAPABAP-077
**skill_id:** senior-sap-abap
**sub_skill_id:** bgrfc-async
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/Background_RFC_Comparison

**body:**

You are designing async outbound integration to a downstream system. Order events must be delivered exactly once, in submission order, with retry on transient failure. SAP NetWeaver offers tRFC, qRFC, and bgRFC. Which is the modern recommended choice and why?

**options:**

- A) bgRFC — supersedes qRFC + tRFC; supports unit-of-work bundling, ordered + unordered queues, monitoring via SBGRFCMON, and is the SAP-recommended default since NW 7.50
- B) tRFC — guarantees exactly-once delivery and is the simplest to operate
- C) qRFC — the only mechanism that preserves order across calls
- D) Synchronous RFC with caller-side retry loop — simpler than any async option

**answer_key:**

A — bgRFC (background RFC, available since NetWeaver 7.11 and SAP-recommended since 7.50) supersedes both tRFC and qRFC. It supports both ordered queues (replaces qRFC) and unordered units (replaces tRFC), provides unit-of-work bundling, has dedicated monitoring (SBGRFCMON, SBGRFCCONF), and integrates with the modern Watchdog framework for retry. tRFC (B) does NOT guarantee exactly-once on its own — duplicates are possible after recovery and ordering is not enforced. qRFC (C) preserves order but has known operational issues with stuck queues that bgRFC fixed. Synchronous RFC (D) blocks the caller and offers no durability — wrong tool for fire-and-forget integration. References: SAP Help Portal Background RFC §1 (Overview); SAP Note 1397164 (bgRFC vs qRFC migration).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-077-seed-8b2e6c4a
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-077
**bias_check_notes:** No bias. SAP integration pattern selection.

---

## QUESTION 78: BTP Cloud Connector vs Direct Internet Destination

**question_id:** QOR-SAPABAP-078
**skill_id:** senior-sap-abap
**sub_skill_id:** btp-integration
**format:** MCQ
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/CLOUD_CONNECTOR/Cloud_Connector_vs_Direct_Internet

**body:**

Your ABAP Cloud (Steampunk / BTP ABAP Environment) application needs to call (a) an on-premise S/4HANA system in your customer's datacenter, and (b) a public REST API at `api.exchangerate-api.com`. How should the destinations be configured?

**options:**

- A) On-premise call → destination type "OnPremise" routed via the SAP Cloud Connector; public API call → destination type "Internet" with no Cloud Connector
- B) Both via Cloud Connector — internet calls always go through Cloud Connector for security
- C) Both as Internet — ABAP Cloud sandboxes don't support OnPremise destinations
- D) On-premise via direct VPN tunnel from the BTP subaccount; public API via the Internet destination type

**answer_key:**

A — The Cloud Connector is the SAP-managed reverse proxy that lets BTP services reach customer-on-premise systems through a customer-controlled tunnel. Destinations of type "OnPremise" are routed through it; the customer's Cloud Connector instance terminates the tunnel inside the on-premise network. Public-internet endpoints use destination type "Internet" and bypass the Cloud Connector entirely; routing them through Cloud Connector is technically possible but adds latency and the customer's Cloud Connector capacity for no security benefit (the public endpoint is already on the internet). (B) misroutes internet traffic, (C) is wrong — ABAP Cloud fully supports OnPremise destinations, (D) is wrong — direct VPN is not the BTP-recommended pattern; Cloud Connector is. References: SAP Help Portal Cloud Connector §2.1 (Use Cases); BTP Destination Service §2 (Destination Types).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-078-seed-1d4f7a9b
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-078
**bias_check_notes:** No bias. SAP integration architecture.

---

## QUESTION 79: RAP Managed vs Unmanaged Behavior

**question_id:** QOR-SAPABAP-079
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-rap
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_CLOUD/RAP_Managed_vs_Unmanaged

**body:**

You're building a RAP business object on top of an existing custom database table that already has its own logic gated by a number-range object and a deeply customised update FM. You want RAP-style services on top, but you cannot rewrite the underlying logic. Which RAP scenario should you choose?

**options:**

- A) Unmanaged scenario — implement all behavior methods (create, update, delete, lock, save) yourself, delegating to the existing FM; RAP runtime owns the OData layer but you own persistence
- B) Managed scenario — RAP generates persistence; you migrate the legacy FM into RAP saver and reuse number-range via determination
- C) Draft-enabled managed — drafts auto-resolve the legacy logic
- D) Pure projection — no behavior; only read-only views

**answer_key:**

A — The unmanaged scenario is exactly designed for this case: you have an existing imperative implementation (the legacy FM, custom number-range, possibly bespoke locking) that you cannot rewrite. Unmanaged RAP keeps the OData / projection layer (controllers, ETags, queries) RAP-managed but delegates create / update / delete / lock / save to your handler methods. (B) requires rewriting the legacy logic into RAP-managed implementations — wrong constraint match. (C) builds on managed and inherits its constraint. (D) drops the entire write path — wrong if you need full CRUD. References: SAP Help Portal RAP §3.5 (Managed vs Unmanaged); RAP Decision Tree §2.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-079-seed-5c8a2f3d
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-079
**bias_check_notes:** No bias. RAP architectural decision.

---

## QUESTION 80: VIEW ENTITY vs DEFINE VIEW

**question_id:** QOR-SAPABAP-080
**skill_id:** senior-sap-abap
**sub_skill_id:** cds-views-advanced
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/CDS_View_Entity

**body:**

You are creating a new CDS view in S/4HANA 2023+. You see two syntactic forms: the older `DEFINE VIEW Z_OLD AS SELECT FROM …` and the newer `DEFINE VIEW ENTITY Z_NEW AS SELECT FROM …`. Which form should you use for new development on ABAP Cloud, and what's the key practical difference?

**options:**

- A) `DEFINE VIEW ENTITY` — no underlying SQL view in DDIC; faster activation, native session-variable support, mandatory for ABAP Cloud, and the only form that can be exposed via released APIs in Cloud-tier development
- B) `DEFINE VIEW` — backwards-compatible; the new form is undocumented and unstable
- C) Both are equivalent; pick whichever your team prefers
- D) `DEFINE VIEW ENTITY` is for projection layer only; `DEFINE VIEW` for interface layer

**answer_key:**

A — `DEFINE VIEW ENTITY` (introduced in 2020 with ABAP Platform 2020 / S/4HANA 2020) is the modern form. Key differences from the older `DEFINE VIEW`: (1) no implicit DDIC SQL view is generated (faster activation, less DDIC noise), (2) native session-variable support, (3) better performance on activation and runtime, (4) **mandatory** for ABAP Cloud / Steampunk development — the older form is not released for cloud development. New on-premise development should also prefer view entities. References: SAP Help Portal CDS View Entity §1.1; ABAP Cloud Development Best Practices §CDS.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-080-seed-7b3e6f1c
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-080
**bias_check_notes:** No bias. Modern CDS syntax choice.

---

## QUESTION 81: Output Management Adobe Forms → BRF+

**question_id:** QOR-SAPABAP-081
**skill_id:** senior-sap-abap
**sub_skill_id:** output-management
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/Output_Management_Migration

**body:**

A customer is migrating from ECC (NAST + SmartForms) to S/4HANA's modern Output Management Framework (Output Control with BRF+). They have 200 SmartForm templates and 15 NAST condition records driving when each form is rendered. What is the canonical migration path?

**options:**

- A) Re-author each SmartForm as an Adobe Form template; replace NAST conditions with BRF+ decision tables; configure Output Control to bind the new templates to business object types and trigger via determinations
- B) Wrap NAST in a compatibility shim — keep SmartForms unchanged; let the shim translate Output Control calls into NAST calls
- C) SmartForms are still supported in S/4HANA; no migration needed — only the determination logic moves to BRF+
- D) Discard SmartForms and switch to PDF generation outside SAP via a third-party microservice

**answer_key:**

A — The S/4HANA-recommended path is: (1) re-author each form as an Adobe Form (also called Forms by Adobe / Interactive Forms by Adobe) — Adobe Forms is the strategic forms technology in S/4HANA, (2) move NAST conditions into BRF+ decision tables (Output Determination), (3) bind templates to business object types in Output Control. (B) is wrong — there is no SAP-supported NAST shim in cloud-tier S/4. (C) is partially true (SmartForms remain technically functional in on-premise S/4HANA) but is NOT the strategic direction; cloud-tier S/4 (Public Edition) does not support SmartForms at all, and SAP's own templates are being rewritten as Adobe Forms. (D) abandons SAP-managed output entirely — usually a wrong call given audit / archival / e-invoicing integrations. References: SAP Help Portal Output Management Framework §2; SAP Note 2228611 (SmartForms vs Adobe Forms in S/4HANA).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-081-seed-2d9f4a6c
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-081
**bias_check_notes:** No bias. SAP technology migration path.

---

## QUESTION 82: HANA Native SQL — When Sanctioned

**question_id:** QOR-SAPABAP-082
**skill_id:** senior-sap-abap
**sub_skill_id:** amdp-hana
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/Native_SQL_Sanctioning

**body:**

The ABAP guidelines call Native SQL (`EXEC SQL` … `ENDEXEC.`) a code smell. When is it actually sanctioned in modern S/4HANA on-premise development?

**options:**

- A) Almost never in ABAP Cloud (it's not released); on-premise it's reserved for accessing non-SAP databases via secondary connections (`CONNECTION TO`), not for writing HANA-specific queries against the primary DB — for HANA-specific logic use AMDP or SQLScript-backed CDS table functions
- B) Whenever Open SQL is too slow — Native SQL bypasses the SQL trace
- C) For administrative DDL (CREATE TABLE, CREATE INDEX) — Open SQL doesn't support DDL
- D) When you need to use database-vendor pragmas like Oracle hints

**answer_key:**

A — Native SQL is essentially obsolete for HANA-targeted code. For HANA-native features the right tools are AMDPs (`AMDP_METHOD … BY DATABASE PROCEDURE FOR HDB LANGUAGE SQLSCRIPT`) or SQLScript-backed CDS table functions. Native SQL is sanctioned narrowly for accessing **non-SAP secondary databases** (`EXEC SQL ... CONNECTION TO 'EXTSYS' ... ENDEXEC.`) where Open SQL doesn't apply. (B) is wrong — Native SQL on the primary DB skips ABAP optimisations and authorization layers and is ATC-flagged. (C) is wrong — DDL belongs in DDIC / DDL source artefacts, not in application code. (D) is wrong — vendor hints in ABAP code are anti-portable and ATC-flagged. References: SAP ABAP Programming Guidelines §10.4 (Native SQL); SAP Help Portal Native SQL §2.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sapabap-v0.6-082-seed-9a4e1c7b
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-082
**bias_check_notes:** No bias. Database programming hygiene.

---

## QUESTION 83: CDS Table Function with AMDP (Code)

**question_id:** QOR-SAPABAP-083
**skill_id:** senior-sap-abap
**sub_skill_id:** cds-views-advanced
**format:** code
**difficulty_b:** 1.5 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/CDS_Table_Function_AMDP

**body:**

Implement a CDS table function `Z_TF_TRAVEL_AVAIL` that, given an `IV_AGENCY_ID` parameter, returns a row per route (`AGENCY_ID`, `SOURCE`, `DESTINATION`, `AVG_PRICE`, `RANK`) where `RANK` is computed via a HANA window function. Provide:

1. The CDS table-function declaration (`define table function`).
2. The AMDP method body that backs it (SQLScript).

Use HANA SQL `RANK() OVER (PARTITION BY … ORDER BY …)`. Assume the source table is `ZTRAVEL` with columns (AGENCY_ID, SOURCE, DESTINATION, PRICE).

```abap
@EndUserText.label: 'Travel availability per route'
define table function Z_TF_TRAVEL_AVAIL
  with parameters @Environment.systemField: #CLIENT
                  client : abap.clnt,
                  iv_agency_id : zde_agency_id
  returns {
    -- YOUR DECLARATION
  }
  implemented by method ZCL_TRAVEL_AMDP=>get_avail;

CLASS zcl_travel_amdp IMPLEMENTATION.
  METHOD get_avail BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT
                   USING ztravel.
    -- YOUR SQLSCRIPT BODY
  ENDMETHOD.
ENDCLASS.
```

**answer_key:**

```abap
@EndUserText.label: 'Travel availability per route'
define table function Z_TF_TRAVEL_AVAIL
  with parameters @Environment.systemField: #CLIENT
                  client : abap.clnt,
                  iv_agency_id : zde_agency_id
  returns {
    client       : abap.clnt;
    agency_id    : zde_agency_id;
    source       : zde_source;
    destination  : zde_destination;
    avg_price    : abap.dec(15,2);
    rank         : abap.int4;
  }
  implemented by method zcl_travel_amdp=>get_avail;

CLASS zcl_travel_amdp DEFINITION
  PUBLIC
  FINAL
  CREATE PUBLIC.

  PUBLIC SECTION.
    INTERFACES if_amdp_marker_hdb.
    CLASS-METHODS get_avail
      FOR TABLE FUNCTION z_tf_travel_avail.
ENDCLASS.

CLASS zcl_travel_amdp IMPLEMENTATION.
  METHOD get_avail BY DATABASE FUNCTION FOR HDB LANGUAGE SQLSCRIPT
                   OPTIONS READ-ONLY
                   USING ztravel.
    RETURN
      SELECT
        client,
        agency_id,
        source,
        destination,
        AVG( price )                                 AS avg_price,
        RANK( ) OVER ( PARTITION BY source, destination
                       ORDER BY AVG( price ) ASC )   AS rank
      FROM ztravel
      WHERE client     = :client
        AND agency_id  = :iv_agency_id
      GROUP BY client, agency_id, source, destination;
  ENDMETHOD.
ENDCLASS.
```

Key elements verified by the rubric:

1. Returns clause includes `client` field and matches CDS table-function contract.
2. AMDP class includes `if_amdp_marker_hdb` interface and the `FOR TABLE FUNCTION` declaration.
3. SQLScript body uses `RETURN SELECT` (table function form).
4. `OPTIONS READ-ONLY` allows downstream consumers to use the function in SELECT contexts.
5. Window function `RANK( ) OVER ( PARTITION BY … ORDER BY AVG( price ) )` is correctly placed in the projection.
6. Client filter `WHERE client = :client` ensures multi-tenancy.
7. `GROUP BY` covers all non-aggregated projection columns.

**rubric:**

- 5 points: All 7 elements correct; SQLScript runs without compile-time errors.
- 4 points: 5–6 elements correct; minor issues (e.g., missing `OPTIONS READ-ONLY`, off-by-one rank semantics).
- 3 points: 3–4 elements correct; uses window function but mis-partitions or omits client filter.
- 2 points: Compiles but logic wrong (missing `GROUP BY`, no window function, no client column).
- 1 point: Recognisable structure but multiple compile-time errors.
- 0 points: Not a valid CDS table function or AMDP class.

**watermark_seed:** qorium-sapabap-v0.6-083-seed-4c1a8f3e
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-083
**bias_check_notes:** No bias. Standard HANA SQL pattern.

---

## QUESTION 84: RAP Behavior with Eager Validation (Code)

**question_id:** QOR-SAPABAP-084
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-rap
**format:** code
**difficulty_b:** 1.7 (Hard)
**discrimination_a:** 1.8
**expected_duration_minutes:** 20
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_CLOUD/RAP_Validation_Determination

**body:**

For a managed RAP business object `Z_I_TRAVEL`, implement an **eager validation** named `validateBookingDate` that runs on every save and ensures `BookingDate >= today`. Provide:

1. The validation declaration in the BDEF.
2. The handler method body in the behavior pool class, including how to fetch failed key set and emit messages.

Reject save with a problem report when the validation fails. Use `T_FAILED-Z_I_TRAVEL` and `T_REPORTED-Z_I_TRAVEL` standard tables.

**answer_key:**

```abap
" ─── Behavior Definition (BDEF) ───────────────────────────────
managed implementation in class zbp_i_travel unique;
strict( 2 );

define behavior for Z_I_TRAVEL alias Travel
persistent table ztravel
lock master
authorization master ( instance )
{
  field ( numbering : managed, readonly ) TravelUuid;
  field ( mandatory ) BookingDate, AgencyId;

  create;
  update;
  delete;

  validation validateBookingDate on save { create; field BookingDate; }
}

" ─── Behavior Pool Implementation ─────────────────────────────
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS validateBookingDate FOR VALIDATE ON SAVE
      IMPORTING keys FOR Travel~validateBookingDate.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD validateBookingDate.
    READ ENTITIES OF z_i_travel IN LOCAL MODE
      ENTITY Travel
      FIELDS ( TravelUuid BookingDate )
      WITH CORRESPONDING #( keys )
      RESULT DATA(travels).

    DATA(today) = cl_abap_context_info=>get_system_date( ).

    LOOP AT travels INTO DATA(travel).
      IF travel-BookingDate < today.
        APPEND VALUE #( %tky = travel-%tky )                  TO failed-travel.
        APPEND VALUE #( %tky = travel-%tky
                        %state_area = 'VALIDATE_BOOKING_DATE'
                        %msg = new_message(
                          id        = 'ZTRAVEL'
                          number    = '001'
                          severity  = if_abap_behv_message=>severity-error
                          v1        = travel-BookingDate
                          v2        = today )
                        %element-BookingDate = if_abap_behv=>mk-on )
                                                              TO reported-travel.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.
ENDCLASS.
```

Key elements:

1. BDEF marks the validation `on save` and ties it to the `BookingDate` field for triggering.
2. Handler signature `FOR VALIDATE ON SAVE` with `IMPORTING keys FOR Travel~validateBookingDate`.
3. `READ ENTITIES IN LOCAL MODE` retrieves only the keys + needed fields.
4. Failed keys appended to `failed-travel` so RAP rolls back the save.
5. Reported messages appended to `reported-travel` with `%state_area`, `%msg`, and `%element-BookingDate` so the UI highlights the problem field.
6. `cl_abap_context_info=>get_system_date( )` for the `today` reference (platform-agnostic).
7. Severity = `error` (RAP rolls the save back); for advisory messages use `warning`.

**rubric:**

- 5 points: All 7 elements correct; compiles; handler emits both failed + reported correctly.
- 4 points: 5–6 elements correct; minor (e.g., uses `sy-datum` instead of context API — works on-prem but not in Cloud).
- 3 points: 3–4 elements correct; partial (only failed without reported, or message lacks `%element` link).
- 2 points: Compiles but mis-targeted (validation declared as determination, or message severity wrong).
- 1 point: Structural attempt but missing handler signature or BDEF link.
- 0 points: Not a valid RAP validation.

**watermark_seed:** qorium-sapabap-v0.6-084-seed-6f2a9d1c
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-084
**bias_check_notes:** No bias. Standard RAP validation pattern.

---

## QUESTION 85: Custom ATC Check Class (Code)

**question_id:** QOR-SAPABAP-085
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-test-cockpit
**format:** code
**difficulty_b:** 1.6 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/ATC_Custom_Check_Class_Implementation

**body:**

Implement a custom ATC check class `ZCL_ATC_NO_NATIVE_SQL` that scans ABAP source for `EXEC SQL` blocks and emits a finding for each one. Provide the class header and the `RUN` method.

Skip secondary-connection sanctioned uses (`CONNECTION TO`) — emit findings only for primary-connection Native SQL.

```abap
CLASS zcl_atc_no_native_sql DEFINITION
  PUBLIC
  INHERITING FROM cl_ci_test_root
  CREATE PUBLIC.
  " YOUR DECLARATIONS
ENDCLASS.

CLASS zcl_atc_no_native_sql IMPLEMENTATION.
  " YOUR RUN METHOD
ENDCLASS.
```

**answer_key:**

```abap
CLASS zcl_atc_no_native_sql DEFINITION
  PUBLIC
  INHERITING FROM cl_ci_test_root
  CREATE PUBLIC.

  PUBLIC SECTION.
    METHODS:
      constructor,
      run REDEFINING.

  PROTECTED SECTION.
    METHODS:
      get_attributes REDEFINING,
      put_attributes REDEFINING.
ENDCLASS.

CLASS zcl_atc_no_native_sql IMPLEMENTATION.
  METHOD constructor.
    super->constructor( ).
    description = 'No Native SQL on primary DB connection'.
    category    = 'CL_CI_CATEGORY_PERFORMANCE_DB'.
    version     = '0001'.
    position    = '900'.
    has_attributes = abap_false.
    attributes_ok  = abap_true.

    " Severity codes available on ATC findings.
    me->scimessages = VALUE #(
      ( test = me->myname code = '001'
        kind = c_error    pcom = '@001@ Native SQL on primary connection (use AMDP / Open SQL)' )
    ).
  ENDMETHOD.

  METHOD run.
    DATA(source_lines) = get_source( ).        " inherited helper
    DATA in_exec_sql TYPE abap_bool.
    DATA in_secondary TYPE abap_bool.

    LOOP AT source_lines ASSIGNING FIELD-SYMBOL(<line>).
      DATA(stripped) = to_upper( condense( <line>-source ) ).

      IF stripped CS 'EXEC SQL'.
        in_exec_sql  = abap_true.
        in_secondary = abap_false.
        DATA(start_index) = sy-tabix.
        CONTINUE.
      ENDIF.

      IF in_exec_sql = abap_true AND stripped CS 'CONNECTION TO '.
        in_secondary = abap_true.
      ENDIF.

      IF in_exec_sql = abap_true AND stripped CS 'ENDEXEC'.
        IF in_secondary = abap_false.
          inform(
            p_test  = me->myname
            p_code  = '001'
            p_kind  = c_error
            p_line  = start_index
            p_param_1 = | Line { start_index } |
          ).
        ENDIF.
        in_exec_sql  = abap_false.
        in_secondary = abap_false.
      ENDIF.
    ENDLOOP.
  ENDMETHOD.

  METHOD get_attributes.   " no attributes for this check
  ENDMETHOD.

  METHOD put_attributes.
  ENDMETHOD.
ENDCLASS.
```

Key elements:

1. Inherits `cl_ci_test_root` (the canonical Code Inspector / ATC base class).
2. Constructor sets `description`, `category`, `version`, and registers the message in `scimessages`.
3. `run` is the per-object-checked entry; it consumes `get_source( )` (inherited helper) returning the source-line table.
4. Detects `EXEC SQL` opening, tracks secondary-connection sanction via `CONNECTION TO`, closes on `ENDEXEC`.
5. Emits `inform( )` only when the EXEC SQL block was on the primary connection.
6. `get_attributes` / `put_attributes` are required overrides even when there are no attributes (CIB protocol).

**rubric:**

- 5 points: Inherits `cl_ci_test_root`, registers message, scans correctly, distinguishes secondary-connection blocks, emits one finding per offending block.
- 4 points: 4 of 5 above; minor (e.g., misses secondary-connection skip — still useful but flags sanctioned cases).
- 3 points: Inherits + scans + emits but misses per-block boundary (emits per line instead) or misses required overrides.
- 2 points: Stub class with right inheritance but logic doesn't actually emit findings.
- 1 point: Wrong base class but right intent.
- 0 points: Not an ATC check.

**watermark_seed:** qorium-sapabap-v0.6-085-seed-3c7b1f4a
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-085
**bias_check_notes:** No bias. Code Inspector / ATC implementation.

---

## QUESTION 86: Concurrency-Safe Number Range Allocation (Code)

**question_id:** QOR-SAPABAP-086
**skill_id:** senior-sap-abap
**sub_skill_id:** enqueue-locking
**format:** code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/Number_Range_Concurrency

**body:**

Two parallel update tasks must allocate the next quote number from number-range object `ZQUOTE`. Implement `get_next_quote_number( )` such that gap-free, monotonically-increasing numbers are produced even under concurrent calls. Use the SAP enqueue framework + `NUMBER_GET_NEXT` FM. Handle the case where the number range is exhausted.

**answer_key:**

```abap
CLASS zcl_quote_seq DEFINITION
  PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    CLASS-METHODS get_next_quote_number
      RETURNING VALUE(rv_quote_no) TYPE zqu_quoteno
      RAISING   zcx_quote_seq.
ENDCLASS.

CLASS zcl_quote_seq IMPLEMENTATION.
  METHOD get_next_quote_number.
    DATA: lv_returncode TYPE inri-returncode,
          lv_number     TYPE inri-nrlevel,
          lv_quan_used  TYPE i.

    " Number-range FM internally enqueues the range; we use _SCOPE = 1
    " so the lock survives the COMMIT WORK we'll execute later.
    CALL FUNCTION 'NUMBER_GET_NEXT'
      EXPORTING
        nr_range_nr             = '01'
        object                  = 'ZQUOTE'
        quantity                = '1'
      IMPORTING
        number                  = lv_number
        returncode              = lv_returncode
        quantity_used           = lv_quan_used
      EXCEPTIONS
        interval_not_found      = 1
        number_range_not_intern = 2
        object_not_found        = 3
        quantity_is_0           = 4
        quantity_is_not_1       = 5
        interval_overflow       = 6
        buffer_overflow         = 7
        OTHERS                  = 99.

    IF sy-subrc = 6 OR lv_returncode = '2'.
      RAISE EXCEPTION TYPE zcx_quote_seq
        EXPORTING textid = zcx_quote_seq=>range_exhausted.
    ELSEIF sy-subrc <> 0.
      RAISE EXCEPTION TYPE zcx_quote_seq
        EXPORTING textid = zcx_quote_seq=>technical_error
                  subrc  = sy-subrc.
    ENDIF.

    " Returncode = '1' = warning at threshold (e.g., 90% used).
    " Returncode = '2' = exhausted (we threw above).
    " Empty / '0' = OK.

    rv_quote_no = lv_number.

    " IMPORTANT: caller must COMMIT WORK in the same LUW that persists
    " the entity using this number so the FM's internal commit happens
    " atomically with the business commit. The number is RESERVED but
    " not yet COMMITTED until the caller's COMMIT WORK runs.
  ENDMETHOD.
ENDCLASS.
```

Key elements:

1. Uses `NUMBER_GET_NEXT` — the only SAP-supported entry point for monotonic number-range allocation under concurrency. The FM internally enqueues the range using `ENQUEUE_E_NRIV` (scope = process) so two parallel tasks serialise on the range lock.
2. Maps `interval_overflow` (sy-subrc = 6) AND `returncode = '2'` to a domain "exhausted" exception.
3. Documents that the **caller** must `COMMIT WORK` in the same LUW that persists the entity — otherwise the number is reserved in the FM's update task but the entity persistence rolls back, creating a gap.
4. Does NOT roll its own enqueue / DB row — that would race against parallel callers and produce duplicates.

Common pitfalls the answer avoids:

- Reading `MAX( quote_no )` and incrementing — broken under concurrency, common antipattern.
- Calling `COMMIT WORK` inside `get_next_quote_number` — corrupts the caller's LUW.
- Catching `interval_overflow` silently — silently produces malformed numbers downstream.

**rubric:**

- 5 points: Uses `NUMBER_GET_NEXT`, handles all 4 exit cases, documents commit-coupling, lifts exhaustion to a domain exception.
- 4 points: Uses `NUMBER_GET_NEXT` and handles 3 exit cases.
- 3 points: Uses `NUMBER_GET_NEXT` but misses exhaustion handling OR commits inside the method.
- 2 points: Rolls own enqueue + counter table — race conditions present but at least uses lock object.
- 1 point: Uses `MAX( quote_no ) + 1` antipattern — broken under concurrency.
- 0 points: Doesn't address concurrency at all.

**watermark_seed:** qorium-sapabap-v0.6-086-seed-8a3d2f5b
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-086
**bias_check_notes:** No bias. Standard SAP number-range pattern.

---

## QUESTION 87: Multi-Tenant SaaS Namespace in BTP ABAP Environment (Design)

**question_id:** QOR-SAPABAP-087
**skill_id:** senior-sap-abap
**sub_skill_id:** multi-tenant-design
**format:** design
**difficulty_b:** 1.8 (Hard)
**discrimination_a:** 1.8
**expected_duration_minutes:** 20
**citation:** SAP Help Portal: help.sap.com/docs/ABAP_PLATFORM/BTP_ABAP_Multi_Tenancy

**body:**

You are an ISV building a SaaS application on SAP BTP ABAP Environment (Steampunk). You will sell to ~50 customers who each get a logically isolated tenant. SAP's BTP ABAP Environment offers two patterns: (1) one ABAP system per tenant, or (2) one shared ABAP system with logical tenants.

Design the namespace + tenant-isolation strategy. Cover: (a) namespace registration with SAP, (b) data isolation, (c) extensibility model exposed to customers, (d) the deployment / lifecycle implications. 400–600 words.

**answer_key (design rubric accepts coherent trade-off articulation):**

**Recommended approach: hybrid — shared development namespace, customer-specific tenants in a multi-tenant SaaS configuration.**

**(a) Namespace registration:**
ISV reserves an SAP-issued namespace (e.g., `/MYISV/`) covering all repository objects (CDS, classes, BDEFs, tables, etc.). All productive development occurs under this namespace; no customer ever creates objects there. Customers extend via released APIs only — never by writing into the ISV namespace. This is required for SAP-supported SaaS on BTP ABAP Environment; the namespace registration is part of partner certification.

**(b) Data isolation:**
Two layers:
1. **Tenant-aware client field**: every ISV table includes a `client` (`mandt`) column. The CDS view entities filter by `@Environment.systemField: #CLIENT` — a session variable that the BTP runtime sets per-tenant on every request. An attacker cannot forge this from outside ABAP.
2. **Authorization classes** declared in BDEFs (`authorization master ( instance )`) tie each business object to a tenant-scoped authorization object. Customer-A users cannot read or write Customer-B rows even if they obtained a UUID by other means.

**(c) Extensibility:**
Customers extend via the released API surface only:
- **Custom fields** (Key User Extensibility) — added to released CDS view entities + saved alongside ISV data in the ISV table's INCLUDE structure.
- **Custom logic** (Side-by-side Extensions) — runs in the customer's own BTP subaccount, calls the ISV's public API (typically OData v4 generated by RAP services).
- **Custom output forms / printouts** (Customer-managed via Output Control + BRF+).
- **Wave-1 in-app**: ABAP Cloud Released APIs only; never modifications, never enhancement spots.

**(d) Deployment + lifecycle:**
- Single transport landscape (DEV → TEST → PROD) but PROD hosts all customer tenants.
- Schema migrations apply atomically across all tenants — the ISV must validate against the largest tenant's data volume before release.
- A "blue / green tenant" pattern is feasible for high-stakes upgrades: provision a parallel tenant for a single customer, replay traffic, validate, then promote.
- ISV monitors per-tenant metrics (response time, error rate, storage growth) via SAP Cloud ALM; SLAs are per-tenant.

**Trade-off articulation:**
- Pattern (1) — one ABAP system per tenant — gives strongest isolation but explodes operational cost (~50× license and 50× landscape management). Suitable only for top-tier customers needing dedicated compliance.
- Pattern (2) — shared system with logical tenants — is the SAP-canonical SaaS pattern and the only one that scales economically to 50+ tenants.
- Hybrid: most customers on shared (default), the largest 1–2 customers on dedicated tenants for compliance / data-residency reasons (e.g., a German customer demanding data stays in eu10 while the rest ship from us10). The hybrid carries a development-namespace cost (need version-skew handling) but is operationally manageable.

**Risks watched:**
- Cross-tenant data leakage if a developer forgets the `WHERE client = …` filter in a non-CDS code path. Mitigation: an ATC custom check (see Q85) blocks Native SQL and audits Open SQL access patterns; CDS view entities with `@Environment.systemField: #CLIENT` enforce the filter automatically.
- Schema migrations that lock large tables affect all tenants simultaneously. Mitigation: use online schema-change techniques (HANA `ALTER TABLE` + ABAP-managed DB structure) and stagger heavy migrations into off-peak windows per region.
- Per-tenant capacity exhaustion (one noisy tenant burns shared CPU). Mitigation: SAP's BTP ABAP rate-limit policies + per-tenant Cloud ALM thresholds.

**rubric:**

- 5 points: Comprehensive — addresses all 4 dimensions (namespace, data isolation, extensibility, lifecycle); articulates trade-offs between dedicated-system vs shared-tenant; surfaces specific risk + mitigation; reflects SAP-current cloud-first patterns (ABAP Cloud Released APIs, BDEF authorization, session variables).
- 4 points: Strong — addresses all 4 but trade-off articulation light, OR articulation strong but a dimension (extensibility OR lifecycle) is thin.
- 3 points: Addresses 3 dimensions but trade-off shallow; mentions namespace registration but doesn't tie to extensibility model.
- 2 points: Lists patterns but doesn't pick one; misses BTP-specific concepts like Released APIs / Key User Extensibility.
- 1 point: Acknowledges multi-tenancy but generic — could be any SaaS, not BTP ABAP-specific.
- 0 points: Off-topic.

**watermark_seed:** qorium-sapabap-v0.6-087-seed-1f4c8a3e
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-087
**bias_check_notes:** No bias. SAP-current SaaS architecture topic.

---

## QUESTION 88: Global Rollout — HANA-Native Feature Acceptability (Design)

**question_id:** QOR-SAPABAP-088
**skill_id:** senior-sap-abap
**sub_skill_id:** s4-migration-design
**format:** design
**difficulty_b:** 1.6 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_ON-PREMISE/HANA_Native_Feature_Acceptability

**body:**

Your global ABAP team is migrating an ECC application to S/4HANA on HANA. The customer is currently on HANA but evaluating SAP HANA Cloud (eventually) AND has separate non-S/4 satellite systems on Oracle that this application must continue to access via secondary connections.

For each of the following HANA-native features, decide whether it's acceptable for inclusion in the new code, and justify briefly:

(a) AMDP backed by HANA SQLScript with `RANK( ) OVER ( … )` window function
(b) Native SQL `EXEC SQL ... ENDEXEC.` calling the Oracle satellite via `CONNECTION TO 'ORA01'`
(c) HANA-specific `WITH PARAMETERS hierarchy` clause inside a CDS view targeted at S/4HANA's primary schema
(d) `SELECT FOR UPDATE` Open SQL hint
(e) Direct HANA SQLScript `ARRAY_AGG( )` inside an AMDP

**answer_key:**

**(a) AMDP + RANK( ) OVER:** Acceptable on the primary HANA database for performance-critical paths. Justification: HANA Cloud and on-premise HANA both support window functions; AMDPs are portable across HANA versions. For maximum portability, package as a CDS table function so future SQL-engine upgrades absorb the migration. Run in `OPTIONS READ-ONLY` for query side; reserve write-AMDPs for cases that justify the diagnostic complexity.

**(b) Native SQL via CONNECTION TO 'ORA01':** Acceptable specifically because the target is a secondary, non-SAP database. This is the sanctioned use of Native SQL (per Q82). Wrap each call in a thin DAO class so all Oracle calls are auditable in one place. Document the dependency in the architecture doc; surface failures via the standard logging framework, not silent retry.

**(c) WITH PARAMETERS hierarchy in CDS:** Acceptable but use cautiously. Hierarchies are HANA-only and the CDS hierarchy syntax is HANA-specific. Performance is excellent but the application becomes harder to lift to a non-HANA edition. For QOrium-style ISV development that targets only HANA-backed S/4, the trade-off favors using it. Fence the hierarchy view with `@Analytics.dataExtraction.enabled: false` if it's a transactional context to avoid CDC pulls breaking on the hierarchy materialisation cost.

**(d) `SELECT FOR UPDATE`:** Acceptable on HANA — it is supported and translates into a row-level lock. Use it for the canonical "read-then-write" race-protection pattern. Caveat: combine with explicit `COMMIT WORK` semantics; long-held FOR UPDATE locks degrade HANA concurrency. Prefer the SAP-standard enqueue framework for application-logical locks (see Q76, Q86); use SELECT FOR UPDATE only where a database-level lock is the right granularity (rare in transactional ABAP).

**(e) HANA SQLScript `ARRAY_AGG( )`:** Acceptable inside an AMDP. SQLScript's `ARRAY_AGG` is HANA-native and not portable to other databases, but neither is the AMDP itself; consistency. Useful for collapsing child rows into a single aggregated value (e.g., comma-separated tags). For column-store target tables, prefer flattening via projection if downstream consumers are aggregation-heavy — `ARRAY_AGG` materialises values in row form which can hurt downstream window queries.

**Cross-cutting principle**: ABAP Cloud / Steampunk forbids direct HANA-native code (no AMDP, no Native SQL). For on-premise S/4 with no Cloud-tier ambition, HANA-native is acceptable when fenced; for any code that may eventually run in a Cloud-tier ABAP target, restrict to released ABAP Cloud APIs + CDS view entities.

**Risks watched:**
- HANA Cloud feature parity drift — once the customer migrates to HANA Cloud, some on-prem-only features may need rewriting; track via the SAP Note feed for HANA Cloud SQL parity.
- Oracle secondary-connection latency degrades the user-facing flow — mitigation: cache reference data in ABAP and refresh via bgRFC on a schedule.

**rubric:**

- 5 points: Each of (a)–(e) classified correctly with technical justification; cross-cutting Cloud-tier principle noted; risks cited.
- 4 points: 4 of 5 correct; minor justification gap on one.
- 3 points: 3 of 5 correct; reasoning mostly sound.
- 2 points: 2 of 5 correct; common confusion on Native-SQL acceptability or window-function portability.
- 1 point: Some correct decisions but no justification.
- 0 points: All wrong / off-topic.

**watermark_seed:** qorium-sapabap-v0.6-088-seed-9c2e5a4d
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-088
**bias_check_notes:** No bias. SAP-current SQL technology decisions.

---

## QUESTION 89: End-to-End RAP Service with Side-Effects (Case Study)

**question_id:** QOR-SAPABAP-089
**skill_id:** senior-sap-abap
**sub_skill_id:** abap-rap
**format:** casestudy
**difficulty_b:** 2.1 (Very Hard)
**discrimination_a:** 1.9
**expected_duration_minutes:** 30
**citation:** SAP Help Portal: help.sap.com/docs/SAP_S4HANA_CLOUD/RAP_End_To_End_With_Side_Effects

**body:**

**Scenario:** You are designing a `Travel` end-to-end RAP service for a multi-region travel-booking SaaS. Requirements:

1. Recruiters / travel agents create / update / cancel bookings via Fiori Elements (OData v4, RAP-managed business object).
2. On every save, BookingDate validation runs (see Q84).
3. On successful save, an outbound bgRFC publishes a `BookingChanged` event to a downstream financial system. Failures must NOT roll back the SAP commit (financial system is eventually consistent).
4. Cancellation triggers a refund determination that depends on the booking's date and amount; the determination MUST run even if the user only changed the cancellation reason and not the cancellation flag.
5. List view in Fiori must show "Refund Eligible" + "Refund Amount" computed at read time without round-tripping to the database.
6. `AgencyId` field is read-only after creation; the framework must enforce this at the BDEF level.
7. The application runs in ABAP Cloud (Steampunk) and must not use any non-Released APIs.

Design the BDEF + projection layer + behavior pool. Cover: validation declaration, determination on modify (with which trigger), action for `cancel` + side effects, computed read-only fields in projection, field control, side-effect declaration for refund, error / message strategy, eventual-consistency strategy for bgRFC.

**answer_key:**

**1. Behavior Definition (root entity):**

```abap
managed implementation in class zbp_i_travel unique;
strict( 2 );
with draft;

define behavior for Z_I_Travel alias Travel
persistent table ztravel
draft table ztraveldraft
lock master total etag LastChangedAt
authorization master ( instance )
{
  field ( numbering : managed, readonly ) TravelUuid;
  field ( mandatory )                     BookingDate, AgencyId;
  field ( readonly : update )             AgencyId;          // (6) read-only after create
  field ( readonly )                      RefundEligible, RefundAmount;  // (5) computed at read

  create;
  update;
  delete;

  action ( features : instance ) cancel result [1] $self;     // (4) cancellation action
  side effects { action cancel affects $self;                  // refresh after cancel
                 field BookingDate affects field RefundAmount; }

  validation validateBookingDate on save { create; field BookingDate; }   // (2)
  determination computeRefund on modify { create; field BookingDate, BookingAmount, Cancelled, CancelReason; } // (4)

  determination publishBookingChanged on save { create; update; field BookingDate, BookingAmount, Cancelled; } // (3)
}
```

**2. Projection layer (consumed by Fiori):**

```abap
@AccessControl.authorizationCheck: #CHECK
@EndUserText.label: 'Travel projection'
define root view entity Z_C_Travel as projection on Z_I_Travel
{
  key TravelUuid,
      AgencyId,
      BookingDate,
      BookingAmount,
      Cancelled,
      CancelReason,
      // computed at read-time via virtual elements (no DB round-trip)
      @ObjectModel.virtualElement: true
      @ObjectModel.virtualElementCalculatedBy: 'ABAP:ZCL_TRAVEL_VE_REFUND'
      virtual RefundEligible : abap_boolean,
      @ObjectModel.virtualElement: true
      @ObjectModel.virtualElementCalculatedBy: 'ABAP:ZCL_TRAVEL_VE_REFUND'
      virtual RefundAmount   : abap.dec(15,2),
      LastChangedAt
}
```

**3. Behavior pool method skeleton:**

```abap
CLASS lhc_travel DEFINITION INHERITING FROM cl_abap_behavior_handler.
  PRIVATE SECTION.
    METHODS:
      validateBookingDate FOR VALIDATE ON SAVE
        IMPORTING keys FOR Travel~validateBookingDate,
      computeRefund FOR DETERMINE ON MODIFY
        IMPORTING keys FOR Travel~computeRefund,
      publishBookingChanged FOR DETERMINE ON SAVE
        IMPORTING keys FOR Travel~publishBookingChanged,
      cancel FOR MODIFY
        IMPORTING keys FOR ACTION Travel~cancel RESULT result.
ENDCLASS.

CLASS lhc_travel IMPLEMENTATION.
  METHOD computeRefund.
    " Re-fetch the relevant fields, calculate refund_amount + refund_eligible
    " into business-data fields via UPDATE ENTITIES (no commit; framework
    " orchestrates the LUW).
    READ ENTITIES OF z_i_travel IN LOCAL MODE
      ENTITY Travel FIELDS ( BookingDate BookingAmount Cancelled CancelReason )
      WITH CORRESPONDING #( keys ) RESULT DATA(travels).

    LOOP AT travels INTO DATA(t).
      DATA(eligible)  = COND abap_boolean( WHEN t-Cancelled = abap_true
                                              AND t-BookingDate >= cl_abap_context_info=>get_system_date( )
                                            THEN abap_true ELSE abap_false ).
      DATA(amount)    = COND zde_amount( WHEN eligible = abap_true
                                            THEN t-BookingAmount * '0.80'  " 20% cancellation fee
                                            ELSE 0 ).
      MODIFY ENTITIES OF z_i_travel IN LOCAL MODE
        ENTITY Travel
        UPDATE FIELDS ( RefundEligible RefundAmount )
        WITH VALUE #( ( %tky = t-%tky
                        RefundEligible = eligible
                        RefundAmount   = amount ) )
        FAILED failed REPORTED reported.
    ENDLOOP.
  ENDMETHOD.

  METHOD publishBookingChanged.
    " (3) Eventual-consistency outbound. We enqueue into bgRFC's outbound
    " queue. If the bgRFC dispatch later fails, the SAP commit STILL stands —
    " the bgRFC framework retries autonomously.
    READ ENTITIES OF z_i_travel IN LOCAL MODE
      ENTITY Travel FIELDS ( TravelUuid BookingDate BookingAmount Cancelled )
      WITH CORRESPONDING #( keys ) RESULT DATA(travels).

    DATA(destination) = cl_bgrfc_destination_outbound=>create( i_destination = 'BGRFC_FIN' ).
    DATA(unit)        = destination->create_qrfc_unit( i_queue_name = 'TRAVEL_EVENTS' ).
    LOOP AT travels INTO DATA(t).
      CALL FUNCTION 'Z_FIN_BOOKING_CHANGED' IN BACKGROUND UNIT unit
        EXPORTING uuid = t-TravelUuid
                  date = t-BookingDate
                  amt  = t-BookingAmount
                  cncl = t-Cancelled.
    ENDLOOP.
    " The bgRFC unit commits with the surrounding SAP LUW.
  ENDMETHOD.

  " (other handlers omitted for brevity)
ENDCLASS.
```

**4. Eventual-consistency strategy (bgRFC):**

The bgRFC queue is committed alongside the SAP LUW (one-shot). If the SAP commit fails, the bgRFC unit rolls back too — no spurious downstream messages. If the SAP commit succeeds but the downstream dispatch fails later, bgRFC retries autonomously per its retry policy; the financial system handles deduplication via the `TravelUuid` primary key.

**5. Side-effect declaration:**

The `side effects` block in the BDEF tells the Fiori Elements client which fields to refresh after which actions. After `cancel`, refresh the entire `$self`. After `BookingDate` changes, refresh `RefundAmount` (so the UI updates without a manual re-query).

**6. Error / message strategy:**

- Validation failures use `severity-error` and `%element-…` markers so Fiori highlights the offending field.
- Determination failures (e.g., bgRFC enqueue fails) emit `severity-warning` to `reported` so the user sees an advisory but the SAP commit proceeds.
- `cancel` action emits a transactional message confirming the cancellation; refund-eligibility info is rendered via the virtual element on the next read.

**7. Read-time computed fields (virtual elements):**

`RefundEligible` and `RefundAmount` are virtual elements computed by `ZCL_TRAVEL_VE_REFUND` (an ABAP class implementing `IF_SADL_EXIT_CALC_ELEMENT_READ`). Avoids DB round-trip for read-only display values; recomputes on every read so cancellation policy changes take effect immediately without a data migration.

**rubric:**

- 5 points: Comprehensive — declares each capability in the right RAP layer (validation on save, determination on modify, action with side-effect block, virtual elements for compute-on-read, bgRFC for outbound), correctly handles eventual consistency, articulates field-control patterns, references ABAP Cloud released-APIs constraint.
- 4 points: 5 of 7 capabilities placed correctly; minor (e.g., conflates determination-on-modify with determination-on-save).
- 3 points: 3–4 capabilities placed correctly; bgRFC + virtual elements OR side-effect declaration missing.
- 2 points: Skeletal BDEF without behavior pool, or treats compute-on-read as DB-persisted fields.
- 1 point: Recognises RAP terminology but misuses it (calls everything a "validation").
- 0 points: Off-topic.

**watermark_seed:** qorium-sapabap-v0.6-089-seed-7e3a1c8f
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-089
**bias_check_notes:** No bias. RAP architectural depth on a Cloud-tier scenario.

---

## QUESTION 90: 18-Month BTP ABAP Migration of Legacy On-Prem ECC (Case Study)

**question_id:** QOR-SAPABAP-090
**skill_id:** senior-sap-abap
**sub_skill_id:** btp-integration
**format:** casestudy
**difficulty_b:** 2.3 (Very Hard)
**discrimination_a:** 1.9
**expected_duration_minutes:** 35
**citation:** SAP Help Portal: help.sap.com/docs/BTP/Migration_From_ECC_To_BTP_ABAP

**body:**

**Scenario:** A 50-year-old Indian conglomerate (8 subsidiaries, 40,000 employees, ECC 6.0 EHP8 on Oracle, ~12,000 custom ABAP objects accumulated over 20 years) has decided to migrate to S/4HANA Public Edition + BTP ABAP Environment over an 18-month window.

The custom code is a mix of:
- 3,000 reports (mostly read-only, many obsolete)
- 2,500 BAdI / Enhancement Spot implementations
- 2,000 RICEFW (Reports, Interfaces, Conversions, Enhancements, Forms, Workflows) custom objects
- 1,500 custom tables with 2 TB total data
- 1,000 IDoc / RFC integrations to ~15 satellite systems (SAP and non-SAP)
- 2,000 SmartForms / SAPscript outputs

The CTO wants an 18-month migration plan that minimises business risk while achieving:
1. Cloud-tier S/4 (RISE) baseline
2. Custom logic moved to BTP ABAP Environment (side-by-side) where customer-owned, retired where unused
3. Integration via Cloud Connector + bgRFC + REST/OData (no on-prem-style RFC where avoidable)
4. Unified output management on Adobe Forms / Output Control + BRF+
5. Continuous parallel run for 4 months at Indian payroll boundaries (year-end + appraisal cycles)

Write a 600–900 word migration plan. Cover: discovery + classification, code triage gates, risk analysis per asset class, sequencing, parallel-run strategy, rollback plan, India-specific considerations.

**answer_key (design rubric accepts coherent multi-phase plan with trade-offs):**

**Phase 0 — Discovery + Classification (Months 0-2):**

1. Run SAP Readiness Check + Custom Code Migration Worklist (CCMW) on the ECC system. CCMW classifies all 12,000 objects by:
   - Used in last 12 months (yes/no — based on usage statistics + ST03N)
   - HANA-incompatible (open-cursor SELECTs, Native SQL with vendor pragmas, deprecated function modules)
   - Cloud-tier compatible (uses only ABAP Cloud Released APIs)
2. Build a triage gate: reports unused for 12+ months → archive; BAdIs targeting deprecated extension points → mark for redesign; tables with 0 reads → mark for archive (lots of historical staging tables).
3. **India-specific**: GST + TDS + EPF / ESIC / PT / Gratuity reports need explicit retention review — even if "unused", statutory archival is 7 years.

**Phase 1 — Foundation (Months 2-5):**

1. Stand up RISE / S/4HANA Public Edition + BTP ABAP Environment in `eu10` or `ap10` (data residency for Indian financial data — typically `ap10`).
2. Stand up parallel ECC sandbox with full data copy for code-impact testing.
3. Configure SAP Cloud Connector tunnel from BTP subaccount to remaining on-prem satellites (legacy CRM, custom data warehouses).
4. Cull 30-40% of the 3,000 reports (typical first-pass elimination).
5. Cull 20-30% of the 2,500 BAdI implementations (SAP standard now meets the requirement, or the requirement obsoleted itself).

**Phase 2 — RICEFW Migration (Months 4-12, parallel):**

1. **Reports**: Re-author top 30% by usage as Fiori Elements + RAP-projected views. Mid-tier 40% → Cloud-tier ABAP simple list reports. Bottom 30% deferred.
2. **Interfaces / IDocs**: SAP-to-SAP integrations migrate to API Hub + Integration Suite. SAP-to-non-SAP migrate to Cloud Connector + bgRFC outbound (per Q77 + Q78). Each IDoc gets a parallel-run validation gate where ECC + S/4 both publish for 4 weeks; reconciliation script confirms identical payloads.
3. **Conversions**: Use SAP Migration Cockpit (LTMC / LTMOM) for master-data + transactional-data migration. 1,500 custom tables triaged: 60% → standard SAP (drop the custom altogether), 25% → custom on S/4 with same schema, 15% → BTP ABAP Environment side-by-side.
4. **Enhancements**: Replace BAdI implementations with Key User Extensibility (custom fields, custom logic, custom CDS views) where possible — aggressively. Where not possible, side-by-side extension on BTP ABAP Environment.
5. **Forms**: Re-author all 2,000 SmartForms / SAPscript as Adobe Forms + Output Control with BRF+ determination (per Q81). Aggressive culling of obsolete forms (20-30%).
6. **Workflows**: SAP Build Process Automation (low-code) for new workflows; legacy WebFlow replaced selectively.

**Phase 3 — Data + Cutover (Months 12-15):**

1. Migration Cockpit for master + open transactional data using LTMOM mapping. Volume budget at 2 TB allows 3 dry-runs in the migration sandbox.
2. **India payroll considerations**: Migration timing avoids March-end (financial year close) and the appraisal cycle (April-June for most Indian corporates). Optimal window: **November cutover** so December year-end runs on S/4 with a fresh setup; January – April can do parallel runs against the legacy.
3. Bank file integration (NEFT / RTGS / IMPS payment files): pre-migration BSR/IFSC code rationalisation with the bank master data team.

**Phase 4 — Parallel Run (Months 14-18):**

1. Both ECC + S/4 receive transactions in parallel for 4 months. Daily reconciliation report compares per-document amounts; tolerance ±0.01 INR per line; >tolerance flagged for root-cause within 24 hours.
2. Cutover gate: 100% of variances explained AND 99.5% within tolerance for 3 consecutive monthly runs (covering year-end + appraisal cycles).
3. Bank disbursement remains via ECC until cutover (S/4 generates the file but ECC is the source of truth); cutover flips disbursement source after gate passes.
4. Communication plan: weekly status to CFO + CHRO; named escalation per subsidiary.

**Rollback plan:**

- ECC system stays warm for 6 months post-cutover (license cost a fraction of S/4 + BTP).
- For any subsidiary that hits a P0 the rollback returns that subsidiary to ECC for the next month-end while the issue is fixed; multi-subsidiary structure means rollback can be partial.

**Risk + mitigation table:**

| Risk | Impact | Mitigation |
|---|---|---|
| Custom code triage misclassifies "used" report as obsolete | Business stakeholder upset | CCMW + 12-month usage audit; subsidiary-CIO sign-off per region |
| Data conversion fails at scale (2 TB) | Cutover delayed | 3 dry runs in Migration sandbox; per-table data-quality checks |
| Bank file integration fails post-cutover | P0 — payroll missed | Parallel-run gate explicitly tests bank-file output |
| Union sensitivities (manufacturing arms) | Legal grievance | Joint review of Time Profiles; formal sign-off; 3-month parallel for unionised entities |
| BTP ABAP licensing surprises | Cost overrun | Quarterly TCO checkpoint with SAP partner; cap over-runs at 10% |

**Recommendation:** an aggressive triage / culling phase up-front (Phase 0-1) eliminates 30-50% of code volume before the migration begins. This is the biggest lever — every object cut is one fewer object to test, deploy, and re-train users on.

**rubric:**

- 5 points: Multi-phase plan covering Phase 0 → Phase 4; quantified triage (% culled per asset class); India-specific timing + statutory considerations; per-asset-class risk + mitigation; explicit rollback path; references SAP-current tooling (CCMW, Migration Cockpit, Cloud Connector, BTP ABAP Environment, Adobe Forms, BRF+, Build Process Automation).
- 4 points: Strong but missing one phase OR India-specific considerations are generic (no GST/TDS/EPF specificity).
- 3 points: 3 of 4 phases covered; risk table partial; tooling references mixed (some retired tools mentioned).
- 2 points: Single-phase "migrate everything at once" plan; no triage; no rollback.
- 1 point: Mentions the right vocabulary (RICEFW, Migration Cockpit) but no plan structure.
- 0 points: Off-topic / no SAP migration content.

**watermark_seed:** qorium-sapabap-v0.6-090-seed-2c6a1b5e
**variant_seed:** qorium-sapabap-v0.6-2026-05-07-090
**bias_check_notes:** Multi-region, multi-subsidiary, India-context-rich case study (Indian conglomerate). India-specific points (GST, EPF, payroll cycle timing, bank-file integration) are appropriate given QOrium's primary market and the candidate audience (senior SAP-ABAP engineers at Indian GCCs / IT services firms). Non-India-experienced candidates can still score on phase structure, risk analysis, parallel-run design, and rollback strategy — the rubric allocates points across both India-specific AND general migration-engineering dimensions.

---

## End of Wave 2 SAP-ABAP Extension 071–090

**Set status:** 20/20 v0.6 complete. SME Lead validation pending across Q071-Q090. NOT for external delivery without SME-Lead sign-off and IRT calibration (per SO-21).

**Bridge note:** This file mirrors the structure of `customer-zero/Wave-2-SAP-ABAP-Extension-021-050.md` so the Wave-1 ingest script (`services/readybank/src/scripts/ingest-wave1.ts`) consumes both files identically. Format synonyms (`solution:` / `reference_solution:` / `evaluation_rubric:`) supported per Sprint 1.7e parser hardening.

**Coverage by sub-skill (post Q090):**

- abap-oo-fundamentals: Q021-Q026 (existing)
- hana-open-sql: Q027-Q034 (existing)
- abap-test-cockpit: Q035-Q040 (existing) + Q074, Q085 (new = 8 total)
- abap-cloud-rap (renamed abap-rap): Q041-Q046 (existing) + Q071, Q079, Q084, Q089 (new = 10 total)
- s4-migration: Q047-Q050 (existing) + Q088 (new = 5 total)
- cds-views-advanced: Q072, Q080, Q083 (new = 3 total)
- amdp-hana: Q073, Q082 (new = 2 total)
- abap-unit-testing: Q075 (new = 1 total)
- enqueue-locking: Q076, Q086 (new = 2 total)
- bgrfc-async: Q077 (new = 1 total)
- btp-integration: Q078, Q090 (new = 2 total)
- output-management: Q081 (new = 1 total)
- multi-tenant-design: Q087 (new = 1 total)
- s4-migration-design: Q088 (new = 1 total)

Total Wave-2 SAP-ABAP authored: **70 + 20 = 90 of 100 target**. Q091-Q100 in next round.
