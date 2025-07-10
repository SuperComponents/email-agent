import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from './database/db.js'
import { users, threads, emails, draft_responses, agent_actions } from './database/schema.js'
import { corsMiddleware } from './middleware/cors.js'
import { errorHandler } from './middleware/error-handler.js'
import threadRoutes from './routes/threads.js'
import messageRoutes from './routes/messages.js'
import draftRoutes from './routes/drafts.js'
import agentRoutes from './routes/agent.js'
import countRoutes from './routes/counts.js'
import demoRoutes from './routes/demo.js'
import { authMiddleware } from './middleware/auth.js'

const app = new Hono()

// Apply middleware
app.use('*', corsMiddleware)
app.use('*', errorHandler)

// 🔐 Protect all API routes
app.use('/api/*', authMiddleware)

app.get('/', (c) => {
  return c.text('ProResponse AI Backend API')
})

// Test endpoint to fetch all data from database
app.get('/db-test', async (c) => {
  try {
    console.log(`[DB-Test] Starting database connection test`)
    // Fetch all data from each table
    const [
      allUsers,
      allThreads,
      allEmails,
      allDraftResponses,
      allAgentActions
    ] = await Promise.all([
      db.select().from(users),
      db.select().from(threads),
      db.select().from(emails),
      db.select().from(draft_responses),
      db.select().from(agent_actions)
    ])

    console.log(`[DB-Test] Database query successful - Users: ${allUsers.length}, Threads: ${allThreads.length}, Emails: ${allEmails.length}, Drafts: ${allDraftResponses.length}, Actions: ${allAgentActions.length}`)

    // Return all data as JSON
    return c.json({
      success: true,
      data: {
        users: {
          count: allUsers.length,
          records: allUsers
        },
        threads: {
          count: allThreads.length,
          records: allThreads
        },
        emails: {
          count: allEmails.length,
          records: allEmails
        },
        draft_responses: {
          count: allDraftResponses.length,
          records: allDraftResponses
        },
        agent_actions: {
          count: allAgentActions.length,
          records: allAgentActions
        }
      }
    })
  } catch (error) {
    console.error('[DB-Test] Database test error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500)
  }
})

// Mount API routes
// Mount routes with specific paths first to avoid conflicts
app.route('/api/threads', countRoutes)
app.route('/api/threads', threadRoutes)
app.route('/api/threads', messageRoutes)
app.route('/api/threads', draftRoutes)
app.route('/api/threads', agentRoutes)
app.route('/api/threads', demoRoutes)

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`[Server] Hono API server running on http://localhost:${info.port}`)
  console.log(`[Server] Available endpoints:`)
  console.log(`[Server] - GET / (Hello World)`)
  console.log(`[Server] - GET /db-test (Database test)`)
  console.log(`[Server] - API routes mounted from modules`)
  console.log(`[Server] Database connected and ready`)
})
