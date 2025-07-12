import { AgentWorkerOptions, Event } from './types';

export class AgentWorker {
  private options: AgentWorkerOptions;
  private running = false;

  constructor(options: AgentWorkerOptions) {
    this.options = options;
  }

  async start(): Promise<void> {
    this.running = true;
    console.log('Agent worker started');
  }

  async stop(): Promise<void> {
    this.running = false;
    console.log('Agent worker stopped');
  }

  isRunning(): boolean {
    return this.running;
  }
}