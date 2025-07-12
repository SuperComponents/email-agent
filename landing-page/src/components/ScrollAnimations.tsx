import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

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
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;
        const childElements = element.children;

        if (prefersReducedMotion) {
            // Set elements to final state immediately when reduced motion is preferred
            gsap.set(childElements, {
                opacity: 1,
                y: 0,
                x: 0,
                scale: 1
            });
            return;
        }

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
    }, [animation, delay, duration, stagger, prefersReducedMotion]);

    return <div ref={ref}>{children}</div>;
}

interface ParallaxProps {
    children: React.ReactNode;
    speed?: number;
    offset?: number;
}

export function Parallax({ children, speed = 0.5, offset = 0 }: ParallaxProps) {
    const ref = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        if (prefersReducedMotion) {
            // No parallax effect when reduced motion is preferred
            return;
        }

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
    }, [speed, offset, prefersReducedMotion]);

    return <div ref={ref}>{children}</div>;
}

interface TextRevealProps {
    text: string;
    className?: string;
    delay?: number;
    gradient?: boolean;
    'aria-hidden'?: boolean;
}

export function TextReveal({ text, className = '', delay = 0, gradient = false, 'aria-hidden': ariaHidden }: TextRevealProps) {

    const containerRef = useRef<HTMLSpanElement>(null);
    const wordsRef = useRef<HTMLSpanElement[]>([]);
    const prefersReducedMotion = usePrefersReducedMotion();

    const words = text.split(' ');

    useEffect(() => {
        if (!containerRef.current || wordsRef.current.length === 0) return;

        const innerSpans = wordsRef.current.filter(span => span !== null);
        
        if (prefersReducedMotion) {
            // Show immediately for reduced motion
            gsap.set(innerSpans, { y: 0 });
            return;
        }

        // Initial state: hide text by moving it down
        gsap.set(innerSpans, { y: '100%' });

        // Check if element is in viewport initially (for hero sections)
        const rect = containerRef.current.getBoundingClientRect();
        const isInitiallyVisible = rect.top < window.innerHeight * 0.8;
        
        if (isInitiallyVisible) {
            // For hero sections and initially visible content, animate immediately
            gsap.to(innerSpans, {
                y: 0,
                duration: 0.8,
                delay,
                stagger: 0.02,
                ease: 'power3.out'
            });
        } else {
            // For content below the fold, use ScrollTrigger
            ScrollTrigger.create({
                trigger: containerRef.current,
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
        }

        return () => {
            ScrollTrigger.getAll().forEach(trigger => trigger.kill());
        };
    }, [text, delay, prefersReducedMotion]);

    // Detect gradient in className for backward compatibility
    const hasGradientInClassName = className.includes('bg-gradient-to-r');
    const shouldUseGradient = gradient || hasGradientInClassName;

    return (
        <span ref={containerRef} aria-hidden={ariaHidden}>
            {words.map((word, index) => (
                <span key={index} className="inline-block overflow-hidden">
                    <span
                        ref={(el) => {
                            if (el) wordsRef.current[index] = el;
                        }}
                        className={`inline-block ${className}`}
                    >
                        {word}
                    </span>
                    {index < words.length - 1 && ' '}
                </span>
            ))}
        </span>
    );
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
    const prefersReducedMotion = usePrefersReducedMotion();

    useEffect(() => {
        if (!ref.current) return;

        const element = ref.current;

        if (prefersReducedMotion) {
            // Show final value immediately when reduced motion is preferred
            element.textContent = `${prefix}${end}${suffix}`;
            return;
        }

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
    }, [end, duration, prefix, suffix, prefersReducedMotion]);

    return <span ref={ref} className={className}>{prefix}0{suffix}</span>;
}
