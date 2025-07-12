import React from 'react';
import { cn } from '../../lib/utils';
import logoImage from '../../assets/logo.png';

export interface LogoProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  size?: 'sm' | 'md' | 'lg';
}

export const Logo = React.forwardRef<HTMLImageElement, LogoProps>(
  ({ className, size = 'md', alt = 'ProResponse AI Logo', ...props }, ref) => {
    return (
      <img
        ref={ref}
        src={logoImage}
        alt={alt}
        className={cn(
          'object-contain',
          {
            'h-6 w-6': size === 'sm',
            'h-8 w-8': size === 'md',
            'h-12 w-12': size === 'lg',
          },
          className
        )}
        {...props}
      />
    );
  }
);

Logo.displayName = 'Logo';