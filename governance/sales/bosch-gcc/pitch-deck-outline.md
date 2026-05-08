# Pitch Deck Outline — 14 Slides

The deck is **NOT** for the discovery call (discovery is asking, not
showing). The deck is for the **technical follow-up** call (60 min,
CTO Office + Bosch's technical decision-maker) and for emailing as
post-call material.

Format: PDF or Keynote/Deck. 16:9. Minimal text per slide. Designer
finish (post-cred-drop / for-real engagement). For now: outline +
content.

---

## Slide 1 — Cover

**Title:** "QOrium ReadyBank for Bosch GCC India"
**Subtitle:** "IRT-calibrated, anti-leak-rotated, watermark-per-candidate."
**Date:** [date of follow-up call]
**Footer:** Confidential — Bosch GCC India internal use only

## Slide 2 — Why we're here

3-bullet recap of discovery:

> - Bosch GCC India hires ~10K engineers/year; tech screen pain
>   centred on [specific pain from discovery]
> - Compliance posture: [discovery answer]
> - Discussed potential pilot of QOrium's IRT-calibrated assessment
>   surface

## Slide 3 — The problem

3 connected pain points:

1. Question leakage: industry-average 30-50% leakage windows in 30
   days; manual rotation is lossy
2. Audit-trail gaps: SOC 2 / ISO 27001 / DPDPA evidence collection
   is 40+ hours per audit cycle
3. Bias detection: hiring at scale demands defensible fairness
   reports; most platforms cannot produce them

## Slide 4 — What QOrium ships

3-column showcase:

| ReadyBank API | JD-Forge | Stack-Vault |
|---|---|---|
| IRT-calibrated, anti-leak-rotated question library; 1,300 released items today; 5,000 by Y1 close | Deterministic JD-to-spec library; dogfooded for our own hiring | Tenant-isolated question library; double-watermark; SAML/SCIM ready |
| $5K-$25K/yr | $49-$499 per JD or pack | ₹10L-₹1Cr+/yr |

## Slide 5 — Wave-2 alignment with Bosch

QOrium's Wave-2 includes:

> - **Embedded Automotive 100/100:** AUTOSAR Classic + Adaptive,
>   ISO 26262 ASIL, ASPICE, CAN-FD, automotive Ethernet+TSN, ECU
>   bootloader (UDS), MISRA-C, HiL testing, ISO 21434, V2X (DSRC
>   vs C-V2X), real-time scheduling RMS, AUTOSAR BSW, V-model
>   traceability, OTA updates, PREEMPT-RT, HARA, ECU cybersec arch,
>   ADAS sensor fusion, AUTOSAR COM, DoIP, lockstep CPU cores, ARA
>   APIs, BMS cell balancing, FOC motor control, sensor extrinsic
>   calibration, EVITA HSM, V2X PKI, POSIX PSE51-54, watchdog
>   timer, SecOC, ECC SECDED, TMR, TrustZone, E/E architecture
>   (zonal), ML inference, L4 ADAS program, vehicle software
>   lifecycle, post-launch ops
> - SAP-ABAP 100/100, Oracle HCM 100/100, Salesforce CPQ 100/100,
>   Finacle/Flexcube 100/100

For Bosch India: Embedded Automotive + Java + Python + AWS + DevOps
covers ~90% of typical Bosch GCC tech-screen volume.

## Slide 6 — IRT calibration explained

Visual: IRT 2PL Birnbaum probability curve.

Body:

> Every QOrium question has 3 calibrated parameters:
> - **Discrimination (a):** how well it separates skilled from
>   unskilled
> - **Difficulty (b):** the ability level at which 50% pass
> - **Guessing (c):** baseline probability of correct random answer
>
> Calibration uses JMLE with mean-0/sd-1 anchor; runs against ≥200
> Reference Panel respondents; Mantel-Haenszel DIF detection
> applied per cohort. SO-21 quality gate enforces minimum SE
> thresholds.
>
> *I/O Psychologist contractor co-signoff in Q3 (Tier-A2
> dependency).*

## Slide 7 — Anti-leak architecture

Visual: rotation diagram + watermark example.

Body:

> Anti-leak is 3 layers:
> 1. **Continuous public-source scanning:** services/anti-leak runs
>    Jaccard similarity on public dumps + paste sites + LLM-output
>    samples; severity classifier promotes to admin review queue
> 2. **Rotation regime:** items with confirmed leak alerts auto-
>    rotated; rotation cadence per tenant + per sub-skill
> 3. **Per-candidate watermark:** HMAC-SHA256 over baseSeed‖tenantId
>    ‖renderId; visible footer + homoglyph stego (Latin→Cyrillic);
>    per-vault pepper

Bosch-specific: per-Bosch-internal-tenant pepper rotation; cross-
GCC isolation guaranteed.

## Slide 8 — Stack-Vault tenant isolation

Visual: schema diagram with Bosch + Mercedes + Siemens as separate
tenants.

Body:

> Same Q47 lives independently across every tenant we serve.
>
> Implementation:
> - `app.tenant_stack_vaults` per-tenant pepper + tier + expiry
> - `content.questions.stack_vault_tenant_id` partial UNIQUE on
>   (stack_vault_tenant_id, qor_id) — same qor_id allowed across
>   tenants
> - Every SELECT/INSERT joins on tenant_id (defense in depth)
> - 404 on cross-tenant access (no existence leak)
> - 403 on SO-10 export:stack-vault scope (forbidden per
>   Constitution + D3)
>
> Audit-test coverage: 22 unit tests passing on tenant isolation +
> watermark + middleware.

## Slide 9 — Audit Log API + SOC 2 mapping

Visual: hash-chain diagram + export flow.

Body:

> Every event in QOrium's audit log is:
>
> - SHA-256 hash-chained (canonical JSON over (id, tenant_id,
>   actor_id, event_type, payload, hash_previous))
> - Tenant-scoped via SCOPE_CLAUSE — Bosch sees only Bosch events
> - Exportable as RFC-4180 CSV / JSON in < 60s for any 366-day
>   range
> - Verifiable via GET /v1/audit/verify (returns chain_status:
>   intact + per-event coverage)
>
> SOC 2 Trust Services Criteria mapping:
> - CC1.1 → CC9.2 covered (control mapping doc available)
> - A1, C1, PI1, P1 covered
> - Bosch audit cycle estimated ~36 hours saved per cycle on
>   assessment surface

## Slide 10 — Bosch-scale ROI projection

(See `roi-projection-bosch.md` for detail.)

Top-line:

> At 10,000 engineers screened/year:
>
> | Annual savings | Value |
> |---|---|
> | Authoring + maintenance | ₹50L |
> | Leakage incident reduction (80%) | ₹64L |
> | False-pass reduction (40%) | ₹450-600L |
> | Compliance audit acceleration (60%) | ₹14.4L |
> | **Total annual savings** | **₹578-728L (₹5.78-7.28Cr)** |
>
> | Annual QOrium cost | Value |
> |---|---|
> | Stack-Vault Enterprise + ReadyBank API + custom items | **₹3-5Cr** |
>
> | Net Y1 ROI | **₹2-4 Cr / 1.5×-2× ROI / 6-9 month payback** |

ROI multiple is lower than ICP-1 (3.9×) because Bosch already has
mature compliance + tech-screen tooling; the marginal lift is
narrower but absolute savings are larger.

## Slide 11 — Pilot proposal

> 30-day pilot, free of charge:
>
> - **Scope:** 100 Bosch India engineering candidates run through
>   ReadyBank Embedded Automotive sub-skill
> - **Co-set success criteria:**
>   - Leakage incident: zero confirmed during pilot (we run
>     anti-leak scan continuously)
>   - Audit-export: < 60s response time for 30-day window
>   - Bias-detection: DIF report on candidates by cohort cuts
>   - False-pass rate: pre/post comparison vs. existing tool
> - **Output:** post-pilot report co-signed by Bosch GCC's
>   compliance + technical leadership
> - **No charge:** if criteria met → subscription proposal; if not
>   → graceful close

## Slide 12 — Implementation timeline

Visual: 12-week timeline.

| Week | Milestone |
|---|---|
| 1-2 | Pilot kickoff; Bosch tenant provisioned; SAML/SCIM (cred-drop dependent) |
| 3-4 | First candidates through; daily check-in |
| 5-8 | Pilot mid-review; ROI numbers refined |
| 9-12 | Pilot close report; subscription proposal |

## Slide 13 — Why now (urgency)

> 3 reasons Bosch GCC should pilot in Q4:
>
> 1. **First-100-candidates pricing:** post-pilot subscription
>    locked at first-3-logos cohort pricing for 2 years
> 2. **Wave-2 100/100 maturity window:** SME Lead validation
>    cycle starting Q3; pre-validation pilot lets Bosch shape
>    the validation
> 3. **Multi-region IaC ready:** Sprint 5.0 ready means Bosch's
>    EU data-residency constraints can be addressed; cred-bound
>    on cred-drop

## Slide 14 — Next steps

> 1. Bosch reviews this deck + ROI projection internally (week 1)
> 2. Joint technical workshop with CTO + Bosch GCC technical lead
>    (week 2-3; ~2 hours)
> 3. Pilot kickoff target (week 4)
> 4. Pilot close + subscription proposal (week 16)
>
> Direct line: bhaskar@qorium.online / +[CEO mobile]
>
> Confidential. Bosch GCC India internal use only.

---

## Design notes

- Slides 1, 2, 11, 14: text-heavy, simple
- Slides 3, 6, 7, 8, 9: diagrams (use clean schematic style; no
  stock illustrations)
- Slides 4, 5, 10: tables (clean, no over-formatting)
- Slides 12, 13: visual timeline + 3-bullet hierarchy
- Brand: violet-blue accent (per BRAND.md); Geist Sans + Geist Mono
  + Source Serif 4 fonts; no emoji
- Confidentiality footer on every slide

## Pre-send checklist

- [ ] Custom-pulled data: Bosch India hiring volume, recent
      announcements, leadership names verified
- [ ] ROI projection numbers refined post-discovery (uses Bosch's
      actual numbers if shared)
- [ ] Customer-Zero quote permission confirmed (Talpro Delivery
      Head)
- [ ] Pricing ranges ONLY (Constitution §1.2 LOCKED)
- [ ] No claims that require cred-drop / human-bound items unless
      explicitly flagged ("post-cred-drop")
- [ ] No emoji; no banned words
- [ ] CTO Office reviewed before send
- [ ] PDF version + Keynote source both prepared

---

_Outline is a draft. Designer + CEO collaboration produces the
deck. Materials gated on CEO approval before send to Bosch._
