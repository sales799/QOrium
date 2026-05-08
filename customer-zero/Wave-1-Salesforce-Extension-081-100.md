# Wave 1 Extension: Senior Salesforce (QOR-SF-081..100)

**STATUS:** AI-drafted v0.6 EXTENSION — closes Salesforce 100/100. SME Lead validation pending.

## 20 NEW Questions (QOR-SF-081..100)

Difficulty: 3E / 9M / 6H / 2VH | Format: 12 MCQ / 4 Code / 2 Design / 2 Casestudy

---

### QUESTION 81: Salesforce Limits — API Daily Cap (Easy)

**question_id:** QOR-SF-081
**skill_id:** senior-sf-081
**sub_skill_id:** api-daily-cap
**format:** MCQ
**difficulty_b:** -0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce Limits Reference

**body:** Daily API call cap for Enterprise edition (per user formula):

**options:**
- A) Unlimited
- B) **1000 calls/license/day for Enterprise; 5000 for Unlimited; aggregated org-wide.** Bulk API 2.0 jobs count as 1 call. Composite calls count as 1 outer + N batched. Monitor via System Overview / Limits API. Hit limit → 503; throttle integrations
- C) Per-user 100
- D) None

**answer_key:** B — Daily API limits matter for integration capacity planning. Reference: SF Limits.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-081-seed-7c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-081
**bias_check_notes:** No bias.

---

### QUESTION 82: Person Account vs Contact (Easy)

**question_id:** QOR-SF-082
**skill_id:** senior-sf-082
**sub_skill_id:** person-account
**format:** MCQ
**difficulty_b:** -0.3
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** Salesforce Person Accounts docs

**body:** B2C use case: customer is an individual, not a business. Use:

**options:**
- A) Custom Account-Contact pair always
- B) **Person Account** — combines Account + Contact into one record; simpler B2C model. Enabled once per org (irreversible). Most B2C industries (retail, healthcare consumer, financial retail) prefer this. B2B remains separate Account + Contact
- C) Lead only
- D) Custom object

**answer_key:** B — Person Account for B2C consumer. References: SF docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-082-seed-3a8c5e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-082
**bias_check_notes:** No bias.

---

### QUESTION 83: Validation Rules (Easy)

**question_id:** QOR-SF-083
**skill_id:** senior-sf-083
**sub_skill_id:** validation-rules
**format:** MCQ
**difficulty_b:** -0.2
**discrimination_a:** 1.3
**expected_duration_minutes:** 3
**citation:** SF Validation Rules docs

**body:** Validation rule fires:

**options:**
- A) After save
- B) **Before save**, after system validation; if rule TRUE, block the save with error message. No DML triggered. Use for required-field combinations, format validation, business-state invariants. Don't put expensive computation; uses formula language. Apex trigger validation runs after this
- C) Only on insert
- D) Async

**answer_key:** B — Validation rules at the right tier prevent bad-data writes cheaply. Reference: SF docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-083-seed-9b3e8c4a
**variant_seed:** qorium-sf-v0.6-2026-05-07-083
**bias_check_notes:** No bias.

---

### QUESTION 84: Flow Sub-Flow Reuse (Medium)

**question_id:** QOR-SF-084
**skill_id:** senior-sf-084
**sub_skill_id:** subflow
**format:** MCQ
**difficulty_b:** 0.4
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Flow docs

**body:** Reuse Flow logic across screens / contexts:

**options:**
- A) Copy paste
- B) **Subflow** — encapsulate reusable logic (lookup customer, create case, send notification) as a separate Flow; call from main Flow with input/output mapping. Versioning: each Flow has multiple versions; activate one. Subflow patterns reduce duplication; tested independently
- C) Apex always
- D) Process Builder

**answer_key:** B — Subflow is the Flow modularity primitive. Reference: SF Flow docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-084-seed-2c8a4e9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-084
**bias_check_notes:** No bias.

---

### QUESTION 85: Apex Custom Exception (Medium)

**question_id:** QOR-SF-085
**skill_id:** senior-sf-085
**sub_skill_id:** custom-exception
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Apex Developer Guide §Exceptions

**body:** Define custom Apex exception:

**options:**
- A) Throw String
- B) **`public class MyException extends Exception {}` — auto inherits constructors; throw via `throw new MyException('msg');`** — typed exceptions enable specific catch blocks; better than generic Exception for error-flow logic. Bonus: extend with severity / errorCode fields
- C) Use System.assertion
- D) Don't catch

**answer_key:** B — Custom typed exceptions improve error handling. Reference: Apex docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-085-seed-4f8b3c2a
**variant_seed:** qorium-sf-v0.6-2026-05-07-085
**bias_check_notes:** No bias.

---

### QUESTION 86: Salesforce Industries Solutions (Medium)

