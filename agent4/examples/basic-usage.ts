import 'dotenv/config';
import { AgentController, WorkerCallbacks, Event } from '../src';

// Mock event store - in real usage, this would be your database
class MockEventStore {
  private events: Event[] = [];

  async getEvents(): Promise<Event[]> {
    return [...this.events];
  }

  async addEvent(event: Event): Promise<void> {
    this.events.push(event);
    console.log(`📝 Event added: ${event.type} by ${event.actor}`);
  }
}

async function basicUsageExample() {
  console.log('🚀 Starting Agent Worker Example');

  // Create a mock event store
  const eventStore = new MockEventStore();

  // Define callbacks for event state management
  const callbacks: WorkerCallbacks = {
    getEventState: async () => {
      return await eventStore.getEvents();
    },
    updateEventState: async (event: Event) => {
      await eventStore.addEvent(event);
    },
  };

  // Create the agent controller
  const controller = new AgentController({
    callbacks,
    openaiApiKey: process.env.OPENAI_API_KEY,
    restartOnError: true,
    maxRestarts: 3,
    workerPath: require.resolve('../dist/worker.js'),
  });

  // Set up event listeners
  controller.on('started', () => {
    console.log('✅ Agent started successfully');
  });

  controller.on('running', () => {
    console.log('🏃 Agent is running');
  });

  controller.on('stopped', () => {
    console.log('⏹️  Agent stopped');
  });

  controller.on('error', (error) => {
    console.error('❌ Agent error:', error.message);
  });

  controller.on('status', (status, message) => {
    console.log(`📊 Status: ${status} - ${message || 'No message'}`);
  });

  controller.on('restarting', (attempt) => {
    console.log(`🔄 Restarting agent (attempt ${attempt})`);
  });

  controller.on('failed', (error) => {
    console.error('💥 Agent failed permanently:', error.message);
  });

  try {
    // Create an initial event (customer email)
    const initialEvent: Event = {
      timestamp: new Date(),
      type: 'email_received',
      actor: 'customer',
      id: 'customer_email_1',
      data: {
        subject: 'I need help with my account',
        body: 'Hi, I am having trouble logging into my account. Can you help me reset my password?',
        from: 'customer@example.com',
        to: 'support@company.com',
      },
    };

    // Add initial event to store
    await eventStore.addEvent(initialEvent);

    // Get initial events
    const initialEvents = await eventStore.getEvents();

    // Start the agent
    console.log('🎯 Starting agent with initial events...');
    await controller.start(initialEvents);

    // Wait for the agent to complete (or timeout after 2 minutes)
    await new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Agent did not complete within 2 minutes'));
      }, 120000);

      controller.once('stopped', () => {
        clearTimeout(timeout);
        resolve();
      });

      controller.once('failed', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    // Print final event log
    const finalEvents = await eventStore.getEvents();
    console.log('\n📋 Final Event Log:');
    finalEvents.forEach((event, index) => {
      console.log(`${index + 1}. [${event.timestamp.toISOString()}] ${event.type} by ${event.actor}`);
      if (event.data) {
        console.log(`   Data: ${JSON.stringify(event.data, null, 2)}`);
      }
    });

    console.log('\n✅ Agent completed successfully!');
  } catch (error) {
    console.error('❌ Example failed:', error);
    
    // Force stop the agent if it's still running
    await controller.forceStop();
  }
}

// Example with manual stop
async function manualStopExample() {
  console.log('\n🚀 Starting Manual Stop Example');

  const eventStore = new MockEventStore();
  const callbacks: WorkerCallbacks = {
    getEventState: async () => await eventStore.getEvents(),
    updateEventState: async (event: Event) => await eventStore.addEvent(event),
  };

  const controller = new AgentController({
    callbacks,
    openaiApiKey: process.env.OPENAI_API_KEY,
    workerPath: require.resolve('../dist/worker.js'),
  });

  // Add initial event
  await eventStore.addEvent({
    timestamp: new Date(),
    type: 'email_received',
    actor: 'customer',
    id: 'customer_email_2',
    data: {
      subject: 'Billing question',
      body: 'I have a question about my recent invoice.',
      from: 'customer@example.com',
      to: 'support@company.com',
    },
  });

  try {
    // Start the agent
    await controller.start(await eventStore.getEvents());

    // Let it run for 30 seconds, then stop
    console.log('⏰ Agent will run for 30 seconds, then stop...');
    setTimeout(async () => {
      try {
        await controller.stop('Manual stop after 30 seconds');
        console.log('✅ Agent stopped manually');
      } catch (error) {
        console.error('❌ Error stopping agent:', error);
      }
    }, 30000);

    // Wait for stop
    await new Promise<void>((resolve) => {
      controller.once('stopped', resolve);
    });

    console.log('✅ Manual stop example completed');
  } catch (error) {
    console.error('❌ Manual stop example failed:', error);
    await controller.forceStop();
  }
}

// Run the examples
async function runExamples() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('❌ OPENAI_API_KEY environment variable is required');
    process.exit(1);
  }

  try {
    await basicUsageExample();
    await manualStopExample();
  } catch (error) {
    console.error('❌ Examples failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  runExamples();
}

export { basicUsageExample, manualStopExample };