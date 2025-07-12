# Agent3 - Active AI Agent Implementation

**This is the PRIMARY and ACTIVE AI agent implementation for the OpenSupport project.**


## Status: ✅ ACTIVE & INTEGRATED

1. Install Bun: https://bun.sh
2. Install dependencies: `npm install` or `bun install`
3. Create `.env` file with `DATABASE_URL`
4. Generate database: `npm run db:push`

## Test Setup

1. Create a separate test database in PostgreSQL
2. Add `TEST_DATABASE_URL` to your `.env` file pointing to the test database
3. Run tests: `npm test`

Tests automatically:

- Use `TEST_DATABASE_URL` when `NODE_ENV=test`
- Drop and recreate the database schema for each test run
- Start with a completely fresh database state

To manually reset the test database:

```bash
npm run test:db:setup

- **Integration Status**: Fully integrated with backend API
- **Development Status**: Actively maintained and developed
- **Usage**: Primary agent for all email processing

## What This Directory Contains

This directory contains the production AI agent system that powers the OpenSupport platform:

- **Email Processing**: Analyzes email threads and generates intelligent responses
- **Tool Integration**: Email search, tagging, and RAG search capabilities
- **Database Integration**: Direct PostgreSQL integration with real data
- **Streaming Support**: Real-time processing with OpenAI Agents SDK
- **Action Logging**: Comprehensive logging of all agent activities

## Key Features

### Core Capabilities
- ✅ **Email Thread Processing**: Analyzes complete email conversations
- ✅ **Draft Generation**: Creates intelligent response drafts
- ✅ **Tool Integration**: Search, tag, and RAG capabilities
- ✅ **Confidence Scoring**: Rates the quality of generated responses
- ✅ **Citation Support**: References knowledge base sources
- ✅ **Streaming Responses**: Real-time processing feedback

### Technical Architecture
- **OpenAI Agents SDK**: For advanced AI capabilities
- **PostgreSQL Integration**: Direct database operations
- **TypeScript**: Fully typed implementation
- **Bun Runtime**: Fast JavaScript runtime
- **Vitest Testing**: Comprehensive test suite

## Integration

This agent is automatically integrated with the backend API:

```typescript
// Backend integration (automatic)
import { processEmail } from 'agent3';

// Process an email thread
const result = await processEmail(threadId, logger);
// Returns: { draft: DraftResponse, actions: AgentAction[] }
```

## Development

### Setup
```bash
# Install dependencies
cd agent3/
npm install

# Set up environment
cp .env.example .env
# Add your OPENAI_API_KEY

# Run tests
npm test
```

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your-openai-api-key
OPENAI_MODEL=gpt-4o

# Database (inherited from backend)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
```

### Testing
```bash
# Run all tests
npm test

# Run specific test suites
npm run test:spam         # Spam detection tests
npm run test:actions      # Action logging tests
npm run test:rag          # RAG search tests
```

## Database Schema

This agent works with the following core tables:

- **`threads`** - Email conversation threads
- **`emails`** - Individual email messages
- **`draft_responses`** - Generated response drafts
- **`agent_actions`** - Comprehensive action logging
- **`email_tags`** - Email classification tags

## Tools Available

### Email Search Tool
- Searches through customer's email history
- Provides context for response generation
- Helps understand customer relationship history

### Email Tagger Tool
- Automatically categorizes emails
- Supports: spam, legal, sales, support, billing, technical, general
- Provides confidence scores for classifications

### RAG Search Tool
- Searches company knowledge base
- Provides relevant context for responses
- Includes citation tracking

## Monitoring & Logging

All agent activities are logged to the database:

```typescript
// Agent actions are automatically logged
interface AgentAction {
  id: number;
  thread_id: number;
  action: string;
  description: string;
  metadata: any;
  created_at: Date;
}
```

## Performance

- **Average Processing Time**: 2-5 seconds per email thread
- **Tool Call Latency**: 1-3 seconds per tool invocation
- **Database Queries**: Optimized with proper indexes
- **Memory Usage**: Efficient streaming processing

## Related Components

- **Backend API**: `/backend/src/routes/agent.ts` - API integration
- **Frontend**: `/frontend/src/components/organisms/AgentPanel.tsx` - UI display
- **Database**: `/backend/src/database/schema.ts` - Database schema
- **Legacy Agents**: `/agent/` and `/agent2/` - Not active (see LEGACY.md)

## Troubleshooting

### Common Issues

1. **OpenAI API Key**: Ensure `OPENAI_API_KEY` is set in environment
2. **Database Connection**: Verify database is running and accessible
3. **Model Access**: Confirm access to specified OpenAI model
4. **Tool Failures**: Check individual tool configurations

### Debug Logging

The agent includes comprehensive logging:

```typescript
// Enable debug logging
const logger = (message: any) => console.log(message);
const result = await processEmail(threadId, logger);
```

## Future Development

Upcoming features and improvements:

- Enhanced RAG integration with better citations
- Multi-language support
- Custom tool development framework
- Advanced prompt engineering
- Performance optimizations

---

- Runtime: Bun (with Node.js fallback)
- Web Framework: Hono
- Database: SQLite with Drizzle ORM
- Language: TypeScript