**question_id:** QOR-SF-086
**skill_id:** senior-sf-086
**sub_skill_id:** industry-cloud
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Industries Cloud docs

**body:** Salesforce Industries (Vlocity-acquired) Cloud features:

**options:**
- A) Generic CRM
- B) **Industry-specific data models + processes:** Financial Services Cloud (banking, wealth, insurance), Health Cloud (HIPAA-aware patient records), Communications Cloud (telco order management), etc. Layered on Salesforce platform. Faster time-to-value vs custom; license cost premium ~$150-500/user/month
- C) Free
- D) Replaces Sales Cloud

**answer_key:** B — Industries Cloud is for industry-specific use cases. References: Industries docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-086-seed-6c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-086
**bias_check_notes:** No bias.

---

### QUESTION 87: Async SOQL on Big Objects (Medium)

**question_id:** QOR-SF-087
**skill_id:** senior-sf-087
**sub_skill_id:** async-soql
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Big Objects async SOQL docs

**body:** Querying Big Objects with arbitrary filters:

**options:**
- A) Standard SOQL
- B) **Big Objects support only indexed-field SOQL synchronously**. Async SOQL (Job) for ad-hoc queries on non-indexed fields; takes minutes to hours; results saved to a target sObject. Plan queries via composite index from upfront; non-indexed query is the exception, not the rule
- C) Use SOSL
- D) Big Objects don't support SOQL

**answer_key:** B — Big Objects' query model is constrained; async SOQL bridges the gap. Reference: Big Objects docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-087-seed-2c4a8e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-087
**bias_check_notes:** No bias.

---

### QUESTION 88: Email Deliverability (Medium)

**question_id:** QOR-SF-088
**skill_id:** senior-sf-088
**sub_skill_id:** email-deliverability
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Email Settings docs

**body:** Salesforce-sent emails landing in spam. Fix:

**options:**
- A) Disable spam filter
- B) **DMARC + SPF + DKIM via Bounce/Reply Management + Email Relay**: configure SPF to authorize Salesforce's email-sending IPs; DKIM signing keys configured; DMARC policy aligned. For high-volume marketing, consider Marketing Cloud / dedicated IP. Set up Email Deliverability sandbox isolation
- C) Send from Gmail
- D) Use Slack instead

**answer_key:** B — Email auth is the deliverability foundation. References: SF Email Deliverability docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-088-seed-9c3a8e4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-088
**bias_check_notes:** No bias.

---

### QUESTION 89: Apex CPU Time Limit (Medium)

**question_id:** QOR-SF-089
**skill_id:** senior-sf-089
**sub_skill_id:** apex-cpu-limit
**format:** MCQ
**difficulty_b:** 0.6
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Apex Limits

**body:** `Apex CPU time limit exceeded` (10 sec sync, 60 sec async). Patterns:

**options:**
- A) Always async
- B) Profile via `Limits.getCpuTime()` debug; refactor: use Map for O(1) lookups (vs nested loops O(N²)); avoid expensive operations in DML loops; avoid recursive logic; consider chunking via Queueable for large datasets. CPU is one of strictest Apex limits; algorithm complexity matters
- C) Disable triggers
- D) System.gc()

**answer_key:** B — CPU limit forces algorithmic discipline. Reference: Apex Limits.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-089-seed-7e3c8a4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-089
**bias_check_notes:** No bias.

---

### QUESTION 90: Sandbox Refresh Strategy (Medium)

**question_id:** QOR-SF-090
**skill_id:** senior-sf-090
**sub_skill_id:** sandbox-types
**format:** MCQ
**difficulty_b:** 0.5
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Sandbox docs

**body:** Sandbox tier choice for development team:

**options:**
- A) Always Full
- B) **Developer: 200MB, refresh-on-demand, no production data — for unit dev. Developer Pro: 1GB, refresh-daily — for integration. Partial Copy: 5GB + 10K records per object — for QA + UAT. Full: production-clone (data + metadata) — for staging + load test. Refresh frequency: Dev daily, Partial weekly, Full only quarterly (refresh resets data!)**
- C) Full only
- D) Production for dev

**answer_key:** B — Sandbox strategy is the modern release management foundation. References: Salesforce Sandbox docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-090-seed-3a8c5e2b
**variant_seed:** qorium-sf-v0.6-2026-05-07-090
**bias_check_notes:** No bias.

---

### QUESTION 91: Process for Picklist Value Migration (Medium)

**question_id:** QOR-SF-091
**skill_id:** senior-sf-091
**sub_skill_id:** picklist-migration
**format:** MCQ
**difficulty_b:** 0.7
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** SF Picklist docs

**body:** Renaming "Active" to "Subscribed" on a 1M-record Account:

