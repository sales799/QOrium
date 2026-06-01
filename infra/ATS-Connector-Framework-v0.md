# ATS Connector Framework v0

**For:** CTO Office, Bali (Sales)  
**Authority:** Constitution Article IX (Phase Gates), M9 Phase Gate explicit: "ATS integrations live (Greenhouse + Workday + Ashby + Darwinbox)"  
**Owner:** CTO Office, Sr. Engineer (integration lead Y1); Director of Integrations (Y2+)  
**Status:** v0 Framework Spec (implementation Phase 3, M6–M9)  
**Effective:** May 2026  

**Header:** Per Constitution Article IX M9 Phase Gate success criterion: **4 ATS go live (Greenhouse + Workday + Ashby + Darwinbox). v0 framework spec; v1 implementation Phase 3.**

---

## §1 Why ATS Connectors Matter: Adoption Friction Reduction

### 1.1 Competitive Reality

**Market expectation:** HackerRank, Mettl, Codility all offer 15–20+ ATS integrations out-of-the-box. Candidates lose purchase momentum if they must manually export QOrium scores + import to ATS.

**Customer friction:**
- Manual workflow: QOrium assessment complete → download CSV → upload to ATS → map fields → test integration → deploy. **4–5 business days, IT team involvement.**
- Native integration: Assessment complete → score auto-posted to ATS candidate profile. **5 minutes, no IT involvement.**

**ATS attachment value:** 70% of hiring teams live 8+ hours/day in ATS UI (Greenhouse, Workday, etc.). If QOrium lives inside ATS, it's "sticky" — switching cost is high.

### 1.2 Phase Gate Mandate

**Constitutional requirement:** M9 Phase Gate explicitly lists 4 ATS integrations as a go-live dependency. No ATS integrations = M9 gate fails.

**Why these 4?**
- **Greenhouse:** Market leader for growth-stage + mid-market (US-anchored). ~40% of US venture-backed companies.
- **Workday:** Enterprise standard (Fortune 500, large APAC enterprises). Bosch uses Workday.
- **Ashby:** Fastest-growing ATS among tech startups (Anthropic uses Ashby; competitive feature parity expected). High-growth segment.
- **Darwinbox:** India-anchored ATS (used by Tata Consultancy Services, Infosys, other Indian enterprises). Talpro Customer Zero + India-stack customer base alignment.

**Future ATSes (M9+ roadmap):** Lever, BambooHR, SuccessFactors (SAP), ICIMS, SmartRecruiters, Workable, Recruitee.

---

## §2 Connector Architecture: Hub-and-Spoke

### 2.1 System Design Principles

**Hub (QOrium source of truth):**
- QOrium API (`api.qorium.online`) holds assessments, candidates, results.
- Single canonical data source; connectors are thin adapters.
- No ATSes directly modify QOrium data (read-only from ATS perspective, with exceptions for webhook auth).

**Spoke (ATS adapters):**
- Each ATS connector implements standard interface: `SyncCandidates`, `SyncJobs`, `SyncAssessmentResults`, `AuthRefresh`.
- Adapters translate QOrium data model ↔ ATS data model.
- Bidirectional webhooks: ATS → QOrium (trigger assessments), QOrium → ATS (post scores).

### 2.2 Service Architecture

**Service name:** `qorium-ats-bridge`  
**Type:** PM2 cluster (future) / single process v0 (M6–M8).  
**Ports:** 5105–5110 (reserved range for integrations).  
**Code repo:** `/opt/qorium/services/ats-bridge/`.  
**Language:** TypeScript (Node.js).  
**Database:** PostgreSQL (shared with QOrium core).

### 2.3 Data Model: Universal Abstraction

**QOrium internal model (simplified):**
```typescript
interface Candidate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  externalId?: string; // ATS-provided ID for idempotency
  assessmentStatus: 'pending' | 'in_progress' | 'completed';
  assessmentScore: number;
  assessmentUrl: string;
  assessmentCompletedAt: ISO8601;
}

interface AssessmentResult {
  candidateId: string;
  assessmentId: string;
  score: number;
  timeSpentMs: number;
  answers: Record<string, any>;
  metadata: {
    atsPlatform: string;
    jobId: string;
    externalCandidateId: string;
  };
}
```

**ATS-specific adapters translate to/from this model:**
- Greenhouse candidate → QOrium candidate
- Workday candidate → QOrium candidate (field mapping per tenant)
- etc.

