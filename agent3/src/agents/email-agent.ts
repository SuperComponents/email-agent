import { Agent, run, type AgentInputItem, RunItemStreamEvent } from '@openai/agents';
// import { z } from 'zod';
import { env } from '../config/environment.js';
import { emailSearchTool } from './tools/email-search.js';
import { emailTaggerTool } from './tools/email-tagger.js';
import { ragSearchTool } from './tools/rag-search.js';
import { db } from '../db/db.js';
import { emails, draft_responses, agentActions } from '../db/newschema.js';
import { eq, desc } from 'drizzle-orm';
import { logStreamingToolCalls } from './log-actions.js';
import type { EmailMessage, DraftResponse, AgentAction } from '../db/types.js';

export type { EmailMessage };

// const EmailResponseSchema = z.object({
//   draft: z.object({
//     subject: z.string().describe('The subject line for the email response'),
//     email_body: z.string().describe('The body text of the email to send to the customer, without subject line')
//   }),
//   summary: z.string().describe('A brief summary of what happened and what actions were taken for the support agent to review')
// });

// type EmailResponse = z.infer<typeof EmailResponseSchema>;

const SYSTEM_PROMPT = `You are an intelligent customer support email assistant. You help process and respond to customer emails.

Your capabilities:
1. Search through a customer's email history to understand context
2. Tag emails appropriately (spam, legal, sales, support, billing, technical, general)
3. Search the company knowledge base for relevant information
4. Generate helpful responses to customer inquiries

important: tag emails before you search the knowledge base. your last message should include the annotations

When processing emails:
- You should ALWAYS use the email search tool to see if there is a history with the customer once before you do anything else
- Tag emails based on their content and intent. You should only call the email tag tool once and include all
   the tags you want to apply to the email. If a tag email tool call fails do not repeat it
- Use the rest of the tools only if they will be helpful to you.
  (IMPORTANT: use the exact email ID provided in the email metadata)
- Search knowledge base if the customer is asking a question
- Generate a helpful response that answers the customer's questions
- Maintain a professional and helpful tone
- Remember the entire email thread context when analyzing

IMPORTANT: if you use the results of the knowledge base search tool you should include citations to the source files in your response

Email metadata will be provided in the format:
[EMAIL_ID: <id>]

process the provided email thread

your final response should be just the email body of your draft response, and annotations if you used the RAG tool
`;

// when you are ready to output your final response, output your final response in the following JSON format:
// {
//   "draft": {
//     "subject": "The subject line for the email response",
//     "email_body": "The body text of the email to send to the customer, without including the subject line"
//   },
//   "summary": "A brief summary of what happened and what actions were taken for the support agent to review"
export interface ProcessEmailResult {
  draft: DraftResponse;
  actions: AgentAction[];
  // summary: string;
  history?: AgentInputItem[];
}

async function loadEmailThread(threadId: number): Promise<EmailMessage[]> {
  return db
    .select()
    .from(emails)
    .where(eq(emails.thread_id, threadId))
    .orderBy(emails.created_at) as Promise<EmailMessage[]>
}

function formatEmailForContext(email: EmailMessage): string {
  return `[EMAIL_ID: ${email.id}]
From: ${email.from_email}
To: ${email.to_emails.join(', ')}
Subject: ${email.subject}

${email.body_text || ''}`;
}

async function buildThreadContext(threadId: number | undefined, currentEmail: EmailMessage): Promise<string> {
  if (!threadId) {
    return formatEmailForContext(currentEmail);
  }

  const threadHistory = await loadEmailThread(threadId);
  
  if (threadHistory.length === 0) {
    return formatEmailForContext(currentEmail);
  }

  let context = 'Previous emails in this thread:\n\n';
  for (const msg of threadHistory) {
    if (msg.id !== currentEmail.id) {
      context += `---\n${formatEmailForContext(msg)}\n\n`;
    }
  }
  context += '---\nNew email to process:\n';
  context += formatEmailForContext(currentEmail);
  
  return context;
}

