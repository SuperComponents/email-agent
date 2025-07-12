import type { RunItemStreamEvent } from '@openai/agents';
import type { AgentAction } from '../db/types.js';
import { logAgentAction } from '../db/query.js';

export async function logStreamingToolCalls(
  current: RunItemStreamEvent,
  thread_id: number,
  _last?: RunItemStreamEvent,
) {
  const currentRawItem = current.item.rawItem;
  return await logCall(currentRawItem, thread_id);
}

export async function logCall(call: unknown, thread_id: number): Promise<AgentAction[]> {
  return logAgentAction({
    thread_id,
    action: 'a',
    description: 'a',
    metadata: call,
  });
}
