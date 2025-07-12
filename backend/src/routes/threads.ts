import { Hono } from 'hono';
import { eq, and, or, like, desc, sql, inArray } from 'drizzle-orm';
import { db } from '../database/db.js';
import { threads, emails, draft_responses, agent_actions, internal_notes, users, emailTags } from '../database/schema.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js';
import { threadFilterSchema, updateThreadSchema, validateRequest } from '../utils/validation.js';
import { authMiddleware } from '../middleware/auth.js';
import { workerManager } from '../services/worker-interface.js';
const app = new Hono();
app.use(authMiddleware);
// GET /api/threads - List all threads with filtering
app.get('/', async c => {
  try {
    const filterParam = c.req.query('filter');
    const searchParam = c.req.query('search');

    // Validate filter
    const filter = threadFilterSchema.parse(filterParam);

    // Build where conditions
    const conditions = [];
    let threadIdsFromTags: number[] = [];

    // Handle tag-based filters first
    if (filter === 'flagged' || filter === 'urgent') {
      const taggedThreadsQuery = await db
        .select({
          thread_id: emails.thread_id,
        })
        .from(emails)
        .innerJoin(emailTags, eq(emails.id, emailTags.email_id))
        .where(eq(emailTags.tag, filter))
        .groupBy(emails.thread_id);

      threadIdsFromTags = taggedThreadsQuery.map(row => row.thread_id);
      
      if (threadIdsFromTags.length === 0) {
        // No threads have this tag, return empty result
        return successResponse(c, { threads: [] });
      }
      
      conditions.push(inArray(threads.id, threadIdsFromTags));
    } else if (filter && filter !== 'all') {
      switch (filter) {
        case 'closed':
          conditions.push(eq(threads.status, 'closed'));
          break;
        case 'awaiting_customer':
          conditions.push(eq(threads.status, 'active'));
          break;
        case 'unread':
          conditions.push(eq(threads.is_unread, true));
          break;
      }
    }

    if (searchParam) {
      conditions.push(
        or(
          like(threads.subject, `%${searchParam}%`),
          // For full search, we'd need to join with emails table
        ),
      );
    }

    // Query threads with latest email info
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const threadList = await db
      .select({
        id: threads.id,
        subject: threads.subject,
        participant_emails: threads.participant_emails,
        status: threads.status,
        is_unread: threads.is_unread,
        last_activity_at: threads.last_activity_at,
        created_at: threads.created_at,
        // Get latest email content for snippet
        latest_email: sql<string>`(
          SELECT body_text FROM ${emails} 
          WHERE ${emails.thread_id} = ${threads.id} 
          ORDER BY ${emails.created_at} DESC 
          LIMIT 1
        )`,
      })
      .from(threads)
      .where(whereClause)
      .orderBy(desc(threads.last_activity_at));

    // Get tags for all threads in the result
    const threadIds = threadList.map(t => t.id);
    let threadTags: Record<number, string[]> = {};
    
    if (threadIds.length > 0) {
      const tagsQuery = await db
        .select({
          thread_id: emails.thread_id,
          tag: emailTags.tag,
        })
        .from(emails)
        .innerJoin(emailTags, eq(emails.id, emailTags.email_id))
        .where(inArray(emails.thread_id, threadIds))
        .groupBy(emails.thread_id, emailTags.tag);

      threadTags = tagsQuery.reduce((acc, row) => {
        if (!acc[row.thread_id]) {
          acc[row.thread_id] = [];
        }
        if (!acc[row.thread_id].includes(row.tag)) {
          acc[row.thread_id].push(row.tag);
        }
        return acc;
      }, {} as Record<number, string[]>);
    }

    // Transform to match API format
    const formattedThreads = threadList.map(thread => {
      const participants = thread.participant_emails as string[];
      const customerEmail =
        participants.find(email => !email.includes('@proresponse.ai')) || participants[0];

      // Get worker status for this thread
      const workerStatus = workerManager.getWorkerStatus(thread.id);

      return {
        id: thread.id.toString(),
        subject: thread.subject,
        snippet: thread.latest_email ? thread.latest_email.substring(0, 100) + '...' : '',
        customer_name: customerEmail.split('@')[0], // Simplified for MVP
        customer_email: customerEmail,
        timestamp: thread.last_activity_at.toISOString(),
        is_unread: thread.is_unread,
        status: thread.status,
        tags: threadTags[thread.id] || [],
        worker_active: workerStatus === 'running',
      };
    });

    return successResponse(c, { threads: formattedThreads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to fetch threads',
      500,
    );
  }
});

// GET /api/threads/:id - Get single thread with details
app.get('/:id', async c => {
  try {
    const threadId = parseInt(c.req.param('id'));

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    // Get thread
    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);

    if (!thread) {
      return notFoundResponse(c, 'Thread');
    }

    // Mark thread as read when it's accessed
    if (thread.is_unread) {
      await db
        .update(threads)
        .set({
          is_unread: false,
          updated_at: new Date(),
        })
        .where(eq(threads.id, threadId));
    }

    // Get emails for thread
    const threadEmails = await db
      .select({
        id: emails.id,
        from_email: emails.from_email,
        to_emails: emails.to_emails,
        subject: emails.subject,
        body_text: emails.body_text,
        body_html: emails.body_html,
        direction: emails.direction,
        is_draft: emails.is_draft,
        sent_at: emails.sent_at,
        created_at: emails.created_at,
      })
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(emails.created_at);

    // Get latest draft
    const [latestDraft] = await db
      .select({
        content: draft_responses.generated_content,
        created_at: draft_responses.created_at,
        status: draft_responses.status,
      })
      .from(draft_responses)
      .where(eq(draft_responses.thread_id, threadId))
      .orderBy(desc(draft_responses.created_at))
      .limit(1);

    // Get agent actions
    const agentActionsList = await db
      .select({
        id: agent_actions.id,
        action: agent_actions.action,
        metadata: agent_actions.metadata,
        created_at: agent_actions.created_at,
      })
      .from(agent_actions)
      .where(eq(agent_actions.thread_id, threadId))
      .orderBy(desc(agent_actions.created_at));

    // Get internal notes
    const internalNotesList = await db
      .select({
        id: internal_notes.id,
        content: internal_notes.content,
        is_pinned: internal_notes.is_pinned,
        created_at: internal_notes.created_at,
        updated_at: internal_notes.updated_at,
        author: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(internal_notes)
      .leftJoin(users, eq(internal_notes.author_user_id, users.id))
      .where(eq(internal_notes.thread_id, threadId))
      .orderBy(desc(internal_notes.is_pinned), desc(internal_notes.created_at));

    // Get tags for this thread
    const threadTagsQuery = await db
      .select({
        tag: emailTags.tag,
      })
      .from(emails)
      .innerJoin(emailTags, eq(emails.id, emailTags.email_id))
      .where(eq(emails.thread_id, threadId))
      .groupBy(emailTags.tag);

    const threadTagsList = threadTagsQuery.map(row => row.tag);

    // Transform data
    const participants = thread.participant_emails as string[];
    const customerEmail =
      participants.find(email => !email.includes('@proresponse.ai')) || participants[0];

    const formattedEmails = threadEmails.map(email => ({
      id: email.id.toString(),
      from_name: email.from_email.split('@')[0],
      from_email: email.from_email,
      content: email.body_text || email.body_html || '',
      timestamp: (email.sent_at || email.created_at)!.toISOString(),
      is_support_reply: email.direction === 'outbound',
    }));

    const formattedActions = agentActionsList.map(action => ({
      id: action.id.toString(),
      type: action.action,
      title: action.action.replace(/_/g, ' '),
      description: ((action.metadata as Record<string, unknown>)?.description as string) || '',
      timestamp: action.created_at.toISOString(),
      status: 'completed',
    }));

    const currentUser = c.get('user');
    const formattedNotes = internalNotesList.map(note => ({
      id: note.id.toString(),
      content: note.content,
      is_pinned: note.is_pinned,
      created_at: note.created_at.toISOString(),
      updated_at: note.updated_at.toISOString(),
      author: {
        id: note.author?.id?.toString() || '',
        name: note.author?.name || 'Unknown User',
        email: note.author?.email || '',
      },
      can_edit: note.author?.id === currentUser.dbUser?.id,
    }));

    const response = {
      id: thread.id.toString(),
      subject: thread.subject,
      status: thread.status,
      tags: threadTagsList,
      customer: {
        name: customerEmail.split('@')[0],
        email: customerEmail,
      },
      emails: formattedEmails,
      internal_notes: formattedNotes,
      agent_activity: {
        analysis: latestDraft ? 'Thread analyzed and draft generated' : 'No analysis yet',
        draft_response: latestDraft?.content || '',
        actions: formattedActions,
      },
    };

    return successResponse(c, response);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to fetch thread', 500);
  }
});

// PATCH /api/threads/:id - Update thread metadata
app.patch('/:id', async c => {
  try {
    const threadId = parseInt(c.req.param('id'));

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    const updates = await validateRequest(c, updateThreadSchema);
    if (!updates) {
      return errorResponse(c, 'Invalid request body', 400);
    }

    // Check thread exists
    const [existingThread] = await db
      .select({ id: threads.id })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!existingThread) {
      return notFoundResponse(c, 'Thread');
    }

    // Update thread
    if (updates.status) {
      await db
        .update(threads)
        .set({
          status: updates.status,
          updated_at: new Date(),
        })
        .where(eq(threads.id, threadId));
    }

    // TODO: Implement tags update when tags table is added

    return successResponse(c, {
      id: threadId.toString(),
      status: updates.status || existingThread.id,
      tags: updates.tags || [],
    });
  } catch (error) {
    console.error('Error updating thread:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to update thread',
      500,
    );
  }
});

// PATCH /api/threads/:id/read - Mark thread as read
app.patch('/:id/read', async c => {
  try {
    const threadId = parseInt(c.req.param('id'));

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    // Check thread exists
    const [existingThread] = await db
      .select({ id: threads.id, is_unread: threads.is_unread })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!existingThread) {
      return notFoundResponse(c, 'Thread');
    }

    // Update thread to mark as read
    await db
      .update(threads)
      .set({
        is_unread: false,
        updated_at: new Date(),
      })
      .where(eq(threads.id, threadId));

    return successResponse(c, {
      id: threadId.toString(),
      is_unread: false,
    });
  } catch (error) {
    console.error('Error marking thread as read:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to mark thread as read',
      500,
    );
  }
});

// PATCH /api/threads/:id/unread - Mark thread as unread
app.patch('/:id/unread', async c => {
  try {
    const threadId = parseInt(c.req.param('id'));

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    // Check thread exists
    const [existingThread] = await db
      .select({ id: threads.id, is_unread: threads.is_unread })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!existingThread) {
      return notFoundResponse(c, 'Thread');
    }

    // Update thread to mark as unread
    await db
      .update(threads)
      .set({
        is_unread: true,
        updated_at: new Date(),
      })
      .where(eq(threads.id, threadId));

    return successResponse(c, {
      id: threadId.toString(),
      is_unread: true,
    });
  } catch (error) {
    console.error('Error marking thread as unread:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to mark thread as unread',
      500,
    );
  }
});

export default app;
