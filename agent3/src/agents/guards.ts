import type {
  AgentOutputItem,
  HostedToolCallItem,
  FunctionCallItem,
  FunctionCallResultItem,
  RunItemStreamEvent,
  RunStreamEvent,
} from '@openai/agents';

export interface KnowledgeBaseResult {
  attributes: Record<string, unknown>;
  file_id: string;
  filename: string;
  score: number;
  text: string;
}

export function isHostedOrFunctionCall(
  call: AgentOutputItem,
): call is HostedToolCallItem | FunctionCallItem {
  return call.type === 'hosted_tool_call' || call.type === 'function_call';
}

export function isHostedToolCall(call: AgentOutputItem): call is HostedToolCallItem {
  return call.type === 'hosted_tool_call';
}

export interface HostedFileSearchToolCall extends HostedToolCallItem {
  providerData: {
    type: 'file_search_call';
    queries?: string[];
    results?: KnowledgeBaseResult[];
  };
}

export function isHostedFileSearchToolCall(
  call: AgentOutputItem,
): call is HostedFileSearchToolCall {
  return (
    isHostedToolCall(call) &&
    call.providerData !== null &&
    typeof call.providerData === 'object' &&
    'type' in call.providerData &&
    (call.providerData as { type?: string }).type === 'file_search_call'
  );
}

export function isFunctionCall(call: AgentOutputItem): call is FunctionCallItem {
  return call.type === 'function_call';
}

export function isFunctionCallResult(call: AgentOutputItem): call is FunctionCallResultItem {
  return call.type === 'function_call_result';
}

export function isRunItemStreamEvent(event: RunStreamEvent): event is RunItemStreamEvent {
  return event.type === 'run_item_stream_event';
}

export interface OutputMessage {
  providerData: Record<string, unknown>;
  id: string;
  type: 'message';
  role: 'assistant';
  status: 'completed';
  content: Array<{
    type: 'output_text';
    text: string;
  }>;
}

export function isMessage(item: AgentOutputItem): item is OutputMessage {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    (item as { type?: string }).type === 'message'
  );
}
