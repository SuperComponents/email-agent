import { Hono } from 'hono'
import { eq, desc, and } from 'drizzle-orm'
import { db } from '../database/db.js'
import { threads, draft_responses } from '../database/schema.js'
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js'
import { updateDraftSchema, validateRequest } from '../utils/validation.js'
import { logAgentAction } from '../database/logAgentAction.js'

const app = new Hono()

// GET /api/threads/:id/draft - Get current draft
app.get('/:id/draft', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'))
    
    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400)
    }
    
    // Get latest draft
    const [draft] = await db
      .select({
        content: draft_responses.generated_content,
        created_at: draft_responses.created_at,
        updated_at: draft_responses.updated_at,
        status: draft_responses.status,
        created_by_user_id: draft_responses.created_by_user_id
      })
      .from(draft_responses)
      .where(
        and(
          eq(draft_responses.thread_id, threadId),
          eq(draft_responses.status, 'pending')
        )
      )
      .orderBy(desc(draft_responses.created_at))
      .limit(1)
    
    if (!draft) {
      return notFoundResponse(c, 'Draft')
    }
    
    return successResponse(c, {
      content: draft.content,
      last_updated: (draft.updated_at || draft.created_at)!.toISOString(),
      is_agent_generated: draft.created_by_user_id === null
    })
  } catch (error) {
    console.error('Error fetching draft:', error)
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to fetch draft', 500)
  }
})

// PUT /api/threads/:id/draft - Update draft
app.put('/:id/draft', async (c) => {
  try {
    const threadId = parseInt(c.req.param('id'))
    
    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400)
    }
    
    const body = await validateRequest(c, updateDraftSchema)
    if (!body) {
      return errorResponse(c, 'Invalid request body', 400)
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
    
    // Get latest email for this thread
    const [latestEmail] = await db.query.emails.findMany({
      where: eq(threads.id, threadId),
      orderBy: (emails, { desc }) => [desc(emails.created_at)],
      limit: 1
    })
    
    // Check if there's an existing pending draft
    const [existingDraft] = await db
      .select({ id: draft_responses.id })
      .from(draft_responses)
      .where(
        and(
          eq(draft_responses.thread_id, threadId),
          eq(draft_responses.status, 'pending')
        )
      )
      .orderBy(desc(draft_responses.created_at))
      .limit(1)
    
    const now = new Date()
    
    if (existingDraft) {
      // Update existing draft
      await db
        .update(draft_responses)
        .set({
          generated_content: body.content,
          updated_at: now
        })
        .where(eq(draft_responses.id, existingDraft.id))
      
      await logAgentAction({
        threadId: threadId,
        draftResponseId: existingDraft.id,
        action: 'draft_edited',
        metadata: { content_length: body.content.length }
      })
    } else {
      // Create new draft
      const [newDraft] = await db
        .insert(draft_responses)
        .values({
          email_id: latestEmail?.id || 1, // Fallback for testing
          thread_id: threadId,
          generated_content: body.content,
          status: 'pending',
          created_by_user_id: 1, // TODO: Get from auth context
          version: 1,
          confidence_score: '0.5'
        })
        .returning()
      
      await logAgentAction({
        threadId: threadId,
        draftResponseId: newDraft.id,
        action: 'draft_created',
        metadata: { content_length: body.content.length }
      })
    }
    
    return successResponse(c, {
      content: body.content,
      last_updated: now.toISOString()
    })
  } catch (error) {
    console.error('Error updating draft:', error)
    return errorResponse(c, error instanceof Error ? error.message : 'Failed to update draft', 500)
  }
})

export default app