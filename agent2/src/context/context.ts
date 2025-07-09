import { Event } from "../types";
import ToolManager from "./tools";



abstract class ContextGenerator {
  // This is an abstract class that will be implemented by the various context generators.
  // The different context generators will allow for testing of different system prompts and context strategies.

  constructor(protected eventLog: Event[], protected toolManager: ToolManager) {
    
  }

  abstract getSystemPrompt(): string;


  abstract getMessage(): string;
}

export class DefaultContextGenerator extends ContextGenerator {
  constructor(eventLog: Event[], toolManager: ToolManager) {
    super(eventLog, toolManager);
  }

  systemPromptTemplate = `
  
`
  getSystemPrompt(): string {
    return `
You are a customer support agent. You are responsible for helping your supervisor gather context related to the support
email. 

You have access to the following tools:
${this.toolManager.serialize()}

You will be given a list of events that have happened and your job is to determine what the next tool call will be.

Your response should be a JSON object with the following structure:
{
  "name": "tool_name",
  "args": {
    "arg_name": "arg_value"
  }
}

This represents a single tool call. This will be executed then the result of that will be given back to you to continue to the next step.
`
  }

  getMessage(): string {
    return this.eventLog.map(event => {
      return `
${event.timestamp} - ${event.type} - ${event.actor} - ${JSON.stringify(event.data)}
`
    }).join('\n');
  }
}