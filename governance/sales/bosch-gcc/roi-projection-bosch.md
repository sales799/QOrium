# ROI Projection — Bosch GCC India

Bosch-specific ROI model. Larger-scale than ICP-1 sample (Tier-A6
roi-calculator.md) because Bosch screens ~10K engineers/year vs.
800 for typical ICP-1 prospect.

---

## Inputs (typical for Bosch GCC India scale)

| Variable | Value | Source |
|---|---|---|
| Engineers screened per year | 10,000 | Public hiring data + LinkedIn job-post volume |
| Wave-2 (Embedded Automotive) share | 40% (4,000 engineers) | German automotive GCC mix typical |
| Wave-1 share (Java/Python/AWS/AIPE) | 50% (5,000 engineers) | India tech-stack mix |
| Other / niche | 10% (1,000 engineers) | balance |
| Current question authoring cost | ₹50L/year | 4-5 FTE engineering time + tool cost (estimated) |
| Leakage incidents/year (industry-typical) | 8 | based on 30-50% leakage windows × 12-18 month rotation |
| Cost per leakage incident | ₹8L | investigation hours + customer-internal escalation + rotation effort + Bosch German-parent reporting |
| False-pass rate | 12-18% | assumed based on industry benchmarks (Bosch is more rigorous than typical) |
| Cost per false pass (Bosch) | ₹30-40L | Bosch hiring is more expensive (training, ISO certs, security clearance) |
| Compliance audit cost | ₹15L/year (assessment surface portion) | SOC 2 + ISO 27001 + Bosch internal annual |

---

## Savings model

### Savings 1 — Authoring + maintenance

> Bosch in-house team currently authors + maintains ~1,000 items;
> 4-5 FTE-quarters of effort. QOrium ships 1,300 calibrated items
> today; 5,000 by Y1 close.

```
savings_1 = ₹50L (current authoring cost) - ₹0 (Bosch keeps internal team for niche only)
         = ₹50L/year (gross)
         - ₹0 (we don't reduce headcount; Bosch redirects FTE to higher-value work)
         = ₹50L productivity savings (qualitative; conservative: ₹30L cash equivalent)
```

**Conservative cash savings: ₹30L/year.**

### Savings 2 — Leakage incident reduction

> Anti-leak rotation + watermark cuts incident frequency by ≥ 80%.

```
savings_2 = 8 incidents × ₹8L × 0.80
         = ₹51.2L
         ≈ ₹50L/year
```

Reasonable conservative: **₹50L/year**.

### Savings 3 — False-pass reduction (THE BIG ONE)

> IRT-calibrated items reduce false pass rate by 30-50% via better
> discrimination + difficulty banding.

```
savings_3 = 10,000 × 15% (assumed false pass) × ₹35L × 0.40 (reduction)
         = 10,000 × 0.15 × 35,00,000 × 0.4
         = 10,000 × 0.06 × 35,00,000
         = ₹21,00,00,000
         = ₹21Cr/year (aggressive)

Conservative (using 30% reduction + ₹30L cost):
         = 10,000 × 0.12 × 30,00,000 × 0.30
         = ₹10.8Cr/year
```

**Conservative ₹10Cr/year; aggressive ₹20Cr/year.**

This is by far the largest line. CEO must communicate it
carefully — Bosch will discount it heavily because it's hard to
attribute false-pass to "the tech-screen failed" vs. "the candidate
underperformed in role." Use lower bound. **Frame as ₹4-7Cr range
in initial conversations.**

### Savings 4 — Compliance audit acceleration

> Audit Log API + SOC 2 control mapping reduces audit prep by 60%.

```
savings_4 = ₹15L × 0.60
         = ₹9L/year
```

Conservative: **₹9L/year**.

### Savings 5 — Speed-to-hire (qualitative)

> Webhook + ATS sync (Sprint 4.5 + 4.6) shortens screening by 2-3
> days per candidate.

```
qualitative = 10,000 × 2 days × ₹4K/day = ₹80L/year (qualitative)
```

Reported as footnote, not added to bottom line.

---

## Total annual ROI

### Conservative scenario

| Savings line | Value |
|---|---|
| Authoring + maintenance | ₹30L |
| Leakage incident reduction | ₹50L |
| False-pass reduction (lower bound) | ₹4Cr |
| Compliance audit | ₹9L |
| **Total annual savings** | **~₹4.9Cr** |

