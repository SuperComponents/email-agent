import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '../components/templates';
import { Header } from '../components/organisms';
import { ThreadListContainer } from '../containers/ThreadListContainer';
import { ThreadDetailContainer } from '../containers/ThreadDetailContainer';
import { AgentPanelContainer } from '../containers/AgentPanelContainer';
import { useUIStore } from '../stores/ui-store';

export function InboxPage() {
  const { threadId } = useParams<{ threadId?: string }>();
  const isAgentPanelOpen = useUIStore((state) => state.isAgentPanelOpen);
  const setSelectedThread = useUIStore((state) => state.setSelectedThread);
  
  // Sync URL to store - single source of truth is the URL
  useEffect(() => {
    if (threadId) {
      setSelectedThread(threadId);
    } else {
      setSelectedThread(null);
    }
  }, [threadId, setSelectedThread]);
  
  return (
    <AppLayout
      sidebar={
        <div className="flex flex-col h-full">
          <Header />
          <ThreadListContainer />
        </div>
      }
      main={<ThreadDetailContainer />}
      panel={isAgentPanelOpen ? <AgentPanelContainer /> : null}
    />
  );
}