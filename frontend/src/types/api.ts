export interface Thread {
  id: string;
  subject: string;
  snippet: string;
  customer_name: string;
  customer_email: string;
  timestamp: string;
  is_unread: boolean;
  status: string;
  tags: string[];
}

export interface Customer {
  name: string;
  email: string;
}

export interface Email {
  id: string;
  from_name: string;
  from_email: string;
  content: string;
  timestamp: string;
  is_support_reply: boolean;
}

export interface AgentAction {
  id: string;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  status: string;
  result?: {
    type?: string;
    role?: string;
    name?: string;
    arguments?: string;
    callId?: string;
    content?: Array<{
      text: string;
      [key: string]: unknown;
    }>;
    output?: {
      text?: string;
      type?: string;
      [key: string]: unknown;
    };
    confidence?: number | null;
    escalation_recommended?: boolean;
    sentiment?: string | null;
    suggested_priority?: string | null;
    rag_sources_used?: number;
    [key: string]: unknown;
  };
}

export interface InternalNote {
  id: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  can_edit: boolean;
}

export interface AgentActivity {
  analysis: string;
  draft_response: string;
  actions: AgentAction[];
}

export interface ThreadDetail {
  id: string;
  subject: string;
  status: string;
  tags: string[];
  customer: Customer;
  emails: Email[];
  internal_notes: InternalNote[];
  agent_activity: AgentActivity;
}

export interface Draft {
  content: string;
  citations: Array<{
    source: string;
    text: string;
    relevance: number;
  }> | null;
  last_updated: string;
  is_agent_generated: boolean;
}

export interface AgentActivityDetail {
  analysis: string;
  suggested_response: string;
  confidence_score: number;
  actions: AgentAction[];
  knowledge_used: Array<{
    source: string;
    relevance: number;
  }>;
}

export interface ThreadCounts {
  all: number;
  unread: number;
  flagged: number;
  urgent: number;
  awaiting_customer: number;
  closed: number;
}

export type ThreadFilter = 'all' | 'unread' | 'flagged' | 'urgent' | 'awaiting_customer' | 'closed';