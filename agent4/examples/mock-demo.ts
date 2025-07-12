import 'dotenv/config';
import { AgentController, WorkerCallbacks, Event } from '../src';

// Simple in-memory event store
class SimpleEventStore {
  private events: Event[] = [];

  async getEvents(): Promise<Event[]> {
    return [...this.events];
  }

  async addEvent(event: Event): Promise<void> {
    this.events.push(event);
    console.log(`📝 Event added: ${event.type} by ${event.actor}`);
    if (event.data.result) {
      console.log(`   Result: ${JSON.stringify(event.data.result).substring(0, 100)}...`);
    }
  }

  getEventCount(): number {
    return this.events.length;
  }
}

async function mockDemo() {
  console.log('🚀 Starting Mock Worker Demo (No OpenAI API needed)');

  // Create event store and callbacks
  const eventStore = new SimpleEventStore();
  const callbacks: WorkerCallbacks = {
    getEventState: () => eventStore.getEvents(),
    updateEventState: (event: Event) => eventStore.addEvent(event),
  };

  // Create controller
  const controller = new AgentController({
    callbacks,
    // No OpenAI key needed for mock tools
    restartOnError: false,
  });

  // Setup detailed event listeners
  controller.on('started', () => {
    console.log('✅ Worker started - agent loop beginning');
  });

  controller.on('running', () => {
    console.log('🏃 Worker is running - processing events');
  });

  controller.on('stopped', () => {
    console.log('⏹️  Worker stopped - agent loop completed');
    console.log(`📊 Final event count: ${eventStore.getEventCount()}`);
    
    // Show final event summary
    console.log('\n📋 Final Event Summary:');
    eventStore.getEvents().forEach((event, index) => {
      console.log(`  ${index + 1}. [${event.timestamp.toISOString().substring(11, 19)}] ${event.type} by ${event.actor}`);
    });
  });

  controller.on('error', (error) => {
    console.error('❌ Worker error:', error.message);
  });

  controller.on('status', (status, message) => {
    console.log(`📊 Status: ${status} ${message ? '- ' + message : ''}`);
  });

  controller.on('restarting', (attempt) => {
    console.log(`🔄 Restarting worker (attempt ${attempt})`);
  });

  controller.on('failed', (error) => {
    console.error('💥 Worker failed permanently:', error.message);
  });

  // Create initial customer email event
  const customerEmail: Event = {
    timestamp: new Date(),
    type: 'email_received',
    actor: 'customer',
    id: 'demo_email_1',
    data: {
      subject: 'Cannot access my account',
      body: 'Hi support team, I have been trying to log into my account for the past hour but keep getting an error message. I tried resetting my password but the email never arrived. This is urgent as I need to access my files for work. My email is john.doe@company.com. Please help!',
      from: 'john.doe@company.com',
      to: 'support@yourcompany.com',
    },
  };

  try {
    // Add initial event
    console.log('\n📧 Adding initial customer email...');
    await eventStore.addEvent(customerEmail);

    // Start the worker
    console.log('\n🎯 Starting agent worker thread...');
    await controller.start(await eventStore.getEvents());

    // Wait for completion or timeout
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

    console.log('\n✅ Agent completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    await controller.forceStop();
  }
}

if (require.main === module) {
  mockDemo().catch(console.error);
}

export { mockDemo };