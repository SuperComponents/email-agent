import { Agent, run } from '@openai/agents';
import { env } from '../config/environment';
import { emailSearchTool } from './tools/email-search';
import { emailTaggerTool } from './tools/email-tagger';
import { ragSearchTool } from './tools/rag-search';
import { db } from '../db';
import { emails, emailThreads } from '../db/schema/emails';
import { eq } from 'drizzle-orm';
import { AgentActionLogger } from '../services/agent-action-logger';
import { setCurrentThreadId } from './tools/logging-wrapper';

const SYSTEM_PROMPT = `You are an intelligent customer support email assistant. You help process and respond to customer emails.

Your capabilities:
1. Search through a customer's email history to understand context
2. Search the company knowledge base for relevant information
3. Tag emails appropriately (spam, legal, sales, support, billing, technical, general)
4. Analyze email threads as conversations

When processing emails:
- Always search for previous emails from the same sender to understand history
- Tag emails based on their content and intent
- Use the knowledge base to find relevant help articles
- Maintain a professional and helpful tone
- Remember the entire email thread context when analyzing

Current task: Process the incoming email and use your tools to:
1. Search for the sender's email history
2. Tag the email appropriately (IMPORTANT: use the exact email ID provided in the email metadata)
3. Search knowledge base if relevant

Email metadata will be provided in the format:
[EMAIL_ID: <id>]`;

export interface EmailMessage {
  id: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  timestamp: Date;
}

export interface ProcessEmailResult {
  tags: string[];
  confidence: number;
  suggestedResponse?: string;
  relevantKBArticles?: any[];
  customerHistory?: any[];
  rawResponse?: string;
}

export class EmailAgent {
  private agent: Agent;
  private actionLogger: AgentActionLogger;

  constructor() {
    this.agent = new Agent({
      name: 'EmailProcessor',
      instructions: SYSTEM_PROMPT,
      tools: [emailSearchTool, emailTaggerTool, ragSearchTool],
      model: env.OPENAI_MODEL,
    });
    
    this.actionLogger = new AgentActionLogger(this.agent);
  }

  private async loadEmailThread(threadId: string): Promise<EmailMessage[]> {
    const threadEmails = await db
      .select()
      .from(emails)
      .where(eq(emails.threadId, threadId))
      .orderBy(emails.createdAt);

    return threadEmails.map(email => ({
      id: email.id,
      from: email.from,
      to: email.to,
      subject: email.subject,
      body: email.body,
      timestamp: email.createdAt!,
    }));
  }

  private formatEmailForContext(email: EmailMessage): string {
    return `[EMAIL_ID: ${email.id}]
From: ${email.from}
To: ${email.to}
Subject: ${email.subject}

${email.body}`;
  }

  async processEmail(email: EmailMessage, threadId?: string): Promise<ProcessEmailResult> {
    // Set thread context for tool logging
    setCurrentThreadId(threadId);
    
    try {
      // Load thread history if available
      const threadHistory = threadId ? await this.loadEmailThread(threadId) : [];
      
      // Build context from thread history
      let context = '';
      if (threadHistory.length > 0) {
        context = 'Previous emails in this thread:\n\n';
        for (const msg of threadHistory) {
          if (msg.id !== email.id) {
            context += `---\n${this.formatEmailForContext(msg)}\n\n`;
          }
        }
        context += '---\nNew email to process:\n';
      }

      // Format the current email
      const currentEmailText = this.formatEmailForContext(email);
      const fullMessage = context + currentEmailText;

      // Run the agent
      const result = await run(this.agent, fullMessage);

    // Parse the result
    const processResult: ProcessEmailResult = {
      tags: [],
      confidence: 0,
      rawResponse: result.finalOutput as string,
    };

    // Extract data from tool calls in the output
    const output = result.output;
    if (output) {
      // First, collect all function calls
      const functionCalls = output.filter(item => item.type === 'function_call');
      
      // Then process their results
      for (const call of functionCalls) {
        if (call.type === 'function_call') {
          // Find the corresponding result
          const resultItem = output.find(
            item => item.type === 'function_call_result' && item.callId === call.callId
          );
          
          if (resultItem && resultItem.type === 'function_call_result' && resultItem.output.type === 'text') {
            try {
              const toolResult = JSON.parse(resultItem.output.text);
              
              switch (call.name) {
                case 'search_emails':
                  if (toolResult.success) {
                    processResult.customerHistory = toolResult.emails;
                  }
                  break;
                  
                case 'tag_email':
                  if (toolResult.success) {
                    processResult.tags = toolResult.tags.map((t: any) => t.tag);
                    processResult.confidence = toolResult.tags[0]?.confidence || 0;
                  }
                  break;
                  
                case 'search_knowledge_base':
                  if (toolResult.success) {
                    processResult.relevantKBArticles = toolResult.articles;
                  }
                  break;
              }
            } catch (e) {
              console.error(`Failed to parse tool result for ${call.name}:`, e);
            }
          }
        }
      }
    }

      return processResult;
    } finally {
      // Clear thread context after processing
      setCurrentThreadId(undefined);
    }
  }

  // Get all actions performed by the agent for a thread
  async getThreadActions(threadId: string) {
    return await this.actionLogger.getThreadActions(threadId);
  }

  // Get analytics about agent actions
  async getActionsSummary() {
    return await this.actionLogger.getActionsSummary();
  }
}

export const emailAgent = new EmailAgent();