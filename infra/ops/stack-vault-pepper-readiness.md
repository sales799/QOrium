# Stack-Vault watermark decryption readiness

Outside explicit development/test environments, Stack-Vault now requires a decryptVaultPepper function. createServer passes its configured environment and optional decryptor to vault middleware. An absent decryptor rejects vault requests with503 before DB lookup. A throwing decryptor or empty/whitespace output produces a generic503 without returning provider error text or attaching a vault context. Development/test retains the synthetic plaintext fallback.

This is a fail-closed configuration guard and integration point, not a deployed encryption provider. The default production bootstrap currently supplies no decryptor, so this change MUST NOT be released to active vault customers until the actual encrypted storage format and authorized key provider are verified and wired through ServerDeps. Do not assume that the `_enc` column proves encryption; do not reinterpret old ciphertext or generate replacement peppers to make the guard pass.

Release prerequisites:

- Verify actual stored format and key-provider ownership without exposing secrets in reports.
- Implement the authenticated decryptor for that existing format and inject it into createServer. Test valid ciphertext, wrong keys, tampering and provider failure using synthetic fixtures.
- Verify client scopes and authorized staging retrieval, including stable watermark compatibility with previously issued material.
- Obtain independent review and guarded deployment/rollback evidence. No live key rotation or data migration is included in this change.

The injected function is a trusted boundary; a caller-supplied identity function cannot be detected as cryptographically invalid by this guard. Tests demonstrate configuration/error handling, not encryption-at-rest or forensic attribution. Watermark audit persistence remains separate work.
