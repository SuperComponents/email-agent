# API Integration Gaps and Misalignments

This document outlines the gaps between the frontend expectations (based on MockAPI) and what the current database schema can provide.

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
- The database tracks drafts differently than the frontend expects:
  - Database has a full `draft_responses` table with versioning
  - Frontend expects a simple draft per thread

### 2. Filter Misalignments

The frontend filters don't map directly to database fields:
- **unread**: No read/unread tracking in database
- **flagged**: No flag/tag system in database
- **urgent**: No urgency/priority field in database
- **awaiting_customer**: Using `status = 'active'` as a proxy, but not exact
- **assigned_to_me**: No assignment tracking in database

### 3. Mock Data vs Real Data

The frontend was built with rich mock data that includes:
- Customer avatars
- Read/unread states
- Multiple tags per thread
- Detailed agent activity with tool calls
- Knowledge base references

The database currently lacks tables/fields for:
- User avatars
- Read status tracking
- Tags/labels
- Tool call tracking
- Knowledge base integration

## Implementation Workarounds

### 1. Computed Fields
- **customer_name**: Extracted from email address (before @ symbol)
- **snippet**: Fetched via SQL subquery from latest email
- **is_unread**: Always returns `false` for now
- **tags**: Always returns empty array `[]`

### 2. Status Mapping
- Frontend "pending" status → Database "active" status
- Frontend "awaiting_customer" filter → Database "active" status

### 3. Missing Features Set to Defaults
- All threads marked as "read"
- No tags on any threads
- Confidence scores hardcoded in regenerate endpoint
- Knowledge base references return empty array

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
- Add knowledge base integration

## Current Limitations

1. **Authentication**: No auth system implemented - using hardcoded user_id = 1
2. **Real-time Updates**: No WebSocket support for live updates
3. **Search**: Limited search capability - only searches thread subjects
4. **Agent Integration**: Mock agent responses instead of real AI integration
5. **Email Sending**: Emails are stored but not actually sent

These gaps don't prevent the frontend from working but limit functionality compared to the full mock implementation.