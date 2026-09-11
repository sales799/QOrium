# Stack-Vault operation permissions

Stack-Vault authenticates the API key upstream, then requires an explicit operation scope before a vault database lookup:

| Operation | Required scope |
| --- | --- |
| GET /v1/stack-vault/questions | stack-vault:read |
| GET /v1/stack-vault/questions/:uuid | stack-vault:read |
| POST /v1/stack-vault/questions | stack-vault:write |

These scope names match the pre-existing Stack-Vault route test contract. Generic questions:read/questions:write do not grant private-vault access. Read does not imply write, and write does not imply read. Missing authentication remains 401; missing operation scope is 403. A key containing export:stack-vault remains forbidden even if it has the operation permission. Active contract and tenant-bound repository checks still apply afterward.

Before release, inventory existing vault-client scope assignments using authorized access. Keys lacking the required permission will receive 403 after deployment; do not silently grant scopes to preserve previously overbroad access. Provision only permissions authorized by the customer's role/contract. No live key assignments changed in this repair.

Tests inject synthetic authenticated contexts and database stubs to isolate route permission enforcement. They do not replace production API-key authentication, customer entitlement review, database tenant-isolation tests or live acceptance. Production watermark pepper configuration and forensic audit persistence remain separate unverified controls.
