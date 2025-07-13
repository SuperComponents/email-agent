# Define directories
FRONTEND_DIR = frontend
BACKEND_DIR = backend
AGENT_DIR = agent4

.PHONY: help dev prod build up down logs clean restart install install-fe install-be install-agent f l shell status

# Default target
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
	@echo ""
	@echo "Docker Development Commands:"
	@echo "  make dev           - Start development environment with HMR"
	@echo "  make prod          - Start production environment"
	@echo "  make build         - Build all services"
	@echo "  make restart       - Restart all services"
	@echo "  make clean         - Stop and remove containers, networks, and volumes"
	@echo "  make shell-fe      - Open shell in frontend container"
	@echo "  make shell-be      - Open shell in backend container"
	@echo "  make logs-fe       - Show frontend logs"
	@echo "  make logs-be       - Show backend logs"
	@echo "  make lint-fe       - Run frontend linting in Docker"
	@echo "  make test-fe       - Run frontend tests in Docker"

# Install all dependencies
install: install-fe install-be install-agent

# Install frontend dependencies
install-fe:
	cd $(FRONTEND_DIR) && npm install

# Install backend dependencies
install-be:
	cd $(BACKEND_DIR) && npm install

# Install agent dependencies
install-agent:
	cd $(AGENT_DIR) && npm install

# Start frontend development server
f:
	cd $(FRONTEND_DIR) && npm run dev

# Run all linters
l:
	cd $(FRONTEND_DIR) && npm run lint:all
	cd $(BACKEND_DIR) && npm run lint:all

# Original Docker commands
# Start containers with build and clean database
up:
	docker-compose down -v
	docker-compose up --build -d

# Stop and remove containers
down:
	docker-compose down

# View logs
logs:
	docker-compose logs

# Follow logs
logs-f:
	docker-compose logs -f

# Open shell in running container
shell:
	docker-compose exec backend sh

# Show container status
status:
	docker-compose ps
	@echo ""
	@echo "API Health Check:"
	@curl -s http://localhost:3000/ || echo "API not responding"

# Development environment (default)
dev:
	docker-compose up -d
	@echo "Development environment started!"
	@echo "Frontend: http://localhost:5173"
	@echo "Backend: http://localhost:3000"
	@echo "Landing Page: http://localhost:3001"

# Production environment
prod:
	docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
	@echo "Production environment started!"
	@echo "Frontend: http://localhost:80"
	@echo "Backend: http://localhost:3000"
	@echo "Landing Page: http://localhost:3001"

# Build all services
build:
	docker-compose build

# Restart services
restart:
	docker-compose restart

# Clean up everything
clean:
	docker-compose down -v --remove-orphans
	docker system prune -f

# Shell access
shell-fe:
	docker-compose exec frontend /bin/bash

shell-be:
	docker-compose exec backend /bin/bash

# Frontend logs
logs-fe:
	docker-compose logs -f frontend

# Backend logs
logs-be:
	docker-compose logs -f backend

# Frontend development commands
install-fe-docker:
	docker-compose exec frontend npm install

lint-fe:
	docker-compose exec frontend npm run lint

test-fe:
	docker-compose exec frontend npm run test

# Rebuild specific services
rebuild-fe:
	docker-compose build frontend
	docker-compose up -d frontend

rebuild-be:
	docker-compose build backend
	docker-compose up -d backend

# Database commands
db-shell:
	docker-compose exec db psql -U email_agent -d email_agent

db-reset:
	docker-compose down
	docker volume rm email-agent_postgres_data
	docker-compose up -d
