# ProResponse AI

An open-source AI-powered customer support platform with intelligent email thread management, automated response generation, and comprehensive knowledge base management.

## Project Structure

- **`agent3/`** - Primary AI agent system (ACTIVE) - Real-time email processing with OpenAI Agents SDK
- **`backend/`** - API server with PostgreSQL database, authentication, and agent integration
- **`frontend/`** - React application with modern UI components and knowledge base management
- **`rag/`** - Complete knowledge base system with GitHub integration and vector search
- **`landing-page/`** - Marketing website
- **`agent/`** - Legacy agent implementation (see LEGACY.md)
- **`agent2/`** - Legacy experimental agent (see LEGACY.md)

## Key Features

### ✅ **Fully Implemented**
- **AI-Powered Email Processing**: Real-time email analysis and draft generation
- **Knowledge Base Management**: Complete UI for managing company documentation with GitHub sync
- **RAG Integration**: Production-ready retrieval-augmented generation with OpenAI vector store
- **Database Operations**: Comprehensive PostgreSQL schema with audit trails
- **Modern Frontend**: React with Tailwind CSS v4, atomic design components
- **Authentication Infrastructure**: StackAuth integration ready (currently disabled for testing)

### 🔄 **In Development**
- **Email Provider Integration**: Gmail/Outlook OAuth and synchronization
- **Real-time Features**: WebSocket support for live updates
- **Advanced UI Features**: Read/unread tracking, tagging system, assignments

## Getting Started

1. Set the env variables (see [INTEGRATION.md](INTEGRATION.md))
2. Run `docker compose up --build`
3. Install the frontend deps `make install-fe`
4. Run the app: `make f`
5. Access the landing page at `localhost:3001`
6. The app is running on `localhost:5173`

## Quick Development

```bash
# Install all dependencies
make install

# Start development servers
make f  # Frontend (React)
make b  # Backend (API + Agent3)

# Build active agent
make build-agent  # Builds agent3/
```

## Integration

The system integrates `agent3/` (the active AI agent) with the backend API and frontend. The RAG system provides a complete knowledge base management interface with GitHub integration for automatic vector store updates.

See [INTEGRATION.md](INTEGRATION.md) for complete setup instructions.

**Note**: `agent/` and `agent2/` directories contain legacy implementations that are not actively developed or integrated. Use `agent3/` for all current development.