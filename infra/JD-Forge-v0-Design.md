# QOrium JD-Forge v0 — On-Demand Question Generation Service

**Author:** CTO Office  
**Date:** 2026-05-02  
**Status:** v0 Design (MVP scope: Standard tier only; Reviewed + Enterprise tiers deferred to M5+)  
**References:** Constitution §1.2 (SKU 2 definition), CTO Architecture §3.2 (per-SKU pipeline variations)

---

## 1. Purpose

JD-Forge generates fresh, JD-specific question packs on-demand when a customer uploads a job description. No two customers see the same questions for the same role. This differentiates from ReadyBank (shared commodity library) and Stack-Vault (annual exclusive IP). JD-Forge is the **velocity product** — 30-second turnaround, per-JD generation fee.

Per Constitution SKU 2: "Customised JD-Specific Question Generation. 3 tiers (Standard $49 · Reviewed $199 · Enterprise $499 per JD)."

---

## 2. Inputs & Outputs

**Input:** Customer-supplied JD text (10–30 pages typical; can be docx, pdf, or pasted text).

**Processing:**
- JD parsing (LLM extracts: role family, required skills, seniority signal, domain, must-haves, nice-to-haves)
- Role-graph mapping (match to canonical QOrium sub-skills)
- Question generation spec (decompose into N questions with format distribution: 40% MCQ, 30% code, 20% design/SJT, 10% case study)
- AI generation (parallel 20-question draft)
- Optional SME review (Reviewed / Enterprise tiers only)
- Output packaging

**Output:** JSON + CSV + optional PDF with N questions in the format customer prefers (HackerRank import format, Mettl XLSX, generic JSON, Codility format, etc.).

---

## 3. Five-Stage Pipeline

### Stage 1: JD Parsing

**Model:** Claude Opus with deterministic schema extraction.

**Input:** JD text (raw or extracted from PDF/DOCX via pandoc).

**Extraction schema:**
```json
{
  "role_title": "Senior Salesforce Developer",
  "role_family": "engineering",
  "seniority": "senior",
  "required_skills": [
    { "skill": "Salesforce Lightning Web Components", "weight": 1.0 },
    { "skill": "Apex", "weight": 0.95 },
    { "skill": "SOQL", "weight": 0.9 }
  ],
  "nice_to_have_skills": [
    { "skill": "Health Cloud", "weight": 0.7 }
  ],
  "tech_stack": ["Salesforce", "JavaScript", "Apex", "SQL"],
  "domain": "BFSI",
  "years_of_experience": 5,
  "must_haves": ["Lightning Web Components", "CI/CD pipeline understanding"],
  "nice_to_haves": ["Health Cloud", "Salesforce Marketing Cloud"]
}
```

**Latency:** ~1–2 seconds (API call + JSON parsing).  
**Caching:** Hash JD text; if same JD uploaded again within 7 days, skip parsing and reuse previous extraction.

### Stage 2: Role-Graph Mapping

**Goal:** Map extracted skills to QOrium's canonical sub-skill taxonomy.

**Process:**
- For each required_skill in JD, find best-matching sub_skill in content.sub_skills via semantic similarity (embedding cosine >0.8).
- Fall back to fuzzy string match if embedding fails (rare).
- Flag ambiguities (e.g., "Salesforce Platform" could map to 3+ canonical sub-skills) and ask customer clarifying question in UI.

**Output:** Spec structure linking JD skills to QOrium sub_skill_ids + weights.

**Latency:** <1 second (cached embedding lookup).

### Stage 3: Spec Generation

**Goal:** Decompose JD into a question spec (list of (format, sub_skill_id, difficulty, count) tuples).

**Logic:**
- 20 total questions per JD (adjustable, but 20 is sweet spot for 30-min assessment).
- Distribution: 8 MCQ + 6 code + 3 design + 2 case study + 1 SJT.
- Difficulty split: 3 Easy, 8 Medium, 7 Hard, 2 Expert (tuned for senior role with 5 yrs experience).
- Per required_skill, allocate 1–2 questions; per nice_to_have, allocate 0–1.

