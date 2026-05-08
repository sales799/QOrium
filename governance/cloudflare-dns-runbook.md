# Cloudflare DNS Runbook — qorium.online

**For:** Bhaskar (CEO) · Manthan (intro broker) · future ops/Senior Eng #1
**Filed:** 2026-05-08
**Refs:** `infra/auto-bootstrap/cloudflare-dns.tf`, `infra/auto-bootstrap/email-auth.tf`, Run #62 (DNS migration), Run #63 (SES records)

---

## Why this runbook exists

DNS for `qorium.online` lives on Cloudflare since 2026-05-08 (migrated off Hostinger parking nameservers). Day-to-day ops (adding subdomains, rotating SES selectors, publishing email-auth changes) happens through the Cloudflare web dashboard until Cloudflare API token cred-drop unblocks Terraform-driven flow.

This runbook is the kindergarten click-by-click for the seven things you will actually need to do.

---

## Login + landing page

1. Browser → https://dash.cloudflare.com
2. Log in (use the account that owns the existing 11 domains; recovery via password reset is one click).
3. Click `qorium.online` from the domain list.
4. Left sidebar → **DNS** → **Records**. This is where every step below lands.

---

## The 7 records currently live (do not touch unless you mean to)

| # | Name | Type | Target | Proxied? | Why it exists |
|---|---|---|---|---|---|
| 1 | `api` | A | `147.93.103.194` | 🟠 yes | Production API on Hostinger VPS |
| 2 | `www` | CNAME | `qorium.online` | 🟠 yes | Marketing apex redirect |
| 3 | `roesn32...` | CNAME | `roesn32....dkim.amazonses.com` | ⚫ no | SES Easy DKIM selector 1 |
| 4 | `pw64uji...` | CNAME | `pw64uji....dkim.amazonses.com` | ⚫ no | SES Easy DKIM selector 2 |
| 5 | `dtdfvqj...` | CNAME | `dtdfvqj....dkim.amazonses.com` | ⚫ no | SES Easy DKIM selector 3 |
| 6 | `@` (apex) | TXT | `v=spf1 include:amazonses.com ~all` | ⚫ no | SPF — declares Amazon SES as sender |
| 7 | `_dmarc` | TXT | `v=DMARC1; p=none; rua=mailto:postmaster@qorium.online; pct=100` | ⚫ no | DMARC — alignment + reporting |

**Critical rule:** DKIM CNAMEs (3/4/5) and email-auth TXTs (6/7) MUST stay **gray cloud / DNS-only**. The orange-cloud proxy rewrites CNAME targets, breaking DKIM signature validation at recipient mail servers, which lands every QOrium email in the spam folder.

---

## Task 1 — Add a new subdomain (e.g. `app.qorium.online`)

1. Click **+ Add record** (top of the records table).
2. Type dropdown → **A** (or CNAME if pointing to another hostname).
3. Name field → just the label `app` (NOT `app.qorium.online`; Cloudflare auto-appends).
4. IPv4 address → the origin IP (or hostname for CNAME).
5. Proxy status → **Proxied** (orange cloud) for normal HTTPS traffic; **DNS only** (gray) only for email/auth records.
6. TTL → leave at **Auto** when proxied; **600** (10 min) for DNS-only.
7. **Save**.

DNS propagation: 30 sec - 5 min globally on Cloudflare (their network is fast).

---

## Task 2 — Add a new SES DKIM selector (after rotating SES keys)

When AWS SES rotates DKIM (every ~12 months or after key compromise) it issues new tokens. You'll need to:

1. AWS SES Console → ap-south-1 → Verified identities → qorium.online.
2. Click "DKIM" tab. Note the 3 NEW token strings.
3. Cloudflare → DNS → Records → for each of the 3 OLD DKIM rows: click ✏️ Edit → update the Name and Target to the NEW tokens (DO NOT delete-then-add; keep continuity for SES validation).
4. Wait 5 min for AWS SES to detect the change → status reverts to "Successful".

If you delete-then-add and there's any DNS propagation gap, every email sent in that gap will fail DKIM validation and likely land in spam. Edit-in-place is the safe way.

---

## Task 3 — Tighten DMARC policy (after 30 days of clean reports)

Today: `p=none` (monitor only). Production target: `p=quarantine` then `p=reject`.

Pre-condition: 30 days of `dmarc-rua` reports show only legitimate Amazon SES senders, no failures.

1. Click ✏️ Edit on the `_dmarc` TXT record.
2. Change `p=none` → `p=quarantine` (intermediate step) OR straight to `p=reject` (production).
3. Add `pct=10` first if you want to ramp gradually (tells receivers to apply policy to only 10% of failing emails); raise to `100` after 7 clean days.
4. **Save**.

---

## Task 4 — Add a new domain to the Cloudflare account

If we onboard a customer who wants their assessments under a custom domain (e.g. `assessments.razorpay.com`):

