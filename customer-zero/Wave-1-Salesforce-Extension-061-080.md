# Wave 1 Extension: Senior Salesforce Developer (QOR-SF-061..080)

**STATUS:** AI-drafted v0.6 EXTENSION. SME Lead validation pending.

## 20 NEW Questions (QOR-SF-061..080)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 61: Salesforce Object Storage Limits (Easy)

**question_id:** QOR-SF-061
**skill_id:** senior-sf-061
**sub_skill_id:** data-storage-limits
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce Storage Limits docs

**body:** Each Salesforce record uses ~2KB toward storage limits. With 50M records:

**options:**
- A) Free
- B) ~100 GB data storage required; default Enterprise allotment is 10GB + 20MB/user — usually requires purchased extra storage. Plan via Storage Usage report; archive old records to Big Objects or external; note: certain objects (Tasks, Events) count differently
- C) Unlimited
- D) Charge per query

**answer_key:** B — Storage planning is a real architectural concern. Reference: Storage Limits docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-061-seed-2c8a4e9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-061
**bias_check_notes:** No bias.

---

### QUESTION 62: Apex Trigger Order of Execution (Easy)

**question_id:** QOR-SF-062
**skill_id:** senior-sf-062
**sub_skill_id:** trigger-order
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Apex Developer Guide §Trigger Order of Execution

**body:** Order of trigger event execution:

**options:**
- A) random
- B) **Before triggers → System validation → Custom validation → Save → After triggers → Assignment rules → Auto-response → Workflow → Roll-up summaries → Process Builder/Flow → Escalation → Post-commit logic** — sequence matters; e.g., a Workflow Field Update fires after-triggers a SECOND time (recursion risk). Use a static class boolean to prevent
- C) After only
- D) Pre and post identical

**answer_key:** B — Trigger order knowledge prevents recursion + double-counting bugs. Reference: SF Apex docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-062-seed-7e3c8a2b
**variant_seed:** qorium-sf-v0.6-2026-05-07-062
**bias_check_notes:** No bias.

---

### QUESTION 63: Field-Level Security (Easy)

**question_id:** QOR-SF-063
**skill_id:** senior-sf-063
**sub_skill_id:** fls
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce FLS docs

**body:** A junior dev queries records via `[SELECT * FROM Account]` from Apex; data leak risk:

**options:**
- A) Apex respects FLS by default
- B) Apex runs in **system context by default** (FLS NOT enforced unless `WITH SECURITY_ENFORCED` clause OR explicit `Schema.sObjectField.isAccessible()` checks OR `with sharing` plus `Database.queryWithSharing`). Best practice: WITH SECURITY_ENFORCED in queries, `stripInaccessible` on writes, security review checklists in CI
- C) Always enforced
- D) Profiles handle it

**answer_key:** B — System context is the major Apex security pitfall. References: SF FLS docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-063-seed-3a8c5e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-063
**bias_check_notes:** No bias.

---

### QUESTION 64: LWC Communication Patterns (Medium)

**question_id:** QOR-SF-064
**skill_id:** senior-sf-064
**sub_skill_id:** lwc-communication
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** LWC docs

**body:** Communication between LWC components:

**options:**
- A) Window.postMessage
- B) **Parent→child: pass via @api property. Child→parent: dispatch CustomEvent (`this.dispatchEvent(new CustomEvent(...))`). Sibling: pubsub via Lightning Message Service (LMS) or shared store**. Don't use jQuery / window. Component composition via slots
- C) Global state always
- D) Direct DOM

**answer_key:** B — Standard LWC patterns. Reference: LWC docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-064-seed-9c4e8a3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-064
**bias_check_notes:** No bias.

---

### QUESTION 65: Salesforce Shield Encryption (Medium)

**question_id:** QOR-SF-065
**skill_id:** senior-sf-065
**sub_skill_id:** shield-encryption
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Shield docs

**body:** Shield Platform Encryption vs Classic Encryption:

**options:**
- A) Same
- B) **Shield (probabilistic encryption)** — encrypts at rest with tenant-specific key; preserves SOQL filters / sorting via "deterministic" mode option (slight security trade-off vs probabilistic). Affects SOQL semantics; not all features supported on encrypted fields. **Classic Encryption** = older, masked-input only. For PII protection in regulated industries, Shield Deterministic
- C) Replace with TDE
- D) No difference

