import { Agent, run } from '@openai/agents';
import { env } from '../config/environment';
import { emailSearchTool } from './tools/email-search';
import { emailTaggerTool } from './tools/email-tagger';
import { ragSearchTool } from './tools/rag-search';
import { db } from '../db/db';
import { emails, threads, draft_responses, agentActions } from '../db/newschema';
import { eq } from 'drizzle-orm';
import { logAndProcessToolCalls } from './log-actions';
import type { EmailMessage, DraftResponse, AgentAction } from '../db/types';

export type { EmailMessage };

const SYSTEM_PROMPT = `You are an intelligent customer support email assistant. You help process and respond to customer emails.

Your capabilities:
1. Search through a customer's email history to understand context
2. Search the company knowledge base for relevant information
3. Tag emails appropriately (spam, legal, sales, support, billing, technical, general)
4. Generate helpful responses to customer inquiries

When processing emails:
- Always search for previous emails from the same sender to understand history
- Tag emails based on their content and intent
- Use the knowledge base to find relevant help articles
- Generate a helpful response that answers the customer's questions
- Maintain a professional and helpful tone
- Remember the entire email thread context when analyzing

Current task: Process the incoming email and:
1. Search for the sender's email history
2. Tag the email appropriately (IMPORTANT: use the exact email ID provided in the email metadata)
3. Search knowledge base if the customer is asking a question
4. Generate a helpful response that addresses the customer's inquiry

Email metadata will be provided in the format:
[EMAIL_ID: <id>]`;

export interface ProcessEmailResult {
  draft: DraftResponse;
  actions: AgentAction[];
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

async function createAgent(): Promise<Agent> {
  return new Agent({
    name: 'EmailProcessor',
    instructions: SYSTEM_PROMPT,
    tools: [emailSearchTool, emailTaggerTool, ragSearchTool],
    model: env.OPENAI_MODEL,
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
  email: EmailMessage,
  threadId?: number
): Promise<ProcessEmailResult> {
  // Ensure we have a valid thread ID
  if (!threadId) {
    // Create a new thread if one doesn't exist
    const [thread] = await db
      .insert(threads)
      .values({
        subject: email.subject,
        participant_emails: [email.from_email, ...email.to_emails],
        status: 'active',
      })
      .returning();
    threadId = thread.id;
  }

  // Create agent and build context
  const agent = await createAgent();
  const fullMessage = await buildThreadContext(threadId, email);

  // Run the agent
  const result = await run(agent, fullMessage);

  // Log all tool calls and actions
  const actions = await logAndProcessToolCalls(result.output, threadId);

  // Save the draft response
  const draft = await saveDraftResponse(
    email.id,
    threadId,
    result.finalOutput as string,
    0.85 // Default confidence score, could be calculated based on tool results
  );

  return {
    draft,
    actions,
  };
}

// Utility functions for backwards compatibility with tests
export { getThreadActions };
