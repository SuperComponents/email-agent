# Email Agent

This agent processes customer support emails and generates draft responses using OpenAI's agent framework.

## Core Functionality

The agent:
1. Reads email threads from the database
2. Tags emails (spam, legal, sales, support, billing, technical, general)
3. Searches for relevant information in the knowledge base
4. Generates draft responses with citations when applicable
5. Logs all actions to the database for auditing

## Architecture

### Main Entry Point
- `src/agents/email-agent.ts` - `processEmail(threadId)` function

### Tools
The agent has access to these tools:
- `read_thread` - Reads the email thread context from the agent's context
- `explain_next_tool_call` - Explains what the agent plans to do next (for transparency)
- `get_customer_history` - Gets complete email history for a customer to understand their interaction context
- `search_customer_emails` - Searches for specific content within a customer's email history
- `tag_email` - Tags emails with appropriate categories
- `search_knowledge_base` - RAG search for relevant documentation
- `write_draft` - Creates a draft response with optional citations

### Key Features

1. **Context Management**: Email threads are passed via context, and previous agent actions are loaded as conversation history
2. **Streaming**: Processes responses in streaming mode for better performance
3. **Action Logging**: All agent actions are logged to the database with metadata
4. **Result Logging**: Full agent results and history are saved to JSON files in `logs/`

## Usage

```typescript
import { processEmail } from './src/agents/email-agent.js';

// Process an email thread
const result = await processEmail(threadId);

// Result contains:
// - draft: The generated draft response (if created)
// - actions: Array of logged agent actions
// - history: Full conversation history
// - error: Error message if something went wrong
```

## Configuration

Set these environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENAI_MODEL` - Model to use (default: gpt-4)
- `DATABASE_URL` - PostgreSQL connection string

## Database Requirements

The agent expects these tables:
- `threads` - Email threads
- `emails` - Individual emails
- `draft_responses` - Generated drafts
- `agent_actions` - Action audit log
- `email_tags` - Email categorization

## Development

```bash
# Install dependencies
npm install

# Run type checking and linting
npm run lint:all

# Run the agent (example)
npm run check:openai  # Test OpenAI models
```

## Notes

- The agent uses OpenAI's new agent framework with structured tool calling
- All agent runs are logged to `logs/agent-run-{timestamp}.json`
- Conversation history is preserved across multiple interactions with the same thread