**answer_key:** B — Shield is the Salesforce-native encryption layer. References: Shield Platform Encryption docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-065-seed-4d8c2a9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-065
**bias_check_notes:** No bias.

---

### QUESTION 66: SOQL FOR LOOPS (Medium)

**question_id:** QOR-SF-066
**skill_id:** senior-sf-066
**sub_skill_id:** soql-for-loops
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Apex Developer Guide §SOQL For Loop

**body:** Processing 50K Account records in Apex; heap-aware:

**options:**
- A) `List<Account> all = [SELECT ...]` then for-each
- B) **`for (Account a : [SELECT ...])` — chunks results in batches of 200**, processes each chunk, then garbage-collects. Heap stays bounded. Single-list approach (A) holds all 50K in memory; risk of `Apex Heap Size` (6MB) limit
- C) Single record only
- D) Stream

**answer_key:** B — SOQL for-loops are the canonical heap-safe pattern. Reference: Apex SOQL For Loops docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-066-seed-2c8a4e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-066
**bias_check_notes:** No bias.

---

### QUESTION 67: Service Cloud Macros vs Quick Actions (Medium)

**question_id:** QOR-SF-067
**skill_id:** senior-sf-067
**sub_skill_id:** macros-quick-actions
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Service Cloud docs

**body:** Repetitive case-resolution actions for support agents:

**options:**
- A) Custom button only
- B) **Macros** for compound actions (update field, send email, call substitution) — scoped to support console; supports user-level keyboard shortcuts; chainable. **Quick Actions** for one-step actions on detail pages. Use **Lightning Flow** when conditional branching needed. Pick based on agent workflow
- C) Aura
- D) Always Apex

**answer_key:** B — Service Cloud productivity tools choice. References: Service Cloud docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-067-seed-9b3a8e4c
**variant_seed:** qorium-sf-v0.6-2026-05-07-067
**bias_check_notes:** No bias.

---

### QUESTION 68: Cross-Object Formula Limits (Medium)

**question_id:** QOR-SF-068
**skill_id:** senior-sf-068
**sub_skill_id:** formula-cross-object
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Formula docs

**body:** Cross-object formula `Account__r.Owner.Profile.Name` chains to 10 hops. Issue:

**options:**
- A) Always works
- B) Cross-object formulas have a 10-relationship-hop limit; performance penalty per hop; cannot include lookup-to-self loops; not editable in flow context. Best practice: limit hops to ≤ 3; pre-populate via formula field on intermediate object; use CMD for static lookups
- C) Bug
- D) Quick deprecation

**answer_key:** B — Formula constraint matters for design. Reference: Formula Compilation docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-068-seed-3a7c5b9e
**variant_seed:** qorium-sf-v0.6-2026-05-07-068
**bias_check_notes:** No bias.

---

### QUESTION 69: Time-Based Workflow Replacement (Medium)

**question_id:** QOR-SF-069
**skill_id:** senior-sf-069
**sub_skill_id:** time-based-flow
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Flow docs

**body:** Old Workflow Rule: "if Status not Closed in 7 days, send escalation." Modern equivalent:

**options:**
- A) Apex schedule
- B) **Schedule-Triggered Flow + Time-Triggered actions in Record-Triggered Flow**. Schedule-Triggered runs on a daily cadence over filtered records; Record-Triggered with "Run async after N days" handles event-driven delays. Workflow Time-Based Actions are deprecated; migrate
- C) Approval Process
- D) Email-to-Case

**answer_key:** B — Modern Flow replaces all classic Workflow time-based logic. Reference: Flow docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-069-seed-7c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-069
**bias_check_notes:** No bias.

---

### QUESTION 70: Order Object Lifecycle (Medium)

**question_id:** QOR-SF-070
**skill_id:** senior-sf-070
**sub_skill_id:** order-lifecycle
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Sales Cloud docs

**body:** Salesforce Order object — design pattern:

