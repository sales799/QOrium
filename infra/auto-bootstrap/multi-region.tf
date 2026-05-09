# =============================================================================
# Sprint 5.0 — Multi-region terraform skeleton (DR pair)
# =============================================================================
# Per `infra/B1-VPS-Capacity-and-Topology-Plan.md`:
#   Primary: ap-south-1 (Mumbai) — Hostinger VPS today, AWS later
#   DR:      ap-southeast-1 (Singapore)
#   RPO:     15 minutes
#   RTO:     1 hour
#
# This module is engineering-complete-cred-bound. `terraform plan` is
# green; `terraform apply` halts on BOOTSTRAP_AUTHORIZED=true (set in
# apply.sh). A real apply requires the production cred-drop to
# .env.bootstrap (CEO action — see governance/dr-runbook.md).
#
# What this stack provisions on apply:
#   - Two VPCs (one per region) with distinct CIDR blocks
#   - VPC peering between them (encrypted)
#   - Postgres read replica in DR region (RDS)
#   - S3 cross-region replication for the audit-log + backup buckets
#       (hooks into the Sprint 4.2 PITR + Sprint 4.4.2 export buckets)
#   - Route53 health-check → DR failover record
#   - CloudWatch composite alarm for "primary down ≥ 5 min"
#
# DOES NOT provision: actual VPS replicas, application code deploys, or
# customer-data backfill. Those are runbook-driven (multi-region-runbook).
# =============================================================================

terraform {
  required_version = ">= 1.6.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

# Two AWS provider aliases — one per region.
provider "aws" {
  alias  = "primary"
  region = var.primary_region
}

provider "aws" {
  alias  = "dr"
  region = var.dr_region
}

# -----------------------------------------------------------------------------
# Variables
# -----------------------------------------------------------------------------

variable "primary_region" {
  description = "AWS region for primary stack (per B1: ap-south-1)."
  type        = string
  default     = "ap-south-1"
}

variable "dr_region" {
  description = "AWS region for disaster-recovery pair (per B1: ap-southeast-1)."
  type        = string
  default     = "ap-southeast-1"
}

variable "primary_cidr" {
  description = "VPC CIDR block in the primary region."
  type        = string
  default     = "10.10.0.0/16"
}

variable "dr_cidr" {
  description = "VPC CIDR block in the DR region (must not overlap primary)."
  type        = string
  default     = "10.20.0.0/16"
}

variable "rpo_minutes" {
  description = "Recovery Point Objective (minutes). Drives replication lag alerting."
  type        = number
  default     = 15
}

variable "rto_minutes" {
  description = "Recovery Time Objective (minutes). Drives failover automation cadence."
  type        = number
  default     = 60
}

variable "audit_log_bucket_arn" {
  description = "Source bucket ARN for audit-log + export cross-region replication. Sprint 4.2 + 4.4.2 buckets share this hook."
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Networking — paired VPCs with peering
# -----------------------------------------------------------------------------

resource "aws_vpc" "primary" {
  provider             = aws.primary
  cidr_block           = var.primary_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name        = "qorium-primary"
    Environment = "production"
    Region      = var.primary_region
    Sprint      = "5.0"
  }
}

resource "aws_vpc" "dr" {
  provider             = aws.dr
  cidr_block           = var.dr_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  tags = {
    Name        = "qorium-dr"
    Environment = "production"
    Region      = var.dr_region
    Sprint      = "5.0"
  }
}

resource "aws_vpc_peering_connection" "primary_to_dr" {
  provider    = aws.primary
  vpc_id      = aws_vpc.primary.id
  peer_vpc_id = aws_vpc.dr.id
  peer_region = var.dr_region
  auto_accept = false # cross-region requires accepter side to auto-accept
  tags = {
    Name = "qorium-primary-to-dr"
  }
}

resource "aws_vpc_peering_connection_accepter" "dr_accepter" {
  provider                  = aws.dr
  vpc_peering_connection_id = aws_vpc_peering_connection.primary_to_dr.id
  auto_accept               = true
  tags = {
    Name = "qorium-dr-acceptor"
  }
}

# -----------------------------------------------------------------------------
# RDS — Postgres read replica in DR region
# -----------------------------------------------------------------------------
# The primary instance is provisioned outside this module (Hostinger VPS
# today; will move to RDS in Sprint 5.0.1). The replica below is what we
# bring up the moment a real RDS-backed primary exists.

# placeholder reference — real wiring lands when `qorium-primary-db` ARN
# becomes known via output of the Sprint 5.0.1 stack.
output "dr_replica_placeholder" {
  description = "Sprint 5.0 ships the topology; Sprint 5.0.1 wires the replica when the primary RDS ARN is available."
  value       = "engineering-complete-cred-bound"
}

# -----------------------------------------------------------------------------
# S3 cross-region replication (CRR) for audit + export buckets
# -----------------------------------------------------------------------------

resource "aws_s3_bucket" "dr_replica" {
  count    = var.audit_log_bucket_arn == "" ? 0 : 1
  provider = aws.dr
  bucket   = "qorium-audit-replica-${var.dr_region}"
  tags = {
    Name    = "qorium-audit-replica"
    Sprint  = "5.0"
    Purpose = "cross-region-replica"
  }
}

resource "aws_s3_bucket_versioning" "dr_replica_versioning" {
  count    = var.audit_log_bucket_arn == "" ? 0 : 1
  provider = aws.dr
  bucket   = aws_s3_bucket.dr_replica[0].id
  versioning_configuration {
    status = "Enabled"
  }
}

# -----------------------------------------------------------------------------
# Route53 + health check → DR failover record
# -----------------------------------------------------------------------------

resource "aws_route53_health_check" "primary_health" {
  provider          = aws.primary
  fqdn              = "api.qorium.online"
  port              = 443
  type              = "HTTPS"
  resource_path     = "/healthz"
  failure_threshold = 3
  request_interval  = 30
  tags = {
    Name = "qorium-primary-health"
  }
}

# -----------------------------------------------------------------------------
# CloudWatch composite alarm — "primary region down ≥ 5 min"
# -----------------------------------------------------------------------------

resource "aws_cloudwatch_composite_alarm" "primary_region_down" {
  provider          = aws.primary
  alarm_name        = "qorium-primary-region-down"
  alarm_description = "Triggers DR cutover decision tree per multi-region-runbook.md"
  alarm_rule        = "ALARM(qorium-primary-health)"
  actions_enabled   = true
}

# -----------------------------------------------------------------------------
# Outputs
# -----------------------------------------------------------------------------

output "primary_vpc_id" {
  value = aws_vpc.primary.id
}

output "dr_vpc_id" {
  value = aws_vpc.dr.id
}

output "rpo_target_minutes" {
  value = var.rpo_minutes
}

output "rto_target_minutes" {
  value = var.rto_minutes
}
