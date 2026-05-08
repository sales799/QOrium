# Wave 1 Extension: Senior Salesforce Developer (QOR-SF-041..060)

**STATUS:** AI-drafted v0.6 EXTENSION. SME Lead validation pending. Reference baseline: Salesforce Spring '26 release; LWC, Apex, Flows, EventBus, Big Objects, Salesforce DX.

## 20 NEW Questions (QOR-SF-041..060)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 41: Apex Governor Limits Recap (Easy)

**question_id:** QOR-SF-041
**skill_id:** senior-sf-041
**sub_skill_id:** governor-limits
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce Apex Developer Guide

**body:** Per-transaction Apex limits include 100 SOQL queries, 150 DML statements, 50K records retrieved. Best mitigation pattern when bulk-processing is required:

**options:**
- A) Increase limits via support ticket
- B) **Use bulk-safe patterns**: collections (Map<Id, ...>) for SOQL aggregation; one DML per loop scope (insert/update on List); Queueable / Batch Apex for >50K records (chunked); Database.Stateful for cross-chunk state. Plus avoid SOQL inside loops at all costs
- C) Use older API
- D) Synchronous only

**answer_key:** B — Standard Apex bulkification pattern. Reference: Apex Developer Guide §Limits.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-041-seed-2c8a4e9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-041
**bias_check_notes:** No bias.

---

### QUESTION 42: SOQL Selectivity (Easy)

**question_id:** QOR-SF-042
**skill_id:** senior-sf-042
**sub_skill_id:** soql-selectivity
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Salesforce Indexing docs

**body:** A SOQL query on a 5M-row Account gets `non-selective query` runtime error. Cause + fix:

**options:**
- A) Bug; reduce data
- B) **Salesforce optimizer requires selective index access for filters returning >200K rows or >10% of table**. Fix: standard index on filter field (or custom indexed field via Setup), narrow date filter, use `WITH SECURITY_ENFORCED` carefully, or `Selective` query design — reduce filter range. Use Query Plan tool (`?explain=`)
- C) Increase governor
- D) Use SOSL only

**answer_key:** B — Selectivity rule + indexed-field requirement is the standard limitation for large objects. Reference: Salesforce Indexing.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-042-seed-9b3e8c4a
**variant_seed:** qorium-sf-v0.6-2026-05-07-042
**bias_check_notes:** No bias.

---

### QUESTION 43: LWC vs Aura (Easy)

**question_id:** QOR-SF-043
**skill_id:** senior-sf-043
**sub_skill_id:** lwc-vs-aura
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce LWC docs

**body:** New custom UI in 2026 — choose:

**options:**
- A) Aura (battle-tested)
- B) **LWC (Lightning Web Components)** — built on standard web components; faster (no Aura framework overhead); modern dev experience (TypeScript, Jest); Salesforce roadmap default. Use Aura ONLY for legacy maintenance. Aura is officially in maintenance mode
- C) Visualforce
- D) Mix all three

**answer_key:** B — LWC is the standard. Reference: LWC docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-043-seed-3a7c8e2b
**variant_seed:** qorium-sf-v0.6-2026-05-07-043
**bias_check_notes:** No bias.

---

### QUESTION 44: Flow Best Practices (Medium)

**question_id:** QOR-SF-044
**skill_id:** senior-sf-044
**sub_skill_id:** flow-best-practices
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Flow Best Practices

**body:** When to choose Flow vs Apex:

**options:**
- A) Always Apex
- B) **Flow** for declarative automations (admin maintainable, no code); for medium-complex logic with consistent patterns. **Apex** when: dynamic logic, callouts in transaction (Flow has restrictions), > 100 SOQL queries, complex transformations, heavy bulkification. New trigger logic = Record-Triggered Flow first; reach for Apex when Flow can't express the logic. Workflow Rules + Process Builder are deprecated; migrate to Flow
- C) Always Flow
- D) Use Process Builder

**answer_key:** B — Flow-first; Apex for complexity. Reference: Salesforce Flow guide.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-044-seed-7e3c8a2b
**variant_seed:** qorium-sf-v0.6-2026-05-07-044
**bias_check_notes:** No bias.

---

### QUESTION 45: Permission Set Group (Medium)

**question_id:** QOR-SF-045
**skill_id:** senior-sf-045
**sub_skill_id:** permission-set-group
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Permission docs

**body:** Profiles vs Permission Sets vs Permission Set Groups:

