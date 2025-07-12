import { renderHook, act } from '@testing-library/react';
import { usePrefersReducedMotion } from '../src/hooks/usePrefersReducedMotion';

describe('usePrefersReducedMotion Hook', () => {
  let mockMatchMedia: jest.Mock;
  let mockEventListener: { addEventListener: jest.Mock; removeEventListener: jest.Mock };

  beforeEach(() => {
    mockEventListener = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    mockMatchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      ...mockEventListener,
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns false when prefers-reduced-motion is not set', () => {
    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when prefers-reduced-motion is set', () => {
    mockMatchMedia.mockImplementation(() => ({
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));

    const { result } = renderHook(() => usePrefersReducedMotion());
    expect(result.current).toBe(true);
  });

  it('listens for media query changes', () => {
    renderHook(() => usePrefersReducedMotion());
    
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-reduced-motion: reduce)');
    expect(mockEventListener.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('updates state when media query changes', () => {
    let changeHandler: (event: MediaQueryListEvent) => void;

    mockEventListener.addEventListener.mockImplementation((event, handler) => {
      if (event === 'change') {
        changeHandler = handler;
      }
    });

    const { result } = renderHook(() => usePrefersReducedMotion());

    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      changeHandler({ matches: true } as MediaQueryListEvent);
    });

    expect(result.current).toBe(true);
  });

  it('removes event listener on cleanup', () => {
    const { unmount } = renderHook(() => usePrefersReducedMotion());
    
    unmount();
    
    expect(mockEventListener.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
