import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { StackProvider, StackClientApp } from '@stackframe/react';
import { Header } from '../../components/organisms/Header';

// Create a mock StackClientApp instance for Storybook.
// This prevents the need for real environment variables in our stories.
const mockStackApp = new StackClientApp({
  projectId: import.meta.env.VITE_STACK_PROJECT_ID || 'mock-project-id',
  publishableClientKey: import.meta.env.VITE_STACK_PUBLISHABLE_CLIENT_KEY || 'mock-client-key',
  tokenStore: 'cookie',
});

// A decorator to wrap stories with the necessary providers.
// The UserButton component requires both StackProvider and a Router.
const withProviders = (Story: React.ComponentType) => (
  <BrowserRouter>
    <StackProvider app={mockStackApp}>
      <Story />
    </StackProvider>
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

// The default story shows the Header with the UserButton in its "logged out" state.
// No specific args are needed because the decorator provides the context.
export const Default: Story = {
  name: 'Logged Out State',
};

// Note: Stack Frame doesn't support initialUser prop in StackProvider.
// To show logged-in state in Storybook, you would need to:
// 1. Use Storybook's MSW addon to mock authentication endpoints
// 2. Or manually sign in through the UserButton in the story
export const LoggedIn: Story = {
  name: 'Logged In State (requires manual sign-in)',
  render: () => (
    <div>
      <Header />
      <p className="text-sm text-muted-foreground p-4">
        Click the UserButton above to sign in and see the logged-in state.
      </p>
    </div>
  ),
};

// The 'WithUser' and 'WithNotifications' stories are no longer relevant
// because the Header component no longer accepts these props directly.
// The UserButton now manages its own state via the StackProvider context.