**options:**
- A) Order replaces Opportunity
- B) Standard pattern: **Opportunity** (won deal) → **Quote** (priced version) → **Order** (signed contract) → **Asset/Subscription** (delivered/recurring). Order has standard fields (Status, Type) + OrderItems for line items. Activated orders typically locked from edits; Reduction Orders for cancellations. Pair with Revenue Cloud for billing
- C) Junk drawer
- D) Custom only

**answer_key:** B — Standard Sales-to-Order lifecycle. References: Sales Cloud docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-070-seed-9b4a2c8e
**variant_seed:** qorium-sf-v0.6-2026-05-07-070
**bias_check_notes:** No bias.

---

### QUESTION 71: Trigger Recursion Prevention (Medium)

**question_id:** QOR-SF-071
**skill_id:** senior-sf-071
**sub_skill_id:** trigger-recursion
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** SF Apex docs

**body:** Workflow + Trigger combination causes after-update trigger to fire 2x. Standard prevention:

**options:**
- A) Disable trigger
- B) Static class boolean: `RecursionGuard.run = true` set at trigger entry; if already true, skip. Or use Set<Id> of already-processed IDs. Or use Custom Setting with hierarchy. Trigger recursion is THE most common Salesforce bug; fix via guard pattern + good test coverage of update paths
- C) Always synchronous
- D) Workflow only

**answer_key:** B — Guard pattern is the canonical fix. Reference: Apex docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-071-seed-2c8a4e9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-071
**bias_check_notes:** No bias.

---

### QUESTION 72: Code — Continuation for Long-Running Callout (Hard - Code)

**question_id:** QOR-SF-072
**skill_id:** senior-sf-072
**sub_skill_id:** continuation
**format:** code
**difficulty_b:** 1.1
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Apex Continuation docs

**body:** A Visualforce/LWC button needs to call an external service that takes 10s. Synchronous Apex callout 120s limit OK but blocks transaction. Use Continuation (async) pattern. Provide Apex.

**options:** []

**answer_key:**

```apex
public with sharing class ExternalReportController {

    public Continuation startCallout() {
        Continuation c = new Continuation(40);     // 40s timeout
        c.continuationMethod = 'processCallback';

        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:External_Service/v1/report');
        req.setMethod('GET');
        req.setHeader('Authorization', 'Bearer ' + getToken());
        c.addHttpRequest(req);

        return c;
    }

    public Object processCallback(Object state) {
        HttpResponse res = Continuation.getResponse('0');
        if (res.getStatusCode() == 200) {
            return parseAndPersist(res.getBody());
        }
        throw new CalloutException('External report fetch failed: ' + res.getStatus());
    }

    private static Object parseAndPersist(String body) {
        // parse JSON, insert/update sObjects, return UI-friendly
        return JSON.deserializeUntyped(body);
    }

    private static String getToken() {
        // retrieve OAuth token from Named Credential or stored secret
        return 'redacted';
    }
}
```

Key points:
- `Continuation` lets the framework park the request, send the callout async, and resume in the callback when response arrives. Salesforce-side instance frees up.
- Up to 3 callouts in parallel via `addHttpRequest` (returns labels).
- `Named Credentials (callout:External_Service)` handle auth + URL externally.
- Callback runs separately; quick processing only.
- Continuation is for LWC / VF / Aura UI threads; Queueable / future Apex for non-UI async.

References: Salesforce Continuation docs.

**rubric:** 12-pt: Continuation construction (3) + addHttpRequest (2) + callback method binding (3) + Named Credential usage (2) + status-code branching (2).

**watermark_seed:** qorium-sf-v0.6-072-seed-7e3c8a4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-072
**bias_check_notes:** No bias.

---

### QUESTION 73: Code — Apex Test for Callout (Hard - Code)

**question_id:** QOR-SF-073
**skill_id:** senior-sf-073
**sub_skill_id:** test-callout
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** Apex Testing docs

**body:** Write Apex test that mocks an HTTP callout and asserts the calling code parses 200 + 500 cases correctly.

**options:** []

**answer_key:**

