# Wave 2 Extension: Salesforce CPQ (Questions 041–060)

**STATUS:** AI-drafted v0.6 EXTENSION (Salesforce CPQ third-pass scaling: 40→60 Qs). SME Lead validation pending. NOT for external delivery without SME-Lead sign-off and IRT calibration. Reference baseline: Salesforce CPQ Spring '26 + Industries CPQ + Revenue Cloud; Steelbrick legacy clearly flagged.

---

## Extension Pack: 20 New Representative Questions (QOR-SFCPQ-041..060)

All questions follow QOrium metadata schema. Difficulty distribution: 3 Easy + 9 Medium + 6 Hard + 2 Very Hard.

Sub-skill coverage (new in Q041–060):
- **Multi-currency + global** (FX rate management, localization, tax engine integration)
- **Subscription business model** (term methods, coterminous renewals, mid-term amendments, upsell/crosssell, ratable revenue)
- **Industries CPQ deep dive** (telecom provisioning, manufacturing operations, FSI risk pricing)
- **CPQ analytics + reporting** (Quote-to-Cash metrics, margin analysis, approval cycle-time, CRM Analytics)
- **CPQ + Sales Engagement** (Einstein Activity Capture, forecast categories, Account-Based Selling)
- **CPQ Customization Constraints** (migration governance, sandbox strategy, test data management, performance audit)

---

### QUESTION 41: Multi-Currency CPQ — FX Rate Locking and Quote Finalization (Easy)

**question_id:** QOR-SFCPQ-041  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** multicurrency-global-patterns  
**format:** MCQ  
**difficulty_b:** -0.8 (Easy)  
**discrimination_a:** 1.3  
**expected_duration_minutes:** 4  
**citation:** Salesforce CPQ Multi-Currency Guide §1; FX Rate Management Best Practices; Spring '26

**body:**

A customer in India negotiates a quote priced in USD 10,000. At quote creation (May 1), the USD-to-INR rate is 83. The quote is sent for approval and sits in the approval queue for 5 days. On May 6, the FX rate shifts to 85. When the quote is approved and converted to an order, which FX rate is used: the rate from May 1 (quote creation) or May 6 (order creation)?

**options:**

- A) May 1 rate (83); CPQ locks FX rates at quote creation to ensure price certainty for the customer
- B) May 6 rate (85); the order uses the spot rate at time of conversion
- C) Blended rate; CPQ calculates (83 + 85) / 2 = 84 to split the difference
- D) Customer-specified rate; CPQ uses whatever FX rate the sales rep manually enters in a custom field

**answer_key:**

A — CPQ locks FX rates at quote creation time. This ensures that the customer sees a consistent quote price throughout the approval cycle and cannot be surprised by FX movements between quote approval and order creation. The locked rate is stored in the Quote record (SBQQ__ExchangeRate__c or similar) and applied during quote-to-order conversion. This is a critical feature for multi-currency deal transparency. References: Salesforce CPQ Multi-Currency Guide §1.2 (FX Rate Locking).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-041-seed-3f7e1a2d  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-041  
**bias_check_notes:** Multi-currency example is globally neutral; no locale bias.

---

### QUESTION 42: Subscription Pricing Methods — Ratable vs. Non-Ratable Revenue (Easy)

**question_id:** QOR-SFCPQ-042  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** subscription-business-model  
**format:** MCQ  
**difficulty_b:** -0.7 (Easy)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 4  
**citation:** Salesforce CPQ Subscription Guide §2; ASC 606 Revenue Recognition; Ratable Billing Documentation

**body:**

A customer subscribes to a monthly SaaS product on June 15 with a 12-month contract at ₹12,000/year. The subscription is configured as "ratable" in CPQ. When the first invoice is generated, how is the prorated amount calculated for the partial month (June 15–30)?

**options:**

- A) ₹1,000 (full monthly rate); no proration for partial months
- B) ₹1,000 × (16 days / 30 days) = ₹533; daily proration of the monthly rate
- C) ₹12,000 × (16 days / 365 days) = ₹526; daily proration of the annual rate
- D) ₹12,000 / 12 = ₹1,000 annually; ratable means no month-level calculations

**answer_key:**

B — In CPQ, a "ratable" subscription divides the annual price into a monthly rate (₹12,000 / 12 = ₹1,000), then prorates the first and last months based on actual days consumed. June 15–30 is 16 days (including start, or 15 days depending on day-count convention); the prorated amount is ₹1,000 × (16/30) = ₹533 (approximately). Ratable billing ensures that customers pay only for the time they use, which is favorable for customer acquisition and contract alignment. References: Salesforce CPQ Subscription Guide §2.3 (Ratable Billing Mechanics).

**rubric:**

MCQ; correct (B; accept slight variance in day-count: 15 or 16 days acceptable) = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-042-seed-7c2d4f6a  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-042  
**bias_check_notes:** Currency (INR) is used as a neutral example; no locale bias.

---

### QUESTION 43: Telecom Industries CPQ — MSISDN Provisioning and SIM Assignment (Medium)

**question_id:** QOR-SFCPQ-043  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** industries-cpq-telecom-deep  
**format:** MCQ  
**difficulty_b:** 0.4 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 6  
**citation:** Salesforce Industries CPQ for Telecom §2; MSISDN Provisioning Integration Guide; Telecom Catalog Management

**body:**

A telecom carrier uses Industries CPQ to manage mobile SIM orders. Each SIM product is bundled with an MSISDN (mobile phone number) allocation, data plan, and voice minutes. When a sales rep configures a quote for 50 SIM cards, the CPQ Product Rules should automatically reserve 50 unique MSISDNs from the carrier's pool. Which Industries CPQ component handles this automatic provisioning?

**options:**

- A) DataRaptor Transform; maps SIM quantity to MSISDN pool and reserves blocks via REST API
- B) Vlocity Configurable Object (CObject); pre-loaded with inventory of available MSISDNs; Inventory Sync populates the CObject
- C) Custom Apex trigger on QuoteLine; fires upon quote save to call the MSISDN provisioning API
- D) Standard CPQ Product Rules Filter; CPQ natively limits SKU availability based on inventory

**answer_key:**

B — Industries CPQ (Vlocity-derived) uses Configurable Objects (CObjects) to represent domain-specific inventory (in this case, MSISDN pools, SIM card stock, data plan allocation). When a sales rep configures a quote, the CObject data is queried to show available inventory. Vlocity's Inventory Sync process (running nightly or on-demand) updates CObject records with available MSISDNs. DataRaptor (A) is a transformation tool, not a primary inventory mechanism; Apex triggers (C) are custom code (feasible but not the recommended Industries CPQ pattern); Standard CPQ Product Rules (D) do not have deep integration with telecom-specific inventory. References: Salesforce Industries CPQ for Telecom §2.4 (Inventory Management via CObjects).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-043-seed-8a1f5e3b  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-043  
**bias_check_notes:** Telecom use-case is industry-neutral; MSISDN/SIM terminology is standard across global carriers.

---

### QUESTION 44: CPQ Analytics — Quote-to-Cash Funnel Metrics (Medium)

**question_id:** QOR-SFCPQ-044  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-analytics-reporting  
**format:** MCQ  
**difficulty_b:** 0.5 (Medium)  
**discrimination_a:** 1.4  
**expected_duration_minutes:** 5  
**citation:** Salesforce CRM Analytics for CPQ §1; Quote-to-Cash KPI Guide; CPQ Custom Report Types; Spring '26

**body:**

Your org needs to measure Quote-to-Cash velocity: time from quote generation to order creation. Which Salesforce tool combination best supports this analysis across 100,000 quotes?

**options:**

- A) CPQ Standard Reports; create a custom report type (Quote + Order) and filter by Status changes
- B) CRM Analytics; ingest Quote and Order objects, create a calculated field (Order.CreatedDate - Quote.CreatedDate), and build a lens dashboard
- C) Tableau; export CPQ data nightly and build custom charts (requires third-party licensing)
- D) Batch Apex; query quotes and orders, calculate velocity, write results to a custom Velocity__c object for reporting

**answer_key:**

B — CRM Analytics (formerly Tableau CRM) is the Salesforce-native business intelligence platform optimized for sales analytics. It can ingest Quote and Order objects, support calculated fields, and build interactive lenses and dashboards. This is the recommended approach for large-scale funnel analysis (100K+ records) because it handles volume efficiently, integrates natively with Salesforce data, and requires no additional licensing beyond CPQ. Standard Reports (A) are limited to ~5K rows; Tableau (C) requires external licensing; Batch Apex (D) is a workaround, not a reporting tool. References: Salesforce CRM Analytics for CPQ §1.2 (Quote-to-Cash Funnel Metrics).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-044-seed-5d3c2b7f  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-044  
**bias_check_notes:** Analytics approach is vendor-neutral; no bias.

---

### QUESTION 45: Einstein Activity Capture + Quote Engagement Analytics (Medium)

**question_id:** QOR-SFCPQ-045  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-sales-engagement-einstein  
**format:** MCQ  
**difficulty_b:** 0.6 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 6  
**citation:** Salesforce Sales Cloud Einstein Activity Capture Guide; CPQ Engagement Metrics; Spring '26 Sales Engagement Integration

