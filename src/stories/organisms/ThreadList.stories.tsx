import type { Meta, StoryObj } from '@storybook/react';
import { ThreadList } from '../../components/organisms/ThreadList';

const meta: Meta<typeof ThreadList> = {
  title: 'Organisms/ThreadList',
  component: ThreadList,
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
  {
    id: '3',
    title: 'Thank you for the quick response!',
    snippet: 'Just wanted to say your support has been amazing...',
    author: { name: 'Sarah Johnson', initials: 'SJ' },
    timestamp: '1 day ago',
  },
];

const filters = [
  { id: 'all', label: 'All', count: 124 },
  { id: 'unread', label: 'Unread', count: 8 },
  { id: 'flagged', label: 'Flagged', count: 3 },
  { id: 'urgent', label: 'Urgent', count: 2 },
];

export const Default: Story = {
  args: {
    threads: sampleThreads,
    filters: filters,
    activeFilter: 'all',
    activeThreadId: '1',
  },
};

export const Empty: Story = {
  args: {
    threads: [],
    filters: filters,
    activeFilter: 'all',
  },
};

export const NoFilters: Story = {
  args: {
    threads: sampleThreads,
  },
};