**options:**
- A) Profiles for everything
- B) **Profiles** = baseline (one per user). **Permission Sets** = additive privileges. **Permission Set Groups** = bundle of permission sets for role-based assignment. Modern best practice: minimal Profile + many Permission Sets composed into Groups by job function. Easier to audit + revoke than profile-based access
- C) PSGs deprecated
- D) Identical concepts

**answer_key:** B — PSG-based access is the modern Salesforce permissioning model. Reference: Salesforce Permissions docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-045-seed-2d8e5c9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-045
**bias_check_notes:** No bias.

---

### QUESTION 46: Big Objects vs Standard Objects (Medium)

**question_id:** QOR-SF-046
**skill_id:** senior-sf-046
**sub_skill_id:** big-objects
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Big Objects docs

**body:** Use Big Objects when:

**options:**
- A) Always
- B) Storing huge volumes (billions of records — audit logs, sensor data, archive). Trade-offs: only async / batched read (no full SOQL), no triggers, no validation rules, primary key = composite of indexed fields. Modern alternative: external system + Salesforce Connect for federated query. For high-volume CRM transactions, regular objects + archival strategy
- C) Replace standard objects
- D) For demos only

**answer_key:** B — Big Objects are for archive scale; the trade-offs are real. Reference: Big Objects docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-046-seed-9c4e8a3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-046
**bias_check_notes:** No bias.

---

### QUESTION 47: Platform Events (Medium)

**question_id:** QOR-SF-047
**skill_id:** senior-sf-047
**sub_skill_id:** platform-events
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Platform Events docs

**body:** Use Platform Events vs PushTopic / Streaming API:

**options:**
- A) Same thing
- B) **Platform Events** are first-class event objects (publish via Apex/Flow/REST; subscribe via Apex Trigger / LWC `empApi` / external EventBus). High-volume events (HVPE) = $-priced, retained 72h. Use for: integration with external systems, decoupling Apex transactions, async fan-out. Platform Events fire OUTSIDE the publishing transaction (no rollback ties)
- C) Deprecated
- D) Aura-only

**answer_key:** B — Platform Events are the modern event-driven primitive in Salesforce. Reference: Platform Events docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-047-seed-4f8b2c9a
**variant_seed:** qorium-sf-v0.6-2026-05-07-047
**bias_check_notes:** No bias.

---

### QUESTION 48: Salesforce Connect / External Objects (Medium)

**question_id:** QOR-SF-048
**skill_id:** senior-sf-048
**sub_skill_id:** salesforce-connect
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Connect docs

**body:** A team needs to display 100M-row order history from an external Postgres in Salesforce. Options:

**options:**
- A) ETL into Salesforce
- B) **Salesforce Connect** (external objects via OData 2.0/4.0, Apex Custom Adapter, or Cross-Org adapter) — federated read; data NEVER copied; queryable via SOQL with limitations (limited indexing, no triggers, no formula fields on related). Real-time freshness; unlimited row count externally; Salesforce-side governor limits still apply for the federated calls
- C) Mass import nightly
- D) Big Objects

**answer_key:** B — Salesforce Connect federates external data. Trade-offs: read-only (mostly), no triggers. Reference: Salesforce Connect docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-048-seed-1e8c4a7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-048
**bias_check_notes:** No bias.

---

### QUESTION 49: Custom Metadata vs Custom Settings (Medium)

**question_id:** QOR-SF-049
**skill_id:** senior-sf-049
**sub_skill_id:** custom-metadata-vs-settings
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Custom Metadata docs

**body:** For configurable rules (tax rates, region mapping):

**options:**
- A) Custom Settings always
- B) **Custom Metadata Types** — deployable via change sets / SFDX (config = code), versioned. Custom Settings (Hierarchy / List) are runtime data, not deployable, NOT versioned. Modern best practice: CMD for deployable config; Custom Settings only for runtime user-overridable values (rate limits per user, etc.)
- C) Static Resources
- D) Hardcoded in Apex

**answer_key:** B — Custom Metadata is the canonical "config as code" mechanism. References: CMD docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-049-seed-3a8c5e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-049
**bias_check_notes:** No bias.

---

### QUESTION 50: Code — Apex Trigger (Hard - Code)

**question_id:** QOR-SF-050
**skill_id:** senior-sf-050
**sub_skill_id:** apex-trigger-bulk
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Apex Developer Guide §Triggers

**body:** Write a bulk-safe Apex trigger on Account (after update) that creates a Task ("Review status change") whenever Account.Status__c changes from "Active" to "Inactive". Use trigger handler pattern.

