#!/usr/bin/env bash
set -euo pipefail

origins=(
  "qorium-active-origin"
  "talpro-vps"
)

for origin in "${origins[@]}"; do
  echo "== ${origin} =="
  ssh -o BatchMode=yes -o ConnectTimeout=8 "$origin" '
    hostname
    pm2 jlist | node -e '\''
      let input = "";
      process.stdin.on("data", chunk => input += chunk);
      process.stdin.on("end", () => {
        const rows = JSON.parse(input)
          .filter(proc => /^qorium-/.test(proc.name))
          .sort((a, b) => a.name.localeCompare(b.name) || a.pm_id - b.pm_id);
        console.log(`count=${rows.length}`);
        for (const proc of rows) {
          const env = proc.pm2_env || {};
          const memMb = proc.monit && proc.monit.memory ? Math.round(proc.monit.memory / 1024 / 1024) : 0;
          console.log(`${proc.name}\tpm_id=${proc.pm_id}\tstatus=${env.status}\trestart=${env.restart_time || 0}\tunstable=${env.unstable_restarts || 0}\tmemory_mb=${memMb}`);
        }
      });
    '\''
  '
done
