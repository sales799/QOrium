# Architecture Decision Records — Index + Template

**Owner:** CTO Office · **Authority:** Constitution SO-16 (Documentation as Code) + this folder's `cto/README.md`
**Status:** living index — append new ADRs in numerical order; don't renumber.

---

## Why ADRs

Every material technical decision in QOrium is recorded here. The format is borrowed from Michael Nygard's original ADR proposal (2011) and tightened to QOrium's constitutional discipline:

- **Numbered, immutable.** `0001` stays `0001` forever; if a decision is reversed, write `0042` titled "supersedes 0001" — never edit `0001`.
- **Status field is canonical.** `Proposed` → `Accepted` → `Deprecated` → `Superseded by 0042`. Never delete.
- **Cross-referenced.** Every ADR cites the Constitutional anchor (which Article / Standing Order it satisfies or amends).
- **Reviewable.** ADR PRs require at-least-one CTO + (CEO if material per Article VI threshold). Y1 = CTO solo with audit-log discipline; Y2+ = mandatory second reviewer.

---

## Template

Copy below into `cto/adrs/NNNN-short-kebab-title.md`:

```markdown
# ADR NNNN — <Short title in title case>

**Status:** Proposed | Accepted | Deprecated | Superseded by NNNN
**Date:** YYYY-MM-DD
**Authors:** <name(s)> · CTO Office
**Constitutional anchor:** Article <X> / SO-<NN> / §<Y> (cite the specific clause this decision implements or amends)
**Reviewers:** CTO + <CEO if material per Article VI threshold>

---

## Context

<What's the situation? What forces are at play? Why does a decision need to be made
NOW? Cite the trigger — a CI failure, a security audit finding, a customer demand,
a Constitutional Amendment, etc.>

## Decision

<The decision itself, in active voice. "We will..." not "We should consider..."
One paragraph, max 120 words. The detail goes in Consequences.>

## Consequences

### Positive

<What gets easier or better? What becomes possible?>

### Negative

<What gets harder or worse? What's the cost?>

### Neutral / observations

<Side effects neither good nor bad — but worth knowing.>

## Alternatives considered

### Alternative 1: <name>

<One paragraph. Why was this rejected?>

### Alternative 2: <name>

<Same shape.>

(Repeat as needed.)

## Implementation notes

<Concrete file paths affected, commits that landed this decision, follow-up
ADRs that build on this one, runbooks that derive from this decision, etc.>

## Verification

<How do we know this decision is being honored? CI check? Lint rule?
Code review checklist? Periodic audit?>

## References

- <Constitutional clause cited>
- <Companion docs cited>
- <External docs / RFCs / vendor docs cited>
```

---

## Status definitions

| Status                 | Meaning                                                                              | Next valid status              |
| ---------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| **Proposed**           | Drafted; under review                                                                | Accepted, Withdrawn            |
| **Accepted**           | Active and binding                                                                   | Deprecated, Superseded by NNNN |
| **Deprecated**         | No longer best practice but no replacement (e.g., legacy code stuck on old approach) | Superseded by NNNN, Removed    |
| **Superseded by NNNN** | Replaced by a newer ADR; cite the replacement                                        | (terminal)                     |
| **Withdrawn**          | Proposed but never accepted                                                          | (terminal)                     |

---

## Index of accepted ADRs (chronological)

| #                                                            | Date       | Status   | Title                                                                              |
| ------------------------------------------------------------ | ---------- | -------- | ---------------------------------------------------------------------------------- |
| [0001](./0001-marketing-tsconfig-standalone.md)              | 2026-04-29 | Accepted | Marketing app uses standalone tsconfig (not extending tsconfig.base.json)          |
| [0002](./0002-tailwind-v4-css-first-theme.md)                | 2026-04-30 | Accepted | Tailwind v4 CSS-first @theme adoption (no tailwind.config.js)                      |
| [0003](./0003-mailer-fallback-chain.md)                      | 2026-05-01 | Accepted | Mailer fallback chain: Resend → Gmail SMTP → console-log                           |
| [0004](./0004-vps-pm2-nginx-letsencrypt.md)                  | 2026-05-04 | Accepted | VPS deploy via PM2 + nginx + Let's Encrypt (deferred Vercel)                       |
| [0005](./0005-stdin-fed-env-injection.md)                    | 2026-05-06 | Accepted | Env-var injection via stdin in deploy workflow (secrets never in process listings) |
| [0006](./0006-marketing-decoupled-from-monorepo-packages.md) | 2026-04-29 | Accepted | Marketing app does NOT import @qorium/auth or @qorium/db (deliberate decoupling)   |

---

## Backfill discipline

Several decisions on this list were made ad-hoc during the autonomous build sessions and backfilled into ADRs after the fact. The constitutional rule going forward (per SO-16):

> **No new architectural decision merges to `main` without a corresponding ADR in `Accepted` status, written or updated in the same PR.**

Backfilled ADRs from before this rule was operationalized are explicitly marked in their "Context" section.

---

## Quarterly ADR audit

Per CTO cadence in `cto/README.md`:

- Once per quarter, CTO reviews all ADRs in `Accepted` status.
- For each, verify: still in force? Still being honored in code? Constitutional anchor still valid?
- Any drift → either deprecate the ADR (write a superseding one) OR fix the code drift.
- Audit findings logged in the next monthly business review (`bali/templates/monthly-business-review.md` §9 asks for CEO/CTO).

---

_Maintained by CTO Office. Authority: Constitution SO-16 (Documentation as Code), §2.3 (CTO charter). ADRs are immutable once accepted._
