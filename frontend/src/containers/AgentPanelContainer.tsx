import { useAgentActivity } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { AgentPanel } from '../components/organisms';
import { FileSearch, Brain, MessageSquare } from 'lucide-react';
import type { AgentActionProps } from '../components/molecules/AgentAction';
import { apiClient } from '../lib/api';

export function AgentPanelContainer() {
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const isAgentPanelOpen = useUIStore((state) => state.isAgentPanelOpen);
  
  const { data: agentActivity } = useAgentActivity(selectedThreadId || '');
  
  // Log agent activity when it comes in
  if (agentActivity && agentActivity.actions) {
    const resultsLog = agentActivity.actions.map((action, index) => {
      return `\n========== Action ${index} ==========\n` +
        `ID: ${action.id}\n` +
        `Type: ${action.type}\n` +
        `Title: ${action.title}\n` +
        `Status: ${action.status}\n` +
        `Timestamp: ${action.timestamp}\n` +
        `Result: ${action.result ? JSON.stringify(action.result, null, 2) : 'null'}\n`;
    }).join('\n');
    
    console.log('=== AGENT ACTIVITY RESULTS ===\n' + resultsLog + '\n=== END AGENT ACTIVITY ===');
  }
  
  if (!isAgentPanelOpen || !selectedThreadId) {
    return null;
  }
  
  // Transform agent activity data to match component props
  // Reverse the array to show most recent at bottom
  const actionsReversed = agentActivity?.actions
    .slice() // Create a copy to avoid mutating the original
    .reverse(); // Reverse to show most recent at bottom
  
  // Create a map to store function_call_result data by looking ahead
  const functionCallResults = new Map();
  actionsReversed?.forEach((action, index) => {
    if (action.result?.type === 'function_call') {
      // Look for the corresponding function_call_result
      for (let i = index + 1; i < actionsReversed.length; i++) {
        if (actionsReversed[i].result?.type === 'function_call_result') {
          functionCallResults.set(index, actionsReversed[i].result);
          break;
        }
      }
    }
  });
  
  const actions: AgentActionProps[] = actionsReversed?.map((action, index) => {
      // Skip function_call_result items
      if (action.result?.type === 'function_call_result') {
        return null;
      }
      // Check if this is a message type
      const isMessage = action.result?.type === 'message';
      const isExplainToolCall = action.result?.name === 'explain_next_tool_call';
      
      if (isMessage) {
        // For messages, extract content from result
        const messageContent = action.result?.content?.[0]?.text || '';
        const messageRole = action.result?.role as 'user' | 'assistant' | undefined;
        
        return {
          icon: MessageSquare,
          title: action.title,
          description: messageContent,
          timestamp: new Date(action.timestamp).toLocaleTimeString(),
          status: action.status === 'completed' ? 'completed' : action.status === 'failed' ? 'failed' : 'pending',
          isMessage: true,
          messageRole: messageRole || 'assistant'
        };
      }
      
      if (isExplainToolCall) {
        // For explain_next_tool_call, parse the JSON arguments
        let messageContent = '';
        try {
          const argumentsText = action.result?.arguments;
          if (argumentsText) {
            const parsed = JSON.parse(argumentsText);
            messageContent = parsed.explanation || '';
          }
        } catch (e) {
          console.error('Failed to parse explain_next_tool_call arguments:', e);
          messageContent = action.result?.arguments || '';
        }
        
        return {
          icon: MessageSquare,
          title: action.title,
          description: messageContent,
          timestamp: new Date(action.timestamp).toLocaleTimeString(),
          status: action.status === 'completed' ? 'completed' : action.status === 'failed' ? 'failed' : 'pending',
          isMessage: true,
          messageRole: 'assistant'
        };
      }
      
      // For non-message actions, generate display based on function name and parameters
      let displayTitle = action.result?.name || action.title;
      let displayDescription = action.description;
      
      // Generate better descriptions for function calls
      if (action.result?.type === 'function_call' && action.result?.name) {
        try {
          const args = action.result.arguments ? JSON.parse(action.result.arguments) : {};
          
          switch (action.result.name) {
            case 'search_emails':
              displayDescription = `Searched for emails from ${args.senderEmail || 'all senders'}`;
              break;
            case 'tag_email':
              displayDescription = `Tagged email ${args.emailId} as ${args.tags?.join(', ') || 'unknown'}`;
              break;
            case 'search_knowledge_base':
              displayDescription = `Searched knowledge base for: "${args.query || 'unknown query'}"`;
              break;
            case 'write_draft':
              displayDescription = `Created draft response for email ${args.emailId}`;
              break;
            case 'read_thread':
              displayDescription = 'Read email thread';
              break;
          }
        } catch (e) {
          console.error('Failed to parse function call arguments:', e);
        }
      }
      
      // Handle hosted_tool_call types (like file_search_call)
      if (action.result?.type === 'hosted_tool_call' && action.result?.name === 'file_search_call') {
        const providerData = action.result.providerData as any;
        const queries = providerData?.queries || [];
        displayDescription = `Searched knowledge base with queries: ${queries.join(', ')}`;
      }
      
      // Check if this is a function_call and attach its result data
      const functionCallResultData = action.result?.type === 'function_call' 
        ? functionCallResults.get(index) 
        : undefined;
      
      return {
        icon: action.type === 'analyze' ? Brain : action.type === 'search' ? FileSearch : MessageSquare,
        title: displayTitle,
        description: displayDescription,
        timestamp: new Date(action.timestamp).toLocaleTimeString(),
        status: action.status === 'completed' ? 'completed' : action.status === 'failed' ? 'failed' : 'pending',
        ...(functionCallResultData && { functionCallResultData })
      };
    }).filter(Boolean) || [];
  
  const handleSendMessage = async (message: string) => {
    if (!selectedThreadId) return;
    
    try {
      await apiClient.post(`/api/threads/${selectedThreadId}/regenerate`, {
        userMessage: message
      });
      // The useAgentActivity hook should automatically refresh with new data
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };
  
  return <AgentPanel actions={actions} onSendMessage={handleSendMessage} />;
}