import { Worker } from 'worker_threads';
import { EventEmitter } from 'events';
import * as path from 'path';
import {
  WorkerMessage,
  WorkerStatusEnum,
  WorkerCallbacks,
  AgentWorkerConfig,
  createMessage,
  WorkerMessageSchema,
} from './worker-types';
import { Event } from './types';

export interface AgentControllerOptions {
  workerPath?: string;
  callbacks: WorkerCallbacks;
  openaiApiKey?: string;
  restartOnError?: boolean;
  maxRestarts?: number;
}

export class AgentController extends EventEmitter {
  private worker: Worker | null = null;
  private callbacks: WorkerCallbacks;
  private options: AgentControllerOptions;
  private isRunning = false;
  private restartCount = 0;
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor(options: AgentControllerOptions) {
    super();
    this.callbacks = options.callbacks;
    this.options = {
      workerPath: options.workerPath || path.join(__dirname, 'worker.js'),
      restartOnError: options.restartOnError ?? true,
      maxRestarts: options.maxRestarts ?? 3,
      ...options,
    };
  }

  async start(initialEventLog: Event[] = []): Promise<void> {
    if (this.isRunning) {
      throw new Error('Agent is already running');
    }

    try {
      await this.createWorker();
      
      const startCommand = createMessage('start', {
        initialEventLog,
        openaiApiKey: this.options.openaiApiKey,
      });

      this.sendMessage(startCommand);
      this.isRunning = true;
      this.emit('started');
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  async stop(reason?: string): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      const stopCommand = createMessage('stop', {
        reason: reason || 'Stop requested',
      });

      this.sendMessage(stopCommand);
      
      // Wait for worker to stop gracefully
      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Worker did not stop gracefully'));
        }, 10000);

        const onStopped = () => {
          clearTimeout(timeout);
          resolve();
        };

        this.once('stopped', onStopped);
      });

    } catch (error) {
      this.emit('error', error);
      throw error;
    } finally {
      await this.destroyWorker();
    }
  }

  async forceStop(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      await this.destroyWorker();
    }
  }

  get status(): 'running' | 'stopped' | 'error' {
    if (!this.worker) return 'stopped';
    return this.isRunning ? 'running' : 'stopped';
  }

  get restartAttempts(): number {
    return this.restartCount;
  }

  private async createWorker(): Promise<void> {
    this.worker = new Worker(this.options.workerPath!, {
      workerData: {},
    });

    this.worker.on('message', (message: any) => {
      try {
        const parsedMessage = WorkerMessageSchema.parse(message);
        this.handleWorkerMessage(parsedMessage);
      } catch (error) {
        this.emit('error', new Error(`Invalid message from worker: ${error}`));
      }
    });

    this.worker.on('error', (error) => {
      this.emit('error', error);
      this.handleWorkerError(error);
    });

    this.worker.on('exit', (code) => {
      this.handleWorkerExit(code);
    });
  }

  private async destroyWorker(): Promise<void> {
    if (this.worker) {
      try {
        await this.worker.terminate();
      } catch (error) {
        // Worker might already be terminated
      }
      this.worker = null;
    }
    this.isRunning = false;
    this.clearPendingRequests();
  }

  private handleWorkerMessage(message: WorkerMessage): void {
    switch (message.type) {
      case 'worker_status':
        this.handleWorkerStatus(message);
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
        this.emit('error', new Error(`Unknown message type from worker: ${message.type}`));
    }
  }

  private handleWorkerStatus(message: any): void {
    const status = message.data.status;
    this.emit('status', status, message.data.message);

    switch (status) {
      case WorkerStatusEnum.RUNNING:
        this.emit('running');
        break;
      case WorkerStatusEnum.STOPPED:
        this.isRunning = false;
        this.emit('stopped');
        break;
      case WorkerStatusEnum.ERROR:
        this.emit('error', new Error(message.data.error || 'Worker error'));
        break;
    }
  }

  private async handleGetEventStateRequest(message: any): Promise<void> {
    try {
      const eventLog = await this.callbacks.getEventState();
      const response = createMessage('get_event_state_response', {
        requestId: message.id,
        eventLog,
      });
      this.sendMessage(response);
    } catch (error) {
      this.emit('error', error);
    }
  }

  private async handleUpdateEventStateRequest(message: any): Promise<void> {
    try {
      await this.callbacks.updateEventState(message.data.event);
      const response = createMessage('update_event_state_response', {
        requestId: message.id,
        success: true,
      });
      this.sendMessage(response);
    } catch (error) {
      const response = createMessage('update_event_state_response', {
        requestId: message.id,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
      this.sendMessage(response);
    }
  }

  private handleWorkerError(error: Error): void {
    this.isRunning = false;
    
    if (this.options.restartOnError && this.restartCount < this.options.maxRestarts!) {
      this.restartCount++;
      this.emit('restarting', this.restartCount);
      
      // Restart after a delay
      setTimeout(() => {
        this.restart().catch(err => {
          this.emit('error', err);
        });
      }, 1000 * this.restartCount); // Exponential backoff
    } else {
      this.emit('failed', error);
    }
  }

  private handleWorkerExit(code: number): void {
    this.isRunning = false;
    this.worker = null;
    this.clearPendingRequests();
    
    if (code !== 0) {
      this.emit('error', new Error(`Worker exited with code ${code}`));
    }
  }

  private async restart(): Promise<void> {
    try {
      await this.destroyWorker();
      await this.createWorker();
      // Don't automatically restart the agent loop - let the user decide
      this.emit('restarted');
    } catch (error) {
      this.emit('error', error);
    }
  }

  private sendMessage(message: WorkerMessage): void {
    if (this.worker) {
      this.worker.postMessage(message);
    }
  }

  private clearPendingRequests(): void {
    for (const [id, request] of this.pendingRequests) {
      clearTimeout(request.timeout);
      request.reject(new Error('Worker terminated'));
    }
    this.pendingRequests.clear();
  }
}

// Factory function for easier usage
export function createAgentController(options: AgentControllerOptions): AgentController {
  return new AgentController(options);
}