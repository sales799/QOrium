# ROI Calculator — Customer-Facing

A simple, defensible ROI model used in discovery calls + demo
sessions. The output is a 1-page customer-facing deliverable
("[Their Firm]'s annual savings + risk-mitigation value").

---

## Input variables (collected during discovery)

| Variable | How to collect | Typical range |
|---|---|---|
| `engineers_screened_per_year` | "How many candidates flow through your tech screen?" | 100-5,000 |
| `current_question_authoring_cost_per_year` | "What does your current question authoring + maintenance cost (FTE + tool + leakage incidents)?" | ₹5L-₹50L |
| `leakage_incidents_per_year` | "How many leak incidents do you handle per year?" | 0-12 |
| `cost_per_leakage_incident` | "Roughly cost per incident: investigation hours + customer trust + rotation effort?" | ₹2L-₹8L |
| `false_pass_rate` | "What % of candidates pass your tech screen but fail later?" | 5-25% |
| `cost_per_false_pass` | "Roughly cost per bad hire (delivery delay + replacement)?" | ₹15L-₹50L |
| `current_compliance_audit_cost` | "What do SOC 2 / SOX / DPDPA audits cost annually for your assessment surface?" | ₹3L-₹20L |

---

## QOrium-side savings model

### Savings 1 — Question authoring + maintenance

> QOrium ships 1,300 IRT-calibrated released items today; 5,000 by
> Y1 close. You stop authoring + maintaining your own.

```
savings_1 = current_question_authoring_cost_per_year
            - QOrium_subscription_per_year (estimated)
```

For a customer with ₹15L/year authoring cost paying ₹8L/year QOrium:
**₹7L net savings/year.**

### Savings 2 — Leakage incident reduction

> Anti-leak rotation + watermark cuts incident frequency by ≥ 80%
> (Talpro Customer-Zero benchmark).

```
savings_2 = leakage_incidents_per_year × cost_per_leakage_incident × 0.80
```

For 4 incidents/year × ₹4L each: **₹12.8L savings/year.**

### Savings 3 — False-pass reduction (IRT calibration)

> IRT-calibrated items reduce false pass rate by ~30-50% via better
> discrimination + difficulty banding.

```
savings_3 = engineers_screened_per_year × false_pass_rate × cost_per_false_pass × 0.40
```

For 500 engineers × 15% × ₹25L × 0.40: **₹75L savings/year** on false-pass
mitigation.

This is the largest savings line and the one customers underestimate
most — frame it carefully.

### Savings 4 — Compliance audit acceleration

> Audit Log API + SOC 2 control mapping reduces audit prep + evidence
> collection by 60% on the assessment surface.

```
savings_4 = current_compliance_audit_cost × 0.60
```

For ₹10L audit cost: **₹6L savings/year.**

### Savings 5 — Speed-to-hire (qualitative)

> Real-time webhook + ATS sync (Sprint 4.5 + 4.6) shortens screening
> cycle by 2-3 days per candidate.

```
qualitative_savings = engineers_screened_per_year × 2_days × hourly_engineering_cost
```

(Reported as a footnote in the ROI sheet; not added to the bottom line.)

---

## Total annual ROI (formulae)

```
total_savings = savings_1 + savings_2 + savings_3 + savings_4
qorium_annual_cost = ReadyBank_API_subscription + Stack_Vault_subscription + (one_time_setup / 3_year_amortisation)
net_roi_year_1 = total_savings - qorium_annual_cost
roi_multiple = total_savings / qorium_annual_cost
payback_period_months = (qorium_annual_cost / total_savings) × 12
```

---

## Sample ROI sheet (illustrative — ICP-1 staffing firm)

> **[Firm Name] — ROI from QOrium ReadyBank + Stack-Vault**
>
> | Input | Value |
> |---|---|
> | Engineers screened per year | 800 |
> | Current question authoring cost | ₹12L/year |
> | Leakage incidents | 3/year |
> | Cost per incident | ₹4L |
> | False-pass rate | 18% |
> | Cost per false pass | ₹22L |
> | Compliance audit cost | ₹8L/year |
>
> | Annual savings line | Value |
> |---|---|
> | Authoring + maintenance | ₹8L |
> | Leakage incident reduction (80%) | ₹9.6L |
> | False-pass reduction (40%) | ₹126L (largest line) |
> | Compliance audit (60%) | ₹4.8L |
> | **Total annual savings** | **₹148.4L** |
>
> | Annual QOrium cost | Value |
> |---|---|
> | ReadyBank API enterprise | ₹8L/year (₹10K USD) |
> | Stack-Vault tenant | ₹25L/year |
> | Setup (₹15L amortised over 3 years) | ₹5L/year |
> | **Total annual QOrium cost** | **₹38L** |
>
> | Bottom line | Value |
> |---|---|
> | Net ROI year 1 | **₹110.4L** |
> | ROI multiple | **3.9×** |
> | Payback period | **3.1 months** |
>
> *False-pass reduction is the largest savings line. Conservative
> estimate: cut by 30% (vs the 40% above), bottom line is still
> ₹93L net positive.*
>
> *Numbers calibrated against Talpro Customer-Zero baseline.*
>
> *Range disclosure: actual savings depend on engineer-screen volume,
> existing compliance maturity, and pilot results. We re-run this
> calc with your real numbers post-pilot.*

---

## How to use in discovery + demo

1. **Discovery call (20-30 min):** ask the 7 input questions in
   conversational form; capture each on a worksheet
2. **Post-call (within 24 hrs):** plug their inputs into the calc;
   produce a 1-page personalised PDF
3. **Demo call:** open with the ROI sheet; let the customer push
   back on inputs; adjust live; build commitment
4. **Pilot proposal:** the pilot's success criteria reference these
   savings lines (e.g., "during pilot, we'll measure leakage
   incident reduction"). Pilot ROI proves out before subscription.

---

## Discipline

- **Conservative inputs:** when a customer gives a range, use the
  lower number in the calc. Better to under-promise.
- **Range-only on QOrium pricing** per BRAND.md. Single-number
  pricing only at contract signing.
- **No claims we can't defend.** Every reduction percentage above
  has a citation (Talpro benchmark or industry benchmark from
  HackerRank/SHL public reports).
- **No hidden costs.** Setup + onboarding + amortisation always
  shown.

---

## What to skip in early discovery

- Don't show the calculator until trust is established (after
  first 10 minutes of discovery). Showing too-fast smells like a
  sales pitch.
- Don't quote false-pass savings before discovery — most customers
  don't track this number; you have to estimate it together. Else
  it sounds made-up.
- Don't claim ROI multiples > 5× without a pilot. Customers' BS-
  detector is well-calibrated.

---

## Calculator tooling

For this Tier-A6 prep, the calc is a Google Sheets template (CEO +
future AE share). Engineering follow-on (post-cred-drop): host a
gated calculator at `roi.qorium.online` where the customer enters
inputs and gets a PDF emailed.

---

_Calculator is a draft. Numbers calibrated against Talpro baseline +
HackerRank/SHL public reports. CEO refines per discovery
feedback._
