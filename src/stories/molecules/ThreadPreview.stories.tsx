import type { Meta, StoryObj } from '@storybook/react';
import { ThreadPreview } from '../../components/molecules/ThreadPreview';

const meta: Meta<typeof ThreadPreview> = {
  title: 'Molecules/ThreadPreview',
  component: ThreadPreview,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Bug in Checkout Flow',
    snippet: 'Customer experiencing error on step 3 of the checkout process...',
    author: {
      name: 'Jane Doe',
      initials: 'JD',
    },
    timestamp: '2 hours ago',
  },
};

export const Active: Story = {
  args: {
    title: 'Feature Request: Dark Mode',
    snippet: 'Is there a way to enable dark mode on the dashboard?',
    author: {
      name: 'John Smith',
      initials: 'JS',
    },
    timestamp: '5 hours ago',
    isActive: true,
  },
};

export const Unread: Story = {
  args: {
    title: 'Thank you for the quick response!',
    snippet: 'Just wanted to say your support has been amazing...',
    author: {
      name: 'Sarah Johnson',
      initials: 'SJ',
    },
    timestamp: '30 min ago',
    isUnread: true,
  },
};

export const WithBadges: Story = {
  args: {
    title: 'Payment Failed - Urgent',
    snippet: 'My payment keeps failing and I need to complete this order today...',
    author: {
      name: 'Mike Wilson',
      initials: 'MW',
    },
    timestamp: '10 min ago',
    isUnread: true,
    badges: [
      { label: 'Urgent', variant: 'destructive' },
      { label: 'Payment', variant: 'outline' },
    ],
  },
};