import {
  Agent,
  run,
  user,
  type AgentInputItem,
  RunItemStreamEvent,
  type RunStreamEvent,
} from '@openai/agents';
import { env } from '../config/environment.js';
// import { logAgentRunResult, logAgentHistory } from '../utils/log-agent-result-to-json.js';
import { readThreadTool } from './tools/read-thread.js';
import { getCustomerHistoryTool } from './tools/get-customer-history.js';
import { searchCustomerEmailsTool } from './tools/search-customer-emails.js';
import { emailTaggerTool } from './tools/email-tagger.js';
import { ragSearchTool } from './tools/rag-search.js';
import { writeDraftTool } from './tools/write-draft.js';
import { explainNextToolCallTool } from './tools/explain-next-tool-call.js';
import { logCall, logStreamingToolCalls } from './log-actions.js';
import type { EmailMessage, DraftResponse, AgentAction } from '../db/types.js';
import { isRunItemStreamEvent } from './guards.js';
import {
  getThreadActionHistory,
  getLatestEmailInThreadOrFail,
  getSortedEmailsByThreadId,
  getSortedEmailsWithTagsByThreadId,
  getLatestDraftForThread,
} from '../db/query.js';
import { SYSTEM_PROMPT } from './system-prompt.js';

export type { EmailMessage };

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

// Keeping for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  return new Agent<EmailContext>({
    name: 'EmailProcessor',
    instructions: SYSTEM_PROMPT,
    tools: [
      readThreadTool,
      explainNextToolCallTool,
      getCustomerHistoryTool,
      searchCustomerEmailsTool,
      emailTaggerTool,
      ragSearchTool,
      writeDraftTool,
    ],
    model: env.OPENAI_MODEL,
    modelSettings: {
      temperature: 0.5,
    },
  });
}

async function processStreamingEvents(
  result: AsyncIterable<RunStreamEvent>,
  threadId: number,
  logger: (message: unknown) => void,
): Promise<AgentAction[]> {
  const actions: AgentAction[] = [];
  let lastEvent: RunItemStreamEvent | undefined;

  logger('START PROCESSING EVENTS');
  for await (const event of result) {
    // Agent SDK specific events
    if (isRunItemStreamEvent(event)) {
      if (event.item.type === 'reasoning_item') {
        console.log('🤔  WHY:', event.item.rawItem.content.map(c => c.text).join('\n'));
      }
      const actResult = await logStreamingToolCalls(event, threadId, lastEvent);
      if (actResult && actResult.length > 0) {
        actions.push(actResult[0]);
      }
      lastEvent = event;
    }
  }

  return actions;
}

interface EmailContext {
  emails: EmailMessage[];
}

export async function processEmail(
  threadId: number,
  logger: (message: unknown) => void = console.log,
  userMessage: string = 'Process the latest email in this thread and create an appropriate response.',
): Promise<ProcessEmailResult> {
  // Fetch the latest email in the thread - kept for validation but not used directly
  await getLatestEmailInThreadOrFail(threadId);

  // Create agent and build context
  const agent = createAgent();

  // Get all emails in the thread for context (including tags)
  const threadEmails = await getSortedEmailsWithTagsByThreadId(threadId);

  logger('running agent in streaming mode');
  logger(threadEmails);
  // Run the agent in streaming mode

  // Create the context with all emails in the thread
  const context: EmailContext = {
    emails: threadEmails,
  };

  // Get previous agent actions for this thread as history
  const previousActions = await getThreadActionHistory(threadId);
  const history: AgentInputItem[] = [...previousActions, user(userMessage)];

  const result = await run(agent, history, {
    maxTurns: 100,
    stream: true,
    context,
  });

  await logCall(user(userMessage), threadId);

  // Process streaming events and collect actions
  const actions = await processStreamingEvents(result, threadId, logger);

  await result.completed;

  // Log the raw agent result
  // logAgentRunResult(result);

  // Log the history separately
  // logAgentHistory(result.history);

  // Get the draft that was created by the write_draft tool
  // TODO: existing draft doesn't necessarily mean we created one
  const draft = await getLatestDraftForThread(threadId);

  let finalResult: ProcessEmailResult;

  if (!draft) {
    finalResult = {
      actions,
      history: result.history,
      error: 'No draft was created. Agent may have failed to call write_draft tool.',
    };
  } else {
    finalResult = {
      draft,
      actions,
      history: result.history,
    };
  }

  return finalResult;
}
