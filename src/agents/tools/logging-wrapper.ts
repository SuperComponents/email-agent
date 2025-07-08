import { randomUUID } from 'crypto';
import { db } from '../../db';
import { agentActions } from '../../db/schema/agent-actions';

interface LoggedToolCall {
  threadId?: string;
  toolName: string;
  description: string;
  parameters: any;
  result?: any;
  error?: any;
}

// Global storage for current thread context
let currentThreadId: string | undefined;

export function setCurrentThreadId(threadId: string | undefined) {
  currentThreadId = threadId;
}

async function logToolCall(call: LoggedToolCall) {
  if (!currentThreadId) return; // Only log if we have a thread context
  
  try {
    await db.insert(agentActions).values({
      id: randomUUID(),
      threadId: currentThreadId,
      agentRunId: 'agents-sdk', // We don't have access to real run ID
      toolName: call.toolName,
      toolCallId: randomUUID(),
      description: call.description,
      parameters: JSON.stringify(call.parameters),
      result: call.result ? JSON.stringify(call.result) : null,
      status: call.error ? 'error' : 'success',
      errorMessage: call.error ? String(call.error) : null,
      timestamp: new Date(),
      stepId: 'agents-sdk', // We don't have access to real step ID
    });
  } catch (error) {
    console.error('Failed to log tool call:', error);
  }
}

export function wrapToolWithLogging<T extends (...args: any[]) => any>(
  toolName: string,
  toolFunction: T,
  descriptionGenerator: (params: any) => string
): T {
  return (async (...args: any[]) => {
    const params = args[0]; // Tool functions receive params as first argument
    const description = descriptionGenerator(params);
    
    // console.log(`[TOOL CALL] ${toolName}: ${description}`);
    
    try {
      const result = await toolFunction(...args);
      
      await logToolCall({
        threadId: currentThreadId,
        toolName,
        description,
        parameters: params,
        result,
      });
      
      return result;
    } catch (error) {
      await logToolCall({
        threadId: currentThreadId,
        toolName,
        description,
        parameters: params,
        error,
      });
      throw error;
    }
  }) as T;
}