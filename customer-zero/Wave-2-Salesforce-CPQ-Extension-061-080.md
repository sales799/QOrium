# Wave 2: Salesforce CPQ Extension Questions 061–080

**STATUS:** AI-drafted v0.6 EXTENSION (continues `Wave-2-Salesforce-CPQ-Extension-021-040.md` and `041-060.md`). SME Lead validation pending. NOT for external delivery.

**Scope:** 20 questions (QOR-SFCPQ-061 through QOR-SFCPQ-080) advancing CPQ coverage on Apex async patterns, LWC, Flow vs Apex, DocuSign integration, Quote Template + Price Rules + Product Rules deep-dive, Bundle structuring, pricing waterfall, asset / order transition, Big Objects, Salesforce DX.

**Difficulty Distribution:** 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.
**Format Distribution:** 12 MCQ / 4 Code / 2 Design / 2 Case-Study.

---

## QUESTION 61: Apex Governor Limits — SOQL Query Limits

**question_id:** QOR-SFCPQ-061
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** apex-governor-limits
**format:** MCQ
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce Apex Developer Guide: developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_gov_limits.htm

**body:**

In a synchronous Apex transaction, what is the SOQL query limit?

**options:**

- A) 100 SOQL queries per synchronous transaction; 200 in async (Batch / Queueable / Future)
- B) 50 SOQL queries; same in sync and async
- C) Unlimited; the limit is on rows returned (50,000)
- D) 10 SOQL queries hard limit

**answer_key:**

A — Synchronous Apex: 100 SOQL queries / transaction. Asynchronous (Batch, Queueable, Future, Scheduled): 200 SOQL queries / transaction. The 50,000 row limit is separate and applies in both contexts. (B), (C), (D) are wrong limits. References: Salesforce Apex Governor Limits §Per-Transaction Limits.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-061-seed-2a8f1c4e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-061
**bias_check_notes:** No bias. Standard Apex limits.

---

## QUESTION 62: Queueable vs Future vs Batch

**question_id:** QOR-SFCPQ-062
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** async-apex
**format:** MCQ
**difficulty_b:** -0.5 (Easy)
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Async Apex Documentation: developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_async_overview.htm

**body:**

You need to chain 3 async Apex jobs in sequence. Job B depends on Job A's result; Job C depends on Job B. Which async pattern is canonical?

**options:**

- A) Queueable Apex with chaining via `System.enqueueJob()` from within a Queueable's `execute()` method — supports up to 50 chained jobs, can pass complex SObject arguments, each job has its own governor limits
- B) `@future` methods chained — each future calls the next via @future
- C) Batch Apex — break into 3 batches, sequentially invoked
- D) Apex Scheduler — schedule each job 1 minute apart

**answer_key:**

A — Queueable Apex is the canonical chaining pattern. `System.enqueueJob()` inside a Queueable's `execute()` method enqueues the next job; up to 50 chained Queueables. Queueables accept complex SObject + collection arguments (Future methods only accept primitives). Each Queueable execution gets its own governor limits. (B) `@future` methods cannot call other `@future`s — Salesforce blocks recursive future chains. (C) Batch is for large-volume processing, not chaining. (D) Scheduler is awkward for tight chaining + has "every 1 minute" minimum granularity. References: Salesforce Async Apex Reference §Queueable Chaining.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-062-seed-7e3c4a1f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-062
**bias_check_notes:** No bias. Async Apex pattern.

---

## QUESTION 63: LWC vs Aura — Modern Lightning Component Choice

**question_id:** QOR-SFCPQ-063
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** lightning-web-components
**format:** MCQ
**difficulty_b:** -0.4 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce LWC Developer Guide: developer.salesforce.com/docs/component-library/documentation/en/lwc

**body:**

For a new component on a Salesforce CPQ Quote page, should you use Lightning Web Components (LWC) or Aura?

**options:**

- A) LWC — Salesforce's strategic direction; better performance (web-standards based); smaller footprint; better DX; Aura is in maintenance mode
- B) Aura — better integration with CPQ
- C) Both equally; CPQ teams should pick whichever is faster
- D) Neither — use Visualforce; CPQ doesn't support modern components

**answer_key:**

A — LWC has been Salesforce's strategic direction since 2019. Salesforce CPQ supports LWC fully. Benefits: better performance (V8 engine vs Aura framework), smaller footprint, better dev experience (modern JS patterns, Module imports), Salesforce roadmap explicitly favours LWC. Aura is in maintenance mode — supported for existing components but new development should be LWC. (B) wrong — both work in CPQ. (C) doesn't capture the strategic direction. (D) Visualforce is older + worse than both for new dev. References: Salesforce LWC Strategic Direction; CPQ Customisation Best Practices §Modern Components.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-063-seed-4d8a2f1c
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-063
**bias_check_notes:** No bias. Lightning component choice.

---

## QUESTION 64: Flow vs Apex Decision — When to Use Which

**question_id:** QOR-SFCPQ-064
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** flow-vs-apex
**format:** MCQ
**difficulty_b:** 0.4 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Architects Decision Guide: architects.salesforce.com/decision-guides/automation-flow-vs-apex

**body:**

A customer needs to process 5,000 Opportunity records nightly: for each, recalculate a custom field based on related Quote Lines + send a notification if the value changed. Should this be Flow or Apex?

**options:**

- A) Apex Batch — 5,000 records exceeds Flow's bulkification + governor limits in a single execution; Batch processes in chunks of 200, has 200-SOQL limit per chunk (so per-record SOQL is fine), supports complex aggregation logic
- B) Flow scheduled at 02:00 — Salesforce's "automation-first" stance applies
- C) Apex Trigger — fires on Opportunity Update
- D) Process Builder — deprecated but still works

