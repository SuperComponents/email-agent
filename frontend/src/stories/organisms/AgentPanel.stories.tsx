import type { Meta, StoryObj } from '@storybook/react-vite';
import { AgentPanel } from '../../components/organisms/AgentPanel';
import { Search, FileText, Send, AlertCircle } from 'lucide-react';

const meta: Meta<typeof AgentPanel> = {
  title: 'Organisms/AgentPanel',
  component: AgentPanel,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '600px', width: '300px' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleActions = [
  {
    icon: Search,
    title: 'Searched Knowledge Base',
    description: 'Found 3 relevant articles about checkout issues',
    timestamp: '2 min ago',
    status: 'completed' as const,
  },
  {
    icon: FileText,
    title: 'Fetched Bug Report #1248',
    description: 'Similar issue fixed in v2.4',
    timestamp: '1 min ago',
    status: 'completed' as const,
  },
  {
    icon: Send,
    title: 'Drafted Reply',
    description: 'Created response with workaround steps',
    timestamp: '30 sec ago',
    status: 'completed' as const,
  },
];

export const Default: Story = {
  args: {
    actions: sampleActions,
    analysis: 'The customer cannot proceed past the payment step. This appears to be related to a known issue that was fixed in v2.4. The customer might be using an older cached version of the checkout page.',
    draftResponse: 'Hi Jane, thanks for reaching out! I understand you\'re having trouble with the checkout process. As a quick fix, try clearing your browser cache and cookies. This should resolve the issue immediately.',
  },
};

export const ActionsOnly: Story = {
  args: {
    actions: sampleActions,
  },
};

export const WithFailedAction: Story = {
  args: {
    actions: [
      ...sampleActions.slice(0, 2),
      {
        icon: AlertCircle,
        title: 'Failed to Query Database',
        description: 'Connection timeout',
        timestamp: '30 sec ago',
        status: 'failed' as const,
      },
    ],
    analysis: 'Unable to complete full analysis due to database connection issues.',
  },
};