---

## §3 Per-ATS Specifics

### 3.1 Greenhouse (Harvest API)

**Market segment:** Growth-stage + mid-market (US, EU, APAC).

**API endpoints:**
- `GET /candidates` — list candidates for a job.
- `GET /candidates/{id}` — fetch candidate details.
- `PATCH /candidates/{id}` — update candidate (add custom fields with score, assessment URL).
- `GET /jobs` — list open jobs.
- Webhooks: `candidate.created`, `candidate.updated`, `job.opened`, etc.

**Authentication:** OAuth 2.0 (token + refresh token).

**Rate limits:** 50 requests/second (generous).

**Custom fields:** Greenhouse allows custom candidate field types. We create:
- `qorium_assessment_score` (number, read-only from Greenhouse; written by webhook).
- `qorium_assessment_url` (URL, clickable link to assessment or results).
- `qorium_assessment_status` (enum: pending, in_progress, completed).

**Webhook flow:**
1. Candidate added to job in Greenhouse.
2. Greenhouse fires `candidate.created` webhook → QOrium.
3. QOrium creates internal candidate record + generates assessment invite URL.
4. QOrium POSTs assessment URL back to Greenhouse via PATCH `/candidates/{id}` (updates `qorium_assessment_url` field).
5. Recruiter sees URL in Greenhouse; clicks → candidate takes assessment.
6. Assessment complete → QOrium fires webhook to Greenhouse (PATCH candidate with score).

**Idempotency:** Use Greenhouse `candidate.id` as external_id; replay-safe via uniqueness constraint.

### 3.2 Workday (REST + SOAP APIs)

**Market segment:** Enterprise (Fortune 500, large APAC enterprises). Bosch uses Workday.

**API complexity:** Workday is notoriously complex (enterprise permission model, multi-tenant security, tenant-specific configurations). 

**Endpoints (REST, if supported by tenant):**
- `GET /recruiting/v1/candidates` — list candidates.
- `POST /recruiting/v1/candidates/{id}/custom_fields` — add custom field values.
- Webhooks: Event subscriptions (tenant must enable; usually requires Workday admin approval).

**Authentication:** OAuth 2.0 (tenant-specific; may require Workday Instance URL + signing keys).

**Rate limits:** Negotiated per tenant contract; typically 100–1000 req/min.

**Custom fields:** Workday requires pre-configuration by tenant admin (in Workday Setup). QOrium must provide a setup guide:
1. In Workday, create custom field "QOrium Assessment Score" (type: number).
2. Grant QOrium integration user API permission to write this field.
3. Share tenant ID, client ID, client secret with QOrium.

**Webhook setup:** Tenant must enable Event Subscriptions + create subscription for "Candidate Hired" or custom events. More complex; plan 1–2 week setup per tenant.

**Certification:** Workday requires certification for production integrations (process: submit to Workday, they test, 4–12 week turnaround). **Critical path item: start Workday certification at M6 (3 months before M9 go-live).**

**Fallback (if REST unavailable):** Use Workday Recruiting Web Services (SOAP). Older API but widely supported. Library: `soap` (npm) or `zeep` (Python); adds complexity.

### 3.3 Ashby (REST API, Simple)

**Market segment:** Tech startups, high-growth companies (YC-backed). Anthropic uses Ashby; competitive feature parity expected.

**API endpoints:**
- `GET /candidates.list` — list candidates.
- `GET /candidates.retrieve` — fetch candidate.
- `PATCH /candidates.update` — update candidate (add custom fields, archive, etc.).
- `GET /jobs.list` — list jobs.
- Webhooks: Simple POST webhook support (register URL, Ashby sends JSON on events).

**Authentication:** API key (Bearer token).

**Rate limits:** 100 requests/minute (moderate; aggressive rate limiting acceptable for async workflows).

**Custom fields:** Ashby allows custom fields on candidate object (via API or UI setup). Create:
- `qorium_score` (number).
- `qorium_assessment_link` (URL).
- `qorium_status` (text enum).

**Webhook flow:** Simple and clean. Ashby fires webhook when candidate added to job → QOrium creates assessment → posts score back via PATCH.

**Idempotency:** Use Ashby `candidateId` as external_id.

**Ease:** Ashby has cleanest API; lowest integration complexity. Recommend starting with Ashby (M6) for framework validation before Workday complexity.

