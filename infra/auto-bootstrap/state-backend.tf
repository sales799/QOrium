###############################################################################
# infra/auto-bootstrap/state-backend.tf
#
# Bootstraps the S3 bucket + DynamoDB lock table used as the remote
# Terraform state backend for every subsequent QOrium module.
#
# This module deliberately uses LOCAL state (no `backend "s3"` block).
# That's the chicken-and-egg of remote state: a backend can't store its
# own state in itself before it exists. After this module is applied,
# every other module's terraform { backend "s3" {} } block can point at
# the bucket + table created here.
#
# What this module creates (when applied):
#   1. S3 bucket  qorium-terraform-state-<account_id>  (versioned, encrypted, private)
#   2. DynamoDB table  qorium-terraform-state-lock     (LockID hash key, on-demand)
#
# What this module does NOT do:
#   - Migrate existing local state into the bucket (humans do this once,
#     module by module, with `terraform init -migrate-state`)
#   - Grant the bootstrap IAM user S3 / DynamoDB permissions (assumed
#     present via AdministratorAccess or scoped policy on cred-drop)
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

variable "aws_region" {
  description = "AWS region for the state bucket + lock table"
  type        = string
  default     = "ap-south-1"
}

variable "state_bucket_name" {
  description = "S3 bucket name. Empty (default) computes qorium-terraform-state-<account_id>."
  type        = string
  default     = ""
}

variable "state_lock_table_name" {
  description = "DynamoDB table name for state locking"
  type        = string
  default     = "qorium-terraform-state-lock"
}

# Compatibility shims — apply.sh passes these to every module. They're
# unused here but declared so terraform doesn't error on -var.
variable "domain" {
  type    = string
  default = ""
}
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
# Provider + account resolution
###############################################################################

provider "aws" {
  region = var.aws_region
}

data "aws_caller_identity" "current" {}

locals {
  state_bucket_name = var.state_bucket_name != "" ? var.state_bucket_name : "qorium-terraform-state-${data.aws_caller_identity.current.account_id}"
}

###############################################################################
# 1. S3 bucket — versioned, encrypted, private
###############################################################################

resource "aws_s3_bucket" "tf_state" {
  bucket = local.state_bucket_name

  tags = {
    Project = "qorium"
    Module  = "auto-bootstrap/state-backend"
    Purpose = "terraform-remote-state"
  }

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_versioning" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id

  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "tf_state" {
  bucket = aws_s3_bucket.tf_state.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

###############################################################################
# 2. DynamoDB lock table
###############################################################################

resource "aws_dynamodb_table" "tf_state_lock" {
  name         = var.state_lock_table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }

  tags = {
    Project = "qorium"
    Module  = "auto-bootstrap/state-backend"
    Purpose = "terraform-state-lock"
  }
}

###############################################################################
# Outputs — drop into other modules' backend "s3" {} blocks
###############################################################################

output "state_bucket_name" {
  description = "S3 bucket holding terraform state"
  value       = aws_s3_bucket.tf_state.id
}

output "state_bucket_arn" {
  value = aws_s3_bucket.tf_state.arn
}

output "state_lock_table_name" {
  description = "DynamoDB table for state locks"
  value       = aws_dynamodb_table.tf_state_lock.name
}

output "state_lock_table_arn" {
  value = aws_dynamodb_table.tf_state_lock.arn
}

output "backend_config_snippet" {
  description = "Drop into a future module's terraform { backend \"s3\" {} } block, replacing <MODULE_NAME>."
  value       = <<EOT
backend "s3" {
  bucket         = "${aws_s3_bucket.tf_state.id}"
  key            = "<MODULE_NAME>/terraform.tfstate"
  region         = "${var.aws_region}"
  dynamodb_table = "${aws_dynamodb_table.tf_state_lock.name}"
  encrypt        = true
}
EOT
}
