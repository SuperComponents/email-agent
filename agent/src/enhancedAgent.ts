// Enhanced Support Agent - Handles email threads with RAG integration and thread naming
// Builds upon the original agent with expanded capabilities

import { openai } from './openaiClient';
import { tools, handleToolCall } from './tools';
import { generateContextualQueries, formatRAGResultsForAgent } from './ragSystem';
import { generateThreadName } from './threadNaming';
import { 
  EmailThread, 
  SupportContext, 
  EnhancedAgentResponse, 
  AgentConfig,
  ThreadNamingRequest 
} from './types';

/**
 * Enhanced support agent assistant function
 * Handles email threads with RAG integration and automatic thread naming
 * 
 * @param thread - The email thread to analyze and respond to
 * @param context - Additional support context and customer information
 * @param config - Configuration options for the agent
 * @returns Promise<EnhancedAgentResponse> - Enhanced response with thread naming and RAG sources
 */
export async function assistSupportPersonEnhanced(
  thread: EmailThread,
  context: SupportContext = {},
  config: AgentConfig = {}
): Promise<EnhancedAgentResponse> {
  
  console.log(`[EnhancedAgent] Starting enhanced support agent analysis`);
  console.log(`[EnhancedAgent] Thread ID: ${thread.id}`);
  console.log(`[EnhancedAgent] Thread has ${thread.messages.length} messages`);
  console.log(`[EnhancedAgent] Customer: ${thread.customerEmail}`);
  console.log(`[EnhancedAgent] Thread priority: ${thread.priority}`);
  console.log(`[EnhancedAgent] Thread status: ${thread.status}`);
  
  // Set default configuration
  const {
    model = 'gpt-4o',
    includeRAG = true,
    generateThreadName: shouldGenerateThreadName = true,
    maxRAGResults = 5,
    enableSentimentAnalysis = true,
    confidenceThreshold = 0.7,
    escalationKeywords = ['legal', 'lawyer', 'manager', 'complaint', 'unacceptable']
  } = config;
  
  console.log(`[EnhancedAgent] Configuration:`, {
    model,
    includeRAG,
    shouldGenerateThreadName,
    maxRAGResults,
    enableSentimentAnalysis
  });
  
  try {
    // Step 1: Generate thread name if requested
    let threadName = '';
    if (shouldGenerateThreadName) {
      console.log(`[EnhancedAgent] Generating thread name`);
      const namingRequest: ThreadNamingRequest = {
        thread,
        maxLength: 60,
        includeCustomerName: false,
        includeIssueType: true
      };
      
      const namingResponse = await generateThreadName(namingRequest);
      threadName = namingResponse.name;
      console.log(`[EnhancedAgent] Thread name generated: "${threadName}"`);
      console.log(`[EnhancedAgent] Naming confidence: ${(namingResponse.confidence * 100).toFixed(1)}%`);
    }
    
    // Step 2: Prepare email content for analysis
    const combinedEmailContent = thread.messages
      .map(msg => `
**From:** ${msg.from}
**To:** ${msg.to.join(', ')}
**Subject:** ${msg.subject}
**Date:** ${msg.timestamp.toISOString()}
**Content:**
${msg.body}
${msg.attachments?.length ? `**Attachments:** ${msg.attachments.map(a => a.filename).join(', ')}` : ''}
---`).join('\n\n');
    
    console.log(`[EnhancedAgent] Combined email content prepared: ${combinedEmailContent.length} characters`);
    
    // Step 3: Gather RAG information if enabled
    let ragResults: any[] = [];
    let formattedRAGContent = '';
    
    if (includeRAG) {
      console.log(`[EnhancedAgent] Gathering relevant company knowledge via RAG`);
      
      try {
        ragResults = await generateContextualQueries(
          combinedEmailContent,
          ['policy', 'knowledge', 'procedure', 'faq']
        );
        
        console.log(`[EnhancedAgent] RAG analysis returned ${ragResults.length} relevant knowledge items`);
        
        // Limit results based on configuration
        const limitedRAGResults = ragResults.slice(0, maxRAGResults);
        formattedRAGContent = formatRAGResultsForAgent(limitedRAGResults);
        
        console.log(`[EnhancedAgent] Using ${limitedRAGResults.length} RAG results for agent prompt`);
        
      } catch (error) {
        console.warn(`[EnhancedAgent] RAG query failed, proceeding without RAG:`, error);
        formattedRAGContent = 'RAG system temporarily unavailable - using agent knowledge only.';
      }
    }
    
    // Step 4: Prepare support context information
    const contextString = formatSupportContext(context);
    console.log(`[EnhancedAgent] Support context prepared: ${contextString.length} characters`);
    
    // Step 5: Create enhanced system prompt
    const systemPrompt = createEnhancedSystemPrompt(formattedRAGContent, escalationKeywords);
    console.log(`[EnhancedAgent] Enhanced system prompt created: ${systemPrompt.length} characters`);
    
    // Step 6: Create user prompt with thread and context
    const userPrompt = `
## Email Thread Analysis Request

**Thread Information:**
- Thread ID: ${thread.id}
- Customer: ${thread.customerEmail}
- Priority: ${thread.priority}
- Status: ${thread.status}
- Created: ${thread.createdAt.toISOString()}
- Last Updated: ${thread.updatedAt.toISOString()}
${thread.tags?.length ? `- Tags: ${thread.tags.join(', ')}` : ''}

**Email Thread Content:**
${combinedEmailContent}

**Support Context:**
${contextString}

**Instructions:**
Please analyze this email thread and provide a comprehensive response including:
1. Detailed reasoning and analysis
2. Drafted email response
3. Confidence assessment
4. Priority recommendation
5. Escalation assessment
6. Customer sentiment analysis
7. Recommended follow-up actions

Format your response as:
REASONING: [Detailed step-by-step analysis]
DRAFT: [Complete email response in markdown format]
CONFIDENCE: [Confidence score 0-1]
PRIORITY: [Suggested priority: low/normal/high/urgent]
ESCALATION: [true/false - whether escalation is recommended]
SENTIMENT: [Customer sentiment: positive/neutral/negative/frustrated/angry]
FOLLOW_UP: [Whether follow-up is required: true/false]
ESTIMATED_TIME: [Estimated resolution time in hours]
ACTIONS: [Comma-separated list of additional actions for support person]
TAGS: [Comma-separated list of suggested tags for the thread]
    `.trim();
    
    console.log(`[EnhancedAgent] User prompt prepared: ${userPrompt.length} characters`);
    
    // Step 7: Create and run OpenAI assistant
    const assistant = await openai.beta.assistants.create({
      name: 'Enhanced Support Agent Assistant',
      instructions: systemPrompt,
      tools,
      model
    });
    
    console.log(`[EnhancedAgent] Enhanced assistant created with id: ${assistant.id}`);
    
    const thread_openai = await openai.beta.threads.create();
    console.log(`[EnhancedAgent] OpenAI thread created with id: ${thread_openai.id}`);
    
    await openai.beta.threads.messages.create(thread_openai.id, { 
      role: 'user', 
      content: userPrompt 
    });
    
    let run = await openai.beta.threads.runs.create(thread_openai.id, { 
      assistant_id: assistant.id 
    });
    
    console.log(`[EnhancedAgent] Run started with id: ${run.id}`);
    
    // Step 8: Handle run lifecycle with tool support
    while (true) {
      console.log(`[EnhancedAgent] Run status: ${run.status}`);
      
      if (['failed', 'expired', 'cancelled'].includes(run.status)) {
        throw new Error(`Enhanced agent run failed with status: ${run.status}`);
      }
      
      if (run.status === 'requires_action') {
        const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls || [];
        console.log(`[EnhancedAgent] Processing ${toolCalls.length} tool call(s)`);
        
        const toolOutputs = await Promise.all(
          toolCalls.map(async (toolCall) => {
            console.log(`[EnhancedAgent] Executing tool: ${toolCall.function.name}`);
            return {
              tool_call_id: toolCall.id,
              output: await handleToolCall(toolCall.function.name, JSON.parse(toolCall.function.arguments))
            };
          })
        );
        
        run = await openai.beta.threads.runs.submitToolOutputs(
          thread_openai.id,
          run.id, 
          { 
            tool_outputs: toolOutputs 
          }
        );
        continue;
      }
      
      if (run.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(thread_openai.id);
        const assistantMessage = messages.data.find((m) => m.role === 'assistant');
        const responseText = (assistantMessage?.content[0] as any)?.text?.value || '';
        
        console.log(`[EnhancedAgent] Response received, parsing enhanced response...`);
        
        // Step 9: Parse enhanced response
        const parsedResponse = parseEnhancedResponse(responseText);
        console.log(`[EnhancedAgent] Response parsing completed`);
        console.log(`[EnhancedAgent] Confidence: ${(parsedResponse.confidence * 100).toFixed(1)}%`);
        console.log(`[EnhancedAgent] Suggested priority: ${parsedResponse.suggestedPriority}`);
        console.log(`[EnhancedAgent] Escalation recommended: ${parsedResponse.escalationRecommended}`);
        console.log(`[EnhancedAgent] Customer sentiment: ${parsedResponse.customerSentiment}`);
        
        // Step 10: Build final enhanced response
        const enhancedResponse: EnhancedAgentResponse = {
          ...parsedResponse,
          threadName: threadName || `Thread ${thread.id}`,
          ragSources: ragResults.slice(0, maxRAGResults),
        };
        
        console.log(`[EnhancedAgent] Enhanced support agent analysis completed successfully`);
        console.log(`[EnhancedAgent] Thread name: "${enhancedResponse.threadName}"`);
        console.log(`[EnhancedAgent] RAG sources included: ${enhancedResponse.ragSources?.length || 0}`);
        
        return enhancedResponse;
      }
      
      // Continue polling
      await new Promise(resolve => setTimeout(resolve, 1000));
      run = await openai.beta.threads.runs.retrieve(thread_openai.id, run.id);
    }
    
  } catch (error) {
    console.error(`[EnhancedAgent] Error in enhanced support agent:`, error);
    throw error;
  }
}

