COMPOSE ?= docker compose
COMPOSE_PROD := $(COMPOSE) -f compose.yml -f compose.override.yml
COMPOSE_INFRA := $(COMPOSE) -f compose.yml
SERVICE ?= app
INFRA_SERVICE ?= postgres
ARGS ?=

ifeq ($(BUILD),1)
UP_FLAGS := --build
endif

.DEFAULT_GOAL := help

.PHONY: help
help: ## Show available targets.
	@awk 'BEGIN {FS = ":.*## "; printf "Usage: make <target>\n\nTargets:\n"} /^[a-zA-Z0-9_.-]+:.*## / {printf "  %-18s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

.PHONY: up
up: ## Start the production-like Docker stack. Use BUILD=1 to rebuild images.
	$(COMPOSE_PROD) up -d --wait $(UP_FLAGS)

.PHONY: build
build: ## Build the production app and web images.
	$(COMPOSE_PROD) build app nginx

.PHONY: down
down: ## Stop the production-like Docker stack.
	$(COMPOSE_PROD) down

.PHONY: restart
restart: down up ## Restart the production-like Docker stack.

.PHONY: ps
ps: ## Show production-like Docker stack status.
	$(COMPOSE_PROD) ps

.PHONY: logs
logs: ## Follow logs for SERVICE, default app.
	$(COMPOSE_PROD) logs -f $(SERVICE)

.PHONY: shell
shell: ## Open a shell in SERVICE, default app.
	$(COMPOSE_PROD) exec $(SERVICE) sh

.PHONY: artisan
artisan: ## Run an Artisan command in the app container. Example: make artisan ARGS="route:list".
	$(COMPOSE_PROD) exec app php artisan $(ARGS)

.PHONY: migrate
migrate: ## Run production-like migrations in the app container.
	$(COMPOSE_PROD) exec app php artisan migrate --force

.PHONY: queue-restart
queue-restart: ## Gracefully restart Laravel queue workers.
	$(COMPOSE_PROD) exec app php artisan queue:restart

.PHONY: health
health: ## Check the app health route through the Nginx container.
	$(COMPOSE_PROD) exec nginx wget -qO- http://127.0.0.1/up

.PHONY: nginx-test
nginx-test: ## Validate the Nginx config in the web container.
	$(COMPOSE_PROD) exec nginx nginx -t

.PHONY: infra-up
infra-up: ## Start only shared local infrastructure from compose.yml.
	$(COMPOSE_INFRA) up -d --wait

.PHONY: infra-down
infra-down: ## Stop shared local infrastructure from compose.yml.
	$(COMPOSE_INFRA) down

.PHONY: infra-logs
infra-logs: ## Follow infrastructure logs for INFRA_SERVICE, default postgres.
	$(COMPOSE_INFRA) logs -f $(INFRA_SERVICE)

.PHONY: test
test: ## Run the Laravel test suite locally.
	php artisan test --compact

.PHONY: ci
ci: ## Run the project CI checks locally.
	composer ci:check

.PHONY: lint
lint: ## Run PHP and frontend linters.
	composer lint
	pnpm run lint

.PHONY: format
format: ## Format frontend assets and PHP code.
	pnpm run format
	vendor/bin/pint --format agent

.PHONY: types
types: ## Run TypeScript type checks.
	pnpm run types:check
