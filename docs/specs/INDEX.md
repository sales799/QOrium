# Spec INDEX — canonical paths by sprint

**Last updated:** 2026-05-03 (Sprint 1.1)
**Maintainer:** Build agent + CTO Office

This file is the **single lookup table** for every canonical spec the build
agent depends on. When a sprint requires a spec, the agent resolves the path
here. When a new spec is ingested (REQUEST → paste flow), the agent appends
a row.

Read `docs/specs/README.md` for the ingest pattern.

---

## Foundational (cross-sprint)

| Spec                                            | Canonical path                                                           | Status |
| ----------------------------------------------- | ------------------------------------------------------------------------ | ------ |
| QOrium Constitution v2.0                        | `09-QOrium-Constitution-v2.0.md`                                         | LIVE   |
| Constitution Ratification Record v2.0           | `CONSTITUTION-RATIFICATION-RECORD-v2.0.md`                               | LIVE   |
| QOrium Blueprint v1                             | `04-QOrium-Blueprint-v1.md`                                              | LIVE   |
| Three-Use-Cases SKU Architecture                | `05-QOrium-Three-Use-Cases-SKU-Architecture.md`                          | LIVE   |
| CTO Architecture v1                             | `07-CTO-Architecture-v1.md`                                              | LIVE   |
| Quality Gate 92-pt Scorecard                    | `governance/Quality-Gate-92pt-Scorecard.md`                              | LIVE   |
| Operating Rituals v1                            | `governance/Operating-Rituals-v1.md`                                     | LIVE   |
| Decision Framework Reusable Template            | `governance/Decision-Framework-Reusable-Template-v1.md`                  | LIVE   |
| Constitutional Amendment v2.1 (M9 Psychometric) | `governance/Constitutional-Amendment-v2.1-Article-IX-M9-Psychometric.md` | LIVE   |
| Incident Response Runbook v1                    | `governance/Incident-Response-Runbook-v1.md`                             | LIVE   |
| Investor Brief Pre-A v1                         | `governance/Investor-Brief-Pre-A-v1.md`                                  | LIVE   |
| TestForge QA Pipeline v1                        | `governance/TestForge-QA-Pipeline-v1.md`                                 | LIVE   |
| AI Plagiarism Benchmark Protocol v1             | `governance/AI-Plagiarism-Benchmark-Protocol-v1.md`                      | LIVE   |
| Bias Detection Methodology v1                   | `governance/Bias-Detection-Methodology-v1.md`                            | LIVE   |

## Phase 1 — Engine MVP

| Sprint | Spec                                                                        | Canonical path                                      | Status          |
| ------ | --------------------------------------------------------------------------- | --------------------------------------------------- | --------------- |
| 1.0    | D3 Talpro Internal API Key Spec                                             | `infra/D3-Talpro-Internal-API-Key-Spec.md`          | SHIPPED         |
| 1.0    | API Documentation v0                                                        | `infra/API-Documentation-v0.md`                     | LIVE            |
| 1.0    | B1 VPS Capacity & Topology                                                  | `infra/B1-VPS-Capacity-and-Topology-Plan.md`        | LIVE            |
| 1.0    | B5 CI Pipeline (gh-actions)                                                 | `infra/B5-CI-Pipeline.github-actions.yml`           | LIVE (archival) |
| 1.0    | B6 gitleaks config                                                          | `infra/B6-gitleaks-config.yaml`                     | LIVE (archival) |
| 1.0    | B6 Secret Rotation Calendar                                                 | `infra/B6-Secret-Rotation-Calendar.md`              | LIVE            |
| 1.0    | B7 Postgres migrations                                                      | `infra/B7-postgres-migrations/`                     | LIVE            |
| 1.0    | B10 PM2 ecosystem                                                           | `infra/B10-ecosystem.config.js`                     | LIVE            |
| 1.1    | (this sprint — spec INDEX & ratifications)                                  | `docs/specs/INDEX.md`                               | NEW             |
| 1.2    | CTO Architecture v1 (admin scaffold guidance)                               | `07-CTO-Architecture-v1.md`                         | LIVE            |
| 1.3    | (admin SME review queue UI — derived from CTO Architecture §6.4)            | `07-CTO-Architecture-v1.md`                         | LIVE            |
| 1.4    | Anti-Leak Engine v0 Design                                                  | `infra/Anti-Leak-Engine-v0-Design.md`               | LIVE            |
| 1.5    | IRT Calibration Pipeline v0 Spec                                            | `infra/IRT-Calibration-Pipeline-v0-Spec.md`         | LIVE            |
| 1.5    | Bias Detection Methodology v1 (supporting)                                  | `governance/Bias-Detection-Methodology-v1.md`       | LIVE            |
| 1.6    | Judge0 Sandbox Integration Spec v0                                          | `infra/Judge0-Sandbox-Integration-Spec-v0.md`       | LIVE            |
| 1.7    | TestForge QA Pipeline v1                                                    | `governance/TestForge-QA-Pipeline-v1.md`            | LIVE            |
| 1.7    | AI Plagiarism Benchmark Protocol v1 (supporting)                            | `governance/AI-Plagiarism-Benchmark-Protocol-v1.md` | LIVE            |
| 1.8    | (Customer Zero deployment readiness — derived from B10 + Operating Rituals) | n/a                                                 | DERIVED         |

