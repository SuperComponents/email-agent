import type { Meta, StoryObj } from '@storybook/react';
import { Header } from '../../components/organisms/Header';

const meta: Meta<typeof Header> = {
  title: 'Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const WithUser: Story = {
  args: {
    user: {
      name: 'John Doe',
      initials: 'JD',
    },
  },
};

export const WithNotifications: Story = {
  args: {
    user: {
      name: 'Jane Smith',
      initials: 'JS',
    },
    notificationCount: 3,
  },
};