# -----------------------------------------------------------------------------
# Thin wrappers around the flows that are otherwise long to type or easy to get
# subtly wrong (build arguments, compose file ordering). Anything that is just
# a pnpm script stays a pnpm script — this file does not try to replace them,
# it only gives one entry point that `make help` can enumerate.
#
# Every target documents itself with a `## ` comment; `make` with no argument
# prints the list.
# -----------------------------------------------------------------------------
.DEFAULT_GOAL := help

# A recipe that pipes must fail on the first failing stage, not the last.
SHELL := /usr/bin/env bash
.SHELLFLAGS := -eu -o pipefail -c

# Local image tag. Override for a one-off: `make docker-build IMAGE=site:test`.
IMAGE ?= vladimirshikov-site:local

# Registry reference the deploy targets install. Deliberately empty: deploying
# "whatever :latest points at right now" is how you ship an unknown build.
DEPLOY_IMAGE ?=

COMPOSE := docker compose
# Naming the files explicitly stops compose from auto-loading
# docker-compose.override.yml, which is local-development only.
COMPOSE_PROD := $(COMPOSE) -f docker-compose.yml
COMPOSE_STAGING := $(COMPOSE) -f docker-compose.yml -f docker-compose.staging.yml

# Recursive (=) rather than immediate (:=) so these only shell out when a target
# that needs them actually runs.
GIT_SHA = $(shell git rev-parse --short HEAD 2>/dev/null || echo unknown)
BUILD_DATE = $(shell date -u +%Y-%m-%dT%H:%M:%SZ)
VERSION = $(shell node -p "require('./package.json').version" 2>/dev/null || echo 0.0.0)

.PHONY: help bootstrap dev build test e2e lint format \
        docker-build docker-run compose-up compose-down \
        deploy-staging deploy-prod clean

help: ## List the available targets
	@printf 'Usage: make <target>\n\n'
	@grep -hE '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| sort \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[1m%-16s\033[0m %s\n", $$1, $$2}'
	@printf '\nVariables: IMAGE=%s  DEPLOY_IMAGE=%s\n' '$(IMAGE)' '$(DEPLOY_IMAGE)'

# --- development -------------------------------------------------------------
bootstrap: ## Install toolchain, dependencies, .env.local and browsers
	./scripts/bootstrap.sh

dev: ## Run the dev server on http://localhost:3000
	pnpm dev

build: ## Production build (standalone output)
	pnpm build

test: ## Unit tests
	pnpm test

e2e: ## Playwright end-to-end tests
	pnpm e2e

lint: ## ESLint, zero warnings tolerated
	pnpm lint

format: ## Rewrite files with Prettier
	pnpm format

# --- containers --------------------------------------------------------------
docker-build: ## Build the production image locally
	docker build \
		--build-arg VERSION=$(VERSION) \
		--build-arg VCS_REF=$(GIT_SHA) \
		--build-arg BUILD_DATE=$(BUILD_DATE) \
		--tag $(IMAGE) \
		.

docker-run: ## Run that image on http://localhost:3000
	docker run --rm --init -p 127.0.0.1:3000:3000 \
		--env-file .env.local \
		$(IMAGE)

compose-up: ## Start the local stack (web only, no TLS) and wait for health
	IMAGE=$(IMAGE) $(COMPOSE) up -d --wait
	@printf '\n  http://localhost:3000  —  logs: docker compose logs -f web\n'

compose-down: ## Stop the local stack and remove its containers
	$(COMPOSE) down --remove-orphans

# --- deployment --------------------------------------------------------------
# These run *on the target host*. CI reaches that host over SSH and invokes the
# same script, so a manual recovery uses exactly the tested code path.
deploy-staging: ## Deploy DEPLOY_IMAGE to staging (run on the staging host)
	@test -n '$(DEPLOY_IMAGE)' || { \
		echo 'set DEPLOY_IMAGE, e.g. make deploy-staging DEPLOY_IMAGE=ghcr.io/iuriishikov/vladimirshikov-site:develop'; \
		exit 1; \
	}
	./scripts/deploy.sh --env staging --image '$(DEPLOY_IMAGE)'

deploy-prod: ## Deploy DEPLOY_IMAGE to production (run on the production host)
	@test -n '$(DEPLOY_IMAGE)' || { \
		echo 'set DEPLOY_IMAGE, e.g. make deploy-prod DEPLOY_IMAGE=ghcr.io/iuriishikov/vladimirshikov-site:v1.0.0'; \
		exit 1; \
	}
	./scripts/deploy.sh --env production --image '$(DEPLOY_IMAGE)'

# --- housekeeping ------------------------------------------------------------
clean: ## Remove build output, coverage and test reports
	pnpm clean
