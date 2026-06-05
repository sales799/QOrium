# QOrium Marketing Universal Makeover Port Audit

Date: 2026-06-05
Branch: codex/qorium-marketing-port-universal-makeover-20260605
Target app: apps/marketing

## Scope

This ports the universal marketing makeover into the production marketing app rather than the alternate `qorium-app/apps/web` tree.

Reference design remains the live `/` and `/trust` visual language: enterprise serif headlines, dark proof posture, cream/light content surfaces, restrained teal accents, evidence-first copy, and no unsupported claims.

## Canonical IA

- Canonical platform overview: `/platform`
- Canonical API surface: `/platform/api`
- Canonical assessment library: `/library`
- Canonical comparison pages: `/compare/qorium-vs-:competitor`
- Legacy redirects: `/product`, `/product/api`, `/product/assessment-library`, `/vs/*`, duplicate `/solutions/role/*-2` style routes

## Family Upgrades

- Role pages now include buyer workflow, skill battery, sample assessment flow, evidence rules, stack context, related routes, and canonical duplicate handling.
- Stack pages now include vendor/enterprise workflow, role mapping, skill modules, case-study evidence gate, evidence rules, and related routes.
- Library pages now include public preview workflow, role/stack mapping, calibration evidence rules, and related routes.
- Compare pages now use the richer competitor graph across all competitor pages with visible competitor strengths, QOrium edges, comparison table, evidence rules, related pages, and source notes.

## Guardrails

- No customer logos, metrics, certifications, or bias-audit completion claims were added.
- Calibration copy remains `Model-estimated · calibrating with live use`.
- `/vs` remains a legacy redirect path, not an indexed canonical family.
- `/product/*` remains a legacy redirect path, not an indexed canonical family.

## Verification Plan

- `pnpm --filter @qorium/marketing copy:audit`
- `pnpm --filter @qorium/marketing typecheck`
- `pnpm --filter @qorium/marketing test`
- `pnpm --filter @qorium/marketing build`
- Local HTTP checks for `/solutions/role/software`, `/solutions/stack/sap-abap`, `/library/python`, `/compare/qorium-vs-vervoe`, `/platform/api`, sitemap, robots, and redirects.

## Deploy Gate

Remote deploy remains gated by the Talpro rule: cross-account review before merge, author never self-approves.
