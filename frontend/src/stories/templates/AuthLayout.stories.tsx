import type { Meta, StoryObj } from '@storybook/react-vite';
import { AuthLayout } from '../../components/templates/AuthLayout';
import { Button } from '../../components/atoms/Button';
import { Input } from '../../components/atoms/Input';
import { Label } from '../../components/atoms/Label';

const meta: Meta<typeof AuthLayout> = {
  title: 'Templates/AuthLayout',
  component: AuthLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Login: Story = {
  render: () => (
    <AuthLayout>
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Sign in to your account</h2>
        <form className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              className="mt-1"
            />
          </div>
          <Button className="w-full">Sign In</Button>
        </form>
        <p className="text-sm text-secondary-foreground text-center mt-4">
          Don't have an account?{' '}
          <Button variant="link" className="p-0 h-auto">
            Sign up
          </Button>
        </p>
      </div>
    </AuthLayout>
  ),
};

export const Signup: Story = {
  render: () => (
    <AuthLayout>
      <div className="bg-card rounded-lg border border-border p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Create your account</h2>
        <form className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              className="mt-1"
            />
          </div>
          <Button className="w-full">Create Account</Button>
        </form>
        <p className="text-sm text-secondary-foreground text-center mt-4">
          Already have an account?{' '}
          <Button variant="link" className="p-0 h-auto">
            Sign in
          </Button>
        </p>
      </div>
    </AuthLayout>
  ),
};