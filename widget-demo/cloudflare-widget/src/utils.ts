// Simplified utils for the widget

import { APPROVAL } from "./shared";

// Define types locally
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  parts?: Array<{
    type: string;
    text?: string;
    toolInvocation?: any;
  }>;
  createdAt: Date;
}

interface DataStreamWriter {
  write: (data: any) => void;
}

function isValidToolName<K extends PropertyKey, T extends object>(
  key: K,
  obj: T
): key is K & keyof T {
  return key in obj;
}

/**
 * Processes tool invocations where human input is required, executing tools when authorized.
 */
export async function processToolCalls<Tools extends Record<string, any>>({
  dataStream,
  messages,
  executions,
}: {
  tools: Tools;
  dataStream: DataStreamWriter;
  messages: Message[];
  executions: Record<string, any>;
}): Promise<Message[]> {
  const lastMessage = messages[messages.length - 1];
  const parts = lastMessage.parts;
  if (!parts) return messages;

  const processedParts = await Promise.all(
    parts.map(async (part) => {
      // Only process tool invocations parts
      if (part.type !== "tool-invocation") return part;

      const { toolInvocation } = part;
      const toolName = toolInvocation.toolName;

      // Only continue if we have an execute function for the tool (meaning it requires confirmation) and it's in a 'result' state
      if (!(toolName in executions) || toolInvocation.state !== "result")
        return part;

      let result: unknown;

      if (toolInvocation.result === APPROVAL.YES) {
        // Get the tool and check if the tool has an execute function.
        if (
          !isValidToolName(toolName, executions) ||
          toolInvocation.state !== "result"
        ) {
          return part;
        }

        const toolInstance = executions[toolName];
        if (toolInstance) {
          result = await toolInstance(toolInvocation.args, {
            messages,
            toolCallId: toolInvocation.toolCallId,
          });
        } else {
          result = "Error: No execute function found on tool";
        }
      } else if (toolInvocation.result === APPROVAL.NO) {
        result = "Error: User denied access to tool execution";
      } else {
        // For any unhandled responses, return the original part.
        return part;
      }

      // Forward updated tool result to the client.
      dataStream.write({
        type: "tool_result",
        toolCallId: toolInvocation.toolCallId,
        result,
      });

      // Return updated toolInvocation with the actual result.
      return {
        ...part,
        toolInvocation: {
          ...toolInvocation,
          result,
        },
      };
    })
  );

  // Finally return the processed messages
  return [...messages.slice(0, -1), { ...lastMessage, parts: processedParts }];
}

// export function getToolsRequiringConfirmation<
//   T extends ToolSet
//   // E extends {
//   //   [K in keyof T as T[K] extends { execute: Function } ? never : K]: T[K];
//   // },
// >(tools: T): string[] {
//   return (Object.keys(tools) as (keyof T)[]).filter((key) => {
//     const maybeTool = tools[key];
//     return typeof maybeTool.execute !== "function";
//   }) as string[];
// }
