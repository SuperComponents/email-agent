import { render, screen } from '@testing-library/react';
import { TextReveal } from '../src/components/ScrollAnimations';

// Mock the hook
jest.mock('../src/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(() => false),
}));

describe('Simple TextReveal Test', () => {
  it('renders text content', () => {
    render(<TextReveal text="Hello World" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('splits text into words', () => {
    const { container } = render(<TextReveal text="Test multiple words" />);
    const words = container.querySelectorAll('span span');
    expect(words).toHaveLength(3);
  });
});
