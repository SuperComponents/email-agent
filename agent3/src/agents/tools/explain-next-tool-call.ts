import { tool } from '@openai/agents';
import { z } from 'zod';

const ExplainNextToolCallParamsSchema = z.object({
  explanation: z
    .string()
    .describe('A brief explanation of what you plan to do with your next tool call'),
  nextToolName: z
    .string()
    .describe(
      'The name of the tool you plan to use next (e.g., get_customer_history, search_customer_emails, tag_email, search_knowledge_base, write_draft)',
    ),
});

type ExplainNextToolCallParams = z.infer<typeof ExplainNextToolCallParamsSchema>;

export const explainNextToolCallTool = tool({
  name: 'explain_next_tool_call',
  description: `Use this tool to explain what you're about to do with your next tool call. This helps provide transparency about your decision-making process.

You must specify:
1. explanation: What you plan to do and why
2. nextToolName: The exact name of the tool you'll use next

Examples:
- explanation: "I'll get the complete email history for this customer to understand their interaction context"
  nextToolName: "get_customer_history"
- explanation: "I'll search for previous emails with this customer about refunds to understand their billing history"
  nextToolName: "search_customer_emails"
- explanation: "I'm going to tag this email as spam because it contains suspicious links and generic content"
  nextToolName: "tag_email"
- explanation: "I'll search the knowledge base for information about our refund policy to answer their question"
  nextToolName: "search_knowledge_base"`,
  parameters: ExplainNextToolCallParamsSchema,
  execute: (input: ExplainNextToolCallParams) => {
    // Log the explanation with the next tool name
    console.log(`🤔 Next action: ${input.explanation} [Next tool: ${input.nextToolName}]`);
    return {
      success: true,
      message: 'Explanation noted',
      nextToolCall: input.nextToolName,
    };
  },
});