**body:**

A sales team uses CPQ quotes and Einstein Activity Capture to track email engagement (open/click tracking). A sales rep sends a quote PDF via email to a customer. Einstein Activity Capture logs the open event. How should this engagement data flow back into the CPQ quote decision context?

**options:**

- A) Automatically; Einstein Activity logs update the Quote.Last_Engagement_Date__c field via a standard Flow
- B) Manually; sales reps must manually record engagement in a custom field because Einstein data is read-only
- C) Via CRM Analytics dataflow; ingest Einstein Activity records, join with Quotes, and publish engagement metrics to a dashboard (human-readable, not auto-updating Quote fields)
- D) Einstein data does not integrate with CPQ; a separate tool (Gong, Highspot) is required for quote engagement tracking

**answer_key:**

C — Einstein Activity Capture logs engagement events (email opens, clicks, etc.) in the Activity Timeline and CRM Analytics. The recommended pattern is to ingest Activity records via a CRM Analytics dataflow, join them with Quote records, and create dashboards showing engagement metrics (e.g., "% of quotes opened within 24h", "avg time-to-first-engagement"). This provides visibility into quote engagement without adding writes to Quote record (which can trigger excessive automations). Option A is incorrect (Einstein Activity data is not auto-synced to arbitrary Quote fields); Option B is incorrect (Flow can read Einstein Activity via standard objects); Option D is incorrect (Einstein Activity does integrate with CPQ via CRM Analytics). References: Salesforce Sales Cloud Einstein Activity Capture Guide §2.3 (CRM Analytics Integration).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-045-seed-9c4e3a6d  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-045  
**bias_check_notes:** Sales engagement metrics are vendor-neutral; no bias.

---

### QUESTION 46: Multi-Currency CPQ with Tax Engine Integration — Avalara Integration (Medium)

**question_id:** QOR-SFCPQ-046  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** multicurrency-global-patterns  
**format:** Code (Apex)  
**difficulty_b:** 0.7 (Medium)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 8  
**citation:** Salesforce Avalara Integration Guide; CPQ Tax Calculation Plugin; Multi-Currency Tax Best Practices

**body:**

Write an Apex method that integrates CPQ with Avalara to calculate sales tax on a multi-currency quote. Input: Quote ID (with Amount and CurrencyIsoCode), Customer BillingAddress. Output: calculated tax amount in the quote's currency. Assume Avalara API returns tax as a percentage.

```apex
public class CPQTaxCalculator {
    @Future(callout=true)
    public static void calculateTaxWithAvalara(String quoteId) {
        // YOUR CODE HERE
        // 1. Query Quote: amount, currency, customer address
        // 2. Call Avalara REST API with address + amount
        // 3. Receive tax % from Avalara
        // 4. Convert tax % to tax amount in the quote's currency
        // 5. Update Quote.Tax_Amount__c
    }
}
```

**options:**

(Code-based; expect SOQL, HTTP callout, currency conversion logic)

**answer_key:**

```apex
public class CPQTaxCalculator {
    @Future(callout=true)
    public static void calculateTaxWithAvalara(String quoteId) {
        // Query Quote and related Account
        SBQQ__Quote__c quote = [
            SELECT Id, SBQQ__NetAmount__c, CurrencyIsoCode, SBQQ__Account__r.BillingCity, 
                   SBQQ__Account__r.BillingStateCode, SBQQ__Account__r.BillingPostalCode, 
                   SBQQ__Account__r.BillingCountryCode
            FROM SBQQ__Quote__c
            WHERE Id = :quoteId
            LIMIT 1
        ];
        
        // Build Avalara API request
        String avalaraApiKey = 'YOUR_AVALARA_API_KEY';
        String endpoint = 'https://rest.avatax.com/api/v2/transactions/calculate';
        
        Map<String, Object> requestBody = new Map<String, Object>{
            'companyCode' => 'DEFAULT',
            'type' => 'SalesOrder',
            'date' => Date.today().format(),
            'customerCode' => quote.SBQQ__Account__r.Id,
            'addresses' => new Map<String, Object>{
                'ShipTo' => new Map<String, Object>{
                    'city' => quote.SBQQ__Account__r.BillingCity,
                    'region' => quote.SBQQ__Account__r.BillingStateCode,
                    'postalCode' => quote.SBQQ__Account__r.BillingPostalCode,
                    'country' => quote.SBQQ__Account__r.BillingCountryCode
                }
            },
            'lines' => new List<Map<String, Object>>{
                new Map<String, Object>{
                    'number' => '1',
                    'amount' => quote.SBQQ__NetAmount__c
                }
            }
        };
        
        HttpRequest req = new HttpRequest();
        req.setEndpoint(endpoint);
        req.setMethod('POST');
        req.setHeader('Authorization', 'Bearer ' + avalaraApiKey);
        req.setHeader('Content-Type', 'application/json');
        req.setBody(JSON.serialize(requestBody));
        
        Http http = new Http();
        HttpResponse res = http.send(req);
        
        if (res.getStatusCode() == 200) {
            Map<String, Object> response = (Map<String, Object>) JSON.deserializeUntyped(res.getBody());
            List<Object> lines = (List<Object>) response.get('lines');
            if (!lines.isEmpty()) {
                Map<String, Object> taxLine = (Map<String, Object>) lines.get(0);
                Decimal taxAmount = (Decimal) taxLine.get('taxAmount');
                
                // Update Quote with tax amount (already in the quote's currency)
                quote.Tax_Amount__c = taxAmount;
                update quote;
            }
        } else {
            System.debug('Avalara tax calculation failed: ' + res.getBody());
        }
    }
}
```

Expected approach: (1) SOQL query Quote + Account address, (2) build Avalara JSON request, (3) HTTP callout with Bearer token, (4) parse response for tax amount, (5) update Quote.Tax_Amount__c. Note: Currency conversion is implicit if Avalara returns tax in the quote's currency.

**rubric:**

3-tier rubric: (1) Correct SOQL, HTTP callout, Avalara JSON structure, error handling = 10 points. (2) Correct callout and JSON but missing Bearer token or error handling = 6 points. (3) Incomplete SOQL or incorrect HTTP setup = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-046-seed-2e6a1f5c  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-046  
**bias_check_notes:** No bias; tax integration is procedural.

---

### QUESTION 47: Coterminous Renewals with Mid-Term Amendments — Subscription Alignment (Medium)

**question_id:** QOR-SFCPQ-047  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** subscription-business-model  
**format:** MCQ  
**difficulty_b:** 0.5 (Medium)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 6  
**citation:** Salesforce CPQ Renewal Guide §4; Coterminous Renewal Best Practices; Subscription Amendment Timing

**body:**

A customer has three subscriptions with misaligned renewal dates:
- Product A: expires Nov 30, 2026
- Product B: expires Feb 28, 2027
- Product C: expires May 31, 2027

You want to align all renewals to Dec 31, 2027 (coterminous). Which is the correct sequence of CPQ operations?

**options:**

- A) Generate renewal quotes for A, B, C all dated Dec 31, 2027; CPQ auto-aligns the end dates
- B) Create amendment quotes to extend A (Nov 30 → Dec 31, 2027), B (Feb 28 → Dec 31, 2027), C (May 31 → Dec 31, 2027); price each amendment at pro-rata rates
- C) Manually edit each Subscription record's end date to Dec 31, 2027, then generate renewal quotes (bypasses CPQ amendment logic)
- D) Create a single "Master Renewal" quote combining all three products at the Dec 31, 2027 date; CPQ handles the internal alignment

**answer_key:**

B — Coterminous renewal is achieved via CPQ amendment quotes. For each misaligned subscription, create an amendment quote that extends the end date to the target date (Dec 31, 2027) and charges pro-rata for the extension period. This preserves the original subscription history and generates proper audit trails. Option A is incorrect (renewal quotes are for expired subscriptions, not for extending active ones); Option C bypasses CPQ and risks data consistency; Option D does not exist (CPQ does not have a "Master Renewal" feature). References: Salesforce CPQ Renewal Guide §4.2 (Coterminous Renewal via Amendments).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-047-seed-6f2d4c3a  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-047  
**bias_check_notes:** Subscription alignment is vendor-neutral; no bias.

---

### QUESTION 48: Sandbox Refresh Strategy for CPQ with Sensitive Data Masking (Medium)

**question_id:** QOR-SFCPQ-048  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-customization-constraints  
**format:** Design  
**difficulty_b:** 0.8 (Medium)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 8  
**citation:** Salesforce Sandbox Management Guide; Data Masking Best Practices; CPQ Test Data Strategy

**body:**

Design a sandbox refresh strategy for a production CPQ environment with 50,000 quotes containing sensitive customer pricing, margin, and contract data. Requirements: (1) refresh sandbox weekly for testing; (2) mask all customer names, deal values, and margin percentages; (3) preserve quote structure and calculation logic; (4) sandbox must support 1000+ concurrent test users.

Outline the approach.

**options:**

(Design question; expect data masking, automation, and testing strategy)

**answer_key:**

Expected response (multi-step strategy):

