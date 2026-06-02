# Talpro Customer Zero — API Key Issuance Record (Key #001)

**Issued:** 2026-05-03 (Sprint 1.0 Day-1 prep, Run #21)
**Authority:** CTO Office (autonomous mode per CEO delegation; Constitution SO-1)
**Tenant:** `talpro-india-customer-zero`
**Spec:** `infra/D3-Talpro-Internal-API-Key-Spec.md`
**Owner of record (Talpro side):** Talpro India Delivery Head (named at activation)
**Owner of record (QOrium side):** CTO Office — Infrastructure Lead

---

## §1 Key envelope (the part that's not the secret)

| Field | Value |
|---|---|
| `key_record_id` | `qkr_2026_05_03_001` |
| `tenant_id` | `talpro-india-customer-zero` |
| `tenant_prefix` | `talind001` |
| `key_prefix` (visible) | `qor_internal_talind001_` |
| `key_full_format` | `qor_internal_talind001_<32_hex>` |
| `intended_environment` | production (Customer Zero on `api.qorium.online`) |
| `issued_at_utc` | 2026-05-03T14:50:00Z (record opened; plaintext minted by Stream B at first activation) |
| `expires_at_utc` | 2026-10-30T23:59:59Z (180-day rotation window per D3 §2.3) |
| `pre_rotation_notice_at_utc` | 2026-10-16T00:00:00Z (14-day notice per D3) |
| `rotation_calendar_ref` | `infra/B6-secret-rotation-calendar.md` |

---

## §2 Hashing strategy (canonical = Stream B)

**D3 spec wrote:** Argon2id (memory 64 MB, iters 3, parallelism 4).
**Stream B canonical (CTO-DELTA #4, ratified 2026-05-03):** **HMAC-SHA256(pepper, plaintext_key)** — chosen for UNIQUE-constraint compatibility on the keys table.

**Resolution:** **Stream B canonical wins.** D3 spec to be amended to v0.2 in a follow-up (added to QUEUE). Both modes share the same client-facing format; only the at-rest hash representation differs. No CEO action needed for the hash-strategy delta.

| Layer | Implementation |
|---|---|
| At rest | `key_hash = HMAC-SHA256(pepper, key_plaintext)`; pepper stored in Stream B service env (`QORIUM_API_KEY_PEPPER`); never logged |
| In transit | TLS 1.3+ (Nginx termination at `api.qorium.online`) |
| In memory | Plaintext only at issuance + first validation; subsequent calls compare HMAC of incoming key vs stored hash |
| Audit | Every successful/failed validation logged with `key_prefix` (first 20 chars only), `tenant_id`, `route`, `latency_ms`, `status_code`, `client_ip_hash`, `user_agent_hash` |

---

## §3 Scopes granted (Customer Zero)

Per D3 §3, Talpro Customer Zero key receives:

```json
{
  "scopes": [
    "questions:read",       // 5,000 req/day
    "search:read",          // shared quota
    "export:bulk:csv",      // 100 exports/day, max 1,000 rows/export
    "export:bulk:json",     // 100 exports/day
    "responses:write"       // 100,000 writes/day
  ],
  "scopes_explicitly_denied": [
    "admin:*",
    "questions:write",
    "export:stack-vault",   // SO-10 enforced
    "audit:read",
    "config:write"
  ]
}
```

---

## §4 Rate limits

- **Burst:** 60 req/sec (sliding window)
- **Sustained:** 1,000 req/min (token bucket)
- **Daily caps:** as per scope table above
- **Violation:** HTTP 429 with `Retry-After` header

---

## §5 Activation procedure (Stream B side — autonomous, no CEO touch)

When Stream B's `qorium-readybank-service` boots in Customer Zero environment:

```bash
# Inside the Stream B service host (Hostinger VPS or Mac Mini Docker):
node scripts/issue-internal-key.js \
  --tenant talpro-india-customer-zero \
  --tenant-prefix talind001 \
  --scopes 'questions:read,search:read,export:bulk:csv,export:bulk:json,responses:write' \
  --expires 2026-10-30T23:59:59Z \
  --record-id qkr_2026_05_03_001 \
  --emit-plaintext-once stdout
```

Expected output (single-use, immediately erased after capture):

```
========== QOR INTERNAL KEY (single-display) ==========
Tenant:      talpro-india-customer-zero
Prefix:      qor_internal_talind001_
Plaintext:   qor_internal_talind001_<32_hex>     <-- copied once into Talpro 1Password vault
Hash type:   HMAC-SHA256
Hash:        <64_hex>                            <-- stored in DB
Expires:     2026-10-30T23:59:59Z
=======================================================
```

Plaintext **never** written to disk; `--emit-plaintext-once stdout` is the only display channel.

---

## §6 CEO physical action (≤60 sec, Talpro side)

| Step | Action | Time |
|---|---|---|
| 1 | When CTO Office signals "key minted", open Talpro India 1Password (existing) | 15 sec |
| 2 | Create new entry: name `QOrium Customer Zero — API Key #001` | 10 sec |
| 3 | Paste plaintext key value (sent via Signal one-time link) | 10 sec |
| 4 | Set `expires` field to 2026-10-30 | 10 sec |
| 5 | Tag `qorium`, `customer-zero`, `production` | 10 sec |
| 6 | Save | 5 sec |

**Total CEO time: ~60 sec.** Optional: Bhaskar can delegate this to Talpro India Delivery Head once named.

If CEO unavailable: CTO Office stores plaintext temporarily in Talpro Universe shared vault under `qorium/customer-zero/key-001` with 24h auto-expire; Bhaskar copies to 1Password at next opportunity.

---

## §7 Revocation

- **Trigger:** any of (a) suspected compromise; (b) Talpro India Delivery Head off-boards; (c) joint CEO + CTO decision to rotate early.
- **Mechanism:** `node scripts/revoke-internal-key.js --record-id qkr_2026_05_03_001 --reason "<one-line>"`
- **Effect within:** 30 minutes (Redis cache invalidation + service rolling restart)
- **Re-issuance:** new `key_record_id` (`qkr_2026_05_03_002`); never re-use plaintext

---

## §8 Audit-log destination

- **Service:** `qorium-readybank-service` Pino structured logging
- **Sink:** Loki on `api.qorium.online` infrastructure (deferred to Phase 1 wiring; for Day-1, Pino-pretty stdout into PM2 logs at `/root/.pm2/logs/qorium-readybank-out.log`)
- **Retention:** 90 days at edge; 1 year in cold storage (Cloudflare R2)

---

## §9 Status

- **Record opened:** ✅ (this file)
- **Plaintext minted:** ⏳ pending Stream B service boot in Customer Zero env
- **Stored in Talpro 1Password:** ⏳ pending plaintext mint
- **First validated request:** ⏳ pending smoke test (see `smoke-test-invitation-customer-zero-day-1.md`)

---

*Prepared by CTO Office, Run #21. Constitution v2.0 SO-1, SO-9.*