**answer_key:**

A — Apex Batch is right for this scenario:
- 5,000 records: Flow scheduled at one go would exhaust governor limits (101+ SOQL queries if it queries per-record).
- Batch processes in chunks of 200, each chunk is its own transaction with fresh governor limits.
- Custom-field recalculation + notification logic is straightforward Apex.
- For ≤200 records, Flow scheduled is fine and "automation-first" applies. The 5,000-volume + per-record-aggregation tips this to Apex.
- (B) Flow scheduled would fail at scale.
- (C) Triggers can't be scheduled.
- (D) Process Builder is deprecated; doesn't matter anyway.
References: Salesforce Architects Decision Guide §Flow vs Apex Volume.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-064-seed-9c2a4f8e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-064
**bias_check_notes:** No bias. Tool selection.

---

## QUESTION 65: Quote Template Conditional Sections

**question_id:** QOR-SFCPQ-065
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** quote-template
**format:** MCQ
**difficulty_b:** 0.5 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Quote Templates Documentation: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/quote_templates.htm

**body:**

A CPQ Quote Template should include a "Subscription Terms" section ONLY if the quote contains subscription products. How is conditional rendering configured?

**options:**

- A) Use Template Sections with a Conditional Print Field reference: SBQQ_QuoteTemplate.Conditional Print Field = "Has_Subscription_Products__c" (a custom checkbox field on Quote populated by a workflow / Flow / Quote Calculator Plugin); Section displays only if the field evaluates true
- B) Edit the underlying HTML template
- C) Build separate Quote Templates per scenario
- D) Salesforce CPQ doesn't support conditional sections natively; use Conga Composer

**answer_key:**

A — Salesforce CPQ Quote Templates support conditional rendering via `Conditional Print Field`. Set this on the Template Section to a custom field on Quote (or Order). Common pattern: a checkbox `Has_Subscription_Products__c` populated by a Quote Calculator Plugin or by a Flow. Section renders if the field = true. Same mechanism for omitting other sections (warranty, training notes, etc.). (B) editing HTML defeats template-driven approach. (C) leads to template proliferation. (D) wrong — native CPQ supports it. References: Salesforce CPQ Quote Template Reference §Conditional Print Field.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-065-seed-3a8f1c4d
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-065
**bias_check_notes:** No bias. CPQ template feature.

---

## QUESTION 66: Price Rule Evaluation Order

**question_id:** QOR-SFCPQ-066
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** price-rules
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Price Rules Documentation: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/price_rules_evaluation.htm

**body:**

A CPQ Price Rule is configured with Evaluation Event = "On Calculate" and another with Evaluation Event = "Save". A user clicks "Calculate" then immediately "Save". In what order do the rules fire?

**options:**

- A) On Calculate runs first (during the Calculate phase, executes Pricing Conditions then Pricing Actions per applicable rule). On Save runs after — the Save phase executes only Save-event rules. Within each phase, rules execute in Evaluation Order numeric ascending.
- B) On Save fires before On Calculate because Save is a higher-priority event
- C) Both fire simultaneously; race condition behaviour
- D) Only the more-recent rule fires; newest rule wins

**answer_key:**

A — Salesforce CPQ Price Rules respect Evaluation Event sequencing:
- **On Calculate** event runs during Calculate phase (when user clicks Calculate or Quote.Calculate is invoked programmatically).
- **Save** event runs during Save (Quote save).
- Within each event, rules execute in numeric ascending Evaluation Order — control via the field on Price Rule.
- (B), (C), (D) all wrong.
References: Salesforce CPQ Reference §Price Rule Evaluation Order.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-066-seed-7c4d2a9e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-066
**bias_check_notes:** No bias. CPQ pricing rule mechanics.

---

## QUESTION 67: Product Rule — Configuration Attribute Validation

**question_id:** QOR-SFCPQ-067
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** product-rules
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Product Rules Documentation: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/product_rules_validation.htm

**body:**

A bundle has Configuration Attribute "Network Speed" with values 1 / 10 / 100 Gbps. The Edge router product can only support up to 10 Gbps. How do you enforce this?

**options:**

- A) Product Rule with Type = "Validation"; Conditions = (Edge Router added to bundle) AND (Network Speed > 10); Action = Validation Message "Edge router does not support 100 Gbps; choose Core router instead". Display blocks user from progressing.
- B) Configuration Attribute Group with "Allowed Values" that hides 100 if Edge Router selected
- C) Apex trigger on QuoteLine
- D) Edit the Product Rule's underlying SQL

**answer_key:**

A — Product Rule with Type = Validation is the canonical pattern for cross-product validation. Conditions evaluate against products in the bundle + configuration attributes. Action emits a validation message that blocks user progression. The user can see the rule's message and self-correct (choose Core router or downgrade speed). (B) Configuration Attribute "Allowed Values" applies at the attribute level, not as a function of which product is selected. (C) Apex trigger is too low-level for what Product Rules express declaratively. (D) Salesforce CPQ Product Rules don't have user-editable SQL. References: Salesforce CPQ Product Rules §Validation Type.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-067-seed-1d4f7a3c
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-067
**bias_check_notes:** No bias. CPQ product-rule validation.

---

## QUESTION 68: Bundle Mandatory + Optional Features

**question_id:** QOR-SFCPQ-068
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** bundle-structuring
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Bundle Configuration: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/bundle_features.htm

**body:**

You're modelling a "Cloud Subscription Bundle" with: 1 mandatory Compute SKU, 1 mandatory Storage SKU, 0-3 optional Add-on SKUs (analytics, security, monitoring), and 1 mandatory Support tier (selected from 3 levels). How do you model this in CPQ?

**options:**