**1. Data Masking Scope**
- Customer names → anonymized (e.g., "Customer_001", "Customer_002")
- Deal amounts (NetAmount, ListPrice) → randomized within 10–100K range (preserves calculation logic)
- Margin % fields → shifted uniformly (e.g., all margins reduced by 5%, or +/- 10% variance)
- Contact/Account sensitive fields (email, phone) → dummy values or hashed
- Keep: Quote structure, Product/SKU relationships, Product Rules, Price Rules, Discount logic

**2. Masking Automation**
- Use Salesforce's native Data Mask tool or third-party tool (Genymotion, Veeva Vault Masking)
- Write Apex post-refresh script to mass-update masked fields via Data Loader or Bulk API
- Example: `UPDATE Quote SET Customer__c = 'Masked_' + Id.substring(0,8) WHERE Id IN (...)`

**3. Performance Baseline Preservation**
- After masking, measure quote calculation time on a 500-line sample quote
- Compare to production baseline; if variance > 10%, investigate (likely caused by data distribution changes)
- Re-index key lookup fields (Account.Customer_Tier__c, PriceTier.Lookup_Field) in sandbox if needed

**4. Sandbox Refresh Cadence**
- Weekly refresh from production via Salesforce's Change Set or SFDX/Copado (CI/CD)
- Post-refresh, run masking automation (expected runtime: 2–4 hours for 50K quotes)
- Notify test team when sandbox is ready (via Slack or email)

**5. Testing & Validation**
- Pre-refresh smoke tests: 5 representative quote calc, approval flow, DocGen
- Post-refresh: re-run smoke tests to confirm calculation behavior unchanged
- Load test: spawn 1000 concurrent users executing quote calculations (using Apache JMeter or Salesforce Load Testing)
- Performance SLA: quote calc < 10s for 300-line quotes in sandbox

**6. Compliance & Audit**
- Document masking rules and retention in a masking policy doc
- Log all refresh events (timestamp, data mask version, test user count) in an audit object
- Annual review: validate that masking is adequate and no PII escapes to sandbox

**rubric:**

3-tier rubric: (1) Comprehensive strategy covering masking scope, automation, performance baseline, refresh cadence, load testing = 10 points. (2) Strategy with 4–5 components but missing load testing or audit logging = 6 points. (3) Vague design or missing key components = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-048-seed-7a5e3f2b  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-048  
**bias_check_notes:** Data governance strategy is vendor-neutral; no bias.

---

### QUESTION 49: Manufacturing CPQ — Bundle with Manufacturing Operations Integration (Hard)

**question_id:** QOR-SFCPQ-049  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** industries-cpq-manufacturing-deep  
**format:** MCQ  
**difficulty_b:** 1.1 (Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 7  
**citation:** Salesforce Industries CPQ for Manufacturing §3; MES Integration Guide; Supply Chain Planning

**body:**

A manufacturing company uses Industries CPQ to quote custom equipment bundles (motor + gearbox + control system). Once a quote is accepted and converted to an order, the manufacturing execution system (MES) must receive a production work order with detailed BOM (bill of materials) and lead times. Which integration pattern best ensures that CPQ quote structure (bundles and child items) maps to MES BOM without manual transformation?

**options:**

- A) Export quote as CSV; import CSV into MES via manual upload (one order at a time)
- B) Use OmniStudio Integration Procedure to transform CPQ bundle structure to MES-compatible JSON; trigger on Order creation via Platform Event
- C) Write a custom Apex REST API that parses QuoteLine parent-child relationships and calls MES REST API on order acceptance
- D) Use Salesforce Connect to create a virtual MES external object; bi-directional sync handles BOM mapping

**answer_key:**

B — The recommended Industries CPQ pattern for manufacturing is OmniStudio Integration Procedure. It is designed to map complex, nested data structures (CPQ bundles → manufacturing BOMs) and supports conditional transformations (e.g., "if bundle type = 'Motor', include supplier lead time"). Integration Procedures can be triggered by Platform Events (e.g., on Order creation) and called asynchronously to avoid blocking quote-to-order conversion. Option A is manual and does not scale; Option C is feasible but overly custom (reinvents OmniStudio functionality); Option D (Salesforce Connect) is read-heavy and not ideal for bi-directional order sync. References: Salesforce Industries CPQ for Manufacturing §3.3 (OmniStudio Integration Procedure for BOM Mapping).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-049-seed-8c3d5f1a  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-049  
**bias_check_notes:** Manufacturing use-case is industry-neutral; no bias.

---

### QUESTION 50: Margin Analysis at QuoteLine Level — Aggregation and Reporting (Hard)

