# Agent Worker Thread

This package provides a worker thread implementation for the ProResponse AI agent that can be controlled from your main backend server.

## Architecture

The worker thread implementation consists of:

- **AgentController**: Main thread interface for managing the worker
- **Worker Thread**: Runs the agent loop in isolation using Node.js worker_threads
- **Message-based Communication**: Type-safe communication between main thread and worker
- **Event State Management**: Callbacks for getting and updating event state

## Quick Start

```typescript
import { AgentController, WorkerCallbacks, Event } from '@proresponse/agent';

// Define your event state management callbacks
const callbacks: WorkerCallbacks = {
  getEventState: async () => {
    // Return current event log from your database
    return await db.getEvents();
  },
  updateEventState: async (event: Event) => {
    // Save new event to your database
    await db.saveEvent(event);
  },
};

// Create the controller
const controller = new AgentController({
  callbacks,
  openaiApiKey: process.env.OPENAI_API_KEY,
  restartOnError: true,
  maxRestarts: 3,
});

// Set up event listeners
controller.on('started', () => console.log('Agent started'));
controller.on('stopped', () => console.log('Agent stopped'));
controller.on('error', (error) => console.error('Agent error:', error));

// Start the agent with initial events
const initialEvents = await db.getEvents();
await controller.start(initialEvents);

// Stop the agent
await controller.stop('Manual stop');
```

## API Reference

### AgentController

#### Constructor Options

- `callbacks: WorkerCallbacks` - Event state management callbacks (required)
- `openaiApiKey?: string` - OpenAI API key
- `workerPath?: string` - Custom path to worker script
- `restartOnError?: boolean` - Auto-restart on worker errors (default: true)
- `maxRestarts?: number` - Maximum restart attempts (default: 3)

#### Methods

- `start(initialEvents?: Event[]): Promise<void>` - Start the agent
- `stop(reason?: string): Promise<void>` - Gracefully stop the agent
- `forceStop(): Promise<void>` - Force terminate the worker

#### Properties

- `status: 'running' | 'stopped' | 'error'` - Current status
- `restartAttempts: number` - Number of restart attempts

#### Events

- `started` - Worker started successfully
- `running` - Worker is running
- `stopped` - Worker stopped
- `error(error: Error)` - Worker error occurred
- `status(status: string, message?: string)` - Status update
- `restarting(attempt: number)` - Worker is restarting
- `failed(error: Error)` - Worker failed permanently

### WorkerCallbacks

```typescript
interface WorkerCallbacks {
  getEventState: () => Promise<Event[]>;
  updateEventState: (event: Event) => Promise<void>;
}
```

## Message Types

The worker communicates using type-safe messages:

- `StartCommand` - Start the agent with initial events
- `StopCommand` - Stop the agent
- `GetEventStateRequest/Response` - Fetch current event state
- `UpdateEventStateRequest/Response` - Update event state
- `WorkerStatus` - Worker status updates
- `WorkerError` - Worker error notifications

## Error Handling

The controller includes robust error handling:

- **Automatic Restart**: Workers are restarted on errors (configurable)
- **Graceful Shutdown**: Workers can be stopped cleanly
- **Timeout Protection**: Requests timeout after 10 seconds
- **Error Propagation**: All errors are properly emitted as events

## Examples

See the `examples/` directory for complete usage examples:

- `basic-usage.ts` - Full featured example with event logging
- `simple-demo.ts` - Minimal setup demonstration

## Testing

```bash
npm test                    # Run all tests
npm run build              # Build TypeScript
npx tsx examples/simple-demo.ts  # Run demo
```

## Integration with Backend

To integrate with your main backend server:

1. Create event state management callbacks that interface with your database
2. Set up the AgentController with your callbacks
3. Use the controller's events to update your UI or notify users
4. Call `start()` when a new support ticket needs processing
5. Call `stop()` when processing should be interrupted

The worker thread runs independently and communicates all state changes through your callbacks, ensuring your main application stays responsive.