**options:**
- A) Just rename
- B) **Add new "Subscribed" value first; backfill existing "Active" records via Bulk API; update all Flows / Reports / Apex / Validation rules referencing the old value; deactivate "Active" (don't delete — breaks history/reports). Plan as multi-week migration with parallel old/new during transition. Use Field History Tracking to validate**
- C) Delete and recreate
- D) Disable picklist

**answer_key:** B — Picklist migrations are deceptively risky. References: SF docs.

**rubric:** MCQ correct=5.

**watermark_seed:** qorium-sf-v0.6-091-seed-2c8a4e9b
**variant_seed:** qorium-sf-v0.6-2026-05-07-091
**bias_check_notes:** No bias.

---

### QUESTION 92: Code — Custom REST API Endpoint (Hard - Code)

**question_id:** QOR-SF-092
**skill_id:** senior-sf-092
**sub_skill_id:** apex-rest
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.5
**expected_duration_minutes:** 12
**citation:** Apex REST docs

**body:** Expose a custom Apex REST endpoint `/services/apexrest/v1/orders/{id}` supporting GET (return order details) and POST (update status). Include auth, error handling, idempotency.

**options:** []

**answer_key:**

```apex
@RestResource(urlMapping='/v1/orders/*')
global with sharing class OrderRestApi {

    @HttpGet
    global static OrderResponse getOrder() {
        RestRequest req = RestContext.request;
        String orderId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        try {
            Order o = [
                SELECT Id, Status, OrderNumber, TotalAmount, EffectiveDate
                FROM Order WHERE Id = :orderId
                WITH SECURITY_ENFORCED LIMIT 1
            ];
            return new OrderResponse('ok', o);
        } catch (QueryException e) {
            RestContext.response.statusCode = 404;
            return new OrderResponse('not_found', null);
        }
    }

    @HttpPost
    global static OrderResponse updateStatus() {
        RestRequest req = RestContext.request;
        String orderId = req.requestURI.substring(req.requestURI.lastIndexOf('/') + 1);
        // Idempotency-Key header: caller supplies UUID; Salesforce de-dupes via Custom Object
        String idemKey = req.headers.get('Idempotency-Key');
        if (String.isNotBlank(idemKey)) {
            List<API_Call__c> existing = [
                SELECT Id, Response_Body__c FROM API_Call__c
                WHERE Idempotency_Key__c = :idemKey AND Endpoint__c = '/v1/orders/POST' LIMIT 1
            ];
            if (!existing.isEmpty()) {
                return (OrderResponse) JSON.deserialize(existing[0].Response_Body__c, OrderResponse.class);
            }
        }
        try {
            Map<String, Object> payload = (Map<String, Object>) JSON.deserializeUntyped(req.requestBody.toString());
            Order o = [SELECT Id, Status FROM Order WHERE Id = :orderId WITH SECURITY_ENFORCED LIMIT 1];
            o.Status = (String) payload.get('status');
            update o;
            OrderResponse resp = new OrderResponse('updated', o);
            if (String.isNotBlank(idemKey)) {
                insert new API_Call__c(
                    Idempotency_Key__c = idemKey,
                    Endpoint__c = '/v1/orders/POST',
                    Response_Body__c = JSON.serialize(resp)
                );
            }
            return resp;
        } catch (Exception e) {
            RestContext.response.statusCode = 400;
            return new OrderResponse('error: ' + e.getMessage(), null);
        }
    }

    global class OrderResponse {
        public String status;
        public Order order;
        public OrderResponse(String s, Order o) { this.status = s; this.order = o; }
    }
}
```

Key points:
- `@RestResource` exposes the class; auth via standard SF session/OAuth (caller passes Bearer token; Salesforce platform auths).
- `WITH SECURITY_ENFORCED` enforces FLS/CRUD on the user's behalf.
- Idempotency-Key header + custom object stores past responses; safely retryable.
- 404 / 400 status codes via `RestContext.response.statusCode`.
- Response object serialized as JSON automatically.

References: Apex REST + Salesforce REST API docs.

**rubric:** 12-pt: @RestResource + GET/POST handlers (3) + URL parsing (2) + WITH SECURITY_ENFORCED (1) + Idempotency-Key pattern with custom object dedupe (4) + status-code branching (2).

**watermark_seed:** qorium-sf-v0.6-092-seed-7c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-092
**bias_check_notes:** No bias.

---

### QUESTION 93: Code — Bulk-Safe Apex Upsert (Hard - Code)

**question_id:** QOR-SF-093
**skill_id:** senior-sf-093
**sub_skill_id:** bulk-upsert
**format:** code
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 10
**citation:** Apex DML docs

**body:** Write Apex method `syncContacts(List<ContactDTO> dtos)` that upserts based on External_Id__c with bulk-safe partial-success error handling.

**options:** []

**answer_key:**

