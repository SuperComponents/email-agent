import type { Meta, StoryObj } from '@storybook/react';
import { Composer } from '../../components/organisms/Composer';

const meta: Meta<typeof Composer> = {
  title: 'Organisms/Composer',
  component: Composer,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Type your reply...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Thank you for reaching out! I\'ll be happy to help you with this issue.',
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: 'Reply disabled',
  },
};