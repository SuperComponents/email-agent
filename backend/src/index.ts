import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { db } from './database/db.js'
import { users, threads, emails, draft_responses, agent_actions } from './database/schema.js'
import { eq, desc, and, sql, like, or } from 'drizzle-orm'
import { logAgentAction } from './database/logAgentAction.js'
import { OPENAI_API_KEY } from './config/env.js'
import { assistSupportPersonEnhanced } from 'proresponse-agent'
import type { 
  EmailThread, 
  EmailMessage, 
  SupportContext, 
  AgentConfig,
  EnhancedAgentResponse 
} from 'proresponse-agent'

// Database types for helper functions
interface DatabaseThread {
  id: number
  subject: string
  participant_emails: any
  status: string
  last_activity_at: Date | null
  created_at: Date | null
  updated_at: Date | null
}

interface DatabaseEmail {
  id: number
  thread_id: number
  from_email: string
  to_emails: any
  cc_emails: any
  bcc_emails: any
  subject: string
  body_text: string | null
  body_html: string | null
  direction: 'inbound' | 'outbound'
  created_at: Date | null
}

const app = new Hono()

// Add CORS middleware for frontend integration (manual implementation)
app.use('*', async (c, next) => {
  // Set CORS headers
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  c.header('Access-Control-Allow-Credentials', 'true')
  
  // Handle preflight OPTIONS requests
  if (c.req.method === 'OPTIONS') {
    return c.text('OK', 200)
  }
  
  await next()
})

