import type { Meta, StoryObj } from '@storybook/react-vite';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../../components/organisms/Header';

// A simple decorator to provide routing context in Storybook.
const withRouter = (Story: React.ComponentType) => (
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
  decorators: [withRouter],
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