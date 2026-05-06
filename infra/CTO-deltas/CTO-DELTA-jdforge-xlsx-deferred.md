# CTO-DELTA: JD-Forge ships JSON + CSV + Mettl-CSV in v0; real Mettl XLSX deferred

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/JD-Forge-v0-Design.md` §3.5 (output packaging) + §12 (M0–M3 scope)

## Background

§3.5 calls out four customer-facing output formats:

- JSON (QOrium canonical)
- CSV (importable to Mettl / HackerRank)
- PDF (printable report with answers)
- Direct API return

§12 (M0–M3 MVP scope) narrows to: **JSON, CSV, Mettl XLSX**.

Mettl's importer accepts both CSV and XLSX. Real XLSX requires a
spreadsheet-writing library — no such library is currently a dependency
of the QOrium monorepo, and adding one (`exceljs`, `xlsx`, etc.) is a
non-trivial supply-chain decision (ExcelJS is ~2 MB, has had recent
security advisories; SheetJS-Pro is paid; raw OOXML hand-rolling is
~200 lines and brittle).

## Adaptation in v0

`services/jd-forge/src/exporters.ts` ships **three** exporters:

- `exportJson` — QOrium canonical JSON document with `{order, parsedJd,
questions}`
- `exportCsv` — RFC 4180 CSV with the QOrium canonical column set
- `exportMettlCsv` — RFC 4180 CSV with the **Mettl-required column order**
  (`Section, QuestionType, QuestionText, Option1–4, CorrectOption,
Marks, NegativeMarks`); accepted by Mettl's "Import Questions via
  CSV" path

`pdf` and `hackerrank-yaml` formats throw a clear error referring callers
to alternatives. The `ExportFormat` type still includes `pdf` so the
schema accepts the field; the runtime rejects with a 400-equivalent.

## Why Mettl-CSV (not XLSX) is acceptable for v0

- Mettl's importer accepts both CSV and XLSX with the same column
  schema; CSV → XLSX is purely a packaging difference at the customer's
  end (every Mettl admin can convert via Excel/Google Sheets in 2
  clicks).
- v0 customer count is small (M0–M3 target = 100 signups, 200 packs);
  the customer-success function will hand-convert any XLSX-only
  customer's first export until volume justifies the dependency.
- The only XLSX-specific Mettl feature we'd lose is per-sheet sectioning
  (Mettl can split sections from Excel sheet tabs); CSV uses the
  `Section` column instead, which is functionally equivalent.

## Reconciliation request to CTO Office

Three options:

1. **Ratify CSV-only Mettl in v0** (recommended). Pros: ships today;
   zero new deps; conversion is a click for the customer.
2. **Add `exceljs` for real XLSX** in v0. Cons: 2 MB dep + recent CVE
   history; one more supply-chain audit; only delivers a packaging
   convenience.
3. **Defer Mettl entirely** to a later sprint until a customer asks
   specifically. Cons: spec §12 calls Mettl XLSX out as MVP scope;
   removing it changes the v0 marketing surface.

Default action if no reconciliation by next sprint review: **option 1**.
The XLSX upgrade is a single CTO-DELTA when we either land the lib
choice or get the first XLSX-only customer.

## Verification

`services/jd-forge/__tests__/exporters.test.ts`:

- `exportJson` — content-type, document shape, filename
- `exportCsv` — header row + one row per question; RFC 4180 quoting for
  `,` `"` `\n`; pipe-joined options
- `exportMettlCsv` — Mettl-required header order; `mcq → SingleChoice` +
  `correctIndex=1 → CorrectOption=Option2`; `coding → Coding` section
- `exportFor` — dispatches all three; throws on `pdf` and
  `hackerrank-yaml` with clear errors