// Middleware for logging requests
app.use('*', async (c, next) => {
  const start = Date.now()
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url}`)
  await next()
  const ms = Date.now() - start
  console.log(`[${new Date().toISOString()}] ${c.req.method} ${c.req.url} - ${c.res.status} (${ms}ms)`)
})

// Middleware to check OpenAI API key for agent endpoints
app.use('/api/drafts/generate', async (c, next) => {
  if (!OPENAI_API_KEY) {
    console.error('[Agent-Integration] OPENAI_API_KEY not configured')
    return c.json({
      success: false,
      error: 'OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.'
    }, 500)
  }
  await next()
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
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

// API: Get all threads with filtering support
app.get('/api/threads', async (c) => {
  try {
    const filter = c.req.query('filter') || 'all'
    const search = c.req.query('search') || ''
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')

    console.log(`[API-Threads] Fetching threads with filter: ${filter}, search: "${search}", limit: ${limit}, offset: ${offset}`)

    // Build query conditions
    let conditions = []
    
    // Filter by status
    if (filter === 'active') {
      conditions.push(eq(threads.status, 'active'))
    } else if (filter === 'closed') {
      conditions.push(eq(threads.status, 'closed'))
    } else if (filter === 'needs_attention') {
      conditions.push(eq(threads.status, 'needs_attention'))
    }

    // Search in subject
    if (search) {
      conditions.push(like(threads.subject, `%${search}%`))
    }

    // Build final query
    const query = db
      .select({
        id: threads.id,
        subject: threads.subject,
        participant_emails: threads.participant_emails,
        status: threads.status,
        last_activity_at: threads.last_activity_at,
        created_at: threads.created_at,
        updated_at: threads.updated_at,
        email_count: sql<number>`(
          SELECT COUNT(*) FROM ${emails} 
          WHERE ${emails.thread_id} = ${threads.id}
        )`,
        draft_count: sql<number>`(
          SELECT COUNT(*) FROM ${draft_responses} 
          WHERE ${draft_responses.thread_id} = ${threads.id}
        )`,
        latest_email_preview: sql<string>`(
          SELECT ${emails.body_text} FROM ${emails} 
          WHERE ${emails.thread_id} = ${threads.id} 
          ORDER BY ${emails.created_at} DESC 
          LIMIT 1
        )`
      })
      .from(threads)
      .orderBy(desc(threads.last_activity_at))
      .limit(limit)
      .offset(offset)

    // Apply conditions if any
    if (conditions.length > 0) {
      query.where(and(...conditions))
    }

    const threadsResult = await query

    // Get total count for pagination
    const totalCountQuery = db
      .select({ count: sql<number>`COUNT(*)` })
      .from(threads)

    if (conditions.length > 0) {
      totalCountQuery.where(and(...conditions))
    }

    const [{ count: totalCount }] = await totalCountQuery

    console.log(`[API-Threads] Found ${threadsResult.length} threads (${totalCount} total)`)

    // Format response to match expected API format
    const formattedThreads = threadsResult.map(thread => ({
      id: thread.id.toString(),
      subject: thread.subject,
      snippet: thread.latest_email_preview ? 
        (thread.latest_email_preview.length > 100 ? 
          thread.latest_email_preview.substring(0, 100) + '...' : 
          thread.latest_email_preview) : 
        'No messages',
      customer_email: Array.isArray(thread.participant_emails) ? 
        thread.participant_emails.find(email => !email.includes('@yourcompany.com')) || 
        thread.participant_emails[0] : 
        'unknown@example.com',
      timestamp: thread.last_activity_at?.toISOString() || thread.created_at?.toISOString(),
      is_unread: thread.status === 'needs_attention',
      status: thread.status,
      email_count: thread.email_count,
      draft_count: thread.draft_count,
      tags: [] // TODO: Implement tags system
    }))

    return c.json({
      success: true,
      threads: formattedThreads,
      pagination: {
        total: totalCount,
        limit,
        offset,
        has_more: offset + limit < totalCount
      }
    })

  } catch (error) {
    console.error('[API-Threads] Error fetching threads:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch threads'
    }, 500)
  }
})

// API: Get thread details with all emails
app.get('/api/threads/:id', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'))
    if (isNaN(threadId)) {
      return c.json({ success: false, error: 'Invalid thread ID' }, 400)
    }

    console.log(`[API-Thread-Details] Fetching thread ${threadId} with all emails`)

    // Get thread details
    const [thread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, threadId))

    if (!thread) {
      console.log(`[API-Thread-Details] Thread ${threadId} not found`)
      return c.json({ success: false, error: 'Thread not found' }, 404)
    }

    // Get all emails in this thread
    const threadEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(emails.created_at)

    // Get latest draft response
    const latestDraft = await db
      .select()
      .from(draft_responses)
      .where(eq(draft_responses.thread_id, threadId))
      .orderBy(desc(draft_responses.created_at))
      .limit(1)

    // Get agent actions for this thread
    const agentActionsData = await db
      .select()
      .from(agent_actions)
      .where(eq(agent_actions.thread_id, threadId))
      .orderBy(desc(agent_actions.created_at))

    console.log(`[API-Thread-Details] Found thread with ${threadEmails.length} emails, ${latestDraft.length} draft(s), ${agentActionsData.length} agent actions`)

    // Format emails for frontend
    const formattedEmails = threadEmails.map(email => ({
      id: email.id.toString(),
      from_name: email.from_email.split('@')[0], // Extract name from email
      from_email: email.from_email,
      to_emails: Array.isArray(email.to_emails) ? email.to_emails : [email.to_emails],
      subject: email.subject,
      content: email.body_text || email.body_html || '',
      timestamp: email.created_at?.toISOString() || new Date().toISOString(),
      is_support_reply: email.direction === 'outbound'
    }))

    // Format agent actions
    const formattedActions = agentActionsData.map(action => ({
      id: action.id.toString(),
      type: action.action,
      title: formatActionTitle(action.action),
      description: formatActionDescription(action.action, action.metadata),
      timestamp: action.created_at?.toISOString() || new Date().toISOString(),
      status: 'completed'
    }))

    // Determine customer info from participant emails
    const participantEmails = Array.isArray(thread.participant_emails) ? thread.participant_emails : []
    const customerEmail = participantEmails.find(email => !email.includes('@yourcompany.com')) || participantEmails[0] || 'unknown@example.com'

    const response = {
      success: true,
      thread: {
        id: thread.id.toString(),
        subject: thread.subject,
        status: thread.status,
        tags: [], // TODO: Implement tags system
        customer: {
          name: customerEmail.split('@')[0],
          email: customerEmail
        },
        emails: formattedEmails,
        agent_activity: {
          analysis: latestDraft[0]?.generated_content ? 
            'Agent analyzed the email thread and generated a response draft.' : 
            'No agent analysis available yet.',
          draft_response: latestDraft[0]?.generated_content || '',
          actions: formattedActions
        },
        created_at: thread.created_at?.toISOString(),
        updated_at: thread.updated_at?.toISOString(),
        last_activity_at: thread.last_activity_at?.toISOString()
      }
    }

    return c.json(response)

  } catch (error) {
    console.error('[API-Thread-Details] Error fetching thread details:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch thread details'
    }, 500)
  }
})

// Helper function to format action titles
function formatActionTitle(action: string): string {
  switch (action) {
    case 'email_read': return 'Email Read'
    case 'email_forwarded': return 'Email Forwarded'
    case 'draft_created': return 'Draft Created'
    case 'draft_edited': return 'Draft Edited'
    case 'draft_approved': return 'Draft Approved'
    case 'draft_rejected': return 'Draft Rejected'
    case 'draft_sent': return 'Draft Sent'
    case 'thread_assigned': return 'Thread Assigned'
    case 'thread_status_changed': return 'Status Changed'
    case 'thread_archived': return 'Thread Archived'
    default: return action.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }
}

// Helper function to format action descriptions
function formatActionDescription(action: string, metadata: any): string {
  const baseDescription = {
    'email_read': 'Email was read and analyzed',
    'email_forwarded': 'Email was forwarded to another agent',
    'draft_created': 'AI generated a response draft',
    'draft_edited': 'Response draft was edited',
    'draft_approved': 'Response draft was approved for sending',
    'draft_rejected': 'Response draft was rejected',
    'draft_sent': 'Response was sent to customer',
    'thread_assigned': 'Thread was assigned to an agent',
    'thread_status_changed': 'Thread status was updated',
    'thread_archived': 'Thread was archived'
  }[action] || 'Action performed'

  // Add metadata details if available
  if (metadata && typeof metadata === 'object') {
    try {
      const metadataStr = JSON.stringify(metadata)
      if (metadataStr.length > 2) { // More than just "{}"
        return `${baseDescription} (${metadataStr})`
      }
    } catch (e) {
      // Ignore JSON stringify errors
    }
  }

  return baseDescription
}

// Helper function to convert database thread to agent EmailThread format
function convertToAgentEmailThread(thread: DatabaseThread, threadEmails: DatabaseEmail[]): any {
  console.log(`[Convert-Thread] Converting thread ${thread.id} with ${threadEmails.length} emails to agent format`)
  
  // Convert database emails to agent EmailMessage format
  const agentMessages = threadEmails.map((email: DatabaseEmail) => ({
    id: email.id.toString(),
    threadId: thread.id.toString(),
    from: email.from_email,
    to: Array.isArray(email.to_emails) ? email.to_emails : [email.to_emails],
    cc: Array.isArray(email.cc_emails) ? email.cc_emails : (email.cc_emails ? [email.cc_emails] : []),
    bcc: Array.isArray(email.bcc_emails) ? email.bcc_emails : (email.bcc_emails ? [email.bcc_emails] : []),
    subject: email.subject,
    body: email.body_text || email.body_html || '',
    timestamp: email.created_at || new Date(),
    isFromCustomer: email.direction === 'inbound',
    attachments: [], // TODO: Implement attachment support
    priority: 'normal' // TODO: Implement priority detection
  }))

  // Determine customer email
  const participantEmails = Array.isArray(thread.participant_emails) ? thread.participant_emails : []
  const customerEmail = participantEmails.find(email => !email.includes('@yourcompany.com')) || participantEmails[0] || 'unknown@example.com'

  // Create agent EmailThread object
  const agentThread = {
    id: thread.id.toString(),
    subject: thread.subject,
    messages: agentMessages,
    customerEmail: customerEmail,
    status: thread.status === 'active' ? 'open' : 
            thread.status === 'closed' ? 'resolved' : 
            thread.status === 'needs_attention' ? 'pending' : 'open',
    priority: 'normal', // TODO: Implement priority detection based on thread content
    tags: [], // TODO: Implement tags system
    assignedTo: undefined, // TODO: Implement assignment system
    createdAt: thread.created_at || new Date(),
    updatedAt: thread.updated_at || new Date(),
    internalNotes: [], // TODO: Implement internal notes
    customFields: {} // TODO: Implement custom fields
  }

  console.log(`[Convert-Thread] Converted thread with customer: ${customerEmail}, messages: ${agentMessages.length}`)
  return agentThread
}

// API: Generate draft response using the agent
app.post('/api/drafts/generate', async (c) => {
  try {
    const requestBody = await c.req.json()
    const { threadId, context } = requestBody

    if (!threadId) {
      return c.json({ success: false, error: 'Thread ID is required' }, 400)
    }

    const threadIdNum = parseInt(threadId)
    if (isNaN(threadIdNum)) {
      return c.json({ success: false, error: 'Invalid thread ID' }, 400)
    }

    console.log(`[API-Draft-Generate] Generating draft for thread ${threadIdNum}`)

    // Get thread details
    const [thread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, threadIdNum))

    if (!thread) {
      console.log(`[API-Draft-Generate] Thread ${threadIdNum} not found`)
      return c.json({ success: false, error: 'Thread not found' }, 404)
    }

    // Get all emails in this thread
    const threadEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.thread_id, threadIdNum))
      .orderBy(emails.created_at)

    if (threadEmails.length === 0) {
      console.log(`[API-Draft-Generate] No emails found in thread ${threadIdNum}`)
      return c.json({ success: false, error: 'No emails found in thread' }, 404)
    }

    // Convert to agent format
    const agentThread = convertToAgentEmailThread(thread, threadEmails)

    // Log agent action for draft generation start
    await logAgentAction({
      threadId: threadIdNum,
      action: 'draft_created',
      emailId: threadEmails[threadEmails.length - 1]?.id, // Link to latest email
      metadata: {
        agent_version: '2.0.0',
        timestamp: new Date().toISOString(),
        thread_email_count: threadEmails.length
      }
    })

    // Real agent integration - calling the enhanced agent
    console.log(`[API-Draft-Generate] Calling enhanced agent for thread ${threadIdNum}`)
    
    // Prepare optional support context (if provided in request)
    const supportContext: SupportContext = context || {}
    
    // Agent configuration
    const agentConfig: AgentConfig = {
      model: 'gpt-4o',
      includeRAG: true,
      generateThreadName: true,
      maxRAGResults: 5,
      enableSentimentAnalysis: true,
      confidenceThreshold: 0.7,
      escalationKeywords: ['legal', 'lawyer', 'manager', 'complaint', 'unacceptable', 'sue', 'cancel', 'refund immediately']
    }
    
    console.log(`[API-Draft-Generate] Agent configuration:`, agentConfig)
    
    // Call the enhanced agent
    let agentResponse: EnhancedAgentResponse
    try {
      console.log(`[API-Draft-Generate] Calling assistSupportPersonEnhanced with ${agentThread.messages.length} messages`)
      agentResponse = await assistSupportPersonEnhanced(agentThread, supportContext, agentConfig)
      console.log(`[API-Draft-Generate] Agent response received successfully`)
      console.log(`[API-Draft-Generate] Agent confidence: ${(agentResponse.confidence * 100).toFixed(1)}%`)
      console.log(`[API-Draft-Generate] Agent suggested priority: ${agentResponse.suggestedPriority}`)
      console.log(`[API-Draft-Generate] Agent escalation recommended: ${agentResponse.escalationRecommended}`)
      console.log(`[API-Draft-Generate] Agent thread name: "${agentResponse.threadName}"`)
      console.log(`[API-Draft-Generate] Agent RAG sources: ${agentResponse.ragSources?.length || 0}`)
    } catch (error) {
      console.error(`[API-Draft-Generate] Agent call failed:`, error)
      throw new Error(`Agent processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }

    // Save draft response to database
    const [insertedDraft] = await db
      .insert(draft_responses)
      .values({
        email_id: threadEmails[threadEmails.length - 1].id, // Link to latest email
        thread_id: threadIdNum,
        generated_content: agentResponse.draft,
        status: 'pending',
        created_by_user_id: null, // NULL indicates AI-generated
        version: 1,
        confidence_score: agentResponse.confidence.toString()
      })
      .returning()

    console.log(`[API-Draft-Generate] Draft ${insertedDraft.id} created for thread ${threadIdNum}`)

    // Log successful draft creation
    await logAgentAction({
      threadId: threadIdNum,
      action: 'draft_created',
      emailId: threadEmails[threadEmails.length - 1]?.id,
      draftResponseId: insertedDraft.id,
      metadata: {
        draft_id: insertedDraft.id,
        confidence_score: agentResponse.confidence,
        estimated_resolution_time: agentResponse.estimatedResolutionTime,
        agent_version: '2.0.0',
        suggested_priority: agentResponse.suggestedPriority,
        escalation_recommended: agentResponse.escalationRecommended,
        customer_sentiment: agentResponse.customerSentiment,
        rag_sources_count: agentResponse.ragSources?.length || 0,
        timestamp: new Date().toISOString()
      }
    })

    // Return response in API format
    return c.json({
      success: true,
      draft: {
        id: insertedDraft.id.toString(),
        content: agentResponse.draft,
        confidence: agentResponse.confidence,
        status: 'pending',
        created_at: insertedDraft.created_at?.toISOString(),
        metadata: {
          thread_name: agentResponse.threadName,
          reasoning: agentResponse.reasoning,
          suggested_priority: agentResponse.suggestedPriority,
          escalation_recommended: agentResponse.escalationRecommended,
          follow_up_required: agentResponse.followUpRequired,
          estimated_resolution_time: agentResponse.estimatedResolutionTime,
          customer_sentiment: agentResponse.customerSentiment,
          tags: agentResponse.tags || [],
          additional_actions: agentResponse.additionalActions || [],
          rag_sources: agentResponse.ragSources || []
        }
      }
    })

  } catch (error) {
    console.error('[API-Draft-Generate] Error generating draft:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate draft'
    }, 500)
  }
})