**options:** []

**answer_key:**

```apex
// AccountTrigger.trigger
trigger AccountTrigger on Account (after update) {
    AccountTriggerHandler.handleAfterUpdate(Trigger.new, Trigger.oldMap);
}

// AccountTriggerHandler.cls
public with sharing class AccountTriggerHandler {

    public static void handleAfterUpdate(List<Account> newRecords, Map<Id, Account> oldMap) {
        List<Task> tasksToCreate = new List<Task>();

        for (Account a : newRecords) {
            Account old = oldMap.get(a.Id);
            // detect Active -> Inactive transition
            if (old.Status__c == 'Active' && a.Status__c == 'Inactive') {
                tasksToCreate.add(new Task(
                    WhatId   = a.Id,
                    Subject  = 'Review status change',
                    Status   = 'Not Started',
                    Priority = 'High',
                    OwnerId  = a.OwnerId,
                    ActivityDate = Date.today().addDays(3)
                ));
            }
        }

        if (!tasksToCreate.isEmpty()) {
            // single bulk insert; partial-success allowed via Database.insert(...,false)
            Database.SaveResult[] results = Database.insert(tasksToCreate, false);
            for (Database.SaveResult r : results) {
                if (!r.isSuccess()) {
                    // log via Platform Event or log table
                    System.debug(LoggingLevel.ERROR, 'Task insert failed: ' + r.getErrors());
                }
            }
        }
    }
}
```

Key points:
- One-trigger-per-object pattern; logic in handler class.
- Bulk-safe: List collected outside loop, single DML at end.
- `Trigger.oldMap` provides previous values for compare.
- `Database.insert(..., allOrNone=false)` allows partial success.
- with sharing (or `inherited sharing` for handler) enforces user-level access.
- Future improvement: Custom Metadata-driven rule mapping (status A→B → action) so admins can add rules without code.

References: Apex Developer Guide §Triggers; Trigger Handler best practices.

**rubric:** 12-pt: trigger handler pattern (3) + bulk-safe collection + single DML (3) + Trigger.oldMap usage (2) + with sharing (1) + partial-success error handling (2) + future-proofing with CMD (1).

**watermark_seed:** qorium-sf-v0.6-050-seed-7e3c8a4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-050
**bias_check_notes:** No bias.

---

### QUESTION 51: Code — LWC Wire Service (Hard - Code)

**question_id:** QOR-SF-051
**skill_id:** senior-sf-051
**sub_skill_id:** lwc-wire
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** LWC Documentation §Wire Service

**body:** Write a LWC component that displays Top 10 Open Opportunities for the current logged-in user. Use @wire with an Apex method; refresh on user click.

**options:** []

**answer_key:**

```js
// topOpportunities.js
import { LightningElement, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getMyTopOpportunities from '@salesforce/apex/OpportunityController.getMyTopOpportunities';

export default class TopOpportunities extends LightningElement {
    wiredResult;     // hold the wire result for refreshApex
    error;
    opportunities;

    @wire(getMyTopOpportunities)
    handleResult(result) {
        this.wiredResult = result;
        if (result.data) {
            this.opportunities = result.data;
            this.error = undefined;
        } else if (result.error) {
            this.error = result.error;
            this.opportunities = undefined;
        }
    }

    handleRefresh() {
        return refreshApex(this.wiredResult);
    }
}
```

```apex
// OpportunityController.cls
public with sharing class OpportunityController {

    @AuraEnabled(cacheable=true)
    public static List<Opportunity> getMyTopOpportunities() {
        return [
            SELECT Id, Name, Amount, CloseDate, StageName
            FROM Opportunity
            WHERE OwnerId = :UserInfo.getUserId()
            AND IsClosed = false
            WITH SECURITY_ENFORCED
            ORDER BY Amount DESC NULLS LAST
            LIMIT 10
        ];
    }
}
```

```html
<!-- topOpportunities.html -->
<template>
    <lightning-card title="My Top 10 Open Opportunities" icon-name="standard:opportunity">
        <lightning-button slot="actions" label="Refresh" onclick={handleRefresh}></lightning-button>
        <template if:true={opportunities}>
            <ul class="slds-p-around_small">
                <template for:each={opportunities} for:item="opp">
                    <li key={opp.Id}>{opp.Name} — {opp.Amount}</li>
                </template>
            </ul>
        </template>
        <template if:true={error}>
            <p class="slds-text-color_error">Error: {error}</p>
        </template>
    </lightning-card>
</template>
```