/**
 * Create enhanced system prompt with RAG integration
 */
function createEnhancedSystemPrompt(ragContent: string, escalationKeywords: string[]): string {
  console.log(`[EnhancedAgent] Creating enhanced system prompt`);
  
  return `You are an enhanced support agent assistant helping a human support person analyze email threads and draft responses.

## Your Enhanced Capabilities:
- Access to company knowledge base through RAG system
- Email thread analysis and sentiment detection
- Escalation detection and priority assessment
- Thread naming and categorization
- Customer history integration

## Available Company Knowledge:
${ragContent}

## Your Role:
- Analyze complete email threads (not just single emails)
- Draft professional, empathetic responses based on company policies
- Assess customer sentiment and escalation needs
- Provide priority recommendations and estimated resolution times
- Always reference relevant company policies from the knowledge base
- Be solution-focused with clear next steps
- Sign off with "Best regards,\\nCustomer Support Team"

## Escalation Triggers:
Keywords that may indicate escalation needs: ${escalationKeywords.join(', ')}
- Legal threats or mentions of lawyers
- Requests for managers/supervisors  
- Expressions of extreme frustration
- Threats to cancel or switch competitors
- Multiple previous tickets with low satisfaction

## Analysis Framework:
1. **Thread Analysis**: Review all messages in chronological order
2. **Sentiment Assessment**: Determine customer emotional state
3. **Issue Classification**: Identify the core problem/request
4. **Policy Application**: Apply relevant company policies from knowledge base
5. **Priority Assessment**: Evaluate urgency and impact
6. **Response Crafting**: Draft appropriate response with clear next steps
7. **Escalation Review**: Determine if escalation is needed

## Quality Standards:
- Always reference specific company policies when applicable
- Provide exact procedural steps from the knowledge base
- Acknowledge the full context of the thread conversation
- Balance empathy with policy compliance
- Give realistic timelines based on company procedures
- Include specific order numbers, account details when mentioned

## Response Format Requirements:
Your response must include all the following sections:
REASONING: [Step-by-step analysis]
DRAFT: [Email response in markdown]
CONFIDENCE: [0-1 confidence score]
PRIORITY: [low/normal/high/urgent]
ESCALATION: [true/false]
SENTIMENT: [positive/neutral/negative/frustrated/angry]
FOLLOW_UP: [true/false]
ESTIMATED_TIME: [hours for resolution]
ACTIONS: [additional actions for support person]
TAGS: [suggested thread tags]

Never make promises the company cannot keep. Always use the company knowledge base to inform your responses.`;
}

