# Wave 2: Salesforce CPQ Extension Questions 081–100

**STATUS:** AI-drafted v0.6 EXTENSION (closes 100/100 CPQ target). SME Lead validation pending.

**Scope:** 20 final CPQ questions covering Apex testing, Salesforce Connect, Platform Events / CDC, Industries CPQ migration, Revenue Cloud transactions, multi-cloud integration, Shield Encryption, Field Audit Trail, CRM Analytics, Conga to CPQ Quote Template migration, ESS-style scheduled flows, Lightning App Builder, custom metadata types, FlexQuotes.

**Difficulty Distribution:** 3 Easy / 9 Medium / 6 Hard / 2 Very Hard.
**Format Distribution:** 12 MCQ / 4 Code / 2 Design / 2 Case-Study.

---

## QUESTION 81: Apex Test Coverage Requirement

**question_id:** QOR-SFCPQ-081
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** apex-testing
**format:** MCQ
**difficulty_b:** -1.0 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 3
**citation:** Salesforce Apex Test Coverage Documentation: developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_qs_test.htm

**body:**

What is Salesforce's Apex test coverage requirement for production deployment?

**options:**

- A) ≥75% overall org coverage; each Apex Trigger must have ≥1% coverage; tests must call `Test.startTest()` / `Test.stopTest()`; assertions are required (System.assert*)
- B) ≥80% overall; no per-trigger requirement
- C) ≥75% per class but org-level can be 0%
- D) No coverage requirement; just having tests is enough

**answer_key:**

A — Salesforce's deployment gates: ≥75% org-level Apex coverage (calculated across all custom classes + triggers); each individual Apex Trigger must have ≥1% coverage; Apex tests should call `Test.startTest()` / `Test.stopTest()` to reset governor limits cleanly + run async logic; tests should assert outcomes via `System.assert*` family. References: Salesforce Apex Reference §Test Coverage.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-081-seed-2a8f1c4e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-081
**bias_check_notes:** No bias.

---

## QUESTION 82: Test Data Factory Pattern

**question_id:** QOR-SFCPQ-082
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** apex-testing
**format:** MCQ
**difficulty_b:** -0.5 (Easy)
**discrimination_a:** 1.4
**expected_duration_minutes:** 4
**citation:** Salesforce Test Data Factory Pattern: developer.salesforce.com/docs/atlas.en-us.apexcode.meta/apexcode/apex_testing_setup.htm

**body:**

Across 20 Apex test classes, the same setup logic creates Account + Opportunity + Quote + QuoteLine records. Each test creates fresh data, ~50 lines of code per setup. What's the canonical refactor?

**options:**

- A) Test Data Factory class: a class with public static methods `createAccount()`, `createOpportunity()`, `createQuote()`, `createQuoteLine()` that each create + return the record with sensible defaults; tests call `TestDataFactory.createQuoteWithLines(5)` instead of inline setup
- B) Use `@TestSetup` per test class (still 50 LOC × 20 classes)
- C) Hard-code the data as String constants and parse in each test
- D) Tests don't need test data; mock everything

**answer_key:**

A — Test Data Factory is the canonical Salesforce pattern. A single class with public static factory methods returning common test records, each with sensible defaults. Tests call `TestDataFactory.createQuoteWithLines(5)` for 5-line quotes instead of replicating 50 LOC each. Benefits: consistency, easier maintenance, faster tests via shared utility methods. (B) `@TestSetup` is per-class; doesn't address cross-class duplication. (C) is the antipattern. (D) mocking is appropriate for external systems; for internal data setup, real Salesforce records are needed for governor limits + sharing tests. References: Salesforce Test Data Factory Pattern §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-082-seed-7e3c4a1d
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-082
**bias_check_notes:** No bias.

---

## QUESTION 83: Field-Level Security (FLS) on REST API

**question_id:** QOR-SFCPQ-083
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** field-level-security
**format:** MCQ
**difficulty_b:** -0.3 (Easy)
**discrimination_a:** 1.5
**expected_duration_minutes:** 4
**citation:** Salesforce Field-Level Security Documentation: developer.salesforce.com/docs/atlas.en-us.api.meta/api/field_level_security.htm

**body:**

A Salesforce REST API call from a custom integration retrieves Account records. The `IsRestricted__c` field returns null even though the data is set. Why?

**options:**

- A) The integration user doesn't have FLS read access to `IsRestricted__c`; FLS is enforced on REST API responses; the field is effectively absent for that user
- B) REST API ignores FLS; it's a UI-only control
- C) The field is sharing-restricted; switch to Apex with `WITH SECURITY_ENFORCED`
- D) The field is auto-encrypted

**answer_key:**

A — FLS (Field-Level Security) is enforced on REST/SOAP APIs. If the calling user's profile or permission set doesn't grant Read access to a field, REST returns null for that field. Either grant FLS to the integration user, or use a different user with broader access. (B) wrong — FLS applies everywhere. (C) sharing affects records, not fields. (D) encryption needs explicit Shield setup. References: Salesforce Field-Level Security §API Enforcement.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-083-seed-3c1f8a4e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-083
**bias_check_notes:** No bias.

---

## QUESTION 84: Permission Set vs Profile

**question_id:** QOR-SFCPQ-084
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** permission-management
**format:** MCQ
**difficulty_b:** 0.4 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Permission Sets Documentation: developer.salesforce.com/docs/atlas.en-us.salesforce_app_admin.meta/salesforce_app_admin/permission_sets.htm

**body:**

Salesforce best-practice: should custom permissions be added to Profiles or Permission Sets?

**options:**

- A) Permission Sets — Salesforce's strategic direction (Permission Set Groups + roles); Profiles serve as a baseline + UI assignment, but custom permissions added there are harder to maintain at scale (can't differ by user without 1 profile per variation)
- B) Profiles — they're inherited; cleaner
- C) Either; both work the same
- D) Neither; use Salesforce-built-in roles only

**answer_key:**

