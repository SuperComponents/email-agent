# Email Agent Integration Guide

This document explains how to integrate the `agent3/` AI agent backend with the `frontend/` React application.

## Project Structure

```
email-agent/
├── agent3/          # Primary AI agent backend (ACTIVE)
│   ├── src/         # Agent source code
│   └── package.json # Agent dependencies
├── agent/           # Legacy agent implementation (NOT ACTIVE - see LEGACY.md)
├── agent2/          # Legacy agent implementation (NOT ACTIVE - see LEGACY.md)
├── backend/         # API backend server
│   └── src/routes/agent.ts  # Integrates with agent3/
├── frontend/        # React + TypeScript frontend
│   └── src/components/  # UI components ready for agent integration
└── Makefile         # Build commands (targets agent3/)
```

## Quick Start

### 1. Install All Dependencies
```bash
make install
```

### 2. Build the Agent
```bash
make build-agent  # Builds agent3/
```

### 3. Start Frontend Development
```bash
make f
```

### 4. Start Backend Development
```bash
make b  # Backend integrates with agent3/
```

## Agent3 Backend Integration

The primary agent (`agent3/`) provides email processing capabilities:

```typescript
import { processEmail } from 'agent3';

// Process an email thread with AI agent
const result = await processEmail(
  threadId,          // number: database thread ID
  logger            // function: optional logging function
);

// Returns: { draft: DraftResponse, actions: AgentAction[] }
```

## Backend API Integration

The backend (`backend/src/routes/agent.ts`) automatically integrates with `agent3/`:

```typescript
// This happens automatically in the backend
import { processEmail } from 'agent3';

// POST /api/threads/:id/regenerate
const response = await processEmail(threadId, logger);
```

## Frontend Integration Points

The frontend components work with the agent through the backend API:

### AgentPanel Component

Located: `frontend/src/components/organisms/AgentPanel.tsx`

```typescript
interface AgentPanelProps {
  actions: AgentActionProps[];    // Tool calls from agent3
  analysis?: string;              // Agent reasoning
  draftResponse?: string;         // Generated draft
}
```

### Usage Example

```typescript
// In your React component
import { AgentPanel } from './components/organisms/AgentPanel';

function EmailSupport() {
  const [agentData, setAgentData] = useState({
    actions: [],
    analysis: '',
    draftResponse: ''
  });

  const handleProcessEmail = async (threadId: string) => {
    try {
      // Call backend API (which uses agent3/)
      const response = await fetch(`/api/threads/${threadId}/regenerate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      // Update UI with agent response
      setAgentData({
        actions: data.actions || [],
        analysis: data.analysis || '',
        draftResponse: data.draft_response || ''
      });
    } catch (error) {
      console.error('Agent processing failed:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <main className="flex-1">
        {/* Your main email interface */}
      </main>
      <AgentPanel 
        actions={agentData.actions}
        analysis={agentData.analysis}
        draftResponse={agentData.draftResponse}
      />
    </div>
  );
}
```

## Agent3 Architecture

The active agent system includes:

- **Email Processing**: Analyzes email threads and generates responses
- **Tool Integration**: Email search, tagging, and RAG search capabilities
- **Streaming Support**: Real-time processing with OpenAI Agents SDK
- **Database Integration**: Direct integration with PostgreSQL schema
- **Action Logging**: Comprehensive logging of all agent actions

## Environment Setup

### Required Environment Variables

Create `.env` files in the appropriate directories:

**Backend (.env)**
```bash
# OpenAI API Key for agent3/
OPENAI_API_KEY=your-openai-api-key-here
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
VECTOR_STORE_ID=your-vector-store-id
```

**Agent3 (.env)**
```bash
# OpenAI configuration
OPENAI_API_KEY=your-openai-api-key-here
OPENAI_MODEL=gpt-4o
```

## Available Make Commands

```bash
# Install all dependencies (including agent3/)
make install

# Install individual projects
make install-fe
make install-be
make install-agent  # Installs agent3/

# Development
make f                # Start frontend dev server
make b                # Start backend dev server (integrates with agent3/)
make sb               # Start Storybook
make build-agent      # Build agent3/ TypeScript

# Testing
make test-api         # Test API endpoints (including agent3/ integration)

# Cleanup
make clean           # Remove build artifacts
```

## Production Considerations

### 1. Security
- **Never expose OpenAI API keys in frontend**
- Backend API handles all agent3/ communication
- Use environment variables properly

### 2. Performance
- Agent3/ processes emails asynchronously
- Streaming responses for real-time feedback
- Database connection pooling for high throughput

### 3. Monitoring
- Agent3/ includes comprehensive logging
- All agent actions are stored in the database
- Monitor OpenAI API usage and costs

## Database Schema

Agent3/ works directly with the PostgreSQL schema:

```sql
-- Key tables used by agent3/
CREATE TABLE threads (
  id SERIAL PRIMARY KEY,
  subject VARCHAR(500),
  participant_emails JSONB,
  status VARCHAR(50),
  last_activity_at TIMESTAMP
);

CREATE TABLE emails (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id),
  from_email VARCHAR(255),
  body_text TEXT,
  direction VARCHAR(20)
);

CREATE TABLE draft_responses (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id),
  email_id INTEGER REFERENCES emails(id),
  generated_content TEXT,
  confidence_score DECIMAL(4,3),
  citations JSONB
);

CREATE TABLE agent_actions (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id),
  action VARCHAR(100),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Troubleshooting

### Common Issues

1. **Agent3/ not processing emails**: Check OpenAI API key and model configuration
2. **Database connection errors**: Verify DATABASE_URL in backend/.env
3. **Missing vector store**: Ensure VECTOR_STORE_ID is set for RAG functionality

### Debugging

```bash
# Check agent3/ logs
make b  # Backend logs show agent3/ processing

# Test database connection
make db-test

# Verify API integration
curl -X POST http://localhost:3000/api/threads/1/regenerate
```

## Migration from Legacy Agents

If you're migrating from the legacy `agent/` or `agent2/` implementations:

1. **Update imports**: Change from `proresponse-agent` to `agent3`
2. **Update function calls**: Use `processEmail(threadId, logger)` instead of older patterns
3. **Update database schema**: Ensure compatibility with agent3/ expectations
4. **Update environment variables**: Follow the new .env structure

## Next Steps

1. Set up your OpenAI API key in backend/.env
2. Run `make install` to install all dependencies
3. Start development with `make f` (frontend) and `make b` (backend)
4. Test agent integration with real email threads
5. Monitor agent actions in the database

The agent3/ system is ready for production use with the existing frontend components! 