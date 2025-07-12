import { render, screen, waitFor } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { axe } from 'jest-axe';
import { TextReveal } from '../src/components/ScrollAnimations';

expect.extend(toHaveNoViolations);

// Mock the hook
jest.mock('../src/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(() => false),
}));

describe('TextReveal Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders text content correctly', () => {
    render(<TextReveal text="Hello World" />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('splits text into individual words', () => {
    const { container } = render(<TextReveal text="Test multiple words here" />);
    const words = container.querySelectorAll('span span');
    expect(words).toHaveLength(4);
  });

  it('applies custom className correctly', () => {
    const { container } = render(
      <TextReveal text="Test" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('applies gradient when gradient prop is true', () => {
    const { container } = render(
      <TextReveal text="Test" gradient={true} />
    );
    const wordSpan = container.querySelector('span span span');
    expect(wordSpan).toHaveClass('bg-gradient-to-r');
  });

  it('handles reduced motion preference', async () => {
    const { usePrefersReducedMotion } = require('../src/hooks/usePrefersReducedMotion');
    usePrefersReducedMotion.mockReturnValue(true);

    const { container } = render(<TextReveal text="Test" />);
    
    await waitFor(() => {
      const wordSpan = container.querySelector('span span span') as HTMLElement;
      expect(wordSpan.style.transform).toBe('translateY(0px)');
    });
  });

  it('is accessible', async () => {
    const { container } = render(<TextReveal text="Accessible text content" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('preserves word spacing', () => {
    render(<TextReveal text="Word spacing test" />);
    const text = screen.getByText(/Word spacing test/);
    expect(text.textContent).toBe('Word spacing test');
  });
});