- A) Bundle = parent product. Features (CPQ object): "Compute" (Min/Max = 1/1), "Storage" (1/1), "Add-ons" (0/3), "Support" (1/1). Each Feature has Product Options (the SKU choices). Mandatory features have a default Product Option marked Required = TRUE.
- B) One feature with all 8 SKUs; let the user pick which is which
- C) 4 separate bundles
- D) Apex code generates the structure dynamically per quote

**answer_key:**

A — Salesforce CPQ Bundle modelling: Parent Product is the bundle. **Features** are categorised slots (Compute, Storage, Add-ons, Support). Each Feature has Min/Max counts (1/1 = mandatory single, 0/3 = optional multi, 1/1 across alternatives = mandatory single-from-set). **Product Options** populate each Feature with the available SKU choices. Required = TRUE on a Product Option auto-adds it as default. (B) defeats the structure. (C) bundle-of-bundles becomes unmanageable at scale. (D) is over-engineering — declarative configuration handles this. References: Salesforce CPQ Bundle Reference §Features and Product Options.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-068-seed-9f3e1c4a
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-068
**bias_check_notes:** No bias. CPQ bundle architecture.

---

## QUESTION 69: Pricing Waterfall

**question_id:** QOR-SFCPQ-069
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** pricing-waterfall
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Pricing Waterfall: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/pricing_waterfall.htm

**body:**

What is the canonical Salesforce CPQ pricing waterfall?

**options:**

- A) List Price → (- Volume Discount) → (- Block Pricing) → (- Customer-Specific Price) → (- Partner Discount) → (- Manual Discount) → (- Distributor Discount) → Net Price; CPQ applies these in order, each subtracting from the running total
- B) List Price minus all discounts at once (sum and apply)
- C) Net Price = List Price; discounts are negotiated outside CPQ
- D) The waterfall depends on the product; CPQ doesn't have a canonical order

**answer_key:**

A — Salesforce CPQ has a canonical pricing waterfall with discount layers applied in order:
1. **List Price** (from Pricebook)
2. **− Volume / Tier Discount** (volume-based pricing rules)
3. **− Block Pricing** (specific quantity bands; sometimes substitutes for List depending on configuration)
4. **− Customer-Specific Price** (negotiated rate for this customer)
5. **− Partner Discount** (channel partner adjustment)
6. **− Manual Discount** (sales-rep adjustment within authority bands)
7. **− Distributor Discount** (final routing adjustment)
8. **= Net Price** (the price the customer pays)

Each layer subtracts from the running total — composed not summed. CPQ applies these via Price Action chains. (B), (C), (D) all wrong. References: Salesforce CPQ Pricing Reference §Waterfall.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-069-seed-2c4f8a1e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-069
**bias_check_notes:** No bias. CPQ pricing concept.

---

## QUESTION 70: Asset to Order Lifecycle

**question_id:** QOR-SFCPQ-070
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** asset-order-lifecycle
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Asset Lifecycle Documentation: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/asset_order_lifecycle.htm

**body:**

When a Salesforce CPQ Quote is "Ordered" (status = Ordered), what's the canonical downstream cascade?

**options:**

- A) Quote → Order is created with Order Lines mirroring Quote Lines; subsequently for products marked "Asset Conversion" = TRUE, an Asset record is created at order activation; for subscription products an Asset + Subscription pair is created; renewals + amendments later operate on these Assets
- B) Order is created; Quote is deleted to save storage
- C) Asset records are auto-created at the Quote phase, before Order
- D) Salesforce CPQ doesn't manage Assets; integrate with a CRM extension

**answer_key:**

A — Quote → Order → Asset cascade is the canonical CPQ model. Quote ordering creates an Order with mirroring Order Lines. At Order activation, products with `SBQQ__AssetConversion__c = TRUE` produce Assets (one per quantity, by default). Subscription products produce Assets + Subscriptions. Renewals + Amendments operate on these Asset records (creating new Quotes that reference the Asset for "Renewing"). (B) wrong — Quote is preserved for audit. (C) wrong — Assets are post-Order. (D) wrong — Assets are core to CPQ. References: Salesforce CPQ Asset Lifecycle Reference §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-070-seed-6e2a4c8f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-070
**bias_check_notes:** No bias. CPQ asset lifecycle.

---

## QUESTION 71: SOQL Selective Filter — Indexable Fields

**question_id:** QOR-SFCPQ-071
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** soql-performance
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce SOQL Selectivity: developer.salesforce.com/docs/atlas.en-us.salesforce_large_data_volumes_bp.meta/salesforce_large_data_volumes_bp/ldv_query_selectivity.htm

**body:**

A SOQL query against `Quote__c` (5 million records) is timing out. Which filter is selective + safe at this volume?

**options:**

- A) Filter on a standard indexed field (Id, Name, RecordTypeId, OwnerId, CreatedDate, LastModifiedDate) OR a custom field marked External ID OR Unique; the filter must select ≤30K records (10% of total) for the query to be selective
- B) `WHERE Status__c = 'Open'` — Status is always selective
- C) `WHERE Id LIKE '0Q0%'` — partial Id matching is fast
- D) `WHERE FORMAT(Created_At) = 'Today'` — date functions are cheap

**answer_key:**

A — Salesforce SOQL selectivity rules:
- Standard indexed fields: Id, Name, RecordTypeId, OwnerId, CreatedDate, LastModifiedDate, foreign keys to standard objects.
- Custom indexed fields: marked `External ID = TRUE` OR `Unique = TRUE`; admin-requested via Support for large objects.
- Filter selective if returns ≤30,000 records (or 10% of object total, whichever is lower).
- Without a selective filter, query becomes a full table scan and times out at 120 seconds.
(B) Status alone may not be selective (depends on data distribution). (C) `LIKE '%...%'` is unselective; partial match doesn't use index. (D) `FORMAT()` and other functions on indexed columns prevent index use. References: Salesforce SOQL Best Practices §Query Selectivity.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-071-seed-3d8f1c4e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-071
**bias_check_notes:** No bias. SOQL performance pattern.

