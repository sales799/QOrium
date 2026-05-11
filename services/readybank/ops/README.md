# ReadyBank — Service Operating Folder

**Service:** `@qorium/readybank` (Express API on port 5101 dev, behind nginx prod)
**Owner:** CTO Office (engineering) + Bali (Platform API motion sales) + CDO (content engine inputs)
**Source-of-truth code:** [`services/readybank/src/`](../src/)
**Source-of-truth strategy:** [`05-QOrium-Three-Use-Cases-SKU-Architecture.md`](../../../05-QOrium-Three-Use-Cases-SKU-Architecture.md) §2 (ReadyBank SKU)
**Constitutional authority:** Constitution SO-13 (Tech Stack), SO-23 (API pricing band $5K-25K/yr)

---

## What ReadyBank is

The **shared, IRT-calibrated, anti-leak-rotated question library** delivered as a REST API. Customer = assessment platforms (HackerRank-tier integrations); pricing band $5K-25K/yr per SO-23.

Three customer-facing endpoints:

| Route                      | Purpose                                                 | File                                                    |
| -------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| `POST /v1/packs/generate`  | Generate a question pack for a role + difficulty target | [`src/routes/packs.ts`](../src/routes/packs.ts)         |
| `GET /v1/questions/{uuid}` | Fetch a single question by UUID                         | [`src/routes/questions.ts`](../src/routes/questions.ts) |
| `GET /v1/questions/search` | Search questions by skill / format / difficulty         | [`src/routes/questions.ts`](../src/routes/questions.ts) |
| `GET /health`              | Health check (no auth required)                         | [`src/routes/health.ts`](../src/routes/health.ts)       |

Plus 3 bulk export endpoints (CSV / JSON / HackerRank-YAML) under `src/exporters/`.

## Why this folder exists

