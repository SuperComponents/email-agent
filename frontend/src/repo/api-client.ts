import type { Thread, ThreadDetail, Draft, AgentActivityDetail, ThreadCounts, ThreadFilter } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIClient {
  private async request<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getThreads(filter?: ThreadFilter, search?: string): Promise<Thread[]> {
    const params = new URLSearchParams();
    if (filter) params.append('filter', filter);
    if (search) params.append('search', search);
    
    const queryString = params.toString();
    const path = `/threads${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<{ threads: Thread[] }>(path);
    return response.threads;
  }

  async getThread(id: string): Promise<ThreadDetail> {
    return this.request<ThreadDetail>(`/threads/${id}`);
  }

  async getThreadCounts(): Promise<ThreadCounts> {
    return this.request<ThreadCounts>('/thread-counts');
  }

  async updateThread(id: string, updates: { status?: string; tags?: string[] }): Promise<{ id: string; status: string; tags: string[] }> {
    return this.request(`/threads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async sendMessage(threadId: string, content: string): Promise<{ id: string; thread_id: string; from_name: string; from_email: string; content: string; timestamp: string; is_support_reply: boolean }> {
    return this.request(`/threads/${threadId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  // Draft operations - these need backend implementation
  async getDraft(threadId: string): Promise<Draft> {
    // TODO: Implement draft endpoint in backend
    // For now, return a placeholder
    return {
      content: '',
      last_updated: new Date().toISOString(),
      is_agent_generated: true,
    };
  }

  async updateDraft(threadId: string, content: string): Promise<Draft> {
    // TODO: Implement draft endpoint in backend
    return {
      content,
      last_updated: new Date().toISOString(),
      is_agent_generated: false,
    };
  }

  async regenerateDraft(threadId: string, instructions?: string): Promise<Draft> {
    // TODO: Implement draft regeneration endpoint in backend
    return {
      content: 'Regenerated draft response...',
      last_updated: new Date().toISOString(),
      is_agent_generated: true,
    };
  }

  // Agent activity - needs backend implementation
  async getAgentActivity(threadId: string): Promise<AgentActivityDetail> {
    // TODO: Implement agent activity endpoint in backend
    // For now, return data from thread endpoint's agent_activity
    const thread = await this.getThread(threadId);
    
    return {
      analysis: thread.agent_activity.analysis,
      suggested_response: thread.agent_activity.draft_response || '',
      confidence_score: 0.85,
      actions: thread.agent_activity.actions,
      knowledge_used: [],
    };
  }
}

export const API = new APIClient();