| Cost line | Value |
|---|---|
| Stack-Vault Enterprise (Bosch tier) | ₹2Cr |
| ReadyBank API enterprise | ₹50L |
| Custom item authorship + integration setup (amortised over 3 years) | ₹50L/year |
| **Total annual QOrium cost** | **₹3Cr** |

| Bottom line | Value |
|---|---|
| **Net ROI Y1** | **₹1.9Cr** |
| **ROI multiple** | **1.6×** |
| **Payback period** | **7.5 months** |

### Mid-range scenario

| Savings line | Value |
|---|---|
| Authoring + maintenance | ₹40L |
| Leakage incident reduction | ₹60L |
| False-pass reduction (mid) | ₹7Cr |
| Compliance audit | ₹12L |
| **Total annual savings** | **~₹8.1Cr** |
| **Total annual QOrium cost** | **₹3-3.5Cr** |
| **Net ROI Y1** | **₹4.6-5.1Cr** |
| **ROI multiple** | **2.3-2.7×** |
| **Payback period** | **4.5-5 months** |

### Aggressive scenario

| Savings line | Value |
|---|---|
| Authoring + maintenance | ₹50L |
| Leakage incident reduction | ₹80L |
| False-pass reduction (aggressive) | ₹15Cr |
| Compliance audit | ₹15L |
| **Total annual savings** | **~₹16.5Cr** |
| **Total annual QOrium cost** | **₹4-5Cr** |
| **Net ROI Y1** | **₹11.5-12.5Cr** |
| **ROI multiple** | **3.3-4×** |
| **Payback period** | **3-4 months** |

---

## How to use in the conversation

The right number to share with Bosch depends on stage:

| Stage | Number to share | Why |
|---|---|---|
| Discovery call | "₹3-5 crore range; refined post-pilot" | Wide range; respectful of unknown inputs |
| Technical follow-up | "Conservative scenario ~₹2Cr Y1 net" | Lower-bound to set expectations |
| Pilot proposal | "Conservative ₹1.9Cr; mid-range ₹4.6Cr" | Shows the upside without overpromising |
| Subscription proposal | Conservative-only | Customer's real numbers refine; we under-promise |

**Do NOT lead with ₹16Cr.** Customer will discount the entire model
as inflated.

---

## ROI sheet — customer-facing 1-pager (post-discovery)

```
Bosch GCC India — QOrium ReadyBank + Stack-Vault ROI Projection

Inputs (assumes Bosch's typical scale):
- Engineers screened per year: ~10,000
- Embedded Automotive share: ~40%
- Wave-1 (Java/Python/AWS/AIPE) share: ~50%
- Current authoring + maintenance: ~₹50L/year
- Leakage incidents: 6-10 per year
- False-pass rate: 12-18%
- Compliance audit cost: ~₹15L/year (assessment surface)

Conservative annual savings:
- Question authoring efficiency:           ₹30L
- Leakage incident reduction (80%):        ₹50L
- False-pass reduction (lower bound):      ₹4Cr
- Compliance audit acceleration (60%):     ₹9L
- Total annual savings (conservative):     ₹4.9Cr

Annual QOrium cost (illustrative range):
- Stack-Vault Enterprise + custom items + setup: ₹3Cr

Bottom line (conservative):
- Net Y1 ROI: ₹1.9Cr
- ROI multiple: 1.6×
- Payback: 7.5 months

Range disclosure:
The above is the conservative scenario. Mid-range projection (using
30% false-pass reduction): ~₹4.6Cr Y1 net. Aggressive scenario
(using 50% false-pass reduction): ~₹11.5Cr Y1 net. Pilot data
refines the number; we'd commit only to the conservative scenario
in early subscription discussion.

Pilot offer: 30 days free; co-set success criteria; numbers above
get refined to actual.

— Bhaskar Anand, CEO QOrium
  bhaskar@qorium.online
```

---

## What kills this ROI projection

- **Sharing only the aggressive number** → Bosch's CFO discounts
  entire model; we lose credibility
- **Hiding the assumptions** → procurement asks for the model and
  finds we hand-waved
- **Promising specific savings before pilot** → contract risk
- **Quoting in the wrong currency** → use INR primary; USD parens
  for German parent reference

---

_Projection is a draft. Numbers refined post-discovery using
Bosch's actual hiring data. Conservative scenario is our anchor.
Pilot data closes the loop._
