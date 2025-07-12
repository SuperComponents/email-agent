import { useEffect } from 'react';

export function useScrollPerformance() {
  useEffect(() => {
    let ticking = false;

    function updateScrollPerformance() {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Add will-change to animated elements during scroll
          const animatedElements = document.querySelectorAll('.hover-lift, .premium-card, .animate-float');
          animatedElements.forEach(el => {
            (el as HTMLElement).style.willChange = 'transform';
          });

          // Remove will-change after scroll ends
          setTimeout(() => {
            animatedElements.forEach(el => {
              (el as HTMLElement).style.willChange = 'auto';
            });
          }, 150);

          ticking = false;
        });

        ticking = true;
      }
    }

    // Throttle scroll events
    let scrollTimeout: NodeJS.Timeout;
    function handleScroll() {
      clearTimeout(scrollTimeout);
      updateScrollPerformance();
      
      scrollTimeout = setTimeout(() => {
        // Cleanup after scroll ends
        const animatedElements = document.querySelectorAll('.hover-lift, .premium-card, .animate-float');
        animatedElements.forEach(el => {
          (el as HTMLElement).style.willChange = 'auto';
        });
      }, 150);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, []);
}