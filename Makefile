# Makefile for SvelteKit Personal Website
# Project: maths-hw (Personal Website/Blog)

# Variables
NODE_VERSION := $(shell node --version)
NPM_VERSION := $(shell npm --version)
BUILD_DIR := build
STATIC_DIR := static
SRC_DIR := src
CONTENT_DIR := src/content

# Default target
.PHONY: help
help: ## Show this help message
	@echo "SvelteKit Personal Website - Make Commands"
	@echo "========================================="
	@echo "Node.js Version: $(NODE_VERSION)"
	@echo "NPM Version: $(NPM_VERSION)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
.PHONY: dev
dev: ## Start development server
	npm run dev

.PHONY: dev-host
dev-host: ## Start development server with network access
	npm run dev -- --host

.PHONY: install
install: ## Install dependencies
	npm install

.PHONY: update
update: ## Update dependencies
	npm update

# Build Commands
.PHONY: build
build: ## Build the static site
	npm run build

.PHONY: preview
preview: build ## Build and preview the site locally
	npm run preview

.PHONY: clean
clean: ## Clean build artifacts
	rm -rf $(BUILD_DIR)
	rm -rf .svelte-kit
	rm -rf node_modules/.vite

.PHONY: clean-all
clean-all: clean ## Clean everything including node_modules
	rm -rf node_modules

# Quality Assurance
.PHONY: check
check: ## Run type checking and Svelte validation
	npm run check

.PHONY: check-watch
check-watch: ## Run type checking in watch mode
	npm run check:watch

.PHONY: lint
lint: ## Run ESLint (if configured)
	@if [ -f "node_modules/.bin/eslint" ]; then \
		npx eslint $(SRC_DIR); \
	else \
		echo "ESLint not found, skipping..."; \
	fi

.PHONY: format
format: ## Format code with Prettier
	@if [ -f "node_modules/.bin/prettier" ]; then \
		npx prettier --write $(SRC_DIR); \
	else \
		echo "Prettier not found, skipping..."; \
	fi

.PHONY: format-check
format-check: ## Check code formatting
	@if [ -f "node_modules/.bin/prettier" ]; then \
		npx prettier --check $(SRC_DIR); \
	else \
		echo "Prettier not found, skipping..."; \
	fi

# Content Management
.PHONY: content-stats
content-stats: ## Show content statistics
	@echo "Content Statistics:"
	@echo "=================="
	@echo "Posts: $$(find $(CONTENT_DIR)/posts -name '*.md' -o -name '*.svx' | wc -l | tr -d ' ')"
	@echo "Logs: $$(find $(CONTENT_DIR)/logs -name '*.md' -o -name '*.svx' | wc -l | tr -d ' ')"
	@echo "Drafts: $$(find $(CONTENT_DIR)/drafts -name '*.md' -o -name '*.svx' 2>/dev/null | wc -l | tr -d ' ')"
	@echo "Total Images: $$(find $(CONTENT_DIR) -name '*.jpg' -o -name '*.jpeg' -o -name '*.png' -o -name '*.gif' -o -name '*.svg' -o -name '*.webp' | wc -l | tr -d ' ')"

.PHONY: extract-images
extract-images: ## Run image extraction and cleanup script (interactive)
	@if [ -f "extract-and-cleanup-images.ts" ]; then \
		echo "Image extraction script found."; \
		echo "Usage: ./extract-and-cleanup-images.ts <markdown_file_or_pattern> [--dry-run]"; \
		echo ""; \
		echo "Examples:"; \
		echo "  Single file: ./extract-and-cleanup-images.ts src/content/posts/my-post.md --dry-run"; \
		echo "  Multiple files: ./extract-and-cleanup-images.ts \"src/content/posts/**/*.md\" --dry-run"; \
		echo "  Pattern: ./extract-and-cleanup-images.ts src/content/posts/2025-*/*.md"; \
		echo ""; \
		echo "The script will automatically detect image folders referenced in the markdown files."; \
	else \
		echo "Image extraction script not found."; \
	fi

.PHONY: extract-images-dry
extract-images-dry: ## Run image extraction in dry-run mode for a specific file or pattern
	@read -p "Enter markdown file path or pattern: " md_pattern; \
	if [ -n "$$md_pattern" ]; then \
		./extract-and-cleanup-images.ts "$$md_pattern" --dry-run; \
	else \
		echo "No pattern provided"; \
	fi

.PHONY: extract-images-all
extract-images-all: ## Run image extraction on all markdown files in posts and logs
	@echo "Running image extraction on all posts and logs..."
	@./extract-and-cleanup-images.ts "src/content/posts/**/*.md" --dry-run
	@echo ""
	@./extract-and-cleanup-images.ts "src/content/logs/**/*.md" --dry-run

# Utility Commands
.PHONY: info
info: ## Show project information
	@echo "Project Information:"
	@echo "==================="
	@echo "Name: $$(jq -r '.name' package.json)"
	@echo "Version: $$(jq -r '.version' package.json)"
	@echo "Node.js: $(NODE_VERSION)"
	@echo "NPM: $(NPM_VERSION)"
	@echo "Build Directory: $(BUILD_DIR)"
	@echo "Source Directory: $(SRC_DIR)"
	@echo ""
	@echo "Available Scripts:"
	@jq -r '.scripts | to_entries[] | "  \(.key): \(.value)"' package.json

.PHONY: deps
deps: ## Show dependency information
	@echo "Dependencies:"
	@echo "============="
	@npm list --depth=0

.PHONY: outdated
outdated: ## Check for outdated packages
	npm outdated

# Maintenance
.PHONY: reset
reset: clean-all install ## Reset project (clean + reinstall)
	@echo "Project reset complete"

.PHONY: status
status: ## Show git and project status
	@echo "Git Status:"
	@echo "==========="
	@git status --short || echo "Not a git repository"
	@echo ""
	@echo "Build Status:"
	@echo "============="
	@if [ -d "$(BUILD_DIR)" ]; then \
		echo "✓ Build directory exists"; \
		echo "Build size: $$(du -sh $(BUILD_DIR) | cut -f1)"; \
	else \
		echo "✗ No build found"; \
	fi
	@echo ""
	@$(MAKE) content-stats

# Development Workflow
.PHONY: start
start: install dev ## Install dependencies and start development

.PHONY: deploy-build
deploy-build: clean check build ## Full deployment build with validation
	@echo "Deployment build complete"
	@echo "Build size: $$(du -sh $(BUILD_DIR) | cut -f1)"

.PHONY: publish
publish: ## Build and publish to Neocities
	npm run build && neocities push build/

# Aliases for convenience
.PHONY: d
d: dev ## Alias for dev

.PHONY: b
b: build ## Alias for build

.PHONY: c
c: check ## Alias for check

.PHONY: i
i: install ## Alias for install

# Default target when no arguments provided
.DEFAULT_GOAL := help