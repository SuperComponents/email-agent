import OpenAI from "openai";
import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

// Define zod schema for LLMResponse
export const ToolCallSchema = z.object({
  name: z.string(),
  args: z.record(z.any()),
});
export interface LLMResponse {
  tool_call: z.infer<typeof ToolCallSchema>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class LLMClient {
  private client: OpenAI;

  constructor(readonly model: string = "gpt-4o", apiKey?: string) {
    this.client = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  async getNextToolCall(
    systemPrompt: string,
    message: string
  ): Promise<LLMResponse> {
    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const choice = response.choices[0];
      if (!choice.message?.content) {
        throw new Error("No content in LLM response");
      }
      // Parse and validate the JSON response using zod
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(choice.message.content);
      } catch (error) {
        throw new Error("LLM response is not valid JSON");
      }

      // Validate the response structure
      const validationResult = ToolCallSchema.safeParse(parsedResponse);
      if (!validationResult.success) {
        throw new Error(
          `LLM response validation failed: ${validationResult.error.message}`
        );
      }

      const validatedResponse = validationResult.data;

      return {
        tool_call: validatedResponse,
        usage: response.usage
          ? {
              prompt_tokens: response.usage.prompt_tokens,
              completion_tokens: response.usage.completion_tokens,
              total_tokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      console.error("LLM call failed:", error);
      throw error;
    }
  }
}