---

## QUESTION 72: Big Object — Long-Term Archive Pattern

**question_id:** QOR-SFCPQ-072
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** big-object-archive
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Big Objects Documentation: developer.salesforce.com/docs/atlas.en-us.bigobjects.meta/bigobjects/big_object_overview.htm

**body:**

A 7-year-old Salesforce CPQ org has 50M Quote records; ~5M from the current year, the rest historical. Org limit is 50M and approaching. How do you archive without deleting data?

**options:**

- A) Build a Big Object `Quote_Archive__b` with same key fields; bulk-copy quotes older than 18 months into the Big Object; delete from `Quote__c` after copy verified. Big Objects support up to billions of records on the same org without affecting standard object limits; queryable via SOQL with `WHERE` on indexed fields; no triggers, validation rules, or workflows
- B) Export to Excel, delete from CRM, store in a SharePoint
- C) Move to a separate Salesforce org dedicated to archives
- D) Delete records older than 18 months — they're rarely used

**answer_key:**

A — Big Objects are Salesforce's native long-term archival pattern. Define `Quote_Archive__b` with custom fields matching the source schema. Bulk-copy historical records via Bulk API or Async SOQL. Delete from standard Quote__c after copy verified. Key properties:
- Up to billions of records on same org without affecting standard-object limits.
- SOQL queryable via Async SOQL on indexed fields.
- No triggers, validation rules, workflows (immutable archive).
- Storage cost lower than standard objects.

(B) loses query-ability + audit. (C) full-org-spawning is expensive + duplicates governance. (D) data loss. References: Salesforce Big Objects Implementation Guide §Archive Pattern.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-072-seed-7e2c8a4f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-072
**bias_check_notes:** No bias. Salesforce data archival.

---

## QUESTION 73: Salesforce DX — Source-Driven Development

**question_id:** QOR-SFCPQ-073
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** salesforce-dx
**format:** MCQ
**difficulty_b:** 1.1 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce DX Documentation: developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev

**body:**

What's the canonical Salesforce DX (SFDX) workflow for team-based source-driven development?

**options:**

- A) Each developer works in a scratch org; pulls source from VCS (Git) → modifies → pushes back; integration via PR + sandbox merge; deployment via SFDX CLI to production via metadata API or unlocked package; CI/CD via Jenkins / GitHub Actions running SFDX commands
- B) Developers share a single sandbox; check changes in via Change Sets
- C) SFDX is for installing packages only; not for development
- D) Always develop directly in production; SFDX is for backups

**answer_key:**

A — SFDX workflow:
1. Each dev provisions a scratch org (`sfdx force:org:create`) — short-lived, isolated.
2. Pulls source from Git (`sfdx force:source:pull`).
3. Modifies + tests in scratch org.
4. Pushes source to scratch org (`sfdx force:source:push`).
5. Commits changes to feature branch in Git.
6. Opens PR; CI pipeline runs Apex tests + LWC tests + linting.
7. Merge to main → deploy to integration sandbox → UAT → production via SFDX CLI metadata API or unlocked package.

(B) sandbox-shared model is what SFDX replaces; it has merge-conflict + version drift problems at scale. (C) wrong — SFDX is the dev tool. (D) wrong — never develop in prod. References: Salesforce DX Developer Guide §Project Setup.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-073-seed-1c4f8a3d
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-073
**bias_check_notes:** No bias. SFDX workflow.

---

## QUESTION 74: Quote Calculator Plugin (QCP) Override

**question_id:** QOR-SFCPQ-074
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** quote-calculator-plugin
**format:** MCQ
**difficulty_b:** 1.2 (Medium)
**discrimination_a:** 1.6
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ QCP Documentation: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/qcp_implementation.htm

**body:**

Standard CPQ pricing logic doesn't fit your customer's tier-discount: discount is based on running 12-month order history per customer (not per quote). What's the canonical way to implement this?

**options:**

- A) Quote Calculator Plugin (QCP) — a JavaScript Apex / LWC-flavored hook that intercepts pricing calculation. Methods: `onBeforeCalculate`, `onAfterCalculate`. Implement custom logic: query 12-month history, compute appropriate tier, apply discount. Returns updated lines back to standard pricing pipeline.
- B) Apex trigger on QuoteLine
- C) Price Rule with conditions; Salesforce Price Rules can query unrelated history
- D) Recalculate manually after Calculate runs; users do a 2-step calculate

**answer_key:**

A — Quote Calculator Plugin (QCP) is the Salesforce-sanctioned hook for custom pricing logic that exceeds Price Rule expressivity. JavaScript-based (deployed as Static Resource), with hook methods:
- `onBeforeCalculate(quote, lines, context)` — runs before standard pricing.
- `onAfterCalculate(quote, lines, context)` — runs after.
- Methods can do arbitrary callouts, mutate lines, defer to standard pricing.

For 12-month history-based discount:
1. `onBeforeCalculate` calls a `@RemoteAction` Apex method that queries 12-month order history.
2. Computes the customer's eligible tier.
3. Stamps a custom field `Customer_Tier__c` on quote lines.
4. Standard Price Rules then apply discount based on `Customer_Tier__c`.

(B) Trigger-based pricing breaks the CPQ Calculate model. (C) Price Rules don't access cross-quote history. (D) is a UX antipattern. References: Salesforce CPQ QCP Implementation Guide §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-074-seed-9a2f4c1e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-074
**bias_check_notes:** No bias. CPQ extension hook.

