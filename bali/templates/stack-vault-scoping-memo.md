# Stack-Vault Scoping Memo Template

**Use:** sent to enterprise prospects within **5 business days** of the Stack-Vault discovery call. **2 pages maximum.**
**Authority:** Bali Sales Playbook §6.1 (Stack-Vault Enterprise commercial template) + §3.2 (Stack-Vault motion). Constitution SO-1, SO-10, SO-11, SO-12.
**Constitutional anchors enforced in this template:** ₹40L anchor (SO-11), Stack-Vault exclusivity (SO-10), reference protocol (SO-12).

---

## Why this is a separate file

The Stack-Vault outreach script (`bali/outreach/enterprise-stack-vault.md`) reproduces this template inline for context. Extracting it here lets the AE (or CEO Y1) maintain the canonical version in one place; the outreach script links to this file as the single source of truth.

---

## Template

```markdown
QOrium Stack-Vault Scoping Memo — {{company_name}}
Date: {{date}}
Prepared by: {{your_name}}, QOrium ({{your_role}})
For: {{decision_maker_name}}, {{decision_maker_role}}, {{company_name}}
Reference call: {{Talpro_India_TA_lead_name}} available on request (SO-12)

---

1. EXECUTIVE SUMMARY (≤4 lines)

{{1-paragraph summary: what's the scope, what's the price, what's the timeline.
This is what their CFO and procurement read first.}}

---

2. SCOPE

   2.1 Library size: {{N}} questions
   2.2 Roles covered: {{list of role families — e.g., Senior Backend Engineer (Java),
                                Embedded Automotive Engineer, Salesforce Developer, etc.}}
   2.3 Stacks covered: {{list of technical stacks — e.g., Java/Spring/Hibernate,
                                Salesforce/Apex/LWC, Embedded/AUTOSAR/MISRA-C, etc.}}
   2.4 Refresh cadence: Quarterly — 25% of library rotated each quarter
   (anti-leak SLA per qorium.online/security)
   2.5 Exclusivity boundary: Contractually exclusive to {{company_name}};
   NEVER appears in shared ReadyBank, JD-Forge output to other
   customers, or any other Stack-Vault (SO-10)
   2.6 Format mix: MCQ / Coding-fn / SJT / SQL / Salesforce-config /
   System-design — proportions per role (per role-graph traversal)
   2.7 Watermark forensics: Per-candidate watermark; dashboard access for security team

---

3. PRICING

   Year 1: ₹40,00,000 (₹40L) — anchor per Bali Sales Playbook §6.1, Constitution SO-11
   Year 2: ₹40,00,000/year with 5% renewal discount per active reference (max 10% total)
   Year 3+: ₹40,00,000/year (option to renegotiate)

   Multi-year option:
   3-year commit: ₹38,00,000/year average (₹2L/year savings vs 1-year)

   Pricing exceptions:
   - Below ₹35L: requires CEO approval (per SO-11)
   - Floor at ₹35L: contractual; not negotiable below this

---

4. DELIVERY

   4.1 Initial library delivery: 8 weeks from contract signature
   4.2 Quarterly refresh: 25% of library rotated each quarter
   4.3 Watermark forensics: Customer security-team dashboard access
   (qorium.online/security data-flow diagram)
   4.4 Onboarding call: Week 1 — kickoff with hiring leader + CTO
   4.5 Quarterly review: 15-min business review each quarter

---

5. SECURITY POSTURE

   ✅ DPDPA-ready: Live (qorium.online/security)
   ✅ GDPR-ready: Live (qorium.online/security)
   ⏳ SOC 2 Type II: In progress, M21 target. Attestation rider available
   for Year 2 trigger (per CTO Architecture §8).
   📋 ISO 27001: On roadmap.
   ✅ DPA: Available for execution at any time.

   Sub-processors list available on request (Anthropic, OpenAI, Cloudflare R2,
   Resend, Razorpay/Stripe).

---

6. NEXT STEP

   6.1 Procurement intake: {{date + 5 business days}}
   6.2 Legal review (DPA + MSA): {{date + 30 business days}}
   6.3 Target signature: {{date + 90 business days}}
   6.4 First library delivery: {{date + 90 + 56 business days}}

---

7. APPENDICES (linked, not embedded)
   - Sample Stack-Vault question (anonymized): {{link}}
   - QOrium Customer Zero detail: https://qorium.online/customers
   - Security posture: https://qorium.online/security
   - Bali Sales Playbook §6.1 commercial template (full): {{shared internally})

---

_This memo references Constitution §1.1 (locked USP), SO-1 (Customer Zero), SO-10 (Stack-Vault exclusivity), SO-11 (pricing anchor), SO-12 (reference protocol). For internal QOrium operating context, see bali/outreach/enterprise-stack-vault.md._
```

---

## Customization rules

The Bali office (CEO Y1, AE Enterprise + CEO Y2+) customizes:

- `{{company_name}}`, `{{decision_maker_name}}`, `{{decision_maker_role}}` — discovery-call output
- `{{your_name}}`, `{{your_role}}` — typically AE Enterprise after Y1 first hire
- `{{N}}` library size — typically 1,500-3,000 for standard Stack-Vault scope; >3,000 needs CEO approval
- `{{list of role families}}` — derived from prospect's hiring plan + Talpro Network discovery
- `{{list of technical stacks}}` — derived from prospect's tech-stack research
- `{{Talpro_India_TA_lead_name}}` — the named contact (per SO-12 — confirmed availability before naming)

**Hard rules (do NOT customize):**

- Pricing tier figures (₹40L anchor, ₹38L 3-year average, ₹35L floor)
- Refresh cadence (quarterly — not "monthly" or "as-needed")
- Exclusivity boundary text (verbatim per SO-10)
- Security posture status (verbatim — never claim Type II we don't have)

---

## Pre-send checklist

- [ ] Pricing within band? (₹40L anchor — ₹38L 3-year — ₹35L floor with CEO approval)
- [ ] Exclusivity boundary stated verbatim (SO-10)?
- [ ] Reference call offer included (SO-12)?
- [ ] No fabricated security claims (SOC 2 Type II not claimed; SO-24)?
- [ ] Library size + role families + stacks specifically mapped to prospect's discovery-call ask?
- [ ] CEO has reviewed (Y1 — every Stack-Vault memo CEO reviews; Y2+ AE Enterprise with random sample CEO review)?

Failing any check → don't send. Iterate until clean.

---

## Performance metrics

Track per memo sent:

- Time from discovery call → memo sent (target: ≤5 business days)
- Memo sent → procurement intake (target: ≤10 business days)
- Procurement intake → contract signature (target: ≤90 days; longer triggers CEO review per Bali Playbook §11 hygiene audit)

If hit-rate (memo sent → contract signed) <50% sustained, the discovery call qualification is too loose; re-tune the discovery agenda in `bali/outreach/enterprise-stack-vault.md`.

---

_Cross-references: Bali Playbook §3.2 (Stack-Vault motion), §6.1 (commercial template), §8 (objection handling), §11 (pipeline + forecasting). Constitution §1.1 (locked USP), SO-1, SO-10, SO-11, SO-12. CTO Architecture §8 (security posture). Outreach script: `bali/outreach/enterprise-stack-vault.md`._
