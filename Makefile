.PHONY: help install dev-up dev-down dev-reset dev-logs dev-ps typecheck lint format test build secrets-scan compose-config db-migrate db-status db-test

COMPOSE := docker compose -f infra/docker/docker-compose.dev.yml

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS=":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

install: ## Install all workspace dependencies
	pnpm install

dev-up: ## Start dev infra (postgres, redis, minio, judge0)
	$(COMPOSE) up -d
	@echo "Dev infra up. Check status: make dev-ps"

dev-down: ## Stop dev infra (preserves volumes)
	$(COMPOSE) down

dev-reset: ## Stop dev infra AND wipe all volumes (destructive)
	$(COMPOSE) down -v

dev-logs: ## Tail logs from all dev infra services
	$(COMPOSE) logs -f --tail=100

dev-ps: ## Show running dev infra containers
	$(COMPOSE) ps

compose-config: ## Validate docker-compose.dev.yml syntax
	$(COMPOSE) config -q && echo "compose config OK"

typecheck: ## Run tsc --noEmit across all workspaces
	pnpm typecheck

lint: ## Run ESLint across the repo
	pnpm lint

format: ## Run Prettier across the repo
	pnpm format

test: ## Run tests across all workspaces
	pnpm test

build: ## Build all workspaces
	pnpm build

secrets-scan: ## Run gitleaks against the working tree
	pnpm secrets:scan

db-migrate: ## Apply pending DB migrations (DATABASE_URL or POSTGRES_* required)
	pnpm --filter @qorium/db migrate:up

db-status: ## Show DB migration status
	pnpm --filter @qorium/db migrate:status

db-test: ## Run the @qorium/db smoke test (requires migrated DB)
	pnpm --filter @qorium/db test
