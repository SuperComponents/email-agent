# OpenSupport REST API Specification

## Overview

Simple REST API for OpenSupport MVP. All endpoints return JSON. No authentication required for MVP.

## Thread Endpoints

### GET /api/threads
Lists all email threads with filtering support.
- Query params: filter (optional, values: all, unread, flagged, urgent, awaiting_customer, closed), search (optional, search in subject/content)
- Response: { threads: [{ id: string, subject: string, snippet: string, customer_name: string, customer_email: string, timestamp: string, is_unread: boolean, status: string, tags: [string] }] }
- Errors: 400 (invalid filter value)

### GET /api/threads/:id
Gets a single thread with all emails and agent activity.
- Path params: id (thread identifier)
- Response: { id: string, subject: string, status: string, tags: [string], customer: { name: string, email: string }, emails: [{ id: string, from_name: string, from_email: string, content: string, timestamp: string, is_support_reply: boolean }], agent_activity: { analysis: string, draft_response: string, actions: [{ id: string, type: string, title: string, description: string, timestamp: string, status: string }] } }
- Errors: 404 (thread not found)

### PATCH /api/threads/:id
Updates thread metadata (status, tags).
- Path params: id (thread identifier)
- Request body: { status?: string (open, closed, pending), tags?: [string] }
- Response: { id: string, status: string, tags: [string] }
- Errors: 404 (thread not found), 400 (invalid status)

## Message Endpoints

### POST /api/threads/:id/messages
Sends a reply message in a thread.
- Path params: id (thread identifier)
- Request body: { content: string }
- Response: { id: string, thread_id: string, from_name: string, from_email: string, content: string, timestamp: string, is_support_reply: true }
- Errors: 404 (thread not found), 400 (empty content)

### GET /api/threads/:id/draft
Gets the current draft reply for a thread.
- Path params: id (thread identifier)
- Response: { content: string, last_updated: string, is_agent_generated: boolean }
- Errors: 404 (thread or draft not found)

### PUT /api/threads/:id/draft
Updates the draft reply for a thread.
- Path params: id (thread identifier)
- Request body: { content: string }
- Response: { content: string, last_updated: string }
- Errors: 404 (thread not found), 400 (empty content)

## Agent Endpoints

### GET /api/threads/:id/agent-activity
Gets detailed agent activity and analysis for a thread.
- Path params: id (thread identifier)
- Response: { analysis: string, suggested_response: string, confidence_score: number, actions: [{ id: string, type: string, title: string, description: string, status: string, timestamp: string, result: any }], knowledge_used: [{ source: string, relevance: number }] }
- Errors: 404 (thread not found)

### POST /api/threads/:id/regenerate
Triggers agent to re-analyze thread and generate new draft.
- Path params: id (thread identifier)
- Request body: { instructions?: string (optional guidance for agent) }
- Response: { status: string, message: string }
- Errors: 404 (thread not found), 429 (rate limited)

## Filter Counts Endpoint

### GET /api/threads/counts
Gets count of threads for each filter type.
- Response: { all: number, unread: number, flagged: number, urgent: number, awaiting_customer: number, closed: number }
- Errors: None

## Error Response Format

All errors return:
```json
{
  "error": {
    "message": "Human readable error message"
  }
}
``` 