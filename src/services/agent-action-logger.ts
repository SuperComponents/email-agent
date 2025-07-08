import { randomUUID } from 'crypto';
import { db } from '../db';
import { agentActions } from '../db/schema/agent-actions';
import { Agent } from '@openai/agents';

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
    output?: string;
  };
}

interface RunStep {
  id: string;
  type: string;
  created_at: number;
  status: string;
  step_details: {
    type: string;
    tool_calls?: ToolCall[];
  };
}

export class AgentActionLogger {
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  async logActionsFromRun(threadId: string, runId: string): Promise<void> {
    try {
      // Fetch all steps from the run
      const steps = await this.agent.client.beta.threads.runs.steps.list(
        threadId,
        runId
      );

      // Process each step
      for (const step of steps.data) {
        if (step.type === 'tool_calls' && step.step_details.tool_calls) {
          for (const toolCall of step.step_details.tool_calls) {
            await this.logToolCall(
              threadId,
              runId,
              step.id,
              toolCall,
              step.created_at
            );
          }
        }
      }
    } catch (error) {
      console.error('Failed to log agent actions:', error);
    }
  }

  private async logToolCall(
    threadId: string,
    runId: string,
    stepId: string,
    toolCall: ToolCall,
    timestamp: number
  ): Promise<void> {
    try {
      const parameters = JSON.parse(toolCall.function.arguments || '{}');
      const description = this.generateDescription(
        toolCall.function.name,
        parameters
      );

      await db.insert(agentActions).values({
        id: randomUUID(),
        threadId,
        agentRunId: runId,
        toolName: toolCall.function.name,
        toolCallId: toolCall.id,
        description,
        parameters: toolCall.function.arguments || '{}',
        result: toolCall.function.output || null,
        status: toolCall.function.output ? 'success' : 'error',
        errorMessage: null,
        timestamp: new Date(timestamp * 1000), // Convert from seconds to milliseconds
        stepId,
      });
    } catch (error) {
      console.error(`Failed to log tool call ${toolCall.id}:`, error);
    }
  }

  private generateDescription(toolName: string, parameters: any): string {
    switch (toolName) {
      case 'search_emails_by_user':
        return `Searched for emails from ${parameters.userEmail}`;
      
      case 'tag_email':
        return `Tagged email ${parameters.emailId} as '${parameters.tag}'`;
      
      case 'rag_search':
        return `Searched knowledge base for: "${parameters.query}"`;
      
      default:
        return `Called ${toolName} tool`;
    }
  }

  // Get all actions for a thread
  async getThreadActions(threadId: string) {
    return await db
      .select()
      .from(agentActions)
      .where(eq(agentActions.threadId, threadId))
      .orderBy(agentActions.timestamp);
  }

  // Get actions summary for analytics
  async getActionsSummary() {
    const actions = await db.select().from(agentActions);
    
    const summary = {
      totalActions: actions.length,
      byTool: {} as Record<string, number>,
      successRate: 0,
      averagePerThread: 0,
    };

    // Count by tool
    actions.forEach(action => {
      summary.byTool[action.toolName] = (summary.byTool[action.toolName] || 0) + 1;
    });

    // Calculate success rate
    const successfulActions = actions.filter(a => a.status === 'success').length;
    summary.successRate = actions.length > 0 ? successfulActions / actions.length : 0;

    // Calculate average per thread
    const uniqueThreads = new Set(actions.map(a => a.threadId)).size;
    summary.averagePerThread = uniqueThreads > 0 ? actions.length / uniqueThreads : 0;

    return summary;
  }
}

// Import eq for where clause
import { eq } from 'drizzle-orm';