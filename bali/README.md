# Bali — Sales Office Operating Folder

**Office:** Bali · Office 7 of 7 (Constitution §2.7)
**Owner:** CEO (Y1) → AE Enterprise + BD Platforms (M3+) → Sales Lead (Y2+)
**Source-of-truth doc:** `08-Bali-Sales-Playbook-v1.md`
**Constitutional authority:** Constitution §2.7 + Standing Orders SO-1, SO-10, SO-11, SO-12, SO-18, SO-23, SO-25

---

## Purpose

This folder holds the **operating artifacts** that the Bali Sales Playbook (Doc 8) references but doesn't ship inline. Templates here are tooling — the playbook is the strategy. When in doubt, the playbook wins on intent and these templates win on format.

**Discipline:**

- Templates are append-only patterns; instances of these templates (real pipeline, real win/loss debriefs) live in CRM, not in this repo.
- Outreach scripts are starting points for personalization. **The 22-word USP from Constitution §1.1 is verbatim across every motion** — no paraphrasing.
- Customer Zero (Talpro India) appears in every cold opener and demo per SO-1 (non-negotiable).

---

## Folder Structure

```
bali/
├── README.md                              ← you are here
├── outreach/
│   ├── platform-api.md                    ← Mode A motion (Tier 1+2 API customers)
│   ├── enterprise-stack-vault.md          ← Mode D motion (BFSI + GCC + IT services)
│   └── recruiter-self-serve.md            ← Modes A+B+C motion (AI Agent + human escalation)
└── templates/
    ├── pipeline-tracker.md                ← 7-stage qualified-pipeline view
    ├── weekly-forecast.md                 ← Mon weekly review (Constitution §671)
    └── quarterly-competitive-scan.md      ← SO-25 protocol artifact
```

---

## Operating Cadence (Constitution §671–687)

| Cadence        | Activity                                     | Owner                  | Output                                                              | Template                                  |
| -------------- | -------------------------------------------- | ---------------------- | ------------------------------------------------------------------- | ----------------------------------------- |
| **Daily**      | Outreach activity (per motion target counts) | Bali                   | Activity counts logged in CRM                                       | (CRM, not repo)                           |
| **Mon weekly** | Pipeline review                              | CEO + CTO + Bali       | Forecast                                                            | `templates/weekly-forecast.md`            |
| **Wed weekly** | Customer outreach blitz                      | Bali                   | Pipeline additions                                                  | `outreach/*.md` (scripts)                 |
| **Fri weekly** | Win/loss debrief                             | Bali                   | Sales-process improvements                                          | TBD (next iteration)                      |
| **Monthly**    | Business review                              | CEO + CTO + Bali + COM | Cohort metrics                                                      | (Operating Rituals doc)                   |
| **Quarterly**  | Competitive scan                             | Bali                   | Updated `competitive_research_log.md` + MANTHAN trigger if material | `templates/quarterly-competitive-scan.md` |

---

## Three Sales Motions (Bali Playbook §3 — reproduced for quick reference)

| Motion                     | Mode  | ACV / Cycle        | Y1 logo target | Owner                                               | First-touch script                   |
| -------------------------- | ----- | ------------------ | -------------- | --------------------------------------------------- | ------------------------------------ |
| **Platform API**           | A     | $80K / 6–12 mo     | 3              | BD Platforms (funnel) → CEO + AE Enterprise (close) | `outreach/platform-api.md`           |
| **Enterprise Stack-Vault** | D     | ₹70L / 3–6 mo      | 5              | CEO + AE Enterprise                                 | `outreach/enterprise-stack-vault.md` |
| **Recruiter Subscription** | A+B+C | ₹2.4L–18L / 1–3 mo | 30             | AI Agent (M2+) + human escalation                   | `outreach/recruiter-self-serve.md`   |

**Y1 total target:** 38 logos in primary motions + 28 ancillary = **66 logos / ₹3.5 Cr ARR** (per Bali Playbook §14).

---

## Pricing Discipline (SO-11 + SO-23, reproduced)

- **Stack-Vault Enterprise:** ₹40L anchor / ₹35L floor (CEO approval below floor)
- **Platform API:** $5,000–$25,000/yr published band (SO-23)
- **JD-Forge per-JD:** firm at published rate; volume discounts only via CEO
- **Discount band:** Bali authority up to **10%** off list (SO-11); >10% requires CEO approval
- **Pricing as ranges** on `qorium.online/pricing` — no absolute SKU prices published without finance/legal review

---

## Customer Zero Reference Protocol (SO-1 + SO-12)

1. **Always ask** before quoting Talpro India as a reference (SO-12).
2. **Always offer** the prospect a 15-minute reference call with Talpro India operators.
3. Customer Zero data points refresh quarterly and live in `apps/marketing/src/app/(marketing)/customers/page.tsx` (Customer Zero detail section). Update both that page **and** the Bali Playbook §7 when refreshing.

---

## Competitive Outreach Discipline (Constitution §2.7)

| Class                             | Outreach                                     |
| --------------------------------- | -------------------------------------------- |
| **OBSOLETE**                      | ❌ Forbidden                                 |
| **DIRECT POSITIONING COMPETITOR** | ❌ CEO escalation required                   |
| **STRONG PARTNERSHIP CANDIDATE**  | ✅ Content-supply pitch, CEO + AE Enterprise |
| **TIER 1 API CUSTOMER**           | ✅ Year 2-3 priority                         |
| **TIER 2 API CUSTOMER**           | ✅ Year 1-2 priority                         |

The live state is maintained in `competitive_research_log.md`. Always check the log before outreach.

---

## Escalation

- **Pricing >10% off list:** CEO
- **DIRECT POSITIONING COMPETITOR engagement:** CEO
- **Stack-Vault deal <₹35L:** CEO (SO-11)
- **Reference customer commitment beyond 5-10% renewal discount:** CEO
- **Material competitor move detected:** Trigger MANTHAN re-validation per SO-25 → log entry → CEO notification within 48h

---

_Maintained by Bali (Office 7). Authority: Constitution §2.7. Templates are tooling — the Bali Playbook (Doc 8) is the strategy._