---

## QUESTION 75: DocuSign / Adobe Sign Integration Pattern

**question_id:** QOR-SFCPQ-075
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** esignature-integration
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ + DocuSign Integration Pattern: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/docusign_pattern.htm

**body:**

Quote with PDF generated by CPQ Quote Template needs DocuSign signature. What's the canonical integration?

**options:**

- A) DocuSign Connector (managed package) integrates with Salesforce CPQ; user clicks "Send for Signature" on the Quote, which generates the PDF + creates a DocuSign envelope; status syncs back via DocuSign Connect (webhook); on completion, signed document attached to Quote + opportunity advances to "Signed" status
- B) Email the PDF to DocuSign manually
- C) Build a custom Apex callout to DocuSign API
- D) Adobe Sign is required; DocuSign doesn't integrate

**answer_key:**

A — DocuSign Connector for Salesforce is the canonical integration. Workflow:
1. User clicks "Send for Signature" on Quote in Salesforce CPQ UI.
2. CPQ generates PDF via Quote Template.
3. DocuSign Connector creates an Envelope with the PDF + recipient info from Quote.
4. Customer receives email, signs in DocuSign.
5. DocuSign Connect (webhook) sends status updates back to Salesforce.
6. On completion, signed PDF attached to Quote; Quote.Status updated to Signed; downstream Opportunity / Order workflows fire.

(B) is the manual antipattern. (C) reinventing the wheel; the Connector handles auth + retry + error. (D) DocuSign is the most common; Adobe Sign + Conga + native eSignature also integrate with CPQ. References: Salesforce + DocuSign Integration Reference §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-075-seed-4e8c2a3f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-075
**bias_check_notes:** No bias. eSignature integration pattern.

---

## QUESTION 76: Approval Process — Multi-Step with Different Approvers

**question_id:** QOR-SFCPQ-076
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** approval-process
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Approval Documentation: developer.salesforce.com/docs/atlas.en-us.cpq.meta/cpq/approvals_setup.htm

**body:**

A quote with discount > 30% needs approval from Sales Manager THEN Sales VP. Discount > 50% additionally needs CFO. How do you configure this in Salesforce CPQ?

**options:**

- A) Salesforce CPQ Advanced Approvals (managed package) — multi-step approval chains with conditional branches; rule expressed as:
  - Step 1: Sales Manager (always if discount > 30%);
  - Step 2: Sales VP (always after Step 1);
  - Step 3: CFO (only if discount > 50%);
  Rejection at any step rolls back; approval at all steps advances Quote
- B) Standard Salesforce Approval Process — same effect, set conditions
- C) Apex code with custom approval logic
- D) Process Builder approval routing

**answer_key:**

A — Salesforce CPQ Advanced Approvals (a managed package built on top of standard approvals) supports multi-step + conditional approval chains better than vanilla Salesforce Approval Process. Key features:
- Branch conditions per step.
- Skip steps based on data conditions.
- Reuse Approval Templates across Quote / Opportunity / etc.
- Audit trail per step.

For the scenario: configure 3 Approval Templates with conditional links. (B) standard Approval Process can do simple cases but multi-step with branches is harder. (C) Apex is over-engineered. (D) Process Builder is deprecated. References: Salesforce CPQ Advanced Approvals Reference §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-076-seed-2a8d3f1c
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-076
**bias_check_notes:** No bias. Approval architecture.

---

## QUESTION 77: Apex Trigger Bulkification (Code)

**question_id:** QOR-SFCPQ-077
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** apex-bulkification
**format:** code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 15
**citation:** Salesforce Apex Trigger Best Practices: developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_triggers_bulk.htm

**body:**

Refactor the following non-bulkified Apex trigger into a bulkified version. The trigger updates Quote Total when QuoteLines change.

```apex
trigger UpdateQuoteTotal on SBQQ__QuoteLine__c (after insert, after update, after delete) {
  for (SBQQ__QuoteLine__c line : Trigger.new) {
    SBQQ__Quote__c quote = [SELECT Id, NetTotal__c FROM SBQQ__Quote__c WHERE Id = :line.SBQQ__Quote__c LIMIT 1];
    Decimal lineTotal = [SELECT SUM(SBQQ__NetTotal__c) sum FROM SBQQ__QuoteLine__c WHERE SBQQ__Quote__c = :quote.Id][0].get('sum');
    quote.NetTotal__c = lineTotal;
    update quote;
  }
}
```

**answer_key:**

```apex
trigger UpdateQuoteTotal on SBQQ__QuoteLine__c (after insert, after update, after delete, after undelete) {
  // 1. Collect distinct Quote Ids from Trigger.new + Trigger.old (covers
  //    delete + undelete + reparenting where SBQQ__Quote__c changes).
  Set<Id> quoteIds = new Set<Id>();
  if (Trigger.new != null) {
    for (SBQQ__QuoteLine__c line : Trigger.new) {
      if (line.SBQQ__Quote__c != null) quoteIds.add(line.SBQQ__Quote__c);
    }
  }
  if (Trigger.old != null) {
    for (SBQQ__QuoteLine__c line : Trigger.old) {
      if (line.SBQQ__Quote__c != null) quoteIds.add(line.SBQQ__Quote__c);
    }
  }
  if (quoteIds.isEmpty()) return;

  // 2. SINGLE aggregate query for all quotes.
  Map<Id, Decimal> totalsByQuote = new Map<Id, Decimal>();
  for (AggregateResult ar : [
       SELECT SBQQ__Quote__c quoteId, SUM(SBQQ__NetTotal__c) total
       FROM   SBQQ__QuoteLine__c
       WHERE  SBQQ__Quote__c IN :quoteIds
       GROUP BY SBQQ__Quote__c
  ]) {
    totalsByQuote.put((Id) ar.get('quoteId'),
                      (Decimal) ar.get('total'));
  }

  // 3. SINGLE update for all quotes.
  List<SBQQ__Quote__c> quotesToUpdate = new List<SBQQ__Quote__c>();
  for (Id qId : quoteIds) {
    Decimal newTotal = totalsByQuote.get(qId);   // null if all lines deleted
    if (newTotal == null) newTotal = 0;
    quotesToUpdate.add(new SBQQ__Quote__c(Id = qId, NetTotal__c = newTotal));
  }
  update quotesToUpdate;
}
```

