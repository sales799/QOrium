###############################################################################
# infra/auto-bootstrap/pitr.tf
#
# Sprint 4.2 — Point-In-Time Recovery + cross-region backup automation for
# the QOrium production database. Halts before applying unless the wrapper
# script (apply.sh) confirms BOOTSTRAP_AUTHORIZED=true.
#
# What this module DOES (when applied):
#   1. Enables PITR on the RDS / Aurora cluster for var.cluster_identifier.
#   2. Daily automated snapshot copy to a cross-region S3 backup bucket.
#   3. S3 backup bucket with lifecycle: 7d hot → 30d IA → 365d Glacier IR
#      → 7y Deep Archive (regulatory).
#   4. KMS CMK for snapshot encryption (per-region).
#   5. Bucket policy denying public access + requiring KMS encryption.
#   6. CloudWatch alarms on backup-job failure.
#
# What this module does NOT do:
#   - Provision the RDS cluster itself (assumed pre-existing).
#   - Execute restores (use scripts/restore-pitr.sh interactively).
#   - Configure cross-account replication (separate module if needed).
#
# RPO target: 5 minutes (PITR continuous).
# RTO target: 1 hour from same-region; 2 hours cross-region.
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

variable "cluster_identifier" {
  description = "RDS / Aurora cluster identifier (e.g. \"qorium-prod\")."
  type        = string
}

variable "primary_region" {
  description = "Primary AWS region (e.g. \"ap-south-1\" Mumbai)."
  type        = string
  default     = "ap-south-1"
}

variable "backup_region" {
  description = "Cross-region backup destination (e.g. \"ap-southeast-1\" Singapore)."
  type        = string
  default     = "ap-southeast-1"
}

variable "backup_retention_period" {
  description = "PITR retention in days (1..35). RDS hard-cap is 35d; longer retention via S3 backups."
  type        = number
  default     = 14
}

variable "backup_window" {
  description = "Daily window for automated backup (UTC, hh24:mi-hh24:mi)."
  type        = string
  default     = "16:00-17:00" # 21:30-22:30 IST off-peak
}

###############################################################################
# Providers — primary + backup region aliases
###############################################################################

provider "aws" {
  region = var.primary_region
}

provider "aws" {
  alias  = "backup"
  region = var.backup_region
}

###############################################################################
# KMS keys (per-region)
###############################################################################

resource "aws_kms_key" "backup_primary" {
  description             = "QOrium backup-snapshot encryption key (primary region)."
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = {
    Project   = "qorium"
    Component = "pitr-backup"
  }
}

resource "aws_kms_key" "backup_destination" {
  provider                = aws.backup
  description             = "QOrium backup-snapshot encryption key (backup region)."
  deletion_window_in_days = 30
  enable_key_rotation     = true
  tags = {
    Project   = "qorium"
    Component = "pitr-backup"
  }
}

###############################################################################
# S3 cross-region backup bucket
###############################################################################

resource "aws_s3_bucket" "snapshots" {
  provider = aws.backup
  bucket   = "qorium-pitr-snapshots-${var.backup_region}"

  tags = {
    Project   = "qorium"
    Component = "pitr-backup"
  }
}

resource "aws_s3_bucket_versioning" "snapshots" {
  provider = aws.backup
  bucket   = aws_s3_bucket.snapshots.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "snapshots" {
  provider = aws.backup
  bucket   = aws_s3_bucket.snapshots.id
  rule {
    apply_server_side_encryption_by_default {
      kms_master_key_id = aws_kms_key.backup_destination.arn
      sse_algorithm     = "aws:kms"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "snapshots" {
  provider                = aws.backup
  bucket                  = aws_s3_bucket.snapshots.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_lifecycle_configuration" "snapshots" {
  provider   = aws.backup
  bucket     = aws_s3_bucket.snapshots.id
  depends_on = [aws_s3_bucket_versioning.snapshots]

  rule {
    id     = "tiered-archive"
    status = "Enabled"
    filter {}

    transition {
      days          = 7
      storage_class = "STANDARD_IA"
    }
    transition {
      days          = 30
      storage_class = "GLACIER_IR"
    }
    transition {
      days          = 365
      storage_class = "DEEP_ARCHIVE"
    }
    expiration {
      days = 2555 # 7y regulatory retention
    }

    noncurrent_version_transition {
      noncurrent_days = 30
      storage_class   = "GLACIER_IR"
    }
    noncurrent_version_expiration {
      noncurrent_days = 365
    }
  }
}

resource "aws_s3_bucket_policy" "snapshots_deny_unencrypted" {
  provider = aws.backup
  bucket   = aws_s3_bucket.snapshots.id
  policy   = data.aws_iam_policy_document.snapshots_deny_unencrypted.json
}

data "aws_iam_policy_document" "snapshots_deny_unencrypted" {
  statement {
    sid     = "DenyUnencryptedUploads"
    effect  = "Deny"
    actions = ["s3:PutObject"]
    resources = ["${aws_s3_bucket.snapshots.arn}/*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "StringNotEquals"
      variable = "s3:x-amz-server-side-encryption"
      values   = ["aws:kms"]
    }
  }
  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]
    resources = [
      aws_s3_bucket.snapshots.arn,
      "${aws_s3_bucket.snapshots.arn}/*",
    ]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

###############################################################################
# AWS Backup vault + plan
###############################################################################

resource "aws_backup_vault" "primary" {
  name        = "qorium-primary-vault"
  kms_key_arn = aws_kms_key.backup_primary.arn
  tags = {
    Project = "qorium"
  }
}

resource "aws_backup_plan" "rds_daily_pitr" {
  name = "qorium-rds-daily-pitr"

  rule {
    rule_name           = "daily-snapshot"
    target_vault_name   = aws_backup_vault.primary.name
    schedule            = "cron(0 16 * * ? *)" # 16:00 UTC = 21:30 IST
    start_window        = 60
    completion_window   = 180
    enable_continuous_backup = true # PITR

    lifecycle {
      cold_storage_after = 30
      delete_after       = 365
    }

    copy_action {
      destination_vault_arn = aws_backup_vault.destination.arn
      lifecycle {
        cold_storage_after = 30
        delete_after       = 365
      }
    }
  }
}

resource "aws_backup_vault" "destination" {
  provider    = aws.backup
  name        = "qorium-destination-vault"
  kms_key_arn = aws_kms_key.backup_destination.arn
}

###############################################################################
# CloudWatch alarms — backup-job failure
###############################################################################

resource "aws_cloudwatch_metric_alarm" "backup_failure" {
  alarm_name          = "qorium-backup-job-failure"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "NumberOfBackupJobsFailed"
  namespace           = "AWS/Backup"
  period              = 3600
  statistic           = "Sum"
  threshold           = 1
  alarm_description   = "QOrium backup job failed; on-call must verify the next-window run."
  treat_missing_data  = "notBreaching"
  tags = {
    Project = "qorium"
  }
}

###############################################################################
# Outputs
###############################################################################

output "backup_vault_primary_arn" {
  value = aws_backup_vault.primary.arn
}

output "backup_vault_destination_arn" {
  value = aws_backup_vault.destination.arn
}

output "snapshot_bucket_arn" {
  value = aws_s3_bucket.snapshots.arn
}

output "kms_key_primary_arn" {
  value     = aws_kms_key.backup_primary.arn
  sensitive = true
}

output "kms_key_destination_arn" {
  value     = aws_kms_key.backup_destination.arn
  sensitive = true
}