Key points:
- `@AuraEnabled(cacheable=true)` allows wire (read-only) and Lightning data cache.
- `WITH SECURITY_ENFORCED` enforces FLS / object-level access.
- `refreshApex(wiredResult)` re-fetches the wired result while keeping reactive bindings.
- LWC Jest test would mock the wire response via `@salesforce/sfdx-lwc-jest` adapter.

References: LWC Wire Service docs.

**rubric:** 12-pt: @wire with stored result for refresh (3) + AuraEnabled cacheable=true (2) + WITH SECURITY_ENFORCED (2) + UserInfo.getUserId() (1) + refreshApex pattern (2) + template error/data branches (2).

**watermark_seed:** qorium-sf-v0.6-051-seed-2c8a4e9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-051
**bias_check_notes:** No bias.

---

### QUESTION 52: Asynchronous Apex Patterns (Hard)

**question_id:** QOR-SF-052
**skill_id:** senior-sf-052
**sub_skill_id:** async-apex
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Apex Developer Guide §Async

**body:** Choose async pattern:

**options:**
- A) Always @future
- B) **@future** = simple fire-and-forget for callouts; max 50/transaction; can't chain. **Queueable** = chainable, can carry state, supports complex types. **Schedulable** = cron-style. **Batch Apex** = >50K records, configurable scope, Database.Stateful for cross-chunk. Modern best practice: Queueable for most async; Batch for large datasets; @future being phased out
- C) Synchronous
- D) Triggers always

**answer_key:** B — Async Apex tier choice matters for governor limits + chaining. Reference: Apex Async docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-052-seed-9b3a8c4e
**variant_seed:** qorium-sf-v0.6-2026-05-07-052
**bias_check_notes:** No bias.

---

### QUESTION 53: Test Class Best Practices (Hard)

**question_id:** QOR-SF-053
**skill_id:** senior-sf-053
**sub_skill_id:** apex-tests
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Apex Developer Guide §Testing

**body:** Apex unit test best practices:

**options:**
- A) Test in production
- B) **75% coverage minimum (per object)** — but real practice: test happy + edge + bulk. Use Test.startTest / Test.stopTest for governor reset. Test data via `@testSetup` (one-time). NEVER use `seeAllData=true` (depends on org data). Mock callouts with `HttpCalloutMock`. Mock database with `Test.setMock`. Use `TestDataFactory` class for reusable test data
- C) Skip tests
- D) Coverage = quality

**answer_key:** B — Coverage is necessary but not sufficient; quality (edge cases, bulk, asserts) matters. References: Apex Testing docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-053-seed-7e3c8a4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-053
**bias_check_notes:** No bias.

---

### QUESTION 54: Salesforce DX + CI (Hard)

**question_id:** QOR-SF-054
**skill_id:** senior-sf-054
**sub_skill_id:** sfdx-cicd
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Salesforce DX Documentation

**body:** Modern Salesforce CI/CD pattern:

**options:**
- A) Change Sets between sandboxes
- B) **Salesforce DX + git + scratch orgs**: source-driven (metadata in git); scratch org per feature branch (provisioned via `sfdx force:org:create`); CI runs `sf project deploy` + `sf apex run test` on scratch; merge to main triggers production deploy; Unlocked Packages for modular delivery. Change Sets are legacy
- C) Manual deploy
- D) Workbench only

**answer_key:** B — SFDX + scratch orgs is the modern dev model. Reference: SFDX docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-054-seed-3a8c4e2b
**variant_seed:** qorium-sf-v0.6-2026-05-07-054
**bias_check_notes:** No bias.

---

### QUESTION 55: Sharing Model — OWD vs Sharing Rules (Hard)

**question_id:** QOR-SF-055
**skill_id:** senior-sf-055
**sub_skill_id:** sharing-model
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Sharing Architecture docs

**body:** Layered sharing access in Salesforce:

**options:**
- A) Profiles only
- B) **OWD (Org-Wide Defaults)** = baseline; **Role Hierarchy** = inherited up; **Sharing Rules** = expand by criteria/owner; **Manual Sharing** = ad-hoc; **Apex Managed Sharing** = programmatic. Plus: Account/Opportunity/Case Teams; Territories; Implicit Share. Layered model: union of all rules. Default OWD private + targeted sharing rules is most secure pattern
- C) FLS only
- D) Identical