### 3.4 Darwinbox (REST API, India-Anchored)

**Market segment:** India enterprise + APAC (Tata Consultancy Services, Infosys, other GCCs).

**API endpoints:**
- `GET /v1/candidate` — list candidates.
- `POST /v1/candidate` — add custom field value.
- `GET /v1/job` — list jobs.
- Webhooks: Webhook support; registration via admin panel.

**Authentication:** API key (apiKey query parameter or header).

**Rate limits:** Varies by plan; typically 100–500 req/min. Negotiate with Darwinbox sales.

**Custom fields:** Configured via Darwinbox admin UI. Create fields:
- `qorium_assessment_score` (number).
- `qorium_assessment_url` (URL).

**Webhook flow:** Similar to Ashby (simple). Candidate added → assessment created → score posted back.

**Idempotency:** Use Darwinbox `candidateId` as external_id.

**Business rationale:** Darwinbox alignment with Talpro Customer Zero + India enterprise TAM. Native Darwinbox integration removes friction for Indian hiring teams (Wipro, TCS, ICICI, etc.).

---

## §4 Auth Model: Per-Tenant OAuth 2.0 + Secrets Vault

### 4.1 Multi-Tenant Auth Architecture

**Each ATS tenant (Bosch Greenhouse account, Bosch Workday account, ICICI Darwinbox account, etc.) requires:**
- OAuth 2.0 token (access + refresh).
- Tenant-specific settings (ATS URL, custom field mappings, webhook secret for signing).

**Storage:** Secrets in KMS-encrypted vault (per D3 spec, Talpro Secrets Protocol).

### 4.2 Auth Flow

**Setup (tenant admin via QOrium /admin/integrations UI):**
1. Tenant admin clicks "Connect Greenhouse" button.
2. QOrium redirects to Greenhouse OAuth authorize endpoint (scopes: `candidates:read`, `candidates:write`, `jobs:read`).
3. Greenhouse user authorizes → callback to QOrium with auth code.
4. QOrium exchanges code for tokens; stores tokens in vault (HMAC-SHA256 encrypted with tenant-specific key).
5. UI displays "Greenhouse connected ✓".

**Token refresh:** Nightly cron job checks token expiry; refreshes 30 days before expiry (per OAuth 2.0 best practice).

**Tenant isolation:** Each tenant has separate vault entry; no cross-tenant token leakage.

### 4.3 Webhook Signing

**For ATS → QOrium webhooks:**
- ATS provides webhook secret (Greenhouse: `signing_secret`; Ashby: `signing_secret`; Darwinbox: `webhook_secret`).
- QOrium stores secret in vault.
- On webhook receipt: compute HMAC-SHA256(payload, secret); compare to header signature.
- Reject if signature invalid (prevents spoofing).

---

## §5 Data Flow: Inbound + Outbound

### 5.1 Inbound: ATS → QOrium (Trigger Assessment)

**Sequence:**
1. **Event:** New candidate added to job in Greenhouse (or Workday, etc.).
2. **Webhook:** Greenhouse fires POST to `qorium-ats-bridge/webhooks/greenhouse/:tenantId` with candidate data.
3. **QOrium processing:**
   - Validate webhook signature.
   - Extract candidate email, name, job ID.
   - Query QOrium core API: does candidate already exist? (check via external_id).
   - If not: create candidate record in QOrium.
   - If yes: update candidate status.
4. **Assessment trigger:**
   - Generate assessment invite URL (unique per candidate + assessment pack).
   - Attach per-customer watermark variant (per SO-9 anti-leak rotation).
   - Store external_id = Greenhouse candidate ID (for idempotency).
5. **Webhook response back to ATS:**
   - POST to Greenhouse API: `PATCH /candidates/{id}` with custom field `qorium_assessment_url`.
   - Greenhouse recruiter sees clickable link in candidate profile.

**Latency target:** Webhook received → assessment link posted back = <2 minutes.

### 5.2 Outbound: QOrium → ATS (Post Score)

**Sequence:**
1. **Event:** Candidate completes assessment in QOrium.
2. **Result processing:**
   - QOrium core computes final score.
   - Queries metadata: which ATS? which tenant? which candidate external_id?
