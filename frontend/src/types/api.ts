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
  result?: unknown;
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