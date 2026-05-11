# Stack-Vault — Service Operating Folder (Skeleton)

**Service status:** NOT YET A STANDALONE SERVICE. Stack-Vault customer libraries currently surface through the ReadyBank API with a `vault_uuid` filter (per `services/readybank/ops/adrs/0002-api-versioning-via-url-path.md`) + watermark embedding (per `cdo/watermark-forensics.md`). This folder pre-shapes the operating surface for when Stack-Vault ships as its own service codebase (target: M2-M4 per Blueprint trajectory; first paid Stack-Vault customer triggers the spin-out).

**Owner (when service ships):** CTO Office (engineering) + Bali (Stack-Vault motion sales per Bali Sales Playbook §3.2) + CDO (watermark forensics + per-vault library management)
**Source-of-truth strategy:** [`05-QOrium-Three-Use-Cases-SKU-Architecture.md`](../../../05-QOrium-Three-Use-Cases-SKU-Architecture.md) §4 (Stack-Vault SKU)
**Constitutional authority:** SO-10 (Stack-Vault Exclusivity is Absolute), SO-11 (Pricing Anchor — ₹40L), SO-13 (Tech Stack)

---

## Why this folder exists ahead of the service

Same pattern as JD-Forge's skeleton folder (`services/jdforge/ops/`). When Stack-Vault spins out as a standalone service, the engineering team picks up structure here; doesn't have to invent it.

The `services/readybank/ops/` folder is the canonical reference for what to fill in.

---

## Expected folder structure (when service ships)

```
services/stackvault/ops/
├── README.md                                   ← you are here (skeleton)
├── adrs/
│   ├── 0001-vault-namespace-isolation.md       ← TBD: per-customer DB schema vs row-level
│   ├── 0002-watermark-embedding-strategy.md    ← TBD: per-format embed approach
│   ├── 0003-quarterly-refresh-mechanics.md     ← TBD: 25%-rotation procedure
│   └── ...
├── runbooks/
│   ├── vault-provisioning.md                   ← onboarding a new customer
│   ├── quarterly-refresh.md                    ← per-vault refresh execution
│   ├── leak-incident.md                        ← when watermark forensics detect a leak
│   └── vault-decommission.md                   ← when a customer doesn't renew
└── sli-slo.md                                  ← per-vault SLOs (delivery time, watermark verification, etc.)
```

---

## What Stack-Vault is (per SKU Architecture §4)

The contractually-exclusive question library SKU. Each customer gets a private library namespace (`vault_uuid`); questions in that namespace NEVER appear in shared ReadyBank, JD-Forge output to other customers, or any other Stack-Vault.

Three pillars:

1. **Exclusivity** (SO-10 + contractual) — questions are tagged with `vault_uuid`; the API filters them out of shared queries
2. **Watermarking** (per `cdo/watermark-forensics.md`) — every question issued to a candidate carries a per-candidate watermark with HMAC-SHA256 signature
3. **Quarterly refresh** — 25% of the library rotates each quarter; anti-leak detection drives the refresh selection

Pricing anchor: **₹40L/year** (per SO-11). Floor: ₹35L/year (CEO approval below). Multi-year: 3-year commit at ₹38L/year average.

---

## What Stack-Vault does NOT do (scope boundaries)

- ❌ NOT a one-off question pack. Every Stack-Vault customer gets a STANDING library; not a per-drive output (that's JD-Forge).
- ❌ NOT publicly searchable. The `/v1/questions/search` endpoint filters Stack-Vault content out for any caller without that vault's namespace credential.
- ❌ NOT cross-vault shareable. Even if two customers ask for the same skill, they get DIFFERENT questions (per SO-10).
- ❌ NOT a marketing claim until the first vault is delivered. Bali outreach + scoping memo are for the SKU; the public claim of "watermarked, contractually exclusive" is honored by the engine described in `cdo/watermark-forensics.md`.

---

## Y1 reality

Stack-Vault currently has **zero live customers**. Bosch GCC India is in Q1 scoping per `bali/leads/Y1-target-list.md` + `governance/launch/bosch-gcc-followup.md`. Y1 target = 5 logos.

Until the first vault delivers (target M3-M6 if Bosch closes Q1):

- Vault provisioning is hypothetical — no `vault_uuid` namespaces exist in production DB yet
- Watermark forensics protocol is documented but never run on real data
- Quarterly refresh cadence is documented but never executed

When the first Stack-Vault contract signs:

1. Code spin-out happens (this folder activates)
2. First vault provisioning runbook gets exercised
3. First per-vault SLOs get measured
4. CDO + GATEKEEPER + Bali co-validate the delivery

---

## Cross-reference map

| Topic                               | Lives at                                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Stack-Vault SKU strategy**        | [`05-QOrium-Three-Use-Cases-SKU-Architecture.md`](../../../05-QOrium-Three-Use-Cases-SKU-Architecture.md) §4           |
| **Pricing discipline (SO-11)**      | [`08-Bali-Sales-Playbook-v1.md`](../../../08-Bali-Sales-Playbook-v1.md) §5                                             |
| **Stack-Vault sales motion**        | [`bali/outreach/enterprise-stack-vault.md`](../../../bali/outreach/enterprise-stack-vault.md)                          |
| **Watermark forensics**             | [`cdo/watermark-forensics.md`](../../../cdo/watermark-forensics.md)                                                    |
| **Scoping memo template**           | [`bali/templates/stack-vault-scoping-memo.md`](../../../bali/templates/stack-vault-scoping-memo.md)                    |
| **Bosch GCC follow-up (in flight)** | [`governance/launch/bosch-gcc-followup.md`](../../../governance/launch/bosch-gcc-followup.md)                          |
| **Marketing copy**                  | [`apps/marketing/src/content/copy/features.ts`](../../../apps/marketing/src/content/copy/features.ts) `stackvaultCopy` |
| **Public-facing page**              | `qorium.online/features/stack-vault`                                                                                   |

---

_Maintained by CTO Office. When Stack-Vault spins out as a standalone service, this skeleton becomes the actual operating folder. Reference pattern: `services/readybank/ops/`._
