import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { processEmail } from '../../agents/email-agent.js';
import { db } from '../../db/db.js';
import { emails, threads, emailTags, agentActions, draft_responses } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { ToolCallMetadata } from '../../db/types.js';

describe('Agent Action Logging', () => {
  let threadId: number;
  let emailId: number;

  beforeAll(async () => {
    // Clean up any existing test data first
    await db.delete(agentActions);
    await db.delete(emailTags);
    await db.delete(draft_responses);
    await db.delete(emails);
    await db.delete(threads);

    // Create a test thread and email
    const [thread] = await db
      .insert(threads)
      .values({
        subject: 'Test Action Logging',
        participant_emails: ['action-test@example.com', 'support@gauntletairon.com'],
        status: 'active',
      })
      .returning();
    threadId = thread.id;

    const [email] = await db
      .insert(emails)
      .values({
        thread_id: threadId,
        from_email: 'action-test@example.com',
        to_emails: ['support@gauntletairon.com'],
        subject: 'Test Action Logging',
        body_text:
          'This is a test email to verify action logging. I need help with my DragonScale gauntlets.',
        direction: 'inbound',
        sent_at: new Date(),
      })
      .returning();
    emailId = email.id;
  });

  afterAll(async () => {
    // Clean up test data - delete in correct order due to foreign keys
    await db.delete(agentActions).where(eq(agentActions.thread_id, threadId));
    await db.delete(emailTags).where(eq(emailTags.email_id, emailId));
    await db.delete(draft_responses).where(eq(draft_responses.email_id, emailId));
    await db.delete(emails).where(eq(emails.id, emailId));
    await db.delete(threads).where(eq(threads.id, threadId));
  });

  it('should log agent actions when processing an email', async () => {
    // Process the email
    const result = await processEmail(threadId);

    // Check that we got back the expected structure
    expect(result).toBeDefined();
    expect(result.draft).toBeDefined();
    expect(result.actions).toBeDefined();
    expect(result.actions).toBeInstanceOf(Array);

    // Check that actions were logged
    const actions = await db
      .select()
      .from(agentActions)
      .where(eq(agentActions.thread_id, threadId));

    expect(actions).toBeDefined();
    expect(actions.length).toBeGreaterThan(0);

    // Verify action details
    // Note: The new schema has a different structure for agent actions
    // The metadata field contains tool information
    const searchAction = actions.find(a => a.action === 'search_emails');
    const tagAction = actions.find(a => a.action === 'tag_email');

    if (searchAction) {
      expect(searchAction.thread_id).toBe(threadId);
      const metadata = searchAction.metadata as ToolCallMetadata;
      expect(metadata?.status).toBe('success');
      expect(searchAction.description).toContain('Searched for emails from');
      expect(metadata?.parameters).toBeTruthy();
    }

    if (tagAction) {
      expect(tagAction.thread_id).toBe(threadId);
      const metadata = tagAction.metadata as ToolCallMetadata;
      expect(metadata?.status).toBe('success');
      expect(tagAction.description).toContain('Tagged email');
      // Check if emailId is in the parameters object
      const params = metadata?.parameters as { emailId?: string };
      expect(params?.emailId).toBe(emailId.toString());
    }

    // Test summary statistics
    const allActions = await db.select().from(agentActions);
    expect(allActions.length).toBeGreaterThan(0);
  });

  it('should generate meaningful descriptions for each tool', async () => {
    const actions = await db
      .select()
      .from(agentActions)
      .where(eq(agentActions.thread_id, threadId));

    for (const action of actions) {
      expect(action.description).toBeTruthy();
      expect(action.description!.length).toBeGreaterThan(10);

      if (action.action) {
        switch (action.action) {
          case 'search_emails':
            expect(action.description).toMatch(/Searched for emails from .+@.+/);
            break;
          case 'tag_email':
            expect(action.description).toMatch(/Tagged email .+ as .+/);
            break;
          case 'search_knowledge_base':
            expect(action.description).toMatch(/Searched knowledge base for: ".+"/);
            break;
        }
      }
    }
  });
});