```apex
public with sharing class ContactSync {

    public class ContactDTO {
        public String externalId;
        public String firstName;
        public String lastName;
        public String email;
    }

    public class SyncResult {
        public Integer inserted = 0;
        public Integer updated = 0;
        public List<String> errors = new List<String>();
    }

    public static SyncResult syncContacts(List<ContactDTO> dtos) {
        if (dtos == null || dtos.isEmpty()) return new SyncResult();

        List<Contact> contacts = new List<Contact>();
        for (ContactDTO d : dtos) {
            contacts.add(new Contact(
                External_Id__c = d.externalId,
                FirstName      = d.firstName,
                LastName       = d.lastName,
                Email          = d.email
            ));
        }

        SyncResult r = new SyncResult();
        Database.UpsertResult[] results = Database.upsert(
            contacts,
            Contact.External_Id__c,
            false   // allOrNone=false -> partial success
        );
        for (Integer i = 0; i < results.size(); i++) {
            Database.UpsertResult res = results[i];
            if (res.isSuccess()) {
                if (res.isCreated()) r.inserted++;
                else r.updated++;
            } else {
                r.errors.add(dtos[i].externalId + ': ' + res.getErrors()[0].getMessage());
            }
        }
        return r;
    }
}
```

Key points:
- Single bulk DML (upsert) with the `Schema.SObjectField` (`Contact.External_Id__c`) variant for upsert by External Id.
- `allOrNone=false` allows partial success; iterate results to classify.
- Aggregated SyncResult for caller to log / report.
- Caller handles >10K record batching by calling in chunks; OR wrap in a Batch Apex class.

Reference: Apex DML docs.

**rubric:** 10-pt: Database.upsert with External Id arg (3) + allOrNone=false (2) + iterate UpsertResult[] for inserted vs updated vs error (3) + SyncResult aggregator (2).

**watermark_seed:** qorium-sf-v0.6-093-seed-9b3a8e4c
**variant_seed:** qorium-sf-v0.6-2026-05-07-093
**bias_check_notes:** No bias.

---

### QUESTION 94: Marketing Cloud Integration (Hard)

**question_id:** QOR-SF-094
**skill_id:** senior-sf-094
**sub_skill_id:** mc-connect
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Marketing Cloud Connect docs

**body:** Salesforce CRM ↔ Marketing Cloud integration:

**options:**
- A) Custom point-to-point
- B) **Marketing Cloud Connect** — official add-on; bidirectional sync (SF Lead/Contact ↔ MC Subscriber); Send Email from CRM; Send Logs back; per-field mapping. Or **Salesforce CDP** (newer, future direction). For new orgs: CDP recommended. Custom point-to-point only when MC Connect doesn't fit
- C) Replace MC
- D) Email only

**answer_key:** B — MC Connect / CDP is the modern bridge. References: SF CDP docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-094-seed-2c8a4e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-094
**bias_check_notes:** No bias.

---

### QUESTION 95: Salesforce Communities / Experience Cloud (Hard)

**question_id:** QOR-SF-095
**skill_id:** senior-sf-095
**sub_skill_id:** experience-cloud
**format:** MCQ
**difficulty_b:** 1.1
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Experience Cloud docs

**body:** Self-service customer portal:

**options:**
- A) Custom Vue.js + Apex
- B) **Experience Cloud (formerly Communities)** — SF-managed portal templates (Customer Service, Partner, Help Center, etc.); LWC + Aura customization; built-in auth (Customer Community License = $); SEO-friendly; deflects support tickets via knowledge articles. Trade-offs: license cost; design constraints. Custom UI for complex multi-tenant SaaS only when Experience can't fit
- C) Trello
- D) Build custom always

**answer_key:** B — Experience Cloud is the SF-native customer-facing platform. References: Experience Cloud docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-095-seed-7e3c8a4b
**variant_seed:** qorium-sf-v0.6-2026-05-07-095
**bias_check_notes:** No bias.

---

### QUESTION 96: Einstein GPT / Sales AI (Hard)

**question_id:** QOR-SF-096
**skill_id:** senior-sf-096
**sub_skill_id:** einstein-gpt
**format:** MCQ
**difficulty_b:** 1.0
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Salesforce Einstein docs

**body:** Adopting Einstein GPT / Salesforce AI:

**options:**
- A) Replaces all manual work
- B) **Use cases: AI summary, email drafting, Service replies, Sales call insights, Forecast prediction. Constraints: Einstein Trust Layer (no data sent to external models for retention/training); per-org Vector DB (Data Cloud); audit trails; per-tenant guardrails. License cost $35-150/user/month. Pilot with 1 use case (typically email drafting or call summaries) before broad rollout**
- C) Marketing only
- D) Free

**answer_key:** B — Einstein with Trust Layer + measured pilot is the playbook. References: Einstein Trust docs.

**rubric:** MCQ correct=8.

**watermark_seed:** qorium-sf-v0.6-096-seed-3a8c4e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-096
**bias_check_notes:** No bias.

