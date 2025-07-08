import type { Meta, StoryObj } from '@storybook/react';

const meta: Meta = {
  title: 'Design System/Tokens',
  parameters: {
    layout: 'padded',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Colors: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Color Palette</h2>
      
      <div>
        <h3 className="text-lg font-semibold mb-4">Primary Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="background" className="bg-background" />
          <ColorSwatch name="foreground" className="bg-foreground" />
          <ColorSwatch name="card" className="bg-card border" />
          <ColorSwatch name="card-foreground" className="bg-card-foreground" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Interactive Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="primary" className="bg-primary" />
          <ColorSwatch name="primary-foreground" className="bg-primary-foreground border" />
          <ColorSwatch name="secondary" className="bg-secondary" />
          <ColorSwatch name="secondary-foreground" className="bg-secondary-foreground" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Semantic Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="destructive" className="bg-destructive" />
          <ColorSwatch name="destructive-foreground" className="bg-destructive-foreground border" />
          <ColorSwatch name="accent" className="bg-accent" />
          <ColorSwatch name="accent-foreground" className="bg-accent-foreground" />
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">UI Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <ColorSwatch name="border" className="bg-border" />
          <ColorSwatch name="input" className="bg-input border" />
          <ColorSwatch name="ring" className="bg-ring" />
        </div>
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Typography Scale</h2>
      
      <div className="space-y-6">
        <div>
          <p className="text-xs text-secondary-foreground mb-1">text-2xl (1.5rem / 2rem)</p>
          <p className="text-2xl">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-secondary-foreground mb-1">text-xl (1.25rem / 1.75rem)</p>
          <p className="text-xl">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-secondary-foreground mb-1">text-lg (1.125rem / 1.75rem)</p>
          <p className="text-lg">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-secondary-foreground mb-1">text-base (1rem / 1.5rem)</p>
          <p className="text-base">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-secondary-foreground mb-1">text-sm (0.875rem / 1.25rem)</p>
          <p className="text-sm">The quick brown fox jumps over the lazy dog</p>
        </div>
        <div>
          <p className="text-xs text-secondary-foreground mb-1">text-xs (0.75rem / 1rem)</p>
          <p className="text-xs">The quick brown fox jumps over the lazy dog</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-4">Font Weights</h3>
        <div className="space-y-2">
          <p className="font-normal">font-normal (400) - The quick brown fox jumps over the lazy dog</p>
          <p className="font-medium">font-medium (500) - The quick brown fox jumps over the lazy dog</p>
          <p className="font-semibold">font-semibold (600) - The quick brown fox jumps over the lazy dog</p>
          <p className="font-bold">font-bold (700) - The quick brown fox jumps over the lazy dog</p>
        </div>
      </div>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Spacing Scale</h2>
      
      <div className="space-y-4">
        {[
          { name: '0', value: '0', width: 'w-0' },
          { name: '1', value: '0.25rem', width: 'w-1' },
          { name: '2', value: '0.5rem', width: 'w-2' },
          { name: '3', value: '0.75rem', width: 'w-3' },
          { name: '4', value: '1rem', width: 'w-4' },
          { name: '5', value: '1.25rem', width: 'w-5' },
          { name: '6', value: '1.5rem', width: 'w-6' },
          { name: '8', value: '2rem', width: 'w-8' },
          { name: '10', value: '2.5rem', width: 'w-10' },
          { name: '12', value: '3rem', width: 'w-12' },
          { name: '16', value: '4rem', width: 'w-16' },
          { name: '20', value: '5rem', width: 'w-20' },
          { name: '24', value: '6rem', width: 'w-24' },
        ].map((space) => (
          <div key={space.name} className="flex items-center gap-4">
            <span className="text-sm font-medium w-8">{space.name}</span>
            <span className="text-xs text-secondary-foreground w-20">{space.value}</span>
            <div className={`h-8 bg-primary ${space.width}`} />
          </div>
        ))}
      </div>
    </div>
  ),
};

export const BorderRadius: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Border Radius</h2>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div className="text-center">
          <div className="w-24 h-24 bg-primary rounded-sm mx-auto mb-2" />
          <p className="text-sm font-medium">rounded-sm</p>
          <p className="text-xs text-secondary-foreground">0.125rem</p>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-primary rounded-md mx-auto mb-2" />
          <p className="text-sm font-medium">rounded-md</p>
          <p className="text-xs text-secondary-foreground">0.375rem</p>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-primary rounded-lg mx-auto mb-2" />
          <p className="text-sm font-medium">rounded-lg</p>
          <p className="text-xs text-secondary-foreground">0.5rem</p>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-primary rounded-xl mx-auto mb-2" />
          <p className="text-sm font-medium">rounded-xl</p>
          <p className="text-xs text-secondary-foreground">0.75rem</p>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-2" />
          <p className="text-sm font-medium">rounded-full</p>
          <p className="text-xs text-secondary-foreground">9999px</p>
        </div>
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold">Shadow Scale</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="text-center">
          <div className="w-32 h-32 bg-card rounded-lg shadow-sm mx-auto mb-4" />
          <p className="text-sm font-medium">shadow-sm</p>
        </div>
        <div className="text-center">
          <div className="w-32 h-32 bg-card rounded-lg shadow-md mx-auto mb-4" />
          <p className="text-sm font-medium">shadow-md</p>
        </div>
        <div className="text-center">
          <div className="w-32 h-32 bg-card rounded-lg shadow-lg mx-auto mb-4" />
          <p className="text-sm font-medium">shadow-lg</p>
        </div>
      </div>
    </div>
  ),
};

// Helper component for color swatches
function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="space-y-2">
      <div className={`h-20 rounded-lg ${className}`} />
      <p className="text-sm font-medium">{name}</p>
      <p className="text-xs text-secondary-foreground">var(--color-{name})</p>
    </div>
  );
}