/**
 * Format support context for inclusion in prompt
 */
function formatSupportContext(context: SupportContext): string {
  console.log(`[EnhancedAgent] Formatting support context`);
  
  const sections: string[] = [];
  
  if (context.customerHistory) {
    sections.push(`**Customer History:**
- Total Tickets: ${context.customerHistory.totalTickets}
- Resolved Tickets: ${context.customerHistory.resolvedTickets}
- Average Resolution Time: ${context.customerHistory.averageResolutionTime} hours
- Satisfaction Score: ${context.customerHistory.satisfactionScore}/5
- Last Interaction: ${context.customerHistory.lastInteraction?.toISOString() || 'N/A'}
- Common Issues: ${context.customerHistory.commonIssues?.join(', ') || 'None'}
- Preferred Contact: ${context.customerHistory.preferredContactMethod || 'Email'}`);
  }
  
  if (context.orderInformation?.length) {
    sections.push(`**Order Information:**
${context.orderInformation.map(order => 
  `- Order ${order.orderId}: ${order.productName} (${order.status}) - $${order.amount} ${order.currency} on ${order.orderDate.toLocaleDateString()}`
).join('\n')}`);
  }
  
  if (context.accountDetails) {
    sections.push(`**Account Details:**
- Customer ID: ${context.accountDetails.customerId}
- Account Type: ${context.accountDetails.accountType}
- Subscription Status: ${context.accountDetails.subscriptionStatus || 'N/A'}
- Join Date: ${context.accountDetails.joinDate.toLocaleDateString()}
- Last Login: ${context.accountDetails.lastLogin?.toLocaleDateString() || 'N/A'}
- Billing Status: ${context.accountDetails.billingStatus || 'N/A'}`);
  }
  
  if (context.escalationLevel && context.escalationLevel !== 'none') {
    sections.push(`**Current Escalation Level:** ${context.escalationLevel}`);
  }
  
  if (context.urgencyReason) {
    sections.push(`**Urgency Reason:** ${context.urgencyReason}`);
  }
  
  if (context.internalNotes?.length) {
    sections.push(`**Internal Notes:**
${context.internalNotes.map(note => `- ${note}`).join('\n')}`);
  }
  
  if (context.relatedThreads?.length) {
    sections.push(`**Related Threads:** ${context.relatedThreads.join(', ')}`);
  }
  
  const formatted = sections.length > 0 
    ? sections.join('\n\n')
    : 'No additional support context provided.';
  
  console.log(`[EnhancedAgent] Support context formatted: ${formatted.length} characters`);
  
  return formatted;
}

