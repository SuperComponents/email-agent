import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../database/db.js';
import { threads, emails } from '../database/schema.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js';
import { sendMessageSchema, validateRequest } from '../utils/validation.js';
// import { logAgentAction } from '../database/logAgentAction.js';

const app = new Hono();

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
    // await logAgentAction({
    //   threadId: threadId,
    //   emailId: newEmail.id,
    //   action: 'draft_sent',
    //   metadata: { content_length: body.content.length },
    // });

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
