# api.qorium.online Cloudflare Origin Cutover

Status: QG-05 blocker

## Current Evidence

- VPS direct ReadyBank health: `http://127.0.0.1:5101/healthz` returns `service=qorium-readybank`, `git_sha=3528232`, `checks.db=ok`.
- Forced VPS-origin health: `curl --resolve api.qorium.online:443:147.93.103.194 https://api.qorium.online/healthz` returns the same DB-backed ReadyBank health.
- Public Cloudflare-routed health: `https://api.qorium.online/healthz` returns `service=qorium-readybank`, `git_sha=unknown`, `checks.db=not-configured`.
- Public nonce probe `qg05-public-1780213218-30750` appeared 0 times in `/var/log/nginx/qorium-api.access.log`.
- Forced-origin nonce probe `qg05-forced-1780213218-6205` appeared once in `/var/log/nginx/qorium-api.access.log`.
- VPS `cloudflared.service` is token-managed (`cloudflared tunnel run --token ...`) and has no local ingress YAML to edit.

## Desired End State

Normal public requests to `https://api.qorium.online` must reach the VPS Nginx
origin at `147.93.103.194`, then proxy `/healthz` to ReadyBank on
`127.0.0.1:5101`.

Post-cutover, public and forced-origin health must match:

```json
{
  "service": "qorium-readybank",
  "git_sha": "3528232",
  "checks": {
    "db": "ok"
  }
}
```

## Cloudflare Dashboard Path

Use one of these two patterns, depending on how `api.qorium.online` is currently
configured in Cloudflare.

### Option A: Proxied DNS A Record

1. Open Cloudflare dashboard for `qorium.online`.
2. Go to DNS > Records.
3. Change `api.qorium.online` to an `A` record pointing to `147.93.103.194`.
4. Keep proxy enabled if WAF/edge protection is required.
5. Remove or disable any conflicting `api.qorium.online` CNAME/public-hostname
   tunnel route that points at a different origin.

### Option B: Cloudflare Tunnel Public Hostname

1. Open Cloudflare Zero Trust > Networks > Tunnels.
2. Find the tunnel whose token is installed on the VPS as `cloudflared.service`.
3. Add or update public hostname `api.qorium.online`.
4. Route it to the VPS-local Nginx listener:
   - Service: `https://127.0.0.1:443`
   - HTTP Host Header: `api.qorium.online`
   - Origin Server Name: `api.qorium.online`
5. If Cloudflare rejects the local certificate validation against `127.0.0.1`,
   enable the tunnel origin setting that skips local TLS verification, but keep
   the Host/SNI override above.
6. Remove any older public hostname mapping for `api.qorium.online` that points
   to the stale ReadyBank origin.

## Verification

Run from the operator machine:

```bash
curl -ksS https://api.qorium.online/healthz
curl -ksS --resolve api.qorium.online:443:147.93.103.194 https://api.qorium.online/healthz
```

Both responses must report `service=qorium-readybank`, `git_sha=3528232`, and
`checks.db=ok`.

Then prove the public path reaches VPS Nginx:

```bash
probe="qg05-public-$(date -u +%s)-$RANDOM"
curl -ksS "https://api.qorium.online/healthz?qg05_probe=$probe" >/tmp/qorium-public-probe.json
sleep 1
ssh talpro-vps-public "sudo tail -n 300 /var/log/nginx/qorium-api.access.log | grep -F '$probe'"
```

The final command must print exactly one or more log lines containing the probe.

Finally, run the production gate with:

```bash
QORIUM_HEALTH_PATH=/healthz \
QORIUM_HEALTH_REQUIRE_DB_OK=true \
QORIUM_EXPECTED_HEALTH_SERVICE=qorium-readybank \
QORIUM_EXPECTED_HEALTH_GIT_SHA=3528232 \
QORIUM_FORCED_ORIGIN_IP=147.93.103.194 \
QORIUM_FORCED_ORIGIN_EXPECTED_SERVICE=qorium-readybank \
QORIUM_FORCED_ORIGIN_REQUIRE_MATCH=true \
QORIUM_PUBLIC_ORIGIN_ACCESS_LOG=/var/log/nginx/qorium-api.access.log \
pnpm production:gate
```

## Rollback

- Restore the previous Cloudflare DNS record or tunnel public-hostname target.
- Re-run the public and forced-origin health checks above.
- Confirm forced-origin health still returns `checks.db=ok`; this rollback should
  only affect the public Cloudflare path, not the VPS Nginx/ReadyBank route.
