###############################################################################
# infra/auto-bootstrap/email-auth.tf
#
# Sprint 1.7d — SES domain identity + DKIM + SPF + DMARC for the QOrium
# transactional sender domain. Halts before applying unless the wrapper
# script (apply.sh) confirms BOOTSTRAP_AUTHORIZED=true.
#
# What this module creates (when applied):
#   1. AWS SES Email Identity for var.domain
#   2. Three SES DKIM CNAME records in Route 53 (selectors 1/2/3)
#   3. SPF TXT record  ("v=spf1 include:amazonses.com ~all")
#   4. DMARC TXT record at _dmarc.<domain> (p=quarantine; rua + ruf reports)
#   5. Mail FROM domain configured to "qorium.<domain>" with its own
#      MX + SPF records (improves deliverability + DMARC alignment)
#
# What this module does NOT do (intentional gates):
#   - Provision IAM users or access keys (use IAM Identity Center)
#   - Create the underlying Route 53 hosted zone (assumed pre-existing)
#   - Move the domain out of sandbox to production-send (request via AWS
#     console after this module's identity is verified)
#
# Provider versions pinned for reproducibility.
###############################################################################

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.70"
    }
  }
}

###############################################################################
# Variables
###############################################################################

variable "domain" {
  description = "Apex domain for SES identity (e.g. qorium.online)"
  type        = string

  validation {
    condition     = length(var.domain) > 3 && can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain))
    error_message = "domain must be a lowercase fully-qualified domain (e.g. qorium.online)."
  }
}

variable "aws_region" {
  description = "AWS region hosting the SES identity"
  type        = string
  default     = "ap-south-1"
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID for var.domain (zone is assumed pre-existing)"
  type        = string
}

variable "mail_from_subdomain" {
  description = "Sub-label prepended to var.domain for the SES Mail-FROM domain"
  type        = string
  default     = "qorium"
}

variable "dmarc_policy" {
  description = "DMARC enforcement policy: none | quarantine | reject"
  type        = string
  default     = "quarantine"

  validation {
    condition     = contains(["none", "quarantine", "reject"], var.dmarc_policy)
    error_message = "dmarc_policy must be one of: none, quarantine, reject."
  }
}

variable "dmarc_rua" {
  description = "Mailto URI for DMARC aggregate reports"
  type        = string
  default     = "mailto:dmarc-rua@qorium.online"
}

variable "dmarc_ruf" {
  description = "Mailto URI for DMARC forensic / failure reports"
  type        = string
  default     = "mailto:dmarc-ruf@qorium.online"
}

###############################################################################
# Provider — receives credentials from environment (AWS_ACCESS_KEY_ID +
# AWS_SECRET_ACCESS_KEY, or assume-role via aws-sdk default chain).
# CI runs `terraform plan` only; never `terraform apply` without
# BOOTSTRAP_AUTHORIZED=true (enforced by apply.sh).
###############################################################################

provider "aws" {
  region = var.aws_region
}

###############################################################################
# 1. SES domain identity
###############################################################################

resource "aws_sesv2_email_identity" "qorium_domain" {
  email_identity = var.domain

  dkim_signing_attributes {
    next_signing_key_length = "RSA_2048_BIT"
  }
}

###############################################################################
# 2. DKIM CNAMEs (SES generates 3 selectors)
###############################################################################

resource "aws_route53_record" "dkim" {
  count   = 3
  zone_id = var.route53_zone_id
  name    = "${aws_sesv2_email_identity.qorium_domain.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.domain}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_sesv2_email_identity.qorium_domain.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
}

###############################################################################
# 3. SPF — apex TXT record permitting Amazon SES
###############################################################################

resource "aws_route53_record" "spf" {
  zone_id = var.route53_zone_id
  name    = var.domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

###############################################################################
# 4. Mail-FROM domain (improves DMARC alignment by giving the
#    Return-Path header its own subdomain with its own SPF / MX)
###############################################################################

resource "aws_sesv2_email_identity_mail_from_attributes" "mail_from" {
  email_identity         = aws_sesv2_email_identity.qorium_domain.email_identity
  mail_from_domain       = "${var.mail_from_subdomain}.${var.domain}"
  behavior_on_mx_failure = "USE_DEFAULT_VALUE"
}

resource "aws_route53_record" "mail_from_mx" {
  zone_id = var.route53_zone_id
  name    = "${var.mail_from_subdomain}.${var.domain}"
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${var.aws_region}.amazonses.com"]
}

resource "aws_route53_record" "mail_from_spf" {
  zone_id = var.route53_zone_id
  name    = "${var.mail_from_subdomain}.${var.domain}"
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com ~all"]
}

###############################################################################
# 5. DMARC — enforcement policy + reporting
###############################################################################

resource "aws_route53_record" "dmarc" {
  zone_id = var.route53_zone_id
  name    = "_dmarc.${var.domain}"
  type    = "TXT"
  ttl     = 600
  records = [
    "v=DMARC1; p=${var.dmarc_policy}; rua=${var.dmarc_rua}; ruf=${var.dmarc_ruf}; fo=1; aspf=s; adkim=s",
  ]
}

###############################################################################
# Outputs — these surface to apply.sh on success and become the inputs
# for the recruiter-invitation flow's MAILER_DRIVER=ses configuration.
###############################################################################

output "ses_identity_arn" {
  description = "ARN of the SES email identity"
  value       = aws_sesv2_email_identity.qorium_domain.arn
}

output "verified_domain" {
  description = "Domain that will become verified once Route 53 propagates DKIM + SPF"
  value       = aws_sesv2_email_identity.qorium_domain.email_identity
}

output "mail_from_domain" {
  description = "Mail-FROM subdomain created for DMARC alignment"
  value       = aws_sesv2_email_identity_mail_from_attributes.mail_from.mail_from_domain
}

output "dkim_records" {
  description = "DKIM CNAME records that must propagate before SES verifies"
  value = [
    for r in aws_route53_record.dkim : {
      name   = r.name
      target = tolist(r.records)[0]
    }
  ]
}

output "dmarc_record_value" {
  description = "Final DMARC TXT value for verification"
  value       = tolist(aws_route53_record.dmarc.records)[0]
}