---

### QUESTION 97: Design — Multi-Org Strategy (Hard - Design)

**question_id:** QOR-SF-097
**skill_id:** senior-sf-097
**sub_skill_id:** multi-org-design
**format:** design
**difficulty_b:** 1.4
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Salesforce ALM whitepaper

**body:** A global enterprise with 5 BUs in 12 countries needs Salesforce. Decide single-org-per-BU vs federated. Cover data sharing, governance, integration, deployment. (Limit: 800 words.)

**answer_key:**

**Recommendation: One Salesforce production org per BU is usually the right answer at this scale. Federate via central data warehouse.**

**Why per-BU.**
- Each BU has distinct CRM processes, customizations, governor limit budgets.
- Acquisitions onboard quickly without merging.
- Failure isolation.
- Per-region compliance simpler (DPDPA, GDPR, etc.).

**Why NOT one giant org.**
- Customization debt (fighting for record types, page layouts).
- Governor limits compete across BUs.
- Sharing model complexity exponential.
- Single-point-of-failure.

**Federated architecture.**

- **Per-BU Salesforce orgs**, each with own license + admin team.
- **Common cross-org primitives:**
  - Shared identity (SSO via Okta / Azure AD / Salesforce Federated Identity).
  - Shared data warehouse (Snowflake / BigQuery) with per-org sync via Mulesoft + Heroku Connect / Salesforce Connector.
  - Cross-org reporting in DW + Tableau / Power BI / CRM Analytics with multi-org dataset.
- **Standardized governance:**
  - Architecture Center of Excellence (ACOE) defines naming, security, deployment patterns across orgs.
  - Quarterly review of cross-org consistency.
  - Common code library (Unlocked Packages) deployed to all BUs (audit, compliance, common utilities).

**Integration architecture.**

- **iPaaS (Mulesoft) as middleware** for cross-org and cross-system integration.
- **Salesforce Connect** for low-volume real-time cross-org views.
- **Platform Events / Pub-Sub API** for event broadcasts across orgs.

**Deployment model.**

- **Each BU has own SFDX repo** + CI/CD pipeline.
- **Common code packages** (Unlocked Packages) deployed centrally; consumed by BUs.
- Sandboxes follow standard Dev → Pro → Partial → Full → Prod flow per BU.

**Compliance.**

- Per-region data residency (Salesforce Hyperforce in EU, IN, JP, US).
- Per-BU PII handling under local laws (GDPR for EU, DPDPA for IN, CCPA for CA).
- Centralized compliance policy in Custom Metadata, deployed via package.

**Cross-BU data sharing.**

- Customer 360 / Data Cloud for unified profile across BUs.
- Master Data Management (MDM) tool (Reltio / Informatica) for golden record.
- Data Cloud Customer Profile pulls from each BU into a unified semantic layer.

**Cost model (illustrative for 5 BUs).**

- 5x Salesforce Unlimited orgs: ~$10-15M/year licenses.
- Mulesoft: ~$1M/year.
- DW: ~$500K-1M/year.
- ACOE team: ~10 FTE.
- TOTAL: $15-20M/year.
- vs single-org with $5-7M/year licenses but multi-year customization complexity cost: similar net cost; multi-org gives cleaner separation.

**Risk surfaces.**

- **Customer data fragmentation.** 1 customer in 3 BUs has 3 records. MDM fixes.
- **Inconsistent CX.** Same customer feels different across BUs. Customer 360 + shared style.
- **Tooling overhead.** Each BU maintains own SFDX repo, sandboxes, etc. Standardized templates reduce this.
- **Talent.** Salesforce architects are scarce; cross-BU rotation prevents siloing.

**Phased rollout.**

- Year 1: Stand up first 2 BU orgs with shared infrastructure.
- Year 2: Migrate / onboard remaining BUs.
- Year 3: Optimize, consolidate where data shows convergence.

**Triggers to revisit.**

- BU divests: spin off org cleanly.
- Two BUs merge: consolidate orgs (12-18 month project).
- Process convergence across all BUs: reconsider single-org.

**rubric:** 18-pt: per-BU orgs + federated DW + shared identity (4) + Customer 360 / Data Cloud for unified profile (3) + iPaaS middleware (2) + per-region Hyperforce + compliance (3) + ACOE governance (2) + per-BU SFDX + shared Unlocked Packages (2) + cost model + risks (2).

**watermark_seed:** qorium-sf-v0.6-097-seed-9c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-097
**bias_check_notes:** No bias.

---

### QUESTION 98: Casestudy — Salesforce Adoption Failure (Very Hard - Casestudy)

**question_id:** QOR-SF-098
**skill_id:** senior-sf-098
**sub_skill_id:** adoption-failure
**format:** casestudy
**difficulty_b:** 1.5
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Sales VP says "Salesforce isn't being used; reps still use spreadsheets." 1 year post-implementation, login rates are 40% of paid licenses. Plan turnaround. (Limit: 800 words.)