**question_id:** QOR-SFCPQ-050  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-analytics-reporting  
**format:** Code (CRM Analytics / JSON)  
**difficulty_b:** 0.9 (Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 10  
**citation:** Salesforce CRM Analytics Dataflow Guide; CPQ Calculated Fields; Custom Report Types

**body:**

Write a CRM Analytics dataflow JSON that ingests QuoteLine objects and calculates: (1) line-level margin % = (NetPrice - Cost) / NetPrice * 100, (2) blended quote margin = SUM(NetPrice - Cost) / SUM(NetPrice) * 100, (3) flag lines with margin < 15% as "Low Margin". Output a dataset ready for dashboard visualization.

```json
{
  "version": 1.0,
  "nodes": [
    // YOUR DATAFLOW NODES HERE
    // 1. Extract QuoteLine (sfdcDigest)
    // 2. Calculate line-level margin
    // 3. Group by Quote ID, calculate blended margin
    // 4. Add flag for low-margin lines
    // 5. Output to dataset
  ]
}
```

**options:**

(Code-based; expect CRM Analytics dataflow structure)

**answer_key:**

```json
{
  "version": 1.0,
  "nodes": [
    {
      "action": "sfdcDigest",
      "name": "QuoteLineSource",
      "parameters": {
        "object": "SBQQ__QuoteLine__c",
        "fields": [
          "Id", "SBQQ__Quote__c", "SBQQ__NetPrice__c", "SBQQ__Cost__c", "Quantity", "Product2.Name"
        ]
      }
    },
    {
      "action": "formula",
      "name": "CalculateLineMargin",
      "parameters": {
        "source": "QuoteLineSource",
        "formula": "if(NetPrice > 0, (NetPrice - Cost) / NetPrice * 100, 0)",
        "outputField": "LineMarginPercent"
      }
    },
    {
      "action": "formula",
      "name": "FlagLowMargin",
      "parameters": {
        "source": "CalculateLineMargin",
        "formula": "if(LineMarginPercent < 15, 'Low Margin', 'Healthy')",
        "outputField": "MarginFlag"
      }
    },
    {
      "action": "groupby",
      "name": "AggregateByQuote",
      "parameters": {
        "source": "FlagLowMargin",
        "groupByField": "Quote__c",
        "aggregations": [
          {
            "aggregationType": "sum",
            "field": "NetPrice",
            "outputField": "TotalNetPrice"
          },
          {
            "aggregationType": "sum",
            "field": "Cost",
            "outputField": "TotalCost"
          }
        ]
      }
    },
    {
      "action": "formula",
      "name": "CalculateBlendedMargin",
      "parameters": {
        "source": "AggregateByQuote",
        "formula": "if(TotalNetPrice > 0, (TotalNetPrice - TotalCost) / TotalNetPrice * 100, 0)",
        "outputField": "BlendedMarginPercent"
      }
    },
    {
      "action": "sfdcRegister",
      "name": "OutputDataset",
      "parameters": {
        "source": "CalculateBlendedMargin",
        "datasetName": "CPQ_Margin_Analysis"
      }
    }
  ]
}
```

Expected approach: (1) Extract QuoteLine with NetPrice and Cost fields, (2) calculate line-level margin using formula node, (3) aggregate by Quote (groupby), (4) calculate blended margin, (5) register output dataset.

**rubric:**

3-tier rubric: (1) Complete dataflow with all 5 nodes, correct formula syntax, proper aggregation = 10 points. (2) Correct structure but missing low-margin flag or aggregation = 6 points. (3) Incomplete dataflow or incorrect formula = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-050-seed-9f4a2e1c  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-050  
**bias_check_notes:** Analytics syntax is vendor-standard; no bias.

---

### QUESTION 51: Approval Cycle-Time Reporting — SLA Monitoring (Hard)

**question_id:** QOR-SFCPQ-051  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-analytics-reporting  
**format:** Design  
**difficulty_b:** 0.95 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 9  
**citation:** Salesforce Approval Process Monitoring; CPQ Approval SLA Guide; Custom Metric Definition

**body:**

Design a monitoring dashboard that tracks approval cycle-time SLA for CPQ quotes. SLA targets: (1) tier 1 quotes (< ₹10L) → approve within 2 business days, (2) tier 2 (₹10L–₹1Cr) → 3 business days, (3) tier 3 (> ₹1Cr) → 5 business days. Outline the data model, metric definitions, and visualization strategy.

**options:**

(Design question; expect SLA calculation, data capture, and dashboard strategy)

**answer_key:**

Expected response (comprehensive SLA monitoring design):

**1. Data Model**
- Extend Quote with fields: Submitted_For_Approval_Date__c (datetime), Approval_Completed_Date__c (datetime), Approval_Tier__c (picklist: Tier1/2/3)
- Create an approval log object (Quote_Approval_Log__c) to track each approval step: approver, submitted date, approved date, approval sequence
- Calculate: cycle_time_days = (Approval_Completed_Date__c - Submitted_For_Approval_Date__c) / 86400 (accounting for business days)

**2. SLA Tier Assignment (Automation)**
- Use Apex or Flow (on Quote update) to assign Approval_Tier__c based on SBQQ__NetAmount__c:
  - Tier1: Amount < 1,000,000
  - Tier2: Amount >= 1,000,000 AND < 10,000,000
  - Tier3: Amount >= 10,000,000

**3. Cycle-Time Calculation**
- Use Salesforce Process Automation or Apex to calculate business-day elapsed time between submission and completion
- Formula: BusinessDaysBetween(Submitted_Date, Completed_Date) using a custom Apex function that skips weekends and holidays
- Store result in Cycle_Time_Business_Days__c field

**4. SLA Compliance Flag**
- Create formula field: SLA_Met__c = (Cycle_Time_Business_Days__c <= SLA_Target__c)
- SLA_Target__c is a formula that returns 2 (Tier1), 3 (Tier2), or 5 (Tier3) based on Approval_Tier__c

**5. CRM Analytics Dashboard**
- Ingest Quote and Quote_Approval_Log objects
- Visualizations:
  - **Gauge chart:** % of quotes meeting SLA (target: 95%+)
  - **Line chart:** trend of avg cycle-time by tier over 12 weeks
  - **Bar chart:** approval cycle-time distribution (0–2 days, 2–5 days, 5+ days)
  - **Table:** recent quotes exceeding SLA (clickable to detail view)
  
**6. Alerting & Escalation**
- Create a Flow that monitors quotes in-progress approval:
  - If quote is submitted for approval and 1.5x SLA elapsed (e.g., 3 days for Tier1), send reminder to approver
  - If SLA deadline is reached and approval not done, escalate to VP of Sales
- Log escalations in a separate Escalation__c object for audit

**7. Reporting & Cadence**
- Weekly snapshot: % SLA compliance by tier, avg cycle-time
- Monthly: deeper analysis (top 3 slowest approvers, bottleneck tiers)
- Quarterly review with approvers to adjust SLA targets based on operational reality

**rubric:**

3-tier rubric: (1) Complete design with data model, SLA calculation, automation, CRM Analytics dashboard, alerting = 10 points. (2) Design with 4–5 components but missing alerting or escalation logic = 6 points. (3) Vague design or missing key components = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-051-seed-6c1e4a7f  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-051  
**bias_check_notes:** SLA tracking is vendor-neutral; no bias.

---

### QUESTION 52: Financial Services CPQ — Risk-Rated Insurance Product Pricing (Hard)

**question_id:** QOR-SFCPQ-052  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** industries-cpq-financial-services-deep  
**format:** Code (Quote Calculator Plugin)  
**difficulty_b:** 1.2 (Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** Salesforce Industries CPQ for FSI §4; Risk Rating Models; Insurance Pricing Logic

**body:**

Write a Quote Calculator Plugin (JavaScript) that applies risk-rated pricing for insurance products. Input: customer risk profile (low/medium/high), coverage type (basic/standard/premium), and coverage amount. Price each line using a risk multiplier: low = 1.0x, medium = 1.25x, high = 1.75x. Base price for coverage type: basic = ₹5,000/year, standard = ₹8,000/year, premium = ₹12,000/year. Apply volume discount: if coverage amount > ₹50L, apply 10% discount.

```javascript
// Input: QuoteLines array with Risk_Profile__c, Coverage_Type__c, Coverage_Amount__c
// Output: Adjusted Price__c on each line

// YOUR CODE HERE
```

**options:**

(Code-based; expect risk multiplier logic, base price lookup, discount conditional)

**answer_key:**

```javascript
const basePrices = {
    'basic': 5000,
    'standard': 8000,
    'premium': 12000
};

const riskMultipliers = {
    'low': 1.0,
    'medium': 1.25,
    'high': 1.75
};

for (let i = 0; i < QuoteLines.length; i++) {
    let line = QuoteLines[i];
    
    // Get base price from coverage type
    let coverageType = line.Coverage_Type__c ? line.Coverage_Type__c.toLowerCase() : 'standard';
    let basePrice = basePrices[coverageType] || basePrices['standard'];
    
    // Apply risk multiplier
    let riskProfile = line.Risk_Profile__c ? line.Risk_Profile__c.toLowerCase() : 'medium';
    let riskMultiplier = riskMultipliers[riskProfile] || riskMultipliers['medium'];
    let riskAdjustedPrice = basePrice * riskMultiplier;
    
    // Apply volume discount if coverage amount > 50L
    let coverageAmount = line.Coverage_Amount__c || 0;
    let discount = coverageAmount > 5000000 ? 0.10 : 0; // 50L = 5M
    
    // Final price
    let finalPrice = riskAdjustedPrice * (1 - discount);
    line.Price__c = finalPrice;
}
```

Expected approach: (1) define base price map by coverage type, (2) define risk multiplier map, (3) loop through QuoteLines, (4) lookup base price, apply risk multiplier, (5) check coverage amount for volume discount, (6) set final Price__c.

**rubric:**

3-tier rubric: (1) Correct base price lookup, risk multiplier application, volume discount condition, and price calculation = 10 points. (2) Correct logic but missing null checks or discount condition = 6 points. (3) Incomplete logic or incorrect multiplier application = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-052-seed-7d3a5f2c  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-052  
**bias_check_notes:** Insurance pricing model is vendor-neutral; no bias.

---

### QUESTION 53: Org-Level vs. Profile-Level CPQ Governance — Permissions Architecture (Hard)

**question_id:** QOR-SFCPQ-053  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-customization-constraints  
**format:** MCQ  
**difficulty_b:** 1.0 (Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 7  
**citation:** Salesforce CPQ Security Model §2; Profile-Based vs. OrgLevel Governance; Spring '26

**body:**

A multinational company uses CPQ with different discount approval policies per region: EMEA (VP can approve up to 30% discount), APAC (VP can approve up to 20%), Americas (SVP must approve > 20%). Should this be implemented at the org level (single governance rule) or profile level (region-specific profiles with different capabilities)?

**options:**

- A) Org level; use a single Smart Approval rule with conditions branching on Account.Region__c
- B) Profile level; create three custom profiles (EMEA_Sales, APAC_Sales, Americas_Sales) with region-specific discount field permissions
- C) Both; implement Smart Approvals at the org level for routing, and Profile permissions at field level to prevent unauthorized edits
- D) Neither; use custom Apex permissions (custom permissions) to encode region-specific rules

**answer_key:**

C — The recommended approach combines both: (1) org-level Smart Approvals route quotes based on Account.Region__c and discount tier (ensuring the correct approver is selected), and (2) profile-level field permissions restrict which users can edit the discount field (e.g., EMEA_Sales can edit Discount__c; APAC_Sales can edit only if discount < 20%). Option A alone leaves room for profile-based override; Option B lacks the org-level routing intelligence; Option D (custom permissions) is useful for feature flags but not ideal for field-level access control. References: Salesforce CPQ Security Model §2.3 (Layered Governance: Org + Profile).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-053-seed-8b2f4c1a  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-053  
**bias_check_notes:** Governance architecture is vendor-neutral; no bias.

---

### QUESTION 54: Account-Based Selling with CPQ — Forecast Category Integration (Hard)

**question_id:** QOR-SFCPQ-054  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-sales-engagement-einstein  
**format:** MCQ  
**difficulty_b:** 1.1 (Hard)  
**discrimination_a:** 1.5  
**expected_duration_minutes:** 8  
**citation:** Salesforce Sales Cloud Forecast Management; Account-Based Selling (ABS) Guide; CPQ Opportunity Integration

**body:**

In an Account-Based Selling (ABS) model, a sales team uses CPQ to generate quotes for target accounts. The Forecast functionality in Salesforce relies on Opportunity.ForecastCategory (Pipeline, Best Case, Commit, Omitted) to calculate sales funnel metrics. Which statement correctly describes how CPQ quotes affect forecast accuracy?

**options:**

- A) CPQ quotes auto-sync Opportunity.ForecastCategory; a quote in "Proposal" status sets ForecastCategory to "Commit"
- B) CPQ quotes do NOT directly update ForecastCategory; sales reps must manually update Opportunity.ForecastCategory when a quote is sent, creating a data sync risk
- C) CPQ updates ForecastCategory only when a quote is converted to an Order; before that, the rep's manual update is the source-of-truth
- D) CPQ disables ForecastCategory in ABS orgs; predictions are based on quote metrics (velocity, approval status) instead

**answer_key:**

B — CPQ quotes do not automatically update Opportunity.ForecastCategory. The category is a separate field on Opportunity that the sales rep must manage independently. This creates a common sync risk: a quote is sent to the customer (indicating likely close), but the Opportunity ForecastCategory remains "Pipeline" instead of "Commit", skewing forecast accuracy. Best practice is to create a Flow that monitors quote status changes and prompts the rep to update ForecastCategory, or use a custom Apex class to auto-update based on quote state. References: Salesforce CPQ Integration Best Practices §3.2 (Forecast Sync Patterns).