```apex
@isTest
private class ExternalReportControllerTest {

    private class MockSuccess implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse r = new HttpResponse();
            r.setStatusCode(200);
            r.setHeader('Content-Type', 'application/json');
            r.setBody('{"id":"r-42","total":1000}');
            return r;
        }
    }
    private class MockFailure implements HttpCalloutMock {
        public HttpResponse respond(HttpRequest req) {
            HttpResponse r = new HttpResponse();
            r.setStatusCode(500);
            r.setStatus('Internal Server Error');
            r.setBody('upstream down');
            return r;
        }
    }

    @isTest
    static void parsesSuccess() {
        Test.setMock(HttpCalloutMock.class, new MockSuccess());
        Test.startTest();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:External_Service/v1/report');
        req.setMethod('GET');
        HttpResponse res = new Http().send(req);
        Test.stopTest();
        Map<String, Object> body = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
        System.assertEquals(200, res.getStatusCode());
        System.assertEquals('r-42', body.get('id'));
    }

    @isTest
    static void handlesFailure() {
        Test.setMock(HttpCalloutMock.class, new MockFailure());
        Test.startTest();
        HttpRequest req = new HttpRequest();
        req.setEndpoint('callout:External_Service/v1/report');
        req.setMethod('GET');
        HttpResponse res = new Http().send(req);
        Test.stopTest();
        System.assertEquals(500, res.getStatusCode());
        System.assert(res.getBody().contains('upstream'));
    }
}
```

Key points: `Test.setMock` swaps the HTTP layer; `Test.startTest`/`stopTest` resets governor limits + fires async; mocks for both 200 and 500 paths; assertions on parsed payload. References: Apex Testing docs.

**rubric:** 10-pt: HttpCalloutMock implementation (3) + happy + error mocks (2) + Test.startTest/stopTest (2) + assertions on parsed payload (3).

**watermark_seed:** qorium-sf-v0.6-073-seed-3a8c5e2b
**variant_seed:** qorium-sf-v0.6-2026-05-07-073
**bias_check_notes:** No bias.

---

### QUESTION 74: Salesforce CRM Analytics (Hard)

**question_id:** QOR-SF-074
**skill_id:** senior-sf-074
**sub_skill_id:** crm-analytics
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** CRM Analytics docs

**body:** When use CRM Analytics (Tableau CRM) vs reports/dashboards:

**options:**
- A) Always reports
- B) **Reports/Dashboards**: native, free, OK for CRM use cases (≤2M rows, simple aggregations, real-time). **CRM Analytics**: when joining external data (DW), advanced math (Einstein Discovery), large dataset (10M+), cross-object dataflows, mobile-first viz. Trade-off: extra license cost (~$75-150/user/month)
- C) CRM Analytics always
- D) Tableau replacement

**answer_key:** B — CRM Analytics for advanced cases; reports for native CRM. Reference: CRM Analytics docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-074-seed-9b3a8c4e
**variant_seed:** qorium-sf-v0.6-2026-05-07-074
**bias_check_notes:** No bias.

---

### QUESTION 75: Apex Memory Heap Limit (Hard)

**question_id:** QOR-SF-075
**skill_id:** senior-sf-075
**sub_skill_id:** apex-heap
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Apex Limits docs

**body:** Apex throws `Apex Heap Size Too Large` (6MB sync, 12MB async). Strategies:

**options:**
- A) Increase governor
- B) **SOQL for-loops** (chunks 200); avoid keeping large blobs in memory; `Limits.getHeapSize()` to monitor; chunk large strings/JSON into iterators; for very large data, push processing to Batch Apex (split into chunks); avoid `String.join` on huge lists
- C) Synchronous only
- D) Restart org

**answer_key:** B — Heap is one of Apex's tightest constraints. Disciplined memory patterns required at scale. Reference: Apex Limits.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-075-seed-2c8a4e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-075
**bias_check_notes:** No bias.

---

### QUESTION 76: Multi-Currency Setup (Hard)

**question_id:** QOR-SF-076
**skill_id:** senior-sf-076
**sub_skill_id:** multi-currency
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Salesforce Multi-Currency docs

**body:** A global SaaS goes multi-currency:

