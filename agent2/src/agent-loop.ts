import {
  DefaultContextGenerator,
  DefaultContextGeneratorV2,
} from "./context/context";
import ToolManager from "./context/tools";
import { LLMClient, ToolCallSchema } from "./llm";
import { Event } from "./types";
import z from "zod";
import { prettyPrint } from "./utils";

export default async function runAgentLoop(
  eventLog_: Event[],
  toolManager: ToolManager
): Promise<Event[]> {
  let toolName = "temp";

  const eventLog: Event[] = JSON.parse(JSON.stringify(eventLog_));
  const contextGenerator = new DefaultContextGeneratorV2(toolManager);
  const client = new LLMClient();

  while (true) {
    prettyPrint(eventLog);
    const response = await client.getNextToolCall(
      contextGenerator.getSystemPrompt(),
      contextGenerator.getMessage(eventLog)
    );
    const nextToolCall = response.tool_call;

    const tool = toolManager.getTool(nextToolCall.name);
    if (!tool) {
      throw new Error(`Tool ${nextToolCall.name} not found`);
    }

    try {
      const result = await tool.execute(nextToolCall.args);

      eventLog.push({
        timestamp: new Date(),
        type: tool.name,
        actor: "system",
        id: "tool_result",
        data: {
          args: nextToolCall.args,
          result: result,
        },
      });

      if (tool.name === "finalize_draft") {
        break;
      }
    } catch (error) {
      eventLog.push({
        timestamp: new Date(),
        type: tool.name,
        actor: "system",
        id: "tool_error",
        data: {
          error: error,
        },
      });
    }

    if (tool.name === "finalize_draft") {
      console.log("finalizing draft");
      break;
    }
  }

  return eventLog;
}
