###############################################################################
# infra/auto-bootstrap/cloudflare-dns.tf
#
# Sprint 4.4 — Cloudflare DNS authority for qorium.online.
#
# DNS provider migrated Hostinger → Cloudflare on 2026-05-08 (Run #62).
# This module replicates the live state in Cloudflare's zone so future
# record changes are PR-driven rather than manual paste.
#
# What this module manages (when applied):
#   1. Apex A record  api.qorium.online → 147.93.103.194 (proxied)
#   2. www CNAME      → qorium.online (proxied)
#   3. SES Easy DKIM CNAME  selector 1 → *.dkim.amazonses.com (DNS-only)
#   4. SES Easy DKIM CNAME  selector 2 → *.dkim.amazonses.com (DNS-only)
#   5. SES Easy DKIM CNAME  selector 3 → *.dkim.amazonses.com (DNS-only)
#   6. SPF TXT at apex     "v=spf1 include:amazonses.com ~all"
#   7. DMARC TXT at _dmarc "v=DMARC1; p=none; rua=mailto:postmaster@..."
#
# What this module does NOT do (intentional gates):
#   - Provision the Cloudflare account or zone (assumed pre-existing)
#   - Enable WAF / Bot Management rules (free tier defaults are fine
#     for now; tune later when Stack-Vault tenant traffic ramps)
#   - Provision Cloudflare API token (cred-drop CEO action)
#   - Set DNSSEC (deferred; Cloudflare Free supports it but timing
#     coordination with registrar adds risk during launch window)
#
# DKIM records MUST stay DNS-only (proxied=false). Cloudflare's orange-
# cloud proxy rewrites CNAME targets, which breaks DKIM signature
# validation at recipient mail servers.
#
# Apply gate: `terraform apply` requires CLOUDFLARE_API_TOKEN env var
# (scoped to qorium.online zone with Zone:DNS:Edit permission). The
# apply.sh wrapper enforces BOOTSTRAP_AUTHORIZED=true before any apply.
###############################################################################

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.40"
    }
  }
}

###############################################################################
# Variables
###############################################################################

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for qorium.online (read from Cloudflare dashboard → Overview → API section)"
  type        = string
}

variable "domain" {
  description = "Apex domain (e.g. qorium.online)"
  type        = string
  default     = "qorium.online"

  validation {
    condition     = can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain))
    error_message = "domain must be a lowercase fully-qualified domain."
  }
}

variable "api_origin_ip" {
  description = "Origin IP for api.<domain> A record (Hostinger VPS today)"
  type        = string
  default     = "147.93.103.194"
}

variable "ses_dkim_tokens" {
  description = "3 SES Easy DKIM tokens captured from AWS SES verified-identity page (selector subdomains under _domainkey.<domain>)"
  type        = list(string)

  validation {
    condition     = length(var.ses_dkim_tokens) == 3
    error_message = "Exactly 3 DKIM tokens required (SES Easy DKIM emits selectors 1/2/3)."
  }
}

variable "dmarc_rua" {
  description = "Mailto URI for DMARC aggregate reports"
  type        = string
  default     = "mailto:postmaster@qorium.online"
}

variable "dmarc_policy" {
  description = "DMARC enforcement policy: none | quarantine | reject. Start at 'none' during sandbox; tighten after first 30 days of clean reporting."
  type        = string
  default     = "none"

  validation {
    condition     = contains(["none", "quarantine", "reject"], var.dmarc_policy)
    error_message = "dmarc_policy must be one of: none, quarantine, reject."
  }
}

###############################################################################
# Provider
###############################################################################

provider "cloudflare" {
  # CLOUDFLARE_API_TOKEN read from environment by the provider.
}

###############################################################################
# 1. Production traffic — A record + www CNAME (orange-cloud proxied)
###############################################################################

resource "cloudflare_record" "api_a" {
  zone_id = var.cloudflare_zone_id
  name    = "api"
  value   = var.api_origin_ip
  type    = "A"
  ttl     = 1 # 1 = "Auto" when proxied
  proxied = true
  comment = "Origin = Hostinger VPS. Cloudflare proxy provides TLS termination, WAF, DDoS, and caching."
}

resource "cloudflare_record" "www_cname" {
  zone_id = var.cloudflare_zone_id
  name    = "www"
  value   = var.domain
  type    = "CNAME"
  ttl     = 1
  proxied = true
  comment = "Marketing apex redirect target."
}

###############################################################################
# 2. SES Easy DKIM — three CNAMEs (DNS-only / gray-cloud)
#
# Cloudflare's orange-cloud proxy rewrites CNAME targets, breaking DKIM
# validation. Set proxied=false explicitly.
###############################################################################

resource "cloudflare_record" "dkim" {
  count   = 3
  zone_id = var.cloudflare_zone_id
  name    = "${var.ses_dkim_tokens[count.index]}._domainkey"
  value   = "${var.ses_dkim_tokens[count.index]}.dkim.amazonses.com"
  type    = "CNAME"
  ttl     = 600
  proxied = false
  comment = "AWS SES Easy DKIM selector ${count.index + 1}. DO NOT proxy — orange cloud breaks DKIM signature validation."
}

###############################################################################
# 3. SPF — apex TXT permitting Amazon SES
###############################################################################

resource "cloudflare_record" "spf" {
  zone_id = var.cloudflare_zone_id
  name    = "@"
  value   = "v=spf1 include:amazonses.com ~all"
  type    = "TXT"
  ttl     = 600
  proxied = false
  comment = "SPF: declares Amazon SES as authorised sender for qorium.online; ~all = soft-fail on others (recipients may quarantine)."
}

###############################################################################
# 4. DMARC — alignment + reporting
###############################################################################

resource "cloudflare_record" "dmarc" {
  zone_id = var.cloudflare_zone_id
  name    = "_dmarc"
  value   = "v=DMARC1; p=${var.dmarc_policy}; rua=${var.dmarc_rua}; pct=100"
  type    = "TXT"
  ttl     = 600
  proxied = false
  comment = "DMARC: starts at p=none for first 30 days of sandbox sending; tighten to quarantine then reject after clean rua reports."
}

###############################################################################
# Outputs
###############################################################################

output "managed_records" {
  description = "All DNS records under Terraform management"
  value = {
    api_a       = cloudflare_record.api_a.hostname
    www_cname   = cloudflare_record.www_cname.hostname
    dkim_count  = length(cloudflare_record.dkim)
    spf_value   = cloudflare_record.spf.value
    dmarc_value = cloudflare_record.dmarc.value
  }
}

output "dkim_record_names" {
  description = "DKIM CNAME hostnames for verification via dig / socket DNS query"
  value       = [for r in cloudflare_record.dkim : r.hostname]
}
