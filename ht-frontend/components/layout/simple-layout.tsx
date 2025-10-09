'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface SimpleLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
}

export function SimpleLayout({
  children,
  className,
  maxWidth = 'lg',
  centered = false,
}: SimpleLayoutProps) {
  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        'bg-background min-h-screen',
        centered && 'flex items-center justify-center',
        className
      )}
    >
      <div
        className={cn(
          'container mx-auto px-4 py-6',
          maxWidthClasses[maxWidth],
          centered && 'w-full'
        )}
      >
        {children}
      </div>
    </div>
  );
}
