import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { db } from './database/db.js'
import { threads } from './database/schema.js'
import { eq, sql } from 'drizzle-orm'
import threadsRouter from './routes/threads.js'

const app = new Hono()

// Enable CORS for frontend
app.use('/*', cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true,
}))

// API routes
app.route('/api/threads', threadsRouter)

// Thread counts route
app.get('/api/thread-counts', async (c) => {
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
})

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' })
})

const port = process.env.PORT || 3000

serve({
  fetch: app.fetch,
  port: Number(port)
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