That's a customer-side DNS action, not a QOrium-side action. The customer adds a CNAME in their own DNS pointing to a QOrium hostname we issue. Don't add their domain to our Cloudflare account.

For QOrium-owned new domains (e.g. `qorium.in`, `qorium.com`):

1. Cloudflare dashboard → top right **Add a Site**.
2. Enter the domain → pick **Free** plan → Continue.
3. Cloudflare gives 2 nameservers. Update them at the registrar (Hostinger or wherever it was bought).
4. Wait for "Active" status (5 min - 24 hr).
5. Replicate records as needed.

---

## Task 5 — Inspect DNS health from CLI (server-side, no Cloudflare login)

When you suspect a DNS issue, verify externally — don't trust the dashboard alone.

Bash + Python (works on macOS without dig installed):

```bash
python3 -c "
import socket, struct
def query(name, qtype=1, server='1.1.1.1'):
    # Build DNS query packet (qtype: 1=A, 5=CNAME, 16=TXT, 2=NS)
    pkt = struct.pack('>HHHHHH', 0x1234, 0x0100, 1, 0, 0, 0)
    for label in name.split('.'):
        pkt += bytes([len(label)]) + label.encode()
    pkt += b'\x00' + struct.pack('>HH', qtype, 1)
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(5)
    s.sendto(pkt, (server, 53))
    return s.recv(4096)

# NS lookup for qorium.online
result = query('qorium.online', 2)
print('NS query bytes:', len(result), 'see hex:', result.hex())
"
```

For TXT (SPF / DMARC):

```bash
python3 -c "
import socket, struct
pkt = struct.pack('>HHHHHH', 0x1234, 0x0100, 1, 0, 0, 0)
for label in '_dmarc.qorium.online'.split('.'):
    pkt += bytes([len(label)]) + label.encode()
pkt += b'\x00' + struct.pack('>HH', 16, 1)
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.settimeout(5)
s.sendto(pkt, ('1.1.1.1', 53))
print(s.recv(4096))
"
```

There is also `scripts/check-ses-verification.sh` which wraps these patterns; see Sprint 4.4 Lane D.

---

## Task 6 — Roll DNS back to Hostinger (emergency)

If Cloudflare suffers a major outage and we need to revert:

1. Hostinger → hpanel.hostinger.com → Domains → qorium.online.
2. Nameservers section → switch back from "Custom" to "Hostinger Nameservers".
3. Hostinger restores its previous DNS records (parking + email).
4. **You will lose:** Cloudflare WAF, the 7 records above, any subsequent additions. Document them BEFORE flipping if at all possible.

This is a 24-hr propagation event. Only do it if Cloudflare is genuinely down for >2 hr and recovery ETA is unknown.

---

## Task 7 — Provision the Cloudflare API token (cred-drop)

When ready to switch from manual UI ops to Terraform-driven ops:

1. Cloudflare dashboard → top-right profile menu → **My Profile** → **API Tokens** → **Create Token**.
2. Use template "Edit zone DNS".
3. Zone Resources → **Include** → **Specific zone** → `qorium.online` (NOT "All zones" — least-privilege).
4. Permissions → confirm: Zone : DNS : Edit.
5. TTL: leave blank (no expiry) OR set 1 year if we want forced rotation.
6. **Continue to summary** → **Create Token**.
7. Cloudflare displays the token ONCE — copy it immediately to a password manager.
8. CEO drops the token into `.env.bootstrap` per `governance/cred-drop-runbook.md` Section CF-01 (will be added when this cred-drop is queued).
9. `terraform -chdir=infra/auto-bootstrap apply -var-file=cloudflare.tfvars` after `BOOTSTRAP_AUTHORIZED=true`.

---

## What this runbook deliberately does NOT cover

- Cloudflare WAF rules / Bot Management config — defaulted; tune later when Stack-Vault tenant traffic ramps.
- Cloudflare Pages deploy for marketing apex — separate runbook (Lane B4 deliverable).
- Cloudflare Workers / R2 / Stream — out of scope.
- DNSSEC — deferred; coordinate with registrar when timing allows.
- Email routing (`@qorium.online` receiving inbound mail) — Cloudflare Email Routing is free and one-click, but not needed until we want a real `bhaskar@qorium.online` rather than the talpro.in alias.

---

## Stop conditions

The agent will not perform any of these without CEO at the keyboard:

- Cloudflare login (production credential operation; Charter §3 stop condition #4)
- Adding new payment method or upgrading to paid plan (monetary commitment)
- Deleting any record (irreversible; even with backup, propagation gaps cause real outages)
- Changing nameservers at any registrar (production-impact)

For all of the above, the agent gives you the kindergarten click-by-click and you click.

---

**End of runbook v1.** Reviewer: CEO + Manthan + future ops. Author: CTO Office (autonomous agent), 2026-05-08.