**options:**
- A) Custom field for currency
- B) **Enable Multi-Currency** (one-time, irreversible) → adds CurrencyIsoCode field on currency-aware objects; Dated Exchange Rates / Advanced Currency Management (ACM) for historical rates; reports auto-convert to user's currency. Trade-offs: no rollback; impacts ALL records; complex tooling; one-time + careful planning
- C) Always enable
- D) Currency = same

**answer_key:** B — Multi-Currency is irreversible and impacts the data model. Plan thoroughly. Reference: SF Multi-Currency docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-076-seed-7e3c8a4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-076
**bias_check_notes:** No bias.

---

### QUESTION 77: Design — Salesforce + Slack Integration (Hard - Design)

**question_id:** QOR-SF-077
**skill_id:** senior-sf-077
**sub_skill_id:** salesforce-slack
**format:** design
**difficulty_b:** 1.3
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Slack-Salesforce integration docs

**body:** Design Slack integration for Sales team: Salesforce Opp moves to Stage X → Slack notification + actions (Approve/Reject) → action result back to Salesforce. Cover: real-time mechanism, auth, idempotency, error handling. (Limit: 800 words.)

**answer_key:**

**Architecture: Salesforce Flow → Slack via Salesforce-for-Slack app OR custom integration via Mulesoft / Zapier / direct webhook.**

**Path A: Salesforce-for-Slack native app.**
- Pros: out of box; Slack channels can subscribe to record updates declaratively.
- Cons: limited customization; can't easily add interactive Slack components.

**Path B: Custom integration (chosen here).**

**Real-time mechanism.**
- Salesforce Record-Triggered Flow on Opportunity (when Stage changes to "Pending Approval") → calls Apex action via @InvocableMethod.
- @InvocableMethod posts to Slack incoming webhook (or Slack Web API for richer Block Kit).

**Auth.**
- Slack: store webhook URL or Bot Token in Named Credential (Salesforce-managed secret).
- Slack→Salesforce return: Slack interactive payload signed with Slack Signing Secret; Salesforce validates HMAC; rejects mismatch.
- Salesforce expose endpoint via Sites/Apex REST or Connected App OAuth.

**Idempotency.**
- Slack message includes External ID (Opp ID). Salesforce side: receive Slack interactive callback, check if action already processed (Status field on Opp); if yes, no-op + reply OK.
- Slack signing secret check + replay-attack guard (timestamp ≤5min stale → reject).

**Workflow.**

1. Opp Stage = Pending Approval → Flow → Apex → Slack message (Block Kit with "Approve"/"Reject" buttons; payload encodes Opp Id + token).
2. Approver clicks Approve → Slack POSTs interactive payload to Salesforce endpoint.
3. Salesforce endpoint: verify HMAC; lookup Opp; check user perm; update Opp.Stage = Approved; respond to Slack with success Block.
4. Slack updates message in-place ("Approved by @manager at 2026-05-07T15:30").

**Error handling.**
- Slack 5xx: retry with backoff (Apex Queueable for retries 3-5x); after exhausted, log + alert; do NOT block original transaction.
- Salesforce-side error: respond with ephemeral error to Slack ("retry"); log.
- Audit table: every Slack message + every approval action persisted with full payload, signer, timestamp.

**Multi-tenant / isolation.**
- Channel mapping per BU / region.
- Slack workspace ↔ Salesforce org mapped via Custom Metadata.

**Game day.** Simulate Slack outage; verify Salesforce queues retries gracefully + alerts on persistent failure. Simulate signing-secret rotation; verify dual-secret window during rotation.

**Non-functionals.**
- Volume: 1000 messages/hour easily; Slack rate limits (~ 1 msg/sec/channel) require fanout if hitting limit.
- Storage: audit table partitioned monthly; archive old to Big Object.
- Compliance: PII in Slack messages → mask; configure per-tenant.

**Design alternatives.**
- AWS EventBridge / Mulesoft as middleware: better when MORE than just Slack integrations.
- Salesforce CDC (Change Data Capture) → outbound webhook: cleaner for many-event push.

**Rollout.**
- Pilot with one team, one channel; expand after 2 weeks of clean operation.

**rubric:** 18-pt: Flow → Apex → Slack pattern (3) + Block Kit interactive button design (2) + Slack signing-secret HMAC verification (3) + idempotency by external ID + state check (3) + Named Credential for token storage (2) + retry strategy + audit log (3) + game-day for outage + secret rotation (2).

