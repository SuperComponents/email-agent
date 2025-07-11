import React from "react";
import { cn } from "../../lib/utils";
import { Logo } from "../atoms";
import { UserMenu } from "../molecules";

export type HeaderProps = React.HTMLAttributes<HTMLElement>;

export const Header = React.forwardRef<HTMLElement, HeaderProps>(
  ({ className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(
          "h-16 bg-card border-b border-border px-4 flex items-center justify-between",
          className
        )}
        {...props}
      >
        <div className="flex items-center gap-3">
          <Logo size="md" />
          <span className="text-foreground text-xl italic">ProResponse AI</span>
        </div>

        <UserMenu 
          userName="Support Agent"
          userEmail="agent@company.com"
          onLogout={() => console.log('Logout clicked')}
        />
      </header>
    );
  }
);

Header.displayName = "Header";