A — Salesforce's strategic direction since 2022 is "Profiles for baseline + UI; Permission Sets / Permission Set Groups for everything else". Custom permissions, object access, field access, Apex class access, Visualforce page access — all Permission Sets. This makes maintenance scalable: one developer/admin permission set for 5 admins, vs. cloning 5 profiles. Permission Set Groups consolidate multiple permission sets. (B) is the legacy approach; doesn't scale. (C) wrong — they're not interchangeable. (D) Salesforce-built-in roles are necessary for sharing but separate from permissions. References: Salesforce Permission Set Direction §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-084-seed-9d4e1c8f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-084
**bias_check_notes:** No bias.

---

## QUESTION 85: Shield Platform Encryption

**question_id:** QOR-SFCPQ-085
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** shield-encryption
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Shield Platform Encryption Documentation: developer.salesforce.com/docs/atlas.en-us.securityImplGuide.meta/securityImplGuide/security_pe_about.htm

**body:**

A Pharma customer wants to encrypt patient identifiers in Salesforce. Standard Encryption (Classic Encryption) is enabled. Is that enough for HIPAA + new GDPR-rule compliance?

**options:**

- A) No — Classic Encryption protects only `Custom Field Encrypted Text` fields with limited reporting. **Shield Platform Encryption** is required for compliance: encrypts more fields (standard + custom), preserves index + search + reporting, supports BYOK (Bring Your Own Key), is compliant with HIPAA + GDPR + SOC 2 + ISO 27001
- B) Yes — Classic Encryption is HIPAA-compliant
- C) No — must use external encryption (KMS-style) outside Salesforce
- D) HIPAA doesn't require encryption at rest; just access controls

**answer_key:**

A — Classic Encryption is limited (only Encrypted Text custom fields, no index/search/reporting on encrypted data). **Shield Platform Encryption** is the proper compliance grade: encrypts both standard and custom fields, files, attachments, search index data, supports BYOK + HSM key derivation, audit-logged via Field Audit Trail. Compliant with HIPAA, GDPR, SOC 2, ISO 27001, FedRAMP. (B) wrong — Classic alone insufficient. (C) keep encryption inside Salesforce for performance. (D) HIPAA Security Rule §164.312(a)(2)(iv) explicitly requires encryption at rest. References: Salesforce Shield Platform Encryption Reference §1; HIPAA Security Rule.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-085-seed-7c4d1a3f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-085
**bias_check_notes:** No bias.

---

## QUESTION 86: Industries CPQ vs Salesforce CPQ

**question_id:** QOR-SFCPQ-086
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** industries-cpq
**format:** MCQ
**difficulty_b:** 0.7 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Industries CPQ Documentation: developer.salesforce.com/docs/industries/cpq

**body:**

Which Salesforce CPQ variant should a Telecom customer choose?

**options:**

- A) Industries CPQ (Vlocity-heritage) — designed for Telecom / Communications / Media (CMT vertical); supports product specifications + commercial product hierarchy + multi-play bundles + service-order decomposition + multi-currency at scale; native to TM Forum SID standards
- B) Salesforce CPQ (Steelbrick-heritage) — works for any industry
- C) Both equally; pick whichever the team knows
- D) Neither — Telecom needs Oracle CPQ

**answer_key:**

A — Industries CPQ (formerly Vlocity Industries) is purpose-built for Telecom / Communications / Media. Specific features:
- TM Forum SID-aligned product information.
- Commercial Product Hierarchy + Product Specifications.
- Multi-play bundles (mobile + broadband + TV at one quote).
- Service-Order decomposition (one customer order → multiple network provisioning orders).
- Industries-specific OmniStudio (Integration Procedures, DataRaptor, OmniScript) for orchestration.

Salesforce CPQ (Steelbrick-heritage) is general-purpose; Telecom edge cases are awkward. (B), (C), (D) all wrong for Telecom. References: Salesforce Industries CPQ Implementation Guide §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-086-seed-2e8a4f1c
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-086
**bias_check_notes:** No bias.

---

## QUESTION 87: Revenue Cloud (Subscription Management)

**question_id:** QOR-SFCPQ-087
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** revenue-cloud
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Revenue Cloud Documentation: developer.salesforce.com/docs/revenue-cloud

**body:**

A SaaS customer with subscription products has separate quote / order / invoice / billing schedules. What's the Salesforce capability for end-to-end subscription lifecycle?

**options:**

- A) Revenue Cloud (subscription billing, revenue recognition, deferred revenue, dunning, ASC 606 compliance) — extension of Salesforce CPQ for the post-quote phases (orders, billing, revenue, asset management)
- B) Salesforce CPQ alone covers all of this
- C) Use a third-party billing tool (Zuora, Stripe Billing) — Salesforce CPQ doesn't billing
- D) Build custom Apex for billing schedules

**answer_key:**

A — Salesforce Revenue Cloud (rebranded from Salesforce Billing) extends CPQ into the subscription-revenue lifecycle. Includes:
- Subscription pricing (monthly / annual / multi-year).
- Invoice / billing schedules (one-time, recurring, milestone-based).
- Revenue recognition (ASC 606 compliant).
- Deferred revenue tracking.
- Dunning rules.
- Asset / Subscription record management.

(B) Salesforce CPQ stops at the Quote / Order; billing comes from Revenue Cloud. (C) is what customers do without Revenue Cloud knowledge — leads to integration overhead. (D) is over-engineering. References: Salesforce Revenue Cloud User Guide §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-087-seed-4d3a8c1f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-087
**bias_check_notes:** No bias.

---

## QUESTION 88: Custom Metadata Types

**question_id:** QOR-SFCPQ-088
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** custom-metadata-types
**format:** MCQ
**difficulty_b:** 0.6 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Custom Metadata Types Documentation: developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_custommetadatatypes.htm

**body:**

A constant table mapping currency codes to FX rates needs to be queryable from Apex without a SOQL hit. Custom Metadata Types or Custom Settings?

**options:**

- A) Custom Metadata Types — deployable via Change Sets / SFDX (records are part of metadata, like ApexClass), queryable via SOQL OR `[NameSpace__c]:[ApiName__mdt].getInstance(...)` (no SOQL governor cost!), supports Hierarchy + List variants, tested via `Test.loadData`
- B) Custom Settings — same thing, older syntax
- C) Apex code constants
- D) External objects

