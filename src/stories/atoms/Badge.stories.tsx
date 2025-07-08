import type { Meta, StoryObj } from '@storybook/react';
import { Badge } from '../../components/atoms/Badge';

const meta: Meta<typeof Badge> = {
  title: 'Atoms/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'destructive', 'outline'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Badge',
  },
};

export const Secondary: Story = {
  args: {
    children: 'Secondary',
    variant: 'secondary',
  },
};

export const Destructive: Story = {
  args: {
    children: 'Urgent',
    variant: 'destructive',
  },
};

export const Outline: Story = {
  args: {
    children: 'Outline',
    variant: 'outline',
  },
};

export const StatusBadges: Story = {
  render: () => (
    <div className="flex gap-2">
      <Badge>New</Badge>
      <Badge variant="secondary">Unread</Badge>
      <Badge variant="destructive">Urgent</Badge>
      <Badge variant="outline">Flagged</Badge>
    </div>
  ),
};