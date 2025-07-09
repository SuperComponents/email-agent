# REST API Implementation Plan

Based on my analysis of the codebase, here's a comprehensive plan for implementing the REST API endpoints:

## 1. Project Structure

Create the following directory structure in `/backend/src/`:

```
routes/
├── threads.ts
├── messages.ts
├── drafts.ts
├── agent.ts
└── counts.ts

middleware/
├── cors.ts
└── error-handler.ts

utils/
├── response.ts
└── validation.ts
```

## 2. Core Implementation Steps

### Step 1: Setup Middleware
- **CORS middleware** to allow frontend communication
- **Error handling middleware** for consistent error responses
- **Request validation** utilities

### Step 2: Thread Endpoints (`/api/threads`)
- `GET /api/threads` - List threads with filtering (unread, flagged, urgent, etc.)
- `GET /api/threads/:id` - Get thread detail with emails and agent activity
- `PATCH /api/threads/:id` - Update thread status and tags

### Step 3: Message Endpoints
- `POST /api/threads/:id/messages` - Send reply in thread
- `GET /api/threads/:id/draft` - Get current draft
- `PUT /api/threads/:id/draft` - Update draft

### Step 4: Agent Endpoints
- `GET /api/threads/:id/agent-activity` - Get agent analysis and actions
- `POST /api/threads/:id/regenerate` - Regenerate draft with optional instructions

### Step 5: Utility Endpoints
- `GET /api/threads/counts` - Get filter counts

## 3. Key Implementation Details

### Database Queries
- Use Drizzle ORM with proper joins for related data
- Implement efficient filtering using SQL where clauses
- Add indexes for common query patterns

### Response Format
- Follow the API spec format exactly
- Include proper error handling with standardized error responses
- Ensure all timestamps are ISO 8601 format

### Data Mapping
- Map database schema to API response format
- Handle JSON fields (participant_emails, to_emails, etc.)
- Convert enums to string values

## 4. Specific Considerations

### Thread Listing
- Implement search functionality across subject/content
- Support multiple filter types
- Sort by last_activity_at descending

### Agent Activity
- Store agent actions in agent_actions table
- Track draft generation history
- Include confidence scores

### Draft Management
- Support version tracking with parent_draft_id
- Handle draft status transitions
- Track who created/modified drafts

## 5. Implementation Order

1. Setup middleware and utilities
2. Implement thread listing and detail endpoints
3. Add message/draft endpoints
4. Implement agent activity endpoints
5. Add filter counts endpoint
6. Test all endpoints thoroughly

## 6. Makefile Updates

Add backend-specific commands:
- `make b` - Start backend dev server
- `make db-seed` - Seed database with test data
- `make test-api` - Run API tests

## 7. Technical Notes

### Database Schema Mapping
- `threads` table maps to Thread API responses
- `emails` table provides message data
- `draft_responses` table stores drafts with versioning
- `agent_actions` table tracks all agent activities
- `users` table manages support team members

### Key Differences from Mock API
- Real database persistence vs in-memory storage
- Proper relational data with foreign keys
- Transaction support for data consistency
- Agent action logging for audit trail
- Draft versioning with parent_draft_id

This plan aligns with your existing mock API structure while leveraging the PostgreSQL/Drizzle backend infrastructure already in place.