import React from 'react';
import { cn } from '../../lib/utils';

export interface AuthLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AuthLayout = React.forwardRef<HTMLDivElement, AuthLayoutProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'min-h-screen bg-background flex items-center justify-center p-4',
          className
        )}
        {...props}
      >
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold">OpenSupport</h1>
            <p className="text-secondary-foreground mt-2">
              AI-powered support assistant
            </p>
          </div>
          {children}
        </div>
      </div>
    );
  }
);

AuthLayout.displayName = 'AuthLayout';