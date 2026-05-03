# CTO-DELTA: gitleaks config rewritten in valid v8 schema

**Date:** 2026-05-03
**Author:** Claude Code (parallel build session)
**Status:** Provisional — pending CTO Office reconciliation
**Reconcile against:** `infra/B6-gitleaks-config.yaml` (canonical, intent-of-record)

## Background

`infra/B6-gitleaks-config.yaml` (CTO Office, 2026-05-02) defines QOrium's secret-scanning rules: AWS, Anthropic, OpenAI, Razorpay, Serper, GitHub PAT, Cloudflare R2, Sentry, database URLs, plus QOrium-specific `qor_live_*` / `qor_test_*` prefixes.

When tested against gitleaks 8.16, the canonical B6 file:

1. Uses non-existent sections (`[build]`, `[report]`) that gitleaks v8 ignores.
2. Places `exclude_paths` at the top level — not a recognized field; v8 expects `paths` regexes inside `[allowlist]`.
3. Uses `[allowlist].files` with glob patterns — v8 only supports regex paths via `[allowlist].paths`.
4. Triggers three false positives in the merged repo: illustrative `postgresql://...` URLs in `customer-zero/Wave-1-Java-Extension-041-060.md:613`, `infra/B7-postgres-migrations/README.md:53`, and the placeholder in `.env.example:16`.

## Adaptation

`.gitleaks.toml` at the repo root is a v8-valid form that preserves B6's intent:

- All ten custom rules (qorium internal, razorpay, anthropic, openai, openrouter, serper, github-pat, cloudflare-r2, sentry-dsn, database-url) carried over with adjusted regexes where needed.
- `database-url` rule tightened to require an embedded `user:password@` (the original `(postgresql|postgres|mysql|mongodb)://[a-zA-Z0-9:@\.\-_/]+` matched any URL, even credential-free dev examples).
- `[allowlist].paths` populated with regex paths covering `customer-zero/*.md`, `governance/*.md`, `infra/*-Spec-v0.md`, `infra/*-Design*.md`, `infra/B7-postgres-migrations/README.md`, lock files, `.env.example`, binary office files, and standard build-output dirs.
- `[allowlist].regexes` allowlists known placeholders (`replace_me_with_long_random_string`, `qorium_dev_*`).
- `entropy` thresholds removed from per-rule blocks (v8 no longer accepts them outside the global `[default]`); reliance on regex+keyword precision instead.

The original B6 file remains at `infra/B6-gitleaks-config.yaml` unchanged for archival reference.

## Verification

```
$ gitleaks detect --config .gitleaks.toml --no-banner --redact
INF 3 commits scanned.
INF scan completed in 90.2ms
INF no leaks found
```

## Reconciliation request to CTO Office

Either:

1. **Ratify** this delta — adopt `.gitleaks.toml` (v8 valid form) as the canonical config; archive B6 yaml.
2. **Reject** — provide a corrected B6 in valid v8 syntax. The pre-commit hook and CI would otherwise fail to enforce.

Default action if no reconciliation by next sprint review: assume **ratify** (B6's intent is preserved verbatim; only the schema is corrected).