`services/readybank/` ships the code (PR #4-7 merged). This `ops/` subfolder ships the **operating layer** for the service — ADRs for material decisions, runbooks for deploy + rollback + customer onboarding, SLOs for the API. Same pattern as `cto/`, `bali/`, `cdo/`, `gatekeeper/`, `manthan/` at repo root — except scoped to a single service.

```
services/readybank/ops/
├── README.md                              ← you are here
├── adrs/
│   ├── 0001-express-not-fastify.md
│   ├── 0002-api-versioning-via-url-path.md
│   └── 0003-bulk-export-three-formats.md
├── runbooks/
│   ├── api-deploy.md
│   └── customer-onboarding.md
└── sli-slo.md
```

ReadyBank is the FIRST service to ship its own ops folder. The pattern propagates to JD-Forge + Stack-Vault services when those ship as separate codebases (currently they're served via the same content engine + ReadyBank API; separate services lifecycle is M2-M4).

---

## Cadence

| Cadence                     | Activity                                                   | Owner      | Folder reference                           |
| --------------------------- | ---------------------------------------------------------- | ---------- | ------------------------------------------ |
| **Per arch change**         | New ADR drafted before merge                               | CTO        | `adrs/`                                    |
| **Per release**             | Run release-gate per `gatekeeper/release-gate-protocol.md` | GATEKEEPER | (parent gatekeeper folder)                 |
| **Per customer onboarding** | Walk through onboarding runbook with customer              | Bali + CTO | `runbooks/customer-onboarding.md`          |
| **Continuous**              | API SLO monitoring                                         | CTO        | `sli-slo.md`                               |
| **Per migration**           | DB migration discipline (forward-only)                     | CTO        | `runbooks/api-deploy.md` §migrations       |
| **Quarterly**               | API versioning review (any v2 candidates?)                 | CTO + Bali | `adrs/0002-api-versioning-via-url-path.md` |

---

## Constitutional anchors active in this folder

| SO        | Subject                                            | Where it lives                                                                                                                                              |
| --------- | -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **SO-3**  | Quality Gate Discipline                            | Every release runs through `gatekeeper/release-gate-protocol.md` — ReadyBank is no exception                                                                |
| **SO-10** | Stack-Vault Exclusivity                            | ReadyBank is the SHARED library; Stack-Vault questions are explicitly excluded from ReadyBank API responses (the `vault_uuid` field gates this)             |
| **SO-13** | Talpro Universe Tech Stack                         | Express + PostgreSQL + Redis — adopted; deviations require ADR                                                                                              |
| **SO-21** | IRT Mandate                                        | Every question returned via this API has `irt_calibrated_at` + difficulty band metadata; questions without IRT metadata are filtered out at the query layer |
| **SO-22** | AI Plagiarism Public Benchmark + 24h Anti-Leak SLA | The `anti_leak_scan: { last: ..., status: clean }` field on every returned question reflects the live anti-leak state                                       |
| **SO-23** | API pricing band ($5K-25K/yr)                      | Customer-by-customer pricing within Bali authority; outside band = CEO escalation                                                                           |

---

## Customer onboarding flow (high-level)

When the first Platform API customer signs (per Bali Y1 target = 3 logos):

1. **Bali closes the deal** per `bali/outreach/platform-api.md` motion
2. **Customer profile created** — internal name + ICP class + tier (Lite / Pro / Scale per pricing band)
3. **API key issued** via `@qorium/auth` package (per [`packages/auth/README.md`](../../../packages/auth/README.md))
4. **Webhook configured** for anti-leak rotation events (`question_retired` / `question_replaced`)
5. **Smoke test** — customer hits `/health` + sample `/v1/packs/generate` call
6. **Documentation handoff** — customer receives the API ref + integration guide
7. **First-week monitoring** — daily check-ins per `runbooks/customer-onboarding.md` for the first 7 days

Detail in [`runbooks/customer-onboarding.md`](./runbooks/customer-onboarding.md).

---

## What's NOT here

- ❌ **Live API documentation** — currently serves via the source code itself; OpenAPI spec generation is a TODO (track in `cto/tech-debt.md`)
- ❌ **JD-Forge service ops** — JD-Forge currently surfaces through ReadyBank's pack-generation endpoint with a different request shape; separate service ops folder when it ships standalone
- ❌ **Stack-Vault service ops** — same; Stack-Vault customers consume the same ReadyBank API with `vault_uuid` filter; separate service ops when it ships standalone
- ❌ **Public-facing API docs site** — TBD (likely `docs.qorium.online` post-launch)

---

## Cross-reference map

| Topic                                        | Lives at                                                                                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| **ReadyBank SKU strategy**                   | [`05-QOrium-Three-Use-Cases-SKU-Architecture.md`](../../../05-QOrium-Three-Use-Cases-SKU-Architecture.md) §2 |
| **API customer pricing band**                | Constitution SO-23 + `bali/outreach/platform-api.md`                                                         |
| **Anti-leak engine architecture (upstream)** | [`07-CTO-Architecture-v1.md`](../../../07-CTO-Architecture-v1.md) §6                                         |
| **Anti-leak forensics protocol**             | [`cdo/anti-leak-forensics.md`](../../../cdo/anti-leak-forensics.md)                                          |
| **IRT calibration protocol**                 | [`cdo/irt-calibration-protocol.md`](../../../cdo/irt-calibration-protocol.md)                                |
| **API SLOs**                                 | [`cto/sli-slo.md`](../../../cto/sli-slo.md) ReadyBank API section + this folder's `sli-slo.md`               |
| **Auth package**                             | [`packages/auth/`](../../../packages/auth/)                                                                  |
| **DB package**                               | [`packages/db/`](../../../packages/db/)                                                                      |
| **Source code**                              | [`services/readybank/src/`](../src/)                                                                         |
| **Test suite**                               | [`services/readybank/__tests__/`](../__tests__/)                                                             |

---

_Maintained by CTO Office. Authority: Constitution §2.3 (CTO charter applied to a specific service). Pattern: parallel to repo-root operating folders — same structure, scoped narrower._
