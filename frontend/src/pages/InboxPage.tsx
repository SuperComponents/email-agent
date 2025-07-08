import { AppLayout } from '../components/templates';
import { Header } from '../components/organisms';
import { ThreadListContainer } from '../containers/ThreadListContainer';
import { ThreadDetailContainer } from '../containers/ThreadDetailContainer';
import { AgentPanelContainer } from '../containers/AgentPanelContainer';
import { ComposerContainer } from '../containers/ComposerContainer';
import { useAuthStore } from '../stores/auth-store';
import { useUIStore } from '../stores/ui-store';

export function InboxPage() {
  const user = useAuthStore((state) => state.user);
  const isAgentPanelOpen = useUIStore((state) => state.isAgentPanelOpen);
  
  return (
    <AppLayout
      header={
        <Header
          user={user ? { 
            name: user.name,
            initials: user.name.split(' ').map(n => n[0]).join('').toUpperCase()
          } : undefined}
        />
      }
      sidebar={<ThreadListContainer />}
      main={<ThreadDetailContainer />}
      panel={isAgentPanelOpen ? <AgentPanelContainer /> : null}
    >
      <ComposerContainer />
    </AppLayout>
  );
}