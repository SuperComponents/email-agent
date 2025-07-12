import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../database/db.js';
import { threads, emails } from '../database/schema.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js';
import { sendMessageSchema, validateRequest } from '../utils/validation.js';
import { logAgentAction } from '../database/logAgentAction.js';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config/env.js';

const app = new Hono();

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Helper function to generate demo customer response
async function generateDemoCustomerResponse(threadId: number) {
  // Fetch the thread
  const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);

  if (!thread) {
    throw new Error('Thread not found');
  }

  // Fetch all emails in the thread, ordered by created_at
  const threadEmails = await db
    .select()
    .from(emails)
    .where(eq(emails.thread_id, threadId))
    .orderBy(emails.created_at);

  if (threadEmails.length === 0) {
    throw new Error('No emails found in thread');
  }

  // Get the original customer email (first email in thread)
  const originalCustomerEmail = threadEmails[0];
  const customerEmailAddress = originalCustomerEmail.from_email;

  // Build conversation context for OpenAI
  const conversationContext = threadEmails
    .map(email => {
      const role = email.direction === 'inbound' ? 'Customer' : 'Support';
      return `${role} (${email.from_email}): ${email.body_text || ''}`;
    })
    .join('\n\n---\n\n');

  // Generate a contextual customer response
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are simulating a customer's follow-up email in an ongoing support conversation. 
        The customer originally sent an email about an issue, support responded, and now the customer is following up.
        
        Generate a realistic customer follow-up email that:
        - Acknowledges the support response
        - Either asks a clarifying question, provides requested information, or expresses satisfaction/dissatisfaction
        - Maintains the same tone and style as the original customer email
        - Is brief and realistic (2-4 sentences typical for customer emails)
        - Sometimes includes a thank you or shows frustration if the issue isn't resolved
        
        Return ONLY the email body text, no subject line or signatures.`,
      },
      {
        role: 'user',
        content: `Here's the conversation so far:\n\n${conversationContext}\n\nGenerate the customer's next response.`,
      },
    ],
    temperature: 0.8,
    max_tokens: 300,
  });

  const generatedContent =
    completion.choices[0].message.content || 'Thank you for your response.';

  // Find who the customer was emailing (support email)
  const supportEmailAddress =
    threadEmails.find(e => e.direction === 'outbound')?.from_email ||
    (originalCustomerEmail.to_emails as string[])[0] ||
    'support@company.com';

  // Create the new customer email
  const [newEmail] = await db
    .insert(emails)
    .values({
      thread_id: threadId,
      from_email: customerEmailAddress,
      to_emails: [supportEmailAddress],
      cc_emails: originalCustomerEmail.cc_emails,
      subject: `Re: ${thread.subject}`,
      body_text: generatedContent,
      body_html: `<p>${generatedContent.replace(/\n/g, '<br>')}</p>`,
      direction: 'inbound' as const,
      is_draft: false,
      sent_at: new Date(),
    })
    .returning();

  // Update thread's last activity
  await db
    .update(threads)
    .set({
      last_activity_at: new Date(),
      status: 'needs_attention' as const,
    })
    .where(eq(threads.id, threadId));

  // Log agent action for customer response received
  await logAgentAction({
    threadId: threadId,
    action: 'email_read',
    emailId: newEmail.id,
    metadata: {
      source: 'demo_customer_response',
      auto_generated: true,
      original_customer_email: customerEmailAddress,
      timestamp: new Date().toISOString()
    },
  });

  return newEmail;
}

// POST /api/threads/:id/messages - Send a reply message
app.post('/:id/messages', async c => {
  try {
    const threadId = parseInt(c.req.param('id'));

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    const body = await validateRequest(c, sendMessageSchema);
    if (!body) {
      return errorResponse(c, 'Invalid request body', 400);
    }

    // Check thread exists
    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);

    if (!thread) {
      return notFoundResponse(c, 'Thread');
    }

    // Create new email
    const [newEmail] = await db
      .insert(emails)
      .values({
        thread_id: threadId,
        from_email: 'support@proresponse.ai',
        to_emails: thread.participant_emails,
        cc_emails: [],
        bcc_emails: [],
        subject: thread.subject,
        body_text: body.content,
        body_html: null,
        direction: 'outbound',
        is_draft: false,
        sent_at: new Date(),
      })
      .returning();

    // Update thread last activity
    await db
      .update(threads)
      .set({
        last_activity_at: new Date(),
        status: thread.status === 'closed' ? 'active' : thread.status,
        updated_at: new Date(),
      })
      .where(eq(threads.id, threadId));

    // Log action
    await logAgentAction({
      threadId: threadId,
      emailId: newEmail.id,
      action: 'draft_sent',
      metadata: { content_length: body.content.length },
    });

    // Schedule automatic demo customer response after 10-30 seconds
    const delayMs = Math.floor(Math.random() * 20000) + 10000; // Random between 10-30 seconds
    setTimeout(async () => {
      try {
        await generateDemoCustomerResponse(threadId);
      } catch (error) {
        console.error('Failed to generate automatic demo customer response:', error);
      }
    }, delayMs);

    return successResponse(c, {
      id: newEmail.id.toString(),
      thread_id: threadId.toString(),
      from_name: 'Support Team',
      from_email: 'support@proresponse.ai',
      content: body.content,
      timestamp: newEmail.sent_at!.toISOString(),
      is_support_reply: true,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to send message', 500);
  }
});

export default app;
