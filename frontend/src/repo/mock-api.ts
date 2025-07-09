import type { Thread, ThreadDetail, Draft, AgentActivityDetail, ThreadCounts, ThreadFilter } from '../types/api';
import { 
  mockThreads, 
  generateMockThreadDetail, 
  generateMockDraft, 
  generateMockAgentActivity,
  generateMockThreadCounts 
} from './mock-data';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for thread state
const threadStore = new Map<string, ThreadDetail>();
const draftStore = new Map<string, Draft>();

// Initialize with mock data
mockThreads.forEach(thread => {
  const detail = generateMockThreadDetail(thread);
  threadStore.set(thread.id, detail);
  draftStore.set(thread.id, generateMockDraft());
});

export class MockAPI {
  // Thread endpoints
  static async getThreads(filter?: ThreadFilter, search?: string): Promise<{ threads: Thread[] }> {
    await delay(100);
    
    let threads = [...mockThreads];
    
    // Apply filter
    if (filter && filter !== 'all') {
      threads = threads.filter(thread => {
        switch (filter) {
          case 'unread':
            return thread.is_unread;
          case 'flagged':
            return thread.tags.includes('flagged');
          case 'urgent':
            return thread.tags.includes('urgent');
          case 'awaiting_customer':
            return thread.status === 'pending';
          case 'closed':
            return thread.status === 'closed';
          default:
            return true;
        }
      });
    }
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      threads = threads.filter(thread => 
        thread.subject.toLowerCase().includes(searchLower) ||
        thread.snippet.toLowerCase().includes(searchLower) ||
        thread.customer_name.toLowerCase().includes(searchLower)
      );
    }
    
    return { threads };
  }

  static async getThread(id: string): Promise<ThreadDetail> {
    await delay(200);
    
    const thread = threadStore.get(id);
    if (!thread) {
      throw new Error('Thread not found');
    }
    
    return thread;
  }

  static async updateThread(id: string, updates: { status?: string; tags?: string[] }): Promise<{ id: string; status: string; tags: string[] }> {
    await delay(200);
    
    const thread = threadStore.get(id);
    if (!thread) {
      throw new Error('Thread not found');
    }
    
    if (updates.status) {
      thread.status = updates.status;
    }
    if (updates.tags) {
      thread.tags = updates.tags;
    }
    
    // Update the mock thread as well
    const mockThread = mockThreads.find(t => t.id === id);
    if (mockThread) {
      if (updates.status) mockThread.status = updates.status;
      if (updates.tags) mockThread.tags = updates.tags;
    }
    
    return {
      id: thread.id,
      status: thread.status,
      tags: thread.tags
    };
  }

  // Message endpoints
  static async sendMessage(threadId: string, content: string) {
    await delay(500);
    
    const thread = threadStore.get(threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }
    
    const newMessage = {
      id: Math.random().toString(36).substring(2, 11),
      thread_id: threadId,
      from_name: 'Support Team',
      from_email: 'support@proresponse.ai',
      content,
      timestamp: new Date().toISOString(),
      is_support_reply: true
    };
    
    thread.emails.push(newMessage);
    
    // Update thread status to open if it was closed
    if (thread.status === 'closed') {
      thread.status = 'open';
    }
    
    return newMessage;
  }

  static async getDraft(threadId: string): Promise<Draft> {
    await delay(200);
    
    const draft = draftStore.get(threadId);
    if (!draft) {
      throw new Error('Draft not found');
    }
    
    return draft;
  }

  static async updateDraft(threadId: string, content: string): Promise<Draft> {
    await delay(200);
    
    if (!threadStore.has(threadId)) {
      throw new Error('Thread not found');
    }
    
    const draft: Draft = {
      content,
      last_updated: new Date().toISOString(),
      is_agent_generated: false
    };
    
    draftStore.set(threadId, draft);
    
    return draft;
  }

  // Agent endpoints
  static async getAgentActivity(threadId: string): Promise<AgentActivityDetail> {
    await delay(300);
    
    if (!threadStore.has(threadId)) {
      throw new Error('Thread not found');
    }
    
    return generateMockAgentActivity();
  }

  static async regenerateDraft(threadId: string, instructions?: string): Promise<{ status: string; message: string }> {
    await delay(1500); // Simulate longer processing time
    
    if (!threadStore.has(threadId)) {
      throw new Error('Thread not found');
    }
    
    // Generate new draft
    const newDraft = generateMockDraft();
    if (instructions) {
      newDraft.content = `Based on your instructions: "${instructions}"\n\n${newDraft.content}`;
    }
    draftStore.set(threadId, newDraft);
    
    // Update agent activity
    const thread = threadStore.get(threadId)!;
    thread.agent_activity.draft_response = newDraft.content;
    thread.agent_activity.actions.push({
      id: Math.random().toString(36).substring(2, 11),
      type: 'regenerate',
      title: 'Regenerated draft response',
      description: instructions ? `With custom instructions: ${instructions}` : 'Using default parameters',
      timestamp: new Date().toISOString(),
      status: 'completed'
    });
    
    return {
      status: 'success',
      message: 'Draft regenerated successfully'
    };
  }

  // Filter counts
  static async getThreadCounts(): Promise<ThreadCounts> {
    await delay(100);
    return generateMockThreadCounts(mockThreads);
  }
}