async function createAgent() {
  return new Agent({
    name: 'EmailProcessor',
    instructions: SYSTEM_PROMPT,
    tools: [emailSearchTool, emailTaggerTool, ragSearchTool],
    model: env.OPENAI_MODEL,
    // outputType: EmailResponseSchema
  });
}

async function saveDraftResponse(
  email_id: number,
  thread_id: number,
  generated_content: string,
  confidence?: number
): Promise<DraftResponse> {
  const [draft] = await db
    .insert(draft_responses)
    .values({
      email_id,
      thread_id,
      generated_content,
      status: 'pending',
      confidence_score: confidence ? confidence.toFixed(3) : null,
    })
    .returning();
  
  return draft;
}

async function getThreadActions(threadId: number): Promise<AgentAction[]> {
  return db
    .select()
    .from(agentActions)
    .where(eq(agentActions.thread_id, threadId))
    .orderBy(agentActions.created_at) as Promise<AgentAction[]>
}

export async function processEmail(
  threadId: number, 
  logger: (message: any) => void = console.log
): Promise<ProcessEmailResult> {
  // Fetch the latest email in the thread
  const [latestEmail] = await db
    .select()
    .from(emails)
    .where(eq(emails.thread_id, threadId))
    .orderBy(desc(emails.created_at))
    .limit(1);
  
  if (!latestEmail) {
    throw new Error(`No emails found in thread ${threadId}`);
  }

  // Convert to EmailMessage format
  const email: EmailMessage = {
    id: latestEmail.id,
    from_email: latestEmail.from_email,
    to_emails: latestEmail.to_emails as string[],
    subject: latestEmail.subject,
    body_text: latestEmail.body_text,
    created_at: latestEmail.created_at,
  };

  // Create agent and build context
  const agent = await createAgent();
  const fullMessage = await buildThreadContext(threadId, email);

  logger('running agent in streaming mode');
  // Run the agent in streaming mode
  const result = await run(agent, fullMessage, { maxTurns: 100, stream: true });

  let actions: AgentAction[] = [];
  let lastEvent: RunItemStreamEvent | undefined;
  for await (const event of result) {
//     if (event.type == 'agent_updated_stream_event') {
//       logger(event);
//     }
    // Agent SDK specific events
    if (event.type === 'run_item_stream_event') {
      const actResult = await logStreamingToolCalls(event, threadId, lastEvent)
      if (actResult && actResult.length > 0) {
        actions.push(actResult[0]);
      }
      lastEvent = event;
      logger(event);

      const item = event.item;
      if (item && item.type === 'message_output_item') {
        logger(item.rawItem);
      }
    }
  }


  await result.completed;

  // Log all tool calls and actions
  // const actions = await logAndProcessToolCalls(result.output, threadId);

  // Parse the structured output - finalOutput is already typed from the schema
  // const structuredOutput = result.finalOutput as EmailResponse;
  const structuredOutput = result.finalOutput
  
  logger('START OUTPUT BLOCK');
  result.output.forEach((item) => {
    logger(JSON.stringify(item, null, 2));
    if (item.type === 'hosted_tool_call') {
      logger('IN HOSTED TOOL CALL');
      logger(item?.providerData?.results);
      
      // Find the result with the highest score
      const results = item?.providerData?.results;
      if (results && Array.isArray(results) && results.length > 0) {
        const highestScoringResult = results.reduce((highest, current) => {
          return (current.score > highest.score) ? current : highest;
        }, results[0]);
        
        logger('HIGHEST SCORING RESULT:');
        logger({
          filename: highestScoringResult.filename,
          score: highestScoringResult.score,
          text: highestScoringResult.text?.substring(0, 200) + '...' // First 200 chars
        });
      }
    }
  });
  // Save the draft response
  const draft = await saveDraftResponse(
    email.id,
    threadId,
    structuredOutput!,
    0.85 // Default confidence score, could be calculated based on tool results
  );

  return {
    draft,
    actions,
    // summary: structuredOutput.summary,
    history: result.history,
  };
}

// Utility functions for backwards compatibility with tests
export { getThreadActions };