**answer_key:**

A — Custom Metadata Types are Salesforce's modern approach to deployable metadata + zero-SOQL access. Records are deployed as metadata (alongside Apex classes), so DEV → SIT → PROD via Change Sets / SFDX. Apex access via static `Currency__mdt.getInstance('USD')` — no SOQL governor cost. Supports hierarchy + list variants. Custom Settings (B) was the predecessor; its records were data not metadata, requiring separate deployment. (C) doesn't update without code change. (D) external objects are for live data from external systems. References: Salesforce Custom Metadata Types Reference §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-088-seed-1a7c4f8e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-088
**bias_check_notes:** No bias.

---

## QUESTION 89: Salesforce Connect (External Objects)

**question_id:** QOR-SFCPQ-089
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** salesforce-connect
**format:** MCQ
**difficulty_b:** 0.9 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Connect Documentation: developer.salesforce.com/docs/atlas.en-us.salesforce_connect.meta/salesforce_connect

**body:**

You need to display real-time inventory data from a SAP system inside Salesforce CPQ Quote pages without copying data. What's the canonical pattern?

**options:**

- A) Salesforce Connect — defines External Data Source (OData / REST endpoint to SAP); creates External Object that queries SAP live; appears alongside standard objects in UI; subject to OData query semantics (filterable / pageable per source schema)
- B) Hourly batch sync via OIC into a custom Salesforce object
- C) Apex callout per page render
- D) Manual data export from SAP into Excel into Salesforce

**answer_key:**

A — Salesforce Connect is the canonical "live external data" pattern. External Data Source pointing to SAP (OData v4 endpoint); External Objects defined for tables / views; Lightning Pages can render External Objects directly via Related Lists or list views; queries hit SAP live. (B) is good for static data but defeats real-time. (C) Apex callout per render is poor performance + not visible in standard UI patterns. (D) is the antipattern. References: Salesforce Connect Reference §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-089-seed-3e1c4a8f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-089
**bias_check_notes:** No bias.

---

## QUESTION 90: Platform Events vs CDC

**question_id:** QOR-SFCPQ-090
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** event-driven
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Event-Driven Documentation: developer.salesforce.com/docs/atlas.en-us.api_streaming.meta/api_streaming

**body:**

A backend system needs to react when any Quote moves to "Approved" status. Platform Events or CDC (Change Data Capture)?

**options:**

- A) **Platform Events** — purpose-built for explicit business events; high replay-window (3 days); fits "approved" semantics where you publish a domain event with the relevant payload from a Flow / Apex trigger. **CDC** captures all changes, useful for general data sync but noisier
- B) CDC — automatic + no setup
- C) Platform Events are deprecated; CDC replaces them
- D) REST polling

**answer_key:**

A — Platform Events are designed for explicit business events (enterprise event-driven architecture). The publisher emits a typed event (`QuoteApproved__e`) with a payload; subscribers react. Replay supports 3 days. CDC captures all DML changes; useful for data-replication scenarios but noisier and less semantic for "Quote approved" specifically. For "Quote approved" trigger:
- Apex / Flow detects the status transition.
- Publishes `QuoteApproved__e`.
- Backend system subscribes via CometD / EMP Connector or Pub/Sub API.
(B) CDC is automatic but noisy. (C) wrong — both supported. (D) polling is anti-pattern. References: Salesforce Event-Driven Architecture Reference §1.

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-090-seed-5a8f2c1e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-090
**bias_check_notes:** No bias.

---

## QUESTION 91: FlexQuote (Code)

**question_id:** QOR-SFCPQ-091
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** flex-quote
**format:** code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 15
**citation:** Salesforce CPQ FlexQuote Documentation

**body:**

Build a custom LWC `FlexQuoteLineEditor` allowing inline edit of QuoteLine `Quantity__c`, `Discount__c`, `NetTotal__c` (calculated). On every change, recalc NetTotal client-side; on Save, call CPQ Calculator via Apex to apply server-side pricing rules. Provide HTML + JS skeleton.

**answer_key:**

```javascript
// flexQuoteLineEditor.js
import { LightningElement, api, track, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import getQuoteLines from '@salesforce/apex/QuoteLineController.getQuoteLines';
import saveAndRecalculate from '@salesforce/apex/QuoteLineController.saveAndRecalculate';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

export default class FlexQuoteLineEditor extends LightningElement {
  @api recordId;             // Quote Id
  @track lines = [];
  isSaving = false;
  wiredLines;

  @wire(getQuoteLines, { quoteId: '$recordId' })
  wired(result) {
    this.wiredLines = result;
    if (result.data) {
      this.lines = result.data.map((l) => ({ ...l }));   // shallow clone for editing
    }
  }

  handleQuantityChange(event) {
    const id = event.target.dataset.id;
    const newQty = Number(event.target.value);
    this.lines = this.lines.map((l) =>
      l.Id === id ? { ...l, Quantity__c: newQty, NetTotal__c: this.calcNet(l, newQty, l.Discount__c) } : l
    );
  }

  handleDiscountChange(event) {
    const id = event.target.dataset.id;
    const newDisc = Number(event.target.value);
    this.lines = this.lines.map((l) =>
      l.Id === id ? { ...l, Discount__c: newDisc, NetTotal__c: this.calcNet(l, l.Quantity__c, newDisc) } : l
    );
  }

  calcNet(line, qty, disc) {
    const list = Number(line.ListPrice__c) || 0;
    return list * qty * (1 - (disc || 0) / 100);
  }

  async handleSave() {
    this.isSaving = true;
    try {
      const payload = this.lines.map((l) => ({
        Id: l.Id,
        Quantity__c: l.Quantity__c,
        Discount__c: l.Discount__c,
      }));
      await saveAndRecalculate({ quoteId: this.recordId, lines: payload });
      this.dispatchEvent(new ShowToastEvent({
        title: 'Saved',
        message: 'Quote recalculated successfully',
        variant: 'success',
      }));
      await refreshApex(this.wiredLines);   // force UI refresh
    } catch (err) {
      this.dispatchEvent(new ShowToastEvent({
        title: 'Save failed',
        message: err.body?.message || err.message || String(err),
        variant: 'error',
      }));
    } finally {
      this.isSaving = false;
    }
  }
}
```

