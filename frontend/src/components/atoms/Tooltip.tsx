import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  markdown?: boolean;
}

export function Tooltip({
  content,
  children,
  side = 'top',
  className,
  markdown = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = triggerRect.left + triggerRect.width / 2;
      let y = triggerRect.top;

      switch (side) {
        case 'top':
          y = triggerRect.top - tooltipRect.height - 8;
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'bottom':
          y = triggerRect.bottom + 8;
          x = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
        case 'right':
          x = triggerRect.right + 8;
          y = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
          break;
      }

      // Keep tooltip within viewport bounds
      x = Math.max(8, Math.min(x, viewportWidth - tooltipRect.width - 8));
      y = Math.max(8, Math.min(y, viewportHeight - tooltipRect.height - 8));

      setPosition({ x, y });
    }
  }, [isVisible, side]);

  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isPinned &&
        tooltipRef.current &&
        triggerRef.current &&
        !tooltipRef.current.contains(event.target as Node) &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsPinned(false);
        setIsVisible(false);
      }
    };

    if (isPinned) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isPinned]);

  const handleTriggerClick = () => {
    if (isPinned) {
      setIsPinned(false);
      setIsVisible(false);
    } else {
      setIsPinned(true);
      setIsVisible(true);
    }
  };

  const handleMouseEnter = () => {
    if (!isPinned) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isPinned) {
      setIsVisible(false);
    }
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-card',
    bottom:
      'bottom-full left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-card',
    left: 'left-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-card',
    right:
      'right-full top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-card',
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleTriggerClick}
        className="inline-block cursor-pointer"
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'fixed z-50 px-4 py-3 bg-card border border-border rounded-lg shadow-xl',
            'max-w-lg min-w-[300px] max-h-[400px] overflow-y-auto overflow-x-hidden',
            'backdrop-blur-sm bg-card/95',
            className,
          )}
          style={{
            left: position.x,
            top: position.y,
          }}
        >
          {/* Arrow */}
          <div className={cn('absolute w-0 h-0 border-4', arrowClasses[side])} />

          {/* Content */}
          {markdown ? (
            <div className="prose prose-sm prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  // Beautiful heading styles with proper hierarchy
                  h1: ({ children }) => (
                    <h1 className="text-lg font-bold text-foreground mb-4 pb-2 border-b border-border/30 leading-tight">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-base font-bold text-foreground mb-3 mt-6 leading-tight">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-sm font-semibold text-foreground mb-2 mt-4 leading-tight">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-sm font-medium text-foreground mb-2 mt-3 leading-tight">
                      {children}
                    </h4>
                  ),
                  
                  // Elegant paragraph styling
                  p: ({ children }) => (
                    <p className="text-sm text-foreground/85 mb-4 last:mb-0 leading-relaxed">
                      {children}
                    </p>
                  ),
                  
                  // Styled links with icons
                  a: ({ children }) => (
                    <a className="text-primary font-medium hover:text-primary/80 cursor-pointer inline-flex items-center gap-1 mb-4 px-2 py-1 rounded-md bg-primary/5 hover:bg-primary/10 transition-colors">
                      {children}
                    </a>
                  ),
                  
                  // Enhanced text formatting
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">
                      {children}
                    </strong>
                  ),
                  em: ({ children }) => (
                    <em className="italic text-foreground/90 bg-accent/10 px-1 py-0.5 rounded">
                      {children}
                    </em>
                  ),
                  
                  // Beautiful code styling
                  code: ({ children }) => (
                    <code className="px-2 py-1 bg-accent/80 rounded-md text-xs font-mono text-accent-foreground border border-border/20 shadow-sm">
                      {children}
                    </code>
                  ),
                  pre: ({ children }) => (
                    <pre className="bg-accent/60 border border-border/30 rounded-lg p-4 overflow-x-hidden text-xs break-words whitespace-pre-wrap font-mono shadow-inner mb-4">
                      {children}
                    </pre>
                  ),
                  
                  // Enhanced list styling
                  ul: ({ children }) => (
                    <ul className="text-sm space-y-1 ml-6 mb-4 list-none">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="text-sm space-y-1 ml-6 mb-4 list-decimal list-inside">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground/90 relative before:content-['▸'] before:text-primary before:font-bold before:absolute before:-left-4 before:top-0 leading-relaxed">
                      {children}
                    </li>
                  ),
                  
                  // Blockquote styling
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/30 pl-4 py-2 mb-4 bg-accent/20 rounded-r-md italic text-foreground/80">
                      {children}
                    </blockquote>
                  ),
                  
                  // Table styling
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full text-sm border-collapse border border-border/30 rounded-lg overflow-hidden">
                        {children}
                      </table>
                    </div>
                  ),
                  th: ({ children }) => (
                    <th className="border border-border/30 bg-accent/40 px-3 py-2 text-left font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border border-border/30 px-3 py-2 text-foreground/90">
                      {children}
                    </td>
                  ),
                  
                  // Horizontal rule
                  hr: () => (
                    <hr className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
                  ),
                }}
              >
                {typeof content === 'string' ? content : content?.toString() ?? ''}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="text-sm text-foreground whitespace-pre-wrap break-words">{content}</div>
          )}
        </div>
      )}
    </>
  );
}
