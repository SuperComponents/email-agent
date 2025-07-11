import type {
  AgentOutputItem,
  HostedToolCallItem,
  FunctionCallItem,
  FunctionCallResultItem,
  RunItemStreamEvent,
} from '@openai/agents';
import { db } from '../db/db.js';
import { agentActions } from '../db/schema.js';
import type { AgentAction, ToolCallMetadata } from '../db/types.js';

type ToolResult = HostedToolCallItem | FunctionCallItem | FunctionCallResultItem;

function isHostedOrFunctionCall(
  call: AgentOutputItem,
): call is HostedToolCallItem | FunctionCallItem {
  return call.type === 'hosted_tool_call' || call.type === 'function_call';
}

function isHostedToolCall(call: AgentOutputItem): call is HostedToolCallItem {
  return call.type === 'hosted_tool_call';
}

function isFunctionCall(call: AgentOutputItem): call is FunctionCallItem {
  return call.type === 'function_call';
}

function isFunctionCallResult(call: AgentOutputItem): call is FunctionCallResultItem {
  return call.type === 'function_call_result';
}

function getResultCallOrUndefined(call: AgentOutputItem, output: AgentOutputItem[]) {
  if (isFunctionCall(call)) {
    return output.filter(isFunctionCallResult).find(r => r.callId === call.callId);
  }
}

export async function logStreamingToolCalls(
  current: RunItemStreamEvent,
  thread_id: number,
  last?: RunItemStreamEvent,
) {
  const currentRawItem = current.item.rawItem;
  const lastRawItem = last?.item.rawItem;

  if (isHostedToolCall(currentRawItem)) {
    return await logCall(currentRawItem, thread_id);
  } else if (isFunctionCallResult(currentRawItem) && lastRawItem && isFunctionCall(lastRawItem)) {
    return await logCall(lastRawItem, thread_id, currentRawItem);
  }
  return [];
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

async function logCall(
  call: ToolResult,
  thread_id: number,
  result?: ToolResult,
): Promise<AgentAction[]> {
  return db
    .insert(agentActions)
    .values({
      thread_id,
      action: call.name,
      description: generateDescription(call),
      metadata: getMetadata(call, result),
    })
    .returning() as Promise<AgentAction[]>;
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

  return base;
}

function generateDescription(call: ToolResult): string {
  const params =
    call.type === 'function_call' ? parseJson(call.arguments) || {} : call.providerData || {};

  interface DescriptionParams {
    senderEmail?: string;
    emailId?: string | number;
    tags?: string[];
    query?: string;
    queries?: string[];
  }

  const descriptions: Record<string, (p: DescriptionParams) => string> = {
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