// API: Get draft details
app.get('/api/drafts/:id', async (c) => {
  try {
    const draftId = parseInt(c.req.param('id'))
    if (isNaN(draftId)) {
      return c.json({ success: false, error: 'Invalid draft ID' }, 400)
    }

    console.log(`[API-Draft-Details] Fetching draft ${draftId}`)

    // Get draft details with related thread and email info
    const [draft] = await db
      .select({
        id: draft_responses.id,
        email_id: draft_responses.email_id,
        thread_id: draft_responses.thread_id,
        generated_content: draft_responses.generated_content,
        status: draft_responses.status,
        created_by_user_id: draft_responses.created_by_user_id,
        version: draft_responses.version,
        parent_draft_id: draft_responses.parent_draft_id,
        confidence_score: draft_responses.confidence_score,
        created_at: draft_responses.created_at,
        updated_at: draft_responses.updated_at,
        thread_subject: threads.subject,
        email_subject: emails.subject
      })
      .from(draft_responses)
      .leftJoin(threads, eq(draft_responses.thread_id, threads.id))
      .leftJoin(emails, eq(draft_responses.email_id, emails.id))
      .where(eq(draft_responses.id, draftId))

    if (!draft) {
      console.log(`[API-Draft-Details] Draft ${draftId} not found`)
      return c.json({ success: false, error: 'Draft not found' }, 404)
    }

    console.log(`[API-Draft-Details] Found draft ${draftId} with status: ${draft.status}`)

    return c.json({
      success: true,
      draft: {
        id: draft.id.toString(),
        content: draft.generated_content,
        status: draft.status,
        confidence: draft.confidence_score ? parseFloat(draft.confidence_score) : null,
        version: draft.version,
        thread_id: draft.thread_id.toString(),
        thread_subject: draft.thread_subject,
        email_id: draft.email_id.toString(),
        email_subject: draft.email_subject,
        created_by_ai: draft.created_by_user_id === null,
        created_at: draft.created_at?.toISOString(),
        updated_at: draft.updated_at?.toISOString()
      }
    })

  } catch (error) {
    console.error('[API-Draft-Details] Error fetching draft:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch draft'
    }, 500)
  }
})

