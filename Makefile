# Variables
FRONTEND_DIR ?= frontend
AGENT_DIR ?= agent

# Help target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install       - Install all dependencies (frontend + agent)"
	@echo "  make install-fe    - Install frontend dependencies only"
	@echo "  make install-agent - Install agent dependencies only"
	@echo "  make f             - Start the frontend development server"
	@echo "  make sb            - Start Storybook"
	@echo "  make build-agent   - Build the agent TypeScript project"
	@echo "  make agent-example - Run the agent example (requires .env with OPENAI_API_KEY)"
	@echo "  make clean         - Clean all build artifacts"

# Install all dependencies
.PHONY: install
install: install-fe install-agent

# Install frontend dependencies
.PHONY: install-fe
install-fe:
	cd $(FRONTEND_DIR) && npm install

# Install agent dependencies
.PHONY: install-agent
install-agent:
	cd $(AGENT_DIR) && npm install

# Start frontend development server
.PHONY: f
f:
	cd $(FRONTEND_DIR) && npm run dev

# Start Storybook
.PHONY: sb
sb:
	cd $(FRONTEND_DIR) && npm run storybook

# Build agent TypeScript project
.PHONY: build-agent
build-agent:
	cd $(AGENT_DIR) && npm run build

# Run agent example
.PHONY: agent-example
agent-example: build-agent
	cd $(AGENT_DIR) && node example.js

# Clean build artifacts
.PHONY: clean
clean:
	cd $(AGENT_DIR) && npm run clean 2>/dev/null || true
