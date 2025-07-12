import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { db } from '../database/db.js';
import { threads, agent_actions, draft_responses, emails } from '../database/schema.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js';
import { regenerateDraftSchema, validateRequest } from '../utils/validation.js';
// import type {
//   EmailThread,
//   EmailMessage,
//   SupportContext,
//   AgentConfig
// } from 'proresponse-agent'
import { processEmail } from 'agent3';

const app = new Hono();

// Type definitions
interface AgentMetadata {
  confidence_score?: string | number;
  confidence?: string | number;
  customer_sentiment?: string;
  escalation_recommended?: boolean;
  rag_sources_count?: number;
  suggested_priority?: string;
}

interface AgentResponse {
  history?: Array<unknown>;
  [key: string]: unknown;
}

// Helper function to convert database thread to agent EmailThread format
// function convertToAgentEmailThread(thread: DatabaseThread, threadEmails: DatabaseEmail[]): EmailThread {
//   console.log(`[Agent-Convert] Converting thread ${thread.id} with ${threadEmails.length} emails to agent format`)
//
//   // Convert database emails to agent EmailMessage format
//   const agentMessages: EmailMessage[] = threadEmails.map((email: DatabaseEmail) => ({
//     id: email.id.toString(),
//     threadId: thread.id.toString(),
//     from: email.from_email,
//     to: Array.isArray(email.to_emails) ? email.to_emails : [email.to_emails],
//     cc: Array.isArray(email.cc_emails) ? email.cc_emails : (email.cc_emails ? [email.cc_emails] : []),
//     bcc: Array.isArray(email.bcc_emails) ? email.bcc_emails : (email.bcc_emails ? [email.bcc_emails] : []),
//     subject: email.subject,
//     body: email.body_text || email.body_html || '',
//     timestamp: email.sent_at || email.created_at || new Date(),
//     isFromCustomer: email.direction === 'inbound',
//     attachments: [], // TODO: Implement attachment support
//     priority: 'normal' // TODO: Implement priority detection
//   }))
//
//   // Determine customer email
//   const participantEmails = Array.isArray(thread.participant_emails) ? thread.participant_emails : []
//   const customerEmail = participantEmails.find(email => !email.includes('@proresponse.ai') && !email.includes('@yourcompany.com')) || participantEmails[0] || 'unknown@example.com'
//
//   // Create agent EmailThread object
//   const agentThread: EmailThread = {
//     id: thread.id.toString(),
//     subject: thread.subject,
//     messages: agentMessages,
//     customerEmail: customerEmail,
//     status: thread.status === 'active' ? 'open' :
//             thread.status === 'closed' ? 'resolved' :
//             thread.status === 'needs_attention' ? 'pending' : 'open',
//     priority: 'normal', // TODO: Implement priority detection based on thread content
//     tags: [], // TODO: Implement tags system
//     assignedTo: undefined, // TODO: Implement assignment system
//     createdAt: thread.created_at || new Date(),
//     updatedAt: thread.updated_at || new Date(),
//     internalNotes: [], // TODO: Implement internal notes
//     customFields: {} // TODO: Implement custom fields
//   }
//
//   console.log(`[Agent-Convert] Converted thread with customer: ${customerEmail}, messages: ${agentMessages.length}`)
//   return agentThread
// }

