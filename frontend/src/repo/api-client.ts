import type { Thread, ThreadDetail, Draft, AgentActivityDetail, ThreadCounts, ThreadFilter } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class APIError extends Error {
  status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'APIError';
  }
}

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      credentials: 'include', // For CORS with cookies
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
      throw new APIError(response.status, error.error?.message || 'Request failed');
    }
    
    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new Error(`Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Thread endpoints
export async function getThreads(filter?: ThreadFilter, search?: string): Promise<{ threads: Thread[] }> {
  const params = new URLSearchParams();
  if (filter) params.append('filter', filter);
  if (search) params.append('search', search);
  
  const query = params.toString() ? `?${params.toString()}` : '';
  return fetchAPI<{ threads: Thread[] }>(`/api/threads${query}`);
}

export async function getThread(id: string): Promise<ThreadDetail> {
  return fetchAPI<ThreadDetail>(`/api/threads/${id}`);
}

export async function updateThread(id: string, updates: { status?: string; tags?: string[] }): Promise<{ id: string; status: string; tags: string[] }> {
  return fetchAPI<{ id: string; status: string; tags: string[] }>(`/api/threads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(updates),
  });
}

// Message endpoints
export async function sendMessage(threadId: string, content: string) {
  return fetchAPI(`/api/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getDraft(threadId: string): Promise<Draft> {
  return fetchAPI<Draft>(`/api/threads/${threadId}/draft`);
}

export async function updateDraft(threadId: string, content: string): Promise<Draft> {
  return fetchAPI<Draft>(`/api/threads/${threadId}/draft`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });
}

// Agent endpoints
export async function getAgentActivity(threadId: string): Promise<AgentActivityDetail> {
  return fetchAPI<AgentActivityDetail>(`/api/threads/${threadId}/agent-activity`);
}

export async function regenerateDraft(threadId: string, instructions?: string): Promise<{ status: string; message: string }> {
  return fetchAPI<{ status: string; message: string }>(`/api/threads/${threadId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify({ instructions }),
  });
}

// Filter counts
export async function getThreadCounts(): Promise<ThreadCounts> {
  return fetchAPI<ThreadCounts>('/api/threads/counts');
}

export const APIClient = {
  getThreads,
  getThread,
  updateThread,
  sendMessage,
  getDraft,
  updateDraft,
  getAgentActivity,
  regenerateDraft,
  getThreadCounts,
};