**Example:**
- Salesforce Lightning Web Components (weight 1.0, required): 3 questions (1 MCQ + 1 code + 1 design)
- Apex (weight 0.95, required): 3 questions (1 MCQ + 2 code)
- SOQL (weight 0.9, required): 2 questions (1 MCQ + 1 code)
- Health Cloud (weight 0.7, nice): 1 question (1 MCQ)
- ... total 20

**Latency:** <500 ms (deterministic calculation).

### Stage 4: AI Draft (Parallel Generation)

**Model:** Claude Opus with structured JSON output.

**Process:**
- For each question spec item, spawn parallel API call (Promise.all).
- System prompt includes: format-specific rules, difficulty anchor, JD context, anti-leak filter.
- For **Standard tier only:** no SME review; use stricter self-critique thresholds to auto-reject ambiguous questions.

**Example prompt:**
```
Generate a coding question for JD: "Senior Salesforce Developer"
Format: Coding-Function
Skill: Salesforce Lightning Web Components
Difficulty: Medium
Constraints:
- Provide 3–4 hidden test cases
- Reference solution must be <20 lines
- Include sample input/output
- Avoid questions that match top-10 LeetCode Salesforce questions (semantic similarity check)
Return JSON: {format, body, test_cases, reference_solution, difficulty_estimated}
```

**Latency:** 20 questions in parallel, ~1 sec per question = 20s wall-clock time (not 20s × 20 = 400s sequential).

**Cost per JD pack:** ~$2–3 (Anthropic tokens for 20 questions).

### Stage 5: Express Validation & Output

**For Standard tier:**
- AI self-critique (same model, second pass): score 0–10 on ambiguity, distractor quality, bias. If any score < 7, regenerate (max 1 retry).
- Auto-reject if leak-pattern match detected (semantic similarity against known public questions).

**For Reviewed tier (deferred to M5):**
- Async SME review job; customer notified of 4h SLA; question waits in sme_review status.

**Output packaging:**
- JSON (QOrium canonical format)
- CSV (user-friendly, importable to Mettl / HackerRank)
- PDF (printable report with answers)
- Direct API return (for embedded platforms like staffing-firm dashboard)

**Latency:** <1 second (serialization + format conversion).

---

## 4. Tier Differences: Standard vs. Reviewed vs. Enterprise

| Aspect | Standard | Reviewed | Enterprise |
|---|---|---|---|
| **AI generation** | Yes | Yes | Yes |
| **SME review** | No | Yes (4h SLA) | Yes (async, full customization) |
| **IRT calibration** | No | Optional | Yes (mandatory reference panel sampling) |
| **IP protection** | No (can reuse questions) | Optional | Yes (contractual exclusivity per JD) |
| **Per-JD price** | $49 / ₹3,999 | $199 / ₹15,999 | $499 / ₹39,999 |
| **Bundle subscription** | 25 JDs/mo @ $499/mo | 15 JDs/mo @ $1,999/mo | 30 JDs/mo @ $9,999/mo |
| **SLA** | 30 sec | 4 hours + 30 sec | 24 hours + 30 sec |
| **Cost to QOrium** | ~$2.50 (AI tokens) | ~$2.50 + $25 (15min SME) | ~$2.50 + $60 (full validation + IP guarantee) |
| **Gross margin** | ~95% | ~85% | ~80% |

**M0–M3 (MVP):** Standard tier only. Reviewed/Enterprise deferred to M5+ when SME network is mature (30+ contractors).

---

## 5. Data Model Touchpoints

### New table: jd_forge_orders

