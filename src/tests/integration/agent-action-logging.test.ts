import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { emailAgent } from '../../agents/email-agent';
import { db } from '../../db';
import { emails, emailThreads, emailTags } from '../../db/schema/emails';
import { agentActions } from '../../db/schema/agent-actions';
import { randomUUID } from 'crypto';
import { eq } from 'drizzle-orm';

describe('Agent Action Logging', () => {
  let threadId: string;
  let emailId: string;

  beforeAll(async () => {
    // Create a test thread and email
    threadId = randomUUID();
    emailId = randomUUID();

    await db.insert(emailThreads).values({
      id: threadId,
      subject: 'Test Action Logging',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.insert(emails).values({
      id: emailId,
      threadId,
      from: 'action-test@example.com',
      to: 'support@gauntletairon.com',
      subject: 'Test Action Logging',
      body: 'This is a test email to verify action logging. I need help with my DragonScale gauntlets.',
      isIncoming: true,
      createdAt: new Date(),
    });
  });

  afterAll(async () => {
    // Clean up test data
    // Comment out action deletion to preserve them for viewing
    // await db.delete(agentActions).where(eq(agentActions.threadId, threadId));
    await db.delete(emailTags).where(eq(emailTags.emailId, emailId));
    await db.delete(emails).where(eq(emails.id, emailId));
    await db.delete(emailThreads).where(eq(emailThreads.id, threadId));
  });

  it('should log agent actions when processing an email', async () => {
    const email = {
      id: emailId,
      from: 'action-test@example.com',
      to: 'support@gauntletairon.com',
      subject: 'Test Action Logging',
      body: 'This is a test email to verify action logging. I need help with my DragonScale gauntlets.',
      timestamp: new Date(),
    };

    // Process the email
    const result = await emailAgent.processEmail(email, threadId);
    
    // Give it a moment for async logging to complete
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check that actions were logged
    const actions = await emailAgent.getThreadActions(threadId);
    
    expect(actions).toBeDefined();
    expect(actions.length).toBeGreaterThan(0);

    // Verify action details
    const searchAction = actions.find(a => a.toolName === 'search_emails');
    const tagAction = actions.find(a => a.toolName === 'tag_email');

    if (searchAction) {
      expect(searchAction.threadId).toBe(threadId);
      expect(searchAction.status).toBe('success');
      expect(searchAction.description).toContain('Searched for emails from');
      expect(searchAction.parameters).toBeTruthy();
    }

    if (tagAction) {
      expect(tagAction.threadId).toBe(threadId);
      expect(tagAction.status).toBe('success');
      expect(tagAction.description).toContain('Tagged email');
      expect(tagAction.parameters).toContain(emailId);
    }

    // Test summary statistics
    const summary = await emailAgent.getActionsSummary();
    expect(summary.totalActions).toBeGreaterThan(0);
    expect(summary.byTool).toBeDefined();
  });

  it('should generate meaningful descriptions for each tool', async () => {
    const actions = await emailAgent.getThreadActions(threadId);
    
    for (const action of actions) {
      expect(action.description).not.toBe(`Called ${action.toolName} tool`);
      expect(action.description.length).toBeGreaterThan(10);
      
      switch (action.toolName) {
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
  });
});