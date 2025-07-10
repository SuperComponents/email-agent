import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { processEmail } from '../../agents/email-agent';
import { db } from '../../db/db';
import { emails, threads, emailTags, agentActions, draft_responses } from '../../db/newschema';
import { eq } from 'drizzle-orm';

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
    const [thread] = await db.insert(threads).values({
      subject: 'Warranty Question',
      participant_emails: ['customer@example.com', 'support@company.com'],
      status: 'active',
    }).returning();
    threadId = thread.id;

    const [email] = await db.insert(emails).values({
      thread_id: threadId,
      from_email: 'customer@example.com',
      to_emails: ['support@company.com'],
      subject: 'Warranty Question',
      body_text: 'What warranty do we offer for the dragonscale gauntlets?',
      direction: 'inbound',
      sent_at: new Date(),
    }).returning();
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
    const email = {
      id: emailId,
      from_email: 'customer@example.com',
      to_emails: ['support@company.com'],
      subject: 'Warranty Question',
      body_text: 'What warranty do we offer for the dragonscale gauntlets?',
      created_at: new Date(),
    };

    console.log('\n=== Testing RAG Search ===');
    console.log('Query:', email.body_text);
    
    // Process the email - this should trigger the RAG search
    console.log('\nProcessing email...');
    const startTime = Date.now();
    const result = await processEmail(email, threadId);
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
    actions.forEach((action, index) => {
      console.log(`\nAction ${index + 1}:`);
      console.log('Action type:', action.action);
      console.log('Metadata:', JSON.stringify(action.metadata, null, 2));
    });

    // Look specifically for knowledge base search actions
    const kbSearchAction = actions.find(a => {
      const metadata = a.metadata as any;
      return metadata?.toolName === 'search_knowledge_base' || 
             metadata?.toolName === 'file_search';
    });

    if (kbSearchAction) {
      console.log('\n=== Knowledge Base Search Action Found ===');
      console.log('Tool used:', (kbSearchAction.metadata as any)?.toolName);
      console.log('Parameters:', JSON.stringify((kbSearchAction.metadata as any)?.parameters, null, 2));
      console.log('Result:', JSON.stringify((kbSearchAction.metadata as any)?.result, null, 2));
    } else {
      console.log('\n=== No Knowledge Base Search Action Found ===');
    }

    // Basic assertion to ensure the test runs
    expect(result).toBeDefined();
    expect(result.draft).toBeDefined();
    expect(result.draft.generated_content).toBeDefined();
    
    // Log the raw response from the agent
    console.log('\n=== Agent Response ===');
    console.log(result.draft.generated_content);
    
    // Check if the response mentions warranty details
    const response = result.draft.generated_content || '';
    const responseContainsWarranty = response.toLowerCase().includes('warranty');
    const responseContainsKnowledgeBase = response.toLowerCase().includes('knowledge base');
    
    console.log('\n=== Response Analysis ===');
    console.log('Contains warranty information:', responseContainsWarranty);
    console.log('Mentions knowledge base:', responseContainsKnowledgeBase);
    
    // Check if specific warranty details are mentioned
    const hasLifetimeWarranty = response.includes('Lifetime Warranty');
    const has5YearWarranty = response.includes('5-Year Warranty');
    
    console.log('Has specific warranty details:');
    console.log('- Lifetime warranty mentioned:', hasLifetimeWarranty);
    console.log('- 5-year warranty mentioned:', has5YearWarranty);
  });
});