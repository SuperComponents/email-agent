# Variables
FRONTEND_DIR ?= frontend
BACKEND_DIR ?= backend
AGENT_DIR ?= agent

# Help target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install       - Install all dependencies (frontend + backend + agent)"
	@echo "  make install-fe    - Install frontend dependencies only"
	@echo "  make install-be    - Install backend dependencies only"
	@echo "  make install-agent - Install agent dependencies only"
	@echo "  make f             - Start the frontend development server"
	@echo "  make b             - Start the backend development server"
	@echo "  make sb            - Start Storybook"
	@echo "  make lf            - Run frontend linters (ESLint and TypeScript)"
	@echo "  make lb            - Run backend linters (ESLint and TypeScript)"
	@echo "  make build-agent   - Build the agent TypeScript project"
	@echo "  make agent-example - Run the agent example (requires .env with OPENAI_API_KEY)"
	@echo "  make db-seed       - Seed the database with test data"
	@echo "  make test-api      - Test API endpoints"
	@echo "  make clean         - Clean all build artifacts"

# Install all dependencies
.PHONY: install
install: install-fe install-be install-agent

# Install frontend dependencies
.PHONY: install-fe
install-fe:
	cd $(FRONTEND_DIR) && npm install

# Install backend dependencies
.PHONY: install-be
install-be:
	cd $(BACKEND_DIR) && npm install

# Install agent dependencies
.PHONY: install-agent
install-agent:
	cd $(AGENT_DIR) && npm install

# Start frontend development server
.PHONY: f
f:
	cd $(FRONTEND_DIR) && npm run dev

# Start backend development server
.PHONY: b
b:
	cd $(BACKEND_DIR) && npm run dev

# Start Storybook
.PHONY: sb
sb:
	cd $(FRONTEND_DIR) && npm run storybook

# Run frontend linters
.PHONY: lf
lf:
	cd $(FRONTEND_DIR) && npm run lint:all

# Run backend linters
.PHONY: lb
lb:
	cd $(BACKEND_DIR) && npm run lint:all

# Build agent TypeScript project
.PHONY: build-agent
build-agent:
	cd $(AGENT_DIR) && npm run build

# Run agent example
.PHONY: agent-example
agent-example: build-agent
	cd $(AGENT_DIR) && node example.js

# Seed database with test data
.PHONY: db-seed
db-seed:
	cd $(BACKEND_DIR) && npm run seed

# Test API endpoints
.PHONY: test-api
test-api:
	@echo "Testing API endpoints..."
	curl -s http://localhost:3000/api/threads | jq '.threads | length' || echo "Backend not running"

# Clean build artifacts
.PHONY: clean
clean:
	cd $(AGENT_DIR) && npm run clean 2>/dev/null || true
