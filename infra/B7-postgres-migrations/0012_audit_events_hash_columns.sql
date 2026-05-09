-- =============================================================================
-- Migration 0012 — Hash-chain columns on audit.events (Sprint 4.4.3 / Run #64)
-- =============================================================================
-- Per `infra/Audit-Log-API-Spec-v0.md` §10: each event carries a SHA-256
-- digest of its canonical JSON form (`hash_current`) plus a back-pointer to
-- the prior event's `hash_current` (`hash_previous`). A subsequent
-- verification pass walks the (occurred_at, id) ordering for a tenant and
-- confirms the chain is unbroken — tamper-evidence for SOC 2 audits.
--
-- v0 (this migration + Sprint 4.4.3 code): every new INSERT populates
-- `hash_current` synchronously inside `recordAuditEvent`. `hash_previous`
-- ships nullable; a separate periodic materializer (Sprint 4.4.3.1) walks
-- new rows and links each to its predecessor's `hash_current`. Computing
-- `hash_previous` at INSERT time would require a SELECT FOR UPDATE on the
-- most-recent row per tenant, which serialises writes — unacceptable on
-- the audit hot path.
--
-- The verification utility `verifyAuditChain(events)` (in @qorium/auth)
-- walks an ordered chunk and surfaces any breaks; it tolerates rows where
-- `hash_previous IS NULL` (i.e. pre-Sprint-4.4.3.1 rows) by reporting
-- "unmaterialized" rather than "broken".
-- =============================================================================

ALTER TABLE audit.events
  ADD COLUMN hash_current  VARCHAR(64),
  ADD COLUMN hash_previous VARCHAR(64);

-- Chain-walk index: (tenant_id, occurred_at, id) is the canonical ordering
-- the materializer + verifier walk. Partial-NULL clause keeps it small —
-- only rows with hash_current set are interesting.
CREATE INDEX audit_events_hash_chain_idx
  ON audit.events (tenant_id, occurred_at, id)
  WHERE hash_current IS NOT NULL;

COMMENT ON COLUMN audit.events.hash_current IS
  'SHA-256 (hex) of the canonical JSON form of this event (Sprint 4.4.3).';
COMMENT ON COLUMN audit.events.hash_previous IS
  'SHA-256 (hex) of the previous event in the (tenant_id, occurred_at, id) chain. Materialized async by Sprint 4.4.3.1; NULL for pre-materializer rows.';