**watermark_seed:** qorium-sf-v0.6-077-seed-3a8c4e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-077
**bias_check_notes:** No bias.

---

### QUESTION 78: Code — LWC Lightning Data Service (Hard - Code)

**question_id:** QOR-SF-078
**skill_id:** senior-sf-078
**sub_skill_id:** lds-record-edit
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** LDS docs

**body:** Write a LWC that uses Lightning Data Service (LDS) to display + edit an Opportunity inline (no Apex required). Form should have validation + save handler.

**options:** []

**answer_key:**

```html
<!-- opportunityEdit.html -->
<template>
    <lightning-record-edit-form
        record-id={recordId}
        object-api-name="Opportunity"
        onsuccess={handleSuccess}
        onerror={handleError}>
        <lightning-messages></lightning-messages>
        <lightning-input-field field-name="Name"></lightning-input-field>
        <lightning-input-field field-name="StageName"></lightning-input-field>
        <lightning-input-field field-name="Amount"></lightning-input-field>
        <lightning-input-field field-name="CloseDate"></lightning-input-field>
        <lightning-button class="slds-m-top_small" type="submit" label="Save"></lightning-button>
    </lightning-record-edit-form>
</template>
```

```js
// opportunityEdit.js
import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class OpportunityEdit extends LightningElement {
    @api recordId;

    handleSuccess(event) {
        const updatedRecord = event.detail;
        this.dispatchEvent(new ShowToastEvent({
            title: 'Saved',
            message: `Opportunity ${updatedRecord.fields.Name.value} updated`,
            variant: 'success'
        }));
    }
    handleError(event) {
        this.dispatchEvent(new ShowToastEvent({
            title: 'Error',
            message: event.detail.message,
            variant: 'error'
        }));
    }
}
```

Key points: LDS handles all CRUD + cache + FLS + sharing; no Apex needed; `lightning-input-field` auto-renders correct UI per field type; validation rules enforced; toast on success/error. References: LWC Forms docs.

**rubric:** 10-pt: lightning-record-edit-form usage (3) + recordId + object-api-name (2) + lightning-input-field per field (2) + onsuccess/onerror handlers (2) + ShowToastEvent (1).

**watermark_seed:** qorium-sf-v0.6-078-seed-2d8e4c9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-078
**bias_check_notes:** No bias.

---

### QUESTION 79: Casestudy — Trigger Performance Crisis (Very Hard - Casestudy)

**question_id:** QOR-SF-079
**skill_id:** senior-sf-079
**sub_skill_id:** trigger-perf-casestudy
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Bulk import of 100K Account records timing out / hitting governor limits. Triggers cascading; integration team paralyzed. Plan triage and remediation. (Limit: 800 words.)

**answer_key:**

**Step 1 — diagnose with Apex Replay/Debug logs.**

- Identify the trigger(s) firing: developer console with 100-record sample import shows trigger calls + SOQL count + DML count + heap.
- Often: 1 trigger calls Apex helper with unbounded SOQL inside loop OR an after-update Workflow Field Update fires the trigger again with un-deduped logic.

**Step 2 — most common offenders.**

1. **SOQL inside loop.** A trigger handler iterates over records and queries related per-record. Refactor to bulk-query with `IN :idSet` once.
2. **DML inside loop.** Same fix — collect into List, single DML at end.
3. **Recursion.** Add `RecursionGuard` static booleans; logging shows trigger called > 1x per record.
4. **N+1 cross-object.** Aggregate via SOQL or join, not iteration.
5. **Synchronous external callout.** Move to Queueable / @future via Database.Stateful.
6. **Process Builder + Workflow + Trigger same record:** governor limits multiplied. Migrate Process Builder to Flow; consolidate logic to one trigger.

**Step 3 — emergency mitigation (immediate).**

- Disable non-critical triggers temporarily via Custom Setting flag (each trigger checks `if (isEnabled('AccountTrigger'))`; toggle to false). Bulk import resumes.
- Salesforce Support: bypass user (e.g., integration user) from triggers via "User Exclusion List" pattern — common in import-heavy orgs.
- Use Bulk API with `Bulk API 2.0` and serial mode (avoid parallel chunk concurrency triggering same triggers in parallel-induced stale-state).

