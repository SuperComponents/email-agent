# ProResponse AI Architecture Overview

This document provides a clear overview of the ProResponse AI project architecture and component status.

## 🚀 Active Components

### Primary AI Agent: `agent3/`
- **Status**: ✅ ACTIVE & INTEGRATED
- **Purpose**: Email processing and response generation
- **Integration**: Fully integrated with backend API
- **Features**: OpenAI Agents SDK, streaming responses, tool integration
- **Tech Stack**: TypeScript, Bun runtime, OpenAI Agents SDK

### Backend API: `backend/`
- **Status**: ✅ ACTIVE & PRODUCTION-READY
- **Purpose**: REST API server with database integration
- **Tech Stack**: Hono framework, PostgreSQL, Drizzle ORM, TypeScript
- **Features**: Thread management, draft generation, agent integration

### Frontend: `frontend/`
- **Status**: ✅ ACTIVE & PRODUCTION-READY
- **Purpose**: React-based user interface
- **Tech Stack**: React, Vite, Tailwind CSS v4, TypeScript, Zustand
- **Features**: Email threads, agent panel, modern UI components

### Landing Page: `landing-page/`
- **Status**: ✅ ACTIVE
- **Purpose**: Marketing and onboarding website
- **Tech Stack**: React, Tailwind CSS, Bun
- **Features**: Product showcase, pricing, authentication

### RAG System: `rag/`
- **Status**: ✅ ACTIVE
- **Purpose**: Knowledge base and vector search
- **Tech Stack**: OpenAI Vector Store, TypeScript, GitHub Integration
- **Features**: Document indexing, semantic search, automatic sync

## 🗂️ Legacy Components (Not Active)

### Legacy Agent: `agent/`
- **Status**: ❌ LEGACY - NOT ACTIVE
- **Purpose**: Original agent implementation
- **Note**: See `agent/LEGACY.md` for details
- **Migration**: Use `agent3/` instead

### Experimental Agent: `agent2/`
- **Status**: ❌ LEGACY - NOT ACTIVE
- **Purpose**: Experimental worker-based agent
- **Note**: See `agent2/LEGACY.md` for details
- **Migration**: Use `agent3/` instead

## 🔄 Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Agent3        │
│   (React)       │◄──►│   (Hono API)    │◄──►│   (OpenAI)      │
│                 │    │                 │    │                 │
│ • Thread UI     │    │ • REST API      │    │ • Email         │
│ • Agent Panel   │    │ • Database      │    │   Processing    │
│ • Composer      │    │ • Auth          │    │ • Tool Calls    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   PostgreSQL    │
                       │   Database      │
                       │                 │
                       │ • Threads       │
                       │ • Emails        │
                       │ • Drafts        │
                       │ • Actions       │
                       └─────────────────┘
```

## 🛠️ Development Workflow

### Quick Start
```bash
# Install all dependencies
make install

# Start development servers
make f  # Frontend (React)
make b  # Backend (API + Agent3)

# Docker deployment
make up
```

### Active Development Targets
- **Frontend**: `localhost:5173` (Vite dev server)
- **Backend**: `localhost:3000` (API server)
- **Landing**: `localhost:3001` (Marketing site)
- **Database**: PostgreSQL (via Docker)

## 🗃️ Database Schema

### Core Tables (Production)
- `threads` - Email conversation threads
- `emails` - Individual email messages  
- `draft_responses` - AI-generated response drafts
- `agent_actions` - Comprehensive agent activity logging
- `email_tags` - Email classification and tagging
- `users` - User management and authentication

### Integration Status
- ✅ **Agent3** - Direct database integration
- ✅ **Backend** - Full schema utilization
- ✅ **Frontend** - API consumption
- ❌ **Legacy Agents** - Not connected

## 🔐 Authentication

- **System**: StackAuth integration
- **Status**: ✅ Infrastructure Complete (Disabled for Testing)
- **Features**: JWT tokens, protected routes, user management ready
- **Current State**: Temporarily disabled with mock authentication for development/testing
- **To Enable**: Uncomment StackAuth code in auth middleware and frontend client

## 📦 Deployment

### Docker Compose
```yaml
services:
  backend:     # API server + Agent3
  db:          # PostgreSQL database
  landing:     # Marketing website
```

### Environment Variables
```bash
# Backend
OPENAI_API_KEY=required
DATABASE_URL=postgresql://...
STACK_PROJECT_ID=required (when auth enabled)

# Frontend
VITE_API_URL=http://localhost:3000
VITE_STACK_PROJECT_ID=required (when auth enabled)
VITE_GITHUB_TOKEN=required (for knowledge base management)
```

## 🎯 Current Development Focus

### ✅ Working Well
- Core email processing and AI responses
- Database operations and performance
- Frontend components and user experience
- Agent3 integration and tool calling
- **Complete RAG system with full knowledge base management UI**
- **StackAuth infrastructure (ready to enable)**

### 🔄 In Progress
- Frontend-backend feature alignment
- Enhanced customer profiles
- Real-time updates and notifications
- Email provider OAuth integration (Gmail/Outlook)

### 📋 Backlog
- WebSocket support for real-time features
- Advanced analytics and reporting
- Multi-language support
- Email client synchronization (Gmail, Outlook APIs)

## 🚨 Important Notes

1. **Agent3 is the ONLY active agent** - Do not use `agent/` or `agent2/`
2. **Legacy dependencies removed** - Backend no longer depends on old agents
3. **Database schema shared** - Backend and Agent3 use same schema
4. **Frontend integration** - UI expects certain fields not yet in database

## 📚 Documentation

- **System Status**: [SYSTEM_STATUS.md](SYSTEM_STATUS.md) - Complete implementation status overview
- **Authentication Guide**: [AUTHENTICATION.md](AUTHENTICATION.md) - Authentication implementation and setup
- **Integration Guide**: [INTEGRATION.md](INTEGRATION.md) - Setup and integration instructions
- **API Status**: [integration-plan.md](integration-plan.md) - API implementation details
- **Feature Gaps**: [gaps.md](gaps.md) - Frontend-backend alignment status
- **Legacy Notice**: `agent/LEGACY.md` and `agent2/LEGACY.md` - Legacy component information

---

**For current development, focus on `agent3/`, `backend/`, and `frontend/` directories. Legacy agents are preserved for reference but not actively developed.** 