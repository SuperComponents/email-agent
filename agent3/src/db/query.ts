import { db } from './db.js';
import { emails, agentActions, draft_responses, emailTags } from './schema.js';
import { eq, desc, and, like, inArray } from 'drizzle-orm';
import type { Email, AgentAction, EmailMessage, DraftResponse } from './types.js';
import type { KnowledgeBaseResult } from '../agents/guards.js';
import type { AgentInputItem } from '@openai/agents';

export async function getThreadActions(threadId: number): Promise<AgentAction[]> {
  return db
    .select()
    .from(agentActions)
    .where(eq(agentActions.thread_id, threadId))
    .orderBy(agentActions.created_at) as Promise<AgentAction[]>;
}

export async function getThreadActionHistory(threadId: number): Promise<AgentInputItem[]> {
  const actions = await db
    .select()
    .from(agentActions)
    .where(eq(agentActions.thread_id, threadId))
    .orderBy(agentActions.created_at);

  // Map to metadata property, which is always an AgentInputItem
  return actions.map(action => action.metadata as AgentInputItem);
}

export async function getLatestEmailInThreadOrFail(threadId: number): Promise<Email> {
  const [latestEmail] = await db
    .select()
    .from(emails)
    .where(eq(emails.thread_id, threadId))
    .orderBy(desc(emails.created_at))
    .limit(1);

  if (!latestEmail) {
    throw new Error(`No emails found in thread ${threadId}`);
  }

  return latestEmail as Email;
}

export async function getEmailById(emailId: number): Promise<Email | null> {
  const [email] = await db.select().from(emails).where(eq(emails.id, emailId)).limit(1);

  return email as Email | null;
}

export async function searchEmails(
  senderEmail: string,
  query?: string,
  limit: number = 10,
): Promise<EmailMessage[]> {
  const conditions = [eq(emails.from_email, senderEmail)];

  if (query && query.trim() !== '') {
    conditions.push(like(emails.body_text, `%${query}%`));
  }

  const emails_result = (await db.query.emails.findMany({
    where: and(...conditions),
    orderBy: [desc(emails.created_at)],
    limit,
  })) as EmailMessage[];

  return emails_result;
}

export async function getSortedEmailsByThreadId(threadId: number): Promise<EmailMessage[]> {
  return db
    .select()
    .from(emails)
    .where(eq(emails.thread_id, threadId))
    .orderBy(emails.created_at) as Promise<EmailMessage[]>;
}

export async function getSortedEmailsWithTagsByThreadId(threadId: number): Promise<EmailMessage[]> {
  // First, get all emails for the thread
  const emailsList = await db
    .select()
    .from(emails)
    .where(eq(emails.thread_id, threadId))
    .orderBy(emails.created_at);

  // Get all email tags for these emails
  const emailIds = emailsList.map(email => email.id);
  
  let allTags: typeof emailTags.$inferSelect[] = [];
  if (emailIds.length > 0) {
    // Query email tags for all emails in the thread
    allTags = await db
      .select()
      .from(emailTags)
      .where(inArray(emailTags.email_id, emailIds));
  }

  // Group tags by email_id
  const tagsByEmailId = allTags.reduce((acc, tag) => {
    if (!acc[tag.email_id]) {
      acc[tag.email_id] = [];
    }
    acc[tag.email_id].push(tag);
    return acc;
  }, {} as Record<number, typeof emailTags.$inferSelect[]>);

  // Transform the result to match EmailMessage interface
  return emailsList.map(email => ({
    id: email.id,
    from_email: email.from_email,
    to_emails: email.to_emails as string[],
    subject: email.subject,
    body_text: email.body_text,
    created_at: email.created_at,
    tags: tagsByEmailId[email.id] || [],
  }));
}

interface SaveDraftResponseParams {
  email_id: number;
  thread_id: number;
  generated_content: string;
  confidence_score?: string | null;
  citations?: KnowledgeBaseResult | null;
}

export async function saveDraftResponse(params: SaveDraftResponseParams): Promise<DraftResponse> {
  const [draft] = await db
    .insert(draft_responses)
    .values({
      ...params,
      status: 'pending',
      confidence_score: params.confidence_score || null,
      citations: params.citations || null,
    })
    .returning();

  return draft as DraftResponse;
}

interface InsertEmailTagsParams {
  email_id: number;
  tag: string;
  confidence: string;
}

export async function insertEmailTags(tags: InsertEmailTagsParams[]): Promise<{ tag: string }[]> {
  const insertedTags = await db.insert(emailTags).values(tags).returning();

  return insertedTags.map(entry => ({ tag: entry.tag }));
}

interface LogAgentActionParams {
  thread_id: number;
  action: string;
  description: string;
  metadata: unknown;
}

export async function logAgentAction(params: LogAgentActionParams): Promise<AgentAction[]> {
  return db.insert(agentActions).values(params).returning() as Promise<AgentAction[]>;
}

export async function getLatestDraftForThread(threadId: number): Promise<DraftResponse | null> {
  const [draft] = await db
    .select()
    .from(draft_responses)
    .where(eq(draft_responses.thread_id, threadId))
    .orderBy(desc(draft_responses.created_at))
    .limit(1);

  return draft as DraftResponse | null;
}