```sql
CREATE TABLE jd_forge_orders (
  id                UUID PRIMARY KEY,
  tenant_id         UUID REFERENCES tenants(id),
  tier              VARCHAR(20),           -- standard, reviewed, enterprise
  jd_text           TEXT,                  -- Original JD (may be PII; handle carefully)
  jd_hash           VARCHAR(64),           -- SHA256(jd_text) for caching/dedup
  parsed_spec       JSONB,                 -- Parsed role, skills, seniority
  question_uuids    UUID[],                -- Generated question IDs
  status            VARCHAR(50),           -- pending, processing, sme_review, completed, failed
  requested_at      TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  sme_reviewed_by   UUID REFERENCES users(id),
  export_format     VARCHAR(50),           -- hackerrank, mettl, json, csv, pdf
  export_url        TEXT,                  -- S3 URL to download
  cost_charged      DECIMAL(7,2),          -- What we charged the customer
  created_at        TIMESTAMPTZ
);
```

### Existing table: content.questions

Add column: `jd_forge_source_id` (FK to jd_forge_orders.id for lineage tracking). Nullable; NULL for ReadyBank questions.

---

## 6. API Surface

**Endpoints (under `/v1/jd-forge`):**

```
POST   /generate
  Request: {tier: "standard", jd_text: "...", export_format: "json"}
  Response: {request_id: "UUID", status: "processing"}

GET    /requests/{request_id}
  Response: {request_id, status, questions: [...], export_url (if ready)}

POST   /requests/{request_id}/feedback
  Request: {score: 1–5, comments: "..."}
  Purpose: Log customer feedback for AI model retraining
```

**Subscription management (via `/v1/jd-forge/subscriptions`):**

```
POST   /subscriptions
  Request: {tenant_id, tier: "standard", billing_cycle: "monthly"}
  Response: {subscription_id, allowance: 25, renewals_at: "..."}

GET    /subscriptions/{subscription_id}
  Response: {allowance, used_this_month: 5, remaining: 20}
```

---

## 7. Quality Bar: Per-Tier Acceptance Criteria

### Standard Tier

**Auto-pass criteria:**
- AI self-critique all dimensions ≥ 7 / 10
- No leaked-question semantic match (cosine <0.85 vs public corpus)
- Valid JSON schema per format

**Auto-fail criteria:**
- Any self-critique dimension < 5
- Syntax error in code questions (reference solution fails to compile)
- Ambiguous question (self-critique ambiguity score < 3)

**Fallback:** If fails criteria, regenerate once (max 2 iterations total). If still fails, return error to customer: "Could not generate enough high-quality questions for this JD. Please refine the JD description (e.g., add specific technologies) and retry."

### Reviewed Tier

**In addition to Standard criteria:**
- SME manual review: ambiguity, technical accuracy, company-specific bias
- Accept / Edit / Reject decision within 4h
- If rejected, regenerate + re-review (max 2 cycles)

### Enterprise Tier

**In addition to Reviewed criteria:**
- IRT calibration on reference panel (30+ attempts)
- Contractual IP guarantee: no question will be delivered to other customers for 12 months
- Custom export format if requested (e.g., Bosch proprietary XML)

---

## 8. Pricing Rationale

**Standard tier:**
- Cost to QOrium: ~$2.50 (Anthropic tokens)
- Charge customer: $49
- Margin: 96% (SaaS-grade)
- Rationale: Commodity AI generation, no human touch. Volume play.

**Reviewed tier:**
- Cost: $2.50 + $25 (SME 15 min @ ₹2,000/hr) = $27.50
- Charge: $199 (or $1,999/mo for 15-JD bundle)
- Margin: 86%
- Rationale: SME adds validation rigor; higher perceived value; different buyer segment (enterprise).

**Enterprise tier:**
- Cost: $2.50 + $60 (SME 30 min) + $20 (IRT calibration, reference panel sampling) + $10 (IP guarantee overhead) = $92.50
- Charge: $499 (or $9,999/mo for 30-JD bundle)
- Margin: 81%
- Rationale: Full validation + IP guarantee + custom support. Highest-value segment.