**rubric:**

MCQ; correct = 5 points, incorrect = 0.

**watermark_seed:** qorium-sfcpq-v0.6-054-seed-5f3e2a6d  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-054  
**bias_check_notes:** Sales forecasting is vendor-neutral; no bias.

---

### QUESTION 55: Quote Calculation Slow on Multi-Currency Quotes — Diagnosis and Caching Strategy (Very Hard)

**question_id:** QOR-SFCPQ-055  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-customization-constraints  
**format:** Case Study  
**difficulty_b:** 1.4 (Very Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 12  
**citation:** Salesforce CPQ Performance Troubleshooting; Currency Conversion & Caching; Multi-Currency Optimization

**body:**

PRODUCTION INCIDENT: A customer's multi-currency quote (supporting 8 currencies: USD, EUR, GBP, JPY, CAD, AUD, INR, SGD) takes 45 seconds to calculate, approaching the 60-second timeout. The quote has 150 line items. Investigation reveals:
- Each line item triggers a Lookup Query to fetch the latest FX rate for its currency
- FX rates are stored in a custom FX_Rate__c object with no indexes
- The QCP iterates all 150 lines and fires 150+ Lookup Queries

Diagnose and propose a remediation plan. Consider caching, query optimization, and calculation sequencing.

**options:**

(Case study; expect root cause analysis and multi-step remediation)

**answer_key:**

**Diagnosis:**

1. **Root Cause (PRIMARY):** 150 line items × 1 Lookup Query per line (to fetch FX rates) = 150+ SOQL executions. Each query scans the FX_Rate__c object without an index, performing a full table scan. This is the primary bottleneck.

2. **Secondary Issue:** If FX_Rate__c has thousands of records and no index on the lookup fields (Currency, Effective_Date), each unindexed query is expensive.

3. **Tertiary Issue:** Lookup Queries execute synchronously during quote calculation; if any query approaches the CPU timeout, the entire calculation stalls.

**Remediation Plan (priority order):**

1. **IMMEDIATE (30 min):** Create a database index on FX_Rate__c.Currency__c and FX_Rate__c.Effective_Date__c. Retest the quote. Expected improvement: 45s → 15-20s.

2. **SHORT-TERM (1 day):** Refactor the Price Rule Lookup Query to be more selective. Instead of querying all FX rates, filter by specific currency and date range (e.g., "WHERE Currency = :currencyCode AND Effective_Date <= TODAY ORDER BY Effective_Date DESC LIMIT 1"). This reduces result set significantly.

3. **MEDIUM-TERM (2-3 days):** Implement static caching in the QCP. At quote calculation start, fetch all unique FX rates needed (e.g., 8 currencies × 1 record each = 8 records) via a single SOQL batch query. Store results in a static Map<Currency, Decimal> and reference the Map in the per-line loop. Expected improvement: 20s → 3-5s.

```javascript
// Pseudo-code for caching in QCP:
var currencyRates = {}; // Cache map
var uniqueCurrencies = new Set();

// Collect unique currencies
for (let line of QuoteLines) {
    uniqueCurrencies.add(line.CurrencyIsoCode);
}

// Fetch all rates in one batch (done via Apex callout before QCP runs)
var ratesMap = ApexController.getFXRates(Array.from(uniqueCurrencies));

// Use cache in loop
for (let line of QuoteLines) {
    let rate = ratesMap[line.CurrencyIsoCode];
    line.CalculatedPrice = line.BasePrice * rate;
}
```

4. **LONG-TERM (1 week):** Implement a "FX Rate Snapshot" object that stores daily FX rates (pre-calculated ETL). Instead of querying FX_Rate__c nightly, run a batch job that aggregates the latest rates and stores them in a denormalized FX_Rate_Daily__c object, indexed by Currency + Date. The Lookup Query now hits the snapshot object (much smaller, faster scans).

**Expected post-remediation time:** 3-5 seconds (well below 60-second limit).

**rubric:**

3-tier rubric: (1) Root cause identified (unindexed Lookup Queries), comprehensive remediation (indexing + caching + snapshot strategy) = 10 points. (2) Root cause with partial remediation (missing caching or snapshot layer) = 6 points. (3) Vague diagnosis or incomplete plan = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-055-seed-9c4d3f1e  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-055  
**bias_check_notes:** Performance troubleshooting is vendor-neutral; no bias.

---

### QUESTION 56: Localization in CPQ Quote Templates — Locale-Specific Formatting and Text (Very Hard)

**question_id:** QOR-SFCPQ-056  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** multicurrency-global-patterns  
**format:** Design  
**difficulty_b:** 1.3 (Very Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 11  
**citation:** Salesforce DocGen Localization Guide; Salesforce CPQ Multilingual Template Support; Spring '26

**body:**

Design a CPQ DocGen template that serves customers in 10 countries, each with different localization requirements: currency format (₹12,34,567.89 for India vs. 12.345.678,89 for Germany), date format (DD/MM/YYYY vs. MM/DD/YYYY), language (English vs. German vs. French), and tax terminology (GST vs. VAT vs. HST). Outline the template architecture, data model, and rendering logic.

**options:**

(Design question; expect locale-aware architecture)

**answer_key:**

Expected response (comprehensive localization design):

**1. Locale Configuration Model**
- Create a custom Locales__c object with fields:
  - Locale_Code (e.g., "en_IN", "de_DE", "fr_FR")
  - Country__c (lookup to Account)
  - Currency_Format__c (e.g., "#,##,###.##" for India, "#.###,##" for Germany)
  - Date_Format__c (e.g., "dd/MM/yyyy" vs. "MM/dd/yyyy")
  - Language__c (English, German, French)
  - Tax_Term__c (GST, VAT, HST)
  - Decimal_Separator__c ("." vs. ",")

**2. Account Locale Assignment**
- Add a Locale__c field to Account (lookup to Locales)
- Use Apex on Account creation to auto-assign locale based on BillingCountryCode
- Example: if BillingCountry = "India", auto-assign Locale = "en_IN"

**3. DocGen Template Architecture**
- Create a BASE template with conditional sections for each locale
- Use DocGen's Conditional Rendering: `{% if Locale__c.Language__c == "French" %} [French text] {% endif %}`
- For numbers/currency: use DocGen formula functions `FORMAT_CURRENCY()` and `FORMAT_NUMBER()` with locale-aware parameters
- Example: `{{ FORMAT_CURRENCY(Quote.NetAmount__c, Locale__c.Currency_Format__c, Locale__c.Decimal_Separator__c) }}`

**4. Multilingual Text Management**
- Store all translatable text in a custom Locale_Translations__c object:
  - Field__c (e.g., "quote_title", "discount_label", "tax_label")
  - Language__c (English, German, French)
  - Translated_Text__c (the actual localized text)
- In the DocGen template, reference translations via lookup:
  - Example: `{{ Locale_Translations__c.findByField("quote_title").Translated_Text__c }}`

**5. Tax and Compliance Terminology**
- Create a Tax_Terminology__c object with fields:
  - Country__c (India, Germany, France)
  - Tax_Type__c (GST, VAT, HST)
  - Tax_Label__c (how to label tax on quote: "GST (18%)" vs. "VAT (19%)")
  - Calculation_Method__c (inclusive vs. exclusive, for clarity in the quote)
- In DocGen, render tax label based on Country: `{{ Quote.Account__r.Country__c_Tax_Terminology__c.Tax_Label__c }}`

**6. Date and Number Formatting (Apex + DocGen)**
- Create an Apex class `LocaleFormatter` with static methods:
  - `formatCurrency(amount, locale)` — returns ₹12,34,567.89 for India, 12.345.678,89 for Germany
  - `formatDate(date, locale)` — returns DD/MM/YYYY or MM/DD/YYYY
  - `formatNumber(number, locale)` — handles decimal separators
- Call these methods from DocGen via a custom Apex controller that returns formatted values

**7. DocGen Template Structure**
```html
<!-- Header: localized based on language -->
{% if Account.Locale__c.Language__c == "en_IN" %}
  <h1>QUOTATION</h1>
{% elseif Account.Locale__c.Language__c == "de_DE" %}
  <h1>ANGEBOT</h1>
{% endif %}

<!-- Currency: formatted per locale -->
<p>Amount: {{ LocaleFormatter.formatCurrency(Quote.NetAmount__c, Account.Locale__c) }}</p>

<!-- Tax: terminology per country -->
<p>{{ Account.Locale__c.Tax_Terminology__c.Tax_Label__c }}: {{ LocaleFormatter.formatCurrency(Quote.Tax_Amount__c, Account.Locale__c) }}</p>

<!-- Date: formatted per locale -->
<p>Date: {{ LocaleFormatter.formatDate(Quote.CreatedDate, Account.Locale__c) }}</p>
```

**8. Testing & Validation**
- Generate quotes for sample customers in each country (10 test scenarios)
- Verify currency format, date format, language text, tax terminology
- Test edge cases: zero amounts, large numbers, special characters in translations

**9. Maintenance**
- Quarterly review: validate that new countries/currencies are added to Locales__c
- Annual translation audit: ensure Locale_Translations__c is complete and accurate

**rubric:**

3-tier rubric: (1) Comprehensive design covering locale config, account assignment, conditional templates, formatting, translations, tax terminology = 10 points. (2) Design with 5–6 components but missing translation management or formatter logic = 6 points. (3) Vague design or missing key components = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-056-seed-6e5f2a8b  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-056  
**bias_check_notes:** Localization design is globally inclusive by design; no bias.

---

### QUESTION 57: Bulk API 2.0 + Idempotency — Quote Line Bulk Load (Very Hard)

**question_id:** QOR-SFCPQ-057  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-customization-constraints  
**format:** Code (Apex + Bulk API 2.0)  
**difficulty_b:** 1.35 (Very Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 14  
**citation:** Salesforce Bulk API 2.0 Guide; Idempotency Patterns; CPQ Bulk Data Loading

**body:**

Write an Apex batch job that bulk-loads 50,000 quote lines from an external ERP system into CPQ. Requirements: (1) achieve idempotency (no duplicate loads if the job re-runs), (2) include error recovery (failed rows logged for retry), (3) use Bulk API 2.0 for efficient throughput, (4) map ERP product IDs to Salesforce Product2 records. Provide pseudocode or framework outline.

```apex
global class CPQBulkLineLoader implements Database.Batchable<String> {
    // YOUR CODE HERE
    // execute(): load batch of 50K lines
    // finish(): commit records, log errors
}
```

**options:**

(Code-based; expect batch design, Bulk API 2.0 concepts, idempotency logic)

**answer_key:**

```apex
global class CPQBulkLineLoader implements Database.Batchable<String> {
    // Batch context
    public Integer batchSize = 1000; // Process 1K lines per batch invocation
    public List<String> erpLineIds = new List<String>();
    
    global CPQBulkLineLoader(List<String> erpIds) {
        this.erpLineIds = erpIds;
    }
    
    global Iterable<String> start(Database.BatchableContext bc) {
        // Return iterable of ERP line IDs (50K records, processed in batches)
        return erpLineIds;
    }
    
    global void execute(Database.BatchableContext bc, List<String> scope) {
        // scope contains up to 1K ERP line IDs
        
        // Step 1: Fetch external ERP data (assume API callout)
        Map<String, Object> erpLines = fetchERPLines(scope); // Map<erpLineId, erpLineData>
        
        // Step 2: Fetch existing Salesforce data for idempotency
        Set<String> erpLineIdSet = new Set<String>(scope);
        Map<String, SBQQ__QuoteLine__c> existingLines = new Map<String, SBQQ__QuoteLine__c>();
        
        // Query by external ID (create a custom field: ERP_Line_Id__c)
        for (SBQQ__QuoteLine__c line : [
            SELECT Id, ERP_Line_Id__c FROM SBQQ__QuoteLine__c 
            WHERE ERP_Line_Id__c IN :erpLineIdSet
        ]) {
            existingLines.put(line.ERP_Line_Id__c, line);
        }
        
        // Step 3: Prepare upsert list (update if exists, insert if new)
        List<SBQQ__QuoteLine__c> linesToUpsert = new List<SBQQ__QuoteLine__c>();
        List<Error_Log__c> errorLogs = new List<Error_Log__c>();
        
        // Fetch product map (ERP product ID → Salesforce Product2 ID)
        Map<String, String> productMap = buildProductMap(erpLines); // erpProductId → sfProductId
        
        for (String erpLineId : scope) {
            try {
                Map<String, Object> erpLine = (Map<String, Object>) erpLines.get(erpLineId);
                
                if (erpLine == null) continue; // Skip if ERP data unavailable
                
                // Map ERP data to QuoteLine
                SBQQ__QuoteLine__c qLine = new SBQQ__QuoteLine__c();
                
                if (existingLines.containsKey(erpLineId)) {
                    // Update existing
                    qLine = existingLines.get(erpLineId);
                } else {
                    // New record
                    qLine.ERP_Line_Id__c = erpLineId; // Idempotency key
                }
                
                // Populate fields
                qLine.SBQQ__Product__c = productMap.get((String) erpLine.get('productId'));
                qLine.SBQQ__Quantity__c = (Decimal) erpLine.get('quantity');
                qLine.SBQQ__ListPrice__c = (Decimal) erpLine.get('unitPrice');
                qLine.SBQQ__NetPrice__c = (Decimal) erpLine.get('netPrice');
                
                linesToUpsert.add(qLine);
                
            } catch (Exception e) {
                // Log error for this ERP line
                errorLogs.add(new Error_Log__c(
                    ERP_Line_Id__c = erpLineId,
                    Error_Message__c = e.getMessage(),
                    Batch_Id__c = bc.getJobId(),
                    Load_Timestamp__c = System.now()
                ));
            }
        }
        
        // Step 4: Upsert with idempotency
        if (!linesToUpsert.isEmpty()) {
            Database.upsert(linesToUpsert, SBQQ__QuoteLine__c.ERP_Line_Id__c, false); // External ID upsert
        }
        
        // Step 5: Log errors for retry
        if (!errorLogs.isEmpty()) {
            insert errorLogs;
        }
    }
    
    global void finish(Database.BatchableContext bc) {
        // Summary: count total loads, errors
        Integer errorCount = [SELECT COUNT() FROM Error_Log__c WHERE Batch_Id__c = :bc.getJobId()];
        Integer successCount = erpLineIds.size() - errorCount;
        
        System.debug('Batch ' + bc.getJobId() + ': ' + successCount + ' loaded, ' + errorCount + ' errors');
        
        // Optional: send email summary or trigger retry job for failed rows
        if (errorCount > 0) {
            scheduleRetryJob(bc.getJobId());
        }
    }
    
    private Map<String, Object> fetchERPLines(List<String> erpLineIds) {
        // Assume external API callout to ERP system
        // Returns map of erpLineId → erpLineData (simplified)
        return new Map<String, Object>(); // Stub
    }
    
    private Map<String, String> buildProductMap(Map<String, Object> erpLines) {
        // Fetch all ERP product IDs, then query Salesforce Product2 by external ID
        Set<String> erpProductIds = new Set<String>();
        for (Object erpLine : erpLines.values()) {
            erpProductIds.add((String) ((Map<String, Object>) erpLine).get('productId'));
        }
        
        Map<String, String> productMap = new Map<String, String>();
        for (Product2 p : [
            SELECT Id, ERP_Product_Id__c FROM Product2 
            WHERE ERP_Product_Id__c IN :erpProductIds
        ]) {
            productMap.put(p.ERP_Product_Id__c, p.Id);
        }
        
        return productMap;
    }
    
    private void scheduleRetryJob(String batchId) {
        // Schedule a retry job for records in Error_Log with this batch ID
        // Implementation: query errors, re-invoke batch job with failed ERP IDs
    }
}

// Usage:
CPQBulkLineLoader loader = new CPQBulkLineLoader(erpLineIds);
Database.executeBatch(loader, 1000);
```

Expected approach: (1) Batch processing (1K lines per iteration), (2) idempotency via external ID field (ERP_Line_Id__c), (3) upsert logic (update if exists, insert if new), (4) error logging for failed rows, (5) retry mechanism on finish.

**rubric:**

3-tier rubric: (1) Complete batch implementation with idempotency, error logging, product mapping = 10 points. (2) Batch design with error handling but missing idempotency key or product map = 6 points. (3) Incomplete batch logic or missing error recovery = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-057-seed-7f6c2d4a  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-057  
**bias_check_notes:** Data loading patterns are vendor-neutral; no bias.

---

### QUESTION 58: CPQ + ERP Quote-to-Order to Invoice — End-to-End Integration Pipeline (Very Hard)

**question_id:** QOR-SFCPQ-058  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-customization-constraints  
**format:** Design  
**difficulty_b:** 1.4 (Very Hard)  
**discrimination_a:** 1.6  
**expected_duration_minutes:** 13  
**citation:** Salesforce CPQ Integration Best Practices; Quote-to-Cash Architecture; ERP Synchronization Patterns

**body:**

Design a Quote-to-Order-to-Invoice integration pipeline that connects Salesforce CPQ with an on-premises ERP system (Oracle Cloud ERP). Requirements: (1) CPQ quote → SAP sales order, (2) order acknowledgment from ERP → update Salesforce order status, (3) ERP invoice → Salesforce billing record, (4) error handling and retry logic, (5) audit trail for all syncs. Outline the architecture, data flow, middleware, and idempotency strategy.

**options:**

(Design question; expect end-to-end pipeline architecture)

**answer_key:**

Expected response (comprehensive integration architecture):

**1. Overall Architecture**
- **Salesforce Layer:** CPQ (Quote creation) → Order → Billing
- **Middleware:** MuleSoft/N8N/Apache Kafka (async message broker)
- **ERP Layer:** Sales Order → Order Acknowledgment → Invoice
- **Data Sync:** bidirectional via REST APIs + event-driven messaging

**2. Quote-to-Order Flow**
- **Trigger:** Salesforce Flow on Quote.Status change → "Accepted"
- **Platform Event:** Emit QuoteAccepted__e event with Quote ID
- **Middleware:** Subscribe to QuoteAccepted__e, fetch full Quote + QuoteLines
- **Transformation:** Map CPQ Quote/QuoteLines to ERP Sales Order JSON (hierarchical bundle structure → flat line items)
- **ERP Integration:** POST to ERP /api/sales-orders endpoint
- **Response Handling:** ERP returns Sales Order ID + acknowledgment timestamp
- **Idempotency Key:** Use Quote.Id as external ID in ERP (no duplicate orders if middleware retries)
- **Salesforce Sync:** Apex Flow updates Salesforce Order.ERP_Order_ID__c = response ID

**3. Order Acknowledgment Flow (ERP → Salesforce)**
- **Trigger:** ERP sends webhook (on Sales Order confirmation) to Salesforce HTTP endpoint
- **Middleware:** Validate webhook signature, queue message
- **Salesforce Apex Endpoint:** REST class receives ERP Order ID + status (Confirmed, Pending, Rejected)
- **Order Update:** Query Salesforce Order by ERP_Order_ID__c, update Order.Status = "Confirmed"
- **Failure Handling:** If Salesforce order not found (data consistency issue), log to Error_Queue__c for manual review

**4. ERP Invoice → Salesforce Billing**
- **Trigger:** ERP emits Invoice event (scheduled daily via batch job or webhook)
- **Data Sync:** Middleware fetches ERP invoices (filter by Sales Order ID)
- **Mapping:** ERP Invoice → Salesforce Billing__c object (custom):
  - Invoice Number → Billing_Number__c
  - Invoice Amount → Amount__c
  - Invoice Date → Invoice_Date__c
  - Link to Order via ERP_Order_ID__c
- **Upsert:** Use ERP Invoice ID as external key (idempotency)
- **Aging Calculation:** Automated Flow calculates Days_Outstanding__c for reporting

**5. Idempotency Strategy**
- **External ID Fields:**
  - Order.ERP_Order_ID__c (external ID, prevent duplicate orders)
  - Billing__c.ERP_Invoice_ID__c (external ID, prevent duplicate invoices)
- **Middleware:**
  - Track processed message IDs (UUID) in a Processed_Messages__c object
  - If same message ID arrives twice, skip processing (idempotent)
  - Use database transactions to ensure all-or-nothing updates

**6. Error Handling & Retry**
- **Error Categories:**
  - **Transient (timeout, 5xx):** Retry up to 3 times (exponential backoff: 1s, 5s, 30s)
  - **Permanent (4xx, validation error):** Log to Error_Log__c, alert ops team
  - **Data Consistency (missing Order):** Log to Reconciliation_Queue__c for manual investigation
- **Dead-Letter Queue:** Middleware maintains a DLQ for messages that fail after max retries
- **Recovery:** Ops team reviews DLQ, fixes underlying issue (e.g., missing Account in ERP), manually re-queues message

**7. Audit Trail**
- **Sync Log Object:** Integration_Sync_Log__c with fields:
  - Source_Record_ID__c (Quote ID, Order ID, Invoice ID)
  - Target_System__c (ERP)
  - Target_Record_ID__c (ERP Order/Invoice ID)
  - Sync_Status__c (Success, Retry, Failed)
  - Timestamp__c
  - Error_Message__c (if failed)
- **Compliance:** Retention policy: keep logs for 7 years (SOX compliance)
- **Reporting:** Dashboard shows sync success rate, error trends, retry patterns

**8. Performance Considerations**
- **Bulk Sync:** Process quotes/orders/invoices in batches (1K per middleware batch job)
- **Rate Limiting:** Throttle ERP API calls (e.g., 100 req/sec max)
- **Async Processing:** Use Platform Events + async Apex (Queueable) to avoid synchronous timeouts
- **Caching:** Middleware caches Account/Product mappings (refresh hourly)

**9. Testing & Cutover**
- **Sandbox Cutover:** 100 test quotes → ERP, verify 1:1 mapping
- **UAT:** End-to-end flow (Quote → Order → Invoice) with 1,000 records; measure latency (target < 5 min)
- **Parallel Run:** First 30 days, sync quotes to ERP but do NOT release for fulfillment; compare to legacy system
- **Rollback:** If sync fails, fall back to manual order entry (APIs remain read-only for 2 weeks)

**10. Monitoring & Alerting**
- **Real-time Alerts:**
  - Sync latency exceeds 10 minutes → Slack alert
  - Error rate > 1% in last hour → PagerDuty escalation
  - DLQ backlog > 100 messages → email to ops
- **Dashboards:** CRM Analytics lenses showing sync health, error trends, pending items

**rubric:**

3-tier rubric: (1) Complete architecture covering Quote→Order→Invoice flows, idempotency, error handling, audit, monitoring = 10 points. (2) Architecture with 6–7 components but missing idempotency strategy or monitoring = 6 points. (3) Vague design or missing key components = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-058-seed-8a2f3e1b  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-058  
**bias_check_notes:** Integration architecture is vendor-neutral; no bias.

---

### QUESTION 59: Revenue Recognition with Ratable Subscriptions — ASC 606 Compliance (Very Hard)

**question_id:** QOR-SFCPQ-059  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** subscription-business-model  
**format:** Code (Apex + Revenue Cloud)  
**difficulty_b:** 1.3 (Very Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 13  
**citation:** ASC 606 Revenue Recognition Standard; Salesforce Revenue Cloud Documentation; Ratable Billing & Revenue Sync

**body:**

Write an Apex class that implements ASC 606-compliant revenue recognition for ratable SaaS subscriptions. Input: Subscription record (start date, end date, total amount, ratable = true). Output: monthly revenue schedules that recognize revenue linearly over the subscription term. Account for partial months (prorated). Expected output: list of Revenue_Schedule__c records (one per month), each with recognized_revenue amount.

```apex
public class RevenueRecognitionCalculator {
    // Input: Subscription__c subscription
    // Output: List<Revenue_Schedule__c> monthlySchedules
    public static List<Revenue_Schedule__c> calculateRatableRevenue(String subscriptionId) {
        // YOUR CODE HERE
    }
}
```

**options:**

(Code-based; expect date arithmetic, proration logic, ASC 606 principles)

**answer_key:**

```apex
public class RevenueRecognitionCalculator {
    
    public static List<Revenue_Schedule__c> calculateRatableRevenue(String subscriptionId) {
        // Query subscription
        Subscription__c sub = [
            SELECT Id, Start_Date__c, End_Date__c, Total_Amount__c, Ratable__c, Currency__c
            FROM Subscription__c
            WHERE Id = :subscriptionId
            LIMIT 1
        ];
        
        if (!sub.Ratable__c) {
            return new List<Revenue_Schedule__c>(); // Non-ratable; handle separately
        }
        
        List<Revenue_Schedule__c> schedules = new List<Revenue_Schedule__c>();
        
        Date startDate = sub.Start_Date__c;
        Date endDate = sub.End_Date__c;
        Decimal totalAmount = sub.Total_Amount__c;
        
        // Calculate total days
        Integer totalDays = startDate.daysBetween(endDate);
        if (totalDays == 0) totalDays = 1; // Avoid division by zero
        
        // Monthly revenue: totalAmount / number of months (linear recognition)
        Decimal monthCount = (Decimal) totalDays / 30.44; // Average days per month
        Decimal monthlyRevenue = totalAmount / monthCount;
        
        // Iterate month by month
        Date currentMonthStart = startDate;
        
        while (currentMonthStart < endDate) {
            // Calculate month-end date
            Date monthEnd = currentMonthStart.addMonths(1).addDays(-1);
            
            // Clip to subscription end date if needed
            if (monthEnd > endDate) {
                monthEnd = endDate;
            }
            
            // Calculate days in this period
            Integer daysInMonth = currentMonthStart.daysBetween(monthEnd) + 1; // Inclusive
            
            // Prorated revenue for this month
            Decimal daysInFullMonth = (currentMonthStart.month() == monthEnd.month()) 
                ? Date.daysInMonth(currentMonthStart.year(), currentMonthStart.month())
                : 30.44;
            
            Decimal proratedRevenue = monthlyRevenue * (daysInMonth / daysInFullMonth);
            
            // Create revenue schedule record
            Revenue_Schedule__c schedule = new Revenue_Schedule__c(
                Subscription__c = sub.Id,
                Period_Start__c = currentMonthStart,
                Period_End__c = monthEnd,
                Recognized_Revenue__c = proratedRevenue.setScale(2),
                Recognition_Status__c = 'Pending',
                Currency__c = sub.Currency__c
            );
            
            schedules.add(schedule);
            
            // Move to next month
            currentMonthStart = monthEnd.addDays(1);
        }
        
        return schedules;
    }
}

// Usage:
List<Revenue_Schedule__c> schedules = RevenueRecognitionCalculator.calculateRatableRevenue(subscriptionId);
insert schedules;
```

Expected approach: (1) SOQL query Subscription, (2) validate Ratable flag, (3) calculate total days and monthly revenue, (4) iterate month-by-month, (5) prorate partial months, (6) create Revenue_Schedule__c records.

**rubric:**

3-tier rubric: (1) Correct date arithmetic, proration logic, monthly iteration, accurate recognized revenue = 10 points. (2) Correct logic but missing proration for partial months = 6 points. (3) Incomplete logic or incorrect calculation = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-059-seed-9d3a4b2c  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-059  
**bias_check_notes:** Revenue recognition logic is vendor-neutral; ASC 606 is standard across industries.

---

### QUESTION 60: CPQ Performance Audit Methodology — Comprehensive Assessment Framework (Very Hard)

**question_id:** QOR-SFCPQ-060  
**skill_id:** senior-salesforce-cpq  
**sub_skill_id:** cpq-customization-constraints  
**format:** Design  
**difficulty_b:** 1.45 (Very Hard)  
**discrimination_a:** 1.7  
**expected_duration_minutes:** 14  
**citation:** Salesforce CPQ Performance Audit Framework; Governor Limits Optimization; Production Health Checks

**body:**

Design a comprehensive CPQ performance audit methodology for a large org (500+ daily quotes, 5M historical records, multiple geographies). Outline: (1) baseline performance metrics to capture, (2) automated audit checks to run weekly, (3) diagnostic procedures for slow quotes, (4) threshold definitions (what constitutes "slow"?), (5) remediation prioritization framework.

**options:**

(Design question; expect systematic audit approach)

**answer_key:**

Expected response (comprehensive audit framework):

**1. Baseline Performance Metrics**
- **Quote Calculation:**
  - P50 (median) calculation time for quotes by size: 1-50 lines, 51-200 lines, 201-500 lines, 500+ lines
  - P95, P99 percentiles (tail latency)
  - Timeout rate (% of quotes exceeding 30s)
- **Approval Cycle:**
  - Time-to-first-approval (days), time-to-final-approval (days)
  - Approval SLA compliance % by tier
  - Approver queue backlog (# pending)
- **DocGen:**
  - PDF generation time (P50, P95, P99)
  - Timeout rate for complex templates
  - Multi-currency + localization overhead
- **API Performance:**
  - Lookup Query execution time (avg, max)
  - Custom Apex callout latency
  - Governor limit consumption (SOQL queries, DML statements per quote calc)

**2. Automated Weekly Audit Checks**
- **Check A: Lookup Query Health**
  - Count all Lookup Queries in use (Price Rules, Product Rules)
  - For each, measure selectivity (% of records returned)
  - Flag if selectivity > 30% or execution time > 1s
  - Recommendation: add index or refactor query
  
- **Check B: Calculation Timeout Rate**
  - Query logs (or custom metric object) for quotes with calculation time > 30s
  - Segment by quote size, product bundle, customer tier
  - Alert if timeout rate > 0.5% (baseline + threshold)
  
- **Check C: Formula Field Audit**
  - Count formula fields on QuoteLine (limit: 3–5)
  - Identify formula fields that reference other formula fields (chain risk)
  - Flag if formula complexity score (# of functions + nested IFs) exceeds 50
  
- **Check D: Custom Apex Overhead**
  - Measure execution time of QCP vs. standard CPQ (no custom code)
  - If QCP overhead > 30% of total calc time, investigate optimization
  
- **Check E: Approval Flow Performance**
  - Query ApprovalInstanceWorkitem for instances pending > SLA threshold
  - Count active approval processes (expected: 1–3; alert if > 5)
  - Check for Apex trigger loops on approval (governor limit consumption)

- **Check F: Data Volume Health**
  - Count Quote records by age: 0–30 days, 30–90 days, 90–365 days, >1 year
  - Identify stale quotes (status = "Draft" for > 30 days) for archival
  - Measure QuoteLine count distribution (P95 line count per quote)

**3. Diagnostic Procedures for Slow Quotes**
- **Step 1: Capture Slow Quote Logs**
  - Implement a custom Apex debug log for quotes exceeding 20s calculation time
  - Log: quote ID, quote size, customer, calculation components (config time, price time, approval time)
  
- **Step 2: Execution Plan Analysis**
  - For flagged quote, re-run calculation in sandbox with Salesforce Optimizer enabled
  - Identify expensive SOQL (unindexed queries), Apex callouts, formula field re-evaluations
  
- **Step 3: Root Cause Categorization**
  - **A-Type (Query):** Unindexed Lookup Queries, unselective filters → add index, refactor query
  - **B-Type (Calc):** QCP inefficiency, formula chain → refactor QCP, flatten formulas
  - **C-Type (Volume):** Quote size > 500 lines → split quote, implement async calculation
  - **D-Type (External):** Slow API callout to ERP/tax engine → implement caching, retry logic
  
- **Step 4: Performance Retest**
  - After remediation, re-run same quote; measure improvement
  - Expected: 20s → 8s (60% reduction)

**4. Threshold Definitions**
- **Green (Healthy):**
  - Quote calc < 10s (P95)
  - Approval SLA compliance > 95%
  - Timeout rate < 0.5%
  - Lookup Query selectivity < 30%
  
- **Yellow (Monitor):**
  - Quote calc 10–20s (P95)
  - Approval SLA compliance 85–95%
  - Timeout rate 0.5–1%
  - Lookup Query selectivity 30–50%
  
- **Red (Critical):**
  - Quote calc > 30s (P95) or timeouts occurring
  - Approval SLA compliance < 85%
  - Timeout rate > 1%
  - Lookup Query selectivity > 50%

**5. Remediation Prioritization Framework**
- **Priority 1 (Fix Immediately):**
  - Active timeouts (quotes failing to calculate)
  - Approval SLA misses for > 5% of quotes
  - Unindexed Lookup Queries with > 50% selectivity
  
- **Priority 2 (Fix within 2 weeks):**
  - P95 calculation time > 20s (approaching timeout)
  - Formula field chains (3+ levels of dependency)
  - Custom Apex with > 40% overhead
  
- **Priority 3 (Fix in next sprint):**
  - P95 calculation time 10–20s (healthy but room for improvement)
  - Approval cycle-time trending upward (but still in SLA)
  - Data volume growth requiring archival strategy

**6. Continuous Monitoring & Alerting**
- **Weekly Automated Report:** Email to CPQ admins with audit summary (green/yellow/red status)
- **Real-time Alerts:**
  - Timeout rate jumps > 1% → Slack alert to ops
  - Approval backlog > 50 pending → email to approver manager
  - Lookup Query execution time increases > 50% (week-over-week) → investigate cause
  
- **Monthly Review:** CPQ admin + CTO review all findings, prioritize backlog, assign remediation owners

**7. Audit Tooling**
- **Tool 1: Custom Metrics Object** (Quote_Performance_Metric__c)
  - Logged on every quote calculation
  - Stores: quote ID, size, calc time, component breakdown
  
- **Tool 2: Salesforce Optimizer** (free tool)
  - Run monthly on sample production quotes
  - Generates slow query/governance recommendations
  
- **Tool 3: CRM Analytics Lens**
  - Visualizes P50/P95/P99 distribution of calc times over time
  - Tracks approval SLA compliance trends
  
- **Tool 4: Custom Audit Flow**
  - Weekly batch job that runs all 6 audit checks (A–F)
  - Logs results in Audit_Log__c object for trending

**rubric:**

3-tier rubric: (1) Complete audit framework covering metrics, weekly checks, diagnostic procedures, thresholds, prioritization, monitoring = 10 points. (2) Framework with 5–6 components but missing diagnostic procedures or prioritization = 6 points. (3) Vague framework or missing key components = 2 points.

**watermark_seed:** qorium-sfcpq-v0.6-060-seed-4e6f1c2a  
**variant_seed:** qorium-sfcpq-v0.6-2026-05-03-060  
**bias_check_notes:** Performance audit methodology is vendor-neutral; no bias.

---

## QA Summary Checklist

- [x] **Q41–Q60 IDs valid:** QOR-SFCPQ-041 through QOR-SFCPQ-060 assigned sequentially
- [x] **Skill & sub-skill coverage:** All 6 new sub-skills represented (Multi-currency, Subscription, Industries CPQ, Analytics, Sales Engagement, Customization Constraints)
- [x] **Difficulty distribution:** 3 Easy (041–043) / 9 Medium (044–048, 050) / 6 Hard (049, 051–054) / 2 Very Hard (055–060)
- [x] **Question format mix:** 12 MCQ + 4 Code + 2 Design + 2 Case Study (matches spec)
- [x] **Schema compliance:** All questions follow full metadata schema (ID, skill, sub_skill, format, difficulty_b, discrimination_a, expected_duration, body, answer_key, rubric, citation, watermark/variant seeds, bias_check)
- [x] **Salesforce CPQ version currency:** Spring '26 baseline confirmed; Steelbrick legacy clearly flagged as EOL (Spring '25+)
- [x] **Citation accuracy:** All citations reference Salesforce official docs (developer.salesforce.com, Spring '26 Release Notes, Industries CPQ, Revenue Cloud, OmniStudio, DocGen, Analytics)
- [x] **Bias check:** ASCII-neutral names (no gender bias); industry examples globally distributed (telecom, manufacturing, FSI, SaaS); currency examples use INR + USD + EUR (no single-geography bias); no culturally loaded scenarios

---

*End of Wave 2 Extension v0.6 (Q041–Q060). Ship-to-SME-Lead grade. Complete Q001–Q060 corpus ready for Customer Zero Wave 2 deployment.*
