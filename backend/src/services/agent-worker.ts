import { EventEmitter } from 'events';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import type { 
  Event, 
  WorkerMessage, 
  StartCommand, 
  StopCommand
} from '@proresponse/agent';
import { createMessage } from '@proresponse/agent';
import { db } from '../database/db.js';
import { agent_actions } from '../database/schema.js';
import { eq } from 'drizzle-orm';

// Get the current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AgentWorkerServiceConfig {
  openaiApiKey?: string;
  workerPath?: string;
  restartOnError?: boolean;
  maxRestarts?: number;
}

export class AgentWorkerService extends EventEmitter {
  private worker: Worker | null = null;
  private isRunning = false;
  private restartAttempts = 0;
  private pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (error: Error) => void }>();
  private config: AgentWorkerServiceConfig;
  private threadId: number | null = null;

  constructor(config: AgentWorkerServiceConfig = {}) {
    super();
    this.config = {
      restartOnError: true,
      maxRestarts: 3,
      ...config
    };
  }

  async start(threadId: number, initialEvents?: Event[]): Promise<void> {
    if (this.isRunning) {
      throw new Error('Agent worker is already running');
    }

    this.threadId = threadId;
    await this.startWorker(initialEvents || []);
  }

  async stop(reason?: string): Promise<void> {
    if (!this.isRunning || !this.worker) {
      return;
    }

    return new Promise((resolve, reject) => {
      if (!this.worker) {
        resolve();
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker stop timeout'));
      }, 5000);

      this.worker.once('exit', () => {
        clearTimeout(timeout);
        this.cleanup();
        resolve();
      });

      const stopMessage: StopCommand = createMessage('stop', {
        reason: reason || 'Manual stop requested'
      });
      
      this.worker.postMessage(stopMessage);
    });
  }

  async forceStop(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.cleanup();
    }
  }

  get status(): 'running' | 'stopped' | 'error' {
    return this.isRunning ? 'running' : 'stopped';
  }

  private async startWorker(initialEvents: Event[]): Promise<void> {
    const workerPath = this.config.workerPath || 
      path.resolve(__dirname, '../../../node_modules/@proresponse/agent/dist/worker.js');

    this.worker = new Worker(workerPath, {
      workerData: {}
    });

    this.setupWorkerEventHandlers();

    // Send start command
    const startMessage: StartCommand = createMessage('start', {
      initialEventLog: initialEvents,
      openaiApiKey: this.config.openaiApiKey || process.env.OPENAI_API_KEY
    });

    this.worker.postMessage(startMessage);
    this.isRunning = true;
    this.emit('started');
  }

  private setupWorkerEventHandlers(): void {
    if (!this.worker) return;

    this.worker.on('message', (message: WorkerMessage) => {
      this.handleWorkerMessage(message);
    });

    this.worker.on('error', (error: Error) => {
      console.error('[AgentWorker] Worker error:', error);
      this.emit('error', error);
      
      if (this.config.restartOnError && this.restartAttempts < (this.config.maxRestarts || 3)) {
        this.attemptRestart();
      } else {
        this.emit('failed', error);
        this.cleanup();
      }
    });

    this.worker.on('exit', (code: number) => {
      console.log(`[AgentWorker] Worker exited with code ${code}`);
      this.emit('stopped');
      this.cleanup();
    });
  }

  private handleWorkerMessage(message: WorkerMessage): void {
    switch (message.type) {
      case 'worker_status':
        this.emit('status', message.data.status, message.data.message);
        if (message.data.status === 'running') {
          this.emit('running');
        }
        break;

      case 'worker_error':
        this.emit('error', new Error(message.data.error));
        break;

      case 'get_event_state_request':
        this.handleGetEventStateRequest(message);
        break;

      case 'update_event_state_request':
        this.handleUpdateEventStateRequest(message);
        break;

      default:
        console.warn('[AgentWorker] Unknown message type:', message.type);
    }
  }

  private async handleGetEventStateRequest(message: any): Promise<void> {
    try {
      const events = await this.getEventState();
      const response = createMessage('get_event_state_response', {
        requestId: message.id,
        eventLog: events
      });
      
      if (this.worker) {
        this.worker.postMessage(response);
      }
    } catch (error) {
      console.error('[AgentWorker] Error getting event state:', error);
      const response = createMessage('get_event_state_response', {
        requestId: message.id,
        eventLog: []
      });
      
      if (this.worker) {
        this.worker.postMessage(response);
      }
    }
  }

  private async handleUpdateEventStateRequest(message: any): Promise<void> {
    try {
      await this.updateEventState(message.data.event);
      const response = createMessage('update_event_state_response', {
        requestId: message.id,
        success: true
      });
      
      if (this.worker) {
        this.worker.postMessage(response);
      }
    } catch (error) {
      console.error('[AgentWorker] Error updating event state:', error);
      const response = createMessage('update_event_state_response', {
        requestId: message.id,
        success: false,
        error: error instanceof Error ? error.message : 'Update failed'
      });
      
      if (this.worker) {
        this.worker.postMessage(response);
      }
    }
  }

  private async getEventState(): Promise<Event[]> {
    if (!this.threadId) {
      return [];
    }

    // Get agent actions for this thread and convert to Event format
    const actions = await db
      .select()
      .from(agent_actions)
      .where(eq(agent_actions.thread_id, this.threadId))
      .orderBy(agent_actions.created_at);

    return actions.map(action => ({
      id: action.id.toString(),
      timestamp: action.created_at,
      type: action.action,
      actor: 'system',
      data: action.metadata || {}
    }));
  }

  private async updateEventState(event: Event): Promise<void> {
    if (!this.threadId) {
      throw new Error('No thread ID set');
    }

    // Save event as agent_action in database
    await db.insert(agent_actions).values({
      thread_id: this.threadId,
      action: event.type as any, // Cast to enum type
      description: `Agent action: ${event.type}`,
      metadata: event.data,
      created_at: event.timestamp || new Date()
    });
  }

  private async attemptRestart(): Promise<void> {
    this.restartAttempts++;
    this.emit('restarting', this.restartAttempts);
    
    try {
      await this.cleanup();
      
      // Wait a bit before restarting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (this.threadId) {
        const currentEvents = await this.getEventState();
        await this.startWorker(currentEvents);
      }
    } catch (error) {
      console.error('[AgentWorker] Restart failed:', error);
      this.emit('failed', error);
    }
  }

  private cleanup(): void {
    this.isRunning = false;
    this.worker = null;
    this.pendingRequests.clear();
  }
}