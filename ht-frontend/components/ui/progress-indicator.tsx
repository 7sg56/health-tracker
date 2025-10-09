'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Progress } from './progress';
import { LoadingSpinner } from './loading-spinner';

interface ProgressIndicatorProps {
  progress?: number;
  message?: string;
  showPercentage?: boolean;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function ProgressIndicator({
  progress,
  message,
  showPercentage = false,
  variant = 'default',
  size = 'default',
  className,
}: ProgressIndicatorProps) {
  const [animatedProgress, setAnimatedProgress] = React.useState(0);

  React.useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  const sizeClasses = {
    sm: 'h-1',
    default: 'h-2',
    lg: 'h-3',
  };

  const variantClasses = {
    default: 'bg-primary',
    success: 'bg-green-600',
    warning: 'bg-amber-600',
    destructive: 'bg-red-600',
  };

  return (
    <div className={cn('space-y-2', className)}>
      {message && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{message}</span>
          {showPercentage && progress !== undefined && (
            <span className="font-medium">{Math.round(animatedProgress)}%</span>
          )}
        </div>
      )}

      <div
        className={cn(
          'bg-muted w-full overflow-hidden rounded-full',
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            'h-full transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
          style={{
            width:
              progress !== undefined
                ? `${Math.min(100, Math.max(0, animatedProgress))}%`
                : '0%',
          }}
        />
      </div>
    </div>
  );
}

interface CircularProgressProps {
  progress?: number;
  size?: number;
  strokeWidth?: number;
  variant?: 'default' | 'success' | 'warning' | 'destructive';
  showPercentage?: boolean;
  className?: string;
}

export function CircularProgress({
  progress = 0,
  size = 64,
  strokeWidth = 4,
  variant = 'default',
  showPercentage = false,
  className,
}: CircularProgressProps) {
  const [animatedProgress, setAnimatedProgress] = React.useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (animatedProgress / 100) * circumference;

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const variantClasses = {
    default: 'stroke-primary',
    success: 'stroke-green-600',
    warning: 'stroke-amber-600',
    destructive: 'stroke-red-600',
  };

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        className
      )}
    >
      <svg width={size} height={size} className="-rotate-90 transform">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-muted"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500 ease-out',
            variantClasses[variant]
          )}
        />
      </svg>

      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-medium">
            {Math.round(animatedProgress)}%
          </span>
        </div>
      )}
    </div>
  );
}

interface LoadingStateProps {
  isLoading: boolean;
  progress?: number;
  message?: string;
  children: React.ReactNode;
  overlay?: boolean;
  className?: string;
}

export function LoadingState({
  isLoading,
  progress,
  message,
  children,
  overlay = false,
  className,
}: LoadingStateProps) {
  if (!isLoading) {
    return <>{children}</>;
  }

  if (overlay) {
    return (
      <div className={cn('relative', className)}>
        {children}
        <div className="bg-background/80 absolute inset-0 z-10 flex items-center justify-center backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6">
            {progress !== undefined ? (
              <CircularProgress progress={progress} showPercentage size={48} />
            ) : (
              <LoadingSpinner size="lg" />
            )}
            {message && (
              <p className="text-muted-foreground text-center text-sm">
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex flex-col items-center justify-center p-8', className)}
    >
      {progress !== undefined ? (
        <div className="w-full max-w-xs space-y-4">
          <CircularProgress
            progress={progress}
            showPercentage
            size={64}
            className="mx-auto"
          />
          <ProgressIndicator
            progress={progress}
            message={message}
            showPercentage
          />
        </div>
      ) : (
        <>
          <LoadingSpinner size="xl" className="mb-4" />
          {message && (
            <p className="text-muted-foreground text-center text-sm">
              {message}
            </p>
          )}
        </>
      )}
    </div>
  );
}