## Phase 2 — JD-Forge + Stack-Vault + Wave 2

| Sprint | Spec                                             | Canonical path                                  | Status |
| ------ | ------------------------------------------------ | ----------------------------------------------- | ------ |
| 2.0    | JD-Forge v0 Design                               | `infra/JD-Forge-v0-Design.md`                   | LIVE   |
| 2.1    | (Stack-Vault — derived from SKU architecture §3) | `05-QOrium-Three-Use-Cases-SKU-Architecture.md` | LIVE   |
| 2.2    | ATS Connector Framework v0                       | `infra/ATS-Connector-Framework-v0.md`           | LIVE   |
| 2.3    | Webhooks Service v0 Spec                         | `infra/Webhooks-Service-v0-Spec.md`             | LIVE   |
| 2.3    | SSO/SAML Enterprise Spec v0                      | `infra/SSO-SAML-Enterprise-Spec-v0.md`          | LIVE   |
| 2.3    | Audit Log API Spec v0                            | `infra/Audit-Log-API-Spec-v0.md`                | LIVE   |

## Phase 3 — Billing & monetisation

| Sprint | Spec                                        | Canonical path                                            | Status |
| ------ | ------------------------------------------- | --------------------------------------------------------- | ------ |
| 3.x    | Billing Service v0 Spec                     | `infra/Billing-Service-v0-Spec.md`                        | LIVE   |
| 3.x    | Wave 3 AI Pair-Coding Format Prototype Spec | `infra/Wave-3-AI-Pair-Coding-Format-Prototype-Spec-v0.md` | LIVE   |

## Phase 4 — Production deploy

| Sprint | Spec                                                                               | Canonical path                  | Status  |
| ------ | ---------------------------------------------------------------------------------- | ------------------------------- | ------- |
| 4.0    | B10 PM2 ecosystem                                                                  | `infra/B10-ecosystem.config.js` | LIVE    |
| 4.x    | (Observability — derived from CTO Architecture §11)                                | `07-CTO-Architecture-v1.md`     | LIVE    |
| 4.x    | (Customer Zero Day-1 runbook — derived from Operating Rituals + Incident Response) | n/a                             | DERIVED |

---

## CTO-DELTAs (sprint 1.1 close-out)

| ID  | Topic                         | Status              | File                                               |
| --- | ----------------------------- | ------------------- | -------------------------------------------------- |
| 1   | CI pipeline npm → pnpm        | RATIFIED 2026-05-03 | `infra/CTO-deltas/CTO-DELTA-CI-pnpm-adoption.md`   |
| 2   | gitleaks config v8 syntax     | RATIFIED 2026-05-03 | `infra/CTO-deltas/CTO-DELTA-gitleaks-v8-syntax.md` |
| 3   | Custom migration runner       | RATIFIED 2026-05-03 | `infra/CTO-deltas/CTO-DELTA-migration-runner.md`   |
| 4   | API key hashing — HMAC-SHA256 | RATIFIED 2026-05-03 | `infra/CTO-deltas/CTO-DELTA-api-key-hashing.md`    |

D3 §2.2 will be amended in the next spec refresh to reflect the HMAC-SHA256
ratification (Delta #4).

---

## Status legend

- **LIVE** — spec is in the repo, canonical, current
- **SHIPPED** — implementation built per spec; sprint closed
- **NEW** — first appearance in this sprint
- **DERIVED** — no standalone spec; intent derived from a parent spec (cited)
- **LIVE (archival)** — spec preserved as intent-of-record; canonical implementation lives in a sibling file (e.g., B5 yaml is archival; `.github/workflows/ci.yml` is canonical)
