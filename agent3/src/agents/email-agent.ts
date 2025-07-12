import {
  Agent,
  run,
  type AgentInputItem,
  RunItemStreamEvent,
  type RunStreamEvent,
} from '@openai/agents';
// import { z } from 'zod';
import { env } from '../config/environment.js';
import { emailSearchTool } from './tools/email-search.js';
import { emailTaggerTool } from './tools/email-tagger.js';
import { ragSearchTool } from './tools/rag-search.js';
import { writeDraftTool } from './tools/write-draft.js';
import { logStreamingToolCalls } from './log-actions.js';
import type { EmailMessage, DraftResponse, AgentAction } from '../db/types.js';
import { isRunItemStreamEvent, isMessageOutputItem } from './guards.js';
import {
  getThreadActions,
  getLatestEmailInThreadOrFail,
  getSortedEmailsByThreadId,
  getLatestDraftForThread,
} from '../db/query.js';

export type { EmailMessage };

// Minimum score threshold for attaching citations

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
4. Create draft email responses with proper citations

important: tag emails before you search the knowledge base.

When processing emails:
- You should ALWAYS use the email search tool to see if there is a history with the customer once before you do anything else
- Tag emails based on their content and intent. You should only call the email tag tool once and include all
   the tags you want to apply to the email. If a tag email tool call fails do not repeat it
- Use the rest of the tools only if they will be helpful to you.
  (IMPORTANT: use the exact email ID provided in the email metadata)
- Search knowledge base if the customer is asking a question
- Create a draft response using the write_draft tool
- IMPORTANT: If you used file search results to help construct your response, you MUST include the highest scoring citation by providing citationFilename, citationScore, and citationText when calling write_draft
- Maintain a professional and helpful tone
- Remember the entire email thread context when analyzing

Email metadata will be provided in the format:
[EMAIL_ID: <id>]
[THREAD_ID: <id>]

Process the provided email thread and create a draft response using the write_draft tool.
`;

// when you are ready to output your final response, output your final response in the following JSON format:
// {
//   "draft": {
//     "subject": "The subject line for the email response",
//     "email_body": "The body text of the email to send to the customer, without including the subject line"
//   },
//   "summary": "A brief summary of what happened and what actions were taken for the support agent to review"
export interface ProcessEmailResult {
  draft?: DraftResponse;
  actions: AgentAction[];
  history?: AgentInputItem[];
  error?: string;
}

function formatEmailForContext(email: EmailMessage, threadId?: number): string {
  let context = `[EMAIL_ID: ${email.id}]`;
  if (threadId) {
    context += `\n[THREAD_ID: ${threadId}]`;
  }
  context += `
From: ${email.from_email}
To: ${email.to_emails.join(', ')}
Subject: ${email.subject}

${email.body_text || ''}`;
  return context;
}

async function buildThreadContext(
  threadId: number | undefined,
  currentEmail: EmailMessage,
): Promise<string> {
  if (!threadId) {
    return formatEmailForContext(currentEmail, threadId);
  }

  const threadHistory = await getSortedEmailsByThreadId(threadId);

  if (threadHistory.length === 0) {
    return formatEmailForContext(currentEmail, threadId);
  }

  let context = 'Previous emails in this thread:\n\n';
  for (const msg of threadHistory) {
    if (msg.id !== currentEmail.id) {
      context += `---\n${formatEmailForContext(msg)}\n\n`;
    }
  }
  context += '---\nNew email to process:\n';
  context += formatEmailForContext(currentEmail, threadId);

  return context;
}

function createAgent() {
  return new Agent({
    name: 'EmailProcessor',
    instructions: SYSTEM_PROMPT,
    tools: [emailSearchTool, emailTaggerTool, ragSearchTool, writeDraftTool],
    model: env.OPENAI_MODEL,
  });
}

async function processStreamingEvents(
  result: AsyncIterable<RunStreamEvent>,
  threadId: number,
  logger: (message: unknown) => void,
): Promise<AgentAction[]> {
  const actions: AgentAction[] = [];
  let lastEvent: RunItemStreamEvent | undefined;

  for await (const event of result) {
    // Agent SDK specific events
    if (isRunItemStreamEvent(event)) {
      const actResult = await logStreamingToolCalls(event, threadId, lastEvent);
      if (actResult && actResult.length > 0) {
        actions.push(actResult[0]);
      }
      lastEvent = event;
      logger(event);

      const item = event.item;
      if (isMessageOutputItem(item)) {
        logger(item.rawItem);
      }
    }
  }

  return actions;
}

export async function processEmail(
  threadId: number,
  logger: (message: unknown) => void = console.log,
): Promise<ProcessEmailResult> {
  // Fetch the latest email in the thread
  const email = (await getLatestEmailInThreadOrFail(threadId)) as EmailMessage;

  // Create agent and build context
  const agent = createAgent();
  const fullMessage = await buildThreadContext(threadId, email);

  logger('running agent in streaming mode');
  // Run the agent in streaming mode
  const result = await run(agent, fullMessage, { maxTurns: 100, stream: true });

  // Process streaming events and collect actions
  const actions = await processStreamingEvents(result, threadId, logger);

  await result.completed;

  // Tool calls and actions are already logged in the streaming loop above

  // Log all output for debugging
  logger('START OUTPUT BLOCK');
  result.output.forEach(item => {
    logger(JSON.stringify(item, null, 2));
  });

  // Get the draft that was created by the write_draft tool
  const draft = await getLatestDraftForThread(threadId);

  if (!draft) {
    return {
      actions,
      history: result.history,
      error: 'No draft was created. Agent may have failed to call write_draft tool.',
    };
  }

  return {
    draft,
    actions,
    history: result.history,
  };
}

// Utility functions for backwards compatibility with tests
export { getThreadActions };
