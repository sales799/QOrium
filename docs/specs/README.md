# QOrium canonical engineering specs

This directory is the **registry** for QOrium engineering specs that the
autonomous build agent depends on, sprint by sprint.

## The spec-ingest pattern

QOrium specs are authored by the CTO Office (Cowork session, Bhaskar's Mac).
The build agent (this repo) consumes them as read-only reference. The pattern:

1. **At the top of each sprint**, the agent identifies the canonical specs it
   needs (per `_QORIUM_BUILD_LOG.md` and the sprint plan in the operator
   handoff).
2. The agent **looks for the spec** in this order:
   - `docs/specs/<filename>` ← preferred home for any spec ingested by an agent flow
   - `infra/<filename>` ← engineering design specs ingested in PR #2 (Sprint 0.2)
   - `governance/<filename>` ← governance & quality-gate specs ingested in PR #2
   - repo root ← Constitution, Blueprint, SKU architecture, CTO architecture (foundational)
3. **If the spec is absent in all four locations**, the agent emits exactly:
   ```
   REQUEST: <Spec-Name>.md from CTO Office
   ```
   and **HALTS**. The CTO Office (or CEO, on its behalf) pastes the spec content
   into a follow-up message; the agent commits it under `docs/specs/<filename>`
   and resumes the sprint.

## Why a registry, not a copy

Specs already in `infra/`, `governance/`, and the repo root were ingested by
PR #2 in Sprint 0.2 with the canonical paths the toolchain (CI, migrations,
PM2 ecosystem) expects. Copying them under `docs/specs/` would create drift —
the source of truth in the Cowork session pushes to those paths, not here.

`docs/specs/INDEX.md` is the **single lookup table** mapping every spec the
agent depends on to its actual canonical path in this repo, organised by
sprint dependency. New specs ingested in future sprints land in
`docs/specs/<filename>` and become the new canonical location for that file.

## Ingest deltas (CTO Office reconciliations)

When implementation surfaces a discrepancy with a spec — schema constraint
incompatible with an algorithm choice, tool version drift, etc. — the agent
records it under `infra/CTO-deltas/CTO-DELTA-<topic>.md` with status
`Provisional`. The CTO Office reviews and either:

- **Ratifies**: status → `RATIFIED YYYY-MM-DD`, with rationale appended
- **Rejects**: agent unwinds the delta and re-implements per the spec

Ratifications close in this repo via the build agent's PR; the CTO Office
reflects them upstream in the next spec refresh.

See `infra/CTO-deltas/` for the current delta log.