```html
<!-- flexQuoteLineEditor.html -->
<template>
  <lightning-card title="Quote Lines" icon-name="utility:edit">
    <div class="slds-p-around_medium">
      <table class="slds-table slds-table_bordered slds-table_cell-buffer">
        <thead>
          <tr>
            <th>Product</th>
            <th>List Price</th>
            <th>Quantity</th>
            <th>Discount %</th>
            <th>Net Total</th>
          </tr>
        </thead>
        <tbody>
          <template for:each={lines} for:item="line">
            <tr key={line.Id}>
              <td>{line.SBQQ__ProductName__c}</td>
              <td>{line.ListPrice__c}</td>
              <td>
                <lightning-input type="number" min="1" value={line.Quantity__c}
                  data-id={line.Id} onchange={handleQuantityChange}>
                </lightning-input>
              </td>
              <td>
                <lightning-input type="number" min="0" max="100" value={line.Discount__c}
                  data-id={line.Id} onchange={handleDiscountChange}>
                </lightning-input>
              </td>
              <td>{line.NetTotal__c}</td>
            </tr>
          </template>
        </tbody>
      </table>
      <div class="slds-m-top_medium">
        <lightning-button label="Save & Recalculate" variant="brand"
          onclick={handleSave} disabled={isSaving}>
        </lightning-button>
      </div>
    </div>
  </lightning-card>
</template>
```

```apex
// QuoteLineController.cls
public with sharing class QuoteLineController {
  @AuraEnabled(cacheable=true)
  public static List<SBQQ__QuoteLine__c> getQuoteLines(Id quoteId) {
    return [SELECT Id, SBQQ__ProductName__c, ListPrice__c,
                   Quantity__c, Discount__c, NetTotal__c
              FROM SBQQ__QuoteLine__c
              WHERE SBQQ__Quote__c = :quoteId
              ORDER BY SBQQ__Number__c];
  }

  @AuraEnabled
  public static void saveAndRecalculate(Id quoteId, List<SBQQ__QuoteLine__c> lines) {
    update lines;
    SBQQ.QuoteAPI.calculate(quoteId);   // CPQ pricing pipeline
  }
}
```

Key elements:

1. Client-side preview calc; server-side recalc via SBQQ.QuoteAPI.calculate.
2. `refreshApex` to reload wired data.
3. Toast feedback on save success/failure.
4. Error-handling fallback to err.body.message.
5. `data-id` to identify the line in event handlers.

**rubric:** 5/4/3/2/1/0 by completeness — all elements present + Save flow + error handling = 5.

**watermark_seed:** qorium-sfcpq-v0.6-091-seed-3a8c1f4e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-091
**bias_check_notes:** No bias.

---

## QUESTION 92: Test Apex Method (Code)

**question_id:** QOR-SFCPQ-092
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** apex-testing
**format:** code
**difficulty_b:** 1.4 (Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 15
**citation:** Salesforce Apex Test Reference

**body:**

Write a test class `QuoteLineControllerTest` for the `getQuoteLines` and `saveAndRecalculate` methods from Q091. Use Test Data Factory pattern. Cover happy path + edge cases.

**answer_key:**

```apex
@isTest
public class QuoteLineControllerTest {

  @TestSetup
  static void setup() {
    // Create reusable test data
    Account acc = TestDataFactory.createAccount('Test Account');
    Opportunity opp = TestDataFactory.createOpportunity('Test Opp', acc.Id);
    SBQQ__Quote__c quote = TestDataFactory.createQuote(opp.Id);
    TestDataFactory.createQuoteLines(quote.Id, 3);  // 3 lines
  }

  @isTest
  static void testGetQuoteLines_returnsAllLinesForQuote() {
    SBQQ__Quote__c quote = [SELECT Id FROM SBQQ__Quote__c LIMIT 1];

    Test.startTest();
    List<SBQQ__QuoteLine__c> lines = QuoteLineController.getQuoteLines(quote.Id);
    Test.stopTest();

    System.assertEquals(3, lines.size(), 'Should return all 3 lines');
    for (SBQQ__QuoteLine__c line : lines) {
      System.assertNotEquals(null, line.Id);
    }
  }

  @isTest
  static void testGetQuoteLines_emptyQuote_returnsEmptyList() {
    Account acc = TestDataFactory.createAccount('Empty Account');
    Opportunity opp = TestDataFactory.createOpportunity('Empty Opp', acc.Id);
    SBQQ__Quote__c emptyQuote = TestDataFactory.createQuote(opp.Id);

    Test.startTest();
    List<SBQQ__QuoteLine__c> lines = QuoteLineController.getQuoteLines(emptyQuote.Id);
    Test.stopTest();

    System.assertEquals(0, lines.size(), 'Empty quote should return 0 lines');
  }

  @isTest
  static void testSaveAndRecalculate_updatesAndCallsCalculate() {
    SBQQ__Quote__c quote = [SELECT Id FROM SBQQ__Quote__c LIMIT 1];
    List<SBQQ__QuoteLine__c> lines = [SELECT Id, Quantity__c FROM SBQQ__QuoteLine__c
                                       WHERE SBQQ__Quote__c = :quote.Id];
    for (SBQQ__QuoteLine__c line : lines) {
      line.Quantity__c = 10;     // Update quantity
    }

    Test.startTest();
    QuoteLineController.saveAndRecalculate(quote.Id, lines);
    Test.stopTest();

    List<SBQQ__QuoteLine__c> updated = [SELECT Id, Quantity__c FROM SBQQ__QuoteLine__c
                                         WHERE SBQQ__Quote__c = :quote.Id];
    for (SBQQ__QuoteLine__c line : updated) {
      System.assertEquals(10, line.Quantity__c, 'Quantity should be updated to 10');
    }
  }

  @isTest
  static void testSaveAndRecalculate_invalidQuoteId_throwsException() {
    List<SBQQ__QuoteLine__c> emptyLines = new List<SBQQ__QuoteLine__c>();
    Id fakeQuoteId = Schema.SObjectType.SBQQ__Quote__c.getKeyPrefix() + '00000000000';

    try {
      QuoteLineController.saveAndRecalculate(fakeQuoteId, emptyLines);
      System.assert(false, 'Expected exception for invalid quote Id');
    } catch (Exception e) {
      System.assert(e != null, 'Exception thrown as expected');
    }
  }
}
```

**rubric:** 5/4/3/2/1/0 by completeness — happy + empty + update + error case + Test Data Factory usage + assertions.

**watermark_seed:** qorium-sfcpq-v0.6-092-seed-9c4a8f1e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-092
**bias_check_notes:** No bias.

---

## QUESTION 93: Field Audit Trail (Q&A)

**question_id:** QOR-SFCPQ-093
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** audit-trail
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce Field Audit Trail Documentation: developer.salesforce.com/docs/atlas.en-us.field_history.meta/field_history/field_audit_trail.htm

**body:**

A regulator requires 7-year retention of all changes to Quote.Status. Standard Field History only retains 18 months. What's the canonical Salesforce approach?

**options:**

- A) Enable **Field Audit Trail** (Shield Platform feature; subscription) — extends Field History retention up to 10 years; queryable via SOQL on `[Object]History` archives; SOC2-compliant
- B) Manually export Field History weekly to S3
- C) Custom Apex that copies Field History to a custom Big Object
- D) Salesforce can't retain field history beyond 18 months

