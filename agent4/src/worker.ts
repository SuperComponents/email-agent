import { parentPort, workerData } from 'worker_threads';
import {
  WorkerMessage,
  WorkerStatusEnum,
  StartCommand,
  StopCommand,
  GetEventStateRequest,
  UpdateEventStateRequest,
  createMessage,
  WorkerMessageSchema,
} from './worker-types';
import { Event } from './types';
import runAgentLoop from './agent-loop';
import ToolManager from './context/tools';
import {
  SummarizeUsefulContextTool,
  UpdateThreadUrgencyTool,
  UpdateThreadCategoryTool,
  UserActionNeededTool,
  FinalizeDraftTool,
} from './mocktools';
import RAGTool from './tools/rag';
import ComposeDraftTool from './tools/compose-draft';

class AgentWorker {
  private isRunning = false;
  private shouldStop = false;
  private currentEventLog: Event[] = [];
  private pendingRequests = new Map<string, (response: any) => void>();

  constructor() {
    this.setupMessageHandling();
    this.sendStatus(WorkerStatusEnum.STARTING, 'Worker initialized');
  }

  private setupMessageHandling() {
    if (!parentPort) {
      throw new Error('Worker must be run in a worker thread');
    }

    parentPort.on('message', (message: any) => {
      try {
        const parsedMessage = WorkerMessageSchema.parse(message);
        this.handleMessage(parsedMessage);
      } catch (error) {
        this.sendError(`Invalid message format: ${error}`);
      }
    });
  }

  private handleMessage(message: WorkerMessage) {
    switch (message.type) {
      case 'start':
        this.handleStart(message as StartCommand);
        break;
      case 'stop':
        this.handleStop(message as StopCommand);
        break;
      case 'get_event_state_response':
        this.handleGetEventStateResponse(message);
        break;
      case 'update_event_state_response':
        this.handleUpdateEventStateResponse(message);
        break;
      default:
        this.sendError(`Unknown message type: ${message.type}`);
    }
  }

  private async handleStart(command: StartCommand) {
    if (this.isRunning) {
      this.sendError('Agent is already running');
      return;
    }

    try {
      this.isRunning = true;
      this.shouldStop = false;
      this.currentEventLog = command.data.initialEventLog as Event[];
      
      this.sendStatus(WorkerStatusEnum.RUNNING, 'Agent loop started');
      
      // Set up OpenAI API key if provided
      if (command.data.openaiApiKey) {
        process.env.OPENAI_API_KEY = command.data.openaiApiKey;
      }

      await this.runAgentWithCallbacks();
    } catch (error) {
      this.sendError(`Failed to start agent: ${error}`);
      this.isRunning = false;
    }
  }

  private handleStop(command: StopCommand) {
    this.shouldStop = true;
    this.sendStatus(WorkerStatusEnum.STOPPING, command.data.reason || 'Stop requested');
  }

  private handleGetEventStateResponse(message: any) {
    const resolver = this.pendingRequests.get(message.data.requestId);
    if (resolver) {
      resolver(message.data.eventLog);
      this.pendingRequests.delete(message.data.requestId);
    }
  }

  private handleUpdateEventStateResponse(message: any) {
    const resolver = this.pendingRequests.get(message.data.requestId);
    if (resolver) {
      if (message.data.success) {
        resolver(true);
      } else {
        resolver(new Error(message.data.error || 'Update failed'));
      }
      this.pendingRequests.delete(message.data.requestId);
    }
  }

