# QOrium Rakshak QG-05 Run Evidence

Generated: 2026-05-31T07:36:30Z

## Scope

This note records the Rakshak allow-list remediation and run creation needed for
QG-05. It is not a Rakshak score and does not claim the 17-audit playbook has
been executed.

## Live Remediation

- Added `qorium.online` and `qorium.in` to the Talpro MCP Rakshak owned-domain suffix list.
- Rebuilt `/opt/talpro-mcp-server/dist` with `npm run build`.
- Restarted `talpro-mcp` with PM2.
- Verified `talpro_rakshak(domain=qorium.online, soakHours=2)` no longer refuses the domain.

## Run

- Run ID: `rakshak-qorium_online-mptgu36b-413f`
- Workspace: `/opt/apps/rakshak-runs/rakshak-qorium_online-mptgu36b-413f`
- Domain: `qorium.online`
- Soak: `2h`
- Initiator: `codex @ qorium-qg05`
- Started at: `2026-05-31T07:36:05.269Z`

Current `run.json` state:

```json
{
  "status": "executing",
  "saved": [],
  "score": null,
  "verdict": null
}
```

## Remaining Work

Execute Rakshak Phase 0, run the 17 audit reports from the generated playbook,
save each result with `rakshak_save`, and call `rakshak_consolidate` before
using the score as QG-05 proof.