Key elements:

1. **Collect Ids in a Set first** — deduplicates parent Quote Ids.
2. **Handle Trigger.new + Trigger.old** — covers insert/update/delete/undelete + reparenting.
3. **ONE aggregate query** for all quotes — replaces N queries inside loop.
4. **ONE update DML** for all quotes — replaces N updates inside loop.
5. **Handle null total** — set to 0 when all lines deleted.
6. **`after undelete`** trigger event added — recalculates when lines are restored.

Common pitfalls avoided:

- SOQL inside a loop (the original) — hits 100-query limit at 100 lines.
- DML inside a loop — hits 150-DML limit faster.
- Forgetting to dedupe Ids.
- Forgetting Trigger.old for delete handler.

**rubric:**

- 5 points: All 6 elements; trigger compiles; passes governor limits at 200 lines.
- 4 points: Bulkification correct (1 query + 1 DML) but minor (e.g., missing undelete handler).
- 3 points: Single query / single DML but doesn't handle Trigger.old for deletes.
- 2 points: Loops over Trigger.new with single query, but DML still in loop.
- 1 point: Recognises bulkification need but execution incomplete.
- 0 points: Doesn't address bulkification.

**watermark_seed:** qorium-sfcpq-v0.6-077-seed-3c4a8f1e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-077
**bias_check_notes:** No bias. Bulkification is canonical Apex pattern.

---

## QUESTION 78: LWC Component for CPQ Quote Page (Code)

**question_id:** QOR-SFCPQ-078
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** lightning-web-components
**format:** code
**difficulty_b:** 1.5 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 18
**citation:** Salesforce LWC Developer Guide

**body:**

Build an LWC component `QuoteDiscountSummary` to display on the Quote page: shows total discount applied across all Quote Lines, broken into Volume Discount, Customer-Specific, and Manual Discount buckets. Provide HTML template + JavaScript class + meta XML. Use `@wire` to fetch Apex data.

**answer_key:**

```html
<!-- quoteDiscountSummary.html -->
<template>
  <lightning-card title="Discount Summary" icon-name="utility:money">
    <template if:true={data}>
      <div class="slds-grid slds-gutters slds-p-horizontal_medium">
        <div class="slds-col slds-size_1-of-3">
          <p class="slds-text-title">Volume</p>
          <p class="slds-text-heading_medium">{data.volumeDiscount}</p>
        </div>
        <div class="slds-col slds-size_1-of-3">
          <p class="slds-text-title">Customer-Specific</p>
          <p class="slds-text-heading_medium">{data.customerDiscount}</p>
        </div>
        <div class="slds-col slds-size_1-of-3">
          <p class="slds-text-title">Manual</p>
          <p class="slds-text-heading_medium">{data.manualDiscount}</p>
        </div>
      </div>
      <div class="slds-p-around_medium slds-border_top slds-m-top_small">
        <strong>Total Discount: {data.totalDiscount}</strong>
      </div>
    </template>
    <template if:true={error}>
      <c-error-panel error={error}></c-error-panel>
    </template>
  </lightning-card>
</template>
```

```javascript
// quoteDiscountSummary.js
import { LightningElement, api, wire } from 'lwc';
import getDiscountSummary from '@salesforce/apex/QuoteDiscountController.getDiscountSummary';

export default class QuoteDiscountSummary extends LightningElement {
  @api recordId;            // Quote Id (auto-populated when on Quote page)

  @wire(getDiscountSummary, { quoteId: '$recordId' })
  wiredDiscount({ data, error }) {
    if (data) {
      this.data = {
        volumeDiscount:   this.fmt(data.volumeDiscount),
        customerDiscount: this.fmt(data.customerDiscount),
        manualDiscount:   this.fmt(data.manualDiscount),
        totalDiscount:    this.fmt(data.totalDiscount),
      };
      this.error = null;
    } else if (error) {
      this.error = error;
      this.data = null;
    }
  }

  fmt(val) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
      .format(val ?? 0);
  }
}
```

```xml
<!-- quoteDiscountSummary.js-meta.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<LightningComponentBundle xmlns="http://soap.sforce.com/2006/04/metadata">
  <apiVersion>59.0</apiVersion>
  <isExposed>true</isExposed>
  <targets>
    <target>lightning__RecordPage</target>
  </targets>
  <targetConfigs>
    <targetConfig targets="lightning__RecordPage">
      <objects>
        <object>SBQQ__Quote__c</object>
      </objects>
    </targetConfig>
  </targetConfigs>
</LightningComponentBundle>
```