3. **ATS callback:**
   - POST to ATS webhook registered by tenant admin (e.g., `https://bosch-webhook.qorium.local/webhooks/assessment_complete`).
   - Payload: `{ candidateId: "ext_123", score: 87, url: "qorium.online/results/..." }`.
4. **ATS processing:**
   - Receives webhook.
   - Updates candidate record with score (via Greenhouse PATCH, Workday update, etc.).
   - Candidate profile in ATS shows score immediately.

**Latency target:** Assessment complete → score visible in ATS = <5 minutes.

---

## §6 Idempotency & Replay Safety

**Critical requirement:** If QOrium receives the same webhook twice (network retry), assessment must not be created twice.

**Mechanism:**
1. **External ID:** Store (tenantId, externalCandidateId) as unique constraint in `qorium_candidates` table.
2. **Idempotency Key:** Webhook includes `Idempotency-Key` header (UUID); store in `webhooks_log` table.
3. **Replay check:** On webhook arrival, check if Idempotency-Key already processed. If yes, return cached response (200 OK) without re-executing.

**Database constraint:**
```sql
ALTER TABLE qorium_candidates ADD CONSTRAINT 
  unique_external_candidate 
  UNIQUE (tenant_id, ats_platform, external_candidate_id);
```

---

## §7 Failure Modes & Degradation

### 7.1 ATS API Down

**Scenario:** Greenhouse API returns 503 Service Unavailable when posting score.

**Handling:**
1. **Exponential backoff:** Retry with jitter (e.g., 1s, 2s, 4s, 8s, 16s, 32s).
2. **Max retries:** 24 hours of retries; if still failing after 24h, escalate to tenant admin.
3. **Degraded mode:** Continue processing other assessments; mark this tenant's integration as "degraded" in admin UI.
4. **Admin alert:** Email to tenant admin + Slack #qorium-integrations: "Greenhouse integration for Bosch is experiencing delays. Scores will be posted when API recovers."

### 7.2 Permission Errors

**Scenario:** QOrium token lacks `candidates:write` scope; Greenhouse rejects PATCH request with 403 Forbidden.

**Handling:**
1. **Detect:** Log 403 error to `integration_errors` table.
2. **Alert:** Email tenant admin: "Greenhouse integration requires re-authorization. Click here to reconnect."
3. **Degraded mode:** Flag integration as "auth_required"; don't attempt further API calls.
4. **Self-service:** Provide /admin/integrations button to re-authorize without code changes.

### 7.3 Schema Drift

**Scenario:** ATS vendor releases new API version; old custom fields deprecated; new fields required.

**Handling:**
1. **Quarterly compatibility review:** CTO Office reviews ATS release notes (Q1, Q2, Q3, Q4).
2. **Impact assessment:** Document breaking changes.
3. **Deployment plan:** For non-breaking changes (new optional fields), deploy passively. For breaking changes (deprecated fields), coordinate tenant migration (e.g., "Please update to Greenhouse API v1.5 by date X").
4. **Notification:** Send 60-day notice to all affected tenants.

---

## §8 Rollout Sequence: Phase 3 M6–M9

### 8.1 M6: Greenhouse (Easiest, Clearest API)

**Rationale:** Greenhouse has the cleanest API, most generous rate limits, and large US-market TAM. Validate framework design.

**Deliverables:**
- Greenhouse connector fully implemented + staging tested.
- Webhook inbound/outbound tested end-to-end.
- Idempotency validation (replay safety).
- Error handling (API down, auth errors).

**Internal testing:** Use QOrium internal Greenhouse account (test workspace) for validation.

**Launch:** Limited early access to 2–3 Greenhouse customers (partner companies comfortable with beta integrations).

### 8.2 M7: Ashby (Simple API, Startup Segment)

**Rationale:** Second simplest API; validates framework generalization. Reach high-growth startup segment.

**Deliverables:**
- Ashby connector.
- Webhook integration.
- Error handling.

**Reuse:** Leverage Greenhouse framework; Ashby is simpler (less config needed).

**Launch:** Early access to 3–5 Ashby users.

### 8.3 M8: Darwinbox (India Market Alignment)

**Rationale:** Support India enterprise segment; align with Talpro Customer Zero + India-stack content roadmap.

**Deliverables:**
- Darwinbox connector.
- API key auth (simpler than OAuth; check Darwinbox docs).
- Webhook integration.

**Parallel:** Outreach Bali to 2–3 India enterprise customers (TCS, Infosys GCC) for beta access.

