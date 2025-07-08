import type { Meta, StoryObj } from '@storybook/react';
import { FilterPills } from '../../components/molecules/FilterPills';

const meta: Meta<typeof FilterPills> = {
  title: 'Molecules/FilterPills',
  component: FilterPills,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    options: [
      { id: 'all', label: 'All' },
      { id: 'unread', label: 'Unread' },
      { id: 'flagged', label: 'Flagged' },
      { id: 'urgent', label: 'Urgent' },
    ],
    value: 'all',
  },
};

export const WithCounts: Story = {
  args: {
    options: [
      { id: 'all', label: 'All', count: 124 },
      { id: 'unread', label: 'Unread', count: 8 },
      { id: 'flagged', label: 'Flagged', count: 3 },
      { id: 'urgent', label: 'Urgent', count: 2 },
      { id: 'awaiting', label: 'Awaiting Customer', count: 14 },
      { id: 'closed', label: 'Closed', count: 98 },
    ],
    value: 'unread',
  },
};