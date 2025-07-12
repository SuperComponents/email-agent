import { useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

// Utility to manage will-change property for performance
const manageWillChange = (element: Element, enable: boolean) => {
  if (enable) {
    (element as HTMLElement).style.willChange = 'transform, opacity';
  } else {
    (element as HTMLElement).style.willChange = 'auto';
  }
};

// IntersectionObserver for performance optimization
const createVisibilityObserver = (callback: (isVisible: boolean) => void) => {
  return new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        callback(entry.isIntersecting);
      });
    },
    { rootMargin: '50px 0px', threshold: 0.1 }
  );
};

interface ScrollAnimationProps {
  children: React.ReactNode;
  animation?: 'fadeUp' | 'fadeIn' | 'scaleIn' | 'slideInLeft' | 'slideInRight';
  delay?: number;
  duration?: number;
  stagger?: number;
}

export function ScrollAnimation({ 
  children, 
  animation = 'fadeUp',
  delay = 0,
  duration = 1,
  stagger = 0.1
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const initializeAnimation = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;
    const childElements = Array.from(element.children);

    // Enable will-change for animation performance
    childElements.forEach(child => manageWillChange(child, true));

    // Set initial states with translate3d for hardware acceleration
    gsap.set(childElements, {
      opacity: 0,
      transform: animation === 'fadeUp' ? 'translate3d(0, 30px, 0)' : 
                animation === 'slideInLeft' ? 'translate3d(-50px, 0, 0)' :
                animation === 'slideInRight' ? 'translate3d(50px, 0, 0)' :
                'translate3d(0, 0, 0)',
      scale: animation === 'scaleIn' ? 0.9 : 1
    });

    // Create animation with performance-optimized callbacks
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse',
        onEnter: () => {
          childElements.forEach(child => manageWillChange(child, true));
        },
        onLeave: () => {
          childElements.forEach(child => manageWillChange(child, false));
        },
        onEnterBack: () => {
          childElements.forEach(child => manageWillChange(child, true));
        },
        onLeaveBack: () => {
          childElements.forEach(child => manageWillChange(child, false));
        }
      },
      onComplete: () => {
        // Clean up will-change after animation completes
        childElements.forEach(child => manageWillChange(child, false));
      }
    });

    tl.to(childElements, {
      opacity: 1,
      transform: 'translate3d(0, 0, 0)',
      scale: 1,
      duration,
      delay,
      stagger,
      ease: 'power3.out'
    });

    scrollTriggerRef.current = ScrollTrigger.getAll().find(trigger => trigger.trigger === element) || null;
  }, [animation, delay, duration, stagger]);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const childElements = element.children;

    if (prefersReducedMotion) {
      // Set elements to final state immediately when reduced motion is preferred
      gsap.set(childElements, {
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
        scale: 1
      });
      return;
    }

    // Use IntersectionObserver to only initialize ScrollTrigger when element is near viewport
    observerRef.current = createVisibilityObserver((isVisible) => {
      if (isVisible && !scrollTriggerRef.current) {
        initializeAnimation();
        // Disconnect observer after initialization to save resources
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      // Clean up will-change on unmount
      Array.from(childElements).forEach(child => manageWillChange(child, false));
    };
  }, [initializeAnimation, prefersReducedMotion]);

  return <div ref={ref}>{children}</div>;
}

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  offset?: number;
}

export function Parallax({ children, speed = 0.5, offset = 0 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const initializeParallax = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;
    
    // Enable will-change for smooth parallax
    manageWillChange(element, true);

    gsap.to(element, {
      y: () => (offset - ScrollTrigger.maxScroll(window)) * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true,
        onLeave: () => manageWillChange(element, false),
        onEnterBack: () => manageWillChange(element, true),
        onLeaveBack: () => manageWillChange(element, false),
        onEnter: () => manageWillChange(element, true)
      }
    });

    scrollTriggerRef.current = ScrollTrigger.getAll().find(trigger => trigger.trigger === element) || null;
  }, [speed, offset]);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Use IntersectionObserver to only initialize ScrollTrigger when element is near viewport
    observerRef.current = createVisibilityObserver((isVisible) => {
      if (isVisible && !scrollTriggerRef.current) {
        initializeParallax();
        // Keep observer active for parallax as it needs to track visibility
      }
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      // Clean up will-change on unmount
      manageWillChange(element, false);
    };
  }, [initializeParallax]);

  return <div ref={ref}>{children}</div>;
}

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className = '', delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const initializeTextReveal = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;
    const words = text.split(' ');
    
    // Clear and rebuild content with spans
    element.innerHTML = words
      .map(word => `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`)
      .join(' ');

    const innerSpans = element.querySelectorAll('span span');

    // Enable will-change for text animation
    Array.from(innerSpans).forEach(span => manageWillChange(span, true));

    // Use translate3d for hardware acceleration
    gsap.set(innerSpans, { transform: 'translate3d(0, 100%, 0)' });

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(innerSpans, {
          transform: 'translate3d(0, 0, 0)',
          duration: 0.8,
          delay,
          stagger: 0.02,
          ease: 'power3.out',
          onComplete: () => {
            // Clean up will-change after animation
            Array.from(innerSpans).forEach(span => manageWillChange(span, false));
          }
        });
      },
      once: true
    });
  }, [text, delay]);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Use IntersectionObserver to only initialize ScrollTrigger when element is near viewport
    observerRef.current = createVisibilityObserver((isVisible) => {
      if (isVisible && !scrollTriggerRef.current) {
        initializeTextReveal();
        // Disconnect observer after initialization
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
      // Clean up will-change on unmount
      if (element.querySelectorAll) {
        Array.from(element.querySelectorAll('span span')).forEach(span => 
          manageWillChange(span, false)
        );
      }
    };
  }, [initializeTextReveal]);

  return <span ref={ref} className={className} />;
}

interface CountUpProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function CountUp({ end, duration = 2, prefix = '', suffix = '', className = '' }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const scrollTriggerRef = useRef<ScrollTrigger | null>(null);

  const initializeCountUp = useCallback(() => {
    if (!ref.current) return;

    const element = ref.current;
    const obj = { value: 0 };

    scrollTriggerRef.current = ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(obj, {
          value: end,
          duration,
          ease: 'power3.out',
          onUpdate: () => {
            element.textContent = `${prefix}${Math.round(obj.value)}${suffix}`;
          }
        });
      },
      once: true
    });
  }, [end, duration, prefix, suffix]);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    // Use IntersectionObserver to only initialize ScrollTrigger when element is near viewport
    observerRef.current = createVisibilityObserver((isVisible) => {
      if (isVisible && !scrollTriggerRef.current) {
        initializeCountUp();
        // Disconnect observer after initialization
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
      }
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (scrollTriggerRef.current) {
        scrollTriggerRef.current.kill();
      }
    };
  }, [initializeCountUp]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