**Launch:** Early access to 2–3 Darwinbox users.

### 8.4 M9: Workday (Most Complex, Enterprise Crown Jewel)

**Rationale:** Enterprise customers expect Workday. Late-stage positioning (after framework proven).

**Complexity:** Workday requires:
- Certification process (4–12 weeks).
- Multi-tenant config per tenant.
- SOAP API integration (fallback if REST unavailable).
- Signing keys + security configuration.

**Timeline critical:** Start Workday certification at M6 (immediately after Greenhouse) to complete by M9.

**Deliverables:**
- Workday connector (REST or SOAP).
- Certification package submitted to Workday.
- Admin setup guide for tenants.
- Error handling (complex permission model).

**Launch:** Production go-live at M9 (assuming certification completes).

---

## §9 Customer Experience

### 9.1 Self-Service Connector Setup

**Tenant admin UI:** `/admin/integrations/`

**Flow:**
1. Admin clicks "Add Integration."
2. Selects ATS type from dropdown: Greenhouse, Workday, Ashby, Darwinbox.
3. Clicks "Authenticate" → redirected to ATS OAuth (or pastes API key for Darwinbox).
4. Returns to QOrium; displays "Connected ✓" + setup instructions.
5. Admin optionally maps custom fields (if needed for their ATS).
6. Toggles "Enable sync" → integration is live.

**Support:** In-app help text + `/docs/integrations/[ats-name]` setup guide per ATS.

### 9.2 Sandbox Environment

**Purpose:** Tenants can test integration without affecting production hiring flow.

**Setup:** QOrium provides sandbox API endpoint + sandbox Greenhouse/Workday/Ashby account.

**Workflow:**
1. Admin enables "Sandbox mode" on integration.
2. All webhooks are routed to sandbox database.
3. Assessments are created but marked `sandbox: true`; don't count toward billing.
4. Admin tests with dummy candidate data.
5. Flips to production when ready.

### 9.3 Monitoring + Sync Status Dashboard

**Per-integration dashboard:**
- Last sync timestamp.
- Webhook receive/process metrics (events/hour).
- Error count + recent error log.
- Custom field mappings (if tenant configured).
- Integration health (green / yellow / red).

**Alerts:**
- Red: integration down / auth failing → email admin.
- Yellow: error rate spike (e.g., 5% of webhooks failing) → notify.

---

## §10 Cost Envelope: ATS Integrations

**Engineering:** 4 ATSes × 1 Sr. Engineer + 1 Frontend Eng per ATS = 1 month each = 4 person-months total.

**Breakdown per ATS:**
- **M6 Greenhouse:** 1 month, 2 engineers (Sr. Eng + FE) = 1 person-month.
- **M7 Ashby:** 0.75 months (reuse framework).
- **M8 Darwinbox:** 0.75 months (simpler).
- **M9 Workday:** 1.5 months (complexity: multi-tenant, certification, signing keys).
- **Total:** 4 person-months.

**Cost:** 4 person-months × ₹15L/person-month (Sr. Eng salary fully loaded) = ₹60L (~$72K USD). **High investment but justifiable for M9 Phase Gate dependency.**

**Infrastructure:** Marginal — included in Phase 3 VPS ops cost.

**API costs:** Most ATSes don't charge for integrations (they're sold as part of platform). Estimate $0–500/month total.

---

## §11 Future ATSes (M9+ Roadmap)

**Priority order (post M9):**
1. **Lever** — strong #2 after Greenhouse in US growth-stage market. API similar to Greenhouse.
2. **BambooHR** — small business segment; simple API.
3. **SuccessFactors** (SAP) — enterprise (SAP customers). Likely complex; may require SAP partnership.
4. **ICIMS** — enterprise legacy; still widely used. Lower priority.
5. **SmartRecruiters** — mid-market; growing.
6. **Workable** — EU-anchored; popular in Europe.
7. **Recruitee** — EU startup; niche.

**Estimation:** 1 new ATS connector per 2–3 months post-M9. Full coverage (10+ ATSes) achievable by M12 Year 2.

---

## §12 Anti-Leak Engine Integration (SO-9)

**Critical requirement:** ATS-delivered assessment links MUST use per-candidate per-tenant variant + watermark.

