export interface Event {
  id: string;
  timestamp: Date;
  type: string;
  actor: 'user' | 'system' | 'customer';
  data: any;
}

export interface UserAction extends Event {
  actor: 'user';
  type: 'thread_started' | 'reply_sent' | 'reply_received' | 'urgency_updated' | 'category_updated' | 'draft_edited';
}

export interface ToolCall extends Event {
  actor: 'system';
  type: 'tool_call';
  data: {
    tool: string;
    input: any;
    output: any;
  };
}

export interface AgentCallbacks {
  getEventState: () => Promise<Event[]>;
  updateEventState: (event: Event) => Promise<void>;
}

export interface AgentWorkerOptions {
  openaiApiKey: string;
  callbacks: AgentCallbacks;
}