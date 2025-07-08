import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db } from '../database/db.js'
import { threads, agent_actions, draft_responses, emails } from '../database/schema.js'
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js'
import { regenerateDraftSchema, validateRequest } from '../utils/validation.js'
import { logAgentAction } from '../database/logAgentAction.js'

const app = new Hono()

// GET /api/threads/:id/agent-activity - Get agent activity
app.get('/:id/agent-activity', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'))
    
    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400)
    }
    
    // Check thread exists
    const [thread] = await db
      .select({ id: threads.id })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1)
    
    if (!thread) {
      return notFoundResponse(c, 'Thread')
    }
    
    // Get agent actions
    const actions = await db
      .select({
        id: agent_actions.id,
        action: agent_actions.action,
        metadata: agent_actions.metadata,
        created_at: agent_actions.created_at
      })
      .from(agent_actions)
      .where(eq(agent_actions.thread_id, threadId))
      .orderBy(desc(agent_actions.created_at))
    
    // Get latest draft for analysis
    const [latestDraft] = await db
      .select({
        content: draft_responses.generated_content,
        confidence_score: draft_responses.confidence_score
      })
      .from(draft_responses)
      .where(eq(draft_responses.thread_id, threadId))
      .orderBy(desc(draft_responses.created_at))
      .limit(1)
    
    // Transform actions
    const formattedActions = actions.map(action => ({
      id: action.id.toString(),
      type: action.action,
      title: action.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: (action.metadata as any)?.description || '',
      status: 'completed',
      timestamp: action.created_at.toISOString(),
      result: action.metadata
    }))
    
    return successResponse(c, {
      analysis: latestDraft ? 'Email analyzed and response drafted' : 'No analysis performed yet',
      suggested_response: latestDraft?.content || '',
      confidence_score: latestDraft?.confidence_score ? parseFloat(latestDraft.confidence_score) : 0,
      actions: formattedActions,
      knowledge_used: [] // TODO: Implement knowledge base tracking
    })
  } catch (error) {
    console.error('Error fetching agent activity:', error)
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to fetch agent activity', 500)
  }
})

// POST /api/threads/:id/regenerate - Regenerate draft
app.post('/:id/regenerate', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'))
    
    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400)
    }
    
    const body = await validateRequest(c, regenerateDraftSchema)
    
    // Check thread exists
    const [thread] = await db
      .select()
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1)
    
    if (!thread) {
      return notFoundResponse(c, 'Thread')
    }
    
    // Get latest email
    const [latestEmail] = await db
      .select({ id: emails.id })
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(desc(emails.created_at))
      .limit(1)
    
    if (!latestEmail) {
      return errorResponse(c, 'No emails found in thread', 400)
    }
    
    // Generate new draft content (mock for now)
    const newContent = body?.instructions 
      ? `Based on your instructions: "${body.instructions}"\n\nThank you for reaching out. We appreciate your feedback and will address your concerns promptly.`
      : 'Thank you for contacting us. We have received your message and will respond as soon as possible.'
    
    // Create new draft
    const [newDraft] = await db
      .insert(draft_responses)
      .values({
        email_id: latestEmail.id,
        thread_id: threadId,
        generated_content: newContent,
        status: 'pending',
        created_by_user_id: null, // Agent generated
        version: 1,
        confidence_score: '0.85'
      })
      .returning()
    
    // Log regeneration action
    await logAgentAction({
      threadId: threadId,
      draftResponseId: newDraft.id,
      action: 'draft_created',
      metadata: { 
        regenerated: true,
        instructions: body?.instructions || null 
      }
    })
    
    return successResponse(c, {
      status: 'success',
      message: 'Draft regenerated successfully'
    })
  } catch (error) {
    console.error('Error regenerating draft:', error)
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to regenerate draft', 500)
  }
})

export default app