// Enhanced helper function to generate draft response using proresponse-agent
async function generateEnhancedDraftResponse(
  threadId: number,
  // customInstructions?: string,
  // supportContext?: SupportContext
) {
  try {
    console.log(`[Agent-Enhanced] Starting enhanced draft generation for thread ${threadId}`);

    // Get thread details
    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);

    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    // Get all emails in the thread
    const threadEmails = await db
      .select({
        id: emails.id,
        thread_id: emails.thread_id,
        from_email: emails.from_email,
        to_emails: emails.to_emails,
        cc_emails: emails.cc_emails,
        bcc_emails: emails.bcc_emails,
        subject: emails.subject,
        body_text: emails.body_text,
        body_html: emails.body_html,
        direction: emails.direction,
        sent_at: emails.sent_at,
        created_at: emails.created_at,
      })
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(emails.created_at);

    if (threadEmails.length === 0) {
      throw new Error(`No emails found in thread ${threadId}`);
    }

    console.log(`[Agent-Enhanced] Found ${threadEmails.length} emails in thread ${threadId}`);

    // Convert to agent format
    // const agentThread = convertToAgentEmailThread(thread, threadEmails)

    // Prepare enhanced support context
    // const enhancedContext: SupportContext = {
    //   ...supportContext,
    //   internalNotes: customInstructions ? [customInstructions] : undefined,
    //   urgencyReason: thread.status === 'needs_attention' ? 'Thread marked as needs attention' : undefined,
    //   escalationLevel: 'none' // TODO: Implement escalation tracking
    // }

    // Agent configuration with enhanced features
    const agentConfig = {
      model: 'gpt-4o',
      includeRAG: true,
      generateThreadName: true,
      maxRAGResults: 5,
      enableSentimentAnalysis: true,
      confidenceThreshold: 0.7,
      escalationKeywords: [
        'legal',
        'lawyer',
        'attorney',
        'sue',
        'lawsuit',
        'manager',
        'supervisor',
        'escalate',
        'complaint',
        'unacceptable',
        'terrible',
        'horrible',
        'awful',
        'cancel',
        'refund immediately',
        'switch',
        'competitor',
        'frustrated',
        'angry',
        'disappointed',
        'furious',
      ],
    };

    console.log(`[Agent-Enhanced] Calling enhanced agent with config:`, agentConfig);

    // Call the enhanced agent
    // const agentResponse = await assistSupportPersonEnhanced(agentThread, enhancedContext, agentConfig)
    const logger = (message: unknown) => {
      console.log(message);
    };
    const agentResponse = await processEmail(threadId, logger);
    // const agentResponse = {
    //   success: true,
    //   message: 'Agent processing temporarily disabled',
    //   draft: 'This is a placeholder draft response.',
    //   analysis: 'Agent analysis temporarily disabled.',
    //   history: []
    // }

    console.log('agentResponse');
    console.log(agentResponse);
    console.log('agentResponse.history');
    console.log((agentResponse as unknown as AgentResponse)?.history?.forEach(x => console.log(x)));
    //     console.log('summary');
    //     console.log(agentResponse.summary);

    console.log(`[Agent-Enhanced] Enhanced agent response received successfully`);
    //     console.log(`[Agent-Enhanced] Agent confidence: ${(agentResponse.confidence * 100).toFixed(1)}%`)
    //     console.log(`[Agent-Enhanced] Agent suggested priority: ${agentResponse.suggestedPriority}`)
    //     console.log(`[Agent-Enhanced] Agent escalation recommended: ${agentResponse.escalationRecommended}`)
    //     console.log(`[Agent-Enhanced] Agent thread name: "${agentResponse.threadName}"`)
    //     console.log(`[Agent-Enhanced] Agent customer sentiment: ${agentResponse.customerSentiment}`)
    //     console.log(`[Agent-Enhanced] Agent RAG sources: ${agentResponse.ragSources?.length || 0}`)

    return agentResponse;
  } catch (error) {
    console.error(`[Agent-Enhanced] Error in enhanced draft generation:`, error);
    throw error;
  }
}

