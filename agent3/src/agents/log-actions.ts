import type {
  AgentOutputItem,
  HostedToolCallItem,
  FunctionCallItem,
  FunctionCallResultItem,
  RunItemStreamEvent,
} from '@openai/agents';
import type { AgentAction, ToolCallMetadata } from '../db/types.js';
import { logAgentAction } from '../db/query.js';
import {
  isHostedOrFunctionCall,
  isHostedToolCall,
  isFunctionCall,
  isFunctionCallResult,
  isMessage,
  type OutputMessage,
} from './guards.js';

type ToolResult = HostedToolCallItem | FunctionCallItem | FunctionCallResultItem | OutputMessage;

function getResultCallOrUndefined(call: AgentOutputItem, output: AgentOutputItem[]) {
  if (isFunctionCall(call)) {
    return output.filter(isFunctionCallResult).find(r => r.callId === call.callId);
  }
}
/*
RunItemStreamEvent {
  name: 'message_output_created',
  item: RunMessageOutputItem {
    type: 'message_output_item',
    rawItem: {
      providerData: {},
      id: 'msg_68722d385780819c9fa5840e41a4ee8e0fb1c632e2ae3abf',
      type: 'message',
      role: 'assistant',
      status: 'completed',
      content: [Array]
    },
*/

export async function logStreamingToolCalls(
  current: RunItemStreamEvent,
  thread_id: number,
  last?: RunItemStreamEvent,
) {
  const currentRawItem = current.item.rawItem;
  return await logCall2(currentRawItem, thread_id);
  const lastRawItem = last?.item.rawItem;

//   if (isHostedToolCall(currentRawItem)) {
//     return await logCall(currentRawItem, thread_id);
//   } else if (isFunctionCallResult(currentRawItem) && lastRawItem && isFunctionCall(lastRawItem)) {
//     return await logCall(lastRawItem, thread_id, currentRawItem);
//   } else if (isMessage(currentRawItem)) {
//     return await logCall(currentRawItem, thread_id);
//   }
//   return [];
}

export async function logAndProcessToolCalls(
  output: AgentOutputItem[],
  thread_id: number,
): Promise<AgentAction[]> {
  if (!output) return [];

  const promises = output
    .filter(isHostedOrFunctionCall)
    .map(call => logCall(call, thread_id, getResultCallOrUndefined(call, output)));

  const results = await Promise.all(promises);
  return results.flat();
}

export async function logCall2(
  call: any,
  thread_id: number,
  result?: ToolResult,
): Promise<AgentAction[]> {
  return logAgentAction({
    thread_id,
    action: 'a',
    description: 'a',
    metadata: call
  });
}

async function logCall(
  call: ToolResult,
  thread_id: number,
  result?: ToolResult,
): Promise<AgentAction[]> {
  return logAgentAction({
    thread_id,
    action: getActionName(call),
    description: generateDescription(call),
    metadata: getMetadata(call, result),
  });
}

function getActionName(call: ToolResult): string {
  if (isMessage(call) || call.name === 'explain_next_tool_call') {
    return 'assistant_message';
  }
  return call.name
}

function getMetadata(call: ToolResult, result?: ToolResult): ToolCallMetadata {
  const base: ToolCallMetadata = {
    callId: call.id || '',
    timestamp: Date.now(),
    parameters: {},
    status: 'success',
  };

  if (isHostedToolCall(call)) {
    const data = (call.providerData as { queries?: string[]; results?: unknown[] }) || {};
    base.parameters = {
      queries: data.queries || [],
      ...(data.results?.length && { resultCount: data.results.length }),
    };
    base.result = { status: call.status };
    return base;
  }

  if (isFunctionCall(call) && result && isFunctionCallResult(result)) {
    base.parameters = parseJson(call.arguments) || {};

    if (result.output?.type === 'text') {
      try {
        base.result = parseJson(result.output.text);
      } catch (e) {
        base.error = e instanceof Error ? e.message : String(e);
        base.status = 'error';
      }
    }
    return base;
  }

  if (isMessage(call)) {
    base.result = { status: call.status };
    return base;
  }

  return base;
}

function generateDescription(call: ToolResult): string {
  const params =
    call.type === 'function_call' ? parseJson(call.arguments) || {} : call.providerData || {};

  interface DescriptionParams {
    explanation?: string;
    senderEmail?: string;
    emailId?: string | number;
    tags?: string[];
    query?: string;
    queries?: string[];
  }
  if (isMessage(call)) {

    if (call.content[0].type === 'output_text') {
      return call.content[0].text;
    } else {
      return 'SOMETHING BAD HAPPENED'
    }
  }

  const descriptions: Record<string, (p: DescriptionParams) => string> = {
    explain_next_tool_call: p => `${p.explanation}`,
    search_emails: p => `Searched for emails from ${p.senderEmail || 'all senders'}`,
    tag_email: p => `Tagged email ${p.emailId} as ${p.tags?.join(', ') || 'unknown'}`,
    search_knowledge_base: p => `Searched knowledge base for: "${p.query || 'unknown query'}"`,
    file_search_call: p => `Searched knowledge base with queries: ${(p.queries || []).join(', ')}`,
  };

  return descriptions[call.name]?.(params as DescriptionParams) || `Called ${call.name} tool`;
}

function parseJson(str: string | undefined): null | Record<string, unknown> {
  if (!str) return null;
  try {
    return JSON.parse(str) as Record<string, unknown>;
  } catch {
    return null;
  }
}