**answer_key:** B — Multi-layered sharing is the Salesforce security architecture. References: Sharing Architecture docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-055-seed-9b4a8e2c
**variant_seed:** qorium-sf-v0.6-2026-05-07-055
**bias_check_notes:** No bias.

---

### QUESTION 56: Approval Process Modernization (Hard)

**question_id:** QOR-SF-056
**skill_id:** senior-sf-056
**sub_skill_id:** approval-flow
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Salesforce Flow Approvals docs

**body:** Approval Process is being deprecated in favor of:

**options:**
- A) Apex
- B) **Flow Approvals (Approval orchestration)** — declarative, visual, supports parallel/sequential/conditional approvers, multi-level routing, dynamic approver lookup. Apex still used for highly custom logic. Hybrid pattern: Flow for orchestration + Apex for niche side-effects
- C) Workflow rule
- D) Manual

**answer_key:** B — Flow Approvals is the modern path. References: Flow Approvals docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-056-seed-2c4a8e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-056
**bias_check_notes:** No bias.

---

### QUESTION 57: Design — High-Volume Integration (Hard - Design)

**question_id:** QOR-SF-057
**skill_id:** senior-sf-057
**sub_skill_id:** integration-design
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Salesforce Integration Patterns

**body:** Design integration: an external order system pushes 5K orders/min during peak (Indian sale festival). Data must land in Salesforce as Order + Order Line records, idempotent, low latency. Cover: API choice, batching, error handling, governance. (Limit: 800 words.)

**answer_key:**

**Stack: Composite REST API + Platform Event-driven async; idempotency via External ID; ETL/iPaaS in front (Mulesoft, Boomi, Workato).**

**API choice.**
- **Composite REST API** (`/services/data/vXX.X/composite/sobjects`) supports up to 200 records per call with parent-child relationships in one transaction. Higher throughput than single-record REST.
- **Bulk API 2.0** for very large batches (>10K records/job); CSV-based; async; ideal for backfill.
- **Streaming/PE** for real-time fan-out from Salesforce, not for inbound.

**For 5K orders/min = 83/sec:** Composite REST with batches of 50-100 records → ~10-20 calls/sec → fits within standard daily API limits (15M/day for unlimited). Easy headroom.

**Idempotency.**
- Each Order has External ID = source system order_id (unique).
- Use UPSERT on External ID instead of INSERT — duplicate calls are safe.
- Composite API in single transaction means parent + line items atomic.

**Topology.**
- External order system → iPaaS (Mulesoft) → Salesforce REST.
- iPaaS handles: retry on 5xx, dead letter queue for permanent failures, throttling on 429, transformation Order→SObject, batching by 50.
- iPaaS also publishes a Platform Event for downstream Salesforce automation (Flow / Apex), avoiding tight coupling.

**Error handling.**
- 401/403: re-auth; alert if persistent.
- 429 (rate limit): exponential back-off + jitter; honour `Retry-After` header.
- 5xx Salesforce: retry up to 5x; if still failing, DLQ + page on-call.
- 4xx (validation error): never retry; ticket to data team for review.
- Batch partial failure: Composite supports `allOrNone=false`; partial-success per record.

**Governance.**
- Service account with minimal permission set (only Order/OrderItem CRUD).
- API monitoring: per-source-system call count + error rate dashboards.
- Audit log: Field Audit Trail for high-value fields; iPaaS log + Salesforce Apex insert log.
- Rate limit per source system enforced at iPaaS level (not relying on Salesforce-side limits).

**Data quality.**
- Validation rules on Order kept lightweight (failures reject the whole batch in atomic mode); push complex validation to iPaaS pre-flight.
- Required-field checks; XSD schema on iPaaS.

**Game day.** Simulate 10K/min burst (2x peak); verify iPaaS throttles, Salesforce holds API limits, no orphan parent-without-child records, alerts fire on 429-spike.

**Trade-offs vs Alternatives.**
- Direct API from external system (no iPaaS): cheaper but loses centralized retry/error/monitoring.
- Bulk API + scheduled batches: simpler but adds latency; not "real-time."
- Salesforce Connect (federated): no copy required; trades latency-on-read for storage savings; works if reads are predictable and not multi-row joins.

**rubric:** 18-pt: Composite REST + UPSERT for atomicity + idempotency (4) + iPaaS as integration mid-tier (3) + retry strategy with 4xx vs 5xx differentiation (3) + DLQ + alerting (2) + audit + monitoring (2) + 429 + Retry-After handling (2) + game-day for 2x peak (2).

