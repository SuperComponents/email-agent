import { z } from "zod";
import { ToolDefinition } from "./context/tools";

import { OpenAI } from "openai";
import { OPENAI_API_KEY, OPENAI_VECTOR_STORE_KEY } from "./env";

export class SummarizeUsefulContextTool extends ToolDefinition {
  name = "summarize_useful_context";
  description =
    "Store a summary of the useful context from the event log to communicate to the user. This is useful to keep good track of the useful context from a knowledge base search.";
  args = z.object({
    summary: z.string(),
    key_points: z.array(z.string()),
    recommended_actions: z.array(z.string()),
  });
  result = z.object({});

  async execute(args: z.infer<typeof this.args>) {
    return {};
  }
}

export class UpdateThreadUrgencyTool extends ToolDefinition {
  name = "update_thread_urgency";
  description = "Update the urgency level of a support thread";
  args = z.object({
    thread_id: z.string().describe("The thread ID to update"),
    urgency: z
      .enum(["low", "medium", "high", "urgent"])
      .describe("New urgency level"),
  });
  result = z.object({
    thread_id: z.string(),
    old_urgency: z.string(),
    new_urgency: z.string(),
    updated_at: z.string(),
  });

  async execute(args: z.infer<typeof this.args>) {
    // Mock implementation
    return {
      thread_id: args.thread_id,
      old_urgency: "medium",
      new_urgency: args.urgency,
      updated_at: new Date().toISOString(),
    };
  }
}

export class UpdateThreadCategoryTool extends ToolDefinition {
  name = "update_thread_category";
  description = "Update the category of a support thread";
  args = z.object({
    thread_id: z.string().describe("The thread ID to update"),
    category: z.string().describe("New category for the thread"),
  });
  result = z.object({
    thread_id: z.string(),
    old_category: z.string(),
    new_category: z.string(),
    updated_at: z.string(),
  });

  async execute(args: z.infer<typeof this.args>) {
    // Mock implementation
    return {
      thread_id: args.thread_id,
      old_category: "general",
      new_category: args.category,
      updated_at: new Date().toISOString(),
    };
  }
}

export class ComposeDraftToolMock extends ToolDefinition {
  name = "compose_draft";
  description =
    "Provides all of the gathered context to another LLM to cleanly write a response";
  args = z.object({
    context: z
      .string()
      .describe("The gathered context for composing the draft"),
    tone: z
      .enum(["professional", "friendly", "empathetic", "technical"])
      .optional()
      .default("professional"),
    customer_name: z
      .string()
      .optional()
      .describe("Customer name for personalization"),
  });
  result = z.object({
    draft: z.string(),
    confidence_score: z.number(),
    suggestions: z.array(z.string()),
  });

  async execute(args: z.infer<typeof this.args>) {
    // Mock implementation
    const customerGreeting = args.customer_name
      ? `Hi ${args.customer_name},`
      : "Hi there,";
    return {
      draft: `${customerGreeting}

Thank you for reaching out to us. I understand you're experiencing some difficulties, and I'm here to help.

Based on your description, I've found some relevant information that should resolve your issue. Please follow these steps:

1. [Step 1 based on context]
2. [Step 2 based on context]
3. [Step 3 based on context]

If you continue to experience issues after following these steps, please don't hesitate to reach out again.

Best regards,
Support Team`,
      confidence_score: 0.85,
      suggestions: [
        "Consider adding more specific troubleshooting steps",
        "Include relevant knowledge base article links",
        "Add estimated resolution time",
      ],
    };
  }
}

export class UserActionNeededTool extends ToolDefinition {
  name = "user_action_needed";
  description = "Flag that human intervention is required for this thread";
  args = z.object({
    thread_id: z.string().describe("The thread ID that needs human attention"),
    reason: z.string().describe("Reason why human action is needed"),
    priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
    suggested_actions: z
      .array(z.string())
      .optional()
      .describe("Suggested actions for the human"),
  });
  result = z.object({
    thread_id: z.string(),
    flagged_at: z.string(),
    reason: z.string(),
    priority: z.string(),
    status: z.string(),
  });

  async execute(args: z.infer<typeof this.args>) {
    // Mock implementation
    return {
      thread_id: args.thread_id,
      flagged_at: new Date().toISOString(),
      reason: args.reason,
      priority: args.priority,
      status: "flagged_for_human_review",
    };
  }
}

export class FinalizeDraftTool extends ToolDefinition {
  name = "finalize_draft";
  description = "Finalize and prepare the draft response for sending";
  args = z.object({
    thread_id: z.string().describe("The thread ID"),
    draft: z.string().describe("The draft response to finalize"),
    include_signature: z.boolean().optional().default(true),
  });
  result = z.object({
    thread_id: z.string(),
    final_draft: z.string(),
    ready_to_send: z.boolean(),
    finalized_at: z.string(),
  });

  async execute(args: z.infer<typeof this.args>) {
    // Mock implementation
    const signature = args.include_signature
      ? "\n\nBest regards,\nProResponse AI Support Team"
      : "";
    return {
      thread_id: args.thread_id,
      final_draft: args.draft + signature,
      ready_to_send: true,
      finalized_at: new Date().toISOString(),
    };
  }
}

// Export all tool classes for easy registration
export const ALL_MOCK_TOOLS = {
  SummarizeUsefulContextTool,
  UpdateThreadUrgencyTool,
  UpdateThreadCategoryTool,
  ComposeDraftToolMock,
  UserActionNeededTool,
  FinalizeDraftTool,
};
