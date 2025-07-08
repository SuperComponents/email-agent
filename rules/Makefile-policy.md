## Makefile Maintenance Policy
Create and maintain a Makefile in the project root for all core repository actions. Follow these best practices:

Core Principles:
- Provide a single entry point for common development tasks
- Make commands self-documenting and intuitive
- Ensure reproducible builds across different environments
- Minimize setup friction for new developers
Essential Commands to Include:
- Run the entire application locally
- Run individual services (frontend, backend, etc.) separately
- Build all components
- Install dependencies
- Run tests
- Clean build artifacts
- Deploy or package for production

Best Practices:
- Use descriptive target names - Commands should be self-explanatory (e.g., build, test, clean, run)
- Declare .PHONY targets - Prevent conflicts with files of the same name
- Define variables at the top - Use ?= for overridable defaults
- Make targets idempotent - Running a command twice should produce the same result
- Handle dependencies properly - Targets should declare their prerequisites
- Provide a help target - List available commands and their descriptions
- Keep it simple - Avoid complex logic; use shell scripts for complicated operations
- Use standard conventions - Follow common naming patterns (e.g., all, clean, install)
- Document non-obvious commands - Add comments for complex targets
- Fail fast - Use set -e in shell commands or chain with &&

Structure:

```
# Variables
VAR_NAME ?= default_value

# Help target
.PHONY: help
help:
	@echo "Available commands:"
	@echo "  make build    - Build the application"
	@echo "  make run      - Run locally"

# Targets
.PHONY: build
build:
	# Build commands here

```


Try to minimize changes to this. The makefile only needs to be updated when there are configuration changes.

