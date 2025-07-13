// Database table type definitions based on newschema.ts

import type { KnowledgeBaseResult } from '../agents/guards.js';

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'agent' | 'manager' | 'admin';
  stack_auth_id: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface Thread {
  id: number;
  subject: string;
  participant_emails: string[];
  status: 'active' | 'closed' | 'needs_attention';
  last_activity_at: Date;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface Email {
  id: number;
  thread_id: number;
  from_email: string;
  to_emails: string[];
  cc_emails: string[] | null;
  bcc_emails: string[] | null;
  subject: string;
  body_text: string | null;
  body_html: string | null;
  direction: 'inbound' | 'outbound';
  is_draft: boolean;
  sent_at: Date | null;
  created_at: Date | null;
  updated_at: Date | null;
}

export interface EmailTag {
  id: number;
  email_id: number;
  tag: string;
  confidence: string | null; // decimal stored as string
  created_by_user_id: number | null;
  created_at: Date;
}

export interface DraftResponse {
  id: number;
  email_id: number;
  thread_id: number;
  generated_content: string;
  status: 'pending' | 'approved' | 'rejected' | 'sent';
  created_by_user_id: number | null;
  version: number;
  parent_draft_id: number | null;
  confidence_score: string | null; // decimal stored as string
  citations: KnowledgeBaseResult | null; // jsonb field for knowledge base citations
  created_at: Date | null;
  updated_at: Date | null;
}

export interface AgentAction {
  id: number;
  thread_id: number;
  email_id: number | null;
  draft_response_id: number | null;
  actor_user_id: number | null;
  action: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  ip_address: string | null;
  created_at: Date;
}

// Type aliases for clarity
export type UserRole = User['role'];
export type ThreadStatus = Thread['status'];
export type EmailDirection = Email['direction'];
export type DraftStatus = DraftResponse['status'];

// Metadata types for specific actions
export interface ToolCallMetadata {
  callId: string;
  parameters: Record<string, unknown>;
  result?: unknown;
  error?: string;
  status: 'success' | 'error';
  timestamp: number;
}

// Helper type for email messages used in email-agent
export interface EmailMessage {
  id: number;
  from_email: string;
  to_emails: string[];
  subject: string;
  body_text: string | null;
  created_at: Date | null;
  tags?: EmailTag[];
}
