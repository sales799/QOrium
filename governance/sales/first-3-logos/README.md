# First 3 Recruiter Subscription Logos — Outbound Sales Stack

**Owner:** CEO + future AE (Account Executive; Y2 hire)
**Anchor:** QOrium Constitution Article IX M3 sales target H2; Standing Order #2 USP discipline
**Tile:** `human-prep.first-3-logos.outbound-sales-stack` (auto-eligible: true)
**Linked human tile:** `human.first-3-recruiter-logos` (blocked-on-CEO+AE)
**Status:** ready-for-CEO-review

This folder is the complete outbound sales stack for the first 3
ReadyBank Recruiter Subscription logos — the M3 milestone in QOrium's
Y1 sales target. Without these 3 logos:
- No live tenant data flows through `app.subscriptions`
- ARR remains zero (per `metrics.tenant_arr` view from Sprint 7.0)
- M3 → M9 phase-gate of Article IX cannot move
- Master Meter cannot exit the 0.78 cap on the revenue axis

With them:
- First ARR data lights up `metrics.tenant_arr` view (real numbers)
- DAU + MAU views surface real tenant signal
- The investor narrative gains its first revenue footing
- CTO Office can prioritise customer-bound feature stack with real
  feedback (not founder-imagined personas)

## What's in this folder

| File | Purpose |
|---|---|
| `icp-profiles.md` | 3 Ideal Customer Profiles + per-ICP scoring rubric |
| `outbound-sequences.md` | Multi-channel sequences (LinkedIn + email + warm intro) per ICP |
| `roi-calculator.md` | Customer-facing ROI calculator (with concrete inputs + outputs) |
| `jd-forge-demo-script.md` | 30-min JD-Forge demo script (dogfood our SKU 2) |
| `audit-export-wiring.md` | Wires Sprint 4.4.2 audit-export to outbound (compliance proof) |
| `qualification-scorecard.md` | BANT-equivalent + QOrium-specific qualification rubric |
| `pricing-conversation-guide.md` | Range-only pricing per BRAND.md; never single SKUs |

## Decision required from CEO

| # | Decision | Recommendation |
|---|---|---|
| 1 | Approve the 3 ICPs as the canonical Y1 targets | YES — staffing platforms, mid-market enterprises, India HRTech recruiters |
| 2 | Approve outbound budget for the first 3 logos | ₹2-3L (LinkedIn Sales Nav, Apollo, Lemlist, demo infrastructure) |
| 3 | Approve dogfooding JD-Forge alpha + audit-export in demos | YES — eats own dogfood; competitive moat in demo |
| 4 | Approve Customer-Zero (Talpro) reference quote use | YES — already documented in customer-zero/; strongest social proof |
| 5 | Designate AE channel — CEO-as-AE for first 3, then hire | YES — CEO must own first 3 to learn ICP nuance; AE hire post-logo-3 |

## Timeline target

- Week 1-2: target list (60 named accounts; 20 per ICP); outbound stack live
- Week 3-6: 200+ outreaches sent; 30+ discovery calls booked
- Week 7-12: pilot conversions; 6+ paid pilots; 3+ converted to subscription
- Week 13-16: post-pilot conversion to subscription; first 3 logos signed

Realistic close: 12-16 weeks for first logo; 20-24 weeks for all 3.

## What changes when complete

- `human.first-3-recruiter-logos` flips `blocked-on-human` → `complete`
- M3 phase-gate (Constitution Article IX) closes
- First ARR signal lights up across all metrics views
- Master Meter starts tracking revenue axis (currently capped at 0.78)
- Y1 budget self-funding bridge becomes real
- Sales playbook (this folder) becomes living artifact for AE hire onboarding

---

_Prepared by CTO Office under MANTHAN human-lane acceleration plan, 2026-05-08._
_NO outreach has been sent. All sequences gated on CEO approval per Auto-Mode-Remote-Plan stop conditions._
