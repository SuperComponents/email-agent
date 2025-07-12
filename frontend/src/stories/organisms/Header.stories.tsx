import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../components/organisms/Header';

// A decorator to wrap stories with the necessary providers.
// The Header component requires a Router for navigation.
const withProviders = (Story: React.ComponentType) => (
  <BrowserRouter>
    <Story />
  </BrowserRouter>
);

const meta: Meta<typeof Header> = {
  title: 'Organisms/Header',
  component: Header,
  parameters: {
    layout: 'fullscreen',
  },
  // Apply the decorator to all stories in this file.
  decorators: [withProviders],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// The default story shows the Header component.
export const Default: Story = {
  name: 'Header',
};

// Story showing the header with additional context
export const WithContext: Story = {
  name: 'Header with Context',
  render: () => (
    <div>
      <Header />
      <p className="text-sm text-muted-foreground p-4">
        Header component with navigation and user interface elements.
      </p>
    </div>
  ),
};