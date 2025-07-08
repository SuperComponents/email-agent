import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { emailAgent } from '../../agents/email-agent';
import { db } from '../../db';
import { emails, emailThreads, emailTags, knowledgeBaseArticles } from '../../db/schema';
import { generateEmail, createEmailRecord } from '../../utils/email-generator';
import { randomUUID } from 'crypto';
import { sql, eq } from 'drizzle-orm';

describe('Email Agent - Spam Detection', () => {
  beforeAll(async () => {
    // Clean up database
    await db.delete(emailTags);
    await db.delete(emails);
    await db.delete(emailThreads);
    await db.delete(knowledgeBaseArticles);
    
    // Create some knowledge base articles
    await db.insert(knowledgeBaseArticles).values([
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
    ]);
  });

  afterAll(async () => {
    // Clean up
    await db.delete(emailTags);
    await db.delete(emails);
    await db.delete(emailThreads);
    await db.delete(knowledgeBaseArticles);
  });

  it('should correctly tag spam email about lottery winnings', async () => {
    // Generate a spam email
    const spamTemplate = generateEmail('spam');
    const threadId = randomUUID();
    
    // Create thread
    await db.insert(emailThreads).values({
      id: threadId,
      subject: spamTemplate.subject,
    });
    
    // Create email record
    const emailRecord = createEmailRecord({
      ...spamTemplate,
      from: 'scammer@suspicious-domain.com',
      to: 'user@company.com',
    }, threadId);
    
    await db.insert(emails).values(emailRecord);
    
    // Process email with agent
    const result = await emailAgent.processEmail({
      id: emailRecord.id,
      from: emailRecord.from,
      to: emailRecord.to,
      subject: emailRecord.subject,
      body: emailRecord.body,
      timestamp: emailRecord.createdAt,
    }, threadId);
    
    // Assertions
    expect(result.tags).toContain('spam');
    expect(result.confidence).toBeGreaterThan(70);
    
    // Verify tags were saved to database
    const savedTags = await db.select().from(emailTags).where(eq(emailTags.emailId, emailRecord.id));
    expect(savedTags.length).toBeGreaterThan(0);
    expect(savedTags.some(t => t.tag === 'spam')).toBe(true);
  });

  it('should not tag legitimate support email as spam', async () => {
    // Generate a support email
    const supportTemplate = generateEmail('support');
    const threadId = randomUUID();
    
    // Create thread
    await db.insert(emailThreads).values({
      id: threadId,
      subject: supportTemplate.subject,
    });
    
    // Create email record
    const emailRecord = createEmailRecord({
      ...supportTemplate,
      from: 'legitimate.customer@gmail.com',
      to: 'support@company.com',
    }, threadId);
    
    await db.insert(emails).values(emailRecord);
    
    // Verify email was inserted
    const insertedEmail = await db.select().from(emails).where(eq(emails.id, emailRecord.id));
    expect(insertedEmail.length).toBe(1);
    
    // Process email with agent
    const result = await emailAgent.processEmail({
      id: emailRecord.id,
      from: emailRecord.from,
      to: emailRecord.to,
      subject: emailRecord.subject,
      body: emailRecord.body,
      timestamp: emailRecord.createdAt,
    }, threadId);
    
    // Assertions
    expect(result.tags).not.toContain('spam');
    expect(result.tags).toContain('support');
  });

  it('should handle email thread context when detecting spam', async () => {
    const threadId = randomUUID();
    const customerEmail = 'customer@example.com';
    const supportEmail = 'support@company.com';
    
    // Create thread
    await db.insert(emailThreads).values({
      id: threadId,
      subject: 'Help with my account',
    });
    
    // Create legitimate first email
    const firstEmail = createEmailRecord({
      subject: 'Help with my account',
      body: 'I need help accessing my account.',
      type: 'support',
      from: customerEmail,
      to: supportEmail,
    }, threadId);
    
    await db.insert(emails).values(firstEmail);
    
    // Create spam follow-up (unusual case but tests context awareness)
    const spamFollowUp = createEmailRecord({
      subject: 'Re: Help with my account',
      body: 'Actually, forget that. You\'ve won $1,000,000! Click here: http://scam.com',
      type: 'spam',
      from: customerEmail,
      to: supportEmail,
    }, threadId);
    
    await db.insert(emails).values(spamFollowUp);
    
    // Process the spam follow-up with thread context
    const result = await emailAgent.processEmail({
      id: spamFollowUp.id,
      from: spamFollowUp.from,
      to: spamFollowUp.to,
      subject: spamFollowUp.subject,
      body: spamFollowUp.body,
      timestamp: spamFollowUp.createdAt,
    }, threadId);
    
    // Should still detect spam despite thread context
    expect(result.tags).toContain('spam');
  });
});