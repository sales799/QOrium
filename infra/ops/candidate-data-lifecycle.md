# Candidate-data lifecycle: inventory before erasure

Source baseline: main c606fa3. This is an operational source audit and read-only tool, not a retention policy, legal opinion, deployed control or completion certificate.

## Data map

| Surface | Source evidence | Impact and unresolved controls |
| --- | --- | --- |
| Invitation identity and bearer token | migration 0021; repositories/assessments.ts; routes/assessments.ts and recruiter.ts | Email required, name optional, token stored. Expiry gates access; expiry does not erase the row. Delivery can copy email/link to the configured mail provider and recipient. |
| Attempts and integrity | migration 0021; repositories/attempts.ts | Invitation links to attempts, scores and integrity flags. `cand_<invitation-id>` is a linkable pseudonym. Deleting an invitation first is blocked by the attempt foreign key. |
| Answers | migrations 0001 and 0021; repositories/attempts.ts | Response body and suspicious signals may contain personal data. Nullable attempt linkage means an attempt-only inventory can miss rows; candidate ID must also be considered within the tenant. |
| Grading | migration 0019 | Grade decisions reference responses with cascading deletion; reasoning and rubric content need inclusion in any authorized erasure plan. Shared question data is not a candidate record and must not be deleted incidentally. |
| Audit | migrations 0001, 0010, 0012 | Entity IDs, JSON payload/changes, IP and user-agent can be identifying. Hash-chain and retention requirements need reconciliation before modification. Legacy null-tenant records require a separate authorized ownership review. |
| Audit exports | migration 0011; repositories/audit-exports.ts; routes/audit.ts | Exports store BYTEA content. Expired download returns 410; searched source has no expiry-driven content cleanup. An expiry timestamp alone is not proof of erasure. Tenant export counts are review candidates, not confirmed individual matches. |
| Webhooks/ATS | migrations 0013 and 0014; associated dispatch/connectors | Payloads, delivery history and downstream copies may remain. Candidate membership cannot be inferred reliably from arbitrary JSON or external systems. |
| Logs and observability | services/readybank/src/logger.ts | Authorization/cookie headers are redacted, but default HTTP URL serialization has no candidate invitation-path/query-token filter. Reproduce with synthetic requests in a separate scoped fix. Do not copy real request logs into audit evidence. |
| Backups and copies | infra/B7-postgres-migrations/scripts/restore-pitr.sh; infrastructure backup configuration/docs | Source describes PITR; actual retention, exports, provider copies and restore handling remain unverified. These counts do not inspect backups. |

Paths above are repository-relative. No general candidate erasure worker was found in the searched ReadyBank source, migrations and operational scripts. This does not rule out manual or external processes. Public privacy/DPA statements and internal SLA documents are claims to reconcile with operations, not evidence that deletion ran. Do not invent a retention duration or silently delete existing records.

## Read-only impact inventory

Run `candidate-data-impact.sql` only against an explicitly selected authorized database with a read-only role. Use PostgreSQL psql, disable local psql startup configuration with `-X`, and pass `tenant_id` and `invitation_id` UUID variables. Supply connection credentials through the established secret mechanism; do not place passwords or candidate tokens on command lines or in reports. Example, after an authorized connection has been configured:

```sh
psql -X -v tenant_id=11111111-1111-4111-8111-111111111111 \
  -v invitation_id=22222222-2222-4222-8222-222222222222 \
  -f infra/ops/candidate-data-impact.sql
```

The example UUIDs are synthetic. The tool starts a repeatable-read, read-only transaction, imposes statement and lock timeouts, returns counts only and rolls back. It never returns identity fields, tokens, answers or reasoning. Missing/incorrect tenant-invitation pairs return `invitation_found: false` and zero counts. A missing schema/column or timeout is an error, not a zero-data finding. This is a trusted operator tool, not a tenant-facing API or authorization layer.

Coverage is deliberately incomplete (`scope_complete: false`): one invitation does not locate all invitations for a person; unrelated caller-supplied candidate aliases, JSON-embedded identifiers, legacy null-tenant audit entries, export contents, mailboxes, logs, downstream integrations and backups need separate review. Responses sharing a scoped candidate ID may span attempts and therefore require review rather than automatic removal. Do not use counts as a deletion command or an erasure certificate.

## Completion prerequisites

1. Reconcile default PII collection with ratified SO19 and applicable customer/DPA conditions; record the authoritative policy and ownership.
2. Verify live schema and release identity, then run the read-only inventory using authorized access. Do not apply migrations to make the inventory pass.
3. Resolve all candidate aliases, legal holds, audit-chain constraints, exports, downstream/provider copies and backup restore handling.
4. Review a concrete removal/anonymization plan with rollback and a safe test dataset before introducing a mutation path.
5. Verify the implemented workflow end-to-end and retain minimal non-identifying completion evidence. A source build alone cannot certify this control.
