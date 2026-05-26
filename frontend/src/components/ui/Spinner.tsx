import React from 'react';
import { cn } from '../../lib/utils';

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'white';
}

export function Spinner({ size = 'md', variant = 'primary', className, ...props }: SpinnerProps) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  const variants = {
    primary: 'border-amber-600 border-t-transparent',
    secondary: 'border-emerald-600 border-t-transparent',
    white: 'border-white border-t-transparent',
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-solid',
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
export default Spinner;
