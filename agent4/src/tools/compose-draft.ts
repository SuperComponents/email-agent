import { ToolDefinition } from "../context/tools";
import { z } from "zod";
import openai from "../openai";

export default class ComposeDraftTool extends ToolDefinition {
  name = "compose-draft";
  description =
    "Compose a draft email response based on the customer's email and relevant context. Use this to generate professional, helpful responses that address the customer's needs.";

  args = z.object({
    customerEmail: z.string().describe("The original customer email content"),
    context: z
      .string()
      .optional()
      .describe(
        "Additional context from knowledge base or previous interactions"
      ),
    tone: z
      .enum(["professional", "friendly", "apologetic", "urgent"])
      .default("professional")
      .describe("The tone of the response"),
    emailType: z
      .enum([
        "support",
        "billing",
        "feature_request",
        "bug_report",
        "feedback",
        "general",
      ])
      .describe("The type of email being responded to"),
  });

  result = z.object({
    subject: z.string().describe("Suggested subject line for the response"),
    body: z.string().describe("The composed email body"),
    priority: z
      .enum(["low", "medium", "high", "urgent"])
      .describe("Suggested priority level"),
    tags: z.array(z.string()).describe("Suggested tags for categorization"),
  });

  async execute(args: z.infer<typeof this.args>) {
    const { customerEmail, context, tone, emailType } = args;

    const systemPrompt = `You are a professional customer support agent. Your role is to compose helpful, accurate, and empathetic email responses to customers.

Guidelines:
- Be professional and courteous
- Address the customer's specific concerns
- Use the provided context to give accurate information
- Keep responses concise but complete
- Include next steps when appropriate
- Match the requested tone: ${tone}
- This is a ${emailType} type of email
- Do not include a signature section

If you cannot fully address their request, acknowledge this and explain what additional information or steps are needed.`;

    const userPrompt = `Please compose a draft email response for this customer email:

Customer Email:
${customerEmail}

${
  context
    ? `Additional Context:
${context}`
    : ""
}

Please provide:
- A complete email body, no other text or formatting.

Don't include markdown formatting. Just use plain text and whitespace.

Don't include any empty fields for the user to fill in. the draft must be ready to send without edit.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No response generated");
      }

      // Parse the response to extract components
      const lines = content.split("\n");
      let subject = "";
      let body = "";
      let priority: "low" | "medium" | "high" | "urgent" = "medium";
      let tags: string[] = [];

      let currentSection = "";
      let bodyLines: string[] = [];

      for (const line of lines) {
        if (line.toLowerCase().includes("subject:")) {
          subject = line.replace(/subject:\s*/i, "").trim();
        } else if (line.toLowerCase().includes("priority:")) {
          const priorityMatch = line
            .toLowerCase()
            .match(/priority:\s*(low|medium|high|urgent)/);
          if (priorityMatch) {
            priority = priorityMatch[1] as "low" | "medium" | "high" | "urgent";
          }
        } else if (line.toLowerCase().includes("tags:")) {
          const tagsText = line.replace(/tags:\s*/i, "").trim();
          tags = tagsText
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
        } else if (
          line.toLowerCase().includes("email body:") ||
          line.toLowerCase().includes("response:")
        ) {
          currentSection = "body";
        } else if (currentSection === "body" && line.trim()) {
          bodyLines.push(line);
        }
      }

      // If we couldn't parse structured output, use the whole content as body
      if (!body && bodyLines.length === 0) {
        body = content;
      } else {
        body = bodyLines.join("\n").trim();
      }

      // Set defaults if not found
      if (!subject) {
        subject = `Re: Your ${emailType} inquiry`;
      }

      if (tags.length === 0) {
        tags = [emailType];
      }

      return {
        subject,
        body,
        priority,
        tags,
      };
    } catch (error) {
      console.error("Error composing draft:", error);
      throw new Error(
        `Failed to compose draft: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }
}
