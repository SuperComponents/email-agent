import type { Thread, ThreadDetail, Draft, AgentActivityDetail, ThreadCounts, ThreadFilter } from '../types/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) || 'http://localhost:3000';

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
      const error = await response.json().catch(() => ({ error: { message: 'Unknown error' } })) as { error?: { message?: string } };
      throw new APIError(response.status, error.error?.message || 'Request failed');
    }
    
    return await response.json() as T;
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
  const res = await fetchAPI<{ threads: Thread[] }>(`/api/threads${query}`);
  console.log('getThreads');
  console.log(res);
  return res;
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

export async function markThreadAsRead(id: string): Promise<{ id: string; is_unread: boolean }> {
  return fetchAPI<{ id: string; is_unread: boolean }>(`/api/threads/${id}/read`, {
    method: 'PATCH',
  });
}

export async function markThreadAsUnread(id: string): Promise<{ id: string; is_unread: boolean }> {
  return fetchAPI<{ id: string; is_unread: boolean }>(`/api/threads/${id}/unread`, {
    method: 'PATCH',
  });
}

// Message endpoints
export async function sendMessage(threadId: string, content: string): Promise<unknown> {
  return fetchAPI(`/api/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function getDraft(threadId: string): Promise<Draft> {
  const draft = await fetchAPI<Draft>(`/api/threads/${threadId}/draft`);
  console.log('API getDraft response:', draft);
  return draft;
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

export async function generateDemoCustomerResponse(threadId: string): Promise<{ status: string; message: string }> {
  return fetchAPI<{ status: string; message: string }>(`/api/demo/${threadId}/demo-customer-response`, {
    method: 'POST',
  });
}

export async function createInternalNote(threadId: string, content: string, isPinned: boolean = false): Promise<{ status: string; message: string }> {
  return fetchAPI<{ status: string; message: string }>(`/api/threads/${threadId}/internal-notes`, {
    method: 'POST',
    body: JSON.stringify({ content, is_pinned: isPinned }),
  });
}

// Filter counts
export async function getThreadCounts(): Promise<ThreadCounts> {
  return fetchAPI<ThreadCounts>('/api/threads/counts');
}

// Email simulation endpoints
export async function startEmailSimulation(intervalMs?: number): Promise<{ success: boolean; message: string; intervalMs?: number; scenariosCount?: number }> {
  return fetchAPI<{ success: boolean; message: string; intervalMs?: number; scenariosCount?: number }>('/api/demo/start-email-simulation', {
    method: 'POST',
    body: JSON.stringify({ intervalMs }),
  });
}

export async function stopEmailSimulation(): Promise<{ success: boolean; message: string; totalEmailsGenerated?: number }> {
  return fetchAPI<{ success: boolean; message: string; totalEmailsGenerated?: number }>('/api/demo/stop-email-simulation', {
    method: 'POST',
  });
}

export async function getSimulationStatus(): Promise<{ 
  success: boolean; 
  status: { 
    isRunning: boolean; 
    emailsGenerated: number; 
    startTime: string | null 
  } 
}> {
  return fetchAPI<{ 
    success: boolean; 
    status: { 
      isRunning: boolean; 
      emailsGenerated: number; 
      startTime: string | null 
    } 
  }>('/api/demo/simulation-status');
}

export async function generateSingleEmail(): Promise<{ 
  success: boolean; 
  message: string; 
  thread?: { id: string; subject: string }; 
  email?: { id: string; from_email: string; subject: string; body_text: string }; 
  scenario?: { id: string; title: string; category: string; severity: string } 
}> {
  return fetchAPI<{ 
    success: boolean; 
    message: string; 
    thread?: { id: string; subject: string }; 
    email?: { id: string; from_email: string; subject: string; body_text: string }; 
    scenario?: { id: string; title: string; category: string; severity: string } 
  }>('/api/demo/generate-scenario-email', {
    method: 'POST',
  });
}

export const APIClient = {
  getThreads,
  getThread,
  updateThread,
  markThreadAsRead,
  markThreadAsUnread,
  sendMessage,
  getDraft,
  updateDraft,
  getAgentActivity,
  regenerateDraft,
  generateDemoCustomerResponse,
  createInternalNote,
  getThreadCounts,
  startEmailSimulation,
  stopEmailSimulation,
  getSimulationStatus,
  generateSingleEmail,
};