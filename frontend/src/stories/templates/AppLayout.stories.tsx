import type { Meta, StoryObj } from '@storybook/react-vite';
import { AppLayout } from '../../components/templates/AppLayout';
import { Header } from '../../components/organisms/Header';
import { ThreadList } from '../../components/organisms/ThreadList';
import { ThreadDetail } from '../../components/organisms/ThreadDetail';
import { AgentPanel } from '../../components/organisms/AgentPanel';
import { Composer } from '../../components/organisms/Composer';
import { Search, FileText, Send } from 'lucide-react';

const meta: Meta<typeof AppLayout> = {
  title: 'Templates/AppLayout',
  component: AppLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleThreads = [
  {
    id: '1',
    title: 'Bug in Checkout Flow',
    snippet: 'Customer experiencing error on step 3 of the checkout process...',
    author: { name: 'Jane Doe', initials: 'JD' },
    timestamp: '2 hours ago',
    isUnread: true,
    badges: [
      { label: 'Urgent', variant: 'destructive' as const },
      { label: 'Bug', variant: 'outline' as const },
    ],
  },
  {
    id: '2',
    title: 'Feature Request: Dark Mode',
    snippet: 'Is there a way to enable dark mode on the dashboard?',
    author: { name: 'John Smith', initials: 'JS' },
    timestamp: '5 hours ago',
  },
];

const sampleMessages = [
  {
    id: '1',
    author: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      initials: 'JD',
    },
    content: 'Hi team,\n\nI\'m encountering an issue during the checkout flow where the page freezes on step 3.',
    timestamp: 'Oct 2, 2024 • 11:14 AM',
  },
  {
    id: '2',
    author: {
      name: 'Agent James',
      email: 'support@proresponse.ai',
      initials: 'AJ',
    },
    content: 'Thanks for reaching out! I\'ll help you resolve this issue.',
    timestamp: 'Oct 2, 2024 • 11:20 AM',
    isSupport: true,
  },
];

const agentActions = [
  {
    icon: Search,
    title: 'Searched Knowledge Base',
    description: 'Found 3 relevant articles',
    timestamp: '2 min ago',
    status: 'completed' as const,
  },
  {
    icon: FileText,
    title: 'Fetched Bug Report #1248',
    timestamp: '1 min ago',
    status: 'completed' as const,
  },
  {
    icon: Send,
    title: 'Drafted Reply',
    timestamp: '30 sec ago',
    status: 'completed' as const,
  },
];

export const Default: Story = {
  render: () => (
    <AppLayout
      header={
        <Header
          user={{ name: 'John Doe', initials: 'JD' }}
          notificationCount={3}
        />
      }
      sidebar={
        <ThreadList
          threads={sampleThreads}
          filters={[
            { id: 'all', label: 'All', count: 124 },
            { id: 'unread', label: 'Unread', count: 8 },
            { id: 'urgent', label: 'Urgent', count: 2 },
          ]}
          activeFilter="all"
          activeThreadId="1"
        />
      }
      main={
        <div className="h-full flex flex-col">
          <ThreadDetail
            subject="Bug in Checkout Flow"
            messages={sampleMessages}
            status="open"
            tags={['checkout', 'bug']}
          />
          <Composer placeholder="Type your reply..." />
        </div>
      }
      panel={
        <AgentPanel
          actions={agentActions}
          analysis="Customer cannot proceed past payment step. Appears related to issue fixed in v2.4."
          draftResponse="Try clearing your browser cache and cookies. This should resolve the issue immediately."
        />
      }
    />
  ),
};

export const WithoutAgentPanel: Story = {
  render: () => (
    <AppLayout
      header={
        <Header
          user={{ name: 'John Doe', initials: 'JD' }}
        />
      }
      sidebar={
        <ThreadList
          threads={sampleThreads}
          activeThreadId="1"
        />
      }
      main={
        <div className="h-full flex flex-col">
          <ThreadDetail
            subject="Bug in Checkout Flow"
            messages={sampleMessages}
            status="open"
            tags={['checkout', 'bug']}
          />
          <Composer placeholder="Type your reply..." />
        </div>
      }
    />
  ),
};