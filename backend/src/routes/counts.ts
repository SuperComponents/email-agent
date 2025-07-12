import { Hono } from 'hono';
import { sql } from 'drizzle-orm';
import { db } from '../database/db.js';
import { threads } from '../database/schema.js';
import { successResponse, errorResponse } from '../utils/response.js';

const app = new Hono();

// GET /api/threads/counts - Get thread counts for filters
app.get('/counts', async c => {
  try {
    // Get counts for different filters
    const [counts] = await db
      .select({
        all: sql<number>`count(*)`,
        closed: sql<number>`count(*) filter (where ${threads.status} = 'closed')`,
        active: sql<number>`count(*) filter (where ${threads.status} = 'active')`,
        needs_attention: sql<number>`count(*) filter (where ${threads.status} = 'needs_attention')`,
      })
      .from(threads);

    // For MVP, we'll return mock values for filters that require additional tracking
    return successResponse(c, {
      all: Number(counts.all),
      unread: 0, // TODO: Implement unread tracking
      flagged: 0, // TODO: Implement flagged tracking
      urgent: 0, // TODO: Implement urgent tracking
      awaiting_customer: Number(counts.active), // Using active as proxy
      closed: Number(counts.closed),
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
