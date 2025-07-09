import { Hono } from 'hono'
import { eq, desc } from 'drizzle-orm'
import { db } from '../database/db.js'
import { threads, agent_actions, draft_responses, emails } from '../database/schema.js'
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js'
import { regenerateDraftSchema, validateRequest } from '../utils/validation.js'
import { logAgentAction } from '../database/logAgentAction.js'
import OpenAI from 'openai'
import { OPENAI_API_KEY } from '../config/env.js'

const app = new Hono()

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
})

// Helper function to generate draft response using OpenAI
async function generateDraftResponse(threadId: number, customInstructions?: string): Promise<string> {
  try {
    // Get all emails in the thread
    const threadEmails = await db
      .select({
        from_email: emails.from_email,
        to_emails: emails.to_emails,
        subject: emails.subject,
        body_text: emails.body_text,
        direction: emails.direction,
        sent_at: emails.sent_at
      })
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(emails.sent_at)

    if (threadEmails.length === 0) {
      throw new Error('No emails found in thread')
    }

    // Get thread subject
    const [thread] = await db
      .select({ subject: threads.subject })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1)

    // Format thread context for OpenAI
    const threadContext = threadEmails.map(email => {
      const timestamp = email.sent_at?.toISOString() || new Date().toISOString()
      const direction = email.direction === 'inbound' ? 'Customer' : 'Support Agent'
      return `[${timestamp}] ${direction} (${email.from_email}):\n${email.body_text}\n`
    }).join('\n')

    // Create system prompt
    const systemPrompt = `You are a professional customer support agent. You will be provided with an email thread and need to draft a helpful, professional response to the customer's latest message.

Guidelines:
- Be polite, professional, and helpful
- Address the customer's concerns directly
- Provide clear and actionable solutions when possible
- Keep the tone friendly but professional
- If you need more information, ask specific questions
- Don't make promises about things you can't deliver

IMPORTANT: Only return the email message content. Do not include any email headers, signatures, greetings like "Subject:" or "From:" or "To:", or any other metadata. Just provide the clean message body that would be sent to the customer.`

    // Create user prompt with thread context
    const userPrompt = `Please draft a professional response to this customer support email thread:

Thread Subject: ${thread?.subject || 'No Subject'}

Email Thread:
${threadContext}

${customInstructions ? `\nAdditional Instructions: ${customInstructions}` : ''}

Return ONLY the message content that should be sent to the customer - no headers, no metadata, just the clean email body.`

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const draftContent = completion.choices[0]?.message?.content
    if (!draftContent) {
      throw new Error('No response generated from OpenAI')
    }

    // Clean up the response to remove any potential metadata or formatting
    const cleanedContent = draftContent
      .replace(/^Subject:.*$/gm, '') // Remove subject lines
      .replace(/^From:.*$/gm, '') // Remove from lines
      .replace(/^To:.*$/gm, '') // Remove to lines
      .replace(/^Date:.*$/gm, '') // Remove date lines
      .replace(/^Dear.*?,?\s*/gm, '') // Remove formal greetings
      .replace(/^\s*Hi.*?,?\s*/gm, '') // Remove informal greetings  
      .replace(/^\s*Hello.*?,?\s*/gm, '') // Remove hello greetings
      .replace(/Best regards,?\s*$/gm, '') // Remove common sign-offs
      .replace(/Sincerely,?\s*$/gm, '') // Remove formal sign-offs
      .replace(/Thanks,?\s*$/gm, '') // Remove thanks sign-offs
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .trim()

    return cleanedContent
  } catch (error) {
    console.error('Error generating draft response:', error)
    throw error
  }
}

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
      description: (action.metadata as Record<string, unknown>)?.description as string || '',
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
    
    // Generate new draft content using OpenAI
    const newContent = await generateDraftResponse(threadId, body?.instructions)
    
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
        instructions: body?.instructions || null,
        model: 'gpt-4o',
        ai_generated: true
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