'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/utils/responsive';
import { InlineSpinner } from './loading-spinner';
import { createInteractiveElement } from '@/lib/utils/animations';

interface LoadingButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  loadingText?: string;
  asChild?: boolean;
  touchFriendly?: boolean;
  showProgress?: boolean;
  progress?: number;
  icon?: React.ReactNode;
  loadingIcon?: React.ReactNode;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  disabled,
  className,
  touchFriendly = true,
  showProgress = false,
  progress,
  icon,
  loadingIcon,
  size,
  ...props
}: LoadingButtonProps) {
  const isMobile = useIsMobile();

  // Auto-adjust size for mobile if touchFriendly is enabled
  const finalSize = React.useMemo(() => {
    if (touchFriendly && isMobile && !size) {
      return 'lg';
    }
    return size;
  }, [touchFriendly, isMobile, size]);

  const defaultLoadingIcon = loadingIcon || (
    <Loader2 className="h-4 w-4 animate-spin" />
  );

  return (
    <Button
      className={cn(
        // Enhanced loading state styles with animations
        loading && 'cursor-not-allowed',
        // Touch-friendly spacing on mobile
        touchFriendly && isMobile && 'min-h-[44px]',
        // Interactive animations when not loading
        !loading &&
          createInteractiveElement('', {
            hover: 'scale',
            focus: 'ring',
            transition: 'normal',
          }),
        className
      )}
      disabled={disabled || loading}
      size={finalSize}
      {...({
        ...props,
        'aria-expanded':
          typeof props['aria-expanded'] === 'string'
            ? props['aria-expanded'] === 'true'
            : props['aria-expanded'],
      } as any)}
    >
      <div className="relative flex w-full items-center justify-center">
        {loading ? (
          <>
            <span className="animate-fade-in mr-2">{defaultLoadingIcon}</span>
            <span
              className={cn(
                'transition-all duration-300 ease-out',
                loading
                  ? 'translate-x-0 opacity-100'
                  : 'translate-x-2 opacity-0'
              )}
            >
              {loadingText || children}
            </span>
          </>
        ) : (
          <>
            {icon && (
              <span className="mr-2 transition-transform duration-200 group-hover:scale-110">
                {icon}
              </span>
            )}
            <span
              className={cn(
                'transition-all duration-300 ease-out',
                loading
                  ? '-translate-x-2 opacity-0'
                  : 'translate-x-0 opacity-100'
              )}
            >
              {children}
            </span>
          </>
        )}

        {/* Progress indicator */}
        {showProgress && progress !== undefined && (
          <div className="bg-primary-foreground/30 absolute bottom-0 left-0 h-0.5 w-full">
            <div
              className="bg-primary-foreground h-full transition-all duration-500 ease-out"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )}
      </div>
    </Button>
  );
}
