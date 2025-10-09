import * as React from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/lib/utils/responsive';

const ResponsiveCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    padding?: 'none' | 'sm' | 'md' | 'lg';
  }
>(({ className, padding = 'md', ...props }, ref) => {
  const isMobile = useIsMobile();

  const paddingClasses = {
    none: '',
    sm: isMobile ? 'p-3' : 'p-4',
    md: isMobile ? 'p-4' : 'p-6',
    lg: isMobile ? 'p-6' : 'p-8',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'bg-card text-card-foreground rounded-lg border shadow-sm',
        paddingClasses[padding],
        className
      )}
      {...props}
    />
  );
});
ResponsiveCard.displayName = 'ResponsiveCard';

const ResponsiveCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: 'sm' | 'md' | 'lg';
  }
>(({ className, spacing = 'md', ...props }, ref) => {
  const isMobile = useIsMobile();

  const spacingClasses = {
    sm: isMobile ? 'space-y-1' : 'space-y-1.5',
    md: isMobile ? 'space-y-1.5' : 'space-y-2',
    lg: isMobile ? 'space-y-2' : 'space-y-3',
  };

  return (
    <div
      ref={ref}
      className={cn('flex flex-col', spacingClasses[spacing], className)}
      {...props}
    />
  );
});
ResponsiveCardHeader.displayName = 'ResponsiveCardHeader';

const ResponsiveCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    size?: 'sm' | 'md' | 'lg';
  }
>(({ className, size = 'md', ...props }, ref) => {
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: isMobile ? 'text-base' : 'text-lg',
    md: isMobile ? 'text-lg' : 'text-xl',
    lg: isMobile ? 'text-xl' : 'text-2xl',
  };

  return (
    <h3
      ref={ref}
      className={cn(
        'leading-none font-semibold tracking-tight',
        sizeClasses[size],
        className
      )}
      {...props}
    />
  );
});
ResponsiveCardTitle.displayName = 'ResponsiveCardTitle';

const ResponsiveCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();

  return (
    <p
      ref={ref}
      className={cn(
        'text-muted-foreground',
        isMobile ? 'text-sm' : 'text-sm',
        className
      )}
      {...props}
    />
  );
});
ResponsiveCardDescription.displayName = 'ResponsiveCardDescription';

const ResponsiveCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    spacing?: 'sm' | 'md' | 'lg';
  }
>(({ className, spacing = 'md', ...props }, ref) => {
  const isMobile = useIsMobile();

  const spacingClasses = {
    sm: isMobile ? 'space-y-2' : 'space-y-3',
    md: isMobile ? 'space-y-3' : 'space-y-4',
    lg: isMobile ? 'space-y-4' : 'space-y-6',
  };

  return (
    <div
      ref={ref}
      className={cn(spacingClasses[spacing], className)}
      {...props}
    />
  );
});
ResponsiveCardContent.displayName = 'ResponsiveCardContent';

const ResponsiveCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
ResponsiveCardFooter.displayName = 'ResponsiveCardFooter';

export {
  ResponsiveCard,
  ResponsiveCardHeader,
  ResponsiveCardFooter,
  ResponsiveCardTitle,
  ResponsiveCardDescription,
  ResponsiveCardContent,
};
