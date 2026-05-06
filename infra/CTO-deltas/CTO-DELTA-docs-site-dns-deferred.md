# CTO-DELTA: API docs site ships at workspace path; `docs.qorium.io` DNS deferred

**Date:** 2026-05-03
**Author:** Claude Code (autonomous-continuous build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/API-Documentation-v0.md` (whole document)

## Background

Spec calls for a public docs site at `https://docs.qorium.io` with regional
mirrors and live API explorer. v0 ships:

- Static Next.js 15 site at `apps/docs` (port 5108) with hand-curated
  reference for all v0 endpoints.
- Hand-written OpenAPI 3.1 fragments at `apps/docs/src/lib/openapi.ts`.
- TypeScript SDK at `packages/qorium-sdk` consumed by the docs site as
  the canonical example.
- Static export ready (no live API explorer in v0; the spec marks it
  M6+).

## Adaptation in v0

The docs site renders fully at compile time. No external dependencies:

- No markdown runtime (hand-written HTML with Tailwind-via-inline-styles)
- No OpenAPI playground (the OpenAPI fragments are validated for
  structural correctness; live "Try it" is M6+)
- No SDK auto-generation (the TypeScript SDK is hand-written; SDKs for
  Python / Go / Java are M6+ deliverables)

## What is deferred

- **`docs.qorium.io` DNS** — needs CEO action to publish the A/AAAA
  record + wire the TLS cert.
- **Live API explorer** — needs the OpenAPI fragments wired to a
  Swagger/Redoc UI; deferred per spec roadmap.
- **Multi-language SDKs** — Python, Go, Java SDKs deferred to M6
  (third-party integration phase).
- **Versioning + changelog tooling** — v0 has a single version; the
  changelog page is hand-written. Auto-generated changelog from PR
  titles is a Sprint 2.9 deliverable.

## Reconciliation request to CTO Office

Default action: **ratify v0 static site + TypeScript SDK** as the M3
docs surface. The site is statically exportable so CEO can deploy to
any static-host CDN (Cloudflare Pages, Netlify, Vercel) once DNS is
ready.

## Verification

- `apps/docs/__tests__/sections.test.ts` — 5 cases (catalogue
  completeness, find-by-slug, category grouping, render-non-empty)
- `apps/docs/__tests__/openapi.test.ts` — 6 cases (every fragment
  passes structural validation; per-service path coverage)
- `packages/qorium-sdk/__tests__/client.test.ts` — 8 cases (auth
  header forwarding, idempotency-key, RFC 7807 error parsing, network
  failure handling, 204 No Content)
- `packages/qorium-sdk/__tests__/resources.test.ts` — 8 cases
  (per-resource query parameter assembly + path encoding)
- `packages/qorium-sdk/__tests__/signing.test.ts` — 5 cases
  (deterministic HMAC-SHA256, body change → signature change,
  spec-mandated authorization scheme, custom signed headers, ISO
  timestamp helper)