**watermark_seed:** qorium-sf-v0.6-057-seed-9c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-057
**bias_check_notes:** No bias.

---

### QUESTION 58: Code — Apex Batch with Stateful (Hard - Code)

**question_id:** QOR-SF-058
**skill_id:** senior-sf-058
**sub_skill_id:** batch-apex
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Apex Batch Documentation

**body:** Implement a Batch Apex class that processes 1M Account records, recalculates `Yearly_Revenue__c` from related Opportunity totals, accumulates total processed across batches, and emails a summary at end.

**options:** []

**answer_key:**

```apex
public class AccountRevenueRecalcBatch implements Database.Batchable<sObject>, Database.Stateful {

    private Integer totalProcessed = 0;
    private Integer totalUpdated = 0;
    private List<String> errors = new List<String>();

    public Database.QueryLocator start(Database.BatchableContext bc) {
        return Database.getQueryLocator(
            'SELECT Id, Name FROM Account WHERE IsActive__c = true'
        );
    }

    public void execute(Database.BatchableContext bc, List<Account> scope) {
        Set<Id> accountIds = new Map<Id, Account>(scope).keySet();
        // Aggregate query for opportunity totals
        Map<Id, Decimal> accountTotals = new Map<Id, Decimal>();
        for (AggregateResult r : [
            SELECT AccountId, SUM(Amount) total
            FROM Opportunity
            WHERE AccountId IN :accountIds AND IsClosed = true AND IsWon = true
            GROUP BY AccountId
        ]) {
            accountTotals.put((Id)r.get('AccountId'), (Decimal)r.get('total'));
        }

        List<Account> toUpdate = new List<Account>();
        for (Account a : scope) {
            Decimal newTotal = accountTotals.containsKey(a.Id)
                ? accountTotals.get(a.Id)
                : 0;
            toUpdate.add(new Account(Id = a.Id, Yearly_Revenue__c = newTotal));
        }

        Database.SaveResult[] results = Database.update(toUpdate, false);
        totalProcessed += scope.size();
        for (Database.SaveResult sr : results) {
            if (sr.isSuccess()) totalUpdated++;
            else errors.add(sr.getId() + ': ' + sr.getErrors()[0].getMessage());
        }
    }

    public void finish(Database.BatchableContext bc) {
        Messaging.SingleEmailMessage email = new Messaging.SingleEmailMessage();
        email.setToAddresses(new String[] { 'admin@example.com' });
        email.setSubject('Account Revenue Recalc — Job ' + bc.getJobId());
        email.setPlainTextBody(
            'Total processed: ' + totalProcessed + '\n' +
            'Total updated:   ' + totalUpdated   + '\n' +
            'Errors:          ' + errors.size()  + '\n\n' +
            (errors.isEmpty() ? '' : 'First errors:\n' + String.join(errors, '\n'))
        );
        Messaging.sendEmail(new Messaging.SingleEmailMessage[]{ email });
    }
}

// Schedule example
// AccountRevenueRecalcBatch b = new AccountRevenueRecalcBatch();
// Database.executeBatch(b, 200);   // batch size 200
```

Key points:
- `Database.Stateful` keeps `totalProcessed`/`totalUpdated`/`errors` across batch chunks.
- Batch size 200 = default; tune by query complexity (smaller for heavy execute).
- AggregateResult does the SUM at the database level (efficient).
- `Database.update(..., false)` allows partial success.
- `finish()` sends summary email; could also create a Custom Object record for audit.

References: Apex Batch + Stateful docs.

**rubric:** 12-pt: Database.Batchable + Database.Stateful (3) + start QueryLocator (2) + bulk-safe execute with aggregate (3) + partial-success handling (2) + finish summary email + state propagation (2).

**watermark_seed:** qorium-sf-v0.6-058-seed-7c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-058
**bias_check_notes:** No bias.

---

### QUESTION 59: Casestudy — Performance Crisis on List View (Very Hard - Casestudy)

**question_id:** QOR-SF-059
**skill_id:** senior-sf-059
**sub_skill_id:** list-view-perf-casestudy
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Sales reps complain "all my Account list views take 2+ minutes to load." Object has 8M rows; multi-tenant org. Investigate, prioritize fixes. (Limit: 800 words.)

**answer_key:**

**Investigation methodology.**

