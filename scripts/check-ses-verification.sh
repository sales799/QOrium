#!/usr/bin/env bash
###############################################################################
# scripts/check-ses-verification.sh
#
# Sprint 4.4 — DNS health check for the qorium.online SES email-auth
# records. Verifies that all 5 records (3 DKIM CNAMEs + SPF TXT + DMARC
# TXT) resolve correctly from a public resolver (Cloudflare 1.1.1.1).
#
# Why server-side: dig / nslookup are not always installed on macOS;
# this script uses Python's socket library to query DNS directly,
# matching the verification pattern used during Run #62 / #63.
#
# Usage:
#   ./scripts/check-ses-verification.sh           # default: all records
#   ./scripts/check-ses-verification.sh --json    # machine-readable output
#   ./scripts/check-ses-verification.sh --resolver 8.8.8.8  # use Google DNS
#
# Exit codes:
#   0   all records resolve correctly
#   1   one or more records missing or wrong target
#   2   network / DNS resolver unreachable
#
# Cron-able; logs to stdout for systemd-journal capture.
###############################################################################

set -euo pipefail

DOMAIN="qorium.online"
RESOLVER="1.1.1.1"
JSON_OUTPUT=false

# 3 DKIM tokens captured from AWS SES Easy DKIM (Run #63).
# Update this list if SES rotates DKIM (will surface as "wrong target"
# failures here; rotate via Cloudflare DNS edit-in-place per runbook).
DKIM_TOKENS=(
  "roesn32foh2j4gxmd3t366nse3k6tflr"
  "pw64uji46tmduen24oltmbar5revwujt"
  "dtdfvqj7mzv2b33hbkmtqvqpnxneq7us"
)

while [[ $# -gt 0 ]]; do
  case "$1" in
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --resolver)
      RESOLVER="$2"
      shift 2
      ;;
    --domain)
      DOMAIN="$2"
      shift 2
      ;;
    -h|--help)
      sed -n '2,/^###/p' "$0" | sed 's/^# //'
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# Run the Python DNS verification helper. This is intentionally inlined
# rather than a separate file so the script is single-file portable.
python3 - "$DOMAIN" "$RESOLVER" "$JSON_OUTPUT" "${DKIM_TOKENS[@]}" <<'PYEOF'
import socket
import struct
import sys
import json

domain = sys.argv[1]
resolver = sys.argv[2]
json_output = sys.argv[3] == "true"
dkim_tokens = sys.argv[4:]

QTYPE_CNAME = 5
QTYPE_TXT = 16


def build_query(name: str, qtype: int) -> bytes:
    pkt = struct.pack(">HHHHHH", 0x1234, 0x0100, 1, 0, 0, 0)
    for label in name.split("."):
        pkt += bytes([len(label)]) + label.encode()
    pkt += b"\x00" + struct.pack(">HH", qtype, 1)
    return pkt


def parse_name(data: bytes, offset: int) -> tuple[str, int]:
    parts = []
    while True:
        length = data[offset]
        if length == 0:
            offset += 1
            break
        if length & 0xC0 == 0xC0:
            ptr = ((length & 0x3F) << 8) | data[offset + 1]
            sub_name, _ = parse_name(data, ptr)
            parts.append(sub_name)
            offset += 2
            break
        offset += 1
        parts.append(data[offset : offset + length].decode())
        offset += length
    return ".".join(parts), offset


def query(name: str, qtype: int) -> list[str]:
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    sock.settimeout(5)
    try:
        sock.sendto(build_query(name, qtype), (resolver, 53))
        resp, _ = sock.recvfrom(4096)
    except (socket.timeout, OSError) as e:
        raise RuntimeError(f"resolver {resolver} unreachable: {e}")
    finally:
        sock.close()

    # Skip header + question section
    offset = 12
    _, offset = parse_name(resp, offset)
    offset += 4  # qtype + qclass

    # Read answer count from header
    ancount = struct.unpack(">H", resp[6:8])[0]
    answers = []
    for _ in range(ancount):
        _, offset = parse_name(resp, offset)
        rec_type, _, _, rdlength = struct.unpack(">HHIH", resp[offset : offset + 10])
        offset += 10
        if rec_type == QTYPE_CNAME:
            target, _ = parse_name(resp, offset)
            answers.append(target)
        elif rec_type == QTYPE_TXT:
            txt_offset = offset
            txt_value = ""
            while txt_offset < offset + rdlength:
                txt_len = resp[txt_offset]
                txt_value += resp[txt_offset + 1 : txt_offset + 1 + txt_len].decode()
                txt_offset += 1 + txt_len
            answers.append(txt_value)
        offset += rdlength
    return answers


checks = []

# 3 DKIM CNAMEs
for i, token in enumerate(dkim_tokens, start=1):
    name = f"{token}._domainkey.{domain}"
    expected_target = f"{token}.dkim.amazonses.com"
    try:
        results = query(name, QTYPE_CNAME)
        ok = any(r == expected_target for r in results)
        checks.append({
            "check": f"DKIM selector {i}",
            "name": name,
            "expected": expected_target,
            "got": results,
            "ok": ok,
        })
    except RuntimeError as e:
        checks.append({
            "check": f"DKIM selector {i}",
            "name": name,
            "error": str(e),
            "ok": False,
        })

# SPF TXT at apex
try:
    results = query(domain, QTYPE_TXT)
    spf_ok = any("v=spf1" in r and "amazonses.com" in r for r in results)
    checks.append({
        "check": "SPF",
        "name": domain,
        "expected_substr": "v=spf1 include:amazonses.com",
        "got": results,
        "ok": spf_ok,
    })
except RuntimeError as e:
    checks.append({"check": "SPF", "name": domain, "error": str(e), "ok": False})

# DMARC TXT at _dmarc
dmarc_name = f"_dmarc.{domain}"
try:
    results = query(dmarc_name, QTYPE_TXT)
    dmarc_ok = any(r.startswith("v=DMARC1") for r in results)
    checks.append({
        "check": "DMARC",
        "name": dmarc_name,
        "expected_substr": "v=DMARC1",
        "got": results,
        "ok": dmarc_ok,
    })
except RuntimeError as e:
    checks.append({"check": "DMARC", "name": dmarc_name, "error": str(e), "ok": False})

if json_output:
    print(json.dumps({"domain": domain, "resolver": resolver, "checks": checks}, indent=2))
else:
    print(f"\nDNS health check — {domain} via {resolver}\n")
    print(f"{'Check':<22} {'OK':<4} {'Detail'}")
    print("-" * 80)
    for c in checks:
        ok_mark = "OK" if c["ok"] else "FAIL"
        if c.get("error"):
            detail = f"ERROR: {c['error']}"
        elif not c["ok"]:
            detail = f"got {c.get('got')}; expected {c.get('expected', c.get('expected_substr'))}"
        else:
            got = c.get("got", [])
            detail = got[0] if got else ""
        print(f"{c['check']:<22} {ok_mark:<4} {detail[:60]}")
    print()

all_ok = all(c["ok"] for c in checks)
sys.exit(0 if all_ok else 1)
PYEOF
