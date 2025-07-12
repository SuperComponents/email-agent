import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { db } from '../database/db.js';
import { threads, agent_actions, draft_responses, emails } from '../database/schema.js';
import { successResponse, notFoundResponse, errorResponse } from '../utils/response.js';
import { regenerateDraftSchema, validateRequest } from '../utils/validation.js';
import { workerManager } from '../services/worker-interface.js';
import type { Event } from '@proresponse/agent';
import { type EnhancedAgentMetadata } from '../services/agent-metadata-types.js';

const app = new Hono();

// Type definitions - using enhanced metadata from the new type system
// Legacy interface for backwards compatibility
interface LegacyAgentMetadata {
  confidence_score?: string | number;
  confidence?: string | number;
  customer_sentiment?: string;
  escalation_recommended?: boolean;
  rag_sources_count?: number;
  suggested_priority?: string;
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

// Enhanced helper function to generate draft response using agent4 worker
async function generateEnhancedDraftResponse(
  threadId: number,
  userMessage?: string
): Promise<{ success: boolean; message: string; threadId: number }> {
  try {
    console.log(`[Agent-Enhanced] Starting enhanced draft generation for thread ${threadId}`);

    // Check if thread exists
    const [thread] = await db.select().from(threads).where(eq(threads.id, threadId)).limit(1);
    if (!thread) {
      throw new Error(`Thread ${threadId} not found`);
    }

    // Check if emails exist in thread
    const threadEmails = await db
      .select({ id: emails.id })
      .from(emails)
      .where(eq(emails.thread_id, threadId))
      .limit(1);

    if (threadEmails.length === 0) {
      throw new Error(`No emails found in thread ${threadId}`);
    }

    console.log(`[Agent-Enhanced] Starting worker for thread ${threadId}`);

    // Get initial event state for the thread (existing agent actions)
    const existingActions = await db
      .select()
      .from(agent_actions)
      .where(eq(agent_actions.thread_id, threadId))
      .orderBy(agent_actions.created_at);

    const initialEvents: Event[] = existingActions.map(action => ({
      id: action.id.toString(),
      timestamp: action.created_at,
      type: action.action,
      actor: 'system',
      data: action.metadata || {}
    }));

    // Add user message as an event if provided
    if (userMessage) {
      initialEvents.push({
        id: `user_message_${Date.now()}`,
        timestamp: new Date(),
        type: 'user_message',
        actor: 'user',
        data: { message: userMessage }
      });
    }

    // Start the worker for this thread
    const worker = await workerManager.startWorkerForThread(threadId, initialEvents);

    // Set up a promise to wait for completion
    const agentResponse = await new Promise<{ success: boolean; message: string; threadId: number }>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Agent processing timeout'));
      }, 120000); // 2 minute timeout

      worker.on('stopped', () => {
        clearTimeout(timeout);
        resolve({
          success: true,
          message: 'Agent processing completed',
          threadId: threadId
        });
      });

      worker.on('failed', (error) => {
        clearTimeout(timeout);
        reject(error);
      });