```apex
// QuoteDiscountController.cls (server-side)
public with sharing class QuoteDiscountController {
  @AuraEnabled(cacheable=true)
  public static DiscountSummary getDiscountSummary(Id quoteId) {
    DiscountSummary result = new DiscountSummary();
    for (SBQQ__QuoteLine__c line : [
         SELECT SBQQ__VolumeDiscount__c, Customer_Discount__c, SBQQ__Discount__c
         FROM   SBQQ__QuoteLine__c
         WHERE  SBQQ__Quote__c = :quoteId
    ]) {
      result.volumeDiscount   += line.SBQQ__VolumeDiscount__c    ?? 0;
      result.customerDiscount += line.Customer_Discount__c       ?? 0;
      result.manualDiscount   += line.SBQQ__Discount__c          ?? 0;
    }
    result.totalDiscount = result.volumeDiscount + result.customerDiscount + result.manualDiscount;
    return result;
  }

  public class DiscountSummary {
    @AuraEnabled public Decimal volumeDiscount   = 0;
    @AuraEnabled public Decimal customerDiscount = 0;
    @AuraEnabled public Decimal manualDiscount   = 0;
    @AuraEnabled public Decimal totalDiscount    = 0;
  }
}
```

Key elements:

1. **`@wire` reactive fetch** — auto-refetches when `recordId` changes.
2. **`@salesforce/apex/...` import** — typed Apex method binding.
3. **Apex method `cacheable=true`** — Salesforce client-cache friendly.
4. **Currency formatting** via `Intl.NumberFormat`.
5. **Meta XML targets `lightning__RecordPage`** + `SBQQ__Quote__c` — drops onto Quote pages via Lightning App Builder.
6. **Inner `DiscountSummary` class** with `@AuraEnabled` fields — typed return.
7. **SLDS classes** for Salesforce Look & Feel.
8. **Error handling** via `@wire` error param + `<c-error-panel>` reuse.

**rubric:**

- 5 points: All 8 elements; LWC + meta XML + Apex; idiomatic SLDS.
- 4 points: 6-7 elements; minor (e.g., missing meta-XML targets).
- 3 points: HTML + JS but no Apex method shown.
- 2 points: Skeletal LWC.
- 1 point: Fragments not assembled into working component.
- 0 points: Off-topic.

**watermark_seed:** qorium-sfcpq-v0.6-078-seed-1d4f7c2a
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-078
**bias_check_notes:** No bias. Standard LWC pattern.

---

## QUESTION 79: CPQ Performance — Slow Calculate at 100+ Lines (Design)

**question_id:** QOR-SFCPQ-079
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** cpq-performance
**format:** design
**difficulty_b:** 1.6 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 18
**citation:** Salesforce CPQ Performance Best Practices

**body:**

A customer reports CPQ Calculate is taking 60+ seconds on quotes with 100+ lines. Diagnose and design the remediation. Cover: (a) profiling, (b) Price Rule + Product Rule consolidation, (c) QCP optimisation, (d) async option for very-large quotes, (e) UX during slow calc. 400-600 words.

**answer_key:**

**(a) Profiling:**

Enable Salesforce CPQ Calculator debug logging. Capture timing per phase:
- Pricing Phase 1 (List Price)
- Pricing Phase 2 (Discounts)
- Pricing Phase 3 (Manual)
- Pricing Phase 4 (Final)
- Product Rule evaluation
- Custom QCP execution
- DocuSign / external callouts (if any)

Identify the dominant phase. Common findings:
- Too many Price Rules with overlapping conditions → 60% of time.
- QCP doing per-line external API call → 30% of time.
- Configuration Attribute lookups not bulkified → 10% of time.

**(b) Price Rule + Product Rule consolidation:**

- Audit Price Rules: typical org has 50-100; trim to 20-30 by:
  - Combining rules with overlapping conditions.
  - Retiring obsolete rules.
  - Moving simple "if discount-tier then X" into a single Lookup table-driven rule.
- Same for Product Rules.

**(c) QCP optimisation:**

If QCP is slow:
- Move external callouts out of the per-line loop; batch them.
- Cache repeated lookups in `onBeforeCalculate` rather than per-line.
- Use Apex `@RemoteAction` instead of `@AuraEnabled` for pure data fetches (slightly faster path).
- Avoid synchronous external dependency; pre-compute and store on Quote header instead.

**(d) Async option for very-large quotes:**

For quotes >200 lines:
- Switch to **Background Calculation** mode (Salesforce CPQ Setting). User clicks Calculate; UI shows "Calculating..."; calc runs async; user receives notification on completion (~30-60s).
- Avoids UI freeze; avoids governor-limit issues for very large quotes.

**(e) UX during slow calc:**

- Add LWC progress indicator showing phase + percent.
- For background mode, show "Calculation in progress; will notify in 30s" prominently.
- Telemetry: log each calc with line-count + duration; alert if duration > 30s for normal-sized quotes.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Price Rule consolidation breaks existing pricing | Run a regression test pack of 100 historical quotes; calc before / after; diff |
| Async calc confuses users used to sync | Comms + training; per-user opt-in to async first |
| External callout in QCP times out | Set realistic timeouts; fallback price logic |

**Target outcomes:**

- Median Calculate < 5s for ≤50 lines; < 15s for ≤100 lines; async for > 200 lines.
- 95th percentile < 2x median.
- Telemetry visible in Splunk / Datadog dashboard.

**rubric:**

- 5 points: All 5 dimensions; profiling-driven; specific Price Rule consolidation; async option for very-large; UX considerations; targets.
- 4 points: 4 dimensions; minor.
- 3 points: 3 dimensions; profiling shallow.
- 2 points: Generic "make CPQ faster" without specific diagnoses.
- 1 point: Vague suggestions.
- 0 points: Off-topic.

**watermark_seed:** qorium-sfcpq-v0.6-079-seed-3a8f1c4e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-079
**bias_check_notes:** No bias. CPQ performance design.

---

## QUESTION 80: 12-Month CPQ Replacement of Excel-Based Quoting (Case Study)

