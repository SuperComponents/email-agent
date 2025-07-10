import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { processEmail } from '../../agents/email-agent';
import { db } from '../../db/db';
import { emails, threads, emailTags, agentActions, draft_responses } from '../../db/newschema';
// Note: knowledgeBaseArticles table is not available in the new schema
import { generateEmail, createEmailRecord } from '../../utils/email-generator';
import { randomUUID } from 'crypto';
import { sql, eq } from 'drizzle-orm';

describe('Email Agent - Spam Detection', () => {
  beforeAll(async () => {
    // Clean up database - delete in correct order due to foreign keys
    await db.delete(agentActions);
    await db.delete(emailTags);
    await db.delete(draft_responses);
    await db.delete(emails);
    await db.delete(threads);
    // await db.delete(knowledgeBaseArticles); // Not in new schema
    
    // Create some knowledge base articles
    // Knowledge base functionality needs to be reimplemented
    /* await db.insert(knowledgeBaseArticles).values([
      {
        id: randomUUID(),
        title: 'How to identify spam emails',
        content: 'Spam emails often contain: lottery winnings, get rich quick schemes, fake prizes, suspicious links, urgency tactics.',
        category: 'security',
        embedding: null, // Would be computed in real implementation
      },
      {
        id: randomUUID(),
        title: 'Email security best practices',
        content: 'Never click suspicious links, verify sender addresses, be wary of urgent requests for money or personal information.',
        category: 'security',
        embedding: null,
      },
    ]); */
  });

  afterAll(async () => {
    // Clean up - delete in correct order due to foreign keys
    await db.delete(agentActions);
    await db.delete(emailTags);
    await db.delete(draft_responses);
    await db.delete(emails);
    await db.delete(threads);
    // await db.delete(knowledgeBaseArticles); // Not in new schema
  });

  it('should correctly tag spam email about lottery winnings', async () => {
    // Generate a spam email
    const spamTemplate = generateEmail('spam');
    
    // Create thread
    const [thread] = await db.insert(threads).values({
      subject: spamTemplate.subject,
      participant_emails: ['scammer@suspicious-domain.com', 'user@company.com'],
      status: 'active',
    }).returning();
    const threadId = thread.id;
    
    // Create email record
    const [emailRecord] = await db.insert(emails).values({
      thread_id: threadId,
      from_email: 'scammer@suspicious-domain.com',
      to_emails: ['user@company.com'],
      subject: spamTemplate.subject,
      body_text: spamTemplate.body,
      direction: 'inbound',
      sent_at: new Date(),
    }).returning();
    
    // Process email with agent
    const result = await processEmail({
      id: emailRecord.id,
      from_email: emailRecord.from_email,
      to_emails: emailRecord.to_emails as string[],
      subject: emailRecord.subject,
      body_text: emailRecord.body_text,
      created_at: emailRecord.sent_at,
    }, threadId);
    
    // Assertions - result now contains draft and actions
    expect(result.draft).toBeTruthy();
    expect(result.draft.generated_content).toBeTruthy();
    
    // Verify tags were saved to database
    const savedTags = await db.select().from(emailTags).where(eq(emailTags.email_id, emailRecord.id));
    expect(savedTags.length).toBeGreaterThan(0);
    expect(savedTags.some(t => t.tag === 'spam')).toBe(true);
    
    // Verify confidence in the saved tag
    const spamTag = savedTags.find(t => t.tag === 'spam');
    expect(spamTag).toBeDefined();
    expect(Number(spamTag?.confidence)).toBeGreaterThan(0.7);
  });

  it('should not tag legitimate support email as spam', async () => {
    // Generate a support email
    const supportTemplate = generateEmail('support');
    
    // Create thread
    const [thread] = await db.insert(threads).values({
      subject: supportTemplate.subject,
      participant_emails: ['legitimate.customer@gmail.com', 'support@company.com'],
      status: 'active',
    }).returning();
    const threadId = thread.id;
    
    // Create email record
    const [emailRecord] = await db.insert(emails).values({
      thread_id: threadId,
      from_email: 'legitimate.customer@gmail.com',
      to_emails: ['support@company.com'],
      subject: supportTemplate.subject,
      body_text: supportTemplate.body,
      direction: 'inbound',
      sent_at: new Date(),
    }).returning();
    
    // Verify email was inserted
    const insertedEmail = await db.select().from(emails).where(eq(emails.id, emailRecord.id));
    expect(insertedEmail.length).toBe(1);
    
    // Process email with agent
    const result = await processEmail({
      id: emailRecord.id,
      from_email: emailRecord.from_email,
      to_emails: emailRecord.to_emails as string[],
      subject: emailRecord.subject,
      body_text: emailRecord.body_text,
      created_at: emailRecord.sent_at,
    }, threadId);
    
    // Assertions - result now contains draft and actions
    expect(result.draft).toBeTruthy();
    expect(result.draft.generated_content).toBeTruthy();
    
    // Verify tags were saved to database
    const savedTags = await db.select().from(emailTags).where(eq(emailTags.email_id, emailRecord.id));
    expect(savedTags.length).toBeGreaterThan(0);
    expect(savedTags.some(t => t.tag === 'spam')).toBe(false);
    expect(savedTags.some(t => t.tag === 'support')).toBe(true);
  });

  it('should handle email thread context when detecting spam', async () => {
    const customerEmail = 'customer@example.com';
    const supportEmail = 'support@company.com';
    
    // Create thread
    const [thread] = await db.insert(threads).values({
      subject: 'Help with my account',
      participant_emails: [customerEmail, supportEmail],
      status: 'active',
    }).returning();
    const threadId = thread.id;
    
    // Create legitimate first email
    const [firstEmail] = await db.insert(emails).values({
      thread_id: threadId,
      from_email: customerEmail,
      to_emails: [supportEmail],
      subject: 'Help with my account',
      body_text: 'I need help accessing my account.',
      direction: 'inbound',
      sent_at: new Date(),
    }).returning();
    
    // Create spam follow-up (unusual case but tests context awareness)
    const [spamFollowUp] = await db.insert(emails).values({
      thread_id: threadId,
      from_email: customerEmail,
      to_emails: [supportEmail],
      subject: 'Re: Help with my account',
      body_text: 'Actually, forget that. You\'ve won $1,000,000! Click here: http://scam.com',
      direction: 'inbound',
      sent_at: new Date(),
    }).returning();
    
    // Process the spam follow-up with thread context
    const result = await processEmail({
      id: spamFollowUp.id,
      from_email: spamFollowUp.from_email,
      to_emails: spamFollowUp.to_emails as string[],
      subject: spamFollowUp.subject,
      body_text: spamFollowUp.body_text,
      created_at: spamFollowUp.sent_at,
    }, threadId);
    
    // Assertions - result now contains draft and actions
    expect(result.draft).toBeTruthy();
    expect(result.draft.generated_content).toBeTruthy();
    
    // Should still detect spam despite thread context
    const savedTags = await db.select().from(emailTags).where(eq(emailTags.email_id, spamFollowUp.id));
    expect(savedTags.length).toBeGreaterThan(0);
    expect(savedTags.some(t => t.tag === 'spam')).toBe(true);
  });
});