// API: Approve draft
app.post('/api/drafts/:id/approve', async (c) => {
  try {
    const draftId = parseInt(c.req.param('id'))
    if (isNaN(draftId)) {
      return c.json({ success: false, error: 'Invalid draft ID' }, 400)
    }

    console.log(`[API-Draft-Approve] Approving draft ${draftId}`)

    // Update draft status to approved
    const [updatedDraft] = await db
      .update(draft_responses)
      .set({
        status: 'approved',
        updated_at: new Date()
      })
      .where(eq(draft_responses.id, draftId))
      .returning()

    if (!updatedDraft) {
      console.log(`[API-Draft-Approve] Draft ${draftId} not found`)
      return c.json({ success: false, error: 'Draft not found' }, 404)
    }

    // Log approval action
    await logAgentAction({
      threadId: updatedDraft.thread_id,
      action: 'draft_approved',
      emailId: updatedDraft.email_id,
      draftResponseId: updatedDraft.id,
      metadata: {
        draft_id: updatedDraft.id,
        previous_status: 'pending',
        new_status: 'approved',
        timestamp: new Date().toISOString()
      }
    })

    console.log(`[API-Draft-Approve] Draft ${draftId} approved successfully`)

    return c.json({
      success: true,
      draft: {
        id: updatedDraft.id.toString(),
        status: updatedDraft.status,
        updated_at: updatedDraft.updated_at?.toISOString()
      }
    })

  } catch (error) {
    console.error('[API-Draft-Approve] Error approving draft:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to approve draft'
    }, 500)
  }
})

