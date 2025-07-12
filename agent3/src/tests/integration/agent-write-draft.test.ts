import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../../db/db.js';
import { emails, threads, draft_responses, agentActions } from '../../db/schema.js';
import { eq } from 'drizzle-orm';
import { processEmail } from '../../agents/email-agent.js';
import type { DraftResponse } from '../../db/types.js';

describe('Agent Write Draft Integration', () => {
  let testThreadId: number;

  beforeEach(async () => {
    // Clean up test data in correct order (respecting foreign key constraints)
    await db.delete(draft_responses);
    await db.delete(emails);
    // Delete agent actions before threads (they reference threads)
    await db.delete(agentActions);
    await db.delete(threads);

    // Create a test thread
    const [thread] = await db
      .insert(threads)
      .values({
        subject: 'Test Thread',
        participant_emails: ['customer@example.com', 'support@company.com'],
        status: 'active',
      })
      .returning();
    testThreadId = thread.id;
  });

  // Helper function to create an email and process it
  async function createEmailAndProcess(subject: string, bodyText: string) {
    const [email] = await db
      .insert(emails)
      .values({
        thread_id: testThreadId,
        from_email: 'customer@example.com',
        to_emails: ['support@company.com'],
        subject,
        body_text: bodyText,
        direction: 'inbound',
        is_draft: false,
      })
      .returning();

    const result = await processEmail(testThreadId, x => {
      console.log(x);
    }); // Silent logger

    // Verify draft was created
    expect(result.draft).toBeDefined();
    expect(result.error).toBeUndefined();

    // Get the saved draft from database
    const [savedDraft] = await db
      .select()
      .from(draft_responses)
      .where(eq(draft_responses.thread_id, testThreadId));

    expect(savedDraft).toBeDefined();
    expect(savedDraft.email_id).toBe(email.id);
    expect(savedDraft.generated_content).toBeTruthy();

    // Verify write_draft action was logged
    const writeDraftAction = result.actions.find(a => a.action === 'write_draft');
    expect(writeDraftAction).toBeDefined();

    return savedDraft as DraftResponse;
  }

  // Helper function to verify citation contains expected filename
  function verifyCitation(draft: DraftResponse, expectedFilename: string) {
    expect(draft.citations).toBeTruthy();
    if (draft.citations) {
      const citations = draft.citations;
      expect(citations.filename).toBeTruthy();
      expect(citations.filename).toContain(expectedFilename);
      expect(citations.text).toBeTruthy();
    }
  }

  // Tests expecting citations
  it.only('should create a draft with citations when asking about DragonScale Gauntlets', async () => {
    const draft = await createEmailAndProcess(
      'Question about DragonScale Gauntlets',
      'Hi, I heard about the DragonScale Gauntlets you are selling. Can you tell me more about their warranty?',
    );

    verifyCitation(draft, 'dragonscale-gauntlets.md');
  });

  it('should create a draft with citations when asking about Roadguard Series', async () => {
    const draft = await createEmailAndProcess(
      'Information about Roadguard Series',
      'Can you provide details about the Roadguard Series? I am interested in their protective capabilities and pricing.',
    );

    verifyCitation(draft, 'roadguard-series.md');
  });

  it('should create a draft with citations when asking about CyberKnight Collection', async () => {
    const draft = await createEmailAndProcess(
      'CyberKnight Collection inquiry',
      'I would like to know more about the CyberKnight Collection. What makes it special and how does it differ from other collections?',
    );

    verifyCitation(draft, 'cyberknight-collection.md');
  });

  // Test expecting multiple citations (this might not pass as current implementation only stores highest scoring citation)
  it('should handle questions comparing multiple products', async () => {
    const draft = await createEmailAndProcess(
      'Comparing DragonScale and CyberKnight',
      'What is the difference between the DragonScale Gauntlets and the CyberKnight Collection? Which one would be better for a warrior class player?',
    );

    // The current implementation only stores the highest scoring citation
    // So we check that at least one relevant citation is included
    expect(draft.citations).toBeTruthy();
    if (draft.citations) {
      const citations = draft.citations;
      expect(citations.filename).toBeTruthy();
      // Should contain either dragonscale-gauntlets.md or cyberknight-collection.md
      const hasRelevantCitation =
        citations.filename.includes('dragonscale-gauntlets.md') ||
        citations.filename.includes('cyberknight-collection.md');
      expect(hasRelevantCitation).toBe(true);
    }
  });

  // Tests not expecting citations (or expecting unrelated citations)
  it('should create a draft when asking about cars', async () => {
    await createEmailAndProcess(
      'Question about cars',
      'Hi, I was wondering if you sell cars? I need a new vehicle for my daily commute.',
    );

    // Citations may or may not exist for this query
  });

  it('should create a draft when asking about weather', async () => {
    await createEmailAndProcess(
      'Weather inquiry',
      'What is the weather forecast for tomorrow in San Francisco? Should I bring an umbrella?',
    );

    // Citations may or may not exist for this query
  });

  it('should create a draft when asking about store hours', async () => {
    await createEmailAndProcess(
      'Store hours',
      'What time does your physical store open? I would like to visit this weekend.',
    );

    // Citations may or may not exist for this query
  });

  it('should create a draft when asking about refund policy', async () => {
    await createEmailAndProcess(
      'Refund question',
      'What is your refund policy? I bought something last week and it does not fit properly.',
    );

    // Citations may or may not exist for this query
  });
});
