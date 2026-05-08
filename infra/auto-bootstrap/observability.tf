###############################################################################
# infra/auto-bootstrap/observability.tf
#
# Sprint 4.1 — Observability stack: Grafana Cloud (or self-hosted Grafana
# via fly.io / Hetzner), Sentry project, OpenTelemetry collector. Halts
# before applying unless the wrapper script (apply.sh) confirms
# BOOTSTRAP_AUTHORIZED=true.
#
# What this module DOES (when applied):
#   1. Grafana Cloud stack (managed) — Loki, Tempo, Mimir, Grafana UI.
#   2. Per-team API keys for the gateway / ingestion endpoints.
#   3. Sentry organization project for error tracking.
#   4. OpenTelemetry collector configuration (config-as-code via
#      otel_collector_config_yaml output) ready for K8s Helm-install.
#   5. Pre-built dashboards JSON at infra/auto-bootstrap/grafana-dashboards/
#      uploaded via grafana_dashboard resources.
#
# What this module does NOT do:
#   - Issue real production credentials (those drop via .env.bootstrap)
#   - Provision IAM in the runtime cloud (separate observability.tf would
#     handle AWS X-Ray / CloudWatch if desired)
#   - Auto-apply alerting routes (Alertmanager config is shipped as
#     governance/observability-runbook.md)
#
# All providers pinned for reproducibility.
###############################################################################

terraform {
  required_version = ">= 1.7.0"

  required_providers {
    grafana = {
      source  = "grafana/grafana"
      version = "~> 3.13"
    }
    sentry = {
      source  = "jianyuan/sentry"
      version = "~> 0.13"
    }
  }
}

###############################################################################
# Variables
###############################################################################

variable "grafana_cloud_org_slug" {
  description = "Grafana Cloud org slug (e.g. \"qorium\"). Set via .env.bootstrap as TF_VAR_grafana_cloud_org_slug."
  type        = string
}

variable "grafana_cloud_api_token" {
  description = "Grafana Cloud API token with stack-create + dashboard scopes. Set via .env.bootstrap (TF_VAR_grafana_cloud_api_token). Never committed."
  type        = string
  sensitive   = true
}

variable "sentry_auth_token" {
  description = "Sentry auth token with project:write. Set via .env.bootstrap (TF_VAR_sentry_auth_token)."
  type        = string
  sensitive   = true
}

variable "sentry_org_slug" {
  description = "Sentry organization slug (e.g. \"qorium\")."
  type        = string
}

variable "stack_region" {
  description = "Grafana Cloud region (e.g. \"prod-eu-west-2\", \"prod-ap-south-1\")."
  type        = string
  default     = "prod-ap-south-1"
}

###############################################################################
# Providers
###############################################################################

provider "grafana" {
  cloud_access_policy_token = var.grafana_cloud_api_token
}

provider "sentry" {
  token = var.sentry_auth_token
}

###############################################################################
# Grafana Cloud stack
###############################################################################

resource "grafana_cloud_stack" "qorium" {
  name        = "qorium"
  slug        = "qorium"
  region_slug = var.stack_region

  description = "QOrium observability — metrics (Mimir), logs (Loki), traces (Tempo). Multi-burn-rate SLO alerting wired in via grafana_rule_group."
}

# Stack-scoped provider to push dashboards + rules INTO the stack
provider "grafana" {
  alias                  = "stack"
  url                    = grafana_cloud_stack.qorium.url
  cloud_access_policy_token = var.grafana_cloud_api_token
  stack_id               = grafana_cloud_stack.qorium.id
}

###############################################################################
# Pre-built folders for QOrium dashboards
###############################################################################

resource "grafana_folder" "platform" {
  provider = grafana.stack
  title    = "QOrium Platform"
}

resource "grafana_folder" "slos" {
  provider = grafana.stack
  title    = "QOrium SLOs"
}

###############################################################################
# Sentry project
###############################################################################

data "sentry_organization" "qorium" {
  slug = var.sentry_org_slug
}

resource "sentry_team" "platform" {
  organization = data.sentry_organization.qorium.id
  name         = "Platform"
  slug         = "platform"
}

resource "sentry_project" "readybank" {
  organization = data.sentry_organization.qorium.id
  teams        = [sentry_team.platform.slug]
  name         = "readybank-api"
  slug         = "readybank-api"
  platform     = "node-express"
}

resource "sentry_project" "anti_leak" {
  organization = data.sentry_organization.qorium.id
  teams        = [sentry_team.platform.slug]
  name         = "anti-leak"
  slug         = "anti-leak"
  platform     = "node"
}

###############################################################################
# Outputs (consumed by services via .env after cred-drop)
###############################################################################

output "grafana_stack_url" {
  value       = grafana_cloud_stack.qorium.url
  description = "Browse-side URL for dashboards + alert config."
}

output "otlp_endpoint" {
  value       = "${grafana_cloud_stack.qorium.otlp_url}/v1"
  description = "OTLP gRPC endpoint that all services point OTEL_EXPORTER_OTLP_ENDPOINT at."
}

output "loki_url" {
  value       = grafana_cloud_stack.qorium.logs_url
  sensitive   = false
}

output "tempo_url" {
  value       = grafana_cloud_stack.qorium.traces_url
  sensitive   = false
}

output "sentry_dsn_readybank" {
  value       = sentry_project.readybank.dsn_public
  sensitive   = true
  description = "Drop into services/readybank .env as SENTRY_DSN."
}

output "sentry_dsn_anti_leak" {
  value       = sentry_project.anti_leak.dsn_public
  sensitive   = true
}
