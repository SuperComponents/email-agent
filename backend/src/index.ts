import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from './database/db.js'
import { users, threads, emails, draft_responses, agent_actions } from './database/schema.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

// Test endpoint to fetch all data from database
app.get('/db-test', async (c) => {
  try {
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
    console.error('Database test error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
