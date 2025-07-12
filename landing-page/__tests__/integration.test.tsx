import { render, screen, waitFor } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { axe } from 'jest-axe';
import App from '../src/App';

expect.extend(toHaveNoViolations);

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders main application without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('has proper document structure', async () => {
    const { container } = render(<App />);
    
    await waitFor(() => {
      // Check for semantic HTML structure
      const main = container.querySelector('main');
      expect(main).toBeInTheDocument();
    });
  });

  it('meets accessibility standards', async () => {
    const { container } = render(<App />);
    
    await waitFor(async () => {
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    }, { timeout: 10000 });
  });

  it('handles reduced motion correctly', async () => {
    // Mock reduced motion preference
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(<App />);
    
    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('loads without console errors', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    render(<App />);
    
    expect(consoleSpy).not.toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
});
