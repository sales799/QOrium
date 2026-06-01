# CODEX COMPLETION — QORIUM BHIMA — ACTIVE ORIGIN BLOCKER — 2026-06-01

## Status

BLOCKED by credentials/route ownership.

## Finding

The `talpro-vps` SSH alias points to `147.93.103.194`, but `QUEUE-QOrium.md` Run #17 records Cloudflare live origin for `qorium.online` and `api.qorium.online` as `187.127.155.150`.

## Evidence

- Old origin `147.93.103.194`: SSH works, PM2 has 38 `qorium-*` processes online, and the chatbot/nginx repair was completed there.
- Active origin `187.127.155.150`: `ssh -p 2244 root@187.127.155.150` rejects the available public key; port 22 times out.
- Public API hostname: `https://api.qorium.online/healthz` returns ReadyBank production JSON from the active Cloudflare origin.
- Public chatbot hostname: `https://api.qorium.online/chatbot/v1/healthz` remains 404 until the active origin is updated or Cloudflare route credentials are available.

## Required CEO/Infra Action

Provide an SSH alias/key for `187.127.155.150` or provide Cloudflare route credentials. After that, repeat the same `6ac741c` build and nginx route deployment on the active origin and re-run public verification.
