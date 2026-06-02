# E3-alt — Bosch Sample Pack v0: Salesforce

**STATUS:** CTO-Office v0 outline. Alternate sample if Bosch GCC indicates Salesforce focus or for a different prospect (Bosch CRM is on Salesforce per E2 research). Final SME-Lead-validated version waits until SME Lead is hired (M2). This is the structural scaffold; question text + correct answers populated by AI pipeline + SME review for the actual sample pack.

---

## Role Profile

**Target Role:** Senior Salesforce Developer (5–8 years; Apex + LWC + Service Cloud + Commerce Cloud)

**Bosch GCC fit:** Per E2 research, Bosch hires 150–200 Salesforce developers annually (Commerce Cloud + Core CRM). Salesforce expertise gap is significant on assessment platforms; QOrium can differentiate.

---

## Question Mix Overview (50 questions)

| Category | Count | Format | Difficulty Mix |
|---|---|---|---|
| Apex Language | 5 | MCQ | 1E + 2M + 1H + 1X |
| SOQL / SOSL | 5 | MCQ | 1E + 2M + 1H + 1X |
| Lightning Web Components | 5 | MCQ | 1E + 2M + 1H + 1X |
| Salesforce Platform (Sharing) | 5 | MCQ | 1E + 2M + 1H + 1X |
| Integration (REST/SOAP/CDC) | 5 | MCQ | 1E + 2M + 1H + 1X |
| Service Cloud / Omni-Channel | 5 | MCQ | 1E + 2M + 1H + 1X |
| Apex Code Challenge (trigger, async, etc) | 10 | Code-Challenge | 2E + 4M + 3H + 1X |
| System Design (multi-org, architecture) | 5 | Design Q | 1E + 1M + 2H + 1X |
| Case Study / Debugging (governor limits, SOQL, etc) | 5 | Case Study | — + 2M + 2H + 1X |
| **Total** | **50** | **Balanced** | **10E + 21M + 14H + 5X** |

---

## Sub-Skill Breakdown: 30 MCQ (5 questions × 6 sub-skills)

### Sub-Skill 1: Apex Language (5 MCQ)

1. **Easy:** Apex variable types — primitive vs. sObject vs. collections
2. **Medium:** Governor limits — heap size, SOQL query limits, DML statements
3. **Medium:** Async patterns (future, Queueable, batch, scheduled) — use cases and governor isolation
4. **Hard:** Trigger order of execution — pre-insert, validation rules, after-insert, post-insert flow interactions
5. **Expert:** Apex metadata programming — dynamic SOQL, sObject field reflection, metadata API vs. tooling API

### Sub-Skill 2: SOQL / SOSL (5 MCQ)

1. **Easy:** SELECT statement basics — WHERE, ORDER BY, LIMIT syntax
2. **Medium:** Field-level security (FLS) and sharing rules enforcement — query filter impact
3. **Medium:** Relationship queries — child-to-parent (foreign key), parent-to-child (lookup aggregation)
4. **Hard:** SOQL selectivity — indexed fields, query performance optimization for 1M+ record databases
5. **Expert:** WITH SECURITY_ENFORCED clause — when required vs. when optional; SOSL full-text search with synonym groups

### Sub-Skill 3: Lightning Web Components (5 MCQ)

1. **Easy:** LWC lifecycle hooks — connectedCallback, renderedCallback timing
2. **Medium:** Lightning Data Service (LDS) — getRecord, updateRecord wire functions and caching
3. **Medium:** Wire adapters — custom adapters vs. platform (cloud resource adapters)
4. **Hard:** Event communication (custom events, pubsub) — child-to-parent, cross-component messaging
5. **Expert:** Performance optimization — lazy loading, shadow DOM isolation, bundling impact on app size

### Sub-Skill 4: Salesforce Platform / Sharing (5 MCQ)

1. **Easy:** OWD (Organization-Wide Default) — private, public read-only, public read/write, controlled by parent
2. **Medium:** Role hierarchy — how it grants data access beyond explicit sharing rules
3. **Medium:** Sharing rules (grant access, queue-based) — criteria-based sharing for dynamic groups
4. **Hard:** Custom sharing objects — manual share records and cascading effects
5. **Expert:** Multi-tenant security — encryption in Salesforce, high-scale sharing design (1B+ share records)

### Sub-Skill 5: Integration (REST/SOAP/CDC/Platform Events) (5 MCQ)

