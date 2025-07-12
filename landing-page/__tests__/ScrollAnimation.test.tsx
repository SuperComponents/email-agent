import { render, screen } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { axe } from 'jest-axe';
import { ScrollAnimation } from '../src/components/ScrollAnimations';

expect.extend(toHaveNoViolations);

// Mock the hook
jest.mock('../src/hooks/usePrefersReducedMotion', () => ({
  usePrefersReducedMotion: jest.fn(() => false),
}));

describe('ScrollAnimation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children correctly', () => {
    render(
      <ScrollAnimation>
        <div data-testid="test-child">Test content</div>
      </ScrollAnimation>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('accepts animation prop', () => {
    const { container } = render(
      <ScrollAnimation animation="fadeIn">
        <div>Content</div>
      </ScrollAnimation>
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles multiple children', () => {
    render(
      <ScrollAnimation>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <div data-testid="child-3">Child 3</div>
      </ScrollAnimation>
    );
    
    expect(screen.getByTestId('child-1')).toBeInTheDocument();
    expect(screen.getByTestId('child-2')).toBeInTheDocument();
    expect(screen.getByTestId('child-3')).toBeInTheDocument();
  });

  it('respects reduced motion preference', () => {
    const { usePrefersReducedMotion } = require('../src/hooks/usePrefersReducedMotion');
    usePrefersReducedMotion.mockReturnValue(true);

    render(
      <ScrollAnimation>
        <div data-testid="test-child">Test content</div>
      </ScrollAnimation>
    );
    
    expect(screen.getByTestId('test-child')).toBeInTheDocument();
  });

  it('is accessible', async () => {
    const { container } = render(
      <ScrollAnimation>
        <div>Accessible content</div>
        <button>Interactive element</button>
      </ScrollAnimation>
    );
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('accepts custom timing props', () => {
    const { container } = render(
      <ScrollAnimation 
        delay={0.5} 
        duration={2} 
        stagger={0.2}
      >
        <div>Content with custom timing</div>
      </ScrollAnimation>
    );
    
    expect(container.firstChild).toBeInTheDocument();
  });
});