      worker.on('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });

    console.log(`[Agent-Enhanced] Enhanced agent processing completed successfully`);
    return agentResponse;

  } catch (error) {
    console.error(`[Agent-Enhanced] Error in enhanced draft generation:`, error);
    // Clean up worker if it exists
    try {
      await workerManager.stopWorkerForThread(threadId, 'Error occurred');
    } catch (cleanupError) {
      console.error(`[Agent-Enhanced] Error during cleanup:`, cleanupError);
    }
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
      // The metadata is now already in enhanced format thanks to agent-worker.ts
      const metadata = (action.metadata as EnhancedAgentMetadata) || {};
      
      // For backwards compatibility, also check legacy format
      const legacyMetadata = (action.metadata as LegacyAgentMetadata) || {};
      
      return {
        id: action.id.toString(),
        type: action.action,
        title: action.action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: action.description || formatActionDescription(action.action, metadata, legacyMetadata),
        status: 'completed',
        timestamp: action.created_at.toISOString(),
        result: {
          // Use enhanced metadata with fallbacks to legacy format
          confidence: metadata.confidence ?? legacyMetadata.confidence ?? legacyMetadata.confidence_score ?? null,
          sentiment: metadata.sentiment ?? legacyMetadata.customer_sentiment ?? null,
          escalation_recommended: metadata.escalation_recommended ?? legacyMetadata.escalation_recommended ?? false,
          rag_sources_used: metadata.rag_sources_used ?? legacyMetadata.rag_sources_count ?? 0,
          suggested_priority: metadata.suggested_priority ?? legacyMetadata.suggested_priority ?? null,
          
          // Additional enhanced fields
          tool_name: metadata.tool_name,
          processing_time_ms: metadata.processing_time_ms,
          
          // Complete tool input/output for frontend access
          tool_input: metadata.tool_input || {},
          tool_output: metadata.tool_output || {},
          
          // Raw metadata for maximum flexibility
          raw_metadata: metadata,
          raw_legacy_metadata: legacyMetadata || {},
          
          // Computed fields for easy frontend access
          has_draft_content: !!(metadata.tool_output?.body || metadata.tool_output?.draft || metadata.tool_output?.final_draft),
          draft_subject: metadata.tool_output?.subject || null,
          draft_body_preview: metadata.tool_output?.body ? metadata.tool_output.body.substring(0, 200) : null,
          draft_tags: metadata.tool_output?.tags || [],
          urgency_change: metadata.tool_output?.old_urgency && metadata.tool_output?.new_urgency ? 
            `${metadata.tool_output.old_urgency} → ${metadata.tool_output.new_urgency}` : null,
          category_change: metadata.tool_output?.old_category && metadata.tool_output?.new_category ? 
            `${metadata.tool_output.old_category} → ${metadata.tool_output.new_category}` : null,
          action_reason: metadata.tool_output?.reason || null,
          suggested_actions: metadata.tool_output?.suggested_actions || [],
          context_summary: metadata.tool_output?.summary || null,
          key_points: metadata.tool_output?.key_points || [],
          recommended_actions: metadata.tool_output?.recommended_actions || [],
          
          // Include full metadata for debugging/advanced use
          ...metadata,
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
          (action.metadata as LegacyAgentMetadata).rag_sources_count &&
          (action.metadata as LegacyAgentMetadata).rag_sources_count! > 0,
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

    const body = await validateRequest(c, regenerateDraftSchema);

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
    const enhancedResponse = await generateEnhancedDraftResponse(threadId, body?.userMessage);

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
      thread_id: enhancedResponse.threadId,
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

// Helper function to format action descriptions with ALL agent event data
function formatActionDescription(action: string, metadata: EnhancedAgentMetadata, legacyMetadata?: LegacyAgentMetadata): string {
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
      internal_note_created: 'Internal note or user message recorded',
    }[action] || 'Enhanced agent action performed';

  // Show ALL available metadata for complete visibility
  const allData = [];
  
  // Original tool name
  if (metadata.tool_name) {
    allData.push(`Tool: ${metadata.tool_name}`);
  }
  
  // Core analysis fields
  const confidence = metadata.confidence ?? legacyMetadata?.confidence ?? legacyMetadata?.confidence_score;
  if (confidence != null) {
    const confidenceValue = typeof confidence === 'string' ? parseFloat(confidence) : confidence;
    if (typeof confidenceValue === 'number' && !isNaN(confidenceValue)) {
      allData.push(`Confidence: ${(confidenceValue * 100).toFixed(1)}%`);
    }
  }
  
  const sentiment = metadata.sentiment ?? legacyMetadata?.customer_sentiment;
  if (sentiment) {
    allData.push(`Sentiment: ${sentiment}`);
  }
  
  const escalationRecommended = metadata.escalation_recommended ?? legacyMetadata?.escalation_recommended;
  if (escalationRecommended) {
    allData.push(`Escalation: RECOMMENDED`);
  }
  
  const suggestedPriority = metadata.suggested_priority ?? legacyMetadata?.suggested_priority;
  if (suggestedPriority) {
    allData.push(`Priority: ${suggestedPriority}`);
  }
  
  const ragSources = metadata.rag_sources_used ?? legacyMetadata?.rag_sources_count;
  if (ragSources && ragSources > 0) {
    allData.push(`RAG Sources: ${ragSources}`);
  }
  
  // Performance metrics
  if (metadata.processing_time_ms) {
    allData.push(`Processing: ${metadata.processing_time_ms}ms`);
  }
  
  // Tool input summary (show key fields)
  if (metadata.tool_input && Object.keys(metadata.tool_input).length > 0) {
    const inputKeys = Object.keys(metadata.tool_input).slice(0, 3); // Show first 3 keys
    allData.push(`Input Keys: [${inputKeys.join(', ')}]`);
  }
  
  // Tool output summary (show structure)
  if (metadata.tool_output && Object.keys(metadata.tool_output).length > 0) {
    const outputKeys = Object.keys(metadata.tool_output);
    
    // Show specific important output fields based on tool type
    if (metadata.tool_name?.includes('compose') || metadata.tool_name?.includes('draft')) {
      // For draft tools, show draft details
      const output = metadata.tool_output;
      if (output.subject) allData.push(`Subject: "${output.subject}"`);
      if (output.priority) allData.push(`Draft Priority: ${output.priority}`);
      if (output.tags?.length) allData.push(`Tags: [${output.tags.slice(0, 3).join(', ')}]`);
      if (output.body) {
        const bodyPreview = output.body.substring(0, 100);
        allData.push(`Body Preview: "${bodyPreview}${output.body.length > 100 ? '...' : ''}"`);
      }
    } else if (metadata.tool_name?.includes('urgency')) {
      // For urgency tools, show urgency changes
      const output = metadata.tool_output;
      if (output.old_urgency && output.new_urgency) {
        allData.push(`Urgency: ${output.old_urgency} → ${output.new_urgency}`);
      }
    } else if (metadata.tool_name?.includes('category')) {
      // For category tools, show category changes
      const output = metadata.tool_output;
      if (output.old_category && output.new_category) {
        allData.push(`Category: ${output.old_category} → ${output.new_category}`);
      }
    } else if (metadata.tool_name?.includes('action_needed')) {
      // For user action tools, show reason and priority
      const output = metadata.tool_output;
      if (output.reason) allData.push(`Reason: "${output.reason}"`);
      if (output.suggested_actions?.length) {
        allData.push(`Suggested: [${output.suggested_actions.slice(0, 2).join(', ')}]`);
      }
    } else if (metadata.tool_name?.includes('summarize')) {
      // For context tools, show summary info
      const output = metadata.tool_output;
      if (output.summary) {
        const summaryPreview = output.summary.substring(0, 150);
        allData.push(`Summary: "${summaryPreview}${output.summary.length > 150 ? '...' : ''}"`);
      }
      if (output.key_points?.length) {
        allData.push(`Key Points: ${output.key_points.length} items`);
      }
      if (output.recommended_actions?.length) {
        allData.push(`Recommendations: ${output.recommended_actions.length} items`);
      }
    } else {
      // Generic output info for unknown tools
      allData.push(`Output Keys: [${outputKeys.slice(0, 4).join(', ')}]`);
    }
  }
  
  // Legacy metadata fields for backwards compatibility
  if (legacyMetadata) {
    const legacyKeys = Object.keys(legacyMetadata).filter(key => 
      !['confidence_score', 'customer_sentiment', 'escalation_recommended', 
        'rag_sources_count', 'suggested_priority'].includes(key)
    );
    if (legacyKeys.length > 0) {
      allData.push(`Legacy Fields: [${legacyKeys.slice(0, 3).join(', ')}]`);
    }
  }
  
  // Raw metadata size for debugging
  const metadataSize = JSON.stringify(metadata).length + JSON.stringify(legacyMetadata || {}).length;
  allData.push(`Data Size: ${metadataSize} chars`);

  return `${baseDescription} | ${allData.join(' | ')}`;
}

export default app;
