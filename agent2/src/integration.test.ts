import { test, expect } from 'vitest';
import { AgentController, WorkerCallbacks, Event } from './index';
import { WorkerStatusEnum, WorkerMessageSchema } from './worker-types';

// Mock event store for testing
class MockEventStore {
  private events: Event[] = [];

  async getEvents(): Promise<Event[]> {
    return [...this.events];
  }

  async addEvent(event: Event): Promise<void> {
    this.events.push(event);
  }

  clear(): void {
    this.events = [];
  }

  get eventCount(): number {
    return this.events.length;
  }
}

describe('Message Validation', () => {
  test('should validate worker messages', () => {
    const validMessage = {
      id: 'test-123',
      timestamp: new Date(),
      type: 'worker_status',
      data: {
        status: 'running',
        message: 'Agent is running',
      },
    };

    const result = WorkerMessageSchema.safeParse(validMessage);
    expect(result.success).toBe(true);
  });

  test('should reject invalid worker messages', () => {
    const invalidMessage = {
      id: 'test-123',
      // Missing timestamp
      type: 'invalid_type',
      data: {},
    };

    const result = WorkerMessageSchema.safeParse(invalidMessage);
    expect(result.success).toBe(false);
  });
});

describe('Event Store Integration', () => {
  test('should manage events correctly', async () => {
    const store = new MockEventStore();
    
    const event1: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test 1' },
    };

    const event2: Event = {
      timestamp: new Date(),
      type: 'tool_call',
      actor: 'system',
      id: 'test-2',
      data: { tool: 'summarize', result: 'summary' },
    };

    await store.addEvent(event1);
    await store.addEvent(event2);

    const events = await store.getEvents();
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe('test-1');
    expect(events[1].id).toBe('test-2');
  });

  test('should create callbacks correctly', async () => {
    const store = new MockEventStore();
    
    const callbacks: WorkerCallbacks = {
      getEventState: async () => await store.getEvents(),
      updateEventState: async (event: Event) => await store.addEvent(event),
    };

    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test' },
    };

    await callbacks.updateEventState(initialEvent);
    const events = await callbacks.getEventState();
    
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('test-1');
  });
});

describe('AgentController Basic', () => {
  test('should initialize with correct status', () => {
    const store = new MockEventStore();
    const callbacks: WorkerCallbacks = {
      getEventState: async () => await store.getEvents(),
      updateEventState: async (event: Event) => await store.addEvent(event),
    };

    const controller = new AgentController({
      callbacks,
      restartOnError: false,
    });

    expect(controller.status).toBe('stopped');
    expect(controller.restartAttempts).toBe(0);
  });
});