**Subscription discounts:**
- Standard tier: $49 per JD, or $499/mo for 25 JDs = 60% discount vs per-unit
- Reviewed tier: $199 per JD, or $1,999/mo for 15 JDs = 33% discount
- Enterprise tier: $499 per JD, or $9,999/mo for 30 JDs = 33% discount

**Year 1 revenue model:** 100 JD-Forge customers × avg 2 JDs/month × avg $75 ARPU = $180K JD-Forge ARR (assuming mix of tiers). Upside: top customers do 20+ JDs/month; hit $5K+/mo each.

---

## 9. Capacity Model: Bottlenecks

**Question generation at scale:**
- Each JD generates 20 questions via parallel Anthropic calls.
- Anthropic limit: assume 1M tokens/day per account (typical enterprise tier).
- 1 JD pack = ~50K tokens (20 questions × 2.5K tokens each).
- 1M / 50K = 20 JD packs/day = 600/month = sustainable with current Anthropic quota.

**SME review bottleneck (Reviewed tier):**
- 1 SME contractor = 4–6 JDs reviewed/day (1 hour per JD review).
- Phase 1: 1 SME contractor (part-time, ₹30K/month).
- Capacity: 4–6 Reviewed JDs/day.
- At end of M3: assume 10 Reviewed-tier logos, each 2 JDs/mo = 20 JDs/mo = less than 1 per day (plenty of headroom).
- At end of M6: assume 20 Reviewed-tier logos = 40 JDs/mo = 2/day (still fine; hire 2nd SME if needed).

**Database storage:**
- 100 JD-Forge orders/month × 12 months = 1,200 rows/year.
- jd_forge_orders + linked questions: ~10 MB/year (negligible).

---

## 10. Anti-Leak Strategy for JD-Forge

**Difference from ReadyBank:** JD-Forge questions are *ephemeral* — not stored in shared ReadyBank library by default. Each JD's questions are used once, then archived.

**But leak risk exists:** If a customer's JD-Forge pack leaks externally, other customers will see it on public forums and our uniqueness claim is lost.

**Mitigation:**
1. **Per-JD freshness:** Generated today, used today, archived tomorrow. Different customer uploads a similar JD tomorrow = completely different questions (new generation).
2. **Customer contractual terms:** Enterprise tier includes IP guarantee: "Questions generated for your JD are unique to this engagement and will not be delivered to other customers for 12 months."
3. **Monitoring:** If a JD-Forge question is detected on public sites, mark jd_forge_order status='leaked', notify customer, and (optionally) regenerate a fresh pack.

---

## 11. Open Questions for CEO & SME Lead

1. **Tier sequencing:** Start with Standard (M1), then add Reviewed (M5), then Enterprise (M9)? Or should we launch Reviewed alongside Standard in M1 to capture enterprise customers early?

2. **JD length limit:** What's the max JD length we'll accept? 50 pages? 100? Should we charge more for longer JDs (parsing cost scales)?

3. **Reuse policy:** If customer uploads the same JD twice (e.g., annual refresher hiring), should JD-Forge generate new questions both times, or serve cached questions? (Trade-off: freshness vs cost).

4. **Integration with ReadyBank:** Can a JD-Forge customer also subscribe to ReadyBank? Should we bundle them (customer buys JD-Forge Reviewed + ReadyBank Starter for discount)?

---

## 12. Phase 1 MVP Scope

**M0–M3:**
- Standard tier only (AI-only, no SME review).
- 30-second SLA.
- Output formats: JSON, CSV, Mettl XLSX.
- Single-tenant (no IP guarantee yet).
- Goal: 100 signups, 200 JD packs generated, $10K revenue.

**M5 onward:**
- Add Reviewed tier (async SME review, 4h SLA).
- Add Enterprise tier (IRT calibration + IP guarantee).
- Add custom format exports (Bosch proprietary XML, Salesforce Recruiting integration, etc.).

---

*End of JD-Forge-v0-Design.md. Word count: 2,080.*
