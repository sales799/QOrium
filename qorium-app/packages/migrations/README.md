# Database migration and persistence rollout

Run `pnpm db:migrate` from `qorium-app` with an explicitly supplied `DATABASE_URL`.
The command is a manual deployment step, never an API startup action. Do not point
it at production until backup/restore evidence, the deployed revision, schema
inventory, and release approval gates have been verified.

Migrations 0001 and 0002 are immutable. Migration 0003 adds question payload fields
and answer positions; it does not replace questions, answers, or audit records.
Startup seeding inserts missing rows only and preserves all existing rows.
Existing questions receive column defaults; missing historical starter code,
rubrics, and other payloads require a separately reviewed data backfill. Historical
answer order cannot be reconstructed from the new position default of zero.
New answers retain their submitted order; legacy ties use answer ID for a stable
read order, without claiming that this was their original order.

The migration runner serializes concurrent invocations using a PostgreSQL
transaction advisory lock. It checks the SHA-256 digest and sequence of every
applied migration before executing new SQL. The full pending batch and ledger
writes commit together or roll back together. A changed, removed, or reordered
applied migration is rejected. Never modify an applied migration to repair it;
restore the reviewed file and add a new numbered migration.

An existing schema without a checksum ledger is refused without adoption or
rewriting. A filename-only legacy ledger is also refused. For these databases,
first compare a schema-only export, migration provenance, enums, constraints,
indexes and triggers with the reviewed migration history on a restored copy.
Baseline adoption is deliberately not automated here. No production baseline or
backfill has been verified by this change.

## Isolated validation

Set `QORIUM_TEST_DATABASE_URL` to a disposable PostgreSQL 16 instance whose test
role can create databases. Both commands create randomly named test databases,
then drop only those databases in cleanup. Never use live database credentials.

- `pnpm test:migrations`: concurrent/rerun, history tampering, rollback,
  untracked/legacy refusal and additive upgrade preservation checks.
- `pnpm test`: includes payload round trips, answer order, transaction rollback
  and preservation of authored content when the test URL is present. Database
  tests are explicitly skipped without that variable; a skip is not DB evidence.

These changes do not implement tenant isolation, backfill historical content,
execute browser acceptance tests, or certify a production release.