**answer_key:**

**Step 1 — diagnose root cause (NOT "users are dumb").**

Common root causes (interview reps + admin to find which apply):

1. **UX is painful.** Page layouts cluttered; required fields excessive; multi-click flows for common tasks. Reps say "too slow."
2. **Data quality bad.** Reps don't trust the data; fall back to spreadsheets where they have control.
3. **Mobile inadequate.** Reps in field can't easily use Salesforce on phone.
4. **Reports useless.** Standard reports don't match how managers think; reps build own off-spreadsheet.
5. **Training inadequate.** Initial 1-day training doesn't translate to daily workflow.
6. **Manager not enforcing.** No incentive to log in; no consequence for not.
7. **Integration broken.** Email / calendar integration not enabled; reps work outside Salesforce.

**Step 2 — fix in priority of impact.**

1. **Manager accountability.** Make Salesforce the system of record; pipeline review meetings use only Salesforce data; spreadsheets banned. Without this, no other fix matters.
2. **UX simplification.** Redesign page layouts: <10 visible fields; required-field minimum; quick-actions for top 3 daily tasks; mobile-first thinking. Often single biggest UX gain.
3. **Email / calendar integration.** Outlook / Gmail integration; Einstein Activity Capture for auto-log. Removes manual data entry.
4. **Mobile-first.** Test the rep workflow on phone; fix what breaks.
5. **Reports tailored.** Manager + rep co-design reports; embed in app home page.
6. **Data quality.** Per-rep data clean-up sprints; gamify with leaderboard.
7. **Training: ongoing.** Weekly tip; champion network; lunch-and-learn.

**Step 3 — measure adoption.**

- Login rate (target >80% of paid licenses).
- Quality metrics: % opps with all required fields; mean fields filled; pipeline accuracy.
- Manager-level: pipeline review uses Salesforce 100%.
- 6-month survey: NPS of Salesforce among reps.

**Step 4 — change management.**

- Champion per BU + per region; weekly meeting; share wins.
- Sales VP communication: "We invested $X in Salesforce; here's how we make it deliver." Public commitment.
- Recognition: top adopters celebrated; manager performance partly tied to team adoption.

**Step 5 — long-term governance.**

- Quarterly UX review with reps.
- Pipeline health metrics on exec dashboard.
- AI / automation to reduce manual work (Einstein, Auto-Log, AI summaries).
- Periodic re-survey + iterate.

**Outcome target.**

- Login rate 40% → 85% in 6 months.
- Pipeline accuracy: forecast variance ±5% (was ±20%).
- Spreadsheet use down 90%.
- Sales VP reports: "Salesforce is now how we run pipeline."

**Lessons.**

- Salesforce adoption is rarely a tooling problem; it's a behavior problem with tooling levers.
- UX simplification + manager accountability + integration are the trifecta. Skip any one and adoption stalls.
- Einstein Activity Capture eliminates 80% of "I have to log this manually" pain; turn on early.
- Survey reps quarterly; their feedback is the leading indicator.

**Anti-patterns.**

- "Train more." Training is 10% of the answer; UX + accountability are 90%.
- "Force compliance." Punitive doesn't work; eliminate friction so the right behavior is the easy behavior.
- "Add more fields." Reps already feel form-fatigue; subtract.

**rubric:** 25-pt: diagnose root causes (5) + UX simplification (3) + email/cal integration (3) + manager accountability (4) + mobile-first (2) + reports tailored (2) + measure adoption with login + quality (3) + change management with champions (3).

**watermark_seed:** qorium-sf-v0.6-098-seed-2c4a8e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-098
**bias_check_notes:** No bias.

---

### QUESTION 99: Casestudy — Data Privacy Crisis (Very Hard - Casestudy)

**question_id:** QOR-SF-099
**skill_id:** senior-sf-099
**sub_skill_id:** data-privacy-crisis
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.7
**expected_duration_minutes:** 30
**citation:** Original-authored

**body:** Audit reveals: in your Salesforce org, junior staff have read access to high-net-worth customer Aadhaar / PAN / bank details (3M records, 50 unauthorized users); right-to-erasure requests are pending 6 months; SOX audit is in 90 days. Plan response. (Limit: 800 words.)

**answer_key:**

**Day 1-3 — emergency containment.**

1. **Revoke unauthorized access immediately.** Profile / Permission Set audit; block 50 users; notify managers + HR.
2. **Audit access log** for past 24 months: who viewed what; flag suspicious access patterns; preserve logs for legal review.
3. **Notify regulator** if breach criteria met (DPDPA breach notification within 72h to Data Protection Board); CISO + Legal involved from day 0.
4. **Stop bleeding:** disable any active high-risk processes (data export, mass email containing PII).