**answer_key:**

A — Field Audit Trail (a Shield Platform add-on) extends standard Field History to up to 10 years retention. Backwards-compatible: queryable via SOQL on the same `[Object]History` archives. Auto-archives older history into long-term storage; queryable via Big Object-style queries. Subscription-based (per Salesforce SKU). (B) manual is fragile + audit-fail-prone. (C) custom Big Object works but reinvents Field Audit Trail; usually the right call only if Shield is too expensive. (D) wrong. References: Salesforce Field Audit Trail Reference §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-093-seed-2a8c4f1e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-093
**bias_check_notes:** No bias.

---

## QUESTION 94: Conga Composer Migration to Native CPQ Quote Templates

**question_id:** QOR-SFCPQ-094
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** conga-migration
**format:** MCQ
**difficulty_b:** 1.1 (Medium)
**discrimination_a:** 1.5
**expected_duration_minutes:** 5
**citation:** Salesforce CPQ Migration Best Practices

**body:**

A customer using Conga Composer for quote PDF generation wants to migrate to native CPQ Quote Templates to reduce licensing cost. What's the canonical migration path?

**options:**

- A) Audit existing Conga templates → identify simple ones that map 1-1 to native Quote Template features (sections, conditional fields) → migrate those first; complex multi-formatting templates may need custom Apex / LWC for rendering; phased cutover with parallel-running both systems for 4-6 weeks
- B) Bulk-replace Conga; CPQ templates handle everything Conga does
- C) Don't migrate — Conga is too feature-rich
- D) Use Conga underneath CPQ; CPQ calls Conga internally

**answer_key:**

A — Phased migration is canonical. Conga has more features (advanced merge fields, conditional formatting, multiple data sources) than native CPQ Quote Templates; not all 1-1. Approach:
1. Audit Conga templates: simple → CPQ Quote Template; complex → keep Conga or migrate to LWC custom rendering.
2. Phase: ~30-50% of templates typically migrate cleanly to native; 30-40% need LWC custom; 10-20% stay on Conga.
3. Parallel-run for 4-6 weeks per template; users compare; cutover.

(B) over-promises native capability. (C) gives up. (D) wrong architecture. References: Conga to CPQ Quote Template Migration Guide §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-094-seed-4d8a2c1f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-094
**bias_check_notes:** No bias.

---

## QUESTION 95: CRM Analytics (Tableau CRM)

**question_id:** QOR-SFCPQ-095
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** crm-analytics
**format:** MCQ
**difficulty_b:** 1.0 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Salesforce CRM Analytics (Tableau CRM) Documentation

**body:**

A Sales VP wants real-time CPQ analytics: discount trends, win-rate by tier, average quote-to-cash time. What's the canonical Salesforce tool?

**options:**

- A) Salesforce CRM Analytics (formerly Tableau CRM, formerly Einstein Analytics) — purpose-built for SaaS analytics on Salesforce data + external sources; supports DataPrep recipes, Dashboards, Einstein Discovery (predictive)
- B) Standard Salesforce Reports — sufficient for any analytics need
- C) Tableau Online external; export Salesforce data daily
- D) Heroku Postgres for ad-hoc queries

**answer_key:**

A — CRM Analytics is the Salesforce-native analytics platform. Strengths: live Salesforce data + external sources (Snowflake, BigQuery, etc.) via DataPrep recipes; rich dashboards + Einstein Discovery (auto-ML for prediction); Lightning App Builder integration to embed dashboards in CPQ pages. Standard Reports (B) are limited (row count, formula complexity, multiple-source joins). Tableau Online (C) is fine but standalone; CRM Analytics integrates better with Salesforce metadata + Lightning. (D) Heroku is for app dev not analytics. References: Salesforce CRM Analytics Reference §1.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-095-seed-3a9c1f4e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-095
**bias_check_notes:** No bias.

---

## QUESTION 96: Salesforce Sandbox Refresh Cadence

**question_id:** QOR-SFCPQ-096
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** sandbox-management
**format:** MCQ
**difficulty_b:** 0.8 (Medium)
**discrimination_a:** 1.4
**expected_duration_minutes:** 5
**citation:** Salesforce Sandbox Refresh Documentation

**body:**

What are the four Sandbox types in Salesforce, and what's typical refresh cadence?

**options:**