  private async runAgentWithCallbacks() {
    try {
      // Create tool manager with all tools
      const toolManager = new ToolManager();
      toolManager.registerTool(new RAGTool());
      toolManager.registerTool(new SummarizeUsefulContextTool());
      toolManager.registerTool(new UpdateThreadUrgencyTool());
      toolManager.registerTool(new UpdateThreadCategoryTool());
      toolManager.registerTool(new ComposeDraftTool());
      toolManager.registerTool(new UserActionNeededTool());
      toolManager.registerTool(new FinalizeDraftTool());

      // Get initial event state
      const initialEvents = await this.getEventState();
      
      // Run the agent loop with callback-based event management
      const result = await this.runAgentLoopWithCallbacks(initialEvents, toolManager);
      
      // Final event state update
      for (const event of result.slice(initialEvents.length)) {
        await this.updateEventState(event);
      }

      this.sendStatus(WorkerStatusEnum.STOPPED, 'Agent loop completed successfully');
      
      // Exit the worker thread to trigger cleanup
      process.exit(0);
    } catch (error) {
      this.sendError(`Agent loop failed: ${error}`);
      // Exit on error too
      process.exit(1);
    } finally {
      this.isRunning = false;
    }
  }

  private async runAgentLoopWithCallbacks(
    initialEventLog: Event[],
    toolManager: ToolManager
  ): Promise<Event[]> {
    // This is a modified version of runAgentLoop that uses callbacks
    // and checks for stop conditions
    
    let eventLog = [...initialEventLog];
    const { DefaultContextGeneratorV2 } = await import('./context/context');
    const { LLMClient } = await import('./llm');
    
    const contextGenerator = new DefaultContextGeneratorV2(toolManager);
    const client = new LLMClient();

    while (!this.shouldStop) {
      try {
        // Get current event state from main thread
        const currentEvents = await this.getEventState();
        eventLog = [...currentEvents];

        const response = await client.getNextToolCall(
          contextGenerator.getSystemPrompt(),
          contextGenerator.getMessage(eventLog)
        );
        
        if (this.shouldStop) break;

        const nextToolCall = response.tool_call;
        const tool = toolManager.getTool(nextToolCall.name);
        
        if (!tool) {
          throw new Error(`Tool ${nextToolCall.name} not found`);
        }

        let result;
        try {
          result = await tool.execute(nextToolCall.args);
        } catch (toolError) {
          // Add error event
          const errorEvent: Event = {
            timestamp: new Date(),
            type: tool.name,
            actor: 'system',
            id: 'tool_error',
            data: {
              error: toolError,
            },
          };
          await this.updateEventState(errorEvent);
          continue;
        }

        // Add successful tool call event
        const toolEvent: Event = {
          timestamp: new Date(),
          type: tool.name,
          actor: 'system',
          id: 'tool_result',
          data: {
            args: nextToolCall.args,
            result: result,
          },
        };
        
        await this.updateEventState(toolEvent);

        // Check if we should stop after finalize_draft or user_action_needed
        if (tool.name === 'finalize_draft' || tool.name === 'user_action_needed') {
          break;
        }
      } catch (error) {
        this.sendError(`Error in agent loop: ${error}`);
        break;
      }
    }

    return await this.getEventState();
  }

  private async getEventState(): Promise<Event[]> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      
      this.pendingRequests.set(requestId, resolve);
      
      const request = createMessage('get_event_state_request', {}, requestId);
      this.sendMessage(request);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Timeout waiting for event state'));
        }
      }, 10000);
    });
  }

  private async updateEventState(event: Event): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestId = Math.random().toString(36).substr(2, 9);
      
      this.pendingRequests.set(requestId, (result) => {
        if (result instanceof Error) {
          reject(result);
        } else {
          resolve();
        }
      });
      
      const request = createMessage('update_event_state_request', { event }, requestId);
      this.sendMessage(request);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(requestId)) {
          this.pendingRequests.delete(requestId);
          reject(new Error('Timeout waiting for event state update'));
        }
      }, 10000);
    });
  }

  private sendStatus(status: WorkerStatusEnum, message?: string) {
    const statusMessage = createMessage('worker_status', {
      status,
      message,
    });
    this.sendMessage(statusMessage);
  }

  private sendError(error: string) {
    const errorMessage = createMessage('worker_error', {
      error,
      stack: new Error().stack,
    });
    this.sendMessage(errorMessage);
  }

  private sendMessage(message: WorkerMessage) {
    if (parentPort) {
      parentPort.postMessage(message);
    }
  }
}

// Initialize the worker
new AgentWorker();