**question_id:** QOR-SFCPQ-080
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** cpq-implementation
**format:** casestudy
**difficulty_b:** 2.0 (Very Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Salesforce CPQ Implementation Best Practices

**body:**

**Scenario:** A 200-rep Indian SaaS company (₹500Cr ARR; 5 product lines; quotes built in Excel passed via email) is implementing Salesforce CPQ in 12 months. Goals: standardise pricing + discount governance, reduce quote-creation time from 4h to 30min, integrate with DocuSign for esignature, enable subscription / renewal lifecycle, replace 3 Excel-based discount-calculation tools.

Design the 12-month rollout. Cover: (a) Phase 1 (foundation), (b) Phase 2 (productisation), (c) Phase 3 (rollout to all reps), (d) integration approach (DocuSign + accounting), (e) change management for 200 reps + sales managers, (f) success metrics. 600-900 words.

**answer_key:**

**Month 1-3 — Foundation Phase:**

- Salesforce CPQ org setup; Sandbox + Production instances.
- Configuration Hierarchy (Account / Opportunity / Quote / Order / Subscription / Asset).
- Product Catalog: 5 product lines, ~150 SKUs total. Migrate from Excel into Product2 with Pricebook entries.
- Price Books: standard + customer-specific + partner books.
- Approval Process: define 3-tier (Sales Manager > VP > CFO) based on discount thresholds.
- Quote Templates: 1 standard template + 1 enterprise variant.

Pilot users: 10 reps from 1 product line + their Sales Manager.

Risk M1-3: data quality from Excel migration. Allocate 4 weeks for cleansing.

**Month 4-6 — Productisation Phase:**

- Bundle modelling for the 2 most complex product lines (Compute / Storage suite + Analytics suite).
- Configuration Attributes (region, customer segment, volume tier).
- Price Rules: tier-based volume discount; customer-specific override; manual discount within bands.
- Product Rules: validation across products in a bundle.
- Quote Template: dynamic PDF with conditional sections (subscription terms, support tier, price breakdown).
- DocuSign Connector: install + configure; test signature flow end-to-end.
- QCP for the customer-specific tier-discount logic.

Pilot expansion: 50 reps across 3 product lines.

Risk M4-6: pricing complexity. Run pricing-comparison reports against Excel-baseline weekly.

**Month 7-9 — Subscription + Renewal:**

- Subscription Pricing setup: monthly / annual / multi-year.
- Renewal automation: 90-day-out reminder for sales rep; auto-generated renewal quote at 60 days.
- Amendment Quotes: mid-term changes (add seats, change tier).
- Asset / Subscription Lifecycle: integration with Salesforce Asset object.
- Order management: CPQ Order → ERP integration (Tally / QuickBooks via OIC or middleware).
- Multi-currency: INR for India + USD for international customers.

Pilot expansion: 100 reps across 4 product lines.

Risk M7-9: subscription billing edge cases. Run parallel-run with Excel-baseline for 4 weeks.

**Month 10-12 — Full Rollout + Integration Closure:**

- All 200 reps on Salesforce CPQ.
- Excel discount-calculation tools retired (3 separate spreadsheets archived for compliance).
- Accounting integration: signed quotes → Order → Invoice in Tally automatically.
- Sales analytics dashboards: quote-to-cash velocity, discount effectiveness, product mix.

Risk M10-12: rep adoption. Tier-1 power users mentor laggards; CSM sign-off.

**Integration approach:**

- DocuSign Connector (out-of-the-box).
- Tally / QuickBooks via OIC (custom REST integration; 1-month effort).
- BIP for signed PDFs into a versioned attachment archive.
- Salesforce-to-Slack notifications for approval workflow.

**Change management for 200 reps:**

- Tier 1 (Sales VP + Sales Managers): 3-day workshop + on-site Oracle / Salesforce consultant for 60 days.
- Tier 2 (Senior reps): 1-day workshop + live-cohort sandbox practice.
- Tier 3 (Junior reps + new hires): self-paced video + buddy system.
- Adoption tracking: % active users / month per region.
- Comp tied to CPQ adoption (managers' bonus = team-CPQ-adoption-rate × old-bonus).

**Success metrics:**

- Quote-creation time: 4h → 30min by Month 12 (8x improvement target).
- Discount governance: 100% of approved discounts logged with approval trail (was 0%).
- Quote-to-cash velocity: 21 days → 14 days (33% reduction).
- Excel tool retirement: 3/3 tools archived.
- DocuSign integration: 100% of signed quotes via DocuSign by Month 12.
- ARR analytics: 100% quote / order / asset visibility (was unknown previously).

**Risks:**

| Risk | Mitigation |
|---|---|
| Pricing complexity blows the spec | Pilot with simple product line first; phase complex product lines later |
| QCP custom code becomes a maintenance burden | Document QCP logic; CCB approval for changes; pair-programming for QCP edits |
| DocuSign integration breaks | Standard Connector; minimal customisation; on-call plan |
| Rep adoption stalls below 80% by M9 | Hands-on Power-User cohort; CHRO escalation; CEO town hall on CPQ wins |
| Tally integration breaks | OIC retry + dead-letter queue; daily reconciliation report |

**rubric:**

- 5 points: 4-quarter plan with foundation / productisation / subscription / rollout phases; integration approach (DocuSign + Tally); change management at scale; specific success metrics; risk + mitigation table.
- 4 points: 4-quarter sequence + most considerations; minor gaps.
- 3 points: 3-quarter sequence; integration shallow.
- 2 points: Sequence stub.
- 1 point: Vague rollout plan.
- 0 points: Off-topic.

**watermark_seed:** qorium-sfcpq-v0.6-080-seed-7e2a4f1c
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-080
**bias_check_notes:** Indian SaaS context; rubric distributes points across CPQ implementation dimensions so candidates with experience in any region can score.

---

## End of Wave 2 Salesforce CPQ Extension 061–080

**Set status:** 20/20 v0.6 complete. SME Lead validation pending. **Q081-Q100 in next file.**