**Flow:**
1. Candidate clicks Greenhouse assessment link.
2. QOrium route handler receives request with parameters: candidateId, tenantId, jobId.
3. **Watermark seed:** Compute HMAC(tenantId, candidateId, question_id, "watermark") per SO-9 spec.
4. **Variant selection:** For each question in assessment, fetch variant with matching watermark_seed.
5. **Serve variant:** Candidate sees watermarked variant (e.g., variable names with suffix `_7f`, test values +5%, comment style swapped).
6. **Response storage:** Log response + watermark_id in audit log (for forensics if variant leaks).

**Anti-leak constraints:** ATS connector cannot bypass anti-leak engine. Assessment invite URLs include tenant-specific signing key; webhook callbacks verify integrity.

---

## §13 Compliance & Security

### 13.1 Data Residency

**India-anchored ATS data:** When tenant is in India (Darwinbox account, India operations), assessment responses and candidate PII are stored in India data centers only (Hostinger Bengaluru VPS, per Phase 1 infrastructure).

**Global ATS data:** Greenhouse (US-anchored), Workday (enterprise global), Ashby (US-anchored) may have global data residency requirements. Document per ATS + customer contract.

### 13.2 SOC 2 / ISO Posture

**Requirement:** ATS connectors must maintain SOC 2 Type II / ISO 27001 alignment (per Gatekeeper Quality Gate).

**Scope:**
- Secrets vault encryption (KMS).
- Webhook signature validation.
- Audit logging of all ATS API calls (no PII logged; only IDs + events).
- Rate limiting + DDoS protection.
- TLS 1.3 for all ATS API communications.

### 13.3 DPA (Data Processing Agreement)

**Per A7 DPA addendum:** When QOrium acts as processor (storing candidate responses per ATS tenant request), sign DPA covering:
- Data location (India vs. global).
- Sub-processors (Anthropic, Cloudflare, AWS, ATS vendor itself).
- Data deletion timelines (default: 30 days post-decision; extended if needed per customer).

**ATS-specific:** Each ATS may require its own addendum (e.g., Workday DPA + QOrium sub-processor disclosure).

---

## §14 Implementation Roadmap

| Milestone | Phase | Owner | Target |
|---|---|---|---|
| **Greenhouse API design + implementation start** | M5–M6 | Sr. Eng | May 30, 2026 |
| **Greenhouse staging tests + error handling** | M6 | Sr. Eng + QA | June 15, 2026 |
| **Greenhouse production launch (early access 2–3 customers)** | M6 end | Sr. Eng | June 30, 2026 |
| **Ashby connector + tests** | M7 | Sr. Eng | July 31, 2026 |
| **Darwinbox connector + India outreach** | M8 | Sr. Eng | August 31, 2026 |
| **Workday certification package submitted to Workday** | M6 | Sr. Eng + Bali | June 30, 2026 |
| **Workday certification (4–12 week wait from Workday)** | M6–M9 | Workday (external) | August–September 2026 |
| **Workday connector implementation (parallel to certification)** | M8–M9 | Sr. Eng | August 31, 2026 |
| **Workday production launch** | M9 | Sr. Eng + Bali | September 30, 2026 |
| **M9 Phase Gate: All 4 ATSes live** | M9 | CTO + Bali | September 30, 2026 |

---

## Drafting Notes & Risk Flags

1. **Workday certification timeline:** Workday certification is the critical path. Must submit at M6 start; allow 8–12 weeks for Workday review. If certification blocked/delayed, M9 go-live at risk. Mitigation: engage Workday partner/ISV relations early (M4) to expedite review.

2. **API versioning drift:** Each ATS releases new API versions annually. Plan quarterly compatibility reviews + tenant migration windows. Document breaking changes in `/docs/ats-changelog.md`.

3. **Multi-tenant complexity:** Workday's per-tenant config is a support burden. Plan in-app setup wizard + customer success team support (M9+ hire for this).

4. **Ashby + Anthropic competition:** Anthropic uses Ashby; they may have competitive feature parity expectations. Plan early partnership discussion (M5) with Ashby to ensure QOrium integration is prioritized in their roadmap.

5. **Darwinbox partnership opportunity:** Darwinbox + TCS/Infosys GCC overlap is significant. Consider revenue-share partnership or exclusive integration channel (M7 negotiation).

---

**Version:** v0  
**Effective:** May 2026  
**Phase Gate M9:** Success criterion = all 4 ATSes live + verified with ≥1 production customer per ATS.