- A) **Developer** (200 MB, 1-day refresh), **Developer Pro** (1 GB, 1-day refresh), **Partial Copy** (5 GB + sample of prod data, 5-day refresh), **Full** (full prod data + storage, 29-day refresh); cadence is the minimum required between refreshes
- B) Only Sandbox + Production; no other types
- C) All sandboxes refresh daily; no minimum cadence
- D) Sandboxes are deprecated in Lightning Experience

**answer_key:**

A — Salesforce sandbox types + minimum refresh cadence:
- **Developer**: 200 MB storage, refresh every 1 day. For dev work.
- **Developer Pro**: 1 GB, refresh every 1 day. For larger dev work.
- **Partial Copy**: 5 GB + sample of production data, refresh every 5 days. For UAT.
- **Full**: full production data + storage, refresh every 29 days. For final UAT, training.

Cadence is the **minimum** required between refreshes — refreshing more frequently than allowed is blocked. (B), (C), (D) all wrong. References: Salesforce Sandbox Reference §Refresh Cadence.

**rubric:** MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-096-seed-7a4c1f8e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-096
**bias_check_notes:** No bias.

---

## QUESTION 97: CPQ Multi-Cloud Integration — Marketing Cloud (Design)

**question_id:** QOR-SFCPQ-097
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** multi-cloud-integration
**format:** design
**difficulty_b:** 1.6 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 18
**citation:** Salesforce Multi-Cloud Integration Best Practices

**body:**

A B2B SaaS company sends targeted email campaigns from Marketing Cloud based on Salesforce CPQ data: "your subscription expires in 30 days; renew with a 10% discount". Design the integration. Cover: data flow, identity resolution, opt-in / consent, deliverability, error handling. 400-600 words.

**answer_key:**

**Data flow:**

- **Source**: Salesforce Sales Cloud / CPQ — Quote / Subscription / Asset records.
- **Trigger**: Subscription Asset has `End_Date__c` 30 days out.
- **Path**: Salesforce Flow → Marketing Cloud Connect API → Marketing Cloud Campaign.
- **Payload**: Account email + first name + product + days-to-renewal + dynamic discount.

**Identity resolution:**

- Marketing Cloud Contact Key = Salesforce Account Id (or Opportunity Contact email; depends on B2B vs B2C).
- Marketing Cloud Email Address from Salesforce Account.PrimaryContact.Email.
- Use Marketing Cloud Connect (managed package) for identity sync.

**Opt-in / consent:**

- Honour Subscriber's preference: if `EmailSubscription__c = false` on Account, do NOT send.
- Marketing Cloud preference center handles opt-out; sync back to Salesforce on unsub.
- Honour CASL (Canada), CAN-SPAM (US), GDPR (EU), DPDPA (India) — explicit consent records on Account; campaign blocks if consent is missing.

**Deliverability:**

- Send via Marketing Cloud's IP pool (managed reputation).
- Monitor bounce rate < 5%, complaint rate < 0.1%.
- Subject line A/B test (3 variants).
- Throttle: 10K emails/hour per IP to prevent spam-flag.

**Error handling:**

- Bounce: hard bounces → Account.Email_Status__c = 'Invalid'; suppress future sends.
- Soft bounce: 3 retries; if all fail → mark as Invalid.
- Click → Salesforce Custom Object `Email_Engagement__c` updated via Marketing Cloud Audience Studio.
- Open rate signal feeds into Lead Scoring + Renewal probability model.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Spam-flag damage to domain reputation | Throttling; preference center; hard-bounce handling |
| Wrong customer receives renewal pitch | Consent-check Flow gates before send; monthly audit of opt-in vs sends |
| Marketing Cloud → Salesforce sync gap | Daily reconciliation; named on-call |
| Opt-out request lost | Marketing Cloud preference center + 24h sync to Salesforce |

**rubric:** 5/4/3/2/1/0 by completeness — all 5 dimensions covered with specific tactics.

**watermark_seed:** qorium-sfcpq-v0.6-097-seed-4a8e1c3d
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-097
**bias_check_notes:** No bias.

---

## QUESTION 98: CPQ + Service Cloud Integration (Design)

**question_id:** QOR-SFCPQ-098
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** multi-cloud-integration
**format:** design
**difficulty_b:** 1.7 (Hard)
**discrimination_a:** 1.6
**expected_duration_minutes:** 20
**citation:** Salesforce CPQ + Service Cloud Integration Best Practices

**body:**

A SaaS provider's customer support team works in Service Cloud. Customer support reps need to view active subscriptions + recent quotes when handling customer cases. Design the cross-cloud integration. Cover: data visibility, Service Cloud Console layout, cross-cloud account access, cross-cloud automation triggers, Service-to-CPQ feedback loops. 400-600 words.

**answer_key:**

**Data visibility:**

- Service Reps see Account → related Opportunities → related Quotes → related Subscriptions / Assets in the standard Account hierarchy.
- Lightning Page customisation in Service Cloud Console: add Quote/Subscription/Asset Related Lists to the Account view.
- Permission: Service Reps need Read access on SBQQ__Quote__c, SBQQ__Subscription__c, Asset (set via Permission Set).

**Service Cloud Console layout:**

- Service Console = lightning experience with Tab Workspaces.
- Custom Lightning Page for "Service Account View":
  - Tabs: Cases (default), Quotes, Subscriptions, Activities, Notes.
  - Quotes tab: list of recent (90 days) quotes with status + value.
  - Subscriptions tab: active subs with end dates + renewal status.
  - Right-pane: Asset hierarchy (Asset → Subscription → Quote line lineage).

**Cross-cloud account access:**

- Account is the integration boundary. Service Rep sees the Account; CPQ records hang from it.
- Sharing: Account is owned by Sales Owner; Service Rep gets Read via Sharing Rule (Account Owner Role + Service Rep Role).
- Quote / Subscription inherit Account sharing.

**Cross-cloud automation triggers:**

- Case opened on a Subscription → auto-add to Subscription's `Open_Cases__c` count.
- Subscription cancelled → automatically open a "Win-Back" Case for Customer Success Manager.
- Quote signed → auto-create a "Welcome" Case for onboarding team.

