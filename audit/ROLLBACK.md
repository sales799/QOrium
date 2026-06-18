# Rollback

Generated: 2026-06-18

## Fast Rollback

Use the QOrium deploy rollback runbook if production smoke fails:

```bash
safe-deploy qorium-marketing --rollback
```

If the wrapper does not expose rollback on the host, follow `cto/runbooks/deploy-rollback.md` and restore the previous release symlink or previous known-good git SHA through the existing safe deploy path.

## What To Recheck After Rollback

```bash
curl -sSI https://qorium.online/
curl -sSI https://qorium.online/healthz
curl -sSI https://qorium.online/privacy
```

## Rollback Triggers

- Production build fails after deploy.
- Homepage, pricing, demo, or contact route returns non-200.
- Security headers disappear.
- Forms fail to render.
- Sitemap route throws or returns malformed XML.