// API: Reject draft
app.post('/api/drafts/:id/reject', async (c) => {
  try {
    const draftId = parseInt(c.req.param('id'))
    if (isNaN(draftId)) {
      return c.json({ success: false, error: 'Invalid draft ID' }, 400)
    }

    const requestBody = await c.req.json()
    const { reason } = requestBody

    console.log(`[API-Draft-Reject] Rejecting draft ${draftId} with reason: ${reason || 'No reason provided'}`)

    // Update draft status to rejected
    const [updatedDraft] = await db
      .update(draft_responses)
      .set({
        status: 'rejected',
        updated_at: new Date()
      })
      .where(eq(draft_responses.id, draftId))
      .returning()

    if (!updatedDraft) {
      console.log(`[API-Draft-Reject] Draft ${draftId} not found`)
      return c.json({ success: false, error: 'Draft not found' }, 404)
    }

    // Log rejection action
    await logAgentAction({
      threadId: updatedDraft.thread_id,
      action: 'draft_rejected',
      emailId: updatedDraft.email_id,
      draftResponseId: updatedDraft.id,
      metadata: {
        draft_id: updatedDraft.id,
        previous_status: 'pending',
        new_status: 'rejected',
        rejection_reason: reason || 'No reason provided',
        timestamp: new Date().toISOString()
      }
    })

    console.log(`[API-Draft-Reject] Draft ${draftId} rejected successfully`)

    return c.json({
      success: true,
      draft: {
        id: updatedDraft.id.toString(),
        status: updatedDraft.status,
        updated_at: updatedDraft.updated_at?.toISOString()
      }
    })

  } catch (error) {
    console.error('[API-Draft-Reject] Error rejecting draft:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to reject draft'
    }, 500)
  }
})

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`[Server] Hono API server running on http://localhost:${info.port}`)
  console.log(`[Server] Available endpoints:`)
  console.log(`[Server] - GET / (Hello World)`)
  console.log(`[Server] - GET /db-test (Database test)`)
  console.log(`[Server] - GET /api/threads (List threads with filtering)`)
  console.log(`[Server] - GET /api/threads/:id (Get thread details)`)
  console.log(`[Server] - POST /api/drafts/generate (Generate draft response)`)
  console.log(`[Server] - GET /api/drafts/:id (Get draft details)`)
  console.log(`[Server] - POST /api/drafts/:id/approve (Approve draft)`)
  console.log(`[Server] - POST /api/drafts/:id/reject (Reject draft)`)
  console.log(`[Server] Database connected and ready`)
})
