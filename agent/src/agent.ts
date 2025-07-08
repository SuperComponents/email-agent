import { openai } from './openaiClient';
import { tools, handleToolCall } from './tools';

// Simple result interface for the support agent assistant
export interface AgentResponse {
  draft: string;           // The drafted response
  reasoning: string;       // The agent's reasoning process
}

/**
 * Core support agent assistant function
 * Assists the support person by analyzing the customer email and drafting a response
 * @param customerEmail - The raw customer email text
 * @param context - Additional context the support person wants to provide
 * @param preferredModel - OpenAI model to use (defaults to gpt-4o)
 * @returns Promise<AgentResponse> - The drafted response and reasoning
 */
export async function assistSupportPerson(
  customerEmail: string, 
  context: string = '', 
  preferredModel: string = 'gpt-4o'
): Promise<AgentResponse> {
  
  console.log(`[Agent] Analyzing customer email and drafting response...`);
  
  // Create a focused prompt for the support agent assistant
  const systemPrompt = `You are a support agent assistant helping a human support person.
  
Your role:
- Analyze the customer email and draft a helpful response
- Be empathetic, professional, and solution-focused
- Always provide clear next steps
- Sign off with "Best regards,\\nCustomer Support Team"
- Use a friendly but professional tone
- Keep responses concise but complete
- Never make promises the company cannot keep

Think step-by-step about:
1. What is the customer's main issue or request?
2. What would be an appropriate response?
3. What next steps should be provided?

Format your response as:
REASONING: [Your step-by-step analysis]
DRAFT: [The email response in markdown format]`;

  const userPrompt = `Customer Email:
${customerEmail}

${context ? `Additional Context from Support Person:\n${context}` : ''}

Please analyze this email and draft a response.`;

  // Create assistant for this specific task
  const assistant = await openai.beta.assistants.create({
    name: 'Support Agent Assistant',
    instructions: systemPrompt,
    tools,
    model: preferredModel
  });

  console.log(`[Agent] Assistant created with id: ${assistant.id}`);

  // Create thread and run
  const thread = await openai.beta.threads.create();
  console.log(`[Agent] Thread created with id: ${thread.id}`);
  
  await openai.beta.threads.messages.create(thread.id, { 
    role: 'user', 
    content: userPrompt 
  });

  let run = await openai.beta.threads.runs.create(thread.id, { 
    assistant_id: assistant.id 
  });

  console.log(`[Agent] Run started with id: ${run.id}`);

  try {
    // Handle run lifecycle
    while (true) {
      console.log(`[Agent] Run status: ${run.status}`);

      if (['failed', 'expired', 'cancelled'].includes(run.status)) {
        throw new Error(`Run failed with status: ${run.status}`);
      }

      if (run.status === 'requires_action') {
        const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls || [];
        console.log(`[Agent] Processing ${toolCalls.length} tool call(s)`);
        
        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => ({
            tool_call_id: toolCall.id,
            output: await handleToolCall(toolCall.function.name, JSON.parse(toolCall.function.arguments))
          }))
        );

        run = await openai.beta.threads.runs.submitToolOutputs(
          thread.id,
          run.id, 
          { 
            tool_outputs: toolOutputs 
          }
        );
        continue;
      }

      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread.id);
        const assistantMessage = messages.data.find((m) => m.role === 'assistant');
        const responseText = (assistantMessage?.content[0] as any)?.text?.value || '';
        
        console.log(`[Agent] Response received, processing...`);
        
        // Parse the response to extract reasoning and draft
        const reasoningMatch = responseText.match(/REASONING:\s*(.*?)(?=DRAFT:|$)/s);
        const draftMatch = responseText.match(/DRAFT:\s*(.*)/s);
        
        const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'No reasoning provided';
        const draft = draftMatch ? draftMatch[1].trim() : responseText;
        
        console.log(`[Agent] Draft completed successfully`);
        
        return {
          draft,
          reasoning
        };
      }

      // Continue polling
      await new Promise(resolve => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(thread.id, run.id);
    }

  } catch (error) {
    console.error(`[Agent] Error in assistSupportPerson:`, error);
    throw error;
  }
} 