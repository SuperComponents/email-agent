import type { Event } from '@proresponse/agent';
import type { AgentWorkerServiceConfig } from './agent-worker.js';
import { AgentWorkerService } from './agent-worker.js';

// Singleton instance for managing agent workers
class WorkerManager {
  private workers = new Map<number, AgentWorkerService>();
  private config: AgentWorkerServiceConfig;

  constructor(config: AgentWorkerServiceConfig = {}) {
    this.config = config;
  }

  async startWorkerForThread(threadId: number, initialEvents?: Event[]): Promise<AgentWorkerService> {
    // Stop existing worker for this thread if it exists
    if (this.workers.has(threadId)) {
      await this.stopWorkerForThread(threadId);
    }

    const worker = new AgentWorkerService(this.config);
    
    // Set up event listeners
    worker.on('error', (error) => {
      console.error(`[WorkerManager] Worker error for thread ${threadId}:`, error);
    });

    worker.on('stopped', () => {
      console.log(`[WorkerManager] Worker stopped for thread ${threadId}`);
      this.workers.delete(threadId);
    });

    worker.on('failed', () => {
      console.error(`[WorkerManager] Worker failed permanently for thread ${threadId}`);
      this.workers.delete(threadId);
    });

    // Start the worker
    await worker.start(threadId, initialEvents);
    this.workers.set(threadId, worker);

    return worker;
  }

  async stopWorkerForThread(threadId: number, reason?: string): Promise<void> {
    const worker = this.workers.get(threadId);
    if (worker) {
      await worker.stop(reason);
      this.workers.delete(threadId);
    }
  }

  async stopAllWorkers(): Promise<void> {
    const stopPromises = Array.from(this.workers.entries()).map(([threadId]) => 
      this.stopWorkerForThread(threadId, 'Shutdown requested')
    );
    
    await Promise.all(stopPromises);
  }

  getWorkerForThread(threadId: number): AgentWorkerService | undefined {
    return this.workers.get(threadId);
  }

  getActiveThreads(): number[] {
    return Array.from(this.workers.keys());
  }

  getWorkerStatus(threadId: number): 'running' | 'stopped' | 'not_found' {
    const worker = this.workers.get(threadId);
    if (!worker) {
      // If worker is not in map, it's stopped (either completed or never started)
      return 'stopped';
    }
    return worker.status === 'error' ? 'stopped' : worker.status;
  }

  async forceStopWorkerForThread(threadId: number): Promise<void> {
    const worker = this.workers.get(threadId);
    if (worker) {
      await worker.forceStop();
      this.workers.delete(threadId);
    }
  }
}

// Create singleton instance
const workerManager = new WorkerManager({
  openaiApiKey: process.env.OPENAI_API_KEY,
  restartOnError: true,
  maxRestarts: 3
});

export { workerManager, WorkerManager };
export type { AgentWorkerServiceConfig };