**Day 3-14 — structural fixes.**

5. **Field-Level Security re-architecture.** Aadhaar/PAN: tokenize via Karza Vault or equivalent; Salesforce stores token + last-4. Existing fields: encrypt with Shield Deterministic Encryption. Restrict via Permission Sets to specific roles only.
6. **Sharing model audit.** OWD = Private for sensitive objects; targeted Sharing Rules for need-to-know; Permission Set Groups bundle for least-privilege.
7. **Role-based access.** Define Personas (Branch Manager, Compliance Officer, Customer Service tier 1/2/3). Map Permission Sets per Persona.

**Day 14-30 — right-to-erasure backlog.**

8. **Erasure pipeline.** Custom Apex + Flow that on receipt of erasure request: deletes / anonymizes data across Salesforce + downstream systems (DW, archives, integrations); 30-day SLA per DPDPA.
9. **Backlog of 6-month-old requests:** triage by priority; deliver each in writing; communicate timeline to customers; document.
10. **Audit trail of erasures:** Custom Object retains erasure receipt + scope + completion date.

**Day 30-60 — SOX audit prep.**

11. **Access review.** Quarterly access certification: each manager certifies their team's access; non-certified access auto-revoked.
12. **Change management evidence.** All metadata changes via SFDX + git; SOX evidence is the merge history; Salesforce production changes through PR review only.
13. **Segregation of duties.** Developer ≠ Production deployer; approval workflows for production deploys.
14. **Audit log retention.** 7 years per RBI; export to S3 Glacier monthly.

**Day 60-90 — governance + audit.**

15. **External pen-test + access audit** by independent auditor.
16. **Tabletop exercise:** simulated data breach response. Test all teams: SOC, Legal, Comms, Customer Service.
17. **Compliance dashboard:** ongoing metrics — access certifications complete %, erasure SLA met %, change management coverage %, security alerts open.
18. **SOX audit walkthrough** with auditor 2 weeks before formal audit.

**Communication.**

- **Internal:** all-hands "Here's what happened, here's what we're doing." Named leaders accountable; transparent timeline.
- **External:** customer notification (per DPDPA / regulatory thresholds); transparent FAQ; account-specific outreach for affected high-net-worth customers.
- **Regulator:** report filed with Data Protection Board India + RBI cyber-security team within SLA. Quarterly compliance updates.

**Long-term commitments.**

- **Privacy-by-design** as a Salesforce architecture principle: every new sensitive field gets Field Audit Trail + Encryption + tightened FLS at design time, not after.
- **Annual access audit** (not just at SOX time).
- **Privacy Officer role** created, reporting to Legal + CISO.
- **DPO (Data Protection Officer) per DPDPA** appointed.
- **Customer trust rebuild** — public transparency report annually.

**Lessons.**

- "Default sharing = Public Read/Write" is the #1 Salesforce data exposure risk. Default Private + targeted sharing is the correct posture.
- DPDPA + RBI demand evidence of process, not just intent. Implement, document, audit.
- Erasure SLA is hard to meet in tangled data; design erasure pipelines from day 1.
- Junior-staff over-access is THE most common Salesforce audit finding. Quarterly access certification is the discipline.

**Cost.**

- Tokenization vendor: ~$50K/year.
- Shield Encryption: ~10% of Salesforce license cost.
- Pen test: ~$50-100K.
- Privacy team: 2-3 FTE.
- Total compliance investment: ~$1-2M/year — small relative to breach cost.

**rubric:** 25-pt: immediate containment + access revoke (4) + regulator notification (3) + Aadhaar/PAN tokenization + Shield (4) + sharing model re-architecture w/ Personas + PSG (4) + right-to-erasure pipeline (3) + SOX prep: access cert + change mgmt + segregation of duties (3) + customer + regulator comms (2) + ongoing privacy governance (2).

**watermark_seed:** qorium-sf-v0.6-099-seed-3a8c5e7b
**variant_seed:** qorium-sf-v0.6-2026-05-07-099
**bias_check_notes:** No bias. India context.

---

### QUESTION 100: Casestudy — Architecting Salesforce CoE (Very Hard - Casestudy)

**question_id:** QOR-SF-100
**skill_id:** senior-sf-100
**sub_skill_id:** salesforce-coe
**format:** casestudy
**difficulty_b:** 1.6
**discrimination_a:** 1.6
**expected_duration_minutes:** 30
**citation:** Salesforce ALM + CoE whitepapers

**body:** A 10K-employee enterprise has accumulated 30 Salesforce orgs, 100+ admins/devs across BUs, no central authority. CTO wants a Center of Excellence. Plan org, charter, deliverables, success metrics. (Limit: 800 words.)

**answer_key:**

**TL;DR.** CoE that's a federated, enabling team — NOT a centralized gatekeeper. Charter: standards + shared services + capability building.

