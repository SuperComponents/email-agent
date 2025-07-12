# Variables
FRONTEND_DIR ?= frontend
BACKEND_DIR ?= backend
AGENT_DIR ?= agent3
DOCKER_COMPOSE = docker compose

# Default target - show help
.PHONY: help
help:
	@echo "Email Agent - Available Commands"
	@echo "================================"
	@echo ""
	@echo "Development Commands:"
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
	@echo "  make clean         - Clean all build artifacts"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make docker-build  - Build Docker image"
	@echo "  make up            - Start containers with $(DOCKER_COMPOSE)"
	@echo "  make down          - Stop and remove containers"
	@echo "  make restart       - Restart containers"
	@echo "  make logs          - View container logs"
	@echo "  make logs-f        - Follow container logs"
	@echo "  make shell         - Open shell in running container"
	@echo "  make docker-clean  - Remove containers and images"
	@echo "  make prune         - Clean up Docker system"
	@echo "  make status        - Show container status"
	@echo "  make test-api      - Test API endpoints"
	@echo "  make rebuild       - Force rebuild and start containers"
	@echo "  make check-env     - Check required environment variables"
	@echo ""
	@echo "Docker Shortcuts:"
	@echo "  make rl            - Restart and follow logs"
	@echo "  make bu            - Build and up"
	@echo "  make dbu           - Down, build, and up"

# Build Docker image
.PHONY: docker-build
docker-build:
	docker build -t email-agent-backend -f Dockerfile .

# Start containers using docker compose
.PHONY: up
up:
	$(DOCKER_COMPOSE) up -d

# Stop and remove containers
.PHONY: down
down:
	$(DOCKER_COMPOSE) down

# Restart containers
.PHONY: restart
restart:
	$(DOCKER_COMPOSE) restart

# View logs
.PHONY: logs
logs:
	$(DOCKER_COMPOSE) logs

# Follow logs
.PHONY: logs-f
logs-f:
	$(DOCKER_COMPOSE) logs -f

# Open shell in running container
.PHONY: shell
shell:
	$(DOCKER_COMPOSE) exec backend sh

# Remove containers and images
.PHONY: docker-clean
docker-clean:
	$(DOCKER_COMPOSE) down -v
	docker rmi email-agent-backend || true

# Clean up Docker system
.PHONY: prune
prune:
	docker system prune -f
	docker image prune -f
	docker builder prune -f

# Show container status
.PHONY: status
status:
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "API Health Check:"
	@curl -s http://localhost:3000/ || echo "API not responding"

# Force rebuild and start
.PHONY: rebuild
rebuild:
	$(DOCKER_COMPOSE) build --no-cache
	$(DOCKER_COMPOSE) up -d

# Development mode with live reload (requires volume mounts in $(DOCKER_COMPOSE))
.PHONY: docker-dev
docker-dev:
	$(DOCKER_COMPOSE) up

# Production build and deploy
.PHONY: prod
prod:
	docker build -t email-agent-backend:prod -f Dockerfile .
	@echo "Production image built. Tag: email-agent-backend:prod"

# Database test
.PHONY: db-test
db-test:
	@curl -s http://localhost:3000/db-test | jq '.'

# Quick restart with logs
.PHONY: rl
rl: restart logs-f

# Build and up
.PHONY: bu
bu: docker-build up

# Down, build, up
.PHONY: dbu
dbu: down docker-build up

# Check environment
.PHONY: check-env
check-env:
	@echo "Checking for required environment variables in backend/.env..."
	@grep -q "DATABASE_URL" backend/.env && echo "✓ DATABASE_URL found" || echo "✗ DATABASE_URL missing"
	@grep -q "OPENAI_API_KEY" backend/.env && echo "✓ OPENAI_API_KEY found" || echo "✗ OPENAI_API_KEY missing"
	@grep -q "STACK_PROJECT_ID" backend/.env && echo "✓ STACK_PROJECT_ID found" || echo "✗ STACK_PROJECT_ID missing"
	@grep -q "VECTOR_STORE_ID" backend/.env && echo "✓ VECTOR_STORE_ID found" || echo "✗ VECTOR_STORE_ID missing"

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

# Run agent example
.PHONY: agent-example
agent-example: build-agent
	cd $(AGENT_DIR) && node enhancedExample.js

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

# Build agent
.PHONY: build-agent
build-agent:
	cd $(AGENT_DIR) && npm run build