1. **Repro at scale.** Use the user's actual list-view filter; run via dev console SOQL with `?explain=` (Query Plan tool). The plan tells you: which index, expected rows, "selective" or "non-selective."
2. **Common patterns at 8M rows:**
   - **Filter on non-indexed field:** full table scan = minute+. Fix: add custom index (Setup or via Salesforce Support for non-standard).
   - **Filter on formula/lookup field that's not indexed.** Move filter to actual indexed criterion.
   - **Filter returning >10% of records** → optimizer flips to non-selective; same pain.
   - **Cross-object filter** (`SELECT a FROM Account WHERE Owner.Region__c = 'APAC'`) — Owner.Region not indexed; force narrow Account.OwnerId list first.
   - **OWD = Public Read/Write but with complex sharing** → sharing-table joins enormous.
3. **Sharing model overhead.** With 8M rows + complex sharing rules, `UserRecordAccess` joins balloon. Use `WHERE OwnerId = :UserInfo.getUserId()` filters early.

**Prioritized fixes.**

1. **List-view filter redesign.** Replace "All Accounts modified in last 30 days" (8M scanned) with "My Accounts modified in last 30 days" (per-user-bounded). Often 100-1000x faster.
2. **Custom Index on Status__c** (+ any other commonly filtered field).
3. **Standard index gap.** Verify the standard index on Modified Date is being used; the query plan tells you. If not, narrow date range.
4. **Skinny Tables** (Salesforce Support enables): a denormalized table with the most-queried fields. Speeds up list views without app code change. Requires a support ticket.
5. **List View Pinning + Default sort:** ensure default sort is indexed.
6. **Big Object archive:** if 50% of the 8M are 5+ years old + rarely needed, move to a Big Object / external archive; live table shrinks dramatically.
7. **Sharing rule cleanup.** Audit redundant sharing rules (each adds processing). Remove unused.

**Anti-patterns to remove.**

- **Calculated formulas on list view columns** (e.g., custom rollup) — re-evaluated per row; especially expensive cross-object.
- **Lookup-name display fields** that touch related Owner / RecordType — these can join huge sharing tables.

**Monitoring.**

- Salesforce Optimizer report (admin tool); auto-alerts on queries >5s avg.
- Custom Apex log: capture slow queries via `EventLog`.

**Stakeholder comms.**

- Sales VP wants "fast list views." Frame fix in their language: "today's filter scans 8M rows; new filter scans 50K. Expected: 2 min → 5 sec."

**Lessons.**

- 80% of Salesforce list-view perf issues = filter selectivity + missing custom indexes. Solvable with admin tools + a support ticket.
- 15% = sharing-rule complexity at scale. Audit + simplify.
- 5% = needs more architecture (Big Object, external archive).
- Skinny Tables remain a powerful but underused tool.

**Process improvements.**

- Add a "list view performance review" to the admin's quarterly governance.
- For new custom fields used in list-view filters: review before deploy whether they need to be indexed.
- Optimizer report run + reviewed monthly.

**rubric:** 25-pt: Query Plan tool first (3) + filter selectivity diagnosis (4) + per-user-scoped list view fix (3) + custom index strategy (3) + Skinny Tables awareness (3) + sharing-rule cleanup angle (2) + Big Object archive option (2) + anti-patterns: formulas + cross-object lookups in list views (3) + governance / monitoring (2).

**watermark_seed:** qorium-sf-v0.6-059-seed-3a8c4e2b
**variant_seed:** qorium-sf-v0.6-2026-05-07-059
**bias_check_notes:** No bias.

---

### QUESTION 60: Casestudy — Org Strategy: Multi-Org vs Single-Org (Very Hard - Casestudy)

**question_id:** QOR-SF-060
**skill_id:** senior-sf-060
**sub_skill_id:** org-strategy
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Salesforce ALM, Org Strategy whitepapers

**body:** A 5-year-old company has accumulated 4 separate Salesforce orgs (acquired companies / deliberate). Operational complexity is rising. Leadership wants "consolidate or stay multi-org" decision. Plan analysis. (Limit: 800 words.)

**answer_key:**

**TL;DR.** Consolidate ONLY when business processes converge AND Salesforce constraints would otherwise force compromise. Multi-org is fine — at 4 orgs you're below the typical pain threshold. Make the decision data-driven, not aesthetic.

**Single-org pros.**
- Single source of truth (Account, Contact, User).
- Cross-business reporting trivial.
- License cost can be lower (one Unlimited license vs 4).
- One platform team supports all.
- Simpler integrations (one set of credentials, one API surface).

