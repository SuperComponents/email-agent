# Email Agent Tools Documentation

## Overview

This directory contains the tools that the email agent uses to process customer support emails. Each tool serves a specific purpose and has clear documentation about when and how to use it.

## Tools

### 1. `read-thread.ts` - Read Thread Context
**Purpose**: Reads the full email thread context from the agent's runtime context.
**When to use**: Always called first to establish the conversation context.
**Required**: Yes, always first

### 2. `explain-next-tool-call.ts` - Explain Next Action
**Purpose**: Explains what the agent plans to do next for transparency.
**When to use**: Before using any other tool (except read-thread).
**Required**: Yes, for transparency

### 3. `get-customer-history.ts` - Get Customer History
**Purpose**: Retrieves all email history for a specific customer to understand their complete interaction history.
**When to use**: After reading the thread, to understand broader customer context.
**Use cases**:
- Understanding customer's overall relationship with the company
- Identifying communication patterns and preferences
- Reviewing previous issues and resolutions
- Assessing customer satisfaction history

### 4. `search-customer-emails.ts` - Search Customer Emails
**Purpose**: Searches for specific content within a customer's email history.
**When to use**: When you need to find specific information rather than general context.
**Use cases**:
- Customer mentions a specific product → search for previous interactions with that product
- Customer reports an error → search for similar error messages in their history
- Customer asks about a refund → search for "refund" or "billing" in their emails
- Customer references a previous conversation → search for keywords from that context
- Customer mentions a specific feature → search for that feature name

### 5. `email-tagger.ts` - Tag Emails
**Purpose**: Categorizes emails with appropriate tags.
**When to use**: After understanding the email context, before knowledge base search.
**Tags**: spam, legal, sales, support, billing, technical, general

### 6. `rag-search.ts` - Knowledge Base Search
**Purpose**: Searches the company knowledge base for relevant information.
**When to use**: When the customer is asking questions that require company knowledge.

### 7. `write-draft.ts` - Write Draft Response
**Purpose**: Creates a draft email response.
**When to use**: Always last, after gathering all necessary context and information.
**Required**: Yes, always last

## Tool Workflow

```
1. read_thread (ALWAYS FIRST)
2. explain_next_tool_call (before each subsequent tool)
3. get_customer_history (for general context)
4. search_customer_emails (for specific content, if needed)
5. email_tagger (categorize the email)
6. rag_search (search knowledge base, if needed)
7. write_draft (ALWAYS LAST)
```

## Key Changes (v2.0)

### Previous Issue
The old `email-search.ts` tool was overloaded with two distinct responsibilities:
- Getting all customer emails (context gathering)
- Searching for specific content within emails

This caused confusion and the agent rarely used the search functionality.

### Solution
Split into two separate, well-documented tools:

1. **`get-customer-history.ts`** - Clearly for context gathering
2. **`search-customer-emails.ts`** - Clearly for content-specific searches

### Benefits
- **Clear purpose**: Each tool has a single, well-defined responsibility
- **Better documentation**: Extensive descriptions and examples for when to use each tool
- **Improved agent behavior**: The agent now understands when to search for specific content
- **Enhanced transparency**: Better logging and explanation of actions

## Adding New Tools

When adding new tools, follow these guidelines:

1. **Single responsibility**: Each tool should do one thing well
2. **Clear documentation**: Include detailed descriptions and examples
3. **Proper typing**: Use Zod schemas for parameter validation
4. **Error handling**: Return consistent success/error responses
5. **Logging**: Include appropriate logging for debugging
6. **Update imports**: Add to `email-agent.ts` imports and tools array
7. **Update system prompt**: Include guidance on when to use the new tool

## Testing

To test the tools:

1. Set up the test database with `TEST_DATABASE_URL`
2. Run `npm test` to execute integration tests
3. Check individual tool functionality with unit tests

## Best Practices

- Always use `explain_next_tool_call` before using other tools
- Use `get_customer_history` for general context
- Use `search_customer_emails` when you need specific information
- Tag emails before searching the knowledge base
- Always create a draft response with `write_draft`
- Include citations when using knowledge base results 