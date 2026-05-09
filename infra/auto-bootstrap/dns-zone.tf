###############################################################################
# infra/auto-bootstrap/dns-zone.tf
#
# Creates the Route 53 public hosted zone for the QOrium apex domain.
# This is a prerequisite for email-auth.tf (DKIM / SPF / DMARC records)
# and any future module that publishes DNS.
#
# Apply order:
#   1. state-backend.tf  (creates remote-state bucket; local state)
#   2. dns-zone.tf       (creates Route 53 zone for var.domain)
#   3. <update registrar nameservers to the four output.name_servers>
#   4. email-auth.tf     (now that the zone ID exists, fill it into
#                        QORIUM_ROUTE53_ZONE_ID in .env.bootstrap)
#   5. (other modules)
#
# Idempotency note:
#   If the hosted zone already exists in this account, terraform will
#   try to create a duplicate (Route 53 allows this — each zone is a
#   distinct resource). To adopt an existing zone instead, run:
#     terraform import aws_route53_zone.qorium <ZONE_ID>
#   The wrapper apply.sh prints the instruction on conflict.
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
  description = "Apex domain to create the public hosted zone for"
  type        = string

  validation {
    condition     = length(var.domain) > 3 && can(regex("^[a-z0-9.-]+\\.[a-z]{2,}$", var.domain))
    error_message = "domain must be a lowercase fully-qualified domain (e.g. qorium.online)."
  }
}

variable "aws_region" {
  description = "AWS region for the provider (Route 53 itself is global)"
  type        = string
  default     = "ap-south-1"
}

# Compatibility shims — apply.sh passes these to every module.
variable "route53_zone_id" {
  type    = string
  default = ""
}
variable "dmarc_policy" {
  type    = string
  default = ""
}
variable "dmarc_rua" {
  type    = string
  default = ""
}
variable "dmarc_ruf" {
  type    = string
  default = ""
}

###############################################################################
# Provider
###############################################################################

provider "aws" {
  region = var.aws_region
}

###############################################################################
# 1. Public hosted zone
###############################################################################

resource "aws_route53_zone" "qorium" {
  name    = var.domain
  comment = "QOrium apex zone — created by infra/auto-bootstrap/dns-zone.tf"

  tags = {
    Project = "qorium"
    Module  = "auto-bootstrap/dns-zone"
    Domain  = var.domain
  }
}

###############################################################################
# Outputs — feed these back into .env.bootstrap and the registrar
###############################################################################

output "zone_id" {
  description = "Hosted zone ID — paste into .env.bootstrap as QORIUM_ROUTE53_ZONE_ID"
  value       = aws_route53_zone.qorium.zone_id
}

output "name_servers" {
  description = "Set these four NS records at your domain registrar to delegate the zone to Route 53"
  value       = aws_route53_zone.qorium.name_servers
}

output "name_servers_instructions" {
  description = "Human-readable next-step instructions"
  value       = <<EOT
Next steps:
  1. Copy the four name_servers values above.
  2. Go to your domain registrar (where ${var.domain} is registered) and
     replace the existing NS records with these four. Propagation takes
     5–60 minutes typically.
  3. Once propagated, drop the zone_id into .env.bootstrap as
     QORIUM_ROUTE53_ZONE_ID, then run ./apply.sh email-auth.
EOT
}
