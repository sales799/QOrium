# QOrium App

Lane A Phase 1 backend vertical slice:

- M12 skill taxonomy seed with 150 nodes.
- M21 audit log schema, helper, and DB-level protection migration.
- M1 assessment builder, signed candidate links, preview, submit, and result flow.
- M1.B 25-skill / 250-question seed library.
- M2 sandbox bridge for JavaScript, Python, and Java with timeouts.
- M4 grader worker with OpenRouter support and deterministic local fallback.

## Run

```bash
pnpm install
pnpm seed
pnpm dev
```

Services:

- Web: http://localhost:3000
- API: http://localhost:4100
- Grader worker: CLI package, imported by API fallback
- Sandbox bridge: http://localhost:4102

For local infrastructure:

```bash
docker compose -f infra/docker-compose.dev.yml up -d
```
