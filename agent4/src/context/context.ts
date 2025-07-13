import zodToJsonSchema from "zod-to-json-schema";
import { Event } from "../types";
import ToolManager, { ToolDefinition } from "./tools";

export abstract class ContextGenerator {
  // This is an abstract class that will be implemented by the various context generators.
  // The different context generators will allow for testing of different system prompts and context strategies.

  constructor(protected toolManager: ToolManager) {}

  abstract getSystemPrompt(): string;

  abstract getMessage(eventLog: Event[]): string;
}

export class DefaultContextGenerator extends ContextGenerator {
  constructor(toolManager: ToolManager) {
    super(toolManager);
  }

  static serializeTool(tool: ToolDefinition): string {
    // Convert zod schemas to standard JSON-Schema so the LLM receives a fully
    // machine-readable contract instead of the opaque `.toString()` output.
    const argsSchema = zodToJsonSchema(tool.args, "args");
    const resultSchema = zodToJsonSchema(tool.result, "result");

    return JSON.stringify(
      {
        name: tool.name,
        description: tool.description,
        args: argsSchema,
        result: resultSchema,
      },
      null,
      undefined
    );
  }
  serializeTools(): string {
    return this.toolManager
      .listTools()
      .map((tool) => DefaultContextGenerator.serializeTool(tool))
      .join("\n");
  }

  systemPromptTemplate = `
  
`;
  getSystemPrompt(): string {
    return `
You are a customer support agent. You are responsible for helping your supervisor gather context related to the support
email. 

You have access to the following tools:
${this.serializeTools()}

You will be given a list of events that have happened and your job is to determine what the next tool call will be.

Your response should be a JSON object with the following structure:
{
  "name": "tool_name",
  "args": {
    "arg_name": "arg_value"
  }
}

This represents a single tool call. This will be executed then the result of that will be given back to you to continue to the next step.

##Policies:
Search the knowledge base, communicate with the user, manage the thread's category and urgency. If you can draft a response.
`;
  }

  getMessage(eventLog: Event[]): string {
    return eventLog
      .map((event) => {
        return `
${event.timestamp} - ${event.type} - ${event.actor} - ${JSON.stringify(
          event.data
        )}
`;
      })
      .join("\n");
  }
}

export class DefaultContextGeneratorV2 extends ContextGenerator {
  constructor(toolManager: ToolManager) {
    super(toolManager);
  }

  static serializeTool(tool: ToolDefinition): string {
    // Convert zod schemas to standard JSON-Schema so the LLM receives a fully
    // machine-readable contract instead of the opaque `.toString()` output.
    const argsSchema = zodToJsonSchema(tool.args, "args");
    const resultSchema = zodToJsonSchema(tool.result, "result");

    return JSON.stringify(
      {
        name: tool.name,
        description: tool.description,
        args: argsSchema,
        result: resultSchema,
      },
      null,
      undefined
    );
  }
  serializeTools(): string {
    return this.toolManager
      .listTools()
      .map((tool) => DefaultContextGenerator.serializeTool(tool))
      .join("\n");
  }

  systemPromptTemplate = `
  
`;
  getSystemPrompt(): string {
    return `
You are a customer support agent. You are responsible for helping your supervisor gather context related to the support
email. 

You have access to the following tools:
${this.serializeTools()}

You will be given a list of events that have happened and your job is to determine what the next tool call will be.

## Policies:
- Always use the search_knowledge_base before the read_knowledge_base tool, since you need to know what articles are available to read.
- after calling search_knowledge_base or read_knowledge_base, you should call the summarize_useful_context tool to summarize the context for the user.
- After searching the knowledge base update urgency level and the category of the thread.
- If the issue needs user action, then call the user_action_needed tool and don't create any drafts
- If you are confident in drafting a high quality response, then call the compose_draft tool and then the finalize_draft tool.

Your response should be a JSON object with the following structure:
{
  "name": "tool_name",
  "args": {
    "arg_name": "arg_value"
  }
}

This represents a single tool call. This will be executed then the result of that will be given back to you to continue to the next step.
`;
  }

  private messageFormat(event: Event): string {
    console.log("event", event);
    switch (event.type) {
      default:
        return `
${event.timestamp} - ${event.type} - ${event.actor} - ${JSON.stringify(
          event.data
        )}
`;
    }
  }
  getMessage(eventLog: Event[]): string {
    let temp = eventLog.map((event) => this.messageFormat(event)).join("\n");

    console.log(temp);
    return temp;
  }
}
