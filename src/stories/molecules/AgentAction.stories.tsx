import type { Meta, StoryObj } from '@storybook/react';
import { AgentAction } from '../../components/molecules/AgentAction';
import { Search, FileText, Send, AlertCircle } from 'lucide-react';

const meta: Meta<typeof AgentAction> = {
  title: 'Molecules/AgentAction',
  component: AgentAction,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    status: {
      control: 'select',
      options: ['pending', 'completed', 'failed'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const SearchKnowledgeBase: Story = {
  args: {
    icon: Search,
    title: 'Searched Knowledge Base',
    description: 'Found 3 relevant articles about checkout issues',
    timestamp: '2 min ago',
    status: 'completed',
  },
};

export const FetchBugReport: Story = {
  args: {
    icon: FileText,
    title: 'Fetched Bug Report #1248',
    description: 'Similar issue fixed in v2.4',
    timestamp: '1 min ago',
    status: 'completed',
  },
};

export const DraftReply: Story = {
  args: {
    icon: Send,
    title: 'Drafting Reply',
    status: 'pending',
  },
};

export const Failed: Story = {
  args: {
    icon: AlertCircle,
    title: 'Failed to Query Database',
    description: 'Connection timeout',
    timestamp: '30 sec ago',
    status: 'failed',
  },
};