1. **Easy:** REST API endpoint syntax — `/services/data/v60.0/sobjects/Account`
2. **Medium:** Named credentials and OAuth2 authentication — JWT flow vs. user-password flow
3. **Medium:** Change Data Capture (CDC) — subscription-based data replication, event payload structure
4. **Hard:** Platform Events — publish-subscribe model; handling message ordering and at-least-once delivery
5. **Expert:** Integration architecture for 1000+ API calls/sec — batching, queue management, circuit breaker pattern

### Sub-Skill 6: Service Cloud / Omni-Channel (5 MCQ)

1. **Easy:** Case object basics — status, priority, resolution, SLA tracking
2. **Medium:** Knowledge management — linking articles to cases, self-service portal setup
3. **Medium:** Omni-Channel routing — queue assignment, presence statuses, agent concurrency
4. **Hard:** Einstein Bots — intent recognition, escalation to human agents, context passing
5. **Expert:** High-volume Service Cloud design (10K+ cases/day) — queue performance, message batching, chat concurrency limits

---

## Apex Code-Challenge Questions (10 questions; Apex sandbox via Judge0)

1. **Bulk-safe trigger with handler pattern:** Write trigger on Account; call handler class method. Avoid duplicate field updates; use maps for bulk operation. Syntax: Apex with sObject context variables (Trigger.new, Trigger.oldMap).

2. **Async + retry with Queueable chaining:** Implement Queueable that calls external API; catch failure and re-enqueue with exponential backoff. Chain up to 5 retries.

3. **SOQL pagination on 1M+ records:** Fetch 1M+ accounts in batches of 10K using offset-based pagination. Correct approach: use binding, avoid using OFFSET at scale.

4. **LWC parent-child reactive form with imperative Apex:** Create Account form (LWC); child component calls Apex method to validate duplicate, updates parent on success. Handle async response and error states.

5. **Platform Event publisher + subscriber:** Publish a Platform Event from trigger; separate class subscribes and updates related records. Handle message format and payload parsing.

6. **Custom REST endpoint with named credential auth:** @RestResource endpoint that accepts JSON payload, authenticates via named credential, and returns response. Syntax: Apex REST Annotations.

7. **Batch Apex with state passing + error handling:** Implement Batchable that processes 10K records in 200-record chunks, passes state between batches (e.g., checksum), and logs errors to custom log object.

8. **Test class achieving >85% coverage on bulk operation:** Write test for a bulk insert trigger (200+ records). Assert on correct field updates, avoid SOQL in loop, verify DML limits.

9. **CDC (Change Data Capture) subscriber processing 100+ records:** Implement event-based subscriber that listens for Account change events, processes 100+ changes per event, and persists audit records.

10. **SOQL Boolean logic with sharing + FLS check:** Write utility method that builds dynamic SOQL with AND/OR conditions, enforces FLS, applies sharing model. Input: field list + filter map.

---

## System Design Questions (5 questions; architecture essay/whiteboard)

1. **Multi-org strategy:** Design data sync between 3 Bosch Salesforce orgs (Germany, India, US). Challenges: timezone handling, duplicate record deduplication, eventual consistency.

2. **Service Cloud → MuleSoft → SAP integration:** Design high-volume call center (5K cases/day) that routes to SAP for order management. Message format, error handling, callback mechanism.

3. **Data model for B2B Commerce Cloud:** Bosch sells automotive parts to distributors. Schema: Account (with hierarchy), Product, Pricebook, Order. Sharing model for distributor visibility.

4. **Sharing design for India/EU multi-region:** Bosch has GDPR + local data residency requirements. Design sharing rules to ensure Indian users can't view EU customer data.

5. **Omni-Studio vs. Visualforce migration:** Bosch has legacy Visualforce pages for quoting. Migrate to Omni-Studio (OmniScript + Rulesets). Considerations: state management, rollback strategy.

---

## Case Study / Debugging Questions (5 questions; scenario analysis)

1. **Governor limit hit in bulk insert:** Scenario: Bulk insert of 10K accounts fails at record 8,000 with "UNABLE_TO_LOCK_ROW" or "HEAP_SIZE_EXCEEDED" error. Root cause analysis + remediation.

2. **Deadlock between batch and UI updates:** Scenario: Batch job updates Contact records simultaneously with a user bulk-updating the same records. Deadlock on Account sharing. Resolution strategy.

3. **Bulk API failures with specific syntax:** Scenario: Bulk API2 job fails on 5% of records with cryptic error "INVALID_FIELD" even though field exists and is accessible. Debugging approach (field type mismatch, picklist values, FLS).

4. **SOQL N+1 problem in LWC:** Scenario: LWC loads Account + 100 child Contacts. Code loops over Contacts, issuing SOQL per contact. Governor limit hit at Contact #150. Refactor using single query + grouping.

