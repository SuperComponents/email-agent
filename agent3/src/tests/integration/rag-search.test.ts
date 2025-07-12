import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { processEmail } from '../../agents/email-agent.js';
import { db } from '../../db/db.js';
import { emails, threads, emailTags, agentActions, draft_responses } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { ToolCallMetadata } from '../../db/types.js';

describe('RAG Search Integration', () => {
  let threadId: number;
  let emailId: number;

  beforeAll(async () => {
    // Clean up any existing test data first
    await db.delete(agentActions);
    await db.delete(emailTags);
    await db.delete(draft_responses);
    await db.delete(emails);
    await db.delete(threads);

    // Create a test thread and email asking about warranty
    const [thread] = await db
      .insert(threads)
      .values({
        subject: 'Warranty Question',
        participant_emails: ['customer@example.com', 'support@company.com'],
        status: 'active',
      })
      .returning();
    threadId = thread.id;

    const [email] = await db
      .insert(emails)
      .values({
        thread_id: threadId,
        from_email: 'customer@example.com',
        to_emails: ['support@company.com'],
        subject: 'Warranty Question',
        body_text: 'What warranty do we offer for the dragonscale gauntlets?',
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

  it('should search knowledge base for warranty information', async () => {
    console.log('\n=== Testing RAG Search ===');
    console.log('Query: What warranty do we offer for the dragonscale gauntlets?');

    // Process the email - this should trigger the RAG search
    console.log('\nProcessing email...');
    const startTime = Date.now();
    const result = await processEmail(threadId);
    const processingTime = Date.now() - startTime;
    console.log(`Processing completed in ${processingTime}ms`);

    console.log('\n=== RAG Search Result ===');
    console.log('Full result:', JSON.stringify(result, null, 8));

    // Check if the agent performed any actions
    const actions = await db
      .select()
      .from(agentActions)
      .where(eq(agentActions.thread_id, threadId));

    console.log('\n=== Agent Actions ===');
    console.log('Total actions performed:', actions.length);

    // Log each action with its metadata
    actions.forEach((action, index: number) => {
      console.log(`\nAction ${index + 1}:`);
      console.log('Action type:', action.action);
      console.log('Metadata:', JSON.stringify(action.metadata, null, 2));
    });

    // Look specifically for knowledge base search actions
    const kbSearchAction = actions.find(a => {
      return a.action === 'file_search_call' || a.action === 'search_knowledge_base';
    });

    if (kbSearchAction) {
      console.log('\n=== Knowledge Base Search Action Found ===');
      const metadata = kbSearchAction.metadata as ToolCallMetadata;
      console.log('Tool used:', kbSearchAction.action);
      console.log('Parameters:', JSON.stringify(metadata?.parameters, null, 2));
      console.log('Result:', JSON.stringify(metadata?.result, null, 2));
    } else {
      console.log('\n=== No Knowledge Base Search Action Found ===');
    }

    // Check that we got back the expected result structure
    expect(result).toBeDefined();
    expect(result.draft).toBeDefined();
    expect(result.actions).toBeDefined();
    expect(result.actions).toBeInstanceOf(Array);

    // Check that draft was saved to database
    expect(result.draft?.id).toBeDefined();
    expect(result.draft?.email_id).toBe(emailId);
    expect(result.draft?.thread_id).toBe(threadId);
    expect(result.draft?.generated_content).toBeDefined();
    expect(result.draft?.status).toBe('pending');

    // Check that actions were logged to database
    expect(result.actions.length).toBeGreaterThan(0);

    // Verify we have a RAG search action
    expect(kbSearchAction).toBeDefined();
    expect(kbSearchAction?.action).toBe('file_search_call');
    expect(kbSearchAction?.thread_id).toBe(threadId);
    expect(kbSearchAction?.metadata).toBeDefined();

    // Verify the search action has the expected metadata
    const metadata = kbSearchAction?.metadata as ToolCallMetadata;
    const params = metadata?.parameters as { queries?: string[] };
    expect(params?.queries).toBeDefined();
    expect(params?.queries).toBeInstanceOf(Array);
    expect(params?.queries!.length).toBeGreaterThan(0);

    // Check if the response mentions warranty details
    const response = result.draft?.generated_content || '';
    const responseContainsWarranty = response.toLowerCase().includes('warranty');
    expect(responseContainsWarranty).toBe(true);

    console.log('\n=== Test Assertions Passed ===');
    console.log('- Draft saved to database with ID:', result.draft?.id);
    console.log('- Actions logged to database:', result.actions.length);
    console.log('- RAG search action found:', kbSearchAction?.action);
    console.log('- Response contains warranty information:', responseContainsWarranty);
  });
});
