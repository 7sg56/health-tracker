import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        default: "h-6 w-6",
        lg: "h-8 w-8",
        xl: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        destructive: "text-destructive",
        success: "text-green-600",
        warning: "text-amber-600",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

export interface LoadingSpinnerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size, variant, label, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-center", className)}
        {...props}
      >
        <div className={cn(spinnerVariants({ size, variant }))}>
          <span className="sr-only">{label || "Loading..."}</span>
        </div>
      </div>
    );
  }
);
LoadingSpinner.displayName = "LoadingSpinner";

// Inline spinner for buttons and small spaces
export function InlineSpinner({ 
  size = "sm", 
  className 
}: { 
  size?: "sm" | "default";
  className?: string;
}) {
  return (
    <div className={cn(spinnerVariants({ size }), className)}>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

// Full page loading overlay
export function LoadingOverlay({ 
  message = "Loading...",
  className 
}: { 
  message?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm",
      className
    )}>
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Loading state for cards
export function CardLoadingState({ 
  title,
  description,
  className 
}: { 
  title?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-8 text-center",
      className
    )}>
      <LoadingSpinner size="lg" className="mb-4" />
      {title && <h3 className="text-lg font-semibold mb-2">{title}</h3>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

// Pulsing dot indicator
export function PulsingDot({ 
  size = "default",
  variant = "default",
  className 
}: { 
  size?: "sm" | "default" | "lg";
  variant?: "default" | "success" | "warning" | "destructive";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-2 w-2",
    default: "h-3 w-3",
    lg: "h-4 w-4"
  };

  const variantClasses = {
    default: "bg-primary",
    success: "bg-green-600",
    warning: "bg-amber-600", 
    destructive: "bg-destructive"
  };

  return (
    <div className={cn(
      "rounded-full animate-pulse",
      sizeClasses[size],
      variantClasses[variant],
      className
    )}>
      <span className="sr-only">Loading</span>
    </div>
  );
}

// Progress bar with animation
export function LoadingProgress({ 
  progress,
  className,
  showPercentage = false
}: { 
  progress?: number;
  className?: string;
  showPercentage?: boolean;
}) {
  const [animatedProgress, setAnimatedProgress] = React.useState(0);

  React.useEffect(() => {
    if (progress !== undefined) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress]);

  return (
    <div className={cn("space-y-2", className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out"
          style={{ 
            width: progress !== undefined ? `${animatedProgress}%` : '0%',
            transform: progress === undefined ? 'translateX(-100%)' : 'none',
            animation: progress === undefined ? 'loading-shimmer 2s infinite' : 'none'
          }}
        />
      </div>
      {showPercentage && progress !== undefined && (
        <p className="text-xs text-muted-foreground text-center">
          {Math.round(animatedProgress)}%
        </p>
      )}
    </div>
  );
}

export { LoadingSpinner, spinnerVariants };