**Step 4 — fix in code.**

- Refactor handler: ONE trigger per object; handler class with bulk-safe entry points.
- Move SOQL out of loops; consolidate DML.
- Audit every loop for governor antipatterns.
- Add tests at 200 + 1000 + 10000 record bulk scale.

**Step 5 — long-term governance.**

- Trigger framework (e.g., fflib/Apex Common, Trigger Handler v2) — enforces single-entry-point + recursion control + bypass capability.
- CI step: SonarQube / PMD for Apex linting + governor anti-pattern detection.
- Code review: every new trigger must include bulk-test (insert/update/delete @ 200+).
- Monthly Apex Performance Review: `Apex Replay` / SOQL Tuning / Org Optimizer reports.

**Step 6 — comms.**

- Sales VP / Integration team: "Today's import fails; emergency disable trigger X reverts; permanent fix in Y days."
- Postmortem: include team-wide lessons; share trigger framework decision.

**Outcome target.**

- 100K import succeeds in < 5 minutes (typical Bulk API 2.0 throughput for trigger-light objects).
- Heap usage <50% of limit; SOQL <30% of limit.
- Future bulk operations have a path: load test before deploy.

**Process improvements.**

- Sandbox load-test environment with realistic data volumes.
- Each new trigger requires bulk test in PR review.
- Per-trigger bypass capability documented for emergency response.

**Lessons (universal).**

- Apex governor limits are a discipline, not an obstacle. Bulkification is non-negotiable.
- Trigger frameworks earn their cost in 6 months; adopt early.
- Process Builder + Workflow + Trigger on same object = guaranteed governor pain; consolidate.

**rubric:** 25-pt: identifies common offenders (5) + emergency mitigation: trigger disable, bypass user (4) + bulk-safe refactor (3) + trigger framework adoption (3) + CI lint for Apex (2) + bulk-test in PR review process (3) + sandbox load-test environment (2) + comms + postmortem (3).

**watermark_seed:** qorium-sf-v0.6-079-seed-3c2a4e8b
**variant_seed:** qorium-sf-v0.6-2026-05-07-079
**bias_check_notes:** No bias.

---

### QUESTION 80: Casestudy — Salesforce Migration (Very Hard - Casestudy)

**question_id:** QOR-SF-080
**skill_id:** senior-sf-080
**sub_skill_id:** legacy-to-sf-migration
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Indian financial services company migrating from a 12-year-old custom Java/Oracle CRM to Salesforce. Scope: 5M customers, 50M transactions/year, 200 users, Indian regulatory compliance (DPDPA, RBI). 18-month timeline. Plan. (Limit: 1000 words.)

**answer_key:**

**Recommendation: Phased migration, 18 months. Lift-and-shift NOT recommended; redesign for Salesforce paradigms.**

**Phase 1 (Month 1-3): Discovery + design.**

- Process audit: shadow current users; document workflows; identify "must-have" vs "nice-to-have."
- Data audit: profile 5M customers (PII, schema variations, dup rate, data quality).
- Compliance: DPDPA + RBI cyber framework + data residency. Salesforce Hyperforce IN region (Mumbai data center).
- Architecture decisions:
  - Salesforce edition: Unlimited or Industries Cloud (Banking) for FSCloud features.
  - Shield Encryption for PII fields (Aadhaar, PAN tokenized).
  - 50M transactions: Big Object for archive; recent 24 months in standard Transaction__c; full lifecycle via Salesforce Connect to Postgres for cold data.

**Phase 2 (Month 3-6): Build core.**

- Data model: Account (customer), Contact (relationship), Custom objects (Transaction__c, Loan__c, Card__c).
- Salesforce Industries (FS Cloud) Action Plans for KYC + onboarding.
- Permission model: 200 users mapped to Personas (Branch Manager, Customer Service, Compliance, IT).
- Single trigger framework + Flow standardization.
- Integration architecture: Mulesoft (or equivalent iPaaS) bridging Salesforce ↔ Core Banking System (Finacle) ↔ payment gateways ↔ KYC vendors (Karza, Hyperverge).

