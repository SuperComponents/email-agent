import { useAgentActivity } from '../repo/hooks';
import { useUIStore } from '../stores/ui-store';
import { AgentPanel } from '../components/organisms';
import { FileSearch, Brain, MessageSquare } from 'lucide-react';
import type { AgentActionProps } from '../components/molecules/AgentAction';

export function AgentPanelContainer() {
  const selectedThreadId = useUIStore((state) => state.selectedThreadId);
  const isAgentPanelOpen = useUIStore((state) => state.isAgentPanelOpen);
  
  const { data: agentActivity } = useAgentActivity(selectedThreadId || '');
  
  if (!isAgentPanelOpen || !selectedThreadId) {
    return null;
  }
  
  // Transform agent activity data to match component props
  const actions: AgentActionProps[] = agentActivity?.actions.map(action => ({
    icon: action.type === 'analyze' ? Brain : action.type === 'search' ? FileSearch : MessageSquare,
    title: action.title,
    description: action.description,
    timestamp: new Date(action.timestamp).toLocaleTimeString(),
    status: action.status === 'completed' ? 'completed' : action.status === 'failed' ? 'failed' : 'pending'
  })) || [];
  
  return (
    <AgentPanel
      actions={actions}
      analysis={agentActivity?.analysis}
      draftResponse={agentActivity?.suggested_response}
    />
  );
}