# API Integration Gaps and Misalignments

This document outlines the gaps between the frontend expectations (based on MockAPI) and what the current database schema can provide.

**Note**: This analysis is based on the active `agent3/` implementation, which is integrated with the backend. The legacy `agent/` and `agent2/` directories are not part of the current system.

## Current Architecture

- **Active Agent**: `agent3/` - Integrated with backend API
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Backend serves data from real database
- **Frontend**: React app consuming backend API

## Database Schema Gaps

### 1. Missing Fields/Features

#### Thread Level
- **is_unread**: Frontend expects an `is_unread` boolean field on threads, but the database doesn't track read/unread status
- **tags**: Frontend expects a `tags` array (e.g., "flagged", "urgent"), but the database has no tags table or field  
- **customer_name**: Frontend expects a customer name, but database only stores email addresses in `participant_emails`
- **snippet**: Frontend expects a text snippet of the latest message, requires joining with emails table

#### Email Level
- **from_name**: Frontend expects sender's name, but database only stores `from_email`
- **thread_id** in response: Frontend expects this field in email responses

#### Draft Level
- The database tracks drafts comprehensively via `draft_responses` table with versioning
- Frontend expects a simpler draft-per-thread model
- **Good alignment**: The `agent3/` system properly creates and manages drafts

### 2. Filter Misalignments

The frontend filters don't map directly to database fields:
- **unread**: No read/unread tracking in database
- **flagged**: No flag/tag system in database
- **urgent**: No urgency/priority field in database
- **awaiting_customer**: Using `status = 'active'` as a proxy, but not exact
- **assigned_to_me**: No assignment tracking in database

### 3. Agent Integration Status

#### ✅ Working (agent3/ integration)
- **Draft generation**: `agent3/` creates drafts in `draft_responses` table
- **Action logging**: All agent actions logged to `agent_actions` table
- **Email processing**: Real email thread processing with database integration
- **Tool integration**: Email search, tagging, RAG search working
- **Streaming responses**: Real-time agent processing feedback
- **Knowledge base integration**: Complete RAG system with full UI management

#### ✅ RAG System Status: FULLY IMPLEMENTED
The RAG (Retrieval-Augmented Generation) system is comprehensively implemented:

**Knowledge Base Management UI** (`frontend/src/pages/KnowledgeBasePage.tsx`):
- ✅ **Full CRUD operations** - Create, read, update, delete documents
- ✅ **GitHub integration** - Direct editing of `rag/knowledge_base/` files
- ✅ **Live document editing** with markdown support
- ✅ **Version control** - All changes committed to GitHub automatically
- ✅ **Automatic sync** - GitHub workflow updates OpenAI vector store on changes
- ✅ **Document management** - File browser, search, and organization
- ✅ **Real-time collaboration** - Multiple users can manage knowledge base

**RAG Integration** (`agent3/src/agents/tools/rag-search.ts`):
- ✅ **OpenAI Vector Store** integration with automatic discovery
- ✅ **Citation support** with confidence scoring and metadata
- ✅ **Knowledge base search** during email processing
- ✅ **Semantic search** with file search tool integration
- ✅ **Production knowledge base** with real content (CyberKnight Collection, DragonScale Gauntlets, etc.)

**GitHub Workflow Automation**:
- ✅ **Automatic vector store sync** when knowledge base files change
- ✅ **Branch-based deployment** (master/rag branches)
- ✅ **Metadata tracking** with vector store keys

### 4. Authentication Status

#### ✅ StackAuth Integration - Infrastructure Complete (Disabled for Testing)
- **JWT validation**: Complete middleware with `jose` library
- **Database integration**: `stack_auth_id` field in users table
- **Frontend components**: StackProvider, StackHandler, UserButton ready
- **Environment setup**: Variables configured for StackAuth
- **Current status**: Temporarily disabled with mock authentication for testing

#### ❌ Email Provider OAuth - Not Implemented
- **Gmail OAuth**: Not implemented (was marked out of scope in original spec)
- **Microsoft OAuth**: Not implemented
- **Email client integration**: Not implemented (future feature for email provider sync)

## Implementation Workarounds

### 1. Computed Fields
- **customer_name**: Extracted from email address (before @ symbol)
- **snippet**: Fetched via SQL subquery from latest email
- **is_unread**: Always returns `false` for now
- **tags**: Always returns empty array `[]`

### 2. Status Mapping
- Frontend "pending" status → Database "active" status
- Frontend "awaiting_customer" filter → Database "active" status

### 3. Agent Integration ✅
- **Draft generation**: Real drafts created by `agent3/`
- **Action logging**: Real agent actions with metadata
- **Confidence scores**: Actual confidence values from agent processing
- **Citations**: Real knowledge base references with high-quality scoring
- **Knowledge base**: Fully functional with comprehensive management UI

## Recommendations for Full Feature Parity

To achieve full feature parity with the frontend, consider adding:

### 1. New Tables
```sql
-- Tags table
CREATE TABLE thread_tags (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id),
  tag VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Read status tracking
CREATE TABLE thread_read_status (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id),
  user_id INTEGER REFERENCES users(id),
  read_at TIMESTAMP,
  UNIQUE(thread_id, user_id)
);

-- Thread assignments
CREATE TABLE thread_assignments (
  id SERIAL PRIMARY KEY,
  thread_id INTEGER REFERENCES threads(id),
  assigned_to_user_id INTEGER REFERENCES users(id),
  assigned_at TIMESTAMP DEFAULT NOW()
);
```

### 2. Schema Updates
- Add `priority` enum field to threads table
- Add `avatar_url` to users table
- Add `name` field to store customer names separately from emails

### 3. Feature Additions
- Implement real-time read/unread tracking
- Add tag management endpoints
- Implement thread assignment system
- Enhance customer profile management
- Re-enable StackAuth authentication

## Current Limitations

1. **Authentication**: StackAuth infrastructure ready but disabled for testing
2. **Real-time Updates**: No WebSocket support for live updates
3. **Search**: Limited search capability - only searches thread subjects
4. **Customer Profiles**: Limited customer information beyond email addresses
5. **Email Provider Integration**: No Gmail/Outlook OAuth or sync (future feature)

## Agent3 Integration Status: ✅ WORKING

The `agent3/` system is fully integrated and working:
- ✅ **Email processing**: Real thread analysis
- ✅ **Draft generation**: Creates actual drafts with citations
- ✅ **Action logging**: Comprehensive agent activity tracking
- ✅ **Tool integration**: Email search, tagging, RAG search
- ✅ **Database integration**: Direct PostgreSQL integration
- ✅ **Streaming responses**: Real-time processing feedback
- ✅ **Knowledge base integration**: Complete RAG system with full management UI

**Note**: The legacy `agent/` and `agent2/` directories are not integrated and should not be used for gap analysis.

These gaps don't prevent the core functionality from working, but they limit the frontend's rich UI features compared to the original mock implementation. The agent integration and knowledge base systems are solid and production-ready.