**Phase 3 (Month 6-12): Migration + parallel.**

- Migration strategy:
  - Customers: Salesforce Bulk API + dedupe via External ID (PAN/Aadhaar tokenized).
  - Transactions: incremental sync via Mulesoft + Big Object archive.
  - Validation: row-count + checksum reconciliation; sampling 1000 records cross-system equality.
- Parallel run for 3 months: both systems live; new transactions written to both; reconciler daily.
- Pilot with 1 branch (5-10 users) for 4 weeks; iterate based on feedback.

**Phase 4 (Month 12-15): Phased cutover.**

- Branch-by-branch cutover: ~50 branches over 12 weeks; 4-5 branches/week.
- Each cutover: training (4h hands-on), warm support 1 week, retro.
- Old system remains read-only for compliance lookback.

**Phase 5 (Month 15-18): Optimize + decommission.**

- Old system retired (read-only archive maintained 7 years per RBI).
- Performance tuning: list views, dashboards, integrations.
- Continuous improvement: monthly retros with branch managers.
- Compliance audit: external SOC 2 / ISO 27001 / RBI cybersecurity assessment.

**Risks + mitigations.**

- **Data quality.** 12-year-old CRM has years of manual fixes; spelling variations; inconsistent state. Mitigation: profile early; standardize via lookup tables; assign a data steward per data domain.
- **User resistance.** Existing users have 12 years of muscle memory. Mitigation: champion network in each branch; success stories; training; gradual cutover, not big-bang.
- **Compliance gap.** DPDPA right-to-erasure on a 5M customer base requires architectural support. Mitigation: built-in from day-1 (PII fields tagged, anonymization SOP, response within 30 days).
- **Cost overrun.** Salesforce migrations typically run 30-50% over initial estimate. Mitigation: 25% contingency; quarterly steering committee with go/no-go decision points.
- **Integration fragility.** Core banking integration is risk-bearing. Mitigation: dual-write via Mulesoft with reconciliation; manual fallback if integration fails; defined RPO/RTO for core banking sync.

**Compliance specifics.**

- **DPDPA (India).** Notice + consent for processing; right-to-erasure; right-to-correction. Data Processor agreement with Salesforce.
- **RBI cybersecurity framework.** Cyber-resilience controls; incident reporting; periodic VAPT. Salesforce Shield + customer responsibility for app-level controls.
- **Aadhaar Act.** Aadhaar tokenized via Karza Vault or equivalent; Salesforce stores token + last-4 digits, not full Aadhaar.
- **PA-DSS / PCI-DSS.** If card data, Vault-based tokenization; Salesforce processes only token, not PAN.

**Cost (illustrative).**

- Salesforce licenses: ~$50K-100K/year (200 Unlimited users + Industries Cloud).
- Hyperforce IN region surcharge.
- Mulesoft: ~$200K/year.
- SI partner: $1.5M-3M total over 18 months.
- Internal team: ~10 FTE for 18 months.
- Total program: $5-8M depending on customizations.

**Outcome target.**

- 100% transactions on Salesforce.
- Compliance audit pass.
- User NPS > 30 within 6 months post-cutover.
- Mean time to onboard new customer: 2x faster than legacy.
- 99.95% uptime.

**Lessons (universal).**

- Salesforce migration ROI is 18-36 months; quarterly steering committee keeps the program honest.
- Compliance + integration are the two biggest risks; over-invest early.
- "We'll customize less in Salesforce" is aspirational; budget for customization realistically.
- Indian regulatory landscape evolves; design for flexibility (DPDPA + RBI + future amendments).

**rubric:** 25-pt: 18-month phased plan w/ pilots (4) + Industries Cloud + Hyperforce IN region (3) + data model decisions including Big Object + SF Connect (3) + DPDPA + RBI compliance specifics (4) + integration architecture w/ Mulesoft + reconciliation (3) + parallel-run + branch-by-branch cutover (3) + risks: data quality + user resistance + compliance + cost + integration (4) + cost model (1).

**watermark_seed:** qorium-sf-v0.6-080-seed-7c2a8e4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-080
**bias_check_notes:** No bias. India financial services context.

---

## End Salesforce 061-080.
