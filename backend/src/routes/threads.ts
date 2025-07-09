import { Hono } from 'hono';
import { db } from '../database/db.js';
import { threads, emails, agent_actions } from '../database/schema.js';
import { eq, desc, and, or, like, sql } from 'drizzle-orm';

const app = new Hono();

// Helper to transform database thread to API format
async function transformThread(threadData: any): Promise<any> {
  // Get the latest email for snippet and customer info
  const threadEmails = await db
    .select()
    .from(emails)
    .where(eq(emails.thread_id, threadData.id))
    .orderBy(desc(emails.created_at))
    .limit(1);

  const latestEmail = threadEmails[0];
  const customerEmail = latestEmail?.from_email || '';
  const customerName = customerEmail.split('@')[0] || 'Unknown Customer';

  // Determine if thread is unread (simplified - you might want to track this properly)
  const isUnread = threadData.status === 'active';

  // Map database status to frontend status
  const statusMap: Record<string, string> = {
    'active': 'open',
    'closed': 'closed',
    'needs_attention': 'pending'
  };

  // Extract tags from thread (you might want to add a tags table)
  const tags: string[] = [];
  if (threadData.status === 'needs_attention') tags.push('urgent');

  return {
    id: threadData.id.toString(),
    subject: threadData.subject,
    snippet: latestEmail?.body_text?.substring(0, 100) + '...' || '',
    customer_name: customerName,
    customer_email: customerEmail,
    timestamp: threadData.last_activity_at?.toISOString() || new Date().toISOString(),
    is_unread: isUnread,
    status: statusMap[threadData.status] || 'open',
    tags: tags
  };
}

// GET /api/threads
app.get('/', async (c) => {
  try {
    const filter = c.req.query('filter');
    const search = c.req.query('search');

    let query = db.select().from(threads);

    // Apply filters
    if (filter && filter !== 'all') {
      switch (filter) {
        case 'unread':
          query = query.where(eq(threads.status, 'active'));
          break;
        case 'urgent':
          query = query.where(eq(threads.status, 'needs_attention'));
          break;
        case 'closed':
          query = query.where(eq(threads.status, 'closed'));
          break;
        // Add more filters as needed
      }
    }

    // Apply search
    if (search) {
      query = query.where(like(threads.subject, `%${search}%`));
    }

    const results = await query.orderBy(desc(threads.last_activity_at));
    
    // Transform results
    const transformedThreads = await Promise.all(
      results.map(thread => transformThread(thread))
    );

    return c.json({ threads: transformedThreads });
  } catch (error) {
    console.error('Error fetching threads:', error);
    return c.json({ error: 'Failed to fetch threads' }, 500);
  }
});

// GET /api/threads/:id
app.get('/:id', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'));
    
    const threadData = await db
      .select()
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!threadData[0]) {
      return c.json({ error: 'Thread not found' }, 404);
    }

    // Get all emails for this thread
    const threadEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(emails.created_at);

    // Get agent actions
    const threadActions = await db
      .select()
      .from(agent_actions)
      .where(eq(agent_actions.thread_id, threadId))
      .orderBy(desc(agent_actions.created_at));

    // Transform to frontend format
    const thread = threadData[0];
    const customerEmail = threadEmails[0]?.from_email || '';
    const customerName = customerEmail.split('@')[0] || 'Unknown Customer';

    const transformedEmails = threadEmails.map(email => ({
      id: email.id.toString(),
      from_name: email.from_email.split('@')[0],
      from_email: email.from_email,
      content: email.body_text || '',
      timestamp: email.created_at?.toISOString() || new Date().toISOString(),
      is_support_reply: email.direction === 'outbound'
    }));

    // Create agent activity from actions
    const agentActivity = {
      analysis: 'Email thread analyzed',
      draft_response: '',
      actions: threadActions.map(action => ({
        id: action.id.toString(),
        type: action.action,
        title: action.action.replace(/_/g, ' '),
        description: JSON.stringify(action.metadata || {}),
        timestamp: action.created_at.toISOString(),
        status: 'completed',
        result: action.metadata
      }))
    };

    const response = {
      id: thread.id.toString(),
      subject: thread.subject,
      status: thread.status === 'active' ? 'open' : thread.status,
      tags: [],
      customer: {
        name: customerName,
        email: customerEmail
      },
      emails: transformedEmails,
      agent_activity: agentActivity
    };

    return c.json(response);
  } catch (error) {
    console.error('Error fetching thread:', error);
    return c.json({ error: 'Failed to fetch thread' }, 500);
  }
});

// PUT /api/threads/:id
app.put('/:id', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'));
    const body = await c.req.json();

    const updates: any = {};
    
    if (body.status) {
      const statusMap: Record<string, string> = {
        'open': 'active',
        'closed': 'closed',
        'pending': 'needs_attention'
      };
      updates.status = statusMap[body.status] || 'active';
    }

    await db
      .update(threads)
      .set({
        ...updates,
        updated_at: new Date()
      })
      .where(eq(threads.id, threadId));

    const updated = await db
      .select()
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!updated[0]) {
      return c.json({ error: 'Thread not found' }, 404);
    }

    return c.json({
      id: updated[0].id.toString(),
      status: updated[0].status,
      tags: body.tags || []
    });
  } catch (error) {
    console.error('Error updating thread:', error);
    return c.json({ error: 'Failed to update thread' }, 500);
  }
});

// POST /api/threads/:id/messages
app.post('/:id/messages', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'));
    const body = await c.req.json();

    // Insert new email
    const [newEmail] = await db
      .insert(emails)
      .values({
        thread_id: threadId,
        from_email: 'support@proresponse.ai',
        to_emails: ['customer@example.com'], // You'd get this from thread participants
        subject: `Re: Thread ${threadId}`,
        body_text: body.content,
        body_html: `<p>${body.content}</p>`,
        direction: 'outbound',
        is_draft: false,
        sent_at: new Date()
      })
      .returning();

    // Update thread last activity
    await db
      .update(threads)
      .set({
        last_activity_at: new Date(),
        status: 'active'
      })
      .where(eq(threads.id, threadId));

    return c.json({
      id: newEmail.id.toString(),
      thread_id: threadId.toString(),
      from_name: 'Support Team',
      from_email: 'support@proresponse.ai',
      content: body.content,
      timestamp: new Date().toISOString(),
      is_support_reply: true
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return c.json({ error: 'Failed to send message' }, 500);
  }
});

// GET /api/thread-counts
app.get('/thread-counts', async (c) => {
  try {
    const [
      allCount,
      activeCount,
      closedCount,
      needsAttentionCount
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)` }).from(threads),
      db.select({ count: sql<number>`count(*)` }).from(threads).where(eq(threads.status, 'active')),
      db.select({ count: sql<number>`count(*)` }).from(threads).where(eq(threads.status, 'closed')),
      db.select({ count: sql<number>`count(*)` }).from(threads).where(eq(threads.status, 'needs_attention'))
    ]);

    return c.json({
      all: allCount[0]?.count || 0,
      unread: activeCount[0]?.count || 0,
      flagged: 0, // You'd need to implement tags
      urgent: needsAttentionCount[0]?.count || 0,
      awaiting_customer: 0, // You'd need to track this
      closed: closedCount[0]?.count || 0
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    return c.json({ error: 'Failed to fetch counts' }, 500);
  }
});

export default app;