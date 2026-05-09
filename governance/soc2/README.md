# SOC 2 Readiness Harness — Sprint 5.1

**Status:** v0 · engineering-scaffold
**Audit horizon:** SOC 2 Type II first audit Y2 (per Constitution Article IX
M9 phase-gate — "audit-ready" preceded by 6-month observation window)

## Index

| Doc | Purpose |
|---|---|
| [`control-mapping.md`](./control-mapping.md) | Trust Services Criteria → QOrium control mapping (CC1–CC9) |
| [`evidence-collection.md`](./evidence-collection.md) | Quarterly evidence-pull runbook (auditor-ready packages) |
| [`scripts/soc2-evidence-pull.ts`](../../services/readybank/src/scripts/soc2-evidence-pull.ts) | Programmatic evidence package generator |

## What this harness does

SOC 2 Type II evaluates whether a system **operates** its declared
controls over a 6-month observation window. The auditor wants:

1. **A control catalog** — what controls do you claim?
2. **Evidence the controls operated** — logs, configs, screenshots,
   tickets — for every day in the window.
3. **Exceptions tracked** — when a control failed, what was the response?

This sprint ships the harness; **operating the controls is human-bound**
(Customer-Zero, security review cadence, vendor reviews, etc.) — the
auditor evaluates QOrium's discipline, not just the code.

## What lands in v0 (this sprint)

- ✅ Control mapping (this folder)
- ✅ Evidence collection runbook
- ✅ Evidence-pull script skeleton (services/readybank/src/scripts/soc2-evidence-pull.ts)

## What follows (deferred)

- **Sprint 5.1.1** — automated quarterly evidence-pull cron + S3
  archive. Today the script runs by hand.
- **Sprint 5.1.2** — change-management ticketing integration
  (issues → audit.events).
- **Sprint 5.1.3** — vendor security review tracker (Constitution
  Amendment v2.1 prerequisite).
- **Sprint 5.1.4** — SOC 2 auditor portal (read-only export of the
  full evidence package per audit window).

## How to run an evidence pull

```bash
# Quarterly — replaces a manual binder.
pnpm --filter @qorium/readybank exec \
  ts-node src/scripts/soc2-evidence-pull.ts \
  --start 2026-01-01 --end 2026-03-31 \
  --out /tmp/soc2-q1-2026.json
```

Output is a single JSON document with:

- Audit-event tally per control category
- API-key rotation history
- Migration log + signing-secret rotation cadence
- IRT auto-fail history (SO-21)
- Anti-leak detections (SO-9)
- Multi-region replication health snapshots

Auditor reviews → archives → moves to next quarter.

## Design principles

1. **Evidence is the database.** No screenshots or PDF binders. Every
   control's evidence is queryable from `audit.events` or its
   subordinate tables (`webhooks.deliveries`, `app.api_keys` rotation
   events, etc.).
2. **One control = one query.** If we can't write a single SQL query
   that surfaces evidence for a control, the control is not auditable.
3. **Tenant scoping is universal.** Every evidence query filters on
   `tenant_id`. Auditors evaluating Customer X never see Customer Y's
   data.
4. **Tamper-evidence is built-in.** The audit-log hash chain (Sprint
   4.4.3) is the SOC 2 IT-general-control's first line of defense.

---

_Maintained by CTO Office. Override any control mapping by editing
`control-mapping.md` and adding a dated `## Override` section._