**Service-to-CPQ feedback loops:**

- Customer satisfaction score (CSAT) on Cases → aggregated to Account → flows back into Renewal Probability scoring.
- High Case volume on a Subscription → auto-flag the renewal as "At Risk" → Account Manager notified; potentially apply retention discount.
- Service Rep can request a discount on the customer's next renewal via a custom Case action that creates a Quote Discount Request → routed to Sales Manager approval.

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Service Rep accesses sensitive comp / discount data | FLS on sensitive fields; Permission Set scope |
| Cross-cloud sync lag | Daily reconciliation; Salesforce native sharing means real-time |
| Automation creates duplicate Cases | Idempotency keys (Case External Id); pre-creation lookup |
| Service Rep wants Quote-write access (over-grant) | Strict RBAC; Discount Request as escalation path |

**rubric:** 5/4/3/2/1/0 by completeness — all 5 dimensions; specific tactics; risks.

**watermark_seed:** qorium-sfcpq-v0.6-098-seed-1c4a8f3e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-098
**bias_check_notes:** No bias.

---

## QUESTION 99: 18-Month CPQ Modernisation — Steelbrick to Industries CPQ (Case Study)

**question_id:** QOR-SFCPQ-099
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** cpq-modernisation
**format:** casestudy
**difficulty_b:** 2.1 (Very Hard)
**discrimination_a:** 1.8
**expected_duration_minutes:** 30
**citation:** Salesforce CPQ Modernisation Best Practices

**body:**

**Scenario:** An Indian Telecom (₹15K Cr revenue, 80M subscribers, 500 Salesforce users) is on Salesforce CPQ (Steelbrick-heritage) for B2B sales. They want to migrate to **Industries CPQ** (Vlocity-heritage) over 18 months because Industries CPQ better fits their Telecom needs (multi-play bundles, network provisioning decomposition, TM Forum SID compliance).

Existing landscape: 8,000 SKUs in Salesforce CPQ; 200 Price Rules; 80 Product Rules; 50 custom Quote Templates; bespoke QCP for India-specific tier discount. Quotes / Orders / Subscriptions in current model.

Design the 18-month plan. Cover: (a) migration approach (greenfield vs refactor), (b) coexistence during migration, (c) data migration (8K SKUs, historical quotes), (d) team reskilling, (e) Telecom-specific integrations (provisioning, billing), (f) rollback. 600-900 words.

**answer_key:**

**Migration approach:**

Greenfield Industries CPQ org alongside existing Steelbrick CPQ. Reasons:
- Industries CPQ has different data model (Product Specifications, OmniStudio, etc.); refactor in-place too risky.
- Greenfield lets the team learn Industries CPQ properly without legacy weight.
- Coexistence for the migration window (12-18 months); cutover by line-of-business.

**Phase 1 (Months 1-6) — Foundation + Pilot:**

- Provision Industries CPQ org (Industries Edition).
- Train 5 senior architects on Industries CPQ + OmniStudio.
- Pilot: 1 product line (e.g., Enterprise Mobile) with ~500 SKUs (subset of 8K).
- Map TM Forum SID concepts to product model.
- Migrate ~5 simple Steelbrick Quote Templates to Industries CPQ Document Templates.
- Ship pilot to 50 reps in 1 region; parallel-run vs Steelbrick for 4-6 weeks.

**Phase 2 (Months 7-12) — Scale + Provisioning:**

- Migrate 3,000 more SKUs (multi-play Bundle products).
- Configure Service Order Decomposition: customer order → provisioning orders to network/billing systems.
- Integrate with downstream OSS / BSS (provisioning network elements; billing).
- Migrate Price Rules + Product Rules to Industries CPQ Pricing + Product Validation.
- Migrate QCP custom code to OmniStudio Integration Procedures + DataRaptor.
- Expand to 200 reps across 3 product lines.

**Phase 3 (Months 13-18) — Final Migration + Cutover:**

- Migrate remaining 4,500 SKUs.
- Migrate remaining 50 Quote Templates.
- Historical quotes: read-only archive in Steelbrick; new quotes only in Industries CPQ from cutover date.
- Subscription / Asset migration: complex — 80M subscribers' subscriptions need migration. Strategy: (1) all NEW subscriptions in Industries CPQ from cutover; (2) existing Steelbrick subscriptions stay in Steelbrick until renewal (then re-quoted in Industries CPQ); (3) read-only Steelbrick data accessible via cross-cloud lookups.
- Steelbrick license retirement at month 18.

**Coexistence during migration:**

- 12 months of dual-running: Steelbrick = source-of-truth for existing quotes / subscriptions; Industries CPQ for new quotes + new product lines.
- Cross-system identity: Account = same in both; quotes have a flag indicating which system.
- Sales rep training: both systems for 6 months; Industries-only thereafter.

**Data migration:**

- **8K SKUs**: scripted via Bulk API + DataRaptor mappings; product hierarchy explicitly modelled in Industries CPQ.
- **Historical quotes**: read-only archive; not migrated (cost vs value low).
- **Active subscriptions**: NOT migrated en-masse; migrated lazily on renewal.

**Team reskilling:**

- Architects: 6-week Industries CPQ + OmniStudio bootcamp.
- Developers: 4-week training on OmniStudio + Industries pricing / product rules.
- Reps: 1-week training on the new UX; mentor program.
- Tier 1 power users: train-the-trainer; cohort onboarding for the 500 reps over 6 months.

**Telecom-specific integrations:**

- Provisioning: Order → OSS via Integration Procedures (replace Conga / OIC integrations from Steelbrick world).
- Billing: Order → BSS via DataRaptor.
- Network inventory: Real-time check via External Object pattern.
- TM Forum compliance: validated by independent third-party.

**Rollback:**

- Steelbrick stays warm for 6 months post-cutover.
- Per-product-line rollback: feasible up to 4 weeks post-cutover; after that, full rollback impractical.
- Data rollback: any new Industries CPQ quotes → manual replay in Steelbrick.

**Success metrics:**

