# Variables
FRONTEND_DIR ?= frontend

# Help target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make install  - Install frontend dependencies"
	@echo "  make f        - Start the frontend development server"
	@echo "  make sb       - Start Storybook"

# Install frontend dependencies
.PHONY: install
install:
	cd $(FRONTEND_DIR) && npm install

# Start frontend development server
.PHONY: f
f:
	cd $(FRONTEND_DIR) && npm run dev

# Start Storybook
.PHONY: sb
sb:
	cd $(FRONTEND_DIR) && npm run storybook
