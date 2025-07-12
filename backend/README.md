# ProResponse AI Backend

The backend API server for ProResponse AI - an AI-powered customer support platform that provides intelligent email thread management and automated response generation.

## Overview

This backend serves as the API layer for ProResponse AI, handling email thread management, AI agent integration, and database operations. It's fully integrated with the `agent3/` AI system to provide real-time email processing and draft generation.

## Features

### ✅ **Implemented**
- **RESTful API**: Complete thread and email management endpoints
- **AI Agent Integration**: Direct integration with `agent3/` for email processing
- **Database Operations**: Full CRUD operations with PostgreSQL
- **Authentication**: StackAuth JWT validation (currently disabled for testing)
- **CORS Support**: Configured for frontend integration
- **Error Handling**: Comprehensive error handling and logging
- **Draft Management**: AI-generated response drafts with versioning

### 🔄 **In Development**
- **WebSocket Support**: Real-time updates for agent activity
- **Email Provider Integration**: Gmail/Outlook OAuth and synchronization
- **Advanced Filtering**: Enhanced search and filtering capabilities

## Tech Stack

- **Framework**: Hono (fast, lightweight web framework)
- **Database**: PostgreSQL with Drizzle ORM
- **Runtime**: Node.js with TypeScript
- **AI Integration**: OpenAI Agents SDK via `agent3/`
- **Authentication**: StackAuth with JWT tokens
- **Validation**: Zod for request/response validation

## Architecture

```
┌─────────────────────┐
│   Frontend          │
│   (React/Vite)      │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐
│   Hono API Server   │
│   (Backend)         │
├─────────────────────┤
│ • REST Endpoints    │
│ • Agent Integration │
│ • Authentication    │
│ • Database Layer    │
└─────────────────────┘
           │
           ▼
┌─────────────────────┐    ┌─────────────────────┐
│   PostgreSQL        │    │   Agent3            │
│   Database          │    │   (OpenAI)          │
│                     │    │                     │
│ • Threads           │    │ • Email Processing  │
│ • Emails            │    │ • Draft Generation  │
│ • Drafts            │    │ • Tool Integration  │
│ • Actions           │    │ • RAG Search        │
│ • Users             │    │ • Citations         │
└─────────────────────┘    └─────────────────────┘
```

## Database Schema

### Core Tables
- **users**: User accounts and authentication
- **threads**: Email conversation threads
- **emails**: Individual email messages
- **draft_responses**: AI-generated response drafts with versioning
- **agent_actions**: Comprehensive audit log of agent activities
- **email_tags**: AI-generated email classification tags

### Key Relationships
- Threads contain multiple emails
- Emails can have multiple draft responses
- All agent actions are logged with full context
- Draft responses support versioning and citations

## API Endpoints

### Thread Management
```
GET    /api/threads           # List threads with filtering
GET    /api/threads/:id       # Get thread details
POST   /api/threads/:id/regenerate  # Trigger AI agent processing
```

### Email Management
```
GET    /api/threads/:id/messages    # Get emails in thread
POST   /api/messages                # Create new email/message
```

### Draft Management
```
GET    /api/drafts/:id        # Get draft details
POST   /api/drafts/:id/approve # Approve draft
```

### Agent Integration
```
POST   /api/threads/:id/regenerate  # Process thread with agent3
GET    /api/agent-actions     # Get agent activity log
```

### System
```
GET    /api/counts           # Get filter counts for UI
POST   /api/demo/create-thread # Create demo thread (testing)
```

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/proresponse

# OpenAI Integration
OPENAI_API_KEY=sk-your-openai-key-here
VECTOR_STORE_ID=vs_your_vector_store_id

# Authentication (when enabled)
STACK_PROJECT_ID=your-stack-project-id
STACK_SECRET_SERVER_KEY=ssk-your-secret-key

# Optional
NODE_ENV=development
PORT=3000
```

## Development

### Available Scripts
```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build TypeScript
npm run start        # Start production server

# Database
npm run db:migrate   # Run database migrations
npm run db:generate  # Generate new migration

# Quality
npm run lint         # Run ESLint
npm run lint:all     # Run TypeScript check + ESLint
```

### Agent Integration

The backend automatically integrates with `agent3/` for AI processing:

```typescript
// Example: Process email thread with AI
import { processEmail } from 'agent3';

// In your route handler
const result = await processEmail(threadId, logger);
// Returns: { draft: DraftResponse, actions: AgentAction[] }
```

### Database Operations

Using Drizzle ORM for type-safe database operations:

```typescript
import { db } from './database/db.js';
import { threads, emails, draft_responses } from './database/schema.js';

// Get thread with emails
const thread = await db.query.threads.findFirst({
  where: eq(threads.id, threadId),
  with: {
    emails: true,
    draft_responses: true
  }
});
```

## Authentication

The backend includes complete StackAuth integration:

- **JWT Validation**: Middleware validates tokens on protected routes
- **User Context**: Extracts user information from JWT
- **Role-Based Access**: Supports agent, manager, and admin roles
- **Current Status**: Disabled for development/testing

### Enabling Authentication
1. Set `STACK_PROJECT_ID` and `STACK_SECRET_SERVER_KEY` in `.env`
2. Uncomment authentication middleware in `src/middleware/auth.ts`
3. Update frontend to include JWT tokens in requests

## API Integration

The backend is designed to work seamlessly with the ProResponse AI frontend:

- **CORS**: Configured for frontend domain
- **Type Safety**: Shared types with frontend
- **Error Handling**: Consistent error responses
- **Validation**: Request/response validation with Zod

## Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker compose up --build

# Or build individual image
docker build -t proresponse-backend .
docker run -p 3000:3000 proresponse-backend
```

### Production Checklist
- [ ] Set production environment variables
- [ ] Configure SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Enable authentication
- [ ] Set up rate limiting

## Testing

```bash
# Run integration tests
npm test

# Test specific functionality
npm run test:integration
```

## Contributing

1. Follow TypeScript best practices
2. Use Drizzle ORM for database operations
3. Validate all inputs with Zod
4. Log agent actions for audit trails
5. Maintain backward compatibility

## Integration Notes

- **Agent3 Integration**: The backend directly imports and uses `agent3/` package
- **Database Schema**: Matches the actual implementation in `src/database/schema.ts`
- **Real Endpoints**: All documented endpoints are implemented and functional
- **Frontend Compatible**: API responses match frontend expectations

For frontend integration details, see [INTEGRATION.md](../INTEGRATION.md).