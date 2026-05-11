# JD-Forge — Service Operating Folder (Skeleton)

**Service status:** NOT YET A STANDALONE SERVICE. JD-Forge currently surfaces through the ReadyBank API with a different request shape (per ADR 0001 + ADR 0002 in `services/readybank/ops/adrs/`). This folder pre-shapes the operating surface for when JD-Forge ships as its own service codebase (target: M2-M4 per Blueprint trajectory).

**Owner (when service ships):** CTO Office (engineering) + Bali (JD-Forge motion sales — per Bali Sales Playbook §3.x JD-Forge motion when added)
**Source-of-truth strategy:** [`05-QOrium-Three-Use-Cases-SKU-Architecture.md`](../../../05-QOrium-Three-Use-Cases-SKU-Architecture.md) §3 (JD-Forge SKU)
**Constitutional authority:** Constitution SO-13 (Tech Stack), SO-3 (Quality Gate)

---

## Why this folder exists ahead of the service

The per-Office and per-service operating-folder pattern is now established (see `cto/`, `bali/`, `cdo/`, `gatekeeper/`, `manthan/`, `services/readybank/ops/`). When JD-Forge ships standalone, engineers should NOT have to invent the structure — they pick up where this skeleton left off.

**Don't add invented content.** This folder grows when there are real decisions to record (ADRs), real procedures to document (runbooks), or real numerical commitments to make (SLOs). Until then, this README is the placeholder + structural expectation.

---

## Expected folder structure (when service ships)

```
services/jdforge/ops/
├── README.md                              ← you are here (skeleton)
├── adrs/
│   └── 0001-<first-arch-decision>.md      ← TBD when arch decisions surface
├── runbooks/
│   ├── api-deploy.md                      ← parallel to services/readybank/ops/runbooks/api-deploy.md
│   ├── customer-onboarding.md             ← parallel to ReadyBank's
│   └── jd-parse-rollback.md               ← JD-Forge-specific
└── sli-slo.md                             ← per-endpoint SLOs
```

The `services/readybank/ops/` folder is the canonical reference. Copy its file structure when JD-Forge spins out.

---

## What JD-Forge is (per SKU Architecture §3)

The on-demand custom-pack generator. Customer uploads a JD; JD-Forge parses it against the role-graph (per `apps/marketing/src/content/blog/role-graph.mdx`); generates a question pack matching the role's expected depth; returns within 30 seconds.

Tier model (per Bali Sales Playbook §3.x JD-Forge motion):

- **Standard tier** — AI-only generation; ~$99 per JD; per-drive pricing
- **Reviewed tier** — AI + I/O psych SME validation; ~$199 per JD; for senior roles
- **Enterprise tier** — Reviewed + role-graph extension to customer's stack; per-engagement pricing within Bali authority

---

## What JD-Forge does NOT do (scope boundaries)

- ❌ NOT a Stack-Vault. JD-Forge output is per-drive, not per-customer-exclusive. Stack-Vault is a separate SKU.
- ❌ NOT a ReadyBank. ReadyBank is the shared library; JD-Forge generates packs FROM ReadyBank + applies per-JD format-mix.
- ❌ NOT customer-data-storing. JD-Forge processes JDs ephemerally; uploaded JDs are not retained beyond the generation window.

---

## Y1 reality

JD-Forge currently surfaces through ReadyBank's `/v1/packs/generate` endpoint (per ADR 0002 of `services/readybank/ops/adrs/`). The 30-second SLA is enforced by the same endpoint. Customer differentiation is at the request shape (presence of an `uploaded_jd` field) + tier pricing (Bali commercial template), not at the service level.

When JD-Forge spins out as a standalone service (target M2-M4):

1. Code moves to `services/jdforge/src/`
2. Routes move to `/jdf/v1/...` (separate URL prefix)
3. This `ops/` folder activates with real ADRs + runbooks
4. ReadyBank's `/v1/packs/generate` keeps working for customers who integrate at that layer (no breaking change; per ADR 0002 versioning discipline)

---

## Cross-reference map

| Topic                        | Lives at                                                                                                                                                |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **JD-Forge SKU strategy**    | [`05-QOrium-Three-Use-Cases-SKU-Architecture.md`](../../../05-QOrium-Three-Use-Cases-SKU-Architecture.md) §3                                            |
| **Marketing copy**           | [`apps/marketing/src/content/copy/features.ts`](../../../apps/marketing/src/content/copy/features.ts) `jdforgeCopy`                                     |
| **30-second SLA claim**      | `qorium.online/features/jd-forge` proof-bar                                                                                                             |
| **Current implementation**   | Routed via ReadyBank — see `services/readybank/src/routes/packs.ts`                                                                                     |
| **Role-graph routing logic** | [`apps/marketing/src/content/blog/role-graph.mdx`](../../../apps/marketing/src/content/blog/role-graph.mdx) §"Why the role-graph powers all three SKUs" |

---

_Maintained by CTO Office. When JD-Forge ships standalone, replace this skeleton with the real operating folder. Reference pattern: `services/readybank/ops/`._
