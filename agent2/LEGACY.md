# ⚠️ LEGACY AGENT IMPLEMENTATION

**This agent implementation is NOT actively developed or integrated into the main application.**

## Status: LEGACY / NOT ACTIVE

- **Current Active Agent**: `../agent3/`
- **Integration Status**: Not integrated with current backend
- **Development Status**: Not actively maintained
- **Usage**: Do not use for new development

## What This Directory Contains

This directory contains an experimental agent implementation that was developed as part of the project evolution. It includes:

- Worker thread-based architecture
- OpenAI Agents SDK integration
- Evaluation framework for agent performance
- Vitest testing setup
- TypeScript configuration with strict mode

## Why It's Still Here

This directory is kept for:
- **Experimental patterns** - Contains interesting architectural approaches
- **Testing methodologies** - Useful evaluation and testing patterns
- **Code reference** - Working implementations that might inform future development
- **Branch compatibility** - Other branches might still reference this implementation

## Current Active Implementation

**Use `../agent3/` instead** - This is the actively developed and integrated agent system.

See the main [INTEGRATION.md](../INTEGRATION.md) for current integration instructions.

## Key Differences from Active Agent

This experimental agent focused on:
- **Worker thread isolation** - Running agents in separate threads
- **Evaluation framework** - Systematic testing of agent performance
- **Mock tool integration** - Simulated tool calls for testing
- **Modular architecture** - Clean separation of concerns

The current `agent3/` implementation instead focuses on:
- **Direct database integration** - Real data processing
- **Streaming responses** - Real-time processing feedback
- **Production tooling** - Email search, tagging, RAG search
- **Backend API integration** - Direct integration with the main application

## Migration Notes

If you're working with code that references this experimental agent:

1. **Architecture change**: Move from worker threads to direct integration
2. **Testing approach**: Adapt evaluation patterns to integration testing
3. **Tool integration**: Use real tools instead of mock implementations
4. **Configuration**: Update environment and configuration management

## Do Not Delete

**Please do not delete this directory** without verifying that:
- No other branches depend on it
- No external references exist
- All useful patterns have been migrated to agent3/
- Testing methodologies have been preserved elsewhere

---

**For current development, use `../agent3/` - see [INTEGRATION.md](../INTEGRATION.md)** 