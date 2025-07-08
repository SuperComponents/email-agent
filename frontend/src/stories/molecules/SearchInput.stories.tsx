import type { Meta, StoryObj } from '@storybook/react-vite';
import { SearchInput } from '../../components/molecules/SearchInput';

const meta: Meta<typeof SearchInput> = {
  title: 'Molecules/SearchInput',
  component: SearchInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Search threads...',
  },
};

export const WithValue: Story = {
  args: {
    value: 'Bug in checkout',
    readOnly: true,
  },
};