**Single-org cons.**
- Per-business-unit customization fights for limited tabs / page layouts / record types. Customization debt.
- Governor limits are ORG-WIDE — a chatty integration in BU-A consumes BU-B's API quota.
- Sharing model becomes complex (cross-BU isolation requires careful Role + Sharing design).
- Migration risk: 4-way merge is expensive and disruptive.
- Org configuration becomes an ALM bottleneck.

**Multi-org pros.**
- Each business unit has its own org limits + customization room.
- Acquisitions onboard quickly (don't merge; integrate).
- Failure isolation: one org outage doesn't affect others.
- Per-region compliance easier (e.g., separate org for India data residency).

**Multi-org cons.**
- Cross-org reporting requires data warehouse pipeline OR Salesforce Connect federated views.
- Per-org admin/maintenance cost (~30-50% per added org).
- License cost grows linearly with orgs.
- Common processes redundantly implemented.

**Decision framework.**

Score each business pairing (BU-A↔BU-B):
- Process overlap: do they share Accounts? (high overlap → consolidate signal).
- Compliance: regulatory isolation requirements? (high → keep separate).
- Customization: would consolidating force compromise? (high → keep separate).
- Cost: is the per-org tax noticeably hurting? (high → consolidate).

If overall consolidation score >70%, consolidate. Below 50%, keep multi-org. In between, hybrid (selective consolidation).

**Hybrid path (most common answer).**

- Consolidate the 2 most-similar orgs first (year 1).
- Keep the 4th org separate (regulatory or distinct business model).
- Address cross-org reporting via data warehouse (Snowflake/BigQuery + Mulesoft / Heroku Connect ETL) — solves 80% of "we can't see across orgs" pain without consolidating.
- Salesforce Connect for low-volume real-time cross-org views.

**Migration mechanics if consolidating.**

- Year 1 Q1-Q2: design unified data model; field mapping; plan retired vs preserved metadata.
- Q2-Q3: dev sandbox merge; build migration scripts (Bulk API + custom mapping); pilot with 2 sub-units.
- Q4: production migration window (often weekends); freeze new dev during cutover; communicate timeline aggressively.
- Year 2: optimization, retire legacy integrations.

**Risk surfaces.**

- **Workflow / Flow merge conflicts.** Two BUs with same-named field but different semantics. Audit + rename.
- **License model.** Salesforce contracts may not let you "split" or "consolidate" licenses freely; check contract terms.
- **External integrations.** Each integration must point to new org URL + re-auth. Coordinate with all consumer teams.
- **User adoption.** Sales reps in old org now use new org; UX changes are real friction. Training + change management.

**Cost model (illustrative for 4 orgs of equal size).**

- Status quo: $4M/year licenses + $1.5M/year admin = $5.5M.
- Consolidate to 1: $3M/year licenses + $0.5M/year admin = $3.5M (saves $2M/year, after $4-6M one-time migration cost).
- Consolidate to 2 (hybrid): $3.5M licenses + $0.8M admin = $4.3M (saves $1.2M, smaller migration cost).

ROI on full consolidation: ~3 years. Hybrid: ~1.5 years. Hybrid usually wins.

**Stakeholder comms.**

- Frame in business outcome: "Today we can't report across BUs without 2 weeks of data wrangling. Hybrid consolidation cuts that to 1 day."
- Decision framework presented to exec team; agreed criteria; data-driven.

**Trigger to revisit.**

- 5+ orgs: multi-org tax becomes structural. Reconsider full consolidation.
- BU divestiture: spinning out an org becomes worth it.

**Lessons.**

- "Consolidation" is rarely the only answer; data-warehouse + Salesforce Connect addresses the cross-org reporting pain without org-merge cost.
- Per-org cost overhead is real but usually overstated by zealous consolidators. Quantify before deciding.
- Acquisitions create multi-org churn; have a default "keep separate, integrate via DW" pattern documented.

**rubric:** 25-pt: data-driven framework with multiple criteria (4) + cross-org reporting via DW as default solution (3) + hybrid consolidation as common answer (3) + cost-model with one-time vs recurring (3) + migration mechanics if consolidating (3) + risk surfaces (workflow conflicts, license, integrations) (3) + revisit triggers (2) + lesson: consolidation is not always the answer (3).

**watermark_seed:** qorium-sf-v0.6-060-seed-2c8a4e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-060
**bias_check_notes:** No bias.

---

## End Salesforce 041-060.
