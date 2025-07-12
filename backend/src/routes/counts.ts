import { Hono } from 'hono';
import { sql, eq } from 'drizzle-orm';
import { db } from '../database/db.js';
import { threads, emailTags, emails } from '../database/schema.js';
import { successResponse, errorResponse } from '../utils/response.js';

const app = new Hono();

// GET /api/threads/counts - Get thread counts for filters
app.get('/counts', async c => {
  try {
    // Get basic thread counts
    const [basicCounts] = await db
      .select({
        all: sql<number>`count(*)`,
        unread: sql<number>`count(*) filter (where ${threads.is_unread} = true)`,
        closed: sql<number>`count(*) filter (where ${threads.status} = 'closed')`,
        awaiting_customer: sql<number>`count(*) filter (where ${threads.status} = 'active')`,
      })
      .from(threads);

    // Get flagged thread count by checking for threads with 'flagged' tags
    const flaggedThreadsQuery = await db
      .select({
        thread_id: emails.thread_id,
      })
      .from(emails)
      .innerJoin(emailTags, eq(emails.id, emailTags.email_id))
      .where(eq(emailTags.tag, 'flagged'))
      .groupBy(emails.thread_id);

    const flaggedCount = flaggedThreadsQuery.length;

    // Get urgent thread count by checking for threads with 'urgent' tags
    const urgentThreadsQuery = await db
      .select({
        thread_id: emails.thread_id,
      })
      .from(emails)
      .innerJoin(emailTags, eq(emails.id, emailTags.email_id))
      .where(eq(emailTags.tag, 'urgent'))
      .groupBy(emails.thread_id);

    const urgentCount = urgentThreadsQuery.length;

    return successResponse(c, {
      all: Number(basicCounts.all),
      unread: Number(basicCounts.unread),
      flagged: flaggedCount,
      urgent: urgentCount,
      awaiting_customer: Number(basicCounts.awaiting_customer),
      closed: Number(basicCounts.closed),
    });
  } catch (error) {
    console.error('Error fetching thread counts:', error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to fetch thread counts',
      500,
    );
  }
});

export default app;
