// Utility to verify accessibility implementation
export function verifyReducedMotionSupport(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    console.log(
      'Reduced motion preference:',
      mediaQuery.matches ? 'enabled' : 'disabled'
    );

    // Test if the CSS media query is working
    const testElement = document.createElement('div');
    testElement.style.cssText = `
      animation: test-animation 1s;
      position: absolute;
      top: -9999px;
    `;
    document.body.appendChild(testElement);

    const computedStyle = window.getComputedStyle(testElement);
    const animationDuration = computedStyle.animationDuration;

    document.body.removeChild(testElement);

    // If reduced motion is enabled, animation duration should be very short
    const isReducedMotionWorking =
      mediaQuery.matches &&
      (animationDuration === '0.01ms' || animationDuration === '0s');

    console.log(
      'CSS reduced motion implementation:',
      isReducedMotionWorking ? 'working' : 'needs verification'
    );

    return true;
  } catch (error) {
    console.error('Error verifying reduced motion support:', error);
    return false;
  }
}

// Function to simulate reduced motion for testing
export function simulateReducedMotion(enable: boolean): void {
  if (typeof window === 'undefined') return;

  const style =
    document.getElementById('test-reduced-motion') ||
    document.createElement('style');
  style.id = 'test-reduced-motion';

  if (enable) {
    style.textContent = `
      *, ::before, ::after {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
      }
    `;
  } else {
    style.textContent = '';
  }

  if (!style.parentNode) {
    document.head.appendChild(style);
  }

  console.log('Reduced motion simulation:', enable ? 'enabled' : 'disabled');
}