/**
 * Parse the enhanced response from the assistant
 */
function parseEnhancedResponse(responseText: string): Omit<EnhancedAgentResponse, 'threadName' | 'ragSources'> {
  console.log(`[EnhancedAgent] Parsing enhanced response from assistant`);
  
  // Extract sections using regex patterns
  const reasoningMatch = responseText.match(/REASONING:\s*(.*?)(?=DRAFT:|$)/s);
  const draftMatch = responseText.match(/DRAFT:\s*(.*?)(?=CONFIDENCE:|$)/s);
  const confidenceMatch = responseText.match(/CONFIDENCE:\s*([\d.]+)/);
  const priorityMatch = responseText.match(/PRIORITY:\s*(low|normal|high|urgent)/i);
  const escalationMatch = responseText.match(/ESCALATION:\s*(true|false)/i);
  const sentimentMatch = responseText.match(/SENTIMENT:\s*(positive|neutral|negative|frustrated|angry)/i);
  const followUpMatch = responseText.match(/FOLLOW_UP:\s*(true|false)/i);
  const estimatedTimeMatch = responseText.match(/ESTIMATED_TIME:\s*([\d.]+)/);
  const actionsMatch = responseText.match(/ACTIONS:\s*(.*?)(?=TAGS:|$)/s);
  const tagsMatch = responseText.match(/TAGS:\s*(.*?)$/s);
  
  // Parse and validate extracted values
  const reasoning = reasoningMatch ? reasoningMatch[1].trim() : 'No reasoning provided';
  const draft = draftMatch ? draftMatch[1].trim() : responseText;
  const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.7;
  const suggestedPriority = (priorityMatch ? priorityMatch[1].toLowerCase() : 'normal') as any;
  const escalationRecommended = escalationMatch ? escalationMatch[1].toLowerCase() === 'true' : false;
  const customerSentiment = (sentimentMatch ? sentimentMatch[1].toLowerCase() : 'neutral') as any;
  const followUpRequired = followUpMatch ? followUpMatch[1].toLowerCase() === 'true' : false;
  const estimatedResolutionTime = estimatedTimeMatch ? parseFloat(estimatedTimeMatch[1]) : undefined;
  
  const additionalActions = actionsMatch 
    ? actionsMatch[1].trim().split(',').map(action => action.trim()).filter(action => action.length > 0)
    : [];
    
  const tags = tagsMatch
    ? tagsMatch[1].trim().split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
    : [];
  
  console.log(`[EnhancedAgent] Parsed response values:`, {
    confidence,
    suggestedPriority,
    escalationRecommended,
    customerSentiment,
    followUpRequired,
    estimatedResolutionTime,
    additionalActionsCount: additionalActions.length,
    tagsCount: tags.length
  });
  
  return {
    draft,
    reasoning,
    confidence,
    suggestedPriority,
    escalationRecommended,
    followUpRequired,
    estimatedResolutionTime,
    additionalActions,
    customerSentiment,
    tags
  };
} 