import 'dotenv/config';
import { AgentController, WorkerCallbacks, Event } from '../src';
import { createMessage } from '../src/worker-types';

// Simple in-memory event store
class SimpleEventStore {
  private events: Event[] = [];

  async getEvents(): Promise<Event[]> {
    return [...this.events];
  }

  async addEvent(event: Event): Promise<void> {
    this.events.push(event);
    console.log(`📝 Event added: ${event.type} by ${event.actor} - ${JSON.stringify(event.data).substring(0, 100)}...`);
  }

  getEventCount(): number {
    return this.events.length;
  }
}

async function simpleDemo() {
  console.log('🚀 Starting Simple Worker Thread Demo');

  // Create event store and callbacks
  const eventStore = new SimpleEventStore();
  const callbacks: WorkerCallbacks = {
    getEventState: () => eventStore.getEvents(),
    updateEventState: (event: Event) => eventStore.addEvent(event),
  };

  // Create controller
  const controller = new AgentController({
    callbacks,
    openaiApiKey: process.env.OPENAI_API_KEY,
    restartOnError: false, // Disable for demo
  });

  // Setup event listeners
  controller.on('started', () => {
    console.log('✅ Worker started');
  });

  controller.on('running', () => {
    console.log('🏃 Worker is running');
  });

  controller.on('stopped', () => {
    console.log('⏹️  Worker stopped');
    console.log(`📊 Final event count: ${eventStore.getEventCount()}`);
  });

  controller.on('error', (error) => {
    console.error('❌ Worker error:', error.message);
  });

  controller.on('status', (status, message) => {
    console.log(`📊 Status: ${status} - ${message || ''}`);
  });

  // Create initial customer email event
  const customerEmail: Event = {
    timestamp: new Date(),
    type: 'email_received',
    actor: 'customer',
    id: 'demo_email_1',
    data: {
      subject: 'Need help with my account',
      body: 'Hi, I am having trouble accessing my account. I forgot my password and the reset email is not working. Can you help me?',
      from: 'customer@example.com',
      to: 'support@company.com',
    },
  };

  // Add initial event
  await eventStore.addEvent(customerEmail);

  try {
    console.log('🎯 Starting worker with initial event...');
    
    // Start the worker (this will be commented out for now since we don't have a real OpenAI key)
    // await controller.start(await eventStore.getEvents());

    // For demo purposes, let's just show the structure works
    console.log('✅ Worker controller created successfully');
    console.log('📋 Initial events:');
    const events = await eventStore.getEvents();
    events.forEach((event, index) => {
      console.log(`  ${index + 1}. ${event.type} by ${event.actor}: ${event.data.subject || JSON.stringify(event.data).substring(0, 50)}`);
    });

    console.log('\n🏗️  Worker thread infrastructure is ready!');
    console.log('📝 To test with real OpenAI API, set OPENAI_API_KEY environment variable');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

if (require.main === module) {
  simpleDemo().catch(console.error);
}

export { simpleDemo };