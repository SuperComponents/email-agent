import type { Meta, StoryObj } from '@storybook/react-vite';
import { ThreadDetail } from '../../components/organisms/ThreadDetail';

const meta: Meta<typeof ThreadDetail> = {
  title: 'Organisms/ThreadDetail',
  component: ThreadDetail,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ height: '600px', display: 'flex' }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleMessages = [
  {
    id: '1',
    author: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      initials: 'JD',
    },
    content: 'Hi team,\n\nI\'m encountering an issue during the checkout flow where the page freezes on step 3. This happens every time I try to complete a purchase.\n\nCould you please look into this? It\'s preventing me from placing my order.',
    timestamp: 'Oct 2, 2024 • 11:14 AM',
  },
  {
    id: '2',
    author: {
      name: 'Agent James',
      email: 'support@proresponse.ai',
      initials: 'AJ',
    },
    content: 'Thanks for reaching out, Jane!\n\nI\'m sorry to hear you\'re experiencing issues with the checkout process. I\'ve looked into this and found that we had a similar issue that was fixed in our latest update.\n\nAs a temporary workaround, could you try:\n1. Clearing your browser cache\n2. Using a different browser\n3. Disabling any ad blockers\n\nOur engineering team is investigating this further. I\'ll keep you updated on the progress.',
    timestamp: 'Oct 2, 2024 • 11:20 AM',
    isSupport: true,
  },
  {
    id: '3',
    author: {
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      initials: 'JD',
    },
    content: 'Thanks for the quick response! I tried clearing my cache and it worked. I was able to complete my order successfully.',
    timestamp: 'Oct 2, 2024 • 11:45 AM',
  },
];

export const Default: Story = {
  args: {
    subject: 'Bug in Checkout Flow',
    messages: sampleMessages,
    status: 'open',
    tags: ['checkout', 'bug'],
  },
};

export const ClosedThread: Story = {
  args: {
    subject: 'Feature Request: Dark Mode',
    messages: [
      {
        id: '1',
        author: {
          name: 'John Smith',
          email: 'john@example.com',
          initials: 'JS',
        },
        content: 'Is there a way to enable dark mode on the dashboard?',
        timestamp: 'Oct 1, 2024 • 2:30 PM',
      },
      {
        id: '2',
        author: {
          name: 'Support Team',
          email: 'support@proresponse.ai',
          initials: 'ST',
        },
        content: 'Thanks for the suggestion! Dark mode is on our roadmap and should be available in the next major release.',
        timestamp: 'Oct 1, 2024 • 3:15 PM',
        isSupport: true,
      },
    ],
    status: 'closed',
    tags: ['feature-request'],
  },
};