import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

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

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const childElements = element.children;

    // Set initial states
    gsap.set(childElements, {
      opacity: 0,
      y: animation === 'fadeUp' ? 30 : 0,
      x: animation === 'slideInLeft' ? -50 : animation === 'slideInRight' ? 50 : 0,
      scale: animation === 'scaleIn' ? 0.9 : 1
    });

    // Create animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: element,
        start: 'top 80%',
        end: 'bottom 20%',
        toggleActions: 'play none none reverse'
      }
    });

    tl.to(childElements, {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      duration,
      delay,
      stagger,
      ease: 'power3.out'
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [animation, delay, duration, stagger]);

  return <div ref={ref}>{children}</div>;
}

interface ParallaxProps {
  children: React.ReactNode;
  speed?: number;
  offset?: number;
}

export function Parallax({ children, speed = 0.5, offset = 0 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;

    gsap.to(element, {
      y: () => (offset - ScrollTrigger.maxScroll(window)) * speed,
      ease: 'none',
      scrollTrigger: {
        trigger: element,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [speed, offset]);

  return <div ref={ref}>{children}</div>;
}

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
}

export function TextReveal({ text, className = '', delay = 0 }: TextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const words = text.split(' ');
    
    // Clear and rebuild content with spans
    element.innerHTML = words
      .map(word => `<span class="inline-block overflow-hidden"><span class="inline-block">${word}</span></span>`)
      .join(' ');

    const innerSpans = element.querySelectorAll('span span');

    gsap.set(innerSpans, { y: '100%' });

    ScrollTrigger.create({
      trigger: element,
      start: 'top 80%',
      onEnter: () => {
        gsap.to(innerSpans, {
          y: 0,
          duration: 0.8,
          delay,
          stagger: 0.02,
          ease: 'power3.out'
        });
      },
      once: true
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [text, delay]);

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

  useEffect(() => {
    if (!ref.current) return;

    const element = ref.current;
    const obj = { value: 0 };

    ScrollTrigger.create({
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

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [end, duration, prefix, suffix]);

  return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}