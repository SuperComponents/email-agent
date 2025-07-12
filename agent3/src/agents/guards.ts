import type {
  AgentOutputItem,
  HostedToolCallItem,
  FunctionCallItem,
  FunctionCallResultItem,
  RunItemStreamEvent,
  RunStreamEvent,
  AssistantMessageItem,
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
// {
//   "type": "message_output_item",
//   "rawItem": {
//     "providerData": {},
//     "id": "msg_687220d6a900819e82a4a07f2ebdae4a0eff7457e57efefb",
//     "type": "message",
//     "role": "assistant",
//     "status": "completed",
//     "content": [
//       {
//         "type": "output_text",
//         "text": "The draft response has been created successfully. Here is a summary of the response:\n\n---\n\nHello,\n\nThank you for reaching out about the DragonScale Gauntlets.\n\nI’m pleased to inform you that the DragonScale Gauntlets come with a comprehensive warranty. The titanium scales and construction are covered by a lifetime warranty. Additionally, the leather and stitching enjoy a 5-year warranty. We offer free repairs for normal wear and tear during the first five years of ownership. For these premium gauntlets, a restoration service is also available for vintage items.\n\nIf you have any further questions, please let us know. We’re here to help!\n\nBest regards,\n\n[Your Name]  \nCustomer Support Team\n\n--- \n\nFeel free to let me know if there's anything else you need!"
//       }
//     ]
//   },
//   "agent": {
//     "name": "EmailProcessor"
//   }

// interface MessageOutputItem {
//   type: 'message';
//   role: 'assistant';
//   content: {
//     type: 'output_text';
//     text: string;
//   };
// }


export interface OutputMessage {
  providerData: Record<string, unknown>;
  id: string;
  type: "message",
  role: "assistant",
  status: "completed",
  content: Array<
    {
      type: "output_text",
      text: string
    }>
  
}
// const abc = 1 as any as AssistantMessageItem

export function isMessage(item: AgentOutputItem): item is OutputMessage {
  return (
    typeof item === 'object' &&
    item !== null &&
    'type' in item &&
    (item as { type?: string }).type === 'message'
  );
}
