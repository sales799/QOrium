# API readiness

`GET /health` and `GET /healthz` return the same uncached readiness response.
`checks.db` is `ok`, `unavailable`, or `memory-fallback`. An unavailable database
returns HTTP 503. Memory fallback returns 200 for local development and 503 in
production. The response contains no connection strings, credentials, row counts
or database error text.

The PostgreSQL check uses its own read-only connection and reads at most one
skill ID, without calling seeding or repository initialization methods. It checks
connectivity and access to the core skill table, not complete schema migration,
content validity or every application dependency. Empty migrated tables can pass
this connectivity check; content readiness needs a separate acceptance gate.

Connection and SQL/lock timeouts are two seconds, with a 2.5-second overall query
deadline and up to half a second for connection cleanup. Concurrent probes on one
repository share an in-flight check. Normal application connections and their
query timeouts are unaffected. A blocked read returns 503 and subsequent probes
can recover once the database is available.

`git_sha` reports a valid full 40-character `GIT_SHA` supplied by the deployment
environment, otherwise `unknown`. This is configured metadata, not independently
verified deployment provenance. Populate it from the reviewed release and compare
against deployment evidence; never invent a hash to satisfy a gate. The PM2
configuration forwards the variable without a fabricated default.

Validation uses disposable PostgreSQL: empty-table counts remain zero after a
probe, an exclusive table lock causes a bounded 503, and readiness returns to 200
after releasing the lock. Production deployment and monitoring reconfiguration
were not performed as part of this change.
