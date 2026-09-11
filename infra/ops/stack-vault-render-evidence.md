# Stack-Vault render evidence

A successful question render now awaits insertion of `stack_vault.question.render_prepared` into the existing tenant-scoped audit.events store before sending content. If persistence fails, the route returns generic503 and withholds the rendered body and watermark. The generic audit helper's error callback deliberately propagates this failure; unrelated audit callers keep their existing behavior.

The record contains tenant/question identifiers, API-key ID (not credential), full render ID, visible footer, HMAC signature, version and SHA256 of the exact serialized `{body_md,body_json}` response content. It contains no raw question content, base seed or pepper. actor_id remains null because its schema foreign key references app.users rather than API keys; API-key identity is recorded explicitly in the payload. Explicit empty changes matches the helper's stored/hash representation.

The event proves preparation/persistence, not client receipt. Network failure after insertion can leave an event without delivery. No past events are reconstructed. Audit retention/access controls remain applicable; long-term storage, chain materialization, restore and live DB grants are unverified release conditions.

The footer uses a short tenant prefix and eight signature hex characters, not the full render ID. It is a search hint, not collision-free forensic proof. Full evidence, authentic stored keys, source material and specialist review remain necessary for attribution. Starter homoglyph marking may not survive normalization and is not a certified leak detector.

Release requires schema/grants compatibility and database-backed tests, combined testing with scope/decryption guards, independent review and staging/live acceptance. No migration or live-data write was performed during implementation. Existing real-decryptor/key-provider prerequisites still block deployment.