- All 8K SKUs in Industries CPQ by month 18.
- TM Forum SID compliance certification.
- Quote-creation time: Steelbrick baseline → -30% in Industries CPQ.
- Service Order Decomposition automated (was manual in Steelbrick).
- Steelbrick licenses retired.

**Risks:**

| Risk | Mitigation |
|---|---|
| Industries CPQ learning curve | Architect-first training; outside-firm partnership |
| Data migration breaks | Greenfield approach; phased per-product-line cutover |
| Rep adoption stalls | Power-user mentorship; CEO town hall |
| Provisioning integration fails | OIC-style retry queue; reconciliation reports |
| TM Forum compliance gaps | Third-party audit at month 12 |

**rubric:** 5/4/3/2/1/0 — multi-quarter sequence; coexistence design; data migration triage; reskilling; integrations; rollback; risks.

**watermark_seed:** qorium-sfcpq-v0.6-099-seed-9c2a4f1e
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-099
**bias_check_notes:** Indian Telecom + global Industries CPQ scenario; rubric distributes points.

---

## QUESTION 100: SaaS CPQ — Sustainability + Continuous Improvement (Case Study)

**question_id:** QOR-SFCPQ-100
**skill_id:** senior-salesforce-cpq
**sub_skill_id:** post-go-live-operations
**format:** casestudy
**difficulty_b:** 2.0 (Very Hard)
**discrimination_a:** 1.7
**expected_duration_minutes:** 25
**citation:** Salesforce CPQ Operational Excellence Documentation

**body:**

**Scenario:** Your customer is 12 months past Salesforce CPQ go-live (200 reps, 5 products, ~1,500 quotes/month). They report: discount approvals are slow (3-day average vs target 1 day), reps complain about UI clutter, monthly close takes 3 days (target 1 day), Conga PDF generation occasionally fails, occasional "Calculate timeout" errors at month-end.

Design a 6-month operational excellence + continuous improvement program. Cover: approval workflow, UX simplification, month-end close optimisation, Conga reliability, performance tuning, KPI dashboards. 500-700 words.

**answer_key:**

**1. Approval workflow optimisation:**

- Audit current Approval Process: ~3-day SLA = 4-step approval (rep → SM → VP → CFO). Likely too long.
- Optimisations:
  - Reduce steps: 80% of quotes can auto-approve up to 15% discount (skip SM); 90% can auto-approve up to 25% (skip VP); reserve CFO for >40%.
  - Mobile approval: enable Salesforce Mobile + push notifications.
  - Approver delegate: when SM is OOO, auto-route to backup.
  - Async approval: Slack notifications + 1-click approve from Slack.

Target: average 1 day; 95th percentile 2 days.

**2. UX simplification:**

- Audit Quote page for clutter: typical org has 30+ fields, 10+ Related Lists. Reduce to 12-15 essential fields per persona.
- Use Lightning App Builder + Conditional Visibility to show fields per role / status.
- Quick Action menu: "Send for Signature", "Generate Document", "Apply Standard Discount" — 1-click instead of multi-screen flows.
- Remove deprecated fields no one uses (audit via FieldUsageReport).

**3. Month-end close optimisation:**

- 3-day close usually means: (a) rep rush at month-end, (b) Calculate timeouts on bulky quotes, (c) approval bottlenecks, (d) reconciliation manual.
- Solutions:
  - Pre-month-end window: "Quote Quality Gate" — flag quotes needing rep attention 5 days before close.
  - Calculate optimisation: Price Rule consolidation (per Q079 Sprint 2.2 sister problem).
  - Async Calculate for >100-line quotes during month-end.
  - Auto-reconciliation reports (vs current manual): nightly during close week.

Target: month-end close in 1 day.

**4. Conga reliability:**

- Conga PDF failures: typically network timeout or template error.
- Fix: Add retry logic in the Conga callout (3 attempts, exponential backoff).
- Monitor Conga error rate weekly via Salesforce Logger / Apex Exception emails.
- Migration option: native CPQ Quote Template (Q094) for simple PDFs; Conga reserved for complex ones.

**5. Performance tuning:**

- "Calculate timeout" usually = too many Price Rules OR slow QCP.
- Profile: Salesforce CPQ debug logs.
- Consolidate Price Rules.
- Optimise QCP (batch external calls; cache repeated lookups).
- Async Calculate option enabled for large quotes.

Target: median Calculate ≤5s for ≤50-line quotes; ≤15s for ≤100-line.

**6. KPI dashboards:**

Operational dashboard updated weekly:
- Average approval-to-decision time (target 1 day).
- Month-end close duration (target 1 day).
- Calculate p95 latency (target ≤15s for normal quotes).
- Conga PDF success rate (target ≥99%).
- User-reported issue count (helpdesk volume).
- Quote quality score (Quote completeness check).

**Risk + mitigation:**

| Risk | Mitigation |
|---|---|
| Skip SM approval too aggressive | Pilot with 1 region first; A/B test |
| UX changes anger users | Power-user feedback before rollout; gradual rollout |
| Async Calculate confuses reps | Comms + training; status indicator in UI |
| Conga vendor issues | Retry + escalation contract |
| Performance regression after Price Rule consolidation | Regression test pack; rollback plan |

**Outputs by month 6:**

- Approval SLA: 3 days → 1 day.
- Month-end close: 3 days → 1 day.
- Calculate p95: TBD → ≤15s.
- Conga success: TBD → ≥99%.
- User satisfaction (NPS): +20 points.

**rubric:** 5/4/3/2/1/0 — all 6 dimensions; specific KPI targets; risks per dimension.

**watermark_seed:** qorium-sfcpq-v0.6-100-seed-7e4a1c3f
**variant_seed:** qorium-sfcpq-v0.6-2026-05-07-100
**bias_check_notes:** No bias. Operational excellence pattern.

---

## End of Wave 2 Salesforce CPQ Extension 081–100 — CPQ 100/100 ✅

**Set status:** 20/20 v0.6 complete. **CPQ target reached: 100/100.** SME Lead validation pending.

**Total Wave-2 Salesforce CPQ authored: 100/100. ✅**
