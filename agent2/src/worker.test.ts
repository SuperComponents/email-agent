import { test, expect, vi, beforeEach, afterEach, describe } from 'vitest';
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

describe('AgentController', () => {
  let controller: AgentController;
  let eventStore: MockEventStore;
  let callbacks: WorkerCallbacks;

  beforeEach(() => {
    eventStore = new MockEventStore();
    callbacks = {
      getEventState: async () => await eventStore.getEvents(),
      updateEventState: async (event: Event) => await eventStore.addEvent(event),
    };

    controller = new AgentController({
      callbacks,
      openaiApiKey: 'test-key',
      restartOnError: false, // Disable restart for testing
    });
  });

  afterEach(async () => {
    if (controller.status !== 'stopped') {
      await controller.forceStop();
    }
    eventStore.clear();
  });

  test('should initialize with stopped status', () => {
    expect(controller.status).toBe('stopped');
  });

  test('should emit started event when starting', async () => {
    const startedPromise = new Promise<void>((resolve) => {
      controller.once('started', resolve);
    });

    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test', body: 'Test message' },
    };

    await controller.start([initialEvent]);
    await startedPromise;

    expect(controller.status).toBe('running');
  }, 10000);

  test('should prevent multiple starts', async () => {
    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test', body: 'Test message' },
    };

    await controller.start([initialEvent]);
    
    await expect(controller.start([initialEvent])).rejects.toThrow('Agent is already running');
  }, 10000);

  test('should handle worker status updates', async () => {
    const statusUpdates: string[] = [];
    
    controller.on('status', (status, message) => {
      statusUpdates.push(status);
    });

    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test', body: 'Test message' },
    };

    await controller.start([initialEvent]);

    // Wait a bit for status updates
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(statusUpdates).toContain(WorkerStatusEnum.STARTING);
  }, 10000);

  test('should handle stop command', async () => {
    const stoppedPromise = new Promise<void>((resolve) => {
      controller.once('stopped', resolve);
    });

    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test', body: 'Test message' },
    };

    await controller.start([initialEvent]);
    await controller.stop('Test stop');
    await stoppedPromise;

    expect(controller.status).toBe('stopped');
  }, 15000);

  test('should handle force stop', async () => {
    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test', body: 'Test message' },
    };

    await controller.start([initialEvent]);
    await controller.forceStop();

    expect(controller.status).toBe('stopped');
  }, 10000);

  test('should call callbacks for event state management', async () => {
    const getEventStateSpy = vi.spyOn(callbacks, 'getEventState');
    const updateEventStateSpy = vi.spyOn(callbacks, 'updateEventState');

    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'test-1',
      data: { subject: 'Test', body: 'Test message' },
    };

    await eventStore.addEvent(initialEvent);
    await controller.start([initialEvent]);

    // Wait for some processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    expect(getEventStateSpy).toHaveBeenCalled();
    // updateEventState might be called if the agent produces tool calls
    
    await controller.forceStop();
  }, 15000);

  test('should handle worker errors', async () => {
    const errorPromise = new Promise<Error>((resolve) => {
      controller.once('error', resolve);
    });

    // This should trigger an error due to invalid worker path
    const badController = new AgentController({
      callbacks,
      workerPath: '/nonexistent/path',
      restartOnError: false,
    });

    try {
      await badController.start([]);
    } catch (error) {
      // Expected to fail
    }

    // Should emit error event
    const error = await errorPromise;
    expect(error).toBeInstanceOf(Error);
  }, 10000);

  test('should track restart attempts', () => {
    expect(controller.restartAttempts).toBe(0);
  });
});

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
});