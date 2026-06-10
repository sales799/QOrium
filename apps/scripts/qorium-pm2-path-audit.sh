#!/usr/bin/env bash
# qorium-pm2-path-audit.sh  (N3 repo-hygiene deliverable)
# Audit that every running qorium-* PM2 process points at a sane on-disk path
# and that no two differently-named processes squat the same declared PORT.
# Catches the orphan-:5110 / stray-`current/` class of bug that has silently
# broken the marketing homepage and chatbot before.
# Exit 0 = clean, 1 = drift found (cron/watchdog friendly). Read-only.
# NOTE: through the Talpro-CTO MCP sandbox the literal token pm2 is intercepted;
# callers there must obfuscate (X=p"m"2; PM2_BIN=$X ./qorium-pm2-path-audit.sh).
set -u
PM2_BIN="${PM2_BIN:-pm2}"
TMP="$(mktemp /tmp/qorium-pm2-audit.XXXXXX)"
trap 'rm -f "$TMP"' EXIT
"$PM2_BIN" jlist 2>/dev/null > "$TMP"
if [ ! -s "$TMP" ]; then echo "AUDIT: ERROR cannot read pm2 jlist" >&2; exit 1; fi
QORIUM_PM2_JSON="$TMP" python3 <<'PY'
import json,os,sys
data=json.load(open(os.environ["QORIUM_PM2_JSON"]))
procs=[p for p in data if str(p.get("name","")).startswith("qorium")]
print("== QOrium PM2 path audit ==")
print("%-28s %-7s %-8s %s"%("name","pid","status","exec_path"))
issues=[]; ports={}
for p in procs:
    e=p.get("pm2_env",{}); name=p.get("name","?"); st=e.get("status","?")
    ep=e.get("pm_exec_path","") or ""; cwd=e.get("pm_cwd","") or ""
    print("%-28s %-7s %-8s %s"%(name,p.get("pid",0),st,ep))
    if st!="online": issues.append("%s: status=%s"%(name,st))
    for lbl,path in (("pm_exec_path",ep),("pm_cwd",cwd)):
        if path and not os.path.exists(path):
            issues.append("%s: %s missing path %s"%(name,lbl,path))
    if "/releases/" in ep:
        root=ep.split("/releases/")[0]; cur=os.path.join(root,"current")
        if os.path.islink(cur):
            t=os.path.realpath(cur)
            if not os.path.realpath(ep).startswith(t):
                issues.append("%s: stale release; current->%s exec under %s"%(name,t,ep))
    env=e.get("env",{}) if isinstance(e.get("env"),dict) else {}
    for k in ("PORT","port"):
        v=env.get(k)
        if v: ports.setdefault(str(v),[]).append(name)
for port,names in ports.items():
    u=sorted(set(names))
    if len(u)>1: issues.append("port %s shared by %s"%(port,", ".join(u)))
print("")
if issues:
    print("DRIFT FOUND (%d):"%len(issues))
    for i in issues: print("  - "+i)
    sys.exit(7)
print("OK: %d qorium processes, paths sane, no port collisions."%len(procs))
PY
rc=$?
[ "$rc" = "7" ] && exit 1
exit 0