// GET /api/threads/:id/agent-activity - Get agent activity
app.get('/:id/agent-activity', async c => {
  try {
    const threadId = parseInt(c.req.param('id'));

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    // console.log(`[Agent-Activity] Fetching agent activity for thread ${threadId}`)

    // Check thread exists
    const [thread] = await db
      .select({ id: threads.id })
      .from(threads)
      .where(eq(threads.id, threadId))
      .limit(1);

    if (!thread) {
      return notFoundResponse(c, 'Thread');
    }

    // Get agent actions
    const actions = await db
      .select({
        id: agent_actions.id,
        action: agent_actions.action,
        description: agent_actions.description,
        metadata: agent_actions.metadata,
        created_at: agent_actions.created_at,
      })
      .from(agent_actions)
      .where(eq(agent_actions.thread_id, threadId))
      .orderBy(desc(agent_actions.created_at));

    // Get latest draft for analysis
    const [latestDraft] = await db
      .select({
        content: draft_responses.generated_content,
        confidence_score: draft_responses.confidence_score,
        created_at: draft_responses.created_at,
      })
      .from(draft_responses)
      .where(eq(draft_responses.thread_id, threadId))
      .orderBy(desc(draft_responses.created_at))
      .limit(1);

    // console.log(`[Agent-Activity] Found ${actions.length} actions and ${latestDraft ? 1 : 0} draft(s) for thread ${threadId}`)

    // Transform actions with enhanced metadata
    const formattedActions = actions.map(action => {
      const metadata = (action.metadata as AgentMetadata) || {};
      return {
        id: action.id.toString(),
        type: action.action,
        title: action.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: action.description || formatActionDescription(action.action, metadata),
        status: 'completed',
        timestamp: action.created_at.toISOString(),
        result: {
          ...metadata,
          confidence: metadata.confidence_score || metadata.confidence || null,
          sentiment: metadata.customer_sentiment || null,
          escalation_recommended: metadata.escalation_recommended || false,
          rag_sources_used: metadata.rag_sources_count || 0,
          suggested_priority: metadata.suggested_priority || null,
        },
      };
    });

    // Build enhanced analysis summary
    const analysisText = latestDraft
      ? 'Thread analyzed with enhanced AI agent including sentiment analysis, RAG knowledge integration, and escalation assessment.'
      : 'No analysis performed yet. Click "Generate Response" to activate enhanced AI analysis.';

    const knowledgeUsed = actions
      .filter(
        action =>
          action.metadata &&
          (action.metadata as AgentMetadata).rag_sources_count &&
          (action.metadata as AgentMetadata).rag_sources_count! > 0,
      )
      .map(action => ({
        source: 'Company Knowledge Base',
        relevance: 0.9,
        used_at: action.created_at.toISOString(),
      }));

    return successResponse(c, {
      analysis: analysisText,
      suggested_response: latestDraft?.content || '',
      confidence_score: latestDraft?.confidence_score
        ? parseFloat(latestDraft.confidence_score)
        : 0,
      actions: formattedActions,
      knowledge_used: knowledgeUsed,
      enhanced_features: {
        sentiment_analysis: true,
        rag_integration: true,
        escalation_detection: true,
        thread_naming: true,
        priority_assessment: true,
      },
    });
  } catch (error) {
    console.error(`[Agent-Activity] Error fetching agent activity:`, error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to fetch agent activity',
      500,
    );
  }
});

