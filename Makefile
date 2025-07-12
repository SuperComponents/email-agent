# Variables
FRONTEND_DIR ?= frontend
BACKEND_DIR ?= backend
AGENT_DIR ?= agent4
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
	@echo "  make l             - Run all linters (frontend and backend)"
	@echo ""
	@echo "Docker Commands:"
	@echo "  make up            - Start containers with build and clean database"
	@echo "  make down          - Stop and remove containers"
	@echo "  make logs          - View container logs"
	@echo "  make logs-f        - Follow container logs"
	@echo "  make shell         - Open shell in running container"
	@echo "  make status        - Show container status"

# Start containers with build and clean database
.PHONY: up
up:
	$(DOCKER_COMPOSE) down -v
	$(DOCKER_COMPOSE) up --build -d

# Stop and remove containers
.PHONY: down
down:
	$(DOCKER_COMPOSE) down

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

# Show container status
.PHONY: status
status:
	@$(DOCKER_COMPOSE) ps
	@echo ""
	@echo "API Health Check:"
	@curl -s http://localhost:3000/ || echo "API not responding"

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

# Run all linters
.PHONY: l
l:
	cd $(FRONTEND_DIR) && npm run lint:all
	cd $(BACKEND_DIR) && npm run lint:all
