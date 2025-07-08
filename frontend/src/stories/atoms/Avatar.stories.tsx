import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar } from '../../components/atoms/Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Atoms/Avatar',
  component: Avatar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImage: Story = {
  args: {
    src: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    alt: 'User avatar',
  },
};

export const WithFallback: Story = {
  args: {
    fallback: 'JD',
  },
};

export const Small: Story = {
  args: {
    fallback: 'AB',
    size: 'sm',
  },
};

export const Large: Story = {
  args: {
    fallback: 'XY',
    size: 'lg',
  },
};