**Charter.**
- Establish standards (security, naming, deployment, code).
- Provide shared services (Unlocked Packages, integration patterns, training, advanced architecture).
- Build platform capability (each BU's admins/devs grow under CoE mentorship).

**Org structure (year 1).**

- **CoE Lead (Director / VP):** reports to CTO/CIO. Strategic.
- **Architecture pod (3-4):** sets technical standards; reviews complex designs.
- **Platform pod (3-4):** owns shared infrastructure (CI/CD pipelines, Unlocked Packages, base permission sets, base flows).
- **Security/compliance pod (2-3):** owns security policies, access governance, compliance audit.
- **DevOps pod (2-3):** SFDX pipelines, sandbox provisioning, environment management.
- **Training/enablement pod (2-3):** documentation, certification programs, brown-bags.
- **BU Liaisons (per BU; not full-time CoE staff):** advocate BU needs to CoE; advocate CoE standards back to BU.

Total: 12-18 in CoE proper + per-BU liaisons.

**Charter deliverables (year 1).**

**Q1.**
- Inventory: 30 orgs, ownership, license usage, customization complexity.
- Standards v1: security baseline (FLS, PSG patterns), naming convention, deployment process.
- Shared services pilot: 3 BUs adopt CoE-managed CI/CD.

**Q2.**
- All 30 orgs onboarded to standards v1.
- CoE-built Unlocked Packages: audit logging, common picklists, error handling.
- Quarterly architecture review for any net-new BU customization.

**Q3.**
- Cross-org reporting via DW + Tableau (CoE-built dataflow).
- CoE-led training: 100+ admins certified.
- Monthly Salesforce Show & Tell across BUs.

**Q4.**
- 80% of BUs using shared CI/CD.
- Adoption survey: NPS >40 from BU admins.
- Quarterly compliance audit + remediation.

**Year 2 evolution.**
- Consolidation candidates identified (BUs with high process overlap).
- AI / Einstein adoption coordinated centrally.
- Custom applications cataloged + lifecycle managed.

**Success metrics.**

- 30 orgs adopting standards: 0% → 95%.
- Cross-BU reporting available: 0% → 100%.
- Security audit: pass with no major findings.
- BU admin satisfaction (NPS): baseline → 40+.
- Time-to-onboard new admin: 3 months → 1 month.
- Cross-org incidents (security, data): -75%.

**What CoE is NOT.**

- NOT a gatekeeper that blocks BU velocity.
- NOT the team that owns every BU's customization.
- NOT a "cost center" — quantify value via time saved, incidents reduced, faster time-to-market.

**What CoE IS.**

- Shared services provider (CI/CD, packages, training).
- Standards body (security, naming, deployment).
- Architecture review for cross-BU concerns.
- Capability builder (mentor BU admins/devs to higher levels).
- Bridge: between BU and Salesforce vendor (negotiate licenses, escalate cases).

**Anti-patterns to avoid.**

- "Everything goes through CoE." Slows BU velocity; CoE becomes bottleneck. Federated.
- "CoE prescribes UX." Each BU has unique users; CoE prescribes patterns, not pixels.
- "Centralized admin team." Each BU keeps own admins; CoE supports.
- "Blame the BU for non-compliance." Engage; understand; fix root cause (often training or unclear standard).

**Cost model.**

- CoE: 12-18 FTE × $200K = $3-4M/year.
- Salesforce platform team allocation across BUs: ~100 FTE × $200K = $20M/year (was already there; CoE redistributes).
- Net new investment: $3-4M/year.
- Value: incidents reduced (~$5M/year saved), faster time-to-market (~$10M/year revenue acceleration), license consolidation (~$2-3M/year saved).
- ROI: 3-5x in year 1.

**Phased rollout.**

- Q1: Build CoE team + standards.
- Q2: Pilot with 3 friendly BUs.
- Q3: Scale to all BUs.
- Q4: Optimize; iterate.

**Lessons (universal).**

- CoE that prescribes without engaging fails.
- CoE that engages without prescribing is just a service desk.
- The balance: enable BUs while raising the floor; consult on top, mandate on bottom (security, compliance).
- BU liaison roles + quarterly rotation prevent CoE-vs-BU silos.

**rubric:** 25-pt: federated charter not gatekeeper (4) + pod structure (3) + 4-quarter deliverables (4) + measurable success metrics (3) + what-CoE-IS-vs-IS-NOT clarity (3) + anti-patterns called out (3) + cost model w/ ROI (3) + lessons: balance enable + prescribe (2).

**watermark_seed:** qorium-sf-v0.6-100-seed-7c4a8e3b
**variant_seed:** qorium-sf-v0.6-2026-05-07-100
**bias_check_notes:** No bias.

---

## End Salesforce 081-100. Salesforce 100/100 ✅. 6 of 8 Wave-1 sub-skills closed.