// POST /api/threads/:id/regenerate - Regenerate draft using enhanced agent
app.post('/:id/regenerate', async c => {
  try {
    const threadId = parseInt(c.req.param('id'));

    if (isNaN(threadId)) {
      return errorResponse(c, 'Invalid thread ID', 400);
    }

    console.log(`[Agent-Regenerate] Starting enhanced draft regeneration for thread ${threadId}`);

    await validateRequest(c, regenerateDraftSchema);

    // Check thread exists
    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);

    if (!thread) {
      return notFoundResponse(c, 'Thread');
    }

    // Get latest email
    const [latestEmail] = await db
      .select({ id: emails.id })
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .orderBy(desc(emails.created_at))
      .limit(1);

    if (!latestEmail) {
      return errorResponse(c, 'No emails found in thread', 400);
    }

    // Generate enhanced draft response
    const enhancedResponse = await generateEnhancedDraftResponse(threadId);

    // Create new draft with enhanced metadata
    //     const [newDraft] = await db
    //       .insert(draft_responses)
    //       .values({
    //         email_id: latestEmail.id,
    //         thread_id: threadId,
    //         generated_content: enhancedResponse.draft,
    //         status: 'pending',
    //         created_by_user_id: null, // Agent generated
    //         version: 1,
    //         confidence_score: enhancedResponse.confidence.toString()
    //       })
    //       .returning()
    //
    //     console.log(`[Agent-Regenerate] Draft ${newDraft.id} created with enhanced features`)
    //
    //     // Log enhanced regeneration action with full metadata
    //     await logAgentAction({
    //       threadId: threadId,
    //       draftResponseId: newDraft.id,
    //       action: 'draft_created',
    //       metadata: {
    //         regenerated: true,
    //         instructions: body?.instructions || null,
    //         model: 'gpt-4o',
    //         ai_generated: true,
    //         enhanced_agent: true,
    //         thread_name: enhancedResponse.threadName,
    //         confidence_score: enhancedResponse.confidence,
    //         suggested_priority: enhancedResponse.suggestedPriority,
    //         escalation_recommended: enhancedResponse.escalationRecommended,
    //         customer_sentiment: enhancedResponse.customerSentiment,
    //         follow_up_required: enhancedResponse.followUpRequired,
    //         estimated_resolution_time: enhancedResponse.estimatedResolutionTime,
    //         rag_sources_count: enhancedResponse.ragSources?.length || 0,
    //         tags_suggested: enhancedResponse.tags || [],
    //         additional_actions: enhancedResponse.additionalActions || [],
    //         reasoning: enhancedResponse.reasoning,
    //         timestamp: new Date().toISOString()
    //       }
    //     })

    // Update thread with enhanced metadata if available
    //    if (enhancedResponse.suggestedPriority || enhancedResponse.escalationRecommended) {
    //      const updateData: any = {
    //        updated_at: new Date()
    //      }
    //
    //      // Update status if escalation is recommended
    //      if (enhancedResponse.escalationRecommended && thread.status !== 'needs_attention') {
    //        updateData.status = 'needs_attention'
    //      }
    //
    //      await db
    //        .update(threads)
    //        .set(updateData)
    //        .where(eq(threads.id, threadId))
    //    }

    console.log(`[Agent-Regenerate] Enhanced draft regeneration completed successfully`);

    return successResponse(c, {
      status: 'success',
      message: 'Enhanced draft regenerated successfully',
      draft_id: enhancedResponse.draft.id.toString(),
      //       enhanced_features: {
      //         thread_name: enhancedResponse.threadName,
      //         confidence: enhancedResponse.confidence,
      //         suggested_priority: enhancedResponse.suggestedPriority,
      //         escalation_recommended: enhancedResponse.escalationRecommended,
      //         customer_sentiment: enhancedResponse.customerSentiment,
      //         rag_sources_used: enhancedResponse.ragSources?.length || 0,
      //         tags_suggested: enhancedResponse.tags || [],
      //         estimated_resolution_time: enhancedResponse.estimatedResolutionTime
      //       }
    });
  } catch (error) {
    console.error(`[Agent-Regenerate] Error in enhanced draft regeneration:`, error);
    return errorResponse(
      c,
      error instanceof Error ? error.message : 'Failed to regenerate enhanced draft',
      500,
    );
  }
});

// Helper function to format action descriptions
function formatActionDescription(action: string, metadata: AgentMetadata): string {
  const baseDescription =
    {
      email_read: 'Email analyzed with enhanced AI agent',
      email_forwarded: 'Email forwarded to another team member',
      draft_created: 'Response draft generated with RAG integration and sentiment analysis',
      draft_edited: 'Response draft manually edited',
      draft_approved: 'Response draft approved for sending',
      draft_rejected: 'Response draft rejected and needs revision',
      draft_sent: 'Response sent to customer',
      thread_assigned: 'Thread assigned to support agent',
      thread_status_changed: 'Thread status updated',
      thread_archived: 'Thread archived',
    }[action] || 'Enhanced agent action performed';

  // Add enhanced metadata details
  const details = [];
  if (metadata.confidence_score || metadata.confidence) {
    const confidence = metadata.confidence_score || metadata.confidence;
    const confidenceValue = typeof confidence === 'string' ? parseFloat(confidence) : confidence;
    if (typeof confidenceValue === 'number' && !isNaN(confidenceValue)) {
      details.push(`Confidence: ${(confidenceValue * 100).toFixed(1)}%`);
    }
  }
  if (metadata.customer_sentiment) {
    details.push(`Sentiment: ${metadata.customer_sentiment}`);
  }
  if (metadata.escalation_recommended) {
    details.push('Escalation recommended');
  }
  if (metadata.rag_sources_count && metadata.rag_sources_count > 0) {
    details.push(`${metadata.rag_sources_count} knowledge sources used`);
  }
  if (metadata.suggested_priority) {
    details.push(`Priority: ${metadata.suggested_priority}`);
  }

  return details.length > 0 ? `${baseDescription} (${details.join(', ')})` : baseDescription;
}

export default app;