5. **Permission set vs. profile drift:** Scenario: User reports "unable to see field X" in a custom app. Investigation: field is visible in profile but permission set override has been applied, hiding it. Permission model debugging.

---

## Per-Question Metadata Schema

Each question includes:

```json
{
  "skill_id": "salesforce-apex-001",
  "sub_skill_id": "apex-lang-01",
  "difficulty": {
    "irt_b_parameter": -0.8,
    "expected_duration_sec": 60,
    "target_percentile": 0.35
  },
  "code_language": "Apex",
  "rubric": {
    "correct_answer": "...",
    "distractor_1": "...",
    "distractor_2": "...",
    "distractor_3": "..."
  },
  "citation": {
    "standard": "Salesforce Spring 2026 API",
    "reference": "REST API v60.0 docs",
    "year": 2026
  },
  "variant_seed": "bosch-sf-001-v1",
  "watermark_id": "bosch-sf-s001"
}
```

---

## Anti-Leak Considerations (Per SO-9)

- **24-hour rotation:** Questions tagged `bosch-sf-s001` rotated every 24 hours if detected on Trailhead forums, Salesforce Stack Exchange, or internal Bosch repositories.
- **Per-client variant generation:** Variant seed allows regeneration of similar-difficulty questions with different scenarios (different sObject names, different field names, different trigger logic) if original leaks.
- **Watermark embedded:** Each question has Bosch-specific watermark. Leaked questions are forensically attributed.
- **Original questions never delivered raw:** Only Bosch-branded, watermarked version delivered; QOrium retains clean master.

---

## IRT Calibration Plan

- **Pre-launch panel:** 25–30 Salesforce developers (Bosch India + Talpro) attempt all 50 questions.
- **3PL parameter estimation:** Psychometrician fits data; flags questions with poor discrimination or misaligned difficulty.
- **Revision gate:** Flagged questions edited or removed before customer deployment.

---

## Delivery Format

- **REST API:** `/v1/packs/{job_id}/salesforce?count=50&difficulty=balanced` returns JSON.
- **Bulk export:** Mettl CSV, JSON, XLSX.
- **iframe widget v1.1:** Drop-in for Bosch's assessment UI.

---

## Sample Pack QA Checklist (8 items)

Before release to Bosch:

- [ ] **No Salesforce feature misrepresentation** — LWC lifecycle, Apex governor limits, SOQL behavior all verified against Spring 2026 docs.
- [ ] **License-posture verified for Trailhead derivatives** — If any question structure inspired by Trailhead challenges, original authorship documented; no verbatim reproduction.
- [ ] **Health Cloud / FSC coverage clarity** — v0 covers standard Salesforce + Service Cloud. Financial Services Cloud (FSC) deferred to v1 unless Bosch explicitly requests.
- [ ] **Spring 2026 release-specific items vs. evergreen** — Questions avoid features in beta or unsupported in older Salesforce versions unless Bosch explicitly on Spring 2026+.
- [ ] **No leaked practice-test content** — Questions do not reproduce from Trailhead superbadge exams or public practice tests.
- [ ] **Rubric consistency:** Correct answer, plausible distractors.
- [ ] **Difficulty distribution sanity:** 10E:21M:14H:5X split matches IRT calibration.
- [ ] **Bosch Commerce Cloud coverage:** At least 5 questions specifically on Commerce Cloud (not just standard CRM) given Bosch's e-commerce focus.

---

## DRAFTING NOTES (5 items)

1. **SME Lead must validate:** AI pipeline drafts; SME Lead (hire M2) reviews and edits. No question ships without sign-off.

2. **License posture for Salesforce content:** Trailhead is Salesforce IP; avoid reproducing Trailhead challenges verbatim. Original-authored questions with independent scenarios are defensible.

3. **Health Cloud / FSC sub-domain decision:** Standard v0 covers Salesforce + Service Cloud. Health Cloud and Financial Services Cloud are specialized sub-domains; defer to v1 unless Bosch requests.

4. **Spring '26 release-specific items vs. evergreen:** Many features are evergreen (Apex, SOQL, LWC core concepts). New features (e.g., Agentforce) are not included in v0 unless Bosch explicitly requests.

5. **CRM vs. Commerce Cloud split:** Bosch is on both. v0 allocates: ~40% standard CRM (Accounts, Contacts, Opportunities), ~30% Service Cloud, ~30% Commerce Cloud. Adjust per Bosch input.

---

*End of E3-Bosch-Sample-Pack-v0-Salesforce.md. This is a structural scaffold; actual question text and answers populated by AI pipeline + SME review in M2 onward.*
